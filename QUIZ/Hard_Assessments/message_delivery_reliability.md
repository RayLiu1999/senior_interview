# Kafka 訂單事件可靠性診斷：Broker 故障、重試、Rebalance 與多 Partition

- **Assessment ID**: `assessment.messaging.kafka.message-delivery-reliability.v1`
- **主要 Concept ID**: `concept.messaging.kafka.message-reliability`
- **Secondary Concept IDs**:
  - `concept.messaging.kafka.consumer-idempotence`
  - `concept.messaging.kafka.message-ordering`
- **對應文章**:
  - [Kafka 如何保證訊息可靠性](../../02_Backend_Development/Message_Queues/Kafka/kafka_message_reliability.md)
  - [Kafka 的冪等性和事務](../../02_Backend_Development/Message_Queues/Kafka/kafka_idempotence_transactions.md)
  - [Kafka 訊息順序性保證](../../02_Backend_Development/Message_Queues/Kafka/kafka_message_ordering.md)
- **題型**: `追蹤`, `故障診斷`, `情境／權衡取捨`, `系統設計`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 25 分鐘
- **標籤**: `Kafka`, `Message Reliability`, `ISR`, `Idempotence`, `Transactions`, `Consumer Retry`, `Rebalance`, `Ordering`
- **Learning Objective IDs**: `LO-REL-1`, `LO-REL-2`, `LO-REL-3`, `LO-IDEM-1`, `LO-IDEM-2`, `LO-IDEM-3`, `LO-ORDER-1`, `LO-ORDER-2`, `LO-ORDER-3`

## 測驗目標

- **LO-REL-1**：能從 broker 故障與 producer retry 的時間線，區分訊息遺失、重複與「ACK 不確定」造成的風險，並以 offset、ISR、HW、leader epoch 等證據驗證判斷。
- **LO-REL-2**：能設計 producer、broker 與 consumer 的可靠性邊界，正確比較 `acks=all`、ISR、`min.insync.replicas`、副本因子與 consumer offset 提交時機。
- **LO-REL-3**：能在不丟失、可用性、吞吐量、延遲與重試成本之間提出可運作的方案，並說明故障時的退化行為。
- **LO-IDEM-1**：能區分 producer 冪等性、consumer 冪等處理與 Kafka transaction 各自消除的重複來源。
- **LO-IDEM-2**：能判斷何時只需 idempotent producer，何時需要跨 topic／partition transaction，以及 `read_committed` 的作用。
- **LO-IDEM-3**：能明確說出 Kafka Exactly-Once 的適用邊界，尤其是它不能自動涵蓋外部資料庫或第三方 API 的 side effect。
- **LO-ORDER-1**：能區分單一 partition 內順序、跨 partition 順序與全域順序，並定位 broker、consumer concurrency 與業務路由各自的責任。
- **LO-ORDER-2**：能使用穩定的業務 partition key 保證同一訂單的事件路由一致，並處理 partition 擴容、retry topic 與 consumer retry 對順序的影響。
- **LO-ORDER-3**：能在訂單順序、吞吐量、並行度與故障恢復速度之間做出可驗證的取捨。

## 題目情境與限制條件

你負責一個訂單事件管線。`order-events` topic 有 3 個 partition（P0、P1、P2），replication factor 為 3；事件會被 `order-projector` consumer group 消費並寫入訂單投影資料庫。業務要求：已被服務接受的訂單事件不可靜默遺失；同一 `order_id` 的狀態不能倒退；在可接受的重試下，整體仍要維持多 partition 的吞吐量。

目前配置與實作如下：

- Broker：`min.insync.replicas=2`、`unclean.leader.election.enable=false`。事故前 P0-P2 的 ISR 都是 3 個副本。
- Producer：`acks=1`、`enable.idempotence=false`、`retries=5`、`max.in.flight.requests.per.connection=5`。沒有使用 `transactional.id`。
- Partition key：建立訂單的程式使用 `order_id`；付款事件的另一條程式路徑誤用 `customer_id`，因此同一訂單的事件可能落在不同 partition。
- Consumer：`enable.auto.commit=true`、`isolation.level=read_uncommitted`。每次 `poll()` 後把記錄交給非同步 worker；worker 失敗時在應用程式內重試，成功後才寫入資料庫，但目前沒有以 `event_id` 做唯一去重。
- `max.poll.interval.ms=30s`。某批資料的 retry 超過 30 秒後，consumer 被 group coordinator 移出並觸發 rebalance。

