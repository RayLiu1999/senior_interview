# FastAPI 錯誤處理

- **難度**: 6
- **重要性**: 4
- **標籤**: `Error Handling`, `Exception`, `HTTPException`

## 問題詳述

解釋 FastAPI 中的異常處理機制，包括內建異常類型、自定義異常處理器、驗證錯誤處理以及統一錯誤響應的最佳實踐。

## 核心理論與詳解

### FastAPI 異常處理概述

FastAPI 提供了完整的異常處理機制，能夠優雅地處理各種錯誤情況並返回標準化的錯誤響應。

**核心特性**：
- **HTTPException**：標準 HTTP 錯誤
- **RequestValidationError**：請求驗證錯誤
- **自定義異常處理器**：全局異常處理
- **狀態碼管理**：標準化的 HTTP 狀態碼

### HTTPException

這是 FastAPI 中最常用的異常類型。

**基本使用**

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    if item_id not in items_db:
        raise HTTPException(
            status_code=404,
            detail="項目不存在"
        )
    return items_db[item_id]
```

**帶自定義標頭的異常**

```python
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    if item_id not in items_db:
        raise HTTPException(
            status_code=404,
            detail="項目不存在",
            headers={"X-Error": "Item-Not-Found"}
        )
    return items_db[item_id]
```

### 自定義異常類

創建特定業務場景的異常類。

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

class ItemNotFoundException(Exception):
    def __init__(self, item_id: int):
        self.item_id = item_id

class InsufficientPermissionException(Exception):
    def __init__(self, message: str):
        self.message = message

app = FastAPI()

# 註冊異常處理器
@app.exception_handler(ItemNotFoundException)
async def item_not_found_handler(request: Request, exc: ItemNotFoundException):
    return JSONResponse(
        status_code=404,
        content={
            "error": "item_not_found",
            "message": f"項目 {exc.item_id} 不存在",
            "item_id": exc.item_id
        }
    )

@app.exception_handler(InsufficientPermissionException)
async def permission_denied_handler(request: Request, exc: InsufficientPermissionException):
    return JSONResponse(
        status_code=403,
        content={
            "error": "permission_denied",
            "message": exc.message
        }
    )

# 使用自定義異常
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    if item_id not in items_db:
        raise ItemNotFoundException(item_id)
    return items_db[item_id]
```

### 驗證錯誤處理

Pydantic 驗證失敗時自動拋出 **RequestValidationError**。

**自定義驗證錯誤響應**

```python
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, validator

app = FastAPI()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(x) for x in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "validation_error",
            "message": "請求數據驗證失敗",
            "details": errors
        }
    )

class Item(BaseModel):
    name: str
    price: float
    
    @validator("price")
    def price_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("價格必須大於 0")
        return v

@app.post("/items/")
async def create_item(item: Item):
    return item
```

### 全局異常處理器

處理未捕獲的異常。

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import traceback
import logging

logger = logging.getLogger(__name__)

app = FastAPI()

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # 記錄完整錯誤信息
    logger.error(f"未處理的異常: {traceback.format_exc()}")
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": "服務器內部錯誤",
            "request_id": str(uuid.uuid4())  # 用於追蹤
        }
    )
```

### 統一錯誤響應格式

創建標準化的錯誤響應結構。

```python
from typing import Optional, List
from pydantic import BaseModel

class ErrorDetail(BaseModel):
    field: Optional[str] = None
    message: str
    code: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[List[ErrorDetail]] = None
    request_id: Optional[str] = None

def create_error_response(
    error: str,
    message: str,
    status_code: int,
    details: Optional[List[ErrorDetail]] = None
) -> JSONResponse:
    content = ErrorResponse(
        error=error,
        message=message,
        details=details,
        request_id=str(uuid.uuid4())
    ).dict(exclude_none=True)
    
    return JSONResponse(
        status_code=status_code,
        content=content
    )

# 使用示例
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    if item_id not in items_db:
        return create_error_response(
            error="not_found",
            message="項目不存在",
            status_code=404
        )
    return items_db[item_id]
