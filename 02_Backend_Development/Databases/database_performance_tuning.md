# 資料庫效能調優全攻略

- **難度**: 8
- **重要程度**: 5
- **標籤**: `資料庫`, `效能優化`, `調優`, `索引`, `查詢優化`

## 問題詳述

資料庫效能是後端系統的核心瓶頸之一。隨著數據量增長和併發請求增加，資料庫效能問題會嚴重影響系統可用性。理解資料庫效能調優的方法和最佳實踐，是資深後端工程師的必備技能。

## 核心理論與詳解

### 效能問題的常見症狀

```
1. 查詢緩慢
   - 單一查詢執行時間過長（> 1秒）
   - 簡單查詢也很慢

2. 高 CPU 使用率
   - 資料庫伺服器 CPU 持續 > 80%
   - 大量複雜計算

3. 記憶體不足
   - 頻繁的記憶體交換（Swap）
   - OOM（Out of Memory）錯誤

4. I/O 瓶頸
   - 磁碟 I/O 飽和
   - 慢查詢日誌中大量慢查詢

5. 鎖競爭
   - 大量事務等待
   - 死鎖頻繁發生

6. 連接池耗盡
   - Too many connections 錯誤
   - 應用程式連接等待
```

---

### 效能調優的層次

```
層次 1：應用層優化
├─ 減少不必要的查詢
├─ 使用快取（Redis、Memcached）
├─ 批次操作
└─ 非同步處理

層次 2：SQL 查詢優化
├─ 優化 SQL 語句
├─ 使用正確的索引
├─ 避免 N+1 查詢
└─ 使用 JOIN 而非多次查詢

層次 3：資料庫設計優化
├─ 表結構設計
├─ 索引設計
├─ 分區分表
└─ 反正規化

層次 4：資料庫配置優化
├─ 記憶體配置
├─ 連接池設置
├─ 快取配置
└─ I/O 調優

層次 5：硬體和架構優化
├─ 讀寫分離
├─ 分片（Sharding）
├─ 升級硬體
└─ 使用 SSD
```

---

### 1. 索引優化

#### 索引的基本原理

```
B+ Tree 索引結構（MySQL InnoDB）：

                [50]
               /    \
            [25]    [75]
           /   \    /   \
        [10] [40][60] [90]
         |    |   |    |
       Data Data Data Data

特性：
- 葉子節點包含實際資料（或指向資料的指針）
- 葉子節點形成有序鏈表
- 查找、插入、刪除時間複雜度：O(log n)
```

#### 何時需要索引

```sql
✅ 應該建立索引的情況：

1. WHERE 子句中頻繁使用的欄位
SELECT * FROM users WHERE email = 'user@example.com';
-- 在 email 欄位建立索引

2. JOIN 條件中的欄位
SELECT * FROM orders o 
JOIN users u ON o.user_id = u.id;
-- 在 orders.user_id 和 users.id 建立索引

3. ORDER BY 和 GROUP BY 的欄位
SELECT * FROM products ORDER BY created_at DESC;
-- 在 created_at 建立索引

4. 外鍵欄位
-- 加速 JOIN 和參照完整性檢查

5. 唯一性約束的欄位
-- 如 email、username
```

#### 索引的類型

```sql
1. 單欄索引（Single Column Index）
CREATE INDEX idx_email ON users(email);

2. 複合索引（Composite Index）
CREATE INDEX idx_user_status_created 
ON orders(user_id, status, created_at);

-- 遵循最左前綴原則：
✅ WHERE user_id = 1  (使用索引)
✅ WHERE user_id = 1 AND status = 'pending'  (使用索引)
✅ WHERE user_id = 1 AND status = 'pending' AND created_at > '2024-01-01'  (完全使用)
❌ WHERE status = 'pending'  (不使用索引)
❌ WHERE created_at > '2024-01-01'  (不使用索引)

3. 唯一索引（Unique Index）
CREATE UNIQUE INDEX idx_username ON users(username);

4. 全文索引（Full-Text Index）
CREATE FULLTEXT INDEX idx_content ON articles(content);

5. 覆蓋索引（Covering Index）
CREATE INDEX idx_user_email_name ON users(id, email, name);
-- 查詢只需要這三個欄位時，無需回表
```

#### 索引優化技巧

