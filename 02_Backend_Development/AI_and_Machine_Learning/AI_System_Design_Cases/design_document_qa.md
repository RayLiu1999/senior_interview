# 設計文件搜尋與問答系統

- **難度**: 8
- **標籤**: `系統設計`, `RAG`, `文件處理`, `問答系統`

## 問題詳述

設計一個企業級文件搜尋與問答系統，支援用戶上傳各種格式的文件（PDF、Word、Markdown等），並能夠通過自然語言查詢文件內容、獲得精準答案。系統需要處理百萬級文件，支援多租戶、權限控制，並保證查詢的準確性和效能。

## 核心理論與詳解

### 需求澄清

#### 功能需求

1. **文件管理**
   - 支援多種格式：PDF、DOCX、TXT、MD、HTML
   - 批次上傳和處理
   - 文件版本管理
   - 文件分類和標籤

2. **搜尋功能**
   - 自然語言查詢
   - 混合搜尋（關鍵字 + 語義）
   - 過濾（類別、時間、作者）
   - 結果排序和重排序

3. **問答功能**
   - 基於文件內容生成答案
   - 引用來源文檔
   - 多文檔綜合回答
   - 追問和多輪對話

4. **權限控制**
   - 多租戶隔離
   - 文件級權限
   - 用戶角色管理

#### 非功能需求

1. **規模**：
   - 100萬+ 文件
   - 10萬 DAU
   - 1000 QPS（高峰）

2. **效能**：
   - 搜尋延遲：P95 < 500ms
   - 問答延遲：P95 < 3s
   - 上傳處理：<10s/文件

3. **準確性**：
   - 搜尋 Recall@10 > 90%
   - 答案準確率 > 85%

4. **可用性**：
   - 99.9%（允許每月 43 分鐘停機）

### 高層設計

```
┌───────────────────────────────────────────────────────┐
│          文件搜尋與問答系統架構                          │
└───────────────────────────────────────────────────────┘

              ┌─────────────┐
              │   用戶界面   │
              └─────────────┘
                      │
                      ▼
              ┌─────────────┐
              │ API Gateway │
              │ (認證/限流)  │
              └─────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌───────────────┐           ┌───────────────┐
│ 文件處理服務   │           │  查詢服務      │
└───────────────┘           └───────────────┘
        │                           │
        ▼                           │
┌───────────────┐                   │
│ 文件解析器     │                   │
│ (PDF/DOCX等) │                   │
└───────────────┘                   │
        │                           │
        ▼                           ▼
┌───────────────┐           ┌───────────────┐
│  分塊服務      │           │ 檢索服務       │
└───────────────┘           │ (向量+關鍵字)  │
        │                   └───────────────┘
        ▼                           │
┌───────────────┐                   │
│ Embedding 服務│                   │
└───────────────┘                   │
        │                           │
        ▼                           ▼
┌───────────────────────────────────────┐
│          存儲層                        │
│  ┌─────────┐  ┌─────────┐  ┌──────┐ │
│  │ 向量DB  │  │Elasticsearch│ │ S3  │ │
│  │(Qdrant) │  │   (全文)    │ │(文件)│ │
│  └─────────┘  └─────────┘  └──────┘ │
│  ┌─────────┐  ┌─────────┐           │
│  │PostgreSQL│  │  Redis  │           │
│  │ (元數據) │  │ (快取)  │           │
│  └─────────┘  └─────────┘           │
└───────────────────────────────────────┘
```

### 深入設計

#### 1. 文件處理流水線

**文件上傳流程**：

```
上傳 → 格式檢查 → 存儲(S3) → 異步處理隊列
                                    ↓
                            ┌───────────────┐
                            │  文件解析     │
                            └───────────────┘
                                    ↓
                            ┌───────────────┐
                            │  文本提取     │
                            └───────────────┘
                                    ↓
                            ┌───────────────┐
                            │  分塊處理     │
                            └───────────────┘
                                    ↓
                            ┌───────────────┐
                            │  向量化       │
                            └───────────────┘
                                    ↓
                            ┌───────────────┐
                            │  索引建立     │
                            └───────────────┘
```

**文件解析器**：

