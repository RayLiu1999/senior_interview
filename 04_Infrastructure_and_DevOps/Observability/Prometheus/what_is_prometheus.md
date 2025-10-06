# 什麼是 Prometheus？它的架構和核心概念是什麼？

- **難度**: 5
- **重要程度**: 5
- **標籤**: `Prometheus`, `監控`, `時序資料庫`, `CNCF`

## 問題詳述

Prometheus 是目前業界最流行的開源監控解決方案，特別適合雲原生和微服務架構。理解 Prometheus 的架構、資料模型和核心概念，是建立現代監控系統的基礎。

## 核心理論與詳解

### Prometheus 簡介

**Prometheus** 是一個開源的系統監控和告警工具，由 SoundCloud 於 2012 年創建，2016 年加入 Cloud Native Computing Foundation (CNCF)，是繼 Kubernetes 之後第二個從 CNCF 畢業的專案。

#### 核心特性

1. **多維資料模型**：使用時間序列資料，透過指標名稱和鍵值對（labels）識別
2. **強大的查詢語言**：PromQL 支援靈活的資料查詢和聚合
3. **無依賴儲存**：獨立的時序資料庫，不依賴分散式儲存
4. **Pull 模式**：主動從目標拉取指標資料
5. **服務發現**：支援多種服務發現機制（Kubernetes、Consul、DNS 等）
6. **視覺化**：內建表達式瀏覽器，並可整合 Grafana
7. **告警管理**：通過 Alertmanager 實現靈活的告警路由和靜默

---

### Prometheus 架構

Prometheus 生態系統由多個組件構成：

```
┌─────────────┐
│   Targets   │  (應用、Exporter)
│  /metrics   │
└──────┬──────┘
       │ Pull (HTTP)
       ▼
┌─────────────────┐
│   Prometheus    │
│     Server      │
│  ┌───────────┐  │
│  │   TSDB    │  │  (時序資料庫)
│  └───────────┘  │
│  ┌───────────┐  │
│  │  PromQL   │  │  (查詢引擎)
│  └───────────┘  │
└────┬────────┬───┘
     │        │
     │        └──────► Grafana (視覺化)
     │
     ▼
┌──────────────┐
│ Alertmanager │  (告警管理)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Receivers   │  (Email, Slack, PagerDuty...)
└──────────────┘
```

#### 核心組件詳解

##### 1. Prometheus Server（Prometheus 伺服器）

這是 Prometheus 的核心，負責：

- **資料抓取（Scraping）**：定期從配置的目標拉取指標
- **時序資料庫（TSDB）**：儲存所有的指標資料
- **查詢引擎**：執行 PromQL 查詢
- **規則評估**：評估告警規則和記錄規則
- **Web UI**：提供表達式瀏覽器和基本視覺化

**關鍵特性**：
- 使用本地磁碟儲存，預設保留 15 天資料
- 單機運作，無需複雜的叢集配置
- 可水平擴展（通過聯邦或遠端儲存）

##### 2. Targets（監控目標）

任何暴露 `/metrics` 端點的系統都可以成為監控目標：

**應用程式直接暴露**：
- 使用 Prometheus 客戶端函式庫（Go、Java、Python、Ruby 等）
- 在應用中實現 `/metrics` 端點

**Exporter（導出器）**：
- 將第三方系統的指標轉換為 Prometheus 格式
- 常見 Exporter：
  - **Node Exporter**：硬體和 OS 指標（CPU、記憶體、磁碟、網路）
  - **MySQL Exporter**：MySQL 資料庫指標
  - **Redis Exporter**：Redis 指標
  - **Blackbox Exporter**：黑盒監控（HTTP、DNS、ICMP 探測）
  - **JMX Exporter**：Java 應用 JMX 指標

**Pushgateway**（推送閘道）：
- 用於短期任務或批次作業
- 將指標推送到 Pushgateway，再由 Prometheus 拉取
- **注意**：只適合特殊場景，一般不建議使用

