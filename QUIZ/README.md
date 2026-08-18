# 📝 重點考題 (Quiz)

> 這個資料夾收集了各主題中**重要程度 3-5** 的核心題目，設計成自我測驗的形式，幫助您快速檢驗學習成效。

## 使用方式

1. **先嘗試自己回答問題** - 不要急著看答案
2. **展開「答案提示」核對重點** - 確認自己是否掌握關鍵概念
3. **點擊連結查看完整解答** - 深入理解細節
4. **完成檢核表** - 追蹤學習進度

---

## 🧪 硬測驗軌道 (Assessment Track)

現有 Quiz 適合快速複習與口頭自測；硬測驗則要求讀者在故障、限制條件與權衡取捨下展開推理，並使用明確評分規準判斷是否達到 senior level。完整欄位與 ID 規則請參考 [硬測驗規格](./ASSESSMENT_SPEC.md)，測驗索引請見 [Hard Assessments](./Hard_Assessments/README.md)，全庫盤點與遷移順序請見 [測驗架構全面盤點與執行規劃書](./ASSESSMENT_ROADMAP.md)。

| 概念 | 硬測驗 | 題型 |
| :--- | :--- | :--- |
| TCP 連接管理 | [TCP 連接診斷](./Hard_Assessments/tcp_connection_diagnosis.md) | 追蹤、故障診斷、權衡取捨 |
| 資料庫交易隔離 | [資料庫交易追蹤](./Hard_Assessments/database_transaction_schedule.md) | 追蹤、併發診斷、權衡取捨 |
| 快取失效模式 | [快取故障診斷](./Hard_Assessments/cache_failure_diagnosis.md) | 故障診斷、容量保護、權衡取捨 |
| RAG 檢索與生成 | [RAG 故障診斷](./Hard_Assessments/rag_retrieval_debugging.md) | 故障診斷、檢索評估、成本與延遲 |
| API 冪等與限流 | [API 韌性診斷](./Hard_Assessments/api_resilience_idempotency_rate_limit.md) | 重試診斷、容量保護、權衡取捨 |
| Kafka 訊息可靠性 | [訊息傳遞可靠性](./Hard_Assessments/message_delivery_reliability.md) | 可靠性、重複、順序與權衡取捨 |
| 分散式一致性與 Saga | [一致性與 Saga 設計](./Hard_Assessments/distributed_consistency_saga_design.md) | 分割區診斷、補償、系統設計 |
| 可觀測性事故診斷 | [可觀測性事故診斷](./Hard_Assessments/observability_incident_diagnosis.md) | 指標、日誌、追蹤、SLO |
| Kubernetes 發布與容量 | [Kubernetes Production Rollout Incident](./Hard_Assessments/kubernetes_rollout_incident.md) | 發布診斷、Probe、資源與擴縮 |
| Docker 建置與執行期 | [Docker Build & Runtime Incident](./Hard_Assessments/docker_build_runtime_incident.md) | 映像層、建置快取、隔離、安全與資源限制 |
| CI/CD 安全交付 | [Safe Delivery Pipeline Incident](./Hard_Assessments/safe_delivery_pipeline_incident.md) | Pipeline、發布策略、Feature Flag、GitOps 與品質閘門 |
| 雲端架構可靠性 | [Cloud Architecture Reliability Incident](./Hard_Assessments/cloud_architecture_reliability_incident.md) | 服務選型、責任邊界、Serverless、容量與故障恢復 |
| Web／API 安全事故 | [Web Security Breach Incident](./Hard_Assessments/web_security_breach_incident.md) | 身份、JWT、API 防護、CSRF、TLS 與事故回復 |
| 可擴展訂單平台設計審查 | [Extensible Order Platform Design Review](./Hard_Assessments/architecture_pattern_design_review.md) | DI、Strategy、Observer、Proxy、OCP 與變更風險 |
| Java Runtime Concurrency | [Java Runtime Concurrency Incident](./Hard_Assessments/java_runtime_concurrency_incident.md) | Thread Pool、JMM、鎖競爭、GC、Spring IoC 與延遲診斷 |
| Python Async Service | [Python Async Service Incident](./Hard_Assessments/python_async_service_incident.md) | FastAPI、事件循環、GIL、記憶體與依賴生命週期 |
| C# ASP.NET Runtime | [C# ASP.NET Runtime Incident](./Hard_Assessments/csharp_aspnet_runtime_incident.md) | async、Task、鎖、GC、ASP.NET Core DI 與容量診斷 |
| C# Resource Boundary | [C# Resource Boundary Incident](./Hard_Assessments/csharp_resource_boundary_incident.md) | Middleware、DbContext、IDisposable、Connection Pool 與資源生命週期 |
| PHP-FPM Laravel Runtime | [PHP-FPM Laravel Runtime Incident](./Hard_Assessments/php_fpm_laravel_runtime_incident.md) | PHP-FPM、OPcache、GC、Laravel Service Container 與效能診斷 |
| Node.js Event Loop Runtime | [Node.js Event Loop Runtime Incident](./Hard_Assessments/nodejs_event_loop_runtime_incident.md) | Event Loop、非阻塞 I/O、Stream 背壓、Express 錯誤與 V8 記憶體 |
| NestJS Modular API | [NestJS Modular API Incident](./Hard_Assessments/nestjs_modular_api_incident.md) | Module Graph、DI Scope、Provider、Request Lifecycle 與 Exception Filter |
| 限量資源系統設計 | [限量資源容量與一致性設計](./Hard_Assessments/flash_sale_capacity_correctness.md) | 秒殺、分散式鎖、購票與容量 |
| Go Worker Pipeline | [Go Worker Pipeline 診斷](./Hard_Assessments/go_concurrent_worker_diagnosis.md) | 取消、背壓、Channel 與 Goroutine |
| Go Gin Production API | [Gin API Production Incident](./Hard_Assessments/gin_api_production_incident.md) | Middleware Chain、Context Reuse、並發安全、容量與多租戶隔離 |
| 資料結構與執行環境綜合事故 | [Core Runtime & Data Structures Incident](./Hard_Assessments/core_runtime_data_structures_incident.md) | 演算法、OS I/O、Go／C#／Python runtime、容量與正確性 |
| 資料結構與演算法事故 | [Data Structures & Algorithms Incident](./Hard_Assessments/data_structures_algorithm_incident.md) | 演算法選擇、容量、延遲與正確性 |
| 資料庫儲存與一致性 | [Database Storage & Consistency Incident](./Hard_Assessments/database_storage_consistency_incident.md) | SQL、NoSQL、MVCC、複寫、備份、分片與連線池 |
| 儲存／API／訊息／搜尋邊界 | [Backend Storage／API／Messaging／Search Incident](./Hard_Assessments/storage_api_messaging_search_incident.md) | 跨系統一致性、容量、可靠性與 API 合約 |
| API Contract Boundary | [API Contract Boundary Incident](./Hard_Assessments/api_contract_boundary_incident.md) | 版本演化、事件投遞、Webhook 與即時連線 |
| 訊息佇列可靠性 | [訊息佇列可靠性事故](./Hard_Assessments/message_queue_reliability_incident.md) | Kafka、RabbitMQ、NATS、Redis、確認、重試與順序 |
| 網路與作業系統韌性 | [Network + Operating System Resilience Incident](./Hard_Assessments/network_os_resilience_incident.md) | 跨層故障樹、容量推理、協定選擇與復原 |
| 分散式系統設計總檢視 | [大型系統設計綜合檢視](./Hard_Assessments/large_scale_system_design_review.md) | 容量、一致性、即時性、故障診斷與成本 |
| 分散式架構變更邊界 | [Architecture Change Boundary Review](./Hard_Assessments/architecture_change_boundary_review.md) | 設計原則、可測試性、一致性與漸進式演進 |
| DDD／Microservice 交付 | [DDD／Microservice Delivery Incident](./Hard_Assessments/ddd_microservice_delivery_incident.md) | DDD 邊界、事件交付、架構權衡與回滾 |
| Container／Kubernetes 邊界 | [Container Orchestration Boundary Incident](./Hard_Assessments/container_orchestration_boundary_incident.md) | Image Provenance、部署、網路、儲存、安全與容量 |
| Go Runtime Framework | [Go Runtime Framework Incident](./Hard_Assessments/go_runtime_framework_incident.md) | Echo、Middleware、allocation／GC、Profiling 與安全 |
| Java／.NET Toolchain | [Java/.NET Toolchain Quality Incident](./Hard_Assessments/java_dotnet_toolchain_quality_incident.md) | 依賴、測試隔離、build 與可重現發布 |
| Node.js Tooling Fullstack | [Node.js Tooling Fullstack Boundary Incident](./Hard_Assessments/nodejs_tooling_fullstack_boundary_incident.md) | 依賴、Runtime、TypeScript、Express 與 Nuxt |
| PHP Framework Tooling | [PHP Framework Tooling Incident](./Hard_Assessments/php_framework_tooling_incident.md) | 依賴、自動載入、框架生命週期與隊列 |
| PHP Core／Laravel 完整邊界 | [PHP Core／Laravel Completion Incident](./Hard_Assessments/php_core_laravel_completion_incident.md) | 型別、自動載入、請求、資料、安全與資源 |
| Python FastAPI API Boundary | [Python FastAPI API Boundary Incident](./Hard_Assessments/python_fastapi_api_boundary_incident.md) | API 契約、非同步容量、安全與部署 |
| Python Web Frameworks | [Python Web Frameworks Production Incident](./Hard_Assessments/python_web_frameworks_incident.md) | Django／Flask 邊界、容量、安全與選型 |
| Python Testing Quality | [Python Testing Quality Incident](./Hard_Assessments/python_testing_quality_incident.md) | pytest、非同步生命週期、依賴與可重現交付 |
| LLM／Vector Retrieval | [LLM／Vector Retrieval Incident](./Hard_Assessments/llm_vector_retrieval_incident.md) | Provider、LLM API、向量檢索、RAG 評測與安全 |
| AI／Node／Microservice 韌性 | [AI／Node.js／Microservice Resilience Incident](./Hard_Assessments/ai_node_microservice_resilience_incident.md) | Prompt、Runtime、微服務、共識與回滾 |
| 可觀測性與交付訊號 | [可觀測性與交付訊號事故診斷](./Hard_Assessments/observability_delivery_signal_incident.md) | Metrics、Logs、Traces、CI/CD 與供應鏈 |
| Security Testing Quality | [Security Testing Quality Incident](./Hard_Assessments/security_testing_quality_incident.md) | 威脅模型、安全測試、品質事故與回復 |
| AI／Engineering Management Delivery | [AI／Engineering Management Delivery Incident](./Hard_Assessments/ai_management_delivery_incident.md) | 模型品質、MLOps、團隊決策、培養與領導 |
| Frontend State & Rendering | [Frontend State & Rendering Incident](./Hard_Assessments/frontend_state_rendering_incident.md) | React／Vue 狀態、渲染、SSR／CSR、效能與無障礙 |
| Foundations／Storage／Tooling | [Foundations／Storage／Tooling Completion Incident](./Hard_Assessments/foundations_storage_tooling_completion_incident.md) | OS、資料庫、Kafka、Go modules、容量與可重現交付 |
| Language／Tooling／Framework | [Language／Tooling／Framework Completion Incident](./Hard_Assessments/language_tooling_framework_completion_incident.md) | Runtime、依賴、框架安全、benchmark 與回滾 |
| Architecture／Delivery／Quality | [Architecture／Delivery／Quality Completion Incident](./Hard_Assessments/architecture_delivery_quality_completion_incident.md) | Gossip、DDD、交付治理、招聘與測試品質 |

