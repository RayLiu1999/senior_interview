# 排序算法實際應用

- **難度**: 6
- **重要程度**: 4
- **標籤**: `外部排序`, `分散式排序`, `TopK`, `海量資料`, `實際應用`

## 問題詳述

在實際後端系統中，排序問題遠比 LeetCode 複雜：資料量可能達到 TB 級別（無法全部載入記憶體）、資料分散在多台機器上、需要穩定性保證等。如何在這些實際場景中選擇和優化排序算法？外部排序、分散式排序、Top K 問題有哪些高效解法？

## 核心理論與詳解

### 1. 外部排序（External Sorting）

#### 1.1 問題背景

**場景**：資料量遠大於可用記憶體

**典型應用**：
- 大型資料庫的排序操作（TB 級資料）
- 日誌檔案排序與合併
- 大規模資料預處理

**核心挑戰**：
- 無法將所有資料載入記憶體
- 需要利用外部儲存（磁碟）
- 最小化磁碟 I/O 次數

#### 1.2 多路歸併排序（K-way Merge Sort）

**核心思想**：
1. **分割階段**：將大檔案分割成多個可載入記憶體的小檔案
2. **內部排序**：對每個小檔案在記憶體中排序，寫回磁碟
3. **多路歸併**：將多個有序小檔案歸併成一個大的有序檔案

**算法步驟**：

```go
package main

import (
    "bufio"
    "container/heap"
    "fmt"
    "io"
    "os"
    "sort"
    "strconv"
    "strings"
)

// 外部排序實現
type ExternalSorter struct {
    inputFile     string
    outputFile    string
    chunkSize     int // 每個小檔案的大小（行數）
    tempDir       string
    tempFiles     []string
}

// 第一階段：分割並排序
func (es *ExternalSorter) splitAndSort() error {
    file, err := os.Open(es.inputFile)
    if err != nil {
        return err
    }
    defer file.Close()
    
    scanner := bufio.NewScanner(file)
    chunk := make([]string, 0, es.chunkSize)
    chunkNum := 0
    
    for scanner.Scan() {
        chunk = append(chunk, scanner.Text())
        
        if len(chunk) >= es.chunkSize {
            if err := es.sortAndWriteChunk(chunk, chunkNum); err != nil {
                return err
            }
            chunk = chunk[:0]
            chunkNum++
        }
    }
    
    // 處理最後一個 chunk
    if len(chunk) > 0 {
        if err := es.sortAndWriteChunk(chunk, chunkNum); err != nil {
            return err
        }
    }
    
    return scanner.Err()
}

func (es *ExternalSorter) sortAndWriteChunk(chunk []string, chunkNum int) error {
    // 在記憶體中排序
    sort.Strings(chunk)
    
    // 寫入臨時檔案
    tempFile := fmt.Sprintf("%s/chunk_%d.txt", es.tempDir, chunkNum)
    es.tempFiles = append(es.tempFiles, tempFile)
    
    file, err := os.Create(tempFile)
    if err != nil {
        return err
    }
    defer file.Close()
    
    writer := bufio.NewWriter(file)
    for _, line := range chunk {
        fmt.Fprintln(writer, line)
    }
    
    return writer.Flush()
}

// 第二階段：K 路歸併
type MergeItem struct {
    value    string
    fileIdx  int
    scanner  *bufio.Scanner
}

type MergeHeap []*MergeItem

func (h MergeHeap) Len() int           { return len(h) }
func (h MergeHeap) Less(i, j int) bool { return h[i].value < h[j].value }
func (h MergeHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *MergeHeap) Push(x interface{}) {
    *h = append(*h, x.(*MergeItem))
}
func (h *MergeHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}

func (es *ExternalSorter) mergeFiles() error {
    // 打開所有臨時檔案
    files := make([]*os.File, len(es.tempFiles))
    scanners := make([]*bufio.Scanner, len(es.tempFiles))
    
    for i, tempFile := range es.tempFiles {
        file, err := os.Open(tempFile)
        if err != nil {
            return err
        }
        defer file.Close()
        
        files[i] = file
        scanners[i] = bufio.NewScanner(file)
    }
    
    // 初始化最小堆
    h := &MergeHeap{}
    heap.Init(h)
    
    for i, scanner := range scanners {
        if scanner.Scan() {
            heap.Push(h, &MergeItem{
                value:   scanner.Text(),
                fileIdx: i,
                scanner: scanner,
            })
        }
    }
    
    // 創建輸出檔案
    outFile, err := os.Create(es.outputFile)
    if err != nil {
        return err
    }
    defer outFile.Close()
    
    writer := bufio.NewWriter(outFile)
    defer writer.Flush()
    
    // K 路歸併
    for h.Len() > 0 {
        item := heap.Pop(h).(*MergeItem)
        fmt.Fprintln(writer, item.value)
        
        // 從該檔案讀取下一行
        if item.scanner.Scan() {
            heap.Push(h, &MergeItem{
                value:   item.scanner.Text(),
                fileIdx: item.fileIdx,
                scanner: item.scanner,
            })
        }
    }
    
    return nil
}

func (es *ExternalSorter) Sort() error {
    // 第一階段：分割並排序
    if err := es.splitAndSort(); err != nil {
        return err
    }
    
    // 第二階段：歸併
    if err := es.mergeFiles(); err != nil {
        return err
    }
    
    // 清理臨時檔案
    for _, tempFile := range es.tempFiles {
        os.Remove(tempFile)
    }
    
    return nil
}
```

