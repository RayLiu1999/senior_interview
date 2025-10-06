# 堆的實現與應用（TopK 問題）

- **難度**: 6
- **重要程度**: 5
- **標籤**: `Heap`, `Priority Queue`, `TopK`, `Interview Hot`

## 問題詳述

堆（Heap）是一種特殊的完全二元樹結構，主要用於實現**優先佇列（Priority Queue）**。在面試中，堆最常用於解決 **TopK 問題**（找出最大/最小的 K 個元素），也廣泛應用於任務調度、即時數據流中位數等場景。

## 核心理論與詳解

### 1. 堆的基本概念

#### 1.1 堆的定義

**堆是一棵完全二元樹**，滿足以下性質：

1. **最大堆（Max Heap）**：
   - 每個節點的值 ≥ 其子節點的值
   - 根節點是整棵樹的最大值

2. **最小堆（Min Heap）**：
   - 每個節點的值 ≤ 其子節點的值
   - 根節點是整棵樹的最小值

**完全二元樹的特點**：
- 除了最後一層，其他層都是滿的
- 最後一層的節點從左到右填充

**堆的陣列表示**：
```
對於索引 i 的節點（從 0 開始）：
- 父節點：(i - 1) / 2
- 左子節點：2 * i + 1
- 右子節點：2 * i + 2

例如最大堆：
      50
     /  \
   30    40
  / \   / \
10  20 35  15

陣列表示：[50, 30, 40, 10, 20, 35, 15]
```

#### 1.2 堆的核心操作

1. **插入（Insert）** - O(log n)
2. **刪除堆頂（Extract Max/Min）** - O(log n)
3. **查看堆頂（Peek）** - O(1)
4. **堆化（Heapify）** - O(log n)
5. **建堆（Build Heap）** - O(n)

---

### 2. 堆的實現

#### 2.1 最小堆的 Go 實現

```go
package main

import "fmt"

type MinHeap struct {
    heap []int
}

// 建立最小堆
func NewMinHeap() *MinHeap {
    return &MinHeap{heap: []int{}}
}

// 獲取父節點索引
func (h *MinHeap) parent(i int) int {
    return (i - 1) / 2
}

// 獲取左子節點索引
func (h *MinHeap) leftChild(i int) int {
    return 2*i + 1
}

// 獲取右子節點索引
func (h *MinHeap) rightChild(i int) int {
    return 2*i + 2
}

// 交換兩個元素
func (h *MinHeap) swap(i, j int) {
    h.heap[i], h.heap[j] = h.heap[j], h.heap[i]
}

// 向上調整（用於插入）
func (h *MinHeap) heapifyUp(i int) {
    for i > 0 && h.heap[i] < h.heap[h.parent(i)] {
        h.swap(i, h.parent(i))
        i = h.parent(i)
    }
}

// 向下調整（用於刪除）
func (h *MinHeap) heapifyDown(i int) {
    size := len(h.heap)
    for {
        smallest := i
        left := h.leftChild(i)
        right := h.rightChild(i)
        
        // 找出父節點和兩個子節點中最小的
        if left < size && h.heap[left] < h.heap[smallest] {
            smallest = left
        }
        if right < size && h.heap[right] < h.heap[smallest] {
            smallest = right
        }
        
        // 如果父節點最小，停止調整
        if smallest == i {
            break
        }
        
        h.swap(i, smallest)
        i = smallest
    }
}

// 插入元素
func (h *MinHeap) Push(val int) {
    h.heap = append(h.heap, val)
    h.heapifyUp(len(h.heap) - 1)
}

// 刪除並返回堆頂元素
func (h *MinHeap) Pop() int {
    if len(h.heap) == 0 {
        panic("heap is empty")
    }
    
    // 將最後一個元素移到堆頂
    top := h.heap[0]
    lastIdx := len(h.heap) - 1
    h.heap[0] = h.heap[lastIdx]
    h.heap = h.heap[:lastIdx]
    
    // 向下調整
    if len(h.heap) > 0 {
        h.heapifyDown(0)
    }
    
    return top
}

// 查看堆頂元素（不刪除）
func (h *MinHeap) Peek() int {
    if len(h.heap) == 0 {
        panic("heap is empty")
    }
    return h.heap[0]
}

// 獲取堆的大小
func (h *MinHeap) Size() int {
    return len(h.heap)
}

// 判斷堆是否為空
func (h *MinHeap) IsEmpty() bool {
    return len(h.heap) == 0
}
```

