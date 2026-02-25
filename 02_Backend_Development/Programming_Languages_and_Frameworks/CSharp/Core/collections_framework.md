# 集合框架深入解析

- **難度**: 6
- **標籤**: `Collections`, `List`, `Dictionary`

## 問題詳述

C# 集合框架提供了豐富的資料結構實作，包括動態陣列、字典、集合、佇列等。深入理解各種集合的內部實作、時間複雜度和適用場景，是撰寫高效程式碼的關鍵。

## 核心理論與詳解

### 集合介面階層

```
IEnumerable<T>
    │
    └── ICollection<T>
            │
            ├── IList<T>        → List<T>, Array
            │
            ├── ISet<T>         → HashSet<T>, SortedSet<T>
            │
            └── IDictionary<K,V> → Dictionary<K,V>, SortedDictionary<K,V>
```

### List&lt;T&gt; 內部實作

`List<T>` 基於動態陣列實作，當容量不足時自動擴展：

**核心特性**：
- 底層是 `T[]` 陣列
- 預設初始容量為 0，首次添加時變為 4
- 擴展策略：容量翻倍
- 隨機存取 O(1)，索引查詢極快

**操作複雜度**：

| 操作 | 時間複雜度 | 說明 |
|------|------------|------|
| 索引存取 `list[i]` | O(1) | 直接陣列存取 |
| Add（末尾） | 攤銷 O(1) | 可能觸發擴容 |
| Insert（中間） | O(n) | 需要移動元素 |
| Remove | O(n) | 需要搜尋和移動 |
| Contains | O(n) | 線性搜尋 |
| BinarySearch | O(log n) | 需要先排序 |

**最佳實踐**：
```csharp
// 如果知道大概數量，預先設定容量
var list = new List<Order>(expectedCount); // 避免多次擴容
```

### Dictionary&lt;TKey, TValue&gt; 內部實作

`Dictionary` 基於雜湊表實作，提供近乎 O(1) 的查詢效能：

**核心機制**：
- 使用雜湊函式計算 key 的雜湊碼
- 通過雜湊碼定位到儲存槽（bucket）
- 使用鏈結（或開放定址）處理雜湊碰撞

**操作複雜度**：

| 操作 | 平均 | 最壞 |
|------|------|------|
| 新增 | O(1) | O(n) |
| 查詢 | O(1) | O(n) |
| 刪除 | O(1) | O(n) |

> 最壞情況發生在大量雜湊碰撞時

**關鍵要點**：
- Key 必須正確實作 `GetHashCode()` 和 `Equals()`
- 不要使用可變物件作為 Key
- 不保證遍歷順序

### HashSet&lt;T&gt; vs SortedSet&lt;T&gt;

| 特性 | HashSet&lt;T&gt; | SortedSet&lt;T&gt; |
|------|--------------|----------------|
| 底層結構 | 雜湊表 | 紅黑樹 |
| 查詢複雜度 | O(1) | O(log n) |
| 是否排序 | 否 | 是 |
| 範圍查詢 | 不支援 | 支援 |

```csharp
var hashSet = new HashSet<int> { 3, 1, 4, 1, 5 }; // 無序，去重
var sortedSet = new SortedSet<int> { 3, 1, 4, 1, 5 }; // 排序後: 1, 3, 4, 5

// SortedSet 支援範圍操作
var range = sortedSet.GetViewBetween(2, 4); // 返回 3, 4
```

### Queue&lt;T&gt; 與 Stack&lt;T&gt;

**Queue&lt;T&gt;（佇列）**：FIFO（先進先出）
```csharp
var queue = new Queue<int>();
queue.Enqueue(1);  // 入隊
var first = queue.Dequeue();  // 出隊
var peek = queue.Peek();  // 查看但不移除
```

**Stack&lt;T&gt;（堆疊）**：LIFO（後進先出）
```csharp
var stack = new Stack<int>();
stack.Push(1);  // 入棧
var top = stack.Pop();  // 出棧
var peek = stack.Peek();  // 查看但不移除
```

### LinkedList&lt;T&gt;

雙向鏈結串列實作，適合頻繁插入/刪除的場景：

| 操作 | 時間複雜度 |
|------|------------|
| 頭尾新增/刪除 | O(1) |
| 給定節點插入/刪除 | O(1) |
| 按索引存取 | O(n) |
| 按值搜尋 | O(n) |

```csharp
var list = new LinkedList<string>();
var node = list.AddFirst("first");
list.AddAfter(node, "second");
```

### 不可變集合（Immutable Collections）

`System.Collections.Immutable` 提供執行緒安全的不可變集合：

```csharp
using System.Collections.Immutable;

var original = ImmutableList.Create(1, 2, 3);
var modified = original.Add(4); // 返回新集合，原集合不變
```

**優點**：
- 執行緒安全（無需鎖）
- 可安全共享
- 不會意外修改

**缺點**：
- 每次修改產生新物件
- 記憶體開銷較大

### 集合選擇指南

| 需求 | 推薦集合 |
|------|----------|
| 隨機存取、頻繁讀取 | `List<T>` |
| 快速查詢（Key-Value） | `Dictionary<K,V>` |
| 唯一值、快速判斷存在 | `HashSet<T>` |
| 需要排序的唯一值 | `SortedSet<T>` |
| 頻繁頭尾操作 | `LinkedList<T>` |
| FIFO 操作 | `Queue<T>` |
| LIFO 操作 | `Stack<T>` |
| 執行緒安全 | `Concurrent*` 系列 |
| 不可變需求 | `Immutable*` 系列 |

### GetHashCode 與 Equals

自訂類別作為 Dictionary Key 時，必須正確覆寫：

```csharp
public class Point
{
    public int X { get; set; }
    public int Y { get; set; }
    
    public override bool Equals(object obj)
    {
        return obj is Point other && X == other.X && Y == other.Y;
    }
    
    public override int GetHashCode()
    {
        return HashCode.Combine(X, Y); // .NET Core 2.1+
    }
}
```

**規則**：
- 如果 `a.Equals(b)` 為 true，則 `a.GetHashCode() == b.GetHashCode()` 必須為 true
- GetHashCode 應該快速計算且分布均勻

## 程式碼範例 (可選)

```csharp
// 展示不同集合的使用場景
public class CollectionDemo
{
    // 快取：需要快速查詢
    private Dictionary<string, User> _userCache = new();
    
    // 已處理的 ID：需要快速判斷存在
    private HashSet<int> _processedIds = new();
    
    // 待處理任務：FIFO 順序
    private Queue<Task> _taskQueue = new();
    
    // 操作歷史：需要撤銷（LIFO）
    private Stack<Operation> _undoStack = new();
}
```
