# 資料庫 (Databases) - 重點考題 (Quiz)

> 這份考題是從資料庫章節中挑選出**重要程度 4-5** 的核心題目，設計成自我測驗的形式。
> 
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

## 📊 基礎概念

### Q1: SQL vs. NoSQL 該如何選擇？
<!-- Concept ID: concept.database.selection.sql-nosql-tradeoffs; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請比較 SQL 和 NoSQL 資料庫的差異，並說明各自適合的使用場景。

<details>
<summary>💡 答案提示</summary>

**SQL 資料庫**：
- 結構化資料，固定 Schema
- 強一致性 (ACID)
- 支援複雜查詢和 JOIN
- 垂直擴展為主
- 適用：金融交易、ERP、關聯性強的資料

**NoSQL 資料庫**：
- 靈活 Schema，適合非結構化資料
- 最終一致性 (BASE)
- 水平擴展能力強
- 類型：Key-Value、文件型、列式、圖資料庫

**選擇依據**：
| 需求 | 選擇 |
|------|------|
| 複雜查詢、事務 | SQL |
| 高擴展性、靈活結構 | NoSQL |
| 關聯資料多 | SQL |
| 讀寫密集、簡單查詢 | NoSQL |

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/sql_vs_nosql.md)

---

### Q2: 什麼是資料庫索引？解釋 B+ Tree 的原理
<!-- Concept ID: concept.database.indexing.b-tree-lsm-tree; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋索引的作用、類型，以及 B+ Tree 為何適合資料庫索引。

<details>
<summary>💡 答案提示</summary>

**索引的作用**：
- 加速資料檢索（空間換時間）
- 減少磁碟 I/O
- 但會增加寫入開銷

**索引類型**：
- 主鍵索引、唯一索引、普通索引
- 單列索引 vs 複合索引
- 聚簇索引 vs 非聚簇索引
- 覆蓋索引、全文索引

**B+ Tree 優勢**：
1. 所有資料存在葉子節點，範圍查詢高效
2. 葉子節點有指標連接，利於順序訪問
3. 樹高度低，減少磁碟 I/O（3-4 層可存數千萬筆）
4. 節點大小對應磁碟頁，利於批量讀取

**複合索引遵循最左匹配原則**

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/database_indexing.md)

---

### Q3: 解釋 ACID 特性和隔離級別
<!-- Concept ID: concept.database.transaction-isolation; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋資料庫交易的 ACID 特性，以及四種隔離級別和它們解決的問題。

<details>
<summary>💡 答案提示</summary>

**ACID 特性**：
- **A (Atomicity)**：原子性，全部成功或全部失敗
- **C (Consistency)**：一致性，遵守完整性約束
- **I (Isolation)**：隔離性，並發事務互不干擾
- **D (Durability)**：持久性，提交後永久保存

**並發問題**：
| 問題 | 描述 |
|------|------|
| 髒讀 | 讀到未提交的資料 |
| 不可重複讀 | 同一筆資料讀兩次結果不同 |
| 幻讀 | 範圍查詢結果集變化 |

**隔離級別**：
| 級別 | 髒讀 | 不可重複讀 | 幻讀 |
|------|------|-----------|------|
| Read Uncommitted | ✗ | ✗ | ✗ |
| Read Committed | ✓ | ✗ | ✗ |
| Repeatable Read | ✓ | ✓ | ✗ |
| Serializable | ✓ | ✓ | ✓ |

**MySQL 預設 RR，PostgreSQL 預設 RC**

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/database_transactions.md)

---

## 🔧 擴展與效能

### Q4: 什麼是資料庫分片 (Sharding)？有哪些策略？
<!-- Concept ID: concept.database.sharding.distribution-strategies; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請解釋分片的概念、常見分片策略，以及各自的優缺點。

<details>
<summary>💡 答案提示</summary>

**分片類型**：
- **水平分片**：按行拆分到不同資料庫
- **垂直分片**：按列（功能）拆分

**水平分片策略**：

1. **Range Sharding (範圍分片)**
   - 按範圍分配（如 ID 1-1000 → Shard1）
   - 優點：簡單，範圍查詢高效
   - 缺點：資料分佈不均

2. **Hash Sharding (雜湊分片)**
   - hash(key) % N 決定分片
   - 優點：資料分佈均勻
   - 缺點：擴容困難，需重新分配

3. **Consistent Hashing (一致性雜湊)**
   - 解決擴容問題
   - 增減節點只影響相鄰分片

**分片挑戰**：
- 跨分片 JOIN 困難
- 分散式事務複雜
- 全域唯一 ID 生成
- 資料遷移和平衡

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/database_sharding.md)

---

### Q5: 資料庫高可用方案有哪些？
<!-- Concept ID: concept.database.high-availability.replication-failover; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請解釋主從複製、主主複製、讀寫分離等高可用方案。

<details>
<summary>💡 答案提示</summary>

**主從複製 (Master-Slave)**：
- 主庫處理寫入，從庫處理讀取
- 異步複製：效能好，可能丟資料
- 半同步複製：主庫等待至少一個從庫確認
- 同步複製：強一致，效能低

**主主複製 (Master-Master)**：
- 兩個主庫互相複製
- 需處理衝突問題
- 常用於異地多活

**讀寫分離**：
- 寫請求 → 主庫
- 讀請求 → 從庫（需處理延遲）

