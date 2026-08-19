# AI Engineer 必備技能圖譜 (Skills Required for AI Engineers)

- **難度**: 5
- **重要程度**: 5
- **標籤**: `AI`, `LLM`, `Career`, `Roadmap`, `RAG`

## 問題詳述

隨著 Generative AI (GenAI) 的爆發，"AI Engineer" 成為熱門職位。與傳統的 Data Scientist 或 ML Engineer 不同，AI Engineer 更側重於**應用**現有的大型語言模型 (LLM) 來解決實際問題。在這個時代，一位合格的 AI Engineer 需要具備哪些核心能力？

## 核心理論與詳解

AI Engineer 的角色介於後端工程師與資料科學家之間。他們不需要從頭訓練一個 GPT-4，但需要知道如何最好地使用它。

### Reliable AI Systems Engineer：把 Harness 當成主軸

對有後端、分散式系統、Kubernetes、DevOps 和可觀測性背景的工程師，較合適的定位不是「只會串 API」，也不是「純模型研究員」，而是：

> **以 Python 理解 ML 與 AI 原理，以 Node.js／Go 建立可評估、可靠、安全且可部署的 RAG 與 Agent 系統。**

這個定位的差異化不在於做出一次成功的 Agent demo，而在於能回答：

- 模型提出的意圖如何經過獨立授權，才可以呼叫工具？
- worker crash、timeout 或 client disconnect 後，如何避免遺失狀態或重複副作用？
- Agent 說「成功」時，如何由真實環境驗證任務確實完成？
- 新模型的 final answer 分數變高時，如何證明成本、延遲、安全與工具行為沒有回歸？

學習與實作應沿著同一個可演進的 flagship project 前進：

1. **Secure Harness Contract**：先定義資產、租戶、信任邊界、tool capability、威脅模型、評估 schema 與 baseline。
2. **Deterministic Substrate**：先完成不依賴 LLM 的 API、權限、檢索、資料版本與測試基線。
3. **Reliable Execution Kernel**：加入 state、step／token／cost budget、deadline、timeout、retry、cancel、checkpoint、resume、reconciliation 與 kill switch。
4. **Evaluation Harness**：以 task、trial、trajectory、grader、environment outcome 和 regression gate 比較模型與 harness 的變更。
5. **Productionization**：以 trace、SLO、成本、canary、rollback、incident learning 與安全證據完成上線閉環。

這裡的 Harness 不是某一個框架，而是下列共同能力的工程層：

> `Execution Boundary → Reliable Execution Kernel → Agent Harness + Evaluation Harness → Security／Reliability／Functional Profiles`

安全不是最後才加的獨立章節。deny-by-default、tenant isolation、secret isolation、policy-as-code、approval binding 與副作用控制從第一個 tool 開始就要存在；大型 multi-agent、GPU／training infrastructure 和特定 SDK 的深度整合則可以延後。

### 1. 核心基礎 (Foundations)

- **程式語言**: **Python** 是絕對的主流。需要熟練掌握，特別是異步編程 (asyncio) 和 API 處理。
- **API 整合**: 熟練使用 OpenAI, Anthropic, Google Gemini 等模型的 API。
- **資料處理**: Pandas, NumPy 用於基本的資料清洗和格式化。

### 2. 提示工程 (Prompt Engineering)

這不僅僅是「會問問題」，而是系統化的工程方法。

- **基本技巧**: Zero-shot, Few-shot prompting。
- **進階技巧**: Chain of Thought (CoT), Tree of Thoughts (ToT), ReAct (Reason + Act)。
- **結構化輸出**: 強制模型輸出 JSON 或特定格式 (Function Calling / Tool Use)。
- **防禦性 Prompting**: 防止 Prompt Injection 攻擊。

### 3. 檢索增強生成 (RAG - Retrieval-Augmented Generation)

解決 LLM 幻覺 (Hallucination) 和知識截止問題的核心技術。

- **向量資料庫 (Vector Database)**: 理解 Embeddings (嵌入向量)，熟悉 Pinecone, Weaviate, Qdrant, Milvus 或 pgvector。
- **檢索策略**: 語意搜尋 (Semantic Search)、混合搜尋 (Hybrid Search = Keyword + Semantic)、重排序 (Reranking)。
- **分塊策略 (Chunking)**: 如何將長文檔切分為合適的大小以保留語意。

### 4. AI Agent 開發

