# Django REST Framework (DRF)

- **難度**: 8
- **重要程度**: 5
- **標籤**: `DRF`, `API`, `Serializer`, `ViewSet`, `REST`

## 問題詳述

深入探討 Django REST Framework 的核心概念和架構，包括序列化器、視圖、路由、認證、權限、過濾、分頁等核心功能，以及如何構建健壯的 RESTful API。

## 核心理論與詳解

### DRF 的核心價值

**Django REST Framework** 是構建 Web API 的強大工具包，建立在 Django 之上。它提供了一整套工具來簡化 API 開發，包括序列化、驗證、認證、權限控制等。DRF 遵循 REST 架構風格，使 API 設計更規範和易於維護。

**設計哲學**：DRF 延續了 Django 的"電池包含"哲學，提供了豐富的內建功能。同時保持高度可定制性，允許開發者根據需求調整每個組件。

### Serializers 序列化器

**核心作用**：序列化器負責在複雜的 Python 數據類型（如 Django 模型實例）和可以輕鬆渲染為 JSON/XML 的原生 Python 數據類型之間進行轉換。它還處理反序列化（驗證輸入數據並轉換為 Python 對象）。

**Serializer 類**：最基本的序列化器，需要手動定義所有字段。適合不直接對應模型的場景，或需要完全控制序列化邏輯時使用。

**ModelSerializer**：最常用的序列化器，自動從 Django 模型生成字段。大大減少了樣板代碼，並自動提供 `create()` 和 `update()` 實現。

**字段類型**：DRF 提供豐富的字段類型，如 `CharField`、`IntegerField`、`DateTimeField`、`SerializerMethodField` 等。每種字段都有相應的驗證規則。

**嵌套序列化器**：可以在序列化器中嵌套其他序列化器，表示關聯關係。這對於表示一對多或多對多關係非常有用。

**read_only 和 write_only**：`read_only=True` 的字段只在序列化時包含，不接受輸入。`write_only=True` 的字段只在反序列化時接受，不在輸出中顯示（如密碼）。

### 驗證機制

**字段級驗證**：每個字段自帶基本驗證（如類型檢查、必填檢查）。可以通過參數添加額外驗證，如 `max_length`、`min_value`、`required` 等。

**對象級驗證**：通過 `validate()` 方法實現跨字段驗證。這個方法接收所有字段的字典，可以檢查字段間的關係。

**字段特定驗證**：通過 `validate_<field_name>()` 方法為特定字段添加自定義驗證邏輯。

**validators 參數**：可以將驗證函數作為列表傳遞給字段的 `validators` 參數，實現可重用的驗證邏輯。

### Views 視圖

**APIView**：最基本的 DRF 視圖類，提供了處理 HTTP 方法的基礎。需要手動實現 `get()`、`post()` 等方法。提供了請求解析、響應渲染、認證、權限等功能。

**GenericAPIView**：擴展了 `APIView`，添加了查詢集（queryset）和序列化器（serializer_class）屬性。提供了常用的方法如 `get_object()`、`get_queryset()`。

**Mixins**：DRF 提供多個 mixin 類來實現標準操作：
- `ListModelMixin`：列表查詢
- `CreateModelMixin`：創建對象
- `RetrieveModelMixin`：獲取單個對象
- `UpdateModelMixin`：更新對象
- `DestroyModelMixin`：刪除對象

**Concrete Views**：組合 GenericAPIView 和 mixins 的預定義視圖，如 `ListAPIView`、`CreateAPIView`、`RetrieveUpdateDestroyAPIView` 等。適合標準的 CRUD 操作。

**ViewSets**：將相關視圖的邏輯組織在一個類中。`ModelViewSet` 提供完整的 CRUD 操作（list、create、retrieve、update、destroy）。與 Router 配合使用可以自動生成 URL 配置。

### 路由系統

**DefaultRouter**：DRF 的路由器自動為 ViewSet 生成 URL 模式。它遵循 REST 命名約定，為標準操作創建 URL。

**SimpleRouter**：較簡單的路由器，不包含 API 根視圖。

