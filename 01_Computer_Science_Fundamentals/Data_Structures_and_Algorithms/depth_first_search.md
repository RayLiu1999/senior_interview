# 深度優先搜尋 (DFS)

- **難度**: 6
- **重要程度**: 5
- **標籤**: `DFS`, `回溯`, `排列組合`, `路徑搜尋`

## 問題詳述

深度優先搜尋 (Depth-First Search, DFS) 是圖和樹的基本遍歷算法之一,採用「一路到底,遇到死路回頭」的策略。在後端面試中,DFS 常用於解決排列組合、路徑搜尋、連通性判斷等問題,是必須精通的核心算法。

## 核心理論與詳解

### 1. DFS 基本原理

**核心思想**:
- 從起點開始,沿著一條路徑**盡可能深入**地探索
- 當無法繼續前進時,**回溯**到上一個節點,探索其他路徑
- 使用**堆疊**實現 (或利用遞迴的函式呼叫堆疊)

**遍歷順序特點**:
```
    1
   / \
  2   3
 / \
4   5

DFS 遍歷順序: 1 → 2 → 4 → 5 → 3
(先深入左子樹,再回溯到右子樹)
```

**時間複雜度**: O(V + E),其中 V 為節點數,E 為邊數
**空間複雜度**: O(V),遞迴堆疊深度

### 2. DFS 實現方式

#### 方式一: 遞迴實現 (推薦)

**優點**: 程式碼簡潔,易於理解
**缺點**: 深度過大時可能堆疊溢位

```go
// 遞迴版本 DFS (樹的遍歷)
func dfs(node *TreeNode, visited map[*TreeNode]bool) {
    if node == nil {
        return
    }
    
    // 標記已訪問
    visited[node] = true
    
    // 處理當前節點
    process(node)
    
    // 遞迴訪問子節點
    dfs(node.Left, visited)
    dfs(node.Right, visited)
}
```

#### 方式二: 迭代實現 (使用堆疊)

**優點**: 避免堆疊溢位,可控制記憶體
**缺點**: 程式碼較複雜

```go
// 迭代版本 DFS (使用堆疊)
func dfsIterative(root *TreeNode) {
    if root == nil {
        return
    }
    
    stack := []*TreeNode{root}
    visited := make(map[*TreeNode]bool)
    
    for len(stack) > 0 {
        // 彈出堆疊頂端節點
        node := stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        
        if visited[node] {
            continue
        }
        
        visited[node] = true
        process(node)
        
        // 先壓入右子節點,再壓入左子節點
        // (保證左子樹先被訪問)
        if node.Right != nil {
            stack = append(stack, node.Right)
        }
        if node.Left != nil {
            stack = append(stack, node.Left)
        }
    }
}
```

### 3. DFS 典型應用場景

#### 場景一: 路徑搜尋問題

**範例**: 二元樹的所有路徑

```go
func binaryTreePaths(root *TreeNode) []string {
    result := []string{}
    if root == nil {
        return result
    }
    
    var dfs func(node *TreeNode, path string)
    dfs = func(node *TreeNode, path string) {
        if node == nil {
            return
        }
        
        // 構建路徑字串
        path += strconv.Itoa(node.Val)
        
        // 葉子節點:記錄路徑
        if node.Left == nil && node.Right == nil {
            result = append(result, path)
            return
        }
        
        // 非葉子節點:繼續搜尋
        path += "->"
        dfs(node.Left, path)
        dfs(node.Right, path)
    }
    
    dfs(root, "")
    return result
}
```

#### 場景二: 排列組合問題 (回溯)

**範例**: 全排列 (Permutations)

```go
func permute(nums []int) [][]int {
    result := [][]int{}
    visited := make([]bool, len(nums))
    path := []int{}
    
    var backtrack func()
    backtrack = func() {
        // 遞迴終止條件
        if len(path) == len(nums) {
            // 必須複製 path
            temp := make([]int, len(path))
            copy(temp, path)
            result = append(result, temp)
            return
        }
        
        // 選擇列表
        for i := 0; i < len(nums); i++ {
            if visited[i] {
                continue  // 跳過已使用的元素
            }
            
            // 做選擇
            path = append(path, nums[i])
            visited[i] = true
            
            // 遞迴
            backtrack()
            
            // 撤銷選擇 (回溯)
            path = path[:len(path)-1]
            visited[i] = false
        }
    }
    
    backtrack()
    return result
}
```

