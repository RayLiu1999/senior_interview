# 如何設計即時排行榜系統?

- **難度**: 8
- **重要程度**: 5
- **標籤**: `系統設計`, `排行榜`, `即時排名`, `Redis Sorted Set`

## 問題詳述

設計一個即時排行榜系統,支援遊戲、社交、電商等場景的即時排名。系統需要處理高頻率的分數更新,支援全域性和分區排行榜,並能快速查詢任意使用者的排名。

## 核心理論與詳解

### 1. 排行榜系統的特點

#### 1.1 業務特點

**高頻寫入**:
```
遊戲: 每局結束更新分數(1000 萬 DAU,每人 10 局/天)
電商: 即時銷售額更新
社交: 點贊數、粉絲數變化
```

**即時查詢**:
```
查詢 Top 100
查詢使用者排名
查詢使用者周邊排名(前後 10 名)
```

**多維度排行榜**:
```
全域性排行榜
地區排行榜
時間視窗排行榜(小時榜、日榜、週榜、月榜)
```

#### 1.2 技術挑戰

**1. 高並行寫入**:
- 數百萬使用者同時更新分數
- 需要極高的寫入效能

**2. 即時排名計算**:
- 分數更新後立即反映在排名
- 查詢延遲 < 100ms

**3. 大資料量排序**:
- 億級使用者排序
- 記憶體壓力

**4. 視窗排行榜**:
- 小時榜、日榜、週榜
- 歷史資料清理

### 2. 需求澄清

#### 2.1 功能性需求

**核心功能**:
- ✅ 更新使用者分數
- ✅ 查詢 Top N 排行榜
- ✅ 查詢使用者當前排名
- ✅ 查詢使用者周邊排名

**延伸功能**:
- 多時間視窗排行榜(小時、日、週、月)
- 分區排行榜(地區、伺服器)
- 歷史排名追蹤
- 排名變化通知

#### 2.2 非功能性需求

**效能**:
- 分數更新 QPS: 10,000+
- 查詢延遲 < 100ms
- 排名更新延遲 < 1 秒

**規模**:
- 支援 1 億使用者
- Top 1000 排行榜
- 多個並行排行榜

**可用性**:
- 系統可用性 99.9%
- 資料持久化

### 3. 容量估算

#### 3.1 流量估算

**假設**:
- 日活使用者(DAU): 1000 萬
- 每使用者每日更新: 10 次
- 查詢 Top 榜次數: 20 次/人

**計算**:
```
寫入 QPS:
每日更新: 1000 萬 × 10 = 1 億次
平均: 1 億 / 86400 ≈ 1,150 次/秒
峰值: 1,150 × 3 ≈ 3,500 次/秒

讀取 QPS:
每日查詢: 1000 萬 × 20 = 2 億次
平均: 2 億 / 86400 ≈ 2,300 次/秒
峰值: 2,300 × 3 ≈ 7,000 次/秒
```

#### 3.2 儲存估算

**Redis Sorted Set**:
```
每個使用者:
- member: user_id (8 bytes)
- score: 分數 (8 bytes)
- 總計: 16 bytes

1 億使用者:
16 bytes × 1 億 = 1.6 GB (單個排行榜)

多個排行榜(全域性 + 100 個地區 + 時間視窗):
1.6 GB × (1 + 100 + 4) ≈ 168 GB
```

### 4. 核心架構設計

#### 4.1 整體架構圖

```
┌─────────────────────────────────────────────────┐
│                   Client                        │
│             (查詢排行榜、更新分數)                │
└──────────────────┬──────────────────────────────┘
                   │
            ┌──────▼──────┐
            │Load Balancer│
            │   (Nginx)   │
            └──────┬──────┘
                   │
       ┌───────────┼───────────┐
       │           │           │
   ┌───▼────┐  ┌──▼─────┐ ┌───▼────┐
   │  API   │  │  API   │ │  API   │
   │Gateway │  │Gateway │ │Gateway │
   └───┬────┘  └──┬─────┘ └───┬────┘
       │          │           │
       └──────────┼───────────┘
                  │
       ┌──────────▼───────────┐
       │ Leaderboard Service  │
       │ (更新分數、查詢排名)  │
       └──────────┬───────────┘
                  │
         ┌────────┼────────┐
         │        │        │
    ┌────▼───┐┌──▼───┐┌───▼────┐
    │ Redis  ││Redis ││ Redis  │
    │Cluster ││Cluste││Cluster │
    │(全域性) ││(地區)││(時間)  │
    └────┬───┘└──┬───┘└───┬────┘
         │       │       │
         └───────┼───────┘
                 │
        ┌────────▼─────────┐
        │   MySQL Cluster  │
        │  (持久化、歷史)   │
        └──────────────────┘

[快取層]
┌──────────────┐
│ Local Cache  │
│ (Top 100)    │
│ (1 分鐘 TTL) │
└──────────────┘
```

