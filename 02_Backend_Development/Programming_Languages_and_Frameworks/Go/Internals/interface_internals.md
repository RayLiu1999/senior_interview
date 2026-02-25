# Go 接口底層實現 (Interface Internals)

- **難度**: 7
- **重要程度**: 4
- **標籤**: `Go`, `Interface`, `iface`, `eface`, `底層實現`, `反射`

## 問題詳述

Go 的接口（Interface）是其類型系統的核心。理解接口的**底層資料結構（iface vs eface）**、**動態分派機制**，以及接口帶來的**效能影響**，是深入理解 Go 執行時行為的關鍵。

## 核心理論與詳解

### 接口的兩種底層結構

Go 在記憶體中有**兩種不同的接口表示**：

#### 1. `iface`（帶方法的接口）

```go
// 例如：io.Reader
type Reader interface {
    Read(p []byte) (n int, err error)
}
```

```
iface 的記憶體佈局（16 字節，兩個指針）:
┌───────────────┬───────────────┐
│  *itab        │  *data        │
│  (接口元資料) │  (實際資料)   │
└───────────────┴───────────────┘

itab 結構（關鍵！）:
┌──────────────────────────────────────┐
│ *interfacetype  ← 接口類型定義       │
│ *concretetype   ← 具體類型定義       │
│ hash            ← 具體類型的類型哈希  │
│ [func pointers] ← 接口方法的函數指針表 │
└──────────────────────────────────────┘
```

**itab 是接口的核心**：當一個具體類型第一次賦值給某個接口類型時，Go 運行時（runtime）查找或構建 `itab`，填充函數指針表。之後的方法調用就是**通過函數指針間接調用**（Dynamic Dispatch）。

#### 2. `eface`（空接口 `interface{}`）

```go
var x interface{} = 42
```

```
eface 的記憶體佈局（16 字節，兩個指針）:
┌───────────────┬───────────────┐
│  *_type       │  *data        │
│  (類型元資料) │  (實際資料)   │
└───────────────┴───────────────┘

_type 比 itab 更簡單：只有類型資訊，沒有方法指針表
```

---

### 接口的動態分派（Dynamic Dispatch）

```go
type Animal interface { Sound() string }
type Dog struct{}
func (d Dog) Sound() string { return "Woof" }
type Cat struct{}
func (c Cat) Sound() string { return "Meow" }

func makeSound(a Animal) string {
    return a.Sound()  // ← 動態分派：運行時查 itab 中的 Sound 函數指針
}
```

**與 C++ 虛函數表的類比**：Go 的 itab 類似 C++ 的 vtable，但 Go 是在「賦值給接口時」構建方法指針表，而 C++ 是在「定義類型時」構建。

**效能影響**：
- 直接方法調用：直接 CALL 指令，O(1)，CPU 可以分支預測
- 接口方法調用：通過 itab 中函數指針的間接 CALL，多一次記憶體讀取，**阻礙 CPU 分支預測和內聯優化**

---

### 接口的重要行為

#### nil 接口 vs 含 nil 值的接口

```go
// ❌ 常見陷阱：含 nil 具體值的接口不等於 nil 接口
func newError(fail bool) error {
    var p *os.PathError = nil
    if fail {
        p = &os.PathError{Err: os.ErrNotExist}
    }
    return p  // ← 問題！返回了含 nil *os.PathError 的接口
    // iface{itab: *os.PathError_itab, data: nil} ≠ nil
}

err := newError(false)
if err != nil {  // ← 這裡是 true！因為 itab 不為 nil
    fmt.Println("error:", err)  // 被觸發
}

// ✅ 修正：明確返回 nil（接口零值）
func newError(fail bool) error {
    if fail {
        return &os.PathError{Err: os.ErrNotExist}
    }
    return nil  // ← iface{itab: nil, data: nil} == nil
}
```

#### 類型斷言（Type Assertion）

```go
var r io.Reader = os.Stdin  // r 是 iface

// 單返回值（失敗時 panic）
f := r.(*os.File)  // 若 r 不是 *os.File，panic

// 雙返回值（安全，推薦）
f, ok := r.(*os.File)
if ok {
    // 使用 f
}

// 類型 Switch（多類型判斷）
switch v := r.(type) {
case *os.File:
    fmt.Println("file:", v.Name())
case *bytes.Buffer:
    fmt.Println("buffer, len:", v.Len())
default:
    fmt.Println("unknown type")
}
```

---

### 接口的效能優化建議

1. **小接口勝於大接口**：方法越少，itab 越小；實現越多類型可複用同一接口
2. **避免高頻次 `interface{}` 裝箱**：每次裝箱（具體類型轉 `interface{}`）可能引發 Heap 分配
3. **Go 1.18+ 泛型替代 `interface{}`**：對內部算法使用泛型代替 `interface{}`，可獲得靜態分派的效能
4. **使用 `go tool pprof` 確認接口開銷**：通過 CPU profile 觀察是否存在大量 `runtime.mallocgc`（interface boxing 的痕跡）
