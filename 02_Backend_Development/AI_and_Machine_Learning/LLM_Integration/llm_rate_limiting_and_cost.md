# LLM 的限流與成本控制

- **難度**: 6
- **標籤**: `限流`, `成本優化`, `配額管理`, `LLM`

## 問題詳述

LLM API 調用成本高昂，且大多數供應商都有嚴格的速率限制。有效的限流和成本控制策略不僅能避免超出配額導致服務中斷，還能顯著降低運營成本。本文將深入探討 LLM 的限流機制、成本計算方法和優化策略。

## 核心理論與詳解

### LLM API 的速率限制

#### 1. 限制類型

**OpenAI 速率限制（2024）**：

| 層級 | RPM (每分鐘請求) | TPM (每分鐘Token) | RPD (每日請求) |
|------|-----------------|------------------|---------------|
| Free | 3 | 40,000 | 200 |
| Pay-as-you-go (Tier 1) | 500 | 80,000 | - |
| Pay-as-you-go (Tier 5) | 10,000 | 30,000,000 | - |

**Anthropic Claude 速率限制**：

| 模型 | RPM | TPM |
|------|-----|-----|
| Claude 3 Opus | 40 | 80,000 |
| Claude 3 Sonnet | 1,000 | 80,000 |
| Claude 3 Haiku | 1,000 | 100,000 |

**多維度限制**：
- **RPM**（Requests Per Minute）：每分鐘請求數
- **TPM**（Tokens Per Minute）：每分鐘 Token 數
- **TPD**（Tokens Per Day）：每日 Token 數
- **併發數**：同時進行的請求數

#### 2. 速率限制檢測

**從 HTTP 標頭獲取資訊**：

```go
type RateLimitInfo struct {
    RequestsLimit     int       // 總限制
    RequestsRemaining int       // 剩餘請求數
    RequestsReset     time.Time // 重置時間
    TokensLimit       int
    TokensRemaining   int
    TokensReset       time.Time
}

func ParseRateLimitHeaders(headers http.Header) *RateLimitInfo {
    info := &RateLimitInfo{}
    
    // OpenAI 標頭格式
    if val := headers.Get("x-ratelimit-limit-requests"); val != "" {
        info.RequestsLimit, _ = strconv.Atoi(val)
    }
    if val := headers.Get("x-ratelimit-remaining-requests"); val != "" {
        info.RequestsRemaining, _ = strconv.Atoi(val)
    }
    if val := headers.Get("x-ratelimit-reset-requests"); val != "" {
        // 解析時間戳
        resetSec, _ := strconv.ParseInt(val, 10, 64)
        info.RequestsReset = time.Unix(resetSec, 0)
    }
    
    // Token 限制
    if val := headers.Get("x-ratelimit-limit-tokens"); val != "" {
        info.TokensLimit, _ = strconv.Atoi(val)
    }
    if val := headers.Get("x-ratelimit-remaining-tokens"); val != "" {
        info.TokensRemaining, _ = strconv.Atoi(val)
    }
    
    return info
}
```

**處理 429 錯誤**：

```go
func HandleRateLimitError(err error, headers http.Header) time.Duration {
    if !isRateLimitError(err) {
        return 0
    }
    
    // 1. 檢查 Retry-After 標頭
    if retryAfter := headers.Get("Retry-After"); retryAfter != "" {
        if seconds, err := strconv.Atoi(retryAfter); err == nil {
            return time.Duration(seconds) * time.Second
        }
    }
    
    // 2. 檢查 x-ratelimit-reset
    info := ParseRateLimitHeaders(headers)
    if !info.RequestsReset.IsZero() {
        waitTime := time.Until(info.RequestsReset)
        if waitTime > 0 {
            return waitTime
        }
    }
    
    // 3. 默認指數退避
    return time.Minute
}
```

### 客戶端限流策略

#### 1. Token Bucket 算法

**原理**：以固定速率向桶中添加 Token，請求消耗 Token。

