# 訊息佇列可靠性事故：分區、確認、重試與即時通知的邊界

- **Assessment ID**: `assessment.messaging.message-queue.reliability-incident.v1`
- **主要 Concept ID**: `concept.messaging.kafka.consumer-offset`
- **Secondary Concept IDs**:
  - `concept.messaging.kafka.partitioning-strategy`
  - `concept.messaging.kafka.performance-tuning`
  - `concept.messaging.kafka.producer-delivery`
  - `concept.messaging.kafka.replication-isr`
  - `concept.messaging.kafka.fundamentals`
  - `concept.messaging.nats.core-jetstream-durability`
  - `concept.messaging.nats.queue-groups-load-balancing`
  - `concept.messaging.nats.platform-selection`
  - `concept.messaging.nats.core-architecture`
  - `concept.messaging.rabbitmq.kafka-selection`
  - `concept.messaging.rabbitmq.core-architecture`
  - `concept.messaging.redis.pubsub-delivery-tradeoffs`
- **對應文章**:
  - [Kafka Consumer 和 Consumer Group 工作原理](../../02_Backend_Development/Message_Queues/Kafka/kafka_consumer.md)
  - [Kafka 的分區策略和負載均衡](../../02_Backend_Development/Message_Queues/Kafka/kafka_partitioning_strategy.md)
  - [Kafka 的效能優化策略](../../02_Backend_Development/Message_Queues/Kafka/kafka_performance_optimization.md)
  - [Kafka Producer 的工作原理和配置](../../02_Backend_Development/Message_Queues/Kafka/kafka_producer.md)
  - [Kafka 的副本機制和 ISR](../../02_Backend_Development/Message_Queues/Kafka/kafka_replication_isr.md)
  - [什麼是 Kafka？](../../02_Backend_Development/Message_Queues/Kafka/what_is_kafka.md)
  - [NATS 的 Core NATS 和 JetStream 有什麼區別？](../../02_Backend_Development/Message_Queues/NATS/core_nats_vs_jetstream.md)
  - [NATS Queue Groups 負載平衡](../../02_Backend_Development/Message_Queues/NATS/load_balancing_with_queue_groups.md)
  - [NATS、Kafka 與 RabbitMQ 比較](../../02_Backend_Development/Message_Queues/NATS/nats_vs_kafka_vs_rabbitmq.md)
  - [什麼是 NATS？](../../02_Backend_Development/Message_Queues/NATS/what_is_nats.md)
  - [RabbitMQ vs. Kafka](../../02_Backend_Development/Message_Queues/RabbitMQ/rabbitmq_vs_kafka.md)
  - [什麼是 RabbitMQ？](../../02_Backend_Development/Message_Queues/RabbitMQ/what_is_rabbitmq.md)
  - [Redis Pub/Sub vs. 傳統 MQ](../../02_Backend_Development/Message_Queues/Redis/redis_pubsub_vs_traditional_mq.md)
