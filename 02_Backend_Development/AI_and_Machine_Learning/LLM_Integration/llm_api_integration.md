# LLM API 整合與最佳實踐

- **難度**: 5
- **標籤**: `LLM`, `API整合`, `OpenAI`, `最佳實踐`

## 問題詳述

將 LLM 整合到生產環境的後端系統中，需要考慮 API 設計、錯誤處理、重試機制、串流回應、併發控制等多個層面。本文將深入探討如何正確且高效地整合 LLM API，包括 OpenAI、Anthropic Claude 等主流服務，以及開源模型的部署方案。

## 核心理論與詳解

### LLM API 的基本架構

#### 1. 主流 LLM API 提供商

| 提供商 | 模型 | API 類型 | 特點 |
|--------|------|---------|------|
| **OpenAI** | GPT-4, GPT-3.5-turbo | RESTful | 生態完善、文檔詳細 |
| **Anthropic** | Claude 3 (Opus/Sonnet/Haiku) | RESTful | 長上下文、安全性高 |
| **Google** | Gemini Pro/Ultra | RESTful | 多模態、整合 Google 服務 |
| **Cohere** | Command, Embed | RESTful | 企業級、可定制 |
| **自建** | Llama 3, Mistral, Qwen | HTTP/gRPC | 數據隱私、無 API 費用 |

#### 2. API 端點類型

**Chat Completions（聊天補全）**：
```
POST https://api.openai.com/v1/chat/completions
```
- 用途：對話、問答、指令執行
- 支援多輪對話
- 最常用的端點

**Completions（文本補全）**：
```
POST https://api.openai.com/v1/completions
```
- 用途：續寫文本、代碼補全
- 較舊的 API，逐漸被 Chat Completions 取代

**Embeddings（嵌入）**：
```
POST https://api.openai.com/v1/embeddings
```
- 用途：將文本轉換為向量
- RAG 系統的核心

**Fine-tuning（微調）**：
```
POST https://api.openai.com/v1/fine_tuning/jobs
```
- 用途：在特定數據上微調模型
- 成本較高但效果定制化

### OpenAI Chat Completions API 詳解

#### 基本請求結構

```go
type ChatCompletionRequest struct {
    Model            string            `json:"model"`
    Messages         []Message         `json:"messages"`
    Temperature      *float32          `json:"temperature,omitempty"`      // 0-2
    TopP             *float32          `json:"top_p,omitempty"`           // 0-1
    N                *int              `json:"n,omitempty"`               // 生成數量
    Stream           *bool             `json:"stream,omitempty"`          // 串流回應
    Stop             []string          `json:"stop,omitempty"`            // 停止序列
    MaxTokens        *int              `json:"max_tokens,omitempty"`      // 最大 Token
    PresencePenalty  *float32          `json:"presence_penalty,omitempty"` // -2 to 2
    FrequencyPenalty *float32          `json:"frequency_penalty,omitempty"` // -2 to 2
    LogitBias        map[string]int    `json:"logit_bias,omitempty"`     // Token 權重
    User             string            `json:"user,omitempty"`            // 用戶標識
    ResponseFormat   *ResponseFormat   `json:"response_format,omitempty"` // JSON mode
    Tools            []Tool            `json:"tools,omitempty"`           // Function Calling
    ToolChoice       interface{}       `json:"tool_choice,omitempty"`
}

type Message struct {
    Role    string `json:"role"`    // system, user, assistant, tool
    Content string `json:"content"`
    Name    string `json:"name,omitempty"`
    ToolCallID string `json:"tool_call_id,omitempty"`
}

type ResponseFormat struct {
    Type string `json:"type"` // "text" or "json_object"
}
```

#### 關鍵參數詳解

**Temperature（溫度）**：
- 範圍：0-2
- 作用：控制生成的隨機性
- **0**：確定性輸出，適合事實查詢、分類
- **0.7**：平衡創造性和一致性，適合一般對話
- **1.0**：較高創造性，適合內容創作
- **1.5-2.0**：非常隨機，適合腦力激盪

