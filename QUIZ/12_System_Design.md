# 大型系統設計 - 重點考題 (Quick Quiz)

> 這份考題聚焦限量資源、高併發流量、分散式鎖與交易狀態，適合在閱讀大型系統設計文章後快速檢查是否能說出關鍵取捨。

## ⚙️ 限量資源與高併發設計

<a id="q1"></a>
### Q1: 秒殺系統如何在流量洪峰下保護庫存與下游？
<!-- Concept ID: concept.system-design.flash-sale.capacity-protection; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9) | **重要性**: 🔴 必考

請從流量分層、限流、排隊、庫存扣減、非同步處理與失敗補償說明設計。

<details>
<summary>💡 答案提示</summary>

- 在 CDN／Gateway／應用層先擋掉無效或過量請求，以 token bucket、排隊與 admission control 把尖峰轉成系統可承受的速率。
- 庫存扣減必須是原子且可驗證的，不可只依賴快取顯示；成功取得配額後再建立有期限的訂單或 reservation。
- 付款、通知與非關鍵工作走可靠事件流；每個請求需有冪等鍵、狀態查詢與逾時補償，避免重試造成重複扣庫存。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_flash_sale_system.md)

<a id="q2"></a>
### Q2: 分散式鎖真正需要保證哪些性質？
<!-- Concept ID: concept.system-design.distributed-lock.correctness; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請比較 Redis、ZooKeeper／共識服務的鎖模型，並說明租約過期、續期、網路分區與持有者失聯時如何避免兩個 client 同時執行危險操作。

<details>
<summary>💡 答案提示</summary>

- 互斥只是起點，還要處理 ownership token、租約、釋放者驗證、fencing token、時鐘與網路分區；不能把 client timeout 當成鎖已安全釋放。
- Redis-based lease 低延遲但需要明確的 token 與 fencing；共識服務能提供更強的順序與 session 語意，但有協調成本與可用性取捨。
- 下游資源也要檢查 fencing token，否則舊持有者恢復後仍可能覆寫新持有者的結果。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_distributed_lock.md)

<a id="q3"></a>
### Q3: 購票系統如何避免超賣與「占位不付款」？
<!-- Concept ID: concept.system-design.ticket-booking.oversell-prevention; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9) | **重要性**: 🔴 必考

請設計座位或票券的 hold、付款、逾時釋放與最終出票流程，說明一致性與使用者體驗的取捨。

<details>
<summary>💡 答案提示</summary>

- 票券 authoritative state 應以條件更新、序列化分片或一致性 reservation 保證最多一個有效持有者；商品頁的 stale read 不能作為最後判斷。
- hold 必須有 expiration、owner／order ID 與冪等狀態機；付款結果未知時先查詢，不以新 request 盲目重扣。
- 逾時掃描與事件重放都必須冪等；可接受以 `PENDING` 換取不超賣，不能為了同步成功率放寬硬不變量。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_ticket_booking_system.md)


<a id="q6-distributed-kv-consistency"></a>
### Q6: 分散式 KV 儲存如何在分片與一致性之間取捨？
<!-- Concept ID: concept.system-design.distributed-kv.sharding-consistency; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9) | **重要性**: 🔴 必考

請說明分片、重平衡、副本、quorum、熱點與故障修復如何共同決定讀寫語意。

<details>
<summary>💡 答案提示</summary>

- 先定義 key 路由、virtual node、分片容量與重平衡期間的讀寫版本。
- 副本與 quorum 不是免費的強一致；要說明 stale read、寫入衝突、修復與可用性的取捨。
- 熱 key 需要限流、拆分或快取保護，並以 repair lag、讀寫延遲和版本衝突驗證。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_distributed_key_value_store.md)

<a id="q7-instagram-media-delivery"></a>
### Q7: Instagram 類平台如何同時處理媒體管線與個人化 Feed？
<!-- Concept ID: concept.system-design.instagram.media-feed-delivery; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9) | **重要性**: 🔴 必考

請把直傳、轉碼、物件儲存、CDN、Feed fanout、Stories TTL 與刪除流程拆開說明。

<details>
<summary>💡 答案提示</summary>

- 大檔案走 signed upload 和非同步轉碼，metadata 只有在安全掃描與版本確認後才進入可見狀態。
- 一般作者可寫擴散，熱點作者和探索內容可讀擴散；Feed 與媒體快取要有失效與權限邊界。
- 用首幀、CDN 命中、轉碼 queue age、審核延遲、頻寬和儲存成本驗證設計。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_instagram_system.md)