- **題型**: `故障診斷`, `追蹤`, `系統設計`, `情境／權衡取捨`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 45 分鐘
- **標籤**: `Kafka`, `RabbitMQ`, `NATS`, `JetStream`, `Redis Pub/Sub`, `Partition`, `Consumer Group`, `Offset`, `ACK`, `Retry`, `DLQ`, `ISR`, `Ordering`, `Capacity`
- **Learning Objective IDs**:
  - Kafka：`concept.messaging.kafka.consumer-offset/LO-1`, `concept.messaging.kafka.consumer-offset/LO-2`, `concept.messaging.kafka.consumer-offset/LO-3`, `concept.messaging.kafka.partitioning-strategy/LO-1`, `concept.messaging.kafka.partitioning-strategy/LO-2`, `concept.messaging.kafka.partitioning-strategy/LO-3`, `concept.messaging.kafka.performance-tuning/LO-1`, `concept.messaging.kafka.performance-tuning/LO-2`, `concept.messaging.kafka.performance-tuning/LO-3`, `concept.messaging.kafka.producer-delivery/LO-1`, `concept.messaging.kafka.producer-delivery/LO-2`, `concept.messaging.kafka.producer-delivery/LO-3`, `concept.messaging.kafka.replication-isr/LO-1`, `concept.messaging.kafka.replication-isr/LO-2`, `concept.messaging.kafka.replication-isr/LO-3`, `concept.messaging.kafka.fundamentals/LO-1`, `concept.messaging.kafka.fundamentals/LO-2`, `concept.messaging.kafka.fundamentals/LO-3`
  - NATS：`concept.messaging.nats.core-jetstream-durability/LO-1`, `concept.messaging.nats.core-jetstream-durability/LO-2`, `concept.messaging.nats.core-jetstream-durability/LO-3`, `concept.messaging.nats.queue-groups-load-balancing/LO-1`, `concept.messaging.nats.queue-groups-load-balancing/LO-2`, `concept.messaging.nats.queue-groups-load-balancing/LO-3`, `concept.messaging.nats.platform-selection/LO-1`, `concept.messaging.nats.platform-selection/LO-2`, `concept.messaging.nats.platform-selection/LO-3`, `concept.messaging.nats.core-architecture/LO-1`, `concept.messaging.nats.core-architecture/LO-2`, `concept.messaging.nats.core-architecture/LO-3`
  - RabbitMQ／Redis：`concept.messaging.rabbitmq.kafka-selection/LO-1`, `concept.messaging.rabbitmq.kafka-selection/LO-2`, `concept.messaging.rabbitmq.kafka-selection/LO-3`, `concept.messaging.rabbitmq.core-architecture/LO-1`, `concept.messaging.rabbitmq.core-architecture/LO-2`, `concept.messaging.rabbitmq.core-architecture/LO-3`, `concept.messaging.redis.pubsub-delivery-tradeoffs/LO-1`, `concept.messaging.redis.pubsub-delivery-tradeoffs/LO-2`, `concept.messaging.redis.pubsub-delivery-tradeoffs/LO-3`

## 測驗目標

- 從一條事件跨越 Kafka、RabbitMQ、NATS 和 Redis 的實際路徑，區分遺失、重複、亂序、延遲與背壓的責任邊界。
- 能將 Partition／Consumer Group／Offset、Producer ACK／Retry、Replication／ISR、RabbitMQ ACK／DLQ、JetStream durability 與 Redis Pub/Sub 的取捨放在同一個故障模型中。
- 能提出可分階段上線、可觀測、可回滾的修復方案，而不是只列出產品設定名稱。

## 問題情境與限制條件

你負責一個電商結帳平台。平台原本以 Kafka 保存 `order-events`，RabbitMQ 處理付款任務，NATS 傳遞服務間的即時狀態，Redis Pub/Sub 將通知推送給 WebSocket gateway。流量增加並進行平台整合後，監控在同一小時出現以下現象：

- `order-projector` 的 P99 從 180ms 上升到 5 秒，consumer lag 和 rebalance 次數同步上升。
- 同一 `event_id` 在訂單投影資料庫出現兩次；少數訂單顯示 `Paid` 後又回到 `Created`。
- Kafka P1 曾發生 Leader 故障，ISR 從 3 降到 1；Producer 只看到 timeout，沒有明確的成功或失敗結論。
- RabbitMQ 的 `payment.tasks` Queue 突然堆積。失敗訊息在 retry queue 和 DLQ 之間循環，部分訊息沒有留下可追蹤的失敗原因。
- 庫存服務使用 Core NATS 的 `inventory.changed` Subject；服務重啟期間遺失通知。另一條路徑使用 JetStream，但 ack wait 太短，慢消費者收到大量重送。
- Redis Pub/Sub 的 WebSocket 客戶端離線後沒有收到通知；發布端的記憶體與網路流量在尖峰時接近上限。

目前配置如下：

### Kafka

- `order-events` 有 6 個 Partition，replication factor 為 3，`min.insync.replicas=2`，`unclean.leader.election.enable=false`。
- Producer 使用 `acks=1`、`enable.idempotence=false`、`retries=5`、`max.in.flight.requests.per.connection=5`。
- 建立訂單事件使用 `order_id` 作為 key；付款事件的另一條程式路徑使用 `customer_id`，重試 Topic 則沒有 key。
- Consumer 開啟 `enable.auto.commit=true`。`poll()` 後把事件交給非同步 worker；worker 成功寫資料庫後才算完成，但 offset 由 poll loop 定期提交。
- `max.poll.interval.ms=30s`。單筆資料庫重試有時超過 45 秒；服務擴容時同一 Group 會頻繁 Rebalance。

