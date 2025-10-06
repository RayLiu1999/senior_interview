# 告警策略設計最佳實踐

- **難度**: 7
- **重要程度**: 5
- **標籤**: `告警`, `監控`, `最佳實踐`, `Alerting`, `On-Call`

## 問題詳述

告警是監控系統的關鍵輸出，但設計不當的告警策略會導致告警疲勞、誤報和漏報。如何設計有效的告警策略，在及時發現問題和避免打擾之間取得平衡，是資深工程師必須掌握的技能。

## 核心理論與詳解

### 告警的目的

告警系統的核心目標是：

1. **及時發現問題**：在用戶受影響之前或剛開始受影響時發現問題
2. **提供可操作資訊**：告警應該包含足夠的上下文資訊
3. **避免告警疲勞**：減少誤報和無意義的告警
4. **優先級明確**：讓工程師知道哪些問題需要立即處理

---

### 告警的黃金法則

#### 1. 每個告警都應該是可操作的（Actionable）

**壞的告警**：
```
🚨 CPU 使用率超過 80%

問題：
- 80% 的 CPU 使用率是問題嗎？
- 我應該做什麼？
- 這是暫時的還是持續的？
```

**好的告警**：
```
🚨 API 服務 P95 延遲超過 500ms 持續 5 分鐘

原因：訂單服務資料庫查詢緩慢
影響：用戶體驗下降，可能影響轉換率
建議操作：
1. 檢查慢查詢日誌
2. 查看資料庫連接池狀態
3. 考慮增加快取或優化查詢

Runbook: https://wiki.company.com/runbooks/slow-api
```

#### 2. 告警應該基於症狀而非原因（Symptom-based）

**基於原因的告警**（不推薦）：
```
❌ 磁碟使用率 > 80%
❌ 記憶體使用率 > 90%
❌ CPU 使用率 > 80%
```

問題：
- 這些指標升高不一定影響用戶
- 可能是正常的資源使用
- 導致大量誤報

**基於症狀的告警**（推薦）：
```
✅ API 錯誤率 > 1%
✅ 請求延遲 P95 > 500ms
✅ 可用性 < 99.9%
```

優勢：
- 直接反映用戶體驗
- 告警即代表問題
- 減少誤報

**例外情況**：某些原因確實需要告警
```
✅ 磁碟空間 < 10%（可能導致系統崩潰）
✅ SSL 證書將在 7 天內過期
✅ 資料庫備份失敗
```

#### 3. 告警應該有明確的嚴重程度（Severity）

常見的嚴重程度分級：

| 級別 | 說明 | 響應時間 | 通知方式 | 範例 |
|------|------|----------|---------|------|
| **Critical** | 嚴重影響服務，需立即處理 | 立即 | 電話、SMS、PagerDuty | 服務完全不可用 |
| **Warning** | 可能影響服務，需盡快處理 | 30 分鐘內 | Email、Slack | 錯誤率接近閾值 |
| **Info** | 資訊性通知，無需立即處理 | 工作時間內 | Slack、Email | 部署完成通知 |

**範例配置**：

```yaml
# Critical - 服務不可用
- alert: ServiceDown
  expr: up == 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "Service {{ $labels.job }} is down"
    
# Warning - 錯誤率升高
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High error rate on {{ $labels.service }}"
```

#### 4. 使用合適的時間窗口（Time Window）

**問題**：瞬時峰值導致誤報

```
CPU 使用率波動：
50% → 95% → 55% → 60% → 98% → 50%
     ↑             ↑
   誤報         誤報
```

**解決方案**：使用時間窗口平滑

```promql
# 不好：瞬時值
cpu_usage > 80

# 好：5 分鐘平均值
avg_over_time(cpu_usage[5m]) > 80

# 更好：持續 5 分鐘超過閾值
avg_over_time(cpu_usage[5m]) > 80 FOR 5m
```

