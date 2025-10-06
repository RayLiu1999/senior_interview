# 什麼是雲原生？雲原生架構 12 要素

- **難度**: 6
- **重要程度**: 5
- **標籤**: `雲原生`, `12 Factor`, `最佳實踐`, `Cloud Native`

## 問題詳述

雲原生（Cloud Native）是一種構建和運行應用的方法論，充分利用雲端運算的優勢。12-Factor App 是雲原生應用的最佳實踐指南，由 Heroku 的工程師提出，已成為業界標準。理解這些原則對於設計現代化的雲端應用至關重要。

## 核心理論與詳解

### 什麼是雲原生？

**雲原生（Cloud Native）** 是一種構建和運行應用的方式，充分利用雲端運算模型的優勢。

#### 雲原生的核心特徵

```
1. 容器化（Containerization）
   - 使用 Docker 等容器技術
   - 確保環境一致性

2. 動態編排（Orchestration）
   - 使用 Kubernetes 等編排工具
   - 自動部署、擴展和管理

3. 微服務（Microservices）
   - 將應用拆分為小型、獨立的服務
   - 獨立開發、部署和擴展

4. DevOps
   - 開發和運維緊密合作
   - CI/CD 自動化流程

5. 持續交付（Continuous Delivery）
   - 快速、頻繁地發布新功能
   - 自動化測試和部署
```

#### 雲原生 vs 傳統架構

| 特性 | 傳統架構 | 雲原生架構 |
|------|---------|-----------|
| **部署** | 單體應用 | 微服務 |
| **擴展** | 垂直擴展（升級硬體） | 水平擴展（增加實例） |
| **狀態** | 有狀態 | 無狀態 |
| **配置** | 硬編碼或配置檔案 | 環境變數 |
| **故障處理** | 故障即停機 | 自動恢復、優雅降級 |
| **更新** | 停機維護 | 滾動更新、零停機 |
| **基礎設施** | 自建機房 | 雲端服務 |

---

### 12-Factor App 原則

12-Factor App 是構建 SaaS（Software as a Service）應用的方法論，適用於任何語言和後端服務。

---

#### I. Codebase（代碼庫）

**原則**：一份基準代碼，多份部署

```
單一代碼庫，通過版本控制系統（如 Git）管理：

┌──────────────┐
│   Git Repo   │  (單一代碼庫)
└───────┬──────┘
        │
    ┌───┴───┬────────┬────────┐
    │       │        │        │
  Dev    Staging  Production Production
 環境     環境      (US)      (EU)

✅ 好的做法：
- 一個應用對應一個代碼庫
- 使用分支管理不同環境
- 共用程式碼提取為函式庫

❌ 壞的做法：
- 多個代碼庫對應一個應用
- 代碼在不同環境間複製
```

---

#### II. Dependencies（依賴）

**原則**：明確聲明依賴關係

```
顯式聲明和隔離依賴：

Node.js 範例：
package.json 明確聲明依賴
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^6.0.0"
  }
}

Go 範例：
go.mod 管理依賴
module myapp
go 1.20
require (
    github.com/gin-gonic/gin v1.9.0
)

✅ 好的做法：
- 使用依賴管理工具（npm、pip、go mod）
- 鎖定依賴版本
- 不依賴系統級套件

❌ 壞的做法：
- 假設系統已安裝某些套件
- 依賴隱式的全域套件
```

---

#### III. Config（配置）

**原則**：在環境中儲存配置

```
配置與代碼分離，使用環境變數：

❌ 壞的做法（硬編碼）：
const DB_HOST = "prod-db.example.com";
const DB_USER = "admin";
const DB_PASS = "secret123";

✅ 好的做法（環境變數）：
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;

配置項包括：
- 資料庫連接資訊
- 第三方服務憑證
- 每個部署環境的特定值

不同環境使用不同的環境變數：
Development:
  DB_HOST=localhost
  DEBUG=true

Production:
  DB_HOST=prod-db.example.com
  DEBUG=false
```

---

#### IV. Backing Services（後端服務）

**原則**：把後端服務當作附加資源

