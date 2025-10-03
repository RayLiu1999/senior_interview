# Docker 映像層與優化策略

- **難度**: 6
- **標籤**: `Docker`, `Image`, `Optimization`

## 問題詳述

請深入解釋 Docker 映像的分層機制、層快取原理和優化策略，包括如何減小映像大小和提升構建效率。

## 核心理論與詳解

### Docker 映像的分層架構

#### 什麼是映像層

**定義**：
Docker 映像由多個**唯讀層**疊加而成，每一層代表 Dockerfile 中的一條指令。

**分層結構**：
```
┌────────────────────────────────────┐
│      Container Layer (讀寫)       │  ← 容器啟動時添加
├────────────────────────────────────┤
│   Layer 4: CMD ["node", "app.js"] │  ← 元資料（不佔空間）
├────────────────────────────────────┤
│   Layer 3: COPY . .                │  ← 20 MB
├────────────────────────────────────┤
│   Layer 2: RUN npm install         │  ← 150 MB
├────────────────────────────────────┤
│   Layer 1: FROM node:18-alpine     │  ← 177 MB
└────────────────────────────────────┘
         總大小: 347 MB
```

**關鍵特性**：
- 每層都是**唯讀的**（Immutable）
- 層之間使用 **Union FS** 合併
- 多個映像可以**共享相同的層**
- 層的內容通過 **SHA256** 哈希標識

#### 指令與層的關係

**創建層的指令**：
```dockerfile
FROM ubuntu:22.04      # 層 1
RUN apt-get update     # 層 2
RUN apt-get install -y curl  # 層 3
COPY app.js /app/      # 層 4
```

**不創建層的指令**（僅添加元資料）：
```dockerfile
ENV NODE_ENV=production   # 不創建層
LABEL version="1.0"       # 不創建層
EXPOSE 3000               # 不創建層
CMD ["node", "app.js"]    # 不創建層
WORKDIR /app              # 不創建層
```

**驗證層資訊**：
```bash
# 查看映像歷史（所有層）
docker history myapp:latest

# 查看映像詳細資訊
docker inspect myapp:latest

# 使用 dive 工具分析
dive myapp:latest
```

### 層共享機制

#### 層的共享與復用

**範例**：
```dockerfile
# Image A
FROM node:18-alpine    # 層 1: 177 MB
RUN npm install -g pm2 # 層 2: 10 MB
COPY app-a.js /app/    # 層 3a: 5 MB

# Image B
FROM node:18-alpine    # 層 1: 177 MB（共享）
RUN npm install -g pm2 # 層 2: 10 MB（共享）
COPY app-b.js /app/    # 層 3b: 8 MB
```

**存儲空間**：
```
Image A: 192 MB
Image B: 195 MB
實際佔用: 177 + 10 + 5 + 8 = 200 MB（不是 387 MB）
```

**共享機制**：
```
┌──────────────────────────────┐
│  Image A        Image B      │
│                              │
│  ┌─────┐        ┌─────┐     │
│  │3a(5)│        │3b(8)│     │
│  └──┬──┘        └──┬──┘     │
│     └──────┬───────┘         │
│            ▼                 │
│    ┌──────────────┐          │
│    │  Layer 2(10) │  ← 共享  │
│    └──────┬───────┘          │
│           ▼                  │
│    ┌──────────────┐          │
│    │Layer 1(177)  │  ← 共享  │
│    └──────────────┘          │
└──────────────────────────────┘
```

**驗證共享**：
```bash
# 構建兩個相似映像
docker build -t app-a .
docker build -t app-b .

# 查看實際佔用（注意 SHARED SIZE）
docker system df -v
```

### 層快取機制

#### 快取的工作原理

**快取條件**：
Docker 會檢查以下條件來決定是否使用快取：
1. **指令本身**未變更
2. **上一層**未變更
3. **涉及的檔案內容**未變更（`COPY`、`ADD`）

**範例**：
```dockerfile
FROM node:18-alpine          # 層 1: 使用快取
COPY package*.json ./        # 層 2: 檔案未變，使用快取
RUN npm ci                   # 層 3: 層 2 使用快取，這層也使用快取
COPY . .                     # 層 4: 程式碼變更，快取失效
RUN npm run build            # 層 5: 層 4 失效，這層也失效
```

