# 什麼是 Kafka？它的架構和核心概念是什麼？

- **難度**: 6
- **重要程度**: 5
- **標籤**: `Kafka`, `訊息佇列`, `分散式系統`, `事件流`

## 問題詳述

Apache Kafka 是目前最流行的分散式事件流平台，被廣泛應用於構建即時資料管道和流應用程式。理解 Kafka 的架構、核心概念和設計哲學，是掌握現代後端系統的關鍵。

## 核心理論與詳解

### Kafka 簡介

**Apache Kafka** 是一個開源的分散式事件流平台（Distributed Event Streaming Platform），最初由 LinkedIn 開發，於 2011 年開源，現在是 Apache 軟體基金會的頂級專案。

#### 核心定位

Kafka 將自己定位為「事件流平台」而非傳統的「訊息佇列」，因為它具備以下特性：

1. **發布和訂閱**：類似傳統訊息佇列
2. **儲存**：可靠地儲存事件流（訊息）
3. **處理**：即時處理事件流

#### 核心特性

1. **高吞吐量**：
   - 單機可達 **百萬級 TPS**（每秒事務數）
   - 線性擴展，增加機器即可提升吞吐量

2. **持久化**：
   - 所有訊息持久化到磁碟
   - 支援長期儲存（數天、數月甚至永久）
   - 支援資料重播（Replay）

3. **低延遲**：
   - 毫秒級延遲
   - 適合即時應用

4. **高可用**：
   - 分散式架構
   - 資料複製（Replication）
   - 自動故障轉移

5. **水平擴展**：
   - 叢集可動態擴展
   - 無需停機

---

### Kafka 的核心概念

#### 1. Broker（代理伺服器）

**Broker** 是 Kafka 叢集的基本單位，每個 Broker 是一個 Kafka 伺服器實例。

**職責**：
- 接收來自 Producer 的訊息
- 將訊息持久化到磁碟
- 響應 Consumer 的拉取請求
- 管理分區和副本

**叢集架構**：

```
┌──────────────────────────────────┐
│        Kafka Cluster             │
│  ┌────────┐  ┌────────┐         │
│  │Broker 1│  │Broker 2│         │
│  │  9092  │  │  9092  │         │
│  └────────┘  └────────┘         │
│  ┌────────┐  ┌────────┐         │
│  │Broker 3│  │Broker 4│         │
│  │  9092  │  │  9092  │         │
│  └────────┘  └────────┘         │
└──────────────────────────────────┘
         ▲
         │ 管理和協調
         │
   ┌─────┴──────┐
   │ ZooKeeper  │
   │  Cluster   │
   └────────────┘
```

**關鍵特性**：
- 每個 Broker 有唯一的 ID
- 無主從之分，所有 Broker 地位平等
- 通過 **Controller**（從 Broker 中選出）進行叢集管理

#### 2. Topic（主題）

**Topic** 是訊息的邏輯分類，類似資料庫中的「表」或檔案系統中的「目錄」。

**特性**：
- 一個 Topic 可以有多個生產者和消費者
- Topic 內的訊息有序（在分區層級）
- 訊息一旦發布就不可變（Immutable）

**命名慣例**：
```
user-events
order-created
payment-completed
logs-application
```

#### 3. Partition（分區）

**Partition** 是 Topic 的物理分割單位，是 Kafka **並行處理和擴展的基礎**。

**為什麼需要分區？**

假設沒有分區，一個 Topic 的所有訊息都在一個檔案中：

❌ **問題**：
- 單檔案大小受限
- 無法並行讀寫
- 無法水平擴展

✅ **解決方案**：將 Topic 拆分為多個 Partition。

**分區架構**：

```
Topic: user-events (3 個分區)

Partition 0:  [msg0] [msg3] [msg6] [msg9]  ...
Partition 1:  [msg1] [msg4] [msg7] [msg10] ...
Partition 2:  [msg2] [msg5] [msg8] [msg11] ...

分布在不同 Broker：
Broker 1: Partition 0
Broker 2: Partition 1
Broker 3: Partition 2
```

