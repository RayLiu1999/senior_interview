# Django 安全最佳實踐

- **難度**: 8
- **重要性**: 5
- **標籤**: `Security`, `CSRF`, `XSS`, `SQL Injection`

## 問題詳述

Web 應用安全是至關重要的，Django 提供了多層安全機制來防範常見的 Web 攻擊，包括 CSRF、XSS、SQL 注入、點擊劫持等，但開發者仍需要正確配置和使用這些功能。

## 核心理論與詳解

### CSRF (跨站請求偽造) 保護

#### CSRF 攻擊原理

攻擊者誘導用戶在已登錄的網站上執行非預期的操作。

#### Django 的 CSRF 保護

Django 通過 CSRF token 機制保護 POST、PUT、DELETE 等請求：

```python
# settings.py
MIDDLEWARE = [
    'django.middleware.csrf.CsrfViewMiddleware',  # 必須啟用
    # ...
]
```

#### 在模板中使用

```django
<form method="post">
    {% csrf_token %}
    <!-- 表單字段 -->
    <button type="submit">提交</button>
</form>
```

#### AJAX 請求中的 CSRF

```javascript
// 獲取 CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

// 在 AJAX 請求中使用
fetch('/api/endpoint/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
    },
    body: JSON.stringify(data)
});
```

#### CSRF 豁免（謹慎使用）

```python
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def api_webhook(request):
    """第三方 webhook，通常需要其他驗證方式"""
    # 驗證簽名
    if not verify_signature(request):
        return HttpResponseForbidden()
    # 處理請求
    return JsonResponse({'status': 'ok'})
```

### XSS (跨站腳本) 防護

#### Django 的自動轉義

Django 模板系統默認會轉義 HTML 特殊字符：

```django
<!-- 自動轉義，安全 -->
<p>{{ user_input }}</p>

<!-- 如果 user_input = "<script>alert('XSS')</script>" -->
<!-- 渲染為：<p>&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;</p> -->
```

#### 標記安全內容

只有確定內容安全時才使用：

```python
from django.utils.safestring import mark_safe
from django.utils.html import escape

def get_safe_html(content):
    # 先轉義
    escaped = escape(content)
    # 然後進行安全的 HTML 處理
    processed = process_markdown(escaped)
    # 標記為安全
    return mark_safe(processed)
```

#### 在模板中禁用自動轉義

```django
<!-- 方式一：autoescape 標籤 -->
{% autoescape off %}
    {{ trusted_html }}
{% endautoescape %}

<!-- 方式二：safe 過濾器 -->
{{ trusted_html|safe }}
```

#### JSON 安全

```python
import json
from django.utils.safestring import mark_safe

def my_view(request):
    data = {'key': 'value'}
    # 安全的 JSON 序列化
    json_data = mark_safe(json.dumps(data))
    return render(request, 'template.html', {'json_data': json_data})
```

### SQL 注入防護

#### 使用 ORM 自動防護

Django ORM 自動參數化查詢：

```python
# 安全 - ORM 會自動參數化
users = User.objects.filter(username=user_input)

# 安全 - 使用參數
User.objects.raw('SELECT * FROM auth_user WHERE username = %s', [user_input])
```

#### 避免原始 SQL

```python
from django.db import connection

# 危險 - SQL 注入風險
def unsafe_query(user_input):
    with connection.cursor() as cursor:
        query = f"SELECT * FROM users WHERE name = '{user_input}'"
        cursor.execute(query)  # 危險！

# 安全 - 參數化查詢
def safe_query(user_input):
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM users WHERE name = %s", [user_input])
```

#### extra() 方法的安全使用

```python
# 危險
User.objects.extra(where=[f"username='{user_input}'"])

# 安全
User.objects.extra(where=["username=%s"], params=[user_input])
```

### 認證和授權

#### 密碼安全

Django 使用 PBKDF2 算法（默認）存儲密碼：

```python
# settings.py
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',  # 推薦
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
]

# 密碼驗證
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 12,  # 增加最小長度
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
```

#### Session 安全

```python
# settings.py

# Session cookie 設置
SESSION_COOKIE_SECURE = True  # 僅 HTTPS
SESSION_COOKIE_HTTPONLY = True  # 防止 JavaScript 訪問
SESSION_COOKIE_SAMESITE = 'Lax'  # 或 'Strict'

# Session 過期
SESSION_COOKIE_AGE = 3600  # 1 小時
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

# Session 引擎
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'  # 使用緩存更安全
```

