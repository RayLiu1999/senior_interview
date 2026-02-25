# 設計模式與原則 (Design Patterns and Principles)

設計模式是軟體工程中經過驗證的解決方案範本。作為資深後端工程師，您需要深入理解 GoF 23 種設計模式的應用場景，以及 SOLID 等設計原則在實際開發中的實踐。本章節涵蓋了面試中最常被考察的設計模式核心主題。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [什麼是單一職責原則 (Single Responsibility Principle, SRP)？](./solid_srp.md) | 5 | 5 | `SOLID`, `SRP`, `Design Principles` |
| 2 | [什麼是開閉原則 (Open-Closed Principle, OCP)？](./solid_ocp.md) | 6 | 5 | `SOLID`, `OCP`, `Design Principles` |
| 3 | [什麼是里氏替換原則 (Liskov Substitution Principle, LSP)？](./solid_lsp.md) | 7 | 4 | `SOLID`, `LSP`, `Design Principles` |
| 4 | [什麼是介面隔離原則 (Interface Segregation Principle, ISP)？](./solid_isp.md) | 6 | 4 | `SOLID`, `ISP`, `Design Principles` |
| 5 | [什麼是依賴反轉原則 (Dependency Inversion Principle, DIP)？](./solid_dip.md) | 7 | 5 | `SOLID`, `DIP`, `Design Principles` |
| 6 | [什麼是單例模式 (Singleton Pattern)？如何在 Go 中實現線程安全的單例？](./singleton_pattern.md) | 5 | 5 | `Design Pattern`, `Singleton`, `Creational` |
| 7 | [什麼是工廠方法模式 (Factory Method Pattern)？它與簡單工廠有何不同？](./factory_method_pattern.md) | 6 | 4 | `Design Pattern`, `Factory Method`, `Creational` |
| 8 | [什麼是抽象工廠模式 (Abstract Factory Pattern)？](./abstract_factory_pattern.md) | 7 | 4 | `Design Pattern`, `Abstract Factory`, `Creational` |
| 9 | [什麼是策略模式 (Strategy Pattern)？](./strategy_pattern.md) | 5 | 5 | `Design Pattern`, `Strategy`, `Behavioral` |
| 10 | [什麼是觀察者模式 (Observer Pattern)？](./observer_pattern.md) | 6 | 5 | `Design Pattern`, `Observer`, `Behavioral` |
| 11 | [什麼是裝飾器模式 (Decorator Pattern)？](./decorator_pattern.md) | 6 | 4 | `Design Pattern`, `Decorator`, `Structural` |
| 12 | [什麼是代理模式 (Proxy Pattern)？](./proxy_pattern.md) | 6 | 5 | `Design Pattern`, `Proxy`, `Structural` |
| 13 | [什麼是適配器模式 (Adapter Pattern)？](./adapter_pattern.md) | 5 | 4 | `Design Pattern`, `Adapter`, `Structural` |
| 14 | [什麼是依賴注入 (Dependency Injection) 與控制反轉 (Inversion of Control)？](./dependency_injection.md) | 7 | 5 | `Design Principles`, `DI`, `IoC` |
| 15 | [什麼是命令模式 (Command Pattern)？](./command_pattern.md) | 6 | 4 | `Design Pattern`, `Command`, `Behavioral` |
| 16 | [什麼是建造者模式 (Builder Pattern)？](./builder_pattern.md) | 5 | 4 | `Design Pattern`, `Builder`, `Creational` |
| 17 | [什麼是模板方法模式 (Template Method Pattern)？](./template_method_pattern.md) | 5 | 4 | `Design Pattern`, `Template Method`, `Behavioral` |
| 18 | [什麼是責任鏈模式 (Chain of Responsibility Pattern)？](./chain_of_responsibility.md) | 6 | 4 | `Design Pattern`, `Chain of Responsibility`, `Behavioral`, `Middleware` |
| 19 | [什麼是六邊形架構 (Hexagonal Architecture / Ports and Adapters)？](./hexagonal_architecture.md) | 8 | 4 | `Architecture`, `Hexagonal Architecture`, `Ports and Adapters`, `DDD` |

---

## 學習建議

1.  **掌握三大類型**: 創建型、結構型、行為型模式各有其適用場景，要能分類理解。
2.  **理解 SOLID 原則**: 單一職責、開閉原則、里氏替換、接口隔離、依賴反轉是設計的基石。
3.  **實踐常用模式**: 單例、工廠、策略、觀察者、裝飾器是面試和實際開發的高頻模式。
4.  **避免過度設計**: 設計模式是工具而非目的，要能判斷何時使用、何時不用。
5.  **結合語言特性**: 不同語言對設計模式的實現方式不同，要能靈活應用。
