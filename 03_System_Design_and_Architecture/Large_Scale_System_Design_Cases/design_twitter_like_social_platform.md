# 如何設計類 Twitter 的社交平台？

- **難度**: 9
- **重要程度**: 5
- **標籤**: `系統設計`, `社交平台`, `Twitter`, `新聞推送`, `關注系統`

## 問題詳述

設計一個類似 Twitter 的社交媒體平台,支援使用者發佈貼文(tweet)、關注其他使用者、查看個人時間線(timeline)和首頁動態(feed)等核心功能。系統需要支援數億使用者和每日數十億次請求。

## 核心理論與詳解

### 1. 需求澄清

#### 1.1 功能性需求

**核心功能**:
- ✅ 使用者可以發佈貼文(最多 280 字元)
- ✅ 使用者可以關注/取消關注其他使用者
- ✅ 使用者可以查看首頁動態(關注使用者的貼文)
- ✅ 使用者可以查看個人時間線(自己的貼文)
- ✅ 貼文支援按讚、轉發、評論

**延伸功能**(面試時可討論):
- 提及(@mention)和標籤(#hashtag)
- 推薦使用者和熱門話題
- 通知系統
- 搜尋功能
- 多媒體支援(圖片、影片)

#### 1.2 非功能性需求

**可用性**:
- 系統需要高可用(99.9%+)
- 讀取延遲 < 200ms
- 發文延遲 < 500ms

**擴展性**:
- 支援 5 億活躍使用者
- 支援每日 10 億次發文
- 支援每日 100 億次 feed 查詢

**一致性**:
- 發文需要強一致性
- Feed 可以接受最終一致性(短暫延遲)

### 2. 容量估算

#### 2.1 流量估算

**假設**:
- 日活躍使用者(DAU): 200M
- 平均每使用者每日發文: 2 次
- 平均每使用者每日查看 feed: 50 次
- 平均每使用者關注: 200 人
- 讀寫比: 100:1

**計算**:
```
發文 QPS:
- 每日發文: 200M × 2 = 400M
- 每秒發文: 400M / 86400 ≈ 4,600 QPS
- 峰值: 4,600 × 3 ≈ 14,000 QPS

Feed 查詢 QPS:
- 每日查詢: 200M × 50 = 10B
- 每秒查詢: 10B / 86400 ≈ 115,000 QPS
- 峰值: 115,000 × 3 ≈ 350,000 QPS
```

#### 2.2 儲存估算

**貼文儲存**:
```
單條貼文大小:
- tweetID: 8 bytes
- userID: 8 bytes
- content: 280 bytes (UTF-8)
- timestamp: 8 bytes
- metadata: 100 bytes
- 總計: ~400 bytes

每日新增儲存:
- 400M tweets × 400 bytes = 160 GB/day
- 5 年總儲存: 160 GB × 365 × 5 ≈ 292 TB

加上備份和索引: ~600 TB
```

**關注關係儲存**:
```
單條關注關係:
- followerID: 8 bytes
- followeeID: 8 bytes
- timestamp: 8 bytes
- 總計: 24 bytes

總關注關係數:
- 500M users × 200 follows = 100B relationships
- 100B × 24 bytes = 2.4 TB
```

#### 2.3 頻寬估算

```
入站頻寬(發文):
- 14,000 QPS × 400 bytes = 5.6 MB/s

出站頻寬(查詢 feed):
- 每次查詢返回 20 條貼文
- 350,000 QPS × 20 × 400 bytes = 2.8 GB/s
```

### 3. API 設計

#### 3.1 核心 API

```
POST /api/v1/tweets
Request:
{
  "user_id": "123456",
  "content": "Hello World!",
  "media_urls": ["https://..."]
}
Response:
{
  "tweet_id": "987654321",
  "created_at": "2025-10-06T12:00:00Z",
  "status": "success"
}

GET /api/v1/feed/home?user_id=123&limit=20&cursor=xyz
Response:
{
  "tweets": [
    {
      "tweet_id": "987654321",
      "user_id": "456",
      "username": "john_doe",
      "content": "...",
      "created_at": "...",
      "likes": 100,
      "retweets": 50
    }
  ],
  "next_cursor": "abc"
}

POST /api/v1/relationships/follow
Request:
{
  "follower_id": "123",
  "followee_id": "456"
}

GET /api/v1/users/{user_id}/timeline?limit=20
Response: { ... }
```

### 4. 資料模型設計

#### 4.1 關聯式資料庫結構 (MySQL/PostgreSQL)

**Users 表**:
```sql
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    followers_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    INDEX idx_username (username)
);
```

**Tweets 表**:
```sql
CREATE TABLE tweets (
    tweet_id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    content VARCHAR(280) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes_count INT DEFAULT 0,
    retweets_count INT DEFAULT 0,
    replies_count INT DEFAULT 0,
    INDEX idx_user_created (user_id, created_at DESC),
    INDEX idx_created (created_at DESC),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

**Relationships 表** (關注關係):
```sql
CREATE TABLE relationships (
    follower_id BIGINT NOT NULL,
    followee_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followee_id),
    INDEX idx_follower (follower_id),
    INDEX idx_followee (followee_id),
    FOREIGN KEY (follower_id) REFERENCES users(user_id),
    FOREIGN KEY (followee_id) REFERENCES users(user_id)
);
```

#### 4.2 NoSQL 資料結構 (用於 Feed)

**Redis - Feed 快取**:
```
Key: feed:user:{user_id}
Type: Sorted Set
Value: {tweet_id: timestamp}
TTL: 24 hours

