# Kafka Consumer 和 Consumer Group 工作原理

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Kafka`, `Consumer`, `Consumer Group`, `Offset`, `Poll`, `Commit`

## 問題詳述

Kafka Consumer 的設計以 **Consumer Group** 為核心單元，實現了高並行消費的同時保持了分區內的有序性。理解 Consumer 的**拉取模型（Pull-based）**、**Offset 管理**和 **Consumer Group 協調機制**，是避免消息重複或丟失的關鍵。

## 核心理論與詳解

### Pull-based vs Push-based

Kafka Consumer 主動從 Broker **拉取（Pull）** 訊息，而非 Broker 推送（Push）：

**Pull 模式的優勢**：
- **流量控制**：Consumer 按自身處理能力決定拉取速率，不會被 Broker 壓垮
- **批次靈活**：Consumer 可根據需要拉取大批次，提升吞吐；Broker 推送很難高效控制批次大小
- **重試友好**：Consumer 處理失敗可直接重試，不依賴 Broker 側的重試邏輯

**Pull 模式的缺點**：
- 若無新訊息，Consumer 需要不斷輪詢，空輪詢浪費資源
- 解決方案：`consumer.poll(Duration.ofMillis(500))` 使用長輪詢，Broker 在有新訊息時才回應（最長等 500ms）

---

### Consumer Group 的分區分配

**核心規則**：
- 同一 Consumer Group 中，**每個 Partition 只能被一個 Consumer 消費**
- 同一條訊息**可以被不同 Consumer Group 的 Consumer 各消費一次**（廣播語義）

```
Topic orders（4 Partitions: P0, P1, P2, P3）

Group A（2 Consumers）:
  Consumer A1 → P0, P1
  Consumer A2 → P2, P3

Group B（4 Consumers）:
  Consumer B1 → P0
  Consumer B2 → P1
  Consumer B3 → P2
  Consumer B4 → P3

Group C（訂閱同一 Topic）:
  可以獨立地從 P0-P3 消費，不影響 Group A/B 的消費進度
```

---

### Offset 管理

**Offset** 是 Consumer 在 Partition 中的消費位置，存儲在 Kafka 內部 Topic `__consumer_offsets`。

**提交方式**：

| 方式 | 配置 | 優缺點 |
|------|------|--------|
| 自動提交 | `enable.auto.commit=true`，`auto.commit.interval.ms=5000` | 簡單，但可能丟失（poll 成功但處理中 crash）或重複（commit 了但處理未完成的被重複） |
| 同步手動提交 | `commitSync()` | 業務處理完後提交，阻塞直到成功，較安全 |
| 異步手動提交 | `commitAsync()` | 非阻塞，但失敗不一定重試（需配合回調） |

**最安全的模式（至少一次語義）**：
```go
for {
    records := consumer.Poll(100 * time.Millisecond)
    for _, record := range records {
        // 1. 處理訊息
        process(record)
        // 2. 確認後手動提交（同步）
        consumer.CommitSync()  // 或儲存 offset 到外部存儲
    }
}
```

**`auto.offset.reset`**：Consumer 首次加入 Group 或 Offset 失效時的起始位置：
- `latest`（默認）：從最新訊息開始，跳過歷史訊息
- `earliest`：從頭開始消費所有歷史訊息
- `none`：若找不到 committed offset，拋出異常

---

### Consumer 的關鍵配置

| 參數 | 默認值 | 說明 |
|------|--------|------|
| `max.poll.records` | 500 | 單次 `poll()` 返回的最大記錄數 |
| `max.poll.interval.ms` | 300000（5分鐘） | 兩次 `poll()` 的最大間隔，超過觸發 Rebalance |
| `session.timeout.ms` | 45000（45秒） | 心跳超時，超過認定 Consumer 宕機 |
| `heartbeat.interval.ms` | 3000（3秒） | 心跳發送頻率（應小於 session.timeout 的 1/3） |
| `fetch.min.bytes` | 1 | 最小拉取字節數（設大可減少請求次數） |
| `fetch.max.wait.ms` | 500 | 等待湊夠 `fetch.min.bytes` 的最大等待時間 |

**重要警告**：若業務處理一批訊息的時間接近或超過 `max.poll.interval.ms`，Broker 會認為該 Consumer 失活並觸發 Rebalance。解決方法：
1. 減小 `max.poll.records`（減少每次處理量）
2. 增大 `max.poll.interval.ms`
3. 非同步處理訊息（注意 Offset 提交的時機）

---

### Exactly-Once 消費端保證

Kafka 本身只能在 Producer 端保証冪等（同一 Partition），Consumer 端的 Exactly-Once 需要**業務層配合**：

1. **冪等消費**：確保相同訊息處理多次結果相同（自然冪等）
2. **事務性消費 + 儲存**：將「處理業務」和「提交 Offset」放在一個原子事務中（如 Kafka Streams 的 EOS 模式）
3. **外部去重**：使用 Redis SET 記錄已處理的 Message ID（`SET msg_id EX 86400 NX`）
