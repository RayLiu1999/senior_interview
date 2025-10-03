# Dockerfile 最佳實踐

- **難度**: 6
- **標籤**: `Docker`, `Dockerfile`, `Optimization`

## 問題詳述

請說明編寫 Dockerfile 的最佳實踐，包括多階段構建、層快取優化、映像大小優化和安全性考量。

## 核心理論與詳解

### 理解 Docker 映像層

#### 映像層的工作原理

```
┌─────────────────────────────────────┐
│  容器層 (Container Layer)           │  ← 可讀寫
│  變更存儲在這裡                      │
├─────────────────────────────────────┤
│  映像層 4: CMD ["app"]               │  ↑
├─────────────────────────────────────┤  │
│  映像層 3: COPY . /app               │  │ 唯讀
├─────────────────────────────────────┤  │
│  映像層 2: RUN apt-get install      │  │
├─────────────────────────────────────┤  │
│  映像層 1: FROM ubuntu:22.04         │  ↓
└─────────────────────────────────────┘
```

**每個指令都創建一層**：
- `FROM`、`RUN`、`COPY`、`ADD` 等會創建新層
- `ENV`、`LABEL`、`EXPOSE` 等只添加元資料（不增加大小）
- 層是**唯讀**的
- 層是**可共享**的

**層快取機制**：
```dockerfile
FROM node:18              # 層 1: 快取
RUN apt-get update        # 層 2: 快取（如果之前構建過）
COPY package.json .       # 層 3: 如果檔案未變，使用快取
RUN npm install           # 層 4: 如果層 3 使用快取，這層也使用快取
COPY . .                  # 層 5: 程式碼變更，快取失效
```

### 基礎映像選擇

#### 映像大小對比

```bash
# 完整映像
node:18                   # 995MB
ubuntu:22.04              # 77MB

# 精簡映像
node:18-slim              # 244MB
alpine:3.18               # 7MB

# 極致精簡
node:18-alpine            # 177MB
scratch                   # 0MB（空映像）
```

#### 選擇建議

**開發環境**：
```dockerfile
# 使用完整映像（包含除錯工具）
FROM node:18
```

**生產環境**：
```dockerfile
# 使用 Alpine 或 Slim
FROM node:18-alpine
# 或
FROM node:18-slim
```

**靜態編譯程式**：
```dockerfile
# 使用 scratch（最小）
FROM scratch
COPY --from=builder /app/binary /
CMD ["/binary"]
```

#### Alpine vs. Debian/Ubuntu

| 特性 | Alpine | Debian/Ubuntu |
|------|--------|---------------|
| **大小** | 極小 (7MB) | 較大 (77MB+) |
| **包管理** | apk | apt-get |
| **C 函式庫** | musl libc | glibc |
| **相容性** | 可能有問題 | 高 |
| **安全更新** | 快速 | 穩定 |

**選擇建議**：
- Go、Rust 等靜態編譯：Alpine 或 scratch
- Node.js、Python：Alpine（注意相容性）
- 複雜依賴（如 ML 函式庫）：Debian/Ubuntu

### 多階段構建 (Multi-stage Build)

#### 為什麼需要多階段構建

**問題：單階段構建**：
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install              # 包含 devDependencies
COPY . .
RUN npm run build            # 構建工具留在映像中
CMD ["node", "dist/index.js"]

# 問題：
# 1. 包含構建工具和依賴 (devDependencies)
# 2. 映像體積大
# 3. 潛在安全風險
```

**解決方案：多階段構建**：
```dockerfile
# 階段 1: 構建階段
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci                         # 安裝所有依賴
COPY . .
RUN npm run build                  # 構建應用

# 階段 2: 生產階段
FROM node:18-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production       # 僅安裝生產依賴
COPY --from=builder /app/dist ./dist
USER node
CMD ["node", "dist/index.js"]

# 優勢：
# 1. 只包含生產依賴
# 2. 構建工具不在最終映像中
# 3. 映像體積小
```

#### Go 應用範例

```dockerfile
# 階段 1: 構建
FROM golang:1.21-alpine AS builder
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

# 階段 2: 運行
FROM scratch
COPY --from=builder /build/app /app
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
ENTRYPOINT ["/app"]

