# AI 與機器學習 (AI and Machine Learning) - 重點考題 (Quiz)

> 這份考題是從 AI/ML 章節中挑選出**重要程度 4-5** 的核心題目，設計成自我測驗的形式。
> 聚焦於 LLM 整合、RAG 架構、向量資料庫等後端工程師必備技能。
> 
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

## 🤖 LLM 整合

### Q1: 什麼是 RAG (Retrieval-Augmented Generation)？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請解釋 RAG 架構的工作原理、組成元件，以及為什麼要使用 RAG。

<details>
<summary>💡 答案提示</summary>

**RAG 是什麼**：
檢索增強生成，結合「檢索」與「生成」，讓 LLM 能基於外部知識回答問題。

**核心流程**：
```
1. 用戶問題 → Embedding 模型 → 向量化
2. 向量搜尋 → 從向量資料庫檢索相關文件
3. 組合 Prompt = 檢索結果 + 用戶問題
4. LLM 生成回答（基於檢索內容）
```

**為什麼需要 RAG**：
- 解決 LLM 知識截止日期問題
- 減少幻覺（有事實依據）
- 支援私有知識庫
- 降低 Token 成本（不用微調）

**核心組件**：
| 組件 | 作用 |
|------|------|
| Embedding Model | 將文本轉為向量 |
| Vector Database | 儲存和檢索向量 |
| LLM | 基於檢索內容生成回答 |

</details>

📖 [查看完整答案](../02_Backend_Development/AI_and_Machine_Learning/LLM_Integration/rag_architecture.md)

---

### Q2: 什麼是 Prompt Engineering？有哪些最佳實踐？

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請說明 Prompt Engineering 的核心技巧和常用模式。

<details>
<summary>💡 答案提示</summary>

**基本原則**：
1. **清晰具體**：明確說明任務和期望輸出格式
2. **提供上下文**：給予足夠背景資訊
3. **示例引導**：Few-shot 學習

**常用技巧**：

| 技巧 | 說明 |
|------|------|
| Zero-shot | 直接提問，無示例 |
| Few-shot | 提供 2-3 個示例 |
| Chain-of-Thought | 要求逐步推理 |
| Role-play | 指定角色（你是一個專家...） |

**Prompt 結構**：
```
[角色設定]
[任務說明]
[格式要求]
[範例（可選）]
[用戶輸入]
```

**避免問題**：
- 避免模糊指令
- 控制輸出長度
- 使用分隔符區隔內容

</details>

📖 [查看完整答案](../02_Backend_Development/AI_and_Machine_Learning/LLM_Integration/prompt_engineering.md)

---

### Q3: 如何設計 LLM 的快取策略以降低成本？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請說明 LLM 服務的快取設計和成本優化策略。

<details>
<summary>💡 答案提示</summary>

**快取層級**：

1. **精確匹配快取**
   - 相同問題直接返回快取結果
   - Key = hash(prompt)

2. **語義相似快取**
   - 問題向量化後比對相似度
   - 閾值內返回快取結果

3. **RAG 快取**
   - 快取檢索結果（不快取最終回答）
   - 適合知識庫穩定的場景

**成本優化策略**：
| 策略 | 效果 |
|------|------|
| 選擇適合的模型 | GPT-3.5 成本是 GPT-4 的 1/30 |
| 控制 max_tokens | 減少輸出 Token |
| 壓縮 Prompt | 減少輸入 Token |
| 批次處理 | 合併多個請求 |
| 語義快取 | 減少 API 調用 |

</details>

📖 [查看完整答案](../02_Backend_Development/AI_and_Machine_Learning/LLM_Integration/llm_caching.md)

---

### Q4: 什麼是 Function Calling / Tool Use？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請解釋 LLM 的 Function Calling 機制及其應用場景。

<details>
<summary>💡 答案提示</summary>

**Function Calling 是什麼**：
讓 LLM 決定何時調用外部函數，並生成結構化的函數參數。

**工作流程**：
```
1. 用戶問題：「台北今天天氣如何？」
2. LLM 分析 → 決定調用 get_weather 函數
3. LLM 輸出：{"function": "get_weather", "args": {"city": "台北"}}
4. 後端執行函數，獲取真實天氣資料
5. 將結果返回 LLM 生成最終回答
```