**高可用架構**：
- Keepalived + VIP：自動故障轉移
- MHA (MySQL)：自動主從切換
- MGR (MySQL Group Replication)：多主叢集
- Patroni (PostgreSQL)：自動故障轉移

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/database_high_availability.md)

---

### Q6: 如何進行資料庫效能調優？
<!-- Concept ID: concept.database.performance-tuning.query-index-optimization; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請說明資料庫效能調優的主要方向和常見技巧。

<details>
<summary>💡 答案提示</summary>

**1. 索引優化**：
- 為高頻查詢欄位建索引
- 避免過度索引
- 使用複合索引並遵循最左匹配
- 使用 EXPLAIN 分析查詢

**2. 查詢優化**：
- 避免 SELECT *
- 避免在 WHERE 中使用函數
- 使用 LIMIT 限制結果集
- 避免 N+1 查詢問題

**3. Schema 設計**：
- 適當的正規化/反正規化
- 選擇合適的資料類型
- 合理設計分區

**4. 配置調優**：
- 緩衝池大小 (innodb_buffer_pool_size)
- 連接池設定
- 日誌參數調整

**5. 架構優化**：
- 讀寫分離
- 分庫分表
- 使用快取層

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/database_performance_tuning.md)

---

### Q7: 什麼是讀寫分離？如何處理主從延遲？
<!-- Concept ID: concept.database.read-write-splitting.replication-lag; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋讀寫分離的架構和延遲問題的解決方案。

<details>
<summary>💡 答案提示</summary>

**讀寫分離架構**：
```
            寫入
Client ────────► Master (主庫)
                    │
                    │ 複製
                    ▼
            ┌──────┴──────┐
            ▼             ▼
         Slave1        Slave2  (從庫)
            ▲             ▲
            └──────┬──────┘
                讀取
```

**主從延遲問題**：
- 剛寫入的資料在從庫讀不到

**解決方案**：
1. **強制讀主**：關鍵業務讀主庫
2. **延遲讀取**：寫入後等待一段時間再讀
3. **半同步複製**：確保資料至少複製到一個從庫
4. **中間件路由**：記錄最近寫入，短時間內讀主
5. **Session 級別**：同一 Session 寫後讀走主庫

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/read_write_splitting.md)

---

### Q8: 資料庫正規化的概念和適用場景
<!-- Concept ID: concept.database.normalization.normal-forms; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請解釋正規化的目的和各層級，以及何時該反正規化。

<details>
<summary>💡 答案提示</summary>

**正規化目的**：
- 消除資料冗餘
- 維護資料一致性
- 減少更新異常

**常見正規形式**：
- **1NF**：欄位不可再分（原子性）
- **2NF**：消除部分依賴（非主鍵欄位完全依賴主鍵）
- **3NF**：消除傳遞依賴（非主鍵欄位不依賴其他非主鍵）
- **BCNF**：更嚴格的 3NF

**反正規化場景**：
- 讀多寫少，需要減少 JOIN
- 效能優先於儲存空間
- 資料不常變動

**例如**：在訂單表中冗餘商品名稱，避免每次 JOIN 商品表

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/database_normalization.md)

---

### Q9: 資料庫遷移的策略和注意事項
<!-- Concept ID: concept.database.migration.zero-downtime; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🟡 重要

請說明如何進行零停機時間的資料庫遷移。

<details>
<summary>💡 答案提示</summary>

**遷移策略**：

1. **雙寫策略 (Dual Write)**
   - 同時寫入新舊資料庫
   - 逐步切換讀流量
   - 最終停止舊庫寫入

2. **CDC (Change Data Capture)**
   - 捕獲舊庫變更
   - 即時同步到新庫
   - 工具：Debezium、Canal

3. **藍綠部署**
   - 準備兩套環境
   - 資料同步後切換

**遷移步驟**：
1. 全量資料同步
2. 增量資料同步
3. 驗證資料一致性
4. 切換讀流量
5. 切換寫流量
6. 觀察穩定後下線舊庫

**注意事項**：
- 備份！備份！備份！
- 可回滾方案
- 驗證資料完整性

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/database_migration_strategies.md)

---

## 🧭 Phase 3：Database Storage & Consistency

### Q10: MySQL MVCC如何支援一致性讀
<!-- Concept ID: `concept.database.mysql.mvcc`; Learning Objective IDs: `concept.database.mysql.mvcc/LO-1`, `concept.database.mysql.mvcc/LO-2`, `concept.database.mysql.mvcc/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請說明 InnoDB 的版本鏈、Read View、一致性讀與 current read 如何互動。

<details>
<summary>💡 答案提示</summary>

- 連結 undo version、Read View 可見性與 Read Committed／Repeatable Read。
- 區分 snapshot read、current read、鎖與長交易造成的 purge／undo 成本。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/MySQL/what_is_mvcc.md)

---

### Q11: MySQL redo-undo與binlog如何協同
<!-- Concept ID: `concept.database.mysql.redo-undo-binlog`; Learning Objective IDs: `concept.database.mysql.redo-undo-binlog/LO-1`, `concept.database.mysql.redo-undo-binlog/LO-2`, `concept.database.mysql.redo-undo-binlog/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較 redo log、undo log 與 binlog 在復原、rollback 和 replication 中的責任。

<details>
<summary>💡 答案提示</summary>

