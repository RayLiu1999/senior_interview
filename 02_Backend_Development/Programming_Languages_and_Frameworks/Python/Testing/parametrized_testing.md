# 參數化測試

- **難度**: 5
- **重要程度**: 4
- **標籤**: `Parametrize`, `Data-Driven`, `pytest`

## 問題詳述

探討如何在 Python 中使用參數化測試來減少重複的測試代碼，通過一個測試函數測試多組輸入輸出，提高測試的可維護性和可讀性。

## 核心理論與詳解

### 參數化測試的概念

**參數化測試（Parametrized Testing）** 允許開發者使用不同的參數集合多次運行同一個測試函數。這種技術特別適合需要測試多種輸入組合的場景，避免編寫大量重複的測試代碼。參數化測試遵循 DRY（Don't Repeat Yourself）原則，使測試更簡潔和易於維護。

### 為什麼需要參數化測試

在實際開發中，同一個函數或方法通常需要用多組不同的輸入來驗證其行為。如果為每組輸入編寫獨立的測試函數，會導致代碼冗餘，增加維護成本。當測試邏輯需要修改時，需要同時更新所有相似的測試。參數化測試將測試邏輯抽取為單一函數，只需維護一份測試代碼。

### pytest.mark.parametrize 裝飾器

**基本語法**：`@pytest.mark.parametrize("param_names", [values])` 是 pytest 提供的參數化裝飾器。第一個參數是字符串，定義參數名稱（可以是多個，用逗號分隔）；第二個參數是包含測試數據的列表或元組。

**參數傳遞機制**：pytest 會為列表中的每組參數生成一個測試實例。測試函數的參數名必須與裝飾器中定義的參數名匹配。執行時，pytest 會依次將每組參數注入到測試函數中。

**測試 ID 生成**：pytest 會為每個參數化的測試實例自動生成唯一的測試 ID。默認 ID 基於參數值生成，也可以通過 `ids` 參數自定義更易讀的測試 ID。

### 單參數參數化

最簡單的參數化形式是為單個參數提供多個值。例如，測試一個函數對不同輸入的返回值。這種方式清晰直觀，適合測試純函數或簡單的輸入輸出關係。

### 多參數參數化

當測試需要多個輸入參數時，可以在 `parametrize` 中定義多個參數名，並以元組的形式提供參數組合。每個元組代表一組完整的測試輸入。這種方式適合測試具有多個參數的函數。

### 使用元組和字典傳參

**元組形式**：`[(input1, input2, expected), ...]` 是最常見的參數化方式，簡潔明了。參數按位置對應。

**字典形式**：雖然 pytest 不直接支持字典參數化，但可以通過解包字典實現命名參數的效果，提高可讀性。

**命名元組**：使用 `namedtuple` 可以兼具元組的效率和字典的可讀性，特別適合參數較多的情況。

### 自定義測試 ID

**使用 ids 參數**：通過 `ids` 參數可以為每個測試實例指定自定義的標識符。這使得測試報告更易讀，特別是在測試失敗時能快速識別問題案例。

**id 生成函數**：可以傳入一個函數作為 `ids` 參數，動態生成測試 ID。函數接收參數值作為輸入，返回字符串作為測試 ID。

**使用 pytest.param**：`pytest.param()` 提供了更靈活的參數定義方式，可以為單個參數組合指定 id、marks 等元數據。

### 多層參數化

可以在同一個測試函數上堆疊多個 `@pytest.mark.parametrize` 裝飾器。pytest 會生成所有參數組合的笛卡爾積，創建全部可能的測試實例。這適合測試多個維度的組合場景。

### 條件參數化與跳過

**使用 marks**：通過 `pytest.param` 的 `marks` 參數可以為特定參數組合添加標記，如 `pytest.mark.skip` 或 `pytest.mark.xfail`。這允許在參數化中靈活控制測試行為。

**條件跳過**：結合 `skipif` 可以根據條件動態跳過某些參數組合，適合處理環境相關或版本相關的測試。

### 參數化與 Fixtures 結合

參數化不僅可以應用於測試函數，還可以應用於 fixtures。通過 `params` 參數在 fixture 中實現參數化，可以為使用該 fixture 的所有測試提供多組數據。這是一種更高級的重用方式。

