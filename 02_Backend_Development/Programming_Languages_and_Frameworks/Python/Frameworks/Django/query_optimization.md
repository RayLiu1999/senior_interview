# Django 查詢優化

- **難度**: 8
- **重要程度**: 5
- **標籤**: `Query Optimization`, `N+1 Problem`, `Performance`, `Database`

## 問題詳述

深入探討 Django ORM 的查詢優化技術，包括 N+1 問題的識別和解決、select_related 和 prefetch_related 的使用、查詢分析工具以及各種優化策略。

## 核心理論與詳解

### N+1 查詢問題

**什麼是 N+1 問題**：N+1 問題是 ORM 中最常見的性能陷阱。當查詢一個對象列表，然後對每個對象訪問其關聯對象時，會產生 1 次主查詢 + N 次關聯查詢，總共 N+1 次數據庫訪問。

**問題示例**：獲取所有文章及其作者。如果有 100 篇文章，會執行 1 次查詢獲取文章，然後為每篇文章執行 1 次查詢獲取作者，總共 101 次查詢。

**識別方法**：使用 Django Debug Toolbar、日誌記錄或 `django.db.connection.queries` 查看實際執行的 SQL 查詢數量和內容。

**影響**：每次數據庫往返都有網絡延遲。N+1 問題會導致頁面加載時間線性增長，嚴重影響性能。

### select_related() 優化

**工作原理**：`select_related()` 使用 SQL JOIN 在單次查詢中獲取主對象及其關聯對象。它創建更複雜的 SQL 查詢，但減少了數據庫往返次數。

**適用場景**：用於優化 ForeignKey 和 OneToOneField 關係的訪問。這些關係是"一對一"或"多對一"的，可以通過 JOIN 高效獲取。

**使用方式**：`Model.objects.select_related('foreign_key_field')`。可以跟隨關係鏈，如 `select_related('author__profile')`。

**多個關係**：可以同時優化多個關聯：`select_related('author', 'category')`。

**性能權衡**：雖然減少了查詢次數，但會增加單次查詢返回的數據量和JOIN的複雜度。對於大量數據，需要權衡。

### prefetch_related() 優化

**工作原理**：`prefetch_related()` 執行單獨的查詢來獲取關聯對象，然後在 Python 中進行"拼接"。它會執行額外的查詢（通常是 2 次：主對象 + 關聯對象），但比 N+1 好得多。

**適用場景**：用於優化 ManyToManyField 和反向 ForeignKey 關係（一對多）。這些關係不能通過簡單的 JOIN 有效獲取。

**使用方式**：`Model.objects.prefetch_related('many_to_many_field')`。也支持關係鏈，如 `prefetch_related('posts__comments')`。

**查詢次數**：對於單層關係，執行 2 次查詢。對於嵌套關係，查詢次數增加，但仍遠少於 N+1。

**與 filter 結合**：可以使用 `Prefetch` 對象自定義預取的查詢集，如只預取已發布的文章。

### Prefetch 對象

**高級控制**：`Prefetch` 對象允許自定義預取查詢，包括過濾、排序、使用不同的查詢集等。

**語法**：`Prefetch('relationship', queryset=CustomQuerySet)`。可以指定 `to_attr` 來將結果存儲在自定義屬性中。

**嵌套 Prefetch**：可以嵌套使用 Prefetch 對象來優化多層關聯，提供對每層的精確控制。

**應用場景**：當需要預取的關聯對象有特定條件（如只要活躍用戶的評論）時，Prefetch 非常有用。

### only() 和 defer()

**only() 方法**：只加載指定的字段，減少從數據庫傳輸的數據量。訪問未加載的字段會觸發額外查詢。

**defer() 方法**：延遲加載指定的字段。與 only() 相反，它加載除指定字段外的所有字段。

**使用場景**：當模型有大型字段（如文本內容、BLOB）且不總是需要時，使用 defer() 可以提高性能。

**注意事項**：過度使用可能導致意外的額外查詢。確保真正需要的字段都被加載。

### values() 和 values_list()

**values() 方法**：返回字典列表而非模型實例，只包含指定的字段。性能更好，內存佔用更少。

**values_list() 方法**：返回元組列表，比 values() 更輕量。使用 `flat=True` 可以返回單一值的列表。

**適用場景**：當只需要少數字段用於計算或顯示，不需要完整的模型功能時使用。

**限制**：返回的不是模型實例，無法訪問模型方法或屬性。

### 聚合和註解

**aggregate()**：對整個查詢集執行聚合函數（Sum、Count、Avg、Max、Min 等），返回聚合結果的字典。

**annotate()**：為查詢集中的每個對象添加聚合值。結果仍是查詢集，可以繼續過濾和操作。

**性能優勢**：在數據庫層面進行計算比在 Python 中迭代計算快得多，特別是對大數據集。

