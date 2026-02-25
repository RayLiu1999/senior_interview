# sync.Pool：物件池與 GC 壓力降低

- **難度**: 6
- **重要程度**: 4
- **標籤**: `Go`, `sync.Pool`, `物件池`, `GC`, `效能優化`

## 問題詳述

`sync.Pool` 是 Go 標準庫中用於**緩存和複用臨時物件**的機制。對於高頻創建和銷毀的短生命週期物件（如 buffer、parser 結構體），使用 `sync.Pool` 可以顯著減少 Heap 分配次數、降低 GC 壓力，是 Go 高效能程式碼中的常見優化手段。

## 核心理論與詳解

### sync.Pool 的設計目標

```
問題場景（高並發 HTTP 服務）：
每個請求 → 分配 bytes.Buffer → 使用（序列化/記錄日誌）→ GC 回收
                  ↑ 大量臨時分配，GC 頻繁觸發

使用 sync.Pool：
每個請求 → 從 Pool 取 bytes.Buffer → 使用 → 歸還給 Pool → 下次請求複用
                  ↑ Pool 中的物件在 GC 時可能被回收，但通常能被複用
```

**核心特性**：
- Pool 中的物件**可能在任意一次 GC 時被回收**（不保證持久）
- 適合**臨時、可重置**的物件，不適合需要持久狀態的物件
- 內部有**per-P（每個 P 一個）** 的局部緩存，減少鎖競爭

---

### 基本使用模式

```go
package main

import (
    "bytes"
    "sync"
)

// 定義 Pool，New 函數在 Pool 空時被調用以建立新物件
var bufPool = sync.Pool{
    New: func() interface{} {
        return &bytes.Buffer{}
    },
}

func processRequest(data []byte) []byte {
    // 從 Pool 取物件（若 Pool 為空，調用 New 創建）
    buf := bufPool.Get().(*bytes.Buffer)
    
    // 使用前重置狀態（關鍵！避免前次使用的髒資料）
    buf.Reset()
    
    // 使用物件
    buf.Write(data)
    buf.WriteString(" processed")
    result := make([]byte, buf.Len())
    copy(result, buf.Bytes())
    
    // 使用完畢後歸還給 Pool（不要在 defer 中忘記）
    bufPool.Put(buf)
    
    return result
}
```

---

### 最佳實踐與注意事項

**1. 歸還前必須重置狀態**

```go
// ❌ 危險：未重置就歸還，下次取出時有髒資料
buf := bufPool.Get().(*bytes.Buffer)
buf.Write(someData)
bufPool.Put(buf)  // buf 內仍有 someData

// ✅ 正確：Reset 後再 Put
buf.Reset()
bufPool.Put(buf)
```

**2. 不要在 Pool 中存儲含指針的物件引用（避免記憶體洩漏）**

```go
// ❌ 危險：Pool 中的物件持有大型外部資源
type Worker struct {
    LargeBuffer [1024 * 1024]byte  // 1MB 固定大小
    conn        net.Conn            // 持有外部連線
}
// pool 中的 Worker 在 GC 時被回收，但 conn 不會自動關閉
```

**3. 物件大小不確定時的處理**

```go
// 若物件大小可能差異很大，歸還前檢查大小
var bigBufPool = sync.Pool{
    New: func() interface{} {
        b := make([]byte, 0, 4096) // 初始容量 4KB
        return &b
    },
}

func putBuf(p *[]byte) {
    // 若緩衝區已增長過大（例如 > 64KB），丟棄而不歸還
    // 避免大緩衝區佔據 Pool，使其他 Goroutine 取到超大緩衝
    if cap(*p) > 64*1024 {
        return
    }
    *p = (*p)[:0]  // 重置長度但保留容量
    bigBufPool.Put(p)
}
```

---

### 真實案例：標準庫中的 sync.Pool

**`encoding/json`**：
- Scanner、Encoder 等物件透過 `sync.Pool` 複用
- 顯著降低高並發 JSON 序列化的記憶體分配

**`net/http`**：
- HTTP 服務器中的 Response Writer buffer 使用 Pool 複用

**`fmt`**：
- `fmt.Fprintf`、`fmt.Sprintf` 內部的格式化 buffer 使用 Pool

---

### 效能對比（Benchmark）

```go
var pool = sync.Pool{New: func() interface{} { return &bytes.Buffer{} }}

// 不使用 Pool
func BenchmarkWithoutPool(b *testing.B) {
    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() {
            buf := &bytes.Buffer{}
            buf.WriteString("hello world")
            _ = buf.String()
        }
    })
}

// 使用 Pool
func BenchmarkWithPool(b *testing.B) {
    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() {
            buf := pool.Get().(*bytes.Buffer)
            buf.Reset()
            buf.WriteString("hello world")
            _ = buf.String()
            pool.Put(buf)
        }
    })
}
// 結果：WithPool 通常快 3-10 倍，allocs/op 從 1 降至 0（Pool 命中時）
```
