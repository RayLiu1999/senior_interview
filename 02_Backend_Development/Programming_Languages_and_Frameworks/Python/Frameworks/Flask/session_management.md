# Flask 會話管理

- **難度**: 6
- **重要性**: 4
- **標籤**: `Session`, `Cookie`, `Security`

## 問題詳述

解釋 Flask 中的會話管理機制，包括基於 Cookie 的會話、服務器端會話存儲、安全配置以及會話生命週期管理。

## 核心理論與詳解

### Flask 會話基礎

Flask 默認使用 **客戶端會話**，將會話數據加密存儲在 Cookie 中。

**核心特點**：
- 基於簽名的 Cookie
- 使用 SECRET_KEY 加密
- 無需服務器端存儲
- 數據大小限制（4KB）

### 基本使用

```python
from flask import Flask, session, redirect, url_for

app = Flask(__name__)
app.secret_key = 'your-secret-key'

@app.route('/login', methods=['POST'])
def login():
    session['user_id'] = user.id
    session['username'] = user.username
    session.permanent = True  # 持久化會話
    return redirect(url_for('dashboard'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return f"歡迎 {session['username']}"

@app.route('/logout')
def logout():
    session.clear()  # 清除所有會話數據
    return redirect(url_for('login'))
```

### 會話配置

```python
from datetime import timedelta

app.config.update(
    SECRET_KEY='your-secret-key',
    SESSION_COOKIE_NAME='app_session',
    SESSION_COOKIE_HTTPONLY=True,  # 防止 XSS
    SESSION_COOKIE_SECURE=True,    # 僅 HTTPS
    SESSION_COOKIE_SAMESITE='Lax',  # CSRF 保護
    PERMANENT_SESSION_LIFETIME=timedelta(hours=24)
)
```

### 服務器端會話（Flask-Session）

使用 Flask-Session 實現服務器端會話存儲。

```python
from flask import Flask, session
from flask_session import Session

app = Flask(__name__)
app.config.update(
    SECRET_KEY='your-secret-key',
    SESSION_TYPE='redis',  # 或 'filesystem', 'mongodb'
    SESSION_REDIS=redis.Redis(host='localhost', port=6379)
)

Session(app)

# 使用方式與客戶端會話相同
@app.route('/set')
def set_session():
    session['key'] = 'value'
    return 'Session set'
```

### 會話安全

**1. 使用強密鑰**
```python
import secrets
app.secret_key = secrets.token_hex(32)
```

**2. 會話固定攻擊防護**
```python
@app.route('/login', methods=['POST'])
def login():
    # 登錄成功後重新生成會話 ID
    session.clear()
    session.regenerate()  # Flask-Session
    session['user_id'] = user.id
```

**3. 會話超時**
```python
from datetime import datetime

@app.before_request
def check_session_timeout():
    if 'last_activity' in session:
        last_activity = session['last_activity']
        if (datetime.now() - last_activity).seconds > 1800:  # 30 分鐘
            session.clear()
            return redirect(url_for('login'))
    session['last_activity'] = datetime.now()
```

## 關鍵要點

Flask 默認使用基於 Cookie 的客戶端會話，數據經過簽名加密後存儲在客戶端。可以通過 Flask-Session 擴展實現服務器端會話存儲（Redis、MongoDB 等）。會話安全配置包括使用強密鑰、啟用 HttpOnly 和 Secure 標誌、設置會話超時以及防止會話固定攻擊。會話管理是 Web 應用狀態管理的核心，需要在便利性和安全性之間取得平衡。
