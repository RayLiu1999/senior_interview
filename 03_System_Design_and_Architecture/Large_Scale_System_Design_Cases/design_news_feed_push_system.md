# 如何設計新聞推送系統?

- **難度**: 8
- **重要程度**: 5
- **標籤**: `系統設計`, `推送系統`, `個性化推薦`, `使用者分群`

## 問題詳述

設計一個新聞推送系統,支援向數百萬使用者推送個性化新聞內容。系統需要根據使用者興趣進行內容推薦,支援多種推送管道(App Push、簡訊、Email),並控制推送頻率避免打擾使用者。

## 核心理論與詳解

### 1. 新聞推送系統的特點

#### 1.1 業務特點

**大規模使用者**:
```
日活使用者: 1 億
訂閱使用者: 5000 萬
每日推送: 2 億次
```

**個性化內容**:
```
使用者興趣不同
內容類型多樣(新聞、體育、財經、娛樂)
需要精準推薦
```

**多管道推送**:
```
App Push 通知
SMS 簡訊
Email 郵件
Web Push
```

**推送時機敏感**:
```
突發新聞: 即時推送
定時推送: 早 8 點、晚 8 點
個性化推送: 使用者活躍時段
```

#### 1.2 技術挑戰

**1. 推送規模**:
- 5000 萬訂閱使用者
- 高峰期 100 萬次/分鐘

**2. 個性化推薦**:
- 使用者興趣建模
- 內容相似度計算
- 即時推薦

**3. 推送頻率控制**:
- 避免過度打擾
- 疲勞度管理
- 靜默時段

**4. 多管道協調**:
- 管道優先級
- 到達率監控
- 失敗重試

### 2. 需求澄清

#### 2.1 功能性需求

**核心功能**:
- ✅ 使用者訂閱感興趣的新聞分類
- ✅ 根據使用者興趣推送個性化內容
- ✅ 支援多管道推送(App、SMS、Email)
- ✅ 使用者可設定推送偏好(頻率、時間)

**延伸功能**:
- 突發新聞即時推送
- 推送效果追蹤(點擊率、轉化率)
- A/B 測試
- 使用者疲勞度管理

#### 2.2 非功能性需求

**效能**:
- 推送延遲 < 1 分鐘
- 支援 100 萬推送/分鐘
- 點擊率 > 5%

**可用性**:
- 系統可用性 99.9%+
- 推送失敗自動重試

**可擴展性**:
- 支援水平擴展
- 輕鬆新增推送管道

### 3. 容量估算

#### 3.1 流量估算

**假設**:
- 日活使用者(DAU): 1 億
- 訂閱使用者: 5000 萬(50%)
- 每日人均推送: 4 次
- 推送高峰: 早 8 點、晚 8 點

**計算**:
```
每日推送總量:
5000 萬 × 4 = 2 億次

平均 QPS:
2 億 / (24 × 3600) ≈ 2,300 次/秒

高峰 QPS(高峰 1 小時推送 30%):
2 億 × 0.3 / 3600 ≈ 16,600 次/秒

推送系統寫入 QPS: ~17,000
```

#### 3.2 儲存估算

**使用者興趣標籤**:
```
使用者數: 1 億
每人標籤數: 50 個
每個標籤: 8 bytes (tag_id)
總計: 1 億 × 50 × 8 = 40 GB
```

**新聞內容**:
```
每日新增新聞: 10 萬篇
每篇大小: 10 KB (標題、摘要、圖片 URL)
保留 30 天: 10 萬 × 10 KB × 30 = 30 GB
```

**推送記錄**:
```
每日推送: 2 億次
每條記錄: 100 bytes (user_id, news_id, status, timestamp)
保留 90 天: 2 億 × 100 bytes × 90 = 1.8 TB
```

### 4. 核心架構設計

#### 4.1 整體架構圖

