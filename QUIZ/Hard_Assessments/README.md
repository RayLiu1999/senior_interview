# 硬測驗 (Hard Assessments)

這個目錄收集需要讀者進行狀態追蹤、故障診斷或權衡取捨的測驗。它與 `QUIZ/` 中偏向快速複習的題目不同，每一題都提供穩定的 Assessment ID、期待證據與 0-4 分評分規準。

## 測驗列表

| 概念 | 測驗 | 難度 | 題型 |
| :--- | :--- | :---: | :--- |
| TCP 連接管理 | [TCP 連接診斷](./tcp_connection_diagnosis.md) | 8 | 追蹤、故障診斷、權衡取捨 |
| 資料庫交易隔離 | [資料庫交易追蹤](./database_transaction_schedule.md) | 8 | 追蹤、併發診斷、權衡取捨 |
| 快取失效模式 | [快取故障診斷](./cache_failure_diagnosis.md) | 8 | 故障診斷、容量保護、權衡取捨 |
| RAG 檢索與生成 | [RAG 故障診斷](./rag_retrieval_debugging.md) | 8 | 故障診斷、檢索評估、成本與延遲 |
| API 冪等與限流 | [API 韌性診斷](./api_resilience_idempotency_rate_limit.md) | 8 | 重試診斷、容量保護、權衡取捨 |
| Kafka 訊息可靠性 | [訊息傳遞可靠性](./message_delivery_reliability.md) | 8 | 可靠性、重複、順序與權衡取捨 |
| 分散式一致性與 Saga | [一致性與 Saga 設計](./distributed_consistency_saga_design.md) | 8 | 分割區診斷、補償、系統設計 |
| 可觀測性事故診斷 | [可觀測性事故診斷](./observability_incident_diagnosis.md) | 8 | 指標、日誌、追蹤、SLO |
| Kubernetes 發布與容量 | [Kubernetes Production Rollout Incident](./kubernetes_rollout_incident.md) | 9 | 發布診斷、Probe、資源與擴縮 |
| Docker 建置與執行期 | [Docker Build & Runtime Incident](./docker_build_runtime_incident.md) | 9 | 映像層、建置快取、隔離、安全與資源限制 |
| CI/CD 安全交付 | [Safe Delivery Pipeline Incident](./safe_delivery_pipeline_incident.md) | 9 | Pipeline、發布策略、Feature Flag、GitOps 與品質閘門 |
| 雲端架構可靠性 | [Cloud Architecture Reliability Incident](./cloud_architecture_reliability_incident.md) | 9 | 服務選型、責任邊界、Serverless、容量與故障恢復 |
| Web／API 安全事故 | [Web Security Breach Incident](./web_security_breach_incident.md) | 9 | 身份、JWT、API 防護、CSRF、TLS 與事故回復 |
| 可擴展訂單平台設計審查 | [Extensible Order Platform Design Review](./architecture_pattern_design_review.md) | 9 | DI、Strategy、Observer、Proxy、OCP 與變更風險 |
| Java Runtime Concurrency | [Java Runtime Concurrency Incident](./java_runtime_concurrency_incident.md) | 9 | Thread Pool、JMM、鎖競爭、GC、Spring IoC 與延遲診斷 |
| Python Async Service | [Python Async Service Incident](./python_async_service_incident.md) | 9 | FastAPI、事件循環、GIL、記憶體與依賴生命週期 |
| C# ASP.NET Runtime | [C# ASP.NET Runtime Incident](./csharp_aspnet_runtime_incident.md) | 9 | async、Task、鎖、GC、ASP.NET Core DI 與容量診斷 |
| C# Resource Boundary | [C# Resource Boundary Incident](./csharp_resource_boundary_incident.md) | 9 | Middleware、DbContext、IDisposable、Connection Pool 與資源生命週期 |
| PHP-FPM Laravel Runtime | [PHP-FPM Laravel Runtime Incident](./php_fpm_laravel_runtime_incident.md) | 9 | PHP-FPM、OPcache、GC、Laravel Service Container 與效能診斷 |
| Node.js Event Loop Runtime | [Node.js Event Loop Runtime Incident](./nodejs_event_loop_runtime_incident.md) | 9 | Event Loop、非阻塞 I/O、Stream 背壓、Express 錯誤與 V8 記憶體 |
| NestJS Modular API | [NestJS Modular API Incident](./nestjs_modular_api_incident.md) | 9 | Module Graph、DI Scope、Provider、Request Lifecycle 與 Exception Filter |
| 限量資源系統設計 | [限量資源容量與一致性設計](./flash_sale_capacity_correctness.md) | 9 | 秒殺、分散式鎖、購票與容量 |
| Go Worker Pipeline | [Go Worker Pipeline 診斷](./go_concurrent_worker_diagnosis.md) | 9 | 取消、背壓、Channel 與 Goroutine |
| Go Gin Production API | [Gin API Production Incident](./gin_api_production_incident.md) | 9 | Middleware Chain、Context Reuse、並發安全、容量與多租戶隔離 |
| 資料結構與執行環境綜合事故 | [Core Runtime & Data Structures Incident](./core_runtime_data_structures_incident.md) | 9 | 演算法、OS I/O、Go／C#／Python runtime、容量與正確性 |
| 資料結構與演算法事故 | [Data Structures & Algorithms Incident](./data_structures_algorithm_incident.md) | 9 | 演算法選擇、容量、延遲與正確性 |
| 資料庫儲存與一致性 | [Database Storage & Consistency Incident](./database_storage_consistency_incident.md) | 10 | SQL、NoSQL、MVCC、複寫、備份、分片與連線池 |
| 儲存／API／訊息／搜尋邊界 | [Backend Storage／API／Messaging／Search Incident](./storage_api_messaging_search_incident.md) | 10 | 跨系統一致性、容量、可靠性與 API 合約 |
| API Contract Boundary | [API Contract Boundary Incident](./api_contract_boundary_incident.md) | 9 | 版本演化、事件投遞、Webhook 與即時連線 |
| 訊息佇列可靠性 | [訊息佇列可靠性事故](./message_queue_reliability_incident.md) | 9 | Kafka、RabbitMQ、NATS、Redis、確認、重試與順序 |
| 網路與作業系統韌性 | [Network + Operating System Resilience Incident](./network_os_resilience_incident.md) | 10 | 跨層故障樹、容量推理、協定選擇與復原 |
| 分散式系統設計總檢視 | [大型系統設計綜合檢視](./large_scale_system_design_review.md) | 10 | 容量、一致性、即時性、故障診斷與成本 |
| 分散式架構變更邊界 | [Architecture Change Boundary Review](./architecture_change_boundary_review.md) | 9 | 設計原則、可測試性、一致性與漸進式演進 |
| DDD／Microservice 交付 | [DDD／Microservice Delivery Incident](./ddd_microservice_delivery_incident.md) | 9 | DDD 邊界、事件交付、架構權衡與回滾 |
| Container／Kubernetes 邊界 | [Container Orchestration Boundary Incident](./container_orchestration_boundary_incident.md) | 9 | Image Provenance、部署、網路、儲存、安全與容量 |
| Go Runtime Framework | [Go Runtime Framework Incident](./go_runtime_framework_incident.md) | 9 | Echo、Middleware、allocation／GC、Profiling 與安全 |
| Java／.NET Toolchain | [Java/.NET Toolchain Quality Incident](./java_dotnet_toolchain_quality_incident.md) | 9 | 依賴、測試隔離、build 與可重現發布 |
| Node.js Tooling Fullstack | [Node.js Tooling Fullstack Boundary Incident](./nodejs_tooling_fullstack_boundary_incident.md) | 9 | 依賴、Runtime、TypeScript、Express 與 Nuxt |
| PHP Framework Tooling | [PHP Framework Tooling Incident](./php_framework_tooling_incident.md) | 9 | 依賴、自動載入、框架生命週期與隊列 |
| PHP Core／Laravel 完整邊界 | [PHP Core／Laravel Completion Incident](./php_core_laravel_completion_incident.md) | 9 | 型別、自動載入、請求、資料、安全與資源 |
| Python FastAPI API Boundary | [Python FastAPI API Boundary Incident](./python_fastapi_api_boundary_incident.md) | 9 | API 契約、非同步容量、安全與部署 |
| Python Web Frameworks | [Python Web Frameworks Production Incident](./python_web_frameworks_incident.md) | 9 | Django／Flask 邊界、容量、安全與選型 |
| Python Testing Quality | [Python Testing Quality Incident](./python_testing_quality_incident.md) | 9 | pytest、非同步生命週期、依賴與可重現交付 |
| LLM／Vector Retrieval | [LLM／Vector Retrieval Incident](./llm_vector_retrieval_incident.md) | 9 | Provider、LLM API、向量檢索、RAG 評測與安全 |
| AI／Node／Microservice 韌性 | [AI／Node.js／Microservice Resilience Incident](./ai_node_microservice_resilience_incident.md) | 10 | Prompt、Runtime、微服務、共識與回滾 |
| 可觀測性與交付訊號 | [可觀測性與交付訊號事故診斷](./observability_delivery_signal_incident.md) | 9 | Metrics、Logs、Traces、CI/CD 與供應鏈 |
| Security Testing Quality | [Security Testing Quality Incident](./security_testing_quality_incident.md) | 10 | 威脅模型、安全測試、品質事故與回復 |
| AI／Engineering Management Delivery | [AI／Engineering Management Delivery Incident](./ai_management_delivery_incident.md) | 9 | 模型品質、MLOps、團隊決策、培養與領導 |
| Frontend State & Rendering | [Frontend State & Rendering Incident](./frontend_state_rendering_incident.md) | 9 | React／Vue 狀態、渲染、SSR／CSR、效能與無障礙 |
| Foundations／Storage／Tooling | [Foundations／Storage／Tooling Completion Incident](./foundations_storage_tooling_completion_incident.md) | 9 | OS、資料庫、Kafka、Go modules、容量與可重現交付 |
| Language／Tooling／Framework | [Language／Tooling／Framework Completion Incident](./language_tooling_framework_completion_incident.md) | 9 | Runtime、依賴、框架安全、benchmark 與回滾 |
| Architecture／Delivery／Quality | [Architecture／Delivery／Quality Completion Incident](./architecture_delivery_quality_completion_incident.md) | 9 | Gossip、DDD、交付治理、招聘與測試品質 |

## 使用方式

1. 先閱讀對應文章，確認自己理解列出的學習目標。
2. 遮住「參考答案與詳解」，在建議時間內完成題目。
3. 依「期待證據」與評分規準自評，記錄失分點。
4. 回到文章補強缺口，再回答延伸追問。

目前共有 52 份 Hard Assessment；553 篇主題文章均已完成至少一份硬測驗映射。新增或修改 assessment 後，請執行 `go run ./scripts/validate_assessments.go`。
