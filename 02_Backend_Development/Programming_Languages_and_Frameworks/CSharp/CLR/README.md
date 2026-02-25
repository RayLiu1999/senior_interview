# CLR（公共語言執行時期）

CLR（Common Language Runtime）是 .NET 的核心執行引擎，負責管理記憶體、型別安全、異常處理和程式碼執行。深入理解 CLR 的運作機制，對於撰寫高效能 C# 應用程式和進行效能調優至關重要。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [垃圾回收機制](./garbage_collection.md) | 8 | 5 | `GC`, `Memory Management`, `Generations` |
| 2 | [記憶體管理與分配](./memory_management.md) | 7 | 5 | `Heap`, `Stack`, `LOH` |
| 3 | [JIT 編譯與 AOT](./jit_and_aot.md) | 7 | 4 | `JIT`, `AOT`, `Compilation` |
| 4 | [組件與應用程式網域](./assemblies_and_appdomains.md) | 6 | 3 | `Assembly`, `AppDomain` |
| 5 | [型別系統與 CTS](./type_system_cts.md) | 6 | 4 | `CTS`, `Type System` |
| 6 | [IDisposable 與資源管理](./idisposable_pattern.md) | 6 | 5 | `IDisposable`, `using`, `Finalize` |
| 7 | [弱引用](./weak_references.md) | 6 | 3 | `WeakReference`, `Memory` |
| 8 | [Span&lt;T&gt; 與 Memory&lt;T&gt;](./span_and_memory.md) | 8 | 4 | `Span`, `Memory`, `Performance` |
| 9 | [裝箱與拆箱](./boxing_unboxing.md) | 5 | 4 | `Boxing`, `Unboxing`, `Performance` |
| 10 | [效能調優](./performance_tuning.md) | 9 | 4 | `Performance`, `Profiling`, `Optimization` |

---

## 學習建議

1. **GC 優先**：垃圾回收是 CLR 最核心的功能，必須深入理解
2. **理解記憶體分配**：了解堆和棧的差異，以及 LOH 的特殊性
3. **掌握 IDisposable**：正確管理非受控資源是避免記憶體洩漏的關鍵
4. **效能調優進階**：學習使用 Span&lt;T&gt; 和 ArrayPool 等高效能 API
