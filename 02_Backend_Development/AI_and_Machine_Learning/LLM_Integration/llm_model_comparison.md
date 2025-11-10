# 模型選型與對比

- **難度**: 6
- **標籤**: `模型選型`, `GPT`, `Claude`, `開源模型`

## 問題詳述

市面上有眾多 LLM 可供選擇，從 OpenAI 的 GPT 系列、Anthropic 的 Claude、Google 的 Gemini，到各種開源模型如 Llama、Mistral 等。如何根據業務需求、預算限制和技術要求選擇合適的模型，是構建 AI 應用的關鍵決策。

## 核心理論與詳解

### 主流 LLM 對比

#### 1. 商業模型對比

| 模型 | 供應商 | 上下文長度 | 輸入價格 ($/1M tokens) | 輸出價格 ($/1M tokens) | 特點 |
|------|-------|-----------|---------------------|---------------------|------|
| **GPT-4 Turbo** | OpenAI | 128K | $10 | $30 | 推理能力強、多模態 |
| **GPT-4** | OpenAI | 8K | $30 | $60 | 質量最高、成本高 |
| **GPT-3.5 Turbo** | OpenAI | 16K | $0.50 | $1.50 | 性價比高、速度快 |
| **Claude 3 Opus** | Anthropic | 200K | $15 | $75 | 長上下文、安全性高 |
| **Claude 3 Sonnet** | Anthropic | 200K | $3 | $15 | 平衡性能和成本 |
| **Claude 3 Haiku** | Anthropic | 200K | $0.25 | $1.25 | 速度極快、成本低 |
| **Gemini Pro** | Google | 32K | $0.50 | $1.50 | 多模態、免費額度 |
| **Gemini Ultra** | Google | 32K | 未公開 | 未公開 | 最強性能 |

#### 2. 開源模型對比

| 模型 | 組織 | 參數量 | 上下文長度 | 特點 | 部署難度 |
|------|------|--------|-----------|------|---------|
| **Llama 3** | Meta | 8B/70B | 8K | 性能優秀、商業友好 | 中等 |
| **Mistral 7B** | Mistral AI | 7B | 8K | 效率高、質量好 | 低 |
| **Mixtral 8x7B** | Mistral AI | 47B (MoE) | 32K | MoE 架構、性能強 | 中等 |
| **Qwen** | 阿里巴巴 | 7B/14B/72B | 32K | 中文優秀、多語言 | 中等 |
| **Yi** | 零一萬物 | 6B/34B | 200K | 長上下文、中英雙語 | 中等 |
| **Phi-3** | Microsoft | 3.8B | 4K | 小模型、高效能 | 低 |

### 選型決策框架

#### 1. 需求分析

**功能需求**：

```go
type ModelRequirements struct {
    // 任務類型
    TaskType []string // "qa", "summarization", "code", "chat"
    
    // 語言支援
    Languages []string // "en", "zh", "ja", etc.
    
    // 輸入輸出
    MaxInputLength  int  // 最大輸入 tokens
    MaxOutputLength int  // 最大輸出 tokens
    
    // 特殊能力
    NeedsMultimodal   bool // 需要圖片輸入
    NeedsFunctionCall bool // 需要 Function Calling
    NeedsStreaming    bool // 需要串流輸出
    
    // 質量要求
    MinAccuracy     float64 // 最低準確率
    RequiresCiting  bool    // 需要引用來源
}
```

**非功能需求**：

```go
type PerformanceRequirements struct {
    // 效能
    MaxLatency      time.Duration // 最大延遲 (如 3s)
    MinThroughput   int          // 最小 QPS
    
    // 成本
    MaxCostPerRequest float64    // 單次請求最大成本
    MonthlyBudget     float64    // 月度預算
    
    // 可用性
    MinUptime       float64      // 最低可用性 (如 99.9%)
    MaxDowntime     time.Duration // 最大停機時間
    
    // 安全與合規
    DataPrivacy     string       // "public", "private"
    Compliance      []string     // "GDPR", "HIPAA"
    RegionRestrict  []string     // 地區限制
}
```

#### 2. 模型評估矩陣

