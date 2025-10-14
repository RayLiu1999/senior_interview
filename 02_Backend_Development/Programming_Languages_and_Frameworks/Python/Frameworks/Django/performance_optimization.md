# Django 性能優化

- **難度**: 8
- **重要性**: 5
- **標籤**: `Performance`, `Optimization`, `Scaling`

## 問題詳述

Django 性能優化涉及資料庫查詢優化、緩存策略、異步處理等多個層面，目標是減少響應時間、提高吞吐量和降低資源消耗。

## 核心理論與詳解

### 資料庫查詢優化

#### 1. N+1 查詢問題

**問題**：在循環中訪問關聯對象導致大量查詢

```python
# 不好的做法 - N+1 查詢
articles = Article.objects.all()
for article in articles:
    print(article.author.name)  # 每次循環都會查詢一次
```

**解決方案**：使用 `select_related`（一對一、外鍵）

```python
# 好的做法 - 使用 JOIN
articles = Article.objects.select_related('author', 'category').all()
for article in articles:
    print(article.author.name)  # 不會產生額外查詢
```

#### 2. 多對多和反向外鍵

**問題**：訪問多對多或反向外鍵關係

```python
# 不好的做法
articles = Article.objects.all()
for article in articles:
    tags = article.tags.all()  # 每次都查詢
    comments = article.comments.all()  # 每次都查詢
```

**解決方案**：使用 `prefetch_related`

```python
# 好的做法 - 使用額外的查詢預取
articles = Article.objects.prefetch_related('tags', 'comments').all()
for article in articles:
    tags = article.tags.all()  # 使用預取的數據
    comments = article.comments.all()  # 使用預取的數據
```

#### 3. 自定義預取

使用 `Prefetch` 對象進行更精細的控制：

```python
from django.db.models import Prefetch

articles = Article.objects.prefetch_related(
    Prefetch(
        'comments',
        queryset=Comment.objects.filter(is_approved=True).select_related('author')
    )
).all()
```

#### 4. only() 和 defer()

只獲取需要的字段：

```python
# 只獲取特定字段
articles = Article.objects.only('id', 'title', 'created_at')

# 延遲獲取某些字段
articles = Article.objects.defer('content')  # content 會在訪問時才查詢
```

#### 5. values() 和 values_list()

當不需要模型實例時：

```python
# 返回字典
articles = Article.objects.values('id', 'title')
# [{'id': 1, 'title': 'Hello'}, ...]

# 返回元組
article_ids = Article.objects.values_list('id', flat=True)
# [1, 2, 3, ...]
```

#### 6. 使用 annotate 進行聚合

在資料庫層面計算而非 Python 層面：

```python
from django.db.models import Count, Avg

# 不好的做法
for article in Article.objects.all():
    comment_count = article.comments.count()  # 每次都查詢

# 好的做法
articles = Article.objects.annotate(
    comment_count=Count('comments'),
    avg_rating=Avg('ratings__score')
)
```

#### 7. bulk_create 和 bulk_update

批量操作減少資料庫往返：

```python
# 批量創建
articles = [
    Article(title=f'Article {i}', content=f'Content {i}')
    for i in range(1000)
]
Article.objects.bulk_create(articles, batch_size=100)

# 批量更新（Django 2.2+）
articles = Article.objects.all()
for article in articles:
    article.view_count += 1
Article.objects.bulk_update(articles, ['view_count'], batch_size=100)
```

#### 8. update() 和 delete()

使用 QuerySet 的 update 而非逐個保存：

```python
# 不好的做法
for article in Article.objects.filter(status='draft'):
    article.status = 'published'
    article.save()

# 好的做法
Article.objects.filter(status='draft').update(status='published')
```

#### 9. exists() 和 count()

適當使用檢查方法：

