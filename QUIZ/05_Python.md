# Python - 重點考題 (Quiz)

> 這份考題是從 Python 章節中挑選出**重要程度 4-5** 的核心題目，設計成自我測驗的形式。
> 
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

## 🐍 核心特性

### Q1: 什麼是 GIL（全域直譯器鎖）？它對多執行緒有什麼影響？

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請解釋 GIL 的存在原因、對不同類型任務的影響，以及繞過 GIL 的策略。

<details>
<summary>💡 答案提示</summary>

**GIL (Global Interpreter Lock)** 是 CPython 中的一個互斥鎖，確保任何時候只有一個執行緒能夠執行 Python 位元組碼。

**存在原因**：
- CPython 使用引用計數進行記憶體管理
- GIL 保證引用計數操作的執行緒安全
- 簡化了 CPython 的實現和 C 擴充開發

**對性能的影響**：

| 任務類型 | 影響 | 原因 |
|----------|------|------|
| **CPU 密集型** | 嚴重瓶頸 | 無法利用多核 |
| **I/O 密集型** | 影響較小 | I/O 時會釋放 GIL |

**繞過策略**：
1. **multiprocessing**：多進程，各有獨立 GIL
2. **asyncio**：單執行緒異步
3. **C 擴充**：手動釋放 GIL
4. **其他直譯器**：PyPy、Jython

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Core/gil_explained.md)

---

### Q2: 請解釋 Python 裝飾器的工作原理

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

裝飾器的本質是什麼？為什麼要使用 `functools.wraps`？請舉例說明常見的應用場景。

<details>
<summary>💡 答案提示</summary>

**裝飾器本質**：一個接收函數作為參數，並返回新函數的高階函數。

**語法糖等價**：
```python
@my_decorator
def my_func():
    pass

# 等價於
my_func = my_decorator(my_func)
```

**為什麼用 functools.wraps？**
- 不使用時，原函數的 `__name__`、`__doc__` 等元數據會丟失
- `@functools.wraps(func)` 會將原函數元數據複製到 wrapper

**常見應用**：
- 日誌記錄、計時器
- 權限驗證、快取
- 重試機制

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Core/decorators_explained.md)

---

### Q3: 生成器 (Generator) 和普通函數有什麼區別？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請解釋 `yield` 和 `return` 的差異，以及生成器的優勢和使用場景。

<details>
<summary>💡 答案提示</summary>

**核心區別**：

| 特性 | 普通函數 | 生成器函數 |
|------|----------|------------|
| 關鍵字 | `return` | `yield` |
| 執行方式 | 立即執行 | 惰性執行 |
| 狀態保存 | 執行完畢後銷毀 | 暫停時保留 |
| 記憶體 | 一次性返回所有結果 | 逐個產生 |

**yield vs return**：
- `return`：終止函數，返回值，銷毀狀態
- `yield`：暫停函數，產生值，保留狀態

**優勢**：
- 記憶體效率高
- 惰性求值
- 可表示無限序列

**生成器表達式**：
```python
# 列表推導式 - 佔用大量記憶體
squares_list = [x**2 for x in range(1000000)]

# 生成器表達式 - 記憶體佔用極小
squares_gen = (x**2 for x in range(1000000))
```

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Core/generators_and_yield.md)

---

### Q4: 請解釋 Python 的數據模型和魔法方法

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

什麼是魔法方法（雙下劃線方法）？如何通過實現特定協議讓自訂物件支援原生語法？

<details>
<summary>💡 答案提示</summary>

**Python 數據模型**：定義了物件如何與 Python 語言機制交互的協議。

**核心魔法方法分類**：

| 類別 | 方法 | 用途 |
|------|------|------|
| **物件創建** | `__new__`, `__init__` | 創建和初始化 |
| **字串表示** | `__str__`, `__repr__` | 可讀性 vs 開發者 |
| **容器協議** | `__len__`, `__getitem__` | 讓物件可迭代 |
| **運算符** | `__add__`, `__eq__` | 支援 +, == 等 |
| **上下文管理** | `__enter__`, `__exit__` | with 語句 |
| **可調用** | `__call__` | 讓實例可調用 |

**關鍵點**：
- `__str__` 給用戶看，`__repr__` 給開發者看
- 實現 `__getitem__` 就能支援迭代和切片

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Core/python_data_model.md)

---

## ⚡ 併發模型

### Q5: 比較 threading、multiprocessing、asyncio 三種併發模型

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請說明這三種模型的工作原理、適用場景，以及如何根據任務類型選擇。

<details>
<summary>💡 答案提示</summary>

