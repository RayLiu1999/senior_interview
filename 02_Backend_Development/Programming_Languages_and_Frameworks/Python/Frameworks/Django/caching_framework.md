# Django Cache 框架

- **難度**: 6
- **重要性**: 4
- **標籤**: `Cache`, `Performance`, `Redis`

## 問題詳述

Django 的 Cache 框架提供了統一的 API 來使用不同的緩存後端，幫助開發者減少資料庫查詢、降低響應時間，提升應用性能。

## 核心理論與詳解

### Cache 框架的架構

Django Cache 框架採用**抽象層設計**，提供統一的接口來操作不同的緩存後端，主要組件包括：

- **緩存後端 (Cache Backend)**：實際存儲緩存數據的系統
- **緩存 API**：統一的接口來設置、獲取和刪除緩存
- **緩存鍵 (Cache Key)**：用於識別緩存數據的唯一標識符

### 支持的緩存後端

#### 1. Memcached

高性能的分佈式記憶體緩存系統，適合生產環境。

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.PyMemcacheCache',
        'LOCATION': '127.0.0.1:11211',
    }
}
```

#### 2. Redis

功能豐富的內存數據結構存儲，支持持久化和高級數據結構。

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

#### 3. Database Cache

使用資料庫表存儲緩存，適合簡單場景但性能較差。

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
        'LOCATION': 'my_cache_table',
    }
}
```

#### 4. File-based Cache

使用文件系統存儲緩存。

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
        'LOCATION': '/var/tmp/django_cache',
    }
}
```

#### 5. Local Memory Cache

進程內記憶體緩存，適合開發環境和單機部署。

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}
```

#### 6. Dummy Cache

空緩存實現，用於開發或禁用緩存。

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}
```

### 基本緩存操作

#### 設置和獲取緩存

```python
from django.core.cache import cache

# 設置緩存，默認永不過期
cache.set('my_key', 'my_value')

# 設置緩存，300 秒後過期
cache.set('my_key', 'my_value', timeout=300)

# 獲取緩存
value = cache.get('my_key')

# 獲取緩存，如果不存在返回默認值
value = cache.get('my_key', default='default_value')
```

#### 批量操作

```python
# 批量設置
cache.set_many({'a': 1, 'b': 2, 'c': 3}, timeout=300)

# 批量獲取
values = cache.get_many(['a', 'b', 'c'])
# 返回: {'a': 1, 'b': 2, 'c': 3}

# 刪除緩存
cache.delete('my_key')

# 批量刪除
cache.delete_many(['a', 'b', 'c'])

# 清空所有緩存
cache.clear()
```

#### 原子操作

```python
# 增加數值（原子操作）
cache.incr('counter')  # 加 1
cache.incr('counter', delta=5)  # 加 5

# 減少數值
cache.decr('counter')  # 減 1
cache.decr('counter', delta=3)  # 減 3

# 僅當鍵不存在時設置
cache.add('my_key', 'value', timeout=300)

# 獲取並設置
old_value = cache.get_or_set('my_key', 'default_value', timeout=300)
```

### Django 的緩存層級

#### 1. 站點級緩存 (Site-wide Cache)

緩存整個站點，通過中間件實現：

```python
MIDDLEWARE = [
    'django.middleware.cache.UpdateCacheMiddleware',  # 必須在首位
    'django.middleware.common.CommonMiddleware',
    'django.middleware.cache.FetchFromCacheMiddleware',  # 必須在末位
]

CACHE_MIDDLEWARE_ALIAS = 'default'
CACHE_MIDDLEWARE_SECONDS = 600
CACHE_MIDDLEWARE_KEY_PREFIX = 'mysite'
```

#### 2. 視圖級緩存 (Per-view Cache)

緩存特定視圖的輸出：

```python
from django.views.decorators.cache import cache_page

# 緩存 15 分鐘
@cache_page(60 * 15)
def my_view(request):
    # ...
    return render(request, 'template.html', context)

# URL 配置中使用
from django.views.decorators.cache import cache_page

urlpatterns = [
    path('articles/', cache_page(60 * 15)(ArticleListView.as_view())),
]
```

#### 3. 模板片段緩存 (Template Fragment Cache)

在模板中緩存特定片段：

```django
{% load cache %}

{% cache 500 sidebar request.user.username %}
    ... 側邊欄內容 ...
{% endcache %}

<!-- 帶變量的緩存 -->
{% cache 600 article_detail article.id %}
    <h1>{{ article.title }}</h1>
    <p>{{ article.content }}</p>
{% endcache %}
```

#### 4. 底層緩存 API (Low-level Cache API)

手動控制緩存邏輯：

```python
from django.core.cache import cache

def get_article(article_id):
    cache_key = f'article:{article_id}'
    article = cache.get(cache_key)
    
    if article is None:
        article = Article.objects.get(id=article_id)
        cache.set(cache_key, article, timeout=300)
    
    return article
```

### 多緩存配置

Django 支持配置多個緩存後端：

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    },
    'sessions': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/2',
    },
    'local': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'local-cache',
    }
}
```

使用特定緩存：

```python
from django.core.cache import caches

# 使用 sessions 緩存
session_cache = caches['sessions']
session_cache.set('session_key', session_data)

# 使用 local 緩存
local_cache = caches['local']
local_cache.set('temp_data', data)
```

### 緩存鍵的設計

#### 鍵命名最佳實踐

```python
# 使用命名空間和版本號
cache_key = f'v1:user:{user_id}:profile'

# 包含相關參數
cache_key = f'articles:list:page:{page}:category:{category_id}'

# 使用 make_key 函數標準化
def make_cache_key(model_name, obj_id, suffix=''):
    parts = [model_name, str(obj_id)]
    if suffix:
        parts.append(suffix)
    return ':'.join(parts)

cache_key = make_cache_key('article', 123, 'detail')
# 結果: 'article:123:detail'
```

