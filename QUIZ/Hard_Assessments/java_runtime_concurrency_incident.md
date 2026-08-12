# Java Runtime Concurrency Incident：從 Thread Pool、JMM 到 GC 的延遲診斷

- **Assessment ID**: `assessment.java.runtime-concurrency.incident.v1`
- **主要 Concept ID**: `concept.java.concurrency.thread-pool-capacity`
- **次要 Concept IDs**:
  - `concept.java.concurrency.memory-model`
  - `concept.java.concurrency.monitor-locks`
  - `concept.java.jvm.gc-performance`
  - `concept.java.spring.ioc-lifecycle`
- **對應文章**:
  - [Java Memory Model](../../02_Backend_Development/Programming_Languages_and_Frameworks/Java/Concurrency/java_memory_model.md)
  - [synchronized 關鍵字](../../02_Backend_Development/Programming_Languages_and_Frameworks/Java/Concurrency/synchronized_keyword.md)
  - [Thread Pool](../../02_Backend_Development/Programming_Languages_and_Frameworks/Java/Concurrency/thread_pool.md)
  - [Java Garbage Collection](../../02_Backend_Development/Programming_Languages_and_Frameworks/Java/JVM/garbage_collection.md)
  - [Spring IoC 容器](../../02_Backend_Development/Programming_Languages_and_Frameworks/Java/Frameworks/Spring/ioc_container.md)
- **題型**: `生產事故診斷`, `並發容量`, `JVM 效能`, `Spring Runtime`, `權衡取捨`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 35 分鐘
- **標籤**: `Java`, `JVM`, `JMM`, `Thread Pool`, `GC`, `Spring IoC`, `Concurrency`
- **Learning Objective IDs**:
  - `concept.java.concurrency.thread-pool-capacity/LO-1`
  - `concept.java.concurrency.thread-pool-capacity/LO-2`
  - `concept.java.concurrency.thread-pool-capacity/LO-3`
  - `concept.java.concurrency.memory-model/LO-1`
  - `concept.java.concurrency.memory-model/LO-2`
  - `concept.java.concurrency.memory-model/LO-3`
  - `concept.java.concurrency.monitor-locks/LO-1`
  - `concept.java.concurrency.monitor-locks/LO-2`
  - `concept.java.concurrency.monitor-locks/LO-3`
  - `concept.java.jvm.gc-performance/LO-1`
  - `concept.java.jvm.gc-performance/LO-2`
  - `concept.java.jvm.gc-performance/LO-3`
  - `concept.java.spring.ioc-lifecycle/LO-1`
  - `concept.java.spring.ioc-lifecycle/LO-2`
  - `concept.java.spring.ioc-lifecycle/LO-3`

## 測驗目標

- 能從 thread pool、queue、下游容量、鎖競爭、JMM 與 GC 指標建立可驗證的事故因果鏈。
- 能區分容量過載、共享狀態不正確、鎖保護範圍過大、GC 壓力與 Spring scope 設計問題，而不是把所有延遲歸因於單一元件。
- 能提出有界並發、正確發布／同步、縮小 critical section、可觀測 GC 與安全 Bean scope 的分階段止血與修復方案。
- 能以 rollback、壓測、故障注入與 production evidence 驗證修復，不以「把 thread 數或 heap 調大」作為唯一答案。

## 問題情境與限制條件

某 Spring Boot checkout service 在促銷流量上升後出現以下現象：請求 P99 從 180 ms 上升到 8 秒，部分請求 timeout，pod 的 CPU 在尖峰時接近 100%，但資料庫連線池與資料庫 CPU 只有約 60%。同一時間觀察到：

- HTTP worker 將工作提交到一個幾乎無界的 `ThreadPoolExecutor`；queue depth 持續增加，active threads 接近 maximum，拒絕數一開始為 0，舊任務的等待時間遠高於實際執行時間。
- checkout service 注入的 singleton `InventoryReservationBean` 內有 mutable `HashMap` 與快取中的可變 reservation state；更新旗標沒有明確的 `volatile`、monitor 或 immutable snapshot。偶爾會出現 reservation 狀態落後、重試次數異常與難以重現的資料競爭。
- 為了保護庫存，`synchronized` 方法包住了本地狀態更新、遠端 inventory call 與部分資料庫操作。thread dump 顯示大量執行緒 BLOCKED 在同一 monitor，持鎖時間會隨下游延遲一起變長。
- GC log 顯示 allocation rate 在流量升高時顯著增加，young GC 變頻繁，偶爾出現長 Full GC；Full GC 後 old-generation live set 沒有立即回到原本水位。服務團隊只提出「把 maximum pool size 調大並把 heap 加倍」，沒有提供 workload、pause、live set 或下游容量證據。

