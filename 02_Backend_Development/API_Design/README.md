# API 設計 (API Design)

API 設計是後端工程師的核心技能之一。良好的 API 設計不僅影響系統的可維護性，更直接關係到客戶端的開發體驗和系統的擴展性。作為資深後端工程師，您需要深入理解 RESTful、GraphQL、WebSocket 等不同 API 風格的優劣，以及版本管理、冪等性、安全性等關鍵設計考量。本章節涵蓋了面試中最常被考察的 API 設計核心主題。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [RESTful API 的核心設計原則是什麼？](./restful_api_principles.md) | 5 | 5 | `API`, `REST`, `Design Principles` |
| 2 | [API 版本管理策略](./api_versioning_strategies.md) | 6 | 5 | `API`, `Versioning`, `Best Practices` |
| 3 | [API 中的冪等性](./idempotency_in_api.md) | 6 | 5 | `API`, `Idempotency`, `Design Pattern` |
| 4 | [API 驗證與授權機制](./api_authentication_and_authorization.md) | 7 | 5 | `API`, `Authentication`, `Authorization`, `Security` |
| 5 | [API 限流與降級策略](./api_rate_limiting.md) | 7 | 5 | `API`, `Rate Limiting`, `Best Practices` |
| 6 | [GraphQL vs. REST](./graphql_vs_rest.md) | 7 | 4 | `API`, `GraphQL`, `REST`, `Comparison` |
| 7 | [WebSocket](./WebSocket/README.md) | 6 | 4 | `API`, `WebSocket`, `Real-time` |

---

## 學習建議

1.  **掌握 REST 原則**: RESTful 是最主流的 API 設計風格，必須深入理解其六大約束和最佳實踐。
2.  **理解版本管理**: API 版本管理策略（URI、Header、Query）各有優劣，要能根據場景做出選擇。
3.  **關注冪等性設計**: POST、PUT、DELETE 的冪等性設計是保證 API 可靠性的關鍵。
4.  **重視安全性**: OAuth 2.0、JWT、API Key 等認證授權機制是 API 安全的基礎。
5.  **比較不同風格**: 理解 REST、GraphQL、gRPC、WebSocket 各自的適用場景和權衡取捨。

