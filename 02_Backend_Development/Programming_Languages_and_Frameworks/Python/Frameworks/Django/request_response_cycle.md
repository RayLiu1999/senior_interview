# Django 請求-響應週期

- **難度**: 6
- **重要程度**: 5
- **標籤**: `Request`, `Response`, `Middleware`, `URL Routing`

## 問題詳述

深入探討 Django 處理 HTTP 請求的完整生命週期，從請求到達服務器到返回響應的整個流程，包括 URL 路由、中間件執行、視圖處理和模板渲染等關鍵環節。

## 核心理論與詳解

### 請求-響應週期概覽

**Django 的請求-響應週期** 是一個精心設計的處理流程，將 HTTP 請求轉換為 Python 對象，經過一系列處理後生成 HTTP 響應。理解這個週期對於掌握 Django 的運作機制、排查問題和優化性能至關重要。

整個週期可以分為以下主要階段：WSGI 處理 → 請求中間件 → URL 路由 → 視圖處理 → 響應中間件 → WSGI 響應。每個階段都有明確的職責和執行順序。

### WSGI 入口與請求對象創建

**WSGI（Web Server Gateway Interface）** 是 Python Web 應用與 Web 服務器之間的標準接口。當 Web 服務器（如 Gunicorn、uWSGI）接收到 HTTP 請求時，會通過 WSGI 協議將請求傳遞給 Django 應用。

Django 的 WSGI 應用由 `django.core.handlers.wsgi.WSGIHandler` 實現。它負責接收 WSGI 環境字典（environ），並創建 Django 的 `HttpRequest` 對象。這個對象封裝了所有請求信息，包括 HTTP 方法、路徑、headers、cookies、GET/POST 參數等。

**HttpRequest 對象** 是整個請求週期的核心數據結構。它提供了豐富的屬性和方法來訪問請求信息，如 `request.method`、`request.path`、`request.GET`、`request.POST`、`request.user` 等。Django 會在請求週期的不同階段向這個對象添加屬性。

### 請求中間件處理

在請求到達視圖之前，Django 會按順序執行配置在 `MIDDLEWARE` 設置中的中間件的 `process_request()` 方法。中間件按照定義的順序執行，形成一個處理鏈。

**中間件的作用**：請求中間件可以在請求到達視圖前進行預處理，如認證檢查、會話管理、CSRF 保護、請求日誌記錄等。每個中間件都可以修改 `HttpRequest` 對象或直接返回 `HttpResponse` 來短路後續處理。

**短路機制**：如果任何一個請求中間件返回了 `HttpResponse` 對象，Django 會立即跳過剩餘的請求中間件、URL 路由和視圖處理，直接進入響應中間件階段。這個機制常用於實現認證失敗返回、IP 黑名單等功能。

### URL 路由解析

**URL 路由（URL Routing）** 是 Django 將請求路徑映射到對應視圖函數的機制。Django 使用 URLconf（URL configuration）來定義路由規則。

**路由匹配過程**：Django 從根 URLconf（`ROOT_URLCONF` 設置指定）開始，按順序檢查每個 URL 模式。URL 模式使用正則表達式或 path converters 來匹配請求路徑。一旦找到匹配的模式，Django 就會停止搜索，並調用關聯的視圖函數。

**URL 參數提取**：匹配的 URL 模式可以包含捕獲組，這些捕獲的值會作為位置參數或關鍵字參數傳遞給視圖函數。Path converters（如 `<int:id>`）不僅匹配模式，還會自動進行類型轉換。

**include() 機制**：Django 支持嵌套的 URLconf。使用 `include()` 可以將 URL 模式委託給其他 URLconf 模塊，這對於構建模塊化應用非常有用。當遇到 `include()` 時，Django 會截取匹配的部分，將剩餘路徑傳遞給包含的 URLconf。

**reverse() 與命名路由**：Django 提供反向 URL 解析功能。通過為 URL 模式命名，可以在代碼中使用名稱而非硬編碼路徑，這提高了代碼的可維護性。

### 視圖處理

**視圖（View）** 是請求處理的核心邏輯所在。視圖接收 `HttpRequest` 對象和 URL 參數，執行業務邏輯，並返回 `HttpResponse` 對象。

**函數視圖（FBV）**：最簡單的視圖形式，就是一個接收 `request` 參數的 Python 函數。函數視圖直接明了，適合簡單的請求處理。

**類視圖（CBV）**：Django 提供基於類的視圖，通過繼承和組合來實現複雜的視圖邏輯。類視圖使用 `as_view()` 方法轉換為函數視圖。常用的類視圖包括 `TemplateView`、`ListView`、`DetailView`、`CreateView` 等。

**視圖裝飾器**：Django 提供了許多裝飾器來增強視圖功能，如 `@login_required`、`@permission_required`、`@require_http_methods` 等。裝飾器在視圖執行前後添加額外的檢查或處理邏輯。

**視圖執行**：視圖內部通常包含以下步驟：驗證請求數據、與數據庫交互（通過 ORM）、執行業務邏輯、準備上下文數據、渲染模板或返回 JSON 響應。

