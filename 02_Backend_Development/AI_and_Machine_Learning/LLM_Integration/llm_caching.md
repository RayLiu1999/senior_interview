# LLM 快取策略設計

- **難度**: 6
- **標籤**: `快取`, `效能優化`, `成本優化`, `LLM`

## 問題詳述

LLM API 調用成本高、延遲大，合理的快取策略可以顯著降低成本和提升效能。本文將深入探討 LLM 快取的設計模式、實現方法和最佳實踐，包括精確快取、語義快取、多層快取等策略。

## 核心理論與詳解

### 為什麼需要 LLM 快取

#### 成本考量

**OpenAI GPT-4 定價（2024）**：
- 輸入：$0.03 / 1K tokens
- 輸出：$0.06 / 1K tokens

**成本範例**：
```
100萬次請求 × 平均 2000 tokens = 20億 tokens
成本 ≈ $60,000 / 月（僅輸入）
```

**快取效果**：
- 50% 命中率 → 節省 $30,000 / 月
- 80% 命中率 → 節省 $48,000 / 月

#### 效能考量

| 方案 | 延遲 |
|------|------|
| LLM API 調用 | 2-5 秒 |
| Redis 快取 | 10-50 毫秒 |
| 本地快取 | <1 毫秒 |

**效能提升**：快取可將延遲降低 **100-500 倍**。

### 快取策略類型

#### 1. 精確快取（Exact Match Cache）

最簡單的策略，完全相同的輸入返回相同的輸出。

```go
type ExactCache struct {
    cache map[string]*CachedResponse
    mu    sync.RWMutex
    ttl   time.Duration
}

type CachedResponse struct {
    Response  string
    Timestamp time.Time
}

func (ec *ExactCache) Get(prompt string) (string, bool) {
    ec.mu.RLock()
    defer ec.mu.RUnlock()
    
    cached, ok := ec.cache[prompt]
    if !ok {
        return "", false
    }
    
    // 檢查是否過期
    if time.Since(cached.Timestamp) > ec.ttl {
        return "", false
    }
    
    return cached.Response, true
}

func (ec *ExactCache) Set(prompt, response string) {
    ec.mu.Lock()
    defer ec.mu.Unlock()
    
    ec.cache[prompt] = &CachedResponse{
        Response:  response,
        Timestamp: time.Now(),
    }
}
```

**優點**：
- 簡單、快速
- 100% 準確

**缺點**：
- 命中率低（輕微的措辭變化就無法命中）
- 無法處理語義相似的查詢

**適用場景**：
- FAQ 系統
- 固定模板的查詢
- 翻譯等確定性任務

#### 2. 語義快取（Semantic Cache）

使用向量相似度匹配語義相似的查詢。

```go
type SemanticCache struct {
    vectorDB      VectorDB
    embeddingClient *EmbeddingClient
    threshold     float32 // 相似度閾值（如 0.95）
    ttl           time.Duration
}

type CacheEntry struct {
    ID        string
    Prompt    string
    Response  string
    Vector    []float32
    Timestamp time.Time
    Metadata  map[string]interface{}
}

func (sc *SemanticCache) Get(
    ctx context.Context,
    prompt string,
) (*CacheEntry, bool) {
    // 1. 生成查詢向量
    queryVector, err := sc.embeddingClient.GetEmbedding(ctx, prompt)
    if err != nil {
        return nil, false
    }
    
    // 2. 向量搜尋
    results, err := sc.vectorDB.Search(ctx, SearchRequest{
        Vector:    queryVector,
        TopK:      1,
        Threshold: sc.threshold,
    })
    
    if err != nil || len(results) == 0 {
        return nil, false
    }
    
    entry := results[0]
    
    // 3. 檢查是否過期
    if time.Since(entry.Timestamp) > sc.ttl {
        // 異步刪除過期條目
        go sc.vectorDB.Delete(ctx, entry.ID)
        return nil, false
    }
    
    return entry, true
}

func (sc *SemanticCache) Set(
    ctx context.Context,
    prompt, response string,
) error {
    // 1. 生成向量
    vector, err := sc.embeddingClient.GetEmbedding(ctx, prompt)
    if err != nil {
        return err
    }
    
    // 2. 存入向量資料庫
    entry := CacheEntry{
        ID:        generateID(),
        Prompt:    prompt,
        Response:  response,
        Vector:    vector,
        Timestamp: time.Now(),
    }
    
    return sc.vectorDB.Insert(ctx, entry)
}
```

**優點**：
- 高命中率（語義相似的查詢也能命中）
- 靈活（不受措辭限制）

**缺點**：
- 需要 Embedding 模型（額外成本）
- 實現複雜
- 可能返回不夠精確的結果

