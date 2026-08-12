# LLM／Vector Retrieval Incident：從 Provider 邊界到 RAG 檢索品質

- **Assessment ID**: `assessment.ai.llm-vector.retrieval-incident.v1`
- **主要 Concept ID**: `concept.ai.llm.api-integration-reliability`
- **次要 Concept IDs**:
  - `concept.ai.llm.foundation-and-capabilities`
  - `concept.ai.llm.model-provider-selection`
  - `concept.ai.llm.rate-limit-cost-control`
  - `concept.ai.llm.token-prompt-optimization`
  - `concept.ai.vector.similarity-search-algorithms`
  - `concept.ai.vector.indexing-recall-latency`
  - `concept.ai.vector.pgvector-query-integration`
  - `concept.ai.vector.retrieval-performance-tradeoffs`
- **對應文章**:
  - [什麼是大型語言模型 (LLM)](../../02_Backend_Development/AI_and_Machine_Learning/LLM_Integration/what_is_llm.md)
  - [模型選型與對比](../../02_Backend_Development/AI_and_Machine_Learning/LLM_Integration/llm_model_comparison.md)
  - [LLM API 整合與最佳實踐](../../02_Backend_Development/AI_and_Machine_Learning/LLM_Integration/llm_api_integration.md)
  - [LLM 的限流與成本控制](../../02_Backend_Development/AI_and_Machine_Learning/LLM_Integration/llm_rate_limiting_and_cost.md)
  - [Token 計算與優化策略](../../02_Backend_Development/AI_and_Machine_Learning/LLM_Integration/token_optimization.md)
  - [相似度搜尋算法詳解](../../02_Backend_Development/AI_and_Machine_Learning/Vector_Databases/similarity_search_algorithms.md)
  - [向量索引技術 (HNSW, IVF)](../../02_Backend_Development/AI_and_Machine_Learning/Vector_Databases/vector_indexing.md)
  - [pgvector：PostgreSQL 的向量擴展](../../02_Backend_Development/AI_and_Machine_Learning/Vector_Databases/pgvector_guide.md)
  - [向量資料庫效能優化](../../02_Backend_Development/AI_and_Machine_Learning/Vector_Databases/vector_db_performance.md)
- **題型**: `生產事故診斷`、`Provider 選型`、`LLM API 可靠性`、`向量檢索調優`、`RAG 評測與安全隔離`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 45 分鐘
- **標籤**: `LLM`, `Provider`, `Token`, `Rate Limit`, `Retry`, `RAG`, `pgvector`, `HNSW`, `IVF`, `Recall`, `Latency`, `Security`
- **Learning Objective IDs**:
  - `concept.ai.llm.foundation-and-capabilities/LO-1`
  - `concept.ai.llm.foundation-and-capabilities/LO-2`
  - `concept.ai.llm.foundation-and-capabilities/LO-3`
  - `concept.ai.llm.model-provider-selection/LO-1`
  - `concept.ai.llm.model-provider-selection/LO-2`
  - `concept.ai.llm.model-provider-selection/LO-3`
  - `concept.ai.llm.api-integration-reliability/LO-1`
  - `concept.ai.llm.api-integration-reliability/LO-2`
  - `concept.ai.llm.api-integration-reliability/LO-3`
  - `concept.ai.llm.rate-limit-cost-control/LO-1`
  - `concept.ai.llm.rate-limit-cost-control/LO-2`
  - `concept.ai.llm.rate-limit-cost-control/LO-3`
  - `concept.ai.llm.token-prompt-optimization/LO-1`
  - `concept.ai.llm.token-prompt-optimization/LO-2`
  - `concept.ai.llm.token-prompt-optimization/LO-3`
  - `concept.ai.vector.similarity-search-algorithms/LO-1`
  - `concept.ai.vector.similarity-search-algorithms/LO-2`
  - `concept.ai.vector.similarity-search-algorithms/LO-3`
  - `concept.ai.vector.indexing-recall-latency/LO-1`
  - `concept.ai.vector.indexing-recall-latency/LO-2`
  - `concept.ai.vector.indexing-recall-latency/LO-3`
  - `concept.ai.vector.pgvector-query-integration/LO-1`
  - `concept.ai.vector.pgvector-query-integration/LO-2`
  - `concept.ai.vector.pgvector-query-integration/LO-3`
  - `concept.ai.vector.retrieval-performance-tradeoffs/LO-1`
  - `concept.ai.vector.retrieval-performance-tradeoffs/LO-2`
  - `concept.ai.vector.retrieval-performance-tradeoffs/LO-3`

