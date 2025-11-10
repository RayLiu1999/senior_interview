# 相似度搜尋算法詳解

- **難度**: 7
- **標籤**: `相似度`, `ANN`, `向量搜尋`, `算法`

## 問題詳述

相似度搜尋是向量資料庫的核心功能，用於找出與查詢向量最相似的 K 個向量。精確搜尋（暴力比對）在大規模數據下效能不佳，因此需要近似最近鄰（ANN）算法來平衡準確率和效能。本文深入探討各種相似度度量和搜尋算法。

## 核心理論與詳解

### 相似度度量方法

#### 1. 歐氏距離（Euclidean Distance）

**定義**：兩點間的直線距離

```
d(p, q) = √(Σ(p_i - q_i)²)
```

**特性**：
- 取值範圍：[0, +∞)
- 距離越小越相似
- 對向量長度敏感
- 適用於坐標空間

**使用場景**：
- 圖像相似度（像素空間）
- 地理位置距離
- 需要考慮量級差異的場景

#### 2. 餘弦相似度（Cosine Similarity）

**定義**：兩向量夾角的餘弦值

```
sim(A, B) = (A · B) / (||A|| × ||B||)
         = Σ(A_i × B_i) / (√Σ(A_i²) × √Σ(B_i²))
```

**特性**：
- 取值範圍：[-1, 1]
- 1 表示完全相同，-1 表示完全相反
- 只考慮方向，忽略長度
- 適用於文本向量

**為什麼文本常用餘弦相似度**：
```
文本 A: "I love AI"        → [0.5, 0.3, 0.2]
文本 B: "I love love AI"   → [0.4, 0.4, 0.2]

歐氏距離會認為它們差異大（因為長度不同）
餘弦相似度會認為它們相似（因為方向相同）
```

**轉換為距離**：
```
cosine_distance = 1 - cosine_similarity
```

#### 3. 內積（Dot Product / Inner Product）

**定義**：向量對應元素乘積之和

```
dot(A, B) = Σ(A_i × B_i)
```

**特性**：
- 取值範圍：(-∞, +∞)
- 值越大越相似
- 考慮長度和方向
- 計算最快（無需開方）

**與餘弦相似度的關係**：
```
如果向量已標準化（||v|| = 1），則：
dot(A, B) = cosine_similarity(A, B)
```

**優化技巧**：
```go
// 預先標準化向量，將餘弦相似度計算簡化為內積
func Normalize(vec []float64) []float64 {
    norm := 0.0
    for _, v := range vec {
        norm += v * v
    }
    norm = math.Sqrt(norm)
    
    result := make([]float64, len(vec))
    for i, v := range vec {
        result[i] = v / norm
    }
    return result
}

// 標準化後，內積 = 餘弦相似度
func DotProduct(a, b []float64) float64 {
    sum := 0.0
    for i := range a {
        sum += a[i] * b[i]
    }
    return sum
}
```

#### 4. 曼哈頓距離（Manhattan Distance）

**定義**：坐標差的絕對值之和

```
d(p, q) = Σ|p_i - q_i|
```

**特性**：
- 也稱 L1 距離
- 計算簡單
- 對異常值不敏感
- 適用於稀疏向量

#### 5. 漢明距離（Hamming Distance）

**定義**：二進制向量中不同位的數量

```
d(p, q) = count(p_i ≠ q_i)
```

**使用場景**：
- 二進制哈希（SimHash）
- 錯誤檢測
- DNA 序列比對

### 精確搜尋（Brute Force）

#### 實現原理

遍歷所有向量，計算與查詢向量的距離，返回 Top-K。

```go
type BruteForceSearch struct {
    vectors []Vector
}

type Vector struct {
    ID        string
    Embedding []float64
}

func (bfs *BruteForceSearch) Search(query []float64, k int) []Result {
    // 計算所有距離
    distances := make([]Result, len(bfs.vectors))
    
    for i, vec := range bfs.vectors {
        distance := CosineSimilarity(query, vec.Embedding)
        distances[i] = Result{
            ID:       vec.ID,
            Distance: distance,
        }
    }
    
    // 排序並返回 Top-K
    sort.Slice(distances, func(i, j int) bool {
        return distances[i].Distance > distances[j].Distance // 降序（相似度）
    })
    
    if k > len(distances) {
        k = len(distances)
    }
    
    return distances[:k]
}

// 優化：使用最小堆，避免全量排序
func (bfs *BruteForceSearch) SearchWithHeap(query []float64, k int) []Result {
    // 最小堆，容量 k
    heap := NewMinHeap(k)
    
    for _, vec := range bfs.vectors {
        similarity := CosineSimilarity(query, vec.Embedding)
        heap.Push(Result{ID: vec.ID, Distance: similarity})
    }
    
    return heap.Results()
}
```