事故時間線（offset 是各 partition 的 local offset）：

| 時間 | 觀察到的事件 |
| :--- | :--- |
| `t0` | `OrderCreated(o-17)` 已寫在 P0 offset 80。Producer 傳送 `PaymentCaptured(o-17, event_id=e-91)` 到 P2；P2 leader B1 寫入本地 log 後以 `acks=1` 回覆，但回覆抵達前 B1 故障，client 看到 timeout／connection reset。 |
| `t1` | Producer 不知道原請求究竟「未寫入」還是「已寫入但 ACK 遺失」，於是重試 e-91。故障前的寫入若已存在，重試可能在 P2 形成兩筆相同業務事件。 |
| `t2` | C1 `poll()` 取得 P2 offsets 41、42、43 並交給三個 worker。offset 41 的資料庫寫入完成後 C1 崩潰；另一批次中，worker 43 比 worker 42 早完成。由於 auto commit 與非同步處理沒有以「每個 partition 的最高連續完成 offset」協調，可能同時出現重放與跳過未完成事件。 |
| `t3` | offset 42 的 retry 使 C1 超過 `max.poll.interval.ms`，P2 被重新分配給 C2。C2 從最近一次 committed offset 繼續；同時，處理 P0 的 consumer 可能先看到或先套用 `OrderCreated` 以外的 P2 付款狀態。監控出現 duplicate `event_id`、訂單狀態倒退、consumer lag 增加與 rebalance 次數上升。 |

你不能假設可以無限增加 partition、無限延長 retry，或把所有資料庫操作包進 Kafka transaction；必須說明方案的容量、可用性、延遲與操作成本。若需要外部資料庫的一致性，必須明確指出 Kafka 與資料庫之間沒有天然的跨系統原子提交。

## 作答要求

請以事故檢討與修復設計的形式回答，不要只列出配置名稱。請依序完成：

1. **追蹤故障**：對上述時間線分別指出可能的遺失、重複與亂序來源，區分 producer、broker、consumer offset／retry、rebalance、業務處理與 partition routing 的責任邊界；列出至少四項你會查的 log、metric 或 Kafka metadata。
2. **比較 broker／producer 方案**：比較 `acks=1` 與 `acks=all` 在 ISR 收縮時的行為，說明 `min.insync.replicas=2` 是寫入門檻而不是「所有副本都確認」，並交代 unclean leader election 關閉時可用性如何受影響。提出訂單事件的 producer／broker 目標配置，包含 retries、`enable.idempotence` 與 `max.in.flight` 的取捨。
3. **設計 consumer 的提交與重試**：說明為什麼不能在尚未完成 side effect 前提交 offset；設計 rebalance 前後的處理、retry、backoff、DLQ／retry topic 或 pause／seek 策略，並保證每個 partition 只提交最高的「連續完成」offset。方案必須能承受至少一次重放，而不是假設 consumer 只會收到一次。
4. **處理同一訂單的順序**：說明 `order_id`、`customer_id`、無 key 各自造成的路由差異；提出維持多 partition 吞吐量時的 key、consumer worker 與 partition 擴容策略。如果跨 partition 的訂單事件無法保證順序，請設計 sequence number、狀態機檢查或暫存等待的防線。
5. **說明 Exactly-Once 邊界與代價**：比較 idempotent producer、Kafka transaction、`isolation.level=read_committed` 與資料庫 inbox／unique constraint 的責任；明確回答 Kafka EOS 能涵蓋哪些操作、不能涵蓋哪些操作，以及它帶來的 coordinator、marker、延遲、吞吐量、timeout 與複雜度成本。
6. **驗證修復**：列出至少五個可觀測指標或故障注入情境，證明修復後在 broker failover、ACK 遺失、consumer crash、retry 超時、rebalance 與多 partition 並行處理下沒有靜默遺失，且重複與亂序都能被偵測或安全吸收。

## 期待證據

