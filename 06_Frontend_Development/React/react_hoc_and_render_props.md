# React 高階組件與 Render Props

- **難度**: 8
- **標籤**: `React`, `Design Patterns`, `HOC`, `Render Props`

## 問題詳述

什麼是高階組件 (Higher-Order Components, HOC) 和 Render Props？它們都是為了解決什麼問題而存在的？請分別舉例說明，並比較它們的優缺點。

## 核心理論與詳解

在 React Hooks 出現之前，高階組件 (HOC) 和 Render Props 是複用組件之間狀態邏輯的兩種最主要的設計模式。它們的核心目標都是為了解決**邏輯複用**的問題，避免代碼重複。

### 高階組件 (Higher-Order Components, HOC)

HOC 是一個函式，它接收一個組件作為參數，並返回一個新的、增強過的組件。這是一種源於函式式編程的模式。

- **結構**: `const EnhancedComponent = withSubscription(WrappedComponent, ...args);`
- **運作方式**: HOC 透過將共享的邏輯（如數據訂閱、權限驗證、日誌記錄等）封裝在一個容器組件中，然後將原始組件 (`WrappedComponent`) 渲染為該容器組件的子組件。共享的狀態或方法會以 `props` 的形式傳遞給被包裹的組件。

#### HOC 範例

假設我們需要一個邏輯來獲取當前的視窗寬度，並將其注入到多個組件中。

```javascript
// withWindowWidth.js (HOC)
import React, { useState, useEffect } from 'react';

function withWindowWidth(WrappedComponent) {
  // 返回一個新的類別或函式組件
  return function EnhancedComponent(props) {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 將新的 prop (windowWidth) 和原始的 props 一起傳遞下去
    return <WrappedComponent {...props} windowWidth={windowWidth} />;
  };
}

// MyComponent.js
function MyComponent({ windowWidth }) {
  return <div>Current window width is: {windowWidth}</div>;
}

// 使用 HOC
export default withWindowWidth(MyComponent);
```

#### HOC 的優缺點

- **優點**:
  - **邏輯複用**: 這是其主要目的，可以將邏輯與 UI 分離。
  - **非侵入性**: HOC 不會修改傳入的組件，而是將其包裹在一個新的組件中，符合組合優於繼承的原則。
  - **可配置性**: HOC 本身可以接收額外的參數，使其更加靈活。
- **缺點**:
  - **Wrapper Hell (包裝地獄)**: 大量使用 HOC 會導致組件樹層級過深，使得調試和數據追蹤變得困難。
  - **Props 命名衝突**: HOC 向被包裹組件注入的 `prop` 名稱可能會與組件自身的 `props` 衝突。
  - **隱式依賴**: 被包裹的組件隱式地依賴於 HOC 傳遞下來的 `props`，使得數據來源不夠明確。

### Render Props

Render Props 是一種技術，指組件接收一個返回 React 元素的函式作為 `prop`。組件本身不渲染任何東西，而是調用這個函式 `prop` 來決定要渲染什麼。

- **結構**: 組件的 `prop`（通常命名為 `render`，但也可以是任何名稱，如 `children`）是一個函式。
- **運作方式**: 擁有共享邏輯的組件（例如 `DataProvider`）執行其內部邏輯，然後將其狀態作為參數調用 `render` prop 函式，從而將狀態傳遞給 `render` 函式內部定義的組件，並由其決定如何渲染 UI。

#### Render Props 範例

同樣以獲取視窗寬度為例：

```javascript
// WindowWidthProvider.js (Render Props Component)
import React, { useState, useEffect } from 'react';

function WindowWidthProvider({ children }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 調用 children prop 函式，並將 state 作為參數傳入
  return children(windowWidth);
}

// App.js
function App() {
  return (
    <WindowWidthProvider>
      {(width) => ( // 這裡就是 render prop 函式
        <div>Current window width is: {width}</div>
      )}
    </WindowWidthProvider>
  );
}
```

#### Render Props 的優缺點

- **優點**:
  - **數據來源明確**: 共享的狀態是透過函式參數明確傳遞的，非常清晰。不會有 HOC 的 props 命名衝突問題。
  - **靈活性高**: 你可以在 `render` 函式內部渲染任何你想要的組件，比 HOC 的靜態包裹更靈活。
  - **避免 Wrapper Hell**: 通常只增加一層組件嵌套。
- **缺點**:
  - **組件嵌套**: 在 JSX 中使用時，可能會產生多層的函式嵌套，尤其是在組合多個 Render Props 組件時，可讀性會下降。
  - **語法稍顯繁瑣**: 與直接渲染組件相比，在 JSX 中編寫一個函式會增加一些語法噪音。

### HOC vs Render Props vs Hooks

隨著 React Hooks 的出現，HOC 和 Render Props 的使用場景大幅減少。自定義 Hooks (Custom Hooks) 提供了更簡潔、更直觀的方式來複用狀態邏輯，且沒有上述兩種模式的缺點。

- **自定義 Hook 範例**:
    ```javascript
    // useWindowWidth.js (Custom Hook)
    import { useState, useEffect } from 'react';

    function useWindowWidth() {
      const [windowWidth, setWindowWidth] = useState(window.innerWidth);

      useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }, []);

      return windowWidth;
    }

    // MyComponent.js
    function MyComponent() {
      const windowWidth = useWindowWidth(); // 直接、清晰地使用
      return <div>Current window width is: {windowWidth}</div>;
    }
    ```

自定義 Hook 既沒有 Wrapper Hell，也沒有 props 衝突，數據來源也非常明確，是現代 React 中複用邏輯的首選方案。然而，理解 HOC 和 Render Props 仍然非常重要，因為它們是 React 設計模式演進的重要部分，並且在許多舊的代碼庫和庫中仍然被廣泛使用。

## 程式碼範例 (可選)

```jsx
// useWindowWidth.js (自定義 Hook)
import { useState, useEffect } from 'react';

function useWindowWidth() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    // 清理函式：在組件卸載時移除監聽器
    return () => window.removeEventListener('resize', handleResize);
  }, []); // 空依賴項陣列確保 effect 只運行一次

  return windowWidth;
}

// MyComponent.js (使用自定義 Hook)
import React from 'react';
import { useWindowWidth } from './useWindowWidth';

function MyComponent() {
  // 直接、清晰地調用 hook 來獲取複用的邏輯
  const windowWidth = useWindowWidth(); 
  
  return <div>Current window width is: {windowWidth}px</div>;
}

// AnotherComponent.js (另一個使用自定義 Hook 的組件)
function AnotherComponent() {
  const width = useWindowWidth();
  
  return (
    <p style={{ color: width < 600 ? 'red' : 'blue' }}>
      This text changes color based on window width.
    </p>
  );
}
```

這個範例展示了自定義 Hook (`useWindowWidth`) 作為現代 React 邏輯複用首選方案的巨大優勢：

1.  **封裝邏輯**: `useWindowWidth` 將所有與監聽視窗寬度相關的 state (`useState`) 和副作用 (`useEffect`) 都封裝在一個獨立、可複用的函式中。
2.  **使用簡單**: 任何函式組件都可以像調用普通函式一樣調用 `useWindowWidth()` 來獲取所需的數據。
3.  **沒有缺點**: 它完美地解決了 HOC 和 Render Props 的所有痛點：
    -   **無 Wrapper Hell**: 不會增加任何額外的組件嵌套。
    -   **無 Props 衝突**: 狀態是作為函式返回值直接賦給變數，而不是作為 prop 注入。
    -   **數據來源清晰**: `const windowWidth = useWindowWidth();` 這樣的寫法讓數據來源一目了然。

