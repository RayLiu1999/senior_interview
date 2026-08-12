# C# ASP.NET Runtime Incident：從 async、Task、鎖、GC 到 DI 生命週期

- **Assessment ID**: `assessment.csharp.aspnet-runtime.incident.v1`
- **主要 Concept ID**: `concept.csharp.concurrency.async-await`
- **次要 Concept IDs**:
  - `concept.csharp.concurrency.task-thread`
  - `concept.csharp.concurrency.lock-monitor`
  - `concept.csharp.clr.garbage-collection`
  - `concept.csharp.aspnet-core.di-lifetimes`
- **對應文章**:
  - [C# async/await](../../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Concurrency/async_await_deep_dive.md)
  - [Task 與 Task&lt;T&gt;](../../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Concurrency/task_and_task_t.md)
  - [lock 與 Monitor](../../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Concurrency/lock_and_monitor.md)
  - [.NET 垃圾回收](../../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/CLR/garbage_collection.md)
  - [ASP.NET Core 依賴注入容器](../../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Frameworks/ASP.NET_Core/dependency_injection.md)
- **題型**: `生產事故診斷`, `非同步容量`, `執行緒競爭`, `記憶體診斷`, `生命週期取捨`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 35 分鐘
- **標籤**: `C#`, `.NET`, `ASP.NET Core`, `async/await`, `Task`, `GC`, `Dependency Injection`
- **Learning Objective IDs**:
  - `concept.csharp.concurrency.async-await/LO-1`
  - `concept.csharp.concurrency.async-await/LO-2`
  - `concept.csharp.concurrency.async-await/LO-3`
  - `concept.csharp.concurrency.task-thread/LO-1`
  - `concept.csharp.concurrency.task-thread/LO-2`
  - `concept.csharp.concurrency.task-thread/LO-3`
  - `concept.csharp.concurrency.lock-monitor/LO-1`
  - `concept.csharp.concurrency.lock-monitor/LO-2`
  - `concept.csharp.concurrency.lock-monitor/LO-3`
  - `concept.csharp.clr.garbage-collection/LO-1`
  - `concept.csharp.clr.garbage-collection/LO-2`
  - `concept.csharp.clr.garbage-collection/LO-3`
  - `concept.csharp.aspnet-core.di-lifetimes/LO-1`
  - `concept.csharp.aspnet-core.di-lifetimes/LO-2`
  - `concept.csharp.aspnet-core.di-lifetimes/LO-3`

## 測驗目標

- 能從 request latency、ThreadPool queue、Task 狀態、鎖競爭、GC counters 與 DI scope 建立可驗證的事故因果鏈。
- 能區分同步阻塞、非必要 `Task.Run`、未界限 fan-out、共享狀態競爭、GC 壓力與錯誤生命週期，而不是把所有問題歸因於單一參數。
- 能提出一路非同步、取消與 timeout、有界併發、適當的 async lock、正確的 DI scope 與可觀測 GC 修復方案。
- 能用分階段 rollout、壓力測試、慢下游故障注入與 rollback 指標驗證修復。

## 問題情境與限制條件

某 ASP.NET Core order API 在促銷流量上升後出現以下現象：P99 從 220 ms 上升到 7 秒，部分請求回傳 503 或 timeout；CPU 使用率約 75%，但 ThreadPool queue length 持續增加，資料庫 CPU 只有 50%。服務團隊提出「把所有工作包進 `Task.Run`、增加 server threads，並把 cache 改成 singleton」作為立即修復。

目前觀察到：

- `OrderService` 在部分路徑呼叫 `GetPriceAsync(...).Result`，另一段程式先取得 `lock` 再同步等待遠端結果。ASP.NET Core 本身通常沒有傳統 UI 的 SynchronizationContext，因此不能直接假設一定發生 classic deadlock；但 thread pool starvation、鎖競爭與 request timeout 已經可從 trace 和 dump 觀察到。
- 為了「平行」查詢多個 provider，程式對輸入的所有 item 建立 `Task.Run`，再使用 `Task.WhenAll`；沒有 item 上限、semaphore、timeout、取消或下游 bulkhead。部分 provider timeout 後，已完成的 Task 結果仍被保留在大型 list 中。
- `PriceCache` 是 singleton，內部使用普通 `Dictionary` 加長時間 `lock`；鎖內包含序列化、cache miss 的資料庫查詢與同步等待。另一個背景刷新工作也會操作同一份狀態。
- `OrderCoordinator` 是 singleton，透過未啟用 scope validation 的設定捕獲了 Scoped `DbContext`／repository；background service 會在多個任務間重用它。測試使用 service override，沒有覆蓋 production 的 scope、取消與 dispose 行為。
- GC counters 顯示 Gen 0／Gen 2 collection 和 allocation rate 上升，部分 response buffer 進入 LOH；Full／blocking collection 後 managed heap 有下降，但 process working set 沒有立即下降。團隊尚未區分 live object leak、長時間存活的 cache、LOH 壓力與 runtime 保留的記憶體。

你是當值 senior engineer。限制如下：不能只增加執行緒或 worker，不能移除訂單價格一致性與租戶隔離，也不能把所有工作直接拆成微服務；必須先安全止血，再提出可觀測、可分階段且可回滾的改動。

## 作答要求

1. **建立事故因果鏈**：依時間順序分析 `.Result`／`.Wait()`、`Task.Run`、`Task.WhenAll`、ThreadPool starvation、lock contention、GC 與 P99 的關係，區分已知證據和待驗證假設。
2. **設計取證計畫**：列出至少十二項具體證據或實驗，至少涵蓋 request trace、Task 狀態與例外、ThreadPool queue／active、鎖持有時間、下游 latency／連線池、GC／LOH／working set、DI graph／scope 與取消清理；說明每項如何支持或排除假設。
3. **提出安全止血**：設計 request timeout、CancellationToken 傳遞、provider fan-out 上限、SemaphoreSlim／bulkhead、有限 retry、overload response 與 rollout／rollback；說明為何無條件增加 `Task.Run` 或 threads 會放大容量問題。
4. **修正非同步與 Task 模型**：說明哪些工作應一路 async、哪些同步或 CPU-bound 工作才適合受控的 thread／process 邊界，並處理 Task 啟動、WhenAll 例外聚合、取消、未觀察例外與 `async void` 風險。
5. **修正共享狀態與鎖**：設計 cache ownership、短 critical section、同步 lock 與 `SemaphoreSlim` 的選擇，避免在 `lock` 內等待 I/O；若需要複合更新，說明如何保證 atomicity、取消與失敗回復。
6. **診斷並改善 GC／記憶體**：區分 Gen 0／Gen 2 壓力、LOH、大批次配置、長壽命 cache、事件訂閱／callback 保留與 allocator／working set 保留；提出 counters、trace、dump 與 workload 對照。
7. **修正 DI 與資源生命週期**：說明 Transient、Scoped、Singleton 的 ownership，修正 singleton capture scoped `DbContext`、background scope、DbContext concurrency 與 dispose；提出容器驗證和測試隔離方式。
8. **分階段交付與驗證**：給出至少三階段的改動順序，每階段列出成功指標、警戒線、rollback 條件，以及至少一項壓力、慢下游、取消或記憶體故障注入測試。

## 期待證據

- 能指出 `.Result`／`.Wait()` 會把非同步 I/O 轉成執行緒等待；即使 ASP.NET Core 沒有傳統 SynchronizationContext，也可能造成 ThreadPool starvation、延遲堆積與鎖放大，不能只用「一定死鎖」解釋。
- 能區分 I/O-bound 的 async、CPU-bound 的受控工作池與真正需要 Thread 的生命週期，並說明 `Task.Run` 不會讓同步 I/O 變成非阻塞。
- 能以 active／queued ThreadPool work、Task age、request P99、下游 latency、provider timeout、例外聚合與 cancellation trace 對齊 fan-out 的容量放大。
- 能提出 bounded `WhenAll`、semaphore、timeout、取消、bulkhead、每請求／每租戶配額與明確 overload 行為，避免把輸入數量直接轉成無限 Task。
- 能透過 lock contention、hold time、等待堆疊與 trace 指出 cache lock 內的序列化／資料庫 I/O 會造成 head-of-line blocking；知道 `lock` 不能包住 `await`，需要 async-compatible coordination。
- 能從 allocation rate、Gen 0／Gen 2 collection、LOH、GC pause、managed heap、working set、cache cardinality 與 dump 保留圖區分 leak、壓力與 runtime 記憶體保留。
- 能指出 singleton 捕獲 Scoped `DbContext` 會破壞 request isolation 與 thread safety；background work 應建立明確 scope，且每個並行工作使用獨立 context／unit of work。
- 能把修復連到 P50／P99、ThreadPool queue、lock wait、下游 saturation、Task cancellation、error／timeout、GC pause、LOH、working set 與 rollback time。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議增加 threads／`Task.Run` 或共享 `DbContext`，會放大 starvation、資料競爭或資源洩漏，且沒有可驗證證據。 |
| 1 | 能列出 async、Task、lock、GC 或 DI 的部分名詞，但沒有建立因果鏈，也未處理取消、下游容量、scope 或回滾。 |
| 2 | 能指出同步阻塞、無界 fan-out、鎖競爭或 GC 壓力的一部分問題，提出大致可行修復，但遺漏至少兩個核心面向或缺少量化驗證。 |
| 3 | 能完成容量與故障診斷，提出一路 async、bounded Task、取消、async lock、GC evidence、正確 DI scope 與分階段 rollout，並以指標驗證。 |
| 4 | 除上述內容外，能處理部分完成與取消競態、WhenAll 例外聚合、未知下游結果、LOH／working set 邊界、background scope 與可逆部署的 trade-off。 |

### 通過標準

總分達 **3/4 分**才通過；非同步與容量、共享狀態與鎖、GC／DI 生命週期三個核心面向均不得低於 2 分，且必須提出至少一個可執行的 rollback 條件。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先把 P99 拆成 ThreadPool queue wait、lock wait、下游 I/O、CPU service time、Task cancellation 與 GC pause。`.Result`／`.Wait()` 讓原本可釋放執行緒的 I/O 變成同步佔用；在 ASP.NET Core 通常不一定形成 classic SynchronizationContext deadlock，但當大量請求同時阻塞時，ThreadPool 會出現 starvation，新的 continuation 和 request work 無法及時取得執行緒。把同步 I/O 再包進 `Task.Run` 只會把等待搬到另一個有限的 pool，並增加排隊與 context switch。

`Task.WhenAll` 不是容量控制。對所有 item 一次建立 Task 會同時放大 provider 連線、暫存結果、序列化與下游限流；應限制輸入數量和 in-flight provider call，使用 `SemaphoreSlim` 或有界 worker，將 `CancellationToken` 傳到每個 client，設定整體與單一 provider timeout，並對部分完成結果定義明確語意。I/O-bound 路徑應一路 async；CPU-bound 的價格計算才考慮受控的 `Task.Run`／專用 worker，且要觀察 CPU quota、queue、取消與序列化成本。

Cache 的同步區域應只保護短小的查找、版本檢查或狀態交換，不能在 `lock` 內做資料庫、網路、序列化或同步等待。可以先在鎖外查詢，再用版本／compare-and-swap 或短 critical section 發布 immutable snapshot；若必須保護非同步流程，使用 `SemaphoreSlim.WaitAsync`，並確保 timeout、取消、release 與異常路徑正確。若同一 key 的 refresh 需要 single-flight，還要處理失敗後移除 in-flight state 和重試風暴。

DI 方面，`DbContext` 通常是 request-scoped、不可在多執行緒間共享，也不應被 singleton 捕獲。`OrderCoordinator` 應改為 scoped，或讓 singleton 只持有 thread-safe、無 request state 的依賴；background service 每次工作透過 scope factory 建立 scope，並讓每個並行工作使用自己的 context／unit of work，完成後 dispose。啟用 scope validation，對 constructor graph、background lifecycle、取消和 shutdown 做整合測試；測試 override 必須覆蓋實際的 scope 與 dispose 行為，而不只是注入 fake。

GC 診斷要把 managed heap、Gen 0／Gen 2 collection、LOH allocation／fragmentation、allocation rate、pause、cache cardinality、event subscription、dump retained graph 與 process working set 放在同一條時間線。Full GC 後 managed heap 降低但 working set 不立即下降，不能單獨證明 leak；若 live object、cache 或事件 callback 的保留路徑持續增長，才支持 leak 或 ownership 問題。大型 response／provider fan-out 應改為分頁、串流或 bounded batch，並用固定 workload 比較 allocation、P99、GC pause 與 working set，而不是只調整 GC 模式。

建議分三階段：第一階段加入 request／provider timeout、取消、fan-out 上限、ThreadPool／lock／GC／DI 指標，先以小流量 rollout；若 P99、queue、timeout 或下游 saturation 超過警戒線就回滾。第二階段移除 `.Result`／`.Wait()`、修正 Task 邊界、cache lock、background scope 與 DbContext ownership，通過慢下游、取消、並發 cache refresh、DbContext concurrency 與 scope validation 測試。第三階段再依 allocation profile 處理 LOH、批次、cache eviction 與 GC 設定，使用固定流量比較 P99、throughput、GC pause、working set 與下游壓力；每次只改一個主要變因並保留舊路徑。

</details>

## 常見失分點

- 把 ASP.NET Core 的所有 `.Result` 都直接稱為 classic deadlock，卻沒有說明 ThreadPool starvation、同步上下文與實際 dump／trace 證據。
- 用 `Task.Run` 包住同步 I/O，或對所有 item 無界 `Task.WhenAll`，沒有設定 timeout、取消、semaphore、provider bulkhead 與 overload 行為。
- 在 `lock` 內做資料庫、網路或序列化，或只把 `lock` 換成另一種鎖卻沒有縮小 critical section 和定義 cache ownership。
- 將 `DbContext` 放進 singleton、跨執行緒共享或讓 background service 長期持有，忽略 scope、thread safety 與 dispose。
- 把 Full GC 後 working set 未下降直接判定為 leak，沒有區分 LOH、長壽命 cache、事件訂閱、live object 與 runtime 保留。
- 只修改 worker／thread 數，不設定 rollout、警戒線與 rollback，導致下游或記憶體容量被進一步放大。

## 延伸追問

1. 如果 provider 在 timeout 後其實已完成價格計算，你如何設計 operation ID、冪等 cache write 與 reconciliation，避免 retry 覆蓋較新的價格？
2. 如果 `Task.WhenAll` 中一個 provider 失敗，其他 provider 已完成，你會如何處理例外聚合、取消、部分結果與可重試性？
3. 如果 cache refresh 必須避免同一 key 重複查詢，你如何設計 single-flight、失敗清理、租戶隔離與 stampede protection？
4. 如果 background service 需要同時處理大量訂單，如何決定 scope 數量、DbContext pool、provider concurrency 與 graceful shutdown 行為？
5. 如果 managed heap 穩定但 working set 持續增加，你會如何排除 native buffer、socket、GC heap segment 與容器記憶體限制？