- 能以「ACK 可能遺失但寫入已成功」的 ambiguity 解釋 producer retry 為何會造成重複；不能把 `acks=1` 說成 quorum durability。
- 能準確說明 `acks=all` 等待的是當下 ISR，`min.insync.replicas` 保護的是可接受的 ISR 數量；ISR 不足時寧可拒絕寫入，也不應默默降級成單副本。
- 能把 producer retry 造成的 duplicate、consumer 在 side effect 與 commit 之間崩潰造成的 replay、auto commit 過早造成的 loss 分開分析。
- 能指出 rebalance 不會替已完成的外部 side effect 回滾；提交策略必須以 partition 內最高連續完成 offset 為準，非任意 worker 的最大完成 offset。
- 能使用穩定的 `order_id` 作為 partition key，並說明同一 partition 才有 Kafka 原生順序；跨 partition 或 consumer 非同步 worker 必須另加排序／狀態機防線。
- 能區分 idempotent producer 的 `(PID, partition, sequence)` 去重範圍、consumer business idempotency 與 transaction 的跨 partition 原子性。
- 能指出 Kafka read-process-write transaction 可以原子提交 Kafka output 與 consumed offsets，但不能與外部資料庫、付款 API 或 email 發送形成天然的跨系統 exactly-once。
- 能說明 `read_committed` 會隱藏 aborted transaction records，但不會消除資料庫 side effect 的重複；也能說出 transaction 與 `acks=all`、ISR、retry 的效能和可用性代價。
- 能提出可驗證的觀測證據，例如 producer error／retry、ISR shrink、under-replicated partition、leader epoch、consumer assignment／generation、committed offset、duplicate event ID、sequence gap、lag 與 rebalance count。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 無法建立 Kafka durability、offset 或 partition ordering 的正確模型；核心修復與事故情境矛盾。 |
| 1 | 能背出 `acks`、transaction、rebalance 或 key 的部分定義，但無法把它們套到時間線，或把 Kafka EOS 當成所有外部 side effect 的 exactly-once。 |
| 2 | 能辨識主要遺失／重複／亂序現象並提出部分可行配置，但遺漏 ISR 與 `min.insync.replicas` 的關係、連續 offset 提交、重試順序或外部資料庫邊界中的至少一項。 |
| 3 | 能完整追蹤主要故障來源，提出 `acks=all`、ISR 門檻、idempotent producer、處理後提交 offset、可重放 consumer、穩定 key 與 per-partition／per-key 排序方案，並說明主要代價。 |
| 4 | 除上述內容外，能用 broker／consumer／資料庫證據驗證因果，處理 rebalance 與 retry topic 的邊界，提出 Kafka-to-Kafka transaction 與外部 DB inbox／outbox 的分工，並量化或明確說明可用性、吞吐量、延遲、容量與故障退化。 |

### 通過標準

總分達 **3/4 分**才通過；此外，broker durability、consumer offset／retry、partition ordering、Exactly-Once 邊界四個核心面向均不得低於 2 分。若任一核心面向為 0，即使總結構分數達 3，也視為未通過。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

### 1. 故障來源與證據

- **可能遺失**：`acks=1` 只代表 leader 本地確認。B1 在 follower 複製前故障時，新的 clean leader 可能沒有 e-91；`unclean.leader.election=false` 會避免選落後副本，但代價是 partition 可能暫時不可寫／不可讀，不能把可用性誤當成可靠性。另一條遺失路徑是 auto commit 在 worker 完成 side effect 前已提交 next offset，C1 崩潰後 C2 不會重讀未完成事件。worker 43 先完成並提交 44，也可能跳過尚未完成的 42。
- **可能重複**：producer 在 ACK 遺失時無法區分「未寫入」與「已寫入」，沒有 idempotence 時 retry 可能追加第二筆 e-91。consumer 若先完成資料庫寫入、後於 commit 前崩潰，rebalance 後 C2 會從舊 committed offset 重放同一事件；這是 at-least-once 的正常結果，必須由 event ID 去重或讓 side effect 冪等。
- **可能亂序**：`OrderCreated` 使用 `order_id` 而付款事件使用 `customer_id`，同一訂單被分到不同 partition，Kafka 不提供兩者間的順序。即使它們在同一 partition，三個非同步 worker 也可能先套用較新的事件；跨 partition consumer 同時處理時更沒有全域順序。
- **應查證據**：producer callback 的 request timeout／retry／error 與 PID、sequence；每個 partition 的 leader epoch、ISR 變化、HW、under-replicated partition 與 broker failover log；consumer group 的 generation、assignment、rebalance reason、poll interval、committed offset 與實際處理 offset；資料庫的 event ID、order version／sequence、唯一約束衝突與 side-effect audit log。

