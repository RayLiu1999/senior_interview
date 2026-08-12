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
