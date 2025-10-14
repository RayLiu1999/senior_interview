# pytest 框架深入解析

- **難度**: 6
- **標籤**: `pytest`, `Testing`, `Fixtures`

## 問題詳述

pytest 是 Python 最流行的測試框架，相比 unittest 更加簡潔和強大。如何充分利用 pytest 的特性編寫高質量的測試代碼？

## 核心理論與詳解

### pytest 核心特性

**1. 簡潔的測試語法**
- 使用普通的 `assert` 語句，無需記憶特殊的斷言方法
- 自動發現測試文件和測試函數（以 `test_` 開頭）
- 豐富的斷言失敗信息，自動展示比較細節

**2. Fixtures 機制**
- **定義**：pytest 的依賴注入系統，用於準備測試環境
- **作用域**：function、class、module、package、session
- **特點**：可重用、可組合、支持參數化

**3. 參數化測試**
- 使用 `@pytest.mark.parametrize` 裝飾器
- 同一測試邏輯測試多組數據
- 減少代碼重複，提高測試覆蓋率

**4. 插件生態**
- pytest-cov：測試覆蓋率
- pytest-mock：Mock 支持
- pytest-asyncio：異步測試
- pytest-xdist：並行測試

### Fixtures 詳解

**作用域控制**
```python
# function 作用域（默認）- 每個測試函數執行一次
@pytest.fixture
def db_connection():
    conn = create_connection()
    yield conn
    conn.close()

# session 作用域 - 整個測試會話執行一次
@pytest.fixture(scope="session")
def app():
    app = create_app()
    yield app
    app.cleanup()
```

**Fixture 依賴**
- Fixture 可以依賴其他 fixture
- 自動解析依賴關係
- 支持多層嵌套

**autouse 選項**
- 自動應用到所有測試
- 無需顯式聲明
- 適用於全局配置

### 標記 (Markers)

**內置標記**
- `@pytest.mark.skip`：跳過測試
- `@pytest.mark.skipif`：條件跳過
- `@pytest.mark.xfail`：預期失敗
- `@pytest.mark.parametrize`：參數化

**自定義標記**
```python
# 在 pytest.ini 中註冊
[tool:pytest]
markers =
    slow: marks tests as slow
    integration: marks tests as integration tests

# 使用標記
@pytest.mark.slow
def test_heavy_computation():
    pass

# 運行特定標記的測試
# pytest -m "not slow"
```

### 配置文件

**pytest.ini**
- 項目級配置
- 測試發現規則
- 命令行選項默認值

**conftest.py**
- 共享 fixtures
- 插件配置
- Hooks 實現

### 常用插件

**pytest-cov**
```bash
pytest --cov=myapp --cov-report=html
```

**pytest-mock**
- 基於 unittest.mock
- 提供 mocker fixture
- 自動清理 mock

**pytest-asyncio**
- 支持 async/await 測試
- 提供 event loop fixture
- 異步 fixture 支持

### 最佳實踐

1. **測試命名清晰**：`test_<功能>_<場景>_<預期結果>`
2. **使用 Fixture**：避免重複的 setup/teardown 代碼
3. **參數化測試**：提高測試覆蓋率，減少代碼重複
4. **適當使用標記**：組織和過濾測試
5. **保持測試獨立**：每個測試應該能獨立運行
6. **使用 conftest.py**：共享測試配置和 fixtures

## 程式碼範例

```python
import pytest
from myapp import UserService, Database

# Fixture 示例
@pytest.fixture(scope="module")
def db():
    """模塊級數據庫連接"""
    database = Database()
    database.connect()
    yield database
    database.disconnect()

@pytest.fixture
def user_service(db):
    """依賴數據庫的服務"""
    return UserService(db)

# 參數化測試
@pytest.mark.parametrize("username,expected", [
    ("alice", True),
    ("", False),
    ("a" * 100, False),
])
def test_validate_username(user_service, username, expected):
    """測試用戶名驗證"""
    result = user_service.validate_username(username)
    assert result == expected

# 使用 fixture
def test_create_user(user_service):
    """測試創建用戶"""
    user = user_service.create_user("alice", "alice@example.com")
    assert user.username == "alice"
    assert user.email == "alice@example.com"

# 測試異常
def test_create_duplicate_user(user_service):
    """測試創建重複用戶"""
    user_service.create_user("alice", "alice@example.com")
    
    with pytest.raises(ValueError, match="User already exists"):
        user_service.create_user("alice", "alice@example.com")

# 標記測試
@pytest.mark.slow
def test_batch_process(user_service):
    """測試批量處理（慢速測試）"""
    users = [f"user{i}" for i in range(1000)]
    results = user_service.batch_create(users)
    assert len(results) == 1000

# 使用 mocker
def test_external_api_call(user_service, mocker):
    """測試外部 API 調用"""
    mock_response = {"status": "success"}
    mocker.patch.object(
        user_service, 
        'call_external_api', 
        return_value=mock_response
    )
    
    result = user_service.process_with_api("alice")
    assert result["status"] == "success"
```

## 相關資源

- [pytest 官方文檔](https://docs.pytest.org/)
- [pytest fixtures 指南](https://docs.pytest.org/en/stable/fixture.html)
- [Python Testing with pytest](https://pragprog.com/titles/bopytest/) - 書籍
