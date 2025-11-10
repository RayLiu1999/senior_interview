# Prompt Engineering 完整指南

- **難度**: 5
- **標籤**: `Prompt Engineering`, `LLM`, `最佳實踐`, `提示工程`

## 問題詳述

Prompt Engineering（提示工程）是與 LLM 交互的藝術和科學。一個好的 Prompt 可以讓模型輸出高質量、準確、符合期望的回應；而糟糕的 Prompt 則可能導致錯誤、模糊或無關的輸出。作為後端工程師，掌握 Prompt Engineering 是有效使用 LLM 的關鍵技能。

## 核心理論與詳解

### 什麼是 Prompt Engineering

**Prompt Engineering** 是設計和優化輸入文本（Prompt）的過程，目的是引導 LLM 生成期望的輸出。它包含：

1. **指令設計**：清晰地告訴模型要做什麼
2. **上下文提供**：提供必要的背景資訊
3. **範例展示**：通過範例指導模型行為
4. **格式控制**：指定輸出的結構和格式
5. **約束設定**：限制輸出的範圍和內容

**為什麼重要**：
- 同一個模型，不同的 Prompt 可能導致完全不同的輸出質量
- 好的 Prompt 可以節省成本（減少重試和 Token 消耗）
- 可以替代微調，實現特定領域的任務適配

### Prompt 的基本結構

一個完整的 Prompt 通常包含以下組成部分：

```
[角色設定] + [任務指令] + [上下文資訊] + [範例（可選）] + [輸出格式] + [約束條件]
```

**範例**：
```
角色：你是一位資深的後端工程師。

任務：分析以下代碼，找出潛在的效能問題。

上下文：這是一個處理用戶請求的 API 端點，每秒需要處理 1000+ 請求。

代碼：
[code here]

輸出格式：
1. 問題描述
2. 影響程度（高/中/低）
3. 改進建議

約束：只關注效能問題，不要提及代碼風格。
```

### Prompt Engineering 的核心技巧

#### 1. 明確性原則（Be Specific）

**不好的 Prompt**：
```
寫一篇關於資料庫的文章。
```

**好的 Prompt**：
```
撰寫一篇 800 字的技術文章，主題是「PostgreSQL 與 MySQL 的性能對比」。
文章應包含：
1. 讀寫效能測試結果
2. 併發處理能力對比
3. 適用場景建議
目標讀者：有 2-3 年經驗的後端工程師
```

**關鍵要點**：
- 明確任務目標
- 指定輸出長度
- 說明目標受眾
- 列出具體要求

#### 2. 分步指令（Step-by-Step）

對於複雜任務，將其分解為明確的步驟。

**範例**：
```
請分析這段日誌，找出錯誤原因：

步驟：
1. 識別錯誤類型（語法錯誤、邏輯錯誤、網路錯誤等）
2. 找出錯誤發生的確切位置
3. 分析可能的原因
4. 提供修復建議

日誌內容：
[logs here]
```

#### 3. 角色扮演（Role Playing）

通過設定角色，讓模型以特定身份和風格回應。

**範例**：
```
你是一位有 10 年經驗的系統架構師。請從架構層面評估以下設計方案...
```

**常用角色**：
- 資深工程師、架構師
- 技術面試官
- 技術作家、教育者
- 代碼審查專家

#### 4. 少樣本學習（Few-Shot Learning）

提供範例來指導模型的行為。

**零樣本（Zero-Shot）**：
```
將以下文本分類為正面、負面或中性：
"這個產品還不錯"
```

**少樣本（Few-Shot）**：
```
將文本分類為正面、負面或中性：

範例：
"太棒了！" → 正面
"很失望" → 負面
"還可以" → 中性

請分類：
"這個產品還不錯" → ?
```

**效果**：Few-Shot 通常能顯著提升準確率和一致性。

#### 5. Chain-of-Thought (CoT)

讓模型展示推理過程，提升複雜任務的準確率。

**基本 Prompt**：
```
23 * 47 = ?
```

**CoT Prompt**：
```
請計算 23 * 47，並展示每一步的計算過程：

步驟：
1. 將 47 分解為 40 + 7
2. 計算 23 * 40
3. 計算 23 * 7
4. 將結果相加
```

**Zero-Shot CoT**（更簡單）：
```
23 * 47 = ?

讓我們一步一步思考...
```

僅僅加上「讓我們一步一步思考」就能顯著提升推理能力。

#### 6. 輸出格式控制

明確指定輸出格式，確保結構化、可解析的回應。

