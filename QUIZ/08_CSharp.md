# C# - 重點考題 (Quiz)

> 這份考題是從 C# 程式語言章節中挑選出**重要程度 4-5** 的核心題目，設計成自我測驗的形式。
> 
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

## 🎯 核心特性 (Core)

### Q1: 值型別 (Value Type) 和參考型別 (Reference Type) 有什麼區別？

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請解釋這兩種型別在記憶體配置、複製行為和效能上的差異。

<details>
<summary>💡 答案提示</summary>

**核心差異**：

| 特性 | 值型別 | 參考型別 |
|------|--------|----------|
| **記憶體位置** | 通常在棧上（或內嵌） | 堆上 |
| **賦值行為** | 複製整個值 | 複製參考（指標） |
| **預設值** | 0 或等效值 | null |
| **範例** | int, struct, enum | class, string, array |

**值型別**：
- 包括 `int`, `float`, `bool`, `struct`, `enum`
- 賦值時複製整個值
- 修改副本不影響原值

**參考型別**：
- 包括 `class`, `string`, `array`, `delegate`
- 賦值時只複製參考
- 多個變數可指向同一物件

**裝箱 (Boxing)**：值型別轉換為 object 時會在堆上分配記憶體，有效能開銷。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Core/value_vs_reference_types.md)

---

### Q2: 請解釋 LINQ 的延遲執行 (Deferred Execution) 特性

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

LINQ 查詢何時執行？什麼是延遲執行？哪些操作會觸發立即執行？

<details>
<summary>💡 答案提示</summary>

**延遲執行**：LINQ 查詢不會在定義時執行，而是在實際枚舉時才執行。

```csharp
var query = users.Where(u => u.Age > 18); // 此時只建立查詢，不執行
foreach (var user in query) // 此時才真正執行查詢
{
    Console.WriteLine(user.Name);
}
```

**立即執行的方法**：
- `ToList()`, `ToArray()`, `ToDictionary()`
- `Count()`, `First()`, `Single()`, `Any()`
- `Max()`, `Min()`, `Sum()`, `Average()`

**IEnumerable vs IQueryable**：

| 特性 | IEnumerable&lt;T&gt; | IQueryable&lt;T&gt; |
|------|------------------|------------------|
| **執行位置** | 記憶體中 | 資料來源（如資料庫） |
| **適用場景** | LINQ to Objects | LINQ to SQL/EF |

**注意**：避免在迴圈中多次枚舉同一個 IEnumerable，可能導致多次查詢。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Core/linq_deep_dive.md)

---

### Q3: 委派 (Delegate) 和事件 (Event) 有什麼區別？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋委派的本質、多播委派，以及事件對委派的封裝。

<details>
<summary>💡 答案提示</summary>

**委派**：型別安全的函式指標，可以持有對一個或多個方法的參考。

**內建泛型委派**：
- `Action<T>`：無返回值
- `Func<T, TResult>`：有返回值
- `Predicate<T>`：返回 bool

**多播委派**：可以持有多個方法參考，依序呼叫。

**事件 vs 委派欄位**：

| 特性 | 委派欄位 | 事件 |
|------|----------|------|
| **外部存取** | 可直接呼叫、賦值 | 只能 += 或 -= |
| **封裝性** | 低 | 高 |
| **用途** | 回呼 | 發布-訂閱模式 |

**記憶體洩漏警示**：事件訂閱者的參考被發布者持有，可能導致訂閱者無法被 GC 回收。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Core/delegates_and_events.md)

---

### Q4: C# 泛型和 Java 泛型有什麼區別？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請解釋 C# 泛型的實作方式、約束條件，以及與 Java 型別擦除的差異。

<details>
<summary>💡 答案提示</summary>

**C# 泛型 vs Java 泛型**：

| 特性 | C# | Java |
|------|-----|------|
| **實作方式** | 具體化 (Reification) | 型別擦除 (Type Erasure) |
| **執行時期型別** | 保留 | 擦除為 Object |
| **值型別支援** | 完整支援 | 需要裝箱 |
| **效能** | 較好 | 有裝箱開銷 |