**複雜聚合**：可以使用 F 表達式、Q 對象和條件表達式（Case、When）構建複雜的聚合邏輯。

### F 表達式

**數據庫級操作**：F 表達式引用模型字段的值，在數據庫級別執行操作，避免競態條件。

**常見用途**：
- 基於字段值更新：`Post.objects.update(views=F('views') + 1)`
- 字段比較過濾：`Post.objects.filter(likes__gt=F('views'))`

**性能優勢**：操作在數據庫中完成，減少數據傳輸和競態條件風險。

### Q 對象複雜查詢

**複雜條件**：Q 對象可以構建複雜的查詢條件，使用 &（AND）、|（OR）、~（NOT）邏輯運算。

**動態查詢**：可以動態構建查詢條件，根據用戶輸入組合不同的過濾器。

**性能考慮**：複雜的 Q 查詢可能生成複雜的 SQL。檢查生成的 SQL 確保性能可接受。

### 批量操作

**bulk_create()**：一次性插入多個對象，大大快於逐個調用 save()。不觸發 save() 信號，不設置主鍵（某些數據庫）。

**bulk_update()**：批量更新對象。需要指定要更新的字段。Django 3.0+ 支持。

**update()**：查詢集級別的更新，生成單個 UPDATE 語句。不調用 save() 方法，不觸發信號。

**性能對比**：批量操作可以將性能提升 10-100 倍，特別是對大量數據時。

### 數據庫索引

**db_index=True**：在模型字段上添加數據庫索引，加速查詢但會減慢寫入。

**index_together**：為多個字段組合創建複合索引，優化多字段過濾查詢（Meta 選項）。

**indexes 選項**：Django 1.11+ 提供更靈活的索引定義，支持命名、部分索引、函數索引等（某些數據庫）。

**策略**：為經常用於過濾、排序、JOIN 的字段添加索引。監控慢查詢日誌來識別需要索引的字段。

### 查詢集緩存

**查詢集惰性**：查詢集是惰性的，只在實際訪問數據時才執行查詢。

**結果緩存**：一旦查詢集被評估（迭代、切片、調用 list() 等），結果會被緩存。再次訪問不會重新查詢。

**緩存失效**：對查詢集進行任何修改（filter、order_by 等）都會創建新的查詢集，需要重新查詢。

**最佳實踐**：如果需要多次訪問相同數據，將查詢集賦值給變量以利用緩存。

### 查詢分析工具

**Django Debug Toolbar**：最流行的調試工具，提供 SQL 面板顯示所有查詢、執行時間、重複查詢等。

**django.db.connection.queries**：在代碼中直接訪問查詢列表，用於編程式分析。

**queryset.explain()**：Django 2.1+ 提供，返回數據庫的查詢執行計劃（EXPLAIN），幫助理解查詢性能。

**日誌記錄**：配置 Django 日誌記錄所有 SQL 查詢，便於分析和監控。

### 數據庫特定優化

**原生 SQL**：對於極度複雜或高性能要求的查詢，可以使用原生 SQL。使用 `raw()`、`extra()` 或直接執行 SQL。

**數據庫視圖**：創建數據庫視圖來封裝複雜查詢，然後通過 managed=False 的模型訪問。

**存儲過程**：對於複雜的業務邏輯，可以使用數據庫存儲過程，通過 Django 調用。

**數據庫特定功能**：利用特定數據庫的高級功能，如 PostgreSQL 的數組字段、全文搜索、JSONField 等。

### 緩存策略

**查詢結果緩存**：使用 Django 緩存框架緩存查詢結果，特別是對不常變化的數據。

**模板片段緩存**：緩存渲染的模板片段，避免重複的數據庫查詢和模板渲染。

**緩存失效**：設計合理的緩存失效策略，確保數據一致性。

**Redis/Memcached**：使用專業的緩存後端而非數據庫緩存，獲得更好的性能。

### 最佳實踐

**測量先於優化**：總是先測量性能，識別真正的瓶頸，然後針對性優化。過早優化可能浪費時間。

**監控生產環境**：使用 APM 工具（如 New Relic、DataDog）監控生產環境的數據庫性能。

**查詢複雜度平衡**：過於複雜的優化可能使代碼難以維護。在性能和可維護性間找到平衡。

**文檔化優化**：為優化的查詢添加註釋，解釋為什麼這樣做，幫助其他開發者理解。

## 程式碼範例

