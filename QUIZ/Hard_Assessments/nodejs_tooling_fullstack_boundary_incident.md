# Node.js Tooling Fullstack Boundary Incident：從依賴圖、Runtime 資源到 Nuxt 渲染

- **Assessment ID**: `assessment.nodejs.tooling-fullstack-boundary.incident.v1`
- **主要 Concept ID**: `concept.nodejs.tooling.package-manifest-reproducibility`
- **次要 Concept IDs**:
  - `concept.nodejs.tooling.package-manager-reproducibility`
  - `concept.nodejs.tooling.testing-strategy`
  - `concept.nodejs.core.event-emitter-lifecycle`
  - `concept.nodejs.core.process-child-process`
  - `concept.nodejs.core.filesystem-io`
  - `concept.nodejs.typescript.adoption-boundary`
  - `concept.nodejs.express.routing-dispatch`
  - `concept.nodejs.express.runtime-boundary`
  - `concept.nodejs.nuxt.seo-meta`
  - `concept.nodejs.nuxt.deployment-performance`
  - `concept.nodejs.nuxt.data-fetching-state`
  - `concept.nodejs.nuxt.rendering-architecture`
  - `concept.nodejs.nuxt.directory-conventions`
- **對應文章**:
  - [package.json 深入解析](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Tooling/package_json_deep_dive.md)
  - [比較 Node.js 套件管理器：npm vs. Yarn vs. pnpm](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Tooling/npm_vs_yarn_vs_pnpm.md)
  - [測試工具與策略](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Tooling/testing_tools_strategies.md)
  - [EventEmitter 與觀察者模式](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Core/event_emitter_and_observer_pattern.md)
  - [Process 與 Child Process](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Core/process_and_child_process.md)
  - [檔案系統操作](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Core/file_system_operations.md)
  - [在 Node.js 專案中使用 TypeScript](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/TypeScript/why_use_typescript.md)
  - [Express.js 路由詳解](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/Express/routing_in_depth.md)
  - [Express.js 與 Node.js 的關係](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/Express/express_and_nodejs.md)
  - [SEO 與 Meta 管理](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/Nuxt/seo_meta_management.md)
  - [部署與性能優化](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/Nuxt/deployment_performance.md)
  - [資料獲取與狀態管理](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/Nuxt/data_fetching_state_management.md)
  - [Nuxt.js 架構與渲染模式](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/Nuxt/nuxt_architecture_rendering.md)
  - [目錄結構與約定](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/Nuxt/directory_structure_conventions.md)