**Top-P（核心採樣）**：
- 範圍：0-1
- 作用：從累計概率前 P% 的 Token 中採樣
- **0.1**：只考慮最可能的 Token
- **0.9**：考慮更廣泛的選擇（推薦值）
- 通常與 Temperature 二選一使用

**Max Tokens**：
- 限制輸出的最大 Token 數
- 用於成本控制和避免過長回應
- 公式：`max_tokens = 預期輸出長度 × 1.3`（留緩衝）

**Presence Penalty & Frequency Penalty**：
- 範圍：-2 到 2
- **Presence Penalty**：懲罰已出現的 Token，鼓勵新話題
- **Frequency Penalty**：根據出現頻率懲罰，減少重複
- 正值減少重複，負值增加重複

#### 消息角色（Message Roles）

```go
// System Message：設定助手行為
systemMsg := Message{
    Role:    "system",
    Content: "你是一位專業的後端工程師，擅長解釋複雜的技術概念。",
}

// User Message：用戶輸入
userMsg := Message{
    Role:    "user",
    Content: "解釋什麼是微服務架構？",
}

// Assistant Message：模型回應（用於多輪對話）
assistantMsg := Message{
    Role:    "assistant",
    Content: "微服務架構是一種將應用程序構建為一組小型服務的方法...",
}

// Tool Message：工具執行結果（Function Calling）
toolMsg := Message{
    Role:       "tool",
    Content:    `{"temperature": 28, "unit": "celsius"}`,
    ToolCallID: "call_abc123",
}
```

### 完整的 API 客戶端實現