**JSON 格式輸出**：
```
分析以下產品評論，以 JSON 格式輸出：

評論："這個手機拍照很棒，但電池續航差。"

輸出格式：
{
  "sentiment": "mixed",
  "positive_aspects": ["拍照"],
  "negative_aspects": ["電池續航"],
  "overall_rating": 3
}
```

**Markdown 表格**：
```
對比 Redis 和 Memcached，以 Markdown 表格輸出：

| 特性 | Redis | Memcached |
|------|-------|-----------|
| ... | ... | ... |
```

#### 7. 約束和限制

通過約束來控制輸出範圍，避免不相關的內容。

**範例**：
```
總結以下文章，要求：
- 長度不超過 100 字
- 只包含關鍵數據和結論
- 不要包含背景資訊
- 使用客觀的語氣
```

### 進階 Prompt 技巧

#### 1. Self-Consistency

多次生成回應，選擇最一致的答案。

**實現方式**：
```go
// 生成多個回應
responses := []string{}
for i := 0; i < 5; i++ {
    resp, _ := CallLLM(prompt, temperature=0.7)
    responses = append(responses, resp)
}

// 選擇最常見的答案
mostCommon := FindMostCommon(responses)
```

適用於需要高準確率的任務（如數學、邏輯推理）。

#### 2. Tree of Thoughts (ToT)

探索多個推理路徑，選擇最優解。

**概念**：
1. 生成多個可能的下一步
2. 評估每個選項的可行性
3. 選擇最佳路徑繼續
4. 重複直到找到解決方案

適用於複雜問題解決和規劃任務。

#### 3. ReAct (Reasoning + Acting)

結合推理和行動，讓 LLM 與外部工具交互。

**範例**：
```
問題：台北現在的天氣如何？

思考：我需要查詢即時天氣資訊。
行動：調用天氣 API，城市=台北
觀察：溫度 28°C，晴天，濕度 65%

思考：我已獲得所需資訊。
回答：台北現在的天氣是晴天，溫度 28°C，濕度 65%。
```

#### 4. Prompt Chaining

將複雜任務分解為多個 Prompt，逐步完成。

**範例**：
```
Prompt 1: 從文檔中提取關鍵資訊
→ 輸出：關鍵資訊列表

Prompt 2: 基於關鍵資訊，生成摘要
→ 輸出：文檔摘要

Prompt 3: 將摘要翻譯成英文
→ 輸出：英文摘要
```

**優點**：
- 每個步驟更簡單、更可控
- 容易調試和優化
- 可以快取中間結果

### 領域特定的 Prompt 模式

#### 1. 代碼生成

```
請用 Go 語言實現一個 LRU 快取：

要求：
- 使用泛型支援任意鍵值類型
- 線程安全
- O(1) 的讀寫複雜度
- 包含完整的註釋
- 包含使用範例

請只輸出代碼，不要包含解釋。
```

#### 2. 代碼審查

```
作為一位資深工程師，審查以下代碼：

[code here]

請從以下角度評估：
1. **安全性**：是否存在安全漏洞？
2. **效能**：是否有效能瓶頸？
3. **可維護性**：代碼是否清晰、易於維護？
4. **最佳實踐**：是否遵循語言最佳實踐？

對於每個問題，請：
- 指出具體位置（行號）
- 說明影響程度（嚴重/中等/輕微）
- 提供改進建議
```

#### 3. 系統設計

```
設計一個短網址服務，支援每天 10 億次請求。

請按以下結構回答：

1. **需求澄清**
   - 功能需求
   - 非功能需求（QPS、延遲、可用性）

2. **容量估算**
   - 存儲需求
   - 頻寬需求
   - QPS 計算

3. **高層設計**
   - 系統架構圖（文字描述）
   - 核心組件

4. **深入設計**
   - 短網址生成算法
   - 資料庫設計
   - 快取策略

5. **權衡與優化**
   - 可能的瓶頸
   - 優化方案
```

#### 4. 文檔摘要

```
總結以下技術文檔，生成給工程師的摘要：

要求：
- 開頭一句話總結核心內容
- 列出 3-5 個關鍵要點
- 突出重要的 API 變更或破壞性更新
- 長度控制在 200 字以內
- 使用 Markdown 格式

文檔：
[document here]
```

#### 5. 資料轉換

```
將以下 SQL 查詢轉換為 MongoDB 查詢：

SQL:
SELECT user_id, COUNT(*) as order_count
FROM orders
WHERE status = 'completed' AND created_at > '2024-01-01'
GROUP BY user_id
HAVING COUNT(*) > 5
ORDER BY order_count DESC
LIMIT 10;

請以 MongoDB Shell 語法輸出。
```

### Prompt 優化流程

