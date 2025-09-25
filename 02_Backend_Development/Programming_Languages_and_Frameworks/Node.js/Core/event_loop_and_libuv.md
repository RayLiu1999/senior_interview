# 詳述 Node.js 的事件循環 (Event Loop) 及其與 Libuv 的關係

- **難度**: 8
- **標籤**: `Node.js`, `Event Loop`, `Libuv`, `Asynchronous`

## 問題詳述

Node.js 的核心特性是其非阻塞、事件驅動的 I/O 模型，而事件循環 (Event Loop) 是實現這一模型的關鍵。請詳細解釋 Node.js 的事件循環是如何運作的？它包含哪些主要階段？並闡述 Libuv 在這個架構中扮演了什麼角色。

## 核心理論與詳解

Node.js 的單線程非阻塞 I/O 模型使其能夠用相對較少的資源處理大量並發連接。這個模型的核心就是事件循環，但一個常見的誤解是認為事件循環是 V8 引擎的一部分。事實上，**事件循環是由 Node.js 的底層 C++ 函式庫 Libuv 提供的**。

### 1. 核心概念：Node.js 架構與 Libuv

- **V8 引擎**: 由 Google 開發的高效能 JavaScript 引擎。它負責解析、編譯和執行 JavaScript 程式碼，管理記憶體（堆和棧），並實現垃圾回收。但 V8 本身對 I/O 或網路等作業系統層級的操作一無所知。

- **Node.js**: 它是一個基於 V8 引擎的 JavaScript **執行環境**。Node.js 通過 C++ 綁定為 JavaScript 擴展了 V8 的能力，賦予其與作業系統互動的功能，如檔案系統 (fs)、網路 (http, net) 和子處理程序等。

- **Libuv**: 是一個跨平台的 C++ 函式庫，專注於異步 I/O。它為 Node.js 提供了事件循環、異步 TCP/UDP Socket、異步 DNS 解析、異步檔案 I/O、子處理程序以及一個執行緒池 (Thread Pool) 等底層能力。

**關係總結**:
Node.js 將 V8 和 Libuv 結合在一起。當你執行一段 Node.js 程式碼時：

- 同步的、計算密集型的 JavaScript 程式碼由 V8 在主線程上執行。
- 異步的 I/O 操作（如 `fs.readFile`, `http.get`）則被 Node.js 轉交給 Libuv 處理。Libuv 利用作業系統的異步機制（如 Linux 的 epoll, Windows 的 IOCP）或其內部維護的執行緒池來執行這些耗時操作，完成後將回呼函式放回事件循環的佇列中等待執行。

### 2. 事件循環的運作模型

事件循環是一個持續運行的進程，它會不斷檢查是否有待處理的事件（如計時器到期、I/O 操作完成），並執行對應的回呼函式。你可以將它想像成一個餐廳服務生，不斷地在廚房（Libuv/OS）和餐桌（V8/主線程）之間穿梭，遞送訂單和上菜。

事件循環的每一次迭代稱為一個 "tick"，每個 tick 都包含幾個明確的階段。

### 3. 事件循環的六個主要階段

事件循環的執行順序是固定的，每個階段都有一個先進先出 (FIFO) 的回呼函式佇列。

![Event Loop Phases](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/event-loop-light.svg)

1. **Timers (計時器) 階段**:
    - 執行由 `setTimeout()` 和 `setInterval()` 設定的回呼函式。
    - Node.js 會檢查是否有計時器已到期，如果有，則執行其回呼。

2. **Pending Callbacks (待定回呼) 階段**:
    - 執行上一個循環中被延遲的 I/O 回呼。
    - 例如，當一個 TCP Socket 在接收資料時發生錯誤，某些系統希望立即報告錯誤，這個回呼就會在此階段執行。

3. **Idle, Prepare (閒置, 準備) 階段**:
    - 僅在 Node.js 內部使用，開發者通常無需關心。

4. **Poll (輪詢) 階段**:
    - 這是事件循環中 **最重要** 的階段，佔據了最長的執行時間。
    - **主要職責**:
        1. 計算應該阻塞和輪詢 I/O 的時間。
        2. 處理輪詢佇列中的事件，執行 I/O 相關的回呼函式（例如 `fs.readFile` 的回呼）。
    - **執行邏輯**:
        - 如果輪詢佇列 **不為空**，事件循環會遍歷佇列並同步執行回呼，直到佇列為空或達到系統限制。
        - 如果輪旬佇列 **為空**：
            - 如果程式碼中已使用 `setImmediate()` 設定了回呼，事件循環會結束輪詢階段，進入 `Check` 階段。
            - 如果沒有 `setImmediate()` 回呼，事件循環會 **阻塞** 在此階段，等待新的 I/O 事件完成。同時，它會檢查 `Timers` 階段是否有計時器到期，如果有，它會回到 `Timers` 階段執行計時器回呼。

5. **Check (檢查) 階段**:
    - 專門用來執行 `setImmediate()` 設定的回呼函式。
    - 這個階段在 `Poll` 階段完成後立即執行。

6. **Close Callbacks (關閉事件回呼) 階段**:
    - 執行一些關閉類型的回呼，例如 `socket.on('close', ...)`。

### 4. `process.nextTick()` 與 `Promise` 的微任務

除了上述宏任務 (Macrotask) 階段，Node.js 還有一個 **微任務 (Microtask) 佇列** 的概念。

- **`process.nextTick()`**: 它有自己獨立的佇列，並且擁有 **最高優先級**。這個佇列中的所有回呼會在 **當前階段完成後、進入下一個階段之前** 被立即清空。這意味著 `nextTick` 可以插隊到任何階段之間。
- **Promises (例如 `.then()`, `.catch()`, `.finally()`)**: Promise 的回呼會被放入另一個微任務佇列。這個佇列會在 `nextTick` 佇列被清空後，下一個事件循環階段開始前執行。

**執行順序**:
`process.nextTick()` 佇列 > `Promise` 微任務佇列 > 事件循環的各個宏任務階段

## 程式碼範例

```javascript
const fs = require('fs');

console.log('start'); // 1. 同步執行

// A. 放入 Timers 佇列
setTimeout(() => {
  console.log('setTimeout 1'); // 7. Timers 階段
}, 0);

// B. 放入 Check 佇列
setImmediate(() => {
  console.log('setImmediate 1'); // 8. Check 階段
});

// C. 放入 I/O 佇列
fs.readFile(__filename, () => {
  console.log('readFile 1'); // 6. Poll 階段

  setTimeout(() => {
    console.log('setTimeout in readFile'); // 11. 下一輪 Timers
  }, 0);

  setImmediate(() => {
    console.log('setImmediate in readFile'); // 9. Check 階段
  });

  process.nextTick(() => {
    console.log('nextTick in readFile'); // 10. I/O 回呼結束後，下一階段前
  });
});

// D. 放入 Promise 微任務佇列
Promise.resolve().then(() => {
  console.log('Promise 1'); // 3. 微任務
});

// E. 放入 nextTick 佇列
process.nextTick(() => {
  console.log('nextTick 1'); // 2. 微任務 (最高優先級)
});

console.log('end'); // 4. 同步執行
```

**預期輸出**:

```
start
end
nextTick 1
Promise 1
readFile 1
setTimeout 1
setImmediate 1
setImmediate in readFile
nextTick in readFile
setTimeout in readFile
```

*注意：`setTimeout` 和 `setImmediate` 的順序有時會因系統效能而變化，但在 I/O 回呼中，`setImmediate` 總是先於 `setTimeout`。*