# 可觀測性與交付訊號事故診斷：從 Metrics／Logs／Traces 到 CI Workflow

- **Assessment ID**: `assessment.observability.delivery-signal.incident.v1`
- **主要 Concept ID**: `concept.observability.pillars.metrics-logs-traces`
- **次要 Concept IDs**:
  - `concept.observability.metrics.prometheus-fundamentals`
  - `concept.observability.metrics.prometheus-architecture`
  - `concept.observability.metrics.promql-basics`
  - `concept.observability.metrics.histogram-summary`
  - `concept.observability.logging.elk-stack`
  - `concept.observability.logging.collector-choice`
  - `concept.observability.logging.elasticsearch-indexing`
  - `concept.observability.grafana.visualization`
  - `concept.observability.grafana.dashboard-design`
  - `concept.observability.grafana.alerting`
  - `concept.observability.tracing.distributed-tracing`
  - `concept.observability.tracing.jaeger-architecture`
  - `concept.observability.tracing.sampling-strategies`
  - `concept.observability.incident.management-process`
  - `concept.observability.incident.postmortem-culture`
  - `concept.observability.alerting.strategy`
  - `concept.cicd.aws.workflow-delivery`
  - `concept.cicd.jenkins.pipeline-automation`
- **對應文章**:
  - [可觀測性三大支柱](../../04_Infrastructure_and_DevOps/Observability/observability_three_pillars.md)
  - [什麼是 Prometheus](../../04_Infrastructure_and_DevOps/Observability/Prometheus/what_is_prometheus.md)
  - [Prometheus 架構](../../04_Infrastructure_and_DevOps/Observability/Prometheus/prometheus_architecture.md)
  - [PromQL 基礎](../../04_Infrastructure_and_DevOps/Observability/Prometheus/promql_basics.md)
  - [Histogram 與 Summary](../../04_Infrastructure_and_DevOps/Observability/Prometheus/histogram_vs_summary.md)
  - [ELK Stack 概述](../../04_Infrastructure_and_DevOps/Observability/elk_stack_overview.md)
  - [Logstash vs Fluentd](../../04_Infrastructure_and_DevOps/Observability/ELK/logstash_vs_fluentd.md)
  - [Elasticsearch 索引策略](../../04_Infrastructure_and_DevOps/Observability/ELK/elasticsearch_indexing_strategy.md)
  - [什麼是 Grafana](../../04_Infrastructure_and_DevOps/Observability/Grafana/what_is_grafana.md)
  - [Grafana Dashboard 設計](../../04_Infrastructure_and_DevOps/Observability/Grafana/grafana_dashboard_design.md)
  - [Grafana Alerting](../../04_Infrastructure_and_DevOps/Observability/Grafana/grafana_alerting.md)
  - [什麼是分散式追蹤](../../04_Infrastructure_and_DevOps/Observability/Jaeger/what_is_distributed_tracing.md)
  - [Jaeger 架構](../../04_Infrastructure_and_DevOps/Observability/Jaeger/jaeger_architecture.md)
  - [Sampling Strategies](../../04_Infrastructure_and_DevOps/Observability/Jaeger/sampling_strategies.md)
  - [事故管理流程](../../04_Infrastructure_and_DevOps/Observability/On_Call/incident_management_process.md)
  - [Post-mortem Culture](../../04_Infrastructure_and_DevOps/Observability/On_Call/post_mortem_culture.md)
  - [告警策略設計最佳實踐](../../04_Infrastructure_and_DevOps/Observability/alerting_strategy.md)
  - [AWS CI/CD 部署流程](../../04_Infrastructure_and_DevOps/CI_CD/Original_CI-CD/aws_cicd_workflow.md)
  - [Jenkins 與 CI/CD](../../04_Infrastructure_and_DevOps/CI_CD/Original_CI-CD/jenkins_with_ci_cd.md)
