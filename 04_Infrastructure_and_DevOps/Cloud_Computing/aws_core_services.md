# AWS 核心服務概覽（EC2, ECS, Lambda, S3, RDS, SQS, CloudFront）

- **難度**: 6
- **重要程度**: 5
- **標籤**: `AWS`, `EC2`, `ECS`, `Lambda`, `S3`, `RDS`, `SQS`, `CloudFront`

## 問題詳述

AWS（Amazon Web Services）是目前市場佔有率最高的雲平台，提供超過 200 項服務。了解 AWS 的核心服務及其使用場景，是現代後端工程師的必備技能。本文重點介紹七個最核心的服務：EC2、ECS、Lambda、S3、RDS、SQS 和 CloudFront。

## 核心理論與詳解

### AWS 服務全景

AWS 服務可以分為以下幾大類：

```
計算服務：EC2, ECS, Lambda, EKS, Fargate
儲存服務：S3, EBS, EFS, Glacier
資料庫：RDS, DynamoDB, ElastiCache, Redshift
應用整合：SQS, SNS, EventBridge
網路：VPC, Route 53, CloudFront, API Gateway
安全：IAM, KMS, WAF, Shield
監控：CloudWatch, X-Ray, CloudTrail
```

---

### 1. 計算服務 (Compute)

#### EC2（Elastic Compute Cloud）- 虛擬伺服器

**核心概念**：EC2 是 AWS 的虛擬機服務，提供可調整大小的運算容量。

**實例類型**：

| 類型 | 代碼 | 特性 | 適用場景 |
|------|------|------|---------|
| **通用型** | T3, M5 | CPU/記憶體平衡 | Web 伺服器、小型資料庫 |
| **運算優化** | C5, C6g | 高 CPU 性能 | 批次處理、高效能運算 |
| **記憶體優化** | R5, X1 | 大記憶體 | 記憶體資料庫、大數據分析 |

**購買選項**：

1. **On-Demand (按需)**：最靈活，無承諾，成本最高。適合短期、不可預測的工作負載。
2. **Reserved Instances (預留)**：1-3 年承諾，節省 30-75%。適合穩定負載。
3. **Spot Instances (競價)**：利用閒置容量，節省高達 90%，但可能被中斷。適合容錯、批次處理。
4. **Savings Plans**：承諾每小時消費金額，靈活度高於 RI。

**Auto Scaling**：根據 CPU 使用率或其他指標自動增減 EC2 實例數量，確保高可用性並節省成本。

#### ECS（Elastic Container Service）- 容器調度

**核心概念**：ECS 是 AWS 的全託管容器調度服務，用於部署、管理和擴展 Docker 容器。

**啟動類型 (Launch Types)**：

1. **EC2 Launch Type**：
    - 用戶管理 EC2 實例集群。
    - 完全控制底層基礎設施。
    - 適合需要控制底層伺服器或使用預留實例的場景。
2. **Fargate Launch Type**：
    - Serverless 容器運算引擎。
    - 無需管理伺服器，AWS 管理底層。
    - 按 vCPU 和記憶體使用量計費，適合快速啟動和減少維運負擔。

**核心組件**：

- **Cluster (集群)**：邏輯分組，包含 EC2 實例或 Fargate 任務。
- **Task Definition (任務定義)**：藍圖 (Blueprint)，定義容器映像、資源限制、環境變數等。
- **Task (任務)**：Task Definition 的實例化 (正在運行的容器)。
- **Service (服務)**：確保指定數量的 Task 始終運行，整合負載均衡器 (ALB)。

#### Lambda - Serverless 運算

**核心概念**：Lambda 讓你運行程式碼而無需管理伺服器，採用事件驅動模型。

**特性**：

- **事件驅動**：由 S3 上傳、API Gateway 請求、DynamoDB 變更等事件觸發。
- **自動擴展**：從 0 到數千個並發執行。
- **按使用付費**：按請求次數和執行時間 (ms) 計費。
- **冷啟動 (Cold Start)**：首次執行需初始化環境，可能會有延遲。可透過 Provisioned Concurrency 優化。

**適用場景**：API 後端、資料處理 (ETL)、定時任務 (Cron jobs)、即時檔案處理。

---

### 2. 儲存服務 (Storage)

#### S3（Simple Storage Service）- 物件儲存

**核心概念**：S3 提供無限容量、高可用性 (99.999999999% 持久性) 的物件儲存。

**儲存類別**：

- **Standard**：頻繁存取，低延遲，高成本。
- **Intelligent-Tiering**：自動在頻繁和非頻繁存取層之間移動物件。
- **Standard-IA**：不頻繁存取，存取速度快，儲存成本較低。
- **Glacier / Deep Archive**：長期歸檔，成本極低，取回時間長 (分鐘到小時)。

**關鍵功能**：

- **Versioning**：版本控制，防止意外刪除。
- **Lifecycle Policies**：生命週期策略，自動將舊資料轉移到低成本儲存層。
- **Static Website Hosting**：託管靜態網站 (HTML/CSS/JS)。

---

### 3. 資料庫服務 (Database)

#### RDS（Relational Database Service）- 託管關聯式資料庫

**核心概念**：託管的 SQL 資料庫服務，支援 MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Aurora。

**架構選項**：

1. **Multi-AZ (多可用區)**：
    - 主資料庫 (Primary) 同步複製到備用資料庫 (Standby)。
    - 自動故障轉移 (Failover)，提供高可用性。
    - 適合生產環境。
