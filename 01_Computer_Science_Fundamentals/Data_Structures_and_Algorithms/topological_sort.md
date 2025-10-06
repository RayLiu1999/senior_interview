# 拓撲排序與依賴關係

- **難度**: 6
- **重要程度**: 4
- **標籤**: `拓撲排序`, `DAG`, `有向無環圖`, `依賴關係`, `任務調度`

## 問題詳述

在有向無環圖 (DAG) 中，如何找到一個線性排序，使得對於任意有向邊 (u, v)，u 都排在 v 之前？這在處理任務依賴、編譯順序、課程安排等實際問題中非常重要。如何檢測環的存在？有哪些高效的實現方法？

## 核心理論與詳解

### 1. 基本概念

**拓撲排序（Topological Sort）**：
- 對有向無環圖 (DAG) 的頂點進行線性排序
- 使得對於每條有向邊 (u, v)，u 都出現在 v 之前
- **只有 DAG 才有拓撲排序**（有環圖無法排序）

**有向無環圖（DAG - Directed Acyclic Graph）**：
- Directed：有方向的邊
- Acyclic：無環
- 用於表示依賴關係、偏序關係

**入度（In-degree）**：
- 指向該節點的邊的數量
- 入度為 0 的節點沒有依賴項，可以最先執行

**應用場景**：
- **任務調度**：有依賴關係的任務執行順序
- **編譯順序**：程式檔案的編譯依賴
- **課程安排**：有先修課程要求的課程順序
- **依賴管理**：npm、Maven 等套件依賴解析

### 2. 兩種實現方法

#### 2.1 Kahn 算法（BFS - 基於入度）

**核心思想**：
1. 統計所有節點的入度
2. 將入度為 0 的節點加入佇列
3. 從佇列取出節點，加入結果序列
4. 將該節點的所有鄰居的入度減 1
5. 如果鄰居入度變為 0，加入佇列
6. 重複步驟 3-5，直到佇列為空

**算法步驟**：

```go
package main

import "fmt"

// Kahn 算法（BFS 版本）
func topologicalSortKahn(n int, edges [][]int) []int {
    // 構建鄰接表和入度陣列
    graph := make([][]int, n)
    inDegree := make([]int, n)
    
    for _, edge := range edges {
        from, to := edge[0], edge[1]
        graph[from] = append(graph[from], to)
        inDegree[to]++
    }
    
    // 將入度為 0 的節點加入佇列
    queue := []int{}
    for i := 0; i < n; i++ {
        if inDegree[i] == 0 {
            queue = append(queue, i)
        }
    }
    
    result := []int{}
    
    // BFS 遍歷
    for len(queue) > 0 {
        node := queue[0]
        queue = queue[1:]
        result = append(result, node)
        
        // 處理鄰居節點
        for _, neighbor := range graph[node] {
            inDegree[neighbor]--
            if inDegree[neighbor] == 0 {
                queue = append(queue, neighbor)
            }
        }
    }
    
    // 檢測環：如果處理的節點數少於總節點數，說明有環
    if len(result) != n {
        return nil // 存在環，無法完成拓撲排序
    }
    
    return result
}
```

**時間複雜度**：**O(V + E)**
- V 是頂點數，E 是邊數
- 每個節點和邊都只訪問一次

**空間複雜度**：**O(V + E)**
- 鄰接表：O(V + E)
- 入度陣列：O(V)
- 佇列：最多 O(V)

#### 2.2 DFS 算法（基於深度優先搜尋）

**核心思想**：
1. 對每個未訪問的節點進行 DFS
2. 遞迴訪問所有鄰居
3. 訪問完所有鄰居後，將當前節點加入結果序列的**開頭**（或用棧）
4. 使用三色標記法檢測環：白色（未訪問）、灰色（訪問中）、黑色（已完成）

**算法實現**：

```go
// DFS 版本拓撲排序
func topologicalSortDFS(n int, edges [][]int) []int {
    // 構建鄰接表
    graph := make([][]int, n)
    for _, edge := range edges {
        from, to := edge[0], edge[1]
        graph[from] = append(graph[from], to)
    }
    
    // 0: 未訪問（白色）, 1: 訪問中（灰色）, 2: 已完成（黑色）
    visited := make([]int, n)
    result := []int{}
    hasCycle := false
    
    var dfs func(int)
    dfs = func(node int) {
        if hasCycle {
            return
        }
        
        if visited[node] == 1 {
            // 訪問中的節點再次被訪問，說明有環
            hasCycle = true
            return
        }
        
        if visited[node] == 2 {
            // 已經處理過
            return
        }
        
        visited[node] = 1 // 標記為訪問中
        
        // 遞迴訪問所有鄰居
        for _, neighbor := range graph[node] {
            dfs(neighbor)
        }
        
        visited[node] = 2 // 標記為已完成
        result = append([]int{node}, result...) // 加入結果序列開頭
    }
    
    // 對所有未訪問的節點進行 DFS
    for i := 0; i < n; i++ {
        if visited[i] == 0 {
            dfs(i)
        }
    }
    
    if hasCycle {
        return nil
    }
    
    return result
}
```

