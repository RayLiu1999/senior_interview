# LRU 快取實現

- **難度**: 6
- **重要程度**: 5
- **標籤**: `LRU`, `快取`, `雙向鏈結串列`, `HashMap`, `面試高頻`

## 問題詳述

設計並實現一個 LRU (Least Recently Used, 最近最少使用) 快取機制，支援 O(1) 時間複雜度的 get 和 put 操作。這是 **LeetCode 146 題**，也是後端面試的**超高頻題目**。

## 核心理論與詳解

### 1. LRU 快取原理

**LRU (Least Recently Used)** 是一種常用的快取淘汰策略，當快取滿時，優先淘汰**最久未使用**的資料。

#### 核心思想

```
快取容量: 3

操作序列:
put(1, A) → [1]
put(2, B) → [2, 1]
put(3, C) → [3, 2, 1]
get(2)    → [2, 3, 1]  // 2 被訪問，移到最前
put(4, D) → [4, 2, 3]  // 快取滿，淘汰最久未使用的 1

最新使用 ← → 最久未使用
```

#### 操作需求

1. **get(key)**
   - 如果 key 存在，返回值並將其標記為最近使用
   - 如果 key 不存在，返回 -1
   - **時間複雜度**: O(1)

2. **put(key, value)**
   - 如果 key 已存在，更新值並標記為最近使用
   - 如果 key 不存在，插入鍵值對
   - 如果快取已滿，淘汰最久未使用的鍵值對
   - **時間複雜度**: O(1)

### 2. 資料結構設計

要實現 O(1) 的 get 和 put，需要組合兩種資料結構：

#### HashMap + 雙向鏈結串列

```
HashMap (key → node)
┌──────────────────┐
│ 1 → Node(1, A)  │
│ 2 → Node(2, B)  │
│ 3 → Node(3, C)  │
└──────────────────┘
         ↓
雙向鏈結串列 (維護訪問順序)
┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐
│ Head │←→│Node 3│←→│Node 2│←→│Node 1│←→│ Tail │
└──────┘   └──────┘   └──────┘   └──────┘
最新使用 ←────────────────────────→ 最久未使用
```

**為什麼選擇雙向鏈結串列？**

- ✅ **O(1) 插入**: 在頭部插入新節點
- ✅ **O(1) 刪除**: 刪除任意節點 (需要前驅和後繼指針)
- ✅ **O(1) 移動**: 將中間節點移到頭部

**為什麼需要 HashMap？**

- ✅ **O(1) 查找**: 根據 key 快速找到對應的節點

### 3. 完整 Go 實現

```go
package main

// 雙向鏈結串列節點
type Node struct {
    key, value int
    prev, next *Node
}

// LRU 快取
type LRUCache struct {
    capacity int
    cache    map[int]*Node // key → node
    head     *Node         // 虛擬頭節點 (最新使用)
    tail     *Node         // 虛擬尾節點 (最久未使用)
}

// 建構函數
func Constructor(capacity int) LRUCache {
    lru := LRUCache{
        capacity: capacity,
        cache:    make(map[int]*Node),
        head:     &Node{},  // 虛擬頭節點
        tail:     &Node{},  // 虛擬尾節點
    }
    lru.head.next = lru.tail
    lru.tail.prev = lru.head
    return lru
}

// Get 操作 - O(1)
func (lru *LRUCache) Get(key int) int {
    node, exists := lru.cache[key]
    if !exists {
        return -1
    }
    
    // 將節點移到頭部 (標記為最近使用)
    lru.moveToHead(node)
    return node.value
}

// Put 操作 - O(1)
func (lru *LRUCache) Put(key int, value int) {
    node, exists := lru.cache[key]
    
    if exists {
        // key 已存在，更新值並移到頭部
        node.value = value
        lru.moveToHead(node)
    } else {
        // key 不存在，建立新節點
        newNode := &Node{key: key, value: value}
        lru.cache[key] = newNode
        lru.addToHead(newNode)
        
        // 檢查是否超出容量
        if len(lru.cache) > lru.capacity {
            // 移除尾部節點 (最久未使用)
            removed := lru.removeTail()
            delete(lru.cache, removed.key)
        }
    }
}

// 輔助方法: 將節點添加到頭部
func (lru *LRUCache) addToHead(node *Node) {
    node.prev = lru.head
    node.next = lru.head.next
    lru.head.next.prev = node
    lru.head.next = node
}

// 輔助方法: 移除節點
func (lru *LRUCache) removeNode(node *Node) {
    node.prev.next = node.next
    node.next.prev = node.prev
}

// 輔助方法: 將節點移到頭部
func (lru *LRUCache) moveToHead(node *Node) {
    lru.removeNode(node)
    lru.addToHead(node)
}

// 輔助方法: 移除尾部節點
func (lru *LRUCache) removeTail() *Node {
    node := lru.tail.prev
    lru.removeNode(node)
    return node
}

// 測試
func main() {
    lru := Constructor(2)
    
    lru.Put(1, 1)           // 快取: {1=1}
    lru.Put(2, 2)           // 快取: {1=1, 2=2}
    println(lru.Get(1))     // 返回 1，快取: {2=2, 1=1}
    lru.Put(3, 3)           // 淘汰 key 2，快取: {1=1, 3=3}
    println(lru.Get(2))     // 返回 -1 (未找到)
    lru.Put(4, 4)           // 淘汰 key 1，快取: {3=3, 4=4}
    println(lru.Get(1))     // 返回 -1
    println(lru.Get(3))     // 返回 3
    println(lru.Get(4))     // 返回 4
}
```

