# Backend Storage／API／Messaging／Search Incident：跨資料、快取、事件與查詢邊界

- **Assessment ID**: `assessment.backend.storage-api-messaging-search.incident.v1`
- **主要 Concept ID**: `concept.database.performance-tuning.query-index-optimization`
- **次要 Concept IDs**:
  - `concept.database.transaction-isolation`
  - `concept.backend.cache.consistency-invalidation`
  - `concept.elasticsearch.data-sync`
  - `concept.messaging.kafka.consumer-rebalance`
  - `concept.api.versioning.compatibility-strategy`
  - `concept.api.realtime.websocket-long-polling`
- **對應文章**: 34 篇，依 storage、cache、search、messaging 與 API track 列於下方
- **題型**: `生產事故診斷`, `跨系統一致性`, `容量與可靠性設計`, `API 合約與即時通訊取捨`
- **難度**: 10
- **重要程度**: 5
- **建議作答時間**: 75 分鐘
- **標籤**: `Database`, `Transaction`, `Index`, `Replication`, `Sharding`, `Cache`, `Elasticsearch`, `Kafka`, `RabbitMQ`, `API`, `GraphQL`, `WebSocket`
- **Learning Objective IDs**:
  - `concept.database.normalization.normal-forms/LO-1`
  - `concept.database.normalization.normal-forms/LO-2`
  - `concept.database.normalization.normal-forms/LO-3`
  - `concept.database.selection.sql-nosql-tradeoffs/LO-1`
  - `concept.database.selection.sql-nosql-tradeoffs/LO-2`
  - `concept.database.selection.sql-nosql-tradeoffs/LO-3`
  - `concept.database.indexing.b-tree-lsm-tree/LO-1`
  - `concept.database.indexing.b-tree-lsm-tree/LO-2`
  - `concept.database.indexing.b-tree-lsm-tree/LO-3`
  - `concept.database.high-availability.replication-failover/LO-1`
  - `concept.database.high-availability.replication-failover/LO-2`
  - `concept.database.high-availability.replication-failover/LO-3`
  - `concept.database.transaction-isolation/LO-1`
  - `concept.database.transaction-isolation/LO-2`
  - `concept.database.transaction-isolation/LO-3`
  - `concept.database.sharding.distribution-strategies/LO-1`
  - `concept.database.sharding.distribution-strategies/LO-2`
  - `concept.database.sharding.distribution-strategies/LO-3`
  - `concept.database.migration.zero-downtime/LO-1`
  - `concept.database.migration.zero-downtime/LO-2`
  - `concept.database.migration.zero-downtime/LO-3`
  - `concept.database.read-write-splitting.replication-lag/LO-1`
  - `concept.database.read-write-splitting.replication-lag/LO-2`
  - `concept.database.read-write-splitting.replication-lag/LO-3`
  - `concept.database.performance-tuning.query-index-optimization/LO-1`
  - `concept.database.performance-tuning.query-index-optimization/LO-2`
  - `concept.database.performance-tuning.query-index-optimization/LO-3`
  - `concept.backend.cache.failure-modes/LO-1`
  - `concept.backend.cache.failure-modes/LO-2`
  - `concept.backend.cache.failure-modes/LO-3`
  - `concept.backend.cache.consistency-invalidation/LO-1`
  - `concept.backend.cache.consistency-invalidation/LO-2`
  - `concept.backend.cache.consistency-invalidation/LO-3`
  - `concept.backend.cache.multi-tier-l1-l2-consistency/LO-1`
  - `concept.backend.cache.multi-tier-l1-l2-consistency/LO-2`
  - `concept.backend.cache.multi-tier-l1-l2-consistency/LO-3`
  - `concept.backend.cache.cdn-edge-caching/LO-1`
  - `concept.backend.cache.cdn-edge-caching/LO-2`
  - `concept.backend.cache.cdn-edge-caching/LO-3`
  - `concept.backend.cache.access-strategies-read-write-patterns/LO-1`
  - `concept.backend.cache.access-strategies-read-write-patterns/LO-2`
  - `concept.backend.cache.access-strategies-read-write-patterns/LO-3`
  - `concept.backend.cache.eviction-algorithms/LO-1`
  - `concept.backend.cache.eviction-algorithms/LO-2`
  - `concept.backend.cache.eviction-algorithms/LO-3`
  - `concept.backend.cache.warming-update-strategies/LO-1`
  - `concept.backend.cache.warming-update-strategies/LO-2`
  - `concept.backend.cache.warming-update-strategies/LO-3`
  - `concept.elasticsearch.shards-replicas.routing/LO-1`
  - `concept.elasticsearch.shards-replicas.routing/LO-2`
  - `concept.elasticsearch.shards-replicas.routing/LO-3`
  - `concept.elasticsearch.performance-optimization/LO-1`
  - `concept.elasticsearch.performance-optimization/LO-2`
  - `concept.elasticsearch.performance-optimization/LO-3`
  - `concept.elasticsearch.core.inverted-index/LO-1`
  - `concept.elasticsearch.core.inverted-index/LO-2`
  - `concept.elasticsearch.core.inverted-index/LO-3`
  - `concept.elasticsearch.mapping.text-keyword/LO-1`
  - `concept.elasticsearch.mapping.text-keyword/LO-2`
  - `concept.elasticsearch.mapping.text-keyword/LO-3`
  - `concept.elasticsearch.query-dsl.search-clauses/LO-1`
  - `concept.elasticsearch.query-dsl.search-clauses/LO-2`
  - `concept.elasticsearch.query-dsl.search-clauses/LO-3`
  - `concept.elasticsearch.data-sync/LO-1`
  - `concept.elasticsearch.data-sync/LO-2`
  - `concept.elasticsearch.data-sync/LO-3`
  - `concept.elasticsearch.aggregations.cardinality/LO-1`
  - `concept.elasticsearch.aggregations.cardinality/LO-2`
  - `concept.elasticsearch.aggregations.cardinality/LO-3`
  - `concept.messaging.rabbitmq.dead-letter-exchange/LO-1`
  - `concept.messaging.rabbitmq.dead-letter-exchange/LO-2`
  - `concept.messaging.rabbitmq.dead-letter-exchange/LO-3`
  - `concept.messaging.rabbitmq.message-acknowledgement/LO-1`
  - `concept.messaging.rabbitmq.message-acknowledgement/LO-2`
  - `concept.messaging.rabbitmq.message-acknowledgement/LO-3`
  - `concept.messaging.rabbitmq.exchange-routing/LO-1`
  - `concept.messaging.rabbitmq.exchange-routing/LO-2`
  - `concept.messaging.rabbitmq.exchange-routing/LO-3`
  - `concept.messaging.kafka.consumer-rebalance/LO-1`
  - `concept.messaging.kafka.consumer-rebalance/LO-2`
  - `concept.messaging.kafka.consumer-rebalance/LO-3`
  - `concept.messaging.message-queue.selection/LO-1`
  - `concept.messaging.message-queue.selection/LO-2`
  - `concept.messaging.message-queue.selection/LO-3`
  - `concept.messaging.kafka.core-components/LO-1`
  - `concept.messaging.kafka.core-components/LO-2`
  - `concept.messaging.kafka.core-components/LO-3`
  - `concept.api.graphql-rest.selection/LO-1`
  - `concept.api.graphql-rest.selection/LO-2`
  - `concept.api.graphql-rest.selection/LO-3`
  - `concept.api.authentication.authorization-mechanisms/LO-1`
  - `concept.api.authentication.authorization-mechanisms/LO-2`
  - `concept.api.authentication.authorization-mechanisms/LO-3`
  - `concept.api.rest.architectural-constraints/LO-1`
  - `concept.api.rest.architectural-constraints/LO-2`
  - `concept.api.rest.architectural-constraints/LO-3`
  - `concept.api.versioning.compatibility-strategy/LO-1`
  - `concept.api.versioning.compatibility-strategy/LO-2`
  - `concept.api.versioning.compatibility-strategy/LO-3`
  - `concept.api.realtime.websocket-long-polling/LO-1`
  - `concept.api.realtime.websocket-long-polling/LO-2`
  - `concept.api.realtime.websocket-long-polling/LO-3`

