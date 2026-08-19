# Agent Harness Reliability Incident：從工具副作用到評估閘門

- **Assessment ID**: `assessment.ai.agent-harness.reliability-incident.v1`
- **主要 Concept ID**: `concept.ai.agent.harness.execution-loop`
- **次要 Concept IDs**:
  - `concept.ai.llm.observability`
  - `concept.ai.evaluation.harness.release-gates`
  - `concept.ai.llm.function-calling`
- **對應文章**:
  - [Agent Harness 與可靠執行迴圈](../../05_Specialized_Topics/AI_Engineering/agent_harness_and_execution_loop.md)
  - [LLM Observability 與 Trace 契約](../../05_Specialized_Topics/AI_Engineering/llm_observability_and_tracing.md)
  - [AI Evaluation Harness 與 Release Gates](../../05_Specialized_Topics/AI_Engineering/ai_evaluation_harness_and_release_gates.md)
- **題型**: `跨層故障診斷`, `可靠執行`, `安全控制`, `評估與發布`
- **難度**: 10
- **重要程度**: 5
- **建議作答時間**: 45–60 分鐘
- **標籤**: `Agent`, `Harness`, `Unknown Outcome`, `Checkpoint`, `Replay`, `Evaluation`, `Security`, `Multi-tenant`
- **Learning Objective IDs**:
  - `concept.ai.agent.harness.execution-loop/LO-1`
  - `concept.ai.agent.harness.execution-loop/LO-2`
  - `concept.ai.agent.harness.execution-loop/LO-3`
  - `concept.ai.llm.observability/LO-1`
  - `concept.ai.llm.observability/LO-2`
  - `concept.ai.llm.observability/LO-3`
  - `concept.ai.evaluation.harness.release-gates/LO-1`
  - `concept.ai.evaluation.harness.release-gates/LO-2`
  - `concept.ai.evaluation.harness.release-gates/LO-3`

## 測驗目標

評估候選人是否能把模型、Agent Harness、可靠執行核心、工具副作用、租戶安全、可觀測性與 Evaluation Harness 串成一條可驗證且可回滾的控制鏈，而不是只提出「換模型、增加 timeout 或多開 worker」。

## 問題情境與限制條件

你負責一個多租戶 Support Agent。它可以搜尋租戶文件、查詢訂單、建立支援工單、更新訂單備註，並在人工批准後執行退款。系統由 API、Agent worker、Tool Broker、政策服務、向量檢索、模型 Provider 與工單資料庫組成。

最近一次模型與 Harness 版本發布後，出現以下事件：

1. Agent 呼叫「建立工單」後等待超時，但工單服務的 request log 顯示資料其實已提交；worker 將 timeout 當成失敗並 retry，造成重複工單。
2. worker 在工具提交後、checkpoint 寫入前崩潰。恢復流程只讀取對話紀錄，沒有讀取 effect ledger，重新執行了已提交的更新。
3. 一份租戶上傳的惡意文件包含 indirect prompt injection，要求 Agent 忽略系統規則、讀取其他租戶文件，並把內容送到外部 webhook。
4. Agent 的 final answer 宣稱「已完成」，但部分案例的 environment outcome 顯示訂單備註沒有更新；另一部分案例則出現跨租戶候選文件。
5. 新模型在 final answer correctness 上升 4%，但平均 step 數上升 35%、token cost 上升 42%、P99 延遲上升 28%、tool error rate 上升，且只看 final answer 的離線評估沒有發現資料洩漏。
6. Canary 任務超過 run deadline 後仍持續重試 Provider，消耗共用 quota；同時 trace 缺少 policy decision、retrieval ACL result、checkpoint version 與 tool attempt 的關聯。

限制條件如下：

- 不能把 LLM output 當成授權來源；既有租戶隔離、人工批准與退款安全條件必須維持。
- 不能在 unknown outcome 後盲目重做 non-idempotent 或 irreversible operation。
- 評估環境可以使用 fixture、fake tool 和 sandbox，但不能繞過 production 的 policy、budget、timeout、audit、reconciliation 與 outcome verification。
- 必須保留既有可追蹤性與 rollback 能力；不能用刪除 audit log、關閉 ACL 或無限增加 retry 解決問題。

## 核心測驗

請以事故檢討、架構邊界、驗證證據和分階段交付計畫回答。可以使用文字、表格或架構圖，但每個主張都要指出需要的觀測證據。

## 作答要求

