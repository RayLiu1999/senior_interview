# Python - 重點考題 (Quiz)

> 這份考題是從 Python 章節中挑選出**重要程度 4-5** 的核心題目，設計成自我測驗的形式。
>
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

## 🐍 核心特性

<a id="q1"></a>
### Q1: 什麼是 GIL（全域直譯器鎖）？它對多執行緒有什麼影響？
<!-- Concept ID: concept.python.core.gil; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q2"></a>
### Q2: 請解釋 Python 裝飾器的工作原理
<!-- Concept ID: concept.python.core.decorators; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q3"></a>
### Q3: 生成器 (Generator) 和普通函數有什麼區別？
<!-- Concept ID: concept.python.core.generators; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q4"></a>
### Q4: 請解釋 Python 的數據模型和魔法方法
<!-- Concept ID: concept.python.core.data-model; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q5"></a>
### Q5: 比較 threading、multiprocessing、asyncio 三種併發模型
<!-- Concept ID: concept.python.concurrency.model-selection; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q6"></a>
### Q6: async/await 的工作原理是什麼？
<!-- Concept ID: concept.python.concurrency.model-selection; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q7"></a>
### Q7: 請解釋 Python 的記憶體管理和垃圾回收機制
<!-- Concept ID: concept.python.internals.memory-management-gc; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q8"></a>
### Q8: is 和 == 的區別是什麼？什麼是小整數池？
<!-- Concept ID: concept.python.internals.object-identity; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q9"></a>
### Q9: 比較 Django、Flask、FastAPI 三個框架
<!-- Concept ID: concept.python.frameworks.web-framework-selection; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q10"></a>
### Q10: Django 的 N+1 查詢問題是什麼？如何解決？
<!-- Concept ID: concept.python.django.queryset-optimization; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q11"></a>
### Q11: FastAPI 的依賴注入系統是如何工作的？
<!-- Concept ID: concept.python.fastapi.dependency-injection; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q12"></a>
### Q12: Python 中的描述符 (Descriptor) 協議是什麼？
<!-- Concept ID: concept.python.core.descriptor-protocol; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

<a id="q13"></a>
### Q13: 什麼是上下文管理器？with 語句如何工作？
<!-- Concept ID: concept.python.core.data-model; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

## ⚡ FastAPI Runtime

<a id="q14"></a>
### Q14: FastAPI 的 async route 為什麼仍可能阻塞整個事件循環？
<!-- Concept ID: concept.python.fastapi.async-route-runtime; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請說明 ASGI、事件循環、`await` 與同步／異步 route 的執行邊界，並設計一套定位 event-loop lag 與請求延遲的方式。

<details>
<summary>💡 答案提示</summary>

- `async def` route 會在事件循環中執行；只有在真正等待可 await 的非阻塞 I/O 時，控制權才會回到事件循環處理其他請求。
- 在 async route 內呼叫 `time.sleep`、同步 HTTP／資料庫 client、CPU-heavy serialization 或長時間 Python 計算，會阻塞 event loop；`await` 不是把任意同步函式變成非阻塞。
- 普通 `def` route 通常由框架放入 thread pool，但 thread pool 也有容量、排隊、context switch 與下游連線池限制；CPU-bound 工作通常需要 process pool、獨立 worker 或批次化。
- 應同時觀察 event-loop lag、request P99、task backlog、thread pool queue／active、CPU、GC、下游 latency 與 trace，並以同步 client／慢 I/O／CPU 負載實驗驗證。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/async_route_handlers.md)

---

## 🧩 FastAPI API 邊界

<a id="q15"></a>
### Q15: FastAPI 的 ASGI 與非同步事件循環如何影響 API 容量？
<!-- Concept ID: concept.python.fastapi.async-architecture; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 ASGI、Starlette、事件循環與同步／非同步路由的執行邊界，並解釋為什麼 async endpoint 仍可能阻塞整個 worker。

<details>
<summary>💡 答案提示</summary>

- ASGI 提供非同步 server／application 邊界，事件循環會在可等待的 I/O 期間切換協程。
- 同步 SDK、阻塞 sleep、CPU-heavy 工作或大型 serialization 放進 async route 仍會阻塞事件循環。
- 應以 async client、受控 thread pool 或 process／獨立 worker 對應 I/O 與 CPU 工作。
- event-loop lag、request P99、task backlog、thread pool 與下游 saturation 要一起觀察。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/fastapi_async.md)

<a id="q16"></a>
### Q16: FastAPI 路徑操作中的參數如何形成可靠的 API 契約？
<!-- Concept ID: concept.python.fastapi.routing-parameter-contract; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請比較 path、query、header、cookie、body、form 與 file 參數，並說明如何加入限制、冪等性與相容性。

<details>
<summary>💡 答案提示</summary>

- 參數位置應符合 HTTP 語意：資源識別、篩選、metadata、狀態或命令資料不能混用。
- 型別、範圍、長度、批次數量、檔案大小與路由順序要明確，並同步反映到 OpenAPI。
- POST、PUT、PATCH 的重試與冪等性要分別設計，錯誤回應需有穩定語意。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/path_operations_and_parameters.md)

<a id="q17"></a>
### Q17: FastAPI 的 request／response model 如何保護 API 邊界？
<!-- Concept ID: concept.python.fastapi.api-schema; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 request parsing、Pydantic validation、response_model 過濾與 serialization 的關係，並設計讀寫模型。

<details>
<summary>💡 答案提示</summary>

- request model 定義輸入契約，response model 定義輸出契約，兩者不應直接共用 ORM entity。
- 讀寫模型要分離，明確處理 required、nullable、default、nested schema 與敏感欄位。
- 大 payload 與深層巢狀結構會增加 validation／serialization 成本，應設定上限並以 schema diff 檢查相容性。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/request_and_response_models.md)

