# Gin API Production Incident：從 Middleware Chain、Context Reuse 到容量退化

- **Assessment ID**: `assessment.go.gin-api-production.incident.v1`
- **主要 Concept ID**: `concept.go.gin.middleware-chain`
- **次要 Concept IDs**:
  - `concept.go.gin.framework-architecture`
  - `concept.go.gin.performance-optimization`
- **對應文章**:
  - [Gin 框架基礎與核心概念](../../02_Backend_Development/Programming_Languages_and_Frameworks/Go/Frameworks/Gin/gin_framework_basics.md)
  - [Gin 中間件開發](../../02_Backend_Development/Programming_Languages_and_Frameworks/Go/Frameworks/Gin/gin_middleware_development.md)
  - [Gin 性能優化](../../02_Backend_Development/Programming_Languages_and_Frameworks/Go/Frameworks/Gin/gin_performance_best_practices.md)
- **題型**: `生產事故診斷`, `Middleware Trace`, `並發安全`, `容量與背壓`, `多租戶隔離`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 35 分鐘
- **標籤**: `Go`, `Gin`, `Middleware`, `Context`, `Concurrency`, `Rate Limiting`, `Performance`, `Multi-tenancy`
- **Learning Objective IDs**:
  - `concept.go.gin.middleware-chain/LO-1`
  - `concept.go.gin.middleware-chain/LO-2`
  - `concept.go.gin.middleware-chain/LO-3`
  - `concept.go.gin.framework-architecture/LO-1`
  - `concept.go.gin.framework-architecture/LO-2`
  - `concept.go.gin.framework-architecture/LO-3`
  - `concept.go.gin.performance-optimization/LO-1`
  - `concept.go.gin.performance-optimization/LO-2`
  - `concept.go.gin.performance-optimization/LO-3`

## 測驗目標

- 能從 middleware trace、權限結果、response write、request context 與 goroutine 行為重建 Gin API 的事故因果鏈。
- 能區分 `c.Next()`、`c.Abort()`、handler 回傳、Recovery、超時與取消在請求生命週期中的責任，避免錯誤路徑繼續執行或重複寫入回應。
- 能診斷 `gin.Context` pool reuse、跨 Goroutine 使用、共享可變狀態、資料庫連線池與無界 fan-out 造成的正確性及容量問題。
- 能設計租戶安全的 context／cache ownership、限流、timeout、backpressure、觀測指標與可回滾的修復順序。

## 問題情境與限制條件

某多租戶訂單 API 使用 Gin，部署為三個 pod。`GET /api/orders/:id` 平時 P95 約 90 ms，促銷流量上升後 P95 增至 2.4 秒、P99 超過 8 秒，5xx 從 0.1% 上升到 4%，並有租戶回報偶爾收到其他租戶的訂單摘要。資料庫 audit log 沒有明顯的跨租戶 SQL 寫入，但 API response 與 audit event 的 tenant 欄位出現過不一致。

目前註冊與執行路徑如下：

- 全局 middleware 依序註冊 `RequestID`、`Logger`、`Recovery`；`Auth` 只掛在部分 `/api` route group，另一些 route 在 `Use(Auth)` 之前已經註冊。`Tenant` middleware 依賴 `Auth` 放入的 user claims，但沒有在缺少 claims 時明確 `Abort`。
- `RateLimit` 放在 `Tenant` 之後，只以 pod-local IP counter 計算；當 handler 啟動大量下游查詢時，限流數字仍低於資料庫連線池能承受的實際 in-flight 數量。資料庫 client 使用共享連線池，但沒有依 route、租戶或下游設定明確的併發上限。
- `Auth` 驗證失敗時寫入 401，卻忘記呼叫 `c.Abort()`；某個 error middleware 在 `c.Next()` 後又依 `c.Errors` 寫入 JSON，導致部分 response 已寫出後再次寫入。
- Handler 為了非同步寫 audit 與更新摘要 cache，直接把 `*gin.Context` 傳給 Goroutine。Goroutine 可能在 handler 返回後才讀取 `c.Keys`、`c.Request` 或 tenant 欄位；同時 cache key 只有 order ID，沒有 tenant、授權範圍或資料版本。
- 某段慢查詢使用 `context.Background()` 建立資料庫操作，沒有沿用 `c.Request.Context()` 的取消與 deadline。另一段程式為每個推薦項目啟動 Goroutine，沒有 semaphore、批次上限或下游 timeout。
- 觀測到 goroutine 數、資料庫等待時間、HTTP client active connections 與 RSS 隨流量一起上升；CPU 並未持續滿載，但部分 pod 的 scheduler latency 與 GC pause 變異變大。團隊提出「增加 pod、把所有工作丟到 Goroutine、關閉 Recovery 以便看見原始 panic」作為直接修復。

