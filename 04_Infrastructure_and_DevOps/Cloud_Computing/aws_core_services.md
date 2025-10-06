# AWS 核心服務概覽（EC2、S3、RDS、Lambda）

- **難度**: 6
- **重要程度**: 5
- **標籤**: `AWS`, `EC2`, `S3`, `RDS`, `Lambda`, `雲端服務`

## 問題詳述

AWS（Amazon Web Services）是目前市場佔有率最高的雲平台，提供超過 200 項服務。了解 AWS 的核心服務及其使用場景，是現代後端工程師的必備技能。本文重點介紹四個最核心的服務：EC2、S3、RDS 和 Lambda。

## 核心理論與詳解

### AWS 服務全景

AWS 服務可以分為以下幾大類：

```
計算服務：EC2, Lambda, ECS, EKS, Fargate
儲存服務：S3, EBS, EFS, Glacier
資料庫：RDS, DynamoDB, ElastiCache, Redshift
網路：VPC, Route 53, CloudFront, API Gateway
安全：IAM, KMS, WAF, Shield
監控：CloudWatch, X-Ray, CloudTrail
開發工具：CodeCommit, CodeBuild, CodeDeploy
```

---

### EC2（Elastic Compute Cloud）- 虛擬伺服器

#### 核心概念

**EC2** 是 AWS 的虛擬機服務，提供可調整大小的運算容量。

#### 實例類型

EC2 實例按用途分類：

| 類型 | 代碼 | 特性 | 適用場景 |
|------|------|------|---------|
| **通用型** | T3, M5 | CPU/記憶體平衡 | Web 伺服器、小型資料庫 |
| **運算優化** | C5, C6g | 高 CPU 性能 | 批次處理、高效能運算 |
| **記憶體優化** | R5, X1 | 大記憶體 | 記憶體資料庫、大數據分析 |
| **儲存優化** | I3, D2 | 高 I/O | 資料倉儲、分散式檔案系統 |
| **加速運算** | P3, G4 | GPU | 機器學習、影片處理 |

**實例大小範例**：
```
t3.nano:    2 vCPU,  0.5 GB RAM  (~$0.005/小時)
t3.small:   2 vCPU,  2 GB RAM    (~$0.02/小時)
t3.medium:  2 vCPU,  4 GB RAM    (~$0.04/小時)
m5.large:   2 vCPU,  8 GB RAM    (~$0.10/小時)
m5.xlarge:  4 vCPU,  16 GB RAM   (~$0.19/小時)
c5.4xlarge: 16 vCPU, 32 GB RAM   (~$0.68/小時)
```

#### AMI（Amazon Machine Image）

AMI 是 EC2 實例的模板：

```
AMI 包含：
- 作業系統（Amazon Linux、Ubuntu、Windows 等）
- 預安裝的軟體
- 配置設定
- 權限設定

類型：
1. AWS 提供的官方 AMI
2. AWS Marketplace AMI（第三方）
3. Community AMI（社群分享）
4. 自訂 AMI（自己創建）
```

#### 購買選項

**1. On-Demand（按需實例）**
```
特性：
- 按秒計費（Linux）或按小時計費（Windows）
- 無長期承諾
- 隨時啟動和停止

適用場景：
- 開發測試環境
- 短期需求
- 流量不可預測的應用

成本：最高
```

**2. Reserved Instances（預留實例）**
```
特性：
- 1 年或 3 年承諾
- 節省 30-75%
- 可以轉換實例類型（Convertible RI）

適用場景：
- 穩定的生產環境
- 可預測的基線容量

成本：中等
```

**3. Spot Instances（競價實例）**
```
特性：
- 利用 AWS 閒置容量
- 節省高達 90%
- 可能隨時被中斷（2 分鐘通知）

適用場景：
- 批次處理
- 大數據分析
- CI/CD 構建
- 容錯的分散式系統

成本：最低
```

**4. Savings Plans**
```
特性：
- 承諾穩定使用量（$/小時）
- 靈活：可跨實例類型、區域使用
- 節省高達 72%

適用場景：
- 現代化、彈性的工作負載
- 使用多種運算服務（EC2, Lambda, Fargate）

成本：低
```

#### 彈性伸縮（Auto Scaling）

```
Auto Scaling 架構：

         Load Balancer
              │
    ┌─────────┼─────────┐
    │         │         │
  EC2-1     EC2-2     EC2-3
    │         │         │
  ├─ Min: 2 instances
  ├─ Desired: 3 instances
  └─ Max: 10 instances

觸發條件：
- CPU 使用率 > 70% → 擴展
- CPU 使用率 < 30% → 縮減
- 自訂 CloudWatch 指標
- 排程擴展（如每天早上 8 點）
```

