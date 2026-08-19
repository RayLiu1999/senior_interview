# AI Engineering (AI 工程)

隨著大型語言模型 (LLM) 的普及，AI Engineering 已成為後端工程師的重要技能分支。本章節專注於如何**應用** AI 模型來構建系統，而非訓練模型。

本章的主軸是 **Reliable AI Systems**：模型只提出意圖，系統仍必須在受控的執行邊界中完成授權、工具呼叫、狀態保存、恢復、觀測與評估。依照這個責任分層閱讀，可以避免把某個 Agent framework 誤當成可靠性本身。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [AI Engineer 必備技能圖譜](./required_skills_for_ai_engineer.md) | 5 | 5 | `Roadmap`, `Career`, `Overview` |
| 2 | [RAG (檢索增強生成) 核心原理](./rag_fundamentals.md) | 6 | 5 | `RAG`, `Vector DB`, `Embeddings` |
| 3 | [Prompt Engineering 基礎與進階](./prompt_engineering_basics.md) | 4 | 4 | `Prompting`, `CoT`, `LLM` |
| 4 | [MLOps vs LLMOps](./mlops_and_llmops.md) | 6 | 4 | `MLOps`, `LLMOps`, `DevOps` |
| 5 | [LLM Observability 與 Trace 契約](./llm_observability_and_tracing.md) | 8 | 5 | `Observability`, `Tracing`, `LLMOps`, `Privacy` |
| 6 | [Agent Harness 與可靠執行迴圈](./agent_harness_and_execution_loop.md) | 9 | 5 | `Agent`, `Harness`, `Runtime`, `Reliability`, `Security` |
| 7 | [AI Evaluation Harness 與 Release Gates](./ai_evaluation_harness_and_release_gates.md) | 9 | 5 | `Evaluation`, `Regression`, `Release`, `Quality` |

---

## 學習建議

1. **先建立邊界**: 先閱讀 **技能圖譜**、RAG 與 Prompt，理解模型、資料、工具和後端系統各自負責什麼。
2. **先觀測再自動化**: 閱讀 Observability，為一次 `run` 建立可追蹤的 trace、版本 lineage、成本／延遲訊號與安全遮罩。
3. **再理解 Harness**: 依序學習 Execution Kernel、Agent Harness 與 Evaluation Harness；重點是狀態、權限、恢復、重播與環境結果，而不是框架 API。
4. **用測驗驗證**: 完成對應 Quick Quiz，再以 [Agent Harness Reliability Incident](../../QUIZ/Hard_Assessments/agent_harness_reliability_incident.md) 驗證跨層設計能力。
5. **延伸到生產**: 最後回到 LLMOps 的 canary、rollback、SLO 與 incident learning，形成可持續的品質閉環。