```go
type ModelEvaluator struct {
    models []ModelCandidate
}

type ModelCandidate struct {
    Name           string
    Provider       string
    Score          float64 // 綜合評分
    Pros           []string
    Cons           []string
    FitScore       map[string]float64 // 各維度適配度
}

func (me *ModelEvaluator) Evaluate(reqs ModelRequirements) []ModelCandidate {
    candidates := make([]ModelCandidate, 0)
    
    for _, model := range me.models {
        candidate := ModelCandidate{
            Name:     model.Name,
            Provider: model.Provider,
            FitScore: make(map[string]float64),
        }
        
        // 評估各維度
        candidate.FitScore["capability"] = me.evaluateCapability(model, reqs)
        candidate.FitScore["performance"] = me.evaluatePerformance(model, reqs)
        candidate.FitScore["cost"] = me.evaluateCost(model, reqs)
        candidate.FitScore["ease_of_use"] = me.evaluateEaseOfUse(model)
        
        // 計算加權總分
        candidate.Score = me.calculateWeightedScore(candidate.FitScore)
        
        candidates = append(candidates, candidate)
    }
    
    // 按分數排序
    sort.Slice(candidates, func(i, j int) bool {
        return candidates[i].Score > candidates[j].Score
    })
    
    return candidates
}

func (me *ModelEvaluator) evaluateCapability(
    model Model,
    reqs ModelRequirements,
) float64 {
    score := 0.0
    
    // 任務類型匹配
    for _, task := range reqs.TaskType {
        if model.SupportsTask(task) {
            score += 0.25
        }
    }
    
    // 語言支援
    for _, lang := range reqs.Languages {
        if model.SupportsLanguage(lang) {
            score += 0.25
        }
    }
    
    // 上下文長度
    if model.ContextLength >= reqs.MaxInputLength {
        score += 0.25
    }
    
    // 特殊能力
    if reqs.NeedsMultimodal && model.SupportsMultimodal {
        score += 0.25
    }
    
    return math.Min(score, 1.0)
}

func (me *ModelEvaluator) evaluateCost(
    model Model,
    reqs ModelRequirements,
) float64 {
    // 估算月度成本
    estimatedCost := me.estimateMonthlyCost(model, reqs)
    
    // 成本越低分數越高
    if estimatedCost <= reqs.MonthlyBudget * 0.5 {
        return 1.0
    } else if estimatedCost <= reqs.MonthlyBudget {
        return 0.7
    } else if estimatedCost <= reqs.MonthlyBudget * 1.5 {
        return 0.4
    } else {
        return 0.1
    }
}
```

### 詳細對比分析

#### 1. GPT-4 vs GPT-3.5-turbo

**GPT-4 的優勢**：
- 推理能力強 30-40%
- 指令遵循更好
- 減少幻覺
- 多模態（支援圖片）
- 更好的代碼生成

**GPT-3.5-turbo 的優勢**：
- 成本低 20 倍（輸入）、40 倍（輸出）
- 速度快 2-3 倍
- 對簡單任務足夠好

**選擇建議**：
```go
func SelectGPTModel(task Task) string {
    complexity := EvaluateComplexity(task)
    
    if complexity > 0.7 {
        return "gpt-4-turbo" // 複雜任務
    } else if complexity > 0.4 {
        // 中等複雜度，考慮預算
        if task.Budget > 0.01 {
            return "gpt-4-turbo"
        }
        return "gpt-3.5-turbo"
    } else {
        return "gpt-3.5-turbo" // 簡單任務
    }
}
```

#### 2. Claude vs GPT

**Claude 的優勢**：
- 超長上下文（200K vs 128K）
- 更強的安全性和拒答機制
- 更好的文檔分析能力
- 較少的幻覺

**GPT 的優勢**：
- 生態系統更完善
- 支援更多語言和格式
- Function Calling 更成熟
- 社群資源豐富

**選擇場景**：
- **選 Claude**：處理長文檔、安全要求高、需要謹慎回答
- **選 GPT**：需要多模態、Function Calling、廣泛的工具整合

#### 3. 商業模型 vs 開源模型

**商業模型優勢**：
- 即用即付，無需基礎設施
- 持續更新和改進
- 技術支援
- 高可用性保證

