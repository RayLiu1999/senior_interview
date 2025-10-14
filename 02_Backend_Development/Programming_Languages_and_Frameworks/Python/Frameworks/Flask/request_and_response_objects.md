# Flask 請求與響應對象

- **難度**: 5
- **重要性**: 5
- **標籤**: `Request`, `Response`, `HTTP`

## 問題詳述

Flask 的 Request 和 Response 對象是處理 HTTP 請求和響應的核心，理解它們的屬性和方法對於構建 Web 應用至關重要。

## 核心理論與詳解

### Request 對象

Flask 的 `request` 對象封裝了客戶端發送的 HTTP 請求信息。

#### 訪問 Request 對象

```python
from flask import Flask, request

app = Flask(__name__)

@app.route('/example')
def example():
    # request 對象在請求上下文中可用
    method = request.method
    return f'Request method: {method}'
```

#### Request 的主要屬性

##### 1. 請求方法和 URL

```python
@app.route('/info')
def info():
    return {
        'method': request.method,  # GET, POST, PUT, DELETE 等
        'url': request.url,  # 完整 URL
        'base_url': request.base_url,  # 不含查詢字符串的 URL
        'url_root': request.url_root,  # 根 URL
        'path': request.path,  # URL 路徑
        'full_path': request.full_path,  # 包含查詢字符串的路徑
        'script_root': request.script_root,  # 應用掛載點
    }
```

##### 2. 查詢參數 (Query Parameters)

```python
# URL: /search?q=python&page=1
@app.route('/search')
def search():
    # 獲取單個參數
    query = request.args.get('q')  # 'python'
    page = request.args.get('page', type=int)  # 1
    
    # 獲取參數，提供默認值
    limit = request.args.get('limit', default=10, type=int)
    
    # 獲取所有參數
    all_params = request.args.to_dict()
    
    # 獲取多值參數（如 ?tag=python&tag=flask）
    tags = request.args.getlist('tag')
    
    return {'query': query, 'page': page, 'tags': tags}
```

##### 3. 表單數據 (Form Data)

```python
@app.route('/submit', methods=['POST'])
def submit():
    # 獲取表單字段
    username = request.form.get('username')
    password = request.form.get('password')
    
    # 獲取多值字段（如多選框）
    hobbies = request.form.getlist('hobbies')
    
    # 獲取所有表單數據
    form_data = request.form.to_dict()
    
    return {'username': username, 'hobbies': hobbies}
```

##### 4. JSON 數據

```python
@app.route('/api/data', methods=['POST'])
def api_data():
    # 獲取 JSON 數據
    data = request.get_json()
    
    # 強制解析為 JSON（即使 Content-Type 不正確）
    data = request.get_json(force=True)
    
    # 靜默失敗（返回 None 而不是拋出異常）
    data = request.get_json(silent=True)
    
    # 訪問 JSON 字段
    name = data.get('name')
    age = data.get('age')
    
    return {'received': data}
```

##### 5. 文件上傳

```python
@app.route('/upload', methods=['POST'])
def upload():
    # 檢查文件是否存在
    if 'file' not in request.files:
        return {'error': 'No file part'}, 400
    
    file = request.files['file']
    
    # 檢查文件名
    if file.filename == '':
        return {'error': 'No selected file'}, 400
    
    # 保存文件
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return {'filename': filename}
    
    return {'error': 'Invalid file'}, 400

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
```

##### 6. Headers

```python
@app.route('/headers')
def headers():
    # 獲取特定 header
    user_agent = request.headers.get('User-Agent')
    content_type = request.headers.get('Content-Type')
    
    # 獲取授權 header
    auth = request.headers.get('Authorization')
    
    # 獲取所有 headers
    all_headers = dict(request.headers)
    
    return {'user_agent': user_agent, 'headers': all_headers}
```

##### 7. Cookies

```python
@app.route('/check-cookie')
def check_cookie():
    # 獲取 cookie
    session_id = request.cookies.get('session_id')
    user_pref = request.cookies.get('user_pref', 'default')
    
    # 獲取所有 cookies
    all_cookies = request.cookies.to_dict()
    
    return {'session_id': session_id, 'cookies': all_cookies}
```

##### 8. 客戶端信息

```python
@app.route('/client-info')
def client_info():
    return {
        'remote_addr': request.remote_addr,  # 客戶端 IP
        'user_agent': request.user_agent.string,  # User-Agent 字符串
        'browser': request.user_agent.browser,  # 瀏覽器
        'platform': request.user_agent.platform,  # 平台
        'referrer': request.referrer,  # 來源頁面
        'is_secure': request.is_secure,  # 是否 HTTPS
    }
```

### Response 對象

Flask 可以返回多種類型的響應。

#### 基本響應類型

```python
from flask import Response, jsonify, render_template, redirect, url_for

# 1. 字符串響應（自動轉為 HTML）
@app.route('/text')
def text():
    return 'Hello, World!'

# 2. JSON 響應
@app.route('/json')
def json():
    return jsonify({'message': 'Hello', 'status': 'success'})

# 3. 模板響應
@app.route('/template')
def template():
    return render_template('index.html', title='Home')

# 4. 重定向
@app.route('/old-page')
def old_page():
    return redirect(url_for('new_page'))

@app.route('/new-page')
def new_page():
    return 'New Page'

# 5. 明確的 Response 對象
@app.route('/custom')
def custom():
    response = Response('Custom response', status=200)
    response.headers['X-Custom-Header'] = 'Value'
    return response
```

#### 設置狀態碼和 Headers

