# 雙指針與滑動窗口技巧

- **難度**: 5
- **重要程度**: 5
- **標籤**: `Two Pointers`, `Sliding Window`, `Interview Hot`

## 問題詳述

雙指針（Two Pointers）和滑動窗口（Sliding Window）是處理**陣列、字串、鏈表**問題的高效技巧。這些技巧能將暴力 O(n²) 的解法優化到 O(n)，是面試中的高頻考點。

## 核心理論與詳解

### 1. 雙指針技巧

#### 1.1 雙指針的三種模式

**模式 1：對撞指針（相向雙指針）**
- 一個指針從頭開始，一個從尾開始
- 兩個指針向中間移動
- **適用**：有序陣列查找、回文判斷

```
[1, 2, 3, 4, 5, 6]
 ↑              ↑
left          right
```

**模式 2：快慢指針（同向雙指針）**
- 兩個指針都從頭開始，速度不同
- **適用**：鏈表環檢測、原地刪除、移動零

```
[0, 1, 0, 3, 12]
 ↑
slow/fast
```

**模式 3：固定間距雙指針**
- 兩個指針保持固定距離
- **適用**：鏈表倒數第 K 個節點、滑動窗口

```
[1, 2, 3, 4, 5, 6]
 ↑     ↑
slow  fast (間距為 K)
```

---

#### 1.2 經典雙指針題目

**題目 1：兩數之和 II（LeetCode 167）**

**問題**：有序陣列中找兩個數之和等於目標值

**暴力解法**：O(n²) - 雙層循環
**優化解法**：O(n) - 對撞指針

```go
func twoSum(numbers []int, target int) []int {
    left, right := 0, len(numbers)-1
    
    for left < right {
        sum := numbers[left] + numbers[right]
        
        if sum == target {
            return []int{left + 1, right + 1}  // 題目要求從 1 開始
        } else if sum < target {
            left++  // 和太小，左指針右移
        } else {
            right--  // 和太大，右指針左移
        }
    }
    
    return nil
}
```

**關鍵點**：
- 利用**有序性**
- 根據當前和與目標的比較決定指針移動方向

---

**題目 2：三數之和（LeetCode 15）**

**問題**：找出所有和為 0 的三元組

**解法**：排序 + 雙指針
```go
func threeSum(nums []int) [][]int {
    result := [][]int{}
    n := len(nums)
    
    // 1. 排序
    sort.Ints(nums)
    
    // 2. 固定第一個數，用雙指針找另外兩個數
    for i := 0; i < n-2; i++ {
        // 跳過重複元素
        if i > 0 && nums[i] == nums[i-1] {
            continue
        }
        
        // 剪枝：如果最小的三個數之和 > 0，後面不可能有解
        if nums[i] + nums[i+1] + nums[i+2] > 0 {
            break
        }
        
        // 雙指針
        left, right := i+1, n-1
        for left < right {
            sum := nums[i] + nums[left] + nums[right]
            
            if sum == 0 {
                result = append(result, []int{nums[i], nums[left], nums[right]})
                
                // 跳過重複元素
                for left < right && nums[left] == nums[left+1] {
                    left++
                }
                for left < right && nums[right] == nums[right-1] {
                    right--
                }
                
                left++
                right--
            } else if sum < 0 {
                left++
            } else {
                right--
            }
        }
    }
    
    return result
}
```

**關鍵點**：
- 排序後固定一個數，問題轉化為兩數之和
- **去重**：需要在三個層面去重

---

**題目 3：移動零（LeetCode 283）**

**問題**：原地移動所有 0 到陣列末尾

**解法**：快慢指針
```go
func moveZeroes(nums []int) {
    // slow：指向下一個非零元素應該放的位置
    // fast：遍歷整個陣列
    slow := 0
    
    for fast := 0; fast < len(nums); fast++ {
        if nums[fast] != 0 {
            // 交換非零元素到 slow 位置
            nums[slow], nums[fast] = nums[fast], nums[slow]
            slow++
        }
    }
}
```

