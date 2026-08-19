# AI Evaluation Harness 與 Release Gates

- **難度**: 9
- **重要程度**: 5
- **標籤**: `Evaluation`, `Agent`, `Regression`, `Release`, `Quality`, `Statistics`

## 問題詳述

Agent 的品質不能只用一個 final answer 分數表示。請設計一套 Evaluation Harness，能在隔離環境中重複執行 task、保存完整 trajectory、檢查工具與環境結果、控制 grader 偏差，並以品質、安全、成本、延遲和可靠性共同決定是否放量。

## 核心理論與詳解

Evaluation Harness 的功能不是「呼叫模型後打分」，而是把一次多步 AI 行為變成可重複、可比較、可追責的實驗。它應與 production 共用執行語意，但使用隔離的資料、工具 fixture、credential 和環境，避免評估本身產生真實副作用。

### 1. Evaluation 的基本單位

| 名稱 | 定義 | 常見錯誤 |
| :--- | :--- | :--- |
| **Task** | 有輸入、限制條件與成功標準的一個測試案例 | 只描述問題，沒有定義環境成功狀態 |
| **Trial** | Task 的一次執行嘗試 | 只跑一次就把非確定性當成能力 |
| **Trajectory／Transcript** | 該 trial 的模型回應、工具呼叫、觀察、policy decision 與事件順序 | 只保存最後答案，無法定位失敗 |
| **Outcome** | trial 結束時受控環境的實際狀態 | 相信模型宣稱成功，而沒有查資料庫或 fixture |
| **Grader** | 對答案、軌跡、政策或環境結果做檢查的規則 | 用一個模糊總分掩蓋安全違規 |
| **Evaluation Suite** | 一組針對同一能力或風險的 task | 只含 happy path，沒有回歸與攻擊切片 |

評估一個 Agent 時，實際上是在評估 **model + Agent Harness + tools + environment** 的組合。更換 retry policy、tool schema、權限或環境 fixture，都可能改變結果，即使模型沒有變。

### 2. 分層評估：答案、軌跡、政策、環境

至少要分開評估以下五個面向：

1. **Final answer**：內容正確、完整、引用正確、格式符合、該拒答時有拒答。
2. **Tool decision**：工具選擇、參數 schema、參數值、呼叫順序與不必要呼叫。
3. **Policy and safety**：是否越過 capability、tenant、資料分類、approval、network 或 secret 邊界。
4. **Environment outcome**：資料庫狀態、檔案內容、工單數量、資源配置或測試套件的實際結果。
5. **Operational budget**：步數、token、成本、TTFT、P95／P99、retry amplification、queue time 與 cancellation。

安全違規和未授權副作用應是 blocking assertion；不能因為 final answer 很漂亮，就把一次資料外洩平均成 95 分。

### 3. Dataset 不是一張 golden answer 表

一個能支援 release 的 suite，通常要包含：

- **Golden cases**：正常路徑與明確預期結果，用來建立最低品質基線。
- **Regression cases**：過去發生過的 production incident，修復後不得再次出現。
- **Adversarial cases**：prompt injection、惡意文件、越權查詢、tool abuse、敏感資料外傳與資源耗盡。
- **Production slices**：去識別化後依租戶、語言、資料新鮮度、流量和風險分層的代表性案例。
- **Holdout cases**：不在日常調參過程暴露的保留集，用來降低對測試集過擬合。

每個 task 要版本化輸入、預期 outcome、允許工具、資料 snapshot、policy、model／prompt、grader 與預算。當成功標準改變時，應建立新的 task version，而不是覆蓋歷史結果。

### 4. Grader 的分工與 LLM-as-a-Judge 控制

優先使用可確定驗證的 grader：

- **Code-based grader**：schema、regex、單元測試、靜態分析、資料庫查詢、檔案 diff、權限 invariant 和成本／延遲門檻。
- **Model-based grader**：需要語意判斷的相關性、風格、指令遵循或開放式品質；必須使用 rubric、正反例與固定版本。
- **Human grader**：高風險、模糊或需要業務判斷的案例；適合校準自動 grader，而不是每個 trial 都人工處理。

LLM-as-a-Judge 不是客觀真理。至少要記錄 judge model、prompt、temperature／sampling、rubric、輸入順序與版本；建立人工作為基準的 calibration set，檢查 judge-human agreement、位置偏差、模型偏好、長度偏差與 judge drift。安全判定不能只依賴另一個 LLM 的一句「看起來安全」。

### 5. 統計與比較：不要被單次平均數誤導

模型輸出具有隨機性，評估應依任務風險與成本重複 trial。比較兩個版本時：

1. 使用相同 task、fixture、budget 與 policy，形成 paired comparison。
2. 對高變異 task 執行多次 trial，分別記錄成功率、分布與失敗類型。
3. 回報信賴區間、effect size、實際改善幅度與成本／延遲變化，不只報平均分。
4. 依語言、租戶、資料類型、工具、風險與長尾任務做 slice analysis。
5. 若樣本不足、grader 不一致或品質與安全訊號衝突，結果應為 **inconclusive**，而不是強行通過。

