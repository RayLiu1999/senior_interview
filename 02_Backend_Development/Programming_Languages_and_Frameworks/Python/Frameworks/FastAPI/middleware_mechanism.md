# FastAPI 中間件機制

- **難度**: 7
- **重要性**: 4
- **標籤**: `Middleware`, `ASGI`, `Starlette`

## 問題詳述

解釋 FastAPI 中間件的工作原理、類型以及如何自定義中間件來處理跨切面關注點（如日誌、認證、CORS 等）。

## 核心理論與詳解

### 中間件基本概念

中間件是一個函數或類，它可以在請求到達路由處理器之前和響應返回客戶端之前執行代碼。FastAPI 基於 Starlette，支持 **ASGI 中間件**。

**中間件的典型用途**：
- **日誌記錄**：記錄每個請求和響應的詳細信息
- **跨域資源共享 (CORS)**：處理跨域請求
- **認證和授權**：驗證請求者身份
- **請求/響應修改**：添加自定義標頭、壓縮響應
- **性能監控**：測量請求處理時間
- **錯誤處理**：統一捕獲和處理異常

### 中間件執行流程

```
客戶端請求
    ↓
[中間件 1] ──→ 請求前處理
    ↓
[中間件 2] ──→ 請求前處理
    ↓
[路由處理器] ──→ 執行業務邏輯
    ↓
[中間件 2] ──→ 響應後處理
    ↓
[中間件 1] ──→ 響應後處理
    ↓
客戶端響應
```

中間件按照註冊順序形成一個 **洋蔥模型**，每個中間件可以在請求前後都執行邏輯。

### FastAPI 中間件類型

**1. ASGI 中間件（底層）**

這是最底層的中間件，直接與 ASGI 接口交互：

```python
from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import time

class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # 調用下一個中間件或路由處理器
        response = await call_next(request)
        
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        return response

app = FastAPI()
app.add_middleware(TimingMiddleware)
```

**2. 函數式中間件**

使用裝飾器語法的簡單中間件：

```python
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def add_custom_header(request: Request, call_next):
    # 請求前處理
    print(f"收到請求: {request.url}")
    
    # 處理請求
    response = await call_next(request)
    
    # 響應後處理
    response.headers["X-Custom-Header"] = "Value"
    
    return response
```

**3. 第三方中間件集成**

FastAPI 可以使用 Starlette 的內建中間件：

```python
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZIPMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

app = FastAPI()

# CORS 中間件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZIP 壓縮中間件
app.add_middleware(GZIPMiddleware, minimum_size=1000)

# 可信主機中間件
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["example.com", "*.example.com"]
)
```

### 常見中間件場景

**1. 請求日誌中間件**

```python
import logging
from fastapi import FastAPI, Request
import time

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 記錄請求信息
        logger.info(f"請求開始: {request.method} {request.url}")
        logger.info(f"客戶端: {request.client.host}")
        
        start_time = time.time()
        
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            logger.info(
                f"請求完成: {request.method} {request.url} "
                f"狀態碼: {response.status_code} "
                f"耗時: {process_time:.3f}s"
            )
            
            return response
        except Exception as e:
            logger.error(f"請求異常: {request.method} {request.url} 錯誤: {str(e)}")
            raise
```

**2. 認證中間件**

```python
from fastapi import FastAPI, Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 白名單路徑不需要認證
        if request.url.path in ["/login", "/public"]:
            return await call_next(request)
        
        # 驗證 token
        token = request.headers.get("Authorization")
        if not token or not self.validate_token(token):
            raise HTTPException(status_code=401, detail="未授權")
        
        # 將用戶信息添加到請求狀態
        request.state.user = self.get_user_from_token(token)
        
        response = await call_next(request)
        return response
    
    def validate_token(self, token: str) -> bool:
        # 驗證邏輯
        return True
    
    def get_user_from_token(self, token: str):
        # 獲取用戶信息
        return {"user_id": "123"}
```

**3. 錯誤處理中間件**

```python
from fastapi import Request
from fastapi.responses import JSONResponse
import traceback

class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except ValueError as e:
            return JSONResponse(
                status_code=400,
                content={"error": "無效的輸入", "detail": str(e)}
            )
        except Exception as e:
            # 記錄完整錯誤
            logger.error(f"未處理的異常: {traceback.format_exc()}")
            
            return JSONResponse(
                status_code=500,
                content={"error": "內部服務器錯誤"}
            )
```

**4. 性能監控中間件**

```python
from prometheus_client import Counter, Histogram
import time

REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        response = await call_next(request)
        
        duration = time.time() - start_time
        
        # 記錄指標
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()
        
        REQUEST_DURATION.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)
        
        return response
```

### 中間件執行順序

中間件的執行順序由 **註冊順序** 決定：

```python
app = FastAPI()

# 第一個註冊（最外層）
app.add_middleware(TimingMiddleware)

# 第二個註冊
app.add_middleware(AuthMiddleware)

# 第三個註冊（最內層）
app.add_middleware(LoggingMiddleware)

# 執行順序：
# 請求：Timing → Auth → Logging → 路由處理器
# 響應：路由處理器 → Logging → Auth → Timing
```

### 中間件 vs 依賴注入

| 特性 | 中間件 | 依賴注入 |
|------|--------|----------|
| **作用範圍** | 全局（所有請求） | 特定路由或函數 |
| **執行時機** | 請求/響應前後 | 路由處理前 |
| **訪問響應** | 可以修改響應 | 無法訪問響應 |
| **靈活性** | 較低（全局應用） | 高（按需使用） |
| **適用場景** | 橫切關注點 | 業務邏輯依賴 |

**選擇建議**：
- 使用 **中間件** 處理全局性、跨切面的關注點（日誌、CORS、壓縮）
- 使用 **依賴注入** 處理特定路由的業務邏輯依賴（數據庫會話、用戶認證）

### 中間件的最佳實踐

**1. 保持中間件輕量**
- 避免在中間件中執行重量級操作
- 不要在中間件中進行複雜的業務邏輯

**2. 注意執行順序**
- 將認證中間件放在較外層
- 將日誌中間件放在最外層以記錄所有請求

**3. 異常處理**
- 中間件應捕獲並妥善處理異常
- 避免異常導致整個應用崩潰

**4. 性能考量**
- 中間件會影響所有請求的性能
- 使用異步操作避免阻塞

**5. 可配置性**
- 使用配置文件控制中間件行為
- 允許在不同環境中啟用/禁用中間件

## 關鍵要點

FastAPI 的中間件機制基於 ASGI 標準，提供了強大的請求/響應處理能力。中間件遵循洋蔥模型，按註冊順序執行，適合處理橫切關注點如日誌、認證、CORS、性能監控等。開發者可以通過繼承 BaseHTTPMiddleware 或使用裝飾器語法自定義中間件，也可以直接使用 Starlette 提供的內建中間件。合理使用中間件可以實現代碼解耦和關注點分離，但需注意性能影響和執行順序。
