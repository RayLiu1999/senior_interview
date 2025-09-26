# Express.js 與 Node.js 的關係

- **難度**: 3
- **重要性**: 4
- **標籤**: `Express.js`, `Node.js`, `Framework`

## 問題詳述

Express.js 和 Node.js 之間是什麼關係？為什麼我們通常在使用 Node.js 建立 Web 伺服器時會選擇使用 Express.js？

## 核心理論與詳解

要理解 Express.js，首先必須明白它與 Node.js 的關係：**Node.js 是執行環境，而 Express.js 是執行在該環境之上的框架**。

### Node.js: 執行環境 (The Runtime Environment)

- **定義**: Node.js 是一個基於 Chrome V8 JavaScript 引擎的 JavaScript **執行環境**。它允許開發者在伺服器端（而不是只能在瀏覽器中）執行 JavaScript 程式碼。
- **核心功能**: Node.js 提供了許多用於後端開發的基礎模組，其中最核心的是 `http` 模組。使用 `http` 模組，您可以建立一個基礎的 HTTP 伺服器，監聽請求並發送回應。

**使用純 Node.js 建立一個 Web 伺服器：**

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  // 手動處理路由
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World!');
  } else if (req.method === 'GET' && req.url === '/about') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('About Us');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Express.js: 框架 (The Framework)

- **定義**: Express.js 是一個基於 Node.js `http` 模組建立的、極簡且靈活的 **Web 應用程式框架**。它不是 Node.js 的替代品，而是 Node.js 的一個強大擴充。
- **核心目標**: Express 的設計目標是提供一組最小但強大的功能來開發 Web 和行動應用程式，而不會掩蓋 Node.js 的原生特性。它極大地簡化了使用純 Node.js `http` 模組進行開發的複雜性。

**使用 Express.js 建立同樣的 Web 伺服器：**

```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/about', (req, res) => {
  res.send('About Us');
});

// Express 會自動處理 404
app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### 為什麼選擇 Express.js？

比較上面兩個程式碼範例，可以清楚地看到 Express.js 帶來的優勢。它在純 Node.js 的基礎上提供了一層抽象，解決了許多常見的 Web 開發痛點：

1.  **簡潔的路由系統**:
    - **純 Node.js**: 需要手動解析 `req.url` 和 `req.method`，並使用大量的 `if/else` 或 `switch` 語句來處理不同的路由，非常繁瑣且容易出錯。
    - **Express.js**: 提供了 `app.get()`, `app.post()` 等直觀的方法來定義路由，並支援動態路由參數、正規表示式等高級功能。

2.  **強大的中介層 (Middleware)**:
    - **純 Node.js**: 沒有內建的中介層概念。所有功能，如日誌、身份驗證、請求 body 解析，都需要手動在每個路由處理器中實現或透過複雜的函數組合來模擬。
    - **Express.js**: 中介層是其核心。它允許將應用程式的功能分解成一系列可重用的「管道」，極大地提高了程式碼的模組化和可維護性。

3.  **請求/回應物件的增強**:
    - **純 Node.js**: `req` 和 `res` 物件功能相對基礎。例如，解析請求 body、查詢字串或 cookies 都需要額外的工作。發送回應也需要手動設定 `writeHead` 和呼叫 `end`。
    - **Express.js**: 對 `req` 和 `res` 物件進行了擴充，提供了大量方便的輔助方法和屬性。例如，`req.params`, `req.query`, `req.body` 用於獲取請求數據，`res.send()`, `res.json()`, `res.status()` 則讓發送回應變得異常簡單。

4.  **視圖/範本引擎整合**:
    - **純 Node.js**: 需要手動讀取 HTML 檔案、替換佔位符並發送內容。
    - **Express.js**: 可以輕鬆整合各種範本引擎（如 Pug, EJS, Handlebars），使用 `res.render()` 方法來渲染動態 HTML 頁面。

5.  **錯誤處理**:
    - **純 Node.js**: 錯誤處理分散在各個回呼函數中，難以集中管理。
    - **Express.js**: 提供了統一的錯誤處理中介層機制，讓錯誤管理變得更加清晰和集中。

### 結論

可以將 Node.js 想像成一個工具箱，裡面有錘子 (`http`)、釘子和木板。您完全可以用這些基礎工具來建造一棟房子，但過程會非常艱辛和耗時。

Express.js 則像是一個預製的房屋框架。它已經幫您搭建好了牆壁（路由）、門窗（中介層）和管道系統（請求/回應處理）。您不再需要從零開始，而是可以專注於內部的裝修和佈置（您的業務邏輯）。

因此，Express.js 並不是 Node.js 的替代品，而是建立在其之上的一個強大、高效的抽象層，它讓開發者能夠更快、更可靠地構建功能豐富的 Web 應用程式。