```
┌─────────────────────────────────────────────────┐
│              News Publishing System             │
│   (編輯發佈新聞、打標籤、設定推送策略)           │
└──────────────────┬──────────────────────────────┘
                   │
            ┌──────▼──────┐
            │ News Queue  │
            │   (Kafka)   │
            └──────┬──────┘
                   │
       ┌───────────┼───────────┐
       │           │           │
   ┌───▼───┐  ┌───▼───┐  ┌───▼───┐
   │Content│  │Content│  │Content│
   │ Tag   │  │ Tag   │  │ Tag   │
   │Worker │  │Worker │  │Worker │
   └───┬───┘  └───┬───┘  └───┬───┘
       │          │          │
       └──────────┼──────────┘
                  │
         ┌────────▼─────────┐
         │  Recommendation  │
         │     Engine       │
         │  (使用者興趣匹配) │
         └────────┬─────────┘
                  │
         ┌────────▼─────────┐
         │   User Segment   │
         │  (使用者分群)     │
         └────────┬─────────┘
                  │
       ┌──────────┼──────────┐
       │          │          │
   ┌───▼────┐ ┌──▼─────┐ ┌──▼─────┐
   │ Push   │ │ SMS    │ │ Email  │
   │Service │ │Service │ │Service │
   └───┬────┘ └──┬─────┘ └──┬─────┘
       │         │          │
   ┌───▼────┐ ┌──▼─────┐ ┌──▼─────┐
   │Firebase│ │ Twilio │ │SendGrid│
   │  FCM   │ │        │ │        │
   └───┬────┘ └──┬─────┘ └──┬─────┘
       │         │          │
       └─────────┼──────────┘
                 │
         ┌───────▼────────┐
         │   Users        │
         │ (1 億使用者)    │
         └────────────────┘

[儲存層]
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Redis      │  │   MongoDB    │  │  PostgreSQL  │
│ (使用者偏好)  │  │ (新聞內容)    │  │ (推送記錄)   │
│ (興趣標籤)    │  │ (標籤索引)    │  │ (統計資料)   │
└──────────────┘  └──────────────┘  └──────────────┘
```

#### 4.2 核心組件

**1. 內容標籤 Worker**:
- 自動提取新聞關鍵字
- 分類(體育、財經、科技等)
- 相似內容去重

**2. 推薦引擎**:
- 使用者興趣建模
- 內容相似度計算
- 個性化推薦

**3. 使用者分群服務**:
- 按興趣分群
- 按活躍度分群
- 按地理位置分群

**4. 推送服務**:
- 多管道推送
- 頻率控制
- 失敗重試

### 5. 使用者興趣建模 (核心難點)

#### 5.1 興趣標籤採集

**1. 顯性行為**:
```go
// 使用者訂閱主題
func Subscribe(userID int64, tags []string) {
    for _, tag := range tags {
        // 權重: 10 分
        redis.ZIncrBy("user:interests:" + userID, 10, tag)
    }
}

// 使用者點擊新聞
func Click(userID int64, newsID int64) {
    news := GetNews(newsID)
    
    for _, tag := range news.Tags {
        // 權重: 1 分
        redis.ZIncrBy("user:interests:" + userID, 1, tag)
    }
}

// 使用者分享新聞
func Share(userID int64, newsID int64) {
    news := GetNews(newsID)
    
    for _, tag := range news.Tags {
        // 權重: 5 分
        redis.ZIncrBy("user:interests:" + userID, 5, tag)
    }
}
```

**2. 隱性行為**:
```go
// 閱讀時長
func TrackReadTime(userID int64, newsID int64, duration int) {
    news := GetNews(newsID)
    
    // 閱讀超過 30 秒視為感興趣
    if duration > 30 {
        for _, tag := range news.Tags {
            // 權重: 2 分
            redis.ZIncrBy("user:interests:" + userID, 2, tag)
        }
    }
}

// 滑動瀏覽(未點擊)
func View(userID int64, newsID int64) {
    news := GetNews(newsID)
    
    for _, tag := range news.Tags {
        // 權重: 0.1 分(輕微興趣)
        redis.ZIncrBy("user:interests:" + userID, 0.1, tag)
    }
}
```

#### 5.2 興趣標籤儲存

**Redis Sorted Set**:
```
Key: user:interests:{user_id}
Score: 興趣權重
Member: 標籤 ID

示例:
ZADD user:interests:123 50 "sports"
ZADD user:interests:123 30 "tech"
ZADD user:interests:123 20 "finance"
```

**獲取使用者 Top 興趣**:
```go
func GetTopInterests(userID int64, limit int) []string {
    key := fmt.Sprintf("user:interests:%d", userID)
    
    // 獲取分數最高的 N 個標籤
    result := redis.ZRevRange(key, 0, limit-1).Val()
    
    return result
}
```

#### 5.3 興趣衰減

**問題**: 使用者興趣隨時間變化。

**解決方案: 時間衰減**

