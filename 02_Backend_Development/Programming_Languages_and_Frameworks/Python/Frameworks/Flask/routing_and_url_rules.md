# Flask 路由系統與 URL 規則

- **難度**: 5
- **重要程度**: 5
- **標籤**: `Routing`, `URL`, `View Functions`, `HTTP Methods`

## 問題詳述

深入探討 Flask 的路由系統，包括 URL 規則定義、動態路由、轉換器、HTTP 方法處理、URL 構建以及路由的最佳實踐。

## 核心理論與詳解

### Flask 路由的核心概念

**路由（Routing）** 是將 URL 映射到視圖函數的機制。在 Flask 中，路由通過裝飾器 `@app.route()` 定義，這是 Flask 最基本也是最重要的功能之一。

**Werkzeug 路由**：Flask 的路由系統基於 Werkzeug 的 URL 路由模塊。Werkzeug 提供了靈活且強大的 URL 匹配和構建功能。

**URL Map**：Flask 應用內部維護一個 URL Map，存儲所有註冊的路由規則。當請求到達時，Flask 查找匹配的規則並調用對應的視圖函數。

### route 裝飾器

**基本用法**：`@app.route('/path')` 將 URL 路徑與視圖函數綁定。裝飾器接收 URL 規則字符串和可選參數。

**多個路由**：一個視圖函數可以綁定多個 URL。將多個 `@app.route()` 裝飾器堆疊在同一個函數上即可。

**尾部斜杠**：Flask 區分帶和不帶尾部斜杠的 URL。`/about` 和 `/about/` 是不同的路由。帶斜杠的 URL 被視為文件夾，不帶斜杠的視為文件。

**規則**：定義路由時，建議對代表"資源集合"的 URL 使用尾部斜杠（如 `/users/`），對代表"單一資源"的 URL 不使用（如 `/about`）。

### 動態路由與變量規則

**變量部分**：URL 中用尖括號 `<>` 包裹的部分是變量，會作為關鍵字參數傳遞給視圖函數。例如 `/user/<username>` 中的 `username` 是變量。

**變量命名**：變量名必須是有效的 Python 標識符，不能包含特殊字符。變量名應該具有描述性，清楚表達其含義。

**多個變量**：一個 URL 可以包含多個變量，如 `/post/<int:year>/<int:month>/<slug>`。

### URL 轉換器

**內建轉換器**：Flask 提供多個內建轉換器來約束和轉換變量類型：
- `string`：默認類型，接受任何不含斜杠的文本
- `int`：接受正整數
- `float`：接受浮點數
- `path`：類似 string但接受斜杠，用於匹配路徑
- `uuid`：接受 UUID 字符串

**轉換器語法**：`<converter:variable_name>`，如 `<int:id>`、`<path:filepath>`。

**自動類型轉換**：轉換器不僅驗證格式，還自動將字符串轉換為對應的 Python 類型。例如 `<int:id>` 會將 ID 轉換為整數。

**自定義轉換器**：可以創建自定義轉換器來實現特殊的匹配和轉換邏輯。需要繼承 `werkzeug.routing.BaseConverter`。

### HTTP 方法

**methods 參數**：`@app.route()` 的 `methods` 參數指定路由接受的 HTTP 方法。默認只接受 GET 和 HEAD。

**常見方法**：
- GET：獲取資源
- POST：創建資源或提交數據
- PUT：更新資源（完整更新）
- PATCH：部分更新資源
- DELETE：刪除資源

**方法處理**：在視圖函數中，使用 `request.method` 來判斷當前請求的方法，並執行相應邏輯。

**RESTful API**：在設計 RESTful API 時，正確使用 HTTP 方法非常重要。每個方法都有特定的語義。

### URL 構建

**url_for() 函數**：動態生成 URL，接收視圖函數名和參數。使用函數名而非硬編碼路徑提高了代碼的可維護性。

**參數傳遞**：`url_for('view_func', param=value)` 會將參數填充到 URL 中。未在路由規則中定義的參數會作為查詢字符串添加。

