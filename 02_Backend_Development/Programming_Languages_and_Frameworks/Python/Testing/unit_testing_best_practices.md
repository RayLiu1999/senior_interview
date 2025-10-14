# 單元測試最佳實踐

- **難度**: 5
- **重要程度**: 5
- **標籤**: `Unit Test`, `Best Practices`, `Testing`

## 問題詳述

探討在 Python 中編寫高質量單元測試的最佳實踐，包括測試的組織、命名、隔離性、可讀性和維護性等方面的原則與技巧。

## 核心理論與詳解

### 單元測試的核心原則

單元測試應該遵循 **FIRST** 原則，這是編寫優質測試的基礎：

- **Fast（快速）**：單元測試應該能夠快速執行，通常在毫秒級別完成。快速的測試可以頻繁運行，提供即時反饋。
- **Independent（獨立）**：每個測試應該完全獨立，不依賴其他測試的執行順序或結果。測試之間不應該共享狀態。
- **Repeatable（可重複）**：測試應該在任何環境下都能產生相同的結果，不受外部因素（如時間、網絡）影響。
- **Self-Validating（自我驗證）**：測試應該有明確的 pass 或 fail 結果，不需要人工檢查日誌或輸出。
- **Timely（及時）**：測試應該在編寫生產代碼之前或同時編寫，遵循 TDD 實踐。

### 測試命名規範

良好的測試命名能夠清楚地表達測試意圖，建議使用以下模式：

**模式 1：`test_<method>_<scenario>_<expected_behavior>`**

這種命名方式包含三個要素：被測試的方法、測試場景和預期行為。例如 `test_divide_by_zero_raises_exception` 清楚地說明了當除數為零時應該拋出異常。

**模式 2：`test_should_<expected_behavior>_when_<scenario>`**

採用行為驅動的描述方式，例如 `test_should_return_empty_list_when_no_items_found` 強調了預期的結果和觸發條件。

**模式 3：使用中文描述**

在團隊允許的情況下，使用中文命名可以提高可讀性：`test_當用戶未登入時應該返回401錯誤`。

### AAA 模式（Arrange-Act-Assert）

每個測試應該清晰地分為三個階段，這種結構使測試邏輯一目了然：

**Arrange（準備階段）**：設置測試所需的前置條件，包括創建對象、準備測試數據和配置 mock。

**Act（執行階段）**：調用被測試的方法或函數，這通常只是一行代碼。

**Assert（斷言階段）**：驗證執行結果是否符合預期，包括返回值、狀態變化和副作用。

### 測試隔離與依賴管理

**使用 Fixtures 管理測試數據**：pytest 的 fixtures 提供了優雅的依賴注入機制，可以在測試之間共享設置邏輯，同時保持測試的獨立性。通過 scope 參數控制 fixture 的生命週期。

**Mock 外部依賴**：單元測試應該只測試目標代碼單元，所有外部依賴（數據庫、API、文件系統）都應該被 mock 或 stub 替代。這確保測試的快速性和可靠性。

**避免測試間的狀態洩漏**：每個測試應該清理自己產生的副作用。使用 fixture 的 yield 語法或 teardown 方法來確保清理工作的執行。

### 斷言最佳實踐

**一個測試一個邏輯斷言**：雖然可以有多個 assert 語句，但它們應該驗證同一個邏輯概念。如果測試需要驗證多個不相關的行為，應該拆分成多個測試。

**使用具體的斷言方法**：優先使用語義化的斷言方法（如 `assertEqual`、`assertIn`、`assertRaises`）而不是通用的 `assertTrue`。具體的斷言在失敗時能提供更有用的錯誤信息。

**斷言失敗信息**：在複雜的斷言中添加描述性的失敗消息，幫助快速定位問題：`assert result == expected, f"Expected {expected}, but got {result}"`。

### 測試覆蓋率與質量

**追求有意義的覆蓋率**：高覆蓋率不等於高質量測試。應該關注關鍵路徑、邊界條件和錯誤處理，而不是盲目追求 100% 覆蓋率。

**測試邊界條件**：確保測試包含邊界值、空值、null、極大極小值等特殊情況。這些場景往往是 bug 的高發區。

**測試異常路徑**：不僅要測試正常流程，還要測試各種異常情況和錯誤處理邏輯。使用 `pytest.raises` 驗證異常行為。

### 測試組織與結構

**鏡像生產代碼結構**：測試目錄結構應該鏡像生產代碼的結構，使測試文件易於查找。通常使用 `tests/` 目錄，並保持相同的模塊層次。

**使用測試類分組**：將相關的測試用例組織在測試類中，可以共享 setup 邏輯並提高可讀性。類名應該清楚表明測試的目標。

