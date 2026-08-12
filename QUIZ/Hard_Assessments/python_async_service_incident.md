# Python Async Service Incident：從事件循環、GIL 到記憶體與依賴生命週期

- **Assessment ID**: `assessment.python.async-service.incident.v1`
- **主要 Concept ID**: `concept.python.fastapi.async-route-runtime`
- **次要 Concept IDs**:
  - `concept.python.concurrency.model-selection`
  - `concept.python.core.gil`
  - `concept.python.internals.memory-management-gc`
  - `concept.python.fastapi.dependency-injection`
- **對應文章**:
  - [Python 併發模型](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Concurrency/threading_vs_multiprocessing_vs_asyncio.md)
  - [Python GIL](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Core/gil_explained.md)
  - [Python 記憶體管理與 GC](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Internals/memory_management_and_gc.md)
  - [FastAPI 異步路由處理](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/async_route_handlers.md)
  - [FastAPI 依賴注入系統](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/dependency_injection_system.md)
- **題型**: `生產事故診斷`, `事件循環`, `併發模型選擇`, `記憶體診斷`, `框架生命週期`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 35 分鐘
- **標籤**: `Python`, `FastAPI`, `AsyncIO`, `ASGI`, `GIL`, `Memory`, `Dependency Injection`
- **Learning Objective IDs**:
  - `concept.python.fastapi.async-route-runtime/LO-1`
  - `concept.python.fastapi.async-route-runtime/LO-2`
  - `concept.python.fastapi.async-route-runtime/LO-3`
  - `concept.python.concurrency.model-selection/LO-1`
  - `concept.python.concurrency.model-selection/LO-2`
  - `concept.python.concurrency.model-selection/LO-3`
  - `concept.python.core.gil/LO-1`
  - `concept.python.core.gil/LO-2`
  - `concept.python.core.gil/LO-3`
  - `concept.python.internals.memory-management-gc/LO-1`
  - `concept.python.internals.memory-management-gc/LO-2`
  - `concept.python.internals.memory-management-gc/LO-3`
  - `concept.python.fastapi.dependency-injection/LO-1`
  - `concept.python.fastapi.dependency-injection/LO-2`
  - `concept.python.fastapi.dependency-injection/LO-3`

## 測驗目標

- 能從 event-loop lag、task backlog、thread pool、GIL、GC／RSS 與下游指標建立可驗證的事故因果鏈。
- 能區分 async route 阻塞、CPU-bound 工作、I/O 模型錯配、無界 fan-out、記憶體保留與依賴生命週期問題。
- 能選擇 async client、thread／process pool、獨立 worker、限流與 semaphore，並說明每種方案的容量與可靠性代價。
- 能提出可測量、可分階段 rollout 且可回滾的 FastAPI 修復方案，而不是只增加 Uvicorn workers 或把所有操作包進 `asyncio.gather`。

## 問題情境與限制條件

某 FastAPI recommendation service 使用 `async def` endpoint `/recommendations`。促銷流量增加後，P99 從 300 ms 上升到 6 秒，部分請求 timeout；event-loop lag 偶爾超過 1.5 秒，CPU 接近 100%，pod RSS 在數小時內持續增加。資料庫 CPU 約 45%，但下游向量服務的 latency 變異很大。團隊提出「多開幾個 Uvicorn worker，並把所有下游呼叫改成 `asyncio.gather`」作為立即修復。

目前程式與 runtime 觀察到：

- async route 內直接呼叫同步 HTTP client，遇到 retry 時還會執行阻塞式 sleep；另一段純 Python 的 token 分段與 JSON 組裝在單一 request 內處理大量結果。
- route 對每個候選文件建立 coroutine 並一次 `gather`，沒有 semaphore、每租戶上限、timeout 或 cancellation；thread pool 的 active／queue 在尖峰時同步上升。
- 某個共享 dependency 透過全局 mutable cache 保存請求結果與 callback；另一個 yield dependency 建立資料庫 session，但 cleanup 行為沒有在 timeout／取消路徑被驗證。測試中用 dependency override，production 與測試的 scope 並不一致。
- GC 觸發頻率增加，循環引用數量與大 list 的存活時間上升；即使 GC 後部分物件已不可達，RSS 沒有立即下降。團隊尚未區分 allocator 保留、循環引用、無界 cache 與真正的 live object leak。

