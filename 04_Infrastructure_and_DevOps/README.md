# 基礎設施與 DevOps (Infrastructure and DevOps)

本章節涵蓋現代後端工程師必備的基礎設施與 DevOps 核心知識，包括持續整合/持續部署（CI/CD）、雲端運算、容器化與容器編排，以及系統可觀測性。這些知識是資深後端工程師與 DevOps/SRE 職位面試的高頻考察範疇。

## 章節索引

| 章節 | 說明 | 核心主題 |
| :--- | :--- | :--- |
| [CI/CD](./CI_CD/README.md) | 持續整合與持續部署 | GitHub Actions, Jenkins, GitOps, 部署策略, Feature Flags |
| [Cloud Computing](./Cloud_Computing/README.md) | 雲端運算 | IaaS/PaaS/SaaS, AWS 核心服務, Serverless, 12-Factor App |
| [Containerization and Orchestration](./Containerization_and_Orchestration/) | 容器化與容器編排 | Docker, Kubernetes |
| [Observability](./Observability/README.md) | 可觀測性 | Metrics, Logging, Tracing, Prometheus, Grafana, Jaeger |

---

## 學習建議

1. **容器化是基礎**：在學習 Kubernetes 之前，務必先深入理解 Docker 的核心概念（映像層、網路、儲存卷），這是現代部署的基石。

2. **CI/CD 工具鏈**：GitHub Actions 是目前面試考察最頻繁的工具；同時理解 GitOps 思維（以 Git 為唯一事實來源）對理解現代 CD 實踐至關重要。

3. **Kubernetes 架構優先**：Kubernetes 知識量龐大，建議先掌握核心架構（Pod、Service、Deployment、ConfigMap/Secret），再深入 Networking、Storage、RBAC 等進階主題。

4. **可觀測性三支柱**：Metrics（Prometheus）、Logging（ELK/Loki）、Tracing（Jaeger）是 SRE 和後端工程師面試的高頻考察點，要能解釋三者的差異與互補性。

5. **雲端服務概念**：即使不是 AWS 專家，也要理解 IaaS/PaaS/SaaS 的抽象層次差異，以及 Serverless 的適用場景和限制。