<a id="q18"></a>
### Q18: Pydantic 的 coercion 與 strict validation 應如何取捨？
<!-- Concept ID: concept.python.fastapi.validation-contract; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請解釋 Pydantic runtime validation、型別轉換、Field／model validator 與輸入限制，並說明如何避免驗證型 DoS。

<details>
<summary>💡 答案提示</summary>

- coercion 可維持部分相容性，但可能把 client 的錯誤輸入靜默轉成另一種語意；金額、身份與狀態欄位通常需要更嚴格。
- 應為欄位、巢狀深度、字串長度、集合數量與 payload 計算成本設界。
- 驗證錯誤要有一致的 4xx／422 契約，並以版本化 schema 漸進收緊規則。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/pydantic_models_and_validation.md)

<a id="q19"></a>
### Q19: FastAPI 中 authentication 與 authorization 有什麼差別？
<!-- Concept ID: concept.python.fastapi.authentication-security; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請比較 OAuth2、JWT、API key、scope 與 claims，並提出 token lifecycle 與租戶隔離的安全設計。

<details>
<summary>💡 答案提示</summary>

- authentication 確認呼叫者身份，authorization 再依角色、scope、租戶與資源關係判斷能否操作。
- JWT 不只驗簽章，還要檢查 issuer、audience、expiry、scope、rotation 與撤銷／重放策略。
- bearer token 不應進入一般日誌；登入、發送與 WebSocket handshake 應有 rate limit 和錯誤遮罩。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/authentication_and_security.md)

<a id="q20"></a>
### Q20: FastAPI middleware 的 onion model 如何影響短路與錯誤處理？
<!-- Concept ID: concept.python.fastapi.middleware-boundary; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請說明 middleware 的進入／離開順序，以及 trace、CORS、認證、timeout、例外處理的配置取捨。

<details>
<summary>💡 答案提示</summary>

- middleware 形成 onion：請求由外往內，response 由內往外；註冊順序會影響短路與 header。
- trace 和例外邊界要能涵蓋拒絕與錯誤回應，認證／授權要在受保護 route 或 WebSocket handshake 前執行。
- response 已開始後不能再寫第二個 body；timeout 應傳遞取消並完成資源清理。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/middleware_mechanism.md)

<a id="q21"></a>
### Q21: FastAPI 如何設計一致且可觀測的錯誤回應？
<!-- Concept ID: concept.python.fastapi.error-boundary; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請比較 HTTPException、validation error、domain error 與未預期例外，並說明 streaming／background task 的錯誤邊界。

<details>
<summary>💡 答案提示</summary>

- 不同錯誤要有穩定的狀態碼、錯誤類型、correlation ID 與可重試語意。
- 對外錯誤需遮罩內部 stack trace、SQL、token 與 provider 細節，內部 log 仍要保留可追查資訊。
- response started 後只能中止串流或關閉連線；背景工作失敗要透過任務狀態／queue 觀測，不能假裝成同步回應錯誤。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/error_handling.md)

<a id="q22"></a>
### Q22: FastAPI 的資料庫整合如何界定 session、transaction 與連線池？
<!-- Concept ID: concept.python.fastapi.database-integration; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請比較同步／非同步 ORM 與 driver，並說明如何處理 session lifecycle、pool saturation、rollback、N+1 與取消。

<details>
<summary>💡 答案提示</summary>

- async route 應搭配真正非同步 driver；同步 driver 需要明確的 thread pool 邊界，不能阻塞事件循環。
- 一個 request／transaction 擁有自己的 session 邊界，不能把同一 AsyncSession 跨平行 task 共用。
- 要觀察 pool active／wait、query latency、transaction time、rollback、timeout 與 N+1；取消路徑也必須歸還連線。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/database_integration.md)

<a id="q23"></a>
### Q23: FastAPI BackgroundTasks 何時不應取代 durable task queue？
<!-- Concept ID: concept.python.fastapi.background-task-lifecycle; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請比較 response 後的輕量工作與需要可靠投遞的背景工作，並說明取消、重試、冪等與 shutdown。

<details>
<summary>💡 答案提示</summary>

- BackgroundTasks 仍在 web process 生命週期內，process crash、部署或資源限制都可能丟失工作。
- 可靠通知需要 durable queue、attempt 狀態、有限 retry、dead-letter、idempotency key 與可觀測性。
- request-scoped session 不應被背景工作捕捉；shutdown 要停止接收並排空或交由 queue 恢復。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/background_tasks.md)

<a id="q24"></a>
### Q24: FastAPI WebSocket 如何處理長連線的生命週期與背壓？
<!-- Concept ID: concept.python.fastapi.websocket-lifecycle; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🟡 重要

請說明 handshake、認證、heartbeat、斷線清理、broadcast 與慢客戶端隔離。

<details>
<summary>💡 答案提示</summary>

- WebSocket 是長時間全雙工資源，handshake 的 auth／scope、連線狀態與 disconnect cleanup 都要明確。
- 每連線送出 queue、每租戶連線數與總連線數要有上限；慢客戶端不可阻塞所有 broadcast。
- heartbeat、timeout、取消與有界 queue 可避免半開連線和 RSS 無界上升，訊息順序要按租戶需求設計。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/websocket_support.md)

<a id="q25"></a>
### Q25: FastAPI 性能優化如何從指標而不是直覺開始？
<!-- Concept ID: concept.python.fastapi.performance-capacity; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請設計一套定位 event loop、serialization、資料庫、cache、worker 與下游瓶頸的容量分析方法。