**時間窗口選擇指南**：

| 指標類型 | 時間窗口 | 原因 |
|---------|---------|------|
| 錯誤率 | 5-10 分鐘 | 過濾偶發錯誤 |
| 延遲 | 5-15 分鐘 | 避免瞬時峰值 |
| 可用性 | 1-5 分鐘 | 快速發現服務中斷 |
| 資源使用 | 10-30 分鐘 | 資源問題通常是逐漸累積的 |

---

### 告警設計模式

#### 1. RED 方法（適用於請求驅動的服務）

**R**ate（速率）、**E**rrors（錯誤）、**D**uration（延遲）

```promql
# Rate - 流量突然下降（可能服務有問題）
- alert: TrafficDrop
  expr: |
    rate(http_requests_total[5m]) < 0.5 * rate(http_requests_total[1h] offset 1h)
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "Traffic dropped by 50% on {{ $labels.service }}"

# Errors - 錯誤率過高
- alert: HighErrorRate
  expr: |
    rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.01
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Error rate > 1% on {{ $labels.service }}"
    description: "Current error rate: {{ $value | humanizePercentage }}"

# Duration - 延遲過高
- alert: HighLatency
  expr: |
    histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "P95 latency > 500ms on {{ $labels.service }}"
```

#### 2. USE 方法（適用於資源）

**U**tilization（使用率）、**S**aturation（飽和度）、**E**rrors（錯誤）

```promql
# Utilization - CPU 使用率
- alert: HighCPUUsage
  expr: |
    100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
  for: 15m
  labels:
    severity: warning

# Saturation - 記憶體即將耗盡
- alert: MemoryPressure
  expr: |
    node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes < 0.1
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Memory available < 10% on {{ $labels.instance }}"

# Errors - 磁碟 I/O 錯誤
- alert: DiskIOErrors
  expr: rate(node_disk_io_errors_total[5m]) > 0
  labels:
    severity: warning
```

#### 3. 多維度告警

結合多個指標避免誤報：

```promql
# 範例：只有當錯誤率高且流量正常時才告警
- alert: RealHighErrorRate
  expr: |
    (
      rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.01
    )
    and
    (
      rate(http_requests_total[5m]) > 10  # 每秒至少 10 個請求
    )
  for: 5m
  labels:
    severity: critical
```

---

### 告警閾值設置

#### 1. 基於 SLO 設置閾值

如果你的 SLO（服務等級目標）是 99.9% 可用性：

```
允許的錯誤預算：
- 每月：43.2 分鐘不可用
- 每天：1.44 分鐘不可用
- 每小時：4.32 秒不可用

告警閾值：
- Warning: 已消耗 50% 錯誤預算
- Critical: 已消耗 80% 錯誤預算
```

**範例**：

```promql
# 計算錯誤預算消耗率
- alert: ErrorBudgetBurnRate
  expr: |
    (
      1 - (
        sum(rate(http_requests_total{status!~"5.."}[1h]))
        /
        sum(rate(http_requests_total[1h]))
      )
    ) > 0.001 * 10  # 10x 的錯誤率（快速消耗錯誤預算）
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Burning error budget too fast"
```

#### 2. 基於歷史資料設置閾值

使用統計方法：

```
閾值 = 平均值 + (標準差 × N)

N = 2: 95% 置信區間
N = 3: 99.7% 置信區間

範例：
平均延遲：100ms
標準差：20ms
閾值（N=2）：100 + (20 × 2) = 140ms
```

#### 3. 百分位數閾值

使用 P95 或 P99 而非平均值：

```promql
# P95 延遲超過 500ms
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5

# P99 延遲超過 1s
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m])) > 1.0
```

**為什麼使用百分位數？**

```
假設 1000 個請求的延遲：
- 950 個：< 100ms
- 40 個：200-300ms
- 10 個：5000ms（超時）

平均值：約 150ms（看起來正常）
P95：約 250ms（顯示有問題）
P99：約 5000ms（明確顯示有嚴重問題）
```