##### 3. Alertmanager（告警管理器）

獨立的告警管理組件，負責：

- **告警去重**：相同告警只發送一次
- **分組**：將相關告警聚合在一起
- **靜默**：臨時禁止某些告警
- **抑制**：當某個告警觸發時，抑制相關的其他告警
- **路由**：根據標籤將告警路由到不同的接收者
- **通知**：發送告警到各種管道（Email、Slack、PagerDuty、Webhook 等）

**告警流程**：
```
Prometheus (評估規則) → Alertmanager (分組/去重/路由) → Receivers (通知)
```

##### 4. Service Discovery（服務發現）

Prometheus 支援多種服務發現機制：

- **靜態配置**：直接在配置檔案中列出目標
- **Kubernetes**：自動發現 Pods、Services、Endpoints、Nodes
- **Consul**：通過 Consul 服務發現
- **DNS**：通過 DNS SRV 記錄
- **EC2**：AWS EC2 實例
- **File SD**：從檔案讀取目標列表（支援動態更新）

**範例：Kubernetes 服務發現**
```yaml
scrape_configs:
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

##### 5. Grafana（視覺化）

雖然 Prometheus 有內建的 Web UI，但生產環境中通常使用 **Grafana** 進行視覺化：

- 豐富的圖表類型（折線圖、柱狀圖、熱力圖等）
- 支援多個資料源
- 可分享的儀表板
- 變數和模板功能
- 告警整合

---

### Prometheus 資料模型

#### 時間序列（Time Series）

Prometheus 中的所有資料都以**時間序列**的形式儲存，每個時間序列由以下部分唯一識別：

```
<metric_name>{<label_name>=<label_value>, ...}
```

**範例**：
```
http_requests_total{method="GET", status="200", service="api"}
http_requests_total{method="POST", status="500", service="api"}
cpu_usage{instance="10.0.1.5:9100", job="node"}
```

#### 指標名稱（Metric Name）

指標名稱描述了**被測量的系統特徵**：

- 應該具有描述性（如 `http_requests_total`）
- 通常包含單位（如 `_bytes`、`_seconds`）
- 遵循命名慣例：`<namespace>_<name>_<unit>_<suffix>`

**命名最佳實踐**：
- 使用 snake_case（小寫加底線）
- 以應用名稱或子系統作為前綴
- 使用基礎單位（seconds 而非 milliseconds）
- 尾綴說明指標類型（`_total`、`_count`、`_sum`）

#### 標籤（Labels）

標籤提供了**多維度的資料模型**，允許對相同指標的不同維度進行區分：

```
api_http_requests_total{
  method="GET",
  path="/users",
  status="200",
  service="user-service",
  instance="10.0.1.5:8080"
}
```

**標籤設計原則**：

✅ **好的標籤設計**：
- 使用有界的標籤值（如 HTTP 方法只有 GET、POST 等）
- 標籤值相對穩定，不會頻繁變化
- 標籤數量合理（避免組合爆炸）

❌ **避免的標籤設計**：
- 不要使用無界的標籤值（如用戶 ID、請求 ID）
- 避免高基數標籤（會產生大量時間序列，影響效能）
- 不要在標籤中包含敏感資訊

**基數問題範例**：

假設有以下標籤組合：
- method: 10 個可能值
- status: 10 個可能值
- path: 100 個不同路徑
- user_id: 100萬個用戶

總時間序列數 = 10 × 10 × 100 × 1,000,000 = **10 億** ❌

正確做法：移除 `user_id` 標籤，改為聚合計數。

---

### 指標類型（Metric Types）

Prometheus 定義了四種指標類型：

#### 1. Counter（計數器）

**特性**：
- 只增不減的累計值
- 重啟後會歸零
- 適合計數類指標

**範例**：
- `http_requests_total`：HTTP 請求總數
- `errors_total`：錯誤總數
- `bytes_sent_total`：發送的位元組總數

**查詢方式**：
通常使用 `rate()` 或 `increase()` 計算速率：
```promql
# 每秒請求數（QPS）
rate(http_requests_total[5m])

