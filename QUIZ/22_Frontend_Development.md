# Frontend Development Quick Quiz

這份 Quick Quiz 將 React 與 Vue 的元件生命週期、渲染模型、狀態管理、路由和 SSR／CSR 邊界，接到同一份 Hard Assessment。建議先回答題目，再回到文章補齊理由，最後以 Assessment 的證據要求檢查是否能把概念用在事故診斷上。

## React

<a id="q1"></a>
### Q1: React render 與生命週期邊界
<!-- Concept ID: concept.frontend.react.component-lifecycle; Learning Objective IDs: concept.frontend.react.component-lifecycle/LO-1, concept.frontend.react.component-lifecycle/LO-2, concept.frontend.react.component-lifecycle/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

為什麼不能把 React render 階段當成執行副作用的地方？請說明 render、commit、effect cleanup，以及 Strict Mode 或中斷／重試 render 對訂閱與非同步工作的影響。

<details>
<summary>💡 答案提示</summary>

- render 應保持可重入與接近純函式；DOM 寫入、訂閱、請求和 timer 應放在適當的 effect 或事件邊界。
- cleanup 必須與建立訂閱的 effect 一一對應，並處理取消、重複掛載與 client disconnect。
- 用 React Profiler、render／commit trace、listener count、請求取消率和測試證明沒有重複副作用。

</details>

📖 [查看完整答案](../06_Frontend_Development/React/react_component_lifecycle.md)

---

<a id="q2"></a>
### Q2: React HOC、Render Props 與邏輯複用
<!-- Concept ID: concept.frontend.react.hoc-render-props; Learning Objective IDs: concept.frontend.react.hoc-render-props/LO-1, concept.frontend.react.hoc-render-props/LO-2, concept.frontend.react.hoc-render-props/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

HOC 與 Render Props 都能複用狀態邏輯。何時應保留它們，何時遷移至 Custom Hook 或 Context？請同時考慮 wrapper 深度、props／ref 契約、效能、可測試性和 accessibility。

<details>
<summary>💡 答案提示</summary>

- HOC 改變 component identity 與 props 邊界，Render Props 把控制權交給呼叫方；兩者都可能造成 wrapper 或 render function 過多。
- Custom Hook 適合複用行為，不會自動解決共享資料、server cache 或 component identity 問題。
- 遷移時要保留 ref、static metadata、錯誤邊界、鍵盤操作和測試契約，並以 feature flag 逐步替換。

</details>

📖 [查看完整答案](../06_Frontend_Development/React/react_hoc_and_render_props.md)

---

<a id="q3"></a>
### Q3: React Hooks 規則與副作用
<!-- Concept ID: concept.frontend.react.hooks-state-lifecycle; Learning Objective IDs: concept.frontend.react.hooks-state-lifecycle/LO-1, concept.frontend.react.hooks-state-lifecycle/LO-2, concept.frontend.react.hooks-state-lifecycle/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請解釋 Hooks 為何依賴固定呼叫順序，以及 dependency array、closure、functional update 和 cleanup 如何共同影響資料正確性。

<details>
<summary>💡 答案提示</summary>

- Hooks 順序是 React 對應每次 render 狀態槽位的契約，不能放在條件、迴圈或一般函式中。
- dependency array 不是「只執行一次」的保證；必須把 effect 使用的 reactive values 和取消策略一起納入設計。
- 以 eslint、stale closure 測試、AbortController、Strict Mode 與 profiler 找出無限更新和重複請求。

</details>

📖 [查看完整答案](../06_Frontend_Development/React/react_hooks_deep_dive.md)

---

<a id="q4"></a>
### Q4: React 狀態管理邊界
<!-- Concept ID: concept.frontend.react.state-management; Learning Objective IDs: concept.frontend.react.state-management/LO-1, concept.frontend.react.state-management/LO-2, concept.frontend.react.state-management/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

如何在 local state、props、Context、Redux、Zustand 與 server cache 之間劃分 ownership？請說明 selector、provider value 和 optimistic update 可能造成的 render fan-out 與一致性問題。

<details>
<summary>💡 答案提示</summary>

- 先分類狀態是元件暫態、跨元件 UI、session／tenant、server cache 或表單草稿，再決定 owner。
- Context value 改變可能通知所有 consumer；store selector 可縮小訂閱範圍，但不會自動處理 cache invalidation 或權限。
- 保留單一真實來源、版本／請求識別、失敗回復與跨頁測試，避免 optimistic state 與 server state 長期分歧。

</details>

📖 [查看完整答案](../06_Frontend_Development/React/react_state_management.md)

---

<a id="q5"></a>
### Q5: React reconciliation、key 與元件身分
<!-- Concept ID: concept.frontend.react.virtual-dom-reconciliation; Learning Objective IDs: concept.frontend.react.virtual-dom-reconciliation/LO-1, concept.frontend.react.virtual-dom-reconciliation/LO-2, concept.frontend.react.virtual-dom-reconciliation/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

`key` 如何影響列表 diff、state preservation、focus 和 DOM mutation？為什麼使用 index 當 key 可能讓畫面看似正確但把輸入內容或 accessibility focus 交給錯誤的項目？

<details>
<summary>💡 答案提示</summary>

- reconciliation 依 element type 與 key 判斷 identity；key 應代表穩定的資料身分，不是當次排序位置。
- 錯誤 key 會造成錯誤的 state reuse、重掛載或不必要的 DOM 更新，尤其在插入、刪除、排序時明顯。
- 用 profiler、DOM mutation、focus／screen reader 測試和 commit duration 驗證優化沒有改變使用者可感知行為。

</details>

📖 [查看完整答案](../06_Frontend_Development/React/react_virtual_dom_and_reconciliation.md)

---

## Vue