- 說明 redo 的 crash recovery、undo 的版本／回滾與 binlog 的複製／PITR 角色。
- 連結 commit、durability、兩階段提交與 RPO。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/MySQL/mysql_binlog_redolog_undolog.md)

---

### Q12: MySQL鎖機制如何診斷死鎖
<!-- Concept ID: `concept.database.mysql.locking`; Learning Objective IDs: `concept.database.mysql.locking/LO-1`, `concept.database.mysql.locking/LO-2`, `concept.database.mysql.locking/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請解釋 record、gap、next-key、metadata lock 與死鎖診斷方法。

<details>
<summary>💡 答案提示</summary>

- 以 wait-for graph、索引範圍與 transaction 順序找出 cycle。
- 以短交易、固定鎖順序、合理 timeout 與有限 retry 降低風險。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/MySQL/mysql_lock_mechanism.md)

---

### Q13: MySQL隔離級別如何取捨
<!-- Concept ID: `concept.database.mysql.transaction-isolation`; Learning Objective IDs: `concept.database.mysql.transaction-isolation/LO-1`, `concept.database.mysql.transaction-isolation/LO-2`, `concept.database.mysql.transaction-isolation/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較四種隔離級別及其對 dirty read、non-repeatable read、phantom read、鎖和吞吐量的影響。

<details>
<summary>💡 答案提示</summary>

- 用並發時間線說明各隔離級別，不只背表格。
- 連結 MVCC、gap／next-key lock、deadlock、timeout 與 retry。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/MySQL/transaction_isolation_levels.md)

---

### Q14: MySQL索引如何影響查詢計畫
<!-- Concept ID: `concept.database.mysql.indexing.plan-design`; Learning Objective IDs: `concept.database.mysql.indexing.plan-design/LO-1`, `concept.database.mysql.indexing.plan-design/LO-2`, `concept.database.mysql.indexing.plan-design/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明 B+ Tree、複合索引欄位順序、覆蓋索引、回表與寫入成本。

<details>
<summary>💡 答案提示</summary>

- 以 WHERE、JOIN、ORDER BY、基數和最左前綴選擇索引。
- 用 EXPLAIN、實際 rows、I/O 和 insert/update 成本驗證，不要盲目加索引。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/MySQL/database_indexes.md)

---

### Q15: SQL查詢優化如何以證據驗證
<!-- Concept ID: `concept.database.mysql.query-plan-optimization`; Learning Objective IDs: `concept.database.mysql.query-plan-optimization/LO-1`, `concept.database.mysql.query-plan-optimization/LO-2`, `concept.database.mysql.query-plan-optimization/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請提出一套從慢查詢、EXPLAIN 到壓測回歸的 SQL 優化流程。

<details>
<summary>💡 答案提示</summary>

- 先確認 workload、參數、估算／實際 rows、索引和鎖／I/O。
- 比較查詢改寫、批次、分頁和 schema 變更的 p95/p99、吞吐量與回滾風險。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/MySQL/how_to_optimize_sql_queries.md)

---

### Q16: MySQL複製模式如何影響RPO
<!-- Concept ID: `concept.database.mysql.replication`; Learning Objective IDs: `concept.database.mysql.replication/LO-1`, `concept.database.mysql.replication/LO-2`, `concept.database.mysql.replication/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較非同步、半同步與同步複製的確認點、延遲、故障轉移和資料遺失風險。

<details>
<summary>💡 答案提示</summary>

- 觀察 GTID／binlog、relay log、replication lag 和 read-after-write。
- 以 RPO/RTO、failover、重建 replica 和 rollback plan 做選擇。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/MySQL/mysql_replication.md)

---

### Q17: InnoDB與MyISAM如何取捨
<!-- Concept ID: `concept.database.mysql.storage-engines`; Learning Objective IDs: `concept.database.mysql.storage-engines/LO-1`, `concept.database.mysql.storage-engines/LO-2`, `concept.database.mysql.storage-engines/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請比較 InnoDB 與 MyISAM 的交易、鎖、Crash Recovery、索引和維運取捨。

<details>
<summary>💡 答案提示</summary>

- 對照 row-level locking、ACID、foreign key、crash recovery 和全文／COUNT 特性。
- 把引擎選擇連到 replication、backup、寫入 workload 與資料可靠性。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/MySQL/innodb_vs_myisam.md)

---

