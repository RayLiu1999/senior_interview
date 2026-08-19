# Agent Harness 與可靠執行迴圈

- **難度**: 9
- **重要程度**: 5
- **標籤**: `Agent`, `Harness`, `Runtime`, `Reliability`, `Security`, `Tool Use`

## 問題詳述

Agent 不只是「模型多呼叫幾次工具」。請說明 Agent Harness、Runtime、Execution Boundary 與 Evaluation Harness 的責任邊界，並設計一個能處理權限、狀態、timeout、重試、取消、checkpoint、恢復與外部副作用的可靠執行迴圈。

## 核心理論與詳解

截至 2026-08-19，`harness` 在不同團隊可能指 agent scaffold、evaluation runner、sandbox 或整個工程環境，尚沒有單一正式標準。本篇採用能力模型，而不是把概念綁定到 LangChain、LangGraph、MCP 或某個模型 SDK：

> **Harness 是讓模型在受控環境中執行多步任務，並具備狀態、工具、權限、驗證、恢復、觀測與回饋迴路的工程層。**

### 1. Canonical architecture：不要建立三套平行 Runtime

推薦的責任分層如下：

| 層級 | 主要責任 | 不應由它單獨保證的事情 |
| :--- | :--- | :--- |
| **Execution Boundary** | Sandbox／container／process、filesystem、network egress、secret 與 tenant 隔離 | 不負責決定任務是否完成 |
| **Reliable Execution Kernel** | Run／step／attempt state、checkpoint、resume、budget、deadline、timeout、cancel、retry、idempotency、effect ledger、event、audit、replay | 不負責產生模型意圖 |
| **Agent Harness** | Context、instruction、model loop、tool orchestration、task state、termination、verification | 不得把模型輸出當成授權 |
| **Evaluation Harness** | Task、trial、trajectory、grader、environment outcome、statistics、regression、release gate | 不應繞過 production policy 或工具邊界 |
| **Assurance Profiles** | Security、Reliability、Functional、Cost／Latency 等測試情境與門檻 | 不應重新實作另一套 execution loop |

因此整體關係是：

> `Execution Boundary → Reliable Execution Kernel → Agent Harness + Evaluation Harness → Security／Reliability／Functional Profiles`

Security Profile 可以注入 prompt injection、惡意文件、fake tool、canary secret 與 side-effect trap，但真正的 deny-by-default、secret isolation、network restriction 和 policy enforcement 必須在 Kernel 或 Execution Boundary 生效。

### 2. Execution Contract：先定義可觀測的狀態轉移

一次可靠的 Agent run 至少要能描述：

1. `RunCreated`：建立租戶、身份、任務、deadline 和 budget。
2. `StepStarted`：開始一個有上限的狀態轉移。
3. `IntentProposed`：模型提出回答、檢索或工具意圖；此時仍未授權。
4. `PolicyEvaluated`：獨立的 policy engine 檢查身份、capability、租戶、資源與 approval。
5. `ToolAttempted`：記錄 schema 驗證、idempotency key、attempt、timeout 與 cancellation。
6. `ObservationRecorded`：把工具結果、錯誤或未知結果回饋給下一步。
7. `CheckpointCommitted`：在安全恢復邊界持久化 control state 與 effect reference。
8. `OutcomeVerified`：由受控環境或明確 verifier 驗證任務結果。
9. `RunFinished`：以 success、failed、cancelled、aborted 或 inconclusive 結束。

Model output 是 **proposal**，不是 **authorization**。模型可以說「退款」，但不能因此取得退款權限；policy、tool broker 與業務服務仍需重新檢查身份、租戶、資源所有權、風險等級與人工批准。

### 3. State 與 External Effect 必須分離

只保存 conversation history 無法安全恢復。至少要區分：

- **Control state**：目前 step、下一個可執行動作、budget、deadline、policy version、retry state。
- **Durable state**：checkpoint、resume token、租戶與任務 metadata。
- **Effect state**：外部工具是否已提交、provider request id、idempotency key、reconciliation status。
- **Telemetry state**：trace、metrics、audit 與評估證據；它們不能反過來授權副作用。

工具結果也不能只有成功／失敗兩種。當 client、worker 或網路在 commit 附近 timeout 時，正確狀態可能是 **unknown outcome**：工具可能已經成功，也可能尚未執行。此時必須查詢狀態、等待 reconciliation、交給人工處理或採用業務補償；不能直接盲目 retry。

### 4. 依副作用分類設計 Retry、Idempotency 與 Compensation

| 工具類型 | 例子 | 可靠性策略 |
| :--- | :--- | :--- |
| Read-only | 查詢政策、讀取訂單 | 可在 deadline 內有限重試，但仍需 timeout 和 tenant filter |
| Idempotent write | 以固定 key 更新標籤、設定狀態 | 使用 business idempotency key，重試前確認版本或狀態 |
| Non-idempotent write | 建立工單、寄送通知 | 先記錄 intent，timeout 後查詢或進入 pending／reconciliation |
| Irreversible operation | 付款、刪除、發布 | deny-by-default、明確 approval、二次驗證、可審計且盡量拆成可補償流程 |

`retry budget` 必須由可靠性核心控制，而不是讓模型決定。重試還要受到 run deadline、step budget、token budget、cost budget、provider quota 和租戶配額共同限制；當預算用盡，應回傳可理解的降級或人工升級結果。

