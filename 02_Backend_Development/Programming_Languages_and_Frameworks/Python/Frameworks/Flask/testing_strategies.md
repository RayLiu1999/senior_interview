# Flask 測試策略

- **難度**: 6
- **重要性**: 4
- **標籤**: `Testing`, `Test Client`, `Fixtures`

## 問題詳述

解釋 Flask 應用的測試策略，包括單元測試、集成測試、測試客戶端的使用以及測試最佳實踐。

## 核心理論與詳解

### Flask 測試基礎

Flask 提供 **test_client** 用於模擬 HTTP 請求。

```python
import pytest
from app import create_app, db

@pytest.fixture
def app():
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_home_page(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b'Welcome' in response.data
```

### 測試配置

```python
class TestConfig:
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False  # 禁用 CSRF 用於測試
    
def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    return app
```

### 測試 API 端點

```python
def test_create_user(client):
    response = client.post('/api/users', json={
        'username': 'test',
        'email': 'test@example.com'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['username'] == 'test'

def test_get_user(client):
    response = client.get('/api/users/1')
    assert response.status_code == 200
```

### 測試認證

```python
@pytest.fixture
def auth_client(client, app):
    # 創建測試用戶
    user = User(username='test', email='test@example.com')
    user.set_password('password')
    
    with app.app_context():
        db.session.add(user)
        db.session.commit()
    
    # 登錄
    client.post('/login', data={
        'username': 'test',
        'password': 'password'
    })
    
    return client

def test_protected_route(auth_client):
    response = auth_client.get('/dashboard')
    assert response.status_code == 200
```

### 數據庫測試

```python
def test_user_model(app):
    with app.app_context():
        user = User(username='test', email='test@example.com')
        db.session.add(user)
        db.session.commit()
        
        found_user = User.query.filter_by(username='test').first()
        assert found_user is not None
        assert found_user.email == 'test@example.com'
```

### Mock 和 Patch

```python
from unittest.mock import patch

def test_external_api(client):
    with patch('app.services.fetch_data') as mock_fetch:
        mock_fetch.return_value = {'data': 'mocked'}
        
        response = client.get('/fetch')
        assert response.get_json() == {'data': 'mocked'}
```

### 測試覆蓋率

```bash
pip install pytest-cov
pytest --cov=app --cov-report=html
```

## 關鍵要點

Flask 的 test_client 提供了完整的 HTTP 請求模擬能力。使用 pytest fixture 管理測試環境和數據。測試配置應該使用獨立的數據庫（如內存數據庫）並禁用 CSRF。認證測試需要模擬登錄狀態。使用 Mock 隔離外部依賴。測試覆蓋率工具幫助評估測試完整性。良好的測試策略是保證代碼質量的關鍵。
