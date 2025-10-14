# 測試固件與依賴注入

- **難度**: 6
- **重要程度**: 4
- **標籤**: `Fixtures`, `DI`, `Setup/Teardown`, `pytest`

## 問題詳述

探討 pytest 中 fixture 機制的工作原理及其在測試中的應用，包括 fixture 的作用域、依賴注入、參數化以及如何使用 fixture 來管理測試資源和共享測試邏輯。

## 核心理論與詳解

### Fixture 的核心概念

**Fixture** 是 pytest 提供的一種強大機制，用於為測試提供固定的、可重用的上下文環境。Fixture 可以準備測試數據、創建測試對象、設置系統狀態，並在測試結束後進行清理。與傳統的 setup/teardown 方法相比，fixture 提供了更靈活的依賴管理和更清晰的測試代碼。

**設計哲學**：Fixture 遵循依賴注入（Dependency Injection）模式。測試函數通過參數聲明需要的 fixture，pytest 自動解析依賴關係並注入相應的資源。這種方式使測試代碼更清晰，依賴關係更明確。

### Fixture 的定義與使用

**定義 Fixture**：使用 `@pytest.fixture` 裝飾器標記一個函數為 fixture。Fixture 函數的返回值會被注入到請求它的測試函數中。

**使用 Fixture**：測試函數通過添加與 fixture 同名的參數來請求 fixture。pytest 會自動識別並調用對應的 fixture 函數，將返回值傳遞給測試。

**自動發現機制**：Fixture 可以定義在測試文件中、`conftest.py` 文件中或插件中。pytest 會自動發現並使用這些 fixture。`conftest.py` 中的 fixture 可以被同目錄及子目錄的所有測試文件共享。

### Fixture 的作用域

**Function 作用域（默認）**：每個測試函數執行時都會創建新的 fixture 實例。這確保測試間的完全隔離，但可能影響性能。

**Class 作用域**：Fixture 在測試類的第一個測試前創建，在最後一個測試後銷毀。同一類中的測試共享 fixture 實例。

**Module 作用域**：Fixture 在模塊的第一個測試前創建，在最後一個測試後銷毀。整個測試模塊共享同一個實例。

**Package 作用域**：Fixture 在包級別共享，適合包級別的資源。

**Session 作用域**：Fixture 在整個測試會話期間只創建一次。適合創建成本高、可以安全共享的資源，如數據庫連接池或應用實例。

**作用域選擇原則**：應該根據資源的創建成本、共享安全性和測試隔離需求來選擇作用域。優先使用較小的作用域以保證隔離性，只在必要時使用較大作用域以優化性能。

### Fixture 的清理機制

**yield 語法**：Fixture 函數可以使用 `yield` 語句將函數分為 setup 和 teardown 兩部分。`yield` 之前的代碼在測試前執行，之後的代碼在測試後執行，無論測試是否成功。

**addfinalizer 方法**：通過 `request.addfinalizer()` 註冊清理函數。這種方式更靈活，可以在 fixture 執行過程中動態註冊多個清理函數。

**異常處理**：Teardown 代碼應該具有異常容錯性。即使 setup 失敗，teardown 也應該能夠安全執行。

### Fixture 的依賴與組合

**Fixture 間依賴**：一個 fixture 可以依賴其他 fixture，通過參數聲明依賴關係。pytest 會按照依賴關係構建 fixture 的執行順序。

**依賴圖解析**：pytest 會構建 fixture 的依賴圖，並按照拓撲排序執行。這確保所有依賴在使用前都已準備好。

**Fixture 組合**：通過組合多個小的 fixture 來構建複雜的測試場景。這種模塊化方式提高了 fixture 的可重用性。

### Fixture 參數化

**params 參數**：在 `@pytest.fixture` 中使用 `params` 參數可以創建參數化的 fixture。使用該 fixture 的每個測試都會針對每個參數值執行一次。

**request.param**：在參數化的 fixture 中，通過 `request.param` 訪問當前的參數值。

**應用場景**：Fixture 參數化特別適合測試多個配置或多種實現。例如，測試應用對多種數據庫的支持。

### autouse Fixture

**自動使用**：設置 `autouse=True` 的 fixture 會自動應用於其作用域內的所有測試，無需在測試函數中聲明。

**應用場景**：適合全局的 setup/teardown 邏輯，如日誌配置、環境變量設置、數據庫清理等。