ZADD feed:user:123 1696598400 tweet:987654321
ZADD feed:user:123 1696598300 tweet:987654320
```

**Cassandra - Tweet 儲存**:
```
CREATE TABLE tweets_by_user (
    user_id bigint,
    tweet_id bigint,
    content text,
    created_at timestamp,
    PRIMARY KEY (user_id, created_at, tweet_id)
) WITH CLUSTERING ORDER BY (created_at DESC);
```

### 5. 核心架構設計

#### 5.1 高層架構圖

```
                         ┌─────────────┐
                         │   Client    │
                         │ (Web/Mobile)│
                         └──────┬──────┘
                                │
                         ┌──────▼──────┐
                         │   CDN       │
                         │  (靜態資源)  │
                         └─────────────┘
                                │
                    ┌───────────▼────────────┐
                    │   Load Balancer        │
                    │   (Nginx/ALB)          │
                    └───┬──────────────┬─────┘
                        │              │
            ┌───────────▼──┐      ┌───▼──────────┐
            │  API Gateway │      │  WebSocket   │
            │              │      │   Server     │
            └───┬──────────┘      └──────────────┘
                │
    ┌───────────┼────────────┬─────────────┐
    │           │            │             │
┌───▼────┐  ┌──▼─────┐  ┌───▼────┐   ┌───▼────┐
│ Tweet  │  │ Feed   │  │ User   │   │ Media  │
│Service │  │Service │  │Service │   │Service │
└───┬────┘  └───┬────┘  └───┬────┘   └───┬────┘
    │           │           │            │
    │      ┌────▼────┐      │            │
    │      │  Redis  │      │            │
    │      │(Feed快取)│      │            │
    │      └────┬────┘      │            │
    │           │           │            │
┌───▼───────────▼───────────▼────────────▼────┐
│            Message Queue (Kafka)             │
│  - tweet.created                             │
│  - user.followed                             │
└───┬──────────────┬──────────────┬───────────┘
    │              │              │
┌───▼────┐    ┌────▼────┐    ┌───▼────┐
│ Feed   │    │ Notif   │    │ Search │
│Fanout  │    │Worker   │    │Indexer │
│Worker  │    └─────────┘    └────────┘
└───┬────┘
    │
