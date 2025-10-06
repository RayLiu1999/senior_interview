# 布隆過濾器（Bloom Filter）- Redis 快取穿透解決方案

- **難度**: 6
- **重要程度**: 5
- **標籤**: `Bloom Filter`, `Redis`, `Cache Penetration`, `Distributed System`

## 問題詳述

布隆過濾器（Bloom Filter）是一種**空間效率極高的概率型數據結構**，用於判斷元素**是否存在於集合中**。在後端系統中，主要用於解決 **Redis 快取穿透**問題和**大規模去重**場景。

## 核心理論與詳解

### 1. 布隆過濾器的基本原理

#### 1.1 核心思想

**傳統方案**：
- 用 HashMap 存儲所有已存在的 Key
- 空間複雜度：O(n)，n 是元素數量
- 問題：1 億個 URL，每個 100 字節 → 需要 **10GB 內存**

**布隆過濾器**：
- 用**位陣列**和**多個哈希函數**
- 空間複雜度：O(m)，m 是位陣列大小，m << n
- 優勢：1 億個 URL → 只需 **120MB 內存**（誤判率 1%）

**權衡**：
- ✅ 空間極小（省 100 倍內存）
- ✅ 查詢快（O(k)，k 是哈希函數數量）
- ❌ **有誤判**（False Positive）
- ❌ **無法刪除**

---

#### 1.2 工作原理

**結構**：
```
位陣列（Bit Array）：
[0 0 0 0 0 0 0 0 0 0 0 0]
 0 1 2 3 4 5 6 7 8 9 10 11

哈希函數：
hash1(x), hash2(x), hash3(x)
```

**插入元素 "apple"**：
```
hash1("apple") = 2  → 位陣列[2] = 1
hash2("apple") = 5  → 位陣列[5] = 1
hash3("apple") = 9  → 位陣列[9] = 1

結果：[0 0 1 0 0 1 0 0 0 1 0 0]
```

**查詢元素 "apple"**：
```
計算 hash1, hash2, hash3
檢查位陣列[2], [5], [9]
都是 1 → **可能存在**（不確定）
```

**查詢元素 "banana"**：
```
hash1("banana") = 3  → 位陣列[3] = 0
發現有一個是 0 → **一定不存在**（確定）
```

---

#### 1.3 誤判率（False Positive Rate）

**什麼是誤判？**
- 元素實際不存在，但布隆過濾器判斷為存在

**誤判產生的原因**：
```
插入 "apple"：位 [2, 5, 9] = 1
插入 "orange"：位 [2, 7, 11] = 1

查詢 "banana"：
hash1("banana") = 2  ✓ (被 apple 設置)
hash2("banana") = 5  ✓ (被 apple 設置)
hash3("banana") = 9  ✓ (被 apple 設置)

誤判為存在！
```

**誤判率公式**：
```
p = (1 - e^(-kn/m))^k

其中：
- m：位陣列大小
- n：插入元素數量
- k：哈希函數數量
- p：誤判率
```

**最優哈希函數數量**：
```
k_opt = (m/n) * ln(2)
```

**實際案例**：
- n = 1 億
- m = 12 億（120MB）
- k = 8
- **誤判率 ≈ 1%**

---

### 2. 布隆過濾器的實現

#### 2.1 Go 語言實現

