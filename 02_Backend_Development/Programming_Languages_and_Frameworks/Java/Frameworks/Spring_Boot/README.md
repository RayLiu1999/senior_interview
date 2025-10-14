# Spring Boot

Spring Boot 簡化了 Spring 應用的開發，提供了自動配置、起步依賴等強大功能。

## 題目列表

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [自動配置原理](./auto_configuration.md) | 8 | 5 | `Auto Configuration`, `@EnableAutoConfiguration` |
| [Starter 機制](./starter_mechanism.md) | 7 | 5 | `Starter`, `Dependency` |
| [條件註解](./conditional_annotations.md) | 7 | 4 | `@Conditional`, `Conditions` |
| [配置管理](./configuration_management.md) | 6 | 5 | `application.yml`, `@ConfigurationProperties` |
| [內嵌 Web 容器](./embedded_web_server.md) | 7 | 4 | `Tomcat`, `Jetty`, `Undertow` |
| [啟動流程](./startup_process.md) | 8 | 4 | `SpringApplication`, `Startup` |
| [Actuator 監控](./actuator_monitoring.md) | 6 | 4 | `Actuator`, `Monitoring` |
| [性能優化](./performance_optimization.md) | 7 | 5 | `Performance`, `Optimization` |

## 核心知識點

### 自動配置
- **@EnableAutoConfiguration**：啟用自動配置
- **spring.factories**：自動配置類註冊
- **條件註解**：根據條件決定是否配置
- **配置優先級**：application.yml > application.properties > 默認配置

### Starter
- **依賴管理**：統一管理相關依賴
- **自動配置**：自動配置相關 Bean
- **常用 Starter**：web、data-jpa、redis、mybatis

### 監控
- **Actuator 端點**：health、metrics、info、env
- **自定義端點**：實現自己的監控指標
- **安全配置**：保護敏感端點

## 最佳實踐

### 配置管理
```yaml
# application.yml
spring:
  profiles:
    active: dev
  datasource:
    url: ${DB_URL:jdbc:mysql://localhost:3306/db}
    username: ${DB_USER:root}
    password: ${DB_PASSWORD:}
```

### 性能優化
1. 使用 Lazy Initialization
2. 排除不必要的自動配置
3. 優化啟動時間
4. 使用 GraalVM Native Image
