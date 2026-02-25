# Kafka 訊息順序性保證

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Kafka`, `訊息順序`, `Partition`, `Key`, `幂等性`

## 問題詳述

Kafka 的訊息順序保證是其最常被誤解的特性之一：Kafka **只在單個 Partition 內保證有序**，跨 Partition 不保證全域順序。理解這一限制，以及如何透過設計規避它，是 Kafka 應用架構的核心能力。

## 核心理論與詳解

### Kafka 的順序保證範圍

```
Topic orders（3 Partitions）:

Partition 0: [Offset 0: 訂單A-建立] [Offset 1: 訂單C-建立] [Offset 2: 訂單A-支付]
Partition 1: [Offset 0: 訂單B-建立] [Offset 1: 訂單B-支付]
Partition 2: [Offset 0: 訂單D-建立]

✅ 訂單A 的事件（建立→支付）在 Partition 0 內有序
✅ 訂單B 的事件在 Partition 1 內有序
❌ 跨 Partition 無全域順序（無法透過 Kafka 本身保證 A.建立 < B.建立）
```

---

### 保證特定業務資料有序的核心策略：使用 Key

**將同一類業務實體的訊息路由到同一個 Partition**：

```go
// Producer 側：使用 order_id 作為 Key，確保同一訂單的所有事件進入同一 Partition
producer.Send(&sarama.ProducerMessage{
    Topic: "orders",
    Key:   sarama.StringEncoder(fmt.Sprintf("order-%s", orderID)), // 關鍵！
    Value: sarama.ByteEncoder(eventBytes),
})
// Kafka 使用 hash(Key) % numPartitions 決定 Partition
// 相同的 order_id 永遠進相同的 Partition，消費時就能保序
```

**Consumer 側**：由於同一 Partition 在一個 Consumer Group 中只被一個 Consumer 消費，處理同一 order_id 的事件自然是順序的。

---

### 幂等 Producer 對順序的影響

開啟 `enable.idempotence=true` 後，`max.in.flight.requests.per.connection` 最大為 5，但 Kafka Broker 保證：即使訊息亂序到達（因網路重試），Broker 側根據 Sequence Number 重新排序後寫入，**維護 Partition 內的有序性**。

---

### 破壞順序的常見場景與解法

| 場景 | 問題 | 解決方案 |
|------|------|---------|
| 多 Partition 無 Key | 輪詢分配，無順序保證 | 強制使用業務 Key |
| `max.in.flight > 1` + 無冪等性 | 重試可能造成亂序 | 開啟 `enable.idempotence=true` |
| Topic 增加 Partition | 增加後 `hash(Key)  % numPartitions` 結果變化，歷史資料與新資料可能在不同 Partition | 謹慎擴容，或在低峰期暫停生產後擴容 |
| Consumer 多線程處理 | 並行處理同 Partition 的訊息打亂順序 | 使用單一線程消費，或以業務 Key 再分流 |

---

### 極端場景：全域有序

若業務**確實需要全域有序**（所有訊息都有序），唯一方案是**只使用 1 個 Partition**：

- **優點**：完美的全域順序保證
- **缺點**：
    - 吞吐量受限於單個 Partition 的寫入速度（通常 10-100MB/s）
    - Consumer 只有 1 個能有效消費（無法並行）
    - **不建議在生產環境使用**，僅適合吞吐量很低的特殊場景

> **設計建議**：真正的業務需求幾乎都是「同一實體的事件有序」（如同一訂單），而非「全部訊息有序」。使用 **業務 ID 作為 Key** 是最優雅的解法，既保證業務有序，又維持多 Partition 的並行性。
