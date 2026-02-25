# C# 程式語言

C# 是微軟開發的現代化、型別安全的物件導向程式語言，廣泛應用於企業級應用開發、遊戲開發（Unity）、雲端服務及跨平台應用。作為資深後端工程師，您需要深入理解 C# 的核心特性、非同步程式設計、CLR 原理以及 .NET 生態系統。本章節涵蓋了面試中最常被考察的 C# 核心主題。

## 核心概念

### Core（核心特性）

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [值型別與參考型別](./Core/value_vs_reference_types.md) | 5 | 5 | `Value Type`, `Reference Type`, `Stack`, `Heap` |
| [泛型機制詳解](./Core/generics_explained.md) | 6 | 5 | `Generics`, `Type Safety`, `Constraints` |
| [LINQ 深入解析](./Core/linq_deep_dive.md) | 7 | 5 | `LINQ`, `IEnumerable`, `Expression Tree` |
| [委派與事件](./Core/delegates_and_events.md) | 6 | 5 | `Delegate`, `Event`, `Callback` |
| [Lambda 與閉包](./Core/lambda_and_closures.md) | 5 | 4 | `Lambda`, `Closure`, `Func`, `Action` |
| [介面與抽象類別](./Core/interface_vs_abstract.md) | 4 | 4 | `Interface`, `Abstract Class`, `Polymorphism` |
| [擴充方法](./Core/extension_methods.md) | 4 | 4 | `Extension Method`, `Static` |
| [Nullable 型別](./Core/nullable_types.md) | 5 | 4 | `Nullable`, `Null Safety` |
| [反射與特性](./Core/reflection_and_attributes.md) | 7 | 4 | `Reflection`, `Attribute`, `Metadata` |
| [例外處理最佳實踐](./Core/exception_handling.md) | 4 | 4 | `Exception`, `Error Handling` |
| [字串處理與不可變性](./Core/string_immutability.md) | 4 | 3 | `String`, `StringBuilder`, `Immutability` |
| [集合框架深入解析](./Core/collections_framework.md) | 6 | 5 | `Collections`, `List`, `Dictionary` |
| [結構與類別的選擇](./Core/struct_vs_class.md) | 5 | 4 | `Struct`, `Class`, `Memory` |
| [屬性與索引子](./Core/properties_and_indexers.md) | 3 | 3 | `Property`, `Indexer` |
| [運算子多載](./Core/operator_overloading.md) | 5 | 2 | `Operator`, `Overloading` |

完整列表請參考 [Core README](./Core/README.md)

### Concurrency（非同步與並行程式設計）

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [async/await 深入解析](./Concurrency/async_await_deep_dive.md) | 8 | 5 | `async`, `await`, `Task` |
| [Task 與 Task<T>](./Concurrency/task_and_task_t.md) | 6 | 5 | `Task`, `TPL`, `Asynchronous` |
| [執行緒與執行緒池](./Concurrency/thread_and_threadpool.md) | 7 | 4 | `Thread`, `ThreadPool`, `Worker` |
| [並行集合](./Concurrency/concurrent_collections.md) | 7 | 4 | `ConcurrentDictionary`, `BlockingCollection` |
| [lock 與 Monitor](./Concurrency/lock_and_monitor.md) | 6 | 5 | `lock`, `Monitor`, `Critical Section` |
| [SemaphoreSlim 與信號量](./Concurrency/semaphore_slim.md) | 6 | 3 | `Semaphore`, `Resource Limiting` |
| [死鎖問題與避免](./Concurrency/deadlock.md) | 7 | 4 | `Deadlock`, `Livelock` |
| [Parallel 類別使用](./Concurrency/parallel_class.md) | 5 | 3 | `Parallel`, `PLINQ`, `Data Parallelism` |
| [CancellationToken](./Concurrency/cancellation_token.md) | 5 | 4 | `Cancellation`, `Cooperative Cancellation` |
| [ConfigureAwait 詳解](./Concurrency/configure_await.md) | 7 | 4 | `ConfigureAwait`, `SynchronizationContext` |
| [Channel 與生產者消費者](./Concurrency/channels.md) | 6 | 3 | `Channel`, `Producer Consumer` |
| [Interlocked 原子操作](./Concurrency/interlocked_operations.md) | 6 | 3 | `Interlocked`, `Atomic`, `CAS` |