## 對應文章與 LO coverage

### Track A：Database storage、交易與容量

- [資料庫正規化](../../02_Backend_Development/Databases/database_normalization.md)（`concept.database.normalization.normal-forms`；LO-1～LO-3）
- [SQL vs. NoSQL](../../02_Backend_Development/Databases/sql_vs_nosql.md)（`concept.database.selection.sql-nosql-tradeoffs`；LO-1～LO-3）
- [資料庫索引](../../02_Backend_Development/Databases/database_indexing.md)（`concept.database.indexing.b-tree-lsm-tree`；LO-1～LO-3）
- [資料庫高可用](../../02_Backend_Development/Databases/database_high_availability.md)（`concept.database.high-availability.replication-failover`；LO-1～LO-3）
- [資料庫交易與 ACID](../../02_Backend_Development/Databases/database_transactions.md)（`concept.database.transaction-isolation`；LO-1～LO-3）
- [資料庫分片](../../02_Backend_Development/Databases/database_sharding.md)（`concept.database.sharding.distribution-strategies`；LO-1～LO-3）
- [資料庫遷移策略](../../02_Backend_Development/Databases/database_migration_strategies.md)（`concept.database.migration.zero-downtime`；LO-1～LO-3）
- [資料庫讀寫分離](../../02_Backend_Development/Databases/read_write_splitting.md)（`concept.database.read-write-splitting.replication-lag`；LO-1～LO-3）
- [資料庫效能調優](../../02_Backend_Development/Databases/database_performance_tuning.md)（`concept.database.performance-tuning.query-index-optimization`；LO-1～LO-3）

### Track B：Cache、CDN 與資料新鮮度

- [快取穿透、擊穿與雪崩](../../02_Backend_Development/Caching/cache_penetration_breakdown_avalanche.md)（`concept.backend.cache.failure-modes`；LO-1～LO-3）
- [分散式快取一致性](../../02_Backend_Development/Caching/distributed_cache_consistency.md)（`concept.backend.cache.consistency-invalidation`；LO-1～LO-3）
- [多層快取架構](../../02_Backend_Development/Caching/multi_tier_cache_architecture.md)（`concept.backend.cache.multi-tier-l1-l2-consistency`；LO-1～LO-3）
- [CDN 與邊緣快取](../../02_Backend_Development/Caching/cdn_and_edge_caching.md)（`concept.backend.cache.cdn-edge-caching`；LO-1～LO-3）
- [快取策略與模式](../../02_Backend_Development/Caching/cache_strategies_and_patterns.md)（`concept.backend.cache.access-strategies-read-write-patterns`；LO-1～LO-3）
- [快取淘汰演算法](../../02_Backend_Development/Caching/cache_eviction_algorithms.md)（`concept.backend.cache.eviction-algorithms`；LO-1～LO-3）
- [快取預熱與更新策略](../../02_Backend_Development/Caching/cache_warming_and_update_strategies.md)（`concept.backend.cache.warming-update-strategies`；LO-1～LO-3）

