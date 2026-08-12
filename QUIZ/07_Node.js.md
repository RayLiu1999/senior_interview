# Node.js - 重點考題 (Quiz)

> 這份考題是從 Node.js 章節中挑選出**重要程度 4-5** 的核心題目，設計成自我測驗的形式。
> 
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

## 🔄 核心概念 (Core)

<a id="q1"></a>
### Q1: 請詳細解釋 Node.js 的 Event Loop
<!-- Concept ID: concept.nodejs.core.event-loop; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q2"></a>
### Q2: 阻塞 I/O 和非阻塞 I/O 有什麼區別？
<!-- Concept ID: concept.nodejs.core.nonblocking-io; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q3"></a>
### Q3: 如何正確處理 Node.js 中的錯誤？
<!-- Concept ID: concept.nodejs.core.async-error-handling; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q4"></a>
### Q4: Stream 和 Buffer 是什麼？
<!-- Concept ID: concept.nodejs.core.stream-buffer; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q5"></a>
### Q5: Cluster 和 Worker Threads 有什麼區別？
<!-- Concept ID: concept.nodejs.core.cluster-worker-threads; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q6"></a>
### Q6: CommonJS 和 ES Modules 有什麼區別？
<!-- Concept ID: concept.nodejs.core.module-systems; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q7"></a>
### Q7: Express Middleware 的執行機制是什麼？
<!-- Concept ID: concept.nodejs.express.middleware; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q8"></a>
### Q8: Express 錯誤處理的最佳實踐是什麼？
<!-- Concept ID: concept.nodejs.express.error-handling; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q9"></a>
### Q9: NestJS 的核心架構概念是什麼？
<!-- Concept ID: concept.nodejs.nestjs.architecture; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q10"></a>
### Q10: NestJS 的請求生命週期是什麼？
<!-- Concept ID: concept.nodejs.nestjs.request-lifecycle; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q11"></a>
### Q11: 為什麼在 Node.js 專案中使用 TypeScript？
<!-- Concept ID: concept.nodejs.typescript.node-integration; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q12"></a>
### Q12: TypeScript 的進階型別系統有哪些重要概念？
<!-- Concept ID: concept.nodejs.typescript.advanced-types; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q13"></a>
### Q13: V8 引擎如何優化 JavaScript 執行？
<!-- Concept ID: concept.nodejs.v8.jit-optimization; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q14"></a>
### Q14: 如何檢測和解決 Node.js 記憶體洩漏？
<!-- Concept ID: concept.nodejs.core.memory-management-gc; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

## 🏗️ NestJS 框架深入 (NestJS)

<a id="q15"></a>
### Q15: NestJS 的依賴注入與模組系統如何運作？
<!-- Concept ID: concept.nodejs.nestjs.dependency-injection-modules; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 Module、imports、providers、controllers、exports 與 custom provider token 如何共同形成 NestJS 的依賴圖。

<details>
<summary>💡 答案提示</summary>

- **Module 是邊界**：`controllers` 接收請求，`providers` 登記可注入實例，`exports` 決定哪些 provider 可被匯入模組使用。
- **依賴解析**：容器先讀取 metadata 和 token，再沿著 imports 尋找可見 provider，依 scope 建立或重用實例。
- **Custom provider**：`useClass`、`useValue`、`useFactory`、`useExisting` 適合替換實作、注入設定、建立外部 client 或提供別名。
- **常見風險**：忘記 export、在多個模組重複註冊同一 provider、循環依賴、把 request state 放入 singleton。
- **測試**：以 token 覆寫 provider，讓 controller／service 測試不必連接真實資料庫或外部服務。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/NestJS/dependency_injection_modules.md)

---

<a id="q16"></a>
### Q16: NestJS Provider 與 Service 如何劃分責任？
<!-- Concept ID: concept.nodejs.nestjs.providers-services; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請比較 Service、Repository、Factory、Helper 與 custom provider，並說明如何設計 scope、測試替身與外部資源 ownership。

<details>
<summary>💡 答案提示</summary>

- **Controller** 負責協定、輸入與輸出；**Service** 協調業務規則；**Repository** 負責資料存取；Factory／custom provider 負責建立或替換實作。
- Provider 不只是「放工具函式的地方」；要讓每個 provider 有清楚的 ownership、錯誤邊界與副作用。
- 無狀態且可安全共享的 client 可以使用 singleton；request context、租戶資料與可變工作狀態應使用 request scope 或明確傳入。
- 使用 token 和 mock／fake 進行測試，避免測試因真實資料庫、Redis 或 HTTP client 而失去隔離。
- 不要讓一個 Service 同時承擔 HTTP、資料庫、付款、通知和快取全部責任，否則變更與故障難以定位。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/NestJS/providers_and_services.md)

