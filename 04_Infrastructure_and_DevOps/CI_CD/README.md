# CI/CD (持續整合與持續部署)

CI/CD 是現代軟體開發的核心工程實踐，涵蓋從程式碼提交到生產部署的完整自動化流程。作為資深後端工程師，您需要深入理解主流 CI/CD 工具鏈（GitHub Actions、Jenkins、GitLab CI）、部署策略（藍綠部署、金絲雀發布）、以及現代 GitOps 與功能旗標等進階實踐。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [什麼是 CI/CD？核心概念是什麼？](./Original_CI-CD/what_is_ci_cd.md) | 5 | 5 | `CI/CD`, `DevOps`, `Automation` |
| 2 | [Jenkins 與 CI/CD：核心概念、實踐與最佳做法](./Original_CI-CD/jenkins_with_ci_cd.md) | 6 | 4 | `CI/CD`, `Jenkins`, `Pipeline`, `DevOps` |
| 3 | [常見 AWS CI/CD 部署流程](./Original_CI-CD/aws_cicd_workflow.md) | 7 | 4 | `CI/CD`, `AWS`, `GitHub Actions`, `ECS` |
| 4 | [常見的部署策略：藍綠、金絲雀、滾動更新](./deployment_strategies.md) | 7 | 5 | `CI/CD`, `Deployment`, `Blue-Green`, `Canary` |
| 5 | [GitHub Actions 工作流程設計](./github_actions_ci.md) | 6 | 5 | `CI/CD`, `GitHub Actions`, `Workflow`, `DevOps` |
| 6 | [GitOps 原則與 ArgoCD 實踐](./gitops_principles.md) | 7 | 4 | `CI/CD`, `GitOps`, `ArgoCD`, `Kubernetes` |
| 7 | [功能旗標 (Feature Flags) 與漸進式發布](./feature_flags.md) | 6 | 4 | `CI/CD`, `Feature Flags`, `Canary`, `Progressive Delivery` |

---

## 學習建議

1. **掌握 CI/CD 核心概念**：理解持續整合（CI）、持續交付（CD）、持續部署的差異，並能解釋各自的業務價值。
2. **熟悉主流工具**：GitHub Actions 是目前最高頻的考察點；Jenkins 在大型企業仍廣泛使用。
3. **理解部署策略的權衡**：藍綠、金絲雀、滾動更新各有適用場景，要能分析在不同業務需求下如何選擇。
4. **學習 GitOps 思維**：以 Git 為唯一事實來源（Single Source of Truth），用 Pull-based 模式進行部署，是 Kubernetes 環境的最佳實踐。
5. **關注安全**：Secret 管理、最小權限原則、SAST/DAST 安全掃描是 CI/CD Pipeline 的重要環節。