```
將資料庫、快取、訊息佇列等視為可替換的資源：

┌─────────────┐      ┌──────────┐
│ Application │ ────►│ Database │
└─────────────┘      └──────────┘
      │              
      ├──────────────►┌──────────┐
      │               │  Cache   │
      │               └──────────┘
      │
      └──────────────►┌──────────┐
                      │   Queue  │
                      └──────────┘

特性：
- 通過 URL 或配置存取
- 無需改代碼即可切換
- 本地和遠端服務無區別

範例：
# 開發環境使用本地 MySQL
DATABASE_URL=mysql://localhost:3306/myapp

# 生產環境使用 AWS RDS
DATABASE_URL=mysql://prod-rds.amazonaws.com:3306/myapp

應用代碼無需修改
```

---

#### V. Build, Release, Run（構建、發布、運行）

**原則**：嚴格分離構建和運行

```
三個階段：

1. Build（構建）
   └─ 將代碼轉換為可執行包
   └─ 安裝依賴
   └─ 編譯資產

2. Release（發布）
   └─ 結合構建和配置
   └─ 準備在執行環境中運行

3. Run（運行）
   └─ 在執行環境中啟動應用

流程圖：
Code + Dependencies → Build → Build Artifact
                                    │
                                    ├─ + Config (Dev)
                                    │  → Release v1.2.3-dev
                                    │
                                    ├─ + Config (Staging)
                                    │  → Release v1.2.3-staging
                                    │
                                    └─ + Config (Prod)
                                       → Release v1.2.3-prod

每個 Release 都有唯一 ID（如版本號、時間戳）
不可修改已發布的 Release，只能創建新的
```

---

#### VI. Processes（進程）

**原則**：以一個或多個無狀態進程運行應用

```
應用應該是無狀態的：

❌ 壞的做法（有狀態）：
// 在記憶體中儲存 session
const sessions = {};
app.post('/login', (req, res) => {
  const sessionId = generateId();
  sessions[sessionId] = { user: req.body.user };
  res.cookie('sessionId', sessionId);
});

問題：
- 無法水平擴展（session 只在一個實例）
- 實例重啟後資料丟失

✅ 好的做法（無狀態）：
// 使用 Redis 儲存 session
app.post('/login', async (req, res) => {
  const sessionId = generateId();
  await redis.set(sessionId, JSON.stringify({ user: req.body.user }));
  res.cookie('sessionId', sessionId);
});

優勢：
- 可以水平擴展
- 任意實例都可以處理請求
- 實例重啟不影響用戶

持久化資料應存放在：
- 資料庫
- 快取服務（Redis）
- 物件儲存（S3）
```

---

#### VII. Port Binding（端口綁定）

**原則**：通過端口綁定提供服務

```
應用應該是自包含的，通過端口對外提供服務：

✅ 好的做法：
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

特性：
- 不依賴外部 web 伺服器（如 Apache）
- 應用本身包含 HTTP 伺服器
- 通過環境變數配置端口

部署方式：
開發環境：直接運行 node app.js
生產環境：
  - 通過反向代理（Nginx）
  - 或直接暴露端口
  - 或使用容器（Docker）

一個應用可以成為另一個應用的後端服務：
App A (port 3000) → App B (port 4000)
```

---

#### VIII. Concurrency（並發）

**原則**：通過進程模型進行擴展

```
通過進程模型實現水平擴展：

進程類型：
- web: 處理 HTTP 請求
- worker: 處理背景任務
- clock: 定時任務

水平擴展：
┌──────┐ ┌──────┐ ┌──────┐
│ web  │ │ web  │ │ web  │  (多個 web 進程)
└──────┘ └──────┘ └──────┘

┌──────┐ ┌──────┐
│worker│ │worker│           (多個 worker 進程)
└──────┘ └──────┘

┌──────┐
│clock │                    (一個 clock 進程)
└──────┘

特性：
- 每種進程類型可以獨立擴展
- 進程不應該自己後台化
- 依賴作業系統的進程管理器

範例（Procfile）：
web: node server.js
worker: node worker.js
clock: node scheduler.js

Kubernetes 範例：
- web: Deployment with 5 replicas
- worker: Deployment with 3 replicas
- clock: CronJob
```