#### 4.2 核心組件

**1. Redis Sorted Set**:
- 儲存即時排行榜
- 自動排序
- 支援高並行讀寫

**2. 排行榜服務**:
- 分數更新
- 排名查詢
- 視窗管理

**3. MySQL**:
- 分數歷史記錄
- 排名快照
- 資料備份

### 5. Redis Sorted Set 實現 (核心)

#### 5.1 基礎操作

**更新分數**:
```go
func UpdateScore(userID int64, score float64) error {
    key := "leaderboard:global"
    
    // ZADD 會自動插入或更新
    err := redis.ZAdd(context.Background(), key, &redis.Z{
        Score:  score,
        Member: userID,
    }).Err()
    
    return err
}
```

**增加分數**:
```go
func IncrementScore(userID int64, delta float64) error {
    key := "leaderboard:global"
    
    // ZINCRBY 原子性增加
    err := redis.ZIncrBy(context.Background(), key, delta, 
        strconv.FormatInt(userID, 10)).Err()
    
    return err
}
```

**查詢 Top N**:
```go
func GetTopN(n int) ([]LeaderboardEntry, error) {
    key := "leaderboard:global"
    
    // ZREVRANGE 降序獲取(分數高的在前)
    result, err := redis.ZRevRangeWithScores(context.Background(), 
        key, 0, int64(n-1)).Result()
    
    if err != nil {
        return nil, err
    }
    
    entries := make([]LeaderboardEntry, len(result))
    for i, z := range result {
        userID, _ := strconv.ParseInt(z.Member.(string), 10, 64)
        entries[i] = LeaderboardEntry{
            Rank:   i + 1,
            UserID: userID,
            Score:  z.Score,
        }
    }
    
    return entries, nil
}
```

**查詢使用者排名**:
```go
func GetUserRank(userID int64) (int64, float64, error) {
    key := "leaderboard:global"
    member := strconv.FormatInt(userID, 10)
    
    // ZREVRANK 獲取排名(0-based)
    rank, err := redis.ZRevRank(context.Background(), key, member).Result()
    if err != nil {
        return 0, 0, err
    }
    
    // ZSCORE 獲取分數
    score, err := redis.ZScore(context.Background(), key, member).Result()
    if err != nil {
        return 0, 0, err
    }
    
    return rank + 1, score, nil // 轉為 1-based
}
```

**查詢使用者周邊排名**:
```go
func GetUserNeighbors(userID int64, range_ int) ([]LeaderboardEntry, error) {
    key := "leaderboard:global"
    member := strconv.FormatInt(userID, 10)
    
    // 1. 獲取使用者排名
    rank, err := redis.ZRevRank(context.Background(), key, member).Result()
    if err != nil {
        return nil, err
    }
    
    // 2. 獲取前後 range_ 名
    start := int64(0)
    if rank > int64(range_) {
        start = rank - int64(range_)
    }
    end := rank + int64(range_)
    
    // 3. ZREVRANGE 獲取範圍
    result, err := redis.ZRevRangeWithScores(context.Background(), 
        key, start, end).Result()
    
    if err != nil {
        return nil, err
    }
    
    // 4. 組裝結果
    entries := make([]LeaderboardEntry, len(result))
    for i, z := range result {
        uid, _ := strconv.ParseInt(z.Member.(string), 10, 64)
        entries[i] = LeaderboardEntry{
            Rank:   int(start) + i + 1,
            UserID: uid,
            Score:  z.Score,
        }
    }
    
    return entries, nil
}
```

#### 5.2 分數並行問題

**問題**: 高並行下,分數更新可能衝突。

**解決方案 1: ZINCRBY (推薦)**

```go
// 不使用 GET → SET
// ❌ 錯誤方式
func WrongIncrement(userID int64, delta float64) {
    score := redis.ZScore("leaderboard:global", userID)
    newScore := score + delta
    redis.ZAdd("leaderboard:global", newScore, userID)
    // 問題: 非原子操作,並行時會丟失更新
}

// ✅ 正確方式
func CorrectIncrement(userID int64, delta float64) {
    // ZINCRBY 是原子操作
    redis.ZIncrBy("leaderboard:global", delta, userID)
}
```

**解決方案 2: Lua 腳本**

```lua
-- leaderboard_update.lua
local key = KEYS[1]
local member = ARGV[1]
local delta = tonumber(ARGV[2])

-- 獲取當前分數
local score = redis.call('ZSCORE', key, member)
if score == nil then
    score = 0
else
    score = tonumber(score)
end

-- 計算新分數
local newScore = score + delta

-- 更新
redis.call('ZADD', key, newScore, member)

-- 返回新分數和排名
local rank = redis.call('ZREVRANK', key, member)
return {newScore, rank + 1}
```

