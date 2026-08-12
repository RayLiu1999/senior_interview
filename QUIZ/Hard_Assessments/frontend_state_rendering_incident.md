# Frontend State & Rendering Incident：React／Vue 的狀態、渲染與 SSR 邊界

- **Assessment ID**: `assessment.frontend.state-rendering.incident.v1`
- **主要 Concept ID**: `concept.frontend.react.state-management`
- **次要 Concept IDs**:
  - `concept.frontend.react.component-lifecycle`
  - `concept.frontend.react.hoc-render-props`
  - `concept.frontend.react.hooks-state-lifecycle`
  - `concept.frontend.react.virtual-dom-reconciliation`
  - `concept.frontend.vue.component-communication`
  - `concept.frontend.vue.component-lifecycle`
  - `concept.frontend.vue.reactivity-system`
  - `concept.frontend.vue.routing-navigation-guards`
  - `concept.frontend.vue.pinia-state-management`
- **對應文章**:
  - [React 組件生命週期](../../06_Frontend_Development/React/react_component_lifecycle.md)
  - [React 高階組件與 Render Props](../../06_Frontend_Development/React/react_hoc_and_render_props.md)
  - [React Hooks 深度解析](../../06_Frontend_Development/React/react_hooks_deep_dive.md)
  - [React 狀態管理](../../06_Frontend_Development/React/react_state_management.md)
  - [React Virtual DOM 與 Reconciliation](../../06_Frontend_Development/React/react_virtual_dom_and_reconciliation.md)
  - [Vue 組件通信](../../06_Frontend_Development/Vue/vue_component_communication.md)
  - [Vue 組件生命週期](../../06_Frontend_Development/Vue/vue_component_lifecycle.md)
  - [Vue 響應式系統](../../06_Frontend_Development/Vue/vue_reactivity_system.md)
  - [Vue Router 與導航守衛](../../06_Frontend_Development/Vue/vue_routing_and_navigation_guards.md)
  - [Vue Pinia 狀態管理](../../06_Frontend_Development/Vue/vue_state_management_with_pinia.md)
- **題型**: `前端生產事故診斷`, `狀態與渲染邊界`, `SSR／CSR 一致性`, `效能與無障礙驗證`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 60 分鐘
- **標籤**: `React`, `Vue`, `Reconciliation`, `Hooks`, `Reactivity`, `Pinia`, `Router`, `SSR`, `CSR`, `Performance`, `Accessibility`, `State Consistency`
- **Learning Objective IDs**:
  - `concept.frontend.react.component-lifecycle/LO-1`
  - `concept.frontend.react.component-lifecycle/LO-2`
  - `concept.frontend.react.component-lifecycle/LO-3`
  - `concept.frontend.react.hoc-render-props/LO-1`
  - `concept.frontend.react.hoc-render-props/LO-2`
  - `concept.frontend.react.hoc-render-props/LO-3`
  - `concept.frontend.react.hooks-state-lifecycle/LO-1`
  - `concept.frontend.react.hooks-state-lifecycle/LO-2`
  - `concept.frontend.react.hooks-state-lifecycle/LO-3`
  - `concept.frontend.react.state-management/LO-1`
  - `concept.frontend.react.state-management/LO-2`
  - `concept.frontend.react.state-management/LO-3`
  - `concept.frontend.react.virtual-dom-reconciliation/LO-1`
  - `concept.frontend.react.virtual-dom-reconciliation/LO-2`
  - `concept.frontend.react.virtual-dom-reconciliation/LO-3`
  - `concept.frontend.vue.component-communication/LO-1`
  - `concept.frontend.vue.component-communication/LO-2`
  - `concept.frontend.vue.component-communication/LO-3`
  - `concept.frontend.vue.component-lifecycle/LO-1`
  - `concept.frontend.vue.component-lifecycle/LO-2`
  - `concept.frontend.vue.component-lifecycle/LO-3`
  - `concept.frontend.vue.reactivity-system/LO-1`
  - `concept.frontend.vue.reactivity-system/LO-2`
  - `concept.frontend.vue.reactivity-system/LO-3`
  - `concept.frontend.vue.routing-navigation-guards/LO-1`
  - `concept.frontend.vue.routing-navigation-guards/LO-2`
  - `concept.frontend.vue.routing-navigation-guards/LO-3`
  - `concept.frontend.vue.pinia-state-management/LO-1`
  - `concept.frontend.vue.pinia-state-management/LO-2`
  - `concept.frontend.vue.pinia-state-management/LO-3`

