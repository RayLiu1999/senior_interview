# Python 元類別 (Metaclasses)

- **難度**: 10
- **重要程度**: 3
- **標籤**: `Python`, `Core`, `Metaclasses`, `Type`

## 問題詳述

什麼是 Python 的元類別 (Metaclass)？它們在 Python 的物件模型中扮演什麼角色？`type` 作為一個元類別是如何工作的？請解釋元類別的 `__new__` 和 `__init__` 方法。在什麼樣的實際場景下，我們可能需要自訂元類別？

> "Metaclasses are deeper magic than 99% of users should ever worry about. If you wonder whether you need them, you don’t."
> — Tim Peters

## 核心理論與詳解

元類別是 Python 中最進階的概念之一，它挑戰了我們對“類別”和“物件”的常規理解。簡單來說，**元類別就是創建類別的類別**。

### 1. "一切皆對象" 的延伸

在 Python 中，我們知道“一切皆對象”。變數是物件，函數是物件，那麼類別呢？類別也是物件。

```python
class MyClass:
    pass

# MyClass 是一個物件
print(type(MyClass)) # 輸出: <class 'type'>
```
既然 `MyClass` 是一個物件，那麼它必然是由某個“東西”創建出來的。創建 `MyClass` 這個物件的“東西”，就是元類別。預設情況下，Python 中所有類別的元類別都是 `type`。

所以，關係是：
- 你用**類別**來創建**實例** (物件)。
- 你用**元類別**來創建**類別** (物件)。

### 2. `type` 作為動態類別創建器

`type` 除了可以用來獲取物件的類型 (`type(obj)`)，它還有一個更強大的功能：動態地創建類別。`type` 函數可以接收三個參數：

`type(name, bases, dct)`

- `name`: 類別的名稱 (字串)。
- `bases`: 一個包含父類別的元組 (用於繼承)。
- `dct`: 一個包含類別屬性和方法的字典。

以下兩種創建類別的方式是等價的：

**常規方式:**
```python
class MyRegularClass:
    x = 10
    def greet(self):
        print("Hello")
```

**使用 `type` 動態創建:**
```python
def greet_func(self):
    print("Hello")

MyDynamicClass = type(
    'MyDynamicClass',
    (object,),
    {'x': 10, 'greet': greet_func}
)
```
`MyRegularClass` 和 `MyDynamicClass` 都是 `type` 這個元類別的實例。

### 3. 自訂元類別

既然 `type` 是一個類別，我們就可以繼承它來創建自己的元類別。一個自訂元類別必須繼承自 `type`。

當一個類別定義指定了它的元類別時，Python 會使用這個元類別來創建該類別物件。

```python
# 1. 定義一個元類別
class MyMeta(type):
    def __new__(cls, name, bases, dct):
        print(f"--- Using MyMeta to create class {name} ---")
        # 在這裡可以修改類別的屬性或方法 (dct)
        dct['extra_attribute'] = "This was added by the metaclass"
        return super().__new__(cls, name, bases, dct)

# 2. 使用元類別來定義一個類
class MyClassWithMeta(metaclass=MyMeta):
    pass

# --- 執行結果 ---
# 在類別定義階段，元類別的 __new__ 就會被調用
# 輸出: --- Using MyMeta to create class MyClassWithMeta ---

# 檢查元類別添加的屬性
print(MyClassWithMeta.extra_attribute)
# 輸出: This was added by the metaclass
```

### 4. 元類別中的 `__new__` vs. `__init__`

- `__new__(cls, name, bases, dct)`:
  - 在類別物件**被創建之前**調用。
  - 它的作用是**創建**並**返回**這個類別物件。
  - `cls` 是元類別本身 (`MyMeta`)。
  - `name`, `bases`, `dct` 是傳入 `type()` 的三個參數。
  - 這是修改類別定義（例如，添加/刪除方法、修改屬性）的主要場所。

- `__init__(self, name, bases, dct)`:
  - 在類別物件**被創建之後**調用。
  - 它的作用是**初始化**這個剛剛創建好的類別物件。
  - `self` 是被創建的類別物件本身 (`MyClassWithMeta`)。
  - 通常用於執行一些在類別創建後的設置工作。

這個過程與普通類別的 `__new__` (創建實例) 和 `__init__` (初始化實例) 非常相似，只是操作的對象從“實例”變成了“類別”。

### 5. 實際應用場景

元類別非常強大，但也極易被濫用，導致代碼難以理解。只有在常規的物件導向技術無法解決問題時，才應考慮使用。常見的應用場景包括：

1.  **自動註冊**:
    - **場景**: 創建一個插件系統，希望所有插件類別在定義時能自動註冊到一個中央註冊表中，無需手動調用註冊函數。
    - **實現**: 元類別可以在創建每個插件類別時，將其添加到一個全域列表中。

2.  **API 強制約束**:
    - **場景**: 設計一個抽象基類，要求所有子類別必須實現某些特定的方法或屬性。
    - **實現**: 元類別可以在創建子類別時，檢查其 `dct` 是否包含必要的方法名，如果不包含則拋出異常。

3.  **ORM (物件關係對應)**:
    - **場景**: 像 Django 的 Model 一樣，根據類別中定義的欄位（如 `CharField`, `IntegerField`）自動生成與資料庫交互的底層代碼。
    - **實現**: 元類別可以遍歷類別的屬性，將特定的欄位物件轉換為資料庫操作的描述符或方法，並將它們附加到最終創建的類別上。

在大多數情況下，類別裝飾器 (Class Decorators) 或描述符可以作為元類別的更簡單的替代方案。只有當你需要動態地、系統性地修改大量類別的創建過程時，元類別才是最合適的工具。