**C# 泛型特性**：
- 每個值型別的泛型產生獨立程式碼
- 執行時期可用反射取得型別參數

**常用約束**：

| 約束 | 說明 |
|------|------|
| `where T : struct` | T 必須是值型別 |
| `where T : class` | T 必須是參考型別 |
| `where T : new()` | T 必須有無參數建構函式 |
| `where T : IInterface` | T 必須實作介面 |

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Core/generics_explained.md)

---

### Q5: Dictionary 的內部實作原理是什麼？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請解釋 Dictionary 如何實現 O(1) 查詢，以及 GetHashCode 和 Equals 的重要性。

<details>
<summary>💡 答案提示</summary>

**Dictionary 原理**：基於雜湊表實作

**查詢流程**：
1. 計算 Key 的雜湊碼 (`GetHashCode()`)
2. 通過雜湊碼定位到儲存槽 (bucket)
3. 如有碰撞，使用鏈結處理
4. 用 `Equals()` 確認是否為目標 Key

**操作複雜度**：

| 操作 | 平均 | 最壞 |
|------|------|------|
| 新增/查詢/刪除 | O(1) | O(n) |

**自訂類別作為 Key 時**：
- 必須正確覆寫 `GetHashCode()` 和 `Equals()`
- 規則：如果 `a.Equals(b)` 為 true，則 `a.GetHashCode() == b.GetHashCode()` 必須為 true
- 不要使用可變物件作為 Key

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Core/collections_framework.md)

---

## ⚡ 非同步與並行 (Concurrency)

### Q6: async/await 的工作原理是什麼？

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請解釋 async/await 的狀態機轉換、同步上下文，以及常見陷阱。

<details>
<summary>💡 答案提示</summary>

**本質**：async/await 是編譯器的語法糖，會將方法轉換為**狀態機**。

**執行流程**：
1. 方法開始，建立狀態機
2. 遇到 await 且 Task 未完成時，註冊延續，方法返回
3. Task 完成後，狀態機恢復執行

**返回型別選擇**：

| 返回型別 | 使用時機 |
|----------|----------|
| `Task` | 無返回值 |
| `Task<T>` | 有返回值 |
| `ValueTask<T>` | 經常同步完成的熱路徑 |
| `void` | 僅用於事件處理器 |

**常見陷阱**：
- **async void**：異常無法被捕獲，會導致程式崩潰
- **同步阻塞非同步**：`task.Result` 或 `.Wait()` 可能造成死鎖
- **忘記 await**：Task 未被等待，異常可能遺失

**ConfigureAwait(false)**：程式庫程式碼應使用，避免不必要地回到原始同步上下文。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Concurrency/async_await_deep_dive.md)

---

### Q7: Task 和 Thread 有什麼區別？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請比較 Task 和 Thread 的特性，說明何時應該使用哪一個。

<details>
<summary>💡 答案提示</summary>

**核心區別**：

| 特性 | Task | Thread |
|------|------|--------|
| **抽象層級** | 高 | 低 |
| **執行緒管理** | 執行緒池管理 | 手動管理 |
| **返回值** | 原生支援 | 需要額外處理 |
| **組合操作** | 豐富（WhenAll 等） | 需手動實作 |
| **效能** | 較好（重用執行緒） | 建立成本高 |

**建立 Task 的方式**：
- `Task.Run()`：CPU 密集型工作
- `async/await`：I/O 密集型工作
- `Task.FromResult()`：已完成的 Task
- `TaskCompletionSource`：手動控制

**Task 組合**：
- `Task.WhenAll()`：等待所有完成
- `Task.WhenAny()`：等待任一完成

**選擇指南**：大多數情況使用 Task，只有需要專用執行緒時才用 Thread。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Concurrency/task_and_task_t.md)

---

### Q8: lock 關鍵字的工作原理是什麼？在 async 方法中能使用嗎？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋 lock 的本質、最佳實踐，以及在非同步程式碼中的限制。

<details>
<summary>💡 答案提示</summary>

**lock 的本質**：語法糖，編譯器轉換為 `Monitor.Enter` 和 `Monitor.Exit`。