## 測驗目標

- 能從 render、reconciliation、commit、effect／watch、route 與 store trace 還原前端事故的因果鏈。
- 能區分 React 與 Vue 的狀態 ownership、生命週期、響應式更新和元件 identity，並選擇可逆的修復邊界。
- 能處理 SSR／CSR／hydration 的資料一致性、路由授權、租戶隔離、效能和 accessibility 契約。
- 能以 profiler、browser performance、SSR HTML／payload、hydration warning、測試與 production telemetry 證明修復有效。

## 問題情境與限制條件

某多租戶 SaaS 商城同時維護 React 管理後台與 Vue 公開 storefront。最近將兩個產品共用的 design system 與資料查詢層升級，並把商品列表改成虛擬捲動、SSR 和 client navigation 混合模式。部署後一週內出現以下事故：

- React 訂單頁在篩選、排序和即時更新後，列表偶爾把輸入中的數量、展開狀態或鍵盤 focus 留在錯誤的訂單上。Profiler 顯示 commit 次數與單次 render time 上升；團隊懷疑是 index key、memoization 和一個新的 Render Props wrapper 共同造成，但沒有 component identity 或 DOM mutation 證據。
- React dashboard 在開發環境啟用 Strict Mode 後，訂單事件被處理兩次；production 的某些 tab 切換後仍有舊請求回寫 state。程式以 HOC、Context 和自訂 Hooks 混合共享使用者、租戶、filter 與 server data，effect cleanup、AbortSignal 和 provider value 的 ownership 沒有明確規則。
- Vue storefront 首次載入的 SSR HTML 顯示正確租戶的商品，但 hydration 後偶爾閃成另一個租戶的篩選條件；client navigation 會再次 fetch 相同資料，慢網路下舊請求覆蓋新路由。某個 Pinia store 在 server process 中被重用，持久化 state 也沒有 schema version 或租戶隔離。
- Vue 的 computed／watcher 在大量商品更新時觸發過多，互動延遲從 120ms 升到 900ms。某個深層 watch 同時修改派生 state，另一個 component 透過 provide／inject 取得未文件化的可變物件。團隊只提高 debounce，沒有 dependency graph、flush timing 或 render count。
- 未登入使用者可以先取得一段個人化 shell，再在 client guard 重新導向；某個 `/tenant/:id/orders` route 在直接 URL、SSR 和 back／forward 流程中的守衛順序不同。部分 redirect 形成 loop，錯誤頁沒有把 focus 移到 heading，也缺少可讀的 aria-live 狀態。
- Core Web Vitals 的 LCP、INP、CLS、hydration time 與錯誤率同時變差，但監控只有整頁平均值。沒有分 route、租戶、裝置、SSR／CSR、cache hit、render count、commit duration、長任務、請求取消、hydration warning 或 screen reader 測試。

你是負責前端平台的 senior engineer。限制如下：不能只提出「加 memo」、「全部改 SPA」、「全部改 SSR」、「再加一層全域 store」或「提高 debounce」；不能繞過 server authorization、租戶隔離、hydration mismatch、accessibility 或測試。不得以刪除互動功能、停用 Strict Mode、忽略 warning 或回傳 stale／錯租戶資料掩蓋問題。所有修復必須能以 feature flag、canary、可量測成功指標和 rollback 條件逐步發布。

## 作答要求

