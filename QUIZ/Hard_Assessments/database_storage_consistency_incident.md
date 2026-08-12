# Database Storage & Consistency Incident：跨 SQL、PostgreSQL、MongoDB 與 Redis 的一致性與容量事故

- **Assessment ID**: `assessment.database.storage-consistency.incident.v1`
- **主要 Concept ID**: `concept.database.connection-pool.capacity`
- **次要 Concept IDs**:
  - `concept.database.mysql.transaction-isolation`（SQL／交易 track）
  - `concept.database.postgresql.mvcc-vacuum`（PostgreSQL track）
  - `concept.database.mongodb.replication`（MongoDB／Redis track）
  - `concept.database.redis.persistence`（MongoDB／Redis track）
- **對應文章**: 40 篇，依 track 列於下方
- **題型**: `生產事故診斷`, `Query Plan`, `MVCC／隔離／鎖`, `Replication／Backup`, `Durability／Sharding`, `Connection Pool Capacity`
- **難度**: 10
- **重要程度**: 5
- **建議作答時間**: 60 分鐘
- **標籤**: `SQL`, `MySQL`, `PostgreSQL`, `MongoDB`, `Redis`, `MVCC`, `Replication`, `Backup`, `Sharding`, `Connection Pool`
- **Learning Objective IDs**:
  - `Track-SQL-LO-1`: 以查詢計畫、MVCC、隔離、鎖、日誌與複製證據定位關聯式資料庫事故。
  - `Track-SQL-LO-2`: 以備份、PITR、RPO/RTO 與 rollback plan 證明資料可恢復。
  - `Track-SQL-LO-3`: 以 connection pool、query latency、DB max connections 與 pod 數量做容量取捨。
  - `Track-PostgreSQL-LO-1`: 以 PostgreSQL planner、MVCC、VACUUM、WAL 與複製指標完成診斷。
  - `Track-PostgreSQL-LO-2`: 在隔離、partition、replication slot 與維護窗口間做可回滾決策。
  - `Track-PostgreSQL-LO-3`: 以 restore drill、failover drill 與容量預算驗證修復。
  - `Track-NoSQL-LO-1`: 以 MongoDB 索引、資料模型、replica set、WiredTiger 與 shard key 定位瓶頸。
  - `Track-NoSQL-LO-2`: 以 Redis persistence、eviction、hot/big key、Stream 與 lock ownership 保護資料。
  - `Track-NoSQL-LO-3`: 在 durability、可用性、分片、記憶體與尾延遲間做取捨。

## 對應文章與測驗 track

### Track A：SQL／交易與容量

- [MySQL 索引](../../02_Backend_Development/Databases/SQL/MySQL/database_indexes.md)（`concept.database.mysql.indexing.plan-design`）
- [MySQL 查詢優化](../../02_Backend_Development/Databases/SQL/MySQL/how_to_optimize_sql_queries.md)（`concept.database.mysql.query-plan-optimization`）
- [MySQL MVCC](../../02_Backend_Development/Databases/SQL/MySQL/what_is_mvcc.md)（`concept.database.mysql.mvcc`）
- [MySQL 交易隔離級別](../../02_Backend_Development/Databases/SQL/MySQL/transaction_isolation_levels.md)（`concept.database.mysql.transaction-isolation`）
- [MySQL 鎖機制](../../02_Backend_Development/Databases/SQL/MySQL/mysql_lock_mechanism.md)（`concept.database.mysql.locking`）
- [MySQL redo／undo／binlog](../../02_Backend_Development/Databases/SQL/MySQL/mysql_binlog_redolog_undolog.md)（`concept.database.mysql.redo-undo-binlog`）
- [MySQL 複製](../../02_Backend_Development/Databases/SQL/MySQL/mysql_replication.md)（`concept.database.mysql.replication`）
- [InnoDB 與 MyISAM](../../02_Backend_Development/Databases/SQL/MySQL/innodb_vs_myisam.md)（`concept.database.mysql.storage-engines`）
- [MySQL 架構](../../02_Backend_Development/Databases/SQL/MySQL/mysql_architecture.md)（`concept.database.mysql.architecture`）
- [DELETE、TRUNCATE、DROP](../../02_Backend_Development/Databases/SQL/MySQL/delete_truncate_drop.md)（`concept.database.mysql.ddl-lifecycle`）
- [Primary Key 與 Unique Key](../../02_Backend_Development/Databases/SQL/MySQL/primary_key_vs_unique_key.md)（`concept.database.mysql.keys`）
- [資料庫備份與還原](../../02_Backend_Development/Databases/database_backup_and_restore.md)（`concept.database.backup-restore.rpo-rto`）
- [資料庫連線池](../../02_Backend_Development/Databases/database_connection_pool.md)（`concept.database.connection-pool.capacity`）