**Go 實現**:
```go
var luaUpdateScript = redis.NewScript(`
    local key = KEYS[1]
    local member = ARGV[1]
    local delta = tonumber(ARGV[2])
    local score = redis.call('ZSCORE', key, member)
    if score == nil then
        score = 0
    else
        score = tonumber(score)
    end
    local newScore = score + delta
    redis.call('ZADD', key, newScore, member)
    local rank = redis.call('ZREVRANK', key, member)
    return {newScore, rank + 1}
`)

func UpdateScoreWithLua(userID int64, delta float64) (float64, int64, error) {
    key := "leaderboard:global"
    member := strconv.FormatInt(userID, 10)
    
    result, err := luaUpdateScript.Run(context.Background(), redis.Client,
        []string{key}, member, delta).Result()
    
    if err != nil {
        return 0, 0, err
    }
    
    resultSlice := result.([]interface{})
    score := resultSlice[0].(float64)
    rank := resultSlice[1].(int64)
    
    return score, rank, nil
}
```

### 6. 時間視窗排行榜

#### 6.1 小時榜

**實現**:
```go
func UpdateHourlyLeaderboard(userID int64, score float64) {
    // Key 包含小時資訊
    hour := time.Now().Format("2006010215") // YYYYMMDDHH
    key := fmt.Sprintf("leaderboard:hourly:%s", hour)
    
    redis.ZIncrBy(context.Background(), key, score, 
        strconv.FormatInt(userID, 10))
    
    // 設定過期時間(保留 24 小時)
    redis.Expire(context.Background(), key, 24*time.Hour)
}

func GetHourlyTop(hour string, n int) ([]LeaderboardEntry, error) {
    key := fmt.Sprintf("leaderboard:hourly:%s", hour)
    
    result, err := redis.ZRevRangeWithScores(context.Background(), 
        key, 0, int64(n-1)).Result()
    
    return parseLeaderboard(result), err
}
```

#### 6.2 日榜

```go
func UpdateDailyLeaderboard(userID int64, score float64) {
    day := time.Now().Format("20060102") // YYYYMMDD
    key := fmt.Sprintf("leaderboard:daily:%s", day)
    
    redis.ZIncrBy(context.Background(), key, score, 
        strconv.FormatInt(userID, 10))
    
    // 保留 30 天
    redis.Expire(context.Background(), key, 30*24*time.Hour)
}
```

#### 6.3 週榜和月榜

```go
func UpdateWeeklyLeaderboard(userID int64, score float64) {
    // ISO 週數
    year, week := time.Now().ISOWeek()
    key := fmt.Sprintf("leaderboard:weekly:%d-W%02d", year, week)
    
    redis.ZIncrBy(context.Background(), key, score, 
        strconv.FormatInt(userID, 10))
    
    // 保留 12 週
    redis.Expire(context.Background(), key, 12*7*24*time.Hour)
}

func UpdateMonthlyLeaderboard(userID int64, score float64) {
    month := time.Now().Format("200601") // YYYYMM
    key := fmt.Sprintf("leaderboard:monthly:%s", month)
    
    redis.ZIncrBy(context.Background(), key, score, 
        strconv.FormatInt(userID, 10))
    
    // 保留 12 個月
    redis.Expire(context.Background(), key, 365*24*time.Hour)
}
```

#### 6.4 統一更新介面

```go
func UpdateAllLeaderboards(userID int64, score float64) {
    // 並行更新所有排行榜
    var wg sync.WaitGroup
    
    wg.Add(4)
    
    go func() {
        defer wg.Done()
        UpdateGlobalLeaderboard(userID, score)
    }()
    
    go func() {
        defer wg.Done()
        UpdateDailyLeaderboard(userID, score)
    }()
    
    go func() {
        defer wg.Done()
        UpdateWeeklyLeaderboard(userID, score)
    }()
    
    go func() {
        defer wg.Done()
        UpdateMonthlyLeaderboard(userID, score)
    }()
    
    wg.Wait()
}
```

### 7. 分區排行榜

#### 7.1 地區排行榜

**實現**:
```go
func UpdateRegionLeaderboard(userID int64, region string, score float64) {
    key := fmt.Sprintf("leaderboard:region:%s", region)
    
    redis.ZIncrBy(context.Background(), key, score, 
        strconv.FormatInt(userID, 10))
}

func GetRegionTop(region string, n int) ([]LeaderboardEntry, error) {
    key := fmt.Sprintf("leaderboard:region:%s", region)
    
    result, err := redis.ZRevRangeWithScores(context.Background(), 
        key, 0, int64(n-1)).Result()
    
    return parseLeaderboard(result), err
}
```

