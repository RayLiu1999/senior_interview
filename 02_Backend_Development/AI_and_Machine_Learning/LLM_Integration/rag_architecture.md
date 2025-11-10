# RAG 架構設計與實現

- **難度**: 7
- **標籤**: `RAG`, `架構設計`, `向量搜尋`, `檢索增強生成`

## 問題詳述

RAG（Retrieval-Augmented Generation，檢索增強生成）是當前最重要的 LLM 應用架構之一。它通過結合外部知識檢索和 LLM 生成能力，解決了 LLM 的知識截止、幻覺、專有知識等問題。作為後端工程師，理解 RAG 的原理、架構設計和實現細節是構建智能應用的核心能力。

## 核心理論與詳解

### 什麼是 RAG

**RAG（Retrieval-Augmented Generation）** 是一種將資訊檢索與文本生成結合的架構模式。其核心思想是：

1. **檢索（Retrieval）**：從知識庫中檢索與查詢相關的文檔片段
2. **增強（Augmentation）**：將檢索到的資訊加入 Prompt
3. **生成（Generation）**：LLM 基於增強後的 Prompt 生成回應

**簡單類比**：
- **傳統 LLM**：開卷考試，只能依賴記憶（訓練數據）
- **RAG**：開卷考試，可以查閱教科書（知識庫）再回答

### 為什麼需要 RAG

#### 1. 解決知識截止問題

LLM 的知識僅限於訓練數據的時間範圍，無法回答最新資訊。

**範例**：
```
問題：2024 年奧運會金牌榜前三名是哪些國家？
LLM（無 RAG）：抱歉，我的知識截止於 2023 年 10 月...
LLM（with RAG）：根據最新資料，2024 年奧運會金牌榜前三名是...
```

#### 2. 減少幻覺（Hallucination）

LLM 有時會生成看似合理但實際錯誤的內容。RAG 通過引用真實資料源來降低幻覺。

**範例**：
```
問題：你們公司的退貨政策是什麼？
LLM（無 RAG）：[可能編造政策]
LLM（with RAG）：根據公司政策文檔，退貨需在 30 天內...
```

#### 3. 處理專有知識

每個組織都有大量專有文檔、內部資料，這些不在 LLM 的訓練數據中。

**應用場景**：
- 企業內部知識庫問答
- 產品文檔助手
- 法律合規查詢
- 技術支援系統

#### 4. 可追溯性與可信度

RAG 可以提供資料來源，讓用戶驗證回應的準確性。

### RAG 的核心架構

```
┌──────────────────────────────────────────────────┐
│                    RAG Pipeline                   │
└──────────────────────────────────────────────────┘

┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   用戶查詢   │────>│  查詢向量化   │────>│ 向量相似搜尋 │
└─────────────┘     └──────────────┘     └─────────────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │ 向量資料庫  │
                                         │  (Knowledge │
                                         │    Base)    │
                                         └─────────────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │ 檢索Top-K    │
                                         │  相關文檔    │
                                         └─────────────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │  構建Prompt  │
                                         │  (查詢+文檔) │
                                         └─────────────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │   LLM生成   │
                                         │    回應      │
                                         └─────────────┘
```

### RAG 的關鍵組件

#### 1. 文檔處理（Document Processing）

將原始文檔轉換為可檢索的格式。

**步驟**：

**a. 文檔載入**
```go
// 支援多種格式
supportedFormats := []string{".pdf", ".docx", ".md", ".txt", ".html"}
```

**b. 文檔分塊（Chunking）**

將長文檔切分為小片段，每個片段稱為一個 **Chunk**。

**分塊策略**：

| 策略 | 說明 | 優點 | 缺點 |
|------|------|------|------|
| **固定大小** | 每 N 個字元一塊 | 簡單、可預測 | 可能切斷語義 |
| **句子邊界** | 按句號分割 | 保持語義完整 | 塊大小不一 |
| **段落邊界** | 按段落分割 | 語義最完整 | 某些塊可能過大 |
| **滑動窗口** | 重疊的固定大小塊 | 避免邊界問題 | 存儲冗餘 |
| **語義分塊** | 基於內容相似度 | 語義最優 | 計算複雜 |

