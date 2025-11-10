# 向量資料庫效能優化

- **難度**: 8
- **標籤**: `效能優化`, `索引`, `快取`, `分片`

## 問題詳述

向量資料庫的效能直接影響用戶體驗和成本。本文探討影響效能的關鍵因素，以及從索引選擇、參數調優、硬體配置到架構設計的全方位優化策略。

## 核心理論與詳解

### 效能指標

#### 關鍵指標

1. **QPS（Queries Per Second）**
   - 每秒查詢數
   - 目標：> 1000 QPS

2. **延遲（Latency）**
   - P50：中位數
   - P95：95% 請求的延遲
   - P99：99% 請求的延遲
   - 目標：P95 < 100ms

3. **召回率（Recall）**
   - 找回正確結果的比例
   - 目標：> 95%

4. **記憶體使用**
   - 每個向量的記憶體開銷
   - 目標：< 向量大小的 5 倍

### 索引優化

#### HNSW 參數調優

```go
// 構建參數
M := 16              // 每層連接數，越大越準確但記憶體更多
efConstruction := 200 // 構建時搜尋寬度，越大質量越好但構建慢

// 查詢參數  
ef := 100            // 查詢時搜尋寬度，越大召回率越高但查詢慢

// 效能 vs 準確率權衡
// M=8, ef=50:   快速但準確率 90%
// M=16, ef=100: 平衡，準確率 95%
// M=32, ef=200: 慢但準確率 98%
```

#### IVF 參數調優

```go
nClusters := int(math.Sqrt(float64(vectorCount))) // 簇數量
nProbe := 10                                       // 探測簇數

// nProbe 權衡
// nProbe=1:   最快，召回率 60-70%
// nProbe=10:  平衡，召回率 90%
// nProbe=50:  慢，召回率 98%
```

### 查詢優化

#### 批次查詢

```go
// 單個查詢：100 次 × 10ms = 1000ms
// 批次查詢：1 次 × 50ms = 50ms（20 倍加速）

func BatchSearch(queries [][]float64, k int) [][]Result {
    // 並發查詢
    results := make([][]Result, len(queries))
    var wg sync.WaitGroup
    
    for i, query := range queries {
        wg.Add(1)
        go func(i int, query []float64) {
            defer wg.Done()
            results[i] = index.Search(query, k)
        }(i, query)
    }
    
    wg.Wait()
    return results
}
```

#### 過濾優化

```go
// 低效：先檢索大量向量，再過濾
results := index.Search(query, 1000)
filtered := filterByMetadata(results, condition)

// 高效：索引階段就過濾
results := index.SearchWithFilter(query, 100, filter)
```

### 記憶體優化

#### 量化（Quantization）

```go
// Float32: 4 bytes/dim
// 768 維向量 = 3072 bytes

// 量化為 Int8: 1 byte/dim  
// 768 維向量 = 768 bytes（節省 75%）

// 準確率損失：< 2%
```

#### 磁碟索引（DiskANN）

```
記憶體：僅存熱數據和索引結構
磁碟：存完整向量
查詢：從磁碟讀取精確距離

效果：記憶體減少 10 倍，延遲增加 2-3 倍
```

### 硬體優化

#### CPU

```
向量計算是 CPU 密集型
- 選擇高主頻 CPU
- 啟用 SIMD 指令（AVX2, AVX512）
- 多核並發
```

#### 記憶體

```
索引需要大量記憶體
- HNSW: 每個向量 200-500 bytes（不含原始向量）
- 1000 萬向量 ≈ 20-50 GB

建議：RAM = 原始數據 × 3-5
```

#### GPU

```
適合大批次推理（Embedding 生成）
不適合向量搜尋（GPU 記憶體小、數據傳輸慢）
```

### 架構優化

#### 分片（Sharding）

