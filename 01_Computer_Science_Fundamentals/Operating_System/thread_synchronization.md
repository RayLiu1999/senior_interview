# 線程同步機制

- **難度**: 7
- **重要程度**: 5
- **標籤**: `互斥鎖`, `信號量`, `條件變量`, `讀寫鎖`, `自旋鎖`, `死鎖`

## 問題詳述

解釋多線程環境下的各種同步機制，包括互斥鎖（Mutex）、信號量（Semaphore）、條件變量（Condition Variable）、讀寫鎖（RWLock）、自旋鎖（Spinlock）等，以及它們的適用場景和死鎖問題。

## 核心理論與詳解

### 1. 為什麼需要線程同步

#### 競爭條件（Race Condition）

多個線程同時訪問共享資源，結果取決於執行順序：

```go
// 不安全的計數器
var counter int = 0

// 線程1和線程2同時執行
func increment() {
    counter++  // 非原子操作
}

// 競爭條件示例:
// 線程1: 讀取 counter=0
// 線程2: 讀取 counter=0
// 線程1: 寫入 counter=1
// 線程2: 寫入 counter=1  ← 應該是 2！
```

#### 臨界區（Critical Section）

訪問共享資源的代碼段，必須保證互斥訪問：

```
進入臨界區的條件:
1. 互斥（Mutual Exclusion）：同一時刻只能有一個線程在臨界區
2. 進步（Progress）：若無線程在臨界區，想進入的線程應能進入
3. 有限等待（Bounded Waiting）：線程等待進入臨界區的時間有限
```

### 2. 互斥鎖（Mutex）

#### 基本概念

**Mutex（Mutual Exclusion）** 提供最基本的互斥機制：
- 只有兩種狀態：鎖定（Locked）/ 未鎖定（Unlocked）
- 同一時刻只有一個線程可持有鎖
- 其他線程必須等待鎖釋放

#### 使用方式

```go
import "sync"

var mu sync.Mutex
var sharedData int

func safeIncrement() {
    mu.Lock()         // 獲取鎖
    defer mu.Unlock() // 釋放鎖（保證執行）
    
    // 臨界區
    sharedData++
}
```

#### 實現原理

**基於原子操作（Compare-And-Swap, CAS）**：

```go
// 簡化的鎖實現
type Mutex struct {
    state int32  // 0: unlocked, 1: locked
}

func (m *Mutex) Lock() {
    for {
        // 嘗試將 state 從 0 改為 1
        if atomic.CompareAndSwapInt32(&m.state, 0, 1) {
            return  // 成功獲取鎖
        }
        // 失敗：繼續嘗試或休眠
        runtime.Gosched()  // 讓出 CPU
    }
}

func (m *Mutex) Unlock() {
    atomic.StoreInt32(&m.state, 0)  // 釋放鎖
}
```

#### 鎖的類型

**1. 普通鎖（Non-recursive）**
- 同一線程重複加鎖會死鎖
- 性能最優

**2. 遞歸鎖（Recursive Mutex）**
- 同一線程可多次加鎖
- 需要記錄持有者和計數
- 性能稍差

```go
type RecursiveMutex struct {
    mu    sync.Mutex
    owner int64  // 持有者線程ID
    count int    // 重入次數
}
```

**3. 公平鎖 vs 非公平鎖**

```
非公平鎖（默認）:
- 後來的線程可能先獲得鎖
- 性能更好（減少上下文切換）
- 可能導致飢餓

公平鎖:
- 嚴格按請求順序分配
- 保證無飢餓
- 性能較差（需要維護隊列）
```

#### 適用場景

- 保護共享數據結構
- 臨界區較大（持有時間長）
- 不頻繁競爭

### 3. 自旋鎖（Spinlock）

#### 特點

- 獲取鎖失敗時**不休眠，而是忙等待（spin）**
- 適合持有時間極短的臨界區
- 避免上下文切換的開銷

```go
type Spinlock struct {
    flag int32
}

func (s *Spinlock) Lock() {
    for !atomic.CompareAndSwapInt32(&s.flag, 0, 1) {
        // 忙等待，持續嘗試
    }
}

func (s *Spinlock) Unlock() {
    atomic.StoreInt32(&s.flag, 0)
}
```

#### Mutex vs Spinlock