**典型參數**：
- **Chunk Size**：512-1024 tokens（約 400-800 英文字）
- **Overlap**：50-100 tokens（避免關鍵資訊被切斷）

**範例**：
```
原文檔（1000 words）
↓
分塊（Chunk Size: 200 words, Overlap: 50 words）
↓
Chunk 1: words 1-200
Chunk 2: words 151-350
Chunk 3: words 301-500
...
```

**c. 元數據提取**

為每個 Chunk 添加元數據，方便過濾和排序。

```go
type DocumentChunk struct {
    ID          string
    Content     string
    Embedding   []float32
    Metadata    map[string]interface{} // 元數據
}

// 元數據範例
metadata := map[string]interface{}{
    "source":      "product_manual.pdf",
    "page":        15,
    "section":     "Installation",
    "author":      "Engineering Team",
    "created_at":  "2024-01-01",
    "category":    "Documentation",
}
```

#### 2. 向量嵌入（Vector Embedding）

將文本轉換為高維向量，捕捉語義資訊。

**Embedding 模型選擇**：

| 模型 | 維度 | 語言 | 特點 |
|------|------|------|------|
| **OpenAI text-embedding-3-small** | 1536 | 多語言 | 成本低、速度快 |
| **OpenAI text-embedding-3-large** | 3072 | 多語言 | 質量最高、成本高 |
| **sentence-transformers (all-MiniLM-L6-v2)** | 384 | 英文 | 開源、輕量 |
| **BGE (BAAI)** | 768 | 中英 | 中文表現好 |
| **multilingual-e5** | 768 | 多語言 | 跨語言檢索 |

**Embedding 流程**：
```go
// 生成文檔嵌入
chunks := SplitDocument(document, chunkSize=500)
for _, chunk := range chunks {
    embedding := GetEmbedding(chunk.Content) // 調用 Embedding API
    chunk.Embedding = embedding
    SaveToVectorDB(chunk)
}
```

#### 3. 向量資料庫（Vector Database）

存儲和檢索向量嵌入。

**主流選擇**：

| 資料庫 | 類型 | 特點 | 適用場景 |
|--------|------|------|---------|
| **Pinecone** | 託管 | 易用、可擴展 | 快速開發、雲原生 |
| **Weaviate** | 自建/託管 | GraphQL、混合搜尋 | 複雜查詢需求 |
| **Milvus** | 自建 | 高效能、可擴展 | 大規模部署 |
| **Qdrant** | 自建/託管 | Rust 編寫、高效能 | 效能要求高 |
| **pgvector** | PostgreSQL 擴展 | SQL 整合 | 已有 PostgreSQL |
| **Chroma** | 嵌入式 | 輕量、易用 | 原型開發 |

#### 4. 檢索策略（Retrieval Strategy）

從向量資料庫中檢索最相關的文檔。

**相似度計算**：

最常用的是 **餘弦相似度（Cosine Similarity）**：

```
similarity = (A · B) / (||A|| × ||B||)
```

範圍：[-1, 1]，越接近 1 越相似。

**檢索參數**：

- **Top-K**：返回最相似的 K 個文檔（通常 K=3-10）
- **相似度閾值**：過濾低相似度結果（如 > 0.7）
- **元數據過濾**：根據元數據預過濾（如只檢索特定類別）

**進階檢索策略**：

**a. 混合搜尋（Hybrid Search）**

結合向量搜尋和關鍵字搜尋：

```
最終分數 = α × 向量相似度 + (1-α) × BM25 分數
```

**b. 重排序（Reranking）**

用更強的模型對初步檢索結果重新排序：

```
初步檢索（向量搜尋）→ Top-50 結果
↓
重排序模型（Cross-Encoder）→ Top-10 精確結果
```

**c. 多查詢檢索（Multi-Query Retrieval）**

生成多個相關查詢，擴大檢索覆蓋：

