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

<a id="q6"></a>
### Q6: Metrics、Logs、Traces 三大可觀測性訊號如何互相配合？
<!-- Concept ID: concept.observability.pillars.metrics-logs-traces; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請以一次 API 延遲上升事故為例，說明三種訊號各自回答什麼問題，以及如何用共同欄位把它們串起來。

<details>
<summary>💡 答案提示</summary>

- Metrics 用來確認影響範圍、趨勢與 SLO；Logs 保留離散事件和業務上下文；Traces 重建單一請求跨服務的時間線。
- 以 service、version、route、時間窗口、`trace_id`／request identifier 關聯，先用 Metrics 定位，再從 Trace 找 critical path，最後用 Logs 驗證事件與狀態轉移。
- 高基數欄位不應直接放進 Metrics；敏感資料要脫敏，Trace 與 Logs 也要設定採樣和保留政策。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/observability_three_pillars.md)

<a id="q7"></a>
### Q7: Prometheus 的資料模型與 Pull Model 有哪些核心取捨？
<!-- Concept ID: concept.observability.metrics.prometheus-fundamentals; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請說明 metric、label、sample、counter、gauge、histogram 的關係，並解釋 Prometheus 主動抓取指標的優點與限制。

<details>
<summary>💡 答案提示</summary>

- 每條時間序列由 metric name 與 label set 識別；counter 適合只增不減的事件，gauge 適合可上下變動的值，histogram 描述分佈。
- Pull 讓 Prometheus 控制抓取週期並能檢查 target health；限制是短命 job、網路隔離與高可用抓取需要額外設計。
- Label 必須維持低基數，避免把 user ID、完整 URL 或 request ID 直接作為 label，並以 recording rule 降低重複查詢成本。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/Prometheus/what_is_prometheus.md)

<a id="q8"></a>
### Q8: Prometheus 架構如何處理抓取、儲存、告警與高可用？
<!-- Concept ID: concept.observability.metrics.prometheus-architecture; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請從 Service Discovery、Scrape、TSDB、Rule、Alertmanager 與 Remote Write 說明資料流，並指出 HA 方案的重點。

<details>
<summary>💡 答案提示</summary>

- Prometheus 透過 service discovery 找到 targets，週期性 scrape，寫入本地 TSDB，再由 recording／alerting rules 計算，將告警送到 Alertmanager。
- Exporter 把應用或基礎設施狀態轉成 metrics；Remote Write、聯邦或 Thanos／Mimir 類方案可延伸保存與查詢，但增加網路與一致性邊界。
- HA 不只是跑兩個 Server；要處理 duplicate samples、同一規則重複告警、資料遺失、remote-write backlog 與告警路由去重。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/Prometheus/prometheus_architecture.md)

<a id="q9"></a>
### Q9: PromQL 中 rate、聚合與 histogram_quantile 如何避免誤判？
<!-- Concept ID: concept.observability.metrics.promql-basics; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請設計一個查詢來觀察服務錯誤率與整體 P99 延遲，並說明時間窗口、label 聚合和缺失資料的處理方式。

<details>
<summary>💡 答案提示</summary>

- Counter 應使用 `rate` 或 `increase`，先按必要維度保留，再聚合 good／total；不要直接對 counter 的瞬時值下告警。
- Histogram 要先對 `_bucket` 做 `sum by (le, ...)` 再使用 `histogram_quantile`；聚合維度必須與問題一致。
- `irate` 適合看短期突變但較容易抖動；要檢查 scrape gap、`absent`、時間窗口與高基數，避免「沒有資料」被當成「零」。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/Prometheus/promql_basics.md)

<a id="q10"></a>
### Q10: Histogram 與 Summary 的 P99 為什麼不能用同一種方式聚合？
<!-- Concept ID: concept.observability.metrics.histogram-summary; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較兩者的計算位置、可聚合性、誤差與適用場景，並說明為什麼不能平均多個 instance 的 Summary P99。

<details>
<summary>💡 答案提示</summary>

- Histogram 在 client 記錄 bucket，Prometheus 端依 bucket count 估算 quantile，適合跨 instance 聚合。
- Summary 在 client 端計算 quantile，保留的是局部統計結果；不同 instance 的 P99 不能直接平均成全服務 P99。
- 需要服務層 SLO／P99 時通常選 Histogram 並依延遲分佈設計 bucket；只關心單一 instance 且需要 client-side quantile 時才考慮 Summary。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/Prometheus/histogram_vs_summary.md)

<a id="q11"></a>
### Q11: ELK Stack 如何把應用日誌變成可搜尋、可關聯的訊號？
<!-- Concept ID: concept.observability.logging.elk-stack; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請說明 Elasticsearch、Logstash、Kibana 與 Beats 的責任，並指出日誌管線發生延遲時應先看哪些邊界。

<details>
<summary>💡 答案提示</summary>

