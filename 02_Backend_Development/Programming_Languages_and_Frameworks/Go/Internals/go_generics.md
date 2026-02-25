# Go 泛型 (Generics) - Go 1.18+

- **難度**: 6
- **重要程度**: 4
- **標籤**: `Go`, `Generics`, `Type Parameters`, `Constraints`, `Go 1.18`

## 問題詳述

Go 1.18（2022年）引入了**泛型（Generics）**，透過**型別參數（Type Parameters）**讓函數和類型可以處理多種類型，避免了大量重複代碼和 `interface{}` 帶來的型別不安全和效能損失。

## 核心理論與詳解

### 為什麼需要泛型？

**Before（Go 1.17，使用 interface{}）**：
```go
// 只能接受 interface{}，使用時需要類型斷言，有執行時 panic 風險
func Contains(slice []interface{}, item interface{}) bool {
    for _, v := range slice {
        if v == item {
            return true
        }
    }
    return false
}

// 如果想要類型安全，需要為每種類型寫一個版本
func ContainsString(slice []string, item string) bool { ... }
func ContainsInt(slice []int, item int) bool { ... }
```

**After（Go 1.18+，使用泛型）**：
```go
// 一個函數處理所有 comparable 類型，編譯時類型安全
func Contains[T comparable](slice []T, item T) bool {
    for _, v := range slice {
        if v == item {
            return true
        }
    }
    return false
}

// 使用：類型可由編譯器推斷
Contains([]string{"a", "b", "c"}, "b")  // true
Contains([]int{1, 2, 3}, 4)              // false
```

---

### 核心語法

#### 型別參數（Type Parameters）

```go
// 函數泛型：[T constraint] 聲明型別參數
func Map[T, U any](slice []T, f func(T) U) []U {
    result := make([]U, len(slice))
    for i, v := range slice {
        result[i] = f(v)
    }
    return result
}

// 使用
doubled := Map([]int{1, 2, 3}, func(x int) int { return x * 2 })
// doubled = [2, 4, 6]

strs := Map([]int{1, 2, 3}, func(x int) string { return fmt.Sprint(x) })
// strs = ["1", "2", "3"]
```

#### 型別約束（Type Constraints）

```go
// 使用 interface 作為約束
type Number interface {
    ~int | ~int8 | ~int16 | ~int32 | ~int64 |
    ~float32 | ~float64
}

func Sum[T Number](slice []T) T {
    var total T
    for _, v := range slice {
        total += v
    }
    return total
}

// 使用（類型推斷）
Sum([]int{1, 2, 3, 4})       // 10
Sum([]float64{1.1, 2.2, 3.3}) // 6.6
```

**常用內建約束（`golang.org/x/exp/constraints` 或自定義）**：
- `any`：等同 `interface{}`，無限制
- `comparable`：可用 `==` 比較的類型（用於 Map 的 Key）
- `~T`：底層類型為 T 的所有類型（包含自定義類型）

#### 泛型結構體

```go
// 泛型棧（Stack）
type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(item T) {
    s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() (T, bool) {
    if len(s.items) == 0 {
        var zero T
        return zero, false
    }
    item := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return item, true
}

// 使用
var intStack Stack[int]
intStack.Push(1)
intStack.Push(2)
v, _ := intStack.Pop() // v = 2
```

---

### 泛型的實現機制（GCShape Stenciling）

Go 使用 **GCShape（垃圾回收形狀）Stenciling** 策略：
- 具有**相同 GC 形狀**（相同大小、相同指針佈局）的類型**共享同一份代碼實現**
- 例如：`*int`、`*string`、`*MyStruct` 都是指針（8 字節），共享同一份泛型函數代碼
- 而 `int32`（4 字節）和 `int64`（8 字節）大小不同，各自生成一份代碼

**效能影響**：
- 泛型函數的效能**通常介於直接類型函數（最快）和 interface{} 函數（最慢）之間**
- 對指針類型，因共享代碼，效能接近 interface{}（有字典查找開銷）
- 對值類型（如 int），可能生成專用代碼，效能接近直接類型函數

---

### 泛型的限制（Go 1.21）

1. **不支援方法上的額外型別參數**：類型的方法只能使用類型本身的型別參數
    ```go
    type Foo[T any] struct{}
    // ❌ 不支援
    func (f Foo[T]) DoSomething[U any](u U) {}

    // ✅ 使用頂級函數替代
    func DoSomething[T, U any](f Foo[T], u U) {}
    ```
2. **泛型類型不能直接作為類型斷言的目標**
3. **標準庫的泛型工具在 `slices`、`maps` 包（Go 1.21+）**：
    ```go
    import "slices"
    slices.Contains([]int{1, 2, 3}, 2) // true
    slices.Sort([]int{3, 1, 2})         // [1, 2, 3]
    ```
