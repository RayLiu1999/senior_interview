# 設計智能客服系統 (FAQ + LLM)

- **難度**: 8
- **標籤**: `系統設計`, `智能客服`, `RAG`, `LLM`, `FAQ`

## 問題詳述

設計一個智能客服系統，能夠自動回答用戶問題。系統需要結合 FAQ（常見問題）資料庫和 LLM，提供準確、快速且可擴展的服務。這是 AI 系統設計面試中的高頻題目，考察你對 RAG 架構、系統設計和權衡取捨的理解。

## 核心理論與詳解

### 需求澄清

在開始設計前，先明確需求：

#### 功能需求

1. **自動問答**：用戶提問，系統自動回答
2. **多輪對話**：支援上下文理解，非單輪問答
3. **FAQ 優先**：優先匹配 FAQ，降低成本
4. **LLM 兜底**：FAQ 無法回答時，使用 LLM
5. **人工轉接**：複雜問題轉人工客服
6. **多語言支援**：支援中英文（可擴展）
7. **資料來源追溯**：回答需標註來源

#### 非功能需求

1. **QPS**：1萬 QPS（高峰期）
2. **延遲**：P95 < 2秒，P99 < 5秒
3. **可用性**：99.9%（允許每月 43 分鐘停機）
4. **成本**：控制 LLM API 成本
5. **擴展性**：支援新增產品線
6. **可觀測性**：追蹤回答質量和用戶滿意度

#### 規模估算

- **用戶數**：100萬 DAU
- **每用戶問題數**：平均 3 個/天
- **總問題數**：300萬/天 ≈ 35 QPS（平均），高峰 10萬 QPS
- **FAQ 數量**：1萬條
- **知識文檔**：10萬篇（產品手冊、幫助文檔等）

### 高層設計

```
┌─────────────────────────────────────────────────────────┐
│                  智能客服系統架構                          │
└─────────────────────────────────────────────────────────┘

用戶請求
  │
  ▼
┌─────────────┐
│  API Gateway │  ← 限流、認證、路由
└─────────────┘
  │
  ▼
┌─────────────┐
│ 意圖識別服務  │  ← 分類問題類型
└─────────────┘
  │
  ├──────────────┬──────────────┬──────────────┐
  ▼              ▼              ▼              ▼
FAQ匹配       RAG檢索        直接LLM        人工轉接
  │              │              │              │
  ▼              ▼              ▼              ▼
┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐
│ FAQ DB │    │Vector │    │  LLM  │    │ Queue │
└───────┘    │  DB   │    │  API  │    └───────┘
             └───────┘    └───────┘
  │              │              │
  └──────────────┴──────────────┘
               │
               ▼
         ┌─────────────┐
         │  回應整合    │
         └─────────────┘
               │
               ▼
         ┌─────────────┐
         │  後處理      │  ← 格式化、追蹤
         └─────────────┘
               │
               ▼
            返回用戶
```

### 核心組件設計

#### 1. 意圖識別服務（Intent Classification）

**目的**：將問題路由到最合適的處理流程。

**分類類型**：
- **FAQ 類**：常見問題（如「如何重置密碼」）
- **知識查詢類**：需要檢索文檔（如「產品 X 的規格是什麼」）
- **複雜問題類**：需要深度推理（如「比較產品 A 和 B」）
- **閒聊類**：問候、感謝等
- **投訴類**：需人工處理
- **超範圍類**：與業務無關

**實現方式**：

**方案 1：規則引擎**
```go
func ClassifyIntent(question string) IntentType {
    keywords := ExtractKeywords(question)
    
    if ContainsAny(keywords, []string{"密碼", "重置", "忘記"}) {
        return IntentFAQ
    }
    if ContainsAny(keywords, []string{"規格", "參數", "功能"}) {
        return IntentKnowledge
    }
    if ContainsAny(keywords, []string{"投訴", "不滿", "差"}) {
        return IntentComplaint
    }
    
    return IntentGeneral
}
```

**方案 2：輕量級分類模型**
```go
// 使用 DistilBERT 等輕量模型
classifier := LoadClassifier("intent-classifier-v1")
intent, confidence := classifier.Predict(question)

if confidence < 0.7 {
    return IntentUncertain // 需進一步處理
}
return intent
```

**方案 3：LLM 分類（最靈活）**
```go
prompt := `分類以下客服問題的類型，只返回類別名稱：

