# Domain-Driven Design (DDD)

領域驅動設計 (DDD) 是一種軟體開發方法論，強調將複雜的業務邏輯作為軟體核心。對於資深工程師而言，DDD 是解決複雜業務問題、拆分微服務邊界的重要工具。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [戰略設計：Bounded Context 與 Ubiquitous Language](./strategic_design_bounded_context.md) | 8 | 5 | `Strategic Design`, `Bounded Context`, `Ubiquitous Language` |
| 2 | [戰術設計：Aggregate, Entity 與 Value Object](./tactical_design_aggregates_entities_value_objects.md) | 7 | 5 | `Tactical Design`, `Aggregate`, `Entity`, `Value Object` |
| 3 | [貧血模型 vs 充血模型 (Anemic vs Rich Domain Model)](./anemic_vs_rich_domain_model.md) | 6 | 4 | `Domain Model`, `Anti-Pattern` |
| 4 | [領域事件與事件風暴 (Domain Events & Event Storming)](./domain_events_and_event_storming.md) | 7 | 4 | `Domain Event`, `Event Storming`, `Event Driven` |
| 5 | [Repository 與 Factory 模式](./repository_and_factory_patterns.md) | 5 | 3 | `Repository`, `Factory`, `Design Pattern` |

---

## 學習建議

1. **先戰略後戰術**: 不要一開始就糾結於 Aggregate 怎麼設計，先理解 Bounded Context 如何劃分系統邊界。
2. **語言是核心**: Ubiquitous Language (通用語言) 是團隊溝通的基石，程式碼應該反映業務語言。
3. **避免過度設計**: DDD 適合複雜度高的業務系統，對於簡單的 CRUD 應用，DDD 可能是殺雞焉用牛刀。
4. **實踐出真知**: 嘗試用 Event Storming 來分析一個你熟悉的業務場景。