**自動分配地區**:
```go
func GetUserRegion(userID int64) string {
    // 從使用者資料獲取
    user := db.GetUser(userID)
    return user.Region
}

func UpdateScore(userID int64, delta float64) {
    region := GetUserRegion(userID)
    
    // 更新全域性榜和地區榜
    UpdateGlobalLeaderboard(userID, delta)
    UpdateRegionLeaderboard(userID, region, delta)
}
```

#### 7.2 伺服器/分組排行榜

```go
func UpdateServerLeaderboard(userID int64, serverID int, score float64) {
    key := fmt.Sprintf("leaderboard:server:%d", serverID)
    
    redis.ZIncrBy(context.Background(), key, score, 
        strconv.FormatInt(userID, 10))
}
```

### 8. 快取策略

#### 8.1 本地快取 Top N

**問題**: Top 100 查詢頻率極高。

**解決方案**:

```go
type LeaderboardCache struct {
    cache *sync.Map // 本地快取
    ttl   time.Duration
}

func NewLeaderboardCache(ttl time.Duration) *LeaderboardCache {
    return &LeaderboardCache{
        cache: &sync.Map{},
        ttl:   ttl,
    }
}

type CacheEntry struct {
    Data      []LeaderboardEntry
    Timestamp time.Time
}

func (c *LeaderboardCache) GetTopN(key string, n int) ([]LeaderboardEntry, bool) {
    val, ok := c.cache.Load(key)
    if !ok {
        return nil, false
    }
    
    entry := val.(CacheEntry)
    
    // 檢查是否過期
    if time.Since(entry.Timestamp) > c.ttl {
        c.cache.Delete(key)
        return nil, false
    }
    
    return entry.Data, true
}

func (c *LeaderboardCache) SetTopN(key string, data []LeaderboardEntry) {
    c.cache.Store(key, CacheEntry{
        Data:      data,
        Timestamp: time.Now(),
    })
}

// 使用
var topCache = NewLeaderboardCache(1 * time.Minute)

func GetTop100() ([]LeaderboardEntry, error) {
    key := "leaderboard:global:top100"
    
    // 1. 本地快取
    if data, ok := topCache.GetTopN(key, 100); ok {
        return data, nil
    }
    
    // 2. Redis
    data, err := GetTopNFromRedis(100)
    if err != nil {
        return nil, err
    }
    
    // 3. 寫入快取
    topCache.SetTopN(key, data)
    
    return data, nil
}
```

#### 8.2 使用者排名快取

**問題**: 使用者頻繁查詢自己的排名。

**解決方案**:

```go
func GetUserRankCached(userID int64) (int64, float64, error) {
    key := fmt.Sprintf("rank:cache:%d", userID)
    
    // 1. Redis 快取(TTL 60 秒)
    cached, err := redis.Get(context.Background(), key).Result()
    if err == nil {
        // 解析快取
        var rankData struct {
            Rank  int64   `json:"rank"`
            Score float64 `json:"score"`
        }
        json.Unmarshal([]byte(cached), &rankData)
        return rankData.Rank, rankData.Score, nil
    }
    
    // 2. 計算排名
    rank, score, err := GetUserRank(userID)
    if err != nil {
        return 0, 0, err
    }
    
    // 3. 寫入快取
    data, _ := json.Marshal(map[string]interface{}{
        "rank":  rank,
        "score": score,
    })
    redis.Set(context.Background(), key, data, 60*time.Second)
    
    return rank, score, nil
}
```

### 9. 排名變化通知

#### 9.1 實現排名追蹤

```go
func UpdateScoreWithNotification(userID int64, delta float64) error {
    // 1. 獲取舊排名
    oldRank, _, err := GetUserRank(userID)
    if err != nil {
        oldRank = 0 // 首次進榜
    }
    
    // 2. 更新分數
    err = IncrementScore(userID, delta)
    if err != nil {
        return err
    }
    
    // 3. 獲取新排名
    newRank, newScore, err := GetUserRank(userID)
    if err != nil {
        return err
    }
    
    // 4. 檢查是否需要通知
    if ShouldNotify(oldRank, newRank) {
        SendRankNotification(userID, oldRank, newRank, newScore)
    }
    
    return nil
}

func ShouldNotify(oldRank, newRank int64) bool {
    // 進入 Top 100
    if oldRank > 100 && newRank <= 100 {
        return true
    }
    
    // 進入 Top 10
    if oldRank > 10 && newRank <= 10 {
        return true
    }
    
    // 登頂
    if newRank == 1 {
        return true
    }
    
    // 排名提升 10 名以上
    if oldRank-newRank >= 10 {
        return true
    }
    
    return false
}
```

#### 9.2 排名變化推送

