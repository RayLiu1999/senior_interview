# 付款／訂單 API 韌性設計：在重試與突發流量下避免重複副作用並保護下游

- **Assessment ID**: `assessment.api.payment-order-resilience.v1`
- **主要 Concept ID**: `concept.api.idempotency.safe-retry`
- **次要 Concept ID**: `concept.api.rate-limiting.degradation`
- **對應文章**:
  - [API 中的冪等性](../../02_Backend_Development/API_Design/idempotency_in_api.md)
  - [API 限流與降級策略](../../02_Backend_Development/API_Design/api_rate_limiting.md)
- **題型**: `情境／取捨`, `實作／系統設計`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 25 分鐘
- **標籤**: `Idempotency`, `Payment`, `Order API`, `Rate Limiting`, `Downstream Protection`, `Reliability`
- **Learning Objective IDs**:
  - `concept.api.idempotency.safe-retry/LO-1`
  - `concept.api.idempotency.safe-retry/LO-2`
  - `concept.api.idempotency.safe-retry/LO-3`
  - `concept.api.rate-limiting.degradation/LO-1`
  - `concept.api.rate-limiting.degradation/LO-2`
  - `concept.api.rate-limiting.degradation/LO-3`

## 測驗目標

- 能區分 HTTP 方法本身的冪等語意、以 `Idempotency-Key` 實現的應用層去重，以及下游支付副作用的安全重試邊界。
- 能設計在多個應用節點同時收到相同請求時仍正確的去重記錄、結果保存、TTL、狀態轉移與故障恢復流程。
- 能依據資料庫與支付供應商容量，選擇分層限流、`429`／`Retry-After`、排隊、熔斷與降級策略，並說明它們對延遲、可用性與公平性的代價。
- 能提出可由壓測、故障注入、支付對帳與服務指標驗證的成功條件，而不是只列出元件名稱。

## 問題情境與限制條件

某電商有 `POST /v1/orders` API。一次請求會建立訂單，並呼叫支付供應商進行授權；付款成功後才可把訂單標為已付款。客戶端在 2 秒內收不到回應時，會使用指數退避加 jitter，最多重試 4 次。實務上仍有部分客戶端在重試時錯誤地產生新的 key，也有客戶端重用同一個 key 卻改變金額或購物車內容。

目前系統條件如下：

- 平時流量約 150 req/s；促銷開始時可能在 3 分鐘內突增至 2,000 req/s，服務有 8 個無狀態應用實例。
- 支付供應商最多接受 300 次授權 req/s、100 個同時進行中的授權；超過配額時回傳 `429` 與 `Retry-After`。網路 timeout 可能發生在供應商已接受授權、但本服務尚未收到回應的時間點，因此結果可能是 unknown。
- 訂單資料庫可穩定承受約 250 writes/s。Redis 可用於低延遲查詢，但可能重啟、淘汰資料或暫時不可用，不能單獨作為付款去重的事實來源。
- 支付供應商支援以 merchant request ID 去重，但只保留 24 小時；服務必須能在相同的邏輯付款意圖下重試，而不能因 HTTP 請求換了一個應用節點就產生新的支付副作用。
- API 原則上要在訂單與付款狀態已可靠保存後才回傳成功。若選擇 `202 Accepted` 的非同步方案，必須同時定義狀態查詢、逾時、補償與客戶端如何取得最終結果；不得建立無上限的等待佇列。
- 目標是避免同一個邏輯訂單重複建立或重複扣款，同時讓查詢與已完成的冪等重播在流量突增時仍可用。不能把所有流量都無條件轉送給支付供應商，也不能要求客戶端停止重試來掩蓋設計問題。

## 作答要求

請提出一個端到端的 API 與容量保護方案，並明確說明以下取捨；不要只重述冪等性或限流的定義。