## 測驗目標

- 能從 model／provider 變更、prompt／token 成長、rate limit／retry、LLM API timeout 與 vector query plan 建立完整事故因果鏈。
- 能區分模型能力、Provider SLA、應用層可靠性與 RAG 檢索品質，不把「模型回答不好」當成單一根因。
- 能設計符合 embedding、距離度量、HNSW／IVF、pgvector filter 與 query plan 的檢索方案，並量化 recall、latency、freshness 與成本。
- 能以 tenant isolation、文件 ACL、prompt injection 防護、輸出驗證與引用可追溯性，界定 RAG 的安全邊界。
- 能提出有指標、警戒線、故障注入與 rollback 條件的分階段止血和長期修復。

## 問題情境與限制條件

某多租戶 SaaS 的 `Knowledge Assist` 提供客服與內部文件問答。系統以 PostgreSQL + pgvector 儲存 chunk、embedding、文件版本與租戶 metadata；查詢時先做向量檢索，再由外部 LLM provider 生成附引用的回答。服務包含同步問答 API 與 streaming API，文件 ingestion 由背景 worker 執行。

最近一次版本同時做了三項變更：

1. 為降低單次成本，將預設生成模型從原本的長上下文模型切換成另一家 Provider 的較便宜模型；offline benchmark 只測英文短問答，沒有測中文、多租戶 ACL、引用正確性、拒答與工具／結構化輸出。
2. 將 system prompt、完整對話歷史與最多 20 個檢索 chunk 全部送入模型，並把最大輸出長度調高。Provider SDK、API gateway 與應用 service 各自都有自動重試，沒有共用 retry budget。
3. 為改善檢索速度，將 HNSW 的 `efSearch` 調低，並把文件更新與新 embedding 產生放到低優先序 pipeline；部分租戶仍使用舊 embedding model 產生的向量。pgvector 查詢先依向量取少量候選，再在應用層套用租戶與 ACL 過濾。

變更後 30 分鐘內觀察到：

- 問答 API P95 從 1.2 秒升至 4.8 秒，P99 從 3.5 秒升至 18 秒；streaming 的首 token 變慢，client disconnect 後 Provider 請求仍持續。
- Provider A 回傳 429 的比例由 0.6% 升至 12%，偶發 5xx 與 read timeout；同一個 user request 有時在 gateway、service、SDK 各重試一次以上，成本與請求數同時上升。
- 平均 input token 由 2,800 增至 8,900，output token 沒有同步增加；每個租戶的每日費用差異很大，沒有 per-tenant budget 或 hard cap。
- RAG 的 offline recall@10 從 0.86 降至 0.61；線上引用錯誤與「找不到最新政策」的回饋增加。檢索 P99 從 70 ms 升至 1.1 秒，文件 ingestion lag 從 3 分鐘升至 50 分鐘。
- pgvector 的部分 trace 顯示在 metadata filter 較嚴格的租戶上退化成較大的 scan；另一部分查詢雖使用索引，但 top-k 候選在應用層過濾後常常不足。DB CPU 只有 65%，但 buffer read、connection wait 與 autovacuum backlog 上升。
- 新 Provider 對中文與長上下文的品質不穩定；fallback 到 Provider B 後延遲更高。部分答案引用了使用者沒有權限的文件標題，雖然完整內容沒有總是被返回。
- 團隊目前沒有保存每次 prompt、retrieval candidates、index version、model／provider、token、retry、ACL decision 與最終引用的完整 trace；只能從總量指標推測問題。

