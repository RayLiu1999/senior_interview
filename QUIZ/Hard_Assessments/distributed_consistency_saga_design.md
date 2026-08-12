# 跨服務訂單一致性與 Saga 設計：在分區與部分失敗下維持可接受正確性

- **Assessment ID**: `assessment.distributed-systems.order-consistency-saga.v1`
- **主要 Concept ID**: `concept.distributed-systems.consistency.models`
- **次要 Concept IDs**: `concept.distributed-systems.cap.tradeoffs`, `concept.microservices.saga.transactions`
- **對應文章**:
  - [一致性模型](../../03_System_Design_and_Architecture/Distributed_Systems_Theory/consistency_models.md)
  - [CAP 定理與 PACELC 理論](../../03_System_Design_and_Architecture/Distributed_Systems_Theory/cap_theorem_and_pacelc.md)
  - [分散式交易與 Saga 模式](../../03_System_Design_and_Architecture/Micro_Service/distributed_transactions_and_saga_pattern.md)
- **題型**: `情境／取捨`, `故障追蹤`, `系統設計`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 35 分鐘
- **標籤**: `Consistency`, `CAP`, `PACELC`, `Saga`, `Idempotency`, `Reconciliation`, `Observability`
- **Learning Objective IDs**: `LO-1`, `LO-2`, `LO-3`, `LO-4`, `LO-5`, `LO-6`

## 測驗目標

- **LO-1**：把「不可超賣、不可重複扣款、不得誤報成功」等業務不變量轉成一致性、可用性與分區期間的明確服務契約，並說明 CAP/PACELC 的取捨。
- **LO-2**：依不同讀寫操作選擇線性一致性、因果／用戶端一致性、bounded-staleness 或最終一致性，明確指出讀哪個副本、何時可以回覆成功，以及如何處理版本落後。
- **LO-3**：從網路分區、複製延遲、訊息重複／亂序與逾時的時間線，追蹤訂單、庫存與付款狀態，找出 stale read、重複預留、重複扣款與 ambiguous outcome。
- **LO-4**：設計可恢復的 Saga（本地交易、outbox/inbox、冪等命令與狀態機），並區分付款授權、請款、void/refund 與其他不可逆副作用的補償邊界。
- **LO-5**：定義安全的重試、去重、逾時與隔離策略；能在外部付款結果未知時避免盲目重送，並以對帳流程處理跨服務與跨區域的殘留狀態。
- **LO-6**：提出能驗證「可接受一致性」的對帳證據、追蹤欄位、指標、SLO 與告警，而不是只宣稱系統具備 exactly-once 或最終一致性。

## 問題詳述

你負責一個雙區域電商結帳流程。請設計一個在網路分區、跨區複製延遲、訊息重複／亂序、服務部分失敗與客戶重試下仍能維持業務正確性的方案。答案不能只背 CAP 或 Saga 定義，必須把一致性語意、狀態轉移、故障處理與可觀測證據連在一起。

## 題目情境與限制條件

### 系統現況

- `Order Service`、`Inventory Service`、`Payment Service` 各自擁有資料庫，不能使用跨服務 ACID 交易或 2PC。每個區域都有可寫入的本地 primary，跨區複製是非同步的；正常情況 p95 複製延遲約 2 秒，p99 可能達 30 秒。
- 結帳由 Saga 協調器驅動；命令透過 at-least-once 訊息傳遞，訊息可能重複、延遲或亂序。每個服務的本地交易可以可靠地寫入自己的資料庫，但服務回覆與 outbox 發布可能在不同時間失敗。
- 用戶端會因為 HTTP timeout 重送相同的 `Idempotency-Key`，也可能因故障轉移而把重試送到另一個區域。讀請求不保證命中 primary，可能讀到落後副本。
- 付款供應商支援以 `payment_operation_id` 去重，並提供查詢授權／請款狀態的 API；授權可 void，已請款通常只能非同步 refund。付款 API 可能在已接受請求後才讓呼叫端 timeout。
- 商品頁的庫存顯示可以是最多 30 秒舊的近似值；結帳時的庫存預留不可使用這個顯示副本作為最後判斷。

