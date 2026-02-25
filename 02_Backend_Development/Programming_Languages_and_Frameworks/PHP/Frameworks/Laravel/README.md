# Laravel 框架

Laravel 是最受歡迎的 PHP 框架之一，以其優雅的語法和豐富的功能著稱。作為資深後端工程師，您需要深入理解 Laravel 的核心機制、設計模式以及效能優化技巧。本章節涵蓋了面試中最常被考察的 Laravel 核心主題。

## 主題列表

### 核心概念

| 序號 | 主題 | 難度 (1-10) | 重要性 (1-5) |
|------|------|-------------|-------------|
| 1 | [Laravel 請求生命週期](./request_lifecycle.md) | 6 | 5 |
| 2 | [Service Container 與 IoC](./service_container_and_ioc.md) | 7 | 5 |
| 3 | [Facades 原理解析](./facades_explained.md) | 7 | 4 |
| 4 | [Eloquent ORM 深入解析](./eloquent_orm_deep_dive.md) | 8 | 5 |
| 5 | [Middleware 深入理解](./middleware_in_depth.md) | 7 | 5 |

### 進階主題

| 序號 | 主題 | 難度 (1-10) | 重要性 (1-5) |
|------|------|-------------|-------------|
| 6 | [隊列與任務調度](./queue_and_task_scheduling.md) | 7 | 5 |
| 7 | [事件系統與觀察者模式](./event_system_and_observer_pattern.md) | 8 | 5 |
| 8 | [測試與調試](./testing_and_debugging.md) | 7 | 5 |
| 9 | [性能優化](./performance_optimization.md) | 8 | 5 |

---

## 學習建議

### 初級階段（1-2 個月）
1. **請求生命週期**：理解 Laravel 如何處理 HTTP 請求
2. **路由與控制器**：掌握基本的 MVC 架構
3. **Eloquent 基礎**：模型定義、CRUD 操作
4. **Blade 模板**：視圖渲染與數據綁定

### 中級階段（2-4 個月）
1. **Service Container 與 IoC**：依賴注入、服務綁定
2. **Middleware**：請求過濾、認證授權
3. **Eloquent 進階**：關聯關係、查詢作用域
4. **表單驗證**：Request 驗證、自定義規則
5. **隊列系統**：異步任務處理、任務調度

### 高級階段（4-6 個月）
1. **Facades 原理**：靜態代理、服務定位器
2. **性能優化**：緩存策略、數據庫優化
3. **測試與調試**：PHPUnit、Feature Tests、Dusk
4. **事件系統**：觀察者模式、事件驅動架構
5. **Package 開發**：自定義擴展包

### 核心概念
- ✅ **約定優於配置**：遵循 Laravel 慣例
- ✅ **Eloquent ORM**：最強大的 PHP ORM
- ✅ **服務容器**：依賴注入的核心
- ✅ **中間件管道**：請求處理鏈
- ✅ **門面模式**：簡潔的 API 設計
