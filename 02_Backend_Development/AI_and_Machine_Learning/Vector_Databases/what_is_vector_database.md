# 什麼是向量資料庫

- **難度**: 5
- **標籤**: `向量資料庫`, `語義搜尋`, `AI基礎設施`, `向量嵌入`

## 問題詳述

向量資料庫（Vector Database）是專門為存儲和檢索高維向量資料而設計的資料庫系統。隨著 AI 和機器學習的普及，特別是 LLM 和語義搜尋的興起，向量資料庫已成為現代後端架構的關鍵組件。本文將深入解釋向量資料庫的原理、應用場景和選型考慮。

## 核心理論與詳解

### 什麼是向量資料庫

**向量資料庫（Vector Database）** 是一種專門用於存儲、索引和查詢高維向量的資料庫系統。它的核心功能是 **相似度搜尋（Similarity Search）**，即找出與查詢向量最相似的向量。

**核心概念**：

1. **向量（Vector）**：一個數字陣列，代表某個物件的特徵
   ```
   向量範例：[0.2, 0.8, 0.3, ..., 0.5]  // 通常有幾百到幾千個維度
   ```

2. **嵌入（Embedding）**：將物件（文本、圖片、音頻）轉換為向量的過程
   ```
   文本 "Hello World" → [0.1, 0.3, 0.5, ..., 0.2]
   ```

3. **相似度（Similarity）**：兩個向量之間的接近程度
   ```
   相似度（V1, V2）= 0.95  // 值越高越相似
   ```

### 為什麼需要向量資料庫

#### 1. 傳統資料庫的局限

**傳統關鍵字搜尋**：
```sql
SELECT * FROM documents WHERE content LIKE '%database%';
```

**問題**：
- 只能匹配精確關鍵字
- 無法理解語義（"DB" vs "database"）
- 無法處理同義詞或相關概念

**語義搜尋（使用向量資料庫）**：
```
查詢："高效能資料儲存系統"
↓
結果：
1. "Redis 是一個內存資料庫..." (相似度: 0.92)
2. "PostgreSQL 提供可靠的資料存儲..." (相似度: 0.88)
3. "MongoDB 是 NoSQL 資料庫..." (相似度: 0.85)
```

即使文檔中沒有「高效能」、「資料儲存」這些詞，但語義相關的文檔仍能被檢索到。

#### 2. AI 應用的需求

隨著 LLM 和 Embedding 模型的普及，越來越多應用需要：

- **語義搜尋**：理解查詢意圖，不僅僅是關鍵字匹配
- **RAG 系統**：檢索相關文檔增強 LLM 回應
- **推薦系統**：找出相似的商品、內容、用戶
- **異常檢測**：發現與正常模式不相似的資料
- **圖片/音頻搜尋**：跨模態搜尋（以文搜圖、以圖搜圖）

### 向量資料庫的核心功能

#### 1. 向量存儲

存儲高維向量和相關元數據。

**資料結構**：
```go
type VectorDocument struct {
    ID        string              // 文檔唯一標識
    Vector    []float32           // 向量（通常 384-3072 維）
    Metadata  map[string]interface{} // 元數據
    CreatedAt time.Time
}

// 範例
doc := VectorDocument{
    ID:     "doc_001",
    Vector: []float32{0.1, 0.3, 0.5, ..., 0.2}, // 1536 維
    Metadata: map[string]interface{}{
        "title":    "Redis 介紹",
        "category": "資料庫",
        "author":   "John Doe",
        "content":  "Redis 是一個內存資料庫...",
    },
}
```

#### 2. 向量索引

建立高效的索引結構，加速相似度搜尋。

**挑戰**：
- 向量維度高（通常 384-3072 維）
- 暴力搜尋複雜度為 O(n×d)，n 是文檔數，d 是維度
- 百萬級向量的暴力搜尋不可行

**解決方案**：使用近似最近鄰搜尋（ANN, Approximate Nearest Neighbor）

**常用索引算法**：

