# 圖的表示與遍歷

- **難度**: 6
- **重要程度**: 4
- **標籤**: `鄰接表`, `鄰接矩陣`, `BFS`, `DFS`, `拓撲排序`

## 問題詳述

圖 (Graph) 是一種非線性資料結構，由頂點 (Vertices) 和邊 (Edges) 組成。理解圖的表示方式（鄰接表、鄰接矩陣）和遍歷算法（DFS、BFS）是解決社交網路、路徑規劃、依賴分析等問題的基礎。

## 核心理論與詳解

### 1. 圖的基本概念

#### 圖的類型

- **無向圖**: 邊沒有方向，A-B 表示雙向連接
- **有向圖**: 邊有方向，A→B 不等於 B→A
- **加權圖**: 邊有權重（距離、成本等）
- **無權圖**: 邊無權重，或權重都為 1

### 2. 圖的表示方式

#### 方法 1: 鄰接矩陣 (Adjacency Matrix)

```go
// 用二維陣列表示
type GraphMatrix struct {
    vertices int
    matrix   [][]int
}

func NewGraphMatrix(n int) *GraphMatrix {
    matrix := make([][]int, n)
    for i := range matrix {
        matrix[i] = make([]int, n)
    }
    return &GraphMatrix{vertices: n, matrix: matrix}
}

// 添加邊
func (g *GraphMatrix) AddEdge(from, to, weight int) {
    g.matrix[from][to] = weight
    // 無向圖需要反向也添加
    // g.matrix[to][from] = weight
}

// 檢查是否有邊
func (g *GraphMatrix) HasEdge(from, to int) bool {
    return g.matrix[from][to] != 0
}
```

**優缺點**:
- ✅ 查詢邊 O(1)
- ✅ 適合稠密圖
- ❌ 空間 O(V²)，稀疏圖浪費
- ❌ 遍歷所有鄰居 O(V)

#### 方法 2: 鄰接表 (Adjacency List)

```go
type Edge struct {
    to     int
    weight int
}

type GraphList struct {
    vertices int
    adjList  [][]Edge
}

func NewGraphList(n int) *GraphList {
    return &GraphList{
        vertices: n,
        adjList:  make([][]Edge, n),
    }
}

// 添加邊
func (g *GraphList) AddEdge(from, to, weight int) {
    g.adjList[from] = append(g.adjList[from], Edge{to, weight})
    // 無向圖
    // g.adjList[to] = append(g.adjList[to], Edge{from, weight})
}

// 獲取鄰居
func (g *GraphList) GetNeighbors(vertex int) []Edge {
    return g.adjList[vertex]
}
```

**優缺點**:
- ✅ 空間 O(V + E)，適合稀疏圖
- ✅ 遍歷鄰居 O(degree)
- ❌ 查詢邊 O(degree)
- ✅ **實際應用中最常用**

### 3. 圖的遍歷

#### DFS (深度優先搜尋)

```go
func (g *GraphList) DFS(start int) {
    visited := make([]bool, g.vertices)
    g.dfsHelper(start, visited)
}

func (g *GraphList) dfsHelper(v int, visited []bool) {
    visited[v] = true
    fmt.Println(v)
    
    for _, edge := range g.adjList[v] {
        if !visited[edge.to] {
            g.dfsHelper(edge.to, visited)
        }
    }
}

// 迭代版本（用堆疊）
func (g *GraphList) DFSIterative(start int) {
    visited := make([]bool, g.vertices)
    stack := []int{start}
    
    for len(stack) > 0 {
        v := stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        
        if visited[v] {
            continue
        }
        
        visited[v] = true
        fmt.Println(v)
        
        for _, edge := range g.adjList[v] {
            if !visited[edge.to] {
                stack = append(stack, edge.to)
            }
        }
    }
}
```

**時間複雜度**: O(V + E)
**應用**: 路徑查找、環檢測、拓撲排序

#### BFS (廣度優先搜尋)

```go
func (g *GraphList) BFS(start int) {
    visited := make([]bool, g.vertices)
    queue := []int{start}
    visited[start] = true
    
    for len(queue) > 0 {
        v := queue[0]
        queue = queue[1:]
        fmt.Println(v)
        
        for _, edge := range g.adjList[v] {
            if !visited[edge.to] {
                visited[edge.to] = true
                queue = append(queue, edge.to)
            }
        }
    }
}

// 帶層級的 BFS
func (g *GraphList) BFSLevel(start int) {
    visited := make([]bool, g.vertices)
    queue := []int{start}
    visited[start] = true
    level := 0
    
    for len(queue) > 0 {
        size := len(queue)
        fmt.Printf("Level %d: ", level)
        
        for i := 0; i < size; i++ {
            v := queue[0]
            queue = queue[1:]
            fmt.Printf("%d ", v)
            
            for _, edge := range g.adjList[v] {
                if !visited[edge.to] {
                    visited[edge.to] = true
                    queue = append(queue, edge.to)
                }
            }
        }
        fmt.Println()
        level++
    }
}
```

**時間複雜度**: O(V + E)
**應用**: 最短路徑、層級遍歷

### 4. 經典應用題

#### Q1: 判斷是否有環（無向圖）

```go
func (g *GraphList) HasCycle() bool {
    visited := make([]bool, g.vertices)
    
    for i := 0; i < g.vertices; i++ {
        if !visited[i] {
            if g.hasCycleDFS(i, -1, visited) {
                return true
            }
        }
    }
    return false
}

func (g *GraphList) hasCycleDFS(v, parent int, visited []bool) bool {
    visited[v] = true
    
    for _, edge := range g.adjList[v] {
        if !visited[edge.to] {
            if g.hasCycleDFS(edge.to, v, visited) {
                return true
            }
        } else if edge.to != parent {
            return true  // 找到環
        }
    }
    return false
}
```