| 特性 | Mutex | Spinlock |
|------|-------|----------|
| 等待方式 | 休眠 | 忙等待（CPU spin） |
| 上下文切換 | 有 | 無 |
| CPU 使用 | 低 | 高（持續占用） |
| 適用臨界區 | 長 | 極短（幾十納秒） |
| 使用場景 | 用戶態、一般應用 | 內核態、高性能場景 |

**選擇建議**：
```
臨界區 < 上下文切換時間 → 使用 Spinlock
臨界區 > 上下文切換時間 → 使用 Mutex
```

### 4. 讀寫鎖（Read-Write Lock）

#### 特點

- 允許**多個讀者同時訪問**
- **寫者獨占訪問**
- 適合讀多寫少的場景

#### 鎖模式

```
模式          | 可共享 | 典型操作
-------------|--------|----------
讀鎖 (RLock) | 是     | 查詢、遍歷
寫鎖 (Lock)  | 否     | 修改、刪除
```

#### 使用方式

```go
import "sync"

var rwmu sync.RWMutex
var data map[string]int

// 讀操作：共享訪問
func read(key string) int {
    rwmu.RLock()
    defer rwmu.RUnlock()
    return data[key]
}

// 寫操作：獨占訪問
func write(key string, value int) {
    rwmu.Lock()
    defer rwmu.Unlock()
    data[key] = value
}
```

#### 公平性問題

**讀者優先**：
- 有讀者時，後續讀者可直接獲取鎖
- 問題：寫者可能飢餓

**寫者優先**：
- 有寫者等待時，新讀者需等待
- 避免寫者飢餓

**公平策略**：
- 按請求順序排隊
- 平衡讀寫性能

#### 性能對比

```
場景          | Mutex | RWMutex | 改善
-------------|-------|---------|------
讀多寫少     | 低    | 高      | 顯著
讀寫平衡     | 中    | 中      | 略優
寫多讀少     | 高    | 低      | 可能更差
```

### 5. 信號量（Semaphore）

#### 概念

信號量是一個整數計數器，用於控制對共享資源的訪問數量。

```
計數信號量 (Counting Semaphore):
- 初始值 N：允許 N 個線程同時訪問
- P 操作（Wait/Down）：計數器 -1，若 ≤ 0 則阻塞
- V 操作（Signal/Up）：計數器 +1，喚醒等待的線程

二元信號量 (Binary Semaphore):
- 初始值 1：功能類似 Mutex
- 區別：Mutex 有所有權，信號量沒有
```

#### 使用示例

```go
// Go 中使用 channel 實現信號量
type Semaphore chan struct{}

func NewSemaphore(n int) Semaphore {
    return make(chan struct{}, n)
}

func (s Semaphore) Acquire() {
    s <- struct{}{}  // P 操作
}

func (s Semaphore) Release() {
    <-s  // V 操作
}

// 使用：限制並發數為 3
sem := NewSemaphore(3)

for i := 0; i < 10; i++ {
    sem.Acquire()
    go func() {
        defer sem.Release()
        // 最多 3 個 goroutine 同時執行
        doWork()
    }()
}
```

#### 應用場景

1. **限流器**：控制併發請求數
2. **資源池**：數據庫連接池、線程池
3. **生產者-消費者**：配合兩個信號量（empty、full）

#### Mutex vs Semaphore

| 特性 | Mutex | Semaphore |
|------|-------|-----------|
| 所有權 | 有（必須由加鎖者解鎖） | 無（任何線程可操作） |
| 用途 | 互斥 | 同步、計數 |
| 初始值 | 總是 1 | 任意正整數 |

### 6. 條件變量（Condition Variable）

#### 概念

條件變量用於線程間的**事件通知**，配合 Mutex 使用。

```
典型用法:
1. 線程A獲取鎖，檢查條件
2. 條件不滿足，調用 Wait（釋放鎖並休眠）
3. 線程B修改條件，調用 Signal/Broadcast（喚醒線程A）
4. 線程A被喚醒，重新獲取鎖，再次檢查條件
```

#### 使用方式

```go
import "sync"

var mu sync.Mutex
var cond = sync.NewCond(&mu)
var ready bool

// 等待者
func waiter() {
    mu.Lock()
    for !ready {  // ← 必須使用 while 而非 if
        cond.Wait()  // 釋放鎖並等待
    }
    // ready == true，執行任務
    mu.Unlock()
}

// 通知者
func notifier() {
    mu.Lock()
    ready = true
    cond.Signal()     // 喚醒一個等待者
    // cond.Broadcast() // 喚醒所有等待者
    mu.Unlock()
}
```