| 算法 | 原理 | 優點 | 缺點 | 適用場景 |
|------|------|------|------|---------|
| **HNSW** | 分層圖結構 | 查詢速度快、精確度高 | 內存佔用高 | 中小規模、高精度需求 |
| **IVF** | 聚類分區 | 內存效率高 | 構建慢、精度稍低 | 大規模、資源受限 |
| **PQ** | 向量量化壓縮 | 極低內存佔用 | 精度降低明顯 | 超大規模、內存緊張 |
| **LSH** | 局部敏感哈希 | 構建快 | 精度較低 | 需快速建索引 |

#### 3. 相似度搜尋

找出與查詢向量最相似的 K 個向量。

**相似度度量方式**：

**a. 餘弦相似度（Cosine Similarity）** - 最常用

```
similarity = (A · B) / (||A|| × ||B||)
```

範圍：[-1, 1]，1 表示完全相同方向

**特點**：
- 只考慮方向，不考慮大小
- 適合文本 Embedding（因為 Embedding 通常已歸一化）

**b. 歐幾里得距離（Euclidean Distance）**

```
distance = √(Σ(Ai - Bi)²)
```

範圍：[0, ∞]，0 表示完全相同

**特點**：
- 考慮向量的實際距離
- 適合圖片 Embedding

**c. 點積（Dot Product）**

```
similarity = A · B = Σ(Ai × Bi)
```

範圍：(-∞, ∞)

**特點**：
- 同時考慮方向和大小
- 計算最快

**查詢範例**：
```go
// 查詢最相似的 5 個文檔
query := "什麼是向量資料庫？"
queryVector := GetEmbedding(query)

results := vectorDB.Search(SearchRequest{
    Vector:     queryVector,
    TopK:       5,                    // 返回 Top 5
    Threshold:  0.7,                  // 相似度 > 0.7
    Filter: map[string]interface{}{   // 元數據過濾
        "category": "資料庫",
    },
})

for _, result := range results {
    fmt.Printf("ID: %s, 相似度: %.2f, 標題: %s\n",
        result.ID, result.Score, result.Metadata["title"])
}
```

#### 4. 元數據過濾

在向量搜尋前或後，根據元數據進行過濾。

**預過濾（Pre-filtering）**：
```
先過濾元數據 → 再進行向量搜尋
```

**優點**：搜尋範圍小，速度快
**缺點**：可能導致結果不足 K 個

**後過濾（Post-filtering）**：
```
先進行向量搜尋 → 再過濾元數據
```

**優點**：保證返回 K 個結果
**缺點**：浪費計算資源

**混合過濾**：
```
粗粒度預過濾 → 向量搜尋 → 精細化後過濾
```

**範例**：
```go
// 只搜尋特定類別和時間範圍的文檔
results := vectorDB.Search(SearchRequest{
    Vector: queryVector,
    TopK:   10,
    Filter: map[string]interface{}{
        "category": []string{"技術", "教程"},
        "created_at": map[string]interface{}{
            "$gte": "2024-01-01",
        },
        "author": map[string]interface{}{
            "$in": []string{"John", "Jane"},
        },
    },
})
```

### 向量資料庫 vs 傳統資料庫

| 特性 | 向量資料庫 | 傳統資料庫 |
|------|-----------|-----------|
| **查詢類型** | 相似度搜尋 | 精確匹配、範圍查詢 |
| **索引** | HNSW、IVF 等向量索引 | B-Tree、Hash 等 |
| **查詢複雜度** | O(log n)（ANN） | O(log n)（索引） |
| **精確度** | 近似結果（可調節） | 精確結果 |
| **典型維度** | 384-3072 維 | 幾個到幾十個欄位 |
| **適用場景** | 語義搜尋、推薦、相似性 | 事務處理、關係查詢 |
| **資料類型** | 向量 + 元數據 | 結構化資料 |

### 主流向量資料庫對比

#### 1. 託管服務（Managed）

**Pinecone**
- **優勢**：全託管、易用、可擴展、穩定
- **劣勢**：成本較高、供應商鎖定
- **定價**：按索引大小和查詢次數計費
- **適用**：快速開發、不想管理基礎設施

**Weaviate Cloud**
- **優勢**：GraphQL API、混合搜尋、內建 ML 模型
- **劣勢**：學習曲線稍陡
- **特色**：支援多模態（文本、圖片）
- **適用**：需要複雜查詢、多模態搜尋

