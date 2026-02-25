# 最小生成樹 (Minimum Spanning Tree)

- **難度**: 7
- **重要程度**: 4
- **標籤**: `最小生成樹`, `MST`, `Kruskal`, `Prim`, `貪心`, `圖論`

## 問題詳述

最小生成樹（MST）是連通加權圖中，**邊的總權重最小的生成樹**。生成樹包含圖中所有 n 個節點，恰好有 n-1 條邊，且無環。MST 在網路設計、城市規劃、電路連接等領域有廣泛應用。

## 核心理論與詳解

### 切割定理（Cut Property）

MST 的正確性基於切割定理：**對於圖中任意一個切割（將頂點分為兩個非空集合），橫跨切割的最小權重邊，必然屬於某棵 MST**。Kruskal 和 Prim 都基於此定理設計。

### Kruskal 算法

**核心思想**：貪心地按邊的權重**從小到大排序**，依序加入邊，若該邊不形成環則納入 MST。

**流程**：
1. 將所有邊按權重升序排序
2. 初始化並查集（每個節點各自為一個集合）
3. 遍歷每條邊 (u, v, w)：
   - 若 `Find(u) ≠ Find(v)`（不在同一集合，加入不形成環）：將此邊加入 MST，執行 `Union(u, v)`
   - 否則跳過（加入會形成環）
4. 直到 MST 有 n-1 條邊為止

**時間複雜度**：O(E log E)，瓶頸在邊的排序。適合**稀疏圖**（邊少）。

### Prim 算法

**核心思想**：從任意節點出發，貪心地**每次選擇距離已選集合最近的節點**，逐步擴展 MST。

**流程**：
1. 初始化：選定起始節點加入已選集合 S，其餘節點距離設為無窮大
2. 重複 n-1 次：
   - 在所有「一端在 S、另一端不在 S」的邊中，選出**最小權重的邊**
   - 將新節點加入 S，更新相鄰節點的最小距離
3. 直到所有節點加入 S

**時間複雜度**：
- 使用鄰接矩陣 + 線性搜尋：O(V²)，適合**稠密圖**（邊多）
- 使用最小堆（優先佇列）+ 鄰接表：O(E log V)，更通用

### 兩種算法比較

| 比較項目 | Kruskal | Prim |
|---------|---------|------|
| 核心思想 | 以**邊**為主，排序後貪心選邊 | 以**頂點**為主，擴展最近頂點 |
| 資料結構 | 排序 + 並查集 | 優先佇列（最小堆） |
| 適合圖型 | 稀疏圖（E 小） | 稠密圖（E 大），或需要線上處理 |
| 時間複雜度 | O(E log E) | O(E log V)（堆優化） |
| 實現難度 | 較簡單，借助並查集 | 較複雜，需維護距離表 |

### 實際應用

- **網路佈線**：用最少的線纜連接所有主機（城市、機房）
- **電路板設計**：最小化導線總長度
- **聚類分析**：MST 的最長邊可用來做圖聚類（刪掉最大的 k-1 條邊得到 k 個聚類）
- **近似旅行商問題（TSP）**：MST 是 TSP 的 2-近似解

## 程式碼範例

```go
package main

import (
    "fmt"
    "sort"
)

// Kruskal 算法實現

type Edge struct {
    u, v, w int
}

type UnionFind struct {
    parent, rank []int
}

func NewUF(n int) *UnionFind {
    p := make([]int, n)
    for i := range p { p[i] = i }
    return &UnionFind{parent: p, rank: make([]int, n)}
}

func (uf *UnionFind) Find(x int) int {
    if uf.parent[x] != x {
        uf.parent[x] = uf.Find(uf.parent[x])
    }
    return uf.parent[x]
}

func (uf *UnionFind) Union(x, y int) bool {
    rx, ry := uf.Find(x), uf.Find(y)
    if rx == ry { return false }
    if uf.rank[rx] < uf.rank[ry] { rx, ry = ry, rx }
    uf.parent[ry] = rx
    if uf.rank[rx] == uf.rank[ry] { uf.rank[rx]++ }
    return true
}

func kruskal(n int, edges []Edge) (int, []Edge) {
    sort.Slice(edges, func(i, j int) bool { return edges[i].w < edges[j].w })
    uf := NewUF(n)
    var mstEdges []Edge
    totalWeight := 0
    for _, e := range edges {
        if uf.Union(e.u, e.v) {
            mstEdges = append(mstEdges, e)
            totalWeight += e.w
            if len(mstEdges) == n-1 { break } // 已找到 n-1 條邊
        }
    }
    return totalWeight, mstEdges
}

func main() {
    // 4 個節點，5 條邊
    edges := []Edge{{0, 1, 10}, {0, 2, 6}, {0, 3, 5}, {1, 3, 15}, {2, 3, 4}}
    weight, mst := kruskal(4, edges)
    fmt.Println("MST 總權重:", weight) // 19
    for _, e := range mst {
        fmt.Printf("  邊 (%d-%d), 權重 %d\n", e.u, e.v, e.w)
    }
}
```
