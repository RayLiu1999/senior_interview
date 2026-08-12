# Concurrency（非同步與並行程式設計）

C# 提供了強大的非同步和並行程式設計能力，從底層的執行緒操作到高階的 async/await 模式。深入理解這些概念對於建構高效能、可擴展的後端應用至關重要。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [async/await 深入解析](./async_await_deep_dive.md) | 8 | 5 | `async`, `await`, `Task` |
| 2 | [Task 與 Task&lt;T&gt;](./task_and_task_t.md) | 6 | 5 | `Task`, `TPL`, `Asynchronous` |
| 4 | [並行集合](./concurrent_collections.md) | 7 | 4 | `ConcurrentDictionary`, `BlockingCollection` |
| 5 | [lock 與 Monitor](./lock_and_monitor.md) | 6 | 5 | `lock`, `Monitor`, `Critical Section` |

---

## 學習建議

1. **async/await 優先**：這是現代 C# 非同步程式設計的基礎，必須完全掌握
2. **理解 Task**：Task 是 async/await 的底層實作，理解它有助於解決進階問題
3. **避免常見陷阱**：死鎖、同步上下文、過度並行都是常見問題
4. **善用高階抽象**：優先使用 Channel、Parallel 等高階 API，而非底層執行緒操作
