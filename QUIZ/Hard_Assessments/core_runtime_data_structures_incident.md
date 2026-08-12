# Core Runtime & Data Structures Incident：從資料結構選擇到多語言執行時取捨

- **Assessment ID**: `assessment.core-runtime.data-structures.incident.v1`
- **主要 Concept ID**: `concept.algorithms.graph-traversal.dfs-bfs-selection`
- **次要 Concept IDs**:
  - `concept.data-structures.hash-table.collision-resolution`
  - `concept.algorithms.dynamic-programming.state-transition`
  - `concept.data-structures.heap.top-k`
  - `concept.algorithms.sorting.algorithm-tradeoffs`
  - `concept.algorithms.binary-search.boundaries`
  - `concept.distributed-systems.rate-limiting.token-leaky-bucket`
  - `concept.distributed-systems.distributed-id.generation-strategies`
  - `concept.data-structures.bloom-filter.false-positive`
  - `concept.data-structures.b-plus-tree.indexing`
  - `concept.data-structures.lru-cache.o1-operations`
  - `concept.distributed-systems.consistent-hashing.virtual-nodes`
  - `concept.operating-system.io-models.model-selection`
  - `concept.operating-system.thread-synchronization.lock-selection`
  - `concept.operating-system.deadlock.prevention-avoidance`
  - `concept.operating-system.process-thread.concurrency-model`
  - `concept.operating-system.io-multiplexing.epoll-select-poll`
  - `concept.operating-system.ipc.mechanism-selection`
  - `concept.operating-system.virtual-memory.paging`
  - `concept.operating-system.disk-io.zero-copy`
  - `concept.network.tcp.connection-management`
  - `concept.go.concurrency.read-write-locks`
  - `concept.go.concurrency.waitgroup-synchronization`
  - `concept.go.internals.interface-representation`
  - `concept.go.internals.defer-return-values`
  - `concept.go.internals.concurrent-gc`
  - `concept.go.internals.slice-array-representation`
  - `concept.csharp.core.dictionary-hashing`
  - `concept.csharp.core.linq-deferred-execution`
  - `concept.csharp.core.value-reference-types`
  - `concept.csharp.core.generics-reification`
  - `concept.csharp.core.delegates-events`
  - `concept.csharp.clr.span-memory`
  - `concept.csharp.concurrency.concurrent-collections`
  - `concept.python.core.generators`
  - `concept.python.core.decorators`
  - `concept.python.core.data-model`
  - `concept.python.core.descriptor-protocol`
  - `concept.python.internals.object-identity`
  - `concept.python.django.queryset-optimization`
  - `concept.python.frameworks.web-framework-selection`
