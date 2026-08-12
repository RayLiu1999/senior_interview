# 訊息佇列 (Message Queues) - 重點考題 (Quiz)

> 這份考題是從訊息佇列章節中挑選出**重要程度 4-5** 的核心題目，設計成自我測驗的形式。
> 涵蓋 Kafka、RabbitMQ 等主流訊息中間件。
> 
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

## 🚀 Kafka 核心概念

### Q1: Kafka 的架構和核心概念是什麼？
<!-- Concept ID: concept.messaging.kafka.core-components; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明 Kafka 的核心組件：Broker、Topic、Partition、Producer、Consumer。

<details>
<summary>💡 答案提示</summary>

**核心組件**：

- **Broker**：Kafka 伺服器節點，負責儲存和處理訊息
- **Topic**：訊息的邏輯分類（類似資料庫的表）
- **Partition**：Topic 的物理分片，實現並行處理
- **Producer**：訊息生產者
- **Consumer**：訊息消費者
- **Consumer Group**：消費者群組，同一群組內訊息只被消費一次

**關鍵特性**：
- 分區內訊息有序
- 訊息持久化到磁碟
- 支援資料重播
- 高吞吐量（順序寫入 + 零拷貝）

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/Kafka/kafka_core_components.md)

---

### Q2: Kafka 與其他訊息佇列（RabbitMQ、Redis）的對比
<!-- Concept ID: concept.messaging.message-queue.selection; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較 Kafka、RabbitMQ、Redis 訊息佇列的特性和適用場景。

<details>
<summary>💡 答案提示</summary>

| 特性 | Kafka | RabbitMQ | Redis |
|------|-------|----------|-------|
| **訊息模型** | Pub/Sub, Log | AMQP, 多種模式 | Pub/Sub, List |
| **持久化** | 是（預設） | 可選 | 可選 |
| **吞吐量** | 非常高 | 中等 | 高 |
| **訊息順序** | 分區內保證 | 佇列內保證 | List 保證 |
| **資料重播** | 支援 | 不支援 | 不支援 |
| **複雜路由** | 不支援 | 支援（Exchange） | 不支援 |

**選型建議**：
- **Kafka**：大數據、日誌收集、事件流、高吞吐
- **RabbitMQ**：複雜路由、RPC、任務佇列
- **Redis**：輕量場景、快取兼顧、簡單 Pub/Sub

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/Kafka/kafka_vs_other_mq.md)

---

### Q3: Kafka Consumer Group 和 Rebalance 機制
<!-- Concept ID: concept.messaging.kafka.consumer-rebalance; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請解釋 Consumer Group 的工作原理和 Rebalance 觸發時機。

<details>
<summary>💡 答案提示</summary>

**Consumer Group 特性**：
- 同一 Group 內的 Consumer 共享訂閱的 Partition
- 每個 Partition 只能被 Group 內一個 Consumer 消費
- 不同 Group 獨立消費（都能收到完整訊息）

**Rebalance 觸發條件**：
1. Consumer 加入 Group
2. Consumer 離開 Group（崩潰或主動退出）
3. Topic 分區數變化
4. 訂閱的 Topic 變化

**Rebalance 問題**：
- 過程中所有 Consumer 暫停消費
- 可能導致重複消費

**優化方式**：
- 使用 `StickyAssignor` 減少分區移動
- 合理設定 `session.timeout.ms`
- 使用 CooperativeRebalance（增量式再平衡）

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/Kafka/kafka_rebalance.md)

---

### Q4: Kafka 如何保證訊息可靠性？
<!-- Concept ID: concept.messaging.kafka.message-reliability; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請說明 Kafka 的 ACK 機制、副本機制以及如何避免訊息丟失。

<details>
<summary>💡 答案提示</summary>

**Producer ACK 設定**：
- `acks=0`：不等待確認，可能丟失
- `acks=1`：Leader 寫入即確認，Leader 崩潰可能丟失
- `acks=all`：所有 ISR 副本寫入才確認，最可靠

**ISR (In-Sync Replicas)**：
- 與 Leader 保持同步的副本集合
- 落後太多的副本會被踢出 ISR

**避免訊息丟失**：
1. Producer：`acks=all` + `retries` + 冪等
2. Broker：`min.insync.replicas >= 2`
3. Consumer：手動 commit offset

**消費者確保不丟失**：
```
1. 拉取訊息
2. 處理訊息
3. 處理成功後才 commit offset
```

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/Kafka/kafka_message_reliability.md)

---

