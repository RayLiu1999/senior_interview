# Kafka

Apache Kafka 是目前最流行的分散式訊息串流平台，被廣泛應用於大數據處理、即時資料管道、事件驅動架構等場景。本章節深入探討 Kafka 的架構、核心概念和實踐應用。

## 問題索引

### 基礎概念

| 問題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [什麼是 Kafka？它的架構和核心概念是什麼？](./what_is_kafka.md) | 6 | 5 | `Kafka`, `訊息佇列`, `分散式系統` |
| [Kafka 的核心組件（Broker、Topic、Partition、Producer、Consumer）](./kafka_core_components.md) | 6 | 5 | `Kafka`, `架構`, `組件` |
| [Kafka 與其他訊息佇列（RabbitMQ、Redis、NATS）的對比](./kafka_vs_other_mq.md) | 7 | 5 | `Kafka`, `RabbitMQ`, `訊息佇列`, `選型` |

### 生產者與消費者

| 問題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Kafka Producer 的工作原理和配置](./kafka_producer.md) | 7 | 4 | `Kafka`, `Producer`, `生產者` |
| [Kafka Consumer 和 Consumer Group 的工作原理](./kafka_consumer.md) | 7 | 5 | `Kafka`, `Consumer`, `消費者群組` |
| [Kafka 的分區策略和負載均衡](./kafka_partitioning_strategy.md) | 7 | 4 | `Kafka`, `分區`, `負載均衡` |
| [Kafka 的消費者重平衡（Rebalance）機制](./kafka_rebalance.md) | 8 | 4 | `Kafka`, `Rebalance`, `重平衡` |

### 可靠性與效能

| 問題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Kafka 如何保證訊息可靠性？](./kafka_message_reliability.md) | 8 | 5 | `Kafka`, `可靠性`, `ACK` |
| [Kafka 的訊息順序性保證](./kafka_message_ordering.md) | 7 | 5 | `Kafka`, `順序性`, `分區` |
| [Kafka 的冪等性和事務](./kafka_idempotence_transactions.md) | 8 | 4 | `Kafka`, `冪等性`, `事務` |
| [Kafka 的效能優化策略](./kafka_performance_optimization.md) | 8 | 4 | `Kafka`, `效能優化`, `調優` |

### 進階主題

| 問題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Kafka 的副本機制和 ISR](./kafka_replication_isr.md) | 8 | 4 | `Kafka`, `副本`, `ISR`, `高可用` |
| [Kafka 的日誌儲存機制](./kafka_log_storage.md) | 7 | 3 | `Kafka`, `儲存`, `日誌` |
| [Kafka 的 ZooKeeper 依賴與 KRaft 模式](./kafka_zookeeper_kraft.md) | 7 | 3 | `Kafka`, `ZooKeeper`, `KRaft` |
| [Kafka Connect 和 Kafka Streams](./kafka_connect_streams.md) | 7 | 3 | `Kafka`, `Connect`, `Streams` |

### 實戰應用

| 問題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Kafka 在實際系統中的應用場景](./kafka_use_cases.md) | 6 | 4 | `Kafka`, `應用場景`, `實踐` |
| [Kafka 叢集的部署和運維](./kafka_cluster_deployment.md) | 8 | 3 | `Kafka`, `部署`, `運維` |
| [Kafka 監控和故障排查](./kafka_monitoring_troubleshooting.md) | 7 | 4 | `Kafka`, `監控`, `故障排查` |

## 學習路徑建議

### 初學者路徑（1-2 週）
1. 理解 Kafka 的基本概念（Topic、Partition、Producer、Consumer）
2. 了解 Kafka 與其他訊息佇列的區別
3. 學習基本的生產者和消費者 API
4. 了解 Kafka 的應用場景

### 進階路徑（2-4 週）
1. 深入理解 Kafka 的分區和副本機制
2. 掌握訊息可靠性保證的方法
3. 學習 Consumer Group 和 Rebalance 機制
4. 理解 Kafka 的效能優化策略

### 專家路徑（1-2 個月）
1. 掌握 Kafka 的冪等性和事務
2. 學習 Kafka 叢集的部署和運維
3. 深入理解 Kafka 的儲存機制
4. 實踐 Kafka Connect 和 Kafka Streams

## Kafka 核心特性

### 1. 高吞吐量
- 每秒處理百萬級訊息
- 順序寫入磁碟，充分利用 Page Cache
- 零拷貝技術減少資料傳輸開銷

### 2. 可擴展性
- 支援水平擴展（增加 Broker）
- 分區機制實現負載均衡
- 動態增加分區和副本

