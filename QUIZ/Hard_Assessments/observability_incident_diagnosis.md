# 多服務 Checkout 事故診斷：以可觀測性證據做分層排查與發布決策

- **Assessment ID**: `assessment.observability.checkout.incident-diagnosis.v1`
- **主要 Concept ID**: `concept.observability.incident-diagnosis`
- **Secondary Concept IDs**:
  - `concept.observability.monitoring.observability-vs-monitoring`
  - `concept.observability.metrics.red-use-golden-signals`
  - `concept.observability.tracing.context-propagation`
  - `concept.observability.logging.centralized-architecture`
  - `concept.observability.slo.error-budget`
- **對應文章**:
  - [Observability vs Monitoring](../../04_Infrastructure_and_DevOps/Observability/observability_vs_monitoring.md)
  - [Effective Metrics Design](../../04_Infrastructure_and_DevOps/Observability/effective_metrics_design.md)
  - [Distributed Tracing Basics](../../04_Infrastructure_and_DevOps/Observability/distributed_tracing_basics.md)
  - [Centralized Logging Architecture](../../04_Infrastructure_and_DevOps/Observability/centralized_logging_architecture.md)
  - [SLI, SLO, SLA 與錯誤預算](../../04_Infrastructure_and_DevOps/Observability/sli_slo_sla.md)
- **題型**: `故障診斷`, `情境／取捨`, `發布決策`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 30 分鐘
- **標籤**: `Observability`, `Metrics`, `Logs`, `Distributed Tracing`, `SLO`, `Error Budget`, `Checkout`, `Incident Response`
- **Learning Objective IDs**: `LO-1`, `LO-2`, `LO-3`, `LO-4`, `LO-5`, `LO-6`

## 測驗目標

- **LO-1**：能從使用者症狀建立分層假設，使用 RED、Four Golden Signals 與 USE 指標界定故障範圍，區分症狀與可能根因。
- **LO-2**：能使用 Trace、Span 與 Context Propagation 重建 checkout 的關鍵路徑，辨識抽樣不足或傳播中斷造成的可觀測性盲區。
- **LO-3**：能以集中式結構化日誌、`trace_id`、`order_id` 與冪等識別碼重建資料狀態轉移，驗證 HTTP 成功與業務正確性是否一致。
- **LO-4**：能定義並計算可用性、延遲與正確性 SLI 的 SLO、錯誤預算與短期燃燒率，並說明證據的統計限制。
- **LO-5**：能在錯誤預算、資料完整性、回滾風險與服務保護之間做出發布、凍結、回滾或降級決策。
- **LO-6**：能提出可驗證的排查時間線、緊急觀測調整與事後儀表板／告警改進，讓下一次事故更快收斂。

### 學習目標覆蓋

| 文章 Concept | 文章 Learning Objectives | 本測驗覆蓋位置 |
| :--- | :--- | :--- |
| `concept.observability.monitoring.observability-vs-monitoring` | LO-1、LO-2、LO-3 | 測驗目標 LO-1、LO-2、LO-6；作答要求 1、2、3 |
| `concept.observability.metrics.red-use-golden-signals` | LO-1、LO-2、LO-3 | 測驗目標 LO-1、LO-4、LO-6；作答要求 1、2、6 |
| `concept.observability.tracing.context-propagation` | LO-1、LO-2、LO-3 | 測驗目標 LO-2、LO-3、LO-6；作答要求 3、4、6 |
| `concept.observability.logging.centralized-architecture` | LO-1、LO-2、LO-3 | 測驗目標 LO-3、LO-6；作答要求 4、6 |
| `concept.observability.slo.error-budget` | LO-1、LO-2、LO-3 | 測驗目標 LO-4、LO-5；作答要求 5 |

## 問題情境

你是值班的 senior backend engineer。電商平台的 checkout 在一次 `checkout-api` 發布後出現三種同時發生的異常：延遲上升、錯誤率上升，以及部分訂單的資料狀態不正確。團隊不能只靠一個儀表板或單一訊號下結論，必須在有限的生產風險下完成分層診斷並決定是否繼續發布。

### 架構與發布背景