**自定義動作**：使用 `@action` 裝飾器可以為 ViewSet 添加額外的端點（如 `/users/{id}/set_password/`）。支持自定義 HTTP 方法和URL 模式。

**URL 命名**：Router 自動為每個端點生成命名 URL，可以使用 `reverse()` 來生成 URL。

### 認證機制

**認證類**：DRF 支持多種認證方式，可以在設置中全局配置或在視圖中單獨指定。

**SessionAuthentication**：使用 Django 的會話框架。適合與網站前端配合的 API。需要 CSRF 保護。

**TokenAuthentication**：基於 token 的認證。每個用戶有一個唯一的 token，存儲在數據庫中。客戶端在請求頭中包含 token。

**BasicAuthentication**：HTTP 基本認證。用戶名密碼在每個請求中發送（base64 編碼）。只應在 HTTPS 下使用。

**JWT 認證**：使用 JSON Web Tokens。Token 自包含用戶信息，不需要服務器存儲。適合微服務和無狀態架構。需要第三方庫如 `djangorestframework-simplejwt`。

**自定義認證**：可以創建自定義認證類，實現 `authenticate()` 方法來處理特殊的認證邏輯。

### 權限控制

**權限類**：控制已認證用戶是否有權執行特定操作。

**IsAuthenticated**：要求用戶已認證。這是最常用的權限類。

**IsAdminUser**：只允許管理員用戶（`is_staff=True`）。

**IsAuthenticatedOrReadOnly**：已認證用戶可以進行任何操作，未認證用戶只能讀取。

**DjangoModelPermissions**：使用 Django 的模型權限系統。檢查用戶是否有模型的 add、change、delete 權限。

**DjangoObjectPermissions**：對象級權限檢查。需要配合 django-guardian 等庫使用。

**自定義權限**：繼承 `BasePermission`，實現 `has_permission()` 和 `has_object_permission()` 方法來定義自定義邏輯。

### 過濾和搜索

**django-filter 集成**：DRF 與 django-filter 庫集成，提供強大的過濾功能。可以根據多個字段進行過濾。

**SearchFilter**：提供簡單的搜索功能，可以搜索多個字段。支持部分匹配。

**OrderingFilter**：允許客戶端指定排序字段。可以設置允許的排序字段列表。

**自定義過濾**：可以重寫 `get_queryset()` 方法來實現自定義過濾邏輯。

### 分頁

**PageNumberPagination**：基於頁碼的分頁。客戶端請求特定頁碼，如 `?page=2`。

**LimitOffsetPagination**：基於限制和偏移的分頁。客戶端指定 limit 和 offset，如 `?limit=10&offset=20`。

**CursorPagination**：基於游標的分頁。提供穩定的分頁，即使數據變化也能正確分頁。適合實時數據。

**自定義分頁**：可以創建自定義分頁類來實現特殊的分頁邏輯。

### 內容協商

**渲染器**：DRF 支持多種響應格式。根據客戶端的 `Accept` 頭或 URL 參數選擇合適的渲染器。

**JSONRenderer**：默認渲染器，輸出 JSON 格式。

**BrowsableAPIRenderer**：生成可瀏覽的 HTML 頁面，方便開發和調試。

**自定義渲染器**：可以創建自定義渲染器來支持其他格式（如 YAML、CSV）。

### 版本控制

**URL 路徑版本**：版本號在 URL 路徑中，如 `/api/v1/users/`。最明確和推薦的方式。

**Accept 頭版本**：版本號在 Accept 頭中，如 `Accept: application/json; version=1.0`。

**查詢參數版本**：版本號作為查詢參數，如 `/api/users/?version=1`。

**主機名版本**：不同版本使用不同的子域名。

### 異常處理

**標準異常**：DRF 提供多個異常類，如 `ValidationError`、`NotFound`、`PermissionDenied`、`AuthenticationFailed` 等。

**自定義異常處理器**：可以定義全局異常處理器來自定義錯誤響應格式。

**錯誤響應格式**：DRF 的標準錯誤響應包含 `detail` 字段。驗證錯誤會包含字段級的錯誤信息。

### 限流

**AnonRateThrottle**：限制匿名用戶的請求頻率。