```go
package main

import (
    "hash"
    "hash/fnv"
    "math"
)

type BloomFilter struct {
    bitArray []bool
    m        uint     // 位陣列大小
    k        uint     // 哈希函數數量
    n        uint     // 已插入元素數量
}

// 建立布隆過濾器
func NewBloomFilter(expectedElements uint, falsePositiveRate float64) *BloomFilter {
    // 計算最優 m 和 k
    m := optimalM(expectedElements, falsePositiveRate)
    k := optimalK(m, expectedElements)
    
    return &BloomFilter{
        bitArray: make([]bool, m),
        m:        m,
        k:        k,
        n:        0,
    }
}

// 計算最優位陣列大小
func optimalM(n uint, p float64) uint {
    return uint(math.Ceil(-1 * float64(n) * math.Log(p) / math.Pow(math.Log(2), 2)))
}

// 計算最優哈希函數數量
func optimalK(m, n uint) uint {
    return uint(math.Ceil(float64(m) / float64(n) * math.Log(2)))
}

// 生成 k 個哈希值
func (bf *BloomFilter) hash(data []byte) []uint {
    h := fnv.New64a()
    h.Write(data)
    hash1 := h.Sum64()
    
    h.Reset()
    h.Write(append(data, byte(1)))
    hash2 := h.Sum64()
    
    // 使用雙哈希技術生成 k 個哈希值
    hashes := make([]uint, bf.k)
    for i := uint(0); i < bf.k; i++ {
        hashes[i] = uint((hash1 + uint64(i)*hash2) % uint64(bf.m))
    }
    
    return hashes
}

// 添加元素
func (bf *BloomFilter) Add(data string) {
    hashes := bf.hash([]byte(data))
    
    for _, h := range hashes {
        bf.bitArray[h] = true
    }
    
    bf.n++
}

// 查詢元素是否存在
func (bf *BloomFilter) Contains(data string) bool {
    hashes := bf.hash([]byte(data))
    
    for _, h := range hashes {
        if !bf.bitArray[h] {
            return false  // 一定不存在
        }
    }
    
    return true  // 可能存在（可能誤判）
}

// 計算當前誤判率
func (bf *BloomFilter) FalsePositiveRate() float64 {
    return math.Pow(1-math.Exp(-float64(bf.k*bf.n)/float64(bf.m)), float64(bf.k))
}

// 使用範例
func main() {
    // 期望存儲 100 萬個元素，誤判率 1%
    bf := NewBloomFilter(1000000, 0.01)
    
    // 添加元素
    bf.Add("user:12345")
    bf.Add("user:67890")
    
    // 查詢
    exists := bf.Contains("user:12345")  // true
    notExists := bf.Contains("user:99999")  // false（或 1% 機率誤判為 true）
}
```

---

#### 2.2 Redis 布隆過濾器

**Redis 4.0+ 提供 RedisBloom 模組**：

```bash
# 安裝
docker run -p 6379:6379 --name redis-bloom redislabs/rebloom:latest

# 使用
redis-cli

# 建立布隆過濾器（自動計算最優參數）
BF.RESERVE userBloom 0.01 1000000
# 誤判率 0.01，預期元素 100 萬

# 添加元素
BF.ADD userBloom "user:12345"

# 批量添加
BF.MADD userBloom "user:1" "user:2" "user:3"

# 檢查是否存在
BF.EXISTS userBloom "user:12345"
# 返回 1（存在）或 0（不存在）

# 批量檢查
BF.MEXISTS userBloom "user:1" "user:999"
```

**Go 客戶端使用**：
```go
package main

import (
    "context"
    "github.com/go-redis/redis/v8"
)

func main() {
    ctx := context.Background()
    rdb := redis.NewClient(&redis.Options{
        Addr: "localhost:6379",
    })
    
    // 添加元素
    rdb.Do(ctx, "BF.ADD", "userBloom", "user:12345")
    
    // 檢查元素
    result, _ := rdb.Do(ctx, "BF.EXISTS", "userBloom", "user:12345").Int()
    if result == 1 {
        println("元素可能存在")
    } else {
        println("元素一定不存在")
    }
}
```

---

### 3. 解決 Redis 快取穿透

#### 3.1 什麼是快取穿透？

**問題場景**：
```
Client → Redis → MySQL

查詢 user:99999（不存在的 ID）
1. 查 Redis → 未命中
2. 查 MySQL → 未命中
3. 大量這種請求 → MySQL 壓力暴增
```

**攻擊場景**：
- 惡意用戶故意查詢大量不存在的 ID
- 繞過快取，直接打到資料庫
- 導致資料庫崩潰

---

#### 3.2 解決方案對比

| 方案 | 優點 | 缺點 | 適用場景 |
|------|------|------|---------|
| **快取空值** | 簡單 | 浪費空間、TTL 難設置 | 查詢集合小 |
| **布隆過濾器** | 省空間、高效 | 有誤判、無法刪除 | 查詢集合大 |
| **參數校驗** | 零成本 | 無法應對所有場景 | 輔助方案 |

