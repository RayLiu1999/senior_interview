# Vue.js

Vue.js 是一個漸進式 JavaScript 框架，以其平易近人的 API、出色的性能和靈活的生態系統而聞名。本章節涵蓋了 Vue 的核心概念，從響應式系統的底層原理到高階的狀態管理模式，旨在幫助您深入理解 Vue 的運作機制，並為解決複雜的前端挑戰做好準備。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [Vue 組件生命週期](./vue_component_lifecycle.md) | 6 | 5 | `Vue`, `Lifecycle`, `Composition API`, `Options API` |
| 2 | [Vue 響應式系統原理](./vue_reactivity_system.md) | 8 | 5 | `Vue`, `Reactivity`, `Proxy`, `Ref`, `Reactive` |
| 3 | [Vue 組件間通信](./vue_component_communication.md) | 6 | 5 | `Vue`, `Component`, `Communication`, `Props`, `Emit` |
| 4 | [Vue Router 與導航守衛](./vue_routing_and_navigation_guards.md) | 7 | 5 | `Vue`, `Vue Router`, `Routing`, `Navigation Guards` |
| 5 | [Vue 狀態管理 (Pinia)](./vue_state_management_with_pinia.md) | 7 | 5 | `Vue`, `State Management`, `Pinia`, `Store` |

---

## 學習建議

1. **深入理解響應式原理**: Vue 的核心是其響應式系統。徹底理解 `Proxy`、`ref` 和 `reactive` 的工作原理，是掌握 Vue 的關鍵。這有助於您編寫更高效的代碼並輕鬆調試問題。
2. **掌握組件生命週期**: 熟悉每個生命週期鉤子的觸發時機和適用場景，特別是在 `setup` 函式中如何使用 `onMounted` 等鉤子，對於處理異步操作和 DOM 交互至關重要。
3. **靈活運用組件通信**: 根據場景選擇最合適的通信方式。雖然 `props` 和 `emit` 是基礎，但 `provide/inject` 在處理深層嵌套時非常有用，而 Pinia 則是構建大型應用的必備工具。
4. **精通導航守衛**: Vue Router 的導航守衛是實現用戶認證、權限控制和頁面過渡邏輯的核心。請務必掌握 `beforeEach` 的用法以及完整的導航解析流程。
5. **擁抱 Pinia**: Pinia 提供了更簡潔、更符合 Composition API 思維的狀態管理方案，並且擁有完美的 TypeScript 支持。如果您來自 Vuex，請重點理解其 API 的簡化之處。
