# MongoDB WiredTiger 存儲引擎深度解析

- **難度**: 7
- **重要程度**: 4
- **標籤**: `MongoDB`, `WiredTiger`, `存儲引擎`, `MVCC`, `壓縮`, `效能`

## 問題詳述

WiredTiger 是 MongoDB 3.2+ 的**默認存儲引擎**，取代了早期的 MMAP 引擎。理解 WiredTiger 的核心機制（文件格式、並發控制、緩存管理、压缩策略）是排查 MongoDB 效能問題和做出正確調優決策的前提。

## 核心理論與詳解

### WiredTiger 的整體架構

```
                      ┌─────────────────────────────┐
  MongoDB              │         WiredTiger           │
  Write Operation ──→  │                             │
                       │  ┌──────────────────────┐   │
                       │  │  WiredTiger Cache    │   │  ← Dirty/Clean Pages
                       │  │  (默認 50% RAM 或    │   │    B-Tree 結構
                       │  │   1GB，較大值)       │   │
                       │  └──────────┬───────────┘   │
                       │             │ Checkpoint     │
                       │             ↓ (60s 或 2GB)  │
                       │  ┌──────────────────────┐   │
                       │  │  Data Files           │   │  ← Snappy/Zlib 壓縮
                       │  │  (.wt 文件)           │   │
                       │  └──────────────────────┘   │
                       │                             │
                       │  ┌──────────────────────┐   │
                       │  │  Journal (WAL)        │   │  ← 崩潰恢復
                       │  └──────────────────────┘   │
                       └─────────────────────────────┘
```

---

### 核心特性一：MVCC 並發控制

WiredTiger 使用 **MVCC（Multi-Version Concurrency Control）** 實現讀-寫不阻塞：

- **讀操作**：看到事務開始時的**快照（Snapshot）**，不阻塞寫入
- **寫操作**：建立新版本，不覆蓋舊版本（直到不再被任何快照引用）
- **文件級別 → 文件內部**：不同於早期 MMAP 引擎的集合級鎖，WiredTiger 支援文件級（Document-level）並發

**與 MySQL InnoDB MVCC 的差異**：
- InnoDB 的 MVCC 透過 Undo Log + Read View 實現
- WiredTiger 的 MVCC 將多版本直接存儲於 B-Tree 的頁面中（每個鍵對應一個版本鏈）

---

### 核心特性二：WiredTiger Cache

**Cache 的角色**：WiredTiger Cache 是所有讀寫操作的**工作記憶體**，類似 InnoDB Buffer Pool。

**核心配置**：
```yaml
# mongod.conf
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 4   # 建議設為 (RAM - 1GB) × 0.5 以留給 OS 的文件系統緩存
```

**驅逐（Eviction）機制**：
- 當 Cache 使用量超過 80%（dirty pages 超過 20%）時，後台 Eviction 線程開始將 Dirty Pages 刷入磁碟
- 若 Cache 滿到 95%，**應用執行緒**也被強制參與 Eviction（導致寫入延遲飆高）
- **監控指標**：`serverStatus().wiredTiger.cache` → 關注 `bytes dirty in the cache in the past`

---

### 核心特性三：資料壓縮

WiredTiger 對資料和索引分別支援壓縮：

| 壓縮類型 | 默認算法 | 特點 |
|---------|---------|------|
| 集合資料（Collection data） | **Snappy** | 壓縮率中等（~40-60%），CPU 開銷低，速度快 |
| 索引 | **Prefix compression** | 對 B-Tree 相鄰 Key 的公共前綴去重，效果顯著 |
| 可選算法 | **Zlib/Zstd** | 壓縮率更高（可達 70-80%），但 CPU 開銷更大 |
| 日誌（Journal） | **Snappy** | 預設 |

**壓縮的收益**：
- 磁碟空間節省 40-80%
- 讀 I/O 減少（更多資料能放入 Cache 和 OS Page Cache）
- 寫入時多一個 CPU 壓縮步驟（但網路和磁碟往往才是瓶頸）

---

### 核心特性四：Checkpoint 與 Journal（WAL）

**Checkpoint**：
- 每 60 秒或 Journal 文件增長超過 2GB 時自動觸發
- 將 Cache 中的 Dirty Pages 刷入 Data Files，並建立一致性快照點（Consistent View）
- Checkpoint 完成後，之前的 Journal 可安全刪除

**Journal（Write-Ahead Log）**：
- 每個寫操作先記錄到 Journal（100ms 或 100MB 批次 fsync）
- 崩潰恢復：從最後一個 Checkpoint 開始，重放 Journal 中的操作
- `j: true` Write Concern：等待 Journal fsync 後才回應成功，確保持久性

---

### 效能調優關鍵點

1. **WiredTiger Cache 大小**：確保熱點資料能放入 Cache，觀察 `cache hit ratio`（命中率目標 > 90%）
2. **避免大文件**：每個 MongoDB 文件最大 16MB，但超過 1MB 的文件就應考慮重新設計
3. **索引記憶體**：所有索引應能放入 WiredTiger Cache，否則索引查詢觸發磁碟 I/O
4. **讀取效能**：Consider `readConcern: "local"` vs `"snapshot"` 的取捨（snapshot 有更高的 MVCC overhead）
