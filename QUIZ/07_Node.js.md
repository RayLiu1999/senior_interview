# Node.js - 重點考題 (Quiz)

> 這份考題是從 Node.js 章節中挑選出**重要程度 4-5** 的核心題目，設計成自我測驗的形式。
> 
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

## 🔄 核心概念 (Core)

### Q1: 請詳細解釋 Node.js 的 Event Loop

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

Event Loop 是 Node.js 的核心機制。請解釋它的各個階段和執行順序。

<details>
<summary>💡 答案提示</summary>

**Event Loop 六個階段**：

| 階段 | 說明 |
|------|------|
| **Timers** | 執行 `setTimeout` / `setInterval` 回調 |
| **Pending Callbacks** | 執行延遲到下一輪的 I/O 回調 |
| **Idle, Prepare** | 內部使用 |
| **Poll** | 檢索新的 I/O 事件，執行 I/O 回調 |
| **Check** | 執行 `setImmediate` 回調 |
| **Close Callbacks** | 執行關閉事件回調（如 `socket.on('close')`） |

**微任務隊列**（在每個階段之間執行）：
1. `process.nextTick` 隊列（優先級最高）
2. Promise 微任務隊列

**執行順序範例**：
```javascript
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('promise'));

// 輸出：nextTick → promise → timeout → immediate
```

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Core/event_loop_and_libuv.md)

---

### Q2: 阻塞 I/O 和非阻塞 I/O 有什麼區別？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋為什麼 Node.js 採用非阻塞 I/O，以及這對性能的影響。

<details>
<summary>💡 答案提示</summary>

| 特性 | 阻塞 I/O | 非阻塞 I/O |
|------|----------|------------|
| **行為** | 等待操作完成 | 立即返回 |
| **線程** | 一個請求佔用一個線程 | 單線程處理多請求 |
| **資源消耗** | 高 | 低 |
| **適用場景** | CPU 密集型 | I/O 密集型 |

**Node.js 的設計**：
- 使用 **libuv** 實現異步 I/O
- 主線程處理 JavaScript 執行
- 線程池處理文件 I/O、DNS 查詢等

**為什麼高效**：
- 單線程避免上下文切換開銷
- 事件驅動，不浪費等待時間
- 適合高併發 I/O 密集場景

**注意**：CPU 密集型任務會阻塞 Event Loop！

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Core/blocking_vs_non_blocking_io.md)

---

### Q3: 如何正確處理 Node.js 中的錯誤？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明同步、異步和 Promise 場景下的錯誤處理最佳實踐。

<details>
<summary>💡 答案提示</summary>

**1. 同步代碼**：
```javascript
try {
    const data = JSON.parse(invalidJson);
} catch (err) {
    console.error('解析錯誤:', err);
}
```

**2. 回調模式（Error-First）**：
```javascript
fs.readFile('file.txt', (err, data) => {
    if (err) {
        return console.error('讀取失敗:', err);
    }
    // 處理 data
});
```

**3. Promise / async-await**：
```javascript
async function fetchData() {
    try {
        const data = await someAsyncOp();
        return data;
    } catch (err) {
        throw new CustomError('操作失敗', err);
    }
}
```

**全局錯誤處理**：
```javascript
process.on('uncaughtException', (err) => {
    console.error('未捕獲異常:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('未處理的 Promise 拒絕:', reason);
});
```

**最佳實踐**：始終處理錯誤，不要讓應用靜默失敗

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Core/error_handling_async_patterns.md)

---

### Q4: Stream 和 Buffer 是什麼？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請解釋 Stream 的類型、背壓機制，以及 Buffer 的用途。

<details>
<summary>💡 答案提示</summary>

**Buffer**：
- 用於處理二進制數據
- 固定大小的記憶體區塊
- 用於文件 I/O、網絡傳輸

**Stream 類型**：

| 類型 | 說明 | 例子 |
|------|------|------|
| **Readable** | 讀取數據 | `fs.createReadStream` |
| **Writable** | 寫入數據 | `fs.createWriteStream` |
| **Duplex** | 可讀可寫 | `net.Socket` |
| **Transform** | 轉換數據 | `zlib.createGzip` |

