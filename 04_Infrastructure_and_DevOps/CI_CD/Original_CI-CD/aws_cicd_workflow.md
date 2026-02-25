# 常見 AWS CI/CD 部署流程 (Common AWS CI/CD Workflows)

- **難度**: 7
- **標籤**: `CI/CD`, `AWS`, `GitHub Actions`, `Docker`, `ECS`, `DevOps`

## 問題詳述

在面試中，當被問到「請描述一個你熟悉的 CI/CD 流程，特別是部署到 AWS 的架構」時，面試官通常希望聽到一個包含**自動化測試**、**容器化 (Docker)**、**映像檔管理 (ECR)** 以及**容器編排 (ECS/EKS)** 的現代化流程。請描述這個標準流程的各個階段。

## 核心理論與詳解

目前業界最主流的 AWS CI/CD 流程通常是基於 **容器化 (Containerization)** 的。以下以 **GitHub Actions + AWS ECS (Elastic Container Service)** 為例，這是最標準且高頻出現的面試答案。

### 1. 核心架構圖 (文字版)

```text
[開發者] -> (Push Code) -> [GitHub Repository]
                                |
                        (Trigger Webhook)
                                v
                        [GitHub Actions (CI Server)]
                                |
            +-------------------+-------------------+
            |                   |                   |
        1. 單元測試          2. 建置映像檔        3. 掃描與檢查
       (Unit Test)        (Docker Build)       (Lint/Security)
            |                   |                   |
            +-------------------+-------------------+
                                |
                        4. 推送映像檔 (Push Image)
                                v
                        [AWS ECR (Elastic Container Registry)]
                                |
                        5. 觸發部署 (Trigger Deploy)
                                v
                        [AWS ECS (Fargate/EC2)]
                                |
                        6. 滾動更新/藍綠部署
```

### 2. 詳細流程步驟

#### 第一階段：持續整合 (Continuous Integration, CI)

當開發者將程式碼 Push 到 `main` 分支或發起 Pull Request 時觸發：

1. **環境準備 (Checkout & Setup)**:
   - GitHub Actions Runner 啟動，拉取程式碼。
   - 設定語言環境 (如 Go, Python, Node.js)。
2. **程式碼品質檢查 (Linting & Static Analysis)**:
   - 執行 `golangci-lint`, `flake8`, `ESLint` 等工具。
   - 執行 `SonarQube` 進行靜態代碼分析 (Optional)。
3. **自動化測試 (Automated Testing)**:
   - 執行單元測試 (Unit Tests)。
   - 生成測試覆蓋率報告 (Coverage Report)。
   - **關鍵點**: 如果測試失敗，流程直接終止，阻止壞程式碼進入下一步。

#### 第二階段：交付與構建 (Continuous Delivery - Build)

測試通過後，開始打包應用程式：

1. **登入 AWS (Configure AWS Credentials)**:
   - 使用 OIDC (OpenID Connect) 或 Access Key (較不推薦) 登入 AWS。
2. **構建 Docker 映像檔 (Docker Build)**:
   - `docker build -t my-app:latest -t my-app:${GITHUB_SHA} .`
   - 通常會打兩個 Tag：`latest` 和 `Commit SHA` (用於版本回滾)。
3. **推送至倉庫 (Push to ECR)**:
   - 將構建好的 Image 推送到 AWS ECR (Elastic Container Registry)。

#### 第三階段：持續部署 (Continuous Deployment, CD)

映像檔準備好後，更新線上服務：

1. **更新任務定義 (Update Task Definition)**:
   - 下載現有的 ECS Task Definition。
   - 將 Image URI 更新為剛剛推送的新版本 (使用 Commit SHA)。
2. **部署到 ECS (Deploy to ECS)**:
   - 呼叫 AWS API 更新 ECS Service。
   - **滾動更新 (Rolling Update)**: ECS 會啟動新版本的 Task，健康檢查通過後，逐漸關閉舊版本的 Task，實現零停機部署 (Zero Downtime)。

### 3. 進階面試加分項

如果想在面試中脫穎而出，可以補充以下幾點：

#### A. 基礎設施即程式碼 (Infrastructure as Code, IaC)

- **提到 Terraform**: "我們不僅僅是部署 App，連 CI/CD 流程本身需要的 ECR Repo、ECS Cluster 都是用 Terraform 管理的。"
- 這展現了你對 DevOps 的全面理解。

#### B. 部署策略 (Deployment Strategies)

- **藍綠部署 (Blue/Green)**: 使用 AWS CodeDeploy，同時運行新舊版本，流量一次性切換。
- **金絲雀部署 (Canary)**: 先切 10% 流量給新版本，觀察錯誤率，沒問題再全量切換。

#### C. 安全性 (Security)

- **OIDC**: 強調使用 GitHub OIDC 連接 AWS，而不是在 GitHub Secrets 裡存長期的 AWS Access Keys (這是 AWS 官方推薦的最佳實踐)。
- **Image Scanning**: 在 Push 到 ECR 後，開啟 ECR Image Scanning 掃描漏洞。

## 程式碼範例 (GitHub Actions Workflow)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Amazon ECS

on:
  push:
    branches: [ "main" ]

env:
  AWS_REGION: ap-northeast-1
  ECR_REPOSITORY: my-backend-repo
  ECS_SERVICE: my-backend-service
  ECS_CLUSTER: my-cluster

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v3

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1

    - name: Build, tag, and push image to Amazon ECR
      id: build-image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

    - name: Download task definition
      run: |
        aws ecs describe-task-definition --task-definition my-task-def --query taskDefinition > task-definition.json

    - name: Fill in the new image ID in the Amazon ECS task definition
      id: task-def
      uses: aws-actions/amazon-ecs-render-task-definition@v1
      with:
        task-definition: task-definition.json
        container-name: my-app-container
        image: ${{ steps.build-image.outputs.image }}

    - name: Deploy Amazon ECS task definition
      uses: aws-actions/amazon-ecs-deploy-task-definition@v1
      with:
        task-definition: ${{ steps.task-def.outputs.task-definition }}
        service: ${{ env.ECS_SERVICE }}
        cluster: ${{ env.ECS_CLUSTER }}
        wait-for-service-stability: true
```
