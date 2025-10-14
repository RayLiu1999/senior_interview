# Django 測試策略

- **難度**: 7
- **重要性**: 4
- **標籤**: `Testing`, `Test Client`, `Fixtures`

## 問題詳述

Django 提供了完整的測試框架，支持單元測試、集成測試和功能測試，確保代碼質量和業務邏輯的正確性。

## 核心理論與詳解

### Django 測試框架基礎

Django 測試基於 Python 的 `unittest` 模塊，提供了額外的測試工具和資料庫處理。

#### 基本測試類

```python
from django.test import TestCase, TransactionTestCase, SimpleTestCase

# 最常用，提供資料庫回滾
class ArticleTestCase(TestCase):
    def test_create_article(self):
        article = Article.objects.create(title='Test')
        self.assertEqual(article.title, 'Test')

# 需要真實事務時使用
class TransactionTest(TransactionTestCase):
    pass

# 不需要資料庫時使用（更快）
class UtilTest(SimpleTestCase):
    def test_utility_function(self):
        result = my_utility_function()
        self.assertTrue(result)
```

### 測試執行

```bash
# 執行所有測試
python manage.py test

# 執行特定 app 的測試
python manage.py test myapp

# 執行特定測試類
python manage.py test myapp.tests.ArticleTestCase

# 執行特定測試方法
python manage.py test myapp.tests.ArticleTestCase.test_create_article

# 保留測試資料庫
python manage.py test --keepdb

# 並行測試
python manage.py test --parallel
```

### 模型測試

#### 測試模型方法

```python
from django.test import TestCase
from .models import Article

class ArticleModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        """在整個測試類開始時執行一次"""
        cls.article = Article.objects.create(
            title='Test Article',
            content='Test content',
            status='draft'
        )
    
    def test_article_str(self):
        """測試 __str__ 方法"""
        self.assertEqual(str(self.article), 'Test Article')
    
    def test_get_absolute_url(self):
        """測試 URL 生成"""
        expected_url = f'/articles/{self.article.slug}/'
        self.assertEqual(self.article.get_absolute_url(), expected_url)
    
    def test_is_published(self):
        """測試發布狀態"""
        self.assertFalse(self.article.is_published())
        
        self.article.status = 'published'
        self.article.save()
        self.assertTrue(self.article.is_published())
    
    def test_word_count(self):
        """測試字數統計"""
        word_count = self.article.get_word_count()
        self.assertEqual(word_count, 2)
```

#### 測試模型驗證

```python
from django.core.exceptions import ValidationError

class ArticleValidationTest(TestCase):
    def test_title_max_length(self):
        """測試標題最大長度"""
        article = Article(title='x' * 201, content='test')
        with self.assertRaises(ValidationError):
            article.full_clean()
    
    def test_unique_slug(self):
        """測試 slug 唯一性"""
        Article.objects.create(title='Test', slug='test')
        article = Article(title='Test 2', slug='test')
        with self.assertRaises(ValidationError):
            article.full_clean()
```

### 視圖測試

#### 使用 Client 測試視圖

```python
from django.test import TestCase, Client
from django.urls import reverse

class ArticleViewTest(TestCase):
    def setUp(self):
        """每個測試方法執行前都會執行"""
        self.client = Client()
        self.article = Article.objects.create(
            title='Test Article',
            content='Test content',
            status='published'
        )
    
    def test_list_view_status_code(self):
        """測試列表頁狀態碼"""
        response = self.client.get(reverse('article_list'))
        self.assertEqual(response.status_code, 200)
    
    def test_detail_view(self):
        """測試詳情頁"""
        url = reverse('article_detail', kwargs={'pk': self.article.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.article.title)
        self.assertTemplateUsed(response, 'article_detail.html')
    
    def test_create_view_post(self):
        """測試創建文章"""
        data = {
            'title': 'New Article',
            'content': 'New content',
            'status': 'draft'
        }
        response = self.client.post(reverse('article_create'), data)
        
        self.assertEqual(response.status_code, 302)  # 重定向
        self.assertEqual(Article.objects.count(), 2)
        
        new_article = Article.objects.latest('created_at')
        self.assertEqual(new_article.title, 'New Article')
```

#### 測試認證視圖

```python
from django.contrib.auth.models import User

class AuthenticatedViewTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client = Client()
    
    def test_login_required(self):
        """測試需要登錄的視圖"""
        url = reverse('article_create')
        response = self.client.get(url)
        
        # 未登錄應重定向到登錄頁
        self.assertEqual(response.status_code, 302)
        self.assertIn('/login/', response.url)
    
    def test_logged_in_view(self):
        """測試登錄後的視圖"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('article_create'))
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['user'].username, 'testuser')
    
    def test_force_login(self):
        """使用 force_login 跳過認證"""
        self.client.force_login(self.user)
        response = self.client.get(reverse('article_create'))
        self.assertEqual(response.status_code, 200)
```