```go
func DecayInterests() {
    ticker := time.NewTicker(24 * time.Hour)
    
    for range ticker.C {
        // 每天衰減 1%
        users := GetAllUsers()
        
        for _, userID := range users {
            key := fmt.Sprintf("user:interests:%d", userID)
            
            // 獲取所有標籤
            tags := redis.ZRangeWithScores(key, 0, -1).Val()
            
            for _, tag := range tags {
                // 分數 × 0.99
                newScore := tag.Score * 0.99
                
                // 低於 1 分則移除
                if newScore < 1 {
                    redis.ZRem(key, tag.Member)
                } else {
                    redis.ZAdd(key, &redis.Z{
                        Score:  newScore,
                        Member: tag.Member,
                    })
                }
            }
        }
    }
}
```

### 6. 內容推薦演算法

#### 6.1 協同過濾

**使用者相似度**:
```
使用者 A 興趣: [科技, 財經, 體育]
使用者 B 興趣: [科技, 娛樂, 體育]

餘弦相似度:
sim(A, B) = (科技 + 體育) / sqrt(3 * 3) = 0.67

推薦邏輯:
如果 A 和 B 相似,B 喜歡的新聞也推薦給 A
```

**實現**:
```go
func FindSimilarUsers(userID int64, limit int) []int64 {
    // 1. 獲取使用者興趣向量
    userTags := GetTopInterests(userID, 20)
    
    // 2. 查詢相似使用者(預先計算)
    key := fmt.Sprintf("user:similar:%d", userID)
    similarUsers := redis.ZRevRange(key, 0, limit-1).Val()
    
    return similarUsers
}

func RecommendByCollaborative(userID int64) []int64 {
    // 1. 找到相似使用者
    similarUsers := FindSimilarUsers(userID, 10)
    
    // 2. 聚合他們最近閱讀的新聞
    newsScores := make(map[int64]float64)
    
    for _, similarUserID := range similarUsers {
        recentNews := GetRecentReadNews(similarUserID, 20)
        
        for _, newsID := range recentNews {
            newsScores[newsID] += 1.0
        }
    }
    
    // 3. 排序返回 Top N
    return TopNewsByScore(newsScores, 10)
}
```

#### 6.2 基於內容推薦

**標籤匹配**:
```go
func RecommendByContent(userID int64) []int64 {
    // 1. 獲取使用者興趣標籤
    userTags := GetTopInterests(userID, 10)
    
    // 2. 查詢包含這些標籤的最新新聞
    newsIDs := []int64{}
    
    for _, tag := range userTags {
        // MongoDB 索引查詢
        news := mongo.Find(bson.M{
            "tags":       tag,
            "created_at": bson.M{"$gte": time.Now().Add(-24 * time.Hour)},
        }).Sort("-created_at").Limit(20)
        
        newsIDs = append(newsIDs, news...)
    }
    
    // 3. 去重排序
    return DeduplicateAndSort(newsIDs)
}
```

#### 6.3 混合推薦

```go
func HybridRecommend(userID int64) []int64 {
    // 1. 協同過濾推薦 (50%)
    collaborative := RecommendByCollaborative(userID)
    
    // 2. 基於內容推薦 (40%)
    content := RecommendByContent(userID)
    
    // 3. 熱門新聞 (10%)
    trending := GetTrendingNews(10)
    
    // 4. 混合
    result := []int64{}
    result = append(result, collaborative[:5]...)
    result = append(result, content[:4]...)
    result = append(result, trending[:1]...)
    
    return Deduplicate(result)
}
```

### 7. 使用者分群策略

#### 7.1 按興趣分群

**實現**:
```go
func SegmentByInterest(newsID int64) []int64 {
    news := GetNews(newsID)
    
    // 新聞標籤: ["科技", "AI"]
    users := []int64{}
    
    for _, tag := range news.Tags {
        // 獲取對該標籤感興趣的使用者
        // Redis Set: tag:users:{tag} = {user1, user2, ...}
        tagUsers := redis.SMembers("tag:users:" + tag).Val()
        users = append(users, tagUsers...)
    }
    
    return Deduplicate(users)
}
```

**建立索引**:
```go
// 當使用者訂閱標籤時
func Subscribe(userID int64, tag string) {
    // 1. 記錄使用者興趣
    redis.ZIncrBy("user:interests:" + userID, 10, tag)
    
    // 2. 反向索引: 標籤 → 使用者
    redis.SAdd("tag:users:" + tag, userID)
}
```

#### 7.2 按活躍度分群

