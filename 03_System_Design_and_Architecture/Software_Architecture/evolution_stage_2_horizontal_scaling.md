# 系統演進第二階段：水平擴展 (Horizontal Scaling)

- **難度**: 5
- **標籤**: `Architecture`, `Scaling`, `Load Balancing`, `Stateless`

## 問題詳述

當單體架構遇到效能瓶頸，最常見的下一步是進行水平擴展。請說明如何將一個有狀態 (Stateful) 的單體應用改造為支持水平擴展的架構？這過程中會遇到哪些挑戰？

## 核心理論與詳解

### 1. 架構轉變

從「單機單體」到「多機單體 (Clustered Monolith)」。

- **架構圖**: User -> Load Balancer -> [App Server 1, App Server 2, ...] -> Shared Database
- **核心思想**: 應用層 (App Layer) 是無狀態的，可以無限複製；數據層 (Data Layer) 是有狀態的，需要集中管理。

### 2. 關鍵技術與挑戰

要實現水平擴展，必須解決以下問題：

#### A. 負載平衡 (Load Balancing)

引入一個反向代理 (Reverse Proxy) 或負載平衡器來分發流量。

- **工具**: Nginx, HAProxy, AWS ALB/ELB。
- **算法**: Round Robin, Least Connections, IP Hash。

#### B. 狀態管理 (The Stateless Challenge)

這是最大的挑戰。傳統單體常將 User Session 存在 `HttpSession` (記憶體) 中。

- **問題**: 如果 User A 的第一次請求打到 Server 1 (登入)，第二次請求打到 Server 2，Server 2 記憶體裡沒有 Session，User A 就被迫登出了。
- **解決方案**:
  1. **Sticky Session (Session Affinity)**: 讓 Load Balancer 記住 User IP，總是轉發到同一台 Server。 (缺點：負載不均，Server 掛了 Session 丟失)
  2. **Session Replication**: Server 之間同步 Session。 (缺點：頻寬消耗大，延遲高)
  3. **Centralized Session Store (推薦)**: 將 Session 移出 App Server，存入 Redis 或 Memcached。App Server 變成**無狀態 (Stateless)**。

#### C. 資料庫瓶頸 (Database Bottleneck)

App Server 擴展了，壓力全到了 Database。

- **解決方案**:
  1. **讀寫分離 (Read/Write Splitting)**: Master 負責寫，Slaves 負責讀。
  2. **快取 (Caching)**: 引入 Redis/Memcached 緩存熱點數據，減少 DB 讀取。
  3. **垂直分庫 (Vertical Sharding)**: 將不同模組的 Table 拆到不同 DB (為微服務做準備)。

### 3. 優點

1. **高可用性 (High Availability)**: 一台 Server 掛了，LB 會自動剔除，服務不中斷。
2. **線性擴展 (Linear Scalability)**: 只要 DB 撐得住，加機器就能抗更多流量。
3. **成本效益**: 可以用多台便宜的機器 (Commodity Hardware) 取代一台昂貴的超級電腦。

### 4. 缺點與局限

1. **運維複雜度增加**: 需要管理 Load Balancer、多台 Server、Redis 等。
2. **資料庫仍是單點**: 雖然 App 層擴展了，但 DB 還是共享的。如果 DB 掛了，全掛。
3. **代碼庫仍是單體**: 雖然跑在多台機器上，但代碼庫 (Codebase) 還是同一個。團隊協作衝突、部署慢的問題依然存在。

### 5. 決策點：何時該進入下一階段 (分散式/微服務)？

水平擴展解決了**流量 (Traffic)** 問題，但沒有解決**複雜度 (Complexity)** 問題。

**放棄水平擴展單體，轉向微服務的信號**:

- **團隊規模過大**: 50+ 人在同一個 Repo 開發，溝通成本大於開發成本。
- **業務領域過於複雜**: 領域模型 (Domain Model) 太大，腦容量無法理解整個系統。
- **獨立擴展需求**: 某個小功能需要極高的資源 (如影音轉碼)，但被迫連著整個龐大的單體一起擴展，資源浪費。
- **發布頻率要求**: 需要每天發布多次，但單體編譯部署一次要 1 小時。
