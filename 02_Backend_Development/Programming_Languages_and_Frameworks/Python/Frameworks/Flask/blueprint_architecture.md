# Flask Blueprint 架構

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Blueprint`, `Modular`, `Architecture`, `Scalability`

## 問題詳述

深入探討 Flask Blueprint 的設計理念、使用方法、模塊化架構的最佳實踐，以及如何使用 Blueprint 構建大型、可維護的 Flask 應用。

## 核心理論與詳解

### Blueprint 的核心概念

**Blueprint（藍圖）** 是 Flask 提供的模塊化機制，用於組織大型應用。它像是應用的"子應用"，可以定義路由、錯誤處理器、模板和靜態文件，然後註冊到主應用中。Blueprint 使代碼結構更清晰，便於團隊協作和代碼重用。

**設計動機**：隨著應用規模增長，將所有路由定義在單一文件中變得難以維護。Blueprint 允許按功能模塊劃分應用，每個模塊獨立開發和測試，最後組合成完整應用。

**與子應用的區別**：Blueprint 不是獨立的 Flask 應用，它必須註冊到實際的應用實例才能工作。一個應用可以註冊多個 Blueprint，一個 Blueprint 也可以註冊到多個應用。

### 創建 Blueprint

**基本定義**：使用 `Blueprint()` 構造函數創建藍圖實例。第一個參數是藍圖名稱（用於反向 URL 構建），第二個參數是導入名稱（通常是 `__name__`）。

**參數選項**：
- `url_prefix`：為藍圖的所有路由添加URL 前綴
- `template_folder`：指定藍圖專用的模板目錄
- `static_folder`：指定藍圖專用的靜態文件目錄
- `static_url_path`：靜態文件的 URL 路徑
- `subdomain`：為藍圖綁定子域名

**目錄結構**：通常將相關的 Blueprint 組織在獨立的包或模塊中，包含路由、表單、模型等相關代碼。

### 註冊 Blueprint

**app.register_blueprint()**：將藍圖註冊到應用實例。可以在註冊時覆蓋藍圖定義時的某些參數，如 `url_prefix`。

**註冊順序**：藍圖按註冊順序處理請求。如果多個藍圖有重疊的路由，先註冊的優先。

**多次註冊**：同一個藍圖可以以不同的配置多次註冊，實現代碼重用。例如，同一套管理頁面用於不同的資源。

### URL 前綴

**url_prefix 參數**：為藍圖的所有路由添加統一前綴，如 `/api`、`/admin`。這使 URL 結構更清晰，便於版本控制和模塊劃分。

**嵌套前綴**：如果在定義藍圖時設置了 `url_prefix`，在註冊時也可以再次設置，兩者會疊加。

**動態前綴**：url_prefix 支持變量，如 `/<lang>`，實現國際化路由。

### URL 構建與命名空間

**endpoint 命名**：藍圖的端點名稱會自動加上藍圖名稱作為前綴，格式為 `blueprint_name.view_function_name`。

**url_for() 使用**：在藍圖內部調用 `url_for('.view_name')` 時，點號前綴表示當前藍圖。跨藍圖引用需要使用完整端點名 `url_for('other_blueprint.view_name')`。

**命名空間優勢**：端點命名空間避免了不同藍圖間的命名衝突，使大型應用中的 URL 管理更加清晰。

### 藍圖資源

**模板目錄**：藍圖可以有自己的 `templates` 目錄。Flask 的模板查找順序是：應用 templates 目錄 → 藍圖 templates 目錄（按註冊順序）。

**靜態文件**：藍圖可以有自己的 `static` 目錄。訪問藍圖靜態文件使用 `url_for('blueprint_name.static', filename='...')`。

**資源優先級**：應用級資源優先於藍圖資源。如果應用和藍圖有同名模板，使用應用的版本。

### 藍圖中的請求處理

**before_request**：使用 `@bp.before_request` 註冊只在藍圖的請求前執行的函數。用於藍圖級別的認證、日誌等。

**after_request**：類似地，`@bp.after_request` 註冊藍圖的請求後處理函數。

**teardown_request**：`@bp.teardown_request` 在請求結束時執行，即使發生異常也會執行。

**作用範圍**：這些鉤子只影響訪問藍圖路由的請求，不影響其他藍圖或應用級路由。

### 錯誤處理

**errorhandler 裝飾器**：藍圖可以註冊自己的錯誤處理器，如 `@bp.errorhandler(404)`。

**app_errorhandler**：使用 `@bp.app_errorhandler()` 註冊應用級錯誤處理器。這個處理器對整個應用生效，不僅限於藍圖。

**錯誤處理優先級**：藍圖的錯誤處理器優先於應用級處理器。

### 應用上下文與藍圖

**current_app**：在藍圖中可以使用 `current_app` 訪問當前應用實例，獲取配置或其他應用級資源。

**g 對象**：請求級的全局變量 `g` 在藍圖中同樣可用，用於存儲請求生命週期內的數據。

**session**：會話對象在所有藍圖間共享，不區分藍圖。

### 藍圖工廠模式

**動態創建**：可以編寫函數來動態創建和配置藍圖。這在需要根據配置創建多個相似藍圖時很有用。

**參數化藍圖**：工廠函數可以接收參數來定制藍圖行為，如數據庫連接、API 版本等。

### 模塊化架構模式

**按功能劃分**：常見的做法是按業務功能劃分藍圖，如 `auth`（認證）、`blog`（博客）、`api`（API）、`admin`（管理）。

**按資源劃分**：RESTful API 中常按資源劃分，如 `users`、`posts`、`comments`。

**混合模式**：大型應用可能混合使用，既有功能藍圖也有資源藍圖。

### 藍圖與擴展

**擴展初始化**：Flask 擴展（如 Flask-SQLAlchemy、Flask-Login）通常在應用級初始化，藍圖可以使用這些擴展提供的功能。

**藍圖專用擴展**：某些擴展支持藍圖級別的配置，如 Flask-CORS 可以為特定藍圖配置 CORS 規則。

### 藍圖測試

**獨立測試**：藍圖的模塊化使得可以獨立測試每個功能模塊。創建測試應用，只註冊需要測試的藍圖。

**測試配置**：可以為測試創建特殊配置的應用，註冊藍圖並進行測試。

### 大型應用結構

**推薦結構**：
```
myapp/
    __init__.py          # 應用工廠函數
    config.py            # 配置
    models.py            # 數據模型
    auth/                # 認證藍圖
        __init__.py
        views.py
        forms.py
    blog/                # 博客藍圖
        __init__.py
        views.py
    api/                 # API 藍圖
        __init__.py
        v1/
            __init__.py
            users.py
            posts.py
    templates/           # 應用級模板
    static/              # 應用級靜態文件
