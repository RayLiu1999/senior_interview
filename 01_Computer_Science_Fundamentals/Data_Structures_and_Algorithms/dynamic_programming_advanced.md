# 動態規劃進階題型

- **難度**: 8
- **重要程度**: 4
- **標籤**: `區間DP`, `狀態壓縮`, `樹形DP`

## 問題詳述

動態規劃進階題型包含區間DP、狀態壓縮DP、樹形DP等複雜場景,需要更深入的理解狀態設計和轉移方程。這些題型在高級面試中常見,用於考察候選人的算法深度和思維能力。

## 核心理論與詳解

### 1. 區間DP (Interval DP)

**核心思想**: 在一個區間上進行動態規劃,通常求解某個區間的最優解。

**狀態定義**: `dp[i][j]` 表示區間 `[i, j]` 的最優解

**轉移方程**: 通過枚舉區間內的分割點 k,將大區間分解為小區間

**模板**:
```go
for length := 2; length <= n; length++ {        // 枚舉區間長度
    for i := 0; i + length - 1 < n; i++ {      // 枚舉起點
        j := i + length - 1                     // 計算終點
        for k := i; k < j; k++ {                // 枚舉分割點
            dp[i][j] = min(dp[i][j], 
                dp[i][k] + dp[k+1][j] + cost)
        }
    }
}
```

#### 經典問題一: 矩陣鏈乘法

給定矩陣維度,求最小乘法次數。

```go
func matrixChainMultiplication(dims []int) int {
    n := len(dims) - 1
    dp := make([][]int, n)
    for i := range dp {
        dp[i] = make([]int, n)
    }
    
    // length 表示鏈的長度
    for length := 2; length <= n; length++ {
        for i := 0; i + length - 1 < n; i++ {
            j := i + length - 1
            dp[i][j] = math.MaxInt32
            
            for k := i; k < j; k++ {
                cost := dp[i][k] + dp[k+1][j] + 
                       dims[i] * dims[k+1] * dims[j+1]
                dp[i][j] = min(dp[i][j], cost)
            }
        }
    }
    
    return dp[0][n-1]
}
```

#### 經典問題二: 戳氣球

**LeetCode 312. Burst Balloons**

```go
func maxCoins(nums []int) int {
    // 添加虛擬氣球
    balloons := make([]int, len(nums) + 2)
    balloons[0], balloons[len(balloons)-1] = 1, 1
    copy(balloons[1:], nums)
    
    n := len(balloons)
    dp := make([][]int, n)
    for i := range dp {
        dp[i] = make([]int, n)
    }
    
    // 枚舉區間長度
    for length := 3; length <= n; length++ {
        for i := 0; i + length - 1 < n; i++ {
            j := i + length - 1
            
            // 枚舉最後戳破的氣球
            for k := i + 1; k < j; k++ {
                coins := balloons[i] * balloons[k] * balloons[j]
                total := dp[i][k] + dp[k][j] + coins
                dp[i][j] = max(dp[i][j], total)
            }
        }
    }
    
    return dp[0][n-1]
}
```

#### 經典問題三: 合併石頭的最低成本

**LeetCode 1000. Minimum Cost to Merge Stones**

```go
func mergeStones(stones []int, k int) int {
    n := len(stones)
    if (n - 1) % (k - 1) != 0 {
        return -1
    }
    
    // 計算前綴和
    prefixSum := make([]int, n + 1)
    for i := 0; i < n; i++ {
        prefixSum[i+1] = prefixSum[i] + stones[i]
    }
    
    // dp[i][j][p] 表示將 [i,j] 合併成 p 堆的最小成本
    dp := make([][][]int, n)
    for i := range dp {
        dp[i] = make([][]int, n)
        for j := range dp[i] {
            dp[i][j] = make([]int, k+1)
            for p := range dp[i][j] {
                dp[i][j][p] = math.MaxInt32
            }
        }
        dp[i][i][1] = 0
    }
    
    for length := 2; length <= n; length++ {
        for i := 0; i + length - 1 < n; i++ {
            j := i + length - 1
            
            for p := 2; p <= k; p++ {
                for mid := i; mid < j; mid += k - 1 {
                    dp[i][j][p] = min(dp[i][j][p], 
                        dp[i][mid][1] + dp[mid+1][j][p-1])
                }
            }
            
            dp[i][j][1] = dp[i][j][k] + prefixSum[j+1] - prefixSum[i]
        }
    }
    
    return dp[0][n-1][1]
}
```