---

### 避免告警疲勞

#### 1. 告警去重和分組

**問題**：同一問題產生大量告警

```
16:00:00 - API 服務 Pod 1 Down
16:00:05 - API 服務 Pod 2 Down
16:00:10 - API 服務 Pod 3 Down
16:00:15 - API 服務 Pod 4 Down
...（100 個 Pod）
```

**解決方案**：分組告警

```yaml
# Alertmanager 配置
route:
  group_by: ['alertname', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  
  routes:
    - match:
        severity: critical
      group_wait: 0s
      group_interval: 5m
      repeat_interval: 4h
```

結果：收到一個告警「API 服務有 100 個 Pod Down」

#### 2. 告警抑制（Inhibition）

**問題**：級聯告警

```
資料庫 Down
  ↓
API 服務連接資料庫失敗（告警）
  ↓
前端服務 API 調用失敗（告警）
  ↓
負載均衡健康檢查失敗（告警）

結果：收到 4 個告警，但根因只有一個
```

**解決方案**：抑制規則

```yaml
inhibit_rules:
  # 如果資料庫 Down，抑制所有依賴資料庫的服務告警
  - source_match:
      alertname: DatabaseDown
      severity: critical
    target_match_re:
      alertname: '(APIError|ServiceUnavailable)'
    equal: ['environment', 'cluster']
```

#### 3. 告警靜默（Silence）

在計劃維護期間靜默告警：

```
維護窗口：2024-01-15 02:00-04:00
靜默範圍：service=api-gateway
持續時間：2 小時
原因：升級資料庫
```

#### 4. 告警降級

根據時間和情況調整告警級別：

```yaml
# 工作時間外降級非關鍵告警
routes:
  - match:
      severity: warning
      business_hours: false
    receiver: slack-notifications  # 只發送到 Slack，不打電話
    
  - match:
      severity: critical
    receiver: pagerduty-critical  # 隨時發送到 PagerDuty
```

---

### 告警通知策略

#### 1. 多級通知路由

```
┌─────────────┐
│   Alert     │
└──────┬──────┘
       │
       ├─ Critical → PagerDuty → 電話 + SMS
       │            （立即通知 On-Call 工程師）
       │
       ├─ Warning  → Slack #alerts 頻道
       │            （團隊可見）
       │
       └─ Info     → Slack #monitoring 頻道
                    （僅記錄）
```

**Alertmanager 配置範例**：

```yaml
receivers:
  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: <pagerduty-key>
        severity: critical
        
  - name: 'slack-alerts'
    slack_configs:
      - channel: '#alerts'
        text: |
          {{ range .Alerts }}
          *Alert:* {{ .Labels.alertname }}
          *Severity:* {{ .Labels.severity }}
          *Summary:* {{ .Annotations.summary }}
          {{ end }}
        
  - name: 'email-team'
    email_configs:
      - to: 'team@company.com'
        headers:
          Subject: '[{{ .Status }}] {{ .GroupLabels.alertname }}'
```

#### 2. 升級策略（Escalation）

```
Alert 觸發
  ↓
5 分鐘內無響應
  ↓
通知主管
  ↓
10 分鐘內無響應
  ↓
通知副總裁
```

#### 3. 通知頻率控制

```yaml
# 避免重複通知
repeat_interval: 4h  # 相同告警 4 小時後才重複通知

# 避免告警風暴期間的頻繁通知
group_interval: 5m   # 同一組告警 5 分鐘內只通知一次
```

---

### 告警內容設計

#### 好的告警應該包含的資訊

