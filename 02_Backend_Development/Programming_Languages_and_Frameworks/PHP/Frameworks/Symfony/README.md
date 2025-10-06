# Symfony 框架

## 概述

Symfony 是一個高度靈活、可重用的 PHP 組件集合和 Web 應用框架。它強調組件化、最佳實踐和企業級開發。

**核心特點**：
- 🧩 **組件化**：高度解耦，可獨立使用的組件
- 🏗️ **靈活性**：配置優於約定，適合複雜需求
- 📚 **企業級**：成熟的生態系統和長期支持
- 🔧 **可擴展**：Bundle 系統支持模塊化開發

## 主題列表

| 序號 | 主題 | 難度 (1-10) | 重要性 (1-5) |
|------|------|-------------|-------------|
| 1 | [Symfony 框架基礎](./symfony_framework_basics.md) | 6 | 5 |
| 2 | [依賴注入容器](./dependency_injection_container.md) | 8 | 5 |
| 3 | [事件系統與監聽器](./event_system_and_listeners.md) | 7 | 4 |
| 4 | [Security 安全組件](./security_component.md) | 8 | 5 |
| 5 | [性能優化與最佳實踐](./performance_optimization.md) | 8 | 5 |

## Symfony vs Laravel

| 特性 | Symfony | Laravel |
|------|---------|--------|
| **學習曲線** | 陡峭 | 平緩 |
| **靈活性** | 極高 | 中等 |
| **開發速度** | 中等 | 快速 |
| **適用場景** | 大型企業應用 | 中小型快速開發 |
| **架構** | 高度解耦 | 緊密整合 |
| **配置方式** | 配置為主 | 約定為主 |

## 學習建議

### 初級階段（2-3 個月）
1. **基礎架構**：理解 HttpKernel、路由、控制器
2. **Twig 模板**：視圖渲染與模板繼承
3. **Doctrine 基礎**：實體定義、基本 CRUD
4. **配置管理**：YAML/PHP 配置文件

### 中級階段（3-6 個月）
1. **依賴注入**：服務容器、自動注入、服務標籤
2. **事件系統**：EventDispatcher、Subscriber
3. **表單處理**：Form Component、驗證器
4. **Security**：認證、授權、防火牆

### 高級階段（6-12 個月）
1. **編譯器傳遞**：容器編譯時的鉤子
2. **Bundle 開發**：創建可重用的擴展包
3. **性能優化**：HTTP 緩存、OPcache、JIT
4. **微服務架構**：API Platform、Messenger

### 核心概念
- ✅ **組件化設計**：每個組件可獨立使用
- ✅ **依賴注入**：強大的 DI 容器
- ✅ **事件驅動**：EventDispatcher 架構
- ✅ **HTTP 為中心**：HttpKernel 核心
- ✅ **最佳實踐**：遵循 SOLID 原則

## 推薦資源

- [Symfony 官方文檔](https://symfony.com/doc/current/index.html)
- [Symfony Casts](https://symfonycasts.com/)
- [Symfony Blog](https://symfony.com/blog/)
- [Doctrine ORM 文檔](https://www.doctrine-project.org/)

## 何時選擇 Symfony

✅ **適合場景**：
- 大型企業級應用
- 需要高度定制化
- 長期維護的項目
- 微服務架構
- 復雜業務邏輯

❌ **不適合場景**：
- 快速原型開發
- 簡單 CRUD 應用
- 團隊缺乏 Symfony 經驗
- 追求開發速度

Symfony 適合追求靈活性和可維護性的企業級項目。