# 資料結構與演算法 (Data Structures and Algorithms) - 重點考題 (Quiz)

> 這份考題是從資料結構與演算法章節中挑選出**重要程度 4-5** 的核心題目，設計成自我測驗的形式。
> 
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

## 📊 核心資料結構

### Q1: B+ 樹的原理及為何適合資料庫索引？
<!-- Concept ID: concept.data-structures.b-plus-tree.indexing; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請解釋 B+ 樹的結構特點，以及為何 MySQL InnoDB 選擇 B+ 樹作為索引結構。

<details>
<summary>💡 答案提示</summary>

**B+ 樹特點**：
1. 所有資料存在葉子節點（非葉節點只存 Key）
2. 葉子節點用指標串聯（利於範圍查詢）
3. 多路平衡搜尋樹，高度低

**為何適合資料庫**：

| 優勢 | 說明 |
|------|------|
| 磁碟 I/O 少 | 一個節點對應一個磁碟頁（16KB） |
| 高度低 | 3-4 層存數千萬筆資料 |
| 範圍查詢高效 | 葉子節點串聯 |
| 穩定性 | 所有查詢都到葉子，時間複雜度穩定 |

**vs B 樹**：
- B 樹資料分佈在所有節點
- B+ 樹資料只在葉子，非葉節點可存更多 Key

**vs Hash 索引**：
- Hash 只能精確匹配
- B+ 樹支援範圍查詢、排序

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/b_tree_and_b_plus_tree.md)

---

### Q2: 雜湊表的原理、碰撞處理和負載因子
<!-- Concept ID: concept.data-structures.hash-table.collision-resolution; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋雜湊表的實現原理，以及常見的碰撞處理方法。

<details>
<summary>💡 答案提示</summary>

**核心原理**：
- 通過雜湊函數將 Key 映射到陣列索引
- 平均時間複雜度 O(1)

**碰撞處理**：

| 方法 | 說明 | 優缺點 |
|------|------|--------|
| 鏈結法 | 碰撞元素用鏈結串列儲存 | 簡單；鏈表過長效能下降 |
| 開放定址 | 線性探測、二次探測 | 空間利用高；聚集問題 |
| 再雜湊 | 多個雜湊函數 | 分散更均勻 |

**負載因子**：
```
負載因子 = 元素數量 / 桶數量
```
- 負載因子過高 → 碰撞增加 → 效能下降
- Java HashMap 預設 0.75 觸發擴容

**擴容機制**：
- 建立 2 倍大小的新陣列
- 重新計算所有元素的雜湊值
- 漸進式 rehash（Redis 做法）

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/hash_table_implementation.md)

---

### Q3: 布隆過濾器的原理和應用場景
<!-- Concept ID: concept.data-structures.bloom-filter.false-positive; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋布隆過濾器的工作原理、特性和典型應用。

<details>
<summary>💡 答案提示</summary>

**原理**：
- 一個 bit 陣列 + k 個雜湊函數
- 插入：k 個位置設為 1
- 查詢：k 個位置都為 1 → 可能存在

**特性**：
| 特性 | 說明 |
|------|------|
| 空間高效 | 比 HashSet 省很多空間 |
| 可能誤判 | 說「在」可能不在（假陽性） |
| 不會漏判 | 說「不在」一定不在 |
| 不可刪除 | 會影響其他元素 |

**應用場景**：

1. **快取穿透防護**
   - 請求先過布隆過濾器
   - 資料不存在則直接返回

2. **Redis 大 Key 去重**
   - 判斷 URL 是否已爬取
   - 判斷 ID 是否已處理

3. **資料庫查詢優化**
   - 先判斷資料是否在某個分片

**誤判率計算**：
- 與 bit 陣列大小、雜湊函數數量、元素數量相關
- 可配置誤判率（如 1%）

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/bloom_filter.md)

---

### Q4: LRU 快取的實現原理
<!-- Concept ID: concept.data-structures.lru-cache.o1-operations; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明 LRU 快取的實現方式，需要 O(1) 的 get 和 put 操作。

