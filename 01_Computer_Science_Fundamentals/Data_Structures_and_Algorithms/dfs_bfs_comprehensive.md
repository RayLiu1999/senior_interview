# DFS/BFS 與回溯法（圖遍歷、路徑搜尋）

- **難度**: 6
- **重要程度**: 5
- **標籤**: `DFS`, `BFS`, `Backtracking`, `Graph`, `Interview Hot`

## 問題詳述

DFS（深度優先搜尋）、BFS（廣度優先搜尋）和回溯法（Backtracking）是解決**圖遍歷、路徑搜尋、組合問題**的核心算法。本題將深入探討這三種算法的原理、實現、應用場景及其在面試中的常見題型。

## 核心理論與詳解

### 1. DFS（深度優先搜尋）

#### 1.1 基本原理

**核心思想**：
- 從起點出發，沿著一條路徑**走到底**（直到無路可走）
- 然後**回溯**到上一個節點，繼續探索其他路徑
- 類似於**迷宮中摸著牆走**

**特點**：
- 使用**遞迴**或**堆疊**實現
- 空間複雜度：`O(h)`，h 是深度（遞迴調用棧）
- 不保證找到最短路徑

**遍歷順序**：
```
      1
     / \
    2   3
   / \
  4   5

DFS 順序：1 → 2 → 4 → 5 → 3
```

#### 1.2 DFS 模板

**遞迴版本**：
```go
// 基本 DFS 模板
func dfs(node *Node, visited map[*Node]bool) {
    // 1. 終止條件
    if node == nil || visited[node] {
        return
    }
    
    // 2. 標記已訪問
    visited[node] = true
    
    // 3. 處理當前節點
    process(node)
    
    // 4. 遞迴訪問鄰居
    for _, neighbor := range node.Neighbors {
        dfs(neighbor, visited)
    }
    
    // 5. 回溯（可選，某些題目需要）
    // visited[node] = false
}
```

**迭代版本（使用堆疊）**：
```go
func dfsIterative(start *Node) {
    if start == nil {
        return
    }
    
    stack := []*Node{start}
    visited := make(map[*Node]bool)
    
    for len(stack) > 0 {
        // 彈出棧頂
        node := stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        
        if visited[node] {
            continue
        }
        
        visited[node] = true
        process(node)
        
        // 鄰居入棧（注意順序）
        for _, neighbor := range node.Neighbors {
            if !visited[neighbor] {
                stack = append(stack, neighbor)
            }
        }
    }
}
```

#### 1.3 DFS 經典題目

**題目 1：島嶼數量（LeetCode 200）**

**問題**：
- 給定二維網格，`1` 表示陸地，`0` 表示水
- 計算島嶼數量（相連的 `1` 算一個島嶼）

**解法**：
```go
func numIslands(grid [][]byte) int {
    if len(grid) == 0 {
        return 0
    }
    
    count := 0
    m, n := len(grid), len(grid[0])
    
    for i := 0; i < m; i++ {
        for j := 0; j < n; j++ {
            if grid[i][j] == '1' {
                dfsIsland(grid, i, j)
                count++  // 發現一個新島嶼
            }
        }
    }
    
    return count
}

func dfsIsland(grid [][]byte, i, j int) {
    m, n := len(grid), len(grid[0])
    
    // 終止條件：越界或遇到水
    if i < 0 || i >= m || j < 0 || j >= n || grid[i][j] == '0' {
        return
    }
    
    // 標記為已訪問（沉沒島嶼）
    grid[i][j] = '0'
    
    // 四個方向遞迴
    dfsIsland(grid, i+1, j)  // 下
    dfsIsland(grid, i-1, j)  // 上
    dfsIsland(grid, i, j+1)  // 右
    dfsIsland(grid, i, j-1)  // 左
}
```

**題目 2：路徑總和（LeetCode 112）**

**問題**：
- 判斷二元樹中是否存在從根到葉子的路徑，路徑和等於目標值

**解法**：
```go
func hasPathSum(root *TreeNode, targetSum int) bool {
    if root == nil {
        return false
    }
    
    // 葉子節點
    if root.Left == nil && root.Right == nil {
        return root.Val == targetSum
    }
    
    // 遞迴左右子樹
    return hasPathSum(root.Left, targetSum - root.Val) ||
           hasPathSum(root.Right, targetSum - root.Val)
}
```

---

### 2. BFS（廣度優先搜尋）

#### 2.1 基本原理