- **對應文章**:
  - **資料結構與演算法**
    - [dfs_bfs_comprehensive](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/dfs_bfs_comprehensive.md)
    - [hash_table_implementation](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/hash_table_implementation.md)
    - [dynamic_programming_basics](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/dynamic_programming_basics.md)
    - [heap_implementation](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/heap_implementation.md)
    - [sorting_algorithms_comparison](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/sorting_algorithms_comparison.md)
    - [binary_search_variants](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/binary_search_variants.md)
    - [rate_limiting_algorithms](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/rate_limiting_algorithms.md)
    - [distributed_id_generation](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/distributed_id_generation.md)
    - [bloom_filter](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/bloom_filter.md)
    - [b_tree_and_b_plus_tree](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/b_tree_and_b_plus_tree.md)
    - [lru_cache_implementation](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/lru_cache_implementation.md)
    - [consistent_hashing](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/consistent_hashing.md)
  - **作業系統與網路**
    - [io_models_comparison](../../01_Computer_Science_Fundamentals/Operating_System/io_models_comparison.md)
    - [thread_synchronization](../../01_Computer_Science_Fundamentals/Operating_System/thread_synchronization.md)
    - [deadlock_prevention](../../01_Computer_Science_Fundamentals/Operating_System/deadlock_prevention.md)
    - [process_vs_thread](../../01_Computer_Science_Fundamentals/Operating_System/process_vs_thread.md)
    - [epoll_select_poll](../../01_Computer_Science_Fundamentals/Operating_System/epoll_select_poll.md)
    - [inter_process_communication](../../01_Computer_Science_Fundamentals/Operating_System/inter_process_communication.md)
    - [virtual_memory_paging](../../01_Computer_Science_Fundamentals/Operating_System/virtual_memory_paging.md)
    - [disk_io_optimization](../../01_Computer_Science_Fundamentals/Operating_System/disk_io_optimization.md)
    - [tcp_handshake_and_termination](../../01_Computer_Science_Fundamentals/Networking/tcp_handshake_and_termination.md)
  - **Go runtime**
    - [mutex_vs_rwmutex](../../02_Backend_Development/Programming_Languages_and_Frameworks/Go/Concurrency/mutex_vs_rwmutex.md)
    - [waitgroup_usage](../../02_Backend_Development/Programming_Languages_and_Frameworks/Go/Concurrency/waitgroup_usage.md)
    - [interface_internals](../../02_Backend_Development/Programming_Languages_and_Frameworks/Go/Internals/interface_internals.md)
    - [defer_execution](../../02_Backend_Development/Programming_Languages_and_Frameworks/Go/Internals/defer_execution.md)
    - [go_garbage_collection](../../02_Backend_Development/Programming_Languages_and_Frameworks/Go/Internals/go_garbage_collection.md)
    - [slice_vs_array](../../02_Backend_Development/Programming_Languages_and_Frameworks/Go/Internals/slice_vs_array.md)
  - **C# runtime**
    - [collections_framework](../../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Core/collections_framework.md)
    - [linq_deep_dive](../../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Core/linq_deep_dive.md)
    - [value_vs_reference_types](../../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Core/value_vs_reference_types.md)
    - [generics_explained](../../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Core/generics_explained.md)
    - [delegates_and_events](../../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Core/delegates_and_events.md)
    - [span_and_memory](../../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/CLR/span_and_memory.md)
    - [concurrent_collections](../../02_Backend_Development/Programming_Languages_and_Frameworks/CSharp/Concurrency/concurrent_collections.md)
  - **Python runtime**
    - [generators_and_yield](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Core/generators_and_yield.md)
    - [decorators_explained](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Core/decorators_explained.md)
    - [python_data_model](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Core/python_data_model.md)
    - [descriptors_protocol](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Core/descriptors_protocol.md)
    - [python_object_model](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Internals/python_object_model.md)
    - [django_queryset_optimization](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/django_queryset_optimization.md)
    - [django_vs_flask_vs_fastapi](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/django_vs_flask_vs_fastapi.md)
