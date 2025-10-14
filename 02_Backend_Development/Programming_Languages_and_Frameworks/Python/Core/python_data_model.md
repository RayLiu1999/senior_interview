# Python 資料模型與魔法方法

- **難度**: 7
- **重要程度**: 4
- **標籤**: `Python`, `Core`, `Data Model`, `Magic Methods`

## 問題詳述

什麼是 Python 的資料模型 (Data Model)？它與“魔法方法”(Magic Methods) 有什麼關係？請舉例說明，如何通過實現特定的魔法方法，讓我們自訂的類能夠支持 Python 的內建語法和操作（如 `len()`, `+`, `for...in` 等）。

## 核心理論與詳解

Python 資料模型是一套描述 Python 物件如何與語言本身進行交互的“協議”或“框架”。它定義了一系列具有特殊名稱的方法（通常以雙底線開頭和結尾，如 `__init__`、`__len__`），這些方法被稱為“魔法方法”或“雙底線方法 (dunder methods)”。

當你對一個物件使用 Python 的內建語法或函數時（例如 `len(my_obj)`），Python 直譯器實際上會將其轉化為對特定魔法方法的調用（例如 `my_obj.__len__()`）。通過在你自訂的類中實現這些魔法方法，你就可以“掛鉤”到 Python 的語法中，讓你的物件表現得像內建類型（如列表、字典）一樣，這被稱為“Pythonic”的程式設計風格。

### 魔法方法的核心作用

魔法方法的核心作用是讓自訂物件能夠響應和支持 Python 的核心語法和操作，主要體現在以下幾個方面：

1. **物件的創建與初始化**:
    - `__new__(cls, ...)`: 在物件實例被創建之前調用，負責創建實例。它是一個靜態方法。通常用於實現單例模式或繼承不可變類型。
    - `__init__(self, ...)`: 在物件實例創建後調用，負責初始化實例的屬性。這是最常用的建構方法。

2. **物件的表示**:
    - `__str__(self)`: 當物件被 `print()` 或 `str()` 函數調用時觸發。旨在提供一個對使用者友好的、易於閱讀的字串表示。
    - `__repr__(self)`: 當物件在直譯器中直接被輸出，或被 `repr()` 函數調用時觸發。旨在提供一個明確的、無歧義的、對開發者友好的字串表示，理想情況下，`eval(repr(obj)) == obj`。

3. **支持迭代 (Iteration)**:
    - `__iter__(self)`: 當物件被用於 `for...in` 循環或傳遞給 `iter()` 函數時調用。它應該返回一個迭代器物件。
    - `__next__(self)`: 由迭代器物件實現，`for` 循環在每次迭代時調用它來獲取下一個元素。當沒有更多元素時，應拋出 `StopIteration` 異常。
    - 如果一個類同時實現了 `__len__` 和 `__getitem__`，它也可以支持迭代，儘管這不是現代 Python 的推薦做法。

4. **模擬容器類型 (Container Types)**:
    - `__len__(self)`: 支持 `len()` 函數。
    - `__getitem__(self, key)`: 支持通過索引或鍵進行讀取，如 `obj[key]`。
    - `__setitem__(self, key, value)`: 支持通過索引或鍵進行賦值，如 `obj[key] = value`。
    - `__delitem__(self, key)`: 支持通過索引或鍵進行刪除，如 `del obj[key]`。
    - `__contains__(self, item)`: 支持 `in` 運算符，如 `item in obj`。

5. **模擬數值類型 (Numeric Types)**:
    - `__add__(self, other)`: 支持 `+` 運算符。
    - `__sub__(self, other)`: 支持 `-` 運算符。
    - `__mul__(self, other)`: 支持 `*` 運算符。
    - 還有對應的右側運算 (`__radd__`) 和原地運算 (`__iadd__`) 版本，用於處理 `other + self` 和 `self += other` 的情況。

6. **支持 `with` 語句的上下文管理器 (Context Managers)**:
    - `__enter__(self)`: 進入 `with` 語句塊時調用，返回值會被賦給 `as` 後的變數。
    - `__exit__(self, exc_type, exc_value, traceback)`: 退出 `with` 語句塊時調用，即使塊中發生了異常。常用於資源的清理（如關閉檔案、釋放鎖）。

## 程式碼範例 (可選)

讓我們創建一個 `Vector` 類來表示一個二維向量，並通過實現魔法方法使其支持多種 Pythonic 操作。

```python
import math

class Vector:
    def __init__(self, x=0, y=0):
        self.x = x
        self.y = y

    # 1. 物件表示: __repr__ 和 __str__
    def __repr__(self):
        # 提供給開發者的明確表示
        return f"Vector({self.x!r}, {self.y!r})"

    def __str__(self):
        # 提供給使用者的友好表示
        return f"({self.x}, {self.y})"

    # 2. 模擬數值類型: __add__
    def __add__(self, other):
        # 支持向量加法: v1 + v2
        if isinstance(other, Vector):
            return Vector(self.x + other.x, self.y + other.y)
        return NotImplemented # 表示無法處理此類型的操作

    # 3. 模擬數值類型: __mul__
    def __mul__(self, scalar):
        # 支持向量與純量的乘法: v1 * 3
        if isinstance(scalar, (int, float)):
            return Vector(self.x * scalar, self.y * scalar)
        return NotImplemented

    # 4. 讓 len() 函數可用
    def __len__(self):
        # 我們可以定義向量的“長度”為其維度數
        return 2

    # 5. 支持絕對值 abs()
    def __abs__(self):
        # 返回向量的模長
        return math.hypot(self.x, self.y)

    # 6. 支持布林測試
    def __bool__(self):
        # 只有零向量的布林值為 False
        return bool(self.x or self.y)

# --- 使用範例 ---
v1 = Vector(2, 3)
v2 = Vector(3, 4)

# 使用 __str__
print(f"v1 is {v1}")  # 輸出: v1 is (2, 3)

# 使用 __repr__
print(f"The representation of v1 is {v1!r}") # 輸出: The representation of v1 is Vector(2, 3)

# 使用 __add__
v3 = v1 + v2
print(f"v1 + v2 = {v3}") # 輸出: v1 + v2 = (5, 7)

# 使用 __mul__
v4 = v1 * 3
print(f"v1 * 3 = {v4}") # 輸出: v1 * 3 = (6, 9)

# 使用 __abs__
print(f"The magnitude of v2 is {abs(v2)}") # 輸出: The magnitude of v2 is 5.0

# 使用 __bool__
print(f"Is v1 a zero vector? {'No' if v1 else 'Yes'}") # 輸出: Is v1 a zero vector? No
zero_vec = Vector(0, 0)
print(f"Is zero_vec a zero vector? {'No' if zero_vec else 'Yes'}") # 輸出: Is zero_vec a zero vector? Yes

# 使用 __len__
print(f"The dimension of v1 is {len(v1)}") # 輸出: The dimension of v1 is 2
```

這個 `Vector` 類通過實現一系列魔法方法，無縫地集成了 Python 的核心語法，使其行為像一個內建的數值類型，代碼也因此變得更加直觀和優雅。這就是 Python 資料模型的強大之處。
