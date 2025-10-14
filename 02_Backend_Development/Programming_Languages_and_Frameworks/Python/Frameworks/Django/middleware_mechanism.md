# Django Middleware 機制

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Middleware`, `Request Processing`, `Hooks`

## 問題詳述

深入探討 Django 中間件的工作原理、執行順序、常見應用場景，以及如何編寫自定義中間件來擴展 Django 的請求處理流程。

## 核心理論與詳解

### 中間件的核心概念

**Django 中間件（Middleware）** 是一個輕量級的插件系統，用於在全局範圍內修改 Django 的輸入或輸出。中間件位於 Web 服務器和 Django 視圖之間，形成一個處理鏈，每個請求和響應都會經過這個鏈。

中間件採用**洋蔥模型**：請求從外向內穿過每層中間件到達視圖，響應則從內向外穿過每層中間件返回。這種設計使得中間件可以在請求前後進行處理，並且保證了處理的對稱性。

### 中間件的執行順序

**請求處理順序**：當請求到達時，Django 按照 `MIDDLEWARE` 設置中列出的順序執行每個中間件。每個中間件的 `__call__()` 方法（或舊式中間件的 `process_request()`）會被依次調用。

**響應處理順序**：當視圖返回響應後，中間件以**相反的順序**處理響應。最後執行的請求中間件會最先處理響應。這確保了中間件可以完整地包裹請求-響應週期。

**順序的重要性**：中間件的順序至關重要。例如，`AuthenticationMiddleware` 必須在 `SessionMiddleware` 之後，因為認證依賴於會話。`CsrfViewMiddleware` 應該在 `SessionMiddleware` 之後但在大多數其他中間件之前。

### 新式中間件（Django 1.10+）

**基於類的中間件**：新式中間件是一個可調用對象，通常是一個類。它在初始化時接收 `get_response` 參數，這是處理鏈中的下一個中間件或視圖。

**__call__ 方法**：中間件的核心是 `__call__()` 方法，它接收 `request` 對象，可以在調用 `get_response(request)` 前後添加處理邏輯。調用前的代碼處理請求，調用後的代碼處理響應。

**優勢**：新式中間件更簡潔、性能更好，且支持異步中間件。推薦使用新式中間件編寫所有新代碼。

### 舊式中間件

**多個鉤子方法**：舊式中間件使用多個獨立的方法來處理不同階段：
- `process_request(request)`：在視圖調用前執行
- `process_view(request, view_func, view_args, view_kwargs)`：在視圖調用前，URL 解析後執行
- `process_exception(request, exception)`：當視圖拋出異常時執行
- `process_template_response(request, response)`：當響應有 `render()` 方法時執行
- `process_response(request, response)`：在響應返回前執行

**兼容性**：Django 仍然支持舊式中間件，但新式中間件是推薦的方式。

### 中間件的鉤子方法

**process_request(request)**：這個方法在請求階段執行，在 URL 路由之前。如果返回 `None`，繼續處理；如果返回 `HttpResponse`，則短路後續處理。

**process_view(request, view_func, view_args, view_kwargs)**：在 URL 路由後、視圖調用前執行。可以訪問即將執行的視圖函數和參數，適合做視圖級別的檢查或日誌記錄。

**process_exception(request, exception)**：當視圖拋出異常時調用。中間件按**相反順序**執行此方法。如果返回 `HttpResponse`，則使用該響應；如果返回 `None`，則繼續執行其他異常處理中間件。

**process_template_response(request, response)**：當響應對象有 `render()` 方法時（如 `TemplateResponse`）調用。這允許中間件在模板渲染前修改響應。

**process_response(request, response)**：在響應返回給客戶端前執行，按中間件的**相反順序**調用。這個方法**必須**返回 `HttpResponse` 對象。

### 中間件的短路機制

**提前返回響應**：如果任何請求中間件返回 `HttpResponse` 對象，Django 會跳過剩餘的請求中間件、URL 路由和視圖，直接進入響應中間件階段。

**異常短路**：如果中間件的 `process_exception()` 返回 `HttpResponse`，則使用該響應，不再調用其他異常處理中間件。

**應用場景**：短路機制常用於實現：
- IP 白名單/黑名單過濾
- 維護模式（返回維護頁面）
- 請求限流（超過限制返回 429）
- 早期認證失敗返回 401

### 常見的內置中間件

**SecurityMiddleware**：添加安全相關的 HTTP headers，如 `X-Content-Type-Options`、`X-Frame-Options`、HSTS 等。應該放在中間件列表的最前面。

**SessionMiddleware**：管理會話。在請求時從 cookie 加載會話數據，在響應時保存會話數據。許多其他中間件依賴會話。

**CommonMiddleware**：處理通用功能，如 URL 重寫（添加/刪除尾部斜杠）、設置 `Content-Length` header、處理 `DISALLOWED_USER_AGENTS`。

**CsrfViewMiddleware**：提供跨站請求偽造保護。檢查 POST 請求的 CSRF token，拒絕無效請求。

**AuthenticationMiddleware**：將 `request.user` 屬性與當前登錄用戶關聯。依賴於 `SessionMiddleware`。

**MessageMiddleware**：啟用消息框架，允許在請求之間傳遞一次性消息（如表單提交後的成功提示）。

**XFrameOptionsMiddleware**：設置 `X-Frame-Options` header 以防止點擊劫持攻擊。

### 編寫自定義中間件

**簡單中間件模板**：一個基本的新式中間件包含 `__init__()` 和 `__call__()` 方法。初始化時保存 `get_response`，調用時在前後添加處理邏輯。

**修改請求對象**：中間件可以向 `request` 對象添加屬性，供後續的中間件或視圖使用。這是在全局範圍內為請求添加信息的常用方式。

**修改響應對象**：在 `get_response()` 返回後，可以修改響應對象，如添加 headers、修改內容、設置 cookies。

**條件執行**：中間件可以根據請求的屬性（如路徑、方法、headers）決定是否執行特定邏輯。使用條件判斷來避免不必要的處理。

### 異步中間件

**async 支持**：Django 3.1+ 支持異步中間件。異步中間件使用 `async def __call__()` 定義，可以使用 `await` 進行異步操作。

**同步和異步適配**：Django 提供 `sync_to_async` 和 `async_to_sync` 工具來在同步和異步代碼之間轉換。中間件可以同時支持同步和異步視圖。

**性能優勢**：異步中間件可以並發處理 I/O 操作，如數據庫查詢、HTTP 請求，提高吞吐量。

### 中間件的應用場景

**認證和授權**：檢查用戶是否登錄、是否有權限訪問特定資源。可以在中間件層面實現全局的訪問控制。

**請求日誌和監控**：記錄每個請求的詳細信息，如 IP、用戶、路徑、處理時間、響應狀態。用於審計和性能監控。

**速率限制**：限制來自同一 IP 或用戶的請求頻率，防止濫用。可以使用緩存存儲請求計數。

**內容壓縮**：自動壓縮響應內容（如 gzip），減少帶寬使用。Django 提供 `GZipMiddleware`。

**CORS 處理**：添加跨域資源共享（CORS）headers，允許前端應用跨域訪問 API。

**緩存**：實現頁面級或站點級緩存，直接從緩存返回響應，跳過視圖執行。Django 提供 `CacheMiddleware`。

**A/B 測試**：根據用戶屬性或隨機分組，向不同用戶提供不同的內容或功能。

**請求修改**：統一修改請求，如解析自定義 headers、處理代理 headers（`X-Forwarded-For`）。

### 中間件的最佳實踐

**保持輕量**：中間件會處理每個請求，應該保持高效。避免在中間件中執行昂貴的操作，如複雜的數據庫查詢。

**處理異常**：中間件應該優雅地處理可能的異常，避免中斷請求處理流程。使用 try-except 包裹可能失敗的操作。

**文檔化依賴**：如果中間件依賴其他中間件（如需要會話或認證），在文檔中明確說明，並建議正確的順序。

**使用緩存**：對於需要頻繁訪問的數據（如配置、黑名單），使用緩存避免重複查詢。

**條件執行**：使用 `request.path` 或其他屬性來決定是否執行中間件邏輯，避免對所有請求都執行。

**測試中間件**：編寫單元測試來驗證中間件在各種場景下的行為，包括正常情況和異常情況。

### 中間件的調試

**日誌記錄**：在中間件的關鍵點添加日誌，幫助追蹤請求處理流程和診斷問題。

**調試工具**：使用 Django Debug Toolbar 可以可視化中間件的執行順序和耗時，幫助優化性能。

**異常傳播**：確保中間件不會吞噬異常。如果無法處理異常，應該讓它傳播，由 Django 的異常處理機制處理。

## 程式碼範例

```python
# Django 中間件示例