- Beats／shipper 負責採集，Logstash 解析與轉換，Elasticsearch 儲存與搜尋，Kibana 查詢和視覺化；中間可加入 buffer 隔離突發流量。
- 要區分應用沒有產生日誌、shipper backlog、解析失敗、索引延遲與 Kibana 查詢問題；「現在搜不到」不等於「事件不存在」。
- 結構化欄位至少應能對應 service、version、event time、severity、request／trace identifier，並在管線中脫敏。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/elk_stack_overview.md)

<a id="q12"></a>
### Q12: Logstash、Fluentd 與 Fluent Bit 應如何選擇？
<!-- Concept ID: concept.observability.logging.collector-choice; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請依節點資源、解析複雜度、背壓、可靠性與 Kubernetes 部署方式比較三者。

<details>
<summary>💡 答案提示</summary>

- Logstash 插件和轉換能力強但 JVM／資源成本較高；Fluentd 生態完整；Fluent Bit 輕量，常作為 node-level agent，再送到集中 aggregator。
- 不能只比較吞吐；要看 buffer 類型、重試、丟棄策略、下游恢復後的 replay、metadata enrichment 與 trace 欄位是否保留。
- 以資料遺失、CPU／記憶體、queue depth、send latency 和 downstream error 做壓測與選型，而不是以單一 benchmark 結論決定。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/ELK/logstash_vs_fluentd.md)

<a id="q13"></a>
### Q13: Elasticsearch 日誌索引如何在吞吐、查詢與保留成本間取得平衡？
<!-- Concept ID: concept.observability.logging.elasticsearch-indexing; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請說明 ILM、Rollover、Shard／Replica、Refresh、Bulk 與 Mapping 的設計考量，並提出寫入瓶頸時的排查順序。

<details>
<summary>💡 答案提示</summary>

- 以時間與大小做 rollover，Hot／Warm／Cold／Delete 分層；Shard 大小、數量和 replica 要依寫入、查詢並行、恢復時間與節點容量校準。
- Bulk、較長 refresh interval、正確 mapping 可提升吞吐，但會增加可見性延遲或限制查詢能力；不能把 `force_merge` 當成通用緊急修復。
- 先看 ingest／indexing latency、bulk rejection、段數、heap、磁碟、shard skew、recovery 和 search latency，再決定限流、擴容或調整 retention。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/ELK/elasticsearch_indexing_strategy.md)

<a id="q14"></a>
### Q14: Grafana 的 Dashboard、Panel、Data Source 與變數如何協作？
<!-- Concept ID: concept.observability.grafana.visualization; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐ (4) | **重要性**: 🔴 必考

請說明 Grafana 如何連接多種資料源，並指出一個面板要具備哪些資訊才適合 On-Call 使用。

<details>
<summary>💡 答案提示</summary>

- Dashboard 組織 Panel，Panel 透過 Data Source 查詢；變數讓使用者按環境、服務、版本或區域切片，但不能無限制引入高基數值。
- 面板要有清楚單位、時間範圍、成功／失敗定義、P50／P95／P99 或分佈，並能連到 Logs、Traces、部署與 runbook。
- Grafana 的可視化正常不代表資料正確；要檢查 query、scrape gap、時間區間、聚合與權限造成的空白。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/Grafana/what_is_grafana.md)

<a id="q15"></a>
### Q15: 如何設計一個事故期間仍然可讀、可操作的 Grafana Dashboard？
<!-- Concept ID: concept.observability.grafana.dashboard-design; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請以 checkout API 為例，安排從使用者症狀到基礎設施與下游依賴的面板順序，並說明哪些圖表容易誤導。

<details>
<summary>💡 答案提示</summary>

- 第一層放 traffic、error、latency、saturation 與 SLO；第二層按版本／區域／路由拆分；第三層連到 trace、log、部署事件和資源細節。
- 使用 rate、分位數與 histogram，而不是只看平均值；比較 canary／baseline、同一時間窗和同一服務邊界。
- 低基數維度應預先治理，圖表要標明資料延遲、取樣與空值語意，避免把 dashboard query 的缺口當成服務恢復。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/Grafana/grafana_dashboard_design.md)

<a id="q16"></a>
### Q16: Grafana Alerting 與 Prometheus Alertmanager 如何分工？
<!-- Concept ID: concept.observability.grafana.alerting; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請比較兩者的規則、資料源、路由、去重與治理方式，並說明 Pending、Firing、Resolved 如何影響通知。

<details>
<summary>💡 答案提示</summary>

- Grafana Alerting 可跨多資料源；Prometheus Alertmanager 深入 Prometheus rule、label routing、grouping、inhibition 與 silence。
- Rule 定義觸發條件，Contact Point 定義接收者，Notification Policy 決定路由；Pending／For 可抑制瞬時抖動，Resolved 讓值班者知道事件結束。
- 要以 Git／API 管理、審計變更、測試通知與設定 fallback；不要只在儀表板畫出紅線就假設有人會收到告警。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/Grafana/grafana_alerting.md)

<a id="q17"></a>
### Q17: 分散式追蹤如何重建跨服務請求的 critical path？
<!-- Concept ID: concept.observability.tracing.distributed-tracing; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請說明 Trace、Span、Context Propagation 與 Logs 關聯，並處理同步 RPC、非同步訊息或資料庫邊界的追蹤缺口。