- **題型**: `故障診斷`, `可觀測性設計`, `發布治理`, `事故回應`, `供應鏈追溯`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 40 分鐘
- **標籤**: `Observability`, `Prometheus`, `PromQL`, `ELK`, `Grafana`, `Jaeger`, `Alerting`, `SLO`, `CI/CD`, `Jenkins`, `Rollback`
- **Learning Objective IDs**:
  - `concept.observability.pillars.metrics-logs-traces/LO-1`
  - `concept.observability.pillars.metrics-logs-traces/LO-2`
  - `concept.observability.pillars.metrics-logs-traces/LO-3`
  - `concept.observability.metrics.prometheus-fundamentals/LO-1`
  - `concept.observability.metrics.prometheus-fundamentals/LO-2`
  - `concept.observability.metrics.prometheus-fundamentals/LO-3`
  - `concept.observability.metrics.prometheus-architecture/LO-1`
  - `concept.observability.metrics.prometheus-architecture/LO-2`
  - `concept.observability.metrics.prometheus-architecture/LO-3`
  - `concept.observability.metrics.promql-basics/LO-1`
  - `concept.observability.metrics.promql-basics/LO-2`
  - `concept.observability.metrics.promql-basics/LO-3`
  - `concept.observability.metrics.histogram-summary/LO-1`
  - `concept.observability.metrics.histogram-summary/LO-2`
  - `concept.observability.metrics.histogram-summary/LO-3`
  - `concept.observability.logging.elk-stack/LO-1`
  - `concept.observability.logging.elk-stack/LO-2`
  - `concept.observability.logging.elk-stack/LO-3`
  - `concept.observability.logging.collector-choice/LO-1`
  - `concept.observability.logging.collector-choice/LO-2`
  - `concept.observability.logging.collector-choice/LO-3`
  - `concept.observability.logging.elasticsearch-indexing/LO-1`
  - `concept.observability.logging.elasticsearch-indexing/LO-2`
  - `concept.observability.logging.elasticsearch-indexing/LO-3`
  - `concept.observability.grafana.visualization/LO-1`
  - `concept.observability.grafana.visualization/LO-2`
  - `concept.observability.grafana.visualization/LO-3`
  - `concept.observability.grafana.dashboard-design/LO-1`
  - `concept.observability.grafana.dashboard-design/LO-2`
  - `concept.observability.grafana.dashboard-design/LO-3`
  - `concept.observability.grafana.alerting/LO-1`
  - `concept.observability.grafana.alerting/LO-2`
  - `concept.observability.grafana.alerting/LO-3`
  - `concept.observability.tracing.distributed-tracing/LO-1`
  - `concept.observability.tracing.distributed-tracing/LO-2`
  - `concept.observability.tracing.distributed-tracing/LO-3`
  - `concept.observability.tracing.jaeger-architecture/LO-1`
  - `concept.observability.tracing.jaeger-architecture/LO-2`
  - `concept.observability.tracing.jaeger-architecture/LO-3`
  - `concept.observability.tracing.sampling-strategies/LO-1`
  - `concept.observability.tracing.sampling-strategies/LO-2`
  - `concept.observability.tracing.sampling-strategies/LO-3`
  - `concept.observability.incident.management-process/LO-1`
  - `concept.observability.incident.management-process/LO-2`
  - `concept.observability.incident.management-process/LO-3`
  - `concept.observability.incident.postmortem-culture/LO-1`
  - `concept.observability.incident.postmortem-culture/LO-2`
  - `concept.observability.incident.postmortem-culture/LO-3`
  - `concept.observability.alerting.strategy/LO-1`
  - `concept.observability.alerting.strategy/LO-2`
  - `concept.observability.alerting.strategy/LO-3`
  - `concept.cicd.aws.workflow-delivery/LO-1`
  - `concept.cicd.aws.workflow-delivery/LO-2`
  - `concept.cicd.aws.workflow-delivery/LO-3`
  - `concept.cicd.jenkins.pipeline-automation/LO-1`
  - `concept.cicd.jenkins.pipeline-automation/LO-2`
  - `concept.cicd.jenkins.pipeline-automation/LO-3`

## 測驗目標

- 能從使用者症狀、監控平面健康度與交付事件建立一條可驗證的事故時間線。
- 能把 Metrics、Logs、Traces 互相校正，區分資料缺口、觀測工具故障與真正的服務回歸。
- 能以 Prometheus／PromQL、Histogram／Summary、Grafana、ELK／collector、Jaeger／sampling 和告警策略提出安全的診斷方案。
- 能從 AWS workflow、Jenkins、artifact digest、測試 gate、provenance 與 deployment revision 判斷產物是否可被信任。
- 能由 SLO、業務正確性、回滾風險與事故角色分工做出止損、回復與事後改進決策。

### 學習目標覆蓋