### Track C：Elasticsearch indexing、query 與同步

- [Elasticsearch 分片與副本](../../02_Backend_Development/Search_Engines/Elasticsearch/elasticsearch_shards_and_replicas.md)（`concept.elasticsearch.shards-replicas.routing`；LO-1～LO-3）
- [Elasticsearch 效能優化](../../02_Backend_Development/Search_Engines/Elasticsearch/elasticsearch_performance_optimization.md)（`concept.elasticsearch.performance-optimization`；LO-1～LO-3）
- [什麼是 Elasticsearch](../../02_Backend_Development/Search_Engines/Elasticsearch/what_is_elasticsearch.md)（`concept.elasticsearch.core.inverted-index`；LO-1～LO-3）
- [Elasticsearch Mapping 與分析器](../../02_Backend_Development/Search_Engines/Elasticsearch/elasticsearch_mapping_and_analyzers.md)（`concept.elasticsearch.mapping.text-keyword`；LO-1～LO-3）
- [Elasticsearch Query DSL](../../02_Backend_Development/Search_Engines/Elasticsearch/elasticsearch_query_dsl.md)（`concept.elasticsearch.query-dsl.search-clauses`；LO-1～LO-3）
- [Elasticsearch 資料同步](../../02_Backend_Development/Search_Engines/Elasticsearch/elasticsearch_data_sync.md)（`concept.elasticsearch.data-sync`；LO-1～LO-3）
- [Elasticsearch 聚合](../../02_Backend_Development/Search_Engines/Elasticsearch/elasticsearch_aggregations.md)（`concept.elasticsearch.aggregations.cardinality`；LO-1～LO-3）

### Track D：RabbitMQ 與 Kafka messaging reliability

- [RabbitMQ Dead-Letter Exchange](../../02_Backend_Development/Message_Queues/RabbitMQ/dead_letter_exchange.md)（`concept.messaging.rabbitmq.dead-letter-exchange`；LO-1～LO-3）
- [RabbitMQ message acknowledgement](../../02_Backend_Development/Message_Queues/RabbitMQ/message_acknowledgement.md)（`concept.messaging.rabbitmq.message-acknowledgement`；LO-1～LO-3）
- [RabbitMQ Exchange types](../../02_Backend_Development/Message_Queues/RabbitMQ/rabbitmq_exchange_types.md)（`concept.messaging.rabbitmq.exchange-routing`；LO-1～LO-3）
- [Kafka Consumer Group rebalance](../../02_Backend_Development/Message_Queues/Kafka/kafka_rebalance.md)（`concept.messaging.kafka.consumer-rebalance`；LO-1～LO-3）
- [Kafka 與其他訊息佇列比較](../../02_Backend_Development/Message_Queues/Kafka/kafka_vs_other_mq.md)（`concept.messaging.message-queue.selection`；LO-1～LO-3）
- [Kafka 核心組件](../../02_Backend_Development/Message_Queues/Kafka/kafka_core_components.md)（`concept.messaging.kafka.core-components`；LO-1～LO-3）

### Track E：API contract、security 與 realtime

- [GraphQL vs. REST](../../02_Backend_Development/API_Design/graphql_vs_rest.md)（`concept.api.graphql-rest.selection`；LO-1～LO-3）
- [API 驗證與授權](../../02_Backend_Development/API_Design/api_authentication_and_authorization.md)（`concept.api.authentication.authorization-mechanisms`；LO-1～LO-3）
- [RESTful API 設計原則](../../02_Backend_Development/API_Design/restful_api_principles.md)（`concept.api.rest.architectural-constraints`；LO-1～LO-3）
- [API 版本管理策略](../../02_Backend_Development/API_Design/api_versioning_strategies.md)（`concept.api.versioning.compatibility-strategy`；LO-1～LO-3）
- [WebSocket vs. Polling](../../02_Backend_Development/API_Design/WebSocket/websocket_vs_polling.md)（`concept.api.realtime.websocket-long-polling`；LO-1～LO-3）

## 測驗目標

- 能建立從 API request、資料庫 transaction、cache、search index 到 message consumer 的端到端證據時間線，區分事實、假設與推論。
- 能把資料正規化、SQL／NoSQL 選型、index／query plan、replication／failover、read-after-write、sharding 與 zero-downtime migration 放在同一個容量與一致性模型中。
- 能分析 cache failure mode、L1／L2／CDN 的新鮮度邊界、eviction 與 warming，並明確指出 source of truth 與失效收斂方式。
- 能從 inverted index、mapping／analyzer、Query DSL、shard／replica、aggregation 與 CDC／outbox 證據定位搜尋結果錯誤和延遲。
- 能區分 RabbitMQ 的 exchange／ack／DLX 與 Kafka 的 broker／partition／consumer group／rebalance，並設計可重試、可去重、可觀測的交付流程。
- 能以 REST／GraphQL 合約、驗證／授權、版本演進與 WebSocket／polling 的連線語義，設計不洩漏資料且可回滾的 API 變更。
- 能提出先止血、再修復所有權與一致性邊界、最後調整容量的分階段方案，且每一步都有成功指標、警戒線、rollback 與故障注入。

