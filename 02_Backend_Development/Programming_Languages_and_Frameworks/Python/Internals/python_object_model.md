# Python 物件模型: "一切皆對象"

- **難度**: 8
- **重要程度**: 4
- **標籤**: `Python`, `Internals`, `Object Model`, `PyObject`

## 問題詳述

Python 中常說“一切皆對象”(Everything is an object)。這句話的確切含義是什麼？請從 CPython 實現的角度，解釋 `PyObject` 結構體是什麼，以及它如何成為 Python 中所有對象的基礎。這個模型與 Python 的動態類型特性有何關聯？

## 核心理論與詳解

“一切皆對象”是 Python 語言最核心的設計哲學之一。這意味著不僅僅是我們通常認為的數據（如數字、字串、列表）是物件，就連函數、類別、模組，甚至類型本身，在 Python 的世界裡都是物件。每個物件都擁有一個身份 (identity)、一個類型 (type) 和一個值 (value)。

要真正理解這句話，我們需要深入到 CPython 的 C 語言實現層面。

### 1. `PyObject`: 所有物件的始祖

在 CPython 的原始碼中，定義了一個名為 `PyObject` 的結構體。這個結構體是 Python 中所有物件在 C 層面的基礎表示。任何要在 Python 層面被視為“物件”的東西，其在 C 層面的對應結構體都必須包含 `PyObject` 的成員。

`PyObject` 的簡化定義如下 (位於 `Include/object.h`):
```c
typedef struct _object {
    Py_ssize_t ob_refcnt;  // 引用計數 (Reference Count)
    struct _typeobject *ob_type; // 指向類型物件的指標
} PyObject;
```

這個結構體只包含兩個核心成員：

- `ob_refcnt` (Reference Count):
  - 這是一個整數，用於實現 Python 的引用計數垃圾回收機制。
  - 它記錄了當前有多少個 C 指標指向這個物件。當這個計數變為 0 時，CPython 就知道可以安全地釋放這個物件所佔用的記憶體了。

- `ob_type` (Type Pointer):
  - 這是一個指向另一個結構體 `_typeobject` 的指標。這個 `_typeobject` 本身也是一個物件，它代表了當前物件的**類型**。
  - 例如，一個 Python 整數 `5`，其在 C 層面的結構體中的 `ob_type` 指標會指向代表 `int` 類型的那個物件。一個字串 `"hello"`，其 `ob_type` 會指向 `str` 類型的物件。
  - `_typeobject` 結構體非常複雜，它定義了一個類型的所有行為，包括它有哪些方法 (`tp_methods`)、支持哪些操作（如加法 `tp_as_number->nb_add`）、如何被創建 (`tp_new`) 等。

### 2. 可變長度物件: `PyVarObject`

對於像列表 (`list`) 或字串 (`str`) 這樣長度可變的物件，CPython 使用了 `PyObject` 的一個變體 `PyVarObject`：

```c
typedef struct {
    PyObject ob_base; // 包含了 PyObject 的所有成員
    Py_ssize_t ob_size; // 物件包含的元素數量
} PyVarObject;
```
- `ob_base`: 直接嵌入了 `PyObject` 結構體，因此 `PyVarObject` 也擁有引用計數和類型指標。
- `ob_size`: 記錄了該物件包含的元素個數，例如列表中元素的數量。

一個 Python 的 `list` 物件在 C 層面的結構體 `PyListObject` 就會包含 `PyVarObject`，並額外增加一個指向其內部元素陣列的指標。

### 3. 物件模型與動態類型

Python 的動態類型特性與這個物件模型緊密相關。在 C++ 或 Java 這樣的靜態類型語言中，一個變數被聲明為特定類型，並且只能持有該類型的數據。

但在 Python 中，變數本身沒有類型。變數只是一個**名稱**或**標籤**，它指向某個物件。**類型是儲存在物件本身內部的**（通過 `ob_type` 指標），而不是在指向它的變數名中。

考慮以下 Python 代碼：
```python
my_var = 10
# 在 C 層面:
# 1. 創建一個整數物件，其 ob_type 指向 int 類型物件。
# 2. 讓 my_var 這個名字指向這個整數物件。

my_var = "hello"
# 在 C 層面:
# 1. 創建一個字串物件，其 ob_type 指向 str 類型物件。
# 2. 將 my_var 這個名字的指向從舊的整數物件，改為指向新的字串物件。
# 3. 舊的整數物件的引用計數減 1。
```
這個過程清晰地展示了：
- **變數** `my_var` 僅僅是一個指標或引用。
- **類型** 是與**值**（即物件）綁定的，而不是與**變數名**綁定的。
- 當你調用 `type(my_var)` 時，Python 實際上是通過 `my_var` 找到它指向的物件，然後返回該物件的 `ob_type` 所代表的類型。

### 總結

- **“一切皆對象”** 意味著 Python 中所有東西（數字、函數、類別等）在 C 層面都是以一個包含 `ob_refcnt`（引用計數）和 `ob_type`（類型指標）的 `PyObject` 結構體為基礎來表示的。
- **`PyObject`** 是所有 Python 物件的共同“DNA”，它賦予了物件基本的身份（記憶體地址）、垃圾回收機制（引用計數）和類型資訊。
- **動態類型**之所以能夠實現，是因為類型資訊儲存在物件本身 (`ob_type`)，而變數名僅僅是指向這些帶有類型資訊的物件的標籤。這使得同一個變數名可以在不同時間指向不同類型的物件。
