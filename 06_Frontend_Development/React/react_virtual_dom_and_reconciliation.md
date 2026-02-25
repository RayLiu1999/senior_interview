# React 虛擬 DOM 與調節機制

- **難度**: 8
- **標籤**: `React`, `Virtual DOM`, `Reconciliation`

## 問題詳述

什麼是 React 的虛擬 DOM (Virtual DOM)？它如何運作？以及 React 的調節 (Reconciliation) 過程是什麼？

## 核心理論與詳解

虛擬 DOM (Virtual DOM, VDOM) 是 React 實現其高效渲染性能的核心機制。它是一個存在於記憶體中的輕量級 JavaScript 物件，作為真實 DOM 的抽象表示。當應用程式的狀態 (state) 發生變化時，React 並不會直接操作真實 DOM，而是會建立一個新的虛擬 DOM 樹，並將其與舊的虛擬 DOM 樹進行比較，找出兩者之間的差異，然後才將這些差異以最小化的方式更新到真實 DOM 上。

這個過程分為兩個主要階段：**Render** 和 **Commit**。

1. **Render 階段 (調節 Reconciliation)**: 在這個階段，React 會調用組件的 `render` 方法（或執行函式組件），產生一棵新的虛擬 DOM 樹。接著，React 會執行其核心的 **Diffing 演算法**，比較新舊兩棵虛擬 DOM 樹，找出需要變更的部分。這個過程是異步的，且可以被中斷（在 React 16+ 的 Fiber 架構中）。
2. **Commit 階段**: 在這個階段，React 會將 Diffing 演算法找出的所有變更一次性地、同步地應用到真實 DOM 上。這個過程是不可中斷的，以確保 UI 的一致性。

### Diffing 演算法的核心策略

為了在 O(n) 的時間複雜度內完成比較，React 的 Diffing 演算法基於以下幾個啟發式策略：

1. **不同類型的元素會產生不同的樹**: 如果根節點的元素類型不同（例如，從 `<div>` 變成 `<span>`），React 會直接銷毀舊的樹（包括所有子節點），並建立一棵全新的樹。舊組件會觸發 `componentWillUnmount`，新組件會掛載。

2. **同類型的 DOM 元素，比較屬性**: 如果兩個元素的類型相同，React 會保留相同的底層 DOM 節點，僅比較並更新有變化的屬性（如 `className`, `style`）。

3. **同類型的組件元素，遞歸處理**: 如果是同一個組件類型，React 會保留組件實例，更新其 `props`，並觸發 `componentWillReceiveProps()` 和 `shouldComponentUpdate()` 等生命週期方法。然後，React 會對其子節點進行遞歸的 Diffing。

4. **對子節點列表的處理 (Keys)**: 當處理一個節點的子元素列表時，React 會預設同時遍歷新舊兩個列表，並在發現差異時產生一個變更。如果沒有 `key`，在列表開頭插入一個元素會導致所有後續元素都被重新渲染，效率極低。

    引入 `key` 屬性後，React 就能夠利用 `key` 來識別哪些元素是新增、刪除或移動的。`key` 必須在兄弟節點之間是唯一的，但不需要全域唯一。React 會使用 `key` 來匹配新舊列表中的子元素，從而最小化 DOM 操作，例如只進行移動，而不是銷毀和重建。

### Fiber 架構的影響

在 React 16 之前，調節過程是遞歸且同步的，如果組件樹很龐大，可能會長時間佔用主線程，導致頁面卡頓。React 16 引入了 Fiber 架構，將調節過程重構成一個可中斷、可恢復的異步任務。

- **可中斷性**: React 可以將大的渲染任務拆分成小的工作單元 (Fiber)，並在每個單元完成後將控制權交還給主線程，讓瀏覽器有機會處理更高優先級的任務（如用戶輸入）。
- **優先級**: React 可以為不同的更新分配不同的優先級，例如，用戶輸入觸發的更新優先級高於數據請求回來的更新。

## 程式碼範例 (可選)

雖然無法直接展示 Diffing 過程，但 `key` 的使用是其核心概念的體現。

```jsx
import React, { useState } from 'react';

// 初始項目列表
const initialItems = [
  { id: 'a', text: 'Apple' },
  { id: 'b', text: 'Banana' },
  { id: 'c', text: 'Cherry' },
];

function ItemList() {
  const [items, setItems] = useState(initialItems);

  const addItemAtStart = () => {
    const newItem = { id: Date.now().toString(), text: 'New Fruit' };
    setItems([newItem, ...items]);
  };

  return (
    <div>
      <button onClick={addItemAtStart}>Add Item at Start</button>
      <ul>
        {items.map((item) => (
          // `key` 幫助 React 識別每個列表項的身份
          // 當列表順序改變時，React 可以移動 DOM 元素，而不是重新創建它們
          <li key={item.id}>
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ItemList;
```

這個 React 組件範例清晰地展示了 `key` 的重要性。當點擊按鈕在列表開頭添加一個新項目時：

- **如果沒有 `key`**: React 會逐個比較新舊列表的 `<li>`。它會認為第一個 `<li>` 的內容從 "Apple" 變成了 "New Fruit"，第二個從 "Banana" 變成了 "Apple"，以此類推，導致所有 `<li>` 元素都被更新，效率低下。
- **有了 `key`**: React 通過 `key` 知道 `id` 為 'a', 'b', 'c' 的 `<li>` 仍然存在，只是它們的位置需要向後移動。React 只需創建一個新的 `<li>` 用於 "New Fruit"，並將其插入到 DOM 的開頭。這極大地優化了性能，避免了不必要的 DOM 操作。

