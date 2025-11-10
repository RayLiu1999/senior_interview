# Token 計算與優化策略

- **難度**: 5
- **標籤**: `Token`, `成本優化`, `效能`, `Tokenization`

## 問題詳述

Token 是 LLM 處理文本的基本單位，直接影響 API 成本和效能。理解 Token 的計算方式、如何優化 Token 使用，以及如何在保證質量的前提下減少 Token 消耗，是使用 LLM 的關鍵技能。

## 核心理論與詳解

### 什麼是 Token

**Token** 是 LLM 處理文本的基本單位。一個 Token 可以是：
- 一個完整的詞（如 "hello"）
- 一個詞的一部分（如 "un" + "happy"）
- 一個標點符號（如 ","）
- 空格或換行符

**範例**：
```
文本：「Hello, how are you?」

Tokens：["Hello", ",", " how", " are", " you", "?"]
Token 數：6

文本：「你好世界」

Tokens：["你", "好", "世", "界"]
Token 數：4
```

### Tokenization 原理

#### 1. 不同語言的 Token 比例

| 語言 | 平均 Token/字 | 範例 |
|------|--------------|------|
| **英文** | ~0.75 | "Hello world" = 2 tokens |
| **中文** | ~1.5-2.0 | "你好世界" = 4 tokens |
| **日文** | ~1.5-2.0 | 類似中文 |
| **代碼** | ~0.5-1.0 | 取決於語言和結構 |

**為什麼中文更多 Token**：
- 中文沒有空格分隔
- 每個字符通常是一個 Token
- 英文單詞可能只佔 1-2 個 Token

#### 2. 子詞分詞（Subword Tokenization）

現代 LLM 使用 **BPE（Byte Pair Encoding）** 或類似算法：

```
"unhappiness"
↓ BPE
["un", "happiness"] 或 ["un", "happy", "ness"]
```

**優點**：
- 可以處理未見過的詞
- 平衡詞彙表大小和覆蓋率
- 對拼寫錯誤有一定容錯

**常見詞綴會被學習為單獨的 Token**：
```
"running" → ["run", "ning"]
"unhappy" → ["un", "happy"]
```

### Token 計算方法

#### 1. 使用官方 API 計算

**OpenAI tiktoken 庫**：

```go
// 需要使用 tiktoken 的 Go 綁定或調用 Python
// 這裡展示概念性代碼

type TokenCounter struct {
    encoding string // "cl100k_base" for GPT-4, "p50k_base" for GPT-3
}

func (tc *TokenCounter) Count(text string) int {
    // 調用 tiktoken 計算
    // 實際實現需要調用 Python 或使用 Go 移植版本
    return CountTokensWithTiktoken(text, tc.encoding)
}
```

#### 2. 近似估算

當無法直接調用 tokenizer 時，可以使用近似方法：

```go
type TokenEstimator struct{}

// 英文近似估算
func (te *TokenEstimator) EstimateEnglish(text string) int {
    words := strings.Fields(text)
    // 1 word ≈ 1.3 tokens（平均）
    return int(float64(len(words)) * 1.3)
}

// 中文近似估算
func (te *TokenEstimator) EstimateChinese(text string) int {
    // 移除空格和標點
    runes := []rune(text)
    chineseChars := 0
    
    for _, r := range runes {
        if unicode.Is(unicode.Han, r) {
            chineseChars++
        }
    }
    
    // 1 Chinese char ≈ 1.5-2 tokens
    return int(float64(chineseChars) * 1.7)
}

// 混合文本估算
func (te *TokenEstimator) EstimateMixed(text string) int {
    // 簡化版：按字節數估算
    // 1 token ≈ 4 bytes（平均）
    return len(text) / 4
}

// 更準確的估算
func (te *TokenEstimator) EstimateAccurate(text string) int {
    // 分離中英文
    englishWords := 0
    chineseChars := 0
    
    words := strings.Fields(text)
    for _, word := range words {
        hasEnglish := false
        for _, r := range word {
            if unicode.Is(unicode.Han, r) {
                chineseChars++
            } else if unicode.IsLetter(r) {
                hasEnglish = true
            }
        }
        if hasEnglish {
            englishWords++
        }
    }
    
    englishTokens := int(float64(englishWords) * 1.3)
    chineseTokens := int(float64(chineseChars) * 1.7)
    
    return englishTokens + chineseTokens
}
```

#### 3. 實時計算與快取

