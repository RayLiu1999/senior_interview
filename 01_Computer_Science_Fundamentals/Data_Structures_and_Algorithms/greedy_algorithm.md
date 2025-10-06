# 貪心算法原理與應用

- **難度**: 6
- **重要程度**: 4
- **標籤**: `貪心`, `區間問題`, `霍夫曼編碼`

## 問題詳述

貪心算法 (Greedy Algorithm) 是一種在每一步選擇中都採取當前狀態下**最優選擇**的算法策略。貪心算法不保證全局最優,但在某些問題中可以得到最優解,且通常比動態規劃更高效。

## 核心理論與詳解

### 1. 貪心算法基本原理

**核心思想**:
- 在每個決策點,選擇**當前看起來最好**的選項
- 不考慮未來的影響
- 希望通過局部最優達到全局最優

**貪心策略的兩個關鍵性質**:

1. **貪心選擇性質 (Greedy Choice Property)**:
   - 通過局部最優選擇能達到全局最優
   - 可以在做選擇時不考慮子問題的解

2. **最優子結構 (Optimal Substructure)**:
   - 問題的最優解包含子問題的最優解
   - 與動態規劃相同,但貪心不需要比較所有可能

**與動態規劃的區別**:
- **貪心**: 做出選擇後不會回頭,直接進入子問題
- **動態規劃**: 需要比較所有選擇,選擇最優

### 2. 貪心算法典型問題

#### 問題一: 活動選擇問題 (區間調度)

**問題**: 給定一組活動的開始和結束時間,選擇最多的不衝突活動。

**貪心策略**: 按結束時間排序,總是選擇最早結束的活動。

```go
type Activity struct {
    start, end int
}

func activitySelection(activities []Activity) []Activity {
    // 按結束時間排序
    sort.Slice(activities, func(i, j int) bool {
        return activities[i].end < activities[j].end
    })
    
    result := []Activity{activities[0]}
    lastEnd := activities[0].end
    
    for i := 1; i < len(activities); i++ {
        if activities[i].start >= lastEnd {
            result = append(result, activities[i])
            lastEnd = activities[i].end
        }
    }
    
    return result
}
```

#### 問題二: 跳躍遊戲 II

**LeetCode 45. Jump Game II** - 求到達終點的最少跳躍次數。

**貪心策略**: 在當前能跳到的範圍內,選擇能跳得最遠的位置。

```go
func jump(nums []int) int {
    if len(nums) <= 1 {
        return 0
    }
    
    jumps := 0
    currentEnd := 0      // 當前跳躍的邊界
    farthest := 0        // 當前能跳到的最遠位置
    
    for i := 0; i < len(nums) - 1; i++ {
        // 更新最遠位置
        farthest = max(farthest, i + nums[i])
        
        // 到達當前跳躍的邊界
        if i == currentEnd {
            jumps++
            currentEnd = farthest
            
            // 已經可以到達終點
            if currentEnd >= len(nums) - 1 {
                break
            }
        }
    }
    
    return jumps
}
```

#### 問題三: 無重疊區間

**LeetCode 435. Non-overlapping Intervals** - 移除最少的區間使剩餘區間不重疊。

**貪心策略**: 按結束時間排序,選擇結束最早的區間。

```go
func eraseOverlapIntervals(intervals [][]int) int {
    if len(intervals) == 0 {
        return 0
    }
    
    // 按結束時間排序
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][1] < intervals[j][1]
    })
    
    end := intervals[0][1]
    count := 1  // 不重疊的區間數
    
    for i := 1; i < len(intervals); i++ {
        if intervals[i][0] >= end {
            count++
            end = intervals[i][1]
        }
    }
    
    return len(intervals) - count
}
```

#### 問題四: 分發餅乾

**LeetCode 455. Assign Cookies** - 滿足最多的孩子。

**貪心策略**: 用最小的餅乾滿足胃口最小的孩子。

```go
func findContentChildren(g []int, s []int) int {
    sort.Ints(g)  // 孩子的胃口
    sort.Ints(s)  // 餅乾的大小
    
    child, cookie := 0, 0
    
    for child < len(g) && cookie < len(s) {
        if s[cookie] >= g[child] {
            child++  // 滿足這個孩子
        }
        cookie++
    }
    
    return child
}
```

#### 問題五: 加油站

**LeetCode 134. Gas Station** - 判斷能否環繞一圈。

**貪心策略**: 如果總油量 >= 總消耗,一定有解;從油量累積為負的下一站開始。