**複雜度分析**：
- **時間複雜度**：O(N log N)
  - 分割排序：O(N log M)（M 是 chunk 大小）
  - K 路歸併：O(N log K)（K 是檔案數）
- **空間複雜度**：O(M + K)
  - M：記憶體中的 chunk 大小
  - K：堆的大小（檔案數）
- **磁碟 I/O**：O(N * passes)（passes 通常是 2-3）

**優化策略**：
1. **增大 chunk 大小**：減少檔案數量
2. **多路歸併數量**：平衡 I/O 和記憶體使用
3. **緩衝區優化**：使用更大的讀寫緩衝區
4. **並行處理**：多個 chunk 並行排序

### 2. 分散式排序

#### 2.1 MapReduce 排序

**核心思想**：
1. **Map 階段**：將資料分區並在本地排序
2. **Shuffle 階段**：將相同範圍的資料發送到同一個 Reducer
3. **Reduce 階段**：歸併已排序的資料

**範圍分區（Range Partitioning）**：

```go
// 分散式排序示例
type DistributedSorter struct {
    numPartitions int
    ranges        []int // 分區邊界
}

// 第一階段：Map - 分區並排序
func (ds *DistributedSorter) mapPhase(data []int) [][]int {
    partitions := make([][]int, ds.numPartitions)
    
    for _, num := range data {
        // 確定數據屬於哪個分區
        partitionIdx := ds.findPartition(num)
        partitions[partitionIdx] = append(partitions[partitionIdx], num)
    }
    
    // 每個分區內部排序
    for i := range partitions {
        sort.Ints(partitions[i])
    }
    
    return partitions
}

func (ds *DistributedSorter) findPartition(num int) int {
    for i, boundary := range ds.ranges {
        if num < boundary {
            return i
        }
    }
    return ds.numPartitions - 1
}

// 第二階段：Reduce - 歸併
func (ds *DistributedSorter) reducePhase(partitions [][]int) []int {
    result := []int{}
    
    for _, partition := range partitions {
        // 每個分區已經排序，直接合併
        result = append(result, partition...)
    }
    
    return result
}

// 採樣確定分區邊界
func (ds *DistributedSorter) sampleRanges(data []int) {
    sampleSize := 1000
    samples := make([]int, 0, sampleSize)
    
    // 隨機採樣
    for i := 0; i < sampleSize && i < len(data); i++ {
        idx := i * len(data) / sampleSize
        samples = append(samples, data[idx])
    }
    
    sort.Ints(samples)
    
    // 確定分區邊界
    ds.ranges = make([]int, ds.numPartitions-1)
    for i := 0; i < ds.numPartitions-1; i++ {
        idx := (i + 1) * len(samples) / ds.numPartitions
        ds.ranges[i] = samples[idx]
    }
}
```

