# Task 與 Task&lt;T&gt;

- **難度**: 6
- **標籤**: `Task`, `TPL`, `Asynchronous`

## 問題詳述

Task 和 Task&lt;T&gt; 是 .NET 中表示非同步操作的核心型別，是 Task Parallel Library (TPL) 的基礎。理解 Task 的建立方式、生命週期以及各種組合操作，是掌握 C# 非同步程式設計的關鍵。

## 核心理論與詳解

### Task 的本質

Task 代表一個非同步操作，它是一個「承諾」，表示將來某個時間點會有結果（或完成）：

- `Task`：代表無返回值的非同步操作
- `Task<T>`：代表有返回值的非同步操作

### 建立 Task 的方式

**1. 使用 Task.Run**（CPU 密集型工作）：
```csharp
Task<int> task = Task.Run(() =>
{
    // 在執行緒池執行緒上執行
    return ComputeHeavyCalculation();
});
```

**2. 使用 async/await**（I/O 密集型工作）：
```csharp
async Task<string> GetDataAsync()
{
    return await httpClient.GetStringAsync(url);
}
```

**3. 使用 Task.FromResult**（已完成的 Task）：
```csharp
Task<int> completedTask = Task.FromResult(42);
```

**4. 使用 TaskCompletionSource**（手動控制）：
```csharp
var tcs = new TaskCompletionSource<string>();
// 稍後設定結果
tcs.SetResult("completed");
// 或設定異常
tcs.SetException(new Exception("failed"));
```

### Task 的狀態

Task 有以下狀態（TaskStatus 列舉）：

| 狀態 | 說明 |
|------|------|
| Created | 已建立但未排程 |
| WaitingForActivation | 等待被啟動 |
| WaitingToRun | 已排程，等待執行 |
| Running | 正在執行 |
| WaitingForChildrenToComplete | 等待子任務完成 |
| RanToCompletion | 成功完成 |
| Canceled | 已取消 |
| Faulted | 發生異常 |

```csharp
if (task.IsCompleted)
{
    if (task.IsCompletedSuccessfully) { /* 成功 */ }
    else if (task.IsCanceled) { /* 取消 */ }
    else if (task.IsFaulted) { /* 異常 */ }
}
```

### Task 組合操作

**Task.WhenAll**：等待所有 Task 完成
```csharp
var tasks = new[]
{
    GetUser1Async(),
    GetUser2Async(),
    GetUser3Async()
};
User[] users = await Task.WhenAll(tasks);
```

**Task.WhenAny**：等待任一 Task 完成
```csharp
var completed = await Task.WhenAny(task1, task2, task3);
if (completed == task1)
{
    var result = await task1;
}
```

**實用模式 - 帶超時的操作**：
```csharp
async Task<T> WithTimeout<T>(Task<T> task, TimeSpan timeout)
{
    var delayTask = Task.Delay(timeout);
    var completed = await Task.WhenAny(task, delayTask);
    
    if (completed == delayTask)
        throw new TimeoutException();
    
    return await task;
}
```

### 取消 Task

使用 CancellationToken 實現協作式取消：

```csharp
async Task ProcessAsync(CancellationToken cancellationToken)
{
    for (int i = 0; i < 100; i++)
    {
        cancellationToken.ThrowIfCancellationRequested();
        await Task.Delay(100, cancellationToken);
    }
}

// 使用
var cts = new CancellationTokenSource();
cts.CancelAfter(TimeSpan.FromSeconds(5)); // 5 秒後取消

try
{
    await ProcessAsync(cts.Token);
}
catch (OperationCanceledException)
{
    Console.WriteLine("操作已取消");
}
```

### 延續（Continuation）

使用 ContinueWith 或 await 連接 Task：

```csharp
// 使用 ContinueWith（較底層）
task.ContinueWith(t =>
{
    if (t.IsCompletedSuccessfully)
        Console.WriteLine(t.Result);
}, TaskContinuationOptions.OnlyOnRanToCompletion);

// 使用 await（推薦）
var result = await task;
Console.WriteLine(result);
```

### 異常處理

```csharp
// 單一 Task
try
{
    await task;
}
catch (Exception ex)
{
    // 處理異常
}

// WhenAll 的異常處理
try
{
    await Task.WhenAll(task1, task2, task3);
}
catch (Exception)
{
    // 檢查每個 Task 的異常
    foreach (var t in new[] { task1, task2, task3 })
    {
        if (t.IsFaulted)
        {
            var exception = t.Exception.InnerException;
        }
    }
}
```

### Task vs Thread

| 特性 | Task | Thread |
|------|------|--------|
| 抽象層級 | 高 | 低 |
| 執行緒管理 | 執行緒池管理 | 手動管理 |
| 返回值 | 原生支援 | 需要額外處理 |
| 組合操作 | 豐富（WhenAll 等） | 需手動實作 |
| 效能 | 較好（重用執行緒） | 建立成本高 |
| 適用場景 | 大多數情況 | 需要專用執行緒 |

### 常見陷阱

**1. 不要使用 Task 建構函式**：
```csharp
// 不好：建立未啟動的 Task
var task = new Task(() => { });
task.Start();

// 好：使用 Task.Run
var task = Task.Run(() => { });
```

**2. 避免 async void**（除了事件處理器）

**3. 不要忽略 Task**：
```csharp
// 危險：Task 可能失敗但不被注意
SomeAsyncMethod(); // 沒有 await

// 正確
await SomeAsyncMethod();
// 或
_ = SomeAsyncMethod(); // 明確丟棄，適用於 fire-and-forget
```

## 程式碼範例 (可選)

```csharp
// 並行處理多個請求並限制並行度
public async Task<IEnumerable<Result>> ProcessBatchAsync(
    IEnumerable<Request> requests,
    int maxDegreeOfParallelism = 4)
{
    var semaphore = new SemaphoreSlim(maxDegreeOfParallelism);
    var tasks = requests.Select(async request =>
    {
        await semaphore.WaitAsync();
        try
        {
            return await ProcessRequestAsync(request);
        }
        finally
        {
            semaphore.Release();
        }
    });
    
    return await Task.WhenAll(tasks);
}
```