#### 2.2 從陣列建堆（Heapify）

**從陣列建立最小堆**：
```go
// 從任意陣列建立最小堆 - O(n)
func BuildMinHeap(arr []int) *MinHeap {
    h := &MinHeap{heap: arr}
    
    // 從最後一個非葉子節點開始，向上調整
    for i := len(arr)/2 - 1; i >= 0; i-- {
        h.heapifyDown(i)
    }
    
    return h
}
```

**為什麼 BuildHeap 是 O(n) 而不是 O(n log n)？**
- 雖然單次 heapifyDown 是 O(log n)
- 但大部分節點的深度很淺
- 數學證明：∑(h=0 to log n) (n/2^h) * h = O(n)

---

### 3. TopK 問題的解法

#### 3.1 TopK 問題的三種解法

**問題**：在 n 個元素中找出最大/最小的 K 個元素

**方法 1：排序 - O(n log n)**
```go
// 簡單但不是最優
func findTopK(nums []int, k int) []int {
    sort.Ints(nums)  // 升序排序
    return nums[len(nums)-k:]  // 返回最大的 K 個
}
```

**方法 2：快速選擇（QuickSelect） - 平均 O(n)**
```go
// 基於快速排序的分區思想
func quickSelect(nums []int, k int) []int {
    left, right := 0, len(nums)-1
    k = len(nums) - k  // 轉換為第 k 小的問題
    
    for left < right {
        pivotIdx := partition(nums, left, right)
        
        if pivotIdx == k {
            break
        } else if pivotIdx < k {
            left = pivotIdx + 1
        } else {
            right = pivotIdx - 1
        }
    }
    
    return nums[k:]
}

func partition(nums []int, left, right int) int {
    pivot := nums[right]
    i := left
    
    for j := left; j < right; j++ {
        if nums[j] < pivot {
            nums[i], nums[j] = nums[j], nums[i]
            i++
        }
    }
    
    nums[i], nums[right] = nums[right], nums[i]
    return i
}
```

**方法 3：堆 - O(n log k)**（推薦）
```go
// 使用最小堆找出最大的 K 個元素
func topKLargest(nums []int, k int) []int {
    // 維護一個大小為 K 的最小堆
    heap := NewMinHeap()
    
    for _, num := range nums {
        if heap.Size() < k {
            heap.Push(num)
        } else if num > heap.Peek() {
            // 如果當前元素比堆頂大，替換堆頂
            heap.Pop()
            heap.Push(num)
        }
    }
    
    // 堆中的元素就是最大的 K 個
    result := []int{}
    for !heap.IsEmpty() {
        result = append(result, heap.Pop())
    }
    
    return result
}
```

**為什麼用最小堆找最大的 K 個元素？**
- 最小堆的堆頂是當前 K 個元素中的最小值
- 如果新元素比堆頂大，說明它應該在 TopK 中
- 替換堆頂，維持堆的大小為 K

#### 3.2 LeetCode 經典題目

**題目 1：數組中的第 K 個最大元素（LeetCode 215）**

```go
func findKthLargest(nums []int, k int) int {
    // 使用最小堆
    heap := NewMinHeap()
    
    for _, num := range nums {
        if heap.Size() < k {
            heap.Push(num)
        } else if num > heap.Peek() {
            heap.Pop()
            heap.Push(num)
        }
    }
    
    return heap.Peek()
}
```

**題目 2：前 K 個高頻元素（LeetCode 347）**

