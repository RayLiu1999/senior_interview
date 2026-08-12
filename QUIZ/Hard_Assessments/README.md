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
| PHP-FPM Laravel Runtime | [PHP-FPM Laravel Runtime Incident](./php_fpm_laravel_runtime_incident.md) | 9 | PHP-FPM、OPcache、GC、Laravel Service Container 與效能診斷 |
| Node.js Event Loop Runtime | [Node.js Event Loop Runtime Incident](./nodejs_event_loop_runtime_incident.md) | 9 | Event Loop、非阻塞 I/O、Stream 背壓、Express 錯誤與 V8 記憶體 |
| NestJS Modular API | [NestJS Modular API Incident](./nestjs_modular_api_incident.md) | 9 | Module Graph、DI Scope、Provider、Request Lifecycle 與 Exception Filter |
| 限量資源系統設計 | [限量資源容量與一致性設計](./flash_sale_capacity_correctness.md) | 9 | 秒殺、分散式鎖、購票與容量 |
| Go Worker Pipeline | [Go Worker Pipeline 診斷](./go_concurrent_worker_diagnosis.md) | 9 | 取消、背壓、Channel 與 Goroutine |

## 使用方式

1. 先閱讀對應文章，確認自己理解列出的學習目標。
2. 遮住「參考答案與詳解」，在建議時間內完成題目。
3. 依「期待證據」與評分規準自評，記錄失分點。
4. 回到文章補強缺口，再回答延伸追問。

硬測驗目前已涵蓋四題跨領域試點、四題核心後端批次與十四題 Phase 3 延伸批次；後續會依同一規格擴展到其他語言與框架。
