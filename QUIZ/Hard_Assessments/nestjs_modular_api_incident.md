# NestJS Modular API Incident：從 Module Graph、Provider Scope 到 Exception Filter

- **Assessment ID**: `assessment.nodejs.nestjs-modular-api.incident.v1`
- **主要 Concept ID**: `concept.nodejs.nestjs.dependency-injection-modules`
- **次要 Concept IDs**:
  - `concept.nodejs.nestjs.architecture`
  - `concept.nodejs.nestjs.providers-services`
  - `concept.nodejs.nestjs.request-lifecycle`
  - `concept.nodejs.nestjs.exception-handling`
- **對應文章**:
  - [NestJS 架構與設計哲學](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/NestJS/nestjs_architecture.md)
  - [NestJS 請求生命週期組件](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/NestJS/middleware_guards_interceptors_pipes.md)
  - [NestJS 依賴注入與模組系統](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/NestJS/dependency_injection_modules.md)
  - [NestJS Providers 與 Services](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/NestJS/providers_and_services.md)
  - [NestJS 異常處理與過濾器](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/NestJS/exception_handling.md)
- **題型**: `生產事故診斷`, `Module Graph`, `DI Scope`, `請求生命週期`, `多租戶隔離`, `錯誤邊界`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 35 分鐘
- **標籤**: `Node.js`, `NestJS`, `Dependency Injection`, `Providers`, `Request Lifecycle`, `Exception Filters`, `Multi-tenancy`
- **Learning Objective IDs**:
  - `concept.nodejs.nestjs.dependency-injection-modules/LO-1`
  - `concept.nodejs.nestjs.dependency-injection-modules/LO-2`
  - `concept.nodejs.nestjs.dependency-injection-modules/LO-3`
  - `concept.nodejs.nestjs.architecture/LO-1`
  - `concept.nodejs.nestjs.architecture/LO-2`
  - `concept.nodejs.nestjs.architecture/LO-3`
  - `concept.nodejs.nestjs.providers-services/LO-1`
  - `concept.nodejs.nestjs.providers-services/LO-2`
  - `concept.nodejs.nestjs.providers-services/LO-3`
  - `concept.nodejs.nestjs.request-lifecycle/LO-1`
  - `concept.nodejs.nestjs.request-lifecycle/LO-2`
  - `concept.nodejs.nestjs.request-lifecycle/LO-3`
  - `concept.nodejs.nestjs.exception-handling/LO-1`
  - `concept.nodejs.nestjs.exception-handling/LO-2`
  - `concept.nodejs.nestjs.exception-handling/LO-3`

## 測驗目標

- 能從 NestJS module graph、provider registration、scope、request lifecycle 與 error response 建立可驗證的事故因果鏈。
- 能區分重複 provider instance、request-scoped scope bubbling、業務服務責任過大、guard／pipe／interceptor 順序錯誤與 exception filter 遺失造成的問題。
- 能在多租戶隔離、資料正確性與效能限制下，設計穩定的 module boundary、provider ownership、cache key、request context 與錯誤回應。
- 能用 module graph inspection、DI bootstrap log、request trace、scope／instance metrics、錯誤樣本與分階段 rollout 驗證修復。

## 問題情境與限制條件

某多租戶訂單 API 使用 NestJS Express adapter，部署為三個 pod。每個 request 必須先驗證使用者，再取得 tenant context，最後執行訂單查詢與付款預檢。一次將舊 Express route 遷移到 NestJS module 後，P95 從 180 ms 上升到 1.9 秒，5xx 從 0.2% 上升到 3.8%；部分租戶回報偶爾看到其他租戶的快取摘要，但資料庫 audit log 中沒有跨租戶 SQL 寫入。

目前架構與觀測資料如下：

