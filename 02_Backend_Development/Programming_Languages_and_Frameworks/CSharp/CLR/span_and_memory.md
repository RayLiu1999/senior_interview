# Span&lt;T&gt; 與 Memory&lt;T&gt;

- **難度**: 8
- **標籤**: `Span`, `Memory`, `Performance`

## 問題詳述

Span&lt;T&gt; 和 Memory&lt;T&gt; 是 .NET 中用於高效能記憶體存取的型別，它們提供了對連續記憶體區域的安全、統一存取方式。理解這些型別對於撰寫高效能、低分配的 .NET 程式碼至關重要。

## 核心理論與詳解

### Span&lt;T&gt; 的本質

`Span<T>` 是一個 `ref struct`（只能存在於棧上），代表任意連續記憶體的「視窗」：

```csharp
// 可以指向各種記憶體來源
Span<byte> fromArray = new byte[100];
Span<byte> fromSlice = fromArray.Slice(10, 50);

// 指向棧記憶體
Span<int> fromStack = stackalloc int[10];

// 指向原生記憶體
unsafe
{
    byte* ptr = (byte*)Marshal.AllocHGlobal(100);
    Span<byte> fromNative = new Span<byte>(ptr, 100);
}
```

### Span&lt;T&gt; vs Memory&lt;T&gt;

| 特性 | Span&lt;T&gt; | Memory&lt;T&gt; |
|------|----------|-------------|
| 儲存位置 | 只能在棧上 | 可在堆上 |
| 類型 | ref struct | struct |
| 用於欄位 | ❌ | ✅ |
| 用於 async | ❌ | ✅ |
| 效能 | 最佳 | 稍慢 |

```csharp
// Span 不能用於非同步方法或類別欄位
class BadExample
{
    // private Span<byte> _data; // 編譯錯誤！
    private Memory<byte> _data; // OK
}

async Task ProcessAsync()
{
    Memory<byte> memory = new byte[100];
    await Task.Delay(100);
    var span = memory.Span; // 在需要時取得 Span
}
```

### 切片操作

Span 的切片是 O(1) 操作，不會複製資料：

```csharp
var data = new byte[1000];
Span<byte> span = data;

// 切片 - 不分配新記憶體
Span<byte> first100 = span.Slice(0, 100);
Span<byte> last100 = span[^100..]; // C# 8.0 Range 語法

// 修改切片會影響原始資料
first100[0] = 42; // data[0] 也變成 42
```

### ReadOnlySpan&lt;T&gt; 與 ReadOnlyMemory&lt;T&gt;

唯讀版本，用於不需要修改的場景：

```csharp
public void ProcessData(ReadOnlySpan<byte> data)
{
    // 無法修改 data
    // data[0] = 1; // 編譯錯誤
}

// 字串可以零分配轉換為 ReadOnlySpan<char>
string text = "Hello World";
ReadOnlySpan<char> span = text.AsSpan();
ReadOnlySpan<char> hello = span.Slice(0, 5); // "Hello"，無分配
```

### 實際應用場景

**1. 字串處理（避免分配）**：
```csharp
// 傳統方式 - 每次 Substring 都分配新字串
string ParseTraditional(string line)
{
    var parts = line.Split(',');
    return parts[0].Trim();
}

// 使用 Span - 零分配
ReadOnlySpan<char> ParseOptimized(ReadOnlySpan<char> line)
{
    int commaIndex = line.IndexOf(',');
    return line.Slice(0, commaIndex).Trim();
}
```

**2. 二進位資料處理**：
```csharp
public int ReadInt32(ReadOnlySpan<byte> buffer)
{
    return BinaryPrimitives.ReadInt32LittleEndian(buffer);
}

public void WriteInt32(Span<byte> buffer, int value)
{
    BinaryPrimitives.WriteInt32LittleEndian(buffer, value);
}
```

**3. 與 stackalloc 結合**：
```csharp
public bool TryParseHex(ReadOnlySpan<char> hex, out byte[] result)
{
    Span<byte> buffer = stackalloc byte[hex.Length / 2];
    
    for (int i = 0; i < buffer.Length; i++)
    {
        if (!byte.TryParse(hex.Slice(i * 2, 2), NumberStyles.HexNumber, null, out buffer[i]))
        {
            result = null;
            return false;
        }
    }
    
    result = buffer.ToArray();
    return true;
}
```

### ArrayPool 與 MemoryPool

搭配 Span/Memory 使用，進一步減少分配：

```csharp
// ArrayPool - 租用和歸還陣列
var pool = ArrayPool<byte>.Shared;
byte[] buffer = pool.Rent(1024); // 可能大於 1024
try
{
    Span<byte> span = buffer.AsSpan(0, 1024);
    // 使用 span
}
finally
{
    pool.Return(buffer);
}

// MemoryPool - 返回 IMemoryOwner<T>
using var owner = MemoryPool<byte>.Shared.Rent(1024);
Memory<byte> memory = owner.Memory.Slice(0, 1024);
```

### Span 的限制

由於 `Span<T>` 是 `ref struct`，有以下限制：
- 不能作為類別的欄位
- 不能被裝箱
- 不能用於 async 方法的 await 之後
- 不能用於 lambda/匿名方法的閉包

```csharp
// 這些都會編譯錯誤
class Bad
{
    Span<int> field; // ❌
}

async Task BadAsync()
{
    Span<int> span = stackalloc int[10];
    await Task.Delay(100); // span 在此之後不能使用
}

void BadLambda()
{
    Span<int> span = stackalloc int[10];
    Action a = () => Console.WriteLine(span[0]); // ❌
}
```

### 效能比較

```
操作                        | 傳統方式        | Span 方式
----------------------------|----------------|------------
字串 Substring              | 分配新字串      | 零分配
陣列切片                    | 複製陣列        | 零分配
解析整數                    | string.Split   | 直接解析
```

## 程式碼範例 (可選)

```csharp
// 高效能 CSV 行解析器
public static class CsvParser
{
    public static bool TryParseRow(
        ReadOnlySpan<char> line,
        Span<Range> fields,
        out int fieldCount)
    {
        fieldCount = 0;
        int start = 0;
        
        for (int i = 0; i < line.Length && fieldCount < fields.Length; i++)
        {
            if (line[i] == ',')
            {
                fields[fieldCount++] = new Range(start, i);
                start = i + 1;
            }
        }
        
        if (start <= line.Length && fieldCount < fields.Length)
        {
            fields[fieldCount++] = new Range(start, line.Length);
        }
        
        return true;
    }
    
    // 使用範例
    public static void Example()
    {
        ReadOnlySpan<char> line = "Alice,30,Engineer";
        Span<Range> fields = stackalloc Range[10];
        
        if (TryParseRow(line, fields, out int count))
        {
            for (int i = 0; i < count; i++)
            {
                ReadOnlySpan<char> field = line[fields[i]];
                Console.WriteLine(field.ToString());
            }
        }
    }
}
```