### Q5: Kafka 的訊息順序性如何保證？
<!-- Concept ID: concept.messaging.kafka.message-ordering; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請解釋 Kafka 如何在分散式環境下保證訊息順序。

<details>
<summary>💡 答案提示</summary>

**Kafka 順序性規則**：
- **單一分區內保證順序**
- 跨分區無法保證全域順序

**保證順序的方法**：

1. **單分區方案**（簡單但失去並行性）
   - 整個 Topic 只有一個 Partition
   - 犧牲吞吐量

2. **業務分區鍵**（推薦）
   - 使用業務 Key（如 user_id）作為分區鍵
   - 相同 Key 的訊息進入同一分區
   - 例：同一用戶的操作有序

3. **Producer 配置**
   - `max.in.flight.requests.per.connection=1`
   - 避免重試導致的亂序
   - 或開啟冪等 Producer

**場景例子**：
- 訂單狀態變更：使用 order_id 作為 Key
- 用戶行為日誌：使用 user_id 作為 Key

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/Kafka/kafka_message_ordering.md)

---

## 🐰 RabbitMQ 核心概念

### Q6: RabbitMQ 的 Exchange 類型有哪些？
<!-- Concept ID: concept.messaging.rabbitmq.exchange-routing; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋 RabbitMQ 的四種 Exchange 類型及其路由規則。

<details>
<summary>💡 答案提示</summary>

| Exchange 類型 | 路由規則 | 使用場景 |
|--------------|----------|----------|
| **Direct** | routing_key 完全匹配 | 點對點、精確路由 |
| **Fanout** | 廣播到所有綁定佇列 | 廣播通知 |
| **Topic** | routing_key 模式匹配（* 和 #） | 多維度訂閱 |
| **Headers** | 根據 headers 屬性匹配 | 複雜條件路由 |

**Topic 萬用字元**：
- `*`：匹配一個單詞
- `#`：匹配零個或多個單詞

**範例**：
```
routing_key: logs.error.payment
- logs.* → 不匹配
- logs.*.payment → 匹配
- logs.# → 匹配
```

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/RabbitMQ/rabbitmq_exchange_types.md)

---

### Q7: RabbitMQ 的訊息確認機制（ACK）
<!-- Concept ID: concept.messaging.rabbitmq.message-acknowledgement; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋 RabbitMQ 的 ack、nack、reject 的區別和使用場景。

<details>
<summary>💡 答案提示</summary>

**消費者確認**：
- `ack`：訊息處理成功，可以刪除
- `nack`：訊息處理失敗，可選擇 requeue
- `reject`：拒絕單條訊息，可選擇 requeue

**確認模式**：
- `autoAck=true`：自動確認，可能丟失
- `autoAck=false`：手動確認，更可靠

**最佳實踐**：
```
1. 接收訊息
2. 處理業務邏輯
3. 成功 → ack
4. 失敗 → nack(requeue=true) 或 發送到死信佇列
```

**Publisher Confirms**（生產者確認）：
- 確保訊息到達 Broker
- Broker 返回 ack/nack

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/RabbitMQ/message_acknowledgement.md)

---

### Q8: 什麼是死信佇列 (DLX)？
<!-- Concept ID: concept.messaging.rabbitmq.dead-letter-exchange; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請解釋 RabbitMQ 死信佇列的概念、觸發條件和應用場景。

<details>
<summary>💡 答案提示</summary>

**死信產生條件**：
1. 訊息被 reject/nack 且 requeue=false
2. 訊息 TTL 過期
3. 佇列達到最大長度

**DLX 配置**：
```
// 在正常佇列上設定
x-dead-letter-exchange: dlx.exchange
x-dead-letter-routing-key: dlx.routing.key
```

**應用場景**：

1. **延遲佇列**
   - 訊息設定 TTL → 過期進入 DLX → 消費者處理
   - 實現定時任務

2. **重試機制**
   - 失敗訊息進入 DLX
   - 等待後重新發回原佇列

3. **錯誤處理**
   - 無法處理的訊息收集起來
   - 人工介入或後續分析

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/RabbitMQ/dead_letter_exchange.md)

---

## 📊 訊息佇列通用問題

### Q9: 如何保證訊息不重複消費（冪等性）？
<!-- Concept ID: concept.messaging.kafka.consumer-idempotence; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請說明在分散式系統中如何實現訊息消費的冪等性。

<details>
<summary>💡 答案提示</summary>

**重複消費原因**：
- 網路抖動導致 ACK 丟失
- Consumer Rebalance
- 生產者重試

**冪等性實現方案**：

