# 廣度優先搜尋 (BFS)

- **難度**: 6
- **重要程度**: 5
- **標籤**: `BFS`, `最短路徑`, `層級遍歷`

## 問題詳述

廣度優先搜尋 (Breadth-First Search, BFS) 是圖和樹的基本遍歷算法,採用「層層推進」的策略。BFS 的核心特點是**逐層遍歷**,保證先訪問距離起點較近的節點,因此常用於求**最短路徑**和**層級遍歷**問題。

## 核心理論與詳解

### 1. BFS 基本原理

**核心思想**:
- 從起點開始,先訪問**所有相鄰節點**
- 再依次訪問這些相鄰節點的相鄰節點
- 使用**佇列 (Queue)** 實現 FIFO (先進先出) 的訪問順序

**遍歷順序特點**:
```
    1
   / \
  2   3
 / \   \
4   5   6

BFS 遍歷順序: 1 → 2 → 3 → 4 → 5 → 6
(按層級順序遍歷)

第 0 層: 1
第 1 層: 2, 3
第 2 層: 4, 5, 6
```

**時間複雜度**: O(V + E),其中 V 為節點數,E 為邊數
**空間複雜度**: O(V),佇列最多存放一層的所有節點

### 2. BFS 標準實現

```go
// BFS 遍歷樹
func bfs(root *TreeNode) []int {
    if root == nil {
        return []int{}
    }
    
    result := []int{}
    queue := []*TreeNode{root}
    
    for len(queue) > 0 {
        // 取出佇列首個節點
        node := queue[0]
        queue = queue[1:]
        
        // 處理當前節點
        result = append(result, node.Val)
        
        // 將子節點加入佇列
        if node.Left != nil {
            queue = append(queue, node.Left)
        }
        if node.Right != nil {
            queue = append(queue, node.Right)
        }
    }
    
    return result
}
```

### 3. BFS 層級遍歷

在許多問題中,我們需要知道當前節點所在的**層級**。

```go
// BFS 層級遍歷 (返回每一層的節點)
func levelOrder(root *TreeNode) [][]int {
    if root == nil {
        return [][]int{}
    }
    
    result := [][]int{}
    queue := []*TreeNode{root}
    
    for len(queue) > 0 {
        levelSize := len(queue)  // 當前層的節點數
        currentLevel := []int{}
        
        // 處理當前層的所有節點
        for i := 0; i < levelSize; i++ {
            node := queue[0]
            queue = queue[1:]
            
            currentLevel = append(currentLevel, node.Val)
            
            // 將下一層節點加入佇列
            if node.Left != nil {
                queue = append(queue, node.Left)
            }
            if node.Right != nil {
                queue = append(queue, node.Right)
            }
        }
        
        result = append(result, currentLevel)
    }
    
    return result
}
```

### 4. BFS 典型應用場景

#### 場景一: 最短路徑問題

**範例**: 網格中的最短路徑

```go
func shortestPath(grid [][]int, start, end [2]int) int {
    if len(grid) == 0 {
        return -1
    }
    
    rows, cols := len(grid), len(grid[0])
    visited := make([][]bool, rows)
    for i := range visited {
        visited[i] = make([]bool, cols)
    }
    
    // BFS 佇列: [row, col, distance]
    type Point struct {
        row, col, dist int
    }
    queue := []Point{{start[0], start[1], 0}}
    visited[start[0]][start[1]] = true
    
    // 四個方向: 上、下、左、右
    directions := [][2]int{{-1, 0}, {1, 0}, {0, -1}, {0, 1}}
    
    for len(queue) > 0 {
        p := queue[0]
        queue = queue[1:]
        
        // 到達終點
        if p.row == end[0] && p.col == end[1] {
            return p.dist
        }
        
        // 探索四個方向
        for _, dir := range directions {
            newRow := p.row + dir[0]
            newCol := p.col + dir[1]
            
            // 邊界檢查
            if newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols {
                continue
            }
            // 牆壁或已訪問
            if grid[newRow][newCol] == 1 || visited[newRow][newCol] {
                continue
            }
            
            visited[newRow][newCol] = true
            queue = append(queue, Point{newRow, newCol, p.dist + 1})
        }
    }
    
    return -1  // 無法到達
}
```

