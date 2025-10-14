# 測試驅動開發 (TDD)

- **難度**: 6
- **重要程度**: 4
- **標籤**: `TDD`, `Development Practice`, `Red-Green-Refactor`

## 問題詳述

探討測試驅動開發（TDD）的核心理念、實踐流程、優勢與挑戰，以及如何在 Python 項目中有效應用 TDD 來提高代碼質量和設計水平。

## 核心理論與詳解

### TDD 的核心概念

**測試驅動開發（Test-Driven Development）** 是一種軟體開發方法論，其核心思想是在編寫功能代碼之前先編寫測試。TDD 將測試從驗證工具轉變為設計工具，通過測試來驅動和指導代碼的實現。這種方法強調小步前進、快速反饋和持續重構。

**設計哲學**：TDD 的本質不僅僅是寫測試，更是一種設計思維方式。通過先思考如何測試，開發者被迫從使用者角度思考 API 設計，這自然導致更清晰、更易用的接口設計。

### Red-Green-Refactor 循環

**Red（紅）階段**：編寫一個失敗的測試。測試描述了期望的行為，但由於功能尚未實現，測試會失敗（在 pytest 中顯示為紅色）。這個階段確保測試能夠捕獲問題。

**Green（綠）階段**：編寫最少量的代碼使測試通過。此時不追求完美或優雅，目標是快速讓測試變綠。這種約束有助於保持專注和避免過度設計。

**Refactor（重構）階段**：在測試通過後，重構代碼以消除重複、改善結構和提高可讀性。因為有測試保護，重構是安全的。重構後運行測試確保行為未改變。

**循環特性**：這三個階段形成一個快速循環，通常在幾分鐘內完成一輪。頻繁的循環提供快速反饋，使開發節奏穩定且可預測。

### TDD 的優勢

**設計改進**：TDD 迫使開發者從使用者角度思考接口，導致更簡潔、更模塊化的設計。測試先行自然鼓勵低耦合、高內聚的代碼結構。

**即時反饋**：每次循環都提供快速反饋，開發者立即知道代碼是否正確。這減少了調試時間，提高了開發效率。

**測試覆蓋率**：TDD 確保代碼從一開始就有測試覆蓋。沒有測試先行，很容易忘記或跳過測試。

**重構信心**：完善的測試套件作為安全網，使重構變得安全。開發者可以大膽改進代碼而不擔心破壞功能。

**文檔作用**：測試即文檔。測試清楚地展示了代碼的預期行為和使用方式，比傳統文檔更準確且不會過時。

**減少缺陷**：研究表明 TDD 能顯著減少生產環境的缺陷密度。早期發現問題的成本遠低於後期修復。

### TDD 的挑戰

**學習曲線**：TDD 需要思維方式的轉變。初學者常感到不適應，需要時間建立 TDD 習慣。

**初期速度慢**：剛開始實踐 TDD 時，開發速度可能變慢。但隨著經驗積累和測試套件成熟，長期效率會提高。

**過度測試**：新手可能過度測試實現細節而非行為，導致測試脆弱。需要學會區分「what」和「how」。

**遺留代碼**：在沒有測試的遺留代碼庫中引入 TDD 很困難。需要先進行測試化重構（characterization testing）。

### TDD 的實踐技巧

**從簡單開始**：選擇最簡單的測試用例開始。遵循「baby steps」原則，每次只添加一個小功能。

**測試行為而非實現**：測試應該關注對外的行為契約，而不是內部實現細節。這使測試更穩定，允許重構。

**一次一個測試**：專注於當前的一個測試，使其通過後再進行下一個。不要同時處理多個失敗的測試。

**保持測試獨立**：每個測試應該獨立運行，不依賴其他測試的執行順序或結果。

**使用 TODO 列表**：維護一個測試用例的 TODO 列表，幫助組織思路和追蹤進度。

### 測試粒度與範圍

**單元測試優先**：TDD 主要應用於單元測試層面。單元測試快速且隔離，適合頻繁的 Red-Green-Refactor 循環。

**Outside-In vs Inside-Out**：Outside-In TDD 從高層次的驗收測試開始，逐步向下實現。Inside-Out TDD 從最基礎的單元開始向上構建。兩種方法各有優勢。

**驗收測試驅動開發（ATDD）**：在 TDD 之上，ATDD 使用業務層面的驗收測試驅動開發。這確保實現的是真正需要的功能。

### TDD 與設計模式