### 4. 操作圖解

#### 初始狀態

```
capacity = 2

HashMap: {}
鏈結串列: Head ←→ Tail
```

#### put(1, 1)

```
HashMap: {1 → Node(1,1)}
鏈結串列: Head ←→ Node(1,1) ←→ Tail
```

#### put(2, 2)

```
HashMap: {1 → Node(1,1), 2 → Node(2,2)}
鏈結串列: Head ←→ Node(2,2) ←→ Node(1,1) ←→ Tail
                最新                最久
```

#### get(1)

```
// 訪問 key=1，移到頭部

HashMap: {1 → Node(1,1), 2 → Node(2,2)}
鏈結串列: Head ←→ Node(1,1) ←→ Node(2,2) ←→ Tail
                最新                最久
```

#### put(3, 3)

```
// 快取已滿，淘汰最久未使用的 key=2

HashMap: {1 → Node(1,1), 3 → Node(3,3)}
鏈結串列: Head ←→ Node(3,3) ←→ Node(1,1) ←→ Tail
                最新                最久
```

### 5. 時間與空間複雜度

| 操作 | 時間複雜度 | 說明 |
|-----|----------|------|
| **Get** | O(1) | HashMap 查找 + 鏈結串列移動 |
| **Put** | O(1) | HashMap 插入/更新 + 鏈結串列操作 |

**空間複雜度**: O(capacity) - HashMap 和鏈結串列都存儲 capacity 個節點

### 6. 變體與擴展

#### LRU-K 算法

只有訪問次數 ≥ K 時才加入快取，避免偶然訪問的資料佔用快取。

```
LRU-2:
訪問 1 次: 放入歷史佇列
訪問 2 次: 放入快取佇列
```

#### LFU (Least Frequently Used)

淘汰**訪問頻率最低**的資料。

```go
type LFUCache struct {
    capacity  int
    minFreq   int
    cache     map[int]*Node         // key → node
    freqMap   map[int]*DoubleList   // freq → list of nodes
}
```

#### FIFO (First In First Out)

最簡單的淘汰策略，淘汰最早加入的資料。

```
只需要單向佇列:
Head → Node1 → Node2 → Node3 → Tail
     (最早)              (最新)
```

### 7. 實際應用場景

#### Redis 記憶體淘汰策略

Redis 支援多種淘汰策略：

- **volatile-lru**: 對設定過期時間的 key 使用 LRU
- **allkeys-lru**: 對所有 key 使用 LRU
- **volatile-lfu**: 對設定過期時間的 key 使用 LFU
- **allkeys-lfu**: 對所有 key 使用 LFU
- **volatile-random**: 隨機淘汰設定過期時間的 key
- **allkeys-random**: 隨機淘汰任意 key