# 1. 新式中間件：請求日誌記錄
import logging
import time

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware:
    """記錄每個請求的詳細信息"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # 請求開始時間
        start_time = time.time()
        
        # 記錄請求信息
        logger.info(f"Request: {request.method} {request.path}")
        logger.info(f"User: {request.user}")
        logger.info(f"IP: {self.get_client_ip(request)}")
        
        # 調用下一個中間件或視圖
        response = self.get_response(request)
        
        # 計算處理時間
        duration = time.time() - start_time
        
        # 記錄響應信息
        logger.info(f"Response: {response.status_code} ({duration:.3f}s)")
        
        # 添加自定義 header
        response['X-Request-Duration'] = f"{duration:.3f}"
        
        return response
    
    @staticmethod
    def get_client_ip(request):
        """獲取客戶端 IP"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


# 2. 速率限制中間件
from django.core.cache import cache
from django.http import HttpResponse


class RateLimitMiddleware:
    """基於 IP 的速率限制"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.rate_limit = 100  # 每分鐘最多 100 個請求
        self.window = 60  # 時間窗口（秒）
    
    def __call__(self, request):
        ip = self.get_client_ip(request)
        cache_key = f"rate_limit:{ip}"
        
        # 獲取當前請求計數
        requests = cache.get(cache_key, 0)
        
        if requests >= self.rate_limit:
            return HttpResponse(
                "Rate limit exceeded. Please try again later.",
                status=429
            )
        
        # 增加計數
        cache.set(cache_key, requests + 1, self.window)
        
        response = self.get_response(request)
        
        # 添加速率限制 headers
        response['X-RateLimit-Limit'] = str(self.rate_limit)
        response['X-RateLimit-Remaining'] = str(self.rate_limit - requests - 1)
        
        return response
    
    @staticmethod
    def get_client_ip(request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


# 3. 維護模式中間件
from django.conf import settings
from django.shortcuts import render


class MaintenanceModeMiddleware:
    """維護模式：當開啟時返回維護頁面"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # 檢查是否處於維護模式
        if getattr(settings, 'MAINTENANCE_MODE', False):
            # 管理員可以訪問
            if request.user.is_superuser:
                response = self.get_response(request)
            else:
                response = render(request, 'maintenance.html', status=503)
            
            return response
        
        return self.get_response(request)


