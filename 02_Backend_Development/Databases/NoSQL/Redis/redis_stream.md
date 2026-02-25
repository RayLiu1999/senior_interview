# Redis Stream：持久化訊息串流

- **難度**: 7
- **重要程度**: 4
- **標籤**: `Redis`, `Stream`, `訊息佇列`, `Consumer Group`, `事件驅動`

## 問題詳述

Redis Stream（Redis 5.0 引入）是 Redis 中唯一的**持久化、可回溯的訊息串流資料結構**，填補了 List（無 ID 索引）和 Pub/Sub（無持久化）之間的空缺。它借鑑了 Apache Kafka 的 Log-based 訊息設計，是在 Redis 內部實現輕量級訊息隊列的首選方案。

## 核心理論與詳解

### Redis 各訊息方案對比

| 特性 | List (LPUSH/BRPOP) | Pub/Sub | Stream |
|------|---------------------|---------|--------|
| 持久化 | ✅（RDB/AOF） | ❌（Fire and forget） | ✅（RDB/AOF） |
| 歷史訊息回溯 | ❌ | ❌ | ✅（按 ID 查詢） |
| 消費者群組 | ❌（需自行實現） | ✅（廣播模式） | ✅（Kafka 風格） |
| 消費確認（Ack） | ❌ | ❌ | ✅（XACK） |
| 多消費者競爭消費 | ✅（BRPOP） | ❌（所有人都收） | ✅（Consumer Group） |

---

### Stream 的核心概念

**訊息 ID**：`<millisecondsTime>-<sequenceNumber>`（如 `1720000000000-0`）
- 全局有序，單調遞增
- 可自動生成（`*`）或手動指定

**主要命令**：

```bash
# 生產者：向 Stream 追加訊息
XADD orders * user_id 123 amount 99.9 status pending
# 返回：1720000000000-0（自動生成的 ID）

# 消費者（無群組）：讀取最新 10 條
XREAD COUNT 10 BLOCK 0 STREAMS orders $

# 查看 Stream 長度
XLEN orders

# 查詢範圍（回溯歷史訊息）
XRANGE orders - +          # 全部
XRANGE orders 1720000000000-0 +  # 從某 ID 開始
```

---

### Consumer Group（消費者群組）

Consumer Group 是 Redis Stream 最核心的特性，實現了 Kafka 風格的**競爭消費（competitive consumption）**：

**原理**：
- 每個 Consumer Group 有獨立的**已讀游標（last_delivered_id）**
- 組內多個消費者**競爭分配**訊息（不重複消費）
- 每條訊息被分配後進入 **PEL（Pending Entry List）**，等待 `XACK` 確認後移出

```bash
# 建立消費者群組（從最新訊息開始：$，或從頭開始：0）
XGROUP CREATE orders order-processors $ MKSTREAM

# 消費者讀取（> 表示讀取未分配的新訊息）
XREADGROUP GROUP order-processors consumer-1 COUNT 10 BLOCK 0 STREAMS orders >

# 確認處理完成（從 PEL 移除）
XACK orders order-processors 1720000000000-0

# 查看未確認（Pending）的訊息
XPENDING orders order-processors - + 10

# 重新認領超時未確認的訊息（XCLAIM 或 XAUTOCLAIM）
XAUTOCLAIM orders order-processors consumer-2 60000 0-0
```

---

### Stream 的資料清理

Stream 理論上無限增長，需要主動限制大小：

```bash
# 固定大小（近似，使用 ~ 效能更好）
XADD orders MAXLEN ~ 100000 * user_id 456 ...

# 按時間修剪（Redis 6.2+）
XTRIM orders MINID ~ 1700000000000  # 刪除指定 ID 之前的訊息
```

---

### 適用場景與選型建議

**Redis Stream 適合**：
- **輕量級訊息隊列**：業務量不大，不想引入 Kafka 的複雜性
- **任務調度**：帶有重試、確認機制的後台任務
- **活動日誌**：用戶操作日誌、審計日誌（需回溯查詢）
- **微服務間通信**：同一個 Redis 叢集的服務間非同步解耦

**仍應選 Kafka 的場景**：
- 日均訊息量 > 百萬級
- 需要跨數據中心複製
- 需要超過 Redis 記憶體容量的長期訊息保留
- 需要精確的 Exactly-Once 語義
