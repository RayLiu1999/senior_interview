# 安全交付 Pipeline 事故診斷：從品質閘門到 GitOps 回復

- **Assessment ID**: `assessment.cicd.safe-delivery.pipeline-incident.v1`
- **主要 Concept ID**: `concept.cicd.pipeline.delivery-fundamentals`
- **次要 Concept IDs**:
  - `concept.cicd.delivery.deployment-strategies`
  - `concept.cicd.delivery.feature-flags`
  - `concept.cicd.pipeline.github-actions-quality-gates`
  - `concept.cicd.delivery.gitops-drift-reconciliation`
- **對應文章**:
  - [CI/CD 核心概念](../../04_Infrastructure_and_DevOps/CI_CD/Original_CI-CD/what_is_ci_cd.md)
  - [部署策略](../../04_Infrastructure_and_DevOps/CI_CD/deployment_strategies.md)
  - [Feature Flags](../../04_Infrastructure_and_DevOps/CI_CD/feature_flags.md)
  - [GitHub Actions](../../04_Infrastructure_and_DevOps/CI_CD/github_actions_ci.md)
  - [GitOps](../../04_Infrastructure_and_DevOps/CI_CD/gitops_principles.md)
- **題型**: `故障診斷`, `發布設計`, `供應鏈治理`, `回復取捨`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 35 分鐘
- **標籤**: `CI/CD`, `Canary`, `Feature Flag`, `GitOps`, `Artifact`, `Rollback`, `Quality Gate`
- **Learning Objective IDs**:
  - `concept.cicd.pipeline.delivery-fundamentals/LO-1`
  - `concept.cicd.pipeline.delivery-fundamentals/LO-2`
  - `concept.cicd.pipeline.delivery-fundamentals/LO-3`
  - `concept.cicd.delivery.deployment-strategies/LO-1`
  - `concept.cicd.delivery.deployment-strategies/LO-2`
  - `concept.cicd.delivery.deployment-strategies/LO-3`
  - `concept.cicd.delivery.feature-flags/LO-1`
  - `concept.cicd.delivery.feature-flags/LO-2`
  - `concept.cicd.delivery.feature-flags/LO-3`
  - `concept.cicd.pipeline.github-actions-quality-gates/LO-1`
  - `concept.cicd.pipeline.github-actions-quality-gates/LO-2`
  - `concept.cicd.pipeline.github-actions-quality-gates/LO-3`
  - `concept.cicd.delivery.gitops-drift-reconciliation/LO-1`
  - `concept.cicd.delivery.gitops-drift-reconciliation/LO-2`
  - `concept.cicd.delivery.gitops-drift-reconciliation/LO-3`

## 測驗目標

- 能從 pipeline、artifact、deployment、flag、GitOps controller 與 production metrics 建立完整發布事故時間線。
- 能設計 immutable artifact、quality gate、canary／blue-green／rolling 策略與可觀測的自動停止條件。
- 能處理 Feature Flag 誤開、GitOps drift、schema 相容性、供應鏈風險與 rollback 的邊界。
- 能用版本、digest、commit、exposure、錯誤率、延遲與業務正確性證據驗證恢復。

## 問題情境與限制條件

某支付 API 由 GitHub Actions 建置後，透過 registry 將 image promotion 到 staging，再由 ArgoCD 部署 production。團隊最近把測試拆成平行 job，加入 canary 與 Feature Flag；兩小時後發生事故：

- Pipeline 顯示綠燈，但 integration test job 因設定錯誤被標為 optional；同一 tag 在不同環境重新 build，production digest 與 staging 不同。
- Canary 只承受 5% 流量，HTTP error rate 正常，但支付成功率下降 1.2%，P99 latency 上升 40%。Flag targeting 依 user ID，dashboard 沒有將 exposure、版本與業務結果關聯。
- On-call 直接在 production 修改 Deployment image 與 flag；ArgoCD 顯示 OutOfSync，數分鐘後 reconciliation 將 image 改回 Git 中的舊 digest，造成部分請求在兩個版本間切換。
- GitHub Actions token 權限過大，build log 曾輸出一段可疑 secret；artifact 沒有 SBOM、signature 或 provenance policy。團隊想直接重新跑 pipeline、全量關閉 flag，並刪除 drift。

限制：不能只以「重新部署」或「回滾 commit」作答；必須保留事故證據、處理可能暴露的 secret、避免重複支付，並說明何時能恢復流量。

## 作答要求

