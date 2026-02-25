# Incident Management & Postmortem (事故管理與事後檢討)

- **難度**: 7
- **標籤**: `SRE`, `Incident`, `Postmortem`, `Reliability`

## 問題詳述

當生產環境發生重大故障 (Outage) 時，應該如何應對？什麼是「不指責的事後檢討」(Blameless Postmortem)？如何確保同樣的錯誤不再發生？

## 核心理論與詳解

事故管理是 SRE (Site Reliability Engineering) 的核心實踐。

### 1. 事故回應生命週期 (Incident Response Lifecycle)

當警報響起時，應遵循標準流程：

1. **偵測 (Detection)**: 監控系統發出警報，或用戶回報。
2. **分類 (Triage)**: 判斷嚴重等級 (SEV1 - SEV4)。
3. **動員 (Mobilization)**: 指定 Incident Commander (IC)，召集相關人員。
4. **止血 (Mitigation)**: 首要目標是恢復服務，而非修復 Bug。例如：回滾 (Rollback)、切斷流量 (Circuit Breaking)、擴容。
5. **修復 (Resolution)**: 服務恢復後，進行根本性修復。

### 2. 不指責的事後檢討 (Blameless Postmortem)

事故結束後，必須撰寫 Postmortem 報告。

- **核心精神**: 假設每個人在當時的情境下，都做出了他們認為最好的決定。指責個人只會導致隱瞞錯誤。
- **關注流程與系統**: 問「為什麼系統允許這個錯誤發生？」，而不是「為什麼他犯了這個錯？」。

### 3. 根因分析 (Root Cause Analysis)

使用 **5 Whys** 方法挖掘深層原因。

- **範例**: 資料庫連線超時。
  - Why? 連線池滿了。
  - Why? 某個查詢佔用了連線太久。
  - Why? 該查詢沒有索引。
  - Why? 測試環境資料量太小，沒測出效能問題。
  - Why? **缺乏與生產環境資料量相當的 Staging 環境，且 CI 流程未包含效能測試。** (這是根本原因)

### 4. 關鍵指標 (Metrics)

- **MTTF (Mean Time To Failure)**: 平均故障間隔時間 (衡量穩定性)。
- **MTTR (Mean Time To Recovery)**: 平均修復時間 (衡量應變能力)。
- **RTO (Recovery Time Objective)**: 允許服務中斷多久。
- **RPO (Recovery Point Objective)**: 允許遺失多少資料。

## 程式碼範例

(此主題為軟實力，無程式碼範例)
