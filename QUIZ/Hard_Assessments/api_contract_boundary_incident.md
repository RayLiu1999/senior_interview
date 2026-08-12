# API Contract Boundary Incident：版本演化、事件投遞與即時連線的相容性事故

- **Assessment ID**: `assessment.api.contract-boundary.incident.v1`
- **主要 Concept ID**: `concept.api.openapi.contract-first`
- **次要 Concept IDs**:
  - `concept.api.backward-compatibility.evolution`
  - `concept.api.pagination.consistency-performance`
  - `concept.api.webhook.delivery-reliability`
  - `concept.api.websocket.handshake-upgrade`
  - `concept.api.websocket.heartbeat-liveness`
- **對應文章**:
  - [API 向後相容策略](../../02_Backend_Development/API_Design/api_backward_compatibility.md)
  - [API 文件設計與 OpenAPI](../../02_Backend_Development/API_Design/api_documentation_openapi.md)
  - [API 分頁設計](../../02_Backend_Development/API_Design/api_pagination.md)
  - [Webhook 設計](../../02_Backend_Development/API_Design/webhook_design.md)
  - [WebSocket 握手過程](../../02_Backend_Development/API_Design/WebSocket/websocket_handshake.md)
  - [WebSocket 心跳機制](../../02_Backend_Development/API_Design/WebSocket/heartbeat_mechanism.md)
- **題型**: `生產事故診斷`, `契約設計／取捨`, `實作／系統設計`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 45 分鐘
- **標籤**: `API Contract`, `OpenAPI`, `Backward Compatibility`, `Pagination`, `Webhook`, `WebSocket`, `Reliability`
- **Learning Objective IDs**:
  - `concept.api.backward-compatibility.evolution/LO-1`
  - `concept.api.backward-compatibility.evolution/LO-2`
  - `concept.api.backward-compatibility.evolution/LO-3`
  - `concept.api.openapi.contract-first/LO-1`
  - `concept.api.openapi.contract-first/LO-2`
  - `concept.api.openapi.contract-first/LO-3`
  - `concept.api.pagination.consistency-performance/LO-1`
  - `concept.api.pagination.consistency-performance/LO-2`
  - `concept.api.pagination.consistency-performance/LO-3`
  - `concept.api.webhook.delivery-reliability/LO-1`
  - `concept.api.webhook.delivery-reliability/LO-2`
  - `concept.api.webhook.delivery-reliability/LO-3`
  - `concept.api.websocket.handshake-upgrade/LO-1`
  - `concept.api.websocket.handshake-upgrade/LO-2`
  - `concept.api.websocket.handshake-upgrade/LO-3`
  - `concept.api.websocket.heartbeat-liveness/LO-1`
  - `concept.api.websocket.heartbeat-liveness/LO-2`
  - `concept.api.websocket.heartbeat-liveness/LO-3`

## 測驗目標

- 能把 HTTP API、OpenAPI schema、分頁、Webhook 和 WebSocket 視為同一個公開契約邊界，分辨語法相容、行為相容與營運相容。
- 能在不採用一次性切換的前提下，設計版本演化、廢棄、錯誤契約、冪等與 timeout 的遷移方案。
- 能以資料排序與事件投遞語義處理分頁重複／遺漏、Webhook 重試／亂序，以及即時連線的握手、心跳與重連。
- 能用 OpenAPI lint／diff、Consumer contract、流量、事件、連線與延遲證據驗證方案，並提出可分階段回滾的修復順序。

## 問題情境與限制條件

某 SaaS 平台公開提供訂單 API、訂閱 Webhook 與即時訂單狀態 WebSocket。平台最近把後端從 code-first 文件生成流程改成多團隊共用的 OpenAPI repository，但沒有設定 schema review gate。一次 `v2` 發布後，客服和 SRE 同時收到以下事故：