**應用場景**：
- 查詢即時資訊（天氣、股價）
- 執行資料庫操作
- 調用內部 API
- 建構 AI Agent

**OpenAI 格式示例**：
```json
{
  "name": "get_weather",
  "parameters": {
    "type": "object",
    "properties": {
      "city": {"type": "string"}
    },
    "required": ["city"]
  }
}
```

</details>

📖 [查看完整答案](../02_Backend_Development/AI_and_Machine_Learning/LLM_Integration/function_calling.md)

---

## 🗄️ 向量資料庫

### Q5: 什麼是向量資料庫？與傳統資料庫有何不同？

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請解釋向量資料庫的概念、用途和核心特性。

<details>
<summary>💡 答案提示</summary>

**向量資料庫**：
專門儲存和檢索高維向量的資料庫，用於相似度搜尋。

**與傳統資料庫對比**：
| 特性 | 傳統資料庫 | 向量資料庫 |
|------|-----------|-----------|
| 資料類型 | 結構化資料 | 高維向量 |
| 查詢方式 | 精確匹配 | 相似度搜尋 |
| 索引 | B+ Tree | HNSW, IVF |
| 使用場景 | 事務處理 | 語義搜尋、推薦 |

**核心功能**：
- 向量儲存
- 近似最近鄰搜尋（ANN）
- 向量索引
- 元資料過濾

**主流產品**：
- Pinecone（託管）
- Milvus（開源）
- Weaviate（開源）
- pgvector（PostgreSQL 擴展）

</details>

📖 [查看完整答案](../02_Backend_Development/AI_and_Machine_Learning/Vector_Databases/what_is_vector_database.md)

---

### Q6: 什麼是向量嵌入 (Embeddings)？如何生成？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋 Embeddings 的原理和生成方式。

<details>
<summary>💡 答案提示</summary>

**Embeddings 是什麼**：
將文本、圖片等非結構化資料轉換為固定維度的向量，使語義相似的內容在向量空間中距離相近。

**特性**：
- 維度固定（如 1536 維）
- 語義相近 → 向量距離小
- 支援數學運算

**生成方式**：

| 模型 | 維度 | 特點 |
|------|------|------|
| OpenAI text-embedding-3-small | 1536 | 高品質，需付費 |
| OpenAI text-embedding-3-large | 3072 | 更高品質 |
| sentence-transformers | 768 | 開源免費 |
| BGE | 1024 | 開源，中文效果好 |

**應用場景**：
- 語義搜尋
- 相似文件推薦
- 聚類分析
- RAG 檢索

</details>

📖 [查看完整答案](../02_Backend_Development/AI_and_Machine_Learning/Vector_Databases/vector_embeddings.md)

---

### Q7: 比較主流向量資料庫的特點和選型考量

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請比較 Pinecone、Milvus、Weaviate、pgvector 的特點。

<details>
<summary>💡 答案提示</summary>

| 產品 | 類型 | 優點 | 缺點 | 適用場景 |
|------|------|------|------|----------|
| **Pinecone** | 託管 | 簡單易用、免運維 | 成本高、Lock-in | 快速上手、生產環境 |
| **Milvus** | 開源 | 高效能、功能完整 | 部署複雜 | 大規模、自建 |
| **Weaviate** | 開源 | 內建向量化、GraphQL | 學習曲線 | 全端 AI 應用 |
| **pgvector** | 擴展 | 結合關聯式、簡單 | 效能有限 | 現有 PG 專案、小規模 |
| **Qdrant** | 開源 | Rust 高效能 | 生態較新 | 效能敏感場景 |

**選型考量**：
1. **規模**：小 → pgvector，大 → Milvus
2. **運維能力**：弱 → Pinecone，強 → 自建
3. **現有架構**：有 PG → pgvector
4. **成本預算**：有限 → 開源方案

</details>

📖 [查看完整答案](../02_Backend_Development/AI_and_Machine_Learning/Vector_Databases/vector_db_comparison.md)

---