1. **畫出 render 與 identity 邊界**：重建 React render／commit／effect 和 reconciliation，以及 Vue dependency tracking／scheduler／component lifecycle；指出 key、component identity、watch source、flush timing 和 cleanup 如何導致症狀。
2. **界定狀態 ownership**：將 server data、tenant／auth、filter、form draft、selection、optimistic update 和 derived data 分配給合理的 local state、Context／provide、Redux／Zustand、Pinia 或 query cache；說明單一真實來源與失敗回復。
3. **比較邏輯複用與通信**：針對 HOC、Render Props、Custom Hook、props／emit、provide／inject 與 store，各選出保留或遷移邊界，處理 wrapper、ref、事件命名、可測試性、可讀性和 accessibility。
4. **修正生命週期與取消**：設計 effect／watch／subscription／timer／request 的建立、cleanup、AbortSignal、路由離開與重複掛載行為，並說明哪些工作不能在 render 或 SSR 階段執行。
5. **處理 SSR／CSR／hydration**：比較公開 SEO 頁、個人化頁和互動後台的 SSR、SSG、CSR 或 hybrid 選擇；定義 HTML、payload、hydration、client navigation、cache key 與 request isolation 契約。
6. **修正 router 與授權**：重建 Vue route matching、guard 順序、auth／tenant 檢查、redirect、取消和 navigation failure；說明 client guard 不能取代 server authorization，並包含直接 URL、back／forward 與 SSR。
7. **處理效能與 accessibility**：提出 render／commit、reactivity、長任務、LCP／INP／CLS、focus、keyboard、aria-live、錯誤頁和 screen reader 的量測與驗證，不得只提供單一平均值。
8. **提出證據與 rollout**：至少列出 18 項證據或實驗，並提出至少三階段 rollout；每階段都要有成功指標、警戒線、feature flag／canary 方式與 rollback 條件。

## 期待證據

- React Profiler 與 component render／commit trace，包含更新原因、commit duration、render count、memo／selector 命中率和 Strict Mode 重複執行結果。
- 列表 key、element type、component identity 與 DOM mutation 的最小重現，包含插入、刪除、排序、虛擬捲動、輸入內容和 focus 保留。
- effect／subscription owner、建立與 cleanup 次數、AbortSignal、請求 request ID、取消率、舊請求回寫率和 unmount 後 set state 證據。
- HOC／Render Props／Custom Hook 的 component tree 深度、props／ref／static property 契約、wrapper render 次數、錯誤邊界與 accessibility regression。
- Context／provide／inject／Redux／Zustand／Pinia／query cache 的依賴圖、更新 fan-out、selector 命中、state owner 與重複資料來源清單。
- Vue reactivity dependency trace、computed cache hit、watch source、deep watch 觸發數、flush timing、scheduler queue、render count 和長任務時間。
- Vue lifecycle hook、effect scope、watch cleanup、route leave、component unmount、SSR process 與 client hydration 的建立／清理對照。
- SSR HTML、payload、hydration diff、hydration warning、client navigation trace 和重複 fetch request ID；要能按 tenant／locale／route 隔離。
- Pinia 每 request store instance、state serialization／hydration parity、持久化 schema version、storage migration、跨租戶讀寫和 action trace。
- Router route map、static／dynamic precedence、global／per-route／in-component guard 順序、redirect graph、navigation failure、direct URL 和 back／forward 測試。
- Server authorization、tenant context、client guard、cache key、stale response、request cancellation 與 race resolution 的安全測試。
- LCP、INP、CLS、TTFB、hydration time、long task、JS／CSS bundle、memory、CPU、網路請求數和 P50／P95／P99，並按 route、裝置和 SSR／CSR 分組。
- accessibility 端到端證據：鍵盤順序、focus restoration、可見 focus、heading／landmark、aria-live、錯誤訊息、screen reader、對比與 reduced motion。
- unit、component、contract、integration、SSR／hydration、router、visual／snapshot、property、load、故障注入和 browser accessibility 測試的責任分布。
- 慢 API、stale cache、client disconnect、重複導航、快速 filter、tab switch、offline／reconnect、SSR error、hydration mismatch 和低階裝置故障注入。
- canary 與 feature flag 的 route／tenant／device 分流、render／hydration／Web Vitals guardrail、資料 parity、錯誤預算和 rollback time。
- rollout 前後 bundle size、cache hit／collision、server memory、store instance、request count、duplicate event、錯租戶讀取和 support ticket 對照。
- migration 的資料相容策略：舊 HOC／store schema、Pinia persisted state、query cache key、feature flag default、SSR payload version 和回復舊 bundle 的條件。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議加 memo、加 debounce、全部改 SSR／SPA 或增加全域 store；忽略 identity、state ownership、hydration、授權、效能證據與 rollback。 |
| 1 | 能列出 React 或 Vue 的部分名詞，但無法連到 render／effect／reactivity／router 的實際控制流，也沒有可驗證的事故假設。 |
| 2 | 能指出 key、stale closure、deep watch、Pinia SSR 或 guard ordering 的部分問題，提出局部修復，但遺漏至少兩個核心面向或缺少量測與回滾。 |
| 3 | 能完成 render／reconciliation、Hooks／lifecycle、狀態 ownership、Vue reactivity／router／Pinia、SSR／CSR、效能、accessibility、測試和分階段 rollout 的完整診斷。 |
| 4 | 除上述內容外，能用 identity／dependency trace、request isolation、hydration parity、cache／權限證據和分群 Web Vitals 量化取捨，處理 race、取消、focus、schema migration 與可逆部署的連鎖風險。 |

