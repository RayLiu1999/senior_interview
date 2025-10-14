# Django 認證與權限系統

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Authentication`, `Permission`, `Security`, `Authorization`

## 問題詳述

深入探討 Django 的認證（Authentication）和授權（Authorization）系統，包括用戶模型、認證後端、權限機制、裝飾器、中間件以及如何自定義和擴展這些系統。

## 核心理論與詳解

### 認證 vs 授權

**認證（Authentication）** 是驗證用戶身份的過程，回答"你是誰"的問題。用戶通過提供憑證（如用戶名和密碼）來證明身份。

**授權（Authorization）** 是確定已認證用戶是否有權執行某操作的過程，回答"你能做什麼"的問題。這涉及檢查用戶的權限和角色。

Django 的認證系統同時處理這兩個方面，提供了完整的解決方案，從用戶管理到細粒度的權限控制。

### Django User 模型

**內建 User 模型**：Django 提供了 `django.contrib.auth.models.User`，包含基本字段如 `username`、`email`、`password`、`first_name`、`last_name`、`is_active`、`is_staff`、`is_superuser`。

**密碼存儲**：Django 使用 PBKDF2 算法（可配置）安全地哈希存儲密碼。`set_password()` 方法自動處理哈希，`check_password()` 用於驗證。

**UserManager**：User 模型的管理器提供了 `create_user()` 和 `create_superuser()` 方法來創建用戶，確保密碼被正確哈希。

### 自定義 User 模型

**AbstractBaseUser**：最靈活的方式，繼承此類可以完全自定義用戶模型。需要定義 `USERNAME_FIELD`、`REQUIRED_FIELDS` 和自定義管理器。

**AbstractUser**：繼承內建 User 模型的所有字段，允許添加額外字段。這是最常用的擴展方式。

**AUTH_USER_MODEL 設置**：在 settings.py 中設置 `AUTH_USER_MODEL = 'myapp.CustomUser'` 來使用自定義用戶模型。這必須在項目初期設置，後期更改很困難。

**最佳實踐**：即使不需要自定義字段，也建議從項目開始就定義自定義 User 模型，為將來的擴展留有餘地。

### 認證流程

**登錄過程**：用戶提交用戶名和密碼 → Django 使用認證後端驗證 → 驗證成功後創建會話 → 將用戶 ID 存儲在會話中。

**authenticate() 函數**：接收憑證（通常是 username 和 password），嘗試所有配置的認證後端，返回 User 對象或 None。

**login() 函數**：接收 request 和 user 對象，創建會話並附加 session ID cookie。這使得後續請求能識別用戶。

**logout() 函數**：清除會話數據，使用戶退出登錄。

### 認證後端

**後端接口**：認證後端是實現 `authenticate()` 和 `get_user()` 方法的類。`authenticate()` 驗證憑證，`get_user()` 通過用戶 ID 獲取用戶對象。

**ModelBackend**：Django 的默認後端，使用用戶名和密碼驗證，對比數據庫中的用戶。

**自定義後端**：可以實現自定義認證邏輯，如 email 登錄、LDAP 認證、OAuth、多因素認證等。多個後端可以共存，Django 會依次嘗試。

**RemoteUserBackend**：用於外部認證系統（如 Apache 的 mod_auth），從請求 headers 獲取用戶信息。

### 權限系統

**權限模型**：Django 為每個模型自動創建四個權限：add、change、delete、view（Django 2.1+）。權限以 `app_label.codename` 格式命名，如 `blog.add_post`。

**Permission 對象**：每個權限是 `django.contrib.auth.models.Permission` 的實例，關聯到 ContentType（模型）。

**用戶權限**：用戶可以通過 `user_permissions` 多對多關係直接獲得權限，或通過所屬的組（Group）間接獲得權限。

**has_perm() 方法**：`user.has_perm('blog.add_post')` 檢查用戶是否有特定權限。Superuser 自動擁有所有權限。

### 組（Groups）

**組模型**：`django.contrib.auth.models.Group` 代表用戶組，擁有權限集合。用戶可以屬於多個組，繼承所有組的權限。

**權限管理**：通過組來管理權限比直接為每個用戶分配權限更易維護。例如，"編輯" 組包含文章的創建、編輯權限。

**動態權限**：可以在運行時創建組和分配權限，實現靈活的角色管理。

### 對象級權限

**限制**：Django 內建權限系統是模型級的，不支持對象級權限（如"用戶只能編輯自己的文章"）。

**django-guardian**：流行的第三方庫，提供對象級權限支持。允許為特定對象實例分配權限。

**自定義實現**：可以通過在視圖或模型方法中添加自定義邏輯來實現對象級權限檢查。

### 裝飾器

**@login_required**：確保用戶已登錄才能訪問視圖。未登錄用戶會被重定向到登錄頁面（`LOGIN_URL` 設置）。

**@permission_required**：檢查用戶是否有特定權限。可以指定一個或多個權限，支持 `raise_exception` 參數來返回 403 而非重定向。

**@user_passes_test**：使用自定義函數測試用戶。函數接收 user 對象，返回 True/False 決定是否允許訪問。

**@staff_member_required**：僅允許 staff 用戶訪問，常用於後台管理相關視圖。

### 基於類的視圖 Mixin

**LoginRequiredMixin**：類視圖版本的 `@login_required`，放在繼承列表的最左側。

**PermissionRequiredMixin**：檢查權限，通過 `permission_required` 屬性指定所需權限。

**UserPassesTestMixin**：實現 `test_func()` 方法進行自定義測試。

**Mixin 順序**：必須在視圖類之前，如 `class MyView(LoginRequiredMixin, View)`。

### 中間件

**AuthenticationMiddleware**：將 `request.user` 與當前登錄用戶關聯。它從會話中獲取用戶 ID，然後從數據庫加載用戶對象。

**RemoteUserMiddleware**：用於外部認證系統，從 `REMOTE_USER` header 獲取用戶名。

**懶加載**：`request.user` 是懶加載的，只在首次訪問時從數據庫查詢。這避免了不需要用戶信息的請求的額外查詢。

### 會話管理

**SESSION_COOKIE_AGE**：會話 cookie 的有效期（秒），默認 2 週。

**SESSION_EXPIRE_AT_BROWSER_CLOSE**：設為 True 時，關閉瀏覽器會使會話過期。

**會話安全**：使用 `SESSION_COOKIE_SECURE = True` 確保 cookie 只通過 HTTPS 傳輸。`SESSION_COOKIE_HTTPONLY = True` 防止 JavaScript 訪問 cookie。

**會話存儲**：可以存儲在數據庫、緩存、文件或混合方式。數據庫是默認且最可靠的方式。

### 密碼驗證器

**PASSWORD_VALIDATORS**：Django 提供多個內建驗證器，如 `UserAttributeSimilarityValidator`（密碼不能與用戶名太相似）、`MinimumLengthValidator`、`CommonPasswordValidator`、`NumericPasswordValidator`。

**自定義驗證器**：實現 `validate()` 方法來添加自定義密碼規則。驗證器在用戶創建和密碼修改時自動應用。

**密碼強度**：合理配置驗證器可以確保用戶選擇足夠強的密碼，提高安全性。

### 密碼重置

**流程**：用戶請求重置 → 發送帶 token 的郵件 → 用戶點擊鏈接 → 驗證 token → 允許設置新密碼。

**Token 生成**：Django 使用 `PasswordResetTokenGenerator` 生成時間敏感的 token，基於用戶的密碼哈希和時間戳。

**安全性**：Token 是一次性的且有時間限制（默認 3 天）。修改密碼後舊 token 失效。

### 兩因素認證（2FA）

**Django 不內建 2FA**：需要使用第三方庫如 `django-otp`、`django-two-factor-auth`。

**實現方式**：通常使用 TOTP（Time-based One-Time Password）算法，用戶通過 Google Authenticator 等應用生成驗證碼。

**流程**：用戶名密碼驗證成功 → 要求輸入 2FA 碼 → 驗證通過後完全登錄。

### JWT 與 Token 認證

**Django REST Framework**：提供 Token 認證和 JWT 認證支持。Token 存儲在數據庫，JWT 是自包含的。

**Stateless 認證**：JWT 不需要服務器存儲會話，適合 API 和微服務架構。

**djangorestframework-simplejwt**：流行的 JWT 實現，提供訪問 token 和刷新 token 機制。

### OAuth 和社交登錄

**django-allauth**：強大的第三方包，支持本地認證和多種社交賬號登錄（Google、Facebook、GitHub 等）。

**OAuth 流程**：用戶點擊社交登錄 → 重定向到提供商 → 用戶授權 → 回調到應用 → 獲取用戶信息 → 創建或關聯本地用戶。

**多賬號管理**：用戶可以關聯多個社交賬號到同一個本地賬號。

### 安全最佳實踐

**HTTPS 強制**：生產環境必須使用 HTTPS，確保認證憑證安全傳輸。

**CSRF 保護**：Django 默認啟用 CSRF 保護，防止跨站請求偽造攻擊。

**密碼策略**：使用密碼驗證器強制密碼複雜度，定期提示用戶更改密碼。

**限制登錄嘗試**：實現登錄失敗次數限制，防止暴力破解。可以使用 `django-axes` 等庫。

**安全 Headers**：使用 `SecurityMiddleware` 添加安全 headers，如 `X-Frame-Options`、`X-Content-Type-Options`。

**審計日誌**：記錄認證事件（登錄、登出、密碼修改），用於安全審計。

## 程式碼範例

```python
# Django 認證與權限系統示例

