# 大型系統設計綜合檢視：容量、一致性、即時性與成本

- **Assessment ID**: `assessment.system-design.large-scale-review.v1`
- **主要 Concept ID**: `concept.system-design.payment.idempotent-ledger`
- **次要 Concept IDs**:
  - `concept.system-design.distributed-kv.sharding-consistency`
  - `concept.system-design.instagram.media-feed-delivery`
  - `concept.system-design.instant-messaging.reliable-realtime-delivery`
  - `concept.system-design.linkedin.professional-graph-search`
  - `concept.system-design.news-feed-push.personalized-delivery`
  - `concept.system-design.news-recommendation.ranking-freshness`
  - `concept.system-design.realtime-leaderboard.ranking-consistency`
  - `concept.system-design.ride-sharing.location-matching`
  - `concept.system-design.search-autocomplete.index-latency`
  - `concept.system-design.social-platform.feed-graph-evolution`
  - `concept.system-design.twitter-like.hybrid-fanout`
  - `concept.system-design.twitter.timeline-hotspot`
  - `concept.system-design.unique-id.global-ordering`
  - `concept.system-design.video-streaming.abr-cdn-cost`
  - `concept.system-design.tiny-url.redirect-availability`
  - `concept.system-design.reliable-chat.pubsub-durability`