<details>
<summary>💡 答案提示</summary>

**核心資料結構**：
- **HashMap**：O(1) 查找
- **雙向鏈結串列**：O(1) 插入和刪除

**運作流程**：

**Get 操作**：
1. HashMap 查找
2. 找到 → 移到鏈結串列頭部
3. 返回 value

**Put 操作**：
1. 如果 key 已存在 → 更新並移到頭部
2. 如果 key 不存在：
   - 容量滿 → 刪除尾部節點
   - 新節點加到頭部
   - 更新 HashMap

**Go 實現關鍵**：
```go
type LRUCache struct {
    capacity int
    cache    map[int]*Node
    head     *Node  // 虛擬頭節點
    tail     *Node  // 虛擬尾節點
}

type Node struct {
    key, val   int
    prev, next *Node
}
```

**變體**：
- LRU-K：最近第 K 次訪問
- 2Q：兩個佇列

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/lru_cache_implementation.md)

---

### Q5: 堆的實現及 Top K 問題
<!-- Concept ID: concept.data-structures.heap.top-k; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋堆的實現原理，以及如何解決 Top K 問題。

<details>
<summary>💡 答案提示</summary>

**堆的特性**：
- 完全二元樹
- 大頂堆：父 >= 子
- 小頂堆：父 <= 子
- 用陣列實現：parent = (i-1)/2, left = 2i+1, right = 2i+2

**核心操作**：
| 操作 | 時間複雜度 | 說明 |
|------|-----------|------|
| push | O(log n) | 加到末尾，上浮 |
| pop | O(log n) | 取頂，末尾補頂，下沉 |
| peek | O(1) | 直接返回頂部 |
| build | O(n) | 從下往上調整 |

**Top K 解法**：

1. **小頂堆（推薦）**
   - 維護大小為 K 的小頂堆
   - 元素 > 堆頂則替換
   - 時間 O(n log k)，空間 O(k)

2. **大頂堆**
   - 全部入堆，pop K 次
   - 時間 O(n log n)

3. **快速選擇**
   - 基於快排分區
   - 平均 O(n)，最壞 O(n²)

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/heap_implementation.md)

---

## 🔍 核心演算法

### Q6: 排序演算法比較（快排、歸併、堆排序）
<!-- Concept ID: concept.algorithms.sorting.algorithm-tradeoffs; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請比較常見排序演算法的特點和適用場景。

<details>
<summary>💡 答案提示</summary>

| 演算法 | 時間複雜度 | 空間 | 穩定性 | 特點 |
|--------|-----------|------|--------|------|
| **快排** | O(n log n) 平均 | O(log n) | 不穩定 | 實踐中最快 |
| **歸併** | O(n log n) | O(n) | 穩定 | 適合鏈結串列、外部排序 |
| **堆排序** | O(n log n) | O(1) | 不穩定 | 空間最省 |
| 計數排序 | O(n+k) | O(k) | 穩定 | 整數且範圍小 |

**面試重點**：

**快排**：
```go
// 分區函數：選 pivot，小的放左，大的放右
func partition(arr []int, lo, hi int) int {
    pivot := arr[hi]
    i := lo
    for j := lo; j < hi; j++ {
        if arr[j] < pivot {
            arr[i], arr[j] = arr[j], arr[i]
            i++
        }
    }
    arr[i], arr[hi] = arr[hi], arr[i]
    return i
}
```

**使用場景**：
- 內部排序：快排（Go sort 用 pdqsort）
- 外部排序：歸併
- 穩定排序：歸併、Tim Sort

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/sorting_algorithms_comparison.md)

---

### Q7: 二分搜尋的變體題目
<!-- Concept ID: concept.algorithms.binary-search.boundaries; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請說明二分搜尋的常見變體和邊界處理。

<details>
<summary>💡 答案提示</summary>

**標準模板**：
```go
func binarySearch(nums []int, target int) int {
    lo, hi := 0, len(nums)-1
    for lo <= hi {
        mid := lo + (hi-lo)/2
        if nums[mid] == target {
            return mid
        } else if nums[mid] < target {
            lo = mid + 1
        } else {
            hi = mid - 1
        }
    }
    return -1
}
```

