# C# Resource Boundary Incident：從 Middleware、DbContext 到 Dispose 生命週期

- **Assessment ID**: `assessment.csharp.resource-boundary.incident.v1`
- **主要 Concept ID**: `concept.csharp.ef-core.dbcontext-lifetime`
- **次要 Concept IDs**:
  - `concept.csharp.aspnet-core.middleware-pipeline`
  - `concept.csharp.clr.disposable-resource-management`
- **對應文章**:
  - [ASP.NET Core 中介軟體管線](../../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Frameworks/ASP.NET_Core/middleware_pipeline.md)
  - [Entity Framework Core DbContext 生命週期](../../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Frameworks/EF_Core/dbcontext_lifecycle.md)
  - [IDisposable 與資源管理模式](../../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/CLR/idisposable_pattern.md)
- **題型**: `生產事故診斷`, `Middleware Trace`, `資源生命週期`, `容量與連線池`, `部署取捨`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 35 分鐘
- **標籤**: `C#`, `.NET`, `ASP.NET Core`, `Middleware`, `EF Core`, `DbContext`, `IDisposable`, `Connection Pool`, `Resource Lifecycle`
- **Learning Objective IDs**:
  - `concept.csharp.aspnet-core.middleware-pipeline/LO-1`
  - `concept.csharp.aspnet-core.middleware-pipeline/LO-2`
  - `concept.csharp.aspnet-core.middleware-pipeline/LO-3`
  - `concept.csharp.ef-core.dbcontext-lifetime/LO-1`
  - `concept.csharp.ef-core.dbcontext-lifetime/LO-2`
  - `concept.csharp.ef-core.dbcontext-lifetime/LO-3`
  - `concept.csharp.clr.disposable-resource-management/LO-1`
  - `concept.csharp.clr.disposable-resource-management/LO-2`
  - `concept.csharp.clr.disposable-resource-management/LO-3`

## 測驗目標

- 能從 middleware execution trace、短路結果與 response state 重建請求是否進入 endpoint，以及例外是否被正確收斂。
- 能區分 request-scoped `DbContext`、`AddDbContextPool` 重用的 context instance、ADO.NET connection pool 與 `IDbContextFactory` 所建立的獨立工作單位。
- 能診斷 singleton 捕獲 scoped `DbContext`、background service 共用 context、平行操作同一 context 與長時間持有 unit of work 所造成的正確性和容量問題。
- 能依資源所有權選擇 `IDisposable`、`IAsyncDisposable`、`using` 或 `await using`，並處理 reader、stream、transaction 與 scope 的釋放順序。
- 能提出先止血、再修正 ownership、最後調校 pool 與效能的可觀測、可測試且可回滾方案。

## 問題情境與限制條件

某 ASP.NET Core 訂單與報表 API 最近把資料查詢從單一 endpoint 擴展成同步查詢、背景匯出與長時間串流三種路徑。流量增加後，`GET /orders` 的 P99 從 180 ms 上升至 4.2 秒，`/exports` 偶爾回傳 503，資料庫連線等待時間與 process handle 數持續上升；重啟 pod 後症狀會暫時消失。部分請求在 client 已取消後仍可觀察到 SQL 執行與匯出工作。

目前程式與部署有以下狀況：

- 公開 API 的 pipeline 在不同 branch 使用不同註冊順序。某個 public branch 的例外處理只掛在 endpoint mapping 之後，另一個 branch 的 tenant middleware 在寫入 403 後仍呼叫下一層；request logging 則掛在會短路的 middleware 之後，因此 trace 缺少一部分失敗請求。團隊無法只從註冊檔案判斷每個 endpoint 的實際執行順序。
- `OrderQueryService` 被註冊為 singleton，但在 scope validation 關閉的環境中捕獲了 scoped `AppDbContext`。報表背景服務建立一個 scope 後，把同一個 context 傳給多個平行工作；偶爾出現 concurrent operation 例外，另一些工作則長時間占用同一個 unit of work。
- Web request 使用 `AddDbContextPool`，背景匯出又改用 `IDbContextFactory`。團隊把 `DbContext` pool 和資料庫 provider 的 connection pool 當成同一個容量旋鈕，想同時提高兩者上限；目前沒有記錄 context 建立／歸還、連線取得等待、實際查詢時間與 pool saturation 的時間線。
- 匯出路徑把 `DbDataReader`、response stream、transaction 與建立的 service scope 分散在多個 helper 中。有些正常路徑未使用 `await using`，取消或例外路徑也沒有確定釋放；長時間串流使 connection、reader 與 response buffer 的存活時間超出預期。
- 查詢沒有一致地傳遞 request `CancellationToken`，background work 也沒有清楚區分「隨請求取消」與「由佇列接手後獨立完成」。連線 pool wait、SQL timeout、GC allocation rate、RSS 和 active export 數都隨流量上升，但資料庫 CPU 未持續滿載。