類別：
- FAQ：常見問題
- KNOWLEDGE：需查詢知識庫
- COMPLAINT：投訴
- CHITCHAT：閒聊
- OUT_OF_SCOPE：超出範圍

問題：{question}

類別：`

result := CallLLM(prompt, temperature=0)
return ParseIntent(result)
```

**選擇建議**：
- **初期**：規則 + LLM（靈活快速）
- **成熟期**：訓練專用分類模型（成本低、速度快）

#### 2. FAQ 匹配系統

**目的**：快速匹配常見問題，節省 LLM 成本。

**架構**：
```
用戶問題
  ↓
向量化（Embedding）
  ↓
向量資料庫搜尋（Top-K 相似FAQ）
  ↓
相似度閾值過濾（如 > 0.85）
  ↓
返回標準答案
```

**資料結構**：
```go
type FAQ struct {
    ID          string
    Question    string            // 標準問題
    Answer      string            // 標準答案
    Variants    []string          // 問法變體
    Category    string            // 分類
    Priority    int               // 優先級
    Vector      []float32         // 向量
    Metadata    map[string]interface{}
    UpdatedAt   time.Time
}

// 範例
faq := FAQ{
    ID:       "faq_001",
    Question: "如何重置密碼？",
    Answer:   "請點擊登入頁面的「忘記密碼」連結...",
    Variants: []string{
        "忘記密碼怎麼辦？",
        "密碼找不回來了",
        "重設密碼的步驟",
    },
    Category: "帳號管理",
    Priority: 1, // 高優先級
}
```

**匹配策略**：

**單階段匹配**：
```go
func MatchFAQ(question string, threshold float32) (*FAQ, error) {
    // 向量化問題
    vector := GetEmbedding(question)
    
    // 搜尋最相似的 FAQ
    results := vectorDB.Search(vector, topK=3, threshold=threshold)
    
    if len(results) == 0 {
        return nil, ErrNoMatch
    }
    
    // 返回最相似的
    return results[0].FAQ, nil
}
```

**兩階段匹配**（更精確）：
```go
func MatchFAQTwoStage(question string) (*FAQ, error) {
    // 階段 1：向量檢索（召回）
    vector := GetEmbedding(question)
    candidates := vectorDB.Search(vector, topK=10, threshold=0.7)
    
    if len(candidates) == 0 {
        return nil, ErrNoMatch
    }
    
    // 階段 2：重排序（精排）
    // 使用 Cross-Encoder 計算精確相似度
    for i := range candidates {
        candidates[i].Score = CrossEncoder.Score(question, candidates[i].Question)
    }
    
    sort.Slice(candidates, func(i, j int) bool {
        return candidates[i].Score > candidates[j].Score
    })
    
    if candidates[0].Score > 0.85 {
        return candidates[0].FAQ, nil
    }
    
    return nil, ErrNoMatch
}
```

**優化策略**：

1. **快取熱門問題**
```go
type FAQCache struct {
    cache map[string]*FAQ
    mu    sync.RWMutex
}

func (fc *FAQCache) Get(question string) (*FAQ, bool) {
    fc.mu.RLock()
    defer fc.mu.RUnlock()
    
    // 使用問題向量的哈希作為鍵
    key := HashVector(GetEmbedding(question))
    faq, exists := fc.cache[key]
    return faq, exists
}
```

2. **FAQ 預處理**
```go
// 離線生成所有 FAQ 的向量
func PreprocessFAQs(faqs []FAQ) {
    for i := range faqs {
        // 標準問題向量化
        faqs[i].Vector = GetEmbedding(faqs[i].Question)
        
        // 問法變體也向量化並索引
        for _, variant := range faqs[i].Variants {
            variantVector := GetEmbedding(variant)
            vectorDB.Insert(FAQVariant{
                FAQID:  faqs[i].ID,
                Vector: variantVector,
            })
        }
    }
}
```

#### 3. RAG 檢索系統

**目的**：從知識庫檢索相關文檔，輔助 LLM 回答。

**知識庫構建**：