```

### 藍圖的最佳實踐

**單一職責**：每個藍圖應該有明確的職責，避免藍圖過大。

**一致的命名**：藍圖名稱應該清楚表達其用途。端點命名遵循一致的規則。

**避免循環導入**：合理組織代碼，避免藍圖之間的循環依賴。使用應用工廠模式可以緩解這個問題。

**文檔化**：為藍圖添加文檔，說明其用途、依賴和配置選項。

**配置分離**：藍圖特定的配置應該清楚標識，與應用配置分離。

## 程式碼範例

```python
# Flask Blueprint 完整示例

# 1. 基本 Blueprint 定義
# file: auth/views.py
from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """登錄頁面"""
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # 驗證邏輯...
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            flash('登錄成功！', 'success')
            return redirect(url_for('blog.index'))
        else:
            flash('用戶名或密碼錯誤', 'error')
    
    return render_template('auth/login.html')


@auth_bp.route('/logout')
@login_required
def logout():
    """登出"""
    logout_user()
    flash('已登出', 'info')
    return redirect(url_for('auth.login'))


@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """註冊頁面"""
    if request.method == 'POST':
        # 註冊邏輯...
        return redirect(url_for('auth.login'))
    
    return render_template('auth/register.html')


# 2. 帶資源的 Blueprint
# file: blog/__init__.py
from flask import Blueprint

blog_bp = Blueprint(
    'blog',
    __name__,
    url_prefix='/blog',
    template_folder='templates',  # blog/templates/
    static_folder='static',        # blog/static/
    static_url_path='/blog-static'
)

from . import views  # 導入路由