**適用場景**：
- 客服系統（相似問題）
- 搜尋查詢
- 內容推薦

**優化技巧**：

**相似度閾值調整**：
```
閾值 0.99：非常嚴格，接近精確快取
閾值 0.95：平衡命中率和準確性（推薦）
閾值 0.90：較寬鬆，命中率高但可能不夠精確
```

**混合策略**：
```go
func (sc *SemanticCache) GetHybrid(
    ctx context.Context,
    prompt string,
) (string, bool) {
    // 1. 先嘗試精確快取
    if response, ok := sc.exactCache.Get(prompt); ok {
        return response, true
    }
    
    // 2. 再嘗試語義快取
    entry, ok := sc.semanticCache.Get(ctx, prompt)
    if !ok {
        return "", false
    }
    
    // 3. 如果相似度很高，也加入精確快取
    if entry.Similarity > 0.98 {
        sc.exactCache.Set(prompt, entry.Response)
    }
    
    return entry.Response, true
}
```

#### 3. 多層快取（Multi-tier Cache）

結合不同層級的快取，平衡速度和命中率。

```
L1: 本地內存快取（熱門查詢）
   ↓ Miss
L2: Redis 快取（近期查詢）
   ↓ Miss
L3: 語義快取（向量資料庫）
   ↓ Miss
L4: LLM API 調用
```

**實現**：

```go
type MultiTierCache struct {
    l1      *LocalCache      // 內存快取
    l2      *RedisCache      // Redis 快取
    l3      *SemanticCache   // 語義快取
    metrics *CacheMetrics    // 監控指標
}

func (mtc *MultiTierCache) Get(
    ctx context.Context,
    prompt string,
) (string, CacheTier, bool) {
    // L1: 本地快取
    if response, ok := mtc.l1.Get(prompt); ok {
        mtc.metrics.RecordHit(TierL1)
        return response, TierL1, true
    }
    
    // L2: Redis 快取
    if response, ok := mtc.l2.Get(ctx, prompt); ok {
        mtc.metrics.RecordHit(TierL2)
        // 回填 L1
        mtc.l1.Set(prompt, response)
        return response, TierL2, true
    }
    
    // L3: 語義快取
    entry, ok := mtc.l3.Get(ctx, prompt)
    if ok {
        mtc.metrics.RecordHit(TierL3)
        // 回填 L1 和 L2
        mtc.l1.Set(prompt, entry.Response)
        mtc.l2.Set(ctx, prompt, entry.Response)
        return entry.Response, TierL3, true
    }
    
    mtc.metrics.RecordMiss()
    return "", TierNone, false
}

func (mtc *MultiTierCache) Set(
    ctx context.Context,
    prompt, response string,
) error {
    // 寫入所有層級
    mtc.l1.Set(prompt, response)
    mtc.l2.Set(ctx, prompt, response)
    return mtc.l3.Set(ctx, prompt, response)
}
```

**配置建議**：

| 層級 | TTL | 容量 | 用途 |
|------|-----|------|------|
| L1 (內存) | 5 分鐘 | 1000 條 | 極熱門查詢 |
| L2 (Redis) | 1 小時 | 10萬條 | 熱門查詢 |
| L3 (向量DB) | 7 天 | 100萬條 | 所有查詢 |

### 快取失效策略

#### 1. 基於時間（TTL）

```go
type TTLCache struct {
    entries map[string]*Entry
    mu      sync.RWMutex
}

type Entry struct {
    Value      string
    Expiry     time.Time
}

func (c *TTLCache) Get(key string) (string, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()
    
    entry, ok := c.entries[key]
    if !ok {
        return "", false
    }
    
    if time.Now().After(entry.Expiry) {
        return "", false
    }
    
    return entry.Value, true
}

// 定期清理過期條目
func (c *TTLCache) StartCleanup(interval time.Duration) {
    ticker := time.NewTicker(interval)
    go func() {
        for range ticker.C {
            c.cleanup()
        }
    }()
}

func (c *TTLCache) cleanup() {
    c.mu.Lock()
    defer c.mu.Unlock()
    
    now := time.Now()
    for key, entry := range c.entries {
        if now.After(entry.Expiry) {
            delete(c.entries, key)
        }
    }
}
```

#### 2. LRU（Least Recently Used）