┌───▼──────────────────────────────┐
│      Database Layer              │
│  ┌────────┐  ┌────────┐         │
│  │ MySQL  │  │Cassandra│         │
│  │(關係)   │  │(Tweets) │         │
│  └────────┘  └────────┘         │
└──────────────────────────────────┘
```

#### 5.2 核心組件說明

**1. Tweet Service (發文服務)**:
- 處理發文請求
- 驗證內容(長度、敏感詞)
- 寫入資料庫
- 發送訊息到 Kafka

**2. Feed Service (動態服務)**:
- 處理 feed 查詢請求
- 優先從 Redis 快取讀取
- 快取未命中時從資料庫查詢
- 支援分頁和游標

**3. User Service (使用者服務)**:
- 處理使用者註冊、登入
- 管理關注/取消關注
- 更新使用者資訊

**4. Feed Fanout Worker (動態分發工作者)**:
- 監聽 Kafka 的 tweet.created 事件
- 將新貼文推送到關注者的 feed 快取
- 使用 Push 或 Pull 模式

### 6. Feed 生成策略 (核心難點)

#### 6.1 Push 模式 (Fanout-on-Write)

**原理**: 當使用者發文時,立即將貼文推送到所有關注者的 feed 快取中。

**實現**:
```go
// 發文後觸發
func FanoutTweetToFollowers(tweetID int64, authorID int64) {
    // 1. 獲取所有關注者
    followers := GetFollowers(authorID)
    
    // 2. 批次推送到每個關注者的 feed
    for _, followerID := range followers {
        // 寫入 Redis: feed:user:{followerID}
        redis.ZAdd(
            fmt.Sprintf("feed:user:%d", followerID),
            tweetID,
            time.Now().Unix(),
        )
    }
}
```

**優點**:
- ✅ 讀取速度快(預先計算好)
- ✅ 讀取壓力小

**缺點**:
- ❌ 寫入壓力大(關注者多時)
- ❌ 對熱門使用者不友善(數百萬關注者)

**適用場景**: 普通使用者(關注者 < 10,000)

#### 6.2 Pull 模式 (Fanout-on-Read)

**原理**: 使用者查詢 feed 時,實時從關注的使用者中拉取最新貼文。

**實現**:
```go
// 查詢 feed 時執行
func GetUserFeed(userID int64, limit int) []Tweet {
    // 1. 獲取關注列表
    followings := GetFollowings(userID)
    
    // 2. 從每個關注者拉取最新貼文
    tweets := []Tweet{}
    for _, followeeID := range followings {
        userTweets := GetUserTweets(followeeID, limit)
        tweets = append(tweets, userTweets...)
    }
    
    // 3. 合併排序(按時間戳)
    sort.Slice(tweets, func(i, j int) bool {
        return tweets[i].CreatedAt > tweets[j].CreatedAt
    })
    
    return tweets[:limit]
}
```

**優點**:
- ✅ 寫入快速(只寫自己的 timeline)
- ✅ 適合熱門使用者

**缺點**:
- ❌ 讀取慢(需要實時聚合)
- ❌ 讀取壓力大

**適用場景**: 熱門使用者(關注者 > 10,000)

#### 6.3 混合模式 (Hybrid) - Twitter 實際使用

**策略**: 根據使用者類型選擇不同模式。

```go
func GenerateFeed(userID int64, limit int) []Tweet {
    tweets := []Tweet{}
    
    // 1. 獲取關注列表
    followings := GetFollowings(userID)
    
    // 2. 分類處理
    normalUsers := []int64{}
    celebrities := []int64{}
    
    for _, followeeID := range followings {
        if IsCelebrity(followeeID) { // 關注者 > 1M
            celebrities = append(celebrities, followeeID)
        } else {
            normalUsers = append(normalUsers, followeeID)
        }
    }
    
    // 3. 普通使用者使用 Push 模式(從快取讀取)
    cachedTweets := redis.ZRevRange(
        fmt.Sprintf("feed:user:%d", userID),
        0,
        limit,
    )
    tweets = append(tweets, cachedTweets...)
    
    // 4. 熱門使用者使用 Pull 模式(實時拉取)
    for _, celebrityID := range celebrities {
        recentTweets := GetUserRecentTweets(celebrityID, 10)
        tweets = append(tweets, recentTweets...)
    }
    
    // 5. 合併排序
    sort.Slice(tweets, func(i, j int) bool {
        return tweets[i].CreatedAt > tweets[j].CreatedAt
    })
    
    return tweets[:limit]
}
```

**優勢**:
- ✅ 兼顧讀寫效能
- ✅ 可擴展性強
- ✅ 成本優化

### 7. 資料分片策略

#### 7.1 Users 表分片

**分片鍵**: `user_id`

```
Shard 0: user_id % 16 == 0
Shard 1: user_id % 16 == 1
...
Shard 15: user_id % 16 == 15
```

**路由邏輯**:
```go
func GetUserShard(userID int64) int {
    return int(userID % 16)
}

