# Django 遷移 (Migrations)

- **難度**: 6
- **重要性**: 4
- **標籤**: `Migrations`, `Schema`, `Database`

## 問題詳述

Django Migrations 是一個版本控制系統，用於管理資料庫架構的變更，讓團隊成員能夠同步資料庫結構，並在不同環境間保持一致性。

## 核心理論與詳解

### Migrations 的工作原理

Django Migrations 通過以下機制工作：

1. **檢測模型變更**：比較當前模型與上次遷移的差異
2. **生成遷移文件**：將變更轉換為 Python 代碼
3. **應用遷移**：執行遷移文件中的操作，更新資料庫架構
4. **記錄狀態**：在 `django_migrations` 表中記錄已應用的遷移

### 基本遷移命令

#### makemigrations

創建新的遷移文件：

```bash
# 為所有 app 創建遷移
python manage.py makemigrations

# 為特定 app 創建遷移
python manage.py makemigrations myapp

# 為遷移命名
python manage.py makemigrations --name add_user_profile myapp

# 創建空遷移（用於數據遷移）
python manage.py makemigrations --empty myapp

# 檢查但不創建遷移
python manage.py makemigrations --dry-run
```

#### migrate

應用遷移到資料庫：

```bash
# 應用所有未應用的遷移
python manage.py migrate

# 應用特定 app 的遷移
python manage.py migrate myapp

# 遷移到特定版本
python manage.py migrate myapp 0003

# 撤銷所有遷移
python manage.py migrate myapp zero

# 查看 SQL 但不執行
python manage.py migrate --plan
python manage.py sqlmigrate myapp 0001
```

#### showmigrations

查看遷移狀態：

```bash
# 列出所有遷移
python manage.py showmigrations

# 列出特定 app 的遷移
python manage.py showmigrations myapp

# 以列表形式顯示
python manage.py showmigrations --list

# 以計劃形式顯示
python manage.py showmigrations --plan
```

### 遷移文件結構

典型的遷移文件結構：

```python
# migrations/0001_initial.py
from django.db import migrations, models

class Migration(migrations.Migration):
    # 初始遷移
    initial = True
    
    # 依賴項
    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]
    
    # 操作列表
    operations = [
        migrations.CreateModel(
            name='Article',
            fields=[
                ('id', models.BigAutoField(primary_key=True)),
                ('title', models.CharField(max_length=200)),
                ('content', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
```

### 常見的遷移操作

#### CreateModel

創建新模型：

```python
migrations.CreateModel(
    name='Category',
    fields=[
        ('id', models.BigAutoField(primary_key=True)),
        ('name', models.CharField(max_length=100)),
        ('slug', models.SlugField(unique=True)),
    ],
    options={
        'verbose_name': '分類',
        'verbose_name_plural': '分類',
        'ordering': ['name'],
    },
)
```

#### DeleteModel

刪除模型：

```python
migrations.DeleteModel(name='OldModel')
```

#### AddField

添加字段：

```python
migrations.AddField(
    model_name='article',
    name='view_count',
    field=models.IntegerField(default=0),
)
```

#### RemoveField

移除字段：

```python
migrations.RemoveField(
    model_name='article',
    name='old_field',
)
```

#### AlterField

修改字段：

```python
migrations.AlterField(
    model_name='article',
    name='title',
    field=models.CharField(max_length=300),  # 從 200 改為 300
)
```

#### RenameField

重命名字段：

```python
migrations.RenameField(
    model_name='article',
    old_name='pub_date',
    new_name='published_at',
)
```

#### RenameModel

重命名模型：

```python
migrations.RenameModel(
    old_name='Post',
    new_name='Article',
)
```

### 數據遷移 (Data Migrations)

用於遷移數據而非架構：

#### 創建數據遷移

```bash
python manage.py makemigrations --empty myapp --name populate_default_categories
```

#### 實現數據遷移

