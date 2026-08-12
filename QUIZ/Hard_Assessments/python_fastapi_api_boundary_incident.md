# Python FastAPI API Boundary Incident：從請求契約到執行容量

- **Assessment ID**: `assessment.python.fastapi.api-boundary.incident.v1`
- **主要 Concept ID**: `concept.python.fastapi.api-schema`
- **次要 Concept IDs**:
  - `concept.python.fastapi.async-architecture`
  - `concept.python.fastapi.routing-parameter-contract`
  - `concept.python.fastapi.validation-contract`
  - `concept.python.fastapi.authentication-security`
  - `concept.python.fastapi.middleware-boundary`
  - `concept.python.fastapi.error-boundary`
  - `concept.python.fastapi.database-integration`
  - `concept.python.fastapi.background-task-lifecycle`
  - `concept.python.fastapi.websocket-lifecycle`
  - `concept.python.fastapi.performance-capacity`
  - `concept.python.fastapi.deployment-runtime`
  - `concept.python.fastapi.testing-strategy`
  - `concept.python.fastapi.openapi-contract`
- **對應文章**:
  - [FastAPI 的非同步處理機制](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/fastapi_async.md)
  - [FastAPI 路徑操作與參數](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/path_operations_and_parameters.md)
  - [FastAPI 請求與響應模型](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/request_and_response_models.md)
  - [Pydantic 模型與數據驗證](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/pydantic_models_and_validation.md)
  - [FastAPI 認證與安全](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/authentication_and_security.md)
  - [FastAPI 中間件機制](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/middleware_mechanism.md)
  - [FastAPI 錯誤處理](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/error_handling.md)
  - [FastAPI 數據庫集成](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/database_integration.md)
  - [FastAPI 後台任務](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/background_tasks.md)
  - [FastAPI WebSocket 支持](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/websocket_support.md)
  - [FastAPI 性能優化](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/performance_optimization.md)
  - [FastAPI 部署與容器化](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/deployment_and_containerization.md)
  - [FastAPI 測試策略](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/testing_strategies.md)
  - [FastAPI 自動 API 文檔生成](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/automatic_api_documentation.md)
- **題型**: `生產事故診斷`、`API 契約設計`、`非同步容量`、`安全與部署取捨`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 45 分鐘
- **標籤**: `Python`, `FastAPI`, `ASGI`, `Validation`, `Database`, `WebSocket`, `Capacity`, `Security`
- **Learning Objective IDs**:
  - `concept.python.fastapi.async-architecture/LO-1`
  - `concept.python.fastapi.async-architecture/LO-2`
  - `concept.python.fastapi.async-architecture/LO-3`
  - `concept.python.fastapi.routing-parameter-contract/LO-1`
  - `concept.python.fastapi.routing-parameter-contract/LO-2`
  - `concept.python.fastapi.routing-parameter-contract/LO-3`
  - `concept.python.fastapi.api-schema/LO-1`
  - `concept.python.fastapi.api-schema/LO-2`
  - `concept.python.fastapi.api-schema/LO-3`
  - `concept.python.fastapi.validation-contract/LO-1`
  - `concept.python.fastapi.validation-contract/LO-2`
  - `concept.python.fastapi.validation-contract/LO-3`
  - `concept.python.fastapi.authentication-security/LO-1`
  - `concept.python.fastapi.authentication-security/LO-2`
  - `concept.python.fastapi.authentication-security/LO-3`
  - `concept.python.fastapi.middleware-boundary/LO-1`
  - `concept.python.fastapi.middleware-boundary/LO-2`
  - `concept.python.fastapi.middleware-boundary/LO-3`
  - `concept.python.fastapi.error-boundary/LO-1`
  - `concept.python.fastapi.error-boundary/LO-2`
  - `concept.python.fastapi.error-boundary/LO-3`
  - `concept.python.fastapi.database-integration/LO-1`
  - `concept.python.fastapi.database-integration/LO-2`
  - `concept.python.fastapi.database-integration/LO-3`
  - `concept.python.fastapi.background-task-lifecycle/LO-1`
  - `concept.python.fastapi.background-task-lifecycle/LO-2`
  - `concept.python.fastapi.background-task-lifecycle/LO-3`
  - `concept.python.fastapi.websocket-lifecycle/LO-1`
  - `concept.python.fastapi.websocket-lifecycle/LO-2`
  - `concept.python.fastapi.websocket-lifecycle/LO-3`
  - `concept.python.fastapi.performance-capacity/LO-1`
  - `concept.python.fastapi.performance-capacity/LO-2`
  - `concept.python.fastapi.performance-capacity/LO-3`
  - `concept.python.fastapi.deployment-runtime/LO-1`
  - `concept.python.fastapi.deployment-runtime/LO-2`
  - `concept.python.fastapi.deployment-runtime/LO-3`
  - `concept.python.fastapi.testing-strategy/LO-1`
  - `concept.python.fastapi.testing-strategy/LO-2`
  - `concept.python.fastapi.testing-strategy/LO-3`
  - `concept.python.fastapi.openapi-contract/LO-1`
  - `concept.python.fastapi.openapi-contract/LO-2`
  - `concept.python.fastapi.openapi-contract/LO-3`

