# 滑動窗口算法

- **難度**: 6
- **重要程度**: 5
- **標籤**: `滑動窗口`, `子串問題`, `最值問題`

## 問題詳述

滑動窗口是一種高效處理陣列/字串**子區間**問題的算法技巧。核心思想是維護一個「窗口」在陣列上滑動,通過動態調整窗口大小和位置來求解問題,時間複雜度通常可優化到 O(n)。

## 核心理論與詳解

### 1. 滑動窗口基本原理

**核心思想**:
- 使用**兩個指針** (left, right) 表示窗口的左右邊界
- **擴大窗口**: 右指針右移,將元素加入窗口
- **縮小窗口**: 左指針右移,將元素移出窗口
- **更新結果**: 在適當時機記錄最優解

**視覺化**:
```
陣列: [a, b, c, d, e, f]
         L     R         初始窗口 [a,b,c]
            L     R      右移後 [b,c,d]
               L     R   再右移 [c,d,e]
```

**時間複雜度**: O(n),每個元素最多被訪問兩次 (進窗口一次,出窗口一次)
**空間複雜度**: O(k),k 為字元集大小或窗口內需要維護的資料結構大小

### 2. 滑動窗口模板

#### 模板一: 固定窗口大小

適用於窗口大小固定的問題。

```go
func fixedSlidingWindow(arr []int, k int) []int {
    result := []int{}
    
    // 初始化窗口
    for i := 0; i < k; i++ {
        // 將 arr[i] 加入窗口
    }
    result = append(result, getWindowValue())
    
    // 滑動窗口
    for i := k; i < len(arr); i++ {
        // 移出窗口: arr[i-k]
        // 加入窗口: arr[i]
        result = append(result, getWindowValue())
    }
    
    return result
}
```

#### 模板二: 可變窗口大小 (求最大)

適用於求滿足條件的**最大**窗口。

```go
func maxSlidingWindow(arr []int) int {
    left, right := 0, 0
    maxLen := 0
    
    for right < len(arr) {
        // 擴大窗口: 將 arr[right] 加入窗口
        updateWindow(arr[right])
        right++
        
        // 縮小窗口: 當窗口不滿足條件時
        for !isValid() {
            // 移出窗口: arr[left]
            updateWindow(arr[left])
            left++
        }
        
        // 更新最大值
        maxLen = max(maxLen, right - left)
    }
    
    return maxLen
}
```

#### 模板三: 可變窗口大小 (求最小)

適用於求滿足條件的**最小**窗口。

```go
func minSlidingWindow(arr []int, target int) int {
    left, right := 0, 0
    minLen := math.MaxInt32
    
    for right < len(arr) {
        // 擴大窗口
        updateWindow(arr[right])
        right++
        
        // 縮小窗口: 當窗口滿足條件時,嘗試縮小
        for isValid() {
            // 更新最小值
            minLen = min(minLen, right - left)
            
            // 移出窗口
            updateWindow(arr[left])
            left++
        }
    }
    
    if minLen == math.MaxInt32 {
        return 0
    }
    return minLen
}
```

### 3. 經典問題與解法

#### 問題一: 最長無重複字元子串

**LeetCode 3. Longest Substring Without Repeating Characters**

```go
func lengthOfLongestSubstring(s string) int {
    charMap := make(map[byte]int)
    left, maxLen := 0, 0
    
    for right := 0; right < len(s); right++ {
        // 擴大窗口
        charMap[s[right]]++
        
        // 縮小窗口: 直到沒有重複字元
        for charMap[s[right]] > 1 {
            charMap[s[left]]--
            left++
        }
        
        // 更新最大長度
        maxLen = max(maxLen, right - left + 1)
    }
    
    return maxLen
}
```

#### 問題二: 最小覆蓋子串

**LeetCode 76. Minimum Window Substring**

在字串 s 中找最小的子串,包含 t 的所有字元。

```go
func minWindow(s string, t string) string {
    if len(s) < len(t) {
        return ""
    }
    
    // 記錄 t 中每個字元的需求數量
    need := make(map[byte]int)
    for i := 0; i < len(t); i++ {
        need[t[i]]++
    }
    
    window := make(map[byte]int)
    left, right := 0, 0
    valid := 0  // 窗口中滿足需求的字元種類數
    
    start, length := 0, math.MaxInt32
    
    for right < len(s) {
        // 擴大窗口
        c := s[right]
        right++
        
        if need[c] > 0 {
            window[c]++
            if window[c] == need[c] {
                valid++
            }
        }
        
        // 縮小窗口: 當窗口已包含所有字元時
        for valid == len(need) {
            // 更新最小覆蓋子串
            if right - left < length {
                start = left
                length = right - left
            }
            
            // 移出窗口
            d := s[left]
            left++
            
            if need[d] > 0 {
                if window[d] == need[d] {
                    valid--
                }
                window[d]--
            }
        }
    }
    
    if length == math.MaxInt32 {
        return ""
    }
    return s[start : start + length]
}
```