**背壓 (Backpressure)**：
- 當寫入速度 > 處理速度時產生
- `writable.write()` 返回 `false` 表示需要暫停
- 監聽 `drain` 事件後繼續寫入

**使用 Stream 的優勢**：
```javascript
// 不好：一次性讀入記憶體
const data = fs.readFileSync('large-file.txt');

// 好：使用 Stream 逐塊處理
fs.createReadStream('large-file.txt')
    .pipe(transformStream)
    .pipe(fs.createWriteStream('output.txt'));
```

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Core/stream_and_buffer.md)

---

### Q5: Cluster 和 Worker Threads 有什麼區別？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

如何利用多核 CPU 來提升 Node.js 應用性能？

<details>
<summary>💡 答案提示</summary>

| 特性 | Cluster | Worker Threads |
|------|---------|----------------|
| **隔離級別** | 進程級別 | 線程級別 |
| **記憶體** | 獨立 | 可共享 |
| **通訊方式** | IPC | Message / SharedArrayBuffer |
| **適用場景** | 多核 HTTP 服務 | CPU 密集計算 |
| **資源開銷** | 較高 | 較低 |

**Cluster 範例**：
```javascript
if (cluster.isPrimary) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {
    http.createServer(app).listen(3000);
}
```

**Worker Threads 範例**：
```javascript
const { Worker } = require('worker_threads');
const worker = new Worker('./heavy-task.js');
worker.on('message', (result) => { ... });
```

**選擇指南**：
- Web 服務擴展 → Cluster
- CPU 密集計算 → Worker Threads

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Core/cluster_and_worker_threads.md)

---

### Q6: CommonJS 和 ES Modules 有什麼區別？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請比較這兩種模組系統的差異和使用場景。

<details>
<summary>💡 答案提示</summary>

| 特性 | CommonJS | ES Modules |
|------|----------|------------|
| **語法** | `require` / `module.exports` | `import` / `export` |
| **加載時機** | 運行時（動態） | 編譯時（靜態） |
| **頂層 await** | ❌ | ✅ |
| **Tree Shaking** | ❌ | ✅ |
| **this 指向** | `module.exports` | `undefined` |

**CommonJS**：
```javascript
const fs = require('fs');
module.exports = { myFunc };
```

**ES Modules**：
```javascript
import fs from 'fs';
export const myFunc = () => {};
```

**互操作性**：
- ESM 可以導入 CJS
- CJS 導入 ESM 需要動態 `import()`

**Node.js 中啟用 ESM**：
- 文件擴展名使用 `.mjs`
- 或在 `package.json` 設置 `"type": "module"`

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Core/module_systems.md)

---

## 🌐 Express 框架

### Q7: Express Middleware 的執行機制是什麼？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋中間件的執行順序和常見類型。

<details>
<summary>💡 答案提示</summary>

**中間件簽名**：
```javascript
function middleware(req, res, next) {
    // 處理請求
    next();  // 調用下一個中間件
}
```

**執行順序**：按照註冊順序，從上到下執行

**中間件類型**：

| 類型 | 說明 |
|------|------|
| **應用級** | `app.use(middleware)` |
| **路由級** | `router.use(middleware)` |
| **錯誤處理** | 4 個參數 `(err, req, res, next)` |
| **內建** | `express.json()`, `express.static()` |
| **第三方** | `cors`, `helmet`, `morgan` |

**常見模式**：
```javascript
// 日誌
app.use(morgan('dev'));

// 解析 JSON
app.use(express.json());

// 認證（特定路由）
app.use('/api', authMiddleware);

// 錯誤處理（放最後）
app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
});
```

**關鍵**：忘記調用 `next()` 會導致請求掛起

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/Express/middleware_in_depth.md)

---

### Q8: Express 錯誤處理的最佳實踐是什麼？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

如何在 Express 中統一處理同步和異步錯誤？

<details>
<summary>💡 答案提示</summary>

**錯誤處理中間件**（必須有 4 個參數）：
```javascript
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message
    });
});
```

