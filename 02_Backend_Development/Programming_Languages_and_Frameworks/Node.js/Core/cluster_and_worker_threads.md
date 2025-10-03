# Cluster 與 Worker Threads

- **難度**: 7
- **重要程度**: 4
- **標籤**: `Cluster`, `Worker Threads`, `多核`, `並發`

## 問題詳述

請解釋 Node.js 中的 Cluster 模組和 Worker Threads 的工作原理、使用場景和區別，以及如何利用多核 CPU 提升應用性能。

## 核心理論與詳解

### Node.js 的單線程模型

**限制**：
- Node.js 預設運行在**單一主線程**上
- 即使主機有 8 核心 CPU，Node.js 也只使用**一個核心**
- CPU 密集型操作會**阻塞** Event Loop

**問題場景**：
```javascript
// CPU 密集型操作
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

app.get('/fib/:n', (req, res) => {
  const result = fibonacci(parseInt(req.params.n));
  res.json({ result });
});

// 計算 fibonacci(40) 會阻塞 Event Loop 數秒
// 期間所有其他請求都會被阻塞
```

**解決方案**：
- **Cluster**：創建多個程序，每個程序使用一個 CPU 核心
- **Worker Threads**：在同一程序內創建多個線程

### Cluster 模組

#### 工作原理

**架構**：
```
┌─────────────────────────────────────────┐
│          Master Process                 │
│       (負責管理 Workers)                │
└────────┬────────────────────────────────┘
         │
         ├─── Worker 1 (獨立程序)
         │      └─ 監聽 port 3000
         │
         ├─── Worker 2 (獨立程序)
         │      └─ 監聽 port 3000
         │
         ├─── Worker 3 (獨立程序)
         │      └─ 監聽 port 3000
         │
         └─── Worker 4 (獨立程序)
                └─ 監聽 port 3000

請求 → Master → 分發到可用的 Worker
```

**負載均衡策略**：
- **Round-robin**（輪詢，預設）：依次分配給每個 Worker
- **OS scheduling**：由作業系統決定

#### 基本使用

```javascript
const cluster = require('cluster');
const http = require('http');
const os = require('os');

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers（根據 CPU 核心數）
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    // 重啟掛掉的 Worker
    cluster.fork();
  });
} else {
  // Workers 共享 TCP 連接
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`Handled by worker ${process.pid}\n`);
  }).listen(8000);

  console.log(`Worker ${process.pid} started`);
}
```

#### 進程間通訊（IPC）

**Master 發送訊息給 Worker**：
```javascript
// Master
const worker = cluster.fork();
worker.send({ cmd: 'reload', config: newConfig });

// Worker
process.on('message', (msg) => {
  if (msg.cmd === 'reload') {
    console.log('Reloading config:', msg.config);
  }
});
```

**Worker 發送訊息給 Master**：
```javascript
// Worker
process.send({ status: 'ready', pid: process.pid });

// Master
cluster.on('message', (worker, msg) => {
  console.log(`Worker ${worker.process.pid} says:`, msg);
});
```

#### 平滑重啟

```javascript
const cluster = require('cluster');

if (cluster.isMaster) {
  const workers = [];

  // Fork workers
  for (let i = 0; i < 4; i++) {
    workers.push(cluster.fork());
  }

  // 平滑重啟函數
  function gracefulRestart() {
    const worker = workers.shift();
    
    if (!worker) {
      console.log('All workers restarted');
      return;
    }

    // 停止接受新連接
    worker.send('shutdown');
    
    // 等待現有連接完成
    setTimeout(() => {
      worker.kill();
      // Fork 新 Worker
      workers.push(cluster.fork());
      // 繼續重啟下一個
      gracefulRestart();
    }, 5000);
  }

  // 觸發重啟
  process.on('SIGUSR2', gracefulRestart);
}
```

#### Cluster 的特性

**優點**：
- 充分利用多核 CPU
- 自動負載均衡
- 程序崩潰不影響其他 Worker
- 易於實現零停機部署

**限制**：
- 每個 Worker 是獨立程序，記憶體不共享
- 需要額外的 IPC 機制進行通訊
- 記憶體開銷較大（每個程序都有獨立的 V8 實例）

### Worker Threads

#### 工作原理

**架構**：
```
┌─────────────────────────────────────────┐
│         Main Thread                     │
│   (Event Loop + V8 Instance)            │
│                                         │
│  ┌────────────────────────────────┐    │
│  │  Worker Thread 1               │    │
│  │  (獨立 Event Loop + V8)        │    │
│  │  共享記憶體: SharedArrayBuffer  │    │
│  └────────────────────────────────┘    │
│                                         │
│  ┌────────────────────────────────┐    │
│  │  Worker Thread 2               │    │
│  │  (獨立 Event Loop + V8)        │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**關鍵特性**：
- 運行在同一程序內
- 可以共享記憶體（SharedArrayBuffer、MessageChannel）
- 適合 CPU 密集型任務

#### 基本使用

```javascript
const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
  // 主線程
  const worker = new Worker(__filename);
  
  worker.on('message', (result) => {
    console.log('Result from worker:', result);
  });
  
  worker.postMessage({ n: 40 });
} else {
  // Worker 線程
  parentPort.on('message', ({ n }) => {
    const result = fibonacci(n);
    parentPort.postMessage(result);
  });
}

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
```

#### Worker Pool 模式

```javascript
const { Worker } = require('worker_threads');
const os = require('os');