- 部分行動版客戶在呼叫 `GET /v1/orders` 時，回應中的 `customer_name` 消失；另一批客戶遇到原本可忽略的 `status` 新枚舉值而解析失敗。團隊表示「只是增加欄位，應該不算 breaking change」。
- `GET /v1/orders?offset=...` 在大量新訂單寫入時出現重複和遺漏；後台客戶需要跳到指定頁，行動版 feed 則需要深分頁和穩定滾動。現有回應只有 `items` 和 `total`，沒有定義排序快照或游標失效語意。
- 訂單建立請求的客戶端 timeout 後會重試；有些 SDK 保留同一個 `Idempotency-Key`，有些 SDK 每次重試都產生新 key。錯誤回應有時是 `500`、有時是沒有結構的 `message`，客戶端無法判斷應該重試、查詢狀態或停止。
- Webhook 接收方看到同一 `order.paid` 事件多次抵達且順序顛倒；某次代理重送請求時，簽名驗證因 body 已被 JSON 重新序列化而失敗。發送方在接收方處理超過 5 秒後判定失敗並重試，但接收方其實已經提交訂單狀態。
- WebSocket 經過 CDN 和反向代理後，部分請求沒有得到 `101 Switching Protocols`；另一部分連線能建立卻在閒置約 55 秒後大量斷線。服務目前用應用層文字 `heartbeat` 和 Ping/Pong 混在一起計算健康度，慢客戶端還會使同一個廣播寫入佇列持續增長。
- 發布後 API P99 從 180 ms 上升到 2.5 秒，Webhook retry backlog 和 WebSocket reconnect rate 同時升高。資料庫與訊息佇列尚未超過硬上限，但 API gateway、Webhook worker 和 WebSocket connection manager 各自有一套 timeout／retry，沒有共同的 budget。

平台有以下限制：

- 既有 `v1` 公開客戶至少還要維護 12 個月；不能要求所有 Consumer 在同一天升級，也不能直接把 `v1` 流量導到語義不同的 `v2`。
- 成功回應必須代表該副作用已可靠保存，或明確使用 `202 Accepted` 表示 pending；不能用 `200` 掩蓋未知結果，也不能因 timeout 盲目建立第二筆訂單。
- Webhook 要維持至少一次投遞，允許接收方非同步處理；不能假設網路、代理或事件來源會提供 exactly-once 和全域順序。
- WebSocket 連線數和每租戶廣播佇列都必須有界；不能以無限延長 timeout 或無限保留慢客戶端來掩蓋 backpressure。
- 這次修復必須先止血，再以契約、資料、事件和連線證據分階段放量；任何變更都要能在一個主要變因下回滾。

## 作答要求

請提出端到端的 API contract boundary 修復方案，不要只列出 OpenAPI、Webhook 或 WebSocket 名詞。回答至少要涵蓋：

1. **相容性與版本演化**：逐一判斷移除 `customer_name`、新增 `status` 枚舉、增加可選回應欄位、增加必填請求欄位、改變錯誤碼語義和改變預設排序是否為 breaking change；定義 v1／v2 的隔離、deprecated／sunset、遷移期間與 rollback。
2. **OpenAPI 契約治理**：設計 repository、review、lint、schema diff、Mock／SDK、Server implementation verification 和 Consumer-Driven Contract Test 的流程；說明 code-first 與 contract-first 在現有團隊中的過渡取捨，並指出如何避免把內部欄位、錯誤或安全設定誤暴露。
3. **分頁與一致性**：為後台跳頁和 feed 深分頁分別選擇策略，定義穩定排序、唯一 tie-breaker、游標內容／簽名、資料一致性邊界、`limit` 上限、`has_next`／`total` 語義、游標失效錯誤和觀測指標。
4. **Webhook 可靠投遞**：定義 timeout、`2xx` 確認時機、指數退避、最大重試、DLQ、replay、事件版本與亂序處理；說明如何用原始 body、HMAC、時間戳／nonce、constant-time compare 與事件 ID 去重，避免接收方已提交後又產生重複副作用。
5. **WebSocket 握手與心跳**：從 HTTP Upgrade、`101`、`Sec-WebSocket-Key`／`Accept`、Origin、TLS、認證和 subprotocol 證據診斷握手；區分 Ping/Pong liveness 與應用層 heartbeat，依 CDN／Proxy idle timeout 設計 interval、deadline、close、重連和慢客戶端 backpressure。
6. **timeout、冪等與錯誤契約**：定義 gateway、API、Webhook worker、下游與 WebSocket 層的 timeout／retry budget，設計 `Idempotency-Key`、request fingerprint、狀態查詢與錯誤 envelope；明確區分可安全重試的 `429`／`503`、需要查詢的 unknown outcome、不可重試的驗證／授權錯誤和已完成結果 replay。
7. **證據與交付**：至少列出 12 項證據或實驗，覆蓋 schema／Consumer、分頁一致性、Webhook 重複／亂序／簽名、握手／心跳、timeout／重試、容量與回滾；給出至少三階段 rollout，每階段要有成功指標、警戒線和 rollback 條件。