**關鍵優化**：
1. **均衡分區**：使用採樣確定分區邊界，避免數據傾斜
2. **本地排序**：使用快排或歸併排序
3. **網路優化**：減少資料傳輸量（combiners）
4. **並行度**：合理設置分區數量

#### 2.2 TeraSort 算法

**背景**：Hadoop TeraSort 是業界標準的大規模排序基準測試

**核心策略**：
1. **採樣階段**：對資料進行採樣，確定分區邊界
2. **Map 階段**：將資料分區（Range Partitioning）
3. **Shuffle 階段**：將相同分區的資料發送到同一個 Reducer
4. **Reduce 階段**：每個 Reducer 對本地資料排序並輸出

**關鍵技術**：
- **TotalOrderPartitioner**：全局有序分區器
- **採樣器（Sampler）**：確保負載均衡
- **二次排序（Secondary Sort）**：處理複合鍵排序

### 3. Top K 問題

#### 3.1 堆排序法（Heap）

**場景**：找出 N 個元素中最大/最小的 K 個

**核心思想**：
- 維護一個大小為 K 的堆
- 遍歷所有元素，動態維護堆

**實現**：

```go
import "container/heap"

// Top K 最大值（使用最小堆）
func topKMax(nums []int, k int) []int {
    if k >= len(nums) {
        return nums
    }
    
    h := &IntHeap{}
    heap.Init(h)
    
    for _, num := range nums {
        if h.Len() < k {
            heap.Push(h, num)
        } else if num > (*h)[0] {
            heap.Pop(h)
            heap.Push(h, num)
        }
    }
    
    result := make([]int, k)
    for i := k - 1; i >= 0; i-- {
        result[i] = heap.Pop(h).(int)
    }
    
    return result
}

type IntHeap []int
func (h IntHeap) Len() int           { return len(h) }
func (h IntHeap) Less(i, j int) bool { return h[i] < h[j] } // 最小堆
func (h IntHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *IntHeap) Push(x interface{}) { *h = append(*h, x.(int)) }
func (h *IntHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}
```

**時間複雜度**：O(N log K)
**空間複雜度**：O(K)

**適用場景**：
- 資料流中的 Top K
- 記憶體有限的場景
- K 遠小於 N

#### 3.2 快速選擇（QuickSelect）

**核心思想**：類似快速排序，但只遞迴處理包含第 K 個元素的分區

**實現**：

```go
// Top K 最大值（使用快速選擇）
func topKQuickSelect(nums []int, k int) []int {
    if k >= len(nums) {
        return nums
    }
    
    // 尋找第 K 大的元素（等同於索引 k-1）
    targetIdx := len(nums) - k
    quickSelect(nums, 0, len(nums)-1, targetIdx)
    
    // 返回索引 targetIdx 之後的所有元素
    return nums[targetIdx:]
}

func quickSelect(nums []int, left, right, k int) {
    if left >= right {
        return
    }
    
    pivotIdx := partition(nums, left, right)
    
    if pivotIdx == k {
        return
    } else if pivotIdx < k {
        quickSelect(nums, pivotIdx+1, right, k)
    } else {
        quickSelect(nums, left, pivotIdx-1, k)
    }
}

func partition(nums []int, left, right int) int {
    pivot := nums[right]
    i := left
    
    for j := left; j < right; j++ {
        if nums[j] < pivot {
            nums[i], nums[j] = nums[j], nums[i]
            i++
        }
    }
    
    nums[i], nums[right] = nums[right], nums[i]
    return i
}
```

**時間複雜度**：
- 平均：O(N)
- 最壞：O(N²)（可用隨機化優化）

**空間複雜度**：O(1)（原地排序）

**適用場景**：
- 一次性查詢
- 可以修改原陣列
- K 接近 N/2 時效率高

#### 3.3 桶排序法

**適用場景**：資料範圍已知且較小

```go
// 桶排序 + Top K
func topKBucket(nums []int, k int, maxVal int) []int {
    buckets := make([]int, maxVal+1)
    
    // 統計頻率
    for _, num := range nums {
        buckets[num]++
    }
    
    result := []int{}
    
    // 從大到小取 K 個
    for i := maxVal; i >= 0 && len(result) < k; i-- {
        count := buckets[i]
        for count > 0 && len(result) < k {
            result = append(result, i)
            count--
        }
    }
    
    return result
}
```