**正確用法**：
```csharp
private readonly object _lock = new object();

lock (_lock)
{
    // 臨界區
}
```

**錯誤用法**：
- 不要鎖定 `this`：外部可能也鎖定此物件
- 不要鎖定 `typeof(T)`：全域影響
- 不要鎖定字串：字串常數池共享

**在 async 方法中的限制**：
```csharp
// ❌ 錯誤：lock 內不能使用 await
lock (_lock)
{
    await SomeAsyncMethod(); // 編譯錯誤
}

// ✅ 正確：使用 SemaphoreSlim
private readonly SemaphoreSlim _semaphore = new(1, 1);

await _semaphore.WaitAsync();
try
{
    await SomeAsyncMethod();
}
finally
{
    _semaphore.Release();
}
```

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Concurrency/lock_and_monitor.md)

---

### Q9: ConcurrentDictionary 和普通 Dictionary + lock 有什麼區別？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請解釋 ConcurrentDictionary 的內部實作和適用場景。

<details>
<summary>💡 答案提示</summary>

**ConcurrentDictionary 特點**：
- 使用分段鎖（striped locking），減少競爭
- 提供原子性的複合操作

**原子操作**：
- `GetOrAdd()`：取得或新增
- `AddOrUpdate()`：新增或更新
- `TryRemove()`：嘗試移除

**注意事項**：
```csharp
// 工廠方法可能被多次呼叫（但只有一個結果被存入）
var value = dict.GetOrAdd("key", key => ExpensiveOperation(key));

// 解決：使用 Lazy<T>
var cache = new ConcurrentDictionary<string, Lazy<T>>();
var lazy = cache.GetOrAdd("key", _ => new Lazy<T>(() => Create()));
var value = lazy.Value;
```

**何時使用 ConcurrentDictionary**：
- 多執行緒頻繁讀寫
- 需要原子性複合操作
- 高並發場景

**何時使用 lock + Dictionary**：
- 需要在一個鎖內執行多個操作
- 並發程度不高

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Concurrency/concurrent_collections.md)

---

## 🔧 CLR 與記憶體管理

### Q10: .NET 垃圾回收機制是如何工作的？

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請解釋分代式 GC、GC 根、大型物件堆，以及如何減少 GC 壓力。

<details>
<summary>💡 答案提示</summary>

**分代式垃圾回收**：

| 世代 | 說明 | 觸發頻率 |
|------|------|----------|
| **Gen 0** | 新物件 | 最頻繁 |
| **Gen 1** | 從 Gen 0 存活 | 中等 |
| **Gen 2** | 長期存活 | 最少 |

**分代假設**：新物件最可能成為垃圾。

**大型物件堆 (LOH)**：
- 大於 85,000 位元組的物件
- 視為 Gen 2
- 預設不壓縮

**GC 根**：棧上變數、靜態變數、GC 句柄

**減少 GC 壓力**：
1. 使用 `ArrayPool<T>.Shared` 重用陣列
2. 適當使用 struct
3. 使用 `Span<T>` 避免分配
4. 預分配集合容量

**GC 模式**：
- Workstation GC：低延遲
- Server GC：高吞吐量

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/CLR/garbage_collection.md)

---

### Q11: IDisposable 模式如何正確實作？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋 IDisposable 的用途、標準實作模式，以及終結器的角色。

<details>
<summary>💡 答案提示</summary>

**IDisposable 用途**：釋放非受控資源（檔案句柄、資料庫連線等）。

**標準模式**：
```csharp
public class Resource : IDisposable
{
    private bool _disposed = false;
    
    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }
    
    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing)
            {
                // 釋放受控資源
            }
            // 釋放非受控資源
            _disposed = true;
        }
    }
    
    ~Resource() => Dispose(false);
}
```

**using 語句**：確保 Dispose 一定會被呼叫
```csharp
using var stream = new FileStream("file.txt", FileMode.Open);
// 離開作用域時自動 Dispose
```

**IAsyncDisposable**：.NET Core 3.0+ 支援非同步釋放
```csharp
await using var resource = new AsyncResource();
```

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/CLR/idisposable_pattern.md)

---

