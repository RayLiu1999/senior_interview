# Django 框架

Django 是一個高級 Python Web 框架，遵循「包含電池」(batteries-included) 的設計哲學，提供了完整的 Web 開發解決方案。適合構建複雜的企業級應用。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [Django ORM 深入解析](./django_orm_deep_dive.md) | 7 | 5 | `ORM`, `QuerySet`, `Database` |
| 2 | [Django 請求-響應週期](./request_response_cycle.md) | 6 | 5 | `Request`, `Response`, `Middleware` |
| 3 | [Django Middleware 機制](./middleware_mechanism.md) | 7 | 5 | `Middleware`, `Request Processing` |
| 4 | [Django Signal 系統](./signal_system.md) | 7 | 4 | `Signal`, `Event`, `Decoupling` |
| 5 | [Django 認證與權限系統](./authentication_and_permissions.md) | 7 | 5 | `Auth`, `Permission`, `Security` |
| 6 | [Django REST Framework (DRF)](./django_rest_framework.md) | 8 | 5 | `DRF`, `API`, `Serializer` |
| 7 | [Django 查詢優化](./query_optimization.md) | 8 | 5 | `Optimization`, `N+1 Problem`, `select_related` |
| 8 | [Django Cache 框架](./caching_framework.md) | 6 | 4 | `Cache`, `Performance`, `Redis` |
| 9 | [Django 表單處理](./forms_processing.md) | 5 | 4 | `Forms`, `Validation`, `ModelForm` |
| 10 | [Django Admin 客製化](./admin_customization.md) | 6 | 3 | `Admin`, `Customization` |
| 11 | [Django 遷移 (Migrations)](./migrations.md) | 6 | 4 | `Migrations`, `Schema`, `Database` |
| 12 | [Django 性能優化](./performance_optimization.md) | 8 | 5 | `Performance`, `Optimization`, `Scaling` |
| 13 | [Django 測試策略](./testing_strategies.md) | 7 | 4 | `Testing`, `Test Client`, `Fixtures` |
| 14 | [Django 部署最佳實踐](./deployment_best_practices.md) | 7 | 4 | `Deployment`, `Gunicorn`, `Production` |
| 15 | [Django 安全最佳實踐](./security_best_practices.md) | 8 | 5 | `Security`, `CSRF`, `XSS`, `SQL Injection` |

---

## 學習建議

1. **精通 ORM**：Django ORM 是核心，必須掌握查詢優化和 N+1 問題解決方案
2. **理解請求週期**：了解從請求到響應的完整流程，包括 Middleware 的執行順序
3. **熟悉 DRF**：Django REST Framework 是構建 API 的標準工具
4. **關注性能**：學會使用 select_related、prefetch_related 優化查詢
5. **重視安全**：掌握 Django 的安全機制，防範常見的 Web 攻擊