**時間複雜度**：O(N + M)（M 是資料範圍）
**適用場景**：範圍小、資料量大

### 4. 實際應用場景

#### 4.1 日誌檔案排序與分析

**場景**：對 TB 級日誌檔案按時間排序

**解決方案**：
```go
// 日誌條目
type LogEntry struct {
    Timestamp int64
    Message   string
}

// 外部排序日誌檔案
func sortLogs(inputFile, outputFile string) error {
    sorter := &ExternalSorter{
        inputFile:  inputFile,
        outputFile: outputFile,
        chunkSize:  1000000, // 100萬條日誌一個 chunk
        tempDir:    "/tmp/logsort",
    }
    
    return sorter.Sort()
}
```

**優化**：
- 使用時間戳作為排序鍵
- 壓縮臨時檔案
- 並行處理多個 chunk

#### 4.2 資料庫排序操作

**MySQL 排序**：
```sql
-- 大表排序（會使用外部排序）
SELECT * FROM large_table ORDER BY create_time DESC LIMIT 1000;

-- 優化策略
-- 1. 使用索引避免排序
CREATE INDEX idx_create_time ON large_table(create_time);

-- 2. 覆蓋索引減少回表
CREATE INDEX idx_covering ON large_table(create_time, id, name);
```

**排序緩衝區調優**：
```sql
-- 查看排序緩衝區大小
SHOW VARIABLES LIKE 'sort_buffer_size';

-- 調大排序緩衝區（減少外部排序）
SET sort_buffer_size = 8388608; -- 8MB
```

#### 4.3 排行榜系統

**Redis Sorted Set（跳躍表實現）**：

```go
import "github.com/go-redis/redis/v8"

// 更新玩家分數
func updateScore(rdb *redis.Client, playerID string, score float64) error {
    ctx := context.Background()
    return rdb.ZAdd(ctx, "leaderboard", &redis.Z{
        Score:  score,
        Member: playerID,
    }).Err()
}

// 獲取 Top K
func getTopK(rdb *redis.Client, k int) ([]string, error) {
    ctx := context.Background()
    return rdb.ZRevRange(ctx, "leaderboard", 0, int64(k-1)).Result()
}

// 獲取玩家排名
func getRank(rdb *redis.Client, playerID string) (int64, error) {
    ctx := context.Background()
    return rdb.ZRevRank(ctx, "leaderboard", playerID).Result()
}
```

**時間複雜度**：
- 更新分數：O(log N)
- 獲取 Top K：O(log N + K)
- 獲取排名：O(log N)

#### 4.4 搜尋引擎結果排序

**倒排索引 + 排序**：

```go
// 搜尋結果
type SearchResult struct {
    DocID int
    Score float64
}

// Top K 搜尋結果
func searchTopK(query string, k int) []SearchResult {
    // 從倒排索引獲取候選文檔
    candidates := getFromInvertedIndex(query)
    
    // 計算相關性分數（TF-IDF, BM25）
    for i := range candidates {
        candidates[i].Score = calculateScore(candidates[i].DocID, query)
    }
    
    // 使用堆獲取 Top K
    return heapTopK(candidates, k)
}

func heapTopK(results []SearchResult, k int) []SearchResult {
    h := &ResultHeap{}
    heap.Init(h)
    
    for _, result := range results {
        if h.Len() < k {
            heap.Push(h, result)
        } else if result.Score > (*h)[0].Score {
            heap.Pop(h)
            heap.Push(h, result)
        }
    }
    
    topK := make([]SearchResult, h.Len())
    for i := len(topK) - 1; i >= 0; i-- {
        topK[i] = heap.Pop(h).(SearchResult)
    }
    
    return topK
}

type ResultHeap []SearchResult
func (h ResultHeap) Len() int           { return len(h) }
func (h ResultHeap) Less(i, j int) bool { return h[i].Score < h[j].Score }
func (h ResultHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *ResultHeap) Push(x interface{}) { *h = append(*h, x.(SearchResult)) }
func (h *ResultHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}
```

