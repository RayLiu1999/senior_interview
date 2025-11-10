# 向量資料庫 (Vector Databases)

向量資料庫是專為儲存和查詢高維向量而設計的資料庫系統，是構建語義搜尋、RAG、推薦系統等 AI 應用的核心基礎設施。本模組深入探討向量資料庫的原理、算法、產品對比和實踐應用。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [什麼是向量資料庫](./what_is_vector_database.md) | 5 | 5 | `基礎概念`, `向量`, `資料庫` |
| 2 | [向量嵌入 (Embeddings) 原理](./vector_embeddings.md) | 6 | 5 | `Embedding`, `語義`, `表示學習` |
| 3 | [相似度搜尋算法詳解](./similarity_search_algorithms.md) | 7 | 4 | `ANN`, `IVF`, `LSH`, `算法` |
| 4 | [向量索引技術 (HNSW, IVF)](./vector_indexing.md) | 8 | 5 | `HNSW`, `IVF`, `索引`, `效能` |
| 5 | [主流向量資料庫對比與選型](./vector_db_comparison.md) | 7 | 4 | `Pinecone`, `Milvus`, `Weaviate`, `Qdrant` |
| 6 | [pgvector：PostgreSQL 的向量擴展](./pgvector_guide.md) | 6 | 4 | `pgvector`, `PostgreSQL`, `SQL` |
| 7 | [向量資料庫效能優化](./vector_db_performance.md) | 8 | 4 | `效能`, `優化`, `調優` |

---

## 學習建議

### 1. 核心概念理解

首先理解向量資料庫的核心價值：
- **高維向量儲存**：不同於傳統資料庫的標量數據
- **語義相似度搜尋**：找到「意義相近」而非「完全匹配」的結果
- **高效檢索**：在百萬、億級向量中毫秒級查詢
- **應用場景**：RAG、語義搜尋、推薦系統、圖像檢索

從「什麼是向量資料庫」開始，建立整體認知。

### 2. Embedding 技術掌握

理解如何將文本、圖像等轉換為向量：
- **文本 Embedding**：BERT、OpenAI Ada-002、多語言模型
- **相似度度量**：餘弦相似度 vs 歐氏距離
- **維度選擇**：768、1536、3072 維的權衡
- **標準化**：何時需要、如何實現

深入學習「向量嵌入原理」，這是所有應用的基礎。

### 3. 算法與索引深度學習

這是向量資料庫的核心技術：

**相似度搜尋算法**：
- 精確搜尋（Brute Force）：100% 準確但慢
- IVF（倒排索引）：聚類 + 粗篩 + 精排
- LSH（局部敏感哈希）：相似向量哈希到同一桶
- PQ（產品量化）：向量壓縮技術

**向量索引技術**：
- **HNSW**：當前最優算法，95-99% 準確率
- **IVF**：經典算法，適合超大規模
- **組合**：IVFPQ、IVFADC
- **參數調優**：M、ef、nProbe 的設置

建議按順序學習「相似度搜尋算法」→「向量索引技術」，從原理到實現。

### 4. 產品選型與實踐

理解不同向量資料庫的特點和適用場景：

**雲端服務**：
- **Pinecone**：完全託管，快速上手
- 適合快速原型和小中型應用

**開源方案**：
- **Milvus**：高效能，企業級，適合大規模
- **Weaviate**：模組化，GraphQL API
- **Qdrant**：Rust 實現，高效能
- **Chroma**：輕量級，嵌入式

**PostgreSQL 擴展**：
- **pgvector**：整合現有 PG，成本最低
- 適合小中型應用和原型開發

**選型框架**：
- 數據規模：< 100 萬用 pgvector，> 1000 萬用 Milvus
- QPS 需求：高 QPS 選 Milvus/Qdrant
- 預算：有限用開源，充足用託管
- 團隊能力：無運維用 Pinecone，有團隊用 Milvus

學習「主流向量資料庫對比」和「pgvector 指南」，建立選型能力。

### 5. 效能優化實戰

掌握生產環境的效能優化技巧：

**索引優化**：
- HNSW 參數：M、efConstruction、ef
- IVF 參數：nClusters、nProbe
- 權衡：準確率 vs 速度 vs 記憶體