限制條件：不能以重啟、單純增加 worker、永久提高 timeout、關閉 ACL／validation 或只更換一個模型作為唯一修復；不能犧牲既有租戶隔離、回答引用的可追溯性、已接受請求的冪等語意或文件更新的正確性。第一階段必須先降低錯誤與成本風險，且每項改動都要有觀測指標、警戒線與 rollback 條件。

## 作答要求

1. **建立時間線與因果鏈**：區分已知證據、合理假設與待驗證項目，說明 model 切換、token 成長、重試風暴、stream cancellation、向量索引、filter、freshness 與 DB 資源如何互相放大。
2. **完成 model／provider 選型**：提出任務矩陣與評測集，涵蓋中文、多語、長上下文、引用 faithfulness、拒答、安全、結構化輸出、延遲、吞吐、資料治理、成本與 Provider SLA；說明 canary、routing、fallback 和 rollback。
3. **重畫 prompt／token／成本邊界**：定義 input、retrieval context、history、output 與每租戶的 token budget；提出 context 壓縮、chunk 選擇、摘要、輸出限制、快取與品質回歸方案。
4. **修正 LLM API 可靠性**：設計 timeout、streaming、client cancellation、retryable／non-retryable error、Retry-After、backoff、jitter、idempotency、retry budget、circuit breaker、fallback 與 overload response。
5. **處理 provider rate limit 與容量**：區分 RPM、TPM、並發、每日配額、租戶配額與成本 hard cap；說明 gateway、service、SDK 如何避免重複重試，並設計 admission control。
6. **診斷向量品質與索引**：比較使用的 distance metric、exact search、HNSW、IVF／PQ 的取捨；說明 `efSearch`、`M`、`nlist`、`nprobe`、候選數、embedding model／dimension／版本如何影響 recall、延遲、記憶體與更新。
7. **修正 pgvector query plan 與 freshness**：說明如何用 `EXPLAIN (ANALYZE, BUFFERS)`、filter selectivity、索引條件、資料分布與候選數定位 scan 退化；提出 tenant／ACL filter 必須在檢索邊界生效的方案，以及 re-embedding、index build、文件版本與 ingestion backlog 的一致性策略。
8. **建立 RAG 評測與安全隔離**：至少定義 retrieval recall／precision、answer faithfulness、citation correctness、拒答率、prompt injection、跨租戶洩漏與 freshness 指標；說明如何保存可審計但不暴露秘密的 trace。
9. **提出分階段交付**：至少三階段，每階段列出變更、成功指標、警戒線、rollback 條件與故障注入；第一階段必須能限制成本、重試和資料洩漏風險，後續才做索引和容量調校。

## 期待證據

