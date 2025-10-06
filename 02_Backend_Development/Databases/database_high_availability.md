# 資料庫高可用方案（主從複製、讀寫分離）

- **難度**: 8
- **重要程度**: 5
- **標籤**: `資料庫`, `高可用`, `主從複製`, `讀寫分離`, `故障轉移`

## 問題詳述

資料庫是系統的核心，一旦資料庫不可用，整個系統將癱瘓。設計高可用的資料庫架構，確保在硬體故障、網路問題或維護期間服務仍能正常運行，是資深後端工程師的關鍵能力。

## 核心理論與詳解

### 高可用性的目標

**高可用性（High Availability, HA）** 的核心目標：

```
1. 可用性目標（SLA）
   - 99%    = 每年停機 3.65 天
   - 99.9%  = 每年停機 8.76 小時  (3 個 9)
   - 99.99% = 每年停機 52.56 分鐘 (4 個 9)
   - 99.999%= 每年停機 5.26 分鐘  (5 個 9)

2. 故障恢復時間
   - RTO (Recovery Time Objective): 恢復目標時間
   - RPO (Recovery Point Objective): 資料丟失目標

3. 資料一致性
   - 強一致性 vs 最終一致性
   - 在可用性和一致性之間權衡
```

---

### 主從複製（Master-Slave Replication）

#### 核心原理

```
架構圖：

┌──────────────┐
│   Master     │ (主庫，處理寫入)
│   Database   │
└──────┬───────┘
       │ Binary Log
       │ 複製
   ┌───┴────┬────────┐
   ▼        ▼        ▼
┌──────┐ ┌──────┐ ┌──────┐
│Slave1│ │Slave2│ │Slave3│ (從庫，處理讀取)
└──────┘ └──────┘ └──────┘

資料流：
1. Master 接收寫入請求
2. Master 執行 SQL 並寫入 Binary Log
3. Slave 連接 Master，讀取 Binary Log
4. Slave 重放 Binary Log 中的 SQL
5. Slave 的資料與 Master 保持同步
```

#### MySQL 主從複製詳解

**複製類型**：

```
1. 非同步複製（Asynchronous Replication）- 預設
Master ──write──> Binary Log ──async──> Slave
                      │
                      └─ 立即返回給客戶端

優勢：效能最好
劣勢：可能丟失資料（Master 掛掉時）

2. 半同步複製（Semi-Synchronous Replication）
Master ──write──> Binary Log ──sync──> 至少一個 Slave
                      │                     │
                      └─────wait ACK────────┘
                      
優勢：較高的資料安全性
劣勢：效能略降（等待 ACK）

3. 全同步複製（Synchronous Replication）
Master ──write──> Binary Log ──sync──> 所有 Slave
                      │                     │
                      └─────wait all ACK────┘

優勢：最高的資料安全性
劣勢：效能最差
```

**Binary Log 格式**：

```
1. Statement-Based Replication (SBR)
   - 記錄 SQL 語句
   - 優勢：日誌量小
   - 劣勢：某些語句無法正確複製（如 UUID()、NOW()）

2. Row-Based Replication (RBR) - 推薦
   - 記錄每一行的變更
   - 優勢：完全可靠
   - 劣勢：日誌量大

3. Mixed-Based Replication
   - 混合使用 SBR 和 RBR
   - MySQL 自動選擇
```

**複製延遲問題**：

```
問題：Slave 的資料落後 Master

原因：
1. Master 寫入量大
2. Slave 硬體較弱
3. 網路延遲
4. Slave 上有大查詢阻塞複製

監控：
SHOW SLAVE STATUS\G
Seconds_Behind_Master: 5  (延遲 5 秒)

優化：
1. 使用 SSD 磁碟
2. 增加 Slave 硬體配置
3. 並行複製（Multi-Threaded Slave）
4. 避免在 Slave 上執行大查詢
```

---

### 讀寫分離（Read-Write Splitting）

#### 核心原理

```
架構圖：

┌────────────┐
│ Application│
└──────┬─────┘
       │
       │ 根據操作類型路由
       │
  ┌────┴────┐
  │         │
寫入請求  讀取請求
  │         │
  ▼         ▼
┌──────┐  ┌──────┐ ┌──────┐ ┌──────┐
│Master│  │Slave1│ │Slave2│ │Slave3│
└──────┘  └──────┘ └──────┘ └──────┘

優勢：
- 分散讀取壓力
- Master 專注於寫入
- 可以添加更多 Slave 擴展讀取能力
```

#### 實現方式

**1. 應用層實現**：