## 測驗目標

- 能從請求解析、輸入驗證、授權、middleware、route、資料庫、背景工作與 WebSocket 的邊界建立完整因果鏈。
- 能區分 async endpoint 與非阻塞 I/O，並以 event-loop、thread pool、資料庫連線池、WebSocket 連線和下游容量解釋 tail latency。
- 能設計向後相容且不洩漏資料的 request／response／OpenAPI 契約，包含限制、錯誤、版本與可觀測性。
- 能處理 dependency scope、transaction、background task、取消、斷線、重試、冪等與 graceful shutdown 的資源 ownership。
- 能把認證授權、秘密管理、CORS／CSRF、重放防護、租戶隔離、rate limit 與 overload response 放進同一個威脅模型。
- 能提出分階段、可量測、可回滾的修復與測試計畫，而不是只增加 worker 或調高 timeout。

## 問題情境與限制條件

某多租戶 FastAPI notification service 提供 `POST /v2/notifications`、`GET /v2/notifications/{id}` 與 `/v2/stream` WebSocket。每個 container 配置四個 worker，前方有負載平衡器，資料庫使用非同步 ORM，另有一個同步的第三方簡訊 SDK。服務部署兩週後遇到大型租戶的促銷流量，事故資料如下：

- API P99 從 220 ms 上升至 7 秒，5xx、429 與 client timeout 同時增加；CPU 只有 55%，但 event-loop lag、thread pool queue、資料庫 connection wait 與 response serialization time 在尖峰上升。
- `POST` 接受過大的巢狀 payload；部分數字字串被自動轉成數字，client 以為輸入不合法會被拒絕，但實際上不同版本的 validator 行為不一致。response model 直接從 ORM entity 產生，偶爾把內部 provider ID 與 debug 欄位回傳給租戶。
- path operation 的 route、query、header、body 限制與 OpenAPI 描述不完全一致；同一個欄位在 `v1`、`v2` 的 required／nullable 語意不同。OpenAPI 文件仍公開在網際網路，部分內部管理 endpoint 也被列入 schema。
- middleware 同時處理 trace、CORS、JWT、timeout 與例外轉換，但順序未被記錄。未登入請求有時已寫入 response 後才被拒絕；部分錯誤沒有 correlation ID，streaming response 失敗時還會嘗試寫第二個錯誤 body。
- `get_session` dependency 使用 yield 建立資料庫 session；背景工作閉包捕捉該 session，並在 response 返回後繼續使用。另一個全局 singleton cache 保存租戶資料與 token refresh state，沒有 eviction 或租戶隔離檢查。
- 多個 coroutine 共享同一個 `AsyncSession`；一個 notification 會無界建立下游簡訊呼叫。connection pool 在尖峰耗盡，transaction rollback、client cancellation 與 query timeout 的 cleanup 沒有被測試。
- `BackgroundTasks` 直接在 web process 執行發送與重試，沒有 durable queue、最大併發、去重鍵或 shutdown drain。pod 被滾動更新時，已回應但尚未完成的通知可能遺失或重複發送。
- WebSocket 沒有每租戶連線上限、心跳、慢客戶端隔離或送出 queue 上限；broadcast 會等待最慢的連線，斷線清理不穩定，RSS 在長連線壓測中持續上升。
- 部署只用 CPU 觸發 autoscaling；四個 worker 會各自建立資料庫與 HTTP pool。readiness 在 shutdown 時仍回報可接收流量，grace period 不足以完成長 WebSocket 與背景工作排空。
- 認證只驗簽章，沒有一致檢查 issuer、audience、expiry、scope 與 token rotation；錯誤日誌可能包含 bearer token。文件 endpoint、WebSocket handshake 與管理路由的授權策略也不一致。
- 現有測試主要使用 TestClient 的 happy path，透過 dependency override 注入 fake session，沒有驗證正式環境的 lifecycle、取消、慢下游、WebSocket disconnect、schema diff、租戶隔離或壓力下的公平性。

