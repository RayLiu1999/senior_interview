# AI 與機器學習 (AI and Machine Learning) - 重點考題 (Quiz)

> 這份考題是從 AI/ML 章節中挑選出**重要程度 4-5** 的核心題目，設計成自我測驗的形式。
> 聚焦於 LLM 整合、RAG 架構、向量資料庫等後端工程師必備技能。
> 
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

## 🤖 LLM 整合

### Q1: 什麼是 RAG (Retrieval-Augmented Generation)？
<!-- Concept ID: concept.ai.rag.retrieval-generation-pipeline; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.ai.prompt.engineering; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.ai.llm.caching; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.ai.llm.function-calling; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.ai.vector-database.fundamentals; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.ai.embeddings.generation; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.ai.vector-database.selection; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.ai.ai-system-design.customer-service; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.ai.ai-system-design.document-qa; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.ai.llm.observability; Learning Objective IDs: LO-1, LO-2, LO-3 -->
<!-- Article mapping: pending -->

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

---

### Q11: 什麼是 LLM 以及它的能力邊界
<!-- Concept ID: concept.ai.llm.foundation-and-capabilities; Learning Objective IDs: concept.ai.llm.foundation-and-capabilities/LO-1, concept.ai.llm.foundation-and-capabilities/LO-2, concept.ai.llm.foundation-and-capabilities/LO-3 -->

**難度**: ⭐⭐⭐⭐ (4) | **重要性**: 🔴 必考

請說明 LLM 的基本工作方式、擅長與不擅長的任務，以及後端系統應如何隔離它的風險。

<details>
<summary>💡 答案提示</summary>

- LLM 以 token 為輸入輸出單位，透過 Transformer 預訓練學習語言分布，推理時依上下文產生下一段內容。
- 它擅長語言轉換、摘要、分類、抽取與受約束的生成；不應被視為保證正確的資料庫、權限引擎或事實來源。
- 主要邊界包括幻覺、知識截止、非確定性、上下文限制、成本與延遲。
- 後端應加入輸入驗證、RAG／工具的權限隔離、輸出 schema 驗證、敏感資料遮罩、審計與人工升級。

</details>

📖 [查看完整答案](../02_Backend_Development/AI_and_Machine_Learning/LLM_Integration/what_is_llm.md)

---

### Q12: 如何選擇 LLM 模型與 Provider
<!-- Concept ID: concept.ai.llm.model-provider-selection; Learning Objective IDs: concept.ai.llm.model-provider-selection/LO-1, concept.ai.llm.model-provider-selection/LO-2, concept.ai.llm.model-provider-selection/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

面對多個商用 API 與開源模型時，如何建立可驗證、可回滾的選型決策？

<details>
<summary>💡 答案提示</summary>

1. 先定義任務品質、延遲分位數、吞吐量、上下文長度、工具／結構化輸出、資料治理與成本目標。
2. 用代表性評測集比較品質、拒答、安全性、token 使用與錯誤率；不要只看公開 benchmark 或一次 demo。
3. 比較商用 API 與 self-hosted open model 的 lock-in、資料位置、運維、容量與升級風險。
4. 以 provider abstraction、feature flags、分層路由、fallback 與 rollback criteria 保留替換能力。

</details>

📖 [查看完整答案](../02_Backend_Development/AI_and_Machine_Learning/LLM_Integration/llm_model_comparison.md)

---

### Q13: LLM API 整合如何在生產環境維持可靠性
<!-- Concept ID: concept.ai.llm.api-integration-reliability; Learning Objective IDs: concept.ai.llm.api-integration-reliability/LO-1, concept.ai.llm.api-integration-reliability/LO-2, concept.ai.llm.api-integration-reliability/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

如何設計 LLM API client，使 timeout、streaming、provider 暫時失效與請求取消不會擴散成整體事故？

<details>
<summary>💡 答案提示</summary>

- 為 DNS、連線、首 token、完整回應與整體請求分別設定可解釋的 timeout，並把 cancellation 往下游傳遞。
- 依錯誤分類重試：429／暫時性 5xx 可在 retry budget 內退避；schema、認證、內容政策或明確 4xx 不應盲目重試。
- Streaming 要處理半途斷線、response 已開始後不能重複寫入、buffer 上限與 client disconnect。
- 以 request ID、provider、model、token、延遲分位數、錯誤類型與 fallback 結果建立追蹤，並設計降級與回滾。