func QueryUser(userID int64) User {
    shardID := GetUserShard(userID)
    db := GetDBConnection(shardID)
    return db.Query("SELECT * FROM users WHERE user_id = ?", userID)
}
```

#### 7.2 Tweets 表分片

**方案 1: 按 user_id 分片**

```
優點: 查詢使用者 timeline 快速
缺點: 查詢 feed 需要跨分片
```

**方案 2: 按 tweet_id 分片**

```
優點: 貼文分佈均勻
缺點: 查詢使用者 timeline 需要跨分片
```

**推薦方案**: 按 `user_id` 分片 + Cassandra 存儲

```
CREATE TABLE tweets_by_user (
    user_id bigint,
    created_at timestamp,
    tweet_id bigint,
    content text,
    PRIMARY KEY (user_id, created_at, tweet_id)
) WITH CLUSTERING ORDER BY (created_at DESC);
```

#### 7.3 Relationships 表分片

**方案**: 雙向分片

```sql
-- 按 follower_id 分片(查詢我關注誰)
CREATE TABLE following (
    follower_id BIGINT,
    followee_id BIGINT,
    created_at TIMESTAMP,
    PRIMARY KEY (follower_id, followee_id)
);

-- 按 followee_id 分片(查詢誰關注我)
CREATE TABLE followers (
    followee_id BIGINT,
    follower_id BIGINT,
    created_at TIMESTAMP,
    PRIMARY KEY (followee_id, follower_id)
);
```

### 8. 快取策略

#### 8.1 多級快取架構

```
Client
  ↓
CDN Cache (靜態資源、使用者頭像)
  ↓
Redis Cluster (Feed、熱門貼文、使用者資訊)
  ↓
Application Cache (本地快取)
  ↓
Database
```

#### 8.2 Feed 快取設計

**Redis Sorted Set**:
```
Key: feed:user:{user_id}
Score: timestamp
Member: tweet_id

# 儲存最近 1000 條貼文
ZADD feed:user:123 1696598400 tweet:987654321
ZREVRANGE feed:user:123 0 19  # 獲取最新 20 條
```

**快取更新策略**:
- **TTL**: 24 小時
- **大小限制**: 每個使用者最多 1000 條
- **LRU 淘汰**: 記憶體不足時淘汰最久未使用

#### 8.3 熱門貼文快取

```
Key: tweet:{tweet_id}
Value: {
  "tweet_id": 123,
  "user_id": 456,
  "content": "...",
  "likes": 1000,
  "created_at": "..."
}
TTL: 1 hour
```

### 9. 擴展性優化

#### 9.1 讀取優化

**1. CDN 加速**:
- 靜態資源(圖片、影片)
- 使用者頭像
- 減少源站壓力

**2. 快取預熱**:
```go
// 登入時預熱 feed
func WarmupFeedOnLogin(userID int64) {
    go func() {
        // 非同步生成 feed 並寫入快取
        feed := GenerateFeed(userID, 100)
        CacheFeed(userID, feed)
    }()
}
```

**3. 讀寫分離**:
```
Master DB (寫入)
   ↓ 複製
