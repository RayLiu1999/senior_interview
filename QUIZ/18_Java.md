# Java - 重點考題 (Quick Quiz)

> 這份考題從 Java 的 JVM、並發與 Spring runtime 主題中挑選重要程度 5 的核心題目，先檢查原理與診斷思路，再進入整合型 Hard Assessment。
>
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

## 🧠 Java Memory Model

<a id="q1"></a>
### Q1: Java Memory Model 如何保證並發程式的可見性與有序性？
<!-- Concept ID: concept.java.concurrency.memory-model; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請區分 visibility、atomicity、ordering、happens-before 與 data race，並比較 `volatile`、`synchronized`、Lock、immutable object 與 message passing 的適用情境。

<details>
<summary>💡 答案提示</summary>

- visibility 是一個執行緒能否看到另一個執行緒寫入的最新值；atomicity 是操作是否不可被觀察到中間狀態；ordering 是操作在跨執行緒觀察時是否維持可推導的順序。
- happens-before 是 Java 語言提供的可見性與排序關係，例如同一把 monitor 的 unlock→lock、對 `volatile` 的寫入→讀取，以及 `Thread.start()`／`join()` 的規則。
- `volatile` 適合狀態旗標或單次讀寫的發布，不會把 `count++` 變成 atomic；需要複合操作互斥時使用 `synchronized`／Lock，或改用 immutable state 與 message passing 降低共享可變狀態。
- 診斷時要把 stale read、重排序、data race 與 lock contention 分開，結合 thread dump、事件時間線、程式碼同步邊界與壓力測試驗證假設。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Java/Concurrency/java_memory_model.md)

---

## 🔒 Monitor 與鎖競爭

<a id="q2"></a>
### Q2: `synchronized` 的正確性保證與效能成本是什麼？
<!-- Concept ID: concept.java.concurrency.monitor-locks; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 `synchronized` 的 monitor、互斥、可見性與 reentrancy，並分析它與 `Lock`、`ReadWriteLock` 及無鎖資料結構的取捨。

<details>
<summary>💡 答案提示</summary>

- `synchronized` 以 monitor 建立進入與離開的互斥邊界，同時提供記憶體可見性與 reentrant 行為；離開 monitor 後的寫入可被之後取得同一 monitor 的執行緒觀察。
- `Lock` 可提供可中斷、限時取得、條件變數等更細的控制，但也要求明確 unlock；`ReadWriteLock` 只在讀多寫少且臨界區足夠大時可能有收益。
- 不能只看鎖本身的微基準；應觀察 critical section、blocked threads、lock hold time、queue latency、死結風險與下游等待。
- 優先縮小鎖保護的狀態與持有時間，避免在鎖內做網路／資料庫 I/O；若共享狀態不適合互斥，可改用 immutable snapshot、原子操作或訊息傳遞。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Java/Concurrency/synchronized_keyword.md)

---

## 🧵 Thread Pool 與容量

<a id="q3"></a>
### Q3: 如何為 Java 服務設計有界且可診斷的 Thread Pool？
<!-- Concept ID: concept.java.concurrency.thread-pool-capacity; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請解釋 `ThreadPoolExecutor` 的 core／maximum pool size、queue、keep-alive 與拒絕策略，並說明如何依 workload 與下游容量設定背壓。

<details>
<summary>💡 答案提示</summary>

- 任務通常先使用 core threads；核心執行緒忙碌後進入 queue，queue 滿了才可能擴展到 maximum；仍無法接收時才觸發 rejection，這些參數共同決定等待與併發上限。
- CPU-bound 工作受 CPU 與 context switch 限制；I/O-bound 工作雖可需要較多執行緒，但仍不能超過資料庫、外部 API、連線池與記憶體可承受的容量。
- 優先使用有界 queue、明確 rejection／timeout、取消未開始任務與入口限流，避免無界 queue 用記憶體掩蓋過載。
- 需要同時觀察 active threads、queue depth、task wait／run latency、rejection count、下游 saturation、CPU、GC 與請求 P99，而不是只把 maximum pool size 調大。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Java/Concurrency/thread_pool.md)

---

## ♻️ JVM Garbage Collection

<a id="q4"></a>
### Q4: 遇到 Java 延遲尖峰時，如何判斷是 GC 壓力、記憶體洩漏還是錯誤配置？
<!-- Concept ID: concept.java.jvm.gc-performance; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請從 GC Roots、可達性、分代、allocation rate、pause 與 collector 行為出發，設計一套不依賴「直接加大 heap」的診斷與調優方法。

<details>
<summary>💡 答案提示</summary>