## 期待證據

- 能指出移除欄位、增加必填輸入、改變型別／語義、改變預設排序和錯誤契約通常會破壞 Consumer；新增欄位也要考慮嚴格 decoder、allowlist 與 code generator，不可一概宣稱安全。
- 能讓 OpenAPI 成為可審查的契約來源，並以 lint、schema diff、範例、Mock、生成物、實作驗證和 Consumer traffic／contract test 把 drift 變成發布阻擋條件。
- 能區分 Offset 的跳頁便利與深分頁／資料變動風險，並以穩定排序、唯一 tie-breaker、不透明游標和明確 snapshot／一致性語意避免重複或遺漏；不把 `total` 當成免費或永遠精確的值。
- 能明確採用至少一次 Webhook 投遞：接收方先可靠保存事件再回 `2xx`，事件處理以 ID 冪等、可重試、可處理亂序；簽名必須對原始 bytes 驗證，並有時間窗與 replay 防護。
- 能正確計算 WebSocket `Sec-WebSocket-Accept` 的協議責任，指出它不是身份驗證；能用 Origin／TLS／token／subprotocol／Proxy 設定與握手 trace 分開定位問題。
- 能把 Ping/Pong 用於連線 liveness 與 idle timeout，將應用 heartbeat 用於業務確認，並處理單一寫入者、bounded queue、慢客戶端隔離、取消、close 和 reconnect backoff。
- 能在 timeout 後保留相同的 idempotency key 和下游 operation ID；未知結果先查詢／對帳，不用新 token 盲目重試。錯誤契約要同時提供 machine-readable code、retryability、correlation ID、狀態查詢或 `Retry-After`。
- 能提出可量化證據，例如 breaking schema diff 數、Consumer contract failure、v1/v2 流量、分頁重複／遺漏率、Webhook duplicate／signature failure／DLQ age、101 success rate、Pong timeout、reconnect rate、queue age、P99 和 retry amplification。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議「重新產生文件、增加 timeout 或重連」，沒有契約邊界模型；方案會在回應遺失、Webhook retry 或 WebSocket slow consumer 下重複副作用或無限堆積。 |
| 1 | 能列出版本、OpenAPI、cursor、HMAC 或 Ping/Pong 名詞，但沒有分辨 breaking change、至少一次投遞、握手認證邊界、timeout／冪等語義與可驗證證據。 |
| 2 | 主要方向大致正確，能完成部分契約或事件修復，但至少缺少一個核心邊界；沒有完整處理分頁一致性、WebSocket backpressure、錯誤契約或跨層 retry amplification。 |
| 3 | 能提出可行的端到端方案：以版本／schema diff／Consumer test 控制演化，使用穩定 cursor、冪等 Webhook、正確握手與心跳、bounded queue 和共同 retry／timeout budget，並以分階段 rollout 與指標驗證。 |
| 4 | 除上述內容外，能處理嚴格 Consumer 對新增欄位的風險、unknown payment／response outcome、事件亂序與 replay、Proxy 協商差異、慢客戶端隔離、多租戶公平性，以及每個修復的容量數據、警戒線和回滾證據。 |

### 通過標準

預設 **3/4 分通過**；若拆分核心面向評分，`相容性／OpenAPI`、`分頁／Webhook`、`WebSocket 握手／心跳`、`timeout／冪等／錯誤契約` 四個面向均不得低於 2 分，且必須提出至少一個可執行的 rollback 條件。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

