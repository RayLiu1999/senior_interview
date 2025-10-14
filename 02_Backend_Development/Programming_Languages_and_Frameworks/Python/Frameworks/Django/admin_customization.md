# Django Admin 客製化

- **難度**: 6
- **重要性**: 3
- **標籤**: `Admin`, `Customization`

## 問題詳述

Django Admin 是一個自動生成的後台管理界面，通過客製化可以將其打造成功能強大、符合業務需求的管理系統。

## 核心理論與詳解

### Admin 的基本註冊

最簡單的 Admin 註冊方式：

```python
from django.contrib import admin
from .models import Article

# 方式一：簡單註冊
admin.site.register(Article)

# 方式二：使用裝飾器
@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    pass
```

### ModelAdmin 常用選項

#### 列表頁客製化

```python
@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    # 顯示的字段
    list_display = ['title', 'author', 'status', 'created_at', 'view_count']
    
    # 可點擊進入編輯的字段
    list_display_links = ['title']
    
    # 可直接編輯的字段
    list_editable = ['status']
    
    # 過濾器
    list_filter = ['status', 'created_at', 'category']
    
    # 搜索字段
    search_fields = ['title', 'content', 'author__username']
    
    # 排序
    ordering = ['-created_at']
    
    # 每頁顯示數量
    list_per_page = 50
    
    # 日期層級導航
    date_hierarchy = 'created_at'
```

#### 表單頁客製化

```python
@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    # 顯示的字段
    fields = ['title', 'content', 'author', 'status']
    
    # 或使用 fieldsets 分組顯示
    fieldsets = (
        ('基本信息', {
            'fields': ('title', 'content', 'author')
        }),
        ('發布設置', {
            'fields': ('status', 'published_at'),
            'classes': ('collapse',)  # 可折疊
        }),
        ('高級選項', {
            'fields': ('tags', 'seo_keywords'),
            'classes': ('collapse', 'wide')
        })
    )
    
    # 只讀字段
    readonly_fields = ['created_at', 'updated_at', 'view_count']
    
    # 自動填充 slug
    prepopulated_fields = {'slug': ('title',)}
    
    # 原始 ID 字段
    raw_id_fields = ['author']
    
    # 水平過濾器（用於多對多）
    filter_horizontal = ['tags']
    # 或垂直過濾器
    # filter_vertical = ['tags']
```

### 自定義顯示字段

#### 添加計算字段

```python
@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'word_count', 'is_published', 'published_badge']
    
    @admin.display(description='字數統計')
    def word_count(self, obj):
        return len(obj.content.split())
    
    @admin.display(
        description='已發布',
        boolean=True,
        ordering='status'
    )
    def is_published(self, obj):
        return obj.status == 'published'
    
    @admin.display(description='狀態')
    def published_badge(self, obj):
        colors = {
            'draft': 'gray',
            'published': 'green',
            'archived': 'red'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: {};">{}</span>',
            color,
            obj.get_status_display()
        )
```

#### 自定義列顯示

```python
from django.utils.html import format_html
from django.urls import reverse

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'thumbnail_preview', 'view_link']
    
    @admin.display(description='縮略圖')
    def thumbnail_preview(self, obj):
        if obj.cover_image:
            return format_html(
                '<img src="{}" width="50" height="50" />',
                obj.cover_image.url
            )
        return '-'
    
    @admin.display(description='查看')
    def view_link(self, obj):
        url = reverse('article_detail', args=[obj.pk])
        return format_html('<a href="{}" target="_blank">查看</a>', url)
```

### 內聯編輯 (Inline)

用於編輯相關模型：

```python
from django.contrib import admin
from .models import Article, Comment

class CommentInline(admin.TabularInline):  # 或 StackedInline
    model = Comment
    extra = 1  # 額外顯示的空白表單數
    fields = ['author', 'content', 'is_approved']
    readonly_fields = ['created_at']

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    inlines = [CommentInline]
    
    list_display = ['title', 'author', 'comment_count']
    
    @admin.display(description='評論數')
    def comment_count(self, obj):
        return obj.comments.count()
```