你是當值 senior engineer。限制如下：不能直接把所有工作改成非同步微服務，不能移除庫存正確性保證，也不能只以單次重啟作為修復；必須先安全止血，再提出可分階段驗證與回滾的改動。

## 作答要求

1. **建立事故因果鏈**：依時間順序整理 queue、thread pool、下游等待、monitor contention、JMM data race、allocation／GC 與 P99 的關係，指出目前哪些只是症狀、哪些仍是假設。
2. **設計取證計畫**：列出至少十二項具體證據或實驗，至少涵蓋 thread dump／鎖、pool／queue、task latency、下游容量、JMM／資料競爭、GC／heap、Spring bean graph／scope 與請求 trace；說明每項證據如何支持或排除假設。
3. **提出安全止血**：在不破壞庫存正確性的前提下，設計 pool 上限、queue／rejection、入口限流、timeout／取消、下游 bulkhead 與 rollout／rollback；說明為何不能直接無條件增加執行緒。
4. **修正並發正確性**：重設 reservation state 的 ownership、可見性與 atomicity，說明何時使用 `volatile`、`synchronized`、Lock、atomic operation、immutable snapshot 或 message passing；指出遠端 I/O 應如何離開 critical section。
5. **診斷並改善 GC**：區分短命物件壓力、無界快取／leak、heap 配置、native memory 與 collector CPU 成本；提出需要的 GC log、heap dump／live set、allocation profile 與壓測比較，並定義可接受的 pause／P99 指標。
6. **修正 Spring lifecycle／scope**：說明 constructor injection、singleton／request scope、proxy 與 mutable state 的安排，並提出避免循環依賴、共享測試狀態與啟動期錯誤的設計。
7. **分階段交付與驗證**：給出至少三個階段的改動順序，每階段列出成功指標、警戒線、回滾條件與至少一項負載／故障注入測試。

## 期待證據

- 能以 queue wait、service time、active／maximum threads、rejection、下游 latency／connection pool 與 Little's Law 類型的容量推理說明 queue 無界並不代表吞吐量增加。
- 能透過 thread dump、鎖持有時間、monitor contention 與 trace 對齊，指出把遠端 I/O 放在 `synchronized` critical section 會放大 head-of-line blocking。
- 能清楚區分 visibility、atomicity 與 ordering；知道 `volatile` 不會讓複合的 reservation 更新具備 atomicity，也能提出 immutable／message passing 或正確互斥的替代方案。
- 能說明 singleton Bean 的共享可變狀態、scope 與測試隔離風險，並以 constructor injection 與明確 lifecycle 讓依賴與 ownership 可見。
- 能從 allocation rate、GC pause、heap occupancy、Full GC 後 live set、native memory、CPU 與 P99 的聯動區分 allocation pressure、leak 與配置／collector 問題。
- 能提出有界 queue、rejection／timeout、backpressure、bulkhead、cancellation、分階段 rollout 與 rollback，而不是只提高 pool size 或 heap size。
- 能把修復連到可觀測指標：P50／P99、queue wait、lock wait、stale／duplicate reservation、GC pause、live set、OOM、錯誤率與下游 saturation。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只把問題歸因於某一個參數，或提出會破壞庫存正確性、造成更多 queue／GC／重複更新的方案，沒有可驗證證據。 |
| 1 | 能列出 thread pool、鎖或 GC 的部分名詞，但沒有建立因果鏈，也未處理 JMM、Spring scope、下游容量或回滾。 |
| 2 | 能指出無界 queue、鎖競爭或 GC 壓力的一部分問題，提出大致可行的修復，但遺漏至少兩個核心面向或缺少量化驗證。 |
| 3 | 能完成容量與故障診斷，提出正確的可見性／互斥、critical section、Bean scope、GC evidence、backpressure 與分階段 rollout，並以指標驗證。 |
| 4 | 除上述內容外，能處理多個故障同時發生、未知下游結果、Full GC 後 live set、scope／proxy 交互、容量邊界與可逆部署，並明確說明 trade-off。 |

### 通過標準

總分達 **3/4 分**才通過；容量與背壓、並發正確性、JVM／Spring runtime 三個核心面向均不得低於 2 分，且必須提出至少一個可執行的 rollback 條件。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先把「請求變慢」拆成 queue wait、等待 monitor、下游呼叫、實際 CPU service time 與 GC pause。幾乎無界的 queue 只把過載轉成更長的等待與更多存活物件；當執行緒數增加，context switch、每請求記憶體與下游競爭也會增加。資料庫尚未滿載不代表可以無限增加 pool，因為 inventory API、連線池、CPU、鎖與 heap 可能先成為瓶頸。第一輪應保存 queue／active／rejection／task wait、請求 trace、thread dump、monitor contention、下游 latency／連線池、CPU 與 GC log 的同時時間線。