你是當值 senior engineer。限制如下：不能直接把所有功能拆成微服務，不能犧牲每租戶的資料隔離與 timeout 語意，也不能以重啟或單純增加 worker 數量作為唯一修復；必須先止血，再提出可驗證與可回滾的改動。

## 作答要求

1. **建立事故因果鏈**：依時間順序分析同步 client／阻塞 sleep、CPU-bound Python、GIL、event loop、unbounded gather、thread pool、GC／RSS 與 P99 的關係，區分已知證據和待驗證假設。
2. **設計取證計畫**：列出至少十二項證據或實驗，至少涵蓋 event-loop lag、async task、thread pool、下游 latency／連線池、CPU／GIL、GC／RSS／allocation、dependency scope／cleanup 與 request trace；說明每項如何支持或排除假設。
3. **提出安全止血**：設計請求併發上限、semaphore、queue／backpressure、timeout、cancellation、每租戶配額、下游 bulkhead 與 overload response；說明多 worker 和 `gather` 的容量乘法風險。
4. **選擇併發模型**：判斷哪些操作應使用真正的 async client、同步程式碼的受控 thread pool、CPU 工作的 process pool／獨立 worker 或批次化，並說明 GIL、IPC、序列化與部署成本。
5. **診斷記憶體問題**：區分 live object leak、全局 cache 無界增長、循環引用、allocator arena 保留與大批次暫存物件；提出 GC／tracemalloc／heap／RSS 對照與壓測方法。
6. **修正依賴生命週期**：說明 FastAPI 依賴樹、request cache、yield cleanup、global singleton 與 dependency override 的 scope，設計明確的 client／session／cache ownership 與取消清理。
7. **分階段交付與驗證**：至少提出三個階段，每階段列出成功指標、警戒線、rollback 條件，以及至少一項負載、慢下游、取消或 CPU 故障注入測試。

## 期待證據

- 能指出 `async def` 不會自動把同步 I/O 或 CPU 計算變成非阻塞；阻塞事件循環會使同一 worker 的所有請求一起排隊。
- 能用 event-loop lag、task backlog、request queue、thread pool queue／active、下游 latency 與 trace 對齊，找出 head-of-line blocking 和 fan-out 放大。
- 能區分 GIL 對純 Python CPU-bound 工作與 I/O／釋放 GIL 的 native extension 的影響，並說明 thread、process、asyncio 的成本與邊界。
- 能提出 bounded gather、semaphore、timeout、cancellation、per-tenant quota、bulkhead 與 backpressure，並說明 `gather` 不應無限制建立任務。
- 能從 tracemalloc／allocation profile、GC 統計、循環引用、cache cardinality、live objects、RSS 與容器限制區分 leak 和 allocator 保留。
- 能說明 dependency override 只影響測試不代表 production lifecycle 正確；yield dependency 必須在成功、例外、timeout 與 cancellation 路徑釋放資源。
- 能以 event-loop lag、P99、throughput、error／timeout、task count、RSS、GC pause、下游 saturation、每租戶公平性與 rollback time 驗證修復。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只增加 worker 或無界 `gather`，造成更大 task、記憶體或下游壓力，且沒有正確的事件循環、GIL 或 lifecycle 模型。 |
| 1 | 能列出 async、GIL、GC 或 FastAPI DI 的部分名詞，但無法建立因果鏈，也沒有可驗證的容量與回滾方案。 |
| 2 | 能指出阻塞 I/O、CPU-bound 或 memory growth 的部分問題，提出大致可行修復，但遺漏併發上限、取消、依賴清理或證據中的至少兩項。 |
| 3 | 能完成事件循環與容量診斷，正確選擇 async／thread／process，處理 GIL、fan-out、memory、DI lifecycle，並提出分階段驗證與 rollback。 |
| 4 | 除上述內容外，能處理取消與部分完成、每租戶公平性、未知下游結果、allocator 與 live leak 的區分、worker 容量乘法及可逆部署的邊界條件。 |

### 通過標準

總分達 **3/4 分**才通過；事件循環與背壓、併發模型與 GIL、記憶體／依賴生命週期三個核心面向均不得低於 2 分，且必須提出至少一個可執行的 rollback 條件。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