1. **重建因果鏈**：區分已知證據、合理假設與待驗證項目，說明 timeout、unknown outcome、checkpoint 遺失、resume duplicate、prompt injection、跨租戶檢索與 evaluation blind spot 如何互相放大。
2. **畫出責任邊界**：區分 Execution Boundary、Reliable Execution Kernel、Agent Harness、Tool Broker、Policy／Approval、Evaluation Harness 與真實 Environment；說明模型哪些只能提出意圖，哪些必須由控制面決定。
3. **設計工具可靠性**：為 read-only、idempotent write、non-idempotent write 與 irreversible tool 定義 timeout、retry、idempotency key、unknown outcome、查詢狀態、reconciliation、compensation 和人工升級行為。
4. **設計恢復與中止**：定義 run／step／attempt 狀態、step／token／cost budget、deadline、cancellation propagation、backpressure、checkpoint、resume、replay 與 kill switch；說明 worker restart 後如何避免重複副作用。
5. **設計安全控制**：處理 prompt injection、tenant／ACL filter、tool capability allowlist、schema validation、JIT credential、sandbox、network egress、approval binding、audit lineage 與 secret isolation。
6. **設計 Trace 與證據**：列出至少包含 `run_id`、`step_id`、`attempt_id`、model／prompt／tool／policy／dataset／index version、tenant、retry、checkpoint、outcome、cost、P95 和 audit decision 的事件；說明 PII 遮罩與安全 replay。
7. **設計 Evaluation Harness**：將 final answer、tool choice／arguments、policy、trajectory、environment outcome、security invariant、成本與延遲分開評估；加入 golden、regression、adversarial、production slice、holdout、deterministic grader、LLM judge calibration 和多次 trial。
8. **提出 Release Gate**：定義 `ship`、`do not ship`、`inconclusive`，列出 zero-tolerance hard gate、品質／可靠性／成本／延遲門檻，以及 shadow、canary、停止條件、rollback 和已產生副作用的處理。

## 期待證據

- 能明確表示 tool timeout 後的 `unknown outcome`，並提出狀態查詢或 reconciliation，而非直接 retry。
- 能將 model proposal 與 policy authorization 分離，指出跨租戶檢索、外部 webhook、退款與工單工具的最小 capability。
- 能以 effect ledger、business idempotency key、checkpoint version 和 durable event 說明 crash recovery 不會重複更新。
- 能用 trace 還原一次 run 的 model、prompt、retrieval candidate、ACL decision、tool attempt、policy、checkpoint 與 environment outcome。
- 能說明 replay 不應執行真實 side effect，並提出 fixture、snapshot、recorded response 或隔離 sandbox。
- 能以 deterministic grader 驗證資料庫狀態、ACL invariant、工具 schema、approval binding、step／cost budget 與 trace completeness。
- 能處理 LLM-as-a-Judge 的 rubric、calibration set、judge version、位置偏差與 judge drift，且不讓安全判定只依賴模型裁判。
- 能提出安全、功能、可靠性、成本與延遲的分層 gate，並知道單一平均分數不能抵銷跨租戶資料洩漏或未授權副作用。
- 能提出至少三階段可逆 rollout：止血與隔離、修復控制與證據、最後才調整模型／檢索／容量；每階段有 canary 範圍、停止條件與 rollback artifact。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議換模型、增加 timeout、增加 worker 或重啟；沒有處理 unknown outcome、授權、租戶隔離、checkpoint 或評估證據。 |
| 1 | 能列出 retry、RAG、prompt injection、trace、canary 等名詞，但無法建立因果鏈，也沒有可驗證的狀態或 release gate。 |
| 2 | 能指出部分工具重試、checkpoint 或資料洩漏問題並提出修復，但遺漏至少兩個核心面向，例如 policy／approval、environment outcome、replay safety、grader bias 或 rollback。 |
| 3 | 能整合 Execution Kernel、Agent／Evaluation Harness、Tool Broker、租戶安全與多層評估，提出狀態轉移、證據、門檻、故障注入與三階段交付。 |
| 4 | 除上述內容外，能精準處理 unknown outcome、effect ledger、reconciliation、approval binding、cross-tenant invariant、fixture replay、LLM judge calibration、統計不確定性與已提交副作用的 rollback／compensation。 |

### 通過標準

整體總評達 **3/4 分**才通過；以下五個面向均不得低於 2 分：**執行與恢復**、**工具與授權**、**租戶與安全**、**觀測與 replay**、**評估與發布**。答案必須至少提出一個 hard security gate、一個 unknown outcome 處理、一個 checkpoint／resume 策略、一個 environment outcome verifier 與一個可執行 rollback 條件。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先把「模型回答成功」與「系統完成任務」分開。事故的第一條鏈是：工單 commit 與 client timeout 的時間點不確定，worker 將 unknown outcome 當成 failed，retry 造成 duplicate side effect；worker 又在 checkpoint 前崩潰，resume 只依賴 conversation history，再次執行已提交的更新。這條鏈需要 request id、provider／tool request id、idempotency key、commit log、checkpoint version 和 effect ledger 證明，不能只看 HTTP status。