#### 場景三: 連通性問題

**範例**: 島嶼數量 (Number of Islands)

```go
func numIslands(grid [][]byte) int {
    if len(grid) == 0 {
        return 0
    }
    
    rows, cols := len(grid), len(grid[0])
    count := 0
    
    var dfs func(i, j int)
    dfs = func(i, j int) {
        // 邊界檢查
        if i < 0 || i >= rows || j < 0 || j >= cols {
            return
        }
        // 是水域或已訪問
        if grid[i][j] == '0' {
            return
        }
        
        // 標記為已訪問
        grid[i][j] = '0'
        
        // 向四個方向探索
        dfs(i-1, j)  // 上
        dfs(i+1, j)  // 下
        dfs(i, j-1)  // 左
        dfs(i, j+1)  // 右
    }
    
    // 遍歷整個網格
    for i := 0; i < rows; i++ {
        for j := 0; j < cols; j++ {
            if grid[i][j] == '1' {
                count++
                dfs(i, j)  // 將整個島嶼標記為已訪問
            }
        }
    }
    
    return count
}
```

### 4. DFS vs BFS 對比

| 特性 | DFS | BFS |
|-----|-----|-----|
| **資料結構** | 堆疊 (或遞迴) | 佇列 |
| **遍歷順序** | 深度優先 | 層級優先 |
| **空間複雜度** | O(h) h=樹高 | O(w) w=最大寬度 |
| **適用場景** | 路徑搜尋、排列組合、拓撲排序 | 最短路徑、層級遍歷 |
| **實現難度** | 簡單 (遞迴) | 中等 (需要佇列) |

**選擇原則**:
- 求**最短路徑** → 用 BFS
- 求**所有路徑**、**排列組合** → 用 DFS
- 樹的**深度**很大 → 考慮 BFS (避免堆疊溢位)
- 樹的**寬度**很大 → 考慮 DFS (節省記憶體)

### 5. 回溯算法 (Backtracking)

回溯是 DFS 的重要應用,核心思想是**試錯 + 撤銷**:

**回溯三要素**:
1. **選擇列表**: 當前可以做的選擇
2. **路徑**: 已經做過的選擇
3. **結束條件**: 滿足條件時記錄結果

**回溯模板**:
```go
func backtrack(路徑, 選擇列表) {
    if 滿足結束條件 {
        result = append(result, 路徑)
        return
    }
    
    for 選擇 in 選擇列表 {
        // 做選擇
        將選擇加入路徑
        
        // 遞迴
        backtrack(路徑, 新的選擇列表)
        
        // 撤銷選擇 (回溯)
        將選擇從路徑移除
    }
}
```

**經典回溯問題**:
- 全排列 (Permutations)
- 組合總和 (Combination Sum)
- N 皇后 (N-Queens)
- 括號生成 (Generate Parentheses)
- 子集 (Subsets)

### 6. DFS 優化技巧

#### 技巧一: 剪枝 (Pruning)

提前終止無效搜尋,減少時間複雜度。

```go
// 組合總和問題 - 使用剪枝
func combinationSum(candidates []int, target int) [][]int {
    sort.Ints(candidates)  // 排序,方便剪枝
    result := [][]int{}
    path := []int{}
    
    var backtrack func(start, sum int)
    backtrack = func(start, sum int) {
        if sum == target {
            temp := make([]int, len(path))
            copy(temp, path)
            result = append(result, temp)
            return
        }
        
        for i := start; i < len(candidates); i++ {
            // 剪枝: 如果當前數字已經超過目標,後面的更大數字也不用試了
            if sum + candidates[i] > target {
                break
            }
            
            path = append(path, candidates[i])
            backtrack(i, sum + candidates[i])
            path = path[:len(path)-1]
        }
    }
    
    backtrack(0, 0)
    return result
}
```

#### 技巧二: 記憶化搜尋 (Memoization)

快取已計算的結果,避免重複計算。

```go
// 使用記憶化的 DFS
func dfsWithMemo(node int, memo map[int]int) int {
    if val, exists := memo[node]; exists {
        return val  // 直接返回已計算的結果
    }
    
    // 計算結果
    result := compute(node)
    
    // 快取結果
    memo[node] = result
    return result
}
```

