# Flask 應用上下文與請求上下文

- **難度**: 8
- **標籤**: `Context`, `Application Context`, `Request Context`

## 問題詳述

Flask 的上下文系統是理解 Flask 工作原理的關鍵。應用上下文和請求上下文有什麼區別？它們如何工作？

## 核心理論與詳解

### 為什麼需要上下文？

**問題背景**
- Flask 需要處理多個請求
- Python 的全局變量不適合多線程環境
- 需要一種機制讓代碼訪問"當前"的請求或應用對象

**解決方案**
- 使用線程局部變量 (Thread Local)
- 提供代理對象 (`current_app`, `request`, `g`, `session`)
- 自動管理上下文的創建和銷毀

### 兩種上下文

**應用上下文 (Application Context)**
- 存儲應用級別的數據
- 綁定到特定的 Flask 應用實例
- 代理對象：`current_app`, `g`

**請求上下文 (Request Context)**
- 存儲請求級別的數據
- 綁定到特定的 HTTP 請求
- 代理對象：`request`, `session`

### 上下文堆疊

**工作原理**
- Flask 使用堆疊 (Stack) 管理上下文
- 允許應用嵌套（如測試時）
- 請求上下文自動推入應用上下文

**堆疊結構**
```
請求結束 ← [請求上下文] ← [應用上下文] ← 應用啟動
```

### 代理對象詳解

**current_app**
- 代理當前應用實例
- 訪問應用配置：`current_app.config`
- 調用應用方法：`current_app.logger`

**request**
- 代理當前請求對象
- 訪問請求數據：`request.args`, `request.form`, `request.json`
- 訪問請求信息：`request.method`, `request.url`, `request.headers`

**g**
- 請求級別的全局變量
- 每個請求獨立的命名空間
- 常用於存儲用戶信息、數據庫連接等

**session**
- 用戶會話數據
- 基於 Cookie 實現
- 需要設置 `SECRET_KEY`

### 上下文生命週期

**請求處理流程**
1. 請求到達，Flask 推入請求上下文
2. 如果沒有應用上下文，自動推入應用上下文
3. 執行視圖函數
4. 生成響應
5. 彈出請求上下文
6. 如果應用上下文是自動推入的，一起彈出

**手動管理上下文**
```python
# 在視圖外部訪問請求對象
with app.test_request_context('/'):
    print(request.path)

# 推入應用上下文
with app.app_context():
    print(current_app.name)
```

### 上下文局部變量

**LocalStack 和 LocalProxy**
- Flask 使用 `werkzeug.local.LocalStack` 實現上下文堆疊
- 使用 `werkzeug.local.LocalProxy` 創建代理對象
- 基於 `threading.local` 或 `greenlet.getcurrent()`

**為什麼使用代理？**
- 延遲求值：只在訪問時才查找實際對象
- 簡化 API：統一的訪問方式
- 支持多應用：在同一進程中運行多個 Flask 應用

### g 對象使用模式

**存儲請求級數據**
```python
@app.before_request
def load_user():
    g.user = get_current_user()

@app.route('/profile')
def profile():
    return f"Hello {g.user.name}"
```

**數據庫連接管理**
```python
def get_db():
    if 'db' not in g:
        g.db = connect_to_database()
    return g.db

@app.teardown_appcontext
def close_db(error):
    if hasattr(g, 'db'):
        g.db.close()
```

### 應用上下文用途

**配置訪問**
```python
from flask import current_app

def send_email():
    smtp_server = current_app.config['SMTP_SERVER']
    # ...
```

**日誌記錄**
```python
current_app.logger.info('Processing request')
```

**CLI 命令**
```python
@app.cli.command()
def init_db():
    with app.app_context():
        db.create_all()
```

### 測試中的上下文

**test_request_context**
```python
def test_something():
    with app.test_request_context('/'):
        assert request.path == '/'
```

**test_client**
- 自動管理上下文
- 模擬完整的請求-響應週期

### 常見問題

**RuntimeError: Working outside of application context**
- 原因：在沒有應用上下文時訪問 `current_app` 或 `g`
- 解決：手動推入應用上下文

**RuntimeError: Working outside of request context**
- 原因：在沒有請求上下文時訪問 `request` 或 `session`
- 解決：使用 `test_request_context` 或在視圖函數中訪問

### 最佳實踐