**核心思想**：
- 從起點出發，先訪問所有**距離為 1** 的節點
- 再訪問所有**距離為 2** 的節點
- 以此類推，**一層一層**向外擴展

**特點**：
- 使用**佇列（Queue）** 實現
- 空間複雜度：`O(w)`，w 是最大寬度
- **保證找到最短路徑**（無權圖）

**遍歷順序**：
```
      1
     / \
    2   3
   / \
  4   5

BFS 順序：1 → 2 → 3 → 4 → 5
```

#### 2.2 BFS 模板

**基本模板**：
```go
func bfs(start *Node) {
    if start == nil {
        return
    }
    
    queue := []*Node{start}
    visited := make(map[*Node]bool)
    visited[start] = true
    
    for len(queue) > 0 {
        // 取出隊首
        node := queue[0]
        queue = queue[1:]
        
        process(node)
        
        // 鄰居入隊
        for _, neighbor := range node.Neighbors {
            if !visited[neighbor] {
                visited[neighbor] = true
                queue = append(queue, neighbor)
            }
        }
    }
}
```

**層次遍歷模板**（常用於計算最短路徑）：
```go
func bfsLevel(start *Node) {
    queue := []*Node{start}
    visited := make(map[*Node]bool)
    visited[start] = true
    level := 0
    
    for len(queue) > 0 {
        size := len(queue)  // 當前層的節點數
        
        // 處理當前層的所有節點
        for i := 0; i < size; i++ {
            node := queue[0]
            queue = queue[1:]
            
            process(node, level)
            
            for _, neighbor := range node.Neighbors {
                if !visited[neighbor] {
                    visited[neighbor] = true
                    queue = append(queue, neighbor)
                }
            }
        }
        
        level++
    }
}
```

#### 2.3 BFS 經典題目

**題目 1：二元樹的層序遍歷（LeetCode 102）**

