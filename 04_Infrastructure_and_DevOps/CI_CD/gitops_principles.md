# GitOps 原則與 ArgoCD 實踐

- **難度**: 7
- **重要程度**: 4
- **標籤**: `CI/CD`, `GitOps`, `ArgoCD`, `Kubernetes`, `DevOps`

## 問題詳述

GitOps 是一種以 Git 作為基礎設施和應用部署**唯一事實來源（Single Source of Truth）**的運維模式。透過 Git 來宣告式（Declaratively）管理基礎設施和應用的期望狀態，並由自動化工具持續確保實際狀態與期望狀態一致。ArgoCD 是目前最主流的 GitOps 工具之一。

## 核心理論與詳解

### GitOps 的四大核心原則

WeaveWorks（GitOps 的提出者）定義了 GitOps 的四個核心原則：

**1. 宣告式（Declarative）**
整個系統的期望狀態必須以宣告式方式描述（如 Kubernetes YAML、Terraform HCL），不是描述「如何達到」，而是描述「最終應該是什麼樣子」。

**2. 版本化與不可變（Versioned and Immutable）**
期望狀態儲存在 Git 中，所有變更都有完整的版本歷史、提交記錄和作者資訊。這使得每次變更都可審計、可追溯、可回滾。

**3. 自動拉取（Pulled Automatically）**
軟體代理（如 ArgoCD）自動輪詢 Git 倉庫，偵測變化後**自動拉取（Pull）**新配置並應用，而不是由 CI/CD Pipeline 主動**推送（Push）**到生產環境。

**4. 持續調合（Continuously Reconciled）**
自動化代理持續比較叢集的「實際狀態」與 Git 中的「期望狀態」，若兩者出現偏差（Drift），自動觸發調合（Reconciliation）使其一致。

### GitOps vs 傳統 CI/CD Push 模式

```
傳統 Push 模式（CI/CD Pipeline 推送）:
Code → Git Push → CI Build → [CI Pipeline 直接 kubectl apply] → K8s Cluster

問題：
- CI 系統需要生產環境的直接訪問憑證（安全風險）
- 環境實際狀態可能被人工 kubectl 修改而不被追蹤（配置漂移）
- 部署歷史不在 Git 中，難以審計

GitOps Pull 模式:
Code → Git Push → CI Build → [更新 Manifest Repo 的 Image Tag]
                                          ↓
                              ArgoCD 偵測到 Git 變化
                                          ↓
                              ArgoCD 從叢集內部 Pull → 應用更新
```

**核心優勢：**
- **安全性提升**：生產環境憑證不再需要暴露給 CI 系統
- **防止配置漂移**：GitOps Controller 持續調合，任何人工修改都會被自動復原
- **完整審計追蹤**：每次生產變更都對應一筆 Git Commit
- **一鍵回滾**：回滾只需 `git revert`，ArgoCD 自動應用

### ArgoCD 架構

ArgoCD 是一個宣告式的 Kubernetes GitOps 持續交付工具，執行在 Kubernetes 叢集內部。

**核心元件：**
```
                Git Repo (Manifest)
                      ↑ Pull
┌─────────────────────────────────────────────┐
│         Kubernetes Cluster（ArgoCD 所在）   │
│                                             │
│  ┌──────────────┐   ┌───────────────────┐   │
│  │  Application │   │   Repo Server:    │   │
│  │  Controller  │ ← │   解析 Helm/Kustomize│  │
│  │  (Reconcile) │   └───────────────────┘   │
│  └──────────────┘                           │
│         ↓ kubectl apply                     │
│  ┌──────────────────────────────────────┐   │
│  │    Target Applications (Deployments) │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**定義一個 ArgoCD Application：**

```yaml
# argocd-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/my-org/k8s-manifests.git
    targetRevision: HEAD
    path: apps/my-app/overlays/production  # Kustomize overlay 路徑
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true    # 自動刪除 Git 中已移除的資源
      selfHeal: true # 自動調合手動修改（防止漂移）
    syncOptions:
    - CreateNamespace=true
```

### Monorepo vs Multi-Repo 策略

GitOps 中有兩種常見的倉庫組織方式：

| 方式 | 說明 | 優點 | 缺點 |
| :--- | :--- | :--- | :--- |
| **App Repo + Manifest Repo（推薦）** | 應用程式碼與 K8s Manifest 分開存放 | 職責清晰，CI 由 App Repo 觸發，CD 由 Manifest Repo 驅動 | 需要管理兩個倉庫 |
| **Monorepo** | 所有程式碼和 Manifest 在同一倉庫 | 變更追蹤集中 | Manifest 更新觸發不必要的 CI Build |

**推薦的雙倉庫 CI/CD 流程：**
```
1. 開發者推送程式碼 → App Repo
2. CI Pipeline 建構並推送 Docker Image（tag: git SHA）
3. CI Pipeline 更新 Manifest Repo 中的 image tag
4. ArgoCD 偵測到 Manifest Repo 變更
5. ArgoCD 自動同步到 Kubernetes 叢集
```

### 漸進式交付（Progressive Delivery）

GitOps + Argo Rollouts 可以實現更進階的交付策略：

```yaml
# Argo Rollouts：金絲雀部署策略
apiVersion: argoproj.io/v1alpha1
kind: Rollout
spec:
  strategy:
    canary:
      steps:
      - setWeight: 5    # 先導 5% 流量
      - pause: {duration: 10m}  # 暫停 10 分鐘，觀察指標
      - setWeight: 50   # 提升到 50%
      - pause: {duration: 20m}
      - setWeight: 100  # 全量
      analysis:
        templates:
        - templateName: error-rate  # 若錯誤率超標，自動回滾
```

### 其他主流 GitOps 工具

| 工具 | 特點 |
| :--- | :--- |
| **ArgoCD** | 功能豐富、WebUI 友好、CNCF 畢業項目；最廣泛使用 |
| **Flux CD** | 更輕量、CLI 為主、與 Helm/Kustomize 整合佳 |
| **Jenkins X** | 結合了 CI/CD + GitOps，適合複雜的多雲場景 |
