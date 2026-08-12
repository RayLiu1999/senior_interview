# Data Structures & Algorithms Incident：從延遲、記憶體到錯誤答案

- **Assessment ID**: `assessment.data-structures.algorithm-incident.v1`
- **主要 Concept ID**: `concept.algorithms.graph.representation`
- **次要 Concept IDs**:
  - `concept.data-structures.array.dynamic-growth`
  - `concept.algorithms.backtracking.pruning`
  - `concept.algorithms.big-data.external-memory`
  - `concept.data-structures.binary-search-tree.balance`
  - `concept.algorithms.tree-traversal.binary-order`
  - `concept.data-structures.bit-manipulation.flags`
  - `concept.algorithms.graph-traversal.bfs-shortest-path`
  - `concept.data-structures.delayed-queue.scheduling`
  - `concept.algorithms.graph-traversal.dfs-structure`
  - `concept.algorithms.dynamic-programming.advanced-state`
  - `concept.algorithms.greedy.correctness`
  - `concept.data-structures.linked-list.pointer-invariants`
  - `concept.algorithms.graph.minimum-spanning-tree`
  - `concept.data-structures.priority-queue.heap-ordering`
  - `concept.algorithms.graph.shortest-path-selection`
  - `concept.data-structures.skip-list.probabilistic-index`
  - `concept.algorithms.sliding-window.invariant`
  - `concept.algorithms.sorting.production-scale`
  - `concept.data-structures.stack-queue.application`
  - `concept.algorithms.string-search.pattern-matching`
  - `concept.algorithms.graph.topological-order`
  - `concept.data-structures.trie.prefix-index`
  - `concept.algorithms.two-pointers.invariant`
  - `concept.data-structures.union-find.connectivity`
- **對應文章**:
  - [陣列與動態陣列](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/array_and_dynamic_array.md)
  - [回溯法](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/backtracking_algorithm.md)
  - [海量資料處理](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/big_data_processing.md)
  - [二元搜尋樹](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/binary_search_tree.md)
  - [二元樹遍歷與應用](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/binary_tree_traversal.md)
  - [位運算技巧與應用](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/bit_manipulation.md)
  - [廣度優先搜尋](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/breadth_first_search.md)
  - [延遲佇列實現](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/delayed_queue_implementation.md)
  - [深度優先搜尋](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/depth_first_search.md)
  - [動態規劃進階題型](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/dynamic_programming_advanced.md)
  - [圖的表示與遍歷](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/graph_representation_traversal.md)
  - [貪心算法](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/greedy_algorithm.md)
  - [鏈結串列經典問題](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/linked_list_problems.md)
  - [最小生成樹](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/minimum_spanning_tree.md)
  - [優先佇列實戰](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/priority_queue_practice.md)
  - [最短路徑算法](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/shortest_path_algorithms.md)
  - [跳躍表](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/skip_list.md)
  - [滑動窗口算法](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/sliding_window_algorithm.md)
  - [排序算法實際應用](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/sorting_practical_applications.md)
  - [堆疊與佇列應用](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/stack_and_queue_applications.md)
  - [字串搜尋算法](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/string_search_algorithms.md)
  - [拓撲排序與依賴關係](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/topological_sort.md)
  - [字典樹 Trie](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/trie_applications.md)
  - [雙指針與滑動窗口](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/two_pointers_technique.md)
  - [並查集](../../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/union_find.md)
- **題型**: `事故診斷`, `演算法選擇`, `容量與延遲取捨`, `正確性審查`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 45 分鐘
- **標籤**: `Data Structures`, `Algorithms`, `Complexity`, `Memory`, `Latency`, `Graph`, `Dynamic Programming`, `Concurrency`
- **Learning Objective IDs**:
  - `concept.data-structures.array.dynamic-growth/LO-1, LO-2, LO-3`
  - `concept.algorithms.backtracking.pruning/LO-1, LO-2, LO-3`
  - `concept.algorithms.big-data.external-memory/LO-1, LO-2, LO-3`
  - `concept.data-structures.binary-search-tree.balance/LO-1, LO-2, LO-3`
  - `concept.algorithms.tree-traversal.binary-order/LO-1, LO-2, LO-3`
  - `concept.data-structures.bit-manipulation.flags/LO-1, LO-2, LO-3`
  - `concept.algorithms.graph-traversal.bfs-shortest-path/LO-1, LO-2, LO-3`
  - `concept.data-structures.delayed-queue.scheduling/LO-1, LO-2, LO-3`
  - `concept.algorithms.graph-traversal.dfs-structure/LO-1, LO-2, LO-3`
  - `concept.algorithms.dynamic-programming.advanced-state/LO-1, LO-2, LO-3`
  - `concept.algorithms.graph.representation/LO-1, LO-2, LO-3`
  - `concept.algorithms.greedy.correctness/LO-1, LO-2, LO-3`
  - `concept.data-structures.linked-list.pointer-invariants/LO-1, LO-2, LO-3`
  - `concept.algorithms.graph.minimum-spanning-tree/LO-1, LO-2, LO-3`
  - `concept.data-structures.priority-queue.heap-ordering/LO-1, LO-2, LO-3`
  - `concept.algorithms.graph.shortest-path-selection/LO-1, LO-2, LO-3`
  - `concept.data-structures.skip-list.probabilistic-index/LO-1, LO-2, LO-3`
  - `concept.algorithms.sliding-window.invariant/LO-1, LO-2, LO-3`
  - `concept.algorithms.sorting.production-scale/LO-1, LO-2, LO-3`
  - `concept.data-structures.stack-queue.application/LO-1, LO-2, LO-3`
  - `concept.algorithms.string-search.pattern-matching/LO-1, LO-2, LO-3`
  - `concept.algorithms.graph.topological-order/LO-1, LO-2, LO-3`
  - `concept.data-structures.trie.prefix-index/LO-1, LO-2, LO-3`
  - `concept.algorithms.two-pointers.invariant/LO-1, LO-2, LO-3`
  - `concept.data-structures.union-find.connectivity/LO-1, LO-2, LO-3`