#### 複雜度分析

- **時間複雜度**：O(N × D)
  - N：向量數量
  - D：向量維度
- **空間複雜度**：O(K)（使用堆）

#### 何時使用

- 數據量小（< 10 萬）
- 需要 100% 準確率
- 離線計算，對延遲不敏感

### 近似最近鄰（ANN）算法

#### 為什麼需要 ANN

**維度災難（Curse of Dimensionality）**：
- 高維空間中，點之間的距離趨於相等
- 暴力搜尋在百萬級數據下延遲達秒級
- 需要犧牲少量準確率換取巨大的效能提升

**權衡**：
```
精確搜尋：100% 準確，但慢（秒級）
ANN 搜尋：95-99% 準確，但快（毫秒級）
```

#### 1. 倒排索引（Inverted File Index, IVF）

**原理**：聚類 + 粗篩 + 精排

**步驟**：
```
1. 訓練階段：
   - 使用 K-Means 將向量聚類成 N 個簇
   - 記錄每個向量屬於哪個簇

2. 搜尋階段：
   - 找到查詢向量最近的 M 個簇（粗篩）
   - 只在這 M 個簇中暴力搜尋（精排）
   - 返回 Top-K
```

**示意圖**：
```
所有向量（100萬個）
    ↓ K-Means 聚類
1000 個簇（每簇 1000 個向量）
    ↓ 查詢時只搜尋最近的 10 個簇
只需比對 10,000 個向量（減少 99%）
```

**Go 實現**：

```go
type IVFIndex struct {
    nClusters int
    centroids [][]float64  // 簇中心
    clusters  [][]Vector   // 每個簇的向量
}

func (ivf *IVFIndex) Train(vectors []Vector) {
    // 使用 K-Means 聚類
    ivf.centroids = KMeans(vectors, ivf.nClusters)
    
    // 分配向量到簇
    ivf.clusters = make([][]Vector, ivf.nClusters)
    for _, vec := range vectors {
        clusterID := ivf.findNearestCentroid(vec.Embedding)
        ivf.clusters[clusterID] = append(ivf.clusters[clusterID], vec)
    }
}

func (ivf *IVFIndex) Search(query []float64, k int, nProbe int) []Result {
    // 1. 找到最近的 nProbe 個簇
    nearestClusters := ivf.findNearestClusters(query, nProbe)
    
    // 2. 在這些簇中暴力搜尋
    candidates := make([]Result, 0)
    for _, clusterID := range nearestClusters {
        for _, vec := range ivf.clusters[clusterID] {
            similarity := CosineSimilarity(query, vec.Embedding)
            candidates = append(candidates, Result{
                ID:       vec.ID,
                Distance: similarity,
            })
        }
    }
    
    // 3. 排序返回 Top-K
    sort.Slice(candidates, func(i, j int) bool {
        return candidates[i].Distance > candidates[j].Distance
    })
    
    if k > len(candidates) {
        k = len(candidates)
    }
    
    return candidates[:k]
}

func (ivf *IVFIndex) findNearestClusters(query []float64, nProbe int) []int {
    distances := make([]struct {
        ID       int
        Distance float64
    }, len(ivf.centroids))
    
    for i, centroid := range ivf.centroids {
        distances[i] = struct {
            ID       int
            Distance float64
        }{i, CosineSimilarity(query, centroid)}
    }
    
    sort.Slice(distances, func(i, j int) bool {
        return distances[i].Distance > distances[j].Distance
    })
    
    result := make([]int, nProbe)
    for i := 0; i < nProbe; i++ {
        result[i] = distances[i].ID
    }
    
    return result
}
```

