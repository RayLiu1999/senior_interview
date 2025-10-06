# 排序算法全解析

- **難度**: 5
- **重要程度**: 5
- **標籤**: `快排`, `歸併`, `堆排序`, `穩定性`, `時間複雜度`

## 問題詳述

排序是計算機科學中最基礎也是最重要的算法之一。本文深入解析**常見排序算法**的原理、實現、時間空間複雜度、穩定性，以及在實際工程中的應用。

## 核心理論與詳解

### 1. 排序算法對比總覽

| 算法 | 平均時間 | 最壞時間 | 最好時間 | 空間 | 穩定性 | 適用場景 |
|-----|---------|---------|---------|------|--------|---------|
| **冒泡排序** | O(n²) | O(n²) | O(n) | O(1) | ✅ | 教學用 |
| **選擇排序** | O(n²) | O(n²) | O(n²) | O(1) | ❌ | 小資料 |
| **插入排序** | O(n²) | O(n²) | O(n) | O(1) | ✅ | 小資料、近乎有序 |
| **快速排序** | O(n log n) | O(n²) | O(n log n) | O(log n) | ❌ | **通用首選** |
| **歸併排序** | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ | 鏈結串列、外部排序 |
| **堆排序** | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ | 優先佇列 |
| **計數排序** | O(n+k) | O(n+k) | O(n+k) | O(k) | ✅ | 整數、範圍小 |
| **桶排序** | O(n+k) | O(n²) | O(n) | O(n+k) | ✅ | 均勻分佈 |
| **基數排序** | O(d(n+k)) | O(d(n+k)) | O(d(n+k)) | O(n+k) | ✅ | 整數、字串 |

### 2. 快速排序（Quick Sort）

#### 原理

選擇一個**基準值（pivot）**，將陣列分為兩部分：
- 左邊所有元素 ≤ pivot
- 右邊所有元素 > pivot

然後遞迴排序兩部分。

#### 實現

```go
func quickSort(nums []int) {
    quickSortHelper(nums, 0, len(nums)-1)
}

func quickSortHelper(nums []int, left, right int) {
    if left >= right {
        return
    }
    
    // 分割陣列
    pivotIndex := partition(nums, left, right)
    
    // 遞迴排序兩部分
    quickSortHelper(nums, left, pivotIndex-1)
    quickSortHelper(nums, pivotIndex+1, right)
}

// 分割函數（Hoare 分割）
func partition(nums []int, left, right int) int {
    // 選擇最左邊為基準值
    pivot := nums[left]
    i, j := left, right
    
    for i < j {
        // 從右向左找第一個 < pivot 的元素
        for i < j && nums[j] >= pivot {
            j--
        }
        // 從左向右找第一個 > pivot 的元素
        for i < j && nums[i] <= pivot {
            i++
        }
        // 交換
        if i < j {
            nums[i], nums[j] = nums[j], nums[i]
        }
    }
    
    // 將 pivot 放到正確位置
    nums[left], nums[i] = nums[i], nums[left]
    return i
}
```

#### 圖解

```
初始: [3, 6, 8, 10, 1, 2, 1]
pivot = 3

Step 1: 分割
[1, 2, 1] 3 [6, 8, 10]
 ← pivot左 ↑  pivot右 →

Step 2: 遞迴排序左邊 [1, 2, 1]
[1, 1, 2]

Step 3: 遞迴排序右邊 [6, 8, 10]
[6, 8, 10]

最終: [1, 1, 2, 3, 6, 8, 10]
```

#### 優化技巧

**1. 三數取中選擇 pivot**

```go
func medianOfThree(nums []int, left, right int) int {
    mid := left + (right-left)/2
    
    if nums[left] > nums[mid] {
        nums[left], nums[mid] = nums[mid], nums[left]
    }
    if nums[mid] > nums[right] {
        nums[mid], nums[right] = nums[right], nums[mid]
    }
    if nums[left] > nums[mid] {
        nums[left], nums[mid] = nums[mid], nums[left]
    }
    
    return mid
}
```

**2. 小陣列使用插入排序**

```go
func quickSortOptimized(nums []int, left, right int) {
    if right-left < 10 {
        insertionSort(nums, left, right)
        return
    }
    
    // 正常快排
    pivotIndex := partition(nums, left, right)
    quickSortOptimized(nums, left, pivotIndex-1)
    quickSortOptimized(nums, pivotIndex+1, right)
}
```