### Q12: Span&lt;T&gt; 和 Memory&lt;T&gt; 有什麼區別？

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🟡 重要

請解釋這兩個型別的用途、限制，以及如何用於效能優化。

<details>
<summary>💡 答案提示</summary>

**核心區別**：

| 特性 | Span&lt;T&gt; | Memory&lt;T&gt; |
|------|----------|-------------|
| **儲存位置** | 只能在棧上 | 可在堆上 |
| **類型** | ref struct | struct |
| **用於欄位** | ❌ | ✅ |
| **用於 async** | ❌ | ✅ |
| **效能** | 最佳 | 稍慢 |

**Span&lt;T&gt; 的限制**（因為是 ref struct）：
- 不能作為類別的欄位
- 不能被裝箱
- 不能用於 await 之後

**優勢**：
- 切片操作 O(1)，不複製資料
- 統一操作陣列、棧記憶體、原生記憶體
- 字串處理零分配

**使用場景**：
```csharp
// 零分配字串處理
ReadOnlySpan<char> span = "Hello World".AsSpan();
ReadOnlySpan<char> hello = span.Slice(0, 5); // 無分配
```

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/CLR/span_and_memory.md)

---

## 🌐 ASP.NET Core

### Q13: ASP.NET Core 的依賴注入生命週期有哪些？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請解釋 Transient、Scoped、Singleton 的區別，以及生命週期選擇的陷阱。

<details>
<summary>💡 答案提示</summary>

**三種生命週期**：

| 生命週期 | 說明 | 適用場景 |
|----------|------|----------|
| **Transient** | 每次請求都建立新實例 | 輕量、無狀態服務 |
| **Scoped** | 每個 HTTP 請求一個實例 | DbContext、工作單元 |
| **Singleton** | 應用程式只有一個實例 | 快取、配置 |

**常見陷阱**：

**不要在 Singleton 中注入 Scoped 服務**：
```csharp
// ❌ 危險
public class SingletonService
{
    private readonly IScopedService _scoped; // 問題！
}

// ✅ 正確：使用 IServiceScopeFactory
public class SingletonService
{
    private readonly IServiceScopeFactory _scopeFactory;
    
    public void DoWork()
    {
        using var scope = _scopeFactory.CreateScope();
        var scoped = scope.ServiceProvider.GetRequiredService<IScopedService>();
    }
}
```

**驗證配置**：
```csharp
builder.Host.UseDefaultServiceProvider(options =>
{
    options.ValidateScopes = true;
    options.ValidateOnBuild = true;
});
```

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Frameworks/ASP.NET_Core/dependency_injection.md)

---

### Q14: ASP.NET Core 中介軟體管線是如何運作的？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請解釋中介軟體的執行順序、「洋蔥模型」，以及如何自訂中介軟體。

<details>
<summary>💡 答案提示</summary>

**洋蔥模型**：
```
Request → [A] → [B] → [C] → Handler
                              ↓
Response ← [A] ← [B] ← [C] ← Result
```

**中介軟體順序很重要**：
```csharp
app.UseExceptionHandler("/error");  // 1. 最外層
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();             // 先認證
app.UseAuthorization();              // 再授權
app.MapControllers();
```

**自訂中介軟體**：
```csharp
public class TimingMiddleware
{
    private readonly RequestDelegate _next;
    
    public TimingMiddleware(RequestDelegate next) => _next = next;
    
    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        await _next(context);  // 呼叫下一個
        sw.Stop();
        // 記錄耗時
    }
}
```

**短路管線**：不呼叫 `next()`，直接返回響應。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Frameworks/ASP.NET_Core/middleware_pipeline.md)

---

### Q15: Entity Framework Core 的 DbContext 生命週期應該如何管理？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋 DbContext 應該使用什麼生命週期，以及在背景服務中如何使用。

<details>
<summary>💡 答案提示</summary>

**DbContext 應該是 Scoped**（預設）：
- 每個 HTTP 請求一個實例
- 請求結束時自動 Dispose
- 同一請求中共享工作單元

**為什麼不用 Singleton？**
- DbContext 不是執行緒安全的
- 變更追蹤會無限累積
- 快取資料會變得陳舊

