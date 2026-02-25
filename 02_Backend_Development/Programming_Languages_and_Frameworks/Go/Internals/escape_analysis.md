# Go 逃逸分析 (Escape Analysis)

- **難度**: 7
- **重要程度**: 4
- **標籤**: `Go`, `Escape Analysis`, `記憶體分配`, `Stack`, `Heap`, `效能`

## 問題詳述

**逃逸分析（Escape Analysis）** 是 Go 編譯器在**編譯階段**決定變數分配在 Stack（棧）還是 Heap（堆）的靜態分析過程。理解逃逸分析是優化 Go 程序記憶體使用和減少 GC 壓力的關鍵。

## 核心理論與詳解

### Stack vs Heap 分配的本質差異

| 特性 | Stack（棧） | Heap（堆） |
|-----|-----------|----------|
| 分配速度 | 極快（移動 SP 指針） | 較慢（GC 管理，需找空閒塊） |
| 生命週期 | 函數返回時自動釋放 | 由 GC 負責回收 |
| GC 壓力 | **無 GC 壓力** | 增加 GC 掃描和回收工作 |
| 大小限制 | Goroutine 棧（初始 8KB，可動態增長） | 受可用記憶體限制 |

**結論**：儘量讓變數在 Stack 分配，減少 Heap 分配，可降低 GC 壓力、提升效能。

---

### 逃逸的常見場景

#### 1. 指針逃逸：返回局部變數的指針

```go
// ❌ 逃逸：函數返回局部變數的地址
// Go 編譯器分析到 user 在函數結束後仍被外部引用，必須分配到 Heap
func newUser(name string) *User {
    user := User{Name: name}  // user 逃逸到 Heap
    return &user
}

// ✅ 不逃逸：返回值（值類型），在棧上分配
func newUser(name string) User {
    user := User{Name: name}  // user 在 Stack
    return user  // 值拷貝
}
```

#### 2. 接口賦值逃逸

```go
// ❌ 逃逸：將具體類型賦值給接口，導致值逃逸到 Heap
// 接口的底層需要動態分發，編譯器保守地將值移到 Heap
func process(v interface{}) {
    fmt.Println(v)
}

var x int = 42
process(x) // x 逃逸到 Heap（被裝箱為 interface{}）
```

#### 3. 閉包引用逃逸

```go
// ❌ 逃逸：閉包捕獲外層變數的引用
// x 的生命週期超出了函數範圍（被閉包持有），必須在 Heap
func makeAdder(base int) func(int) int {
    x := base  // x 逃逸到 Heap
    return func(n int) int {
        return x + n  // 閉包引用 x
    }
}
```

#### 4. 大小不確定或過大的變數

```go
// 棧空間有限，過大的對象（通常 > 32KB）自動逃逸到 Heap
func largeAlloc() {
    buf := make([]byte, 64*1024) // 64KB，逃逸到 Heap
    _ = buf
}
```

#### 5. Channel 和 Map 的元素

```go
// 發送到 Channel 的值逃逸（Channel 本身在 Heap，元素需要在 Heap 中存活）
func send(ch chan<- *int) {
    x := 42
    ch <- &x // x 逃逸
}
```

---

### 如何查看逃逸分析結果

```bash
# 編譯時輸出逃逸分析結果
go build -gcflags="-m" ./...

# 更詳細的輸出
go build -gcflags="-m -m" ./...
```

**輸出示例**：
```
./main.go:10:15: &user escapes to heap    ← 確認逃逸
./main.go:15:13: x does not escape        ← 未逃逸（棧分配）
```

---

### 工程實踐：減少不必要的逃逸

1. **謹慎返回指針**：高頻調用的函數返回值類型（非指針），讓調用者決定是否取址
2. **避免高頻 interface{} 轉換**：使用泛型（Go 1.18+）替代 `interface{}`
3. **使用 `sync.Pool` 複用 Heap 物件**：對必須在 Heap 的大物件，透過物件池複用減少 GC
4. **正確使用 `strings.Builder`**：內部使用 `[]byte` 避免中間字符串逃逸

```go
// 效能測試中驗證逃逸影響
func BenchmarkNoEscape(b *testing.B) {
    for i := 0; i < b.N; i++ {
        // 棧分配，無 GC 壓力
        _ = newUser("Alice")  // 返回值類型
    }
}

func BenchmarkEscape(b *testing.B) {
    for i := 0; i < b.N; i++ {
        // Heap 分配，有 GC 壓力
        _ = newUserPtr("Alice")  // 返回指針
    }
}
```
