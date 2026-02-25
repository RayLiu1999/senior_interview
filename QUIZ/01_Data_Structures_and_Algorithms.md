# 資料結構與演算法 (Data Structures and Algorithms) - 重點考題 (Quiz)

> 這份考題是從資料結構與演算法章節中挑選出**重要程度 4-5** 的核心題目，設計成自我測驗的形式。
> 
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

## 📊 核心資料結構

### Q1: B+ 樹的原理及為何適合資料庫索引？

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