1. **`Idempotency-Key` 契約**：定義 key 的作用域、必要性、請求 fingerprint、同 key 同內容的重播行為，以及同 key 不同內容時的回應。說明為何 `POST` 的語意仍不是天然冪等，以及客戶端錯誤產生新 key 時服務端還能、不能保證什麼。
2. **結果保存與並發 race**：設計持久化的去重記錄與狀態（至少涵蓋處理中、成功、可重試／失敗、結果未知），說明結果保存位置、TTL 如何相對於客戶端重試期限、供應商 24 小時去重期限與對帳窗口決定。逐步說明兩個應用實例同時搶到同一 key、第一個實例在下游 timeout 或 crash 時，第二個實例應如何處理。
3. **`429` 與 `Retry-After`**：分別定義本服務在 admission limit、下游回壓或熔斷時的回應語意，說明何時回 `429`、何時應使用 `503` 或 `202`，以及如何避免客戶端、gateway、服務端 worker 疊加重試造成 retry storm。重試必須保留哪個 key 與哪個下游 token，也要說明 `Retry-After` 的來源與上限。
4. **分層限流與下游保護**：至少選擇兩種限流演算法或機制，分配到 gateway／應用／支付 worker／資料庫等層級，並說明 IP、tenant、使用者、端點、並發數或成本權重等維度。給出相對於 300 req/s、100 concurrency 與 250 writes/s 的容量 headroom，解釋全域共享狀態、每實例限流、排隊、bulkhead、timeout、circuit breaker 與降級的取捨。
5. **可驗證指標與驗證計畫**：至少列出 6 個指標，且必須覆蓋冪等去重、限流／重試、支付下游與資料庫／業務一致性四類；為至少 3 個指標定義目標或告警條件。另請提出能驗證相同 key 併發、Redis 故障、支付 timeout／429、流量尖峰與 worker crash 的測試或故障注入案例。

## 期待證據

- 明確區分「同一個 key 的請求不重複執行」與「整個分散式流程 exactly-once」；指出 HTTP 層的去重不足以單獨保證支付供應商不重複扣款。
- 使用資料庫 unique constraint、原子 insert／claim 或等價機制處理 race，而不是 `GET` 後再 `SET`，也不是只在單一應用實例使用 mutex。
- 說明保存完整回應或可重建的終態結果、request fingerprint、TTL、處理中租約／owner，以及 Redis 遺失時的事實來源；能處理回應遺失、執行程序 crash 與 unknown outcome。
- 將穩定的下游 merchant request ID、outbox／狀態機或對帳流程連到支付呼叫，說明為何 timeout 後不能以新 token 盲目再扣一次。
- 以全域容量而非「每個實例都配置同一上限」推導限流；能說明 token bucket、leaky bucket、bounded queue 或 concurrency limit 對突發、平滑性、延遲與保護效果的取捨。
- 指出完成的冪等 replay 不應再次消耗昂貴的支付配額，但仍需要邊緣與應用層的讀取／濫用保護；新的副作用請求則必須預留下游與資料庫 headroom。
- `429` 回應包含可執行的 `Retry-After` 與限制資訊，客戶端以相同 key、退避與 jitter 重試；能辨識「客戶配額不足」與「服務或下游已故障」不是同一種錯誤。
- 指標不只停留在 log 數量，而能驗證重複訂單／扣款為零、下游 QPS／並發未越界、限流是否發生在正確層，以及 unknown／對帳 backlog 是否收斂。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 無法建立正確的請求生命週期模型，或方案會在 timeout／重試下直接造成重複訂單、重複扣款或無限轉送流量。 |
| 1 | 能背出 `Idempotency-Key`、Redis、token bucket 或 `429` 等名詞，但沒有處理持久化結果、TTL、並發 race、下游 unknown outcome 或容量邊界。 |
| 2 | 主要方向大致正確，也提出部分去重與限流元件，但至少缺少一個核心故障路徑；沒有把 `Retry-After`、分層容量、降級行為與可驗證指標連起來。 |
| 3 | 能完成可行的端到端設計：以持久化且原子化的 key claim／結果保存避免重複副作用，處理 TTL 與 crash／timeout，使用有 headroom 的分層限流和下游保護，並提出指標與測試驗證主要取捨。 |
| 4 | 除上述內容外，能處理 key fingerprint 衝突、供應商去重期限、Redis 故障、in-flight replay、unknown payment、跨層 retry storm 與非同步補償邊界；能用容量數據、告警門檻與故障注入結果證明方案在尖峰下仍可控。 |