### RabbitMQ

- `payment.tasks` Queue 宣告為 durable，但部分訊息沒有 persistent flag；Consumer 使用 `autoAck=true`、prefetch 1000。
- Producer 沒有統一使用 Publisher Confirm。暫時性錯誤用 `nack(requeue=true)`，永久性錯誤也走同一條路徑。
- retry queue 以 TTL 轉送到原 Queue；DLX 沒有保留原始 routing key、錯誤類型和重試次數的完整 metadata。

### NATS 與 Redis

- 即時庫存更新使用 Core NATS，要求低於 20ms 的延遲，但業務人員又期待離線服務恢復後可以補收所有事件。
- JetStream Stream 使用 file storage、replicas=3；Consumer 的 ack wait 為 5 秒，慢查詢可能超過 8 秒。多個 worker 使用同一 Queue Group。
- WebSocket gateway 使用 Redis Pub/Sub 做通知廣播。離線客戶端可以在重新連線時呼叫訂單 API，但目前沒有版本號或 last-seen cursor。

限制條件：不能無限增加 Kafka Partition、無限延長 retry 或 ack timeout；支付 side effect 不能重複扣款；庫存狀態必須可偵測倒退；只能以可驗證的指標和小流量故障注入證明修復有效。

## 作答要求

請以事故檢討和分階段修復設計回答：

1. **畫出責任邊界**：追蹤訂單事件從 Producer 到資料庫，再到 RabbitMQ 付款、NATS 庫存和 Redis 通知的路徑。分別指出至少兩個遺失、兩個重複、兩個亂序或延遲來源。
2. **Kafka 可靠性**：比較 `acks=1` 與 `acks=all` 在 ISR 收縮時的行為，解釋 `min.insync.replicas=2`、RF=3、clean election、Leader epoch、HW/LEO 的關係。提出 Producer 和 Broker 的目標方案，以及吞吐量和可用性的代價。
3. **Partition 與 Consumer Group**：決定訂單和付款事件應使用什麼 key，說明為什麼 `customer_id`、無 key、retry Topic 無 key 會破壞順序。設計每個 Partition 的有效並行度、hot key 處理、擴 Partition 或遷移的方案。
4. **Offset、ACK、Retry 與 DLQ**：說明 Kafka offset 為何不能在 side effect 前提交；設計以最高連續完成 offset 為準的提交、Rebalance 前後處理、bounded retry、retry Topic、RabbitMQ `ack/nack/reject`、DLX 與 poison message 流程。方案必須能安全吸收 at-least-once 重放。
5. **NATS durability 與負載平衡**：比較 Core NATS、Queue Group 和 JetStream durable Consumer 的交付語義。調整 ack wait、max ack pending、replication、retention 和 worker 並行度時，要說明遺失、重送、延遲和容量代價。
6. **Redis Pub/Sub 取捨**：判斷哪些通知可接受 at-most-once；若離線通知必須可恢復，設計版本／cursor API 回補或改用 Redis Streams／Kafka／RabbitMQ 的遷移邊界。說明慢訂閱者和發布尖峰的容量保護。
7. **選型與驗證**：提出至少三階段修復、回滾條件、至少八項 metrics／logs／traces，以及至少五個故障注入或負載測試，證明沒有靜默遺失、重複可辨識或安全吸收、順序倒退可偵測。

## 期待證據