### 通過標準

總分達 **3/4 分**才通過；Render／Identity 與 Lifecycle、State Ownership／Consistency、SSR／Router／Security、Performance／Accessibility／Evidence 四個核心面向均不得低於 2 分，且必須提出至少一個可執行的 rollback 條件、至少 18 項證據或實驗，以及至少三階段 rollout。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先把症狀分成四條可驗證的因果鏈，而不是把所有問題歸因於「React／Vue 重新渲染」：React 的 identity／key 或 wrapper 改變造成 state／focus 錯配；effect、watch、store 或請求沒有 cleanup 造成重複副作用與 race；SSR／CSR／Pinia request isolation 或 cache key 錯誤造成 hydration 與租戶資料不一致；reactivity fan-out、bundle、長任務和不完整的 accessibility flow 造成效能與使用性退化。先保存上一個已知正常的 bundle 與 store schema，再用最小重現確認每條鏈。

React 方面，render 必須能被重複或中斷而不產生外部副作用；DOM、訂閱、請求和 timer 應在有明確 owner 的 effect／事件邊界建立，cleanup 要在依賴變更、unmount、Strict Mode 測試和取消時對稱執行。reconciliation 依 element type 與穩定 key 判斷 identity，列表不能用會隨排序改變的 index key；若要改變表單或子樹的 state identity，應明確改 key 並測試 focus、輸入與 screen reader 行為。HOC／Render Props 可在需要保留既有 component contract 或控制渲染策略時暫留，但一般行為複用可移到 Custom Hook；遷移時要保留 ref、static metadata、錯誤邊界、props／aria 契約，並以 wrapper depth 與 render trace 控制風險。

React 狀態要先依 ownership 分類：輸入中的局部草稿留在元件，低頻跨樹設定可用 Context，複雜 domain transition 可用 Redux 或等價 store，細粒度共享狀態可用 selector store，而 server data 應由 query cache 或明確同步層擁有。不要同時讓 Context、store 和元件各自保存一份 server truth；每個請求要有 request ID、版本或 abort signal，舊回應不能覆蓋新 filter／route。selector、provider value、memoization 只能縮小更新範圍，不能代替授權、cache invalidation 或 optimistic failure recovery。

Vue 方面，props／emit 適合清楚的父子契約，provide／inject 只應用於有文件化 ownership 的樹內依賴，Pinia 才適合跨頁且需要 domain action、devtools 或持久化的共享狀態。reactive effect 在讀取資料時收集依賴，寫入時排程更新；computed 應保持可快取的派生資料，watch 用於明確副作用，並為深層監聽、flush timing、cleanup 和失敗請求設定上限。應以 dependency trace 和 render count 證明 debounce 是否真的減少工作，不能用 debounce 掩蓋錯誤的依賴圖。

Vue SSR 必須每個 request 建立隔離的 app／Pinia context，不可在 server process 共享可變租戶 state；序列化與 hydration 要有版本、權限和資料 parity 檢查。公開商品頁若需要 SEO，可用 SSR 或有界 revalidation 的 hybrid；純互動後台可選 CSR，但仍要處理 direct URL、錯誤頁、loading 和 server authorization。client navigation 不應無條件重抓已由 payload 提供的資料；事件觸發的請求才與 `useAsyncData` 或等價 SSR 資料取得分離。cache key 必須含 route、tenant／權限、locale、內容版本等隔離維度，stale response 必須依 request／route version 丟棄。

Router 修復先輸出 route map 和 guard graph，確認 static／dynamic route、global／per-route／component guard 順序，並把 auth、tenant、資料預取、取消、redirect loop 和 navigation failure 定義成穩定結果。client guard 只改善 UX，真正的資料授權仍在 server；SSR、直接 URL、重新整理、back／forward 和慢 auth 請求都要走相同安全契約。錯誤或轉址後要把 focus 放到頁面 heading 或可辨識的錯誤容器，狀態更新用 aria-live，不能只在視覺上顯示 spinner。