```go
package llm

import (
    "bytes"
    "context"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "time"
)

// Client LLM API 客戶端
type Client struct {
    apiKey     string
    baseURL    string
    httpClient *http.Client
    retryConfig RetryConfig
}

type RetryConfig struct {
    MaxRetries     int
    InitialBackoff time.Duration
    MaxBackoff     time.Duration
}

// NewClient 創建新的 LLM 客戶端
func NewClient(apiKey string, opts ...Option) *Client {
    c := &Client{
        apiKey:  apiKey,
        baseURL: "https://api.openai.com/v1",
        httpClient: &http.Client{
            Timeout: 60 * time.Second,
        },
        retryConfig: RetryConfig{
            MaxRetries:     3,
            InitialBackoff: 1 * time.Second,
            MaxBackoff:     16 * time.Second,
        },
    }
    
    for _, opt := range opts {
        opt(c)
    }
    
    return c
}

// Option 配置選項
type Option func(*Client)

func WithBaseURL(url string) Option {
    return func(c *Client) {
        c.baseURL = url
    }
}

func WithTimeout(timeout time.Duration) Option {
    return func(c *Client) {
        c.httpClient.Timeout = timeout
    }
}

func WithRetryConfig(config RetryConfig) Option {
    return func(c *Client) {
        c.retryConfig = config
    }
}

// ChatCompletion 發送聊天請求
func (c *Client) ChatCompletion(
    ctx context.Context,
    req ChatCompletionRequest,
) (*ChatCompletionResponse, error) {
    // 使用重試機制
    return c.chatCompletionWithRetry(ctx, req)
}

// chatCompletionWithRetry 帶重試的請求
func (c *Client) chatCompletionWithRetry(
    ctx context.Context,
    req ChatCompletionRequest,
) (*ChatCompletionResponse, error) {
    var lastErr error
    backoff := c.retryConfig.InitialBackoff
    
    for attempt := 0; attempt <= c.retryConfig.MaxRetries; attempt++ {
        if attempt > 0 {
            // 等待退避時間
            select {
            case <-time.After(backoff):
            case <-ctx.Done():
                return nil, ctx.Err()
            }
            
            // 指數退避
            backoff *= 2
            if backoff > c.retryConfig.MaxBackoff {
                backoff = c.retryConfig.MaxBackoff
            }
        }
        
        resp, err := c.doRequest(ctx, req)
        if err == nil {
            return resp, nil
        }
        
        lastErr = err
        
        // 判斷是否應該重試
        if !c.shouldRetry(err) {
            break
        }
    }
    
    return nil, fmt.Errorf("max retries exceeded: %w", lastErr)
}

// doRequest 執行實際的 HTTP 請求
func (c *Client) doRequest(
    ctx context.Context,
    req ChatCompletionRequest,
) (*ChatCompletionResponse, error) {
    // 序列化請求
    reqBody, err := json.Marshal(req)
    if err != nil {
        return nil, fmt.Errorf("marshal request: %w", err)
    }
    
    // 創建 HTTP 請求
    httpReq, err := http.NewRequestWithContext(
        ctx,
        "POST",
        c.baseURL+"/chat/completions",
        bytes.NewReader(reqBody),
    )
    if err != nil {
        return nil, fmt.Errorf("create request: %w", err)
    }
    
    // 設置標頭
    httpReq.Header.Set("Content-Type", "application/json")
    httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)
    
    // 發送請求
    httpResp, err := c.httpClient.Do(httpReq)
    if err != nil {
        return nil, fmt.Errorf("send request: %w", err)
    }
    defer httpResp.Body.Close()
    
    // 讀取回應
    respBody, err := io.ReadAll(httpResp.Body)
    if err != nil {
        return nil, fmt.Errorf("read response: %w", err)
    }
    
    // 檢查 HTTP 狀態碼
    if httpResp.StatusCode != http.StatusOK {
        var apiErr APIError
        if err := json.Unmarshal(respBody, &apiErr); err == nil {
            return nil, &apiErr
        }
        return nil, fmt.Errorf("API error %d: %s", httpResp.StatusCode, string(respBody))
    }
    
    // 解析回應
    var resp ChatCompletionResponse
    if err := json.Unmarshal(respBody, &resp); err != nil {
        return nil, fmt.Errorf("unmarshal response: %w", err)
    }
    
    return &resp, nil
}

// shouldRetry 判斷是否應該重試
func (c *Client) shouldRetry(err error) bool {
    if err == nil {
        return false
    }
    
    // 檢查是否為可重試的錯誤
    apiErr, ok := err.(*APIError)
    if !ok {
        // 網路錯誤等，應該重試
        return true
    }
    
    // 429 (Rate Limit), 500, 502, 503, 504 應該重試
    switch apiErr.Error.Type {
    case "server_error", "rate_limit_exceeded", "timeout":
        return true
    default:
        return false
    }
}

// ChatCompletionResponse API 回應
type ChatCompletionResponse struct {
    ID      string   `json:"id"`
    Object  string   `json:"object"`
    Created int64    `json:"created"`
    Model   string   `json:"model"`
    Choices []Choice `json:"choices"`
    Usage   Usage    `json:"usage"`
}

type Choice struct {
    Index        int     `json:"index"`
    Message      Message `json:"message"`
    FinishReason string  `json:"finish_reason"` // stop, length, content_filter, tool_calls
}

type Usage struct {
    PromptTokens     int `json:"prompt_tokens"`
    CompletionTokens int `json:"completion_tokens"`
    TotalTokens      int `json:"total_tokens"`
}

// APIError API 錯誤
type APIError struct {
    Error struct {
        Message string `json:"message"`
        Type    string `json:"type"`
        Param   string `json:"param"`
        Code    string `json:"code"`
    } `json:"error"`
}

func (e *APIError) Error() string {
    return fmt.Sprintf("API error: %s (type: %s, code: %s)",
        e.Error.Message, e.Error.Type, e.Error.Code)
}
```

### 串流回應（Streaming）處理

串流回應可以逐步返回生成的內容，提升用戶體驗。