#### 技巧三: 去重

避免生成重複的結果。

```go
// 全排列 II (包含重複數字)
func permuteUnique(nums []int) [][]int {
    sort.Ints(nums)  // 排序,方便去重
    result := [][]int{}
    visited := make([]bool, len(nums))
    path := []int{}
    
    var backtrack func()
    backtrack = func() {
        if len(path) == len(nums) {
            temp := make([]int, len(path))
            copy(temp, path)
            result = append(result, temp)
            return
        }
        
        for i := 0; i < len(nums); i++ {
            if visited[i] {
                continue
            }
            
            // 去重: 跳過重複的數字
            if i > 0 && nums[i] == nums[i-1] && !visited[i-1] {
                continue
            }
            
            path = append(path, nums[i])
            visited[i] = true
            backtrack()
            path = path[:len(path)-1]
            visited[i] = false
        }
    }
    
    backtrack()
    return result
}
```

## 實際應用場景

### 1. 檔案系統遍歷

遍歷目錄結構,統計檔案大小。

```go
func calculateDirSize(path string) (int64, error) {
    var totalSize int64
    
    err := filepath.Walk(path, func(path string, info os.FileInfo, err error) error {
        if err != nil {
            return err
        }
        if !info.IsDir() {
            totalSize += info.Size()
        }
        return nil
    })
    
    return totalSize, err
}
```

### 2. 依賴關係檢測

檢測專案中的循環依賴 (Circular Dependency Detection)。

```go
func hasCyclicDependency(graph map[string][]string) bool {
    visited := make(map[string]bool)
    inStack := make(map[string]bool)  // 當前遞迴堆疊
    
    var dfs func(node string) bool
    dfs = func(node string) bool {
        visited[node] = true
        inStack[node] = true
        
        for _, neighbor := range graph[node] {
            if !visited[neighbor] {
                if dfs(neighbor) {
                    return true  // 發現循環
                }
            } else if inStack[neighbor] {
                return true  // 發現循環 (回到堆疊中的節點)
            }
        }
        
        inStack[node] = false
        return false
    }
    
    for node := range graph {
        if !visited[node] {
            if dfs(node) {
                return true
            }
        }
    }
    
    return false
}
```

### 3. 許可權樹遍歷

遍歷使用者的許可權樹,判斷是否有某個許可權。

```go
type Permission struct {
    ID       string
    Name     string
    Children []*Permission
}

func hasPermission(root *Permission, targetID string) bool {
    if root == nil {
        return false
    }
    
    if root.ID == targetID {
        return true
    }
    
    for _, child := range root.Children {
        if hasPermission(child, targetID) {
            return true
        }
    }
    
    return false
}
```

### 4. JSON 深度遍歷

遍歷複雜的 JSON 結構,提取特定欄位。

```go
func extractValues(data interface{}, key string) []interface{} {
    result := []interface{}{}
    
    var dfs func(v interface{})
    dfs = func(v interface{}) {
        switch value := v.(type) {
        case map[string]interface{}:
            for k, v := range value {
                if k == key {
                    result = append(result, v)
                }
                dfs(v)
            }
        case []interface{}:
            for _, item := range value {
                dfs(item)
            }
        }
    }
    
    dfs(data)
    return result
}
```

## 總結

**DFS 核心要點**:
1. **遍歷策略**: 深度優先,一路到底再回溯
2. **實現方式**: 遞迴 (簡單) 或堆疊 (可控)
3. **典型應用**: 路徑搜尋、排列組合、連通性判斷
4. **回溯模板**: 選擇 → 遞迴 → 撤銷
5. **優化技巧**: 剪枝、記憶化、去重

**面試高頻題目**:
- 二元樹的所有路徑
- 全排列 / 組合
- 島嶼數量 / 連通分量
- N 皇后問題
- 括號生成
- 單詞搜尋 (Word Search)

**實際應用**:
- 檔案系統遍歷
- 依賴關係分析
- 許可權樹查詢
- 配置檔解析

DFS 是圖論和樹結構的基礎算法,必須熟練掌握遞迴和回溯的實現方式,並能靈活應用於各種實際場景。