### 5. 穩定性要求

**穩定排序的應用**：

```go
// 多欄位排序（需要穩定性）
type Employee struct {
    Name       string
    Department string
    Salary     int
}

// 先按部門排序，再按薪資排序（需要穩定排序）
func sortEmployees(employees []Employee) {
    // 第一次排序：按薪資（穩定排序）
    sort.SliceStable(employees, func(i, j int) bool {
        return employees[i].Salary > employees[j].Salary
    })
    
    // 第二次排序：按部門（穩定排序）
    sort.SliceStable(employees, func(i, j int) bool {
        return employees[i].Department < employees[j].Department
    })
    
    // 結果：同部門內按薪資降序
}
```

**穩定排序算法**：
- **歸併排序**（Merge Sort）：穩定，O(N log N)
- **插入排序**（Insertion Sort）：穩定，O(N²)
- **計數排序**（Counting Sort）：穩定，O(N + K)

**不穩定排序算法**：
- **快速排序**（Quick Sort）：不穩定
- **堆排序**（Heap Sort）：不穩定
- **選擇排序**（Selection Sort）：不穩定

### 6. LeetCode 經典題目

| 題號 | 題目 | 難度 | 應用場景 |
|------|------|------|---------|
| 215 | Kth Largest Element in an Array | Medium | Top K 問題 |
| 347 | Top K Frequent Elements | Medium | 頻率 Top K |
| 23 | Merge K Sorted Lists | Hard | 多路歸併 |
| 148 | Sort List | Medium | 鏈結串列排序 |
| 912 | Sort an Array | Medium | 排序算法實現 |

### 7. 面試常見問題

**Q1：如何排序 100GB 的資料，記憶體只有 4GB？**

A：使用外部排序（多路歸併排序）：
1. 將 100GB 分割成 25 個 4GB 的檔案
2. 每個檔案在記憶體中排序後寫回磁碟
3. 使用 K 路歸併（K=25）將 25 個有序檔案合併

**Q2：如何在 10 億個數字中找到最大的 100 個？**

A：使用最小堆（大小為 100）：
- 時間複雜度：O(N log K)，K=100
- 空間複雜度：O(K)
- 適合資料流場景

**Q3：分散式系統如何保證排序結果全局有序？**

A：
1. 使用範圍分區（Range Partitioning）
2. 採樣確定分區邊界，確保負載均衡
3. 每個分區獨立排序
4. 分區之間有序，分區內部有序 → 全局有序

**Q4：什麼時候需要穩定排序？**

A：
- 多欄位排序（先按欄位 A 排，再按欄位 B 排）
- 保持原有相對順序（如時間戳相同時保持原順序）
- 增量排序（已排序資料中插入新資料）

## 總結

實際排序問題遠比 LeetCode 複雜，需要考慮資料規模、記憶體限制、分散式環境等因素：

**核心要點**：
1. **外部排序**：多路歸併，處理超大資料（O(N log N)）
2. **分散式排序**：MapReduce、範圍分區、採樣
3. **Top K 問題**：堆（O(N log K)）、快速選擇（O(N)）
4. **穩定性**：多欄位排序、增量排序需要穩定排序

**實際應用**：
- **日誌處理**：外部排序、時間排序
- **資料庫**：索引排序、ORDER BY 優化
- **排行榜**：Redis ZSet、堆
- **搜尋引擎**：Top K 相關性排序

**選擇策略**：
- N 遠大於記憶體 → **外部排序**
- 分散式環境 → **MapReduce 排序**
- Top K（K << N）→ **堆排序**
- 需要穩定性 → **歸併排序**
- 範圍已知 → **桶排序/計數排序**

**優化方向**：
- 減少磁碟 I/O（緩衝區、壓縮）
- 負載均衡（採樣、動態分區）
- 並行化（多執行緒、分散式）
- 使用索引避免排序

作為資深後端工程師，你需要能夠根據資料規模、記憶體限制、分散式環境等因素選擇合適的排序策略，並理解其在資料庫、搜尋引擎、日誌處理等實際系統中的應用。
