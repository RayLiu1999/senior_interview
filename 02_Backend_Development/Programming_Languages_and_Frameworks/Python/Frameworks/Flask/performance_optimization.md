# Flask 性能優化

- **難度**: 7
- **重要性**: 4
- **標籤**: `Performance`, `Caching`, `Optimization`

## 問題詳述

解釋 Flask 應用的性能優化策略，包括緩存、數據庫優化、異步處理、靜態資源優化以及性能監控。

## 核心理論與詳解

### 緩存策略

**Flask-Caching**
```python
from flask_caching import Cache

cache = Cache(app, config={
    'CACHE_TYPE': 'redis',
    'CACHE_REDIS_URL': 'redis://localhost:6379/0'
})

@app.route('/expensive')
@cache.cached(timeout=300)
def expensive_operation():
    result = perform_heavy_computation()
    return result

# 手動緩存
def get_user_data(user_id):
    cache_key = f'user:{user_id}'
    data = cache.get(cache_key)
    if data is None:
        data = User.query.get(user_id).to_dict()
        cache.set(cache_key, data, timeout=600)
    return data
```

### 數據庫優化

**查詢優化**
```python
# 避免 N+1 查詢
from sqlalchemy.orm import joinedload

users = User.query.options(joinedload(User.posts)).all()

# 使用索引
class User(db.Model):
    email = db.Column(db.String, unique=True, index=True)

# 分頁
users = User.query.paginate(page=1, per_page=20, error_out=False)

# 只查詢需要的字段
users = db.session.query(User.id, User.username).all()
```

**連接池配置**
```python
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_size': 10,
    'pool_recycle': 3600,
    'pool_pre_ping': True
}
```

### 異步處理

**使用 Celery 處理長時間任務**
```python
from celery import Celery

celery = Celery(app.name, broker='redis://localhost:6379/0')

@celery.task
def send_email(recipient, subject, body):
    # 發送郵件
    pass

@app.route('/register', methods=['POST'])
def register():
    # 註冊邏輯
    user = create_user(form.data)
    
    # 異步發送郵件
    send_email.delay(user.email, '歡迎', '感謝註冊')
    
    return redirect(url_for('dashboard'))
```

### 靜態資源優化

**使用 CDN**
```python
app.config['CDN_DOMAIN'] = 'https://cdn.example.com'

@app.context_processor
def inject_cdn():
    return {'cdn_url': app.config['CDN_DOMAIN']}

# 模板中
<img src="{{ cdn_url }}/images/logo.png">
```

**資源壓縮**
```python
from flask_compress import Compress

Compress(app)  # 自動 GZIP 壓縮響應
```

### 生產環境配置

**使用 Gunicorn**
```bash
gunicorn -w 4 -b 0.0.0.0:8000 --timeout 120 app:app
```

**Nginx 反向代理**
```nginx
upstream flask_app {
    server 127.0.0.1:8000;
}

server {
    location / {
        proxy_pass http://flask_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /static {
        alias /path/to/static;
        expires 30d;
    }
}
```

### 性能監控

**使用 Flask-Profiler**
```python
from flask_profiler import Profiler

app.config['flask_profiler'] = {
    'enabled': True,
    'storage': {
        'engine': 'sqlite'
    }
}

profiler = Profiler()
profiler.init_app(app)
```

### 最佳實踐

1. **使用連接池**：避免頻繁創建數據庫連接
2. **啟用緩存**：緩存頻繁訪問的數據
3. **異步處理**：耗時任務使用 Celery
4. **查詢優化**：避免 N+1 查詢，使用索引
5. **資源壓縮**：啟用 GZIP 壓縮
6. **CDN 加速**：靜態資源使用 CDN
7. **監控告警**：實時監控性能指標

## 關鍵要點

Flask 性能優化涉及多個層面：緩存（Redis/Memcached）減少重複計算，數據庫優化（索引、查詢優化、連接池）提升查詢效率，異步處理（Celery）避免阻塞，靜態資源優化（CDN、壓縮）加快加載速度。生產環境使用 Gunicorn + Nginx 部署。性能監控幫助識別瓶頸。整體優化需要根據實際場景綜合考慮，平衡性能和複雜度。
