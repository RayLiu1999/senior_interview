# MySQL

MySQL 是世界上最流行的開源關聯式資料庫之一。作為資深後端工程師，您需要深入理解 MySQL 的儲存引擎、索引機制、交易管理以及效能調優技巧。本章節涵蓋了面試中最常被考察的 MySQL 核心主題。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [`VARCHAR` 和 `CHAR` 有什麼區別？](./varchar_vs_char.md) | 3 | 3 | `MySQL`, `Data Types` |
| 2 | [`DELETE`、`TRUNCATE` 和 `DROP` 指令的區別是什麼？](./delete_truncate_drop.md) | 3 | 3 | `MySQL`, `SQL Commands` |
| 3 | [主鍵 (Primary Key) 和唯一鍵 (Unique Key) 有什麼區別？](./primary_key_vs_unique_key.md) | 3 | 4 | `MySQL`, `Constraints` |
| 4 | [InnoDB 和 MyISAM 儲存引擎有什麼核心區別？](./innodb_vs_myisam.md) | 5 | 5 | `MySQL`, `Storage Engine`, `InnoDB`, `MyISAM` |
| 5 | [什麼是資料庫索引？它的優缺點是什麼？有哪些常見的索引類型？](./database_indexes.md) | 6 | 5 | `MySQL`, `Indexing`, `B+Tree` |
| 6 | [請解釋 SQL 的四種交易隔離級別，以及它們分別解決了哪些併發問題](./transaction_isolation_levels.md) | 7 | 5 | `MySQL`, `Transaction`, `Isolation Level` |
| 7 | [什麼是 MVCC (多版本併發控制)？它是如何運作的？](./what_is_mvcc.md) | 8 | 4 | `MySQL`, `MVCC`, `Concurrency` |
| 8 | [如何進行 SQL 查詢優化？請提供一些常見的策略](./how_to_optimize_sql_queries.md) | 8 | 4 | `MySQL`, `Query Optimization`, `Performance` |
| 9 | [請解釋 MySQL 的主從複製 (Replication) 機制及其主要用途](./mysql_replication.md) | 7 | 4 | `MySQL`, `Replication`, `High Availability` |
| 10 | [InnoDB 的鎖機制：行鎖、間隙鎖與 Next-Key Lock](./mysql_lock_mechanism.md) | 8 | 5 | `MySQL`, `InnoDB`, `Locking`, `Gap Lock`, `Deadlock` |
| 11 | [MySQL 的三大日誌：Binlog、Redo Log 與 Undo Log](./mysql_binlog_redolog_undolog.md) | 8 | 5 | `MySQL`, `WAL`, `Binlog`, `Redo Log`, `Undo Log`, `2PC` |
| 12 | [MySQL 架構深度解析：連接層、Server 層與存儲引擎層](./mysql_architecture.md) | 6 | 4 | `MySQL`, `架構`, `InnoDB`, `查詢優化器`, `插件式存儲引擎` |

---

## 學習建議

1.  **掌握基礎知識**: 從資料類型、約束、基本指令開始，建立紮實的 SQL 基礎。
2.  **精通儲存引擎**: InnoDB 是 MySQL 的預設引擎，必須深入理解其特性和與 MyISAM 的差異。
3.  **理解索引與優化**: B+Tree 索引原理、EXPLAIN 分析、慢查詢優化是面試的高頻考點。
4.  **掌握交易與並行**: ACID、隔離等級、MVCC、鎖機制是保證資料一致性的核心知識。
5.  **學習擴展方案**: 主從複製、讀寫分離、分庫分表等是解決 MySQL 效能瓶頸的關鍵技術。