<details>
<summary>💡 答案提示</summary>

- 把 P99 拆成 queue、validation、route CPU、下游 I/O、DB pool wait、serialization 和 response write。
- 快取、批次、併發、pool 和 worker 都有一致性、記憶體、下游壓力或 tail latency 代價，不是越大越好。
- 以固定 workload、錯誤注入、容量預算、backpressure 和 rollback threshold 驗證改善。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/performance_optimization.md)

<a id="q26"></a>
### Q26: FastAPI 生產部署如何設計 worker、健康檢查與 graceful shutdown？
<!-- Concept ID: concept.python.fastapi.deployment-runtime; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🟡 重要

請說明 container、worker、事件循環、pool、readiness／liveness、autoscaling 與 rolling rollback 的關係。

<details>
<summary>💡 答案提示</summary>

- 每個 worker 都可能有自己的 DB／HTTP pool、cache 與 task backlog，總容量會隨 process 和 replica 相乘。
- readiness 要在 drain 時停止新流量，graceful shutdown 要排空 HTTP、WebSocket 與 queue；liveness 不應把慢下游誤判成需重啟。
- worker 和 pool 要依 CPU、記憶體、下游 QPS、連線上限與 timeout 共同 sizing，秘密不能靠 image 或公開文件管理。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/deployment_and_containerization.md)

<a id="q27"></a>
### Q27: FastAPI 應如何組合 unit、integration、contract、WebSocket 與負載測試？
<!-- Concept ID: concept.python.fastapi.testing-strategy; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請設計涵蓋 dependency scope、資料庫 transaction、取消、認證、schema、WebSocket 與 deployment drain 的測試矩陣。

<details>
<summary>💡 答案提示</summary>

- unit test 適合 domain／validator；integration test 驗證真實 lifecycle、DB transaction、middleware 與依賴清理。
- contract／schema test 防止 OpenAPI 和 client drift；WebSocket、慢下游、取消、重試與 process shutdown 要有故障注入。
- dependency override 不能取代 production scope 驗證；load／soak test 要觀察 P99、pool、task、RSS、租戶公平性。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/testing_strategies.md)

<a id="q28"></a>
### Q28: FastAPI 自動 API 文檔如何成為可驗證的 OpenAPI 契約？
<!-- Concept ID: concept.python.fastapi.openapi-contract; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請說明 FastAPI 如何由 route metadata、型別提示與 Pydantic schema 產生 OpenAPI，並提出 schema review 與安全策略。

<details>
<summary>💡 答案提示</summary>

- OpenAPI 應準確反映參數、request／response、錯誤、認證、分頁與版本，而不是只服務 Swagger UI。
- 以 schema diff、client generation、contract test 和破壞性變更審查維持相容性。
- 內部管理 endpoint、debug 欄位、秘密與不應公開的 provider metadata 不應出現在外部 schema。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/FastAPI/automatic_api_documentation.md)

<a id="q29"></a>
### Q29: Django 認證與授權如何建立不會繞過租戶邊界的安全模型？
<!-- Concept ID: concept.python.django.authentication-permissions; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較 authentication、authorization、permission 與 object-level access control，並說明 session／token、CSRF 與 audit log 的邊界。

<details>
<summary>💡 答案提示</summary>

- 登入成功不等於有權存取任一 object；租戶與資源權限必須在每個受保護操作驗證。
- 認證 middleware、permission class、view query scope 與管理端點應有可測試且一致的責任。
- 要觀察拒絕率、越權測試、敏感欄位暴露與 audit log，而非只看登入成功率。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/authentication_and_permissions.md)


<a id="q30"></a>
### Q30: Django Cache 框架如何在效能與一致性之間取捨？
<!-- Concept ID: concept.python.django.caching-framework; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較 per-site、view、fragment 與低階 cache，並設計 key、TTL、失效、stampede 與租戶隔離策略。

<details>
<summary>💡 答案提示</summary>

- cache hit 不代表資料正確；key 必須包含會影響結果的租戶、權限與版本維度。
- 寫入後失效、短 TTL、single-flight 或 stale-while-revalidate 要依一致性需求選擇。
- 以 hit rate、stale ratio、eviction、backend latency 與 DB load 驗證，不要只追求更高 hit rate。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/caching_framework.md)


<a id="q31"></a>
### Q31: Django 應如何設計可回滾的生產部署？
<!-- Concept ID: concept.python.django.deployment-runtime; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請說明 WSGI／ASGI、worker、proxy、static files、migration、health check 與 graceful shutdown 的關係。

<details>
<summary>💡 答案提示</summary>

- readiness、liveness 與 drain 必須分開；shutdown 時應停止新流量並保留可恢復的工作。
- migration 應與 application rollout 相容，秘密、TLS、backup 和 log 不能靠開發設定。
- 以 P99、worker／pool、錯誤率、memory 與 drain time 設定警戒線和 rollback。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/deployment_best_practices.md)


<a id="q32"></a>
### Q32: Django ORM 的 QuerySet lazy evaluation 與 transaction 邊界會如何影響正確性？
<!-- Concept ID: concept.python.django.orm-architecture; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請解釋 Model、QuerySet、lazy evaluation、transaction、select_for_update 與 connection lifecycle 的關係。

<details>
<summary>💡 答案提示</summary>

- QuerySet 建立不一定執行 SQL；evaluation 發生時間會影響 transaction、鎖與 exception 的位置。
- 一個業務不變量要由正確的 transaction、isolation、constraint 或 row lock 保護。
- 用 generated SQL、query count、lock wait、慢查詢和 race test 證明設計。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/django_orm_deep_dive.md)