**關鍵點**：
- `slow` 指針維護「已處理的非零元素」的邊界
- `fast` 指針遍歷尋找非零元素

---

**題目 4：鏈表環檢測（LeetCode 141）**

**解法**：快慢指針（Floyd 判圈算法）
```go
func hasCycle(head *ListNode) bool {
    if head == nil || head.Next == nil {
        return false
    }
    
    slow, fast := head, head
    
    for fast != nil && fast.Next != nil {
        slow = slow.Next      // 慢指針走一步
        fast = fast.Next.Next // 快指針走兩步
        
        if slow == fast {
            return true  // 相遇說明有環
        }
    }
    
    return false
}
```

**進階**：找環的入口（LeetCode 142）
```go
func detectCycle(head *ListNode) *ListNode {
    if head == nil || head.Next == nil {
        return nil
    }
    
    // 1. 判斷是否有環
    slow, fast := head, head
    hasCycle := false
    
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
        
        if slow == fast {
            hasCycle = true
            break
        }
    }
    
    if !hasCycle {
        return nil
    }
    
    // 2. 找環的入口
    // slow 從相遇點出發，fast 從頭出發，每次都走一步
    slow = head
    for slow != fast {
        slow = slow.Next
        fast = fast.Next
    }
    
    return slow
}
```

**數學證明**：
- 設頭節點到環入口距離為 `a`
- 環入口到相遇點距離為 `b`
- 相遇點到環入口距離為 `c`
- 相遇時：`2(a + b) = a + b + n(b + c)`
- 化簡得：`a = (n-1)(b + c) + c`
- 說明從頭走 `a` 步 = 從相遇點走 `c + (n-1) 圈`

---

### 2. 滑動窗口技巧

#### 2.1 滑動窗口的核心思想

**定義**：
- 維護一個**可變長度的窗口**在陣列/字串上滑動
- 窗口的左右邊界根據條件動態調整

**適用場景**：
- 子字串/子陣列問題
- 連續元素的最值/計數問題
- 關鍵詞：「最長」、「最短」、「連續」

**滑動窗口模板**：
```go
func slidingWindow(s string) int {
    left, right := 0, 0
    windowData := make(map[byte]int)  // 窗口內的數據
    result := 0
    
    for right < len(s) {
        // 1. 擴大窗口：right 指針右移
        c := s[right]
        right++
        // 更新窗口數據
        windowData[c]++
        
        // 2. 判斷是否需要收縮窗口
        for windowNeedsShrink() {
            // 縮小窗口：left 指針右移
            d := s[left]
            left++
            // 更新窗口數據
            windowData[d]--
        }
        
        // 3. 更新結果
        result = updateResult(result, right - left)
    }
    
    return result
}
```

---

#### 2.2 經典滑動窗口題目

**題目 1：無重複字符的最長子串（LeetCode 3）**

**問題**：找出字串中不含重複字符的最長子串

```go
func lengthOfLongestSubstring(s string) int {
    left, right := 0, 0
    window := make(map[byte]int)  // 記錄字符出現次數
    maxLen := 0
    
    for right < len(s) {
        // 擴大窗口
        c := s[right]
        right++
        window[c]++
        
        // 收縮窗口：當出現重複字符時
        for window[c] > 1 {
            d := s[left]
            left++
            window[d]--
        }
        
        // 更新結果
        maxLen = max(maxLen, right - left)
    }
    
    return maxLen
}

func max(a, b int) int {
    if a > b {
        return a
    }
    return b
}
```

**關鍵點**：
- `window[c] > 1` 說明窗口內有重複字符
- 收縮左邊界直到窗口內無重複

---

**題目 2：最小覆蓋子串（LeetCode 76）**

**問題**：在 S 中找最短的子串，包含 T 的所有字符