```

### 業務異常分層

根據不同的業務場景創建異常層次。

```python
class AppException(Exception):
    """應用基礎異常"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code

class NotFoundException(AppException):
    """資源不存在"""
    def __init__(self, resource: str, resource_id: any):
        super().__init__(
            message=f"{resource} {resource_id} 不存在",
            status_code=404
        )
        self.resource = resource
        self.resource_id = resource_id

class ValidationException(AppException):
    """業務驗證失敗"""
    def __init__(self, message: str, field: str = None):
        super().__init__(message, status_code=400)
        self.field = field

class UnauthorizedException(AppException):
    """未授權"""
    def __init__(self, message: str = "未授權訪問"):
        super().__init__(message, status_code=401)

class ForbiddenException(AppException):
    """權限不足"""
    def __init__(self, message: str = "權限不足"):
        super().__init__(message, status_code=403)

# 統一的異常處理器
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return create_error_response(
        error=exc.__class__.__name__.replace("Exception", "").lower(),
        message=exc.message,
        status_code=exc.status_code
    )

# 使用示例
@app.get("/users/{user_id}")
async def get_user(user_id: int):
    user = await user_service.get_user(user_id)
    if not user:
        raise NotFoundException("User", user_id)
    return user
```

### 異步異常處理

處理異步操作中的異常。

```python
import asyncio
from fastapi import BackgroundTasks

async def risky_async_task():
    try:
        # 可能失敗的異步操作
        async with httpx.AsyncClient() as client:
            response = await client.get("https://api.example.com/data")
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        logger.error(f"HTTP 請求失敗: {e}")
        raise AppException("外部 API 調用失敗", status_code=503)
    except asyncio.TimeoutError:
        logger.error("請求超時")
        raise AppException("請求超時", status_code=504)

@app.get("/fetch-data")
async def fetch_data():
    try:
        data = await risky_async_task()
        return {"data": data}
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
```

### 錯誤日誌記錄

完整記錄錯誤信息以便追蹤和調試。

```python
import logging
import sys
from datetime import datetime

# 配置日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("errors.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

@app.exception_handler(Exception)
async def logged_exception_handler(request: Request, exc: Exception):
    request_id = str(uuid.uuid4())
    
    # 記錄詳細錯誤信息
    logger.error(
        f"Request ID: {request_id}\n"
        f"Path: {request.url.path}\n"
        f"Method: {request.method}\n"
        f"Client: {request.client.host}\n"
        f"Exception: {exc.__class__.__name__}\n"
        f"Message: {str(exc)}\n"
        f"Traceback:\n{traceback.format_exc()}"
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": "服務器內部錯誤",
            "request_id": request_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
```

### 依賴注入中的異常處理

在依賴函數中處理異常。

```python
from fastapi import Depends, HTTPException

async def verify_token(token: str = Header(...)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token 已過期",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="無效的 Token",
            headers={"WWW-Authenticate": "Bearer"}
        )

@app.get("/protected")
async def protected_route(payload: dict = Depends(verify_token)):
    return {"user_id": payload["sub"]}
```

### 錯誤處理最佳實踐

**1. 明確的錯誤分類**
- 4xx：客戶端錯誤（驗證失敗、未授權等）
- 5xx：服務器錯誤（系統故障、外部服務失敗等）

**2. 一致的錯誤響應格式**
```python
{
    "error": "error_code",
    "message": "human-readable message",
    "details": [...],
    "request_id": "uuid",
    "timestamp": "ISO-8601"
}
```

**3. 不要洩露敏感信息**
```python
# 錯誤示例
raise HTTPException(status_code=500, detail=str(exc))  # 可能洩露堆棧信息

# 正確示例
logger.error(f"詳細錯誤: {exc}")
raise HTTPException(status_code=500, detail="服務器內部錯誤")
```

**4. 使用適當的狀態碼**
- 400 Bad Request：請求格式錯誤
- 401 Unauthorized：未認證
- 403 Forbidden：無權限
- 404 Not Found：資源不存在
- 422 Unprocessable Entity：驗證失敗
- 500 Internal Server Error：服務器錯誤
- 503 Service Unavailable：服務不可用

**5. 提供可操作的錯誤信息**
```python
# 不好
{"error": "validation_error"}

# 好
{
    "error": "validation_error",
    "message": "郵箱格式不正確",
    "details": [
        {
            "field": "email",
            "message": "請提供有效的郵箱地址",
            "example": "user@example.com"
        }
    ]
}
```

**6. 監控和告警**
```python
from prometheus_client import Counter

error_counter = Counter(
    'api_errors_total',
    'Total API errors',
    ['endpoint', 'status_code', 'error_type']
)

@app.exception_handler(Exception)
async def monitored_exception_handler(request: Request, exc: Exception):
    error_counter.labels(
        endpoint=request.url.path,
        status_code=500,
        error_type=exc.__class__.__name__
    ).inc()
    
    # 發送告警（嚴重錯誤）
    if should_alert(exc):
        await send_alert(exc, request)
    
    return await global_exception_handler(request, exc)
```

## 關鍵要點

FastAPI 提供了完整的異常處理機制，包括 HTTPException、RequestValidationError 等內建異常類型，以及自定義異常處理器。最佳實踐包括創建異常層次結構、統一錯誤響應格式、適當的狀態碼使用、詳細的日誌記錄以及不洩露敏感信息。通過全局異常處理器可以捕獲所有未處理的異常，確保應用的健壯性。驗證錯誤可以通過自定義 RequestValidationError 處理器提供更友好的響應。結合監控和告警系統可以及時發現和處理生產環境中的異常。