| 特性 | threading | multiprocessing | asyncio |
|------|-----------|-----------------|---------|
| **並行能力** | 受 GIL 限制 | 真正並行 | 單執行緒並發 |
| **適用場景** | I/O 密集型 | CPU 密集型 | 高併發 I/O |
| **記憶體開銷** | 低 | 高 | 最低 |
| **通訊成本** | 低 | 高（IPC） | 最低 |

**選擇指南**：
```
CPU 密集型 → multiprocessing
I/O 密集型 → asyncio（首選）或 threading
混合型 → multiprocessing + asyncio
```

**關鍵點**：
- GIL 只影響 threading 的 CPU 密集型任務
- asyncio 是單執行緒，通過事件循環實現並發
- multiprocessing 有序列化開銷（pickle）

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Concurrency/threading_vs_multiprocessing_vs_asyncio.md)

---

### Q6: async/await 的工作原理是什麼？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請解釋協程、事件循環的概念，以及 async/await 的執行流程。

<details>
<summary>💡 答案提示</summary>

**核心概念**：
- **協程 (Coroutine)**：用 `async def` 定義，可暫停和恢復
- **await**：暫停當前協程，等待另一個協程完成
- **事件循環**：調度和執行協程的核心機制

**事件循環工作原理**：
1. 維護待執行的協程隊列
2. 取出協程執行
3. 遇到 await 時暫停，調度下一個
4. await 的操作完成後，協程重新加入隊列

**重要區別**：

| 概念 | 說明 |
|------|------|
| `async def` | 定義協程函數 |
| `await` | 暫停並等待結果 |
| `asyncio.gather()` | 並發運行多個協程 |
| `asyncio.run()` | 啟動事件循環 |

**注意**：阻塞的同步代碼會阻塞整個事件循環

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Concurrency/threading_vs_multiprocessing_vs_asyncio.md)

---

## 🔧 底層原理

### Q7: 請解釋 Python 的記憶體管理和垃圾回收機制

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🟡 重要

CPython 如何管理記憶體？引用計數和分代回收是如何協同工作的？

<details>
<summary>💡 答案提示</summary>

**記憶體管理架構**：
```
Arena (256KB) → Pool (4KB) → Block (8-512 bytes)
```
- 小物件 (< 512 bytes)：使用 PyMalloc 記憶體池
- 大物件：直接使用系統 malloc

**垃圾回收機制**：

**1. 引用計數（主要）**：
- 優點：即時回收
- 缺點：無法處理循環引用

**2. 分代回收（輔助）**：
- 第 0 代：新創建的對象，回收最頻繁
- 第 1 代：存活過一次回收
- 第 2 代：長壽命對象，回收最少

**工作流程**：
1. 新對象進入第 0 代
2. 達到閾值觸發回收
3. 存活對象晉升到下一代

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Internals/memory_management_and_gc.md)

---

### Q8: is 和 == 的區別是什麼？什麼是小整數池？

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🟡 重要

請解釋這兩個運算符的差異，以及 CPython 的小整數池和字串駐留機制。

<details>
<summary>💡 答案提示</summary>

**核心區別**：

| 運算符 | 比較內容 | 說明 |
|--------|----------|------|
| `==` | 值相等 | 調用 `__eq__` |
| `is` | 身份相同 | 比較記憶體地址 |

**小整數池 (Small Integer Cache)**：
- CPython 預先創建 -5 到 256 的整數物件
- 重複使用這些物件以節省記憶體
```python
a = 256
b = 256
a is b  # True

a = 257
b = 257
a is b  # False（不同物件）
```

**字串駐留**：
- 短字串會被自動駐留
- 包含特殊字符的字串不駐留

**最佳實踐**：
- `is` 用於 `x is None`
- `==` 用於比較值

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Internals/python_object_model.md)

---

## 🌐 Web 框架

### Q9: 比較 Django、Flask、FastAPI 三個框架

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明這三個框架的特點、設計理念和適用場景。

<details>
<summary>💡 答案提示</summary>

| 特性 | Django | Flask | FastAPI |
|------|--------|-------|---------|
| **類型** | 全棧框架 | 微框架 | 現代 API 框架 |
| **設計理念** | Batteries included | 簡單靈活 | 高性能異步 |
| **ORM** | 內建 | 無 | 無 |
| **異步支援** | 部分支援 | 需擴展 | 原生支援 |
| **API 文檔** | 需要 DRF | 需擴展 | 自動生成 |

**選擇指南**：

| 需求 | 推薦框架 |
|------|----------|
| 企業級完整應用 | **Django** |
| 快速原型開發 | **Flask** |
| 現代高性能 API | **FastAPI** |
| 微服務架構 | **FastAPI** |

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/django_vs_flask_vs_fastapi.md)

---