### Track B：PostgreSQL

- [PostgreSQL 索引類型](../../02_Backend_Development/Databases/SQL/PostgreSQL/index_types.md)（`concept.database.postgresql.index-types`）
- [PostgreSQL MVCC 與 VACUUM](../../02_Backend_Development/Databases/SQL/PostgreSQL/mvcc_and_vacuum.md)（`concept.database.postgresql.mvcc-vacuum`）
- [PostgreSQL 交易隔離](../../02_Backend_Development/Databases/SQL/PostgreSQL/transaction_isolation_levels.md)（`concept.database.postgresql.transaction-isolation`）
- [PostgreSQL 複製模式](../../02_Backend_Development/Databases/SQL/PostgreSQL/replication_streaming_vs_logical.md)（`concept.database.postgresql.replication-modes`）
- [PostgreSQL WAL](../../02_Backend_Development/Databases/SQL/PostgreSQL/wal_write_ahead_log.md)（`concept.database.postgresql.wal`）
- [PostgreSQL VACUUM 與 ANALYZE](../../02_Backend_Development/Databases/SQL/PostgreSQL/vacuum_deep_dive.md)（`concept.database.postgresql.vacuum-analyze`）
- [PostgreSQL 分區](../../02_Backend_Development/Databases/SQL/PostgreSQL/table_partitioning.md)（`concept.database.postgresql.partitioning`）
- [PostgreSQL CTE](../../02_Backend_Development/Databases/SQL/PostgreSQL/cte_and_recursive_cte.md)（`concept.database.postgresql.cte-recursion`）
- [PostgreSQL 特殊資料類型](../../02_Backend_Development/Databases/SQL/PostgreSQL/special_data_types.md)（`concept.database.postgresql.data-types`）
- [PostgreSQL 與 MySQL 比較](../../02_Backend_Development/Databases/SQL/PostgreSQL/postgresql_vs_mysql.md)（`concept.database.postgresql.engine-comparison`）

### Track C：MongoDB／Redis

