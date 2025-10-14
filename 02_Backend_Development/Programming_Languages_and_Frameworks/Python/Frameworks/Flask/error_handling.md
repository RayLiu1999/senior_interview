# Flask 錯誤處理

- **難度**: 6
- **重要性**: 4
- **標籤**: `Error Handling`, `Exception`, `HTTP Errors`

## 問題詳述

解釋 Flask 中的錯誤處理機制，包括錯誤處理器註冊、自定義錯誤頁面、異常捕獲以及統一錯誤響應格式。

## 核心理論與詳解

### Flask 錯誤處理基礎

Flask 提供多種錯誤處理機制來優雅地處理應用中的異常和 HTTP 錯誤。

**核心組件**：
- **errorhandler**：註冊錯誤處理器
- **abort()**：主動拋出 HTTP 錯誤
- **HTTPException**：HTTP 異常基類
- **try-except**：Python 異常處理

### 使用 abort 拋出錯誤

```python
from flask import Flask, abort

app = Flask(__name__)

@app.route('/user/<int:user_id>')
def get_user(user_id):
    user = User.query.get(user_id)
    if user is None:
        abort(404, description="用戶不存在")
    return {"user": user.to_dict()}

@app.route('/admin')
def admin_only():
    if not current_user.is_admin:
        abort(403)  # Forbidden
    return {"message": "歡迎管理員"}
```

### 註冊錯誤處理器

**處理特定 HTTP 狀態碼**

```python
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()  # 回滾數據庫事務
    return render_template('500.html'), 500

# API 錯誤響應
@app.errorhandler(404)
def api_not_found(error):
    return {
        "error": "not_found",
        "message": str(error.description)
    }, 404
```

**處理特定異常類型**

```python
from sqlalchemy.exc import IntegrityError

@app.errorhandler(IntegrityError)
def handle_integrity_error(error):
    db.session.rollback()
    return {
        "error": "integrity_error",
        "message": "數據完整性約束違反"
    }, 400

@app.errorhandler(ValueError)
def handle_value_error(error):
    return {
        "error": "validation_error",
        "message": str(error)
    }, 400
```

### 自定義異常類

```python
class APIException(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        super().__init__()
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv

@app.errorhandler(APIException)
def handle_api_exception(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response

# 使用
@app.route('/process')
def process():
    if not valid_input():
        raise APIException('無效的輸入', status_code=400)
```

### Blueprint 級別的錯誤處理

```python
from flask import Blueprint

api_bp = Blueprint('api', __name__)

@api_bp.errorhandler(404)
def api_not_found(error):
    return {"error": "endpoint_not_found"}, 404

@api_bp.app_errorhandler(500)
def api_server_error(error):
    # 適用於整個應用
    return {"error": "internal_server_error"}, 500
```

### 統一錯誤響應格式

```python
def create_error_response(status_code, message, **kwargs):
    response = {
        "status": "error",
        "code": status_code,
        "message": message,
        **kwargs
    }
    return jsonify(response), status_code

@app.errorhandler(400)
def bad_request(error):
    return create_error_response(400, "請求無效")

@app.errorhandler(401)
def unauthorized(error):
    return create_error_response(
        401,
        "未授權訪問",
        www_authenticate='Bearer realm="API"'
    )
```

### 日誌記錄

```python
import logging
from flask import request

logger = logging.getLogger(__name__)

@app.errorhandler(Exception)
def handle_exception(error):
    logger.error(f"""
        Path: {request.path}
        Method: {request.method}
        IP: {request.remote_addr}
        Error: {str(error)}
    """, exc_info=True)
    
    return {"error": "internal_server_error"}, 500
```

### 最佳實踐

**1. 區分開發和生產環境**
```python
if app.debug:
    # 開發環境：顯示詳細錯誤
    pass
else:
    # 生產環境：隱藏敏感信息
    @app.errorhandler(Exception)
    def production_error(error):
        return {"error": "服務器錯誤"}, 500
```

**2. 返回適當的狀態碼**
- 400：請求錯誤
- 401：未認證
- 403：無權限
- 404：資源不存在
- 500：服務器錯誤

**3. 提供有用的錯誤信息**
```python
return {
    "error": "validation_error",
    "message": "請求數據驗證失敗",
    "fields": {
        "email": "郵箱格式不正確"
    }
}, 422
```

## 關鍵要點

Flask 提供了靈活的錯誤處理機制，通過 errorhandler 裝飾器註冊錯誤處理器，支持處理特定 HTTP 狀態碼和異常類型。可以創建自定義異常類實現業務邏輯錯誤處理。Blueprint 支持局部和全局錯誤處理。最佳實踐包括統一錯誤響應格式、適當的狀態碼、詳細的日誌記錄以及區分開發和生產環境的錯誤展示。