### 3. 持久化
- 訊息持久化到磁碟
- 可配置的資料保留策略
- 支援長期儲存（適合資料重播）

### 4. 高可用性
- 多副本機制保證資料不丟失
- 自動故障轉移
- 支援跨資料中心部署

### 5. 訊息順序
- 在單一分區內保證訊息順序
- 通過分區鍵控制訊息路由

## Kafka 典型架構

```
┌─────────────┐
│  Producer   │ ──┐
└─────────────┘   │
                  │
┌─────────────┐   │  ┌──────────────────────────────┐
│  Producer   │ ──┼─►│      Kafka Cluster           │
└─────────────┘   │  │  ┌────────┐  ┌────────┐     │
                  │  │  │Broker 1│  │Broker 2│     │
┌─────────────┐   │  │  │Topic A │  │Topic A │     │
│  Producer   │ ──┘  │  │Part 0,1│  │Part 2,3│     │
└─────────────┘      │  └────────┘  └────────┘     │
                     │  ┌────────┐  ┌────────┐     │
                     │  │Broker 3│  │ZooKeeper│    │
                     │  │Topic A │  │ Cluster │    │
                     │  │Part 4,5│  │         │    │
                     │  └────────┘  └────────┘     │
                     └──────────────────────────────┘
                                │
                     ┌──────────┴──────────┐
                     │                     │
              ┌──────▼──────┐     ┌───────▼──────┐
              │Consumer      │     │Consumer      │
              │Group A       │     │Group B       │
              │┌───┐  ┌───┐ │     │┌───┐  ┌───┐ │
              ││C1 │  │C2 │ │     ││C3 │  │C4 │ │
              │└───┘  └───┘ │     │└───┘  └───┘ │
              └─────────────┘     └──────────────┘
```

## Kafka vs 其他訊息佇列快速對比

| 特性 | Kafka | RabbitMQ | Redis | NATS |
|------|-------|----------|-------|------|
| **訊息模型** | Pub/Sub, Log | AMQP, 多種模式 | Pub/Sub, List | Pub/Sub |
| **持久化** | 是（預設） | 可選 | 可選 | 可選（JetStream） |
| **吞吐量** | 非常高 | 中等 | 高 | 非常高 |
| **訊息順序** | 分區內保證 | 佇列內保證 | List 保證 | 不保證 |
| **資料重播** | 支援 | 不支援 | 不支援 | 支援（JetStream） |
| **適用場景** | 大數據、日誌、事件流 | 複雜路由、RPC | 快取、計數器 | 輕量級微服務 |
| **學習曲線** | 較陡 | 中等 | 簡單 | 簡單 |

## 實際應用場景

### 1. 日誌聚合
- 收集各服務的日誌
- 統一發送到 Elasticsearch 或資料倉儲
- 支援大量日誌資料的即時處理

### 2. 事件驅動架構
- 服務間通過事件解耦
- 支援事件溯源（Event Sourcing）
- 實現 CQRS 模式

### 3. 資料管道
- 連接不同的資料系統
- ETL 流程的中間層
- 資料同步和複製

### 4. 即時資料流處理
- 使用 Kafka Streams 進行流處理
- 即時指標計算
- 異常檢測

### 5. 訊息佇列
- 非同步任務處理
- 流量削峰
- 解耦系統組件

## 面試重點

Kafka 相關問題在資深後端面試中非常常見，特別是：

1. **架構理解**：Kafka 的核心組件和它們如何協同工作
2. **可靠性**：如何保證訊息不丟失、不重複、有序
3. **效能**：Kafka 為什麼能達到如此高的吞吐量
4. **對比**：Kafka 與其他訊息佇列的優劣勢和選型考量
5. **實踐**：在實際專案中如何使用 Kafka，遇到過什麼問題

建議在準備面試時，結合實際專案經驗，能夠說明：
- 為什麼選擇 Kafka（而不是其他訊息佇列）
- 如何設計 Topic 和分區
- 如何保證訊息的可靠性和順序性
- 遇到過什麼生產環境問題，如何解決

## 相關資源

### 官方資源
- [Apache Kafka 官方文件](https://kafka.apache.org/documentation/)
- [Kafka 設計文件](https://kafka.apache.org/documentation/#design)
- [Confluent 文件](https://docs.confluent.io/)

### 推薦書籍
- 《Kafka 權威指南》（Kafka: The Definitive Guide）
- 《深入理解 Kafka》
- 《Kafka Streams in Action》

### 線上資源
- [Kafka 官方教程](https://kafka.apache.org/quickstart)
- [Confluent Kafka Tutorials](https://kafka-tutorials.confluent.io/)
- [Kafka 源碼解析系列文章](https://github.com/apache/kafka)