```go
// ChatCompletionStream 串流聊天請求
func (c *Client) ChatCompletionStream(
    ctx context.Context,
    req ChatCompletionRequest,
    handler func(chunk StreamChunk) error,
) error {
    // 啟用串流
    req.Stream = ptrBool(true)
    
    // 序列化請求
    reqBody, err := json.Marshal(req)
    if err != nil {
        return fmt.Errorf("marshal request: %w", err)
    }
    
    // 創建 HTTP 請求
    httpReq, err := http.NewRequestWithContext(
        ctx,
        "POST",
        c.baseURL+"/chat/completions",
        bytes.NewReader(reqBody),
    )
    if err != nil {
        return fmt.Errorf("create request: %w", err)
    }
    
    httpReq.Header.Set("Content-Type", "application/json")
    httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)
    httpReq.Header.Set("Accept", "text/event-stream")
    
    // 發送請求
    httpResp, err := c.httpClient.Do(httpReq)
    if err != nil {
        return fmt.Errorf("send request: %w", err)
    }
    defer httpResp.Body.Close()
    
    if httpResp.StatusCode != http.StatusOK {
        body, _ := io.ReadAll(httpResp.Body)
        return fmt.Errorf("API error %d: %s", httpResp.StatusCode, string(body))
    }
    
    // 處理 Server-Sent Events
    reader := NewSSEReader(httpResp.Body)
    
    for {
        select {
        case <-ctx.Done():
            return ctx.Err()
        default:
        }
        
        line, err := reader.ReadLine()
        if err == io.EOF {
            break
        }
        if err != nil {
            return fmt.Errorf("read line: %w", err)
        }
        
        // 跳過空行和註釋
        if len(line) == 0 || line[0] == ':' {
            continue
        }
        
        // 解析 data: 前綴
        if !bytes.HasPrefix(line, []byte("data: ")) {
            continue
        }
        
        data := bytes.TrimPrefix(line, []byte("data: "))
        
        // 檢查是否為結束標記
        if bytes.Equal(data, []byte("[DONE]")) {
            break
        }
        
        // 解析 JSON
        var chunk StreamChunk
        if err := json.Unmarshal(data, &chunk); err != nil {
            return fmt.Errorf("unmarshal chunk: %w", err)
        }
        
        // 調用處理函數
        if err := handler(chunk); err != nil {
            return fmt.Errorf("handler error: %w", err)
        }
    }
    
    return nil
}

type StreamChunk struct {
    ID      string        `json:"id"`
    Object  string        `json:"object"`
    Created int64         `json:"created"`
    Model   string        `json:"model"`
    Choices []StreamChoice `json:"choices"`
}

type StreamChoice struct {
    Index        int           `json:"index"`
    Delta        MessageDelta  `json:"delta"`
    FinishReason *string       `json:"finish_reason"`
}

type MessageDelta struct {
    Role    string `json:"role,omitempty"`
    Content string `json:"content,omitempty"`
}

// SSEReader Server-Sent Events 讀取器
type SSEReader struct {
    reader *bufio.Reader
}

func NewSSEReader(r io.Reader) *SSEReader {
    return &SSEReader{
        reader: bufio.NewReader(r),
    }
}

func (r *SSEReader) ReadLine() ([]byte, error) {
    return r.reader.ReadBytes('\n')
}

func ptrBool(b bool) *bool {
    return &b
}
```

### 併發控制與限流

