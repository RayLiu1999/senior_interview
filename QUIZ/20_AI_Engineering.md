# AI Engineering - 重點考題 (Quiz)

> 這份考題聚焦於 AI 功能從 RAG 與 prompt 設計走到 MLOps／LLMOps 生產運維時，資深後端工程師必須掌握的品質、安全、成本與交付邊界。
>
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

## AI Production Foundations

### Q1: MLOps and LLMOps Evaluation
<!-- Concept ID: concept.ai.mlops-llmops.evaluation-release-operations; Learning Objective IDs: concept.ai.mlops-llmops.evaluation-release-operations/LO-1, concept.ai.mlops-llmops.evaluation-release-operations/LO-2, concept.ai.mlops-llmops.evaluation-release-operations/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請比較 MLOps 與 LLMOps 的資產、評估、部署與監控差異，並說明如何讓模型、資料、prompt 與 retriever 變更可追蹤、可驗證、可回滾。

<details>
<summary>💡 答案提示</summary>

- MLOps 要追蹤資料集、特徵、模型權重、訓練參數、漂移、離線／線上指標與 serving artifact；LLMOps 還要追蹤 prompt、模型／Provider、token、context、工具與引用。
- 評估不能只看平均回答品質。應分層量測 accuracy／calibration 或 recall、faithfulness、citation correctness、safety、成本、TTFT、P95/P99 與錯誤率。
- 以 immutable artifact、版本化評估集、registry、canary、shadow traffic、feature flag 與明確的品質／成本／安全 rollback 門檻管理上線。

</details>

📖 [查看完整答案](../05_Specialized_Topics/AI_Engineering/mlops_and_llmops.md)

### Q2: Prompt Version Cost and Safety Controls
<!-- Concept ID: concept.ai.prompt.version-cost-safety-controls; Learning Objective IDs: concept.ai.prompt.version-cost-safety-controls/LO-1, concept.ai.prompt.version-cost-safety-controls/LO-2, concept.ai.prompt.version-cost-safety-controls/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

如何管理 prompt 的版本、token 預算、結構化輸出與 prompt injection 風險，使 prompt 變更不會在品質、成本或安全上悄悄回歸？

<details>
<summary>💡 答案提示</summary>

- 把 system instruction、user input、retrieved context、tool output 與 model output 分開，對每一層定義信任邊界和 schema。
- 每個 prompt 版本要有 owner、變更原因、評估集、token budget、模型／Provider 相容性與 canary 結果；按租戶和功能記錄 token、成本、延遲與品質抽樣。
- 使用輸入分隔、內容標記、工具 allowlist、輸出 schema／policy validation、敏感資料遮罩與拒答測試；若安全或成本門檻超標，回切上一個 prompt／模型組合。

</details>

📖 [查看完整答案](../05_Specialized_Topics/AI_Engineering/prompt_engineering_basics.md)

### Q3: RAG Evaluation and Retrieval Quality
<!-- Concept ID: concept.ai.rag.retrieval-generation-quality; Learning Objective IDs: concept.ai.rag.retrieval-generation-quality/LO-1, concept.ai.rag.retrieval-generation-quality/LO-2, concept.ai.rag.retrieval-generation-quality/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

如何分開評估 RAG 的 indexing、retrieval、reranking、context、generation 與安全隔離，並在 recall、引用正確性、freshness、延遲和成本之間做取捨？

<details>
<summary>💡 答案提示</summary>

- Retrieval 用 recall@k、precision、MRR／nDCG、候選數與 query latency；generation 用 correctness、faithfulness、citation correctness、拒答率與格式合規。
- embedding model、dimension、distance metric、index version、chunking 和文件版本必須可追蹤；ACL／tenant filter 應在檢索邊界生效，而非取全域 top-k 後才刪除。
- 以固定 ground-truth query set、線上抽樣、故障注入與 index／embedding canary 驗證，保留舊 namespace 或可重建 projection 以便回滾。

</details>

📖 [查看完整答案](../05_Specialized_Topics/AI_Engineering/rag_fundamentals.md)

### Q4: AI Engineer Production Capabilities
<!-- Concept ID: concept.ai.ai-engineer.production-capability-map; Learning Objective IDs: concept.ai.ai-engineer.production-capability-map/LO-1, concept.ai.ai-engineer.production-capability-map/LO-2, concept.ai.ai-engineer.production-capability-map/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

一位 AI Engineer 要如何把模型、資料、prompt、RAG、agent、部署、觀測性與產品需求組合成能長期運作的 production capability？

<details>
<summary>💡 答案提示</summary>

- 先從業務結果和失敗成本定義 quality、safety、latency、cost、freshness 與 availability 的門檻，再決定模型、資料和工具方案。
- 交付鏈要包含資料／prompt／模型版本、評估集、離線與線上指標、權限隔離、trace、人工升級、canary 與 rollback。
- 能力成熟度不只看 demo；要用 incident learning、故障注入、回歸測試、成本配額、runbook 與 ownership 證明系統可操作。

</details>

📖 [查看完整答案](../05_Specialized_Topics/AI_Engineering/required_skills_for_ai_engineer.md)

## 學習進度檢核

| 評估項目 | 自評 |
| :--- | :---: |
| 能區分 MLOps／LLMOps 資產與評估邊界 | ⬜ |
| 能管理 prompt 版本、token 成本與安全防護 | ⬜ |
| 能分層評估 RAG retrieval、generation 與 ACL | ⬜ |
| 能提出 production-ready 的 AI capability 與 rollback | ⬜ |

**建議**：四題都能回答後，再進入 [AI／Engineering Management Delivery Incident](./Hard_Assessments/ai_management_delivery_incident.md) 做跨主題實戰。