```go
func SendRankNotification(userID, oldRank, newRank int64, score float64) {
    var message string
    
    switch {
    case newRank == 1:
        message = fmt.Sprintf("🎉 恭喜登頂!當前分數: %.0f", score)
    case newRank <= 10:
        message = fmt.Sprintf("🏆 進入 Top 10!當前排名: #%d", newRank)
    case newRank <= 100:
        message = fmt.Sprintf("⭐ 進入 Top 100!當前排名: #%d", newRank)
    default:
        message = fmt.Sprintf("📈 排名上升 %d 名!當前排名: #%d", oldRank-newRank, newRank)
    }
    
    // 發送 Push 通知
    SendPushNotification(userID, "排名更新", message)
}
```

### 10. 大資料量優化

#### 10.1 問題:億級使用者排序

**Redis 記憶體限制**:
```
1 億使用者 × 16 bytes = 1.6 GB (可接受)

但查詢所有使用者排名(ZRANK)會很慢
```

#### 10.2 解決方案:分段排行榜

```go
// 按分數段分片
func GetShardKey(score float64) string {
    // 分數範圍: 0 ~ 1,000,000
    // 每 10,000 分一個分片
    shard := int(score / 10000)
    return fmt.Sprintf("leaderboard:shard:%d", shard)
}

func UpdateShardedScore(userID int64, score float64) {
    key := GetShardKey(score)
    
    redis.ZAdd(context.Background(), key, &redis.Z{
        Score:  score,
        Member: userID,
    })
    
    // 記錄使用者所在分片
    redis.Set(context.Background(), 
        fmt.Sprintf("user:shard:%d", userID), 
        key, 0)
}

func GetUserRankSharded(userID int64) (int64, float64, error) {
    // 1. 獲取使用者分片
    userShardKey, err := redis.Get(context.Background(), 
        fmt.Sprintf("user:shard:%d", userID)).Result()
    if err != nil {
        return 0, 0, err
    }
    
    // 2. 獲取使用者分數
    member := strconv.FormatInt(userID, 10)
    score, err := redis.ZScore(context.Background(), 
        userShardKey, member).Result()
    if err != nil {
        return 0, 0, err
    }
    
    // 3. 計算全域性排名
    rank := int64(0)
    
    // 統計高分片的使用者數
    currentShard := GetShardKey(score)
    for shard := 100; shard >= 0; shard-- {
        shardKey := fmt.Sprintf("leaderboard:shard:%d", shard)
        
        if shardKey == currentShard {
            // 當前分片內的排名
            shardRank, _ := redis.ZRevRank(context.Background(), 
                shardKey, member).Result()
            rank += shardRank
            break
        }
        
        // 更高分片的使用者總數
        count, _ := redis.ZCard(context.Background(), shardKey).Result()
        rank += count
    }
    
    return rank + 1, score, nil
}
```

#### 10.3 解決方案:近似排名

**Top K 演算法**:

```go
// 只保留 Top 1 萬名,其餘使用近似排名
func GetApproximateRank(userID int64) (int64, float64, error) {
    key := "leaderboard:global"
    member := strconv.FormatInt(userID, 10)
    
    // 1. 檢查是否在 Top 10000
    rank, err := redis.ZRevRank(context.Background(), key, member).Result()
    if err == nil && rank < 10000 {
        score, _ := redis.ZScore(context.Background(), key, member).Result()
        return rank + 1, score, nil
    }
    
    // 2. 不在 Top 10000,返回近似排名
    score, err := redis.ZScore(context.Background(), key, member).Result()
    if err != nil {
        return 0, 0, err
    }
    
    // 統計分數比該使用者高的人數(近似)
    count, _ := redis.ZCount(context.Background(), key, 
        strconv.FormatFloat(score, 'f', -1, 64), "+inf").Result()
    
    return count, score, nil
}
```

### 11. 持久化與容災

#### 11.1 Redis 持久化

**RDB + AOF**:
```bash
# redis.conf
save 900 1
save 300 10
save 60 10000

appendonly yes
appendfsync everysec
```

#### 11.2 定時快照到 MySQL

```go
func SnapshotLeaderboard() {
    ticker := time.NewTicker(1 * time.Hour)
    
    for range ticker.C {
        // 1. 獲取 Top 1000
        top, err := GetTopN(1000)
        if err != nil {
            log.Error("snapshot failed", err)
            continue
        }
        
        // 2. 批次寫入 MySQL
        tx := db.Begin()
        
        for _, entry := range top {
            tx.Exec(`
                INSERT INTO leaderboard_snapshots 
                (user_id, rank, score, snapshot_time)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE rank=?, score=?, snapshot_time=?
            `, entry.UserID, entry.Rank, entry.Score, time.Now(),
               entry.Rank, entry.Score, time.Now())
        }
        
        tx.Commit()
        
        log.Info("snapshot completed", len(top))
    }
}
```