```go
type TokenBucket struct {
    capacity      int           // 桶容量
    tokens        int           // 當前 Token 數
    refillRate    int           // 每秒補充速率
    lastRefill    time.Time
    mu            sync.Mutex
}

func NewTokenBucket(capacity, refillRate int) *TokenBucket {
    return &TokenBucket{
        capacity:   capacity,
        tokens:     capacity,
        refillRate: refillRate,
        lastRefill: time.Now(),
    }
}

func (tb *TokenBucket) Allow(cost int) bool {
    tb.mu.Lock()
    defer tb.mu.Unlock()
    
    // 補充 Token
    tb.refill()
    
    // 檢查是否足夠
    if tb.tokens >= cost {
        tb.tokens -= cost
        return true
    }
    
    return false
}

func (tb *TokenBucket) refill() {
    now := time.Now()
    elapsed := now.Sub(tb.lastRefill)
    
    // 計算應補充的 Token 數
    tokensToAdd := int(elapsed.Seconds()) * tb.refillRate
    
    if tokensToAdd > 0 {
        tb.tokens += tokensToAdd
        if tb.tokens > tb.capacity {
            tb.tokens = tb.capacity
        }
        tb.lastRefill = now
    }
}

func (tb *TokenBucket) WaitForTokens(cost int) error {
    for {
        if tb.Allow(cost) {
            return nil
        }
        
        // 計算需要等待的時間
        tb.mu.Lock()
        needed := cost - tb.tokens
        waitTime := time.Duration(needed/tb.refillRate) * time.Second
        tb.mu.Unlock()
        
        time.Sleep(waitTime)
    }
}
```

**使用範例**：

```go
// RPM 限制：每分鐘 500 請求
requestBucket := NewTokenBucket(500, 500/60) // 每秒約 8.3 個

// TPM 限制：每分鐘 80,000 tokens
tokenBucket := NewTokenBucket(80000, 80000/60) // 每秒約 1333 個

func MakeRequest(req ChatCompletionRequest) (*Response, error) {
    // 1. 檢查請求限制
    if !requestBucket.Allow(1) {
        return nil, errors.New("request rate limit exceeded")
    }
    
    // 2. 估算 Token 消耗
    estimatedTokens := EstimateTokens(req)
    if !tokenBucket.Allow(estimatedTokens) {
        return nil, errors.New("token rate limit exceeded")
    }
    
    // 3. 發送請求
    resp, err := llmClient.ChatCompletion(context.Background(), req)
    if err != nil {
        // 如果失敗，返還 Token
        tokenBucket.tokens += estimatedTokens
        return nil, err
    }
    
    // 4. 根據實際使用調整
    actualTokens := resp.Usage.TotalTokens
    difference := actualTokens - estimatedTokens
    if difference != 0 {
        tokenBucket.mu.Lock()
        tokenBucket.tokens -= difference
        tokenBucket.mu.Unlock()
    }
    
    return resp, nil
}
```

#### 2. 滑動窗口限流

**原理**：記錄時間窗口內的請求次數。

```go
type SlidingWindowLimiter struct {
    requests  []time.Time
    limit     int
    window    time.Duration
    mu        sync.Mutex
}

func NewSlidingWindowLimiter(limit int, window time.Duration) *SlidingWindowLimiter {
    return &SlidingWindowLimiter{
        requests: make([]time.Time, 0),
        limit:    limit,
        window:   window,
    }
}

func (swl *SlidingWindowLimiter) Allow() bool {
    swl.mu.Lock()
    defer swl.mu.Unlock()
    
    now := time.Now()
    cutoff := now.Add(-swl.window)
    
    // 移除過期的請求記錄
    i := 0
    for i < len(swl.requests) && swl.requests[i].Before(cutoff) {
        i++
    }
    swl.requests = swl.requests[i:]
    
    // 檢查是否超限
    if len(swl.requests) >= swl.limit {
        return false
    }
    
    // 記錄當前請求
    swl.requests = append(swl.requests, now)
    return true
}

func (swl *SlidingWindowLimiter) Wait() time.Duration {
    swl.mu.Lock()
    defer swl.mu.Unlock()
    
    if len(swl.requests) < swl.limit {
        return 0
    }
    
    // 計算最早的請求何時過期
    oldest := swl.requests[0]
    resetTime := oldest.Add(swl.window)
    return time.Until(resetTime)
}
```

#### 3. 多層限流器

結合不同維度的限流。