- **對應文章與 Concept**:
- [如何設計分散式鍵值儲存系統？](../../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_distributed_key_value_store.md) — `concept.system-design.distributed-kv.sharding-consistency`
- [如何設計 Instagram 社交平台？](../../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_instagram_system.md) — `concept.system-design.instagram.media-feed-delivery`
- [如何設計即時通訊系統？](../../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_instant_messaging_system.md) — `concept.system-design.instant-messaging.reliable-realtime-delivery`
- [如何設計 LinkedIn 社交平台？](../../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_linkedin_system.md) — `concept.system-design.linkedin.professional-graph-search`
- [如何設計新聞推送系統？](../../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_news_feed_push_system.md) — `concept.system-design.news-feed-push.personalized-delivery`
- [如何設計新聞推薦系統？](../../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_news_recommendation_system.md) — `concept.system-design.news-recommendation.ranking-freshness`
- [如何設計支付系統？](../../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_payment_system.md) — `concept.system-design.payment.idempotent-ledger`
- [如何設計即時排行榜系統？](../../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_realtime_leaderboard_system.md) — `concept.system-design.realtime-leaderboard.ranking-consistency`
- [如何設計共乘打車系統？](../../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_ride_sharing_system.md) — `concept.system-design.ride-sharing.location-matching`
- [如何設計搜尋引擎或自動補全？](../../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_search_engine_autocomplete.md) — `concept.system-design.search-autocomplete.index-latency`
- [如何設計 Twitter / Instagram / LinkedIn 社交平台（總覽）？](../../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_social_platform.md) — `concept.system-design.social-platform.feed-graph-evolution`
- [如何設計類 Twitter 的社交平台？](../../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_twitter_like_social_platform.md) — `concept.system-design.twitter-like.hybrid-fanout`
- [如何設計 Twitter 社交平台？](../../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_twitter_system.md) — `concept.system-design.twitter.timeline-hotspot`
- [如何設計唯一識別碼產生器？](../../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_unique_id_generator.md) — `concept.system-design.unique-id.global-ordering`
- [如何設計串流影音服務？](../../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_video_streaming_service.md) — `concept.system-design.video-streaming.abr-cdn-cost`
- [如何設計一個高併發的短網址系統？](../../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/how_to_design_a_tiny_url_system.md) — `concept.system-design.tiny-url.redirect-availability`
- [使用 Pub/Sub 建立可靠的聊天系統](../../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/reliable_chat_system_with_pubsub.md) — `concept.system-design.reliable-chat.pubsub-durability`
- **題型**: 容量估算、分散式一致性、即時交付、故障診斷、成本取捨
- **難度**: 10
- **重要程度**: 5
- **建議作答時間**: 60 分鐘
- **標籤**: Large-Scale System Design、Capacity Planning、Consistency、Real-Time、Resilience、Cost
- **Learning Objective IDs**:
  - `concept.system-design.distributed-kv.sharding-consistency/LO-1`
  - `concept.system-design.distributed-kv.sharding-consistency/LO-2`
  - `concept.system-design.distributed-kv.sharding-consistency/LO-3`
  - `concept.system-design.instagram.media-feed-delivery/LO-1`
  - `concept.system-design.instagram.media-feed-delivery/LO-2`
  - `concept.system-design.instagram.media-feed-delivery/LO-3`
  - `concept.system-design.instant-messaging.reliable-realtime-delivery/LO-1`
  - `concept.system-design.instant-messaging.reliable-realtime-delivery/LO-2`
  - `concept.system-design.instant-messaging.reliable-realtime-delivery/LO-3`
  - `concept.system-design.linkedin.professional-graph-search/LO-1`
  - `concept.system-design.linkedin.professional-graph-search/LO-2`
  - `concept.system-design.linkedin.professional-graph-search/LO-3`
  - `concept.system-design.news-feed-push.personalized-delivery/LO-1`
  - `concept.system-design.news-feed-push.personalized-delivery/LO-2`
  - `concept.system-design.news-feed-push.personalized-delivery/LO-3`
  - `concept.system-design.news-recommendation.ranking-freshness/LO-1`
  - `concept.system-design.news-recommendation.ranking-freshness/LO-2`
  - `concept.system-design.news-recommendation.ranking-freshness/LO-3`
  - `concept.system-design.payment.idempotent-ledger/LO-1`
  - `concept.system-design.payment.idempotent-ledger/LO-2`
  - `concept.system-design.payment.idempotent-ledger/LO-3`
  - `concept.system-design.realtime-leaderboard.ranking-consistency/LO-1`
  - `concept.system-design.realtime-leaderboard.ranking-consistency/LO-2`
  - `concept.system-design.realtime-leaderboard.ranking-consistency/LO-3`
  - `concept.system-design.ride-sharing.location-matching/LO-1`
  - `concept.system-design.ride-sharing.location-matching/LO-2`
  - `concept.system-design.ride-sharing.location-matching/LO-3`
  - `concept.system-design.search-autocomplete.index-latency/LO-1`
  - `concept.system-design.search-autocomplete.index-latency/LO-2`
  - `concept.system-design.search-autocomplete.index-latency/LO-3`
  - `concept.system-design.social-platform.feed-graph-evolution/LO-1`
  - `concept.system-design.social-platform.feed-graph-evolution/LO-2`
  - `concept.system-design.social-platform.feed-graph-evolution/LO-3`
  - `concept.system-design.twitter-like.hybrid-fanout/LO-1`
  - `concept.system-design.twitter-like.hybrid-fanout/LO-2`
  - `concept.system-design.twitter-like.hybrid-fanout/LO-3`
  - `concept.system-design.twitter.timeline-hotspot/LO-1`
  - `concept.system-design.twitter.timeline-hotspot/LO-2`
  - `concept.system-design.twitter.timeline-hotspot/LO-3`
  - `concept.system-design.unique-id.global-ordering/LO-1`
  - `concept.system-design.unique-id.global-ordering/LO-2`
  - `concept.system-design.unique-id.global-ordering/LO-3`
  - `concept.system-design.video-streaming.abr-cdn-cost/LO-1`
  - `concept.system-design.video-streaming.abr-cdn-cost/LO-2`
  - `concept.system-design.video-streaming.abr-cdn-cost/LO-3`
  - `concept.system-design.tiny-url.redirect-availability/LO-1`
  - `concept.system-design.tiny-url.redirect-availability/LO-2`
  - `concept.system-design.tiny-url.redirect-availability/LO-3`
  - `concept.system-design.reliable-chat.pubsub-durability/LO-1`
  - `concept.system-design.reliable-chat.pubsub-durability/LO-2`
  - `concept.system-design.reliable-chat.pubsub-durability/LO-3`