<details>
<summary>💡 答案提示</summary>

- Root span 代表入口請求，child span 代表下游工作；以 W3C `traceparent` 或等價 metadata 傳遞 context，並保留 service、version、error 和 duration。
- 先從 waterfall 找真正佔用 critical path 的 span，再用 `trace_id` 查結構化 Logs；非同步邊界要把 trace context 放入 message metadata，而不是只依賴執行緒 local context。
- Trace 不存在可能是 head sampling、client／middleware instrumentation、propagation 或 backend 丟棄，不可直接推論服務沒有執行。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/Jaeger/what_is_distributed_tracing.md)

<a id="q18"></a>
### Q18: Jaeger 的 Client、Agent、Collector、Query 與 Storage 如何形成追蹤管線？
<!-- Concept ID: concept.observability.tracing.jaeger-architecture; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請從產生 Span 到查詢 Trace 說明 Jaeger 架構，並指出 Collector 或 Storage 背壓時的風險。

<details>
<summary>💡 答案提示</summary>

- SDK／Client 建立 Span，Agent 或 Collector 接收與批次處理，Storage 保存，Query 對外提供查詢；Queue／Kafka 可隔離突發流量但引入 lag 和 replay 邊界。
- 要觀察 Span accepted／dropped、queue depth、Collector CPU／memory、Storage write latency、error、retention 與 query latency。
- 追蹤管線本身也需高可用與限流；不能在 Storage 已飽和時盲目提高 sampling，造成觀測平面反過來拖垮服務。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/Jaeger/jaeger_architecture.md)

<a id="q19"></a>
### Q19: 生產環境應如何設計 Jaeger 的採樣策略？
<!-- Concept ID: concept.observability.tracing.sampling-strategies; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較 head-based 與 tail-based sampling，並為正常流量、錯誤、慢請求與核心交易設計保留規則。

<details>
<summary>💡 答案提示</summary>

- Head sampling 在入口快速決策、成本低但可能漏掉異常；Tail sampling 要暫存完整 Trace，能按 error／latency／特徵保留但成本和架構複雜度較高。
- 正常流量可用 remote probabilistic／rate limit；錯誤、慢請求、核心交易與特定版本應使用 targeted tail sampling 或提高局部保留率。
- 監控 trace coverage、sampling decision、Collector buffer、storage cost 和 PII；sampling rate 不能脫離流量、保留期與查詢用途決定。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/Jaeger/sampling_strategies.md)

<a id="q20"></a>
### Q20: 事故發生後，IC、Ops、Comms、Scribe 應如何協作？
<!-- Concept ID: concept.observability.incident.management-process; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請設計從 Detection 到 Mitigation、Resolution 的事故流程，並說明為什麼事故中先恢復服務而不是先找根因。

<details>
<summary>💡 答案提示</summary>

- IC 統一決策與優先級，Ops 執行變更，Comms 管理對內外溝通，Scribe 記錄時間線、證據與決策；必要時補上 subject-matter lead。
- 先確認使用者影響、分級、凍結危險變更，再用回滾、降級、流量隔離或熔斷止損；根因分析留到服務穩定後。
- Resolution 要有可量化恢復門檻和觀察窗，並保留 audit、metric、log、trace、部署與溝通證據。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/On_Call/incident_management_process.md)

<a id="q21"></a>
### Q21: 如何把一次事故轉成真正可追蹤的 Blameless Post-mortem？
<!-- Concept ID: concept.observability.incident.postmortem-culture; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請說明復盤報告應包含哪些證據與行動項目，以及如何避免「檢討某個人」而沒有改善系統。

<details>
<summary>💡 答案提示</summary>

- 報告應包含影響、時間線、偵測、止損、恢復、系統與組織 contributing factors，以及哪些防線沒有發揮作用。
- 行動項目要有 owner、期限、優先級、驗收條件和追蹤位置；例如新增 SLO、告警、測試、runbook 或 rollout gate，而不是抽象地寫「提高注意」。
- Blameless 不等於不追究責任，而是把焦點放在當時可用資訊、系統誘因、權限和流程，並用回歸測試驗證改進。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/On_Call/post_mortem_culture.md)

<a id="q22"></a>
### Q22: 如何設計不造成告警疲勞、又能守住 SLO 的告警策略？
<!-- Concept ID: concept.observability.alerting.strategy; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請從症狀告警、時間窗口、分級、分組、抑制、升級與 error-budget burn 說明一套可操作的策略。

<details>
<summary>💡 答案提示</summary>

- 以使用者症狀和 SLO／錯誤預算為主，對 availability、latency、correctness 或 saturation 設定明確 good／bad event 和時間窗口。
- Critical 要能驅動立即行動並附 runbook；Warning 可供白天處理。用 grouping、deduplication、inhibition、silence 和 escalation 避免同一根因造成通知風暴。
- 以 alert volume、false positive、MTTA、MTTR、ack rate 和 burn-rate 告警命中率回顧品質；低流量或資料缺口要有 no-data 策略。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Observability/alerting_strategy.md)
