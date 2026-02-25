# PostgreSQL 表格分區 (Table Partitioning) 深度解析

- **難度**: 7
- **重要程度**: 4
- **標籤**: `PostgreSQL`, `Partitioning`, `性能調優`, `大資料量`, `Partition Pruning`

## 問題詳述

當單一資料表的資料量達到數億行以上時，全表掃描和索引維護的成本急劇上升。PostgreSQL 的**聲明式表格分區（Declarative Table Partitioning）**允許將一個大表邏輯分割為多個子表（Partition），查詢時透過**分區裁剪（Partition Pruning）**只訪問相關子表，大幅提升查詢效能。

## 核心理論與詳解

### 分區的核心收益

- **查詢效能**：WHERE 條件包含分區鍵時，Planner 自動跳過無關分區（Partition Pruning），避免全表掃描
- **維護效率**：歸檔、刪除舊分區使用 `DROP TABLE partition_name` 替代 `DELETE`，是 O(1) 元資料操作而非逐行刪除
- **並行處理**：不同分區可分配到不同磁碟/表空間（Tablespace），提高 I/O 並行度
- **索引大小**：每個分區的索引更小，B-Tree 高度更低，查找更快

---

### 三種分區策略

#### 1. 範圍分區（RANGE Partitioning）

最常見，適合**時序資料**（訂單、日誌、事件）。

```sql
CREATE TABLE orders (
    id          BIGSERIAL,
    created_at  TIMESTAMPTZ NOT NULL,
    user_id     BIGINT,
    amount      NUMERIC(12,2)
) PARTITION BY RANGE (created_at);

-- 按年建立子分區
CREATE TABLE orders_2023 PARTITION OF orders
    FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

CREATE TABLE orders_2024 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- 查詢自動觸發 Partition Pruning
EXPLAIN SELECT * FROM orders WHERE created_at >= '2024-06-01';
-- Planner 只掃描 orders_2024，跳過其他分區
```

#### 2. 列表分區（LIST Partitioning）

適合**離散枚舉值**，如地區、狀態碼。

```sql
CREATE TABLE users (
    id      BIGSERIAL,
    region  TEXT NOT NULL,
    name    TEXT
) PARTITION BY LIST (region);

CREATE TABLE users_tw PARTITION OF users FOR VALUES IN ('TW', 'HK');
CREATE TABLE users_us PARTITION OF users FOR VALUES IN ('US', 'CA');
CREATE TABLE users_eu PARTITION OF users FOR VALUES IN ('DE', 'FR', 'GB');
```

#### 3. 雜湊分區（HASH Partitioning）

適合**均勻分散資料**，無明顯範圍或列表規則時使用。

```sql
CREATE TABLE events (
    id       BIGSERIAL,
    user_id  BIGINT NOT NULL,
    payload  JSONB
) PARTITION BY HASH (user_id);

CREATE TABLE events_p0 PARTITION OF events FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE events_p1 PARTITION OF events FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE events_p2 PARTITION OF events FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE events_p3 PARTITION OF events FOR VALUES WITH (MODULUS 4, REMAINDER 3);
```

---

### 分區裁剪（Partition Pruning）

分區裁剪是分區效能收益的核心機制：在執行計劃階段，Planner 根據 WHERE 條件過濾掉不相關的分區。

**使用 EXPLAIN 驗證裁剪效果**：
```sql
EXPLAIN (ANALYZE, COSTS ON) 
SELECT * FROM orders WHERE created_at = '2024-07-15';
-- 應看到只 Seq Scan orders_2024，而非全部分區
```

**裁剪失效的情況**：
- WHERE 條件使用了函數包裹分區鍵：`WHERE DATE_TRUNC('year', created_at) = '2024-01-01'`（PostgreSQL 無法靜態裁剪）
- 分區鍵進行了類型轉換（隱式）

---

### 子分區（Sub-partitioning）

可多級分區：先按年 RANGE，再按地區 LIST：

```sql
CREATE TABLE orders_2024 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01')
    PARTITION BY LIST (region);

CREATE TABLE orders_2024_tw PARTITION OF orders_2024 FOR VALUES IN ('TW');
```

---

### 分區實踐建議

| 場景 | 推薦策略 | 分區粒度建議 |
|------|---------|------------|
| 時序訂單/日誌 | RANGE by 時間 | 月分區（資料量 < 1億/月）或週分區 |
| 多租戶系統 | LIST by tenant_id | 大租戶獨立分區，小租戶共用分區 |
| 廣泛 user_id 查詢 | HASH by user_id | 分區數 = 4 或 8 的倍數 |

**注意事項**：
- **Global Index 不存在**：分區表的唯一索引必須包含分區鍵
- **外鍵限制**：PostgreSQL 16 之前，分區表不能作為外鍵的目標（子表可以）
- **分區數量**：過多分區（> 1000）會增加 Planner 的計劃時間，通常 100-500 個分區是合理範圍
- **預建未來分區**：建議提前建立未來幾個月的分區，避免在高峰期 DDL