**同步錯誤**：自動傳遞給錯誤處理中間件

**異步錯誤**：需要手動傳遞
```javascript
// 回調方式
app.get('/data', (req, res, next) => {
    fs.readFile('file.txt', (err, data) => {
        if (err) return next(err);
        res.send(data);
    });
});

// async/await 需要 wrapper
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

app.get('/data', asyncHandler(async (req, res) => {
    const data = await someAsyncOp();
    res.json(data);
}));
```

**自定義錯誤類**：
```javascript
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
```

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/Express/error_handling.md)

---

## 🏗️ NestJS 框架

### Q9: NestJS 的核心架構概念是什麼？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請解釋 NestJS 的模組系統、依賴注入和裝飾器。

<details>
<summary>💡 答案提示</summary>

**核心概念**：

| 概念 | 說明 |
|------|------|
| **Module** | 組織代碼的容器 |
| **Controller** | 處理 HTTP 請求 |
| **Provider** | 可注入的服務 |
| **Injectable** | 依賴注入的標記 |

**模組結構**：
```typescript
@Module({
    imports: [OtherModule],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {}
```

**依賴注入**：
```typescript
@Injectable()
export class UserService {
    constructor(private readonly db: DatabaseService) {}
}

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}
}
```

**優點**：
- 模組化設計，高度可測試
- 強類型支持（TypeScript）
- 內建支持微服務、GraphQL、WebSocket

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/NestJS/nestjs_architecture.md)

---

### Q10: NestJS 的請求生命週期是什麼？

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🟡 重要

請說明 Middleware、Guards、Interceptors、Pipes 的執行順序。

<details>
<summary>💡 答案提示</summary>

**執行順序**：
```
Request
  ↓
Middleware（中間件）
  ↓
Guards（守衛）
  ↓
Interceptors (Before)（攔截器-前）
  ↓
Pipes（管道）
  ↓
Controller Handler
  ↓
Interceptors (After)（攔截器-後）
  ↓
Exception Filters（異常過濾器）
  ↓
Response
```

**各組件職責**：

| 組件 | 職責 |
|------|------|
| **Middleware** | 通用請求處理（日誌、CORS） |
| **Guards** | 認證/授權 |
| **Interceptors** | 轉換請求/響應、計時、緩存 |
| **Pipes** | 數據驗證和轉換 |
| **Exception Filters** | 統一錯誤處理 |

**範例**：
```typescript
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
@UsePipes(ValidationPipe)
@Controller('users')
export class UserController {}
```

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/NestJS/middleware_guards_interceptors_pipes.md)

---

## 📘 TypeScript

### Q11: 為什麼在 Node.js 專案中使用 TypeScript？

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請說明 TypeScript 的優勢和在 Node.js 中的配置要點。

<details>
<summary>💡 答案提示</summary>

**TypeScript 優勢**：

| 優勢 | 說明 |
|------|------|
| **類型安全** | 編譯時捕獲錯誤 |
| **更好的 IDE 支持** | 自動完成、重構 |
| **可維護性** | 類型即文檔 |
| **現代語法** | ES 最新特性 |

**Node.js 專案配置**：
```json
// tsconfig.json
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "strict": true,
        "outDir": "./dist"
    }
}
```

**執行方式**：
- 編譯後執行：`tsc && node dist/index.js`
- 直接執行：`ts-node index.ts`
- 使用 `tsx`：`tsx index.ts`（更快）

**常用類型技巧**：
```typescript
// 類型推導
const user = await getUser(); // 自動推導類型

// 類型斷言
const data = response as UserData;

// 類型守衛
function isUser(obj: any): obj is User {
    return 'id' in obj && 'name' in obj;
}
```

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/TypeScript/typescript_with_nodejs.md)

---

### Q12: TypeScript 的進階型別系統有哪些重要概念？

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🟡 重要

請說明泛型、條件類型和工具類型的使用場景。

<details>
<summary>💡 答案提示</summary>

**泛型**：
```typescript
function identity<T>(arg: T): T {
    return arg;
}

interface Repository<T> {
    find(id: string): Promise<T>;
    save(entity: T): Promise<T>;
}
```

