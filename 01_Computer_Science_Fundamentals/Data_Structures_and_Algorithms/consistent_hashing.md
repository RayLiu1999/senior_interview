# 一致性雜湊在分散式系統中的應用

- **難度**: 7
- **重要程度**: 5
- **標籤**: `一致性雜湊`, `負載均衡`, `分散式快取`, `面試高頻`

## 問題詳述

在分散式系統中，如何將資料均勻分佈到多個節點，並在節點增減時最小化資料遷移？一致性雜湊是解決這個問題的經典算法，廣泛應用於 **分散式快取 (Memcached、Redis Cluster)**、**負載均衡**、**分散式儲存**等場景。

## 核心理論與詳解

### 1. 問題背景

#### 傳統雜湊方法的問題

**簡單取模**:
```go
// 傳統做法
serverIndex := hash(key) % serverCount
```

**問題場景**:
```
初始狀態: 3 個伺服器
hash(key1) % 3 = 0 → Server 0
hash(key2) % 3 = 1 → Server 1
hash(key3) % 3 = 2 → Server 2

新增 1 個伺服器 (變成 4 個):
hash(key1) % 4 = ?  // 可能不再是 Server 0
hash(key2) % 4 = ?  // 可能不再是 Server 1
hash(key3) % 4 = ?  // 可能不再是 Server 2

結果: 大量資料需要重新分佈！
```

**影響**:
- ❌ **大量資料遷移**: 幾乎所有資料的位置都會改變
- ❌ **快取失效**: 大量快取未命中，資料庫壓力激增
- ❌ **系統不穩定**: 擴縮容期間服務不可用

### 2. 一致性雜湊原理

#### 核心思想

將**雜湊空間**組織成一個**環形**結構 (0 到 2^32-1)，節點和資料都映射到環上，資料分配給順時針方向遇到的第一個節點。

#### 雜湊環

```
                     0/2^32
                       |
              Server C |
                    \  |  /
                     \ | /
                      \|/
       Server A -------+------- Server B
                      /|\
                     / | \
                    /  |  \
                       |
                    key1, key2, ...
```

#### 資料分配規則

```
步驟:
1. 將伺服器節點映射到環上
   hash(ServerA) → 位置 A
   hash(ServerB) → 位置 B
   hash(ServerC) → 位置 C

2. 將資料 key 映射到環上
   hash(key1) → 位置 K1

3. 從 K1 順時針查找，遇到的第一個伺服器節點就是目標節點
   key1 → ServerB (順時針方向)
```

### 3. Go 實現

