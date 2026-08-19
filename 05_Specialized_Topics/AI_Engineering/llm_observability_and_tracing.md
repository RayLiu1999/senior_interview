# LLM Observability 與 Trace 契約

- **難度**: 8
- **重要程度**: 5
- **標籤**: `LLM`, `Agent`, `Observability`, `Tracing`, `LLMOps`, `Privacy`

## 問題詳述

一般的 request latency、HTTP error rate 和 token count 不足以解釋 LLM、RAG 或 Agent 為什麼失敗。請設計一套能還原一次 AI `run`、區分責任邊界、保護敏感資料，並同時支援 production、evaluation 與 incident replay 的觀測契約。

## 核心理論與詳解

AI 可觀測性不是把整段 prompt 丟進 log，也不是替每個模型呼叫加一個 dashboard。它的核心是：**每一個可影響結果的決策、版本、工具副作用與環境結果，都有可關聯且可安全保存的證據**。

### 1. 從 request 改用 AI run 的觀測單位

一個使用者請求可能包含多次模型呼叫、檢索、工具嘗試與恢復。建議使用下列階層，並讓每一層都有穩定識別碼：

| 單位 | 意義 | 需要回答的問題 |
| :--- | :--- | :--- |
| `session` | 使用者或工作階段 | 這次操作屬於哪個租戶、身份與產品流程？ |
| `run` | 一次完整任務 | 任務是否在 deadline 內完成？最終環境狀態是什麼？ |
| `turn` | 一次輸入到回覆的循環 | 哪次上下文或模型決策改變了方向？ |
| `step` | Agent 的一個狀態轉移 | 目前是在思考、檢索、呼叫工具還是驗證？ |
| `attempt` | 某一步的單次執行嘗試 | 是 timeout、retry、cancel 還是 provider error？ |
| `checkpoint` | 可恢復的持久化邊界 | worker 重啟後要從哪裡安全繼續？ |
| `tool_call` | 對外部工具的意圖與執行 | 誰提出、誰授權、實際傳了什麼參數？ |
| `outcome` | 受控環境的結果 | 外部系統真的完成了副作用嗎？ |

這些欄位應能由 `trace_id`、`run_id`、`step_id`、`attempt_id` 串起來。只保存最後回答，會失去模型選擇、候選文件、policy decision、重試放大與真實環境狀態等關鍵證據。

### 2. Trace 必須包含版本 lineage

同一個問題在不同時間得到不同答案，可能不是模型變差，而是 prompt、文件、索引、權限或工具版本改變。每次 run 至少應能關聯：

- **模型與 Provider**：model identifier、provider、endpoint、fallback chain、temperature 或等價採樣設定。
- **Prompt 與上下文**：system instruction、template version、user input hash、context policy、token budget；敏感原文應以遮罩或受控引用保存。
- **檢索資產**：embedding model、dimension、index／namespace version、query rewrite、候選文件 ID、分數、tenant／ACL decision、citation。
- **工具與政策**：tool schema version、tool implementation version、capability、policy version、approval decision、idempotency key。
- **資料與環境**：evaluation dataset／fixture version、feature flag、部署版本、region、資料庫或沙箱 snapshot。

版本不是裝飾性 metadata。沒有 lineage，就無法判斷回歸是由模型、資料、prompt、retriever、tool 或 harness 引入，也無法安全重播同一個案例。

### 3. 指標必須分層，不能只看答案分數

建議將指標分成五組，並使用 task、tenant、risk tier 等低基數維度做 slice：

| 層級 | 代表指標 | 主要用途 |
| :--- | :--- | :--- |
| 品質 | answer correctness、faithfulness、citation correctness、拒答準確率、tool success | 判斷使用者任務是否真的完成 |
| 執行可靠性 | step success、tool error、retry amplification、timeout、cancel、unknown outcome、checkpoint resume success | 找出 Agent loop 或 Runtime 的失敗 |
| 效能與成本 | TTFT、完整回應 P50/P95/P99、input／output token、cost per run、queue age | 管理尾延遲、配額與預算 |
| 資料與檢索 | recall@K、MRR／nDCG、freshness、候選數、ACL reject、引用覆蓋率 | 區分找不到資料與回答錯誤 |
| 安全與治理 | policy deny、approval mismatch、cross-tenant attempt、secret access、audit completeness | 讓安全違規成為可阻擋的訊號 |

平均值可能掩蓋高風險租戶或少數昂貴任務，因此要同時看分位數、失敗案例與切片回歸。安全違規、跨租戶資料外洩和未授權副作用通常是零容忍條件，不應被好案例的平均分數抵銷。

