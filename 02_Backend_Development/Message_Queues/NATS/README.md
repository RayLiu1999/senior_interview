# NATS

NATS 是一個高效能、輕量級的雲原生訊息系統。作為資深後端工程師，您需要理解 NATS 的設計哲學、Core NATS 與 JetStream 的差異，以及其在微服務架構中的應用場景。本章節涵蓋了面試中最常被考察的 NATS 核心主題。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [什麼是 NATS？它的核心設計哲學是什麼？](./what_is_nats.md) | 5 | 4 | `NATS`, `Message Queue`, `Cloud Native` |
| 2 | [NATS 的 Core NATS 和 JetStream 有什麼區別？](./core_nats_vs_jetstream.md) | 6 | 4 | `NATS`, `Core NATS`, `JetStream` |
| 3 | [NATS 如何實現負載平衡？請解釋 Queue Groups 的概念](./load_balancing_with_queue_groups.md) | 6 | 4 | `NATS`, `Queue Groups`, `Load Balancing` |
| 4 | [NATS 與 Kafka、RabbitMQ 的比較](./nats_vs_kafka_vs_rabbitmq.md) | 7 | 4 | `NATS`, `Kafka`, `RabbitMQ`, `Comparison` |

---

## 學習建議

1.  **理解設計哲學**: NATS 強調簡單性、高效能和雲原生，這是其核心競爭力。
2.  **掌握兩種模式**: Core NATS 提供 at-most-once 語義，JetStream 提供持久化和 at-least-once 語義。
3.  **熟悉 Queue Groups**: Queue Groups 是 NATS 實現負載平衡的獨特機制。
4.  **實踐場景選擇**: 理解 NATS 適合輕量級、高吞吐的場景，而非需要複雜路由的場景。
5.  **比較主流方案**: 能夠清楚說明 NATS、Kafka、RabbitMQ 各自的優勢和適用場景。