```go
func minWindow(s string, t string) string {
    // 統計 t 中每個字符的需求
    need := make(map[byte]int)
    for i := range t {
        need[t[i]]++
    }
    
    window := make(map[byte]int)
    left, right := 0, 0
    valid := 0  // 窗口中已滿足的字符種類數
    
    // 記錄最小覆蓋子串的起始位置和長度
    start, length := 0, len(s) + 1
    
    for right < len(s) {
        // 擴大窗口
        c := s[right]
        right++
        
        // 更新窗口數據
        if _, ok := need[c]; ok {
            window[c]++
            if window[c] == need[c] {
                valid++
            }
        }
        
        // 收縮窗口：當窗口已包含所有需要的字符
        for valid == len(need) {
            // 更新最小覆蓋子串
            if right - left < length {
                start = left
                length = right - left
            }
            
            // 移出窗口的字符
            d := s[left]
            left++
            
            // 更新窗口數據
            if _, ok := need[d]; ok {
                if window[d] == need[d] {
                    valid--
                }
                window[d]--
            }
        }
    }
    
    if length == len(s) + 1 {
        return ""
    }
    return s[start : start+length]
}
```

**關鍵點**：
- `valid` 變數追蹤窗口是否滿足條件
- 在滿足條件時收縮窗口，尋找最小解

---

**題目 3：找到字串中所有字母異位詞（LeetCode 438）**

**問題**：找出 s 中所有 p 的字母異位詞的起始索引

```go
func findAnagrams(s string, p string) []int {
    result := []int{}
    if len(s) < len(p) {
        return result
    }
    
    need := make(map[byte]int)
    for i := range p {
        need[p[i]]++
    }
    
    window := make(map[byte]int)
    left, right := 0, 0
    valid := 0
    
    for right < len(s) {
        c := s[right]
        right++
        
        if _, ok := need[c]; ok {
            window[c]++
            if window[c] == need[c] {
                valid++
            }
        }
        
        // 窗口大小達到 p 的長度時，開始收縮
        for right - left >= len(p) {
            // 檢查是否找到異位詞
            if valid == len(need) {
                result = append(result, left)
            }
            
            d := s[left]
            left++
            
            if _, ok := need[d]; ok {
                if window[d] == need[d] {
                    valid--
                }
                window[d]--
            }
        }
    }
    
    return result
}
```

---

**題目 4：滑動窗口最大值（LeetCode 239）**

**問題**：給定陣列和滑動窗口大小 K，返回每個窗口的最大值

**解法**：單調佇列
```go
func maxSlidingWindow(nums []int, k int) []int {
    result := []int{}
    deque := []int{}  // 儲存索引，維護單調遞減
    
    for i := 0; i < len(nums); i++ {
        // 移除窗口外的元素
        if len(deque) > 0 && deque[0] <= i-k {
            deque = deque[1:]
        }
        
        // 維護單調性：移除所有比當前元素小的元素
        for len(deque) > 0 && nums[deque[len(deque)-1]] < nums[i] {
            deque = deque[:len(deque)-1]
        }
        
        deque = append(deque, i)
        
        // 窗口形成後，記錄最大值
        if i >= k-1 {
            result = append(result, nums[deque[0]])
        }
    }
    
    return result
}
```

**關鍵點**：
- 使用**單調佇列**維護窗口最大值
- 佇列頭部永遠是當前窗口的最大值索引

---

## 實際應用場景

### 1. 限流系統（滑動窗口計數器）

```go
type RateLimiter struct {
    timestamps []int64  // 記錄請求時間戳
    limit      int      // 時間窗口內的請求上限
    windowSize int64    // 窗口大小（秒）
    mu         sync.Mutex
}

func (r *RateLimiter) AllowRequest() bool {
    r.mu.Lock()
    defer r.mu.Unlock()
    
    now := time.Now().Unix()
    windowStart := now - r.windowSize
    
    // 移除窗口外的請求記錄（收縮窗口）
    validIdx := 0
    for i, ts := range r.timestamps {
        if ts > windowStart {
            validIdx = i
            break
        }
    }
    r.timestamps = r.timestamps[validIdx:]
    
    // 檢查是否超過限制
    if len(r.timestamps) >= r.limit {
        return false
    }
    
    // 記錄當前請求
    r.timestamps = append(r.timestamps, now)
    return true
}
```

