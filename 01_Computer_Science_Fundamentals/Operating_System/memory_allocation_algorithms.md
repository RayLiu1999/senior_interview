# 內存分配算法

- **難度**: 5
- **重要程度**: 4
- **標籤**: `堆`, `棧`, `內存池`, `碎片化`, `malloc`, `slab`

## 問題詳述

解釋動態內存分配的各種算法（如首次適配、最佳適配、夥伴系統等），內存碎片化問題，以及現代內存分配器（如 TCMalloc、jemalloc）的優化策略。

## 核心理論與詳解

### 1. 內存分配基礎

#### 棧 vs 堆

```
棧（Stack）:
├─ 自動管理（函數調用/返回時自動分配/釋放）
├─ 大小固定（通常幾MB）
├─ 分配極快（移動棧指針）
├─ 生命週期明確（函數作用域）
└─ 不會有碎片

堆（Heap）:
├─ 手動管理（malloc/free、new/delete）
├─ 大小靈活（只受系統限制）
├─ 分配較慢（需要查找合適的空閒塊）
├─ 生命週期靈活（任意時間釋放）
└─ 可能產生碎片
```

#### 動態內存分配的挑戰

1. **查找速度**：快速找到合適大小的空閒塊
2. **碎片化**：避免產生過多小的無法使用的空閒塊
3. **並發性**：多線程環境下的性能
4. **空間利用率**：最小化元數據開銷

### 2. 經典分配算法

#### 空閒鏈表（Free List）

```
空閒塊鏈表：
[已分配][空閒:100B][已分配][空閒:200B][空閒:50B]
           ↓                  ↓           ↓
        [next] ----------> [next] -----> [next] → NULL
```

每個空閒塊包含：
- 大小信息
- 指向下一個空閒塊的指針

#### (1) 首次適配（First Fit）

**策略**：從頭開始搜索，返回第一個足夠大的空閒塊

```go
// 偽代碼
func firstFit(size int) *Block {
    for block := freeList.head; block != nil; block = block.next {
        if block.size >= size {
            return block  // 返回第一個滿足的塊
        }
    }
    return nil  // 無可用塊
}
```

**優點**：
- 實現簡單
- 搜索速度快（平均）

**缺點**：
- 鏈表前端容易產生小碎片
- 大塊分配可能需要遍歷整個鏈表

#### (2) 最佳適配（Best Fit）

**策略**：搜索整個鏈表，返回大小最接近的空閒塊

```go
func bestFit(size int) *Block {
    var best *Block
    minWaste := maxInt
    
    for block := freeList.head; block != nil; block = block.next {
        if block.size >= size {
            waste := block.size - size
            if waste < minWaste {
                best = block
                minWaste = waste
            }
        }
    }
    return best
}
```

**優點**：
- 減少浪費（最小化剩餘空間）
- 空間利用率高

**缺點**：
- 需要遍歷整個鏈表（性能較差）
- 容易產生大量極小的無用碎片

#### (3) 最差適配（Worst Fit）

**策略**：返回最大的空閒塊

**原理**：留下的剩餘塊更可能被重用

**缺點**：
- 浪費大塊空間
- 實際效果通常不佳

#### (4) 快速適配（Quick Fit）

**策略**：為常見大小維護多個鏈表

```
分離的空閒鏈表：
16B:  [塊] → [塊] → [塊] → NULL
32B:  [塊] → [塊] → NULL
64B:  [塊] → NULL
128B: [塊] → [塊] → [塊] → [塊] → NULL
...
```

**優點**：
- 分配極快（O(1)）
- 無需搜索

**缺點**：
- 合併相鄰空閒塊複雜
- 可能浪費內存（預分配）

### 3. 高級分配算法

#### 夥伴系統（Buddy System）

**核心思想**：
- 內存塊大小為 2 的冪次方（如 1KB, 2KB, 4KB, ...）
- 每個塊可以分裂成兩個相等的"夥伴"
- 釋放時與夥伴合併

**工作流程**：

```
分配 70KB (需要 128KB 塊):

初始: [1024KB]

分裂: [512KB] [512KB]
       ↓
      [256KB] [256KB]
       ↓
      [128KB] [128KB]  ← 分配這個

釋放後與夥伴合併:
[128KB] + [128KB] → [256KB]
[256KB] + [256KB] → [512KB]
...
```

**數據結構**：
```go
type BuddyAllocator struct {
    freeLists [MAX_ORDER][]Block  // 每個 order 一個鏈表
}

// order 0: 4KB
// order 1: 8KB
// order 2: 16KB
// ...
```

**優點**：
- 合併簡單（夥伴地址可計算）
- 碎片化相對較少
- 分配和釋放都是 O(log n)

