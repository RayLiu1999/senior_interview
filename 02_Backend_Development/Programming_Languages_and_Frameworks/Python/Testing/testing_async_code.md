# 異步代碼測試

- **難度**: 8
- **重要程度**: 4
- **標籤**: `Async`, `asyncio`, `pytest-asyncio`

## 問題詳述

探討如何在 Python 中測試異步代碼，包括使用 pytest-asyncio 插件、處理異步 fixture、測試協程函數以及模擬異步依賴的技巧和最佳實踐。

## 核心理論與詳解

### 異步編程的測試挑戰

**異步代碼的複雜性**：異步編程引入了事件循環、協程、Future 等概念，使代碼執行流程變得非線性。測試異步代碼需要處理並發、時序、事件循環管理等額外複雜性。

**同步測試框架的限制**：標準的測試框架（如 unittest）設計用於同步代碼。直接測試異步函數會遇到問題，因為需要在事件循環中運行協程。

**時序和競態條件**：異步代碼的執行順序不確定，可能導致難以重現的測試失敗。測試需要考慮各種可能的執行順序。

### pytest-asyncio 插件

**核心功能**：pytest-asyncio 是 pytest 的官方異步支持插件，它允許直接編寫異步測試函數，並自動管理事件循環。

**安裝與配置**：通過 `pip install pytest-asyncio` 安裝。在測試函數上使用 `@pytest.mark.asyncio` 標記，或配置自動標記模式。

**事件循環管理**：pytest-asyncio 為每個測試創建和管理獨立的事件循環，確保測試隔離。可以通過 fixture 自定義事件循環的配置。

### 異步測試函數

**async def 測試**：測試函數使用 `async def` 定義，並標記 `@pytest.mark.asyncio`。在測試中可以使用 `await` 調用異步函數。

**自動模式**：通過配置 `asyncio_mode = "auto"`，pytest-asyncio 可以自動識別異步測試函數，無需手動添加標記。

**測試協程**：直接測試返回協程的函數時，需要 `await` 其結果以獲得實際的返回值或異常。

### 異步 Fixture

**定義異步 Fixture**：Fixture 函數也可以是異步的，使用 `async def` 定義。pytest-asyncio 會在事件循環中執行這些 fixture。

**異步 setup/teardown**：異步 fixture 可以使用 `yield` 語法進行資源清理，清理代碼同樣是異步的。

**Fixture 作用域**：異步 fixture 支持所有作用域（function、class、module、session）。但 session 和 module 級別的異步 fixture 需要特別注意事件循環的生命週期。

### 事件循環 Fixture

**event_loop Fixture**：pytest-asyncio 提供的內建 fixture，用於訪問當前測試的事件循環。可以自定義此 fixture 來配置事件循環。

**循環策略**：可以通過重寫 `event_loop` fixture 來使用自定義的事件循環策略，如 uvloop 以獲得更好的性能。

**循環作用域**：默認情況下，每個測試函數有獨立的事件循環（function 作用域）。可以配置為更大的作用域，但需要注意測試隔離。

### 測試異步 HTTP 客戶端

**aiohttp 測試**：測試使用 aiohttp 的異步 HTTP 客戶端時，可以使用 aiohttp 提供的測試工具，如 `aiohttp.test_utils`。

**httpx 測試**：httpx 是另一個流行的異步 HTTP 庫，提供了 `AsyncClient` 用於測試，它可以直接與 ASGI 應用集成。

**Mock HTTP 響應**：使用 aioresponses 或 respx 庫來 mock 異步 HTTP 請求，避免真實的網絡調用。

### 測試 FastAPI 異步端點

**TestClient**：FastAPI 提供的 `TestClient` 是基於 Starlette 的測試客戶端，它可以測試同步和異步端點，自動處理事件循環。

**AsyncClient**：對於需要測試異步上下文（如異步依賴）的場景，使用 `httpx.AsyncClient` 配合 pytest-asyncio。

**依賴覆蓋**：在測試中可以覆蓋 FastAPI 的依賴，包括異步依賴，以注入 mock 或測試數據。

### Mock 異步函數

**AsyncMock**：Python 3.8+ 的 unittest.mock 提供了 `AsyncMock`，專門用於 mock 異步函數和方法。

**返回協程**：Mock 異步函數時，需要返回可等待的對象。`AsyncMock` 自動處理這一點，使 mock 可以被 `await`。

**副作用**：可以為 `AsyncMock` 設置異步副作用，模擬異步操作的各種行為，包括異常。

### 處理異步上下文管理器

**測試 async with**：測試使用 `async with` 的異步上下文管理器時，需要在異步測試函數中操作。

**Mock 上下文管理器**：可以使用 `AsyncMock` 配合 `__aenter__` 和 `__aexit__` 來 mock 異步上下文管理器。

### 測試並發行為