| 文章 Concept | Learning Objectives | 覆蓋位置 |
| :--- | :--- | :--- |
| `concept.observability.pillars.metrics-logs-traces` | LO-1、LO-2、LO-3 | 作答要求 1、2；參考答案 1 |
| `concept.observability.metrics.prometheus-fundamentals` | LO-1、LO-2、LO-3 | 作答要求 2；參考答案 2 |
| `concept.observability.metrics.prometheus-architecture` | LO-1、LO-2、LO-3 | 作答要求 2、8；參考答案 2、8 |
| `concept.observability.metrics.promql-basics` | LO-1、LO-2、LO-3 | 作答要求 2；參考答案 2 |
| `concept.observability.metrics.histogram-summary` | LO-1、LO-2、LO-3 | 作答要求 2；參考答案 2 |
| `concept.observability.logging.elk-stack` | LO-1、LO-2、LO-3 | 作答要求 4；參考答案 4 |
| `concept.observability.logging.collector-choice` | LO-1、LO-2、LO-3 | 作答要求 4；參考答案 4 |
| `concept.observability.logging.elasticsearch-indexing` | LO-1、LO-2、LO-3 | 作答要求 4；參考答案 4 |
| `concept.observability.grafana.visualization` | LO-1、LO-2、LO-3 | 作答要求 3；參考答案 3 |
| `concept.observability.grafana.dashboard-design` | LO-1、LO-2、LO-3 | 作答要求 3；參考答案 3 |
| `concept.observability.grafana.alerting` | LO-1、LO-2、LO-3 | 作答要求 3、8；參考答案 3、8 |
| `concept.observability.tracing.distributed-tracing` | LO-1、LO-2、LO-3 | 作答要求 5；參考答案 5 |
| `concept.observability.tracing.jaeger-architecture` | LO-1、LO-2、LO-3 | 作答要求 5；參考答案 5 |
| `concept.observability.tracing.sampling-strategies` | LO-1、LO-2、LO-3 | 作答要求 5；參考答案 5 |
| `concept.observability.incident.management-process` | LO-1、LO-2、LO-3 | 作答要求 6；參考答案 6 |
| `concept.observability.incident.postmortem-culture` | LO-1、LO-2、LO-3 | 作答要求 6、8；參考答案 6、8 |
| `concept.observability.alerting.strategy` | LO-1、LO-2、LO-3 | 作答要求 3、8；參考答案 3、8 |
| `concept.cicd.aws.workflow-delivery` | LO-1、LO-2、LO-3 | 作答要求 7、8；參考答案 7、8 |
| `concept.cicd.jenkins.pipeline-automation` | LO-1、LO-2、LO-3 | 作答要求 7、8；參考答案 7、8 |

## 問題情境與限制條件

你是值班的 senior backend engineer。電商平台的 `checkout-api` 在一次 AWS ECS canary 發布後，同時出現 API 長尾延遲、部分訂單失敗與「監控看起來互相矛盾」的情況。這次發布由 GitHub Actions 建置容器、推送到 ECR，再由 Jenkins release pipeline 執行 staging promotion 與 production deployment。

### 交付與版本背景

- GitHub Actions 的 workflow run `1842` 由 commit `9c1e7a2` 建置 `checkout-api`，staging 使用 digest `sha256:stage-a1`。
- Jenkins 在 production stage 重新執行了 build step，而不是 promotion 同一個 digest；production 實際執行 `sha256:prod-b7`。兩個 image 的 tag 相同，但內容不同。
- Jenkins 的 integration test stage 最近被設成 optional；pipeline 顯示綠燈，但該 stage 在 agent plugin 版本不相容時被 skipped。SBOM、signature 與 provenance 沒有成為 promotion 的必要 gate。
- 新版本 14:00 以 10% canary 部署到 AWS ECS，其餘流量仍由上一個 digest 處理。14:12 開始擴大前，以下證據被發現。

### 事故觀測資料