```go
func topKFrequent(nums []int, k int) []int {
    // 1. 統計頻率
    freqMap := make(map[int]int)
    for _, num := range nums {
        freqMap[num]++
    }
    
    // 2. 使用最小堆（按頻率）
    type Element struct {
        val  int
        freq int
    }
    
    heap := &MinHeapByFreq{elements: []Element{}}
    
    for val, freq := range freqMap {
        if heap.Size() < k {
            heap.Push(Element{val, freq})
        } else if freq > heap.Peek().freq {
            heap.Pop()
            heap.Push(Element{val, freq})
        }
    }
    
    // 3. 提取結果
    result := make([]int, k)
    for i := k - 1; i >= 0; i-- {
        result[i] = heap.Pop().val
    }
    
    return result
}
```

**題目 3：合併 K 個排序鏈表（LeetCode 23）**

```go
type ListNode struct {
    Val  int
    Next *ListNode
}

func mergeKLists(lists []*ListNode) *ListNode {
    if len(lists) == 0 {
        return nil
    }
    
    // 使用最小堆
    heap := NewMinHeapForNodes()
    
    // 將每個鏈表的頭節點加入堆
    for _, head := range lists {
        if head != nil {
            heap.Push(head)
        }
    }
    
    dummy := &ListNode{}
    current := dummy
    
    for !heap.IsEmpty() {
        // 取出最小節點
        node := heap.Pop()
        current.Next = node
        current = current.Next
        
        // 如果該節點有下一個節點，加入堆
        if node.Next != nil {
            heap.Push(node.Next)
        }
    }
    
    return dummy.Next
}
```

---

### 4. 堆排序（Heap Sort）

**堆排序的步驟**：
1. 建立最大堆 - O(n)
2. 將堆頂（最大值）與最後一個元素交換
3. 縮小堆的範圍，重新調整堆
4. 重複步驟 2-3，直到堆為空

```go
func heapSort(arr []int) []int {
    n := len(arr)
    
    // 1. 建立最大堆
    for i := n/2 - 1; i >= 0; i-- {
        maxHeapifyDown(arr, n, i)
    }
    
    // 2. 依次取出堆頂元素
    for i := n - 1; i > 0; i-- {
        // 將堆頂與最後一個元素交換
        arr[0], arr[i] = arr[i], arr[0]
        
        // 重新調整堆（範圍縮小）
        maxHeapifyDown(arr, i, 0)
    }
    
    return arr
}

func maxHeapifyDown(arr []int, heapSize, i int) {
    for {
        largest := i
        left := 2*i + 1
        right := 2*i + 2
        
        if left < heapSize && arr[left] > arr[largest] {
            largest = left
        }
        if right < heapSize && arr[right] > arr[largest] {
            largest = right
        }
        
        if largest == i {
            break
        }
        
        arr[i], arr[largest] = arr[largest], arr[i]
        i = largest
    }
}
```

**堆排序的特點**：
- **時間複雜度**：O(n log n) - 不論最好、最壞、平均
- **空間複雜度**：O(1) - 原地排序
- **不穩定排序**

---

## 實際應用場景

### 1. 任務調度系統

**場景**：作業系統的任務調度器
```go
type Task struct {
    ID       int
    Priority int
    Deadline time.Time
}

// 使用優先佇列（最大堆）調度任務
type TaskScheduler struct {
    heap *MaxHeap  // 按優先級排序
}

func (s *TaskScheduler) AddTask(task Task) {
    s.heap.Push(task)
}

func (s *TaskScheduler) GetNextTask() Task {
    return s.heap.Pop()
}
```

**應用**：
- **Kubernetes Pod 調度**：根據優先級和資源需求調度 Pod
- **Celery 任務佇列**：處理異步任務

### 2. 數據流中位數（LeetCode 295）

**場景**：即時計算數據流的中位數
```go
type MedianFinder struct {
    maxHeap *MaxHeap  // 存儲較小的一半
    minHeap *MinHeap  // 存儲較大的一半
}

func (m *MedianFinder) AddNum(num int) {
    // 保持 maxHeap 的元素個數 >= minHeap
    if m.maxHeap.IsEmpty() || num <= m.maxHeap.Peek() {
        m.maxHeap.Push(num)
    } else {
        m.minHeap.Push(num)
    }
    
    // 平衡兩個堆
    if m.maxHeap.Size() > m.minHeap.Size() + 1 {
        m.minHeap.Push(m.maxHeap.Pop())
    } else if m.minHeap.Size() > m.maxHeap.Size() {
        m.maxHeap.Push(m.minHeap.Pop())
    }
}

func (m *MedianFinder) FindMedian() float64 {
    if m.maxHeap.Size() > m.minHeap.Size() {
        return float64(m.maxHeap.Peek())
    }
    return float64(m.maxHeap.Peek() + m.minHeap.Peek()) / 2.0
}
```