- 能指出 Kafka `acks=1` 只代表 Leader 回覆，ACK 遺失時可能是「已寫入但 client 不知道」；不能把它說成 quorum durability。
- 能說明 `acks=all` 等待的是當下 ISR，`min.insync.replicas` 是可接受的 ISR 下限；ISR 不足時拒絕寫入是以可用性換資料安全。
- 能區分 Producer retry 造成的 duplicate、Consumer 在 side effect 與 offset commit 之間崩潰造成的 replay，以及 auto commit 過早造成的跳過／遺失。
- 能以穩定 `order_id` 維持同一訂單在同一 Partition，並指出跨 Partition、retry Topic 無 key 或非同步 worker 都不能自動保證全域順序。
- 能提出每個 Partition 只提交最高連續完成 offset 的策略，並以 event ID、inbox／unique constraint 或天然冪等更新吸收重放。
- 能將 RabbitMQ publisher confirm、durable message、manual ack、prefetch、requeue、retry queue、DLX 和 poison message 分工，避免 `autoAck` 或無限 requeue。
- 能準確區分 Core NATS 的 at-most-once 與 JetStream 的持久化／ack／重送；不能把 Queue Group 的負載平衡誤說成 durable queue。
- 能指出 JetStream ack wait 太短會造成合法重送，延長 ack wait 又會增加 in-flight 記憶體和故障恢復延遲，必須與處理時間分布和 max ack pending 一起設計。
- 能指出 Redis Pub/Sub 不保存歷史、沒有 consumer ack 或 DLQ；離線補收必須依賴 API／cursor 或改用持久化模型。
- 能使用 producer retry／timeout、ISR shrink、under-replicated partition、leader epoch、consumer generation／assignment、committed offset、lag、duplicate event ID、RabbitMQ queue depth／redelivery、NATS ack pending／redelivered 與 Redis publish latency／client count 等證據驗證因果。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 無法建立訊息傳遞、持久化、offset 或 ordering 模型；修復方案與事故現象矛盾，或把所有產品都宣稱 exactly-once。 |
| 1 | 能背出部分 Kafka、RabbitMQ、NATS 或 Redis 名詞，但沒有把配置套入時間線，忽略至少一次重放、ISR 或離線遺失。 |
| 2 | 能辨識主要遺失／重複／堆積問題並提出部分可行設定，但遺漏連續 offset、retry／DLQ 終止條件、JetStream durability 或 Pub/Sub 容量邊界中的至少一項。 |
| 3 | 能完整追蹤事故，提出 Kafka `acks=all`／ISR 門檻、穩定 key、處理後提交、RabbitMQ manual ack／DLX、JetStream durable consumer、Redis 回補或替代方案，並說明主要代價。 |
| 4 | 除上述內容外，能以跨系統證據驗證因果，設計分階段 rollout、冪等 side effect、重試與順序防線，量化或清楚說明 throughput、P99、容量、RPO/RTO、故障退化和回滾條件。 |

### 通過標準

採四個核心面向各 0–4 分評分：**Kafka Partition／Consumer／Offset**、**ACK／Retry／DLQ**、**Replication／Durability／Ordering**、**NATS／Redis 選型與容量**。總體平均達 **3/4 分**才通過，且四個核心面向均不得低於 2 分；任何面向為 0 即使平均達 3 也不通過。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

### 1. 故障來源與責任邊界

- **Kafka Producer 遺失／重複**：`acks=1` 在 Leader 尚未複製到足夠 ISR 前就回覆；若回覆遺失，Producer 無法區分「未寫入」和「已寫入但 ACK 遺失」，沒有 idempotence 的 retry 可能追加 duplicate。ISR 從 3 降到 1 時，`acks=all` 應拒絕新寫入，而 `acks=1` 仍可能接受低 durability 寫入。
- **Kafka Consumer 遺失／重放**：auto commit 只代表 poll 取得，不代表資料庫 side effect 完成；worker 崩潰會使 committed offset 超前而跳過資料。反過來，資料庫 commit 成功後 consumer 在 offset commit 前崩潰，重平衡後會 replay 同一 event。這是 at-least-once 的正常結果，需以 event ID 去重或讓更新本身冪等。
- **Kafka 亂序**：建立事件使用 `order_id`、付款事件使用 `customer_id`，同一訂單可能落在不同 Partition；retry Topic 無 key 又可能將後續事件送到任意 Partition。即使同一 Partition，非同步 worker 也可能先完成較新的 offset，不能因此提交最高 offset。
- **RabbitMQ 遺失／重複**：`autoAck=true` 在 side effect 前就移除訊息；沒有 Publisher Confirm 不能證明 Broker 已接收。`nack(requeue=true)` 對永久錯誤形成熱循環，TTL retry 與 DLX 沒有次數和錯誤 metadata 則難以終止和追蹤。Consumer crash 在 manual ack 前會重送，必須讓 payment side effect 冪等。
- **NATS／Redis 遺失**：Core NATS 和 Redis Pub/Sub 都不替離線訂閱者保留歷史；這不是 consumer lag，而是產品語義本身。JetStream 未及時 ack 則合法重送；ack wait 過短會造成重複和堆積，但不應以關閉 ack 來掩蓋問題。

