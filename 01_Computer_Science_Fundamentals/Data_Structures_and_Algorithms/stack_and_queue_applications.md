# 堆疊與佇列應用

- **難度**: 4
- **重要程度**: 5
- **標籤**: `堆疊`, `佇列`, `單調堆疊`, `優先佇列`, `LIFO`, `FIFO`

## 問題詳述

堆疊 (Stack) 和佇列 (Queue) 是兩種基本的線性資料結構。堆疊遵循 LIFO (Last In First Out，後進先出)，佇列遵循 FIFO (First In First Out，先進先出)。理解它們的原理和應用場景是解決許多演算法問題的關鍵。

## 核心理論與詳解

### 1. 堆疊 (Stack)

#### 核心特性

- **LIFO**: 後進先出
- **兩端操作受限**: 只能從一端（棧頂）插入和刪除

#### 基本操作

```go
type Stack struct {
    items []int
}

// 壓棧
func (s *Stack) Push(item int) {
    s.items = append(s.items, item)
}

// 彈棧
func (s *Stack) Pop() int {
    if len(s.items) == 0 {
        return -1
    }
    item := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return item
}

// 查看棧頂
func (s *Stack) Peek() int {
    if len(s.items) == 0 {
        return -1
    }
    return s.items[len(s.items)-1]
}

// 是否為空
func (s *Stack) IsEmpty() bool {
    return len(s.items) == 0
}
```

#### 時間複雜度

| 操作 | 時間複雜度 |
|-----|-----------|
| Push | O(1) |
| Pop | O(1) |
| Peek | O(1) |
| Search | O(n) |

#### 堆疊的應用場景

**1. 函數呼叫堆疊**
```go
func factorial(n int) int {
    if n <= 1 {
        return 1
    }
    return n * factorial(n-1)  // 每次呼叫壓入呼叫堆疊
}
```

**2. 括號配對**
```go
func isValid(s string) bool {
    stack := []rune{}
    pairs := map[rune]rune{')': '(', '}': '{', ']': '['}
    
    for _, char := range s {
        if char == '(' || char == '{' || char == '[' {
            stack = append(stack, char)
        } else {
            if len(stack) == 0 || stack[len(stack)-1] != pairs[char] {
                return false
            }
            stack = stack[:len(stack)-1]
        }
    }
    return len(stack) == 0
}
```

**3. 表達式求值**
```go
// 後綴表達式求值：3 4 + 5 * → (3 + 4) * 5 = 35
func evalRPN(tokens []string) int {
    stack := []int{}
    for _, token := range tokens {
        if isOperator(token) {
            b := stack[len(stack)-1]
            stack = stack[:len(stack)-1]
            a := stack[len(stack)-1]
            stack = stack[:len(stack)-1]
            stack = append(stack, calculate(a, b, token))
        } else {
            num, _ := strconv.Atoi(token)
            stack = append(stack, num)
        }
    }
    return stack[0]
}
```

**4. 瀏覽器前進後退**
```go
type Browser struct {
    backStack    []string
    forwardStack []string
    current      string
}

func (b *Browser) Visit(url string) {
    if b.current != "" {
        b.backStack = append(b.backStack, b.current)
    }
    b.current = url
    b.forwardStack = []string{}  // 清空前進堆疊
}

func (b *Browser) Back() string {
    if len(b.backStack) == 0 {
        return b.current
    }
    b.forwardStack = append(b.forwardStack, b.current)
    b.current = b.backStack[len(b.backStack)-1]
    b.backStack = b.backStack[:len(b.backStack)-1]
    return b.current
}

func (b *Browser) Forward() string {
    if len(b.forwardStack) == 0 {
        return b.current
    }
    b.backStack = append(b.backStack, b.current)
    b.current = b.forwardStack[len(b.forwardStack)-1]
    b.forwardStack = b.forwardStack[:len(b.forwardStack)-1]
    return b.current
}
```

### 2. 單調堆疊 (Monotonic Stack)

#### 核心思想

維護一個單調遞增或遞減的堆疊，用於快速找到「下一個更大/更小元素」。

#### 經典應用：下一個更大元素

```go
// 找到每個元素右側第一個比它大的元素
func nextGreaterElements(nums []int) []int {
    n := len(nums)
    result := make([]int, n)
    for i := range result {
        result[i] = -1
    }
    
    stack := []int{}  // 存索引
    
    for i := 0; i < n; i++ {
        // 當前元素比棧頂元素大，找到答案
        for len(stack) > 0 && nums[i] > nums[stack[len(stack)-1]] {
            idx := stack[len(stack)-1]
            stack = stack[:len(stack)-1]
            result[idx] = nums[i]
        }
        stack = append(stack, i)
    }
    return result
}
```

#### 應用：柱狀圖中最大矩形