**背景服務中使用**：
```csharp
public class BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        // 使用 context
    }
}
```

**或使用 DbContextFactory**：
```csharp
await using var context = await _factory.CreateDbContextAsync();
```

**DbContext 池化**：高流量應用可使用 `AddDbContextPool` 提升效能。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Frameworks/EF_Core/dbcontext_lifecycle.md)

---

## 🔬 進階主題

### Q16: 如何避免 async/await 的死鎖？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請解釋同步上下文造成死鎖的原因，以及如何避免。

<details>
<summary>💡 答案提示</summary>

**死鎖場景**（在有同步上下文的環境中）：
```csharp
// ❌ 可能死鎖
public void Deadlock()
{
    var result = GetDataAsync().Result; // 阻塞 UI 執行緒
    // await 試圖回到 UI 執行緒，但已被阻塞
}
```

**死鎖原因**：
1. 主執行緒呼叫 `.Result` 或 `.Wait()` 阻塞
2. await 完成後試圖回到主執行緒
3. 主執行緒正在等待，無法恢復

**解決方案**：

**1. 一路 async 到底**：
```csharp
public async Task CorrectAsync()
{
    var result = await GetDataAsync();
}
```

**2. 使用 ConfigureAwait(false)**（程式庫程式碼）：
```csharp
var data = await httpClient.GetStringAsync(url).ConfigureAwait(false);
```

**3. 避免在 async 方法中使用 .Result 或 .Wait()**

**ASP.NET Core 沒有同步上下文**，所以較少遇到此問題，但仍建議程式庫使用 `ConfigureAwait(false)`。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Concurrency/async_await_deep_dive.md)

---

### Q17: 裝箱 (Boxing) 和拆箱 (Unboxing) 的效能影響是什麼？

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🟡 重要

請解釋裝箱/拆箱的發生時機和效能影響，以及如何避免。

<details>
<summary>💡 答案提示</summary>

**裝箱**：值型別轉換為 object（或其實作的介面）時，在堆上分配記憶體。

**拆箱**：從 object 取出值型別，需要型別檢查和複製。

```csharp
int value = 42;
object boxed = value;       // 裝箱：堆分配
int unboxed = (int)boxed;   // 拆箱：型別檢查 + 複製
```

**效能影響**：
- 每次裝箱都會在堆上分配記憶體
- 增加 GC 壓力
- 拆箱有額外的型別檢查開銷

**常見發生場景**：
- 使用非泛型集合（如 `ArrayList`）
- 格式化字串：`string.Format("{0}", 42)`
- 值型別賦值給介面變數

**如何避免**：
- 使用泛型集合（`List<int>` 而非 `ArrayList`）
- 使用字串插值：`$"{value}"`（某些情況仍會裝箱）
- 避免值型別實作介面時的裝箱

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Core/value_vs_reference_types.md)

---

## 📊 學習進度檢核

完成以上題目後，請自我評估：

| 評估項目 | 自評 |
|----------|------|
| 能區分值型別和參考型別 | ⬜ |
| 理解 LINQ 延遲執行 | ⬜ |
| 能解釋委派和事件的區別 | ⬜ |
| 理解 C# 泛型的實作方式 | ⬜ |
| 知道 Dictionary 的內部原理 | ⬜ |
| 理解 async/await 狀態機 | ⬜ |
| 能區分 Task 和 Thread | ⬜ |
| 知道 lock 在 async 中的限制 | ⬜ |
| 理解 ConcurrentDictionary | ⬜ |
| 能解釋 .NET GC 分代機制 | ⬜ |
| 會正確實作 IDisposable | ⬜ |
| 理解 Span&lt;T&gt; 的用途和限制 | ⬜ |
| 理解 DI 生命週期和陷阱 | ⬜ |
| 理解中介軟體管線 | ⬜ |
| 知道如何管理 DbContext 生命週期 | ⬜ |
| 能避免 async/await 死鎖 | ⬜ |
| 理解裝箱/拆箱的效能影響 | ⬜ |

**建議**：未能完整回答的題目，請回到對應的詳細文章深入學習。