**多任務測試**：測試並發執行的多個任務時，使用 `asyncio.gather()` 或 `asyncio.create_task()` 來並行運行。

**競態條件測試**：雖然難以可靠地測試競態條件，但可以通過多次重複運行或使用 `asyncio.sleep(0)` 來增加任務切換的機會。

**超時控制**：使用 `asyncio.wait_for()` 或 `pytest.mark.timeout` 為異步測試設置超時，防止測試掛起。

### 測試異步迭代器和生成器

**async for 測試**：測試異步迭代器時，需要在異步上下文中使用 `async for` 遍歷。

**Mock 異步生成器**：可以創建簡單的異步生成器函數來模擬異步數據流。

### 數據庫異步操作測試

**asyncpg / aiomysql**：測試使用異步數據庫驅動的代碼時，可以使用真實的數據庫連接或 mock。

**SQLAlchemy 異步**：SQLAlchemy 1.4+ 支持異步操作。測試時需要使用異步 session 和異步查詢。

**事務管理**：異步數據庫測試中的事務管理與同步版本類似，使用 `async with` 管理事務上下文。

### 時間和延遲的測試

**Mock 時間**：使用 `asyncio.sleep(0)` 來模擬任務切換而不實際延遲。對於需要測試超時的場景，可以使用 `pytest-asyncio` 的時間控制工具或 `freezegun`。

**加速測試**：避免在測試中使用長時間的 `await asyncio.sleep()`。如果必須測試超時行為，使用更短的超時值或 mock 時間。

### 異步測試的最佳實踐

**保持測試簡單**：異步測試已經比同步測試複雜，應該避免在測試中引入不必要的異步邏輯。

**明確等待**：使用 `await` 明確等待異步操作完成。避免創建協程但不等待，這會導致測試無法捕獲異常。

**測試隔離**：確保異步測試之間完全隔離，避免共享事件循環狀態或未完成的任務。

**異常處理**：測試異步代碼的異常處理時，使用 `pytest.raises` 配合 `async with` 或直接在異步函數中捕獲。

**資源清理**：使用異步 fixture 的 yield 語法確保異步資源（連接、客戶端）被正確清理。

## 程式碼範例