- [MongoDB Aggregation](../../02_Backend_Development/Databases/NoSQL/MongoDB/mongodb_aggregation_framework.md)（`concept.database.mongodb.aggregation`）
- [MongoDB 資料建模](../../02_Backend_Development/Databases/NoSQL/MongoDB/mongodb_data_modeling.md)（`concept.database.mongodb.data-modeling`）
- [MongoDB 索引](../../02_Backend_Development/Databases/NoSQL/MongoDB/mongodb_indexing.md)（`concept.database.mongodb.indexing`）
- [MongoDB Replication](../../02_Backend_Development/Databases/NoSQL/MongoDB/mongodb_replication.md)（`concept.database.mongodb.replication`）
- [MongoDB Sharding](../../02_Backend_Development/Databases/NoSQL/MongoDB/mongodb_sharding.md)（`concept.database.mongodb.sharding`）
- [MongoDB Transactions](../../02_Backend_Development/Databases/NoSQL/MongoDB/mongodb_transactions.md)（`concept.database.mongodb.transactions`）
- [MongoDB 與 SQL 比較](../../02_Backend_Development/Databases/NoSQL/MongoDB/mongodb_vs_sql.md)（`concept.database.mongodb.sql-comparison`）
- [MongoDB WiredTiger](../../02_Backend_Development/Databases/NoSQL/MongoDB/mongodb_wiredtiger.md)（`concept.database.mongodb.wiredtiger`）
- [Redis RDB 與 AOF](../../02_Backend_Development/Databases/NoSQL/Redis/redis_persistence_rdb_vs_aof.md)（`concept.database.redis.persistence`）
- [Redis Sentinel 與 Cluster](../../02_Backend_Development/Databases/NoSQL/Redis/redis_sentinel_vs_cluster.md)（`concept.database.redis.sentinel-cluster`）
- [Redis 分散式鎖](../../02_Backend_Development/Databases/NoSQL/Redis/design_redis_distributed_lock.md)（`concept.database.redis.distributed-lock`）
- [Redis Hot Key 與 Big Key](../../02_Backend_Development/Databases/NoSQL/Redis/redis_hotkey_bigkey.md)（`concept.database.redis.hotkey-bigkey`）
- [Redis 淘汰策略](../../02_Backend_Development/Databases/NoSQL/Redis/redis_memory_eviction_policies.md)（`concept.database.redis.eviction`）
- [Redis Pipeline 與 Lua](../../02_Backend_Development/Databases/NoSQL/Redis/redis_pipeline.md)（`concept.database.redis.pipeline-lua`）
- [Redis 單執行緒模型](../../02_Backend_Development/Databases/NoSQL/Redis/redis_single_thread_model.md)（`concept.database.redis.single-thread`）
- [Redis Stream](../../02_Backend_Development/Databases/NoSQL/Redis/redis_stream.md)（`concept.database.redis.stream`）
- [Redis 資料結構](../../02_Backend_Development/Databases/NoSQL/Redis/what_is_redis_and_its_data_structures.md)（`concept.database.redis.data-structures`）

## 測驗目標

- 能把應用症狀拆成查詢計畫、並發一致性、複製／備份、NoSQL durability／sharding 與 connection pool 五條可驗證的因果鏈。
- 能區分資料庫引擎內部的索引、MVCC、WAL／binlog、oplog／AOF 與應用側連線池、快取和佇列的容量邊界。
- 能依 RPO、RTO、資料遺失風險、尾延遲、吞吐量與維運複雜度做出可回滾的取捨。
- 能提出先止血、再修正一致性／ownership、最後調校容量的分階段方案，並用故障注入和 restore drill 驗證。

## 問題情境與限制條件

某電商平台將訂單、庫存、報表與事件處理拆成多個資料服務。訂單寫入 MySQL，分析與部分帳務資料在 PostgreSQL，商品目錄與事件聚合使用 MongoDB，快取、分散式鎖與短期工作佇列使用 Redis。最近一次流量活動使 API pod 數量從 8 增加到 24，寫入峰值提高四倍。

部署後觀察到以下症狀，但尚未證明它們是否只有一個根因：

- 訂單查詢 P99 從 220 ms 升至 5.1 s。部分 MySQL 查詢由 index range scan 退化成 full scan，另一批查詢則在鎖等待中超時；應用端 connection pool wait 持續升高，但資料庫 CPU 沒有全程滿載。
- MySQL 有長交易、undo history 增長、gap／next-key lock 等待和偶發 deadlock。一次 schema cleanup 直接執行大批量 DELETE，另一個環境則嘗試 TRUNCATE；團隊無法清楚說明 rollback、binlog 與備份邊界。
- PostgreSQL 出現 dead tuple、autovacuum lag、replication slot 保留大量 WAL，以及一個長 snapshot 阻止清理。有人建議直接執行 VACUUM FULL 或提高 work_mem，但沒有提供 lock、bloat、planner 或 restore 證據。
- MongoDB 的某個 shard 出現 hot chunk，聚合查詢 docsExamined 遠高於返回數；故障轉移後的 write concern、oplog window 和 backup 時點沒有對齊目標 RPO。
- Redis 同時承載 cache、session、Stream 和鎖。RDB snapshot 與 AOF rewrite 期間尾延遲上升，eviction 增加，某個 hot key 和一個 big list 造成事件循環阻塞；consumer group 的 pending entries 持續堆積，鎖的持有者在 GC pause 後可能已失去 ownership。
- 應用側只知道每個 pod 的 pool 上限，不知道所有 pod、worker、migration job 與管理連線加總是否超過各資料庫的安全連線預算。有人提議直接把所有 pool 上限乘三，或只增加 pod。

