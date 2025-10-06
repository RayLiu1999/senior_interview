# 二分搜尋及其變體

- **難度**: 5
- **重要程度**: 5
- **標籤**: `二分搜尋`, `查找邊界`, `旋轉陣列`, `LeetCode 高頻`

## 問題詳述

二分搜尋是最基礎也是最重要的算法之一，不僅應用廣泛，更是許多複雜算法的基礎。本文詳解**標準二分搜尋**和**各種變體**，掌握後可解決大量相關題目。

## 核心理論與詳解

### 1. 標準二分搜尋

#### 基本原理

在**有序陣列**中查找目標值，每次將搜尋區間縮小一半。

**時間複雜度**: O(log n)
**空間複雜度**: O(1)

#### 標準實現（LeetCode 704）

```go
func binarySearch(nums []int, target int) int {
    left, right := 0, len(nums)-1
    
    for left <= right {
        // 防止溢位
        mid := left + (right-left)/2
        
        if nums[mid] == target {
            return mid  // 找到目標
        } else if nums[mid] < target {
            left = mid + 1  // 在右半部分
        } else {
            right = mid - 1  // 在左半部分
        }
    }
    
    return -1  // 未找到
}
```

**圖解**:
```
陣列: [1, 3, 5, 7, 9, 11, 13]
目標: 7

Step 1: left=0, right=6, mid=3
        1  3  5  [7]  9  11  13
                  ↑
               target

Step 2: nums[3]=7 == target
        返回 3
```

#### 常見錯誤

**錯誤 1: 整數溢位**
```go
// ❌ 錯誤: left + right 可能溢位
mid := (left + right) / 2

// ✅ 正確: 防止溢位
mid := left + (right - left) / 2
```

**錯誤 2: 邊界條件**
```go
// 注意 <= 還是 <
for left <= right {  // 正確: 區間 [left, right]
for left < right {   // 區間 [left, right)，需要特殊處理
```

### 2. 變體一：查找左邊界

找到第一個等於目標值的位置。

**場景**: `[1, 2, 2, 2, 3]` 中找 `2`，應返回索引 `1`

```go
// 查找左邊界（第一個 >= target 的位置）
func searchLeft(nums []int, target int) int {
    left, right := 0, len(nums)-1
    result := -1
    
    for left <= right {
        mid := left + (right-left)/2
        
        if nums[mid] >= target {
            if nums[mid] == target {
                result = mid  // 記錄結果
            }
            right = mid - 1   // 繼續在左半部分找
        } else {
            left = mid + 1
        }
    }
    
    return result
}

// 另一種實現方式
func searchLeftBoundary(nums []int, target int) int {
    left, right := 0, len(nums)  // 注意: right = len(nums)
    
    for left < right {  // 注意: < 而非 <=
        mid := left + (right-left)/2
        
        if nums[mid] < target {
            left = mid + 1
        } else {
            right = mid  // 不是 mid - 1
        }
    }
    
    // 檢查是否找到
    if left < len(nums) && nums[left] == target {
        return left
    }
    return -1
}
```

### 3. 變體二：查找右邊界

找到最後一個等於目標值的位置。

**場景**: `[1, 2, 2, 2, 3]` 中找 `2`，應返回索引 `3`

```go
// 查找右邊界（最後一個 <= target 的位置）
func searchRight(nums []int, target int) int {
    left, right := 0, len(nums)-1
    result := -1
    
    for left <= right {
        mid := left + (right-left)/2
        
        if nums[mid] <= target {
            if nums[mid] == target {
                result = mid  // 記錄結果
            }
            left = mid + 1    // 繼續在右半部分找
        } else {
            right = mid - 1
        }
    }
    
    return result
}
```

### 4. 變體三：旋轉陣列搜尋

#### 搜尋旋轉排序陣列（LeetCode 33）

