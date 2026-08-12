# 📝 重點考題 (Quiz)

> 這個資料夾收集了各主題中**重要程度 4-5** 的核心題目，設計成自我測驗的形式，幫助您快速檢驗學習成效。

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

目前包含四題跨領域試點、四題核心後端批次與十六題 Phase 3 延伸批次；不代表所有文章都已完成硬測驗映射。

---

## 📂 考題索引

目前主要分類均已有分類 Quiz；Java、C# resource boundary、Node.js runtime、NestJS 與 Go Gin framework 已先完成第一批，其餘語言框架仍依 Phase 3 排程補齊。

### 01. 電腦科學基礎
| 主題 | 題數 | 說明 |
|------|------|------|
| [資料結構與演算法](./01_Data_Structures_and_Algorithms.md) | 12 | B+樹、雜湊表、堆、排序、DP |
| [作業系統](./01_Operating_System.md) | 8 | 進程/線程、IPC、I/O模型、同步 |
| [網路](./01_Networking.md) | 1 | TCP/IP、HTTP、DNS、WebSocket |

### 02. 後端開發
| 主題 | 題數 | 說明 |
|------|------|------|
| [API 設計](./02_API_Design.md) | 7 | REST、版本管理、冪等性、認證 |
| [快取](./02_Caching.md) | 7 | 策略、穿透/擊穿/雪崩、一致性 |
| [資料庫](./02_Databases.md) | 9 | SQL/NoSQL、索引、事務、分片 |
| [訊息佇列](./02_Message_Queues.md) | 10 | Kafka、RabbitMQ、可靠性、冪等 |
| [Elasticsearch](./04_Elasticsearch.md) | 12 | Query DSL、分片、聚合、效能優化 |
| [AI 與機器學習](./02_AI_and_Machine_Learning.md) | 10 | LLM、RAG、向量資料庫、系統設計 |

### 03. 系統設計與架構
| 主題 | 題數 | 說明 |
|------|------|------|
| [分散式系統與微服務](./03_Distributed_Systems_and_Microservices.md) | 8 | CAP、一致性、Raft、微服務模式 |
| [大型系統設計](./12_System_Design.md) | 5 | 秒殺、分散式鎖、購票、容量與一致性 |
| [架構模式與設計原則](./17_Architecture_Patterns.md) | 5 | DI、Strategy、Observer、Proxy、SOLID OCP |

### 04. 基礎設施與 DevOps
| 主題 | 題數 | 說明 |
|------|------|------|
| [可觀測性](./10_Observability.md) | 5 | Metrics、Logs、Traces、SLO |
| [Kubernetes](./11_Kubernetes.md) | 5 | Rolling Update、Probe、資源、HPA、Workload |
| [Docker](./13_Docker.md) | 5 | Container、Dockerfile、映像層、安全、資源限制 |
| [CI/CD](./14_CI_CD.md) | 5 | Pipeline、部署策略、Feature Flag、GitHub Actions、GitOps |
| [Cloud Computing](./15_Cloud_Computing.md) | 4 | AWS 服務、雲原生、責任邊界、Serverless |

### 05. 程式語言
| 主題 | 題數 | 說明 |
|------|------|------|
| [Go](./06_Go.md) | 14 | Goroutine、Channel、GC、Gin |
| [Java](./18_Java.md) | 5 | JVM、JMM、Thread Pool、GC、Spring IoC |
| [Python](./05_Python.md) | 14 | GIL、裝飾器、生成器、asyncio、FastAPI |
| [C#](./08_CSharp.md) | 17 | async/await、GC、LINQ、ASP.NET Core |
| [PHP](./09_PHP.md) | 18 | PHP 8+、Laravel、安全、OPcache |
| [Node.js](./07_Node.js.md) | 17 | Event Loop、非阻塞 I/O、Stream、Express、NestJS、TypeScript、V8 |

### 06. 特定領域
| 主題 | 題數 | 說明 |
|------|------|------|
| [Web／API 安全](./16_Security.md) | 5 | 身份、JWT、API 防護、CSRF、TLS |

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
| 電腦科學基礎 | ⬜ |
| 後端開發 | ⬜ |
| 系統設計與架構 | ⬜ |
| 基礎設施與 DevOps | ⬜ |
| 程式語言 | ⬜ |

---

> 💡 **提示**：建議每天花 30-60 分鐘做自我測驗，持續 2-4 週，效果最佳。
