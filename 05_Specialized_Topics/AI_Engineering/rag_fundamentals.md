# RAG (Retrieval-Augmented Generation) 核心原理

- **難度**: 6
- **標籤**: `AI`, `RAG`, `Vector Database`, `Embeddings`, `Search`

## 問題詳述

大型語言模型 (LLM) 雖然強大，但存在「幻覺」(Hallucination) 和「知識截止」(Knowledge Cutoff) 的問題，且無法存取企業內部的私有數據。RAG 如何解決這些問題？其標準架構是什麼？

## 核心理論與詳解

RAG (檢索增強生成) 是一種架構模式，它在將 Prompt 送給 LLM 之前，先從外部知識庫中檢索相關資訊，並將這些資訊作為「上下文 (Context)」一併提供給 LLM。

### 1. 為什麼需要 RAG？

- **解決幻覺**: 強制模型基於提供的事實回答，而非憑空捏造。
- **私有數據**: 讓通用模型 (如 GPT-4) 能夠回答關於公司內部文檔的問題。
- **即時性**: 不需要重新訓練模型就能讓其獲取最新資訊 (如今日新聞)。

### 2. RAG 標準流程 (The Pipeline)

RAG 分為兩個主要階段：**索引 (Indexing)** 和 **檢索生成 (Retrieval & Generation)**。

#### 階段一：索引 (Indexing) - 離線處理

1. **載入 (Load)**: 讀取 PDF, HTML, Markdown 等原始數據。
2. **切分 (Split/Chunk)**: 將長文檔切分為較小的片段 (Chunks)。切分策略 (如按段落、按字數) 對效果影響很大。
3. **嵌入 (Embed)**: 使用 Embedding Model (如 OpenAI text-embedding-3) 將文字轉換為向量 (Vector)。
4. **儲存 (Store)**: 將向量與原始文字存入向量資料庫 (Vector DB)。

#### 階段二：檢索與生成 (Retrieval & Generation) - 在線處理

1. **查詢嵌入 (Query Embedding)**: 將用戶的問題轉換為向量。
2. **相似度搜尋 (Similarity Search)**: 在向量資料庫中找出與問題向量最接近的 K 個片段 (Nearest Neighbors)。
3. **構建 Prompt**: 將檢索到的片段組合成 Prompt。
    > 範例 Prompt: "請根據以下資訊回答問題：[片段1] [片段2]... 問題：[用戶問題]"
4. **生成 (Generation)**: 將 Prompt 送入 LLM 產生最終回答。

### 3. 關鍵技術組件

- **Embeddings (嵌入向量)**: 將語意壓縮成一串數字 (如 1536 維的浮點數陣列)。語意相近的句子，其向量距離 (Cosine Similarity) 會很近。
- **Vector Database**: 專門用於儲存和快速檢索高維向量的資料庫。常見的有 Pinecone, Weaviate, Chroma, Milvus。

### 4. 進階 RAG 技巧

- **Hybrid Search (混合搜尋)**: 結合 關鍵字搜尋 (BM25) 和 向量搜尋。向量擅長語意匹配，關鍵字擅長精確匹配 (如專有名詞)。
- **Reranking (重排序)**: 初步檢索出 50 個結果，再用更精準的 Cross-Encoder 模型對這 50 個結果進行評分排序，取前 5 個給 LLM。
- **Parent Document Retriever**: 檢索時匹配小片段 (精準)，但給 LLM 時提供該片段所屬的父文檔 (上下文更完整)。

## 程式碼範例 (Python)

使用 `langchain` 實現最簡單的 RAG 查詢：

```python
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA

# 假設 vector_db 已經建立並存有數據
embeddings = OpenAIEmbeddings()
vector_db = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)

# 建立檢索器
retriever = vector_db.as_retriever()

# 建立 LLM
llm = ChatOpenAI(model_name="gpt-3.5-turbo")

# 建立 RAG Chain
qa = RetrievalQA.from_chain_type(
    llm=llm, 
    chain_type="stuff", 
    retriever=retriever
)

# 提問
query = "我們公司的退貨政策是什麼？"
result = qa.run(query)
print(result)
```
