# 回溯法 (Backtracking Algorithm)

- **難度**: 7
- **重要程度**: 5
- **標籤**: `回溯`, `DFS`, `剪枝`, `排列組合`, `搜索空間樹`

## 問題詳述

回溯法是一種通過**遞迴地構建候選解**，並在確定候選不可能成為有效解時立即**放棄（剪枝）**的算法策略。它本質上是一種系統化的窮舉，但透過剪枝大幅減少搜尋空間，是解決排列、組合、子集、棋盤問題的標準範式。

## 核心理論與詳解

### 搜索空間樹（Decision Tree）

回溯法的每個遞迴呼叫對應一個**決策**（例如：當前位置選 A 還是 B），整個搜尋過程構成一棵隱式的「決策樹」：

- **節點**：當前的部分解
- **邊**：在當前位置做的選擇
- **葉節點**：完整的解（或死路）

回溯法做 DFS 遍歷這棵樹，在發現某節點的子樹**肯定不包含有效解**時，立即「剪掉」整棵子樹（剪枝），不再遞迴進入。

### 回溯法通用模板

```
func backtrack(路徑, 選擇列表):
    if 滿足結束條件:
        結果 ← 路徑
        return
    for 選擇 in 選擇列表:
        if 不合法/剪枝條件: continue  // 剪枝
        做選擇（將選擇加入路徑）
        backtrack(路徑, 更新後選擇列表)
        撤銷選擇（從路徑移除）          // 回溯
```

**關鍵三步**：
1. **做選擇**（修改狀態）
2. **遞迴進入下一層**
3. **撤銷選擇**（恢復狀態，保證不同分支互不干擾）

### 高頻題型與剪枝策略

#### ① 全排列（Permutations）
- 特點：每個元素只能用一次，且順序有關
- 剪枝：用 `visited` 陣列標記已用元素
- 時間複雜度：O(n!)

#### ② 組合（Combinations）
- 特點：不計順序，從 n 個中選 k 個
- 剪枝：傳入 `start` 指針避免重複，且當剩餘元素不足時提前剪枝
- 例：`start=3, k=2, n=4` → 只剩 [3,4]，不夠選就剪掉

#### ③ 子集（Subsets）
- 特點：每個節點都是有效解（不只葉節點）
- 在遞迴進入前先記錄當前路徑

#### ④ 有重複元素的情況
- 排序後再回溯，跳過相同的相鄰元素：
  ```
  if i > start && choices[i] == choices[i-1]: continue  // 跳過重複
  ```

#### ⑤ 棋盤類問題（N 皇后、數獨）
- 額外維護行、列、對角線的佔用狀態
- 在放皇后前先判斷位置是否合法（剪枝）

### 回溯 vs 動態規劃

| 對比 | 回溯 | 動態規劃 |
|------|------|---------|
| 目標 | **列舉所有解**（或找一個可行解） | 求**最優解**（最大值/最小值） |
| 方法 | DFS + 剪枝，遍歷所有路徑 | 通過子問題的最優解推導全局最優 |
| 是否有重疊子問題 | 否（或有但不關心） | 是（這是 DP 的核心優勢） |
| 典型問題 | 全排列、N 皇后、字母組合 | 背包問題、最長公共子序列 |

### 複雜度分析要點

回溯算法的時間複雜度通常很難精確分析，一般用**解的數量 × 每個解的構造時間**估算：
- 全排列：O(n! × n)
- 組合 C(n,k)：O(C(n,k) × k)
- N 皇后：O(n!)，但剪枝後實際快得多

## 程式碼範例

```go
package main

import "fmt"

// 全排列（處理有重複元素的情況）
func permuteUnique(nums []int) [][]int {
    var result [][]int
    var path []int
    used := make([]bool, len(nums))

    // 預先排序，便於跳過重複元素
    sort(nums)

    var backtrack func()
    backtrack = func() {
        if len(path) == len(nums) {
            tmp := make([]int, len(path))
            copy(tmp, path)
            result = append(result, tmp)
            return
        }
        for i := 0; i < len(nums); i++ {
            if used[i] { continue }
            // 剪枝：同一層中跳過與上一個相同的元素（上一個未被使用說明已被回溯）
            if i > 0 && nums[i] == nums[i-1] && !used[i-1] { continue }

            used[i] = true
            path = append(path, nums[i])

            backtrack()

            used[i] = false
            path = path[:len(path)-1] // 撤銷選擇
        }
    }

    backtrack()
    return result
}

func sort(nums []int) { // 簡易冒泡排序（示意）
    for i := 0; i < len(nums); i++ {
        for j := i + 1; j < len(nums); j++ {
            if nums[i] > nums[j] { nums[i], nums[j] = nums[j], nums[i] }
        }
    }
}

// N 皇后問題：在 n×n 棋盤上放 n 個皇后，互不攻擊
func solveNQueens(n int) [][]string {
    var result [][]string
    board := make([][]byte, n)
    for i := range board {
        board[i] = make([]byte, n)
        for j := range board[i] { board[i][j] = '.' }
    }

    cols := make([]bool, n)
    diag1 := make([]bool, 2*n-1) // 左上到右下對角線
    diag2 := make([]bool, 2*n-1) // 右上到左下對角線

    var backtrack func(row int)
    backtrack = func(row int) {
        if row == n {
            snapshot := make([]string, n)
            for i, r := range board { snapshot[i] = string(r) }
            result = append(result, snapshot)
            return
        }
        for col := 0; col < n; col++ {
            if cols[col] || diag1[row-col+n-1] || diag2[row+col] { continue } // 剪枝
            board[row][col] = 'Q'
            cols[col], diag1[row-col+n-1], diag2[row+col] = true, true, true
            backtrack(row + 1)
            board[row][col] = '.'
            cols[col], diag1[row-col+n-1], diag2[row+col] = false, false, false
        }
    }

    backtrack(0)
    return result
}

func main() {
    solutions := solveNQueens(4)
    fmt.Printf("4 皇后共 %d 種解法\n", len(solutions)) // 2
}
```