```go
// RateLimiter 速率限制器
type RateLimiter struct {
    maxConcurrent int
    semaphore     chan struct{}
    
    // Token bucket for rate limiting
    tokensPerSecond int
    tokenBucket     chan struct{}
    stopCh          chan struct{}
}

func NewRateLimiter(maxConcurrent, tokensPerSecond int) *RateLimiter {
    rl := &RateLimiter{
        maxConcurrent:   maxConcurrent,
        semaphore:       make(chan struct{}, maxConcurrent),
        tokensPerSecond: tokensPerSecond,
        tokenBucket:     make(chan struct{}, tokensPerSecond),
        stopCh:          make(chan struct{}),
    }
    
    // 初始化 token bucket
    for i := 0; i < tokensPerSecond; i++ {
        rl.tokenBucket <- struct{}{}
    }
    
    // 定期補充 token
    go rl.refillTokens()
    
    return rl
}

func (rl *RateLimiter) refillTokens() {
    ticker := time.NewTicker(time.Second)
    defer ticker.Stop()
    
    for {
        select {
        case <-ticker.C:
            // 補充 token（非阻塞）
            for i := 0; i < rl.tokensPerSecond; i++ {
                select {
                case rl.tokenBucket <- struct{}{}:
                default:
                    // bucket 已滿，跳過
                }
            }
        case <-rl.stopCh:
            return
        }
    }
}

func (rl *RateLimiter) Acquire(ctx context.Context) error {
    // 獲取 token
    select {
    case <-rl.tokenBucket:
    case <-ctx.Done():
        return ctx.Err()
    }
    
    // 獲取併發槽位
    select {
    case rl.semaphore <- struct{}{}:
        return nil
    case <-ctx.Done():
        // 返還 token
        select {
        case rl.tokenBucket <- struct{}{}:
        default:
        }
        return ctx.Err()
    }
}

func (rl *RateLimiter) Release() {
    <-rl.semaphore
}

func (rl *RateLimiter) Stop() {
    close(rl.stopCh)
}

// 使用範例
func (c *Client) ChatCompletionWithRateLimit(
    ctx context.Context,
    req ChatCompletionRequest,
    limiter *RateLimiter,
) (*ChatCompletionResponse, error) {
    // 獲取許可
    if err := limiter.Acquire(ctx); err != nil {
        return nil, err
    }
    defer limiter.Release()
    
    // 執行請求
    return c.ChatCompletion(ctx, req)
}
```

### 批次處理優化

```go
// BatchProcessor 批次處理器
type BatchProcessor struct {
    client      *Client
    batchSize   int
    maxWait     time.Duration
    queue       chan BatchItem
    stopCh      chan struct{}
}

type BatchItem struct {
    Request  ChatCompletionRequest
    Response chan BatchResult
}

type BatchResult struct {
    Response *ChatCompletionResponse
    Error    error
}

func NewBatchProcessor(client *Client, batchSize int, maxWait time.Duration) *BatchProcessor {
    bp := &BatchProcessor{
        client:    client,
        batchSize: batchSize,
        maxWait:   maxWait,
        queue:     make(chan BatchItem, 100),
        stopCh:    make(chan struct{}),
    }
    
    go bp.run()
    
    return bp
}

func (bp *BatchProcessor) run() {
    ticker := time.NewTicker(bp.maxWait)
    defer ticker.Stop()
    
    batch := make([]BatchItem, 0, bp.batchSize)
    
    for {
        select {
        case item := <-bp.queue:
            batch = append(batch, item)
            
            if len(batch) >= bp.batchSize {
                bp.processBatch(batch)
                batch = batch[:0]
                ticker.Reset(bp.maxWait)
            }
            
        case <-ticker.C:
            if len(batch) > 0 {
                bp.processBatch(batch)
                batch = batch[:0]
            }
            
        case <-bp.stopCh:
            // 處理剩餘的項目
            if len(batch) > 0 {
                bp.processBatch(batch)
            }
            return
        }
    }
}

func (bp *BatchProcessor) processBatch(batch []BatchItem) {
    // 並發處理批次中的請求
    var wg sync.WaitGroup
    for _, item := range batch {
        wg.Add(1)
        go func(item BatchItem) {
            defer wg.Done()
            
            resp, err := bp.client.ChatCompletion(context.Background(), item.Request)
            item.Response <- BatchResult{
                Response: resp,
                Error:    err,
            }
            close(item.Response)
        }(item)
    }
    wg.Wait()
}

func (bp *BatchProcessor) Submit(req ChatCompletionRequest) <-chan BatchResult {
    respCh := make(chan BatchResult, 1)
    bp.queue <- BatchItem{
        Request:  req,
        Response: respCh,
    }
    return respCh
}

func (bp *BatchProcessor) Stop() {
    close(bp.stopCh)
}
```