```go
type UserActivity int

const (
    HighActive   UserActivity = 1 // 每天打開 5+ 次
    MidActive    UserActivity = 2 // 每天打開 1-5 次
    LowActive    UserActivity = 3 // 一週打開 1 次
    Inactive     UserActivity = 4 // 超過 7 天未打開
)

func ClassifyUserActivity(userID int64) UserActivity {
    // 最近 7 天的活躍次數
    key := fmt.Sprintf("user:activity:%d", userID)
    count := redis.ZCount(key,
        strconv.FormatInt(time.Now().Add(-7*24*time.Hour).Unix(), 10),
        strconv.FormatInt(time.Now().Unix(), 10),
    ).Val()
    
    switch {
    case count >= 35:
        return HighActive
    case count >= 7:
        return MidActive
    case count >= 1:
        return LowActive
    default:
        return Inactive
    }
}

// 推送策略
func GetPushStrategy(activity UserActivity) int {
    switch activity {
    case HighActive:
        return 6 // 每天 6 次
    case MidActive:
        return 3 // 每天 3 次
    case LowActive:
        return 1 // 每天 1 次
    case Inactive:
        return 0 // 不推送(或每週 1 次喚醒)
    }
    
    return 0
}
```

#### 7.3 按地理位置分群

```go
func SegmentByLocation(newsID int64) []int64 {
    news := GetNews(newsID)
    
    // 新聞地域標籤: ["北京", "中國"]
    if news.Location != "" {
        // 獲取該地區的使用者
        users := redis.SMembers("location:users:" + news.Location).Val()
        return users
    }
    
    // 全域性新聞
    return []int64{}
}
```

### 8. 推送頻率控制

#### 8.1 使用者疲勞度管理

**問題**: 推送過多導致使用者關閉通知。

**解決方案**:

**1. 每日限額**:
```go
func CanPush(userID int64) bool {
    key := fmt.Sprintf("push:count:%d:%s", userID, time.Now().Format("2006-01-02"))
    count := redis.Incr(key).Val()
    
    // 首次設定過期時間
    if count == 1 {
        redis.Expire(key, 24*time.Hour)
    }
    
    // 活躍使用者: 每天最多 6 次
    // 普通使用者: 每天最多 3 次
    activity := ClassifyUserActivity(userID)
    limit := GetPushStrategy(activity)
    
    return count <= int64(limit)
}
```

**2. 推送間隔**:
```go
func CheckPushInterval(userID int64) bool {
    key := fmt.Sprintf("push:last:%d", userID)
    lastPush := redis.Get(key).Val()
    
    if lastPush == "" {
        return true
    }
    
    lastTime, _ := time.Parse(time.RFC3339, lastPush)
    
    // 至少間隔 2 小時
    if time.Since(lastTime) < 2*time.Hour {
        return false
    }
    
    return true
}

func RecordPush(userID int64) {
    key := fmt.Sprintf("push:last:%d", userID)
    redis.Set(key, time.Now().Format(time.RFC3339), 24*time.Hour)
}
```

#### 8.2 靜默時段

```go
func IsInQuietTime(userID int64) bool {
    // 使用者自訂靜默時段
    quietStart := GetUserQuietStart(userID) // 例如: 23:00
    quietEnd := GetUserQuietEnd(userID)     // 例如: 08:00
    
    now := time.Now().Hour()
    
    // 跨午夜情況
    if quietStart > quietEnd {
        return now >= quietStart || now < quietEnd
    }
    
    return now >= quietStart && now < quietEnd
}
```

#### 8.3 推送優先級

```go
type PushPriority int

const (
    Urgent    PushPriority = 1 // 突發新聞,忽略限制
    High      PushPriority = 2 // 重要新聞
    Normal    PushPriority = 3 // 普通推送
)

func ShouldPush(userID int64, priority PushPriority) bool {
    // 緊急推送忽略所有限制
    if priority == Urgent {
        return true
    }
    
    // 檢查每日限額
    if !CanPush(userID) {
        return false
    }
    
    // 檢查推送間隔
    if !CheckPushInterval(userID) {
        return false
    }
    
    // 檢查靜默時段
    if IsInQuietTime(userID) {
        return false
    }
    
    return true
}
```

### 9. 推送管道設計

#### 9.1 多管道推送

**App Push (Firebase FCM)**:
```go
func SendAppPush(userID int64, title, body string) error {
    // 獲取使用者裝置 Token
    token := GetUserDeviceToken(userID)
    
    // FCM 訊息
    message := &messaging.Message{
        Token: token,
        Notification: &messaging.Notification{
            Title: title,
            Body:  body,
        },
        Android: &messaging.AndroidConfig{
            Priority: "high",
        },
        APNS: &messaging.APNSConfig{
            Headers: map[string]string{
                "apns-priority": "10",
            },
        },
    }
    
    // 發送
    response, err := fcmClient.Send(context.Background(), message)
    if err != nil {
        return err
    }
    
    log.Info("FCM sent", response)
    return nil
}
```