- 全站流量約 1,000 requests/sec，canary 約 100 requests/sec，流量沒有明顯增加；canary 的 HTTP 5xx／timeout 從 0.3% 升到 1.5%，P50 從 210 ms 升到 260 ms，P99 從 900 ms 升到 4.2 s，checkout success rate 從 99.9% 降到 98.7%。
- Prometheus 的 `checkout-api` scrape success 降至 96%，TSDB head series 在發布後增加約 4 倍，remote-write backlog 約 5 分鐘。新版本把 `user_id`、完整 URL 和 request identifier 當成 label；部分 dashboard 查詢因此 timeout。
- latency Histogram 的 bucket 顯示 canary 的長尾明顯惡化，但各 Pod 的 Summary P99 看起來接近正常；Dashboard 主要顯示全站平均延遲，沒有版本與 exposure 切片。
- Grafana Alerting 的錯誤率 rule 曾進入 Firing，但 notification policy 把它路由成 Slack Warning；Prometheus Alertmanager 的同類告警又被 deployment alert inhibition。值班者沒有收到 page。
- Fluent Bit node buffer 使用率達 92%，Logstash output queue 持續增加，Elasticsearch index lag 約 8 分鐘，且近期動態欄位造成 mapping／field count 上升。Kibana 查不到最新事件，但部分事件在 buffer 和 Logstash queue 中仍可找到。
- Jaeger 使用 1% head-based sampling；保留的 20 條 canary trace 中有 7 條是慢請求，但約 30% 的 inventory async span 沒有 parent `trace_id`。Collector drop rate 4%，Storage write latency 上升，錯誤請求不一定被 head sampling 選中。
- 事故期間一筆相同的 `checkout_id` 出現 `http.status=200`、`payment_authorized`、`order_created`，但之後才出現 `inventory_reservation_timeout`；不能僅用 HTTP status 判定業務正確。

### 限制條件

1. 只能使用已脫敏的聚合指標、抽樣識別碼、版本、digest、trace／span identifier 和結構化事件，不得查詢或輸出付款資料與個人資料。
2. 事故期間只能執行一次 canary rollback 或一次緊急 feature／traffic flag 變更，不得同時大幅調高 timeout、retry、sampling、connection pool 與 queue 上限。
3. 不得把 optional／skipped test 當成通過；不能重新 build 來「修正」production digest，必須先保留 workflow、Jenkins、registry、ECS 與觀測證據。
4. 不得修改 SLO 定義掩蓋違規；若 rollback，必須檢查 schema、事件相容性、付款／訂單外部副作用與冪等性。
5. 不能把全站 trace sampling 提高到 5% 以上；可以針對錯誤、慢請求、canary 或 correctness mismatch 做有範圍的 tail／targeted sampling。
6. 事故結束後必須提交 blameless post-mortem，包含 owner、期限、驗收條件與回歸測試，不得只把責任歸給某位值班者。

## 作答要求

1. 建立前 15 分鐘的事故時間線，先描述使用者影響，再列出至少四個分層假設，並為每個假設指定 Metrics、Logs 或 Traces 證據。
2. 以 Prometheus／PromQL 解讀 traffic、error、latency、scrape health、series cardinality、remote-write backlog；說明 Histogram 與 Summary 為何會給出不同結論，並提出修正查詢與指標模型。
3. 重設 Grafana Dashboard 的排查順序，指出目前平均值、缺少版本切片與告警路由如何誤導；設計包含 SLO、burn rate、no-data、grouping、inhibition 和 escalation 的告警方案。
4. 使用 ELK／collector 證據區分應用未寫 log、Fluent Bit buffer、Logstash backpressure、Elasticsearch index lag、mapping explosion 與 Kibana 查詢問題；提出保留、限流、解析、Rollover／ILM 和恢復順序。
5. 使用 Trace、Span、`traceparent`、非同步 metadata、Jaeger Collector／Storage 證據重建一條慢 checkout；說明 1% head sampling、缺 parent span 與 targeted tail sampling 的限制。
6. 以 IC、Ops、Comms、Scribe 分工提出止損流程，做出「停止擴大、rollback 或 flag 隔離」其中一個明確決策；說明恢復門檻與事故後如何建立 blameless post-mortem。
7. 審核 GitHub Actions 與 Jenkins 的 quality gate、agent／plugin 差異、artifact digest、SBOM、signature、provenance、OIDC／credentials 與 production promotion，指出 pipeline 綠燈為何不代表可安全發布。
8. 提出一次性回復後的驗證計畫，至少涵蓋五項使用者 SLI、觀測平面健康、trace coverage、log lag、artifact identity、deployment revision、rollback、告警通知與業務冪等證據。

## 期待證據