## 測驗目標

- 能從流量、資料量、併發連線、佇列與外部供應商上限建立容量預算，並把延遲、可用性與成本放在同一個設計中。
- 能為支付、KV、ID、短網址與排行榜定義 authoritative source、唯一性、不變量、版本和重播語意。
- 能設計聊天、即時定位、Feed、搜尋、推薦與推送的狀態同步、背壓、去重和故障降級。
- 能設計媒體上傳、轉碼、CDN、快取與刪除流程，說明頻寬、儲存和計算成本如何影響架構。
- 能以可觀測性、故障注入、對帳和回放證據證明系統在部分失敗下不重複扣款、不遺失訊息、不超賣或靜默錯誤。

## 問題情境與限制條件

你要為一個整合型平台設計下一版架構。平台同時提供支付、社交 Feed、新聞推薦與推送、即時聊天、共乘打車、搜尋／自動補全、短網址、影片串流、唯一 ID 和即時排行榜。現況規模如下：

- 2 億 DAU；一般 API 峰值 100 萬 req/s，Feed 讀取峰值 35 萬 req/s，搜尋與自動補全峰值 10 萬 req/s。
- 聊天有 500 萬長連線，訊息峰值 80,000 events/s；司機位置更新峰值 30,000 events/s，匹配需要在 2 秒內回應。
- 支付供應商最多接受 500 authorize req/s，請求可能在已扣款後 timeout；帳務資料必須可對帳且不能重複扣款。
- ID 產生峰值 100 萬/s；短網址重定向峰值 200 萬/s，少數熱門短碼佔大多數流量；排行榜每秒 50,000 次分數事件。
- 每小時有 20,000 個影片上傳任務；轉碼、字幕、審核與 CDN 預熱可非同步，但首播 P95 需低於 2 秒，播放中斷率需低於 1%。
- Feed 和推薦可接受短暫最終一致，但刪除、封鎖、隱私、支付 ledger、座位／行程狀態與 ID 唯一性不能以 stale cache 作為最後依據。
- 不能無限增加資料庫、快取、consumer、CDN 或支付配額；每一個新增副本、預計算 Feed、轉碼 profile 和重試都必須說明成本與失敗邊界。

事故窗口同時出現以下症狀：

- 支付 provider timeout 後，client 以新 payment ID 重試；callback 重放又使部分訂單重複入帳。
- KV 某個 partition 變成熱點，failover 後讀到舊版本；ID worker 發生時鐘回撥，短網址自訂碼也出現碰撞。
- 明星帳號發文使 Feed fanout queue 堆積，推薦索引落後；新聞突發事件觸發推送渠道重試風暴。
- Pub/Sub consumer 短暫斷線後遺失訊息；司機位置過期但仍被派單；排行榜重播事件使分數加兩次。
- 影片轉碼佇列和 CDN egress 成本同時上升，熱門短網址和熱門影片又造成快取熱點。

你不能用「全部改成強一致」、「所有請求都重試」、「再加機器」或「把資料全部放進單一 Redis」作為完整答案。

## 作答要求

請以 senior system design interview 的形式回答，並清楚標出不變量、容量假設、同步邊界與降級路徑：

