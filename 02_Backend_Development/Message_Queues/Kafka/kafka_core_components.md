# Kafka 核心組件：Broker、Topic、Partition、Producer、Consumer

- **難度**: 6
- **重要程度**: 5
- **標籤**: `Kafka`, `Broker`, `Topic`, `Partition`, `Offset`, `架構`

## 問題詳述

深入理解 Kafka 的核心組件是掌握所有高階特性（複製、可靠性、效能）的基礎。Kafka 的設計哲學是「**日誌（Log）是一切的基礎**」，其所有組件都圍繞著分布式、持久化的日誌結構設計。

## 核心理論與詳解

### 整體架構圖

```
┌─────────────────────────────────────────────────────────────────┐
│                        Kafka Cluster                             │
│                                                                  │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐                  │
│  │  Broker 1 │   │  Broker 2 │   │  Broker 3 │                  │
│  │           │   │           │   │           │                  │
│  │ Topic A   │   │ Topic A   │   │ Topic A   │                  │
│  │ Part 0(L) │   │ Part 0(F) │   │ Part 1(L) │ ← L=Leader       │
│  │ Part 1(F) │   │ Part 1(F) │   │ Part 0(F) │   F=Follower     │
│  │ Part 2(F) │   │ Part 2(L) │   │ Part 2(F) │                  │
│  └───────────┘   └───────────┘   └───────────┘                  │
│                                                                  │
│           ↑ ZooKeeper / KRaft 負責選舉 Controller 和 Leader      │
└──────────────────────────────┬──────────────────────────────────┘
                               │
             ┌─────────────────┴───────────────────┐
             ↓                                     ↓
    ┌────────────────┐                   ┌──────────────────┐
    │   Producers    │                   │  Consumer Groups  │
    │ (寫入 Leader)  │                   │  (從 Leader 讀)   │
    └────────────────┘                   └──────────────────┘
```

---

### 核心組件詳解

#### Broker

- Kafka 叢集中的**單一服務節點**（一個 JVM 進程 = 一個 Broker）
- 每個 Broker 有唯一的 `broker.id`
- Broker 之間協調通過 **Controller Broker**（叢集中選出的唯一管理節點）負責：Partition Leader 選舉、Broker 上下線管理

#### Topic

- **邏輯資料流**的命名容器（類似資料庫中的「表」概念）
- 一個 Topic 被物理切分為一個或多個 **Partition**
- 保留策略：`retention.ms`（默認 7 天）或 `retention.bytes`（大小上限）

#### Partition

Partition 是 Kafka **並行性和順序性的關鍵單元**：

- 每個 Partition 是一個**有序、不可變的訊息序列**（Append-only Log）
- Partition 內部的訊息有全局唯一的 **Offset**（64-bit 整數，單調遞增）
- **同一個 Partition 內部保證順序**；跨 Partition 不保證

```
Topic: orders (3 Partitions)

Partition 0: [0:msg_A] [1:msg_C] [2:msg_E] [3:msg_G] → 追加
Partition 1: [0:msg_B] [1:msg_D] [2:msg_F]           → 追加
Partition 2: [0:msg_H] [1:msg_I]                     → 追加
```

**Offset 的意義**：
- 消費者記錄自己消費到哪個 Offset，下次從該位置繼續（Offset Commit）
- Offset 存儲在 Kafka 內部 Topic `__consumer_offsets`（Kafka 0.9+）

#### Leader 與 Follower

- 每個 Partition 有一個 **Leader**（負責所有讀寫）和多個 **Follower**（被動複製）
- Producer 和 Consumer 只與 Leader 交互
- **ISR（In-Sync Replicas）**: 與 Leader 同步延遲在 `replica.lag.time.max.ms` 內的副本集合

---

### Producer 工作原理

Producer 的訊息發送流程：

1. **序列化（Serialization）**：Key + Value 序列化為字節
2. **分區決策（Partitioning）**：
    - 有 Key：`hash(Key) % numPartitions`（同 Key 總是進同一 Partition）
    - 無 Key：輪詢（Round-Robin）或黏性分區（Sticky Partitioner，減少小批次）
3. **累積到批次（RecordAccumulator）**：
    - `batch.size`（默認 16KB）：批次滿了就發送
    - `linger.ms`（默認 0ms）：等待更多訊息填充批次的最大時間
4. **發送到 Broker**：網路線程從 RecordAccumulator 取批次發送

---

### Consumer 工作原理

- Consumer 從 Partition **主動拉取（Pull-based）**（而非 Broker Push）
- **Poll 循環**：`consumer.poll(timeout)` 返回一批記錄
- **Offset 提交**：
    - 自動提交（`enable.auto.commit=true`）：可能重複消費或丟失
    - 手動提交（`commitSync()` / `commitAsync()`）：業務完成後才提交，更安全

---

### Consumer Group

- 同一個 Consumer Group 的多個 Consumer **分工協作**消費一個 Topic
- **同一 Partition 在同一 Group 只有一個 Consumer 消費**
- 若 Group 的 Consumer 數量 > Partition 數量，多出的 Consumer 閒置
- 推論：**Partition 數量 = Consumer Group 的最大有效並行度**

```
Topic orders（3 Partitions）:
Group A（3 consumers）:  Consumer1→Part0, Consumer2→Part1, Consumer3→Part2
Group B（1 consumer）:   Consumer1→Part0+Part1+Part2
Group C（5 consumers）:  Consumer1→Part0, Consumer2→Part1, Consumer3→Part2, Consumer4+5 閒置
```
