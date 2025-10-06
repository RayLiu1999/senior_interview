# 最短路徑算法

- **難度**: 7
- **重要程度**: 4
- **標籤**: `Dijkstra`, `Bellman-Ford`, `Floyd-Warshall`, `最短路徑`, `圖論`

## 問題詳述

在圖論中，如何高效地找到從一個頂點到另一個頂點的最短路徑？不同的算法適用於哪些場景（單源 vs 多源、負權邊、稠密圖 vs 稀疏圖）？在實際後端系統中有哪些應用？

## 核心理論與詳解

### 1. Dijkstra 算法（單源最短路徑）

**適用場景**：
- 單源最短路徑問題（從一個起點到其他所有頂點）
- **不能處理負權邊**
- 適合稀疏圖

**核心思想**：
- 貪心策略：每次選擇當前距離最小的未訪問節點
- 用該節點更新其鄰居的距離
- 標記該節點為已訪問

**算法步驟**：
1. 初始化：起點距離為 0，其他節點距離為 ∞
2. 將起點加入優先佇列（最小堆）
3. 取出距離最小的節點 u
4. 遍歷 u 的所有鄰居 v，如果 `dist[u] + weight(u,v) < dist[v]`，則更新 `dist[v]`
5. 將更新後的 v 加入優先佇列
6. 重複步驟 3-5，直到佇列為空

**時間複雜度**：
- 使用優先佇列（堆）：**O((V + E) log V)**
- 使用陣列遍歷：**O(V²)**（適合稠密圖）

**空間複雜度**：**O(V)**

**核心程式碼框架**：

```go
package main

import "container/heap"

// 邊結構
type Edge struct {
    to, weight int
}

// 優先佇列節點
type Node struct {
    vertex, dist int
}

type PriorityQueue []*Node

func (pq PriorityQueue) Len() int           { return len(pq) }
func (pq PriorityQueue) Less(i, j int) bool { return pq[i].dist < pq[j].dist }
func (pq PriorityQueue) Swap(i, j int)      { pq[i], pq[j] = pq[j], pq[i] }
func (pq *PriorityQueue) Push(x interface{}) {
    *pq = append(*pq, x.(*Node))
}
func (pq *PriorityQueue) Pop() interface{} {
    old := *pq
    n := len(old)
    item := old[n-1]
    *pq = old[0 : n-1]
    return item
}

// Dijkstra 算法
func dijkstra(graph [][]Edge, start int) []int {
    n := len(graph)
    dist := make([]int, n)
    for i := range dist {
        dist[i] = 1<<31 - 1 // 初始化為最大值
    }
    dist[start] = 0
    
    pq := &PriorityQueue{}
    heap.Init(pq)
    heap.Push(pq, &Node{vertex: start, dist: 0})
    
    for pq.Len() > 0 {
        node := heap.Pop(pq).(*Node)
        u, d := node.vertex, node.dist
        
        if d > dist[u] {
            continue // 已找到更短路徑
        }
        
        // 鬆弛操作
        for _, edge := range graph[u] {
            v, w := edge.to, edge.weight
            if dist[u]+w < dist[v] {
                dist[v] = dist[u] + w
                heap.Push(pq, &Node{vertex: v, dist: dist[v]})
            }
        }
    }
    
    return dist
}
```

### 2. Bellman-Ford 算法（處理負權邊）

**適用場景**：
- 單源最短路徑
- **可以處理負權邊**
- 可以檢測負權環

**核心思想**：
- 動態規劃思想
- 對所有邊進行 V-1 輪鬆弛操作
- 每一輪都嘗試用已知路徑更新其他節點

**算法步驟**：
1. 初始化：起點距離為 0，其他節點為 ∞
2. 重複 V-1 次：
   - 遍歷所有邊 (u, v, w)
   - 如果 `dist[u] + w < dist[v]`，更新 `dist[v]`
3. 再遍歷一次所有邊，如果還能更新，說明存在負權環

**時間複雜度**：**O(V * E)**

**空間複雜度**：**O(V)**

**核心實現**：

```go
// Bellman-Ford 算法
func bellmanFord(edges [][3]int, n, start int) ([]int, bool) {
    // edges: [from, to, weight]
    dist := make([]int, n)
    for i := range dist {
        dist[i] = 1<<31 - 1
    }
    dist[start] = 0
    
    // V-1 輪鬆弛
    for i := 0; i < n-1; i++ {
        for _, edge := range edges {
            u, v, w := edge[0], edge[1], edge[2]
            if dist[u] != 1<<31-1 && dist[u]+w < dist[v] {
                dist[v] = dist[u] + w
            }
        }
    }
    
    // 檢測負權環
    for _, edge := range edges {
        u, v, w := edge[0], edge[1], edge[2]
        if dist[u] != 1<<31-1 && dist[u]+w < dist[v] {
            return nil, false // 存在負權環
        }
    }
    
    return dist, true
}
```