### 業務不變量與服務目標

1. 限量 SKU 的可售數量為 1 時，最多只能有一筆有效預留；寧可暫時拒絕或顯示 `PENDING`，也不能接受超賣。
2. 同一筆訂單不可產生兩筆付款請款；付款請求逾時不代表付款失敗，也不代表可以安全重送。
3. 訂單只有在庫存預留與付款已由各自 authoritative source 確認後，才能進入 `CONFIRMED`；未知狀態必須留在 `PENDING`、`PAYMENT_UNKNOWN` 或 `RECONCILIATION_REQUIRED`。
4. 健康且沒有分區時，已接受的結帳請求 p99 目標為 400 ms；此目標不授權系統在分區時犧牲前述不變量。設計可以選擇在分區時降低可用性，但必須說明使用者看到的結果。
5. 付款、庫存與訂單的稽核資料必須能在 5 分鐘內被偵測並進入自動修復或人工處理佇列；不得用 last-write-wins 靜默覆蓋金流或庫存衝突。

### 故障時間線

假設 SKU `SKU-7` 在區域 A 與 B 的讀副本都顯示庫存為 1，且跨區複製落後。以下事件在同一個分區視窗內發生：

1. 客戶以 `Idempotency-Key: K-42` 發起結帳。請求先到區域 A；A 建立訂單 `O-771` 為 `PENDING`，並在本地交易中記錄 Saga 與 outbox。
2. A 的庫存服務成功預留 `SKU-7`，但 `InventoryReserved` 事件尚未抵達 B。協調器接著以 `payment_operation_id: O-771` 呼叫付款供應商。
3. 付款供應商已接受授權，但 A 在收到回覆前發生網路 timeout；A 只能知道結果是未知，不能直接判定成功或失敗。
4. 客戶再次送出 `K-42`，流量因故障轉移到 B。B 的副本看不到 A 的 idempotency record 與庫存預留，若照目前實作可能建立 `O-884`、再次預留同一 SKU，並再次呼叫付款。
5. 分區恢復後，延遲的複製與重複／亂序事件陸續抵達；客服可能從不同副本讀到 `PENDING`、`CONFIRMED` 或 `CANCELLED`，而付款供應商與本地付款帳本的狀態也可能暫時不同。

## 作答要求

請在 35 分鐘內回答以下 A-D。可以用表格、狀態機或文字時序圖；不要求寫程式碼，但每個關鍵決策都要指出保證、失敗時的結果與代價。

### A. 一致性契約與 CAP/PACELC 取捨

1. 列出至少三個不可破壞的業務不變量，並分別判斷訂單建立、庫存預留、付款授權／請款、商品頁庫存顯示與訂單狀態查詢在分區期間應偏向 CP 還是 AP。
2. 說明這不是簡單的「系統選 CAP 的兩個字母」：指出哪些操作必須犧牲可用性以保護一致性，哪些讀取可以接受舊資料，以及分區恢復後如何收斂。
3. 在沒有分區的正常路徑，用 PACELC 說明哪些地方選 EC 以等待 authoritative write／quorum，哪些地方選 EL 以降低延遲；說明 400 ms 目標與一致性保證的關係。

### B. Read／write 語意與副本路由

請完成一張至少包含下列操作的契約表：`POST /checkout`、`ReserveInventory`、`AuthorizeOrCapturePayment`、`GET /orders/{id}`、`GET /stock/{sku}`。每列必須寫明：

- 寫入成功的定義與 acknowledgement 時點；
- 可接受的 read 語意（例如 linearizable、read-your-writes、monotonic read、bounded staleness 或 eventual consistency）；
- 讀 primary、leader、帶版本條件的副本，或拒絕／等待的理由；
- timeout、replica lag 或版本落後時，客戶與呼叫端看見的狀態。

### C. Saga 狀態追蹤與不可逆副作用

