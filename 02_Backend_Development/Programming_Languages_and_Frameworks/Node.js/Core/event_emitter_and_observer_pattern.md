# 詳解 Node.js 的 EventEmitter 與觀察者模式

- **難度**: 7
- **重要程度**: 4
- **標籤**: `Node.js`, `EventEmitter`, `Observer Pattern`, `Events`

## 問題詳述

Node.js 的核心 API 大量使用了基於事件的異步模型，而 `EventEmitter` 類是這一模型的基礎。請解釋：

1. `EventEmitter` 是什麼？它的核心工作原理是什麼？
2. `EventEmitter` 與設計模式中的「觀察者模式」(Observer Pattern) 有何關聯？
3. 請舉例說明如何自定義一個繼承自 `EventEmitter` 的類。

## 核心理論與詳解

在 Node.js 中，許多對象都會觸發事件。例如，一個 `net.Server` 物件會在每次有新連接時觸發 `connection` 事件，一個 `fs.ReadStream` 會在檔案被打開時觸發 `open` 事件。所有能觸發事件的對象都是 `EventEmitter` 類的實例。

### 1. EventEmitter：Node.js 事件模型的基石

**是什麼？**
`EventEmitter` 是 `events` 模組提供的一個類，它允許我們註冊和觸發自定義事件。它構成了 Node.js 中所有異步事件處理的核心機制。你可以把它想像成一個「事件中心」或「訊息代理」，允許對象之間進行解耦的通信。

**核心工作原理**:
`EventEmitter` 的實例內部維護著一個存放事件監聽器的結構（通常是一個雜湊表或字典），其中：

- **鍵 (Key)** 是事件的名稱（一個字串）。
- **值 (Value)** 是一個由該事件的所有監聽器（回呼函式）組成的陣列。

它的運作主要依賴以下幾個核心方法：

- `emitter.on(eventName, listener)` 或 `emitter.addListener(eventName, listener)`:
    註冊一個監聽器函式到指定事件名稱的監聽器陣列末尾。當該事件被觸發時，監聽器會被調用。

- `emitter.emit(eventName[, ...args])`:
    觸發一個指定的事件。它會按照註冊順序，**同步地** 調用所有監聽該事件的監聽器，並將提供的參數 (`...args`) 傳遞給它們。如果事件有監聽器，返回 `true`，否則返回 `false`。

- `emitter.once(eventName, listener)`:
    註冊一個單次監聽器。這個監聽器在事件第一次被觸發後，會被立即移除，之後不再響應。

- `emitter.off(eventName, listener)` 或 `emitter.removeListener(eventName, listener)`:
    從指定事件的監聽器陣列中移除一個監聽器。

**程式碼範例**:

```javascript
const EventEmitter = require('events');

// 創建一個 EventEmitter 實例
const myEmitter = new EventEmitter();

// 註冊一個 'greeting' 事件的監聽器
myEmitter.on('greeting', (name) => {
  console.log(`Hello, ${name}!`);
});

// 註冊另一個監聽器
myEmitter.on('greeting', (name) => {
  console.log(`Greetings to you, ${name}!`);
});

// 觸發 'greeting' 事件，並傳遞參數
console.log('觸發事件...');
myEmitter.emit('greeting', 'Node.js');
console.log('事件觸發完畢。');
```

**輸出**:

```javascript
觸發事件...
Hello, Node.js!
Greetings to you, Node.js!
事件觸發完畢。
```

從輸出可以看出，`emit` 是同步執行的。

### 2. 與觀察者模式的關聯

`EventEmitter` 的機制是 **觀察者模式** 的一個典型實現。

**觀察者模式 (Observer Pattern)**:
這是一種行為設計模式，它定義了對象之間的一對多依賴關係。當一個對象（被稱為 **Subject** 或 **Observable**）的狀態發生改變時，所有依賴於它的對象（被稱為 **Observers**）都會得到通知並自動更新。

**兩者對應關係**:

| 觀察者模式角色 | EventEmitter 對應概念 | 描述 |
| :--- | :--- | :--- |
| **Subject (主題)** | `EventEmitter` 實例 | 維護一個觀察者列表，並在狀態變化時通知它們。 |
| **Observer (觀察者)** | 監聽器 (Listener) 函式 | 等待 Subject 的通知，並在收到通知後執行特定邏輯。 |
| **註冊 (Register/Subscribe)** | `emitter.on()` / `addListener()` | Observer 向 Subject 註冊，表示自己對其狀態感興趣。 |
| **註銷 (Unregister/Unsubscribe)** | `emitter.off()` / `removeListener()` | Observer 告訴 Subject 自己不再關心其狀態。 |
| **通知 (Notify)** | `emitter.emit()` | Subject 的狀態發生變化，遍歷並調用所有已註冊 Observer 的更新方法。 |

因此，`EventEmitter` 提供了一個內建的、易於使用的框架，讓開發者能夠在 Node.js 中輕鬆應用觀察者模式，從而實現模組間的低耦合通信。

### 3. 自定義 EventEmitter

在實踐中，我們通常不會直接使用 `EventEmitter` 的實例，而是創建一個繼承自 `EventEmitter` 的自定義類。這使得我們的類本身就具備了發布和訂閱事件的能力。

**程式碼範例：一個會定時發出 `tick` 事件的時鐘類**

```javascript
const EventEmitter = require('events');

// 創建一個繼承自 EventEmitter 的 Clock 類
class Clock extends EventEmitter {
  constructor() {
    super(); // 必須調用 super() 來初始化父類
    this.startTicking();
  }

  startTicking() {
    setInterval(() => {
      // 每秒觸發一次 'tick' 事件
      this.emit('tick', new Date());
    }, 1000);
  }
}

// 創建 Clock 實例
const myClock = new Clock();

// 註冊 'tick' 事件的監聽器
myClock.on('tick', (date) => {
  console.log(` 時鐘滴答: ${date.toLocaleTimeString()}`);
});

// 註冊一個只執行一次的監聽器
myClock.once('tick', () => {
  console.log('時鐘開始運轉了！');
});
```

**工作流程**:

1. `Clock` 類繼承了 `EventEmitter`，因此 `myClock` 實例擁有 `on`, `emit` 等方法。
2. 在 `constructor` 中，`startTicking` 方法被調用，它設置了一個每秒執行一次的定時器。
3. 定時器每次觸發時，`myClock` 實例就會 `emit` 一個 `tick` 事件，並將當前時間作為參數傳遞出去。
4. 所有通過 `myClock.on('tick', ...)` 註冊的監聽器都會被調用，並接收到時間參數。
5. `myClock.once` 註冊的監聽器在第一次 `tick` 事件後會被自動移除。

## 總結

- `EventEmitter` 是 Node.js 異步、事件驅動架構的核心，它提供了一種發布/訂閱（Pub/Sub）風格的通信機制。
- 它是 **觀察者設計模式** 的一個經典實現，其中 `EventEmitter` 實例是「主題 (Subject)」，而監聽器函式是「觀察者 (Observer)」。
- 通過繼承 `EventEmitter`，我們可以輕鬆地創建能夠發出事件的自定義類，這是在 Node.js 中構建模組化和可擴展應用的常見模式。
- `emit` 的執行是 **同步** 的，它會按順序執行所有監聽器，然後才繼續執行後續程式碼。如果需要異步行為，應在監聽器函式內部使用 `setImmediate()` 或 `process.nextTick()`。