```go
package main

import (
"crypto/md5"
"fmt"
"sort"
"strconv"
)

// 一致性雜湊
type ConsistentHash struct {
hashFunc   func(data []byte) uint32  // 雜湊函數
replicas   int                       // 虛擬節點數量
keys       []uint32                  // 雜湊環 (已排序)
hashMap    map[uint32]string         // 虛擬節點 → 真實節點
}

// 建構函數
func NewConsistentHash(replicas int, fn func(data []byte) uint32) *ConsistentHash {
ch := &ConsistentHash{
replicas: replicas,
hashFunc: fn,
hashMap:  make(map[uint32]string),
}
if ch.hashFunc == nil {
ch.hashFunc = defaultHash
}
return ch
}

// 預設雜湊函數 (MD5)
func defaultHash(data []byte) uint32 {
hash := md5.Sum(data)
return uint32(hash[0])<<24 | uint32(hash[1])<<16 | uint32(hash[2])<<8 | uint32(hash[3])
}

// 添加節點
func (ch *ConsistentHash) Add(nodes ...string) {
for _, node := range nodes {
// 為每個真實節點建立多個虛擬節點
for i := 0; i < ch.replicas; i++ {
// 虛擬節點名稱: node + index
virtualNode := node + "#" + strconv.Itoa(i)
hash := ch.hashFunc([]byte(virtualNode))

ch.keys = append(ch.keys, hash)
ch.hashMap[hash] = node
}
}
// 排序雜湊環
sort.Slice(ch.keys, func(i, j int) bool {
return ch.keys[i] < ch.keys[j]
})
}

// 移除節點
func (ch *ConsistentHash) Remove(node string) {
for i := 0; i < ch.replicas; i++ {
virtualNode := node + "#" + strconv.Itoa(i)
hash := ch.hashFunc([]byte(virtualNode))

// 從雜湊環中移除
idx := sort.Search(len(ch.keys), func(i int) bool {
return ch.keys[i] >= hash
})
if idx < len(ch.keys) && ch.keys[idx] == hash {
ch.keys = append(ch.keys[:idx], ch.keys[idx+1:]...)
}
delete(ch.hashMap, hash)
}
}

// 獲取資料應該存放的節點
func (ch *ConsistentHash) Get(key string) string {
if len(ch.keys) == 0 {
return ""
}

// 計算 key 的雜湊值
hash := ch.hashFunc([]byte(key))

// 二分查找：找到第一個 >= hash 的虛擬節點
idx := sort.Search(len(ch.keys), func(i int) bool {
return ch.keys[i] >= hash
})

// 如果超過最後一個節點，回到第一個 (環形)
if idx == len(ch.keys) {
idx = 0
}

// 返回對應的真實節點
return ch.hashMap[ch.keys[idx]]
}

// 測試
func main() {
ch := NewConsistentHash(3, nil)

// 添加節點
ch.Add("ServerA", "ServerB", "ServerC")

// 測試資料分佈
keys := []string{"user:1001", "user:1002", "user:1003", "user:1004", "user:1005"}

fmt.Println("=== 初始分佈 ===")
distribution := make(map[string]int)
for _, key := range keys {
server := ch.Get(key)
distribution[server]++
fmt.Printf("%s → %s\n", key, server)
}
fmt.Println("\n節點負載:", distribution)

// 新增節點
fmt.Println("\n=== 新增 ServerD ===")
ch.Add("ServerD")

distribution = make(map[string]int)
for _, key := range keys {
server := ch.Get(key)
distribution[server]++
fmt.Printf("%s → %s\n", key, server)
}
fmt.Println("\n節點負載:", distribution)
}
```

### 4. 虛擬節點 (Virtual Nodes)

#### 為什麼需要虛擬節點？

**問題**: 真實節點數量少時，資料分佈不均勻

```
只有 3 個真實節點:
         0
         |
    ServerC
         |
ServerA--+--ServerB
         |

資料可能大量集中在某個節點
```

**解決**: 每個真實節點對應多個虛擬節點

```
每個節點 100 個虛擬節點:
         0
         |
    A#1 C#1 A#2
      B#1 C#2
    A#3 B#2 ...
         |
   (更均勻分佈)
```

#### 虛擬節點數量選擇

| 虛擬節點數 | 分佈均勻度 | 記憶體開銷 | 推薦場景 |
|-----------|----------|-----------|---------|
| 10-50 | 中等 | 低 | 節點數量多 (100+) |
| 100-200 | 良好 | 中等 | **推薦** |
| 500+ | 優秀 | 高 | 節點數量少 (< 10) |

### 5. 優缺點分析

#### 優點

- ✅ **最小化資料遷移**: 平均只有 K/N 的資料需要遷移 (K=資料總量, N=節點數量)
- ✅ **水平擴展**: 方便新增或移除節點
- ✅ **高可用**: 單個節點失效只影響部分資料

#### 缺點

- ❌ **複雜度**: 實現比簡單取模複雜
- ❌ **記憶體開銷**: 需要維護雜湊環
- ❌ **仍非完美均勻**: 即使有虛擬節點，也無法做到絕對均勻

### 6. 實際應用場景

#### Memcached 客戶端

