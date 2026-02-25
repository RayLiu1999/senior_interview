# React 組件生命週期

- **難度**: 7
- **標籤**: `React`, `Lifecycle`, `Class Components`, `Functional Components`

## 問題詳述

請描述 React 類別組件 (Class Components) 的主要生命週期方法。並說明在函式組件 (Functional Components) 中，如何使用 Hooks 來模擬這些生命週期行為。

## 核心理論與詳解

React 組件的生命週期是指組件從被建立、掛載到 DOM、更新，再到最後從 DOM 卸載的整個過程。React 在這個過程中的特定時間點提供了一系列可選的生命週期方法，讓我們可以在這些時機執行自定義的邏輯。

### 類別組件的生命週期

類別組件的生命週期主要分為三個階段：**掛載 (Mounting)**、**更新 (Updating)** 和 **卸載 (Unmounting)**。

#### 1. 掛載 (Mounting)

當組件的實例被建立並插入到 DOM 中時，會依序調用以下方法：

- `constructor()`: 組件的建構函式。通常用於初始化狀態 (`this.state`) 和綁定事件處理函式的 `this`。這是唯一可以直接賦值給 `this.state` 的地方。
- `static getDerivedStateFromProps(props, state)`: 在每次 `render` 方法被調用前都會執行，包括首次掛載和後續更新。它應該返回一個物件來更新 state，或者返回 `null` 表示不更新。此方法非常罕見，主要用於 state 的值需要根據 props 的變化而變化的場景。
- `render()`: **(必要方法)** 這是類別組件中唯一必須的方法。它會讀取 `this.props` 和 `this.state`，並返回一個 React 元素（通常透過 JSX 建立），用於描述要渲染的 UI。`render` 函式應該是純函式，不應在其中修改組件狀態或產生副作用。
- `componentDidMount()`: 在組件被掛載到 DOM 後立即調用。這是執行需要 DOM 節點的初始化操作、發起網路請求或設定訂閱的最佳時機。

#### 2. 更新 (Updating)

當組件的 props 或 state 發生變化時，會觸發更新。更新階段會依序調用以下方法：

- `static getDerivedStateFromProps(props, state)`: 同上，每次更新前都會被調用。
- `shouldComponentUpdate(nextProps, nextState)`: 在接收到新的 props 或 state 後，`render()` 方法執行前被調用。預設情況下，每次 state 變化都會觸發重新渲染。你可以透過此方法比較 `nextProps` 和 `nextState` 與當前的 `this.props` 和 `this.state`，返回 `false` 來告知 React 本次更新可以被跳過，從而進行性能優化。
- `render()`: 同上，如果 `shouldComponentUpdate` 返回 `true`，則會再次調用。
- `getSnapshotBeforeUpdate(prevProps, prevState)`: 在 `render` 的輸出被提交到 DOM 之前調用。它使得你的組件可以在 DOM 被更新前從中捕獲一些資訊（例如，滾動位置）。此方法返回的任何值都將作為參數傳遞給 `componentDidUpdate`。
- `componentDidUpdate(prevProps, prevState, snapshot)`: 在組件更新並渲染到 DOM 後立即調用。此方法在首次渲染時不會被調用。你可以在這裡處理 DOM 操作或基於 props 的變化發起新的網路請求（但務必加上條件判斷，否則會導致無限循環）。

#### 3. 卸載 (Unmounting)

當組件從 DOM 中被移除時，會調用以下方法：

- `componentWillUnmount()`: 在組件被卸載和銷毀之前調用。這是執行任何必要清理操作的最佳位置，例如清除計時器、取消網路請求或移除在 `componentDidMount` 中建立的訂閱。

### 函式組件與 Hooks 的對應關係

在函式組件中，我們主要使用 `useState`、`useEffect` 和 `useLayoutEffect` 等 Hooks 來模擬類別組件的生命週期行為。

- **`constructor`**: 函式組件沒有建構函式。你可以使用 `useState` 來初始化狀態。
- **`componentDidMount`**: 使用 `useEffect` 並傳入一個空陣列 `[]` 作為第二個參數。
- **`componentDidUpdate`**: 使用 `useEffect` 並傳入一個包含依賴項的陣列。當依賴項變化時，函式會再次執行。
- **`componentWillUnmount`**: 在 `useEffect` 中返回一個清理函式。
- **`shouldComponentUpdate`**: 可以使用 `React.memo` 來包裹函式組件，它會對 props 進行淺層比較，如果 props 沒有變化，則跳過重新渲染。對於更複雜的比較，可以使用 `useMemo` 來快取計算結果。
- **`getDerivedStateFromProps`**: 這種情況較少見，但可以透過在渲染期間調用 `useState` 的更新函式來實現。
- **`getSnapshotBeforeUpdate` 和 `componentDidUpdate`**: `useLayoutEffect` 的行為與 `componentDidMount` 和 `componentDidUpdate` 類似，但它是在所有 DOM 變更後同步觸發的。這使得它適合讀取 DOM 佈局和同步重新渲染，其行為模式與 `getSnapshotBeforeUpdate` 結合 `componentDidUpdate` 非常相似。

## 程式碼範例 (可選)

```jsx
import React, { useState, useEffect } from 'react';

function LifecycleDemo({ prop }) {
  // 1. 模擬 constructor: 使用 useState 初始化 state
  const [count, setCount] = useState(0);
  const [stateFromProp, setStateFromProp] = useState(prop);

  // 2. 模擬 getDerivedStateFromProps: 在渲染期間直接從 prop 計算新 state
  // 雖然不完全相同，但這是 Hooks 中處理 prop 衍伸 state 的現代方式
  if (prop !== stateFromProp) {
    setStateFromProp(prop);
  }

  // 3. 模擬 componentDidMount 和 componentWillUnmount
  useEffect(() => {
    console.log('Component did mount');
    // 副作用操作，如 API 請求、設定訂閱
    const timerId = setInterval(() => {
      console.log('Timer tick');
    }, 2000);

    // 清理函式，會在組件卸載時執行
    return () => {
      console.log('Component will unmount');
      clearInterval(timerId);
    };
  }, []); // 空陣列確保只在掛載和卸載時執行

  // 4. 模擬 componentDidUpdate
  useEffect(() => {
    // 首次掛載時不執行此 console.log
    if (count > 0) {
      console.log(`Component did update: count is now ${count}`);
    }
  }, [count]); // 只有在 count 變化時才執行

  // 5. render: 函式組件的返回值本身就是 render 的結果
  console.log('Component is rendering');
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <p>Prop value: {prop}</p>
    </div>
  );
}

export default LifecycleDemo;
```

這個範例清晰地展示了如何使用 Hooks 來複現類別組件的核心生命週期行為：

- **`useState`** 在函式組件的頂層被調用，完成了狀態的初始化，類似於 `constructor`。
- **`useEffect` 搭配空依賴項 `[]`** 完美地模擬了 `componentDidMount`（執行副作用）和 `componentWillUnmount`（返回清理函式）。
- **`useEffect` 搭配依賴項 `[count]`** 則模擬了 `componentDidUpdate`，它會監聽 `count` 的變化並在變化後執行相應的邏輯。
- 函式組件的**主體**和**返回的 JSX** 就相當於類別組件的 `render` 方法。