### 2. Producer 與 broker 的目標方案

| 面向 | 建議方案 | 取捨與邊界 |
| :--- | :--- | :--- |
| Producer ACK | 訂單事件使用 `acks=all`；搭配重試與可觀測的 delivery timeout。 | `acks=all` 等待當下 ISR，不是等待 replication factor 的每一個副本；延遲較高，ISR 不足時會拒絕寫入並降低可用性。 |
| ISR／副本 | RF=3、`min.insync.replicas=2`、維持 `unclean.leader.election=false`，並監控 ISR shrink 與 under-replicated partition。 | 一個副本故障時仍可寫；只有 leader 留下時拒絕 `acks=all` 寫入。clean election 保護資料，但可能使 partition 暫停服務。 |
| Producer 重試 | 開啟 `enable.idempotence=true`，保留有界的 retry／delivery timeout；`max.in.flight` 可在冪等 producer 下取 5 以換吞吐量，若客戶端或版本無法保證冪等，應降為 1 以降低 retry 亂序風險。 | 冪等去重主要涵蓋同一 producer session 的 PID、partition、sequence；不能取代 consumer side-effect idempotency，也不能處理不同 producer 或外部 DB 的重複。 |
| Unclean election | 保持關閉。 | 允許 stale replica 當 leader 雖可恢復可用性，卻可能截斷已 ACK 的資料；訂單事件不應用資料遺失換取這種可用性。 |

`acks=1` 的優點是較低延遲、較高可用性，但 leader 在 follower 複製前故障時可能丟失；`acks=all` 加 `min.insync.replicas=2` 則把故障轉化為明確的寫入錯誤，要求 producer retry、告警或人工處理，而不是讓資料悄悄消失。`min.insync.replicas` 是 broker 接受 `acks=all` 寫入的最低 ISR 數，不表示每次都要等 RF=3 的全部副本，也不能代替跨區域／跨機架的副本配置與監控。

### 3. Consumer offset、retry 與 rebalance

1. 關閉 `enable.auto.commit`，只有在該 partition 的 side effect 成功且已被可重試地記錄後，才提交下一個 offset。若 offsets 41 與 43 完成但 42 尚未完成，最多只能提交 42（下一個待處理位置），不能提交 44。
2. 在同一 partition 維持明確的 in-flight 狀態；收到 `onPartitionsRevoked` 時停止接收新工作、等待或取消尚未完成的工作，只有確認連續完成範圍後才提交。新 owner C2 仍要能重放最後一段資料，故資料庫寫入必須以 `event_id` unique constraint、inbox table 或天然冪等 upsert 吸收 duplicate。
3. 對暫時性錯誤使用 bounded exponential backoff。若要保留同一訂單順序，不能讓 42 長時間卡住時無限制地讓 43、44 套用；可暫停該 partition、按 key 序列化、把失敗事件送到有明確順序語意的 retry topic，或將同一 key 的後續事件暫存。retry topic 與原 topic 分離後必須重新設計 partition key、回送順序與重試上限。
4. Poison message 不可被靜默丟棄；超過重試上限要進 DLQ 並保留 event ID、原 partition、offset、錯誤與 schema 版本，讓營運流程能修復後重放。`max.poll.interval.ms` 應依最大處理批次與 retry 時間調整，或讓 poll loop 與 per-key worker 解耦，但不能因為持續 poll 就提前 commit 未完成工作。

### 4. Partition key 與順序

將所有訂單生命週期事件以穩定的 `order_id` 作 key，讓同一訂單落在同一 partition；同一 consumer group 中同一 partition 同時只有一個 owner。consumer 可以對不同 key 平行處理，但對同一 key 必須使用 per-key queue／single-flight 或在資料庫以單調遞增的 `order_version` 做條件更新。