**3. 三路快排（處理重複元素）**

```go
func quickSort3Way(nums []int, left, right int) {
    if left >= right {
        return
    }
    
    lt := left          // nums[left+1...lt] < pivot
    gt := right         // nums[gt...right] > pivot
    i := left + 1       // nums[lt+1...i-1] == pivot
    pivot := nums[left]
    
    for i <= gt {
        if nums[i] < pivot {
            nums[i], nums[lt+1] = nums[lt+1], nums[i]
            lt++
            i++
        } else if nums[i] > pivot {
            nums[i], nums[gt] = nums[gt], nums[i]
            gt--
        } else {
            i++
        }
    }
    
    nums[left], nums[lt] = nums[lt], nums[left]
    
    quickSort3Way(nums, left, lt-1)
    quickSort3Way(nums, gt+1, right)
}
```

### 3. 歸併排序（Merge Sort）

#### 原理

**分治思想**:
1. 將陣列分成兩半
2. 遞迴排序兩半
3. 合併兩個有序陣列

#### 實現

```go
func mergeSort(nums []int) []int {
    if len(nums) <= 1 {
        return nums
    }
    
    // 分割
    mid := len(nums) / 2
    left := mergeSort(nums[:mid])
    right := mergeSort(nums[mid:])
    
    // 合併
    return merge(left, right)
}

func merge(left, right []int) []int {
    result := make([]int, 0, len(left)+len(right))
    i, j := 0, 0
    
    // 合併兩個有序陣列
    for i < len(left) && j < len(right) {
        if left[i] <= right[j] {
            result = append(result, left[i])
            i++
        } else {
            result = append(result, right[j])
            j++
        }
    }
    
    // 添加剩餘元素
    result = append(result, left[i:]...)
    result = append(result, right[j:]...)
    
    return result
}
```

#### 原地歸併（優化空間）

```go
func mergeSortInPlace(nums []int) {
    temp := make([]int, len(nums))
    mergeSortInPlaceHelper(nums, temp, 0, len(nums)-1)
}

func mergeSortInPlaceHelper(nums, temp []int, left, right int) {
    if left >= right {
        return
    }
    
    mid := left + (right-left)/2
    mergeSortInPlaceHelper(nums, temp, left, mid)
    mergeSortInPlaceHelper(nums, temp, mid+1, right)
    mergeInPlace(nums, temp, left, mid, right)
}

func mergeInPlace(nums, temp []int, left, mid, right int) {
    // 複製到臨時陣列
    for i := left; i <= right; i++ {
        temp[i] = nums[i]
    }
    
    i, j, k := left, mid+1, left
    
    for i <= mid && j <= right {
        if temp[i] <= temp[j] {
            nums[k] = temp[i]
            i++
        } else {
            nums[k] = temp[j]
            j++
        }
        k++
    }
    
    for i <= mid {
        nums[k] = temp[i]
        i++
        k++
    }
    
    for j <= right {
        nums[k] = temp[j]
        j++
        k++
    }
}
```

### 4. 堆排序（Heap Sort）

#### 原理

1. 建立最大堆
2. 將堆頂（最大值）與最後一個元素交換
3. 調整剩餘元素為最大堆
4. 重複步驟 2-3

#### 實現

```go
func heapSort(nums []int) {
    n := len(nums)
    
    // 建立最大堆
    for i := n/2 - 1; i >= 0; i-- {
        heapify(nums, n, i)
    }
    
    // 逐個取出堆頂元素
    for i := n - 1; i > 0; i-- {
        // 將堆頂（最大值）與最後一個元素交換
        nums[0], nums[i] = nums[i], nums[0]
        
        // 調整剩餘元素為最大堆
        heapify(nums, i, 0)
    }
}

// 調整為最大堆
func heapify(nums []int, n, i int) {
    largest := i
    left := 2*i + 1
    right := 2*i + 2
    
    // 找出父節點、左子節點、右子節點中的最大值
    if left < n && nums[left] > nums[largest] {
        largest = left
    }
    if right < n && nums[right] > nums[largest] {
        largest = right
    }
    
    // 如果最大值不是父節點，交換並遞迴調整
    if largest != i {
        nums[i], nums[largest] = nums[largest], nums[i]
        heapify(nums, n, largest)
    }
}
```

### 5. 計數排序（Counting Sort）

#### 原理

統計每個值出現的次數，然後按順序輸出。