**注意事項**：過度使用 autouse 可能使測試行為不明確。應該優先使用顯式聲明的 fixture。

### Fixture 的命名與組織

**命名規範**：Fixture 名稱應該清晰表達其提供的資源或功能。使用描述性的名稱，如 `db_session`、`api_client`、`sample_user`。

**conftest.py 組織**：將共享的 fixture 放在 `conftest.py` 中。可以在不同層級創建多個 `conftest.py` 文件，形成 fixture 的層次結構。

**Fixture 文檔**：為 fixture 添加 docstring，說明其用途、依賴和副作用。這對於共享 fixture 特別重要。

### 動態 Fixture

**使用工廠模式**：Fixture 可以返回工廠函數，允許測試動態創建多個實例或配置實例屬性。

**靈活性**：工廠模式提供了更大的靈活性，測試可以根據需要創建不同配置的對象。

### Fixture 與 Mock 的結合

**集成 Mock**：Fixture 可以包含 mock 設置，為測試提供預配置的 mock 對象。這簡化了測試代碼，提高了可維護性。

**mocker Fixture**：pytest-mock 插件提供的 `mocker` fixture 是一個強大的 mock 工具，可以輕鬆創建和管理 mock 對象。

### Fixture 的最佳實踐

**保持簡單**：每個 fixture 應該只負責一個明確的職責。複雜的 fixture 應該分解為多個小 fixture 的組合。

**明確依賴**：測試函數應該明確聲明所需的 fixture，使測試的依賴關係清晰可見。

**適當的作用域**：選擇最小的安全作用域。只在資源創建成本高且共享安全時才使用較大作用域。

**清理保證**：確保 fixture 的 teardown 邏輯總是能夠執行，即使在測試失敗的情況下。

**避免副作用**：Function 作用域的 fixture 不應該有跨測試的副作用。如果有全局影響，應該在 teardown 中恢復原狀。

## 程式碼範例

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from myapp.models import Base, User
from myapp.services import UserService


# 基本 fixture
@pytest.fixture
def sample_user():
    """創建示例用戶"""
    return User(id=1, email="test@example.com", name="Test User")


def test_user_name(sample_user):
    """測試使用 fixture"""
    assert sample_user.name == "Test User"


# 使用 yield 進行清理
@pytest.fixture
def db_connection():
    """創建數據庫連接"""
    engine = create_engine("sqlite:///:memory:")
    connection = engine.connect()
    
    # Setup
    Base.metadata.create_all(connection)
    
    # 提供資源給測試
    yield connection
    
    # Teardown：無論測試成功或失敗都會執行
    connection.close()
    engine.dispose()


# Fixture 作用域示例
@pytest.fixture(scope="session")
def app_config():
    """應用配置（session 級別，只創建一次）"""
    return {
        "database_url": "postgresql://localhost/test",
        "debug": True,
        "secret_key": "test_secret"
    }


@pytest.fixture(scope="module")
def database_engine(app_config):
    """數據庫引擎（module 級別，模塊共享）"""
    engine = create_engine(app_config["database_url"])
    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture(scope="function")
def db_session(database_engine):
    """數據庫會話（function 級別，每個測試獨立）"""
    connection = database_engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


# Fixture 依賴鏈
@pytest.fixture
def user_service(db_session):
    """用戶服務（依賴 db_session fixture）"""
    return UserService(db_session)


def test_create_user(user_service, db_session):
    """測試創建用戶"""
    user = user_service.create_user("new@example.com", "New User")
    assert user.id is not None
    
    # 驗證數據庫中確實創建了用戶
    db_user = db_session.query(User).filter_by(email="new@example.com").first()
    assert db_user is not None


# Fixture 參數化
@pytest.fixture(params=["postgresql", "mysql", "sqlite"])
def database_type(request):
    """參數化的數據庫類型"""
    return request.param


def test_database_compatibility(database_type):
    """此測試會針對三種數據庫執行"""
    connection = create_connection(database_type)
    assert connection is not None


# 參數化 fixture 的高級用法
@pytest.fixture(params=[
    pytest.param("postgres", marks=pytest.mark.slow),
    pytest.param("sqlite", marks=pytest.mark.fast),
])
def db_backend(request):
    """帶標記的參數化 fixture"""
    return request.param