**常見變體**：

| 變體 | 關鍵修改 |
|------|----------|
| 找左邊界 | 相等時 hi = mid - 1 |
| 找右邊界 | 相等時 lo = mid + 1 |
| 旋轉陣列 | 判斷哪半邊有序 |
| 尋找峰值 | 比較 mid 和 mid+1 |

**邊界處理技巧**：
- `lo + (hi-lo)/2` 防止溢出
- 區間定義要一致（左閉右閉 vs 左閉右開）

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/binary_search_variants.md)

---

### Q8: 動態規劃的解題思路
<!-- Concept ID: concept.algorithms.dynamic-programming.state-transition; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明動態規劃的解題框架和常見題型。

<details>
<summary>💡 答案提示</summary>

**DP 解題步驟**：
1. **定義狀態**：dp[i] 代表什麼
2. **狀態轉移方程**：dp[i] 如何由子問題得出
3. **初始條件**：base case
4. **計算順序**：確保子問題已解決

**經典題型**：

| 類型 | 例題 | 狀態定義 |
|------|------|----------|
| 線性 DP | 爬樓梯 | dp[i] = 到達第 i 階的方法數 |
| 背包 DP | 0-1 背包 | dp[i][j] = 前 i 物品，容量 j 的最大價值 |
| 區間 DP | 戳氣球 | dp[i][j] = 區間 [i,j] 的最優解 |
| 序列 DP | LCS | dp[i][j] = s1 前 i 和 s2 前 j 的最長公共子序列 |

**空間優化**：
- 滾動陣列：二維 → 一維
- 狀態壓縮

**識別 DP 題目**：
- 求最值、方案數
- 有最優子結構
- 有重疊子問題

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/dynamic_programming_basics.md)

---

### Q9: DFS 和 BFS 的應用場景
<!-- Concept ID: concept.algorithms.graph-traversal.dfs-bfs-selection; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請比較 DFS 和 BFS 的特點和適用場景。

<details>
<summary>💡 答案提示</summary>

| 特性 | DFS | BFS |
|------|-----|-----|
| 資料結構 | 堆疊/遞迴 | 佇列 |
| 空間複雜度 | O(h) 樹高 | O(w) 樹寬 |
| 適用場景 | 路徑、排列組合 | 最短路徑、層級遍歷 |

**DFS 應用**：
- 全排列、子集
- 判斷路徑是否存在
- 島嶼數量
- 回溯問題

**BFS 應用**：
- 最短路徑（無權圖）
- 二元樹層序遍歷
- 拓撲排序
- 多源 BFS（腐爛橘子）

**模板對比**：
```go
// DFS (遞迴)
func dfs(node *TreeNode) {
    if node == nil { return }
    // 處理當前節點
    dfs(node.Left)
    dfs(node.Right)
}

// BFS
func bfs(root *TreeNode) {
    queue := []*TreeNode{root}
    for len(queue) > 0 {
        node := queue[0]
        queue = queue[1:]
        // 處理當前節點
        if node.Left != nil { queue = append(queue, node.Left) }
        if node.Right != nil { queue = append(queue, node.Right) }
    }
}
```

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/dfs_bfs_comprehensive.md)

---

## 🏗️ 實際應用

### Q10: 一致性雜湊的原理和應用
<!-- Concept ID: concept.distributed-systems.consistent-hashing.virtual-nodes; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請解釋一致性雜湊解決了什麼問題，以及如何實現。

<details>
<summary>💡 答案提示</summary>

**傳統雜湊的問題**：
```
hash(key) % N
```
- 節點增減時，幾乎所有 key 都需重新映射

**一致性雜湊原理**：
1. 將雜湊值空間組成一個環（0 ~ 2³²-1）
2. 節點映射到環上
3. Key 順時針找到第一個節點

**優點**：
- 增減節點只影響相鄰區間
- 資料遷移量小