- **題型**: `生產事故診斷`, `依賴可重現性`, `Node.js 資源生命週期`, `TypeScript 邊界`, `Express Routing`, `Nuxt SSR／CSR`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 45 分鐘
- **標籤**: `Node.js`, `npm`, `pnpm`, `TypeScript`, `EventEmitter`, `Child Process`, `File System`, `Express`, `Nuxt`, `SSR`, `SEO`, `Testing`
- **Learning Objective IDs**:
  - `concept.nodejs.tooling.package-manifest-reproducibility/LO-1`
  - `concept.nodejs.tooling.package-manifest-reproducibility/LO-2`
  - `concept.nodejs.tooling.package-manifest-reproducibility/LO-3`
  - `concept.nodejs.tooling.package-manager-reproducibility/LO-1`
  - `concept.nodejs.tooling.package-manager-reproducibility/LO-2`
  - `concept.nodejs.tooling.package-manager-reproducibility/LO-3`
  - `concept.nodejs.tooling.testing-strategy/LO-1`
  - `concept.nodejs.tooling.testing-strategy/LO-2`
  - `concept.nodejs.tooling.testing-strategy/LO-3`
  - `concept.nodejs.core.event-emitter-lifecycle/LO-1`
  - `concept.nodejs.core.event-emitter-lifecycle/LO-2`
  - `concept.nodejs.core.event-emitter-lifecycle/LO-3`
  - `concept.nodejs.core.process-child-process/LO-1`
  - `concept.nodejs.core.process-child-process/LO-2`
  - `concept.nodejs.core.process-child-process/LO-3`
  - `concept.nodejs.core.filesystem-io/LO-1`
  - `concept.nodejs.core.filesystem-io/LO-2`
  - `concept.nodejs.core.filesystem-io/LO-3`
  - `concept.nodejs.typescript.adoption-boundary/LO-1`
  - `concept.nodejs.typescript.adoption-boundary/LO-2`
  - `concept.nodejs.typescript.adoption-boundary/LO-3`
  - `concept.nodejs.express.routing-dispatch/LO-1`
  - `concept.nodejs.express.routing-dispatch/LO-2`
  - `concept.nodejs.express.routing-dispatch/LO-3`
  - `concept.nodejs.express.runtime-boundary/LO-1`
  - `concept.nodejs.express.runtime-boundary/LO-2`
  - `concept.nodejs.express.runtime-boundary/LO-3`
  - `concept.nodejs.nuxt.seo-meta/LO-1`
  - `concept.nodejs.nuxt.seo-meta/LO-2`
  - `concept.nodejs.nuxt.seo-meta/LO-3`
  - `concept.nodejs.nuxt.deployment-performance/LO-1`
  - `concept.nodejs.nuxt.deployment-performance/LO-2`
  - `concept.nodejs.nuxt.deployment-performance/LO-3`
  - `concept.nodejs.nuxt.data-fetching-state/LO-1`
  - `concept.nodejs.nuxt.data-fetching-state/LO-2`
  - `concept.nodejs.nuxt.data-fetching-state/LO-3`
  - `concept.nodejs.nuxt.rendering-architecture/LO-1`
  - `concept.nodejs.nuxt.rendering-architecture/LO-2`
  - `concept.nodejs.nuxt.rendering-architecture/LO-3`
  - `concept.nodejs.nuxt.directory-conventions/LO-1`
  - `concept.nodejs.nuxt.directory-conventions/LO-2`
  - `concept.nodejs.nuxt.directory-conventions/LO-3`

## 測驗目標

- 能從 package manifest、lockfile、套件管理器、Node／TypeScript build 與 CI 證據重建可重現的 dependency graph。
- 能沿著 EventEmitter、child process、filesystem、Express request 與 Nuxt server／client lifecycle 追蹤資源、取消、錯誤與資料 ownership。
- 能區分 TypeScript compile-time 型別與 runtime trust boundary，並避免把未驗證的輸入、狀態或 secret 穿越錯誤執行環境。
- 能以 route map、HTML／payload、cache key、Core Web Vitals、測試與 production telemetry 建立可回滾的修復順序。

## 問題情境與限制條件

某團隊維護一個 monorepo，包含 Express API、Nuxt 3 SSR 前端、圖片處理 worker 與共用 TypeScript package。最近把部分頁面改成 hybrid rendering 並升級 Node.js 後，部署事故同時出現在 build、API 與前端：

