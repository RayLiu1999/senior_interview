# Kafka 如何保證訊息可靠性？

- **難度**: 8
- **重要程度**: 5
- **標籤**: `Kafka`, `可靠性`, `ACK`, `副本`, `冪等性`

## 問題詳述

在分散式訊息系統中，訊息可靠性是最核心的問題之一。Kafka 通過多種機制保證訊息不丟失、不重複和有序傳遞。理解這些機制及其權衡，是掌握 Kafka 的關鍵。

## 核心理論與詳解

### 訊息可靠性的三個層面

1. **不丟失（No Data Loss）**：發送的訊息一定能夠被消費
2. **不重複（Exactly Once）**：訊息只被處理一次
3. **有序（Ordering）**：訊息按照發送順序被消費

在分散式系統中，完美同時實現這三者是困難的，通常需要根據業務場景進行權衡。

---

### Producer 端的可靠性保證

#### 1. ACK 機制（Acknowledgement）

Producer 可以配置 `acks` 參數來控制可靠性等級。

**三種 ACK 模式**：

##### acks = 0（不等待確認）

```
Producer                Broker (Leader)
   │                         │
   ├─ 發送訊息 ─────────────►│
   │                         │
   ├─ 立即返回 ◄─────────────┤
   │ (不等待確認)             │
```

**特性**：
- **吞吐量**：最高
- **延遲**：最低
- **可靠性**：最差（訊息可能丟失）

**適用場景**：
- 日誌收集（可容忍少量丟失）
- Metrics 資料（可容忍少量丟失）
- 對延遲極度敏感的場景

##### acks = 1（Leader 確認）

```
Producer                Broker (Leader)              Follower
   │                         │                          │
   ├─ 發送訊息 ─────────────►│                          │
   │                         ├─ 寫入本地 Log             │
   │                         │                          │
   ├─ 返回 ACK ◄─────────────┤                          │
   │                         │                          │
   │                         ├─ 複製到 Follower ────────►│
```

**特性**：
- **吞吐量**：高
- **延遲**：中等
- **可靠性**：中等（Leader 確認後可能丟失）

**風險**：Leader 確認後崩潰，訊息尚未複製到 Follower，會導致訊息丟失。

##### acks = all（或 acks = -1）（所有 ISR 確認）

**特性**：
- **吞吐量**：較低
- **延遲**：較高
- **可靠性**：最高（訊息不丟失）

**適用場景**：
- 金融交易
- 訂單處理
- 關鍵業務資料

**關鍵配置**：

```properties
# Producer 端
acks=all

# Broker 端
min.insync.replicas=2  # 至少 2 個副本同步成功才確認
```

**ISR（In-Sync Replicas）**：

ISR 是與 Leader 保持同步的副本集合。當 `acks=all` 時，只需 ISR 中的副本確認即可。

---

### 完整的可靠性配置

#### 高可靠性配置（金融、訂單等）

**Producer**：

```properties
# 冪等性和事務
enable.idempotence=true
transactional.id=my-app-id

# ACK
acks=all

# 重試
retries=Integer.MAX_VALUE
max.in.flight.requests.per.connection=5

# 壓縮（可選）
compression.type=lz4
```

**Broker**：

```properties
# 副本
default.replication.factor=3
min.insync.replicas=2

# 不允許 Unclean Leader Election
unclean.leader.election.enable=false
```

**Consumer**：

```properties
# 手動提交
enable.auto.commit=false

# 隔離級別
isolation.level=read_committed
```

---

### 常見面試問題

#### Q1：Kafka 如何保證訊息不丟失？

**回答要點**：
- **Producer**: `acks=all` + `retries` + `enable.idempotence=true`
- **Broker**: `replication.factor>=3` + `min.insync.replicas>=2`
- **Consumer**: 手動提交 Offset，處理成功後才提交
- 禁用 Unclean Leader Election

#### Q2：acks=all 和 min.insync.replicas 有什麼關係？

**回答要點**：
- `acks=all` 要求所有 ISR 副本確認
- `min.insync.replicas=2` 要求 ISR 至少有 2 個副本
- 兩者配合使用：確保訊息至少被 2 個副本持久化

#### Q3：如何實現 Exactly-Once 語義？

**回答要點**：
- Producer 端啟用冪等性（`enable.idempotence=true`）
- 使用事務 API（`transactional.id`）
- Consumer 端設置 `isolation.level=read_committed`
- 只在 Kafka 生態內有效（讀 Kafka → 寫 Kafka）

---

## 總結

Kafka 的可靠性保證是多層次的：

1. **Producer 端**：ACK 機制、重試、冪等性
2. **Broker 端**：副本機制、ISR、持久化
3. **Consumer 端**：Offset 管理、At-Least-Once/Exactly-Once

在實踐中，需要根據業務需求在**可靠性**、**效能**和**成本**之間做出權衡。理解這些機制及其權衡，是資深後端工程師必備的技能。