```
原查詢：「如何重置密碼？」
↓
擴展查詢：
- 「重置密碼的步驟」
- 「忘記密碼怎麼辦」
- 「修改帳號密碼」
↓
分別檢索，合併去重
```

#### 5. Prompt 構建（Prompt Construction）

將檢索到的文檔與用戶查詢組合成 Prompt。

**基本模板**：

```
你是一位知識助手。請根據以下參考資料回答問題。

參考資料：
---
{document_1}
---
{document_2}
---
{document_3}
---

問題：{user_query}

要求：
1. 僅基於提供的參考資料回答
2. 如果參考資料中沒有相關資訊，請明確告知
3. 引用資料來源（如「根據文檔 1...」）
```

**進階技巧**：

**a. 包含元數據**
```
參考資料 1（來源：產品手冊 p.15，更新時間：2024-01-01）：
{content}
```

**b. 相關性標註**
```
參考資料 1（相關度：95%）：
{content}
```

**c. 多輪對話支援**
```
對話歷史：
用戶：如何安裝？
助手：安裝步驟如下...
用戶：安裝後如何配置？

當前參考資料：
{documents}

當前問題：{current_query}
```

#### 6. 生成與後處理（Generation & Post-processing）

**生成**：
```go
prompt := ConstructPrompt(query, retrievedDocs)
response, _ := CallLLM(prompt, temperature=0.3) // 較低的 temperature 減少創造性
```

**後處理**：
- **提取引用**：解析回應中的資料來源引用
- **格式化**：轉換為 Markdown、JSON 等格式
- **驗證**：檢查回應是否符合預期格式
- **添加元數據**：包含檢索到的文檔 ID、相似度等

### RAG 的變體與優化

#### 1. Naive RAG（基礎 RAG）

最簡單的實現：

```
查詢 → 向量化 → 檢索 Top-K → 構建 Prompt → 生成
```

**優點**：簡單、易實現
**缺點**：檢索質量依賴單次查詢、無法處理複雜問題

#### 2. Advanced RAG（進階 RAG）

引入查詢優化和檢索優化：

**查詢轉換**：
- **Query Rewriting**：改寫查詢以提升檢索效果
  ```
  原查詢：「它怎麼用？」
  改寫：「[產品名稱] 的使用方法是什麼？」
  ```

- **HyDE（Hypothetical Document Embeddings）**：
  ```
  步驟 1：讓 LLM 生成「假設的理想答案」
  步驟 2：用假設答案的嵌入進行檢索
  原理：答案與答案的相似度通常高於問題與答案
  ```

**檢索增強**：
- **Parent Document Retrieval**：用小塊檢索，返回大塊上下文
- **Sentence Window Retrieval**：檢索句子，返回周圍段落

#### 3. Modular RAG（模組化 RAG）

靈活組合不同模組：

```
┌──────────────────────────────────┐
│      Query Enhancement Module     │
│  (Query Expansion, Rewriting)     │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│       Retrieval Module            │
│  (Vector, Keyword, Hybrid)        │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│       Reranking Module            │
│  (Cross-Encoder, LLM-based)       │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│       Generation Module           │
│  (LLM with Context)               │
└──────────────────────────────────┘
```

#### 4. Agentic RAG（智能體 RAG）

讓 LLM 自主決定何時檢索、檢索什麼：

```go
type Agent struct {
    LLM          LLMClient
    VectorDB     VectorDBClient
    Tools        map[string]Tool
}

func (a *Agent) Answer(query string) string {
    // 讓 LLM 決定下一步行動
    action := a.LLM.DecideAction(query)
    
    switch action.Type {
    case "retrieve":
        docs := a.VectorDB.Search(action.Query)
        return a.Answer(query + "\n參考資料：" + docs)
    
    case "answer":
        return action.Response
    
    case "use_tool":
        result := a.Tools[action.Tool].Execute(action.Params)
        return a.Answer(query + "\n工具結果：" + result)
    }
    
    return ""
}
```

### RAG 系統的效能優化

