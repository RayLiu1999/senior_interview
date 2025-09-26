# Express.js 路由 (Routing) 詳解

- **難度**: 5
- **重要性**: 5
- **標籤**: `Express.js`, `Node.js`, `Routing`

## 問題詳述

請詳細解釋 Express.js 中的路由 (Routing) 機制。這包括如何定義基本路由、處理路由參數、使用路由處理器，以及如何使用 `express.Router` 來模組化路由。

## 核心理論與詳解

路由是指應用程式如何回應客戶端對特定端點 (Endpoint) 的請求，這個端點由一個 URI（或路徑）和一個特定的 HTTP 請求方法（GET、POST 等）組成。Express.js 提供了非常靈活且富有表現力的路由系統。

### 路由的結構

一個基本的路由定義結構如下：

```javascript
app.METHOD(PATH, HANDLER);
```

- `app`: `express` 的一個實例。
- `METHOD`: 一個小寫的 HTTP 請求方法，例如 `get`, `post`, `put`, `delete`。
- `PATH`: 伺服器上的路徑（URI）。
- `HANDLER`: 當路由被匹配時執行的函數，也稱為「路由處理器」。

### 基本路由

```javascript
const express = require('express');
const app = express();

// 回應對根路徑 (/) 的 GET 請求
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// 回應對 /about 路徑的 POST 請求
app.post('/about', (req, res) => {
  res.send('About page');
});

// 對於所有 HTTP 方法，都可以使用 app.all()
app.all('/secret', (req, res, next) => {
  console.log('Accessing the secret section ...');
  next(); // pass control to the next handler
});
```

### 路由路徑 (Route Paths)

路由路徑可以是一個字串、一個字串模式，或是一個正規表示式。結合 `req.params` 物件，我們可以從路徑中捕獲動態值。

#### 1. 路由參數 (Route Parameters)

路由參數是用來捕獲 URL 中特定位置的值的命名 URL 段。捕獲到的值會被填充到 `req.params` 物件中，並以其在路徑中指定的名稱作為鍵。

```javascript
// 匹配 /users/34, /users/ray, 等
// req.params 將是 { userId: '34' } 或 { userId: 'ray' }
app.get('/users/:userId', (req, res) => {
  res.send(`User ID: ${req.params.userId}`);
});

// 匹配 /books/sci-fi/123
// req.params 將是 { category: 'sci-fi', bookId: '123' }
app.get('/books/:category/:bookId', (req, res) => {
  res.send(`Book ID: ${req.params.bookId} in Category: ${req.params.category}`);
});
```

**注意**: 路由參數名稱必須由「文字字元」([A-Za-z0-9_]) 組成。

#### 2. 基於正規表示式的路徑

您可以在路徑字串中附加正規表示式，來更精確地控制參數的匹配規則。

```javascript
// 只匹配 bookId 是純數字的路徑
// 例如 /book/123 會匹配，但 /book/abc 不會
app.get('/book/:bookId(\\d+)', (req, res) => {
  res.send(`Book ID: ${req.params.bookId}`);
});
```

### 路由處理器 (Route Handlers)

您可以提供多個回呼函數作為路由處理器，它們的行為類似於中介層。這對於將路由的任務分解成更小的單元非常有用。

唯一的例外是，這些回呼函數可以呼叫 `next('route')` 來跳過該路由中剩餘的路由處理器。

```javascript
const cb0 = function (req, res, next) {
  console.log('CB0');
  next();
}

const cb1 = function (req, res, next) {
  console.log('CB1');
  next();
}

const cb2 = function (req, res) {
  res.send('Hello from C!');
}

// 使用一系列回呼函數來處理路由
app.get('/example/c', [cb0, cb1, cb2]);
```

### `app.route()`

您可以使用 `app.route()` 為一個路由路徑建立可鏈式呼叫的路由處理器。因為路徑是在一個地方指定的，所以建立模組化的路由非常有幫助，也能減少錯字和重複。

```javascript
app.route('/book')
  .get((req, res) => {
    res.send('Get a random book');
  })
  .post((req, res) => {
    res.send('Add a book');
  })
  .put((req, res) => {
    res.send('Update the book');
  });
```

### `express.Router`

當應用程式變得複雜時，將路由拆分到不同的檔案中是保持程式碼組織性的關鍵。`express.Router` 類別可以用來建立可掛載的、模組化的路由處理器。

一個 `Router` 實例是一個完整的中介層和路由系統，因此它常被稱為「迷你應用程式 (mini-app)」。

**1. 建立路由檔案 (`birds.js`)**

```javascript
// birds.js
const express = require('express');
const router = express.Router();

// 這個路由模組的中介層
router.use((req, res, next) => {
  console.log('Time: ', Date.now());
  next();
});

// 定義模組的根路由
router.get('/', (req, res) => {
  res.send('Birds home page');
});

// 定義 about 路由
router.get('/about', (req, res) => {
  res.send('About birds');
});

module.exports = router;
```

**2. 在主應用程式中使用路由模組 (`app.js`)**

```javascript
// app.js
const express = require('express');
const app = express();
const birds = require('./birds'); // 引入路由模組

// 將路由模組掛載到 /birds 路徑下
app.use('/birds', birds);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

現在，對 `/birds` 的請求會由 `birds.js` 中的根路由處理，而對 `/birds/about` 的請求會由 `about` 路由處理。這種方式極大地提高了專案的可維護性和擴展性。

### 結論

Express.js 的路由系統既簡單又強大。它允許開發者透過清晰的路徑定義、靈活的參數捕獲和可組合的處理器來構建 RESTful API。而 `express.Router` 的存在更是讓大型應用程式的路由管理變得井然有序。掌握路由是精通 Express.js 開發的基礎。