### 2. Kafka Producer、Partition 與副本方案

| 面向 | 建議 | 取捨 |
| :--- | :--- | :--- |
| Producer ACK | 關鍵訂單事件使用 `acks=all`、有界 retries 和 delivery timeout。 | ISR 不足時寫入失敗，短期可用性下降，但避免把低 durability 寫入當成功。 |
| Idempotence | 開啟 `enable.idempotence=true`，保留可觀測 retry；同一 Producer／Partition 的 sequence 可吸收重試 append。 | 不涵蓋不同 Producer session、Consumer side effect 或外部支付 API，仍需業務冪等。 |
| Broker | RF=3、`min.insync.replicas=2`、關閉 unclean election，並監控 ISR 和 under-replicated partition。 | clean election 可能在可用 ISR 不足時暫停寫入；這是用 RPO 保護換 RTO／availability。 |
| Key | 所有同一訂單的事件使用穩定 `order_id`，retry 回送保留同一 key。 | 熱門訂單或少數 key 可能形成 hot Partition，不能用盲目加 Partition 解決。 |

`min.insync.replicas=2` 不是「每次等待 RF=3 的所有副本」，而是 `acks=all` 寫入時至少要有兩個 ISR 可接受。若只剩一個 ISR，可靠寫入應失敗；`unclean.leader.election=false` 避免落後副本成為 Leader 而截斷已確認資料。應查 Producer timeout／retry、ISR history、leader epoch、HW／LEO、under-replicated partitions 和 broker failover log。

### 3. Offset、Retry 和順序

關閉 auto commit，為每個 Partition 保存 in-flight offset 和連續完成指標。若 offset 41 和 43 已完成但 42 仍失敗，最多只能提交 42（下一個待處理位置），不能提交 44。`onPartitionsRevoked` 時停止新工作，等待或取消未完成任務，提交已確認的連續範圍；新 owner 仍要能重放最後一段，所以資料庫要有 event ID unique constraint、inbox table 或條件式版本更新。

暫時性錯誤應使用有限次數和指數退避；要維持同一訂單順序，可暫停該 Partition、對同一 key 序列化，或使用保留相同 key 的 retry Topic。retry Topic 必須記錄原 Partition／offset、attempt、錯誤類型和 next-attempt time，不能讓失敗事件無限繞回原 Topic。永久性錯誤進 DLQ，保留原始 payload、schema、event ID、路由資訊與失敗原因，由人工或修復流程決定是否重放。

RabbitMQ 則使用 Publisher Confirm 證明 Broker 接收，durable exchange／queue 和 persistent message 保護重啟後的訊息；Consumer 用 manual ack，在支付 side effect 成功後才 ack。暫時性錯誤可進有界 retry queue，永久性錯誤用 `reject` 或 `nack(requeue=false)` 送 DLX；prefetch 不應大到讓 in-flight side effect 超出資料庫或支付服務容量。

### 4. NATS 與 Redis 的修復

- Core NATS 適合心跳、最新狀態和可由 API 重建的通知；它沒有離線 replay、consumer ack 或 durable backlog。Queue Group 只在成員間分流，一則訊息不會廣播給同群組的所有成員，也不等於 JetStream durable consumer。
- 關鍵庫存事件應進 JetStream Stream，使用適當 replicas、file storage、retention 和 durable Consumer。ack wait 應依處理時間的高分位數加上故障緩衝設計；max ack pending 要限制未完成工作，避免以無限延長 timeout 換取假性穩定。即使使用 JetStream，consumer 仍要以事件 ID 或版本吸收 redelivery。
- Redis Pub/Sub 可保留給 WebSocket 即時提示，將真實狀態放在可查詢的訂單 API。事件含單調遞增版本或 cursor；客戶端重連時帶 last-seen cursor 回補，若回補量或可靠性要求超過 API 能力，改用 Redis Streams、Kafka 或 RabbitMQ。發布端應限制慢客戶端、監控 client count／publish latency／output buffer，必要時丟棄可重建通知而不阻塞支付或訂單寫入。

### 5. 分階段上線

