# 垃圾回收機制

- **難度**: 8
- **標籤**: `GC`, `Memory Management`, `Generations`

## 問題詳述

.NET 的垃圾回收器（Garbage Collector, GC）自動管理記憶體的分配和釋放。深入理解 GC 的運作機制、分代策略、GC 模式以及如何減少 GC 壓力，是撰寫高效能 .NET 應用程式的關鍵。

## 核心理論與詳解

### GC 的基本原理

GC 的核心工作：
1. **分配記憶體**：為新物件分配堆記憶體
2. **識別垃圾**：找出不再被引用的物件
3. **回收記憶體**：釋放垃圾物件佔用的記憶體
4. **壓縮堆**：移動存活物件，消除記憶體碎片

### 分代式垃圾回收

.NET GC 使用分代（Generational）策略，基於「大多數物件生命週期很短」的觀察：

| 世代 | 說明 | 觸發條件 |
|------|------|----------|
| **Gen 0** | 新物件，生命週期最短 | 最頻繁 |
| **Gen 1** | 從 Gen 0 存活下來 | 中等頻率 |
| **Gen 2** | 長期存活的物件 | 最不頻繁 |

**世代假設（Generational Hypothesis）**：
- 新物件最可能成為垃圾
- 越老的物件越可能繼續存活
- 收集年輕世代比收集整個堆更高效

```
新物件 → Gen 0 → (存活) → Gen 1 → (存活) → Gen 2
              ↓              ↓              ↓
           被回收         被回收         被回收
```

### 大型物件堆（Large Object Heap, LOH）

大於 85,000 位元組的物件直接分配到 LOH：

- LOH 物件視為 Gen 2
- 預設不壓縮（可設定 `GCSettings.LargeObjectHeapCompactionMode`）
- 容易產生記憶體碎片

```csharp
// 這會分配到 LOH
var largeArray = new byte[85001];
```

### GC 模式

**.NET 提供不同的 GC 模式**：

| 模式 | 特性 | 適用場景 |
|------|------|----------|
| **Workstation GC** | 低延遲，與應用程式同一執行緒 | 桌面應用 |
| **Server GC** | 高吞吐量，多執行緒收集 | 伺服器應用 |
| **Concurrent GC** | 減少停頓時間 | 需要低延遲 |
| **Background GC** | 進一步減少停頓 | .NET Core 預設 |

設定方式（在 .csproj 或 runtimeconfig.json）：
```xml
<PropertyGroup>
  <ServerGarbageCollection>true</ServerGarbageCollection>
  <ConcurrentGarbageCollection>true</ConcurrentGarbageCollection>
</PropertyGroup>
```

### GC 根（GC Roots）

GC 從根物件開始追蹤，找出所有可達的物件：

**GC 根包括**：
- 棧上的區域變數和參數
- 靜態變數
- 終結佇列（Finalization Queue）
- CPU 暫存器
- GC 句柄（GC Handles）

不可從根到達的物件會被標記為垃圾。

### 終結器（Finalizer）

終結器用於清理非受控資源，但有效能開銷：

```csharp
public class ResourceHolder
{
    ~ResourceHolder() // 終結器
    {
        // 清理非受控資源
    }
}
```

**終結器的問題**：
- 有終結器的物件需要兩次 GC 才能回收
- 終結器執行順序不確定
- 可能延長物件生命週期

**建議**：使用 IDisposable 模式，避免依賴終結器

### 減少 GC 壓力的策略

**1. 物件池（Object Pooling）**：
```csharp
// 使用 ArrayPool 重用陣列
var pool = ArrayPool<byte>.Shared;
var buffer = pool.Rent(1024);
try
{
    // 使用 buffer
}
finally
{
    pool.Return(buffer);
}
```

**2. 使用結構而非類別**（適當時）：
```csharp
// 值型別，可能在棧上分配
public struct Point { public int X, Y; }
```

**3. 避免不必要的分配**：
```csharp
// 不好：每次呼叫都分配新陣列
public void Process(int[] data) { }
Process(new int[] { 1, 2, 3 });

// 好：使用 Span 避免分配
public void Process(ReadOnlySpan<int> data) { }
Process(stackalloc int[] { 1, 2, 3 });
```

**4. 使用 Span&lt;T&gt; 和 Memory&lt;T&gt;**

### 監控 GC

```csharp
// 取得 GC 資訊
Console.WriteLine($"Gen 0 collections: {GC.CollectionCount(0)}");
Console.WriteLine($"Gen 1 collections: {GC.CollectionCount(1)}");
Console.WriteLine($"Gen 2 collections: {GC.CollectionCount(2)}");
Console.WriteLine($"Total memory: {GC.GetTotalMemory(false)}");

// 強制 GC（通常不建議）
GC.Collect();
GC.WaitForPendingFinalizers();
```

### GC 觸發時機

GC 會在以下情況觸發：
1. Gen 0 分配達到閾值
2. 呼叫 `GC.Collect()`
3. 系統記憶體不足
4. 應用程式卸載

### 常見問題

**記憶體洩漏的常見原因**：
- 事件處理器未取消訂閱
- 靜態集合持有物件參考
- 快取無限增長
- 終結器中的迴圈參考

**診斷工具**：
- Visual Studio Diagnostic Tools
- dotMemory
- PerfView
- dotnet-dump / dotnet-gcdump

## 程式碼範例 (可選)

```csharp
// 使用 GC 通知監控記憶體壓力
public class MemoryMonitor
{
    public static void StartMonitoring()
    {
        GC.RegisterForFullGCNotification(10, 10);
        
        Task.Run(() =>
        {
            while (true)
            {
                var status = GC.WaitForFullGCApproach();
                if (status == GCNotificationStatus.Succeeded)
                {
                    Console.WriteLine("Full GC approaching!");
                    // 可以在此時減少分配或快取
                }
                
                status = GC.WaitForFullGCComplete();
                if (status == GCNotificationStatus.Succeeded)
                {
                    Console.WriteLine("Full GC completed");
                }
            }
        });
    }
}
```
