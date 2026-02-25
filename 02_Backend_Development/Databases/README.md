# 資料庫 (Databases)

資料庫是後端系統的核心元件之一。作為資深後端工程師，您需要深入理解不同類型資料庫的特性、適用場景以及如何根據業務需求選擇合適的資料庫技術。本章節涵蓋了面試中最常被考察的資料庫核心主題。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [SQL vs. NoSQL](./sql_vs_nosql.md) | 5 | 5 | `Database`, `SQL`, `NoSQL`, `Comparison` |
| 2 | [資料庫索引](./database_indexing.md) | 6 | 5 | `Database`, `Indexing`, `Performance` |
| 3 | [資料庫交易](./database_transactions.md) | 6 | 5 | `Database`, `Transaction`, `ACID` |
| 4 | [資料庫正規化](./database_normalization.md) | 6 | 4 | `Database`, `Normalization`, `Schema Design` |
| 5 | [資料庫分片](./database_sharding.md) | 8 | 5 | `Database`, `Sharding`, `Scalability` |
| 6 | [資料庫高可用方案](./database_high_availability.md) | 7 | 5 | `Database`, `High Availability`, `Replication`, `Load Balancing` |
| 7 | [資料庫效能調優全攻略](./database_performance_tuning.md) | 8 | 5 | `Database`, `Performance`, `Tuning` |
| 8 | [NewSQL 資料庫](./newsql_databases.md) | 7 | 3 | `NewSQL`, `TiDB`, `CockroachDB`, `Spanner` |
| 9 | [資料庫備份與還原](./database_backup_and_restore.md) | 6 | 4 | `Backup`, `Restore`, `PITR`, `Disaster Recovery` |
| 10 | [資料庫遷移策略](./database_migration_strategies.md) | 8 | 4 | `Migration`, `Dual Write`, `CDC`, `Zero Downtime` |
| 11 | [讀寫分離](./read_write_splitting.md) | 6 | 5 | `Database`, `Scalability`, `Replication`, `Architecture` |

---

## 子主題

### SQL 資料庫

- [MySQL](./SQL/MySQL/README.md)
- [PostgreSQL](./SQL/PostgreSQL/README.md)

### NoSQL 資料庫

- [MongoDB](./NoSQL/MongoDB/README.md)
- [Redis](./NoSQL/Redis/README.md)

---

## 學習建議

1. **掌握基本原理**: 索引、交易、正規化是資料庫設計的理論基礎，必須深入理解。
2. **理解選型依據**: SQL vs. NoSQL 不是非黑即白，要能根據業務場景做出合理的權衡。
3. **熟悉擴展策略**: 分片、複製、讀寫分離等是解決資料庫效能瓶頸的常見手段。
4. **實踐多種資料庫**: 實際使用 MySQL、PostgreSQL、MongoDB、Redis 等，理解各自的優勢與限制。
5. **關注資料一致性**: 在分散式環境下，如何保證資料一致性是面試的高頻考點。
