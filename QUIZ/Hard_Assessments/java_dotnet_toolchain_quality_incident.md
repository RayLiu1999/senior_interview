# Java/.NET Toolchain Quality Incident：從 runtime 到 build、test、release 的可重現性

- **Assessment ID**: assessment.java-dotnet.toolchain-quality.incident.v1
- **主要 Concept ID**: concept.java.build.maven-reproducibility-dependency
- **次要 Concept IDs**:
  - concept.java.core.modern-language-features
  - concept.java.core.generics-type-erasure
  - concept.java.core.collections-selection-concurrency
  - concept.java.jvm.class-loading-isolation
  - concept.java.testing.junit5-lifecycle-isolation
  - concept.java.spring-boot.auto-configuration-conditions
  - concept.csharp.tooling.dotnet-cli-nuget-reproducibility
  - concept.csharp.testing.xunit-nunit-isolation
- **對應文章**:
  - [Java 8+ 新特性](../../02_Backend_Development/Programming_Languages_and_Frameworks/Java/Core/java8_plus_features.md)
  - [Java 泛型機制](../../02_Backend_Development/Programming_Languages_and_Frameworks/Java/Core/generics_explained.md)
  - [Java 集合框架](../../02_Backend_Development/Programming_Languages_and_Frameworks/Java/Core/java_collections_framework.md)
  - [JVM 類加載機制](../../02_Backend_Development/Programming_Languages_and_Frameworks/Java/JVM/class_loading.md)
  - [JUnit 5 高級特性](../../02_Backend_Development/Programming_Languages_and_Frameworks/Java/Testing/junit5_advanced.md)
  - [Maven 原理與最佳實踐](../../02_Backend_Development/Programming_Languages_and_Frameworks/Java/Build_Tools/maven_basics.md)
  - [Spring Boot 自動配置](../../02_Backend_Development/Programming_Languages_and_Frameworks/Java/Frameworks/Spring_Boot/auto_configuration.md)
  - [NuGet 套件管理與 dotnet CLI](../../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Tooling/dotnet_cli_and_nuget.md)
  - [xUnit 與 NUnit](../../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Testing/xunit_nunit.md)
- **題型**: 跨語言工具鏈事故、依賴衝突、測試隔離、可重現發布
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 40 分鐘
- **標籤**: Java、JVM、Spring Boot、Maven、JUnit 5、.NET、NuGet、xUnit、NUnit、Reproducible Build
- **Learning Objective IDs**:
  - concept.java.core.modern-language-features/LO-1
  - concept.java.core.modern-language-features/LO-2
  - concept.java.core.modern-language-features/LO-3
  - concept.java.core.generics-type-erasure/LO-1
  - concept.java.core.generics-type-erasure/LO-2
  - concept.java.core.generics-type-erasure/LO-3
  - concept.java.core.collections-selection-concurrency/LO-1
  - concept.java.core.collections-selection-concurrency/LO-2
  - concept.java.core.collections-selection-concurrency/LO-3
  - concept.java.jvm.class-loading-isolation/LO-1
  - concept.java.jvm.class-loading-isolation/LO-2
  - concept.java.jvm.class-loading-isolation/LO-3
  - concept.java.testing.junit5-lifecycle-isolation/LO-1
  - concept.java.testing.junit5-lifecycle-isolation/LO-2
  - concept.java.testing.junit5-lifecycle-isolation/LO-3
  - concept.java.build.maven-reproducibility-dependency/LO-1
  - concept.java.build.maven-reproducibility-dependency/LO-2
  - concept.java.build.maven-reproducibility-dependency/LO-3
  - concept.java.spring-boot.auto-configuration-conditions/LO-1
  - concept.java.spring-boot.auto-configuration-conditions/LO-2
  - concept.java.spring-boot.auto-configuration-conditions/LO-3
  - concept.csharp.tooling.dotnet-cli-nuget-reproducibility/LO-1
  - concept.csharp.tooling.dotnet-cli-nuget-reproducibility/LO-2
  - concept.csharp.tooling.dotnet-cli-nuget-reproducibility/LO-3
  - concept.csharp.testing.xunit-nunit-isolation/LO-1
  - concept.csharp.testing.xunit-nunit-isolation/LO-2
  - concept.csharp.testing.xunit-nunit-isolation/LO-3

## 測驗目標