**開源模型優勢**：
- 資料隱私（私有部署）
- 無 API 費用（長期成本低）
- 可定制化
- 無供應商鎖定

**成本對比**：

```go
type CostComparison struct {
    cloudAPI   float64
    selfHosted float64
}

func CompareCosts(
    requestsPerMonth int,
    avgTokensPerRequest int,
) CostComparison {
    // 雲端 API (GPT-3.5-turbo)
    cloudCost := float64(requestsPerMonth) *
        float64(avgTokensPerRequest) / 1_000_000 *
        2.0 // $0.5 輸入 + $1.5 輸出 ≈ $2/1M tokens
    
    // 自建（假設使用 Llama 3 70B）
    // GPU 租賃：4x A100 = $12,000/月
    // 維護：$5,000/月
    selfHostedCost := 17000.0
    
    return CostComparison{
        cloudAPI:   cloudCost,
        selfHosted: selfHostedCost,
    }
}

// 決策
func DecideDeployment(requestsPerMonth int) string {
    costs := CompareCosts(requestsPerMonth, 1000)
    
    if costs.cloudAPI < costs.selfHosted * 0.8 {
        return "使用雲端 API"
    } else {
        return "自建模型"
    }
}
```

**breakeven 點**：
- 每月 < 850 萬請求：雲端 API 更划算
- 每月 > 850 萬請求：自建更划算
- 考慮資料隱私、定制需求時，自建門檻更低

### 實際選型案例

#### 案例 1：智能客服系統

**需求**：
- 任務：FAQ 匹配、問答、多輪對話
- QPS：1000（高峰）
- 語言：中英文
- 預算：$10,000/月

**推薦方案**：
```
階梯式架構：
1. FAQ 精確匹配（無 LLM）
2. 簡單問題 → GPT-3.5-turbo
3. 複雜問題 → Claude 3 Sonnet
4. 兜底 → 人工

預估成本：
- GPT-3.5-turbo: 70% 請求 × $2,000 = $1,400
- Claude Sonnet: 20% 請求 × $1,500 = $300
- 總計：≈ $2,000/月
```

#### 案例 2：代碼助手

**需求**：
- 任務：代碼生成、解釋、Review
- 用戶：1萬開發者
- 語言：多種程式語言
- 需要：高準確率、快速回應

**推薦方案**：
```
GPT-4 Turbo

原因：
- 代碼能力最強
- 支援多種語言
- Reasoning 能力好
- 雖然貴但質量重要

優化策略：
- 快取常見問題
- 簡單查詢用 GPT-3.5
- 批次處理
```

#### 案例 3：文檔分析系統

**需求**：
- 任務：長文檔理解、摘要、問答
- 文檔：平均 50 頁（約 20K tokens）
- 用戶：企業內部 1000 人
- 要求：資料隱私

**推薦方案**：
```
選項 A：Claude 3 Sonnet
- 200K 上下文，處理長文檔
- 成本：$3/$15 (in/out)

選項 B：自建 Llama 3 70B
- 資料不出公司
- 初期投入：$50K（硬體）
- 運營：$20K/月

選擇：看資料敏感度
- 高敏感：選 B（自建）
- 一般：選 A（Claude）
```

### 多模型策略

#### 1. 路由策略

根據任務特徵動態選擇模型：

```go
type ModelRouter struct {
    models map[string]LLMClient
}

func (mr *ModelRouter) Route(task Task) string {
    // 規則 1：按任務類型
    if task.Type == "translation" {
        return "gpt-3.5-turbo" // 翻譯用小模型即可
    }
    
    // 規則 2：按複雜度
    complexity := EvaluateComplexity(task.Prompt)
    if complexity < 0.3 {
        return "claude-3-haiku"   // 簡單 → 最快最便宜
    } else if complexity < 0.7 {
        return "gpt-3.5-turbo"    // 中等 → 平衡
    } else {
        return "gpt-4-turbo"      // 複雜 → 最強
    }
}

func (mr *ModelRouter) RouteWithFallback(task Task) (string, error) {
    primary := mr.Route(task)
    
    // 嘗試主模型
    response, err := mr.models[primary].Generate(task)
    if err == nil {
        return response, nil
    }
    
    // 降級到備用模型
    fallback := mr.getFallbackModel(primary)
    return mr.models[fallback].Generate(task)
}
```