### 模板渲染

當視圖需要返回 HTML 頁面時，通常會使用 Django 的模板系統。視圖調用 `render()` 函數或 `TemplateResponse`，傳入模板名稱和上下文數據。

**模板查找**：Django 根據 `TEMPLATES` 設置中配置的模板引擎和目錄來查找模板文件。支持多個模板目錄，按順序搜索。

**模板渲染過程**：Django 的模板引擎解析模板文件，處理模板標籤（tags）和過濾器（filters），將上下文數據填充到模板中，生成最終的 HTML 字符串。

**模板緩存**：Django 會緩存已編譯的模板，避免重複解析，提高性能。在開發環境中，模板變更會自動重新加載。

### 響應對象創建

**HttpResponse 對象** 封裝了返回給客戶端的響應。它包含響應體（content）、狀態碼（status_code）、headers 和 cookies。

**常見響應類型**：
- `HttpResponse`：基本響應類，可以設置任意內容和 content-type
- `JsonResponse`：自動序列化 Python 對象為 JSON，設置正確的 content-type
- `HttpResponseRedirect`：返回 302 重定向
- `HttpResponsePermanentRedirect`：返回 301 永久重定向
- `HttpResponseNotFound`：返回 404 錯誤
- `HttpResponseForbidden`：返回 403 禁止訪問
- `StreamingHttpResponse`：用於流式響應，適合大文件下載

### 響應中間件處理

視圖返回響應後，Django 會按**相反的順序**執行中間件的 `process_response()` 方法。這意味著最後執行的請求中間件會最先處理響應。

**響應後處理**：響應中間件可以修改響應對象，如添加 headers、設置 cookies、壓縮響應內容、記錄響應日誌等。常見的例子包括 CORS headers 添加、內容壓縮、安全 headers 設置。

**異常處理**：如果視圖或請求中間件拋出異常，Django 會調用中間件的 `process_exception()` 方法。這允許中間件處理錯誤，返回自定義錯誤頁面或進行錯誤日誌記錄。

### 異常處理流程

**未捕獲的異常**：如果視圖拋出未捕獲的異常，Django 的異常處理機制會介入。在開發環境中，會顯示詳細的調試頁面；在生產環境中，會返回通用的錯誤頁面。

**Http404 異常**：當拋出 `Http404` 異常時，Django 會調用 404 處理視圖（`handler404`）。可以自定義 404 頁面。

**PermissionDenied 異常**：拋出 `PermissionDenied` 會返回 403 響應，調用 `handler403` 視圖。

**SuspiciousOperation 異常**：這類異常表示潛在的安全問題，Django 會返回 400 Bad Request。

### 完整週期的中間件執行順序

理解中間件的執行順序對於正確配置 Django 應用至關重要：

1. **請求階段**：中間件按照 `MIDDLEWARE` 列表中的順序執行 `process_request()`
2. **視圖調用前**：執行 `process_view()`（如果定義）
3. **視圖執行**：調用視圖函數
4. **響應階段**：中間件按照**相反的順序**執行 `process_response()`
5. **異常處理**：如果發生異常，按**相反的順序**執行 `process_exception()`

這種"洋蔥"式的執行模型確保了中間件可以完整地包裹請求-響應週期。

### 性能優化點

**數據庫查詢優化**：在視圖中使用 `select_related()` 和 `prefetch_related()` 來減少數據庫查詢次數，避免 N+1 問題。

**緩存機制**：利用 Django 的緩存框架來緩存視圖結果、查詢結果或模板片段。可以使用 `@cache_page` 裝飾器緩存整個視圖。

**中間件精簡**：只啟用必要的中間件。不必要的中間件會增加每個請求的處理時間。

**流式響應**：對於大文件或長時間生成的內容，使用 `StreamingHttpResponse` 避免內存佔用。

**異步視圖**：Django 3.1+ 支持異步視圖，可以使用 `async def` 定義視圖，充分利用異步 I/O。

## 程式碼範例