- 同步路徑為 `API Gateway → checkout-api → pricing → inventory.reserve → payment.authorize → order.create`。
- `order` 完成後會發布 `reservation-reconcile` 事件給 `inventory-worker`；事件是 at-least-once，可能重試，系統已有以 `order_id` 加上操作類型組成的冪等鍵。
- `checkout-api` 新版本 `v2026.08.12` 於 14:00 開始 10% canary，其餘流量仍使用上一版。新版本把 inventory 呼叫逾時後的處理改為「先建立 pending order，再以非同步事件補做 reservation」。
- 只有通過驗證的請求計入本題的 checkout SLO；客戶端格式錯誤等 4xx 不計入。30 天內部目標如下：

| SLI | SLO | 允許的壞事件比例 | 對外 SLA |
| :--- | :---: | :---: | :---: |
| 非 5xx／timeout 的有效 checkout 請求 | 99.9% | 0.1% | 99.5% availability |
| 1.5 秒內完成的有效 checkout 請求 | 99.5% | 0.5% | 未另訂延遲 SLA |
| 訂單狀態與 inventory reservation 一致的完成請求 | 99.95% | 0.05% | 以合約中的資料正確性條款為準 |

### 事故觀測資料（14:15 截面）

- 全站 checkout 流量約 1,800 requests/sec，canary 約 180 requests/sec；流量沒有明顯增加。
- checkout 的 RED 指標如下：

| 指標 | 發布前 | Canary | 備註 |
| :--- | :---: | :---: | :--- |
| Rate | 1,800 req/s | 180 req/s | 流量切分符合 10% |
| 5xx 或 timeout | 0.2% | 2.8% | 主要集中在 `v2026.08.12` |
| P50 duration | 220 ms | 280 ms | 中位數只小幅上升 |
| P99 duration | 900 ms | 4.8 s | 明顯長尾 |
| latency SLI：小於 1.5 s | 99.7% | 96.6% | 以 histogram bucket 計算 |
| correctness SLI：狀態一致 | 99.98% | 99.40% | 0.6% 完成訂單需人工核對 |

- 下游與 USE 指標：
  - `pricing` P99 約 80 ms，錯誤率 0.1%；`payment` P99 約 200 ms，錯誤率沒有變化。
  - `inventory.reserve` P99 從 120 ms 升到 2.4 s，timeout 從 0.1% 升到 2.1%。inventory DB connection pool 使用率從 70% 升到 98%，wait queue 從 0 增至約 250；資料庫 CPU 仍只有 45%。
  - `checkout-api` CPU 與記憶體正常，但新版本的 inventory timeout、retry 與 async fallback 計數同步上升。
- Traces 使用 1% head-based sampling。已保留的慢請求中，27／30 個 canary trace 在 `inventory.reserve` span 等待超過 2 秒；`payment.authorize` 沒有出現同等延遲。約 18% 的 `inventory-worker` span 沒有 parent `trace_id`。
- 集中式 Logs 是 JSON，但近期 buffer backlog 造成 index delay 約 4 分鐘。可看到下列相同 `order_id` 的事件序列（欄位已脫敏）：

  1. `checkout_completed`, `http.status=200`, `reservation_state=pending`, `service.version=v2026.08.12`。
  2. `inventory_reservation_timeout`, `deadline_ms=300`, `attempt=1`。
  3. `reservation_reconcile_scheduled`, `attempt=1`。
  4. `order_state_transition`, `from=pending`, `to=confirmed`，但當下 reservation 仍是 pending。
  5. 之後可能出現 `inventory_reservation_applied` 或 `idempotency_conflict`，其 consumer log 有時沒有 `trace_id`。

### 限制條件

1. 不得在事故期間直接查詢或輸出未脫敏的付款資料與個人資料；只能使用現有的結構化欄位、聚合指標與抽樣訂單識別碼。
2. 不能把全站 trace sampling 一次提高到 5% 以上；可以對 checkout／inventory 的慢請求、錯誤或 correctness mismatch 做有範圍的 tail-based sampling。
3. 只能執行一次 canary rollback 或一次緊急 feature-flag 變更，不能同時大幅調高 timeout、retry、connection pool 與佇列上限。
4. inventory reservation 與 order creation 沒有全域分散式交易；不能以「加一個 2PC」作為當下修復。必須保留 at-least-once 與冪等處理的安全性。
5. 事故期間不得修改 SLO／SLA 定義來掩蓋違規；所有發布決策都要能由觀測證據與錯誤預算解釋。

