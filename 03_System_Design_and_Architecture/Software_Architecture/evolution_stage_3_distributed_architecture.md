# 系統演進第三階段：分散式架構與微服務 (Distributed Architecture & Microservices)

- **難度**: 8
- **標籤**: `Architecture`, `Microservices`, `Distributed Systems`, `Trade-offs`

## 問題詳述

當水平擴展的單體架構無法滿足組織擴張或業務複雜度的需求時，我們通常會轉向分散式架構（如微服務）。請詳細說明這個轉變過程中的核心權衡 (Trade-offs)，以及為什麼說「微服務不是免費的午餐」？

## 核心理論與詳解

### 1. 架構轉變

從「多機單體」到「分散式服務」。

- **架構圖**: User -> API Gateway -> [Service A, Service B, Service C] -> [DB A, DB B, DB C]
- **核心思想**:
  - **拆分 (Decomposition)**: 將單體按業務領域 (Business Domain) 拆分成獨立的服務。
  - **去中心化 (Decentralization)**: 每個服務擁有自己的資料庫 (Database per Service)，嚴禁跨庫 Join。

### 2. 為什麼要轉向分散式？ (Benefits)

這通常是為了解決**組織擴張**帶來的問題，而非單純的技術問題。

1. **獨立部署 (Independent Deployment)**: 訂單團隊發布新功能，不需要等支付團隊。發布速度從「每週一次」變成「每天多次」。
2. **獨立擴展 (Independent Scaling)**: 影音轉碼服務吃 CPU，就只擴展它；訂單服務吃 IO，就只擴展它。資源利用率最大化。
3. **技術多樣性 (Technology Diversity)**: AI 團隊可以用 Python，後端核心可以用 Go/Java，前端可以用 Node.js。
4. **故障隔離 (Fault Isolation)**: 推薦服務掛了，首頁只會少一塊推薦區塊，用戶還是能下單。

### 3. 核心權衡 (The Price You Pay)

這是面試中最關鍵的部分。你必須清楚說明引入微服務後，你**失去**了什麼。

#### A. 複雜度轉移 (Complexity Shift)

複雜度並沒有消失，只是從**程式碼內部 (In-process)** 轉移到了**網路之間 (Inter-process)**。

- **單體**: 函數呼叫失敗是 Exception，Catch 就好。
- **分散式**: 服務呼叫失敗可能是網路斷了、對方掛了、超時了。你需要處理 Retry, Timeout, Circuit Breaker, Fallback。

#### B. 數據一致性 (Data Consistency)

這是最頭痛的問題。

- **單體**: ACID Transaction 搞定一切。
- **分散式**: 跨服務的操作無法使用 ACID。你必須接受 **最終一致性 (Eventual Consistency)**，並引入複雜的模式如 **Saga Pattern** 或 **TCC** 來處理分散式事務。

#### C. 可觀測性 (Observability)

- **單體**: 看一個 Log 文件就知道發生了什麼。
- **分散式**: 一個請求經過 10 個服務，Log 分散在 10 台機器上。你必須引入 **分散式追蹤 (Distributed Tracing)** (如 Jaeger) 和 **集中式日誌 (Centralized Logging)** (如 ELK)。

#### D. 運維成本 (Operational Overhead)

- **單體**: 監控 1 個應用。
- **分散式**: 監控 50 個微服務，每個都有自己的 CPU/Mem/DB 指標。你需要強大的 **DevOps** 能力和 **Kubernetes**。

### 4. 決策總結：康威定律 (Conway's Law)

> "Any organization that designs a system will produce a design whose structure is a copy of the organization's communication structure."

**最終決定是否採用微服務的，往往是組織結構。**

- 如果你有 5 個人，做微服務是自殺。
- 如果你有 500 個人，不做微服務是災難（因為溝通成本會拖垮開發效率）。

**演進路線圖**:

1. **單體 (Monolith)**: 活下來，快速驗證。
2. **水平擴展 (Horizontal Scaling)**: 活得更好，解決流量問題。
3. **微服務 (Microservices)**: 活得更久，解決組織和複雜度問題。