#### 2. 自建方案（Self-hosted）

**Milvus**
- **優勢**：高效能、可擴展、雲原生
- **劣勢**：運維複雜、學習成本高
- **特色**：支援 GPU 加速、多種索引
- **適用**：大規模部署、效能要求極高

**Qdrant**
- **優勢**：Rust 編寫、高效能、功能豐富
- **劣勢**：社群較小
- **特色**：優秀的過濾能力、payload 索引
- **適用**：效能要求高、複雜過濾需求

**Chroma**
- **優勢**：輕量、易用、Python 友好
- **劣勢**：功能相對簡單、擴展性有限
- **特色**：嵌入式模式、開發友好
- **適用**：原型開發、小型項目

#### 3. 資料庫擴展

**pgvector (PostgreSQL)**
- **優勢**：
  - 整合到現有 PostgreSQL
  - SQL 查詢、事務支援
  - 無需學習新工具
- **劣勢**：
  - 效能不如專業向量資料庫
  - 索引選項有限（HNSW、IVF）
- **適用**：已有 PostgreSQL、中小規模、需要 SQL 功能

**Redis Stack**
- **優勢**：極快速度、Redis 生態
- **劣勢**：內存佔用高、持久化需額外配置
- **適用**：需要極低延遲、已使用 Redis

### 向量資料庫的應用場景

#### 1. 語義搜尋

**傳統搜尋**：
```
查詢：「fast database」
結果：只返回包含 "fast" 和 "database" 的文檔
```

**語義搜尋**：
```
查詢：「fast database」
結果：
- "Redis is an in-memory database..." (相似度: 0.95)
- "High-performance data store..." (相似度: 0.92)
- "Quick query execution..." (相似度: 0.88)
```

#### 2. RAG（檢索增強生成）

```
用戶問題：「如何優化 PostgreSQL 查詢？」
↓
1. 查詢向量化
2. 向量資料庫檢索相關文檔
3. 將文檔加入 LLM Prompt
4. LLM 生成基於實際資料的回應
```

#### 3. 推薦系統

**基於內容的推薦**：
```
用戶瀏覽了「Redis 教程」→ 向量化
↓
向量資料庫檢索相似內容
↓
推薦：「Memcached vs Redis」、「快取策略」等
```

**協同過濾**：
```
將用戶行為向量化 → 找出相似用戶 → 推薦相似用戶喜歡的內容
```

#### 4. 異常檢測

```
正常交易的向量聚集在某個區域
↓
新交易向量化
↓
如果與正常交易相似度低 → 標記為可疑
```

#### 5. 重複檢測

```
新文檔 → 向量化 → 檢索高相似度文檔
↓
如果相似度 > 0.95 → 可能是重複內容
```

#### 6. 圖片搜尋

```
以文搜圖：
文本「紅色汽車」→ CLIP 模型 → 文本向量
↓
向量資料庫檢索相似圖片向量
↓
返回紅色汽車的圖片

以圖搜圖：
上傳圖片 → 向量化 → 檢索相似圖片
```

### 向量資料庫的性能考量

#### 1. 索引構建時間

| 資料規模 | HNSW | IVF | PQ |
|---------|------|-----|-----|
| 10萬 | 幾秒 | 幾秒 | 幾秒 |
| 100萬 | 幾分鐘 | 幾分鐘 | 幾分鐘 |
| 1000萬 | 幾十分鐘 | 幾分鐘 | 幾分鐘 |
| 1億+ | 幾小時 | 幾十分鐘 | 幾十分鐘 |

#### 2. 查詢延遲

| 資料規模 | HNSW | IVF | 暴力搜尋 |
|---------|------|-----|---------|
| 10萬 | <1ms | <5ms | ~50ms |
| 100萬 | <5ms | <10ms | ~500ms |
| 1000萬 | <10ms | <20ms | ~5s |
| 1億 | <20ms | <50ms | ~50s |

#### 3. 內存佔用

**公式**：
```
內存 ≈ 向量數 × 維度 × 4 bytes（float32）× 索引開銷係數
```