### 2. 日誌分析（查找異常模式）

**場景**：在日誌流中找出錯誤率超過閾值的時間窗口

```go
func detectAnomalies(logs []Log, windowSize int, threshold float64) []TimeRange {
    left, right := 0, 0
    errorCount := 0
    anomalies := []TimeRange{}
    
    for right < len(logs) {
        // 擴大窗口
        if logs[right].Level == "ERROR" {
            errorCount++
        }
        right++
        
        // 收縮窗口
        for right - left > windowSize {
            if logs[left].Level == "ERROR" {
                errorCount--
            }
            left++
        }
        
        // 檢測異常
        errorRate := float64(errorCount) / float64(right - left)
        if errorRate > threshold {
            anomalies = append(anomalies, TimeRange{
                Start: logs[left].Timestamp,
                End:   logs[right-1].Timestamp,
            })
        }
    }
    
    return anomalies
}
```

### 3. 資料庫查詢優化（範圍查詢）

**場景**：在有序陣列中查找範圍內的元素

```go
// 雙指針找出 [left, right] 範圍內的所有元素
func rangeQuery(arr []int, left, right int) []int {
    i := lowerBound(arr, left)  // 找到第一個 >= left 的位置
    j := upperBound(arr, right) // 找到第一個 > right 的位置
    return arr[i:j]
}
```

---

## 面試技巧與常見陷阱

### 1. 雙指針的選擇

| 問題特徵 | 使用模式 | 例題 |
|---------|---------|------|
| 有序陣列查找 | 對撞指針 | 兩數之和 II |
| 原地修改/刪除 | 快慢指針 | 移動零 |
| 鏈表問題 | 快慢指針 | 環檢測 |
| 子陣列/子字串 | 滑動窗口 | 最長子串 |

### 2. 常見錯誤

**錯誤 1：忘記更新窗口數據**
```go
// ❌ 擴大窗口時忘記更新
c := s[right]
right++
// 忘記更新 window

// ✅ 正確
c := s[right]
right++
window[c]++
```

**錯誤 2：邊界條件處理**
```go
// ❌ 可能越界
while (right < n && left < n) {
    // right++ 可能導致 right 超出範圍
}

// ✅ 先檢查再使用
while (right < n) {
    // ...
    right++
}
```

### 3. 優化技巧

**剪枝**：
```go
// 在三數之和中剪枝
if nums[i] + nums[i+1] + nums[i+2] > 0 {
    break  // 最小的三個數之和都大於 0，後面不可能有解
}
```

**去重**：
```go
// 跳過重複元素
if i > 0 && nums[i] == nums[i-1] {
    continue
}
```

---

## 複雜度分析

| 技巧 | 時間複雜度 | 空間複雜度 | 優勢 |
|------|-----------|-----------|------|
| 雙指針 | O(n) | O(1) | 替代雙層循環 |
| 滑動窗口 | O(n) | O(k) | 子陣列問題優化 |
| 暴力解法 | O(n²) | O(1) | - |

**優化效果**：
- 雙指針將 O(n²) 優化到 O(n)
- 滑動窗口避免重複計算窗口內的數據

---

## 延伸閱讀

- **LeetCode 專題**：
  - [Two Pointers Tag](https://leetcode.com/tag/two-pointers/)
  - [Sliding Window Tag](https://leetcode.com/tag/sliding-window/)
- **經典問題集**：LeetCode Hot 100、劍指 Offer
- **進階主題**：單調棧、單調佇列