<a id="q33"></a>
### Q33: Django REST Framework 如何把 serializer、permission 與 transaction 組成可靠 API？
<!-- Concept ID: concept.python.django.rest-framework; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請設計 DRF API 的輸入驗證、serializer、permission、throttling、版本、分頁與 transaction 邊界。

<details>
<summary>💡 答案提示</summary>

- 輸入／輸出 serializer 應分離，permission 要在 object scope 驗證，不能靠 serializer 過濾安全問題。
- 錯誤 envelope、idempotency、版本與 schema 要保持向後相容，寫入與 side effect 要有明確 transaction 語意。
- 以 contract test、query count、throttle rate、schema diff 和 latency 驗證。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/django_rest_framework.md)


<a id="q34"></a>
### Q34: Django Form 與 ModelForm 如何區分輸入驗證、業務規則與資料庫一致性？
<!-- Concept ID: concept.python.django.forms-validation; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請說明 binding、clean、field error、ModelForm commit 與 CSRF 的責任，並處理重複提交。

<details>
<summary>💡 答案提示</summary>

- 表單格式錯誤、業務不變量與資料庫 unique／constraint 是不同層次，不能只在 HTML 驗證。
- ModelForm 的 commit、transaction、CSRF 與權限要配合，重試不能造成重複副作用。
- 以錯誤分類、重複提交、transaction rollback 與拒絕率測試驗證。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/forms_processing.md)


<a id="q35"></a>
### Q35: Django Middleware 的 onion order 如何影響短路、錯誤與資源清理？
<!-- Concept ID: concept.python.django.middleware-lifecycle; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請畫出 trace、security headers、session、authentication、timeout、exception 與 view 的進出順序。

<details>
<summary>💡 答案提示</summary>

- middleware 可在 view 前短路，也可在 response／exception 路徑補充 headers 或 cleanup。
- response started 後不能再寫第二個 body；timeout 必須連同取消和資源清理設計。
- 以 correlation ID、response status、response started、延遲與 teardown evidence 驗證順序。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/middleware_mechanism.md)


<a id="q36"></a>
### Q36: Django Migration 如何在大表與多版本部署中維持安全？
<!-- Concept ID: concept.python.django.migrations-safety; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請設計 migration graph、expand／contract、大表變更、data migration、鎖與 rollback 策略。

<details>
<summary>💡 答案提示</summary>

- 先新增相容欄位或表，再逐步 backfill，最後移除舊路徑；不要把長時間資料搬移塞進啟動。
- 要知道 migration 是否可逆、會持有哪些鎖、replica lag 與舊版 application 是否仍能運作。
- 以 migration plan、lock wait、錯誤率、replica lag、backup restore 與 staging rehearsal 驗證。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/migrations.md)


<a id="q37"></a>
### Q37: Django 性能優化為什麼必須先建立端到端容量模型？
<!-- Concept ID: concept.python.django.performance-capacity; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請把 middleware、view、ORM、cache、worker、serialization 與下游 I/O 拆成可觀測的延遲與容量預算。

<details>
<summary>💡 答案提示</summary>

- 先用 trace、query log、profile 和 load test 找瓶頸，再選 query、cache、batch、worker 或 async 工作。
- 增加 worker 或 pool 會乘法放大 DB、cache、下游和記憶體壓力，並非免費容量。
- 以 P99、query count、pool wait、cache hit、CPU／RSS 和 rollback threshold 驗證。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/performance_optimization.md)


<a id="q38"></a>
### Q38: Django QuerySet 如何避免 N+1 與過度預取？
<!-- Concept ID: concept.python.django.query-optimization; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較 select_related、prefetch_related、annotate、欄位投影、bulk 操作與 pagination 的使用邊界。

<details>
<summary>💡 答案提示</summary>

- select_related 適合單值 JOIN，prefetch_related 適合集合但可能增加記憶體與查詢；要依資料形狀選擇。
- 不要用盲目 prefetch 掩蓋錯誤的 API shape，values／only／iterator 也有 lazy 與 deferred 欄位代價。
- 以 query count、EXPLAIN、rows scanned、response size 和負載測試確認改善。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/query_optimization.md)


<a id="q39"></a>
### Q39: Django request-response cycle 如何界定 middleware、view、streaming 與 disconnect 的資源生命週期？
<!-- Concept ID: concept.python.django.request-response-lifecycle; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請從 WSGI／ASGI entry 追蹤 URL resolver、middleware、view、template、response、exception 與 client disconnect。

<details>
<summary>💡 答案提示</summary>

- 短路回應、exception、streaming 與一般 response 的 cleanup 路徑不同，不能只在 happy path 釋放資源。
- request context、session、transaction、下游呼叫與 cancellation 要有明確 owner。
- 用 trace、access log、status、分段耗時與 connection／file cleanup evidence 定位問題。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/request_response_cycle.md)


<a id="q40"></a>
### Q40: Django Security Best Practices 如何形成可驗證的 Web 威脅模型？
<!-- Concept ID: concept.python.django.security-boundary; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請整合 CSRF、XSS、SQL injection、session、TLS、CORS、上傳、secret 與 dependency patching。

<details>
<summary>💡 答案提示</summary>

- 安全設定不是單一開關；輸入、輸出、身份、授權、瀏覽器 cookie 和部署 headers 必須一起考慮。
- ORM 不能取代 object authorization，secret 不能進 source、image、log 或 trace。
- 以 security test、headers、secret scan、越權案例與事件 telemetry 證明控制有效。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/security_best_practices.md)


<a id="q41"></a>
### Q41: Django Signal 何時會破壞交易一致性與可觀測性？
<!-- Concept ID: concept.python.django.signal-architecture; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請比較 signal、明確 service、domain event 與 transaction.on_commit，並處理重複、失敗和順序。

