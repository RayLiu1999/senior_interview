# 軟體架構 (Software Architecture)

軟體架構是構建可擴展、可維護且具彈性系統的基礎。作為資深後端工程師，您需要深入理解各種架構模式、設計原則以及在分散式系統中的權衡取捨。本章節涵蓋了面試中最常被考察的軟體架構核心主題。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [常見的軟體架構模式](./common_software_architecture_patterns.md) | 6 | 5 | `Architecture`, `Design Patterns`, `Best Practices` |
| 2 | [CAP 定理](./cap_theorem.md) | 8 | 5 | `Distributed Systems`, `CAP Theorem`, `Trade-offs` |
| 3 | [CQRS (命令查詢責任分離)](./cqrs_pattern.md) | 8 | 4 | `Architecture`, `CQRS`, `Design Pattern` |
| 4 | [事件溯源 (Event Sourcing)](./event_sourcing_pattern.md) | 8 | 4 | `Architecture`, `Event Sourcing`, `Design Pattern` |

### 系統演進 (System Evolution)

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 5 | [水平擴展與分散式系統的關係](./horizontal_scaling_vs_distributed_systems.md) | 6 | 5 | `Scaling`, `Distributed Systems`, `Concepts` |
| 6 | [演進階段一：單體架構 (Monolith)](./evolution_stage_1_monolith.md) | 4 | 5 | `Monolith`, `Evolution`, `Pros/Cons` |
| 7 | [演進階段二：水平擴展 (Horizontal Scaling)](./evolution_stage_2_horizontal_scaling.md) | 5 | 5 | `Scaling`, `Load Balancing`, `Stateless` |
| 8 | [演進階段三：分散式架構與微服務](./evolution_stage_3_distributed_architecture.md) | 8 | 5 | `Microservices`, `Distributed`, `Trade-offs` |

---

## 學習建議

1. **掌握基礎架構模式**: 分層架構、六邊形架構、事件驅動架構等是理解現代系統設計的基礎。
2. **深入理解 CAP 定理**: 這是分散式系統設計的核心理論，必須能清楚解釋三者之間的權衡。
3. **學習進階模式**: CQRS 和 Event Sourcing 是解決複雜業務場景的強大工具，但也帶來額外的複雜度。
4. **實踐中思考**: 理解每種架構模式的適用場景和局限性，避免過度設計。
5. **關注演進能力**: 好的架構應該能夠隨著業務需求的變化而演進，而不是一開始就追求完美。