```go
func levelOrder(root *TreeNode) [][]int {
    if root == nil {
        return [][]int{}
    }
    
    result := [][]int{}
    queue := []*TreeNode{root}
    
    for len(queue) > 0 {
        size := len(queue)
        level := []int{}
        
        for i := 0; i < size; i++ {
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

**題目 2：單詞接龍（LeetCode 127）**

**問題**：
- 從 `beginWord` 變換到 `endWord`
- 每次只能改變一個字母
- 變換的中間詞必須在字典中
- 求最短變換序列長度

**解法**：
```go
func ladderLength(beginWord, endWord string, wordList []string) int {
    wordSet := make(map[string]bool)
    for _, word := range wordList {
        wordSet[word] = true
    }
    
    if !wordSet[endWord] {
        return 0
    }
    
    queue := []string{beginWord}
    visited := make(map[string]bool)
    visited[beginWord] = true
    level := 1
    
    for len(queue) > 0 {
        size := len(queue)
        
        for i := 0; i < size; i++ {
            word := queue[0]
            queue = queue[1:]
            
            if word == endWord {
                return level
            }
            
            // 嘗試改變每個位置的字母
            for j := 0; j < len(word); j++ {
                for c := 'a'; c <= 'z'; c++ {
                    nextWord := word[:j] + string(c) + word[j+1:]
                    
                    if wordSet[nextWord] && !visited[nextWord] {
                        visited[nextWord] = true
                        queue = append(queue, nextWord)
                    }
                }
            }
        }
        
        level++
    }
    
    return 0
}
```

---

### 3. 回溯法（Backtracking）

#### 3.1 基本原理

**核心思想**：
- 本質是 DFS + **狀態回溯**
- 在搜尋過程中，如果發現當前路徑不可行，就**撤銷之前的選擇**
- 典型的"**試錯 + 回退**"策略

**適用場景**：
- 組合問題：`n` 個數裡選 `k` 個
- 排列問題：`n` 個數的全排列
- 子集問題：`n` 個數的所有子集
- 棋盤問題：N 皇后、數獨

**回溯框架**：
```go
func backtrack(路徑, 選擇列表) {
    if 滿足結束條件 {
        result.add(路徑)
        return
    }
    
    for 選擇 in 選擇列表 {
        // 做選擇
        路徑.add(選擇)
        
        // 遞迴
        backtrack(路徑, 選擇列表)
        
        // 撤銷選擇（回溯）
        路徑.remove(選擇)
    }
}
```

#### 3.2 回溯法經典題目

**題目 1：全排列（LeetCode 46）**

**問題**：
- 給定不含重複數字的陣列，返回所有可能的全排列

**解法**：
```go
func permute(nums []int) [][]int {
    result := [][]int{}
    path := []int{}
    used := make([]bool, len(nums))
    
    var backtrack func()
    backtrack = func() {
        // 終止條件：路徑長度等於數組長度
        if len(path) == len(nums) {
            // 必須複製，否則後續修改會影響結果
            temp := make([]int, len(path))
            copy(temp, path)
            result = append(result, temp)
            return
        }
        
        for i := 0; i < len(nums); i++ {
            // 跳過已使用的數字
            if used[i] {
                continue
            }
            
            // 做選擇
            path = append(path, nums[i])
            used[i] = true
            
            // 遞迴
            backtrack()
            
            // 撤銷選擇（回溯）
            path = path[:len(path)-1]
            used[i] = false
        }
    }
    
    backtrack()
    return result
}
```

**題目 2：組合總和（LeetCode 39）**

**問題**：
- 給定候選數字集合和目標數字
- 找出所有和為目標數字的組合
- 數字可以重複使用

**解法**：
```go
func combinationSum(candidates []int, target int) [][]int {
    result := [][]int{}
    path := []int{}
    
    var backtrack func(start, sum int)
    backtrack = func(start, sum int) {
        // 終止條件
        if sum == target {
            temp := make([]int, len(path))
            copy(temp, path)
            result = append(result, temp)
            return
        }
        
        if sum > target {
            return  // 剪枝：和已經超過目標
        }
        
        for i := start; i < len(candidates); i++ {
            // 做選擇
            path = append(path, candidates[i])
            
            // 遞迴（注意：i 不是 i+1，因為可以重複使用）
            backtrack(i, sum + candidates[i])
            
            // 撤銷選擇
            path = path[:len(path)-1]
        }
    }
    
    backtrack(0, 0)
    return result
}
```

**題目 3：N 皇后（LeetCode 51）**

**問題**：
- 在 N×N 的棋盤上放置 N 個皇后
- 使得任意兩個皇后不在同一行、列、對角線上

**解法**：
```go
func solveNQueens(n int) [][]string {
    result := [][]string{}
    board := make([][]byte, n)
    for i := range board {
        board[i] = make([]byte, n)
        for j := range board[i] {
            board[i][j] = '.'
        }
    }
    
    var backtrack func(row int)
    backtrack = func(row int) {
        // 終止條件：所有行都放置了皇后
        if row == n {
            result = append(result, boardToStrings(board))
            return
        }
        
        // 嘗試在當前行的每一列放置皇后
        for col := 0; col < n; col++ {
            if !isValid(board, row, col) {
                continue  // 剪枝：位置不合法
            }
            
            // 做選擇
            board[row][col] = 'Q'
            
            // 遞迴下一行
            backtrack(row + 1)
            
            // 撤銷選擇
            board[row][col] = '.'
        }
    }
    
    backtrack(0)
    return result
}

func isValid(board [][]byte, row, col int) bool {
    n := len(board)
    
    // 檢查列
    for i := 0; i < row; i++ {
        if board[i][col] == 'Q' {
            return false
        }
    }
    
    // 檢查左上對角線
    for i, j := row-1, col-1; i >= 0 && j >= 0; i, j = i-1, j-1 {
        if board[i][j] == 'Q' {
            return false
        }
    }
    
    // 檢查右上對角線
    for i, j := row-1, col+1; i >= 0 && j < n; i, j = i-1, j+1 {
        if board[i][j] == 'Q' {
            return false
        }
    }
    
    return true
}