1. **唯一識別符 + 去重表**
   ```
   訊息帶 unique_id
   消費前檢查是否已處理
   處理後記錄 unique_id
   ```

2. **資料庫唯一約束**
   - 利用 Primary Key 或 Unique Index
   - 重複插入自動失敗

3. **Redis 去重**
   - `SETNX message_id 1 EX 3600`
   - 成功設定則處理，失敗則跳過

4. **業務邏輯冪等設計**
   - 使用絕對值而非增量
   - `SET balance = 100` 而非 `balance += 10`

5. **版本號/樂觀鎖**
   - 帶版本號更新
   - 版本不匹配則跳過

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/Kafka/kafka_idempotence_transactions.md)

---

### Q10: 如何設計一個訊息佇列系統？
<!-- Concept ID: concept.messaging.message-queue.system-design; Learning Objective IDs: LO-1, LO-2, LO-3 -->
<!-- Article mapping: pending -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🟡 重要

如果要自己設計一個訊息佇列，需要考慮哪些關鍵點？

<details>
<summary>💡 答案提示</summary>

**核心模組**：

1. **通訊協定層**
   - TCP 長連接
   - 自定義協定或 AMQP

2. **儲存層**
   - 訊息持久化
   - 順序寫入提高效能
   - 資料保留策略

3. **消費模型**
   - Push vs Pull
   - Consumer Group
   - Offset 管理

4. **可靠性保證**
   - ACK 機制
   - 副本機制
   - 訊息重試

5. **高可用**
   - 叢集部署
   - 主從切換
   - 負載均衡

6. **監控告警**
   - 堆積監控
   - 消費延遲
   - 錯誤率

**關鍵指標**：
- 吞吐量（TPS）
- 延遲（Latency）
- 可用性（99.99%）
- 資料可靠性

</details>

---

### Q11: Kafka Consumer Offset and Consumer Group Design
<!-- Concept ID: concept.messaging.kafka.consumer-offset; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 Consumer Group、Partition、Poll 與 Offset 的關係，並設計一個不會因非同步處理或 Rebalance 而靜默跳過訊息的提交策略。

<details>
<summary>💡 答案提示</summary>

- 同一 Consumer Group 中一個 Partition 同時只有一個 owner；Group 之間各自維護進度。
- 關閉 auto commit，side effect 成功後才提交；非同步 worker 只能提交每個 Partition 最高的連續完成 offset。
- Rebalance 會造成重放，不會回滾外部 side effect，因此要用冪等處理、inbox 或唯一鍵吸收重複。
- 以 lag、generation、assignment、poll interval、commit failure 與 duplicate event ID 驗證方案。

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/Kafka/kafka_consumer.md)

---

### Q12: Kafka Partitioning Key and Capacity Design
<!-- Concept ID: concept.messaging.kafka.partitioning-strategy; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

如何選擇 Kafka 的 Partition Key 與 Partition 數量，才能同時維持同一業務實體的順序、吞吐量與負載均衡？

<details>
<summary>💡 答案提示</summary>

- 相同 `order_id` 或 `user_id` 進同一 Partition 才有 Kafka 原生的局部順序；跨 Partition 沒有全域順序。
- Partition 數量決定 Consumer Group 的有效並行上限，但 hot key 仍可能使單一 Partition 成為瓶頸。
- 增加 Partition 可能改變 hash 路由；要規劃新 Topic、遷移或版本化 partitioner，不能直接假設歷史事件仍同路由。

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/Kafka/kafka_partitioning_strategy.md)

---

### Q13: Kafka Performance Tuning with Reliability Bounds
<!-- Concept ID: concept.messaging.kafka.performance-tuning; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

Kafka 吞吐量或 P99 延遲惡化時，你會如何區分 Producer、Broker、磁碟、網路與 Consumer 瓶頸，並在可靠性不退化的前提下調優？

<details>
<summary>💡 答案提示</summary>

- 先看 producer batch／compression／request latency、broker network／disk／page cache、consumer fetch／lag／processing time。
- batching 和 compression 通常改善網路與磁碟效率，但可能增加等待延遲或 CPU；Partition 與並行度要配合 key 分布。
- 以固定 workload、P95/P99、lag、ISR、錯誤率和容量上限做前後比較，逐項變更並保留回滾條件。

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/Kafka/kafka_performance_optimization.md)

---

### Q14: Kafka Producer ACK, Retry and Idempotence
<!-- Concept ID: concept.messaging.kafka.producer-delivery; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請比較 Kafka Producer 的 `acks`、`retries`、`enable.idempotence` 與 `max.in.flight.requests.per.connection`，說明它們如何影響遺失、重複、亂序與效能。

