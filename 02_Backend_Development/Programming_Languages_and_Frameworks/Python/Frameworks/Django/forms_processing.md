# Django 表單處理

- **難度**: 5
- **重要性**: 4
- **標籤**: `Forms`, `Validation`, `ModelForm`

## 問題詳述

Django 的表單系統提供了一套完整的機制來處理 HTML 表單的生成、數據驗證、清理和錯誤處理，使表單處理變得簡單且安全。

## 核心理論與詳解

### Django 表單的核心組件

Django 表單系統主要包含以下組件：

- **Form 類**：定義表單字段和驗證規則
- **字段 (Fields)**：定義數據類型和基本驗證
- **Widgets**：控制 HTML 渲染方式
- **驗證器 (Validators)**：自定義驗證邏輯
- **清理方法 (Clean Methods)**：數據清理和跨字段驗證

### Form vs ModelForm

#### Form

普通的 Form 類用於不直接對應模型的表單：

```python
from django import forms

class ContactForm(forms.Form):
    name = forms.CharField(max_length=100)
    email = forms.EmailField()
    message = forms.CharField(widget=forms.Textarea)
    
    def clean_email(self):
        email = self.cleaned_data['email']
        if not email.endswith('@example.com'):
            raise forms.ValidationError('必須使用公司郵箱')
        return email
```

#### ModelForm

ModelForm 自動從模型生成表單，減少重複代碼：

```python
from django import forms
from .models import Article

class ArticleForm(forms.ModelForm):
    class Meta:
        model = Article
        fields = ['title', 'content', 'category', 'tags']
        # 或排除特定字段
        # exclude = ['created_at', 'author']
        
        widgets = {
            'content': forms.Textarea(attrs={'rows': 10}),
            'title': forms.TextInput(attrs={'class': 'form-control'})
        }
        
        labels = {
            'title': '文章標題',
            'content': '文章內容'
        }
        
        help_texts = {
            'tags': '多個標籤用逗號分隔'
        }
```

### 表單字段類型

Django 提供了豐富的內建字段類型：

#### 文本字段

- **CharField**: 單行文本
- **EmailField**: 郵箱地址
- **URLField**: URL 地址
- **SlugField**: URL slug
- **TextField**: 多行文本（需要 Textarea widget）

#### 數值字段

- **IntegerField**: 整數
- **FloatField**: 浮點數
- **DecimalField**: 精確小數

#### 選擇字段

- **ChoiceField**: 單選下拉框
- **MultipleChoiceField**: 多選
- **TypedChoiceField**: 帶類型轉換的選擇

#### 日期時間字段

- **DateField**: 日期
- **TimeField**: 時間
- **DateTimeField**: 日期時間

#### 其他字段

- **BooleanField**: 布爾值（必須勾選）
- **NullBooleanField**: 可為空的布爾值
- **FileField**: 文件上傳
- **ImageField**: 圖片上傳

### 表單驗證機制

Django 表單驗證分為三個層級：

#### 1. 字段級驗證

每個字段類型都有內建的驗證規則：

```python
class UserForm(forms.Form):
    username = forms.CharField(
        min_length=3,
        max_length=20,
        required=True
    )
    age = forms.IntegerField(
        min_value=0,
        max_value=150
    )
```

#### 2. 自定義字段驗證

使用 `clean_<fieldname>()` 方法：

```python
class RegistrationForm(forms.Form):
    username = forms.CharField()
    password1 = forms.CharField(widget=forms.PasswordInput)
    password2 = forms.CharField(widget=forms.PasswordInput)
    
    def clean_username(self):
        username = self.cleaned_data['username']
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError('用戶名已存在')
        return username
    
    def clean_password1(self):
        password = self.cleaned_data['password1']
        if len(password) < 8:
            raise forms.ValidationError('密碼至少需要 8 個字符')
        return password
```

#### 3. 跨字段驗證

使用 `clean()` 方法進行跨字段驗證：

```python
class RegistrationForm(forms.Form):
    password1 = forms.CharField(widget=forms.PasswordInput)
    password2 = forms.CharField(widget=forms.PasswordInput)
    
    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError('兩次輸入的密碼不一致')
        
        return cleaned_data
```

### 自定義驗證器

可以創建可重用的驗證器函數：

```python
from django.core.exceptions import ValidationError

def validate_even_number(value):
    if value % 2 != 0:
        raise ValidationError(
            f'{value} 不是偶數',
            params={'value': value}
        )

class MyForm(forms.Form):
    number = forms.IntegerField(validators=[validate_even_number])
```

### Widgets 自定義

Widgets 控制表單字段在 HTML 中的渲染方式：

```python
class ArticleForm(forms.ModelForm):
    class Meta:
        model = Article
        fields = '__all__'
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '請輸入標題'
            }),
            'content': forms.Textarea(attrs={
                'rows': 10,
                'class': 'form-control'
            }),
            'published_date': forms.DateInput(attrs={
                'type': 'date',
                'class': 'form-control'
            }),
            'category': forms.Select(attrs={
                'class': 'form-select'
            })
        }
```

