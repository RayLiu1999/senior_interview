# Foundations／Storage／Tooling Completion Incident：從 OS 控制面到資料與依賴交付

- **Assessment ID**: `assessment.foundations-storage-tooling.completion.v1`
- **主要 Concept ID**: `concept.operating-system.interrupts.hard-soft-context`
- **次要 Concept IDs**:
  - `concept.operating-system.signals.process-control`
  - `concept.mongodb.change-streams.resume-ordering`
  - `concept.redis.transactions.watch-atomicity`
  - `concept.cache.redis-memcached.selection`
  - `concept.database.sql.char-varchar.storage`
  - `concept.postgresql.schema.namespace-security`
  - `concept.database.newsql.distributed-sql`
  - `concept.messaging.kafka.connect-streams.integration`
  - `concept.messaging.kafka.log-storage.retention`
  - `concept.messaging.kafka.zookeeper-kraft.metadata`
  - `concept.go.tooling.modules-reproducibility`
- **對應文章**:
  - [中斷處理機制](../../01_Computer_Science_Fundamentals/Operating_System/interrupt_handling.md)
  - [信號機制](../../01_Computer_Science_Fundamentals/Operating_System/signal_mechanism.md)
  - [MongoDB Change Streams](../../02_Backend_Development/Databases/NoSQL/MongoDB/mongodb_change_streams.md)
  - [Redis Transactions 與 ACID](../../02_Backend_Development/Databases/NoSQL/Redis/redis_transactions_and_acid.md)
  - [Redis vs Memcached](../../02_Backend_Development/Databases/NoSQL/Redis/redis_vs_memcached.md)
  - [VARCHAR vs CHAR](../../02_Backend_Development/Databases/SQL/MySQL/varchar_vs_char.md)
  - [PostgreSQL Schema](../../02_Backend_Development/Databases/SQL/PostgreSQL/what_is_schema.md)
  - [NewSQL 資料庫](../../02_Backend_Development/Databases/newsql_databases.md)
  - [Kafka Connect 與 Streams](../../02_Backend_Development/Message_Queues/Kafka/kafka_connect_streams.md)
  - [Kafka Log Storage](../../02_Backend_Development/Message_Queues/Kafka/kafka_log_storage.md)
  - [ZooKeeper 與 KRaft](../../02_Backend_Development/Message_Queues/Kafka/kafka_zookeeper_kraft.md)
  - [Go mod commands](../../02_Backend_Development/Programming_Languages_and_Frameworks/Go/Tooling/go_mod_commands.md)
- **題型**: `跨層故障診斷`, `資料一致性`, `容量取捨`, `升級與回滾`, `可重現交付`
- **難度**: 9
- **重要程度**: 3
- **建議作答時間**: 50 分鐘
- **標籤**: `Operating System`, `MongoDB`, `Redis`, `Database`, `Kafka`, `Go Modules`, `Reliability`
- **Learning Objective IDs**:
  - `concept.operating-system.interrupts.hard-soft-context/LO-1`
  - `concept.operating-system.interrupts.hard-soft-context/LO-2`
  - `concept.operating-system.interrupts.hard-soft-context/LO-3`
  - `concept.operating-system.signals.process-control/LO-1`
  - `concept.operating-system.signals.process-control/LO-2`
  - `concept.operating-system.signals.process-control/LO-3`
  - `concept.mongodb.change-streams.resume-ordering/LO-1`
  - `concept.mongodb.change-streams.resume-ordering/LO-2`
  - `concept.mongodb.change-streams.resume-ordering/LO-3`
  - `concept.redis.transactions.watch-atomicity/LO-1`
  - `concept.redis.transactions.watch-atomicity/LO-2`
  - `concept.redis.transactions.watch-atomicity/LO-3`
  - `concept.cache.redis-memcached.selection/LO-1`
  - `concept.cache.redis-memcached.selection/LO-2`
  - `concept.cache.redis-memcached.selection/LO-3`
  - `concept.database.sql.char-varchar.storage/LO-1`
  - `concept.database.sql.char-varchar.storage/LO-2`
  - `concept.database.sql.char-varchar.storage/LO-3`
  - `concept.postgresql.schema.namespace-security/LO-1`
  - `concept.postgresql.schema.namespace-security/LO-2`
  - `concept.postgresql.schema.namespace-security/LO-3`
  - `concept.database.newsql.distributed-sql/LO-1`
  - `concept.database.newsql.distributed-sql/LO-2`
  - `concept.database.newsql.distributed-sql/LO-3`
  - `concept.messaging.kafka.connect-streams.integration/LO-1`
  - `concept.messaging.kafka.connect-streams.integration/LO-2`
  - `concept.messaging.kafka.connect-streams.integration/LO-3`
  - `concept.messaging.kafka.log-storage.retention/LO-1`
  - `concept.messaging.kafka.log-storage.retention/LO-2`
  - `concept.messaging.kafka.log-storage.retention/LO-3`
  - `concept.messaging.kafka.zookeeper-kraft.metadata/LO-1`
  - `concept.messaging.kafka.zookeeper-kraft.metadata/LO-2`
  - `concept.messaging.kafka.zookeeper-kraft.metadata/LO-3`
  - `concept.go.tooling.modules-reproducibility/LO-1`
  - `concept.go.tooling.modules-reproducibility/LO-2`
  - `concept.go.tooling.modules-reproducibility/LO-3`