**虛擬節點**：
- 解決資料分佈不均問題
- 每個實體節點對應多個虛擬節點
- 典型配置：100-200 個虛擬節點

**應用場景**：
| 場景 | 說明 |
|------|------|
| 分散式快取 | Redis Cluster、Memcached |
| 負載均衡 | 會話保持 |
| 分散式儲存 | 資料分片 |

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/consistent_hashing.md)

---

### Q11: 限流演算法（令牌桶、漏桶）
<!-- Concept ID: concept.distributed-systems.rate-limiting.token-leaky-bucket; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請比較常見的限流演算法及其適用場景。

<details>
<summary>💡 答案提示</summary>

| 演算法 | 原理 | 優點 | 缺點 | 場景 |
|--------|------|------|------|------|
| **計數器** | 固定時間窗口計數 | 簡單 | 臨界問題 | 簡單場景 |
| **滑動窗口** | 細分時間格子 | 平滑 | 記憶體開銷 | API 限流 |
| **漏桶** | 恆定速率流出 | 平滑輸出 | 無法處理突發 | 流量整形 |
| **令牌桶** | 恆定速率放令牌 | 允許突發 | 較複雜 | 大部分場景 |

**令牌桶**：
```
- 以恆定速率往桶裡放令牌
- 請求需要先拿令牌
- 沒有令牌則拒絕或等待
- 允許一定程度的突發流量
```

**漏桶**：
```
- 請求進入桶中
- 以恆定速率流出處理
- 桶滿則拒絕
- 輸出流量非常平穩
```

**實際應用**：
- Nginx：漏桶 (limit_req)
- Guava RateLimiter：令牌桶
- Redis-Cell：令牌桶

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/rate_limiting_algorithms.md)

---

### Q12: 分散式 ID 生成方案
<!-- Concept ID: concept.distributed-systems.distributed-id.generation-strategies; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較常見的分散式 ID 生成方案。

<details>
<summary>💡 答案提示</summary>

| 方案 | 優點 | 缺點 | 適用場景 |
|------|------|------|----------|
| **UUID** | 簡單、無依賴 | 無序、佔空間 | 對序無要求 |
| **資料庫自增** | 有序 | 效能瓶頸、單點 | 小規模 |
| **號段模式** | 效能好 | 需維護號段服務 | 中大規模 |
| **Snowflake** | 有序、高效能 | 時鐘回撥問題 | 大多數場景 |
| **Leaf** | 結合多種方案 | 複雜 | 大規模 |

**Snowflake 結構**（64 bit）：
```
| 1 bit | 41 bit     | 10 bit    | 12 bit   |
| 符號  | 時間戳     | 機器 ID   | 序列號   |
        (約 69 年)   (1024 台)  (4096/ms)
```

**優點**：
- 趨勢有序
- 每毫秒可生成 409.6 萬 ID
- 無網路依賴

**時鐘回撥處理**：
- 拒絕生成
- 等待時鐘追上
- 使用擴展位標記

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/distributed_id_generation.md)

---

## 🧱 DSA Phase 3 延伸題

### Q13: 陣列與動態陣列的擴容與記憶體權衡
<!-- Concept ID: concept.data-structures.array.dynamic-growth; Learning Objective IDs: LO-1, LO-2, LO-3 -->

說明連續陣列與動態陣列的存取、擴容搬移與攤銷複雜度，並說明何時應預先配置容量。

<details>
<summary>💡 答案提示</summary>

- 連續記憶體提供 O(1) 索引與快取區域性；中間插入／刪除通常需要搬移元素。
- 擴容單次可能是 O(n)，但長期追加可達攤銷 O(1)；預先配置能降低重配延遲，也可能造成容量滯留。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/array_and_dynamic_array.md)

---

### Q14: 回溯法的剪枝與狀態還原
<!-- Concept ID: concept.algorithms.backtracking.pruning; Learning Objective IDs: LO-1, LO-2, LO-3 -->

如何設計回溯搜尋的狀態、剪枝條件與還原流程？請同時說明最壞時間與結果空間。

<details>
<summary>💡 答案提示</summary>

