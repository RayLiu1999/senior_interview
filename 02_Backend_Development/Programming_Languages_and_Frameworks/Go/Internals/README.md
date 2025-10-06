# Go 內部機制

深入理解 Go 的內部實現，包括記憶體管理、垃圾回收、調度器等核心機制。

## 題目列表

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [GC 與三色標記法](./go_garbage_collection.md) | 8 | 4 | `GC`, `Memory Management` |
| [Defer 執行時機](./defer_execution.md) | 6 | 4 | `Defer`, `Control Flow` |
| [Slice vs Array](./slice_vs_array.md) | 4 | 5 | `Slice`, `Array`, `Data Structure` |

## 核心概念

### 記憶體管理
- **堆與棧**：記憶體分配策略
- **逃逸分析**：決定變數分配位置
- **TCMalloc**：Go 的記憶體分配器
- **記憶體對齊**：提高訪問效率

### 垃圾回收
- **三色標記法**：白色、灰色、黑色
- **寫屏障**：保證並發標記的正確性
- **混合寫屏障**：減少 STW 時間
- **GC 調優**：GOGC 環境變量

### 調度器
- **GMP 模型**：Goroutine、Machine、Processor
- **搶占式調度**：防止 Goroutine 長時間占用
- **Work Stealing**：負載均衡機制
- **系統調用處理**：M 的分離與重新關聯

### 數據結構
- **Slice 結構**：指針、長度、容量
- **Map 實現**：哈希表、桶、overflow
- **Interface**：itab、數據指針
- **String**：不可變字節序列

## 性能優化

### 記憶體優化
- 減少逃逸到堆的分配
- 使用 sync.Pool 復用對象
- 預分配 Slice 和 Map 容量
- 注意 Slice 的容量增長

### GC 優化
- 減少堆分配
- 降低對象存活時間
- 批量處理減少分配頻率
- 調整 GOGC 參數

### 工具使用
- **pprof**：性能分析工具
- **trace**：追蹤 Goroutine 執行
- **escape analysis**：查看逃逸分析結果
- **benchstat**：比較基準測試結果
