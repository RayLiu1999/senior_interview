# AI 與機器學習 (AI and Machine Learning)

AI 與機器學習正在深刻改變後端開發的格局。作為資深後端工程師，你需要掌握如何將 AI 能力整合到生產系統中，而不僅僅是了解模型訓練。本分類專注於 **LLM 整合、向量資料庫、模型服務** 等實務技能，以及如何設計和優化 AI 驅動的後端架構。

2024-2025 年，RAG (Retrieval-Augmented Generation) 架構、向量資料庫、LLM API 整合已成為面試高頻考點。這些技術讓後端工程師能夠快速構建智能應用，無需深入機器學習理論。

## 主題列表

### 1. LLM_Integration (大型語言模型整合)

這是當前最熱門的領域。理解如何整合 LLM、設計 Prompt、處理 Token 和成本控制是資深後端工程師的必備技能。

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [什麼是大型語言模型 (LLM)](./LLM_Integration/what_is_llm.md) | 4 | 5 | `LLM`, `AI基礎`, `GPT` |
| 2 | [LLM API 整合與最佳實踐](./LLM_Integration/llm_api_integration.md) | 5 | 5 | `OpenAI`, `API設計`, `整合` |
| 3 | [Prompt Engineering 完整指南](./LLM_Integration/prompt_engineering.md) | 5 | 5 | `Prompt`, `LLM`, `最佳實踐` |
| 4 | [RAG 架構設計與實現](./LLM_Integration/rag_architecture.md) | 7 | 5 | `RAG`, `架構設計`, `向量搜尋` |
| 5 | [LLM 的限流與成本控制](./LLM_Integration/llm_rate_limiting_and_cost.md) | 6 | 4 | `限流`, `成本優化`, `配額管理` |
| 6 | [LLM 回應的串流處理](./LLM_Integration/llm_streaming.md) | 5 | 4 | `Streaming`, `SSE`, `WebSocket` |
| 7 | [Token 計算與優化策略](./LLM_Integration/token_optimization.md) | 5 | 4 | `Token`, `成本優化`, `效能` |
| 8 | [LLM 快取策略設計](./LLM_Integration/llm_caching.md) | 6 | 4 | `快取`, `效能優化`, `成本` |
| 9 | [模型選型與對比](./LLM_Integration/llm_model_comparison.md) | 6 | 4 | `GPT`, `Claude`, `開源模型` |
| 10 | [Function Calling 與 Tool Use](./LLM_Integration/function_calling.md) | 7 | 4 | `Function Calling`, `工具使用`, `Agent` |

### 2. Vector_Databases (向量資料庫)

向量資料庫是實現語義搜尋、RAG、推薦系統的核心基礎設施。理解向量嵌入、相似度搜尋和向量索引技術至關重要。

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [什麼是向量資料庫](./Vector_Databases/what_is_vector_database.md) | 5 | 5 | `向量資料庫`, `語義搜尋`, `AI基礎設施` |
| 2 | [向量嵌入 (Embeddings) 原理](./Vector_Databases/vector_embeddings.md) | 6 | 5 | `Embeddings`, `向量化`, `語義理解` |
| 3 | [相似度搜尋算法詳解](./Vector_Databases/similarity_search.md) | 6 | 4 | `相似度`, `Cosine`, `歐幾里得距離` |
| 4 | [向量索引技術 (HNSW, IVF)](./Vector_Databases/vector_indexing.md) | 7 | 3 | `HNSW`, `IVF`, `索引優化` |
| 5 | [主流向量資料庫對比與選型](./Vector_Databases/vector_db_comparison.md) | 7 | 4 | `Pinecone`, `Weaviate`, `Milvus`, `Qdrant` |
| 6 | [pgvector：PostgreSQL 的向量擴展](./Vector_Databases/pgvector.md) | 6 | 4 | `PostgreSQL`, `pgvector`, `SQL擴展` |
| 7 | [向量資料庫效能優化](./Vector_Databases/vector_db_optimization.md) | 7 | 3 | `效能優化`, `索引`, `查詢優化` |
| 8 | [混合搜尋：向量 + 關鍵字](./Vector_Databases/hybrid_search.md) | 7 | 4 | `混合搜尋`, `BM25`, `重排序` |

### 3. ML_Model_Serving (機器學習模型服務)

