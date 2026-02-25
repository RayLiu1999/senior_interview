# LINQ 深入解析

- **難度**: 7
- **標籤**: `LINQ`, `IEnumerable`, `Expression Tree`

## 問題詳述

LINQ（Language Integrated Query）是 C# 中最強大的功能之一，它將查詢能力直接整合到語言中。深入理解 LINQ 的運作機制、延遲執行特性以及 Expression Tree，對於撰寫高效且可維護的資料處理程式碼至關重要。

## 核心理論與詳解

### LINQ 的兩種語法

**查詢語法（Query Syntax）**：
```csharp
var result = from user in users
             where user.Age > 18
             orderby user.Name
             select user;
```

**方法語法（Method Syntax）**：
```csharp
var result = users
    .Where(user => user.Age > 18)
    .OrderBy(user => user.Name);
```

兩種語法編譯後產生相同的程式碼，查詢語法最終會轉換為方法語法。

### 延遲執行（Deferred Execution）

LINQ 查詢**不會立即執行**，而是在實際枚舉時才執行：

```csharp
var query = users.Where(u => u.Age > 18); // 此時只建立查詢，不執行
// ... 可能中間修改了 users 集合 ...
foreach (var user in query) // 此時才真正執行查詢
{
    Console.WriteLine(user.Name);
}
```

**立即執行的方法**（會強制立即執行查詢）：
- `ToList()`、`ToArray()`、`ToDictionary()`
- `Count()`、`First()`、`Single()`、`Any()`
- `Max()`、`Min()`、`Sum()`、`Average()`

### IEnumerable vs IQueryable

這是理解 LINQ 的關鍵區分：

| 特性 | IEnumerable&lt;T&gt; | IQueryable&lt;T&gt; |
|------|------------------|------------------|
| **執行位置** | 記憶體中（客戶端） | 資料來源（如資料庫） |
| **查詢表示** | 委派（Delegate） | Expression Tree |
| **適用場景** | LINQ to Objects | LINQ to SQL/EF |
| **效能考量** | 資料必須載入記憶體 | 查詢在資料來源端最佳化 |

```csharp
// IEnumerable - 所有資料載入記憶體後過濾
IEnumerable<User> enumerable = GetUsers();
var result1 = enumerable.Where(u => u.Age > 18); // 在記憶體中過濾

// IQueryable - 生成 SQL 在資料庫端過濾
IQueryable<User> queryable = dbContext.Users;
var result2 = queryable.Where(u => u.Age > 18); // 轉換為 WHERE Age > 18
```

### Expression Tree（表達式樹）

Expression Tree 是 LINQ 查詢的核心，它將程式碼表示為可檢查、可修改的資料結構：

```csharp
// Lambda 表達式
Func<int, bool> func = x => x > 5;

// Expression Tree
Expression<Func<int, bool>> expression = x => x > 5;
```

**Expression Tree 的特點**：
- 可在執行時期分析和修改
- 可轉換為其他形式（如 SQL）
- 是 ORM 框架的基礎

```csharp
// 分析 Expression Tree
Expression<Func<User, bool>> expr = u => u.Age > 18;
var body = expr.Body as BinaryExpression;
var left = body.Left as MemberExpression;
Console.WriteLine(left.Member.Name); // 輸出: "Age"
```

### 常用 LINQ 方法分類

**過濾**：`Where`、`OfType`、`Distinct`

**投影**：`Select`、`SelectMany`

**排序**：`OrderBy`、`OrderByDescending`、`ThenBy`

**分組**：`GroupBy`、`ToLookup`

**聯結**：`Join`、`GroupJoin`

**聚合**：`Count`、`Sum`、`Average`、`Min`、`Max`、`Aggregate`

**元素操作**：`First`、`FirstOrDefault`、`Single`、`ElementAt`

**量詞**：`Any`、`All`、`Contains`

**分割**：`Take`、`Skip`、`TakeWhile`、`SkipWhile`

**集合操作**：`Union`、`Intersect`、`Except`、`Concat`

### 效能最佳化

**1. 避免多次枚舉**：
```csharp
// 不好：可能多次枚舉 IEnumerable
var query = GetData();
if (query.Any()) // 第一次枚舉
{
    var first = query.First(); // 第二次枚舉
}

// 好：先轉換為 List
var list = GetData().ToList();
if (list.Any())
{
    var first = list.First();
}
```

**2. 使用適當的方法**：
```csharp
// 不好：Count() 會枚舉整個集合
if (users.Count() > 0)

// 好：Any() 找到第一個就停止
if (users.Any())
```

**3. 善用索引**：
```csharp
// 使用 Select 的索引多載
var indexed = items.Select((item, index) => new { item, index });
```

### 常見陷阱

**1. 閉包陷阱**：
```csharp
// 問題：所有結果都使用最後的 i 值
var actions = new List<Func<int>>();
for (int i = 0; i < 5; i++)
{
    actions.Add(() => i); // 捕獲的是變數，不是值
}
// actions[0]() 返回 5，不是 0

// 解決：在迴圈內建立區域變數
for (int i = 0; i < 5; i++)
{
    int copy = i;
    actions.Add(() => copy);
}
```

**2. 意外的多次資料庫查詢**：
```csharp
// 每次存取 query 都會執行資料庫查詢
var query = dbContext.Users.Where(u => u.Age > 18);
var count = query.Count();  // 查詢 1
var list = query.ToList();  // 查詢 2

// 正確做法：先 ToList()
var users = dbContext.Users.Where(u => u.Age > 18).ToList();
var count = users.Count;
```

## 程式碼範例 (可選)

```csharp
// 展示 LINQ 的強大能力
public class Order { public int Id; public decimal Amount; public int CustomerId; }
public class Customer { public int Id; public string Name; }

// 複雜查詢範例
var customerSummary = orders
    .GroupBy(o => o.CustomerId)
    .Select(g => new 
    {
        CustomerId = g.Key,
        TotalOrders = g.Count(),
        TotalAmount = g.Sum(o => o.Amount),
        AverageAmount = g.Average(o => o.Amount)
    })
    .Where(s => s.TotalAmount > 1000)
    .OrderByDescending(s => s.TotalAmount);
```
