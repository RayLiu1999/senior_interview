# Docker Compose 與多容器編排

- **難度**: 5
- **標籤**: `Docker`, `Docker Compose`, `Orchestration`

## 問題詳述

請說明 Docker Compose 的工作原理、使用場景和最佳實踐,包括服務定義、網路配置、Volume 管理和生產環境部署。

## 核心理論與詳解

### 什麼是 Docker Compose

**定義**：
Docker Compose 是一個用於定義和運行**多容器 Docker 應用**的工具。

**核心概念**：
- 使用 **YAML 檔案**定義服務
- 使用**單一命令**啟動所有服務
- 管理容器間的**依賴關係**和**網路**

**架構圖**：
```
┌────────────────────────────────────────────┐
│         docker-compose.yml                 │
│                                            │
│  services:                                 │
│    web:    ───────────┐                   │
│    api:    ───────────┤                   │
│    db:     ───────────┤                   │
│    cache:  ───────────┘                   │
└────────────┬───────────────────────────────┘
             │ docker-compose up
             ▼
┌────────────────────────────────────────────┐
│         Docker Engine                      │
│                                            │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │ Web  │  │ API  │  │  DB  │  │Cache │  │
│  └───┬──┘  └───┬──┘  └───┬──┘  └───┬──┘  │
│      │         │         │         │      │
│      └─────────┴─────────┴─────────┘      │
│           Custom Network                   │
└────────────────────────────────────────────┘
```

### 基本使用

#### 簡單範例

**docker-compose.yml**：
```yaml
version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html
  
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: secret
    volumes:
      - db-data:/var/lib/mysql

volumes:
  db-data:
```

**常用命令**：
```bash
# 啟動所有服務
docker-compose up

# 背景執行
docker-compose up -d

# 停止服務
docker-compose down

# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs -f web
```

#### 完整的 Web 應用範例

```yaml
version: '3.8'

services:
  # 前端
  web:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - API_URL=http://api:4000
    depends_on:
      - api
    networks:
      - frontend
  
  # 後端 API
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/mydb
      - REDIS_URL=redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
    networks:
      - frontend
      - backend
    volumes:
      - ./backend:/app
      - /app/node_modules
  
  # 資料庫
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - db-data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - backend
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5
  
  # Redis 快取
  cache:
    image: redis:7-alpine
    networks:
      - backend
    volumes:
      - cache-data:/data
    command: redis-server --appendonly yes

volumes:
  db-data:
  cache-data:

networks:
  frontend:
  backend:
```

### 服務定義 (Services)

#### 基本配置

```yaml
services:
  myapp:
    # 使用現有映像
    image: nginx:alpine
    
    # 或從 Dockerfile 構建
    build:
      context: ./app
      dockerfile: Dockerfile
      args:
        - NODE_ENV=production
    
    # 容器名稱
    container_name: myapp-container
    
    # 重啟策略
    restart: unless-stopped
    
    # 端口映射
    ports:
      - "8080:80"
      - "443:443"
    
    # 環境變數
    environment:
      - NODE_ENV=production
      - API_KEY=secret
    
    # 或使用 env 檔案
    env_file:
      - .env
      - .env.local
    
    # Volume 掛載
    volumes:
      - ./data:/data
      - app-logs:/var/log
    
    # 網路
    networks:
      - frontend
      - backend
    
    # 依賴關係
    depends_on:
      - db
      - cache
```

#### Build 配置

**基本構建**：
```yaml
services:
  app:
    build: ./app
    # 等同於：docker build ./app
```

**進階構建**：
```yaml
services:
  app:
    build:
      context: ./app
      dockerfile: Dockerfile.prod
      args:
        - BUILD_ENV=production
        - VERSION=1.0.0
      target: production
      cache_from:
        - myapp:latest
      labels:
        - "com.example.version=1.0"
```

**使用建構參數（ARG）**：
```dockerfile
# Dockerfile
ARG BUILD_ENV=development
FROM node:18-alpine
RUN echo "Building for ${BUILD_ENV}"
```

```yaml
# docker-compose.yml
services:
  app:
    build:
      context: ./app
      args:
        BUILD_ENV: production
```

#### 重啟策略

```yaml
services:
  app:
    restart: no              # 預設：不重啟
    # restart: always         # 總是重啟
    # restart: on-failure     # 失敗時重啟
    # restart: unless-stopped # 除非手動停止，否則重啟
```

**選擇建議**：
- **開發環境**：`no` 或 `on-failure`
- **生產環境**：`unless-stopped`（避免意外停止）

#### 健康檢查

```yaml
services:
  db:
    image: postgres:15
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
```

**配合 depends_on 使用**：
```yaml
services:
  api:
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
```

### 網路 (Networks)

#### 預設網路

