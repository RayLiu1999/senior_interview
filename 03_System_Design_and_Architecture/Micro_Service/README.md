# 微服務架構 (Microservices Architecture)

微服務架構是現代分散式系統設計的主流範式之一。作為資深後端工程師，您需要深入理解微服務的設計哲學、常見模式以及在實踐中面臨的挑戰。本章節涵蓋了面試中最常被考察的微服務核心主題。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [單體式架構 vs. 微服務架構](./monolith_vs_microservices.md) | 6 | 5 | `Microservices`, `Architecture`, `Monolith` |
| 2 | [API 閘道器 (API Gateway)](./what_is_api_gateway.md) | 6 | 5 | `Microservices`, `API Gateway`, `Architecture` |
| 3 | [服務探索 (Service Discovery)](./what_is_service_discovery.md) | 7 | 4 | `Microservices`, `Service Discovery`, `Distributed Systems` |
| 4 | [事件驅動的微服務通訊](./event_driven_communication.md) | 7 | 4 | `Microservices`, `Event-Driven`, `Communication` |
| 5 | [分散式交易與 Saga 模式](./distributed_transactions_and_saga_pattern.md) | 8 | 5 | `Microservices`, `Distributed Transactions`, `Saga Pattern` |
| 6 | [斷路器模式 (Circuit Breaker Pattern)](./circuit_breaker_pattern.md) | 7 | 4 | `Microservices`, `Circuit Breaker`, `Resilience` |

---

## 學習建議

1.  **從單體式到微服務**: 先理解單體式架構的局限性，再深入學習微服務如何解決這些問題。
2.  **掌握核心模式**: API Gateway、Service Discovery 和 Circuit Breaker 是微服務架構的三大基石。
3.  **理解分散式挑戰**: 微服務帶來的分散式交易、資料一致性問題是面試的重點考察方向。
4.  **實踐權衡思考**: 微服務不是銀彈，要能清楚說明在什麼場景下應該選擇微服務，什麼時候不應該。
5.  **關注容錯與彈性**: Circuit Breaker、Retry、Timeout 等容錯機制是生產環境微服務的必備知識。
