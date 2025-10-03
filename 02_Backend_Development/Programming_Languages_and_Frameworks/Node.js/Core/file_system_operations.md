# 檔案系統操作

- **難度**: 5
- **重要程度**: 4
- **標籤**: `File System`, `fs`, `Stream`, `非同步 I/O`

## 問題詳述

請深入解釋 Node.js 的檔案系統模組（fs），包括同步/非同步操作、Stream 操作、檔案監控以及最佳實踐。

## 核心理論與詳解

### fs 模組概述

**三種 API 風格**：

```
┌─────────────────────────────────────┐
│          fs 模組                     │
├─────────────────────────────────────┤
│                                     │
│  ┌────────────────────────────┐    │
│  │  Callback 風格              │    │
│  │  require('fs')             │    │
│  │  fs.readFile(path, cb)     │    │
│  └────────────────────────────┘    │
│                                     │
│  ┌────────────────────────────┐    │
│  │  Promise 風格               │    │
│  │  require('fs').promises    │    │
│  │  await fs.readFile(path)   │    │
│  └────────────────────────────┘    │
│                                     │
│  ┌────────────────────────────┐    │
│  │  同步風格                   │    │
│  │  fs.readFileSync(path)     │    │
│  └────────────────────────────┘    │
└─────────────────────────────────────┘
```

```javascript
// 1. Callback 風格
const fs = require('fs');

fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Data:', data);
});

// 2. Promise 風格（推薦）
const fs = require('fs').promises;

async function readFile() {
  try {
    const data = await fs.readFile('file.txt', 'utf8');
    console.log('Data:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

// 3. 同步風格（阻塞）
const fs = require('fs');

try {
  const data = fs.readFileSync('file.txt', 'utf8');
  console.log('Data:', data);
} catch (err) {
  console.error('Error:', err);
}
```

### 檔案讀取

#### 完整讀取

```javascript
const fs = require('fs').promises;

// 讀取文字檔案
async function readTextFile() {
  const data = await fs.readFile('file.txt', 'utf8');
  console.log(data);
}

// 讀取二進位檔案
async function readBinaryFile() {
  const buffer = await fs.readFile('image.png');
  console.log('Buffer length:', buffer.length);
  console.log('First bytes:', buffer.slice(0, 10));
}

// 讀取 JSON 檔案
async function readJSON() {
  const data = await fs.readFile('config.json', 'utf8');
  const config = JSON.parse(data);
  console.log(config);
}

// 錯誤處理
async function readWithErrorHandling() {
  try {
    const data = await fs.readFile('file.txt', 'utf8');
    return data;
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('File not found');
      return null;
    } else if (err.code === 'EACCES') {
      console.error('Permission denied');
      return null;
    } else {
      throw err; // 未預期的錯誤
    }
  }
}
```

#### 串流讀取（大檔案）

```javascript
const fs = require('fs');

// 使用 Stream 讀取
function readLargeFile() {
  const stream = fs.createReadStream('large-file.txt', {
    encoding: 'utf8',
    highWaterMark: 64 * 1024 // 64KB chunks
  });

  stream.on('data', (chunk) => {
    console.log(`Received ${chunk.length} bytes`);
    // 處理 chunk
  });

  stream.on('end', () => {
    console.log('Finished reading file');
  });

  stream.on('error', (err) => {
    console.error('Stream error:', err);
  });
}

// 逐行讀取
const readline = require('readline');

async function readLines() {
  const fileStream = fs.createReadStream('file.txt');
  
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity // 處理 \r\n
  });

  let lineNumber = 0;
  for await (const line of rl) {
    lineNumber++;
    console.log(`Line ${lineNumber}: ${line}`);
  }
}

// 背壓處理
function readWithBackpressure() {
  const readable = fs.createReadStream('input.txt');
  const writable = fs.createWriteStream('output.txt');

  readable.on('data', (chunk) => {
    const canWrite = writable.write(chunk);
    
    if (!canWrite) {
      // 輸出緩衝區滿了，暫停讀取
      readable.pause();
    }
  });

  writable.on('drain', () => {
    // 緩衝區空了，恢復讀取
    readable.resume();
  });

  readable.on('end', () => {
    writable.end();
  });
}
```

