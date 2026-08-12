# CI/CD - 重點考題 (Quick Quiz)

> 這份考題聚焦交付流程、品質閘門、漸進式發布、Feature Flag、GitHub Actions 與 GitOps。

## 🚀 Safe Delivery

<a id="q1"></a>
### Q1: CI、Continuous Delivery 與 Continuous Deployment 有什麼差異？
<!-- Concept ID: concept.cicd.pipeline.delivery-fundamentals; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請從 commit、test、artifact、promotion、production release 與人工核准說明三者的責任邊界。

<details>
<summary>💡 答案提示</summary>

- CI 關注頻繁整合、建置與測試；Continuous Delivery 讓可發布 artifact 隨時通過驗證，但 production 可能仍需核准；Continuous Deployment 通過閘門後自動發布。
- 應建立 immutable artifact，依同一 digest 逐環境 promotion，避免每個環境重新 build 出不同內容。
- 發布速度不應犧牲測試、scan、回滾與 production health evidence。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/CI_CD/Original_CI-CD/what_is_ci_cd.md)

<a id="q2"></a>
### Q2: Rolling、Blue-Green 與 Canary 應如何選擇？
<!-- Concept ID: concept.cicd.delivery.deployment-strategies; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較容量成本、流量控制、回滾速度、資料庫相容性與可觀測閘門。

<details>
<summary>💡 答案提示</summary>

- Rolling 逐步替換、容量成本較低但回滾與版本混跑需小心；Blue-Green 保留兩套環境、切換快但成本高；Canary 以小流量驗證、風險低但需要可靠的切流和指標。
- 任何策略都要定義停止條件、錯誤率／延遲／業務指標、schema compatibility 與 rollback runbook。
- 「部署成功」不等於「發布健康」；要驗證真實流量與版本切片。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/CI_CD/deployment_strategies.md)

<a id="q3"></a>
### Q3: Feature Flag 如何支援漸進式發布，又如何避免技術債？
<!-- Concept ID: concept.cicd.delivery.feature-flags; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明 flag type、targeting、kill switch、審計、owner 與移除策略。

<details>
<summary>💡 答案提示</summary>

- Release flag 控制功能曝光，experiment flag 支援實驗，ops flag 影響運維行為；不同類型要有不同 TTL、owner 與審批。
- Flag evaluation 必須可觀測，能依版本、租戶、地區與 exposure 對照錯誤率與業務指標。
- Kill switch 是緩解手段，不是取代 rollback；過期 flag 應被追蹤並移除，避免條件分支永久增加。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/CI_CD/feature_flags.md)

<a id="q4"></a>
### Q4: GitHub Actions pipeline 如何設計可靠的 Quality Gate？
<!-- Concept ID: concept.cicd.pipeline.github-actions-quality-gates; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請從 workflow、job、artifact、環境權限、測試、scan 與 secret 管理說明設計。

<details>
<summary>💡 答案提示</summary>

- 將 lint、unit、integration、security scan 與 build 拆成可平行 job，使用 immutable artifact 傳遞結果。
- 使用最小 GITHUB_TOKEN 權限、protected environment、OIDC／短期憑證，避免在 log 洩漏 secret。
- Quality gate 必須是 promotion 的必要條件，失敗時保留可追溯 log、test report、SBOM 與 artifact digest。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/CI_CD/github_actions_ci.md)

<a id="q5"></a>
### Q5: GitOps 的 drift、sync 與 rollback 如何診斷？
<!-- Concept ID: concept.cicd.delivery.gitops-drift-reconciliation; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 desired state、actual state、reconciliation、人工 hotfix 與安全回復的關係。

<details>
<summary>💡 答案提示</summary>

- Git 是 desired state 的來源；controller 持續比較並 reconcile。Production 手動修改造成 drift，若沒有審計與 policy，可能被自動覆蓋或產生不一致。
- 回復應以 Git revert／已驗證 artifact 為主，緊急 hotfix 要留下 incident record 與後續回寫 Git 的計畫。
- 查 sync status、diff、controller events、commit／image digest、health 與版本切片，不只看 repository pipeline 是否綠燈。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/CI_CD/gitops_principles.md)
