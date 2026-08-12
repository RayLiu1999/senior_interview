# 限量資源容量與一致性設計：秒殺、分散式鎖與購票流程

- **Assessment ID**: `assessment.system-design.limited-resource-capacity.v1`
- **主要 Concept ID**: `concept.system-design.flash-sale.capacity-protection`
- **次要 Concept IDs**:
  - `concept.system-design.distributed-lock.correctness`
  - `concept.system-design.ticket-booking.oversell-prevention`
- **對應文章**:
  - [如何設計秒殺系統](../../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_flash_sale_system.md)
  - [如何設計分散式鎖](../../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_distributed_lock.md)
  - [如何設計購票系統](../../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_ticket_booking_system.md)
- **題型**: `容量設計`, `故障診斷`, `一致性取捨`, `系統設計`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 35 分鐘
- **標籤**: `Flash Sale`, `Ticket Booking`, `Distributed Lock`, `Overselling`, `Backpressure`, `Payment`
- **Learning Objective IDs**:
  - `concept.system-design.flash-sale.capacity-protection/LO-1`
  - `concept.system-design.flash-sale.capacity-protection/LO-2`
  - `concept.system-design.flash-sale.capacity-protection/LO-3`
  - `concept.system-design.distributed-lock.correctness/LO-1`
  - `concept.system-design.distributed-lock.correctness/LO-2`
  - `concept.system-design.distributed-lock.correctness/LO-3`
  - `concept.system-design.ticket-booking.oversell-prevention/LO-1`
  - `concept.system-design.ticket-booking.oversell-prevention/LO-2`
  - `concept.system-design.ticket-booking.oversell-prevention/LO-3`

## 測驗目標

- 能以容量預算、排隊與 backpressure 把瞬時流量轉成可控的處理速率，並避免把 queue 當成無限緩衝。
- 能為限量庫存／座位設計不超賣的 reservation、冪等狀態機與過期釋放流程。
- 能判斷分散式鎖的租約、持有者、fencing 與網路分區邊界，避免舊持有者在鎖過期後繼續寫入。
- 能把付款、出票、通知與對帳拆成明確的 authoritative source、可重試結果與補償步驟。

## 問題情境與限制條件

某售票平台即將開賣 1,000 張熱門活動票券。平時流量約 2,000 req/s，開賣前 10 秒可能有 200,000 req/s；平台有 20 個 API instance、8 個 queue consumer 與一個共享 Redis cluster。資料庫可穩定處理 3,000 writes/s，支付供應商最多接受 500 authorize req/s，且支付請求可能在供應商已接受後 timeout。

目前實作如下：

- 商品頁每秒從快取讀取剩餘數量；checkout 服務讀到數量大於 0 後，再以 `GET`／`SET` 更新 Redis，沒有原子扣減或版本條件。
- API 直接把所有請求寫入 queue，queue 沒有最大等待時間；consumer 取得訊息後先呼叫支付，再寫入訂單與座位資料。每一層都各自重試三次。
- 部分 client 使用相同 `order_id` 重送，但另一部分 timeout 後會建立新的 order ID。座位 hold 有 5 分鐘 TTL，釋放 job 可能重複執行或晚到。
- 分散式鎖以 Redis key 加 TTL 實作；client pause 30 秒後 lease 已過期，另一個 client 已取得鎖，但舊 client 恢復後仍可寫入座位狀態。下游沒有檢查 fencing token。
- 付款成功後可能因本地 DB timeout 而回傳失敗；付款 timeout 也可能是 provider 已接受但回應遺失。客服希望看到明確的 `PENDING`、`PAID`、`EXPIRED` 或 `RECONCILIATION_REQUIRED`，不能用 last-write-wins 靜默覆蓋。

你不能無限增加 Redis、資料庫、consumer 或支付配額，也不能以「把 timeout 和 retry 都調大」作為完整答案。

## 作答要求

請以 senior system design interview 的形式回答：

1. **容量分層**：估算入口、queue、consumer、資料庫與支付的有效處理速率；設計 gateway／API／queue／worker 的 admission、限流、backpressure、最大 queue age 與降級行為。
2. **防止超賣**：修正庫存／座位 reservation 的資料模型與原子操作，說明 Redis、資料庫條件更新、分片序列化或其他方案如何保證最多一個有效 hold。
3. **鎖的正確性**：定義 lock key、owner token、lease、renewal 與 fencing token；說明 client pause、GC、網路分區與 release race 時誰可以繼續寫入。
4. **訂單、支付與出票狀態機**：定義至少 `PENDING`、`PAYMENT_UNKNOWN`、`PAID`、`EXPIRED`、`CANCELLED`、`RECONCILIATION_REQUIRED` 的轉移條件與冪等鍵；處理支付成功但本地寫入失敗與支付 timeout。
5. **重試與過期釋放**：拆分 client、API、worker、provider 四層重試責任，避免 retry storm；說明 hold expiry、late release、重複事件與 DLQ／repair command 的處理。
6. **驗證與取捨**：列出至少八項指標或故障注入測試，證明尖峰、Redis failover、lock holder pause、consumer crash、支付 timeout、重複 order、queue 堆積與 DB failover 下不會超賣或靜默遺失。

## 期待證據