- 狀態需包含目前路徑、選擇位置與必要的 used／剩餘資源；剪枝必須證明被排除的子樹不可能有解。
- 返回前要還原共享狀態；時間通常呈指數成長，並要把答案複製成本算入。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/backtracking_algorithm.md)

---

### Q15: 海量資料處理的分治與近似取捨
<!-- Concept ID: concept.algorithms.big-data.external-memory; Learning Objective IDs: LO-1, LO-2, LO-3 -->

資料量超過單機記憶體時，如何在精確度、磁碟 I/O、網路傳輸與處理時間之間做選擇？

<details>
<summary>💡 答案提示</summary>

- 先界定是否需要精確結果，再選外部排序、分片聚合、Bitmap 或近似資料結構。
- 估算記憶體、磁碟、shuffle、資料傾斜與重試成本，並處理重複輸入、checkpoint 和部分失敗。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/big_data_processing.md)

---

### Q16: BST 退化與平衡樹選擇
<!-- Concept ID: concept.data-structures.binary-search-tree.balance; Learning Objective IDs: LO-1, LO-2, LO-3 -->

為何 BST 可能退化成鏈結串列？查詢密集與更新密集的系統應如何選擇 AVL 或紅黑樹？

<details>
<summary>💡 答案提示</summary>

- 偏斜或已排序插入會讓高度變成 O(n)，失去 O(log n) 保證。
- AVL 平衡較嚴格、查詢高度較低；紅黑樹更新旋轉通常較少，仍需考慮 range scan、快取與讀寫比例。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/binary_search_tree.md)

---

### Q17: 二元樹遍歷順序與記憶體成本
<!-- Concept ID: concept.algorithms.tree-traversal.binary-order; Learning Objective IDs: LO-1, LO-2, LO-3 -->

比較前序、中序、後序與層序遍歷的用途，以及遞迴和迭代實作對深度／寬度記憶體的影響。

<details>
<summary>💡 答案提示</summary>

- 中序可產生 BST 排序結果；前序先處理根；後序先取得子樹結果；層序按深度處理。
- DFS 約需 O(h)，BFS 可能需 O(w)；深樹要防遞迴溢位，寬樹要控制佇列峰值。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/binary_tree_traversal.md)

---

### Q18: 位運算與位元旗標的安全使用
<!-- Concept ID: concept.data-structures.bit-manipulation.flags; Learning Objective IDs: LO-1, LO-2, LO-3 -->

如何用位元遮罩保存多個權限或狀態？請說明 signed integer、位寬與序列化造成的風險。

<details>
<summary>💡 答案提示</summary>

- OR 設定、AND 加反向遮罩清除、AND 檢查、XOR 切換；旗標必須使用不重疊位元。
- 固定整數寬度與 signed／unsigned 語意，並定義未使用位元、版本化和跨平台序列化規則。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/bit_manipulation.md)

---

### Q19: BFS 如何在無權圖保證最短路徑
<!-- Concept ID: concept.algorithms.graph-traversal.bfs-shortest-path; Learning Objective IDs: LO-1, LO-2, LO-3 -->

為何 BFS 能在無權圖找到邊數最少的路徑？若圖很寬或有多個起點，如何控制記憶體？

<details>
<summary>💡 答案提示</summary>

- 佇列保證距離 d 的節點先於 d+1 出隊；入隊時標記 visited，並用 parent 重建路徑。
- 多源 BFS 可先放入所有起點；鄰接表為 O(V+E)，但前緣寬度決定峰值記憶體。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/breadth_first_search.md)

---

### Q20: 延遲佇列在取消與重啟下的正確性
<!-- Concept ID: concept.data-structures.delayed-queue.scheduling; Learning Objective IDs: LO-1, LO-2, LO-3 -->

訂單逾時取消服務支援不同到期時間、取消與重啟恢復時，應如何選擇延遲佇列並避免重複執行？

<details>
<summary>💡 答案提示</summary>

- 精確排序可用最小堆；大量時間槽可用時間輪；跨程序持久化則要考慮有序儲存。
- 取消要用版本或 tombstone 並在消費前再驗證；執行端仍需冪等，且要定義崩潰、重試與積壓行為。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/delayed_queue_implementation.md)

