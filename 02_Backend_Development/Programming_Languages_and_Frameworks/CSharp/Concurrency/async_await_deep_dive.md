# async/await 深入解析

- **難度**: 8
- **標籤**: `async`, `await`, `Task`

## 問題詳述

async/await 是 C# 中非同步程式設計的核心語法糖，它讓開發者能以同步的方式撰寫非同步程式碼。深入理解其運作機制、狀態機轉換以及常見陷阱，對於撰寫高效能的 C# 應用程式至關重要。

## 核心理論與詳解

### async/await 的本質

`async` 和 `await` 是編譯器的語法糖，編譯器會將 async 方法轉換為 **狀態機（State Machine）**：

```csharp
// 原始程式碼
public async Task<string> GetDataAsync()
{
    var data = await FetchFromApiAsync();
    var processed = await ProcessDataAsync(data);
    return processed;
}

// 編譯器生成類似以下的狀態機（簡化版）
public Task<string> GetDataAsync()
{
    var stateMachine = new GetDataAsyncStateMachine();
    stateMachine.builder = AsyncTaskMethodBuilder<string>.Create();
    stateMachine.state = -1;
    stateMachine.builder.Start(ref stateMachine);
    return stateMachine.builder.Task;
}
```

### 狀態機的運作流程

1. **方法開始**：建立狀態機，初始狀態為 -1
2. **遇到 await**：
   - 如果 Task 已完成，繼續執行
   - 如果 Task 未完成，註冊延續（continuation），方法返回
3. **Task 完成**：延續被執行，狀態機推進到下一個狀態
4. **方法結束**：設定最終結果或異常

### await 可以等待什麼

任何實作了 **awaitable 模式** 的物件都可以被 await：

- `Task` 和 `Task<T>`
- `ValueTask` 和 `ValueTask<T>`
- 自訂的 awaitable（需實作 `GetAwaiter()` 方法）

```csharp
// 自訂 awaitable
public struct MyAwaitable
{
    public MyAwaiter GetAwaiter() => new MyAwaiter();
}

public struct MyAwaiter : INotifyCompletion
{
    public bool IsCompleted => true;
    public void OnCompleted(Action continuation) { }
    public void GetResult() { }
}
```

### 返回型別的選擇

| 返回型別 | 使用時機 |
|----------|----------|
| `Task` | 非同步方法無返回值 |
| `Task<T>` | 非同步方法有返回值 |
| `ValueTask<T>` | 經常同步完成的熱路徑方法 |
| `void` | 僅用於事件處理器（不建議一般使用） |

### ValueTask vs Task

`ValueTask<T>` 是結構型別，可以避免堆分配：

```csharp
// 適合使用 ValueTask 的場景：快取命中時同步返回
public ValueTask<User> GetUserAsync(int id)
{
    if (_cache.TryGetValue(id, out var user))
        return new ValueTask<User>(user); // 無堆分配
    
    return new ValueTask<User>(LoadUserFromDbAsync(id)); // 包裝 Task
}
```

**ValueTask 的限制**：
- 只能 await 一次
- 不能用 `Task.WhenAll` 等組合方法
- 不能同時多個消費者等待

### 同步上下文（SynchronizationContext）

await 預設會捕獲當前的同步上下文，並在該上下文中恢復執行：

```csharp
// 在 UI 執行緒（有同步上下文）
private async void Button_Click(object sender, EventArgs e)
{
    var data = await GetDataAsync(); // 離開 UI 執行緒
    label.Text = data; // 自動回到 UI 執行緒，可安全更新 UI
}
```

**在 ASP.NET Core 中**：沒有同步上下文，await 後的程式碼可能在任何執行緒池執行緒上執行。

### ConfigureAwait(false)

使用 `ConfigureAwait(false)` 告訴編譯器不需要回到原來的同步上下文：

```csharp
// 程式庫程式碼應該使用 ConfigureAwait(false)
public async Task<string> LibraryMethodAsync()
{
    var data = await httpClient.GetStringAsync(url).ConfigureAwait(false);
    return ProcessData(data); // 不需要回到原始上下文
}
```

**何時使用**：
- 程式庫程式碼（避免死鎖）
- 不需要存取 UI 或 HttpContext 的方法
- 效能敏感的程式碼

### 常見陷阱

**1. async void 的問題**：
```csharp
// 危險！異常無法被捕獲
public async void ProcessData()
{
    await Task.Delay(100);
    throw new Exception("Boom!"); // 會導致程式崩潰
}

// 正確：使用 async Task
public async Task ProcessDataAsync()
{
    await Task.Delay(100);
    throw new Exception("Can be caught");
}
```

**2. 同步阻塞非同步程式碼（死鎖）**：
```csharp
// 在有同步上下文的環境中會死鎖
public void DeadlockExample()
{
    var result = GetDataAsync().Result; // 阻塞 UI 執行緒
    // await 試圖回到 UI 執行緒，但 UI 執行緒被阻塞
}

// 解決方案
public async Task CorrectExample()
{
    var result = await GetDataAsync(); // 使用 await
}
```

**3. 忘記 await**：
```csharp
// 問題：Task 未被等待
public async Task ProcessAsync()
{
    SendEmailAsync(); // 警告 CS4014，異常可能遺失
}

// 正確
public async Task ProcessAsync()
{
    await SendEmailAsync();
}
```

### 異常處理

```csharp
// 基本異常處理
try
{
    await SomeAsyncMethod();
}
catch (Exception ex)
{
    // 處理異常
}

// 處理多個 Task 的異常
try
{
    await Task.WhenAll(task1, task2, task3);
}
catch (Exception ex)
{
    // 只會捕獲第一個異常
    // 使用 Task.Exception 取得所有異常
}
```

### 最佳實踐

1. **一路 async 到底**：避免混合同步和非同步程式碼
2. **程式庫使用 ConfigureAwait(false)**
3. **避免 async void**，除非是事件處理器
4. **適當使用 CancellationToken**
5. **考慮使用 ValueTask** 於熱路徑

## 程式碼範例 (可選)

```csharp
// 完整的非同步最佳實踐範例
public class DataService
{
    private readonly HttpClient _httpClient;
    
    public async Task<Result> ProcessAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var data = await _httpClient
                .GetStringAsync("https://api.example.com/data", cancellationToken)
                .ConfigureAwait(false);
            
            var processed = await TransformAsync(data, cancellationToken)
                .ConfigureAwait(false);
            
            return Result.Success(processed);
        }
        catch (OperationCanceledException)
        {
            return Result.Cancelled();
        }
        catch (HttpRequestException ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}
```
