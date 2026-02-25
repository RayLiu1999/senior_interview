# 泛型機制詳解

- **難度**: 6
- **標籤**: `Generics`, `Type Safety`, `Constraints`

## 問題詳述

泛型（Generics）是 C# 中實現型別安全與程式碼重用的核心機制。理解泛型的運作原理、約束條件以及與 Java 泛型的本質差異，對於撰寫高品質的 C# 程式碼至關重要。

## 核心理論與詳解

### 泛型的基本概念

泛型允許在定義類別、介面、方法時延遲指定型別，直到使用時才確定具體型別。這提供了：

- **型別安全**：編譯時期檢查，避免執行時期轉型錯誤
- **程式碼重用**：一份程式碼適用於多種型別
- **效能優化**：避免值型別的裝箱/拆箱

### 泛型類別與方法

```csharp
// 泛型類別
public class Repository<T> where T : class
{
    private List<T> items = new List<T>();
    
    public void Add(T item) => items.Add(item);
    public T GetById(int id) => items.ElementAtOrDefault(id);
}

// 泛型方法
public T Max<T>(T a, T b) where T : IComparable<T>
{
    return a.CompareTo(b) > 0 ? a : b;
}
```

### 泛型約束（Constraints）

約束限制可作為型別參數的型別，提供更多編譯時期保證：

| 約束 | 說明 |
|------|------|
| `where T : struct` | T 必須是值型別 |
| `where T : class` | T 必須是參考型別 |
| `where T : class?` | T 必須是可為空的參考型別 |
| `where T : notnull` | T 必須是不可為空的型別 |
| `where T : new()` | T 必須有公開的無參數建構函式 |
| `where T : BaseClass` | T 必須繼承自 BaseClass |
| `where T : IInterface` | T 必須實作 IInterface |
| `where T : U` | T 必須繼承自另一個型別參數 U |
| `where T : unmanaged` | T 必須是非受控型別（無參考型別欄位） |

**約束可以組合使用**：

```csharp
public class Factory<T> where T : class, IEntity, new()
{
    public T Create() => new T();
}
```

### CLR 中的泛型實作（與 Java 的關鍵差異）

C# 的泛型在 CLR 層級是 **真正的泛型（Reification）**，而非 Java 的型別擦除（Type Erasure）：

**C# 泛型特性**：
- **執行時期保留型別資訊**：可以用反射取得泛型型別參數
- **值型別特化**：每個值型別的泛型都會產生獨立的原生程式碼
- **參考型別共享**：所有參考型別的泛型共享相同的原生程式碼

```csharp
// 執行時期可以取得型別資訊
Type listType = typeof(List<int>);
Type elementType = listType.GetGenericArguments()[0]; // typeof(int)

// 值型別特化，效能優異，無裝箱
List<int> intList = new List<int>();    // 專門針對 int 的版本
List<double> doubleList = new List<double>(); // 專門針對 double 的版本
```

### 協變與逆變（Covariance and Contravariance）

泛型的變異性決定了型別參數的可替換性：

**協變（out）**：允許使用更衍生的型別
```csharp
// IEnumerable<out T> 是協變的
IEnumerable<Animal> animals = new List<Dog>(); // Dog 繼承自 Animal
```

**逆變（in）**：允許使用更基礎的型別
```csharp
// Action<in T> 是逆變的
Action<Dog> dogAction = (Animal a) => Console.WriteLine(a.Name);
```

**規則**：
- `out`：只能作為輸出（返回值）
- `in`：只能作為輸入（參數）

### 泛型與反射

```csharp
// 建立泛型型別實例
Type genericType = typeof(List<>);
Type constructedType = genericType.MakeGenericType(typeof(string));
object instance = Activator.CreateInstance(constructedType);

// 呼叫泛型方法
MethodInfo method = typeof(MyClass).GetMethod("Process");
MethodInfo genericMethod = method.MakeGenericMethod(typeof(int));
genericMethod.Invoke(obj, new object[] { 42 });
```

### 常見陷阱與最佳實踐

**1. 避免過度約束**：
```csharp
// 不好：約束太多，靈活性差
public void Process<T>(T item) where T : class, IEntity, IValidatable, ISerializable, new()

// 好：只約束真正需要的
public void Process<T>(T item) where T : IEntity
```

**2. 善用 default 關鍵字**：
```csharp
public T GetOrDefault<T>(int id)
{
    var item = Find(id);
    return item ?? default(T); // 或 C# 7.1+ 的 default
}
```

**3. 考慮使用泛型介面而非泛型類別**：
```csharp
// 更靈活，支援多重實作
public interface IRepository<T> { }
public class UserRepository : IRepository<User>, IRepository<Role> { }
```

## 程式碼範例 (可選)

```csharp
// 實用的泛型快取實作
public static class Cache<T> where T : class
{
    private static readonly ConcurrentDictionary<string, T> _cache = new();
    
    public static T GetOrAdd(string key, Func<T> factory)
    {
        return _cache.GetOrAdd(key, _ => factory());
    }
    
    public static void Clear() => _cache.Clear();
}

// 使用方式
var user = Cache<User>.GetOrAdd("user:123", () => LoadUserFromDb(123));
```