#### 問題三: 找到字串中所有字母異位詞

**LeetCode 438. Find All Anagrams in a String**

```go
func findAnagrams(s string, p string) []int {
    result := []int{}
    if len(s) < len(p) {
        return result
    }
    
    need := make(map[byte]int)
    for i := 0; i < len(p); i++ {
        need[p[i]]++
    }
    
    window := make(map[byte]int)
    left, right := 0, 0
    valid := 0
    
    for right < len(s) {
        c := s[right]
        right++
        
        if need[c] > 0 {
            window[c]++
            if window[c] == need[c] {
                valid++
            }
        }
        
        // 當窗口大小等於 p 的長度時
        for right - left >= len(p) {
            // 檢查是否找到異位詞
            if valid == len(need) {
                result = append(result, left)
            }
            
            // 縮小窗口
            d := s[left]
            left++
            
            if need[d] > 0 {
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

#### 問題四: 長度最小的子陣列

**LeetCode 209. Minimum Size Subarray Sum**

找出總和 ≥ target 的最小連續子陣列。

```go
func minSubArrayLen(target int, nums []int) int {
    left, sum := 0, 0
    minLen := math.MaxInt32
    
    for right := 0; right < len(nums); right++ {
        // 擴大窗口
        sum += nums[right]
        
        // 縮小窗口: 當總和已滿足條件時
        for sum >= target {
            minLen = min(minLen, right - left + 1)
            sum -= nums[left]
            left++
        }
    }
    
    if minLen == math.MaxInt32 {
        return 0
    }
    return minLen
}
```

#### 問題五: 最多包含 K 個不同字元的最長子串

**LeetCode 340. Longest Substring with At Most K Distinct Characters**

```go
func lengthOfLongestSubstringKDistinct(s string, k int) int {
    if k == 0 {
        return 0
    }
    
    charCount := make(map[byte]int)
    left, maxLen := 0, 0
    
    for right := 0; right < len(s); right++ {
        // 擴大窗口
        charCount[s[right]]++
        
        // 縮小窗口: 當字元種類超過 k 時
        for len(charCount) > k {
            charCount[s[left]]--
            if charCount[s[left]] == 0 {
                delete(charCount, s[left])
            }
            left++
        }
        
        // 更新最大長度
        maxLen = max(maxLen, right - left + 1)
    }
    
    return maxLen
}
```

### 4. 滑動窗口變體

#### 變體一: 固定大小滑動窗口

**範例**: 滑動窗口最大值

```go
func maxSlidingWindow(nums []int, k int) []int {
    result := []int{}
    deque := []int{}  // 單調遞減佇列,存儲索引
    
    for i := 0; i < len(nums); i++ {
        // 移除窗口外的元素
        for len(deque) > 0 && deque[0] < i - k + 1 {
            deque = deque[1:]
        }
        
        // 維護單調遞減佇列
        for len(deque) > 0 && nums[deque[len(deque)-1]] < nums[i] {
            deque = deque[:len(deque)-1]
        }
        
        deque = append(deque, i)
        
        // 當窗口大小達到 k 時,記錄最大值
        if i >= k - 1 {
            result = append(result, nums[deque[0]])
        }
    }
    
    return result
}
```

#### 變體二: 多指針滑動窗口

**範例**: 水果籃問題

```go
func totalFruit(fruits []int) int {
    fruitCount := make(map[int]int)
    left, maxFruits := 0, 0
    
    for right := 0; right < len(fruits); right++ {
        fruitCount[fruits[right]]++
        
        // 最多兩種水果
        for len(fruitCount) > 2 {
            fruitCount[fruits[left]]--
            if fruitCount[fruits[left]] == 0 {
                delete(fruitCount, fruits[left])
            }
            left++
        }
        
        maxFruits = max(maxFruits, right - left + 1)
    }
    
    return maxFruits
}
```

### 5. 常見陷阱與技巧

**陷阱一: 窗口邊界處理**
- 注意 `right - left` 和 `right - left + 1` 的區別
- `right - left`: 當 right 已經 ++ 後
- `right - left + 1`: 當 right 還未 ++ 時

**陷阱二: 何時更新答案**
- 求**最大**: 在窗口有效時更新
- 求**最小**: 在窗口剛好滿足條件時更新

**陷阱三: 字元計數**
- 使用 `map[byte]int` 統計字元頻率
- 刪除計數為 0 的鍵,保持 map 大小正確

**技巧一: 使用哈希表統計**
```go
need := make(map[byte]int)    // 需求
window := make(map[byte]int)  // 當前窗口
valid := 0                     // 滿足條件的字元數
```

**技巧二: 單調佇列優化**
當需要維護窗口內的最值時,使用單調佇列可以達到 O(1) 查詢。

## 實際應用場景

### 1. 日誌分析 - 時間窗口統計

統計最近 N 秒內的請求數量。

```go
type RequestCounter struct {
    requests []int64
    window   int64
}