### 通過標準

預設 **3/4 分通過**；若拆分核心面向評分，冪等去重正確性與下游保護兩個面向不得低於 2 分。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

### 1. 先固定請求契約與 key 語意

`POST /v1/orders` 應要求客戶端為一次邏輯建立訂單產生一個高熵 `Idempotency-Key`，key 的作用域至少包含 tenant、操作名稱與資源類型，不能只在某個應用實例的記憶體內判斷。服務應對經過規範化的金額、幣別、購物車、收款帳戶等欄位計算 request fingerprint：

- 同一作用域、同一 key、同一 fingerprint 若已完成，直接回放保存的 HTTP 狀態與 body，且不再建立訂單或呼叫支付供應商；可用 header 標示這是 replay。
- 同一 key 但 fingerprint 不同，應在任何副作用前拒絕，例如回 `409 Conflict` 或明確定義的 `422 Unprocessable Entity`，不能讓後到的請求覆蓋原始意圖。
- 沒有 key 的付款建立請求應拒絕或只允許明確不涉及副作用的操作。若客戶端每次重試都生成新 key，服務端無法從 HTTP 層證明它們是同一個意圖；可用 client order ID／商戶訂單號做第二層唯一性與對帳，但不能用「同一使用者加同一金額」這種會誤合併合法訂單的弱條件。

`POST` 的方法語意仍不是天然冪等；這裡是透過 key、請求 fingerprint 與持久化狀態把一次邏輯操作映射成一個可安全重播的結果，而不是宣稱所有 POST 都變成天然冪等。

### 2. 以持久化記錄取得唯一 winner，Redis 只作加速

可在訂單資料庫或同等可靠的持久化儲存建立 idempotency record，至少包含 `(tenant_id, operation, idempotency_key)` 唯一索引、fingerprint、狀態、order ID、payment attempt ID、下游 merchant request ID、保存的 status／body、created_at、expires_at 與 lease／owner 資訊。建議狀態包括 `PROCESSING`、`SUCCEEDED`、`FAILED_FINAL` 與 `UNKNOWN`，必要時另有可安全恢復的 `RETRYABLE`。

1. 先以交易內的原子 insert／unique constraint claim key，將 fingerprint 和穩定的 payment attempt ID 一起寫入，再開始副作用；不能先 `GET` 再 `SET`。
2. 另一個實例遇到同 key 時，先比對 fingerprint，再讀狀態。`SUCCEEDED` 或 `FAILED_FINAL` 直接回放終態；`PROCESSING` 可在有界時間內等待，逾時則回傳明確的 in-progress `202` 加狀態查詢，或依既定契約回 `409`／`Retry-After`，但不能再呼叫支付供應商。
3. 支付呼叫使用由該持久化 payment attempt 派生且在所有重試中不變的 merchant request ID。若本服務在供應商呼叫後 timeout，先以該 token 查詢或對帳；在結果未釐清前保持 `UNKNOWN`，不能用新 token 重新授權。
4. 只有在訂單／付款終態與要回放的 response 已可靠保存後才回傳成功。若採 outbox 或 worker，應在同一筆資料庫交易建立待處理狀態與 outbox，再由 worker 帶著同一 token 執行；若支付成功但本地提交失敗，恢復程序靠 token 查詢、唯一關聯與對帳補齊狀態。
5. Redis 可以快取已完成的回應來降低 replay 延遲，但 Redis miss、淘汰或重啟時仍回到持久化 record；不能因快取不存在就重新執行副作用。