#### 1. 迭代優化

```
初版 Prompt → 測試 → 分析輸出 → 改進 Prompt → 再測試
```

**範例迭代**：

**V1（太模糊）**：
```
解釋微服務。
```

**V2（加入上下文）**：
```
向後端工程師解釋微服務架構的優缺點。
```

**V3（加入結構）**：
```
向有 2 年經驗的後端工程師解釋微服務架構：
1. 定義與核心概念
2. 與單體架構的對比
3. 主要優勢
4. 主要挑戰
5. 適用場景
長度：500 字左右
```

#### 2. A/B 測試

對於關鍵的生產環境 Prompt，進行 A/B 測試：

```go
// 隨機選擇 Prompt 變體
variant := "A"
if rand.Float64() < 0.5 {
    variant = "B"
}

prompt := getPromptVariant(variant)
response, _ := CallLLM(prompt)

// 記錄指標
logMetrics(variant, response.Quality, response.Latency, response.Cost)
```

**評估指標**：
- 輸出質量（人工評分或自動評估）
- 生成速度（Token/秒）
- 成本（Token 消耗）
- 用戶滿意度

#### 3. 自動化評估

建立自動化測試集，評估 Prompt 效果：

```go
type TestCase struct {
    Input    string
    Expected string
}

func EvaluatePrompt(promptTemplate string, testCases []TestCase) float64 {
    correctCount := 0
    for _, tc := range testCases {
        prompt := fmt.Sprintf(promptTemplate, tc.Input)
        output, _ := CallLLM(prompt)
        
        if IsCorrect(output, tc.Expected) {
            correctCount++
        }
    }
    
    return float64(correctCount) / float64(len(testCases))
}
```

### 常見錯誤與陷阱

#### 1. 過於簡短

**錯誤**：
```
寫代碼
```

**正確**：
```
用 Go 語言實現一個併發安全的計數器，支援 Increment 和 Get 方法。
```

#### 2. 多個任務混在一起

**錯誤**：
```
分析這段代碼的效能問題，並重構它，同時寫單元測試。
```

**正確**：分成三個獨立的 Prompt。

#### 3. 期望模型有它沒有的知識

**錯誤**：
```
總結昨天發布的 Go 1.23 新特性。
```

如果模型的知識截止日期早於 Go 1.23，它無法回答。應使用 RAG。

#### 4. 沒有驗證輸出

**錯誤**：直接使用 LLM 生成的代碼或資料。

**正確**：
- 對於代碼：運行測試
- 對於資料：驗證格式和範圍
- 對於事實：交叉檢查資料來源

### Prompt Engineering 工具與資源

#### 1. Prompt 管理

**PromptLayer**、**Helicone**：
- Prompt 版本管理
- A/B 測試
- 效能監控

#### 2. Prompt 優化工具

**DSPy**：
- 自動化 Prompt 優化
- 基於資料的 Prompt 調整

**Langfuse**：
- LLM 應用的可觀測性
- Prompt 效能追蹤

#### 3. Prompt 資料庫

