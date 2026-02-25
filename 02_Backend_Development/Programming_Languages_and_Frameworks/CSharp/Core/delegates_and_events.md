# 委派與事件

- **難度**: 6
- **標籤**: `Delegate`, `Event`, `Callback`

## 問題詳述

委派（Delegate）是 C# 中型別安全的函式指標，而事件（Event）則是基於委派的發布-訂閱機制。理解這兩個概念是掌握 LINQ、非同步程式設計和事件驅動架構的基礎。

## 核心理論與詳解

### 委派的本質

委派是一種型別，定義了方法的簽名。它是型別安全的函式指標，可以持有對一個或多個方法的參考。

```csharp
// 定義委派型別
public delegate int MathOperation(int a, int b);

// 使用委派
MathOperation add = (a, b) => a + b;
int result = add(3, 4); // result = 7
```

**委派的特性**：
- **型別安全**：編譯時期檢查方法簽名
- **多播（Multicast）**：可以持有多個方法的參考
- **不可變**：組合委派會產生新的委派實例

### 內建委派型別

.NET 提供了常用的泛型委派，大多數情況下不需要自訂委派：

| 委派 | 說明 | 簽名 |
|------|------|------|
| `Action` | 無返回值 | `void Action()` |
| `Action<T>` | 接受參數，無返回值 | `void Action(T obj)` |
| `Func<TResult>` | 有返回值 | `TResult Func()` |
| `Func<T, TResult>` | 接受參數，有返回值 | `TResult Func(T arg)` |
| `Predicate<T>` | 返回 bool | `bool Predicate(T obj)` |

```csharp
Func<int, int, int> multiply = (a, b) => a * b;
Action<string> print = message => Console.WriteLine(message);
Predicate<int> isPositive = n => n > 0;
```

### 多播委派（Multicast Delegate）

委派可以持有多個方法的參考，依序呼叫：

```csharp
Action<string> logger = null;
logger += message => Console.WriteLine($"Console: {message}");
logger += message => File.AppendAllText("log.txt", message);
logger += message => Debug.WriteLine($"Debug: {message}");

logger("Hello World"); // 三個方法都會被呼叫
```

**注意事項**：
- 如果委派有返回值，只會返回最後一個方法的結果
- 如果其中一個方法拋出例外，後續方法不會執行
- 使用 `GetInvocationList()` 可以手動控制執行

### 事件（Event）

事件是對委派的封裝，提供發布-訂閱模式，並限制外部只能進行 `+=` 和 `-=` 操作：

```csharp
public class Button
{
    // 宣告事件
    public event EventHandler Click;
    
    // 觸發事件
    protected virtual void OnClick()
    {
        Click?.Invoke(this, EventArgs.Empty);
    }
    
    public void PerformClick() => OnClick();
}

// 訂閱事件
var button = new Button();
button.Click += (sender, e) => Console.WriteLine("Button clicked!");
```

### 事件 vs 委派欄位

| 特性 | 委派欄位 | 事件 |
|------|----------|------|
| **外部存取** | 可直接呼叫、賦值 | 只能 += 或 -= |
| **封裝性** | 低 | 高 |
| **用途** | 回呼、策略模式 | 發布-訂閱模式 |

```csharp
public class Publisher
{
    // 委派欄位 - 外部可以任意操作
    public Action<string> OnMessage;
    
    // 事件 - 外部只能訂閱/取消訂閱
    public event Action<string> MessageReceived;
}

var pub = new Publisher();
pub.OnMessage = null;       // 允許，可能意外清除所有訂閱者
// pub.MessageReceived = null; // 編譯錯誤！事件不允許
```

### EventHandler 模式

.NET 建議使用 `EventHandler` 模式定義事件：

```csharp
// 自訂事件參數
public class OrderEventArgs : EventArgs
{
    public int OrderId { get; set; }
    public decimal Amount { get; set; }
}

public class OrderService
{
    public event EventHandler<OrderEventArgs> OrderPlaced;
    
    protected virtual void OnOrderPlaced(OrderEventArgs e)
    {
        OrderPlaced?.Invoke(this, e);
    }
    
    public void PlaceOrder(int id, decimal amount)
    {
        // 處理訂單...
        OnOrderPlaced(new OrderEventArgs { OrderId = id, Amount = amount });
    }
}
```

### 事件的記憶體洩漏

**問題**：事件訂閱者的參考被事件發布者持有，可能導致訂閱者無法被 GC 回收。

```csharp
// 潛在的記憶體洩漏
public class Subscriber
{
    public Subscriber(Publisher pub)
    {
        pub.DataReceived += OnDataReceived; // 訂閱
        // 如果忘記取消訂閱，Subscriber 無法被回收
    }
    
    private void OnDataReceived(object sender, EventArgs e) { }
}
```

**解決方案**：
1. **實作 IDisposable**，在 Dispose 中取消訂閱
2. **使用弱事件模式**（Weak Event Pattern）
3. **使用 Reactive Extensions**（Rx）

### 委派與閉包

Lambda 表達式可以捕獲外部變數，形成閉包：

```csharp
public Func<int, int> CreateMultiplier(int factor)
{
    return x => x * factor; // 捕獲 factor
}

var triple = CreateMultiplier(3);
Console.WriteLine(triple(5)); // 輸出: 15
```

## 程式碼範例 (可選)

```csharp
// 完整的事件發布-訂閱範例
public class StockTicker
{
    public event EventHandler<StockPriceChangedEventArgs> PriceChanged;
    
    private decimal _price;
    public decimal Price
    {
        get => _price;
        set
        {
            if (_price != value)
            {
                var oldPrice = _price;
                _price = value;
                OnPriceChanged(new StockPriceChangedEventArgs(oldPrice, value));
            }
        }
    }
    
    protected virtual void OnPriceChanged(StockPriceChangedEventArgs e)
    {
        PriceChanged?.Invoke(this, e);
    }
}

public class StockPriceChangedEventArgs : EventArgs
{
    public decimal OldPrice { get; }
    public decimal NewPrice { get; }
    public decimal Change => NewPrice - OldPrice;
    
    public StockPriceChangedEventArgs(decimal oldPrice, decimal newPrice)
    {
        OldPrice = oldPrice;
        NewPrice = newPrice;
    }
}
```
