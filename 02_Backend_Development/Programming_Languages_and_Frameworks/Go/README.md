# Go 程式語言

Go 是一門專為高並行、高效能後端系統設計的程式語言。作為資深後端工程師，您需要深入理解 Go 的並行模型、記憶體管理、型別系統以及標準庫的使用。本章節涵蓋了面試中最常被考察的 Go 核心主題。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [什麼是 Goroutine？它與傳統的線程 (Thread) 有什麼區別？](./Concurrency/goroutine_vs_thread.md) | 4 | 5 | `Go`, `Concurrency`, `Goroutine` |
| 2 | [談談 Go 中的 Channel，它的主要用途是什麼？以及緩衝區 Channel 和非緩衝區 Channel 的區別？](./Concurrency/channel_buffered_vs_unbuffered.md) | 5 | 5 | `Go`, `Channel`, `Concurrency` |
| 3 | [Go 語言中的 `select` 關鍵字是用來做什麼的？它有哪些常見的應用場景？](./Concurrency/select_statement_and_use_cases.md) | 6 | 5 | `Go`, `Select`, `Channel` |
| 4 | [什麼是 `sync.Mutex` 和 `sync.RWMutex`？它們之間有什麼區別和適用場景？](./Concurrency/mutex_vs_rwmutex.md) | 5 | 4 | `Go`, `Mutex`, `Synchronization` |
| 5 | [什麼是 `sync.WaitGroup`？請舉例說明其使用方法。](./Concurrency/waitgroup_usage.md) | 4 | 4 | `Go`, `WaitGroup`, `Concurrency` |
| 6 | [請解釋 Go 語言中的 `context` 套件，它的主要用途和 API 是什麼？](./Standard_Library/context_package_usage.md) | 7 | 5 | `Go`, `Context`, `Cancellation` |
| 7 | [Go 的記憶體回收 (GC) 是如何運作的？三色標記法是什麼？](./Internals/go_garbage_collection.md) | 8 | 4 | `Go`, `GC`, `Memory Management` |
| 8 | [`defer` 關鍵字的執行時機是什麼？它在與返回值互動時有什麼需要注意的地方？](./Internals/defer_execution.md) | 6 | 4 | `Go`, `Defer`, `Control Flow` |
| 9 | [Go 中的 `slice` 和 `array` 有什麼區別？`slice` 的底層結構是什麼？](./Internals/slice_vs_array.md) | 4 | 5 | `Go`, `Slice`, `Array` |
| 10 | [`go mod` 的主要指令有哪些？例如 `tidy`, `vendor` 的作用是什麼？](./Tooling/go_mod_commands.md) | 3 | 3 | `Go`, `Modules`, `Dependency Management` |

---

## 學習建議

1.  **掌握並行模型**: Goroutine、Channel、Select 是 Go 的核心特性，必須深入理解其設計哲學。
2.  **理解記憶體管理**: Slice 的底層實現、GC 的三色標記法是面試的高頻考點。
3.  **熟悉標準庫**: Context、sync、io 等標準庫的使用是編寫高品質 Go 程式的基礎。
4.  **實踐並行安全**: 了解常見的並行問題（race condition、deadlock）以及如何使用工具檢測和避免。
5.  **關注效能調優**: 使用 pprof、trace 等工具進行效能分析和優化，理解 Go runtime 的運作機制。