#### 1. 檢索效能優化

**快取策略**：
```go
// 查詢快取
type QueryCache struct {
    cache map[string][]Document
    ttl   time.Duration
}

func (qc *QueryCache) Get(query string) ([]Document, bool) {
    // 使用查詢向量的哈希作為鍵
    key := HashVector(GetEmbedding(query))
    docs, exists := qc.cache[key]
    return docs, exists
}
```

**索引優化**：
- 使用 HNSW、IVF 等高效索引
- 根據數據規模選擇合適的索引參數
- 定期更新和優化索引

**批次檢索**：
```go
// 批量處理多個查詢
queries := []string{"query1", "query2", "query3"}
embeddings := BatchGetEmbeddings(queries)
results := vectorDB.BatchSearch(embeddings)
```

#### 2. 成本優化

**Embedding 快取**：
```go
// 對相同文本不重複生成 Embedding
type EmbeddingCache struct {
    cache map[string][]float32
}

func (ec *EmbeddingCache) GetOrCompute(text string) []float32 {
    if emb, exists := ec.cache[text]; exists {
        return emb
    }
    
    emb := CallEmbeddingAPI(text)
    ec.cache[text] = emb
    return emb
}
```

**選擇性檢索**：
```go
// 根據查詢複雜度決定是否需要檢索
func ShouldRetrieve(query string) bool {
    // 簡單問候語不需要檢索
    greetings := []string{"你好", "嗨", "hello"}
    for _, g := range greetings {
        if strings.Contains(strings.ToLower(query), g) {
            return false
        }
    }
    return true
}
```

**模型選型**：
- 簡單查詢使用小模型（如 GPT-3.5）
- 複雜推理使用大模型（如 GPT-4）

#### 3. 質量優化

**檢索評估**：

使用指標評估檢索質量：

- **Recall@K**：前 K 個結果中相關文檔的比例
- **MRR（Mean Reciprocal Rank）**：第一個相關結果的倒數排名
- **NDCG（Normalized Discounted Cumulative Gain）**：考慮排序的質量指標

**A/B 測試**：
```go
// 對比不同的檢索策略
strategies := []string{"vector_only", "hybrid", "rerank"}
for _, strategy := range strategies {
    results := Retrieve(query, strategy)
    metrics := Evaluate(results, groundTruth)
    LogMetrics(strategy, metrics)
}
```

**用戶回饋循環**：
```go
// 收集用戶回饋改進系統
type Feedback struct {
    QueryID   string
    Helpful   bool
    Comment   string
}

func ProcessFeedback(fb Feedback) {
    if !fb.Helpful {
        // 分析失敗案例
        AnalyzeFailure(fb.QueryID)
        // 調整檢索策略或添加新文檔
    }
}
```

### RAG 的挑戰與解決方案

#### 1. 檢索質量問題

**挑戰**：檢索到不相關或低質量的文檔。

**解決方案**：
- 使用更好的 Embedding 模型
- 採用混合搜尋（向量 + 關鍵字）
- 引入重排序機制
- 優化文檔分塊策略

#### 2. 上下文窗口限制

**挑戰**：檢索到的文檔太多，超過 LLM 的上下文窗口。

**解決方案**：
- 限制 Top-K 數量（通常 3-5 個就夠）
- 對檢索結果進行摘要
- 使用支援長上下文的模型（如 Claude 200K）
- 採用 Map-Reduce 策略：分別處理每個文檔，再匯總

#### 3. 知識更新

**挑戰**：文檔更新後，需要重新索引。

**解決方案**：
- 增量更新機制
- 文檔版本管理
- 定期重建索引（如每晚）
- 即時索引（文檔上傳後立即索引）

#### 4. 多跳推理

**挑戰**：需要從多個文檔中綜合資訊。

**解決方案**：
- 使用 Agentic RAG，讓 LLM 多次檢索
- 採用 Graph RAG，建立文檔間的關聯
- 使用更強的推理模型（如 GPT-4）

## 程式碼範例