- 能把模型／Provider 切換與實際 workload、語言、上下文、工具、引用和安全需求對齊，並用代表性評測集而非單一 benchmark 做決策。
- 能指出 LLM 生成具有非確定性與幻覺風險，不能直接作為 ACL、商業規則或事實來源；RAG 仍需要引用、拒答與輸出驗證。
- 能以 token、context window、首 token／完整回應延遲、成本與品質建立 prompt budget，並說明壓縮不能破壞必要上下文。
- 能區分 429／暫時性 5xx／timeout 與認證、schema、政策或其他不可重試錯誤；能提出單一 retry budget、退避、jitter、冪等與熔斷邊界。
- 能把 provider rate limit、應用 admission、每租戶 quota、TPM／RPM、並發與每日成本 cap 分開量測，避免 gateway、service、SDK 多層重試。
- 能說明 embedding model、dimension、distance metric 與 index version 必須相容；混合版本要有 namespace、回填、重建與查詢路由策略。
- 能使用 query plan、buffer read、filter selectivity、candidate count、P95/P99、recall@k、ingestion lag 與 DB pool／CPU 指標定位 pgvector 退化。
- 能指出 ACL／tenant filter 必須在向量檢索和資料返回前生效，不能只取全域 top-k 再在應用層刪除未授權結果。
- 能將 RAG 評測拆成 retrieval、ranking、context construction、generation、citation 與安全層，並以離線 ground truth 加線上抽樣檢查驗證。
- 能提出至少三階段可回滾 rollout，並以 cost、429、retry amplification、P99、recall、citation correctness、freshness、cross-tenant violation 與 ingestion lag 判斷成敗。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議換模型、增加 timeout、重啟或增加 worker，沒有 provider 邊界、檢索證據、安全隔離或 rollback 條件。 |
| 1 | 能列出 token、429、HNSW、pgvector 或 RAG 等名詞，但無法建立因果鏈，也沒有可執行的評測、容量或修復方案。 |
| 2 | 能指出主要 token／重試／索引／freshness 問題並提出部分修復，但遺漏至少兩個核心面向，例如模型選型證據、租戶 ACL、query plan、stream cancellation、成本上限或 RAG 評測。 |
| 3 | 能整合 model／provider 選型、prompt／成本、API reliability、rate limit、vector index／pgvector、RAG quality／security 與分階段交付，並提出具體指標和 rollback。 |
| 4 | 除上述內容外，能處理多層 retry amplification、部分完成與取消、embedding／index version migration、filter selectivity、慢租戶隔離、引用與 prompt injection 的邊界，並以故障注入和 canary 證明方案。 |

評分時請分別檢查四個核心面向：**model／prompt／成本**、**API／rate limit／可靠性**、**vector／pgvector／效能新鮮度**、**RAG 評測／安全／交付**。

### 通過標準

整體總評達 **3/4 分**才通過；四個核心面向均不得低於 2 分，且答案必須同時提出一個可執行的 rollback 條件、一個驗證 tenant／ACL 隔離的測試，以及一個驗證 retry、cancellation 或慢 Provider 的故障注入實驗。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先把事故拆成四條會互相放大的鏈。第一條是模型與 prompt 鏈：較便宜的 Provider 未用真實中文、長上下文、引用和拒答 workload 評測，切換後品質下降；完整歷史加 20 個 chunk 讓 input token 約三倍，造成更高成本、首 token 延遲和 TPM 壓力。第二條是可靠性鏈：Provider 429／timeout 被 SDK、service、gateway 多層重試，沒有共用 budget，導致一次 user request 放大成多次上游請求；client disconnect 也沒有取消上游，長時間佔用連線和額度。第三條是檢索鏈：降低 HNSW 搜尋範圍、混用 embedding／index 版本、候選數過小，以及應用層才做 ACL filter，會同時降低 recall、浪費查詢資源並造成安全風險。第四條是資料與容量鏈：embedding pipeline backlog 讓 freshness 下降，pgvector filter／scan 與 DB buffer／connection wait 又拉高檢索 P99，最後把更多請求推向 timeout 和重試。

已知證據包括 token、429、P99、recall、ingestion lag、DB buffer／connection wait 和 trace 中的 scan；「多層重試是主要放大倍數」、「混合 embedding 版本造成品質下降」、「filter 造成 planner 退化」仍應用 request trace、provider usage、query plan、版本分布和 controlled experiment 驗證。不能把 DB CPU 只有 65% 解讀成資料庫沒有瓶頸，I/O、buffer、connection wait、鎖與單租戶 filter 退化都可能先影響 tail latency。