```go
type KnowledgeDocument struct {
    ID          string
    Title       string
    Content     string
    Source      string // "product_manual", "help_doc", "policy"
    Category    string
    Version     string
    Language    string
    CreatedAt   time.Time
    UpdatedAt   time.Time
}

// 文檔處理流程
func IndexDocument(doc KnowledgeDocument) error {
    // 1. 文檔分塊
    chunks := ChunkDocument(doc.Content, chunkSize=800, overlap=100)
    
    // 2. 為每個 chunk 生成向量
    for i, chunk := range chunks {
        vector := GetEmbedding(chunk.Content)
        
        // 3. 存入向量資料庫
        vectorDB.Insert(DocumentChunk{
            ID:      fmt.Sprintf("%s_chunk_%d", doc.ID, i),
            Content: chunk.Content,
            Vector:  vector,
            Metadata: map[string]interface{}{
                "doc_id":   doc.ID,
                "title":    doc.Title,
                "source":   doc.Source,
                "category": doc.Category,
                "chunk_index": i,
            },
        })
    }
    
    return nil
}
```

**檢索流程**：

```go
func RetrieveRelevantDocs(question string, topK int) ([]DocumentChunk, error) {
    // 1. 問題向量化
    queryVector := GetEmbedding(question)
    
    // 2. 向量搜尋
    results := vectorDB.Search(SearchRequest{
        Vector:    queryVector,
        TopK:      topK,
        Threshold: 0.75,
        // 可選：元數據過濾
        Filter: map[string]interface{}{
            "source": []string{"product_manual", "help_doc"},
            "language": "zh",
        },
    })
    
    // 3. 去重（同一文檔的多個 chunk）
    uniqueDocs := DeduplicateByDocID(results, maxChunksPerDoc=2)
    
    return uniqueDocs, nil
}
```

**進階優化**：

**混合搜尋**（Hybrid Search）：
```go
func HybridSearch(question string, topK int) ([]DocumentChunk, error) {
    // 1. 向量搜尋
    vectorResults := vectorDB.Search(queryVector, topK=20)
    
    // 2. 關鍵字搜尋（BM25）
    keywords := ExtractKeywords(question)
    keywordResults := elasticsearchSearch(keywords, topK=20)
    
    // 3. 結果融合（Reciprocal Rank Fusion）
    finalResults := FuseResults(vectorResults, keywordResults, alpha=0.7)
    
    return finalResults[:topK], nil
}
```

**查詢擴展**：
```go
func ExpandQuery(question string) []string {
    prompt := `生成 3 個與以下問題相關的查詢變體：

原問題：{question}

變體：
1.
2.
3.`

    variants := CallLLM(prompt)
    return append([]string{question}, variants...)
}

// 使用擴展查詢檢索
func MultiQueryRetrieval(question string) ([]DocumentChunk, error) {
    queries := ExpandQuery(question)
    
    allResults := []DocumentChunk{}
    for _, q := range queries {
        results := vectorDB.Search(GetEmbedding(q), topK=5)
        allResults = append(allResults, results...)
    }
    
    // 去重並排序
    return DeduplicateAndRank(allResults), nil
}
```

#### 4. LLM 整合層

**Prompt 構建**：

```go
func BuildPrompt(question string, docs []DocumentChunk, history []Message) string {
    prompt := `你是一位專業的客服助手。請基於以下參考資料回答用戶問題。

## 參考資料

`
    for i, doc := range docs {
        prompt += fmt.Sprintf(`### 文檔 %d（來源：%s）
%s

`, i+1, doc.Metadata["source"], doc.Content)
    }
    
    if len(history) > 0 {
        prompt += "\n## 對話歷史\n\n"
        for _, msg := range history {
            prompt += fmt.Sprintf("%s: %s\n", msg.Role, msg.Content)
        }
    }
    
    prompt += fmt.Sprintf(`
## 用戶問題
%s

## 回答要求
1. 僅基於提供的參考資料回答
2. 如果參考資料中沒有相關資訊，誠實告知並建議轉人工客服
3. 回答要清晰、專業、友好
4. 如果參考資料有矛盾，以最新版本為準
5. 引用資料來源（如「根據產品手冊...」）

## 回答
`, question)
    
    return prompt
}
```

**回應生成**：