- 能先用 canary／baseline、版本、route、region 與時間窗口切分，指出 1.5% 失敗率、P99 4.2 秒與 success rate 98.7% 是使用者症狀；不能因全站平均值平穩就放行。
- 能辨識 Prometheus 監控平面自身已受高基數 label、scrape gap、TSDB head growth 與 remote-write backlog 影響；`user_id`、完整 URL 和 request ID 不應成為 label。
- 能用 Histogram bucket 跨 instance 聚合估算服務 P99，並說明 Summary P99 是 client-side、不可直接平均；應檢查 bucket 邊界和 good／total latency SLI。
- 能將 Dashboard 的平均延遲、沒有版本切片、Grafana Warning route 和 Alertmanager inhibition 視為偵測／通知失效，而非「沒有事故」的證據。
- 能分開應用日誌事件時間與 Elasticsearch 可搜尋時間，沿 Fluent Bit buffer、Logstash queue、mapping／shard／refresh／indexing latency 逐層定位，並提出背壓與保留策略。
- 能從慢 Trace 找到 canary 的 critical path，檢查同步與非同步 context propagation；知道 1% head sampling 可能漏掉錯誤，missing parent 不等於下游沒執行。
- 能保留錯誤、慢請求、canary 和 correctness mismatch 的 targeted trace，卻不把全站 sampling 無限制提高，也能監控 Collector drop、buffer、Storage write latency 和成本。
- 能指出一次 HTTP 200 仍可能對應 reservation timeout，使用脫敏的 checkout／冪等識別碼與事件時間驗證業務狀態，而不是只看 transport status。
- 能把 skipped integration test、production rebuild、相同 tag 不同 digest、缺少 SBOM／signature／provenance 視為 promotion blocker；以已驗證 digest 做 rollback 或隔離。
- 能把回復視為一次受控變更，檢查 schema／event compatibility、外部付款／訂單副作用與 idempotency，並以 SLO、觀測平面和業務正確性觀察窗確認恢復。
- 能在 post-mortem 中記錄系統與流程 contributing factors，將 action item 寫成 owner、期限、驗收條件和測試，而不是責備個人。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 無法建立事故時間線，或提出會擴大資料損害、繞過 quality gate、暴露敏感資料或讓觀測平面過載的方案。 |
| 1 | 能列出 Metrics、Logs、Traces、Grafana、Jaeger、ELK 或 CI/CD 名詞，但沒有把訊號連到使用者影響、artifact 身分或止損決策。 |
| 2 | 能指出部分 Prometheus、日誌、追蹤或 pipeline 異常，但遺漏訊號盲區、Summary 聚合限制、告警路由、provenance、業務正確性或回復驗證中的至少兩項。 |
| 3 | 能依序完成分層診斷、告警與儀表板修正、trace／log 證據收斂、artifact gate 和一次受控 rollback／隔離，並提出可量化的恢復驗證。 |
| 4 | 除上述內容外，能量化 SLO／burn rate 與觀測成本，處理 metrics cardinality、ELK backpressure、trace sampling、CI provenance、外部副作用與 post-mortem action，並清楚說明每個取捨與證據限制。 |

### 通過標準

總分達 **3/4 分**才通過；Metrics／PromQL、Logs／ELK、Traces／Jaeger、Grafana／Alerting、CI provenance／rollback 五個核心面向各不得低於 2 分。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

### 1. 先確認影響並建立時間線

先把 10% canary 與上一版 baseline 在同一時間、route 和 region 對照。流量穩定，但 canary 的 5xx／timeout、P99 與 checkout success rate 同時惡化，因此應立即停止擴大，而不是用全站平均值稀釋回歸。第一層症狀是使用者失敗、長尾延遲與可能的業務狀態錯誤；候選原因至少有：新 digest 行為回歸、觀測資料被高基數拖慢、collector／Elasticsearch 背壓、trace context／sampling 盲區，以及 pipeline 產物不一致。

先保留 workflow run、Jenkins stage、ECR digest、ECS deployment、flag exposure、Prometheus rule state、Grafana notification、Logstash queue 和 Jaeger Collector 的時間線。值班流程由 IC 凍結擴大發布；Ops 只執行一次經審核的 rollback 或 traffic／feature isolation；Scribe 記錄每個操作與觀測變化，Comms 對內外同步影響與下一個更新時間。

### 2. Metrics、PromQL 與 Histogram／Summary