## 測驗目標

- 依輸入規模、資料分布、複雜度、記憶體與延遲預算選擇資料結構和演算法。
- 以圖、DP、貪心、回溯、字串搜尋與窗口不變量說明正確性，而不是只列名稱。
- 處理並發輸入、重複事件、快照一致性、取消、重試、重啟與部分失敗。
- 提出可量化、可回滾的修復順序，並用壓力、故障與邊界測試證明修復有效。

## 問題情境與限制條件

某推薦與依賴分析服務在資料量成長後出現三種症狀：P99 延遲由 180ms 升至 2.8s、工作程序的 RSS 超過 512MB 後被終止，以及少量請求回傳不一致的排序或路徑結果。服務同時接收並發事件，事件可能重複、亂序或在處理途中被取消。

目前流程會把每日數十億筆事件先收進可動態增長的集合，再對全部資料排序；熱門字串用前綴查詢，任務依賴以圖表示，路徑分析混用 BFS、DFS、Dijkstra、拓撲排序與 MST。部分程式碼把稀疏圖存成矩陣、用鏈結串列保存熱點結果、以回溯枚舉所有組合，並在每次請求中重新配置大型 DP 表。延遲任務用最小堆，但取消只刪除記憶體中的節點；重啟後會重放部分事件。

限制：單一工作程序可用記憶體 512MB、查詢 P99 目標 250ms、每日資料不能完整載入單機記憶體；圖約 15,000 個頂點和 1,200,000 條邊，既有無權查詢，也有非負權與少量負權的離線分析。結果必須可重現，同一事件不得因重試造成重複計算或重複發佈；不能用「增加機器」或「全部改成資料庫」取代演算法推理。

## 作答要求

1. **事故分解與取證**：列出至少八個可驗證假設，對應 RSS、P99、錯誤答案、重複輸入與取消失效，並指定應量測的資料量、前緣寬度、配置、I/O、佇列積壓與重試指標。
2. **資料結構選擇**：為事件集合、熱點前綴、Top K、延遲任務、鏈結操作與權限旗標選擇結構，說明陣列、BST、堆、優先佇列、跳躍表、Trie、鏈結串列、堆疊／佇列與位元旗標的取捨。
3. **圖處理方案**：為稀疏圖選擇表示法；說明 BFS、DFS、拓撲排序、Dijkstra、Bellman-Ford、Floyd-Warshall、Kruskal、Prim 的前提、複雜度與不可用條件。
4. **序列與搜尋方案**：對滑動窗口、雙指針、字串匹配、貪心、回溯與進階 DP 各提出一個不變量或正確性論證，並指出何時應改用其他方法。
5. **海量資料與並發輸入**：設計分片、外部排序／多路合併、近似結構或 Top K 流程，處理資料傾斜、重複、亂序、取消、checkpoint、重啟和部分失敗。
6. **修復與驗證計畫**：以止血、修正、優化三階段排列工作，提出至少十項單元、性質、負載、故障注入、邊界或重跑測試，以及回滾門檻。

## 期待證據