```go
func search(nums []int, target int) int {
    left, right := 0, len(nums)-1
    
    for left <= right {
        mid := left + (right-left)/2
        
        if nums[mid] == target {
            return mid
        }
        
        // 判斷哪一半是有序的
        if nums[left] <= nums[mid] {
            // 左半部分有序
            if nums[left] <= target && target < nums[mid] {
                right = mid - 1  // target 在左半部分
            } else {
                left = mid + 1   // target 在右半部分
            }
        } else {
            // 右半部分有序
            if nums[mid] < target && target <= nums[right] {
                left = mid + 1   // target 在右半部分
            } else {
                right = mid - 1  // target 在左半部分
            }
        }
    }
    
    return -1
}
```

**圖解**:
```
原陣列: [1, 2, 3, 4, 5, 6, 7]
旋轉後: [4, 5, 6, 7, 1, 2, 3]
目標: 2

Step 1: left=0, mid=3, right=6
        [4, 5, 6, 7, 1, 2, 3]
                 ↑
        左半部分有序 [4,5,6,7]
        target=2 不在左半，搜尋右半

Step 2: left=4, mid=5, right=6
        [4, 5, 6, 7, 1, 2, 3]
                       ↑
        右半部分有序 [1,2,3]
        target=2 在右半部分

Step 3: 找到 target
```

#### 搜尋旋轉排序陣列 II（LeetCode 81，有重複）

```go
func searchWithDuplicates(nums []int, target int) bool {
    left, right := 0, len(nums)-1
    
    for left <= right {
        mid := left + (right-left)/2
        
        if nums[mid] == target {
            return true
        }
        
        // 處理重複元素
        if nums[left] == nums[mid] && nums[mid] == nums[right] {
            left++
            right--
            continue
        }
        
        // 判斷哪一半有序
        if nums[left] <= nums[mid] {
            if nums[left] <= target && target < nums[mid] {
                right = mid - 1
            } else {
                left = mid + 1
            }
        } else {
            if nums[mid] < target && target <= nums[right] {
                left = mid + 1
            } else {
                right = mid - 1
            }
        }
    }
    
    return false
}
```

### 5. 變體四：尋找峰值

#### 尋找峰值元素（LeetCode 162）

峰值元素是指其值大於左右相鄰值的元素。

```go
func findPeakElement(nums []int) int {
    left, right := 0, len(nums)-1
    
    for left < right {
        mid := left + (right-left)/2
        
        if nums[mid] > nums[mid+1] {
            // mid 可能是峰值，或峰值在左側
            right = mid
        } else {
            // 峰值在右側
            left = mid + 1
        }
    }
    
    return left
}
```

**原理**:
```
如果 nums[mid] > nums[mid+1]:
    左側必有峰值（或 mid 就是峰值）
如果 nums[mid] < nums[mid+1]:
    右側必有峰值
```

### 6. 變體五：在範圍內搜尋

#### 在 D 天內送達包裹的最低運力（LeetCode 1011）

```go
func shipWithinDays(weights []int, days int) int {
    // 二分搜尋的範圍
    left := max(weights)     // 最小運力：最重的包裹
    right := sum(weights)    // 最大運力：所有包裹總重
    
    for left < right {
        mid := left + (right-left)/2
        
        if canShip(weights, days, mid) {
            // 可以運送，嘗試更小的運力
            right = mid
        } else {
            // 不能運送，需要更大的運力
            left = mid + 1
        }
    }
    
    return left
}

// 檢查是否能在 days 天內運送完
func canShip(weights []int, days int, capacity int) bool {
    currentDay := 1
    currentWeight := 0
    
    for _, w := range weights {
        if currentWeight+w > capacity {
            // 需要新的一天
            currentDay++
            currentWeight = w
            
            if currentDay > days {
                return false
            }
        } else {
            currentWeight += w
        }
    }
    
    return true
}

func max(nums []int) int {
    maxVal := nums[0]
    for _, n := range nums {
        if n > maxVal {
            maxVal = n
        }
    }
    return maxVal
}

func sum(nums []int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}
```

### 7. 變體六：矩陣搜尋

#### 搜尋二維矩陣（LeetCode 74）