Slave DB 1 (讀取)
Slave DB 2 (讀取)
Slave DB 3 (讀取)
```

#### 9.2 寫入優化

**1. 非同步處理**:
```go
func CreateTweet(tweet Tweet) error {
    // 1. 同步寫入資料庫
    err := db.Insert(tweet)
    if err != nil {
        return err
    }
    
    // 2. 非同步 fanout
    kafka.Publish("tweet.created", tweet)
    
    return nil
}
```

**2. 批次寫入**:
```go
// Feed Fanout Worker
func BatchFanoutWorker() {
    buffer := []FanoutTask{}
    ticker := time.NewTicker(100 * time.Millisecond)
    
    for {
        select {
        case task := <-fanoutQueue:
            buffer = append(buffer, task)
            
            if len(buffer) >= 1000 {
                BatchWriteToRedis(buffer)
                buffer = buffer[:0]
            }
            
        case <-ticker.C:
            if len(buffer) > 0 {
                BatchWriteToRedis(buffer)
                buffer = buffer[:0]
            }
        }
    }
}
```

**3. 削峰填谷**:
- 使用 Kafka 作為緩衝
- 控制 Worker 消費速率
- 避免資料庫和快取過載

### 10. 高可用性設計

#### 10.1 容錯機制

**1. 服務降級**:
```go
func GetUserFeed(userID int64) ([]Tweet, error) {
    // 1. 嘗試從快取讀取
    feed, err := GetFeedFromCache(userID)
    if err == nil {
        return feed, nil
    }
    
    // 2. 快取失敗,嘗試從資料庫讀取
    feed, err = GetFeedFromDB(userID)
    if err == nil {
        return feed, nil
    }
    
    // 3. 資料庫也失敗,返回空 feed(降級)
    log.Error("Failed to get feed", err)
    return []Tweet{}, nil  // 不影響使用者體驗
}
```

**2. 熔斷器**:
```go
breaker := gobreaker.NewCircuitBreaker(gobreaker.Settings{
    Name:        "FeedService",
    MaxRequests: 3,
    Interval:    time.Second * 60,
    Timeout:     time.Second * 30,
})

func GetFeedWithCircuitBreaker(userID int64) ([]Tweet, error) {
    result, err := breaker.Execute(func() (interface{}, error) {
        return GetUserFeed(userID)
    })
    
    if err != nil {
        return GetCachedFeedOrEmpty(userID), nil
    }
    
    return result.([]Tweet), nil
}
```

#### 10.2 災難恢復

**1. 資料庫備份**:
```
- 每日全量備份
- 每小時增量備份
- 跨區域備份
```

**2. Redis 持久化**:
```
# RDB: 定期快照
save 900 1
save 300 10
save 60 10000

# AOF: 操作日誌
appendonly yes
appendfsync everysec
```

### 11. 監控與告警

#### 11.1 關鍵指標

**業務指標**:
- 發文 QPS
- Feed 查詢 QPS
- 平均回應時間(P50, P95, P99)
- 錯誤率

**系統指標**:
- CPU 使用率
- 記憶體使用率
- 磁碟 I/O
- 網路頻寬

**資料庫指標**:
- 連線數
- 慢查詢
- 複製延遲

#### 11.2 告警設置

```yaml
alerts:
  - name: HighErrorRate
    condition: error_rate > 1%
    duration: 5m
    severity: critical
    
  - name: HighLatency
    condition: p99_latency > 1s
    duration: 10m
    severity: warning
    
  - name: DatabaseReplicationLag
    condition: replication_lag > 10s
    duration: 5m
    severity: critical
```

## 常見面試考點

### Q1:如何處理熱門使用者(數百萬關注者)的發文?

**答案**:

熱門使用者的發文會導致 **Fanout 風暴**,需要特殊處理:

**問題**:
- 某明星有 1000 萬關注者
- 發一條貼文需要寫入 1000 萬個使用者的 feed
- 寫入時間過長,系統壓力巨大

**解決方案**:

**1. 混合模式** (推薦):
```
普通使用者: Push 模式(預先計算)
熱門使用者: Pull 模式(實時拉取)