```go
func canCompleteCircuit(gas []int, cost []int) int {
    totalGas, totalCost := 0, 0
    start, tank := 0, 0
    
    for i := 0; i < len(gas); i++ {
        totalGas += gas[i]
        totalCost += cost[i]
        tank += gas[i] - cost[i]
        
        // 如果油量不足,從下一站開始
        if tank < 0 {
            start = i + 1
            tank = 0
        }
    }
    
    if totalGas < totalCost {
        return -1
    }
    return start
}
```

### 3. 貪心算法進階問題

#### 問題一: 買賣股票的最佳時機 II

**LeetCode 122. Best Time to Buy and Sell Stock II** - 多次買賣求最大利潤。

**貪心策略**: 只要明天價格更高,今天就買入明天賣出。

```go
func maxProfit(prices []int) int {
    profit := 0
    
    for i := 1; i < len(prices); i++ {
        if prices[i] > prices[i-1] {
            profit += prices[i] - prices[i-1]
        }
    }
    
    return profit
}
```

#### 問題二: 劃分字母區間

**LeetCode 763. Partition Labels** - 將字串劃分為盡可能多的片段。

**貪心策略**: 記錄每個字母的最後出現位置,當遍歷到片段最後位置時切分。

```go
func partitionLabels(s string) []int {
    // 記錄每個字母最後出現的位置
    lastPos := make(map[byte]int)
    for i := 0; i < len(s); i++ {
        lastPos[s[i]] = i
    }
    
    result := []int{}
    start, end := 0, 0
    
    for i := 0; i < len(s); i++ {
        // 更新當前片段的結束位置
        end = max(end, lastPos[s[i]])
        
        // 到達片段結束位置
        if i == end {
            result = append(result, end - start + 1)
            start = i + 1
        }
    }
    
    return result
}
```

#### 問題三: 重構字串

**LeetCode 767. Reorganize String** - 重新排列字串使相鄰字元不同。

**貪心策略**: 使用優先佇列,總是先放置出現次數最多的字元。

```go
func reorganizeString(s string) string {
    // 統計字元頻率
    freq := make(map[byte]int)
    for i := 0; i < len(s); i++ {
        freq[s[i]]++
    }
    
    // 使用優先佇列 (最大堆)
    pq := &PriorityQueue{}
    heap.Init(pq)
    
    for char, count := range freq {
        heap.Push(pq, &Item{char: char, count: count})
    }
    
    result := []byte{}
    var prev *Item
    
    for pq.Len() > 0 {
        current := heap.Pop(pq).(*Item)
        result = append(result, current.char)
        current.count--
        
        // 將上一個字元放回佇列
        if prev != nil && prev.count > 0 {
            heap.Push(pq, prev)
        }
        
        prev = current
    }
    
    if len(result) != len(s) {
        return ""
    }
    return string(result)
}

type Item struct {
    char  byte
    count int
}

type PriorityQueue []*Item

func (pq PriorityQueue) Len() int { return len(pq) }
func (pq PriorityQueue) Less(i, j int) bool {
    return pq[i].count > pq[j].count
}
func (pq PriorityQueue) Swap(i, j int) { pq[i], pq[j] = pq[j], pq[i] }
func (pq *PriorityQueue) Push(x interface{}) {
    *pq = append(*pq, x.(*Item))
}
func (pq *PriorityQueue) Pop() interface{} {
    old := *pq
    n := len(old)
    item := old[n-1]
    *pq = old[0 : n-1]
    return item
}
```

### 4. 霍夫曼編碼 (Huffman Coding)

霍夫曼編碼是貪心算法的經典應用,用於數據壓縮。

**原理**: 頻率高的字元用短編碼,頻率低的字元用長編碼。

```go
type HuffmanNode struct {
    char  byte
    freq  int
    left  *HuffmanNode
    right *HuffmanNode
}

type HuffmanHeap []*HuffmanNode

func (h HuffmanHeap) Len() int           { return len(h) }
func (h HuffmanHeap) Less(i, j int) bool { return h[i].freq < h[j].freq }
func (h HuffmanHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *HuffmanHeap) Push(x interface{}) {
    *h = append(*h, x.(*HuffmanNode))
}
func (h *HuffmanHeap) Pop() interface{} {
    old := *h
    n := len(old)
    item := old[n-1]
    *h = old[0 : n-1]
    return item
}

func buildHuffmanTree(text string) *HuffmanNode {
    // 統計頻率
    freq := make(map[byte]int)
    for i := 0; i < len(text); i++ {
        freq[text[i]]++
    }
    
    // 建立最小堆
    h := &HuffmanHeap{}
    heap.Init(h)
    
    for char, f := range freq {
        heap.Push(h, &HuffmanNode{char: char, freq: f})
    }
    
    // 建立霍夫曼樹
    for h.Len() > 1 {
        left := heap.Pop(h).(*HuffmanNode)
        right := heap.Pop(h).(*HuffmanNode)
        
        parent := &HuffmanNode{
            freq:  left.freq + right.freq,
            left:  left,
            right: right,
        }
        
        heap.Push(h, parent)
    }
    
    return heap.Pop(h).(*HuffmanNode)
}

func generateCodes(root *HuffmanNode) map[byte]string {
    codes := make(map[byte]string)
    
    var dfs func(node *HuffmanNode, code string)
    dfs = func(node *HuffmanNode, code string) {
        if node == nil {
            return
        }
        
        if node.left == nil && node.right == nil {
            codes[node.char] = code
            return
        }
        
        dfs(node.left, code + "0")
        dfs(node.right, code + "1")
    }
    
    dfs(root, "")
    return codes
}
```

