# 雜湊表原理與實現

- **難度**: 6
- **重要程度**: 5
- **標籤**: `雜湊函數`, `碰撞解決`, `負載因子`, `擴容機制`

## 問題詳述

雜湊表（Hash Table）是實現鍵值對映射的高效資料結構，平均時間複雜度 O(1)。理解雜湊函數設計、碰撞解決、擴容機制是後端開發的基本功，在快取、資料庫、分散式系統中廣泛應用。

## 核心理論與詳解

### 1. 雜湊表基礎

#### 核心原理

```
雜湊表 = 雜湊函數 + 陣列

key → hash(key) → index = hash % array_size → array[index]
```

#### 關鍵組成

1. **雜湊函數 (Hash Function)**: 將鍵轉換為陣列索引
2. **陣列 (Buckets)**: 儲存實際的鍵值對
3. **碰撞解決 (Collision Resolution)**: 處理不同鍵雜湊到相同位置

#### Go 語言 map 底層結構

```go
type hmap struct {
    count     int           // 元素個數
    B         uint8         // bucket 數量 = 2^B
    buckets   unsafe.Pointer // bucket 陣列
    oldbuckets unsafe.Pointer // 擴容時的舊 bucket
}

type bmap struct {  // 每個 bucket
    tophash [8]uint8      // 快速查找的雜湊高 8 位
    keys    [8]keytype    // 鍵陣列
    values  [8]valuetype  // 值陣列
    overflow *bmap        // 溢位 bucket（鏈表法）
}
```

### 2. 雜湊函數設計

#### 理想雜湊函數特性

1. **確定性**: 相同輸入產生相同輸出
2. **均勻分佈**: 減少碰撞
3. **效率高**: 計算速度快
4. **雪崩效應**: 輸入微小變化導致輸出巨大差異

#### 常見雜湊演算法

**簡單取模法**
```go
func hash(key int, size int) int {
    return key % size
}
```

**乘法雜湊法**
```go
func hash(key int) int {
    const A = 0.6180339887  // (√5 - 1) / 2 黃金比例
    return int(size * ((key * A) - int(key * A)))
}
```

**字串雜湊**
```go
// DJB2 演算法
func hashString(s string) uint32 {
    hash := uint32(5381)
    for _, c := range s {
        hash = ((hash << 5) + hash) + uint32(c)  // hash * 33 + c
    }
    return hash
}

// FNV-1a 演算法（Go map 使用）
func fnv1a(data []byte) uint64 {
    hash := uint64(14695981039346656037)
    for _, b := range data {
        hash ^= uint64(b)
        hash *= 1099511628211
    }
    return hash
}
```

### 3. 碰撞解決策略

#### 方法 1: 鏈表法 (Chaining)

**原理**: 每個 bucket 維護一個鏈表，碰撞的元素加入鏈表

```
Bucket 0: [key1, val1] → [key9, val9] → null
Bucket 1: [key2, val2] → null
Bucket 2: [key3, val3] → [key7, val7] → [key15, val15] → null
```

**Go 實現**
```go
type HashTable struct {
    buckets []*Node
    size    int
}

type Node struct {
    key   string
    value interface{}
    next  *Node
}

func (ht *HashTable) Put(key string, value interface{}) {
    index := hash(key) % len(ht.buckets)
    node := ht.buckets[index]
    
    // 遍歷鏈表
    for node != nil {
        if node.key == key {
            node.value = value  // 更新
            return
        }
        if node.next == nil {
            break
        }
        node = node.next
    }
    
    // 插入新節點
    newNode := &Node{key: key, value: value}
    if node == nil {
        ht.buckets[index] = newNode
    } else {
        node.next = newNode
    }
    ht.size++
}

func (ht *HashTable) Get(key string) (interface{}, bool) {
    index := hash(key) % len(ht.buckets)
    node := ht.buckets[index]
    
    for node != nil {
        if node.key == key {
            return node.value, true
        }
        node = node.next
    }
    return nil, false
}
```

**優點**:
- 實現簡單
- 刪除操作容易

**缺點**:
- 鏈表過長時效能退化
- 額外指標開銷

#### 方法 2: 開放定址法 (Open Addressing)

**原理**: 碰撞時在陣列中尋找下一個空位

**線性探測 (Linear Probing)**
```
碰撞時: index, index+1, index+2, ...
```

**二次探測 (Quadratic Probing)**
```
碰撞時: index, index+1², index+2², index+3², ...
```

**雙重雜湊 (Double Hashing)**
```
碰撞時: index, index+hash2(key), index+2*hash2(key), ...
```

**Go 實現（線性探測）**
```go
type OpenHashTable struct {
    keys   []string
    values []interface{}
    size   int
}

func (ht *OpenHashTable) Put(key string, value interface{}) {
    index := hash(key) % len(ht.keys)
    
    // 線性探測
    for ht.keys[index] != "" && ht.keys[index] != key {
        index = (index + 1) % len(ht.keys)
    }
    
    if ht.keys[index] == "" {
        ht.size++
    }
    ht.keys[index] = key
    ht.values[index] = value
}
```

**優點**:
- 節省記憶體（無指標開銷）
- 快取友善（連續記憶體）

**缺點**:
- 刪除操作複雜（需要標記刪除）
- 容易產生聚集 (Clustering)

### 4. 負載因子與擴容

#### 負載因子 (Load Factor)

```
負載因子 = 元素數量 / bucket 數量
```

#### 不同語言的負載因子閾值