---

#### 3.3 布隆過濾器方案實現

**架構**：
```
1. 啟動時，將所有有效 ID 載入布隆過濾器
2. 查詢時先檢查布隆過濾器
3. 不存在 → 直接返回，不查資料庫
4. 可能存在 → 繼續查詢快取和資料庫
```

**完整實現**：
```go
package cache

import (
    "context"
    "encoding/json"
    "github.com/go-redis/redis/v8"
    "gorm.io/gorm"
)

type UserCache struct {
    rdb *redis.Client
    db  *gorm.DB
    ctx context.Context
}

// 初始化：載入所有用戶 ID 到布隆過濾器
func (c *UserCache) InitBloomFilter() error {
    var userIDs []int64
    
    // 從資料庫查詢所有 ID
    if err := c.db.Model(&User{}).Pluck("id", &userIDs).Error; err != nil {
        return err
    }
    
    // 建立布隆過濾器（1% 誤判率）
    c.rdb.Do(c.ctx, "BF.RESERVE", "user:bloom", 0.01, len(userIDs))
    
    // 批量添加（每次最多 1000 個）
    for i := 0; i < len(userIDs); i += 1000 {
        end := i + 1000
        if end > len(userIDs) {
            end = len(userIDs)
        }
        
        args := []interface{}{"user:bloom"}
        for _, id := range userIDs[i:end] {
            args = append(args, id)
        }
        
        c.rdb.Do(c.ctx, "BF.MADD", args...)
    }
    
    return nil
}

// 查詢用戶
func (c *UserCache) GetUser(userID int64) (*User, error) {
    // 1. 布隆過濾器檢查
    exists, _ := c.rdb.Do(c.ctx, "BF.EXISTS", "user:bloom", userID).Int()
    if exists == 0 {
        return nil, ErrUserNotFound  // 一定不存在，直接返回
    }
    
    // 2. 查詢 Redis 快取
    key := fmt.Sprintf("user:%d", userID)
    cached, err := c.rdb.Get(c.ctx, key).Result()
    if err == nil {
        var user User
        json.Unmarshal([]byte(cached), &user)
        return &user, nil
    }
    
    // 3. 查詢資料庫
    var user User
    if err := c.db.First(&user, userID).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            // 可能是誤判，快取空值防止穿透
            c.rdb.Set(c.ctx, key, "null", 5*time.Minute)
        }
        return nil, err
    }
    
    // 4. 寫入快取
    data, _ := json.Marshal(user)
    c.rdb.Set(c.ctx, key, data, 1*time.Hour)
    
    return &user, nil
}

// 新增用戶時，同步更新布隆過濾器
func (c *UserCache) CreateUser(user *User) error {
    // 1. 寫入資料庫
    if err := c.db.Create(user).Error; err != nil {
        return err
    }
    
    // 2. 更新布隆過濾器
    c.rdb.Do(c.ctx, "BF.ADD", "user:bloom", user.ID)
    
    // 3. 寫入快取
    data, _ := json.Marshal(user)
    key := fmt.Sprintf("user:%d", user.ID)
    c.rdb.Set(c.ctx, key, data, 1*time.Hour)
    
    return nil
}
```

---

### 4. 其他實際應用

#### 4.1 URL 去重（爬蟲系統）

**場景**：爬蟲需要記錄已訪問的 URL

```go
type URLDeduplicator struct {
    bloom *BloomFilter
}

func (d *URLDeduplicator) IsVisited(url string) bool {
    return d.bloom.Contains(url)
}

func (d *URLDeduplicator) MarkVisited(url string) {
    d.bloom.Add(url)
}

// 使用
func crawl(url string, dedup *URLDeduplicator) {
    if dedup.IsVisited(url) {
        return  // 已訪問，跳過
    }
    
    // 抓取頁面
    page := fetchPage(url)
    
    // 標記為已訪問
    dedup.MarkVisited(url)
    
    // 處理頁面中的鏈接
    for _, link := range page.Links {
        crawl(link, dedup)
    }
}
```