**缺點**：
- 內部碎片（70KB 請求得到 128KB）
- 只能分配 2 的冪次方大小

**應用**：
- Linux 內核頁分配器
- 一些嵌入式系統

#### Slab 分配器

**核心思想**：
- 為每種對象類型維護專用的內存池
- 預先分配和初始化對象
- 釋放時放回池中而非歸還系統

```
Slab 結構:
┌──────────────────────┐
│    Slab (頁框)       │
├──────────────────────┤
│ [對象] [對象] [對象]  │ ← 同類型對象
│ [對象] [對象] [對象]  │
│ [對象] [對象] [對象]  │
└──────────────────────┘
```

**三層結構**：
```
Cache (對象類型)
  ├─ Slab 1 (全滿)
  ├─ Slab 2 (部分使用) ← 優先從這裡分配
  └─ Slab 3 (全空)
```

**優點**：
- 消除對象初始化開銷
- 減少碎片化
- 緩存友好（同類對象相鄰）

**缺點**：
- 對特定對象類型優化
- 不適合通用分配

**應用**：
- Linux 內核對象分配（task_struct、inode 等）
- 數據庫連接池

### 4. 內存碎片化

#### 外部碎片（External Fragmentation）

空閒內存總量足夠，但無單個連續塊滿足需求：

```
內存布局：
[已用:50][空:30][已用:20][空:40][已用:10][空:50]
         ↑              ↑              ↑
      空閒:30         空閒:40        空閒:50

總空閒: 120KB
請求: 100KB  ← 失敗！（無單個連續塊）
```

**解決方法**：
- 合併相鄰空閒塊
- 內存緊縮（Compaction）：移動已分配塊
- 使用分頁避免連續性要求

#### 內部碎片（Internal Fragmentation）

分配的內存大於請求的大小：

```
請求: 65 字節
分配: 128 字節 (夥伴系統)
浪費: 63 字節 (內部碎片)
```

**解決方法**：
- 減小分配粒度
- 使用多種大小的內存池

### 5. 現代內存分配器

#### TCMalloc (Thread-Caching Malloc)

**Google 開發，用於 Chrome、MySQL 等**

**核心策略**：
```
每個線程有本地緩存（Thread Cache）:
    ├─ 小對象 (≤256KB): 從線程本地分配（無鎖）
    │   └─ 多個大小類別的空閒鏈表
    ├─ 中對象 (≤1MB): 從中央緩存分配（有鎖）
    └─ 大對象 (>1MB): 直接從系統分配（mmap）
```

**小對象分配流程**：
```
1. 查線程本地緩存 → 有則直接返回（極快，無鎖）
2. 從中央緩存批量獲取對象到本地緩存
3. 中央緩存無，則從頁堆分配
4. 頁堆無，則向系統申請
```

**優點**：
- 小對象分配極快（納秒級）
- 減少鎖競爭
- 低碎片化

#### jemalloc

**Facebook 開發，用於 Firefox、Redis 等**

**核心特性**：
- **arena**: 每個 CPU 核心一個 arena（減少競爭）
- **size class**: 精細的大小分類
- **chunk**: 以 4MB 為單位向系統申請
- **run**: chunk 內同大小對象的連續區域

**大小分類**：
```
tiny:   2, 4, 8 bytes
small:  16, 32, 48, ..., 14KB
large:  16KB, 32KB, ..., 4MB
huge:   > 4MB
```

**優點**：
- 並發性能優秀
- 內存碎片少
- 提供豐富的統計和調試功能

#### ptmalloc (glibc malloc)

**Linux 默認分配器**

**特點**：
- **arena**: 主線程一個主 arena，其他線程共享多個 arena
- **bins**: 按大小分類的空閒鏈表
  - Fast bins: 小對象（16-80 字節）
  - Small bins: 512-1024 字節
  - Large bins: >1024 字節
  - Unsorted bin: 臨時存放

**優點**：
- 平衡性能和內存利用率
- 廣泛使用，兼容性好

**缺點**：
- 高並發場景性能不如 TCMalloc/jemalloc

### 6. 內存池技術

#### 固定大小內存池

```go
type MemoryPool struct {
    blockSize int
    freeList  [][]byte
    mu        sync.Mutex
}

func (p *MemoryPool) Alloc() []byte {
    p.mu.Lock()
    defer p.mu.Unlock()
    
    if len(p.freeList) == 0 {
        // 批量分配
        for i := 0; i < 10; i++ {
            p.freeList = append(p.freeList, make([]byte, p.blockSize))
        }
    }
    
    block := p.freeList[len(p.freeList)-1]
    p.freeList = p.freeList[:len(p.freeList)-1]
    return block
}

func (p *MemoryPool) Free(block []byte) {
    p.mu.Lock()
    defer p.mu.Unlock()
    p.freeList = append(p.freeList, block)
}
```