<a id="q8-instant-messaging-reliability"></a>
### Q8: 億級即時通訊系統如何保證離線訊息不丟失且不重複？
<!-- Concept ID: concept.system-design.instant-messaging.reliable-realtime-delivery; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請說明長連線、presence、持久化、ACK、順序、離線補拉與群組 fanout 的責任邊界。

<details>
<summary>💡 答案提示</summary>

- WebSocket gateway 只管理連線；訊息先寫 durable history，再用通知通道即時派送。
- client 保存 cursor，重連先補拉再接 live stream；message ID、聊天室序號和 ACK 要能去重與重放。
- 以 connection count、delivery latency、duplicate rate、offline backlog 和 broker lag 驗證。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_instant_messaging_system.md)

<a id="q9-linkedin-graph-search"></a>
### Q9: LinkedIn 類平台如何把職業圖譜、搜尋與隱私權限整合？
<!-- Concept ID: concept.system-design.linkedin.professional-graph-search; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9) | **重要性**: 🔴 必考

請設計連結圖、職缺與個人檔案的索引、Feed、推薦和 viewer-based visibility。

<details>
<summary>💡 答案提示</summary>

- 交易資料與搜尋索引分離，但可見性、封鎖和刪除要在查詢路徑再次驗證。
- 搜尋召回、語意配對和 Feed 排序要有新鮮度、品質、冷啟動與 tail latency 邊界。
- 以 index lag、權限誤曝、搜尋 P99、配對轉換和刪除收斂時間驗證。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_linkedin_system.md)

<a id="q10-news-push-capacity"></a>
### Q10: 新聞推送系統如何避免突發新聞造成渠道雪崩與過度打擾？
<!-- Concept ID: concept.system-design.news-feed-push.personalized-delivery; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請設計 audience expansion、頻率上限、多渠道 quota、重試、fallback 和 quiet hours。

<details>
<summary>💡 答案提示</summary>

- 先限制受眾展開和每個使用者的頻率，再按 App Push、簡訊、Email 的供應商容量分批送出。
- 使用 stable event ID 去重；provider timeout 只能 bounded retry 或進待重送／對帳，不可每層各自重試。
- 以 queue age、provider quota、delivery rate、退訂率和每千次送達成本觀測。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_news_feed_push_system.md)

<a id="q11-news-recommendation-freshness"></a>
### Q11: 新聞推薦系統如何在新鮮度、個人化與多樣性之間取捨？
<!-- Concept ID: concept.system-design.news-recommendation.ranking-freshness; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請拆分內容採集、去重、特徵、召回、排序、探索、冷啟動和安全兜底。

<details>
<summary>💡 答案提示</summary>

- 內容事件需可追蹤、可重放，去重和索引更新不能讓突發新聞被長時間排在舊內容後面。
- 召回、排序、多樣性和探索使用不同延遲預算，模型失敗時要有熱門與時間排序兜底。
- 同時觀測曝光、點擊、留存、新鮮度、延遲、偏差和內容安全指標。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_news_recommendation_system.md)

<a id="q12-payment-idempotency"></a>
### Q12: 支付系統如何在 timeout 與重試下保證帳務不重複扣款？
<!-- Concept ID: concept.system-design.payment.idempotent-ledger; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9) | **重要性**: 🔴 必考

請設計 payment state machine、ledger、provider operation ID、callback 去重與 reconciliation。

<details>
<summary>💡 答案提示</summary>

- 以 client idempotency key 和 provider operation ID 建立唯一邊界，timeout 進 UNKNOWN 而不是直接失敗。
- ledger 使用冪等寫入和條件狀態轉移，callback 走 inbox，對帳可重放且不產生第二次副作用。
- 以 ledger invariant、duplicate hit、unknown backlog、provider timeout 和 reconciliation age 驗證。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_payment_system.md)

<a id="q13-leaderboard-ranking"></a>
### Q13: 即時排行榜如何在高頻更新下維持排名正確與低延遲？
<!-- Concept ID: concept.system-design.realtime-leaderboard.ranking-consistency; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請比較 sorted set、分片聚合、時間窗、同分排序、鄰近排名與事件重播。

<details>
<summary>💡 答案提示</summary>

