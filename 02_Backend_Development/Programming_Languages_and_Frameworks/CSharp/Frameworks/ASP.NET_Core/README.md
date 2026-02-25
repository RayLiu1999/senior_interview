# ASP.NET Core

ASP.NET Core 是微軟開發的跨平台、高效能 Web 框架，用於建構現代化的雲端應用程式和服務。它是 .NET 生態系統中最重要的 Web 開發框架，在面試中經常被考察。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [依賴注入容器](./dependency_injection.md) | 7 | 5 | `DI`, `IoC`, `Container` |
| 2 | [中介軟體管線](./middleware_pipeline.md) | 7 | 5 | `Middleware`, `Pipeline`, `Request` |
| 3 | [路由機制](./routing.md) | 5 | 4 | `Routing`, `Endpoint`, `Attribute Routing` |
| 4 | [篩選器 (Filters)](./filters.md) | 6 | 4 | `Filter`, `ActionFilter`, `ExceptionFilter` |
| 5 | [配置管理](./configuration.md) | 5 | 4 | `Configuration`, `Options Pattern` |
| 6 | [健康檢查](./health_checks.md) | 4 | 3 | `Health Check`, `Monitoring` |
| 7 | [身份驗證與授權](./authentication_authorization.md) | 7 | 5 | `Authentication`, `Authorization`, `JWT` |
| 8 | [Minimal API](./minimal_api.md) | 5 | 4 | `Minimal API`, `Endpoint` |

---

## 學習建議

1. **依賴注入是基礎**：ASP.NET Core 完全建構在 DI 之上，必須優先掌握
2. **理解請求管線**：中介軟體是處理 HTTP 請求的核心機制
3. **掌握配置系統**：理解 Options 模式和配置來源的優先順序
4. **認證授權分開理解**：認證是「你是誰」，授權是「你能做什麼」
