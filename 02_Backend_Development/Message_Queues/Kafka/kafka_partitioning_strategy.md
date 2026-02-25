# Kafka 的分區策略和負載均衡

- **難度**: 7
- **重要程度**: 4
- **標籤**: `Kafka`, `Partitioning`, `分區策略`, `負載均衡`, `Key`

## 問題詳述

Partition 是 Kafka 並行能力的基本單元。**分區策略（Partitioning Strategy）**決定了訊息如何分散到各個 Partition，直接影響到**資料均衡性**、**訊息有序性**和**Consumer 的並行度**。

## 核心理論與詳解

### Producer 側的分區決策

Producer 的分區器（Partitioner）決定每條訊息進入哪個 Partition：

#### 1. 預設分區器（DefaultPartitioner / UniformStickyPartitioner）

**有 Key 的訊息**：
```
partition = hash(key) % numPartitions
```
- 使用 **MurmurHash2**（非加密哈希，速度快）
- 相同 Key 永遠進相同 Partition（決定性路由，是順序保證的基礎）

**無 Key 的訊息（Kafka 2.4+ Sticky Partitioner）**：
- 批次期間（`linger.ms` 內）**黏性路由**到同一個 Partition，等批次滿或超時後隨機切換
- 相比 Kafka 2.3 的純輪詢，減少了批次碎片化（更高的批次填充率 → 更好的壓縮和吞吐）

---

#### 2. 自訂分區器

業務需要**更精細的路由邏輯**時可實現自訂分區器：

```go
// Go 示例：根據訊息的業務屬性（VIP 用戶 vs 普通用戶）路由到不同分區組
type PriorityPartitioner struct{}

func (p *PriorityPartitioner) Partition(
    topic string, key, value []byte, numPartitions int32,
) (int32, error) {
    // VIP 用戶路由到前半段分區（更少競爭，更快消費）
    if isVIPUser(key) {
        return int32(murmur2(key)) % (numPartitions / 2), nil
    }
    // 普通用戶路由到後半段分區
    return (numPartitions / 2) + int32(murmur2(key)) % (numPartitions / 2), nil
}
```

---

### Partition 数量的規劃

**Partition 越多 = 並行度越高 ≠ 效能越好**。Partition 過多的代價：

| 代價 | 說明 |
|------|------|
| **Leader 選舉時間** | 每個 Partition 都有 Leader，Broker 宕機時大量 Leader 需要重選舉，時間線性增長 |
| **文件句柄** | 每個 Partition 對應磁碟上的一個目錄+多個段文件，文件句柄消耗線性增長 |
| **端到端延遲** | Partition 越多，流量分散，各分區批次填充速度降低，`linger.ms` 超時才發送 |
| **Controller 記憶體** | Controller Broker 需要在記憶體中維護所有 Partition 的元資料 |

**推薦的分區數計算**：
```
numPartitions = max(
    目標吞吐量(MB/s) / 單Partition生產吞吐(MB/s),  // 生產側
    目標吞吐量(MB/s) / 單Partition消費吞吐(MB/s),  // 消費側
    Consumer Group的最大Consumer數                  // 並行消費需求
)
```

通常實踐：中小型業務從 **3-12 個 Partition** 開始，視吞吐量和 Consumer 數量調整。

---

### Consumer Group 的分區分配策略

Consumer Group 重新平衡時，如何將 Partition 分配給 Consumer Members？

| 策略 | 分配方式 | 特點 |
|------|---------|------|
| **RangeAssignor**（默認） | 按範圍分配：Consumer 按字典序排列，Partition 按序平均切段 | 若 Topic 較少 + Consumer 較多，分配不均 |
| **RoundRobinAssignor** | 輪詢分配所有 Partition | 較均勻，受訂閱的 Topic 影響 |
| **StickyAssignor** | 盡量保留上次的分配結果，最小化移動 | 減少 Rebalance 的分區遷移代價（推薦） |
| **CooperativeStickyAssignor** | 增量式 Rebalance | 只重新分配需要移動的分區，消費不中斷（Kafka 2.4+，**最推薦**） |

配置：
```properties
partition.assignment.strategy=org.apache.kafka.clients.consumer.CooperativeStickyAssignor
```