# file: blog/views.py
from . import blog_bp
from flask import render_template, request, redirect, url_for
from flask_login import login_required, current_user


@blog_bp.route('/')
def index():
    """博客首頁"""
    posts = Post.query.order_by(Post.created_at.desc()).all()
    return render_template('blog/index.html', posts=posts)


@blog_bp.route('/post/<int:post_id>')
def post_detail(post_id):
    """文章詳情"""
    post = Post.query.get_or_404(post_id)
    return render_template('blog/post.html', post=post)


@blog_bp.route('/post/create', methods=['GET', 'POST'])
@login_required
def create_post():
    """創建文章"""
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']
        
        post = Post(title=title, content=content, author=current_user)
        db.session.add(post)
        db.session.commit()
        
        return redirect(url_for('blog.post_detail', post_id=post.id'))
    
    return render_template('blog/create.html')


# 3. API Blueprint
# file: api/__init__.py
from flask import Blueprint

api_bp = Blueprint('api', __name__, url_prefix='/api/v1')

from . import users, posts  # 導入子模塊


# file: api/users.py
from . import api_bp
from flask import jsonify, request


@api_bp.route('/users', methods=['GET'])
def get_users():
    """獲取用戶列表"""
    users = User.query.all()
    return jsonify({
        'users': [u.to_dict() for u in users]
    })


@api_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """獲取單個用戶"""
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())


@api_bp.route('/users', methods=['POST'])
def create_user():
    """創建用戶"""
    data = request.get_json()
    user = User(username=data['username'], email=data['email'])
    db.session.add(user)
    db.session.commit()
    
    return jsonify(user.to_dict()), 201


# 4. 藍圖鉤子函數
@blog_bp.before_request
def before_blog_request():
    """博客藍圖的請求前處理"""
    # 例如：檢查維護模式、記錄訪問日誌等
    if app.config.get('BLOG_MAINTENANCE_MODE'):
        return render_template('blog/maintenance.html'), 503


@blog_bp.after_request
def after_blog_request(response):
    """博客藍圖的請求後處理"""
    # 例如：添加自定義headers
    response.headers['X-Blog-Version'] = '1.0'
    return response


@blog_bp.teardown_request
def teardown_blog_request(exception):
    """博客藍圖的清理函數"""
    # 清理資源，如關閉數據庫連接
    pass


# 5. 錯誤處理
@blog_bp.errorhandler(404)
def blog_not_found(error):
    """博客藍圖的 404 處理"""
    return render_template('blog/404.html'), 404


@blog_bp.app_errorhandler(500)
def server_error(error):
    """應用級 500 錯誤處理（在藍圖中註冊）"""
    return render_template('500.html'), 500


# 6. URL 構建示例
@blog_bp.route('/redirect-demo')
def redirect_demo():
    """URL 構建示例"""
    # 當前藍圖的其他視圖（使用點號）
    url1 = url_for('.index')  # /blog/
    
    # 其他藍圖的視圖（使用完整端點名）
    url2 = url_for('auth.login')  # /auth/login
    
    # 藍圖的靜態文件
    url3 = url_for('blog.static', filename='style.css')  # /blog-static/style.css
    
    # 應用的靜態文件
    url4 = url_for('static', filename='main.css')  # /static/main.css
    
    return f"URLs: {url1}, {url2}, {url3}, {url4}"


# 7. 應用工廠模式
# file: __init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

db = SQLAlchemy()
login_manager = LoginManager()


def create_app(config_name='default'):
    """應用工廠函數"""
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # 初始化擴展
    db.init_app(app)
    login_manager.init_app(app)
    
    # 註冊藍圖
    from .auth import auth_bp
    app.register_blueprint(auth_bp)
    
    from .blog import blog_bp
    app.register_blueprint(blog_bp)
    
    from .api import api_bp
    app.register_blueprint(api_bp)
    
    # 註冊主頁（不在藍圖中）
    @app.route('/')
    def index():
        return render_template('index.html')
    
    return app


# 8. 藍圖工廠模式
def create_api_blueprint(version='v1', prefix=None):
    """動態創建 API 藍圖"""
    if prefix is None:
        prefix = f'/api/{version}'
    
    api_bp = Blueprint(f'api_{version}', __name__, url_prefix=prefix)
    
    @api_bp.route('/status')
    def status():
        return jsonify({'version': version, 'status': 'ok'})
    
    return api_bp


# 使用
# api_v1 = create_api_blueprint('v1')
# api_v2 = create_api_blueprint('v2')
# app.register_blueprint(api_v1)
# app.register_blueprint(api_v2)


# 9. 多次註冊同一藍圖
admin_bp = Blueprint('admin', __name__, template_folder='templates')


@admin_bp.route('/')
def admin_index():
    """管理首頁"""
    return render_template('admin/index.html')


# 為不同資源註冊管理藍圖
app.register_blueprint(admin_bp, url_prefix='/admin/users', name='users_admin')
app.register_blueprint(admin_bp, url_prefix='/admin/posts', name='posts_admin')


# 10. 子域名藍圖
api_bp = Blueprint('api', __name__, subdomain='api')


@api_bp.route('/')
def api_home():
    """API 首頁（api.example.com）"""
    return jsonify({'message': 'API Home'})


# 需要配置 SERVER_NAME
# app.config['SERVER_NAME'] = 'example.com:5000'
# app.register_blueprint(api_bp)


# 11. 帶變量的 URL 前綴
i18n_bp = Blueprint('i18n', __name__, url_prefix='/<lang>')


@i18n_bp.route('/')
def i18n_index(lang):
    """國際化首頁"""
    return render_template(f'{lang}/index.html')


@i18n_bp.url_defaults
def add_language_code(endpoint, values):
    """自動添加語言代碼"""
    if 'lang' not in values and app.url_map.is_endpoint_expecting(endpoint, 'lang'):
        values['lang'] = g.get('lang', 'en')


@i18n_bp.url_value_preprocessor
def pull_lang_code(endpoint, values):
    """提取語言代碼"""
    g.lang = values.pop('lang', 'en')


# 12. 完整的應用結構示例
"""
myapp/
    __init__.py          # create_app()
    config.py            # 配置類
    models.py            # 數據模型
    extensions.py        # 擴展實例
    
    auth/
        __init__.py      # auth_bp
        views.py         # 路由
        forms.py         # 表單
        models.py        # 認證相關模型
        templates/
            auth/
                login.html
                register.html
    
    blog/
        __init__.py      # blog_bp
        views.py
        forms.py
        templates/
            blog/
                index.html
                post.html
        static/
            blog.css
    
    api/
        __init__.py      # api_bp
        v1/
            __init__.py
            users.py
            posts.py
        v2/
            __init__.py
            users.py
    
    templates/           # 應用級模板
        base.html
        index.html
        404.html
    
    static/              # 應用級靜態文件
        css/
        js/
        images/
"""


# 13. 藍圖測試
import pytest
from myapp import create_app


@pytest.fixture
def app():
    """創建測試應用"""
    app = create_app('testing')
    return app


@pytest.fixture
def client(app):
    """創建測試客戶端"""
    return app.test_client()


def test_blog_index(client):
    """測試博客首頁"""
    response = client.get('/blog/')
    assert response.status_code == 200


def test_auth_login(client):
    """測試登錄頁面"""
    response = client.get('/auth/login')
    assert response.status_code == 200


def test_api_users(client):
    """測試 API 用戶端點"""
    response = client.get('/api/v1/users')
    assert response.status_code == 200
    assert response.is_json


# 14. 藍圖配置
class BlueprintConfig:
    """藍圖配置類"""
    BLOG_POSTS_PER_PAGE = 10
    BLOG_ALLOW_COMMENTS = True


# 在藍圖中訪問配置
@blog_bp.route('/config')
def blog_config():
    """顯示博客配置"""
    return jsonify({
        'posts_per_page': current_app.config.get('BLOG_POSTS_PER_PAGE'),
        'allow_comments': current_app.config.get('BLOG_ALLOW_COMMENTS')
    })
```

## 相關主題

- [Flask 路由系統與 URL 規則](./routing_and_url_rules.md)
- [Flask 應用上下文與請求上下文](./application_and_request_context.md)
- [Flask 請求與響應對象](./request_and_response_objects.md)
- [Flask 配置管理](./configuration_management.md)
