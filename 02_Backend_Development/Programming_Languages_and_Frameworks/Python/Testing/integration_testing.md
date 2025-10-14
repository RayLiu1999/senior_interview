# 集成測試策略

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Integration Test`, `Test Strategy`, `E2E`

## 問題詳述

探討如何在 Python 中設計和實施集成測試，驗證多個組件協同工作的正確性，包括測試策略、測試環境管理、外部依賴處理和最佳實踐。

## 核心理論與詳解

### 集成測試的概念

**集成測試（Integration Testing）** 是在單元測試之上的測試層級，它驗證多個模塊、組件或服務協同工作時的行為是否正確。與單元測試隔離測試單一組件不同，集成測試關注組件間的交互、數據流轉和接口契約。集成測試能發現單元測試無法捕獲的問題，如接口不匹配、數據格式錯誤、時序問題等。

### 集成測試的層次

**組件級集成測試**：測試應用內部多個模塊的協同工作，例如服務層與數據訪問層的集成。這一層通常在進程內完成，速度較快。

**系統級集成測試**：測試完整系統與外部依賴（數據庫、緩存、消息隊列）的集成。需要真實或接近真實的外部環境。

**服務級集成測試**：在微服務架構中，測試多個服務之間的交互。通常涉及 HTTP API、gRPC 或消息傳遞。

**端到端測試（E2E）**：從用戶角度測試完整的業務流程，跨越前端、後端和所有依賴服務。這是最接近生產環境的測試。

### 測試金字塔與集成測試

在測試金字塔模型中，集成測試位於中間層，數量應該比單元測試少，但比 E2E 測試多。一般建議的比例是：70% 單元測試、20% 集成測試、10% E2E 測試。這個比例平衡了測試覆蓋率、執行速度和維護成本。

### 外部依賴的處理策略

**使用真實依賴**：在集成測試中使用真實的數據庫、緩存等服務。這提供最高的信心，但會增加測試複雜度和執行時間。適合測試關鍵路徑。

**使用測試替身（Test Double）**：包括 stub、mock、fake、spy。在集成測試中，fake（功能簡化的實現）比 mock 更常用，如使用內存數據庫代替生產數據庫。

**容器化依賴**：使用 Docker 容器提供隔離的測試環境。每次測試運行都能獲得乾淨的初始狀態，且配置與生產環境接近。

### 數據庫集成測試

**測試數據庫策略**：可以使用獨立的測試數據庫實例、內存數據庫（如 SQLite）或容器化數據庫。關鍵是保證測試隔離和可重複性。

**事務回滾策略**：在測試中使用數據庫事務，測試結束後回滾以清理數據。這保證測試不會互相干擾，但需要注意事務隔離級別的影響。

**Fixture 數據管理**：使用工廠模式或 fixture 文件準備測試數據。確保數據具有代表性，覆蓋各種業務場景。

**遷移測試**：集成測試也應驗證數據庫遷移的正確性，確保 schema 變更不會破壞應用。

### API 集成測試

**測試 HTTP 接口**：使用測試客戶端（如 Flask 的 test_client、FastAPI 的 TestClient）發起 HTTP 請求，驗證響應狀態碼、headers、body。

**契約測試（Contract Testing）**：驗證 API 的請求和響應符合預定義的契約。在微服務架構中特別重要，確保服務間的兼容性。

**認證與授權測試**：測試不同權限級別的用戶訪問 API 的行為，驗證安全機制。

### 消息隊列集成測試

**異步測試挑戰**：消息隊列的異步特性使測試變得複雜。需要適當的等待和重試機制來確保消息被處理。

**使用內存隊列**：在測試中可以使用內存實現的消息隊列（如 fakeredis、kombu 的 memory transport），加快測試速度。

**驗證消息處理**：不僅要測試消息發送，還要驗證消費者正確處理消息，產生預期的副作用。

### 測試環境管理

**環境隔離**：每個測試應該運行在隔離的環境中，不共享狀態。使用 pytest fixtures 的作用域控制資源生命週期。

**配置管理**：測試環境的配置應該與開發、生產環境分離。使用環境變量或配置文件區分不同環境。

**數據清理**：測試結束後必須清理產生的數據和資源。使用 fixture 的 teardown 或 yield 模式確保清理邏輯被執行。

### Docker 與 Testcontainers

**testcontainers-python**：這個庫允許在測試中啟動 Docker 容器，提供真實的服務實例。測試結束後自動清理容器。

**優勢**：提供與生產環境一致的依賴服務，測試隔離性好，支持並行測試。每個測試可以有獨立的容器實例。

**成本**：容器啟動需要時間，會增加測試執行時間。適合關鍵的集成測試，而不是所有測試。

### 集成測試的最佳實踐

**保持測試獨立**：集成測試也應該獨立運行，不依賴執行順序。每個測試設置自己的前置條件。

**測試關鍵路徑**：集成測試應該覆蓋核心業務流程和高風險區域。不是所有組件組合都需要集成測試。

**平衡速度與覆蓋率**：集成測試比單元測試慢，需要在速度和覆蓋率之間找到平衡。使用並行執行和選擇性測試提高效率。

**清晰的測試結構**：使用 AAA（Arrange-Act-Assert）模式組織集成測試，使測試邏輯清晰。

**有意義的斷言**：集成測試的斷言應該關注業務結果和系統狀態，而不是實現細節。

### CI/CD 中的集成測試

**測試分層執行**：在 CI 流程中，單元測試應該快速運行並先執行。集成測試可以在單元測試通過後運行，或在特定階段執行。

**測試環境準備**：CI 環境需要能夠啟動和配置測試所需的依賴服務。Docker Compose 或 Kubernetes 可以用於編排測試環境。

**失敗快速反饋**：當集成測試失敗時，應該提供足夠的日誌和上下文信息，幫助開發者快速定位問題。

## 程式碼範例

```python
# 使用 pytest 和 fixture 進行數據庫集成測試

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from myapp.models import Base, User, Order
from myapp.services import OrderService


