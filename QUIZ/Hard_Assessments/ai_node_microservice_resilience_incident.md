# AI／Node.js／Microservice Resilience Incident：從提示鏈到共識控制面

- **Assessment ID**: `assessment.ai-node-microservice.resilience-incident.v1`
- **主要 Concept ID**: `concept.ai.ai-system-design.customer-service`
- **次要 Concept IDs**:
  - `concept.ai.ai-system-design.document-qa`
  - `concept.ai.embeddings.generation`
  - `concept.ai.vector-database.selection`
  - `concept.ai.vector-database.fundamentals`
  - `concept.ai.prompt.engineering`
  - `concept.ai.llm.function-calling`
  - `concept.ai.rag.retrieval-generation-pipeline`
  - `concept.ai.llm.caching`
  - `concept.nodejs.core.module-systems`
  - `concept.nodejs.core.cluster-worker-threads`
  - `concept.nodejs.typescript.advanced-types`
  - `concept.nodejs.typescript.node-integration`
  - `concept.nodejs.v8.jit-optimization`
  - `concept.nodejs.express.middleware`
  - `concept.microservices.api-gateway`
  - `concept.microservices.circuit-breaker`
  - `concept.microservices.architecture.tradeoffs`
  - `concept.microservices.service-discovery`
  - `concept.distributed-systems.raft.consensus`
- **對應文章**:
  - [設計智能客服系統](../../02_Backend_Development/AI_and_Machine_Learning/AI_System_Design_Cases/design_ai_customer_service.md)
  - [設計文件搜尋與問答系統](../../02_Backend_Development/AI_and_Machine_Learning/AI_System_Design_Cases/design_document_qa.md)
  - [向量嵌入原理](../../02_Backend_Development/AI_and_Machine_Learning/Vector_Databases/vector_embeddings.md)
  - [主流向量資料庫對比與選型](../../02_Backend_Development/AI_and_Machine_Learning/Vector_Databases/vector_db_comparison.md)
  - [什麼是向量資料庫](../../02_Backend_Development/AI_and_Machine_Learning/Vector_Databases/what_is_vector_database.md)
  - [Prompt Engineering 完整指南](../../02_Backend_Development/AI_and_Machine_Learning/LLM_Integration/prompt_engineering.md)
  - [Function Calling 與 Tool Use](../../02_Backend_Development/AI_and_Machine_Learning/LLM_Integration/function_calling.md)
  - [RAG 架構設計與實現](../../02_Backend_Development/AI_and_Machine_Learning/LLM_Integration/rag_architecture.md)
  - [LLM 快取策略設計](../../02_Backend_Development/AI_and_Machine_Learning/LLM_Integration/llm_caching.md)
  - [Node.js 模組系統](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Core/module_systems.md)
  - [Cluster 與 Worker Threads](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Core/cluster_and_worker_threads.md)
  - [TypeScript 進階類型系統](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/TypeScript/advanced_type_system.md)
  - [TypeScript 與 Node.js 整合](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/TypeScript/typescript_with_nodejs.md)
  - [V8 引擎與性能優化](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Runtimes/v8_engine_optimization.md)
  - [Express.js 中介層詳解](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/Express/middleware_in_depth.md)
  - [什麼是 API Gateway](../../03_System_Design_and_Architecture/Micro_Service/what_is_api_gateway.md)
  - [微服務容錯與彈性設計：斷路器模式](../../03_System_Design_and_Architecture/Micro_Service/circuit_breaker_pattern.md)
  - [微服務與單體架構取捨](../../03_System_Design_and_Architecture/Micro_Service/monolith_vs_microservices.md)
  - [什麼是服務發現](../../03_System_Design_and_Architecture/Micro_Service/what_is_service_discovery.md)
  - [Raft 與 Paxos 共識演算法](../../03_System_Design_and_Architecture/Distributed_Systems_Theory/consensus_algorithms_raft_paxos.md)