**快取失效範例**：
```dockerfile
FROM node:18-alpine          # ✅ 快取
RUN apt-get update           # ✅ 快取
COPY package.json ./         # ❌ 檔案變更，快取失效
RUN npm install              # ❌ 上層失效，快取失效
COPY . .                     # ❌ 上層失效，快取失效
```

#### 快取失效的傳播

**失效鏈**：
```
層 1 (FROM)       ✅ 快取有效
    │
    ▼
層 2 (RUN)        ✅ 快取有效
    │
    ▼
層 3 (COPY)       ❌ 檔案變更，快取失效
    │
    ▼
層 4 (RUN)        ❌ 上層失效，快取也失效
    │
    ▼
層 5 (COPY)       ❌ 上層失效，快取也失效
```

**關鍵原則**：
快取失效會**向下傳播**，但不會影響之前的層。

#### 優化快取利用

**❌ 錯誤順序**（快取利用率低）：
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .                    # 程式碼變更頻繁，快取失效
RUN npm install             # 每次都重新安裝依賴
CMD ["node", "app.js"]
```

**✅ 正確順序**（快取利用率高）：
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./       # 依賴檔案變更較少
RUN npm ci                  # 依賴未變時使用快取
COPY . .                    # 程式碼變更，只影響這層之後
CMD ["node", "app.js"]
```

**優化效果**：
```
錯誤順序：
程式碼變更 → 重新安裝依賴（2-3 分鐘）

正確順序：
程式碼變更 → 使用快取的依賴（5-10 秒）
```

### 層大小優化

#### 查看層大小

**使用 docker history**：
```bash
docker history myapp:latest

# 輸出：
# IMAGE          CREATED        CREATED BY                    SIZE
# a1b2c3d4e5f6   2 hours ago    CMD ["node" "app.js"]         0B
# b2c3d4e5f6a1   2 hours ago    COPY . .                      20MB
# c3d4e5f6a1b2   2 hours ago    RUN npm install               150MB
# d4e5f6a1b2c3   2 hours ago    FROM node:18-alpine           177MB
```

**使用 dive**：
```bash
# 安裝 dive
brew install dive

# 分析映像
dive myapp:latest

# 互動式查看：
# - 每層的大小
# - 每層添加/修改/刪除的檔案
# - 映像效率評分
```

#### 減小層大小的策略

**1. 合併 RUN 指令**

**❌ 多個 RUN**（創建多層）：
```dockerfile
RUN apt-get update              # 層 1: 30 MB
RUN apt-get install -y curl     # 層 2: 5 MB
RUN apt-get install -y git      # 層 3: 10 MB
RUN rm -rf /var/lib/apt/lists/* # 層 4: 0 MB（但層 1-3 的快取仍存在）
```

**總大小**：30 + 5 + 10 = 45 MB

**✅ 合併 RUN**（單層）：
```dockerfile
RUN apt-get update && \
    apt-get install -y \
        curl \
        git && \
    rm -rf /var/lib/apt/lists/*
```

**總大小**：15 MB（清理在同一層）

**原理**：
```
多個 RUN：
層 1: 增加 30 MB
層 2: 增加 5 MB
層 3: 增加 10 MB
層 4: 刪除檔案（標記 whiteout，不減少大小）

合併 RUN：
層 1: 增加 15 MB（安裝 + 清理在同一層）
```

**2. 清理臨時檔案和快取**

**❌ 保留快取**：
```dockerfile
RUN apt-get update && \
    apt-get install -y curl
# /var/lib/apt/lists/ 保留快取
```

**✅ 清理快取**：
```dockerfile
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*
# 清理 apt 快取
```

**各包管理器的清理**：
```dockerfile
# Debian/Ubuntu
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Alpine
RUN apk add --no-cache curl
# --no-cache: 不保留索引

# Python
RUN pip install --no-cache-dir -r requirements.txt
# --no-cache-dir: 不保留快取

# Node.js
RUN npm ci && \
    npm cache clean --force
```