#### 安全性

**Security Groups（安全群組）**：
```
虛擬防火牆，控制入站和出站流量

範例規則：
Inbound:
- Type: HTTP,  Port: 80,   Source: 0.0.0.0/0 (允許所有)
- Type: HTTPS, Port: 443,  Source: 0.0.0.0/0
- Type: SSH,   Port: 22,   Source: 10.0.0.0/16 (僅 VPC 內)

Outbound:
- All traffic to 0.0.0.0/0 (預設允許所有出站)
```

#### 儲存選項

**1. EBS（Elastic Block Store）**
```
特性：
- 持久化區塊儲存
- 可以 detach 和 attach 到不同實例
- 快照備份到 S3

類型：
- gp3/gp2 (SSD): 通用型，平衡性能和成本
- io2/io1 (SSD): 高性能，低延遲
- st1 (HDD): 吞吐量優化，大數據
- sc1 (HDD): 冷資料，最低成本

使用場景：
- 作業系統碟
- 資料庫儲存
- 需要持久化的資料
```

**2. Instance Store**
```
特性：
- 臨時儲存
- 實例停止或終止時資料丟失
- 高性能（本地 SSD）

使用場景：
- 快取
- 臨時資料
- 可重建的資料
```

**3. EFS（Elastic File System）**
```
特性：
- 網路檔案系統（NFS）
- 可被多個 EC2 實例同時掛載
- 自動擴展

使用場景：
- 共享檔案系統
- 內容管理系統
- 開發環境
```

---

### S3（Simple Storage Service）- 物件儲存

#### 核心概念

**S3** 是 AWS 的物件儲存服務，提供無限容量、高可用性和持久性。

#### 基本結構

```
S3 層級結構：

Bucket（儲存桶）
  └─ Object（物件）
      ├─ Key: my-app/images/photo.jpg
      ├─ Value: 實際檔案內容
      ├─ Metadata: 檔案資訊
      └─ Version ID: 版本控制

特性：
- Bucket 名稱全球唯一
- 單一物件大小：0 bytes - 5 TB
- 無限數量的物件
```

#### 儲存類別

| 類別 | 特性 | 檢索時間 | 成本 | 適用場景 |
|------|------|---------|------|---------|
| **Standard** | 高可用（99.99%） | 即時 | 高 | 頻繁存取的資料 |
| **Intelligent-Tiering** | 自動分層 | 即時 | 自動優化 | 存取模式不確定 |
| **Standard-IA** | 不頻繁存取 | 即時 | 中 | 備份、災難恢復 |
| **One Zone-IA** | 單一 AZ | 即時 | 低 | 可重建的資料 |
| **Glacier Instant** | 歸檔、即時檢索 | 即時 | 低 | 歸檔但需即時存取 |
| **Glacier Flexible** | 歸檔 | 分鐘-小時 | 很低 | 長期歸檔 |
| **Glacier Deep Archive** | 深度歸檔 | 12 小時 | 最低 | 合規、長期保存 |

#### 版本控制（Versioning）

```
啟用版本控制後：

上傳 file.txt → Version 1 (v1)
修改 file.txt → Version 2 (v2)
再次修改     → Version 3 (v3, 最新版本)

刪除操作：
- 正常刪除：添加刪除標記，可恢復
- 永久刪除：指定版本 ID 刪除

優勢：
- 防止意外刪除
- 保留歷史版本
- 可以回滾到任何版本
```

#### 生命週期管理

```yaml
生命週期規則範例：

規則 1：移動到低成本儲存
- 30 天後 → Standard-IA
- 90 天後 → Glacier
- 365 天後 → Deep Archive

規則 2：自動清理
- 刪除不完整的多部分上傳（7 天）
- 刪除舊版本（180 天）
- 永久刪除過期物件

自動執行，節省成本
```

#### 安全性

**1. Bucket Policy（儲存桶策略）**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}
```

**2. IAM Policy（身份策略）**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}
```

**3. 加密**
```
Server-Side Encryption（SSE）：
- SSE-S3：AWS 管理金鑰
- SSE-KMS：使用 AWS KMS
- SSE-C：客戶提供金鑰

Client-Side Encryption：
- 上傳前在客戶端加密
```

**4. 存取控制**
```
方法：
- Block Public Access（封鎖公開存取）
- Access Control Lists (ACLs)
- Pre-signed URLs（預簽名 URL，臨時存取）
```

#### 常見使用場景