判斷標準: 關注者 > 100 萬即為熱門使用者
```

**2. 不完全 Fanout**:
```
只推送給活躍關注者(近 7 天有登入)
其他使用者登入時再實時拉取
```

**3. 非同步 Fanout + 限速**:
```go
func FanoutWithRateLimit(tweetID int64, followers []int64) {
    limiter := rate.NewLimiter(10000, 10000) // 每秒 10k 次
    
    for _, followerID := range followers {
        limiter.Wait(context.Background())
        go WriteFeedToCache(followerID, tweetID)
    }
}
```

**4. 分批 Fanout**:
```
將 1000 萬關注者分成 1000 批
每批 10000 人
使用 Kafka 分批處理
總耗時控制在 10 分鐘內
```

**實際案例**:
- Twitter: 混合模式
- Instagram: 不完全 Fanout + 實時拉取
- 微博: 分層 Feed(好友 + 關注 + 推薦)

### Q2:如何實現高效的 Timeline 合併排序?

**答案**:

查詢 feed 時需要從多個關注者的 timeline 中合併排序,這是效能瓶頸。

**問題**:
```
使用者關注 200 人
需要從 200 個 timeline 中各取前 N 條
合併排序後返回最新 20 條
```

**優化方案**:

**1. 優先從快取讀取**:
```go
func GetUserFeed(userID int64, limit int) []Tweet {
    // 1. 優先從 Redis 快取讀取
    cached := redis.ZRevRange(
        fmt.Sprintf("feed:user:%d", userID),
        0,
        limit-1,
    )
    
    if len(cached) >= limit {
        return cached  // 快取命中
    }
    
    // 2. 快取未命中,實時生成
    return GenerateFeedFromDB(userID, limit)
}
```

**2. K-路歸併演算法**:
```go
func MergeKTimelines(timelines [][]Tweet, k int) []Tweet {
    // 使用最小堆合併 K 個有序陣列
    heap := &TweetHeap{}
    heap.Init()
    
    // 初始化:每個 timeline 的第一條貼文入堆
    for i, timeline := range timelines {
        if len(timeline) > 0 {
            heap.Push(&HeapNode{
                tweet:     timeline[0],
                timelineID: i,
                index:      0,
            })
        }
    }
    
    result := []Tweet{}
    
    // 依次取出最大值
    for heap.Len() > 0 && len(result) < k {
        node := heap.Pop().(*HeapNode)
        result = append(result, node.tweet)
        
        // 如果該 timeline 還有下一條,加入堆
        nextIndex := node.index + 1
        if nextIndex < len(timelines[node.timelineID]) {
            heap.Push(&HeapNode{
                tweet:      timelines[node.timelineID][nextIndex],
                timelineID: node.timelineID,
                index:      nextIndex,
            })
        }
    }
    
    return result
}

// 時間複雜度: O(K * log N)
// K = 返回條數, N = 關注人數
```

**3. 並行查詢**:
```go
func ParallelFetchTimelines(followings []int64, limit int) [][]Tweet {
    results := make([][]Tweet, len(followings))
    var wg sync.WaitGroup
    
    for i, followeeID := range followings {
        wg.Add(1)
        go func(i int, followeeID int64) {
            defer wg.Done()
            results[i] = GetUserTimeline(followeeID, limit)
        }(i, followeeID)
    }
    
    wg.Wait()
    return results
}
```

**4. 智慧取數策略**:
```
不是從每個人取 N 條,而是:
- 活躍使用者: 取 20 條
- 不活躍使用者: 取 5 條
- 殭屍使用者: 不取

減少無效查詢
```

### Q3:如何設計關注/取消關注功能?需要考慮哪些問題?

**答案**:

關注功能看似簡單,但涉及多個資料一致性問題。

**資料庫設計**:

```sql
-- 雙向索引表
CREATE TABLE following (
    follower_id BIGINT,
    followee_id BIGINT,
    created_at TIMESTAMP,
    PRIMARY KEY (follower_id, followee_id),
    INDEX idx_followee (followee_id)
);
```

**關注操作**:

```go
func Follow(followerID, followeeID int64) error {
    // 1. 開始事務
    tx := db.Begin()
    
    // 2. 插入關注關係
    err := tx.Exec(
        "INSERT INTO following (follower_id, followee_id) VALUES (?, ?)",
        followerID, followeeID,
    )
    if err != nil {
        tx.Rollback()
        return err
    }
    
    // 3. 更新計數
    tx.Exec(
        "UPDATE users SET following_count = following_count + 1 WHERE user_id = ?",
        followerID,
    )
    tx.Exec(
        "UPDATE users SET followers_count = followers_count + 1 WHERE user_id = ?",
        followeeID,
    )
    
    // 4. 提交事務
    tx.Commit()
    
    // 5. 非同步更新 feed(將被關注者的最近貼文加入 follower 的 feed)
    kafka.Publish("user.followed", FollowEvent{
        FollowerID: followerID,
        FolloweeID: followeeID,
    })
    
    return nil
}
```

**需要考慮的問題**:

**1. 互相關注**:
```sql
-- 查詢是否互相關注
SELECT COUNT(*) 
FROM following 
WHERE (follower_id = ? AND followee_id = ?)
   OR (follower_id = ? AND followee_id = ?)