## 測驗目標

- 能把 OS interrupt／signal、資料儲存、Kafka metadata 與 Go dependency 交付串成一條可驗證的事故鏈。
- 能區分事件遺失、重放、順序錯誤、cache miss、schema／權限錯誤、metadata migration 與 build drift 的證據。
- 能提出有界 retry、checkpoint、冪等、容量、權限、migration 與 rollback 設計，而不是只調大 timeout 或增加節點。

### 學習目標覆蓋

| 文章 Concept | Learning Objectives | 作答覆蓋 |
| :--- | :--- | :--- |
| `concept.operating-system.interrupts.hard-soft-context` | LO-1、LO-2、LO-3 | 作答要求 1、2 |
| `concept.operating-system.signals.process-control` | LO-1、LO-2、LO-3 | 作答要求 1、2 |
| `concept.mongodb.change-streams.resume-ordering` | LO-1、LO-2、LO-3 | 作答要求 3、4 |
| `concept.redis.transactions.watch-atomicity` | LO-1、LO-2、LO-3 | 作答要求 4 |
| `concept.cache.redis-memcached.selection` | LO-1、LO-2、LO-3 | 作答要求 5 |
| `concept.database.sql.char-varchar.storage` | LO-1、LO-2、LO-3 | 作答要求 6 |
| `concept.postgresql.schema.namespace-security` | LO-1、LO-2、LO-3 | 作答要求 6 |
| `concept.database.newsql.distributed-sql` | LO-1、LO-2、LO-3 | 作答要求 7 |
| `concept.messaging.kafka.connect-streams.integration` | LO-1、LO-2、LO-3 | 作答要求 3、8 |
| `concept.messaging.kafka.log-storage.retention` | LO-1、LO-2、LO-3 | 作答要求 8 |
| `concept.messaging.kafka.zookeeper-kraft.metadata` | LO-1、LO-2、LO-3 | 作答要求 8 |
| `concept.go.tooling.modules-reproducibility` | LO-1、LO-2、LO-3 | 作答要求 9 |

## 問題情境與限制條件

你接手一個訂單資料平台的 release。新版本同時將網路 ingest worker 的中斷處理改為 deferred work、把 MongoDB Change Stream 接到 Kafka Connect、將 cache 從 Memcached 評估遷移到 Redis，並把部分資料表搬到 NewSQL；建置則由 Go module workflow 產出。

事故證據如下：

- 網卡流量尖峰後 softirq backlog、packet drop 與 p99 上升；部署收到 SIGTERM 後，仍有部分 worker 未完成，重啟後出現重複同步。
- Change Stream consumer 的 resume token 只在收到事件時保存，未確認下游 side effect；一次 oplog window 不足後，重建流程與增量事件可能重疊。
- Redis WATCH conflict 增加，cache hit rate 下降；部分團隊把 Redis MULTI／EXEC 當成可跨資料庫回滾的 ACID transaction。
- schema migration 將 CHAR 改成 VARCHAR、調整 PostgreSQL search_path；NewSQL 跨區 transaction latency 超過 SLO，但團隊只看到平均值。
- Kafka log disk 接近上限，compaction backlog 增加；ZooKeeper→KRaft migration 的 controller quorum 尚未做故障演練。
- CI 在不同 runner 得到不同 Go module graph；有人用 replace 指向本地目錄來「快速修好」production build。

限制：不能直接刪除事件、放寬權限、關閉 durability、無限 retry 或重新 build 未經審計的 production artifact；每次只能先改一個主要變因，並保留 rollback 與 reconciliation 路徑。

## 作答要求

1. 建立前 15 分鐘時間線，分別標示 interrupt／softirq、signal／shutdown、資料同步、Kafka 與 build evidence。
2. 設計 OS 層取證與止血方案，說明 ISR／deferred work、bounded queue、signal drain、force exit、resource cleanup 與 rollback 門檻。
3. 設計 MongoDB Change Stream／Kafka Connect 的 checkpoint、resume、重複吸收、oplog window 不足與 full rebuild 流程。
4. 比較 Redis transaction、WATCH、Lua、MongoDB／SQL transaction 與外部 side effect 的原子性；提出 idempotency 與 reconciliation。
5. 為 Redis／Memcached 與 cache policy 做選型，量化 hit rate、miss amplification、memory、eviction、failover 與 rebuild capacity。
6. 審核 CHAR／VARCHAR、PostgreSQL schema／search_path／grants 與 migration，提出相容、權限與回滾驗證。
7. 評估 NewSQL 的 quorum、consensus、跨區 latency、交易衝突、partition 與成本，說明何時不應採用。
8. 設計 Kafka Connect／Streams、retention／compaction 與 ZooKeeper→KRaft migration 的容量、監控、故障演練與停止線。
9. 設計 Go Modules 的 reproducible build、private dependency、replace、toolchain、checksum、artifact provenance 與回滾策略。

