# 記憶體管理與垃圾回收

- **難度**: 7
- **重要程度**: 4
- **標籤**: `Memory Management`, `GC`, `V8`, `記憶體洩漏`

## 問題詳述

請深入解釋 Node.js 的記憶體管理機制、V8 垃圾回收演算法、記憶體洩漏的常見原因和排查方法。

## 核心理論與詳解

### V8 記憶體結構

**記憶體分區**：
```
┌────────────────────────────────────────┐
│       V8 Heap Memory                   │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │   New Space (新生代)              │ │
│  │   - 大小: 1-8MB                   │ │
│  │   - 存儲: 新創建的物件            │ │
│  │   - GC: Scavenge (頻繁)          │ │
│  │                                  │ │
│  │   ┌─────────┐  ┌─────────┐      │ │
│  │   │ From    │  │   To    │      │ │
│  │   └─────────┘  └─────────┘      │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │   Old Space (老生代)              │ │
│  │   - 大小: ~700MB (可調整)         │ │
│  │   - 存儲: 長期存活的物件          │ │
│  │   - GC: Mark-Sweep, Mark-Compact │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │   Large Object Space             │ │
│  │   - 大型物件 (>1MB)               │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │   Code Space                     │ │
│  │   - JIT 編譯後的程式碼            │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│    Stack Memory (堆疊記憶體)           │
│    - 存儲: 原始型別、函式呼叫          │
│    - 大小: ~1MB                        │
└────────────────────────────────────────┘
```

**預設記憶體限制**：
```bash
# 64-bit 系統
New Space: 16 MB (8MB × 2)
Old Space: ~1.4 GB

# 32-bit 系統
Old Space: ~700 MB
```

**調整記憶體限制**：
```bash
# 增加老生代記憶體到 4GB
node --max-old-space-size=4096 app.js

# 增加新生代記憶體到 16MB
node --max-semi-space-size=16 app.js

# 查看記憶體統計
node --expose-gc --trace-gc app.js
```

### 垃圾回收演算法

#### Scavenge（新生代回收）

**工作原理**（Cheney's Algorithm）：
```
初始狀態：
┌──────────┬──────────┐
│   From   │    To    │
│  (使用)  │  (空閒)  │
├──────────┼──────────┤
│ Obj A    │          │
│ Obj B    │          │
│ Obj C    │          │
└──────────┴──────────┘

GC 執行：
1. 標記 From 區的活躍物件
2. 將活躍物件複製到 To 區
3. 清空 From 區

┌──────────┬──────────┐
│   From   │    To    │
│  (空閒)  │  (使用)  │
├──────────┼──────────┤
│          │ Obj A    │
│          │ Obj C    │
│          │          │
└──────────┴──────────┘

4. From 和 To 互換角色
```

**特性**：
- 快速但空間利用率低（只使用一半）
- 適合短生命週期的物件
- 頻繁執行（幾毫秒一次）

**晉升（Promotion）**：
```javascript
// 物件在新生代經歷兩次 GC 仍存活
// → 晉升到老生代

New Space → (存活兩次 GC) → Old Space
```

#### Mark-Sweep（標記清除）

**步驟**：
```
1. 標記階段 (Mark)
   從 GC Roots 開始遍歷，標記所有可達物件

   GC Roots:
   ├─ Global Object
   ├─ Stack Variables
   ├─ Active Closures
   └─ ...

   ┌─────┬─────┬─────┬─────┬─────┐
   │  A  │  B  │  C  │  D  │  E  │
   │ ✓   │ ✓   │     │ ✓   │     │
   └─────┴─────┴─────┴─────┴─────┘

2. 清除階段 (Sweep)
   清除未標記的物件

   ┌─────┬─────┬─────┬─────┬─────┐
   │  A  │  B  │ ⬜  │  D  │ ⬜  │
   │ ✓   │ ✓   │     │ ✓   │     │
   └─────┴─────┴─────┴─────┴─────┘

3. 結果
   記憶體碎片化

   ┌─────┬─────┬─────┬─────┬─────┐
   │  A  │  B  │空閒 │  D  │空閒 │
   └─────┴─────┴─────┴─────┴─────┘
```

**問題**：
- 產生記憶體碎片
- 可能導致大物件無法分配

#### Mark-Compact（標記整理）

