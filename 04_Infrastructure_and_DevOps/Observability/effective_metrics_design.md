# Effective Metrics Design (高效指標設計)

- **難度**: 6
- **標籤**: `Metrics`, `Monitoring`, `Best Practices`, `USE Method`, `RED Method`

## 問題詳述

在設計監控系統時，我們經常面臨「指標太多，告警太吵」或「關鍵時刻找不到有用指標」的困境。請介紹業界常用的指標設計方法論 (如 USE, RED, Four Golden Signals)，並說明如何設計高質量的指標。

## 核心理論與詳解

設計指標的核心原則是：**少即是多 (Less is More)**。每個指標都應該有明確的用途 (報警、調試或容量規劃)。

### 1. 三大黃金方法論

#### USE Method (適用於資源監控)

由 Brendan Gregg 提出，主要用於分析**基礎設施資源** (CPU, Memory, Disk, Network)。

- **Utilization (使用率)**: 資源被忙碌使用的時間百分比 (如 CPU 使用率 80%)。
- **Saturation (飽和度)**: 資源無法處理額外工作而導致排隊的程度 (如 Load Average, Disk Queue Length)。
- **Errors (錯誤)**: 錯誤事件的計數 (如 Disk Read Errors)。

#### RED Method (適用於微服務)

由 Tom Wilkie 提出，主要用於分析**請求驅動 (Request-driven)** 的服務。

- **Rate (速率)**: 每秒請求數 (QPS)。
- **Errors (錯誤)**: 失敗請求的數量或比例。
- **Duration (耗時)**: 請求處理的延遲分佈 (通常看 P50, P99)。

#### The Four Golden Signals (Google SRE)

Google SRE 書中提出的通用標準，涵蓋了上述兩者。

1. **Latency (延遲)**: 請求處理時間 (需區分成功和失敗請求的延遲)。
2. **Traffic (流量)**: 系統負載 (如 QPS, I/O 吞吐量)。
3. **Errors (錯誤)**: 請求失敗率 (顯式錯誤如 500，隱式錯誤如內容不正確)。
4. **Saturation (飽和度)**: 系統最受限資源的滿載程度。

### 2. 指標命名規範 (Naming Convention)

良好的命名能讓指標更易讀、易查。Prometheus 建議遵循以下規範：

- **格式**: `<namespace>_<subsystem>_<name>_<unit>`
- **範例**: `http_request_duration_seconds`
  - `http`: namespace
  - `request`: subsystem
  - `duration`: name
  - `seconds`: unit (**重要**: 始終使用基本單位，如 seconds, bytes，不要用 milliseconds, megabytes，由前端展示時再轉換)。

### 3. 標籤設計 (Label Design)

標籤 (Labels/Tags) 賦予了指標多維度分析的能力，但濫用會導致**基數爆炸 (Cardinality Explosion)**。

- **✅ 好的標籤**:
  - `method="POST"` (枚舉值少)
  - `status="500"` (枚舉值少)
  - `region="us-east-1"` (枚舉值少)
- **❌ 壞的標籤**:
  - `user_id="12345"` (無限增長)
  - `email="test@example.com"` (無限增長)
  - `url="/api/users/12345"` (路徑參數未聚合)

### 4. 告警設計原則

- **告警應針對症狀 (Symptom-based)**: 告訴你「用戶受影響了」 (如 P99 延遲 > 500ms)，而不是「原因」 (如 CPU > 80%)。原因應該在 Dashboard 中查看。
- **告警應具備可操作性 (Actionable)**: 收到告警後，運維人員應該知道要做什麼。如果什麼都做不了，就不該發告警。

## 程式碼範例

(無程式碼，僅為設計原則)