**_external 參數**：`url_for(..., _external=True)` 生成完整的絕對 URL（包含域名和協議）。

**_scheme 參數**：指定 URL 的協議（http 或 https），如 `_scheme='https'`。

**_anchor 參數**：添加 URL 錨點，如 `_anchor='section1'` 生成 `/page#section1`。

**最佳實踐**：始終使用 `url_for()` 而非硬編碼 URL。這使得重構路由時不需要修改多處代碼。

### 視圖函數

**函數簽名**：視圖函數接收 URL 變量作為參數，參數名必須與路由規則中的變量名匹配。

**返回值**：視圖函數可以返回：
- 字符串：作為響應體，content-type 為 text/html
- Response 對象：完全控制響應
- 元組：`(response, status_code, headers)` 或 `(response, headers)`
- WSGI 應用：高級用法

**狀態碼**：返回元組時可以指定狀態碼，如 `return 'Not Found', 404`。

### 重定向

**redirect() 函數**：返回重定向響應，將客戶端重定向到新 URL。

**與 url_for 結合**：`redirect(url_for('view_name'))` 是常見模式，重定向到另一個視圖。

**狀態碼**：默認使用 302（臨時重定向），可以指定其他狀態碼如 301（永久重定向）或 303。

### 錯誤處理

**abort() 函數**：中止請求並返回 HTTP 錯誤。如 `abort(404)` 返回 404 錯誤頁面。

**errorhandler 裝飾器**：`@app.errorhandler(404)` 註冊自定義錯誤處理函數，可以返回自定義錯誤頁面。

**異常處理**：可以捕獲特定異常類型並返回適當的錯誤響應。

### 路由註冊方式

**裝飾器方式**：最常用的方式，使用 `@app.route()` 裝飾視圖函數。

**add_url_rule() 方法**：手動註冊路由，`app.add_url_rule('/path', 'view_name', view_func)`。這在某些動態場景下很有用。

**MethodView**：使用類視圖時，通過 `add_url_rule()` 註冊類視圖。

### 子域名路由

**subdomain 參數**：`@app.route(..., subdomain='api')` 為特定子域名註冊路由。

**配置**：需要設置 `SERVER_NAME` 配置項，如 `app.config['SERVER_NAME'] = 'example.com'`。

**動態子域名**：可以使用變量，如 `subdomain='<user>'`，實現多租戶應用。

### 路由優先級

**匹配順序**：Flask 按照路由註冊的順序嘗試匹配。第一個匹配的規則會被使用。

**具體優先**：更具體的規則應該放在更通用的規則之前。例如 `/user/me` 應該在 `/user/<id>` 之前。

**避免衝突**：設計路由時要避免模糊的規則，確保每個 URL 只匹配一個路由。

### 路由組織

**藍圖（Blueprint）**：用於組織大型應用的路由。藍圖可以定義一組路由，然後註冊到應用。

**模塊化**：將相關的路由組織在同一個藍圖中，如 `auth`、`api`、`admin` 等。

**URL 前綴**：藍圖可以設置 URL 前綴，如 `url_prefix='/api'`，簡化路由定義。

### 性能考慮

**路由緩存**：Flask 內部緩存 URL 匹配結果，提高性能。

**路由數量**：大量路由會影響啟動時間和匹配性能。考慮使用藍圖和動態路由來減少路由數量。

**正則表達式**：避免過於複雜的自定義轉換器，可能影響性能。

### 最佳實踐

**語義化 URL**：URL 應該清楚表達資源的含義，如 `/users/<id>/posts` 比 `/p/<uid>/<pid>` 更好。

**RESTful 設計**：遵循 REST 原則，使用正確的 HTTP 方法和 URL 結構。

**版本控制**：API 路由應該包含版本信息，如 `/api/v1/users`。

**一致性**：整個應用保持一致的 URL 命名風格和結構。

**文檔化**：為路由添加 docstring，說明其用途、參數和返回值。

