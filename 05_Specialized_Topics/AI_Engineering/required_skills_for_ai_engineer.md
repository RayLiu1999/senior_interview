# AI Engineer 必備技能圖譜 (Skills Required for AI Engineers)

- **難度**: 5
- **標籤**: `AI`, `LLM`, `Career`, `Roadmap`, `RAG`

## 問題詳述

隨著 Generative AI (GenAI) 的爆發，"AI Engineer" 成為熱門職位。與傳統的 Data Scientist 或 ML Engineer 不同，AI Engineer 更側重於**應用**現有的大型語言模型 (LLM) 來解決實際問題。在這個時代，一位合格的 AI Engineer 需要具備哪些核心能力？

## 核心理論與詳解

AI Engineer 的角色介於後端工程師與資料科學家之間。他們不需要從頭訓練一個 GPT-4，但需要知道如何最好地使用它。

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

- **框架**: LangChain, LlamaIndex, AutoGen。
- **工具使用 (Tool Use)**: 讓 LLM 能夠調用外部 API (如搜尋 Google、查詢資料庫、發送 Email)。
- **記憶管理 (Memory)**: Short-term vs Long-term memory，如何讓 Agent 記住對話上下文。

### 5. 模型微調 (Fine-tuning) & 本地部署

當 API 無法滿足需求 (隱私、成本、特定領域知識) 時。

- **PEFT (Parameter-Efficient Fine-Tuning)**: LoRA, QLoRA。不需要全量微調，只需少量資源即可適配特定任務。
- **本地模型**: 熟悉 Llama 3, Mistral 等開源模型。
- **推理優化**: 使用 Ollama, vLLM, llama.cpp 進行本地部署和加速。

### 6. LLMOps & 評估 (Evaluation)

如何確保 AI 應用的品質？

- **評估框架**: RAGAS (評估 RAG 的檢索與生成品質), TruLens, Arize Phoenix。
- **監控**: 追蹤 Token 使用量、延遲 (Latency)、成本 (Cost)。
- **版本控制**: Prompt 的版本管理。

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
