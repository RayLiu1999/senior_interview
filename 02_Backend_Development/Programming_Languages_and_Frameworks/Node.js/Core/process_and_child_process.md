# Process 與 Child Process

- **難度**: 6
- **重要程度**: 4
- **標籤**: `Process`, `Child Process`, `IPC`, `多進程`

## 問題詳述

請深入解釋 Node.js 中的 Process 物件、Child Process 模組、進程間通訊（IPC）以及多進程管理的最佳實踐。

## 核心理論與詳解

### Process 物件

**Process 是什麼？**

`process` 是一個全域物件，提供當前 Node.js 進程的資訊和控制能力。

**核心屬性**：

```javascript
// 進程資訊
console.log(process.pid);           // 進程 ID
console.log(process.ppid);          // 父進程 ID
console.log(process.platform);      // 作業系統平台: 'darwin', 'linux', 'win32'
console.log(process.arch);          // CPU 架構: 'x64', 'arm', 'arm64'
console.log(process.version);       // Node.js 版本: 'v18.12.0'
console.log(process.versions);      // 相關版本資訊

// 環境變數
console.log(process.env.NODE_ENV);  // 讀取環境變數
process.env.MY_VAR = 'value';       // 設定環境變數

// 工作目錄
console.log(process.cwd());         // 當前工作目錄
process.chdir('/new/path');         // 改變工作目錄

// 執行路徑
console.log(process.execPath);      // Node 執行檔路徑: '/usr/local/bin/node'
console.log(process.argv);          // 命令列參數
// ['node', 'script.js', 'arg1', 'arg2']

// 資源使用
console.log(process.memoryUsage()); // 記憶體使用
console.log(process.cpuUsage());    // CPU 使用
console.log(process.uptime());      // 運行時間（秒）

// 用戶資訊（Unix-like 系統）
console.log(process.getuid());      // 用戶 ID
console.log(process.getgid());      // 群組 ID
```

**標準輸入輸出**：

```javascript
// stdout - 標準輸出
process.stdout.write('Hello\n');
console.log('Hello'); // 底層使用 process.stdout

// stderr - 標準錯誤
process.stderr.write('Error\n');
console.error('Error'); // 底層使用 process.stderr

// stdin - 標準輸入
process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
  const chunk = process.stdin.read();
  if (chunk !== null) {
    process.stdout.write(`Data: ${chunk}`);
  }
});

// 互動式輸入範例
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('What is your name? ', (answer) => {
  console.log(`Hello, ${answer}!`);
  rl.close();
});
```

**進程事件**：

```javascript
// 進程退出前
process.on('exit', (code) => {
  console.log(`Process exiting with code: ${code}`);
  // 只能執行同步操作
  // 不能阻止進程退出
});

// 未捕獲的異常
process.on('uncaughtException', (err, origin) => {
  console.error('Uncaught Exception:', err);
  console.error('Origin:', origin);
  // 記錄錯誤後應該退出
  process.exit(1);
});

// 未處理的 Promise rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});

// 警告事件
process.on('warning', (warning) => {
  console.warn('Warning:', warning.name);
  console.warn(warning.message);
  console.warn(warning.stack);
});

// 接收信號
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, graceful shutdown...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT (Ctrl+C)');
  process.exit(0);
});
```

**進程控制**：

```javascript
// 退出進程
process.exit(0);    // 成功退出
process.exit(1);    // 失敗退出

// 中止進程（不執行清理）
process.abort();

// 發送信號給自己
process.kill(process.pid, 'SIGTERM');

// 設定標題（在 ps/top 中顯示）
process.title = 'my-app-name';
```

### Child Process 模組

**四種創建子進程的方法**：

```
┌─────────────────────────────────────────┐
│         child_process 模組               │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │  spawn   │  │   exec   │            │
│  │ (Stream) │  │ (Buffer) │            │
│  └──────────┘  └──────────┘            │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │execFile  │  │   fork   │            │
│  │ (Buffer) │  │  (IPC)   │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

#### 1. spawn - 串流式執行

**特性**：
- 返回串流（適合大量輸出）
- 不使用 shell
- 最底層的方法

```javascript
const { spawn } = require('child_process');

// 基本用法
const ls = spawn('ls', ['-lh', '/usr']);

// 監聽 stdout
ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

// 監聽 stderr
ls.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

// 監聽關閉
ls.on('close', (code) => {
  console.log(`Child process exited with code ${code}`);
});

// 監聽錯誤
ls.on('error', (err) => {
  console.error('Failed to start subprocess:', err);
});
```

**進階用法**：

```javascript
// 使用 shell
const child = spawn('ls -lh /usr', {
  shell: true
});

// 設定環境變數
const child = spawn('node', ['script.js'], {
  env: { ...process.env, NODE_ENV: 'production' }
});