**自動創建的網路**：
```yaml
version: '3.8'
services:
  web:
    image: nginx
  api:
    image: myapi
# Docker Compose 自動創建 default 網路
# 所有服務都連接到這個網路
```

**服務間通訊**：
```bash
# 在 web 容器內
curl http://api:4000
# 使用服務名稱作為 hostname
```

#### 自訂網路

**定義多個網路**：
```yaml
version: '3.8'

services:
  web:
    image: nginx
    networks:
      - frontend
  
  api:
    image: myapi
    networks:
      - frontend
      - backend
  
  db:
    image: postgres
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # 隔離外部網路
```

**網路拓撲**：
```
┌─────────────────────────────────────┐
│         Frontend Network            │
│                                     │
│   ┌──────┐       ┌──────┐          │
│   │ Web  │◄─────►│ API  │          │
│   └──────┘       └───┬──┘          │
│                      │              │
└──────────────────────┼──────────────┘
                       │
┌──────────────────────┼──────────────┐
│         Backend Network             │
│                      │              │
│                  ┌───▼──┐          │
│                  │  DB  │          │
│                  └──────┘          │
│              (隔離外部存取)         │
└─────────────────────────────────────┘
```

#### 網路別名

```yaml
services:
  api:
    networks:
      backend:
        aliases:
          - api-server
          - backend-api
  
  worker:
    networks:
      - backend
    # worker 可使用 api-server 或 backend-api 存取 api
```

#### 使用外部網路

```yaml
networks:
  existing-network:
    external: true
    name: my-pre-existing-network
```

### Volume 管理

#### 定義 Volume

```yaml
version: '3.8'

services:
  db:
    image: postgres
    volumes:
      # 具名 Volume
      - db-data:/var/lib/postgresql/data
      
      # Bind Mount
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
      
      # 匿名 Volume
      - /var/log/postgresql

volumes:
  db-data:
    driver: local
```

#### 共享 Volume

```yaml
services:
  app:
    volumes:
      - shared-data:/data
  
  backup:
    volumes:
      - shared-data:/data:ro  # 唯讀

volumes:
  shared-data:
```

#### Volume 驅動

```yaml
volumes:
  db-data:
    driver: local
    driver_opts:
      type: nfs
      o: addr=192.168.1.100,rw
      device: ":/path/to/dir"
```

### 環境變數

#### 定義方式

**方法 1：直接定義**：
```yaml
services:
  app:
    environment:
      - NODE_ENV=production
      - API_KEY=secret123
```

**方法 2：使用 .env 檔案**：
```bash
# .env
NODE_ENV=production
API_KEY=secret123
DATABASE_URL=postgres://localhost/mydb
```

```yaml
services:
  app:
    env_file:
      - .env
```

**方法 3：變數替換**：
```yaml
services:
  app:
    image: myapp:${VERSION:-latest}
    ports:
      - "${PORT:-3000}:3000"
    environment:
      - API_URL=${API_URL}
```

```bash
# .env
VERSION=1.0.0
PORT=8080
API_URL=http://api.example.com
```

#### 環境變數優先級

```
1. Compose file (高)
2. Shell environment variables
3. .env file
4. Dockerfile (低)
```

**範例**：
```bash
# .env
NODE_ENV=development

# docker-compose.yml
services:
  app:
    environment:
      - NODE_ENV=production  # 這個會優先
```

### 依賴管理

#### depends_on

**基本用法**：
```yaml
services:
  api:
    depends_on:
      - db
      - cache
    # api 會在 db 和 cache 之後啟動
```

**限制**：
- 只確保**啟動順序**
- 不等待服務**就緒**

**配合健康檢查**：
```yaml
services:
  api:
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
  
  db:
    healthcheck:
      test: ["CMD", "pg_isready"]
      interval: 5s
```

#### 啟動順序範例

```yaml
version: '3.8'

services:
  web:
    depends_on:
      api:
        condition: service_healthy
  
  api:
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 10s
  
  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      interval: 5s
  
  cache:
    image: redis:alpine
```

**啟動順序**：
```
1. cache (無依賴)
2. db    (無依賴)
3. 等待 db 健康
4. api   (db 和 cache 就緒)
5. 等待 api 健康
6. web   (api 就緒)
```

### 日誌管理

#### 查看日誌

```bash
# 所有服務
docker-compose logs

# 特定服務
docker-compose logs web

# 跟隨日誌
docker-compose logs -f

# 最近 N 行
docker-compose logs --tail=100 api
```

#### 日誌驅動

```yaml
services:
  app:
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

**支援的驅動**：
- `json-file`（預設）
- `syslog`
- `journald`
- `gelf`
- `fluentd`
- `awslogs`

### 多環境配置

#### 使用多個 Compose 檔案

**base 配置**：
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    environment:
      - NODE_ENV=development
```

**生產環境覆蓋**：
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    image: myapp:1.0.0
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