- **題型**: `事故診斷`, `資料結構與演算法選擇`, `OS I/O 與同步`, `多語言 runtime 取捨`, `容量與正確性審查`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 60 分鐘
- **標籤**: `Data Structures`, `Algorithms`, `Operating System`, `Networking`, `Go Runtime`, `C# Runtime`, `Python Runtime`, `Complexity`, `Memory`, `Concurrency`
- **Learning Objective IDs**:
  - `concept.algorithms.graph-traversal.dfs-bfs-selection/LO-1, LO-2, LO-3`
  - `concept.data-structures.hash-table.collision-resolution/LO-1, LO-2, LO-3`
  - `concept.algorithms.dynamic-programming.state-transition/LO-1, LO-2, LO-3`
  - `concept.data-structures.heap.top-k/LO-1, LO-2, LO-3`
  - `concept.algorithms.sorting.algorithm-tradeoffs/LO-1, LO-2, LO-3`
  - `concept.algorithms.binary-search.boundaries/LO-1, LO-2, LO-3`
  - `concept.distributed-systems.rate-limiting.token-leaky-bucket/LO-1, LO-2, LO-3`
  - `concept.distributed-systems.distributed-id.generation-strategies/LO-1, LO-2, LO-3`
  - `concept.data-structures.bloom-filter.false-positive/LO-1, LO-2, LO-3`
  - `concept.data-structures.b-plus-tree.indexing/LO-1, LO-2, LO-3`
  - `concept.data-structures.lru-cache.o1-operations/LO-1, LO-2, LO-3`
  - `concept.distributed-systems.consistent-hashing.virtual-nodes/LO-1, LO-2, LO-3`
  - `concept.operating-system.io-models.model-selection/LO-1, LO-2, LO-3`
  - `concept.operating-system.thread-synchronization.lock-selection/LO-1, LO-2, LO-3`
  - `concept.operating-system.deadlock.prevention-avoidance/LO-1, LO-2, LO-3`
  - `concept.operating-system.process-thread.concurrency-model/LO-1, LO-2, LO-3`
  - `concept.operating-system.io-multiplexing.epoll-select-poll/LO-1, LO-2, LO-3`
  - `concept.operating-system.ipc.mechanism-selection/LO-1, LO-2, LO-3`
  - `concept.operating-system.virtual-memory.paging/LO-1, LO-2, LO-3`
  - `concept.operating-system.disk-io.zero-copy/LO-1, LO-2, LO-3`
  - `concept.network.tcp.connection-management/LO-1, LO-2, LO-3`
  - `concept.go.concurrency.read-write-locks/LO-1, LO-2, LO-3`
  - `concept.go.concurrency.waitgroup-synchronization/LO-1, LO-2, LO-3`
  - `concept.go.internals.interface-representation/LO-1, LO-2, LO-3`
  - `concept.go.internals.defer-return-values/LO-1, LO-2, LO-3`
  - `concept.go.internals.concurrent-gc/LO-1, LO-2, LO-3`
  - `concept.go.internals.slice-array-representation/LO-1, LO-2, LO-3`
  - `concept.csharp.core.dictionary-hashing/LO-1, LO-2, LO-3`
  - `concept.csharp.core.linq-deferred-execution/LO-1, LO-2, LO-3`
  - `concept.csharp.core.value-reference-types/LO-1, LO-2, LO-3`
  - `concept.csharp.core.generics-reification/LO-1, LO-2, LO-3`
  - `concept.csharp.core.delegates-events/LO-1, LO-2, LO-3`
  - `concept.csharp.clr.span-memory/LO-1, LO-2, LO-3`
  - `concept.csharp.concurrency.concurrent-collections/LO-1, LO-2, LO-3`
  - `concept.python.core.generators/LO-1, LO-2, LO-3`
  - `concept.python.core.decorators/LO-1, LO-2, LO-3`
  - `concept.python.core.data-model/LO-1, LO-2, LO-3`
  - `concept.python.core.descriptor-protocol/LO-1, LO-2, LO-3`
  - `concept.python.internals.object-identity/LO-1, LO-2, LO-3`
  - `concept.python.django.queryset-optimization/LO-1, LO-2, LO-3`
  - `concept.python.frameworks.web-framework-selection/LO-1, LO-2, LO-3`

## 測驗目標

- 從輸入規模、資料分布、查詢型態、複雜度、記憶體與尾端延遲推導資料結構和演算法選擇，而不是只列出名詞。
- 把 I/O 等待、資料拷貝、頁面置換、檔案描述符、TCP 連線狀態與同步原語連成可驗證的 OS／網路故障模型。
- 比較 Go、C# 與 Python 在配置、GC／引用計數、惰性執行、型別表示、緩衝區生命週期與併發模型上的取捨。
- 設計具備背壓、冪等、取消、重試、重啟恢復與可回滾門檻的修復方案，並用量測與測試證明正確性。

## 問題情境與限制條件

某「即時候選推薦與批次特徵計算平台」把事件接收、候選搜尋、排序、快取和結果發布拆成 Go ingestion、C# ranking、Python feature 三個服務。平台最近把日流量從 2 億事件提升到 15 億事件，並將多租戶資料放到可水平擴展的分片儲存中。部署後同時出現以下症狀：