# 4. CORS 中間件
class CORSMiddleware:
    """添加 CORS headers"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # 添加 CORS headers
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response['Access-Control-Max-Age'] = '3600'
        
        return response


# 5. 舊式中間件：使用多個鉤子方法
class ComprehensiveMiddleware:
    """展示所有鉤子方法的中間件"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # process_request 邏輯
        print(f"Processing request: {request.path}")
        
        response = self.get_response(request)
        
        # process_response 邏輯
        print(f"Processing response: {response.status_code}")
        
        return response
    
    def process_view(self, request, view_func, view_args, view_kwargs):
        """在視圖調用前執行"""
        print(f"About to call view: {view_func.__name__}")
        return None  # 繼續執行視圖
    
    def process_exception(self, request, exception):
        """處理視圖拋出的異常"""
        print(f"Exception occurred: {exception}")
        # 返回 None 讓其他中間件處理
        # 或返回 HttpResponse 使用自定義錯誤頁面
        return None
    
    def process_template_response(self, request, response):
        """在模板渲染前修改響應"""
        if hasattr(response, 'context_data'):
            # 添加全局上下文變量
            response.context_data['global_var'] = 'value'
        return response


# 6. 請求修改中間件
class RequestModificationMiddleware:
    """統一處理和修改請求"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # 解析自定義 header
        api_key = request.META.get('HTTP_X_API_KEY')
        if api_key:
            request.api_key = api_key
        
        # 處理代理 headers
        if 'HTTP_X_FORWARDED_PROTO' in request.META:
            request.is_secure = lambda: \
                request.META['HTTP_X_FORWARDED_PROTO'] == 'https'
        
        # 添加請求 ID（用於追蹤）
        import uuid
        request.request_id = str(uuid.uuid4())
        
        response = self.get_response(request)
        
        # 在響應中包含請求 ID
        response['X-Request-ID'] = request.request_id
        
        return response


# 7. 異步中間件示例
import asyncio


class AsyncMiddleware:
    """異步中間件示例"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    async def __call__(self, request):
        # 異步的請求處理
        await asyncio.sleep(0.001)  # 模擬異步操作
        
        response = await self.get_response(request)
        
        # 異步的響應處理
        await self.log_async(request, response)
        
        return response
    
    async def log_async(self, request, response):
        """異步日誌記錄"""
        await asyncio.sleep(0.001)
        print(f"Async log: {request.path} -> {response.status_code}")


