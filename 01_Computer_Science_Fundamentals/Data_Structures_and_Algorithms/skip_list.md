# 跳躍表 (Skip List)

- **難度**: 7
- **重要程度**: 4
- **標籤**: `跳躍表`, `Redis ZSet`, `有序集合`, `概率資料結構`

## 問題詳述

跳躍表是一種概率性的資料結構，透過多層索引實現快速的插入、刪除和查找操作，效能接近平衡樹 O(log n)，但實現更簡單。Redis 的有序集合 (ZSet) 就是用跳躍表實現的。

## 核心理論與詳解

### 1. 為什麼需要跳躍表？

#### 有序鏈結串列的問題

```
查找 50: 1 → 10 → 20 → 30 → 40 → 50
時間複雜度: O(n)
```

#### 跳躍表的解決方案

透過**多層索引**加速查找：

```
Level 2:  1 ----------------→ 30 --------→ 50
Level 1:  1 ------→ 20 ------→ 30 → 40 → 50
Level 0:  1 → 10 → 20 → 25 → 30 → 40 → 50
```

查找 50 的路徑：
1. Level 2: 1 → 30 → 50 ✓
2. 只需 3 步，而非 6 步

### 2. 跳躍表結構

#### 節點結構

```go
type SkipListNode struct {
    key     int
    value   interface{}
    forward []*SkipListNode  // 每層的下一個節點
}

type SkipList struct {
    header   *SkipListNode  // 頭節點
    level    int            // 當前最大層數
    maxLevel int            // 最大允許層數
    p        float64        // 晉升概率 (通常 0.25 或 0.5)
}
```

### 3. 核心操作實現

#### 初始化

```go
const (
    MaxLevel = 16
    P        = 0.25  // Redis 使用 0.25
)

func NewSkipList() *SkipList {
    return &SkipList{
        header:   &SkipListNode{forward: make([]*SkipListNode, MaxLevel)},
        level:    0,
        maxLevel: MaxLevel,
        p:        P,
    }
}
```

#### 隨機層數（核心機制）

```go
func (sl *SkipList) randomLevel() int {
    level := 0
    for rand.Float64() < sl.p && level < sl.maxLevel-1 {
        level++
    }
    return level
}
```

**為什麼是隨機？**
- 避免實現平衡樹的複雜旋轉邏輯
- 透過概率保證**期望**效能 O(log n)
- p=0.25 時，期望節點數：Level 0 = n, Level 1 = n/4, Level 2 = n/16...

#### 查找操作

```go
func (sl *SkipList) Search(key int) interface{} {
    current := sl.header
    
    // 從最高層開始
    for i := sl.level; i >= 0; i-- {
        // 在當前層向右移動
        for current.forward[i] != nil && current.forward[i].key < key {
            current = current.forward[i]
        }
    }
    
    // 移動到 Level 0 的下一個節點
    current = current.forward[0]
    
    if current != nil && current.key == key {
        return current.value
    }
    return nil
}
```

#### 插入操作

```go
func (sl *SkipList) Insert(key int, value interface{}) {
    update := make([]*SkipListNode, sl.maxLevel)
    current := sl.header
    
    // 1. 找到每層的插入位置
    for i := sl.level; i >= 0; i-- {
        for current.forward[i] != nil && current.forward[i].key < key {
            current = current.forward[i]
        }
        update[i] = current
    }
    
    current = current.forward[0]
    
    // 2. 如果已存在，更新值
    if current != nil && current.key == key {
        current.value = value
        return
    }
    
    // 3. 隨機決定新節點的層數
    newLevel := sl.randomLevel()
    if newLevel > sl.level {
        for i := sl.level + 1; i <= newLevel; i++ {
            update[i] = sl.header
        }
        sl.level = newLevel
    }
    
    // 4. 建立新節點
    newNode := &SkipListNode{
        key:     key,
        value:   value,
        forward: make([]*SkipListNode, newLevel+1),
    }
    
    // 5. 更新指標
    for i := 0; i <= newLevel; i++ {
        newNode.forward[i] = update[i].forward[i]
        update[i].forward[i] = newNode
    }
}
```

#### 刪除操作