**依賴注入**：TDD 鼓勵使用依賴注入，這使得測試中可以輕鬆替換依賴為 mock 或 stub。

**接口隔離**：為了便於測試，代碼傾向於定義清晰的接口和抽象，這與接口隔離原則一致。

**單一職責**：TDD 促使類和函數保持單一職責，因為職責單一的代碼更容易測試。

### TDD 在不同場景的應用

**新功能開發**：TDD 最適合新功能開發。清晰的需求可以直接轉化為測試用例。

**Bug 修復**：遇到 bug 時，先寫一個能重現 bug 的測試（此時測試失敗），然後修復 bug 使測試通過。這確保 bug 不會重現。

**重構**：在重構前確保有充分的測試覆蓋。重構過程中頻繁運行測試，確保行為不變。

**探索性開發**：在不確定如何實現時，可以先進行探索性編程（spike），然後用 TDD 重新實現。

### 常見陷阱

**測試實現細節**：過度關注內部實現使測試脆弱。應該測試公共接口和可觀察的行為。

**忽略重構階段**：只關注 Red-Green 而跳過 Refactor 會導致代碼質量下降。重構是 TDD 不可或缺的部分。

**測試過大**：測試範圍過大會使循環變慢，減少反饋速度。保持測試小而聚焦。

**為測試而測試**：不要為了覆蓋率而寫無意義的測試。每個測試都應該驗證有價值的行為。

### TDD 與團隊實踐

**結對編程**：TDD 與結對編程相得益彰。一人寫測試，一人寫實現，角色輪換。

**代碼審查**：TDD 產生的代碼和測試都應該經過代碼審查。審查測試代碼同樣重要。

**CI/CD 集成**：將 TDD 產生的測試套件集成到 CI/CD 流程中，確保每次提交都運行測試。

**團隊規範**：在團隊中建立 TDD 實踐的共識和規範，統一測試風格和命名約定。

## 程式碼範例