**條件類型**：
```typescript
type NonNullable<T> = T extends null | undefined ? never : T;
type Flatten<T> = T extends Array<infer U> ? U : T;
```

**常用工具類型**：

| 工具類型 | 說明 |
|----------|------|
| `Partial<T>` | 所有屬性可選 |
| `Required<T>` | 所有屬性必填 |
| `Pick<T, K>` | 選取特定屬性 |
| `Omit<T, K>` | 排除特定屬性 |
| `Record<K, V>` | 鍵值對類型 |
| `ReturnType<F>` | 函數返回類型 |

**映射類型**：
```typescript
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};
```

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/TypeScript/advanced_type_system.md)

---

## ⚡ 性能與運行時

### Q13: V8 引擎如何優化 JavaScript 執行？

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🟡 重要

請解釋 JIT 編譯、隱藏類和內聯緩存的原理。

<details>
<summary>💡 答案提示</summary>

**V8 執行流程**：
```
JavaScript 源碼
      ↓
   Parser（解析）
      ↓
   AST（抽象語法樹）
      ↓
   Ignition（解釋器，生成字節碼）
      ↓
   TurboFan（優化編譯器，熱點代碼）
      ↓
   Machine Code（機器碼）
```

**關鍵優化技術**：

| 技術 | 說明 |
|------|------|
| **隱藏類** | 追蹤對象結構，加速屬性訪問 |
| **內聯緩存** | 緩存屬性查找結果 |
| **內聯展開** | 將小函數直接嵌入調用處 |
| **逃逸分析** | 優化對象分配位置 |

**編碼建議**：
- 保持對象結構一致（不要動態添加屬性）
- 避免使用 `delete` 刪除屬性
- 函數參數類型保持一致
- 使用 TypedArray 處理二進制數據

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Runtimes/v8_engine_optimization.md)

---

### Q14: 如何檢測和解決 Node.js 記憶體洩漏？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請說明常見的記憶體洩漏原因和診斷方法。

<details>
<summary>💡 答案提示</summary>

**常見洩漏原因**：

| 原因 | 說明 |
|------|------|
| **全局變量** | 意外創建的全局引用 |
| **閉包** | 閉包持有外部作用域變量 |
| **事件監聽器** | 未移除的監聽器 |
| **緩存無限增長** | 沒有過期策略的緩存 |
| **計時器** | 未清除的 setInterval |

**診斷工具**：
```javascript
// 查看記憶體使用
console.log(process.memoryUsage());

// 使用 --inspect 開啟 DevTools
node --inspect app.js
```

**堆快照分析**：
1. 使用 Chrome DevTools 連接
2. 錄製 Heap Snapshot
3. 比較多個快照，找出增長的對象

**預防措施**：
```javascript
// 移除事件監聽器
emitter.removeListener('event', handler);

// 清除計時器
clearInterval(timer);

// 使用 WeakMap / WeakSet
const cache = new WeakMap();
```

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Core/memory_management_and_gc.md)

---

## 📊 學習進度檢核

完成以上題目後，請自我評估：

| 評估項目 | 自評 |
|----------|------|
| 能詳細解釋 Event Loop 各階段 | ⬜ |
| 理解阻塞 vs 非阻塞 I/O | ⬜ |
| 掌握錯誤處理最佳實踐 | ⬜ |
| 理解 Stream 和背壓機制 | ⬜ |
| 能區分 Cluster 和 Worker Threads | ⬜ |
| 能比較 CommonJS 和 ESM | ⬜ |
| 理解 Express 中間件機制 | ⬜ |
| 掌握 Express 錯誤處理 | ⬜ |
| 了解 NestJS 架構概念 | ⬜ |
| 理解 NestJS 請求生命週期 | ⬜ |
| 能說明 TypeScript 優勢 | ⬜ |
| 了解 V8 優化原理 | ⬜ |
| 能診斷記憶體洩漏 | ⬜ |

**建議**：未能完整回答的題目，請回到對應的詳細文章深入學習。