限制條件如下：

1. 不得以重啟、只增加 pod、盲目提高任何 pool 上限、關閉 durability 或把所有查詢改成讀 replica 作為唯一方案。
2. 必須保留租戶隔離、訂單唯一性、交易正確性、可觀測性與既定 RPO/RTO；任何可能遺失資料的設定變更都要明確列出風險。
3. 不得在高峰期直接執行不可逆或長時間阻塞的維護；所有 schema、index、partition、resharding、vacuum、failover 與 persistence 變更都要有 rollback 或替代路徑。
4. 不能假設跨 MySQL、PostgreSQL、MongoDB、Redis 的操作自動具備分散式 ACID；若需要跨 store 協調，必須提出 outbox、冪等、補償或一致性邊界。

## 作答要求

1. **建立證據時間線**：依 request、query、lock、replication、backup、Redis、MongoDB 與 pool 指標排序症狀，將已證實事實和待驗證假設分開。
2. **分析索引與查詢計畫**：至少針對 MySQL、PostgreSQL、MongoDB 各提出一組 EXPLAIN、EXPLAIN ANALYZE 或 explain 證據，說明統計資訊、索引欄位順序、partition pruning、聚合 pipeline、keysExamined／docsExamined 與寫入成本。
3. **分析 MVCC、隔離與鎖**：說明 MySQL undo／Read View、gap／next-key lock、PostgreSQL tuple snapshot／dead tuple、隔離級別、serialization failure、長交易與 deadlock 如何影響正確性和容量。
4. **設計 replication 與 backup 方案**：比較 MySQL binlog／半同步、PostgreSQL WAL／streaming／logical、MongoDB oplog／write concern、Redis RDB／AOF；明確列出 RPO、RTO、failover、PITR、restore drill 和 rollback 條件。
5. **處理 MongoDB／Redis durability 與 sharding**：為 MongoDB 選 shard key、資料模型、transaction／replica set 策略；為 Redis 選 Sentinel 或 Cluster、eviction、hot/big key、Stream pending、pipeline／Lua 與 lock fencing 策略。
6. **計算 connection pool 與容量預算**：以 pod 數、worker concurrency、query／transaction 持有時間、DB max connections、管理連線和安全餘量估算上限；說明 pool wait、timeout、throughput 與尾延遲如何驅動決策。
7. **提出分階段修復**：至少三階段，每階段列出成功指標、警戒線、rollback 條件、變更順序與故障注入；不能用一次性的全面調參取代驗證。
8. **說明跨 store 一致性**：若訂單、庫存、事件與快取不同步，請指出 source of truth、outbox／冪等 key、重試、補償、replay 和人工介入邊界。

## 期待證據