@pytest.fixture(scope="function")
def db_session():
    """創建測試數據庫會話"""
    # 使用內存 SQLite 數據庫
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    
    Session = sessionmaker(bind=engine)
    session = Session()
    
    yield session
    
    session.close()


@pytest.fixture
def sample_user(db_session):
    """創建測試用戶"""
    user = User(id=1, email="test@example.com", name="Test User")
    db_session.add(user)
    db_session.commit()
    return user


def test_create_order_integration(db_session, sample_user):
    """集成測試：創建訂單流程"""
    # Arrange
    service = OrderService(db_session)
    product_ids = [101, 102]
    
    # Act
    order = service.create_order(
        user_id=sample_user.id,
        product_ids=product_ids
    )
    db_session.commit()
    
    # Assert
    assert order.id is not None
    assert order.user_id == sample_user.id
    assert len(order.items) == 2
    
    # 驗證數據庫狀態
    saved_order = db_session.query(Order).filter_by(id=order.id).first()
    assert saved_order is not None
    assert saved_order.total_amount > 0
```

```python
# 使用 testcontainers 進行真實數據庫測試

import pytest
from testcontainers.postgres import PostgresContainer
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from myapp.models import Base


@pytest.fixture(scope="module")
def postgres_container():
    """啟動 PostgreSQL 容器"""
    with PostgresContainer("postgres:14") as postgres:
        yield postgres


@pytest.fixture(scope="module")
def db_engine(postgres_container):
    """創建數據庫引擎"""
    connection_url = postgres_container.get_connection_url()
    engine = create_engine(connection_url)
    Base.metadata.create_all(engine)
    return engine


@pytest.fixture
def db_session(db_engine):
    """創建數據庫會話（函數級別，每個測試獨立）"""
    connection = db_engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


def test_user_repository_integration(db_session):
    """測試用戶倉庫的數據庫交互"""
    from myapp.repositories import UserRepository
    
    repo = UserRepository(db_session)
    
    # 創建用戶
    user = repo.create(email="test@example.com", name="Test")
    assert user.id is not None
    
    # 查詢用戶
    found_user = repo.get_by_email("test@example.com")
    assert found_user.id == user.id
    assert found_user.name == "Test"
```

```python
# Flask API 集成測試

import pytest
from myapp import create_app
from myapp.models import db, User