<details>
<summary>💡 答案提示</summary>

- `acks=1` 只確認 Leader；`acks=all` 等待當下 ISR，需搭配 `min.insync.replicas` 理解可用性邊界。
- ACK 遺失時 client 無法知道寫入是否成功；無冪等時 retry 可能追加 duplicate，冪等 Producer 只能處理其 PID／Partition／sequence 範圍。
- `max.in.flight` 以吞吐量換取重試排序風險；可靠訂單事件還要監控 retry、timeout、delivery error 與 producer queue。

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/Kafka/kafka_producer.md)

---

### Q15: Kafka Replication, ISR and Failover
<!-- Concept ID: concept.messaging.kafka.replication-isr; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

在 replication factor 為 3、`min.insync.replicas=2` 時，若 Leader 與 Follower 先後故障，Kafka 的 ISR、選主與寫入行為如何變化？

<details>
<summary>💡 答案提示</summary>

- ISR 是目前同步副本集合；`acks=all` 等待當下 ISR，不代表一定等待 RF 的全部副本。
- clean election 只從 ISR 選 Leader；關閉 unclean election 以資料安全換取 ISR 不足時的不可用。
- 要觀察 ISR shrink、under-replicated partitions、leader epoch、HW/LEO 與 producer error，才能判斷 RPO／RTO。

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/Kafka/kafka_replication_isr.md)

---

### Q16: Kafka Fundamentals and Log Model
<!-- Concept ID: concept.messaging.kafka.fundamentals; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請用提交日誌模型說明 Kafka 的 Topic、Partition、Broker、Producer、Consumer、Consumer Group 與 Offset，並指出它與傳統 Broker 佇列的核心差異。

<details>
<summary>💡 答案提示</summary>

- Partition 是可追加、可保留和可重播的順序日誌；Consumer 以 Offset 表示讀取位置。
- Consumer Group 讓多個 Consumer 分攤 Partition，不同 Group 可以獨立重播同一資料。
- Kafka 的選型要同時看吞吐量、保留／重播、局部順序、durability、延遲與操作成本，而非只看 TPS。

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/Kafka/what_is_kafka.md)

---

### Q17: NATS Core and JetStream Durability
<!-- Concept ID: concept.messaging.nats.core-jetstream-durability; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

Core NATS 與 JetStream 在 delivery guarantee、持久化、ack、重播和故障恢復上有何差異？何時不能只使用 Core NATS？

<details>
<summary>💡 答案提示</summary>

- Core NATS 是即時 at-most-once；離線訂閱者不會得到歷史訊息。JetStream 以 Stream/Consumer 提供持久化、ack、重播和至少一次語義。
- JetStream 未收到 ack 可能重送，因此 consumer 仍要冪等；retention、replica、storage type 與容量需一起設計。
- 訂單、支付等不能靜默遺失的事件應使用 JetStream 或其他持久化 MQ，而不是用 Core NATS 的低延遲掩蓋可靠性缺口。

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/NATS/core_nats_vs_jetstream.md)

---

### Q18: NATS Queue Groups and Load Balancing
<!-- Concept ID: concept.messaging.nats.queue-groups-load-balancing; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

NATS Queue Groups 如何在多個服務實例間分配訊息？它和廣播 Pub/Sub、JetStream durable consumer 的責任邊界是什麼？

<details>
<summary>💡 答案提示</summary>

- 同一 Queue Group 中一則訊息只交付一個成員；不同 Queue Group 可各自收到一份，形成群組級廣播。
- Core NATS Queue Group 是即時分流，不自動提供離線重播或可靠 ack；需要持久化和 redelivery 時使用 JetStream Consumer。
- 要觀察 subscriber latency、queue depth、重連與 hot subject，並針對慢成員設計 backpressure 和擴展策略。

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/NATS/load_balancing_with_queue_groups.md)

---

### Q19: Message Platform Selection: Kafka, RabbitMQ and NATS
<!-- Concept ID: concept.messaging.nats.platform-selection; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

面對即時通知、可靠任務、事件串流與複雜路由需求，如何比較並選擇 Kafka、RabbitMQ、Core NATS 或 JetStream？

<details>
<summary>💡 答案提示</summary>

- 以 delivery semantics、durability、replay、routing、ordering、backpressure、latency 和 operational burden 建立需求矩陣。
- Kafka 偏持久化分區日誌；RabbitMQ 偏 Broker routing/ack；Core NATS 偏低延遲即時訊息；JetStream 補上持久化和重播。
- 選型必須包含故障退化、容量上限、遷移成本、監控和重試／DLQ，而不是用單一吞吐量數字決定。

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/NATS/nats_vs_kafka_vs_rabbitmq.md)