```python
# Django 請求-響應週期示例

# 1. URL 配置 (urls.py)
from django.urls import path, include
from . import views

urlpatterns = [
    # 簡單路由
    path('', views.home, name='home'),
    
    # 帶參數的路由
    path('posts/<int:post_id>/', views.post_detail, name='post_detail'),
    
    # 使用 slug
    path('posts/<slug:slug>/', views.post_by_slug, name='post_by_slug'),
    
    # 包含其他 URLconf
    path('api/', include('myapp.api.urls')),
]


# 2. 自定義中間件示例
class RequestTimingMiddleware:
    """記錄請求處理時間的中間件"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # 請求階段：記錄開始時間
        import time
        request.start_time = time.time()
        
        # 調用下一個中間件或視圖
        response = self.get_response(request)
        
        # 響應階段：計算處理時間
        duration = time.time() - request.start_time
        response['X-Request-Duration'] = str(duration)
        
        return response
    
    def process_exception(self, request, exception):
        """處理異常"""
        # 記錄異常
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Exception in request: {exception}", exc_info=True)
        
        # 返回 None 讓其他中間件繼續處理
        return None


# 3. 函數視圖示例 (views.py)
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from .models import Post


def home(request):
    """首頁視圖"""
    # 獲取查詢參數
    search_query = request.GET.get('q', '')
    
    # 數據庫查詢
    posts = Post.objects.filter(published=True)
    if search_query:
        posts = posts.filter(title__icontains=search_query)
    
    # 渲染模板
    context = {
        'posts': posts,
        'search_query': search_query,
    }
    return render(request, 'home.html', context)


def post_detail(request, post_id):
    """文章詳情視圖"""
    # 使用 get_object_or_404 自動處理 404
    post = get_object_or_404(Post, id=post_id, published=True)
    
    context = {'post': post}
    return render(request, 'post_detail.html', context)


@require_http_methods(["GET", "POST"])
@login_required
def create_post(request):
    """創建文章視圖（需要登錄）"""
    if request.method == 'POST':
        # 處理表單提交
        title = request.POST.get('title')
        content = request.POST.get('content')
        
        post = Post.objects.create(
            title=title,
            content=content,
            author=request.user
        )
        
        # 重定向到文章詳情頁
        return redirect('post_detail', post_id=post.id)
    
    # GET 請求：顯示表單
    return render(request, 'create_post.html')


# 4. 類視圖示例
from django.views import View
from django.views.generic import ListView, DetailView, CreateView
from django.contrib.auth.mixins import LoginRequiredMixin


class PostListView(ListView):
    """文章列表視圖"""
    model = Post
    template_name = 'post_list.html'
    context_object_name = 'posts'
    paginate_by = 10
    
    def get_queryset(self):
        """自定義查詢集"""
        queryset = super().get_queryset()
        return queryset.filter(published=True).select_related('author')


class PostDetailView(DetailView):
    """文章詳情視圖"""
    model = Post
    template_name = 'post_detail.html'
    context_object_name = 'post'


class PostCreateView(LoginRequiredMixin, CreateView):
    """創建文章視圖"""
    model = Post
    fields = ['title', 'content']
    template_name = 'post_form.html'
    
    def form_valid(self, form):
        """表單驗證通過時調用"""
        form.instance.author = self.request.user
        return super().form_valid(form)


# 5. API 視圖（返回 JSON）
from django.views.decorators.csrf import csrf_exempt
import json


def api_posts(request):
    """返回文章列表的 API"""
    posts = Post.objects.filter(published=True).values(
        'id', 'title', 'content', 'created_at'
    )
    
    return JsonResponse({
        'status': 'success',
        'data': list(posts)
    })


@csrf_exempt
@require_http_methods(["POST"])
def api_create_post(request):
    """創建文章的 API"""
    try:
        data = json.loads(request.body)
        
        post = Post.objects.create(
            title=data['title'],
            content=data['content'],
            author=request.user
        )
        
        return JsonResponse({
            'status': 'success',
            'data': {
                'id': post.id,
                'title': post.title,
            }
        }, status=201)
    
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)


# 6. 流式響應示例
def download_large_file(request):
    """流式下載大文件"""
    def file_generator():
        with open('large_file.csv', 'rb') as f:
            while True:
                chunk = f.read(8192)  # 8KB chunks
                if not chunk:
                    break
                yield chunk
    
    response = StreamingHttpResponse(
        file_generator(),
        content_type='text/csv'
    )
    response['Content-Disposition'] = 'attachment; filename="data.csv"'
    return response


# 7. 異步視圖示例（Django 3.1+）
from django.http import HttpResponse
import asyncio


async def async_view(request):
    """異步視圖示例"""
    # 模擬異步操作
    await asyncio.sleep(1)
    
    # 可以使用異步數據庫操作
    # posts = await Post.objects.filter(published=True).acount()
    
    return HttpResponse("Async response")


# 8. 自定義錯誤處理視圖
def custom_404(request, exception):
    """自定義 404 頁面"""
    return render(request, '404.html', status=404)


def custom_500(request):
    """自定義 500 頁面"""
    return render(request, '500.html', status=500)


# 在 urls.py 中配置錯誤處理視圖
# handler404 = 'myapp.views.custom_404'
# handler500 = 'myapp.views.custom_500'


# 9. 使用 reverse 進行 URL 反向解析
from django.urls import reverse


def redirect_to_post(request, post_id):
    """重定向到文章詳情頁"""
    url = reverse('post_detail', kwargs={'post_id': post_id})
    return redirect(url)


# 10. 中間件配置 (settings.py)
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'myapp.middleware.RequestTimingMiddleware',  # 自定義中間件
]
```

## 相關主題

- [Django Middleware 機制](./middleware_mechanism.md)
- [Django ORM 深入解析](./django_orm_deep_dive.md)
- [Django 認證與權限系統](./authentication_and_permissions.md)
- [Django 性能優化](./performance_optimization.md)