### 3. Floyd-Warshall 算法（多源最短路徑）

**適用場景**：
- **多源最短路徑**（求任意兩點之間的最短路徑）
- 可以處理負權邊
- 適合稠密圖或小規模圖

**核心思想**：
- 動態規劃
- `dp[k][i][j]` 表示從 i 到 j，經過前 k 個節點的最短路徑
- 狀態轉移：`dp[k][i][j] = min(dp[k-1][i][j], dp[k-1][i][k] + dp[k-1][k][j])`

**算法步驟**：
1. 初始化：`dist[i][j]` 為邊的權重（無邊則為 ∞，i=j 則為 0）
2. 枚舉中間節點 k（0 到 n-1）
3. 枚舉起點 i（0 到 n-1）
4. 枚舉終點 j（0 到 n-1）
5. 更新：`dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])`

**時間複雜度**：**O(V³)**

**空間複雜度**：**O(V²)**（可優化為滾動陣列）

**核心實現**：

```go
// Floyd-Warshall 算法
func floydWarshall(graph [][]int) [][]int {
    n := len(graph)
    dist := make([][]int, n)
    for i := range dist {
        dist[i] = make([]int, n)
        copy(dist[i], graph[i])
    }
    
    // 三重迴圈
    for k := 0; k < n; k++ {
        for i := 0; i < n; i++ {
            for j := 0; j < n; j++ {
                if dist[i][k] != 1<<31-1 && dist[k][j] != 1<<31-1 {
                    dist[i][j] = min(dist[i][j], dist[i][k]+dist[k][j])
                }
            }
        }
    }
    
    return dist
}

func min(a, b int) int {
    if a < b {
        return a
    }
    return b
}
```

### 4. SPFA 算法（Bellman-Ford 的佇列優化）

**特點**：
- 使用佇列優化 Bellman-Ford
- 只對距離更新過的節點的鄰居進行鬆弛
- 平均時間複雜度 **O(kE)**（k 是常數，通常很小）
- 最壞情況仍然是 **O(V * E)**

**核心實現**：

```go
// SPFA 算法
func spfa(graph [][]Edge, start int) []int {
    n := len(graph)
    dist := make([]int, n)
    inQueue := make([]bool, n)
    
    for i := range dist {
        dist[i] = 1<<31 - 1
    }
    dist[start] = 0
    
    queue := []int{start}
    inQueue[start] = true
    
    for len(queue) > 0 {
        u := queue[0]
        queue = queue[1:]
        inQueue[u] = false
        
        for _, edge := range graph[u] {
            v, w := edge.to, edge.weight
            if dist[u]+w < dist[v] {
                dist[v] = dist[u] + w
                if !inQueue[v] {
                    queue = append(queue, v)
                    inQueue[v] = true
                }
            }
        }
    }
    
    return dist
}
```

### 5. 算法對比與選擇

| 算法 | 時間複雜度 | 空間複雜度 | 適用場景 | 負權邊 |
|------|-----------|-----------|---------|--------|
| **Dijkstra** | O((V+E)logV) | O(V) | 單源、無負權邊、稀疏圖 | ❌ |
| **Bellman-Ford** | O(VE) | O(V) | 單源、有負權邊 | ✅ |
| **SPFA** | O(kE) 平均 | O(V) | 單源、有負權邊、稀疏圖 | ✅ |
| **Floyd-Warshall** | O(V³) | O(V²) | 多源、稠密小圖 | ✅ |

**選擇建議**：
- **無負權邊 + 單源**：Dijkstra（最優）
- **有負權邊 + 單源**：SPFA 或 Bellman-Ford
- **檢測負權環**：Bellman-Ford
- **多源最短路徑**：Floyd-Warshall
- **稠密圖 + 單源**：Dijkstra（陣列版）

### 6. 實際應用場景

#### 6.1 地圖導航與路徑規劃

**應用**：Google Maps、高德地圖

**特點**：
- 需要考慮實時路況（動態權重）
- 通常使用 A* 算法（Dijkstra 的啟發式優化）
- 預處理技術（Contraction Hierarchies）

**優化策略**：
```
1. 雙向 Dijkstra：同時從起點和終點搜尋
2. 啟發式搜尋：A* 算法使用歐幾里得距離作為啟發函數
3. 分層網路：高速公路優先
```

#### 6.2 網路路由協議

**應用**：OSPF（Open Shortest Path First）

**特點**：
- 基於 Dijkstra 算法
- 計算到達網路中所有路由器的最短路徑
- 鏈路狀態路由協議

#### 6.3 依賴管理與任務調度

**應用**：
- npm、Maven 依賴解析
- Kubernetes 資源分配
- CI/CD 流水線

