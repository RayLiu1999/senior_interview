# Express.js 錯誤處理 (Error Handling)

- **難度**: 6
- **重要性**: 4
- **標籤**: `Express.js`, `Node.js`, `Error Handling`

## 問題詳述

Express.js 是如何處理錯誤的？請解釋同步和非同步程式碼中的錯誤處理方式，並說明如何建立一個集中的錯誤處理中介層。

## 核心理論與詳解

在 Express.js 中，錯誤處理是構建健壯應用程式的關鍵部分。Express 提供了一個預設的錯誤處理機制，但通常我們需要自訂一個集中的錯誤處理中介層來滿足應用程式的需求。

### 預設的錯誤處理

如果您的應用程式中沒有任何自訂的錯誤處理中介層，Express 會使用其內建的錯誤處理器。這個處理器會將錯誤堆疊資訊返回給客戶端（在開發模式下），或是一個簡單的 "Internal Server Error" 訊息（在生產模式下）。

### 捕獲錯誤

錯誤的來源可以分為兩類：同步錯誤和非同步錯誤。它們的處理方式有所不同。

#### 1. 同步錯誤處理

在同步執行的程式碼中（例如，路由處理器或中介層中的非回呼函數部分），如果發生錯誤，Express 會自動捕獲它並將其轉發到錯誤處理中介層。

```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  // 這是一個同步錯誤
  throw new Error('BROKEN');
});

// 錯誤處理中介層
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(3000);
```
在上面的例子中，當請求 `/` 時，`throw new Error('BROKEN')` 會被 Express 捕獲，然後請求流程會直接跳到我們定義的錯誤處理中介層。

#### 2. 非同步錯誤處理

對於在非同步函數（例如，回呼函數、Promises 的 `.then()` 或 `async/await`）中發生的錯誤，**您必須自己捕獲它們並將它們傳遞給 `next()` 函數**。Express 不會自動捕獲它們。

**A. 使用回呼函數 (Callbacks)**

如果您使用傳統的非同步回呼模式，必須在回呼中手動呼叫 `next(err)`。

```javascript
app.get('/callback-error', (req, res, next) => {
  fs.readFile('/file-does-not-exist', (err, data) => {
    if (err) {
      // 必須手動將錯誤傳遞給 next()
      return next(err);
    }
    res.send(data);
  });
});
```
如果省略 `next(err)`，請求將會掛起，且錯誤不會被處理。

**B. 使用 Promises**

當使用 Promises 時，您可以在 `.catch()` 區塊中捕獲拒絕 (rejection) 並呼叫 `next()`。

```javascript
app.get('/promise-error', (req, res, next) => {
  somePromiseFunction()
    .then(data => res.send(data))
    .catch(err => next(err)); // 或者直接 .catch(next)
});
```

**C. 使用 `async/await`**

`async/await` 讓非同步程式碼看起來像同步的，但錯誤處理規則依然適用。您可以使用 `try...catch` 區塊來捕獲錯誤。

```javascript
app.get('/async-error', async (req, res, next) => {
  try {
    const data = await someAsyncFunction();
    res.send(data);
  } catch (err) {
    next(err); // 將錯誤傳遞給 Express 的錯誤處理器
  }
});
```

**從 Express 5 開始的改進**:
從 Express 5 開始，從 `async/await` 函數中拋出的錯誤會被**自動捕獲**，就像同步錯誤一樣，您不再需要 `try...catch` 和手動呼叫 `next(err)`。這是一個重大的改進。

```javascript
// 在 Express 5+ 中，這樣是可行的
app.get('/async-error-express5', async (req, res) => {
  // 如果 someAsyncFunction() 拋出錯誤，Express 5 會自動捕獲
  const data = await someAsyncFunction();
  res.send(data);
});
```

### 建立集中的錯誤處理中介層

一個良好實踐是建立一個集中的錯誤處理中介層來處理應用程式中的所有錯誤。

**關鍵點**:
1.  它是一個有四個參數的特殊中介層：`(err, req, res, next)`。
2.  它必須在**所有**其他 `app.use()` 和路由定義**之後**才被加入。

```javascript
const express = require('express');
const app = express();

// ... 你的路由和中介層 ...
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/user/:id', async (req, res, next) => {
  try {
    const user = await getUserFromDb({ id: req.params.id });
    if (!user) {
      // 建立一個帶有狀態碼的自訂錯誤
      const error = new Error('User not found');
      error.status = 404;
      return next(error);
    }
    res.json(user);
  } catch (dbError) {
    next(dbError);
  }
});


// 處理 404 錯誤 - 當沒有路由匹配時
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});


// 集中的錯誤處理中介層
app.use((err, req, res, next) => {
  // 如果 err 物件上有我們自訂的狀態碼，就使用它，否則預設為 500
  const statusCode = err.status || 500;

  // 記錄錯誤 (在生產環境中，應該使用更成熟的日誌庫如 Winston 或 Bunyan)
  console.error(err.message, err.stack);

  // 根據環境決定返回的錯誤訊息
  const errorMessage = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred.'
    : err.message;

  // 設定回應狀態碼並發送 JSON 格式的錯誤訊息
  res.status(statusCode).json({
    status: 'error',
    statusCode: statusCode,
    message: errorMessage,
    // 在非生產環境下可以包含堆疊資訊以方便除錯
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});


app.listen(3000, () => console.log('Server running on port 3000'));
```

在這個範例中：
- 我們為 `404 Not Found` 建立了一個專門的處理器。
- 我們建立了一個統一的錯誤處理中介層，它會：
    - 檢查自訂的狀態碼。
    - 在伺服器端記錄完整的錯誤。
    - 根據環境變數決定是否向客戶端暴露詳細的錯誤訊息。
    - 以統一的 JSON 格式返回錯誤。

### 結論

有效的錯誤處理是 Express.js 應用程式可靠性的基石。關鍵在於理解同步和非同步錯誤捕獲的區別，並實作一個定義在路由之後的、帶有四個參數的集中式錯誤處理中介層。這個中介層應該負責記錄錯誤、設定適當的 HTTP 狀態碼，並向客戶端發送格式一致且安全的錯誤回應。