### Q18: MySQL架構中的查詢與日誌路徑
<!-- Concept ID: `concept.database.mysql.architecture`; Learning Objective IDs: `concept.database.mysql.architecture/LO-1`, `concept.database.mysql.architecture/LO-2`, `concept.database.mysql.architecture/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請從連線、Parser、Optimizer、Storage Engine、Buffer Pool 和 log path 重建一次查詢。

<details>
<summary>💡 答案提示</summary>

- 區分 SQL layer、InnoDB、redo／undo／binlog 和磁碟 I/O 的責任。
- 以 query latency、buffer hit、lock、I/O 和 pool wait 定位瓶頸。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/MySQL/mysql_architecture.md)

---

### Q19: DELETE、TRUNCATE、DROP如何選擇
<!-- Concept ID: `concept.database.mysql.ddl-lifecycle`; Learning Objective IDs: `concept.database.mysql.ddl-lifecycle/LO-1`, `concept.database.mysql.ddl-lifecycle/LO-2`, `concept.database.mysql.ddl-lifecycle/LO-3` -->

**難度**: ⭐⭐⭐ (3) | **重要性**: 🟡 重要

請比較 DELETE、TRUNCATE 與 DROP 的資料、Schema、交易、鎖和復原邊界。

<details>
<summary>💡 答案提示</summary>

- 先判斷是否需要條件刪除、rollback、觸發器、保留 schema 或完全移除物件。
- 大批量清理要加入分批、限速、備份、監控和可回復方案。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/MySQL/delete_truncate_drop.md)

---

### Q20: Primary Key與Unique Key如何選擇
<!-- Concept ID: `concept.database.mysql.keys`; Learning Objective IDs: `concept.database.mysql.keys/LO-1`, `concept.database.mysql.keys/LO-2`, `concept.database.mysql.keys/LO-3` -->

**難度**: ⭐⭐⭐⭐ (4) | **重要性**: 🟡 重要

請比較 Primary Key 與 Unique Key 的唯一性、NULL、聚簇索引、外鍵與資料模型語意。

<details>
<summary>💡 答案提示</summary>

- 主鍵是資料列的主要 identity；唯一鍵通常是業務約束或 alternate key。
- 評估鍵長度、穩定性、寫入分佈、外鍵和未來分片需求。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/MySQL/primary_key_vs_unique_key.md)

---

### Q21: PostgreSQL索引類型如何對應查詢
<!-- Concept ID: `concept.database.postgresql.index-types`; Learning Objective IDs: `concept.database.postgresql.index-types/LO-1`, `concept.database.postgresql.index-types/LO-2`, `concept.database.postgresql.index-types/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較 PostgreSQL 的 B-Tree、Hash、GiST、GIN 及其適用資料與查詢。

<details>
<summary>💡 答案提示</summary>

- 依 equality、range、JSONB／ARRAY、地理與全文查詢選 operator class。
- 用 EXPLAIN ANALYZE、buffers、寫入成本與 index size 驗證。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/PostgreSQL/index_types.md)

---

### Q22: PostgreSQL MVCC與VACUUM如何維持健康
<!-- Concept ID: `concept.database.postgresql.mvcc-vacuum`; Learning Objective IDs: `concept.database.postgresql.mvcc-vacuum/LO-1`, `concept.database.postgresql.mvcc-vacuum/LO-2`, `concept.database.postgresql.mvcc-vacuum/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋 tuple version、dead tuple、snapshot、autovacuum、bloat 與 planner 統計的關聯。

<details>
<summary>💡 答案提示</summary>

- 連結長交易／xmin、清理延遲、膨脹、I/O 和查詢計畫退化。
- 比較 VACUUM、ANALYZE、VACUUM FULL 的影響、lock 與維護窗口。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/PostgreSQL/mvcc_and_vacuum.md)

---

### Q23: PostgreSQL隔離級別如何處理快照與衝突
<!-- Concept ID: `concept.database.postgresql.transaction-isolation`; Learning Objective IDs: `concept.database.postgresql.transaction-isolation/LO-1`, `concept.database.postgresql.transaction-isolation/LO-2`, `concept.database.postgresql.transaction-isolation/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 PostgreSQL Read Committed、Repeatable Read、Serializable 的 snapshot、衝突與 retry 語意。

<details>
<summary>💡 答案提示</summary>

- 用並發時間線說明 snapshot 何時固定及 serialization failure。
- 依一致性需求、重試成本、長交易和吞吐量選擇隔離級別。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/PostgreSQL/transaction_isolation_levels.md)

---

### Q24: PostgreSQL複製模式如何影響高可用
<!-- Concept ID: `concept.database.postgresql.replication-modes`; Learning Objective IDs: `concept.database.postgresql.replication-modes/LO-1`, `concept.database.postgresql.replication-modes/LO-2`, `concept.database.postgresql.replication-modes/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🟡 重要

請比較 streaming replication 與 logical replication 的資料邊界、延遲、升級和故障復原用途。

<details>
<summary>💡 答案提示</summary>

- 觀察 WAL LSN、apply lag、replication slot、archive 和 publisher／subscriber。
- 以 HA、CDC、跨版本升級、選擇性同步與 RPO/RTO 做選擇。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/PostgreSQL/replication_streaming_vs_logical.md)

---

### Q25: PostgreSQL分區如何改善查詢與維運
<!-- Concept ID: `concept.database.postgresql.partitioning`; Learning Objective IDs: `concept.database.postgresql.partitioning/LO-1`, `concept.database.postgresql.partitioning/LO-2`, `concept.database.postgresql.partitioning/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請說明 partition key、partition pruning、索引、資料保留和分區 DDL 的取捨。

<details>
<summary>💡 答案提示</summary>

- 依時間／租戶／範圍查詢選 key，確認 planner 實際有 pruning。
- 評估分區數量、唯一鍵、外鍵、lock、detach／archive 和未來分區預建。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/PostgreSQL/table_partitioning.md)

---