<a id="q6"></a>
### Q6: Vue 組件通信與狀態所有權
<!-- Concept ID: concept.frontend.vue.component-communication; Learning Objective IDs: concept.frontend.vue.component-communication/LO-1, concept.frontend.vue.component-communication/LO-2, concept.frontend.vue.component-communication/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較 props／emit、v-model、provide／inject 和 Pinia 的使用邊界。如何避免子元件直接改寫父層資料、事件名稱漂移和跨租戶狀態被錯誤共享？

<details>
<summary>💡 答案提示</summary>

- 近距離、明確的父子資料流優先用 props／emit；provide／inject 要有明確契約；跨頁共享且有 domain ownership 才導入 store。
- 子元件提出意圖，owner 決定狀態變更；不要用隱性注入取代所有可追蹤的介面。
- 以 component contract、devtools、render trace、權限隔離和鍵盤／aria 測試驗證資料流。

</details>

📖 [查看完整答案](../06_Frontend_Development/Vue/vue_component_communication.md)

---

<a id="q7"></a>
### Q7: Vue 生命週期與 SSR／hydration
<!-- Concept ID: concept.frontend.vue.component-lifecycle; Learning Objective IDs: concept.frontend.vue.component-lifecycle/LO-1, concept.frontend.vue.component-lifecycle/LO-2, concept.frontend.vue.component-lifecycle/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

Vue 的建立、掛載、更新與卸載 hooks 在 SSR、hydration 和 client navigation 中有何不同？請說明 timer、watcher、訂閱與請求如何建立、取消和清理。

<details>
<summary>💡 答案提示</summary>

- server render 沒有瀏覽器 DOM；瀏覽器專用副作用應放在 client 可用的邊界，並避免把 request-specific state 放到 server singleton。
- cleanup 必須涵蓋卸載、路由離開、請求取消和 hydration 失敗，不只涵蓋正常瀏覽流程。
- 用 SSR HTML、hydration warning、navigation trace、open handle 和重複請求測試驗證 lifecycle。

</details>

📖 [查看完整答案](../06_Frontend_Development/Vue/vue_component_lifecycle.md)

---

<a id="q8"></a>
### Q8: Vue reactivity 依賴追蹤與更新
<!-- Concept ID: concept.frontend.vue.reactivity-system; Learning Objective IDs: concept.frontend.vue.reactivity-system/LO-1, concept.frontend.vue.reactivity-system/LO-2, concept.frontend.vue.reactivity-system/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請說明 Proxy、ref、reactive、computed、watch 的依賴追蹤與觸發更新。如何辨識 reactive 解包、深層監聽、flush timing 或失效依賴造成的效能問題？

<details>
<summary>💡 答案提示</summary>

- reactive effect 讀取資料時收集依賴，寫入時觸發相依 effect；computed 應保持派生資料，不應承擔無界副作用。
- watch／watchEffect 的深度、flush timing、cleanup 和來源選擇會影響競態與 render 次數。
- 用 dependency trace、render count、scheduler／flush timing、記憶體和互動延遲指標定位問題。

</details>

📖 [查看完整答案](../06_Frontend_Development/Vue/vue_reactivity_system.md)

---

<a id="q9"></a>
### Q9: Vue Router 守衛與 SSR／CSR 邊界
<!-- Concept ID: concept.frontend.vue.routing-navigation-guards; Learning Objective IDs: concept.frontend.vue.routing-navigation-guards/LO-1, concept.frontend.vue.routing-navigation-guards/LO-2, concept.frontend.vue.routing-navigation-guards/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

如何設計 Vue Router 的認證、授權、租戶隔離與 redirect 流程，並避免 SSR／CSR 取得不同 session、導航競態或 redirect loop？

<details>
<summary>💡 答案提示</summary>

- 先重建 route matching 與 guard 順序，再定義未登入、無權限、資料載入失敗與使用者取消的結果。
- guard 應依賴可驗證的 auth／tenant source，不能只相信 client storage；敏感資料仍要由 server authorization 保護。
- 測試 direct URL、client navigation、back／forward、SSR、慢請求、重複導航和 focus／aria 回復。

</details>

📖 [查看完整答案](../06_Frontend_Development/Vue/vue_routing_and_navigation_guards.md)

---

<a id="q10"></a>
### Q10: Pinia 狀態一致性與效能
<!-- Concept ID: concept.frontend.vue.pinia-state-management; Learning Objective IDs: concept.frontend.vue.pinia-state-management/LO-1, concept.frontend.vue.pinia-state-management/LO-2, concept.frontend.vue.pinia-state-management/LO-3 -->

Pinia 的 state、getters、actions 與 plugins 如何劃分責任？在 SSR、hydration、持久化與非同步 action 中，如何避免 request 間資料洩漏、重複 fetch、stale state 和 render fan-out？

<details>
<summary>💡 答案提示</summary>

- store 應有清楚的 domain owner；getter 是派生資料，action 負責受控的同步／非同步狀態轉換。
- SSR 每個 request 要有隔離的 store context；持久化資料必須有 schema version、租戶／權限界線與失敗回復。
- 以 hydration parity、action trace、selector／render count、cache hit、錯誤率和 rollback 測試驗證。

</details>

📖 [查看完整答案](../06_Frontend_Development/Vue/vue_state_management_with_pinia.md)

---

## 作答後檢查

- 是否能指出每個狀態的唯一 owner，以及 render、commit、effect、route 和 store 的邊界？
- 是否能提出至少一項 render／hydration／accessibility 證據，而不是只說「加 memo」或「加 cache」？
- 是否能把修復拆成可觀測、可回滾的 rollout，並用 [Frontend State & Rendering Incident](./Hard_Assessments/frontend_state_rendering_incident.md) 完成整合測驗？