**SMS 簡訊 (Twilio)**:
```go
func SendSMS(userID int64, content string) error {
    phone := GetUserPhone(userID)
    
    // Twilio API
    params := &twilioApi.CreateMessageParams{}
    params.SetTo(phone)
    params.SetFrom(twilioPhoneNumber)
    params.SetBody(content)
    
    _, err := twilioClient.Api.CreateMessage(params)
    return err
}
```

**Email (SendGrid)**:
```go
func SendEmail(userID int64, subject, body string) error {
    email := GetUserEmail(userID)
    
    message := mail.NewSingleEmail(
        mail.NewEmail("News App", "noreply@newsapp.com"),
        subject,
        mail.NewEmail("", email),
        body,
        body,
    )
    
    _, err := sendGridClient.Send(message)
    return err
}
```

#### 9.2 管道選擇策略

```go
type Channel int

const (
    AppPush Channel = 1
    SMS     Channel = 2
    Email   Channel = 3
)

func SelectChannel(userID int64, priority PushPriority) Channel {
    // 1. 緊急新聞: 多管道推送
    if priority == Urgent {
        go SendAppPush(userID, title, body)
        go SendSMS(userID, shortContent)
        return AppPush
    }
    
    // 2. 檢查使用者偏好
    preference := GetUserChannelPreference(userID)
    
    switch preference {
    case "app_only":
        return AppPush
    case "email_only":
        return Email
    case "all":
        // 重要新聞: App + Email
        if priority == High {
            go SendAppPush(userID, title, body)
            go SendEmail(userID, subject, body)
        }
        return AppPush
    }
    
    return AppPush // 預設
}
```

#### 9.3 失敗重試機制

```go
func PushWithRetry(userID int64, title, body string) error {
    maxRetries := 3
    
    for i := 0; i < maxRetries; i++ {
        err := SendAppPush(userID, title, body)
        
        if err == nil {
            return nil
        }
        
        // 指數退避
        backoff := time.Duration(math.Pow(2, float64(i))) * time.Second
        time.Sleep(backoff)
    }
    
    // 所有重試失敗,記錄並嘗試備用管道
    log.Error("App push failed after retries", userID)
    
    // 降級到 Email
    return SendEmail(userID, title, body)
}
```

### 10. 推送效果追蹤

#### 10.1 關鍵指標

**送達率**:
```go
type PushRecord struct {
    ID        int64
    UserID    int64
    NewsID    int64
    Channel   Channel
    Status    string // sent, delivered, failed
    CreatedAt time.Time
}

func CalculateDeliveryRate() float64 {
    total := db.Count("push_records", "status = 'sent'")
    delivered := db.Count("push_records", "status = 'delivered'")
    
    return float64(delivered) / float64(total) * 100
}
```

**點擊率 (CTR)**:
```go
func CalculateCTR(newsID int64) float64 {
    // 推送次數
    sent := db.Count("push_records", "news_id = ? AND status = 'delivered'", newsID)
    
    // 點擊次數
    clicked := db.Count("click_events", "news_id = ? AND source = 'push'", newsID)
    
    if sent == 0 {
        return 0
    }
    
    return float64(clicked) / float64(sent) * 100
}
```

**取消訂閱率**:
```go
func CalculateUnsubscribeRate() float64 {
    // 當天推送使用者數
    pushed := redis.SCard("pushed:users:" + time.Now().Format("2006-01-02")).Val()
    
    // 當天取消訂閱使用者數
    unsubscribed := redis.SCard("unsubscribed:users:" + time.Now().Format("2006-01-02")).Val()
    
    return float64(unsubscribed) / float64(pushed) * 100
}
```

#### 10.2 A/B 測試

```go
func ABTest(newsID int64) {
    news := GetNews(newsID)
    
    // 目標使用者
    users := SegmentByInterest(newsID)
    
    // 隨機分組
    groupA := users[:len(users)/2]
    groupB := users[len(users)/2:]
    
    // A 組: 標題 A
    for _, userID := range groupA {
        SendPush(userID, news.TitleA, news.Summary)
        RecordABTest(userID, newsID, "A")
    }
    
    // B 組: 標題 B
    for _, userID := range groupB {
        SendPush(userID, news.TitleB, news.Summary)
        RecordABTest(userID, newsID, "B")
    }
    
    // 24 小時後分析結果
    time.AfterFunc(24*time.Hour, func() {
        ctrA := CalculateGroupCTR(newsID, "A")
        ctrB := CalculateGroupCTR(newsID, "B")
        
        log.Info("A/B Test Result", ctrA, ctrB)
        
        // 選擇贏家
        if ctrA > ctrB {
            UseTitle(newsID, news.TitleA)
        } else {
            UseTitle(newsID, news.TitleB)
        }
    })
}
```