### Q26: PostgreSQL VACUUM與ANALYZE如何取捨
<!-- Concept ID: `concept.database.postgresql.vacuum-analyze`; Learning Objective IDs: `concept.database.postgresql.vacuum-analyze/LO-1`, `concept.database.postgresql.vacuum-analyze/LO-2`, `concept.database.postgresql.vacuum-analyze/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🟡 重要

請比較 VACUUM、VACUUM FULL、ANALYZE 與 autovacuum 的使用時機。

<details>
<summary>💡 答案提示</summary>

- 用 dead tuple、bloat、統計新鮮度、lock 與 maintenance window 做判斷。
- 說明何時應先處理長交易、調整 autovacuum 或採用線上重整。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/PostgreSQL/vacuum_deep_dive.md)

---

### Q27: PostgreSQL WAL如何支援復原與複製
<!-- Concept ID: `concept.database.postgresql.wal`; Learning Objective IDs: `concept.database.postgresql.wal/LO-1`, `concept.database.postgresql.wal/LO-2`, `concept.database.postgresql.wal/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請解釋 WAL 在 durability、crash recovery、replication、archive 與 PITR 中的作用。

<details>
<summary>💡 答案提示</summary>

- 用 LSN、checkpoint、archive failure、replication slot 和 restore drill 建立證據鏈。
- 以 RPO、儲存成本、恢復時間和 replica lag 做取捨。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/PostgreSQL/wal_write_ahead_log.md)

---

### Q28: PostgreSQL CTE與遞迴查詢如何控制成本
<!-- Concept ID: `concept.database.postgresql.cte-recursion`; Learning Objective IDs: `concept.database.postgresql.cte-recursion/LO-1`, `concept.database.postgresql.cte-recursion/LO-2`, `concept.database.postgresql.cte-recursion/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請說明 CTE、recursive CTE 的執行流程、物化／內聯、終止條件與成本控制。

<details>
<summary>💡 答案提示</summary>

- 用 anchor、recursive member、cycle guard、深度上限和資料量控制風險。
- 以 EXPLAIN、sort／work memory、索引和 timeout 驗證。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/PostgreSQL/cte_and_recursive_cte.md)

---

### Q29: PostgreSQL特殊資料類型如何影響索引
<!-- Concept ID: `concept.database.postgresql.data-types`; Learning Objective IDs: `concept.database.postgresql.data-types/LO-1`, `concept.database.postgresql.data-types/LO-2`, `concept.database.postgresql.data-types/LO-3` -->

**難度**: ⭐⭐⭐ (3) | **重要性**: 🟡 重要

請比較 JSONB、ARRAY、range、enum、timestamp 等類型的查詢、約束、索引和演進取捨。

<details>
<summary>💡 答案提示</summary>

- 先由查詢與資料約束選型，再確認 operator class 和 migration 策略。
- 評估 planner 統計、儲存大小、寫入更新與索引維護成本。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/PostgreSQL/special_data_types.md)

---

### Q30: PostgreSQL與MySQL如何依需求選型
<!-- Concept ID: `concept.database.postgresql.engine-comparison`; Learning Objective IDs: `concept.database.postgresql.engine-comparison/LO-1`, `concept.database.postgresql.engine-comparison/LO-2`, `concept.database.postgresql.engine-comparison/LO-3` -->

**難度**: ⭐⭐⭐ (3) | **重要性**: 🟡 重要

請依資料模型、查詢、交易、擴展性、團隊能力與維運條件比較 PostgreSQL 與 MySQL。

<details>
<summary>💡 答案提示</summary>

- 不要只列功能；要連結 workload、RPO/RTO、複製、備份、索引和 migration。
- 指出選型後的 lock、pool、監控、故障演練與人才成本。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/PostgreSQL/postgresql_vs_mysql.md)

---

### Q31: MongoDB聚合管線如何控制查詢成本
<!-- Concept ID: `concept.database.mongodb.aggregation`; Learning Objective IDs: `concept.database.mongodb.aggregation/LO-1`, `concept.database.mongodb.aggregation/LO-2`, `concept.database.mongodb.aggregation/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 MongoDB aggregation stages、索引、pipeline order、memory spill 與報表取捨。

<details>
<summary>💡 答案提示</summary>

- 盡早 match／project，確認 explain、docs examined、索引和 lookup 成本。
- 判斷線上聚合、預計算、離線報表和限時失敗的邊界。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/NoSQL/MongoDB/mongodb_aggregation_framework.md)

---

### Q32: MongoDB資料建模如何取捨嵌入與引用
<!-- Concept ID: `concept.database.mongodb.data-modeling`; Learning Objective IDs: `concept.database.mongodb.data-modeling/LO-1`, `concept.database.mongodb.data-modeling/LO-2`, `concept.database.mongodb.data-modeling/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請依讀寫模式、資料增長、原子性與查詢數量比較 embedding 和 referencing。

<details>
<summary>💡 答案提示</summary>

- 評估文件大小、fan-out、更新頻率、獨立存取與索引。
- 若需要跨文件一致性，說明 transaction、冪等和資料遷移成本。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/NoSQL/MongoDB/mongodb_data_modeling.md)

---

### Q33: MongoDB索引如何影響查詢計畫
<!-- Concept ID: `concept.database.mongodb.indexing`; Learning Objective IDs: `concept.database.mongodb.indexing/LO-1`, `concept.database.mongodb.indexing/LO-2`, `concept.database.mongodb.indexing/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請比較 MongoDB 單欄、複合、多鍵、TTL、text、地理和 unique index。

<details>
<summary>💡 答案提示</summary>

- 用 equality、sort、range 和 ESR 判斷複合欄位順序。
- 以 winning plan、keys examined、docs examined、寫入成本和 index footprint 驗證。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/NoSQL/MongoDB/mongodb_indexing.md)

---