這不會提供所有訂單之間的全域順序；若業務真的要求全域順序，需要單一 partition 或額外的全域 sequencer，代價是吞吐量、並行度與故障恢復能力下降。增加 partition 後，`hash(order_id) % numPartitions` 可能讓新事件與歷史事件路由不同；應使用新 topic／雙寫與切換、版本化 partitioner、停寫遷移或其他明確的 migration plan，不能直接宣稱原 key 永遠保序。

### 5. Exactly-Once 的邊界與代價

- **Idempotent producer**：利用 broker 對 producer PID、partition 與 sequence number 的判斷，消除同一 producer session 因 retry 導致的重複 append。它不會讓資料庫 update、付款呼叫或 consumer 重放自動只執行一次。
- **Kafka transaction**：若流程是「從 Kafka 讀取、處理、再寫回 Kafka」，應為每個 logical producer instance 使用穩定且唯一的 `transactional.id`，把 output records 與 consumed offsets 放進同一 transaction；下游使用 `read_committed` 才只看已提交結果。跨多 topic／partition 時需要 transaction coordinator、transaction marker、timeout、fencing 與更複雜的 recovery；`read_committed` 也可能因未完成 transaction 的 LSO 而增加可見延遲。
- **外部資料庫**：Kafka transaction 與資料庫 transaction 不是同一個原子資源。應採用 consumer at-least-once + inbox／processed-event table、資料庫 unique constraint、冪等 upsert，或由資料庫 outbox 可靠地產生後續 Kafka 事件。這是「重複可安全吸收」而非宣稱所有外部副作用的數學 exactly-once。
- **整體代價**：`acks=all` 增加複製等待，min ISR 會以暫時不可用換取 durability；producer idempotence 有狀態與重試管理成本；transaction 增加 coordinator round trips、marker、儲存與恢復複雜度，可能降低吞吐量並延長 transaction timeout；單 partition 或嚴格 per-key 序列化則限制並行度。應只在需要跨 Kafka 寫入原子性時使用 transaction，其餘情境以冪等資料模型與可重放流程降低成本。

</details>

## 常見失分點

- 把 `acks=all` 說成「所有 replication factor 副本都一定確認」，或忽略它只對當下 ISR 生效。
- 以 `acks=1`、retry 或 producer idempotence 宣稱訂單已經 durable、consumer 也不會重複。
- 只說「手動 commit」卻沒有指定 side effect 之後提交，或沒有處理同一 partition 的最高連續 offset。
- 把 rebalance 當成訊息遺失的直接原因，沒有區分 rebalance 造成的重放與 auto commit／處理狀態造成的真正跳過。
- 看到同一訂單亂序就只調整 consumer；忽略 `order_id` 與 `customer_id` key 不一致、跨 partition 沒有全域順序的根因。
- 讓同一 partition 的 retry 事件繞過失敗事件繼續套用，卻沒有說明訂單狀態如何防止倒退。
- 宣稱 Kafka transaction 能與外部資料庫或付款 API 一起提供 exactly-once，沒有提出 inbox、unique constraint、outbox 或補償流程。
- 只列配置，不提出 ISR、leader epoch、committed offset、event ID、lag 或 rebalance metric 等可驗證證據。

## 延伸追問

1. 若訂單投影資料庫必須在同一個 transaction 中更新庫存與訂單狀態，你會如何設計 inbox／unique constraint，並處理資料庫 commit 成功但 Kafka offset commit 失敗？
2. 若 retry topic 使用相同 partition 數但不同 producer，如何保證同一 `order_id` 回送到原本的順序序列？哪些情況應暫停原 partition 而不是繞送 retry topic？
3. 若業務要求「同一訂單最多 2 秒內完成」，但某個 event 的外部 API 會卡 60 秒，你會如何在 `max.poll.interval.ms`、per-key ordering、DLQ 與可用性之間取捨？
4. 若要把 topic 從 3 個 partition 擴到 12 個，你會如何驗證歷史與新事件的路由連續性，並避免同一訂單在切換期間被兩個 worker 同時處理？
5. 若團隊要求使用 Kafka Streams EOS，你會如何測量 transaction abort rate、commit latency、consumer lag、協調器負載與資料庫去重命中率，判斷它是否值得其成本？