### 11. 實時推送 vs 批次推送

#### 11.1 實時推送

**場景**: 突發新聞、使用者關注的事件更新。

```go
func RealtimePush(newsID int64) {
    news := GetNews(newsID)
    
    // 找到目標使用者
    users := SegmentByInterest(newsID)
    
    // 並行推送
    var wg sync.WaitGroup
    
    for _, userID := range users {
        wg.Add(1)
        
        go func(uid int64) {
            defer wg.Done()
            
            if ShouldPush(uid, Urgent) {
                SendAppPush(uid, news.Title, news.Summary)
            }
        }(userID)
    }
    
    wg.Wait()
}
```

#### 11.2 批次推送

**場景**: 定時推送(早報、晚報)、個性化推薦。

```go
func BatchPush() {
    ticker := time.NewTicker(1 * time.Hour)
    
    for range ticker.C {
        now := time.Now().Hour()
        
        // 早上 8 點推送
        if now == 8 {
            users := GetAllActiveUsers()
            
            for _, userID := range users {
                // 個性化推薦
                news := HybridRecommend(userID)
                
                if len(news) > 0 && ShouldPush(userID, Normal) {
                    topNews := news[0]
                    SendAppPush(userID, topNews.Title, topNews.Summary)
                }
            }
        }
    }
}
```

### 12. 效能優化

#### 12.1 Redis 快取

**使用者偏好快取**:
```go
// 讀取使用者興趣
func GetUserInterests(userID int64) []string {
    key := fmt.Sprintf("user:interests:cache:%d", userID)
    
    // 1. 快取
    cached := redis.Get(key).Val()
    if cached != "" {
        return json.Unmarshal(cached)
    }
    
    // 2. 計算
    interests := redis.ZRevRange("user:interests:" + userID, 0, 9).Val()
    
    // 3. 寫入快取
    redis.Set(key, json.Marshal(interests), 1*time.Hour)
    
    return interests
}
```

#### 12.2 非同步處理

```go
func PublishNews(news News) {
    // 1. 儲存新聞
    db.Insert(news)
    
    // 2. 發送到 Kafka(非同步)
    kafka.Publish("news.created", news)
    
    // Worker 處理推送
}

func NewsCreatedWorker() {
    for msg := range kafka.Consume("news.created") {
        news := msg.(News)
        
        // 標籤提取
        ExtractTags(news)
        
        // 使用者分群
        users := SegmentByInterest(news.ID)
        
        // 推送
        for _, userID := range users {
            if ShouldPush(userID, Normal) {
                SendPush(userID, news.Title, news.Summary)
            }
        }
    }
}
```

#### 12.3 批次查詢

```go
func BatchGetUserInterests(userIDs []int64) map[int64][]string {
    result := make(map[int64][]string)
    
    // Redis Pipeline
    pipe := redis.Pipeline()
    
    cmds := make(map[int64]*redis.StringSliceCmd)
    
    for _, userID := range userIDs {
        key := fmt.Sprintf("user:interests:%d", userID)
        cmds[userID] = pipe.ZRevRange(key, 0, 9)
    }
    
    pipe.Exec()
    
    // 解析結果
    for userID, cmd := range cmds {
        result[userID] = cmd.Val()
    }
    
    return result
}
```

### 13. 監控與告警

#### 13.1 關鍵指標

**業務指標**:
```
- 每日推送量
- 送達率
- 點擊率 (CTR)
- 取消訂閱率
```

**系統指標**:
```
- 推送延遲 (P99)
- Kafka 消費延遲
- Redis 命中率
- API 回應時間
```

#### 13.2 告警規則

```yaml
alerts:
  - name: LowDeliveryRate
    condition: delivery_rate < 90%
    action: 檢查推送服務
    
  - name: HighUnsubscribeRate
    condition: unsubscribe_rate > 1%
    action: 檢查推送內容質量
    
  - name: KafkaLag
    condition: kafka_lag > 10000
    action: 擴容 Worker
```