- MySQL、PostgreSQL、MongoDB 的實際 query plan、estimated／actual rows、buffer／I/O、index usage、統計更新時間與 plan regression。
- MySQL undo history、長交易、transaction age、lock wait、deadlock graph、gap／next-key lock 與 isolation 設定。
- PostgreSQL pg_stat_activity、長 snapshot、dead tuple、autovacuum／bloat、xmin、ANALYZE 統計與 vacuum lock。
- MySQL binlog position／GTID、PostgreSQL WAL LSN／replication slot、MongoDB oplog window／lag／write concern 與 Redis persistence／rewrite 指標。
- 最近一次 full／incremental／snapshot／PITR 的 restore drill、checksum、資料筆數／checksum reconciliation、RPO/RTO 實測與備份保留政策。
- MongoDB shard distribution、chunk migration、hot shard、routing、資料模型大小、WiredTiger cache／eviction／journal 與 transaction latency。
- Redis memory usage、fragmentation、eviction、hit rate、hot/big key sampling、command latency、blocked clients、AOF rewrite／RDB fork 與 Stream PEL/backlog。
- Redis lock token、TTL、renewal、fencing、持有者 crash／GC pause 與錯誤釋放的故障注入結果。
- 每個 pod、worker、migration job、replica、管理工具的 connection pool max／in-use／idle／wait／timeout；以及 DB 端 max connections、active sessions、CPU、I/O。
- 以 Little's Law 或等價容量模型將 throughput、平均持有時間、並發數、pool wait 和 P99 對齊，並說明安全餘量。
- 慢查詢、慢 client、replica failover、network partition、database restart、Redis eviction、MongoDB chunk imbalance、connection leak 和 pool exhaustion 的壓測結果。
- schema／index／partition／vacuum／resharding／persistence 變更的 rollout log、feature flag、canary、rollback time 與資料一致性檢查。
- cross-store outbox、冪等 key、重試／死信／補償、replay 與 cache invalidation 的測試紀錄。
- 能指出哪些證據會推翻「只要增加 pool／pod」或「資料庫 CPU 不高所以沒有 DB 問題」的假設。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議增加 pod、提高 pool 或重啟；忽略 query plan、交易一致性、replication／backup、Redis／Mongo durability 與 rollback。 |
| 1 | 能列出部分名詞，但無法把症狀連到證據、容量邊界或資料遺失風險。 |
| 2 | 能指出至少三個主要問題並提出大致可行的修復，但遺漏一個以上核心 track、缺少 restore／故障注入或沒有量化警戒線。 |
| 3 | 能完成五個核心面向：query plan、MVCC／隔離／鎖、replication／backup、MongoDB／Redis durability／sharding、connection pool／capacity，並提出可驗證的分階段 rollout。 |
| 4 | 除上述內容外，能處理 plan drift、長 snapshot、slot／oplog 保留、跨 shard／跨 store 一致性、Redis fencing／PEL、pool 乘法與可逆部署的 trade-off，且能以實際證據調整假設。 |

### 通過標準

總分達 **3/4 分**才通過；query plan、MVCC／隔離／鎖、replication／backup、MongoDB／Redis durability／sharding、connection pool／capacity 五個核心面向均不得低於 2 分，並且必須提出至少一個可執行的 rollback 條件與一次 restore／故障注入驗證。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

### 共同處理原則

先建立 request、database、replica、cache、queue 和 pool 的同一條時間線，並將每個症狀標成 fact、correlation 或 hypothesis。P99 上升不等於 pool 太小；connection pool wait 可能是慢查詢、長交易、鎖等待、資源洩漏或資料庫端容量不足的結果。資料庫 CPU 不高也不能排除 I/O、lock、network、replica、WAL 或 pool queue。

第一個止血動作應是限制高風險的無界併發與長交易，暫停高峰期非必要 cleanup／resharding／大批量 export，保留既有 durability，並補齊 pool wait、query duration、lock、replication lag、backup freshness 和資料一致性指標。每一個設定變更都要有 canary、明確警戒線與 rollback。

### Track A：SQL／交易與容量

對 MySQL 先比較退化前後的 EXPLAIN 與實際計畫，而不是直接新增索引。檢查 predicate、複合索引欄位順序、基數、統計資訊、回表、排序／temporary table、實際 rows 與 buffer I/O；用固定資料量和固定參數重跑，確認 plan 改善沒有把寫入和索引維護成本轉嫁到另一條路徑。DELETE、TRUNCATE、DROP 的不可逆程度、交易語意、binlog 和備份邊界必須分開說明。

交易問題要同時看 MVCC 和鎖。長交易會保留 undo 版本、阻止 purge，並讓 snapshot 變舊；gap／next-key lock 和隔離級別會改變範圍讀寫的衝突。用 deadlock graph 找出鎖順序，縮短 transaction scope、固定存取順序、先取得必要鎖、設定合理 timeout 和可重試邊界，不能用提高 pool 或無限重試掩蓋死鎖。Redo log 支援 crash recovery，undo 支援版本與 rollback，binlog 是複製／恢復的重要來源；commit 和 durability 設定要和 RPO 對齊。