- **題型**: `生產事故診斷`、`AI 邊界設計`、`Node.js Runtime 調優`、`微服務韌性設計`、`容量與回滾`
- **難度**: 10
- **重要程度**: 5
- **建議作答時間**: 60 分鐘
- **標籤**: `AI System Design`, `Prompt`, `RAG`, `Embedding`, `Function Calling`, `Vector Database`, `LLM Cache`, `Node.js`, `TypeScript`, `V8`, `Worker Threads`, `Express`, `API Gateway`, `Service Discovery`, `Circuit Breaker`, `Raft`, `Capacity`, `Rollback`
- **Learning Objective IDs**:
  - `concept.ai.ai-system-design.customer-service/LO-1`
  - `concept.ai.ai-system-design.customer-service/LO-2`
  - `concept.ai.ai-system-design.customer-service/LO-3`
  - `concept.ai.ai-system-design.document-qa/LO-1`
  - `concept.ai.ai-system-design.document-qa/LO-2`
  - `concept.ai.ai-system-design.document-qa/LO-3`
  - `concept.ai.embeddings.generation/LO-1`
  - `concept.ai.embeddings.generation/LO-2`
  - `concept.ai.embeddings.generation/LO-3`
  - `concept.ai.vector-database.selection/LO-1`
  - `concept.ai.vector-database.selection/LO-2`
  - `concept.ai.vector-database.selection/LO-3`
  - `concept.ai.vector-database.fundamentals/LO-1`
  - `concept.ai.vector-database.fundamentals/LO-2`
  - `concept.ai.vector-database.fundamentals/LO-3`
  - `concept.ai.prompt.engineering/LO-1`
  - `concept.ai.prompt.engineering/LO-2`
  - `concept.ai.prompt.engineering/LO-3`
  - `concept.ai.llm.function-calling/LO-1`
  - `concept.ai.llm.function-calling/LO-2`
  - `concept.ai.llm.function-calling/LO-3`
  - `concept.ai.rag.retrieval-generation-pipeline/LO-1`
  - `concept.ai.rag.retrieval-generation-pipeline/LO-2`
  - `concept.ai.rag.retrieval-generation-pipeline/LO-3`
  - `concept.ai.llm.caching/LO-1`
  - `concept.ai.llm.caching/LO-2`
  - `concept.ai.llm.caching/LO-3`
  - `concept.nodejs.core.module-systems/LO-1`
  - `concept.nodejs.core.module-systems/LO-2`
  - `concept.nodejs.core.module-systems/LO-3`
  - `concept.nodejs.core.cluster-worker-threads/LO-1`
  - `concept.nodejs.core.cluster-worker-threads/LO-2`
  - `concept.nodejs.core.cluster-worker-threads/LO-3`
  - `concept.nodejs.typescript.advanced-types/LO-1`
  - `concept.nodejs.typescript.advanced-types/LO-2`
  - `concept.nodejs.typescript.advanced-types/LO-3`
  - `concept.nodejs.typescript.node-integration/LO-1`
  - `concept.nodejs.typescript.node-integration/LO-2`
  - `concept.nodejs.typescript.node-integration/LO-3`
  - `concept.nodejs.v8.jit-optimization/LO-1`
  - `concept.nodejs.v8.jit-optimization/LO-2`
  - `concept.nodejs.v8.jit-optimization/LO-3`
  - `concept.nodejs.express.middleware/LO-1`
  - `concept.nodejs.express.middleware/LO-2`
  - `concept.nodejs.express.middleware/LO-3`
  - `concept.microservices.api-gateway/LO-1`
  - `concept.microservices.api-gateway/LO-2`
  - `concept.microservices.api-gateway/LO-3`
  - `concept.microservices.circuit-breaker/LO-1`
  - `concept.microservices.circuit-breaker/LO-2`
  - `concept.microservices.circuit-breaker/LO-3`
  - `concept.microservices.architecture.tradeoffs/LO-1`
  - `concept.microservices.architecture.tradeoffs/LO-2`
  - `concept.microservices.architecture.tradeoffs/LO-3`
  - `concept.microservices.service-discovery/LO-1`
  - `concept.microservices.service-discovery/LO-2`
  - `concept.microservices.service-discovery/LO-3`
  - `concept.distributed-systems.raft.consensus/LO-1`
  - `concept.distributed-systems.raft.consensus/LO-2`
  - `concept.distributed-systems.raft.consensus/LO-3`

