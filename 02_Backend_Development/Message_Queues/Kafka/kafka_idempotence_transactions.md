# Kafka 的冪等性和事務

- **難度**: 8
- **重要程度**: 4
- **標籤**: `Kafka`, `冪等性`, `Idempotent Producer`, `Kafka Transaction`, `Exactly-Once`

## 問題詳述

Kafka 預設提供 **At-Least-Once** 語義（可靠性優先，允許重複）。透過**冪等 Producer** 和 **Kafka 事務**，可以在 Producer 端實現 **Exactly-Once** 語義，確保訊息不重複、不丟失地寫入。

## 核心理論與詳解

### 三種傳遞語義

| 語義 | 含義 | Kafka 預設？ |
|------|------|------------|
| **At-Most-Once** | 訊息最多送達一次（可能丟失） | 不使用重試時 |
| **At-Least-Once** | 訊息至少送達一次（可能重複） | ✅ 預設 |
| **Exactly-Once** | 訊息恰好送達一次 | 需要冪等+事務 |

---

### 冪等 Producer（Idempotent Producer）

**解決問題**：Producer 重試導致的**同一條訊息被寫入多次**。

**機制**：
- Broker 為每個 Producer 分配唯一的 **PID（Producer ID）**（重啟後變化）
- Producer 為每個 `(PID, Partition)` 維護單調遞增的 **Sequence Number**
- Broker 快取每個 `(PID, Partition)` 的最後 N 個 Sequence Number
- 若 Broker 收到重複的 Sequence Number，直接忽略（冪等去重）

```properties
# 開啟冪等性（Kafka 3.0+ 已默認開啟）
enable.idempotence=true
# 自動強制設定：acks=all, retries=MAX_INT, max.in.flight=5
```

**局限**：
- 只保證**單個 Partition**、**單個 Producer 生命週期**內的冪等
- Producer 重啟後 PID 重新分配，重啟前的重複無法去重
- 不能跨 Partition 的原子性（跨 Partition 需要事務）

---

### Kafka 事務（Transactions）

**解決問題**：原子性地寫入多個 Topic/Partition（要麼全部成功，要麼全部失敗）。

**典型用途**：
- **Kafka Streams 的 Exactly-Once**：消費+處理+生產 作為一個原子操作
- **跨 Topic 原子寫入**：確保審計日誌和業務訊息同時成功或同時失敗

**事務的角色**：
- **事務協調者（Transaction Coordinator）**：Broker 中特殊的服務，管理事務狀態
- **`transactional.id`**：全局唯一的事務 ID，用於識別同一個 Producer 跨重啟的事務

**Go 事務 Producer 示例**：
```go
config := sarama.NewConfig()
config.Producer.RequiredAcks = sarama.WaitForAll
config.Producer.Idempotent = true
config.Producer.Transaction.ID = "my-transactional-producer-1" // 唯一 ID

producer, _ := sarama.NewSyncProducer(brokers, config)

// 開始事務
producer.BeginTxn()

// 原子性發送到多個 Topic/Partition
producer.SendMessage(&sarama.ProducerMessage{Topic: "orders", ...})
producer.SendMessage(&sarama.ProducerMessage{Topic: "inventory", ...})

// 提交或中止
if err := doBusinessLogic(); err != nil {
    producer.AbortTxn()  // 原子回滾
} else {
    producer.CommitTxn() // 原子提交
}
```

---

### 事務的實現原理（兩階段提交）

```
Producer                         Transaction Coordinator
  │                                        │
  ├── InitProducerID (transactional.id) ─→ │  返回 PID + Epoch
  │                                        │
  ├── AddPartitionsToTxn ────────────────→ │  記錄此事務涉及的分區
  │                                        │
  ├── 實際 ProduceRequest（帶事務標記）────→ Brokers（各 Partition Leader）
  │                                        │
  ├── EndTxn(commit=true) ──────────────→  │  Prepare Commit
  │                                        ├── 在 Transaction Log 記錄 Prepare Commit
  │                                        ├── 向各涉及 Broker 發送 WriteTxnMarker
  │                                        └── 記錄 Complete Commit
  │
 Consumer 側讀取時，只有 isolation.level=read_committed 才能看到已提交的事務訊息
```

**Consumer 側配置**：
```properties
isolation.level=read_committed  # 只讀取已提交的事務訊息
# 預設 read_uncommitted：讀取所有訊息，包括未提交的事務訊息（可能後來被 abort）
```

---

### 效能影響

Kafka 事務有**明顯的效能開銷**（約 20-40% 吞吐量下降）：
- 額外的 Coordinator 通信（InitProducerID、AddPartitions、EndTxn）
- 每個 Partition 結尾需要寫入 Transaction Marker
- `read_committed` 的 Consumer 需要等待事務結束才能看到訊息

> **建議**：只在真正需要跨 Partition 原子性的場景使用事務（如 Kafka Streams）。單 Partition 的去重只需冪等 Producer 即可。