// 改變工作目錄
const child = spawn('npm', ['install'], {
  cwd: '/path/to/project'
});

// 分離子進程（detached）
const child = spawn('node', ['long-running.js'], {
  detached: true,
  stdio: 'ignore'
});

child.unref(); // 父進程可以獨立退出
```

**處理大量輸出**：

```javascript
const ffmpeg = spawn('ffmpeg', [
  '-i', 'input.mp4',
  '-c:v', 'libx264',
  'output.mp4'
]);

let stdoutData = '';
let stderrData = '';

ffmpeg.stdout.on('data', (data) => {
  stdoutData += data;
});

ffmpeg.stderr.on('data', (data) => {
  stderrData += data;
  // ffmpeg 輸出進度到 stderr
  console.log(`Progress: ${data}`);
});

ffmpeg.on('close', (code) => {
  if (code === 0) {
    console.log('Conversion successful');
  } else {
    console.error('Conversion failed');
    console.error(stderrData);
  }
});
```

#### 2. exec - 緩衝式執行

**特性**：
- 返回緩衝區（適合少量輸出）
- 使用 shell
- 有最大緩衝區限制（預設 1MB）

```javascript
const { exec } = require('child_process');

// 基本用法
exec('ls -lh /usr', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});

// 設定選項
exec('ls -lh /usr', {
  cwd: '/tmp',
  env: { ...process.env },
  maxBuffer: 1024 * 1024 * 10, // 10MB
  timeout: 5000 // 5 秒超時
}, (error, stdout, stderr) => {
  // 處理結果
});

// Promise 版本
const { promisify } = require('util');
const execPromise = promisify(exec);