---

### Q21: DFS 的堆疊深度與圖遍歷正確性
<!-- Concept ID: concept.algorithms.graph-traversal.dfs-structure; Learning Objective IDs: LO-1, LO-2, LO-3 -->

比較遞迴 DFS 與顯式堆疊 DFS，並說明在有環、深鏈與共享子圖中如何避免錯誤。

<details>
<summary>💡 答案提示</summary>

- DFS 沿堆疊深入；visited 的標記時機要配合找路徑、找環或連通分量的語意。
- 遞迴簡潔但受呼叫堆疊限制；顯式堆疊可控制深度並攜帶 parent 或進出狀態。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/depth_first_search.md)

---

### Q22: 進階 DP 的狀態設計與空間壓縮
<!-- Concept ID: concept.algorithms.dynamic-programming.advanced-state; Learning Objective IDs: LO-1, LO-2, LO-3 -->

面對區間 DP、狀態壓縮 DP 或樹形 DP，如何定義狀態、轉移順序並安全地壓縮空間？

<details>
<summary>💡 答案提示</summary>

- 狀態需保留未來決策所需的最小資訊；先畫依賴，再決定 base case 和填表順序。
- 壓縮前要確認覆寫不會破壞尚未使用的值，並比較時間／空間與貪心、回溯的取捨。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/dynamic_programming_advanced.md)

---

### Q23: 圖表示法與遍歷的記憶體取捨
<!-- Concept ID: concept.algorithms.graph.representation; Learning Objective IDs: LO-1, LO-2, LO-3 -->

如何依圖的稀疏／稠密程度與查詢型態選擇鄰接矩陣、鄰接表或邊集合？

<details>
<summary>💡 答案提示</summary>

- 矩陣的相鄰查詢快但耗 O(V²)；鄰接表對稀疏圖約 O(V+E)；邊集合適合排序或批次處理。
- 需明確保存方向、權重與 visited，並考慮快取區域性、更新頻率與序列化成本。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/graph_representation_traversal.md)

---

### Q24: 貪心演算法何時能保證全域最優
<!-- Concept ID: concept.algorithms.greedy.correctness; Learning Objective IDs: LO-1, LO-2, LO-3 -->

為何某些問題可以採用貪心，而另一些問題必須使用 DP 或回溯？請給出正確性論證或反例。

<details>
<summary>💡 答案提示</summary>

- 必須證明貪心選擇性質與最優子結構，可使用交換論證、切割性質或 stay-ahead 論證。
- 若局部選擇會阻礙未來，應用反例否定貪心；不能只依賴少數測資。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/greedy_algorithm.md)

---

### Q25: 鏈結串列指針不變量與邊界處理
<!-- Concept ID: concept.data-structures.linked-list.pointer-invariants; Learning Objective IDs: LO-1, LO-2, LO-3 -->

在反轉、合併、刪除與環檢測時，如何維護鏈結串列指針不變量並處理空串列？

<details>
<summary>💡 答案提示</summary>

- 更新前先保存下一個節點；dummy node 可統一頭節點刪除；快慢指針需說明相遇條件。
- 局部插入刪除可為 O(1)，但節點配置與快取區域性通常比連續陣列差。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/linked_list_problems.md)

---

### Q26: Kruskal 與 Prim 的圖結構選擇
<!-- Concept ID: concept.algorithms.graph.minimum-spanning-tree; Learning Objective IDs: LO-1, LO-2, LO-3 -->

如何在稀疏圖、稠密圖與非連通圖中選擇 Kruskal 或 Prim，並確認結果是 MST 或生成森林？

<details>
<summary>💡 答案提示</summary>

- MST 要覆蓋頂點且無環，總權重最小；它與單源最短路徑不同。
- Kruskal 排邊並用並查集避環；Prim 從頂點擴張；非連通圖應明確回報森林或無單一 MST。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/minimum_spanning_tree.md)

---