```go
type MultiDimensionLimiter struct {
    requestLimiter *TokenBucket        // RPM
    tokenLimiter   *TokenBucket        // TPM
    dailyLimiter   *SlidingWindowLimiter // RPD
    concurrency    chan struct{}       // 併發限制
}

func NewMultiDimensionLimiter(config LimitConfig) *MultiDimensionLimiter {
    return &MultiDimensionLimiter{
        requestLimiter: NewTokenBucket(config.RPM, config.RPM/60),
        tokenLimiter:   NewTokenBucket(config.TPM, config.TPM/60),
        dailyLimiter:   NewSlidingWindowLimiter(config.RPD, 24*time.Hour),
        concurrency:    make(chan struct{}, config.MaxConcurrency),
    }
}

func (mdl *MultiDimensionLimiter) Acquire(tokens int) error {
    // 1. 獲取併發槽位
    select {
    case mdl.concurrency <- struct{}{}:
    case <-time.After(10 * time.Second):
        return errors.New("concurrency limit timeout")
    }
    
    // 2. 檢查每日限制
    if !mdl.dailyLimiter.Allow() {
        <-mdl.concurrency
        waitTime := mdl.dailyLimiter.Wait()
        return fmt.Errorf("daily limit exceeded, reset in %v", waitTime)
    }
    
    // 3. 檢查 RPM
    if !mdl.requestLimiter.Allow(1) {
        <-mdl.concurrency
        return errors.New("RPM limit exceeded")
    }
    
    // 4. 檢查 TPM
    if !mdl.tokenLimiter.Allow(tokens) {
        <-mdl.concurrency
        return errors.New("TPM limit exceeded")
    }
    
    return nil
}

func (mdl *MultiDimensionLimiter) Release() {
    <-mdl.concurrency
}
```

### 成本計算與優化

#### 1. 成本計算

**OpenAI 定價（2024）**：

| 模型 | 輸入 ($/1M tokens) | 輸出 ($/1M tokens) |
|------|-------------------|-------------------|
| GPT-4 Turbo | $10 | $30 |
| GPT-4 | $30 | $60 |
| GPT-3.5 Turbo | $0.50 | $1.50 |

**成本計算器**：

```go
type CostCalculator struct {
    prices map[string]ModelPrice
}

type ModelPrice struct {
    InputPrice  float64 // 每 1M tokens 的價格
    OutputPrice float64
}

func NewCostCalculator() *CostCalculator {
    return &CostCalculator{
        prices: map[string]ModelPrice{
            "gpt-4-turbo": {10.0, 30.0},
            "gpt-4":       {30.0, 60.0},
            "gpt-3.5-turbo": {0.50, 1.50},
            "claude-3-opus": {15.0, 75.0},
            "claude-3-sonnet": {3.0, 15.0},
            "claude-3-haiku": {0.25, 1.25},
        },
    }
}

func (cc *CostCalculator) CalculateCost(
    model string,
    inputTokens, outputTokens int,
) float64 {
    price, ok := cc.prices[model]
    if !ok {
        return 0
    }
    
    inputCost := float64(inputTokens) / 1_000_000 * price.InputPrice
    outputCost := float64(outputTokens) / 1_000_000 * price.OutputPrice
    
    return inputCost + outputCost
}

// 估算每月成本
func (cc *CostCalculator) EstimateMonthlyCoast(
    model string,
    avgInputTokens, avgOutputTokens int,
    requestsPerDay int,
) float64 {
    costPerRequest := cc.CalculateCost(model, avgInputTokens, avgOutputTokens)
    dailyCost := costPerRequest * float64(requestsPerDay)
    monthlyCost := dailyCost * 30
    
    return monthlyCost
}
```

**實際使用追蹤**：