**適當的測試粒度**：單元測試應該測試單一的功能單元（函數、方法、類）。如果一個測試需要設置複雜的對象圖，可能是測試粒度過大的信號。

### 測試數據管理

**使用 Factory Pattern**：對於複雜的測試對象，使用 factory 函數或類（如 factory_boy）來創建測試數據。這提供了靈活性和可維護性。

**避免硬編碼測試數據**：測試數據應該具有描述性，能夠清楚表達測試意圖。避免使用無意義的魔術數字和字符串。

**參數化測試**：對於需要測試多組輸入的場景，使用 `pytest.mark.parametrize` 而不是複製測試代碼。這提高了測試的可維護性和可讀性。

### 持續改進與重構

**定期重構測試代碼**：測試代碼同樣需要維護和重構。消除重複、提取公共邏輯、改善命名都能提高測試的質量。

**快速失敗原則**：測試應該在發現問題時立即失敗，並提供清晰的錯誤信息。避免在斷言失敗後繼續執行。

**監控測試執行時間**：定期檢查測試套件的執行時間，識別和優化慢速測試。考慮將慢速測試分離到單獨的測試套件中。

## 程式碼範例

```python
import pytest
from decimal import Decimal
from myapp.services import PaymentService
from myapp.models import Payment, PaymentStatus


class TestPaymentService:
    """支付服務單元測試"""
    
    @pytest.fixture
    def payment_service(self, mocker):
        """創建支付服務實例，並 mock 外部依賴"""
        # Arrange: 準備 mock 對象
        mock_gateway = mocker.Mock()
        mock_repository = mocker.Mock()
        return PaymentService(mock_gateway, mock_repository)
    
    def test_should_create_payment_when_amount_is_valid(self, payment_service):
        """測試有效金額創建支付"""
        # Arrange
        amount = Decimal('100.00')
        user_id = 123
        
        # Act
        payment = payment_service.create_payment(user_id, amount)
        
        # Assert
        assert payment.amount == amount
        assert payment.user_id == user_id
        assert payment.status == PaymentStatus.PENDING
    
    @pytest.mark.parametrize("invalid_amount,expected_error", [
        (Decimal('0'), ValueError),
        (Decimal('-10.00'), ValueError),
        (None, TypeError),
    ])
    def test_should_raise_error_when_amount_is_invalid(
        self, payment_service, invalid_amount, expected_error
    ):
        """測試無效金額應該拋出錯誤"""
        # Arrange
        user_id = 123
        
        # Act & Assert
        with pytest.raises(expected_error):
            payment_service.create_payment(user_id, invalid_amount)
    
    def test_should_call_gateway_when_processing_payment(
        self, payment_service, mocker
    ):
        """測試處理支付時應該調用支付網關"""
        # Arrange
        payment = Payment(id=1, amount=Decimal('100.00'))
        mock_gateway = payment_service.gateway
        mock_gateway.charge.return_value = {'transaction_id': 'txn_123'}
        
        # Act
        result = payment_service.process_payment(payment)
        
        # Assert
        mock_gateway.charge.assert_called_once_with(
            amount=payment.amount,
            payment_id=payment.id
        )
        assert result['transaction_id'] == 'txn_123'
    
    def test_should_update_status_when_payment_succeeds(
        self, payment_service, mocker
    ):
        """測試支付成功時應該更新狀態"""
        # Arrange
        payment = Payment(id=1, status=PaymentStatus.PENDING)
        payment_service.gateway.charge.return_value = {'success': True}
        
        # Act
        payment_service.process_payment(payment)
        
        # Assert
        assert payment.status == PaymentStatus.COMPLETED
        payment_service.repository.save.assert_called_once_with(payment)


# 測試工具函數的簡潔示例
def test_calculate_discount_returns_correct_amount():
    """測試折扣計算"""
    # Arrange
    original_price = Decimal('100.00')
    discount_rate = Decimal('0.2')
    
    # Act
    discounted_price = calculate_discount(original_price, discount_rate)
    
    # Assert
    assert discounted_price == Decimal('80.00')


# 使用 fixture 進行數據準備
@pytest.fixture
def sample_user():
    """創建測試用戶"""
    return User(
        id=1,
        email='test@example.com',
        name='Test User',
        is_active=True
    )


def test_user_can_make_purchase(sample_user):
    """測試用戶購買功能"""
    # Arrange
    product = Product(id=1, price=Decimal('50.00'))
    
    # Act
    order = sample_user.purchase(product)
    
    # Assert
    assert order.user_id == sample_user.id
    assert order.total_amount == product.price
```

## 相關主題

- [pytest 框架深入解析](./pytest_framework.md)
- [Mock 與 Patch 技巧](./mocking_and_patching.md)
- [測試驅動開發 (TDD)](./test_driven_development.md)
