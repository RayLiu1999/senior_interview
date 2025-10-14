# Django 部署最佳實踐

- **難度**: 7
- **重要性**: 4
- **標籤**: `Deployment`, `Gunicorn`, `Production`

## 問題詳述

Django 應用的部署涉及 Web 服務器配置、WSGI 服務器選擇、靜態文件處理、資料庫遷移等多個環節，正確的部署策略能確保應用的穩定性和性能。

## 核心理論與詳解

### Django 部署架構

典型的 Django 生產環境架構：

```
瀏覽器 → 反向代理(Nginx/Apache) → WSGI 服務器(Gunicorn/uWSGI) → Django 應用
         ↓
      靜態文件/媒體文件(CDN)
         ↓
      資料庫(PostgreSQL/MySQL)
         ↓
      緩存(Redis/Memcached)
```

### WSGI 服務器選擇

#### Gunicorn（推薦）

最流行的 Python WSGI 服務器，配置簡單：

```bash
# 安裝
pip install gunicorn

# 基本啟動
gunicorn myproject.wsgi:application --bind 0.0.0.0:8000

# 使用配置文件
gunicorn -c gunicorn_config.py myproject.wsgi:application
```

配置文件 `gunicorn_config.py`：

```python
import multiprocessing

# 綁定地址
bind = "0.0.0.0:8000"

# Worker 進程數量（CPU 核心數 * 2 + 1）
workers = multiprocessing.cpu_count() * 2 + 1

# Worker 類型
worker_class = "sync"  # 或 "gevent", "eventlet"

# 每個 worker 的線程數
threads = 2

# Worker 超時時間
timeout = 30

# 訪問日誌
accesslog = "/var/log/gunicorn/access.log"
errorlog = "/var/log/gunicorn/error.log"
loglevel = "info"

# 優雅重啟時的最大請求數
max_requests = 1000
max_requests_jitter = 50

# Daemon 模式
daemon = False

# PID 文件
pidfile = "/var/run/gunicorn.pid"

# 預加載應用（節省內存但無法優雅重啟單個 worker）
preload_app = True
```

#### uWSGI

功能更豐富但配置複雜：

```ini
# uwsgi.ini
[uwsgi]
chdir = /path/to/project
module = myproject.wsgi:application
master = true
processes = 4
threads = 2
socket = /tmp/myproject.sock
chmod-socket = 666
vacuum = true
die-on-term = true
```

### 反向代理配置

#### Nginx（推薦）

```nginx
# /etc/nginx/sites-available/myproject
upstream django {
    server unix:///tmp/gunicorn.sock;
    # 或使用 TCP socket
    # server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name example.com www.example.com;
    
    # 訪問日誌
    access_log /var/log/nginx/myproject_access.log;
    error_log /var/log/nginx/myproject_error.log;
    
    # 客戶端上傳大小限制
    client_max_body_size 10M;
    
    # 靜態文件
    location /static/ {
        alias /path/to/project/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # 媒體文件
    location /media/ {
        alias /path/to/project/media/;
        expires 7d;
    }
    
    # Django 應用
    location / {
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # 超時設置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # SSL 重定向
    # return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name example.com www.example.com;
    
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    # SSL 優化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 其他配置與 HTTP 相同
    # ...
}
```

#### Apache

```apache
<VirtualHost *:80>
    ServerName example.com
    ServerAlias www.example.com
    
    # 靜態文件
    Alias /static/ /path/to/project/static/
    <Directory /path/to/project/static>
        Require all granted
    </Directory>
    
    # 媒體文件
    Alias /media/ /path/to/project/media/
    <Directory /path/to/project/media>
        Require all granted
    </Directory>
    
    # WSGI 配置
    WSGIDaemonProcess myproject python-path=/path/to/project python-home=/path/to/venv
    WSGIProcessGroup myproject
    WSGIScriptAlias / /path/to/project/myproject/wsgi.py
    
    <Directory /path/to/project/myproject>
        <Files wsgi.py>
            Require all granted
        </Files>
    </Directory>
</VirtualHost>
```

### 環境變量和配置管理

#### 使用 python-decouple

```python
# settings.py
from decouple import config, Csv

DEBUG = config('DEBUG', default=False, cast=bool)
SECRET_KEY = config('SECRET_KEY')
ALLOWED_HOSTS = config('ALLOWED_HOSTS', cast=Csv())

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}
```

`.env` 文件：

```bash
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=example.com,www.example.com
DB_NAME=mydb
DB_USER=dbuser
DB_PASSWORD=dbpassword
DB_HOST=localhost
DB_PORT=5432
```

#### 分離配置文件

```python
# settings/
# ├── __init__.py
# ├── base.py
# ├── development.py
# ├── production.py
# └── testing.py

# settings/base.py - 通用配置
INSTALLED_APPS = [...]
MIDDLEWARE = [...]

# settings/production.py
from .base import *

DEBUG = False
ALLOWED_HOSTS = ['example.com']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT'),
    }
}

# 啟動時指定配置
# python manage.py runserver --settings=myproject.settings.production
```