完整列表請參考 [Concurrency README](./Concurrency/README.md)

### CLR（公共語言執行時期）

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [垃圾回收機制](./CLR/garbage_collection.md) | 8 | 5 | `GC`, `Memory Management`, `Generations` |
| [記憶體管理與分配](./CLR/memory_management.md) | 7 | 5 | `Heap`, `Stack`, `LOH` |
| [JIT 編譯與 AOT](./CLR/jit_and_aot.md) | 7 | 4 | `JIT`, `AOT`, `Compilation` |
| [組件與應用程式網域](./CLR/assemblies_and_appdomains.md) | 6 | 3 | `Assembly`, `AppDomain` |
| [型別系統與 CTS](./CLR/type_system_cts.md) | 6 | 4 | `CTS`, `Type System` |
| [IDisposable 與資源管理](./CLR/idisposable_pattern.md) | 6 | 5 | `IDisposable`, `using`, `Finalize` |
| [弱引用](./CLR/weak_references.md) | 6 | 3 | `WeakReference`, `Memory` |
| [Span<T> 與 Memory<T>](./CLR/span_and_memory.md) | 8 | 4 | `Span`, `Memory`, `Performance` |
| [裝箱與拆箱](./CLR/boxing_unboxing.md) | 5 | 4 | `Boxing`, `Unboxing`, `Performance` |
| [效能調優](./CLR/performance_tuning.md) | 9 | 4 | `Performance`, `Profiling`, `Optimization` |

完整列表請參考 [CLR README](./CLR/README.md)

## 框架

### ASP.NET Core

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [依賴注入容器](./Frameworks/ASP.NET_Core/dependency_injection.md) | 7 | 5 | `DI`, `IoC`, `Container` |
| [中介軟體管線](./Frameworks/ASP.NET_Core/middleware_pipeline.md) | 7 | 5 | `Middleware`, `Pipeline`, `Request` |
| [路由機制](./Frameworks/ASP.NET_Core/routing.md) | 5 | 4 | `Routing`, `Endpoint`, `Attribute Routing` |
| [篩選器 (Filters)](./Frameworks/ASP.NET_Core/filters.md) | 6 | 4 | `Filter`, `ActionFilter`, `ExceptionFilter` |
| [配置管理](./Frameworks/ASP.NET_Core/configuration.md) | 5 | 4 | `Configuration`, `Options Pattern` |
| [健康檢查](./Frameworks/ASP.NET_Core/health_checks.md) | 4 | 3 | `Health Check`, `Monitoring` |
| [身份驗證與授權](./Frameworks/ASP.NET_Core/authentication_authorization.md) | 7 | 5 | `Authentication`, `Authorization`, `JWT` |
| [Minimal API](./Frameworks/ASP.NET_Core/minimal_api.md) | 5 | 4 | `Minimal API`, `Endpoint` |

完整列表請參考 [ASP.NET Core README](./Frameworks/ASP.NET_Core/README.md)

### Entity Framework Core

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [DbContext 生命週期](./Frameworks/EF_Core/dbcontext_lifecycle.md) | 6 | 5 | `DbContext`, `Lifetime`, `DI` |
| [變更追蹤機制](./Frameworks/EF_Core/change_tracking.md) | 7 | 4 | `Change Tracking`, `Entity State` |
| [延遲載入與積極載入](./Frameworks/EF_Core/loading_strategies.md) | 6 | 4 | `Lazy Loading`, `Eager Loading`, `Explicit Loading` |
| [查詢效能優化](./Frameworks/EF_Core/query_optimization.md) | 8 | 5 | `Performance`, `Query`, `Index` |
| [遷移策略](./Frameworks/EF_Core/migrations.md) | 5 | 4 | `Migration`, `Database First`, `Code First` |

完整列表請參考 [Entity Framework Core README](./Frameworks/EF_Core/README.md)

### Tooling（工具鏈）

完整列表請參考 [Tooling README](./Tooling/README.md)

**核心主題**：
- NuGet 套件管理
- dotnet CLI 使用
- MSBuild 與專案結構
- 程式碼分析工具

### Testing（測試）

完整列表請參考 [Testing README](./Testing/README.md)