### 12. 監控與告警

#### 12.1 關鍵指標

**業務指標**:
```
- 排行榜更新 QPS
- 排行榜查詢 QPS
- Top 100 快取命中率
- 平均排名計算時間
```

**系統指標**:
```
- Redis 記憶體使用率
- Redis Sorted Set 大小
- API 回應時間 P99
```

#### 12.2 告警規則

```yaml
alerts:
  - name: HighMemoryUsage
    condition: redis_memory > 80%
    action: 擴容或清理舊資料
    
  - name: SlowRankQuery
    condition: rank_query_p99 > 100ms
    action: 最佳化查詢或增加快取
    
  - name: HighUpdateQPS
    condition: update_qps > 10000
    action: 檢查是否有異常流量
```

## 常見面試考點

### Q1: Redis Sorted Set 的時間複雜度是多少?

**答案**:

Redis Sorted Set 底層使用 **Skip List (跳錶)** 實現。

**時間複雜度**:

| 操作 | 命令 | 複雜度 |
|------|------|--------|
| 新增/更新 | ZADD | O(log N) |
| 刪除 | ZREM | O(log N) |
| 增加分數 | ZINCRBY | O(log N) |
| 獲取排名 | ZRANK / ZREVRANK | O(log N) |
| 獲取分數 | ZSCORE | O(1) |
| 範圍查詢 | ZRANGE / ZREVRANGE | O(log N + M) |
| 統計數量 | ZCOUNT | O(log N) |

其中:
- N: Sorted Set 中的元素總數
- M: 範圍查詢返回的元素數量

**為什麼使用 Skip List?**

1. **平衡二元樹 (AVL, 紅黑樹)**:
   - 優點: O(log N) 查詢
   - 缺點: 範圍查詢困難,實現複雜

2. **Skip List (跳錶)**:
   - 優點: O(log N) 查詢 + 範圍查詢簡單
   - 優點: 實現簡單,程式碼更易維護
   - 優點: 支援並行性更好

**Skip List 原理**:

```
Level 3:  1 ------------------------> 9
Level 2:  1 -------> 4 -------> 7 --> 9
Level 1:  1 --> 2 -> 4 --> 5 -> 7 --> 9
Level 0:  1 --> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9

查詢 7:
1. Level 3: 1 → 9 (太大,下降)
2. Level 2: 1 → 4 → 7 (找到!)
3. 總共跳躍 3 次,O(log N)
```

**實際效能**:

```
1 億使用者:
- ZADD: log(10^8) ≈ 27 次比較,< 1ms
- ZRANK: log(10^8) ≈ 27 次比較,< 1ms
- ZREVRANGE 0 99: log(10^8) + 100 ≈ 127 次操作,< 5ms
```

### Q2: 如何處理億級使用者的排行榜?

**答案**:

億級使用者的排行榜面臨記憶體和效能挑戰:

**問題 1: 記憶體壓力**

```
1 億使用者 × 16 bytes = 1.6 GB
加上 Redis 開銷: ≈ 3 GB

單機 Redis 記憶體: 通常 8~16 GB
結論: 單機可承載,但需要最佳化
```

**解決方案**:

**1. 分片排行榜**

```go
// 按分數段分片(100 個分片)
func GetShardKey(score float64) string {
    shard := int(score / 10000)
    return fmt.Sprintf("leaderboard:shard:%d", shard)
}

// 全域性排名 = 高分片使用者總數 + 當前分片內排名
```

**2. 只保留 Top K**

```go
// 只保留 Top 10 萬名
func AddToTopK(userID int64, score float64) {
    key := "leaderboard:top100k"
    
    // 1. 新增使用者
    redis.ZAdd(key, score, userID)
    
    // 2. 保留 Top 100k
    redis.ZRemRangeByRank(key, 0, -100001)
}

// 不在 Top 100k 的使用者:返回近似排名
```

**3. 近似排名 (HyperLogLog)**

```go
// 統計每個分數段的使用者數(近似)
func GetApproximateRank(userID int64, score float64) int64 {
    rank := int64(0)
    
    // 統計分數比該使用者高的人數(HyperLogLog)
    for s := 1000000; s > int(score); s -= 1000 {
        key := fmt.Sprintf("score:range:%d", s)
        count := redis.PFCount(key) // HyperLogLog 統計
        rank += count
    }
    
    return rank
}
```

**4. 分時段更新**

```
不是所有使用者都即時更新排名
只有 Top 10 萬即時更新
其餘使用者每小時更新一次
```

**5. Redis Cluster**

```
16 個 Master 節點
按 user_id hash 分片
每個節點承載 625 萬使用者(100 MB)
```

**推薦方案**:

