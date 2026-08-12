# Incident Management Process (事故管理流程)

- **難度**: 6
- **重要程度**: 4
- **標籤**: `On-Call`, `SRE`, `Process`, `Incident`

## 問題詳述

當生產環境發生重大事故 (Sev-1/Sev-2) 時，混亂是最大的敵人。請描述一個標準的事故響應流程 (Incident Response Process)，以及各個角色的職責 (IC, Scribe, Ops)。

### 測驗對應

- **Concept ID**: `concept.observability.incident.management-process`
- **Learning Objectives**:
  - `LO-1`: 能以 Detection、Triage、Mobilization、Mitigation、Resolution 與復盤描述事故生命週期。
  - `LO-2`: 能分配 IC、Ops、Comms、Scribe 等角色，維持時間線、決策紀錄與安全變更邊界。
  - `LO-3`: 能依使用者影響、SLO、回滾風險與證據品質決定止損順序，並驗證服務已恢復。
- **Prerequisites**: [告警策略設計最佳實踐](../alerting_strategy.md)、[SLI、SLO、SLA 與錯誤預算](../sli_slo_sla.md)
- **Quick Quiz**: [Observability Q20](../../../QUIZ/10_Observability.md#q20)
- **Hard Assessment**: [可觀測性與交付訊號事故診斷](../../../QUIZ/Hard_Assessments/observability_delivery_signal_incident.md) (`assessment.observability.delivery-signal.incident.v1`)
- **Assessment Gate**: 完成 Hard Assessment 中對應的 `LO-1`～`LO-3`，並達到總分 3/4；若未達標，回讀本文後重測。

## 核心理論與詳解

事故管理的核心目標是：**盡快恢復服務 (MTTR - Mean Time To Recover)**，而不是在事故中尋找根因 (Root Cause)。根因分析是事後 (Post-mortem) 做的事。

### 1. 核心角色 (Roles)

在事故處理中，必須明確分工，避免「三個和尚沒水喝」或「所有人都在敲鍵盤」。

1. **Incident Commander (IC - 事故指揮官)**:
    - **職責**: 擁有最高指揮權。負責協調資源、決策 (如是否回滾、是否切換流量)、對外溝通。
    - **原則**: IC **不應該** 親自去查日誌或寫代碼。他需要保持清醒的頭腦來掌控全局。
2. **Operations Lead (Ops - 操作負責人)**:
    - **職責**: 實際執行修復操作的人 (如重啟服務、修改配置)。
    - **原則**: 聽從 IC 的指令，並及時反饋操作結果。
3. **Communications Lead (Comms - 溝通負責人)**:
    - **職責**: 負責對內 (客服、管理層) 和對外 (用戶、Twitter) 發布公告。
    - **原則**: 讓技術人員專注修復，避免被「什麼時候好？」的詢問打斷。
4. **Scribe (記錄員)**:
    - **職責**: 記錄時間線 (Timeline)。誰在幾點做了什麼操作？觀測到了什麼現象？
    - **原則**: 這是事後復盤 (Post-mortem) 最重要的素材。

### 2. 事故生命週期 (Lifecycle)

1. **Detection (發現)**:
    - 監控告警觸發，或客服收到大量投訴。
2. **Triage (分診)**:
    - 判斷事故等級 (Severity Level)。
    - **SEV-1**: 核心業務完全不可用 (如無法支付)。需要立即喚醒所有相關人員。
    - **SEV-2**: 核心業務部分受損，或非核心業務不可用。
    - **SEV-3**: 輕微影響，可等到工作時間處理。
3. **Mobilization (動員)**:
    - 建立 War Room (Slack Channel 或 Zoom)。
    - 指定 IC。
4. **Mitigation (止損)**:
    - **這是最重要的階段**。目標是讓服務恢復，而不是修復 Bug。
    - 常見手段：**回滾 (Rollback)**、**熔斷 (Circuit Breaking)**、**降級 (Degradation)**、**擴容 (Scale Out)**。
5. **Resolution (解決)**:
    - 服務恢復正常，結束事故狀態。
6. **Post-mortem (復盤)**:
    - 事故結束後 24-48 小時內進行。撰寫事故報告，制定改進措施 (Action Items)。

### 3. 黃金法則

- **Don't Panic**: 保持冷靜。
- **Over-communicate**: 在 War Room 中把你的想法、操作、發現都寫出來，不要默默做事。
- **One Commander**: 只有一個聲音。如果有分歧，IC 拍板。

## 程式碼範例

(無程式碼，僅為流程說明)
