# 向量索引技術 (HNSW, IVF)

- **難度**: 8
- **標籤**: `HNSW`, `向量索引`, `圖索引`, `效能優化`

## 問題詳述

向量索引是實現高效相似度搜尋的關鍵技術。不同的索引結構在準確率、速度、記憶體使用上有不同的權衡。本文深入探討業界最流行的兩種索引技術：HNSW（圖索引）和 IVF（倒排索引），以及它們的變體和優化。

## 核心理論與詳解

### HNSW（Hierarchical Navigable Small World）

#### 核心概念

HNSW 是當前最先進的 ANN 算法之一，結合了兩個關鍵思想：

1. **Small World Networks（小世界網絡）**：
   - 任意兩個節點可透過少數跳躍連接
   - 類似「六度分隔理論」

2. **Hierarchical Structure（層次結構）**：
   - 多層圖結構
   - 高層稀疏，用於快速導航
   - 底層密集，用於精確搜尋

#### 結構示意

```
層 2: o--------o              (稀疏長鏈接)
      |        |
層 1: o--o--o--o--o--o        (中等密度)
      |  |  |  |  |  |
層 0: o-o-o-o-o-o-o-o-o-o-o-o (密集短鏈接，所有點)
```

**層數規則**：
- 每個向量隨機分配一個層數
- 層數服從指數分佈：`P(level) = (1/M)^level`
- M 通常為 2-4

#### 插入算法

```go
type HNSW struct {
    maxLevel    int           // 最大層數
    M           int           // 每層最多連接數
    efConstruct int           // 構建時搜尋寬度
    entryPoint  *Node         // 入口節點
    nodes       map[string]*Node
}

type Node struct {
    ID         string
    Vector     []float64
    Level      int
    Neighbors  [][]string // 每層的鄰居
}

func (h *HNSW) Insert(vec Vector) {
    // 1. 隨機決定節點層數
    level := h.randomLevel()
    
    node := &Node{
        ID:        vec.ID,
        Vector:    vec.Embedding,
        Level:     level,
        Neighbors: make([][]string, level+1),
    }
    
    // 2. 從入口點開始搜尋最近鄰
    ep := h.entryPoint
    if ep == nil {
        // 第一個節點
        h.entryPoint = node
        h.nodes[vec.ID] = node
        return
    }
    
    // 3. 從頂層向下搜尋
    currentNearest := []string{ep.ID}
    
    for lc := h.maxLevel; lc > level; lc-- {
        // 在當前層貪婪搜尋最近點
        currentNearest = h.searchLayer(vec.Embedding, currentNearest, 1, lc)
    }
    
    // 4. 在目標層及以下插入連接
    for lc := level; lc >= 0; lc-- {
        // 找到該層的 efConstruct 個候選鄰居
        candidates := h.searchLayer(vec.Embedding, currentNearest, h.efConstruct, lc)
        
        // 選擇 M 個最好的鄰居（啟發式）
        neighbors := h.selectNeighbors(vec.Embedding, candidates, h.M, lc)
        
        // 雙向連接
        node.Neighbors[lc] = neighbors
        for _, neighborID := range neighbors {
            neighbor := h.nodes[neighborID]
            neighbor.Neighbors[lc] = append(neighbor.Neighbors[lc], vec.ID)
            
            // 修剪鄰居列表（保持度數限制）
            if len(neighbor.Neighbors[lc]) > h.M {
                neighbor.Neighbors[lc] = h.selectNeighbors(
                    neighbor.Vector,
                    neighbor.Neighbors[lc],
                    h.M,
                    lc,
                )
            }
        }
        
        currentNearest = candidates
    }
    
    // 5. 更新入口點（如果新節點層數更高）
    if level > h.entryPoint.Level {
        h.entryPoint = node
    }
    
    h.nodes[vec.ID] = node
}

func (h *HNSW) randomLevel() int {
    level := 0
    for rand.Float64() < 1.0/float64(h.M) && level < h.maxLevel {
        level++
    }
    return level
}

func (h *HNSW) searchLayer(
    query []float64,
    entryPoints []string,
    ef int,
    level int,
) []string {
    // 最佳優先搜尋（Best-First Search）
    visited := make(map[string]bool)
    candidates := NewMaxHeap() // 候選集（距離大的在頂部）
    bestCandidates := NewMinHeap() // 最佳集（距離小的在頂部）
    
    // 初始化
    for _, epID := range entryPoints {
        ep := h.nodes[epID]
        dist := CosineSimilarity(query, ep.Vector)
        
        candidates.Push(Item{ID: epID, Distance: dist})
        bestCandidates.Push(Item{ID: epID, Distance: dist})
        visited[epID] = true
    }
    
    for !candidates.IsEmpty() {
        current := candidates.Pop()
        
        // 如果當前距離 > 最佳集中最遠的，停止
        if current.Distance < bestCandidates.Top().Distance {
            break
        }
        
        // 檢查鄰居
        node := h.nodes[current.ID]
        for _, neighborID := range node.Neighbors[level] {
            if visited[neighborID] {
                continue
            }
            visited[neighborID] = true
            
            neighbor := h.nodes[neighborID]
            dist := CosineSimilarity(query, neighbor.Vector)
            
            // 如果比最佳集中最差的更好，或最佳集未滿
            if dist > bestCandidates.Top().Distance || bestCandidates.Size() < ef {
                candidates.Push(Item{ID: neighborID, Distance: dist})
                bestCandidates.Push(Item{ID: neighborID, Distance: dist})
                
                // 保持 ef 大小
                if bestCandidates.Size() > ef {
                    bestCandidates.Pop()
                }
            }
        }
    }
    
    // 返回最佳 ef 個候選
    result := make([]string, bestCandidates.Size())
    for i := len(result) - 1; i >= 0; i-- {
        result[i] = bestCandidates.Pop().ID
    }
    
    return result
}

func (h *HNSW) selectNeighbors(
    query []float64,
    candidates []string,
    M int,
    level int,
) []string {
    // 啟發式選擇：保持圖的連通性和搜尋效率
    // 使用 "Select Simple" 或 "Select Heuristic"
    
    // Simple: 直接選距離最近的 M 個
    if len(candidates) <= M {
        return candidates
    }
    
    type candidate struct {
        ID       string
        Distance float64
    }
    
    scored := make([]candidate, len(candidates))
    for i, id := range candidates {
        node := h.nodes[id]
        dist := CosineSimilarity(query, node.Vector)
        scored[i] = candidate{ID: id, Distance: dist}
    }
    
    sort.Slice(scored, func(i, j int) bool {
        return scored[i].Distance > scored[j].Distance
    })
    
    result := make([]string, M)
    for i := 0; i < M; i++ {
        result[i] = scored[i].ID
    }
    
    return result
}
```