async function runCommand() {
  try {
    const { stdout, stderr } = await execPromise('ls -lh /usr');
    console.log('Output:', stdout);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

**shell 注入風險**：

```javascript
// ❌ 危險：用戶輸入未經驗證
const userInput = req.query.filename;
exec(`cat ${userInput}`, (error, stdout) => {
  // 如果 userInput = "; rm -rf /"
  // 實際執行：cat ; rm -rf /
});

// ✅ 安全：使用 spawn 或驗證輸入
const { spawn } = require('child_process');
const cat = spawn('cat', [userInput]); // 參數不會被 shell 解析
```

#### 3. execFile - 直接執行檔案

**特性**：
- 不使用 shell（更安全）
- 返回緩衝區
- 適合執行特定程式

```javascript
const { execFile } = require('child_process');

// 執行可執行檔
execFile('node', ['--version'], (error, stdout, stderr) => {
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Node version:', stdout);
});

// 執行腳本
execFile('/path/to/script.sh', ['arg1', 'arg2'], (error, stdout, stderr) => {
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Output:', stdout);
});
```

#### 4. fork - Node.js 進程

**特性**：
- 專門用於啟動 Node.js 腳本
- 內建 IPC 通道
- 返回 ChildProcess 實例

```javascript
const { fork } = require('child_process');

// 父進程 (main.js)
const child = fork('child.js');

// 發送訊息給子進程
child.send({ type: 'TASK', data: 'some data' });

// 接收子進程訊息
child.on('message', (msg) => {
  console.log('Message from child:', msg);
});

child.on('exit', (code) => {
  console.log(`Child exited with code ${code}`);
});

// 子進程 (child.js)
process.on('message', (msg) => {
  console.log('Message from parent:', msg);
  
  if (msg.type === 'TASK') {
    const result = processTask(msg.data);
    process.send({ type: 'RESULT', result });
  }
});

// 通知父進程準備就緒
process.send({ type: 'READY' });
```

### 進程間通訊（IPC）

**IPC 通道**：

```
Parent Process          Child Process
      │                      │
      │  ───── send() ────>  │
      │                      │
      │  <──── send() ─────  │
      │                      │
   IPC Channel (Unix Socket / Named Pipe)
```

**完整範例**：

```javascript
// parent.js
const { fork } = require('child_process');

const worker = fork('worker.js');

// 發送任務
worker.send({
  type: 'CALCULATE',
  numbers: [1, 2, 3, 4, 5]
});

// 接收結果
worker.on('message', (msg) => {
  if (msg.type === 'RESULT') {
    console.log('Sum:', msg.sum);
    worker.kill(); // 結束子進程
  }
});

// worker.js
process.on('message', (msg) => {
  if (msg.type === 'CALCULATE') {
    const sum = msg.numbers.reduce((a, b) => a + b, 0);
    
    // 發送結果回父進程
    process.send({
      type: 'RESULT',
      sum: sum
    });
  }
});
```

**Worker Pool 模式**：

```javascript
class WorkerPool {
  constructor(workerScript, poolSize = 4) {
    this.workerScript = workerScript;
    this.poolSize = poolSize;
    this.workers = [];
    this.queue = [];
    
    // 創建工作池
    for (let i = 0; i < poolSize; i++) {
      this.createWorker();
    }
  }

  createWorker() {
    const worker = fork(this.workerScript);
    worker.available = true;
    
    worker.on('message', (msg) => {
      // 任務完成
      worker.available = true;
      
      if (worker.currentTask) {
        worker.currentTask.resolve(msg);
        worker.currentTask = null;
      }
      
      // 處理佇列中的下一個任務
      this.processQueue();
    });
    
    worker.on('error', (err) => {
      console.error('Worker error:', err);
      if (worker.currentTask) {
        worker.currentTask.reject(err);
      }
      
      // 重啟 worker
      this.workers = this.workers.filter(w => w !== worker);
      this.createWorker();
    });
    
    worker.on('exit', (code) => {
      console.log(`Worker exited with code ${code}`);
      this.workers = this.workers.filter(w => w !== worker);
    });
    
    this.workers.push(worker);
  }

  async execute(data) {
    return new Promise((resolve, reject) => {
      this.queue.push({ data, resolve, reject });
      this.processQueue();
    });
  }

  processQueue() {
    if (this.queue.length === 0) return;
    
    // 找到可用的 worker
    const worker = this.workers.find(w => w.available);
    if (!worker) return;
    
    // 取出任務
    const task = this.queue.shift();
    worker.available = false;
    worker.currentTask = task;
    
    // 發送任務
    worker.send(task.data);
  }

  shutdown() {
    this.workers.forEach(worker => {
      worker.kill();
    });
  }
}

// 使用
const pool = new WorkerPool('heavy-task.js', 4);

async function main() {
  const tasks = Array.from({ length: 20 }, (_, i) => ({
    type: 'HEAVY_TASK',
    data: i
  }));

  const results = await Promise.all(
    tasks.map(task => pool.execute(task))
  );

  console.log('All tasks completed:', results);
  pool.shutdown();
}

main();
```

### 優雅關閉

```javascript
const express = require('express');
const app = express();

const server = app.listen(3000);

// 追蹤活躍連接
const connections = new Set();

server.on('connection', (conn) => {
  connections.add(conn);
  conn.on('close', () => {
    connections.delete(conn);
  });
});

// 優雅關閉函數
async function gracefulShutdown(signal) {
  console.log(`Received ${signal}, starting graceful shutdown...`);

  // 1. 停止接受新連接
  server.close(() => {
    console.log('Server closed, no new connections accepted');
  });

  // 2. 通知子進程
  childProcesses.forEach(child => {
    child.send({ type: 'SHUTDOWN' });
  });

  // 3. 等待現有請求完成（最多 30 秒）
  const timeout = setTimeout(() => {
    console.log('Forcing shutdown after timeout');
    
    // 強制關閉所有連接
    connections.forEach(conn => conn.destroy());
    
    process.exit(1);
  }, 30000);

  // 4. 清理資源
  try {
    await database.close();
    await redis.quit();
    console.log('Resources cleaned up');
  } catch (err) {
    console.error('Error during cleanup:', err);
  }

  clearTimeout(timeout);
  process.exit(0);
}

// 監聽關閉信號
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 子進程中的優雅關閉
process.on('message', (msg) => {
  if (msg.type === 'SHUTDOWN') {
    console.log('Received shutdown signal from parent');
    
    // 完成當前任務
    finishCurrentTasks().then(() => {
      process.exit(0);
    });
  }
});
```

### 方法對比

| 方法 | Shell | 輸出 | 用途 | IPC |
|------|-------|------|------|-----|
| spawn | 否 | Stream | 長時間運行、大量輸出 | 否 |
| exec | 是 | Buffer | 簡單命令、少量輸出 | 否 |
| execFile | 否 | Buffer | 執行特定程式 | 否 |
| fork | 否 | Stream | Node.js 腳本 | 是 |

**選擇指南**：

```javascript
// 執行系統命令（少量輸出）
exec('ls -lh', callback);

// 執行系統命令（大量輸出）
spawn('find', ['/usr', '-name', '*.txt']);

// 執行可執行檔
execFile('/usr/bin/git', ['status']);

// 啟動 Node.js 子進程
fork('worker.js');
```

## 總結

**Process 物件**：
- 提供進程資訊和控制
- 環境變數、參數、標準 I/O
- 事件監聽和信號處理

**Child Process**：
- spawn：串流式，適合大量輸出
- exec：緩衝式，使用 shell
- execFile：直接執行，不使用 shell
- fork：Node.js 專用，支援 IPC

**最佳實踐**：
- 優雅關閉處理
- Worker Pool 模式
- 避免 shell 注入
- 正確處理錯誤和退出

理解進程管理是構建多進程 Node.js 應用的基礎。
