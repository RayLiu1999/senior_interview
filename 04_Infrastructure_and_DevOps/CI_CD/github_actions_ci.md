# GitHub Actions 工作流程設計

- **難度**: 6
- **重要程度**: 5
- **標籤**: `CI/CD`, `GitHub Actions`, `Workflow`, `DevOps`, `YAML`

## 問題詳述

GitHub Actions 是 GitHub 原生的 CI/CD 平台，允許在 GitHub 倉庫中定義自動化工作流程（Workflow）。它是目前業界最廣泛使用的 CI/CD 工具之一，在面試中高頻考察其核心概念、Workflow 設計，以及 Secret 管理與安全實踐。

## 核心理論與詳解

### 核心概念層次結構

```
Workflow（工作流程）
  └── Job（工作，可並行）
        └── Step（步驟，順序執行）
              └── Action（可重用動作）
```

- **Workflow**：由 `.github/workflows/*.yml` 定義，由事件觸發
- **Job**：在一個 Runner（執行環境）上執行的步驟集合；多個 Job 預設並行執行
- **Step**：Job 中的單一任務，可以是 shell 命令或 Action
- **Action**：可重用的組件，可來自 GitHub Marketplace 或自行撰寫

### 觸發事件（Triggers）

```yaml
on:
  push:
    branches: [ main, 'release/**' ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * 1'   # 每週一凌晨 2 點
  workflow_dispatch:        # 支援手動觸發
    inputs:
      environment:
        description: '部署環境'
        required: true
        default: 'staging'
```

### 一個完整的 CI/CD Workflow 範例

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  # ── Job 1: 測試與靜態分析（CI 階段）──
  test:
    name: Test & Lint
    runs-on: ubuntu-latest
    # 矩陣構建：同時測試多個 Go 版本
    strategy:
      matrix:
        go-version: ['1.21', '1.22']
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Go ${{ matrix.go-version }}
        uses: actions/setup-go@v5
        with:
          go-version: ${{ matrix.go-version }}
          cache: true  # 快取 Go 模組，提升速度

      - name: Download dependencies
        run: go mod download

      - name: Run linter
        uses: golangci/golangci-lint-action@v6
        with:
          version: latest

      - name: Run tests with coverage
        run: go test -v -race -coverprofile=coverage.out ./...

      - name: Upload coverage report
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage.out

  # ── Job 2: 建構 Docker 映像（依賴 test）──
  build:
    name: Build & Push Docker Image
    needs: test  # 僅在 test 成功後執行
    runs-on: ubuntu-latest
    # 僅在推送到 main branch 時執行（PR 不觸發）
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write  # 需要寫入 GitHub Container Registry
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}  # 內建 Secret，無需手動設定

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha  # 使用 GitHub Actions 快取加速 Docker Build
          cache-to: type=gha,mode=max

  # ── Job 3: 部署到 Staging（依賴 build）──
  deploy-staging:
    name: Deploy to Staging
    needs: build
    runs-on: ubuntu-latest
    environment: staging  # 配置 Environment（支援審核 Protection Rules）
    steps:
      - name: Deploy to Kubernetes
        run: |
          echo "Deploying ${{ github.sha }} to staging..."
          # kubectl set image deployment/app app=ghcr.io/${{ github.repository }}:${{ github.sha }}
        env:
          KUBECONFIG: ${{ secrets.STAGING_KUBECONFIG }}
```

### Secret 管理最佳實踐

GitHub Actions 提供多個層級的 Secret 管理：

| 層級 | 範圍 | 用途 |
| :--- | :--- | :--- |
| **Repository Secret** | 單個倉庫 | 大多數情況的首選 |
| **Environment Secret** | 特定環境（staging/production）| 生產環境的敏感憑證 |
| **Organization Secret** | 組織內所有倉庫 | 共用的基礎設施金鑰 |
| **`GITHUB_TOKEN`** | 自動提供 | GitHub API、Container Registry 操作 |

**重要安全原則：**
- Secret 在日誌中自動遮罩（masked），但不要在 shell 中 `echo` Secret 值
- 使用 **環境（Environment）** 為 Production 部署設定手動審核（Required Reviewers）
- 遵循**最小權限原則**，使用 `permissions` 明確限制 GITHUB_TOKEN 的權限

### 進階功能

**1. 可重用工作流程（Reusable Workflows）**

```yaml
# 呼叫方：.github/workflows/deploy.yml
jobs:
  call-deploy:
    uses: my-org/.github/.github/workflows/deploy-template.yml@main
    with:
      environment: production
    secrets: inherit  # 傳遞所有 Secret
```

**2. 工件（Artifacts）傳遞**

在 Job 之間傳遞構建產物（如測試報告、二進制文件）：

```yaml
# Job 1 上傳
- uses: actions/upload-artifact@v4
  with:
    name: coverage-report
    path: coverage.out

# Job 2 下載
- uses: actions/download-artifact@v4
  with:
    name: coverage-report
```

**3. 並行與依賴控制**

```yaml
jobs:
  unit-test:    # 並行執行
  lint:         # 並行執行
  integration:
    needs: [unit-test, lint]  # 等待兩者完成
  deploy:
    needs: integration
```

### GitHub Actions vs 其他 CI/CD 工具

| 維度 | GitHub Actions | GitLab CI | Jenkins |
| :--- | :--- | :--- | :--- |
| **整合性** | 與 GitHub 原生整合 | 與 GitLab 原生整合 | 需額外配置 |
| **Runner** | GitHub 託管 + 自託管 | GitLab 託管 + 自託管 | 自行管理 |
| **生態系統** | GitHub Marketplace（大量 Action）| 較小 | 龐大的 Plugin 生態 |
| **私有化部署** | GitHub Enterprise | GitLab Self-Managed | 完全自行部署 |
| **學習曲線** | 低 | 中 | 高 |