```go
// 範例：Go 應用層讀寫分離

type DatabaseCluster struct {
    master *sql.DB
    slaves []*sql.DB
    roundRobin int
}

// 寫入操作使用 Master
func (dc *DatabaseCluster) Write(query string, args ...interface{}) error {
    _, err := dc.master.Exec(query, args...)
    return err
}

// 讀取操作使用 Slave（輪詢）
func (dc *DatabaseCluster) Read(query string, args ...interface{}) (*sql.Rows, error) {
    // 輪詢選擇 Slave
    dc.roundRobin = (dc.roundRobin + 1) % len(dc.slaves)
    slave := dc.slaves[dc.roundRobin]
    
    return slave.Query(query, args...)
}

// 使用範例
func GetUser(id int) (*User, error) {
    query := "SELECT * FROM users WHERE id = ?"
    rows, err := dbCluster.Read(query, id)
    // ...
}

func CreateUser(user *User) error {
    query := "INSERT INTO users (name, email) VALUES (?, ?)"
    err := dbCluster.Write(query, user.Name, user.Email)
    // ...
}
```

**2. 中介軟體實現**：

```
常見工具：
- MySQL Proxy
- ProxySQL
- MaxScale
- Atlas

優勢：
- 應用透明，無需修改代碼
- 統一管理連接池
- 支援負載均衡

劣勢：
- 增加一層網路跳轉
- 額外的維護成本
```

#### 讀寫分離的挑戰

```
1. 複製延遲導致的不一致
問題：
User A 更新資料 → Master
User A 立即讀取 → Slave（資料尚未同步）

解決方案：
a) 強制讀主庫
   剛寫入後的讀取，路由到 Master

b) 等待同步
   寫入後等待 Slave 同步完成再讀取

c) 使用版本號
   讀取時檢查版本號，不匹配則讀 Master

d) 最終一致性
   接受短暫的不一致（適合大部分場景）

2. 事務中的讀寫
問題：
BEGIN;
  UPDATE users SET balance = balance - 100 WHERE id = 1;
  SELECT balance FROM users WHERE id = 1;  -- 應該讀哪個？
COMMIT;

解決方案：
事務中的所有操作都路由到 Master

3. 會話一致性
問題：
同一個用戶的請求可能路由到不同 Slave

解決方案：
a) Session Affinity（會話親和性）
   同一用戶的請求路由到同一 Slave

b) 讀主庫
   對一致性要求高的操作讀主庫
```

---

### 故障轉移（Failover）

#### 自動故障轉移

```
架構：使用管理工具實現自動故障轉移

工具選擇：
1. MySQL：
   - MHA (Master High Availability)
   - Orchestrator
   - MySQL Router (MySQL 8.0+)

2. PostgreSQL：
   - Patroni
   - repmgr

3. 雲端服務：
   - AWS RDS Multi-AZ
   - Google Cloud SQL
   - Azure Database
```

**MHA 故障轉移流程**：

```
正常狀態：
┌──────┐      ┌──────┐      ┌──────┐
│Master│ ───→ │Slave1│ ───→ │Slave2│
└──────┘      └──────┘      └──────┘
   ▲             │             │
   └─────MHA─────┴─────────────┘

Master 故障：
1. MHA 檢測到 Master 不可用
2. 選擇最新的 Slave（複製延遲最小）
3. 將其他 Slave 切換到新 Master
4. 提升 Slave1 為新 Master
5. 更新應用配置（VIP 或 DNS）

新狀態：
┌──────┐      ┌──────┐
│Slave1│ ───→ │Slave2│
│(New  │      │      │
│Master)      │      │
└──────┘      └──────┘

故障轉移時間：通常 10-30 秒
```

#### 手動故障轉移

```sql
-- 1. 停止 Slave 複製
STOP SLAVE;

-- 2. 檢查 Slave 狀態
SHOW SLAVE STATUS\G
-- 確認 Seconds_Behind_Master: 0

-- 3. 重置 Slave 配置
RESET SLAVE ALL;

-- 4. 將 Slave 提升為 Master
-- 移除 read_only 設置
SET GLOBAL read_only = OFF;

-- 5. 配置其他 Slave 指向新 Master
CHANGE MASTER TO
  MASTER_HOST='new-master-ip',
  MASTER_USER='repl',
  MASTER_PASSWORD='password',
  MASTER_LOG_FILE='mysql-bin.000001',
  MASTER_LOG_POS=154;

START SLAVE;

-- 6. 更新應用配置
-- 修改應用連接的資料庫地址
```

---

### 高可用架構模式

#### 1. Master-Slave（主從）

```
┌──────┐
│Master│ → 寫入
└───┬──┘
    │
  ┌─┴─┐
  ▼   ▼
┌────┐ ┌────┐
│Slv1│ │Slv2│ → 讀取
└────┘ └────┘

優勢：
- 簡單易實現
- 讀取可擴展

劣勢：
- Master 單點故障
- 需要手動或自動故障轉移
```

#### 2. Master-Master（雙主）