**適用**: 整數、範圍小（k << n）

#### 實現

```go
func countingSort(nums []int) []int {
    if len(nums) == 0 {
        return nums
    }
    
    // 找出最大值和最小值
    minVal, maxVal := nums[0], nums[0]
    for _, num := range nums {
        if num < minVal {
            minVal = num
        }
        if num > maxVal {
            maxVal = num
        }
    }
    
    // 統計每個值的出現次數
    k := maxVal - minVal + 1
    count := make([]int, k)
    for _, num := range nums {
        count[num-minVal]++
    }
    
    // 累加計數
    for i := 1; i < k; i++ {
        count[i] += count[i-1]
    }
    
    // 輸出排序結果
    result := make([]int, len(nums))
    for i := len(nums) - 1; i >= 0; i-- {
        num := nums[i]
        result[count[num-minVal]-1] = num
        count[num-minVal]--
    }
    
    return result
}
```

### 6. 穩定性詳解

**穩定排序**: 相等元素的相對順序在排序後保持不變

**為什麼重要**:
- 多鍵排序（先按年齡排序，再按姓名排序）
- 保持原始順序的語義

**穩定的排序**:
- ✅ 冒泡排序
- ✅ 插入排序
- ✅ 歸併排序
- ✅ 計數排序
- ✅ 基數排序

**不穩定的排序**:
- ❌ 選擇排序
- ❌ 快速排序
- ❌ 堆排序

### 7. 實際應用場景

#### Go 標準庫

```go
// sort.Ints 使用快排（IntroSort 混合算法）
sort.Ints(nums)

// 自訂排序
sort.Slice(items, func(i, j int) bool {
    return items[i].Score > items[j].Score
})
```

**Go 的 IntroSort**:
- 主要使用快排
- 當遞迴深度過大時切換到堆排序（避免最壞情況）
- 小陣列使用插入排序

#### MySQL 排序

```sql
SELECT * FROM users ORDER BY age, name;
```

**內部實現**:
- 小資料量：快排
- 大資料量：歸併排序（外部排序）

#### Redis SORT 命令

```redis
SORT mylist BY weight_* GET obj_*
```

使用快排實現。

### 8. TopK 問題

#### 最小的 K 個數（LeetCode 剑指 Offer 40）

**方法一：快排分割（最優）**

```go
func getLeastNumbers(arr []int, k int) []int {
    if k == 0 || len(arr) == 0 {
        return []int{}
    }
    
    return quickSelect(arr, 0, len(arr)-1, k-1)
}

func quickSelect(nums []int, left, right, k int) []int {
    pivotIndex := partition(nums, left, right)
    
    if pivotIndex == k {
        return nums[:k+1]
    } else if pivotIndex < k {
        return quickSelect(nums, pivotIndex+1, right, k)
    } else {
        return quickSelect(nums, left, pivotIndex-1, k)
    }
}
```

**時間複雜度**: O(n) 平均

**方法二：最大堆**

```go
import "container/heap"

func getLeastNumbersHeap(arr []int, k int) []int {
    if k == 0 {
        return []int{}
    }
    
    h := &MaxHeap{}
    heap.Init(h)
    
    for _, num := range arr {
        if h.Len() < k {
            heap.Push(h, num)
        } else if num < (*h)[0] {
            heap.Pop(h)
            heap.Push(h, num)
        }
    }
    
    result := make([]int, h.Len())
    for i := range result {
        result[i] = heap.Pop(h).(int)
    }
    
    return result
}

type MaxHeap []int
func (h MaxHeap) Len() int           { return len(h) }
func (h MaxHeap) Less(i, j int) bool { return h[i] > h[j] }
func (h MaxHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *MaxHeap) Push(x interface{}) { *h = append(*h, x.(int)) }
func (h *MaxHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}
```

**時間複雜度**: O(n log k)

## 總結

排序算法是算法的基礎：

1. **通用首選**: 快速排序（O(n log n) 平均）
2. **穩定排序**: 歸併排序
3. **最壞O(n log n)**: 堆排序
4. **特殊場景**: 計數排序、桶排序、基數排序

作為資深後端工程師，你需要：
- 熟練掌握快排、歸併、堆排序的實現
- 理解時間空間複雜度和穩定性
- 能夠根據場景選擇合適的排序算法
- 掌握 TopK 問題的高效解法
- 理解實際系統（Go、MySQL、Redis）的排序實現