- API P99 從 180ms 升到 4.2s，尖峰時有 503；平均 CPU 只有 55%，但 I/O wait、run queue 和尾端延遲明顯升高。
- Go ingestion 的 RSS 從 350MB 漲到 1.1GB，GC CPU 上升，少數請求回報重複事件或遺失事件；重啟後有一批事件被再次發布。
- C# ranking 的相同查詢在不同流量下產生不同的資料庫往返次數。某些租戶的結果排序錯誤，偶爾還會看到同一個 key 的初始化函數被執行多次。
- Python feature 服務在大批次輸入時記憶體暴增；改成生成器後延遲變好，但一個裝飾器讓取消和例外資訊消失，Django 查詢在關聯資料頁面出現 N+1。
- 主機的 `TIME_WAIT`、`CLOSE_WAIT`、SYN backlog、檔案描述符和磁碟佇列在同一時間升高；部分 worker 卡在等待鎖或等待子程序，另一些 worker 因頁面抖動而失去吞吐量。

目前實作把所有事件先放入可增長的集合，再完整排序；候選圖以不同服務各自維護，既有無權最短路徑、非負權路徑，也有離線分析的負權邊。熱點查詢混用 hash table、LRU、Bloom filter、B+ tree、heap 和一致性雜湊。部分路徑使用遞迴 DFS、動態規劃、二分搜尋與限流演算法，但沒有共同的容量和正確性契約。

限制條件如下：

- 單一服務實例的 RSS 上限為 768MB；推薦 API 的 P99 目標為 250ms，批次特徵可以延遲，但不可無界堆積。
- 事件必須依 tenant、版本和事件 ID 可重放；同一事件在重試或程序重啟後不可重複發布。允許明確標記的 at-least-once，不接受未說明的 silent loss。
- 候選圖約有 500,000 個頂點與 8,000,000 條邊；線上要求無權最短路徑與非負權路徑，負權資料只允許離線分析。資料無法完整載入每個服務的記憶體。
- 不得用「增加機器」、「全部改用資料庫」或「把所有服務改寫成同一種語言」取代推理；可以調整資料結構、分片、I/O 流程、併發邊界和服務契約。

## 作答要求

1. **事故分解與取證**：提出至少十個可驗證假設，分別連到 P99、RSS、I/O wait、錯誤答案、重複發布、N+1、連線狀態、鎖等待與 GC／配置壓力；為每個假設指定指標、trace、profile 或重現條件。
2. **資料結構與演算法選擇**：為事件去重、熱點查詢、LRU、Top K、排程、前綴／存在性查詢、B+ tree 範圍查詢、分片 key 和 ID 生成提出選擇。需量化平均／最壞複雜度、額外記憶體、配置與快取區域性，並說明何時不能使用 Bloom filter、鏈結串列、完整排序或取模雜湊。
3. **正確性與邊界**：對 DFS／BFS、DP、二分搜尋、排序、限流、分散式 ID、LRU、圖分片各寫出不變量、前提或故障邊界；至少給出兩個會讓直覺方案失效的反例。
4. **OS I/O／同步／網路**：區分等待資料準備與資料拷貝，依連線數與活躍比例選擇阻塞、非阻塞、多路復用或異步模型；解釋 epoll LT／ET、TCP 狀態、頁緩存／mmap／sendfile、進程／執行緒／goroutine、IPC 與同步原語的交互影響，並提出死鎖與背壓方案。
5. **Go runtime 方案**：針對 Mutex／RWMutex、WaitGroup、interface 裝箱、defer 作用域、slice 別名與 append、GC／GOGC 分別提出至少一項診斷或修復；明確指出哪些工作不可在鎖內或 `defer` 延遲的資源作用域中執行。
6. **C# runtime 方案**：診斷 Dictionary key、LINQ deferred execution、IEnumerable／IQueryable、值／參考型別與 boxing、泛型具體化、delegate／event 生命週期、Span／Memory／ArrayPool 生命週期，以及 concurrent collection 的複合操作風險；說明同步與 async 邊界。
7. **Python runtime 方案**：比較生成器與列表、裝飾器 wrapper、資料模型特殊方法、descriptor 優先序、CPython 物件身份／引用、Django QuerySet 的查詢計畫與 N+1，並依 CPU／I/O／團隊維護需求選擇 Django、Flask 或 FastAPI。
8. **修復與驗證**：以止血、正確性修復、容量優化三階段安排 rollout；提出至少十二項單元、性質、整合、負載、故障注入、重放或邊界測試，並定義回滾門檻。