**UserRateThrottle**：限制已認證用戶的請求頻率。

**ScopedRateThrottle**：為不同的視圖設置不同的限流策略。

**自定義限流**：可以創建自定義限流類來實現複雜的限流邏輯，如基於 IP 和用戶的組合限流。

### API 文檔

**自動文檔生成**：DRF 可以自動生成 API 文檔。使用 `coreapi` 或 OpenAPI 規範。

**drf-spectacular**：推薦的 OpenAPI 3 文檔生成器。生成標準的 OpenAPI schema，可以與 Swagger UI 和 ReDoc 集成。

**文檔字符串**：視圖和序列化器的 docstring 會被包含在文檔中。

### 最佳實踐

**序列化器設計**：為不同的操作創建不同的序列化器（如 `UserSerializer`、`UserDetailSerializer`、`UserCreateSerializer`）。使用繼承來共享公共字段。

**ViewSet 組織**：相關的視圖邏輯組織在 ViewSet 中。使用 action 裝飾器添加自定義端點。

**權限分層**：在全局、視圖和對象級別分層應用權限，實現細粒度的訪問控制。

**錯誤處理**：統一的錯誤響應格式。提供有意義的錯誤消息。

**版本控制**：從項目開始就規劃 API 版本控制策略。

**文檔維護**：保持 API 文檔的更新和準確。

## 程式碼範例