```python
# migrations/0004_populate_default_categories.py
from django.db import migrations

def create_default_categories(apps, schema_editor):
    """創建默認分類"""
    Category = apps.get_model('myapp', 'Category')
    db_alias = schema_editor.connection.alias
    
    categories = [
        {'name': '科技', 'slug': 'tech'},
        {'name': '生活', 'slug': 'life'},
        {'name': '娛樂', 'slug': 'entertainment'},
    ]
    
    Category.objects.using(db_alias).bulk_create([
        Category(**cat) for cat in categories
    ])

def remove_default_categories(apps, schema_editor):
    """回滾操作"""
    Category = apps.get_model('myapp', 'Category')
    db_alias = schema_editor.connection.alias
    
    Category.objects.using(db_alias).filter(
        slug__in=['tech', 'life', 'entertainment']
    ).delete()

class Migration(migrations.Migration):
    dependencies = [
        ('myapp', '0003_create_category'),
    ]
    
    operations = [
        migrations.RunPython(
            create_default_categories,
            reverse_code=remove_default_categories
        ),
    ]
```

### 執行原始 SQL

當 Django ORM 無法滿足需求時：

```python
migrations.RunSQL(
    # 前向 SQL
    sql="CREATE INDEX idx_title_created ON myapp_article(title, created_at)",
    # 回滾 SQL
    reverse_sql="DROP INDEX idx_title_created",
)

# 或使用參數化
migrations.RunSQL(
    sql=[
        ("INSERT INTO myapp_category (name, slug) VALUES (%s, %s)", ['Tech', 'tech']),
        ("INSERT INTO myapp_category (name, slug) VALUES (%s, %s)", ['Life', 'life']),
    ],
)
```

### 處理依賴關係

#### 顯式依賴

```python
class Migration(migrations.Migration):
    dependencies = [
        ('myapp', '0001_initial'),
        ('auth', '0012_alter_user_first_name_max_length'),
        ('contenttypes', '0002_remove_content_type_name'),
    ]
```

#### 跨 App 依賴

```python
class Migration(migrations.Migration):
    dependencies = [
        ('blog', '0003_add_category'),
    ]
    
    operations = [
        migrations.AddField(
            model_name='article',
            name='blog_category',
            field=models.ForeignKey(
                'blog.Category',
                on_delete=models.CASCADE
            ),
        ),
    ]
```

### 處理合併衝突

當多個分支都創建了遷移時：

```bash
# Django 會檢測到衝突
python manage.py makemigrations
# CommandError: Conflicting migrations detected

# 解決方案：創建合併遷移
python manage.py makemigrations --merge
```

合併遷移文件示例：

```python
class Migration(migrations.Migration):
    dependencies = [
        ('myapp', '0004_branch_a'),
        ('myapp', '0004_branch_b'),
    ]
    
    operations = [
        # 通常為空，只是標記合併點
    ]
```

### 處理不可逆遷移

某些操作是不可逆的：

```python
class Migration(migrations.Migration):
    operations = [
        migrations.RunPython(
            code=forwards_func,
            reverse_code=migrations.RunPython.noop,  # 無法回滾
        ),
        
        # 或明確禁止回滾
        migrations.RunSQL(
            sql="DROP TABLE old_table",
            reverse_sql=None,  # 不可逆
        ),
    ]
```

### 處理大表遷移

對於生產環境的大表，需要特別小心：

#### 1. 分階段遷移

```python
# 階段 1: 添加新字段（允許 NULL）
class Migration(migrations.Migration):
    operations = [
        migrations.AddField(
            model_name='article',
            name='new_field',
            field=models.CharField(max_length=100, null=True),
        ),
    ]

# 階段 2: 填充數據（數據遷移）
class Migration(migrations.Migration):
    operations = [
        migrations.RunPython(populate_new_field),
    ]

# 階段 3: 設為 NOT NULL
class Migration(migrations.Migration):
    operations = [
        migrations.AlterField(
            model_name='article',
            name='new_field',
            field=models.CharField(max_length=100),
        ),
    ]
```

#### 2. 使用原始 SQL 優化

```python
migrations.RunSQL(
    # 在 PostgreSQL 中使用 CONCURRENTLY 避免鎖表
    sql="CREATE INDEX CONCURRENTLY idx_article_title ON myapp_article(title)",
    reverse_sql="DROP INDEX CONCURRENTLY idx_article_title",
)
```

### 遷移的最佳實踐

#### 1. 總是審查自動生成的遷移

```bash
# 生成後檢查遷移文件
python manage.py makemigrations
# 查看 migrations/ 目錄中的新文件

# 查看將執行的 SQL
python manage.py sqlmigrate myapp 0005
```

#### 2. 保持遷移簡單

每個遷移應該只做一件事，便於回滾和調試。

