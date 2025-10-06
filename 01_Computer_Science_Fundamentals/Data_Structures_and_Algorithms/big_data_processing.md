# 海量資料處理

- **難度**: 8
- **重要程度**: 4
- **標籤**: `bitmap`, `外部排序`, `分治`, `MapReduce`

## 問題詳述

海量資料處理是指對超出單機記憶體容量的大規模數據進行處理。這類問題在面試中用於考察候選人對分散式思維、算法優化、系統設計的綜合能力。

## 核心理論與詳解

### 1. 海量數據處理核心思路

**三大原則**:
1. **分而治之**: 將大問題分解為小問題
2. **空間換時間**: 使用高效的數據結構
3. **近似算法**: 在可接受的誤差範圍內提高效率

**常用技術**:
- **Bitmap**: 位圖索引,節省空間
- **Hash分片**: 將數據分散到多個分片
- **外部排序**: 磁盤排序算法
- **Bloom Filter**: 快速去重和查找
- **HyperLogLog**: 基數統計
- **Count-Min Sketch**: 頻率統計
- **MapReduce**: 分散式計算框架

### 2. Bitmap (位圖)

**原理**: 用1個bit表示一個數字是否存在。

**優勢**: 
- 空間效率極高: 10億個數字只需 ~119MB
- 查詢速度快: O(1)

#### 基本實現

```go
type Bitmap struct {
    bits []uint64
    size int
}

func NewBitmap(size int) *Bitmap {
    return &Bitmap{
        bits: make([]uint64, (size + 63) / 64),
        size: size,
    }
}

func (b *Bitmap) Set(num int) {
    if num >= b.size {
        return
    }
    index := num / 64
    bit := num % 64
    b.bits[index] |= 1 << bit
}

func (b *Bitmap) Get(num int) bool {
    if num >= b.size {
        return false
    }
    index := num / 64
    bit := num % 64
    return b.bits[index] & (1 << bit) != 0
}

func (b *Bitmap) Clear(num int) {
    if num >= b.size {
        return
    }
    index := num / 64
    bit := num % 64
    b.bits[index] &= ^(1 << bit)
}

func (b *Bitmap) Count() int {
    count := 0
    for _, word := range b.bits {
        count += popCount(word)
    }
    return count
}

func popCount(x uint64) int {
    count := 0
    for x > 0 {
        x &= x - 1
        count++
    }
    return count
}
```

#### 應用: 大整數排序

**問題**: 對10億個32位無符號整數排序,記憶體限制100MB。

```go
func sortLargeIntegers(filename string) {
    const maxNum = 1 << 32
    bitmap := NewBitmap(maxNum)
    
    // 讀取文件,設置bitmap
    file, _ := os.Open(filename)
    scanner := bufio.NewScanner(file)
    for scanner.Scan() {
        num, _ := strconv.Atoi(scanner.Text())
        bitmap.Set(num)
    }
    file.Close()
    
    // 輸出排序結果
    output, _ := os.Create("sorted.txt")
    writer := bufio.NewWriter(output)
    for i := 0; i < maxNum; i++ {
        if bitmap.Get(i) {
            fmt.Fprintln(writer, i)
        }
    }
    writer.Flush()
    output.Close()
}
```

### 3. Hash分片

**原理**: 使用雜湊函數將數據分散到多個文件/機器。

#### 應用: 找出重複的URL

**問題**: 100億個URL,記憶體限制4GB,找出重複的URL。

```go
func findDuplicateURLs(inputFile string) {
    const numShards = 1000
    
    // 階段一: Hash分片
    shardFiles := make([]*os.File, numShards)
    for i := 0; i < numShards; i++ {
        shardFiles[i], _ = os.Create(fmt.Sprintf("shard_%d.txt", i))
    }
    
    file, _ := os.Open(inputFile)
    scanner := bufio.NewScanner(file)
    for scanner.Scan() {
        url := scanner.Text()
        hash := hashFunc(url) % numShards
        fmt.Fprintln(shardFiles[hash], url)
    }
    file.Close()
    for _, f := range shardFiles {
        f.Close()
    }
    
    // 階段二: 處理每個分片
    for i := 0; i < numShards; i++ {
        processShard(i)
    }
}

func processShard(shardID int) {
    urlCount := make(map[string]int)
    
    file, _ := os.Open(fmt.Sprintf("shard_%d.txt", shardID))
    scanner := bufio.NewScanner(file)
    for scanner.Scan() {
        url := scanner.Text()
        urlCount[url]++
        if urlCount[url] == 2 {
            fmt.Println("Duplicate:", url)
        }
    }
    file.Close()
}

func hashFunc(s string) int {
    h := 0
    for _, c := range s {
        h = h * 31 + int(c)
    }
    if h < 0 {
        h = -h
    }
    return h
}
```