1. 以故障時間線追蹤 `O-771`、`O-884` 與 `K-42`。指出現行設計在哪些地方會產生重複預留、重複付款、stale read 或無法判定的結果。
2. 選擇 choreography 或 orchestration，畫出從建立訂單、預留庫存、付款授權／請款到確認訂單的正向步驟與反向補償步驟。每一步需說明本地交易、事件／命令、狀態轉移與冪等鍵。
3. 明確處理「付款供應商已接受但回覆 timeout」以及「已請款後庫存失敗」：說明何時查詢、何時 void、何時 refund、何時只能標記 `RECONCILIATION_REQUIRED` 或人工介入。不可把跨服務 rollback 當成補償答案。

### D. 重試、冪等、對帳與觀測

1. 定義 client request、Saga command、inventory reservation 與 payment operation 的穩定識別碼與唯一性邊界；說明同一 `Idempotency-Key` 被送到 B 時，如何避免 B 在沒有 A 之最新資料時另開一筆業務流程。
2. 列出至少三種錯誤結果（明確失敗、可安全重試、結果未知），為每一種指定 retry／backoff／去重／查詢策略；特別說明 payment timeout 為何不能盲目重送。
3. 設計分區恢復後的 reconciliation job：比對哪些 authoritative records，如何產生安全的 repair command，如何處理晚到事件、重複事件與補償失敗。
4. 列出至少六個能證明設計有效的指標或 trace 欄位，並為其中至少三個說明告警條件或 SLO，例如 replica lag、saga age、unknown payment、compensation failure、duplicate idempotency hit、oversell invariant violation、outbox lag 與對帳差異。

## 期待證據

- 用業務不變量而不是抽象口號定義「可接受一致性」，並明確承認分區期間不可能同時保證跨區強一致寫入與完整可用性。
- 把庫存預留與付款請款的 authoritative write 和商品頁／客服查詢的 stale read 分開；能說明 read-your-writes、monotonic read 或版本門檻何時必要。
- 依時間線指出複製延遲、訊息 at-least-once、HTTP retry 與外部 API ambiguous outcome 如何組合成錯誤，而不是只說「網路不可靠」。
- 具體給出單一 writer、home region、全域一致 idempotency registry、fencing／epoch 或等價機制，並說明其可用性與延遲代價。
- Saga 每個步驟都有本地交易與可重放命令；outbox/inbox 或等價 durable log 能解釋資料更新與事件發布之間的故障窗口。
- 區分 authorization、capture、void、refund 與不可逆的物流／通知副作用；對未知付款結果先查詢，不以重試名稱掩蓋重複扣款風險。
- 明確使用 `PENDING`、`PAYMENT_UNKNOWN`、`COMPENSATING`、`RECONCILIATION_REQUIRED` 等安全狀態，避免把 timeout 當成失敗或成功。
- 對帳能以 `saga_id`、`order_id`、reservation／payment operation id 與版本／epoch 對齊資料，並以冪等 repair command 修復，不直接靜默改資料庫。
- 指標同時涵蓋正確性、延遲、可用性、複製／訊息健康與人工待處理量，且能說明如何用 trace 追查單筆訂單。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 無法建立正確的分散式狀態模型，或主張在分區中同時接受雙區寫入、保證無超賣／無重複扣款且完全可用，與題目限制矛盾。 |
| 1 | 能背出 CAP、最終一致性或 Saga 定義，但沒有依時間線處理副本落後、付款 timeout、讀寫語意與補償邊界。 |
| 2 | 主要架構方向大致正確，例如提出 Saga 與冪等鍵，但缺少至少一個核心面向：CP／AP 取捨、read／write 契約、不可逆付款、未知結果、對帳或可觀測性。 |
| 3 | 能完整分析主要故障，為關鍵寫入選擇合理的一致性契約，設計可重試且冪等的 Saga／補償流程，並提出對帳與指標；同時說明可用性、延遲與運營成本。 |
| 4 | 除了 3 分要求，還能以版本／epoch、單一 writer 或等價 fencing 處理跨區競爭，精確區分各種讀語意與 acknowledgement，覆蓋晚到事件與補償失敗的邊界，並以可驗證的 SLO、trace 與故障注入證據支撐方案。 |

### 通過標準

**預設 3/4 通過。** 由於本題是系統設計與生產故障診斷題，總分達 3 分之外，以下三個核心面向不得低於 2 分：

