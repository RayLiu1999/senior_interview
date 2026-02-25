# Grafana Alerting (Grafana 告警)

- **難度**: 5
- **標籤**: `Grafana`, `Alerting`, `Prometheus`, `OpsGenie`, `PagerDuty`

## 問題詳述

Grafana 不僅僅是視覺化工具，它也具備強大的告警功能。請解釋 Grafana Alerting 的工作原理，以及它與 Prometheus Alertmanager 的區別和協作方式。

## 核心理論與詳解

Grafana 8.0 之後推出了統一告警系統 (Unified Alerting)，大大增強了其告警能力。

### 1. Grafana Alerting 核心概念

- **Alert Rule (告警規則)**: 定義「什麼情況下要報警」。
  - 包含查詢 (Query): 如 `A = rate(http_requests_total[5m])`。
  - 包含條件 (Condition): 如 `WHEN avg() OF A IS ABOVE 100`.
  - 包含評估區間 (Evaluation Interval): 每隔多久檢查一次 (如每 1 分鐘)。
- **Contact Point (聯繫點)**: 定義「報警發給誰」。
  - 支持 Email, Slack, Discord, PagerDuty, OpsGenie, Webhook 等。
- **Notification Policy (通知策略)**: 定義「路由規則」。
  - 類似 Alertmanager 的路由樹，根據標籤 (Labels) 決定將哪個告警發給哪個 Contact Point。
  - 例如：`severity="critical"` 發給 PagerDuty (打電話)，`severity="warning"` 發給 Slack。

### 2. Grafana Alerting vs Prometheus Alertmanager

這是架構設計時常見的選擇題：

| 特性 | Grafana Alerting | Prometheus Alertmanager |
| :--- | :--- | :--- |
| **數據源** | **多數據源支持** (Prometheus, Loki, SQL, CloudWatch 等) | 僅支持 Prometheus |
| **配置方式** | **UI 介面友好**，可視化配置 | YAML 配置文件 (適合 GitOps) |
| **可視化** | 直接在圖表上看到告警閾值線 | 無 (需配合 Grafana 展示) |
| **複雜度** | 較低，開箱即用 | 較高，需要獨立部署和維護 |
| **適用場景** | 團隊希望統一管理來自不同數據源的告警；偏好 UI 操作 | 深度依賴 Prometheus 生態；堅持 Infrastructure as Code |

### 3. 最佳實踐：混合模式

在大型企業中，通常採用 **混合模式**：

1. **基礎設施告警 (Infrastructure Alerts)**: 使用 **Prometheus Rules + Alertmanager**。
    - 例如：節點宕機、K8s Pod 重啟。
    - 原因：這些告警通常是標準化的，適合用代碼管理 (GitOps)，且不依賴 Grafana 的可用性。
2. **業務/應用告警 (Application Alerts)**: 使用 **Grafana Alerting**。
    - 例如：訂單量下跌、支付接口延遲。
    - 原因：業務指標可能來自 SQL 資料庫或 CloudWatch，且業務人員更喜歡在 Grafana UI 上調整閾值。

### 4. 告警狀態生命週期

1. **Normal**: 一切正常。
2. **Pending**: 閾值被突破，但持續時間還未達到 `For` 設定的時間 (防止抖動)。
3. **Firing**: 閾值被突破且持續了一段時間，觸發通知。
4. **Resolved**: 指標回到正常範圍，發送恢復通知。

## 程式碼範例

(無程式碼，僅為架構說明)