- 能指出動態陣列的單次擴容與攤銷成本，並用容量預估、分塊或外部流程控制 RSS。
- 能依 V、E、權重、查詢數與前緣寬度選擇圖表示法和演算法，避免把所有問題套 BFS 或 Dijkstra。
- 能說明堆、優先佇列、跳躍表、Trie 和鏈結串列的配置、快取與尾端延遲代價。
- 能為窗口、雙指針、DP、貪心與回溯寫出不變量、轉移或剪枝條件，並指出反例和邊界。
- 能以事件 ID、版本、冪等、checkpoint 和可重建輸入處理並發、亂序、重試、取消和重啟。
- 能以 memory watermark、P99、I/O bytes、queue lag、duplicate rate、wrong-result rate、重跑一致性與 rollback time 驗證設計。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 方案會在限制下持續 OOM、使用不適用的圖演算法，或無法處理重複／亂序輸入與錯誤答案。 |
| 1 | 能列出若干資料結構和 Big-O，但沒有把選擇連到輸入條件、記憶體、延遲或正確性。 |
| 2 | 能提出部分可行方案與測試，但遺漏圖的權重條件、外部 I/O、並發重放、取消或邊界中的至少一項。 |
| 3 | 能完成事故取證、資料結構與圖演算法選擇、序列／DP 正確性、並發輸入語意、分階段修復與量化驗證。 |
| 4 | 除上述內容外，能處理尾端延遲、資料傾斜、負權環、事件版本演進、可重建快照、反例生成與可逆 rollout 的交互風險。 |

### 通過標準

總分達 **3/4 分**才通過；複雜度分析、資料結構／演算法選擇、記憶體與延遲、正確性與邊界四個核心面向均不得低於 2 分。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先以輸入大小、資料分布和結果錯誤率切分問題。把全量事件收進動態集合並排序是 RSS 與 I/O 的主要嫌疑；應改成有界批次、分片聚合與外部排序，建立可重跑的 sorted runs，再以多路合併產生結果。只需 Top K 時維護大小 K 的堆；可接受誤差的去重或基數統計才使用近似結構，並記錄誤差界線。並發輸入使用事件 ID、版本或去重鍵，checkpoint 必須可重建，重試和重啟不能靠記憶體中的取消節點保證一次性。

圖若是稀疏圖應使用鄰接表或壓縮邊表示，不應直接使用 O(V²) 矩陣。無權最短路徑用 BFS；DFS 用於連通、環或完整枚舉；DAG 依入度或 DFS 著色做拓撲排序。非負權單源可用 Dijkstra；有負權要用 Bellman-Ford 並檢查負權環；小型稠密全點對才考慮 Floyd-Warshall。MST 是連接成本問題，不是最短路徑；Kruskal 依邊排序搭配並查集，Prim 則從頂點擴張，非連通輸入應回報森林。

熱點前綴可用 Trie，但要在固定子節點陣列、Map 與壓縮節點間以記憶體和字元集取捨；鏈結串列只在需要穩定節點連結且可接受配置與快取成本時使用。Top K 與排程使用優先佇列，取消要用版本／tombstone 並在執行前驗證。BST／跳躍表要量測退化和尾端延遲；樹遍歷選擇遞迴或顯式堆疊時要考慮深度與寬度。位元旗標固定寬度並拒絕未定義位元。

序列題先寫不變量：滑動窗口與雙指針要求合法窗口或排序／單調性，左右指針總移動才有攤銷 O(n)；字串 KMP 使用前綴資訊，Rabin-Karp 命中需驗證。DP 先建立狀態依賴再決定區間、樹或 mask 的計算順序，壓縮時不能覆蓋仍需要的值。貪心要用交換或切割性質證明，沒有證明就用反例或 DP；回溯的剪枝必須保證排除的子樹無解，且返回時還原狀態。

交付上先停止無界收集、限制查詢規模、保留舊結果並監控 RSS、P99、錯誤答案與 duplicate rate；再導入分片／外部排序、正確的圖演算法與事件去重；最後才調整常數、快取和資料結構。每階段都以負載、亂序重放、取消、程序重啟、負權環、空輸入、極深／極寬圖、重複字串、DP 邊界和 OOM 壓力測試驗證，若錯誤答案、P99 或記憶體超過門檻就回滾。

</details>

## 常見失分點

- 只把矩陣改成鄰接表，卻沒有依權重、查詢型態和 V／E 選擇圖演算法。
- 只寫平均 Big-O，忽略動態陣列搬移、堆／Trie／跳躍表配置、快取與尾端延遲。
- 用 BFS 處理加權或負權圖，或把 MST、最短路徑和拓撲排序混為一談。
- 宣稱 exactly-once 卻沒有事件 ID、冪等、版本、checkpoint、重試和重啟恢復證據。
- DP、貪心或回溯只列模板，沒有不變量、轉移、剪枝、反例和狀態還原。

## 延伸追問

1. 如果負權邊只出現在離線資料的 0.1%，如何分離線上與離線路徑並驗證結果一致？
2. 如果 Top K 的 K 會隨租戶變化，如何在記憶體上限下分配預算並防止單一租戶餓死其他查詢？
3. 如果重啟後只能取得最近一小時事件，如何設計 checkpoint、補償與結果可信度標記？
4. 如果圖的邊會持續新增但不能刪除，如何利用並查集；若開始支援刪邊，哪些假設需要重新設計？
5. 如果字串資料包含不同 Unicode 正規化形式，Trie 與 KMP 的輸入契約和測試應如何調整？