## 核心測驗

### 作答要求

1. 設計前 15 分鐘的排查順序：先描述使用者影響，再列出至少三個分層假設，並為每個假設指定要查的 Metrics、Logs 或 Traces。
2. 使用 RED、Four Golden Signals 與 USE 解讀資料，說明為什麼「CPU 正常」不能排除 inventory 是瓶頸；指出哪些指標是症狀、哪些是待驗證的原因。
3. 以 `trace_id`、`span_id`、`traceparent` 與服務版本重建一條慢 checkout 的 critical path；說明如何處理 `inventory-worker` 缺少 parent trace 的 18% 盲區，以及為何 1% head sampling 不足。
4. 設計不暴露 PII 的 Logs 查詢與 correctness 驗證：用 `order_id`、冪等鍵、attempt、事件時間與版本重建狀態轉移，區分 HTTP 200、非同步延遲、重試重複與真正資料錯誤；同時處理 4 分鐘 index delay。
5. 計算 canary 的主要錯誤預算燃燒率，說明 SLI／SLO／SLA 的差異，並做出「繼續、暫停、回滾或降級」其中一個明確發布決策。必須說明資料正確性低於 SLO 時，為何不能只看 HTTP error rate。
6. 提出事故緩解後的驗證門檻與兩項以上可持續的觀測改進，涵蓋指標、trace context、集中式 logs、告警或 error-budget policy。

### 期待證據

- 先按 canary／baseline、服務、版本與時間切片確認回歸，而不是把所有服務的平均值混在一起。
- 能用 Rate、Errors、Duration 描述使用者症狀，並用 connection-pool saturation、wait queue、lock／query wait 等 USE 證據定位資源瓶頸；不把正常 CPU 當成健康證明。
- 能從 trace 的 critical path 指出 inventory 是主要延遲候選，指出 payment 的正常 span 是排除證據，而不是只列出所有服務名稱。
- 能把同步 `traceparent` 和非同步事件 metadata 的 propagation 分開驗證；知道缺少 parent trace 是 instrumentation／context boundary 問題，而不是下游沒有執行。
- 能以結構化事件和冪等鍵驗證「200 但 reservation 尚未完成」是否造成錯誤的 `confirmed` 狀態，並說明 eventual consistency 的允許窗口與超過窗口後的修復策略。
- 能注意到 4 分鐘 log index delay，使用 buffer／shipper backlog 指標或其他訊號交叉驗證，不把暫時查不到日誌當成沒有事件。
- 能計算：availability 壞事件率 2.8%／0.1% = 約 28 倍燃燒率；correctness 壞事件率 0.6%／0.05% = 約 12 倍；latency 壞事件率 3.4%／0.5% = 約 6.8 倍。並知道 162,000 個 canary requests／15 分鐘約有 4,536 個 availability 壞事件與 972 個 correctness mismatch。
- 能明確停止擴大發布，優先 rollback canary 或關閉不安全的 async success fallback，保留冪等、重試與 reconciliation；不以無證據地調大 timeout／retry／pool 取代診斷。
- 能提出 rollback 後以 error rate、latency SLI、correctness reconciliation、pool queue、trace coverage 和 log lag 作為恢復證據，並以小流量 canary 重新驗證。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 無法建立正確的事故模型，或把延遲、錯誤與資料正確性視為同一個指標；提出的行動會增加資料損害或與限制條件矛盾。 |
| 1 | 能背出 Metrics、Logs、Traces 或 SLO 的部分定義，但沒有把證據連到 checkout 的服務邊界、狀態轉移或發布決策。 |
| 2 | 能指出 inventory 延遲、trace 缺口或 error budget 異常中的部分現象，但缺少分層驗證、correctness 證據、燃燒率計算或修復取捨。 |
| 3 | 能正確依序使用 metrics、traces、logs 與 SLO 做診斷，提出可行的回滾／降級決策，並說明主要驗證數據與代價。 |
| 4 | 能完整連結 canary 對照、RED／USE、critical path、context propagation、結構化 log 與資料狀態、error-budget burn rate，指出統計與一致性邊界，並提出安全且可驗證的發布恢復與長期改進方案。 |

### 通過標準

