# Java 建構工具

Java 項目的建構管理是開發流程的重要環節。本節涵蓋 Maven、Gradle 等主流建構工具。

## 題目列表

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Maven 原理與最佳實踐](./maven_basics.md) | 6 | 5 | `Maven`, `Build` |
| [依賴管理策略](./dependency_management.md) | 6 | 5 | `Dependency`, `Version` |
| [多模組項目構建](./multi_module_project.md) | 7 | 4 | `Multi-Module`, `Project Structure` |
| [Maven 生命週期](./maven_lifecycle.md) | 5 | 4 | `Lifecycle`, `Phases` |
| [插件開發](./plugin_development.md) | 7 | 3 | `Plugin`, `Custom` |

## 核心知識點

### Maven
- **POM 文件**：項目對象模型
- **生命週期**：clean、default、site
- **依賴管理**：依賴傳遞、依賴範圍
- **倉庫**：本地倉庫、中央倉庫、私服

### Gradle
- **Groovy DSL**：基於 Groovy 的配置
- **Kotlin DSL**：基於 Kotlin 的配置
- **任務系統**：靈活的任務定義
- **增量構建**：只構建變更部分

### 依賴管理
- **依賴範圍**：compile、provided、runtime、test
- **依賴衝突**：最短路徑優先、聲明優先
- **排除依賴**：exclusions
- **BOM**：Bill of Materials

## 最佳實踐

### Maven 配置
```xml
<!-- pom.xml -->
<project>
    <dependencyManagement>
        <dependencies>
            <!-- 統一管理版本 -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>2.7.0</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

### Gradle 配置
```groovy
// build.gradle
plugins {
    id 'java'
    id 'org.springframework.boot' version '2.7.0'
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```