- 同一個 commit 在開發機可正常建置，但 CI 的乾淨環境偶爾缺少一個 transitive package；API pod 使用 `npm install`，前端 workspace 使用 pnpm，另一個 worker 仍讀取舊的 Yarn lockfile。某些 package 使用寬鬆版本範圍，review 只看 `package.json`，沒有檢查 lockfile、Node／package manager 版本或 registry integrity。
- 一次 hot reload 與 worker restart 後，`MaxListenersExceededWarning` 增多；同一個訂單完成事件被處理兩次，RSS 和 listener count 隨 reload 次數增加。事件 listener 會閉包持有 request metadata，但沒有對應的 unsubscribe 或 shutdown cleanup。
- 圖片轉檔路徑把使用者提供的檔名組合進 shell command；大輸出使用 buffered child process。取消 HTTP request 後 child 仍執行，stdout／stderr 可能填滿 buffer，部分 zombie process 在 pod drain 後仍存在。另一條匯出路徑使用同步 filesystem API 讀取大檔案，慢 client 時會出現 event-loop delay、open file 增加與 RSS 上升。
- 共用 TypeScript package 把外部 JSON、環境變數與一個 JavaScript library 的回傳值以 type assertion／`any` 接入。編譯成功但 production 出現缺欄位、ESM／CommonJS resolution 差異與錯誤的 runtime config；source map 也無法穩定對應到原始碼。
- Express 新增 `/v2/orders/search` 後，部分請求被 `/v2/orders/:id` 捕獲；一個 router mount 在 auth middleware 之前，另一個 async handler 的 rejected Promise 沒有進入統一 error boundary。404、route version、參數驗證與 `headersSent` 的測試不完整。
- Nuxt 公開商品頁在瀏覽器互動後看似正常，但 crawler 取得的 HTML 缺少動態 title、canonical 與 structured data。SSR 使用 `useAsyncData`，client mount 又用 `$fetch` 重抓；某個 `useState` key 被不同租戶共用，CDN cache 也沒有包含 locale／tenant／內容版本。部署後 TTFB、hydration time 與 stale page 增加，部分 server-only import 被意外打進 client bundle。
- 團隊目前只看單次 Lighthouse、總 coverage 與 pod restart 次數；沒有 lockfile diff gate、dependency graph、listener／child process／open handle 指標、route map、SSR／CSR trace、cache collision、hydration warning 或跨租戶測試。

限制條件：不能以關閉 typecheck／測試、刪除 SSR、把所有資料改成 client-only、無條件提高 listener 上限、增加 pod 或回傳 HTTP 200 來掩蓋問題；必須保留既有 API 相容性、租戶與權限隔離、可取消的資源生命週期、可重現的部署 artifact 與安全的錯誤資訊。修復需要分階段 rollout，且每階段都要有成功指標與 rollback 條件。

## 作答要求

1. **重建依賴與建置邊界**：說明 package manifest、dependency 類型、SemVer、lockfile、npm／Yarn／pnpm、workspace、Node／manager 版本與 registry integrity 如何影響 artifact；指出哪些結論要用 clean install、dependency graph、lockfile diff 與 checksum 驗證。
2. **追蹤 Node.js 資源生命週期**：分析 EventEmitter listener ownership、同步／非同步 filesystem、stream backpressure、child process 的 shell／buffer／IPC／signal／reaping，並說明取消、timeout、shutdown 與錯誤如何傳播。
3. **校準 TypeScript 邊界**：區分 compile-time 型別、runtime validation、module／target／source map 與外部資料 trust boundary；指出 `any`、type assertion、ESM／CommonJS 不一致的取證與修復方式。
4. **修正 Express 契約**：重建 route stack、path precedence、Router mount、auth／validation middleware、async error、404／error middleware 與 response-started 邊界；提出相容版本化與 contract test。
5. **修正 Nuxt fullstack 邊界**：比較 SSR、SSG、SPA、ISR／hybrid；說明 `useFetch`、`useAsyncData`、`$fetch`、payload／hydration、useState／Pinia、cache key、SEO head、sitemap 與 server／client-only import 的責任。
6. **設計取證計畫**：列出至少 16 項證據或實驗，至少涵蓋 dependency graph／lockfile、clean build、test flake、listener count／heap、child process／open handle、event-loop／I/O、runtime validation、route map／trace、SSR HTML／payload／hydration、cache isolation、SEO head、CWV、CPU／RSS／P99 與 deploy artifact。
7. **設計分階段修復**：至少提出三階段，列出每階段變更、成功指標、警戒線與 rollback；至少包含 clean install、listener cleanup、child cancellation、bounded filesystem pipeline、runtime schema、route ordering、跨租戶 cache／SSR、SEO crawler、故障注入與 production-like integration test。

## 期待證據