# 8. 帶配置的中間件
class ConfigurableMiddleware:
    """可配置的中間件"""
    
    def __init__(self, get_response, config=None):
        self.get_response = get_response
        self.config = config or {}
        self.enabled = self.config.get('enabled', True)
        self.debug = self.config.get('debug', False)
    
    def __call__(self, request):
        if not self.enabled:
            return self.get_response(request)
        
        if self.debug:
            print(f"Debug: Processing {request.path}")
        
        response = self.get_response(request)
        return response


# 9. 條件執行中間件
class ConditionalMiddleware:
    """根據條件決定是否執行"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.excluded_paths = ['/health/', '/metrics/']
    
    def __call__(self, request):
        # 跳過某些路徑
        if request.path in self.excluded_paths:
            return self.get_response(request)
        
        # 只處理 API 請求
        if not request.path.startswith('/api/'):
            return self.get_response(request)
        
        # 執行中間件邏輯
        response = self.get_response(request)
        response['X-API-Processed'] = 'true'
        
        return response


# 10. 在 settings.py 中配置中間件
MIDDLEWARE = [
    # 安全相關（最外層）
    'django.middleware.security.SecurityMiddleware',
    
    # 會話和認證
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    
    # 自定義中間件
    'myapp.middleware.RequestLoggingMiddleware',
    'myapp.middleware.RateLimitMiddleware',
    'myapp.middleware.CORSMiddleware',
    
    # 其他內置中間件
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# 11. 中間件工廠函數（用於帶參數的中間件）
def rate_limit_middleware(rate_limit=100):
    """中間件工廠函數"""
    class RateLimitMiddleware:
        def __init__(self, get_response):
            self.get_response = get_response
            self.rate_limit = rate_limit
        
        def __call__(self, request):
            # 使用 self.rate_limit
            return self.get_response(request)
    
    return RateLimitMiddleware


# 在 settings.py 中使用
# MIDDLEWARE = [
#     'myapp.middleware.rate_limit_middleware(rate_limit=200)',
# ]
```

## 相關主題

- [Django 請求-響應週期](./request_response_cycle.md)
- [Django 認證與權限系統](./authentication_and_permissions.md)
- [Django 性能優化](./performance_optimization.md)
- [Django 安全最佳實踐](./security_best_practices.md)