## 常見面試考點

### Q1: 如何實現個性化推薦?

**答案**:

個性化推薦需要結合多種演算法:

**1. 使用者興趣建模**

```go
// 收集使用者行為
- 訂閱主題 (權重 10)
- 點擊新聞 (權重 1)
- 分享新聞 (權重 5)
- 閱讀時長 (>30s 權重 2)

// 儲存在 Redis Sorted Set
ZADD user:interests:123 50 "tech"
ZADD user:interests:123 30 "sports"
```

**2. 協同過濾**

```
找到興趣相似的使用者
推薦他們閱讀的新聞
```

**3. 基於內容推薦**

```
匹配使用者興趣標籤
查詢包含這些標籤的最新新聞
```

**4. 混合推薦**

```
50% 協同過濾
40% 基於內容
10% 熱門新聞
```

**5. 興趣衰減**

```go
// 每天衰減 1%
每天: score × 0.99
低於 1 分則移除
```

**關鍵**: 多維度採集、實時更新、時間衰減。

### Q2: 如何控制推送頻率避免打擾使用者?

**答案**:

**1. 使用者分級**

```go
高活躍 (每天 5+ 次): 每天推送 6 次
中活躍 (每天 1-5 次): 每天推送 3 次
低活躍 (一週 1 次): 每天推送 1 次
不活躍 (7 天未開啟): 不推送(或每週喚醒 1 次)
```

**2. 每日限額**

```go
func CanPush(userID int64) bool {
    key := "push:count:" + userID + ":" + today
    count := redis.Incr(key)
    
    limit := GetPushLimit(userID) // 根據活躍度
    
    return count <= limit
}
```

**3. 推送間隔**

```go
// 至少間隔 2 小時
if time.Since(lastPush) < 2*time.Hour {
    return false
}
```

**4. 靜默時段**

```go
// 使用者自訂: 23:00 - 08:00 不推送
if IsInQuietTime(userID) {
    return false
}
```

**5. 推送優先級**

```go
緊急新聞 (Urgent): 忽略所有限制
重要新聞 (High): 忽略間隔限制
普通推送 (Normal): 嚴格遵守限制
```

**6. 疲勞度監控**

```go
// 追蹤取消訂閱率
if unsubscribe_rate > 1% {
    降低推送頻率
}
```

### Q3: 突發新聞如何實現秒級推送?

**答案**:

**1. 架構設計**

```
編輯發佈 → Kafka (優先級 topic) → Worker (並行推送) → 使用者
```

**2. 優先級 Topic**

```go
// Kafka 有兩個 Topic
topic: news.urgent  (高優先級,更多 partition)
topic: news.normal  (普通優先級)

// 緊急新聞發到 urgent topic
kafka.Publish("news.urgent", news)
```

**3. 專用 Worker Pool**

```go
// Urgent Worker (100 個)
for i := 0; i < 100; i++ {
    go UrgentWorker()
}

// Normal Worker (20 個)
for i := 0; i < 20; i++ {
    go NormalWorker()
}
```

**4. 預先分群**

```
提前建立使用者分群索引:
tag:users:tech = {user1, user2, ...}

突發新聞直接查詢索引,無需實時計算
```

**5. 並行推送**

```go
func RealtimePush(newsID int64) {
    users := GetTargetUsers(newsID) // 從索引獲取
    
    // 分批並行推送
    batchSize := 1000
    var wg sync.WaitGroup
    
    for i := 0; i < len(users); i += batchSize {
        batch := users[i:min(i+batchSize, len(users))]
        
        wg.Add(1)
        go func(b []int64) {
            defer wg.Done()
            
            for _, userID := range b {
                SendAppPush(userID, title, body)
            }
        }(batch)
    }
    
    wg.Wait()
}
```

**6. FCM 優先級**

```go
message := &messaging.Message{
    Token: token,
    Android: &messaging.AndroidConfig{
        Priority: "high", // 高優先級
    },
    APNS: &messaging.APNSConfig{
        Headers: map[string]string{
            "apns-priority": "10", // 最高優先級
        },
    },
}
```

**效能**:
- 100 萬使用者
- 100 個 Worker 並行
- 每個 Worker 10,000 使用者
- 單次推送 10ms
- 總時長: 10,000 × 10ms = 100 秒 ≈ 2 分鐘

**優化**: 增加 Worker 數量到 1000,總時長降到 10 秒。

### Q4: 如何防止使用者取消訂閱?

**答案**:

**1. 精準推送**