# 最終映像大小：~10MB（僅包含二進制檔案）
```

#### Python 應用範例

```dockerfile
# 階段 1: 構建
FROM python:3.11-slim AS builder
WORKDIR /app
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 階段 2: 運行
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
COPY . .
ENV PATH="/opt/venv/bin:$PATH"
CMD ["python", "app.py"]
```

### 層快取優化

#### 指令順序優化

**❌ 錯誤順序**（快取經常失效）：
```dockerfile
FROM node:18
WORKDIR /app
COPY . .                        # 程式碼變更會使快取失效
RUN npm install                 # 每次都重新安裝依賴
CMD ["node", "index.js"]
```

**✅ 正確順序**（最大化快取利用）：
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./           # 先複製依賴檔案
RUN npm ci                      # 依賴不變時使用快取
COPY . .                        # 最後複製程式碼
CMD ["node", "index.js"]
```

**原理**：
```
變更頻率：程式碼 > 依賴 > 基礎映像
構建順序：基礎映像 → 依賴 → 程式碼
```

#### 分離依賴和程式碼

**Go 範例**：
```dockerfile
FROM golang:1.21-alpine
WORKDIR /app

# 1. 先複製依賴檔案
COPY go.mod go.sum ./
RUN go mod download             # 快取這層

# 2. 再複製程式碼
COPY . .
RUN go build -o app .
```

**Python 範例**：
```dockerfile
FROM python:3.11-slim
WORKDIR /app

# 1. 先安裝依賴
COPY requirements.txt .
RUN pip install -r requirements.txt    # 快取這層

# 2. 再複製程式碼
COPY . .
CMD ["python", "app.py"]
```

#### 使用 .dockerignore

```dockerignore
# .dockerignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.vscode
dist
coverage
*.test
*.md
```

**效益**：
- 減少 COPY 的檔案數量
- 加快構建速度
- 避免將敏感資訊複製到映像

### RUN 指令優化

#### 合併 RUN 指令

**❌ 多個 RUN 指令**（創建多層）：
```dockerfile
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y git
RUN apt-get install -y vim
RUN rm -rf /var/lib/apt/lists/*
# 創建 5 層，且前 4 層包含快取
```

**✅ 合併成一個 RUN**（創建一層）：
```dockerfile
RUN apt-get update && \
    apt-get install -y \
        curl \
        git \
        vim && \
    rm -rf /var/lib/apt/lists/*
# 只創建 1 層，且清理在同一層
```

**關鍵原則**：
- 在同一層中**安裝和清理**
- 使用 `&&` 連接命令
- 使用 `\` 換行提高可讀性

#### Alpine 包管理

```dockerfile
# Alpine 使用 apk
RUN apk add --no-cache \
        curl \
        git \
        vim
# --no-cache: 不保留包索引，減小映像大小
```

#### 清理快取和臨時檔案

**Debian/Ubuntu**：
```dockerfile
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*
#       ^^^^^^^^^^^^^^^^^^^^^^^^
#       清理 apt 快取
```

**Node.js**：
```dockerfile
RUN npm ci && \
    npm cache clean --force
#   ^^^^^^^^^^^^^^^^^^^^^^^
#   清理 npm 快取
```

**Python**：
```dockerfile
RUN pip install --no-cache-dir -r requirements.txt
#               ^^^^^^^^^^^^^^
#               不保留快取
```

### 映像大小優化

#### 選擇精簡基礎映像

```dockerfile
# 從 995MB 減少到 177MB
FROM node:18              # 995MB
↓
FROM node:18-alpine       # 177MB
```

#### 移除不必要的檔案

```dockerfile
COPY . .
RUN npm run build && \
    rm -rf src tests docs *.md && \
    npm prune --production
#   ^^^^^^^^^^^^^^^^^^^^^
#   移除 devDependencies
```

#### 使用 .dockerignore

```dockerignore
# 排除大型檔案和目錄
node_modules
.git
dist
coverage
*.log
*.md
```

#### 映像大小比較工具

```bash
# 查看映像大小
docker images myapp

# 查看映像層
docker history myapp

# 詳細分析（使用 dive）
dive myapp
```

### 安全性最佳實踐

#### 使用非 root 用戶

**❌ 使用 root 運行**（安全風險）：
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
CMD ["node", "index.js"]
# 預設以 root 運行
```

**✅ 使用非特權用戶**：
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY --chown=node:node . .
USER node
CMD ["node", "index.js"]
```

**創建自訂用戶**：
```dockerfile
FROM alpine:3.18
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup
USER appuser
CMD ["./app"]
```

#### 掃描漏洞

```bash
# 使用 Docker Scan
docker scan myapp:latest

# 使用 Trivy
trivy image myapp:latest

# 使用 Snyk
snyk container test myapp:latest
```

#### 使用 COPY 而非 ADD

```dockerfile
# ❌ ADD 會自動解壓縮，行為不明確
ADD archive.tar.gz /app/