目前共有 52 份 Hard Assessment；553 篇主題文章均已完成至少一份硬測驗映射，完整清單請見 [Hard Assessments 索引](./Hard_Assessments/README.md)。

---

## 📂 考題索引

目前已有 28 份分類 Quiz；語言、基礎設施、AI／Testing／Management 與 Frontend 的新增分類也已納入同一套 Concept／LO 對應規則。

### 01. 電腦科學基礎
| 主題 | 題數 | 說明 |
|------|------|------|
| [資料結構與演算法](./01_Data_Structures_and_Algorithms.md) | 37 | B+樹、雜湊表、堆、排序、DP |
| [作業系統](./01_Operating_System.md) | 19 | 進程/線程、IPC、I/O模型、同步、中斷與信號 |
| [網路](./01_Networking.md) | 18 | TCP/IP、HTTP、DNS、WebSocket |

### 02. 後端開發
| 主題 | 題數 | 說明 |
|------|------|------|
| [API 設計](./02_API_Design.md) | 13 | REST、版本管理、冪等性、認證 |
| [快取](./02_Caching.md) | 7 | 策略、穿透/擊穿/雪崩、一致性 |
| [資料庫](./02_Databases.md) | 55 | SQL/NoSQL、索引、事務、分片、儲存與 schema |
| [訊息佇列](./02_Message_Queues.md) | 26 | Kafka、RabbitMQ、可靠性、冪等、儲存與 metadata |
| [Elasticsearch](./04_Elasticsearch.md) | 12 | Query DSL、分片、聚合、效能優化 |
| [AI 與機器學習](./02_AI_and_Machine_Learning.md) | 19 | LLM、RAG、向量資料庫、系統設計 |

