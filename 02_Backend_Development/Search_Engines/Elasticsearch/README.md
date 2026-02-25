# Elasticsearch

Elasticsearch 是基於 Apache Lucene 的分散式搜尋和分析引擎。作為資深後端工程師，您需要理解 Elasticsearch 的核心概念、索引機制、查詢語法以及在大規模場景下的調優技巧。本章節涵蓋了面試中最常被考察的 Elasticsearch 核心主題。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [什麼是 Elasticsearch？它的核心功能是什麼？](./what_is_elasticsearch.md) | 5 | 5 | `Elasticsearch`, `Search Engine`, `Full-Text Search` |
| 2 | [Elasticsearch 查詢語法詳解：Match, Term, Bool Query](./elasticsearch_query_dsl.md) | 6 | 5 | `Elasticsearch`, `Query DSL`, `Search` |
| 3 | [Elasticsearch 索引 Mapping 與分析器](./elasticsearch_mapping_and_analyzers.md) | 6 | 5 | `Elasticsearch`, `Mapping`, `Analyzer`, `Text Processing` |
| 4 | [Elasticsearch 分片與副本機制](./elasticsearch_shards_and_replicas.md) | 7 | 5 | `Elasticsearch`, `Sharding`, `Replica`, `Distributed` |
| 5 | [Elasticsearch 聚合查詢詳解](./elasticsearch_aggregations.md) | 7 | 5 | `Elasticsearch`, `Aggregations`, `Analytics`, `Data Analysis` |
| 6 | [Elasticsearch 效能優化與最佳實踐](./elasticsearch_performance_optimization.md) | 8 | 5 | `Elasticsearch`, `Performance`, `Optimization`, `Best Practices` |
| 7 | [Elasticsearch 與關聯式資料庫的資料同步](./elasticsearch_data_sync.md) | 7 | 4 | `Elasticsearch`, `Data Sync`, `Database`, `CDC` |

---

## 學習建議

1. **掌握基本概念**: Index、Document、Mapping、Shard、Replica 等是理解 Elasticsearch 的基礎。
2. **理解索引機制**: 倒排索引是全文搜尋的核心，要能解釋其工作原理和優勢。
3. **熟悉查詢語法**: Match、Term、Bool、Aggregation 等查詢是日常開發的必備技能，區分 text 與 keyword 類型的使用場景。
4. **掌握分片策略**: 了解分片數量規劃、副本機制、以及 Over-sharding 問題。
5. **關注效能調優**: JVM Heap 配置、Filter vs Query Context、深分頁問題、Bulk API 最佳實踐。
6. **理解資料同步**: 掌握 CDC、訊息佇列等將關聯式資料庫同步到 ES 的方案。
7. **實踐 ELK Stack**: 理解 Elasticsearch、Logstash、Kibana 的整合應用場景。