預設 **3/4 分通過**；本題屬於生產事故診斷，且 Metrics、Traces、Logs、SLO／發布決策四個核心面向各不得低於 2 分。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

### 1. 先確認影響，再建立故障範圍

先以 canary 與上一版 baseline 做同時間、同 route、同 region 的對照。流量穩定但 canary 的 5xx／timeout 從 0.2% 升至 2.8%、P99 到 4.8 秒，且 correctness 降至 99.40%，所以這是使用者可感知的回歸，不是單純容量自然成長。第一層症狀是 checkout 的延遲、失敗與錯誤狀態；第二層候選原因是 inventory 的 reservation 等待、connection-pool 飽和、retry 放大，以及新版本的 async fallback 提前回覆。

排查順序應為：

1. 先確認 canary／baseline 的 SLI、版本、流量權重與時間線，避免把發布前後的不同流量混算。
2. 以 checkout RED 及 latency／error／correctness SLI 確認使用者影響，再沿服務依賴拆分 `pricing`、`inventory`、`payment`、`order`。
3. 用 inventory 的 USE 證據檢查 connection-pool utilization、wait queue、資料庫 lock／query wait、timeout、retry 與 request concurrency。CPU 45% 只表示 CPU 尚未飽和，不能排除連線池或鎖等待這個更受限的資源。
4. 用 traces 找出 critical path，再用 logs 驗證同一個 `order_id` 的業務事件與狀態轉移；最後才決定需要哪一個緩解動作。

### 2. Metrics 與 Traces 的分層推理

`pricing` 與 `payment` 的延遲沒有同步惡化，而 27／30 個保留的慢 canary trace 都在 `inventory.reserve` 等待超過 2 秒，因此 inventory 是目前最強的延遲候選。connection pool 98% 與 wait queue 250 是比 CPU 更直接的 saturation 證據；需要再用資料庫 lock、慢查詢、連線取得等待與重試數確認究竟是 DB contention、pool 太小，還是新版本增加了並發與重試。

Trace 應從 gateway／checkout root span 沿 `pricing`、`inventory.reserve`、`payment.authorize` 到 `order.create` 展開。同步 HTTP／gRPC 呼叫要在 `traceparent` 中傳遞 Trace ID 與目前 Span ID；`inventory-worker` 的非同步事件也要把 trace context 放入 message metadata，consumer 建立新的 child／linked span，並保留 `order_id` 與 attempt 作業務關聯。18% 沒有 parent trace 表示 context 在 producer、message header、consumer middleware 或 exporter 邊界遺失，不能解讀為「那 18% 沒有執行」。1% head sampling 也可能漏掉低比例的 correctness mismatch，因此可在限制內對慢、錯誤與 mismatch 做 targeted tail sampling，而不是全站無差別提高採樣。

### 3. Logs 與資料正確性驗證

用已脫敏的 `order_id`、冪等鍵、`trace_id`、service、version、event、attempt、reservation_state 與事件時間建立事件時間線。若多筆事件呈現 `checkout_completed(200, pending)` → `reservation_timeout` → `reservation_reconcile_scheduled` → `order_state_transition(confirmed)`，但當下 reservation 仍 pending，則 HTTP 200 只是 API 層完成，不能作為業務正確性的證明。應再查：

- timeout 的 deadline 是否由新版本的 300 ms 造成，以及 retry 是否在 connection pool 已飽和時放大壓力；
- `order` 將 pending 轉 confirmed 的條件是否錯把「已排入 reconcile」當作「reservation 已成功」；
- 後續 `reservation_applied`、`idempotency_conflict` 與 reconciliation 結果是否能讓資料在允許窗口內收斂，超時的訂單是否需要隔離、補償或人工核對。

因為索引延遲 4 分鐘，14:15 查不到某事件不能證明事件不存在。要同時查看 shipper／buffer backlog、exporter drop／retry、index delay 指標，必要時以 Metrics 與 Traces 先界定影響，再用已進入索引的抽樣訂單和安全的 read-only reconciliation 查詢補證據；不能為了除錯輸出付款資料或 PII。

### 4. Error Budget 與發布決策