- 能用全域容量而非每 instance 各自放行的上限設計 admission，且承認 queue 必須有 bounded capacity、queue age 與拒絕／降級語意。
- 能指出 `GET`／`SET` 不是原子庫存扣減；reservation 必須使用條件更新、原子 script、序列化分片或等價的 authoritative writer。
- 能區分 mutex、lease、owner token 與 fencing token；舊 client 即使重新醒來，也不能憑舊 lease 覆寫新持有者的結果。
- 能以同一個 stable order／payment operation ID 重試未知付款結果，先查詢或對帳，不以新 token 盲目再扣款。
- 能把「付款成功、DB commit 失敗、offset／事件重放」視為可恢復狀態，以 inbox／outbox、unique constraint 或冪等 upsert 吸收重複。
- 能說明商品頁可接受 stale read，但 checkout 的 reservation 與出票必須讀 authoritative state；`PENDING` 是正確性優先時的合法結果。
- 指標應涵蓋 admission reject、queue depth／age、consumer throughput、reservation conflict、oversell invariant、lock fencing rejection、payment unknown、reconciliation backlog 與 provider QPS／timeout。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 方案會在高併發下直接超賣、無限排隊或重複扣款，且沒有正確的鎖／狀態模型。 |
| 1 | 能列出 Redis、queue、lock、retry 等名詞，但沒有容量邊界、原子 reservation、fencing 或支付 unknown 的處理。 |
| 2 | 能提出部分可行的限流與冪等方案，但遺漏至少一個核心面向：queue backpressure、鎖過期、狀態機、補償或可驗證證據。 |
| 3 | 能完成可運作的分層容量設計、authoritative reservation、fencing lock、冪等支付狀態機與對帳流程，並說明主要可用性與延遲代價。 |
| 4 | 除上述內容外，能量化容量 headroom，處理多層重試與 late event 邊界，設計可重放 repair command，並用故障注入與不變量監控證明不超賣與不重複扣款。 |

### 通過標準

總分達 **3/4 分**才通過；容量／backpressure、reservation／locking、payment／state machine 三個核心面向均不得低於 2 分。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

### 1. 先限制進入量，再保護 authoritative write

200,000 req/s 不能直接送到 3,000 writes/s 的資料庫或 500 req/s 的支付供應商。Gateway 先做 IP／tenant／活動維度的 admission；API 對新 reservation 使用全域 token bucket 或 concurrency limit，已完成結果的查詢與新副作用分開計費。Queue 必須有最大深度與最大等待時間，超過後回 `429`、`503` 或明確 `PENDING`，不能無限接收。Consumer 以固定並行度和支付 bulkhead 控制最多 500 req/s 以內的 headroom，並監控 queue age；retry 只由一個責任層執行且使用 bounded exponential backoff。

### 2. Reservation、鎖與狀態機

把 `event_id`／`order_id`／`seat_id` 建成唯一邊界，使用資料庫條件更新（例如只允許 `available -> HELD` 且 version 未變）或按 seat／SKU 分片的單一 writer。Redis 可以作為快速 admission 或短期索引，但不能是唯一的正確性來源。Hold 記錄要有 owner、expires_at、version 與狀態；過期 job 使用條件更新，只有仍持有相同 owner／version 的記錄才能釋放。

分散式鎖至少保存 owner token 與 fencing token。每次成功取得或續租都產生單調遞增 fencing token，下游資料寫入必須拒絕比目前 token 舊的操作。client pause 後即使舊程式恢復，也不能只靠原本的 lease 繼續寫入；release 也必須驗證 owner，避免誤刪新持有者的鎖。若無法提供 fencing，鎖不能被當作唯一的超賣防線。

訂單／支付／出票採明確狀態機：reservation 成功後才能進入待付款；支付成功且本地 ledger 可靠保存後進入 `PAID`，再產生出票命令。provider timeout 進入 `PAYMENT_UNKNOWN`，使用同一 payment operation ID 查詢或對帳；本地 DB commit 失敗則由 inbox／reconciliation 重建狀態，不用新的 payment token 盲目重試。超時或付款失敗只能由仍持有正確 version 的補償命令轉為 `EXPIRED`／`CANCELLED`，否則進 `RECONCILIATION_REQUIRED`。

### 3. 重試與驗證

client 只重送同一 idempotency key；API 負責 claim 與回放，worker 負責有限次的業務重試，provider timeout 先查詢，DLQ 保留原 order、seat、payment ID 與版本。應注入 Redis failover、鎖持有者 pause、同一 seat 的併發請求、consumer crash、DB commit 後 ACK 遺失、支付 timeout／429、queue 滿載與 late expiry event。觀測至少包括 queue depth／age、reservation conflict、有效 hold 數、oversell invariant violation、fencing rejection、payment unknown、provider QPS／timeout、duplicate idempotency hit、reconciliation backlog 與 checkout latency。成功標準是有效 reservation 不超過票券數、同一 payment operation 不產生兩次請款，且所有未知狀態都能在期限內收斂或進人工佇列。

</details>

## 常見失分點

- 用快取商品數量或 `GET`／`SET` 作為最後扣庫存依據。
- 只說「加分散式鎖」，卻沒有 owner token、lease、fencing 或下游拒絕舊操作的機制。
- 把 queue 當成無限容量，沒有 queue age、拒絕、背壓與 consumer throughput 上限。
- 支付 timeout 後用新 order／payment ID 重試，沒有先查詢 provider 的 unknown outcome。
- 只設 TTL，沒有用 owner／version 條件保護晚到的釋放事件。
- 以 HTTP 成功或 cache 顯示狀態宣稱已出票，沒有區分 authoritative reservation、payment ledger 與最終一致通知。

## 延伸追問

1. 如果同一活動的座位分布在多個 shard，如何避免跨 shard 的訂單同時取得兩個座位後只支付一張？
2. 若 provider 的查詢 API 也逾時，你會如何設計 unknown 的最大存活時間與人工對帳？
3. 若 Redis 與資料庫的故障窗口重疊，哪些流量可以繼續服務，哪些請求必須快速拒絕？
4. 若產品要求提高成功率而允許 oversell 0.01%，你會如何說明這個需求與業務不變量、補償成本及監管風險的衝突？