### 錯誤處理最佳實踐

```go
// ErrorHandler 統一錯誤處理
type ErrorHandler struct {
    logger Logger
}

func (eh *ErrorHandler) HandleError(err error, req ChatCompletionRequest) error {
    if err == nil {
        return nil
    }
    
    // 記錄錯誤
    eh.logger.Error("LLM API error",
        "error", err,
        "model", req.Model,
        "messages_count", len(req.Messages),
    )
    
    // 根據錯誤類型決定處理策略
    apiErr, ok := err.(*APIError)
    if !ok {
        // 網路錯誤等
        return fmt.Errorf("network error: %w", err)
    }
    
    switch apiErr.Error.Type {
    case "invalid_request_error":
        // 請求參數錯誤，不應重試
        return fmt.Errorf("invalid request: %w", err)
        
    case "authentication_error":
        // 認證錯誤，檢查 API Key
        return fmt.Errorf("authentication failed: %w", err)
        
    case "permission_error":
        // 權限錯誤
        return fmt.Errorf("permission denied: %w", err)
        
    case "rate_limit_exceeded":
        // 速率限制，應該重試
        return fmt.Errorf("rate limit exceeded: %w", err)
        
    case "server_error":
        // 服務器錯誤，應該重試
        return fmt.Errorf("server error: %w", err)
        
    case "timeout":
        // 超時，應該重試
        return fmt.Errorf("request timeout: %w", err)
        
    default:
        return fmt.Errorf("unknown error: %w", err)
    }
}

// Logger 接口
type Logger interface {
    Error(msg string, keysAndValues ...interface{})
    Info(msg string, keysAndValues ...interface{})
}
```

### 監控與追蹤

```go
// Metrics LLM API 指標
type Metrics struct {
    // 請求指標
    RequestCount    prometheus.Counter
    RequestDuration prometheus.Histogram
    RequestErrors   prometheus.Counter
    
    // Token 指標
    PromptTokens     prometheus.Counter
    CompletionTokens prometheus.Counter
    TotalTokens      prometheus.Counter
    
    // 成本指標
    EstimatedCost prometheus.Counter
}

func NewMetrics() *Metrics {
    return &Metrics{
        RequestCount: prometheus.NewCounter(prometheus.CounterOpts{
            Name: "llm_requests_total",
            Help: "Total number of LLM requests",
        }),
        RequestDuration: prometheus.NewHistogram(prometheus.HistogramOpts{
            Name:    "llm_request_duration_seconds",
            Help:    "LLM request duration in seconds",
            Buckets: prometheus.DefBuckets,
        }),
        RequestErrors: prometheus.NewCounter(prometheus.CounterOpts{
            Name: "llm_request_errors_total",
            Help: "Total number of LLM request errors",
        }),
        PromptTokens: prometheus.NewCounter(prometheus.CounterOpts{
            Name: "llm_prompt_tokens_total",
            Help: "Total number of prompt tokens",
        }),
        CompletionTokens: prometheus.NewCounter(prometheus.CounterOpts{
            Name: "llm_completion_tokens_total",
            Help: "Total number of completion tokens",
        }),
        TotalTokens: prometheus.NewCounter(prometheus.CounterOpts{
            Name: "llm_total_tokens",
            Help: "Total number of tokens",
        }),
        EstimatedCost: prometheus.NewCounter(prometheus.CounterOpts{
            Name: "llm_estimated_cost_usd",
            Help: "Estimated cost in USD",
        }),
    }
}

// TrackRequest 追蹤請求
func (m *Metrics) TrackRequest(
    duration time.Duration,
    usage Usage,
    model string,
    err error,
) {
    m.RequestCount.Inc()
    m.RequestDuration.Observe(duration.Seconds())
    
    if err != nil {
        m.RequestErrors.Inc()
        return
    }
    
    m.PromptTokens.Add(float64(usage.PromptTokens))
    m.CompletionTokens.Add(float64(usage.CompletionTokens))
    m.TotalTokens.Add(float64(usage.TotalTokens))
    
    // 估算成本
    cost := estimateCost(model, usage)
    m.EstimatedCost.Add(cost)
}

func estimateCost(model string, usage Usage) float64 {
    // 價格（每 1K tokens，美元）
    prices := map[string]struct{ input, output float64 }{
        "gpt-4":          {0.03, 0.06},
        "gpt-3.5-turbo":  {0.0005, 0.0015},
        "claude-3-opus":  {0.015, 0.075},
        "claude-3-sonnet": {0.003, 0.015},
    }
    
    price, ok := prices[model]
    if !ok {
        return 0
    }
    
    inputCost := float64(usage.PromptTokens) / 1000.0 * price.input
    outputCost := float64(usage.CompletionTokens) / 1000.0 * price.output
    
    return inputCost + outputCost
}
```

