# Mock 與 Patch 技巧

- **難度**: 7
- **標籤**: `Mock`, `unittest.mock`, `Patching`

## 問題詳述

在單元測試中，如何使用 Mock 和 Patch 技術隔離外部依賴，編寫獨立、可靠的測試代碼？

## 核心理論與詳解

### Mock 核心概念

**什麼是 Mock？**
- **定義**：創建模擬對象，用於替代真實依賴
- **目的**：隔離被測試代碼，避免外部依賴影響測試
- **應用場景**：數據庫、API 調用、文件系統、時間相關操作

**Mock 的優勢**
- 測試速度快（無需真實 I/O 操作）
- 測試可重複（不依賴外部環境）
- 可以模擬錯誤情況
- 驗證方法調用

### unittest.mock 核心組件

**1. Mock 對象**
```python
from unittest.mock import Mock

# 創建 Mock 對象
mock_obj = Mock()

# 配置返回值
mock_obj.method.return_value = 42

# 配置副作用
mock_obj.method.side_effect = [1, 2, 3]  # 依次返回
mock_obj.method.side_effect = Exception("Error")  # 拋出異常
```

**2. MagicMock**
- 自動實現魔術方法（`__str__`, `__len__` 等）
- 更適合模擬內置類型
- 通常優先使用 MagicMock

**3. patch 裝飾器/上下文管理器**
- 臨時替換對象
- 測試結束後自動恢復
- 支持多種使用方式

### Patch 技術

**基本用法**
```python
from unittest.mock import patch

# 裝飾器形式
@patch('module.ClassName')
def test_something(mock_class):
    pass

# 上下文管理器形式
def test_something():
    with patch('module.ClassName') as mock_class:
        pass

# 多個 patch
@patch('module.function2')
@patch('module.function1')
def test_something(mock_func1, mock_func2):
    # 注意：參數順序與裝飾器順序相反
    pass
```

**patch.object**
- 替換對象的屬性或方法
- 更精確的控制

**patch.dict**
- 臨時修改字典（如 os.environ）
- 測試配置相關代碼

### Mock 最佳實踐

**1. Patch 的目標位置**
- 在**使用位置** patch，而非定義位置
- 例如：patch `mymodule.requests.get` 而非 `requests.get`

**2. 驗證調用**
```python
mock_obj.method.assert_called_once()
mock_obj.method.assert_called_with(arg1, arg2)
mock_obj.method.assert_called_once_with(arg1, arg2)
mock_obj.method.assert_not_called()
```

**3. 使用 spec**
- 限制 Mock 對象的屬性和方法
- 防止拼寫錯誤
- 更接近真實對象

**4. 返回值配置**
- `return_value`：固定返回值
- `side_effect`：動態行為、多次返回、拋出異常

### 常見模式

**模擬數據庫操作**
```python
@patch('myapp.database.Session')
def test_user_creation(mock_session):
    mock_db = mock_session.return_value
    mock_db.query.return_value.filter.return_value.first.return_value = None
    
    service = UserService(mock_db)
    user = service.create_user("alice")
    
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
```

**模擬 API 調用**
```python
@patch('requests.get')
def test_fetch_data(mock_get):
    mock_response = Mock()
    mock_response.json.return_value = {"data": "test"}
    mock_response.status_code = 200
    mock_get.return_value = mock_response
    
    result = fetch_api_data()
    assert result["data"] == "test"
```

**模擬時間**
```python
@patch('time.time')
def test_timestamp(mock_time):
    mock_time.return_value = 1234567890
    result = get_timestamp()
    assert result == 1234567890
```

### pytest-mock 插件

**mocker fixture**
```python
def test_something(mocker):
    # 使用 mocker 代替 patch
    mock_func = mocker.patch('module.function')
    mock_func.return_value = 42
    
    # spy：部分 mock，保留原始功能
    spy = mocker.spy(obj, 'method')
```

**優勢**
- 自動清理
- 更簡潔的語法
- 與 pytest 深度集成

### 避免的陷阱

1. **過度使用 Mock**：只 mock 外部依賴，不要 mock 被測試代碼
2. **Patch 位置錯誤**：在使用位置 patch
3. **忽略驗證**：不僅要測試返回值，還要驗證調用
4. **Mock 過於複雜**：可能是設計問題，考慮重構
5. **忘記使用 spec**：可能導致測試通過但實際代碼錯誤

## 程式碼範例

```python
from unittest.mock import Mock, MagicMock, patch, call
import pytest

# 基本 Mock 使用
def test_basic_mock():
    # 創建 Mock
    mock_service = Mock()
    mock_service.get_user.return_value = {"name": "Alice"}
    
    # 調用
    result = mock_service.get_user(123)
    
    # 驗證
    assert result["name"] == "Alice"
    mock_service.get_user.assert_called_once_with(123)

# 使用 patch 裝飾器
@patch('myapp.external_api.requests.get')
def test_api_call(mock_get):
    # 配置 mock 響應
    mock_response = Mock()
    mock_response.json.return_value = {"status": "ok"}
    mock_response.status_code = 200
    mock_get.return_value = mock_response
    
    # 測試
    from myapp.external_api import fetch_data
    result = fetch_data("https://api.example.com")
    
    # 驗證
    assert result["status"] == "ok"
    mock_get.assert_called_once_with("https://api.example.com")

# 使用 patch.object
def test_patch_object():
    from myapp.services import UserService
    
    service = UserService()
    
    with patch.object(service, 'validate_email', return_value=True):
        result = service.create_user("alice", "invalid-email")
        # validate_email 被 mock，總是返回 True
        assert result is not None

# 使用 side_effect
@patch('random.randint')
def test_side_effect(mock_randint):
    # 多次調用返回不同值
    mock_randint.side_effect = [1, 2, 3]
    
    assert random.randint(1, 10) == 1
    assert random.randint(1, 10) == 2
    assert random.randint(1, 10) == 3

# 模擬異常
@patch('myapp.services.external_call')
def test_error_handling(mock_call):
    mock_call.side_effect = ConnectionError("Network error")
    
    from myapp.services import process_data
    
    with pytest.raises(ConnectionError):
        process_data()

# 使用 spec
def test_mock_with_spec():
    from myapp.models import User
    
    # 使用 spec 限制屬性
    mock_user = Mock(spec=User)
    mock_user.name = "Alice"
    mock_user.email = "alice@example.com"
    
    # 這會成功
    assert mock_user.name == "Alice"
    
    # 這會失敗（AttributeError），因為 User 沒有 invalid_attr
    # mock_user.invalid_attr = "test"

# pytest-mock 示例
def test_with_mocker(mocker):
    # 使用 mocker fixture
    mock_db = mocker.patch('myapp.database.get_connection')
    mock_db.return_value.query.return_value = [{"id": 1}]
    
    from myapp.services import get_users
    users = get_users()
    
    assert len(users) == 1
    mock_db.assert_called_once()

# 驗證多次調用
def test_multiple_calls():
    mock_logger = Mock()
    
    mock_logger.info("First call")
    mock_logger.info("Second call")
    mock_logger.error("Error call")
    
    # 驗證調用次數
    assert mock_logger.info.call_count == 2
    assert mock_logger.error.call_count == 1
    
    # 驗證所有調用
    mock_logger.info.assert_has_calls([
        call("First call"),
        call("Second call")
    ])
```

## 相關資源

- [unittest.mock 官方文檔](https://docs.python.org/3/library/unittest.mock.html)
- [pytest-mock 文檔](https://pytest-mock.readthedocs.io/)
- [Mock 最佳實踐](https://realpython.com/python-mock-library/)
