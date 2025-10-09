# 如何設計即時排行榜系統？

- **難度**: 8
- **重要程度**: 5
- **標籤**: `System Design`, `Leaderboard`, `Redis Sorted Set`, `Real-time Ranking`

## 問題詳述

設計一個即時排行榜系統，支援遊戲、社交、電商等場景的即時排名。系統需要處理高頻率的分數更新，支援全球和分區排行榜，並能快速查詢任意使用者的排名。

## 核心理論與詳解

### 1. 排行榜系統的特點與挑戰

#### 1.1 業務場景分析

**遊戲排行榜**：
- 使用者完成一局遊戲後更新分數
- 需要即時看到自己的排名變化
- 查看全球 Top 100 和好友排行榜

**電商銷售榜**：
- 商家銷售額即時更新
- 查看本月/本週銷售 Top 10
- 激勵商家提升銷量

**社交影響力榜**：
- 根據粉絲數、互動數等綜合評分
- 展示最具影響力的 Top 50
- 每小時更新一次

#### 1.2 核心挑戰

**高頻寫入**：
```
遊戲場景：
- 1000 萬 DAU
- 每人每天 10 局
- 寫入 QPS = 10M × 10 / 86400 ≈ 1,100 QPS
- 峰值可達 5,000 QPS
```

**即時查詢排名**：
```
查詢場景：
- 查詢 Top 100
- 查詢使用者當前排名（需要掃描全部數據？）
- 查詢使用者周邊排名（前後各 5 名）

查詢延遲要求：< 100ms
```

**多維度排行榜**：
```
時間維度：
- 實時榜（當前）
- 小時榜（最近 1 小時）
- 日榜（今天）
- 週榜（本週）
- 月榜（本月）
- 總榜（歷史累計）

空間維度：
- 全球榜
- 國家榜
- 省份榜
- 好友榜
```

### 2. 技術方案選擇與對比

#### 2.1 方案一：MySQL（不推薦）

**實現方式**：
```sql
-- 存儲表
CREATE TABLE leaderboard (
    user_id BIGINT PRIMARY KEY,
    score INT,
    updated_at TIMESTAMP
);

-- 更新分數
UPDATE leaderboard SET score = score + 10 WHERE user_id = 123;

-- 查詢 Top 100
SELECT user_id, score FROM leaderboard 
ORDER BY score DESC LIMIT 100;

-- 查詢排名（關鍵問題）
SELECT COUNT(*) + 1 FROM leaderboard 
WHERE score > (SELECT score FROM leaderboard WHERE user_id = 123);
```

**問題分析**：
- ❌ **查詢排名極慢**：需要掃描全表（O(N)），百萬使用者需要數秒
- ❌ **排序開銷大**：ORDER BY 在大數據量下性能差
- ❌ **高頻寫入壓力大**：頻繁 UPDATE 影響性能
- ❌ **擴展性差**：難以水平擴展

**結論**：MySQL 不適合排行榜場景，除非數據量很小（< 10萬）。

#### 2.2 方案二：Redis Sorted Set（強烈推薦）

**為什麼選擇 Redis Sorted Set**：

Redis 的 Sorted Set（有序集合）是專門為排行榜場景設計的數據結構。

**核心特性**：
```
數據結構：
- Member：使用者 ID（唯一）
- Score：分數（排序依據）
- 內部實現：跳躍表（Skip List）+ 哈希表

時間複雜度：
- 添加/更新：O(log N)
- 查詢 Top K：O(log N + K)
- 查詢排名：O(log N)
- 查詢分數：O(1)
```

**為什麼快**：
- 跳躍表提供 O(log N) 的查詢和插入
- 哈希表提供 O(1) 的 Member 查找
- 內存操作，無磁盤 IO

**基本操作示例**：
```go
// 更新分數（如果不存在則添加）
redis.ZAdd("leaderboard:global", score, userID)

// 查詢 Top 100（按分數從高到低）
redis.ZRevRange("leaderboard:global", 0, 99)

// 查詢使用者排名（0-based）
rank := redis.ZRevRank("leaderboard:global", userID)

// 查詢使用者分數
score := redis.ZScore("leaderboard:global", userID)

// 查詢使用者周邊排名（前後各 5 名）
redis.ZRevRange("leaderboard:global", rank-5, rank+5)
```

**性能表現**：
```
單機 Redis：
- 寫入 QPS：10 萬+
- 查詢 QPS：10 萬+
- 延遲：< 1ms

Redis Cluster：
- 寫入 QPS：100 萬+（水平擴展）
- 查詢 QPS：100 萬+
```

### 3. 多時間維度排行榜設計

最常見的需求：同時支持小時榜、日榜、週榜、月榜。

#### 3.1 Key 命名策略

**設計原則**：Key 包含時間信息，自動分離不同時間段的數據。

