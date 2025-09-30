# Redis (訊息佇列應用)

Redis 除了作為快取和資料庫使用外，也常被用作輕量級的訊息佇列。作為資深後端工程師，您需要理解 Redis Pub/Sub 的特性、限制以及與傳統訊息佇列的差異。本章節涵蓋了面試中最常被考察的 Redis 訊息佇列相關主題。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [Redis Pub/Sub vs. 傳統 MQ (Kafka/RabbitMQ)](./redis_pubsub_vs_traditional_mq.md) | 6 | 4 | `Redis`, `Pub/Sub`, `Message Queue`, `Comparison` |

---

## 學習建議

1.  **理解 Pub/Sub 模型**: Redis Pub/Sub 是基於發布訂閱模式的輕量級訊息傳遞機制。
2.  **認識其限制**: Redis Pub/Sub 不保證訊息持久化，訂閱者離線時會遺失訊息。
3.  **比較適用場景**: 理解 Redis Pub/Sub 適合實時通知等場景，但不適合需要可靠性保證的場景。
4.  **學習替代方案**: Redis Streams 提供了更可靠的訊息佇列功能。
5.  **實踐選型決策**: 能夠根據業務需求選擇 Redis、Kafka、RabbitMQ 等不同的訊息方案。