**分區的特性**：

1. **有序性**：
   - 每個分區內的訊息**嚴格有序**
   - 但跨分區無法保證順序

2. **Offset（偏移量）**：
   - 每個訊息在分區中有唯一的 **Offset**
   - Offset 是遞增的序列號（0, 1, 2, 3...）
   - Consumer 通過 Offset 追蹤已消費的位置

```
Partition 0:
Offset:  0    1    2    3    4    5
        [A]  [B]  [C]  [D]  [E]  [F]
         └─────────┘
         已消費（Committed Offset = 2）
                      └──────────┘
                      未消費
```

3. **並行處理**：
   - 多個 Consumer 可以並行消費不同分區
   - 分區數決定了最大並行度

4. **資料儲存**：
   - 每個分區對應磁碟上的一個目錄
   - 目錄中包含多個 **Segment 檔案**

#### 4. Replica（副本）

**Replica** 是分區的複製副本，用於**容錯和高可用**。

**副本架構**：

```
Topic: orders, Partition 0, Replication Factor = 3

┌─────────────────────────────────────┐
│ Broker 1                            │
│ ┌─────────────────────────────────┐ │
│ │ Partition 0 (Leader)            │ │  ← 處理讀寫請求
│ │ [msg0] [msg1] [msg2] [msg3]     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Broker 2                            │
│ ┌─────────────────────────────────┐ │
│ │ Partition 0 (Follower)          │ │  ← 同步資料
│ │ [msg0] [msg1] [msg2] [msg3]     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Broker 3                            │
│ ┌─────────────────────────────────┐ │
│ │ Partition 0 (Follower)          │ │  ← 同步資料
│ │ [msg0] [msg1] [msg2] [msg3]     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Leader 和 Follower**：

- **Leader Replica**：
  - 處理所有的讀寫請求
  - 每個分區只有一個 Leader
  
- **Follower Replica**：
  - 從 Leader 複製資料
  - 不處理客戶端請求
  - Leader 故障時，從 Follower 中選舉新的 Leader

**ISR（In-Sync Replicas）**：

- 與 Leader 保持同步的副本集合
- 包括 Leader 本身
- 只有在 ISR 中的副本才能被選為新的 Leader

```
Partition 0:
├─ Leader: Broker 1 (Offset: 1000)
├─ Follower 1: Broker 2 (Offset: 1000) → 在 ISR 中
├─ Follower 2: Broker 3 (Offset: 950)  → 落後太多，不在 ISR 中
└─ ISR = [Broker 1, Broker 2]
```

#### 5. Producer（生產者）

**Producer** 負責發布訊息到 Kafka Topic。

**工作流程**：

```
Producer
   │
   ├─ 1. 創建訊息（Key, Value）
   │
   ├─ 2. 選擇分區（Partitioner）
   │       - 如果指定了 Partition，直接使用
   │       - 如果指定了 Key，使用 hash(Key) % num_partitions
   │       - 如果都沒指定，使用輪詢（Round-robin）
   │
   ├─ 3. 序列化（Serializer）
   │       - 將 Key/Value 轉換為 byte[]
   │
   ├─ 4. 加入批次（Batch）
   │       - 同一分區的訊息批次發送，提高效率
   │
   ├─ 5. 發送到 Broker
   │       - 發送到對應分區的 Leader
   │
   └─ 6. 接收 ACK
           - acks=0: 不等待確認（最快但可能丟失）
           - acks=1: Leader 確認（平衡）
           - acks=all: 所有 ISR 確認（最可靠但最慢）