```
Key 命名規範：
leaderboard:{scope}:{timeframe}

示例：
leaderboard:global:all       // 總榜
leaderboard:global:2024-01   // 2024年1月榜
leaderboard:global:2024-W03  // 2024年第3週榜
leaderboard:global:2024-01-15 // 2024年1月15日榜
leaderboard:global:2024-01-15-14 // 2024年1月15日14時榜
```

**生成規則**：
```go
func getLeaderboardKey(scope string, timeframe string) string {
    now := time.Now()
    
    switch timeframe {
    case "hour":
        return fmt.Sprintf("leaderboard:%s:%s", 
            scope, now.Format("2006-01-02-15"))
    case "day":
        return fmt.Sprintf("leaderboard:%s:%s", 
            scope, now.Format("2006-01-02"))
    case "week":
        year, week := now.ISOWeek()
        return fmt.Sprintf("leaderboard:%s:%d-W%02d", 
            scope, year, week)
    case "month":
        return fmt.Sprintf("leaderboard:%s:%s", 
            scope, now.Format("2006-01"))
    case "all":
        return fmt.Sprintf("leaderboard:%s:all", scope)
    }
}
```

#### 3.2 分數更新策略

**問題**：使用者完成一局遊戲，得分 100，如何更新各個榜單？

**策略一：同時更新所有榜（推薦用於低頻更新）**

```
更新邏輯：
1. 更新小時榜：ZIncrBy("leaderboard:global:2024-01-15-14", 100, userID)
2. 更新日榜：ZIncrBy("leaderboard:global:2024-01-15", 100, userID)
3. 更新週榜：ZIncrBy("leaderboard:global:2024-W03", 100, userID)
4. 更新月榜：ZIncrBy("leaderboard:global:2024-01", 100, userID)
5. 更新總榜：ZIncrBy("leaderboard:global:all", 100, userID)

優點：查詢時直接讀取，無需計算
缺點：寫入放大（1 次更新 → 5 次 Redis 操作）
```

**策略二：異步聚合（推薦用於高頻更新）**

```
更新邏輯：
1. 只更新最細粒度的榜（小時榜）
2. 後台定時任務聚合：
   - 每小時結束：聚合生成日榜
   - 每天結束：聚合生成週榜、月榜

優點：寫入壓力小
缺點：非實時（有延遲）
```

**選擇建議**：
- 遊戲排行榜（高頻更新）：策略二
- 電商銷售榜（中頻更新）：策略一
- 社交影響力榜（低頻更新）：策略一

### 4. 多空間維度排行榜設計

支持全球榜、國家榜、省份榜等。

#### 4.1 設計方案

**方案一：冗餘存儲（推薦）**

```
為每個維度維護獨立的 Sorted Set：
- leaderboard:global:2024-01-15
- leaderboard:country:US:2024-01-15
- leaderboard:country:CN:2024-01-15
- leaderboard:province:CA:2024-01-15

更新邏輯：
user = getUser(userID)  // 獲取使用者地理信息
redis.ZIncrBy("leaderboard:global:today", score, userID)
redis.ZIncrBy(f"leaderboard:country:{user.country}:today", score, userID)
redis.ZIncrBy(f"leaderboard:province:{user.province}:today", score, userID)

優點：查詢極快，直接讀取
缺點：存儲冗餘，寫入放大
```

**方案二：動態過濾（不推薦）**

```
只維護全球榜，查詢時動態過濾：
1. 獲取全球 Top 10,000
2. 遍歷過濾出特定國家的使用者
3. 返回 Top 100

優點：存儲節省
缺點：查詢慢，需要掃描大量數據
```

**選擇建議**：冗餘存儲方案，存儲成本低但性能高。

### 5. 好友排行榜設計

顯示在好友中的排名，這是最復雜的排行榜類型。

#### 5.1 挑戰分析

**問題**：
- 每個使用者的好友列表不同（平均 200 人）
- 無法為每個使用者單獨維護一個 Sorted Set（存儲爆炸）
- 需要動態計算

#### 5.2 解決方案

**實時計算方案**：

```
查詢流程：
1. 獲取使用者的好友列表（200 人）
   friends = getFriends(userID)

2. 批量查詢好友分數
   scores = redis.MGET(friends.map(f => "score:"+f))

3. 在內存中排序
   sortedFriends = sort(friends, by=scores, desc=True)

4. 返回 Top 20

時間複雜度：
- 獲取好友：O(1)（從快取）
- 批量查詢分數：O(200)（Redis MGET）
- 排序：O(200 log 200)
- 總計：< 10ms
```

**優化：好友分數快取**：
```
使用 Redis Hash 存儲使用者的好友分數快取：
Key: friends:leaderboard:{user_id}
Value: {friend_id: score, ...}

更新時機：
- 好友關係變化時更新
- 好友分數更新時增量更新

查詢時：
直接讀取 Hash，無需動態計算
```