```go
type LRUCache struct {
    capacity int
    cache    map[string]*list.Element
    list     *list.List
    mu       sync.Mutex
}

type entry struct {
    key   string
    value string
}

func NewLRUCache(capacity int) *LRUCache {
    return &LRUCache{
        capacity: capacity,
        cache:    make(map[string]*list.Element),
        list:     list.New(),
    }
}

func (c *LRUCache) Get(key string) (string, bool) {
    c.mu.Lock()
    defer c.mu.Unlock()
    
    if elem, ok := c.cache[key]; ok {
        // 移到最前面
        c.list.MoveToFront(elem)
        return elem.Value.(*entry).value, true
    }
    
    return "", false
}

func (c *LRUCache) Set(key, value string) {
    c.mu.Lock()
    defer c.mu.Unlock()
    
    if elem, ok := c.cache[key]; ok {
        c.list.MoveToFront(elem)
        elem.Value.(*entry).value = value
        return
    }
    
    elem := c.list.PushFront(&entry{key, value})
    c.cache[key] = elem
    
    if c.list.Len() > c.capacity {
        // 移除最久未使用的
        oldest := c.list.Back()
        if oldest != nil {
            c.list.Remove(oldest)
            delete(c.cache, oldest.Value.(*entry).key)
        }
    }
}
```

#### 3. 基於內容變更

某些情況下，快取需要在內容更新時失效：

```go
type ContentBasedCache struct {
    cache        map[string]*CacheEntry
    dependencies map[string][]string // 文檔ID → 快取鍵列表
    mu           sync.RWMutex
}

// 當文檔更新時，使相關快取失效
func (c *ContentBasedCache) InvalidateByDocument(docID string) {
    c.mu.Lock()
    defer c.mu.Unlock()
    
    cacheKeys, ok := c.dependencies[docID]
    if !ok {
        return
    }
    
    for _, key := range cacheKeys {
        delete(c.cache, key)
    }
    
    delete(c.dependencies, docID)
}

// 添加快取時記錄依賴
func (c *ContentBasedCache) Set(
    key string,
    value string,
    relatedDocs []string,
) {
    c.mu.Lock()
    defer c.mu.Unlock()
    
    c.cache[key] = &CacheEntry{Value: value}
    
    // 記錄依賴關係
    for _, docID := range relatedDocs {
        c.dependencies[docID] = append(c.dependencies[docID], key)
    }
}
```

### 快取粒度設計

#### 1. 請求級快取

快取完整的 LLM 請求和回應。

```go
type RequestKey struct {
    Model       string
    Messages    string // JSON 序列化
    Temperature float32
    MaxTokens   int
}

func (rk RequestKey) Hash() string {
    data := fmt.Sprintf("%s:%s:%.2f:%d",
        rk.Model, rk.Messages, rk.Temperature, rk.MaxTokens)
    hash := sha256.Sum256([]byte(data))
    return hex.EncodeToString(hash[:])
}
```

**注意**：Temperature > 0 時回應隨機性高，不適合快取。

#### 2. Prompt 級快取

只快取 Prompt，忽略其他參數。

```go
func PromptKey(messages []Message) string {
    var sb strings.Builder
    for _, msg := range messages {
        sb.WriteString(msg.Role)
        sb.WriteString(":")
        sb.WriteString(msg.Content)
        sb.WriteString(";")
    }
    return hash(sb.String())
}
```

**適用**：參數變化不大的場景。

#### 3. 部分結果快取

快取中間結果，如 RAG 中的檢索結果。

```go
type RAGCache struct {
    retrievalCache map[string][]Document // 快取檢索結果
    responseCache  map[string]string     // 快取最終回應
}

func (rc *RAGCache) GetOrRetrieve(
    query string,
) ([]Document, bool) {
    docs, ok := rc.retrievalCache[query]
    return docs, ok
}
```

## 程式碼範例

完整的多層快取實現：