`synchronized` 保護本地 reservation state 可以提供互斥與可見性，但把遠端 inventory call 和資料庫 I/O 放在同一 monitor 內，會讓慢 I/O 轉成大量 BLOCKED threads。修復時應先明確定義 state ownership：例如以 immutable reservation snapshot 加原子版本／CAS，或用短 critical section 更新本地狀態，再在鎖外執行遠端呼叫，最後以版本條件或冪等狀態機提交結果。若需要 `volatile`，它只能保證特定欄位的可見性與排序，不能讓多欄位更新或 check-then-act 自動具備 atomicity；必須用正確鎖、atomic operation 或單一 owner／message passing。

止血應把 pool 與 queue 改成依下游容量和 SLO 推導的有界值，搭配入口限流、明確 timeout、取消、有限重試與 bulkhead。rejection 必須轉成可理解的 overload response、降級或排隊策略，而不是默默堆積；先以小流量 rollout，若 queue wait、P99、rejection、錯誤率或下游 saturation 超過警戒線就回滾。這樣可能降低短期接收量，但能保護已接收請求與整體穩定性。

GC 方面，應比較 allocation rate、young GC 頻率、pause、heap occupancy、Full GC 後 live set、cache size、heap dump／retained size、native memory 與 CPU。Full GC 後 live set 持續升高才支持 leak／無界 cache 假設；只有 allocation rate 與短命物件增加，則優先檢查序列化、批次與資料結構配置。heap 加倍可能延後 OOM 卻放大 pause 或降低容器 headroom，不能取代根因修復。collector 或 heap 變更要用相同 workload 對照，並以 P99、pause、吞吐量、RSS 與 OOM 風險設門檻。

Spring 方面，`InventoryReservationBean` 若是 singleton，就不應無保護地保存 request-specific mutable state；可改為 immutable configuration 加 request-local／transaction state，或選擇明確 request scope 並確認 proxy 與執行緒邊界。使用 constructor injection 讓必要依賴與 ownership 顯式化，在 composition root／configuration 中組合 pool、clock、repository、client 與策略；啟動時檢查 bean graph、condition report、scope 與 proxy，測試中每個案例建立隔離的容器或明確 fake。

建議分三階段：第一階段只做觀測、限流、pool／queue 上限與可回滾的保守設定，並以壓力和慢下游故障注入驗證；第二階段修正 state ownership、鎖邊界、冪等與 Bean scope，以 data-race／重複 reservation／lock contention 測試驗證；第三階段再依 allocation profile 調整資料結構、cache、heap／collector，並以固定 workload 比較 GC 與 P99。每一階段都保留舊路徑、feature flag、明確 rollback 與 post-deploy evidence，避免把多個尚未證明的改動同時推入 production。

</details>

## 常見失分點

- 看到 CPU 尚未滿載就直接把 maximum pool size 調大，忽略 queue wait、下游容量、鎖競爭、context switch 與 GC。
- 把無界 queue 當成背壓，或只用 queue size 判斷健康，沒有 task wait／service time 與 rejection policy。
- 認為 `volatile` 可以保護 `check-then-act` 或多欄位 reservation 更新，沒有區分 visibility 與 atomicity。
- 以 `synchronized` 包住遠端 I/O，或只換成 `Lock` 卻沒有縮小 critical section 與定義 ownership。
- 把 singleton Bean 當成無狀態而忽略 mutable map、scope、proxy 與測試污染。
- 只說「加大 heap／換 GC」，沒有比較 allocation、live set、pause、native memory、CPU 與 OOM 證據。
- 沒有設定 rollout、警戒線與 rollback，或一次同時改 pool、鎖、Bean scope 與 collector，導致無法歸因。

## 延伸追問

1. 如果 inventory provider 在 timeout 後其實已成功扣庫存，你如何設計狀態機、operation ID、冪等與 reconciliation，避免 retry 造成重複保留？
2. 如果把 request work 拆成多個 bounded pool，如何避免 thread pool 間互相等待造成 deadlock 或容量乘法？
3. 如果 Full GC 後 live set 下降但 P99 仍高，你會如何區分 lock contention、CPU saturation、下游 latency 與 collector concurrent work？
4. 如果 Spring 的 request-scoped Bean 被 singleton proxy 注入，哪些 lifecycle、非同步執行緒與測試場景需要特別驗證？
5. 如果壓測顯示 throughput 提升但 queue wait 和錯誤率惡化，你會以哪些 SLO／保護指標決定容量上限？