### 2. 狀態壓縮DP

**核心思想**: 用一個整數的二進制位表示狀態,適用於集合、排列等問題。

**適用場景**:
- 集合選擇問題 (選或不選)
- 排列問題 (訪問順序)
- 棋盤問題 (位置狀態)

**狀態表示**: 使用位掩碼 (Bitmask)
- `1 << i`: 表示只選擇第 i 個元素
- `state | (1 << i)`: 將第 i 個元素加入狀態
- `state & (1 << i)`: 檢查第 i 個元素是否在狀態中

#### 經典問題一: 旅行商問題 (TSP)

```go
func tsp(dist [][]int) int {
    n := len(dist)
    fullState := (1 << n) - 1
    
    // dp[state][i] 表示訪問狀態為 state,當前在城市 i 的最小成本
    dp := make([][]int, 1 << n)
    for i := range dp {
        dp[i] = make([]int, n)
        for j := range dp[i] {
            dp[i][j] = math.MaxInt32
        }
    }
    dp[1][0] = 0  // 從城市 0 開始
    
    for state := 1; state <= fullState; state++ {
        for i := 0; i < n; i++ {
            if (state & (1 << i)) == 0 {
                continue
            }
            
            prevState := state ^ (1 << i)
            for j := 0; j < n; j++ {
                if (prevState & (1 << j)) != 0 {
                    dp[state][i] = min(dp[state][i], 
                        dp[prevState][j] + dist[j][i])
                }
            }
        }
    }
    
    // 返回起點
    result := math.MaxInt32
    for i := 1; i < n; i++ {
        result = min(result, dp[fullState][i] + dist[i][0])
    }
    
    return result
}
```

#### 經典問題二: 分配工作以最小化工作時間

**LeetCode 1986. Minimum Number of Work Sessions**

```go
func minSessions(tasks []int, sessionTime int) int {
    n := len(tasks)
    fullState := (1 << n) - 1
    
    // 預計算每個狀態的時間總和
    stateTime := make([]int, 1 << n)
    for state := 0; state < (1 << n); state++ {
        for i := 0; i < n; i++ {
            if (state & (1 << i)) != 0 {
                stateTime[state] += tasks[i]
            }
        }
    }
    
    // dp[state] 表示完成 state 狀態的最少會話數
    dp := make([]int, 1 << n)
    for i := range dp {
        dp[i] = math.MaxInt32
    }
    dp[0] = 1
    
    remain := make([]int, 1 << n)
    remain[0] = sessionTime
    
    for state := 0; state <= fullState; state++ {
        // 枚舉子集
        for subset := state; subset > 0; subset = (subset - 1) & state {
            if stateTime[subset] > sessionTime {
                continue
            }
            
            prevState := state ^ subset
            if dp[prevState] < dp[state] || 
               (dp[prevState] == dp[state] && remain[prevState] > stateTime[subset]) {
                dp[state] = dp[prevState]
                remain[state] = remain[prevState] - stateTime[subset]
                
                if remain[state] < 0 {
                    dp[state]++
                    remain[state] = sessionTime - stateTime[subset]
                }
            }
        }
    }
    
    return dp[fullState]
}
```

#### 經典問題三: 火柴拼正方形

**LeetCode 473. Matchsticks to Square**

```go
func makesquare(matchsticks []int) bool {
    sum := 0
    for _, v := range matchsticks {
        sum += v
    }
    
    if sum % 4 != 0 {
        return false
    }
    
    sideLength := sum / 4
    n := len(matchsticks)
    
    // dp[state] 表示狀態 state 下當前邊的剩餘長度
    dp := make([]int, 1 << n)
    for i := range dp {
        dp[i] = -1
    }
    dp[0] = 0
    
    for state := 0; state < (1 << n); state++ {
        if dp[state] < 0 {
            continue
        }
        
        for i := 0; i < n; i++ {
            if (state & (1 << i)) != 0 {
                continue
            }
            
            newState := state | (1 << i)
            if dp[state] + matchsticks[i] <= sideLength {
                dp[newState] = (dp[state] + matchsticks[i]) % sideLength
            }
        }
    }
    
    return dp[(1 << n) - 1] == 0
}
```

### 3. 樹形DP

**核心思想**: 在樹結構上進行動態規劃,通常需要對樹進行 DFS 遍歷。

**狀態定義**: `dp[node][state]` 表示以 node 為根的子樹在某種狀態下的最優解

#### 經典問題一: 打家劫舍 III