```

**2. 關注上限**:
```go
func Follow(followerID, followeeID int64) error {
    // 檢查關注數上限(如 5000)
    count := GetFollowingCount(followerID)
    if count >= 5000 {
        return errors.New("following limit exceeded")
    }
    // ...
}
```

**3. 防止重複關注**:
```sql
INSERT IGNORE INTO following (follower_id, followee_id) 
VALUES (?, ?);
```

**4. Feed 初始化**:
```go
// 關注後,將被關注者最近 100 條貼文加入 follower feed
func InitFeedAfterFollow(followerID, followeeID int64) {
    recentTweets := GetUserRecentTweets(followeeID, 100)
    for _, tweet := range recentTweets {
        redis.ZAdd(
            fmt.Sprintf("feed:user:%d", followerID),
            tweet.ID,
            tweet.CreatedAt.Unix(),
        )
    }
}
```

**5. 取消關注後的 Feed 清理**:
```go
func Unfollow(followerID, followeeID int64) error {
    // 1. 刪除關注關係
    db.Exec("DELETE FROM following WHERE follower_id = ? AND followee_id = ?",
        followerID, followeeID)
    
    // 2. 更新計數
    // ...
    
    // 3. 從 feed 中移除該使用者的貼文(可選,成本較高)
    // 或者等快取過期自然刷新
    
    return nil
}
```

### Q4:如何實現 Twitter 的 @mention 和 #hashtag 功能?

**答案**:

**@Mention 實現**:

**1. 資料模型**:
```sql
CREATE TABLE mentions (
    tweet_id BIGINT,
    mentioned_user_id BIGINT,
    PRIMARY KEY (tweet_id, mentioned_user_id),
    INDEX idx_mentioned_user (mentioned_user_id, tweet_id)
);
```

**2. 發文時提取 mention**:
```go
func ExtractMentions(content string) []string {
    // 正則提取 @username
    re := regexp.MustCompile(`@(\w+)`)
    matches := re.FindAllStringSubmatch(content, -1)
    
    usernames := []string{}
    for _, match := range matches {
        usernames = append(usernames, match[1])
    }
    return usernames
}

func CreateTweetWithMentions(tweet Tweet) error {
    // 1. 儲存貼文
    db.Insert(tweet)
    
    // 2. 提取並儲存 mentions
    usernames := ExtractMentions(tweet.Content)
    for _, username := range usernames {
        userID := GetUserIDByUsername(username)
        if userID > 0 {
            db.Insert(Mention{
                TweetID:         tweet.ID,
                MentionedUserID: userID,
            })
            
            // 3. 發送通知
            SendNotification(userID, "mention", tweet.ID)
        }
    }
    
    return nil
}
```

**#Hashtag 實現**:

**1. 資料模型**:
```sql
CREATE TABLE hashtags (
    hashtag_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tag VARCHAR(100) UNIQUE,
    tweet_count INT DEFAULT 0
);

CREATE TABLE tweet_hashtags (
    tweet_id BIGINT,
    hashtag_id BIGINT,
    PRIMARY KEY (tweet_id, hashtag_id),
    INDEX idx_hashtag (hashtag_id, tweet_id)
);
```

**2. 發文時提取 hashtag**:
```go
func ExtractHashtags(content string) []string {
    re := regexp.MustCompile(`#(\w+)`)
    matches := re.FindAllStringSubmatch(content, -1)
    
    tags := []string{}
    for _, match := range matches {
        tags = append(tags, match[1])
    }
    return tags
}