```
標題：[Critical] API 服務 P95 延遲超過 1s

描述：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 指標詳情
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
當前值：1.25s
閾值：1.0s
持續時間：10 分鐘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 影響範圍
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
服務：api-gateway
環境：production
地區：us-east-1
受影響用戶：約 30%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 可能原因
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 資料庫查詢緩慢
2. 下游服務超時
3. 記憶體不足導致 GC 頻繁

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠️ 建議操作
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 檢查慢查詢日誌
2. 查看 Grafana 儀表板：https://grafana.company.com/d/api-overview
3. 查看追蹤資料：https://jaeger.company.com/search?service=api-gateway
4. 參考 Runbook：https://wiki.company.com/runbooks/api-latency

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 相關連結
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 儀表板：https://grafana...
• 日誌：https://kibana...
• 追蹤：https://jaeger...
• Runbook：https://wiki...
```

#### Prometheus Annotation 範例

```yaml
annotations:
  summary: "{{ $labels.service }} P95 latency is {{ $value }}s"
  description: |
    P95 latency has been above 1s for 10 minutes.
    
    Service: {{ $labels.service }}
    Instance: {{ $labels.instance }}
    Current value: {{ $value | humanizeDuration }}
    
    Impact: High latency may affect user experience
    
    Troubleshooting steps:
    1. Check slow query logs
    2. Review database connection pool
    3. Check for downstream service issues
    
    Dashboard: https://grafana.company.com/d/{{ $labels.service }}
    Runbook: https://wiki.company.com/runbooks/high-latency
```

---

### 告警測試和驗證

#### 1. 定期測試告警

```bash
# 使用 amtool 測試告警配置
amtool config routes test --config.file=alertmanager.yml

# 發送測試告警
amtool alert add test_alert \
  severity=warning \
  alertname=TestAlert \
  summary="This is a test"
```

#### 2. 混沌工程驗證

定期觸發故障，驗證告警系統：

```
每月執行：
- 關閉一個資料庫實例 → 驗證資料庫告警
- 增加人工延遲 → 驗證延遲告警
- 觸發 500 錯誤 → 驗證錯誤率告警
```

#### 3. 告警回顧（Alert Review）

定期審查告警：

```
每週回顧：
- 誤報率：多少告警是誤報？
- 響應時間：平均多久響應告警？
- 根因：最常見的告警原因是什麼？
- 改進：如何減少誤報和提高有效性？
```

---

### 常見告警反模式

#### 1. ❌ 告警太多

**問題**：
```
每天收到 100+ 個告警
結果：工程師忽略告警（狼來了效應）
```

**解決**：
- 提高閾值
- 增加時間窗口
- 移除不可操作的告警

#### 2. ❌ 告警資訊不足

**問題**：
```
告警：CPU 使用率過高
工程師：哪個服務？哪個實例？多高？
```

**解決**：
在告警中包含所有必要的上下文資訊

#### 3. ❌ 缺少 Runbook

**問題**：
```
收到告警但不知道如何處理
```

**解決**：
每個告警都應該有對應的 Runbook

#### 4. ❌ 告警不分優先級

**問題**：
```
所有告警都是 Critical
工程師不知道先處理哪個
```

**解決**：
明確定義 Critical、Warning、Info 的標準

#### 5. ❌ 告警閾值過於敏感

**問題**：
```
CPU > 70% 就告警
但服務在 80% CPU 時仍正常運行
```

**解決**：
基於實際影響設置閾值，而非武斷的數字

---

### 告警指標（Alerting Metrics）

監控告警系統本身的健康狀態：

```promql
# 告警數量趨勢
sum by (severity) (ALERTS)

# 告警響應時間
histogram_quantile(0.95, rate(alert_response_time_seconds_bucket[24h]))

# 告警誤報率
sum(false_positive_alerts) / sum(total_alerts)

# On-Call 負擔
sum by (team) (rate(oncall_alerts[7d]))
```

---

### 實踐案例

#### 案例 1：電商系統的告警策略