```python
# 只需要檢查是否存在
if Article.objects.filter(slug=slug).exists():
    # ...

# 需要確切數量
count = Article.objects.filter(status='published').count()

# 如果需要使用對象，不要單獨 count
articles = Article.objects.filter(status='published')
if articles:  # 好
if articles.count() > 0:  # 不好，會產生額外查詢
```

### 緩存策略

#### 1. 查詢結果緩存

```python
from django.core.cache import cache

def get_popular_articles():
    cache_key = 'popular_articles'
    articles = cache.get(cache_key)
    
    if articles is None:
        articles = list(
            Article.objects
            .select_related('author')
            .filter(is_published=True)
            .order_by('-view_count')[:10]
        )
        cache.set(cache_key, articles, timeout=3600)
    
    return articles
```

#### 2. 模板片段緩存

```django
{% load cache %}
{% cache 600 article_sidebar article.id %}
    <div class="sidebar">
        {{ article.related_content }}
    </div>
{% endcache %}
```

#### 3. 視圖緩存

```python
from django.views.decorators.cache import cache_page

@cache_page(60 * 15)  # 15 分鐘
def article_list(request):
    # ...
```

#### 4. 低層級緩存

```python
from django.core.cache import cache

def get_article(article_id):
    cache_key = f'article:{article_id}'
    article = cache.get(cache_key)
    
    if article is None:
        article = Article.objects.select_related('author').get(id=article_id)
        cache.set(cache_key, article, timeout=1800)
    
    return article
```

### 資料庫層面優化

#### 1. 索引

為常查詢的字段添加索引：

```python
class Article(models.Model):
    title = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(unique=True)  # 自動創建索引
    status = models.CharField(max_length=20, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['-created_at']),
        ]
```

#### 2. 資料庫連接池

使用持久連接減少連接開銷：

```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'CONN_MAX_AGE': 600,  # 連接持續時間（秒）
    }
}
```

#### 3. 讀寫分離

配置主從資料庫：

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'mydb',
        'HOST': 'master-db.example.com',
    },
    'replica': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'mydb',
        'HOST': 'replica-db.example.com',
    }
}

# 使用
articles = Article.objects.using('replica').all()  # 讀操作用從庫
```

### 中間件和請求處理

#### 1. 條件性中間件

只在需要時使用中間件：

```python
MIDDLEWARE = [
    'django.middleware.cache.UpdateCacheMiddleware',
    'django.middleware.gzip.GZipMiddleware',  # 壓縮響應
    'django.middleware.common.CommonMiddleware',
    # ...
]
```

#### 2. 使用 StreamingHttpResponse

對於大文件或長時間響應：

```python
from django.http import StreamingHttpResponse

def large_file(request):
    def file_iterator(file_path, chunk_size=8192):
        with open(file_path, 'rb') as f:
            while True:
                chunk = f.read(chunk_size)
                if not chunk:
                    break
                yield chunk
    
    response = StreamingHttpResponse(
        file_iterator('/path/to/large/file.zip'),
        content_type='application/zip'
    )
    return response
```

### 靜態文件和媒體文件

#### 1. 使用 CDN

```python
# settings.py
STATIC_URL = 'https://cdn.example.com/static/'
MEDIA_URL = 'https://cdn.example.com/media/'
```

#### 2. 文件壓縮和合併

使用 `django-compressor` 或 `django-pipeline`：

```python
INSTALLED_APPS = [
    # ...
    'compressor',
]

STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder',
]
```

### 異步處理

#### 1. 使用 Celery 處理耗時任務

```python
# tasks.py
from celery import shared_task

@shared_task
def send_email_task(user_id, subject, message):
    user = User.objects.get(id=user_id)
    send_email(user.email, subject, message)

# views.py
def register(request):
    # ... 創建用戶 ...
    send_email_task.delay(user.id, 'Welcome', 'Thanks for joining!')
    return redirect('home')
```

#### 2. 使用背景任務

```python
# Django 3.1+
from django.http import JsonResponse
import asyncio

async def heavy_computation():
    await asyncio.sleep(2)
    return "result"

