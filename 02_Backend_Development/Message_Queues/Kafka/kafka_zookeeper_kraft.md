# Kafka 的 ZooKeeper 依賴與 KRaft 模式

- **難度**: 7
- **重要程度**: 3
- **標籤**: `Kafka`, `ZooKeeper`, `KRaft`, `元資料管理`, `Controller`

## 問題詳述

Kafka 傳統上依賴 **Apache ZooKeeper** 管理叢集元資料（Broker 清單、Topic 配置、Leader 選舉）。從 **Kafka 2.8 預覽、3.3 正式 GA** 的 **KRaft（Kafka Raft）模式**，Kafka 移除了對 ZooKeeper 的依賴，採用基於 Raft 協議的自管理元資料機制。

## 核心理論與詳解

### 傳統架構：ZooKeeper 的角色

```
                        ┌──────────────────┐
  Producers/Consumers   │   ZooKeeper      │  ← 獨立的分散式協調服務
        │               │  - Broker 註冊   │
        │               │  - Controller 選舉│
        ↓               │  - Topic 配置    │
  ┌──────────────────┐  │  - ISR 管理      │
  │   Kafka Cluster  │←─┤  - Consumer 舊版  │
  │  Broker1...BrokerN│  │  Offset 存儲     │
  └──────────────────┘  └──────────────────┘
        │
  Controller Broker（從所有 Broker 中選一個，負責管理 Partition Leader 選舉）
```

**ZooKeeper 模式的問題**：
- **運維複雜性**：需要額外維護 ZooKeeper 叢集（通常 3 或 5 個節點）
- **擴展瓶頸**：ZooKeeper 中存儲所有 Partition 的元資料，百萬級 Partition 時 ZooKeeper 成為瓶頸
- **Controller 選舉延遲**：新 Controller 上任後需要從 ZooKeeper 載入所有元資料，叢集規模大時可能耗時數分鐘
- **兩套系統**：Kafka + ZooKeeper 兩套系統的監控、備份、安全配置需要分開管理

---

### KRaft 模式（Kafka Raft Metadata Mode）

**ZooKeeper 的替代方案**：使用 Kafka 自身的 Raft 協議管理元資料。

**KRaft 架構**：

```
KRaft 模式的 Kafka Cluster：

  ┌─────────────────────────────────────────────────┐
  │                                                  │
  │  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
  │  │ Controller│  │ Controller│  │ Controller │    │  ← 獨立的 Controller 節點
  │  │  Node 1   │  │  Node 2   │  │  Node 3   │    │    （也可與 Broker 共用）
  │  │ (Leader)  │  │(Follower) │  │(Follower) │    │
  │  └───────────┘  └───────────┘  └───────────┘    │
  │         ↓ Raft Log（元資料的 WAL）               │
  │  ┌──────────────────────────────────────────┐   │
  │  │        Broker Nodes (資料節點)            │   │
  │  │  Broker 1, Broker 2, ..., Broker N       │   │
  │  └──────────────────────────────────────────┘   │
  └─────────────────────────────────────────────────┘
```

**KRaft 的優勢**：

| 對比維度 | ZooKeeper 模式 | KRaft 模式 |
|---------|------------|----------|
| 外部依賴 | 需要獨立的 ZooKeeper 叢集 | 無，完全自包含 |
| 元資料存儲 | ZooKeeper ZNode（記憶體） | Kafka 自身的 Event Log |
| 最大 Partition 數 | ~200k（ZK 記憶體限制） | **數百萬**（目標） |
| Controller 故障恢復 | 分鐘級（需重新載入 ZK 元資料） | **秒級**（Raft 快速選舉） |
| 運維複雜度 | 高（兩套系統） | 低（單一系統） |

**KRaft 的成熟度**：
- **Kafka 3.3**：KRaft 正式 GA（Production Ready）
- **Kafka 3.7**：ZooKeeper 模式標記為 Deprecated（不推薦）
- **Kafka 4.0**（預計）：完全移除 ZooKeeper 支援

---

### 遷移建議

**新部署**：直接使用 KRaft 模式（Kafka 3.3+）。

**現有 ZooKeeper 叢集遷移**（Kafka 3.x）：
1. 使用 `kafka-metadata-migration` 工具進行滾動遷移
2. 遷移過程不中斷服務
3. 遷移完成後，關閉 ZooKeeper 節點

```bash
# 初始化 KRaft Cluster ID
kafka-storage.sh random-uuid

# 格式化 KRaft 存儲（Controller 節點）
kafka-storage.sh format -t <cluster-id> -c controller.properties

# 啟動 KRaft 模式的 Kafka
kafka-server-start.sh controller.properties
```