複製和備份要從目標 RPO/RTO 反推。非同步複製可能在主庫故障時遺失尚未傳出的 binlog，半同步可降低風險但會增加 commit latency；備份不只要看檔案生成，必須以 restore drill、binlog／PITR、checksum 和資料筆數驗證可用。InnoDB、鍵設計、架構中的 buffer／log path 都會影響恢復和查詢成本。

連線池容量不能按單一 pod 猜測。先扣除資料庫管理和其他 client 的保留量，再把所有 pod、worker、migration、read replica client 的 max open 加總，對照 DB max connections；每個 pool 還要用實測 query／transaction 持有時間、throughput、pool wait 和 timeout 驗證。提高 pool 只有在 DB 還有安全容量且查詢已受控時才可能提升吞吐，否則會把等待從應用移到資料庫。

### Track B：PostgreSQL

PostgreSQL 的 plan 分析要同時看 index type、估算與實際 rows、buffers、sort、partition pruning 和統計資訊。JSONB／ARRAY、range 和特殊類型不是只靠「有索引」就能保證有效；要確認索引 operator class、查詢寫法、資料分布和寫入維護成本。對大量時間序列資料，分區的收益來自 pruning 與維護邊界，但分區數量、DDL lock、唯一鍵／分區鍵與跨分區查詢都要納入。

PostgreSQL MVCC 會保留 tuple version；長 snapshot、閒置交易或 replication slot 會阻止 dead tuple 清理，造成 bloat、I/O 和 planner 退化。先用 VACUUM／autovacuum 和 ANALYZE 的證據處理日常健康，不能把高風險的 VACUUM FULL 當成一般止血；需要重建空間時應安排維護窗口或使用可控的線上替代方案。隔離級別要說明 snapshot、serialization failure 和 retry，並用並發測試證明。

WAL 同時支援 durability、crash recovery 和 replication。Streaming replication 適合實體副本與 HA，logical replication 適合選擇性同步、升級或 CDC；兩者都要監控 LSN、apply lag、archive failure 和 replication slot 保留。備份必須能從 base backup 加 WAL 完成 PITR，並用 restore drill 實測 RPO/RTO。

### Track C：MongoDB／Redis

MongoDB 先用 explain 找出 docsExamined 遠大於返回數、錯誤的複合索引順序、aggregation pipeline 太早展開或 shard key 導致 scatter-gather 的位置。資料模型要依讀寫模式、文件增長、更新原子性和 fan-out 決定 embedding 或 referencing；若需要多文件交易，必須量測 transaction duration、衝突、跨 shard 成本與重試，而不是把 transaction 當作免費的關聯式替代品。

Replica set 的 write concern、read concern、oplog window、election 和 backup 時點要共同決定 RPO。WiredTiger cache、journal、checkpoint、eviction 和文件／索引大小要與記憶體容量一起看。Sharding 的 shard key 必須同時滿足查詢路由、寫入均勻、高基數和可擴展性；hot chunk、jumbo chunk 和 balancer 造成的尾延遲要在 canary／故障演練中驗證。

Redis 的資料角色要先分清楚。純 cache 可接受某些 eviction 和重建；session、Stream、鎖或不可重建資料則必須明確 durability 和遺失語意。RDB 是 snapshot，AOF 依 fsync policy 提供較細的恢復點，但 rewrite、fork、磁碟和恢復時間會造成成本。Sentinel 解決主要節點故障轉移，Cluster 解決 slot 分片和水平容量，選擇要連到 client routing、RPO、資料量和 hot key。

Hot key 和 big key 要用 sampling、command latency、memory usage、blocked clients 和 keyspace 指標定位，不能只執行可能阻塞的全量掃描。Pipeline 主要減少 RTT；Lua 或 transaction 才能在適當範圍提供原子條件，但長 script 會阻塞事件循環。Stream 要管理 consumer lag、PEL、ack、reclaim、trim 和冪等；分散式鎖至少要有 owner token、原子釋放、TTL、續租和 fencing，否則 GC pause 後的舊 owner 仍可能寫入。

### 分階段交付