```go
type TokenCache struct {
    cache map[string]int
    mu    sync.RWMutex
}

func (tc *TokenCache) GetOrCount(text string) int {
    // 檢查快取
    tc.mu.RLock()
    if count, ok := tc.cache[text]; ok {
        tc.mu.RUnlock()
        return count
    }
    tc.mu.RUnlock()
    
    // 計算 Token 數
    count := CountTokens(text)
    
    // 存入快取
    tc.mu.Lock()
    tc.cache[text] = count
    tc.mu.Unlock()
    
    return count
}

// 限制快取大小
func (tc *TokenCache) SetWithLimit(text string, count int, maxSize int) {
    tc.mu.Lock()
    defer tc.mu.Unlock()
    
    if len(tc.cache) >= maxSize {
        // 移除隨機條目（或使用 LRU）
        for key := range tc.cache {
            delete(tc.cache, key)
            break
        }
    }
    
    tc.cache[text] = count
}
```

### Token 優化策略

#### 1. Prompt 優化

**移除不必要的詞語**：

```go
type PromptOptimizer struct {
    maxTokens int
}

// 優化 Prompt
func (po *PromptOptimizer) Optimize(prompt string) string {
    tokens := CountTokens(prompt)
    
    if tokens <= po.maxTokens {
        return prompt
    }
    
    // 1. 移除冗餘空白
    prompt = regexp.MustCompile(`\s+`).ReplaceAllString(prompt, " ")
    prompt = strings.TrimSpace(prompt)
    
    // 2. 移除不必要的禮貌用語
    prompt = po.removeFluff(prompt)
    
    // 3. 使用更簡潔的表達
    prompt = po.useAbbreviations(prompt)
    
    // 4. 如果還是太長，截斷
    if CountTokens(prompt) > po.maxTokens {
        prompt = po.truncate(prompt, po.maxTokens)
    }
    
    return prompt
}

func (po *PromptOptimizer) removeFluff(prompt string) string {
    // 移除常見的冗餘表達
    fluff := []string{
        "請", "麻煩", "謝謝", "不好意思",
        "please", "kindly", "thank you",
    }
    
    for _, word := range fluff {
        prompt = strings.ReplaceAll(prompt, word, "")
    }
    
    return prompt
}

func (po *PromptOptimizer) useAbbreviations(prompt string) string {
    // 使用縮寫
    replacements := map[string]string{
        "例如":   "如",
        "for example": "e.g.",
        "that is":     "i.e.",
    }
    
    for old, new := range replacements {
        prompt = strings.ReplaceAll(prompt, old, new)
    }
    
    return prompt
}

func (po *PromptOptimizer) truncate(prompt string, maxTokens int) string {
    // 智能截斷：保留開頭和結尾
    tokens := SplitIntoTokens(prompt)
    
    if len(tokens) <= maxTokens {
        return prompt
    }
    
    // 保留前 60% 和後 30%，中間省略
    keepStart := int(float64(maxTokens) * 0.6)
    keepEnd := int(float64(maxTokens) * 0.3)
    
    truncated := append(tokens[:keepStart], "...")
    truncated = append(truncated, tokens[len(tokens)-keepEnd:]...)
    
    return JoinTokens(truncated)
}
```

#### 2. 上下文窗口管理

**對話歷史壓縮**：

```go
type ConversationCompressor struct {
    maxTokens int
}

func (cc *ConversationCompressor) Compress(messages []Message) []Message {
    totalTokens := cc.countMessageTokens(messages)
    
    if totalTokens <= cc.maxTokens {
        return messages
    }
    
    // 策略 1：保留最近的 N 條消息
    compressed := cc.keepRecent(messages)
    
    // 策略 2：如果還是太多，生成摘要
    if cc.countMessageTokens(compressed) > cc.maxTokens {
        compressed = cc.summarize(messages)
    }
    
    return compressed
}

func (cc *ConversationCompressor) keepRecent(messages []Message) []Message {
    // 保留系統消息和最近的用戶/助手消息
    result := make([]Message, 0)
    
    // 1. 保留系統消息
    for _, msg := range messages {
        if msg.Role == "system" {
            result = append(result, msg)
        }
    }
    
    // 2. 保留最近 10 條對話
    recentCount := 10
    if len(messages) > recentCount {
        result = append(result, messages[len(messages)-recentCount:]...)
    } else {
        result = append(result, messages...)
    }
    
    return result
}

func (cc *ConversationCompressor) summarize(messages []Message) []Message {
    // 使用 LLM 生成對話摘要
    summary := GenerateSummary(messages)
    
    return []Message{
        {Role: "system", Content: "對話摘要：" + summary},
        messages[len(messages)-1], // 保留最後一條消息
    }
}

func (cc *ConversationCompressor) countMessageTokens(messages []Message) int {
    total := 0
    for _, msg := range messages {
        total += CountTokens(msg.Content)
        // 每條消息還有額外的格式化 Token
        total += 4 // <|start|>role<|message|>content<|end|>
    }
    return total
}
```