```go
type DocumentParser interface {
    Parse(file io.Reader) (*ParsedDocument, error)
    SupportedFormats() []string
}

// PDF 解析器
type PDFParser struct{}

func (p *PDFParser) Parse(file io.Reader) (*ParsedDocument, error) {
    // 使用 pdfcpu 或類似庫
    doc, err := pdf.Read(file)
    if err != nil {
        return nil, err
    }
    
    var text strings.Builder
    pages := make([]PageContent, 0)
    
    for i, page := range doc.Pages {
        pageText := extractTextFromPage(page)
        text.WriteString(pageText)
        
        pages = append(pages, PageContent{
            PageNumber: i + 1,
            Content:    pageText,
            Metadata: map[string]interface{}{
                "page_type": detectPageType(pageText),
            },
        })
    }
    
    return &ParsedDocument{
        Content:  text.String(),
        Pages:    pages,
        Metadata: extractMetadata(doc),
    }, nil
}

// DOCX 解析器
type DOCXParser struct{}

func (p *DOCXParser) Parse(file io.Reader) (*ParsedDocument, error) {
    // 使用 docx 庫
    // 實現類似邏輯
}

// 解析器工廠
type ParserFactory struct {
    parsers map[string]DocumentParser
}

func (pf *ParserFactory) GetParser(format string) (DocumentParser, error) {
    parser, ok := pf.parsers[format]
    if !ok {
        return nil, fmt.Errorf("unsupported format: %s", format)
    }
    return parser, nil
}
```

**文件分塊策略**：

```go
type ChunkingStrategy interface {
    Chunk(doc *ParsedDocument) ([]Chunk, error)
}

// 固定大小分塊
type FixedSizeChunker struct {
    ChunkSize int // 字元數
    Overlap   int // 重疊字元數
}

func (fsc *FixedSizeChunker) Chunk(doc *ParsedDocument) ([]Chunk, error) {
    text := doc.Content
    chunks := make([]Chunk, 0)
    
    for i := 0; i < len(text); i += fsc.ChunkSize - fsc.Overlap {
        end := i + fsc.ChunkSize
        if end > len(text) {
            end = len(text)
        }
        
        chunk := Chunk{
            Content: text[i:end],
            Metadata: map[string]interface{}{
                "doc_id":      doc.ID,
                "chunk_index": len(chunks),
                "start_pos":   i,
                "end_pos":     end,
            },
        }
        
        chunks = append(chunks, chunk)
        
        if end >= len(text) {
            break
        }
    }
    
    return chunks, nil
}

// 語義分塊（更智能）
type SemanticChunker struct {
    MaxChunkSize int
    MinChunkSize int
}

func (sc *SemanticChunker) Chunk(doc *ParsedDocument) ([]Chunk, error) {
    // 1. 按段落分割
    paragraphs := splitIntoParagraphs(doc.Content)
    
    chunks := make([]Chunk, 0)
    currentChunk := ""
    
    for _, para := range paragraphs {
        // 2. 檢查是否應該開始新塊
        if len(currentChunk)+len(para) > sc.MaxChunkSize &&
            len(currentChunk) >= sc.MinChunkSize {
            chunks = append(chunks, Chunk{Content: currentChunk})
            currentChunk = para
        } else {
            if currentChunk != "" {
                currentChunk += "\n\n"
            }
            currentChunk += para
        }
    }
    
    if currentChunk != "" {
        chunks = append(chunks, Chunk{Content: currentChunk})
    }
    
    return chunks, nil
}
```

#### 2. 混合檢索系統

結合向量搜尋和全文搜尋，提升檢索質量。

