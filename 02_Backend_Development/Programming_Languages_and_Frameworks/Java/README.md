# Java 程式語言

Java 是企業級後端開發的主流語言，以其穩定性、跨平台特性和豐富的生態系統聞名。作為資深後端工程師，您需要深入理解 Java 的核心特性、並發編程、JVM 原理以及 Spring 生態系統。本章節涵蓋了面試中最常被考察的 Java 核心主題。

## 核心概念

### Core（核心特性）

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Java 集合框架深入解析](./Core/java_collections_framework.md) | 6 | 5 | `Collections`, `Data Structures` |
| [泛型機制詳解](./Core/generics_explained.md) | 7 | 5 | `Generics`, `Type System` |
| [Java 8+ 新特性](./Core/java8_plus_features.md) | 5 | 5 | `Lambda`, `Stream API`, `Optional` |

完整列表請參考 [Core README](./Core/README.md)

### Concurrency（並發編程）

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Java 記憶體模型](./Concurrency/java_memory_model.md) | 9 | 5 | `JMM`, `happens-before`, `volatile` |
| [synchronized 關鍵字](./Concurrency/synchronized_keyword.md) | 7 | 5 | `synchronized`, `Lock`, `Monitor` |
| [線程池原理](./Concurrency/thread_pool.md) | 8 | 5 | `ThreadPool`, `Executor` |

完整列表請參考 [Concurrency README](./Concurrency/README.md)

### JVM（Java 虛擬機）

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [垃圾回收機制](./JVM/garbage_collection.md) | 8 | 5 | `GC`, `Memory Management` |
| [類加載機制](./JVM/class_loading.md) | 7 | 5 | `ClassLoader`, `Class Loading` |

完整列表請參考 [JVM README](./JVM/README.md)

## 框架

### Spring Framework

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [IoC 容器原理](./Frameworks/Spring/ioc_container.md) | 7 | 5 | `IoC`, `DI`, `Container` |

完整列表請參考 [Spring README](./Frameworks/Spring/README.md)

### Spring Boot

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [自動配置原理](./Frameworks/Spring_Boot/auto_configuration.md) | 7 | 5 | `Auto Configuration`, `Spring Boot` |

完整列表請參考 [Spring Boot README](./Frameworks/Spring_Boot/README.md)

### Build Tools（建構工具）

完整列表請參考 [Build Tools README](./Build_Tools/README.md)

**核心主題**：
- Maven 原理與最佳實踐
- Gradle 高級用法
- 依賴管理策略
- 多模組項目構建

### Testing（測試）

完整列表請參考 [Testing README](./Testing/README.md)

**核心主題**：
- JUnit 5 高級特性
- Mockito 使用技巧
- 集成測試策略
- 測試覆蓋率

---

## 學習建議

### 學習路徑

#### 初級階段（1-3 個月）
1. **Java 基礎**：語法、OOP、集合框架、異常處理
2. **常用類庫**：String、日期時間、IO
3. **集合深入**：ArrayList、HashMap 源碼閱讀
4. **基礎並發**：Thread、Runnable、synchronized

#### 中級階段（3-6 個月）
1. **並發進階**：Lock、線程池、並發容器
2. **JVM 基礎**：記憶體模型、GC 算法
3. **Spring 基礎**：IoC、AOP、MVC
4. **Spring Boot**：自動配置、Starter
5. **數據庫操作**：JDBC、MyBatis、JPA

#### 高級階段（6-12 個月）
1. **JVM 調優**：GC 調優、記憶體分析
2. **並發原理**：AQS、JMM、CAS
3. **Spring 原理**：源碼分析、擴展點
4. **分布式**：微服務、RPC、消息隊列
5. **性能優化**：JVM 調優、代碼優化、緩存策略

### 框架選擇指南

| 需求 | 推薦框架 | 理由 |
|------|----------|------|
| 企業級應用 | Spring Boot | 生態完善、成熟穩定 |
| 微服務架構 | Spring Cloud | 組件齊全、社群活躍 |
| 反應式編程 | Spring WebFlux | 高並發、非阻塞 |
| API 開發 | Spring Boot + REST | 快速開發、規範統一 |
| 批處理任務 | Spring Batch | 專為批處理設計 |

### 核心知識點

#### 語言特性
- ✅ **OOP 原則**：封裝、繼承、多態、抽象
- ✅ **集合框架**：List、Set、Map、Queue 實現
- ✅ **並發編程**：synchronized、Lock、線程池
- ✅ **函數式編程**：Lambda、Stream API、Optional
- ✅ **反射與註解**：動態代理、註解處理器

#### JVM 深入
- ✅ **記憶體模型**：堆、棧、方法區、程序計數器
- ✅ **垃圾回收**：標記清除、標記整理、複製算法
- ✅ **類加載**：雙親委派、類加載器、熱部署
- ✅ **性能調優**：GC 調優、JIT 編譯、逃逸分析

#### Spring 生態
- ✅ **核心容器**：IoC、DI、Bean 管理
- ✅ **面向切面**：AOP、動態代理、事務管理
- ✅ **數據訪問**：JDBC、ORM、事務管理
- ✅ **Web 開發**：Spring MVC、RESTful API
- ✅ **微服務**：Spring Cloud、服務治理

## Java 版本建議

- **最低版本**：Java 8（LTS，Lambda、Stream API）
- **推薦版本**：Java 11（LTS）或 Java 17（LTS）
- **企業生產**：Java 8/11（穩定性好、支持期長）
- **新項目**：Java 17+（現代特性、性能提升）

## 推薦資源

### 官方文檔
- [Java 官方文檔](https://docs.oracle.com/en/java/)
- [Spring 官方文檔](https://spring.io/projects)
- [OpenJDK](https://openjdk.org/)

### 經典書籍
- **《Effective Java》** - Joshua Bloch
- **《Java 並發編程實戰》** - Brian Goetz
- **《深入理解 Java 虛擬機》** - 周志明
- **《Spring 實戰》** - Craig Walls
- **《Java 核心技術》** - Cay S. Horstmann

### 進階資源
- [Java Concurrency in Practice](https://jcip.net/)
- [The Java Memory Model](http://www.cs.umd.edu/~pugh/java/memoryModel/)
- [Spring Framework Reference](https://docs.spring.io/spring-framework/reference/)
- [Baeldung](https://www.baeldung.com/) - Java 教程網站