1. **靜態網站託管**
```
S3 → CloudFront CDN → 用戶

優勢：
- 高可用性
- 低延遲（全球 CDN）
- 低成本
- 無需管理伺服器
```

2. **資料湖**
```
各種資料來源 → S3 → 大數據分析工具
              (集中儲存)  (Athena, EMR, Redshift Spectrum)
```

3. **備份和歸檔**
```
資料庫備份 → S3 Standard → Glacier
應用日誌   → S3 IA      → Deep Archive

使用生命週期策略自動管理
```

4. **應用資料儲存**
```
用戶上傳的檔案：
- 圖片、影片
- 文件
- 日誌檔案
```

---

### RDS（Relational Database Service）- 託管資料庫

#### 核心概念

**RDS** 是 AWS 的託管關聯式資料庫服務，支援多種資料庫引擎。

#### 支援的資料庫引擎

| 引擎 | 特性 | 適用場景 |
|------|------|---------|
| **Amazon Aurora** | AWS 自研，MySQL/PostgreSQL 相容 | 高效能、高可用應用 |
| **MySQL** | 開源、廣泛使用 | Web 應用、電商 |
| **PostgreSQL** | 開源、功能豐富 | 複雜查詢、地理資料 |
| **MariaDB** | MySQL 分支 | MySQL 替代方案 |
| **Oracle** | 商業級 | 企業應用 |
| **SQL Server** | Microsoft | .NET 應用 |

#### 架構選項

**1. Single-AZ（單可用區）**
```
┌──────────────┐
│   Primary    │
│   Database   │
│   (AZ-1a)    │
└──────────────┘

特性：
- 單一實例
- 自動備份
- 成本最低

適用場景：
- 開發測試環境
- 非關鍵應用
```

**2. Multi-AZ（多可用區）**
```
┌──────────────┐     ┌──────────────┐
│   Primary    │ ──► │   Standby    │
│   Database   │     │   Database   │
│   (AZ-1a)    │     │   (AZ-1b)    │
└──────────────┘     └──────────────┘
   │                      │
   └──────── 同步複製 ─────┘

特性：
- 同步複製到備用實例
- 自動故障轉移（1-2 分鐘）
- 無需應用程式變更

適用場景：
- 生產環境
- 需要高可用性的應用
```

**3. Read Replicas（讀取副本）**
```
┌──────────────┐
│   Primary    │ (寫入)
│   Database   │
└──────┬───────┘
       │ 非同步複製
   ┌───┴─────┬─────────┐
   ▼         ▼         ▼
┌─────┐  ┌─────┐  ┌─────┐
│ RR 1│  │ RR 2│  │ RR 3│ (只讀)
└─────┘  └─────┘  └─────┘

特性：
- 非同步複製
- 可在不同區域
- 最多 15 個讀取副本（Aurora）

適用場景：
- 讀取密集型應用
- 報表查詢
- 讀寫分離
```

#### 備份和還原

**1. 自動備份**
```
特性：
- 每日全量備份到 S3
- 事務日誌備份（每 5 分鐘）
- 保留期：1-35 天
- 可恢復到保留期內的任意時間點（PITR）

恢復過程：
1. 選擇恢復時間點
2. 創建新的 RDS 實例
3. 應用程式切換到新實例
```

**2. 手動快照**
```
特性：
- 用戶手動觸發
- 可永久保留
- 可跨區域複製
- 可分享給其他 AWS 帳戶

使用場景：
- 重大變更前備份
- 長期歸檔
- 遷移到其他區域
```

#### 效能優化

**1. 實例大小**
```
選擇合適的實例類型：
- db.t3.micro:  2 vCPU, 1 GB RAM    (開發測試)
- db.t3.small:  2 vCPU, 2 GB RAM    (小型應用)
- db.m5.large:  2 vCPU, 8 GB RAM    (生產環境)
- db.r5.xlarge: 4 vCPU, 32 GB RAM   (記憶體密集)
```

**2. 儲存類型**
```
- General Purpose (SSD): 平衡性能和成本
- Provisioned IOPS (SSD): 高 I/O 性能
- Magnetic: 低成本（不推薦新應用）
```

**3. 連接池**
```
RDS Proxy：
- 連接池管理
- 減少資料庫連接開銷
- 自動故障轉移
- 適合 Serverless 和高並發應用
```

**4. 效能監控**
```
CloudWatch 指標：
- CPU Utilization
- Database Connections
- Read/Write IOPS
- Read/Write Latency
- Free Storage Space

Enhanced Monitoring：
- 作業系統層級指標
- 更細緻的監控（1 秒間隔）
```

#### 安全性

