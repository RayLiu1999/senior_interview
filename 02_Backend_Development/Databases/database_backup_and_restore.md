# Database Backup & Restore (資料庫備份與還原)

- **難度**: 6
- **標籤**: `Database`, `Backup`, `Disaster Recovery`, `DevOps`

## 問題詳述

如何制定可靠的資料庫備份策略？什麼是 RPO 和 RTO？如何實現時間點復原 (PITR)？

## 核心理論與詳解

備份是資料安全的最後一道防線。

### 1. 關鍵指標 (RPO & RTO)

- **RPO (Recovery Point Objective)**: 資料恢復點目標。
  - 定義: 允許遺失多少時間的資料。
  - 範例: RPO = 5 分鐘，表示最多遺失最近 5 分鐘的資料。
  - 決定因素: 備份頻率、同步複製 vs 非同步複製。
- **RTO (Recovery Time Objective)**: 恢復時間目標。
  - 定義: 服務中斷後，多久能恢復運作。
  - 範例: RTO = 1 小時，表示必須在 1 小時內修復並上線。
  - 決定因素: 備份檔案大小、還原速度、自動化程度。

### 2. 備份類型

- **全量備份 (Full Backup)**: 備份整個資料庫。
  - 優點: 還原簡單。
  - 缺點: 耗時、佔用空間大。
  - 頻率: 通常每天或每週一次。
- **增量備份 (Incremental Backup)**: 只備份自上次備份 (無論全量或增量) 後變更的資料。
  - 優點: 速度快、空間小。
  - 缺點: 還原慢 (需依序重放所有增量)。
- **差異備份 (Differential Backup)**: 只備份自上次 **全量** 備份後變更的資料。
  - 優點: 還原比增量快 (只需全量 + 最後一次差異)。
  - 缺點: 隨著時間推移，備份檔會變大。

### 3. 時間點復原 (PITR - Point-in-Time Recovery)

能夠將資料庫還原到過去任意時間點 (例如：誤刪資料的前一秒)。

- **原理**: 全量備份 + 交易日誌 (Transaction Logs)。
- **MySQL**: Full Backup + Binlog。
- **PostgreSQL**: Base Backup + WAL (Write-Ahead Logging) Archives。
- **流程**:
  1. 還原最近一次的全量備份。
  2. 重放 (Replay) 該備份之後的日誌，直到指定的時間點。

### 4. 備份最佳實踐

- **3-2-1 原則**:
  - **3** 份資料副本 (1 原本 + 2 備份)。
  - **2** 種不同儲存介質 (如本地磁碟 + 雲端物件儲存)。
  - **1** 份異地保存 (Off-site) 以防範地域性災難。
- **定期演練 (Drill)**: 備份不等於能還原。必須定期測試還原流程，驗證備份檔的有效性。
- **加密**: 備份檔包含敏感資料，必須加密儲存。

## 程式碼範例

(MySQL 備份指令範例)

```bash
# 1. 全量備份 (使用 mysqldump)
mysqldump -u root -p --all-databases --single-transaction --quick --lock-tables=false > full_backup.sql

# 2. 備份 Binlog (用於 PITR)
mysqladmin -u root -p flush-logs
# 複製 /var/lib/mysql/mysql-bin.* 到安全位置
```