#### 查詢算法

```go
func (h *HNSW) Search(query []float64, k, ef int) []Result {
    ep := h.entryPoint
    if ep == nil {
        return nil
    }
    
    // 1. 從頂層向下貪婪搜尋
    currentNearest := []string{ep.ID}
    
    for lc := ep.Level; lc > 0; lc-- {
        currentNearest = h.searchLayer(query, currentNearest, 1, lc)
    }
    
    // 2. 在底層（層0）搜尋 ef 個候選
    candidates := h.searchLayer(query, currentNearest, ef, 0)
    
    // 3. 計算精確距離並返回 Top-K
    results := make([]Result, 0, len(candidates))
    for _, id := range candidates {
        node := h.nodes[id]
        similarity := CosineSimilarity(query, node.Vector)
        results = append(results, Result{
            ID:       id,
            Distance: similarity,
        })
    }
    
    sort.Slice(results, func(i, j int) bool {
        return results[i].Distance > results[j].Distance
    })
    
    if k > len(results) {
        k = len(results)
    }
    
    return results[:k]
}
```

#### 參數調優

**M（每層最大連接數）**：
- 預設：16
- 越大越準確，但記憶體和構建時間增加
- 推薦範圍：8-64

**efConstruct（構建時搜尋寬度）**：
- 預設：200
- 越大索引質量越好，但構建慢
- 推薦範圍：100-500

**ef（查詢時搜尋寬度）**：
- 預設：50
- 越大召回率越高，但查詢慢
- 推薦範圍：k-500
- 必須 ≥ k

#### 複雜度分析

| 操作 | 時間複雜度 | 空間複雜度 |
|------|-----------|-----------|
| **插入** | O(M × efConstruct × log N) | O(M × N) |
| **查詢** | O(ef × log N) | O(N) |
| **刪除** | O(M × log N) | - |

#### 優缺點

**優勢**：
- ✅ 準確率極高（95-99%）
- ✅ 查詢速度快（log N）
- ✅ 支援動態插入/刪除
- ✅ 無需訓練

**劣勢**：
- ❌ 記憶體消耗大（每個向量需存鄰居表）
- ❌ 構建時間長
- ❌ 刪除操作複雜（需重建連接）

### IVF（Inverted File Index）

#### 核心原理

IVF 基於聚類的思想，將向量空間分割成多個區域。

**步驟**：
1. **訓練**：使用 K-Means 將數據聚類
2. **索引**：將每個向量分配到最近的簇
3. **查詢**：只在最近的幾個簇中搜尋

#### 完整實現