```

**訊息結構**：

```
Message:
├─ Key (可選): 用於分區路由
├─ Value: 訊息內容
├─ Timestamp: 時間戳
├─ Headers: 鍵值對元資料
└─ Partition: 目標分區（可選）
```

#### 6. Consumer（消費者）

**Consumer** 從 Kafka Topic 訂閱並處理訊息。

**工作原理**：

```
Consumer
   │
   ├─ 1. 訂閱 Topic
   │       consumer.subscribe(["user-events"])
   │
   ├─ 2. 拉取訊息（Pull Model）
   │       records = consumer.poll(timeout)
   │
   ├─ 3. 反序列化
   │       將 byte[] 轉換回原始資料
   │
   ├─ 4. 處理訊息
   │       業務邏輯處理
   │
   └─ 5. 提交 Offset
           consumer.commitSync()  // 同步提交
           consumer.commitAsync() // 非同步提交
```

**Offset 管理**：

Consumer 需要追蹤已消費的位置（Offset）：

```
Topic: orders, Partition 0

Offset:  0    1    2    3    4    5    6    7
        [A]  [B]  [C]  [D]  [E]  [F]  [G]  [H]
                      ▲
                      └─ Current Offset = 3
                         （Consumer 將從 Offset 3 開始消費）
```

**Offset 儲存**：
- Kafka 0.9 之前：儲存在 ZooKeeper
- Kafka 0.9 之後：儲存在 Kafka 內部 Topic `__consumer_offsets`

#### 7. Consumer Group（消費者群組）

**Consumer Group** 是 Kafka 實現**擴展性和容錯性**的關鍵機制。

**核心規則**：
- 一個分區只能被同一個 Consumer Group 中的一個 Consumer 消費
- 不同 Consumer Group 可以獨立消費同一個 Topic

**範例場景**：

```
Topic: user-events (4 個分區)
Partition 0, 1, 2, 3

Consumer Group A (2 個 Consumer):
├─ Consumer A1: 消費 Partition 0, 1
└─ Consumer A2: 消費 Partition 2, 3

Consumer Group B (4 個 Consumer):
├─ Consumer B1: 消費 Partition 0
├─ Consumer B2: 消費 Partition 1
├─ Consumer B3: 消費 Partition 2
└─ Consumer B4: 消費 Partition 3

Consumer Group C (1 個 Consumer):
└─ Consumer C1: 消費 Partition 0, 1, 2, 3
```

**分區分配策略**：

1. **Range（範圍）**：
   - 按範圍分配分區
   - 可能導致不均衡

2. **Round-robin（輪詢）**：
   - 循環分配分區
   - 較為均衡

3. **Sticky（黏性）**：
   - 盡量保持原有分配
   - 減少 Rebalance 開銷

**Rebalance（重平衡）**：

當 Consumer Group 中的 Consumer 數量變化時，會觸發 Rebalance：

```
初始狀態：
Consumer1 → Partition 0, 1
Consumer2 → Partition 2, 3

Consumer3 加入 →  觸發 Rebalance

新分配：
Consumer1 → Partition 0
Consumer2 → Partition 1, 2
Consumer3 → Partition 3
```

**Rebalance 的影響**：
- 短暫停止消費（Stop-the-World）
- 可能導致重複消費
- 應盡量避免頻繁 Rebalance

---

### Kafka 的架構設計

#### 完整的架構圖

```
┌──────────────────────────────────────────────────────────┐
│                      Producers                            │
│     ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│     │Producer 1│  │Producer 2│  │Producer 3│           │
│     └─────┬────┘  └─────┬────┘  └─────┬────┘           │
└───────────┼─────────────┼─────────────┼─────────────────┘
            │             │             │
            └─────────────┼─────────────┘
                          ▼
      ┌───────────────────────────────────────────────────┐
      │             Kafka Cluster                         │
      │  ┌──────────────────────────────────────────────┐│
      │  │            ZooKeeper Cluster                 ││
      │  │  (管理元資料、Controller 選舉、配置)          ││
      │  └──────────────────────────────────────────────┘│
      │                                                    │
      │  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
      │  │  Broker 1   │  │  Broker 2   │  │ Broker 3 │ │
      │  │             │  │             │  │          │ │
      │  │ Topic A     │  │ Topic A     │  │ Topic B  │ │
      │  │ Part 0 (L)  │  │ Part 1 (L)  │  │ Part 0(L)│ │
      │  │ Part 1 (F)  │  │ Part 0 (F)  │  │ Part 1(F)│ │
      │  │             │  │             │  │          │ │
      │  └─────────────┘  └─────────────┘  └──────────┘ │
      │       L = Leader, F = Follower                    │
      └───────────────────────────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
