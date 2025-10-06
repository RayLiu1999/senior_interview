# PHP

PHP 是最廣泛使用的伺服器端程式語言之一，驅動著全球超過 70% 的網站。作為資深後端工程師，您需要深入理解 PHP 的語言特性、生態系統工具、安全最佳實踐以及與 Web 伺服器的整合方式。本章節涵蓋了面試中最常被考察的 PHP 核心主題。

## 主題概覽

### 核心特性

完整列表請參考 [Core README](./Core/README.md)

**基礎主題**（15 個題目）：
- [相等性與類型轉換](./Core/equality_and_type_juggling.md) - PHP 的相等性比較與類型轉換機制
- [include/require 差異](./Core/include_vs_require.md) - 文件引入方式的差異
- [Trait vs Interface vs Abstract](./Core/trait_vs_interface_vs_abstract_class.md) - 代碼重用機制對比
- [垃圾回收機制](./Core/garbage_collection_in_php.md) - 引用計數與循環回收
- [依賴注入與 IoC](./Core/di_container_and_ioc.md) - 依賴注入容器原理
- [常見安全漏洞](./Core/common_security_vulnerabilities.md) - SQL 注入、XSS、CSRF 防護
- [PHP 8+ 新特性](./Core/php8_new_features.md) - Attributes、Enums、Match 等
- [命名空間與自動載入](./Core/namespaces_and_autoloading.md) - PSR-4 自動載入機制
- [錯誤與異常處理](./Core/error_and_exception_handling.md) - 錯誤處理策略
- [魔術方法詳解](./Core/magic_methods.md) - __get、__set、__call 等
- [閉包與匿名函數](./Core/closures_and_anonymous_functions.md) - 函數式編程特性
- [生成器與迭代器](./Core/generators_and_iterators.md) - 記憶體優化技術
- [反射機制](./Core/reflection_api.md) - 運行時元編程
- [類型系統演進](./Core/type_system_evolution.md) - PHP 類型系統發展
- [OPcache 與 JIT](./Core/opcache_and_jit.md) - 性能優化技術

**工具鏈主題**（見 [Tooling README](./Tooling/README.md)）：
- [Composer 與依賴管理](./Tooling/what_is_composer_and_its_purpose.md)
- [PSR 標準詳解](./Tooling/what_is_psr_and_common_standards.md)

**Web 伺服器主題**（見 [Web_Servers README](./Web_Servers/README.md)）：
- [PHP-FPM 架構與角色](./Web_Servers/php_fpm_and_its_role.md)

---

## 子主題

### 框架

#### Laravel

詳見 [Laravel 專屬 README](./Frameworks/Laravel/README.md)

**核心概念**（5 個主題）：
- [請求生命週期](./Frameworks/Laravel/request_lifecycle.md)
- [Service Container 與 IoC](./Frameworks/Laravel/service_container_and_ioc.md)
- [Facades 原理](./Frameworks/Laravel/facades_explained.md)
- [Eloquent ORM 深入](./Frameworks/Laravel/eloquent_orm_deep_dive.md)
- [Middleware 機制](./Frameworks/Laravel/middleware_in_depth.md)

**進階主題**（3 個主題）：
- [隊列與任務調度](./Frameworks/Laravel/queue_and_task_scheduling.md)
- [測試與調試](./Frameworks/Laravel/testing_and_debugging.md)
- [性能優化](./Frameworks/Laravel/performance_optimization.md)

#### Symfony

詳見 [Symfony 專屬 README](./Frameworks/Symfony/README.md)

**核心概念**（5 個主題）：
- [Symfony 框架基礎](./Frameworks/Symfony/symfony_framework_basics.md)
- [依賴注入容器](./Frameworks/Symfony/dependency_injection_container.md)
- [事件系統與監聽器](./Frameworks/Symfony/event_system_and_listeners.md)
- [Security 安全組件](./Frameworks/Symfony/security_component.md)
- [性能優化與最佳實踐](./Frameworks/Symfony/performance_optimization.md)

---

## 學習建議

### 學習路徑

#### 初級階段（1-2 個月）
1. **PHP 8+ 基礎**：類型系統、命名空間、錯誤處理
2. **面向對象**：類、接口、Trait、抽象類
3. **Composer**：依賴管理、自動載入、PSR 標準
4. **基礎安全**：輸入驗證、SQL 注入防範

#### 中級階段（2-4 個月）
1. **現代 PHP**：PHP 8+ 新特性（Attributes、Enums、Match）
2. **設計模式**：依賴注入、工廠模式、觀察者模式
3. **框架選擇**：Laravel（快速開發）或 Symfony（企業級）
4. **測試**：PHPUnit、集成測試、Mocking

#### 高級階段（4-6 個月）
1. **性能優化**：OPcache、JIT、數據庫優化
2. **架構設計**：微服務、事件驅動、CQRS
3. **安全進階**：OWASP Top 10、JWT、OAuth
4. **DevOps**：Docker、CI/CD、Kubernetes

### 框架選擇指南

| 需求 | 推薦框架 | 理由 |
|------|----------|------|
| 快速開發、中小型項目 | Laravel | 約定優於配置、生態豐富 |
| 企業級、大型項目 | Symfony | 高度靈活、可定制性強 |
| API 開發 | Laravel + Sanctum | 簡單易用的 API 認證 |
| 微服務架構 | Symfony + API Platform | 組件化設計、可獨立部署 |

### 核心知識點

#### 語言特性
- ✅ **類型系統**：標量類型、返回類型、聯合類型、交集類型
- ✅ **現代特性**：Attributes、Enums、Match、Nullsafe
- ✅ **異步編程**：Fibers、Swoole、ReactPHP
- ✅ **性能**：OPcache、JIT、Preloading

#### 框架開發
- ✅ **Laravel**：Eloquent、服務容器、隊列、緩存
- ✅ **Symfony**：依賴注入、事件系統、Security
- ✅ **設計模式**：依賴注入、觀察者、工廠、策略

#### 安全與部署
- ✅ **安全**：OWASP Top 10、輸入驗證、CSRF、XSS
- ✅ **部署**：PHP-FPM、Nginx、Docker、CI/CD
- ✅ **監控**：日誌、性能分析、錯誤追蹤

## PHP 版本建議

- **最低版本**：PHP 8.0（JIT、Union Types）
- **推薦版本**：PHP 8.1+（Enums、Readonly、Fibers）
- **生產環境**：PHP 8.2+（穩定性好）

## 推薦資源

- [PHP 官方文檔](https://www.php.net/docs.php)
- [PHP: The Right Way](https://phptherightway.com/)
- [Laravel 官方文檔](https://laravel.com/docs)
- [Symfony 官方文檔](https://symfony.com/doc)
- [PHP-FIG PSR 標準](https://www.php-fig.org/psr/)
