# 快取 (Caching)

快取是提升系統效能和降低資料庫負載的關鍵技術。作為資深後端工程師，您需要深入理解各種快取策略、淘汰演算法以及如何在分散式系統中正確使用快取。本章節涵蓋了面試中最常被考察的快取核心主題。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [快取策略與淘汰演算法](./caching_strategies_and_eviction_algorithms.md) | 6 | 5 | `Caching`, `LRU`, `LFU`, `TTL` |
| 2 | [快取穿透、擊穿與雪崩](./cache_penetration_breakdown_avalanche.md) | 7 | 5 | `Caching`, `Cache Issues`, `Distributed Systems` |

---

## 子主題

### 快取技術
- [Redis](./Redis/README.md)
- [Memcached](./Memcached/README.md)

---

## 學習建議

1.  **掌握基本策略**: Cache-Aside、Write-Through、Write-Behind 等策略各有適用場景。
2.  **理解淘汰演算法**: LRU、LFU、TTL 等演算法的實現原理和性能特性是面試的熱門考點。
3.  **熟悉常見問題**: 快取穿透、擊穿、雪崩是生產環境中的典型問題，必須能提出有效的解決方案。
4.  **實踐分散式快取**: Redis 和 Memcached 是業界主流的快取方案，要能說明其差異和適用場景。
5.  **關注一致性**: 快取與資料庫之間的一致性保證是設計快取系統時的核心挑戰。