第一階段是止血與取證：限制長交易、無界 worker、危險 cleanup、Redis 大命令和高風險 shard migration；保留 durability，補上 plan、lock、replication、backup freshness、Redis memory／latency、Mongo routing 和各層 pool wait。若 P99、錯誤率、資料一致性、replication lag 或 pool wait 超過警戒線，就回滾 traffic／feature flag，而不是繼續加容量。

第二階段是正確性修復：修正索引和查詢計畫、transaction scope、lock order、隔離與 retry、autovacuum／slot、replication／PITR、Mongo write concern／shard key、Redis persistence／eviction／PEL／fencing，以及 outbox、冪等和補償流程。通過慢資料庫、deadlock、replica failover、restore、Redis eviction、consumer crash、lock owner pause、Mongo chunk imbalance 和 connection leak 測試後才擴大 rollout。

第三階段才做容量調校：依固定 workload 一次調整一個主要因素，分別量測 pool max、worker concurrency、batch size、partition、cache／WiredTiger memory、Redis Cluster slot 和 replica 數。成功指標同時包含 throughput、P50/P99、lock／pool wait、replication lag、RPO/RTO、memory／I/O 和資料一致性；任何警戒線或 rollback time 超標都停止擴大。

</details>

## 常見失分點

- 把「資料庫 CPU 不高」當成沒有資料庫瓶頸，忽略 I/O、lock、pool queue、replica lag、WAL 或 network。
- 只建議把每個 pod 的 connection pool 乘大，沒有計算 pod、worker、migration 與管理連線的總和。
- 看到慢查詢就新增索引，沒有提供 estimated／actual plan、統計資訊、寫入成本或回滾方案。
- 把 MVCC 當成不需要清理，忽略 MySQL undo、PostgreSQL dead tuple、長 snapshot 與 vacuum／purge lag。
- 把隔離級別、鎖等待和 deadlock 混為一談，或用無限 retry 取代鎖順序與 transaction scope 修正。
- 把 redo、undo、binlog、WAL、oplog、RDB 和 AOF 視為同一種日誌，沒有說明各自的 durability／複製責任。
- 只看備份檔案是否生成，沒有 restore drill、checksum、PITR 和 RPO/RTO 實測。
- MongoDB 只談 replica set，不談 write concern、oplog window、shard key、hot chunk、WiredTiger cache 或 transaction 成本。
- Redis 只談「記憶體資料很快」，忽略 eviction、AOF rewrite、big key、blocked event loop、PEL、consumer crash 和 lock fencing。
- 把 Pipeline、transaction、Lua、Stream 和分散式鎖的原子性與投遞語意混為一談。
- 把跨 MySQL、PostgreSQL、MongoDB、Redis 的多步驟操作當成自動具備分散式 ACID，沒有 outbox、冪等或補償。
- 沒有先止血與取證，就同時更改 index、隔離、pool、replication、persistence 和 shard，導致無法知道哪個變更造成副作用。

## 延伸追問

1. 如果 MySQL pool wait 很高但 DB CPU 只有 40%，你如何區分慢查詢、鎖等待、connection leak、網路延遲和 DB max connections？
2. 如果 PostgreSQL autovacuum lag、replication slot WAL 保留和長 snapshot 同時出現，你會先處理哪個風險？為什麼不能直接 VACUUM FULL？
3. 如果 MongoDB 需要更高 write concern 以滿足 RPO，但 P99 變差，你會如何調整 replica、shard key、批次與 client timeout？
4. 如果 Redis AOF fsync everysec 仍有尾延遲，如何從 rewrite、fork、磁碟、big key、slow command 和 memory fragmentation 排查？
5. 如果 Redis lock owner 在 GC pause 後恢復並繼續寫入，你會如何用 token、fencing 或資料庫條件更新阻止 stale owner？
6. 如果 restore drill 可用但 replay 後跨 store 的訂單、庫存和事件數量不一致，你會如何設計 outbox、冪等與 reconciliation？
7. 如果加上索引後查詢變快但寫入 P99 和 replication lag 變差，你會用哪些 workload 和成本指標判斷是否保留？
8. 如果所有核心指標都改善但 rollback 需要 45 分鐘，你會如何重新設計 canary、feature flag、備份與變更拆分？