你是當值 senior engineer。限制如下：不能以重啟、單純增加 worker、關閉 validation 或永久提高 timeout 作為唯一修復；不能犧牲租戶資料隔離、既有成功回應的相容性或通知的冪等語意；第一階段必須先止血，且每項改動都要有觀測指標、警戒線與 rollback 條件。

## 作答要求

1. **建立 API 邊界與事故因果鏈**：依序分析 route／參數解析、validation、response serialization、middleware order、async endpoint、下游 SDK、資料庫 pool、背景工作與 WebSocket broadcast 如何共同造成延遲、錯誤與資源增長；區分已知證據、合理假設與待驗證項目。
2. **重畫契約**：提出 request／response model、path／query／header／body 限制、nullable／required、錯誤 envelope、版本相容與 OpenAPI 暴露策略；指出哪些欄位應從 response 移除，並說明如何偵測 schema drift。
3. **設計 validation 與安全邊界**：說明 coercion 與 strict validation 的選擇、巢狀深度／payload size／批次數量限制、認證與授權順序、token claims／rotation、CORS／CSRF、rate limit、秘密遮罩與租戶隔離。
4. **修正 middleware 與錯誤語意**：畫出 middleware onion order，說明 trace、exception、CORS、auth、timeout 與 route 的位置、短路規則、response started 後的處理和取消清理。
5. **設計 async、資料庫與 dependency lifecycle**：判斷同步 SDK 應暫時放入何種有界執行池或替換成 async client；界定每個 request／transaction／AsyncSession 的 ownership，禁止跨 task 共用 session，並處理 rollback、timeout、disconnect 與 cancellation。
6. **重新設計 background task 與 WebSocket**：區分 response 後的輕量工作與必須 durable、可重試、可恢復的任務；提出 queue、idempotency、最大併發與 shutdown drain。為 WebSocket 設計認證、heartbeat、斷線清理、slow consumer backpressure、broadcast 隔離與租戶連線配額。
7. **提出容量與部署方案**：用 event-loop lag、P99、serialization、thread queue、DB／HTTP pool wait、task backlog、WebSocket count、RSS 與 downstream saturation 建立容量預算；說明 worker 數、pool 大小、readiness／liveness、graceful shutdown、autoscaling 與 rolling rollback 的乘法關係。
8. **設計取證與測試矩陣**：至少列出 15 項證據或實驗，涵蓋 trace、慢下游、CPU／blocking、validation、schema、auth、DB transaction、dependency cleanup、background retry、WebSocket disconnect、load、deployment drain 與租戶公平性；每項需說明如何支持或排除假設。
9. **分階段交付**：至少提出三階段，每階段列出變更、成功指標、警戒線、rollback 條件與故障注入；第一階段要能降低事故風險，後續階段才做容量調校或架構替換。