```
不推送使用者不感興趣的內容
提高點擊率
降低打擾感
```

**2. 頻率控制**

```
根據使用者活躍度調整推送頻率
不活躍使用者減少推送
```

**3. 時段選擇**

```
分析使用者活躍時段
在使用者通常開啟 App 的時段推送
```

**4. 個性化時間**

```go
func GetBestPushTime(userID int64) int {
    // 分析使用者過去 30 天的開啟時間
    times := GetUserOpenTimes(userID, 30*24*time.Hour)
    
    // 統計最頻繁的小時
    hourCounts := make(map[int]int)
    for _, t := range times {
        hourCounts[t.Hour()]++
    }
    
    // 返回最活躍的小時
    maxHour := 8 // 預設早上 8 點
    maxCount := 0
    
    for hour, count := range hourCounts {
        if count > maxCount {
            maxCount = count
            maxHour = hour
        }
    }
    
    return maxHour
}
```

**5. 推送質量追蹤**

```go
// 追蹤每篇新聞的 CTR
if CTR < 3% {
    標記為低質量內容
    減少推送
}
```

**6. 提供細粒度控制**

```
使用者可選擇:
- 接收哪些分類的推送
- 每天接收幾次
- 靜默時段
- 完全關閉
```

**7. 價值感知**

```
推送使用者真正關心的內容
例如: 使用者訂閱的作者發布新文章
     使用者關注的事件有更新
```

### Q5: 推送系統如何擴展到支援 10 億使用者?

**答案**:

**1. 水平擴展架構**

```
分散式架構:
- 多個 Kafka 叢集(分地域)
- 多個 Worker 叢集(可動態擴容)
- 多個 Redis 叢集(分片)
```

**2. 資料分片**

```go
// 使用者資料按 user_id 分片
shard := userID % 1024

// 儲存到對應的 Redis 叢集
redis[shard].ZAdd("user:interests:" + userID, ...)
```

**3. 地域分散式部署**

```
美洲區: Kafka + Workers + Redis (5 億使用者)
歐洲區: Kafka + Workers + Redis (2 億使用者)
亞洲區: Kafka + Workers + Redis (3 億使用者)

減少跨區延遲
```

**4. 推送服務解耦**

```
使用者分群服務 (獨立擴展)
推薦引擎服務 (獨立擴展)
推送閘道服務 (獨立擴展)
```

**5. 非同步化**

```
所有非核心操作都非同步:
- 興趣標籤更新
- 使用者分群
- 推送記錄寫入
```

**6. 批次處理**

```go
// 批次獲取使用者資料
users := BatchGetUsers(userIDs) // 100 個/批次

// 批次發送推送
BatchSendPush(users, news) // 1000 個/批次
```

**7. 預計算和快取**

```
預先計算:
- 使用者相似度
- 內容相似度
- 使用者分群索引

快取熱點資料:
- 熱門新聞
- 活躍使用者興趣
- 使用者分群結果
```

**8. 動態擴容**

```yaml
# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  scaleTargetRef:
    kind: Deployment
    name: push-worker
  minReplicas: 100
  maxReplicas: 1000
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

**容量估算**:
```
10 億使用者
每日推送 4 次
總推送量: 40 億次/天

平均 QPS: 40 億 / 86400 ≈ 46,000
高峰 QPS: 46,000 × 3 ≈ 140,000

Worker 數量:
假設單 Worker 處理 100 QPS
需要: 140,000 / 100 = 1,400 個 Worker
```

## 總結

新聞推送系統是典型的大規模個性化推薦場景,涵蓋了:

**核心挑戰**:
1. **個性化推薦**: 使用者興趣建模、內容匹配
2. **推送頻率控制**: 疲勞度管理、靜默時段
3. **實時推送**: 突發新聞秒級送達
4. **效果追蹤**: CTR、送達率、取消訂閱率

**關鍵技術**:
- **Redis Sorted Set**: 使用者興趣標籤儲存
- **Kafka**: 非同步訊息處理
- **協同過濾 + 內容推薦**: 混合推薦演算法
- **多管道推送**: App Push、SMS、Email
- **使用者分群**: 按興趣、活躍度、地理位置

**設計原則**:
- **以使用者為中心**: 推送使用者真正關心的內容
- **頻率適度**: 避免過度打擾
- **實時與批次結合**: 突發新聞實時推送,定時推送批次處理
- **持續優化**: A/B 測試、效果追蹤

掌握新聞推送系統設計,對理解個性化推薦、使用者增長、資料探勘有重要幫助!