- 能把 Java 與 .NET 的 build、test、runtime、configuration、artifact 與 release evidence 串成可驗證的因果鏈。
- 能區分 language change、dependency graph conflict、class／assembly loading、auto-configuration drift、test isolation 與 cache poisoning。
- 能提出不依賴清空所有 cache、關閉平行測試或全部升級的安全止血、修復與可重現性策略。
- 能以固定工具鏈、依賴鎖定、artifact integrity、測試隔離、canary 與 rollback 指標驗證修復。

## 問題情境與限制條件

某團隊同時維護 Java catalog-service 與 .NET checkout-api。一次共用發布窗口後，兩個服務都出現開發機看似正常、CI 或 production 不穩定的問題。

Java 服務的現象如下：

- 開發者在本機使用較新的 JDK 和暖 Maven cache；mvn test 通過，但 release runner 使用另一個 JDK、不同 Maven plugin cache 與稍舊的私有 repository mirror。
- release artifact 啟動時偶發 NoSuchMethodError 或 ClassCastException；錯誤只出現在某些 plugin 或 integration path。初步 dependency tree 顯示同一 logging、JSON 或 framework family 被不同傳遞路徑帶入。
- Spring Boot 在本機 profile 建立了某個 auto-configured client，但 CI 的 artifact 缺少一個可選 class，production 又因 user-defined bean 和 property override 得到第三種結果。startup log 沒有保留完整 condition evaluation report。
- 一個使用 JUnit 5 的測試套件在本機依序執行可通過，CI 開啟平行測試時偶發失敗；失敗涉及共享 temporary directory、embedded port、clock、static collection 與未確定的測試資料。重跑通常會變綠，團隊因此提議全域 retry。
- 另一個 plugin reload 實驗長時間執行後 metaspace 上升；不同 ClassLoader 載入的同名 API 被傳到共用邊界，部分 request 失敗。

.NET 服務的現象如下：

- 開發者執行 dotnet restore 時使用本機 credential 和暖 NuGet cache；CI 同時設定公開與私有 package source，source order、SDK image 和 runtime pack 與本機不同。
- dotnet build 通過，但 dotnet test 或 dotnet publish 失敗；project.assets.json 顯示一個 transitive package 在不同 runner 解出不同版本，部分測試只在特定 target framework 或 RID 出現 assembly load failure。
- xUnit 或 NUnit 測試共用資料庫、檔案、port 和 singleton cache；fixture 的 async cleanup 不完整，平行執行時偶發 port busy、資料污染與 timeout。有人提議停用所有平行測試並跳過 integration test。
- restore cache 的 key 沒有包含 SDK、lock state、NuGet source policy 或中央版本設定；cache 命中時測試較快但產物內容未被 checksum 或 SBOM 驗證。release 後發現 publish output 缺少預期 runtime asset，必須緊急回滾。

限制條件：

- 不能只刪除 cache、全域關閉測試、無條件升級所有依賴或把 retry 次數調到很大。
- 不可降低 tenant isolation、權限檢查、artifact provenance 或 production rollback 能力。
- 必須先安全止血，再建立可重現 build、test、release；每次改動都要指出輸入、證據、成功指標和回滾條件。

## 作答要求

1. **建立雙服務時間線與因果鏈**：區分 Java 語言／泛型／集合改動、Maven dependency graph、ClassLoader、Spring condition、JUnit fixture、NuGet restore、.NET runner 與 release artifact 哪些是已知證據、哪些只是待驗證假設。
2. **建立 Java 依賴與 runtime 取證計畫**：使用 effective POM、dependency tree、BOM／dependencyManagement、repository metadata、JDK／Maven／plugin 版本、artifact checksum、SBOM、class path、ClassLoader identity 與 metaspace evidence 排除版本衝突和類別隔離問題。
3. **建立 .NET toolchain 取證計畫**：比對 SDK／runtime／RID、NuGet source 與 credential policy、lock state、assets graph、direct／transitive package、restore cache key、publish manifest、runtime pack 與 artifact checksum。
4. **分析 Spring auto-configuration 漂移**：說明 classpath、profile、property、user-defined bean、condition order 和 artifact 差異如何導致不同 Bean graph，並提出 condition report、startup assertion 與 integration test 的證據。
5. **分析測試隔離與平行化**：分別評估 JUnit 5 extension／lifecycle、xUnit／NUnit fixture、runner adapter、test order、clock、temporary resource、資料庫、port、static state 和 async disposal；說明哪些可以平行，哪些必須隔離或序列化。
6. **設計可重現與可驗證的 pipeline**：固定 toolchain、repository、dependency version、lock／BOM、plugin、test runner、cache key、artifact checksum／SBOM，並說明 cache miss、mirror 不可用與 lock drift 的安全行為。
7. **提出分階段止血與修復**：先保留可回滾 artifact、限制受影響路徑、記錄完整診斷，再修正依賴／配置／fixture；至少提出三階段 rollout，每階段列成功指標、警戒線和 rollback 條件。
8. **設計故障注入與回歸矩陣**：至少涵蓋冷 cache／暖 cache、不同 JDK／SDK、私有 registry 不可用、依賴衝突、平行測試、慢資源、plugin reload、publish artifact 驗證與 canary 啟動。