```go
type ResponseGenerator struct {
    llmClient LLMClient
    config    LLMConfig
}

type LLMConfig struct {
    Model       string  // "gpt-3.5-turbo" or "gpt-4"
    Temperature float32 // 0.3（較低，減少創造性）
    MaxTokens   int     // 500
    TopP        float32 // 0.9
}

func (rg *ResponseGenerator) Generate(
    ctx context.Context,
    question string,
    docs []DocumentChunk,
    history []Message,
) (*Response, error) {
    // 構建 Prompt
    prompt := BuildPrompt(question, docs, history)
    
    // 檢查 Token 數量
    tokenCount := EstimateTokens(prompt)
    if tokenCount > 3000 {
        // 超過限制，需要壓縮文檔
        docs = CompressDocs(docs, maxTokens=2000)
        prompt = BuildPrompt(question, docs, history)
    }
    
    // 調用 LLM
    response, err := rg.llmClient.Generate(ctx, GenerateRequest{
        Model:       rg.config.Model,
        Prompt:      prompt,
        Temperature: rg.config.Temperature,
        MaxTokens:   rg.config.MaxTokens,
        Stream:      true, // 串流回應
    })
    
    if err != nil {
        return nil, fmt.Errorf("LLM generate: %w", err)
    }
    
    return &Response{
        Answer:    response.Text,
        Sources:   ExtractSources(docs),
        Tokens:    response.Usage.TotalTokens,
        Latency:   response.Latency,
        Confidence: EstimateConfidence(response),
    }, nil
}
```

#### 5. 路由決策引擎

**決策流程**：

```go
type Router struct {
    faqMatcher     *FAQMatcher
    ragRetriever   *RAGRetriever
    llmGenerator   *ResponseGenerator
    intentClassifier *IntentClassifier
}

func (r *Router) Route(ctx context.Context, req Request) (*Response, error) {
    // 1. 意圖識別
    intent := r.intentClassifier.Classify(req.Question)
    
    switch intent {
    case IntentComplaint:
        // 直接轉人工
        return r.TransferToHuman(ctx, req)
    
    case IntentChitchat:
        // 使用預定義回應或輕量 LLM
        return r.HandleChitchat(ctx, req)
    
    case IntentFAQ:
        // 嘗試 FAQ 匹配
        faq, err := r.faqMatcher.Match(req.Question, threshold=0.85)
        if err == nil {
            // FAQ 匹配成功
            return &Response{
                Answer: faq.Answer,
                Source: "FAQ",
                Type:   ResponseTypeFAQ,
            }, nil
        }
        // FAQ 失敗，降級到 RAG
        fallthrough
    
    case IntentKnowledge:
        // RAG 檢索 + LLM
        docs, err := r.ragRetriever.Retrieve(req.Question, topK=5)
        if err != nil {
            return nil, err
        }
        
        if len(docs) == 0 {
            // 無相關文檔，建議轉人工
            return &Response{
                Answer: "抱歉，我無法找到相關資訊。是否需要轉接人工客服？",
                Type:   ResponseTypeSuggestHuman,
            }, nil
        }
        
        return r.llmGenerator.Generate(ctx, req.Question, docs, req.History)
    
    default:
        // 未知意圖，使用 LLM 直接回答
        return r.llmGenerator.Generate(ctx, req.Question, nil, req.History)
    }
}
```

**成本優化策略**：

```go
// 根據問題複雜度選擇模型
func (r *Router) SelectModel(question string, intent IntentType) string {
    // 簡單 FAQ → GPT-3.5
    if intent == IntentFAQ || intent == IntentChitchat {
        return "gpt-3.5-turbo"
    }
    
    // 估算問題複雜度
    complexity := EstimateComplexity(question)
    
    if complexity > 0.7 {
        // 複雜問題 → GPT-4
        return "gpt-4"
    }
    
    // 一般問題 → GPT-3.5
    return "gpt-3.5-turbo"
}

func EstimateComplexity(question string) float64 {
    score := 0.0
    
    // 問題長度
    if len(question) > 100 {
        score += 0.2
    }
    
    // 包含比較
    if strings.Contains(question, "比較") || strings.Contains(question, "對比") {
        score += 0.3
    }
    
    // 包含多個問號
    if strings.Count(question, "？") > 1 {
        score += 0.2
    }
    
    // 包含複雜關鍵詞
    complexKeywords := []string{"為什麼", "如何", "原理", "分析"}
    for _, kw := range complexKeywords {
        if strings.Contains(question, kw) {
            score += 0.3
            break
        }
    }
    
    return score
}
```

### 深入設計

#### 1. 多輪對話管理

**對話狀態存儲**：

