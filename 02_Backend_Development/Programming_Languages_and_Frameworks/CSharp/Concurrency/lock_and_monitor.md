# lock 與 Monitor

- **難度**: 6
- **標籤**: `lock`, `Monitor`, `Critical Section`

## 問題詳述

在多執行緒程式設計中，保護共享資源免於競態條件（Race Condition）是關鍵挑戰。C# 提供了 lock 關鍵字和 Monitor 類別來實現互斥鎖定。理解它們的運作機制和最佳實踐，是撰寫執行緒安全程式碼的基礎。

## 核心理論與詳解

### lock 的本質

`lock` 是 C# 的語法糖，編譯器會將其轉換為 `Monitor.Enter` 和 `Monitor.Exit`：

```csharp
// lock 語法
lock (lockObject)
{
    // 臨界區
}

// 編譯器轉換為（簡化版）
bool lockTaken = false;
try
{
    Monitor.Enter(lockObject, ref lockTaken);
    // 臨界區
}
finally
{
    if (lockTaken)
        Monitor.Exit(lockObject);
}
```

### 鎖定物件的選擇

**正確做法**：使用專用的私有物件
```csharp
private readonly object _lock = new object();

public void ThreadSafeMethod()
{
    lock (_lock)
    {
        // 安全的操作
    }
}
```

**錯誤做法**：

```csharp
// 不要鎖定 this - 外部程式碼可能也鎖定此物件
lock (this) { }

// 不要鎖定 Type - 全域影響
lock (typeof(MyClass)) { }

// 不要鎖定字串 - 字串常數池共享
lock ("myLock") { }

// 不要鎖定值型別 - 每次裝箱產生新物件
int lockInt = 0;
lock (lockInt) { } // 編譯錯誤
```

### Monitor 的進階功能

Monitor 提供了比 lock 更多的控制：

**TryEnter - 嘗試取得鎖定**：
```csharp
bool lockTaken = false;
try
{
    // 嘗試取得鎖定，最多等待 1 秒
    lockTaken = Monitor.TryEnter(lockObject, TimeSpan.FromSeconds(1));
    if (lockTaken)
    {
        // 取得鎖定
    }
    else
    {
        // 無法取得鎖定
    }
}
finally
{
    if (lockTaken)
        Monitor.Exit(lockObject);
}
```

**Wait 和 Pulse - 執行緒間通訊**：
```csharp
private readonly object _lock = new object();
private Queue<Item> _queue = new Queue<Item>();

// 消費者
public Item Dequeue()
{
    lock (_lock)
    {
        while (_queue.Count == 0)
            Monitor.Wait(_lock); // 釋放鎖並等待
        
        return _queue.Dequeue();
    }
}

// 生產者
public void Enqueue(Item item)
{
    lock (_lock)
    {
        _queue.Enqueue(item);
        Monitor.Pulse(_lock); // 喚醒一個等待的執行緒
    }
}
```

### lock vs 其他同步機制

| 機制 | 特性 | 適用場景 |
|------|------|----------|
| lock/Monitor | 簡單、效能好 | 單一程序內的短時間鎖定 |
| SemaphoreSlim | 支援非同步、可設定數量 | 限制並行存取數量 |
| ReaderWriterLockSlim | 讀寫分離 | 讀多寫少的場景 |
| Mutex | 跨程序 | 多程序同步 |
| SpinLock | 忙等待 | 極短時間鎖定 |

### ReaderWriterLockSlim

適用於讀多寫少的場景：

```csharp
private readonly ReaderWriterLockSlim _rwLock = new ReaderWriterLockSlim();
private Dictionary<string, string> _cache = new Dictionary<string, string>();

public string Read(string key)
{
    _rwLock.EnterReadLock();
    try
    {
        return _cache.TryGetValue(key, out var value) ? value : null;
    }
    finally
    {
        _rwLock.ExitReadLock();
    }
}

public void Write(string key, string value)
{
    _rwLock.EnterWriteLock();
    try
    {
        _cache[key] = value;
    }
    finally
    {
        _rwLock.ExitWriteLock();
    }
}
```

### 常見問題

**1. 死鎖（Deadlock）**：
```csharp
// 執行緒 1
lock (lockA)
{
    lock (lockB) { }
}

// 執行緒 2
lock (lockB)
{
    lock (lockA) { }  // 可能死鎖！
}

// 解決：統一鎖定順序
// 兩個執行緒都先鎖 lockA 再鎖 lockB
```

**2. 在 lock 內使用 await**：
```csharp
// 錯誤：lock 不支援 await
lock (_lock)
{
    await SomeAsyncMethod(); // 編譯錯誤
}

// 解決：使用 SemaphoreSlim
private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);

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

**3. 鎖定時間過長**：
```csharp
// 不好：持有鎖期間進行 I/O 操作
lock (_lock)
{
    var data = File.ReadAllText("file.txt"); // 可能很慢
    ProcessData(data);
}

// 好：最小化鎖定範圍
var data = File.ReadAllText("file.txt"); // 在鎖外讀取
lock (_lock)
{
    ProcessData(data);
}
```

### 最佳實踐

1. **最小化鎖定範圍**：只鎖定必要的程式碼
2. **避免巢狀鎖定**：減少死鎖風險
3. **使用專用的鎖定物件**：不要鎖定 this 或 Type
4. **考慮使用無鎖資料結構**：如 ConcurrentDictionary
5. **適當使用 TryEnter**：避免無限等待

## 程式碼範例 (可選)

```csharp
// 執行緒安全的計數器實作
public class ThreadSafeCounter
{
    private readonly object _lock = new object();
    private int _count;

    public int Count
    {
        get
        {
            lock (_lock)
            {
                return _count;
            }
        }
    }

    public int Increment()
    {
        lock (_lock)
        {
            return ++_count;
        }
    }

    public int Decrement()
    {
        lock (_lock)
        {
            return --_count;
        }
    }
}

// 更高效的方式：使用 Interlocked
public class InterlockedCounter
{
    private int _count;
    
    public int Count => Volatile.Read(ref _count);
    public int Increment() => Interlocked.Increment(ref _count);
    public int Decrement() => Interlocked.Decrement(ref _count);
}
```