```go
func (sl *SkipList) Delete(key int) bool {
    update := make([]*SkipListNode, sl.maxLevel)
    current := sl.header
    
    // 1. 找到每層的刪除位置
    for i := sl.level; i >= 0; i-- {
        for current.forward[i] != nil && current.forward[i].key < key {
            current = current.forward[i]
        }
        update[i] = current
    }
    
    current = current.forward[0]
    
    // 2. 如果不存在，返回 false
    if current == nil || current.key != key {
        return false
    }
    
    // 3. 更新每層指標
    for i := 0; i <= sl.level; i++ {
        if update[i].forward[i] != current {
            break
        }
        update[i].forward[i] = current.forward[i]
    }
    
    // 4. 更新最大層數
    for sl.level > 0 && sl.header.forward[sl.level] == nil {
        sl.level--
    }
    
    return true
}
```

### 4. 時間與空間複雜度

#### 時間複雜度

| 操作 | 平均 | 最壞 | 說明 |
|-----|------|------|------|
| **查找** | O(log n) | O(n) | 隨機層數保證期望 O(log n) |
| **插入** | O(log n) | O(n) | 查找 + O(1) 插入 |
| **刪除** | O(log n) | O(n) | 查找 + O(1) 刪除 |

#### 空間複雜度

- **平均**: O(n)
- **詳細分析**: 
  - p=0.25 時，期望節點數 = n × (1 + 1/4 + 1/16 + ...) = n × 4/3 ≈ 1.33n
  - p=0.5 時，期望節點數 = n × 2

### 5. 實際應用：Redis ZSet

#### Redis 為什麼選擇跳躍表？

**跳躍表 vs 紅黑樹**:

| 特性 | 跳躍表 | 紅黑樹 |
|-----|--------|--------|
| **實現難度** | ✅ 簡單 | ❌ 複雜（旋轉邏輯） |
| **範圍查詢** | ✅ 簡單（順著鏈表走） | ⚠️ 需要中序遍歷 |
| **插入/刪除** | ✅ 簡單 | ❌ 複雜（維護平衡） |
| **空間** | ⚠️ 稍高（多層指標） | ✅ 較低 |
| **效能穩定性** | ✅ 期望 O(log n) | ✅ 保證 O(log n) |
| **並行友善** | ✅ 更易實現無鎖 | ❌ 困難 |

**Redis ZSet 結構**:

```go
type ZSet struct {
    dict map[string]float64  // member → score 快速查找
    zsl  *SkipList           // 有序索引，支援範圍查詢
}
```

#### Redis ZSet 操作

```bash
# 添加成員
ZADD leaderboard 100 "player1" 200 "player2" 150 "player3"

# 獲取排名（範圍查詢）
ZRANGE leaderboard 0 2 WITHSCORES
# 1) "player1"  2) "100"
# 3) "player3"  4) "150"
# 5) "player2"  6) "200"

# 獲取分數範圍
ZRANGEBYSCORE leaderboard 100 200

# 獲取排名
ZRANK leaderboard "player3"  # 返回 1 (第二名)
```

#### Go 實現 Redis ZSet 核心邏輯

```go
type ZSet struct {
    dict map[string]*ZSetNode
    zsl  *SkipList
}

type ZSetNode struct {
    member string
    score  float64
}

// 添加成員
func (zs *ZSet) Add(member string, score float64) {
    // 1. 如果已存在，先刪除舊的
    if node, exists := zs.dict[member]; exists {
        zs.zsl.Delete(int(node.score), node)
    }
    
    // 2. 插入新的
    node := &ZSetNode{member: member, score: score}
    zs.zsl.Insert(int(score), node)
    zs.dict[member] = node
}

// 範圍查詢
func (zs *ZSet) RangeByRank(start, end int) []string {
    result := []string{}
    current := zs.zsl.header.forward[0]
    index := 0
    
    for current != nil {
        if index >= start && index <= end {
            node := current.value.(*ZSetNode)
            result = append(result, node.member)
        }
        if index > end {
            break
        }
        current = current.forward[0]
        index++
    }
    return result
}

// 分數範圍查詢
func (zs *ZSet) RangeByScore(minScore, maxScore float64) []string {
    result := []string{}
    current := zs.zsl.header.forward[0]
    
    for current != nil {
        node := current.value.(*ZSetNode)
        if node.score >= minScore && node.score <= maxScore {
            result = append(result, node.member)
        }
        if node.score > maxScore {
            break
        }
        current = current.forward[0]
    }
    return result
}
```