- 能指出不同 package manager／lockfile 同時存在會使 dependency graph 與 hoisting／PnP 行為漂移；應固定 manager、Node、registry、lockfile 與 frozen install，並用乾淨環境重建 artifact。
- 能區分 `dependencies`、`devDependencies`、`peerDependencies` 與 build-only 工具，並說明 `exports`、engines、overrides 與 lifecycle script 對 runtime／supply chain 的影響。
- 能指出 listener count 隨 reload 增加、duplicate event、heap retained path 與缺少 cleanup 才支持 listener leak；不能只把 `setMaxListeners` 調大。
- 能區分 `spawn` 的 stream、`exec` 的 shell／buffer、`execFile` 的直接執行與 `fork` 的 IPC；能說明 argv validation、timeout、AbortSignal、signal escalation、exit／close、reaping 與 child ownership。
- 能指出同步大檔案 I/O 會阻塞 event loop，stream 必須有 bounded buffer、backpressure、abort 與 descriptor cleanup；能用 open handles、I/O latency、RSS 與 event-loop delay 證明。
- 能說明 TypeScript 型別不會驗證 runtime JSON／env／第三方回應，並以 schema、type guard、validated config、strict typecheck、source map 與 ESM／CommonJS integration test 固定邊界。
- 能用 route map 與 request trace 證明靜態／動態路徑、mount prefix、auth／validation、async error、404 與 error middleware 的順序；不能只測單一路由的 200。
- 能區分 Node.js 提供的 runtime／`http`／stream 與 Express 提供的 router／middleware abstraction，並把 timeout、validation、backpressure、observability 視為應用責任。
- 能指出 Nuxt public SEO 必須在 crawler 可取得的 HTML 產生，不能只在 client mount 後更新；要檢查 title、description、canonical、OG、structured data、sitemap 與 robots。
- 能區分 SSR 初始 HTML、payload、hydration、client navigation 與 `$fetch` 事件請求；能指出重複 fetch、server singleton state、cache key 缺 tenant／locale／版本會造成 stale 或資料外洩。
- 能把每個 route 的 SEO、個人化、新鮮度、TTFB、CWV、server cost 與 cache invalidation 連到 SSR／SSG／SPA／ISR／hybrid 選型，而不是宣稱一種模式永遠最好。
- 能用 build output、import trace 與 server／client smoke test 證明 secret、資料庫 client 與 server-only module 沒有進入 client bundle；能檢查 Nuxt 目錄約定造成的 route／auto-import collision。
- 能把 coverage 與測試層級連到 module graph、dependency reproducibility、route contract、SSR／hydration、故障注入、slow client／下游、取消與 deploy rollback，而不是只提高百分比。
- 能將修復連到 build failure、5xx、route mismatch、duplicate event、listener／child／handle 數、event-loop delay、P99／TTFB、hydration time、cache hit／collision、SEO head completeness、CPU／RSS 與 rollback time。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議增加 pod、刪掉 SSR、關閉 typecheck／測試、提高 listener 上限或回傳 200；沒有 dependency、resource、route、runtime type 或證據計畫。 |
| 1 | 能列出部分 npm、EventEmitter、Express 或 Nuxt 名詞，但無法重建跨邊界因果鏈，也沒有可回滾的驗證方式。 |
| 2 | 能指出 lockfile 漂移、listener leak、child process、同步 I/O、route order 或 hydration 的部分問題，提出大致修復，但遺漏至少兩個核心面向或量化證據不足。 |
| 3 | 能完成 dependency／build、Node resource、TypeScript、Express、Nuxt rendering／data／SEO 的診斷，提出邊界清楚、可觀測且分階段的修復。 |
| 4 | 除上述內容外，能處理 manager／workspace drift、artifact checksum、listener／child cleanup、signal race、runtime validation、route compatibility、cache privacy、SSR／CSR duplicate fetch、SEO freshness、測試／production graph drift 與可逆部署 trade-off。 |

### 通過標準