#### 場景二: 層級遍歷變體

**範例**: 二元樹的右視圖 (每層最右邊的節點)

```go
func rightSideView(root *TreeNode) []int {
    if root == nil {
        return []int{}
    }
    
    result := []int{}
    queue := []*TreeNode{root}
    
    for len(queue) > 0 {
        levelSize := len(queue)
        
        for i := 0; i < levelSize; i++ {
            node := queue[0]
            queue = queue[1:]
            
            // 只記錄每層的最後一個節點
            if i == levelSize - 1 {
                result = append(result, node.Val)
            }
            
            if node.Left != nil {
                queue = append(queue, node.Left)
            }
            if node.Right != nil {
                queue = append(queue, node.Right)
            }
        }
    }
    
    return result
}
```

#### 場景三: 多源 BFS

**範例**: 腐爛的橘子 (多個起點同時擴散)

```go
func orangesRotting(grid [][]int) int {
    rows, cols := len(grid), len(grid[0])
    queue := [][2]int{}
    freshCount := 0
    
    // 找到所有腐爛的橘子作為起點
    for i := 0; i < rows; i++ {
        for j := 0; j < cols; j++ {
            if grid[i][j] == 2 {
                queue = append(queue, [2]int{i, j})
            } else if grid[i][j] == 1 {
                freshCount++
            }
        }
    }
    
    if freshCount == 0 {
        return 0  // 沒有新鮮橘子
    }
    
    minutes := 0
    directions := [][2]int{{-1, 0}, {1, 0}, {0, -1}, {0, 1}}
    
    // 多源 BFS
    for len(queue) > 0 {
        levelSize := len(queue)
        
        for i := 0; i < levelSize; i++ {
            pos := queue[0]
            queue = queue[1:]
            
            for _, dir := range directions {
                newRow := pos[0] + dir[0]
                newCol := pos[1] + dir[1]
                
                if newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols {
                    continue
                }
                if grid[newRow][newCol] != 1 {
                    continue
                }
                
                // 新鮮橘子變腐爛
                grid[newRow][newCol] = 2
                freshCount--
                queue = append(queue, [2]int{newRow, newCol})
            }
        }
        
        if len(queue) > 0 {
            minutes++
        }
    }
    
    if freshCount > 0 {
        return -1  // 有橘子無法腐爛
    }
    return minutes
}
```

### 5. BFS vs DFS 詳細對比

| 特性 | BFS | DFS |
|-----|-----|-----|
| **資料結構** | 佇列 (Queue) | 堆疊 (Stack) 或遞迴 |
| **記憶體使用** | 寬度相關 O(w) | 深度相關 O(h) |
| **最短路徑** | ✅ 保證找到 | ❌ 不保證 |
| **全部路徑** | ❌ 不適合 | ✅ 適合 (回溯) |
| **實現難度** | 中等 | 簡單 (遞迴) |
| **適用場景** | 層級問題、最短路徑 | 排列組合、連通性 |

**選擇建議**:
- **求最短路徑** → 必用 BFS
- **層級相關** (如層序遍歷、右視圖) → 用 BFS
- **樹很寬** (完全二元樹) → 考慮 DFS (節省空間)
- **樹很深** (鏈狀樹) → 考慮 BFS (避免堆疊溢位)

### 6. BFS 優化技巧

#### 技巧一: 雙向 BFS

從起點和終點同時開始 BFS,相遇時即找到最短路徑。適用於起點和終點都已知的情況。

