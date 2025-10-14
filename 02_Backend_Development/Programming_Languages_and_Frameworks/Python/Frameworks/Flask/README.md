# Flask 框架

Flask 是一個輕量級的 Python Web 框架，遵循微框架 (microframework) 設計理念。它提供了核心功能，其他功能通過擴展實現，具有高度的靈活性和可定制性。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [Flask 應用上下文與請求上下文](./application_and_request_context.md) | 8 | 5 | `Context`, `Application Context`, `Request Context` |
| 2 | [Flask 路由系統與 URL 規則](./routing_and_url_rules.md) | 5 | 5 | `Routing`, `URL`, `View Functions` |
| 3 | [Flask Blueprint 架構](./blueprint_architecture.md) | 7 | 5 | `Blueprint`, `Modular`, `Architecture` |
| 4 | [Flask 請求與響應對象](./request_and_response_objects.md) | 5 | 5 | `Request`, `Response`, `HTTP` |
| 5 | [Flask-SQLAlchemy 集成](./flask_sqlalchemy_integration.md) | 7 | 5 | `SQLAlchemy`, `ORM`, `Database` |
| 6 | [Flask 擴展系統](./extension_system.md) | 6 | 4 | `Extensions`, `Plugins` |
| 7 | [Flask 錯誤處理](./error_handling.md) | 6 | 4 | `Error Handling`, `Exception`, `HTTP Errors` |
| 8 | [Flask 會話管理](./session_management.md) | 6 | 4 | `Session`, `Cookie`, `Security` |
| 9 | [Flask-RESTful API 開發](./restful_api_development.md) | 7 | 5 | `REST API`, `Flask-RESTful` |
| 10 | [Flask 中間件與鉤子](./middleware_and_hooks.md) | 7 | 4 | `Middleware`, `before_request`, `after_request` |
| 11 | [Flask 配置管理](./configuration_management.md) | 5 | 4 | `Configuration`, `Config`, `Environment` |
| 12 | [Flask 模板引擎 (Jinja2)](./template_engine_jinja2.md) | 5 | 3 | `Jinja2`, `Templates`, `Rendering` |
| 13 | [Flask 測試策略](./testing_strategies.md) | 6 | 4 | `Testing`, `Test Client`, `Fixtures` |
| 14 | [Flask 性能優化](./performance_optimization.md) | 7 | 4 | `Performance`, `Caching`, `Optimization` |
| 15 | [Flask 部署與生產環境](./deployment_and_production.md) | 7 | 4 | `Deployment`, `WSGI`, `Gunicorn` |

---

## 學習建議

1. **理解上下文機制**：Flask 的應用上下文和請求上下文是核心概念，必須深入理解
2. **掌握 Blueprint**：學會使用 Blueprint 構建模塊化、可擴展的應用
3. **熟悉擴展生態**：了解常用擴展如 Flask-SQLAlchemy、Flask-Login、Flask-RESTful
4. **重視 WSGI**：理解 WSGI 規範和 Flask 的工作原理
5. **實踐 API 開發**：Flask 非常適合構建輕量級 RESTful API