---

<a id="q17"></a>
### Q17: NestJS Exception Filter 如何設計？
<!-- Concept ID: concept.nodejs.nestjs.exception-handling; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請說明 Exception Filter 的捕獲範圍、HTTP status mapping、日誌與安全錯誤回應應如何設計。

<details>
<summary>💡 答案提示</summary>

- NestJS 可在 route、controller 或 global scope 套用 filter；要先區分 `HttpException`、domain／下游錯誤與未知 programmer error。
- 統一錯誤回應通常包含 status、穩定 error code、correlation ID、timestamp 與 path，但 production 不應暴露 stack、SQL 或租戶敏感資料。
- Filter 要記錄足夠的 server-side context，並把可預期的驗證／衝突／下游 timeout 映射成一致的 HTTP 語意。
- 未知錯誤應回傳安全的 500，不能把原始 exception message 直接交給客戶端；若 response headers 已送出，也不能重複寫新的 body。
- 錯誤處理還要配合 request lifecycle、取消、重試與監控，避免只改 response 格式而遺失故障證據。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/NestJS/exception_handling.md)

---

## 📦 Tooling

<a id="q18"></a>
### Q18: 如何利用 package.json 建立可重現且安全的 Node.js 依賴邊界？
<!-- Concept ID: concept.nodejs.tooling.package-manifest-reproducibility; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 dependencies 類型、exports、scripts、SemVer、lockfile 與 CI 安裝流程如何共同影響生產結果。

<details>
<summary>💡 答案提示</summary>

- `dependencies` 是 runtime 需要的套件，`devDependencies` 是建置／測試工具；`peerDependencies` 表達由宿主提供且需要相容版本的契約。
- 版本範圍只是選擇條件，lockfile 才保存具體解析結果；CI 應使用對應的 frozen／clean install，不任意改寫 lockfile。
- `exports` 可限制公開入口，`engines`、overrides、scripts 與 lifecycle hook 也要納入審查。
- 要把套件清單、lockfile、Node／套件管理器版本與 audit／license 結果一起視為可部署 artifact 的證據。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Tooling/package_json_deep_dive.md)

<a id="q19"></a>
### Q19: npm、Yarn 與 pnpm 如何影響依賴可重現性？
<!-- Concept ID: concept.nodejs.tooling.package-manager-reproducibility; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較三種套件管理器的依賴解析、node_modules／PnP 結構、workspace、幽靈依賴與 CI 策略。

<details>
<summary>💡 答案提示</summary>

| 面向 | 要回答的問題 |
|------|--------------|
| **lockfile** | 是否固定完整 dependency graph、registry integrity 與 manager 版本 |
| **解析結構** | npm／Yarn node_modules、Yarn PnP、pnpm symlink 與 content-addressable store 的差異 |
| **隔離性** | flat hoisting 是否讓程式非法使用未宣告的 phantom dependency |
| **CI** | 是否固定 Node／manager、使用 frozen install、驗證 lockfile diff 並從乾淨環境重建 |

選型不能只看安裝速度；要用 clean install、workspace build、依賴圖與 artifact checksum 證明結果一致。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Tooling/npm_vs_yarn_vs_pnpm.md)

<a id="q20"></a>
### Q20: Node.js 專案如何設計可信的測試策略？
<!-- Concept ID: concept.nodejs.tooling.testing-strategy; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 Jest、Vitest、Mocha 與 unit、integration、contract、E2E 測試應如何分工，以及 coverage 的限制。

<details>
<summary>💡 答案提示</summary>

- Unit 驗證純邏輯，integration 驗證資料庫／檔案／HTTP 邊界，contract 驗證服務契約，E2E 驗證少量關鍵使用者流程。
- 工具選擇要配合 module system、TypeScript transform、fake timer、worker isolation 與 runtime，不只比較 benchmark。
- Mock 應放在真正的 ownership boundary；過度 mock 會讓 production module graph、router 或 SSR 行為失真。
- Coverage 是未執行路徑的訊號，不等於資料正確性、併發安全、部署可重現或故障恢復；要搭配 flaky rate、故障注入與 CI gate。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Tooling/testing_tools_strategies.md)

## ⚙️ Node.js Core

<a id="q21"></a>
### Q21: EventEmitter 的 listener 生命週期與錯誤邊界如何管理？
<!-- Concept ID: concept.nodejs.core.event-emitter-lifecycle; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 `emit` 的同步語意、`on`／`once`／`off`、`error` 事件，以及如何避免 listener leak 與重複訂閱。