- 更新事件帶 event ID 或版本，consumer 去重；同分規則和賽季邊界要是明確的 authoritative policy。
- 分片榜與全球榜要說明聚合延遲、查詢 P99、熱點和快照恢復。
- 以 duplicate event、late event、replay、rank drift、update throughput 和 read latency 測試。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_realtime_leaderboard_system.md)

<a id="q14-ride-matching-consistency"></a>
### Q14: 共乘打車系統如何處理即時定位、競爭接單與故障降級？
<!-- Concept ID: concept.system-design.ride-sharing.location-matching; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9) | **重要性**: 🔴 必考

請設計位置 TTL、地理分區、匹配、原子 claim、行程狀態與尖峰降級。

<details>
<summary>💡 答案提示</summary>

- 位置事件要帶 observed time 和 TTL，過期司機不得進入可派單候選。
- 候選選擇後以 request、driver 和版本做原子 claim，晚到接單只能讀取終態。
- 以 location freshness、match success、double assignment、surge latency 和 region failover 驗證。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_ride_sharing_system.md)

<a id="q15-search-autocomplete-latency"></a>
### Q15: 搜尋與自動補全如何同時維持索引新鮮度與低 tail latency？
<!-- Concept ID: concept.system-design.search-autocomplete.index-latency; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請說明倒排索引、補全索引、查詢 fanout、快取、排序、reindex 和權限過濾。

<details>
<summary>💡 答案提示</summary>

- 索引更新採增量事件和可重建 snapshot；查詢 deadline 到期時使用明確的簡化或舊版本結果。
- 熱門 prefix 和 hot shard 需要快取、拆分或限流；權限不可只依賴離線索引。
- 以 index lag、P99、cache hit、召回品質、權限誤曝和 reindex recovery time 驗證。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_search_engine_autocomplete.md)

<a id="q16-social-feed-boundary"></a>
### Q16: 社交平台總覽中，哪些資料要強一致，哪些可以最終一致？
<!-- Concept ID: concept.system-design.social-platform.feed-graph-evolution; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9) | **重要性**: 🔴 必考

請比較社交圖、Feed、互動計數、權限、刪除、排序與多區域讀寫的同步邊界。

<details>
<summary>💡 答案提示</summary>

- 關係變更、封鎖和可見性是安全邊界；Feed 和排序結果可短暫最終一致，但讀路徑仍要過濾。
- 用混合 fanout、快取和事件回放處理熱點，並保留時間排序兜底。
- 以 feed lag、delete convergence、privacy violation、fanout backlog 和成本驗證。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_social_platform.md)

<a id="q17-twitter-hybrid-fanout"></a>
### Q17: 類 Twitter 平台如何用混合 fanout 解決明星帳號熱點？
<!-- Concept ID: concept.system-design.twitter-like.hybrid-fanout; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9) | **重要性**: 🔴 必考

請說明普通作者與明星作者的讀寫擴散邊界、timeline 合併、快取和刪文。

<details>
<summary>💡 答案提示</summary>

- 普通作者可 fanout-on-write，明星作者改為 fanout-on-read，讀取時合併排序並設定 deadline。
- 對作者、粉絲、queue 和 cache 分別限流，避免單一貼文產生無界寫入。
- 以 fanout backlog、timeline P99、明星熱點、刪除延遲和儲存成本觀測。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_twitter_like_social_platform.md)

<a id="q18-twitter-capacity-hotspot"></a>
### Q18: Twitter 類平台如何從容量估算推導 timeline 與熱點治理？
<!-- Concept ID: concept.system-design.twitter.timeline-hotspot; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9) | **重要性**: 🔴 必考

請從 DAU、發文、Feed 讀取、儲存、搜尋與多機房故障推導架構。

<details>
<summary>💡 答案提示</summary>

- 先拆寫入 QPS、Feed 讀取 QPS、儲存成長和快取容量，再決定分片和 fanout 策略。
- Home、User、List timeline 與趨勢的 consistency、cache invalidation 和降級語意要分開。
- 以 P95/P99、hot key、cross-region lag、delete audit、rate limit 和成本驗證。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_twitter_system.md)

<a id="q19-unique-id-safety"></a>
### Q19: 分散式 ID 產生器如何同時保證唯一性、順序與高可用？
<!-- Concept ID: concept.system-design.unique-id.global-ordering; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較資料庫自增、號段、UUID 與 Snowflake 類方案，處理 worker 重複和時鐘回撥。

<details>
<summary>💡 答案提示</summary>