```go
type ConversationManager struct {
    store ConversationStore // Redis or DB
}

type Conversation struct {
    ID        string
    UserID    string
    Messages  []Message
    Context   map[string]interface{} // 上下文資訊
    CreatedAt time.Time
    UpdatedAt time.Time
}

type Message struct {
    Role      string // "user" or "assistant"
    Content   string
    Timestamp time.Time
    Metadata  map[string]interface{}
}

func (cm *ConversationManager) AddMessage(
    ctx context.Context,
    conversationID string,
    message Message,
) error {
    conv, err := cm.store.Get(ctx, conversationID)
    if err != nil {
        return err
    }
    
    conv.Messages = append(conv.Messages, message)
    
    // 限制歷史長度（控制 Token 消耗）
    if len(conv.Messages) > 10 {
        conv.Messages = conv.Messages[len(conv.Messages)-10:]
    }
    
    conv.UpdatedAt = time.Now()
    return cm.store.Update(ctx, conv)
}

// 上下文壓縮
func (cm *ConversationManager) GetCompressedHistory(
    conversationID string,
    maxTokens int,
) ([]Message, error) {
    conv, _ := cm.store.Get(context.Background(), conversationID)
    
    messages := conv.Messages
    totalTokens := 0
    
    // 從最新消息往回取
    compressedMessages := []Message{}
    for i := len(messages) - 1; i >= 0; i-- {
        msgTokens := EstimateTokens(messages[i].Content)
        if totalTokens+msgTokens > maxTokens {
            break
        }
        compressedMessages = append([]Message{messages[i]}, compressedMessages...)
        totalTokens += msgTokens
    }
    
    return compressedMessages, nil
}
```

#### 2. 快取策略

**多層快取**：

```
L1: 本地內存快取（熱門 FAQ）
   ↓ Miss
L2: Redis 快取（近期查詢）
   ↓ Miss
L3: 向量資料庫 / LLM
```

**實現**：

```go
type CacheLayer struct {
    l1Cache *LocalCache  // 內存快取
    l2Cache *RedisCache  // Redis 快取
}

func (cl *CacheLayer) Get(question string) (*Response, bool) {
    // L1: 本地快取
    if resp, ok := cl.l1Cache.Get(question); ok {
        return resp, true
    }
    
    // L2: Redis 快取
    if resp, ok := cl.l2Cache.Get(question); ok {
        // 回填 L1
        cl.l1Cache.Set(question, resp, ttl=5*time.Minute)
        return resp, true
    }
    
    return nil, false
}

func (cl *CacheLayer) Set(question string, response *Response) {
    // 寫入 L2（更長 TTL）
    cl.l2Cache.Set(question, response, ttl=1*time.Hour)
    
    // 寫入 L1（更短 TTL）
    cl.l1Cache.Set(question, response, ttl=5*time.Minute)
}

// 語義快取：相似問題也能命中
type SemanticCache struct {
    vectorDB VectorDB
}

func (sc *SemanticCache) Get(question string) (*Response, bool) {
    vector := GetEmbedding(question)
    
    // 搜尋相似的已快取問題
    results := sc.vectorDB.Search(vector, topK=1, threshold=0.95)
    
    if len(results) > 0 {
        return results[0].CachedResponse, true
    }
    
    return nil, false
}
```

#### 3. 限流與降級

```go
type RateLimiter struct {
    redisClient *redis.Client
}

func (rl *RateLimiter) Allow(userID string) (bool, error) {
    key := fmt.Sprintf("rate_limit:%s", userID)
    
    // 使用滑動窗口限流
    count, err := rl.redisClient.Incr(context.Background(), key).Result()
    if err != nil {
        return false, err
    }
    
    if count == 1 {
        // 設置過期時間（1 分鐘）
        rl.redisClient.Expire(context.Background(), key, time.Minute)
    }
    
    // 限制：每分鐘 10 次
    return count <= 10, nil
}

// 降級策略
type FallbackStrategy struct {
    router *Router
}

func (fs *FallbackStrategy) HandleWithFallback(
    ctx context.Context,
    req Request,
) (*Response, error) {
    // 嘗試正常流程
    resp, err := fs.router.Route(ctx, req)
    if err == nil {
        return resp, nil
    }
    
    // 降級策略
    switch {
    case errors.Is(err, ErrLLMTimeout):
        // LLM 超時 → 返回 FAQ 或預定義回應
        return fs.fallbackToFAQ(req)
    
    case errors.Is(err, ErrLLMQuotaExceeded):
        // 配額超限 → 使用本地模型或排隊
        return fs.fallbackToLocalModel(req)
    
    case errors.Is(err, ErrVectorDBUnavailable):
        // 向量資料庫不可用 → 使用關鍵字搜尋
        return fs.fallbackToKeywordSearch(req)
    
    default:
        // 其他錯誤 → 返回友好錯誤訊息
        return &Response{
            Answer: "抱歉，系統暫時無法回答您的問題。請稍後再試或聯繫人工客服。",
            Type:   ResponseTypeError,
        }, nil
    }
}
```