## 問題情境與限制條件

你負責一個多租戶電商平台。訂單、庫存與付款主資料放在關聯式資料庫；商品搜尋與聚合放在 Elasticsearch；Redis 同時承載 L1／L2 快取、session 與短期工作狀態；Kafka 保存領域事件，RabbitMQ 處理需要有界重試的工作命令；外部客戶使用 REST 與 GraphQL，瀏覽器以 WebSocket 接收即時狀態，低互動頁面仍使用 polling。

一次大型促銷活動後，監控在兩小時內出現下列症狀：

- /orders 與 GraphQL orderSummary 的 P99 從 180 ms 升至 4.8 s。資料庫 CPU 只有 55%，但 lock wait、connection pool wait、慢查詢與 deadlock 同時上升；某些租戶的查詢由 index range scan 退化成 full scan。
- 最近的 schema migration 為訂單搜尋欄位新增索引並調整資料拆表。migration 在一個 shard 完成、另一個 shard 中途失敗；團隊沒有清楚記錄 expand／backfill／contract 順序，也無法證明 rollback 不會遺失新欄位。
- 寫入主庫後立即查詢偶爾讀到舊資料；一批報表查詢為了降低主庫負載被導向 replica。failover 後部分請求仍黏到舊路由，RPO／RTO 也沒有與業務承諾對齊。
- 熱門商品的 cache key 同時被多個 app node 回填。某次 TTL 批次到期造成 cache avalanche，另一批不存在的商品造成 cache penetration；L1 invalidation 延遲時，部分節點回傳舊價格。CDN 對公開商品頁命中良好，但個人化價格的 Cache-Control／Vary 設定不一致。
- Redis 記憶體接近上限，eviction 與 command tail latency 上升；一個 hot key 和一個大 value 造成單執行緒延遲尖峰。有人提議直接把所有 TTL 拉長並關閉 eviction。
- Elasticsearch 的商品 index 出現 dynamic mapping 將價格與 SKU 建成不合適的欄位型別。搜尋使用 term 查詢全文欄位，聚合對 text 欄位失敗；查詢含深頁碼、寬 wildcard 與高 cardinality aggregation，部分 shard 回應 429。CDC consumer lag 上升，刪除事件偶爾晚於更新事件抵達。
- Kafka consumer 在資料庫寫入變慢時頻繁 rebalance；某服務在 side effect 完成前提交 offset，另一服務在 offset commit 後才發現外部 API timeout。RabbitMQ 的 consumer 使用過大的 prefetch，失敗訊息以 requeue=true 循環，DLX 沒有保存完整 retry metadata。
- API v2 移除了 v1 的欄位並改變錯誤格式；部分 client 仍使用舊 Accept header。GraphQL 查詢可任意巢狀且沒有 depth／cost 限制；一個 resolver 只檢查登入，沒有檢查租戶與資源 scope。WebSocket reconnect storm 讓 gateway 的連線數暴增，polling client 則因退避不一致對 API 造成額外流量。

限制條件：

1. 不得以「只增加 pod、只提高 connection pool、只延長 TTL、只增加 Kafka partition」作為唯一方案；所有容量變更都要先有預算、觀測與 rollback。
2. 訂單金額、庫存扣減、付款命令與租戶隔離不可因重試、cache stale、replica lag、事件重播或 API 版本共存而錯誤；允許的重複必須可辨識且安全吸收。
3. 搜尋索引是可重建的 read model，不得把它當作訂單 source of truth；快取、CDN、Kafka、RabbitMQ 與 WebSocket 的交付語義也不得被宣稱為 exactly-once。
4. migration、index、mapping、shard、replica、consumer、auth 與 API contract 變更都必須能小流量 rollout；高峰期不得執行沒有替代路徑的長時間 blocking 操作。
5. 不可關閉 durability、跳過授權、把所有請求導向 replica 或無限 requeue 來換取表面上的低延遲。

## 作答要求