<details>
<summary>💡 答案提示</summary>

- `emit` 依註冊順序同步呼叫 listener；`once` 只消費一次，`off`／`removeListener` 必須使用相同的函式參照。
- 沒有 `error` listener 可能讓錯誤升成未捕獲例外；非同步 listener 的 rejected Promise 也要明確處理。
- 每次訂閱都要有 owner、cleanup 與 shutdown 路徑；`MaxListenersExceededWarning` 是要調查的訊號，不是單純把上限調大。
- 用 listener count、heap snapshot、event trace、重複初始化與 graceful shutdown 測試證明沒有累積或遺失事件。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Core/event_emitter_and_observer_pattern.md)

<a id="q22"></a>
### Q22: Node.js Process 與 Child Process 的選擇和資源管理有什麼差異？
<!-- Concept ID: concept.nodejs.core.process-child-process; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較 `spawn`、`exec`、`execFile`、`fork` 的輸出、shell、IPC、取消與安全性，並說明 graceful shutdown。

<details>
<summary>💡 答案提示</summary>

| 方法 | 典型語意 | 主要風險 |
|------|----------|----------|
| `spawn` | stream、大量或長時間輸出 | 忽略 backpressure、未回收 child |
| `exec` | shell command、buffered output | shell injection、buffer 上限 |
| `execFile` | 直接執行檔案 | 參數與權限仍需驗證 |
| `fork` | Node.js module 加 IPC | message、shutdown 與 instance 管理 |

要處理 signal、timeout、abort、exit／close、stderr、孤兒程序與權限；不要把使用者輸入直接拼進 shell command。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Core/process_and_child_process.md)

<a id="q23"></a>
### Q23: Node.js 檔案系統 API 如何在效能與可靠性間取捨？
<!-- Concept ID: concept.nodejs.core.filesystem-io; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明 callback、Promise、sync API、stream、backpressure、原子寫入與檔案錯誤處理的適用邊界。

<details>
<summary>💡 答案提示</summary>

- request path 不應任意使用同步 API；啟動設定或小型一次性操作才可能接受同步成本。
- 大檔案應使用 bounded stream 並處理 `write()`、`drain`、client abort、file descriptor 與 cleanup，避免一次載入記憶體。
- 寫入重要資料要考慮暫存檔、fsync／rename 的原子性、權限、path traversal、並發競態與磁碟滿錯誤。
- 用 event-loop delay、open handles、RSS、I/O latency、錯誤碼與中斷／重試測試驗證設計。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Core/file_system_operations.md)

## 📘 TypeScript

<a id="q24"></a>
### Q24: TypeScript 在 Node.js 中的型別安全邊界在哪裡？
<!-- Concept ID: concept.nodejs.typescript.adoption-boundary; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明 TypeScript 的編譯期保護、型別擦除、runtime validation、module／target 設定與遷移成本。

<details>
<summary>💡 答案提示</summary>

- TypeScript 只能在編譯期檢查原始碼；interface、generic 與 type assertion 不會在 runtime 自動驗證 JSON、環境變數或外部回應。
- HTTP、queue、檔案、資料庫與 JavaScript 套件都是 trust boundary；需用 schema、type guard 或 validated config 建立 runtime contract。
- `strict`、`module`、`moduleResolution`、`target`、source map、ESM／CommonJS 與 build runner 必須和 Node runtime 及部署一致。
- 遷移要追蹤 `any`、declaration、typecheck CI、測試與 source map；型別覆蓋率不能取代契約測試。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/TypeScript/why_use_typescript.md)

## 🌐 Express

<a id="q25"></a>
### Q25: Express 路由匹配與 Router 模組化如何避免邊界錯誤？
<!-- Concept ID: concept.nodejs.express.routing-dispatch; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 method、path、參數、註冊順序、Router mount、middleware 與 404／error boundary 的關係。

<details>
<summary>💡 答案提示</summary>

- Express 依 stack 的註冊順序尋找符合 method／path 的 layer；寬鬆的動態路徑可能先吃掉更具體的靜態路徑。
- `express.Router` 應依 bounded context 或 API version 組織，mount prefix、`mergeParams`、auth middleware 與輸入驗證要有明確 ownership。
- 404 應在所有可匹配路由之後，error middleware 要處理 async rejection、headers sent 與取消。
- 用 route map、404／405 分布、auth bypass case、版本 contract test 與 request trace 驗證，而不是只測 happy path。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/Express/routing_in_depth.md)