## 程式碼範例

```python
from flask import Flask, request, redirect, url_for, abort, render_template
from werkzeug.routing import BaseConverter

app = Flask(__name__)


# 1. 基本路由
@app.route('/')
def index():
    """首頁"""
    return 'Welcome to Flask!'


@app.route('/about')
def about():
    """關於頁面"""
    return 'About Us'


# 2. 多個 URL 映射到同一視圖
@app.route('/hello')
@app.route('/hi')
@app.route('/greet')
def hello():
    """問候頁面（多個 URL）"""
    return 'Hello, World!'


# 3. 動態路由
@app.route('/user/<username>')
def show_user(username):
    """顯示用戶信息"""
    return f'User: {username}'


@app.route('/post/<int:post_id>')
def show_post(post_id):
    """顯示文章（ID 自動轉為整數）"""
    return f'Post {post_id}'


@app.route('/page/<path:subpath>')
def show_subpath(subpath):
    """處理包含斜杠的路徑"""
    return f'Subpath: {subpath}'


# 4. 使用多個轉換器
@app.route('/archive/<int:year>/<int:month>/<slug>')
def show_archive(year, month, slug):
    """文章歸檔"""
    return f'Archive: {year}/{month}/{slug}'


# 5. 自定義轉換器
class ListConverter(BaseConverter):
    """列表轉換器，將逗號分隔的值轉為列表"""
    
    def to_python(self, value):
        """URL 到 Python"""
        return value.split(',')
    
    def to_url(self, value):
        """Python 到 URL"""
        return ','.join(str(x) for x in value)


# 註冊自定義轉換器
app.url_map.converters['list'] = ListConverter


@app.route('/tags/<list:tags>')
def show_tags(tags):
    """顯示標籤列表"""
    return f'Tags: {", ".join(tags)}'


# 6. HTTP 方法處理
@app.route('/login', methods=['GET', 'POST'])
def login():
    """登錄頁面"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # 驗證邏輯...
        if username == 'admin' and password == 'secret':
            return redirect(url_for('dashboard'))
        else:
            return 'Invalid credentials', 401
    
    # GET 請求：顯示登錄表單
    return render_template('login.html')


# 7. RESTful API 路由
@app.route('/api/users', methods=['GET'])
def get_users():
    """獲取用戶列表"""
    users = [{'id': 1, 'name': 'John'}, {'id': 2, 'name': 'Jane'}]
    return {'users': users}


@app.route('/api/users', methods=['POST'])
def create_user():
    """創建新用戶"""
    data = request.get_json()
    # 創建用戶邏輯...
    return {'id': 3, 'name': data['name']}, 201


@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """獲取單個用戶"""
    return {'id': user_id, 'name': 'John'}


@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """更新用戶"""
    data = request.get_json()
    # 更新邏輯...
    return {'id': user_id, 'name': data['name']}


@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """刪除用戶"""
    # 刪除邏輯...
    return '', 204


# 8. URL 構建
@app.route('/dashboard')
def dashboard():
    """儀表板"""
    # 生成其他頁面的 URL
    profile_url = url_for('show_user', username='john')
    post_url = url_for('show_post', post_id=123)
    external_url = url_for('index', _external=True)
    
    return f'''
    Dashboard<br>
    <a href="{profile_url}">Profile</a><br>
    <a href="{post_url}">Post</a><br>
    External: {external_url}
    '''


# 9. 重定向
@app.route('/old-url')
def old_url():
    """舊 URL（重定向到新 URL）"""
    return redirect(url_for('new_url'))


@app.route('/new-url')
def new_url():
    """新 URL"""
    return 'This is the new URL'


@app.route('/redirect-external')
def redirect_external():
    """重定向到外部 URL"""
    return redirect('https://www.example.com')


# 10. 錯誤處理
@app.route('/user/<int:user_id>/delete')
def delete_user_page(user_id):
    """刪除用戶（示例）"""
    # 假設用戶不存在
    if user_id > 100:
        abort(404)
    
    # 假設沒有權限
    if user_id == 1:
        abort(403)
    
    return f'User {user_id} deleted'


@app.errorhandler(404)
def not_found(error):
    """自定義 404 頁面"""
    return render_template('404.html'), 404


@app.errorhandler(403)
def forbidden(error):
    """自定義 403 頁面"""
    return 'Access Forbidden', 403


# 11. 子域名路由
app.config['SERVER_NAME'] = 'example.com:5000'


@app.route('/', subdomain='api')
def api_index():
    """API 首頁（api.example.com）"""
    return 'API Home'


@app.route('/user/<username>', subdomain='<user>')
def user_subdomain(user, username):
    """用戶子域名（user.example.com/user/profile）"""
    return f'Subdomain: {user}, Username: {username}'


# 12. 使用 add_url_rule
def my_view():
    """視圖函數"""
    return 'My View'


# 手動註冊路由
app.add_url_rule('/my-route', 'my_view', my_view)


# 13. 返回不同類型的響應
from flask import make_response, jsonify


@app.route('/json')
def return_json():
    """返回 JSON"""
    return jsonify({'message': 'Hello', 'status': 'success'})


@app.route('/custom-response')
def custom_response():
    """自定義響應"""
    resp = make_response('Custom Response', 200)
    resp.headers['X-Custom-Header'] = 'Value'
    resp.set_cookie('session_id', '123456')
    return resp


@app.route('/tuple-response')
def tuple_response():
    """使用元組返回"""
    return 'Response Body', 201, {'X-Custom': 'Header'}


# 14. 查詢參數處理
@app.route('/search')
def search():
    """搜索（處理查詢參數）"""
    query = request.args.get('q', '')
    page = request.args.get('page', 1, type=int)
    
    return f'Search: {query}, Page: {page}'


# 15. 路由優先級示例
@app.route('/users/me')
def current_user():
    """當前用戶（必須在動態路由之前）"""
    return 'Current User'


@app.route('/users/<username>')
def user_profile(username):
    """用戶個人頁面"""
    return f'User: {username}'


# 16. 可選尾部斜杠
@app.route('/about/')
def about_slash():
    """帶斜杠（訪問 /about 會自動重定向到 /about/）"""
    return 'About with slash'


# 17. 路由調試
@app.route('/debug')
def debug_routes():
    """顯示所有註冊的路由"""
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({
            'endpoint': rule.endpoint,
            'methods': list(rule.methods),
            'path': str(rule)
        })
    return jsonify(routes)


# 18. 使用裝飾器包裝
def login_required(f):
    """登錄驗證裝飾器"""
    from functools import wraps
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # 檢查登錄狀態（示例）
        if not request.cookies.get('session'):
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    
    return decorated_function


@app.route('/protected')
@login_required
def protected_page():
    """受保護的頁面"""
    return 'Protected Content'


# 19. 生成 URL 查詢參數
@app.route('/link-generator')
def link_generator():
    """生成帶查詢參數的 URL"""
    # 額外的參數會成為查詢字符串
    search_url = url_for('search', q='flask', page=2, sort='date')
    # 生成: /search?q=flask&page=2&sort=date
    
    return f'Search URL: {search_url}'


# 20. 藍圖示例（路由組織）
from flask import Blueprint

api = Blueprint('api', __name__, url_prefix='/api/v1')


@api.route('/status')
def api_status():
    """API 狀態"""
    return jsonify({'status': 'ok', 'version': '1.0'})


@api.route('/users')
def api_users():
    """API 用戶列表"""
    return jsonify({'users': []})


# 註冊藍圖
app.register_blueprint(api)


if __name__ == '__main__':
    app.run(debug=True)
```

## 相關主題

- [Flask 應用上下文與請求上下文](./application_and_request_context.md)
- [Flask Blueprint 架構](./blueprint_architecture.md)
- [Flask 請求與響應對象](./request_and_response_objects.md)
- [Flask RESTful API 開發](./restful_api_development.md)