### 表單測試

```python
from .forms import ArticleForm

class ArticleFormTest(TestCase):
    def test_valid_form(self):
        """測試有效表單"""
        data = {
            'title': 'Test Article',
            'content': 'Test content',
            'status': 'draft'
        }
        form = ArticleForm(data=data)
        self.assertTrue(form.is_valid())
    
    def test_invalid_form(self):
        """測試無效表單"""
        data = {'title': '', 'content': 'Test'}
        form = ArticleForm(data=data)
        self.assertFalse(form.is_valid())
        self.assertIn('title', form.errors)
    
    def test_form_save(self):
        """測試表單保存"""
        data = {
            'title': 'Test Article',
            'content': 'Test content',
            'status': 'draft'
        }
        form = ArticleForm(data=data)
        self.assertTrue(form.is_valid())
        
        article = form.save()
        self.assertEqual(article.title, 'Test Article')
        self.assertEqual(Article.objects.count(), 1)
```

### API 測試

```python
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

class ArticleAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.article = Article.objects.create(
            title='Test Article',
            content='Test content',
            author=self.user
        )
    
    def test_list_articles(self):
        """測試列表 API"""
        response = self.client.get('/api/articles/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_create_article_authenticated(self):
        """測試創建文章（需認證）"""
        self.client.force_authenticate(user=self.user)
        data = {'title': 'New Article', 'content': 'New content'}
        response = self.client.post('/api/articles/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Article.objects.count(), 2)
    
    def test_create_article_unauthenticated(self):
        """測試未認證創建文章"""
        data = {'title': 'New Article', 'content': 'New content'}
        response = self.client.post('/api/articles/', data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
```

### 使用 Fixtures

#### 創建 Fixtures

```python
# 從資料庫導出
python manage.py dumpdata myapp.Article --indent 2 > myapp/fixtures/articles.json
```

#### 使用 Fixtures

```python
class ArticleWithFixturesTest(TestCase):
    fixtures = ['articles.json', 'users.json']
    
    def test_with_fixtures(self):
        article = Article.objects.get(pk=1)
        self.assertEqual(article.title, 'Expected Title')
```

### 使用 Factory Pattern

使用 `factory_boy` 創建測試數據：

```python
import factory
from .models import Article

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
    
    username = factory.Sequence(lambda n: f'user{n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.username}@example.com')

class ArticleFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Article
    
    title = factory.Sequence(lambda n: f'Article {n}')
    content = factory.Faker('paragraph')
    author = factory.SubFactory(UserFactory)
    status = 'published'

# 使用
class ArticleFactoryTest(TestCase):
    def test_with_factory(self):
        article = ArticleFactory.create()
        self.assertIsNotNone(article.author)
        
        # 批量創建
        articles = ArticleFactory.create_batch(10)
        self.assertEqual(len(articles), 10)
```

### Mock 和 Patch

```python
from unittest.mock import patch, Mock
from django.test import TestCase

class ExternalServiceTest(TestCase):
    @patch('myapp.services.external_api_call')
    def test_with_mock(self, mock_api):
        """Mock 外部 API 調用"""
        mock_api.return_value = {'status': 'success'}
        
        result = my_function_that_calls_api()
        
        mock_api.assert_called_once()
        self.assertEqual(result['status'], 'success')
    
    def test_with_context_manager(self):
        """使用 context manager mock"""
        with patch('myapp.services.send_email') as mock_email:
            send_notification(user_id=1)
            mock_email.assert_called_with('test@example.com', 'Subject', 'Body')
```

### 測試覆蓋率

```bash
# 安裝 coverage
pip install coverage

# 運行測試並生成覆蓋率報告
coverage run --source='.' manage.py test
coverage report

# 生成 HTML 報告
coverage html
```

### 測試最佳實踐

#### 1. 使用 setUpTestData 優化性能

```python
class OptimizedTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        """只執行一次，所有測試方法共享數據"""
        cls.user = User.objects.create_user('testuser', 'test@test.com')
        cls.articles = ArticleFactory.create_batch(10)
    
    def setUp(self):
        """每個測試方法執行前都執行"""
        self.client = Client()
```

#### 2. 測試應該獨立