### 6. 數據過期與清理

排行榜數據不能無限增長，需要過期策略。

#### 6.1 自動過期設置

```
為臨時榜單設置 TTL：
- 小時榜：TTL = 7 天（保留歷史查詢）
- 日榜：TTL = 90 天
- 週榜：TTL = 1 年
- 月榜：TTL = 永久（或 10 年）

實現：
redis.ZAdd("leaderboard:global:2024-01-15-14", score, userID)
redis.Expire("leaderboard:global:2024-01-15-14", 7*24*3600)

優點：自動清理，無需手動維護
```

#### 6.2 定時歸檔

```
對於需要長期保存的數據：
1. 每天定時任務
2. 將昨日榜單 Top 1000 導出到 MySQL
3. 用於歷史查詢和數據分析
4. Redis 中的數據可以過期清理
```

### 7. 系統擴展性設計

#### 7.1 Redis Cluster 分片

**當單機 Redis 不夠用時**：

```
分片策略：
按地理維度分片（推薦）
- Shard 1：全球榜、北美榜
- Shard 2：歐洲榜、非洲榜
- Shard 3：亞洲榜、大洋洲榜

按時間維度分片：
- Shard 1：實時榜、小時榜
- Shard 2：日榜、週榜
- Shard 3：月榜、總榜

優點：
- 水平擴展，支撐更高 QPS
- 不同榜單隔離，互不影響
```

#### 7.2 多級快取

```
L1: 本地快取（應用服務器內存）
- 快取 Top 100（1 分鐘 TTL）
- 適合讀多寫少的總榜

L2: Redis
- 完整排行榜數據
- 實時更新

查詢流程：
1. 檢查本地快取
2. 未命中則查 Redis
3. 結果寫入本地快取
```

### 8. 防作弊機制

排行榜系統容易被刷分，需要防作弊設計。

#### 8.1 檢測異常行為

**規則引擎**：
```
異常檢測規則：
- 短時間內分數暴漲（1 小時內 +10,000 分）
- 遊戲時長異常（單局 1 秒結束）
- 設備指紋重複（一個設備多個帳號）
- IP 集中（大量帳號來自同一 IP）

處理方式：
- 自動標記可疑帳號
- 暫時從榜單移除
- 人工審核確認
```

#### 8.2 延遲顯示

```
新分數不立即顯示在榜單：
1. 分數提交後進入待審核隊列
2. 延遲 5-10 分鐘後才顯示在榜單
3. 這期間進行異常檢測
4. 給作弊者更大的檢測窗口期

優點：
- 防止短時間內刷榜
- 有時間進行檢測
```

### 9. 監控與告警

#### 9.1 關鍵指標

**業務指標**：
- 榜單更新延遲（P99 < 100ms）
- 榜單查詢延遲（P99 < 50ms）
- 異常分數檢測率

**系統指標**：
- Redis QPS 和延遲
- 內存使用率（< 80%）
- 主從複製延遲

#### 9.2 告警規則

```
告警觸發條件：
- 更新延遲 > 1 秒
- Redis 內存使用 > 90%
- 單個 Key 大小 > 100MB（可能的攻擊）
- 異常分數佔比 > 1%
```

## 程式碼範例（可選）

僅展示核心的排行榜操作封裝：

```go
type Leaderboard struct {
    redis *redis.Client
    key   string
}

// 更新分數
func (lb *Leaderboard) UpdateScore(userID int64, delta int64) error {
    return lb.redis.ZIncrBy(lb.key, float64(delta), fmt.Sprint(userID)).Err()
}

// 獲取 Top N
func (lb *Leaderboard) GetTopN(n int) ([]RankItem, error) {
    results, err := lb.redis.ZRevRangeWithScores(lb.key, 0, int64(n-1)).Result()
    // 處理結果...
}

// 獲取使用者排名
func (lb *Leaderboard) GetUserRank(userID int64) (int64, error) {
    rank, err := lb.redis.ZRevRank(lb.key, fmt.Sprint(userID)).Result()
    return rank + 1, err  // 轉換為 1-based 排名
}
```

## 總結

設計即時排行榜系統的核心要點：

1. **數據結構選擇**：Redis Sorted Set 是排行榜的最佳選擇（O(log N) 性能）
2. **多時間維度**：通過 Key 命名區分不同時間段，自動過期清理
3. **多空間維度**：冗餘存儲不同地理維度的榜單，犧牲存儲換性能
4. **好友排行榜**：實時計算 + 分數快取，平衡性能和存儲
5. **可擴展性**：Redis Cluster 分片 + 多級快取
6. **防作弊**：異常檢測 + 延遲顯示 + 人工審核

排行榜系統的核心是**選擇合適的數據結構（Redis Sorted Set）**，它天然支持排序和排名查詢，是解決排行榜問題的銀彈。相比 MySQL 等方案，性能提升數百倍。