限制條件：不能犧牲租戶隔離、訂單查詢正確性與取消語意；不能只靠增加 pod、只提高連線池或重啟程序；必須先止血，再提出可觀測、可測試、可分階段且可回滾的修復。

## 作答要求

1. **重建 Middleware Chain**：依註冊範圍與 `c.Next()`／`c.Abort()` 推導 RequestID、Logger、Recovery、Auth、Tenant、RateLimit、handler 與 error path 的前後順序；指出哪些 route 可能未受保護，以及哪些結論要用 trace 或測試確認。
2. **建立事故因果鏈**：連結 middleware 短路失敗、重複寫入、`gin.Context` pool reuse、跨 Goroutine 存取、cache key、DB／HTTP connection pool、無界 Goroutine、request cancellation 與 P95／P99／5xx／租戶錯誤。
3. **設計取證計畫**：至少列出十二項證據或實驗，涵蓋 middleware execution trace、route registration、response writer 狀態、race detector、goroutine dump、request／DB／HTTP trace、connection pool、rate-limit counter、cache collision、request cancellation、GC／RSS 與租戶隔離測試；說明每項如何支持或排除假設。
4. **修正 Context 與並發生命週期**：說明何時可以讀取 Gin Context、何時要使用 `c.Copy()`，以及為什麼 copy 不代表可以安全地寫 response 或忽略 request cancellation；設計 immutable audit event、context deadline、Goroutine ownership 與 graceful shutdown。
5. **設計容量與背壓**：為每 request、每租戶、每 route、每 pod 與下游連線池設定合理的 in-flight 上限、semaphore、queue、timeout、cancellation、overload response 與有限 retry，並說明 pod 數、worker 數與連線池的容量乘法。
6. **修正租戶隔離與錯誤語意**：設計 tenant-aware cache key／ownership、401／403／429／5xx 的穩定契約、Recovery 與 error middleware 的責任，處理 response 已寫出、panic、client disconnect 與部分完成的 audit／cache 副作用。
7. **分階段交付**：至少提出三個 rollout 階段，每階段列出成功指標、警戒線、rollback 條件，以及至少一個慢資料庫、慢下游、client cancellation、跨租戶交錯請求或 race／panic 注入測試。

## 期待證據