#### 2. A/B 測試

對比不同模型的效果：

```go
type ABTester struct {
    modelA LLMClient
    modelB LLMClient
    ratio  float64 // A 的流量比例
}

func (abt *ABTester) Test(task Task) (*Response, string) {
    // 隨機分流
    if rand.Float64() < abt.ratio {
        resp, _ := abt.modelA.Generate(task)
        return resp, "model_a"
    } else {
        resp, _ := abt.modelB.Generate(task)
        return resp, "model_b"
    }
}

// 收集指標並比較
type ABResult struct {
    ModelA Metrics
    ModelB Metrics
}

type Metrics struct {
    Accuracy    float64
    Latency     time.Duration
    Cost        float64
    UserRating  float64
}
```

#### 3. 混合投票

多個模型生成，選最佳答案：

```go
func EnsembleGenerate(task Task, models []LLMClient) string {
    responses := make([]string, len(models))
    
    // 並發生成
    var wg sync.WaitGroup
    for i, model := range models {
        wg.Add(1)
        go func(i int, model LLMClient) {
            defer wg.Done()
            resp, _ := model.Generate(task)
            responses[i] = resp
        }(i, model)
    }
    wg.Wait()
    
    // 投票或選擇最長/最詳細的
    return SelectBestResponse(responses)
}
```

## 常見面試問題

### 1. GPT-4 和 GPT-3.5 的主要區別是什麼？

**答案要點**：
- **能力**：GPT-4 推理強 30-40%，幻覺更少，支援多模態
- **成本**：GPT-4 貴 20-40 倍
- **速度**：GPT-3.5 快 2-3 倍
- **選擇**：複雜任務用 GPT-4，簡單任務用 GPT-3.5
- **優化**：用複雜度評估動態選擇

### 2. 什麼時候應該使用開源模型而不是商業 API？

**答案要點**：
- **資料隱私**：敏感資料不能外傳
- **成本**：長期大量使用（>850 萬次/月）
- **定制化**：需要 fine-tune 或修改
- **延遲**：需要極低延遲（本地部署）
- **離線**：需要離線運行

### 3. Claude 相比 GPT 有什麼優勢？

**答案要點**：
- **長上下文**：200K vs 128K
- **安全性**：更謹慎的回答，較少不當內容
- **文檔分析**：處理長文檔能力更強
- **拒答機制**：對有害請求有更好的拒絕能力
- **成本**：Sonnet 和 Haiku 比 GPT-3.5 更便宜

### 4. 如何評估不同模型的效果？

**答案要點**：
- **準確率**：在測試集上的正確率
- **延遲**：P50、P95、P99 延遲
- **成本**：每次請求的平均成本
- **用戶滿意度**：點贊率、回饋
- **A/B 測試**：實際流量對比

### 5. 多模型策略的優缺點是什麼？

**答案要點**：

**優點**：
- 成本優化（簡單任務用便宜模型）
- 質量保證（複雜任務用強模型）
- 容錯性（主模型故障時降級）
- 靈活性（根據需求動態選擇）

**缺點**：
- 複雜度增加（需要路由邏輯）
- 維護成本（管理多個 API）
- 一致性問題（不同模型輸出風格不同）

## 總結

模型選型需要綜合考慮：

1. **功能匹配**：任務類型、語言、特殊能力
2. **效能要求**：延遲、吞吐量、準確率
3. **成本預算**：API 費用、基礎設施成本
4. **安全合規**：資料隱私、地區限制
5. **長期考量**：可擴展性、供應商鎖定

沒有「最好」的模型，只有「最合適」的模型。建議採用多模型策略，根據任務特徵動態選擇，實現成本和質量的最佳平衡。

## 延伸閱讀

- [OpenAI Models Overview](https://platform.openai.com/docs/models)
- [Anthropic Model Comparison](https://www.anthropic.com/claude)
- [Open LLM Leaderboard](https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard)
- [LLM Cost Calculator](https://docsbot.ai/tools/gpt-openai-api-pricing-calculator)
