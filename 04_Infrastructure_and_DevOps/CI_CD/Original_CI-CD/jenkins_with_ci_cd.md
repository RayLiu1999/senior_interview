# Jenkins 與 CI/CD：核心概念、實踐與最佳做法

- **難度**: 6
- **重要程度**: 5
- **標籤**: `CI/CD`, `Jenkins`, `Pipeline`, `DevOps`, `Automation`

## 問題詳述

說明 Jenkins 在 CI/CD 流程中的角色、核心組件（Controller/Agent、Pipeline、Jenkinsfile）、與常見整合（VCS Webhook、Artifact、容器、雲端），並給出可靠、可維護的落地做法與風險控制要點。

## 核心理論與詳解

### 1) Jenkins 是什麼？

- 開源自動化伺服器，支援建置、測試、部署等自動化流程。
- 優勢：
  - 可擴充外掛生態（SCM、K8s、雲供應商、通知等）。
  - Pipeline as Code（Jenkinsfile）版本化、可審查。
  - 分散式 Agent 執行，彈性與隔離。
- 限制：自行維運成本、安全設定複雜、升級需驗證外掛相容性。

### 2) 架構與關鍵元件

- Controller（主節點）：負責排程、協調、UI、憑證/變數管理。
- Agent（工作節點）：執行工作負載（建置/測試/部署）。
- Pipeline：
  - Declarative/Scripted 兩種語法；
  - Stage/Step；
  - 並行與重試；
  - Credentials/Parameters；
  - Shared Libraries 跨專案復用邏輯。

### 3) 觸發方式與整合

- Webhook：GitHub/GitLab/Bitbucket 推送事件觸發建置；
- Poll SCM：定時輪詢（不推薦，僅限特殊情境）；
- 手動/排程：Release pipeline、夜間批次等。
- 產物管理：整合 Artifactory/Nexus/S3；版本化與不可變產物。
- 測試與品質：JUnit、SonarQube、SAST/DAST、SBOM/Supply Chain 掃描。

### 4) Pipeline 設計原則

- 明確分層：Build → Test → Package → Scan → Deploy → Verify → Notify；
- 失敗即停與清楚回饋（狀態、日誌、責任人通知）；
- 可重入/冪等：重試與回滾策略；
- 可配置：以參數/環境變數控制目標環境、版本、Feature Flags；
- 並行化：多平台/多版本測試並行；
- 快取：依語言工具（Go mod、Node、Maven）配置快取。

### 5) 安全與合規

- Principle of Least Privilege：細粒度權限；隔離 Controller 與 Agent；
- Credentials 管理：不硬編碼，使用 Credentials/Secret 管理；
- 升級與外掛審核：版本鎖定與測試環境驗證；
- 供應鏈安全：來源鎖定、簽章（Cosign）、Artifact 驗證；
- 稽核：審計日誌、變更記錄、合規報表（GDPR/SOX/ISO）。

### 6) 擴展與高可用

- 水平擴展：多 Agent 節點（VM、K8s 動態 Agent），工作負載隔離；
- 高可用（HA）：
  - 單控制平面 + 定期備份（最常見）；
  - 外掛 HA 解法有限，建議藉由基礎設施層（虛機/容器）提供冗餘；
  - Configuration as Code（JCasC）+ GitOps，快速重建。

### 7) 典型交付場景

- 後端服務（Go/Java）：
  - Build → Unit Test → Lint → Image Build → Scan → Push → Deploy（K8s）→ Smoke Test。
- 前端：
  - Build → Lint/Test → Bundle → Upload to CDN → Invalidate Cache。
- 資料與批次：
  - Build → Containerize → Schedule/Trigger → Metrics/Alerts。

### 8) Jenkins 與 Kubernetes

- 動態 Agent：以 `kubernetes` 外掛在 K8s 啟動 Pod 當 Agent，降低空閒資源成本；
- 產物：以 Docker BuildKit/kaniko 建影像；
- 部署：以 `kubectl`/Helm/ArgoCD 進行；推薦以 GitOps（Jenkins 觸發 PR/MR）交由 ArgoCD 同步，降低 Jenkins 對生產權限。

### 9) 版本與分支策略

- GitFlow / Trunk-based：
  - PR 檢查（CI）與主線/標籤發布（CD）；
  - Release 分支與 Hotfix；
- 版本：SemVer，標籤驅動發布；
- 環境：Dev/Staging/Prod 區隔，Promote 而非重建。

## 程式碼範例 (可選)

```go
// 僅用於說明：部署前檢查版本字串格式（Go）
func IsSemVer(s string) bool {
    r := regexp.MustCompile(`^v?\d+\.\d+\.\d+(-[0-9A-Za-z-.]+)?(\+[0-9A-Za-z-.]+)?$`)
    return r.MatchString(s)
}
```

> 提示：實務上 Jenkinsfile 才是管線定義主體；此處以 Go 範例輔助說明資料/版本驗證的輔助程式可如何被 Pipeline 調用。

## 總結

Jenkins 在 CI/CD 中的價值在於：以 Pipeline as Code 串起建置、測試、掃描、產物與部署流程；透過安全與擴展設計，建立可觀測、可回滾、可審計的交付系統。建議搭配動態 Agent、JCasC 與 GitOps 思維，降低維運風險與權限暴露。