### 檔案寫入

```javascript
const fs = require('fs').promises;

// 寫入文字
async function writeText() {
  await fs.writeFile('output.txt', 'Hello, World!', 'utf8');
}

// 追加內容
async function appendText() {
  await fs.appendFile('log.txt', 'New log entry\n', 'utf8');
}

// 寫入 JSON
async function writeJSON() {
  const data = { name: 'John', age: 30 };
  await fs.writeFile('data.json', JSON.stringify(data, null, 2), 'utf8');
}

// 寫入 Buffer
async function writeBinary() {
  const buffer = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
  await fs.writeFile('data.bin', buffer);
}

// 串流寫入
function writeStream() {
  const stream = fs.createWriteStream('output.txt', {
    encoding: 'utf8',
    flags: 'a' // 追加模式
  });

  stream.write('Line 1\n');
  stream.write('Line 2\n');
  stream.write('Line 3\n');
  
  stream.end(() => {
    console.log('Finished writing');
  });

  stream.on('error', (err) => {
    console.error('Write error:', err);
  });
}

// 安全寫入（原子操作）
async function safeWrite(filePath, data) {
  const tmpPath = `${filePath}.tmp`;
  
  try {
    // 1. 寫入臨時檔案
    await fs.writeFile(tmpPath, data);
    
    // 2. 重命名（原子操作）
    await fs.rename(tmpPath, filePath);
  } catch (err) {
    // 清理臨時檔案
    try {
      await fs.unlink(tmpPath);
    } catch {}
    throw err;
  }
}
```

### 目錄操作

```javascript
const fs = require('fs').promises;
const path = require('path');

// 讀取目錄
async function listDirectory() {
  const files = await fs.readdir('/path/to/dir');
  console.log('Files:', files);
}

// 讀取目錄（含詳細資訊）
async function listWithDetails() {
  const entries = await fs.readdir('/path/to/dir', { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      console.log(`[DIR]  ${entry.name}`);
    } else if (entry.isFile()) {
      console.log(`[FILE] ${entry.name}`);
    } else if (entry.isSymbolicLink()) {
      console.log(`[LINK] ${entry.name}`);
    }
  }
}

// 遞迴列出所有檔案
async function* walkDirectory(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      yield* walkDirectory(fullPath);
    } else {
      yield fullPath;
    }
  }
}

// 使用
async function listAllFiles() {
  for await (const filePath of walkDirectory('/path/to/dir')) {
    console.log(filePath);
  }
}

// 創建目錄
async function createDirectory() {
  // 單層目錄
  await fs.mkdir('new-dir');
  
  // 多層目錄（遞迴）
  await fs.mkdir('path/to/new/dir', { recursive: true });
}

// 刪除目錄
async function removeDirectory() {
  // 空目錄
  await fs.rmdir('empty-dir');
  
  // 非空目錄（遞迴）
  await fs.rm('dir-with-files', { recursive: true, force: true });
}

// 複製目錄
async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}
```

### 檔案資訊與元數據