---

#### IX. Disposability（易處理）

**原則**：快速啟動和優雅終止最大化穩健性

```
進程應該可以快速啟動和優雅關閉：

快速啟動：
- 啟動時間應該很短（幾秒鐘）
- 快速啟動有利於快速擴展和部署

優雅終止：
✅ 好的做法：
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server gracefully');
  
  // 1. 停止接收新請求
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  // 2. 完成正在處理的請求
  await finishPendingRequests();
  
  // 3. 關閉資料庫連接
  await database.close();
  
  // 4. 退出進程
  process.exit(0);
});

特性：
- 收到 SIGTERM 信號時優雅關閉
- 完成正在處理的工作
- 對於 worker，將任務放回佇列
- 可以隨時被終止，對系統無影響

好處：
- 支援滾動部署
- 支援自動擴展
- 快速恢復
```

---

#### X. Dev/Prod Parity（開發環境與線上環境等價）

**原則**：盡可能保持開發、預發布、線上環境相同

```
縮小三個差距：

1. 時間差距：
   ❌ 傳統：開發數週後才部署
   ✅ 雲原生：開發幾小時後即部署

2. 人員差距：
   ❌ 傳統：開發寫代碼，運維部署
   ✅ 雲原生：開發自己部署（DevOps）

3. 工具差距：
   ❌ 傳統：
   - 開發環境：SQLite
   - 生產環境：PostgreSQL
   
   ✅ 雲原生：
   - 開發環境：PostgreSQL (Docker)
   - 生產環境：PostgreSQL (RDS)

使用 Docker 確保環境一致：
docker-compose.yml:
version: '3'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://db:5432/myapp
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=myapp

本地和生產環境使用相同的服務
```

---

#### XI. Logs（日誌）

**原則**：把日誌當作事件流

```
應用不應該管理日誌檔案：

❌ 壞的做法：
const fs = require('fs');
app.get('/', (req, res) => {
  fs.appendFile('/var/log/app.log', 'Request received\n', () => {});
  res.send('OK');
});

問題：
- 日誌檔案管理複雜
- 難以集中查看
- 容器環境中日誌可能丟失

✅ 好的做法：
console.log('Request received');
console.error('Error occurred');

特性：
- 輸出到 stdout/stderr
- 由執行環境處理日誌
- 開發環境：直接顯示在終端
- 生產環境：
  - 由容器編排工具收集（如 Kubernetes）
  - 發送到日誌聚合系統（ELK、Loki）
  - 儲存到雲端服務（CloudWatch）

日誌應該是無緩衝的事件流
每行日誌是一個事件
使用結構化日誌格式（JSON）
```

---

#### XII. Admin Processes（管理進程）

**原則**：後台管理任務當作一次性進程運行

```
管理任務應該在與應用相同的環境中運行：

管理任務範例：
- 資料庫遷移
- 一次性腳本
- REPL console

✅ 好的做法：
# 使用相同的代碼庫和配置
$ node scripts/migrate-database.js

# 在 Kubernetes 中
$ kubectl run migrate --image=myapp:latest --restart=Never \
  --command -- node scripts/migrate-database.js

特性：
- 使用相同的代碼庫
- 使用相同的配置（環境變數）
- 使用相同的依賴
- 運行在相同的環境中

避免：
- 在開發機器上直接連接生產資料庫
- 使用不同的工具和環境

Kubernetes CronJob 範例：
apiVersion: batch/v1
kind: CronJob
metadata:
  name: data-cleanup
spec:
  schedule: "0 2 * * *"  # 每天凌晨 2 點
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: cleanup
            image: myapp:latest
            command: ["node", "scripts/cleanup.js"]
          restartPolicy: OnFailure
```

---

### 12-Factor App 的實踐

#### 範例：符合 12-Factor 的 Node.js 應用