```go
type HybridRetriever struct {
    vectorDB      VectorDB
    elasticsearch *es.Client
    alpha         float64 // 向量權重（0-1）
}

func (hr *HybridRetriever) Retrieve(
    ctx context.Context,
    query string,
    topK int,
    filters map[string]interface{},
) ([]Document, error) {
    var wg sync.WaitGroup
    var vectorResults, keywordResults []ScoredDocument
    var vectorErr, keywordErr error
    
    // 並發執行兩種搜尋
    wg.Add(2)
    
    // 向量搜尋
    go func() {
        defer wg.Done()
        vectorResults, vectorErr = hr.vectorSearch(ctx, query, topK*2, filters)
    }()
    
    // 關鍵字搜尋
    go func() {
        defer wg.Done()
        keywordResults, keywordErr = hr.keywordSearch(ctx, query, topK*2, filters)
    }()
    
    wg.Wait()
    
    if vectorErr != nil && keywordErr != nil {
        return nil, fmt.Errorf("both searches failed")
    }
    
    // 融合結果（Reciprocal Rank Fusion）
    fused := hr.fuseResults(vectorResults, keywordResults, topK)
    
    return fused, nil
}

func (hr *HybridRetriever) vectorSearch(
    ctx context.Context,
    query string,
    topK int,
    filters map[string]interface{},
) ([]ScoredDocument, error) {
    // 生成查詢向量
    queryVector := GetEmbedding(query)
    
    // 向量搜尋
    results := hr.vectorDB.Search(ctx, SearchRequest{
        Vector:    queryVector,
        TopK:      topK,
        Threshold: 0.7,
        Filter:    filters,
    })
    
    return results, nil
}

func (hr *HybridRetriever) keywordSearch(
    ctx context.Context,
    query string,
    topK int,
    filters map[string]interface{},
) ([]ScoredDocument, error) {
    // 構建 Elasticsearch 查詢
    esQuery := buildESQuery(query, filters)
    
    resp, err := hr.elasticsearch.Search(
        hr.elasticsearch.Search.WithContext(ctx),
        hr.elasticsearch.Search.WithBody(esQuery),
        hr.elasticsearch.Search.WithSize(topK),
    )
    
    if err != nil {
        return nil, err
    }
    
    return parseESResponse(resp), nil
}

// Reciprocal Rank Fusion (RRF)
func (hr *HybridRetriever) fuseResults(
    vectorResults, keywordResults []ScoredDocument,
    topK int,
) []Document {
    k := 60.0 // RRF 常數
    scores := make(map[string]float64)
    
    // 向量搜尋分數
    for rank, doc := range vectorResults {
        scores[doc.ID] += hr.alpha / (k + float64(rank+1))
    }
    
    // 關鍵字搜尋分數
    for rank, doc := range keywordResults {
        scores[doc.ID] += (1 - hr.alpha) / (k + float64(rank+1))
    }
    
    // 按分數排序
    type scoredID struct {
        id    string
        score float64
    }
    
    scoredIDs := make([]scoredID, 0, len(scores))
    for id, score := range scores {
        scoredIDs = append(scoredIDs, scoredID{id, score})
    }
    
    sort.Slice(scoredIDs, func(i, j int) bool {
        return scoredIDs[i].score > scoredIDs[j].score
    })
    
    // 返回 Top-K
    results := make([]Document, 0, topK)
    for i := 0; i < topK && i < len(scoredIDs); i++ {
        doc := getDocumentByID(scoredIDs[i].id)
        results = append(results, doc)
    }
    
    return results
}
```

#### 3. 重排序（Reranking）

使用更強的模型對初步檢索結果重新排序。

```go
type Reranker interface {
    Rerank(query string, docs []Document, topK int) ([]Document, error)
}

// Cross-Encoder Reranker
type CrossEncoderReranker struct {
    model CrossEncoderModel
}

func (cer *CrossEncoderReranker) Rerank(
    query string,
    docs []Document,
    topK int,
) ([]Document, error) {
    type scoredDoc struct {
        doc   Document
        score float64
    }
    
    scoredDocs := make([]scoredDoc, len(docs))
    
    // 並發計算相似度分數
    var wg sync.WaitGroup
    for i := range docs {
        wg.Add(1)
        go func(i int) {
            defer wg.Done()
            score := cer.model.Score(query, docs[i].Content)
            scoredDocs[i] = scoredDoc{docs[i], score}
        }(i)
    }
    wg.Wait()
    
    // 排序
    sort.Slice(scoredDocs, func(i, j int) bool {
        return scoredDocs[i].score > scoredDocs[j].score
    })
    
    // 返回 Top-K
    results := make([]Document, 0, topK)
    for i := 0; i < topK && i < len(scoredDocs); i++ {
        results = append(results, scoredDocs[i].doc)
    }
    
    return results, nil
}
```