# 5 分鐘內的總增量
increase(http_requests_total[5m])
```

#### 2. Gauge（儀表盤）

**特性**：
- 可增可減的瞬時值
- 代表當前狀態
- 適合快照類指標

**範例**：
- `memory_usage_bytes`：當前記憶體使用量
- `cpu_temperature`：CPU 溫度
- `queue_size`：佇列長度
- `concurrent_requests`：當前並發請求數

**查詢方式**：
可以直接使用或計算變化：
```promql
# 當前值
memory_usage_bytes

# 平均值
avg_over_time(memory_usage_bytes[5m])
```

#### 3. Histogram（直方圖）

**特性**：
- 觀察值的分布（如請求延遲、請求大小）
- 自動創建多個時間序列：
  - `_bucket{le="..."}`: 各個桶的累計計數
  - `_sum`: 所有觀察值的總和
  - `_count`: 觀察值的總數

**範例**：
```
http_request_duration_seconds_bucket{le="0.1"} 100    # ≤ 0.1s: 100 個請求
http_request_duration_seconds_bucket{le="0.5"} 250    # ≤ 0.5s: 250 個請求
http_request_duration_seconds_bucket{le="1.0"} 300    # ≤ 1.0s: 300 個請求
http_request_duration_seconds_bucket{le="+Inf"} 320   # 所有請求: 320 個
http_request_duration_seconds_sum 85.2                # 總耗時: 85.2 秒
http_request_duration_seconds_count 320               # 總數: 320 個
```

**查詢方式**：
```promql
# 計算 95 百分位延遲
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# 平均延遲
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
```

#### 4. Summary（摘要）

**特性**：
- 類似 Histogram，但在客戶端計算百分位數
- 自動創建時間序列：
  - `{quantile="..."}`: 預先計算的百分位數
  - `_sum`: 所有觀察值的總和
  - `_count`: 觀察值的總數

**範例**：
```
http_request_duration_seconds{quantile="0.5"} 0.15    # P50
http_request_duration_seconds{quantile="0.9"} 0.35    # P90
http_request_duration_seconds{quantile="0.99"} 0.8    # P99
http_request_duration_seconds_sum 85.2
http_request_duration_seconds_count 320
```

**Histogram vs Summary**：

| 特性 | Histogram | Summary |
|------|-----------|---------|
| 百分位數計算 | 伺服器端（查詢時） | 客戶端（記錄時） |
| 聚合性 | 可聚合 | 不可聚合 |
| 精確度 | 近似（桶區間） | 精確（滑動窗口） |
| 效能開銷 | 較低 | 較高 |
| 建議使用場景 | 大部分情況 | 需要精確百分位數且無需聚合 |

**推薦**：優先使用 **Histogram**，因為它更靈活且支援聚合。

---

### Pull 模式 vs Push 模式

Prometheus 採用 **Pull 模式**（主動拉取），與傳統監控系統的 Push 模式不同。

#### Pull 模式的優勢

1. **簡化目標管理**：
   - 集中式配置，Prometheus 知道所有目標
   - 可以檢測目標是否健康（抓取失敗即告警）

2. **防止監控系統過載**：
   - Prometheus 控制抓取頻率
   - 目標異常不會影響監控系統

3. **易於除錯**：
   - 可以直接訪問 `/metrics` 端點查看指標
   - 無需擔心網路問題導致資料丟失

4. **支援臨時查詢**：
   - 可以手動觸發抓取
   - 適合開發和除錯

#### Pull 模式的限制

1. **網路拓撲限制**：
   - Prometheus 必須能訪問所有目標
   - 跨網段或防火牆可能需要額外配置

2. **短期任務監控困難**：
   - 批次作業可能在抓取前就結束
   - 需要使用 Pushgateway（但不推薦）

**解決方案**：
- 長期任務：使用標準 Pull 模式
- 短期任務：考慮改為推送日誌或使用其他工具

---

### Prometheus 配置範例

基本的 `prometheus.yml` 配置：

```yaml
global:
  scrape_interval: 15s       # 預設抓取間隔
  evaluation_interval: 15s   # 規則評估間隔
  external_labels:
    cluster: 'production'
    region: 'us-east-1'

