# PromQL Basics (PromQL 基礎)

- **難度**: 5
- **標籤**: `Prometheus`, `PromQL`, `Query Language`

## 問題詳述

PromQL (Prometheus Query Language) 是 Prometheus 的核心查詢語言。請解釋 PromQL 的四種數據類型 (Instant Vector, Range Vector, Scalar, String)，並舉例說明常用的聚合操作 (Aggregation) 和函數 (如 `rate` vs `irate`)。

## 核心理論與詳解

PromQL 是一種函數式查詢語言，專為處理時間序列數據而設計。

### 1. 數據類型 (Data Types)

在 PromQL 表達式中，主要涉及以下四種數據類型：

1. **Instant Vector (瞬時向量)**:
    - 包含一組時間序列，每個序列在**當前時間點**只有一個值。
    - 範例: `http_requests_total` (查詢當前時刻所有實例的請求總數)。
2. **Range Vector (區間向量)**:
    - 包含一組時間序列，每個序列在**一段時間範圍內**有多個值。
    - 範例: `http_requests_total[5m]` (查詢過去 5 分鐘內的所有數據點)。
    - **注意**: Range Vector 不能直接用於繪圖 (Graph)，通常作為函數 (如 `rate`) 的輸入。
3. **Scalar (純量)**:
    - 一個單純的浮點數值，沒有時間序列標籤。
    - 範例: `10`, `count(node_cpu_seconds_total)` 的結果。
4. **String (字串)**:
    - 單純的字串值 (較少直接使用)。

### 2. 常用函數與操作

#### rate vs irate

這是面試中最常被問到的區別：

- **rate(v range-vector)**:
  - 計算區間向量中時間序列的**每秒平均增長率**。
  - 適合用於觀察**長期趨勢**和**告警** (因為它平滑了突波)。
  - 範例: `rate(http_requests_total[5m])` (過去 5 分鐘的平均每秒請求數)。
- **irate(v range-vector)**:
  - 計算區間向量中**最後兩個數據點**的增長率 (Instant Rate)。
  - 適合用於觀察**高精度的瞬時變化** (如捕捉流量尖峰)。
  - 範例: `irate(http_requests_total[5m])`。

#### 聚合操作 (Aggregation)

當有多個時間序列 (如多個 Pod) 時，通常需要聚合：

- **sum**: 求和。 `sum(rate(http_requests_total[5m]))` (所有 Pod 的總 QPS)。
- **avg**: 平均值。
- **max / min**: 最大/最小值。
- **by**: 按照特定標籤分組。
  - `sum(rate(http_requests_total[5m])) by (service, method)` (按服務和方法統計 QPS)。

### 3. 選擇器 (Selectors)

- **相等匹配**: `http_requests_total{job="api-server"}`
- **不相等匹配**: `http_requests_total{job!="batch-job"}`
- **正則匹配**: `http_requests_total{handler=~"/api/v1/.*"}`

## 程式碼範例

(PromQL 範例)

```promql
# 1. 查詢 API Server 過去 5 分鐘的 99% P99 延遲
histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))

# 2. 查詢 CPU 使用率超過 80% 的節點
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80

# 3. 預測 4 小時後磁碟是否會滿 (使用 predict_linear)
predict_linear(node_filesystem_free_bytes[1h], 4 * 3600) < 0
```