1. **容量與 SLO**：為 API、Feed、搜尋、聊天、定位、支付、轉碼、重定向與排行榜列出峰值速率、有效容量、headroom、P95／P99 延遲與 bounded queue／最大等待時間；指出哪些流量要在入口拒絕或排隊。
2. **交易與唯一性**：設計支付 ledger／狀態機、KV 分片副本、ID 產生器、短網址碼與排行榜事件的 authoritative write；處理 provider unknown、時鐘回撥、碰撞、重播、late event 和跨分片查詢。
3. **即時交付**：設計長連線、presence、Pub/Sub 加 durable log、cursor／ACK／重連補拉、位置 TTL、派單 claim、行程狀態與聊天群組 fanout；說明如何避免遺失、重複、亂序和幽靈派單。
4. **Feed、搜尋與推薦**：比較讀／寫 fanout、召回／排序、倒排／補全索引、推送 audience expansion、快取與權限過濾；處理明星帳號、突發新聞、索引落後、冷啟動、刪除和封鎖。
5. **媒體與成本**：設計分片上傳、轉碼佇列、內容審核、HLS／DASH、ABR、CDN、熱冷儲存與預熱，並量化頻寬、儲存、轉碼和重試的成本取捨。
6. **故障與恢復**：說明 Redis／DB／索引／provider／broker／CDN／worker／region 故障時的 timeout、circuit breaker、降級、重播、對帳、repair command、RPO／RTO 與人工介入邊界。
7. **驗證計畫**：列出至少十二項指標或故障注入測試，證明容量上限、正確性不變量、訊息交付、隱私刪除、播放品質與成本告警有效。

## 期待證據

- 有一張容量表或等價的數字推導，能指出入口流量不能直接穿透到支付、資料庫、轉碼和推送供應商；queue 有 bounded capacity、queue age、backpressure 和拒絕／pending 語意。
- 支付使用 stable idempotency key 和 provider operation ID；callback、timeout、worker crash、outbox 重放都只能讓狀態機前進或進入待對帳，不能新增一次扣款。
- KV 的分片與副本有明確版本／quorum／修復語意；ID 的 worker、序列、時鐘回撥和節點租約不會產生重複 ID；短碼 collision 有 authoritative unique claim。
- 聊天和 Pub/Sub 分離即時通知與 durable history；cursor、ACK、去重和重連補拉能證明訊息不遺失；派單使用位置 freshness 與原子 claim。
- Feed／推薦／搜尋／推送能區分內容新鮮度與安全權限；明星與突發事件使用混合 fanout、限流、批次、頻率上限、fallback 和可回放事件。
- 媒體管線有工作佇列、重試上限、DLQ、取消與版本；ABR／CDN 設計以首幀、rebuffer、cache hit、egress 和熱冷分層等指標驗證。
- 觀測至少涵蓋：各入口 reject、queue depth／age、P95／P99、duplicate idempotency hit、ledger mismatch、stale read、ID collision、message gap／duplicate、location freshness、match success、index lag、fanout backlog、push delivery、rebuffer、CDN egress、成本異常與 reconciliation backlog。
- 能說明哪些資料可以最終一致、哪些資料必須停寫或快速失敗；未知狀態都有 owner、期限、查詢／對帳或人工 repair 路徑。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 方案把所有模組當成單一同步服務，沒有容量邊界；會重複扣款、遺失訊息、產生重複 ID 或在尖峰時無限排隊。 |
| 1 | 能列出 Redis、Kafka、CDN、WebSocket、搜尋索引等名詞，但沒有 authoritative source、狀態機、容量預算、背壓或驗證證據。 |
| 2 | 能完成部分模組的可行設計，但遺漏至少兩個核心面向，或無法處理未知結果、熱點、重播、權限刪除與跨區故障。 |
| 3 | 能以容量預算拆分同步／非同步邊界，完成支付與 ID 正確性、即時交付、Feed／搜尋／推薦、媒體管線和主要故障恢復設計，並說明取捨。 |
| 4 | 除上述內容外，能量化 headroom 和成本，處理多層重試、late event、熱點、region failure、隱私刪除和 repair replay，並以不變量、故障注入與端到端 SLO 證明設計。 |

### 通過標準