**核心主題**：
- xUnit 與 NUnit
- Moq 模擬框架
- 整合測試策略
- BenchmarkDotNet

---

## 學習建議

### 學習路徑

#### 初級階段（1-3 個月）
1. **C# 基礎**：語法、OOP、集合框架、例外處理
2. **常用類別庫**：String、DateTime、檔案 IO
3. **集合深入**：List、Dictionary 使用與原理
4. **基礎非同步**：async/await 基本用法

#### 中級階段（3-6 個月）
1. **非同步進階**：Task、ConfigureAwait、CancellationToken
2. **CLR 基礎**：記憶體模型、GC 機制
3. **ASP.NET Core 基礎**：DI、中介軟體、路由
4. **Entity Framework Core**：基本 CRUD、查詢
5. **LINQ**：查詢語法、Expression Tree

#### 高級階段（6-12 個月）
1. **效能調優**：Span<T>、記憶體分析、BenchmarkDotNet
2. **並行程式設計**：並行集合、Parallel、Channel
3. **ASP.NET Core 進階**：原始碼分析、自訂中介軟體
4. **分散式**：微服務、gRPC、訊息佇列
5. **最佳實踐**：設計模式、SOLID 原則

### 框架選擇指南

| 需求 | 推薦框架 | 理由 |
|------|----------|------|
| Web API 開發 | ASP.NET Core Web API | 高效能、跨平台 |
| MVC Web 應用 | ASP.NET Core MVC | 成熟穩定、文檔豐富 |
| 微服務架構 | ASP.NET Core + Dapr | 雲原生、可擴展 |
| 即時通訊 | SignalR | 內建支援、易於整合 |
| 資料存取 | Entity Framework Core | 生產力高、功能完整 |
| 高效能資料存取 | Dapper | 輕量、接近 ADO.NET 效能 |
| gRPC 服務 | ASP.NET Core gRPC | 原生支援、高效能 |

### 核心知識點

#### 語言特性
- ✅ **OOP 原則**：封裝、繼承、多型、抽象
- ✅ **泛型與約束**：泛型類別、泛型方法、約束條件
- ✅ **LINQ**：查詢語法、方法語法、延遲執行
- ✅ **非同步程式設計**：async/await、Task、ValueTask
- ✅ **委派與事件**：委派類型、事件處理、多播委派

#### CLR 深入
- ✅ **記憶體模型**：堆、棧、大型物件堆
- ✅ **垃圾回收**：分代 GC、GC 模式、終結器
- ✅ **JIT 編譯**：即時編譯、Tiered Compilation
- ✅ **效能調優**：Span<T>、ArrayPool、記憶體診斷

#### .NET 生態
- ✅ **ASP.NET Core**：DI、中介軟體、篩選器
- ✅ **Entity Framework Core**：DbContext、變更追蹤
- ✅ **認證授權**：Identity、JWT、OAuth
- ✅ **API 開發**：RESTful、Minimal API、OpenAPI

## C# 與 .NET 版本建議

- **最低版本**：.NET 6（LTS，現代 C# 特性）
- **推薦版本**：.NET 8（LTS，最新穩定版）
- **企業生產**：.NET 6/8（長期支援、穩定性好）
- **新專案**：.NET 8+（最新特性、最佳效能）

## 推薦資源

### 官方文檔
- [Microsoft C# 文檔](https://learn.microsoft.com/zh-tw/dotnet/csharp/)
- [.NET 文檔](https://learn.microsoft.com/zh-tw/dotnet/)
- [ASP.NET Core 文檔](https://learn.microsoft.com/zh-tw/aspnet/core/)

### 經典書籍
- **《C# in Depth》** - Jon Skeet
- **《CLR via C#》** - Jeffrey Richter
- **《Effective C#》** - Bill Wagner
- **《Concurrency in C# Cookbook》** - Stephen Cleary
- **《Pro ASP.NET Core》** - Adam Freeman

### 進階資源
- [.NET Blog](https://devblogs.microsoft.com/dotnet/)
- [Stephen Cleary's Blog](https://blog.stephencleary.com/)
- [.NET Performance](https://github.com/dotnet/performance)
- [Awesome .NET](https://github.com/quozd/awesome-dotnet)
