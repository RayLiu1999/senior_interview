# Maven 原理與最佳實踐

- **難度**: 6
- **重要程度**: 5
- **標籤**: `Maven`, `Build`, `Dependency Management`, `POM`

## 問題詳述

Maven 是 Java 生態系統中最廣泛使用的構建工具和依賴管理工具。理解其核心概念（POM、生命週期、插件、依賴傳遞）是 Java 後端工程師的必備知識，面試中常被問及與 Gradle 的比較及依賴衝突的解決方式。

## 核心理論與詳解

### Maven 設計哲學：約定優於配置（Convention over Configuration）

Maven 定義了一套標準的目錄結構，遵循這個約定就能零配置地完成構建：

```
my-project/
├── pom.xml                   # 項目元數據 & 依賴配置
└── src/
    ├── main/
    │   ├── java/             # 主程式原始碼
    │   └── resources/        # 配置文件（application.yml 等）
    └── test/
        ├── java/             # 測試程式原始碼
        └── resources/        # 測試配置文件
```

構建產物（`.jar`/`.war`）輸出到 `target/` 目錄。

### POM（Project Object Model）

POM 是 Maven 的核心，每個項目都有一個 `pom.xml`：

```xml
<project>
    <!-- 項目座標：唯一標識一個 Maven 構件 -->
    <groupId>com.example</groupId>
    <artifactId>my-service</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <!-- 繼承自 Spring Boot Parent，管理依賴版本（BOM）-->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>

    <dependencies>
        <!-- 依賴範圍（Scope）決定依賴在哪些階段可用 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <!-- scope 未標注則預設為 compile -->
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>  <!-- 僅測試階段可用 -->
        </dependency>

        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>javax.servlet-api</artifactId>
            <scope>provided</scope>  <!-- 由容器提供，不打包進 JAR -->
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <!-- 打包為可執行 Fat JAR -->
            </plugin>
        </plugins>
    </build>
</project>
```

### 依賴範圍（Scope）對照表

| Scope | 編譯期 | 測試期 | 執行期 | 打包 | 典型用途 |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `compile`（預設） | ✅ | ✅ | ✅ | ✅ | 大多數依賴 |
| `test` | ❌ | ✅ | ❌ | ❌ | JUnit, Mockito |
| `provided` | ✅ | ✅ | ❌ | ❌ | Servlet API（容器提供）|
| `runtime` | ❌ | ✅ | ✅ | ✅ | JDBC 驅動（僅執行時需要）|
| `system` | ✅ | ✅ | ❌ | ❌ | 本地路徑依賴（強烈不推薦）|

### Maven 生命週期（Build Lifecycle）

Maven 定義了三套標準生命週期，每個生命週期由一系列**階段（Phase）**組成，執行某個 Phase 會自動執行其之前的所有 Phase：

**Default Lifecycle（最重要）：**
```
validate → compile → test → package → verify → install → deploy
                               ↑             ↑
                           生成 JAR/WAR   執行集成測試
```

常用命令：
- `mvn clean package`：清理 + 編譯 + 測試 + 打包（**最常用**）
- `mvn clean package -DskipTests`：跳過測試加速構建
- `mvn install`：安裝到本地倉庫（~/.m2/repository）
- `mvn deploy`：部署到遠端倉庫（Nexus/Artifactory）

### 依賴傳遞與衝突解決

**依賴傳遞（Transitive Dependency）**

```
A → B → C（版本 1.0）
A → D → C（版本 2.0）
```

A 引入了 B 和 D，而 B 和 D 都依賴 C 的不同版本，Maven 如何決定使用哪個版本？

**解決規則—兩個原則（按優先序）：**

1. **最短路徑優先**：依賴路徑越短，優先選用。B → C 是 2 跳，D → C 也是 2 跳，同等深度時看第 2 條。
2. **宣告順序優先**：先宣告的依賴勝出（先 B 後 D，則使用 B 的版本）。

**主動排除 + 強制指定版本（最佳實踐）：**

```xml
<!-- 排除傳遞依賴中的舊版本 -->
<dependency>
    <groupId>org.some-lib</groupId>
    <artifactId>some-lib</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.problematic</groupId>
            <artifactId>old-dep</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<!-- 在 dependencyManagement 中強制指定版本（覆蓋所有傳遞依賴）-->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.problematic</groupId>
            <artifactId>old-dep</artifactId>
            <version>2.0.0</version>  <!-- 統一使用此版本 -->
        </dependency>
    </dependencies>
</dependencyManagement>
```

### Maven vs Gradle 比較

| 維度 | Maven | Gradle |
| :--- | :--- | :--- |
| **配置語言** | XML（冗長但直觀）| Groovy/Kotlin DSL（簡潔、可程式化）|
| **構建速度** | 較慢（無增量構建）| 快（增量構建、構建快取）|
| **學習曲線** | 低（約定明確）| 中（DSL 需學習），靈活但易複雜化 |
| **生態系統** | 非常成熟 | 快速增長（Android 標準構建工具）|
| **擴展性** | 插件（XML 配置）| 任務（Groovy/Kotlin 程式碼）|
| **適用場景** | 大型企業 Java 項目 | Android、Kotlin 項目、需要複雜自定義邏輯 |

### 私服（Private Registry）管理

大型企業通常搭建 **Nexus** 或 **Artifactory** 作為 Maven 私服：

```xml
<!-- settings.xml（~/.m2/settings.xml）配置私服 -->
<mirrors>
    <mirror>
        <id>nexus</id>
        <mirrorOf>*</mirrorOf>  <!-- 攔截所有倉庫請求 -->
        <url>https://nexus.company.com/repository/maven-public/</url>
    </mirror>
</mirrors>
```

私服的作用：
- **快取**：快取 Central 的依賴，提升構建速度，降低外部網路依賴
- **代理**：代理外部倉庫，統一出口管控
- **託管**：存放企業內部私有構件
- **安全掃描**：對引入的依賴進行 CVE 漏洞掃描