```go
// Memcached 客戶端使用一致性雜湊分佈資料
type MemcacheClient struct {
ch *ConsistentHash
}

func (m *MemcacheClient) Set(key string, value []byte) error {
server := m.ch.Get(key)
return setToServer(server, key, value)
}

func (m *MemcacheClient) Get(key string) ([]byte, error) {
server := m.ch.Get(key)
return getFromServer(server, key)
}
```

#### Redis Cluster

Redis Cluster 使用**槽 (slot)** 的方式，是一致性雜湊的變體：

```
16384 個槽 (0-16383)
槽分配給不同節點:
  Node A: slot 0-5460
  Node B: slot 5461-10922
  Node C: slot 10923-16383

資料分配:
  CRC16(key) % 16384 → slot
  slot → node
```

#### 分散式儲存 (Cassandra)

Cassandra 使用一致性雜湊進行資料分片。

#### 負載均衡

Nginx 的 `hash` 模組支援一致性雜湊：

```nginx
upstream backend {
    hash $request_uri consistent;
    server backend1.example.com;
    server backend2.example.com;
    server backend3.example.com;
}
```

### 7. 擴展與優化

#### 加權一致性雜湊

不同節點性能不同時，給高性能節點分配更多虛擬節點：

```go
func (ch *ConsistentHash) AddWithWeight(node string, weight int) {
replicas := ch.replicas * weight
for i := 0; i < replicas; i++ {
virtualNode := node + "#" + strconv.Itoa(i)
hash := ch.hashFunc([]byte(virtualNode))
ch.keys = append(ch.keys, hash)
ch.hashMap[hash] = node
}
sort.Slice(ch.keys, func(i, j int) bool {
return ch.keys[i] < ch.keys[j]
})
}
```

#### 有界負載一致性雜湊 (Bounded Load Consistent Hashing)

Google 提出的改進，避免單個節點過載：

```
每個節點最多承載: 平均負載 × (1 + ε)

如果節點超載，順時針查找下一個未超載的節點
```

### 8. 與其他方案對比

| 方案 | 擴縮容影響 | 實現複雜度 | 均勻性 | 適用場景 |
|-----|----------|-----------|--------|---------|
| **取模** | 極大 (幾乎全部遷移) | 簡單 | 完美 | 節點數量固定 |
| **一致性雜湊** | 小 (K/N) | 中等 | 良好 | 頻繁擴縮容 |
| **範圍分片** | 中等 | 簡單 | 不保證 | 有序資料 |
| **槽分配** | 小 (手動遷移槽) | 中等 | 良好 | Redis Cluster |

### 9. 面試要點

#### 常見問題

**Q1: 為什麼要用雜湊環而非陣列？**

環形結構天然處理「順時針查找」的邏輯，且沒有邊界問題。

**Q2: 虛擬節點如何命名？**

常見做法: `節點名稱 + "#" + 索引`，如 `ServerA#0`, `ServerA#1`

**Q3: 如何確保一致性雜湊的均勻性？**

1. 增加虛擬節點數量 (100-200 個)
2. 使用均勻分佈的雜湊函數 (MD5, MurmurHash)

**Q4: 一致性雜湊能保證絕對一致嗎？**

不能。只是最小化資料遷移，並非零遷移。

**Q5: 實際系統中如何處理資料遷移？**

- 漸進式遷移 (逐步遷移而非一次性)
- 雙寫策略 (新舊節點都寫，讀優先新節點)
- 使用版本標記 (區分新舊資料)

## 總結

一致性雜湊是分散式系統的關鍵技術：

1. **核心思想**: 雜湊環 + 虛擬節點
2. **核心優勢**: 最小化擴縮容時的資料遷移
3. **實際應用**: Memcached、Redis、負載均衡
4. **關鍵優化**: 虛擬節點提升均勻性

作為資深後端工程師，你需要：
- 深入理解一致性雜湊的原理和實現
- 能夠手寫實現一致性雜湊
- 理解虛擬節點的作用和配置
- 掌握實際系統 (Redis Cluster) 的實現差異
- 能夠根據業務需求選擇合適的分片策略