Prometheus 的高基數 label 使 series 增長四倍、scrape success 降至 96%，remote-write backlog 也表示監控平面不再是無條件可信的即時來源。先移除或停止產生 `user_id`、完整 URL 和 request identifier 等 label，改用受控的 route template、service、version、status class 和 region；同時保留原始事件中的脫敏 request／trace identifier。恢復期間以低成本的 recording rule、scrape health、series count、query latency、remote-write backlog 和 no-data 告警確認監控平面。

錯誤率應按 canary／baseline、版本與服務計算 good／total 的 rate，而不是對 counter 瞬時值操作。延遲 SLI 應以 Histogram bucket 估算整體服務的 good event 比例或 P99；先按必要維度聚合 bucket，再計算 quantile。Summary 是各 client／Pod 自己算出的 quantile，不可把不同 Pod 的 P99 平均；它看似正常不能推翻 canary Histogram 的長尾。若 bucket 不覆蓋主要延遲區間，要先調整 bucket 並以新舊版本的同一定義重新驗證，而不是直接把 P99 圖表改成平均值。

### 3. Dashboard、SLO 與告警

Grafana 第一層應依序放 traffic、error、latency、saturation、availability／correctness SLI 與 burn rate，第二層按版本、canary exposure、route、region 拆分，第三層連到 deployment、Trace 和 Logs。平均延遲只能當補充，不能取代 P95／P99 或 latency distribution；所有面板要顯示時間範圍、資料延遲、空值語意和 query 版本。

告警應以症狀和 SLO 為核心。對 availability、latency 與 correctness 設定短／長窗口 burn-rate；對 Prometheus scrape failure、series explosion、remote-write lag、Log index lag、Jaeger drop 和 pipeline gate failure 建立觀測平面告警。Grafana Alert Rule、Contact Point、Notification Policy 要有 owner、審計、測試與 fallback；Prometheus Alertmanager 的 grouping、inhibition 不能把 canary regression 靜默掉。這次錯誤率即使只進入 Slack Warning，也應因 canary／SLO exposure 觸發 page 或明確升級。

### 4. Logs、collector 與 Elasticsearch

Kibana 的 8 分鐘 index lag 不能證明應用沒有寫 log。先比較應用 emit count、Fluent Bit buffer、drop／retry、Logstash input／output queue、解析錯誤、Elasticsearch indexing／refresh latency、mapping field count、shard／heap／disk 和 query latency。短期保留 buffer 中的脫敏事件，對低價值 DEBUG 做受控降級，維持 ERROR、部署、訂單狀態、`trace_id`、版本與冪等欄位；不能在沒有容量證據時同時把 queue 和 retention 無限放大。

中期應限制 schema 與 dynamic mapping，將 collector pipeline 的 parse、retry、backpressure 和 replay 行為納入測試；Elasticsearch 以時間／大小 rollover、ILM、合理 shard／replica、bulk 和 refresh 設計吞吐與保留。mapping explosion、bulk rejection 或 shard recovery 需先以指標證實，再選擇限流、擴容、調整 refresh／ILM 或修正 mapping。

### 5. Trace、Jaeger 與 sampling

從保留的慢 canary trace 找入口 span、下游 span、duration、error、版本和 `traceparent`，再用脫敏 `trace_id` 連回 Logs。對非同步 inventory 事件，必須檢查 producer 是否把 context 放進 message metadata、consumer 是否抽取並建立 linked／child span；30% 缺 parent 是 instrumentation 或 boundary 問題的候選，不代表 inventory 沒有執行。

1% head sampling 可能漏掉錯誤與低比例長尾；可以保留正常流量的低比例 head sample，對 canary、error、慢請求與 correctness mismatch 使用有上限的 targeted tail sampling。Collector、queue、Storage write latency、drop rate、buffer memory 與成本要一起設上限；不能把全站 sampling 提到限制以上來掩蓋 propagation 問題。

### 6. 止損、回復與事故分工

在只有一次受控變更的限制下，首選停止擴大並 rollback 到已驗證的 staging digest `sha256:stage-a1`，前提是確認 schema／event 相容與已存在的付款／訂單副作用有冪等補償。若 rollback 風險較高，則以唯一一次 traffic／feature isolation 關閉有問題的 canary 路徑，但不能把 flag 當成產物治理的替代品。任何選擇都要先保存 evidence，並對支付授權、訂單建立、inventory reservation 做對帳和重複操作檢查。