# Alertmanager 配置
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']

# 告警和記錄規則檔案
rule_files:
  - 'alerts/*.yml'
  - 'rules/*.yml'

# 抓取配置
scrape_configs:
  # Prometheus 自身監控
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node Exporter（主機監控）
  - job_name: 'node'
    static_configs:
      - targets: 
          - 'node1:9100'
          - 'node2:9100'

  # 應用服務（通過 Kubernetes 服務發現）
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        target_label: __address__
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
```

---

### 使用場景與最佳實踐

#### 適合使用 Prometheus 的場景

✅ **強烈推薦**：
- 雲原生應用（Kubernetes 環境）
- 微服務架構
- 動態環境（服務頻繁變化）
- 需要強大查詢能力的場景
- 白盒監控（應用內部指標）

#### 不太適合的場景

❌ **考慮其他方案**：
- 需要長期資料保留（數年）→ 使用遠端儲存
- 需要事件日誌而非指標 → 使用日誌系統
- 需要精確的計費資料 → Prometheus 是取樣資料，可能不夠精確
- Push 架構且無法改變 → 考慮其他監控系統

#### 最佳實踐

1. **指標設計**：
   - 遵循命名慣例
   - 避免高基數標籤
   - 選擇合適的指標類型

2. **效能優化**：
   - 控制時間序列數量（通常不超過百萬級）
   - 使用適當的抓取間隔（通常 15s-60s）
   - 合理設置資料保留期（預設 15 天）

3. **高可用**：
   - 部署多個 Prometheus 實例（相同配置）
   - 使用 Alertmanager 叢集（去重）
   - 考慮遠端儲存（如 Thanos、Cortex）

4. **安全性**：
   - 使用 TLS 加密
   - 實施認證和授權
   - 限制網路訪問

---

### 常見面試問題

#### Q1：為什麼 Prometheus 使用 Pull 模式而不是 Push 模式？

**回答要點**：
- 集中式配置和健康檢測
- 防止監控系統過載
- 易於除錯（可直接訪問 `/metrics`）
- 適合動態環境和服務發現

#### Q2：如何處理短期任務的監控？

**回答要點**：
- 可以使用 Pushgateway，但不推薦作為預設方案
- 更好的方式是改變任務架構（如改為長期運行的 worker）
- 或者使用日誌系統記錄結果，而非指標

#### Q3：Prometheus 的單機架構如何擴展？

**回答要點**：
- **聯邦（Federation）**：層級化的 Prometheus，上層從下層拉取資料
- **功能分片**：不同 Prometheus 監控不同服務
- **遠端儲存**：使用 Thanos、Cortex 等實現長期儲存和查詢
- **水平擴展**：通過一致性雜湊分配監控目標

---

## 總結

Prometheus 是現代雲原生監控的事實標準，其核心優勢包括：

1. **簡單而強大**：單機部署即可使用，但支援複雜的查詢和告警
2. **雲原生友好**：與 Kubernetes 深度整合，支援動態服務發現
3. **生態豐富**：大量 Exporter 和整合工具
4. **查詢能力強**：PromQL 提供靈活的資料分析能力

理解 Prometheus 的架構和核心概念，是構建現代監控系統的基礎，也是資深後端面試的常見考點。在實際使用中，需要注意指標設計、效能優化和高可用部署。