**步驟**：
```
1. 標記階段（同 Mark-Sweep）

2. 整理階段 (Compact)
   將活躍物件移動到記憶體一端

   Before:
   ┌─────┬─────┬─────┬─────┬─────┐
   │  A  │  B  │空閒 │  D  │空閒 │
   └─────┴─────┴─────┴─────┴─────┘

   After:
   ┌─────┬─────┬─────┬──────────────┐
   │  A  │  B  │  D  │   空閒區域   │
   └─────┴─────┴─────┴──────────────┘

3. 結果
   連續的空閒記憶體
```

**優點**：
- 解決碎片化問題
- 適合老生代

**缺點**：
- 較慢（需要移動物件）

#### Incremental Marking（增量標記）

**問題**：
全量 GC 會暫停（Stop-The-World）應用執行。

**解決方案**：
```
傳統 GC:
Application ████ (暫停) GC ████████ Application ████

增量 GC:
Application ██ GC ██ Application ██ GC ██ Application

將 GC 分成多個小步驟，與應用執行交替進行
```

**實現**：
```
1. 標記一部分物件
2. 暫停，讓應用執行
3. 繼續標記
4. 重複直到完成
```

#### Concurrent Marking（並發標記）

**原理**：
```
Main Thread:        Application ████████████
Background Thread:  ████ GC Marking ████████

GC 在背景線程執行，不阻塞主線程
```

**V8 實現**：
- Orinoco（V8 的並發 GC）
- 使用多個 Helper Thread 執行 GC

### 記憶體洩漏

#### 常見原因

**1. 全域變數**：
```javascript
// ❌ 意外創建全域變數
function leak() {
  cache = new Array(1000000); // 沒有宣告，成為全域變數
}

// ✅ 正確
function noLeak() {
  const cache = new Array(1000000);
}
```

**2. 閉包**：
```javascript
// ❌ 閉包保持對大型物件的引用
function createLeak() {
  const largeData = new Array(1000000).fill('data');
  
  return function() {
    console.log(largeData[0]); // 閉包保持對 largeData 的引用
  };
}

const leaks = [];
for (let i = 0; i < 100; i++) {
  leaks.push(createLeak()); // largeData 無法被回收
}

// ✅ 正確：只保留需要的部分
function noLeak() {
  const largeData = new Array(1000000).fill('data');
  const firstItem = largeData[0];
  
  return function() {
    console.log(firstItem); // 只保留 firstItem
  };
}
```

**3. 定時器和回調**：
```javascript
// ❌ 忘記清除定時器
class DataFetcher {
  constructor() {
    this.data = new Array(1000000);
    this.intervalId = setInterval(() => {
      console.log(this.data.length);
    }, 1000);
  }
  
  // 沒有清除 interval
}

// ✅ 正確
class DataFetcher {
  constructor() {
    this.data = new Array(1000000);
    this.intervalId = setInterval(() => {
      console.log(this.data.length);
    }, 1000);
  }
  
  destroy() {
    clearInterval(this.intervalId);
    this.data = null;
  }
}
```

**4. 事件監聽器**：
```javascript
// ❌ 忘記移除事件監聽器
const EventEmitter = require('events');
const emitter = new EventEmitter();

class Component {
  constructor() {
    this.data = new Array(1000000);
    this.handler = () => console.log(this.data.length);
    emitter.on('event', this.handler);
  }
  // 沒有移除監聽器
}

// ✅ 正確
class Component {
  constructor() {
    this.data = new Array(1000000);
    this.handler = () => console.log(this.data.length);
    emitter.on('event', this.handler);
  }
  
  destroy() {
    emitter.removeListener('event', this.handler);
    this.data = null;
  }
}
```

**5. 快取無限增長**：
```javascript
// ❌ 快取無限增長
const cache = {};

function getData(key) {
  if (cache[key]) {
    return cache[key];
  }
  
  const data = fetchData(key);
  cache[key] = data; // 永不清除
  return data;
}

// ✅ 使用 LRU Cache
const LRU = require('lru-cache');
const cache = new LRU({
  max: 500,
  maxAge: 1000 * 60 * 60 // 1 小時
});

function getData(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = fetchData(key);
  cache.set(key, data);
  return data;
}
```