```
垂直分片：按向量 ID 範圍
水平分片：按業務維度（用戶、租戶）

策略：
- 分片數 = CPU 核心數 × 2
- 每個分片 < 1000 萬向量
```

#### 副本（Replication）

```
讀寫分離：
- 主節點：寫入
- 從節點：查詢

負載均衡：
- 輪詢、最少連接、加權
```

#### 快取

```
L1: 應用層快取（完整結果）
L2: 向量資料庫內建快取（熱數據）
L3: CDN（靜態 Embedding）
```

## 優化案例

### 案例：優化 P95 延遲

**問題**：P95 延遲 500ms

**分析**：
1. 索引參數過高（efConstruction=500）
2. 無批次查詢
3. 過濾在應用層

**優化**：
```go
// 1. 降低 efConstruction（質量略降但可接受）
efConstruction: 200

// 2. 啟用批次查詢
batchSize: 10

// 3. 推送過濾到資料庫
filter: "category = 'tech'"
```

**結果**：P95 延遲降至 80ms

### 案例：優化記憶體使用

**問題**：1000 萬向量佔用 100GB RAM

**優化**：
```go
// 1. 啟用標量量化
quantization: "scalar"  // 節省 75% 記憶體

// 2. 使用 PQ
productQuantization: {
    m: 64,  // 分成 64 段
    nbits: 8 // 每段 8 位
}

// 3. 磁碟索引（冷數據）
diskIndex: true
```

**結果**：記憶體降至 25GB

## 常見面試問題

### 1. 如何優化向量搜尋的延遲？

**答案要點**：
- **索引參數**：降低 ef/nProbe（犧牲少量準確率）
- **批次查詢**：減少網路往返
- **過濾下推**：在索引階段過濾
- **快取**：熱查詢快取結果
- **硬體**：高主頻 CPU、大記憶體

### 2. 如何在有限記憶體下支援大規模數據？

**答案要點**：
- **量化**：Float32 → Int8，節省 75%
- **PQ**：壓縮向量，節省 10-100 倍
- **磁碟索引**：熱數據在記憶體，冷數據在磁碟
- **分片**：分散到多台機器

### 3. HNSW 和 IVF 哪個更快？

**答案要點**：
- **HNSW**：查詢更快（log N），但記憶體多
- **IVF**：記憶體少，但查詢慢（N/K × nProbe）
- **選擇**：記憶體充足用 HNSW，受限用 IVF
- **組合**：IVFPQ 平衡兩者

### 4. 如何權衡召回率和效能？

**答案要點**：
- **參數調整**：ef、nProbe 越大召回率越高但越慢
- **分級查詢**：先快速粗篩，再精確重排
- **A/B 測試**：測試不同參數對業務指標的影響
- **目標設定**：根據業務需求設定可接受的召回率下限

### 5. 向量資料庫能用 GPU 加速嗎？

**答案要點**：
- **Embedding 生成**：適合 GPU（大批次、矩陣運算）
- **向量搜尋**：不適合 GPU（小批次、隨機訪問、記憶體小）
- **例外**：Faiss GPU 在特定場景有效（高維、大批次）
- **實踐**：生產環境多用 CPU

## 總結

向量資料庫效能優化需要多層次考慮：

1. **索引選擇**：HNSW（通用）、IVF（大規模）、PQ（記憶體受限）
2. **參數調優**：M、ef、nProbe 根據需求權衡
3. **查詢優化**：批次、過濾下推、快取
4. **記憶體優化**：量化、PQ、磁碟索引
5. **架構優化**：分片、副本、負載均衡

效能優化是持續過程，需要根據實際負載和業務需求不斷調整。

## 延伸閱讀

- [Faiss Performance Tuning](https://github.com/facebookresearch/faiss/wiki/Guidelines-to-choose-an-index)
- [Milvus Performance FAQ](https://milvus.io/docs/performance_faq.md)
- [HNSW Parameter Tuning](https://www.pinecone.io/learn/hnsw/)