**時間複雜度**：**O(V + E)**

**空間複雜度**：**O(V + E)**
- 鄰接表：O(V + E)
- 遞迴棧：最壞 O(V)

### 3. 兩種方法對比

| 特性 | Kahn 算法 (BFS) | DFS 算法 |
|------|----------------|----------|
| **實現方式** | 基於入度的 BFS | 深度優先搜尋 |
| **易理解性** | 更直觀（從無依賴項開始） | 需要理解遞迴和回溯 |
| **環檢測** | 簡單（檢查處理節點數） | 需要三色標記法 |
| **多解情況** | 按入度順序處理 | 按 DFS 訪問順序 |
| **適用場景** | 任務調度、依賴解析 | 編譯順序、模組載入 |

**選擇建議**：
- **Kahn 算法**：更直觀，適合實際應用（任務調度、依賴管理）
- **DFS 算法**：更簡潔，適合理論分析和競賽

### 4. 實際應用場景

#### 4.1 任務調度系統

**場景**：CI/CD 流水線、工作流引擎

```go
// 任務調度示例
type Task struct {
    ID           string
    Name         string
    Dependencies []string // 依賴的任務 ID
    Execute      func() error
}

type TaskScheduler struct {
    tasks map[string]*Task
}

func (ts *TaskScheduler) Schedule() ([]string, error) {
    // 構建任務圖
    n := len(ts.tasks)
    idToIndex := make(map[string]int)
    indexToID := make([]string, 0, n)
    
    i := 0
    for id := range ts.tasks {
        idToIndex[id] = i
        indexToID = append(indexToID, id)
        i++
    }
    
    edges := [][]int{}
    for id, task := range ts.tasks {
        from := idToIndex[id]
        for _, depID := range task.Dependencies {
            to := idToIndex[depID]
            edges = append(edges, []int{to, from}) // 依賴項 -> 當前任務
        }
    }
    
    // 拓撲排序
    order := topologicalSortKahn(n, edges)
    if order == nil {
        return nil, fmt.Errorf("循環依賴檢測")
    }
    
    // 轉換為任務 ID
    result := make([]string, len(order))
    for i, idx := range order {
        result[i] = indexToID[idx]
    }
    
    return result, nil
}

func (ts *TaskScheduler) Run() error {
    order, err := ts.Schedule()
    if err != nil {
        return err
    }
    
    // 按順序執行任務
    for _, taskID := range order {
        task := ts.tasks[taskID]
        fmt.Printf("執行任務: %s\n", task.Name)
        if err := task.Execute(); err != nil {
            return fmt.Errorf("任務 %s 執行失敗: %w", task.Name, err)
        }
    }
    
    return nil
}
```

**實際應用**：
- **Airflow**：任務依賴調度
- **Kubernetes**：資源創建順序（Deployment -> Service -> Ingress）
- **Terraform**：資源依賴管理

#### 4.2 編譯依賴管理

**場景**：Build 系統（Make、Bazel、Gradle）

```go
// 編譯順序示例
type SourceFile struct {
    Name    string
    Imports []string // 依賴的檔案
}

func getCompileOrder(files map[string]*SourceFile) ([]string, error) {
    n := len(files)
    nameToIndex := make(map[string]int)
    indexToName := []string{}
    
    i := 0
    for name := range files {
        nameToIndex[name] = i
        indexToName = append(indexToName, name)
        i++
    }
    
    edges := [][]int{}
    for name, file := range files {
        from := nameToIndex[name]
        for _, importName := range file.Imports {
            if to, exists := nameToIndex[importName]; exists {
                edges = append(edges, []int{to, from}) // 被導入檔案 -> 當前檔案
            }
        }
    }
    
    order := topologicalSortKahn(n, edges)
    if order == nil {
        return nil, fmt.Errorf("檢測到循環依賴")
    }
    
    result := make([]string, len(order))
    for i, idx := range order {
        result[i] = indexToName[idx]
    }
    
    return result, nil
}
```

#### 4.3 課程安排

**場景**：教務系統、學習路徑規劃

**LeetCode 207. Course Schedule**：