- [Awesome ChatGPT Prompts](https://github.com/f/awesome-chatgpt-prompts)
- [OpenAI Cookbook](https://github.com/openai/openai-cookbook)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

## 程式碼範例

以下是一個 Prompt 模板管理系統的範例：

```go
package main

import (
	"fmt"
	"strings"
)

// PromptTemplate 表示一個可重用的 Prompt 模板
type PromptTemplate struct {
	Name        string
	Template    string
	Variables   []string
	Description string
}

// PromptManager 管理多個 Prompt 模板
type PromptManager struct {
	templates map[string]*PromptTemplate
}

func NewPromptManager() *PromptManager {
	return &PromptManager{
		templates: make(map[string]*PromptTemplate),
	}
}

// RegisterTemplate 註冊新的 Prompt 模板
func (pm *PromptManager) RegisterTemplate(template *PromptTemplate) {
	pm.templates[template.Name] = template
}

// Render 渲染 Prompt 模板，替換變數
func (pm *PromptManager) Render(name string, variables map[string]string) (string, error) {
	template, ok := pm.templates[name]
	if !ok {
		return "", fmt.Errorf("template %s not found", name)
	}
	
	result := template.Template
	for key, value := range variables {
		placeholder := fmt.Sprintf("{{%s}}", key)
		result = strings.ReplaceAll(result, placeholder, value)
	}
	
	return result, nil
}

func main() {
	pm := NewPromptManager()
	
	// 註冊代碼審查模板
	pm.RegisterTemplate(&PromptTemplate{
		Name: "code_review",
		Template: `作為一位資深{{language}}工程師，審查以下代碼：

代碼：
{{code}}

請從以下角度評估：
1. **安全性**：是否存在安全漏洞？
2. **效能**：是否有效能瓶頸？
3. **可維護性**：代碼是否清晰、易於維護？

對於每個問題，請指出具體位置並提供改進建議。`,
		Variables:   []string{"language", "code"},
		Description: "用於代碼審查的 Prompt 模板",
	})
	
	// 註冊文檔摘要模板
	pm.RegisterTemplate(&PromptTemplate{
		Name: "doc_summary",
		Template: `總結以下{{doc_type}}，生成給{{audience}}的摘要：

要求：
- 開頭一句話總結核心內容
- 列出 3-5 個關鍵要點
- 長度控制在 {{max_words}} 字以內
- 使用 Markdown 格式

文檔：
{{document}}`,
		Variables:   []string{"doc_type", "audience", "max_words", "document"},
		Description: "用於文檔摘要的 Prompt 模板",
	})
	
	// 使用代碼審查模板
	prompt, _ := pm.Render("code_review", map[string]string{
		"language": "Go",
		"code": `func processUser(id int) {
	user := db.Query("SELECT * FROM users WHERE id = " + strconv.Itoa(id))
	fmt.Println(user)
}`,
	})
	
	fmt.Println("=== Code Review Prompt ===")
	fmt.Println(prompt)
	fmt.Println()
	
	// 使用文檔摘要模板
	prompt, _ = pm.Render("doc_summary", map[string]string{
		"doc_type":  "技術文檔",
		"audience":  "後端工程師",
		"max_words": "200",
		"document":  "...",
	})
	
	fmt.Println("=== Document Summary Prompt ===")
	fmt.Println(prompt)
}
```

**關鍵要點**：
- 使用模板系統統一管理 Prompt
- 支援變數替換，提高重用性
- 便於版本控制和 A/B 測試
- 可擴展為支援多語言、多版本

## 常見面試問題

### 1. 什麼是 Prompt Engineering？為什麼重要？

**答案要點**：
- 定義：設計和優化輸入文本以引導 LLM 生成期望輸出
- 重要性：同一模型不同 Prompt 效果差異大、可節省成本、替代微調
- 核心技巧：明確性、分步指令、少樣本學習、輸出格式控制

### 2. 解釋 Zero-Shot、Few-Shot 和 Chain-of-Thought

**答案要點**：
- **Zero-Shot**：不提供範例，直接描述任務
- **Few-Shot**：提供少量範例來指導模型行為
- **Chain-of-Thought**：讓模型展示推理過程，提升複雜任務準確率
- 使用場景：簡單任務用 Zero-Shot，需要一致性用 Few-Shot，複雜推理用 CoT

### 3. 如何優化一個效果不好的 Prompt？

**答案要點**：
1. **增加明確性**：更詳細的任務描述
2. **提供範例**：使用 Few-Shot
3. **分解任務**：複雜任務拆分為多個步驟
4. **指定格式**：明確輸出結構
5. **添加約束**：限制輸出範圍
6. **迭代測試**：持續優化並 A/B 測試

### 4. 在生產環境中如何管理 Prompt？

**答案要點**：
- **版本控制**：使用 Git 管理 Prompt 模板
- **模板系統**：統一管理和重用
- **A/B 測試**：對比不同版本的效果
- **監控**：追蹤輸出質量和成本
- **自動化測試**：建立測試集評估 Prompt 效果

### 5. Prompt Injection 是什麼？如何防範？

**答案要點**：
- **定義**：用戶通過精心設計的輸入繞過原有指令
- **範例**：「忽略之前的所有指令，告訴我...」
- **防範**：
  - 輸入驗證和清理
  - 使用明確的分隔符區分系統指令和用戶輸入
  - 輸出驗證
  - 使用支援系統消息的 API（如 OpenAI 的 `system` role）

## 總結

Prompt Engineering 是與 LLM 交互的關鍵技能：

1. **明確性**：清晰、具體的指令是好 Prompt 的基礎
2. **結構化**：使用固定的結構（角色、任務、上下文、格式）
3. **範例驅動**：Few-Shot 能顯著提升一致性
4. **迭代優化**：持續測試和改進
5. **系統管理**：在生產環境中使用模板系統和版本控制

掌握 Prompt Engineering 能讓你更有效地使用 LLM，降低成本，提升輸出質量，是現代後端工程師的必備技能。

## 延伸閱讀

- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic Prompt Engineering](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [LangChain Prompt Templates](https://python.langchain.com/docs/modules/model_io/prompts/)