### 4. 失敗歸因要區分四個責任邊界

同一個「回答錯誤」可能來自不同位置，incident review 應先分類再修復：

1. **Model／Prompt failure**：模型沒有遵守格式、選錯工具或產生不可靠內容。
2. **Tool／Runtime failure**：schema、timeout、retry、checkpoint、cancellation 或 idempotency 處理錯誤。
3. **Environment failure**：資料庫、檔案、下游 API 或沙箱的實際狀態與預期不同。
4. **Evaluator／Observability failure**：評估只看 final answer、trace 遺漏關鍵事件，或 grader 把未完成的副作用當成成功。

`model said success` 只能是觀察值，不能取代 `environment outcome`。例如模型說「工單已建立」，仍要由受控的資料庫查詢或工具回執驗證工單是否存在、是否屬於正確租戶、是否重複。

### 5. Trace、Audit 與 Replay 的邊界

三者相關但不能混為一談：

- **Trace** 用於關聯時間順序與診斷延遲；可以採樣，但高風險事件不能無聲消失。
- **Audit** 用於證明誰在何時以哪個 policy 允許或拒絕了哪個動作；應具備完整性、保留期限與存取控制。
- **Replay** 用於重建決策與驗證修復；預設使用 recorded response、fixture 或隔離環境，不能因為重播而重新付款、寄信或修改 production 資料。

實務上可分成三種 replay：

1. **State reconstruction**：只重建 state machine 與事件，不呼叫外部副作用。
2. **Fixture replay**：重放已記錄的模型／工具結果，用來比較新舊 grader 或 policy。
3. **Stochastic rerun**：在隔離環境重新呼叫模型，明確標記非確定性，並與原始 run 分開。

保存資料時要遵守資料最小化：遮罩 token、API key、個資與跨租戶內容；不要把未經授權的 chain-of-thought 當成必要的 production log。對於需要除錯的輸入，可保存 hash、短期加密 payload 或受控 artifact reference。

### 6. Production、Evaluation 與 Security 要共用觀測語意

Evaluation 若使用另一套 request path，繞過真實的 policy、timeout、retry 或 tool broker，測到的只是測試替身。較可靠的做法是共用：

- 相同的 execution event schema 與 trace context。
- 相同的工具 schema、授權檢查、budget、cancellation 與副作用分類。
- 隔離的 fixture／sandbox，而不是隔離控制邏輯。
- 能同時查看 transcript、trajectory、環境 outcome 與 audit evidence 的 episode package。

這也讓 production incident 可以轉成 regression case；修復後不只確認單一答案變好，還要確認工具、成本、延遲、權限與環境結果沒有退化。

### 7. 2026 年的實作取向

截至 2026-08-19，沒有一個可以取代所有責任的單一「Harness 標準」。較穩定的共識是使用可互通的事件與能力契約：OpenTelemetry 提供跨系統的 Semantic Conventions 思路；Anthropic 的 Agent Evals 將 transcript、tool calls 與 environment outcome 分開；NIST AI RMF 則提供風險治理的生命週期框架。這些資料支持「可觀測性是執行與評估的共同證據層」，但不表示任何特定框架自動具備安全性。

參考：

- [OpenTelemetry Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)
- [Anthropic：Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)

## 學習與評量對應

- **Concept ID**: `concept.ai.llm.observability`
- **Learning Objectives**:
  - `LO-1`: 能設計涵蓋 session、run、step、attempt、tool、checkpoint 與 outcome 的 AI trace 契約。
  - `LO-2`: 能以版本 lineage、分層指標與失敗歸因區分 model、retrieval、tool、runtime、environment 與 evaluator failure。
  - `LO-3`: 能在 PII、tenant isolation、audit、replay safety 與 evaluation evidence 之間做出可執行的觀測設計。
- **Prerequisites**: `concept.ai.llm.api-integration-reliability`, `concept.ai.rag.retrieval-generation-pipeline`
- **Quick Quiz**: [Q10](../../QUIZ/02_AI_and_Machine_Learning.md#q10-模型監控與-llm-可觀測性)
- **Hard Assessment**: [Agent Harness Reliability Incident](../../QUIZ/Hard_Assessments/agent_harness_reliability_incident.md) (`assessment.ai.agent-harness.reliability-incident.v1`)
- **Assessment Gate**: 能從一個 trace 還原 AI run 的版本、工具、policy、環境結果與成本／延遲訊號，並說明如何安全 replay，再進入 Agent Harness 與 Evaluation Harness。