1. CAP／PACELC 與 read／write 語意的取捨；
2. Saga 狀態機、冪等性與付款不可逆副作用的補償；
3. 重試、對帳與可觀測性證據。

總分 4 分代表邊界條件與修復運營都能被驗證，不代表系統在所有故障下都保持同步或完全可用。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

### 1. 先定義不變量，再選擇每個邊界的保證

- 庫存的「最多一筆有效 reservation」與付款的「每筆訂單最多一筆 capture」是硬不變量；訂單不得在沒有兩者 authoritative evidence 時進入 `CONFIRMED`。這些不變量不能交給落後副本或最後寫入者解決。
- `Inventory Reserve` 應採 CP 取向：對每個 SKU 或庫存分片使用單一 home-region writer、共識 leader、同步 quorum 或帶 epoch 的 fencing。若 home writer 在分區不可達，回覆 `RETRYABLE`／`PENDING`，不在另一區域另開可售庫存寫入。這是用 checkout 可用性換取不超賣。
- 付款的本地 operation ledger 與外部 payment operation 也要以唯一 operation id 和 provider 的 authoritative query 保護；不以本地副本的 `FAILED` 覆蓋供應商可能已成功的結果。請款前必須有庫存預留，付款結果未知時停在 `PAYMENT_UNKNOWN`。
- 訂單建立可以先在 home region 以本地 durable write + outbox 接受，回覆 `202 ACCEPTED`／`PENDING`；若無法確認 `K-42` 的 home region 或全域 idempotency record，寧可拒絕或要求回原區域重試，也不能讓 B 建立另一個可付款的訂單。訂單讀取可暫時 AP，但不能把 stale `PENDING` 或 `CONFIRMED` 當成結算依據。
- 商品頁的庫存顯示可使用 bounded-staleness 或 eventual read，標示為估計值；真正的 reservation 必須讀 authoritative writer 並以條件更新／版本檢查完成。
- 正常運作時，庫存與付款的 authoritative local write 可採 EC，等待本地 quorum 或 durable outbox 才 acknowledgement；跨區複製與非關鍵展示讀取可採 EL。這就是 PACELC 的 E 部分：以少量延遲換取不可變量，並把可接受的 stale read 限定在明確邊界。400 ms 目標不能合理化雙區域同時接受限量庫存寫入。

### 2. Read／write 契約範例

| 操作 | 寫入／讀取保證 | 路由與 timeout 行為 |
| :--- | :--- | :--- |
| `POST /checkout` | 以 `(tenant, idempotency_key)` 唯一建立 saga；成功 acknowledgement 只代表請求與 outbox 已 durable，不代表已付款。回覆 `PENDING`／`ACCEPTED`。 | 由 gateway 依 customer／key 路由到 home region；若 home 不可達，不能在 B 另建。重送同一 key 回傳同一 `order_id` 與目前狀態。 |
| `ReserveInventory` | 以 `(sku, reservation_id)` 冪等；只有 authoritative writer 以 `available >= quantity` 與版本／epoch 條件提交才算成功。 | 寫入 timeout 是 `UNKNOWN`，先查 reservation status；不能在另一區域用 stale stock 再 reserve。成功後才發布 `InventoryReserved`。 |
| `AuthorizeOrCapturePayment` | 授權／請款各有固定 `payment_operation_id`；provider 回覆成功才可標記成功，timeout 保留 `PAYMENT_UNKNOWN`。 | 重試先查 provider status；已授權可一次 void，已 capture 用 refund，不能以新 operation id 盲目再 charge。 |
| `GET /orders/{id}` | 至少保證使用者的 read-your-writes 與 monotonic read；客服或結算讀取需 linearizable／primary 或帶 `min_version`。 | replica version 低於 session token 時等待、轉 primary 或回 `STALE_REPLICA`，不要回報較舊的終態。 |
| `GET /stock/{sku}` | 允許 bounded-staleness／eventual，因為是展示數字，不是扣庫存依據。 | 可讀副本並回傳 `as_of_version`／時間；超過 30 秒標記 stale 或不顯示精確數字。 |

