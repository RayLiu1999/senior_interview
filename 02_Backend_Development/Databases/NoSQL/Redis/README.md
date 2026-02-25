# Redis

Redis 是最流行的記憶體資料庫之一，以其高效能、豐富的資料結構和多樣化的應用場景著稱。作為資深後端工程師，您需要深入理解 Redis 的資料結構、持久化機制、記憶體管理以及在分散式系統中的應用。本章節涵蓋了面試中最常被考察的 Redis 核心主題。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [什麼是 Redis？它支援哪些主要的資料結構？](./what_is_redis_and_its_data_structures.md) | 3 | 5 | `Redis`, `Data Structures`, `NoSQL` |
| 2 | [Redis 和 Memcached 有什麼核心區別？](./redis_vs_memcached.md) | 4 | 4 | `Redis`, `Memcached`, `Comparison` |
| 3 | [請解釋 Redis 的持久化機制 (RDB 和 AOF)，並比較其優缺點。](./redis_persistence_rdb_vs_aof.md) | 6 | 5 | `Redis`, `Persistence`, `RDB`, `AOF` |
| 4 | [Redis 的交易 (Transaction) 如何運作？它滿足 ACID 嗎？](./redis_transactions_and_acid.md) | 6 | 4 | `Redis`, `Transaction`, `ACID` |
| 5 | [Redis 的單執行緒模型是什麼意思？它為何如此高效？](./redis_single_thread_model.md) | 6 | 5 | `Redis`, `Single Thread`, `Performance` |
| 6 | [請解釋 Redis 的記憶體淘汰策略 (Eviction Policies)。](./redis_memory_eviction_policies.md) | 7 | 5 | `Redis`, `Memory`, `Eviction Policy` |
| 7 | [如何基於 Redis 設計一個可靠的分散式鎖？](./design_redis_distributed_lock.md) | 8 | 5 | `Redis`, `Distributed Lock`, `Concurrency` |
| 8 | [Redis Sentinel (哨兵) 和 Redis Cluster (叢集) 的架構與取捨是什麼？](./redis_sentinel_vs_cluster.md) | 8 | 4 | `Redis`, `Sentinel`, `Cluster`, `High Availability` |
| 9 | [Redis Stream：持久化訊息串流與 Consumer Group 機制](./redis_stream.md) | 7 | 4 | `Redis`, `Stream`, `訊息佇列`, `Consumer Group` |
| 10 | [Redis 熱點 Key 與大 Key 問題及解決方案](./redis_hotkey_bigkey.md) | 7 | 5 | `Redis`, `Hot Key`, `Big Key`, `效能調優` |
| 11 | [Redis Pipeline 與 Lua 腳本：批次操作與原子性](./redis_pipeline.md) | 6 | 4 | `Redis`, `Pipeline`, `Lua`, `原子性` |

---

## 學習建議

1.  **掌握資料結構**: String、Hash、List、Set、Sorted Set 五種基本資料結構的使用場景和內部實現。
2.  **理解持久化機制**: RDB 和 AOF 各有優劣，要能根據場景選擇合適的持久化策略。
3.  **關注效能特性**: 單執行緒模型、記憶體管理、淘汰策略是 Redis 高效能的關鍵。
4.  **學習高階應用**: 分散式鎖、限流器、排行榜等是 Redis 在實際系統中的典型應用。
5.  **實踐高可用方案**: Sentinel 和 Cluster 是實現 Redis 高可用性和水平擴展的主流方案。
