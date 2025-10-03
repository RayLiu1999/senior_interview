# 錯誤處理與非同步模式

- **難度**: 6
- **重要程度**: 5
- **標籤**: `Error Handling`, `Async/Await`, `Promise`, `非同步模式`

## 問題詳述

請深入解釋 Node.js 中的錯誤處理機制、非同步模式的演進（Callback → Promise → Async/Await），以及如何正確處理各種場景下的錯誤。

## 核心理論與詳解

### 錯誤類型

**1. 同步錯誤（Synchronous Errors）**：
```javascript
// 可以用 try-catch 捕獲
try {
  JSON.parse('invalid json');
} catch (err) {
  console.error('Caught:', err.message);
}
```

**2. 非同步錯誤（Asynchronous Errors）**：
```javascript
// ❌ try-catch 無法捕獲
try {
  setTimeout(() => {
    throw new Error('Async error');
  }, 100);
} catch (err) {
  // 永遠不會執行
  console.error('Caught:', err);
}

// 錯誤會導致程序崩潰
```

**3. Promise Rejection**：
```javascript
// 未處理的 rejection
Promise.reject(new Error('Unhandled'))
  .then(() => console.log('Success'));

// 正確處理
Promise.reject(new Error('Handled'))
  .catch(err => console.error('Caught:', err.message));
```

**4. 操作錯誤 vs 程式錯誤**：

| 類型 | 說明 | 範例 | 處理方式 |
|------|------|------|----------|
| 操作錯誤 (Operational Error) | 正常運行中的預期問題 | 網路故障、檔案不存在、無效輸入 | 捕獲並優雅處理 |
| 程式錯誤 (Programmer Error) | 程式碼 Bug | TypeError、ReferenceError、邏輯錯誤 | 修復程式碼 |

### 非同步模式演進

#### 1. Callback 模式

**基本 Callback**：
```javascript
const fs = require('fs');

// Node.js 風格：(err, result) => {}
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Data:', data);
});
```

**回調地獄（Callback Hell）**：
```javascript
// ❌ 難以維護
fs.readFile('file1.txt', 'utf8', (err1, data1) => {
  if (err1) return handleError(err1);
  
  fs.readFile('file2.txt', 'utf8', (err2, data2) => {
    if (err2) return handleError(err2);
    
    fs.readFile('file3.txt', 'utf8', (err3, data3) => {
      if (err3) return handleError(err3);
      
      // 更多嵌套...
      console.log(data1, data2, data3);
    });
  });
});
```

**錯誤處理問題**：
```javascript
// ❌ 忘記檢查錯誤
fs.readFile('file.txt', 'utf8', (err, data) => {
  console.log(data); // 可能是 undefined
});

// ❌ 錯誤傳播困難
function step1(callback) {
  fs.readFile('file.txt', 'utf8', (err, data) => {
    if (err) {
      // 需要手動傳播錯誤
      callback(err);
      return;
    }
    callback(null, data);
  });
}
```

#### 2. Promise 模式

**基本 Promise**：
```javascript
const fs = require('fs').promises;

fs.readFile('file.txt', 'utf8')
  .then(data => {
    console.log('Data:', data);
    return processData(data);
  })
  .then(result => {
    console.log('Result:', result);
  })
  .catch(err => {
    console.error('Error:', err);
  });
```

**Promise 鏈**：
```javascript
// ✅ 扁平化結構
fs.readFile('file1.txt', 'utf8')
  .then(data1 => {
    console.log('File 1:', data1);
    return fs.readFile('file2.txt', 'utf8');
  })
  .then(data2 => {
    console.log('File 2:', data2);
    return fs.readFile('file3.txt', 'utf8');
  })
  .then(data3 => {
    console.log('File 3:', data3);
  })
  .catch(err => {
    // 統一錯誤處理
    console.error('Error:', err);
  });
```

**建立 Promise**：
```javascript
function delay(ms) {
  return new Promise((resolve, reject) => {
    if (ms < 0) {
      reject(new Error('Delay must be positive'));
      return;
    }
    setTimeout(resolve, ms);
  });
}

// 使用
delay(1000)
  .then(() => console.log('1 second passed'))
  .catch(err => console.error(err));
```