#### 4. 監控與評估

**關鍵指標**：

```go
type Metrics struct {
    // 效能指標
    LatencyP50  time.Duration
    LatencyP95  time.Duration
    LatencyP99  time.Duration
    QPS         float64
    
    // 質量指標
    FAQHitRate     float64 // FAQ 命中率
    LLMUsageRate   float64 // LLM 使用率
    HumanTransferRate float64 // 人工轉接率
    UserSatisfaction  float64 // 用戶滿意度
    
    // 成本指標
    LLMCost        float64 // LLM API 成本
    TotalTokens    int64   // Token 消耗
    
    // 錯誤指標
    ErrorRate      float64
    TimeoutRate    float64
}

func (m *Metrics) Track(req Request, resp *Response, err error) {
    // 記錄延遲
    prometheus.HistogramVec.WithLabelValues("latency").Observe(resp.Latency.Seconds())
    
    // 記錄回應類型
    prometheus.CounterVec.WithLabelValues("response_type", string(resp.Type)).Inc()
    
    // 記錄 Token 消耗
    prometheus.CounterVec.WithLabelValues("tokens").Add(float64(resp.Tokens))
    
    // 記錄錯誤
    if err != nil {
        prometheus.CounterVec.WithLabelValues("error", err.Error()).Inc()
    }
}
```

**A/B 測試**：

```go
type ABTest struct {
    variants map[string]RouterConfig
}

func (ab *ABTest) Route(req Request) (*Response, error) {
    // 根據用戶 ID 分配變體
    variant := ab.selectVariant(req.UserID)
    
    router := NewRouter(ab.variants[variant])
    resp, err := router.Route(context.Background(), req)
    
    // 記錄變體和結果
    logABTest(variant, req, resp, err)
    
    return resp, err
}

func (ab *ABTest) selectVariant(userID string) string {
    hash := hash(userID)
    
    // 50% A, 50% B
    if hash%2 == 0 {
        return "A"
    }
    return "B"
}
```

### 系統優化與擴展

#### 1. 成本優化

**策略總結**：

| 優化點 | 方法 | 預期節省 |
|--------|------|---------|
| FAQ 優先 | 提升 FAQ 覆蓋率到 60% | 節省 60% LLM 成本 |
| 智能快取 | 語義快取 + 多層快取 | 節省 30-40% 成本 |
| 模型選型 | 簡單問題用 GPT-3.5 | 節省 50% Token 成本 |
| Prompt 優化 | 減少不必要的上下文 | 節省 20-30% Token |
| 批次處理 | 批次生成 Embedding | 節省 API 調用次數 |

#### 2. 擴展性設計

**水平擴展**：

```
               Load Balancer
                     │
      ┌──────────────┼──────────────┐
      │              │              │
   Service 1     Service 2     Service 3
      │              │              │
      └──────────────┴──────────────┘
                     │
              Shared Resources
          (Redis, Vector DB, LLM API)
```

**垂直拆分**（微服務）：

```
- Intent Service（意圖識別）
- FAQ Service（FAQ 匹配）
- RAG Service（文檔檢索）
- LLM Service（LLM 呼叫）
- Conversation Service（對話管理）
- Analytics Service（分析統計）
```

#### 3. 持續改進

**用戶回饋循環**：

```go
type FeedbackCollector struct {
    db Database
}

type Feedback struct {
    ConversationID string
    QuestionID     string
    Helpful        bool
    Rating         int // 1-5
    Comment        string
    CreatedAt      time.Time
}

func (fc *FeedbackCollector) Collect(feedback Feedback) error {
    // 存儲回饋
    if err := fc.db.Insert(feedback); err != nil {
        return err
    }
    
    // 如果回饋為負面，觸發分析
    if !feedback.Helpful || feedback.Rating < 3 {
        go fc.analyzeFailure(feedback)
    }
    
    return nil
}

func (fc *FeedbackCollector) analyzeFailure(feedback Feedback) {
    // 分析失敗原因
    conversation := getConversation(feedback.ConversationID)
    
    reasons := []string{}
    
    // 檢查是否檢索到相關文檔
    if len(conversation.RetrievedDocs) == 0 {
        reasons = append(reasons, "no_relevant_docs")
    }
    
    // 檢查回答是否引用了文檔
    if !containsCitation(conversation.Answer) {
        reasons = append(reasons, "no_citation")
    }
    
    // 記錄到分析系統
    logFailureAnalysis(feedback, reasons)
}
```