```yaml
# Critical - 立即影響用戶
- alert: CheckoutServiceDown
  expr: up{service="checkout"} == 0
  for: 1m
  labels:
    severity: critical
    team: checkout
  annotations:
    summary: "Checkout service is down"
    impact: "Users cannot complete purchases"
    runbook: "https://wiki.company.com/runbooks/checkout-down"

# Critical - 訂單處理失敗
- alert: HighOrderFailureRate
  expr: |
    rate(orders_failed_total[5m]) / rate(orders_total[5m]) > 0.05
  for: 5m
  labels:
    severity: critical
    team: orders
  annotations:
    summary: "Order failure rate > 5%"
    impact: "Revenue loss, customer dissatisfaction"

# Warning - 庫存服務慢
- alert: InventoryServiceSlow
  expr: |
    histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{service="inventory"}[5m])) > 1
  for: 10m
  labels:
    severity: warning
    team: inventory
  annotations:
    summary: "Inventory service P95 latency > 1s"
    impact: "Checkout page may load slowly"
```

#### 案例 2：SaaS 平台的告警策略

```yaml
# Critical - API 不可用
- alert: APIUnavailable
  expr: |
    (
      sum(rate(http_requests_total{status=~"5.."}[5m]))
      /
      sum(rate(http_requests_total[5m]))
    ) > 0.05
  for: 5m
  labels:
    severity: critical
    slo: api_availability
  annotations:
    summary: "API error rate > 5%"
    current_slo: "99.9%"
    error_budget_remaining: "{{ $value }}%"

# Warning - 錯誤預算快速消耗
- alert: ErrorBudgetBurnRateHigh
  expr: |
    (
      1 - (
        sum(rate(http_requests_total{status!~"5.."}[1h]))
        /
        sum(rate(http_requests_total[1h]))
      )
    ) > 0.001 * 14.4  # 14.4x 的錯誤率
  for: 1h
  labels:
    severity: warning
    slo: api_availability
  annotations:
    summary: "Error budget burning too fast"
    description: "At current rate, monthly error budget will be exhausted in {{ $value }} hours"
```

---

### 常見面試問題

#### Q1：如何設計一個好的告警策略？

**回答要點**：
- 基於症狀而非原因（關注用戶影響）
- 每個告警都應該可操作（包含 Runbook）
- 明確的嚴重程度分級
- 使用適當的時間窗口避免誤報
- 定期回顧和優化告警規則

#### Q2：如何避免告警疲勞？

**回答要點**：
- 減少誤報（提高閾值、增加時間窗口）
- 告警分組和去重
- 告警抑制（避免級聯告警）
- 移除不可操作的告警
- 定期審查告警的有效性

#### Q3：Critical 和 Warning 告警的區別是什麼？

**回答要點**：
- **Critical**：立即影響用戶，需要立即處理（如服務不可用）
- **Warning**：可能影響用戶或即將成為 Critical，需要盡快處理（如錯誤率升高）
- Critical 應該喚醒 On-Call 工程師，Warning 可以等到工作時間處理

#### Q4：如何基於 SLO 設計告警？

**回答要點**：
- 計算錯誤預算（1 - SLO）
- 監控錯誤預算消耗率
- 設置多個告警級別：
  - Warning: 錯誤預算消耗率過快
  - Critical: 錯誤預算即將耗盡
- 基於錯誤預算調整閾值，而非武斷的數字

---

## 總結

有效的告警策略應該：

1. **可操作性**：每個告警都應該引導工程師採取具體行動
2. **基於症狀**：關注用戶體驗而非系統內部指標
3. **明確優先級**：讓工程師知道哪些問題需要立即處理
4. **避免疲勞**：通過分組、去重、抑制減少告警噪音
5. **持續優化**：定期回顧告警的有效性並改進

記住：**好的告警系統不是告警最多的系統，而是每個告警都有價值的系統**。

在實踐中，告警策略需要根據團隊規模、業務特性和運維能力不斷調整。從簡單開始，逐步完善，是最好的方法。