**Promise 並發**：
```javascript
// Promise.all - 所有成功才成功
Promise.all([
  fs.readFile('file1.txt', 'utf8'),
  fs.readFile('file2.txt', 'utf8'),
  fs.readFile('file3.txt', 'utf8')
])
  .then(([data1, data2, data3]) => {
    console.log('All files:', data1, data2, data3);
  })
  .catch(err => {
    // 任何一個失敗，整體失敗
    console.error('Error:', err);
  });

// Promise.allSettled - 等待所有完成
Promise.allSettled([
  fs.readFile('file1.txt', 'utf8'),
  fs.readFile('file2.txt', 'utf8'),
  fs.readFile('file3.txt', 'utf8')
])
  .then(results => {
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`File ${index + 1}:`, result.value);
      } else {
        console.error(`File ${index + 1} failed:`, result.reason);
      }
    });
  });

// Promise.race - 第一個完成的結果
Promise.race([
  fetchFromServer1(),
  fetchFromServer2(),
  fetchFromServer3()
])
  .then(data => console.log('Fastest:', data))
  .catch(err => console.error('Error:', err));

// Promise.any - 第一個成功的結果
Promise.any([
  fetchFromServer1(),
  fetchFromServer2(),
  fetchFromServer3()
])
  .then(data => console.log('First success:', data))
  .catch(err => console.error('All failed:', err));
```

#### 3. Async/Await 模式

**基本用法**：
```javascript
const fs = require('fs').promises;

async function readFiles() {
  try {
    const data1 = await fs.readFile('file1.txt', 'utf8');
    console.log('File 1:', data1);
    
    const data2 = await fs.readFile('file2.txt', 'utf8');
    console.log('File 2:', data2);
    
    const data3 = await fs.readFile('file3.txt', 'utf8');
    console.log('File 3:', data3);
    
    return [data1, data2, data3];
  } catch (err) {
    console.error('Error:', err);
    throw err; // 重新拋出或處理
  }
}

readFiles();
```

**並發執行**：
```javascript
// ❌ 序列執行（慢）
async function sequentialRead() {
  const data1 = await fs.readFile('file1.txt', 'utf8'); // 等待
  const data2 = await fs.readFile('file2.txt', 'utf8'); // 等待
  const data3 = await fs.readFile('file3.txt', 'utf8'); // 等待
  return [data1, data2, data3];
}

// ✅ 並發執行（快）
async function concurrentRead() {
  const [data1, data2, data3] = await Promise.all([
    fs.readFile('file1.txt', 'utf8'),
    fs.readFile('file2.txt', 'utf8'),
    fs.readFile('file3.txt', 'utf8')
  ]);
  return [data1, data2, data3];
}
```

**錯誤處理**：
```javascript
// 方式 1：try-catch
async function method1() {
  try {
    const data = await fetchData();
    return processData(data);
  } catch (err) {
    console.error('Error:', err);
    return null; // 預設值
  }
}

// 方式 2：Promise catch
async function method2() {
  const data = await fetchData().catch(err => {
    console.error('Fetch error:', err);
    return null; // 預設值
  });
  
  if (!data) return;
  
  return processData(data);
}

// 方式 3：細粒度處理
async function method3() {
  let data;
  
  try {
    data = await fetchData();
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('File not found, using default');
      data = DEFAULT_DATA;
    } else {
      throw err; // 重新拋出未預期的錯誤
    }
  }
  
  return processData(data);
}
```

### 錯誤處理最佳實踐

#### 1. 使用自定義錯誤類別

```javascript
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}

class DatabaseError extends Error {
  constructor(message, query) {
    super(message);
    this.name = 'DatabaseError';
    this.query = query;
    this.statusCode = 500;
  }
}

class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
    this.resource = resource;
    this.id = id;
    this.statusCode = 404;
  }
}

// 使用
async function getUser(id) {
  if (!id) {
    throw new ValidationError('User ID is required', 'id');
  }
  
  const user = await db.findUser(id);
  
  if (!user) {
    throw new NotFoundError('User', id);
  }
  
  return user;
}

// 統一處理
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      error: err.message,
      field: err.field
    });
  } else if (err instanceof NotFoundError) {
    res.status(err.statusCode).json({
      error: err.message,
      resource: err.resource,
      id: err.id
    });
  } else {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
```

#### 2. 統一錯誤處理器