1. **建立端到端時間線**：把 request、transaction、replica、cache、CDN、CDC、search、Kafka、RabbitMQ、WebSocket 的事件按時間排序，明確分開已證實事實、待驗證假設與可能的共同根因。
2. **完成 storage 診斷**：比較正規化與受控反正規化；為訂單、搜尋、session、事件與聚合資料選擇 SQL／NoSQL 或 read model；用 query plan、index selectivity、B+ Tree／LSM trade-off、鎖等待、隔離級別、replication lag 與 pool wait 證明瓶頸。
3. **設計 HA、sharding 與 migration**：提出 replication／failover、RPO／RTO、read-after-write、分片鍵與跨分片限制；以 expand、backfill、雙寫或 CDC、校驗、切換、contract 與 rollback 完成零停機遷移方案。
4. **處理 cache 與 CDN**：區分 penetration、breakdown、avalanche；設計 L1／L2 命中、失效、版本號、single-flight、負快取、隨機 TTL、eviction 與 warming；為公開、個人化與授權內容設定安全的 Cache-Control、Vary、ETag、purge 與回源策略。
5. **處理 Elasticsearch**：說明 inverted index、text／keyword、analyzer、term／match／bool／filter；規劃 shard／replica／routing、deep pagination、PIT／search_after、refresh、aggregation cardinality 與 Hot／Warm 分層；以 outbox／CDC、版本、tombstone、冪等與 replay 修復資料同步。
6. **處理 messaging reliability**：追蹤 Kafka broker／topic／partition／offset／consumer group 與 rebalance；為 RabbitMQ 選 exchange、publisher／consumer ack、prefetch、bounded retry、DLX 與 poison message 流程；說明 Kafka 與 RabbitMQ 在吞吐、路由、重播、順序與運維上的選型。
7. **處理 API 與 realtime**：在 REST 與 GraphQL 間做場景化選擇；保留向後相容、錯誤格式與棄用期；分離 authentication、authorization、tenant／resource scope 與 token lifecycle；比較 WebSocket、long-polling、polling 的連線、重連、心跳、斷線補償與水平擴展取捨。
8. **提出分階段修復與驗證**：至少三階段，每階段列出變更順序、成功指標、警戒線、rollback、資料校驗與至少六個故障注入或負載測試；不得以一次全面調參代替因果驗證。

## 期待證據

- Request／trace ID、租戶、API 版本、GraphQL operation name、resolver latency、HTTP status、auth decision、WebSocket connection／reconnect／heartbeat 與 polling backoff 的時間線。
- SQL／NoSQL schema、正規化邊界、query plan 的 estimated／actual rows、index usage、composite index 順序、covering／selectivity、B+ Tree／LSM 的讀寫放大與統計更新時間。
- Transaction isolation、lock wait、deadlock graph、長交易、MVCC snapshot、pool max／in-use／wait／timeout、資料庫 max connections、replica lag、failover log、RPO／RTO 與 restore drill。
- Shard key distribution、hot tenant、cross-shard query／transaction、rebalancing、migration checkpoint、backfill rate、dual-write／CDC lag、checksum／row-count reconciliation 與 rollback time。
- Cache hit／miss、penetration／breakdown／avalanche、single-flight wait、negative cache、L1／L2 version、invalidation lag、TTL distribution、eviction、hot／big key、memory fragmentation、command P99。
- CDN cache status、Age、Cache-Control、s-maxage、ETag、Vary、purge／warm success、origin load，以及個人化或授權 response 沒有被跨租戶快取的驗證。
- Elasticsearch mapping、analyze 結果、term／match／filter query、query latency、slow log、segment／refresh、shard size、replica、routing、429、heap、filesystem cache、aggregation bucket／cardinality 記憶體與 search_after／PIT 壓測。
- DB-to-search outbox／CDC offset、event version、tombstone、duplicate／out-of-order event、replay、dead-letter 與 index document version；能證明刪除不會被舊更新復活。
- Kafka assignment、consumer generation、rebalance cause、poll／processing time、committed／processed offset、lag、partition distribution、duplicate event ID；RabbitMQ exchange／binding、publisher confirm、ready／unacked、redelivery、prefetch、retry count、DLX depth 與 poison message。
- API contract diff、OpenAPI／GraphQL schema、v1／v2 client usage、deprecation telemetry、error compatibility、token audience／scope／expiry／revocation、租戶與資源授權測試、GraphQL depth／cost／N+1 指標。
- WebSocket handshake／connection count／heartbeat／reconnect／backoff／send buffer，以及 polling request rate；重連後以 cursor、版本或重新查詢補回狀態的測試結果。
- 至少包含：資料庫 primary／replica failover、replica lag、deadlock、migration 中斷回滾、cache node／key failure、CDN purge 延遲、Elasticsearch node／shard failure、CDC duplicate／out-of-order、Kafka consumer pause／rebalance、RabbitMQ consumer crash／poison message、API v1／v2 共存、GraphQL abusive query、WebSocket gateway 斷線風暴。
- Little's Law 或等價模型：將 request／message throughput、平均 transaction／cache／search／consumer 持有時間、並發、pool／prefetch／in-flight、記憶體與 P99 對齊，並保留安全餘量。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議增加 pod、提高 pool、延長 TTL 或重啟；沒有因果時間線，且忽略交易、授權、資料遺失或訊息重播風險。 |
| 1 | 能列出部分 database、cache、search、messaging 或 API 名詞，但無法把設定、症狀與可觀測證據連起來。 |
| 2 | 能辨識至少四個主要問題並提出部分可行修復，但遺漏一個以上核心 track，或缺少 RPO／RTO、rollback、冪等、授權或量化警戒線。 |
| 3 | 能完成五個核心面向：storage／transaction、cache／CDN、Elasticsearch、messaging、API／realtime；每個面向都有責任邊界、取捨、證據與分階段修復。 |
| 4 | 除上述內容外，能用端到端時間線與容量模型驗證共同根因，保護跨 store 一致性與租戶授權，設計可回滾 rollout、故障注入、replay／restore 與明確的退化策略，並量化延遲、吞吐、RPO／RTO 和成本取捨。 |

### 通過標準