**實現**：
```go
// 最短依賴鏈計算
type Package struct {
    name         string
    dependencies []string
}

func shortestDependencyChain(packages map[string]Package, target string) int {
    // 構建依賴圖
    graph := buildDependencyGraph(packages)
    
    // 使用 BFS 計算最短路徑（無權圖）
    queue := []string{target}
    visited := make(map[string]bool)
    depth := make(map[string]int)
    
    visited[target] = true
    depth[target] = 0
    
    maxDepth := 0
    for len(queue) > 0 {
        pkg := queue[0]
        queue = queue[1:]
        
        for _, dep := range packages[pkg].dependencies {
            if !visited[dep] {
                visited[dep] = true
                depth[dep] = depth[pkg] + 1
                maxDepth = max(maxDepth, depth[dep])
                queue = append(queue, dep)
            }
        }
    }
    
    return maxDepth
}
```

#### 6.4 社交網路分析

**應用**：
- LinkedIn「最短職業路徑」
- Facebook「共同好友」
- 影響力傳播分析

**特點**：
- 圖規模巨大（數億節點）
- 需要分散式計算（GraphX、Pregel）

#### 6.5 遊戲 AI 路徑尋找

**應用**：
- NPC 尋路
- RTS 遊戲單位移動

**算法選擇**：
- 小地圖：A* 算法
- 大地圖：JPS（Jump Point Search）
- 動態障礙物：D* 算法

### 7. 常見優化技巧

#### 7.1 啟發式優化（A* 算法）

```go
// A* 算法 = Dijkstra + 啟發函數
type AStarNode struct {
    vertex     int
    gCost      int // 從起點到當前節點的實際代價
    hCost      int // 從當前節點到終點的估計代價
    fCost      int // gCost + hCost
}

func aStar(graph [][]Edge, start, end int, heuristic func(int, int) int) int {
    // 優先佇列按 fCost 排序
    // heuristic(v, end) 計算估計距離
    // 常用：曼哈頓距離、歐幾里得距離
    
    // 實現類似 Dijkstra，但使用 fCost 作為優先級
    // ...
    return -1
}
```

#### 7.2 雙向搜尋

同時從起點和終點進行搜尋，相遇時停止，可大幅減少搜尋空間。

**時間複雜度優化**：O(b^(d/2)) vs O(b^d)（b 為分支因子，d 為深度）

#### 7.3 預處理與快取

對於靜態圖或變化不頻繁的圖：
- 預計算所有點對最短路徑（Floyd-Warshall）
- 使用快取存儲常查詢的路徑
- 分層網路技術

### 8. LeetCode 經典題目

| 題號 | 題目 | 難度 | 算法 |
|------|------|------|------|
| 743 | Network Delay Time | Medium | Dijkstra |
| 787 | Cheapest Flights Within K Stops | Medium | Bellman-Ford / DP |
| 1514 | Path with Maximum Probability | Medium | Dijkstra（變體）|
| 1334 | Find the City With Smallest Number of Neighbors | Medium | Floyd-Warshall |
| 882 | Reachable Nodes In Subdivided Graph | Hard | Dijkstra |

### 9. 面試常見問題

**Q1：Dijkstra 為什麼不能處理負權邊？**

A：Dijkstra 基於貪心策略，假設一旦節點被標記為「已訪問」，其最短路徑已確定。但負權邊可能使後續路徑更短，打破這個假設。

**Q2：如何檢測負權環？**

A：使用 Bellman-Ford 算法，在 V-1 輪鬆弛後，再進行一輪鬆弛。如果還能更新距離，說明存在負權環。

**Q3：如何優化 Dijkstra 算法？**

A：
1. 使用優先佇列（堆）而非陣列
2. 雙向搜尋
3. A* 啟發式搜尋
4. 預處理（Contraction Hierarchies）

**Q4：Floyd-Warshall 的實際應用場景？**

A：
- 小規模圖（節點數 < 500）
- 需要查詢所有點對最短路徑
- 傳遞閉包計算
- 圖的連通性判斷

## 總結

最短路徑算法是圖論的核心問題，不同算法有不同的適用場景：

**核心要點**：
1. **Dijkstra**：單源、無負權邊、最常用（O((V+E)logV)）
2. **Bellman-Ford**：單源、可處理負權邊、能檢測負權環（O(VE)）
3. **Floyd-Warshall**：多源、適合稠密小圖（O(V³)）
4. **SPFA**：Bellman-Ford 的優化，實踐中表現好（平均 O(kE)）

**實際應用**：
- 地圖導航：A* 算法（Dijkstra + 啟發式）
- 網路路由：OSPF 協議（Dijkstra）
- 依賴管理：BFS（無權圖）
- 社交網路：分散式圖計算

**面試準備**：
- 掌握 Dijkstra 和 Floyd-Warshall 的手寫實現
- 理解各算法的適用場景和時間複雜度
- 熟悉常見優化技巧（A*、雙向搜尋）
- 能夠分析實際應用中的圖模型

作為資深後端工程師，你需要能夠根據問題特徵（單源 vs 多源、有無負權邊、圖的規模）選擇合適的算法，並理解其在實際系統（如路由協議、依賴管理、推薦系統）中的應用。