## 程式碼範例

完整的智能客服核心邏輯：

```go
package main

import (
	"context"
	"fmt"
	"time"
)

// CustomerServiceSystem 智能客服系統
type CustomerServiceSystem struct {
	intentClassifier *IntentClassifier
	faqMatcher       *FAQMatcher
	ragRetriever     *RAGRetriever
	llmGenerator     *ResponseGenerator
	cache            *CacheLayer
	rateLimiter      *RateLimiter
	metrics          *Metrics
}

// Request 用戶請求
type Request struct {
	UserID         string
	ConversationID string
	Question       string
	History        []Message
	Context        map[string]interface{}
}

// Response 系統回應
type Response struct {
	Answer     string
	Type       ResponseType
	Sources    []string
	Confidence float64
	Latency    time.Duration
	Tokens     int
	Cost       float64
}

type ResponseType string

const (
	ResponseTypeFAQ           ResponseType = "faq"
	ResponseTypeRAG           ResponseType = "rag"
	ResponseTypeLLM           ResponseType = "llm"
	ResponseTypeSuggestHuman  ResponseType = "suggest_human"
	ResponseTypeError         ResponseType = "error"
)

// HandleRequest 處理用戶請求
func (css *CustomerServiceSystem) HandleRequest(
	ctx context.Context,
	req Request,
) (*Response, error) {
	startTime := time.Now()
	
	// 1. 限流檢查
	allowed, err := css.rateLimiter.Allow(req.UserID)
	if err != nil || !allowed {
		return &Response{
			Answer: "請求過於頻繁，請稍後再試。",
			Type:   ResponseTypeError,
		}, nil
	}
	
	// 2. 檢查快取
	if cachedResp, ok := css.cache.Get(req.Question); ok {
		cachedResp.Latency = time.Since(startTime)
		css.metrics.Track(req, cachedResp, nil)
		return cachedResp, nil
	}
	
	// 3. 意圖識別
	intent := css.intentClassifier.Classify(req.Question)
	
	var response *Response
	
	// 4. 路由到對應處理邏輯
	switch intent {
	case IntentFAQ:
		response, err = css.handleFAQ(ctx, req)
		if err == nil {
			break
		}
		// FAQ 失敗，降級到 RAG
		fallthrough
		
	case IntentKnowledge:
		response, err = css.handleRAG(ctx, req)
		
	default:
		response, err = css.handleGeneral(ctx, req)
	}
	
	if err != nil {
		return nil, err
	}
	
	// 5. 計算延遲和成本
	response.Latency = time.Since(startTime)
	response.Cost = css.calculateCost(response)
	
	// 6. 快取結果
	if response.Type == ResponseTypeFAQ || response.Confidence > 0.8 {
		css.cache.Set(req.Question, response)
	}
	
	// 7. 記錄指標
	css.metrics.Track(req, response, err)
	
	return response, nil
}

// handleFAQ 處理 FAQ 問題
func (css *CustomerServiceSystem) handleFAQ(
	ctx context.Context,
	req Request,
) (*Response, error) {
	faq, err := css.faqMatcher.Match(req.Question, threshold=0.85)
	if err != nil {
		return nil, err
	}
	
	return &Response{
		Answer:     faq.Answer,
		Type:       ResponseTypeFAQ,
		Sources:    []string{"FAQ Database"},
		Confidence: faq.Similarity,
		Tokens:     0, // FAQ 不消耗 Token
		Cost:       0,
	}, nil
}

// handleRAG 處理需要檢索的問題
func (css *CustomerServiceSystem) handleRAG(
	ctx context.Context,
	req Request,
) (*Response, error) {
	// 檢索相關文檔
	docs, err := css.ragRetriever.Retrieve(req.Question, topK=5)
	if err != nil {
		return nil, fmt.Errorf("retrieve docs: %w", err)
	}
	
	if len(docs) == 0 {
		return &Response{
			Answer: "抱歉，我無法找到相關資訊。是否需要轉接人工客服？",
			Type:   ResponseTypeSuggestHuman,
		}, nil
	}
	
	// 使用 LLM 生成回答
	return css.llmGenerator.Generate(ctx, req.Question, docs, req.History)
}

// handleGeneral 處理一般問題
func (css *CustomerServiceSystem) handleGeneral(
	ctx context.Context,
	req Request,
) (*Response, error) {
	return css.llmGenerator.Generate(ctx, req.Question, nil, req.History)
}

// calculateCost 計算成本
func (css *CustomerServiceSystem) calculateCost(resp *Response) float64 {
	if resp.Type == ResponseTypeFAQ {
		return 0
	}
	
	// GPT-3.5-turbo: $0.0015 / 1K tokens（假設）
	return float64(resp.Tokens) / 1000.0 * 0.0015
}

func main() {
	css := &CustomerServiceSystem{
		// 初始化各組件...
	}
	
	req := Request{
		UserID:   "user_123",
		Question: "如何重置密碼？",
	}
	
	resp, err := css.HandleRequest(context.Background(), req)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		return
	}
	
	fmt.Printf("回答：%s\n", resp.Answer)
	fmt.Printf("類型：%s\n", resp.Type)
	fmt.Printf("延遲：%v\n", resp.Latency)
	fmt.Printf("成本：$%.6f\n", resp.Cost)
}
```