class WorkerPool {
  constructor(workerScript, poolSize = os.cpus().length) {
    this.workerScript = workerScript;
    this.poolSize = poolSize;
    this.workers = [];
    this.queue = [];
    
    // 初始化 Worker Pool
    for (let i = 0; i < poolSize; i++) {
      this.workers.push(this.createWorker());
    }
  }

  createWorker() {
    const worker = new Worker(this.workerScript);
    worker.available = true;
    
    worker.on('message', (result) => {
      worker.available = true;
      worker.resolve(result);
      this.processQueue();
    });
    
    worker.on('error', (err) => {
      worker.available = true;
      worker.reject(err);
      this.processQueue();
    });
    
    return worker;
  }

  exec(data) {
    return new Promise((resolve, reject) => {
      const availableWorker = this.workers.find(w => w.available);
      
      if (availableWorker) {
        availableWorker.available = false;
        availableWorker.resolve = resolve;
        availableWorker.reject = reject;
        availableWorker.postMessage(data);
      } else {
        // 所有 Worker 都忙碌，加入佇列
        this.queue.push({ data, resolve, reject });
      }
    });
  }

  processQueue() {
    if (this.queue.length === 0) return;
    
    const availableWorker = this.workers.find(w => w.available);
    if (availableWorker) {
      const { data, resolve, reject } = this.queue.shift();
      availableWorker.available = false;
      availableWorker.resolve = resolve;
      availableWorker.reject = reject;
      availableWorker.postMessage(data);
    }
  }

  destroy() {
    this.workers.forEach(worker => worker.terminate());
  }
}

// 使用
const pool = new WorkerPool('./worker.js', 4);