```python
import pytest
import asyncio
from unittest.mock import AsyncMock, patch
import aiohttp
from myapp.services import AsyncUserService
from myapp.repositories import AsyncUserRepository


# 基本的異步測試
@pytest.mark.asyncio
async def test_async_function():
    """測試簡單的異步函數"""
    async def fetch_data():
        await asyncio.sleep(0.1)
        return {"data": "value"}
    
    result = await fetch_data()
    assert result["data"] == "value"


# 異步 fixture
@pytest.fixture
async def async_client():
    """創建異步 HTTP 客戶端"""
    async with aiohttp.ClientSession() as session:
        yield session


@pytest.mark.asyncio
async def test_with_async_fixture(async_client):
    """使用異步 fixture 的測試"""
    # 可以使用異步客戶端發起請求
    assert async_client is not None


# 自定義事件循環
@pytest.fixture
def event_loop():
    """自定義事件循環（使用 uvloop）"""
    import uvloop
    loop = uvloop.new_event_loop()
    yield loop
    loop.close()


# 測試異步服務
@pytest.fixture
async def user_service():
    """創建用戶服務"""
    repo = AsyncUserRepository()
    service = AsyncUserService(repo)
    yield service
    await service.close()


@pytest.mark.asyncio
async def test_create_user(user_service):
    """測試創建用戶"""
    user = await user_service.create_user(
        email="test@example.com",
        name="Test User"
    )
    
    assert user.id is not None
    assert user.email == "test@example.com"


# Mock 異步函數
@pytest.mark.asyncio
async def test_with_async_mock():
    """使用 AsyncMock 測試"""
    mock_repo = AsyncMock()
    mock_repo.get_user.return_value = {
        "id": 1,
        "email": "test@example.com"
    }
    
    service = AsyncUserService(mock_repo)
    user = await service.get_user(1)
    
    assert user["email"] == "test@example.com"
    mock_repo.get_user.assert_called_once_with(1)


# 測試異常處理
@pytest.mark.asyncio
async def test_async_exception():
    """測試異步函數拋出異常"""
    async def failing_function():
        await asyncio.sleep(0.1)
        raise ValueError("Something went wrong")
    
    with pytest.raises(ValueError, match="Something went wrong"):
        await failing_function()


# 測試並發操作
@pytest.mark.asyncio
async def test_concurrent_operations():
    """測試並發執行多個異步操作"""
    async def fetch_data(id):
        await asyncio.sleep(0.1)
        return {"id": id, "data": f"value_{id}"}
    
    # 並發執行多個任務
    results = await asyncio.gather(
        fetch_data(1),
        fetch_data(2),
        fetch_data(3)
    )
    
    assert len(results) == 3
    assert results[0]["id"] == 1
    assert results[1]["id"] == 2


# 測試超時
@pytest.mark.asyncio
async def test_timeout():
    """測試超時行為"""
    async def slow_operation():
        await asyncio.sleep(5)
        return "done"
    
    with pytest.raises(asyncio.TimeoutError):
        await asyncio.wait_for(slow_operation(), timeout=0.1)


# 測試 FastAPI 異步端點
from fastapi import FastAPI
from httpx import AsyncClient

app = FastAPI()

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    await asyncio.sleep(0.1)  # 模擬異步操作
    return {"id": user_id, "name": "Test User"}


@pytest.mark.asyncio
async def test_fastapi_async_endpoint():
    """測試 FastAPI 異步端點"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/users/1")
        assert response.status_code == 200
        assert response.json()["id"] == 1


# 測試異步上下文管理器
class AsyncDatabase:
    async def __aenter__(self):
        await self.connect()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.disconnect()
    
    async def connect(self):
        await asyncio.sleep(0.1)
        self.connected = True
    
    async def disconnect(self):
        await asyncio.sleep(0.1)
        self.connected = False


@pytest.mark.asyncio
async def test_async_context_manager():
    """測試異步上下文管理器"""
    db = AsyncDatabase()
    
    async with db:
        assert db.connected is True
    
    assert db.connected is False


# Mock 異步上下文管理器
@pytest.mark.asyncio
async def test_mock_async_context_manager():
    """Mock 異步上下文管理器"""
    mock_db = AsyncMock()
    mock_db.__aenter__.return_value = mock_db
    mock_db.query.return_value = [{"id": 1}]
    
    async with mock_db as db:
        results = await db.query("SELECT * FROM users")
    
    assert len(results) == 1
    mock_db.__aenter__.assert_called_once()
    mock_db.__aexit__.assert_called_once()


# 測試異步迭代器
async def async_range(n):
    """異步生成器"""
    for i in range(n):
        await asyncio.sleep(0.01)
        yield i


@pytest.mark.asyncio
async def test_async_iterator():
    """測試異步迭代器"""
    results = []
    async for value in async_range(5):
        results.append(value)
    
    assert results == [0, 1, 2, 3, 4]


# 使用 aioresponses mock HTTP 請求
from aioresponses import aioresponses

@pytest.mark.asyncio
async def test_mock_aiohttp_request():
    """Mock aiohttp 請求"""
    with aioresponses() as mocked:
        mocked.get(
            'http://api.example.com/users/1',
            payload={'id': 1, 'name': 'Test'}
        )
        
        async with aiohttp.ClientSession() as session:
            async with session.get('http://api.example.com/users/1') as resp:
                data = await resp.json()
                assert data['id'] == 1


# 測試異步數據庫操作（SQLAlchemy）
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

@pytest.fixture
async def async_db_session():
    """創建異步數據庫會話"""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        yield session
    
    await engine.dispose()


@pytest.mark.asyncio
async def test_async_database_operation(async_db_session):
    """測試異步數據庫操作"""
    from sqlalchemy import select
    from myapp.models import User
    
    # 創建用戶
    user = User(email="test@example.com", name="Test")
    async_db_session.add(user)
    await async_db_session.commit()
    
    # 查詢用戶
    result = await async_db_session.execute(
        select(User).where(User.email == "test@example.com")
    )
    found_user = result.scalar_one()
    
    assert found_user.name == "Test"


# 參數化異步測試
@pytest.mark.asyncio
@pytest.mark.parametrize("user_id,expected_name", [
    (1, "User 1"),
    (2, "User 2"),
    (3, "User 3"),
])
async def test_parametrized_async(user_id, expected_name):
    """參數化的異步測試"""
    async def get_user(id):
        await asyncio.sleep(0.1)
        return {"id": id, "name": f"User {id}"}
    
    user = await get_user(user_id)
    assert user["name"] == expected_name


# 測試異步後台任務
@pytest.mark.asyncio
async def test_background_task():
    """測試異步後台任務"""
    task_completed = False
    
    async def background_task():
        nonlocal task_completed
        await asyncio.sleep(0.1)
        task_completed = True
    
    # 創建後台任務
    task = asyncio.create_task(background_task())
    
    # 等待任務完成
    await task
    
    assert task_completed is True


# 配置自動異步測試模式（pytest.ini 或 pyproject.toml）
"""
# pytest.ini
[pytest]
asyncio_mode = auto

# pyproject.toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
"""
```

## 相關主題

- [pytest 框架深入解析](./pytest_framework.md)
- [Mock 與 Patch 技巧](./mocking_and_patching.md)
- [FastAPI 異步路由處理](../Frameworks/FastAPI/async_route_handlers.md)
- [Python 併發模型：多執行緒 vs. 多進程 vs. 異步](../Concurrency/threading_vs_multiprocessing_vs_asyncio.md)