### 1. 先修復契約來源和相容性判定

先把目前 code-first 生成物與公開契約分開審查，建立每個 operation 的 owner、版本、變更分類和 Consumer 證據。移除 `customer_name`、增加必填 request 欄位、改變欄位型別／語義、改變錯誤碼含義、改變授權要求與改變既有預設排序，通常都是 breaking change；新增可選 response 欄位只有在 Consumer 能忽略未知欄位、SDK 和 allowlist 不會崩潰時才可視為相容。新增 enum 值也不能假定安全，嚴格 decoder 必須先驗證。

立即止血時恢復 `v1` 的舊 response shape 和排序語義，將已發布的移除欄位以相容層補回；若 `v2` 需要新語義，就以明確版本路由或 media type 隔離，不能把 `v1` 指向一個只改了欄位的 `v2`。用 `Deprecation: true`、`Sunset`、migration guide、client usage telemetry 和至少 12 個月的窗口管理退出；只在實際 v1 流量降到門檻、主要 Consumer 通過 contract test 後才移除。

OpenAPI repository 應要求 operation、schema、error、security、example、pagination、webhook 和 websocket handshake 相關描述都能被 review。每次變更先跑格式驗證與 lint，再做相對前一版的 breaking／non-breaking schema diff；breaking diff 需要 owner 和 Consumer 核准。由規範產生 Mock／SDK／Server Stub 的團隊仍要以 integration test 驗證實作沒有只更新文件；若採 code-first 過渡，應把生成的 schema 固定成 artifact，禁止未經 diff 的自動覆蓋。

### 2. 分頁和錯誤契約要把一致性說清楚

後台需要隨機跳頁且資料規模可控時，可以保留 Offset／page，但要固定排序、限制最大 page／offset，並說明資料在頁面之間變動時可能出現的 snapshot 邊界；若需要強一致報表，應使用 export job 或明確的 snapshot token，而不是假裝一般 offset 具有 snapshot。

行動 feed 和深分頁應改用 Cursor／Keyset。游標至少包含排序欄位和唯一 tie-breaker，例如 `created_at` 加 `id`，並簽名或加密使客戶端不能任意改位置；查詢條件、排序版本、tenant 和 snapshot boundary 也應納入驗證。回應定義 `next_cursor`、`has_next`、頁大小上限和空頁語義；`total` 若要精確計算應標示成本和一致性，否則提供近似值或不提供。過期、格式錯誤、篩選／排序不相容的游標應回 machine-readable `invalid_cursor`，而不是悄悄從第一頁開始。

所有 API 錯誤應有穩定的 envelope，例如 machine-readable error code、human message、details、correlation ID、retryability 和可選 `Retry-After`／status URL。驗證／授權錯誤通常不可重試；容量拒絕可用 `429`；暫時性服務或下游故障可用 `503`；若副作用可能已接受但結果未知，應回 `202` 加 status URL 或明確的 unknown code，禁止客戶端直接建立新意圖。

### 3. Webhook 以 durable accept 加冪等處理

發送方把事件和 delivery record 可靠寫入 outbox，再由 worker 投遞。每次 delivery 有固定 event ID、attempt ID、schema version 和 deadline；接收方在 timeout 內先驗證簽名並把原始事件保存到 durable inbox／queue，成功保存後就回 `2xx`，實際業務處理由 worker 執行。若接收方在提交狀態後 response 遺失，重試仍會抵達，但 event ID unique constraint 或 inbox state 會讓它只產生一次副作用。

HMAC 必須對未解析、未重新序列化的原始 request body 計算，並用時間戳／nonce 限制 replay、constant-time compare 驗證簽名、輪替 secret 和記錄失敗原因但不記錄 secret。事件順序不能靠 HTTP 到達順序保證；若資源狀態需要順序，可使用 per-order sequence、版本 compare-and-set 或先查目前狀態，對舊事件丟棄、延後或補償。發送方對非 `2xx`、連線錯誤和 deadline 使用指數退避加 jitter，設定最大 attempt、DLQ、replay、退避上限和 endpoint disable 門檻；`2xx` 後不能再因 worker 業務失敗無限重送同一個同步請求，應由 inbox／DLQ 狀態處理。