func CreateTweetWithHashtags(tweet Tweet) error {
    db.Insert(tweet)
    
    tags := ExtractHashtags(tweet.Content)
    for _, tag := range tags {
        // 獲取或建立 hashtag
        hashtagID := GetOrCreateHashtag(tag)
        
        // 關聯貼文和 hashtag
        db.Insert(TweetHashtag{
            TweetID:   tweet.ID,
            HashtagID: hashtagID,
        })
        
        // 更新計數
        db.Exec(
            "UPDATE hashtags SET tweet_count = tweet_count + 1 WHERE hashtag_id = ?",
            hashtagID,
        )
    }
    
    return nil
}
```

**3. 查詢 hashtag 下的貼文**:
```go
func GetTweetsByHashtag(tag string, limit int) []Tweet {
    // 1. 獲取 hashtag ID
    hashtag := db.QueryOne(
        "SELECT hashtag_id FROM hashtags WHERE tag = ?",
        tag,
    )
    
    // 2. 查詢相關貼文
    tweetIDs := db.Query(
        "SELECT tweet_id FROM tweet_hashtags WHERE hashtag_id = ? ORDER BY tweet_id DESC LIMIT ?",
        hashtag.ID, limit,
    )
    
    // 3. 批次查詢貼文詳情
    return GetTweetsByIDs(tweetIDs)
}
```

**4. 熱門 hashtag(Trending)**:
```go
// 使用 Redis Sorted Set 追蹤熱度
func TrackHashtagTrend(tag string) {
    key := fmt.Sprintf("trending:hashtag:%s", time.Now().Format("2006-01-02"))
    redis.ZIncrBy(key, 1, tag)
    redis.Expire(key, 7*24*time.Hour)
}

func GetTrendingHashtags(limit int) []string {
    key := fmt.Sprintf("trending:hashtag:%s", time.Now().Format("2006-01-02"))
    return redis.ZRevRange(key, 0, limit-1)
}
```

### Q5:如何優化大量並行讀取的效能?

**答案**:

Twitter 的 feed 查詢是典型的高並行讀取場景,優化策略:

**1. 多級快取**:
```
Browser Cache (客戶端)
   ↓
CDN Cache (邊緣節點)
   ↓
Redis Cache (集中式快取)
   ↓
Local Cache (應用程式記憶體)
   ↓
Database
```

**2. 快取預熱**:
```go
// 使用者登入時預先載入 feed
func OnUserLogin(userID int64) {
    go func() {
        feed := GenerateFeed(userID, 100)
        CacheFeed(userID, feed)
    }()
}
```

**3. 讀寫分離**:
```
Master: 處理寫入
Slaves: 處理讀取(多個從庫分擔壓力)
```

**4. 連線池**:
```go
// Redis 連線池
redisPool := &redis.Pool{
    MaxIdle:     100,
    MaxActive:   10000,
    IdleTimeout: 240 * time.Second,
    Dial: func() (redis.Conn, error) {
        return redis.Dial("tcp", redisAddr)
    },
}
```

**5. 批次查詢**:
```go
// 批次查詢貼文詳情
func GetTweetsByIDs(tweetIDs []int64) []Tweet {
    // 使用 IN 查詢而非多次單獨查詢
    sql := "SELECT * FROM tweets WHERE tweet_id IN (?)"
    return db.Query(sql, tweetIDs)
}
```

**6. 非同步載入**:
```
首次返回: 快取的 20 條貼文
背景載入: 接下來的 80 條貼文
預先準備: 下一頁的內容
```

**7. 降級策略**:
```go
func GetFeedWithFallback(userID int64) []Tweet {
    // Level 1: Redis 快取
    feed, err := GetFromRedis(userID)
    if err == nil {
        return feed
    }
    
    // Level 2: 資料庫
    feed, err = GetFromDB(userID)
    if err == nil {
        return feed
    }
    
    // Level 3: 返回熱門貼文(降級)
    return GetTrendingTweets(20)
}
```

**效能指標**:
- P99 延遲 < 200ms
- QPS > 100,000
- 快取命中率 > 95%

## 總結

設計類 Twitter 的社交平台是系統設計面試的經典題目,涵蓋了分散式系統的核心概念:

**核心挑戰**:
1. **Feed 生成**: Push vs Pull vs Hybrid
2. **資料分片**: 使用者、貼文、關係的分片策略
3. **快取設計**: 多級快取、快取更新、快取失效
4. **高並行**: 數十萬 QPS 的讀取壓力
5. **一致性**: 最終一致性 vs 強一致性的權衡

**關鍵技術**:
- **Kafka**: 非同步處理、削峰填谷
- **Redis**: Feed 快取、計數器、熱門內容
- **Cassandra**: 高寫入吞吐量的 timeline 儲存
- **CDN**: 靜態資源加速
- **負載均衡**: 流量分發

**設計原則**:
- 讀寫分離
- 非同步處理
- 最終一致性
- 優雅降級
- 水平擴展

掌握這個案例的設計思路,可以應對大部分社交類、內容類系統的設計問題。
