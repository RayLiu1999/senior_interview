# Express.js 中介層 (Middleware) 詳解

- **難度**: 6
- **重要性**: 5
- **標籤**: `Express.js`, `Node.js`, `Middleware`

## 問題詳述

什麼是 Express.js 的中介層 (Middleware)？它的工作原理是什麼？請解釋不同類型的中介層（應用層、路由層、錯誤處理、內建、第三方）並提供程式碼範例。

## 核心理論與詳解

中介層是 Express.js 框架的**核心與靈魂**。它是一個函數，可以存取請求物件 (`req`)、回應物件 (`res`)，以及請求-回應週期中的下一個中介層函數 (`next`)。中介層函數可以執行以下任務：

- 執行任何程式碼。
- 對請求和回應物件進行修改。
- 結束請求-回應週期。
- 呼叫堆疊中的下一個中介層。

如果目前的中介層函數沒有結束請求-回應週期，它必須呼叫 `next()` 將控制權傳遞給下一個中介層函數，否則請求將會被「掛起」。

### 中介層的工作原理

想像一個 Express 應用程式的請求處理流程就像一條**裝配線**。當一個請求進來時，它會被放到這條裝配線上，然後依序經過一個個的「工人」（中介層）。每個工人都可以對這個請求（產品）進行檢查、加工，或者直接把它從裝配線上拿下來（結束請求）。如果一個工人完成了他的工作，他會按下按鈕 (`next()`)，讓產品繼續前進到下一個工人那裡。

```javascript
function (req, res, next) {
  // ... 執行某些操作 ...
  next(); // 將請求傳遞給下一個中介層
}
```

### 中介層的類型

#### 1. 應用層中介層 (Application-level Middleware)

這是最常見的中介層。使用 `app.use()` 或 `app.METHOD()`（如 `app.get()`, `app.post()`）將其綁定到應用程式物件上。

- **`app.use()`**: 如果沒有指定路徑，則中介層會對**每一個**傳入的請求執行。

  ```javascript
  const express = require('express');
  const app = express();

  // 一個簡單的日誌記錄中介層
  const requestLogger = (req, res, next) => {
    console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
    next(); // 傳遞給下一個中介層
  };

  app.use(requestLogger); // 應用於所有請求

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.listen(3000);
  ```

- **`app.use('/path', ...)`**: 只對以 `/path` 開頭的請求執行。

  ```javascript
  app.use('/admin', (req, res, next) => {
    // ... 檢查管理員權限 ...
    next();
  });
  ```

#### 2. 路由層中介層 (Router-level Middleware)

路由層中介層的運作方式與應用層中介層類似，但它被綁定到 `express.Router()` 的實例上。這有助於將路由和中介層模組化。

```javascript
const express = require('express');
const app = express();
const router = express.Router();

// 這個中介層只會應用於這個 router 實例
router.use((req, res, next) => {
  console.log('Time:', Date.now());
  next();
});

// 這個中介層只會應用於 /users/:id 這個路由
router.get('/users/:id', (req, res, next) => {
  // ... 驗證使用者 ID ...
  next();
}, (req, res) => {
  res.send(`User ID: ${req.params.id}`);
});

// 將 router 掛載到主應用程式上
app.use('/api', router);

app.listen(3000);
```

#### 3. 錯誤處理中介層 (Error-handling Middleware)

這類中介層的定義與其他中介層不同，它有**四個**參數，而不是三個：`(err, req, res, next)`。這使得 Express 能夠識別它是一個專門用來處理錯誤的中介層。

- **註冊時機**: 錯誤處理中介層必須在**所有** `app.use()` 和路由呼叫**之後**才定義。

```javascript
// ... 其他 app.use() 和路由 ...

// 錯誤處理中介層
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
```

- **觸發方式**: 在任何中介層或路由處理器中，只要呼叫 `next(error)`，Express 就會跳過所有後續的常規中介層，直接尋找並執行第一個錯誤處理中介層。

  ```javascript
  app.get('/error', (req, res, next) => {
    const err = new Error('This is a test error!');
    next(err); // 觸發錯誤處理
  });
  ```

#### 4. 內建中介層 (Built-in Middleware)

Express 提供了一些開箱即用的內建中介層，例如：

- **`express.json()`**: 解析傳入請求的 JSON payload。它是基於 `body-parser` 的。
- **`express.urlencoded()`**: 解析傳入請求的 URL-encoded payload。
- **`express.static()`**: 用於提供靜態檔案，例如圖片、CSS 和 JavaScript 檔案。

```javascript
const express = require('express');
const app = express();

app.use(express.json()); // 解析 JSON body
app.use(express.urlencoded({ extended: true })); // 解析 form data

// 將 public 目錄下的檔案作為靜態資源提供
app.use(express.static('public'));

app.post('/profile', (req, res) => {
  console.log(req.body); // req.body 現在包含了 POST 過來的 JSON 數據
  res.json(req.body);
});
```

#### 5. 第三方中介層 (Third-party Middleware)

Express 擁有龐大的生態系，有大量可用的第三方中介層來為應用程式添加各種功能。

- **安裝**: `npm install <middleware-name>`
- **使用**: `app.use(require('<middleware-name>')())`

**範例：使用 `helmet` 來提高安全性**

`helmet` 透過設定各種 HTTP 標頭來幫助保護您的應用程式。

```javascript
const express = require('express');
const helmet = require('helmet');
const app = express();

app.use(helmet()); // 使用 helmet 中介層

app.get('/', (req, res) => {
  res.send('Hello with security headers!');
});
```

**範例：使用 `morgan` 來記錄 HTTP 請求**

`morgan` 是一個流行的 HTTP 請求日誌記錄器。

```javascript
const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(morgan('dev')); // 使用 morgan 的 'dev' 格式來記錄日誌

app.get('/', (req, res) => {
  res.send('Request will be logged!');
});
```

### 結論

中介層是 Express.js 設計模式的核心，它提供了一種極其靈活和可組合的方式來處理請求和回應。透過串聯不同的中介層，開發者可以將複雜的功能分解成一系列簡單、可重用的組件，從而構建出清晰、模組化且易於維護的 Node.js 應用程式。