```sql
1. 使用覆蓋索引避免回表
-- 壞的做法
SELECT * FROM users WHERE email = 'user@example.com';
-- 需要通過索引找到 id，再回表查詢所有欄位

-- 好的做法
SELECT id, email, name FROM users WHERE email = 'user@example.com';
CREATE INDEX idx_email_id_name ON users(email, id, name);
-- 索引包含所有需要的欄位，無需回表

2. 避免索引失效
❌ 在索引欄位上使用函數
SELECT * FROM users WHERE UPPER(email) = 'USER@EXAMPLE.COM';

✅ 使用函數索引或不使用函數
SELECT * FROM users WHERE email = 'user@example.com';

❌ 使用 OR 連接不同欄位
SELECT * FROM users WHERE email = 'a@b.com' OR name = 'John';

✅ 使用 UNION
SELECT * FROM users WHERE email = 'a@b.com'
UNION
SELECT * FROM users WHERE name = 'John';

❌ 前導模糊查詢
SELECT * FROM users WHERE name LIKE '%John%';
-- 無法使用索引

✅ 後導模糊查詢
SELECT * FROM users WHERE name LIKE 'John%';
-- 可以使用索引

3. 選擇合適的欄位順序（複合索引）
-- 選擇性高的欄位放前面
CREATE INDEX idx_status_user ON orders(user_id, status);
-- 如果 user_id 有 10000 種值，status 只有 5 種值
-- user_id 選擇性更高，應該放前面

計算選擇性：
SELECT COUNT(DISTINCT column_name) / COUNT(*) FROM table_name;
-- 值越接近 1，選擇性越高

4. 刪除冗餘和未使用的索引
-- 查找未使用的索引（MySQL）
SELECT * FROM sys.schema_unused_indexes;

-- 刪除冗餘索引
-- 如果有 idx_abc(a, b, c)，則 idx_a(a) 是冗餘的
```

---

### 2. SQL 查詢優化

#### 使用 EXPLAIN 分析查詢

```sql
EXPLAIN SELECT * FROM users WHERE email = 'user@example.com';

輸出解讀：
+----+-------------+-------+------+---------------+------+---------+------+------+-------------+
| id | select_type | table | type | possible_keys | key  | key_len | ref  | rows | Extra       |
+----+-------------+-------+------+---------------+------+---------+------+------+-------------+

重要欄位：
- type: 連接類型（越靠前越好）
  * system: 表只有一行
  * const: 主鍵或唯一索引查詢
  * eq_ref: 唯一索引查詢
  * ref: 非唯一索引查詢
  * range: 範圍查詢
  * index: 全索引掃描
  * ALL: 全表掃描 ❌ (最慢)

- possible_keys: 可能使用的索引
- key: 實際使用的索引
- rows: 估計掃描的行數（越少越好）
- Extra:
  * Using index: 使用覆蓋索引 ✅
  * Using where: 使用 WHERE 過濾
  * Using filesort: 需要額外排序 ❌
  * Using temporary: 需要臨時表 ❌
```

#### 常見查詢優化技巧

```sql
1. 避免 SELECT *
❌ SELECT * FROM users WHERE id = 1;
✅ SELECT id, name, email FROM users WHERE id = 1;

優勢：
- 減少資料傳輸量
- 可以使用覆蓋索引
- 降低記憶體使用

2. 避免 N+1 查詢問題
❌ 壞的做法（N+1 查詢）
-- 先查詢所有訂單
SELECT * FROM orders LIMIT 10;
-- 然後對每個訂單查詢用戶（10 次查詢）
SELECT * FROM users WHERE id = ?;

✅ 好的做法（使用 JOIN）
SELECT o.*, u.name, u.email
FROM orders o
JOIN users u ON o.user_id = u.id
LIMIT 10;
-- 只有 1 次查詢

3. 使用 LIMIT 限制結果集
❌ SELECT * FROM logs WHERE created_at > '2024-01-01';
-- 可能返回數百萬行

✅ SELECT * FROM logs 
WHERE created_at > '2024-01-01' 
LIMIT 1000;

4. 優化子查詢
❌ 使用 IN 子查詢（慢）
SELECT * FROM users 
WHERE id IN (
  SELECT user_id FROM orders WHERE status = 'completed'
);

✅ 使用 JOIN（快）
SELECT DISTINCT u.* 
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.status = 'completed';

5. 使用 EXISTS 代替 COUNT
❌ 檢查是否存在記錄
SELECT COUNT(*) FROM orders WHERE user_id = 1;
if (count > 0) { ... }

✅ 使用 EXISTS
SELECT EXISTS(SELECT 1 FROM orders WHERE user_id = 1);
-- 找到第一筆就返回，更快

6. 批次操作
❌ 單條插入（慢）
INSERT INTO users (name, email) VALUES ('A', 'a@b.com');
INSERT INTO users (name, email) VALUES ('B', 'b@c.com');
-- 執行 1000 次

✅ 批次插入（快）
INSERT INTO users (name, email) VALUES 
  ('A', 'a@b.com'),
  ('B', 'b@c.com'),
  ...  -- 1000 條
;

7. 使用分頁優化
❌ 深度分頁（慢）
SELECT * FROM users 
ORDER BY created_at 
LIMIT 1000000, 10;
-- 需要掃描前 1000010 行

✅ 使用游標分頁
SELECT * FROM users 
WHERE id > last_seen_id 
ORDER BY id 
LIMIT 10;
```