**查詢優化**：
- 批次查詢：減少網路往返
- 過濾下推：索引階段過濾
- 快取策略：多層快取

**記憶體優化**：
- 量化：Float32 → Int8，節省 75%
- PQ：壓縮 10-100 倍
- 磁碟索引：冷熱分離

**架構優化**：
- 分片：水平擴展
- 副本：讀寫分離
- 負載均衡：流量分發

深入學習「向量資料庫效能優化」，掌握生產級優化技能。

---

## 學習路徑

### 初級（1-2 天）

**目標**：理解基礎概念，能夠使用向量資料庫

1. ✅ 什麼是向量資料庫
2. ✅ 向量嵌入原理
3. ✅ pgvector 快速上手

**實踐**：
- 用 OpenAI API 生成 Embedding
- 在 PostgreSQL 中用 pgvector 實現簡單的語義搜尋
- 理解餘弦相似度計算

### 中級（3-5 天）

**目標**：理解算法原理，能夠選型和調優

4. ✅ 相似度搜尋算法
5. ✅ 向量索引技術
6. ✅ 向量資料庫對比

**實踐**：
- 實現 IVF 算法（簡化版）
- 對比 HNSW 和 IVF 的效能
- 評估不同產品的適用場景
- 調整索引參數，觀察準確率和速度變化

### 高級（5-7 天）

**目標**：掌握生產級優化，能夠設計大規模系統

7. ✅ 向量資料庫效能優化

**實踐**：
- 部署 Milvus 集群
- 實現量化和 PQ 壓縮
- 設計分片和副本策略
- 優化 P95 延遲到 < 100ms
- 處理億級向量的查詢

---

## 核心概念速查

### 相似度度量

| 度量 | 公式 | 適用場景 | 取值範圍 |
|------|------|---------|---------|
| **餘弦相似度** | cos(θ) = A·B / (‖A‖‖B‖) | 文本、NLP | [-1, 1] |
| **歐氏距離** | √Σ(p_i - q_i)² | 圖像、坐標 | [0, +∞) |
| **內積** | Σ(A_i × B_i) | 標準化向量 | (-∞, +∞) |

### 索引對比

| 索引 | 準確率 | 速度 | 記憶體 | 適用規模 |
|------|--------|------|--------|---------|
| **Brute Force** | 100% | 慢 O(N) | 低 | < 10 萬 |
| **IVF** | 90-95% | 快 | 中 | 10 萬 - 1 億 |
| **HNSW** | 95-99% | 很快 O(log N) | 高 | 通用 |
| **PQ** | 85-95% | 很快 | 極低 | > 1 億 |

### 產品選型速查

| 場景 | 推薦產品 | 原因 |
|------|---------|------|
| **快速原型** | Pinecone, pgvector | 開箱即用 |
| **< 100 萬向量** | pgvector | 成本低 |
| **100 萬 - 1000 萬** | Qdrant, Weaviate | 平衡 |
| **> 1000 萬** | Milvus | 大規模優化 |
| **已用 PostgreSQL** | pgvector | 整合方便 |
| **預算有限** | 開源方案 | 免費 |

---

## 常見問題

### Q1: 向量資料庫和傳統資料庫有什麼區別？

**A**: 
- **數據類型**：高維向量 vs 標量數據
- **查詢方式**：相似度搜尋 vs 精確匹配
- **索引**：ANN 算法 vs B-Tree
- **度量**：餘弦、歐氏 vs 相等、大小

### Q2: 為什麼需要 ANN 而不是精確搜尋？

**A**:
- **維度災難**：高維空間精確搜尋 O(N)，太慢
- **可接受誤差**：95-99% 準確率通常足夠
- **效能提升**：ANN 比精確搜尋快 100-1000 倍
- **實際需求**：大多數應用不需要 100% 準確

### Q3: HNSW 和 IVF 如何選擇？

**A**:
- **HNSW**：準確率高、查詢快，但記憶體多，適合通用場景
- **IVF**：記憶體少，適合超大規模
- **選擇**：記憶體充足用 HNSW，受限用 IVF

### Q4: 向量資料庫能替代傳統資料庫嗎？

**A**:
- **不能完全替代**：向量資料庫專注語義搜尋
- **互補關係**：傳統資料庫存結構化數據，向量資料庫存 Embedding
- **混合方案**：pgvector 整合兩者，或分別使用後整合結果