- 能明確指出 Gin middleware 是否呼叫 `c.Next()` 會決定後續 chain 與後置程式碼的執行；`c.Abort()` 必須與錯誤 response 一起使用，否則 handler 可能繼續執行。
- 能以 route registration、group middleware 與 execution trace 證明哪些 endpoint 缺少 Auth／Tenant，而不是只看 middleware 函數本身存在。
- 能說明 `gin.Context` 可能從 pool 重用；handler 返回後不能繼續使用原始 context，跨 Goroutine 應只傳遞必要且不可變的值，必要時使用 `c.Copy()`，但不得用 copy 寫 response。
- 能把 `c.Request.Context()` 的 deadline／cancel 傳遞到 DB 與 HTTP client，並處理取消後 Goroutine、audit、cache 與下游副作用的 ownership。
- 能以 race detector、goroutine dump、pprof／trace、DB wait、HTTP pool、queue age、cache hit／collision、request trace 與 response writer 指標區分 race、阻塞、pool exhaustion、無界 fan-out 與錯誤重複寫入。
- 能指出 URL 或 order ID 單獨作為 cache key 不能保證多租戶隔離；key 或 cache ownership 必須包含 tenant、授權範圍、資料版本或等價隔離條件，並有交錯租戶測試。
- 能提出有界的 in-flight、semaphore、queue、timeout、cancellation、有限 retry 與 overload response，並說明 pod、Goroutine、DB／HTTP pool 與 rate-limit 的總容量關係。
- 能處理 Recovery、error middleware、headers 已寫出、panic 與 client disconnect 的邊界；不應關閉 Recovery 取代安全的錯誤記錄，也不應讓未知例外原樣回傳。
- 能把修復連到 P50／P95／P99、5xx／401／403／429、goroutine、race、DB／HTTP pool、queue age、cache collision、RSS／GC、租戶正確性與 rollback time。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議增加 pod、提高連線池、把所有工作丟到 Goroutine 或關閉 Recovery，忽略 middleware、Context reuse、租戶隔離與容量上限。 |
| 1 | 能列出 Gin、middleware、Goroutine 或 cache 的部分名詞，但無法重建執行順序，也沒有可驗證的因果鏈。 |
| 2 | 能指出 `Abort`、Context 跨 Goroutine、N+1／慢查詢或 pool 壓力的部分問題，提出大致可行修復，但遺漏至少兩個核心面向或沒有量化驗證。 |
| 3 | 能完成 middleware trace 與事故診斷，正確處理 Context／取消、租戶 cache、並發上限、錯誤邊界與分階段 rollout。 |
| 4 | 除上述內容外，能處理 route registration drift、copy 與 response write 的邊界、部分副作用、pod／pool 容量乘法、race／GC 證據與可逆部署的 trade-off。 |

### 通過標準

總分達 **3/4 分**才通過；Middleware／error flow、Context／concurrency、capacity／backpressure、tenant／response safety 四個核心面向均不得低於 2 分，且必須提出至少一個可執行的 rollback 條件。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先不要從「增加 pod」開始。第一步是把 route registration 與實際 execution trace 固定下來：確認 Auth／Tenant 是全局、group 或單一路由 middleware，記錄每層進入、`c.Next()` 前後、Abort 原因、handler、response status、bytes 與 request ID。若 Auth 寫 401 卻沒有 Abort，後續 handler 仍可能執行並二次寫入；如果 error middleware 在 headers 已送出後再次寫 body，應記錄並交由單一錯誤邊界收尾，而不是讓多個 middleware 競爭 response。

`gin.Context` 的 pool reuse 可以解釋為何跨 request 的 audit 或 cache 欄位不一致，但必須用 race detector、交錯租戶壓測、goroutine dump、context identity／request ID 與 cache collision log 證明。handler 返回後不能使用原始 `*gin.Context`；跨 Goroutine 只應傳遞必要的不可變 audit event 與 `c.Request.Context()` 的衍生 context。`c.Copy()` 是避免直接讀寫原始 context 的工具，但 copy 仍不代表可以在背景 Goroutine 寫 HTTP response，也不能延長 request 的 deadline。背景工作若必須在 request 結束後繼續，應改成明確的 queue／worker ownership，使用獨立的 shutdown、重試與冪等語意。

租戶安全不能只依賴 SQL audit。order cache 至少要納入 tenant、授權範圍與資料版本，或改由 tenant-scoped cache store 管理；要用兩個租戶交錯請求相同 order ID、不同權限與 cache hit／miss 的測試驗證。Tenant middleware 在缺少或不可信 claims 時應回傳穩定的 401／403 並 Abort；認證成功不代表 resource authorization 成功，handler／service 仍需在資料查詢邊界套用租戶條件。