**Fixture 參數化語法**：在 `@pytest.fixture` 裝飾器中使用 `params` 參數。fixture 函數通過 `request.param` 訪問當前參數值。

### 從外部文件載入測試數據

對於大量測試數據，可以從外部文件（CSV、JSON、YAML）載入。這種方式將測試數據與測試邏輯分離，便於維護和更新。可以使用輔助函數讀取文件並生成參數列表。

### 參數化最佳實踐

**保持參數集合清晰**：測試數據應該具有描述性，清楚表達測試意圖。使用有意義的變量名和測試 ID。

**覆蓋邊界條件**：參數化是測試邊界值的絕佳方式。確保包含正常值、邊界值、極端值和異常值。

**避免過度參數化**：如果參數組合過多導致測試執行時間過長，考慮拆分測試或使用假設測試（hypothesis）。

**測試失敗隔離**：參數化測試中，一個參數組合失敗不會影響其他組合的執行，這有助於快速識別所有問題。

### unittest 的參數化

雖然標準庫的 `unittest` 不直接支持參數化，但可以使用 `parameterized` 第三方庫或 `subTest` 上下文管理器實現類似功能。不過 pytest 的參數化支持更強大和靈活。

## 程式碼範例

```python
import pytest
from decimal import Decimal
from myapp.calculator import Calculator
from myapp.validators import validate_email, validate_phone


# 基本的單參數參數化
@pytest.mark.parametrize("value,expected", [
    (2, 4),
    (3, 9),
    (4, 16),
    (5, 25),
    (0, 0),
    (-2, 4),
])
def test_square_function(value, expected):
    """測試平方函數"""
    assert value ** 2 == expected


# 多參數參數化
@pytest.mark.parametrize("a,b,expected", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
    (100, 200, 300),
    (0.1, 0.2, 0.3),
])
def test_addition(a, b, expected):
    """測試加法運算"""
    calculator = Calculator()
    result = calculator.add(a, b)
    assert result == pytest.approx(expected)


# 使用自定義測試 ID
@pytest.mark.parametrize("email,is_valid", [
    ("user@example.com", True),
    ("invalid-email", False),
    ("user@", False),
    ("@example.com", False),
    ("user+tag@example.co.uk", True),
], ids=["valid_email", "missing_at", "missing_domain", "missing_user", "with_tag"])
def test_email_validation(email, is_valid):
    """測試郵箱驗證"""
    assert validate_email(email) == is_valid


# 使用 pytest.param 添加標記
@pytest.mark.parametrize("value,expected", [
    pytest.param(1, 1, id="one"),
    pytest.param(2, 4, id="two"),
    pytest.param(3, 9, id="three"),
    pytest.param(1000, 1000000, id="large", marks=pytest.mark.slow),
    pytest.param(-1, 1, id="negative"),
])
def test_square_with_marks(value, expected):
    """帶標記的參數化測試"""
    assert value ** 2 == expected


# 測試異常情況的參數化
@pytest.mark.parametrize("dividend,divisor,expected_exception", [
    (10, 0, ZeroDivisionError),
    ("10", 2, TypeError),
    (10, "2", TypeError),
])
def test_division_errors(dividend, divisor, expected_exception):
    """測試除法的異常情況"""
    calculator = Calculator()
    with pytest.raises(expected_exception):
        calculator.divide(dividend, divisor)


# 多層參數化（笛卡爾積）
@pytest.mark.parametrize("x", [1, 2, 3])
@pytest.mark.parametrize("y", [10, 20])
def test_multiplication_combinations(x, y):
    """測試乘法的各種組合"""
    # 這將生成 3 * 2 = 6 個測試實例
    result = x * y
    assert result == x * y
    assert result > 0


# 使用命名元組提高可讀性
from collections import namedtuple

TestCase = namedtuple('TestCase', ['input', 'expected', 'description'])

test_cases = [
    TestCase("valid@email.com", True, "標準郵箱"),
    TestCase("user+filter@domain.co", True, "帶過濾器的郵箱"),
    TestCase("invalid", False, "無效格式"),
]

@pytest.mark.parametrize("test_case", test_cases, ids=lambda tc: tc.description)
def test_email_with_namedtuple(test_case):
    """使用命名元組的參數化測試"""
    assert validate_email(test_case.input) == test_case.expected


# Fixture 參數化
@pytest.fixture(params=[
    "postgresql",
    "mysql",
    "sqlite",
])
def database_connection(request):
    """參數化的數據庫連接 fixture"""
    db_type = request.param
    # 根據數據庫類型創建連接
    connection = create_connection(db_type)
    yield connection
    connection.close()


def test_query_execution(database_connection):
    """此測試會針對每種數據庫執行"""
    result = database_connection.execute("SELECT 1")
    assert result is not None


# 從函數生成參數
def generate_test_data():
    """動態生成測試數據"""
    return [
        (i, i * 2, i * 2)
        for i in range(1, 6)
    ]


@pytest.mark.parametrize("input,multiplier,expected", generate_test_data())
def test_with_generated_data(input, multiplier, expected):
    """使用生成函數的參數化測試"""
    assert input * multiplier == expected


# 複雜場景：測試金額計算
@pytest.mark.parametrize("original_price,discount,tax_rate,expected", [
    (Decimal("100"), Decimal("0.1"), Decimal("0.05"), Decimal("94.50")),
    (Decimal("50"), Decimal("0"), Decimal("0.1"), Decimal("55.00")),
    (Decimal("200"), Decimal("0.5"), Decimal("0.2"), Decimal("120.00")),
], ids=["10%折扣5%稅", "無折扣10%稅", "50%折扣20%稅"])
def test_price_calculation(original_price, discount, tax_rate, expected):
    """測試價格計算（折扣後加稅）"""
    discounted = original_price * (1 - discount)
    final_price = discounted * (1 + tax_rate)
    assert final_price == expected


# 使用 pytest.param 跳過特定測試
@pytest.mark.parametrize("version,feature_available", [
    ("1.0", False),
    ("2.0", False),
    pytest.param("3.0", True, marks=pytest.mark.skip(reason="3.0 尚未發布")),
])
def test_feature_availability(version, feature_available):
    """測試功能在不同版本的可用性"""
    assert check_feature(version) == feature_available


# 條件跳過的參數化
import sys

@pytest.mark.parametrize("path", [
    "/usr/local/bin",
    pytest.param("/mnt/c/", marks=pytest.mark.skipif(
        sys.platform != "win32",
        reason="僅 Windows 路徑"
    )),
    "/home/user",
])
def test_path_exists(path):
    """測試路徑存在性"""
    # 測試邏輯
    pass


# 從 JSON 文件載入測試數據
import json

def load_test_data_from_json():
    """從 JSON 文件載入測試數據"""
    with open('test_data.json') as f:
        data = json.load(f)
    return [
        (item['input'], item['expected'])
        for item in data['test_cases']
    ]


# 使用載入的數據（需要確保文件存在）
# @pytest.mark.parametrize("input,expected", load_test_data_from_json())
# def test_with_json_data(input, expected):
#     assert process(input) == expected


# 組合多種參數化技術
class TestUserAuthentication:
    """用戶認證測試套件"""
    
    @pytest.mark.parametrize("username,password,should_succeed", [
        ("admin", "correct_password", True),
        ("admin", "wrong_password", False),
        ("", "password", False),
        ("user", "", False),
    ], ids=["正確憑證", "錯誤密碼", "空用戶名", "空密碼"])
    def test_login(self, username, password, should_succeed):
        """測試登錄功能"""
        result = authenticate(username, password)
        assert (result is not None) == should_succeed
    
    @pytest.mark.parametrize("role", ["admin", "user", "guest"])
    @pytest.mark.parametrize("action", ["read", "write", "delete"])
    def test_permissions(self, role, action):
        """測試不同角色的權限（9 個測試實例）"""
        has_permission = check_permission(role, action)
        # 根據角色和操作驗證權限
        if role == "admin":
            assert has_permission
        elif role == "guest" and action != "read":
            assert not has_permission
```

## 相關主題

- [pytest 框架深入解析](./pytest_framework.md)
- [單元測試最佳實踐](./unit_testing_best_practices.md)
- [測試固件與依賴注入](./fixtures_and_dependency_injection.md)
