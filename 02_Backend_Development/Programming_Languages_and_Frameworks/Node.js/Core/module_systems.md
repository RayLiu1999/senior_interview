# 比較 Node.js 中的模組系統：CommonJS vs. ESM

- **難度**: 6
- **標籤**: `Node.js`, `Modules`, `CommonJS`, `ESM`

## 問題詳述

Node.js 最初使用 CommonJS (CJS) 作為其模組系統。然而，隨著 ECMAScript 標準的發展，ES Modules (ESM) 已成為 JavaScript 的官方標準模組系統。請比較這兩種模組系統在語法、載入機制和互通性方面的核心差異。

## 核心理論與詳解

模組化是現代軟體開發的基石，它允許我們將複雜的程式碼庫拆分成獨立、可重用的部分。Node.js 的演進過程中出現了兩種主要的模組系統：CommonJS 和 ES Modules。

### 1. CommonJS (CJS)

CommonJS 是 Node.js 早期採用的模組系統，專為伺服器端設計。它的設計目標是實現同步的、簡單的模組載入。

**核心語法**:

- **匯出 (Export)**: 使用 `module.exports` 物件或 `exports` 的屬性來匯出模組成員。`exports` 只是 `module.exports` 的一個引用。

  ```javascript
  // math.js
  const PI = 3.14;
  function add(a, b) {
    return a + b;
  }

  // 匯出方式一：匯出整個物件
  module.exports = { PI, add };

  // 匯出方式二：逐一新增屬性
  // exports.PI = PI;
  // exports.add = add;
  ```

- **匯入 (Import)**: 使用 `require()` 函式來匯入模組。

  ```javascript
  // app.js
  const math = require('./math.js');
  console.log(math.add(2, 3)); // 5
  ```

**載入機制**:

- **同步載入 (Synchronous)**: `require()` 是一個同步函式。當 Node.js 遇到 `require('./math.js')` 時，它會暫停執行，立即去讀取並執行 `math.js`，然後返回 `module.exports` 的值。
- **動態載入**: `require()` 的路徑可以是變數，可以在程式碼的任何地方執行，這使得動態載入模組成為可能。
- **快取 (Caching)**: 第一次載入模組後，其結果會被快取。後續對同一個模組的 `require()` 調用會直接從快取中讀取，而不會重新執行模組檔案。

### 2. ES Modules (ESM)

ESM 是由 ECMAScript 官方標準化的模組系統，旨在提供一個同時適用於瀏覽器和伺服器端的統一解決方案。從 Node.js v13.2.0 開始，Node.js 正式支援 ESM，無需任何標誌。

**核心語法**:

- **匯出 (Export)**: 使用 `export` 關鍵字。可以進行命名匯出 (named export) 或預設匯出 (default export)。

  ```javascript
  // math.mjs
  export const PI = 3.14;
  export function add(a, b) {
    return a + b;
  }

  // 預設匯出
  // export default { PI, add };
  ```

- **匯入 (Import)**: 使用 `import` 關鍵字。

  ```javascript
  // app.mjs
  import { add, PI } from './math.mjs';
  // 若是預設匯出，則使用： import math from './math.mjs';
  console.log(add(2, 3)); // 5
  ```

  *注意：在 Node.js 中使用 ESM 時，檔案通常建議使用 `.mjs` 副檔名，或者在 `package.json` 中設定 `"type": "module"`。*

**載入機制**:

- **異步載入 (Asynchronous)**: ESM 的設計是異步的。它的載入過程分為兩個階段：
  1. **解析 (Parsing)**: 引擎靜態解析 `import` 和 `export` 語句，確定模組之間的依賴關係圖，但不執行任何程式碼。這個階段可以找出不存在的匯入。
  2. **執行 (Execution)**: 根據依賴圖，從底層的模組開始執行程式碼。
- **靜態結構**: `import` 和 `export` 必須在模組的頂層作用域使用，不能在條件語句或函式中動態使用。這種靜態結構使得編譯器可以在編譯時進行優化，例如 Tree Shaking（搖樹優化），移除未被使用的程式碼。
- **動態匯入**: 雖然 `import` 是靜態的，但 ESM 提供了 `import()` 函式，它返回一個 Promise，允許你異步地、動態地載入模組。

### 3. 核心差異總結

| 特性 | CommonJS (CJS) | ES Modules (ESM) |
| :--- | :--- | :--- |
| **語法** | `require`, `module.exports`, `exports` | `import`, `export` |
| **載入機制** | **同步**載入 | **異步**載入 |
| **值傳遞** | 匯出的是**值的拷貝** (對於原始類型) 或**引用** (對於物件) | 匯出的是**即時綁定 (Live Binding)**，匯出的值在原模組中改變，匯入的值也會跟著變 |
| **作用域** | `this` 指向當前模組 (`module.exports`) | `this` 在頂層作用域是 `undefined` |
| **結構** | 動態結構，`require` 可以在任何地方調用 | 靜態結構，`import`/`export` 必須在頂層 |
| **執行環境** | 主要在 Node.js | 瀏覽器和 Node.js |
| **優化** | 難以進行靜態分析和 Tree Shaking | 易於靜態分析，支持 Tree Shaking |

**值的拷貝 vs. 即時綁定**:
這是一個關鍵區別。

- **CJS**:

  ```javascript
  // counter.js
  let count = 1;
  function increment() { count++; }
  module.exports = { count, increment };

  // main.js
  const { count, increment } = require('./counter.js');
  console.log(count); // 1
  increment();
  console.log(count); // 1 (count 是值的拷貝，不會被更新)
  ```

- **ESM**:

  ```javascript
  // counter.mjs
  export let count = 1;
  export function increment() { count++; }

  // main.mjs
  import { count, increment } from './counter.mjs';
  console.log(count); // 1
  increment();
  console.log(count); // 2 (count 是即時綁定，會被更新)
  ```

### 4. 互通性

在現代 Node.js 專案中，CJS 和 ESM 可能會並存。Node.js 提供了一些機制來處理這種情況：

- **在 CJS 中載入 ESM**:
  只能通過動態的 `import()` 函式來實現。

  ```javascript
  // main.js (CJS)
  async function loadESM() {
    const { someFunction } = await import('./module.mjs');
    someFunction();
  }
  loadESM();
  ```

- **在 ESM 中載入 CJS**:
  可以直接使用 `import`，Node.js 會將 `module.exports` 的值作為預設匯出。

  ```javascript
  // main.mjs (ESM)
  import cjsModule from './module.js'; // cjsModule 即 module.exports
  cjsModule.someFunction();
  ```

## 總結

CommonJS 和 ES Modules 代表了 JavaScript 模組化的兩個不同時代。CJS 是 Node.js 成功的基石，以其同步和簡單性著稱。而 ESM 作為官方標準，憑藉其靜態結構、異步載入和更好的優化支持，正成為現代 JavaScript 開發（包括 Node.js 和瀏覽器）的未來方向。理解它們的差異對於編寫高效、可維護的 Node.js 應用至關重要。