### Q34: MongoDB Replica Set如何設計RPO與故障轉移
<!-- Concept ID: `concept.database.mongodb.replication`; Learning Objective IDs: `concept.database.mongodb.replication/LO-1`, `concept.database.mongodb.replication/LO-2`, `concept.database.mongodb.replication/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 replica set、oplog、election、read concern 與 write concern 的關係。

<details>
<summary>💡 答案提示</summary>

- 觀察 majority acknowledgement、replication lag、oplog window 和 failover time。
- 把 write concern、backup、restore、read-after-write 和 RPO/RTO 一起設計。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/NoSQL/MongoDB/mongodb_replication.md)

---

### Q35: MongoDB分片鍵如何影響熱點與查詢
<!-- Concept ID: `concept.database.mongodb.sharding`; Learning Objective IDs: `concept.database.mongodb.sharding/LO-1`, `concept.database.mongodb.sharding/LO-2`, `concept.database.mongodb.sharding/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🟡 重要

請設計 shard key，並說明基數、單調性、查詢路由、hot chunk、balancer 與 resharding。

<details>
<summary>💡 答案提示</summary>

- 以主要查詢和寫入分布驗證 targeted query、scatter-gather 和 chunk 平衡。
- 評估擴容、故障轉移、資料遷移、jumbo chunk 和 rollback。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/NoSQL/MongoDB/mongodb_sharding.md)

---

### Q36: MongoDB多文件交易如何控制一致性與成本
<!-- Concept ID: `concept.database.mongodb.transactions`; Learning Objective IDs: `concept.database.mongodb.transactions/LO-1`, `concept.database.mongodb.transactions/LO-2`, `concept.database.mongodb.transactions/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請比較單文件原子性與多文件 transaction，並說明 retry、read/write concern 與跨 shard 成本。

<details>
<summary>💡 答案提示</summary>

- 釐清 transient error、commit retry、transaction lifetime、鎖／衝突和冪等。
- 先考慮資料模型是否能把一致性邊界放回單一文件。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/NoSQL/MongoDB/mongodb_transactions.md)

---

### Q37: MongoDB與SQL如何依需求選型
<!-- Concept ID: `concept.database.mongodb.sql-comparison`; Learning Objective IDs: `concept.database.mongodb.sql-comparison/LO-1`, `concept.database.mongodb.sql-comparison/LO-2`, `concept.database.mongodb.sql-comparison/LO-3` -->

**難度**: ⭐⭐⭐⭐ (4) | **重要性**: 🔴 必考

請依 schema、join、交易、查詢、資料演進和水平擴展比較 MongoDB 與 SQL。

<details>
<summary>💡 答案提示</summary>

- 將選型連到 source of truth、索引、backup、replication、sharding 和團隊運維能力。
- 明確說明哪些一致性要求不能只靠應用習慣保證。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/NoSQL/MongoDB/mongodb_vs_sql.md)

---

### Q38: MongoDB WiredTiger如何影響持久性與容量
<!-- Concept ID: `concept.database.mongodb.wiredtiger`; Learning Objective IDs: `concept.database.mongodb.wiredtiger/LO-1`, `concept.database.mongodb.wiredtiger/LO-2`, `concept.database.mongodb.wiredtiger/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請說明 WiredTiger cache、journal、checkpoint、eviction、MVCC 和文件大小的取捨。

<details>
<summary>💡 答案提示</summary>

- 觀察 cache pressure、dirty bytes、eviction、I/O、journal 和 index footprint。
- 連結 read concern、durability、資料恢復和記憶體容量。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/NoSQL/MongoDB/mongodb_wiredtiger.md)

---

### Q39: Redis RDB與AOF如何取捨RPO與效能
<!-- Concept ID: `concept.database.redis.persistence`; Learning Objective IDs: `concept.database.redis.persistence/LO-1`, `concept.database.redis.persistence/LO-2`, `concept.database.redis.persistence/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請比較 Redis RDB 與 AOF 的資料遺失窗口、恢復時間、磁碟和延遲成本。

<details>
<summary>💡 答案提示</summary>

- 以 snapshot、fsync policy、rewrite、fork、檔案大小與 restore time 估算 RPO/RTO。
- 先分清 cache、session、queue、Stream 和 source-of-truth 的可靠性需求。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/NoSQL/Redis/redis_persistence_rdb_vs_aof.md)

---

### Q40: Redis Sentinel與Cluster如何選擇
<!-- Concept ID: `concept.database.redis.sentinel-cluster`; Learning Objective IDs: `concept.database.redis.sentinel-cluster/LO-1`, `concept.database.redis.sentinel-cluster/LO-2`, `concept.database.redis.sentinel-cluster/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9) | **重要性**: 🔴 必考

請比較 Sentinel 的 HA 與 Cluster 的分片／容量模型，並提出 client routing 和 failover 設計。

<details>
<summary>💡 答案提示</summary>

- 觀察 quorum、failover time、slot、replica、重平衡和 hot key。
- 以資料量、寫入分布、RPO、client 能力和運維複雜度選擇。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/NoSQL/Redis/redis_sentinel_vs_cluster.md)

---

