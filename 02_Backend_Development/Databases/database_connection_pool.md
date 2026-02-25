# 資料庫連線池原理 (Database Connection Pool)

- **難度**: 5
- **重要程度**: 5
- **標籤**: `Connection Pool`, `資料庫`, `效能調優`, `HikariCP`, `GORM`

## 問題詳述

資料庫連線的建立是高成本操作（TCP 握手 + MySQL 認證至少數十毫秒）。連線池（Connection Pool）透過**預先分配並複用已建立的連線**，將連線建立成本攤銷，是高效能後端系統不可或缺的基礎設施元件。

## 核心理論與詳解

### 為什麼需要連線池？

一次完整的資料庫連線建立包含：
1. **TCP 三次握手**（Client → DB Server）
2. **MySQL 認證握手**（用戶名/密碼/SSL）
3. **分配 Server 端線程**

> 這個過程在同機房環境約需 **1-5 ms**，在跨數據中心可能高達 **50-200 ms**。對於每秒處理數千請求的應用，每次請求都建立連線是不可接受的。

**連線池的核心收益**：
- **消除連線建立開銷**：從連線池取出已建立的連線是 **O(1)** 的內存操作
- **限制最大連線數**：防止應用側突發流量壓垮資料庫（`max_connections` 超限後 DB 直接拒絕）
- **連線健康檢查**：自動淘汰已失效的連線（如資料庫重啟、防火牆 idle timeout）

---

### 連線池核心參數

| 參數名 | 含義 | 設置建議 |
|--------|------|---------|
| `MinIdle / min_open` | 最小空閒連線數（預熱） | `CPU核心數 × 2` |
| `MaxOpen / max_open` | 最大開啟連線總數 | 通常 `10~100`，配合 DB `max_connections` |
| `MaxIdle` | 最大空閒保持連線數 | ≤ `MaxOpen`，避免大量空閒連線佔用 DB 資源 |
| `ConnMaxLifetime` | 連線最大存活時間 | 建議 `< wait_timeout`（MySQL 默認 8h），如 `1h` |
| `ConnMaxIdleTime` | 連線最大空閒時間 | 如 `10m`，定期釋放真正閒置的連線 |
| `ConnectionTimeout` | 從池取得連線的等待超時 | `30s` 以內，超時應快速失敗 |

---

### 連線池的工作原理

```
                    ┌───────────────────────────────┐
  Application       │        Connection Pool        │
  Thread ──Get()──→ │  ┌──────┐  ┌──────┐  ┌──────┐│  ┌──────────┐
                    │  │ Conn1│  │ Conn2│  │ Conn3││  │  MySQL   │
  Thread ──Get()──→ │  │(使用中)│ │(空閒)│  │(空閒)││  │  Server  │
                    │  └──────┘  └──────┘  └──────┘│  └──────────┘
  Thread ──Return()─→                               │
                    │  若所有連線都在使用中：          │
                    │  - 等待（blocking，最多 Timeout）│
                    │  - 若未達 MaxOpen，新建連線     │
                    └───────────────────────────────┘
```

**連線的生命週期**：
1. **空閒（Idle）**：連線已建立，等待被分配
2. **使用中（In Use）**：已被某個請求持有，不能被其他請求使用
3. **廢棄（Evicted）**：超過 `ConnMaxLifetime` 或健康檢查失敗，被池移除並關閉

---

### 常見問題與排查

**1. 連線池耗盡（Pool Exhaustion）**

- **症狀**：應用大量請求超時，日誌出現 `connection pool timeout`
- **根因**：慢查詢導致連線長時間被佔用，MaxOpen 過小，或流量激增
- **處理**：
    - 短期：提高 `MaxOpen`（注意不要超過 DB `max_connections`）
    - 長期：優化慢查詢、引入讀寫分離、分庫分表

**2. 連線洩漏（Connection Leak）**

- **症狀**：活躍連線數持續增長，最終耗盡
- **根因**：程式碼在異常路徑忘記 `Close()` 或 `defer rows.Close()`
- **預防**：使用 `defer db.Close()`、ORM 自動管理、設置 `ConnMaxLifetime`

**3. 連線閒置被 Proxy/防火牆切斷**

- **症狀**：長時間無流量後，突然出現 `broken pipe` 或 `EOF` 錯誤
- **根因**：很多雲端 Load Balancer 或防火牆對 TCP idle connection 有超時（如 AWS NLB 默認 350s）
- **解決**：
    - 設置 `ConnMaxIdleTime` < 防火牆 idle timeout
    - 啟用 TCP Keepalive
    - HikariCP 的 `keepaliveTime` 參數

---

### Go 的連線池配置（`database/sql`）

```go
package main

import (
    "database/sql"
    "time"

    _ "github.com/go-sql-driver/mysql"
)

func newDB(dsn string) (*sql.DB, error) {
    db, err := sql.Open("mysql", dsn)
    if err != nil {
        return nil, err
    }

    // 核心連線池參數配置
    db.SetMaxOpenConns(50)                 // 最大開啟連線數
    db.SetMaxIdleConns(10)                 // 最大閒置連線數
    db.SetConnMaxLifetime(time.Hour)       // 連線最長存活時間
    db.SetConnMaxIdleTime(10 * time.Minute) // 連線最長閒置時間

    // 驗證連線池可用
    if err := db.Ping(); err != nil {
        return nil, err
    }

    return db, nil
}
```

> **注意**：`sql.Open()` 僅驗證參數格式，不立即建立連線。連線在首次使用時（`db.QueryContext` 等）才真正建立。透過 `db.Ping()` 可提前觸發連線建立（預熱）。

---

### 連線數的最佳配置原則

**資料庫側限制**：
```
DB max_connections ≥ Σ (所有應用實例的 MaxOpenConns) + 運維工具連線數
```

**應用側計算**（通用建議）：
- IO 密集型服務：`MaxOpen = CPU核心數 × (1 + 平均IO等待比例)`
- 實驗結論：對多數 OLTP 資料庫，**每個 DB 的連線數在 10-50 之間**往往效能最佳（過多連線導致 DB 側上下文切換開銷反而更大）
- 使用 **pgBench / sysbench** 進行壓測，找到吞吐量的拐點