@pytest.fixture
def app():
    """創建測試應用"""
    app = create_app("testing")
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """創建測試客戶端"""
    return app.test_client()


@pytest.fixture
def auth_headers(client, app):
    """獲取認證頭"""
    with app.app_context():
        # 創建測試用戶並獲取 token
        user = User(email="test@example.com")
        user.set_password("password")
        db.session.add(user)
        db.session.commit()
        
        response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "password"
        })
        token = response.json["access_token"]
        
    return {"Authorization": f"Bearer {token}"}


def test_create_order_api_integration(client, auth_headers):
    """測試創建訂單 API 的完整流程"""
    # 創建訂單
    response = client.post(
        "/api/orders",
        json={
            "items": [
                {"product_id": 1, "quantity": 2},
                {"product_id": 2, "quantity": 1}
            ]
        },
        headers=auth_headers
    )
    
    assert response.status_code == 201
    data = response.json
    assert "order_id" in data
    order_id = data["order_id"]
    
    # 驗證訂單創建成功
    response = client.get(f"/api/orders/{order_id}", headers=auth_headers)
    assert response.status_code == 200
    order = response.json
    assert len(order["items"]) == 2
    assert order["status"] == "pending"
```

```python
# FastAPI 集成測試

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from myapp.main import app
from myapp.database import Base, get_db


@pytest.fixture
def test_db():
    """創建測試數據庫"""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(bind=engine)
    
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def client(test_db):
    """創建測試客戶端"""
    return TestClient(app)


def test_user_registration_and_login_flow(client):
    """測試用戶註冊和登錄的完整流程"""
    # 註冊用戶
    register_response = client.post("/api/users/register", json={
        "email": "newuser@example.com",
        "password": "securepassword",
        "name": "New User"
    })
    assert register_response.status_code == 201
    user_id = register_response.json()["id"]
    
    # 登錄
    login_response = client.post("/api/auth/token", data={
        "username": "newuser@example.com",
        "password": "securepassword"
    })
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    
    # 訪問受保護的端點
    profile_response = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert profile_response.status_code == 200
    assert profile_response.json()["id"] == user_id
```

```python
# 消息隊列集成測試（使用 Redis 和 Celery）

import pytest
from unittest.mock import patch
from myapp.tasks import process_order_task
from myapp.models import Order, OrderStatus


@pytest.fixture
def celery_app():
    """配置 Celery 用於測試"""
    from myapp.celery import celery_app
    celery_app.conf.update(
        task_always_eager=True,  # 同步執行任務
        task_eager_propagates=True,  # 傳播異常
    )
    return celery_app


def test_order_processing_task_integration(db_session, celery_app):
    """測試訂單處理任務的集成"""
    # Arrange
    order = Order(id=1, user_id=1, status=OrderStatus.PENDING)
    db_session.add(order)
    db_session.commit()
    
    # Act
    result = process_order_task.delay(order.id)
    
    # Assert
    assert result.successful()
    db_session.refresh(order)
    assert order.status == OrderStatus.PROCESSING
```

```python
# 使用 Docker Compose 進行多服務集成測試

import pytest
import docker
import time
from sqlalchemy import create_engine


@pytest.fixture(scope="session")
def docker_services():
    """啟動 Docker Compose 服務"""
    client = docker.from_env()
    
    # 啟動服務（假設有 docker-compose.test.yml）
    import subprocess
    subprocess.run(["docker-compose", "-f", "docker-compose.test.yml", "up", "-d"])
    
    # 等待服務就緒
    time.sleep(5)
    
    yield
    
    # 清理
    subprocess.run(["docker-compose", "-f", "docker-compose.test.yml", "down", "-v"])


def test_full_stack_integration(docker_services):
    """測試完整堆棧的集成（應用、數據庫、Redis 等）"""
    # 測試與真實服務的交互
    engine = create_engine("postgresql://test:test@localhost:5432/testdb")
    connection = engine.connect()
    result = connection.execute("SELECT 1")
    assert result.scalar() == 1
    connection.close()
```

## 相關主題

- [單元測試最佳實踐](./unit_testing_best_practices.md)
- [pytest 框架深入解析](./pytest_framework.md)
- [測試固件與依賴注入](./fixtures_and_dependency_injection.md)
