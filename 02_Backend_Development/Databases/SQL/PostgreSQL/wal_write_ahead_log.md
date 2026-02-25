# PostgreSQL WAL (Write-Ahead Log) 原理與應用

- **難度**: 7
- **重要程度**: 4
- **標籤**: `PostgreSQL`, `WAL`, `崩潰恢復`, `持久性`, `Streaming Replication`

## 問題詳述

WAL（Write-Ahead Log，預寫式日誌）是 PostgreSQL 實現**ACID 持久性（Durability）** 和**時間點恢復（PITR）** 的核心機制。理解 WAL 是診斷複製延遲、設計備份策略和優化寫入效能的關鍵。

## 核心理論與詳解

### WAL 的核心思想

> **Write-Ahead Logging 規則**：在資料頁（Data Page）被寫入磁碟之前，描述此變更的日誌記錄**必須先**被持久化到磁碟。

**為什麼需要 WAL？**

傳統的「先修改資料頁再落盤」方式面臨的問題：
1. 資料頁是 8KB 大小，寫入是**隨機 I/O**（磁碟 seek overhead 高）
2. 若寫入中途崩潰，結果是**部分寫入的髒頁（Torn Page）**，資料無法恢復

WAL 的優化：
- 日誌是**順序追加（Sequential Append）**，磁碟效率高出隨機 I/O 數十倍
- 日誌記錄精簡（僅記錄變更了什麼，而非全頁），I/O 量小
- Crash Recovery 時，從上次 Checkpoint 開始重放（Replay）日誌即可恢復一致狀態

---

### WAL 的運作流程

```
                  ┌──────────────┐
  SQL INSERT/     │  Shared      │
  UPDATE/DELETE   │  Buffers     │  ← 資料頁在記憶體中被修改（Dirty Page）
       ↓          │  (記憶體快取) │
  ┌──────────┐    └──────────────┘
  │ WAL      │─────────────────────────→ 磁碟上的 WAL 段文件
  │ Buffers  │    ① 先寫 WAL             (pg_wal/ 目錄)
  └──────────┘    ② commit: WAL fsync
                  ③ 之後，Dirty Pages
                     由 bgwriter/checkpoint
                     異步刷入資料文件

  崩潰後恢復：
  從最近 Checkpoint 的 WAL 位置開始 Redo，
  重放所有已提交的 WAL 記錄
```

**事務提交的 I/O 路徑**：
1. WAL 記錄寫入 WAL Buffers（記憶體）
2. `COMMIT` 時，`WAL fsync` 確保 WAL 持久化到磁碟（`synchronous_commit` 控制）
3. 客戶端收到成功回應
4. Dirty Pages 由後台進程異步刷入資料文件（非阻塞）

---

### 關鍵配置參數

**`synchronous_commit`**（最重要的持久性/效能權衡參數）：

| 值 | 行為 | 持久性風險 | 效能 |
|----|------|-----------|------|
| `on`（默認） | Commit 必須等 WAL 寫入主庫磁碟 | 無 | 基準 |
| `remote_apply` | 等待備庫也應用 WAL | 無 | 最慢 |
| `remote_write` | 等待備庫收到 WAL（不必 fsync） | 主庫崩潰時無損失，備庫崩潰有窗口 | 略快 |
| `local` | 只等主庫 WAL 持久化，不等備庫 | 備庫可能落後 | 較快 |
| `off` | 非同步提交，不等 WAL fsync | 崩潰可能丟失最近 ~0.6s 數據 | 最快 |

> `off` 模式下的資料丟失**不會導致資料不一致**（僅丟失最近提交），但適合允許少量丟失的場景（如日誌寫入）。

**`wal_level`**：
- `minimal`：最少 WAL，不支援複製
- `replica`（默認）：支援串流複製和基礎備份
- `logical`：額外支援邏輯複製（Logical Replication）

**`checkpoint_completion_target`**（默認 0.9）：在 0.9 個 checkpoint 週期內完成髒頁刷盤，平滑 I/O 尖峰。

---

### WAL 的應用場景

**1. 崩潰恢復（Crash Recovery）**
- PostgreSQL 啟動時自動重放上次 Checkpoint 後的 WAL
- 保證資料庫恢復到上次成功提交的一致狀態

**2. 串流複製（Streaming Replication）**
- 主庫（Primary）將 WAL 記錄即時傳送給備庫（Standby）
- 備庫持續應用（Replay）WAL，保持數據同步
- WAL Sender 進程（主庫）/WAL Receiver 進程（備庫）負責傳輸

**3. 時間點恢復（PITR - Point-In-Time Recovery）**
- 結合 Base Backup + WAL 歸檔，可以恢復到任意歷史時間點
- 是 RTO/RPO 要求嚴格的業務必備能力

**4. 邏輯複製（Logical Replication）**
- `wal_level = logical` 時，WAL 包含行級別的變更資訊
- 可跨版本、跨資料庫類型複製（異構複製）

---

### WAL 相關監控指標

```sql
-- 查看 WAL 生成速率和複製延遲
SELECT
    client_addr,
    state,
    sent_lsn,
    write_lsn,
    flush_lsn,
    replay_lsn,
    (sent_lsn - replay_lsn) AS replication_lag_bytes
FROM pg_stat_replication;

-- 查看當前 WAL LSN 位置
SELECT pg_current_wal_lsn();
```