```javascript
// app.js
const express = require('express');
const redis = require('redis');

// III. Config - 從環境變數讀取配置
const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// IV. Backing Services - Redis 作為附加資源
const redisClient = redis.createClient({ url: REDIS_URL });

const app = express();

// VI. Processes - 無狀態
app.get('/count', async (req, res) => {
  const count = await redisClient.incr('visit_count');
  res.json({ count });
});

// VII. Port Binding - 通過端口提供服務
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// IX. Disposability - 優雅關閉
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
  });
  await redisClient.quit();
  process.exit(0);
});

// XI. Logs - 輸出到 stdout
console.log('Application started');
```

#### Dockerfile（容器化）

```dockerfile
# I. Codebase - 單一代碼庫
FROM node:18-alpine

WORKDIR /app

# II. Dependencies - 明確聲明依賴
COPY package*.json ./
RUN npm ci --production

COPY . .

# VII. Port Binding
EXPOSE 3000

# IX. Disposability - 快速啟動
CMD ["node", "app.js"]
```

#### docker-compose.yml（開發環境）

```yaml
# X. Dev/Prod Parity - 開發環境與生產環境一致
version: '3'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
  
  redis:
    image: redis:7-alpine
```

---

### 雲原生的其他最佳實踐

#### 1. 健康檢查

```javascript
// 存活探針（Liveness Probe）
app.get('/health/live', (req, res) => {
  res.status(200).send('OK');
});

// 就緒探針（Readiness Probe）
app.get('/health/ready', async (req, res) => {
  try {
    await redisClient.ping();
    await database.ping();
    res.status(200).send('OK');
  } catch (error) {
    res.status(503).send('Not Ready');
  }
});
```

#### 2. 優雅降級

```javascript
app.get('/api/data', async (req, res) => {
  try {
    // 嘗試從快取獲取
    const data = await cache.get('data');
    if (data) return res.json(data);
    
    // 從資料庫獲取
    const result = await database.query('SELECT * FROM data');
    await cache.set('data', result);
    res.json(result);
  } catch (error) {
    // 優雅降級：返回預設資料
    console.error('Error:', error);
    res.json({ data: [], cached: false, fallback: true });
  }
});
```

#### 3. 限流和熔斷

```javascript
const rateLimit = require('express-rate-limit');
const CircuitBreaker = require('opossum');

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100 // 限制 100 個請求
});
app.use('/api/', limiter);

// 熔斷器
const breaker = new CircuitBreaker(callExternalAPI, {
  timeout: 3000, // 3 秒超時
  errorThresholdPercentage: 50, // 50% 錯誤率
  resetTimeout: 30000 // 30 秒後嘗試恢復
});
```

---

### 常見面試問題

#### Q1：什麼是 12-Factor App？為什麼重要？

**回答要點**：
- 構建 SaaS 應用的方法論
- 確保應用可移植、可擴展
- 適合雲端和容器環境
- 業界最佳實踐標準

#### Q2：如何實現應用的無狀態化？

**回答要點**：
- 不在應用記憶體中儲存狀態
- 使用外部服務（Redis、資料庫）
- Session 存放在快取中
- 上傳的檔案存放在物件儲存（S3）

#### Q3：為什麼要保持開發和生產環境一致？

**回答要點**：
- 減少環境差異導致的 bug
- 使用 Docker 確保一致性
- 相同的資料庫、快取等服務
- 降低部署風險

#### Q4：如何實現優雅關閉？

**回答要點**：
- 監聽 SIGTERM 信號
- 停止接收新請求
- 完成正在處理的請求
- 關閉資料庫連接
- 支援滾動更新和自動擴展

---

## 總結

12-Factor App 是雲原生應用的基礎，這些原則幫助我們構建：

1. **可擴展**：水平擴展而非垂直擴展
2. **可移植**：在任何雲平台運行
3. **可維護**：清晰的架構和部署流程
4. **穩健**：快速恢復、優雅降級

在現代雲端環境中，遵循這些原則可以：
- 簡化部署和運維
- 提高系統可靠性
- 支援持續交付
- 充分利用雲端優勢

**記住**：12-Factor 不是教條，而是指導原則。根據實際情況靈活應用，才能構建出真正優秀的雲原生應用。
