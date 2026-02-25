# Spring Boot 自動配置原理

- **難度**: 8
- **重要程度**: 5
- **標籤**: `Spring Boot`, `Auto Configuration`, `@EnableAutoConfiguration`, `Conditional`

## 問題詳述

Spring Boot 的自動配置（Auto Configuration）是其「開箱即用」特性的核心機制。理解它的工作原理——從 `@SpringBootApplication` 到 `spring.factories` 文件，再到 `@Conditional` 條件判斷——是資深 Java 工程師在面試中必須深入解析的知識點。

## 核心理論與詳解

### 入口：@SpringBootApplication 的組成

`@SpringBootApplication` 是一個組合注解，包含三個關鍵部分：

```java
@SpringBootConfiguration    // 等同於 @Configuration，聲明這是 Spring 配置類
@EnableAutoConfiguration    // 開啟自動配置的核心！
@ComponentScan              // 掃描當前包及子包下的 @Component/@Service/@Repository 等
public @interface SpringBootApplication {}
```

`@EnableAutoConfiguration` 是整個自動配置的入口。

### 自動配置的載入機制（Spring Boot 3.x）

**Spring Boot 2.7 前** 使用 `META-INF/spring.factories`：
```properties
# spring.factories
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
  org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration,\
  org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,\
  org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
```

**Spring Boot 3.x（推薦）** 改用 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`：
```
org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration
org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration
```

Spring Boot 啟動時，`AutoConfigurationImportSelector` 讀取此文件，掃描所有自動配置類候選列表（Spring Boot 3.x 有超過 100 個內建自動配置類），但**不會全部載入**，而是透過 `@Conditional` 機制按需啟用。

### @Conditional 條件注解：按需載入的核心

每個 AutoConfiguration 類都標注了一系列條件注解，只有條件全部滿足才會生效：

| 注解 | 條件 | 說明 |
| :--- | :--- | :--- |
| `@ConditionalOnClass` | Classpath 中存在指定類 | 有 `RedisTemplate` 類才配置 Redis |
| `@ConditionalOnMissingBean` | Spring 容器中不存在指定 Bean | 用戶未自定義則使用預設配置 |
| `@ConditionalOnProperty` | 配置屬性匹配指定值 | `spring.datasource.url` 存在才配置 |
| `@ConditionalOnBean` | 容器中存在指定 Bean | 依賴其他 Bean 的條件 |
| `@ConditionalOnWebApplication` | 是 Web 應用才生效 | MVC 相關配置 |
| `@ConditionalOnExpression` | SpEL 表達式為 true | 複雜條件組合 |

**以 `RedisAutoConfiguration` 為例：**

```java
@AutoConfiguration
@ConditionalOnClass(RedisOperations.class)  // 條件1: Classpath 需有 Redis 相關類
@EnableConfigurationProperties(RedisProperties.class)  // 綁定 application.yml 配置
public class RedisAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean(name = "redisTemplate")  // 條件2: 用戶未自定義 redisTemplate
    public RedisTemplate<Object, Object> redisTemplate(
            RedisConnectionFactory redisConnectionFactory) {
        // 創建預設的 RedisTemplate 配置
        RedisTemplate<Object, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        return template;
    }
}
```

**自動配置觸發流程：**

```
1. 應用啟動 → @SpringBootApplication 觸發
2. @EnableAutoConfiguration → AutoConfigurationImportSelector 讀取候選列表
3. 過濾條件：逐一評估每個 AutoConfiguration 的 @Conditional 注解
   - @ConditionalOnClass → 檢查 Classpath
   - @ConditionalOnMissingBean → 檢查 ApplicationContext
   - @ConditionalOnProperty → 檢查 Environment
4. 條件全部滿足的 AutoConfiguration 被加入 BeanDefinition 並實例化
5. 未滿足條件的直接跳過（不佔用資源）
```

### 配置屬性綁定（@ConfigurationProperties）

自動配置類通常與配置屬性類配合使用：

```java
// 自動將 application.yml 中的 spring.redis.* 配置綁定到此 POJO
@ConfigurationProperties(prefix = "spring.redis")
public class RedisProperties {
    private String host = "localhost";  // 預設值
    private int port = 6379;
    private int database = 0;
    private Duration timeout = Duration.ofMillis(2000);
    // getters & setters...
}
```

```yaml
# application.yml
spring:
  redis:
    host: redis.prod.company.com
    port: 6379
    timeout: 5000ms
```

### 覆蓋自動配置（用戶自定義優先）

`@ConditionalOnMissingBean` 是自動配置的關鍵設計：**若用戶已自定義了某個 Bean，自動配置的預設 Bean 就不會創建**。這讓用戶可以輕鬆覆蓋任何預設行為：

```java
@Configuration
public class MyRedisConfig {
    // 自定義 RedisTemplate，使用 JSON 序列化
    // 由於此 Bean 存在，RedisAutoConfiguration 中的預設 RedisTemplate 不會創建
    @Bean
    public RedisTemplate<String, Object> redisTemplate(
            RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        template.setValueSerializer(new Jackson2JsonRedisSerializer<>(Object.class));
        return template;
    }
}
```

### 調試自動配置：ConditionEvaluationReport

當自動配置行為不符合預期時，可用以下方式診斷：

```yaml
# application.yml
logging:
  level:
    org.springframework.boot.autoconfigure: DEBUG
```

或在 Spring Boot Actuator 啟用後，訪問 `/actuator/conditions` 端點，查看哪些自動配置類被啟用（Positive matches）或跳過（Negative matches）及原因。

### 自動配置作用順序控制

多個自動配置類之間可能有順序依賴，使用 `@AutoConfigureBefore` / `@AutoConfigureAfter` / `@AutoConfigureOrder` 控制：

```java
@AutoConfiguration(after = DataSourceAutoConfiguration.class)
// 等同於 @AutoConfigureAfter(DataSourceAutoConfiguration.class)
// 確保在 DataSource 配置完成後，再配置 JPA
public class HibernateJpaAutoConfiguration { ... }
```

### 面試高頻問題：Spring Boot 啟動過程

```
1. 初始化 SpringApplication 實例
2. 推斷應用類型（Servlet / Reactive / None）
3. 載入 ApplicationContext Initializers 和 Listeners（來自 spring.factories）
4. 執行 SpringApplicationRunListeners.starting()
5. 準備 Environment（合併配置文件、System Properties、環境變數）
6. 創建 ApplicationContext（如 AnnotationConfigServletWebServerApplicationContext）
7. 執行 prepareContext：應用 Initializers，載入 BeanDefinitions
8. ★ refreshContext：觸發自動配置機制，實例化所有 Bean
9. 啟動內嵌 Web Server（Tomcat / Netty）
10. 執行 ApplicationRunner 和 CommandLineRunner
11. 應用啟動完成，開放服務
```