```python
# TDD 示例：開發一個簡單的購物車功能

import pytest
from decimal import Decimal


# ===== 第一輪：Red-Green-Refactor =====
# Red: 編寫第一個測試
def test_new_cart_is_empty():
    """測試新購物車是空的"""
    cart = ShoppingCart()  # 此時 ShoppingCart 還不存在，測試失敗
    assert cart.total_items() == 0


# Green: 最小實現
class ShoppingCart:
    def __init__(self):
        self._items = []
    
    def total_items(self):
        return len(self._items)


# 測試通過！開始下一輪


# ===== 第二輪：添加商品 =====
# Red: 測試添加商品功能
def test_add_item_increases_count():
    """測試添加商品增加數量"""
    cart = ShoppingCart()
    cart.add_item("Apple", Decimal("1.50"), 2)
    assert cart.total_items() == 1  # 一種商品


# Green: 實現 add_item
class ShoppingCart:
    def __init__(self):
        self._items = []
    
    def add_item(self, name, price, quantity):
        self._items.append({
            "name": name,
            "price": price,
            "quantity": quantity
        })
    
    def total_items(self):
        return len(self._items)


# ===== 第三輪：計算總價 =====
# Red: 測試總價計算
def test_calculate_total_price():
    """測試計算總價"""
    cart = ShoppingCart()
    cart.add_item("Apple", Decimal("1.50"), 2)  # 3.00
    cart.add_item("Banana", Decimal("0.80"), 3)  # 2.40
    assert cart.total_price() == Decimal("5.40")


# Green: 實現 total_price
class ShoppingCart:
    def __init__(self):
        self._items = []
    
    def add_item(self, name, price, quantity):
        self._items.append({
            "name": name,
            "price": price,
            "quantity": quantity
        })
    
    def total_items(self):
        return len(self._items)
    
    def total_price(self):
        return sum(
            item["price"] * item["quantity"]
            for item in self._items
        )


# Refactor: 引入值對象
from dataclasses import dataclass

@dataclass
class CartItem:
    name: str
    price: Decimal
    quantity: int
    
    def subtotal(self):
        return self.price * self.quantity


class ShoppingCart:
    def __init__(self):
        self._items = []
    
    def add_item(self, name, price, quantity):
        item = CartItem(name, price, quantity)
        self._items.append(item)
    
    def total_items(self):
        return len(self._items)
    
    def total_price(self):
        return sum(item.subtotal() for item in self._items)


# ===== 第四輪：邊界條件 =====
# Red: 測試空購物車的總價
def test_empty_cart_total_is_zero():
    """測試空購物車總價為零"""
    cart = ShoppingCart()
    assert cart.total_price() == Decimal("0")

# 測試已經通過！當前實現已經處理了這種情況


# Red: 測試數量為零的情況
def test_add_item_with_zero_quantity_raises_error():
    """測試添加零數量商品應拋出錯誤"""
    cart = ShoppingCart()
    with pytest.raises(ValueError, match="數量必須大於零"):
        cart.add_item("Apple", Decimal("1.50"), 0)


# Green: 添加驗證
class ShoppingCart:
    def __init__(self):
        self._items = []
    
    def add_item(self, name, price, quantity):
        if quantity <= 0:
            raise ValueError("數量必須大於零")
        if price < 0:
            raise ValueError("價格不能為負")
        
        item = CartItem(name, price, quantity)
        self._items.append(item)
    
    def total_items(self):
        return len(self._items)
    
    def total_price(self):
        return sum(item.subtotal() for item in self._items)


# ===== 第五輪：移除商品 =====
# Red: 測試移除商品
def test_remove_item():
    """測試移除商品"""
    cart = ShoppingCart()
    cart.add_item("Apple", Decimal("1.50"), 2)
    cart.add_item("Banana", Decimal("0.80"), 3)
    
    cart.remove_item("Apple")
    
    assert cart.total_items() == 1
    assert cart.total_price() == Decimal("2.40")


# Green: 實現 remove_item
class ShoppingCart:
    def __init__(self):
        self._items = []
    
    def add_item(self, name, price, quantity):
        if quantity <= 0:
            raise ValueError("數量必須大於零")
        if price < 0:
            raise ValueError("價格不能為負")
        
        item = CartItem(name, price, quantity)
        self._items.append(item)
    
    def remove_item(self, name):
        self._items = [item for item in self._items if item.name != name]
    
    def total_items(self):
        return len(self._items)
    
    def total_price(self):
        return sum(item.subtotal() for item in self._items)


# ===== Bug 修復的 TDD 流程 =====
# 假設發現 bug：相同商品被添加多次時應該合併數量而非創建多個條目

# Red: 寫測試重現 bug
def test_adding_same_item_twice_merges_quantity():
    """測試添加相同商品應合併數量"""
    cart = ShoppingCart()
    cart.add_item("Apple", Decimal("1.50"), 2)
    cart.add_item("Apple", Decimal("1.50"), 3)
    
    assert cart.total_items() == 1  # 只有一種商品
    assert cart.get_item_quantity("Apple") == 5  # 總數量為 5


# Green: 修復 bug
class ShoppingCart:
    def __init__(self):
        self._items = {}  # 改用字典，以商品名為鍵
    
    def add_item(self, name, price, quantity):
        if quantity <= 0:
            raise ValueError("數量必須大於零")
        if price < 0:
            raise ValueError("價格不能為負")
        
        if name in self._items:
            # 合併數量
            self._items[name].quantity += quantity
        else:
            item = CartItem(name, price, quantity)
            self._items[name] = item
    
    def remove_item(self, name):
        if name in self._items:
            del self._items[name]
    
    def get_item_quantity(self, name):
        return self._items[name].quantity if name in self._items else 0
    
    def total_items(self):
        return len(self._items)
    
    def total_price(self):
        return sum(item.subtotal() for item in self._items.values())


# ===== TDD 在不同層次的應用 =====

# 服務層的 TDD
class UserService:
    def __init__(self, repository, email_service):
        self.repository = repository
        self.email_service = email_service


# Red: 測試用戶註冊
def test_register_user_creates_user_and_sends_email(mocker):
    """測試註冊用戶並發送郵件"""
    mock_repo = mocker.Mock()
    mock_email = mocker.Mock()
    service = UserService(mock_repo, mock_email)
    
    user = service.register("test@example.com", "password")
    
    mock_repo.save.assert_called_once()
    mock_email.send_welcome_email.assert_called_once_with(user)


# Green: 實現註冊功能
class UserService:
    def __init__(self, repository, email_service):
        self.repository = repository
        self.email_service = email_service
    
    def register(self, email, password):
        user = User(email=email)
        user.set_password(password)
        self.repository.save(user)
        self.email_service.send_welcome_email(user)
        return user
```

## 相關主題

- [單元測試最佳實踐](./unit_testing_best_practices.md)
- [pytest 框架深入解析](./pytest_framework.md)
- [Mock 與 Patch 技巧](./mocking_and_patching.md)