```go
type IVFIndex struct {
    nClusters int
    nProbe    int           // 查詢時探測簇數
    centroids [][]float64   // 簇中心
    clusters  [][]Vector    // 倒排列表
    trained   bool
}

func NewIVFIndex(nClusters, nProbe int) *IVFIndex {
    return &IVFIndex{
        nClusters: nClusters,
        nProbe:    nProbe,
        clusters:  make([][]Vector, nClusters),
    }
}

func (ivf *IVFIndex) Train(vectors []Vector) error {
    if len(vectors) < ivf.nClusters {
        return errors.New("not enough vectors for training")
    }
    
    // 提取向量數據
    data := make([][]float64, len(vectors))
    for i, vec := range vectors {
        data[i] = vec.Embedding
    }
    
    // K-Means 聚類
    ivf.centroids = KMeans(data, ivf.nClusters, 100) // 100 次迭代
    ivf.trained = true
    
    return nil
}

func (ivf *IVFIndex) Add(vectors []Vector) error {
    if !ivf.trained {
        return errors.New("index not trained")
    }
    
    for _, vec := range vectors {
        // 找最近的簇
        clusterID := ivf.findNearestCentroid(vec.Embedding)
        ivf.clusters[clusterID] = append(ivf.clusters[clusterID], vec)
    }
    
    return nil
}

func (ivf *IVFIndex) findNearestCentroid(vec []float64) int {
    maxSim := -1.0
    bestCluster := 0
    
    for i, centroid := range ivf.centroids {
        sim := CosineSimilarity(vec, centroid)
        if sim > maxSim {
            maxSim = sim
            bestCluster = i
        }
    }
    
    return bestCluster
}

func (ivf *IVFIndex) Search(query []float64, k int) []Result {
    // 1. 找最近的 nProbe 個簇
    type clusterDist struct {
        ID   int
        Dist float64
    }
    
    clusterDistances := make([]clusterDist, len(ivf.centroids))
    for i, centroid := range ivf.centroids {
        sim := CosineSimilarity(query, centroid)
        clusterDistances[i] = clusterDist{ID: i, Dist: sim}
    }
    
    sort.Slice(clusterDistances, func(i, j int) bool {
        return clusterDistances[i].Dist > clusterDistances[j].Dist
    })
    
    // 2. 在選定簇中暴力搜尋
    candidates := make([]Result, 0)
    
    probeClusters := ivf.nProbe
    if probeClusters > len(clusterDistances) {
        probeClusters = len(clusterDistances)
    }
    
    for i := 0; i < probeClusters; i++ {
        clusterID := clusterDistances[i].ID
        
        for _, vec := range ivf.clusters[clusterID] {
            sim := CosineSimilarity(query, vec.Embedding)
            candidates = append(candidates, Result{
                ID:       vec.ID,
                Distance: sim,
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

// K-Means 聚類實現
func KMeans(data [][]float64, k, maxIter int) [][]float64 {
    n := len(data)
    dim := len(data[0])
    
    // 隨機初始化中心點（K-Means++）
    centroids := kMeansPlusPlus(data, k)
    
    // 迭代優化
    for iter := 0; iter < maxIter; iter++ {
        // 分配點到最近的中心
        assignments := make([]int, n)
        for i, point := range data {
            maxSim := -1.0
            bestCluster := 0
            
            for j, centroid := range centroids {
                sim := CosineSimilarity(point, centroid)
                if sim > maxSim {
                    maxSim = sim
                    bestCluster = j
                }
            }
            
            assignments[i] = bestCluster
        }
        
        // 重新計算中心
        newCentroids := make([][]float64, k)
        counts := make([]int, k)
        
        for i := 0; i < k; i++ {
            newCentroids[i] = make([]float64, dim)
        }
        
        for i, point := range data {
            cluster := assignments[i]
            counts[cluster]++
            
            for j := 0; j < dim; j++ {
                newCentroids[cluster][j] += point[j]
            }
        }
        
        for i := 0; i < k; i++ {
            if counts[i] > 0 {
                for j := 0; j < dim; j++ {
                    newCentroids[i][j] /= float64(counts[i])
                }
                newCentroids[i] = Normalize(newCentroids[i])
            }
        }
        
        centroids = newCentroids
    }
    
    return centroids
}

// K-Means++ 初始化（更好的初始中心選擇）
func kMeansPlusPlus(data [][]float64, k int) [][]float64 {
    n := len(data)
    centroids := make([][]float64, 0, k)
    
    // 隨機選第一個中心
    centroids = append(centroids, data[rand.Intn(n)])
    
    // 依次選擇距離現有中心最遠的點
    for len(centroids) < k {
        distances := make([]float64, n)
        sum := 0.0
        
        for i, point := range data {
            minDist := math.MaxFloat64
            
            for _, centroid := range centroids {
                dist := 1 - CosineSimilarity(point, centroid)
                if dist < minDist {
                    minDist = dist
                }
            }
            
            distances[i] = minDist * minDist
            sum += distances[i]
        }
        
        // 概率選擇（距離越遠概率越大）
        target := rand.Float64() * sum
        cumSum := 0.0
        
        for i, dist := range distances {
            cumSum += dist
            if cumSum >= target {
                centroids = append(centroids, data[i])
                break
            }
        }
    }
    
    return centroids
}
```