「新模型 final answer 分數上升」只有在 tool correctness、environment outcome、安全 invariant、成本和延遲也沒有不接受的回歸時，才可解讀成系統改善。

### 6. Evaluation Contract 與 Release Gate

Release gate 應先定義合約，再執行測試。結果至少分成三種：

| 結果 | 意義 | 後續動作 |
| :--- | :--- | :--- |
| `ship` | 必要品質達標、blocking security assertions 全部通過、成本／延遲在預算內 | 允許 shadow、canary 或逐步放量 |
| `do not ship` | 有安全違規、關鍵回歸、未授權副作用或不可接受的成本／延遲 | 阻擋發布、回到上一個 artifact 或修復後重跑 |
| `inconclusive` | 信賴區間太寬、環境不穩定、grader 不一致或證據不完整 | 增加樣本、修正 harness／grader，不能當成通過 |

建議採用四層門檻：

- **Hard safety gate**：跨租戶資料洩漏、secret exfiltration、sandbox escape、approval bypass、未授權 write 必須為零。
- **Functional gate**：task success、answer correctness、tool argument correctness、environment invariant 達到最低標準。
- **Reliability gate**：timeout、unknown outcome、resume、retry amplification、cancellation、trace completeness 不得超過門檻。
- **Economic／performance gate**：token、cost per task、TTFT、P95／P99、queue age 和 provider quota 在預算內。

門檻應以 slice 及整體同時檢查；不能只看總平均，也不能讓低風險 happy path 稀釋高風險失敗。

### 7. Shadow、Canary 與 Rollback

離線 evaluation 通過後仍要驗證真實流量特性：

1. **Shadow**：新版本接收複製輸入但不產生真實副作用，觀察成本、延遲、工具選擇與 trace 完整性。
2. **Canary**：以小比例、低風險租戶或可控 task 放量；維持明確的停止條件與 kill switch。
3. **Progressive rollout**：每一階段只改變少數主要變數，保留舊 model、prompt、tool、policy、index 與 fixture 版本。
4. **Rollback**：回切 artifact 之外，也要處理已寫入的資料、queue、cache、索引、checkpoint 與未確認的 tool effect。

一個 release 的證據包應包含 task／trial／trajectory、grader 結果、環境 snapshot、版本 lineage、統計摘要、失敗案例、canary 指標與 rollback plan。沒有證據包，就沒有可審查的 release decision。

### 8. Evaluation Harness 不應繞過 Production Controls

測試環境可以使用 fake provider、fake tool、fixture database 和 sandbox，但不應關掉 production 會使用的：

- tool schema validation、policy check、tenant filter、approval binding；
- timeout、deadline、budget、retry、cancel、checkpoint、reconciliation；
- trace、audit、event schema、PII redaction 和 outcome verification。

否則評估會產生 harness drift：測試通過的是一條較寬鬆的捷徑，正式環境卻走另一套控制流程。最好的共用方式不是共用 production data，而是共用 execution interface、事件語意與 policy contract，並用隔離的 fixture 取代真實副作用。

### 9. 2026 年的評估趨勢與限制

截至 2026-08-19，Agent Evaluation 的重點已從單輪文字比較移向多步 trajectory、工具呼叫與 environment outcome。Anthropic 的公開方法將 code-based、model-based 和 human graders 組合；OpenAI Evals 與 Stanford HELM 則提供可重複 benchmark／eval 的參考方向。這些資源不是保證可靠性的認證，真正的 gate 仍必須由產品風險、資料邊界、工具副作用與可接受成本定義。

參考：

- [Anthropic：Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [OpenAI Evals](https://github.com/openai/evals)
- [Stanford HELM](https://crfm.stanford.edu/helm/index.html)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)

## 學習與評量對應

- **Concept ID**: `concept.ai.evaluation.harness.release-gates`
- **Learning Objectives**:
  - `LO-1`: 能區分 task、trial、trajectory、grader、environment outcome 與 evaluation suite，設計可重複的 Agent 評估資料。
  - `LO-2`: 能組合 deterministic、model-based 與 human grader，處理多次 trial、slice、信賴區間、effect size 與 LLM-as-a-Judge 校準。
  - `LO-3`: 能建立涵蓋安全、功能、可靠性、成本與延遲的 `ship`／`do not ship`／`inconclusive` release gate，並設計 shadow、canary 與 rollback。
- **Prerequisites**: `concept.ai.llm.observability`, `concept.ai.mlops-llmops.evaluation-release-operations`, `concept.ai.agent.harness.execution-loop`
- **Quick Quiz**: [Q6](../../QUIZ/20_AI_Engineering.md#q6-為什麼-final-answer-分數上升不代表-agent-真的變好)
- **Hard Assessment**: [Agent Harness Reliability Incident](../../QUIZ/Hard_Assessments/agent_harness_reliability_incident.md) (`assessment.ai.agent-harness.reliability-incident.v1`)
- **Assessment Gate**: 能為一個多步 Agent 建立 task／trial／trajectory／outcome 評估，校準 grader，提出 blocking safety gate 與可回滾的 canary decision，再進入跨層 Incident Assessment。
