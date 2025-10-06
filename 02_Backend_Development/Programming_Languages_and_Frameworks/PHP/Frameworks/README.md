# PHP 框架

本節涵蓋 PHP 主流框架的核心概念、架構設計和最佳實踐。

## 框架列表

### [Laravel](./Laravel/README.md)
- **難度**：6
- **重要程度**：5
- **特點**：快速開發、約定優於配置、生態豐富
- **適用場景**：中小型項目、快速原型、API 開發

### [Symfony](./Symfony/README.md)
- **難度**：8
- **重要程度**：4
- **特點**：高度靈活、組件化、企業級
- **適用場景**：大型項目、可定制性需求高、微服務

## 框架對比

| 特性 | Laravel | Symfony |
|------|---------|---------|
| 學習曲線 | 平緩 | 陡峭 |
| 開發速度 | 快 | 中等 |
| 靈活性 | 中等 | 高 |
| 性能 | 良好 | 優秀 |
| 文檔 | 優秀 | 優秀 |
| 社群 | 龐大 | 龐大 |
| 適用規模 | 中小型 | 大型 |

## 核心概念

### 共同特性
- **依賴注入**：IoC 容器、服務綁定
- **路由系統**：RESTful 路由、中間件
- **ORM**：Eloquent（Laravel）、Doctrine（Symfony）
- **模板引擎**：Blade（Laravel）、Twig（Symfony）
- **測試**：PHPUnit、功能測試、單元測試

### Laravel 核心
- **服務容器**：自動依賴注入、服務綁定
- **Facades**：靜態代理模式
- **Eloquent ORM**：Active Record 模式
- **隊列系統**：非同步任務處理
- **事件系統**：觀察者模式

### Symfony 核心
- **Bundle 系統**：模組化架構
- **依賴注入容器**：自動裝配、標籤服務
- **事件調度器**：事件驅動架構
- **Doctrine ORM**：Data Mapper 模式
- **HTTP Kernel**：請求處理流程

## 選型建議

### 選擇 Laravel 的場景
- 需要快速開發和上線
- 團隊經驗較少，需要降低學習成本
- 中小型項目，不需要極致的定制化
- 需要豐富的第三方套件支援

### 選擇 Symfony 的場景
- 大型企業級應用
- 需要高度的靈活性和可定制性
- 團隊有豐富的 PHP 開發經驗
- 需要長期維護和擴展
- 微服務架構，需要獨立的組件

## 學習路徑

### Laravel 學習路徑
1. **基礎**（1-2 週）
   - 路由、控制器、視圖
   - Blade 模板引擎
   - 請求和響應

2. **核心**（2-4 週）
   - Eloquent ORM
   - 服務容器與依賴注入
   - Middleware
   - 認證與授權

3. **進階**（1-2 個月）
   - 隊列與任務調度
   - 事件與監聽器
   - API 開發
   - 測試與部署

### Symfony 學習路徑
1. **基礎**（2-3 週）
   - HTTP 基礎與路由
   - 控制器與請求處理
   - Twig 模板引擎

2. **核心**（1-2 個月）
   - 依賴注入容器
   - 服務與自動裝配
   - Doctrine ORM
   - 表單與驗證

3. **進階**（2-3 個月）
   - 事件系統
   - Security 組件
   - Console 命令
   - Bundle 開發

## 性能優化

### Laravel
- **配置快取**：`php artisan config:cache`
- **路由快取**：`php artisan route:cache`
- **OPcache**：啟用 OPcache 和預載入
- **查詢優化**：N+1 問題、Eager Loading
- **Redis**：快取和會話存儲

### Symfony
- **Preload**：PHP 7.4+ 的預載入
- **HTTP Cache**：使用 Varnish 或 Symfony HTTP Cache
- **Doctrine**：查詢優化、結果快取
- **容器編譯**：生產環境編譯容器
- **Assets 優化**：Webpack Encore
