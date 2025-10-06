# 動態規劃基礎（背包問題、最長子序列）

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Dynamic Programming`, `Interview Hot`, `Algorithm Design`

## 問題詳述

動態規劃（Dynamic Programming, DP）是一種透過**分解問題、記憶化結果**來避免重複計算的算法思想。本題聚焦於兩類經典問題：**背包問題**（資源分配）和**最長子序列**（序列優化）。這些是面試中最常見的 DP 題型。

## 核心理論與詳解

### 1. 動態規劃的核心要素

#### 1.1 判斷題目是否適合 DP

**三大特徵**：

1. **最優子結構（Optimal Substructure）**
   - 大問題的最優解可以由子問題的最優解推導出來
   - 例如：最短路徑 `A→C` = `A→B` + `B→C`

2. **重疊子問題（Overlapping Subproblems）**
   - 遞迴過程中會重複計算相同的子問題
   - 例如：計算 `fib(5)` 時會多次計算 `fib(3)`

3. **無後效性（No Aftereffect）**
   - 當前狀態只與之前的狀態有關，與未來的決策無關
   - 做過的決策不會因為後續決策而改變

#### 1.2 DP 的解題步驟

1. **定義狀態（State Definition）**
   - `dp[i]` 或 `dp[i][j]` 表示什麼？
   - 例如：`dp[i]` = 前 i 個元素的最大和

2. **找出狀態轉移方程（State Transition）**
   - 當前狀態如何從之前的狀態推導？
   - 例如：`dp[i] = max(dp[i-1] + nums[i], nums[i])`

3. **初始化（Initialization）**
   - 邊界條件是什麼？
   - 例如：`dp[0] = nums[0]`

4. **確定計算順序（Computation Order）**
   - 從小到大？從大到小？
   - 一維還是二維遍歷？

5. **返回結果（Return Value）**
   - 最終答案在哪個狀態？
   - 例如：`dp[n-1]` 或 `max(dp)`

---

### 2. 背包問題（Knapsack Problem）

背包問題是資源分配的經典模型，廣泛應用於**資源調度、預算分配、貨櫃裝載**等場景。

#### 2.1 0/1 背包問題

**問題描述**：
- 有 `n` 個物品，每個物品有重量 `w[i]` 和價值 `v[i]`
- 背包容量為 `W`
- 每個物品**只能選一次**（0 或 1）
- 求最大總價值

**狀態定義**：
```
dp[i][j] = 前 i 個物品，背包容量為 j 時的最大價值
```

**狀態轉移方程**：
```
dp[i][j] = max(
    dp[i-1][j],              // 不選第 i 個物品
    dp[i-1][j-w[i]] + v[i]   // 選第 i 個物品（前提：j >= w[i]）
)
```

**初始化**：
```
dp[0][j] = 0  // 沒有物品時，價值為 0
dp[i][0] = 0  // 背包容量為 0 時，價值為 0
```

**空間優化**（滾動陣列）：
- 原本需要 `O(n*W)` 空間
- 觀察到 `dp[i]` 只依賴於 `dp[i-1]`
- 可以優化為 `O(W)` 一維陣列
- **關鍵**：必須從後往前遍歷，避免覆蓋未使用的數據

```go
// 空間優化版本
func knapsack01(weights, values []int, W int) int {
    dp := make([]int, W+1)
    
    for i := 0; i < len(weights); i++ {
        // 必須從後往前，避免重複使用同一物品
        for j := W; j >= weights[i]; j-- {
            dp[j] = max(dp[j], dp[j-weights[i]] + values[i])
        }
    }
    
    return dp[W]
}