**6. 大型陣列/物件未釋放**：
```javascript
// ❌ 大型物件未釋放
let bigData = [];

function processData() {
  bigData = new Array(10000000).fill('data');
  // 處理完後沒有釋放
}

// ✅ 正確
function processData() {
  let bigData = new Array(10000000).fill('data');
  // 處理資料
  bigData = null; // 明確釋放
}
```

### 記憶體監控

#### 使用 process.memoryUsage()

```javascript
function checkMemory() {
  const mem = process.memoryUsage();
  
  console.log({
    rss: `${(mem.rss / 1024 / 1024).toFixed(2)} MB`,           // 常駐集大小
    heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`, // 堆總大小
    heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`,   // 堆使用量
    external: `${(mem.external / 1024 / 1024).toFixed(2)} MB`,   // V8 外部記憶體
    arrayBuffers: `${(mem.arrayBuffers / 1024 / 1024).toFixed(2)} MB`
  });
}

// 定期檢查
setInterval(checkMemory, 5000);
```

**指標說明**：
- **rss** (Resident Set Size)：程序佔用的物理記憶體總量
- **heapTotal**：V8 堆的總大小
- **heapUsed**：V8 堆實際使用的大小
- **external**：C++ 物件綁定到 JavaScript 物件的記憶體
- **arrayBuffers**：ArrayBuffer 和 SharedArrayBuffer 的記憶體

#### 使用 v8.getHeapStatistics()

```javascript
const v8 = require('v8');

function detailedMemoryInfo() {
  const heap = v8.getHeapStatistics();
  
  console.log({
    totalHeapSize: `${(heap.total_heap_size / 1024 / 1024).toFixed(2)} MB`,
    totalHeapExecutable: `${(heap.total_heap_size_executable / 1024 / 1024).toFixed(2)} MB`,
    totalPhysicalSize: `${(heap.total_physical_size / 1024 / 1024).toFixed(2)} MB`,
    usedHeapSize: `${(heap.used_heap_size / 1024 / 1024).toFixed(2)} MB`,
    heapSizeLimit: `${(heap.heap_size_limit / 1024 / 1024).toFixed(2)} MB`,
    mallocedMemory: `${(heap.malloced_memory / 1024 / 1024).toFixed(2)} MB`,
    peakMallocedMemory: `${(heap.peak_malloced_memory / 1024 / 1024).toFixed(2)} MB`,
    numberOfNativeContexts: heap.number_of_native_contexts,
    numberOfDetachedContexts: heap.number_of_detached_contexts
  });
}
```

#### Heap Snapshot

```javascript
const v8 = require('v8');
const fs = require('fs');

// 生成 heap snapshot
function takeHeapSnapshot() {
  const filename = `heap-${Date.now()}.heapsnapshot`;
  const snapshot = v8.writeHeapSnapshot(filename);
  console.log(`Heap snapshot written to ${snapshot}`);
  return snapshot;
}

// 在懷疑記憶體洩漏時調用
app.get('/debug/heap-snapshot', (req, res) => {
  const snapshot = takeHeapSnapshot();
  res.json({ snapshot });
});
```

**分析 Heap Snapshot**：
1. 在 Chrome DevTools 中打開
2. 比較多個 snapshot 找出增長的物件
3. 追蹤 Retainers（保持物件存活的引用鏈）

#### 使用 heapdump

```javascript
const heapdump = require('heapdump');

// 生成 heap dump
heapdump.writeSnapshot(`./heap-${Date.now()}.heapsnapshot`);

// 監聽 SIGUSR2 信號生成 dump
process.on('SIGUSR2', () => {
  heapdump.writeSnapshot(`./heap-${Date.now()}.heapsnapshot`);
});

// 觸發：kill -USR2 <pid>
```

#### 使用 clinic.js

```bash
# 安裝
npm install -g clinic

# 診斷記憶體問題
clinic doctor -- node app.js

# 生成火焰圖
clinic flame -- node app.js

# 分析堆使用
clinic heapprofiler -- node app.js
```

### 記憶體優化策略

#### 1. 使用 Stream 處理大檔案

```javascript
// ❌ 一次性載入整個檔案
const fs = require('fs');
const data = fs.readFileSync('large-file.txt', 'utf8');
// 記憶體佔用：檔案大小

// ✅ 使用 Stream
const fs = require('fs');
const readStream = fs.createReadStream('large-file.txt', 'utf8');
readStream.on('data', (chunk) => {
  // 處理 chunk
});
// 記憶體佔用：chunk 大小（64KB）
```

