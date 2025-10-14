# Django ORM 深入解析

- **難度**: 7
- **標籤**: `ORM`, `QuerySet`, `Database`

## 問題詳述

Django ORM 是 Django 框架的核心組件之一，提供了強大的數據庫抽象層。如何高效使用 Django ORM 並避免常見的性能陷阱？

## 核心理論與詳解

### ORM 基礎概念

**什麼是 ORM？**
- **Object-Relational Mapping**：對象關係映射
- 將數據庫表映射為 Python 類
- 將數據庫記錄映射為 Python 對象
- 自動處理 SQL 生成和執行

**Django ORM 的優勢**
- 數據庫無關性：支持多種數據庫後端
- 安全性：防止 SQL 注入
- 可維護性：使用 Python 代碼而非原始 SQL
- 功能豐富：支持關係、聚合、事務等

### QuerySet 核心特性

**惰性求值 (Lazy Evaluation)**
- QuerySet 不會立即執行數據庫查詢
- 只在需要數據時才執行查詢
- 可以鏈式調用多個過濾方法

**觸發查詢的操作**
- 迭代：`for user in users`
- 切片：`users[0:5]`
- 轉換：`list(users)`, `len(users)`
- 布爾判斷：`if users`

**查詢緩存**
- QuerySet 結果會被緩存
- 同一個 QuerySet 對象多次使用不會重複查詢
- 不同的 QuerySet 對象不共享緩存

### 常用查詢方法

**過濾方法**
```python
# filter() - 返回符合條件的 QuerySet
User.objects.filter(age__gte=18)

# exclude() - 排除符合條件的記錄
User.objects.exclude(is_active=False)

# get() - 返回單個對象，不存在或多個會拋出異常
user = User.objects.get(id=1)

# first() / last() - 返回第一個/最後一個
user = User.objects.first()
```

**查詢表達式**
- `__exact`: 精確匹配
- `__iexact`: 不區分大小寫匹配
- `__contains`: 包含
- `__icontains`: 不區分大小寫包含
- `__in`: 在列表中
- `__gt`, `__gte`, `__lt`, `__lte`: 比較運算
- `__startswith`, `__endswith`: 前綴/後綴匹配

### 關聯查詢優化

**N+1 問題**
```python
# 不好的做法 - N+1 查詢
for post in Post.objects.all():  # 1 次查詢
    print(post.author.name)      # N 次查詢

# 好的做法 - 使用 select_related
for post in Post.objects.select_related('author'):  # 1 次 JOIN 查詢
    print(post.author.name)
```

**select_related**
- 用於 ForeignKey 和 OneToOneField
- 使用 SQL JOIN 一次性獲取相關對象
- 適用於一對一或多對一關係

**prefetch_related**
- 用於 ManyToManyField 和反向 ForeignKey
- 使用額外的查詢預取相關對象
- 適用於多對多或一對多關係

### 聚合與分組

**聚合函數**
```python
from django.db.models import Count, Avg, Max, Min, Sum

# 計數
User.objects.count()

# 聚合
User.objects.aggregate(
    total=Count('id'),
    avg_age=Avg('age'),
    max_age=Max('age')
)

# 分組聚合
User.objects.values('city').annotate(count=Count('id'))
```

**annotate vs aggregate**
- `annotate`：為每個對象添加聚合值
- `aggregate`：為整個 QuerySet 計算聚合值

### 高級查詢

**Q 對象**
- 用於複雜的查詢條件
- 支持 AND、OR、NOT 邏輯

**F 對象**
- 引用模型字段值
- 用於字段間比較或更新

**原始 SQL**
- `raw()`：執行原始 SQL 並映射到模型
- `extra()`：添加額外的 SQL 片段
- `connection.cursor()`：完全自定義 SQL

### 事務管理

**原子性操作**
```python
from django.db import transaction

# 裝飾器形式
@transaction.atomic
def create_user_with_profile(data):
    user = User.objects.create(**data['user'])
    Profile.objects.create(user=user, **data['profile'])

# 上下文管理器形式
with transaction.atomic():
    user = User.objects.create(username='alice')
    Profile.objects.create(user=user)
```