<a id="q26"></a>
### Q26: Express.js 與 Node.js 的 runtime 邊界應如何理解？
<!-- Concept ID: concept.nodejs.express.runtime-boundary; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請比較原生 Node.js `http` 與 Express 在 routing、middleware、request／response、錯誤處理、效能與維運上的責任。

<details>
<summary>💡 答案提示</summary>

- Node.js 是 runtime，提供 V8、事件循環、`http`、stream 與 process；Express 建立在其上，提供 router、middleware 與較方便的 request／response API。
- Express 的便利不代表自動具備 validation、auth、timeout、backpressure 或錯誤分類；這些仍需在應用邊界設計。
- 選型要看團隊能力、middleware、生態、版本相容、P99、event-loop、可觀測性與升級成本，不只看程式碼行數。
- 以 route contract、middleware trace、壓測、錯誤注入與 graceful shutdown test 驗證 abstraction 沒有掩蓋 runtime 行為。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/Express/express_and_nodejs.md)

## 🟢 Nuxt

<a id="q27"></a>
### Q27: Nuxt 的 SEO 與 Meta 管理如何跨越 SSR、hydration 與部署快取？
<!-- Concept ID: concept.nodejs.nuxt.seo-meta; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 `useHead`、Open Graph、canonical、structured data、sitemap 與 SSR／CSR 對 crawler 的影響。

<details>
<summary>💡 答案提示</summary>

- 公開頁面應在 crawler 可取得的 HTML 中產生唯一 title、description、canonical、Open Graph／Twitter Card 與必要結構化資料。
- 動態資料若只在 client mount 後才填 head，可能造成分享預覽與搜尋索引缺欄位；SSR、payload、hydration 與 route cache 要一起驗證。
- sitemap、robots、canonical domain、locale／alternate URL 與 cache invalidation 必須和部署環境一致。
- 以 raw HTML、head snapshot、crawler、Search Console、structured-data validator 與 Core Web Vitals 檢查，而非只在瀏覽器看畫面。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/Nuxt/seo_meta_management.md)

<a id="q28"></a>
### Q28: Nuxt 生產部署與性能優化如何建立可量測的取捨？
<!-- Concept ID: concept.nodejs.nuxt.deployment-performance; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請比較 SSR、SSG、serverless／edge 與 container 部署，並說明 code splitting、cache、CDN、health check 與 rollback。

<details>
<summary>💡 答案提示</summary>

- SSR 保持動態與 SEO，但有 server CPU／memory／下游成本；SSG 成本低但需要 revalidation 或 rebuild；serverless／edge 還要考慮 cold start 與 runtime API。
- 優化應拆分 TTFB、HTML、JS、圖片、第三方資源與 hydration，使用 lazy loading、compression、CDN 與有失效語意的 cache。
- runtime config 不應把 secret 打進 client bundle；readiness、liveness、graceful shutdown、錯誤追蹤與 artifact checksum 要納入發布。
- 用 P50／P99、CWV、CPU／RSS、cache hit、錯誤率、cold start、成本與 rollback time 驗證，而不是只看 Lighthouse 單次分數。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/Nuxt/deployment_performance.md)

<a id="q29"></a>
### Q29: Nuxt 的 useFetch、useAsyncData、$fetch 與狀態管理如何避免重複請求和資料污染？
<!-- Concept ID: concept.nodejs.nuxt.data-fetching-state; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請比較三種資料獲取 API、SSR payload／hydration、useState／Pinia、cache key、失效與 optimistic update。

<details>
<summary>💡 答案提示</summary>

- `useFetch`／`useAsyncData` 會參與 SSR 與 payload，`$fetch` 適合事件或明確 client request；混用不當會造成 SSR 後 client 重抓。
- key 必須包含 route、tenant、locale、使用者權限或資料版本等隔離維度；request-local state 不能被 server singleton 共享。
- `useState` 適合簡單共享狀態，Pinia 適合複雜 domain store；都要定義 hydration、失效、錯誤、取消與 optimistic rollback。
- 用 server／browser trace、payload、hydration warning、cache hit／miss 與交錯使用者請求測試證明不重複、不過期、不跨使用者污染。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/Nuxt/data_fetching_state_management.md)

<a id="q30"></a>
### Q30: Nuxt SSR、SSG、SPA、ISR 與 Hybrid Rendering 如何選擇？
<!-- Concept ID: concept.nodejs.nuxt.rendering-architecture; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請從 SEO、個人化、資料新鮮度、hydration、成本與部署限制說明不同渲染模式的適用邊界。

<details>
<summary>💡 答案提示</summary>