## 期待證據

- 能用 commit、POM／lock state、JDK／SDK、Maven／NuGet plugin、repository 與 runner image 的 immutable 記錄重建實際輸入，而不是以「我的本機可以」作為證明。
- 能由 dependency tree／assets graph 指出 direct 與 transitive dependency、版本選擇規則、BOM／central version、source order 和 exclusion 的影響，並驗證最終 artifact 內容。
- 能把 NoSuchMethodError、ClassCastException、assembly load failure 與 compile success 分開，分別檢查 binary compatibility、ClassLoader／assembly identity、target framework／RID 和實際 publish output。
- 能說明泛型 type erasure、集合共享狀態、Lambda／Stream side effect 可能如何在測試或 runtime path 產生非預期行為，但不把所有失敗都歸因於語言特性。
- 能以 classpath、condition evaluation report、profile、property source、user-defined bean 與 startup bean graph 證明 Spring auto-configuration 為何不同。
- 能以 JUnit／xUnit／NUnit 的 lifecycle、fixture ownership、seed、test order、thread、resource cleanup 和 runner 設定重現 flaky test；知道 retry 只能是有界的診斷工具，不能取代隔離。
- 能區分 restore／compile／test／package／publish 的保證，並把 cache 視為可失效的加速層；cache key、checksum、SBOM 和 provenance 必須能偵測錯誤重用。
- 能提出至少一個針對 dependency drift、test contamination 或 publish mismatch 的 rollback，且不以跳過關鍵驗證作為長期解法。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議清 cache、全部升級、關閉測試或重跑 pipeline，沒有輸入、證據、隔離或 rollback。 |
| 1 | 能列出 Maven、NuGet、JUnit、xUnit／NUnit 或 Spring 的部分名詞，但無法連接 dependency、runtime、test 和 release 的故障因果鏈。 |
| 2 | 能指出依賴衝突、配置漂移或 flaky test 的部分原因，提出大致可行修復，但遺漏 toolchain reproducibility、artifact integrity 或至少一個核心隔離邊界。 |
| 3 | 能完成雙服務取證，鎖定 dependency／runtime／configuration／test isolation 問題，提出固定工具鏈、可驗證 cache、正確 fixture、分階段 rollout 與 rollback。 |
| 4 | 除上述內容外，能處理 binary compatibility、ClassLoader identity、condition ordering、transitive graph、部分完成的測試資源清理、冷暖 cache 差異與可逆 release trade-off，並給出可重現的故障注入矩陣。 |

### 通過標準

總分達 **3/4 分**才通過；依賴與工具鏈可重現性、runtime／configuration diagnosis、測試隔離、artifact／release rollback 四個核心面向均不得低於 2 分，且必須提出至少一個可執行的 rollback 條件。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先凍結兩個服務的 release candidate、commit、artifact digest 和 pipeline metadata，保留最後一個已知正常版本。接著把本機、CI、production 的差異拆成輸入差異、解析差異、執行期差異和測試環境差異，不應先清 cache 或把所有重試打開。

Java 方面先固定 JDK、Maven、plugin、profile、repository mirror、環境變數與 POM／BOM。輸出 effective POM 和完整 dependency tree，標出 direct／transitive path、nearest-wins、dependencyManagement、exclusion 以及 logging／JSON／framework family 的版本。對 release artifact 做 checksum、SBOM 與內容檢查，將 NoSuchMethodError 視為 binary compatibility 或實際 class path mismatch 的線索，將 ClassCastException 進一步對照載入該 class 的 ClassLoader identity，而不是只看 class 的全名。

若 plugin reload 後 metaspace 持續上升，應記錄每次載入的 ClassLoader、class unload、thread context ClassLoader 和 retained reference，確認舊 loader 是否被 static、thread、executor、callback 或 cache 保留。不同 loader 的同名 class 不能直接互換；plugin API 應放在明確共用的 parent boundary，或以序列化／穩定 DTO 交換，並在 unload 時清理 thread、resource 和 listener。