#### 4. 問答生成

```go
type QAGenerator struct {
    retriever *HybridRetriever
    reranker  Reranker
    llmClient *LLMClient
    cache     *SemanticCache
}

func (qag *QAGenerator) Answer(
    ctx context.Context,
    question string,
    userID string,
) (*Answer, error) {
    // 1. 檢查快取
    if cached, ok := qag.cache.Get(ctx, question); ok {
        return cached, nil
    }
    
    // 2. 檢索相關文檔
    docs, err := qag.retriever.Retrieve(ctx, question, topK=20, filters=map[string]interface{}{
        "user_id": userID, // 權限過濾
    })
    if err != nil {
        return nil, err
    }
    
    if len(docs) == 0 {
        return &Answer{
            Content: "抱歉，我無法在您的文件中找到相關資訊。",
            Type:    AnswerTypeNoResult,
        }, nil
    }
    
    // 3. 重排序
    rerankedDocs, err := qag.reranker.Rerank(question, docs, topK=5)
    if err != nil {
        rerankedDocs = docs[:min(5, len(docs))]
    }
    
    // 4. 構建 Prompt
    prompt := qag.buildPrompt(question, rerankedDocs)
    
    // 5. LLM 生成答案
    response, err := qag.llmClient.Generate(ctx, prompt)
    if err != nil {
        return nil, err
    }
    
    // 6. 提取引用
    citations := qag.extractCitations(response.Content, rerankedDocs)
    
    answer := &Answer{
        Content:   response.Content,
        Type:      AnswerTypeGenerated,
        Sources:   citations,
        Documents: rerankedDocs,
        Tokens:    response.Tokens,
    }
    
    // 7. 快取結果
    qag.cache.Set(ctx, question, answer)
    
    return answer, nil
}

func (qag *QAGenerator) buildPrompt(
    question string,
    docs []Document,
) string {
    var sb strings.Builder
    
    sb.WriteString("你是一個專業的文件助手。請基於以下文檔內容回答問題。\n\n")
    sb.WriteString("## 參考文檔\n\n")
    
    for i, doc := range docs {
        sb.WriteString(fmt.Sprintf("### 文檔 %d: %s\n", i+1, doc.Title))
        sb.WriteString(fmt.Sprintf("來源：%s\n", doc.Source))
        sb.WriteString(fmt.Sprintf("內容：\n%s\n\n", doc.Content))
    }
    
    sb.WriteString(fmt.Sprintf("## 問題\n%s\n\n", question))
    
    sb.WriteString("## 回答要求\n")
    sb.WriteString("1. 僅基於提供的文檔回答\n")
    sb.WriteString("2. 引用具體的文檔編號\n")
    sb.WriteString("3. 如果文檔中沒有相關資訊，請明確告知\n")
    sb.WriteString("4. 回答要清晰、準確、完整\n\n")
    
    sb.WriteString("## 回答\n")
    
    return sb.String()
}
```

### 系統優化

#### 1. 多租戶隔離

```go
type TenantManager struct {
    tenantDB *sql.DB
}

func (tm *TenantManager) GetTenantID(userID string) (string, error) {
    var tenantID string
    err := tm.tenantDB.QueryRow(
        "SELECT tenant_id FROM users WHERE id = $1",
        userID,
    ).Scan(&tenantID)
    return tenantID, err
}

// 在查詢時添加租戶過濾
func (hr *HybridRetriever) RetrieveWithTenant(
    ctx context.Context,
    query string,
    tenantID string,
    topK int,
) ([]Document, error) {
    filters := map[string]interface{}{
        "tenant_id": tenantID,
    }
    return hr.Retrieve(ctx, query, topK, filters)
}
```

#### 2. 增量更新