## 期待證據

- 能指出 async endpoint 不會把同步 SDK、阻塞 sleep、CPU-heavy validation 或 serialization 自動變成非阻塞；await 的邊界必須與真正的 awaitable I/O 一致。
- 能把 path／query／header／body／response model 的契約、strictness、大小與深度限制和 OpenAPI schema 對齊，並說明向後相容及敏感欄位排除。
- 能依 middleware onion order 解釋短路、response started、錯誤轉換、CORS／auth／trace headers 與 cancellation 的行為。
- 能區分 authentication 與 authorization，檢查 issuer、audience、expiry、scope、rotation、replay、rate limit、CORS／CSRF、秘密與租戶隔離。
- 能指出 request-scoped session 不能被背景 task 或平行 coroutine 共享，並說明 transaction、rollback、timeout、pool saturation 與 cancellation cleanup。
- 能說明 BackgroundTasks 不提供 durable delivery；可靠通知需要 queue、retry、idempotency、可觀測性與 shutdown drain。
- 能以 heartbeat、disconnect、bounded send queue、slow consumer isolation、連線與 broadcast 配額處理 WebSocket 資源生命週期。
- 能量化 worker、資料庫 pool、HTTP pool、thread pool、task、WebSocket 與下游配額的總容量，避免每個 worker 各自放大造成下游雪崩。
- 能提出 schema diff、contract test、integration／transaction test、dependency lifecycle test、故障注入、壓測和 rolling drain 驗證，不把 happy path coverage 當成可靠性證明。
- 能提出至少三階段且可回滾的 rollout，並使用 P99、error／timeout、event-loop lag、pool wait、task backlog、RSS、WebSocket count、租戶公平性與資料正確性判斷成敗。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議增加 worker、提高 timeout、關閉 validation 或重啟服務，沒有 API 邊界、資源 ownership、證據或回滾條件。 |
| 1 | 能列出 async、Pydantic、middleware、DB 或 WebSocket 的部分名詞，但無法連成事故因果鏈，也沒有可執行的容量與安全方案。 |
| 2 | 能指出主要 blocking／pool／schema／lifecycle 問題，提出部分修復，但遺漏至少兩個核心面向，例如 validation 契約、授權、背景任務可靠性、WebSocket backpressure、deployment drain 或測試證據。 |
| 3 | 能完成 API 契約、async／DB／dependency lifecycle、middleware／錯誤、安全、background／WebSocket、容量／部署與測試的整合分析，並提出分階段 rollback。 |
| 4 | 除上述內容外，能處理 schema 相容與資料遮罩、部分完成與取消、慢客戶端隔離、租戶公平性、worker／pool 容量乘法、故障注入和逐步 rollout 的邊界條件。 |

評分時請分別檢查四個核心面向：**API 契約與 validation**、**runtime／middleware／resource lifecycle**、**容量／部署／WebSocket**、**安全／測試／交付**。

### 通過標準

整體總評達 **3/4 分**才通過；四個核心面向均不得低於 2 分，且答案必須提出至少一個可執行的 rollback 條件，以及至少一項驗證取消、斷線或慢下游的故障注入測試。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先把事故分成四條互相放大的鏈：API 契約與驗證成本、事件循環與下游等待、資源生命週期與併發容量、以及安全／部署造成的錯誤與恢復風險。已知的直接證據是 event-loop lag、thread pool queue、DB connection wait、serialization time、P99、WebSocket RSS、response started 後的拒絕與 worker pool 各自建立；同步 SDK、無界通知呼叫、共用 AsyncSession、背景 task 捕捉 request session 與無界 WebSocket broadcast 則是高可信的原因，仍應用 trace、profile 與故障注入確認各自的比例。