採五個核心面向各 0–4 分評分：**Storage／Transaction／HA**、**Cache／CDN**、**Elasticsearch／Data Sync**、**Kafka／RabbitMQ Reliability**、**API Contract／Auth／Realtime**。總體平均達 **3/4 分**才通過，且五個核心面向均不得低於 2 分；任何面向為 0 即使平均達 3 也不通過。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

### 1. 先建立責任邊界與時間線

先用同一個 request ID、order ID、tenant ID、event ID、search document version 和 API client version 對齊 trace，而不是把所有症狀歸因於資料庫 CPU。合理的初始時間線如下：

1. migration 在不同 shard 的完成狀態不一致，部分查詢使用新 schema、部分路徑仍使用舊欄位；schema／index 不完整使 planner 選擇退化計畫，backfill 又增加寫入與鎖競爭。
2. 促銷流量提高 transaction、cache miss、search fan-out 與 message consumer 的並發；pool wait、lock wait、L1／L2 invalidation lag 和 CDC lag 先於 API P99 惡化。
3. API 為降低主庫壓力將讀導向 replica，造成寫後讀不一致；同時一個 cache key 的多節點回填與過期批次造成 stampede，讓資料庫和 search origin 被二次放大。
4. search consumer 變慢後，Elasticsearch 仍接收舊事件與新事件的不同順序；若沒有 document version 或 tombstone，晚到的舊事件可能覆蓋新資料，刪除甚至被舊更新復活。
5. Kafka consumer 處理超過 poll interval 造成 rebalance；過早提交 offset 會造成 side effect 尚未完成就跳過，過晚提交則會造成可接受的 replay。RabbitMQ 的 auto／錯誤 requeue 與過大 prefetch 讓 unacked 和 retry 佔滿資源。
6. API v2 breaking change、GraphQL 高成本查詢、授權只檢查登入，以及 WebSocket reconnect storm 共同放大 request 數；這些應被視為獨立的 contract、security 和 connection capacity 問題。

已證實的事實應只包含「某時間點某指標同時變化」；例如「資料庫 CPU 55%」不能證明資料庫沒有問題。待驗證假設包括 plan regression、migration lock、replica lag、cache stampede、CDC ordering、consumer commit race、GraphQL N+1 與 reconnect storm，必須逐一用 trace、log、plan 和故障注入排除。

### 2. Storage、transaction、HA 與 migration

- **資料模型與選型**：訂單金額、庫存扣減、付款狀態與租戶邊界以具備交易和約束能力的關聯式資料庫作 source of truth；正規化到能避免更新異常，再在已量測的讀路徑做受控反正規化。Elasticsearch 是可重建的搜尋 read model，Redis 是快取或短期狀態，Kafka／RabbitMQ 是事件或命令傳輸，不應被當作跨 store ACID。
- **索引與計畫**：對退化 query 先保存 plan、實際 rows、buffer／I/O、統計時間和 predicate，再決定 composite index 欄位順序、covering index、查詢改寫或分頁方式。B+ Tree 適合需要有序與範圍查詢的主要交易路徑；LSM 的寫入與 compaction 優勢不能直接抵銷讀取放大和空間放大。索引新增也會增加寫入、lock、storage 和 migration 時間。
- **交易與鎖**：根據實際隔離級別判斷髒讀、不可重複讀、幻讀與 lost update；縮短 transaction 持有時間，固定鎖定順序，對 deadlock／serialization failure 做有界重試，不能把 retry 當成消除業務重複。支付與庫存操作要有 request／event idempotency key、唯一約束或版本條件更新。
- **讀寫分離**：寫入後需要 read-after-write 的請求使用 primary、session stickiness、已知 replication position 或版本等待；報表等可接受 stale 的流量才送 replica。failover 要有健康檢查、路由切換、連線重建、舊 primary fencing 和資料校驗，並以 replica lag、RPO、RTO、錯誤率和回復演練驗證。
- **分片**：用穩定且均勻的 tenant／order shard key；先評估熱租戶、跨租戶報表、跨分片 transaction、全域 ID、重平衡和查詢路由。不能只增加 shard 數，必須有 reshard／dual-read／cutover 和歷史／新流量邊界。
- **零停機 migration**：先 expand 新欄位／相容索引，再以有 checkpoint 的 backfill 和限速同步，執行 row count、checksum、版本與業務 invariant 校驗；以 feature flag 逐步切換讀取，確認雙寫或 CDC 沒有 lag／duplicate 後才切換寫入，最後在保留 rollback window 後 contract 舊欄位。任何一步中斷都能停止回填、保留新舊讀路徑，不能直接刪除還被舊 client 使用的欄位。
- **容量模型**：把每個 pod、worker、migration job、管理工具的 pool 上限加總，預留 DB failover、背景工作與管理連線安全餘量。用 throughput × 平均持有時間估算並發，將 pool wait、lock wait、query P99 與資料庫 max connections 對齊；把 pool 放大到超過 DB 能處理的程度只會把排隊移到 DB。

### 3. Cache 與 CDN