這個表把「一致性」放到操作契約，而不是給整個系統一個籠統標籤。`CONFIRMED` 是一個需要跨服務證據的業務狀態；它不會因為某個落後副本讀到該字串就自動成立。

### 3. Saga 與故障時間線

建議使用可持久化的 orchestration Saga，因為訂單、庫存與付款存在清楚的順序、補償與人工處理分支；服務之間仍以命令／事件解耦，協調器的狀態本身要有 durable store、版本與 outbox。

1. `K-42` 先在 home region 的 Order Service 以唯一鍵建立 `O-771` 與 `Saga-771`。同一個本地交易寫入訂單狀態、idempotency record、command ledger 與 outbox；若事件發布失敗，relay 可重送。
2. `ReserveInventory(O-771, R-771)` 在庫存 authoritative writer 以唯一 reservation id 執行。重複命令只回傳原結果；成功轉 `INVENTORY_RESERVED`，失敗轉 `INVENTORY_REJECTED`，結果未知則轉 `INVENTORY_UNKNOWN` 並查詢，不在 B 重新扣減。
3. 只有收到 durable `INVENTORY_RESERVED` 後才呼叫 `Authorize(PaymentOp-771)`。供應商已接受但回覆 timeout 時，Payment Service 記錄 `PAYMENT_UNKNOWN`，以同一 operation id 查詢；在查詢結束前不可再授權，也不可直接把付款標為 failed。
4. 若授權成功而業務採「授權後請款」，才用同一 payment context 進入 capture；若庫存後續失敗，未請款的授權可 void。若已 capture，補償是 refund，且 refund 也有獨立冪等 operation、非同步狀態與可能失敗的處理，不是資料庫 rollback。
5. 當所有 authoritative evidence 到齊才把 `O-771` 轉 `CONFIRMED`。任一步失敗則依反向順序進入 `COMPENSATING`：停止後續步驟、release reservation、void／refund、最後將訂單設為 `CANCELLED`；補償未完成則保持 `COMPENSATION_PENDING` 或 `RECONCILIATION_REQUIRED`。
6. B 收到 `K-42` 時，如果無法查到 A 的全域 idempotency record，正確方案是依 deterministic home routing 轉送、等待全域一致 registry，或回 `RETRYABLE`，不是建立 `O-884`。若現行缺陷已讓 `O-884` 產生，恢復後要以 key／customer／cart fingerprint 與 payment operation 對帳，保留一筆 canonical order，對重複 reservation 執行冪等 release，對付款依 provider 查詢後只做必要的 void／refund。
7. 分區恢復後不能用 LWW 把 A 與 B 的庫存數字合併。以 reservation ledger、payment provider status、Saga version／epoch 與 outbox offset 重建；晚到的舊事件若版本低於已完成補償，就被視為 stale 並記錄，而不是重新打開訂單。

### 4. 重試、冪等與對帳

- `idempotency_key` 對應 canonical `order_id`；內部命令使用 `saga_id + step_id + attempt-independent command_id`，庫存使用 `reservation_id`，付款使用固定的 authorization／capture operation id。唯一約束必須位於能被所有可能入口看見的 home writer 或全域一致 registry，單區 local cache 不足以防 B 重建流程。
- 明確失敗（例如庫存 authoritative writer 回覆 insufficient stock）可以記錄終態並不重試該步；可安全重試（例如 relay publish timeout、冪等查詢 timeout）使用 exponential backoff、jitter、attempt 上限與 DLQ；結果未知（付款 mutation timeout、reservation write timeout）先查詢同一 operation id，不能改用新 id 盲目重送。
- 每個 participant 的 inbox 以 command id 去重並記錄結果；outbox relay 可以至少一次發布，消費者必須能重放。狀態機要拒絕非法逆轉，例如 `CANCELLED` 不接受晚到的 `PAYMENT_AUTHORIZED` 直接轉 `CONFIRMED`，而是觸發 void／refund 或對帳。
- reconciliation job 以 `saga_id`、`order_id`、reservation id、payment operation id、版本／epoch 與事件 offset 對齊 Order DB、Inventory ledger、Payment ledger、provider API 與 outbox／broker。它找出「有付款無訂單」、「有預留無訂單」、「訂單已取消但仍有 capture」、「雙區 reservation」等不變量違反，產生冪等 repair command 或人工佇列；不直接以 SQL 覆寫帳本。