對後端工程師而言，重點是如何部署和服務已訓練好的模型，而非訓練模型本身。

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [什麼是模型推理與模型服務](./ML_Model_Serving/model_inference.md) | 4 | 4 | `推理`, `模型服務`, `部署` |
| 2 | [REST API vs gRPC 用於模型服務](./ML_Model_Serving/api_for_ml.md) | 5 | 4 | `REST`, `gRPC`, `API設計` |
| 3 | [模型版本管理與 A/B 測試](./ML_Model_Serving/model_versioning.md) | 7 | 4 | `版本管理`, `A/B測試`, `灰度發布` |
| 4 | [模型推理的效能優化](./ML_Model_Serving/inference_optimization.md) | 7 | 3 | `效能優化`, `批次處理`, `快取` |
| 5 | [TensorFlow Serving 與 TorchServe](./ML_Model_Serving/ml_serving_tools.md) | 6 | 3 | `TensorFlow`, `PyTorch`, `模型服務` |
| 6 | [ONNX：跨框架模型部署](./ML_Model_Serving/onnx.md) | 6 | 3 | `ONNX`, `跨框架`, `互操作性` |
| 7 | [邊緣運算與模型量化](./ML_Model_Serving/edge_computing_quantization.md) | 7 | 2 | `邊緣運算`, `量化`, `模型壓縮` |

### 4. AI_Infrastructure (AI 基礎設施)

生產環境中運行 AI 服務需要特殊的基礎設施考量，包括 GPU 管理、監控、安全等。

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [GPU vs CPU：何時需要 GPU](./AI_Infrastructure/gpu_vs_cpu.md) | 5 | 4 | `GPU`, `CPU`, `硬體選型` |
| 2 | [AI 服務的容器化 (Docker + CUDA)](./AI_Infrastructure/ai_containerization.md) | 6 | 4 | `Docker`, `CUDA`, `容器化` |
| 3 | [模型監控與可觀測性](./AI_Infrastructure/ml_observability.md) | 7 | 4 | `監控`, `可觀測性`, `模型漂移` |
| 4 | [AI 服務的自動擴展策略](./AI_Infrastructure/ai_autoscaling.md) | 7 | 3 | `自動擴展`, `彈性`, `成本優化` |
| 5 | [資料隱私與模型安全](./AI_Infrastructure/ai_security.md) | 6 | 4 | `安全`, `隱私`, `GDPR` |
| 6 | [MLOps 基礎概念](./AI_Infrastructure/mlops_basics.md) | 6 | 3 | `MLOps`, `CI/CD`, `自動化` |

### 5. AI_System_Design_Cases (AI 系統設計案例)

這是面試中的核心部分，需要結合 AI 技術和系統設計能力。

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [設計智能客服系統 (FAQ + LLM)](./AI_System_Design_Cases/design_ai_customer_service.md) | 8 | 5 | `系統設計`, `客服`, `RAG` |
| 2 | [設計文件搜尋與問答系統](./AI_System_Design_Cases/design_document_qa.md) | 8 | 5 | `系統設計`, `RAG`, `文件處理` |
| 3 | [設計推薦系統的後端架構](./AI_System_Design_Cases/design_recommendation_system.md) | 8 | 4 | `系統設計`, `推薦`, `協同過濾` |
| 4 | [設計內容審核系統](./AI_System_Design_Cases/design_content_moderation.md) | 7 | 3 | `系統設計`, `審核`, `分類` |
| 5 | [設計語義搜尋引擎](./AI_System_Design_Cases/design_semantic_search.md) | 8 | 4 | `系統設計`, `搜尋`, `向量資料庫` |
| 6 | [設計 AI 驅動的 Code Review 工具](./AI_System_Design_Cases/design_ai_code_review.md) | 8 | 3 | `系統設計`, `代碼分析`, `LLM` |

### 6. ML_Basics_for_Backend (後端工程師必備的 ML 基礎)

不需要深入數學，但需要理解基本概念以便與 ML 團隊協作和做技術決策。

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [監督學習 vs 非監督學習 vs 強化學習](./ML_Basics_for_Backend/learning_types.md) | 3 | 3 | `ML基礎`, `學習類型`, `概念` |
| 2 | [訓練集、驗證集、測試集](./ML_Basics_for_Backend/dataset_split.md) | 3 | 3 | `ML基礎`, `資料集`, `評估` |
| 3 | [過擬合與欠擬合](./ML_Basics_for_Backend/overfitting_underfitting.md) | 4 | 3 | `ML基礎`, `模型評估`, `正則化` |
| 4 | [特徵工程基礎](./ML_Basics_for_Backend/feature_engineering.md) | 5 | 2 | `特徵工程`, `資料處理`, `預處理` |
| 5 | [模型評估指標 (準確率、召回率、F1)](./ML_Basics_for_Backend/evaluation_metrics.md) | 5 | 3 | `評估指標`, `準確率`, `召回率` |

---

## 學習建議