1. **理解上下文邊界**：知道什麼時候有上下文，什麼時候沒有
2. **使用 g 存儲請求數據**：避免傳遞大量參數
3. **及時清理資源**：使用 `teardown` 鉤子
4. **避免長時間持有上下文**：可能導致內存洩漏
5. **測試時明確管理上下文**：使用 `app_context()` 或 `test_request_context()`

## 程式碼範例

```python
from flask import Flask, request, g, current_app, session
from werkzeug.local import LocalProxy

app = Flask(__name__)
app.secret_key = 'secret'

# 基本的上下文使用
@app.route('/')
def index():
    # 請求上下文中可以訪問 request
    print(f"Request method: {request.method}")
    print(f"Request path: {request.path}")
    
    # 可以訪問 current_app
    print(f"App name: {current_app.name}")
    
    return "Hello World"

# 使用 g 對象存儲用戶信息
@app.before_request
def load_user():
    """在每個請求前加載用戶"""
    user_id = session.get('user_id')
    if user_id:
        g.user = User.query.get(user_id)
    else:
        g.user = None

@app.route('/profile')
def profile():
    """使用 g 對象訪問用戶"""
    if g.user is None:
        return "Not logged in", 401
    return f"Hello {g.user.name}"

# 數據庫連接管理
def get_db():
    """獲取數據庫連接（存儲在 g 中）"""
    if 'db' not in g:
        g.db = connect_to_database()
        print("Database connected")
    return g.db

@app.teardown_appcontext
def teardown_db(exception):
    """請求結束時關閉數據庫連接"""
    db = g.pop('db', None)
    if db is not None:
        db.close()
        print("Database closed")

@app.route('/users')
def get_users():
    """使用數據庫連接"""
    db = get_db()
    users = db.query("SELECT * FROM users")
    return {"users": users}

# 手動管理應用上下文
def send_email_background():
    """後台任務需要手動推入應用上下文"""
    with app.app_context():
        smtp = current_app.config['SMTP_SERVER']
        # 發送郵件...
        current_app.logger.info("Email sent")

# 手動管理請求上下文
def test_view():
    """在視圖外測試"""
    with app.test_request_context('/', method='POST'):
        # 現在可以訪問 request
        print(request.method)  # POST
        print(request.path)    # /

# 自定義代理對象
def get_current_user():
    """從 g 中獲取當前用戶"""
    return getattr(g, 'user', None)

# 創建代理
current_user = LocalProxy(get_current_user)

@app.route('/dashboard')
def dashboard():
    """使用自定義代理"""
    if current_user is None:
        return "Not logged in", 401
    # current_user 等同於 g.user
    return f"Dashboard for {current_user.name}"

# CLI 命令中使用應用上下文
@app.cli.command()
def init_db():
    """初始化數據庫"""
    with app.app_context():
        # 可以訪問 current_app
        print(f"Initializing database for {current_app.name}")
        db = get_db()
        db.create_tables()

# 多應用場景
def create_app(config):
    app = Flask(__name__)
    app.config.from_object(config)
    
    @app.route('/')
    def index():
        # current_app 會指向正確的應用實例
        return current_app.name
    
    return app

app1 = create_app('config.Production')
app2 = create_app('config.Development')

# 測試示例
def test_profile():
    """測試上下文使用"""
    with app.test_request_context():
        # 模擬登錄用戶
        with app.test_client() as client:
            with client.session_transaction() as sess:
                sess['user_id'] = 1
            
            # 發送請求
            response = client.get('/profile')
            assert response.status_code == 200

# 錯誤處理示例
@app.errorhandler(RuntimeError)
def handle_runtime_error(error):
    """處理上下文相關錯誤"""
    if "application context" in str(error):
        current_app.logger.error("Application context error")
        return "Internal Server Error", 500
    raise error

# 信號與上下文
from flask import request_started, request_finished

def log_request(sender, **extra):
    """請求開始時記錄"""
    print(f"Request started: {request.path}")

def log_response(sender, response, **extra):
    """請求結束時記錄"""
    print(f"Request finished: {response.status_code}")

request_started.connect(log_request, app)
request_finished.connect(log_response, app)
```

## 相關資源

- [Flask Application Context](https://flask.palletsprojects.com/en/stable/appcontext/)
- [Flask Request Context](https://flask.palletsprojects.com/en/stable/reqcontext/)
- [Understanding Flask Context](https://testdriven.io/blog/flask-contexts/)
