# Node.js 核心概念

Node.js 的核心特性和內部機制，包括事件循環、非同步編程、模組系統等。

## 題目列表

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [事件循環機制](./event_loop_explained.md) | 8 | 5 | `Event Loop`, `Async` |
| [Stream 流式處理](./streams_in_nodejs.md) | 7 | 5 | `Stream`, `I/O` |
| [Buffer 與二進制數據](./buffer_and_binary_data.md) | 6 | 4 | `Buffer`, `Binary` |
| [模組系統 CommonJS vs ESM](./module_systems.md) | 6 | 5 | `Modules`, `Import/Export` |
| [錯誤處理最佳實踐](./error_handling_best_practices.md) | 7 | 5 | `Error Handling`, `Best Practices` |
| [記憶體管理與洩漏](./memory_management_and_leaks.md) | 8 | 4 | `Memory`, `Garbage Collection` |
| [Child Process 子進程](./child_process_usage.md) | 7 | 4 | `Child Process`, `Concurrency` |
| [Cluster 叢集模式](./cluster_mode.md) | 7 | 5 | `Cluster`, `Scaling` |

## 核心概念

### 事件循環
- **Phase（階段）**：timers、pending callbacks、poll、check、close
- **Microtask Queue**：Promise、process.nextTick
- **Macrotask Queue**：setTimeout、setInterval、setImmediate
- **執行順序**：理解不同任務的優先級

### 非同步編程
- **Callback**：傳統回調模式
- **Promise**：鏈式調用、錯誤處理
- **Async/Await**：同步寫法的非同步代碼
- **Event Emitter**：事件驅動模式

### Stream
- **Readable**：可讀流
- **Writable**：可寫流
- **Duplex**：雙工流
- **Transform**：轉換流
- **背壓（Backpressure）**：流量控制

### 模組系統
- **CommonJS**：require/module.exports
- **ESM**：import/export
- **差異**：加載時機、this 綁定
- **互操作性**：如何在兩者間切換

## 性能優化

### 記憶體優化
- 避免記憶體洩漏
- 使用 Stream 處理大文件
- 合理使用 Buffer
- 定期監控記憶體使用

### 並發處理
- 使用 Cluster 模式充分利用多核心
- 使用 Worker Threads 處理 CPU 密集任務
- 合理使用子進程
- 避免阻塞事件循環

### I/O 優化
- 使用 Stream 而不是一次性讀取
- 批量處理數據庫操作
- 使用連接池
- 適當使用快取

## 最佳實踐

### 錯誤處理
- 使用 try-catch 捕獲同步錯誤
- Promise 使用 .catch() 或 try-catch
- 監聽 uncaughtException 和 unhandledRejection
- 優雅地關閉應用程式

### 代碼組織
- 使用 ESM 模組系統（Node.js 14+）
- 模組化設計，單一職責
- 使用依賴注入
- 分離業務邏輯和框架代碼

### 監控與除錯
- 使用 process.memoryUsage() 監控記憶體
- 使用 --inspect 進行除錯
- 使用 clinic.js 進行性能分析
- 記錄詳細的錯誤信息
