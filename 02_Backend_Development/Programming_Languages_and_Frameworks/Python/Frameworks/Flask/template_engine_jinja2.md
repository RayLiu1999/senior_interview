# Flask 模板引擎 (Jinja2)

- **難度**: 5
- **重要性**: 3
- **標籤**: `Jinja2`, `Templates`, `Rendering`

## 問題詳述

解釋 Flask 中 Jinja2 模板引擎的使用，包括模板語法、模板繼承、過濾器、宏以及與後端的數據傳遞。

## 核心理論與詳解

### Jinja2 基礎語法

**變量輸出**
```html
<h1>{{ title }}</h1>
<p>用戶名: {{ user.username }}</p>
<p>{{ items[0] }}</p>
```

**控制結構**
```html
{% if user.is_authenticated %}
    <p>歡迎, {{ user.username }}!</p>
{% else %}
    <p>請登錄</p>
{% endif %}

{% for item in items %}
    <li>{{ item.name }} - {{ item.price }}</li>
{% endfor %}
```

### 模板渲染

```python
from flask import render_template

@app.route('/user/<username>')
def user_profile(username):
    user = User.query.filter_by(username=username).first_or_404()
    return render_template('profile.html', user=user, title='用戶資料')
```

### 模板繼承

**基礎模板 base.html**
```html
<!DOCTYPE html>
<html>
<head>
    <title>{% block title %}默認標題{% endblock %}</title>
</head>
<body>
    <nav>{% block nav %}{% endblock %}</nav>
    
    <main>
        {% block content %}{% endblock %}
    </main>
    
    <footer>{% block footer %}&copy; 2024{% endblock %}</footer>
</body>
</html>
```

**子模板 profile.html**
```html
{% extends "base.html" %}

{% block title %}{{ user.username }} - 用戶資料{% endblock %}

{% block content %}
    <h1>{{ user.username }}</h1>
    <p>{{ user.email }}</p>
{% endblock %}
```

### 過濾器

**內建過濾器**
```html
{{ name|upper }}  <!-- 轉大寫 -->
{{ text|length }}  <!-- 長度 -->
{{ price|round(2) }}  <!-- 四捨五入 -->
{{ date|strftime('%Y-%m-%d') }}  <!-- 日期格式化 -->
{{ html_content|safe }}  <!-- 不轉義 HTML -->
```

**自定義過濾器**
```python
@app.template_filter('datetime')
def format_datetime(value, format='%Y-%m-%d %H:%M'):
    return value.strftime(format)

# 模板中使用
{{ created_at|datetime }}
```

### 宏（Macros）

```html
{% macro render_field(field) %}
    <div class="form-group">
        {{ field.label }}
        {{ field(**kwargs) }}
        {% if field.errors %}
            <ul class="errors">
            {% for error in field.errors %}
                <li>{{ error }}</li>
            {% endfor %}
            </ul>
        {% endif %}
    </div>
{% endmacro %}

<!-- 使用宏 -->
{{ render_field(form.username) }}
{{ render_field(form.email) }}
```

### 包含其他模板

```html
{% include 'header.html' %}

<main>內容</main>

{% include 'footer.html' %}
```

### 上下文處理器

```python
@app.context_processor
def inject_globals():
    return {
        'app_name': 'My App',
        'current_year': datetime.now().year
    }

# 所有模板都可以使用
<footer>&copy; {{ current_year }} {{ app_name }}</footer>
```

### 模板測試

```html
{% if user is defined %}
    {{ user.name }}
{% endif %}

{% if value is none %}
    無數據
{% endif %}
```

### 靜態文件

```html
<link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
<script src="{{ url_for('static', filename='js/app.js') }}"></script>
<img src="{{ url_for('static', filename='images/logo.png') }}">
```

### Flash 消息

```python
from flask import flash

@app.route('/login', methods=['POST'])
def login():
    if valid_login():
        flash('登錄成功!', 'success')
    else:
        flash('登錄失敗', 'error')
```

```html
{% with messages = get_flashed_messages(with_categories=true) %}
  {% if messages %}
    {% for category, message in messages %}
      <div class="alert alert-{{ category }}">{{ message }}</div>
    {% endfor %}
  {% endif %}
{% endwith %}
```

## 關鍵要點

Jinja2 是 Flask 的默認模板引擎，提供變量輸出、控制結構、過濾器、宏等功能。模板繼承機制通過 extends 和 block 實現代碼復用。過濾器用於格式化輸出，支持自定義。宏類似函數，可以封裝可復用的模板片段。上下文處理器可以向所有模板注入全局變量。Flash 消息用於顯示一次性通知。合理使用模板功能可以實現前端代碼的模塊化和維護性。