### 5. Timeout、Deadline、Cancellation 與 Backpressure

- **Timeout** 是單一呼叫的上限；**deadline** 是整個 run 的截止時間，子呼叫不能重設為更晚時間。
- **Cancellation** 必須沿著 model、retrieval、tool、worker 和 queue 傳播；client disconnect 不代表背景副作用可以無限繼續。
- **Backpressure** 以有界 queue、concurrency limit、admission control 和優先級保護系統；無界排隊只會把 Provider quota、記憶體與尾延遲推遲爆炸。
- **Kill switch** 應能按 agent、tool、租戶、版本或風險層級停止新執行，並撤銷短期 credential。
- **Unknown outcome** 的 reconciliation 不應被一般 retry queue 混在一起，否則恢復流程會再次產生副作用。

### 6. Checkpoint、Resume 與 Replay

Checkpoint 應放在可說明的狀態邊界，而不是每一行推理都保存。至少要包含：已完成的 step、工具 effect reference、policy／tool schema version、剩餘預算、輸入 artifact version 和下一個合法 transition。

恢復時要先做 reconciliation：

1. 讀取最後一個 durable checkpoint。
2. 查詢所有 `unknown outcome` 的工具狀態。
3. 將已提交 effect 標記為完成，未提交 effect 才能重新排程。
4. 若無法確定，進入人工處理或安全終止，不要猜測。
5. 用原始 trace 和新的 resume trace 關聯，保留完整 lineage。

Replay 預設不執行真實 side effect。可使用 recorded model／tool response、fixture environment 或 snapshot；若必須重新呼叫模型，應使用隔離的 stochastic trial，並明確標示它不是原始事件的精確重現。

### 7. Policy、Sandbox 與 Human Approval

安全控制是 execution path 的一部分，不是 Agent 完成後才做的掃描：

- **Tool allowlist**：每個 agent 只能看見任務所需的最小 capability。
- **Policy-as-code**：以身份、租戶、資源、資料分類、風險與環境決定 allow／deny／approval。
- **JIT credential**：工具只在獲准的短時間與範圍取得必要憑證，不把全域 secret 放進 prompt。
- **Sandbox 與 egress control**：限制檔案、程序、網路、DNS、metadata service 與外傳目的地。
- **Approval binding**：人工批准必須綁定不可悄悄修改的 action intent、參數 hash、資源、租戶與有效期限；批准後若參數變更，必須重新批准。
- **Audit lineage**：保留誰提出、誰授權、哪個版本執行、是否產生副作用與最終環境結果。

Prompt injection 防護不能只靠「請模型忽略惡意文字」。文件、檢索結果、工具輸出和使用者內容都應被視為不可信資料，必須在 control plane 重新驗證 capability、schema、資料範圍與外部目的地。

### 8. Workflow、Agent 與 Framework 的取捨

Workflow 是預先定義步驟、分支與人工節點；Agent 則讓模型在受限的 action space 中動態決定下一步。動態性增加了適應能力，也增加了測試空間、失敗傳播、成本與安全風險。

實作上應先用最小、可組合的 workflow，只有在需求真的需要模型動態決策時才引入 Agent loop。框架可以協助描述 graph、tool adapter 或 state，但不能自動提供：

- durable checkpoint 與外部副作用 reconciliation；
- 跨工具的授權與 approval binding；
- 真實環境 outcome verification；
- 可重現 replay 與統計可靠的 evaluation；
- 成本、deadline、cancellation 和 tenant isolation。

### 9. 2026 年的 Harness Engineering 重點

近期公開資料對 harness 的共同啟示，是把「可讓 Agent 工作的環境」也當成工程產品：repository／specification 要可理解，工具與狀態要可檢查，驗證與 feedback loop 要可自動化。這並不等於讓 Agent 取代 control plane，而是要求工程師把邊界、證據與可恢復性做成明確契約。

參考：

- [OpenAI：Harness engineering](https://openai.com/index/harness-engineering/)
- [Anthropic：Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Anthropic：Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/)

## 學習與評量對應

- **Concept ID**: `concept.ai.agent.harness.execution-loop`
- **Learning Objectives**:
  - `LO-1`: 能區分 Execution Boundary、Reliable Execution Kernel、Agent Harness、Evaluation Harness 與 Assurance Profile 的責任。
  - `LO-2`: 能設計包含 state、budget、deadline、timeout、retry、cancel、checkpoint、resume、replay 與 unknown outcome 的執行契約。
  - `LO-3`: 能以 tool capability、policy、sandbox、approval、idempotency、reconciliation 與 environment verification 控制 Agent 的外部副作用。
- **Prerequisites**: `concept.ai.llm.function-calling`, `concept.ai.llm.api-integration-reliability`, `concept.ai.llm.observability`
- **Quick Quiz**: [Q5](../../QUIZ/20_AI_Engineering.md#q5-agent-harness-runtime-workflow-與-evaluation-harness)
- **Hard Assessment**: [Agent Harness Reliability Incident](../../QUIZ/Hard_Assessments/agent_harness_reliability_incident.md) (`assessment.ai.agent-harness.reliability-incident.v1`)
- **Assessment Gate**: 能處理一次具有未知工具結果、worker restart、人工批准與跨租戶風險的 Agent run，並說明恢復、審計與安全終止條件，再進入 Evaluation Harness。