<details>
<summary>💡 答案提示</summary>

- signal 會隱藏 control flow；需要可靠 side effect 時要明確區分 transaction 內工作與 commit 後 outbox。
- receiver 的重複註冊、例外、同步 I/O 和 retry 會放大請求延遲或造成重複副作用。
- 觀察 receiver invocation、transaction state、latency、retry、side effect idempotency 與 audit trail。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/signal_system.md)


<a id="q42"></a>
### Q42: Django 測試策略如何證明 lifecycle 與資料庫行為，而不是只有 view happy path？
<!-- Concept ID: concept.python.django.testing-strategy; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請設計涵蓋 model、form、view、API、middleware、migration、transaction、security 與負載的測試矩陣。

<details>
<summary>💡 答案提示</summary>

- unit test 適合純邏輯，integration test 才能驗證 ORM、middleware、transaction、context 和 cleanup。
- contract、security、故障注入、query count、migration rehearsal 與 load test 各自證明不同風險。
- fixture isolation、rollback、coverage、P99、故障重現率和 production-like settings 都要納入。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/testing_strategies.md)


<a id="q43"></a>
### Q43: Flask Application Context 與 Request Context 有什麼生命週期差異？
<!-- Concept ID: concept.python.flask.context-lifecycle; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較 application context、request context、context local、g、request、current_app 與背景工作的邊界。

<details>
<summary>💡 答案提示</summary>

- request context 通常包住 application context；push／pop、teardown 與 context local 不是全局共享。
- 背景 thread、task 或 callback 不能假設仍有 request context，需顯式傳值與建立資源 scope。
- 以 context error、teardown、correlation、resource release 和並發測試驗證 ownership。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/application_and_request_context.md)


<a id="q44"></a>
### Q44: Flask Blueprint 如何在大型服務中維持模組邊界？
<!-- Concept ID: concept.python.flask.blueprint-architecture; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 deferred registration、URL prefix、endpoint naming、局部 hook 與錯誤 handler。

<details>
<summary>💡 答案提示</summary>

- Blueprint 不是獨立 app；註冊時才把 routes、commands、handlers 加入 application，依賴方向要清楚。
- domain、API version、permission 和 error boundary 應按責任拆分，避免循環 import 和 endpoint collision。
- 用 route map、registration order、endpoint uniqueness 與 integration test 驗證。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/blueprint_architecture.md)


<a id="q45"></a>
### Q45: Flask Configuration 如何避免 debug、secret 與資料庫設定在環境間漂移？
<!-- Concept ID: concept.python.flask.configuration-management; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請設計 instance config、環境變數、分層設定、啟動驗證與 secret 管理。

<details>
<summary>💡 答案提示</summary>

- 設定應在 app factory 啟動時載入、驗證與記錄非敏感摘要，缺必要設定就 fail fast。
- debug、testing、cookie、CORS、database URL 和 secret key 不能由 production image 或預設值誤帶入。
- 以 config diff、secret scan、startup check、health response 和 rollout telemetry 驗證。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/configuration_management.md)


<a id="q46"></a>
### Q46: Flask 生產部署如何處理 WSGI worker、readiness 與 graceful shutdown？
<!-- Concept ID: concept.python.flask.deployment-runtime; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請說明 Flask app、WSGI server、worker、reverse proxy、static asset、health endpoint 與 process lifecycle。

<details>
<summary>💡 答案提示</summary>

- 每個 worker 都可能建立自己的 DB／HTTP pool；worker 增加會放大下游與記憶體，不是單純提升容量。
- drain 時 readiness 要失敗，shutdown 要停止新流量、排空可恢復工作並設定明確 grace period。
- 以 P99、worker queue、pool wait、RSS、drain time、5xx 和 rollback threshold 驗證。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/deployment_and_production.md)


<a id="q47"></a>
### Q47: Flask Error Handling 如何統一錯誤契約又避免 response double-write？
<!-- Concept ID: concept.python.flask.error-boundary; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請比較 HTTP handler、domain exception、未預期例外、Blueprint handler、teardown 與 response started 的處理。

<details>
<summary>💡 答案提示</summary>

- 對外回應要有穩定 status、error type、correlation ID 和 retry semantics；stack trace、secret、SQL 只留在受控 log。
- response 已開始後不能假設還能寫 JSON，應中止串流並完成 cleanup。
- 以錯誤分類、trace、status distribution、故障注入與重試測試驗證邊界。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/error_handling.md)


<a id="q48"></a>
### Q48: Flask Extension 如何在 Application Factory 與多 app 測試中維持資源隔離？
<!-- Concept ID: concept.python.flask.extension-lifecycle; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請說明 init_app、延遲初始化、app config、extension resource ownership、teardown 與版本相容。

<details>
<summary>💡 答案提示</summary>

- extension 實例可共享設定介面，但 connection、cache、client 等資源要依 app instance 建立與釋放。
- 初始化順序與 app context 要明確，不能在 import time 綁定單一 production app 或 request session。
- 以多 app isolation、初始化失敗、pool、teardown 和 integration test 證明 lifecycle。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/extension_system.md)


<a id="q49"></a>
### Q49: Flask-SQLAlchemy 的 session、context 與 transaction 邊界如何設計？
<!-- Concept ID: concept.python.flask.sqlalchemy-integration; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請界定 scoped session、application／request context、commit／rollback、pool、migration 與背景工作的 ownership。

<details>
<summary>💡 答案提示</summary>