```python
# Django 查詢優化完整示例

from django.db import models
from django.db.models import Count, Sum, Avg, F, Q, Prefetch, Case, When
from django.db import connection


# 模型定義
class Author(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    bio = models.TextField()
    
    class Meta:
        indexes = [
            models.Index(fields=['email']),  # 為常查詢字段添加索引
        ]


class Post(models.Model):
    title = models.CharField(max_length=200, db_index=True)
    content = models.TextField()
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='posts')
    created_at = models.DateTimeField(auto_now_add=True)
    views = models.IntegerField(default=0)
    likes = models.IntegerField(default=0)
    
    class Meta:
        index_together = [['author', 'created_at']]  # 複合索引


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


# 1. N+1 問題示例（錯誤）
def bad_query_n_plus_1():
    """N+1 問題示例 - 會執行 1 + N 次查詢"""
    posts = Post.objects.all()  # 1 次查詢
    
    for post in posts:
        print(post.author.name)  # 每次迭代 1 次查詢
        # 如果有 100 篇文章，總共 101 次查詢


# 2. 使用 select_related 優化（正確）
def good_query_select_related():
    """使用 select_related 優化 - 只執行 1 次查詢"""
    posts = Post.objects.select_related('author').all()
    
    for post in posts:
        print(post.author.name)  # 不觸發額外查詢
    
    # SQL: SELECT * FROM post INNER JOIN author ON post.author_id = author.id


# 3. 跟隨關係鏈
def select_related_chain():
    """跟隨多層關係"""
    comments = Comment.objects.select_related(
        'post',           # 評論的文章
        'post__author',   # 文章的作者
        'author'          # 評論的作者
    )
    
    for comment in comments:
        print(f"{comment.author.name} 在 {comment.post.author.name} 的文章中評論")


# 4. prefetch_related 用於多對多和反向外鍵
def good_query_prefetch_related():
    """使用 prefetch_related - 執行 2 次查詢"""
    authors = Author.objects.prefetch_related('posts')
    
    for author in authors:
        print(f"{author.name} 的文章:")
        for post in author.posts.all():  # 不觸發額外查詢
            print(f"  - {post.title}")
    
    # 執行 2 次查詢：
    # 1. SELECT * FROM author
    # 2. SELECT * FROM post WHERE author_id IN (...)


# 5. 嵌套 prefetch_related
def nested_prefetch():
    """嵌套預取"""
    authors = Author.objects.prefetch_related(
        'posts',            # 作者的文章
        'posts__comments'   # 文章的評論
    )
    
    for author in authors:
        for post in author.posts.all():
            print(f"{post.title} 有 {post.comments.count()} 條評論")


# 6. 使用 Prefetch 對象自定義
def custom_prefetch():
    """使用 Prefetch 對象自定義預取"""
    from django.db.models import Prefetch
    
    # 只預取最近 5 條評論
    recent_comments = Comment.objects.order_by('-created_at')[:5]
    
    posts = Post.objects.prefetch_related(
        Prefetch('comments', queryset=recent_comments, to_attr='recent_comments')
    )
    
    for post in posts:
        print(f"{post.title}:")
        for comment in post.recent_comments:  # 使用自定義屬性
            print(f"  - {comment.content[:50]}")


# 7. only() 和 defer()
def use_only_and_defer():
    """只加載需要的字段"""
    # only - 只加載指定字段
    posts = Post.objects.only('title', 'created_at')
    for post in posts:
        print(post.title)  # OK
        # print(post.content)  # 會觸發額外查詢
    
    # defer - 延遲加載大字段
    posts = Post.objects.defer('content')  # 不加載 content
    for post in posts:
        print(post.title)  # OK，不觸發額外查詢


# 8. values() 和 values_list()
def use_values():
    """使用 values 減少內存佔用"""
    # values - 返回字典
    posts = Post.objects.values('id', 'title', 'author__name')
    for post in posts:
        print(post['title'], post['author__name'])
    
    # values_list - 返回元組
    post_titles = Post.objects.values_list('title', flat=True)
    # ['Post 1', 'Post 2', ...]
    
    # 多個字段
    post_data = Post.objects.values_list('title', 'views')
    # [('Post 1', 100), ('Post 2', 200), ...]


# 9. 聚合查詢
def use_aggregation():
    """聚合和註解"""
    # aggregate - 整個查詢集的聚合
    stats = Post.objects.aggregate(
        total_posts=Count('id'),
        avg_views=Avg('views'),
        total_likes=Sum('likes')
    )
    print(stats)  # {'total_posts': 100, 'avg_views': 150.5, 'total_likes': 5000}
    
    # annotate - 為每個對象添加聚合值
    authors = Author.objects.annotate(
        post_count=Count('posts'),
        total_views=Sum('posts__views')
    ).filter(post_count__gt=5)
    
    for author in authors:
        print(f"{author.name}: {author.post_count} 篇文章, {author.total_views} 瀏覽")


# 10. F 表達式
def use_f_expression():
    """使用 F 表達式"""
    # 原子性增加瀏覽量
    post = Post.objects.get(id=1)
    post.views = F('views') + 1
    post.save()
    
    # 批量更新
    Post.objects.update(views=F('views') + 1)
    
    # 字段比較查詢
    popular_posts = Post.objects.filter(likes__gt=F('views') * 0.1)


# 11. Q 對象複雜查詢
def use_q_objects():
    """使用 Q 對象構建複雜查詢"""
    # OR 查詢
    posts = Post.objects.filter(
        Q(title__icontains='python') | Q(content__icontains='python')
    )
    
    # 複雜條件
    posts = Post.objects.filter(
        (Q(views__gt=100) & Q(likes__gt=10)) | Q(author__name='Admin')
    )
    
    # 動態查詢
    query = Q()
    if search_title:
        query |= Q(title__icontains=search_title)
    if search_content:
        query |= Q(content__icontains=search_content)
    posts = Post.objects.filter(query)


# 12. 批量操作
def bulk_operations():
    """批量操作提高性能"""
    # bulk_create - 批量創建
    posts = [
        Post(title=f'Post {i}', content='Content', author_id=1)
        for i in range(1000)
    ]
    Post.objects.bulk_create(posts)  # 一次性插入
    
    # bulk_update - 批量更新（Django 2.2+）
    posts = Post.objects.all()[:1000]
    for post in posts:
        post.views += 1
    Post.objects.bulk_update(posts, ['views'])
    
    # update - 查詢集級更新
    Post.objects.filter(views__lt=100).update(views=F('views') + 10)


# 13. 查詢分析
def analyze_queries():
    """分析和優化查詢"""
    # 重置查詢記錄
    from django.db import reset_queries
    reset_queries()
    
    # 執行操作
    posts = Post.objects.select_related('author').all()
    for post in posts:
        print(post.title)
    
    # 查看執行的查詢
    from django.db import connection
    print(f"查詢數量: {len(connection.queries)}")
    for query in connection.queries:
        print(f"SQL: {query['sql']}")
        print(f"時間: {query['time']}秒")
    
    # 使用 explain 查看執行計劃（Django 2.1+）
    print(Post.objects.filter(views__gt=100).explain())


# 14. 使用 iterator() 處理大數據集
def use_iterator():
    """使用 iterator 減少內存佔用"""
    # 不使用 iterator - 會將所有結果加載到內存
    # posts = Post.objects.all()
    
    # 使用 iterator - 逐批從數據庫讀取
    for post in Post.objects.all().iterator(chunk_size=2000):
        process_post(post)  # 處理每篇文章
    
    # 注意：iterator 不緩存結果，每次迭代都會查詢


# 15. 條件聚合
def conditional_aggregation():
    """條件聚合"""
    authors = Author.objects.annotate(
        published_posts=Count('posts', filter=Q(posts__is_published=True)),
        draft_posts=Count('posts', filter=Q(posts__is_published=False)),
        high_view_posts=Count(
            'posts',
            filter=Q(posts__views__gt=1000)
        )
    )


# 16. 使用原生 SQL（最後手段）
def use_raw_sql():
    """使用原生 SQL"""
    # raw() - 返回模型實例
    posts = Post.objects.raw(
        'SELECT * FROM post WHERE views > %s ORDER BY views DESC',
        [100]
    )
    
    # 執行任意 SQL
    from django.db import connection
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM post WHERE views > %s", [100])
        count = cursor.fetchone()[0]


# 17. 性能測試工具
def performance_test():
    """性能測試"""
    import time
    
    # 測試 N+1 問題
    start = time.time()
    posts = Post.objects.all()
    for post in posts:
        _ = post.author.name
    n_plus_1_time = time.time() - start
    
    # 測試 select_related
    start = time.time()
    posts = Post.objects.select_related('author').all()
    for post in posts:
        _ = post.author.name
    optimized_time = time.time() - start
    
    print(f"N+1: {n_plus_1_time:.2f}s")
    print(f"優化後: {optimized_time:.2f}s")
    print(f"提升: {n_plus_1_time / optimized_time:.2f}x")


# 18. 數據庫索引遷移
"""
# 添加索引的遷移
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [...]
    
    operations = [
        migrations.AddIndex(
            model_name='post',
            index=models.Index(fields=['created_at', 'views'], name='post_idx'),
        ),
    ]
"""


# 19. 緩存查詢結果
from django.core.cache import cache

def cached_query():
    """緩存查詢結果"""
    cache_key = 'popular_posts'
    posts = cache.get(cache_key)
    
    if posts is None:
        posts = list(
            Post.objects.select_related('author')
            .filter(views__gt=1000)
            .order_by('-views')[:10]
        )
        cache.set(cache_key, posts, 300)  # 緩存 5 分鐘
    
    return posts
```

## 相關主題

- [Django ORM 深入解析](./django_orm_deep_dive.md)
- [Django 性能優化](./performance_optimization.md)
- [Django REST Framework](./django_rest_framework.md)