```go
// 課程表問題：判斷是否可以完成所有課程
func canFinish(numCourses int, prerequisites [][]int) bool {
    graph := make([][]int, numCourses)
    inDegree := make([]int, numCourses)
    
    for _, pre := range prerequisites {
        course, prereq := pre[0], pre[1]
        graph[prereq] = append(graph[prereq], course)
        inDegree[course]++
    }
    
    queue := []int{}
    for i := 0; i < numCourses; i++ {
        if inDegree[i] == 0 {
            queue = append(queue, i)
        }
    }
    
    count := 0
    for len(queue) > 0 {
        course := queue[0]
        queue = queue[1:]
        count++
        
        for _, next := range graph[course] {
            inDegree[next]--
            if inDegree[next] == 0 {
                queue = append(queue, next)
            }
        }
    }
    
    return count == numCourses // 所有課程都能完成
}
```

**LeetCode 210. Course Schedule II**（返回學習順序）：

```go
func findOrder(numCourses int, prerequisites [][]int) []int {
    graph := make([][]int, numCourses)
    inDegree := make([]int, numCourses)
    
    for _, pre := range prerequisites {
        course, prereq := pre[0], pre[1]
        graph[prereq] = append(graph[prereq], course)
        inDegree[course]++
    }
    
    queue := []int{}
    for i := 0; i < numCourses; i++ {
        if inDegree[i] == 0 {
            queue = append(queue, i)
        }
    }
    
    result := []int{}
    for len(queue) > 0 {
        course := queue[0]
        queue = queue[1:]
        result = append(result, course)
        
        for _, next := range graph[course] {
            inDegree[next]--
            if inDegree[next] == 0 {
                queue = append(queue, next)
            }
        }
    }
    
    if len(result) != numCourses {
        return []int{} // 存在循環依賴
    }
    
    return result
}
```

#### 4.4 依賴套件管理

**場景**：npm、Maven、Go Modules

**特點**：
- 需要解析套件依賴關係
- 檢測循環依賴
- 確定安裝順序

```go
// 套件依賴解析示例
type Package struct {
    Name         string
    Version      string
    Dependencies []*Package
}

func resolveDependencies(rootPkg *Package) ([]*Package, error) {
    visited := make(map[string]bool)
    visiting := make(map[string]bool) // 檢測環
    result := []*Package{}
    
    var dfs func(*Package) error
    dfs = func(pkg *Package) error {
        key := pkg.Name + "@" + pkg.Version
        
        if visiting[key] {
            return fmt.Errorf("檢測到循環依賴: %s", key)
        }
        
        if visited[key] {
            return nil
        }
        
        visiting[key] = true
        
        for _, dep := range pkg.Dependencies {
            if err := dfs(dep); err != nil {
                return err
            }
        }
        
        visiting[key] = false
        visited[key] = true
        result = append(result, pkg)
        
        return nil
    }
    
    if err := dfs(rootPkg); err != nil {
        return nil, err
    }
    
    return result, nil
}
```

### 5. 環檢測與處理

#### 5.1 為什麼要檢測環？

- 有環的圖無法進行拓撲排序
- 實際意義：循環依賴、死鎖

#### 5.2 環檢測方法

**方法 1：Kahn 算法**

```go
// 處理的節點數 < 總節點數，說明有環
if len(result) != n {
    return nil, fmt.Errorf("存在環")
}
```

**方法 2：DFS 三色標記法**

```go
// 白色(0)：未訪問
// 灰色(1)：訪問中（在當前 DFS 路徑上）
// 黑色(2)：已完成

if visited[node] == 1 {
    // 再次訪問灰色節點，說明有環
    return true
}
```

#### 5.3 找出所有環

```go
func findAllCycles(n int, edges [][]int) [][]int {
    graph := make([][]int, n)
    for _, edge := range edges {
        graph[edge[0]] = append(graph[edge[0]], edge[1])
    }
    
    visited := make([]bool, n)
    inPath := make([]bool, n)
    path := []int{}
    cycles := [][]int{}
    
    var dfs func(int)
    dfs = func(node int) {
        visited[node] = true
        inPath[node] = true
        path = append(path, node)
        
        for _, neighbor := range graph[node] {
            if !visited[neighbor] {
                dfs(neighbor)
            } else if inPath[neighbor] {
                // 找到環：從 neighbor 到 path 末尾
                cycle := []int{}
                found := false
                for _, n := range path {
                    if n == neighbor {
                        found = true
                    }
                    if found {
                        cycle = append(cycle, n)
                    }
                }
                cycles = append(cycles, cycle)
            }
        }
        
        path = path[:len(path)-1]
        inPath[node] = false
    }
    
    for i := 0; i < n; i++ {
        if !visited[i] {
            dfs(i)
        }
    }
    
    return cycles
}
```