| 語言/實現 | 負載因子閾值 | 擴容倍數 |
|---------|------------|---------|
| **Go map** | 6.5 | 2x |
| **Java HashMap** | 0.75 | 2x |
| **Python dict** | 0.67 | 2x |
| **Redis Dict** | 1.0 | 2x |

#### Go map 擴容機制

**觸發條件**:
1. 負載因子 > 6.5
2. 溢位 bucket 過多

**擴容過程**:
```
1. 分配新的 bucket 陣列（2 倍大小）
2. 漸進式遷移（不是一次性）
3. 每次操作時遷移 2 個舊 bucket
4. 查詢時同時查舊桶和新桶
```

**為什麼是漸進式**？
- 避免一次性遷移導致長時間阻塞
- 分攤到多次操作中

### 5. 時間與空間複雜度

#### 時間複雜度

| 操作 | 平均 | 最壞 | 說明 |
|-----|------|------|------|
| **插入** | O(1) | O(n) | 大量碰撞時退化 |
| **查找** | O(1) | O(n) | 鏈表法：遍歷鏈表 |
| **刪除** | O(1) | O(n) | 同查找 |

#### 空間複雜度

- **鏈表法**: O(n + m)，n 是元素數，m 是 bucket 數
- **開放定址法**: O(m)，m 必須 > n

### 6. 實際應用場景

#### Go 標準庫 map

```go
// 基本使用
m := make(map[string]int)
m["key"] = 100
val, exists := m["key"]
delete(m, "key")

// 預分配容量
m := make(map[string]int, 1000)  // 避免擴容

// 非執行緒安全
// 需要併發使用時用 sync.Map 或加鎖
var mu sync.RWMutex
mu.Lock()
m["key"] = value
mu.Unlock()
```

#### 快取實現

```go
type Cache struct {
    mu    sync.RWMutex
    items map[string]*Item
}

type Item struct {
    Value      interface{}
    Expiration int64
}

func (c *Cache) Set(key string, value interface{}, duration time.Duration) {
    c.mu.Lock()
    defer c.mu.Unlock()
    
    c.items[key] = &Item{
        Value:      value,
        Expiration: time.Now().Add(duration).UnixNano(),
    }
}

func (c *Cache) Get(key string) (interface{}, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()
    
    item, exists := c.items[key]
    if !exists {
        return nil, false
    }
    
    if time.Now().UnixNano() > item.Expiration {
        return nil, false
    }
    
    return item.Value, true
}
```

#### 去重

```go
// 陣列去重
func removeDuplicates(nums []int) []int {
    seen := make(map[int]bool)
    result := []int{}
    
    for _, num := range nums {
        if !seen[num] {
            seen[num] = true
            result = append(result, num)
        }
    }
    return result
}
```

#### 分組統計

```go
// 統計單字出現次數
func wordCount(text string) map[string]int {
    counts := make(map[string]int)
    words := strings.Fields(text)
    
    for _, word := range words {
        counts[word]++
    }
    return counts
}
```

### 7. 雜湊表 vs 其他資料結構

| 特性 | 雜湊表 | 平衡樹 (紅黑樹) | 陣列 |
|-----|-------|---------------|------|
| **查找** | O(1) 平均 | O(log n) | O(n) 線性查找 |
| **插入** | O(1) 平均 | O(log n) | O(n) 需移動 |
| **刪除** | O(1) 平均 | O(log n) | O(n) 需移動 |
| **有序性** | ❌ 無序 | ✅ 有序 | ✅ 有序（排序後） |
| **範圍查詢** | ❌ 不支援 | ✅ O(log n + k) | ✅ O(n) |
| **記憶體** | 較高（負載因子）| 較低 | 最低 |

### 8. 效能優化

#### 預分配容量

```go
// ❌ 不好：多次擴容
m := make(map[string]int)
for i := 0; i < 10000; i++ {
    m[fmt.Sprintf("key%d", i)] = i
}

// ✅ 好：預分配
m := make(map[string]int, 10000)
for i := 0; i < 10000; i++ {
    m[fmt.Sprintf("key%d", i)] = i
}
```

#### 選擇合適的鍵類型

```go
// ✅ 好：用整數當鍵（雜湊快）
m := make(map[int]string)

// ⚠️ 較慢：字串當鍵（需計算雜湊）
m := make(map[string]string)

// ❌ 不允許：切片不能當鍵（不可比較）
// m := make(map[[]int]string)  // 編譯錯誤
```

#### 減少雜湊碰撞

```go
// 選擇好的雜湊函數
// 使用質數作為 bucket 大小
// 避免可預測的鍵模式
```

## 總結

### 核心要點

1. **雜湊表核心**: 雜湊函數 + 陣列 + 碰撞解決
2. **平均 O(1)**: 但最壞情況 O(n)（大量碰撞）
3. **碰撞解決**: 鏈表法（Go、Java）、開放定址法（Python）
4. **負載因子**: 控制擴容時機，平衡空間與時間
5. **非執行緒安全**: 併發使用需要加鎖或 sync.Map

### 作為資深後端工程師，你需要

- ✅ 理解雜湊函數的設計原則
- ✅ 掌握鏈表法和開放定址法的優缺點
- ✅ 知道負載因子和擴容機制
- ✅ 能夠手寫雜湊表的基本實現
- ✅ 理解 Go map 的底層結構和漸進式擴容
- ✅ 在快取、去重、分組等場景中高效使用雜湊表