**LeetCode 337. House Robber III**

```go
func rob(root *TreeNode) int {
    robbed, notRobbed := dfs(root)
    return max(robbed, notRobbed)
}

func dfs(node *TreeNode) (int, int) {
    if node == nil {
        return 0, 0
    }
    
    leftRob, leftNotRob := dfs(node.Left)
    rightRob, rightNotRob := dfs(node.Right)
    
    // 搶劫當前節點
    robbed := node.Val + leftNotRob + rightNotRob
    
    // 不搶劫當前節點
    notRobbed := max(leftRob, leftNotRob) + max(rightRob, rightNotRob)
    
    return robbed, notRobbed
}
```

#### 經典問題二: 樹的直徑

```go
func diameterOfBinaryTree(root *TreeNode) int {
    maxDiameter := 0
    
    var dfs func(node *TreeNode) int
    dfs = func(node *TreeNode) int {
        if node == nil {
            return 0
        }
        
        leftDepth := dfs(node.Left)
        rightDepth := dfs(node.Right)
        
        // 更新直徑
        maxDiameter = max(maxDiameter, leftDepth + rightDepth)
        
        // 返回當前節點的深度
        return max(leftDepth, rightDepth) + 1
    }
    
    dfs(root)
    return maxDiameter
}
```

#### 經典問題三: 二元樹中的最大路徑和

**LeetCode 124. Binary Tree Maximum Path Sum**

```go
func maxPathSum(root *TreeNode) int {
    maxSum := math.MinInt32
    
    var dfs func(node *TreeNode) int
    dfs = func(node *TreeNode) int {
        if node == nil {
            return 0
        }
        
        // 如果子樹路徑和為負,不選擇該路徑
        leftMax := max(0, dfs(node.Left))
        rightMax := max(0, dfs(node.Right))
        
        // 更新最大路徑和 (可以包含左右子樹)
        maxSum = max(maxSum, node.Val + leftMax + rightMax)
        
        // 返回包含當前節點的最大路徑 (只能選左或右)
        return node.Val + max(leftMax, rightMax)
    }
    
    dfs(root)
    return maxSum
}
```

### 4. 數位DP

**核心思想**: 按位處理數字,統計滿足條件的數字個數。

#### 經典問題: 數字範圍內的數字個數

```go
func countDigitOne(n int) int {
    digits := []int{}
    temp := n
    for temp > 0 {
        digits = append([]int{temp % 10}, digits...)
        temp /= 10
    }
    
    memo := make(map[string]int)
    
    var dp func(pos int, count int, tight bool) int
    dp = func(pos int, count int, tight bool) int {
        if pos == len(digits) {
            return count
        }
        
        key := fmt.Sprintf("%d_%d_%v", pos, count, tight)
        if val, exists := memo[key]; exists {
            return val
        }
        
        limit := 9
        if tight {
            limit = digits[pos]
        }
        
        result := 0
        for digit := 0; digit <= limit; digit++ {
            newCount := count
            if digit == 1 {
                newCount++
            }
            result += dp(pos + 1, newCount, tight && digit == limit)
        }
        
        memo[key] = result
        return result
    }
    
    return dp(0, 0, true)
}
```

## 總結

**動態規劃進階核心要點**:

1. **區間DP**:
   - 狀態: `dp[i][j]` 表示區間 `[i, j]`
   - 轉移: 枚舉分割點
   - 順序: 由小區間到大區間
   - 典型題: 矩陣鏈乘法、戳氣球、合併石頭

2. **狀態壓縮DP**:
   - 用整數的位表示狀態
   - 適用: 集合、排列問題
   - 空間: O(2^n * ...)
   - 典型題: TSP、分配問題、棋盤問題

3. **樹形DP**:
   - 在樹上進行 DP
   - 需要 DFS 遍歷
   - 狀態: 與子樹相關
   - 典型題: 打家劫舍III、樹的直徑、最大路徑和

4. **數位DP**:
   - 按位處理數字
   - 用於統計問題
   - 需要記憶化搜索
   - 典型題: 數字 1 的個數、數字範圍統計

**面試高頻題目**:
- 戳氣球 (LeetCode 312)
- 旅行商問題 (TSP)
- 打家劫舍 III (LeetCode 337)
- 二元樹最大路徑和 (LeetCode 124)
- 火柴拼正方形 (LeetCode 473)

這些進階DP題型需要扎實的DP基礎和靈活的狀態設計能力,是高級面試中的重點考察內容。