</details>

📖 [查看完整答案](../02_Backend_Development/AI_and_Machine_Learning/LLM_Integration/llm_api_integration.md)

---

### Q14: 如何設計 LLM API 限流重試與成本控制
<!-- Concept ID: concept.ai.llm.rate-limit-cost-control; Learning Objective IDs: concept.ai.llm.rate-limit-cost-control/LO-1, concept.ai.llm.rate-limit-cost-control/LO-2, concept.ai.llm.rate-limit-cost-control/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

當 provider 同時有 RPM、TPM、並發與每日預算限制時，如何避免重試風暴和成本失控？

<details>
<summary>💡 答案提示</summary>

- 將 provider 的 RPM／TPM 與服務自身的租戶配額、並發上限、token budget 分開建模。
- 先做 admission control；429 要尊重 Retry-After，以指數退避加 jitter，並限制最大嘗試次數與 retry budget。
- 對不可重試錯誤直接失敗或降級；對可重試請求要有冪等性，避免重複扣費或重複副作用。
- 按租戶、功能、model、provider 記錄 token、成本、拒絕、fallback 與 queue wait，設定熔斷與成本告警。

</details>

📖 [查看完整答案](../02_Backend_Development/AI_and_Machine_Learning/LLM_Integration/llm_rate_limiting_and_cost.md)

---

### Q15: 如何做 LLM Prompt Token 與成本最佳化
<!-- Concept ID: concept.ai.llm.token-prompt-optimization; Learning Objective IDs: concept.ai.llm.token-prompt-optimization/LO-1, concept.ai.llm.token-prompt-optimization/LO-2, concept.ai.llm.token-prompt-optimization/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

如何降低 prompt 與 output token，同時確保回答品質、可追溯性與上下文完整？

<details>
<summary>💡 答案提示</summary>

- 以實際 tokenizer 計算 input／output token，為 context、單次輸出與整體請求設定 budget。
- 移除重複指令、壓縮歷史、只檢索必要片段、使用結構化輸出與合理的 max output；不要只截斷文字而破壞語意。
- 對 prompt、模型、token、延遲、品質與成本建立回歸評測，確認節省沒有造成 recall 或正確率下降。
- 將長上下文分層、摘要或快取，並對超限請求提供明確的降級與使用者提示。

</details>

📖 [查看完整答案](../02_Backend_Development/AI_and_Machine_Learning/LLM_Integration/token_optimization.md)

---

### Q16: 如何選擇相似度與 ANN 搜尋算法
<!-- Concept ID: concept.ai.vector.similarity-search-algorithms; Learning Objective IDs: concept.ai.vector.similarity-search-algorithms/LO-1, concept.ai.vector.similarity-search-algorithms/LO-2, concept.ai.vector.similarity-search-algorithms/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

如何依 embedding 的性質、資料規模與 SLA 選擇距離度量和 exact／ANN 搜尋？

<details>
<summary>💡 答案提示</summary>

- cosine、inner product 與 Euclidean 的選擇必須和 embedding 模型的訓練假設、是否正規化一致。
- exact search 有最佳 recall 但成本隨資料量成長；HNSW、IVF、LSH、PQ 以結構或壓縮換取速度與資源。
- 用 exact ground truth 比較 recall@k、P95/P99 latency、吞吐量、記憶體和建置／更新成本。
- ANN 參數不是越大越好，需依查詢分布、filter、寫入頻率與可接受的 recall 退化驗證。

</details>

📖 [查看完整答案](../02_Backend_Development/AI_and_Machine_Learning/Vector_Databases/similarity_search_algorithms.md)

---

### Q17: 如何選擇與調校 HNSW 或 IVF 索引
<!-- Concept ID: concept.ai.vector.indexing-recall-latency; Learning Objective IDs: concept.ai.vector.indexing-recall-latency/LO-1, concept.ai.vector.indexing-recall-latency/LO-2, concept.ai.vector.indexing-recall-latency/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

