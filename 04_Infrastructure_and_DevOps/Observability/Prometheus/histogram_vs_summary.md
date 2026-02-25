# Histogram vs Summary (直方圖與摘要)

- **難度**: 7
- **標籤**: `Prometheus`, `Metrics`, `Quantile`, `P99`

## 問題詳述

在 Prometheus 中，`Histogram` 和 `Summary` 都可以用來計算分位數 (Quantiles，如 P99, P95)。請解釋它們的區別，以及在什麼場景下應該選擇哪一個？

## 核心理論與詳解

這兩種指標類型都用於統計數據的分佈情況 (如請求延遲、回應大小)，但它們計算分位數的**位置**和**原理**完全不同。

### 1. Histogram (直方圖)

- **原理**:
  - 在 **Client 端** (應用程式) 僅記錄數據落入哪個桶 (Bucket) 中。
  - 例如，定義桶為 `[0.1s, 0.5s, 1s, 5s]`。如果一個請求耗時 0.3s，則 `le="0.5"`, `le="1"`, `le="5"` 的計數器都會 +1。
  - 分位數的計算是在 **Server 端** (Prometheus) 通過 `histogram_quantile()` 函數進行估算的。
- **優點**:
  - **可聚合 (Aggregatable)**: 這是最大的優勢。你可以將多個實例 (Pod) 的 Histogram 數據相加，然後計算整體的 P99。
  - **低客戶端開銷**: 客戶端只需要簡單的計數操作。
- **缺點**:
  - **估算誤差**: P99 是基於桶的線性插值估算的，如果桶設置得不合理 (如範圍太大)，誤差會很大。
  - **高基數問題**: 如果桶定義得太多，會產生大量的時間序列。

### 2. Summary (摘要)

- **原理**:
  - 在 **Client 端** (應用程式) 直接計算好分位數 (如 P50, P90, P99)。
  - 客戶端維護一個滑動窗口 (Sliding Window) 或使用算法 (如 T-Digest) 來實時計算。
- **優點**:
  - **精確**: 計算出的分位數是相對精確的 (取決於客戶端算法)。
  - **查詢簡單**: 不需要使用複雜的 PromQL 函數，直接查詢即可。
- **缺點**:
  - **不可聚合 (Not Aggregatable)**: 你不能將兩個實例的 P99 相加再除以 2 來得到整體的 P99 (數學上不成立)。因此，Summary 只能看單個實例的數據，無法看集群整體的 P99。
  - **高客戶端開銷**: 計算分位數需要消耗客戶端的 CPU 和記憶體。

### 3. 選擇建議

| 特性 | Histogram | Summary |
| :--- | :--- | :--- |
| **計算位置** | Server 端 (PromQL) | Client 端 (SDK) |
| **聚合能力** | ✅ 支持 (可計算集群整體 P99) | ❌ 不支持 (僅限單機 P99) |
| **精確度** | 估算值 (取決於 Bucket 設計) | 相對精確 |
| **配置複雜度** | 需預先定義 Buckets | 需預先定義 Quantiles |
| **推薦場景** | **大多數場景 (90%)**，特別是需要聚合指標時 | 僅當需要極高精確度且不需要聚合時 |

**結論**: 在雲原生環境中，**Histogram 是默認選擇**。因為我們通常關心的是整個服務 (Service) 的 P99，而不是某個特定 Pod 的 P99。

## 程式碼範例

```go
// Go Prometheus SDK 定義 Histogram 與 Summary
package main

import (
    "github.com/prometheus/client_golang/prometheus"
)

var (
    // 1. 定義 Histogram
    requestDurationHistogram = prometheus.NewHistogram(prometheus.HistogramOpts{
        Name:    "http_request_duration_seconds_hist",
        Help:    "Request duration histogram",
        // 需要手動定義 Buckets
        Buckets: []float64{0.1, 0.2, 0.5, 1.0, 2.0, 5.0},
    })

    // 2. 定義 Summary
    requestDurationSummary = prometheus.NewSummary(prometheus.SummaryOpts{
        Name:       "http_request_duration_seconds_sum",
        Help:       "Request duration summary",
        // 需要定義目標分位數和允許的誤差
        Objectives: map[float64]float64{0.5: 0.05, 0.9: 0.01, 0.99: 0.001},
    })
)

func init() {
    prometheus.MustRegister(requestDurationHistogram)
    prometheus.MustRegister(requestDurationSummary)
}

func recordMetrics(duration float64) {
    // 記錄數據
    requestDurationHistogram.Observe(duration)
    requestDurationSummary.Observe(duration)
}
```
