# 訊息佇列 (Message Queues) - 重點考題 (Quiz)

> 這份考題是從訊息佇列章節中挑選出**重要程度 4-5** 的核心題目，設計成自我測驗的形式。
> 涵蓋 Kafka、RabbitMQ 等主流訊息中間件。
> 
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

## 🚀 Kafka 核心概念

### Q1: Kafka 的架構和核心概念是什麼？

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