### Q27: 優先佇列在 Top K 與任務排程的取捨
<!-- Concept ID: concept.data-structures.priority-queue.heap-ordering; Learning Objective IDs: LO-1, LO-2, LO-3 -->

比較優先佇列與 FIFO，並說明它在 Top K、合併排序來源與任務排程中的容量和延遲取捨。

<details>
<summary>💡 答案提示</summary>

- 二元堆通常 peek O(1)、push／pop O(log n)；Top K 可維護大小 K 的小頂堆以控制空間。
- 排程還需定義平手、飢餓、過期項目、容量與背壓，不能只回答「使用堆」。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/priority_queue_practice.md)

---

### Q28: 最短路徑演算法如何依權重與圖密度選擇
<!-- Concept ID: concept.algorithms.graph.shortest-path-selection; Learning Objective IDs: LO-1, LO-2, LO-3 -->

依邊權是否為負、單源或全點對，以及圖的稀疏／稠密程度選擇最短路徑演算法。

<details>
<summary>💡 答案提示</summary>

- Dijkstra 需非負權；Bellman-Ford 可處理負權並偵測負權環；Floyd-Warshall 適合小型稠密全點對。
- 需維護 relaxation、前驅和不可達狀態，並避免距離加總溢位；MST 不能取代最短路徑。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/shortest_path_algorithms.md)

---

### Q29: 跳躍表的隨機層級與效能風險
<!-- Concept ID: concept.data-structures.skip-list.probabilistic-index; Learning Objective IDs: LO-1, LO-2, LO-3 -->

跳躍表為何平均能達到 O(log n)？如何評估它與平衡樹的延遲尾端和記憶體差異？

<details>
<summary>💡 答案提示</summary>

- 多層索引與隨機層高帶來期望 O(log n) 查找、插入和刪除，但最壞情況仍可能退化。
- 要納入額外指標、節點配置、快取區域性、隨機種子與併發更新成本。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/skip_list.md)

---

### Q30: 滑動窗口的不變量與線性複雜度
<!-- Concept ID: concept.algorithms.sliding-window.invariant; Learning Objective IDs: LO-1, LO-2, LO-3 -->

如何設計滑動窗口解決最長／最短合法子區間，並證明時間複雜度可以是 O(n)？

<details>
<summary>💡 答案提示</summary>

- 先定義窗口合法條件，再擴張右界、違規時收縮左界，於正確時機更新答案。
- 左右指針各自只前進，總移動為 O(n)；頻率表、集合或單調佇列要依問題選擇。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/sliding_window_algorithm.md)

---

### Q31: 生產環境排序的外部記憶體與分散式取捨
<!-- Concept ID: concept.algorithms.sorting.production-scale; Learning Objective IDs: LO-1, LO-2, LO-3 -->

TB 級資料無法放入單機記憶體時，如何選擇外部排序、分散式排序或 Top K，並處理穩定性與故障？

<details>
<summary>💡 答案提示</summary>

- 外部排序建立 runs 再多路合併；只需前 K 名時不必全量排序。
- 分散式方案要估算 shuffle、分區傾斜、磁碟、網路、checkpoint、重試與去重，並定義同鍵順序。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/sorting_practical_applications.md)

---

### Q32: 堆疊與佇列的應用選擇與記憶體界線
<!-- Concept ID: concept.data-structures.stack-queue.application; Learning Objective IDs: LO-1, LO-2, LO-3 -->

比較堆疊、佇列、雙端佇列與單調結構在解析、BFS、緩衝和區間最值中的使用時機。

<details>
<summary>💡 答案提示</summary>

- LIFO 適合解析與回溯；FIFO 適合 BFS 和順序處理；雙端佇列和單調結構能支援區間最值。
- 實務上要設定容量、背壓、阻塞或丟棄策略，避免無界緩衝把延遲轉成記憶體事故。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/stack_and_queue_applications.md)

---

### Q33: 字串搜尋演算法與碰撞驗證
<!-- Concept ID: concept.algorithms.string-search.pattern-matching; Learning Objective IDs: LO-1, LO-2, LO-3 -->