模型／Provider 選型應先建 workload matrix：短問答、中文和多語、長上下文、引用、拒答、敏感資料、結構化輸出、工具呼叫、prompt injection、峰值併發與 streaming。評測資料要包含每個租戶的權限邊界和最新文件，保留人工標註的答案、引用、拒答與安全期望。比較模型時同時記錄品質、citation faithfulness、錯誤率、首 token／完整回應 P95/P99、TPM／RPM、每請求成本、資料保留與 Provider SLA。以版本化 provider adapter、feature flag 和 canary 將小比例真實流量導向新模型；若品質、429、P99、成本或安全指標越過門檻，立刻切回已驗證的 provider，而不是依賴模糊的「模型比較表」。

Prompt 與成本要有明確 budget。把 system instruction、對話歷史、檢索 context、使用者輸入和 output 分開量測；以 query intent 或租戶方案決定最大 context、候選 chunk 數、歷史摘要和 output 上限。去除重複規則、只保留與問題相關的 chunk、使用文件版本和摘要、限制結構化 output，必要時用小模型做分類或 query rewrite；但每次壓縮都要在固定評測集上確認 retrieval recall、citation correctness、answer faithfulness 和拒答沒有跌破門檻。按 tenant、feature、model、provider 記錄 input／output token、cache hit、cost、queue wait、quality sample，設每日 hard cap、單請求 budget 和超限降級。

API 邊界只保留一套 retry policy。先做 admission control，檢查租戶 quota、預估 token 和 provider capacity；為 connect、time-to-first-token、read、overall request 分別設定 timeout，並把 client cancellation 傳給 HTTP stream 和 Provider SDK。429 要讀 Retry-After，暫時性 5xx 或可安全重試的 timeout 才能在有限 retry budget 內使用指數退避和 jitter；認證、schema、內容政策、無效模型和其他明確 4xx 不應重試。gateway、service、SDK 應透過 request context 和 attempt metadata 協作，禁止每層各自重試。對已產生副作用的 tool／workflow 使用 idempotency key；純生成請求也要以 request ID 去重計費和 trace。熔斷後可使用已驗證的 fallback、縮短 context、非 streaming 降級或明確回覆稍後重試，但不能把不相容的模型當成透明替代。

向量診斷要先確認 embedding model、dimension、normalization 和 distance metric 一致，並將 model／index version 存在每筆資料和 query trace。若要遷移 embedding，使用新 namespace 或版本欄位完成批次回填、雙讀比較與切換，不把不同語意空間直接混搜。HNSW 的 M、efConstruction、efSearch 影響圖大小、建置時間、記憶體和 recall；IVF 的 nlist、nprobe 與 centroid 訓練資料影響候選範圍與查詢成本。降低 efSearch 可能解釋 recall 下降，但要用 exact ground truth 和固定 query set 量化，而不是只憑參數名稱猜測。

pgvector 的修復要先取 `EXPLAIN (ANALYZE, BUFFERS)`、實際 filter selectivity、候選數和資料分布。檢查 distance operator、索引類型、索引條件、planner statistics、排序和 LIMIT 是否符合預期；必要時比較 exact、ANN、不同 filter selectivity、不同候選 oversampling 的計畫。ACL／tenant 條件必須在檢索查詢的可信邊界生效，並在返回 chunk、組裝 prompt 和引用時再次驗證 resource ID；不能先取全域 top-k 再在應用層刪除，因為會漏掉合法候選，也可能在中間 trace 或 cache 洩漏標題。向量查詢、metadata 與文件版本應有可追溯的 index version 和 freshness timestamp。

RAG 評測應分層。Retrieval 層量測 recall@k、precision、MRR／nDCG、ACL violation、freshness hit rate；context 層量測去重、chunk 完整性、token budget 與有效引用；generation 層量測 answer correctness、faithfulness、citation correctness、拒答率、格式和延遲；安全層測 prompt injection、跨租戶查詢、文件 ACL、敏感資料與工具邊界。離線用含 ground truth 的固定集合，線上用抽樣人工／規則／模型輔助評測，但保留原始文件版本、候選 ID、權限決策、prompt hash、model／provider、index version、token、retry 和引用 ID；敏感內容要遮罩或以受控 hash／reference 保存。