你是當值 senior engineer。限制如下：不能只增加 pod、只提高任何一種 pool、把所有背景工作改成 fire-and-forget，或用重啟掩蓋 ownership 問題；不能犧牲租戶隔離、交易正確性、client cancellation 與可觀測性。必須先止血，再提出能用壓測和故障注入驗證的分階段修復。

## 作答要求

1. **重建 Middleware Chain**：以 execution trace、route／branch mapping 與 response state 推導例外處理、logging、routing、authentication、authorization、tenant check、endpoint 與後置程式的順序；指出短路後哪些 middleware 不應再執行，以及如何避免 response 已開始後重複寫入。
2. **建立資源因果鏈**：連結 scoped context 被 singleton 捕獲、同一 `DbContext` 的平行操作、長時間 query／stream、未釋放 reader／scope、connection pool wait、P99、503 與 client cancellation；區分已知證據和待驗證假設。
3. **區分三種容量邊界**：比較一般 `AddDbContext`、`AddDbContextPool`、`IDbContextFactory` 的 ownership 與使用時機，並明確說明 DbContext pooling 不等於 ADO.NET connection pooling；為 request、background worker、context pool 與 connection pool 設計可觀測上限。
4. **修正 Scope 與並發模型**：說明如何修正 singleton／scoped graph、如何由 `BackgroundService` 建立和釋放 scope，以及為何每個平行工作需要自己的 context／unit of work；禁止以 lock 或共用 context 掩蓋非 thread-safe 使用。
5. **修正 Dispose 邊界**：釐清 `IDisposable`、`IAsyncDisposable`、`using`、`await using`、reader、stream、transaction 與 scope 的所有權和釋放順序，並處理取消、例外、部分匯出與 client disconnect。
6. **設計取證計畫**：至少列出十二項證據或實驗，涵蓋 middleware trace、`Response.HasStarted`／status、scope validation、context instance identity、active／disposed 次數、EF concurrent operation、SQL／connection pool wait、reader／stream lifetime、cancellation、GC／RSS、handle 數與長短請求壓測；說明每項如何支持或排除假設。
7. **分階段交付**：至少提出三個 rollout 階段；每階段列出成功指標、警戒線、rollback 條件，並包含慢資料庫、client cancellation、背景 shutdown、平行 context 與未釋放 stream 的測試。

## 期待證據

- 能以實際 route／branch registration 和帶 request ID 的 trace 說明 middleware 的 onion model、短路和後置程式，而不是只背出「順序很重要」。例外邊界應在可能拋例外的下游之前，短路 middleware 寫完 401／403 後不能再呼叫下一層。
- 能指出 `DbContext` 通常是 request-scoped、不是 thread-safe；singleton 不應捕獲它，background service 必須每次工作建立 scope，且平行工作不可共用同一 context。
- 能說明 `AddDbContextPool` 只重用 context instance；它與 provider／ADO.NET 的 connection pool 是不同資源，`IDbContextFactory` 產生的是可獨立管理的工作單位，不能用任一 pool 上限推論另一個 pool 尚有容量。
- 能用 context identity、created／returned／disposed、SQL duration、connection acquire wait、pool in-use、query timeout 與 request trace 對齊症狀；若看到 concurrent operation 例外，應把它當成 ownership／並發違規的證據，而不是單純提高 pool。
- 能說明 request-scoped 資源通常由 scope 結束釋放；factory 或手動建立的 context、reader、stream、transaction 和 background scope 則必須由明確 owner 在正常、取消和例外路徑釋放。
- 能把 request cancellation 傳給 EF／provider 和串流操作；若工作要在 request 結束後繼續，應交給有明確 queue、獨立取消、冪等與 graceful shutdown 語意的 background owner，而不是保留 request scope。
- 能把修復連到 middleware short-circuit、P50／P99、503、SQL latency、connection wait、context concurrency、active exports、dispose lag、handle、GC／RSS 與 rollback time。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議增加 pod、提高 context／connection pool 或重啟，並繼續共用 scoped `DbContext`、忽略 dispose 和 cancellation。 |
| 1 | 能列出 middleware、DbContext 或 IDisposable 的部分名詞，但無法重建短路、ownership、pool 邊界與事故因果鏈。 |
| 2 | 能指出 singleton capture、context concurrency、未釋放資源或 pool wait 的部分問題，提出大致可行修復，但遺漏至少兩個核心面向或沒有可量化證據。 |
| 3 | 能完成 middleware trace 與資源診斷，正確區分 context／connection pool，修正 scope、平行 context、async dispose、取消與分階段 rollout。 |
| 4 | 除上述內容外，能處理 branch registration drift、response 已開始、pool 設定的容量乘法、部分匯出、background handoff、dispose 競態與可逆部署的 trade-off。 |

### 通過標準