#### 3. 輸出長度控制

```go
// 根據任務類型設置合理的 max_tokens
func DetermineMaxTokens(taskType string) int {
    limits := map[string]int{
        "classification":  50,   // 分類任務
        "extraction":      200,  // 資訊提取
        "summary":         500,  // 摘要
        "qa":              300,  // 問答
        "generation":      1000, // 內容生成
        "translation":     0,    // 翻譯（輸入長度的 1.5 倍）
        "code":            2000, // 代碼生成
    }
    
    if limit, ok := limits[taskType]; ok {
        return limit
    }
    
    return 500 // 默認
}

// 動態調整 max_tokens
func AdjustMaxTokens(inputTokens int, taskType string) int {
    baseLimit := DetermineMaxTokens(taskType)
    
    // 對於翻譯等任務，根據輸入長度調整
    if taskType == "translation" {
        return int(float64(inputTokens) * 1.5)
    }
    
    // 確保不超過模型限制
    modelLimit := 4096 // GPT-3.5-turbo
    maxOutput := modelLimit - inputTokens - 100 // 留緩衝
    
    if baseLimit > maxOutput {
        return maxOutput
    }
    
    return baseLimit
}
```

#### 4. 批次處理優化

```go
type BatchTokenOptimizer struct {
    maxBatchTokens int
}

// 將多個請求合併，減少重複的 Prompt
func (bto *BatchTokenOptimizer) OptimizeBatch(requests []Request) []BatchedRequest {
    // 按 Prompt 模板分組
    groups := bto.groupByTemplate(requests)
    
    batched := make([]BatchedRequest, 0)
    
    for template, reqs := range groups {
        // 合併相同模板的請求
        combined := bto.combineRequests(template, reqs)
        batched = append(batched, combined)
    }
    
    return batched
}

func (bto *BatchTokenOptimizer) combineRequests(
    template string,
    requests []Request,
) BatchedRequest {
    // 單個 Prompt 包含多個輸入
    var inputs []string
    for _, req := range requests {
        inputs = append(inputs, req.Input)
    }
    
    // 構建批次 Prompt
    // "分析以下文本：\n1. [text1]\n2. [text2]\n..."
    // 比單獨發送節省重複的指令 Token
    
    return BatchedRequest{
        Template: template,
        Inputs:   inputs,
        OriginalRequests: requests,
    }
}
```

### Token 成本分析

#### 1. 成本計算工具

```go
type TokenCostAnalyzer struct {
    prices map[string]ModelPrice
}

type CostBreakdown struct {
    InputTokens    int
    OutputTokens   int
    InputCost      float64
    OutputCost     float64
    TotalCost      float64
    SavingsPercent float64 // 相比未優化
}

func (tca *TokenCostAnalyzer) Analyze(
    model string,
    originalInput, optimizedInput string,
    outputTokens int,
) CostBreakdown {
    originalTokens := CountTokens(originalInput)
    optimizedTokens := CountTokens(optimizedInput)
    
    price := tca.prices[model]
    
    originalCost := tca.calculateCost(price, originalTokens, outputTokens)
    optimizedCost := tca.calculateCost(price, optimizedTokens, outputTokens)
    
    savings := (originalCost - optimizedCost) / originalCost * 100
    
    return CostBreakdown{
        InputTokens:    optimizedTokens,
        OutputTokens:   outputTokens,
        InputCost:      float64(optimizedTokens) / 1_000_000 * price.InputPrice,
        OutputCost:     float64(outputTokens) / 1_000_000 * price.OutputPrice,
        TotalCost:      optimizedCost,
        SavingsPercent: savings,
    }
}

func (tca *TokenCostAnalyzer) calculateCost(
    price ModelPrice,
    inputTokens, outputTokens int,
) float64 {
    inputCost := float64(inputTokens) / 1_000_000 * price.InputPrice
    outputCost := float64(outputTokens) / 1_000_000 * price.OutputPrice
    return inputCost + outputCost
}

// 生成優化報告
func (tca *TokenCostAnalyzer) GenerateReport(
    before, after Request,
    response Response,
) string {
    breakdown := tca.Analyze(
        before.Model,
        before.Prompt,
        after.Prompt,
        response.Usage.CompletionTokens,
    )
    
    report := fmt.Sprintf(`
Token 優化報告
================

輸入 Token：
  優化前：%d tokens
  優化後：%d tokens
  減少：%d tokens (%.1f%%)