┌───────────▼────────┐     ┌────────────▼──────────┐
│ Consumer Group A   │     │ Consumer Group B      │
│  ┌───────────────┐ │     │  ┌─────────────────┐ │
│  │  Consumer 1   │ │     │  │   Consumer 1    │ │
│  └───────────────┘ │     │  └─────────────────┘ │
│  ┌───────────────┐ │     │  ┌─────────────────┐ │
│  │  Consumer 2   │ │     │  │   Consumer 2    │ │
│  └───────────────┘ │     │  └─────────────────┘ │
└────────────────────┘     └─────────────────────┘
```

#### 資料流向

**寫入流程**：

```
1. Producer 發送訊息
   ↓
2. 路由到指定分區的 Leader Broker
   ↓
3. Leader 寫入本地 Log
   ↓
4. Follower 從 Leader 拉取資料並寫入本地 Log
   ↓
5. Leader 收到足夠的 ISR 確認後回覆 Producer
   ↓
6. Producer 收到 ACK
```

**讀取流程**：

```
1. Consumer 發送 Fetch 請求到 Leader Broker
   ↓
2. Leader 從本地 Log 讀取資料
   ↓
3. 回傳訊息給 Consumer
   ↓
4. Consumer 處理訊息
   ↓
5. Consumer 提交 Offset 到 Kafka（__consumer_offsets Topic）
```

---

### Kafka 的儲存機制

#### Log Segment

每個分區的資料以 **Segment** 為單位儲存：

```
/kafka-logs/
  └─ user-events-0/          (Topic: user-events, Partition: 0)
      ├─ 00000000000000000000.log      (Segment 1)
      ├─ 00000000000000000000.index    (索引檔案)
      ├─ 00000000000000100000.log      (Segment 2)
      ├─ 00000000000000100000.index
      ├─ 00000000000000200000.log      (Segment 3, Active)
      └─ 00000000000000200000.index
```

**Segment 特性**：

1. **滾動策略**：
   - 當 Segment 大小達到閾值（如 1GB）
   - 或時間達到閾值（如 7 天）
   - 創建新的 Segment

2. **只有最新的 Segment 是 Active（可寫入）**

3. **舊的 Segment 是 Immutable（不可變）**

#### 順序寫入

Kafka 的高效能關鍵之一是**順序寫入磁碟**：

```
傳統隨機寫入：
Seek → Write → Seek → Write → Seek → Write  (慢)

Kafka 順序寫入：
Write → Write → Write → Write → Write  (快，接近記憶體速度)
```

**為什麼順序寫入快？**
- 現代磁碟順序寫入速度可達 **600 MB/s**
- 隨機寫入只有 **100 KB/s** 左右
- 充分利用作業系統的 **Page Cache**

#### Zero-Copy（零拷貝）

Kafka 使用 **sendfile** 系統調用實現零拷貝：

**傳統方式**（4 次拷貝）：
```
1. Disk → Kernel Buffer (DMA)
2. Kernel Buffer → Application Buffer (CPU)
3. Application Buffer → Socket Buffer (CPU)
4. Socket Buffer → NIC (DMA)
```

**零拷貝方式**（2 次拷貝）：
```
1. Disk → Kernel Buffer (DMA)
2. Kernel Buffer → NIC (DMA)
```

減少 CPU 拷貝和上下文切換，大幅提升效能。

---

### ZooKeeper 的角色

**ZooKeeper** 在 Kafka 中扮演重要角色（Kafka 3.0+ 可選，使用 KRaft 模式替代）：

**職責**：

1. **Broker 註冊**：
   - 記錄活躍的 Broker
   - Broker 故障時自動移除

2. **Controller 選舉**：
   - 從 Broker 中選舉 Controller
   - Controller 負責分區 Leader 選舉和元資料管理

3. **Topic 配置**：
   - 儲存 Topic、分區、副本的配置資訊

4. **ACL 和配額**：
   - 儲存訪問控制和配額配置

**ZooKeeper 架構**：

```
┌────────────────────────────┐
│   ZooKeeper Ensemble       │
│  ┌──────┐  ┌──────┐       │
│  │ ZK 1 │  │ ZK 2 │       │
│  │Leader│  │Follow│       │
│  └──────┘  └──────┘       │
│       ┌──────┐             │
│       │ ZK 3 │             │
│       │Follow│             │
│       └──────┘             │
└────────────────────────────┘
         ▲
         │ 讀取元資料、監聽變化
         │