#### 3. 測試遷移

```python
from django.test import TestCase
from django.core.management import call_command

class MigrationTest(TestCase):
    def test_migration_0005(self):
        # 遷移到上一個版本
        call_command('migrate', 'myapp', '0004')
        
        # 應用測試的遷移
        call_command('migrate', 'myapp', '0005')
        
        # 驗證結果
        # ...
        
        # 測試回滾
        call_command('migrate', 'myapp', '0004')
```

#### 4. 不要修改已應用的遷移

一旦遷移已經應用到生產環境，不要修改它。應該創建新的遷移來修正問題。

#### 5. 使用 squash 壓縮遷移

當遷移文件過多時：

```bash
python manage.py squashmigrations myapp 0001 0010
```

#### 6. 備份數據

在生產環境應用遷移前，總是先備份數據：

```bash
# PostgreSQL
pg_dump mydb > backup.sql

# MySQL
mysqldump mydb > backup.sql

# 然後應用遷移
python manage.py migrate
```

### 常見問題與解決方案

#### 1. 遷移衝突

```bash
# 檢測到衝突
python manage.py makemigrations
# Conflicting migrations detected

# 解決方案
python manage.py makemigrations --merge
```

#### 2. 假遷移（fake migration）

當手動修改了資料庫但需要記錄遷移時：

```bash
# 標記遷移為已應用但不執行
python manage.py migrate --fake myapp 0005

# 重置遷移記錄
python manage.py migrate --fake-initial
```

#### 3. 循環依賴

避免創建循環依賴，使用字符串引用模型：

```python
# 好的做法
field = models.ForeignKey('auth.User', on_delete=models.CASCADE)

# 而不是
from django.contrib.auth.models import User
field = models.ForeignKey(User, on_delete=models.CASCADE)
```

## 程式碼範例

```python
# migrations/0006_complex_migration.py
from django.db import migrations, models
import django.db.models.deletion

def migrate_data_forward(apps, schema_editor):
    """數據遷移：將舊字段數據遷移到新字段"""
    Article = apps.get_model('blog', 'Article')
    db_alias = schema_editor.connection.alias
    
    for article in Article.objects.using(db_alias).all():
        # 轉換數據
        article.new_status = convert_status(article.old_status)
        article.save(update_fields=['new_status'])

def migrate_data_backward(apps, schema_editor):
    """回滾數據遷移"""
    Article = apps.get_model('blog', 'Article')
    db_alias = schema_editor.connection.alias
    
    for article in Article.objects.using(db_alias).all():
        article.old_status = reverse_convert_status(article.new_status)
        article.save(update_fields=['old_status'])

def convert_status(old_status):
    """狀態轉換邏輯"""
    mapping = {
        0: 'draft',
        1: 'published',
        2: 'archived',
    }
    return mapping.get(old_status, 'draft')

def reverse_convert_status(new_status):
    """反向轉換"""
    mapping = {
        'draft': 0,
        'published': 1,
        'archived': 2,
    }
    return mapping.get(new_status, 0)

class Migration(migrations.Migration):
    dependencies = [
        ('blog', '0005_previous_migration'),
    ]
    
    operations = [
        # 1. 添加新字段
        migrations.AddField(
            model_name='article',
            name='new_status',
            field=models.CharField(
                max_length=20,
                choices=[
                    ('draft', 'Draft'),
                    ('published', 'Published'),
                    ('archived', 'Archived'),
                ],
                default='draft',
            ),
        ),
        
        # 2. 遷移數據
        migrations.RunPython(
            migrate_data_forward,
            reverse_code=migrate_data_backward
        ),
        
        # 3. 創建索引
        migrations.RunSQL(
            sql="CREATE INDEX idx_article_new_status ON blog_article(new_status)",
            reverse_sql="DROP INDEX idx_article_new_status",
        ),
        
        # 4. 移除舊字段（在確認無誤後）
        # migrations.RemoveField(
        #     model_name='article',
        #     name='old_status',
        # ),
    ]
```

## 總結

Django Migrations 是管理資料庫架構變更的強大工具。理解遷移的工作原理、掌握常見操作、學會處理複雜場景（如數據遷移、大表遷移、依賴關係）對於維護健康的資料庫架構至關重要。在生產環境中應用遷移時，務必做好備份、測試和監控，並遵循最佳實踐以避免常見問題。
