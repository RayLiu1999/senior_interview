# Flask 部署與生產環境

- **難度**: 7
- **重要性**: 4
- **標籤**: `Deployment`, `WSGI`, `Gunicorn`

## 問題詳述

解釋 Flask 應用的生產環境部署策略，包括 WSGI 服務器選擇、配置優化、容器化部署、監控日誌以及安全最佳實踐。

## 核心理論與詳解

### WSGI 服務器

Flask 內建的開發服務器不適合生產環境，需要使用專業的 WSGI 服務器。

**Gunicorn（推薦）**
```bash
pip install gunicorn

# 啟動命令
gunicorn -w 4 -b 0.0.0.0:8000 --timeout 120 --log-level info app:app
```

**配置文件 gunicorn.conf.py**
```python
import multiprocessing

bind = "0.0.0.0:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
timeout = 120
keepalive = 5
errorlog = "/var/log/gunicorn/error.log"
accesslog = "/var/log/gunicorn/access.log"
loglevel = "info"
```

### Nginx 反向代理

```nginx
upstream flask_app {
    server 127.0.0.1:8000 fail_timeout=0;
}

server {
    listen 80;
    server_name example.com;
    
    location / {
        proxy_pass http://flask_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /static {
        alias /var/www/app/static;
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

### Docker 部署

**Dockerfile**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "-c", "gunicorn.conf.py", "app:app"]
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - FLASK_ENV=production
      - DATABASE_URL=postgresql://user:pass@db/mydb
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 環境配置

**使用環境變量**
```python
import os

class ProductionConfig:
    DEBUG = False
    SECRET_KEY = os.environ.get('SECRET_KEY')
    DATABASE_URI = os.environ.get('DATABASE_URL')
    REDIS_URL = os.environ.get('REDIS_URL')
```

**.env 文件**
```bash
FLASK_APP=app.py
FLASK_ENV=production
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql://user:pass@localhost/prod_db
```

### 日誌配置

```python
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler(
        'logs/app.log',
        maxBytes=10240000,  # 10MB
        backupCount=10
    )
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('Application startup')
```

### 安全配置

```python
from flask_talisman import Talisman

# 強制 HTTPS
Talisman(app, content_security_policy=None)

# 安全標頭
@app.after_request
def set_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response

# 限流
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=lambda: request.remote_addr,
    default_limits=["200 per day", "50 per hour"]
)

@app.route("/api/expensive")
@limiter.limit("10 per minute")
def expensive_api():
    return "OK"
```

### 健康檢查

```python
@app.route('/health')
def health_check():
    try:
        # 檢查數據庫連接
        db.session.execute('SELECT 1')
        return jsonify({"status": "healthy"}), 200
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500
```

### 監控

**使用 Prometheus**
```python
from prometheus_flask_exporter import PrometheusMetrics

metrics = PrometheusMetrics(app)

# 訪問 /metrics 查看指標
```

### 部署檢查清單

- [ ] 禁用 DEBUG 模式
- [ ] 設置強 SECRET_KEY
- [ ] 配置 HTTPS
- [ ] 設置環境變量
- [ ] 配置日誌
- [ ] 啟用錯誤監控
- [ ] 配置數據庫備份
- [ ] 實施限流
- [ ] 添加健康檢查
- [ ] 配置 CI/CD

## 關鍵要點

Flask 生產部署需要使用 Gunicorn 等 WSGI 服務器，配合 Nginx 反向代理。Docker 容器化簡化部署流程。環境變量管理敏感配置，日誌系統記錄運行狀態。安全措施包括 HTTPS、安全標頭、限流等。健康檢查和監控確保服務穩定性。遵循部署檢查清單可以避免常見問題。生產環境配置與開發環境有顯著區別，需要針對性優化。