**3. 使用 .dockerignore**

**問題**：
```bash
COPY . .
# 複製所有檔案，包括不必要的：
# - node_modules/ (150 MB)
# - .git/ (50 MB)
# - *.log (10 MB)
```

**解決**：
```.dockerignore
node_modules
.git
.gitignore
*.log
*.md
.env
.vscode
dist
coverage
```

**效果**：
```
未使用 .dockerignore: 220 MB
使用 .dockerignore: 10 MB
```

**4. 多階段構建**

**❌ 單階段**（包含構建工具）：
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci                      # 包含 devDependencies
COPY . .
RUN npm run build               # 構建工具留在映像中
CMD ["node", "dist/index.js"]

# 最終映像: 1.2 GB
```

**✅ 多階段**（僅生產依賴）：
```dockerfile
# 階段 1: 構建
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 階段 2: 生產
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production    # 僅生產依賴
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/index.js"]

# 最終映像: 200 MB
```

**大小對比**：
```
單階段: 1.2 GB
├─ 基礎映像: 995 MB
├─ devDependencies: 150 MB
├─ 構建工具: 50 MB
└─ 應用程式: 5 MB

多階段: 200 MB
├─ Alpine 基礎映像: 177 MB
├─ 生產依賴: 20 MB
└─ 應用程式: 3 MB
```

### 層的內部結構

#### OverlayFS 層存儲

**存儲位置**：
```bash
/var/lib/docker/overlay2/
├── <layer-id-1>/
│   ├── diff/           # 該層的檔案內容
│   ├── link            # 短鏈接名稱
│   └── lower           # 下層的引用
├── <layer-id-2>/
│   ├── diff/
│   ├── link
│   └── lower
└── l/                  # 符號鏈接目錄
    ├── ABC -> ../layer-id-1/diff
    └── DEF -> ../layer-id-2/diff
```

**查看層內容**：
```bash
# 找到層 ID
docker inspect myapp | grep -A 20 GraphDriver

# 查看層內容
ls -la /var/lib/docker/overlay2/<layer-id>/diff/