**範例**（100 萬個 1536 維向量）：
```
基礎：1,000,000 × 1536 × 4 bytes = 6.14 GB

加上 HNSW 索引（開銷 1.5-2x）：
總計：9-12 GB
```

#### 4. 精確度 vs 速度

```
精確度（Recall）↑ = 速度↓ = 資源消耗↑
```

**參數調節**：
- **HNSW**: `ef_search` 參數（越大越精確，越慢）
- **IVF**: `nprobe` 參數（搜尋的聚類數量）

**典型設置**：
- **低延遲場景**：Recall 90-95%，查詢 <10ms
- **高精度場景**：Recall 98-99%，查詢 20-50ms

### 向量資料庫的實施策略

#### 1. 選型決策

**考慮因素**：

| 因素 | 考量點 | 建議 |
|------|-------|------|
| **規模** | 向量數量、增長速度 | <100萬：pgvector；>1000萬：Milvus/Qdrant |
| **效能** | 查詢延遲、吞吐量 | 高效能需求：Qdrant/Milvus；一般需求：pgvector |
| **成本** | 開發成本、運維成本 | 快速開發：Pinecone；長期使用：自建 |
| **整合** | 現有技術棧 | 有 PostgreSQL：pgvector；有 Redis：Redis Stack |
| **功能** | 過濾、多租戶、備份 | 複雜需求：Weaviate/Qdrant |

#### 2. 資料遷移

**步驟**：
```
1. 準備階段
   - 選擇 Embedding 模型
   - 設計 Metadata 結構
   - 估算資源需求

2. 索引階段
   - 批次處理文檔
   - 生成 Embedding
   - 寫入向量資料庫

3. 驗證階段
   - 檢查資料完整性
   - 測試查詢效能
   - 調整索引參數

4. 切換階段
   - 灰度發佈
   - 監控指標
   - 逐步遷移流量
```

#### 3. 監控與優化

**關鍵指標**：
- **查詢延遲**：P50、P95、P99
- **查詢 QPS**：每秒查詢數
- **索引大小**：內存/磁碟使用
- **精確度**：Recall@K
- **錯誤率**：失敗查詢比例

**優化方向**：
- 調整索引參數
- 使用快取
- 批次查詢
- 增加副本（水平擴展）

## 程式碼範例

以下是使用 Go 與向量資料庫交互的範例（以 Qdrant 為例）：

```go
package main

import (
	"context"
	"fmt"
	"log"
)

// Vector 表示一個向量
type Vector []float32

// SearchRequest 搜尋請求
type SearchRequest struct {
	Vector    Vector
	TopK      int
	Threshold float32
	Filter    map[string]interface{}
}

// SearchResult 搜尋結果
type SearchResult struct {
	ID       string
	Score    float32
	Metadata map[string]interface{}
}

// VectorDB 向量資料庫接口
type VectorDB interface {
	Insert(ctx context.Context, id string, vector Vector, metadata map[string]interface{}) error
	Search(ctx context.Context, req SearchRequest) ([]SearchResult, error)
	Delete(ctx context.Context, id string) error
}

// 使用範例
func main() {
	ctx := context.Background()
	
	// 假設已初始化向量資料庫客戶端
	var db VectorDB
	
	// 1. 插入文檔向量
	docVector := Vector{0.1, 0.3, 0.5, 0.2} // 實際應有更多維度
	metadata := map[string]interface{}{
		"title":    "向量資料庫介紹",
		"category": "技術",
		"author":   "John Doe",
		"content":  "向量資料庫是...",
	}
	
	err := db.Insert(ctx, "doc_001", docVector, metadata)
	if err != nil {
		log.Fatalf("Insert failed: %v", err)
	}
	fmt.Println("文檔已索引")
	
	// 2. 相似度搜尋
	queryVector := Vector{0.2, 0.4, 0.6, 0.3}
	
	results, err := db.Search(ctx, SearchRequest{
		Vector:    queryVector,
		TopK:      5,
		Threshold: 0.7,
		Filter: map[string]interface{}{
			"category": "技術",
		},
	})
	
	if err != nil {
		log.Fatalf("Search failed: %v", err)
	}
	
	fmt.Println("\n搜尋結果：")
	for i, result := range results {
		fmt.Printf("%d. ID: %s\n", i+1, result.ID)
		fmt.Printf("   相似度: %.2f\n", result.Score)
		fmt.Printf("   標題: %s\n", result.Metadata["title"])
		fmt.Printf("   作者: %s\n", result.Metadata["author"])
		fmt.Println()
	}
	
	// 3. 批次插入（提升效能）
	type Document struct {
		ID       string
		Vector   Vector
		Metadata map[string]interface{}
	}
	
	docs := []Document{
		{ID: "doc_002", Vector: Vector{0.3, 0.2, 0.1, 0.4}, Metadata: map[string]interface{}{"title": "文檔 2"}},
		{ID: "doc_003", Vector: Vector{0.5, 0.1, 0.3, 0.2}, Metadata: map[string]interface{}{"title": "文檔 3"}},
	}
	
	for _, doc := range docs {
		if err := db.Insert(ctx, doc.ID, doc.Vector, doc.Metadata); err != nil {
			log.Printf("Insert %s failed: %v", doc.ID, err)
		}
	}
	
	fmt.Println("批次索引完成")
}
```

