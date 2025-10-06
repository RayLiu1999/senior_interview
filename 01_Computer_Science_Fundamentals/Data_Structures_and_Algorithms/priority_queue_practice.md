# 優先佇列實戰

- **難度**: 5
- **重要程度**: 4
- **標籤**: `優先佇列`, `堆`, `任務調度`, `Top K`, `合併K個鏈表`

## 問題詳述

優先佇列 (Priority Queue) 是一種特殊的佇列，元素出隊順序由優先級決定而非 FIFO。通常用**堆 (Heap)** 實現，廣泛應用於任務調度、Top K 問題、圖算法等場景。

## 核心理論與詳解

### 1. 優先佇列基礎

#### 核心特性

- **不是 FIFO**: 優先級高的先出隊
- **底層實現**: 通常用二元堆（最小堆或最大堆）
- **高效操作**: 插入和刪除都是 O(log n)

#### 最小堆 vs 最大堆

```
最小堆：父節點 ≤ 子節點
        1
       / \
      3   5
     / \
    7   9

最大堆：父節點 ≥ 子節點
        9
       / \
      7   5
     / \
    3   1
```

### 2. Go 語言實現

#### 使用 container/heap

```go
import "container/heap"

// 最小堆
type IntHeap []int

func (h IntHeap) Len() int           { return len(h) }
func (h IntHeap) Less(i, j int) bool { return h[i] < h[j] }  // 最小堆
func (h IntHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }

func (h *IntHeap) Push(x interface{}) {
    *h = append(*h, x.(int))
}

func (h *IntHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}

// 使用範例
func main() {
    h := &IntHeap{3, 1, 5, 2, 4}
    heap.Init(h)
    
    heap.Push(h, 0)
    fmt.Println(heap.Pop(h))  // 0 (最小值)
}
```

#### 自訂優先級

```go
type Task struct {
    ID       int
    Priority int
    Name     string
}

type TaskQueue []*Task

func (tq TaskQueue) Len() int { return len(tq) }
func (tq TaskQueue) Less(i, j int) bool {
    // 優先級越高，數字越小
    return tq[i].Priority < tq[j].Priority
}
func (tq TaskQueue) Swap(i, j int) { tq[i], tq[j] = tq[j], tq[i] }

func (tq *TaskQueue) Push(x interface{}) {
    *tq = append(*tq, x.(*Task))
}

func (tq *TaskQueue) Pop() interface{} {
    old := *tq
    n := len(old)
    item := old[n-1]
    *tq = old[0 : n-1]
    return item
}

// 使用
func main() {
    tq := make(TaskQueue, 0)
    heap.Init(&tq)
    
    heap.Push(&tq, &Task{ID: 1, Priority: 5, Name: "低優先級"})
    heap.Push(&tq, &Task{ID: 2, Priority: 1, Name: "高優先級"})
    heap.Push(&tq, &Task{ID: 3, Priority: 3, Name: "中優先級"})
    
    for tq.Len() > 0 {
        task := heap.Pop(&tq).(*Task)
        fmt.Println(task.Name)
    }
    // 輸出：高優先級 → 中優先級 → 低優先級
}
```

### 3. 經典應用題

#### Q1: Top K 最大元素

```go
// 用最小堆維護 K 個最大值
func topKFrequent(nums []int, k int) []int {
    // 統計頻率
    counts := make(map[int]int)
    for _, num := range nums {
        counts[num]++
    }
    
    // 最小堆（按頻率）
    h := &FreqHeap{}
    heap.Init(h)
    
    for num, freq := range counts {
        heap.Push(h, Pair{num, freq})
        if h.Len() > k {
            heap.Pop(h)  // 保持堆大小為 k
        }
    }
    
    // 提取結果
    result := make([]int, k)
    for i := k - 1; i >= 0; i-- {
        result[i] = heap.Pop(h).(Pair).num
    }
    return result
}

type Pair struct {
    num  int
    freq int
}

type FreqHeap []Pair

func (h FreqHeap) Len() int           { return len(h) }
func (h FreqHeap) Less(i, j int) bool { return h[i].freq < h[j].freq }
func (h FreqHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *FreqHeap) Push(x interface{}) { *h = append(*h, x.(Pair)) }
func (h *FreqHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}
```

#### Q2: 合併 K 個有序鏈表