## 期待證據

- 能用輸入量、V／E、活躍 fd 比例、查詢數、K、cache hit rate 和 tenant skew 解釋資料結構與演算法，而非只引用平均 Big-O。
- 能指出動態陣列搬移、hash table rehash、heap 維護、Trie／Bloom filter 位元成本、B+ tree page I/O、LRU 節點配置與一致性雜湊遷移造成的 RSS 或尾端延遲。
- 能區分 BFS、DFS、Dijkstra、Bellman-Ford、拓撲排序與 MST 的前提；能處理負權、負環、重複邊、孤立點、空輸入、重複值與二分邊界。
- 能把 page fault、working set、page cache、DMA、拷貝次數、I/O multiplexing、TCP backlog／TIME_WAIT、IPC buffer 與鎖等待連到可觀測指標。
- 能指出 Go slice 的別名和 append、interface 裝箱、defer 的作用域、GC root／write barrier、WaitGroup 生命週期與鎖競爭的具體風險。
- 能指出 C# 多次枚舉可能重複查詢、Dictionary key 變更破壞查找、GetOrAdd factory 可能重複執行、Span 不能跨 async 逃逸，以及事件訂閱可能延長物件生命週期。
- 能指出 Python 生成器的單次消費、裝飾器的 metadata／例外／取消傳播、descriptor 查找順序、物件 identity 與 ORM 查詢數量的關聯。
- 能以 memory watermark、P99、I/O bytes、page fault、lock wait、fd 狀態、GC pause／allocation、query count、duplicate rate、wrong-result rate 和 replay consistency 驗證修復。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 無法建立事故假設；方案會在限制下持續 OOM、死鎖、重複發布或回傳錯誤結果，且沒有可執行的證據計畫。 |
| 1 | 能列出資料結構、OS 或語言名詞和若干 Big-O，但沒有連到輸入條件、記憶體、I/O、生命週期、併發或正確性。 |
| 2 | 能處理部分資料結構與 runtime 問題，提出一些測試，但遺漏至少一個核心邊界：圖權重、外部記憶體、TCP／fd、同步、語言 runtime 或重放語意。 |
| 3 | 能完成事故取證，依條件選擇資料結構／演算法，說明 OS I/O 與同步交互，分別提出 Go／C#／Python 修復，並以分階段 rollout 和量化測試驗證。 |
| 4 | 除上述內容外，能處理資料傾斜、尾端延遲、跨服務版本、記憶體回收與 buffer ownership、負權環、取消與重啟、部分失敗及可逆 rollout 的交互風險，並用反例證明方案邊界。 |

### 通過標準

總分達 **3/4 分**才通過；且資料結構／演算法、OS I/O／網路／同步、Go／C#／Python runtime、正確性／容量／驗證四個核心面向各不得低於 2 分。若只背誦概念但無法提出可量測、可重現和可回滾的方案，不得判定通過。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先把問題拆成「無界資料」、「錯誤的演算法前提」、「資源生命週期」和「跨服務語意」四條線，而不是先更換語言或盲目增加快取。第一輪應保留一小部分流量、固定輸入版本和事件 ID，建立基準：每個階段的 queue lag、P50／P95／P99、RSS／heap／allocation、page fault、I/O bytes、fd 狀態、TCP state、lock wait、GC、query count、cache hit rate、duplicate rate、wrong-result rate 和重放結果摘要。Go 使用 CPU／heap／goroutine／mutex profile 與 GC 指標，C# 觀察 allocation、GC、執行緒池、資料庫查詢 trace 和 concurrent 操作，Python 觀察 tracemalloc、生成器消費、ORM query count 和事件迴圈／worker 等待。每個假設都要能透過單一變因壓測、trace 或故障注入被證偽。