### Q10: Django 的 N+1 查詢問題是什麼？如何解決？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請解釋 N+1 問題的成因，以及 `select_related` 和 `prefetch_related` 的區別。

<details>
<summary>💡 答案提示</summary>

**N+1 問題**：查詢 N 條主記錄後，需要額外執行 N 次查詢來獲取關聯數據。

```python
# N+1 問題
books = Book.objects.all()  # 1 次查詢
for book in books:
    print(book.author.name)  # N 次額外查詢！
```

**解決方案**：

**1. select_related（一對一、多對一）**
- 使用 SQL JOIN，一次查詢
```python
books = Book.objects.select_related('author').all()
```

**2. prefetch_related（一對多、多對多）**
- 使用兩次查詢 + Python 合併
```python
authors = Author.objects.prefetch_related('books').all()
```

| 關係類型 | 使用方法 |
|----------|----------|
| ForeignKey | `select_related` |
| ManyToMany | `prefetch_related` |
| 反向 FK | `prefetch_related` |

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/django_queryset_optimization.md)

---

### Q11: FastAPI 的依賴注入系統是如何工作的？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請解釋 FastAPI 的依賴注入機制和使用場景。

<details>
<summary>💡 答案提示</summary>

**依賴注入 (DI)** 用於：
- 共享邏輯（數據庫連接、認證）
- 減少代碼重複
- 簡化測試

**基本用法**：
```python
async def get_db():
    db = Database()
    try:
        yield db
    finally:
        db.close()

@app.get("/items/")
async def read_items(db = Depends(get_db)):
    return db.get_items()
```

**依賴類型**：

| 類型 | 用途 |
|------|------|
| 函數依賴 | 最常用 |
| 類依賴 | 複雜邏輯 |
| yield 依賴 | 資源清理 |
| 嵌套依賴 | 依賴鏈 |

**依賴緩存**：同一請求中，相同依賴只執行一次

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/dependency_injection_system.md)

---

## 🔬 進階主題

### Q12: Python 中的描述符 (Descriptor) 協議是什麼？

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🟢 加分

請解釋描述符協議的工作原理和常見應用場景。

<details>
<summary>💡 答案提示</summary>

**描述符**是實現了特定協議的物件，用於自訂屬性訪問行為。

**描述符協議**：
```python
class Descriptor:
    def __get__(self, obj, objtype=None): ...
    def __set__(self, obj, value): ...
    def __delete__(self, obj): ...
```

**描述符類型**：

| 類型 | 實現的方法 | 優先級 |
|------|------------|--------|
| 數據描述符 | `__get__` + `__set__` | 高 |
| 非數據描述符 | 僅 `__get__` | 低 |

**常見應用**：類型驗證、延遲計算、屬性訪問控制

**內建描述符**：`property`、`classmethod`、`staticmethod`

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Core/descriptors_protocol.md)

---

### Q13: 什麼是上下文管理器？with 語句如何工作？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請解釋上下文管理器協議和 with 語句的執行流程。

<details>
<summary>💡 答案提示</summary>

**上下文管理器**：管理資源的獲取和釋放，確保清理代碼一定會執行。

**with 語句流程**：
```python
with expression as variable:
    # 代碼塊

# 等價於
manager = expression
variable = manager.__enter__()
try:
    # 代碼塊
finally:
    manager.__exit__(exc_type, exc_val, exc_tb)
```

**實現方式**：

**1. 類實現**：
```python
class FileManager:
    def __enter__(self): ...
    def __exit__(self, exc_type, exc_val, exc_tb): ...
```

**2. contextlib.contextmanager**：
```python
@contextmanager
def file_manager(filename):
    f = open(filename)
    try:
        yield f
    finally:
        f.close()
```

**應用場景**：文件、數據庫連接、鎖、臨時狀態更改

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Core/python_data_model.md)

---

## 📊 學習進度檢核

完成以上題目後，請自我評估：

| 評估項目 | 自評 |
|----------|------|
| 能解釋 GIL 的作用和繞過策略 | ⬜ |
| 理解裝飾器原理和 functools.wraps | ⬜ |
| 能比較生成器和普通函數 | ⬜ |
| 理解 Python 數據模型和魔法方法 | ⬜ |
| 能選擇正確的併發模型 | ⬜ |
| 理解 async/await 和事件循環 | ⬜ |
| 能解釋記憶體管理和 GC 機制 | ⬜ |
| 能區分 is 和 == | ⬜ |
| 能比較 Django/Flask/FastAPI | ⬜ |
| 知道如何解決 N+1 問題 | ⬜ |
| 理解 FastAPI 依賴注入 | ⬜ |
| 理解上下文管理器 | ⬜ |

**建議**：未能完整回答的題目，請回到對應的詳細文章深入學習。