### 4. WebSocket 將握手、認證、liveness 和 backpressure 分層

握手診斷先檢查客戶端的 HTTP `GET` 是否帶 `Upgrade: websocket`、`Connection: Upgrade`、有效的 `Sec-WebSocket-Key` 和支援的 `Sec-WebSocket-Version`，再檢查 CDN／Proxy 是否允許 Upgrade、TLS termination、Origin policy、認證 middleware、subprotocol 和 timeout。成功回應是 `101 Switching Protocols`，其中 `Sec-WebSocket-Accept` 由 key 加 RFC 6455 magic string 後 SHA-1 再 Base64 計算；這個值只確認協議升級，不代表使用者身份已驗證。握手 trace 應記錄拒絕階段和 machine-readable close／HTTP reason，但不能記錄 token 或敏感 header。

對閒置約 55 秒斷線，先把 Proxy／CDN idle timeout 和 heartbeat interval 放在同一條時間線。若中間設備約 60 秒關閉 idle connection，伺服器 Ping interval 應留安全裕度，例如低於該值；Pong deadline 應區分暫時網路延遲與死連線，並設上限避免資源長留。Ping／Pong 是 transport liveness，不保證業務訊息已被應用處理；需要確認業務進度時另定義帶 sequence 的應用 heartbeat。

每條連線的寫入必須有單一 writer 或等價序列化，送出 queue 必須有界；慢客戶端達到 queue age／bytes／messages 閾值時應丟棄可重建訊息、降級成 snapshot 或以明確 close code 斷開，不能阻塞全租戶 broadcast。重連使用 exponential backoff 和 jitter，並重新執行認證／subprotocol handshake；連線數、Pong latency、timeout、queue age、close reason、reconnect rate 和每租戶配額都要可觀測。

### 5. 讓 timeout、冪等和 rollout 共用同一個可靠性模型

API gateway、API handler、Webhook worker、下游 HTTP call 和 WebSocket send 都要有明確的 deadline；retry 只由一層負責，並受總 budget、attempt、jitter、`Retry-After` 和 queue deadline 控制。`Idempotency-Key` 要與 tenant／operation scope 綁定，保存 request fingerprint、狀態、結果／status URL、下游 operation ID 和 lease；同 key 同內容可 replay 已保存結果，同 key 不同內容回 `409` 或明確的 conflict，不得覆蓋原始意圖。

若 API timeout 發生在副作用可能已提交之後，狀態應為 `UNKNOWN` 或 `PENDING`，客戶端用同一 key 查詢 status；服務端以相同 operation ID 查詢下游或對帳，不能用新 key 盲目再建立訂單。已完成 replay 不應重新呼叫下游；新副作用才需要消耗 admission、資料庫與下游配額。這樣 `429`、`503`、驗證錯誤和 unknown outcome 才有不同的自動化行為。

建議分三階段交付：第一階段恢復 v1 response／排序、擋住未審查 breaking schema、限制 Webhook retry fan-out、修正 Proxy Upgrade 與 heartbeat interval，並加入 correlation ID、schema diff、101 success、Pong timeout、queue age 和 idempotency status 指標；若 v1 5xx、WebSocket 斷線、Webhook backlog 或 P99 超過警戒線就回滾流量或 feature flag。第二階段導入 OpenAPI review／contract gate、cursor 契約、durable inbox／outbox、簽名和 replay、bounded WebSocket queue，以及共用 timeout／retry budget；通過 Consumer、亂序／重複、slow consumer、Proxy fault 和 timeout fault injection 後再逐步放量。第三階段才開始 v1 migration、SDK／Mock 生成、deprecated cleanup、capacity tuning 和更精細的多租戶配額；任何一個 breaking diff、duplicate side effect、未知結果 backlog 或 queue age 不收斂，都保留舊路徑並停止放量。

至少應驗證：