## 測驗目標

- 能從 AI 請求的 prompt、embedding、RAG、快取與 function calling 建立端到端故障因果鏈，分辨品質、正確性、安全性與成本問題。
- 能從 Node.js 的 module resolution、TypeScript build、Express middleware、Worker Threads、Cluster、V8 GC／deoptimization 與服務容量定位 runtime 瓶頸。
- 能設計 API Gateway、服務發現、timeout、retry、circuit breaker、bulkhead 與控制面共識的責任邊界，避免單點或級聯失敗。
- 能用容量模型、分階段 canary、故障注入、品質門檻與明確 rollback 條件交付修復。

## 問題情境與限制條件

某多租戶 SaaS 提供 `Atlas Assist`：使用者可搜尋企業文件、詢問政策，並透過受控工具建立工單或查詢訂單。系統原本是模組化單體，近期為了獨立擴展拆成 `gateway`、`assistant-api`、`retrieval-service`、`tool-executor`、`indexer` 與 `config-control-plane`；所有服務都以 Node.js 執行，部分舊模組仍使用 CommonJS，新模組改用 ESM 與 TypeScript。

最近一次發布同時包含以下變更：

1. 將 system prompt 改為保留完整對話、最多 20 個 chunk 和更多格式規則；加入語義快取，但快取鍵沒有完整包含 tenant、ACL policy、model、prompt version、embedding version 與工具權限。為降低成本，低信心問題會改用較小模型，但沒有完整測試中文、最新文件、拒答與 prompt injection。
2. `retrieval-service` 將 embedding model 與 ANN index 升級，舊資料仍有不同 dimension／版本；查詢先取得全域 top-k，再在應用層套用租戶與文件 ACL。文件 ingestion 延遲從 5 分鐘升至 50 分鐘，部分租戶查到過期政策。
3. `assistant-api` 將重排序、文件解析和部分 tokenization 移至 Worker Threads；Cluster 由每個 pod 4 個 process 增至 8 個，worker queue 沒有上限。TypeScript 生產建置使用 transpile-only，某次 CJS／ESM 互通變更讓兩份 module graph 各自建立一份 policy registry；工具結果也被不安全的寬型別當成已驗證資料。
4. Express middleware 新增 request logging、tenant auth、body parser、timeout、cache lookup 與 error handler，但部分 route 的註冊順序不同；一條 streaming route 在 client disconnect 後仍等待 LLM，另一條錯誤處理 middleware 在 response 已開始後再次寫入回應。
5. Gateway、service client 與 mesh 都配置了 retry；service discovery registry 的健康 TTL 過長，gateway 偶爾把流量送到已排空的舊 instance。Circuit breaker 以整個服務而非依賴／租戶／路徑分組，開啟時把健康租戶也一起 fallback。
6. 控制面使用 Raft 儲存路由、feature flag、provider quota 與 circuit-breaker policy。一次網路抖動加上慢磁碟使 leader 頻繁改選，部分 gateway 長時間使用舊設定；團隊有人提議改用「多數節點看到的最新 wall-clock」直接覆蓋配置。

發布後 35 分鐘觀察到：