- 不存在的 key 大量打到資料庫是 **penetration**，單一熱 key 過期造成併發回源是 **breakdown**，大量 key 同時過期或 cache node 故障是 **avalanche**。分別使用負快取／Bloom filter、single-flight／鎖／stale-while-revalidate，以及 TTL jitter、分批 warming、限流和降級；三者不能用同一個「延長 TTL」方案代替。
- 以資料庫 commit 後的 outbox、版本號或可靠 invalidation 事件作為收斂來源；cache-aside 先更新 DB 再失效 cache 是常見基線，但仍需處理失效遺失、並發回填和舊 writer。延遲雙刪只是降低時間窗，不是強一致保證。
- L1 應有容量、eviction、版本和 invalidation lag 邊界；L2 應有 hot／big key、memory、network 和 node failure 防線。快取策略可依資料選擇 cache-aside、read-through、write-through 或 write-back，但要明確寫出陳舊、資料遺失、應用耦合與回源成本。
- LRU／LFU／FIFO／ARC 的選擇要依時間局部性、頻率、工作集與冷啟動評估；不能為了保 hit rate 關閉 eviction 而讓 Redis OOM。warming 要分批、有優先級、可取消且受 origin capacity 限制。
- CDN 只快取可公開、非個人化或明確版本化的內容；使用 Cache-Control、s-maxage、ETag、Vary、purge 和 immutable asset 控制新鮮度，將 authorization、tenant、cookie 或個人化價格納入 cache key／禁止共享。要以跨租戶測試證明不會洩漏內容。

### 4. Elasticsearch 與資料同步

- Mapping 先固定價格、時間、SKU 等欄位型別；全文欄位使用 text 與正確 analyzer，精確過濾、排序、聚合用 keyword 或 multi-field。term 不會替全文欄位做分析，match 會依 analyzer 產生 terms；bool 的 filter 適合不需 relevance score 的條件，must／should 才依需求產生分數。
- 分片數要以資料量、shard size、節點、查詢 fan-out 和 recovery 時間決定；副本提供讀取並行和故障切換，但不是資料庫 transaction。避免 over-sharding、hot routing 和單一大 shard；必要時用 reindex、split／shrink 或新 index alias 做可回滾切換。
- 深頁碼用 search_after 加 PIT 或有明確邊界的 scroll；調整 refresh interval、bulk、segment、filesystem cache、heap 與 Hot／Warm／Cold ILM，要以 query P99、寫入延遲、heap、merge 和 recovery 指標驗證。高 cardinality 使用近似計算時說明 HyperLogLog++、precision 與記憶體取捨。
- DB 到 search 使用 outbox／CDC 或可重播事件，保留 source position、document version、tombstone 和 event ID；indexer 以版本條件更新，對 duplicate、out-of-order、刪除與 replay 冪等。資料校驗與重建必須能從 source of truth 完成，不能靠搜尋結果反寫訂單。

### 5. Kafka、RabbitMQ 與交付可靠性

- Kafka 的 broker、topic、partition、offset、consumer group 要有清楚責任邊界；同一訂單的事件用穩定 key 維持 partition-local order，不能把無 key 的 retry 或非同步 worker 當成有序。consumer 在 side effect 成功後才提交，並只提交每個 partition 最高的連續完成 offset；rebalance 時停止新工作、處理 revoked partition，接受 offset commit 前崩潰帶來的 replay，靠 event ID／inbox／唯一約束吸收。
- max.poll.interval 應大於可證明的處理時間分布並配合 worker 並行與 pause／resume；不要以無限延長 poll 或無限增加 partition 掩蓋資料庫容量問題。監控 generation、assignment、rebalance、lag、processed／committed offset 和 duplicate ID。
- RabbitMQ 的 producer 使用 publisher confirm，exchange／queue durable，關鍵訊息 persistent；consumer 在 side effect 完成後 manual ack。暫時性錯誤進有界 retry queue，永久性錯誤用 reject 或 nack(requeue=false) 進 DLX；每次 retry 保存 attempt、原 routing key、錯誤類型和 next retry，避免 requeue 熱循環。Direct、Fanout、Topic、Headers 的選擇要與路由需求一致。
- Kafka 適合高吞吐、partition order、長保留與 replay；RabbitMQ 適合明確路由、工作佇列與 bounded retry。選型要寫出吞吐、延遲、重播、順序、ack、路由、運維與 side effect 冪等的取捨，不能宣稱任何單一產品自動提供 exactly-once。

### 6. API contract、auth 與 realtime

- REST 適合資源、HTTP cache、穩定操作和公開合約；GraphQL 適合多客戶端聚合與精準欄位，但必須限制 depth／cost、做 resolver batching／DataLoader、field-level authorization 和 timeout。兩者都要定義錯誤、分頁、冪等、rate limit 和 observability。
- API v2 先採向後相容的 additive change，保留 v1 adapter、Accept／URI／header routing、schema diff、client telemetry、deprecation window 和可回滾 flag；移除欄位或改錯誤格式前要證明使用量為零。REST 的無狀態、cacheable、uniform interface 與分層約束不能被「看起來像 JSON」取代。
- authentication 是確認身份，authorization 是根據 tenant、resource、role／scope 做決策。token 要驗 audience、issuer、expiry、signature、scope 和租戶，API key／Basic／OAuth／JWT 的撤銷、輪換與狀態成本不同；只檢查登入不能防止水平越權。
- WebSocket 適合高頻雙向即時流，成本是長連線、gateway memory、load balancing、heartbeat、重連與離線補償；polling／long-polling 相容性較好但 request／header／延遲成本高。重連要 exponential backoff、jitter、connection quota 和 cursor／version 回補；若通知可重建，WebSocket 只送 hint，客戶端再以 REST 取得 authoritative state。