資料結構方面，事件去重不能只用無界 map。若需要精確結果，應以 tenant、版本、事件 ID 建立有界分片索引或持久化去重窗，配合 TTL／checkpoint 和冪等發布；Bloom filter 只能先擋住大部分不存在的 key，不能取代最終精確查詢，也不適合需要刪除或零假陽性的契約。hash table 要量測負載因子、rehash 峰值、碰撞和 key 穩定性；若需要漸進 rehash，必須同時維持新舊桶的查找語意。熱點資料可用 LRU 的 hash table 加雙向鏈結結構，但要為節點配置、鎖競爭、租戶公平性和快取污染設上限；連結串列不是因為插入是 O(1) 就適合所有熱路徑。

Top K 使用大小為 K 的 heap 或分片後的局部 Top K，避免把全量資料完整排序；需要穩定排序或外部資料時，採用 bounded run、外部 merge 和明確 tie-breaker。排序選擇要依是否需要穩定性、資料是否能放入記憶體、隨機存取和 key 範圍；不能用平均 O(n log n) 掩蓋 quicksort 最壞情況或配置造成的尾端延遲。B+ tree 應依頁大小、fan-out、點查詢／範圍查詢和 I/O 成本選擇，不能以 hash index 取代範圍掃描。分片 key 要在熱點和重平衡間取捨；一致性雜湊配合虛擬節點可減少節點增減的遷移，但仍要處理熱 key、資料搬遷、版本和回源。ID 生成要說明唯一性、排序、時鐘回撥、節點位元、號段耗盡和重啟語意；Snowflake、UUID、號段或 Redis 沒有脫離故障模型的通用答案。

圖演算法必須先分類。500,000 個頂點、8,000,000 條邊是稀疏圖，通常以鄰接表／壓縮邊表示，不用 O(V²) 矩陣。無權最短路徑用 BFS；DFS 適合連通性、環偵測、完整枚舉或建立後序，但要限制遞迴深度或改用顯式 stack。非負權單源最短路徑才用 Dijkstra；離線負權資料用 Bellman-Ford 並檢查負權環，不能把負權邊默默送入 Dijkstra。DAG 可用拓撲順序做 DP；MST 的目標是連接成本，不是從一點到另一點的最短路徑，應在 Kruskal／Prim 間依邊排序、圖密度、更新模式與並查集成本選擇。孤立點、重複邊、不可達點、負環和圖版本不一致都要在結果契約中明確標記。

DP 先定義狀態、轉移、初始條件和計算順序，才考慮滾動陣列；若壓縮後覆寫仍會被讀取的值，空間優化會改變答案。二分搜尋要先選閉區間或半開區間並維護不變量，左／右邊界、旋轉陣列和重複值都要有終止條件。限流要依突發容忍度、平滑輸出、時鐘、分散式原子性和降級策略選固定窗口、滑動窗口、漏桶或令牌桶；不可只用本機計數器宣稱全域限流。至少兩個反例可以是：在負權圖上使用 Dijkstra 得到錯誤結果；在未排序或比較器不具單調性的輸入上套二分搜尋；或以 Bloom filter 的假陽性結果直接拒絕真實存在的資料。這些反例應進入性質測試和重放測試。