```go
func bidirectionalBFS(start, end string, wordList []string) int {
    wordSet := make(map[string]bool)
    for _, word := range wordList {
        wordSet[word] = true
    }
    
    if !wordSet[end] {
        return 0
    }
    
    // 兩個方向的集合
    beginSet := map[string]bool{start: true}
    endSet := map[string]bool{end: true}
    visited := make(map[string]bool)
    steps := 1
    
    for len(beginSet) > 0 && len(endSet) > 0 {
        // 優化: 總是從較小的集合開始擴展
        if len(beginSet) > len(endSet) {
            beginSet, endSet = endSet, beginSet
        }
        
        nextLevel := make(map[string]bool)
        
        for word := range beginSet {
            // 嘗試改變每個字母
            for i := 0; i < len(word); i++ {
                for c := 'a'; c <= 'z'; c++ {
                    newWord := word[:i] + string(c) + word[i+1:]
                    
                    // 兩個方向相遇
                    if endSet[newWord] {
                        return steps + 1
                    }
                    
                    if !visited[newWord] && wordSet[newWord] {
                        nextLevel[newWord] = true
                        visited[newWord] = true
                    }
                }
            }
        }
        
        beginSet = nextLevel
        steps++
    }
    
    return 0
}
```

#### 技巧二: 優先佇列 BFS (Dijkstra 變體)

當邊有不同權重時,使用優先佇列確保先處理距離較小的節點。

```go
type Item struct {
    node int
    dist int
}

type PriorityQueue []Item

func (pq PriorityQueue) Len() int           { return len(pq) }
func (pq PriorityQueue) Less(i, j int) bool { return pq[i].dist < pq[j].dist }
func (pq PriorityQueue) Swap(i, j int)      { pq[i], pq[j] = pq[j], pq[i] }

func (pq *PriorityQueue) Push(x interface{}) {
    *pq = append(*pq, x.(Item))
}

func (pq *PriorityQueue) Pop() interface{} {
    old := *pq
    n := len(old)
    item := old[n-1]
    *pq = old[0 : n-1]
    return item
}

func dijkstra(graph [][]int, start int) []int {
    n := len(graph)
    dist := make([]int, n)
    for i := range dist {
        dist[i] = math.MaxInt32
    }
    dist[start] = 0
    
    pq := &PriorityQueue{{start, 0}}
    heap.Init(pq)
    
    for pq.Len() > 0 {
        item := heap.Pop(pq).(Item)
        node, d := item.node, item.dist
        
        if d > dist[node] {
            continue
        }
        
        for neighbor, weight := range graph[node] {
            if weight > 0 {
                newDist := dist[node] + weight
                if newDist < dist[neighbor] {
                    dist[neighbor] = newDist
                    heap.Push(pq, Item{neighbor, newDist})
                }
            }
        }
    }
    
    return dist
}
```

#### 技巧三: 狀態壓縮

當節點狀態較複雜時,使用結構體或字串表示狀態。

```go
type State struct {
    x, y int
    keys int  // 使用位元表示持有的鑰匙
}

func shortestPathWithKeys(grid [][]byte) int {
    // 使用 State 作為 BFS 的節點
    visited := make(map[State]bool)
    queue := []State{{x: startX, y: startY, keys: 0}}
    steps := 0
    
    for len(queue) > 0 {
        levelSize := len(queue)
        
        for i := 0; i < levelSize; i++ {
            state := queue[0]
            queue = queue[1:]
            
            if state.keys == allKeys {
                return steps  // 收集到所有鑰匙
            }
            
            // ... 探索相鄰狀態
        }
        
        steps++
    }
    
    return -1
}
```

## 實際應用場景

### 1. 社交網絡 - 好友推薦

找出與使用者距離為 N 的所有人。

```go
func findFriendsAtDistance(userID string, distance int, graph map[string][]string) []string {
    result := []string{}
    visited := make(map[string]bool)
    queue := []struct {
        id   string
        dist int
    }{{userID, 0}}
    visited[userID] = true
    
    for len(queue) > 0 {
        current := queue[0]
        queue = queue[1:]
        
        if current.dist == distance {
            result = append(result, current.id)
            continue
        }
        
        if current.dist < distance {
            for _, friend := range graph[current.id] {
                if !visited[friend] {
                    visited[friend] = true
                    queue = append(queue, struct {
                        id   string
                        dist int
                    }{friend, current.dist + 1})
                }
            }
        }
    }
    
    return result
}
```

### 2. 網站爬蟲 - 廣度爬取

從起始 URL 開始,逐層爬取網頁。