- QPS 從 1,800 升至 2,400；`assistant-api` P95 從 0.9 秒升至 8 秒、P99 從 3.2 秒升至 35 秒，504 從 0.4% 升至 9%。Node event-loop delay 從 40 ms 升至 1.4 秒，Worker queue 從 0 升至 20,000，單 pod RSS 從 1.3 GB 升至 3.8 GB，major GC 與 OOM restart 增加。
- LLM 429 從 1% 升至 15%，平均 input token 約為原來 3 倍；同一個 user request 偶爾在 gateway、service 與 SDK 各重試一次以上。工具建立工單的重試 trace 出現相同 business key，成本與副作用都上升。
- RAG offline recall@10 從 0.84 降至 0.58；向量查詢 P99 從 80 ms 升至 1.2 秒。shadow audit 發現少量結果在生成前曾包含其他租戶的文件標題，雖然最終回答不一定返回完整內容；語義快取命中率反而從 40% 升至 68%。
- 某些租戶的最新文件 freshness lag 超過 45 分鐘；小模型在中文拒答、引用與工具參數方面的錯誤率明顯較高。tool executor 收到未通過完整 schema／權限驗證的參數，幸好部分下游以冪等鍵拒絕了重複請求。
- discovery stale endpoint 比例升高，circuit breaker open rate 從 0.5% 升至 35%；control plane 的 Raft term 持續增加，設定收斂時間從 5 秒升至 90 秒。觀測資料沒有一致記錄 module graph、index／prompt version、retry attempt、ACL decision、worker queue、provider token 與控制面 term。

限制條件如下：

- 不能把「換模型、增加 timeout、增加 pod、重啟」當成唯一修復，也不能關閉 tenant／ACL、schema validation、引用、冪等或審計。
- Function calling 可能產生付款、工單與資料修改等副作用；LLM 不是權限來源，也不能直接決定業務授權或繞過人工核准。
- 既有客戶 API、租戶隔離與已接受請求的冪等語意必須維持。可接受 bounded eventual consistency，但不得默默遺失索引更新、工具命令或控制面設定。
- 第一階段必須先限制成本、重試放大、記憶體／隊列成長與資料洩漏風險；所有後續調優都要有指標、警戒線、故障注入和可執行 rollback。

## 作答要求

請以事故檢討、邊界設計和三階段交付計畫回答：

1. **重建時間線與因果鏈**：區分已知證據、合理假設與待驗證項目，將 prompt／token、RAG／embedding、快取、Node runtime、下游重試、服務發現與 Raft leader churn 串成至少兩條相互放大的鏈。
2. **修正 AI 邊界**：畫出 indexing、embedding、ANN／metadata filter、reranking、prompt assembly、generation、citation／拒答與工具執行的責任邊界；說明如何處理 embedding model／dimension／index version、租戶 ACL、最新文件與模型選型。
3. **治理 prompt、RAG、快取與工具**：定義 input／context／output token budget、prompt version、semantic cache key／TTL／invalidation、引用驗證、prompt injection 防護、tool schema、權限、timeout、idempotency 與停止條件。
4. **診斷 Node.js runtime**：比較 CJS／ESM 的解析、快取與互通；檢查 TypeScript `target`、`module`、`moduleResolution`、strict／unknown 邊界、source map 與 production build；說明如何定位 module graph 重複、event-loop delay、Worker／Cluster queue、V8 hidden class／deoptimization、GC 與 RSS。
5. **修正 Express 與服務邊界**：明確排列 auth、tenant context、body／stream、timeout、cache、route、response logging 與 error handler；處理 `next`／response already started、client cancellation 與 streaming；說明哪些邏輯留在模組化單體，哪些才值得拆成服務。
6. **設計微服務韌性控制**：為 Gateway、service client、mesh、provider 與下游各指定 timeout、retry owner、retry budget、backoff、circuit breaker、bulkhead、fallback 和 admission control；修正 stale discovery、健康 TTL、排空 instance 與 per-route／per-tenant isolation。
7. **處理控制面共識**：說明 Raft 的 term、leader、quorum、commit 與線性一致性如何影響設定發布；比較不能以 wall-clock 覆蓋最新配置的原因，並提出 election churn、慢磁碟、網路分區與 stale read 的觀測與恢復方案。
8. **建立容量與交付計畫**：用 QPS、並發、token／RPM／TPM、worker queue、CPU、memory、GC、event-loop delay、vector P99、provider quota 與 control-plane convergence 做容量模型；至少提出三階段 canary、成功指標、警戒線、rollback 條件與資料／快取／索引回復方式。
9. **設計驗證與故障注入**：至少列出 AI quality／security、Node runtime、下游 reliability、discovery／consensus 四類測試，並說明如何把 trace、metrics、logs 與版本資訊串成可審計證據。