#### 4.2 郵件/垃圾內容過濾

**場景**：識別垃圾郵件地址

```go
type SpamFilter struct {
    blacklist *BloomFilter
}

func (sf *SpamFilter) IsSpam(email string) bool {
    return sf.blacklist.Contains(email)
}

// 初始化時載入黑名單
func NewSpamFilter(blacklist []string) *SpamFilter {
    bf := NewBloomFilter(uint(len(blacklist)), 0.001)  // 0.1% 誤判率
    
    for _, email := range blacklist {
        bf.Add(email)
    }
    
    return &SpamFilter{blacklist: bf}
}
```

#### 4.3 分散式系統去重

**場景**：分散式日誌去重

```go
// 每個節點維護本地布隆過濾器
type LogDeduplicator struct {
    localBloom *BloomFilter
    redisBloom *redis.Client
}

func (ld *LogDeduplicator) IsDuplicate(logID string) bool {
    // 先查本地（快）
    if ld.localBloom.Contains(logID) {
        return true
    }
    
    // 再查 Redis（慢）
    exists, _ := ld.redisBloom.Do(ctx, "BF.EXISTS", "log:bloom", logID).Int()
    if exists == 1 {
        // 同步到本地
        ld.localBloom.Add(logID)
        return true
    }
    
    return false
}
```

---

## 面試技巧與常見陷阱

### 1. 布隆過濾器的局限性

**問題 1：無法刪除元素**

**原因**：
- 刪除一個位可能影響其他元素
- 例如：刪除 "apple" 的位 [2, 5, 9]
- 但 "orange" 也可能使用位 2

**解決方案**：
- **Counting Bloom Filter**：用計數器代替位
- 每次插入 +1，刪除 -1
- 缺點：空間增加 4 倍

**問題 2：誤判率隨元素增加而上升**

**解決方案**：
- 定期重建布隆過濾器
- 或使用可擴展布隆過濾器（Scalable Bloom Filter）

### 2. 參數選擇

**案例**：
```
需求：存儲 1 億個 URL，誤判率 1%

計算：
m = -n*ln(p) / (ln2)² 
  = -10⁸ * ln(0.01) / (ln2)²
  ≈ 958MB

k = (m/n) * ln2
  ≈ 7 個哈希函數
```

**建議**：
- **誤判率**：通常 0.01 ~ 0.001
- **哈希函數數量**：7~10 個
- **空間**：每個元素 10~15 位

### 3. 常見錯誤

**錯誤 1：用於需要精確結果的場景**
```go
// ❌ 錯誤：用布隆過濾器判斷用戶是否已付費
if bloom.Contains(userID) {
    // 可能誤判，導致未付費用戶可以使用服務
}

// ✅ 正確：布隆過濾器只用於快速排除
if !bloom.Contains(userID) {
    return ErrNotPaid  // 一定未付費
}
// 可能付費，需要進一步查詢資料庫確認
```

**錯誤 2：忘記維護布隆過濾器**
```go
// ❌ 資料庫新增了數據，但布隆過濾器未更新
db.Create(&user)
// 布隆過濾器判斷用戶不存在，導致快取穿透

// ✅ 同步更新
db.Create(&user)
bloom.Add(user.ID)
```

---

## 複雜度分析

| 操作 | 時間複雜度 | 空間複雜度 | 說明 |
|------|-----------|-----------|------|
| 插入 | O(k) | O(1) | k 是哈希函數數量 |
| 查詢 | O(k) | O(1) | - |
| 刪除 | ❌ | - | 標準布隆過濾器不支持 |
| 空間 | - | O(m) | m 是位陣列大小 |

**與其他數據結構對比**：
- HashSet：O(1) 查詢，O(n) 空間
- 布隆過濾器：O(k) 查詢，O(m) 空間（m << n）

---

## 延伸閱讀

- **Redis 官方文檔**：[RedisBloom](https://redis.io/docs/stack/bloom/)
- **經典論文**：Burton H. Bloom (1970) - "Space/time trade-offs in hash coding"
- **進階主題**：Counting Bloom Filter、Cuckoo Filter、Quotient Filter