#### 參數調優

**nClusters（簇數量）**：
- 推薦：√N 或 N/1000
- 100 萬向量 → 1000 簇
- 太少：每簇太大，搜尋慢
- 太多：簇中心計算成本高

**nProbe（探測簇數）**：
- 預設：10
- 越大召回率越高，但速度慢
- 推薦範圍：1-100
- 權衡：nProbe=1 → 最快但召回率低，nProbe=nClusters → 等同暴力搜尋

#### 複雜度

| 操作 | 時間複雜度 | 空間複雜度 |
|------|-----------|-----------|
| **訓練** | O(N × K × I × D) | O(K × D) |
| **插入** | O(K × D) | O(N) |
| **查詢** | O(K × D + (N/K) × nProbe × D) | - |

### IVF 的變體

#### IVFPQ（IVF + Product Quantization）

結合 IVF 和 PQ，記憶體更小：

```
1. IVF 粗篩：找到候選簇
2. PQ 精排：使用量化距離快速計算
```

**優勢**：
- 記憶體節省 10-100 倍
- 速度仍然很快

**劣勢**：
- 準確率下降 5-10%

#### IVFADC（IVF + Asymmetric Distance Computation）

不對查詢向量量化，只量化資料庫向量：

```
查詢：完整向量（精確）
資料庫：量化向量（壓縮）
```

**效果**：提升準確率 2-5%

### HNSW vs IVF 對比

| 特性 | HNSW | IVF |
|------|------|-----|
| **準確率** | 95-99% | 90-95% |
| **查詢速度** | 很快 (log N) | 快 (N/K × nProbe) |
| **記憶體** | 高 (M × N) | 中 (N + K) |
| **構建時間** | 長 | 中（需訓練） |
| **動態更新** | 支援 | 支援（但需重新聚類） |
| **訓練** | 無需 | 需要 |
| **適用場景** | 通用最優 | 超大規模 + 記憶體受限 |

## 常見面試問題

### 1. HNSW 為什麼這麼快？

**答案要點**：
- **層次結構**：高層稀疏快速導航，底層密集精確搜尋
- **小世界特性**：少數跳躍即可遍歷圖
- **複雜度**：O(log N)，而非暴力的 O(N)
- **貪婪搜尋**：每層都選最近的鄰居

### 2. HNSW 和 IVF 如何選擇？

**答案要點**：
- **HNSW**：需要高準確率、記憶體充足、需要動態更新
- **IVF**：超大規模、記憶體受限、可接受離線訓練
- **組合**：IVFPQ 用於億級數據 + 記憶體受限

### 3. HNSW 的 M、ef、efConstruct 如何設置？

**答案要點**：
- **M**：16（預設），越大越準確但記憶體更多
- **efConstruct**：200（預設），越大索引質量越好但構建慢
- **ef**：查詢參數，動態調整，通常 50-200
- **關係**：ef ≥ k，efConstruct ≥ M

### 4. IVF 的簇邊界問題如何解決？

**答案要點**：
- **問題**：向量在簇邊界，可能被分配到錯誤的簇
- **解決 1**：增加 nProbe，探測更多簇
- **解決 2**：使用 soft assignment（多簇分配）
- **解決 3**：使用更多簇（但會增加開銷）

### 5. 為什麼 HNSW 需要層次結構？

**答案要點**：
- **單層圖問題**：貪婪搜尋容易陷入局部最優
- **高層導航**：稀疏長鏈接，快速跳過大片區域
- **底層精確**：密集短鏈接，找到真正的最近鄰
- **類比**：高速公路（高層）+ 市區道路（底層）

## 總結

向量索引是向量資料庫效能的關鍵：

1. **HNSW**：當前最優算法，準確快速但記憶體高
2. **IVF**：經典算法，適合超大規模
3. **組合**：IVFPQ 結合粗篩和量化，平衡各方面
4. **選型**：根據數據規模、準確率需求、資源限制
5. **調優**：理解參數含義，根據場景調整

現代向量資料庫如 Milvus、Weaviate、Qdrant 都同時支援多種索引，允許用戶根據需求選擇。

## 延伸閱讀

- [HNSW Paper](https://arxiv.org/abs/1603.09320)
- [Faiss: IVF and PQ Implementation](https://github.com/facebookresearch/faiss/wiki)
- [Vector Index Benchmarks](https://github.com/erikbern/ann-benchmarks)