第一步要把 P99 拆成 event-loop wait、task queue wait、下游 I/O、CPU service time、thread pool wait 與 GC／allocator 影響。async route 內的同步 HTTP client 和 blocking sleep 會直接卡住事件循環；純 Python tokenization／JSON 組裝則會長時間持有 GIL，使同一 worker 無法及時處理其他協程。無界 `gather` 會把輸入數量直接轉成同時存在的 task、連線、暫存結果與 callback，讓 queue、RSS 和下游 latency 一起放大。

應先取 event-loop lag、active／pending task、task age、request trace、thread pool queue／active、CPU profile、下游連線池與 latency histogram 的時間線；用同步 client、慢下游、CPU payload、候選數量與取消請求做隔離實驗。若只增加 Uvicorn workers，每個 worker 都會複製 fan-out、連線池與 cache 容量，可能降低單 worker 的 lag 卻把總下游壓力與記憶體乘上 worker 數，不能代替容量設計。

止血應限制每請求候選數、每租戶併發與全局 in-flight task，使用 semaphore／bounded queue、明確 timeout、cancellation、有限 retry 與 bulkhead；過載時回傳可重試且可觀測的 overload response 或降級結果。下游呼叫改用真正的 async client；無法立即替換的同步 client 放入有界 thread pool，並為其設定 timeout 與 queue 上限。CPU-bound 的純 Python 工作不能靠更多 threads 繞過 GIL，應先縮小批次、快取可重用結果，或移到 process pool／獨立 worker，衡量序列化與 IPC 成本。

記憶體診斷要同時看 tracemalloc allocation／retained traceback、GC 計數與循環引用、cache cardinality、live object 數、request batch size、RSS 與容器限制。GC 後 RSS 不下降本身不能證明 leak：CPython allocator 可能保留 arena；但若 live objects、全局 cache 或 retained traceback 持續上升，就要修正 ownership、cache eviction、callback reference 或清理路徑。大 list 的暫存壽命則應以 streaming、分頁或 bounded batch 降低。

FastAPI dependency 應明確區分 request-scoped session、可安全共享且有連線池上限的 client，以及需要 eviction／隔離的 cache。yield dependency 必須在正常返回、例外、timeout 與 cancellation 後釋放 session；global mutable cache 不應默認視為安全 singleton。測試的 dependency override 要覆蓋 production 的資源 ownership、timeout、取消與 cleanup，不能只驗證 fake 被注入。

交付上，第一階段先加入 lag／task／RSS／下游觀測，限制 fan-out、timeout 與流量，慢下游故障注入超過警戒線就回滾。第二階段替換同步 I/O、建立 bounded thread／process pool、修正 dependency cleanup 與 cache policy，通過固定 workload、取消和每租戶公平性測試。第三階段再調整 worker 數、CPU batch、GC／allocator 相關設定，使用相同流量比較 P99、throughput、RSS、event-loop lag 與下游 saturation；每次只改一個主要變因，保留 feature flag 和 rollback。

</details>

## 常見失分點

- 以為 `async def` 或 `await` 會自動讓 `requests`、`time.sleep`、CPU 計算變成非阻塞。
- 用無界 `asyncio.gather` 解決延遲，卻沒有 task、連線、下游與每租戶的上限。
- 認為增加 thread 或 Uvicorn worker 就能繞過純 Python 工作的 GIL，忽略 process／IPC 和總容量乘法。
- 把 GC 後 RSS 沒下降直接判定為 leak，沒有比較 live object、cache cardinality、allocator arena 與 allocation traceback。
- 只在測試中 override dependency，沒有驗證 production 的 session cleanup、timeout、cancellation 與共享 client scope。
- 一次同時更換 event loop、worker 數、client、cache 與 GC 設定，導致無法歸因或回滾。

## 延伸追問

1. 如果某些下游呼叫只能使用同步 SDK，你如何設計 thread pool、連線池、timeout 與 shutdown，避免把 event loop 的問題轉移成 thread starvation？
2. 如果候選文件數量在租戶間差異很大，如何同時做到 bounded fan-out、每租戶公平性與高價值租戶的可控優先級？
3. 如果將 CPU tokenizer 移到 process pool 後 throughput 提升但 tail latency 變差，你會檢查哪些序列化、worker queue、CPU quota 與批次因素？
4. 如果 request timeout 發生在下游已部分完成時，如何處理取消、部分結果、重試與 cache 寫入的一致性？
5. 如果 tracemalloc 顯示 Python allocation 下降但 RSS 仍高，你會如何證明是 allocator 保留、native extension 或容器／runtime 配置問題？