- `OrdersModule` imports `TenantModule`、`BillingModule` 與 `PersistenceModule`。為了讓測試方便，`OrdersService` 同時註冊在 `OrdersModule.providers` 與 `AppModule.providers`；`BillingClient` 的 async `useFactory` 也在兩個 feature module 各自註冊，導致每個 module context 可能建立不同 instance 與連線池。
- `TenantContext` 使用 request scope，`OrdersService`、`OrdersController` 與自訂 `CacheInterceptor` 透過 constructor 依賴它；在一次發布後，原本的 singleton provider graph 出現 scope bubbling，request-scoped instance 數量與 bootstrap／request allocation 同步上升。另一個 singleton `SummaryCache` 仍把最近一次的 tenant id 與可變結果存在屬性中。
- `CacheInterceptor` 以 URL 作為 key，沒有把 tenant id、使用者權限或資料版本納入 key；它在 tenant guard 之後執行，但 cache lookup 使用的 request context 來源不一致。團隊建議「把所有 provider 改成 request scope」作為直接修復。
- 認證以 global guard 執行，tenant guard 只套在 `OrdersController`；global `ValidationPipe` 沒有在所有 adapter 啟用相同的 transform／whitelist 設定。audit logging interceptor 在 response path 讀取 tenant context，部分錯誤路徑則在 context 建立前就短路。
- 自訂 `@Catch(HttpException)` filter 只處理 Nest HTTP exceptions；`BillingClient` timeout 會丟出一般 `Error`，另一個 `@Catch()` filter 則直接把 `exception.message` 放入 response，曾暴露下游 URL 與內部租戶識別資訊。部分 handler 在 response headers 已送出後又嘗試改寫錯誤 body。
- `OrdersService` 同時負責輸入協調、資料庫查詢、付款預檢、快取、事件發布與錯誤轉換；單元測試透過 `overrideProvider` 只建立一份 fake provider，因此沒有捕捉 production 中重複 registration、scope、module export 或 filter ordering 的問題。
- 限制是不能犧牲租戶隔離、訂單資料正確性與付款語意，不能只增加 pod 或把所有 provider 改成 request scope，也不能以回傳 HTTP 200 或隱藏所有例外作為錯誤處理；必須先安全止血，再提出可觀測、可分階段且可回滾的修復。

你是當值 senior engineer。請先標出已知證據、待驗證假設與可能只是測試環境差異的現象，再提出修復順序。

## 作答要求

1. **重建 Module Graph 與 DI 因果鏈**：說明 imports、providers、exports、custom token 與重複 registration 如何影響 provider 可見性、instance 數量、連線池與測試／production 差異；指出哪些結論必須透過 runtime graph 或 bootstrap log 驗證。
2. **分析 Provider Ownership 與 Scope**：比較 singleton、request 與 transient scope；說明 request-scoped `TenantContext` 如何造成 scope bubbling，找出 `SummaryCache` 的共享可變狀態問題，並設計資料庫／付款 client、transaction context、cache 與 tenant state 的 ownership。
3. **追蹤完整 Request Lifecycle**：依序分析 middleware、global／controller／route guards、interceptors、pipes、controller／service、response interceptor 與 exception filters；指出認證、tenant binding、輸入驗證、快取、audit 與錯誤應放在哪個邊界。
4. **修正 Service 分層與模組邊界**：將訂單協調、repository、付款 client、cache、event publisher 與錯誤轉換拆成可測試的 provider contract；說明哪些 provider 應 export、哪些不應暴露，並處理真正存在的循環依賴而非到處使用 `forwardRef`。
5. **設計 Exception Filter 與錯誤語意**：區分 validation、auth／tenant denial、domain conflict、下游 timeout 與未知 programmer error；設計安全 status／error code／correlation ID／logging，處理 `headersSent`、部分 response 與敏感資訊。
6. **設計取證計畫**：列出至少十二項證據或實驗，至少涵蓋 module／DI graph、provider constructor／instance identity、scope metrics、DB／HTTP connection pool、request trace、lifecycle ordering、cache key／hit、tenant isolation、filter path、exception samples、test／production graph diff 與 memory／latency；說明每項如何支持或排除假設。
7. **分階段交付與驗證**：給出至少三階段的改動順序，每階段列出成功指標、警戒線、rollback 條件，以及至少一項租戶隔離、DI scope、慢付款下游、錯誤注入或 module bootstrap 測試。

## 期待證據