2. **Read Replicas (讀取副本)**：
    - 非同步複製。
    - 用於分擔讀取流量 (Read Scaling)。
    - 可提升讀取效能。

**Amazon Aurora**：AWS 專為雲端打造的關聯式資料庫，相容 MySQL/PostgreSQL，效能是標準 MySQL 的 5 倍，PostgreSQL 的 3 倍。

---

### 4. 應用整合 (Application Integration)

#### SQS（Simple Queue Service）- 訊息佇列

**核心概念**：全託管的訊息佇列服務，用於解耦 (Decouple) 和擴展微服務、分散式系統。

**佇列類型**：

1. **Standard Queue (標準佇列)**：
    - 無限吞吐量。
    - **至少一次 (At-Least-Once)** 傳遞。
    - **盡力而為 (Best-Effort)** 的順序 (可能亂序)。
2. **FIFO Queue (先進先出佇列)**：
    - **嚴格保證順序 (First-In-First-Out)**。
    - **正好一次 (Exactly-Once)** 處理。
    - 吞吐量有限制 (每秒 300-3000 條)。

**關鍵特性**：

- **Visibility Timeout**：防止多個消費者同時處理同一條訊息。
- **Dead Letter Queue (DLQ)**：存放處理失敗的訊息，便於排錯。
- **Long Polling**：減少空輪詢，降低成本。

---

### 5. 網路與內容傳遞 (Networking & Content Delivery)

#### CloudFront - 內容傳遞網路 (CDN)

**核心概念**：透過全球邊緣節點 (Edge Locations) 加速靜態和動態內容的傳遞，降低延遲。

**工作原理**：

1. 用戶請求內容。
2. DNS 將請求導向最近的 Edge Location。
3. 若 Edge 有快取 (Cache Hit)，直接返回。
4. 若無快取 (Cache Miss)，向 Origin (如 S3, EC2, ALB) 請求內容，快取後返回。

**關鍵特性**：

- **Origin**：支援 S3 Bucket, EC2, ALB, 自定義 HTTP 伺服器。
- **Security**：整合 AWS WAF (Web Application Firewall) 和 AWS Shield (DDoS 防護)。
- **HTTPS**：提供 SSL/TLS 加密傳輸。
- **Lambda@Edge**：在邊緣節點執行程式碼，自定義請求/響應 (如 A/B 測試、身份驗證)。

---

### 服務整合架構範例

#### 範例 1：高可用 Web 應用 (EC2 + RDS + CloudFront)

```text
用戶
 ↓
Route 53 (DNS)
 ↓
CloudFront (CDN) ──► S3 (靜態資源)
 ↓
ALB (應用負載均衡器)
 ↓
Auto Scaling Group (EC2 / ECS)
 ↓
RDS (Multi-AZ) + ElastiCache (Redis)
```

#### 範例 2：非同步解耦架構 (API Gateway + SQS + Lambda)

```text
用戶
 ↓
API Gateway
 ↓
SQS (緩衝請求)
 ↓
Lambda (消費者) ──► DynamoDB / RDS
```

---

### 常見面試問題

#### Q1：EC2、ECS 和 Lambda 有什麼區別？何時使用哪個？

**回答要點**：

- **EC2**：虛擬機，完全控制，適合長期運行、需要 OS 層級控制的應用。
- **ECS**：容器調度，適合微服務架構、Docker 化應用。Fargate 模式可免去伺服器管理。
- **Lambda**：Serverless，事件驅動，適合短期任務、不定時流量、膠水程式碼 (Glue Code)。

#### Q2：SQS 的 Standard 和 FIFO Queue 有什麼差異？

**回答要點**：

- **Standard**：無限吞吐量，至少一次傳遞，可能亂序。適合對順序不敏感的高併發場景。
- **FIFO**：保證順序，正好一次處理，吞吐量較低。適合訂單處理、銀行交易等嚴格順序場景。

#### Q3：CloudFront 如何加速動態內容？

**回答要點**：

- 利用 AWS 全球骨幹網路 (Backbone Network) 優化路由。
- TCP/TLS 連接優化 (Keep-alive)。
- 邊緣節點終止 SSL (SSL Termination)。
- 雖然動態內容不能快取，但傳輸路徑被優化了。

#### Q4：如何設計一個高可用的 RDS 架構？

**回答要點**：

- 使用 **Multi-AZ** 部署以實現自動故障轉移。
- 配置 **Read Replicas** 分擔讀取負載。
- 啟用自動備份和快照。

---

## 總結

| 服務 | 類別 | 核心功能 | 關鍵字 |
|------|------|----------|--------|
| **EC2** | 計算 | 虛擬伺服器 | 靈活、VM、OS 控制 |
| **ECS** | 計算 | 容器調度 | Docker、Fargate、微服務 |
| **Lambda** | 計算 | Serverless 函數 | 事件驅動、無伺服器、短任務 |
| **S3** | 儲存 | 物件儲存 | 無限容量、靜態網頁、備份 |
| **RDS** | 資料庫 | 關聯式資料庫 | SQL、Multi-AZ、讀寫分離 |
| **SQS** | 整合 | 訊息佇列 | 解耦、非同步、緩衝 |
| **CloudFront**| 網路 | CDN | 加速、邊緣節點、快取 |

掌握這些核心服務，能夠讓你設計出高可用、可擴展且成本優化的雲端架構。