四個核心面向——容量與延遲、正確性與一致性、失敗恢復、成本與可觀測性——各以 0–4 分評分。總平均達 **3/4 分**才通過，且四個面向均不得低於 2 分；支付不重複扣款、ID 全域唯一、訊息可重放補拉、有效派單不重複與影片刪除可追溯五項不變量不得被犧牲。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

### 1. 容量預算與隔離

入口依業務副作用分成查詢、可重試事件和不可重複副作用三類。Feed、搜尋、重定向可用 CDN／快取吸收讀流量，但支付 authorize、ID claim、派單 claim、ledger write、短碼 claim 和排行榜 authoritative update 必須經過有界 admission。每個 worker pool、provider、資料庫 shard 和轉碼佇列都設定 concurrency、QPS、queue age 和最大等待時間；超過預算時回傳 429、503、PENDING 或明確 fallback，而不是讓每一層自行重試。

以支付 500 req/s 為例，入口保留 headroom，將 checkout claim 和 provider authorize 分離；以 20,000 個影片／小時估算轉碼 profile 的工作量，限制同時處理的影片和每個租戶配額。聊天長連線與訊息消費使用獨立的連線、broker 和儲存池，避免 Feed 或影片工作耗盡 thread、CPU、網路和資料庫連線。

### 2. 交易、KV、ID、短碼與排行榜

支付以 payment operation ID 和 client idempotency key 建立唯一約束；provider timeout 進入 UNKNOWN，先查詢或對帳，不能用新 payment ID 盲目重試。ledger 只接受冪等 append 或條件狀態轉移，callback 經 inbox 去重，outbox 讓訂單、通知和清算事件可重放。所有未知狀態有期限，逾期進 reconciliation queue。

KV 以 hash 或 range 分片和一致的 routing metadata 管理副本；讀寫使用版本、quorum 或明確的 eventual consistency，hot partition 以 virtual node、key salting 或限流處理，修復以 log、snapshot 和 checksum 驗證。ID 服務用 worker lease、時間戳與序列生成唯一值；時鐘回撥時停止該 worker、切換安全序列或配置新 epoch。短網址先對自訂碼做唯一 claim，系統碼以安全 ID 轉碼，重定向查詢走快取但以 authoritative mapping 驗證。排行榜事件帶 event ID、版本或序號，consumer inbox 去重，時間窗和同分規則固定，重播結果必須相同。

### 3. 即時訊息、定位與交付

WebSocket gateway 只持有連線和 session／presence，訊息先寫 durable log，再發布 Pub/Sub notification。每個聊天室或會話有可比較的序號；client 保存 cursor，重連先從 durable history 補拉，再切換到 live stream。ACK、去重、重放和保留期限要有明確責任，不把 Pub/Sub 的即時收到當成已持久化或已讀。

司機位置帶 observed_at、region／cell 和 TTL；匹配只使用尚未過期且狀態為 available 的司機。候選挑選後以 request ID、driver ID 和版本做原子 claim，只有一個派單成功，晚到的接單回應只能讀取已終結狀態。定位、匹配和行程事件使用 bounded queue；位置流失真時可以放大搜尋半徑、降低推薦品質或暫停接單，但不能把過期位置當成即時位置。

### 4. Feed、搜尋、推薦與推送

社交 Feed 對一般作者採 fanout-on-write，對明星作者採 fanout-on-read，讀取時合併並以時間／相關性排序；fanout queue 有作者和使用者級配額。Feed 可以最終一致，但封鎖、刪除和權限必須在讀路徑或安全索引上快速生效。搜尋使用倒排與補全索引的增量事件，查詢 fanout 設定 deadline，索引落後時提供明確舊版本或簡化排序；權限不能只在離線索引時判斷。

