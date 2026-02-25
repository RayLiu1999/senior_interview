# React.js

React 是一個由 Facebook 開發的用於建立使用者介面的 JavaScript 函式庫。它以其組件化架構、虛擬 DOM 和單向數據流而聞名，成為現代前端開發中最受歡迎和最具影響力的技術之一。本章節將深入探討 React 的核心概念，包括其高效的調節機制、強大的 Hooks 系統，以及解決複雜應用中狀態管理和邏輯複用的經典設計模式。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [React 虛擬 DOM 與調節機制](./react_virtual_dom_and_reconciliation.md) | 8 | 5 | `React`, `Virtual DOM`, `Reconciliation`, `Fiber` |
| 2 | [React Hooks 深度解析](./react_hooks_deep_dive.md) | 8 | 5 | `React`, `Hooks`, `Functional Components` |
| 3 | [React 組件生命週期](./react_component_lifecycle.md) | 7 | 4 | `React`, `Lifecycle`, `Class Components` |
| 4 | [React 狀態管理](./react_state_management.md) | 8 | 5 | `React`, `State Management`, `Redux`, `Context API` |
| 5 | [React 高階組件與 Render Props](./react_hoc_and_render_props.md) | 8 | 4 | `React`, `Design Patterns`, `HOC`, `Render Props` |

---

## 學習建議

1. **掌握核心概念而非 API**: 深入理解虛擬 DOM、Diffing 演算法和 Fiber 架構的工作原理，這將幫助你編寫更高效的 React 應用，並在遇到性能瓶頸時知道如何著手優化。
2. **擁抱 Hooks**: Hooks 是現代 React 開發的基石。徹底理解 `useState`、`useEffect`、`useContext`、`useMemo` 和 `useCallback` 的運作方式和適用場景。學習如何編寫自己的自定義 Hooks 來封裝和複用邏輯。
3. **理解狀態管理演進**: 了解從 `props drilling` 到 `Context API`，再到 `Redux` 和 `Zustand` 等外部函式庫的演進過程。根據專案的複雜度和團隊需求，選擇最合適的狀態管理策略。
4. **溫故知新設計模式**: 雖然 Hooks 解決了大部分邏輯複用問題，但理解 HOC 和 Render Props 這些經典模式仍然非常重要。它們不僅能幫助你讀懂舊的代碼庫或第三方庫，更能加深你對 React 設計哲學的理解。