比較 HNSW 與 IVF 時，應如何處理 recall、延遲、記憶體、建置時間和資料更新的取捨？

<details>
<summary>💡 答案提示</summary>

- HNSW 以多層圖導覽換取低延遲，M、efConstruction、efSearch 會影響圖大小、建置成本與 recall。
- IVF 先以 centroid 分桶，再搜尋 nprobe 個桶；nlist、nprobe 和訓練資料分布會影響召回與查詢成本。
- 大量更新、記憶體上限、建置窗口、刪除與重建策略也要納入，不只比較一次查詢速度。
- 先建立 benchmark 與 rollback 門檻，再逐步調參；以 recall 和 P99 同時守住品質與 SLA。

</details>

📖 [查看完整答案](../02_Backend_Development/AI_and_Machine_Learning/Vector_Databases/vector_indexing.md)

---

### Q18: pgvector 如何在 RAG 中正確建模與查詢
<!-- Concept ID: concept.ai.vector.pgvector-query-integration; Learning Objective IDs: concept.ai.vector.pgvector-query-integration/LO-1, concept.ai.vector.pgvector-query-integration/LO-2, concept.ai.vector.pgvector-query-integration/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

如何在 PostgreSQL 中設計 embedding、metadata、租戶隔離、距離查詢與 ANN 索引，使 RAG 結果正確且可維運？

<details>
<summary>💡 答案提示</summary>

- schema 要固定 embedding 維度與距離運算子，並保存文件版本、來源、權限範圍、更新時間等 metadata。
- 用 `EXPLAIN (ANALYZE, BUFFERS)` 檢查 filter、排序和向量索引是否符合預期；資料分布或過濾條件可能使 planner 選擇不同路徑。
- 釐清 PostgreSQL transaction／freshness 的優勢與單機資源、ANN 效能、分片和高規模運維的限制。
- 每次檢索都必須帶入授權範圍，避免先取回全域候選再在應用層過濾造成資料外洩。

</details>

📖 [查看完整答案](../02_Backend_Development/AI_and_Machine_Learning/Vector_Databases/pgvector_guide.md)

---

### Q19: 如何平衡向量檢索的 Recall 延遲與新鮮度
<!-- Concept ID: concept.ai.vector.retrieval-performance-tradeoffs; Learning Objective IDs: concept.ai.vector.retrieval-performance-tradeoffs/LO-1, concept.ai.vector.retrieval-performance-tradeoffs/LO-2, concept.ai.vector.retrieval-performance-tradeoffs/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

當向量搜尋的 P99 變慢、recall 下降且文件更新延遲增加時，如何用證據排序調優順序？

<details>
<summary>💡 答案提示</summary>

- 先定義 recall@k、P50/P95/P99、QPS、寫入到可檢索的 freshness、成本和 filter selectivity，避免只看平均 latency。
- 觀察 query plan、索引命中、候選數、cache、記憶體、分片、重建、embedding pipeline backlog 與資料庫資源。
- 以固定評測集和線上 trace 分別確認品質和容量，調整索引／候選數／cache 前先排除資料新鮮度與權限過濾問題。
- 任何參數或硬體變更都要有 canary、recall／P99／freshness 的 rollback 門檻，並保留降級到較小候選集或 lexical search 的路徑。

</details>

📖 [查看完整答案](../02_Backend_Development/AI_and_Machine_Learning/Vector_Databases/vector_db_performance.md)

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
| 理解 LLM 的能力邊界 | ⬜ |
| 能進行模型與 Provider 選型 | ⬜ |
| 能設計可靠的 LLM API 整合 | ⬜ |
| 能處理 LLM 限流、重試與成本 | ⬜ |
| 能最佳化 Prompt 與 Token | ⬜ |
| 理解相似度與 ANN 搜尋算法 | ⬜ |
| 能選擇與調校向量索引 | ⬜ |
| 能用 pgvector 設計 RAG 查詢 | ⬜ |
| 能平衡向量檢索 Recall、延遲與新鮮度 | ⬜ |

**建議**：未能完整回答的題目，請回到對應的詳細文章深入學習。