Spring 問題要對齊實際 classpath、profile、property source、user-defined bean 和 condition evaluation report。缺少可選 class、不同 dependency version、環境變數或 user bean 都可能讓 conditional 結果不同。應將關鍵 Bean graph 和 condition outcome 記錄在 startup evidence，加入使用真實 release artifact 的 integration test，並對必要 client／datasource 建立 fail-fast assertion。

JUnit 方面先收集失敗測試、執行順序、seed、thread、extension callback、temporary path、port、資料庫狀態、clock 和 teardown log。把共享資源改成每測試或每 worker 的隔離資源，使用 deterministic data、可控 clock、唯一 port／schema 和明確的 async cleanup；只有在 ownership、thread safety 和 reset 都被證明後才開啟平行化。retry 可以用來量測 intermittent rate，但不能作為通過門檻。

.NET 方面先固定 SDK、runtime、target framework、RID、NuGet source、credential policy、central version 和 lock state。比對 assets graph、direct／transitive package、source order 與 restore log，確認 cache key 是否包含上述輸入。restore 成功只代表套件解析成功，build 成功只代表編譯通過；test 要通過 runner／fixture，publish 則要檢查實際 runtime asset、檔案清單、checksum、SBOM 和 container／部署環境。

xUnit／NUnit 的 fixture lifecycle、instance reuse、setup／teardown、parallel worker、adapter 和 test filter 必須與資源 ownership 一起看。共享資料庫、檔案、port、static cache、singleton service 和 clock 應隔離或明確序列化；async cleanup 必須在 runner 結束測試前完成。若只停用平行測試，可能掩蓋污染而增加 pipeline 時間；應先建立可平行的 unit tests，再將真正共享的 integration fixture 分組並記錄原因。

建議三階段交付。第一階段凍結 release、補齊 toolchain／dependency／artifact metadata、啟用 cache integrity 與 startup／test diagnostics；若產物 digest、dependency drift、test failure rate 或 canary error 超過警戒線，立即回到已知正常 artifact。第二階段固定 Maven／NuGet inputs、dependency policy、lock／BOM、condition assertions、ClassLoader cleanup 和 test fixture isolation，通過冷暖 cache、私有 registry 不可用、不同 JDK／SDK、平行測試與慢資源故障注入。第三階段才調整 cache、parallelism、plugin 或 dependency upgrade，逐一變更並以 build duration、cache hit、test flake rate、startup failure、artifact diff、P95／P99 和 rollback time 驗證。

</details>

## 常見失分點

- 把 compile、restore 或 mvn test 通過當成 artifact 可以在另一個 runtime 安全執行，忽略 binary compatibility、ClassLoader、RID 和 publish output。
- 只刪除 Maven／NuGet cache 或把所有依賴升到最新版，卻沒有固定輸入、保留 dependency graph 和驗證 checksum。
- 把 Spring auto-configuration 異常歸因於 Spring 隨機，沒有查看 classpath、profile、property、user-defined bean 和 condition report。
- 把 flaky test 用全域 retry 或關閉平行化掩蓋，沒有處理 fixture ownership、shared database、port、clock、static state 和 async cleanup。
- 只比較本機與 CI 的命令，沒有比較 JDK／SDK、runner image、repository source、lock state、cache key、target framework 和 artifact。
- 回滾時只回滾原始碼，卻沒有回滾相應的 artifact digest、dependency lock、configuration 和 test environment。

## 延伸追問

1. 如果 dependency tree 看似一致，但 production 仍出現 NoSuchMethodError，你會如何確認實際 class path、fat JAR nested dependency 和 class loading 順序？
2. 如果同一個測試在冷 cache 失敗、暖 cache 通過，你會如何證明是 cache poisoning、非確定 repository 或測試 timing，而不是單純把 cache 關閉？
3. 如果 Spring condition report 顯示 Bean 已啟用，但 request 仍使用另一個實作，你會如何追查 proxy、profile、user-defined bean、context hierarchy 與 classloader？
4. 如果 xUnit／NUnit 平行測試必須保留，你會如何設計每 worker 的資料庫、temporary resource、port、clock、fixture 與 cleanup，並量化隔離成本？
5. 如果 Java 與 .NET 都需要升級主要 runtime，你會如何安排 compatibility matrix、雙版本 canary、artifact provenance 和 rollback，避免一次改動同時放大多個未知變因？