# 1. 自定義 User 模型
from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """擴展的用戶模型"""
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    birth_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return self.username


# settings.py
# AUTH_USER_MODEL = 'myapp.CustomUser'


# 2. 使用 AbstractBaseUser 完全自定義
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class CustomUserManager(BaseUserManager):
    """自定義用戶管理器"""
    
    def create_user(self, email, password=None, **extra_fields):
        """創建普通用戶"""
        if not email:
            raise ValueError('Email 必須提供')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """創建超級用戶"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        return self.create_user(email, password, **extra_fields)


class EmailUser(AbstractBaseUser, PermissionsMixin):
    """使用 email 登錄的用戶模型"""
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def __str__(self):
        return self.email


# 3. 登錄視圖
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib import messages


def login_view(request):
    """用戶登錄"""
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        # 認證用戶
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            # 登錄成功
            login(request, user)
            messages.success(request, '登錄成功！')
            
            # 重定向到 next 參數或首頁
            next_url = request.GET.get('next', '/')
            return redirect(next_url)
        else:
            # 登錄失敗
            messages.error(request, '用戶名或密碼錯誤')
    
    return render(request, 'login.html')


@login_required
def logout_view(request):
    """用戶登出"""
    logout(request)
    messages.success(request, '已成功登出')
    return redirect('login')


# 4. 註冊視圖
from django.contrib.auth import get_user_model

User = get_user_model()


def register_view(request):
    """用戶註冊"""
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')
        
        # 驗證
        if password1 != password2:
            messages.error(request, '兩次密碼輸入不一致')
            return render(request, 'register.html')
        
        if User.objects.filter(username=username).exists():
            messages.error(request, '用戶名已存在')
            return render(request, 'register.html')
        
        # 創建用戶
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password1
        )
        
        messages.success(request, '註冊成功，請登錄')
        return redirect('login')
    
    return render(request, 'register.html')


# 5. 權限裝飾器
from django.contrib.auth.decorators import permission_required, user_passes_test


@login_required
@permission_required('blog.add_post', raise_exception=True)
def create_post(request):
    """創建文章（需要權限）"""
    # 只有擁有 blog.add_post 權限的用戶才能訪問
    return render(request, 'create_post.html')


def is_author(user):
    """檢查用戶是否是作者"""
    return user.groups.filter(name='Authors').exists()


@user_passes_test(is_author)
def author_dashboard(request):
    """作者儀表板"""
    return render(request, 'author_dashboard.html')


# 6. 基於類的視圖權限
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin, UserPassesTestMixin
from django.views.generic import CreateView, UpdateView
from .models import Post


class PostCreateView(LoginRequiredMixin, PermissionRequiredMixin, CreateView):
    """創建文章視圖"""
    model = Post
    fields = ['title', 'content']
    permission_required = 'blog.add_post'
    
    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)


class PostUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    """更新文章視圖（只有作者可以編輯）"""
    model = Post
    fields = ['title', 'content']
    
    def test_func(self):
        """檢查是否是文章作者"""
        post = self.get_object()
        return self.request.user == post.author


# 7. 自定義權限
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Post(models.Model):
    """文章模型"""
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    is_published = models.BooleanField(default=False)
    
    class Meta:
        permissions = [
            ('can_publish', '可以發布文章'),
            ('can_feature', '可以設置精選文章'),
        ]


# 使用自定義權限
@permission_required('blog.can_publish')
def publish_post(request, post_id):
    """發布文章"""
    post = Post.objects.get(id=post_id)
    post.is_published = True
    post.save()
    return redirect('post_detail', post_id=post.id)


# 8. 程序化權限檢查
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType


def assign_permissions(user):
    """為用戶分配權限"""
    # 獲取權限對象
    content_type = ContentType.objects.get_for_model(Post)
    permission = Permission.objects.get(
        codename='add_post',
        content_type=content_type
    )
    
    # 添加權限
    user.user_permissions.add(permission)
    
    # 或通過組添加
    from django.contrib.auth.models import Group
    authors_group, created = Group.objects.get_or_create(name='Authors')
    authors_group.permissions.add(permission)
    user.groups.add(authors_group)


# 檢查權限
def check_user_permissions(user):
    """檢查用戶權限"""
    # 檢查單個權限
    can_add = user.has_perm('blog.add_post')
    
    # 檢查多個權限
    can_manage = user.has_perms(['blog.add_post', 'blog.change_post'])
    
    # 獲取用戶所有權限
    all_perms = user.get_all_permissions()
    
    # 獲取用戶所在的組
    groups = user.groups.all()
    
    return {
        'can_add': can_add,
        'can_manage': can_manage,
        'all_perms': all_perms,
        'groups': [g.name for g in groups]
    }


# 9. 自定義認證後端
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class EmailBackend(ModelBackend):
    """允許使用 email 登錄的認證後端"""
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # 嘗試使用 email 查找用戶
            user = User.objects.get(email=username)
        except User.DoesNotExist:
            return None
        
        # 驗證密碼
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        
        return None


# settings.py
# AUTHENTICATION_BACKENDS = [
#     'myapp.backends.EmailBackend',  # 自定義後端
#     'django.contrib.auth.backends.ModelBackend',  # 默認後端
# ]


# 10. 自定義密碼驗證器
from django.core.exceptions import ValidationError


class SpecialCharacterValidator:
    """確保密碼包含特殊字符"""
    
    def validate(self, password, user=None):
        special_characters = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        if not any(char in special_characters for char in password):
            raise ValidationError(
                '密碼必須包含至少一個特殊字符',
                code='password_no_special'
            )
    
    def get_help_text(self):
        return '密碼必須包含至少一個特殊字符 (!@#$%^&*() 等)'


# settings.py
# AUTH_PASSWORD_VALIDATORS = [
#     {
#         'NAME': 'myapp.validators.SpecialCharacterValidator',
#     },
# ]


# 11. API Token 認證（Django REST Framework）
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(['POST'])
def api_login(request):
    """API 登錄獲取 token"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.id,
            'email': user.email
        })
    
    return Response({'error': '無效的憑證'}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_protected(request):
    """受保護的 API 端點"""
    return Response({
        'message': f'Hello {request.user.username}',
        'permissions': list(request.user.get_all_permissions())
    })


# 12. 密碼重置
from django.contrib.auth.views import (
    PasswordResetView,
    PasswordResetDoneView,
    PasswordResetConfirmView,
    PasswordResetCompleteView
)


# urls.py
# path('password-reset/', PasswordResetView.as_view(), name='password_reset'),
# path('password-reset/done/', PasswordResetDoneView.as_view(), name='password_reset_done'),
# path('password-reset/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
# path('password-reset/complete/', PasswordResetCompleteView.as_view(), name='password_reset_complete'),
```

## 相關主題

- [Django 請求-響應週期](./request_response_cycle.md)
- [Django Middleware 機制](./middleware_mechanism.md)
- [Django REST Framework](./django_rest_framework.md)
- [Django 安全最佳實踐](./security_best_practices.md)
