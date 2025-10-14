# FastAPI 測試策略

- **難度**: 7
- **重要性**: 4
- **標籤**: `Testing`, `TestClient`, `pytest`

## 問題詳述

解釋 FastAPI 應用的測試策略，包括單元測試、集成測試、TestClient 使用、數據庫測試以及測試最佳實踐。

## 核心理論與詳解

### TestClient 基礎

FastAPI 提供了 **TestClient**，基於 Starlette 的測試客戶端，允許直接測試 API 而無需啟動服務器。

**基本使用**

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}

# 測試代碼
client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

def test_read_item():
    response = client.get("/items/42?q=test")
    assert response.status_code == 200
    assert response.json() == {"item_id": 42, "q": "test"}
```

### Pytest 集成

使用 pytest 作為測試框架。

**Fixture 設置**

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

# 測試數據庫
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """為每個測試創建獨立的數據庫會話"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """創建測試客戶端"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

def test_create_user(client):
    response = client.post(
        "/users/",
        json={"email": "test@example.com", "password": "testpass"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data
```

### 認證測試

測試需要認證的端點。

```python
from app.auth import create_access_token

@pytest.fixture
def auth_client(client, db_session):
    """返回帶認證的客戶端"""
    # 創建測試用戶
    user = User(email="test@example.com", hashed_password="...")
    db_session.add(user)
    db_session.commit()
    
    # 生成 token
    token = create_access_token({"sub": user.email})
    
    # 設置認證標頭
    client.headers = {"Authorization": f"Bearer {token}"}
    
    return client

def test_protected_route(auth_client):
    response = auth_client.get("/users/me")
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

def test_protected_route_without_auth(client):
    response = client.get("/users/me")
    assert response.status_code == 401
```

### 異步測試

測試異步端點和函數。

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_async_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_async_database_operation(db_session):
    from app.crud import create_user
    
    user_data = {"email": "async@example.com", "password": "test"}
    user = await create_user(db_session, user_data)
    
    assert user.email == "async@example.com"
```

### Mock 和依賴覆蓋

覆蓋依賴以進行測試。

```python
from unittest.mock import Mock, patch

def test_external_api_mock(client):
    """Mock 外部 API 調用"""
    mock_response = {"data": "mocked"}
    
    with patch("app.services.external_api.fetch_data", return_value=mock_response):
        response = client.get("/data")
        assert response.json() == mock_response

def test_dependency_override(client):
    """覆蓋依賴注入"""
    def mock_get_current_user():
        return {"user_id": 1, "email": "mock@example.com"}
    
    app.dependency_overrides[get_current_user] = mock_get_current_user
    
    response = client.get("/users/me")
    assert response.json()["email"] == "mock@example.com"
    
    app.dependency_overrides.clear()
```

### 參數化測試

使用 pytest 的參數化功能測試多種場景。

```python
@pytest.mark.parametrize("item_id, expected_status", [
    (1, 200),
    (999, 404),
    (0, 400),
])
def test_get_item(client, item_id, expected_status):
    response = client.get(f"/items/{item_id}")
    assert response.status_code == expected_status

@pytest.mark.parametrize("email, password, expected_status", [
    ("valid@example.com", "ValidPass123", 200),
    ("invalid-email", "ValidPass123", 422),
    ("valid@example.com", "123", 422),  # 密碼太短
])
def test_register(client, email, password, expected_status):
    response = client.post(
        "/register",
        json={"email": email, "password": password}
    )
    assert response.status_code == expected_status
```

### 測試覆蓋率

使用 pytest-cov 測量測試覆蓋率。

```bash
pip install pytest-cov
pytest --cov=app --cov-report=html
```

```python
# pytest.ini
[pytest]
addopts = --cov=app --cov-report=term-missing --cov-report=html
```

### WebSocket 測試

測試 WebSocket 連接。

```python
def test_websocket():
    client = TestClient(app)
    
    with client.websocket_connect("/ws") as websocket:
        websocket.send_text("Hello")
        data = websocket.receive_text()
        assert data == "Message: Hello"
```

### 測試最佳實踐

**1. AAA 模式**（Arrange-Act-Assert）
```python
def test_create_item(client, db_session):
    # Arrange - 準備測試數據
    item_data = {"name": "Test Item", "price": 10.99}
    
    # Act - 執行操作
    response = client.post("/items/", json=item_data)
    
    # Assert - 驗證結果
    assert response.status_code == 200
    assert response.json()["name"] == "Test Item"
```

**2. 獨立性**
- 每個測試應該獨立運行
- 使用 fixture 清理數據
- 不要依賴測試執行順序

**3. 測試命名**
```python
def test_should_return_404_when_item_not_found():
    # 清晰描述測試意圖
    pass
```

**4. 邊界條件測試**
```python
@pytest.mark.parametrize("value", [
    -1,      # 負數
    0,       # 零
    1,       # 最小有效值
    999999,  # 最大值
])
def test_boundary_values(client, value):
    response = client.post("/items/", json={"quantity": value})
    # 驗證邊界情況
```

**5. 錯誤情況測試**
```python
def test_database_error(client, monkeypatch):
    """測試數據庫錯誤處理"""
    def mock_db_error(*args, **kwargs):
        raise DatabaseError("Connection failed")
    
    monkeypatch.setattr("app.crud.create_item", mock_db_error)
    
    response = client.post("/items/", json={...})
    assert response.status_code == 500
```

## 關鍵要點

FastAPI 的 TestClient 基於 Starlette，提供了簡單而強大的測試能力。使用 pytest 作為測試框架，配合 fixture 進行數據庫設置和依賴注入覆蓋。測試策略包括單元測試、集成測試、認證測試、異步測試等。最佳實踐包括遵循 AAA 模式、保持測試獨立性、參數化測試、測試邊界條件和錯誤情況。使用 pytest-cov 測量覆蓋率，確保代碼質量。Mock 和依賴覆蓋功能讓測試更加靈活和可控。