契約修復應先把 path、query、header、body 和 response model 寫成明確 schema。輸入模型要決定哪些欄位採 strict、哪些可相容地 coercion，對批次數量、巢狀深度、字串長度、檔案／payload 大小與分頁上限設界；讀寫模型分離，response 只暴露租戶需要的欄位，禁止直接把 ORM entity 當公開契約。required、nullable、default、錯誤 envelope、版本與 idempotency key 要在 OpenAPI 中一致呈現。對每次 schema 變更做 diff，將刪欄位、型別變更、required 增加與錯誤格式變更視為需要相容性審查的變更。

middleware 應維持可觀測且可預期的 onion order：最外層建立 trace、記錄請求與最終狀態；例外邊界要能捕捉尚未開始回應的錯誤；CORS 與安全標頭要覆蓋短路與錯誤回應；認證在需要保護的 route／WebSocket handshake 前完成，授權再檢查租戶與 scope；timeout 必須傳遞取消而不是只在外層丟棄結果。response 已開始後不能再寫第二個錯誤 body，應中止串流、記錄 correlation ID 並完成資源清理。health endpoint 要明確標示是否需要認證，不能用 middleware 順序偶然決定。

安全上要把驗簽章與授權分開。驗證 token 的 issuer、audience、expiry、scope、租戶與 rotation 版本，對 refresh／撤銷和重放設定可觀測策略；錯誤回應避免洩露 token 是否存在的細節，日誌與 trace 先遮罩 bearer token。依資料型態採用正確的 CORS／CSRF 策略，對登入、發送與 WebSocket handshake 設 rate limit、連線配額與租戶隔離；管理 endpoint 和內部 schema 不應公開在網際網路。

async 路徑要先替換同步 SDK；若無法立即替換，將它放入有界且可監控的 thread pool，設定每下游 timeout、併發上限、queue 上限與 shutdown 行為，不能用無界 thread 轉移壓力。資料庫 session 由 request 或明確 transaction scope 擁有，一個 AsyncSession 不跨平行 task 共用；平行工作各自取得獨立 session，或改成有界的串行／批次查詢。query timeout、client cancellation、例外 rollback 與 connection return 必須在正常、失敗和取消路徑都驗證，並以 pool wait、active connection、transaction time 和慢查詢 trace 判斷瓶頸。

BackgroundTasks 只適合短小、可接受 process loss 的工作。通知發送與重試需要 durable queue、明確的 idempotency key、attempt 狀態、有限 retry／dead-letter、租戶配額與可觀測性；成功回應要表達「已接受」而非虛假的「已送達」。shutdown 時先停止接收新工作，再等待有界 drain；若仍有未完成工作，讓 queue 接手恢復而不是依賴 web process 存活。WebSocket handshake 要驗證身份與 scope，連線建立後維護心跳與 last-seen，取消與 disconnect 時釋放訂閱、queue、session 與 listener。每連線送出 queue 必須有界，慢客戶端要被降級或斷開；broadcast 不能被單一慢連線阻塞，應採隔離、批次或有界 fan-out，並對每租戶連線數和總連線數限流。

容量模型不能只看 CPU。每個 worker 都可能有自己的 event loop、DB pool、HTTP pool、thread pool、cache 和 task backlog；四個 worker 與 autoscaling 會把這些上限乘上 process 數。要以目標吞吐、請求平均與 tail service time、下游可承受 QPS、DB connection 上限、WebSocket 長連線數、每租戶配額和容器 memory budget 反推 worker 與 pool。觀測 event-loop lag、P99、error／timeout、serialization、thread／task queue、DB／HTTP pool wait、RSS、WebSocket count、background backlog 和下游 saturation；readiness 在 drain 時應拒絕新流量，graceful shutdown 要給足 HTTP、WebSocket 和 queue worker 排空時間，autoscaling 不能只使用 CPU。