- 先區分全域唯一、趨勢遞增、嚴格遞增和不可猜測，再選擇欄位與分配方式。
- worker lease、epoch、sequence exhaustion 和 clock rollback 必須有安全停寫或切換行為。
- 以 collision、rollback、throughput、allocation lag、failover 和資訊洩漏風險驗證。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_unique_id_generator.md)

<a id="q20-video-streaming-cost"></a>
### Q20: 串流影音平台如何在播放品質與轉碼、CDN 成本間取捨？
<!-- Concept ID: concept.system-design.video-streaming.abr-cdn-cost; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9) | **重要性**: 🔴 必考

請設計分片上傳、轉碼、HLS/DASH、ABR、CDN、熱冷儲存和刪除。

<details>
<summary>💡 答案提示</summary>

- 上傳和轉碼使用可重試 job、content version、profile 去重，完成安全掃描後才發布 manifest。
- ABR、首幀、rebuffer、CDN hit、origin egress 與熱冷分層共同決定 profile 和預熱。
- 以 QoE、轉碼 queue age、失敗重試、儲存、頻寬和每小時成本驗證。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_video_streaming_service.md)

<a id="q21-tiny-url-redirect"></a>
### Q21: 短網址系統如何在讀多寫少下保證短碼唯一與重定向可用？
<!-- Concept ID: concept.system-design.tiny-url.redirect-availability; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請比較 hash、全域 ID、隨機碼、自訂碼、快取、過期與 301/302 語意。

<details>
<summary>💡 答案提示</summary>

- 自訂碼和系統碼都要經 authoritative unique claim，collision 不能只靠機率假設。
- 重定向讀路徑用 cache、replica 和熱點保護，過期與刪除要有清晰的 status 語意。
- 以 redirect P99、cache hit、hot key、abuse rate、collision、統計延遲和成本驗證。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/how_to_design_a_tiny_url_system.md)

<a id="q22-reliable-chat-pubsub"></a>
### Q22: 為什麼單獨使用 Pub/Sub 無法建立可靠聊天系統？
<!-- Concept ID: concept.system-design.reliable-chat.pubsub-durability; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請比較即時通知與 durable history，設計 cursor、ACK、重連補拉、去重和保留期限。

<details>
<summary>💡 答案提示</summary>

- Pub/Sub 只負責即時通知，持久化 log 或資料庫才是離線與重連的 authoritative history。
- 每個聊天室有序號，client 用 cursor 補拉；message ID 和 inbox 去重可吸收重放。
- 以 message gap、duplicate、reconnect catch-up、retention、fanout lag 和成本驗證。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/reliable_chat_system_with_pubsub.md)

<a id="q4"></a>
### Q4: 秒殺的非同步佇列如何避免把延遲轉成失控堆積？
<!-- Concept ID: concept.system-design.flash-sale.capacity-protection; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請說明 queue depth、consumer throughput、丟棄或降級策略、重試與 DLQ 如何共同形成容量保護。

<details>
<summary>💡 答案提示</summary>

- Queue 是緩衝器，不是無限容量；要設定 admission 上限、最大等待時間、consumer concurrency、backpressure 與 queue age SLO。
- 同一業務請求使用穩定 idempotency key，重試和 DLQ 必須保留上下文；不能讓每一層都獨立重試造成 retry storm。
- 當 queue age 或庫存 reservation deadline 超過門檻，應快速拒絕、停止接單或明確回傳 pending，而不是繼續堆積。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_flash_sale_system.md)

<a id="q5"></a>
### Q5: 在座位鎖定、支付與出票之間，哪些操作可以最終一致？
<!-- Concept ID: concept.system-design.ticket-booking.oversell-prevention; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9) | **重要性**: 🔴 必考

請區分座位可售狀態、訂單狀態、支付結果與通知的 authoritative source，並說明跨服務失敗時如何對帳與補償。

<details>
<summary>💡 答案提示</summary>

- 座位 reservation 與支付 operation 必須有唯一識別碼與明確狀態機；支付 timeout 是 unknown，不可直接視為失敗。
- 訂單可以暫存 `PENDING`，通知與搜尋索引可最終一致，但不能在 authoritative reservation／payment 未確認時顯示已出票。
- 使用 outbox／inbox、冪等 consumer 與 reconciliation job 對齊座位、訂單、支付 ledger；補償失敗要進人工處理，不可靜默覆蓋。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_ticket_booking_system.md)