1. **止血**：停止永久錯誤的無限 requeue，限制 retry／DLQ；對 Kafka 關閉 auto commit、暫時降低 batch／worker concurrency、保留 `order_id` key；支付寫入加 event ID 或 payment request ID 唯一約束。先保護資料正確性，接受短期 lag。
2. **建立可靠邊界**：切換 Kafka producer 到 `acks=all` 和 idempotence，驗證 RF／ISR；補上 RabbitMQ publisher confirm、manual ack、DLX metadata；將庫存關鍵事件導入 JetStream durable Consumer；Redis 加 cursor API 或明確標示為可遺失通知。
3. **容量與效能**：在固定 workload 下調整 batch、compression、fetch、Partition／worker 數、JetStream ack wait／max ack pending 和 RabbitMQ prefetch。每次只改一項，觀察 P99、lag、ISR、queue depth、ack pending、記憶體與資料庫 pool，設定回滾條件。

### 6. 驗證證據與故障注入

至少持續觀察：Producer success／timeout／retry rate、Kafka ISR shrink／under-replicated count、leader epoch／HW／LEO、consumer assignment／generation／rebalance count、committed offset 與處理 offset 差距、lag／duplicate event ID／sequence gap、RabbitMQ ready／unacked／redelivery／DLQ depth、NATS ack pending／redelivered／consumer lag、Redis publish latency／connected clients／output buffer，以及資料庫 idempotency conflict／狀態版本衝突。

驗證情境至少包括：Kafka Leader 在 ACK 前故障、Follower 落後導致 ISR 收縮、Consumer 在資料庫 commit 後但 offset commit 前崩潰、超過 poll interval 的慢 retry、同一訂單跨事件並行處理、RabbitMQ consumer crash 與 poison message、JetStream ack wait 內外的慢處理、Core NATS／Redis 訂閱者離線後恢復，以及尖峰流量下的 hot key／慢訂閱者。成功條件不是「沒有 duplicate」，而是沒有靜默遺失、duplicate 可由 ID 偵測或安全吸收、狀態版本不倒退、DLQ 可追蹤且容量不失控。

</details>

## 常見失分點

- 把 `acks=all` 說成一定等待 replication factor 的所有副本，或把 `acks=1` 說成 quorum durability。
- 只說「改成手動 commit」，卻沒有指定 side effect 後提交、最高連續 offset，以及 Rebalance 後的重放處理。
- 用 `customer_id` 或無 key 的 retry Topic 宣稱同一訂單仍然有序，忽略跨 Partition 和非同步 worker 的邊界。
- 把 RabbitMQ `nack(requeue=true)` 當成通用 retry，沒有 poison message、DLX、上限和錯誤 metadata。
- 把 NATS Queue Group 當成 durable queue，或把 JetStream redelivery 當成資料遺失。
- 認為 Redis Pub/Sub 能讓離線客戶端稍後補收，沒有 API cursor、Streams 或其他持久化替代方案。
- 只列設定，不提供 ISR、lag、queue depth、ack pending、duplicate ID、sequence version 或故障注入證據。
- 為了壓低延遲而無限增加 in-flight、prefetch、ack wait 或 Partition，沒有計算資料庫、支付服務、記憶體與網路容量。

## 延伸追問

1. 若支付 API 已成功但 Kafka offset commit timeout，你如何避免再次扣款，並如何向營運人員證明該事件已完成？
2. 若把 `order-events` 從 6 個 Partition 擴到 24 個，如何處理 hash 路由改變、歷史／新事件交界與切換期間的雙重消費？
3. 若某個訂單的事件需要重試 10 分鐘，但同一 Partition 仍有其他訂單要維持吞吐量，你會選擇 pause、per-key queue、retry Topic 還是拆 Topic？代價是什麼？
4. 若 JetStream 的 ack wait 延長後記憶體和 redelivery 降低但故障恢復變慢，你會如何用處理時間分布、max ack pending 和容量模型決定數值？
5. 若 WebSocket 通知遺失可以接受，但客戶端必須最終看到正確訂單狀態，你會如何設計 cursor、版本號、回補 API 和快取失效策略？
6. 若 RabbitMQ DLQ 也滿了，哪些訊息應停收、哪些應丟棄、哪些應轉到離線儲存？請提出 RPO、容量和人工處理的決策規則。
