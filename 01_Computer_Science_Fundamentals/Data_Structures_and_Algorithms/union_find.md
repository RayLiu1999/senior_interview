# 並查集 (Union-Find / Disjoint Set Union)

- **難度**: 6
- **重要程度**: 4
- **標籤**: `並查集`, `Union-Find`, `DSU`, `連通分量`, `圖論`

## 問題詳述

並查集（Union-Find 或 Disjoint Set Union，DSU）是一種高效處理**動態連通性問題**的資料結構，能夠以近乎 O(1) 的均攤時間合併集合與查詢元素所屬集合。

## 核心理論與詳解

### 核心操作

並查集只支援三種基本操作：

1. **初始化 `MakeSet(x)`**：每個元素各自成為一個集合，以自身為根。
2. **查詢 `Find(x)`**：找到元素 x 所在集合的**根節點（代表元素）**。
3. **合併 `Union(x, y)`**：將 x 和 y 所在的兩個集合合併為一個。

### 兩個關鍵優化

在樸素實現中，`Find` 最壞情況是 O(n)（退化為鏈式結構）。兩個優化可以將均攤複雜度降到接近 O(1)：

**① 路徑壓縮（Path Compression）**

在 `Find` 操作執行後，將沿途所有節點直接指向根節點，使樹保持極度扁平。

```
查詢前：A → B → C → D（根）
查詢後：A → D、B → D、C → D（全部直接指向根）
```

**② 按秩合併（Union by Rank）**

合併時，將**高度較小的樹作為子樹**接在高度較大的樹下方，防止樹高增長過快。也可用節點數量（Union by Size）代替高度。

### 時間複雜度分析

同時應用兩種優化後，n 次操作的時間複雜度為 **O(n · α(n))**，其中 α 是阿克曼函數的反函數。實際上 **α(n) ≤ 4**（對任何天文數字的 n 而言），因此可視為均攤 **O(1)**。

### 典型應用場景

| 場景 | 說明 |
|------|------|
| **判斷圖的連通分量** | 快速判斷兩節點是否在同一連通分量中 |
| **Kruskal 最小生成樹** | 判斷加入邊是否形成環（若兩端點 Find 結果相同則成環） |
| **網路連通性問題** | 動態加邊後判斷整體是否連通 |
| **社交圈分析** | 判斷兩使用者是否在同一社交群組 |
| **LeetCode 島嶼問題** | 合併相鄰陸地，統計島嶼數量 |

### 變體：加權並查集

在 `Union-Find` 中附加權重資訊，可以解決**帶關係的連通性問題**，例如：
- 「A 是 B 的 2 倍」這類等式關係的傳遞性查詢
- 食物鏈問題（動物之間的捕食關係）

## 程式碼範例

```go
package main

import "fmt"

type UnionFind struct {
    parent []int
    rank   []int
}

func NewUnionFind(n int) *UnionFind {
    parent := make([]int, n)
    rank := make([]int, n)
    for i := range parent {
        parent[i] = i // 初始化：每個元素的父節點是自身
    }
    return &UnionFind{parent: parent, rank: rank}
}

// Find：帶路徑壓縮
func (uf *UnionFind) Find(x int) int {
    if uf.parent[x] != x {
        uf.parent[x] = uf.Find(uf.parent[x]) // 路徑壓縮：遞迴後直接指向根
    }
    return uf.parent[x]
}

// Union：按秩合併
func (uf *UnionFind) Union(x, y int) bool {
    rootX, rootY := uf.Find(x), uf.Find(y)
    if rootX == rootY {
        return false // 已在同一集合，合併失敗（可用來判斷成環）
    }
    // 將秩較小的樹接到秩較大的樹下
    if uf.rank[rootX] < uf.rank[rootY] {
        rootX, rootY = rootY, rootX
    }
    uf.parent[rootY] = rootX
    if uf.rank[rootX] == uf.rank[rootY] {
        uf.rank[rootX]++
    }
    return true
}

// Connected：判斷兩元素是否在同一集合
func (uf *UnionFind) Connected(x, y int) bool {
    return uf.Find(x) == uf.Find(y)
}

func main() {
    uf := NewUnionFind(6) // 節點 0~5
    uf.Union(0, 1)
    uf.Union(1, 2)
    uf.Union(3, 4)

    fmt.Println(uf.Connected(0, 2)) // true：0-1-2 在同一集合
    fmt.Println(uf.Connected(0, 3)) // false：不同集合
    fmt.Println(uf.Connected(3, 5)) // false
    uf.Union(2, 4)
    fmt.Println(uf.Connected(0, 4)) // true：合併後 0-1-2-4-3 連通
}
```