#### 權限檢查

```python
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin

# 函數視圖
@login_required
@permission_required('app.change_article', raise_exception=True)
def edit_article(request, pk):
    article = get_object_or_404(Article, pk=pk)
    # 額外的所有權檢查
    if article.author != request.user:
        raise PermissionDenied
    # ...

# 類視圖
class ArticleUpdateView(LoginRequiredMixin, PermissionRequiredMixin, UpdateView):
    model = Article
    permission_required = 'app.change_article'
    
    def get_queryset(self):
        # 只允許編輯自己的文章
        return Article.objects.filter(author=self.request.user)
```

### HTTPS 和安全頭部

#### 強制 HTTPS

```python
# settings.py

# 重定向所有 HTTP 到 HTTPS
SECURE_SSL_REDIRECT = True

# HSTS (HTTP Strict Transport Security)
SECURE_HSTS_SECONDS = 31536000  # 1 年
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# 安全 cookie
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
```

#### 其他安全頭部

```python
# X-Content-Type-Options
SECURE_CONTENT_TYPE_NOSNIFF = True

# X-Frame-Options (防止點擊劫持)
X_FRAME_OPTIONS = 'DENY'  # 或 'SAMEORIGIN'

# X-XSS-Protection
SECURE_BROWSER_XSS_FILTER = True

# Content Security Policy
# 需要使用中間件或自定義頭部
CSP_DEFAULT_SRC = ("'self'",)
CSP_SCRIPT_SRC = ("'self'", "'unsafe-inline'", "cdn.example.com")
CSP_STYLE_SRC = ("'self'", "'unsafe-inline'")
```

#### 自定義 Security Headers 中間件

```python
class SecurityHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Content Security Policy
        response['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' cdn.example.com; "
            "style-src 'self' 'unsafe-inline';"
        )
        
        # Referrer Policy
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Permissions Policy
        response['Permissions-Policy'] = (
            'geolocation=(), microphone=(), camera=()'
        )
        
        return response
```

### 文件上傳安全

#### 驗證文件類型

```python
from django.core.exceptions import ValidationError

def validate_file_extension(value):
    """驗證文件擴展名"""
    import os
    ext = os.path.splitext(value.name)[1]
    valid_extensions = ['.pdf', '.jpg', '.png']
    if ext.lower() not in valid_extensions:
        raise ValidationError('不支持的文件類型')

def validate_file_size(value):
    """驗證文件大小"""
    limit = 5 * 1024 * 1024  # 5MB
    if value.size > limit:
        raise ValidationError('文件大小不能超過 5MB')

class Document(models.Model):
    file = models.FileField(
        upload_to='documents/',
        validators=[validate_file_extension, validate_file_size]
    )
```

#### 文件內容驗證

```python
from PIL import Image
from django.core.exceptions import ValidationError

def validate_image(file):
    """驗證是否為真實圖片"""
    try:
        img = Image.open(file)
        img.verify()
    except Exception:
        raise ValidationError('無效的圖片文件')
    
    # 檢查圖片尺寸
    if img.width > 4000 or img.height > 4000:
        raise ValidationError('圖片尺寸過大')
```

#### 安全的文件存儲

```python
import uuid
import os

def user_directory_path(instance, filename):
    """生成安全的文件路徑"""
    # 獲取文件擴展名
    ext = filename.split('.')[-1]
    # 生成隨機文件名
    filename = f'{uuid.uuid4()}.{ext}'
    # 返回路徑
    return os.path.join('uploads', str(instance.user.id), filename)

class UserFile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to=user_directory_path)
```

### 敏感信息保護

#### SECRET_KEY 管理

```python
# 不要硬編碼
# SECRET_KEY = 'hardcoded-secret-key'  # 危險！

# 從環境變量讀取
import os
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')

# 或使用專門的配置管理
from decouple import config
SECRET_KEY = config('SECRET_KEY')
```

#### 敏感數據加密