### 6. 變體與擴展

#### 6.1 字典序最小的拓撲排序

使用優先佇列（最小堆）代替普通佇列：

```go
import "container/heap"

type IntHeap []int
func (h IntHeap) Len() int           { return len(h) }
func (h IntHeap) Less(i, j int) bool { return h[i] < h[j] }
func (h IntHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *IntHeap) Push(x interface{}) { *h = append(*h, x.(int)) }
func (h *IntHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}

func topologicalSortLexical(n int, edges [][]int) []int {
    // 使用最小堆保證字典序最小
    pq := &IntHeap{}
    heap.Init(pq)
    
    // ... 其他邏輯類似 Kahn 算法
    // 只是用 heap.Push/Pop 代替 queue
    
    return []int{}
}
```

#### 6.2 所有可能的拓撲排序

使用回溯法列舉所有可能：

```go
func allTopologicalSorts(n int, edges [][]int) [][]int {
    // 構建圖和入度
    graph := make([][]int, n)
    inDegree := make([]int, n)
    for _, edge := range edges {
        graph[edge[0]] = append(graph[edge[0]], edge[1])
        inDegree[edge[1]]++
    }
    
    result := [][]int{}
    path := []int{}
    visited := make([]bool, n)
    
    var backtrack func()
    backtrack = func() {
        if len(path) == n {
            temp := make([]int, n)
            copy(temp, path)
            result = append(result, temp)
            return
        }
        
        for i := 0; i < n; i++ {
            if !visited[i] && inDegree[i] == 0 {
                visited[i] = true
                path = append(path, i)
                
                // 減少鄰居入度
                for _, neighbor := range graph[i] {
                    inDegree[neighbor]--
                }
                
                backtrack()
                
                // 回溯
                for _, neighbor := range graph[i] {
                    inDegree[neighbor]++
                }
                path = path[:len(path)-1]
                visited[i] = false
            }
        }
    }
    
    backtrack()
    return result
}
```

### 7. LeetCode 經典題目

| 題號 | 題目 | 難度 | 說明 |
|------|------|------|------|
| 207 | Course Schedule | Medium | 判斷是否有環 |
| 210 | Course Schedule II | Medium | 返回拓撲排序 |
| 269 | Alien Dictionary | Hard | 字典序拓撲排序 |
| 310 | Minimum Height Trees | Medium | 拓撲排序變體 |
| 444 | Sequence Reconstruction | Medium | 唯一拓撲排序 |
| 1203 | Sort Items by Groups Respecting Dependencies | Hard | 兩層拓撲排序 |

### 8. 面試常見問題

**Q1：拓撲排序的結果唯一嗎？**

A：不一定。當有多個入度為 0 的節點時，可以任選一個，導致多種可能的拓撲排序。唯一的條件是圖形成一條鏈（每個節點只有一個前驅）。

**Q2：如何判斷拓撲排序是否唯一？**

A：在 Kahn 算法執行過程中，如果每次佇列中最多只有一個節點，則拓撲排序唯一。

**Q3：Kahn 和 DFS 哪個更好？**

A：
- **Kahn**：更直觀，適合實際應用，易於理解
- **DFS**：程式碼更簡潔，遞迴實現優雅

實際工作中推薦 Kahn 算法。

**Q4：如何處理有權重的任務調度？**

A：拓撲排序只確定執行順序，不考慮權重。如果需要考慮權重（如任務執行時間），可以：
1. 先拓撲排序得到可行序列
2. 使用動態規劃計算最短/最長路徑（關鍵路徑法 CPM）

## 總結

拓撲排序是處理有依賴關係問題的核心算法：

**核心要點**：
1. **只適用於 DAG**（有向無環圖）
2. **兩種實現**：Kahn (BFS) 和 DFS
3. **時間複雜度**：O(V + E)
4. **環檢測**：必須檢測循環依賴

**實際應用**：
- **任務調度**：CI/CD、工作流引擎、Airflow
- **編譯順序**：Make、Bazel、Gradle
- **依賴管理**：npm、Maven、Go Modules
- **課程安排**：教務系統、學習路徑

**面試準備**：
- 掌握 Kahn 和 DFS 兩種實現
- 理解環檢測的重要性
- 熟悉 LeetCode 207、210 題
- 能夠應用到實際任務調度場景

**選擇建議**：
- 實際應用：**Kahn 算法**（更直觀）
- 競賽刷題：**DFS**（程式碼簡潔）

作為資深後端工程師，你需要能夠識別依賴關係問題，選擇合適的拓撲排序算法，並處理循環依賴等異常情況。在系統設計中，拓撲排序常用於任務編排、資源創建順序、模組載入順序等場景。