func max(a, b int) int {
    if a > b {
        return a
    }
    return b
}
```

#### 2.2 完全背包問題

**與 0/1 背包的區別**：
- 每個物品可以選**無限次**
- 例如：零錢兌換問題（LeetCode 322）

**狀態轉移方程**：
```
dp[i][j] = max(
    dp[i-1][j],              // 不選第 i 個物品
    dp[i][j-w[i]] + v[i]     // 選第 i 個物品（注意是 dp[i] 不是 dp[i-1]）
)
```

**空間優化版本**：
```go
// 完全背包
func knapsackComplete(weights, values []int, W int) int {
    dp := make([]int, W+1)
    
    for i := 0; i < len(weights); i++ {
        // 完全背包從前往後遍歷，允許重複使用
        for j := weights[i]; j <= W; j++ {
            dp[j] = max(dp[j], dp[j-weights[i]] + values[i])
        }
    }
    
    return dp[W]
}
```

**關鍵區別**：
- **0/1 背包**：內層循環**從後往前** → 每個物品只用一次
- **完全背包**：內層循環**從前往後** → 每個物品可重複使用

#### 2.3 多重背包問題

**特點**：
- 每個物品有**數量限制** `count[i]`
- 不是 0/1，也不是無限

**解法**：
- 方法 1：展開成 0/1 背包（簡單但可能 TLE）
- 方法 2：二進制優化（將 count 拆分成 1, 2, 4, 8...）

---

### 3. 最長子序列問題

#### 3.1 最長遞增子序列（LIS - LeetCode 300）

**問題描述**：
- 給定陣列 `nums`，找出最長的嚴格遞增子序列的長度
- 子序列不必連續，但必須保持相對順序

**方法 1：動態規劃 O(n²)**

**狀態定義**：
```
dp[i] = 以 nums[i] 結尾的最長遞增子序列長度
```

**狀態轉移**：
```
dp[i] = max(dp[j] + 1)  // 其中 0 <= j < i 且 nums[j] < nums[i]
```

```go
func lengthOfLIS(nums []int) int {
    if len(nums) == 0 {
        return 0
    }
    
    n := len(nums)
    dp := make([]int, n)
    // 每個元素自己至少構成長度為 1 的子序列
    for i := range dp {
        dp[i] = 1
    }
    
    maxLen := 1
    
    for i := 1; i < n; i++ {
        for j := 0; j < i; j++ {
            if nums[j] < nums[i] {
                dp[i] = max(dp[i], dp[j] + 1)
            }
        }
        maxLen = max(maxLen, dp[i])
    }
    
    return maxLen
}
```

**方法 2：貪心 + 二分搜尋 O(n log n)**

**核心思想**：
- 維護一個陣列 `tails`，`tails[i]` 表示長度為 `i+1` 的遞增子序列的**最小尾部元素**
- 對於每個新元素，用二分搜尋找到插入位置

```go
func lengthOfLIS(nums []int) int {
    tails := []int{}
    
    for _, num := range nums {
        // 二分搜尋找到第一個 >= num 的位置
        left, right := 0, len(tails)
        for left < right {
            mid := left + (right - left) / 2
            if tails[mid] < num {
                left = mid + 1
            } else {
                right = mid
            }
        }
        
        // 如果找不到，說明 num 比所有元素都大，加到尾部
        if left == len(tails) {
            tails = append(tails, num)
        } else {
            // 替換，維護更小的尾部元素
            tails[left] = num
        }
    }
    
    return len(tails)
}
```

**為什麼貪心是正確的？**
- 長度為 `k` 的遞增子序列，結尾元素越小，越容易接更大的數
- 例如：`[1, 5]` 和 `[1, 3]` 長度都是 2，但 `[1, 3]` 更容易擴展成 `[1, 3, 4]`

#### 3.2 最長公共子序列（LCS - LeetCode 1143）

**問題描述**：
- 給定兩個字串 `text1` 和 `text2`
- 找出它們最長的公共子序列長度

**狀態定義**：
```
dp[i][j] = text1[0...i-1] 和 text2[0...j-1] 的最長公共子序列長度
```

**狀態轉移**：
```
if text1[i-1] == text2[j-1]:
    dp[i][j] = dp[i-1][j-1] + 1
else:
    dp[i][j] = max(dp[i-1][j], dp[i][j-1])
```

**圖解**：
```
    ""  a  c  e
""   0  0  0  0
a    0  1  1  1
b    0  1  1  1
c    0  1  2  2
d    0  1  2  2
e    0  1  2  3
```

```go
func longestCommonSubsequence(text1, text2 string) int {
    m, n := len(text1), len(text2)
    dp := make([][]int, m+1)
    for i := range dp {
        dp[i] = make([]int, n+1)
    }
    
    for i := 1; i <= m; i++ {
        for j := 1; j <= n; j++ {
            if text1[i-1] == text2[j-1] {
                dp[i][j] = dp[i-1][j-1] + 1
            } else {
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
            }
        }
    }
    
    return dp[m][n]
}
```

**空間優化**：
- 可以優化為 `O(min(m, n))` 空間
- 使用滾動陣列，只保留當前行和上一行

#### 3.3 最長回文子序列（LeetCode 516）

**狀態定義**：
```
dp[i][j] = s[i...j] 範圍內的最長回文子序列長度
```

**狀態轉移**：
```
if s[i] == s[j]:
    dp[i][j] = dp[i+1][j-1] + 2
else:
    dp[i][j] = max(dp[i+1][j], dp[i][j-1])
