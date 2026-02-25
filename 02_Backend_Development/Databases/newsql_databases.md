# NewSQL Databases (NewSQL 資料庫)

- **難度**: 7
- **標籤**: `NewSQL`, `TiDB`, `CockroachDB`, `Spanner`, `Distributed SQL`

## 問題詳述

傳統 RDBMS (如 MySQL) 難以水平擴展，而 NoSQL (如 MongoDB) 犧牲了強一致性和複雜 SQL 支援。NewSQL 如何結合兩者的優點？TiDB 和 CockroachDB 的核心架構是什麼？

## 核心理論與詳解

NewSQL 是一類新型資料庫，旨在同時提供 NoSQL 的可擴展性 (Scalability) 和傳統 RDBMS 的 ACID 事務保證 (Consistency) 與 SQL 支援。

### 1. 核心特性

- **水平擴展 (Horizontal Scalability)**: 透過自動分片 (Auto-Sharding)，只需增加節點即可提升儲存和計算能力。
- **強一致性 (Strong Consistency)**: 通常使用 Paxos 或 Raft 共識演算法來保證分散式副本的一致性。
- **標準 SQL 支援**: 支援複雜的 JOIN、子查詢和 ACID 事務，對應用程式透明。
- **高可用性 (High Availability)**: 自動故障轉移 (Failover)，無單點故障。

### 2. Google Spanner 架構

NewSQL 的鼻祖。

- **TrueTime API**: 利用原子鐘和 GPS 實現全球範圍內的時鐘同步，解決分散式事務的時序問題。
- **Paxos**: 用於跨資料中心的副本同步。

### 3. TiDB (PingCAP)

開源的分散式關聯式資料庫，相容 MySQL 協議。

- **架構**:
  - **TiDB Server**: 無狀態的 SQL 解析層，負責解析 SQL 並生成執行計畫。
  - **TiKV**: 分散式 Key-Value 儲存引擎，負責儲存資料。使用 Raft 協議保證一致性。
  - **PD (Placement Driver)**: 整個叢集的「大腦」，負責元數據管理和調度 (如自動分片平衡)。
- **儲存模型**: 將關聯式資料映射為 Key-Value 對。
  - Key: `TableID_RowID`
  - Value: `RowData`

### 4. CockroachDB

受 Spanner 啟發的開源資料庫，相容 PostgreSQL 協議。

- **架構**: 所有節點對等 (Symmetric)，每個節點都可以接收請求。
- **Range**: 資料按 Key 排序並切分為 Range (預設 64MB)，每個 Range 有 3 個副本，透過 Raft 同步。
- **HLC (Hybrid Logical Clock)**: 混合邏輯時鐘，用於解決分散式事務的時序問題 (軟體實現，不依賴原子鐘)。

### 5. 適用場景

- **海量資料**: 單表超過 10 億行，MySQL 分庫分表維護困難。
- **高併發寫入**: 需要水平擴展寫入能力。
- **金融級一致性**: 對資料一致性要求極高，不能容忍資料遺失。
- **即時分析 (HTAP)**: 同時需要 OLTP (交易) 和 OLAP (分析) 能力 (TiDB 的 TiFlash 列存引擎)。

## 程式碼範例

(NewSQL 使用標準 SQL，無特殊程式碼，但配置和維運方式不同)