#### 為什麼必須用 while 而非 if

**虛假喚醒（Spurious Wakeup）**：
- 線程可能在沒有 Signal 時被喚醒
- 多個等待者可能同時被喚醒（競爭條件）
- 必須重新檢查條件

```go
// ✗ 錯誤：使用 if
if !ready {
    cond.Wait()
}
// 可能虛假喚醒，ready 仍為 false

// ✓ 正確：使用 while
for !ready {
    cond.Wait()
}
// 重新檢查條件，確保 ready == true
```

#### Signal vs Broadcast

```go
cond.Signal()     // 喚醒一個等待者
cond.Broadcast()  // 喚醒所有等待者

// 使用場景：
// Signal: 生產者-消費者（一個商品對應一個消費者）
// Broadcast: 全局狀態變化（如關閉事件）
```

#### 經典模式：生產者-消費者

```go
var queue []int
var mu sync.Mutex
var notEmpty = sync.NewCond(&mu)
var notFull = sync.NewCond(&mu)
const capacity = 10

// 生產者
func producer(item int) {
    mu.Lock()
    defer mu.Unlock()
    
    for len(queue) == capacity {
        notFull.Wait()  // 隊列滿，等待
    }
    
    queue = append(queue, item)
    notEmpty.Signal()  // 通知消費者
}

// 消費者
func consumer() int {
    mu.Lock()
    defer mu.Unlock()
    
    for len(queue) == 0 {
        notEmpty.Wait()  // 隊列空，等待
    }
    
    item := queue[0]
    queue = queue[1:]
    notFull.Signal()  // 通知生產者
    return item
}
```

### 7. 原子操作（Atomic Operations）

#### 特點

- **硬件級原子性**：不可被中斷
- **無鎖（Lock-Free）**：不需要鎖，性能最優
- 適用於簡單的共享變量

#### 常見原子操作

```go
import "sync/atomic"

var counter int64

// 原子加法
atomic.AddInt64(&counter, 1)

// 原子讀取
val := atomic.LoadInt64(&counter)

// 原子寫入
atomic.StoreInt64(&counter, 100)

// CAS（Compare-And-Swap）
swapped := atomic.CompareAndSwapInt64(&counter, 100, 200)
// 若 counter == 100，設置為 200，返回 true
```

#### 無鎖數據結構

```go
// 無鎖棧（簡化版）
type LockFreeStack struct {
    head unsafe.Pointer  // *Node
}

type Node struct {
    value int
    next  *Node
}

func (s *LockFreeStack) Push(v int) {
    node := &Node{value: v}
    for {
        old := atomic.LoadPointer(&s.head)
        node.next = (*Node)(old)
        if atomic.CompareAndSwapPointer(&s.head, old, unsafe.Pointer(node)) {
            return
        }
        // CAS 失敗，重試
    }
}
```

### 8. 死鎖問題

#### 死鎖的四個必要條件

1. **互斥**：資源不可共享
2. **持有並等待**：已持有資源並等待其他資源
3. **不可搶占**：資源不能被強制奪回
4. **循環等待**：存在資源等待環

#### 死鎖示例

```go
var mu1, mu2 sync.Mutex

// 線程1
func thread1() {
    mu1.Lock()
    time.Sleep(1 * time.Millisecond)
    mu2.Lock()  // 等待 mu2
    mu2.Unlock()
    mu1.Unlock()
}

// 線程2
func thread2() {
    mu2.Lock()
    time.Sleep(1 * time.Millisecond)
    mu1.Lock()  // 等待 mu1 → 死鎖！
    mu1.Unlock()
    mu2.Unlock()
}
```

#### 避免死鎖

**1. 鎖排序**
```go
// 為所有鎖定義全局順序
func lockInOrder(a, b *sync.Mutex) {
    if uintptr(unsafe.Pointer(a)) < uintptr(unsafe.Pointer(b)) {
        a.Lock()
        b.Lock()
    } else {
        b.Lock()
        a.Lock()
    }
}
```

**2. 嘗試加鎖（Try-Lock）**
```go
// 使用超時機制
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

select {
case <-acquireLock(mu):
    // 獲取成功
case <-ctx.Done():
    // 超時，避免死鎖
}
```