```javascript
const fs = require('fs').promises;

// 檔案狀態
async function getFileInfo(filePath) {
  const stats = await fs.stat(filePath);
  
  console.log({
    size: stats.size,                    // 檔案大小（bytes）
    isFile: stats.isFile(),              // 是否為檔案
    isDirectory: stats.isDirectory(),    // 是否為目錄
    isSymbolicLink: stats.isSymbolicLink(), // 是否為符號連結
    created: stats.birthtime,            // 創建時間
    modified: stats.mtime,               // 修改時間
    accessed: stats.atime,               // 存取時間
    changed: stats.ctime,                // 狀態改變時間
    mode: stats.mode.toString(8),        // 權限（八進位）
    uid: stats.uid,                      // 擁有者 ID
    gid: stats.gid                       // 群組 ID
  });
}

// 檢查檔案是否存在
async function fileExists(filePath) {
  try {
    await fs.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// 檢查權限
async function checkPermissions(filePath) {
  try {
    // 檢查讀取權限
    await fs.access(filePath, fs.constants.R_OK);
    console.log('Can read');
    
    // 檢查寫入權限
    await fs.access(filePath, fs.constants.W_OK);
    console.log('Can write');
    
    // 檢查執行權限
    await fs.access(filePath, fs.constants.X_OK);
    console.log('Can execute');
  } catch (err) {
    console.error('Permission denied:', err.code);
  }
}

// 修改權限
async function changePermissions(filePath) {
  // 設定為 644 (rw-r--r--)
  await fs.chmod(filePath, 0o644);
  
  // 設定為 755 (rwxr-xr-x)
  await fs.chmod(filePath, 0o755);
}

// 修改擁有者（需要 root 權限）
async function changeOwner(filePath, uid, gid) {
  await fs.chown(filePath, uid, gid);
}

// 修改時間戳
async function touchFile(filePath) {
  const now = new Date();
  await fs.utimes(filePath, now, now);
}
```

### 檔案監控

```javascript
const fs = require('fs');

// 監控單一檔案
function watchFile(filePath) {
  const watcher = fs.watch(filePath, (eventType, filename) => {
    console.log(`Event: ${eventType}, File: ${filename}`);
    
    if (eventType === 'change') {
      console.log('File was modified');
    } else if (eventType === 'rename') {
      console.log('File was renamed or deleted');
    }
  });

  // 停止監控
  setTimeout(() => {
    watcher.close();
  }, 60000); // 60 秒後停止
}

// 監控目錄
function watchDirectory(dirPath) {
  const watcher = fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
    console.log(`Event: ${eventType}, File: ${filename}`);
  });

  watcher.on('error', (err) => {
    console.error('Watcher error:', err);
  });

  return watcher;
}

// 使用 fs.watchFile（輪詢）
function pollFile(filePath) {
  fs.watchFile(filePath, { interval: 1000 }, (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
      console.log('File was modified');
      console.log('Old mtime:', prev.mtime);
      console.log('New mtime:', curr.mtime);
    }
  });
}

// 進階監控（使用 chokidar 套件）
const chokidar = require('chokidar');

function advancedWatch(pattern) {
  const watcher = chokidar.watch(pattern, {
    ignored: /(^|[\/\\])\../, // 忽略隱藏檔案
    persistent: true,
    ignoreInitial: true
  });

  watcher
    .on('add', path => console.log(`File ${path} has been added`))
    .on('change', path => console.log(`File ${path} has been changed`))
    .on('unlink', path => console.log(`File ${path} has been removed`))
    .on('addDir', path => console.log(`Directory ${path} has been added`))
    .on('unlinkDir', path => console.log(`Directory ${path} has been removed`))
    .on('error', error => console.log(`Watcher error: ${error}`))
    .on('ready', () => console.log('Initial scan complete'));

  return watcher;
}
```

### 進階操作

#### 檔案鎖定

```javascript
const fs = require('fs').promises;

// 簡單的檔案鎖
class FileLock {
  constructor(lockFile) {
    this.lockFile = lockFile;
  }

  async acquire(timeout = 5000) {
    const startTime = Date.now();
    
    while (true) {
      try {
        // 嘗試創建鎖檔案（排他性）
        await fs.writeFile(this.lockFile, process.pid.toString(), {
          flag: 'wx' // 只在檔案不存在時寫入
        });
        return true;
      } catch (err) {
        if (err.code !== 'EEXIST') throw err;
        
        // 檢查超時
        if (Date.now() - startTime > timeout) {
          throw new Error('Lock acquisition timeout');
        }
        
        // 等待後重試
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  async release() {
    try {
      await fs.unlink(this.lockFile);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
}

// 使用
async function criticalSection() {
  const lock = new FileLock('.lock');
  
  try {
    await lock.acquire();
    
    // 執行關鍵區段
    console.log('Lock acquired, doing critical work...');
    await performCriticalWork();
    
  } finally {
    await lock.release();
    console.log('Lock released');
  }
}
```