```go
package llmcache

import (
    "context"
    "sync"
    "time"
)

// CacheManager 快取管理器
type CacheManager struct {
    localCache    *LocalCache
    redisCache    *RedisCache
    semanticCache *SemanticCache
    llmClient     *LLMClient
    metrics       *Metrics
}

func NewCacheManager(config Config) *CacheManager {
    return &CacheManager{
        localCache:    NewLocalCache(config.LocalCacheSize),
        redisCache:    NewRedisCache(config.RedisAddr),
        semanticCache: NewSemanticCache(config.VectorDB, config.EmbeddingClient),
        llmClient:     NewLLMClient(config.APIKey),
        metrics:       NewMetrics(),
    }
}

// GetOrGenerate 獲取或生成回應
func (cm *CacheManager) GetOrGenerate(
    ctx context.Context,
    req Request,
) (*Response, error) {
    startTime := time.Now()
    
    promptKey := cm.generateKey(req)
    
    // 1. 嘗試本地快取
    if response, ok := cm.localCache.Get(promptKey); ok {
        cm.metrics.RecordCacheHit("local", time.Since(startTime))
        return &Response{Content: response, Source: "cache-local"}, nil
    }
    
    // 2. 嘗試 Redis 快取
    if response, ok := cm.redisCache.Get(ctx, promptKey); ok {
        cm.metrics.RecordCacheHit("redis", time.Since(startTime))
        // 回填本地快取
        cm.localCache.Set(promptKey, response)
        return &Response{Content: response, Source: "cache-redis"}, nil
    }
    
    // 3. 嘗試語義快取
    entry, ok := cm.semanticCache.Get(ctx, req.Prompt)
    if ok {
        cm.metrics.RecordCacheHit("semantic", time.Since(startTime))
        // 回填其他快取
        cm.localCache.Set(promptKey, entry.Response)
        cm.redisCache.Set(ctx, promptKey, entry.Response, 1*time.Hour)
        return &Response{Content: entry.Response, Source: "cache-semantic"}, nil
    }
    
    // 4. 快取未命中，調用 LLM
    cm.metrics.RecordCacheMiss()
    
    response, err := cm.llmClient.Generate(ctx, req)
    if err != nil {
        return nil, err
    }
    
    // 5. 寫入所有快取層級
    cm.cacheResponse(ctx, promptKey, req.Prompt, response.Content)
    
    cm.metrics.RecordLLMCall(time.Since(startTime), response.Tokens)
    
    return &Response{Content: response.Content, Source: "llm"}, nil
}

func (cm *CacheManager) cacheResponse(
    ctx context.Context,
    key, prompt, response string,
) {
    // 並發寫入多個快取
    var wg sync.WaitGroup
    
    wg.Add(3)
    
    go func() {
        defer wg.Done()
        cm.localCache.Set(key, response)
    }()
    
    go func() {
        defer wg.Done()
        cm.redisCache.Set(ctx, key, response, 1*time.Hour)
    }()
    
    go func() {
        defer wg.Done()
        cm.semanticCache.Set(ctx, prompt, response)
    }()
    
    wg.Wait()
}

func (cm *CacheManager) generateKey(req Request) string {
    // 簡化的鍵生成（實際應包含更多參數）
    return hash(req.Prompt + req.Model)
}

// GetMetrics 獲取快取指標
func (cm *CacheManager) GetMetrics() *MetricsData {
    return cm.metrics.GetData()
}
```

## 常見面試問題

### 1. LLM 快取和普通快取有什麼不同？

**答案要點**：
- **不確定性**：Temperature > 0 時回應隨機，不適合快取
- **語義相似**：需要語義快取處理相似查詢
- **成本考量**：LLM 成本高，快取節省明顯
- **時效性**：某些回應需要即時資訊，快取時間較短

### 2. 如何設計語義快取的相似度閾值？

**答案要點**：
- **0.99+**：接近精確匹配，高精度低命中率
- **0.95-0.98**：平衡點，推薦值
- **0.90-0.94**：高命中率但可能不夠精確
- **動態調整**：根據用戶回饋和業務需求調整

### 3. 多層快取的回填策略是什麼？為什麼需要？

**答案要點**：
- **定義**：L2 命中時，回填 L1；L3 命中時，回填 L1 和 L2
- **原因**：提升後續請求的命中速度
- **權衡**：增加寫入開銷，但顯著提升讀取效能
- **選擇性回填**：只對高相似度結果回填

### 4. 如何評估快取策略的效果？

**答案要點**：
- **命中率**：命中次數 / 總請求數
- **成本節省**：節省的 API 調用費用
- **延遲降低**：P50、P95、P99 延遲對比
- **錯誤率**：快取回應的準確性
- **分層命中率**：各層級的命中率分佈

### 5. 什麼情況下不應該使用快取？

**答案要點**：
- **高隨機性**：Temperature > 0.7
- **即時資訊**：需要最新資料（天氣、新聞）
- **個性化**：每個用戶回應不同
- **敏感資訊**：安全性要求高
- **低頻查詢**：命中率太低，維護成本高

## 總結

LLM 快取策略設計需要考慮：

1. **快取類型**：精確快取、語義快取、混合快取
2. **多層架構**：內存、Redis、向量資料庫
3. **失效策略**：TTL、LRU、基於內容
4. **監控指標**：命中率、成本節省、延遲
5. **權衡取捨**：速度 vs 準確性、成本 vs 複雜度

合理的快取策略可以節省 50-80% 的成本，提升 100-500 倍的效能。

## 延伸閱讀

- [OpenAI Caching Best Practices](https://platform.openai.com/docs/guides/production-best-practices/caching)
- [Redis Caching Strategies](https://redis.io/docs/manual/patterns/)
- [Semantic Caching with Vector Databases](https://www.pinecone.io/learn/semantic-caching/)