---

### 3. 快取策略

#### 多層快取架構

```
┌─────────────────────────────────────┐
│     Application Cache               │
│  (In-memory, local to each server)  │
└──────────────┬──────────────────────┘
               │ Miss
               ▼
┌─────────────────────────────────────┐
│     Distributed Cache (Redis)       │
│  (Shared across all servers)        │
└──────────────┬──────────────────────┘
               │ Miss
               ▼
┌─────────────────────────────────────┐
│     Query Cache (MySQL)             │
│  (Database level cache)             │
└──────────────┬──────────────────────┘
               │ Miss
               ▼
┌─────────────────────────────────────┐
│     Database (Disk)                 │
└─────────────────────────────────────┘
```

#### 快取策略

```
1. Cache-Aside（旁路快取）
讀取流程：
1. 應用查詢快取
2. 快取命中：返回資料
3. 快取未命中：查詢資料庫
4. 將結果寫入快取
5. 返回資料

寫入流程：
1. 更新資料庫
2. 刪除快取（或更新快取）

2. Read-Through
- 快取層自動從資料庫加載資料
- 應用只與快取層互動

3. Write-Through
- 寫入時同時更新快取和資料庫
- 保證一致性但增加延遲

4. Write-Behind
- 先寫入快取
- 非同步批次寫入資料庫
- 高效能但可能丟失資料
```

#### 快取最佳實踐

```go
// 範例：使用 Redis 快取用戶資料

func GetUser(id int) (*User, error) {
    cacheKey := fmt.Sprintf("user:%d", id)
    
    // 1. 嘗試從快取獲取
    cached, err := redis.Get(cacheKey)
    if err == nil {
        var user User
        json.Unmarshal(cached, &user)
        return &user, nil
    }
    
    // 2. 快取未命中，查詢資料庫
    user, err := db.QueryUser(id)
    if err != nil {
        return nil, err
    }
    
    // 3. 寫入快取（設置過期時間）
    data, _ := json.Marshal(user)
    redis.Set(cacheKey, data, 1*time.Hour)
    
    return user, nil
}

// 更新用戶時刪除快取
func UpdateUser(user *User) error {
    // 1. 更新資料庫
    err := db.UpdateUser(user)
    if err != nil {
        return err
    }
    
    // 2. 刪除快取（確保下次讀取到最新資料）
    cacheKey := fmt.Sprintf("user:%d", user.ID)
    redis.Del(cacheKey)
    
    return nil
}
```

---

### 4. 資料庫配置優化

#### MySQL/InnoDB 配置

```ini
[mysqld]
# === 記憶體配置 ===
# InnoDB 緩衝池（最重要的配置）
# 建議：物理記憶體的 60-80%
innodb_buffer_pool_size = 8G

# 緩衝池實例數（大於 1G 時建議設置）
innodb_buffer_pool_instances = 8

# 查詢快取（MySQL 8.0 已移除）
# query_cache_size = 256M
# query_cache_type = 1

# === 連接配置 ===
max_connections = 500
max_connect_errors = 100000

# === InnoDB 配置 ===
# 日誌檔案大小
innodb_log_file_size = 512M

# 日誌緩衝區
innodb_log_buffer_size = 16M

# 刷盤策略（1 = 最安全但最慢，2 = 平衡）
innodb_flush_log_at_trx_commit = 2

# I/O 容量（SSD 可設置更高）
innodb_io_capacity = 2000
innodb_io_capacity_max = 4000

# === 臨時表配置 ===
tmp_table_size = 256M
max_heap_table_size = 256M

# === 慢查詢日誌 ===
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 1  # 超過 1 秒的查詢記錄
```

#### PostgreSQL 配置