### Q5: 如何評估向量資料庫的效能？

**A**:
- **QPS**：每秒查詢數，目標 > 1000
- **延遲**：P95、P99，目標 < 100ms
- **召回率**：準確率，目標 > 95%
- **記憶體**：單位向量的記憶體開銷

---

## 實戰技巧

### 1. Embedding 生成優化

```go
// 批次生成，減少 API 調用
func BatchGenerate(texts []string) [][]float64 {
    batchSize := 100
    embeddings := make([][]float64, len(texts))
    
    for i := 0; i < len(texts); i += batchSize {
        end := min(i+batchSize, len(texts))
        batch := texts[i:end]
        
        resp := openaiClient.CreateEmbeddings(batch)
        copy(embeddings[i:], resp.Data)
    }
    
    return embeddings
}
```

### 2. 相似度計算優化

```go
// 預先標準化向量，將餘弦相似度簡化為內積
func Normalize(vec []float64) []float64 {
    norm := 0.0
    for _, v := range vec {
        norm += v * v
    }
    norm = math.Sqrt(norm)
    
    normalized := make([]float64, len(vec))
    for i, v := range vec {
        normalized[i] = v / norm
    }
    return normalized
}

// 標準化後，CosineSimilarity = DotProduct
func CosineSimilarity(a, b []float64) float64 {
    // 假設 a, b 已標準化
    sum := 0.0
    for i := range a {
        sum += a[i] * b[i]
    }
    return sum
}
```

### 3. 混合搜尋

```go
// 結合向量搜尋和標量過濾
func HybridSearch(query string, filter map[string]interface{}, k int) []Result {
    // 1. 生成 Embedding
    embedding := GenerateEmbedding(query)
    
    // 2. 向量搜尋（獲取候選）
    candidates := vectorDB.Search(embedding, k*10)
    
    // 3. 標量過濾
    filtered := make([]Result, 0)
    for _, candidate := range candidates {
        if MatchFilter(candidate.Metadata, filter) {
            filtered = append(filtered, candidate)
            if len(filtered) >= k {
                break
            }
        }
    }
    
    return filtered
}
```

### 4. 增量更新

```go
// 定期重建索引 vs 實時插入
type IncrementalIndex struct {
    index       VectorIndex
    buffer      []Vector
    bufferSize  int
    rebuildSize int
}

func (idx *IncrementalIndex) Add(vec Vector) {
    idx.buffer = append(idx.buffer, vec)
    
    if len(idx.buffer) >= idx.bufferSize {
        idx.flush()
    }
}

func (idx *IncrementalIndex) flush() {
    idx.index.AddBatch(idx.buffer)
    idx.buffer = idx.buffer[:0]
    
    // 定期重建索引以優化質量
    if idx.index.Size() >= idx.rebuildSize {
        idx.index.Rebuild()
    }
}
```

---

## 資源與工具

### 開源專案

- **Faiss**：Facebook 的向量搜尋庫，C++ 實現
- **Annoy**：Spotify 的 ANN 庫，適合靜態數據
- **hnswlib**：HNSW 的高效實現
- **ScaNN**：Google 的向量搜尋庫

### 基準測試

- **ANN Benchmarks**：http://ann-benchmarks.com/
  - 對比各種 ANN 算法的效能
  - 準確率 vs 查詢時間圖表

### 線上工具

- **OpenAI Tokenizer**：測試 Embedding API
- **Pinecone Index Simulator**：估算索引大小和成本
- **Vector Visualization**：視覺化高維向量（降維到 2D/3D）

---

## 總結

向量資料庫是 AI 應用的核心基礎設施，掌握以下要點：

1. **理解原理**：Embedding、相似度、ANN 算法
2. **選擇索引**：HNSW（通用）、IVF（大規模）、PQ（記憶體受限）
3. **產品選型**：根據規模、預算、團隊能力選擇
4. **效能優化**：索引參數、查詢優化、記憶體管理
5. **實踐應用**：RAG、語義搜尋、推薦系統

向量資料庫技術仍在快速發展，保持學習和實踐是關鍵。

---

> **下一步**：學習完向量資料庫後，建議繼續學習 [AI 系統設計案例](../AI_System_Design_Cases/)，將理論應用到實際系統設計中。