### 表單處理流程

典型的視圖中處理表單的流程：

```python
from django.shortcuts import render, redirect
from .forms import ArticleForm

def create_article(request):
    if request.method == 'POST':
        form = ArticleForm(request.POST, request.FILES)
        if form.is_valid():
            # 方式 1: 直接保存
            article = form.save()
            
            # 方式 2: 保存前修改
            article = form.save(commit=False)
            article.author = request.user
            article.save()
            
            # 方式 3: 處理多對多關係
            article = form.save(commit=False)
            article.author = request.user
            article.save()
            form.save_m2m()  # 保存多對多關係
            
            return redirect('article_detail', pk=article.pk)
    else:
        form = ArticleForm()
    
    return render(request, 'article_form.html', {'form': form})
```

### 表單集 (Formsets)

表單集允許在同一頁面處理多個表單實例：

#### 基本表單集

```python
from django.forms import formset_factory

ArticleFormSet = formset_factory(ArticleForm, extra=3)

def manage_articles(request):
    if request.method == 'POST':
        formset = ArticleFormSet(request.POST)
        if formset.is_valid():
            for form in formset:
                if form.cleaned_data:
                    # 處理每個表單
                    form.save()
    else:
        formset = ArticleFormSet()
    
    return render(request, 'manage_articles.html', {'formset': formset})
```

#### 模型表單集

```python
from django.forms import modelformset_factory

ArticleFormSet = modelformset_factory(
    Article,
    fields=['title', 'content'],
    extra=1,
    can_delete=True
)

def edit_articles(request):
    if request.method == 'POST':
        formset = ArticleFormSet(request.POST)
        if formset.is_valid():
            formset.save()
            return redirect('success')
    else:
        formset = ArticleFormSet(queryset=Article.objects.all())
    
    return render(request, 'edit_articles.html', {'formset': formset})
```

#### 內聯表單集

用於處理一對多關係：

```python
from django.forms import inlineformset_factory

CommentFormSet = inlineformset_factory(
    Article,  # 父模型
    Comment,  # 子模型
    fields=['content', 'author'],
    extra=1,
    can_delete=True
)

def edit_article_with_comments(request, article_id):
    article = get_object_or_404(Article, id=article_id)
    
    if request.method == 'POST':
        formset = CommentFormSet(request.POST, instance=article)
        if formset.is_valid():
            formset.save()
            return redirect('article_detail', pk=article.pk)
    else:
        formset = CommentFormSet(instance=article)
    
    return render(request, 'article_comments.html', {
        'article': article,
        'formset': formset
    })
```

### 表單渲染

#### 自動渲染

Django 提供了多種表單渲染方式：

```django
<!-- 表格形式 -->
<form method="post">
    {% csrf_token %}
    <table>{{ form.as_table }}</table>
    <button type="submit">提交</button>
</form>

<!-- 段落形式 -->
<form method="post">
    {% csrf_token %}
    {{ form.as_p }}
    <button type="submit">提交</button>
</form>

<!-- 列表形式 -->
<form method="post">
    {% csrf_token %}
    {{ form.as_ul }}
    <button type="submit">提交</button>
</form>
```

#### 手動渲染

更靈活的控制：

```django
<form method="post">
    {% csrf_token %}
    
    <!-- 顯示所有錯誤 -->
    {% if form.errors %}
        <div class="alert alert-danger">
            {{ form.errors }}
        </div>
    {% endif %}
    
    <!-- 逐個渲染字段 -->
    <div class="form-group">
        <label for="{{ form.title.id_for_label }}">標題</label>
        {{ form.title }}
        {% if form.title.errors %}
            <span class="text-danger">{{ form.title.errors }}</span>
        {% endif %}
        <small class="form-text">{{ form.title.help_text }}</small>
    </div>
    
    <div class="form-group">
        <label for="{{ form.content.id_for_label }}">內容</label>
        {{ form.content }}
        {% if form.content.errors %}
            <span class="text-danger">{{ form.content.errors }}</span>
        {% endif %}
    </div>
    
    <button type="submit" class="btn btn-primary">提交</button>
</form>
```

### 文件上傳處理

```python
class UploadFileForm(forms.Form):
    title = forms.CharField(max_length=50)
    file = forms.FileField()

def upload_file(request):
    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            handle_uploaded_file(request.FILES['file'])
            return redirect('success')
    else:
        form = UploadFileForm()
    return render(request, 'upload.html', {'form': form})

def handle_uploaded_file(f):
    with open('uploads/' + f.name, 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)
```

### 表單最佳實踐

#### 1. 使用 CSRF 保護

始終包含 CSRF token：

```django
<form method="post">
    {% csrf_token %}
    {{ form.as_p }}
    <button type="submit">提交</button>
</form>
```

#### 2. 適當的錯誤處理

```python
def create_article(request):
    if request.method == 'POST':
        form = ArticleForm(request.POST)
        if form.is_valid():
            try:
                article = form.save()
                messages.success(request, '文章創建成功')
                return redirect('article_detail', pk=article.pk)
            except Exception as e:
                messages.error(request, f'保存失敗: {str(e)}')
        else:
            messages.error(request, '請修正表單錯誤')
    else:
        form = ArticleForm()
    
    return render(request, 'article_form.html', {'form': form})
```