### 1. **從 LLM 整合開始**
先掌握 LLM API 的使用、Prompt Engineering 和基本的 RAG 架構。這是最實用且能快速上手的部分，也是面試中最常被問到的。

### 2. **深入向量資料庫**
理解向量嵌入的概念和向量資料庫的工作原理。這是實現語義搜尋、RAG、推薦系統的基礎，也是區分初級和資深工程師的關鍵。

### 3. **練習系統設計案例**
AI 系統設計是面試的重點。務必練習如何將 AI 能力整合到可擴展的後端架構中，考慮成本、效能、可靠性等因素。

### 4. **關注成本與效能**
AI 服務的成本（Token、GPU）和效能（延遲、吞吐量）優化是生產環境的核心挑戰。理解快取、批次處理、模型選型等優化手段。

### 5. **理解基礎概念**
雖然不需要深入數學，但理解基本的 ML 概念（過擬合、評估指標等）有助於與 ML 團隊協作和做出正確的技術決策。

---

## 面試重點

### 高頻考點
1. **RAG 架構設計** - 幾乎是必考題
2. **向量資料庫選型** - 需要能對比不同方案
3. **LLM 成本優化** - Token 管理、快取策略
4. **智能客服系統設計** - 結合 FAQ 和 LLM
5. **語義搜尋實現** - 向量化、相似度計算

### 常見問題類型
- **概念題**：什麼是 RAG？向量嵌入如何工作？
- **設計題**：設計一個文件問答系統，支援百萬級文件
- **優化題**：如何降低 LLM API 的成本？如何提升向量搜尋效能？
- **對比題**：OpenAI vs 開源模型？Pinecone vs Weaviate？
- **實戰題**：你如何處理 LLM 的幻覺問題？如何確保回應品質？

### 準備策略
1. **理論 + 實踐**：不僅要理解原理，還要有實際整合經驗
2. **成本意識**：能夠估算和優化 AI 服務的成本
3. **系統思維**：將 AI 視為系統的一部分，考慮可擴展性和可靠性
4. **追蹤趨勢**：AI 領域變化快，關注最新的技術和最佳實踐

---

## 學習路徑建議

### Phase 1: 基礎入門 (1-2 週)
**目標**：建立對 AI 後端開發的整體認知

建議順序：
1. 什麼是 LLM → 2. LLM API 整合 → 3. Prompt Engineering → 4. 什麼是向量資料庫 → 5. 向量嵌入原理

### Phase 2: 核心技能 (2-3 週)
**目標**：掌握 RAG 架構和向量資料庫

建議順序：
1. RAG 架構設計（重點深入學習）→ 2. 主流向量資料庫對比 → 3. 相似度搜尋算法 → 4. LLM 快取策略 → 5. Token 優化

### Phase 3: 系統設計 (1-2 週)
**目標**：練習完整的 AI 系統設計

建議順序：
1. 智能客服系統設計 → 2. 文件問答系統設計 → 3. 語義搜尋引擎設計

### Phase 4: 進階與專精 (選修)
**目標**：深入特定領域或進階主題

根據興趣選擇：
- Function Calling 與 Agent 開發
- 模型監控與 MLOps
- 混合搜尋技術
- 模型服務與優化

---

## 技術棧參考

### LLM 服務
- **OpenAI API** (GPT-4, GPT-3.5)
- **Anthropic Claude**
- **開源模型** (Llama 3, Mistral, Qwen)

### 向量資料庫
- **託管服務**: Pinecone, Weaviate Cloud
- **自建方案**: Milvus, Qdrant, Chroma
- **SQL 擴展**: pgvector (PostgreSQL)

### Embedding 模型
- **OpenAI**: text-embedding-3-small/large
- **開源**: sentence-transformers, BGE, multilingual-e5

### 開發框架
- **LangChain** / **LlamaIndex** (RAG 框架)
- **Semantic Kernel** (Microsoft)
- **Haystack** (文件搜尋)

---

## 參考資源

### 官方文檔
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [LangChain Documentation](https://python.langchain.com/)
- [Pinecone Documentation](https://docs.pinecone.io/)

### 學習資源
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [RAG Techniques](https://github.com/NirDiamant/RAG_Techniques)
- [Awesome Vector Search](https://github.com/currentslab/awesome-vector-search)

### 實戰項目
- [OpenAI Cookbook](https://github.com/openai/openai-cookbook)
- [LangChain Templates](https://github.com/langchain-ai/langchain/tree/master/templates)

---

> **重要提醒**：AI 領域變化極快，建議定期關注最新技術動態。本指南著重於「如何在後端系統中整合和應用 AI」，而非「如何訓練模型」。對於後端工程師而言，這是最實用且最有價值的學習方向。