```
Top 10 萬: Redis Sorted Set(即時排名)
10 萬 ~ 100 萬: Redis + 定時更新(準即時)
100 萬+: 近似排名(HyperLogLog)
```

### Q3: 如何實現時間視窗排行榜(小時榜、日榜)?

**答案**:

**方案 1: 多個 Sorted Set**

```go
func UpdateAllLeaderboards(userID int64, score float64) {
    // 小時榜
    hour := time.Now().Format("2006010215")
    redis.ZIncrBy("leaderboard:hourly:" + hour, score, userID)
    redis.Expire("leaderboard:hourly:" + hour, 24*time.Hour)
    
    // 日榜
    day := time.Now().Format("20060102")
    redis.ZIncrBy("leaderboard:daily:" + day, score, userID)
    redis.Expire("leaderboard:daily:" + day, 30*24*time.Hour)
    
    // 週榜
    year, week := time.Now().ISOWeek()
    redis.ZIncrBy(fmt.Sprintf("leaderboard:weekly:%d-W%02d", year, week), 
        score, userID)
    
    // 全時榜
    redis.ZIncrBy("leaderboard:global", score, userID)
}
```

**優點**: 實現簡單,查詢快速
**缺點**: 記憶體佔用大,寫入放大

**方案 2: 時間戳 + 範圍查詢**

```go
// 每次更新時記錄時間戳
func UpdateWithTimestamp(userID int64, score float64) {
    // 記錄: user_id → [(timestamp, score), ...]
    redis.ZAdd("user:scores:" + userID, time.Now().Unix(), score)
}

// 查詢日榜
func GetDailyTop(day string, n int) []LeaderboardEntry {
    dayStart := ParseDay(day).Unix()
    dayEnd := dayStart + 86400
    
    // 1. 獲取所有使用者
    users := GetAllUsers()
    
    // 2. 計算每個使用者當天的分數總和
    scores := make(map[int64]float64)
    for _, userID := range users {
        key := "user:scores:" + userID
        
        // 查詢當天的所有分數
        dayScores := redis.ZRangeByScore(key, dayStart, dayEnd)
        
        total := 0.0
        for _, s := range dayScores {
            total += s
        }
        
        scores[userID] = total
    }
    
    // 3. 排序
    return TopNFromMap(scores, n)
}
```

**優點**: 靈活,支援任意時間範圍查詢
**缺點**: 查詢慢(需要遍歷所有使用者)

**推薦方案: 混合**

```
小時榜: 方案 1 (即時,24 小時 TTL)
日榜: 方案 1 (30 天 TTL)
週榜: 方案 1 (12 週 TTL)
歷史查詢: 方案 2 (MySQL 儲存)
```

**進階: 滑動視窗**

```go
// 最近 1 小時的滑動視窗
func GetSlidingHourTop(n int) []LeaderboardEntry {
    now := time.Now()
    oneHourAgo := now.Add(-1 * time.Hour)
    
    scores := make(map[int64]float64)
    
    // 遍歷使用者,統計最近 1 小時的分數
    for _, userID := range GetActiveUsers() {
        key := "user:scores:" + userID
        
        recentScores := redis.ZRangeByScore(key, 
            oneHourAgo.Unix(), now.Unix())
        
        total := SumScores(recentScores)
        scores[userID] = total
    }
    
    return TopNFromMap(scores, n)
}
```

### Q4: 排行榜如何保證高可用?

**答案**:

**1. Redis Cluster (推薦)**

```
16 個 Master 節點
每個 Master 有 2 個 Slave
自動故障轉移
```

**架構**:
```
Master 1 (shard 0) → Slave 1-1, Slave 1-2
Master 2 (shard 1) → Slave 2-1, Slave 2-2
...
Master 16 (shard 15) → Slave 16-1, Slave 16-2
```

**2. Redis Sentinel**

```
1 Master + 2 Slaves
3 個 Sentinel 監控
自動切換
```

**3. 資料持久化**

```bash
# RDB: 定期快照
save 900 1
save 300 10
save 60 10000

# AOF: 操作日誌
appendonly yes
appendfsync everysec
```

**4. 雙活部署**

```
資料中心 A: Redis Cluster A
資料中心 B: Redis Cluster B

雙向複製:
A → B (非同步複製)
B → A (非同步複製)

使用者請求:
- 就近路由(A 區使用者 → A 叢集)
- 故障切換(A 叢集故障 → B 叢集)
```

**5. 降級方案**

```go
func GetTopN(n int) ([]LeaderboardEntry, error) {
    // 1. Redis
    data, err := GetTopNFromRedis(n)
    if err == nil {
        return data, nil
    }
    
    // 2. 本地快取
    if cached, ok := localCache.Get("top100"); ok {
        return cached, nil
    }
    
    // 3. MySQL(歷史快照)
    data, err = GetTopNFromMySQL(n)
    if err == nil {
        return data, nil
    }
    
    // 4. 返回空資料
    return []LeaderboardEntry{}, errors.New("service unavailable")
}
```