**複雜度**：
- **訓練**：O(N × K × I)（K-Means 迭代 I 次）
- **搜尋**：O(C × D + M × D)
  - C：簇數量
  - M：探測簇內的向量數（N/C × nProbe）

**參數調優**：
- **nClusters**：簇數量，通常 √N
- **nProbe**：探測簇數，越大越準確但越慢

**優缺點**：
- ✅ 簡單易實現
- ✅ 效果穩定
- ❌ 需要訓練階段
- ❌ 簇邊界問題（向量在簇邊緣可能被遺漏）

#### 2. 局部敏感哈希（Locality Sensitive Hashing, LSH）

**原理**：使用哈希函數將相似向量映射到同一個桶

**核心思想**：
```
普通哈希：相似的輸入 → 不同的哈希值
LSH：     相似的輸入 → 相同的哈希值（高概率）
```

**隨機投影 LSH**：

```go
type LSHIndex struct {
    numTables      int        // 哈希表數量
    numHashPerTable int       // 每個表的哈希函數數量
    hashTables     []map[string][]Vector
    randomVectors  [][][]float64 // 隨機超平面
}

func NewLSHIndex(numTables, numHashPerTable, dim int) *LSHIndex {
    lsh := &LSHIndex{
        numTables:       numTables,
        numHashPerTable: numHashPerTable,
        hashTables:      make([]map[string][]Vector, numTables),
        randomVectors:   make([][][]float64, numTables),
    }
    
    // 初始化哈希表和隨機向量
    for i := 0; i < numTables; i++ {
        lsh.hashTables[i] = make(map[string][]Vector)
        lsh.randomVectors[i] = make([][]float64, numHashPerTable)
        
        for j := 0; j < numHashPerTable; j++ {
            lsh.randomVectors[i][j] = generateRandomVector(dim)
        }
    }
    
    return lsh
}

func (lsh *LSHIndex) hash(vec []float64, tableID int) string {
    var hashCode strings.Builder
    
    for i := 0; i < lsh.numHashPerTable; i++ {
        // 計算向量與隨機超平面的內積
        dot := DotProduct(vec, lsh.randomVectors[tableID][i])
        
        // 根據正負決定位元
        if dot >= 0 {
            hashCode.WriteString("1")
        } else {
            hashCode.WriteString("0")
        }
    }
    
    return hashCode.String()
}

func (lsh *LSHIndex) Insert(vec Vector) {
    // 插入到所有哈希表
    for i := 0; i < lsh.numTables; i++ {
        hashCode := lsh.hash(vec.Embedding, i)
        lsh.hashTables[i][hashCode] = append(lsh.hashTables[i][hashCode], vec)
    }
}

func (lsh *LSHIndex) Search(query []float64, k int) []Result {
    // 從所有哈希表中找候選
    candidateSet := make(map[string]Vector)
    
    for i := 0; i < lsh.numTables; i++ {
        hashCode := lsh.hash(query, i)
        
        // 獲取該桶中的所有向量
        if bucket, ok := lsh.hashTables[i][hashCode]; ok {
            for _, vec := range bucket {
                candidateSet[vec.ID] = vec
            }
        }
    }
    
    // 計算候選集的精確距離
    results := make([]Result, 0, len(candidateSet))
    for _, vec := range candidateSet {
        similarity := CosineSimilarity(query, vec.Embedding)
        results = append(results, Result{
            ID:       vec.ID,
            Distance: similarity,
        })
    }
    
    // 排序返回 Top-K
    sort.Slice(results, func(i, j int) bool {
        return results[i].Distance > results[j].Distance
    })
    
    if k > len(results) {
        k = len(results)
    }
    
    return results[:k]
}

func generateRandomVector(dim int) []float64 {
    vec := make([]float64, dim)
    for i := range vec {
        vec[i] = rand.NormFloat64() // 標準正態分佈
    }
    return Normalize(vec)
}
```

**參數**：
- **L**（numTables）：哈希表數量，越多召回率越高
- **K**（numHashPerTable）：每個表的哈希位數，越多精確度越高

**優缺點**：
- ✅ 無需訓練
- ✅ 支援動態插入
- ✅ 理論保證（概率界）
- ❌ 高維效果變差
- ❌ 參數敏感