結果保存的 TTL 應取 `max(客戶端可能重試的時間、供應商 24 小時去重期限、對帳／恢復窗口)` 再加安全裕度。例如客戶端最長重試只有數十分鐘、供應商保留 24 小時，而對帳需 6 小時，服務可選擇至少 48 小時的 replay／claim 保留，並讓訂單與支付 ledger 保留得更久。TTL 不是任意填 24 小時：過期後不能再宣稱同 key 可安全重播，應要求新流程或用長期 client order ID／tombstone 防止誤重用；清理本身也不能刪掉仍在 `PROCESSING` 或 `UNKNOWN` 的記錄。

### 3. 把 429、重試與下游容量分開治理

參考方案會把「尚未產生副作用但 admission 被拒絕」與「供應商已經可能接受請求」分開：

- gateway 或服務端配額、tenant／IP／端點限流拒絕新工作時回 `429 Too Many Requests`，附 `Retry-After`、限制／剩餘／重置資訊。`Retry-After` 應依實際 token 或下一個可接受時間估算並設上限，不應讓所有客戶在同一秒重新湧入。
- 若 key 已被 claim 且工作正在處理，重試只能觀察同一筆狀態；有界等待後可回 `202` 加狀態 URL。若同步契約不允許非同步，應回明確的 `503` 或 in-progress response 加退避指示，而不是建立第二筆工作。
- 支付供應商的 `429` 必須尊重其 `Retry-After`，由受控 worker 使用同一 merchant request ID、全域 retry budget、指數退避與 jitter 重試；不能由客戶端、gateway、應用與 worker 各自再重試一次。若服務不能在客戶端 deadline 內處理，應轉為 pending 或有界的 `503`／`429`，並保留原 key。
- circuit breaker 開啟時，新支付副作用應快速失敗或進入明確的 bounded pending；可安全 replay 的已完成結果仍可服務，但不能把「已完成 replay」再送進支付限流器。所有 replay 仍需經過邊緣與低成本讀取保護，防止用同一 key 打爆結果儲存。

### 4. 用全域 headroom 做分層限流與 bulkhead

一個可行的分配如下，數字是示例起點，必須用壓測校準：

| 層級 | 機制與維度 | 取捨與容量邊界 |
| :--- | :--- | :--- |
| Gateway／edge | 以 IP 做濫用防護、以 tenant／認證主體做公平配額；token bucket 可容許小幅突發，搭配本地快速拒絕。 | IP 不能當唯一公平維度，否則 NAT 會誤傷合法客戶；gateway 先擋掉無效或明顯過量流量，避免所有請求進入應用。 |
| 應用 admission | 以 tenant、端點與「新副作用／終態 replay」分開計費的全域 token bucket；Redis Lua、配額服務或其他原子共享狀態做跨 8 實例的協調，本地 limiter 作保守的 fail-safe。 | 新付款只能拿到全域預算；終態 replay 不消耗支付配額但仍受讀取配額保護。Redis 故障時，付款新工作應採保守拒絕或低上限本地 fallback，不能全數放行。 |
| 支付 worker | 以全域 token bucket 控制新授權速率，例如先設約 240 req/s，為供應商 300 req/s 留 20% 頭部空間；以 semaphore／bulkhead 把同時授權先限制在約 80，並設有界佇列與最長等待時間。 | 這會犧牲部分尖峰請求的即時成功率，換取不撞供應商配額、不讓 timeout 堆積；不能在每個實例都設 240 req/s，否則 8 實例會放大成 1,920 req/s。 |
| 訂單資料庫 | 使用連線池上限、寫入 semaphore 或寫入預算，先以約 200 writes/s 作保守上限，並保留管理／讀取 headroom。 | 被拒絕的非核心工作可回 `429` 或進入有界 pending；不能用無上限 queue 把資料庫壓力延後成更大的雪崩。 |

支付下游可用 leaky bucket 或受控 worker 來平滑流量，但 queue 必須有容量、deadline、丟棄／回應策略和可觀測深度；若 API 必須同步回覆，快速回 `429` 或 `503` 通常比讓請求排隊到客戶端 timeout 更可控。限流器的全域狀態要保證原子性，且所有門檻應以 300、100、250 的整體容量計算，而不是以單一實例猜測。

