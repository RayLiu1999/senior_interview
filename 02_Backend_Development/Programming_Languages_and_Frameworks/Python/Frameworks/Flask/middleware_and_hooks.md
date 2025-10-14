# Flask 中間件與鉤子

- **難度**: 7
- **重要性**: 4
- **標籤**: `Middleware`, `before_request`, `after_request`

## 問題詳述

解釋 Flask 中的請求生命週期鉤子和中間件機制，包括 before_request、after_request、teardown_request 等鉤子函數的使用場景和執行順序。

## 核心理論與詳解

### Flask 請求生命週期

```
客戶端請求
    ↓
before_first_request (首次請求)
    ↓
before_request (每次請求)
    ↓
視圖函數執行
    ↓
after_request (響應處理)
    ↓
teardown_request (清理資源)
    ↓
響應返回客戶端
```

### 請求前鉤子

**before_first_request**
```python
@app.before_first_request
def init_app():
    # 僅在處理第一個請求前執行一次
    db.create_all()
    init_cache()
```

**before_request**
```python
@app.before_request
def before_request():
    # 每個請求前執行
    g.user = None
    if 'user_id' in session:
        g.user = User.query.get(session['user_id'])
    
    # 記錄請求日誌
    logger.info(f"{request.method} {request.path}")

# 可以返回響應來中斷請求
@app.before_request
def check_maintenance():
    if app.config['MAINTENANCE_MODE']:
        return jsonify({"error": "系統維護中"}), 503
```

### 響應後鉤子

**after_request**
```python
@app.after_request
def after_request(response):
    # 添加自定義標頭
    response.headers['X-Custom-Header'] = 'Value'
    
    # 添加 CORS 標頭
    response.headers['Access-Control-Allow-Origin'] = '*'
    
    # 記錄響應時間
    if hasattr(g, 'start_time'):
        elapsed = time.time() - g.start_time
        response.headers['X-Response-Time'] = str(elapsed)
    
    return response
```

### 請求結束鉤子

**teardown_request**
```python
@app.teardown_request
def teardown_request(exception):
    # 清理資源（無論是否發生異常都會執行）
    if hasattr(g, 'db'):
        g.db.close()
    
    if exception:
        logger.error(f"請求異常: {exception}")

@app.teardown_appcontext
def teardown_db(exception):
    # 應用上下文結束時執行
    db = g.pop('db', None)
    if db is not None:
        db.close()
```

### Blueprint 級別的鉤子

```python
from flask import Blueprint

api_bp = Blueprint('api', __name__)

@api_bp.before_request
def api_before_request():
    # 僅作用於 Blueprint 的請求
    verify_api_key()

@api_bp.after_request
def api_after_request(response):
    response.headers['X-API-Version'] = 'v1'
    return response
```

### 應用場景

**1. 認證和授權**
```python
@app.before_request
def require_login():
    allowed_routes = ['login', 'register', 'static']
    if request.endpoint not in allowed_routes and 'user_id' not in session:
        return redirect(url_for('login'))
```

**2. 請求日誌**
```python
import time

@app.before_request
def start_timer():
    g.start_time = time.time()

@app.after_request
def log_request(response):
    if hasattr(g, 'start_time'):
        elapsed = time.time() - g.start_time
        logger.info(f"{request.method} {request.path} - {response.status_code} - {elapsed:.3f}s")
    return response
```

**3. 數據庫會話管理**
```python
@app.before_request
def before_request():
    g.db = get_db_session()

@app.teardown_request
def teardown_request(exception):
    db = g.pop('db', None)
    if db is not None:
        if exception:
            db.rollback()
        db.close()
```

**4. CORS 處理**
```python
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response
```

### 執行順序

當有多個鉤子時：
```python
# 註冊順序
@app.before_request
def first():
    print("First before")

@app.before_request
def second():
    print("Second before")

@app.after_request
def first_after(response):
    print("First after")
    return response

@app.after_request
def second_after(response):
    print("Second after")
    return response

# 執行順序：
# First before → Second before → 視圖函數 → Second after → First after
```

### WSGI 中間件

對於更底層的中間件需求，可以使用 WSGI 中間件：

```python
class CustomMiddleware:
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        # 請求前處理
        print("Before request")
        
        # 調用應用
        response = self.app(environ, start_response)
        
        # 響應後處理
        print("After request")
        
        return response

# 包裝應用
app.wsgi_app = CustomMiddleware(app.wsgi_app)
```

## 關鍵要點

Flask 提供了豐富的請求生命週期鉤子，包括 before_request、after_request、teardown_request 等，用於在請求處理的不同階段執行邏輯。鉤子函數按照註冊順序執行，after_request 以相反順序執行。常見應用場景包括認證授權、日誌記錄、數據庫會話管理、CORS 處理等。Blueprint 支持局部鉤子，僅作用於特定的路由組。理解鉤子的執行順序和使用場景是構建健壯 Flask 應用的關鍵。
