# RabbitMQ

RabbitMQ 是最流行的開源訊息佇列之一，基於 AMQP 協定。作為資深後端工程師，您需要深入理解 RabbitMQ 的核心概念、訊息路由機制以及如何保證訊息的可靠性。本章節涵蓋了面試中最常被考察的 RabbitMQ 核心主題。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [什麼是 RabbitMQ？它解決了什麼問題？](./what_is_rabbitmq.md) | 5 | 5 | `RabbitMQ`, `Message Queue`, `AMQP` |
| 2 | [RabbitMQ Exchange 類型詳解：Direct, Fanout, Topic, Headers](./rabbitmq_exchange_types.md) | 6 | 5 | `RabbitMQ`, `Exchange`, `Routing` |
| 3 | [RabbitMQ 的訊息確認機制：ack, nack, reject](./message_acknowledgement.md) | 6 | 5 | `RabbitMQ`, `ACK`, `Reliability` |
| 4 | [RabbitMQ 的死信交換機 (Dead-Letter-Exchange, DLX)](./dead_letter_exchange.md) | 7 | 4 | `RabbitMQ`, `DLX`, `Dead Letter Queue` |
| 5 | [RabbitMQ vs. Kafka：如何選擇？](./rabbitmq_vs_kafka.md) | 7 | 4 | `RabbitMQ`, `Kafka`, `Comparison` |

---

## 學習建議

1.  **掌握基本架構**: Exchange、Queue、Binding、Virtual Host 等概念是理解 RabbitMQ 的基礎。
2.  **理解路由機制**: Direct、Topic、Fanout、Headers 四種 Exchange 類型各有不同的路由邏輯。
3.  **關注可靠性**: 訊息確認、持久化、Publisher Confirms 是保證訊息不遺失的關鍵機制。
4.  **學習進階特性**: 死信佇列、優先佇列、延遲佇列等是解決複雜場景的有力工具。
5.  **實踐比較分析**: 理解 RabbitMQ 與 Kafka 的差異，能夠根據場景做出合理選擇。