IC 宣布停止擴大、指定 Ops 執行一次變更並設定觀察窗；Comms 說明受影響功能與更新時間；Scribe 記錄 rollout、metrics、logs、traces、告警與決策。恢復門檻至少包括 canary／baseline 差異消失、availability／latency／correctness SLI 回到 SLO 可接受範圍、Prometheus scrape／remote write、ELK index lag、Jaeger drop 和告警通知恢復，且連續觀察一段時間沒有 retry／queue 反彈。

### 7. AWS workflow、Jenkins 與 provenance

這次 pipeline 綠燈不可信，因為 integration test 是 optional／skipped，production 重新 build 造成相同 tag 對應不同 digest，且沒有 SBOM、signature、provenance gate。應把 commit SHA、workflow run、Jenkins build、agent／plugin 版本、artifact digest、測試報告、scan、SBOM、signature 和 deploy revision 綁成同一條 provenance；staging 驗證後只能 promotion 該 digest，不能在 production 重建。

GitHub Actions 使用 OIDC／短期憑證與最小權限，Jenkins Credentials 不得輸出到 log；protected environment、審批和 required checks 確保 skipped test 不會變成通過。Controller 只協調，Agent 需固定 image／工具鏈並監控 drift；Jenkinsfile／Shared Library 版本化、可審查、可重入。rollback 應選擇已驗證的 digest，並以 ECS revision、業務 SLI、schema／event compatibility 和外部副作用一起驗證。

### 8. 後續改進與 post-mortem

復盤要記錄：高基數 label 如何進入 metrics、為何缺少 cardinality gate；Dashboard 為何只呈現平均值；告警為何被 Warning route／inhibition 隱藏；collector／index lag 的容量與背壓假設；trace propagation／sampling 的覆蓋率；以及 optional test、重新 build 和 provenance 缺口如何通過 pipeline。行動項目應包括 owner、期限、驗收條件，例如新增 label lint、Histogram SLO recording rule、Grafana／Alertmanager notification test、ELK schema／ILM 壓測、trace context integration test、artifact digest promotion gate、SBOM／signature／provenance required check 和 rollback game day。

</details>

## 常見失分點

- 只看全站平均 latency 或 HTTP 5xx，忽略 canary、P99、checkout correctness 與 exposure。
- 把 Prometheus scrape gap、remote-write backlog、Grafana 空白或 Kibana index lag 當成「沒有事故」。
- 把 `user_id`、完整 URL、request ID 當成 Prometheus label，沒有理解 cardinality 對 TSDB 和查詢的影響。
- 把多個 Summary P99 平均，或沒有先聚合 Histogram bucket 就直接計算服務 P99。
- 只提高全站 sampling、timeout、retry、queue 或 connection pool，沒有處理成本、背壓與 retry storm。
- 看到 Jaeger 缺 parent span 就認定下游沒有執行，沒有檢查 message metadata、consumer instrumentation 和 sampling。
- 只查 Kibana 最新結果，忽略 Fluent Bit／Logstash buffer、index delay、mapping、shard 和 refresh 邊界。
- 只回滾 ECS image tag，沒有確認 digest、schema／event compatibility、付款／訂單副作用和冪等性。
- 把 Jenkins／GitHub Actions 綠燈、optional test 或相同 tag 當成 artifact provenance 證明。
- 在事故中找人負責，卻沒有把 action item 轉成 owner、期限、驗收條件和回歸測試。

## 延伸追問

1. 如果 Prometheus 監控平面持續過載，但產品要求保留 correctness SLI，你會如何在不增加高基數 label 的情況下重新定義事件與聚合？
2. 如果 Elasticsearch 不能在事故期間擴容，如何在保留 ERROR、部署和業務狀態事件的前提下設計 collector 降級、保留與 replay？
3. 如果非同步訊息平台不能原生傳遞 W3C `traceparent`，你會如何設計 metadata、linked span 與去重，避免把業務 ID 當成 Trace ID？
4. 如果 rollback 前已執行一部分付款授權與訂單建立，如何用冪等鍵、事件時間和對帳流程處理外部副作用，而不引入全域分散式交易？
5. 如果 Jenkins plugin 升級造成 integration test 被 skipped，但短期無法重建 agent，你會如何設計例外審批、風險隔離與事後 provenance 補證？