#### 3. 產品量化（Product Quantization, PQ）

**原理**：將高維向量分段量化，用碼本編碼

**步驟**：
```
1. 切分：將 D 維向量切分成 M 段，每段 D/M 維
   [v1, v2, ..., vD] → [v1..v8 | v9..v16 | ... | v57..v64]

2. 量化：每段獨立聚類成 K 個中心（碼本）
   每段用 1 個字節表示（K=256）

3. 編碼：每個向量用 M 個字節表示
   原本 64 維 × 4 字節 = 256 字節
   壓縮後 8 段 × 1 字節 = 8 字節（壓縮 32 倍）

4. 搜尋：預計算查詢向量與所有碼本的距離
   查詢時直接查表，無需計算
```

**優勢**：
- 記憶體節省 10-100 倍
- 搜尋速度快（查表 vs 計算）
- 適合大規模數據

**劣勢**：
- 損失精確度（量化誤差）
- 訓練複雜

### 算法對比

| 算法 | 準確率 | 速度 | 記憶體 | 訓練 | 適用場景 |
|------|--------|------|--------|------|---------|
| **Brute Force** | 100% | 慢 | 高 | 無 | 小數據集 |
| **IVF** | 90-95% | 快 | 高 | 需要 | 中大型數據 |
| **LSH** | 80-90% | 很快 | 中 | 無 | 高維稀疏 |
| **PQ** | 85-95% | 很快 | 低 | 需要 | 超大規模 |
| **HNSW** | 95-99% | 很快 | 高 | 無 | 通用最優 |

## 常見面試問題

### 1. 歐氏距離和餘弦相似度有什麼區別？

**答案要點**：
- **歐氏距離**：考慮向量長度和方向，對量級敏感
- **餘弦相似度**：只考慮方向，忽略長度
- **文本場景**：用餘弦（"love" vs "love love"）
- **圖像場景**：可用歐氏（像素值差異）
- **優化**：標準化後，餘弦相似度 = 內積

### 2. 為什麼需要近似搜尋（ANN）？

**答案要點**：
- **維度災難**：高維空間距離分佈均勻
- **效能瓶頸**：百萬級暴力搜尋需數秒
- **權衡**：95-99% 準確率，換取 100-1000 倍加速
- **實際可接受**：大多數應用不需要 100% 準確

### 3. IVF 算法的原理是什麼？

**答案要點**：
- **聚類**：K-Means 將向量分成簇
- **粗篩**：查詢時只搜尋最近的幾個簇
- **精排**：在候選簇中暴力搜尋
- **參數**：nProbe 越大越準確但越慢
- **問題**：簇邊界向量可能被遺漏

### 4. LSH 為什麼能保證相似向量哈希到同一桶？

**答案要點**：
- **隨機超平面**：將空間分成兩半
- **內積正負**：決定向量在超平面哪一側
- **多次哈希**：使用多個隨機超平面
- **概率保證**：相似向量有高概率得到相同哈希值
- **多表策略**：提高召回率

### 5. 如何選擇合適的相似度算法？

**答案要點**：
- **數據量 < 10 萬**：Brute Force
- **數據量 10 萬 - 100 萬**：IVF
- **數據量 > 100 萬**：HNSW 或 IVF + PQ
- **記憶體受限**：PQ 或 LSH
- **需要動態更新**：HNSW 或 LSH
- **需要高準確率**：HNSW

## 總結

相似度搜尋是向量資料庫的核心，需要理解：

1. **度量方法**：歐氏、餘弦、內積的差異和適用場景
2. **精確搜尋**：暴力比對，100% 準確但慢
3. **近似搜尋**：IVF、LSH、PQ 等，快速但有誤差
4. **權衡**：準確率 vs 速度 vs 記憶體
5. **選型**：根據數據規模、效能需求、資源限制選擇

現代向量資料庫多採用 HNSW 或 IVF+PQ 的組合，實現準確率和效能的最佳平衡。

## 延伸閱讀

- [Faiss: A Library for Efficient Similarity Search](https://github.com/facebookresearch/faiss)
- [ANN Benchmarks](http://ann-benchmarks.com/)
- [LSH Tutorial](https://web.stanford.edu/class/cs246/slides/03-lsh.pdf)