### Actions（批量操作）

#### 內建 Actions

Django Admin 默認提供刪除 action，可以自定義：

```python
@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    actions = ['make_published', 'make_draft', 'export_as_csv']
    
    @admin.action(description='標記為已發布')
    def make_published(self, request, queryset):
        updated = queryset.update(status='published')
        self.message_user(
            request,
            f'{updated} 篇文章已標記為已發布'
        )
    
    @admin.action(description='標記為草稿')
    def make_draft(self, request, queryset):
        queryset.update(status='draft')
    
    @admin.action(description='導出為 CSV')
    def export_as_csv(self, request, queryset):
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="articles.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['標題', '作者', '狀態', '創建時間'])
        
        for article in queryset:
            writer.writerow([
                article.title,
                article.author.username,
                article.status,
                article.created_at
            ])
        
        return response
```

### 自定義過濾器

```python
from django.contrib import admin
from django.utils.translation import gettext_lazy as _

class PublishedFilter(admin.SimpleListFilter):
    title = _('發布狀態')
    parameter_name = 'published'
    
    def lookups(self, request, model_admin):
        return (
            ('yes', _('已發布')),
            ('no', _('未發布')),
        )
    
    def queryset(self, request, queryset):
        if self.value() == 'yes':
            return queryset.filter(status='published')
        if self.value() == 'no':
            return queryset.exclude(status='published')

class ViewCountFilter(admin.SimpleListFilter):
    title = _('瀏覽量')
    parameter_name = 'views'
    
    def lookups(self, request, model_admin):
        return (
            ('high', _('高於 1000')),
            ('medium', _('100-1000')),
            ('low', _('低於 100')),
        )
    
    def queryset(self, request, queryset):
        if self.value() == 'high':
            return queryset.filter(view_count__gte=1000)
        if self.value() == 'medium':
            return queryset.filter(view_count__gte=100, view_count__lt=1000)
        if self.value() == 'low':
            return queryset.filter(view_count__lt=100)

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_filter = [PublishedFilter, ViewCountFilter, 'created_at']
```

### 權限控制

```python
@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        # 只有 staff 可以添加
        return request.user.is_staff
    
    def has_change_permission(self, request, obj=None):
        # 作者可以編輯自己的文章
        if obj is not None and obj.author == request.user:
            return True
        return request.user.is_superuser
    
    def has_delete_permission(self, request, obj=None):
        # 只有超級用戶可以刪除
        return request.user.is_superuser
    
    def get_queryset(self, request):
        # 普通用戶只能看到自己的文章
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(author=request.user)
```

### 表單客製化

#### 使用自定義表單

```python
from django import forms
from django.contrib import admin

class ArticleAdminForm(forms.ModelForm):
    class Meta:
        model = Article
        fields = '__all__'
        widgets = {
            'content': forms.Textarea(attrs={'rows': 20}),
        }
    
    def clean_title(self):
        title = self.cleaned_data['title']
        if len(title) < 5:
            raise forms.ValidationError('標題至少需要 5 個字符')
        return title

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    form = ArticleAdminForm
```

#### 動態表單

```python
@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        
        # 根據權限調整字段
        if not request.user.is_superuser:
            form.base_fields['status'].disabled = True
        
        return form
    
    def get_readonly_fields(self, request, obj=None):
        # 編輯時某些字段只讀
        if obj:  # 編輯現有對象
            return ['author', 'created_at']
        return []
    
    def save_model(self, request, obj, form, change):
        # 新建時自動設置作者
        if not change:
            obj.author = request.user
        super().save_model(request, obj, form, change)
```

### 自定義 Admin 視圖

```python
from django.urls import path
from django.shortcuts import render
from django.contrib import admin

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'statistics/',
                self.admin_site.admin_view(self.statistics_view),
                name='article_statistics'
            ),
        ]
        return custom_urls + urls
    
    def statistics_view(self, request):
        context = {
            **self.admin_site.each_context(request),
            'title': '文章統計',
            'total_articles': Article.objects.count(),
            'published': Article.objects.filter(status='published').count(),
            'draft': Article.objects.filter(status='draft').count(),
        }
        return render(request, 'admin/article_statistics.html', context)
```