15 分鐘內 canary 約有 `180 × 900 = 162,000` 個請求。availability 壞事件率 2.8% 對 0.1% 預算，短期約是 `2.8 / 0.1 = 28x` burn rate；correctness 壞事件率 0.6% 對 0.05% 預算，約是 `12x`；latency 壞事件率 `100 - 96.6 = 3.4%` 對 0.5% 預算，約 `6.8x`。因此約有 4,536 個 availability 壞事件與 972 個 correctness mismatch。P99 只能表示長尾，不足以單獨算出 latency SLI；本題已提供 histogram bucket 的 96.6%，實務上應查 `le=1.5s` 的 good／total。

SLI 是上述實際量測事實，SLO 是團隊的內部目標，SLA 是對外合約與未達成後果。即使 availability 或 HTTP status 暫時沒有觸及 SLA，內部 SLO 的多倍燃燒與 correctness SLO 已足以停止發布；資料正確性是核心 checkout 的使用者結果，不能被「HTTP 200」掩蓋。

明確決策是**立即停止 rollout 並 rollback 10% canary**；若 rollback 前必須先止血，則用唯一一次 feature flag 關閉不安全的「pending 即成功／非同步 fallback」，寧可讓請求顯式失敗或進入可追蹤的 pending 狀態，也不要繼續產生錯誤的 confirmed order。不能同時任意調高 timeout、retry 與 pool，因為可能把已飽和的 inventory 放大成 retry storm。回滾後要執行冪等的 reconciliation，隔離 mismatch，並觀察資料是否收斂。

### 5. 恢復與長期改進

重新放量前至少要看到：canary 與 baseline 的 availability／latency／correctness SLI 回到目標範圍、inventory pool wait queue 與 timeout 回落、mismatch reconciliation 無新增且既有資料已收斂、trace context coverage 恢復、buffer／index lag 消失。之後以極小比例 canary 驗證，並以 error-budget policy 作為放量 gate。

長期應補上：

- 以低基數的 service、route、version、region 標籤建立 checkout latency histogram、timeout／retry／pool wait 與 correctness good／total 指標，並以 symptom 與 burn rate 告警。
- 在 HTTP／gRPC 及事件 metadata 統一注入與抽取 W3C Trace Context，對錯誤、慢請求與 correctness mismatch 使用 targeted tail sampling，並監控 propagation coverage。
- 強制結構化 logs 包含 `trace_id`、`order_id`、idempotency key 的雜湊／安全表示、attempt、version、state transition 與 event time；監控 shipper、buffer backlog、drop、index lag 和 retention。
- 把「reservation confirmed」定義成真正的 correctness SLI 與發布 gate，讓 async fallback 必須有明確狀態機、超時補償與可重跑 reconciliation。

</details>

## 常見失分點

- 只看 CPU、平均延遲或 HTTP 500，忽略 P99、connection-pool saturation 與資料正確性。
- 把 HTTP 200 或「事件已排程」當成 reservation 已完成，沒有驗證 order／inventory 狀態機。
- 看到 trace 缺失就斷言下游沒有執行，沒有檢查 `traceparent`、message metadata、consumer middleware 與 sampling。
- 忽略集中式 Logs 的 4 分鐘 ingestion delay，或把所有日誌採樣／索引問題誤當成業務沒有事件。
- 直接把全站 sampling、timeout、retry、pool 或佇列全部調大，沒有考慮成本、retry storm 與資料副作用。
- 把 P99 數值直接當成 latency SLI 的壞事件比例，沒有查 histogram good／total bucket。
- 只用 SLA 判定是否可發布，或為了放行臨時修改 SLO，沒有使用 error budget 與核心路徑風險。

## 延伸追問

1. 如果 rollback 後 inventory pool 已恢復，但 correctness mismatch 仍持續增加，你會如何區分 idempotency bug、order state machine bug 與重複事件？
2. 如果事件平台不支援 W3C `traceparent`，你會如何設計 metadata、linked span 與取樣策略，避免把 `order_id` 當成唯一的追蹤識別碼？
3. 對具有可接受 eventual-consistency 窗口的 checkout，correctness SLI 應如何定義 good event、等待窗口與 reconciliation failure？
4. 如果 availability error budget 尚未耗盡，但 correctness error budget 已耗盡，產品團隊要求繼續發布，你會如何提出風險與決策門檻？
5. 如果無法立即回滾（例如資料庫 schema 已向前相容但舊版本不支援新欄位），有哪些不改變全域交易模型的隔離、降級與恢復方案？