```go
func searchMatrix(matrix [][]int, target int) bool {
    if len(matrix) == 0 || len(matrix[0]) == 0 {
        return false
    }
    
    m, n := len(matrix), len(matrix[0])
    left, right := 0, m*n-1
    
    for left <= right {
        mid := left + (right-left)/2
        // 將一維索引轉換為二維
        row := mid / n
        col := mid % n
        
        if matrix[row][col] == target {
            return true
        } else if matrix[row][col] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    
    return false
}
```

**原理**: 將二維矩陣視為一維有序陣列

```
矩陣:
[1,  3,  5,  7]
[10, 11, 16, 20]
[23, 30, 34, 60]

視為一維:
[1, 3, 5, 7, 10, 11, 16, 20, 23, 30, 34, 60]

索引轉換:
一維索引 index → 二維索引 (row, col)
row = index / n
col = index % n
```

### 8. 二分搜尋模板總結

#### 模板一：標準二分

```go
func binarySearch(nums []int, target int) int {
    left, right := 0, len(nums)-1
    
    for left <= right {  // 注意 <=
        mid := left + (right-left)/2
        
        if nums[mid] == target {
            return mid
        } else if nums[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    
    return -1
}
```

**適用**: 查找確切值

#### 模板二：查找邊界

```go
func searchBoundary(nums []int, target int) int {
    left, right := 0, len(nums)  // 注意 right 初始化
    
    for left < right {  // 注意 <
        mid := left + (right-left)/2
        
        if nums[mid] < target {
            left = mid + 1
        } else {
            right = mid  // 注意不是 mid - 1
        }
    }
    
    return left
}
```

**適用**: 查找左邊界、插入位置

#### 模板三：最小化/最大化

```go
func minimizeMax(nums []int, condition func(int) bool) int {
    left, right := minValue, maxValue
    
    for left < right {
        mid := left + (right-left)/2
        
        if condition(mid) {
            right = mid  // 滿足條件，嘗試更小的值
        } else {
            left = mid + 1  // 不滿足，需要更大的值
        }
    }
    
    return left
}
```

**適用**: 最優化問題、能力檢測

### 9. 實際應用場景

#### Git Bisect

Git 使用二分搜尋快速定位引入 bug 的提交：

```bash
git bisect start
git bisect bad           # 當前版本有 bug
git bisect good v1.0     # v1.0 版本正常

# Git 自動二分搜尋中間版本
# 測試後標記 good 或 bad
# 最終找到第一個出問題的提交
```

#### 資料庫索引

B+ 樹索引本質上是多路二分搜尋。

#### 版本控制

Chrome 瀏覽器版本管理使用二分搜尋快速定位問題版本。

### 10. 高頻題目列表

| 難度 | 題號 | 題目 | 考點 |
|-----|------|------|------|
| Easy | 704 | 二分搜尋 | 標準二分 |
| Easy | 35 | 搜尋插入位置 | 左邊界 |
| Medium | 34 | 在排序陣列中查找元素的第一個和最後一個位置 | 左右邊界 |
| Medium | 33 | 搜尋旋轉排序陣列 | 旋轉陣列 |
| Medium | 81 | 搜尋旋轉排序陣列 II | 重複元素 |
| Medium | 153 | 尋找旋轉排序陣列中的最小值 | 旋轉陣列 |
| Medium | 162 | 尋找峰值 | 峰值搜尋 |
| Medium | 74 | 搜尋二維矩陣 | 矩陣搜尋 |
| Medium | 1011 | 在 D 天內送達包裹的能力 | 最優化 |
| Hard | 4 | 尋找兩個正序陣列的中位數 | 雙陣列 |

## 總結

二分搜尋是算法的基石：

1. **核心思想**: 每次縮小一半搜尋範圍
2. **時間複雜度**: O(log n)，極其高效
3. **關鍵點**: 邊界條件、溢位處理、區間定義
4. **變體**: 左右邊界、旋轉陣列、峰值、最優化

作為資深後端工程師，你需要：
- 熟練掌握標準二分搜尋
- 理解各種變體的原理和應用
- 能夠靈活運用二分思想解決最優化問題
- 注意邊界條件和整數溢位
- 理解二分搜尋在實際系統中的應用（索引、版本控制）
