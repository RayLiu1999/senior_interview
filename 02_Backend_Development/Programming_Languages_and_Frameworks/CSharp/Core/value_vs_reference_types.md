# 值型別與參考型別

- **難度**: 5
- **標籤**: `Value Type`, `Reference Type`, `Stack`, `Heap`

## 問題詳述

在 C# 中，值型別（Value Type）與參考型別（Reference Type）是型別系統的兩大支柱。理解它們的本質區別，包括記憶體配置、複製行為和效能影響，是撰寫高效 C# 程式碼的關鍵。

## 核心理論與詳解

### 值型別（Value Types）

值型別直接儲存資料本身，而非資料的參考。當進行賦值或傳遞時，會複製整個值。

**主要的值型別包括**：
- **基本型別**：`int`、`float`、`double`、`bool`、`char` 等
- **結構（struct）**：自訂的值型別，如 `DateTime`、`TimeSpan`、`Guid`
- **列舉（enum）**：例如 `DayOfWeek`、`FileMode`
- **可為空值型別**：`int?`、`DateTime?`（實際上是 `Nullable<T>` 結構）

**記憶體配置**：
- 作為區域變數時，通常配置在 **棧（Stack）** 上
- 作為類別的欄位時，隨物件配置在 **堆（Heap）** 上
- 作為陣列元素時，連續配置在堆上

### 參考型別（Reference Types）

參考型別儲存的是資料在堆上的位址（參考），而非資料本身。

**主要的參考型別包括**：
- **類別（class）**：所有自訂類別，包括 `string`
- **介面（interface）**
- **委派（delegate）**
- **陣列（array）**：即使是值型別的陣列，陣列本身也是參考型別
- **record**（C# 9+）

**記憶體配置**：
- 參考變數本身儲存在棧上（固定大小，通常 4 或 8 位元組）
- 實際物件資料配置在 **堆（Heap）** 上

### 核心差異比較

| 特性 | 值型別 | 參考型別 |
|------|--------|----------|
| **記憶體位置** | 通常在棧上（或內嵌） | 堆上 |
| **賦值行為** | 複製整個值 | 複製參考（指標） |
| **預設值** | 0 或等效值 | null |
| **繼承** | 隱式繼承 `System.ValueType` | 可繼承其他類別 |
| **可為 null** | 需使用 `Nullable<T>` | 原生支援 null |
| **相等性比較** | 預設比較值 | 預設比較參考 |

### 複製行為的差異

這是最關鍵的差異，直接影響程式行為：

```csharp
// 值型別 - 複製整個值
struct Point { public int X, Y; }
Point p1 = new Point { X = 1, Y = 2 };
Point p2 = p1;  // 複製整個結構
p2.X = 100;     // 修改 p2 不影響 p1
// p1.X 仍然是 1

// 參考型別 - 複製參考
class PointClass { public int X, Y; }
PointClass pc1 = new PointClass { X = 1, Y = 2 };
PointClass pc2 = pc1;  // 複製參考，指向同一物件
pc2.X = 100;           // 修改會影響 pc1
// pc1.X 變成 100
```

### 裝箱與拆箱（Boxing and Unboxing）

當值型別需要以參考型別方式處理時，會發生裝箱：

**裝箱（Boxing）**：
- 在堆上配置記憶體
- 將值複製到堆上的物件中
- 返回物件的參考

**拆箱（Unboxing）**：
- 檢查物件是否為正確的型別
- 將值從堆上複製回棧上

```csharp
int value = 42;
object boxed = value;    // 裝箱：配置堆記憶體，複製值
int unboxed = (int)boxed; // 拆箱：型別檢查，複製值回來
```

> **效能警示**：頻繁的裝箱/拆箱會造成額外的記憶體配置和 GC 壓力，應盡量避免。

### 方法參數傳遞

理解參數傳遞方式對於避免錯誤至關重要：

| 傳遞方式 | 值型別 | 參考型別 |
|----------|--------|----------|
| **傳值（預設）** | 複製整個值 | 複製參考（可修改物件內容） |
| **ref** | 傳遞變數參考 | 傳遞參考的參考 |
| **out** | 同 ref，但必須在方法內賦值 | 同上 |
| **in** | 唯讀參考（避免複製大結構） | 唯讀參考 |

### 選擇值型別還是參考型別

**選擇值型別（struct）的時機**：
- 資料大小小於 16 位元組
- 邏輯上表示單一值（如座標、複數）
- 不可變（Immutable）設計
- 不需要頻繁裝箱
- 短生命週期，頻繁建立和銷毀

**選擇參考型別（class）的時機**：
- 需要繼承階層
- 資料較大
- 需要可變性且共享狀態
- 資料需要被多處參考和修改

### 效能考量

**值型別的優勢**：
- 無 GC 壓力（棧上配置時）
- 資料局部性好（連續記憶體）
- 無空參考風險

**值型別的劣勢**：
- 大結構複製開銷高
- 無法為 null（需使用 Nullable<T>）
- 裝箱有效能成本

## 程式碼範例 (可選)

```csharp
// 展示值型別與參考型別的行為差異
public struct ValuePoint { public int X; public int Y; }
public class RefPoint { public int X; public int Y; }

public void DemoTypeDifferences()
{
    // 值型別：各自獨立
    ValuePoint vp1 = new ValuePoint { X = 1, Y = 2 };
    ValuePoint vp2 = vp1;
    vp2.X = 999;
    Console.WriteLine($"vp1.X = {vp1.X}"); // 輸出: 1（未受影響）

    // 參考型別：共享物件
    RefPoint rp1 = new RefPoint { X = 1, Y = 2 };
    RefPoint rp2 = rp1;
    rp2.X = 999;
    Console.WriteLine($"rp1.X = {rp1.X}"); // 輸出: 999（被修改了）
}
```