- GC 透過 GC Roots 與可達性判斷物件是否仍被使用；短命物件與長命物件的分布、allocation rate 與 collector 的併行／停頓特性會影響延遲。
- 先對齊 GC log、pause 時間、heap occupancy、allocation rate、live set、native memory、CPU、請求 P99 與 OOM 時間線；不能只看 heap 使用率。
- 若 Full GC 後 live set 仍上升，要懷疑 leak 或無界 cache；若 allocation rate 突升，可能是流量、序列化或批次大小；若 CPU 飽和，也可能是 concurrent GC 的成本。
- 調整 heap、collector、allocation pattern、cache／批次策略或流量時，必須用代表性 workload 和 rollback 指標驗證 pause、吞吐量與 tail latency。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Java/JVM/garbage_collection.md)

---

## 🌱 Spring IoC 與 Bean Lifecycle

<a id="q5"></a>
### Q5: Spring IoC 的 Bean lifecycle 與 scope 如何影響並發安全和可測試性？
<!-- Concept ID: concept.java.spring.ioc-lifecycle; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明 Bean definition、建立、注入、初始化、proxy、scope 與 destroy 的關係，並設計能避免循環依賴與共享 mutable singleton 問題的注入方式。

<details>
<summary>💡 答案提示</summary>

- IoC 容器依 Bean definition 建立物件、解析依賴、執行初始化與 post-process／proxy，最後在 context 關閉時處理 destroy；這不是單純的 `new` 替代品。
- constructor injection 讓必要依賴顯式化，也讓測試能直接組合 fake；scope 應與狀態生命週期一致，request state 不應無保護地放在 singleton。
- singleton Bean 若持有 mutable state，必須證明同步策略、隔離方式與可見性；更好的選項通常是 immutable configuration、request-local state 或明確的外部 storage。
- 診斷需查看 startup／condition report、bean graph、scope、proxy 邊界、記憶體與請求延遲，不要只以「容器啟動成功」判定設計正確。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Java/Frameworks/Spring/ioc_container.md)

---

## 🧩 Java Language、Collections 與 Class Loading

<a id="q6"></a>
### Q6: Java 8+ 的 Lambda、Stream 與 Optional 如何避免語意和效能陷阱？
<!-- Concept ID: concept.java.core.modern-language-features; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較 Lambda、函數式介面、Stream 的 lazy／terminal operation、parallel stream 與 Optional 的適用邊界，並說明如何避免 shared mutable state 和不必要的配置成本。

<details>
<summary>💡 答案提示</summary>

- Lambda 是函數式介面的實作；capture 的區域變數必須 effectively final，不能把語法簡潔誤當成沒有狀態或沒有配置。
- Stream pipeline 在 terminal operation 前通常是 lazy；中間操作不會自行執行，side effect、短路與 encounter order 會影響結果。
- parallel stream 需要資料量、切分成本、common pool 容量與下游 thread safety 都合理；網路或資料庫 I/O 通常不適合直接平行化。
- Optional 適合表達可能不存在的回傳值；使用 orElse 與 orElseGet 時要留意 eager evaluation 和副作用。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Java/Core/java8_plus_features.md)

---

<a id="q7"></a>
### Q7: Java 泛型的型別擦除與 PECS 如何影響 API 設計？
<!-- Concept ID: concept.java.core.generics-type-erasure; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 type erasure、raw type、extends／super 通配符與 heap pollution 的關係，並解釋為何泛型陣列和某些 runtime cast 會受到限制。

<details>
<summary>💡 答案提示</summary>

- 泛型主要在編譯期提供型別檢查，runtime 會擦除多數型別參數，因此不能直接建立 new T[]，也不能依不同泛型參數做 overload。
- PECS 是 producer extends、consumer super：讀取來源通常使用 extends，寫入接收者通常使用 super。
- raw type 會繞過編譯器檢查，錯誤可能延遲到讀取時的 ClassCastException；unchecked cast 應縮小範圍並證明安全。
- bridge method、泛型陣列與反射或序列化邊界都要處理 runtime 型別資訊不能完整保留的限制。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Java/Core/generics_explained.md)

---

<a id="q8"></a>
### Q8: 如何依 workload 選擇 Java 集合，並避免容量與並發陷阱？
<!-- Concept ID: concept.java.core.collections-selection-concurrency; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請比較 ArrayList、HashMap、TreeMap、LinkedHashMap 與 ConcurrentHashMap 的複雜度、記憶體、順序和並發語意，並提出容量設定與診斷方法。

<details>
<summary>💡 答案提示</summary>