#### Q2: 判斷是否有環（有向圖）

```go
func (g *GraphList) HasCycleDirected() bool {
    visited := make([]bool, g.vertices)
    recStack := make([]bool, g.vertices)
    
    for i := 0; i < g.vertices; i++ {
        if !visited[i] {
            if g.hasCycleDFSDirected(i, visited, recStack) {
                return true
            }
        }
    }
    return false
}

func (g *GraphList) hasCycleDFSDirected(v int, visited, recStack []bool) bool {
    visited[v] = true
    recStack[v] = true
    
    for _, edge := range g.adjList[v] {
        if !visited[edge.to] {
            if g.hasCycleDFSDirected(edge.to, visited, recStack) {
                return true
            }
        } else if recStack[edge.to] {
            return true  // 回到遞迴堆疊中的節點
        }
    }
    
    recStack[v] = false
    return false
}
```

#### Q3: 無權圖最短路徑（BFS）

```go
func (g *GraphList) ShortestPath(start, end int) int {
    if start == end {
        return 0
    }
    
    visited := make([]bool, g.vertices)
    queue := []int{start}
    visited[start] = true
    dist := 0
    
    for len(queue) > 0 {
        size := len(queue)
        dist++
        
        for i := 0; i < size; i++ {
            v := queue[0]
            queue = queue[1:]
            
            for _, edge := range g.adjList[v] {
                if edge.to == end {
                    return dist
                }
                if !visited[edge.to] {
                    visited[edge.to] = true
                    queue = append(queue, edge.to)
                }
            }
        }
    }
    return -1  // 無法到達
}
```

#### Q4: 連通分量數量

```go
func (g *GraphList) CountComponents() int {
    visited := make([]bool, g.vertices)
    count := 0
    
    for i := 0; i < g.vertices; i++ {
        if !visited[i] {
            g.dfsHelper(i, visited)
            count++
        }
    }
    return count
}
```

### 5. 實際應用場景

#### 1. 社交網路

```go
// 找共同好友
func (g *GraphList) CommonFriends(user1, user2 int) []int {
    friends1 := make(map[int]bool)
    for _, edge := range g.adjList[user1] {
        friends1[edge.to] = true
    }
    
    common := []int{}
    for _, edge := range g.adjList[user2] {
        if friends1[edge.to] {
            common = append(common, edge.to)
        }
    }
    return common
}

// 好友推薦（二度好友）
func (g *GraphList) RecommendFriends(user int) []int {
    friends := make(map[int]bool)
    for _, edge := range g.adjList[user] {
        friends[edge.to] = true
    }
    
    secondDegree := make(map[int]int)  // 候選人 → 共同好友數
    
    for _, edge := range g.adjList[user] {
        friend := edge.to
        for _, e2 := range g.adjList[friend] {
            candidate := e2.to
            if candidate != user && !friends[candidate] {
                secondDegree[candidate]++
            }
        }
    }
    
    // 按共同好友數排序...
    return []int{}
}
```

#### 2. 依賴管理（拓撲排序）

```go
func (g *GraphList) TopologicalSort() []int {
    inDegree := make([]int, g.vertices)
    
    // 計算入度
    for i := 0; i < g.vertices; i++ {
        for _, edge := range g.adjList[i] {
            inDegree[edge.to]++
        }
    }
    
    // 入度為 0 的加入佇列
    queue := []int{}
    for i := 0; i < g.vertices; i++ {
        if inDegree[i] == 0 {
            queue = append(queue, i)
        }
    }
    
    result := []int{}
    
    for len(queue) > 0 {
        v := queue[0]
        queue = queue[1:]
        result = append(result, v)
        
        for _, edge := range g.adjList[v] {
            inDegree[edge.to]--
            if inDegree[edge.to] == 0 {
                queue = append(queue, edge.to)
            }
        }
    }
    
    if len(result) != g.vertices {
        return nil  // 有環，無法拓撲排序
    }
    return result
}
```

#### 3. 網頁爬蟲

```go
func (g *GraphList) WebCrawler(startURL int, maxDepth int) {
    visited := make([]bool, g.vertices)
    g.crawl(startURL, 0, maxDepth, visited)
}

func (g *GraphList) crawl(url, depth, maxDepth int, visited []bool) {
    if depth > maxDepth || visited[url] {
        return
    }
    
    visited[url] = true
    fmt.Printf("Crawling: %d at depth %d\n", url, depth)
    
    for _, edge := range g.adjList[url] {
        g.crawl(edge.to, depth+1, maxDepth, visited)
    }
}
```

## 總結

### 核心要點

1. **鄰接表**: 空間 O(V+E)，適合稀疏圖，實際最常用
2. **鄰接矩陣**: 空間 O(V²)，查詢快，適合稠密圖
3. **DFS**: 用堆疊，適合路徑、環檢測、拓撲排序
4. **BFS**: 用佇列，適合最短路徑、層級遍歷
5. **時間複雜度**: DFS/BFS 都是 O(V + E)

### 作為資深後端工程師，你需要

- ✅ 掌握鄰接表和鄰接矩陣的實現和選擇
- ✅ 熟練使用 DFS 和 BFS 解決問題
- ✅ 理解環檢測、拓撲排序等經典算法
- ✅ 在社交網路、依賴管理等場景中應用圖