### 6. 實際應用場景

#### 1. 排行榜

```go
type Leaderboard struct {
    zset *ZSet
}

// 更新分數
func (lb *Leaderboard) UpdateScore(player string, score int) {
    lb.zset.Add(player, float64(score))
}

// 獲取前 N 名
func (lb *Leaderboard) GetTopN(n int) []string {
    return lb.zset.RangeByRank(0, n-1)
}

// 獲取排名
func (lb *Leaderboard) GetRank(player string) int {
    node, exists := lb.zset.dict[player]
    if !exists {
        return -1
    }
    
    rank := 0
    current := lb.zset.zsl.header.forward[0]
    for current != nil {
        if current.value.(*ZSetNode).member == player {
            return rank
        }
        rank++
        current = current.forward[0]
    }
    return -1
}
```

#### 2. 延遲任務佇列

```go
type DelayQueue struct {
    zset *ZSet
}

// 添加延遲任務
func (dq *DelayQueue) Add(taskID string, executeTime int64) {
    dq.zset.Add(taskID, float64(executeTime))
}

// 獲取到期任務
func (dq *DelayQueue) PopExpired(now int64) []string {
    tasks := dq.zset.RangeByScore(0, float64(now))
    for _, task := range tasks {
        dq.zset.Remove(task)
    }
    return tasks
}
```

#### 3. 範圍查詢

```go
// 查詢分數在 [80, 100] 的學生
students := zset.RangeByScore(80, 100)

// 查詢排名 1-10 的玩家
topPlayers := zset.RangeByRank(0, 9)
```

### 7. 跳躍表 vs 其他資料結構

| 資料結構 | 查找 | 插入 | 刪除 | 範圍查詢 | 實現難度 |
|---------|------|------|------|---------|---------|
| **跳躍表** | O(log n) | O(log n) | O(log n) | ✅ 簡單 | ✅ 簡單 |
| **紅黑樹** | O(log n) | O(log n) | O(log n) | ⚠️ 中序遍歷 | ❌ 複雜 |
| **B+ 樹** | O(log n) | O(log n) | O(log n) | ✅ 簡單 | ⚠️ 中等 |
| **雜湊表** | O(1) | O(1) | O(1) | ❌ 不支援 | ✅ 簡單 |

### 8. 效能優化技巧

#### 1. 調整晉升概率

```go
// 較低的 p 值（如 0.25）：
// - 節省空間
// - 查找稍慢
// Redis 使用 0.25

// 較高的 p 值（如 0.5）：
// - 查找更快
// - 空間開銷大
```

#### 2. 限制最大層數

```go
// 根據資料量決定
const MaxLevel = int(math.Log2(float64(expectedSize))) + 1
```

#### 3. 快速路徑

```go
// Redis 優化：記錄跨度（span）
type SkipListNode struct {
    key     int
    value   interface{}
    forward []*SkipListNode
    span    []int  // 每層到下個節點的跨度
}

// 用於快速計算排名
```

## 總結

### 核心要點

1. **多層索引**: 透過概率性的多層索引加速查找
2. **簡單高效**: 實現比紅黑樹簡單，效能接近 O(log n)
3. **範圍查詢友善**: 順著鏈表即可完成範圍查詢
4. **Redis ZSet**: Redis 用跳躍表實現有序集合
5. **實際應用**: 排行榜、延遲佇列、範圍查詢

### 作為資深後端工程師，你需要

- ✅ 理解跳躍表的多層索引和隨機層數機制
- ✅ 掌握跳躍表的插入、查找、刪除操作
- ✅ 知道 Redis ZSet 為什麼選擇跳躍表
- ✅ 能夠實現基本的跳躍表結構
- ✅ 在排行榜、延遲佇列等場景中應用跳躍表