### 5. 指標、驗收與故障注入

應至少觀察以下指標，並把它們依 key、tenant、端點與限流層級切分：

- `idempotency_claim_conflict_total`、終態 replay 比例、fingerprint mismatch 數量、`PROCESSING` 等待／超時數、record store hit／error 與 `UNKNOWN` age。
- 各層 `429` 數量與原因、`Retry-After` 分布及客戶端遵循率、token 使用率、bounded queue depth／age、worker retry 次數與 circuit breaker 狀態。
- 支付供應商 QPS、in-flight concurrency、429／timeout／5xx、p95 latency，以及同一 payment attempt 的重複 provider request 數。
- 訂單資料庫 writes/s、連線池使用率、交易／提交延遲、資料庫錯誤率、訂單與支付狀態不一致數、對帳 backlog 與重複訂單／扣款數。

驗收條件可包括：在 2,000 req/s、同 key 併發與最多 4 次重試的壓測下，重複訂單與重複扣款為 0；新的支付呼叫不超過保守 headroom（例如 240 req/s、80 concurrency）；資料庫 writes/s 不超過保護門檻；所有被拒絕的請求能看到正確層級的 `429`／`Retry-After`；provider timeout 造成的 `UNKNOWN` 能在對帳 SLA 內收斂。測試還應同時注入兩個實例搶同 key、Redis 重啟、供應商回 429、供應商接受後丟回應、worker 在副作用後 crash，以及客戶端改 key／改 body，確認每一條狀態轉移都不會重新產生付款副作用。

</details>

## 常見失分點

- 只用 Redis `GET`／`SET` 或單機 mutex，沒有跨實例的原子 claim、持久化結果與 crash recovery。
- 只保存「已處理」標記，不保存 status、body、fingerprint、payment attempt 或 TTL，導致重試拿不到同一結果或無法判斷 key 衝突。
- 把 TTL 固定寫成 24 小時，卻沒有比較客戶端重試窗口、供應商去重期限、對帳時間與過期後的 key 重用風險。
- 在支付 timeout 後用新的 merchant request ID 重試，或把 API 層 idempotency 誤當成支付供應商的 exactly-once 保證。
- 每個應用實例各自配置完整的 300 req/s 上限，或只按 IP 限流，沒有計算全域容量、公平性與 NAT 誤傷。
- 收到 `429` 後讓 client、gateway、應用與 worker 同時立即重試，忽略 `Retry-After`、jitter、retry budget、bulkhead 或 circuit breaker。
- 建立無上限佇列，或在下游故障時直接回傳「已付款」作為降級；沒有區分 `429`、`503`、`202 pending` 與 unknown outcome 的業務語意。
- 只列出 CPU、QPS 等一般監控，沒有驗證重複副作用、in-flight race、provider 配額、資料庫 headroom、對帳 backlog 與 `Retry-After` 行為。

## 延伸追問

1. 如果同一個 key 在 48 小時後才抵達，而支付供應商已不再保留該 token，你會如何結合 client order ID、支付查詢與 tombstone 決定拒絕、恢復或建立新意圖？
2. 如果大量客戶端都因 SDK bug 在每次 retry 產生新 key，你會在 API 契約、SDK、資料模型與對帳流程各加哪一層保護，如何避免把兩筆合法訂單誤合併？
3. 如果服務改成多區域 active-active，兩個區域可能同時收到相同 key，你會選擇全域強一致 claim、按 tenant 分區，還是路由黏著？各自付出什麼延遲與可用性代價？
4. 如果支付供應商在促銷期間把配額從 300 req/s 降到 100 req/s，你會如何動態調整 token bucket、並發上限、`Retry-After` 與 pending backlog，而不讓已完成的 replay 被誤限流？
5. 若業務允許 `202 Accepted`，請補出訂單／付款狀態機、輪詢或 webhook 契約、補償／退款邊界，以及客戶端如何知道何時可以安全地再次查詢而不是再次建立訂單。