容量上要把請求、租戶、pod、資料庫連線池與下游 HTTP pool 一起看。每 request 的推薦項目應使用有界 semaphore 或 batch，並從 `c.Request.Context()` 繼承 deadline；DB／HTTP 呼叫要在取消時停止，無法立即替換的同步或昂貴工作放進有界 worker pool。限流不能只看 pod-local IP counter，還要考慮多 pod 聚合、租戶公平性、queue age、下游 saturation 與 overload response。增加 pod 會乘上每 pod 的 Goroutine、connection pool、cache 與 background concurrency，可能讓資料庫更快耗盡。

取證至少應包含：route／group middleware 清單；每層 request／response trace；`c.IsAborted()`、`Writer.Written()`、status／bytes；`go test -race`；goroutine dump 與 goroutine age；pprof／runtime trace；DB pool in-use／wait／query latency；HTTP client active／idle／wait；rate-limit counter 與 queue age；cache key／tenant collision；request cancellation／deadline propagation；GC／RSS／allocation；跨租戶交錯請求與 panic／慢下游故障注入。這些資料可區分順序錯誤、race、阻塞、無界 fan-out、pool exhaustion 與 allocator／GC 變異。

交付可分三階段。第一階段以 feature flag 停用不安全的背景 cache／audit 路徑、補上 Auth／Tenant Abort、單一錯誤回應、request ID 與關鍵指標；跨租戶命中、5xx、P99、queue age 或 DB wait 超過警戒線即回滾。第二階段移除原始 Context 跨 Goroutine、傳遞必要 immutable event、接入 request deadline，為 DB／HTTP／推薦 fan-out 加上 semaphore、timeout、cancellation 與有限 retry，通過 race、慢下游、client cancel 與負載測試。第三階段再調整多 pod 限流、worker／pool 上限、cache policy 與 server timeout，以固定 workload 比較 throughput、tail latency、pool saturation、租戶正確性、RSS 與 rollback time；每次只改一個主要容量變因。

</details>

## 常見失分點

- 看到 P99 上升就只增加 pod、連線池或 Goroutine，沒有先建立 middleware trace 與下游容量邊界。
- 把 `c.Next()` 當成可有可無，或在寫入 401／403 後忘記 `c.Abort()`。
- 把原始 `gin.Context` 傳進 Goroutine，或以 `c.Copy()` 為理由在 request 結束後繼續寫 response。
- 忽略 `c.Request.Context()` 的取消與 deadline，讓 DB、HTTP client 與背景工作在 client 已取消後繼續消耗資源。
- 只用 order ID 或 URL 作為 cache key，沒有把 tenant、授權範圍與資料版本納入隔離。
- 只看資料庫 audit 就宣稱沒有跨租戶問題，沒有做 cache／response 層的交錯租戶測試。
- 關閉 Recovery 來「看見原始 panic」，卻沒有安全記錄、穩定錯誤契約與 rollback 計畫。

## 延伸追問

1. 如果 `c.Copy()` 後的背景 audit 必須跨越 request deadline，你會如何設計獨立 queue、事件 schema、冪等 key、租戶驗證與 graceful shutdown？
2. 如果三個 pod 的 rate limiter 都正常，但總體資料庫 wait 持續上升，你會如何估算 pod、worker、DB pool 與下游 fan-out 的容量乘法？
3. 如果移除跨 Goroutine Context 後租戶欄位不再錯亂，但 P99 仍高，你會如何區分 DB pool exhaustion、慢下游、JSON serialization 與 middleware 後置成本？
4. 如果 panic 發生在 response headers 已寫出之後，Recovery、error middleware 與 client 端應分別採取什麼行為？
5. 如果 cache 必須支援同一 order 在不同權限下呈現不同欄位，你會如何設計 key、資料版本、eviction 與權限變更後的失效策略？