### Q41: Redis分散式鎖如何避免誤釋放
<!-- Concept ID: `concept.database.redis.distributed-lock`; Learning Objective IDs: `concept.database.redis.distributed-lock/LO-1`, `concept.database.redis.distributed-lock/LO-2`, `concept.database.redis.distributed-lock/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9) | **重要性**: 🔴 必考

請設計含 owner token、TTL、續租、原子釋放和 fencing 的 Redis lock。

<details>
<summary>💡 答案提示</summary>

- 分析 crash、GC pause、clock skew、網路分割和 stale owner。
- 說明何時 Redis lock 不足，應改用資料庫 constraint 或共識服務。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/NoSQL/Redis/design_redis_distributed_lock.md)

---

### Q42: Redis熱點Key與大Key如何止血
<!-- Concept ID: `concept.database.redis.hotkey-bigkey`; Learning Objective IDs: `concept.database.redis.hotkey-bigkey/LO-1`, `concept.database.redis.hotkey-bigkey/LO-2`, `concept.database.redis.hotkey-bigkey/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請區分 hot key 與 big key 的症狀、量測方式和拆分／遷移策略。

<details>
<summary>💡 答案提示</summary>

- 用 command latency、MEMORY USAGE、sampling、blocked clients 和記憶體指標定位。
- 評估 key sharding、local cache、拆集合、SCAN、限速和漸進遷移。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/NoSQL/Redis/redis_hotkey_bigkey.md)

---

### Q43: Redis淘汰策略如何對應資料風險
<!-- Concept ID: `concept.database.redis.eviction`; Learning Objective IDs: `concept.database.redis.eviction/LO-1`, `concept.database.redis.eviction/LO-2`, `concept.database.redis.eviction/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🟡 重要

請比較 noeviction、allkeys、volatile 與 LRU/LFU/random policy 的資料語意。

<details>
<summary>💡 答案提示</summary>

- 依 cache、session、queue、lock 和 durable data 分配不同風險。
- 用 hit rate、eviction、rejected writes、fragmentation 和 memory headroom 驗證。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/NoSQL/Redis/redis_memory_eviction_policies.md)

---

### Q44: Redis Pipeline與Lua何時使用
<!-- Concept ID: `concept.database.redis.pipeline-lua`; Learning Objective IDs: `concept.database.redis.pipeline-lua/LO-1`, `concept.database.redis.pipeline-lua/LO-2`, `concept.database.redis.pipeline-lua/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請比較 pipeline、transaction、WATCH 與 Lua script 的 RTT、原子性、錯誤和阻塞成本。

<details>
<summary>💡 答案提示</summary>

- Pipeline 主要減少 RTT；需要條件讀改寫時才考慮 transaction 或 Lua。
- 量測批次大小、script duration、command latency、CPU 和尾延遲。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/NoSQL/Redis/redis_pipeline.md)

---

### Q45: Redis單執行緒為何仍會出現尾延遲
<!-- Concept ID: `concept.database.redis.single-thread`; Learning Objective IDs: `concept.database.redis.single-thread/LO-1`, `concept.database.redis.single-thread/LO-2`, `concept.database.redis.single-thread/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請說明 event loop、I/O multiplexing、O(N) command、Lua 和 big key 如何影響 Redis latency。

<details>
<summary>💡 答案提示</summary>

- 用 slow command、blocked clients、CPU、network 和 command latency 找根因。
- 說明背景 I/O thread 不等於所有命令都可平行執行。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/NoSQL/Redis/redis_single_thread_model.md)

---

### Q46: Redis Stream如何處理pending與容量
<!-- Concept ID: `concept.database.redis.stream`; Learning Objective IDs: `concept.database.redis.stream/LO-1`, `concept.database.redis.stream/LO-2`, `concept.database.redis.stream/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請說明 consumer group、PEL、ack、reclaim、重試、冪等和 Stream trim。

<details>
<summary>💡 答案提示</summary>

- 用 consumer lag、pending 數、idle time、backlog、memory 和保留政策做容量管理。
- 處理 consumer crash、毒性訊息、重複投遞和 graceful shutdown。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/NoSQL/Redis/redis_stream.md)

---

### Q47: Redis資料結構如何對應使用情境
<!-- Concept ID: `concept.database.redis.data-structures`; Learning Objective IDs: `concept.database.redis.data-structures/LO-1`, `concept.database.redis.data-structures/LO-2`, `concept.database.redis.data-structures/LO-3` -->

**難度**: ⭐⭐ (2) | **重要性**: 🟡 重要

請依存取模式比較 string、hash、list、set、sorted set 和 stream。

<details>
<summary>💡 答案提示</summary>

- 說明主要操作的時間複雜度、原子性、記憶體形狀和適用 workload。
- 把資料結構選擇連到 hot key、big key、eviction、persistence 和容量。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/NoSQL/Redis/what_is_redis_and_its_data_structures.md)

---

