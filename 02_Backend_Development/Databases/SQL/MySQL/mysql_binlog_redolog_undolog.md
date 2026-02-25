# MySQL 三大日誌：Binlog、Redo Log、Undo Log

- **難度**: 7
- **重要程度**: 5
- **標籤**: `MySQL`, `Binlog`, `Redo Log`, `Undo Log`, `WAL`, `崩潰恢復`, `主從複製`

## 問題詳述

MySQL InnoDB 引擎維護三種核心日誌：Binlog（二進制日誌）、Redo Log（重做日誌）和 Undo Log（撤銷日誌）。它們分工明確，分別负責**主從複製、崩潰恢復（Crash Recovery）和事務回滾/MVCC**，是 MySQL 可靠性的三大支柱。

## 核心理論與詳解

### Redo Log（重做日誌）

**歸屬**：InnoDB 存儲引擎層（非 Server 層）
**作用**：保證事務的**持久性（Durability）**，實現崩潰恢復

**核心機制 — WAL（Write-Ahead Logging，預寫日誌）**：

InnoDB 修改數據時，不立即將數據的物理頁寫回磁碟（因為隨機寫很慢），而是：
1. 先將**物理頁的修改記錄**（「在第 X 頁第 Y 行，數據從 A 改為 B」）**順序追加**到 Redo Log（順序寫比隨機寫快 100 倍）
2. 這個過程稱為「先寫日誌，再改數據」= WAL
3. 真正的數據頁（臟頁）由後台線程定期刷入磁碟（Checkpoint 機制）
4. 若 MySQL 崩潰，重啟時通過 Redo Log 重放未完成的修改，恢復數據

**物理日誌**：記錄的是磁碟頁的物理修改。

**關鍵配置**：`innodb_flush_log_at_trx_commit`
- `0`：每秒刷一次（可能丟失 1 秒數據）
- `1`（默認）：每次提交都刷盤（最安全，最慢）
- `2`：提交後寫 OS 緩存，每秒刷一次盤（折中）

---

### Binlog（二進制日誌）

**歸屬**：MySQL Server 層（所有存儲引擎共享）
**作用**：**主從複製**和**數據恢復**（Point-in-Time Recovery）

**記錄格式**（`binlog_format`）：
| 格式 | 記錄內容 | 特點 |
|------|---------|------|
| **Statement** | SQL 語句 | 日誌量小，但部分函數（NOW()、UUID()）不安全 |
| **Row** | 每行的前後值（行變化） | 精確，但日誌量大；默認格式 |
| **Mixed** | Statement + Row 混合 | 自動選擇，較少使用 |

**主從複製流程**：
```
主庫執行事務 → 寫 Binlog → Binlog Dump 線程推送給從庫
         → 從庫 I/O Thread 接收 → 寫 Relay Log
         → 從庫 SQL Thread 重放 Relay Log → 從庫數據同步
```

---

### Undo Log（撤銷日誌）

**歸屬**：InnoDB 存儲引擎層
**作用**：保證事務的**原子性（Atomicity）**，以及支持 **MVCC（多版本並發控制）**

**原子性保證**：
- 事務修改數據前，先將原始值記錄到 Undo Log
- 若事務需要回滾，從 Undo Log 讀取原始值，逆向執行撤銷操作

**MVCC 實現**：
- 每行記錄有隱藏字段：`DB_TRX_ID`（最後修改的事務 ID）、`DB_ROLL_PTR`（指向 Undo Log 的指針）
- 快照讀（SELECT）通過 Undo Log 形成的**版本鏈**，找到符合當前讀視圖（Read View）的舊版本
- 這使得讀操作不需要加鎖（MVCC 讓讀寫不互斥）

---

### 三種日誌的核心區別

| 特性 | Redo Log | Binlog | Undo Log |
|------|---------|--------|---------|
| **歸屬層** | InnoDB（引擎層） | MySQL Server | InnoDB（引擎層） |
| **內容** | 物理修改（頁的差異） | 邏輯操作（SQL 或行變化） | 數據的舊版本 |
| **主要用途** | 崩潰恢復 | 主從複製 + PITR | 事務回滾 + MVCC |
| **大小** | 循環寫（固定大小，innodb_log_file_size） | 追加寫（持續增長） | 追加寫 |

---

### 兩階段提交（2-Phase Commit for Redo Log + Binlog）

InnoDB 使用**兩階段提交**保證 Redo Log 和 Binlog 的一致性：

```
① prepare 階段：寫 Redo Log（狀態: prepare）+ 刷盤
② commit 階段：寫 Binlog → 刷盤 → 更新 Redo Log 狀態為 commit
```

**崩潰恢復邏輯**：
- 崩潰在 ① 之前：事務回滾（Redo Log 無 prepare 記錄）
- 崩潰在 ① ② 之間（Redo Log prepare 但 Binlog 未寫完）：事務回滾
- 崩潰在 ② 之後（Binlog 寫完但 Redo Log 未 commit）：事務提交（有 Binlog 為證）

這保證了 Redo Log（數據）和 Binlog（主從複製源）的最終一致性。