```python
from cryptography.fernet import Fernet
from django.conf import settings

class EncryptedField(models.TextField):
    """加密字段"""
    
    def __init__(self, *args, **kwargs):
        self.cipher = Fernet(settings.ENCRYPTION_KEY)
        super().__init__(*args, **kwargs)
    
    def get_prep_value(self, value):
        if value is None:
            return value
        return self.cipher.encrypt(value.encode()).decode()
    
    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        return self.cipher.decrypt(value.encode()).decode()

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    ssn = EncryptedField()  # 加密存儲敏感信息
```

### API 安全

#### 速率限制

```python
from django.core.cache import cache
from django.http import HttpResponseForbidden

def rate_limit(max_requests=10, period=60):
    """簡單的速率限制裝飾器"""
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            # 獲取客戶端 IP
            ip = request.META.get('REMOTE_ADDR')
            cache_key = f'rate_limit:{ip}'
            
            # 獲取請求計數
            count = cache.get(cache_key, 0)
            
            if count >= max_requests:
                return HttpResponseForbidden('請求過於頻繁')
            
            # 增加計數
            cache.set(cache_key, count + 1, period)
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator

@rate_limit(max_requests=10, period=60)
def api_endpoint(request):
    # ...
```

#### JWT 認證

```python
# 使用 djangorestframework-simplejwt
from rest_framework_simplejwt.tokens import RefreshToken

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

### 輸入驗證和清理

#### 表單驗證

```python
from django import forms
import re

class SecureForm(forms.Form):
    username = forms.CharField(
        max_length=30,
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9_]+$',
                message='用戶名只能包含字母、數字和下劃線'
            )
        ]
    )
    
    email = forms.EmailField()
    
    def clean_username(self):
        username = self.cleaned_data['username']
        # 黑名單檢查
        forbidden = ['admin', 'root', 'system']
        if username.lower() in forbidden:
            raise forms.ValidationError('該用戶名不可用')
        return username
```

#### URL 重定向安全

```python
from django.http import HttpResponseRedirect
from django.utils.http import url_has_allowed_host_and_scheme

def safe_redirect(request):
    next_url = request.GET.get('next', '/')
    
    # 驗證重定向 URL
    if url_has_allowed_host_and_scheme(
        url=next_url,
        allowed_hosts={request.get_host()},
        require_https=request.is_secure()
    ):
        return HttpResponseRedirect(next_url)
    
    # 不安全的 URL，重定向到首頁
    return HttpResponseRedirect('/')
```

### 日誌和監控

#### 安全事件日誌

```python
import logging

security_logger = logging.getLogger('security')

def login_view(request):
    username = request.POST.get('username')
    password = request.POST.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user is not None:
        login(request, user)
        security_logger.info(
            f'Successful login: user={username}, ip={request.META.get("REMOTE_ADDR")}'
        )
    else:
        security_logger.warning(
            f'Failed login attempt: user={username}, ip={request.META.get("REMOTE_ADDR")}'
        )
```

## 程式碼範例

```python
# security/middleware.py - 綜合安全中間件
from django.http import HttpResponseForbidden
from django.core.cache import cache
import logging

security_logger = logging.getLogger('security')

class ComprehensiveSecurityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # 速率限制
        if not self.check_rate_limit(request):
            security_logger.warning(
                f'Rate limit exceeded: ip={request.META.get("REMOTE_ADDR")}'
            )
            return HttpResponseForbidden('請求過於頻繁')
        
        # 處理請求
        response = self.get_response(request)
        
        # 添加安全頭部
        self.add_security_headers(response)
        
        return response
    
    def check_rate_limit(self, request):
        """檢查速率限制"""
        ip = request.META.get('REMOTE_ADDR')
        cache_key = f'rate_limit:{ip}'
        count = cache.get(cache_key, 0)
        
        if count >= 100:  # 每分鐘 100 次
            return False
        
        cache.set(cache_key, count + 1, 60)
        return True
    
    def add_security_headers(self, response):
        """添加安全頭部"""
        response['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline';"
        )
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        return response
```

## 總結

Django 提供了全面的安全機制，但需要開發者正確配置和使用。關鍵的安全實踐包括：啟用 CSRF 保護、防範 XSS 攻擊、使用 ORM 避免 SQL 注入、配置 HTTPS 和安全頭部、實施適當的認證授權、驗證文件上傳、保護敏感信息、實施 API 安全措施等。定期進行安全審計、保持依賴更新、監控安全事件是維護應用安全的持續工作。
