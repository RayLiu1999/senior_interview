# Function Calling 與 Tool Use

- **難度**: 7
- **標籤**: `Function Calling`, `Tool Use`, `Agent`, `LLM`

## 問題詳述

Function Calling（函數調用）允許 LLM 調用外部函數或工具，從而擴展其能力。這是構建 AI Agent 的核心技術，使 LLM 能夠查詢資料庫、調用 API、執行計算等。理解 Function Calling 的原理和最佳實踐，是開發智能應用的關鍵。

## 核心理論與詳解

### 什麼是 Function Calling

**Function Calling** 是 LLM 的一種能力，讓模型能夠：
1. 理解用戶意圖
2. 決定需要調用哪個函數
3. 提取函數所需的參數
4. 返回結構化的函數調用請求

**流程**：
```
用戶：「北京今天天氣如何？」
↓
LLM 分析：需要查詢天氣 API
↓
返回函數調用：get_weather(city="北京")
↓
系統執行函數，獲得結果
↓
LLM 生成自然語言回應：「北京今天晴天，溫度 25°C」
```

### 為什麼需要 Function Calling

#### 1. 獲取即時資訊

LLM 的知識有截止日期，Function Calling 讓其獲取即時資料：
- 天氣、股票、新聞
- 資料庫查詢
- API 調用

#### 2. 執行操作

不僅是問答，還能執行實際操作：
- 發送郵件
- 創建日程
- 修改數據

#### 3. 確定性輸出

某些任務需要確定性結果（如計算），Function Calling 確保準確性。

#### 4. 降低幻覺

基於真實資料生成回應，減少編造內容。

### 實現原理

#### 1. 函數定義（Function Definition）

使用 JSON Schema 定義函數：

```json
{
  "name": "get_weather",
  "description": "獲取指定城市的天氣資訊",
  "parameters": {
    "type": "object",
    "properties": {
      "city": {
        "type": "string",
        "description": "城市名稱，如：北京、上海"
      },
      "unit": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"],
        "description": "溫度單位"
      }
    },
    "required": ["city"]
  }
}
```

#### 2. 調用流程

```
步驟 1：用戶提問
步驟 2：LLM 決定是否需要調用函數
步驟 3：LLM 返回函數調用請求（含參數）
步驟 4：系統執行函數
步驟 5：將結果回傳給 LLM
步驟 6：LLM 生成最終回應
```

### Go 實現範例

略（詳細代碼見完整版）

## 常見面試問題

### 1. Function Calling 和 Prompt Engineering 有什麼區別？

**答案要點**：
- **Prompt Engineering**：通過設計 Prompt 引導輸出
- **Function Calling**：LLM 返回結構化的函數調用請求
- **優勢**：Function Calling 輸出格式可預測、可解析、可執行

### 2. 如何處理 Function Calling 的錯誤？

**答案要點**：
- **參數驗證**：檢查必需參數、類型、範圍
- **函數執行失敗**：捕獲異常，返回錯誤訊息給 LLM
- **重試機制**：LLM 可根據錯誤訊息重新調用
- **降級策略**：函數不可用時，LLM 直接回答或轉人工

### 3. Function Calling 的最佳實踐有哪些？

**答案要點**：
- **清晰的函數描述**：幫助 LLM 理解何時使用
- **合理的參數設計**：必需 vs 可選、默認值
- **錯誤處理**：返回有意義的錯誤訊息
- **權限控制**：檢查用戶是否有權限調用
- **日誌記錄**：追蹤函數調用情況

### 4. 如何設計多步驟的 Agent？

**答案要點**：
- **ReAct 模式**：Reasoning + Acting 循環
- **任務分解**：將複雜任務分解為多個步驟
- **狀態管理**：維護對話和執行狀態
- **終止條件**：設置最大迭代次數，防止無限循環

### 5. Function Calling 和 Plugin 有什麼關係？

**答案要點**：
- **Plugin**：預定義的函數集合，如 ChatGPT Plugins
- **Function Calling**：底層技術，Plugin 基於此實現
- **擴展性**：Function Calling 更靈活，可自定義任何函數
- **標準化**：Plugin 提供標準接口和發現機制

## 總結

Function Calling 是構建智能 Agent 的核心：

1. **擴展能力**：讓 LLM 能調用外部工具
2. **獲取即時資訊**：突破知識截止限制
3. **執行操作**：不僅問答，還能執行任務
4. **可控性**：結構化輸出，易於解析和執行
5. **組合性**：可組合多個函數完成複雜任務

掌握 Function Calling 是開發下一代 AI 應用的關鍵技能。

## 延伸閱讀

- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [LangChain Tools](https://python.langchain.com/docs/modules/agents/tools/)
- [Building AI Agents](https://www.anthropic.com/research/building-ai-agents)