```go
func largestRectangleArea(heights []int) int {
    stack := []int{}
    maxArea := 0
    heights = append(heights, 0)  // 哨兵
    
    for i, h := range heights {
        for len(stack) > 0 && h < heights[stack[len(stack)-1]] {
            height := heights[stack[len(stack)-1]]
            stack = stack[:len(stack)-1]
            
            width := i
            if len(stack) > 0 {
                width = i - stack[len(stack)-1] - 1
            }
            maxArea = max(maxArea, height*width)
        }
        stack = append(stack, i)
    }
    return maxArea
}
```

### 3. 佇列 (Queue)

#### 核心特性

- **FIFO**: 先進先出
- **兩端操作**: 隊尾插入 (Enqueue)，隊頭刪除 (Dequeue)

#### 基本實現

**方法 1: 切片實現**
```go
type Queue struct {
    items []int
}

func (q *Queue) Enqueue(item int) {
    q.items = append(q.items, item)
}

func (q *Queue) Dequeue() int {
    if len(q.items) == 0 {
        return -1
    }
    item := q.items[0]
    q.items = q.items[1:]  // ⚠️ 效能問題：O(n)
    return item
}
```

**方法 2: 環形佇列（效能更好）**
```go
type CircularQueue struct {
    data  []int
    head  int
    tail  int
    size  int
    capacity int
}

func NewCircularQueue(k int) *CircularQueue {
    return &CircularQueue{
        data:     make([]int, k),
        capacity: k,
    }
}

func (q *CircularQueue) Enqueue(value int) bool {
    if q.IsFull() {
        return false
    }
    q.data[q.tail] = value
    q.tail = (q.tail + 1) % q.capacity
    q.size++
    return true
}

func (q *CircularQueue) Dequeue() int {
    if q.IsEmpty() {
        return -1
    }
    value := q.data[q.head]
    q.head = (q.head + 1) % q.capacity
    q.size--
    return value
}

func (q *CircularQueue) IsEmpty() bool {
    return q.size == 0
}

func (q *CircularQueue) IsFull() bool {
    return q.size == q.capacity
}
```

#### 佇列的應用場景

**1. BFS（廣度優先搜尋）**
```go
func levelOrder(root *TreeNode) [][]int {
    if root == nil {
        return [][]int{}
    }
    
    result := [][]int{}
    queue := []*TreeNode{root}
    
    for len(queue) > 0 {
        levelSize := len(queue)
        level := []int{}
        
        for i := 0; i < levelSize; i++ {
            node := queue[0]
            queue = queue[1:]
            level = append(level, node.Val)
            
            if node.Left != nil {
                queue = append(queue, node.Left)
            }
            if node.Right != nil {
                queue = append(queue, node.Right)
            }
        }
        result = append(result, level)
    }
    return result
}
```

**2. 任務佇列**
```go
type TaskQueue struct {
    mu    sync.Mutex
    tasks chan Task
}

type Task func()

func NewTaskQueue(size int) *TaskQueue {
    tq := &TaskQueue{
        tasks: make(chan Task, size),
    }
    // 啟動工作者
    for i := 0; i < 5; i++ {
        go tq.worker()
    }
    return tq
}

func (tq *TaskQueue) worker() {
    for task := range tq.tasks {
        task()
    }
}

func (tq *TaskQueue) Submit(task Task) {
    tq.tasks <- task
}
```

**3. 訊息佇列（Message Queue）**
```go
// 生產者-消費者模式
type MessageQueue struct {
    messages chan string
}

// 生產者
func producer(mq *MessageQueue) {
    for i := 0; i < 10; i++ {
        message := fmt.Sprintf("Message %d", i)
        mq.messages <- message
        time.Sleep(100 * time.Millisecond)
    }
    close(mq.messages)
}

// 消費者
func consumer(mq *MessageQueue) {
    for message := range mq.messages {
        fmt.Println("Processing:", message)
        time.Sleep(200 * time.Millisecond)
    }
}
```

### 4. 雙端佇列 (Deque)

#### 核心特性

- 兩端都可以插入和刪除
- 可以同時當堆疊和佇列使用

#### Go 實現

```go
type Deque struct {
    items []int
}

// 隊頭插入
func (d *Deque) PushFront(item int) {
    d.items = append([]int{item}, d.items...)
}

// 隊尾插入
func (d *Deque) PushBack(item int) {
    d.items = append(d.items, item)
}

// 隊頭刪除
func (d *Deque) PopFront() int {
    if len(d.items) == 0 {
        return -1
    }
    item := d.items[0]
    d.items = d.items[1:]
    return item
}

// 隊尾刪除
func (d *Deque) PopBack() int {
    if len(d.items) == 0 {
        return -1
    }
    item := d.items[len(d.items)-1]
    d.items = d.items[:len(d.items)-1]
    return item
}
```

#### 應用：滑動視窗最大值

```go
func maxSlidingWindow(nums []int, k int) []int {
    result := []int{}
    deque := []int{}  // 存索引，維護單調遞減
    
    for i, num := range nums {
        // 移除超出視窗的元素
        if len(deque) > 0 && deque[0] < i-k+1 {
            deque = deque[1:]
        }
        
        // 維護單調遞減
        for len(deque) > 0 && nums[deque[len(deque)-1]] < num {
            deque = deque[:len(deque)-1]
        }
        
        deque = append(deque, i)
        
        // 視窗形成後記錄最大值
        if i >= k-1 {
            result = append(result, nums[deque[0]])
        }
    }
    return result
}
```

