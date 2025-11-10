# 如何設計 Twitter 社交平台？

- **難度**: 9
- **重要程度**: 5
- **標籤**: `System Design`, `Social Network`, `Feed Architecture`, `Fanout`, `Rate Limiting`

## 問題詳述

設計一個大規模 Twitter 類社交平台，支援推文（Tweet）、關注關係、時間線（Home/User/Lists）、互動（讚、轉推、回覆）、搜尋與趨勢。需在數億 DAU、讀多寫少下提供低延遲與高可用服務。

## 核心理論與詳解

### 1. 需求澄清與界定

- 功能：發文、刪文、讚、轉推、回覆、關注/取消、Home Timeline、User Timeline、提及（@mentions）、主題標籤（#hashtags）、趨勢（Trends）、通知。
- 約束：Home Feed P95 < 200ms，發文 P95 < 500ms；可接受 Feed 最終一致性；GDPR 刪除可追溯；99.99% 可用性，多機房部署。

### 2. 粗略容量與流量估算

- 例：DAU 200M、每人日發 2 則、日看 Feed 50 次、平均關注 200。
- 寫入 QPS（推文）：~4.6k（峰值 15k）；讀取 QPS（Feed）：~115k（峰值 350k）。
- 儲存：推文含中繼資料 ~500B；日增 200GB，5 年 ~365TB（未含媒體）。

### 3. 資料模型與存儲

- 推文（Tweets）：主儲存 MySQL/Cassandra；按 `tweet_id` 或 `user_id` 分片；不可變、追加為主。
- 使用者（Users）：MySQL，需事務性（設定、隱私）。
- 社交圖（Follows）：Cassandra/Redis，雙向索引 `followers:{uid}`、`following:{uid}`。
- 互動（Likes/Retweets/Replies）：計數與明細分離；熱點計數用 Redis 計數器，週期性回寫。
- 內容索引：ElasticSearch（全文/hashtag/mention 查詢）。

### 4. Feed 生成策略（核心）

- Fanout-on-Write：寫擴散，發文即把 `tweet_id` 推到粉絲的 Feed 快取；讀快，但明星使用者寫入壓力巨大與儲存膨脹。
- Fanout-on-Read：讀擴散，讀取時合併所關注者最新推文；寫簡單，但讀取延遲高、查詢壓力大。
- 混合策略（推薦）：
  - 普通帳號（<1–10k 粉）：Fanout-on-Write；
  - 明星帳號（>= 閾值）：Fanout-on-Read；
  - 讀取時合併兩部分並排序（時間/相關度）。

### 5. 排序與排名信號

- 時序優先 + 輕量相關度加權：互動、關係距離、文字/媒體特徵、新鮮度、作者可信度。
- AB/旗標可開關不同排名策略；保留簡單時序兜底路徑以保可預期性。

### 6. 快取與多層存取

- L1 CDN：靜態頁片段、公共熱門頁面。
- L2 Redis：`feed:{uid}`（最新 N 條 `tweet_id`）、`tweet:{tid}`、`user:{uid}`、熱點計數；LRU+TTL，熱點延長 TTL。
- L3 資料庫：未命中兜底查詢；寫入用 Cache-Aside，修改時失效快取。

### 7. ID 生成與分片

- Snowflake 64-bit：時間戳（41）+ 機器（10）+ 序列（12），全域唯一、趨勢遞增、易分片；避免隨機 UUID 對索引不友善。
- 分片策略：`user_id` 或 `tweet_id` Range/Hash；跨分片聚合靠二級索引與查詢匯總層。

### 8. 熱點與明星帳號治理

- 明星帳號白名單採讀擴散；
- 熱點推文：多副本快取、CDN、局部結果預渲染；
- 批次與管線化：Fanout 批量寫入、Redis pipeline；
- 背壓與限流：單推文/單作者/單使用者策略速率限制，熔斷與降級。

### 9. 搜尋、主題與趨勢

- 索引：ES 分析 tokenizer、倒排索引；
- Hashtag/mention 寫入即抽取與異步索引；
- 趨勢：滑動窗口計數、地域/語言分桶、機器人與重複濾除，曝光安全閾值。

### 10. 可靠性與一致性

- 服務：無狀態、多 AZ/Region，金絲雀與自動擴縮；
- 資料：MySQL 主從+讀寫分離，Redis Cluster，Cassandra 多副本；
- 一致性：發文強一致（成功才回應），Feed 最終一致；跨中心非同步複製，災難切換演練。

### 11. 風控與濫用防護

- 帳號信譽分、行為異常偵測（裝置/IP/速度）；
- 發文/互動限流、驗證碼、人機驗證；
- 內容審核：關鍵字+ML、多層回退（人工複核）；
- 隱私/封鎖/靜音機制直達讀取路徑。

### 12. 規範與刪除

- GDPR 可刪/可攜：內容物件化，儲存清單式刪除計畫與非同步清理；
- 索引與快取刪除一致性保障（墓碑標記+TTL 淘汰）。

### 13. 可觀測性

- 指標：QPS、P50/P95/P99、錯誤率、快取命中率、Fanout 延遲；
- 追蹤：發文到 Feed 呈現端到端 Trace；
- 日誌：抽樣集中，隱私遮罩。

## 程式碼範例 (可選)

```go
// 簡化的混合 Feed 合併示意
func GetHomeFeed(userID int64, limit int) []Tweet {
    cached := redis.LRange(fmt.Sprintf("feed:%d", userID), 0, int64(limit*2))
    celebIDs := getCelebrityFollowings(userID)
    celeb := fetchRecentTweets(celebIDs, limit)
    all := mergeByID(cached, celeb)
    sort.Slice(all, func(i, j int) bool { return all[i].Ts > all[j].Ts })
    if len(all) > limit { return all[:limit] }
    return all
}
```

## 總結

Twitter 的關鍵在於：混合型 Feed 生成策略平衡讀寫、明星帳號特別治理、快取分層與熱點處理、搜尋與趨勢的可擴展索引，以及完善的限流與風控。以最終一致保障體驗，以強一致保證寫入正確性。