### 性能優化技巧

1. **使用 select_related 和 prefetch_related**
2. **只查詢需要的字段**：`values()`, `values_list()`, `only()`, `defer()`
3. **批量操作**：`bulk_create()`, `bulk_update()`
4. **數據庫索引**：在模型中定義 `db_index=True`
5. **查詢分析**：使用 `queryset.query` 查看生成的 SQL
6. **數據庫連接池**：使用 `django-db-connection-pool`

### 常見陷阱

1. **N+1 查詢問題**：忘記使用 select_related/prefetch_related
2. **QuerySet 緩存失效**：對 QuerySet 切片或使用不同過濾條件
3. **過度使用 get()**：應該使用 filter().first()
4. **忽略數據庫遷移**：修改模型後忘記執行 makemigrations
5. **在循環中執行查詢**：應該批量獲取數據

## 程式碼範例

```python
from django.db import models
from django.db.models import Q, F, Count, Prefetch

# 模型定義
class Author(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    
class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    tags = models.ManyToManyField('Tag')
    created_at = models.DateTimeField(auto_now_add=True)
    
class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

# 基本查詢
posts = Post.objects.filter(author__name='Alice')
posts = Post.objects.filter(created_at__year=2024)

# 複雜查詢 - Q 對象
posts = Post.objects.filter(
    Q(title__icontains='django') | Q(title__icontains='python')
)

# 關聯查詢優化
# 不好的做法
posts = Post.objects.all()
for post in posts:
    print(post.author.name)  # N+1 問題

# 好的做法 - select_related
posts = Post.objects.select_related('author')
for post in posts:
    print(post.author.name)  # 只有 1 次查詢

# prefetch_related 用於多對多
posts = Post.objects.prefetch_related('tags')
for post in posts:
    for tag in post.tags.all():  # 不會產生額外查詢
        print(tag.name)

# 自定義預取
posts = Post.objects.prefetch_related(
    Prefetch('tags', queryset=Tag.objects.filter(name__startswith='P'))
)

# 聚合查詢
# 每個作者的文章數
authors = Author.objects.annotate(post_count=Count('post'))
for author in authors:
    print(f"{author.name}: {author.post_count} posts")

# 整體統計
stats = Post.objects.aggregate(
    total=Count('id'),
    avg_tags=Avg('tags__count')
)

# F 對象 - 字段間比較和更新
# 增加所有文章的瀏覽量
Post.objects.update(views=F('views') + 1)

# 只查詢需要的字段
# values() - 返回字典
posts = Post.objects.values('title', 'author__name')

# only() - 返回模型實例，但只加載指定字段
posts = Post.objects.only('title', 'created_at')

# defer() - 延遲加載某些字段
posts = Post.objects.defer('content')

# 批量操作
# bulk_create - 批量創建
posts = [
    Post(title=f'Post {i}', content='...', author=author)
    for i in range(1000)
]
Post.objects.bulk_create(posts, batch_size=100)

# bulk_update - 批量更新
posts = Post.objects.all()
for post in posts:
    post.title = post.title.upper()
Post.objects.bulk_update(posts, ['title'], batch_size=100)

# 原始 SQL
posts = Post.objects.raw(
    'SELECT * FROM blog_post WHERE title LIKE %s',
    ['%Django%']
)

# 事務處理
from django.db import transaction

@transaction.atomic
def create_post_with_tags(post_data, tag_names):
    post = Post.objects.create(**post_data)
    tags = [Tag.objects.get_or_create(name=name)[0] for name in tag_names]
    post.tags.set(tags)
    return post

# 查詢調試 - 查看生成的 SQL
queryset = Post.objects.filter(author__name='Alice')
print(queryset.query)  # 打印 SQL 語句
```

## 相關資源

- [Django ORM 官方文檔](https://docs.djangoproject.com/en/stable/topics/db/)
- [Django QuerySet API 參考](https://docs.djangoproject.com/en/stable/ref/models/querysets/)
- [Django Database Performance](https://docs.djangoproject.com/en/stable/topics/db/optimization/)