## 期待證據

- 能用 interrupt rate、softirq backlog、packet drop、signal count、drain time、forced exit 與 open handle 證明 OS 假設。
- 能指出 checkpoint 應在可重放副作用安全落地後更新，並以 resume error、oplog window、duplicate ID、lag 與 rebuild diff 驗證。
- 能清楚區分 Redis command atomicity、資料庫 transaction 與跨系統 exactly-once，不以 MULTI／EXEC 掩蓋外部副作用。
- 能用 cache hit／miss、eviction、memory、failover、query plan、schema permission、transaction latency 與 cost 做取捨。
- 能用 Kafka disk、segment、cleaner backlog、controller quorum、metadata lag、leader election、module graph 與 checksum evidence 決定 rollout。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議加機器、關閉 durability、無限 retry 或直接重建，沒有時間線與證據。 |
| 1 | 能列出部分名詞，但混淆 signal／interrupt、checkpoint／commit、cache／transaction 或 KRaft migration。 |
| 2 | 能指出主要風險並提出局部修復，但缺少冪等、容量、權限、rollback 或可觀測驗證。 |
| 3 | 能完成跨層時間線，提出有界處理、checkpoint、冪等、schema／cache／Kafka／module 的安全方案與停止線。 |
| 4 | 除上述內容外，能量化容量與延遲，處理 oplog window、跨區 consensus、metadata migration、artifact provenance 與 reconciliation 的邊界。 |

### 通過標準

總分達 **3/4 分**才通過；OS 控制、資料一致性、訊息可靠性與可重現交付四個面向均不得低於 2 分，且必須提出至少一個可執行的 rollback 條件。

## 參考答案與詳解

先保存 signal、interrupt、worker、stream、Kafka、database 與 CI 的原始時間線，再將症狀分層。softirq backlog 與 packet drop 支持 ingest 過載，但不能直接證明應用 handler 是唯一根因；要用 CPU、queue、latency、drop 與 bounded work 實驗區分。SIGTERM 後應先停止接收、設定 drain deadline、完成可安全提交的工作，逾時才 force exit，重啟後所有工作都必須可重放且冪等。

Change Stream／Connect 需將 resume token、source offset、sink side effect 與 checkpoint 的順序定義清楚：先以 event identity／version 讓下游可重複套用，再保存 checkpoint；oplog window 不足時停止猜測，切換到受控 full snapshot、增量邊界與 reconciliation。Connect、Streams 與外部處理器的責任要以 source／transform／sink、schema、retry、DLQ、lag 與 replay 證據區分。

Redis MULTI／EXEC 或 WATCH 不能自動回滾 MongoDB、SQL、cache 與外部 API；需要 bounded optimistic retry、business idempotency、inbox／outbox 或 reconciliation。Redis／Memcached 選型要看資料是否可重建、資料結構、持久性、failover、eviction、memory 與 rebuild capacity，而不是只比較單次 latency。

schema migration 要先做資料分布與 query plan baseline，使用 expand／migrate／contract 保持讀寫相容；PostgreSQL 權限需明確設定 role、qualified name、search_path 與 default privileges。NewSQL 要以跨區 RTT、quorum、conflict、failure recovery 與成本驗證，不可用平均 latency 掩蓋 p99。

Kafka retention／compaction 要分辨不可重建事件與可重建 changelog；disk、segment、cleaner backlog、oldest offset 與 replay window 是停止線。ZooKeeper→KRaft 應先驗證版本、controller quorum、metadata backup、leader election 與 client compatibility，再做單一可回滾階段。Go build 要固定 toolchain、module graph、checksum、private proxy 與 artifact digest；`replace` 僅能存在於明確的測試／開發 scope，不能偷偷改 production provenance。

## 常見失分點

- 把 signal 當成可立即完成的同步 callback，或在 softirq 壓力下只增加 worker。
- 把 resume token 保存等同於 side effect 已安全提交，忽略 replay 與 oplog window。
- 把 Redis transaction、Kafka transaction 或 NewSQL transaction 宣稱成跨所有系統的 exactly-once。
- 只看平均延遲、cache hit rate 或 disk 使用率，沒有 p99、backlog、rebuild、failover 與成本證據。
- 用本地 `replace`、重新 build 或關閉 validation 來掩蓋 module graph drift。

## 延伸追問

1. 如果 full rebuild 與增量事件同時抵達，你如何用 high-water mark、版本或 fencing 避免覆蓋較新的狀態？
2. 如果 KRaft controller quorum 只剩兩個節點但資料 broker 健康，你會如何決定維持服務或停止 migration？
3. 如果 cache migration 後 hit rate 上升但 Redis memory 與 eviction 也上升，你如何重算 key、TTL、容量與回滾條件？