- 能指出 provider 在多個 module 的 `providers` 中重複註冊，可能產生不同 instance；必須用 module graph、constructor log、instance identity、connection pool 與 lifecycle hook 證明，而不能只看 class 名稱。
- 能說明 `exports`／`imports` 控制 provider 可見性，`useClass`／`useFactory`／token 影響實作與資源建立；`forwardRef` 只處理真實循環依賴，不能代替清楚的 module boundary。
- 能指出 request-scoped dependency 會讓依賴它的 controller／provider 出現 scope bubbling，增加每 request 建立成本；不能因此把所有無狀態 client、logger 或 cache 都改成 request scope。
- 能指出 tenant id、授權範圍、資料版本或等價隔離條件必須進入 cache key／ownership；URL-only cache 不能證明多租戶安全，即使 SQL audit 沒看到跨租戶寫入。
- 能依實際註冊範圍追蹤 middleware、guards、interceptors、pipes、handler 與 filters，區分「認證成功」和「tenant context 已建立」，並以 trace／測試驗證順序。
- 能區分預期的 `HttpException`、下游 timeout／domain error 與未知 programmer error；filter 要在 server log 保留 correlation context，對 client 回傳穩定且不洩漏內部資料的錯誤契約。
- 能處理 response headers 已送出、例外重複寫入、取消／timeout、重試與付款副作用的邊界，不以 HTTP 200 隱藏失敗，也不把所有錯誤都當成可重試。
- 能把修復連到 P50／P95／P99、5xx、provider instance／scope 數量、DB／HTTP connection pool、cache hit／tenant collision、filter coverage、bootstrap time、RSS 與 rollback time。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議增加 pod、把所有 provider 改成 request scope、使用 `forwardRef` 或回傳 200，忽略 module graph、租戶隔離與錯誤語意，且沒有證據。 |
| 1 | 能列出 Module、Provider、Guard、Pipe 或 Filter 的部分名詞，但無法重建 lifecycle／scope 因果鏈，也未處理 production 與測試差異。 |
| 2 | 能指出重複 provider、cache key、request scope 或 filter 的部分問題，提出大致可行修復，但遺漏至少兩個核心面向或缺少量化驗證。 |
| 3 | 能完成 module／DI graph 診斷，正確設計 provider ownership、scope、tenant-safe cache、request lifecycle、exception filter 與分階段 rollout。 |
| 4 | 除上述內容外，能處理 scope bubbling 的容量代價、async factory／connection pool 重複、headers 已送出、部分付款副作用、測試／production graph drift 與可逆部署的 trade-off。 |

### 通過標準

總分達 **3/4 分**才通過；Module／DI graph、Provider scope／ownership、Request lifecycle、Exception／tenant safety 四個核心面向均不得低於 2 分，且必須提出至少一個可執行的 rollback 條件。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先把 P95／P99 拆成 request queue、provider construction、guard／pipe／interceptor time、資料庫／付款下游、cache hit／miss、response serialization 與 exception path。已知 active provider scope instance 和 latency 同步增加，支持 request-scoped graph 擴大；但要用 module graph、constructor／lifecycle log、trace 和 connection pool 指標確認，而不能只因看到 `Scope.REQUEST` 就把所有延遲歸因於它。

`OrdersService` 和 `BillingClient` 在多個 module 重複註冊，可能各自形成 provider instance；若 async factory 會建立 connection pool，就會放大連線、啟動時間與資源使用。應由具明確 ownership 的 `PersistenceModule`／`BillingModule` 建立 client，透過 `exports` 暴露穩定 token，feature module 只 `imports` 並注入；只有真的需要循環依賴才用 `forwardRef`，更好的長期方案通常是抽出共同抽象或反轉依賴。測試要檢查 production module graph，而不只是在 `TestingModule` 中 override 一個 token。

`TenantContext` 可以是 request-scoped，但不要把 request-specific state 寫進 default singleton 的 `SummaryCache` 或其他共享 service。若 request-scoped provider 被 singleton consumer 依賴，Nest 可能讓依賴鏈 scope bubbling，導致 controller／service 每 request 建立；無狀態 logger、DB／HTTP connection pool 與 immutable config 應保持 singleton，transaction／unit of work、tenant context 與 request-local cache 才使用明確 scope。快取 key 必須包含 tenant、授權範圍、版本或等價隔離維度，並限制容量與 TTL；測試要故意交錯兩個租戶驗證不會互相命中。