```javascript
class ErrorHandler {
  static handle(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    // 記錄錯誤
    if (statusCode >= 500) {
      console.error('Server Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
      });
    }
    
    // 開發環境：返回完整錯誤
    if (process.env.NODE_ENV === 'development') {
      res.status(statusCode).json({
        error: message,
        stack: err.stack,
        details: err
      });
      return;
    }
    
    // 生產環境：返回簡化錯誤
    res.status(statusCode).json({
      error: message
    });
  }
  
  static wrap(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

// 使用
app.get('/users/:id', ErrorHandler.wrap(async (req, res) => {
  const user = await getUser(req.params.id);
  res.json(user);
}));

app.use(ErrorHandler.handle);
```

#### 3. Promise Rejection 處理

```javascript
// 全域處理未捕獲的 Promise rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  
  // 記錄到監控系統
  logToMonitoring({
    type: 'unhandledRejection',
    reason: reason,
    stack: reason?.stack
  });
  
  // 可選：優雅關閉
  // process.exit(1);
});

// 全域處理未捕獲的異常
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  
  // 記錄到監控系統
  logToMonitoring({
    type: 'uncaughtException',
    error: err.message,
    stack: err.stack
  });
  
  // 必須退出，因為程序可能處於不一致狀態
  process.exit(1);
});
```

#### 4. Async Iterator 錯誤處理

```javascript
async function* generateNumbers() {
  yield 1;
  yield 2;
  throw new Error('Something went wrong');
  yield 3; // 不會執行
}

// 處理方式
async function processNumbers() {
  try {
    for await (const num of generateNumbers()) {
      console.log(num);
    }
  } catch (err) {
    console.error('Error in async iterator:', err);
  }
}
```

#### 5. 錯誤重試機制

```javascript
async function retry(fn, maxAttempts = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts) {
        throw err; // 最後一次失敗，拋出錯誤
      }
      
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 指數退避
      delay *= 2;
    }
  }
}

// 使用
async function fetchData() {
  return retry(
    async () => {
      const response = await fetch('https://api.example.com/data');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    },
    3, // 最多重試 3 次
    1000 // 初始延遲 1 秒
  );
}
```

#### 6. 斷路器模式（Circuit Breaker）

```javascript
class CircuitBreaker {
  constructor(fn, options = {}) {
    this.fn = fn;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 60 秒
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.nextAttempt = Date.now();
  }

  async execute(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await this.fn(...args);
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      console.log('Circuit breaker is now CLOSED');
    }
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
      console.log('Circuit breaker is now OPEN');
    }
  }
}

// 使用
const breaker = new CircuitBreaker(
  async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
  { failureThreshold: 5, resetTimeout: 60000 }
);

async function getData() {
  try {
    return await breaker.execute('https://api.example.com/data');
  } catch (err) {
    console.error('Request failed:', err.message);
    return DEFAULT_DATA; // 降級策略
  }
}
```

### 非同步模式對比

| 特性 | Callback | Promise | Async/Await |
|------|----------|---------|-------------|
| 可讀性 | 差（回調地獄） | 中（鏈式調用） | 優（同步風格） |
| 錯誤處理 | 手動檢查 | .catch() | try-catch |
| 並發 | 複雜 | Promise.all() | Promise.all() |
| 除錯 | 困難 | 中等 | 容易 |
| 相容性 | 全部 | Node.js 0.12+ | Node.js 7.6+ |
| 學習曲線 | 低 | 中 | 中 |

### 實際範例

**完整的 API 錯誤處理**：
```javascript
const express = require('express');
const app = express();

// 自定義錯誤
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 非同步包裝器
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 路由
app.get('/users/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  
  // 驗證
  if (!id || isNaN(id)) {
    throw new AppError('Invalid user ID', 400);
  }
  
  // 查詢
  const user = await db.findUser(id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  res.json({ user });
}));

// 404 處理
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

// 全域錯誤處理
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: 'error',
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // 操作錯誤：發送給客戶端
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: 'error',
        message: err.message
      });
    } else {
      // 程式錯誤：不洩露細節
      console.error('ERROR:', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
      });
    }
  }
});

// 處理 Promise rejection
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

const server = app.listen(3000);
```

## 總結

**非同步演進**：
- Callback → Promise → Async/Await
- 可讀性和可維護性逐步提升

**錯誤處理策略**：
- 區分操作錯誤和程式錯誤
- 使用自定義錯誤類別
- 統一錯誤處理器
- 全域 rejection 處理

**最佳實踐**：
- 總是處理錯誤
- 使用 try-catch 或 .catch()
- 細粒度錯誤處理
- 錯誤重試和斷路器
- 記錄和監控錯誤

正確的錯誤處理是構建穩定 Node.js 應用的關鍵。