總分達 **3/4 分**才通過；Dependency／Build Reproducibility、Node Resource Lifecycle、TypeScript／Express Boundary、Nuxt Rendering／Data／SEO、Evidence／Rollout 五個核心面向均不得低於 2 分，且必須提出至少一個明確 rollback 條件。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先把事故拆成四條可能互相放大的因果鏈：artifact 不可重現造成版本／解析差異；listener、child、file descriptor 或同步 I/O 造成 runtime 資源與延遲問題；TypeScript／Express 邊界讓錯誤未被驗證或路由未受保護；Nuxt SSR／CSR、cache 與 SEO head 造成重抓、stale、hydration 與索引問題。現有資料支持多個假設，但不能只因同一時間發生就把所有症狀歸給 Node.js 升級。

第一階段先固定證據與安全止血。CI 明確選定一個 Node 與 package manager，鎖定 registry、使用單一 lockfile／workspace policy 與 frozen clean install；比較 API、worker、Nuxt 的 dependency graph、lockfile diff、artifact checksum、Node／manager 版本和 install log。暫停會改寫 lockfile 的部署流程，若無法證明 artifact 一致就阻止發布。這一步要保留上一個已知可部署 artifact，而不是現場重新安裝。

Node runtime 方面，先為每個 EventEmitter 設定 owner、訂閱建立點與 cleanup；將 reload／worker restart 測試加入 listener count、duplicate event、heap retained path 與 shutdown assertion。`MaxListenersExceededWarning` 應視為症狀，先移除重複訂閱、清理 timer／listener 與關閉事件，再判斷是否有合理的高 listener fan-out。child process 應使用不經 shell 的參數化執行方式，為每個 job 設定 timeout、AbortSignal、輸出上限、stderr／exit／close handling，取消時依序停止、等待、必要時強制終止並確認沒有 zombie。大檔案改為 bounded stream，處理 backpressure、client abort、descriptor cleanup 和磁碟錯誤；同步 I/O 先從 request path 移除，並用 event-loop delay 與 I/O 指標驗證。

TypeScript 修復要把 compile-time 與 runtime 分開。對環境變數、HTTP／queue JSON、第三方 library response 與檔案內容使用明確 schema／type guard／validated config；減少無註解的 `any` 和 assertion，並在 strict typecheck、integration test、source map、ESM／CommonJS resolution 與 Node target 一致後才允許部署。測試不能只 mock 一個型別正確的 object，必須注入缺欄位、錯型別與第三方錯誤回應。

Express 要先輸出實際 route map，再確認 `/v2/orders/search` 與 `/v2/orders/:id` 的 precedence、Router mount prefix、auth／tenant／validation middleware、404 和 error middleware 的順序。把具體 static route 放在泛用 parameter route 前，所有版本 route 都使用明確的 contract test；async handler 必須把 rejection 接到統一 error boundary，處理 `headersSent`、取消與穩定的 status／error code，不能把錯誤轉成 200。Node.js `http` 與 Express 的責任要分開觀測：event-loop／socket／stream 是 runtime 指標，route／middleware／validation 是 framework／application 邊界。

Nuxt 先按 route 分類。公開、需要索引的商品頁可採 SSR 或具明確 revalidation 的 hybrid；完全靜態內容可 SSG；個人化或不需 SEO 的互動區才選 SPA／client-only。`useFetch`／`useAsyncData` 要與 SSR payload、hydration 和 client navigation 的 key 對齊，事件觸發才用 `$fetch`；避免同一資料在 server render 和 client mount 無條件重抓。`useState`／Pinia 不可把 request-specific 或 tenant-specific state 放進跨 request singleton；cache key 至少要包含 route、tenant／授權、locale、版本或等價隔離維度，並定義 TTL、失效與 optimistic rollback。

SEO 內容要在 crawler 取得的 HTML 中完成，檢查 title、description、canonical、OG／Twitter、structured data、sitemap、robots 與 locale alternate；不能只在 hydration 後透過瀏覽器 DOM 看起來正確。用 build output／import trace 排除 server-only module、secret 與 database client 進入 client bundle；用 Nuxt route map 和 auto-import trace 排除目錄命名碰撞。部署要驗證 runtime config、CDN cache、revalidation、readiness、graceful shutdown、TTFB、P99、CWV、hydration time、CPU／RSS 與錯誤率。