```
┌──────┐ ←→ ┌──────┐
│Master1│    │Master2│
└──────┘    └──────┘
  讀寫        讀寫

配置：
- 雙向複製
- 自增 ID 錯開（Master1: 1,3,5... Master2: 2,4,6...）

優勢：
- 無單點故障
- 快速故障轉移

劣勢：
- 可能產生寫入衝突
- 需要仔細設計避免衝突
```

#### 3. Multi-Master（多主）

```
┌──────┐
│Master1│ ←→ 其他 Master
└───┬──┘
    │
    ├─→ ┌──────┐
    │   │Master2│
    │   └──────┘
    │
    └─→ ┌──────┐
        │Master3│
        └──────┘

範例：MySQL Group Replication, Galera Cluster

優勢：
- 高可用性
- 任意節點可寫

劣勢：
- 配置複雜
- 衝突處理複雜
- 效能開銷
```

#### 4. 雲端託管高可用

```
AWS RDS Multi-AZ：

Primary AZ          Standby AZ
┌──────────┐       ┌──────────┐
│  Master  │ ────→ │ Standby  │
│ Database │       │ Database │
└──────────┘       └──────────┘
     │                  │
     └─ 自動同步複製 ────┘
     
故障轉移：
- 自動檢測 Master 故障
- 自動提升 Standby 為 Master
- 自動更新 DNS 指向
- RTO：通常 1-2 分鐘
- RPO：0（同步複製）

優勢：
- 完全自動化
- 無需自行管理
- 高可靠性

劣勢：
- 成本較高
- 供應商鎖定
```

---

### 監控和告警

#### 關鍵監控指標

```
1. 複製狀態
   - Slave_IO_Running: Yes
   - Slave_SQL_Running: Yes
   - Seconds_Behind_Master: < 5 秒

2. 複製延遲
   - 監控 Seconds_Behind_Master
   - 設置告警閾值（如 > 10 秒）

3. 主庫狀態
   - 可用性（健康檢查）
   - QPS（每秒查詢數）
   - 連接數

4. 從庫狀態
   - 可用性
   - 負載均衡
   - 查詢效能
```

#### 監控命令

```sql
-- MySQL 主庫
SHOW MASTER STATUS;

-- MySQL 從庫
SHOW SLAVE STATUS\G

-- 重點欄位：
-- Slave_IO_Running: 從 Master 讀取 Binary Log 的線程狀態
-- Slave_SQL_Running: 執行 SQL 的線程狀態
-- Seconds_Behind_Master: 複製延遲（秒）
-- Last_IO_Error: I/O 錯誤
-- Last_SQL_Error: SQL 錯誤

-- 查看複製過濾規則
SHOW SLAVE HOSTS;
```

---

### 最佳實踐

#### 1. 定期測試故障轉移

```
每月或每季度進行：
1. 計劃性故障轉移演練
2. 驗證自動故障轉移機制
3. 測試應用的容錯能力
4. 記錄 RTO 和 RPO
5. 優化故障轉移流程
```

#### 2. 備份策略

```
多層備份：
1. 實時：主從複製
2. 每日：全量備份
3. 每小時：增量備份
4. 異地：跨區域備份

備份測試：
- 定期恢復測試
- 驗證備份完整性
- 測試恢復時間
```

#### 3. 容量規劃

```
預留容量：
- Master：預留 50% 容量
- Slave：至少 2 個，預留 30% 容量
- 定期審查和擴容
```

---

### 常見面試問題

#### Q1：主從複製的延遲如何優化？

**回答要點**：
- 使用 SSD 磁碟
- 啟用並行複製
- 優化網路
- 減少 Master 寫入壓力
- 避免在 Slave 上執行大查詢

#### Q2：如何保證讀寫分離的資料一致性？

**回答要點**：
- 寫後讀路由到 Master
- 使用會話親和性
- 監控複製延遲
- 接受最終一致性（大部分場景）

#### Q3：如何選擇故障轉移的 Slave？

**回答要點**：
- 複製延遲最小
- 硬體配置較好
- 網路連接穩定
- Binary Log 位置最新

#### Q4：雲端 RDS 和自建高可用有什麼區別？

**回答要點**：
- RDS：自動化、易用、成本高
- 自建：靈活、可控、需要專業維護
- 根據團隊能力和需求選擇

---

## 總結

資料庫高可用方案的核心要素：

1. **主從複製**：實現資料冗餘和讀取擴展
2. **讀寫分離**：提高系統吞吐量
3. **故障轉移**：確保服務持續可用
4. **監控告警**：及時發現和處理問題

**設計原則**：
- 根據 SLA 要求選擇方案
- 權衡複雜度和可靠性
- 定期測試和演練
- 持續監控和優化

記住：**高可用不是一次性工程，而是持續的過程**。需要不斷測試、優化和改進。