### 靜態文件處理

#### 收集靜態文件

```python
# settings.py
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# 靜態文件存儲（使用 whitenoise）
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

```bash
# 收集靜態文件
python manage.py collectstatic --noinput
```

#### 使用 WhiteNoise

簡化靜態文件服務：

```python
# settings.py
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # 添加在這裡
    # ...
]

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### 資料庫遷移

#### 安全的遷移流程

```bash
# 1. 備份資料庫
pg_dump mydb > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. 檢查遷移
python manage.py showmigrations

# 3. 檢查 SQL（可選）
python manage.py sqlmigrate app_name migration_name

# 4. 應用遷移
python manage.py migrate --noinput

# 5. 驗證
python manage.py check --deploy
```

#### 零停機遷移策略

對於生產環境的大表：

1. **階段 1**：添加新字段（允許 NULL）
2. **階段 2**：部署代碼，開始填充新字段
3. **階段 3**：數據遷移完成後，設置新字段為 NOT NULL
4. **階段 4**：移除舊字段

### 日誌配置

```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'filters': {
        'require_debug_false': {
            'filter': '()': 'django.utils.log.RequireDebugFalse',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/django/django.log',
            'maxBytes': 1024 * 1024 * 15,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler',
            'filters': ['require_debug_false'],
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file', 'mail_admins'],
            'level': 'INFO',
            'propagate': False,
        },
        'myapp': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
```

### 使用 Docker 部署

#### Dockerfile

```dockerfile
FROM python:3.11-slim

# 設置環境變量
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# 工作目錄
WORKDIR /app

# 安裝系統依賴
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 安裝 Python 依賴
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# 複製項目文件
COPY . .

# 收集靜態文件
RUN python manage.py collectstatic --noinput

# 創建非 root 用戶
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

# 暴露端口
EXPOSE 8000

# 啟動命令
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "myproject.wsgi:application"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=mydb
      - POSTGRES_USER=dbuser
      - POSTGRES_PASSWORD=dbpassword
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  web:
    build: .
    command: gunicorn myproject.wsgi:application --bind 0.0.0.0:8000
    volumes:
      - .:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      - db
      - redis
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - web
    restart: unless-stopped

volumes:
  postgres_data:
  static_volume:
  media_volume:
```

### 健康檢查

```python
# health/views.py
from django.http import JsonResponse
from django.db import connection

def health_check(request):
    """健康檢查端點"""
    try:
        # 檢查資料庫連接
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        return JsonResponse({
            'status': 'healthy',
            'database': 'ok'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e)
        }, status=500)

# urls.py
urlpatterns = [
    path('health/', health_check, name='health_check'),
]
```

### 監控和性能追蹤

#### 使用 Sentry

```python
# settings.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[DjangoIntegration()],
    traces_sample_rate=0.1,
    send_default_pii=True,
    environment="production"
)
```

### Systemd 服務配置

```ini
# /etc/systemd/system/gunicorn.service
[Unit]
Description=Gunicorn daemon for Django project
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/path/to/project
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/gunicorn \
          --workers 3 \
          --bind unix:/run/gunicorn.sock \
          myproject.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

啟用服務：

```bash
sudo systemctl daemon-reload
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
sudo systemctl status gunicorn
```

### 部署檢查清單

```python
# 運行部署檢查
python manage.py check --deploy
```

檢查項目：

- [ ] DEBUG = False
- [ ] SECRET_KEY 設置為隨機值
- [ ] ALLOWED_HOSTS 正確配置
- [ ] 靜態文件正確收集
- [ ] 資料庫遷移已應用
- [ ] HTTPS 已配置
- [ ] 安全中間件已啟用
- [ ] CSRF 保護已啟用
- [ ] 日誌已配置
- [ ] 錯誤監控已設置
- [ ] 備份策略已實施

## 程式碼範例

```python
# settings/production.py - 生產環境配置
import os
from .base import *

DEBUG = False
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# 安全設置
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# 資料庫
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'CONN_MAX_AGE': 600,
        'OPTIONS': {
            'connect_timeout': 10,
        }
    }
}

# 緩存
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.environ.get('REDIS_URL', 'redis://127.0.0.1:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'SOCKET_CONNECT_TIMEOUT': 5,
            'SOCKET_TIMEOUT': 5,
        }
    }
}

# 郵件
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
```

## 總結

Django 部署是一個系統性工程，需要考慮 WSGI 服務器、反向代理、靜態文件、資料庫、緩存、日誌、監控等多個方面。使用 Gunicorn + Nginx 是最常見的部署方案，配合 Docker 可以簡化部署流程。正確配置環境變量、啟用安全設置、實施日誌和監控、建立健康檢查和備份策略是確保生產環境穩定運行的關鍵。