1. 對 v1／v2 schema 執行 remove field、required field、enum、error code、default sort 的 diff，確認 gate 分類和回滾。
2. 以嚴格 JSON decoder、舊 SDK、生成 SDK 和實際 Consumer contract replay 測試新增欄位／enum。
3. 在插入與刪除交錯的資料集上比較 offset 和 cursor 的重複／遺漏率、深頁 latency、無效／過期 cursor 行為。
4. 讓 Webhook 在「已保存但 response 丟失」、「處理後 crash」、「亂序」、「簽名 body 重排」下重送，確認副作用一次、簽名拒絕和 DLQ 可 replay。
5. 注入代理移除 Upgrade、錯誤 Origin、TLS／subprotocol mismatch、握手 timeout，確認診斷事件不洩漏 token。
6. 注入 Proxy idle timeout、延遲 Pong、Pong 遺失、應用 heartbeat 未確認、慢客戶端和 broadcast burst，確認 close、bounded queue、重連和租戶隔離。
7. 讓 API 在資料庫提交前後、下游接受後回應前、Webhook worker 和 connection manager crash，確認同一 key／operation ID 的查詢、恢復和不重複副作用。
8. 以混合租戶流量壓測 gateway、API、Webhook 與 WebSocket，量測 retry amplification、P99、queue age、DB／MQ headroom 和每租戶公平性；一次只改一個 timeout、retry 或 queue 參數。

</details>

## 常見失分點

- 把「新增欄位一定相容」當成規則，忽略嚴格 JSON decoder、生成 SDK、allowlist、enum 和 Consumer 行為。
- 只更新 Swagger UI 或重新生成文件，沒有 schema diff、owner review、實作驗證、Consumer contract 和 migration／rollback。
- 只把 Offset 改成 Cursor，卻沒有穩定排序、唯一 tie-breaker、簽名、失效語義、limit 上限和 snapshot 邊界。
- Webhook 收到請求後先做業務副作用、最後才回應，或只依 `event_type` 去重；沒有原始 body HMAC、時間窗、事件 ID、inbox／outbox 和亂序處理。
- 把 `Sec-WebSocket-Key`／`Accept` 說成登入或加密，忽略 Origin、TLS、Proxy、subprotocol 和真正的認證授權。
- 只增加 WebSocket heartbeat 頻率，沒有配合 Proxy idle timeout、Pong deadline、單一 writer、bounded queue、慢客戶端隔離和重連退避。
- 讓 gateway、API、worker 和下游各自重試，造成 retry storm；timeout 後以新 idempotency key 或新 operation ID 重做未知副作用。
- 用 `200` 表示未知結果、用 `500` 表示所有錯誤，或沒有 machine-readable code、`Retry-After`、correlation ID 和狀態查詢契約。
- 只看平均 latency 或 CPU，沒有觀察 schema drift、分頁重複／遺漏、Webhook duplicate／DLQ、101 success、Pong timeout、queue age 和 rollback 指標。

## 延伸追問

1. 如果某個重要 Consumer 使用嚴格的 enum decoder，但業務必須新增狀態值，你會選擇新版本、字串 fallback、能力協商還是遷移期雙欄位？如何用流量證據決定退出時間？
2. 如果跨區域 active-active 同時收到同一個 Webhook，你會把 inbox unique constraint 放在哪裡，如何處理區域延遲、重複 replay 和資料主權限制？
3. 如果 feed 必須顯示「不漏資料」但又要求即時插入，你會選擇 snapshot cursor、sequence watermark、change feed 還是 export job？每種方案如何回報新資料和刪除資料？
4. 如果 CDN 無法保證 WebSocket Upgrade，但產品仍要支援企業網路，你會如何設計 fallback、能力探測、SSE／long polling 的契約與一致性差異？
5. 如果某租戶有大量慢 WebSocket 客戶端，如何在不影響其他租戶的前提下設計 queue、drop／snapshot、連線配額和計費？
6. 如果客戶端在 `202` 後持續用新 key 建立同一筆訂單，你會在 request fingerprint、client order ID、狀態查詢和錯誤契約各加哪一層保護，如何避免誤合併兩筆合法訂單？