---

### Q20: NATS Core Architecture and Delivery Semantics
<!-- Concept ID: concept.messaging.nats.core-architecture; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請說明 NATS 的 Subject、Pub/Sub、Request-Reply 與 Queue Group，以及 Performance、Simplicity、Security 設計哲學如何影響可靠性選擇。

<details>
<summary>💡 答案提示</summary>

- Subject 是路由名稱；Pub/Sub 可廣播，Request-Reply 透過 reply subject 回傳，Queue Group 則在服務實例間分流。
- Core NATS 追求低延遲和簡單性，傳遞是 at-most-once；不可遺失事件要切到 JetStream 或持久化 MQ。
- Security、授權、TLS、連線與重連行為也是 production 邊界，不能只討論 API。

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/NATS/what_is_nats.md)

---

### Q21: RabbitMQ and Kafka Selection
<!-- Concept ID: concept.messaging.rabbitmq.kafka-selection; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請從訊息模型、路由、確認、重播、吞吐量、延遲與運維角度比較 RabbitMQ 和 Kafka，並為任務佇列與事件平台分別做決策。

<details>
<summary>💡 答案提示</summary>

- RabbitMQ 由 Exchange 路由到 Queue，Broker 追蹤 ack；Kafka 以 Partition log 和 Consumer Offset 支援保留、重播與高吞吐。
- RabbitMQ 適合複雜 routing、工作佇列和低延遲單則交付；Kafka 適合事件串流、資料管道和多個獨立下游。
- 兩者都需要明確處理 retry、DLQ／重播、冪等 side effect、backpressure、容量和故障轉移。

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/RabbitMQ/rabbitmq_vs_kafka.md)

---

### Q22: RabbitMQ Core Architecture
<!-- Concept ID: concept.messaging.rabbitmq.core-architecture; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請追蹤一則 RabbitMQ 訊息從 Producer、Exchange、Binding 到 Queue、Consumer 的流程，並說明可靠性需要哪些確認與持久化邊界。

<details>
<summary>💡 答案提示</summary>

- Producer 發到 Exchange，Exchange 依 routing key 和 Binding 將訊息送入 Queue，Consumer 從 Queue 取得並在 side effect 成功後 ack。
- Publisher Confirm、durable exchange/queue/message、prefetch、manual ack、requeue 和 DLX 分別解決不同故障面。
- `autoAck`、未匹配 route、無限 requeue 和 consumer crash 都可能造成遺失、重複或資源耗盡。

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/RabbitMQ/what_is_rabbitmq.md)

---

### Q23: Redis Pub/Sub Delivery and Capacity Trade-offs
<!-- Concept ID: concept.messaging.redis.pubsub-delivery-tradeoffs; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

Redis Pub/Sub 的即時性換掉了哪些可靠性能力？若通知遺失不可接受，應如何改用回補 API、Redis Streams 或 Kafka/RabbitMQ？

<details>
<summary>💡 答案提示</summary>

- Pub/Sub 是當下廣播的 at-most-once；訂閱者離線、連線中斷或消費速度不足時沒有歷史 replay、ack 或 DLQ。
- 若訊息是可重新查詢的通知，可用版本／游標和 API 回補；若是必須處理的任務，改用 Redis Streams、Kafka 或 RabbitMQ。
- 需要一起評估記憶體、慢訂閱者、發布尖峰、backpressure、容量上限與故障後恢復時間。

</details>

📖 [查看完整答案](../02_Backend_Development/Message_Queues/Redis/redis_pubsub_vs_traditional_mq.md)

---

## 📊 學習進度檢核

完成以上題目後，請自我評估：

| 評估項目 | 自評 |
|----------|------|
| 理解 Kafka 核心架構 | ⬜ |
| 能比較 Kafka vs RabbitMQ | ⬜ |
| 理解 Consumer Group 和 Rebalance | ⬜ |
| 掌握 Kafka 可靠性保證 | ⬜ |
| 理解 Kafka 順序性保證 | ⬜ |
| 熟悉 RabbitMQ Exchange 類型 | ⬜ |
| 理解訊息確認機制 | ⬜ |
| 了解死信佇列用途 | ⬜ |
| 能設計冪等消費方案 | ⬜ |

**建議**：未能完整回答的題目，請回到對應的詳細文章深入學習。