OS 與網路線要分開觀察「等待資料就緒」與「把資料從核心拷貝到使用者空間」。大量連線且低活躍比例時，應考慮非阻塞 fd 加 epoll；LT 可以反覆收到未讀事件，ET 則必須以非阻塞讀取直到 EAGAIN，並正確處理 EPOLLONESHOT 和重新武裝。不要把 epoll 等同於真正的異步磁碟 I/O。連線問題要對照 SYN backlog、SYN-RECV、accept rate、TIME_WAIT、CLOSE_WAIT、keep-alive、fd 上限與對端關閉行為；CLOSE_WAIT 常指向應用未關閉，TIME_WAIT 則要分析主動關閉與連線重用，不應只調核心參數。

磁碟線要分辨 page cache、預讀、Direct I/O、mmap、DMA、sendfile 和應用緩衝的拷貝及持久性保證。工作集超過記憶體時，應用的快取、mmap 和 page cache 會互相競爭，page fault 與 swap／reclaim 會把 CPU 不高但 P99 很高的症狀放大。CPU 密集工作可用進程隔離或有限執行緒，I/O 密集工作才適合較多輕量工作單位；goroutine 不是無限容量。IPC 要依資料量、單向／雙向、跨主機、延遲、拷貝和生命週期選 pipe、message queue、shared memory、socket 或 signal；shared memory 必須另配同步和版本契約。

同步設計應縮短臨界區、避免鎖內 I/O、建立全域鎖順序、使用 timeout／try-lock 或可恢復交易，並為 semaphore／condition variable 定義喚醒和取消語意。Go 的 RWMutex 只有在讀多寫少且臨界區足夠長時才可能有利；Mutex 更簡單，兩者都不可複製且不能忘記解鎖。WaitGroup 必須在啟動工作前 Add、每個工作以 Done 收尾，不能讓 Wait 與 Add 競爭或在工作中複製它；需要錯誤、取消和 bounded concurrency 時，應補上明確的 worker lifecycle。死鎖排查要從等待圖確認互斥、持有並等待、不可搶占和循環等待，而不是只增加 timeout。

Go runtime 的修復要確認 slice 的 Data、Len、Cap 和底層陣列別名，避免把大 backing array 或可變 buffer 無意間保留；需要穩定快照時複製，需要共享時明確 ownership。interface 可能帶來裝箱、動態分派和逃逸，不能只用 microbenchmark 的平均值判斷；要以 allocation profile 和熱路徑 trace 證明。defer 應綁定資源的最小作用域，不能在巨大迴圈中累積，也不能把清理延到請求結束而持有 fd 或鎖。GC 分析要看 root、live heap、allocation rate、GOGC、mark assist 和 pause；提高 GOGC 可能減少 GC CPU 但增加 RSS，降低它可能保護記憶體卻提高 CPU 和延遲。修復順序應先消除無界生命週期，再調 GOGC。

C# 方案要先辨識 LINQ 的執行位置：IEnumerable 可能在記憶體執行，IQueryable 可能轉成資料庫查詢，延遲執行和多次枚舉可能讓同一查詢重複發生；需要一致快照或避免重複往返時才在明確邊界物化。Dictionary key 若在插入後改變 Equals／GetHashCode，查找契約會失效。值型別、參考型別、boxing 和 struct 大小會影響配置與複製；泛型的具體化和約束要以型別安全、分派與配置證據取捨。delegate／event 的訂閱者可能延長 publisher 或 request object 的生命週期，必須在 ownership 邊界取消訂閱。Span 只適合同步且不逃逸的短邊界，跨 async 或長生命週期應使用 Memory；ArrayPool／MemoryPool 的 buffer 必須在所有消費者完成後歸還，不能讓 callback 或 concurrent collection 持有已歸還的記憶體。ConcurrentDictionary 的單一操作不等於複合交易，GetOrAdd 的 factory 可能重複執行，昂貴且必須一次的初始化要另外協調。