- request 結束要 rollback 或 commit 並 remove session；背景工作要建立自己的 context／session，不能捕捉 request session。
- N+1、長 transaction、pool saturation、timeout 和 exception cleanup 都會直接影響吞吐與正確性。
- 觀察 pool wait、query count、transaction duration、rollback、context teardown 和慢查詢。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/flask_sqlalchemy_integration.md)


<a id="q50"></a>
### Q50: Flask Middleware、before_request 與 teardown hook 的順序有何差異？
<!-- Concept ID: concept.python.flask.middleware-hooks; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較 WSGI middleware、before_request、after_request、teardown 與 Blueprint hook 的執行順序和短路行為。

<details>
<summary>💡 答案提示</summary>

- before_request 可以短路；after_request 只處理已產生的 response，teardown 即使 exception 也應負責清理。
- trace、auth、CORS、timeout、response headers 和 resource ownership 不應靠註冊順序猜測。
- 用 short-circuit、response mutation、teardown error、latency 和 correlation log 測試。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/middleware_and_hooks.md)


<a id="q51"></a>
### Q51: Flask 性能優化如何避免只增加 worker 卻造成下游雪崩？
<!-- Concept ID: concept.python.flask.performance-capacity; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請拆解 WSGI worker、Python CPU、template、DB、cache、下游 I/O 與 response write 的容量預算。

<details>
<summary>💡 答案提示</summary>

- 先量測 event／thread queue、query、cache、downstream 和 serialization，再選 cache、query、Celery、pool 或 worker。
- 每 worker 的 connection pool、記憶體、thread queue 會乘上 process；下游 quota 是硬上限。
- 以 P99、worker queue、DB pool、cache hit、CPU／RSS、錯誤率和固定 workload 驗證。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/performance_optimization.md)


<a id="q52"></a>
### Q52: Flask Request 與 Response 對象如何形成安全且可演進的 HTTP 契約？
<!-- Concept ID: concept.python.flask.request-response-contract; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請比較 path、query、form、JSON、file、headers、cookies、content negotiation、streaming 與 payload limits。

<details>
<summary>💡 答案提示</summary>

- 輸入解析不是驗證；要明確限制型別、大小、巢狀深度、content type 和不可信欄位。
- response 應有穩定 schema、cookie flags、cache／security headers，streaming 要有 client disconnect cleanup。
- 以 payload limit、schema contract、headers、慢 client、錯誤率和 response latency 測試。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/request_and_response_objects.md)


<a id="q53"></a>
### Q53: Flask RESTful API 如何設計可相容、可觀測且可重試的資源邊界？
<!-- Concept ID: concept.python.flask.rest-api-design; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請設計 REST resource、method／status、serializer、pagination、validation、auth、idempotency、版本與 OpenAPI。

<details>
<summary>💡 答案提示</summary>

- HTTP status 和錯誤 envelope 要表達同步完成、已接受、重試或衝突；寫入 side effect 要有 idempotency。
- 輸入與輸出模型分離，permission、tenant scope、rate limit 和 schema diff 需進 contract review。
- 以 contract、security、query count、schema diff、latency、retry 和 duplicate tests 驗證。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/restful_api_development.md)


<a id="q54"></a>
### Q54: Flask Routing 如何避免 route collision、錯誤 method 與未授權路由暴露？
<!-- Concept ID: concept.python.flask.routing-dispatch; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請解釋 URL rule、converter、endpoint、method dispatch、strict slash、prefix 與反向 URL。

<details>
<summary>💡 答案提示</summary>

- route map 是可觀測的契約；同一路徑 method、版本 prefix、converter 與 Blueprint 註冊順序都會影響 dispatch。
- 404、405、redirect 與 auth failure 不應洩露管理路由或內部識別資訊。
- 用 route map、404／405 分布、collision test、trace 和 security test 驗證。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/routing_and_url_rules.md)


<a id="q55"></a>
### Q55: Flask Session 應如何在 cookie 便利性與撤銷能力之間取捨？
<!-- Concept ID: concept.python.flask.session-security; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較 signed cookie、server-side session、Redis store 與 token，並說明 rotation、cookie flags、TTL 和 fixation。

<details>
<summary>💡 答案提示</summary>

- signed cookie 可驗證完整性但不等於保密或即時撤銷；資料大小與 key rotation 都是運維問題。
- HttpOnly、Secure、SameSite、session fixation、replay、logout 和跨租戶隔離要一起設計。
- 以 cookie headers、session size、store latency、rotation／replay test 和失效率驗證。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/session_management.md)


<a id="q56"></a>
### Q56: Flask 測試策略如何同時驗證 app context、extension 與 production lifecycle？
<!-- Concept ID: concept.python.flask.testing-strategy; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請設計 pytest fixture、test_client、app／request context、extension、database、security、contract 與 load 測試。

<details>
<summary>💡 答案提示</summary>

- factory fixture 要保證每個測試 app、config、session、cache 和 extension 資源隔離並清理。
- happy path 不能取代 integration、故障注入、慢下游、取消、schema、security、shutdown 和壓測。
- 用 cleanup assertion、query count、coverage、P99、fixture isolation 和失敗重現率評估。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/testing_strategies.md)


<a id="q57"></a>
### Q57: Django 與 Flask 如何依系統約束而不是偏好做框架選型？
<!-- Concept ID: concept.python.web-framework-selection; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請比較 Django 的 batteries-included 與 Flask 的 microframework，並提出可量測的選型決策矩陣。

<details>
<summary>💡 答案提示</summary>

- Django 降低整合與一致性決策成本；Flask 提供較小核心但把 extension、契約、安全與維運責任交給團隊。
- 要把合規、資料模型、團隊技能、流量、部署、依賴風險、交付速度和長期 ownership 納入。
- 以 prototype、P99、缺陷率、security posture、operational toil 和 migration cost 驗證，而非只比 benchmark。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/django_vs_flask.md)