### Q48: 資料庫備份與還原如何證明RPO與RTO
<!-- Concept ID: `concept.database.backup-restore.rpo-rto`; Learning Objective IDs: `concept.database.backup-restore.rpo-rto/LO-1`, `concept.database.backup-restore.rpo-rto/LO-2`, `concept.database.backup-restore.rpo-rto/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請比較 full、incremental、snapshot、WAL/binlog 與 PITR，並設計 restore drill。

<details>
<summary>💡 答案提示</summary>

- 以 RPO、RTO、checksum、資料筆數、備份 freshness 和跨區域保存驗證。
- 不能只確認備份檔案存在；要演練故障、還原、replay、切換和 rollback。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/database_backup_and_restore.md)

---

### Q49: 資料庫連線池如何做容量取捨
<!-- Concept ID: `concept.database.connection-pool.capacity`; Learning Objective IDs: `concept.database.connection-pool.capacity/LO-1`, `concept.database.connection-pool.capacity/LO-2`, `concept.database.connection-pool.capacity/LO-3` -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請說明 connection pool 生命週期、pool exhaustion、leak，以及如何按 pod／worker／DB budget 設定上限。

<details>
<summary>💡 答案提示</summary>

- 量測 max、in-use、idle、wait、timeout、query／transaction 持有時間和 DB max connections。
- 將所有 pod、worker、migration、replica client 和管理連線加總，保留安全餘量後再壓測。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/database_connection_pool.md)

---

### Q50: MongoDB Change Streams 如何處理斷線、重複與 oplog window？
<!-- Concept ID: concept.mongodb.change-streams.resume-ordering; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請說明 resume token 的持久化時機、consumer 冪等性與 oplog 保留不足時的回復方案。

<details>
<summary>💡 答案提示</summary>

- 收到並完成可重放的 side effect 後保存 checkpoint；重啟可能 replay，因此 downstream 必須用 event identity／version 去重。
- 觀察 stream lag、resume error、oplog window、processing latency、duplicate rate 與 dead-letter；window 不足時要做全量重建或明確 reconciliation。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/NoSQL/MongoDB/mongodb_change_streams.md)

### Q51: Redis MULTI／EXEC 與 WATCH 是否等同 ACID transaction？
<!-- Concept ID: concept.redis.transactions.watch-atomicity; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請比較 Redis transaction、optimistic retry、Lua 與關聯式資料庫 transaction 的責任邊界。

<details>
<summary>💡 答案提示</summary>

- MULTI／EXEC 提供命令序列原子執行但不是任意失敗回滾；WATCH conflict 需要 bounded retry，外部 side effect 仍需冪等。
- 把 durability、replication、failover 與 cross-system atomicity 分開說明，不可只因 EXEC 成功就宣稱業務交易完成。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/NoSQL/Redis/redis_transactions_and_acid.md)

### Q52: Redis 與 Memcached 如何依需求選型？
<!-- Concept ID: concept.cache.redis-memcached.selection; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🟡 重要

請以 session、hot cache 與可重建資料三種場景比較資料模型、持久性、故障與成本。

<details>
<summary>💡 答案提示</summary>

- 先定義 cache 是否可遺失、是否需要複合資料結構、TTL／eviction、replication、failover 與 memory budget。
- 以 hit rate、miss amplification、rebuild latency、node failure、network latency 與成本驗證選擇，不以 benchmark 單一數字決定。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/NoSQL/Redis/redis_vs_memcached.md)

### Q53: CHAR 與 VARCHAR 的選擇會影響哪些資料庫邊界？
<!-- Concept ID: concept.database.sql.char-varchar.storage; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐ (4) | **重要性**: 🟡 重要

請以固定長度代碼、使用者名稱與可變文字欄位說明 padding、字元集、索引與 migration 取捨。

<details>
<summary>💡 答案提示</summary>

- 說清楚資料分布、比較語意、row size、索引寬度、更新與 charset，而不是只背「固定用 CHAR」。
- migration 需先檢查現有資料、截斷風險、讀寫相容、回滾與 production query plan。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/MySQL/varchar_vs_char.md)

### Q54: PostgreSQL schema 如何形成 namespace 與權限邊界？
<!-- Concept ID: concept.postgresql.schema.namespace-security; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🟡 重要

請說明 search_path、ownership、role、migration 與多租戶 schema 的風險與驗證方式。

<details>
<summary>💡 答案提示</summary>

- 不要把 schema 當成天然的租戶隔離；需要驗證 grants、default privileges、qualified names、connection role 與 migration ownership。
- 測試錯誤 search_path、權限提升、跨 schema query、rollback 與 connection pool reuse。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/SQL/PostgreSQL/what_is_schema.md)

### Q55: NewSQL 的分散式 SQL 取捨是什麼？
<!-- Concept ID: concept.database.newsql.distributed-sql; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請以跨區交易、故障時可用性與水平擴展比較 NewSQL、傳統 RDBMS 與 NoSQL。

<details>
<summary>💡 答案提示</summary>

- 連結 consensus、quorum、partition、cross-region latency、transaction conflict、rebalance 與 cost；不能只說「NewSQL 可水平擴展」。
- 用 workload、SLO、failure injection、p99、throughput、storage／compute cost 與 recovery evidence 驗證選型。

</details>

📖 [查看完整答案](../02_Backend_Development/Databases/newsql_databases.md)

## 📊 學習進度檢核

完成以上題目後，請自我評估：

| 評估項目 | 自評 |
|----------|------|
| 能比較 SQL vs NoSQL 並選型 | ⬜ |
| 理解索引原理和 B+ Tree | ⬜ |
| 能解釋 ACID 和隔離級別 | ⬜ |
| 理解分片策略和挑戰 | ⬜ |
| 能設計高可用資料庫架構 | ⬜ |
| 掌握資料庫效能調優方法 | ⬜ |
| 理解讀寫分離和延遲處理 | ⬜ |
| 了解正規化與反正規化 | ⬜ |
| 知道資料庫遷移策略 | ⬜ |

**建議**：未能完整回答的題目，請回到對應的詳細文章深入學習。