**Redis 的 LRU 實現** (近似 LRU):
```
Redis 使用採樣 (sampling) 而非精確 LRU:
1. 隨機採樣 N 個 key (預設 5 個)
2. 淘汰其中最久未訪問的
3. 節省記憶體，但不是完全精確
```

#### 瀏覽器快取

瀏覽器使用類似 LRU 的策略管理快取的網頁資源。

#### 作業系統頁面置換

作業系統使用 LRU 決定淘汰哪個記憶體頁面。

#### CDN 快取

CDN 節點使用 LRU 管理快取的靜態資源。

### 8. 面試要點

#### 常見追問

**Q1: 如果要求執行緒安全怎麼辦？**

```go
import "sync"

type LRUCache struct {
    mu       sync.Mutex
    capacity int
    cache    map[int]*Node
    head     *Node
    tail     *Node
}

func (lru *LRUCache) Get(key int) int {
    lru.mu.Lock()
    defer lru.mu.Unlock()
    
    // ... 原邏輯
}

func (lru *LRUCache) Put(key int, value int) {
    lru.mu.Lock()
    defer lru.mu.Unlock()
    
    // ... 原邏輯
}
```

**Q2: 如果 value 是大物件怎麼辦？**

```go
// 使用指針避免大物件拷貝
type Node struct {
    key   int
    value *LargeObject  // 指針
    prev, next *Node
}
```

**Q3: 如何實現過期時間？**

```go
type Node struct {
    key       int
    value     int
    expireAt  time.Time  // 過期時間
    prev, next *Node
}

func (lru *LRUCache) Get(key int) int {
    node, exists := lru.cache[key]
    if !exists || time.Now().After(node.expireAt) {
        return -1  // 已過期
    }
    
    lru.moveToHead(node)
    return node.value
}
```

**Q4: 如何實現持久化？**

```go
// 定期將快取內容寫入磁碟
func (lru *LRUCache) Save(filename string) error {
    lru.mu.Lock()
    defer lru.mu.Unlock()
    
    file, _ := os.Create(filename)
    defer file.Close()
    
    encoder := json.NewEncoder(file)
    return encoder.Encode(lru.cache)
}
```

### 9. 實務優化

#### 分片 LRU (Sharded LRU)

減少鎖競爭：

```go
type ShardedLRU struct {
    shards []*LRUCache
    count  int
}

func (s *ShardedLRU) getShard(key int) *LRUCache {
    idx := key % s.count
    return s.shards[idx]
}

func (s *ShardedLRU) Get(key int) int {
    return s.getShard(key).Get(key)
}
```

#### 預熱 (Warm-up)

系統啟動時預先載入熱點資料：

```go
func (lru *LRUCache) Warmup(hotKeys []int) {
    for _, key := range hotKeys {
        value := loadFromDB(key)
        lru.Put(key, value)
    }
}
```

#### 統計與監控

```go
type LRUCache struct {
    // ... 原欄位
    hits   int64  // 命中次數
    misses int64  // 未命中次數
}

func (lru *LRUCache) Get(key int) int {
    node, exists := lru.cache[key]
    if !exists {
        atomic.AddInt64(&lru.misses, 1)
        return -1
    }
    
    atomic.AddInt64(&lru.hits, 1)
    lru.moveToHead(node)
    return node.value
}

func (lru *LRUCache) HitRate() float64 {
    total := lru.hits + lru.misses
    if total == 0 {
        return 0
    }
    return float64(lru.hits) / float64(total)
}
```

## 總結

LRU 快取是資料結構與實際應用結合的經典案例：

1. **核心結構**: HashMap + 雙向鏈結串列
2. **時間複雜度**: Get 和 Put 都是 O(1)
3. **實際應用**: Redis、瀏覽器快取、CDN、作業系統
4. **面試重點**: 理解原理、能手寫實現、考慮並發安全

作為資深後端工程師，你需要：
- 能夠在白板上快速實現 LRU
- 理解各種快取淘汰策略的適用場景
- 掌握執行緒安全、過期時間等擴展
- 理解 Redis 等實際系統的實現差異
- 能夠根據業務需求選擇合適的快取策略