# 查看層的大小
du -sh /var/lib/docker/overlay2/<layer-id>/diff/
```

#### Whiteout 檔案

**刪除檔案的處理**：
```dockerfile
FROM ubuntu:22.04
RUN apt-get update              # 層 1: 添加 /var/lib/apt/lists/
RUN rm -rf /var/lib/apt/lists/* # 層 2: 標記為 whiteout
```

**層 2 的內容**：
```bash
ls -la /var/lib/docker/overlay2/<layer-2-id>/diff/var/lib/apt/
# .wh.lists  ← whiteout 檔案
```

**問題**：
- 層 1 仍然包含檔案
- 映像大小**不會減少**

**解決方案**：
在同一層刪除：
```dockerfile
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*  # 在同一層刪除
```

### 映像構建優化技巧

#### 1. 利用構建快取

**使用 BuildKit**：
```bash
# 啟用 BuildKit
export DOCKER_BUILDKIT=1

# 或在 daemon.json
{
  "features": {
    "buildkit": true
  }
}
```

**BuildKit 優勢**：
- 並行構建不相依的層
- 更智能的快取
- 支援 `--cache-from` 和 `--cache-to`

**使用外部快取**：
```bash
# 構建並推送快取
docker buildx build \
  --cache-to=type=registry,ref=myrepo/myapp:cache \
  -t myapp:latest .

# 使用快取構建
docker buildx build \
  --cache-from=type=registry,ref=myrepo/myapp:cache \
  -t myapp:latest .
```

#### 2. 最小化層數量

**❌ 過多層**：
```dockerfile
FROM alpine
RUN apk add curl
RUN apk add git
RUN apk add vim
RUN apk add htop
# 4 層
```

**✅ 合併層**：
```dockerfile
FROM alpine
RUN apk add --no-cache \
    curl \
    git \
    vim \
    htop
# 1 層
```

**注意事項**：
- 不要過度合併（影響快取利用）
- 將變更頻繁的指令分開

**平衡範例**：
```dockerfile
FROM node:18-alpine

# 安裝系統依賴（很少變更）
RUN apk add --no-cache python3 make g++

# 安裝 Node 依賴（中頻變更）
COPY package*.json ./
RUN npm ci

# 複製程式碼（高頻變更）
COPY . .

# 構建（高頻變更）
RUN npm run build
```

#### 3. 選擇合適的基礎映像

**映像大小對比**：
```dockerfile
# 完整映像
FROM ubuntu:22.04           # 77 MB
FROM node:18                # 995 MB

# 精簡映像
FROM alpine:3.18            # 7 MB
FROM node:18-alpine         # 177 MB

# Distroless
FROM gcr.io/distroless/node # 118 MB

# Scratch
FROM scratch                # 0 MB
```

**選擇建議**：
```
開發環境: 完整映像（包含除錯工具）
    ↓
測試環境: Slim 映像
    ↓
生產環境: Alpine 或 Distroless
    ↓
靜態編譯: Scratch
```

#### 4. 使用 ARG 和 Build-time 變數

```dockerfile
ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-alpine

ARG BUILD_ENV=production
ENV NODE_ENV=${BUILD_ENV}

# 構建時傳入
# docker build --build-arg NODE_VERSION=20 .
```

### 映像大小分析工具

#### docker history

```bash
docker history myapp:latest

# 顯示每層的大小
# 找出大型層
# 識別優化機會
```

#### dive

```bash
dive myapp:latest

# 互動式分析：
# - 層大小排序
# - 檔案變更追蹤
# - 效率評分
# - 浪費空間識別
```

#### docker-slim

```bash
# 自動精簡映像
docker-slim build myapp:latest

# 可以減少 30x - 70x
# 移除不必要的檔案和工具
```

### 完整優化範例

**優化前**：
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["node", "dist/index.js"]

# 映像大小: 1.2 GB
# 構建時間: 3 分鐘（每次）
```

**優化後**：
```dockerfile
# 階段 1: 依賴
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# 階段 2: 構建
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && \
    rm -rf src tests docs

# 階段 3: 生產
FROM node:18-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --chown=nodejs:nodejs package.json ./
USER nodejs
CMD ["node", "dist/index.js"]

# 映像大小: 180 MB
# 構建時間: 10 秒（使用快取）
```

**改進總結**：
- 映像大小：1.2 GB → 180 MB（**減少 85%**）
- 構建時間：3 分鐘 → 10 秒（**提升 18x**）
- 安全性：使用非 root 用戶
- 效率：多階段構建 + 快取優化

### 最佳實踐

**1. 優化層順序**
```dockerfile
# 將變更較少的指令放前面
FROM base-image          # 很少變更
RUN install-packages     # 偶爾變更
COPY dependencies        # 中頻變更
COPY source-code         # 高頻變更
```

**2. 合併 RUN 指令並清理**
```dockerfile
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*
```

**3. 使用 .dockerignore**
```dockerignore
node_modules
.git
*.log
```

**4. 使用多階段構建**
```dockerfile
FROM builder AS build
...
FROM runtime
COPY --from=build ...
```

**5. 選擇精簡基礎映像**
```dockerfile
FROM node:18-alpine  # 而非 node:18
```

**6. 啟用 BuildKit**
```bash
export DOCKER_BUILDKIT=1
```

**7. 分析映像大小**
```bash
dive myapp:latest
docker history myapp:latest
```

## 總結

**核心概念**：
- 映像由多個**唯讀層**組成
- 層通過 **SHA256** 哈希標識
- 層可以在映像間**共享**
- 快取機制基於**指令和內容**

**優化策略**：
- **快取優化**：將變更少的指令放前面
- **層大小優化**：合併 RUN、清理快取
- **多階段構建**：分離構建和運行環境
- **精簡基礎映像**：使用 Alpine 或 Distroless

**關鍵指標**：
- 映像大小
- 構建時間
- 快取命中率
- 層數量

**工具**：
- docker history（檢視層）
- dive（分析映像）
- BuildKit（高效構建）
- docker-slim（自動精簡）

理解映像層機制是構建**高效、精簡 Docker 映像**的基礎。