### Admin 站點客製化

```python
# admin.py
from django.contrib import admin
from django.contrib.admin import AdminSite

class MyAdminSite(AdminSite):
    site_header = '我的管理後台'
    site_title = '後台管理'
    index_title = '歡迎來到管理後台'
    
    def has_permission(self, request):
        # 自定義權限邏輯
        return request.user.is_active and request.user.is_staff

# 創建自定義 admin site
admin_site = MyAdminSite(name='myadmin')

# 註冊模型到自定義 site
admin_site.register(Article, ArticleAdmin)
```

### 性能優化

```python
@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'author_name', 'category_name']
    
    def get_queryset(self, request):
        # 使用 select_related 優化
        qs = super().get_queryset(request)
        return qs.select_related('author', 'category')
    
    @admin.display(description='作者', ordering='author__username')
    def author_name(self, obj):
        return obj.author.username
    
    @admin.display(description='分類', ordering='category__name')
    def category_name(self, obj):
        return obj.category.name
```

## 程式碼範例

```python
# admin.py - 完整示例
from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count
from .models import Article, Category, Tag

class CategoryFilter(admin.SimpleListFilter):
    title = '分類'
    parameter_name = 'category'
    
    def lookups(self, request, model_admin):
        categories = Category.objects.annotate(
            article_count=Count('articles')
        ).filter(article_count__gt=0)
        return [(c.id, f'{c.name} ({c.article_count})') for c in categories]
    
    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(category_id=self.value())

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'author_link',
        'category',
        'status_badge',
        'view_count',
        'created_at'
    ]
    list_display_links = ['title']
    list_filter = [CategoryFilter, 'status', 'created_at']
    search_fields = ['title', 'content', 'author__username']
    list_per_page = 25
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('基本信息', {
            'fields': ('title', 'content', 'author')
        }),
        ('分類與標籤', {
            'fields': ('category', 'tags')
        }),
        ('發布設置', {
            'fields': ('status', 'published_at'),
            'classes': ('collapse',)
        }),
        ('統計信息', {
            'fields': ('view_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ['view_count', 'created_at', 'updated_at']
    filter_horizontal = ['tags']
    actions = ['make_published', 'make_draft']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('author', 'category').prefetch_related('tags')
    
    @admin.display(description='作者', ordering='author__username')
    def author_link(self, obj):
        return format_html(
            '<a href="/admin/auth/user/{}/change/">{}</a>',
            obj.author.id,
            obj.author.username
        )
    
    @admin.display(description='狀態')
    def status_badge(self, obj):
        colors = {
            'draft': '#gray',
            'published': '#28a745',
            'archived': '#dc3545'
        }
        return format_html(
            '<span style="background-color: {}; color: white; '
            'padding: 3px 10px; border-radius: 3px;">{}</span>',
            colors.get(obj.status, '#6c757d'),
            obj.get_status_display()
        )
    
    @admin.action(description='發布選中的文章')
    def make_published(self, request, queryset):
        updated = queryset.update(status='published')
        self.message_user(request, f'成功發布 {updated} 篇文章')
    
    @admin.action(description='設為草稿')
    def make_draft(self, request, queryset):
        updated = queryset.update(status='draft')
        self.message_user(request, f'{updated} 篇文章已設為草稿')
    
    def save_model(self, request, obj, form, change):
        if not change:  # 新建
            obj.author = request.user
        super().save_model(request, obj, form, change)
```

## 總結

Django Admin 通過客製化可以滿足大部分後台管理需求。合理使用 list_display、list_filter、actions 等選項，配合自定義方法和過濾器，可以打造功能強大的管理界面。對於複雜的業務場景，可以通過自定義視圖、表單和權限控制來實現更精細的管理功能。同時要注意性能優化，使用 select_related 和 prefetch_related 減少資料庫查詢。
