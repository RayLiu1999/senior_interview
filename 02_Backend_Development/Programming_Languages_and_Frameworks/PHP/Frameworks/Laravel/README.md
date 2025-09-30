# Laravel 框架

Laravel 是最受歡迎的 PHP 框架之一，以其優雅的語法和豐富的功能著稱。作為資深後端工程師，您需要深入理解 Laravel 的核心機制、設計模式以及效能優化技巧。本章節涵蓋了面試中最常被考察的 Laravel 核心主題。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [請求生命週期 (Request Lifecycle)](./request_lifecycle.md) | 6 | 5 | `Laravel`, `Request Lifecycle`, `Architecture` |
| 2 | [服務容器 (Service Container) 與 依賴注入 (IoC)](./service_container_and_ioc.md) | 7 | 5 | `Laravel`, `Service Container`, `Dependency Injection` |
| 3 | [門面 (Facades) 深度解析](./facades_explained.md) | 6 | 4 | `Laravel`, `Facades`, `Design Pattern` |
| 4 | [Eloquent ORM 深度探討 (N+1 問題)](./eloquent_orm_deep_dive.md) | 7 | 5 | `Laravel`, `Eloquent`, `ORM`, `Performance` |
| 5 | [中介層 (Middleware) 詳解](./middleware_in_depth.md) | 5 | 4 | `Laravel`, `Middleware`, `Request Handling` |

---

## 學習建議

1.  **理解生命週期**: Laravel 的請求生命週期是理解整個框架運作的基礎，必須深入掌握。
2.  **掌握核心機制**: 服務容器、依賴注入、門面是 Laravel 的三大核心設計模式。
3.  **精通 ORM 使用**: Eloquent 是 Laravel 最強大的特性之一，要能識別和解決 N+1 問題等常見陷阱。
4.  **熟悉中介層**: 了解中介層的執行順序和使用場景，能夠自定義中介層處理請求。
5.  **關注效能優化**: 快取、查詢優化、Eager Loading 等是提升 Laravel 應用效能的關鍵技術。