## 期待證據

- 有一條帶有 `request_id`、`correlation_id`、tenant、route、model／provider、prompt／embedding／index version、cache decision、retrieval candidates、ACL decision、tool idempotency key、retry attempt、worker id、module graph hash、discovery version、circuit state 與 Raft term 的端到端 trace。
- 能區分 Retrieval Recall／MRR、citation correctness、answer faithfulness、拒答準確率、tool schema／authorization failure、跨租戶洩漏與 semantic cache contamination；不能只用快取命中率或模型主觀評分。
- 能說明 embedding model、dimension、normalization、distance metric、ANN index 與 metadata filter 必須相容；遷移要有 namespace／version、回填、雙讀或 shadow compare、切換與 rollback。
- 能將 prompt 中的 system instruction、user content、retrieved text 與 tool result 分開標示，處理 prompt injection、context budget、輸出驗證、引用來源、TTL、模型／權限變更失效與租戶隔離。
- 能以 schema、discriminated union／`unknown` 邊界或等價驗證描述 tool result、設定與跨服務 payload 的安全解析；不能把 TypeScript 編譯通過當成 runtime validation。
- 能區分 CJS／ESM module cache 與 instance duplication、TypeScript 編譯／執行目標、Worker Threads 的共享／隔離、Cluster 的 process 邊界、V8 deoptimization／GC 與真正的 I/O latency。
- 能指出 Express middleware 的註冊順序、錯誤傳遞、response already started、stream cancellation 與 request context 對可靠性的影響。
- 能將 Gateway、應用、SDK、mesh、Provider 與下游的 timeout／retry owner 唯一化；對 429、暫時性 5xx、timeout、不可重試錯誤、非冪等工具副作用分別處理。
- 能使用 discovery TTL／health check／draining、per-route circuit breaker、bulkhead、admission control 與 stale config 觀測，避免健康租戶因共用 breaker 被拖垮。
- 能以 Raft term、commit index、quorum、leader changes、apply lag、disk fsync、network partition 和 config version 證明設定是否已提交與收斂；不能以 wall-clock 或單一節點讀值宣稱全域最新。
- 能量化 queue depth、queue age、worker concurrency、event-loop delay、RSS、heap／external memory、major GC、CPU、QPS、in-flight、token／RPM／TPM、vector P99、provider 429、circuit open、discovery stale 與 control-plane convergence。
- 能提出至少三階段可逆 rollout：第一階段止血與隔離，第二階段修復版本／邊界與容量，第三階段才調校索引、模型與拆分；每階段都有 canary 範圍、停止條件、回切版本、快取／索引處理與故障注入。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議換模型、增加 timeout／pod 或重啟；沒有 AI 資料隔離、Node runtime、微服務責任邊界、共識證據或 rollback。 |
| 1 | 能列出 RAG、Worker、Gateway、Circuit Breaker、Raft 等名詞，但無法把事故證據連成因果鏈，也沒有可驗證的容量或修復方案。 |
| 2 | 能指出部分 prompt／索引、Node 記憶體或 retry／discovery 問題並提出修復，但遺漏至少兩個核心面向，例如 ACL／tool side effect、module／V8／Express、共識控制面、容量上限或 rollback。 |
| 3 | 能整合 AI quality／security、Node runtime／request boundary、Gateway／discovery／circuit breaker／Raft 與容量交付，提出明確指標、測試和三階段 rollback。 |
| 4 | 除上述內容外，能精準處理 cache contamination、embedding migration、tool idempotency、CJS／ESM duplicated state、TypeScript runtime validation、Worker／Cluster／V8 tail latency、per-tenant bulkhead、Raft stale config 與故障注入，並用 canary evidence 證明方案可逆。 |