```
網路隔離：
- 部署在 VPC 中
- 使用安全群組控制存取
- 不分配公共 IP（通常）

加密：
- 靜態加密（AWS KMS）
- 傳輸加密（SSL/TLS）

存取控制：
- IAM 資料庫身份驗證
- 資料庫使用者權限管理

審計：
- 啟用審計日誌
- 整合 CloudWatch Logs
```

---

### Lambda - Serverless 運算

#### 核心概念

**Lambda** 是 AWS 的 Serverless 運算服務，讓你運行程式碼而無需管理伺服器。

#### 工作原理

```
事件驅動模型：

觸發源              Lambda 函數          目標
(Event Source)      (Function)         (Destination)
    │                   │                  │
API Gateway ───────────►│                  │
S3 事件     ───────────►│ 執行程式碼 ────────► DynamoDB
DynamoDB Stream ────────►│                  │
CloudWatch Events ──────►│                  │
SQS 佇列    ───────────►│                  │

特性：
- 事件觸發自動執行
- 自動擴展（0 到數千個並發執行）
- 按執行時間計費（100ms 為單位）
- 最長執行時間：15 分鐘
```

#### 支援的運行時

```
支援的語言：
- Node.js (18.x, 16.x, 14.x)
- Python (3.11, 3.10, 3.9, 3.8)
- Java (17, 11, 8)
- .NET (6, Core 3.1)
- Go (1.x)
- Ruby (2.7)
- 自訂運行時（使用 Lambda Layers）
```

#### 計費模型

```
計費因素：
1. 請求次數
   - 每月前 100 萬次請求免費
   - 之後每 100 萬次 $0.20

2. 執行時間
   - 按 GB-秒計費
   - 每月前 40 萬 GB-秒免費
   - 之後每 GB-秒 $0.0000166667

範例計算：
配置：1024 MB (1 GB) 記憶體
執行時間：200ms
每月請求：100 萬次

成本：
- 請求費用：免費（在免費額度內）
- 執行時間：100萬 × 0.2秒 × 1GB = 200,000 GB-秒
  費用：(200,000 - 400,000) × $0.0000166667 = $0（在免費額度內）

總成本：$0（完全在免費額度內）
```

#### 配置和限制

```
配置：
- 記憶體：128 MB - 10,240 MB（以 1 MB 為單位）
- CPU：與記憶體成比例（1792 MB = 1 vCPU）
- 臨時儲存 (/tmp)：512 MB - 10,240 MB
- 環境變數：4 KB
- 部署包大小：50 MB（壓縮），250 MB（解壓）

限制：
- 執行時間：最長 15 分鐘
- 並發執行：預設 1000（可申請提高）
- 請求/響應大小：6 MB（同步），256 KB（非同步）
```

#### 冷啟動與優化

**冷啟動問題**：
```
冷啟動流程：
1. AWS 分配執行環境
2. 下載程式碼
3. 初始化運行時
4. 執行初始化程式碼
5. 執行處理函數

冷啟動時間：
- Node.js/Python：100-300ms
- Java/.NET：500ms-2s
- Go：較快

熱啟動：
- 使用已存在的執行環境
- 只執行處理函數
- 通常 <10ms
```

**優化策略**：
```
1. 選擇合適的語言
   - Node.js/Python 啟動快
   - 避免 Java/.NET（如果冷啟動是問題）

2. 減小部署包大小
   - 只包含必要的依賴
   - 使用 Lambda Layers 共享程式碼

3. 預留並發（Provisioned Concurrency）
   - 預先初始化執行環境
   - 消除冷啟動
   - 額外成本

4. 保持函數溫暖
   - CloudWatch Events 定期調用
   - 不推薦（浪費資源）

5. 優化初始化程式碼
   - 將初始化移到處理函數外
   - 重用連接（資料庫、HTTP）
```

#### 常見使用場景

**1. API 後端**
```
API Gateway + Lambda：

Client → API Gateway → Lambda Function → DynamoDB/RDS
                ↓
            返回 JSON 響應

優勢：
- 自動擴展
- 按使用付費
- 無需管理伺服器
```

**2. 資料處理**
```
S3 事件觸發：

用戶上傳圖片 → S3 → Lambda → 調整大小 → S3
                              ↓
                          更新資料庫
```

**3. 定時任務**
```
CloudWatch Events：

每天凌晨 2:00 → Lambda → 資料備份
每小時 → Lambda → 清理臨時檔案
```

**4. Stream 處理**
```
DynamoDB Streams：

DynamoDB 變更 → Lambda → 處理變更 → 其他系統
                               (如發送通知、同步資料)
```

