# FastAPI 部署與容器化

- **難度**: 7
- **重要性**: 4
- **標籤**: `Deployment`, `Docker`, `Uvicorn`

## 問題詳述

解釋 FastAPI 應用的部署策略，包括 Docker 容器化、生產環境配置、負載均衡、CI/CD 流程以及雲平台部署。

## 核心理論與詳解

### Uvicorn 生產配置

**基本部署命令**

```bash
# 開發環境
uvicorn app.main:app --reload

# 生產環境
uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 4 \
    --loop uvloop \
    --http httptools \
    --no-access-log
```

**Workers 數量計算**
```
workers = (2 × CPU核心數) + 1
```

### Gunicorn + Uvicorn Workers

使用 Gunicorn 作為進程管理器。

```bash
pip install gunicorn uvicorn[standard]

# 啟動命令
gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
```

**配置文件 gunicorn.conf.py**

```python
import multiprocessing

bind = "0.0.0.0:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"
timeout = 120
keepalive = 5

# 日誌
accesslog = "-"
errorlog = "-"
loglevel = "info"

# 優雅重啟
graceful_timeout = 30
max_requests = 1000
max_requests_jitter = 50
```

### Docker 容器化

**Dockerfile (多階段構建)**

```dockerfile
# 階段 1: 構建階段
FROM python:3.11-slim as builder

WORKDIR /app

# 安裝依賴
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# 階段 2: 運行階段
FROM python:3.11-slim

WORKDIR /app

# 創建非 root 用戶
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# 複製依賴
COPY --from=builder /root/.local /home/appuser/.local
ENV PATH=/home/appuser/.local/bin:$PATH

# 複製應用代碼
COPY --chown=appuser:appuser . .

# 切換用戶
USER appuser

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# 啟動命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml**

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
```

### Nginx 反向代理

**nginx.conf**

```nginx
upstream fastapi_backend {
    least_conn;
    server api:8000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name example.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;
    
    # SSL 配置
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # 安全標頭
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    # 客戶端上傳限制
    client_max_body_size 50M;
    
    # 代理配置
    location / {
        proxy_pass http://fastapi_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超時設置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # WebSocket 支持
    location /ws {
        proxy_pass http://fastapi_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
    
    # 靜態文件
    location /static {
        alias /app/static;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Kubernetes 部署

**deployment.yaml**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fastapi-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fastapi
  template:
    metadata:
      labels:
        app: fastapi
    spec:
      containers:
      - name: fastapi
        image: myregistry/fastapi-app:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: fastapi-service
spec:
  selector:
    app: fastapi
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: LoadBalancer
```

### CI/CD 流程

**GitHub Actions**

```yaml
name: CI/CD

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-cov
    
    - name: Run tests
      run: pytest --cov=app tests/
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: docker build -t myregistry/fastapi-app:${{ github.sha }} .
    
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push myregistry/fastapi-app:${{ github.sha }}
    
    - name: Deploy to production
      run: |
        kubectl set image deployment/fastapi-app fastapi=myregistry/fastapi-app:${{ github.sha }}
```

### 環境配置管理

**使用 pydantic-settings**

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "FastAPI App"
    debug: bool = False
    database_url: str
    redis_url: str
    secret_key: str
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

**.env.example**

```bash
APP_NAME="My API"
DEBUG=false
DATABASE_URL=postgresql://user:pass@localhost/db
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-here
```

### 監控和日誌

**結構化日誌**

```python
import logging
import json

class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
        }
        return json.dumps(log_data)

logging.basicConfig(
    level=logging.INFO,
    format='%(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)
logger.handlers[0].setFormatter(JsonFormatter())
```

### 部署最佳實踐

**1. 健康檢查端點**

```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }
```

**2. 優雅關閉**

```python
@app.on_event("shutdown")
async def shutdown_event():
    # 關閉數據庫連接
    await database.disconnect()
    # 關閉 Redis 連接
    await redis.close()
```

**3. 環境隔離**
- 開發、測試、生產環境分離
- 使用環境變量管理配置

**4. 安全措施**
- HTTPS 強制
- 限流和速率限制
- CORS 配置
- 安全標頭

**5. 備份策略**
- 數據庫定期備份
- 配置文件版本控制

## 關鍵要點

FastAPI 部署需要考慮 ASGI 服務器選擇（Uvicorn/Gunicorn）、容器化（Docker）、反向代理（Nginx）、編排（Kubernetes）等多個層面。生產環境配置包括 workers 數量、超時設置、健康檢查、優雅關閉等。使用 Docker 多階段構建可以減小鏡像大小。Nginx 提供負載均衡、SSL 終止和靜態文件服務。CI/CD 流程自動化測試、構建和部署。監控和日誌是保證生產穩定性的關鍵。環境配置管理使用 pydantic-settings 實現類型安全的配置。