**關鍵要點**：
- 向量通常是 float32 陣列，維度取決於 Embedding 模型
- 元數據用於過濾和展示額外資訊
- Top-K 和相似度閾值控制結果數量和質量
- 批次操作提升效能

## 常見面試問題

### 1. 什麼是向量資料庫？它與傳統資料庫有何不同？

**答案要點**：
- 定義：專門存儲和檢索高維向量的資料庫，核心功能是相似度搜尋
- 差異：傳統資料庫精確查詢，向量資料庫語義搜尋；索引結構不同（HNSW vs B-Tree）
- 應用：語義搜尋、RAG、推薦系統、異常檢測

### 2. 向量資料庫的索引算法有哪些？各有什麼特點？

**答案要點**：
- **HNSW**：分層圖，查詢快、精確度高、內存佔用大
- **IVF**：聚類分區，內存效率高、構建慢
- **PQ**：向量量化，極低內存、精度降低
- Trade-off：精確度 vs 速度 vs 內存

### 3. 如何選擇向量資料庫？

**答案要點**：
- **規模**：小規模（pgvector）、大規模（Milvus/Qdrant）
- **成本**：快速開發（Pinecone 託管）、長期（自建）
- **整合**：現有技術棧（PostgreSQL → pgvector）
- **效能**：延遲要求、吞吐量需求
- **功能**：過濾、多租戶、備份需求

### 4. 餘弦相似度和歐幾里得距離有什麼區別？何時使用？

**答案要點**：
- **餘弦相似度**：只考慮方向，範圍 [-1, 1]，適合文本 Embedding
- **歐幾里得距離**：考慮實際距離，範圍 [0, ∞]，適合圖片 Embedding
- **選擇依據**：取決於 Embedding 模型的特性和應用場景

### 5. 向量資料庫如何處理大規模資料？

**答案要點**：
- **索引優化**：使用 HNSW、IVF 等高效索引
- **分片（Sharding）**：水平分割資料
- **副本（Replication）**：提升查詢吞吐量
- **快取**：常見查詢結果快取
- **批次處理**：批量插入和查詢
- **硬體優化**：使用 SSD、GPU 加速

## 總結

向量資料庫是 AI 時代的關鍵基礎設施：

1. **核心價值**：將語義理解帶入資料檢索，實現「理解式搜尋」
2. **關鍵技術**：向量嵌入、近似最近鄰搜尋、高效索引
3. **選型考慮**：規模、效能、成本、整合難度
4. **應用廣泛**：RAG、語義搜尋、推薦、異常檢測、多模態搜尋

掌握向量資料庫是構建現代 AI 應用的必備技能，也是 2024-2025 年面試的高頻考點。

## 延伸閱讀

- [Pinecone Learning Center](https://www.pinecone.io/learn/)
- [Weaviate Documentation](https://weaviate.io/developers/weaviate)
- [Milvus Documentation](https://milvus.io/docs)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [Awesome Vector Search](https://github.com/currentslab/awesome-vector-search)