#### 檔案上傳處理

```javascript
const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');

const app = express();

// 設定儲存
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads';
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一檔名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 檔案過濾
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// 上傳路由
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // 檔案資訊
  const fileInfo = {
    originalName: req.file.originalname,
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size,
    mimetype: req.file.mimetype
  };

  res.json({ message: 'File uploaded successfully', file: fileInfo });
});

// 清理舊檔案
async function cleanupOldFiles(directory, maxAge) {
  const now = Date.now();
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const filePath = path.join(directory, entry.name);
    const stats = await fs.stat(filePath);
    const age = now - stats.mtime.getTime();

    if (age > maxAge) {
      await fs.unlink(filePath);
      console.log(`Deleted old file: ${entry.name}`);
    }
  }
}

// 每天執行清理
setInterval(() => {
  cleanupOldFiles('uploads', 7 * 24 * 60 * 60 * 1000); // 7 天
}, 24 * 60 * 60 * 1000);
```

### 效能優化

```javascript
// 批次操作
async function batchReadFiles(filePaths) {
  // ❌ 序列讀取（慢）
  const results = [];
  for (const filePath of filePaths) {
    const data = await fs.readFile(filePath, 'utf8');
    results.push(data);
  }
  return results;

  // ✅ 並發讀取（快）
  return Promise.all(
    filePaths.map(filePath => fs.readFile(filePath, 'utf8'))
  );
}

// 使用 Stream 管道
function efficientCopy(src, dest) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(src);
    const writeStream = fs.createWriteStream(dest);
    
    readStream.pipe(writeStream)
      .on('finish', resolve)
      .on('error', reject);
  });
}

// 記憶體映射（大檔案）
const mmap = require('mmap-io');

function mmapReadFile(filePath) {
  const fd = fs.openSync(filePath, 'r');
  const stats = fs.fstatSync(fd);
  
  const buffer = mmap.map(
    stats.size,
    mmap.PROT_READ,
    mmap.MAP_SHARED,
    fd,
    0
  );
  
  // 使用 buffer
  console.log(buffer.slice(0, 100));
  
  // 清理
  mmap.munmap(buffer);
  fs.closeSync(fd);
}
```

### 錯誤碼參考

| 錯誤碼 | 說明 | 處理方式 |
|--------|------|----------|
| ENOENT | 檔案或目錄不存在 | 檢查路徑，創建檔案 |
| EACCES | 權限被拒絕 | 檢查檔案權限 |
| EEXIST | 檔案已存在 | 使用其他名稱或覆蓋 |
| EISDIR | 對象是目錄而非檔案 | 使用目錄操作方法 |
| ENOTDIR | 對象是檔案而非目錄 | 使用檔案操作方法 |
| EMFILE | 開啟檔案數過多 | 關閉不需要的檔案 |
| ENOSPC | 磁碟空間不足 | 清理磁碟空間 |

```javascript
async function handleFileErrors() {
  try {
    await fs.readFile('file.txt', 'utf8');
  } catch (err) {
    switch (err.code) {
      case 'ENOENT':
        console.error('File not found');
        break;
      case 'EACCES':
        console.error('Permission denied');
        break;
      case 'EISDIR':
        console.error('Path is a directory');
        break;
      default:
        console.error('Unexpected error:', err);
    }
  }
}
```

## 總結

**API 選擇**：
- Promise API（推薦）：現代、易用
- Callback API：傳統、兼容
- Sync API：僅用於啟動時

**重要概念**：
- 非同步 I/O：不阻塞事件循環
- Stream：處理大檔案
- 錯誤處理：正確處理各種錯誤碼

**最佳實踐**：
- 使用 Promise/Async-Await
- Stream 處理大檔案
- 原子寫入操作
- 適當的錯誤處理
- 並發操作提升效能

理解檔案系統操作是 Node.js 後端開發的基礎技能。