#### 避免鍵衝突

```python
from django.core.cache.utils import make_template_fragment_key

# 生成模板片段緩存鍵
cache_key = make_template_fragment_key('article_detail', [article.id])

# 自定義鍵前綴
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'KEY_PREFIX': 'myapp',
        'VERSION': 1,
    }
}
```

### 緩存失效策略

#### 1. 基於時間的失效 (TTL)

```python
# 設置 5 分鐘過期
cache.set('key', 'value', timeout=300)

# 永不過期
cache.set('key', 'value', timeout=None)
```

#### 2. 主動失效

```python
# 當數據更新時清除緩存
def update_article(article_id, data):
    article = Article.objects.get(id=article_id)
    article.update(data)
    article.save()
    
    # 清除相關緩存
    cache.delete(f'article:{article_id}')
    cache.delete(f'article:{article_id}:detail')
    cache.delete('articles:list')
```

#### 3. 緩存版本控制

```python
# 使用版本號管理緩存
ARTICLE_CACHE_VERSION = 1

cache.set('article:123', article_data, version=ARTICLE_CACHE_VERSION)
cache.get('article:123', version=ARTICLE_CACHE_VERSION)

# 更新版本號使所有相關緩存失效
ARTICLE_CACHE_VERSION = 2
```

### 緩存使用的最佳實踐

#### 1. 緩存熱點數據

```python
def get_popular_articles():
    cache_key = 'articles:popular'
    articles = cache.get(cache_key)
    
    if articles is None:
        articles = Article.objects.filter(
            is_published=True
        ).order_by('-views')[:10]
        cache.set(cache_key, list(articles), timeout=600)
    
    return articles
```

#### 2. 使用緩存穿透保護

```python
def get_article_by_id(article_id):
    cache_key = f'article:{article_id}'
    
    # 先檢查緩存
    result = cache.get(cache_key)
    if result == 'NOT_FOUND':
        return None
    if result is not None:
        return result
    
    # 查詢資料庫
    try:
        article = Article.objects.get(id=article_id)
        cache.set(cache_key, article, timeout=300)
        return article
    except Article.DoesNotExist:
        # 緩存不存在的結果，防止緩存穿透
        cache.set(cache_key, 'NOT_FOUND', timeout=60)
        return None
```

#### 3. 避免緩存雪崩

```python
import random

def get_article_with_jitter(article_id):
    cache_key = f'article:{article_id}'
    article = cache.get(cache_key)
    
    if article is None:
        article = Article.objects.get(id=article_id)
        # 添加隨機時間避免同時過期
        timeout = 300 + random.randint(0, 60)
        cache.set(cache_key, article, timeout=timeout)
    
    return article
```

#### 4. 監控緩存命中率

```python
def get_with_metrics(cache_key, fetch_func, timeout=300):
    """帶監控的緩存獲取"""
    value = cache.get(cache_key)
    
    if value is None:
        # 緩存未命中
        metrics.increment('cache.miss')
        value = fetch_func()
        cache.set(cache_key, value, timeout=timeout)
    else:
        # 緩存命中
        metrics.increment('cache.hit')
    
    return value
```

### 常見問題與解決方案

#### 1. 序列化問題

Django 默認使用 pickle 序列化，但某些對象可能無法序列化：

```python
# 解決方案：轉換為可序列化格式
def cache_queryset(queryset, cache_key, timeout=300):
    # 將 QuerySet 轉換為列表
    data = list(queryset.values())
    cache.set(cache_key, data, timeout=timeout)
    return data
```

#### 2. 緩存一致性

```python
from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Article)
def invalidate_article_cache(sender, instance, **kwargs):
    """文章保存後清除緩存"""
    transaction.on_commit(lambda: cache.delete(f'article:{instance.id}'))
```

#### 3. 內存限制

對於大對象，考慮只緩存 ID 或關鍵字段：

```python
# 不好的做法：緩存整個大對象
cache.set('articles', Article.objects.all())  # 可能很大

# 好的做法：只緩存 ID 列表
article_ids = Article.objects.values_list('id', flat=True)
cache.set('article_ids', list(article_ids))
```

## 程式碼範例

```python
# cache_utils.py
from django.core.cache import cache
from functools import wraps
import hashlib
import json

def cache_result(timeout=300, key_prefix=''):
    """緩存裝飾器"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # 生成緩存鍵
            key_parts = [key_prefix or func.__name__]
            key_parts.extend(str(arg) for arg in args)
            key_parts.extend(f'{k}:{v}' for k, v in sorted(kwargs.items()))
            
            cache_key = hashlib.md5(
                ':'.join(key_parts).encode()
            ).hexdigest()
            
            # 嘗試從緩存獲取
            result = cache.get(cache_key)
            if result is not None:
                return result
            
            # 執行函數並緩存結果
            result = func(*args, **kwargs)
            cache.set(cache_key, result, timeout=timeout)
            return result
        
        return wrapper
    return decorator

# 使用示例
@cache_result(timeout=600, key_prefix='article_list')
def get_articles_by_category(category_id, page=1, per_page=20):
    offset = (page - 1) * per_page
    return Article.objects.filter(
        category_id=category_id
    )[offset:offset + per_page]
```

## 總結

Django Cache 框架提供了靈活且強大的緩存能力，合理使用可以顯著提升應用性能。選擇合適的緩存後端、設計良好的緩存鍵、實施正確的失效策略，並注意緩存一致性和監控，是成功運用緩存的關鍵。在生產環境中，Redis 和 Memcached 是最常用的選擇，它們提供了高性能和豐富的功能。
