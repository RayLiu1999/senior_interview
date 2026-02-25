# 並行集合

- **難度**: 7
- **標籤**: `ConcurrentDictionary`, `BlockingCollection`

## 問題詳述

在多執行緒環境中，標準集合如 List 和 Dictionary 不是執行緒安全的。System.Collections.Concurrent 命名空間提供了專為並行存取設計的執行緒安全集合。理解這些集合的實作原理和正確使用方式，是建構高效能並行應用的關鍵。

## 核心理論與詳解

### 並行集合概覽

| 集合 | 對應的非執行緒安全版本 | 特性 |
|------|------------------------|------|
| ConcurrentDictionary | Dictionary | 執行緒安全的鍵值對集合 |
| ConcurrentQueue | Queue | 執行緒安全的 FIFO 佇列 |
| ConcurrentStack | Stack | 執行緒安全的 LIFO 堆疊 |
| ConcurrentBag | List | 執行緒安全的無序集合 |
| BlockingCollection | - | 支援阻塞操作的生產者-消費者集合 |

### ConcurrentDictionary

最常用的並行集合，提供原子性的複合操作：

```csharp
var cache = new ConcurrentDictionary<string, User>();

// 原子性的 GetOrAdd
var user = cache.GetOrAdd("user:1", key => LoadUserFromDb(key));

// 原子性的 AddOrUpdate
cache.AddOrUpdate(
    "user:1",
    addValueFactory: key => new User { Name = "New" },
    updateValueFactory: (key, existing) =>
    {
        existing.LastAccess = DateTime.Now;
        return existing;
    });

// TryRemove
if (cache.TryRemove("user:1", out var removed))
{
    Console.WriteLine($"Removed: {removed.Name}");
}
```

**重要注意事項**：

工廠方法可能被多次呼叫：
```csharp
// 如果多個執行緒同時呼叫 GetOrAdd，工廠可能執行多次
// 但只有一個結果會被存入字典
var value = dict.GetOrAdd("key", key =>
{
    Console.WriteLine("Factory called"); // 可能輸出多次
    return ExpensiveOperation(key);
});

// 解決：使用 Lazy<T>
var cache = new ConcurrentDictionary<string, Lazy<ExpensiveObject>>();
var lazy = cache.GetOrAdd("key", _ => new Lazy<ExpensiveObject>(
    () => CreateExpensiveObject()));
var value = lazy.Value; // 確保只建立一次
```

### ConcurrentQueue

執行緒安全的 FIFO 佇列，無鎖實作：

```csharp
var queue = new ConcurrentQueue<Task>();

// 入隊（一定成功）
queue.Enqueue(task);

// 嘗試出隊
if (queue.TryDequeue(out var task))
{
    await ProcessAsync(task);
}

// 嘗試查看
if (queue.TryPeek(out var next))
{
    Console.WriteLine($"Next: {next}");
}
```

### ConcurrentStack

執行緒安全的 LIFO 堆疊：

```csharp
var stack = new ConcurrentStack<int>();

stack.Push(1);
stack.PushRange(new[] { 2, 3, 4 }); // 批量推入

if (stack.TryPop(out var item))
{
    Console.WriteLine(item); // 4
}

var items = new int[2];
int count = stack.TryPopRange(items); // 批量彈出
```

### ConcurrentBag

無序的執行緒安全集合，針對相同執行緒的加入/取出操作最佳化：

```csharp
var bag = new ConcurrentBag<WorkItem>();

bag.Add(new WorkItem());

if (bag.TryTake(out var item))
{
    Process(item);
}
```

**適用場景**：
- 工作竊取演算法
- 不關心取出順序的情況
- 相同執行緒頻繁加入和取出

### BlockingCollection

建構在其他並行集合之上，支援阻塞操作，非常適合生產者-消費者模式：

```csharp
// 使用預設的 ConcurrentQueue 作為底層集合
var collection = new BlockingCollection<WorkItem>(boundedCapacity: 100);

// 生產者
Task.Run(() =>
{
    foreach (var item in GetItems())
    {
        collection.Add(item); // 如果已滿，會阻塞
    }
    collection.CompleteAdding(); // 標記完成
});

// 消費者
Task.Run(() =>
{
    foreach (var item in collection.GetConsumingEnumerable())
    {
        Process(item); // 如果為空，會阻塞等待
    }
    // CompleteAdding 後，佇列清空時會退出迴圈
});
```

**容量限制**：
```csharp
// 有界集合，防止生產者過快
var bounded = new BlockingCollection<int>(boundedCapacity: 10);

// 嘗試加入，不阻塞
if (!bounded.TryAdd(item, timeout: TimeSpan.FromSeconds(1)))
{
    Console.WriteLine("Collection is full");
}
```

### 並行集合 vs 加鎖的標準集合

**何時使用並行集合**：
- 多執行緒頻繁讀寫
- 需要原子性的複合操作
- 高並發場景

**何時使用 lock + 標準集合**：
- 需要在一個鎖內執行多個操作
- 並發程度不高
- 需要更複雜的事務語意

```csharp
// 並行集合無法做到的原子操作
lock (_lock)
{
    if (_dict.ContainsKey(key))
    {
        var value = _dict[key];
        value.DoSomething();
        _dict.Remove(key);
    }
}
```

### 效能考量

1. **ConcurrentDictionary** 使用分段鎖（striped locking），減少競爭
2. **ConcurrentQueue/Stack** 使用無鎖演算法（CAS 操作）
3. **BlockingCollection** 有阻塞開銷，適合需要背壓控制的場景

### ImmutableDictionary vs ConcurrentDictionary

| 特性 | ConcurrentDictionary | ImmutableDictionary |
|------|---------------------|---------------------|
| 可變性 | 可變（in-place 修改） | 不可變（返回新集合） |
| 執行緒安全 | 是 | 是（因為不可變） |
| 記憶體使用 | 較低 | 每次修改都產生新物件 |
| 適用場景 | 高頻讀寫 | 讀多寫少、需要快照 |

## 程式碼範例 (可選)

```csharp
// 使用 BlockingCollection 實現簡單的工作佇列
public class WorkQueue : IDisposable
{
    private readonly BlockingCollection<Func<Task>> _queue;
    private readonly Task[] _workers;
    
    public WorkQueue(int workerCount)
    {
        _queue = new BlockingCollection<Func<Task>>();
        _workers = Enumerable.Range(0, workerCount)
            .Select(_ => Task.Run(ProcessLoop))
            .ToArray();
    }
    
    public void Enqueue(Func<Task> work) => _queue.Add(work);
    
    private async Task ProcessLoop()
    {
        foreach (var work in _queue.GetConsumingEnumerable())
        {
            try
            {
                await work();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Worker error: {ex.Message}");
            }
        }
    }
    
    public void Dispose()
    {
        _queue.CompleteAdding();
        Task.WaitAll(_workers);
        _queue.Dispose();
    }
}
```