┌────────┴────────────────────┐
│    Kafka Broker Cluster     │
└─────────────────────────────┘
```

**KRaft 模式**（Kafka 3.0+）：

- 移除對 ZooKeeper 的依賴
- 使用 Kafka 內建的 Raft 共識協議
- 簡化架構和運維
- 提升元資料操作效能

---

### Kafka 的應用場景

#### 1. 訊息佇列

替代傳統 MQ（如 RabbitMQ）：
- 非同步處理
- 服務解耦
- 流量削峰

#### 2. 日誌聚合

收集和傳輸日誌：
```
應用服務 → Kafka → Elasticsearch/S3
```

#### 3. 事件流處理

即時處理資料流：
```
IoT 感測器 → Kafka → Kafka Streams → 資料庫
```

#### 4. 資料管道

連接不同系統：
```
MySQL → Debezium (CDC) → Kafka → Data Warehouse
```

#### 5. Metrics 聚合

收集監控指標：
```
應用 → Kafka → Prometheus/InfluxDB
```

---

### 常見面試問題

#### Q1：Kafka 為什麼這麼快？

**回答要點**：
- **順序寫入**：充分利用磁碟順序寫入的高效能
- **零拷貝**：減少 CPU 拷貝和上下文切換
- **批次處理**：批次發送和批次寫入
- **分區並行**：多分區並行讀寫
- **頁快取**：利用作業系統的 Page Cache

#### Q2：Kafka 和 RabbitMQ 有什麼區別？

**回答要點**：
- **訊息模型**：Kafka 是 Log-based，RabbitMQ 是 Queue-based
- **持久化**：Kafka 預設持久化，RabbitMQ 可選
- **吞吐量**：Kafka 更高（百萬級 vs 萬級）
- **資料重播**：Kafka 支援，RabbitMQ 不支援
- **順序性**：Kafka 分區內有序，RabbitMQ 佇列內有序
- **適用場景**：Kafka 適合大數據、日誌，RabbitMQ 適合複雜路由

#### Q3：Kafka 如何保證訊息不丟失？

**回答要點**：
- **Producer**：設置 `acks=all`，確保所有 ISR 確認
- **Broker**：設置 `replication.factor >= 3` 和 `min.insync.replicas >= 2`
- **Consumer**：處理完訊息後再提交 Offset
- 禁用 `auto.commit`，使用手動提交

---

## 總結

Kafka 是現代分散式系統的核心組件，其核心優勢包括：

1. **高吞吐量**：通過順序寫入、零拷貝、批次處理實現
2. **可擴展性**：通過分區實現水平擴展
3. **持久化**：所有訊息持久化，支援資料重播
4. **高可用**：通過副本機制保證資料安全

理解 Kafka 的核心概念（Topic、Partition、Replica、Producer、Consumer、Consumer Group）和架構設計，是掌握現代後端系統的關鍵，也是資深後端面試的必考內容。

在實際使用中，需要根據業務需求合理設計 Topic 和分區數量，平衡可靠性和效能，並監控叢集的健康狀態。