```go
type CostTracker struct {
    db       *sql.DB
    calc     *CostCalculator
    mu       sync.Mutex
    dailyCost float64
}

func (ct *CostTracker) TrackUsage(
    userID, model string,
    usage Usage,
) error {
    cost := ct.calc.CalculateCost(model, usage.PromptTokens, usage.CompletionTokens)
    
    ct.mu.Lock()
    ct.dailyCost += cost
    ct.mu.Unlock()
    
    // 記錄到資料庫
    _, err := ct.db.Exec(`
        INSERT INTO llm_usage (user_id, model, prompt_tokens, completion_tokens, cost, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
    `, userID, model, usage.PromptTokens, usage.CompletionTokens, cost)
    
    return err
}

func (ct *CostTracker) GetDailyCost() float64 {
    ct.mu.Lock()
    defer ct.mu.Unlock()
    return ct.dailyCost
}

// 按用戶查詢成本
func (ct *CostTracker) GetUserCost(userID string, period time.Duration) (float64, error) {
    var totalCost float64
    
    err := ct.db.QueryRow(`
        SELECT COALESCE(SUM(cost), 0)
        FROM llm_usage
        WHERE user_id = $1 AND created_at > NOW() - $2
    `, userID, period).Scan(&totalCost)
    
    return totalCost, err
}
```

#### 2. 成本優化策略

**策略 1：智能模型選擇**

```go
type ModelSelector struct {
    costCalc *CostCalculator
}

func (ms *ModelSelector) SelectModel(
    complexity float64,
    budget float64,
) string {
    // 複雜度評分 0-1
    if complexity < 0.3 {
        return "gpt-3.5-turbo" // 簡單任務
    } else if complexity < 0.7 {
        return "gpt-4-turbo"   // 中等任務
    } else {
        // 檢查預算
        if budget > 0.01 {
            return "gpt-4"     // 複雜任務，有預算
        }
        return "gpt-4-turbo"   // 複雜任務，預算有限
    }
}

func EvaluateComplexity(prompt string) float64 {
    complexity := 0.0
    
    // 因素 1：長度
    if len(prompt) > 1000 {
        complexity += 0.2
    }
    
    // 因素 2：關鍵詞
    complexKeywords := []string{"分析", "比較", "設計", "優化", "為什麼"}
    for _, keyword := range complexKeywords {
        if strings.Contains(prompt, keyword) {
            complexity += 0.15
            break
        }
    }
    
    // 因素 3：多步驟
    if strings.Count(prompt, "\n") > 5 {
        complexity += 0.2
    }
    
    // 因素 4：代碼生成
    if strings.Contains(prompt, "代碼") || strings.Contains(prompt, "程式") {
        complexity += 0.25
    }
    
    return math.Min(complexity, 1.0)
}
```

**策略 2：Prompt 優化**

```go
type PromptOptimizer struct{}

// 減少不必要的上下文
func (po *PromptOptimizer) OptimizePrompt(prompt string, maxTokens int) string {
    tokens := CountTokens(prompt)
    
    if tokens <= maxTokens {
        return prompt
    }
    
    // 1. 移除多餘空白
    prompt = regexp.MustCompile(`\s+`).ReplaceAllString(prompt, " ")
    
    // 2. 截斷長範例
    prompt = po.truncateExamples(prompt, maxTokens)
    
    // 3. 使用更簡潔的指令
    prompt = po.simplifyInstructions(prompt)
    
    return prompt
}

func (po *PromptOptimizer) truncateExamples(prompt string, maxTokens int) string {
    // 如果包含範例，限制範例數量
    if strings.Contains(prompt, "範例：") {
        // 只保留前 3 個範例
        lines := strings.Split(prompt, "\n")
        exampleCount := 0
        result := make([]string, 0)
        
        for _, line := range lines {
            if strings.HasPrefix(line, "範例") {
                exampleCount++
                if exampleCount > 3 {
                    continue
                }
            }
            result = append(result, line)
        }
        
        return strings.Join(result, "\n")
    }
    
    return prompt
}
```

**策略 3：批次處理**

```go
type BatchProcessor struct {
    llmClient *LLMClient
    batchSize int
    maxWait   time.Duration
}

func (bp *BatchProcessor) ProcessBatch(requests []Request) ([]Response, error) {
    // 合併多個請求到一個 Prompt
    combinedPrompt := bp.combineRequests(requests)
    
    // 單次 API 調用
    response, err := bp.llmClient.Generate(context.Background(), combinedPrompt)
    if err != nil {
        return nil, err
    }
    
    // 拆分回應
    responses := bp.splitResponse(response.Content, len(requests))
    
    return responses, nil
}

func (bp *BatchProcessor) combineRequests(requests []Request) string {
    var sb strings.Builder
    
    sb.WriteString("請按順序回答以下問題，用 '---' 分隔每個答案：\n\n")
    
    for i, req := range requests {
        sb.WriteString(fmt.Sprintf("問題 %d: %s\n\n", i+1, req.Question))
    }
    
    return sb.String()
}
```

**策略 4：用戶配額管理**

```go
type QuotaManager struct {
    db *sql.DB
}

type UserQuota struct {
    UserID       string
    DailyLimit   int     // 每日請求限制
    MonthlyBudget float64 // 每月預算（美元）
    UsedToday    int
    UsedThisMonth float64
}

func (qm *QuotaManager) CheckQuota(userID string) (bool, error) {
    quota, err := qm.GetUserQuota(userID)
    if err != nil {
        return false, err
    }
    
    // 檢查每日限制
    if quota.UsedToday >= quota.DailyLimit {
        return false, errors.New("daily request limit exceeded")
    }
    
    // 檢查每月預算
    if quota.UsedThisMonth >= quota.MonthlyBudget {
        return false, errors.New("monthly budget exceeded")
    }
    
    return true, nil
}

func (qm *QuotaManager) ConsumeQuota(
    userID string,
    cost float64,
) error {
    _, err := qm.db.Exec(`
        UPDATE user_quotas
        SET used_today = used_today + 1,
            used_this_month = used_this_month + $2
        WHERE user_id = $1
    `, userID, cost)
    
    return err
}

// 每日重置
func (qm *QuotaManager) ResetDailyQuotas() error {
    _, err := qm.db.Exec(`
        UPDATE user_quotas
        SET used_today = 0
        WHERE DATE(last_reset) < CURRENT_DATE
    `)
    return err
}
```

### 監控與告警

```go
type CostMonitor struct {
    tracker   *CostTracker
    alerter   *Alerter
    thresholds map[string]float64
}

func (cm *CostMonitor) StartMonitoring() {
    ticker := time.NewTicker(5 * time.Minute)
    
    go func() {
        for range ticker.C {
            cm.checkThresholds()
        }
    }()
}

func (cm *CostMonitor) checkThresholds() {
    dailyCost := cm.tracker.GetDailyCost()
    
    // 檢查各級閾值
    for level, threshold := range cm.thresholds {
        if dailyCost >= threshold {
            cm.alerter.Send(Alert{
                Level:   level,
                Message: fmt.Sprintf("Daily cost reached $%.2f (threshold: $%.2f)", dailyCost, threshold),
                Metric:  "llm_daily_cost",
                Value:   dailyCost,
            })
        }
    }
}

// Prometheus 指標
var (
    llmCostGauge = prometheus.NewGauge(prometheus.GaugeOpts{
        Name: "llm_cost_usd",
        Help: "Current LLM cost in USD",
    })
    
    llmTokensCounter = prometheus.NewCounterVec(prometheus.CounterOpts{
        Name: "llm_tokens_total",
        Help: "Total LLM tokens used",
    }, []string{"type", "model"})
)

func TrackMetrics(model string, usage Usage, cost float64) {
    llmCostGauge.Add(cost)
    llmTokensCounter.WithLabelValues("input", model).Add(float64(usage.PromptTokens))
    llmTokensCounter.WithLabelValues("output", model).Add(float64(usage.CompletionTokens))
}
```

## 常見面試問題

### 1. 如何處理 LLM API 的速率限制？

**答案要點**：
- **客戶端限流**：Token Bucket、滑動窗口
- **多維度限制**：RPM、TPM、RPD、併發數
- **錯誤處理**：解析 429 錯誤、Retry-After
- **動態調整**：根據剩餘配額調整請求速率

### 2. 如何估算和控制 LLM 的成本？

**答案要點**：
- **成本計算**：輸入 tokens × 單價 + 輸出 tokens × 單價
- **追蹤記錄**：記錄每次調用的成本到資料庫
- **配額管理**：為用戶設置每日/每月限額
- **成本監控**：實時監控、設置告警閾值

### 3. 有哪些降低 LLM 成本的方法？

**答案要點**：
- **智能模型選擇**：簡單任務用小模型
- **Prompt 優化**：減少不必要的上下文
- **快取策略**：語義快取、精確快取
- **批次處理**：合併多個請求
- **用戶限額**：防止濫用

### 4. 如何設計多租戶的限流和配額系統？

**答案要點**：
- **租戶隔離**：每個租戶獨立的限流器和配額
- **分級定價**：不同套餐不同限制
- **公平性**：使用優先級隊列防止單一用戶佔用
- **彈性配額**：允許短期超限，長期平均

### 5. Token Bucket 和滑動窗口有什麼區別？

**答案要點**：

| 特性 | Token Bucket | 滑動窗口 |
|------|-------------|---------|
| 原理 | 固定速率補充Token | 記錄時間窗口內請求 |
| 突發處理 | 允許（桶滿時） | 不允許 |
| 內存佔用 | 低（只記錄當前Token數） | 高（記錄所有請求） |
| 實現複雜度 | 簡單 | 中等 |
| 適用場景 | TPM 限制 | RPM、RPD 限制 |

## 總結

LLM 的限流與成本控制需要：

1. **多維度限流**：RPM、TPM、RPD、併發數
2. **成本追蹤**：記錄每次調用、按用戶統計
3. **優化策略**：模型選擇、Prompt 優化、快取、批次
4. **配額管理**：用戶限額、租戶隔離
5. **監控告警**：實時監控、閾值告警

合理的限流和成本控制可以在保證服務質量的同時，節省 50-80% 的 API 成本。

## 延伸閱讀

- [OpenAI Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
- [Anthropic Rate Limits](https://docs.anthropic.com/claude/reference/rate-limits)
- [Token Bucket Algorithm](https://en.wikipedia.org/wiki/Token_bucket)