**優點**：
- 消除分配開銷
- 避免碎片化
- 緩存友好

**應用**：
- 網絡緩衝區池
- 數據庫連接池
- 對象池

#### sync.Pool（Go 標準庫）

```go
var bufferPool = sync.Pool{
    New: func() interface{} {
        return make([]byte, 4096)  // 默認構造函數
    },
}

// 獲取
buf := bufferPool.Get().([]byte)

// 使用
// ...

// 歸還
bufferPool.Put(buf)
```

**特點**：
- 自動垃圾回收（GC 時清空池）
- 線程安全
- 適合臨時對象

### 7. 實戰優化技巧

#### (1) 對齊與填充

```go
// ✗ 內存浪費（填充字節）
type BadStruct struct {
    a bool   // 1 byte + 7 padding
    b int64  // 8 bytes
    c bool   // 1 byte + 7 padding
    d int64  // 8 bytes
}  // 總共 32 bytes

// ✓ 優化後（減少填充）
type GoodStruct struct {
    b int64  // 8 bytes
    d int64  // 8 bytes
    a bool   // 1 byte
    c bool   // 1 byte + 6 padding
}  // 總共 24 bytes，節省 25%
```

#### (2) 預分配與容量管理

```go
// ✗ 頻繁重新分配
var data []int
for i := 0; i < 10000; i++ {
    data = append(data, i)  // 多次擴容
}

// ✓ 預分配
data := make([]int, 0, 10000)
for i := 0; i < 10000; i++ {
    data = append(data, i)  // 無擴容
}
```

#### (3) 復用對象

```go
// ✗ 頻繁分配
for i := 0; i < 1000; i++ {
    buf := make([]byte, 4096)
    // 使用 buf
}

// ✓ 復用
buf := make([]byte, 4096)
for i := 0; i < 1000; i++ {
    // 使用 buf
    // 重置內容而非重新分配
}
```

#### (4) 使用 arena 分配器

```go
// 批量分配，統一釋放
type Arena struct {
    buf []byte
    offset int
}

func (a *Arena) Alloc(size int) []byte {
    if a.offset + size > len(a.buf) {
        // 擴展或返回錯誤
    }
    ptr := a.buf[a.offset : a.offset+size]
    a.offset += size
    return ptr
}

// 一次性釋放所有分配
func (a *Arena) Reset() {
    a.offset = 0
}
```

**應用場景**：
- 請求處理（請求結束後統一釋放）
- 編譯器（階段性批量釋放）

### 8. 調試與分析

#### 內存泄漏檢測

```bash
# Go
go test -memprofile=mem.prof
go tool pprof mem.prof

# Valgrind (C/C++)
valgrind --leak-check=full ./program

# AddressSanitizer
gcc -fsanitize=address program.c
```

#### 內存使用分析

```go
// Go 運行時統計
var m runtime.MemStats
runtime.ReadMemStats(&m)

fmt.Printf("Alloc = %v MB\n", m.Alloc/1024/1024)
fmt.Printf("TotalAlloc = %v MB\n", m.TotalAlloc/1024/1024)
fmt.Printf("Sys = %v MB\n", m.Sys/1024/1024)
fmt.Printf("NumGC = %v\n", m.NumGC)
```

## 實際應用場景

### 1. 高性能服務器
- 使用 TCMalloc 或 jemalloc 替換默認分配器
- 預分配緩衝區池
- 使用 arena 分配器處理請求

### 2. 數據庫系統
- Slab 分配器管理內部對象
- 緩衝池管理數據頁
- 大對象使用 mmap

### 3. 遊戲引擎
- 固定大小內存池（GameObject、Component）
- 每幀開始時重置 arena 分配器
- 避免運行時動態分配

### 4. 嵌入式系統
- 靜態內存池（禁止動態分配）
- 夥伴系統（簡單且可預測）
- 栈分配優先

## 總結

### 算法選擇

| 場景 | 推薦算法 |
|------|----------|
| 通用應用 | TCMalloc / jemalloc |
| 內核 | Buddy + Slab |
| 固定大小對象 | 內存池 |
| 臨時對象 | sync.Pool / Arena |
| 嵌入式 | 靜態池 / Buddy |

### 性能優化原則

1. **減少分配次數**：復用、預分配
2. **減少碎片**：合適的分配策略
3. **並發優化**：線程本地緩存
4. **對齊優化**：結構體字段排序
5. **批量操作**：減少系統調用

### 資深工程師需掌握

- 理解不同分配器的優缺點
- 根據應用特徵選擇分配器
- 識別和解決內存碎片化問題
- 使用工具分析內存使用
- 設計高效的內存池
- 理解內存分配對性能的影響