```python
# 方式一：返回元組
@app.route('/tuple')
def tuple_response():
    return {'message': 'Success'}, 201, {'X-Custom': 'Header'}

# 方式二：使用 make_response
from flask import make_response

@app.route('/make-response')
def make_response_example():
    response = make_response(jsonify({'message': 'Success'}), 200)
    response.headers['X-Custom'] = 'Header'
    response.set_cookie('session_id', '12345')
    return response
```

#### 設置 Cookies

```python
@app.route('/set-cookie')
def set_cookie():
    response = make_response('Cookie set')
    response.set_cookie(
        'username',
        'john',
        max_age=3600,  # 1 小時後過期
        secure=True,  # 僅 HTTPS
        httponly=True,  # 不可通過 JavaScript 訪問
        samesite='Lax'  # CSRF 保護
    )
    return response

@app.route('/delete-cookie')
def delete_cookie():
    response = make_response('Cookie deleted')
    response.delete_cookie('username')
    return response
```

#### 文件響應

```python
from flask import send_file, send_from_directory

@app.route('/download/<filename>')
def download_file(filename):
    return send_from_directory(
        'uploads',
        filename,
        as_attachment=True  # 觸發下載
    )

@app.route('/image/<image_id>')
def serve_image(image_id):
    image_path = f'images/{image_id}.jpg'
    return send_file(
        image_path,
        mimetype='image/jpeg',
        as_attachment=False,  # 在瀏覽器中顯示
        download_name='custom_name.jpg'  # 自定義文件名
    )
```

#### 流式響應

```python
from flask import stream_with_context

@app.route('/stream')
def stream():
    def generate():
        for i in range(10):
            yield f'data: {i}\n\n'
            time.sleep(1)
    
    return Response(
        generate(),
        mimetype='text/event-stream'
    )

# 流式下載大文件
@app.route('/large-file')
def large_file():
    def generate():
        with open('large_file.zip', 'rb') as f:
            while True:
                chunk = f.read(4096)
                if not chunk:
                    break
                yield chunk
    
    return Response(
        generate(),
        mimetype='application/zip',
        headers={
            'Content-Disposition': 'attachment; filename=large_file.zip'
        }
    )
```

### 請求處理的完整示例

```python
from flask import Flask, request, jsonify, make_response
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = '/tmp/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

@app.route('/api/user', methods=['GET', 'POST', 'PUT', 'DELETE'])
def user_api():
    # 根據請求方法處理
    if request.method == 'GET':
        # 獲取查詢參數
        user_id = request.args.get('id', type=int)
        return jsonify({'method': 'GET', 'user_id': user_id})
    
    elif request.method == 'POST':
        # 獲取 JSON 數據
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid JSON'}), 400
        
        # 驗證必填字段
        required_fields = ['username', 'email']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        # 處理數據
        user = create_user(data)
        return jsonify(user), 201
    
    elif request.method == 'PUT':
        # 更新用戶
        user_id = request.args.get('id', type=int)
        data = request.get_json()
        user = update_user(user_id, data)
        return jsonify(user)
    
    elif request.method == 'DELETE':
        # 刪除用戶
        user_id = request.args.get('id', type=int)
        delete_user(user_id)
        return '', 204

@app.route('/api/upload', methods=['POST'])
def upload_api():
    # 檢查文件
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400
    
    # 獲取額外的表單數據
    description = request.form.get('description', '')
    category = request.form.get('category', 'general')
    
    # 保存文件
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    # 創建響應
    response = make_response(jsonify({
        'message': 'File uploaded successfully',
        'filename': filename,
        'description': description,
        'category': category
    }), 201)
    
    response.headers['X-Upload-ID'] = generate_upload_id()
    return response
```

## 程式碼範例

```python
from flask import Flask, request, jsonify, make_response, send_file
from functools import wraps
import jwt
from datetime import datetime, timedelta

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'

# 認證裝飾器
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            # 移除 "Bearer " 前綴
            token = token.split()[1] if ' ' in token else token
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = get_user_by_id(data['user_id'])
        except:
            return jsonify({'error': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

@app.route('/api/login', methods=['POST'])
def login():
    # 獲取 JSON 數據
    data = request.get_json()
    
    username = data.get('username')
    password = data.get('password')
    
    # 驗證用戶（簡化示例）
    user = authenticate(username, password)
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # 生成 JWT token
    token = jwt.encode({
        'user_id': user['id'],
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, app.config['SECRET_KEY'])
    
    # 創建響應
    response = make_response(jsonify({
        'message': 'Login successful',
        'token': token
    }))
    
    # 設置 cookie
    response.set_cookie(
        'session_token',
        token,
        max_age=86400,
        secure=True,
        httponly=True
    )
    
    return response

@app.route('/api/profile', methods=['GET'])
@token_required
def profile(current_user):
    return jsonify({
        'user': current_user,
        'ip': request.remote_addr,
        'user_agent': request.user_agent.string
    })

@app.route('/api/search', methods=['GET'])
def search():
    # 獲取查詢參數
    query = request.args.get('q', '')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    sort = request.args.get('sort', 'relevance')
    
    # 獲取過濾器（多值參數）
    filters = request.args.getlist('filter')
    
    # 執行搜索
    results = perform_search(query, page, per_page, sort, filters)
    
    # 返回響應
    return jsonify({
        'query': query,
        'page': page,
        'results': results,
        'total': len(results)
    })
```

## 總結

Flask 的 Request 和 Response 對象提供了處理 HTTP 請求和響應的完整功能。Request 對象封裝了所有請求信息（URL、參數、表單、JSON、文件、headers、cookies 等），Response 對象則提供了多種響應類型（JSON、HTML、文件、流式等）和靈活的配置選項（狀態碼、headers、cookies）。理解這些對象的屬性和方法是構建 Flask 應用的基礎。