### 4. 外部排序 (External Sort)

**原理**: 將大文件分塊排序,再進行多路歸併。

**步驟**:
1. 將大文件分成多個小文件
2. 對每個小文件排序(內存排序)
3. 使用K路歸併合併所有小文件

#### 實現

```go
func externalSort(inputFile string, outputFile string, memoryLimit int) {
    // 階段一: 分塊排序
    chunkFiles := splitAndSort(inputFile, memoryLimit)
    
    // 階段二: K路歸併
    mergeChunks(chunkFiles, outputFile)
}

func splitAndSort(inputFile string, memoryLimit int) []string {
    file, _ := os.Open(inputFile)
    defer file.Close()
    
    chunkFiles := []string{}
    chunkID := 0
    buffer := []int{}
    
    scanner := bufio.NewScanner(file)
    for scanner.Scan() {
        num, _ := strconv.Atoi(scanner.Text())
        buffer = append(buffer, num)
        
        // 達到記憶體限制,排序並寫入文件
        if len(buffer) * 4 >= memoryLimit {
            sort.Ints(buffer)
            chunkFile := fmt.Sprintf("chunk_%d.txt", chunkID)
            writeChunk(chunkFile, buffer)
            chunkFiles = append(chunkFiles, chunkFile)
            buffer = []int{}
            chunkID++
        }
    }
    
    // 處理最後一個chunk
    if len(buffer) > 0 {
        sort.Ints(buffer)
        chunkFile := fmt.Sprintf("chunk_%d.txt", chunkID)
        writeChunk(chunkFile, buffer)
        chunkFiles = append(chunkFiles, chunkFile)
    }
    
    return chunkFiles
}

func mergeChunks(chunkFiles []string, outputFile string) {
    // 使用最小堆進行K路歸併
    type Item struct {
        value  int
        fileID int
    }
    
    pq := &PriorityQueue{}
    heap.Init(pq)
    
    // 打開所有chunk文件
    scanners := make([]*bufio.Scanner, len(chunkFiles))
    for i, chunkFile := range chunkFiles {
        file, _ := os.Open(chunkFile)
        defer file.Close()
        scanners[i] = bufio.NewScanner(file)
        
        // 將每個文件的第一個元素加入堆
        if scanners[i].Scan() {
            num, _ := strconv.Atoi(scanners[i].Text())
            heap.Push(pq, &Item{value: num, fileID: i})
        }
    }
    
    // 輸出文件
    output, _ := os.Create(outputFile)
    defer output.Close()
    writer := bufio.NewWriter(output)
    defer writer.Flush()
    
    // K路歸併
    for pq.Len() > 0 {
        item := heap.Pop(pq).(*Item)
        fmt.Fprintln(writer, item.value)
        
        // 從同一文件讀取下一個數字
        if scanners[item.fileID].Scan() {
            num, _ := strconv.Atoi(scanners[item.fileID].Text())
            heap.Push(pq, &Item{value: num, fileID: item.fileID})
        }
    }
}

func writeChunk(filename string, nums []int) {
    file, _ := os.Create(filename)
    defer file.Close()
    writer := bufio.NewWriter(file)
    defer writer.Flush()
    
    for _, num := range nums {
        fmt.Fprintln(writer, num)
    }
}
```

### 5. Top K 問題

**問題**: 從10億個數字中找出最大的K個數。

**解法一: 最小堆**

```go
func topKHeap(filename string, k int) []int {
    pq := &IntHeap{}
    heap.Init(pq)
    
    file, _ := os.Open(filename)
    defer file.Close()
    scanner := bufio.NewScanner(file)
    
    for scanner.Scan() {
        num, _ := strconv.Atoi(scanner.Text())
        
        if pq.Len() < k {
            heap.Push(pq, num)
        } else if num > (*pq)[0] {
            heap.Pop(pq)
            heap.Push(pq, num)
        }
    }
    
    result := make([]int, pq.Len())
    for i := len(result) - 1; i >= 0; i-- {
        result[i] = heap.Pop(pq).(int)
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

**解法二: 快速選擇 + 分片**

```go
func topKPartition(filename string, k int) []int {
    // 使用Hash分片
    const numShards = 100
    shardFiles := hashPartition(filename, numShards)
    
    // 對每個分片找Top K
    allCandidates := []int{}
    for _, shardFile := range shardFiles {
        candidates := topKHeap(shardFile, k)
        allCandidates = append(allCandidates, candidates...)
    }
    
    // 從所有候選中找Top K
    return topKQuickSelect(allCandidates, k)
}