比較樸素搜尋、KMP 與 Rabin-Karp，並說明雜湊碰撞、Unicode 與串流分塊如何影響實作。

<details>
<summary>💡 答案提示</summary>

- KMP 以前綴函數避免文本指標回退；Rabin-Karp 命中後必須驗證，不能把雜湊相等當成字串相等。
- 需考慮 n、m、模式是否重複使用、位元組／Unicode 邊界與跨 chunk 匹配。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/string_search_algorithms.md)

---

### Q34: 拓撲排序如何處理循環依賴
<!-- Concept ID: concept.algorithms.graph.topological-order; Learning Objective IDs: LO-1, LO-2, LO-3 -->

在任務依賴圖中如何產生拓撲順序並辨識循環？若只得到部分節點，應如何回報？

<details>
<summary>💡 答案提示</summary>

- Kahn 處理入度 0 節點；處理數量小於 V 表示有循環。DFS 可用白／灰／黑狀態辨識回邊。
- 多個入度 0 節點代表多個合法順序；應回報循環依賴鏈與可完成、不可排程的部分。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/topological_sort.md)

---

### Q35: Trie 前綴查詢與記憶體取捨
<!-- Concept ID: concept.data-structures.trie.prefix-index; Learning Objective IDs: LO-1, LO-2, LO-3 -->

Trie 為何適合自動補全？在字母表大、Unicode 多且前綴分布不均時，如何選擇子節點表示？

<details>
<summary>💡 答案提示</summary>

- 沿字元路徑查找前綴約為 O(L)；固定陣列快但稀疏浪費空間，Map 較省但有雜湊和配置成本。
- 需處理終止標記、Unicode 正規化、刪除、熱點前綴結果排序與最大結果數。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/trie_applications.md)

---

### Q36: 雙指針技巧的前提與不變量
<!-- Concept ID: concept.algorithms.two-pointers.invariant; Learning Objective IDs: LO-1, LO-2, LO-3 -->

對撞、同向與快慢雙指針各需要什麼前提？如何證明沒有漏解且能達到 O(n)？

<details>
<summary>💡 答案提示</summary>

- 對撞通常依賴排序或單調性；同向維護已處理區間；快慢利用速度差尋找環或壓縮元素。
- 要寫出移動後仍成立的不變量，並處理重複值、空輸入、單元素與索引邊界。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/two_pointers_technique.md)

---

### Q37: 並查集如何維護動態連通性
<!-- Concept ID: concept.data-structures.union-find.connectivity; Learning Objective IDs: LO-1, LO-2, LO-3 -->

說明路徑壓縮與按秩／大小合併如何降低並查集成本，以及它為何適合 Kruskal 但不適合所有圖更新。

<details>
<summary>💡 答案提示</summary>

- parent 指向代表元；Find 壓縮路徑，Union 將較小樹接到較大樹，攤銷成本接近常數。
- 它適合只增加連結和查詢同集合，不自然支援刪邊、完整路徑查詢或頻繁拆分。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Data_Structures_and_Algorithms/union_find.md)

---

## 📊 學習進度檢核

完成以上題目後，請自我評估：

| 評估項目 | 自評 |
|----------|------|
| 理解 B+ 樹原理及資料庫應用 | ⬜ |
| 掌握雜湊表實現和碰撞處理 | ⬜ |
| 了解布隆過濾器原理和應用 | ⬜ |
| 能實現 LRU 快取 | ⬜ |
| 掌握堆的實現和 Top K 解法 | ⬜ |
| 能比較各排序演算法特點 | ⬜ |
| 熟練二分搜尋及其變體 | ⬜ |
| 掌握動態規劃解題框架 | ⬜ |
| 理解 DFS/BFS 的應用場景 | ⬜ |
| 掌握一致性雜湊原理 | ⬜ |
| 能比較限流演算法 | ⬜ |
| 了解分散式 ID 生成方案 | ⬜ |

**建議**：未能完整回答的題目，請回到對應的詳細文章深入學習。每天刷 2-3 題 LeetCode 持續練習。