推薦拆成候選召回、排序、探索、多樣性和冷啟動；新鮮內容與熱門兜底不應依賴單一模型。新聞推送先做 audience expansion、頻率上限和 quiet hours，再按渠道 quota 分批發送；provider 失敗用有界退避和 fallback，不讓每個使用者、每個渠道和每個 worker 同時重試。所有曝光、送達、退訂和刪除事件可追蹤且可重放。

### 5. 媒體、CDN 與成本

上傳使用 signed URL 和 multipart resumable upload，metadata 只在 object checksum 和安全掃描完成後進入可播放狀態。轉碼工作以 content version、profile 和 job ID 去重；失敗進 DLQ 或取消，不因重試產生多份不可使用的資產。播放使用 HLS／DASH manifest、ABR、Range request 和 CDN，對熱門影片做預熱或邊緣快取，冷內容移到低成本儲存。用首幀時間、rebuffer、bitrate switch、cache hit、origin egress、轉碼 CPU／queue age 和每小時成本作為共同決策依據。

### 6. 故障、對帳與驗證

資料庫、broker、索引、provider、CDN 或 region 故障時，先縮小 admission、隔離故障池、停止不可證明安全的副作用，再用 bounded retry、circuit breaker、重播、reconciliation 和人工 repair 收斂。應注入 provider timeout 後 callback 重放、DB commit 後 ACK 遺失、KV stale read、ID clock rollback、broker 斷線重連、driver location 過期、排行榜 duplicate event、明星 Feed 熱點、搜尋 reindex、轉碼 worker crash、CDN miss storm 和隱私刪除。成功標準是不重複扣款、不重複 ID、不遺失可補拉訊息、不重複派單，且所有未知狀態都能在期限內收斂或進人工佇列。

</details>

## 常見失分點

- 用單一資料庫或 Redis 承擔所有交易、Feed、presence、索引和媒體 metadata，沒有容量或故障隔離。
- 將 provider timeout 當成失敗並建立新 payment ID，或把 callback／事件重放當成新的副作用。
- 只說 Snowflake、UUID、hash 或自動遞增，沒有處理 worker 重複、時鐘回撥、碰撞和唯一 claim。
- 把 Pub/Sub 當成 durable history；沒有 cursor、ACK、去重、補拉和聊天室序號。
- 對所有作者採寫擴散、對所有搜尋採同步 fanout，沒有明星熱點、索引 lag、權限和 tail latency 方案。
- 將過期司機位置當成可用位置，或用非原子流程讓兩名司機同時取得同一行程。
- 只討論影片畫質，不談轉碼佇列、CDN egress、熱冷分層、取消和重試成本。
- 只列出元件名稱，沒有 queue age、headroom、SLO、故障注入、不變量與對帳證據。

## 延伸追問

1. 如果支付供應商無法提供查詢 API，如何界定 UNKNOWN 的最長存活時間與人工對帳責任？
2. 如果某個 KV key 或短網址佔 90% 流量，如何避免單一 shard、cache node 或 origin 被打穿？
3. 如果 ID 產生器的時間來源回撥且所有預留序列快用完，哪些請求可以安全成功，哪些必須暫停？
4. 如果明星帳號有十億粉絲，如何混合讀／寫 fanout，並保證刪文和封鎖在可接受時間內生效？
5. 如果聊天室歷史儲存落後但 Pub/Sub 還在送訊息，client 應看到什麼狀態，如何避免錯誤 ACK？
6. 如果司機位置流在一個 region 延遲 10 秒，平台要如何調整匹配半徑、價格和接單資格？
7. 如果搜尋索引落後一小時，哪些 query 可以用舊結果，哪些涉及權限或刪除必須拒絕？
8. 如果 CDN 預熱降低首幀延遲卻提高 egress 成本，如何用 QoE、熱度與租戶配額決定預熱？
9. 如果排行榜需要可審計的賽季結算，如何用事件快照、重播和手動修正保證最終名次？
10. 如果跨 region 只保證最終一致，哪些資料可以就近寫入，哪些資料必須回到單一 authoritative region？