```

**關鍵點**：
- 遍歷順序：從下到上，從左到右（因為 `dp[i][j]` 依賴於 `dp[i+1][...]`）
- 初始化：`dp[i][i] = 1`（單個字符是長度為 1 的回文）

```go
func longestPalindromeSubseq(s string) int {
    n := len(s)
    dp := make([][]int, n)
    for i := range dp {
        dp[i] = make([]int, n)
        dp[i][i] = 1  // 單個字符
    }
    
    // 從下到上，從左到右
    for i := n - 2; i >= 0; i-- {
        for j := i + 1; j < n; j++ {
            if s[i] == s[j] {
                dp[i][j] = dp[i+1][j-1] + 2
            } else {
                dp[i][j] = max(dp[i+1][j], dp[i][j-1])
            }
        }
    }
    
    return dp[0][n-1]
}
```

---

### 4. 其他經典 DP 問題

#### 4.1 爬樓梯（LeetCode 70）

**狀態轉移**：
```
dp[i] = dp[i-1] + dp[i-2]
```

**優化**：可以用兩個變數代替陣列

#### 4.2 零錢兌換（LeetCode 322）

**狀態定義**：
```
dp[i] = 湊出金額 i 所需的最少硬幣數
```

**狀態轉移**：
```
dp[i] = min(dp[i], dp[i-coin] + 1)  // 對於每個硬幣面額
```

#### 4.3 打家劫舍（LeetCode 198）

**狀態定義**：
```
dp[i] = 偷到第 i 家時的最大金額
```

**狀態轉移**：
```
dp[i] = max(dp[i-1], dp[i-2] + nums[i])
```

---

## 實際應用場景

### 1. 背包問題的應用

**資源分配**：
- **雲端資源調度**：有限的 CPU/內存如何分配給不同任務
- **廣告投放**：預算有限，選擇哪些廣告位以最大化 ROI
- **貨櫃裝載**：有限空間內裝載最大價值的貨物

**實例：AWS Lambda 冷啟動優化**
- 有限的內存預算
- 選擇哪些依賴庫預載入以最大化性能

### 2. LIS 的應用

**資料庫查詢優化**：
- 找出索引列的最長遞增序列
- 優化排序操作

**版本控制**：
- Git 中找出最長的非衝突提交序列

### 3. LCS 的應用

**Diff 工具**：
- `git diff`、`diff` 命令的核心算法
- 找出兩個文件的最長公共部分

**DNA 序列比對**：
- 生物信息學中比較基因序列的相似性

**文本相似度**：
- 搜尋引擎中計算文檔相似度

---

## 面試技巧與常見陷阱

### 1. 識別 DP 題目的信號

**關鍵詞**：
- "最大/最小"、"最多/最少"
- "有多少種方法"
- "是否可能"

**經典模型**：
- 路徑問題（網格、樹）
- 子序列/子陣列問題
- 字串匹配問題
- 決策問題（選或不選）

### 2. 從遞迴到 DP 的轉換

**步驟**：
1. 寫出暴力遞迴解
2. 加入 memo（記憶化搜尋）
3. 轉換為 DP（自底向上）
4. 空間優化（滾動陣列）

### 3. 常見錯誤

**錯誤 1：狀態定義不清晰**
- ❌ `dp[i]` = 前 i 個的結果（模糊）
- ✅ `dp[i]` = 以 i 結尾的最長遞增子序列長度

**錯誤 2：0/1 背包的遍歷順序錯誤**
- ❌ 從前往後 → 物品被重複使用
- ✅ 從後往前 → 確保每個物品只用一次

**錯誤 3：初始化錯誤**
- 忘記初始化邊界條件
- 例如：零錢兌換中 `dp[0] = 0`

### 4. 優化技巧

**空間優化**：
- 滾動陣列：`O(n²)` → `O(n)`
- 只需要前一行的數據時使用

**時間優化**：
- LIS：DP `O(n²)` → 貪心+二分 `O(n log n)`
- 使用數據結構加速（單調棧、線段樹）

---

## 複雜度分析

| 問題 | 時間複雜度 | 空間複雜度 | 優化後空間 |
|------|-----------|-----------|-----------|
| 0/1 背包 | O(n*W) | O(n*W) | O(W) |
| 完全背包 | O(n*W) | O(n*W) | O(W) |
| LIS (DP) | O(n²) | O(n) | O(n) |
| LIS (貪心) | O(n log n) | O(n) | O(n) |
| LCS | O(m*n) | O(m*n) | O(min(m,n)) |

---

## 延伸閱讀

- **LeetCode DP 專題**：[Top 100 Liked Questions - DP Tag](https://leetcode.com/tag/dynamic-programming/)
- **經典書籍**：《算法導論》第 15 章 - 動態規劃
- **進階主題**：狀態壓縮 DP、樹形 DP、區間 DP
