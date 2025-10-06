# Go 並發編程

Go 的並發模型是其最強大的特性之一。本節涵蓋 Goroutine、Channel、同步原語等核心概念。

## 題目列表

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Goroutine vs Thread](./goroutine_vs_thread.md) | 4 | 5 | `Goroutine`, `Concurrency` |
| [Channel 緩衝與非緩衝](./channel_buffered_vs_unbuffered.md) | 5 | 5 | `Channel`, `Communication` |
| [Select 語句與應用場景](./select_statement_and_use_cases.md) | 6 | 5 | `Select`, `Multiplexing` |
| [Mutex vs RWMutex](./mutex_vs_rwmutex.md) | 5 | 4 | `Mutex`, `Synchronization` |
| [WaitGroup 使用方法](./waitgroup_usage.md) | 4 | 4 | `WaitGroup`, `Synchronization` |

## 核心概念

### Goroutine
- **輕量級線程**：由 Go runtime 調度
- **低記憶體開銷**：初始棧只有 2KB
- **M:N 調度模型**：多個 Goroutine 映射到少數 OS 線程

### Channel
- **通訊機制**：Goroutine 間的安全通訊
- **同步原語**：可用於同步和數據傳遞
- **緩衝與非緩衝**：不同的阻塞行為

### 同步原語
- **Mutex**：互斥鎖，保護共享資源
- **RWMutex**：讀寫鎖，允許多個讀者
- **WaitGroup**：等待多個 Goroutine 完成
- **Once**：確保函數只執行一次
- **Cond**：條件變量，等待和通知

## 最佳實踐

### Channel 使用
- 優先使用 Channel 進行通訊
- 關閉 Channel 時要小心，避免重複關閉
- 使用 `for range` 遍歷 Channel
- 正確處理 Channel 的阻塞行為

### Goroutine 管理
- 避免 Goroutine 洩漏
- 使用 Context 控制生命週期
- 合理控制 Goroutine 數量
- 使用 WaitGroup 等待完成

### 性能優化
- 選擇合適的同步原語
- 減少鎖的粒度
- 使用 sync.Pool 復用對象
- 避免過度並發
