# 可觀測性 (Observability) - 重點考題 (Quick Quiz)

> 這份考題從可觀測性與 SRE 文章中挑選出**重要程度 4-5** 的核心題目，設計成快速複習與口頭自測。
>
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整文章。

---

## 🔭 可觀測性核心概念

<a id="q1"></a>
### Q1: Monitoring 與 Observability 有什麼區別？為什麼微服務更需要 Observability？
<!-- Concept ID: concept.observability.monitoring.observability-vs-monitoring; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐ (4) | **重要性**: 🔴 必考

請說明兩者各自回答的問題、適用的資料來源，以及在多服務 checkout 故障中如何互補。

<details>
<summary>💡 答案提示</summary>

- **Monitoring** 依預先定義的指標、儀表板與閾值回答已知問題，通常先告訴你「哪裡壞了」或「使用者是否受影響」。
- **Observability** 是透過 Metrics、Logs、Traces 等外部輸出推斷系統內部狀態的能力，讓團隊能探索未預期的故障模式並追問「為什麼」。
- Metrics 適合看聚合趨勢與症狀，Traces 適合重建跨服務路徑，Logs 適合查看特定事件；三者應以 `trace_id`、服務與版本等欄位互相關聯。
- 微服務具有動態部署、複雜依賴與故障傳播，單看入口服務或 CPU 通常無法定位下游根因。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/observability_vs_monitoring.md)

---

<a id="q2"></a>
### Q2: 如何用 RED、USE 與 Four Golden Signals 設計一組可操作的指標？
<!-- Concept ID: concept.observability.metrics.red-use-golden-signals; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請以請求驅動的 checkout 服務為例，說明如何同時觀察服務症狀、基礎設施瓶頸與告警品質。

<details>
<summary>💡 答案提示</summary>

- **RED** 用於請求驅動服務：Rate、Errors、Duration；延遲應觀察分佈與 P50/P95/P99，並區分成功與失敗請求。
- **USE** 用於資源：Utilization、Saturation、Errors；除了 CPU／記憶體，也要看資料庫連線池、佇列與磁碟等受限資源。
- **Four Golden Signals** 是 Latency、Traffic、Errors、Saturation，可作為跨服務的通用摘要；RED 與 USE 是更具體的切入方式。
- 指標使用 seconds、bytes 等基本單位，標籤維持低基數，避免 `user_id`、Email 或未聚合的 URL；告警應以使用者症狀為主且能驅動行動。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/effective_metrics_design.md)

---

<a id="q3"></a>
### Q3: 分散式追蹤中的 Trace、Span 與 Context Propagation 如何協同工作？
<!-- Concept ID: concept.observability.tracing.context-propagation; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

一個 checkout 請求依序呼叫 pricing、inventory 與 payment。請說明如何建立追蹤鏈，並處理某個下游服務沒有 trace 的情況。

<details>
<summary>💡 答案提示</summary>

- **Trace** 代表完整請求，**Span** 代表其中一個工作單元；Parent Span、開始／結束時間與 attributes 共同形成可分析的時間線。
- 呼叫邊界要使用 W3C `traceparent` 或 B3 將 Trace ID／Span ID 注入 HTTP Header 或 gRPC Metadata，接收端再建立 child span。
- 應用 Logs 中帶入 `trace_id`，就能從瀑布圖跳到事件詳情；若鏈路中斷，先檢查 context 是否在 middleware、client 或訊息 metadata 邊界遺失。
- Head Sampling 成本低但可能漏掉慢與錯誤請求；Tail Sampling 能保留異常現場，但需要暫存與更高資源。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/distributed_tracing_basics.md)

---

<a id="q4"></a>
### Q4: 如何設計可擴展的集中式 Logging 架構？
<!-- Concept ID: concept.observability.logging.centralized-architecture; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請從採集、傳輸、緩衝、解析、儲存與分析說明架構，並比較 ELK、EFK 或 PLG 的取捨。

<details>
<summary>💡 答案提示</summary>

- 基本管線是 **Shipper → Buffer／Message Queue → Parser／Indexer → Storage → Visualization**；緩衝層用來吸收突發流量與隔離儲存故障。
- 應用輸出 JSON 結構化日誌，至少包含 timestamp、level、event、service、version、request／order identifier 與 `trace_id`，並在收集或索引前脫敏。
- ELK 功能完整但 Logstash 資源成本較高；EFK 較常見於 Kubernetes；PLG／Loki 以 labels 控制索引與成本，但全文搜尋能力不同。
- 要設計背壓、重試、保留期限與 DEBUG 動態採樣，並監控 shipper backlog、buffer lag 與 index delay，避免把「查不到」誤判成「沒有事件」。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/centralized_logging_architecture.md)

---

<a id="q5"></a>
### Q5: SLI、SLO、SLA 與 Error Budget 如何影響發布決策？
<!-- Concept ID: concept.observability.slo.error-budget; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明四者的關係，並回答「HTTP 200 維持正常，但 checkout 的資料正確性下降」時是否仍能繼續發布。

<details>
<summary>💡 答案提示</summary>

- **SLI** 是以 Good Events／Total Events 表示的事實；**SLO** 是內部目標；**SLA** 是對客戶的合約承諾與未達成後果。
- Error Budget 約為 `100% - SLO`。例如 99.9% SLO 留有 0.1% 失敗預算；短期燃燒率要與長期窗口一起看。
- 資料正確性是使用者可感知的 SLI，不能只用 HTTP status 判定成功；正確性預算耗盡時應停止擴大發布、回滾或先修復資料與流程。
- SLO 通常比 SLA 嚴格，發布決策應依內部 SLO／error budget 與核心路徑風險，不應為了放行而臨時調低目標。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/sli_slo_sla.md)