```go
type ListNode struct {
    Val  int
    Next *ListNode
}

type NodeHeap []*ListNode

func (h NodeHeap) Len() int           { return len(h) }
func (h NodeHeap) Less(i, j int) bool { return h[i].Val < h[j].Val }
func (h NodeHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *NodeHeap) Push(x interface{}) { *h = append(*h, x.(*ListNode)) }
func (h *NodeHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}

func mergeKLists(lists []*ListNode) *ListNode {
    h := &NodeHeap{}
    heap.Init(h)
    
    // 將每個鏈表的頭節點加入堆
    for _, list := range lists {
        if list != nil {
            heap.Push(h, list)
        }
    }
    
    dummy := &ListNode{}
    current := dummy
    
    for h.Len() > 0 {
        // 取出最小節點
        node := heap.Pop(h).(*ListNode)
        current.Next = node
        current = current.Next
        
        // 將下一個節點加入堆
        if node.Next != nil {
            heap.Push(h, node.Next)
        }
    }
    
    return dummy.Next
}
```

**時間複雜度**: O(N log K)
- N: 所有節點總數
- K: 鏈表數量

#### Q3: 第 K 大元素

```go
func findKthLargest(nums []int, k int) int {
    h := &IntHeap{}
    heap.Init(h)
    
    for _, num := range nums {
        heap.Push(h, num)
        if h.Len() > k {
            heap.Pop(h)  // 保持堆大小為 k
        }
    }
    
    return (*h)[0]  // 堆頂就是第 K 大
}
```

#### Q4: 資料流中位數

```go
type MedianFinder struct {
    small *MaxHeap  // 最大堆：儲存較小的一半
    large *MinHeap  // 最小堆：儲存較大的一半
}

func Constructor() MedianFinder {
    return MedianFinder{
        small: &MaxHeap{},
        large: &MinHeap{},
    }
}

func (mf *MedianFinder) AddNum(num int) {
    // 先加入 small
    heap.Push(mf.small, num)
    
    // 平衡：small 最大值 ≤ large 最小值
    if mf.small.Len() > 0 && mf.large.Len() > 0 &&
        (*mf.small)[0] > (*mf.large)[0] {
        val := heap.Pop(mf.small).(int)
        heap.Push(mf.large, val)
    }
    
    // 平衡大小：|small| - |large| ≤ 1
    if mf.small.Len() > mf.large.Len()+1 {
        val := heap.Pop(mf.small).(int)
        heap.Push(mf.large, val)
    }
    if mf.large.Len() > mf.small.Len() {
        val := heap.Pop(mf.large).(int)
        heap.Push(mf.small, val)
    }
}

func (mf *MedianFinder) FindMedian() float64 {
    if mf.small.Len() > mf.large.Len() {
        return float64((*mf.small)[0])
    }
    return (float64((*mf.small)[0]) + float64((*mf.large)[0])) / 2.0
}

type MaxHeap []int
func (h MaxHeap) Len() int           { return len(h) }
func (h MaxHeap) Less(i, j int) bool { return h[i] > h[j] }  // 最大堆
func (h MaxHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *MaxHeap) Push(x interface{}) { *h = append(*h, x.(int)) }
func (h *MaxHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}

type MinHeap []int
func (h MinHeap) Len() int           { return len(h) }
func (h MinHeap) Less(i, j int) bool { return h[i] < h[j] }  // 最小堆
func (h MinHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *MinHeap) Push(x interface{}) { *h = append(*h, x.(int)) }
func (h *MinHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}
```

### 4. 實際應用場景

#### 1. 任務調度器

```go
type Scheduler struct {
    tasks *TaskQueue
    mu    sync.Mutex
}

func NewScheduler() *Scheduler {
    tq := make(TaskQueue, 0)
    heap.Init(&tq)
    
    s := &Scheduler{tasks: &tq}
    go s.run()
    return s
}

func (s *Scheduler) AddTask(task *Task) {
    s.mu.Lock()
    defer s.mu.Unlock()
    heap.Push(s.tasks, task)
}

func (s *Scheduler) run() {
    for {
        s.mu.Lock()
        if s.tasks.Len() > 0 {
            task := heap.Pop(s.tasks).(*Task)
            s.mu.Unlock()
            
            // 執行任務
            s.executeTask(task)
        } else {
            s.mu.Unlock()
            time.Sleep(100 * time.Millisecond)
        }
    }
}

func (s *Scheduler) executeTask(task *Task) {
    fmt.Printf("Executing task: %s (priority: %d)\n", task.Name, task.Priority)
    // 實際執行邏輯...
}
```

#### 2. 事件驅動系統