```python
# 好的做法 - 每個測試獨立
class GoodTest(TestCase):
    def test_one(self):
        article = Article.objects.create(title='Test')
        self.assertEqual(Article.objects.count(), 1)
    
    def test_two(self):
        # 不依賴 test_one 的結果
        article = Article.objects.create(title='Test 2')
        self.assertEqual(Article.objects.count(), 1)

# 不好的做法 - 測試有依賴
class BadTest(TestCase):
    def test_one(self):
        self.article = Article.objects.create(title='Test')
    
    def test_two(self):
        # 依賴 test_one，如果 test_one 失敗會影響此測試
        self.article.title = 'Updated'
```

#### 3. 測試命名清晰

```python
class ArticleTest(TestCase):
    def test_create_article_with_valid_data_should_succeed(self):
        """清晰的測試名稱說明測試目的"""
        pass
    
    def test_create_article_without_title_should_raise_validation_error(self):
        pass
```

#### 4. 使用 Arrange-Act-Assert 模式

```python
def test_article_publish(self):
    # Arrange - 準備測試數據
    article = Article.objects.create(title='Test', status='draft')
    
    # Act - 執行操作
    article.publish()
    
    # Assert - 驗證結果
    self.assertEqual(article.status, 'published')
    self.assertIsNotNone(article.published_at)
```

## 程式碼範例

```python
# tests.py - 完整測試示例
from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from unittest.mock import patch
import factory

from .models import Article, Category
from .forms import ArticleForm

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
    
    username = factory.Sequence(lambda n: f'user{n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.username}@example.com')

class CategoryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Category
    
    name = factory.Sequence(lambda n: f'Category {n}')

class ArticleFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Article
    
    title = factory.Sequence(lambda n: f'Article {n}')
    content = factory.Faker('paragraph')
    author = factory.SubFactory(UserFactory)
    category = factory.SubFactory(CategoryFactory)

class ArticleModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = UserFactory.create()
        cls.category = CategoryFactory.create()
    
    def test_create_article(self):
        article = Article.objects.create(
            title='Test Article',
            content='Test content',
            author=self.user,
            category=self.category
        )
        self.assertEqual(Article.objects.count(), 1)
        self.assertEqual(article.title, 'Test Article')
    
    def test_article_str(self):
        article = ArticleFactory.create(title='My Article')
        self.assertEqual(str(article), 'My Article')
    
    def test_published_manager(self):
        ArticleFactory.create_batch(3, status='published')
        ArticleFactory.create_batch(2, status='draft')
        
        published = Article.published.all()
        self.assertEqual(published.count(), 3)

class ArticleViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = UserFactory.create()
        self.articles = ArticleFactory.create_batch(5, status='published')
    
    def test_list_view(self):
        response = self.client.get(reverse('article_list'))
        
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'article_list.html')
        self.assertEqual(len(response.context['object_list']), 5)
    
    def test_detail_view(self):
        article = self.articles[0]
        response = self.client.get(
            reverse('article_detail', kwargs={'pk': article.pk})
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, article.title)
    
    def test_create_view_requires_login(self):
        response = self.client.get(reverse('article_create'))
        self.assertEqual(response.status_code, 302)
    
    def test_create_view_with_login(self):
        self.client.force_login(self.user)
        data = {
            'title': 'New Article',
            'content': 'New content',
            'category': CategoryFactory.create().id
        }
        response = self.client.post(reverse('article_create'), data)
        
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Article.objects.count(), 6)

class ArticleFormTest(TestCase):
    def test_valid_form(self):
        category = CategoryFactory.create()
        data = {
            'title': 'Test Article',
            'content': 'Test content',
            'category': category.id
        }
        form = ArticleForm(data=data)
        self.assertTrue(form.is_valid())
    
    def test_missing_required_field(self):
        form = ArticleForm(data={'content': 'Test'})
        self.assertFalse(form.is_valid())
        self.assertIn('title', form.errors)

@patch('myapp.tasks.send_notification_email.delay')
class ArticleSignalTest(TestCase):
    def test_article_created_sends_email(self, mock_task):
        user = UserFactory.create()
        article = ArticleFactory.create(author=user)
        
        mock_task.assert_called_once()
```

## 總結

Django 測試是確保代碼質量的重要環節。通過編寫全面的測試，包括模型測試、視圖測試、表單測試和 API 測試，可以在開發階段發現問題，並在重構時確保功能不被破壞。使用 Factory 模式、Mock 和測試覆蓋率工具可以提高測試的效率和質量。遵循測試最佳實踐，保持測試獨立、清晰和快速執行，是構建可維護系統的基礎。
