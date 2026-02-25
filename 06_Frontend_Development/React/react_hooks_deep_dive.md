# React Hooks 深度解析

- **難度**: 8
- **標籤**: `React`, `Hooks`, `Functional Components`

## 問題詳述

什麼是 React Hooks？它們解決了什麼問題？請詳細解釋 `useState` 和 `useEffect` 的運作原理，並說明使用 Hooks 時需要注意的規則。

## 核心理論與詳解

React Hooks 是在 React 16.8 中引入的一組函式，它們允許你在函式組件 (Functional Components) 中 "勾入" (hook into) React 的狀態 (state) 和生命週期 (lifecycle) 等特性。在此之前，只有類別組件 (Class Components) 才能擁有狀態和生命週期方法。

### Hooks 解決的問題

Hooks 的出現主要為了解決以下幾個長期存在於 React 開發中的問題：

1. **組件之間難以複用狀態邏輯**: 傳統上，複用狀態邏輯需要依賴高階組件 (HOCs) 或 Render Props 等模式，這些模式會導致組件樹層級過深（俗稱 "Wrapper Hell"），使代碼難以追蹤。Hooks 讓你可以將狀態邏輯抽離成可複用的自定義 Hooks (Custom Hooks)，而無需改變組件結構。
2. **複雜的組件難以理解**: 在類別組件中，相關的邏輯常常被分散在不同的生命週期方法中。例如，數據獲取的邏輯可能同時存在於 `componentDidMount` 和 `componentDidUpdate`，而事件監聽器的設定和清理則分別在 `componentDidMount` 和 `componentWillUnmount`。Hooks 允許你根據邏輯相關性來組織代碼，而不是根據生命週期方法。
3. **類別的困惑**: 對於初學者（甚至一些有經驗的開發者）來說，JavaScript 的 `this` 關鍵字是一個常見的混淆點。類別組件的語法也相對繁瑣。函式組件加上 Hooks 的寫法更為簡潔，更符合 JavaScript 的函式式編程風格。

### 核心 Hooks 詳解

#### `useState`

`useState` 是最基礎的 Hook，它允許函式組件擁有自己的狀態。

- **運作原理**: 當你呼叫 `useState` 時，React 會在內部為該組件實例保存一個狀態變數。它返回一個包含兩個元素的陣列：當前的狀態值和一個用來更新該狀態的函式。
- **狀態更新**: 調用更新函式（如 `setCount`）時，React 會安排一次組件的重新渲染。在下一次渲染時，`useState` 會返回最新的狀態值。React 透過組件內 Hooks 的調用順序來確保每次渲染時 `useState` 能獲取到正確的狀態。

#### `useEffect`

`useEffect` 讓你可以在函式組件中執行副作用 (Side Effects) 操作，例如數據獲取、訂閱或手動操作 DOM。它相當於 `componentDidMount`、`componentDidUpdate` 和 `componentWillUnmount` 這三個生命週期方法的組合。

- **運作原理**: 你傳遞給 `useEffect` 的函式會在每次組件渲染完成後執行。
- **依賴項陣列 (Dependency Array)**: `useEffect` 的第二個參數是一個依賴項陣列。
  - 如果**不提供**此參數，副作用函式會在每次渲染後都執行。
  - 如果提供一個**空陣列 `[]`**，副作用函式只會在組件首次掛載 (mount) 時執行一次，相當於 `componentDidMount`。
  - 如果提供一個包含變數的**陣列 `[dep1, dep2]`**，副作用函式會在首次掛載時執行，並且只有當陣列中的任何一個依賴項發生變化時，才會在後續的渲染中再次執行。React 會對比新舊依賴項的值（使用 `Object.is` 比較）。
- **清理函式 (Cleanup Function)**: `useEffect` 的函式可以選擇性地返回一個函式，這個函式被稱為清理函式。它會在組件卸載 (unmount) 前，以及在下一次副作用函式執行前被調用。這對於清理計時器、取消網路請求或移除事件監聽器至關重要，以防止記憶體洩漏。

### Hooks 的規則

為了讓 Hooks 能夠正常運作，React 規定了兩條必須遵守的規則，並提供了 linter 插件來強制執行：

1. **只能在頂層調用 Hooks**: 不要在迴圈、條件判斷或巢狀函式中調用 Hooks。這是為了確保 Hooks 在每次渲染時都以相同的順序被調用，React 依賴這個順序來正確地將狀態與對應的 `useState` 或 `useEffect` 關聯起來。
2. **只能在 React 函式中調用 Hooks**: 只能在 React 函式組件或自定義 Hooks 中調用 Hooks，不要在普通的 JavaScript 函式中調用。

## 程式碼範例 (可選)

```jsx
import React, { useState, useEffect } from 'react';

function Timer() {
  const [count, setCount] = useState(0);

  // 使用 useEffect 來設定一個計時器 (副作用)
  useEffect(() => {
    console.log('useEffect is running. Setting up timer.');

    // 設定一個每秒觸發一次的計時器
    const timerId = setInterval(() => {
      // setCount(count + 1); // 錯誤的寫法！這裡的 count 是閉包中的舊值
      setCount(prevCount => prevCount + 1); // 正確的寫法：使用函式形式更新 state
    }, 1000);

    // 返回一個清理函式
    // 這個函式會在組件卸載時，或下一次 useEffect 執行前被調用
    return () => {
      console.log('Cleanup function is running. Clearing timer.');
      clearInterval(timerId);
    };
  }, []); // 空依賴項陣列 `[]` 意味著這個 effect 只在組件掛載時執行一次

  return (
    <div>
      <h1>Timer: {count} seconds</h1>
    </div>
  );
}

export default Timer;
```

這個 `Timer` 組件範例完美地詮釋了 `useState` 和 `useEffect` 的協同工作：

1.  **`useState`**: 用於儲存並更新 `count` 狀態。
2.  **`useEffect`**:
    -   在組件首次渲染後執行，設定一個 `setInterval` 計時器。
    -   由於依賴項陣列是空的 `[]`，這個副作用只會執行一次，不會在每次 `count` 更新後都重新設定計時器。
    -   它返回一個**清理函式** `clearInterval`，這至關重要。當組件被卸載時，React 會調用這個函式來清除計時器，從而防止了記憶體洩漏和不必要的背景執行。
    -   在更新狀態時，使用了 `setCount(prevCount => ...)` 的函式形式，這是處理閉包中舊狀態問題的最佳實踐。