```go
type Event struct {
    Timestamp int64
    Type      string
    Data      interface{}
}

type EventQueue []*Event

func (eq EventQueue) Len() int { return len(eq) }
func (eq EventQueue) Less(i, j int) bool {
    return eq[i].Timestamp < eq[j].Timestamp
}
func (eq EventQueue) Swap(i, j int) { eq[i], eq[j] = eq[j], eq[i] }
func (eq *EventQueue) Push(x interface{}) { *eq = append(*eq, x.(*Event)) }
func (eq *EventQueue) Pop() interface{} {
    old := *eq
    n := len(old)
    x := old[n-1]
    *eq = old[0 : n-1]
    return x
}

type EventLoop struct {
    events *EventQueue
}

func (el *EventLoop) Schedule(event *Event) {
    heap.Push(el.events, event)
}

func (el *EventLoop) Run() {
    for el.events.Len() > 0 {
        event := heap.Pop(el.events).(*Event)
        
        // 等待直到事件時間
        now := time.Now().UnixNano()
        if event.Timestamp > now {
            time.Sleep(time.Duration(event.Timestamp - now))
        }
        
        // 處理事件
        el.handleEvent(event)
    }
}
```

#### 3. Dijkstra 最短路徑

```go
type Edge struct {
    to   int
    cost int
}

type State struct {
    node int
    dist int
}

type PQ []*State

func (pq PQ) Len() int           { return len(pq) }
func (pq PQ) Less(i, j int) bool { return pq[i].dist < pq[j].dist }
func (pq PQ) Swap(i, j int)      { pq[i], pq[j] = pq[j], pq[i] }
func (pq *PQ) Push(x interface{}) { *pq = append(*pq, x.(*State)) }
func (pq *PQ) Pop() interface{} {
    old := *pq
    n := len(old)
    x := old[n-1]
    *pq = old[0 : n-1]
    return x
}

func dijkstra(graph [][]Edge, start int) []int {
    n := len(graph)
    dist := make([]int, n)
    for i := range dist {
        dist[i] = math.MaxInt32
    }
    dist[start] = 0
    
    pq := &PQ{}
    heap.Init(pq)
    heap.Push(pq, &State{node: start, dist: 0})
    
    for pq.Len() > 0 {
        state := heap.Pop(pq).(*State)
        cur := state.node
        curDist := state.dist
        
        if curDist > dist[cur] {
            continue
        }
        
        for _, edge := range graph[cur] {
            next := edge.to
            nextDist := curDist + edge.cost
            
            if nextDist < dist[next] {
                dist[next] = nextDist
                heap.Push(pq, &State{node: next, dist: nextDist})
            }
        }
    }
    
    return dist
}
```

#### 4. 限流（令牌桶）

```go
type TokenBucket struct {
    tokens   *IntHeap  // 用優先佇列模擬令牌生成時間
    capacity int
    rate     time.Duration
}

func NewTokenBucket(capacity int, rate time.Duration) *TokenBucket {
    h := &IntHeap{}
    heap.Init(h)
    
    // 初始化令牌
    now := time.Now().UnixNano()
    for i := 0; i < capacity; i++ {
        heap.Push(h, int(now))
    }
    
    return &TokenBucket{
        tokens:   h,
        capacity: capacity,
        rate:     rate,
    }
}

func (tb *TokenBucket) Allow() bool {
    now := time.Now().UnixNano()
    
    // 生成新令牌
    for tb.tokens.Len() < tb.capacity {
        lastToken := (*tb.tokens)[0]
        nextToken := lastToken + int(tb.rate.Nanoseconds())
        if nextToken > int(now) {
            break
        }
        heap.Pop(tb.tokens)
        heap.Push(tb.tokens, nextToken)
    }
    
    // 消費令牌
    if tb.tokens.Len() > 0 {
        heap.Pop(tb.tokens)
        return true
    }
    return false
}
```

### 5. 時間複雜度

| 操作 | 時間複雜度 |
|-----|-----------|
| **插入** | O(log n) |
| **刪除最大/最小** | O(log n) |
| **查看最大/最小** | O(1) |
| **建堆** | O(n) |

## 總結

### 核心要點

1. **優先佇列 = 堆**: 通常用二元堆實現
2. **Top K 問題**: 用大小為 K 的堆，O(N log K)
3. **合併 K 路**: 用堆維護 K 個最小值
4. **資料流中位數**: 用兩個堆（最大堆+最小堆）
5. **實際應用**: 任務調度、事件處理、最短路徑、限流

### 作為資深後端工程師，你需要

- ✅ 熟練使用 Go container/heap 實現優先佇列
- ✅ 掌握 Top K、合併 K 路等經典問題
- ✅ 理解最大堆和最小堆的應用場景
- ✅ 在任務調度、事件處理中應用優先佇列
- ✅ 了解優先佇列在 Dijkstra 等算法中的應用