### 5. 如何判斷能否使用貪心算法

**可以使用貪心的情況**:
1. ✅ 問題具有**貪心選擇性質**
2. ✅ 問題具有**最優子結構**
3. ✅ 局部最優能導致全局最優
4. ✅ 能明確定義貪心策略

**不能使用貪心的情況**:
1. ❌ 局部最優不能保證全局最優
2. ❌ 需要考慮多種選擇的組合
3. ❌ 問題有明顯的「後效性」

**驗證方法**:
- 數學證明 (歸納法、交換論證)
- 反例驗證
- 對比動態規劃解

## 實際應用場景

### 1. 任務調度系統

選擇最優的任務執行順序。

```go
type Task struct {
    ID       string
    Duration int
    Deadline int
    Penalty  int
}

// 按截止時間排序,優先執行截止時間早的任務
func scheduleTasks(tasks []Task) []Task {
    sort.Slice(tasks, func(i, j int) bool {
        return tasks[i].Deadline < tasks[j].Deadline
    })
    return tasks
}
```

### 2. 負載均衡

將請求分配到負載最小的服務器。

```go
type Server struct {
    ID   string
    Load int
}

func assignToServer(servers []Server, newLoad int) int {
    // 找到負載最小的服務器
    minLoad := servers[0].Load
    minIndex := 0
    
    for i := 1; i < len(servers); i++ {
        if servers[i].Load < minLoad {
            minLoad = servers[i].Load
            minIndex = i
        }
    }
    
    servers[minIndex].Load += newLoad
    return minIndex
}
```

### 3. 文件壓縮

使用霍夫曼編碼進行文件壓縮。

```go
func compressFile(data []byte) []byte {
    // 建立霍夫曼樹
    root := buildHuffmanTree(string(data))
    
    // 生成編碼表
    codes := generateCodes(root)
    
    // 壓縮數據
    compressed := strings.Builder{}
    for _, b := range data {
        compressed.WriteString(codes[b])
    }
    
    return []byte(compressed.String())
}
```

### 4. 會議室分配

分配最少的會議室。

```go
func minMeetingRooms(intervals [][]int) int {
    if len(intervals) == 0 {
        return 0
    }
    
    // 分離開始和結束時間
    starts := make([]int, len(intervals))
    ends := make([]int, len(intervals))
    
    for i, interval := range intervals {
        starts[i] = interval[0]
        ends[i] = interval[1]
    }
    
    sort.Ints(starts)
    sort.Ints(ends)
    
    rooms, endPtr := 0, 0
    
    for i := 0; i < len(starts); i++ {
        if starts[i] < ends[endPtr] {
            rooms++  // 需要新會議室
        } else {
            endPtr++  // 釋放一個會議室
        }
    }
    
    return rooms
}
```

## 總結

**貪心算法核心要點**:
1. **核心思想**: 每步選擇當前最優,不回頭
2. **兩大性質**: 貪心選擇性質 + 最優子結構
3. **典型應用**: 區間問題、調度問題、霍夫曼編碼
4. **優勢**: 時間複雜度低,實現簡單
5. **劣勢**: 不保證全局最優,需要嚴格證明

**常見貪心策略**:
- 排序策略 (按某個屬性排序)
- 優先佇列 (總是選擇最優元素)
- 交換論證 (證明局部最優不會影響全局)

**面試高頻題目**:
- 跳躍遊戲 (LeetCode 45, 55)
- 無重疊區間 (LeetCode 435)
- 分發餅乾 (LeetCode 455)
- 加油站 (LeetCode 134)
- 劃分字母區間 (LeetCode 763)
- 重構字串 (LeetCode 767)

**實際應用**:
- 任務調度 (操作系統)
- 負載均衡 (分散式系統)
- 數據壓縮 (霍夫曼編碼)
- 會議室分配 (資源調度)

貪心算法是一種高效的問題求解策略,但使用時需要謹慎驗證其正確性。在面試中,如果能夠清晰地解釋貪心策略並證明其正確性,會大大加分。