生命週期應以實際註冊範圍驗證：middleware 做低階 request preparation，guards 決定 authentication／authorization，interceptors 在 handler 前後包住執行與 response，pipes 做參數驗證／轉換，handler／service 執行業務，exception filters 格式化未處理例外。tenant identity 必須在所有需要它的 guard、pipe、interceptor 和 service 前可靠建立；不能只因 global auth guard 成功就假設 tenant context 完整。global、controller、route scope 的註冊順序要用 trace 和契約測試固定下來。

Provider 分層上，controller 不應持有資料庫和付款細節；`OrdersService` 協調用例，repository 管理資料存取，`BillingClient` 管理外部協定與 timeout，cache／event publisher 有獨立 contract，錯誤轉換集中在 domain／adapter boundary。這樣可以分別 mock repository、慢付款、cache miss 和 filter，而不讓單一 service 把所有副作用黏在一起。付款 timeout 也不能無條件重試，應依 operation ID、冪等語意與已發生的副作用定義回應。

Exception filter 要對 `HttpException`、validation／auth／tenant denial、domain conflict、下游 timeout 與未知錯誤建立穩定 mapping。對 client 回傳 status、error code、correlation ID、timestamp 和安全 message；對 server log 保留 stack、tenant／request context 的受控摘要與下游 metadata，但不能把 SQL、內部 URL 或其他租戶資料原樣回傳。未知錯誤不可假設可恢復；若 headers 已送出，不能再寫第二個 body，應記錄、終止該 response／socket 或交給框架安全收尾。

建議分三階段。第一階段先停用 URL-only cache 或以 feature flag 回到 tenant-safe 路徑，限制高成本 route，加入 module／provider／scope、cache collision、lifecycle、error code、connection pool 與 tenant isolation metrics；用兩租戶交錯請求、慢付款、未知例外和 response abort 測試，若跨租戶命中、5xx、P99 或 pool saturation 超過警戒線就回滾。第二階段整理 module graph、移除重複 registration、固定 exports／tokens、縮小 service ownership、修正 scope 與 filter ordering，加入 production-like bootstrap／integration tests。第三階段才逐步調整 request scope、cache policy、下游 timeout／retry 和 pod capacity，以固定 workload 比較 latency、instance count、RSS、error mapping 與資料正確性；每次只改一個主要變因並保留舊 module／config 路徑。

</details>

## 常見失分點

- 看到 latency 就只增加 pod，或把所有 provider 都改成 request scope，忽略 scope bubbling、DB／HTTP pool 與 memory cost。
- 只看 class 名稱就假設 provider 是全域 singleton，沒有檢查 module registration、exports、tokens 和實例 identity。
- 用 `forwardRef` 到處消除循環依賴，卻沒有重新畫 module boundary 或移除雙向業務依賴。
- 把 URL 當成多租戶 cache key，或只驗證資料庫 SQL 而沒有做交錯租戶 cache／response 測試。
- 把 Guard、Pipe、Interceptor、Filter 的責任和順序混在一起，或把 authentication 成功誤當成 tenant context 已建立。
- 用 `@Catch()` 直接回傳原始錯誤、在 headers 已送出後重寫 response，或以 HTTP 200 掩蓋付款／下游失敗。

## 延伸追問

1. 如果移除重複 `BillingClient` 後 DB／HTTP connection pool 降低，但 P99 仍高，你會如何區分 request scope bubbling、慢下游與 interceptor／serialization 成本？
2. 如果 tenant context 必須被背景事件使用，你會如何避免把 request-scoped object 洩漏到 queue，並設計明確的 tenant snapshot、冪等與權限驗證？
3. 如果兩個 module 都需要同一個 repository，但不同 bounded context 需要不同實作，你會如何設計 token、exports 與 adapter，避免共享錯誤的 provider？
4. 如果 exception filter 在單元測試通過但 production 仍出現未格式化 500，你會如何比較 adapter、global registration、unknown error、headersSent 與 bootstrap graph？
5. 如果把 `OrdersService` 拆開後付款已成功但 response timeout，你會如何設計 operation state、reconciliation、retry 與 client-facing status？