#### 3. 初始值和預填充

```python
# 提供初始值
form = ArticleForm(initial={
    'title': '默認標題',
    'category': default_category
})

# 編輯現有對象
article = get_object_or_404(Article, pk=pk)
form = ArticleForm(request.POST or None, instance=article)
```

#### 4. 動態表單

```python
class DynamicArticleForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        
        # 根據用戶權限動態調整字段
        if not user.is_staff:
            self.fields['status'].widget = forms.HiddenInput()
        
        # 動態設置查詢集
        self.fields['category'].queryset = Category.objects.filter(
            is_active=True
        )

# 使用
form = DynamicArticleForm(request.POST, user=request.user)
```

## 程式碼範例

```python
# forms.py
from django import forms
from django.core.exceptions import ValidationError
from .models import Article, Category

class ArticleForm(forms.ModelForm):
    """文章表單完整示例"""
    
    # 額外字段（不在模型中）
    agree_terms = forms.BooleanField(
        required=True,
        label='我同意服務條款'
    )
    
    class Meta:
        model = Article
        fields = ['title', 'content', 'category', 'tags', 'cover_image']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '輸入文章標題',
                'maxlength': 200
            }),
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 15
            }),
            'category': forms.Select(attrs={
                'class': 'form-select'
            }),
            'tags': forms.CheckboxSelectMultiple(),
        }
        labels = {
            'title': '文章標題',
            'content': '文章內容',
            'category': '分類',
            'tags': '標籤',
            'cover_image': '封面圖片'
        }
    
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        
        # 只顯示活躍的分類
        self.fields['category'].queryset = Category.objects.filter(
            is_active=True
        )
        
        # 設置必填字段標記
        self.fields['title'].required = True
        self.fields['content'].required = True
    
    def clean_title(self):
        """驗證標題"""
        title = self.cleaned_data['title']
        
        # 檢查標題長度
        if len(title) < 5:
            raise ValidationError('標題至少需要 5 個字符')
        
        # 檢查重複標題
        qs = Article.objects.filter(title=title)
        if self.instance.pk:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise ValidationError('該標題已存在')
        
        return title
    
    def clean_cover_image(self):
        """驗證圖片"""
        image = self.cleaned_data.get('cover_image')
        if image:
            # 檢查文件大小（5MB）
            if image.size > 5 * 1024 * 1024:
                raise ValidationError('圖片大小不能超過 5MB')
            
            # 檢查圖片格式
            if not image.content_type in ['image/jpeg', 'image/png']:
                raise ValidationError('只支持 JPG 和 PNG 格式')
        
        return image
    
    def clean(self):
        """跨字段驗證"""
        cleaned_data = super().clean()
        content = cleaned_data.get('content')
        
        # 確保內容不為空
        if content and len(content.strip()) < 10:
            raise ValidationError('文章內容至少需要 10 個字符')
        
        return cleaned_data
    
    def save(self, commit=True):
        """自定義保存邏輯"""
        article = super().save(commit=False)
        
        # 設置作者
        if self.user:
            article.author = self.user
        
        if commit:
            article.save()
            self.save_m2m()
        
        return article

# views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import ArticleForm
from .models import Article

@login_required
def create_article(request):
    """創建文章"""
    if request.method == 'POST':
        form = ArticleForm(request.POST, request.FILES, user=request.user)
        if form.is_valid():
            article = form.save()
            messages.success(request, '文章創建成功！')
            return redirect('article_detail', pk=article.pk)
        else:
            messages.error(request, '請修正表單中的錯誤')
    else:
        form = ArticleForm(user=request.user)
    
    return render(request, 'articles/form.html', {'form': form})

@login_required
def update_article(request, pk):
    """更新文章"""
    article = get_object_or_404(Article, pk=pk)
    
    # 權限檢查
    if article.author != request.user:
        messages.error(request, '您沒有權限編輯這篇文章')
        return redirect('article_detail', pk=pk)
    
    if request.method == 'POST':
        form = ArticleForm(
            request.POST,
            request.FILES,
            instance=article,
            user=request.user
        )
        if form.is_valid():
            article = form.save()
            messages.success(request, '文章更新成功！')
            return redirect('article_detail', pk=article.pk)
    else:
        form = ArticleForm(instance=article, user=request.user)
    
    return render(request, 'articles/form.html', {
        'form': form,
        'article': article
    })
```

## 總結

Django 表單系統提供了完整的表單處理解決方案，包括數據驗證、錯誤處理、HTML 渲染等。ModelForm 能夠自動從模型生成表單，大大減少了重複代碼。合理使用表單驗證、自定義 widgets 和表單集，可以構建出功能強大且用戶友好的表單界面。在實際開發中，應該注重安全性（CSRF 保護）、用戶體驗（錯誤提示）和代碼可維護性（表單重用）。