async def async_view(request):
    result = await heavy_computation()
    return JsonResponse({'result': result})
```

### 代碼層面優化

#### 1. 使用懶加載

```python
from django.utils.functional import LazyObject

class MyLazyObject(LazyObject):
    def _setup(self):
        self._wrapped = expensive_function()
```

#### 2. 避免在循環中進行 I/O

```python
# 不好的做法
for user in users:
    send_email(user.email, message)  # 每次都發送

# 好的做法
user_emails = [user.email for user in users]
send_bulk_email(user_emails, message)
```

#### 3. 使用生成器

```python
def get_articles_generator():
    # 使用 iterator() 避免一次性加載所有數據
    for article in Article.objects.all().iterator(chunk_size=100):
        yield process_article(article)
```

### 監控和分析

#### 1. Django Debug Toolbar

```python
INSTALLED_APPS = [
    # ...
    'debug_toolbar',
]

MIDDLEWARE = [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    # ...
]
```

#### 2. 查詢日誌

```python
# settings.py
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

#### 3. 使用 django-silk 分析

```python
INSTALLED_APPS = [
    # ...
    'silk',
]

MIDDLEWARE = [
    'silk.middleware.SilkyMiddleware',
    # ...
]
```

### 配置優化

#### 1. DEBUG 模式

生產環境必須關閉：

```python
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com']
```

#### 2. 模板緩存

```python
TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'OPTIONS': {
        'loaders': [
            ('django.template.loaders.cached.Loader', [
                'django.template.loaders.filesystem.Loader',
                'django.template.loaders.app_directories.Loader',
            ]),
        ],
    },
}]
```

#### 3. Session 存儲

使用緩存而非資料庫：

```python
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
```

## 程式碼範例

```python
# 完整的優化示例
from django.core.cache import cache
from django.db.models import Prefetch, Count, Q
from django.views.generic import ListView

class OptimizedArticleListView(ListView):
    model = Article
    template_name = 'article_list.html'
    paginate_by = 20
    
    def get_queryset(self):
        # 檢查緩存
        cache_key = f'article_list:page:{self.get_page()}'
        cached_result = cache.get(cache_key)
        
        if cached_result is not None:
            return cached_result
        
        # 優化查詢
        queryset = Article.objects.select_related(
            'author',
            'category'
        ).prefetch_related(
            Prefetch(
                'comments',
                queryset=Comment.objects.filter(
                    is_approved=True
                ).select_related('author')[:5]
            ),
            'tags'
        ).annotate(
            comment_count=Count('comments', filter=Q(comments__is_approved=True))
        ).filter(
            status='published'
        ).only(
            'id', 'title', 'slug', 'created_at',
            'author__username', 'category__name'
        ).order_by('-created_at')
        
        # 緩存結果
        result = list(queryset)
        cache.set(cache_key, result, timeout=300)
        
        return result
    
    def get_page(self):
        return self.request.GET.get('page', 1)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # 緩存側邊欄數據
        cache_key = 'sidebar_data'
        sidebar_data = cache.get(cache_key)
        
        if sidebar_data is None:
            sidebar_data = {
                'popular_articles': Article.objects.filter(
                    status='published'
                ).order_by('-view_count')[:5].values('id', 'title'),
                'categories': Category.objects.annotate(
                    article_count=Count('articles')
                ).values('id', 'name', 'article_count'),
            }
            cache.set(cache_key, sidebar_data, timeout=1800)
        
        context.update(sidebar_data)
        return context
```

## 總結

Django 性能優化是一個系統性工程，涉及資料庫、緩存、代碼和配置多個層面。重點是識別性能瓶頸（通過監控工具），然後針對性優化。常見的優化方向包括減少資料庫查詢次數、使用適當的緩存策略、優化資料庫索引、使用異步處理耗時任務等。在優化時，應該先測量再優化，避免過早優化，並在優化後驗證效果。