#### 2. 對象池（Object Pool）

```javascript
class ObjectPool {
  constructor(factory, reset, initialSize = 10) {
    this.factory = factory;
    this.reset = reset;
    this.pool = [];
    
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  acquire() {
    return this.pool.length > 0 ? this.pool.pop() : this.factory();
  }

  release(obj) {
    this.reset(obj);
    this.pool.push(obj);
  }
}

// 使用
const bufferPool = new ObjectPool(
  () => Buffer.allocUnsafe(1024),
  (buf) => buf.fill(0),
  100
);

function processData(data) {
  const buf = bufferPool.acquire();
  // 使用 buf 處理資料
  bufferPool.release(buf);
}
```

#### 3. WeakMap 和 WeakSet

```javascript
// ❌ 使用 Map（物件無法被回收）
const cache = new Map();

function cacheData(obj, data) {
  cache.set(obj, data);
}

// ✅ 使用 WeakMap（物件可以被回收）
const cache = new WeakMap();

function cacheData(obj, data) {
  cache.set(obj, data);
}

// 當 obj 沒有其他引用時，會被 GC 回收
// cache 中的條目也會自動清除
```

#### 4. 及時釋放大型物件

```javascript
// ❌ 保持大型物件引用
async function processLargeData() {
  const largeData = await fetchLargeData();
  
  await processInBackground(largeData);
  
  // largeData 仍然被保持
  await doOtherThings();
}

// ✅ 及時釋放
async function processLargeData() {
  let largeData = await fetchLargeData();
  
  await processInBackground(largeData);
  
  largeData = null; // 明確釋放
  
  if (global.gc) global.gc(); // 手動觸發 GC（僅調試用）
  
  await doOtherThings();
}
```

#### 5. 避免記憶體碎片

```javascript
// ❌ 頻繁創建小物件
for (let i = 0; i < 1000000; i++) {
  const obj = { id: i, data: new Array(10) };
  process(obj);
}

// ✅ 複用物件
const obj = { id: 0, data: new Array(10) };
for (let i = 0; i < 1000000; i++) {
  obj.id = i;
  obj.data.fill(0);
  process(obj);
}
```

### 記憶體洩漏排查流程

**1. 重現問題**：
```bash
# 長時間運行應用
node --inspect app.js

# 或使用壓力測試
ab -n 100000 -c 100 http://localhost:3000/api
```

**2. 監控記憶體增長**：
```javascript
// 記錄記憶體使用
const memoryLog = [];

setInterval(() => {
  const mem = process.memoryUsage();
  memoryLog.push({
    time: Date.now(),
    heapUsed: mem.heapUsed
  });
  
  // 檢測持續增長
  if (memoryLog.length > 100) {
    const trend = calculateTrend(memoryLog);
    if (trend > 0.01) { // 持續增長
      console.warn('Memory leak detected!');
      takeHeapSnapshot();
    }
    memoryLog.shift();
  }
}, 5000);
```

**3. 比較 Heap Snapshots**：
```bash
# 1. 應用啟動後立即拍攝 snapshot
# 2. 運行一段時間後再拍攝
# 3. 在 Chrome DevTools 中比較
```

**4. 分析 Retainers**：
```
在 Chrome DevTools 中：
1. 找到異常增長的物件
2. 查看 Retainers（保持引用的路徑）
3. 追蹤到源頭
```

**5. 修復並驗證**：
```bash
# 修復後重新測試
node app.js

# 監控記憶體是否穩定
```

## 總結

**V8 記憶體結構**：
- New Space（新生代）：快速分配和回收
- Old Space（老生代）：長期物件
- GC 演算法：Scavenge、Mark-Sweep、Mark-Compact

**GC 優化**：
- Incremental Marking（增量標記）
- Concurrent Marking（並發標記）
- 減少 Stop-The-World 時間

**常見記憶體洩漏**：
- 全域變數
- 閉包引用
- 未清除的定時器和監聽器
- 無限增長的快取

**監控工具**：
- process.memoryUsage()
- v8.getHeapStatistics()
- Heap Snapshot
- clinic.js

**優化策略**：
- 使用 Stream 處理大檔案
- 對象池復用
- WeakMap/WeakSet
- 及時釋放大型物件

理解記憶體管理和 GC 機制是編寫高性能 Node.js 應用的關鍵。