取證應先建立基準，再一次只改一個主要變因。至少應做：端到端 trace 分解 parsing／validation／middleware／route／DB／下游／serialization；event-loop lag 與 task age；thread pool queue；DB pool active／wait／transaction；同步 SDK 慢呼叫與 timeout 實驗；payload size／validation depth 負載；schema diff 與 response field audit；未授權、過期、錯 audience／scope、重放與跨租戶請求；dependency cleanup 的正常／例外／取消測試；背景工作 process kill、重試與重複投遞；WebSocket 慢 consumer、心跳 timeout 與斷線壓測；worker／pool 不同配置的容量測試；readiness／graceful drain 的滾動部署；租戶混合流量下的公平性；以及 RSS、task、connection 和 queue 的長時間 soak test。

交付可分三階段。第一階段以 feature flag 或流量限制止血：限制 payload、批次、每租戶請求／WebSocket／background 併發，修正 auth 與秘密遮罩，加入 trace、pool／task／lag 指標，停止把 request session 傳進背景 task，對慢下游啟用 timeout、cancellation、有限 retry 和 overload response。若 P99、5xx、pool wait、RSS 或跨租戶錯誤超過警戒線就回滾 flag 或降低流量。第二階段替換同步 SDK、建立 durable queue、修正 transaction／dependency cleanup、response schema、OpenAPI 與 WebSocket backpressure，通過取消、斷線、重複投遞、schema contract 和壓測後再逐步放量。第三階段才調整 worker、pool、autoscaling、cache、批次與部署 drain，固定 workload 比較容量和成本；任何新配置都保留舊版本和可回退的 deployment。

</details>

## 常見失分點

- 以為 async def、await 或增加 worker 會自動消除同步 SDK、CPU、validation 或 serialization 的阻塞。
- 直接把 ORM entity 當 response model，忽略敏感欄位、版本相容、nullable／required 與 schema drift。
- 只談 JWT 驗簽章，不檢查 issuer、audience、expiry、scope、rotation、重放、CORS／CSRF、秘密日誌與租戶授權。
- 讓 middleware 依賴註冊順序偶然決定 auth、CORS、exception、timeout 和 trace 行為，或在 response started 後寫第二個錯誤 body。
- 在 background task 或平行 coroutine 中共享 request-scoped AsyncSession，沒有 rollback、取消與 connection return 驗證。
- 把 BackgroundTasks 當成 durable queue，忽略 process crash、重複投遞、冪等、dead-letter 與 shutdown drain。
- 用無界 broadcast 或等待最慢 WebSocket，沒有 bounded queue、heartbeat、slow consumer isolation 和租戶連線配額。
- 只用 CPU 或只增加 worker 估算容量，忽略每個 worker 會複製 DB／HTTP pool、cache、task 與記憶體上限。
- 只測試 TestClient happy path，沒有 integration、schema、取消、慢下游、WebSocket、租戶隔離、壓測與部署 drain 測試。
- 一次同時修改 validation、worker、pool、cache、queue 和 middleware，導致無法歸因也無法安全回滾。

## 延伸追問

1. 如果第三方 SDK 永遠只有同步版本，你如何設計 thread pool、下游 timeout、shutdown 與 bulkhead，避免 event loop 和 thread queue 同時飽和？
2. 如果 strict validation 會拒絕現有 client 送來的數字字串，你如何以版本化 schema、警告期與 telemetry 過渡，而不犧牲資料邊界？
3. 如果通知需要「至少一次」投遞，如何用 idempotency key、outbox／queue、重試和 provider callback 處理重複與部分成功？
4. 如果 WebSocket broadcast 必須保持每租戶順序，但不同租戶流量差異很大，你如何設計 partition、queue、配額與慢客戶端策略？
5. 如果增加 worker 讓 event-loop lag 降低但資料庫 pool wait 和下游 429 上升，你會如何重新計算端到端容量與 worker／pool 配置？
6. 如果 OpenAPI schema diff 顯示 response 欄位被移除，但現有 client 沒有明確版本資訊，你會如何建立相容性證據與回滾方案？
7. 如果取消請求後資料庫 transaction 已提交但通知尚未發送，你如何定義 API 回應、重試、查詢狀態與使用者可見的一致性語意？