評分時請分別檢查四個核心面向：**AI／資料與工具邊界**、**Node.js Runtime／Express 請求生命週期**、**Gateway／微服務／共識韌性**、**容量／觀測／分階段交付**。

### 通過標準

整體總評達 **3/4 分**才通過；四個核心面向均不得低於 2 分，且答案必須同時提出一個可執行的 rollback 條件、一個 tenant／ACL 或 tool authorization 驗證、一個 retry／cancellation 或 worker backpressure 故障注入，以及一個能證明 Raft 設定版本已 commit／收斂的觀測方案。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先把事故分成四條互相放大的鏈。第一條是 AI 資料鏈：prompt 變長使 input token、首 token 延遲與 Provider TPM 壓力上升；embedding／index version 不一致、候選數過小與應用層才套 ACL 使 recall 下降；語義快取沒有 tenant、權限、模型與 prompt version 又可能回傳過期或跨租戶結果。第二條是 runtime 鏈：CJS／ESM 形成兩份 module graph，使 policy registry 與 middleware state 不一致；transpile-only 只驗證語法，不會替 runtime payload 做 schema check；無界 Worker queue、Cluster process 數增加、V8 deoptimization 與 major GC 一起推高 event-loop delay 和 RSS。第三條是網路可靠性鏈：Gateway、service、SDK、mesh 重複 retry，加上 stale discovery 把流量送往排空 instance，會使 circuit breaker 先被打開，再把健康租戶一起導向較慢的 fallback。第四條是控制面鏈：慢磁碟／網路抖動造成 Raft election churn，設定 apply lag 和 stale route 讓前面三條鏈持續使用錯誤的 quota、provider 或 breaker policy。

先分辨證據與假設。已知的是 P99、event-loop delay、queue depth、RSS、429、recall、freshness、stale endpoint、circuit open 和 Raft term 都惡化；「CJS／ESM 重複 module 是主要根因」、「ACL 過濾造成召回下降」、「retry amplification 是 504 的最大來源」要用 module graph／instance identity、query plan／candidate trace、每層 attempt counter 和 request fan-out 驗證。應先建立單一 request 的 causal trace，不應因 DB 或 CPU 不是 100% 就排除 tail latency、I/O、GC、connection 或 control-plane bottleneck。

AI 邊界應分成 ingestion、embedding、index／metadata filter、retrieval、reranking、context assembly、generation、citation／拒答與 tool execution。每筆 chunk 必須有 tenant、文件 ACL、版本、生效時間、embedding model／dimension／index version；查詢在可信檢索邊界就套 tenant／ACL filter，不能先取全域 top-k 再刪除未授權資料。embedding 遷移要使用新 namespace 或明確版本欄位，先回填、比較 exact／ANN recall 和 freshness，再以 feature flag 切換，保留舊索引供 rollback；不能直接混合不同 dimension 或語意空間。

Prompt 應把 system rule、使用者內容、retrieved evidence、工具結果和模型輸出分隔，設定 context、history、retrieval、output 和單租戶成本 budget。語義快取鍵至少包含 tenant／ACL policy version、normalized query、model、prompt template、retrieval／embedding／index version、工具權限與資料 freshness；權限、模型、prompt 或文件版本改變時失效，敏感查詢可停用快取。Prompt injection 不能改寫系統規則或直接授權工具；LLM 的 tool choice 只是提議，真正執行前要重新做 schema、租戶、身份、policy、rate limit、approval、idempotency 與 resource ownership 驗證。具有副作用的工具以 business idempotency key 去重，timeout 後要查詢狀態或進入 pending／reconciliation，而不是盲目重做。