**3. 避免嵌套鎖**
- 盡量減少同時持有多個鎖
- 縮小臨界區範圍

**4. 使用死鎖檢測工具**
- Go: `go run -race`（競爭檢測器）
- Java: JConsole, VisualVM
- Linux: `pstack` 查看線程堆棧

### 9. 高級同步機制

#### 1. 屏障（Barrier）

等待所有線程到達某個點後再繼續：

```go
var wg sync.WaitGroup

func worker(id int) {
    // 階段1
    doPhase1(id)
    
    wg.Done()   // 完成階段1
    wg.Wait()   // 等待所有線程完成階段1
    
    // 階段2（所有線程同步開始）
    doPhase2(id)
}
```

#### 2. 一次性執行（Once）

確保某個函數只執行一次：

```go
var once sync.Once
var instance *Singleton

func GetInstance() *Singleton {
    once.Do(func() {
        instance = &Singleton{}  // 只執行一次
    })
    return instance
}
```

#### 3. 計數器（WaitGroup）

等待一組 goroutine 完成：

```go
var wg sync.WaitGroup

for i := 0; i < 10; i++ {
    wg.Add(1)
    go func(id int) {
        defer wg.Done()
        doWork(id)
    }(i)
}

wg.Wait()  // 等待所有 goroutine 完成
```

### 10. 性能優化

#### 減少鎖競爭

**1. 縮小臨界區**
```go
// ✗ 臨界區過大
mu.Lock()
data := fetchFromDB()     // 慢
processData(data)          // 慢
result = computeResult()
mu.Unlock()

// ✓ 只保護必要部分
data := fetchFromDB()
processData(data)
result = computeResult()

mu.Lock()
sharedState = result  // 只鎖這部分
mu.Unlock()
```

**2. 鎖分段（Lock Striping）**
```go
// Java ConcurrentHashMap 的策略
type ShardedMap struct {
    shards [16]struct {
        mu   sync.Mutex
        data map[string]int
    }
}

func (m *ShardedMap) Get(key string) int {
    shard := &m.shards[hash(key)%16]  // 選擇分片
    shard.mu.Lock()
    defer shard.mu.Unlock()
    return shard.data[key]
}
```

**3. 讀寫分離**
- 使用 RWMutex 替代 Mutex
- 使用 atomic 替代鎖

**4. 無鎖算法**
- 適用於簡單操作
- 使用 CAS 實現

## 實際應用場景

### 1. 緩存系統
```go
type Cache struct {
    mu   sync.RWMutex
    data map[string]interface{}
}

func (c *Cache) Get(key string) interface{} {
    c.mu.RLock()
    defer c.mu.RUnlock()
    return c.data[key]  // 讀操作使用讀鎖
}

func (c *Cache) Set(key string, value interface{}) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.data[key] = value  // 寫操作使用寫鎖
}
```

### 2. 連接池
```go
type Pool struct {
    conns chan *Conn
}

func (p *Pool) Get() *Conn {
    return <-p.conns  // 信號量模式
}

func (p *Pool) Put(conn *Conn) {
    p.conns <- conn
}
```

### 3. 任務調度
```go
type Scheduler struct {
    mu    sync.Mutex
    cond  *sync.Cond
    tasks []Task
}

func (s *Scheduler) Wait() Task {
    s.mu.Lock()
    defer s.mu.Unlock()
    
    for len(s.tasks) == 0 {
        s.cond.Wait()  // 等待新任務
    }
    
    task := s.tasks[0]
    s.tasks = s.tasks[1:]
    return task
}
```

## 總結

### 同步機制選擇

| 場景 | 推薦方案 |
|------|----------|
| 簡單計數器 | atomic |
| 保護數據結構 | Mutex |
| 讀多寫少 | RWMutex |
| 極短臨界區（內核） | Spinlock |
| 限流、資源池 | Semaphore / Channel |
| 事件等待 | Condition Variable / Channel |
| 一次性初始化 | sync.Once |

### 性能排序
```
atomic > Spinlock > Mutex > RWMutex > Semaphore
(適用場景不同，非絕對)
```

### 資深工程師需掌握

- 識別和解決競爭條件
- 選擇合適的同步機制
- 避免死鎖和活鎖
- 性能調優（減少鎖競爭）
- 使用工具檢測併發問題（race detector）
- 理解無鎖編程和 CAS 原理