驗證應同時涵蓋行為與量測：用 Profiler、dependency／route／request trace、SSR HTML／payload／hydration diff、store instance 和 cache isolation 重建因果；用 LCP、INP、CLS、TTFB、hydration time、long task、commit duration、render count、watch trigger、memory、請求數和 P95／P99 觀察回歸；用鍵盤、focus、aria、screen reader 和 reduced motion 測試確保效能優化沒有犧牲使用者。測試矩陣需包含 filter 快速切換、排序、插入／刪除、tab switch、慢 API、取消、重複導航、SSR error、hydration mismatch、offline／reconnect、不同租戶與低階裝置。

第一階段是安全止血與取證：保留舊 bundle，對高風險虛擬列表、共用 provider／store 和新的 SSR route 加 feature flag；先固定 request／tenant context、停止跨 request singleton，加入 abort／cleanup、server authorization、錯誤 focus 與 route trace。若出現錯租戶資料、auth bypass、hydration error、duplicate request、P99 或 INP 超過警戒線，立即關閉新 flag 回到舊路徑。

第二階段在單一 framework／route 內導入清楚的 state owner、穩定 key、明確 selector／watch source、Pinia schema version、SSR payload parity 和 component contract。用 canary 逐租戶或逐裝置放量，要求 render count、commit duration、hydration warning、cache collision、請求取消率、accessibility test 和 Web Vitals 不劣於基準；若 parity、focus、error budget 或 rollback time 失守，停止擴大並回復舊 store／bundle。

第三階段才進行跨 framework 的 design system／query layer 整合與性能調整：依證據決定 wrapper 到 Custom Hook、Context 到 selector store、深層 watch 到明確 derived state、SSR／CSR／hybrid 的 route 分配，以及 bundle split、prefetch 和 cache TTL。每次只改一個主要變因，保留舊 payload／schema 的讀取能力，完成故障注入、瀏覽器 accessibility、壓測和 production-like SSR 後才移除 flag。任何錯租戶、hydration mismatch、focus regression、P99／INP 超線或無法在目標時間內 rollback 都是停止條件。

</details>

## 常見失分點

- 把 render、commit、effect、watch、hydration 混成同一個「生命週期」，沒有說明哪些工作可重複、可取消或只能在 client 執行。
- 只說 index key 不好，卻沒有連到 component identity、state preservation、輸入內容、focus 和 DOM mutation 證據。
- 用 memo、debounce 或提高 cache TTL 掩蓋錯誤的 state ownership、dependency graph、stale response 或租戶隔離。
- 把 HOC、Render Props、Custom Hook、provide／inject 和 Pinia 當成可以任意互換，沒有處理 props／ref／事件／schema／錯誤契約。
- 只依賴 client router guard，忽略 server authorization、SSR direct URL、redirect loop、navigation cancellation 和 back／forward。
- 把 SSR 的 server state 當作全域 singleton，或讓 Pinia persisted state 沒有版本、租戶和敏感資料治理。
- 只看整頁平均 Lighthouse 或 coverage，沒有分 route／裝置／租戶／SSR／CSR，也沒有 INP、hydration、focus、screen reader 和長任務證據。
- 沒有 feature flag、canary、成功指標和 rollback 條件，直接一次改動所有 React／Vue 路徑。

## 延伸追問

1. 如果修正 key 後 focus 仍在排序時遺失，你會如何區分 DOM remount、虛擬列表回收和 focus management 的責任？
2. 如果 SSR HTML 正確但 hydration 後資料錯租戶，你會如何沿 request context、payload、Pinia instance、cache key 和 client storage 追查？
3. 如果把 Context 改成 selector store 後 render 下降但 state 仍 stale，你會如何驗證 server cache invalidation、request version 和 optimistic rollback？
4. 如果新的 watch flush timing 修正了畫面延遲卻讓 navigation race 增加，你會如何設計 cleanup、AbortSignal 和 route version？
5. 如果產品要求公開頁 SEO 與個人化同時成立，你會如何選擇 SSR、hybrid、cache vary、revalidation 和 client enhancement？
6. 如果 accessibility 指標變差但 Core Web Vitals 變好，你會如何設計共同的 release gate，而不是用單一數字取代另一個？