- 複雜度只是平均或攤銷結果；還要考慮 hash collision、resize、boxing、記憶體 locality、entry overhead 與資料量分布。
- LinkedHashMap 可維持插入或存取順序；ConcurrentHashMap 提供並發操作語意，但不會自動讓複合 read-modify-write 成為 atomic。
- 不能把普通 HashMap 加外部讀鎖就當成可安全發布；要選 immutable snapshot、明確鎖、原子 API 或正確並發集合。
- 應以 allocation、resize、命中率、鎖等待、併發讀寫與 P99 觀察容量選擇，而不是只依據 O(1)。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Java/Core/java_collections_framework.md)

---

<a id="q9"></a>
### Q9: JVM ClassLoader 如何造成類別隔離、版本衝突與記憶體問題？
<!-- Concept ID: concept.java.jvm.class-loading-isolation; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請說明 class loading、linking、initialization、parent delegation 與 class identity，並設計 plugin 或熱部署場景的診斷步驟。

<details>
<summary>💡 答案提示</summary>

- JVM 會先載入 class bytes，再進行驗證、準備、解析與初始化；初始化失敗也會影響後續觀察。
- 同名且同 package 的 class 由不同 ClassLoader 載入時仍是不同型別，可能造成 cast failure、SPI 找不到 provider 或 proxy 邊界不相容。
- parent delegation 先讓父 loader 尋找核心與共用類別；plugin 若破壞此模型，必須清楚定義 ownership。
- 取證要對齊 classpath、JAR 版本、載入者 identity、thread context ClassLoader、metaspace、class unload 與 retained reference。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Java/JVM/class_loading.md)

---

## 🧪 Java Testing 與 Build Toolchain

<a id="q10"></a>
### Q10: JUnit 5 如何設計可隔離、可重現且能安全平行化的測試？
<!-- Concept ID: concept.java.testing.junit5-lifecycle-isolation; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請比較 JUnit 5 的 lifecycle、extension、parameterized test、timeout 與 Spring integration test，並說明 flaky test 的取證與修復順序。

<details>
<summary>💡 答案提示</summary>

- BeforeEach、AfterEach、測試 instance lifecycle 與 extension callback 決定 fixture 是否共享；PER_CLASS 需證明 state reset 和 thread safety。
- parameterized 或 dynamic test 要讓輸入、seed、時間與外部資源可追蹤；不要用 retry 掩蓋非 deterministic 行為。
- 平行測試前要隔離資料庫 schema、檔案、port、clock、environment property 與 singleton cache，並把 teardown 放在正確 ownership 邊界。
- 先收集失敗順序、seed、thread、resource cleanup、timeout 與 CI cache，再判斷是測試、runner、extension、環境或應用程式 race。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Java/Testing/junit5_advanced.md)

---

<a id="q11"></a>
### Q11: Maven 如何處理依賴衝突，並建立可重現的 build？
<!-- Concept ID: concept.java.build.maven-reproducibility-dependency; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請說明 Maven lifecycle、scope、plugin、transitive dependency、nearest-wins 與 dependencyManagement，並提出 CI cache 和 release artifact 的驗證策略。

<details>
<summary>💡 答案提示</summary>

- validate、compile、test、package、verify 等 phase 形成有順序的 lifecycle；跳過 test 或只看 compile 不能證明可發布。
- 依賴衝突要從完整 dependency graph、直接或傳遞路徑、BOM、dependencyManagement 與 exclusions 判斷。
- 可重現 build 需要固定 JDK、Maven、plugin、dependency、repository、profile 與環境輸入，並驗證 artifact checksum 或 SBOM。
- cache key 應包含 POM、lock、工具鏈與 repository policy；命中 cache 只代表重用資料，不代表 artifact 正確。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Java/Build_Tools/maven_basics.md)

---

<a id="q12"></a>
### Q12: Spring Boot 自動配置為何在不同環境產生不同結果？
<!-- Concept ID: concept.java.spring-boot.auto-configuration-conditions; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請從 classpath、condition、property、profile、user-defined bean 與 auto-configuration order 解釋本機正常、CI 或 production 失敗的可能原因，並列出取證順序。

<details>
<summary>💡 答案提示</summary>

- 自動配置會依 classpath、Conditional、property、profile 與既有 Bean 決定是否註冊，版本升級也可能改變條件和順序。
- 先對齊實際 artifact、啟用 profile、環境變數、property source、condition evaluation report 與 dependency graph，再判斷是配置漂移還是 regression。
- MissingBean 讓 user-defined bean 覆蓋預設配置；多個 auto-configuration 之間還可能有 before 或 after 順序依賴。
- 修復要固定輸入、增加 startup assertion 和 observability，並以真實 artifact 的 integration test 驗證。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Java/Frameworks/Spring_Boot/auto_configuration.md)