從單純的問答進化到能執行任務的代理人。

- **責任邊界**: 區分 Execution Boundary、Reliable Execution Kernel、Agent Harness、工具與真實環境；框架只是實作選項，不是可靠性保證。
- **工具使用 (Tool Use)**: 讓 LLM 提出外部 API 意圖，但由獨立的 schema、capability、租戶、policy、approval 與 resource ownership 檢查決定是否執行。
- **可靠執行**: 掌握 state machine、step／token／cost budget、deadline、timeout、cancellation、checkpoint、resume、replay 與 unknown outcome。
- **副作用治理**: 區分 read-only、idempotent write、non-idempotent write 與 irreversible operation，設計 idempotency key、reconciliation、compensation 和 audit。
- **記憶管理 (Memory)**: Short-term vs Long-term memory 不只是保存上下文，還要處理 tenant scope、資料來源、版本、過期、prompt injection 與刪除／隔離政策。

### 5. 模型微調 (Fine-tuning) & 本地部署

當 API 無法滿足需求 (隱私、成本、特定領域知識) 時。

- **PEFT (Parameter-Efficient Fine-Tuning)**: LoRA, QLoRA。不需要全量微調，只需少量資源即可適配特定任務。
- **本地模型**: 熟悉 Llama 3, Mistral 等開源模型。
- **推理優化**: 使用 Ollama, vLLM, llama.cpp 進行本地部署和加速。

### 6. LLMOps & 評估 (Evaluation)

如何確保 AI 應用的品質？

- **Evaluation Harness**: 以 task、trial、trajectory、grader、environment outcome 與 evaluation suite 評估多步 Agent，而不是只比較 final answer。
- **多層 Gate**: 分開檢查功能正確性、tool arguments、policy／security invariant、真實環境狀態、成本、延遲、retry amplification 與 trace completeness。
- **監控與 Trace**: 追蹤 model／provider、prompt、retriever／index、tool／policy、token、TTFT、P95／P99、checkpoint、replay 與租戶隔離證據。
- **統計與發布**: 使用 repeated trials、paired comparison、slice、grader calibration、confidence interval、effect size、shadow、canary 與 rollback；結果要能是 `inconclusive`，不能強迫所有不完整證據變成通過。

## 程式碼範例 (Python)

一個簡單的 RAG 流程概念 (使用 LangChain 風格的虛擬碼)：

```python
# 這是概念性代碼，展示 AI Engineer 的日常工作邏輯

import os
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA

# 1. 準備資料與 Embeddings
documents = load_and_chunk_data("company_policy.pdf")
embeddings = OpenAIEmbeddings()

# 2. 存入向量資料庫
vector_db = Chroma.from_documents(documents, embeddings)

# 3. 建立檢索器
retriever = vector_db.as_retriever(search_type="similarity", search_kwargs={"k": 3})

# 4. 初始化 LLM
llm = ChatOpenAI(model_name="gpt-4", temperature=0)

# 5. 建立問答鏈 (RAG Chain)
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever
)

# 6. 執行查詢
query = "公司的遠端工作政策是什麼？"
response = qa_chain.run(query)

print(f"Q: {query}")
print(f"A: {response}")
```

## 學習與評量對應

- **Concept ID**: `concept.ai.ai-engineer.production-capability-map`
- **Learning Objectives**:
  - `LO-1`: 能把模型、資料、prompt、RAG、agent、部署與產品需求連成可交付的系統能力圖。
  - `LO-2`: 能針對品質、安全、成本、延遲、可觀測性與資料治理安排學習和工程優先順序。
  - `LO-3`: 能以實驗、評估集、canary、incident learning 與 rollback 證據判斷 AI 功能是否達到 production-ready。
- **Prerequisites**: `concept.ai.llm.foundation-and-capabilities`, `concept.ai.prompt.engineering`, `concept.ai.rag.retrieval-generation-pipeline`
- **Quick Quiz**: [Q4](../../QUIZ/20_AI_Engineering.md#q4-ai-engineer-production-capabilities)
- **Hard Assessment**: [AI／Engineering Management Delivery Incident](../../QUIZ/Hard_Assessments/ai_management_delivery_incident.md) (`assessment.ai-management.delivery-incident.v1`)
- **Assessment Gate**: 能為一項 AI 功能畫出從資料到上線後學習的責任鏈，說明品質／安全／成本門檻與回滾方式，再進入 Hard Assessment。