Python 方案要保留生成器的單次消費和取消邊界；如果下游要重播或多次迭代，應建立可重建來源或明確物化，而不是偷偷把整批資料轉成列表。裝飾器必須保留參數、返回值、例外、取消和 metadata，否則觀測與重試會失真。資料模型中的特殊方法、descriptor 的資料／非資料優先序和 `is`／`==` 語意要避免把屬性存取誤當成純記憶體讀取；隱式 descriptor 或 property 若觸發 I/O，應在 API 契約中顯式化。Django QuerySet 要用 query count、`select_related`／`prefetch_related`、欄位投影、索引和資料庫執行計畫消除 N+1，並避免過度預取造成更大的 RSS。Django 適合內建能力和一致約束較多的網站，Flask 適合小而可組合的同步服務，FastAPI 適合已有 async I/O 和型別契約的 API；框架選擇不能掩蓋下游阻塞或 worker 上限。

交付時先止血：限制批次大小與佇列深度、拒絕或延後低優先租戶、固定事件版本、停止重複發布、關閉有問題的快取路徑並保留舊結果。第二階段修復正確性和 ownership：分片／checkpoint／冪等、正確圖演算法、取消傳播、鎖順序、WaitGroup 和 query 邊界、buffer 生命週期、生成器與 ORM 查詢契約。第三階段才做外部排序、Top K、B+ tree／cache 調整、虛擬節點、GOGC、ArrayPool 或框架 worker tuning。每階段都要以 canary 和可逆設定發布；若 wrong-result rate、duplicate rate、P99、RSS、page fault、fd leak 或 query count 超過基準，就停止擴大並回滾。

</details>

## 常見失分點

- 只列出 hash、heap、BFS、epoll、GC 或 ORM 名稱，沒有說明輸入條件、前提、記憶體和尾端延遲。
- 把 Bloom filter 當成精確去重，把一致性雜湊當成不需要搬遷，把 LRU 的 O(1) 當成沒有配置與鎖成本。
- 在負權圖使用 Dijkstra、在未排序資料使用二分搜尋，或把 MST、最短路徑和拓撲排序混為一談。
- 把 epoll 當成所有 I/O 的異步完成機制，只調整 TCP 核心參數，卻沒有處理 CLOSE_WAIT、fd ownership 或應用背壓。
- 以 RWMutex、ConcurrentDictionary 或 WaitGroup 的單一 API 保證複合交易正確，忽略鎖順序、取消、重複 factory 和 worker lifecycle。
- 忽略 Go slice 別名、defer 作用域和 interface 配置；只調 GOGC，卻沒有先找出無界引用和大 backing array。
- 把 C# LINQ 查詢建立誤認為已執行，讓 Span／ArrayPool buffer 跨 async 或 ownership 邊界逃逸，或讓 event 訂閱造成長期引用。
- 把 Python generator 當成可重播集合，忽略 decorator 破壞取消／metadata，或只看 ORM 程式碼而沒有 query count 和執行計畫。
- 用增加機器、放大記憶體或全面改寫語言取代可量測的資料結構、I/O、併發和生命週期設計。

## 延伸追問

1. 如果租戶的 key 分布高度傾斜，如何同時維持一致性雜湊、LRU 公平性、Top K 記憶體上限和限流正確性？
2. 如果負權邊只存在離線資料的 0.1%，如何讓線上 Dijkstra 與離線 Bellman-Ford 的結果可比對、可重放且不污染線上延遲？
3. 如果只能保留最近 30 分鐘的事件，如何設計 checkpoint、補償窗口、去重 TTL 和結果可信度標記？
4. 如果 C# 的查詢需要跨 async 使用 buffer，而 Python 下游是串流消費，如何定義 buffer ownership、取消和重試契約？
5. 如果 Go 服務的 RSS 已下降但 P99 沒有改善，接下來如何區分 page fault、鎖等待、TCP backlog、下游查詢和排程延遲？
6. 如果 Django 的 N+1 已消失但 response 大小和記憶體翻倍，如何在欄位投影、prefetch、分頁和 API 契約間取捨？
7. 如果服務必須支援節點增減、時鐘回撥和跨版本 ID 解碼，Snowflake、號段和 UUID 的遷移方案如何保證不重複、不截斷排序語意？