### 03. 系統設計與架構
| 主題 | 題數 | 說明 |
|------|------|------|
| [分散式系統與微服務](./03_Distributed_Systems_and_Microservices.md) | 18 | CAP、一致性、Raft、微服務模式、gossip |
| [大型系統設計](./12_System_Design.md) | 22 | 秒殺、分散式鎖、購票、容量與一致性 |
| [架構模式與設計原則](./17_Architecture_Patterns.md) | 28 | DI、Strategy、Observer、Proxy、SOLID OCP、DDD 邊界 |

### 04. 基礎設施與 DevOps
| 主題 | 題數 | 說明 |
|------|------|------|
| [可觀測性](./10_Observability.md) | 22 | Metrics、Logs、Traces、SLO |
| [Kubernetes](./11_Kubernetes.md) | 16 | Rolling Update、Probe、資源、HPA、Workload、Service Data Plane、DNS |
| [Docker](./13_Docker.md) | 10 | Container、Dockerfile、映像層、安全、資源限制 |
| [CI/CD](./14_CI_CD.md) | 7 | Pipeline、部署策略、Feature Flag、GitHub Actions、GitOps |
| [Cloud Computing](./15_Cloud_Computing.md) | 4 | AWS 服務、雲原生、責任邊界、Serverless |

### 05. 程式語言
| 主題 | 題數 | 說明 |
|------|------|------|
| [Go](./06_Go.md) | 20 | Goroutine、Channel、GC、Gin、Modules |
| [Java](./18_Java.md) | 12 | JVM、JMM、Thread Pool、GC、Spring IoC |
| [Python](./05_Python.md) | 75 | GIL、裝飾器、生成器、asyncio、FastAPI、Metaclass 與測試 |
| [C#](./08_CSharp.md) | 19 | async/await、GC、LINQ、ASP.NET Core |
| [PHP](./09_PHP.md) | 32 | PHP 8+、Laravel、安全、OPcache、include／require |
| [Node.js](./07_Node.js.md) | 35 | Event Loop、非阻塞 I/O、Stream、Express、NestJS、TypeScript、Runtime 與 tooling |

### 06. 特定領域
| 主題 | 題數 | 說明 |
|------|------|------|
| [Web／API 安全](./16_Security.md) | 10 | 身份、JWT、API 防護、CSRF、TLS |
| [Testing](./19_Testing.md) | 12 | 測試分層、契約、效能、ATDD、E2E 與 mutation |
| [AI Engineering](./20_AI_Engineering.md) | 4 | MLOps、LLMOps、RAG 與評測 |
| [Engineering Management](./21_Engineering_Management.md) | 7 | 領導、協作、招募、培養、交付與事故學習 |
| [Frontend Development](./22_Frontend_Development.md) | 10 | React／Vue 狀態、渲染、生命週期與路由 |

---

## 🎯 學習建議

### 面試準備優先順序

**第一優先 (必備)**：
- 資料結構與演算法
- 資料庫
- API 設計
- 快取

**第二優先 (重要)**：
- 系統設計案例
- 分散式系統
- 訊息佇列
- 主要程式語言

**第三優先 (加分)**：
- 微服務
- DevOps
- AI 與機器學習

### 自測技巧

1. **模擬面試情境** - 給自己 3-5 分鐘回答每題
2. **口頭表達** - 練習說出來，而不只是在心裡想
3. **畫圖輔助** - 複雜概念試著畫出架構圖
4. **追問自己** - 想像面試官會問什麼 follow-up

---

## 📊 總體進度追蹤

| 分類 | 完成狀態 |
|------|----------|
| 電腦科學基礎 | ✅（全部文章已接入） |
| 後端開發 | ✅（全部文章已接入） |
| 系統設計與架構 | ✅（全部文章已接入） |
| 基礎設施與 DevOps | ✅（全部文章已接入） |
| 程式語言 | ✅（全部文章已接入） |
| 特定領域／前端 | ✅（全部文章已接入） |

---

> 💡 **提示**：建議每天花 30-60 分鐘做自我測驗，持續 2-4 週，效果最佳。