func boardToStrings(board [][]byte) []string {
    result := []string{}
    for _, row := range board {
        result = append(result, string(row))
    }
    return result
}
```

---

### 4. DFS vs BFS 對比

| 特性 | DFS | BFS |
|------|-----|-----|
| **實現方式** | 遞迴 / 堆疊 | 佇列 |
| **空間複雜度** | O(h) - 深度 | O(w) - 寬度 |
| **適用場景** | 路徑存在性、拓撲排序 | 最短路徑、層次遍歷 |
| **最短路徑** | ❌ 不保證 | ✅ 保證（無權圖） |
| **時間複雜度** | O(V + E) | O(V + E) |
| **優點** | 節省空間、容易實現 | 找到最短路徑 |
| **缺點** | 可能進入深層死路 | 耗費空間 |

**選擇建議**：
- **求最短路徑** → BFS
- **求所有路徑/組合** → DFS + 回溯
- **檢測環** → DFS
- **層次遍歷** → BFS

---

## 實際應用場景

### 1. DFS 應用

**依賴解析**：
- **npm/pip 依賴安裝**：使用 DFS 遍歷依賴樹
- **編譯器**：符號表查找（作用域鏈）

**檔案系統遍歷**：
```bash
# Linux find 命令內部使用 DFS
find /path -name "*.go"
```

**Git 提交歷史**：
- `git log` 使用 DFS 遍歷提交圖

### 2. BFS 應用

**社交網絡**：
- **LinkedIn 連結度數**：找出 1 度、2 度、3 度連結
- **Facebook 好友推薦**：找出距離為 2 的用戶

**爬蟲系統**：
- **網頁爬蟲**：從首頁開始，一層一層抓取鏈接
- 保證先處理重要頁面（距離首頁近的頁面）

**遊戲 AI**：
- **最短路徑尋路**：A* 算法基於 BFS
- **象棋/圍棋 AI**：搜尋最優步數

### 3. 回溯應用

**自動化測試**：
- **測試用例生成**：窮舉所有可能的輸入組合

**編譯器優化**：
- **指令調度**：找出最優的指令執行順序

**密碼破解**：
- **暴力破解**：嘗試所有可能的密碼組合

---

## 面試技巧與常見陷阱

### 1. 回溯的常見錯誤

**錯誤 1：忘記回溯**
```go
// ❌ 錯誤
path = append(path, num)
backtrack()
// 忘記 path = path[:len(path)-1]
```

**錯誤 2：淺複製問題**
```go
// ❌ 錯誤：所有結果都指向同一個底層陣列
result = append(result, path)

// ✅ 正確：深複製
temp := make([]int, len(path))
copy(temp, path)
result = append(result, temp)
```

### 2. BFS 的優化技巧

**雙向 BFS**：
- 從起點和終點同時開始搜尋
- 大幅減少搜尋空間
- 時間複雜度：`O(b^(d/2))` vs `O(b^d)`

**例子**：單詞接龍
```go
func ladderLengthBidirectional(beginWord, endWord string, wordList []string) int {
    wordSet := makeSet(wordList)
    if !wordSet[endWord] {
        return 0
    }
    
    // 兩個方向的搜尋集合
    beginSet := map[string]bool{beginWord: true}
    endSet := map[string]bool{endWord: true}
    visited := make(map[string]bool)
    level := 1
    
    for len(beginSet) > 0 && len(endSet) > 0 {
        // 總是擴展較小的集合
        if len(beginSet) > len(endSet) {
            beginSet, endSet = endSet, beginSet
        }
        
        nextSet := make(map[string]bool)
        
        for word := range beginSet {
            // 生成所有相鄰單詞
            for _, nextWord := range getNeighbors(word, wordSet) {
                // 相遇了！
                if endSet[nextWord] {
                    return level + 1
                }
                
                if !visited[nextWord] {
                    visited[nextWord] = true
                    nextSet[nextWord] = true
                }
            }
        }
        
        beginSet = nextSet
        level++
    }
    
    return 0
}
```

### 3. 剪枝技巧

**剪枝原則**：
- 儘早排除不可能的分支
- 減少無效搜尋

**常見剪枝**：
1. **數值剪枝**：和已經超過目標值
2. **重複剪枝**：使用 `visited` 避免重複訪問
3. **順序剪枝**：排序後跳過重複元素

**例子**：組合總和去重
```go
// 跳過重複元素
for i := start; i < len(candidates); i++ {
    if i > start && candidates[i] == candidates[i-1] {
        continue  // 剪枝：避免重複組合
    }
    // ...
}
```

---

## 複雜度分析

### DFS
- **時間複雜度**：O(V + E)，V 是頂點數，E 是邊數
- **空間複雜度**：O(h)，h 是最大深度（遞迴棧）

### BFS
- **時間複雜度**：O(V + E)
- **空間複雜度**：O(w)，w 是最大寬度（佇列）

### 回溯（以全排列為例）
- **時間複雜度**：O(n! × n)，n! 種排列，每種需要 O(n) 複製
- **空間複雜度**：O(n)，遞迴深度

---

## 延伸閱讀

- **LeetCode 專題**：
  - [DFS Tag](https://leetcode.com/tag/depth-first-search/)
  - [BFS Tag](https://leetcode.com/tag/breadth-first-search/)
  - [Backtracking Tag](https://leetcode.com/tag/backtracking/)
- **經典問題集**：劍指 Offer、LeetCode Hot 100
- **進階主題**：A* 算法、IDA* 算法、雙向 BFS
