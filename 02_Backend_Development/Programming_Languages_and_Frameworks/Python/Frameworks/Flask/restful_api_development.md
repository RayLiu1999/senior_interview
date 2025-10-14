# Flask RESTful API 開發

- **難度**: 7
- **重要性**: 5
- **標籤**: `REST API`, `Flask-RESTful`

## 問題詳述

解釋使用 Flask 開發 RESTful API 的方法，包括 Flask-RESTful 擴展的使用、資源設計、請求解析、響應序列化以及 API 最佳實踐。

## 核心理論與詳解

### RESTful API 設計原則

**核心概念**：
- **資源（Resources）**：使用名詞表示（如 /users、/posts）
- **HTTP 方法**：GET（查詢）、POST（創建）、PUT（更新）、DELETE（刪除）
- **狀態碼**：200（成功）、201（已創建）、400（錯誤請求）、404（未找到）
- **無狀態**：每個請求包含完整信息

### 使用 Flask-RESTful

```python
from flask import Flask
from flask_restful import Resource, Api, reqparse, fields, marshal_with

app = Flask(__name__)
api = Api(app)

# 定義資源
class UserResource(Resource):
    def get(self, user_id):
        user = User.query.get_or_404(user_id)
        return {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    
    def put(self, user_id):
        user = User.query.get_or_404(user_id)
        parser = reqparse.RequestParser()
        parser.add_argument('username', required=True)
        parser.add_argument('email', required=True)
        args = parser.parse_args()
        
        user.username = args['username']
        user.email = args['email']
        db.session.commit()
        return {'message': '更新成功'}, 200
    
    def delete(self, user_id):
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return '', 204

class UserListResource(Resource):
    def get(self):
        users = User.query.all()
        return [{'id': u.id, 'username': u.username} for u in users]
    
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('username', required=True)
        parser.add_argument('email', required=True)
        parser.add_argument('password', required=True)
        args = parser.parse_args()
        
        user = User(**args)
        db.session.add(user)
        db.session.commit()
        return {'id': user.id}, 201

# 註冊路由
api.add_resource(UserListResource, '/api/users')
api.add_resource(UserResource, '/api/users/<int:user_id>')
```

### 使用 marshal 進行序列化

```python
from flask_restful import fields, marshal_with

user_fields = {
    'id': fields.Integer,
    'username': fields.String,
    'email': fields.String,
    'created_at': fields.DateTime(dt_format='iso8601')
}

class UserResource(Resource):
    @marshal_with(user_fields)
    def get(self, user_id):
        return User.query.get_or_404(user_id)
```

### 請求解析和驗證

```python
from flask_restful import reqparse

parser = reqparse.RequestParser()
parser.add_argument('username', type=str, required=True, help='用戶名不能為空')
parser.add_argument('age', type=int, choices=range(1, 120), help='年齡必須在 1-119 之間')
parser.add_argument('email', type=str, required=True, location='form')
parser.add_argument('tags', type=str, action='append')  # 支持多值

args = parser.parse_args()
```

### API 版本控制

```python
# URL 版本控制
api.add_resource(UserResourceV1, '/api/v1/users/<int:user_id>')
api.add_resource(UserResourceV2, '/api/v2/users/<int:user_id>')

# 或使用 Blueprint
from flask import Blueprint

api_v1 = Blueprint('api_v1', __name__, url_prefix='/api/v1')
api_v2 = Blueprint('api_v2', __name__, url_prefix='/api/v2')
```

### 認證和授權

```python
from flask_httpauth import HTTPTokenAuth
from functools import wraps

auth = HTTPTokenAuth(scheme='Bearer')

@auth.verify_token
def verify_token(token):
    return User.verify_auth_token(token)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_admin:
            abort(403)
        return f(*args, **kwargs)
    return decorated_function

class ProtectedResource(Resource):
    @auth.login_required
    @admin_required
    def get(self):
        return {'message': '受保護的資源'}
```

### 分頁

```python
class UserListResource(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('page', type=int, default=1)
        parser.add_argument('per_page', type=int, default=20, choices=range(1, 101))
        args = parser.parse_args()
        
        pagination = User.query.paginate(
            page=args['page'],
            per_page=args['per_page'],
            error_out=False
        )
        
        return {
            'items': [u.to_dict() for u in pagination.items],
            'total': pagination.total,
            'page': pagination.page,
            'pages': pagination.pages
        }
```

### 錯誤處理

```python
from flask_restful import abort

@api.errorhandler(404)
def not_found(error):
    return {'error': 'Resource not found'}, 404

@api.errorhandler(400)
def bad_request(error):
    return {'error': 'Bad request', 'message': str(error)}, 400
```

## 關鍵要點

Flask-RESTful 提供了簡潔的 API 開發方式，通過 Resource 類定義資源端點，支持請求解析、響應序列化、認證授權等功能。RESTful API 設計遵循資源導向、無狀態、使用標準 HTTP 方法和狀態碼的原則。最佳實踐包括 API 版本控制、分頁、適當的錯誤處理、請求驗證以及使用 marshal 進行數據序列化。Flask-RESTful 適合構建中小型 REST API，對於更復雜的需求可以考慮 Flask-RESTX 或 FastAPI。