# 使用 addfinalizer 進行清理
@pytest.fixture
def temporary_file(request):
    """創建臨時文件"""
    import tempfile
    
    fd, path = tempfile.mkstemp()
    
    def cleanup():
        import os
        os.close(fd)
        os.unlink(path)
    
    request.addfinalizer(cleanup)
    
    return path


# autouse fixture
@pytest.fixture(autouse=True)
def reset_global_state():
    """自動重置全局狀態"""
    # Setup
    from myapp import cache
    cache.clear()
    
    yield
    
    # Teardown
    cache.clear()


# Factory fixture（工廠模式）
@pytest.fixture
def user_factory(db_session):
    """用戶工廠 fixture"""
    created_users = []
    
    def create_user(email=None, name="Test User", **kwargs):
        if email is None:
            import uuid
            email = f"{uuid.uuid4()}@example.com"
        
        user = User(email=email, name=name, **kwargs)
        db_session.add(user)
        db_session.commit()
        created_users.append(user)
        return user
    
    yield create_user
    
    # 清理所有創建的用戶
    for user in created_users:
        db_session.delete(user)
    db_session.commit()


def test_multiple_users(user_factory):
    """使用工廠 fixture 創建多個用戶"""
    user1 = user_factory(name="User 1")
    user2 = user_factory(name="User 2")
    user3 = user_factory(name="User 3")
    
    assert user1.id != user2.id
    assert user2.id != user3.id


# Fixture 與 Mock 結合
@pytest.fixture
def mock_email_service(mocker):
    """Mock 郵件服務"""
    mock_service = mocker.Mock()
    mock_service.send_email.return_value = True
    return mock_service


def test_user_registration_sends_email(db_session, mock_email_service, mocker):
    """測試用戶註冊發送郵件"""
    # 將 mock 注入到服務中
    mocker.patch('myapp.services.email_service', mock_email_service)
    
    service = UserService(db_session)
    user = service.register_user("test@example.com", "password")
    
    # 驗證郵件服務被調用
    mock_email_service.send_email.assert_called_once_with(
        to=user.email,
        subject="歡迎註冊"
    )


# conftest.py 中的共享 fixture 示例
# 文件: tests/conftest.py
"""
import pytest
from myapp import create_app
from myapp.models import db


@pytest.fixture(scope="session")
def app():
    # 創建測試應用
    app = create_app("testing")
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    # 創建測試客戶端
    return app.test_client()


@pytest.fixture
def runner(app):
    # 創建 CLI 測試 runner
    return app.test_cli_runner()
"""


# 使用 conftest 中的 fixture
def test_homepage(client):
    """測試首頁"""
    response = client.get("/")
    assert response.status_code == 200


# Fixture 的內省和調試
def test_with_fixture_info(request):
    """訪問 fixture 信息"""
    # request 是一個特殊的 fixture，提供測試上下文信息
    print(f"測試名稱: {request.node.name}")
    print(f"測試文件: {request.node.fspath}")
    
    # 可以訪問 fixture 的信息
    for fixture_name in request.fixturenames:
        print(f"使用的 fixture: {fixture_name}")


# 條件 fixture
@pytest.fixture
def cache_backend(request):
    """根據環境變量選擇緩存後端"""
    import os
    
    backend = os.getenv("CACHE_BACKEND", "memory")
    
    if backend == "redis":
        from redis import Redis
        client = Redis()
        yield client
        client.flushdb()
    else:
        from myapp.cache import MemoryCache
        cache = MemoryCache()
        yield cache
        cache.clear()


# Fixture 別名
@pytest.fixture
def db(db_session):
    """為 db_session 創建別名"""
    return db_session


# 組合複雜的測試場景
@pytest.fixture
def authenticated_client(client, user_factory):
    """已認證的測試客戶端"""
    user = user_factory(email="auth@example.com")
    user.set_password("password")
    
    # 登錄
    client.post("/login", data={
        "email": "auth@example.com",
        "password": "password"
    })
    
    return client


def test_protected_endpoint(authenticated_client):
    """測試需要認證的端點"""
    response = authenticated_client.get("/profile")
    assert response.status_code == 200
```

## 相關主題

- [pytest 框架深入解析](./pytest_framework.md)
- [單元測試最佳實踐](./unit_testing_best_practices.md)
- [Mock 與 Patch 技巧](./mocking_and_patching.md)
