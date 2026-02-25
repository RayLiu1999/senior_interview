# SLI, SLO, SLA 與錯誤預算 (Error Budget)

- **難度**: 7
- **標籤**: `SLI`, `SLO`, `SLA`, `SRE`, `Reliability`

## 問題詳述

在 SRE (Site Reliability Engineering) 實踐中，SLI、SLO 和 SLA 是三個最核心的概念。它們分別代表什麼？有什麼區別？什麼是錯誤預算 (Error Budget)，它如何幫助團隊平衡「發布速度」與「系統穩定性」？

## 核心理論與詳解

這三個縮寫詞經常被混用，但它們有嚴格的定義層級。

### 1. 定義與區別

#### SLI (Service Level Indicator) - 服務水準指標

- **定義**: 一個量化的度量指標，用於衡量服務水準的某個方面。它是**事實 (Fact)**。
- **公式**: $\frac{\text{Good Events}}{\text{Total Events}} \times 100\%$
- **範例**:
  - **可用性 (Availability)**: 成功請求數 / 總請求數。
  - **延遲 (Latency)**: 回應時間 < 100ms 的請求數 / 總請求數。
  - **正確性 (Correctness)**: 資料處理正確的記錄數 / 總記錄數。

#### SLO (Service Level Objective) - 服務水準目標

- **定義**: 對 SLI 設定的目標值 (閾值)。它是**內部目標 (Internal Goal)**。
- **目的**: 定義什麼樣的服務水準是「足夠好」的。
- **範例**:
  - "過去 30 天內，99.9% 的請求必須在 200ms 內返回。"
  - "過去 30 天內，可用性必須達到 99.95%。"

#### SLA (Service Level Agreement) - 服務水準協議

- **定義**: 與用戶 (或客戶) 簽訂的正式合約，規定了若未達到 SLO 的後果 (通常是賠償)。它是**外部承諾 (External Contract)**。
- **關係**: SLA 通常比 SLO 寬鬆，以預留緩衝空間。
  - SLO: 99.9% (內部目標)
  - SLA: 99.5% (對外承諾，低於此值需賠錢)

### 2. 錯誤預算 (Error Budget)

錯誤預算是 SRE 的核心機制，用於量化「我們可以容忍多少失敗」。

- **計算公式**: $100\% - \text{SLO}$
- **範例**: 若 SLO 為 99.9%，則錯誤預算為 0.1%。
  - 假設一個月有 43,200 分鐘，0.1% 約為 43 分鐘。
  - 這意味著我們每個月有 43 分鐘的時間可以讓系統掛掉 (或不穩定)。

#### 錯誤預算的用途

1. **平衡速度與穩定性**:
    - **預算充足**: 團隊可以大膽發布新功能、進行實驗、重構代碼。
    - **預算耗盡**: 停止發布新功能 (Feature Freeze)，全力修復 Bug、提升穩定性，直到下個週期預算重置。
2. **消除無謂的爭論**: 開發團隊 (Dev) 想發功能，維運團隊 (Ops) 怕出事。錯誤預算提供了一個客觀的數據標準來決定是否發布。

### 3. 如何設定合適的 SLO？

- **不要追求 100%**: 100% 的可靠性是不切實際且昂貴的。邊際成本會隨著可靠性提升而指數級增加。
- **從用戶角度出發**: 選擇能反映用戶真實體驗的 SLI (如 HTTP 500 錯誤率，而非 CPU 使用率)。
- **分級設定**:
  - 核心路徑 (Checkout): SLO 99.99%
  - 非核心路徑 (User Profile): SLO 99.9%
  - 背景任務 (Report Generation): SLO 99.0%

## 程式碼範例

(此主題為方法論，無程式碼，但可展示 Prometheus Alert Rule)

```yaml
# Prometheus Alert Rule 範例：當錯誤預算消耗過快時告警 (Burn Rate)

groups:
- name: slo_alerts
  rules:
  - alert: HighErrorRate
    expr: |
      # 計算過去 5 分鐘的錯誤率
      rate(http_requests_total{status=~"5.."}[5m]) 
      / 
      rate(http_requests_total[5m]) 
      > 0.001  # 大於 0.1% (即 SLO < 99.9%)
    for: 2m
    labels:
      severity: page
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value | humanizePercentage }} which consumes error budget."
```