```go
type IncrementalIndexer struct {
    vectorDB      VectorDB
    elasticsearch *es.Client
    queue         chan UpdateEvent
}

type UpdateEvent struct {
    Type      EventType // CREATE, UPDATE, DELETE
    DocumentID string
    Content    string
}

func (ii *IncrementalIndexer) ProcessUpdate(event UpdateEvent) error {
    switch event.Type {
    case EventCreate, EventUpdate:
        // 重新索引
        chunks := ChunkDocument(event.Content)
        for _, chunk := range chunks {
            vector := GetEmbedding(chunk.Content)
            ii.vectorDB.Upsert(chunk.ID, vector, chunk.Metadata)
            ii.elasticsearch.Index(chunk)
        }
        
    case EventDelete:
        // 刪除所有相關塊
        chunks := GetChunksByDocID(event.DocumentID)
        for _, chunk := range chunks {
            ii.vectorDB.Delete(chunk.ID)
            ii.elasticsearch.Delete(chunk.ID)
        }
    }
    
    return nil
}
```

#### 3. 查詢優化

```go
type QueryOptimizer struct {
    rewriteModel LLMClient
}

// 查詢改寫
func (qo *QueryOptimizer) RewriteQuery(query string) []string {
    prompt := fmt.Sprintf(`生成 3 個與以下查詢語義相似的變體：

原查詢：%s

變體：
1.
2.
3.`, query)
    
    response, _ := qo.rewriteModel.Generate(context.Background(), prompt)
    variants := parseVariants(response.Content)
    
    return append([]string{query}, variants...)
}

// 使用多個查詢變體檢索
func (hr *HybridRetriever) MultiQueryRetrieve(
    ctx context.Context,
    queries []string,
    topK int,
) ([]Document, error) {
    allResults := make([][]Document, len(queries))
    
    var wg sync.WaitGroup
    for i, query := range queries {
        wg.Add(1)
        go func(i int, query string) {
            defer wg.Done()
            results, _ := hr.Retrieve(ctx, query, topK, nil)
            allResults[i] = results
        }(i, query)
    }
    wg.Wait()
    
    // 合併去重
    return deduplicateAndRank(allResults, topK), nil
}
```

## 常見面試問題

### 1. 如何處理不同格式的文件？

**答案要點**：
- 使用策略模式設計解析器接口
- 為每種格式實現專門的解析器（PDF、DOCX、TXT）
- 解析器工廠統一管理
- 提取文本、元數據、結構資訊
- 處理特殊情況（表格、圖片、公式）

### 2. 混合搜尋比單一向量搜尋有什麼優勢？

**答案要點**：
- **向量搜尋**：語義相似，但可能遺漏精確關鍵字
- **關鍵字搜尋**：精確匹配，但無法理解語義
- **混合搜尋**：結合兩者優勢，提升 Recall 和 Precision
- **實現方法**：RRF、加權融合、學習型融合

### 3. 如何保證多租戶的數據隔離？

**答案要點**：
- **向量資料庫**：metadata 添加 tenant_id，查詢時過濾
- **Elasticsearch**：使用 term filter
- **PostgreSQL**：Row-Level Security
- **應用層**：每次查詢強制添加租戶過濾
- **監控**：追蹤是否有跨租戶訪問

### 4. 如何提升檢索的準確性？

**答案要點**：
- **分塊優化**：語義分塊、合理的 chunk size 和 overlap
- **混合搜尋**：結合向量和關鍵字
- **重排序**：使用 Cross-Encoder
- **查詢優化**：查詢改寫、擴展
- **持續改進**：收集用戶回饋、A/B 測試

### 5. 系統如何擴展到千萬級文件？

**答案要點**：
- **分片**：向量資料庫和 ES 水平分片
- **快取**：多層快取（文件、查詢、答案）
- **異步處理**：文件處理異步化
- **批次處理**：批量索引、批量向量化
- **讀寫分離**：向量資料庫使用副本
- **CDN**：靜態文件使用 CDN

## 總結

設計文件搜尋與問答系統需要綜合考慮：

1. **文件處理**：解析、分塊、向量化
2. **混合檢索**：向量 + 關鍵字 + 重排序
3. **答案生成**：RAG 架構、引用來源
4. **系統優化**：多租戶、增量更新、快取
5. **擴展性**：分片、異步、批次處理

這是一個結合 NLP、資訊檢索和系統設計的綜合性題目，展示了現代 AI 應用的完整架構。

## 延伸閱讀

- [LlamaIndex Documentation](https://docs.llamaindex.ai/)
- [Haystack Documentation](https://docs.haystack.deepset.ai/)
- [Building RAG Applications](https://www.anyscale.com/blog/building-rag-applications)