### 5. 可觀測性與驗證

每筆 trace 應攜帶 `trace_id`、`saga_id`、`order_id`、`idempotency_key_hash`、`command_id`、`reservation_id`、`payment_operation_id`、region、replica／data version 與 retry attempt。至少監控以下指標：

- `replica_lag_seconds`、讀取版本落後／被拒絕次數與跨區訊息延遲；
- outbox 未發布數、consumer redelivery、DLQ 深度與 command age；
- Saga 端到端延遲、各狀態數量與 `saga_age_seconds`；
- `PAYMENT_UNKNOWN`、provider query latency、capture／refund／void 失敗率；
- duplicate idempotency hit、重複 reservation、inventory conflict 與 oversell invariant violation；
- compensation success／failure、`RECONCILIATION_REQUIRED` 數量與人工待處理年齡；
- 對帳差異數及從偵測到修復的時間。

告警不能只看 HTTP 5xx：例如 payment unknown 超過基線或持續 5 分鐘、outbox／replica lag 超過允許窗口、任何 oversell invariant violation 立即告警；`saga_age` 與 reconciliation queue age 則應有 SLO，確保暫時的最終一致性真的會收斂。

</details>

## 常見失分點

- 把 CAP 說成任意選兩個，或宣稱「我們選 CA」就能消除網路分區。
- 讓兩個區域在分區時都以 stale stock 副本執行限量庫存扣減，事後只靠 last-write-wins 或加總數字修復超賣。
- 只為 HTTP request 加 idempotency key，卻沒有為 Saga command、reservation 與 payment operation 建立跨重試的唯一性。
- 把 payment timeout 當成失敗而重送新 charge，或把它當成成功而直接確認訂單；忽略 provider query 與 ambiguous outcome。
- 把 Saga compensation 描述成跨資料庫 rollback，沒有區分授權 void、已請款 refund 與物流／通知等不可逆副作用。
- 用最終一致性當萬用答案，沒有說明哪些讀可 stale、哪些寫必須由 authoritative source 確認，以及使用者收到的狀態。
- 沒有 `PENDING`、`PAYMENT_UNKNOWN`、`COMPENSATING` 或 `RECONCILIATION_REQUIRED` 等安全狀態，讓 timeout 直接落入錯誤終態。
- 只提出重試與 dead-letter queue，沒有退避、去重、狀態機 guard、晚到事件處理與 repair command。
- 對帳只比對目前表格數字，沒有 payment provider、reservation ledger、outbox、版本／epoch 與事件順序的證據。
- 只列 CPU、QPS 或 HTTP latency，沒有 oversell、duplicate charge、replica lag、saga age、補償失敗與對帳差異等正確性指標。

## 延伸追問

1. 如果付款供應商不支援 idempotency key，也沒有可靠的 status query，你會如何重新切分付款邊界？哪些情況必須轉人工審核，為什麼不能承諾自動 exactly-once charge？
2. 產品經理要求「分區期間結帳 API 99.99% 可用」。你會要求他在不超賣、不重複扣款與可用性之間選哪個明確放寬？若採預先分配區域庫存，新的 invariant 與對帳成本是什麼？
3. 補償完成後才抵達舊的 `PaymentAuthorized` 或 `InventoryReserved` 事件，如何用狀態版本、epoch、事件時間與 idempotent handler 防止已取消訂單被重新打開？
4. 若付款授權成功但使用者在 capture 前取消訂單，取消與 capture 同時競爭時，你會在哪個服務建立條件轉移，如何證明不會同時 capture 與 void？
5. 什麼情況下 choreography 比 orchestration 更合適？在本題的付款未知、補償與人工介入需求下，事件流的可追蹤性要如何補足？
6. 你會如何用 fault injection、延遲／重排訊息、重複 callback 與跨區恢復演練驗證上述不變量，而不只做 happy-path integration test？