**5. 聊天機器人**
```
Slack/Teams Webhook → API Gateway → Lambda → 處理命令
                                              ↓
                                      返回響應給聊天平台
```

---

### 服務整合架構範例

#### 範例 1：典型 Web 應用

```
用戶
 ↓
Route 53 (DNS)
 ↓
CloudFront (CDN)
 ↓                    ↓
S3 (靜態資源)    ALB (應用負載均衡器)
                     ↓
              Auto Scaling Group
              ┌─────┼─────┐
              ↓     ↓     ↓
            EC2   EC2   EC2
              └─────┼─────┘
                    ↓
                RDS (Multi-AZ)
                    ↓
            ElastiCache (Redis)

監控：CloudWatch
日誌：CloudWatch Logs
安全：WAF, Security Groups
```

#### 範例 2：Serverless 應用

```
用戶
 ↓
API Gateway
 ↓
Lambda Functions
 ↓              ↓
DynamoDB    S3 (檔案儲存)
 ↓
DynamoDB Streams
 ↓
Lambda (資料處理)
 ↓
SNS/SQS (通知/佇列)

優勢：
- 完全 Serverless
- 自動擴展
- 按使用付費
- 無伺服器管理
```

#### 範例 3：混合架構

```
傳統部分：
ALB → EC2 (Auto Scaling) → RDS
         ↑
         └── 處理複雜業務邏輯

Serverless 部分：
API Gateway → Lambda → DynamoDB
                 ↓
             S3 (檔案處理)
             
整合：
- Lambda 可調用 EC2 上的 API
- EC2 可觸發 Lambda 函數
- 共享 VPC、安全群組
```

---

### 成本優化建議

#### 1. EC2 成本優化
```
- 使用 Reserved Instances（穩定負載）
- 使用 Spot Instances（容錯工作負載）
- Right Sizing（選擇合適的實例類型）
- 啟用 Auto Scaling（根據需求調整）
- 停止未使用的實例
```

#### 2. S3 成本優化
```
- 使用生命週期策略自動分層
- 刪除不完整的多部分上傳
- 啟用 Intelligent-Tiering
- 壓縮檔案
- 使用 CloudFront 減少請求次數
```

#### 3. RDS 成本優化
```
- 使用 Reserved Instances
- Right Sizing（監控實際使用）
- 使用讀取副本分擔負載
- 在非生產環境使用較小實例
- 定期刪除舊快照
```

#### 4. Lambda 成本優化
```
- 優化記憶體配置（更多記憶體 = 更快但更貴）
- 減少執行時間
- 使用合適的觸發頻率
- 避免不必要的調用
```

---

### 常見面試問題

#### Q1：EC2、Lambda 和 Fargate 有什麼區別？何時使用哪個？

**回答要點**：
- **EC2**：完全控制，適合長期運行的應用
- **Lambda**：Serverless，事件驅動，短期任務（<15 分鐘）
- **Fargate**：容器化應用，無需管理伺服器
- 選擇依據：工作負載特性、控制需求、成本考量

#### Q2：如何設計一個高可用的 RDS 架構？

**回答要點**：
- 使用 Multi-AZ 部署（自動故障轉移）
- 配置讀取副本（分擔讀取負載）
- 啟用自動備份和快照
- 監控效能指標
- 定期進行災難恢復演練

#### Q3：S3 和 EBS 有什麼區別？

**回答要點**：
- **S3**：物件儲存，通過 HTTP/HTTPS 存取，無限容量
- **EBS**：區塊儲存，掛載到 EC2，有容量限制
- **S3** 適合：靜態檔案、備份、資料湖
- **EBS** 適合：作業系統碟、資料庫儲存

#### Q4：Lambda 的冷啟動如何優化？

**回答要點**：
- 選擇啟動快的語言（Node.js、Python）
- 減小部署包大小
- 使用 Provisioned Concurrency
- 優化初始化程式碼
- 重用連接和資源

---

## 總結

AWS 的四大核心服務各有其特點和適用場景：

1. **EC2**：虛擬伺服器，最靈活，適合各種工作負載
2. **S3**：物件儲存，無限容量，高可用性
3. **RDS**：託管資料庫，減少管理負擔
4. **Lambda**：Serverless 運算，事件驅動，按需付費

在實際應用中，通常會組合使用這些服務，根據具體需求選擇最合適的架構。理解每個服務的特性、限制和最佳實踐，是設計高效雲端系統的關鍵。

**學習建議**：
1. 註冊 AWS 免費帳號，動手實踐
2. 完成 AWS 官方教程
3. 準備 AWS Certified Solutions Architect 認證
4. 關注成本，學習優化策略
