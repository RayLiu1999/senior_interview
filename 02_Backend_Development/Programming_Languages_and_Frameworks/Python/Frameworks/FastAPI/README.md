# FastAPI 框架

FastAPI 是一個現代、高性能的 Python Web 框架，基於 Starlette 和 Pydantic，支持異步編程，自動生成 API 文檔，並提供完整的類型提示支持。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [FastAPI 依賴注入系統](./dependency_injection_system.md) | 8 | 5 | `Dependency Injection`, `DI`, `Depends` |
| 2 | [Pydantic 模型與數據驗證](./pydantic_models_and_validation.md) | 7 | 5 | `Pydantic`, `Validation`, `Schema` |
| 3 | [FastAPI 異步路由處理](./async_route_handlers.md) | 7 | 5 | `Async`, `AsyncIO`, `Performance` |
| 4 | [FastAPI 路徑操作與參數](./path_operations_and_parameters.md) | 5 | 5 | `Path Operation`, `Query`, `Body` |
| 5 | [FastAPI 請求與響應模型](./request_and_response_models.md) | 6 | 5 | `Request`, `Response`, `Serialization` |
| 6 | [FastAPI 自動 API 文檔生成](./automatic_api_documentation.md) | 5 | 4 | `OpenAPI`, `Swagger`, `ReDoc` |
| 7 | [FastAPI 中間件機制](./middleware_mechanism.md) | 7 | 4 | `Middleware`, `ASGI`, `Starlette` |
| 8 | [FastAPI 認證與安全](./authentication_and_security.md) | 8 | 5 | `Authentication`, `JWT`, `OAuth2`, `Security` |
| 9 | [FastAPI 後台任務](./background_tasks.md) | 6 | 4 | `Background Tasks`, `Async Tasks` |
| 10 | [FastAPI WebSocket 支持](./websocket_support.md) | 7 | 4 | `WebSocket`, `Real-time`, `Bidirectional` |
| 11 | [FastAPI 數據庫集成](./database_integration.md) | 7 | 5 | `Database`, `SQLAlchemy`, `Async ORM` |
| 12 | [FastAPI 錯誤處理](./error_handling.md) | 6 | 4 | `Error Handling`, `Exception`, `HTTPException` |
| 13 | [FastAPI 測試策略](./testing_strategies.md) | 7 | 4 | `Testing`, `TestClient`, `pytest` |
| 14 | [FastAPI 性能優化](./performance_optimization.md) | 8 | 5 | `Performance`, `Async`, `Optimization` |
| 15 | [FastAPI 部署與容器化](./deployment_and_containerization.md) | 7 | 4 | `Deployment`, `Docker`, `Uvicorn` |

---

## 學習建議

1. **精通異步編程**：FastAPI 的高性能依賴於異步特性，必須掌握 async/await
2. **理解依賴注入**：FastAPI 的依賴注入系統非常強大，是構建可測試代碼的關鍵
3. **熟悉 Pydantic**：Pydantic 提供了數據驗證和序列化，是 FastAPI 的核心組件
4. **善用類型提示**：FastAPI 依賴 Python 類型提示，充分利用可提升開發體驗
5. **關注性能**：了解異步 I/O 的優勢和局限，合理使用以達到最佳性能