# ✅ COPY 行為明確
COPY archive.tar.gz /app/
```

**例外**：僅在需要自動解壓縮時使用 ADD

#### 固定版本

**❌ 使用 latest 標籤**（不可預測）：
```dockerfile
FROM node:latest
```

**✅ 固定版本**（可重現構建）：
```dockerfile
FROM node:18.17.1-alpine3.18
```

#### 最小化安裝

```dockerfile
# 僅安裝必要的包
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*
#          ^^^^^^^^^^^^^^^^^^^^
#          --no-install-recommends: 不安裝建議的包
```

### HEALTHCHECK

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .

# 健康檢查
HEALTHCHECK --interval=30s \
            --timeout=3s \
            --start-period=5s \
            --retries=3 \
    CMD node healthcheck.js || exit 1

CMD ["node", "index.js"]
```

**參數說明**：
- `--interval`: 檢查間隔
- `--timeout`: 超時時間
- `--start-period`: 啟動寬限期
- `--retries`: 失敗重試次數

### 完整範例：Node.js 應用

```dockerfile
# 多階段構建 + 所有最佳實踐
# 階段 1: 依賴安裝
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
    npm prune --production

# 階段 3: 生產運行
FROM node:18-alpine AS production
WORKDIR /app

# 創建非 root 用戶
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 僅複製必要檔案
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --chown=nodejs:nodejs package.json ./

# 切換到非 root 用戶
USER nodejs

# 暴露端口
EXPOSE 3000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 啟動應用
CMD ["node", "dist/index.js"]
```

### 完整範例：Go 應用

```dockerfile
# 階段 1: 構建
FROM golang:1.21-alpine AS builder

# 安裝構建依賴
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /build

# 快取依賴層
COPY go.mod go.sum ./
RUN go mod download

# 複製程式碼並構建
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -a -installsuffix cgo \
    -ldflags="-w -s" \
    -o app .

# 階段 2: 最終映像
FROM scratch

# 複製必要檔案
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /build/app /app

# 設置時區
ENV TZ=UTC

# 運行應用
ENTRYPOINT ["/app"]

# 最終映像大小: ~10-15MB
```

### 除錯技巧

#### 查看構建過程

```bash
# 詳細構建日誌
docker build --progress=plain --no-cache -t myapp .

# 在特定階段停止
docker build --target builder -t myapp:builder .
docker run -it myapp:builder sh
```

#### 檢查映像層

```bash
# 查看層歷史
docker history myapp

# 使用 dive 分析
dive myapp
```

#### 測試多階段構建的特定階段

```bash
# 構建並運行 builder 階段
docker build --target builder -t myapp:builder .
docker run -it myapp:builder sh

# 檢查構建產物
ls -lh /app/dist
```

### 最佳實踐清單

**基礎映像**：
- ✅ 使用官方映像
- ✅ 固定版本標籤
- ✅ 優先使用 Alpine 或 Slim
- ✅ 考慮使用 scratch（靜態編譯）

**層優化**：
- ✅ 將變更頻率低的指令放前面
- ✅ 先複製依賴檔案，再複製程式碼
- ✅ 合併 RUN 指令
- ✅ 在同一層中安裝和清理

**映像大小**：
- ✅ 使用多階段構建
- ✅ 使用 .dockerignore
- ✅ 清理包管理器快取
- ✅ 移除構建工具和依賴

**安全性**：
- ✅ 使用非 root 用戶
- ✅ 掃描漏洞
- ✅ 最小化安裝
- ✅ 使用 COPY 而非 ADD
- ✅ 不在映像中存儲密鑰

**可維護性**：
- ✅ 添加 LABEL 元資料
- ✅ 添加 HEALTHCHECK
- ✅ 使用 ARG 參數化構建
- ✅ 註釋複雜的 RUN 指令

## 總結

**核心概念**：
- 每個指令創建一層
- 層是唯讀且可共享的
- 快取機制提升構建速度
- 多階段構建減小映像大小

**優化策略**：
- 選擇合適的基礎映像
- 正確排序指令（依賴 → 程式碼）
- 合併 RUN 指令
- 使用多階段構建

**安全考量**：
- 使用非 root 用戶
- 固定版本
- 掃描漏洞
- 最小化安裝

**工具**：
- docker history（檢視層）
- dive（分析映像）
- docker scan / trivy（漏洞掃描）
- .dockerignore（排除檔案）

掌握這些最佳實踐能構建**小巧、快速、安全**的 Docker 映像。