app.get('/fib/:n', async (req, res) => {
  try {
    const result = await pool.exec({ n: parseInt(req.params.n) });
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

**worker.js**：
```javascript
const { parentPort } = require('worker_threads');

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

parentPort.on('message', ({ n }) => {
  const result = fibonacci(n);
  parentPort.postMessage(result);
});
```

#### 共享記憶體

```javascript
const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
  // 主線程
  const sharedBuffer = new SharedArrayBuffer(1024);
  const sharedArray = new Int32Array(sharedBuffer);
  
  const worker = new Worker(__filename, {
    workerData: { sharedBuffer }
  });
  
  // 寫入共享記憶體
  sharedArray[0] = 100;
  
  setTimeout(() => {
    console.log('Shared value:', sharedArray[0]); // 200
  }, 1000);
} else {
  // Worker 線程
  const { workerData } = require('worker_threads');
  const sharedArray = new Int32Array(workerData.sharedBuffer);
  
  // 修改共享記憶體
  sharedArray[0] = 200;
}
```

#### Atomics 操作

```javascript
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  const sharedBuffer = new SharedArrayBuffer(4);
  const sharedArray = new Int32Array(sharedBuffer);
  
  // 創建多個 Worker
  for (let i = 0; i < 10; i++) {
    new Worker(__filename, { workerData: { sharedBuffer } });
  }
  
  setTimeout(() => {
    console.log('Counter:', sharedArray[0]); // 1000（原子操作保證正確）
  }, 1000);
} else {
  const sharedArray = new Int32Array(workerData.sharedBuffer);
  
  // 原子增加（線程安全）
  for (let i = 0; i < 100; i++) {
    Atomics.add(sharedArray, 0, 1);
  }
}
```

### Cluster vs Worker Threads

| 特性 | Cluster | Worker Threads |
|------|---------|----------------|
| **隔離級別** | 程序級別 | 線程級別 |
| **記憶體** | 獨立（無法共享） | 可共享（SharedArrayBuffer） |
| **開銷** | 較大（完整程序） | 較小（同一程序） |
| **啟動速度** | 較慢 | 較快 |
| **適用場景** | I/O 密集型、HTTP 伺服器 | CPU 密集型計算 |
| **通訊方式** | IPC | postMessage、SharedArrayBuffer |
| **穩定性** | 一個程序崩潰不影響其他 | 線程崩潰可能影響整個程序 |
| **負載均衡** | 自動（OS 或 round-robin） | 需手動實現 |

### 使用場景

#### Cluster 適用場景

**HTTP 伺服器**：
```javascript
// 每個核心一個 Worker，處理 HTTP 請求
const cluster = require('cluster');
const express = require('express');
const os = require('os');

if (cluster.isMaster) {
  const numWorkers = os.cpus().length;
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }
} else {
  const app = express();
  // ... 路由定義
  app.listen(3000);
}
```

**好處**：
- 充分利用多核 CPU
- 自動負載均衡
- 程序隔離（一個崩潰不影響其他）

#### Worker Threads 適用場景

**圖片處理**：
```javascript
const { Worker } = require('worker_threads');

app.post('/process-image', upload.single('image'), async (req, res) => {
  const worker = new Worker('./image-processor.js', {
    workerData: {
      imagePath: req.file.path,
      operations: ['resize', 'compress', 'watermark']
    }
  });
  
  worker.on('message', (processedImage) => {
    res.json({ url: processedImage });
  });
});
```

**資料處理**：
```javascript
// 大量資料計算（如統計分析）
const pool = new WorkerPool('./data-processor.js', 4);

app.post('/analyze', async (req, res) => {
  const result = await pool.exec({
    data: req.body.dataset,
    algorithm: 'kmeans'
  });
  res.json(result);
});
```

### 生產環境最佳實踐

#### PM2 管理 Cluster

```bash
# 安裝 PM2
npm install -g pm2

# 啟動 Cluster 模式（根據 CPU 核心數）
pm2 start app.js -i max

# 平滑重啟
pm2 reload app

# 監控
pm2 monit
```

**ecosystem.config.js**：
```javascript
module.exports = {
  apps: [{
    name: 'api',
    script: './server.js',
    instances: 'max',  // 或指定數字
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    max_memory_restart: '1G',
    // 平滑重啟配置
    kill_timeout: 5000,
    listen_timeout: 3000,
    shutdown_with_message: true
  }]
};
```

#### 混合使用

```javascript
const cluster = require('cluster');
const { Worker } = require('worker_threads');
const express = require('express');

if (cluster.isMaster) {
  // Master: 管理 Cluster Workers
  const numWorkers = require('os').cpus().length;
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }
} else {
  // Cluster Worker: 處理 HTTP 請求
  const app = express();
  
  // 創建 Worker Thread Pool 處理 CPU 密集型任務
  const workerPool = new WorkerPool('./compute-worker.js', 2);
  
  app.get('/compute', async (req, res) => {
    try {
      const result = await workerPool.exec(req.query);
      res.json({ result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.listen(3000);
}
```

**架構**：
```
Master Process
├── Worker Process 1 (處理 HTTP)
│   ├── Worker Thread 1 (CPU 密集型)
│   └── Worker Thread 2 (CPU 密集型)
├── Worker Process 2 (處理 HTTP)
│   ├── Worker Thread 1
│   └── Worker Thread 2
└── Worker Process 3 (處理 HTTP)
    ├── Worker Thread 1
    └── Worker Thread 2
```

### 監控與除錯

#### 監控 Cluster

```javascript
if (cluster.isMaster) {
  cluster.on('online', (worker) => {
    console.log(`Worker ${worker.process.pid} is online`);
  });

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died (${code})`);
    // 記錄到監控系統
    if (code !== 0 && !worker.exitedAfterDisconnect) {
      console.log('Worker crashed, starting a new one');
      cluster.fork();
    }
  });

  // 定期檢查 Worker 健康狀態
  setInterval(() => {
    Object.values(cluster.workers).forEach((worker) => {
      worker.send({ cmd: 'health-check' });
    });
  }, 10000);
}
```

#### 監控 Worker Threads

```javascript
class MonitoredWorkerPool extends WorkerPool {
  constructor(workerScript, poolSize) {
    super(workerScript, poolSize);
    this.metrics = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      avgExecutionTime: 0
    };
  }

  async exec(data) {
    const startTime = Date.now();
    this.metrics.totalTasks++;
    
    try {
      const result = await super.exec(data);
      this.metrics.completedTasks++;
      
      // 更新平均執行時間
      const execTime = Date.now() - startTime;
      this.metrics.avgExecutionTime = 
        (this.metrics.avgExecutionTime * (this.metrics.completedTasks - 1) + execTime) 
        / this.metrics.completedTasks;
      
      return result;
    } catch (err) {
      this.metrics.failedTasks++;
      throw err;
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      queueLength: this.queue.length,
      availableWorkers: this.workers.filter(w => w.available).length
    };
  }
}
```

## 總結

**Cluster**：
- 用於充分利用多核 CPU
- 適合 I/O 密集型應用（HTTP 伺服器）
- 程序級別隔離，穩定性高
- 記憶體無法共享

**Worker Threads**：
- 用於 CPU 密集型計算
- 可共享記憶體，效率高
- 線程級別隔離，開銷小
- 需要小心管理共享狀態

**最佳實踐**：
- HTTP 伺服器：使用 Cluster
- CPU 密集型任務：使用 Worker Threads
- 生產環境：使用 PM2 管理
- 混合使用：Cluster + Worker Threads

理解這兩種機制能有效提升 Node.js 應用的性能和可擴展性。