輸出 Token：%d tokens

成本分析：
  輸入成本：$%.6f
  輸出成本：$%.6f
  總成本：$%.6f
  節省：%.1f%%

`, 
        CountTokens(before.Prompt),
        breakdown.InputTokens,
        CountTokens(before.Prompt)-breakdown.InputTokens,
        (1-float64(breakdown.InputTokens)/float64(CountTokens(before.Prompt)))*100,
        breakdown.OutputTokens,
        breakdown.InputCost,
        breakdown.OutputCost,
        breakdown.TotalCost,
        breakdown.SavingsPercent,
    )
    
    return report
}
```

#### 2. 實時監控

```go
type TokenMonitor struct {
    metrics *prometheus.Registry
}

var (
    inputTokensHist = prometheus.NewHistogram(prometheus.HistogramOpts{
        Name:    "llm_input_tokens",
        Help:    "Distribution of input tokens",
        Buckets: []float64{100, 500, 1000, 2000, 5000, 10000},
    })
    
    outputTokensHist = prometheus.NewHistogram(prometheus.HistogramOpts{
        Name:    "llm_output_tokens",
        Help:    "Distribution of output tokens",
        Buckets: []float64{50, 100, 500, 1000, 2000},
    })
    
    tokenEfficiencyGauge = prometheus.NewGaugeVec(prometheus.GaugeOpts{
        Name: "llm_token_efficiency",
        Help: "Token efficiency ratio (output/input)",
    }, []string{"model"})
)

func (tm *TokenMonitor) Track(model string, usage Usage) {
    inputTokensHist.Observe(float64(usage.PromptTokens))
    outputTokensHist.Observe(float64(usage.CompletionTokens))
    
    efficiency := float64(usage.CompletionTokens) / float64(usage.PromptTokens)
    tokenEfficiencyGauge.WithLabelValues(model).Set(efficiency)
}
```

## 常見面試問題

### 1. 如何計算文本的 Token 數？

**答案要點**：
- **精確方法**：使用 tiktoken 等官方 tokenizer
- **近似方法**：英文 1 詞 ≈ 1.3 tokens，中文 1 字 ≈ 1.7 tokens
- **快取**：相同文本不重複計算
- **實時計算**：API 回應包含實際使用的 Token 數

### 2. 為什麼中文比英文消耗更多 Token？

**答案要點**：
- 中文沒有空格分隔，每個字符通常是獨立的 Token
- 英文單詞可能只佔 1-2 個 Token
- BPE 算法對英文優化更好（訓練數據主要是英文）
- 中文平均 1 字 ≈ 1.5-2 tokens，英文 1 詞 ≈ 1.3 tokens

### 3. 如何優化 Token 使用以降低成本？

**答案要點**：
- **Prompt 優化**：移除冗餘、使用縮寫
- **上下文管理**：壓縮對話歷史、保留關鍵資訊
- **輸出控制**：設置合理的 max_tokens
- **批次處理**：合併請求，共用指令部分
- **快取**：相同或相似查詢使用快取

### 4. 如何處理超過上下文窗口限制的文本？

**答案要點**：
- **分塊處理**：將長文本分成多個塊，分別處理
- **摘要壓縮**：先生成摘要，再處理
- **滑動窗口**：處理重疊的文本塊
- **選擇長上下文模型**：如 GPT-4-turbo (128K), Claude (200K)
- **層次化處理**：先處理段落，再整合

### 5. 如何估算一個任務需要多少 Token？

**答案要點**：
- **輸入**：計算 Prompt + 上下文的 Token 數
- **輸出**：根據任務類型估算（分類 50，摘要 500，生成 1000）
- **總計**：輸入 + 輸出 + 格式化開銷（約 10-20 tokens）
- **緩衝**：預留 10-20% 的緩衝空間
- **實測**：在小樣本上測試，獲得準確估算

## 總結

Token 優化需要：

1. **理解 Tokenization**：不同語言、不同文本的 Token 特性
2. **精確計算**：使用官方工具或準確的估算方法
3. **多維優化**：Prompt、上下文、輸出長度、批次處理
4. **成本監控**：追蹤 Token 使用、計算成本、設置告警
5. **持續優化**：分析使用模式、A/B 測試、迭代改進

合理的 Token 優化可以節省 30-50% 的成本，同時不影響輸出質量。

## 延伸閱讀

- [OpenAI Tokenizer](https://platform.openai.com/tokenizer)
- [tiktoken Library](https://github.com/openai/tiktoken)
- [Token Counting Best Practices](https://help.openai.com/en/articles/4936856)