```python
# Django REST Framework 完整示例

from rest_framework import serializers, viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import get_user_model
from .models import Post, Comment

User = get_user_model()


# 1. 基本序列化器
class UserSerializer(serializers.ModelSerializer):
    """用戶序列化器"""
    post_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'post_count']
        read_only_fields = ['id']
    
    def get_post_count(self, obj):
        """計算用戶的文章數量"""
        return obj.posts.count()


# 2. 嵌套序列化器
class CommentSerializer(serializers.ModelSerializer):
    """評論序列化器"""
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    """文章序列化器（包含評論）"""
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    comment_count = serializers.IntegerField(
        source='comments.count',
        read_only=True
    )
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'author',
            'comments', 'comment_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


# 3. 創建和列表使用不同的序列化器
class PostListSerializer(serializers.ModelSerializer):
    """文章列表序列化器（簡化版）"""
    author_name = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'author_name', 'created_at']


class PostDetailSerializer(serializers.ModelSerializer):
    """文章詳情序列化器（完整版）"""
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'author', 'comments', 'created_at']


# 4. 自定義驗證
class PostCreateSerializer(serializers.ModelSerializer):
    """創建文章序列化器"""
    
    class Meta:
        model = Post
        fields = ['title', 'content']
    
    def validate_title(self, value):
        """驗證標題"""
        if len(value) < 5:
            raise serializers.ValidationError("標題至少需要 5 個字符")
        return value
    
    def validate(self, data):
        """跨字段驗證"""
        if 'spam' in data['title'].lower() or 'spam' in data['content'].lower():
            raise serializers.ValidationError("內容包含禁止的詞彙")
        return data
    
    def create(self, validated_data):
        """自定義創建邏輯"""
        # 自動設置作者為當前用戶
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


# 5. ViewSet 完整示例
class PostViewSet(viewsets.ModelViewSet):
    """文章 ViewSet"""
    queryset = Post.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'title']
    
    def get_serializer_class(self):
        """根據操作選擇序列化器"""
        if self.action == 'list':
            return PostListSerializer
        elif self.action == 'create':
            return PostCreateSerializer
        return PostDetailSerializer
    
    def get_queryset(self):
        """自定義查詢集"""
        queryset = super().get_queryset()
        
        # 優化查詢
        if self.action == 'list':
            queryset = queryset.select_related('author')
        elif self.action == 'retrieve':
            queryset = queryset.select_related('author').prefetch_related('comments__author')
        
        # 過濾參數
        author_id = self.request.query_params.get('author')
        if author_id:
            queryset = queryset.filter(author_id=author_id)
        
        return queryset
    
    def perform_create(self, serializer):
        """創建時自動設置作者"""
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """發布文章（自定義動作）"""
        post = self.get_object()
        post.is_published = True
        post.save()
        return Response({'status': 'published'})
    
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """獲取文章的所有評論"""
        post = self.get_object()
        comments = post.comments.all()
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)


# 6. 自定義權限
class IsAuthorOrReadOnly(permissions.BasePermission):
    """只有作者可以編輯"""
    
    def has_object_permission(self, request, view, obj):
        # 讀取權限允許任何請求
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 寫權限只給作者
        return obj.author == request.user


class PostViewSetWithCustomPermission(viewsets.ModelViewSet):
    """使用自定義權限的 ViewSet"""
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]


# 7. 分頁配置
class StandardResultsSetPagination(PageNumberPagination):
    """標準分頁配置"""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class PostViewSetWithPagination(viewsets.ModelViewSet):
    """帶分頁的 ViewSet"""
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    pagination_class = StandardResultsSetPagination


# 8. 過濾配置
from django_filters import rest_framework as filters


class PostFilter(filters.FilterSet):
    """文章過濾器"""
    title = filters.CharFilter(lookup_expr='icontains')
    author = filters.NumberFilter(field_name='author__id')
    created_after = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = Post
        fields = ['title', 'author', 'is_published']


class PostViewSetWithFiltering(viewsets.ModelViewSet):
    """帶過濾的 ViewSet"""
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    filterset_class = PostFilter


# 9. 認證配置（settings.py）
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day',
    },
}


# 10. URL 路由配置
from rest_framework.routers import DefaultRouter
from django.urls import path, include

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]


# 11. Token 認證視圖
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token


class CustomAuthToken(ObtainAuthToken):
    """自定義 Token 認證"""
    
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
        })


# 12. 自定義異常處理器
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """自定義異常處理"""
    response = exception_handler(exc, context)
    
    if response is not None:
        response.data['status_code'] = response.status_code
    
    return response


# settings.py
# REST_FRAMEWORK = {
#     'EXCEPTION_HANDLER': 'myapp.utils.custom_exception_handler'
# }


# 13. 限流配置
from rest_framework.throttling import UserRateThrottle


class BurstRateThrottle(UserRateThrottle):
    """突發請求限流"""
    scope = 'burst'


class SustainedRateThrottle(UserRateThrottle):
    """持續請求限流"""
    scope = 'sustained'


class PostViewSetWithThrottling(viewsets.ModelViewSet):
    """帶限流的 ViewSet"""
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    throttle_classes = [BurstRateThrottle, SustainedRateThrottle]


# settings.py
# REST_FRAMEWORK = {
#     'DEFAULT_THROTTLE_RATES': {
#         'burst': '60/min',
#         'sustained': '1000/day',
#     }
# }


# 14. API 版本控制
from rest_framework.versioning import URLPathVersioning


class PostViewSetVersioned(viewsets.ModelViewSet):
    """版本化的 ViewSet"""
    queryset = Post.objects.all()
    versioning_class = URLPathVersioning
    
    def get_serializer_class(self):
        if self.request.version == 'v1':
            return PostSerializerV1
        return PostSerializerV2


# 15. 測試示例
from rest_framework.test import APITestCase, APIClient
from django.urls import reverse


class PostAPITestCase(APITestCase):
    """文章 API 測試"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass'
        )
        self.client = APIClient()
    
    def test_list_posts(self):
        """測試獲取文章列表"""
        url = reverse('post-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
    
    def test_create_post_authenticated(self):
        """測試已認證用戶創建文章"""
        self.client.force_authenticate(user=self.user)
        url = reverse('post-list')
        data = {'title': 'Test Post', 'content': 'Test content'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 201)
    
    def test_create_post_unauthenticated(self):
        """測試未認證用戶不能創建文章"""
        url = reverse('post-list')
        data = {'title': 'Test Post', 'content': 'Test content'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 403)
```

## 相關主題

- [Django ORM 深入解析](./django_orm_deep_dive.md)
- [Django 認證與權限系統](./authentication_and_permissions.md)
- [Django 查詢優化](./query_optimization.md)
- [Django 性能優化](./performance_optimization.md)