```go
func crawlWebsite(startURL string, maxDepth int) []string {
    visited := make(map[string]bool)
    result := []string{}
    
    type Item struct {
        url   string
        depth int
    }
    queue := []Item{{startURL, 0}}
    visited[startURL] = true
    
    for len(queue) > 0 {
        item := queue[0]
        queue = queue[1:]
        
        if item.depth > maxDepth {
            continue
        }
        
        result = append(result, item.url)
        
        // 獲取頁面上的所有連結
        links := extractLinks(item.url)
        
        for _, link := range links {
            if !visited[link] {
                visited[link] = true
                queue = append(queue, Item{link, item.depth + 1})
            }
        }
    }
    
    return result
}
```

### 3. 遊戲開發 - 尋路算法

在遊戲地圖中尋找最短路徑。

```go
func findPath(grid [][]int, start, end Position) []Position {
    if grid[start.X][start.Y] == 1 || grid[end.X][end.Y] == 1 {
        return nil  // 起點或終點是牆
    }
    
    type Node struct {
        pos    Position
        parent *Node
    }
    
    queue := []*Node{{pos: start}}
    visited := make(map[Position]bool)
    visited[start] = true
    
    directions := []Position{{-1, 0}, {1, 0}, {0, -1}, {0, 1}}
    
    for len(queue) > 0 {
        current := queue[0]
        queue = queue[1:]
        
        if current.pos == end {
            // 回溯路徑
            path := []Position{}
            for node := current; node != nil; node = node.parent {
                path = append([]Position{node.pos}, path...)
            }
            return path
        }
        
        for _, dir := range directions {
            next := Position{
                X: current.pos.X + dir.X,
                Y: current.pos.Y + dir.Y,
            }
            
            if !isValid(grid, next) || visited[next] {
                continue
            }
            
            visited[next] = true
            queue = append(queue, &Node{pos: next, parent: current})
        }
    }
    
    return nil  // 無法到達
}
```

### 4. 任務調度 - 依賴解析

按層級執行任務,確保依賴的任務先執行。

```go
func executeTasksInOrder(tasks map[string][]string) []string {
    // tasks[A] = [B, C] 表示 A 依賴 B 和 C
    
    // 計算入度
    inDegree := make(map[string]int)
    for task := range tasks {
        if _, exists := inDegree[task]; !exists {
            inDegree[task] = 0
        }
        for _, dep := range tasks[task] {
            inDegree[dep]++
        }
    }
    
    // 找出所有入度為 0 的任務
    queue := []string{}
    for task, degree := range inDegree {
        if degree == 0 {
            queue = append(queue, task)
        }
    }
    
    result := []string{}
    
    for len(queue) > 0 {
        task := queue[0]
        queue = queue[1:]
        result = append(result, task)
        
        // 減少依賴此任務的其他任務的入度
        for _, dep := range tasks[task] {
            inDegree[dep]--
            if inDegree[dep] == 0 {
                queue = append(queue, dep)
            }
        }
    }
    
    if len(result) != len(tasks) {
        return nil  // 存在循環依賴
    }
    
    return result
}
```

## 總結

**BFS 核心要點**:
1. **遍歷策略**: 層層推進,先訪問相鄰節點
2. **資料結構**: 使用佇列實現 FIFO
3. **核心優勢**: 保證找到最短路徑
4. **層級遍歷**: 記錄每層的節點數量
5. **優化技巧**: 雙向 BFS、優先佇列、狀態壓縮

**面試高頻題目**:
- 二元樹層序遍歷
- 二元樹的右視圖 / 鋸齒形遍歷
- 島嶼問題 (最大面積、周長)
- 網格中的最短路徑
- 單詞接龍 (Word Ladder)
- 腐爛的橘子

**實際應用**:
- 社交網絡 (好友推薦、關係鏈)
- 網站爬蟲 (廣度爬取)
- 遊戲尋路 (A* 算法基礎)
- 任務調度 (拓撲排序)

BFS 是面試中的高頻考點,尤其是**最短路徑**和**層級遍歷**問題。必須熟練掌握標準模板,並能靈活應用於各種變體場景。