1. **建立時間線與影響範圍**：依 commit、workflow run、test result、artifact digest、promotion、deployment、flag exposure 與 production metrics 重建事故。
2. **判斷品質閘門**：指出 pipeline 為何會在 integration test 未真正通過時綠燈，設計必要 gate、artifact promotion 與 environment permission。
3. **設計發布與回復**：選擇 canary、blue-green 或 rolling 的後續策略，定義停止、rollback、flag kill switch、schema 相容與支付冪等條件。
4. **處理 GitOps drift**：說明緊急 hotfix、Git revert、controller reconciliation、image digest 與手動狀態如何重新對齊，避免反覆覆寫。
5. **處理供應鏈與 secret**：列出 token rotation、least privilege、SBOM、signature、provenance、依賴掃描與 artifact retention 的修復門檻。
6. **驗證修復**：提出至少八項指標或故障注入測試，涵蓋 pipeline gate、artifact identity、canary、flag、GitOps drift、rollback 與業務正確性。

## 期待證據

- 能指出 optional／未執行的 integration test 不應被視為 quality gate 通過；pipeline 綠燈只代表 workflow 結束，不代表 artifact 可安全發布。
- 能使用 immutable digest promotion，禁止不同環境重新 build；測試、SBOM、scan、signature 與 provenance 應綁定同一 artifact。
- 能用業務 SLI（支付成功率）識別 canary 回歸，即使 HTTP error rate 正常；flag exposure 必須可切片追蹤。
- 能把 GitOps drift 視為 desired／actual state 不一致，緊急修改要可審計並回寫 Git；不能直接刪除 drift 或讓 controller 和 on-call 互相覆寫。
- 能把疑似 secret 暴露視為 credential incident，先撤銷／輪替，再檢查 artifact、log retention 與存取紀錄。
- 能說明 rollback 不只切回 image，也要檢查 schema、flag、queue／event compatibility、支付冪等與已產生的外部副作用。
- 觀測至少包括 workflow success／skipped gate、artifact digest、deployment revision、flag exposure、canary SLI、sync status、drift age、rollback time 與 payment correctness。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 方案會在未驗證 artifact 或已暴露 secret 的情況下繼續全量發布，且無法處理版本切換與 GitOps drift。 |
| 1 | 能列出 CI、canary、flag、GitOps 等名詞，但沒有不可變 artifact、quality gate、業務 SLI 或回復順序。 |
| 2 | 能提出部分 gate 或 rollback 方案，但遺漏 secret incident、flag exposure、schema／副作用相容性或 drift reconciliation 中至少一項。 |
| 3 | 能完成可執行的 pipeline gate、digest promotion、漸進發布、flag／GitOps 回復與 secret remediation，並用指標驗證。 |
| 4 | 除上述內容外，能量化 rollout stop criteria，處理已發生的支付副作用與 audit evidence，設計可重放的修復流程並明確說明速度、可用性與治理成本。 |

### 通過標準

總分達 **3/4 分**才通過；quality／artifact gate、progressive delivery／business SLI、GitOps／security recovery 三個核心面向均不得低於 2 分。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先停止擴大 canary、保留 workflow／controller／flag／payment 證據，將支付 API 轉為安全降級或有限流量。HTTP 錯誤率正常不能推翻支付成功率下降；應依 exposure、版本、artifact digest、request trace 與 payment operation ID 切片。optional integration test、不同環境重新 build、無 SBOM／signature 與疑似 secret 都是 promotion blocker。

短期固定已知良好 digest，使用受控 canary 或 blue-green 回到驗證過的 artifact；flag kill switch 只作快速隔離，不能取代 rollback。若 schema／event 不向後相容，先處理相容窗口再切換。緊急 production hotfix 必須留下 incident change，之後以 Git commit／pull request 回寫 desired state，讓 ArgoCD reconciliation 回到單一來源，而不是刪除 drift。

安全面先撤銷／輪替疑似 token，檢查 log、artifact 與 registry 存取；GitHub token 只給必要權限，使用 protected environment、OIDC／短期憑證。對同一 digest 產生 SBOM、scan、signature 與 provenance，將它們作為 artifact promotion gate。恢復後驗證 canary payment success、P99、error rate、flag exposure、deployment revision、ArgoCD sync、drift age、rollback time 與重複支付／對帳結果。

</details>

## 常見失分點

- 把 workflow 綠燈當成所有測試與 artifact 都可信，忽略 optional gate 與環境重新 build。
- 只看 HTTP 5xx，不看支付成功率、業務正確性與 flag exposure。
- 直接在 production 改狀態後刪除 drift，沒有把緊急變更回寫 Git。
- 只回滾 image，沒有檢查 schema、event、flag、外部支付副作用與冪等。
- 發現 secret 出現在 log 後只刪 log，不做 token rotation、權限稽核與 artifact 清理。

## 延伸追問

1. 如果資料庫 migration 已在新版本執行，如何設計可逆或 expand／contract migration 讓 rollback 安全？
2. 如果 canary 的支付成功率下降只出現在某個 tenant，如何設計 flag 與指標切片避免全量回滾？
3. 如果 ArgoCD controller 本身故障，如何在保留 GitOps 原則下執行一次性 emergency recovery？
4. 如果簽章服務 unavailable，但 production 有緊急安全修補，你會如何設計例外審批、期限與事後補證？
