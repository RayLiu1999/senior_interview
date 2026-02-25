# Kafka Producer 工作原理與配置

- **難度**: 7
- **重要程度**: 4
- **標籤**: `Kafka`, `Producer`, `acks`, `batch.size`, `linger.ms`, `壓縮`

## 問題詳述

Kafka Producer 的效能和可靠性取決於正確配置幾個關鍵參數。理解 Producer 的**批次機制（Batching）**、**ACK 確認策略**和**重試機制**，是在吞吐量和可靠性之間做出正確權衡的基礎。

## 核心理論與詳解

### Producer 的發送流程

```
應用程式調用 send()
      ↓
 序列化（Key Serializer + Value Serializer）
      ↓
 分區器（Partitioner）：決定發送到哪個 Partition
      ↓
 RecordAccumulator（每個 Partition 一個雙端隊列）
      ↓
  批次緩衝（ProducerBatch）
  ← 滿足 batch.size 或 linger.ms 超時 →
      ↓
 NetworkClient（後台 Sender 線程）
      ↓
 Broker（Partition Leader）
      ↓
 等待 ACK（根據 acks 配置）
```

---

### 關鍵可靠性配置：`acks`

`acks` 是**最重要的可靠性參數**，控制 Producer 需要等待多少個副本確認才算成功：

| `acks` | 行為 | 丟失風險 | 延遲 | 適用場景 |
|--------|------|---------|------|---------|
| `0` | 不等待確認，fire & forget | 高（Broker 未接收也不知道） | 最低 | 允許丟失的埋點、日誌 |
| `1`（默認） | 等待 Leader 確認寫入本地 Log | 中（Leader 崩潰後 Follower 未同步） | 低 | 一般業務日誌 |
| `-1` / `all` | 等待所有 ISR 副本確認 | 極低 | 較高 | 金融、訂單等關鍵業務 |

> `acks=all` 必須結合 `min.insync.replicas`（Broker 側配置）才有意義。例如 `min.insync.replicas=2`（3 副本叢集）意味著至少 2 個副本確認才算成功，即使 1 個 Follower 宕機也能正常寫入。

---

### 關鍵效能配置：批次機制

**`batch.size`**（默認 16384 字節 = 16KB）：
- 同一個 Partition 的訊息累積到 `batch.size` 字節後，作為一個批次發送
- 增大可提升吞吐量，但增加延遲和記憶體使用

**`linger.ms`**（默認 0ms）：
- 即使批次未滿，等待 `linger.ms` 毫秒後強制發送
- 預設 0 意味著「立即發送」，常設為 **5-100ms** 以提升批次效率

**`buffer.memory`**（默認 32MB）：
- RecordAccumulator 的記憶體總量上限
- 若記憶體耗盡，`send()` 阻塞（最多 `max.block.ms` 毫秒，超過拋出異常）

---

### 訊息壓縮

在 RecordAccumulator 中以批次為單位壓縮，Broker 存儲壓縮後的批次，Consumer 解壓：

| 算法 | 壓縮率 | CPU 開銷 | 推薦場景 |
|------|--------|---------|---------|
| `none` | - | - | 小量訊息，CPU 緊張 |
| `gzip` | 高（~60-70%） | 高 | 網路帶寬昂貴，訊息大 |
| `snappy` | 中（~40-50%） | 低 | 均衡選擇 |
| `lz4` | 中（~45%） | 很低 | **推薦默認選擇** |
| `zstd` | 高（~65%） | 中 | Kafka 2.1+，高壓縮率需求 |

---

### 重試與冪等性

**`retries`**（默認 `Integer.MAX_VALUE`） + **`delivery.timeout.ms`**（默認 2 分鐘）：
- Producer 在超時範圍內自動重試失敗的發送
- 重試可能導致**消息重複**（尤其在 Broker 已寫入但 ACK 丟失時）

**解決方案：冪等 Producer（Idempotent Producer）**：

```properties
enable.idempotence=true
# 自動設置: acks=all, retries=MAX, max.in.flight.requests.per.connection=5
```

- Broker 為每個 Producer 分配 **PID（Producer ID）**
- 每條訊息附帶 **Sequence Number**
- Broker 發現重複的 `(PID, Partition, SequenceNumber)` 組合時，直接去重不重複寫入
- **效果**：Exactly-Once（單 Partition，無跨 Session 保證）

---

### 常見面試追問：`max.in.flight.requests.per.connection`

- 默認 5：允許 Producer 有最多 5 個未確認的請求批次同時在飛（in-flight）
- 設為 1：嚴格按順序發送（牺牲吞吐量換取嚴格順序）
- **開啟冪等性時**：允許最大 5，Broker 端排序保證每個 Partition 的順序（Kafka 的特殊排序算法）