### 3. 限流系統（TopK 熱點請求）

**場景**：找出訪問頻率最高的 IP
```go
type RateLimiter struct {
    requestCount map[string]int
    topK         *MinHeap
}

func (r *RateLimiter) RecordRequest(ip string) {
    r.requestCount[ip]++
    // 更新 TopK
    r.updateTopK(ip, r.requestCount[ip])
}

func (r *RateLimiter) GetTopKIPs(k int) []string {
    // 返回訪問頻率最高的 K 個 IP
    return r.topK.GetTopK(k)
}
```

### 4. Dijkstra 最短路徑算法

**使用優先佇列優化**：
```go
func dijkstra(graph [][]int, start int) []int {
    n := len(graph)
    dist := make([]int, n)
    for i := range dist {
        dist[i] = math.MaxInt32
    }
    dist[start] = 0
    
    // 優先佇列：(節點, 距離)
    pq := NewMinHeap()
    pq.Push(Node{start, 0})
    
    for !pq.IsEmpty() {
        node := pq.Pop()
        u, d := node.id, node.dist
        
        if d > dist[u] {
            continue
        }
        
        for v, weight := range graph[u] {
            if dist[u] + weight < dist[v] {
                dist[v] = dist[u] + weight
                pq.Push(Node{v, dist[v]})
            }
        }
    }
    
    return dist
}
```

---

## 面試技巧與常見陷阱

### 1. 堆的選擇

**規則**：
- 找最大的 K 個 → 用**最小堆**（堆頂是第 K 大的元素）
- 找最小的 K 個 → 用**最大堆**（堆頂是第 K 小的元素）

**為什麼反直覺？**
- 最小堆的堆頂是當前 K 個元素中的**門檻**
- 新元素必須超過這個門檻才能進入 TopK

### 2. 堆 vs 快速選擇

| 方法 | 時間複雜度 | 空間複雜度 | 適用場景 |
|------|-----------|-----------|---------|
| 堆 | O(n log k) | O(k) | K 很小、數據流 |
| 快速選擇 | 平均 O(n) | O(1) | 一次性查詢、K 較大 |
| 排序 | O(n log n) | O(1) | 需要有序結果 |

**選擇建議**：
- **K << n**（例如 K = 10, n = 1000000）→ 堆
- **數據流或在線算法** → 堆
- **一次性查詢且 K 較大** → 快速選擇

### 3. 常見錯誤

**錯誤 1：索引計算錯誤**
```go
// ❌ 錯誤：從 1 開始的索引
parent := i / 2
left := 2 * i
right := 2 * i + 1

// ✅ 正確：從 0 開始的索引
parent := (i - 1) / 2
left := 2 * i + 1
right := 2 * i + 2
```

**錯誤 2：忘記維持堆的性質**
```go
// ❌ 直接修改堆中的元素
heap[i] = newValue  // 破壞堆性質

// ✅ 修改後重新調整
heap[i] = newValue
heapifyUp(i) 或 heapifyDown(i)
```

---

## 複雜度分析

| 操作 | 時間複雜度 | 說明 |
|------|-----------|------|
| 插入 | O(log n) | 向上調整 |
| 刪除堆頂 | O(log n) | 向下調整 |
| 查看堆頂 | O(1) | 直接訪問 |
| 建堆 | O(n) | 自底向上調整 |
| 堆排序 | O(n log n) | n 次刪除堆頂 |
| TopK | O(n log k) | 維持大小為 K 的堆 |

---

## 延伸閱讀

- **LeetCode 堆專題**：[Heap Tag](https://leetcode.com/tag/heap-priority-queue/)
- **Go 標準庫**：`container/heap` 包
- **進階主題**：斐波那契堆、配對堆、左傾堆