<a id="q58"></a>
### Q58: Flask Application Factory 如何改善多環境、測試與 extension 初始化？
<!-- Concept ID: concept.python.flask.application-factory; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 factory 延遲建立 app、載入 config、初始化 extension、註冊 Blueprint、啟動失敗與 cleanup。

<details>
<summary>💡 答案提示</summary>

- 每次 factory call 產生可隔離 app；extension 用 init_app，避免 import time 綁定單一 app。
- config validation、循環依賴、logging、資料庫與 background resource 都應有明確 startup／teardown。
- 用多環境 factory test、config snapshot、extension isolation、startup failure 和 telemetry 驗證。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/flask_application_factory.md)


<a id="q59"></a>
### Q59: Flask Blueprint 如何與 Application Factory 組合成可演進的模組架構？
<!-- Concept ID: concept.python.flask.blueprint-modularity; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請比較 Blueprint 的 registration、URL／endpoint 命名、版本、局部 hook 與 domain ownership。

<details>
<summary>💡 答案提示</summary>

- Blueprint 應表達模組邊界，不應偷偷持有全局 app、request session 或跨模組可變狀態。
- 在 factory 中集中註冊並用 prefix、error handler、permission 和依賴方向避免 collision。
- 以 route map、registration test、module ownership、版本相容與 deployment smoke test 驗證。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/flask_blueprint.md)

<a id="q60"></a>
### Q60: CPython 如何把原始碼編譯並交給執行迴圈？
<!-- Concept ID: concept.python.internals.compilation-execution; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請從 source、AST、code object／bytecode、`.pyc` 與 eval loop 說明編譯和執行邊界，並指出如何診斷啟動差異。

<details>
<summary>💡 答案提示</summary>

- CPython 會先解析並編譯成 code object／bytecode，再由虛擬機執行；bytecode 不是 CPU 原生機器碼。
- `.pyc` 是可失效的 import cache，必須考慮 Python 版本、source／hash、容器與部署環境，不是跨版本 artifact 契約。
- 用 import trace、啟動 profiling、`dis`／code object 觀察與 clean environment 對照來分離編譯、import side effect 和 runtime 成本。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Internals/compilation_and_execution.md)


<a id="q61"></a>
### Q61: Python 動態類型、鴨子類型與 Type Hint 的責任邊界是什麼？
<!-- Concept ID: concept.python.internals.type-system-duck-typing; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請比較 runtime typing、duck typing、Protocol 與靜態型別檢查，並說明它們如何影響測試設計與 API 相容性。

<details>
<summary>💡 答案提示</summary>

- 動態型別把許多錯誤延後到實際路徑執行；鴨子類型依行為契約而不是名義繼承，但錯誤可能在深層路徑才出現。
- Type hint、Protocol 和 mypy／pyright 是開發與 CI 的靜態證據，不會自動把 Python runtime 變成靜態型別語言。
- 測試要涵蓋有效實作、缺少方法、錯誤型別與相容變更；不能只用 mock 讓型別錯誤永遠不會執行。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Internals/type_system_and_duck_typing.md)


<a id="q62"></a>
### Q62: pytest fixture scope 如何在效能與測試隔離之間取捨？
<!-- Concept ID: concept.python.testing.fixture-lifecycle; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 fixture 的依賴解析、scope、autouse 與 teardown，並設計不受順序和並行執行影響的資源生命週期。

<details>
<summary>💡 答案提示</summary>

- scope 越大不代表越好；資料庫、cache、檔案、event loop 等資源要依成本、可變狀態與 ownership 選擇生命週期。
- yield／finalizer 必須在成功、例外、取消與測試失敗後清理；autouse fixture 要避免隱藏昂貴或有副作用的依賴。
- 用隨機順序、xdist、重跑、失敗中斷與 cleanup assertion 驗證 fixture isolation。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Testing/fixtures_and_dependency_injection.md)


<a id="q63"></a>
### Q63: Python 測試如何劃分 unit、integration、contract 與 E2E 邊界？
<!-- Concept ID: concept.python.testing.integration-boundary; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請以資料庫、HTTP 下游、訊息或檔案系統為例，說明各層測試應使用真實依賴、fake 或 mock 的時機。

<details>
<summary>💡 答案提示</summary>

- unit test 聚焦單一行為與快速回饋；integration／component test 驗證多元件協作；contract test 驗證跨服務 schema；E2E 驗證少量關鍵流程。
- mock 可以隔離，但不能取代真實 transaction、serialization、timeout、retry 與資源 cleanup 的整合證據。
- 依風險安排測試矩陣，對慢下游、資料隔離、失敗重試和 deployment smoke path 做可重現的故障注入。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Testing/integration_testing.md)


<a id="q64"></a>
### Q64: Mock 與 Patch 應該在哪個命名空間使用，如何避免過度隔離？
<!-- Concept ID: concept.python.testing.mock-boundary; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較 mock、stub、fake、spy，說明 patch where used、autospec 和 interaction test 的風險。

<details>
<summary>💡 答案提示</summary>

- patch 應放在被測模組查找依賴的命名空間，而不是只改依賴原始定義所在的模組。
- autospec／spec_set 可縮小介面漂移，但仍不能證明真實 HTTP、資料庫、序列化或重試契約。
- 以行為結果為主，只有對外部副作用、冪等、呼叫次數或順序有明確契約時才驗證 interaction。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Testing/mocking_and_patching.md)