**使用**：
```bash
# 開發環境
docker-compose up

# 生產環境
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

#### Override 檔案

**預設覆蓋**：
```bash
# docker-compose.override.yml (自動載入)
version: '3.8'
services:
  app:
    volumes:
      - ./src:/app/src  # 開發環境掛載程式碼
```

```bash
docker-compose up
# 自動合併 docker-compose.yml 和 docker-compose.override.yml
```

### 擴展 (Scaling)

#### 手動擴展

```bash
# 啟動 3 個 worker 容器
docker-compose up -d --scale worker=3

# 縮減到 1 個
docker-compose up -d --scale worker=1
```

**配置**：
```yaml
services:
  worker:
    image: myworker
    # 不要指定 container_name（會衝突）
    # 不要指定固定端口（會衝突）
```

#### 負載均衡範例

```yaml
version: '3.8'

services:
  nginx:
    image: nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
  
  app:
    build: .
    # 不指定端口，由 nginx 內部存取
    expose:
      - "3000"

# 啟動多個 app 實例
# docker-compose up -d --scale app=3
```

**nginx 配置**：
```nginx
upstream app {
    server app:3000;
}

server {
    location / {
        proxy_pass http://app;
    }
}
```

### 生產環境部署

#### 生產配置範例

```yaml
version: '3.8'

services:
  web:
    image: myapp:${VERSION}
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    volumes:
      - /etc/ssl:/etc/ssl:ro
      - logs:/var/log/nginx
    networks:
      - frontend
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "5"

volumes:
  logs:
    driver: local

networks:
  frontend:
    driver: bridge
```

#### 安全性考量

**不在 Compose 檔案中存儲密鑰**：
```yaml
# ❌ 錯誤
services:
  db:
    environment:
      - POSTGRES_PASSWORD=mysecretpassword

# ✅ 正確
services:
  db:
    env_file:
      - .env.secret  # Git ignore 這個檔案
```

**使用 secrets（Swarm mode）**：
```yaml
version: '3.8'
services:
  db:
    image: postgres
    secrets:
      - db-password

secrets:
  db-password:
    external: true
```

### 常用命令總結

```bash
# 啟動
docker-compose up -d

# 停止
docker-compose down

# 停止並刪除 Volume
docker-compose down -v

# 重新構建
docker-compose build

# 重新構建並啟動
docker-compose up -d --build

# 查看狀態
docker-compose ps

# 查看日誌
docker-compose logs -f [service]

# 執行命令
docker-compose exec web sh

# 擴展服務
docker-compose up -d --scale worker=3

# 驗證配置
docker-compose config

# 拉取映像
docker-compose pull
```

### 除錯技巧

#### 驗證配置

```bash
# 檢查配置語法
docker-compose config

# 查看合併後的配置
docker-compose -f docker-compose.yml -f docker-compose.prod.yml config
```

#### 查看網路和 Volume

```bash
# 列出網路
docker network ls | grep $(basename $(pwd))

# 查看網路詳情
docker network inspect <network-name>

# 列出 Volume
docker volume ls | grep $(basename $(pwd))
```

#### 進入容器除錯

```bash
# 執行 shell
docker-compose exec web sh

# 以 root 執行
docker-compose exec -u root web sh

# 查看日誌
docker-compose logs --tail=100 web
```

### 最佳實踐

**1. 使用版本控制**
```yaml
version: '3.8'  # 指定 Compose 版本
```

**2. 使用 .env 檔案**
```bash
# .env
VERSION=1.0.0
PORT=8080
```

**3. 敏感資訊不放入程式碼庫**
```bash
# .gitignore
.env.production
.env.secret
```

**4. 定義明確的網路**
```yaml
networks:
  frontend:
  backend:
    internal: true
```

**5. 使用健康檢查**
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost/health"]
  interval: 30s
```

**6. 定義資源限制（生產環境）**
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
```

**7. 使用具名 Volume**
```yaml
volumes:
  db-data:
    driver: local
```

**8. 添加重啟策略**
```yaml
restart: unless-stopped
```

## 總結

**核心概念**：
- 使用 YAML 定義多容器應用
- 服務間自動網路連接
- 簡化的 Volume 和環境變數管理
- 依賴關係和啟動順序

**關鍵配置**：
- **services**：定義容器
- **networks**：定義網路拓撲
- **volumes**：定義持久化存儲
- **depends_on**：定義依賴關係

**使用場景**：
- 開發環境（快速啟動完整應用）
- 測試環境（隔離的多服務環境）
- 小型生產環境（單主機部署）
- CI/CD（自動化測試）

**限制**：
- 單主機部署（不適合大規模集群）
- 需要 Docker Swarm 或 Kubernetes 實現高可用

Docker Compose 是開發和小型部署的理想選擇，但大規模生產環境應考慮使用 Kubernetes。