模型／Provider 選型要使用含中文、多租戶 ACL、最新文件、引用、拒答、prompt injection、長上下文、結構化工具、streaming 和高併發的 workload matrix。應同時記錄 recall、citation correctness、faithfulness、tool success、拒答準確率、首 token／完整回應 P95/P99、token、成本、429、資料治理和 SLA；以 adapter、版本化 prompt、canary 與 fallback 控制。較小模型可以處理分類或 query rewrite，但不能在未通過品質與安全門檻時透明取代主模型。

Node.js 部分先用 module graph、resolved path、package boundary、instance identity 和 middleware registration trace 證明 CJS／ESM 是否各自載入 singleton；不能只看檔案名稱。生產 build 應固定 `target`、`module`、`moduleResolution`、strict 檢查、source map 和依賴版本，將 transpile 與 type check 分開，對跨服務 payload 和工具結果在 runtime 以 schema 驗證。`any` 不代表安全，`unknown` 加上明確 narrowing／discriminated union 才能讓失敗停在邊界。

Worker Threads 適合 CPU 密集工作，Cluster 提供 process 隔離與多核心 HTTP capacity，但兩者都要有有界 queue、concurrency、queue age、取消、重試和 OOM／crash 行為。不要用增加 process 或 worker 掩蓋 event-loop delay；要比較主執行緒、worker、GC、序列化與下游等待時間。以 heap／external memory、major GC、allocation、RSS、event-loop delay 和 CPU profile 檢查 V8 hidden class／Inline Cache 不穩定與 deoptimization；若修復物件 shape，仍要用壓測證明 tail latency 改善。

Express 應將 request ID、tenant／auth context、body／stream parser、deadline／cancellation、cache、route、response logging 與 error handler 的順序固定並以 integration test 保護。每個 middleware 必須明確選擇 `next()`、結束 response 或傳遞 error；response 已開始就不能再寫一個錯誤 body，client disconnect 要取消 LLM、retrieval 與 worker 工作。把業務規則留在模組化單體或清楚的 application boundary，只有在 ownership、資料、容量和故障隔離明確時才拆服務，避免以拆分增加網路與重試成本。

Gateway、service client、mesh、Provider 和下游只應有一個 retry owner；以 request deadline、attempt budget、exponential backoff／jitter、Retry-After 和 idempotency 控制 429／暫時性 5xx／timeout，認證、schema、policy 或非冪等副作用錯誤不可盲目重試。Circuit breaker 要依 dependency、route、operation 或租戶風險分組，配合 bulkhead、concurrency cap、admission control、draining 和 fallback；不能以一個全域 breaker 讓健康租戶一起失效。Discovery 要有短而可驗證的 TTL、主動 health check、ready／draining／dead 狀態、連線池刷新與 stale endpoint 告警。

Raft 控制面應以 term、leader、log index、commit index、applied index、quorum、fsync、election count 和 config version 判斷狀態。只有被 quorum commit 並套用到 gateway／service 的配置才算生效；wall-clock 只能作事件時間，不能證明某節點的配置較新。慢磁碟、網路分區或過短 election timeout 造成 churn 時，應保護現有已提交設定、限制未收斂發布、修復 I/O／網路與節點健康，必要時以最後已知安全版本服務；不能直接讓單節點以時間戳覆蓋共識日誌。Raft 負責小而重要的控制資料，不應拿來承擔每一筆查詢或文件內容。