```ini
# === 記憶體配置 ===
shared_buffers = 2GB  # 物理記憶體的 25%
effective_cache_size = 6GB  # 物理記憶體的 50-75%
work_mem = 50MB  # 每個操作的記憶體
maintenance_work_mem = 512MB

# === WAL 配置 ===
wal_buffers = 16MB
checkpoint_completion_target = 0.9
max_wal_size = 4GB

# === 查詢規劃 ===
random_page_cost = 1.1  # SSD 設置為 1.1
effective_io_concurrency = 200  # SSD 設置更高

# === 連接配置 ===
max_connections = 200
```

---

### 5. 連接池優化

```go
// 範例：Go 資料庫連接池配置

import (
    "database/sql"
    "time"
    _ "github.com/go-sql-driver/mysql"
)

db, err := sql.Open("mysql", dsn)
if err != nil {
    panic(err)
}

// 最大開啟連接數
// 建議：根據資料庫服務器的 max_connections 設置
// 通常設置為：max_connections / (應用實例數 + 其他服務)
db.SetMaxOpenConns(100)

// 最大空閒連接數
// 建議：與 MaxOpenConns 相同，避免頻繁建立連接
db.SetMaxIdleConns(100)

// 連接最大生命週期
// 建議：小於資料庫的 wait_timeout
db.SetConnMaxLifetime(time.Hour)

// 連接最大空閒時間
db.SetConnMaxIdleTime(10 * time.Minute)
```

---

### 6. 監控和診斷

#### 關鍵監控指標

```
1. 查詢效能
   - 慢查詢數量和比例
   - 平均查詢時間
   - P95/P99 查詢時間

2. 資源使用
   - CPU 使用率
   - 記憶體使用率
   - 磁碟 I/O（IOPS、吞吐量）
   - 網路流量

3. 連接
   - 活動連接數
   - 等待連接數
   - 連接錯誤數

4. 鎖和事務
   - 鎖等待數量
   - 死鎖數量
   - 長事務數量

5. 複製延遲（如有從庫）
   - 主從延遲時間
   - 複製錯誤
```

#### MySQL 診斷工具

```sql
-- 1. 查看當前正在執行的查詢
SHOW FULL PROCESSLIST;

-- 2. 查看慢查詢
SELECT * FROM mysql.slow_log 
ORDER BY start_time DESC 
LIMIT 10;

-- 3. 查看表的狀態
SHOW TABLE STATUS LIKE 'users';

-- 4. 查看索引使用情況
SHOW INDEX FROM users;

-- 5. 查看 InnoDB 狀態
SHOW ENGINE INNODB STATUS;

-- 6. 查看連接數
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Max_used_connections';

-- 7. 查看快取命中率
SHOW STATUS LIKE 'Qcache%';
```

---

### 常見面試問題

#### Q1：如何發現和優化慢查詢？

**回答要點**：
1. 啟用慢查詢日誌
2. 使用 EXPLAIN 分析查詢計劃
3. 檢查是否使用索引
4. 優化 SQL 語句
5. 考慮添加索引
6. 監控查詢效能

#### Q2：索引越多越好嗎？

**回答要點**：
- 不是，索引有成本
- 寫入時需要更新索引（降低寫入效能）
- 佔用額外儲存空間
- 索引維護開銷
- 應該根據查詢模式建立必要的索引

#### Q3：如何優化分頁查詢？

**回答要點**：
- 避免深度分頁（LIMIT 1000000, 10）
- 使用游標分頁（WHERE id > last_id）
- 使用覆蓋索引
- 快取分頁結果
- 考慮使用搜尋引擎（Elasticsearch）

#### Q4：資料庫連接池如何設置？

**回答要點**：
- MaxOpenConns：不超過資料庫 max_connections
- MaxIdleConns：與 MaxOpenConns 相同
- ConnMaxLifetime：小於 wait_timeout
- 根據實際負載調整
- 監控連接池使用情況

---

## 總結

資料庫效能調優是一個系統工程，需要從多個層面著手：

1. **索引優化**：正確設計和使用索引
2. **查詢優化**：編寫高效的 SQL
3. **快取策略**：減少資料庫訪問
4. **配置調優**：合理配置資料庫參數
5. **連接池**：優化連接管理
6. **監控診斷**：持續監控和改進

**優化原則**：
- 先測量，再優化
- 優先優化高頻查詢
- 權衡讀寫效能
- 定期審查和優化

記住：**過早優化是萬惡之源**，應該基於實際監控資料和效能瓶頸進行針對性優化。