| 模式 | 優勢 | 主要代價 |
|------|------|----------|
| **SSR** | 動態、初始 HTML 與 SEO | 每次 request 的 server／下游成本 |
| **SSG** | 快、便宜、易用 CDN | 內容要 rebuild 或 revalidate |
| **SPA** | 互動與個人化靈活 | 初始 SEO、JS／hydration 成本 |
| **ISR／Hybrid** | 在 route 層平衡新鮮度與成本 | cache／失效與部署更複雜 |

選擇要落到每個 route 的資料與快取契約，並用 HTML／payload、hydration、TTFB、CWV、cache hit、內容新鮮度與 rollback 測試驗證。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/Nuxt/nuxt_architecture_rendering.md)

<a id="q31"></a>
### Q31: Nuxt 的目錄結構與自動導入約定如何形成清楚的程式碼邊界？
<!-- Concept ID: concept.nodejs.nuxt.directory-conventions; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明 pages、components、composables、server、public、assets、plugins 與 middleware 的責任，以及 `.client`／`.server`／`.global` 命名。

<details>
<summary>💡 答案提示</summary>

- `pages` 產生 file-based routes，`components`／`composables`／`utils` 支援自動導入，`server/api` 與 `server/routes` 是 server-only 邊界，`public` 不經 bundler 處理。
- `.client`／`.server` 限制執行環境，`.global` 表示全域 middleware；命名與巢狀目錄會影響 route、import 與 bundle。
- 應避免把 secret、資料庫 client 或 server-only module 從自動導入路徑帶進 client bundle，也要避免頁面與 API 名稱碰撞。
- 用 route map、build output、import trace、lint／ownership rule 與 server／client smoke test 驗證約定。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/Nuxt/directory_structure_conventions.md)

### Q32: Node.js、Deno 與 Bun 如何做 production runtime 選型？
<!-- Concept ID: concept.nodejs.runtime-selection.compatibility; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請以現有 Node.js service 遷移到其他 runtime 為例，列出相容性、權限、效能、供應鏈與 rollback evidence。

<details>
<summary>💡 答案提示</summary>

- 不要只比 benchmark；要檢查 Node API、native addon、package、observability、security policy、cold start、p99 與團隊維運能力。
- 先 shadow／canary，再用相同 workload、錯誤率、資源、成本與 rollback time 決定是否擴大。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Runtimes/node_vs_deno_vs_bun.md)

### Q33: Node.js LTS 升級如何避免 ABI 與依賴事故？
<!-- Concept ID: concept.nodejs.runtime-version-lts; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🟡 重要

請設計 Node.js major／LTS 升級的版本矩陣、native addon 驗證、canary 與停止線。

<details>
<summary>💡 答案提示</summary>

- 固定 runtime、package lock、OS image、V8／OpenSSL、native addon 與 build toolchain；驗證 security fix 與 support window。
- 觀察 startup、event loop lag、error、memory、p99、dependency warning 與 rollback artifact。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Runtimes/nodejs_versions_and_lts.md)

### Q34: node_modules 與 package resolution 出錯時如何取證？
<!-- Concept ID: concept.nodejs.tooling.module-resolution; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請分析 workspace、hoisting、peer dependency、exports 與 lock drift 導致的「本地正常、CI 失敗」事故。

<details>
<summary>💡 答案提示</summary>

- 比較 clean install、lockfile、Node／package manager 版本、realpath、dependency graph、package exports 與 artifact contents。
- 以 checksum、SBOM、SCA、install log、runtime require／import trace 與可重現 build gate 保護發布。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Tooling/node_modules_and_resolution.md)

### Q35: TypeScript Decorator 的 metadata 與 runtime boundary 如何治理？
<!-- Concept ID: concept.typescript.decorators-metaprogramming; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請說明 decorator order、metadata emit、inheritance、reflection 與 framework coupling，並提出測試方法。

<details>
<summary>💡 答案提示</summary>

- 區分 compile-time type 與 runtime metadata；測試 evaluation order、繼承、錯誤、cold start、reflection cost 與 generated artifact。
- 以明確 boundary、contract test、migration flag 與可觀測 startup／request latency 避免 magic behavior。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/TypeScript/decorators_metaprogramming.md)

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
| 理解 NestJS 模組與依賴注入 | ⬜ |
| 掌握 Provider／Service 分層與 scope | ⬜ |
| 能設計 NestJS Exception Filter | ⬜ |
| 能說明 TypeScript 優勢 | ⬜ |
| 了解 V8 優化原理 | ⬜ |
| 能診斷記憶體洩漏 | ⬜ |

**建議**：未能完整回答的題目，請回到對應的詳細文章深入學習。