### 7. 分階段修復與驗證

1. **止血與隔離**：停止 RabbitMQ 永久錯誤的無限 requeue，限制 GraphQL depth／cost，暫停不必要的 migration／backfill，將寫後讀與關鍵授權請求導回正確 source，保留既有 API v1。為支付、庫存、訂單事件補上 idempotency key／version guard，先接受部分 queue lag 或 cache miss。成功條件是沒有資料倒退、跨租戶回應、無限 retry 和靜默 offset skip；超過 DB pool wait、DLQ depth、5xx 或授權拒絕警戒線就 rollback。
2. **修復一致性邊界**：完成 expand／backfill／校驗；建立 primary／replica read policy、cache version／invalidation、CDN vary、固定 ES mapping／alias、outbox／CDC version ordering、Kafka post-side-effect commit、Rabbit manual ack／DLX metadata。以 canary tenant 和小流量 client 驗證，任何 checksum、event gap、tombstone resurrection 或 duplicate side effect 都停止切換。
3. **容量與效能**：在固定 workload 下逐項調整 composite index、query plan、pool／prefetch／worker concurrency、cache TTL／eviction、ES refresh／bulk／shard、Kafka batch／poll、Rabbit retry delay、WebSocket quota／backoff。每次只改一個主變因，觀察 P50／P95／P99、queue／lag、replica／CDC lag、cache hit、ES 429／heap、pool wait 與成本；以 Little's Law 和 failure budget 決定是否擴容。
4. **演練與收斂**：執行 primary／replica failover、migration 中斷、cache node failure、CDN purge 延遲、ES shard failure、CDC out-of-order、Kafka consumer crash、Rabbit poison message、GraphQL abusive query、API v1／v2 共存與 WebSocket reconnect storm。保留 restore／replay／rollback 證據，確認 RPO／RTO、租戶授權、狀態版本、DLQ 人工處理邊界均符合目標後才 contract 舊路徑。

</details>

## 常見失分點

- 把資料庫 CPU 不高解讀成沒有資料庫瓶頸，忽略 lock、pool、I/O、replica、planner 和 transaction hold time。
- 把正規化、SQL／NoSQL、cache、Elasticsearch 或 Kafka 任一個產品當成萬用 source of truth，沒有指出一致性邊界。
- 只說「加索引」或「改成讀 replica」，沒有提供 query plan、selectivity、replication lag、寫後讀與 migration rollback 證據。
- 把延遲雙刪、TTL、CDN、L1／L2 或 eviction 說成強一致，或為了 hit rate 關閉容量保護。
- 把 text 當 keyword、term 當全文搜尋、任意增加 shard、用深頁碼和高 cardinality aggregation 壓垮 Elasticsearch。
- 把 Kafka rebalance、offset commit、RabbitMQ ack、requeue 和 DLX 混成同一種語義，沒有 bounded retry、冪等與 poison message 終止條件。
- 只檢查 authentication，不檢查 tenant／resource authorization；或在 API v2 移除欄位前沒有 client telemetry 和 deprecation。
- 把 WebSocket reconnect、polling、GraphQL N+1 或 cache stampede 當成單純網路問題，沒有 connection、resolver、回源與容量模型。
- 只列出設定值，不說成功指標、警戒線、rollback、RPO／RTO、replay、restore 或故障注入結果。

## 延伸追問

1. 如果訂單資料庫已 commit，但 Kafka offset commit timeout，如何用 inbox／idempotency 和 reconciliation 證明不會漏單或重複扣款？
2. 如果某租戶是 40% 流量，hash shard key 仍形成 hot shard，你會如何在不破壞 tenant isolation 和跨分片查詢的前提下拆分？
3. 如果 migration 的 backfill 已完成 80%，新欄位只有 79% 通過 checksum，你會如何停止、修復、決定是否切讀，以及如何保留 rollback？
4. 如果 L1 快取仍有舊價格而 L2 已更新，版本號、invalidation event、single-flight、stale-while-revalidate 與人工 purge 的責任如何分配？
5. 如果 Elasticsearch 的舊刪除事件晚於新建立事件抵達，document version、tombstone、CDC offset 和 replay tool 如何避免資料復活？
6. 如果 Kafka consumer 的單筆處理 P99 超過 max.poll.interval，你會在 pause／resume、拆分 worker、retry topic、調整 partition 或回到 source capacity 中如何選擇？
7. 如果 RabbitMQ DLX 快滿了，哪些訊息可延後、哪些必須人工隔離、哪些可以安全丟棄？請以 RPO、業務副作用和保留成本制定規則。
8. 如果 GraphQL 查詢只讀到使用者可見欄位但 resolver 仍能探測其他租戶的 timing，你會如何修正 authorization、batching、rate limit 與錯誤回應？
9. 如果 WebSocket 只傳送狀態提示而不保證交付，客戶端離線 10 分鐘後如何以 cursor／version／REST 回補到 authoritative state？
10. 如果增加 pool 後 API P99 下降但 DB lock wait 和 failover recovery 上升，你會用哪組容量與故障注入證據判定這是改善還是把排隊移到資料庫？