## 常見面試問題

### 1. 如何平衡 FAQ 和 LLM 的使用？

**答案要點**：
- **優先級**：FAQ > RAG > 純 LLM
- **FAQ 優勢**：成本低、速度快、回答一致
- **LLM 優勢**：靈活、能處理複雜問題
- **策略**：提升 FAQ 覆蓋率（目標 60-70%）、使用相似度閾值決定是否降級

### 2. 如何降低 LLM API 成本？

**答案要點**：
- **多層快取**：內存、Redis、語義快取
- **FAQ 優先**：減少 LLM 調用
- **模型選型**：簡單問題用小模型
- **Prompt 優化**：減少不必要的上下文
- **批次處理**：批量生成 Embedding
- **預估**：根據問題複雜度選擇模型

### 3. 如何保證回答質量？

**答案要點**：
- **資料質量**：定期更新 FAQ 和知識庫
- **檢索優化**：使用混合搜尋、重排序
- **Prompt Engineering**：清晰的指令和約束
- **用戶回饋**：收集負面回饋並改進
- **A/B 測試**：持續測試不同策略
- **人工審核**：定期抽查回答質量

### 4. 如何處理多輪對話？

**答案要點**：
- **狀態管理**：使用 Redis 或資料庫存儲對話歷史
- **上下文壓縮**：限制歷史消息數量或 Token 數量
- **指代消解**：理解「它」、「那個」等指代
- **摘要歷史**：長對話使用 LLM 生成摘要
- **重置機制**：檢測話題轉換，清除無關上下文

### 5. 系統如何擴展到百萬 QPS？

**答案要點**：
- **水平擴展**：無狀態服務，增加實例數
- **快取**：多層快取減少後端壓力
- **異步處理**：非關鍵路徑異步化
- **CDN**：靜態資源和常見回答使用 CDN
- **讀寫分離**：向量資料庫使用副本
- **限流**：保護後端服務
- **降級**：高負載時降級到簡單邏輯

## 總結

設計智能客服系統需要綜合考慮：

1. **架構分層**：意圖識別 → 路由決策 → 處理邏輯
2. **成本優化**：FAQ 優先、智能快取、模型選型
3. **質量保證**：檢索優化、Prompt 工程、用戶回饋
4. **效能優化**：多層快取、批次處理、限流降級
5. **可擴展性**：微服務拆分、水平擴展、監控告警

這是一個綜合性的系統設計題目，展示了 AI 技術（LLM、RAG、向量資料庫）與傳統後端技術（快取、限流、監控）的結合。

## 延伸閱讀

- [LangChain Customer Support Bot](https://python.langchain.com/docs/use_cases/chatbots/)
- [OpenAI Customer Service Guide](https://platform.openai.com/docs/guides/customer-service)
- [Building Production-Ready RAG Applications](https://www.anyscale.com/blog/building-production-ready-rag-applications)