第二條鏈是資料與安全：惡意文件、retrieval result 和 tool output 都是不可信輸入，不能修改 system policy 或直接取得其他租戶 capability。ACL 必須在可信檢索邊界套用，Tool Broker 必須再次檢查 tenant、身份、資料範圍、schema、外部目的地與 approval；模型只能提出 intent。跨租戶候選、secret access、外傳 webhook、approval mismatch 和未授權 write 都是零容忍事件。

架構應採用 `Execution Boundary → Reliable Execution Kernel → Agent Harness + Evaluation Harness → Assurance Profiles`。Execution Boundary 限制 sandbox、filesystem、network 和 secret；Kernel 管理 run／step／attempt、budget、deadline、timeout、cancel、checkpoint、reconciliation、audit、trace 和 replay；Agent Harness 負責 context、model loop、tool orchestration 與 verification；Evaluation Harness 在隔離 fixture 中重複執行 task、保存 trajectory、檢查 outcome 並聚合 grader。Security Validation Profile 可以提供攻擊案例和安全 oracle，但不能另建一條繞過 Kernel 的執行流程。

對建立工單與更新訂單備註，應使用 business idempotency key 和 effect ledger。timeout 後先進入 unknown／pending，查詢工單服務或由 reconciliation worker 對帳；查不到結果時升級人工，不得猜測或直接重做。worker restart 先讀 durable checkpoint，再處理所有 unknown effect；已提交的 effect 標記完成，未提交且仍在 deadline 內才重新排程。checkpoint 應保存下一個合法 transition、policy／tool schema version、剩餘 budget 與 effect reference。

Evaluation 不能只評 final answer。每個 task 要有多次 trial、trajectory、tool choice／arguments、policy decision、environment snapshot／outcome、cost、latency 和 security invariant。deterministic grader 優先驗證資料庫狀態、工單數量、ACL、schema、approval、budget 和 trace completeness；model-based grader 只處理較難形式化的語意品質，並以固定 rubric 和 human calibration set 檢查偏差。新模型即使答案正確率上升，只要跨租戶洩漏、未授權副作用、cost、P99 或 tool error 超過門檻，就必須 `do not ship`；若樣本或 grader 證據不足，結果應是 `inconclusive`。

交付分三階段。第一階段止血：停用高風險 write tool 與外部 egress、撤銷受影響 agent credential、強制 ACL／policy／approval、停止 unknown outcome 的盲目 retry、設定 run deadline／step／cost cap、保留安全版本並開啟完整 audit。第二階段修復：完成 effect ledger、idempotency、reconciliation、checkpoint／resume、cancellation、trace contract、fixture replay、adversarial suite 和 environment grader，先在 shadow 與隔離 canary 驗證。第三階段才調整模型、prompt、retrieval 或 worker concurrency；每次保留舊 artifact、資料／索引／cache namespace 和補償方案，若 hard gate 失敗立即 rollback 或 quarantine。

</details>

## 常見失分點

- 把 timeout 等同於「工具沒有執行」，沒有表示 unknown outcome。
- 讓模型輸出、prompt 或人工 UI 的顯示內容直接成為授權依據。
- 只保存對話紀錄，沒有 effect ledger、checkpoint version、reconciliation 和 durable event。
- 只看 final answer 或 LLM-as-a-Judge，沒有檢查 tool arguments、policy、environment outcome、成本與安全 invariant。
- 把 Security Harness 做成另一套 runtime，導致測試繞過 production 的 policy、budget、retry 或 sandbox。
- 只說逐步放量，卻沒有 canary 停止條件、rollback artifact、已產生副作用的 reconciliation 和 kill switch。

## 延伸追問

1. 如果工單服務完全不支援查詢狀態，你會如何設計 pending、人工 reconciliation、outbox／inbox 或業務補償，讓使用者不會被誤告知成功？
2. 如果跨租戶問題只出現在少數 production slice，你會如何利用 ACL decision、retrieval candidate、cache key、trace 與 replay 定位污染來源？
3. 如果 canary 的品質提升但 cost 和 P99 惡化，你會如何設計分層 gate、租戶級 rollout、budget 和 fallback，而不是用總平均掩蓋長尾？
4. 如果人工批准後模型改變了 tool argument，你會如何讓 approval binding、參數 hash、policy version 和 audit evidence 阻止未重新批准的執行？
5. 哪些證據達成後，才值得把 Tool Broker 或 Evaluation Harness 拆成獨立服務；哪些情況應保留在同一個模組化單體中？