## 🏗️ AI 系統設計

### Q8: 設計一個智能客服系統 (FAQ + LLM)

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請設計一個結合 RAG 和 LLM 的智能客服系統架構。

<details>
<summary>💡 答案提示</summary>

**系統架構**：
```
用戶 → API Gateway → 客服服務
                        ↓
              ┌─────────┴─────────┐
              ↓                   ↓
          意圖識別            RAG Pipeline
              ↓                   ↓
         FAQ 匹配           向量資料庫檢索
              ↓                   ↓
         高置信度？          LLM 生成回答
              ↓                   ↓
         直接返回             返回用戶
```

**關鍵設計點**：

1. **多層回答策略**
   - 高置信度 FAQ → 直接返回
   - 中置信度 → RAG + LLM
   - 低置信度 → 轉人工

2. **快取策略**
   - FAQ 結果快取
   - 語義相似問題快取

3. **品質保證**
   - 回答來源標註
   - 置信度分數
   - 用戶反饋機制

4. **成本控制**
   - 分層模型（先用小模型）
   - 批次處理
   - Token 限制

</details>

📖 [查看完整答案](../02_Backend_Development/AI_and_Machine_Learning/AI_System_Design_Cases/design_ai_customer_service.md)

---

### Q9: 設計一個文件搜尋與問答系統

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

如何設計一個支援百萬級文件的語義搜尋系統？

<details>
<summary>💡 答案提示</summary>

**核心流程**：

**索引流程**：
```
文件 → 文本提取 → 分塊 (Chunking) → Embedding → 向量資料庫
```

**查詢流程**：
```
問題 → Embedding → 向量搜尋 → Top K 文件 → LLM 生成答案
```

**分塊策略**：
| 策略 | 適用場景 |
|------|----------|
| 固定大小 | 簡單、通用 |
| 語義分割 | 保持上下文 |
| 重疊分塊 | 防止資訊斷裂 |
| 遞迴分割 | 結構化文件 |

**效能優化**：
- 混合搜尋：向量 + 關鍵字
- 重排序 (Reranking)
- 索引預熱
- 結果快取

**品質提升**：
- 多向量查詢
- 上下文壓縮
- 引用來源

</details>

📖 [查看完整答案](../02_Backend_Development/AI_and_Machine_Learning/AI_System_Design_Cases/design_document_qa.md)

---

### Q10: 模型監控與 LLM 可觀測性

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

如何監控 LLM 應用的效能和品質？

<details>
<summary>💡 答案提示</summary>

**監控維度**：

1. **效能指標**
   - 延遲（P50, P99）
   - 吞吐量
   - 錯誤率
   - Token 使用量

2. **品質指標**
   - 用戶滿意度
   - 回答準確性
   - 幻覺檢測
   - 安全性檢查

3. **成本指標**
   - Token 費用
   - API 調用次數
   - 快取命中率

**監控工具**：
| 工具 | 功能 |
|------|------|
| LangSmith | LangChain 追蹤 |
| Helicone | OpenAI 監控 |
| Prometheus | 指標收集 |
| 自建 | 自訂需求 |

**告警設定**：
- 延遲超閾值
- 錯誤率飆升
- 成本異常
- 負面反饋增加

</details>

📖 [查看完整答案](../02_Backend_Development/AI_and_Machine_Learning/AI_Infrastructure/ml_observability.md)

---

## 📊 學習進度檢核

完成以上題目後，請自我評估：

| 評估項目 | 自評 |
|----------|------|
| 理解 RAG 架構和流程 | ⬜ |
| 掌握 Prompt Engineering 技巧 | ⬜ |
| 能設計 LLM 快取策略 | ⬜ |
| 理解 Function Calling 機制 | ⬜ |
| 了解向量資料庫原理 | ⬜ |
| 理解 Embeddings 概念 | ⬜ |
| 能進行向量資料庫選型 | ⬜ |
| 能設計智能客服系統 | ⬜ |
| 能設計文件問答系統 | ⬜ |
| 了解 LLM 監控方案 | ⬜ |

**建議**：未能完整回答的題目，請回到對應的詳細文章深入學習。
