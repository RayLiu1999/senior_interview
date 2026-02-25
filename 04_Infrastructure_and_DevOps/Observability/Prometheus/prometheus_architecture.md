# Prometheus Architecture (Prometheus 架構)

- **難度**: 6
- **標籤**: `Prometheus`, `Monitoring`, `TimeSeriesDB`, `Pull Model`

## 問題詳述

Prometheus 是雲原生時代最流行的監控系統。請描述 Prometheus 的核心架構組件，並解釋為什麼它選擇 Pull 模型而不是 Push 模型？

## 核心理論與詳解

Prometheus 是一個開源的系統監控和報警工具包，其核心是一個**時間序列資料庫 (TSDB)**。

### 1. 核心架構組件

一個標準的 Prometheus 生態系統包含以下組件：

1. **Prometheus Server**: 核心組件，負責：
    - **Retrieval**: 定期從目標 (Targets) 拉取 (Pull) 指標數據。
    - **TSDB**: 將數據儲存在本地磁碟的時間序列資料庫中。
    - **HTTP Server**: 提供 PromQL 查詢接口。
2. **Exporters**: 運行在被監控節點上的代理程式，負責將系統指標 (如 CPU、記憶體) 或應用指標轉換為 Prometheus 可讀的格式 (Metrics Endpoint)。
    - 常見 Exporter: `Node Exporter` (主機硬體), `MySQL Exporter`, `Redis Exporter`。
3. **Pushgateway**: 用於接收短暫任務 (Short-lived Jobs) 推送 (Push) 過來的指標，Prometheus Server 再從這裡拉取。
4. **Alertmanager**: 處理 Prometheus Server 發送的告警，負責去重 (Deduplication)、分組 (Grouping) 和路由 (Routing) 到接收端 (如 Email, Slack, PagerDuty)。
5. **Service Discovery (服務發現)**: Prometheus 需要知道去哪裡拉取數據。它支持多種服務發現機制 (如 Kubernetes, Consul, EC2)，自動感知監控目標的變化。

### 2. Pull vs Push 模型

Prometheus 最顯著的特點是採用 **Pull (拉取)** 模型，這與傳統監控系統 (如 Graphite, InfluxDB) 的 Push (推送) 模型不同。

#### Pull 模型 (Prometheus)

- **工作方式**: Prometheus Server 主動發起 HTTP 請求去 Exporter 抓取數據。
- **優點**:
  - **控制權在 Server**: Server 可以決定採集頻率，避免被海量數據壓垮 (Backpressure)。
  - **簡單的目標檢測**: 如果 Server 拉取失敗，就知道目標掛了 (Up/Down)。
  - **方便本地測試**: 開發者可以在筆電上直接 `curl` 應用的 Metrics 接口查看數據。
- **缺點**: 對於短暫存在的批處理任務 (Batch Jobs) 不友好 (任務結束了 Server 還沒來拉)，需要 Pushgateway 輔助。

#### Push 模型 (傳統)

- **工作方式**: 應用程式主動將數據發送到監控 Server。
- **優點**: 適合短暫任務；即時性可能稍好。
- **缺點**:
  - **容易壓垮 Server**: 如果流量突增，Server 可能處理不過來 (DDoS 自己)。
  - **需要配置 Server 地址**: 每個 Agent 都需要知道 Server 的 IP，配置複雜。

### 3. 數據模型

Prometheus 的數據由 **Metric Name** 和 **Labels (標籤)** 組成：

- 格式: `<metric name>{<label name>=<label value>, ...}`
- 範例: `http_requests_total{method="POST", handler="/api/tracks"}`

這種多維度數據模型 (Multi-dimensional Data Model) 配合強大的查詢語言 **PromQL**，使得 Prometheus 非常適合動態的雲原生環境。

## 程式碼範例

```go
// Go 應用程式暴露 Prometheus Metrics
package main

import (
    "net/http"
    "time"

    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

// 定義一個 Counter 指標
var (
    opsProcessed = prometheus.NewCounter(prometheus.CounterOpts{
        Name: "myapp_processed_ops_total",
        Help: "The total number of processed events",
    })
)

func init() {
    // 註冊指標
    prometheus.MustRegister(opsProcessed)
}

func main() {
    // 模擬業務邏輯，增加計數器
    go func() {
        for {
            opsProcessed.Inc()
            time.Sleep(2 * time.Second)
        }
    }()

    // 暴露 /metrics 接口供 Prometheus 拉取
    http.Handle("/metrics", promhttp.Handler())
    http.ListenAndServe(":2112", nil)
}
```
