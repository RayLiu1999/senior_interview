# Python 描述符協議

- **難度**: 9
- **重要程度**: 3
- **標籤**: `Python`, `Core`, `Descriptors`, `Data Model`

## 問題詳述

什麼是 Python 的描述符協議 (Descriptor Protocol)？它是如何運作的？Python 的屬性 (`property`)、靜態方法 (`staticmethod`) 和類別方法 (`classmethod`) 是如何基於描述符協議實現的？請提供一個自訂描述符的範例。

## 核心理論與詳解

描述符是 Python 物件導向程式設計中一個強大但較為進階的概念。它允許一個物件的屬性訪問被另一個物件（即描述符）所代理。任何定義了 `__get__`、`__set__` 或 `__delete__` 方法的物件，都可以被稱為描述符。

### 1. 描述符協議

描述符協議由以下三個魔法方法組成：

- `__get__(self, instance, owner)`:
  - 當你試圖**讀取**一個屬性時被調用。
  - `self`: 描述符物件本身。
  - `instance`: 擁有該描述符的類別的實例。如果屬性是通過類別來訪問的（如 `MyClass.my_attr`），則 `instance` 為 `None`。
  - `owner`: 擁有該描述符的類別本身（如 `MyClass`）。

- `__set__(self, instance, value)`:
  - 當你試圖**寫入**或**賦值**給一個屬性時被調用。
  - `instance`: 類別的實例。
  - `value`: 要賦予屬性的值。

- `__delete__(self, instance)`:
  - 當你對一個屬性使用 `del` 關鍵字時被調用。
  - `instance`: 類別的實例。

### 2. 描述符的類型

根據實現的方法，描述符可以分為兩類：

- **資料描述符 (Data Descriptor)**:
  - 一個同時實現了 `__get__` 和 `__set__` 方法的描述符。
  - 資料描述符在屬性查找中具有**最高優先級**。如果一個實例的字典 (`__dict__`) 中有一個與資料描述符同名的屬性，**資料描述符依然會被優先調用**。

- **非資料描述符 (Non-Data Descriptor)**:
  - 一個只實現了 `__get__` 方法的描述符。
  - 非資料描述符的優先級較低。如果實例的字典 (`__dict__`) 中有同名屬性，**實例字典中的屬性會被優先返回**，而不會調用描述符的 `__get__` 方法。

這個優先級差異是理解 Python 屬性查找順序的關鍵。

### 3. 描述符的內部實現

當你訪問一個實例的屬性時，例如 `my_instance.my_attr`，Python 直譯器會執行 `object.__getattribute__` 方法。這個方法的查找順序大致如下：

1.  檢查 `my_instance` 的類別 (`type(my_instance)`) 及其父類別中是否存在一個名為 `my_attr` 的**資料描述符**。如果找到，則調用其 `__get__` 方法並返回結果。
2.  如果沒有找到資料描述符，則檢查 `my_instance.__dict__` 中是否存在 `my_attr`。如果存在，則直接返回 `my_instance.__dict__['my_attr']`。
3.  如果實例字典中也沒有，則檢查 `my_instance` 的類別及其父類別中是否存在一個**非資料描述符**。如果找到，則調用其 `__get__` 方法並返回結果。
4.  如果還沒找到，則檢查類別中是否有一個普通的屬性 `my_attr`。
5.  如果以上步驟都失敗，則拋出 `AttributeError`。

### 4. 內建描述符的應用

Python 中一些廣為人知的特性就是基於描述符協議實現的：

- **`property`**: `property` 是一個內建的資料描述符。當你這樣寫：
  ```python
  class MyClass:
      @property
      def my_prop(self):
          return self._my_prop
  ```
  `@property` 裝飾器實際上創建了一個 `property` 物件，並將其賦值給 `MyClass.my_prop`。這個 `property` 物件實現了 `__get__`、`__set__` 和 `__delete__` 方法，將屬性訪問轉發給你定義的 `getter`, `setter` 和 `deleter` 方法。

- **`staticmethod`**: `staticmethod` 是一個非資料描述符。它只實現了 `__get__` 方法。當被調用時，`__get__` 方法直接返回被包裝的原始函數，而忽略 `instance` 和 `owner` 參數，從而使得該函數的行為與普通函數無異，不接收 `self` 或 `cls`。

- **`classmethod`**: `classmethod` 也是一個非資料描述符。它的 `__get__` 方法會將 `owner`（即類別本身）作為第一個參數 (`cls`) 傳遞給被包裝的函數。

## 程式碼範例 (可選)

讓我們創建一個自訂的資料描述符，用於在賦值時驗證值的類型。

```python
# 描述符類: 用於類型驗證
class Typed:
    def __init__(self, name, expected_type):
        self.name = name
        self.expected_type = expected_type

    def __get__(self, instance, owner):
        if instance is None:
            return self
        # 從實例的 __dict__ 中獲取值，避免無限遞歸
        return instance.__dict__.get(self.name, None)

    def __set__(self, instance, value):
        if not isinstance(value, self.expected_type):
            raise TypeError(f"Expected {self.expected_type.__name__} for {self.name}")
        # 將值存儲在實例的 __dict__ 中
        instance.__dict__[self.name] = value

    def __delete__(self, instance):
        instance.__dict__.pop(self.name, None)

# 使用描述符的類
class Person:
    # 將描述符實例化為類別屬性
    name = Typed("name", str)
    age = Typed("age", int)

    def __init__(self, name, age):
        # 賦值操作會觸發描述符的 __set__ 方法
        self.name = name
        self.age = age

# --- 使用範例 ---
p = Person("Alice", 30)

# 讀取屬性 (觸發 __get__)
print(f"Name: {p.name}, Age: {p.age}") # 輸出: Name: Alice, Age: 30

# 嘗試賦予不正確的類型 (觸發 __set__ 並拋出異常)
try:
    p.age = "thirty"
except TypeError as e:
    print(e) # 輸出: Expected int for age

# 賦予正確的類型
p.name = "Bob"
print(f"New Name: {p.name}") # 輸出: New Name: Bob

# 屬性實際上儲存在實例的 __dict__ 中
print(p.__dict__) # 輸出: {'name': 'Bob', 'age': 30}
```
這個範例展示了如何使用描述符來創建可重用的驗證邏輯，這在編寫框架或 ORM 時非常有用。