以下是一個簡化的 RAG 系統實現：

```go
package main

import (
	"context"
	"fmt"
)

// Document 表示一個文檔片段
type Document struct {
	ID        string
	Content   string
	Embedding []float32
	Metadata  map[string]interface{}
}

// RAGSystem 表示一個 RAG 系統
type RAGSystem struct {
	embeddingClient EmbeddingClient
	vectorDB        VectorDB
	llmClient       LLMClient
}

// EmbeddingClient 生成文本嵌入
type EmbeddingClient interface {
	GetEmbedding(ctx context.Context, text string) ([]float32, error)
}

// VectorDB 向量資料庫接口
type VectorDB interface {
	Store(ctx context.Context, doc Document) error
	Search(ctx context.Context, embedding []float32, topK int) ([]Document, error)
}

// LLMClient LLM 客戶端接口
type LLMClient interface {
	Generate(ctx context.Context, prompt string) (string, error)
}

// NewRAGSystem 創建 RAG 系統
func NewRAGSystem(embClient EmbeddingClient, vdb VectorDB, llm LLMClient) *RAGSystem {
	return &RAGSystem{
		embeddingClient: embClient,
		vectorDB:        vdb,
		llmClient:       llm,
	}
}

// IndexDocument 索引文檔
func (r *RAGSystem) IndexDocument(ctx context.Context, content string, metadata map[string]interface{}) error {
	// 1. 文檔分塊
	chunks := r.chunkDocument(content, 500)
	
	// 2. 為每個 chunk 生成嵌入並存儲
	for i, chunk := range chunks {
		embedding, err := r.embeddingClient.GetEmbedding(ctx, chunk)
		if err != nil {
			return fmt.Errorf("generate embedding: %w", err)
		}
		
		doc := Document{
			ID:        fmt.Sprintf("%s_%d", metadata["doc_id"], i),
			Content:   chunk,
			Embedding: embedding,
			Metadata:  metadata,
		}
		
		if err := r.vectorDB.Store(ctx, doc); err != nil {
			return fmt.Errorf("store document: %w", err)
		}
	}
	
	return nil
}

// Query 執行 RAG 查詢
func (r *RAGSystem) Query(ctx context.Context, query string, topK int) (string, error) {
	// 1. 查詢向量化
	queryEmbedding, err := r.embeddingClient.GetEmbedding(ctx, query)
	if err != nil {
		return "", fmt.Errorf("embed query: %w", err)
	}
	
	// 2. 檢索相關文檔
	docs, err := r.vectorDB.Search(ctx, queryEmbedding, topK)
	if err != nil {
		return "", fmt.Errorf("search documents: %w", err)
	}
	
	// 3. 構建 Prompt
	prompt := r.buildPrompt(query, docs)
	
	// 4. LLM 生成回應
	response, err := r.llmClient.Generate(ctx, prompt)
	if err != nil {
		return "", fmt.Errorf("generate response: %w", err)
	}
	
	return response, nil
}

// chunkDocument 將文檔分塊
func (r *RAGSystem) chunkDocument(content string, chunkSize int) []string {
	// 簡化實現：按字元數分塊
	var chunks []string
	runes := []rune(content)
	
	for i := 0; i < len(runes); i += chunkSize {
		end := i + chunkSize
		if end > len(runes) {
			end = len(runes)
		}
		chunks = append(chunks, string(runes[i:end]))
	}
	
	return chunks
}

// buildPrompt 構建 RAG Prompt
func (r *RAGSystem) buildPrompt(query string, docs []Document) string {
	prompt := "你是一位知識助手。請根據以下參考資料回答問題。\n\n參考資料：\n"
	
	for i, doc := range docs {
		source := ""
		if src, ok := doc.Metadata["source"].(string); ok {
			source = fmt.Sprintf("（來源：%s）", src)
		}
		prompt += fmt.Sprintf("\n--- 文檔 %d %s ---\n%s\n", i+1, source, doc.Content)
	}
	
	prompt += fmt.Sprintf("\n問題：%s\n\n", query)
	prompt += "要求：\n"
	prompt += "1. 僅基於提供的參考資料回答\n"
	prompt += "2. 如果參考資料中沒有相關資訊，請明確告知\n"
	prompt += "3. 引用資料來源（如「根據文檔 1...」）\n"
	
	return prompt
}

func main() {
	// 初始化組件（實際使用時需要實現這些接口）
	var embClient EmbeddingClient
	var vectorDB VectorDB
	var llmClient LLMClient
	
	rag := NewRAGSystem(embClient, vectorDB, llmClient)
	
	ctx := context.Background()
	
	// 索引文檔
	err := rag.IndexDocument(ctx, "Redis 是一個開源的內存數據庫...", map[string]interface{}{
		"doc_id": "redis_intro",
		"source": "Redis 官方文檔",
	})
	if err != nil {
		fmt.Printf("Index error: %v\n", err)
		return
	}
	
	// 查詢
	response, err := rag.Query(ctx, "什麼是 Redis？", 3)
	if err != nil {
		fmt.Printf("Query error: %v\n", err)
		return
	}
	
	fmt.Printf("回應：%s\n", response)
}
```