## 常見面試問題

### 1. 如何處理 LLM API 的速率限制？

**答案要點**：
- **Token Bucket 算法**：控制請求速率
- **併發限制**：使用 semaphore 限制並發數
- **指數退避重試**：429 錯誤時指數退避
- **請求排隊**：高峰期排隊處理
- **多帳號輪換**：分散請求到多個 API Key

### 2. 串流回應和非串流回應各有什麼優缺點？

**答案要點**：

| 特性 | 串流 | 非串流 |
|------|------|--------|
| 用戶體驗 | 更好（逐步顯示） | 較差（需等待） |
| 實現複雜度 | 較高（SSE 處理） | 簡單 |
| 錯誤處理 | 較複雜 | 簡單 |
| 適用場景 | 對話、長文本 | 分類、短回應 |

### 3. 如何優化 LLM API 的成本？

**答案要點**：
- **模型選型**：簡單任務用小模型
- **Prompt 優化**：減少不必要的上下文
- **快取**：相同問題快取結果
- **批次處理**：合併多個請求
- **Token 限制**：設置 max_tokens
- **監控**：追蹤每個請求的成本

### 4. 如何保證 LLM API 調用的可靠性？

**答案要點**：
- **重試機制**：自動重試可恢復錯誤
- **超時設置**：避免長時間等待
- **降級策略**：API 不可用時的備選方案
- **錯誤處理**：區分可重試和不可重試錯誤
- **監控告警**：實時監控錯誤率和延遲
- **多供應商**：準備備用 LLM 供應商

### 5. 如何處理 LLM 的上下文窗口限制？

**答案要點**：
- **Token 計數**：預先估算 Token 數量
- **動態裁剪**：超出時裁剪歷史消息
- **摘要壓縮**：用 LLM 生成對話摘要
- **滑動窗口**：保留最近的 N 條消息
- **選擇長上下文模型**：如 Claude 200K

## 總結

整合 LLM API 需要考慮：

1. **可靠性**：重試機制、錯誤處理、降級策略
2. **效能**：串流回應、批次處理、併發控制
3. **成本**：模型選型、快取、Token 優化
4. **可觀測性**：監控、追蹤、告警
5. **擴展性**：限流、排隊、多供應商

掌握這些最佳實踐，能構建穩定、高效、成本可控的 LLM 應用。

## 延伸閱讀

- [OpenAI API Best Practices](https://platform.openai.com/docs/guides/production-best-practices)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [LangChain LLM Integration](https://python.langchain.com/docs/integrations/llms/)