測試應分層：依賴與 artifact 用 clean-install／checksum；package boundary 用 module resolution／workspace integration；Node runtime 用 listener、child、slow output、abort、open handle 與 shutdown 故障注入；Express 用 route／auth／404／async error contract；Nuxt 用 server HTML、payload、hydration、cache isolation、SEO crawler、server／client import smoke 與 deployment preview。coverage 可作趨勢訊號，但不能取代這些邊界測試。

第二階段再整理長期結構：移除多 lockfile 與隱式 phantom dependency，固定 workspace ownership；把事件、child job、filesystem pipeline 的資源管理封裝在明確 adapter；把 runtime schema 和 external client contract 放在 TypeScript boundary；將 Express route／middleware／error contract 與 Nuxt per-route rendering／cache／SEO policy 寫成可執行測試。每次只改一個主要變因，保留上一版 artifact 和 feature flag。

第三階段才做性能與成本調整：依 event-loop、child queue、I/O、P99／TTFB、CWV、cache hit、CPU／RSS 與建置時間資料，選擇 stream buffer、worker concurrency、CDN／cache TTL、SSR／SSG／ISR 分配與 bundle split。若 lockfile checksum 不同、跨租戶 cache 命中、route auth bypass、duplicate event、zombie child、server-only bundle、SEO head 缺失、5xx／P99／CWV 超出警戒線，就停止 rollout 並回到已知 artifact。

</details>

## 常見失分點

- 只把 `package.json` commit 當成可重現保證，忽略 lockfile、Node／manager、registry、workspace 與 artifact checksum。
- 把 phantom dependency、pnpm／PnP 解析差異當成「安裝工具偏好」，沒有用 clean install 和 dependency graph 證明。
- 看到 listener warning 就調高上限，或看到 RSS 就只重啟 pod，沒有追 listener owner、child、descriptor、stream buffer 與 retained path。
- 使用 `exec` 拼接使用者輸入、忽略 stdout／stderr buffer、取消與 zombie process，或把同步大檔案 I/O 留在 request path。
- 把 TypeScript interface、type assertion 或 coverage 當作 runtime validation，沒有測試錯型別 JSON、env、第三方回應與 ESM／CommonJS resolution。
- 只測 Express happy path，忽略 route precedence、Router mount、auth ordering、async rejection、404、error middleware 與 `headersSent`。
- 把 Nuxt SEO 放到 client mount、讓 server state 共享 request、使用不完整 cache key，或用一次 Lighthouse 分數代表生產性能與內容新鮮度。
- 把所有頁面改成 SPA、刪除 SSR、提高 pod 數或回傳 200 來掩蓋錯誤，沒有保留相容性、隔離性與可回滾性。

## 延伸追問

1. 如果固定 lockfile 後 build 已可重現，但 production 仍偶發 `MODULE_NOT_FOUND`，你會如何區分 workspace filter、optional dependency、CPU／OS target、container artifact 與 runtime `exports` 問題？
2. 如果移除重複 listener 後 duplicate event 消失但 RSS 仍上升，你會如何用 heap／external memory、child process、file descriptor、stream buffer 與 cache retained path 分段排除？
3. 如果 child process 已可取消，但下游圖片任務有部分副作用，你會如何設計 job identity、idempotency、reconciliation、retry 與 client-facing status？
4. 如果 Express route map 正確但 auth bypass 仍存在，你會如何比較 middleware registration、Router mount、proxy path rewrite、trust proxy 與 integration test 的差異？
5. 如果 Nuxt raw HTML 的 SEO 已正確但 hydration time 和 TTFB 變差，你會如何區分 payload size、duplicate fetch、SSR CPU、bundle split、CDN cache 與第三方 script？