## 常見面試問題

### 1. 什麼是 RAG？它解決了什麼問題？

**答案要點**：
- 定義：檢索增強生成，結合資訊檢索與 LLM 生成
- 解決：知識截止、幻覺、專有知識、可追溯性
- 核心流程：檢索相關文檔 → 增強 Prompt → 生成回應

### 2. RAG 中的文檔分塊策略有哪些？如何選擇？

**答案要點**：
- 策略：固定大小、句子/段落邊界、滑動窗口、語義分塊
- 選擇考慮：文檔類型、檢索精度、上下文完整性
- 典型參數：Chunk Size 512-1024 tokens，Overlap 50-100 tokens
- Trade-off：小塊檢索精確但上下文不足，大塊相反

### 3. 如何評估 RAG 系統的質量？

**答案要點**：
- **檢索質量**：Recall@K、MRR、NDCG
- **生成質量**：準確性、相關性、流暢性
- **端到端**：用戶滿意度、任務完成率
- **實施**：建立測試集、人工評估、A/B 測試

### 4. RAG 與 Fine-tuning 如何選擇？

**答案要點**：

| 維度 | RAG | Fine-tuning |
|------|-----|-------------|
| 知識更新 | 即時（更新文檔即可） | 需重新訓練 |
| 成本 | 較低（API 調用） | 高（訓練成本） |
| 可解釋性 | 高（可追溯來源） | 低（黑盒） |
| 適用場景 | 知識密集、需即時更新 | 特定風格、行為調整 |

通常結合使用：Fine-tuning 調整風格，RAG 提供知識。

### 5. 如何優化 RAG 系統的成本？

**答案要點**：
- **Embedding 快取**：相同文本不重複生成
- **查詢快取**：相似查詢返回快取結果
- **選擇性檢索**：簡單查詢不檢索
- **批次處理**：批量生成 Embedding
- **模型選型**：根據任務複雜度選擇模型
- **結果快取**：對常見問題快取完整回應

## 總結

RAG 是現代 LLM 應用的核心架構：

1. **核心價值**：將 LLM 的生成能力與外部知識結合
2. **關鍵組件**：文檔處理、向量化、向量資料庫、檢索、生成
3. **優化方向**：檢索質量、成本、延遲、可擴展性
4. **實施要點**：選擇合適的 Embedding 模型和向量資料庫、設計有效的分塊策略、持續評估和優化

掌握 RAG 架構是構建智能應用的必備技能，也是 2024-2025 年後端面試的高頻考點。

## 延伸閱讀

- [LangChain RAG Tutorial](https://python.langchain.com/docs/use_cases/question_answering/)
- [LlamaIndex Documentation](https://docs.llamaindex.ai/)
- [Advanced RAG Techniques](https://github.com/NirDiamant/RAG_Techniques)
- [RAG Survey Paper](https://arxiv.org/abs/2312.10997)
