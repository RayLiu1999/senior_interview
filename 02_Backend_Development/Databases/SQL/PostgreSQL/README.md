# PostgreSQL

PostgreSQL 是最先進的開源關聯式資料庫之一，以其強大的功能和 SQL 標準遵循性著稱。作為資深後端工程師，您需要深入理解 PostgreSQL 的特殊資料類型、索引機制、MVCC 原理以及複製策略。本章節涵蓋了面試中最常被考察的 PostgreSQL 核心主題。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [PostgreSQL 是什麼？它與 MySQL 相比有哪些主要優勢？](./postgresql_vs_mysql.md) | 4 | 5 | `PostgreSQL`, `MySQL`, `Comparison` |
| 2 | [PostgreSQL 有哪些特殊的資料類型？(例如 JSONB, Array)](./special_data_types.md) | 5 | 4 | `PostgreSQL`, `Data Types`, `JSONB` |
| 3 | [什麼是 PostgreSQL 中的模式 (Schema)？它有什麼用途？](./what_is_schema.md) | 4 | 3 | `PostgreSQL`, `Schema`, `Database Design` |
| 4 | [請解釋 PostgreSQL 的 MVCC 機制與 `VACUUM` 的作用。](./mvcc_and_vacuum.md) | 7 | 5 | `PostgreSQL`, `MVCC`, `VACUUM` |
| 5 | [PostgreSQL 支援哪些常見的索引類型？(GiST, GIN 等)](./index_types.md) | 6 | 4 | `PostgreSQL`, `Indexing`, `GiST`, `GIN` |
| 6 | [PostgreSQL 的預設交易隔離級別是什麼？與 MySQL 有何不同？](./transaction_isolation_levels.md) | 6 | 4 | `PostgreSQL`, `Transaction`, `Isolation Level` |
| 7 | [詳細解釋 `VACUUM`, `VACUUM FULL` 和 `autovacuum` 的區別。](./vacuum_deep_dive.md) | 7 | 4 | `PostgreSQL`, `VACUUM`, `Maintenance` |
| 8 | [解釋 PostgreSQL 的串流複製和邏輯複製。](./replication_streaming_vs_logical.md) | 8 | 4 | `PostgreSQL`, `Replication`, `High Availability` |
| 9 | [什麼是通用資料表運算式 (CTE)？它有什麼優勢？](./cte_and_recursive_cte.md) | 6 | 3 | `PostgreSQL`, `CTE`, `Query Optimization` |
| 10 | [PostgreSQL WAL (Write-Ahead Log) 原理與應用](./wal_write_ahead_log.md) | 7 | 4 | `PostgreSQL`, `WAL`, `崩潰恢復`, `複製` |
| 11 | [PostgreSQL 表格分區 (Table Partitioning) 深度解析](./table_partitioning.md) | 7 | 4 | `PostgreSQL`, `Partitioning`, `性能調優`, `大資料量` |

---

## 學習建議

1.  **理解 PostgreSQL 優勢**: JSONB、陣列、全文搜尋等特殊功能是 PostgreSQL 區別於 MySQL 的關鍵。
2.  **掌握 MVCC 機制**: MVCC 和 VACUUM 是 PostgreSQL 並行控制的核心，必須深入理解。
3.  **精通索引類型**: B-Tree、Hash、GiST、GIN、BRIN 等索引各有適用場景。
4.  **熟悉進階特性**: CTE、Window Functions、Generated Columns 等是編寫複雜查詢的利器。
5.  **實踐複製策略**: 串流複製和邏輯複製是實現高可用性和水平擴展的關鍵技術。