交付可分三階段。第一階段止血：切回已驗證的模型／prompt／index，停用未隔離的 semantic cache 與高風險 tool；只保留一層 retry、設定 tenant／global token cap、取消 propagation、worker queue 上限與 overload response；強制 retrieval ACL、關閉 stale route、固定安全 control-plane config，並以 feature flag 回退新 module graph。成功指標是 attempt／request ratio、429、cost、cross-tenant audit、P99、event-loop delay、queue age、RSS 和 control-plane stale rate 回到警戒線內；若有 ACL／tool side effect、OOM、P99 或 config convergence 超線就立刻 rollback。

第二階段修復：完成 embedding／index version migration、query filter／候選與 freshness pipeline、cache key／invalidation、tool schema／idempotency、TypeScript build gate、CJS／ESM singleton audit、Worker backpressure、V8 profile、Express middleware contract、per-route breaker、discovery draining 與 Raft observability。用固定品質集、tenant isolation test、slow provider／client disconnect、worker saturation、stale registry、network partition 和 leader restart 做故障注入，再以小比例 canary 放量。第三階段才做 ANN／模型／worker／服務切分的容量調優；每次只變更一個主要變數，保留舊 prompt、model、index、config、cache namespace 與可重建的 ingestion checkpoint，讓 rollback 不會遺失文件更新或重複工具副作用。

</details>

## 常見失分點

- 只換模型、增加 timeout 或 pod，沒有建立 prompt／retrieval／runtime／network／control-plane 的因果鏈。
- 只看 semantic cache hit rate，沒有把 tenant、ACL、prompt／model／index version 與 freshness 放進鍵或失效策略。
- 以 LLM output 作為授權決策，或在 tool timeout 後直接重做具有副作用的操作。
- 認為 TypeScript 編譯通過就等於跨服務 payload 安全，忽略 `any`、type erasure 與 runtime schema validation。
- 把 Cluster、Worker Threads、V8 GC、event-loop delay 混成「Node.js 單線程慢」，沒有用 queue、profile 和 heap／RSS 證據分辨。
- 忽略 CJS／ESM 可能形成兩份 singleton，也沒有檢查 Express middleware 順序、error handler 與 client cancellation。
- 在 Gateway、service、SDK、mesh 多層各自 retry，或用全域 circuit breaker／長 discovery TTL 放大級聯失敗。
- 用 wall-clock 或單節點最新設定取代 Raft quorum／commit，沒有處理 stale config、leader churn 與 applied lag。
- 只有「逐步放量」而沒有 canary 範圍、警戒線、停止條件、資料／快取／索引回復與可實際執行的 rollback。

## 延伸追問

1. 如果 embedding model 已完成一半回填但新舊索引的 recall 差異只出現在少數租戶，你會如何設計雙讀、流量切換、租戶級 rollback 與 freshness 保證？
2. 如果 semantic cache 命中率很高但某個租戶偶爾收到舊政策，你會如何用 cache key、版本、ACL、trace 和 replay 找出污染來源？
3. 如果 tool provider 在 timeout 後不支援查詢狀態，但業務又要求不能重複建立工單，你會如何設計 pending、人工 reconciliation、outbox／inbox 與使用者可見狀態？
4. 如果 Worker queue 有界後開始丟棄低優先序工作，你會如何設計 admission、優先級、取消、重試與使用者降級，而不是把 queue 再放大？
5. 如果 CJS／ESM 重複 module 只在某一條 route 出現，你會如何用 resolved path、module graph、instance identity 與 integration test 證明修復沒有破壞其他 package boundary？
6. 如果 circuit breaker 已按租戶分組但仍頻繁開啟，你會如何區分 Provider quota、discovery stale、下游慢查詢、event-loop delay 與控制面 stale policy？
7. 如果 Raft leader 一直改選但所有 gateway 都能讀到同一個 commit index，你會如何判斷是控制面本身、網路／磁碟、或應用 apply lag，並決定是否需要停止發布？
8. 在保留模組化單體的前提下，哪些 ownership、資料邊界、容量或故障隔離證據達成後，才值得把 retrieval 或 tool executor 拆成獨立服務？