### 5. 優先佇列 (Priority Queue)

#### 核心特性

- 不是 FIFO，而是按優先級出隊
- 通常用**堆 (Heap)** 實現

#### Go 實現（使用 container/heap）

```go
type Item struct {
    value    string
    priority int
    index    int
}

type PriorityQueue []*Item

func (pq PriorityQueue) Len() int { return len(pq) }

func (pq PriorityQueue) Less(i, j int) bool {
    return pq[i].priority > pq[j].priority  // 高優先級在前
}

func (pq PriorityQueue) Swap(i, j int) {
    pq[i], pq[j] = pq[j], pq[i]
    pq[i].index = i
    pq[j].index = j
}

func (pq *PriorityQueue) Push(x interface{}) {
    item := x.(*Item)
    item.index = len(*pq)
    *pq = append(*pq, item)
}

func (pq *PriorityQueue) Pop() interface{} {
    old := *pq
    n := len(old)
    item := old[n-1]
    item.index = -1
    *pq = old[0 : n-1]
    return item
}

// 使用範例
func main() {
    pq := make(PriorityQueue, 0)
    heap.Init(&pq)
    
    heap.Push(&pq, &Item{value: "task1", priority: 3})
    heap.Push(&pq, &Item{value: "task2", priority: 1})
    heap.Push(&pq, &Item{value: "task3", priority: 5})
    
    for pq.Len() > 0 {
        item := heap.Pop(&pq).(*Item)
        fmt.Println(item.value, item.priority)
    }
}
```

#### 應用：合併 K 個有序鏈結串列

```go
func mergeKLists(lists []*ListNode) *ListNode {
    pq := make(PriorityQueue, 0)
    heap.Init(&pq)
    
    // 將每個鏈結串列的頭節點加入優先佇列
    for i, list := range lists {
        if list != nil {
            heap.Push(&pq, &Item{node: list, index: i})
        }
    }
    
    dummy := &ListNode{}
    current := dummy
    
    for pq.Len() > 0 {
        item := heap.Pop(&pq).(*Item)
        current.Next = item.node
        current = current.Next
        
        if item.node.Next != nil {
            heap.Push(&pq, &Item{node: item.node.Next, index: item.index})
        }
    }
    
    return dummy.Next
}
```

### 6. 實際後端應用

#### 限流（令牌桶用佇列）

```go
type TokenBucket struct {
    tokens    chan struct{}
    rate      time.Duration
    capacity  int
}

func NewTokenBucket(capacity int, rate time.Duration) *TokenBucket {
    tb := &TokenBucket{
        tokens:   make(chan struct{}, capacity),
        rate:     rate,
        capacity: capacity,
    }
    
    // 定期添加令牌
    go func() {
        ticker := time.NewTicker(rate)
        for range ticker.C {
            select {
            case tb.tokens <- struct{}{}:
            default:
            }
        }
    }()
    
    return tb
}

func (tb *TokenBucket) Allow() bool {
    select {
    case <-tb.tokens:
        return true
    default:
        return false
    }
}
```

#### 日誌緩衝（佇列批次寫入）

```go
type LogBuffer struct {
    buffer chan string
    batch  int
}

func NewLogBuffer(size, batch int) *LogBuffer {
    lb := &LogBuffer{
        buffer: make(chan string, size),
        batch:  batch,
    }
    go lb.flush()
    return lb
}

func (lb *LogBuffer) Log(message string) {
    lb.buffer <- message
}

func (lb *LogBuffer) flush() {
    logs := make([]string, 0, lb.batch)
    ticker := time.NewTicker(1 * time.Second)
    
    for {
        select {
        case log := <-lb.buffer:
            logs = append(logs, log)
            if len(logs) >= lb.batch {
                writeToFile(logs)
                logs = logs[:0]
            }
        case <-ticker.C:
            if len(logs) > 0 {
                writeToFile(logs)
                logs = logs[:0]
            }
        }
    }
}
```

## 總結

### 核心要點

1. **堆疊 LIFO**: 函數呼叫、括號配對、表達式求值
2. **佇列 FIFO**: BFS、任務佇列、訊息佇列
3. **單調堆疊**: 快速找下一個更大/更小元素 O(n)
4. **雙端佇列**: 滑動視窗最大值
5. **優先佇列**: 按優先級處理，用堆實現

### 作為資深後端工程師，你需要

- ✅ 掌握堆疊和佇列的基本操作和實現
- ✅ 理解單調堆疊在優化問題中的應用
- ✅ 能夠用佇列實現 BFS 和任務調度
- ✅ 了解優先佇列在合併、調度中的應用
- ✅ 在實際場景中運用：任務佇列、訊息佇列、限流、日誌緩衝