總分達 **3/4 分**才通過；Middleware／short-circuit、DbContext ownership／concurrency、dispose／cancellation、pool／capacity 四個核心面向均不得低於 2 分，且必須提出至少一個可執行的 rollback 條件。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先固定每個 endpoint 的實際 middleware trace：記錄 route branch、request ID、各 middleware 進入與離開、是否呼叫下一層、`Response.HasStarted`、status、bytes 和例外。例外處理必須位在會拋例外的 downstream 之前；tenant 或 authorization 失敗寫入 401／403 後應短路，不應再進 endpoint。若 response 已開始，後續錯誤邊界不能假設可以安全改寫完整 JSON，應記錄 request ID 並依既定契約結束連線或保留已送出的 response。

主要資源問題是 ownership 被混在一起：scoped `DbContext` 不應由 singleton 保存，也不能被多個平行工作共用。HTTP request 可使用 request scope 的單一 context 完成一個 unit of work；背景服務則每次工作建立自己的 scope，或使用 `IDbContextFactory` 為每個平行工作建立獨立 context，完成後釋放。若同一批工作需要平行查詢，應限制 worker 數和 transaction 範圍，而不是把同一 context 傳給所有 task。

`AddDbContext`、`AddDbContextPool`、`IDbContextFactory` 和 ADO.NET connection pool 解決的是不同邊界。context pool 主要重用 context instance，connection pool 管理 provider connection；提高其中一個不會自動增加另一個可用容量，也不能消除 query、transaction 或下游資料庫的瓶頸。應分別量測 context 建立／歸還、connection acquire wait、in-use／idle、SQL duration、timeout 和每個 pod／worker 的並發乘法，再決定是否調整上限。

每個持有 reader、stream、transaction 或手動 scope 的元件都要有明確 owner。正常、取消和例外路徑都要執行對應的同步或非同步 dispose；非同步釋放不可用 fire-and-forget 掩蓋。長時間 response stream 應在明確的 cancellation 和 deadline 下持有必要資源，若要把匯出交給背景工作，就先完成資料與權限驗證、建立獨立 job／scope 和冪等輸出，再讓 request scope 結束。

取證應包含：每個 branch 的 middleware registration；進出 trace 與 `HasStarted`／status；啟用 `ValidateScopes` 的整合測試；service graph；context instance identity、created／returned／disposed 和同時 active 數；EF concurrent operation log；SQL duration／timeout；connection pool in-use／wait；reader／stream／scope lifetime；request cancellation 到 provider 的 trace；active export、queue age、handle、GC／RSS 和 dump；慢資料庫、client disconnect、背景 shutdown、平行 worker 與故意漏 dispose 的故障注入。這些資料可以區分順序錯誤、scope capture、context race、connection pool exhaustion、未釋放資源與單純慢查詢。

交付可分三階段。第一階段先在 feature flag 下補外層例外邊界、短路語意、request／DB timeout、cancellation、active resource 和 pool wait 指標，暫時限制匯出並關閉有風險的無界平行路徑；P99、503、connection wait 或跨租戶錯誤超過警戒線即回滾。第二階段修正 DI graph、background scope、每 worker 的 context、reader／stream／transaction 的 `using`／`await using` 與 shutdown，通過 scope validation、慢 DB、client cancel 和並行測試。第三階段才依固定 workload 分別調整 context pool、connection pool、worker concurrency、批次和串流策略，觀察 throughput、tail latency、dispose lag、handle、GC／RSS 與資料庫壓力，每次只變更一個主要容量因素。

</details>

## 常見失分點

- 把 `DbContext` pooling 和資料庫 connection pooling 當成同一件事，或以提高任一上限取代 ownership 診斷。
- 將 scoped `DbContext` 注入 singleton，或在 background service 建立一個 context 後跨 task 共用。
- 看到 503 就只調高 pool、增加 pod 或重啟，沒有量測 connection wait、query duration、active context 和 dispose lag。
- 寫入 401／403 後仍呼叫下一層，或把例外處理放在可能拋例外的 endpoint 之後，忽略 response 已開始的邊界。
- 只在正常路徑 dispose reader／stream／scope，漏掉取消、例外、client disconnect 和部分匯出。
- 把 request scope 保存到背景工作，或把 fire-and-forget 當成可靠的 queue 和 graceful shutdown。

## 延伸追問

1. 如果 context pool wait 很低但 connection pool wait 很高，你會如何區分 SQL 慢、connection leak、每 pod pool 乘法與資料庫端容量不足？
2. 如果改成 `IDbContextFactory` 後 concurrent operation 消失但 P99 變差，你會如何評估 context 建立、查詢並發、tracking、connection pool 與資料庫鎖等待的 trade-off？
3. 如果 client 在串流一半斷線，哪些資源應立即取消，哪些匯出工作可以轉交背景 queue？轉交時如何保證租戶權限、冪等與清理？
4. 如果 exception middleware 在 response headers 已送出後收到例外，server log、client 契約、telemetry 和 rollback 應如何處理？
5. 如果 active context 數穩定但 handle 和 RSS 持續上升，你會如何從 reader／stream、native buffer、GC heap、socket 與 scope disposal trace 排查？