**6. 監控告警**

```yaml
alerts:
  - name: RedisDown
    condition: redis_unavailable
    action:
      - 自動切換到 Slave
      - 通知運維
      - 啟動降級方案
      
  - name: HighLatency
    condition: p99_latency > 100ms
    action: 檢查 Redis 負載
```

**7. 定時備份**

```go
func BackupLeaderboard() {
    ticker := time.NewTicker(1 * time.Hour)
    
    for range ticker.C {
        // 1. 匯出 Redis 資料
        top := GetTopN(10000)
        
        // 2. 寫入 MySQL
        db.BulkInsert(top)
        
        // 3. 上傳到 S3
        UploadToS3(top)
    }
}
```

### Q5: 如何處理分數並行更新的一致性問題?

**答案**:

**問題**: 高並行下,多個請求同時更新同一使用者的分數。

**錯誤方式**:
```go
// ❌ 非原子操作
func WrongUpdate(userID int64, delta float64) {
    // 1. 讀取
    score := redis.ZScore("leaderboard", userID)
    
    // 2. 計算
    newScore := score + delta
    
    // 3. 寫入
    redis.ZAdd("leaderboard", newScore, userID)
    
    // 問題: 步驟 1-3 之間,其他請求可能已經修改了分數
    // 導致丟失更新(Lost Update)
}
```

**正確方式 1: ZINCRBY (推薦)**

```go
// ✅ 原子操作
func CorrectUpdate(userID int64, delta float64) {
    // Redis ZINCRBY 是原子操作
    redis.ZIncrBy("leaderboard", delta, userID)
}
```

**正確方式 2: Lua 腳本**

```lua
-- 原子性執行多個操作
local key = KEYS[1]
local member = ARGV[1]
local delta = tonumber(ARGV[2])

-- 獲取當前分數
local score = redis.call('ZSCORE', key, member)
if score == nil then
    score = 0
else
    score = tonumber(score)
end

-- 計算新分數(可以新增業務邏輯)
local newScore = score + delta

-- 限制最大分數
if newScore > 1000000 then
    newScore = 1000000
end

-- 更新
redis.call('ZADD', key, newScore, member)

-- 返回新分數和排名
local rank = redis.call('ZREVRANK', key, member)
return {newScore, rank + 1}
```

**正確方式 3: 分散式鎖**

```go
func UpdateWithLock(userID int64, delta float64) error {
    lock := redis.NewLock("lock:user:" + userID, 5*time.Second)
    
    // 獲取鎖
    if !lock.Acquire() {
        return errors.New("lock failed")
    }
    defer lock.Release()
    
    // 臨界區:讀取、計算、寫入
    score := redis.ZScore("leaderboard", userID)
    newScore := score + delta
    redis.ZAdd("leaderboard", newScore, userID)
    
    return nil
}
```

**推薦方案**:

1. **簡單增減**: 使用 **ZINCRBY** (最優)
2. **複雜邏輯**: 使用 **Lua 腳本**
3. **跨資料庫**: 使用 **分散式鎖**

**效能對比**:

| 方案 | 吞吐量 | 複雜度 | 一致性 |
|------|-------|--------|--------|
| ZINCRBY | 極高(100K+ QPS) | 簡單 | ✅ |
| Lua 腳本 | 高(50K+ QPS) | 中等 | ✅ |
| 分散式鎖 | 低(1K QPS) | 複雜 | ✅ |
| 無保護 | 極高 | 簡單 | ❌ |

## 總結

即時排行榜系統是高並行、大資料量場景的經典案例,涵蓋了:

**核心挑戰**:
1. **高並行寫入**: 數百萬使用者同時更新分數
2. **即時排名**: 分數更新後立即反映在排名
3. **大資料量排序**: 億級使用者高效排序
4. **多維度排行榜**: 全域性、地區、時間視窗

**關鍵技術**:
- **Redis Sorted Set**: 自動排序,O(log N) 操作
- **ZINCRBY / Lua 腳本**: 原子性更新,保證一致性
- **時間視窗**: 多個 Sorted Set + TTL
- **分片**: 按分數段或使用者 ID 分片
- **快取**: 本地快取 Top N,降低 Redis 壓力

**設計原則**:
- **選擇合適的資料結構**: Sorted Set 是排行榜的最佳選擇
- **原子操作**: 使用 ZINCRBY 或 Lua 腳本保證一致性
- **分層快取**: 本地快取 → Redis → MySQL
- **權衡取捨**: 精確排名 vs 近似排名,記憶體 vs 效能

掌握排行榜系統設計,對理解 Redis、高並行系統、大資料量處理有重要意義!