交付可分三階段。第一階段止血：以 feature flag 切回已驗證模型或縮小新 Provider 流量；關閉多層重試，只保留一套有 budget 的 429／暫時性錯誤處理；對每租戶、單請求和全域 token／成本設上限；client disconnect 立刻取消 streaming；強制在檢索邊界套用 tenant／ACL filter，暫停有問題的 index／embedding 版本切換並保留舊版本。觀測 429、attempt/request ratio、成本、P99、cross-tenant violation、recall smoke test 和 freshness；若任何安全違規、成本仍失控、P99 或錯誤超過警戒線，回切 provider／index、降低流量或停用受影響功能。

第二階段修復：建立 provider adapter 和 workload evaluation gate，完成 prompt budget、分層模型路由、embedding version migration、pgvector query plan 優化、候選 oversampling 與 ingestion backfill；加入完整 trace、租戶 quota、circuit breaker、fallback、慢租戶 bulkhead 和 cache versioning。通過 contract／quality／security／load tests 後以 canary 放量。第三階段調優容量：依固定 workload 調整 HNSW／IVF 參數、partition／replica、DB pool、embedding worker、queue 和 cache，設計 freshness SLA 和重建窗口；以 P99、recall、成本、ingestion lag、DB wait、記憶體與 Provider saturation 共同決策，所有變更保留舊版本和可逆 deployment。

</details>

## 常見失分點

- 看到成本或品質下降就只換模型，沒有用真實語言、長上下文、引用、安全與租戶 workload 評測。
- 把 prompt 變長、token 變多和 TPM／429 的關係分開處理，沒有指出多層重試會放大成本與上游壓力。
- 對所有 429、timeout、5xx 和 4xx 一律重試，沒有 Retry-After、jitter、retry budget、冪等或熔斷。
- 只調高 HNSW `efSearch` 或改 IVF 參數，沒有確認 embedding version、distance metric、query plan、filter selectivity 與 ground truth recall。
- 先取全域 top-k 再由應用層套 ACL，忽略合法候選被排除、資料洩漏和跨租戶安全問題。
- 只看平均 latency 或 DB CPU，沒有量測 P99、buffer read、connection wait、候選數、freshness 和 ingestion backlog。
- 把 RAG 等同於「有檢索就不會幻覺」，沒有評估 citation correctness、faithfulness、拒答和 prompt injection。
- 沒有處理 streaming client disconnect、Provider cancellation、cache／trace 中的敏感資料與部分完成語意。
- 一次修改模型、prompt、索引、embedding pipeline 和 DB 配置，沒有 canary、單變因實驗或 rollback 條件。

## 延伸追問

1. 如果兩個 Provider 的 tokenization、上下文上限與安全政策不同，provider abstraction 應該抽象哪些能力，哪些差異必須暴露給路由層？
2. 如果上游在 response body 已開始後 timeout，如何定義 streaming API 的錯誤語意、使用者重試與成本歸屬？
3. 如果同一租戶同時需要低延遲客服和高品質分析，如何用 quota、priority、model routing 和 bulkhead 避免彼此搶容量？
4. 如果新 embedding model 維度不同但不能停機，你會如何設計雙寫、雙讀、namespace、index build、回填和切換驗證？
5. 如果 pgvector 在高選擇性 ACL filter 下無法同時滿足 recall 與 P99，你會如何比較 query-time filter、分區、租戶索引、oversampling 和專用向量服務？
6. 如果文件在回答生成期間被撤銷權限，哪個時間點的 ACL 是權威？如何避免 cache、prompt、引用和 audit trail 留下不該再看的內容？
7. 如果線上人工評測顯示回答品質變好但 recall@k 變差，你會如何判斷 reranker、prompt、模型先驗與評測集偏差？
8. 如果成本 hard cap 觸發時仍有已接受的 streaming 請求，你會如何安排 admission、取消、部分回答、計費與用戶通知？
