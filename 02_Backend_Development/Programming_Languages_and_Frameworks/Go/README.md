# Go 程式語言

Go 是一門專為高並行、高效能後端系統設計的程式語言。作為資深後端工程師，您需要深入理解 Go 的並行模型、記憶體管理、型別系統以及標準庫的使用。本章節涵蓋了面試中最常被考察的 Go 核心主題。

## 核心概念

### Concurrency（並行）

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Goroutine vs Thread](./Concurrency/goroutine_vs_thread.md) | 4 | 5 | `Goroutine`, `Concurrency` |
| [Channel 緩衝與非緩衝](./Concurrency/channel_buffered_vs_unbuffered.md) | 5 | 5 | `Channel`, `Concurrency` |
| [Select 語句與應用場景](./Concurrency/select_statement_and_use_cases.md) | 6 | 5 | `Select`, `Channel` |
| [Mutex vs RWMutex](./Concurrency/mutex_vs_rwmutex.md) | 5 | 4 | `Mutex`, `Synchronization` |
| [WaitGroup 使用方法](./Concurrency/waitgroup_usage.md) | 4 | 4 | `WaitGroup`, `Concurrency` |

### Internals（內部機制）

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [GC 與三色標記法](./Internals/go_garbage_collection.md) | 8 | 4 | `GC`, `Memory Management` |
| [Defer 執行時機](./Internals/defer_execution.md) | 6 | 4 | `Defer`, `Control Flow` |
| [Slice vs Array](./Internals/slice_vs_array.md) | 4 | 5 | `Slice`, `Array` |

### Standard Library（標準庫）

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Context 套件使用](./Standard_Library/context_package_usage.md) | 7 | 5 | `Context`, `Cancellation` |

### Tooling（工具鏈）

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [go mod 命令詳解](./Tooling/go_mod_commands.md) | 3 | 3 | `Modules`, `Dependency Management` |

## 框架

### Gin

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Gin 框架基礎與核心概念](./Frameworks/Gin/gin_framework_basics.md) | 4 | 5 | `Gin`, `Web Framework` |
| [Gin 中間件開發](./Frameworks/Gin/gin_middleware_development.md) | 6 | 5 | `Gin`, `Middleware` |
| [Gin 性能優化](./Frameworks/Gin/gin_performance_best_practices.md) | 7 | 4 | `Gin`, `Performance` |

### Echo

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Echo 框架基礎](./Frameworks/Echo/echo_framework_basics.md) | 4 | 4 | `Echo`, `Web Framework` |
| [Echo 進階特性](./Frameworks/Echo/echo_advanced_features.md) | 6 | 4 | `Echo`, `Microservices` |

---

## 學習建議

### 初級（1-3 個月）
1. **掌握基礎語法**：變數、函數、結構體、接口
2. **理解 Goroutine 和 Channel**：並行編程基礎
3. **熟悉標準庫**：fmt、io、http、encoding/json
4. **學習一個 Web 框架**：Gin 或 Echo
5. **使用 go mod**：依賴管理

### 中級（3-6 個月）
1. **深入並行模型**：Select、Mutex、WaitGroup
2. **理解 Context**：請求取消、超時控制
3. **掌握測試**：單元測試、基準測試
4. **學習中間件開發**：認證、日誌、限流
5. **數據庫操作**：GORM、sqlx

### 高級（6-12 個月）
1. **GC 原理與優化**：三色標記、逃逸分析
2. **性能調優**：pprof、trace
3. **微服務架構**：gRPC、服務發現
4. **分布式追蹤**：Jaeger、OpenTelemetry
5. **生產環境最佳實踐**：監控、日誌、部署

## 核心知識點

### 並行模型
- **Goroutine**：輕量級線程，由 Go runtime 調度
- **Channel**：Goroutine 間通訊的管道
- **Select**：多路複用 Channel 操作
- **同步原語**：Mutex、RWMutex、WaitGroup、Once

### 內存管理
- **Slice 結構**：指針、長度、容量
- **GC 機制**：三色標記、寫屏障
- **逃逸分析**：堆分配 vs 棧分配
- **內存對齊**：提高訪問效率

### Web 開發
- **Gin**：高性能，基於 httprouter
- **Echo**：內建豐富中間件
- **中間件**：認證、日誌、限流、CORS
- **RESTful API**：路由、參數綁定、錯誤處理

## 推薦資源

### 官方文檔
- [Go 官方文檔](https://golang.org/doc/)
- [Effective Go](https://golang.org/doc/effective_go)
- [Gin 文檔](https://gin-gonic.com/docs/)
- [Echo 文檔](https://echo.labstack.com/)
