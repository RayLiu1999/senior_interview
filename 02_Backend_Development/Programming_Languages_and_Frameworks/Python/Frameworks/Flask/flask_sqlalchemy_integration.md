# Flask-SQLAlchemy 集成

- **難度**: 7
- **重要性**: 5
- **標籤**: `SQLAlchemy`, `ORM`, `Database`

## 問題詳述

Flask-SQLAlchemy 是 Flask 與 SQLAlchemy ORM 的集成擴展，提供了簡化的配置和使用方式，是 Flask 應用中最常用的資料庫解決方案。

## 核心理論與詳解

### 基本設置

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@localhost/dbname'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
```

### 定義模型

```python
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 關係
    posts = db.relationship('Post', backref='author', lazy='dynamic')
    
    def __repr__(self):
        return f'<User {self.username}>'

class Post(db.Model):
    __tablename__ = 'posts'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Post {self.title}>'
```

### CRUD 操作

#### 創建

```python
@app.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    
    user = User(
        username=data['username'],
        email=data['email']
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'id': user.id, 'username': user.username}), 201
```

#### 查詢

```python
# 獲取所有用戶
users = User.query.all()

# 根據 ID 獲取
user = User.query.get(1)
user = User.query.get_or_404(1)

# 根據條件過濾
user = User.query.filter_by(username='john').first()
users = User.query.filter(User.email.like('%@gmail.com')).all()

# 鏈式查詢
users = User.query.filter_by(is_active=True).order_by(User.created_at.desc()).limit(10).all()
```

#### 更新

```python
@app.route('/users/<int:id>', methods=['PUT'])
def update_user(id):
    user = User.query.get_or_404(id)
    data = request.get_json()
    
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    
    db.session.commit()
    
    return jsonify({'id': user.id, 'username': user.username})
```

#### 刪除

```python
@app.route('/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    
    return '', 204
```

### 關係和查詢優化

#### 一對多關係

```python
class Author(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    books = db.relationship('Book', backref='author', lazy='dynamic')

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    author_id = db.Column(db.Integer, db.ForeignKey('author.id'))

# 查詢優化
# N+1 問題
authors = Author.query.all()
for author in authors:
    print(author.books.count())  # 每次都查詢資料庫

# 解決方案：使用 joinedload
from sqlalchemy.orm import joinedload
authors = Author.query.options(joinedload(Author.books)).all()
```

#### 多對多關係

```python
# 關聯表
tags = db.Table('post_tags',
    db.Column('post_id', db.Integer, db.ForeignKey('post.id')),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'))
)

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    tags = db.relationship('Tag', secondary=tags, backref=db.backref('posts', lazy='dynamic'))

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
```

### 遷移管理

使用 Flask-Migrate：

```python
from flask_migrate import Migrate

migrate = Migrate(app, db)
```

```bash
# 初始化遷移
flask db init

# 生成遷移
flask db migrate -m "Initial migration"

# 應用遷移
flask db upgrade

# 回滾
flask db downgrade
```

### 高級查詢

```python
from sqlalchemy import func, and_, or_

# 聚合查詢
post_count = db.session.query(func.count(Post.id)).scalar()

# 分組查詢
results = db.session.query(
    User.username,
    func.count(Post.id).label('post_count')
).join(Post).group_by(User.username).all()

# 複雜條件
users = User.query.filter(
    and_(
        User.is_active == True,
        or_(
            User.email.like('%@gmail.com'),
            User.email.like('%@yahoo.com')
        )
    )
).all()

# 子查詢
subq = db.session.query(
    Post.user_id,
    func.count(Post.id).label('post_count')
).group_by(Post.user_id).subquery()

users_with_counts = db.session.query(
    User, subq.c.post_count
).outerjoin(subq, User.id == subq.c.user_id).all()
```

### 事務處理

```python
try:
    user = User(username='john', email='john@example.com')
    db.session.add(user)
    
    post = Post(title='First Post', author=user)
    db.session.add(post)
    
    db.session.commit()
except Exception as e:
    db.session.rollback()
    raise e
```

## 程式碼範例

```python
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy import func
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://localhost/myapp'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# 模型定義
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    posts = db.relationship('Post', backref='author', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'post_count': self.posts.count()
        }

class Post(db.Model):
    __tablename__ = 'posts'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'author': self.author.username,
            'created_at': self.created_at.isoformat()
        }

# API 端點
@app.route('/users', methods=['GET', 'POST'])
def users():
    if request.method == 'GET':
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        pagination = User.query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'users': [user.to_dict() for user in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        })
    
    elif request.method == 'POST':
        data = request.get_json()
        
        user = User(
            username=data['username'],
            email=data['email']
        )
        
        try:
            db.session.add(user)
            db.session.commit()
            return jsonify(user.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 400

@app.route('/users/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def user_detail(id):
    user = User.query.get_or_404(id)
    
    if request.method == 'GET':
        return jsonify(user.to_dict())
    
    elif request.method == 'PUT':
        data = request.get_json()
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        
        try:
            db.session.commit()
            return jsonify(user.to_dict())
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 400
    
    elif request.method == 'DELETE':
        db.session.delete(user)
        db.session.commit()
        return '', 204

if __name__ == '__main__':
    app.run(debug=True)
```

## 總結

Flask-SQLAlchemy 提供了簡潔的 API 來操作資料庫，支持多種資料庫後端。理解模型定義、關係配置、查詢優化和事務處理是使用 Flask-SQLAlchemy 的關鍵。配合 Flask-Migrate 進行資料庫遷移管理，可以構建健壯的資料持久化層。