func topKQuickSelect(nums []int, k int) []int {
    left, right := 0, len(nums) - 1
    targetIndex := len(nums) - k
    
    for {
        pivotIndex := partition(nums, left, right)
        if pivotIndex == targetIndex {
            return nums[targetIndex:]
        } else if pivotIndex < targetIndex {
            left = pivotIndex + 1
        } else {
            right = pivotIndex - 1
        }
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

### 6. 分散式處理 - MapReduce

**原理**: 
- **Map**: 將數據轉換為鍵值對
- **Shuffle**: 按key分組
- **Reduce**: 對每組數據進行聚合

#### 應用: 詞頻統計

```go
// Map階段
func mapFunc(document string) []KeyValue {
    words := strings.Fields(document)
    kvs := []KeyValue{}
    
    for _, word := range words {
        kvs = append(kvs, KeyValue{Key: word, Value: "1"})
    }
    
    return kvs
}

// Reduce階段
func reduceFunc(key string, values []string) string {
    count := len(values)
    return strconv.Itoa(count)
}

// MapReduce框架
func mapReduce(inputFiles []string, mapFunc MapFunc, reduceFunc ReduceFunc, nReduce int) {
    // Map階段
    intermediate := make([][]KeyValue, nReduce)
    
    for _, filename := range inputFiles {
        content, _ := ioutil.ReadFile(filename)
        kvs := mapFunc(string(content))
        
        for _, kv := range kvs {
            partition := ihash(kv.Key) % nReduce
            intermediate[partition] = append(intermediate[partition], kv)
        }
    }
    
    // Reduce階段
    for i := 0; i < nReduce; i++ {
        // 按key分組
        grouped := make(map[string][]string)
        for _, kv := range intermediate[i] {
            grouped[kv.Key] = append(grouped[kv.Key], kv.Value)
        }
        
        // 執行reduce
        output, _ := os.Create(fmt.Sprintf("mr-out-%d", i))
        for key, values := range grouped {
            result := reduceFunc(key, values)
            fmt.Fprintf(output, "%s %s\n", key, result)
        }
        output.Close()
    }
}

type KeyValue struct {
    Key   string
    Value string
}

type MapFunc func(string) []KeyValue
type ReduceFunc func(string, []string) string

func ihash(key string) int {
    h := fnv.New32a()
    h.Write([]byte(key))
    return int(h.Sum32() & 0x7fffffff)
}
```

## 實際應用場景

### 1. 日誌分析系統

處理每天TB級別的日誌數據。

```go
// 統計各API的調用次數
func analyzeAPILogs(logFiles []string) map[string]int {
    // Map: 提取API路徑
    mapFunc := func(log string) []KeyValue {
        // 解析日誌: GET /api/users HTTP/1.1 200
        parts := strings.Fields(log)
        if len(parts) >= 2 {
            return []KeyValue{{Key: parts[1], Value: "1"}}
        }
        return []KeyValue{}
    }
    
    // Reduce: 計數
    reduceFunc := func(key string, values []string) string {
        return strconv.Itoa(len(values))
    }
    
    mapReduce(logFiles, mapFunc, reduceFunc, 10)
    return nil
}
```

### 2. 推薦系統 - 協同過濾

計算用戶相似度。

```go
// 使用MinHash計算Jaccard相似度
type MinHash struct {
    numHashes int
    seeds     []int
}

func (mh *MinHash) Signature(items []string) []int {
    signature := make([]int, mh.numHashes)
    for i := range signature {
        signature[i] = math.MaxInt32
    }
    
    for _, item := range items {
        for i := 0; i < mh.numHashes; i++ {
            hash := mh.hash(item, mh.seeds[i])
            if hash < signature[i] {
                signature[i] = hash
            }
        }
    }
    
    return signature
}

func (mh *MinHash) Similarity(sig1, sig2 []int) float64 {
    matches := 0
    for i := 0; i < len(sig1); i++ {
        if sig1[i] == sig2[i] {
            matches++
        }
    }
    return float64(matches) / float64(len(sig1))
}
```

## 總結

**海量數據處理核心要點**:
1. **Bitmap**: 空間效率極高,適合整數去重和排序
2. **Hash分片**: 分而治之的基礎,將大問題化為小問題
3. **外部排序**: 磁盤數據排序的標準方法
4. **Top K**: 使用堆或快速選擇,O(n log k) 或 O(n)
5. **MapReduce**: 分散式處理的經典範式

**面試高頻題目**:
- 10億個整數排序
- 找出重複的URL/IP
- Top K 熱門詞
- 兩個大文件的交集/並集
- 海量數據去重

**實際應用**:
- 日誌分析(ELK、Splunk)
- 搜索引擎(倒排索引)
- 推薦系統(協同過濾)
- 廣告系統(用戶畫像)

海量數據處理需要結合算法、數據結構和系統設計能力,是資深後端工程師的核心技能。