<a id="q65"></a>
### Q65: 參數化測試如何增加邊界覆蓋而不造成案例爆炸？
<!-- Concept ID: concept.python.testing.parametrized-testing; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請設計具可讀 ID 的多組案例，涵蓋有效值、邊界、錯誤和組合條件，並說明如何控制執行成本。

<details>
<summary>💡 答案提示</summary>

- 每個案例應代表可說明的行為差異，使用明確 ID 讓 CI 失敗能直接定位輸入與預期。
- 多參數笛卡兒積可能讓 suite 成本失控；可用等價類、邊界分析、代表性組合和分層標記控制數量。
- 參數化不應只追求行覆蓋率，還要檢查錯誤訊息、狀態轉換、property／mutation 或故障注入是否真的會使測試失敗。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Testing/parametrized_testing.md)


<a id="q66"></a>
### Q66: 如何用 pytest 的 discovery、fixture 與 plugin 建立可診斷的測試套件？
<!-- Concept ID: concept.python.testing.pytest-framework; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 pytest collection、設定來源、markers、plugins、fixture 發現與並行執行，並提出 CI flake 的診斷方法。

<details>
<summary>💡 答案提示</summary>

- 先固定 pytest／plugin／Python 版本與設定來源，再查看 collection、marker、fixture graph 和 test duration。
- xdist、隨機順序或重試可協助重現問題，但不能用 retry 掩蓋共享狀態、未清理資源或非決定性依賴。
- 對 collection error、fixture scope、plugin hook、輸出 log 和最小重現案例分層取證。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Testing/pytest_framework.md)


<a id="q67"></a>
### Q67: 測試覆蓋率為什麼不是品質的單一答案？
<!-- Concept ID: concept.python.testing.coverage-signal; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請比較 line、branch、changed-code coverage 與 quality gate，並說明如何避免排除規則或無效斷言製造虛假的信心。

<details>
<summary>💡 答案提示</summary>

- line coverage 只表示執行過，branch coverage 能暴露條件分支，但兩者都不保證斷言驗證正確行為。
- 應關注高風險與變更程式碼、失敗路徑、錯誤處理、權限、取消與資料一致性，而不是只把全域百分比調高。
- 檢查 source include／omit、generated code、測試本身、branch gap，搭配 mutation 或故障注入觀察測試是否能抓到錯誤。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Testing/test_coverage.md)


<a id="q68"></a>
### Q68: TDD 的 Red-Green-Refactor 如何改善設計而不是製造脆弱測試？
<!-- Concept ID: concept.python.testing.tdd-feedback-loop; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請說明 TDD 的回饋循環、行為契約與重構安全網，並指出何時需要補上 integration 或 contract test。

<details>
<summary>💡 答案提示</summary>

- Red 必須先證明測試能捕捉缺陷，Green 只做最小實作，Refactor 則在行為不變下改善設計。
- 測試應描述可觀察行為與 domain contract，不要把每個私有呼叫、內部資料結構或 mock interaction 當成永久契約。
- TDD 不會消除外部系統風險；資料庫、網路、async、schema、部署與非功能需求仍需較高層測試。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Testing/test_driven_development.md)


<a id="q69"></a>
### Q69: 如何可靠測試 Python 非同步程式的取消、例外與資源清理？
<!-- Concept ID: concept.python.testing.async-testing; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請設計 pytest-asyncio 測試，涵蓋 event loop scope、async fixture、timeout、cancellation、pending task 和非同步 mock。

<details>
<summary>💡 答案提示</summary>

- 每個測試要明確擁有 event loop 與背景 task；測試結束時檢查 pending task、未 await coroutine、連線和 semaphore 是否回收。
- 不要靠任意 sleep 等待時序；用可控 gate、事件、fake clock 或明確的 completion signal 驗證競態和 timeout。
- 對成功、例外、取消、部分完成和慢下游分別驗證 cleanup、重試與 idempotency。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Testing/testing_async_code.md)


<a id="q70"></a>
### Q70: 高品質 Python unit test 如何維持快速、獨立且可重複？
<!-- Concept ID: concept.python.testing.unit-test-design; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請用 FIRST、單一責任、清楚命名與資源隔離說明如何設計 unit test，並診斷 flaky 或過度 mock 的 suite。

<details>
<summary>💡 答案提示</summary>

- 測試要快速、獨立、可重複、自我驗證且及時，並讓 failure message 能說明行為差異。
- 固定時間、隨機性、環境與外部副作用；共享 fixture 要有明確 ownership，避免測試順序或全局狀態影響結果。
- 若測試只驗證 mock 呼叫而不驗證結果，應補 integration／contract 證據並重新評估抽象邊界。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Testing/unit_testing_best_practices.md)


<a id="q71"></a>
### Q71: Poetry 如何讓 Python 依賴與 CI 建置可重現？
<!-- Concept ID: concept.python.tooling.poetry-reproducibility; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較 `pyproject.toml`、lock resolution、Python markers、package mode 與 clean CI install，並提出 lock drift 的防護方式。

<details>
<summary>💡 答案提示</summary>

- `pyproject.toml` 表達直接需求與專案 metadata；lock file 固定完整 dependency graph、版本與來源條件，兩者責任不同。
- CI 應使用受控 Python／Poetry 版本、驗證 lock 未漂移、固定 artifact／hash 並在乾淨環境安裝，而非默默重新解析。
- 多 Python 版本、marker、optional group、editable／package mode 和私有來源都要進入矩陣；失敗時保留 dependency diff 與可回滾 artifact。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Tooling/poetry_dependency_management.md)

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
| 能診斷 FastAPI async route 的事件循環阻塞 | ⬜ |

**建議**：未能完整回答的題目，請回到對應的詳細文章深入學習。