func (rc *RequestCounter) Hit(timestamp int64) int {
    // 移除窗口外的請求
    i := 0
    for i < len(rc.requests) && rc.requests[i] < timestamp - rc.window {
        i++
    }
    rc.requests = rc.requests[i:]
    
    // 加入新請求
    rc.requests = append(rc.requests, timestamp)
    
    return len(rc.requests)
}
```

### 2. 股票交易 - 最佳買賣時機

在固定天數內找最大利潤。

```go
func maxProfit(prices []int, k int) int {
    if len(prices) <= 1 {
        return 0
    }
    
    maxProfit := 0
    minPrice := prices[0]
    
    for i := 0; i < len(prices); i++ {
        if i >= k {
            // 考慮賣出 prices[i-k] 天買入的股票
            minPrice = min(minPrice, prices[i-k])
        }
        
        maxProfit = max(maxProfit, prices[i] - minPrice)
        minPrice = min(minPrice, prices[i])
    }
    
    return maxProfit
}
```

### 3. 網絡監控 - 異常流量檢測

檢測固定時間窗口內的異常流量。

```go
type TrafficMonitor struct {
    traffic   []int
    threshold int
    windowSize int
}

func (tm *TrafficMonitor) IsAnomalous(newTraffic int) bool {
    tm.traffic = append(tm.traffic, newTraffic)
    
    // 保持窗口大小
    if len(tm.traffic) > tm.windowSize {
        tm.traffic = tm.traffic[1:]
    }
    
    // 計算窗口內平均流量
    sum := 0
    for _, t := range tm.traffic {
        sum += t
    }
    avg := sum / len(tm.traffic)
    
    // 判斷是否異常
    return newTraffic > avg * tm.threshold
}
```

### 4. 推薦系統 - 最近熱門內容

維護最近時間窗口內的熱門內容。

```go
type PopularItems struct {
    items      []Item
    windowTime int64
    counter    map[string]int
}

type Item struct {
    ID        string
    Timestamp int64
}

func (pi *PopularItems) AddView(itemID string, timestamp int64) {
    // 移除窗口外的項目
    i := 0
    for i < len(pi.items) && pi.items[i].Timestamp < timestamp - pi.windowTime {
        oldItem := pi.items[i]
        pi.counter[oldItem.ID]--
        if pi.counter[oldItem.ID] == 0 {
            delete(pi.counter, oldItem.ID)
        }
        i++
    }
    pi.items = pi.items[i:]
    
    // 加入新項目
    pi.items = append(pi.items, Item{itemID, timestamp})
    pi.counter[itemID]++
}

func (pi *PopularItems) GetTopK(k int) []string {
    // 根據 counter 排序返回 Top K
    type pair struct {
        id    string
        count int
    }
    
    pairs := []pair{}
    for id, count := range pi.counter {
        pairs = append(pairs, pair{id, count})
    }
    
    sort.Slice(pairs, func(i, j int) bool {
        return pairs[i].count > pairs[j].count
    })
    
    result := []string{}
    for i := 0; i < k && i < len(pairs); i++ {
        result = append(result, pairs[i].id)
    }
    
    return result
}
```

## 總結

**滑動窗口核心要點**:
1. **適用場景**: 連續子區間問題 (子陣列、子串)
2. **核心技巧**: 雙指針 + 動態調整窗口大小
3. **時間複雜度**: O(n),優於暴力解法的 O(n²)
4. **三大模板**: 固定窗口、求最大窗口、求最小窗口
5. **關鍵點**: 何時擴大窗口、何時縮小窗口、何時更新答案

**識別滑動窗口問題**:
- 題目涉及**連續子區間**
- 要求最長/最短/最值
- 涉及字串或陣列
- 可以用暴力雙重迴圈解決 (但可優化)

**面試高頻題目**:
- 最長無重複字元子串 (LeetCode 3)
- 最小覆蓋子串 (LeetCode 76)
- 字母異位詞 (LeetCode 438)
- 長度最小的子陣列 (LeetCode 209)
- 滑動窗口最大值 (LeetCode 239)

**實際應用**:
- 日誌分析 (時間窗口統計)
- 股票交易 (固定週期分析)
- 網絡監控 (異常檢測)
- 推薦系統 (熱門內容)

滑動窗口是優化子區間問題的利器,熟練掌握三大模板後,可快速解決大部分相關問題。
