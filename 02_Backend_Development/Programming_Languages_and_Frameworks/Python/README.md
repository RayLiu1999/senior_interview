# Python 程式語言

Python 是一門簡潔優雅且功能強大的程式語言，廣泛應用於 Web 開發、數據科學、機器學習和自動化等領域。作為資深後端工程師，您需要深入理解 Python 的語言特性、併發模型、底層原理以及現代 Web 框架。本章節涵蓋了面試中最常被考察的 Python 核心主題。

## 核心概念

### Core（核心特性）

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Python 數據模型](./Core/python_data_model.md) | 7 | 5 | `Data Model`, `Magic Methods` |
| [裝飾器詳解](./Core/decorators_explained.md) | 6 | 5 | `Decorator`, `Wrapper` |
| [生成器與 yield](./Core/generators_and_yield.md) | 6 | 5 | `Generator`, `Yield`, `Iterator` |
| [GIL 全局解釋器鎖](./Core/gil_explained.md) | 8 | 5 | `GIL`, `Threading`, `Concurrency` |
| [描述符協議](./Core/descriptors_protocol.md) | 8 | 4 | `Descriptor`, `Property` |
| [元類詳解](./Core/metaclasses_in_python.md) | 9 | 3 | `Metaclass`, `Type` |

完整列表請參考 [Core README](./Core/README.md)

### Concurrency（併發模型）

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Threading vs Multiprocessing vs Asyncio](./Concurrency/threading_vs_multiprocessing_vs_asyncio.md) | 8 | 5 | `Threading`, `Multiprocessing`, `Asyncio` |

完整列表請參考 [Concurrency README](./Concurrency/README.md)

### Internals（底層原理）

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [記憶體管理與 GC](./Internals/memory_management_and_gc.md) | 8 | 5 | `Memory`, `GC`, `Reference Counting` |
| [Python 對象模型](./Internals/python_object_model.md) | 8 | 4 | `Object Model`, `PyObject` |
| [編譯與執行](./Internals/compilation_and_execution.md) | 7 | 4 | `Bytecode`, `Compiler`, `Interpreter` |
| [類型系統與鴨子類型](./Internals/type_system_and_duck_typing.md) | 6 | 4 | `Type System`, `Duck Typing` |

完整列表請參考 [Internals README](./Internals/README.md)

## 框架

### Web 框架比較

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Django vs Flask vs FastAPI](./Frameworks/django_vs_flask_vs_fastapi.md) | 6 | 5 | `Django`, `Flask`, `FastAPI` |

### Django

完整列表請參考 [Django README](./Frameworks/Django/README.md)

**核心概念**：
- ORM 與查詢優化
- Middleware 機制
- Signal 系統
- Django REST Framework

### Flask

完整列表請參考 [Flask README](./Frameworks/Flask/README.md)

**核心概念**：
- Application Context
- Request Context
- Blueprint 架構
- Extension 系統

### FastAPI

完整列表請參考 [FastAPI README](./Frameworks/FastAPI/README.md)

**核心概念**：
- 依賴注入系統
- Pydantic 數據驗證
- 異步路由處理
- OpenAPI 自動生成

### Testing（測試）

完整列表請參考 [Testing README](./Testing/README.md)

**核心主題**：
- pytest 框架與 fixtures
- Mock 與 Patch
- 測試覆蓋率
- 集成測試策略

---

## 學習建議

### 學習路徑

#### 初級階段（1-3 個月）

1. **Python 基礎**：語法、數據結構、函數、類
2. **標準庫**：collections、itertools、functools
3. **文件處理**：讀寫文件、JSON、CSV
4. **基礎 Web**：HTTP 協議、Flask 基礎
5. **虛擬環境**：venv、pip、requirements.txt

#### 中級階段（3-6 個月）

1. **進階特性**：裝飾器、生成器、上下文管理器
2. **併發編程**：threading、multiprocessing、asyncio
3. **Web 框架**：Django 或 FastAPI
4. **數據庫**：SQLAlchemy、Django ORM
5. **測試**：pytest、unittest、mock

#### 高級階段（6-12 個月）

1. **底層原理**：GIL、記憶體管理、字節碼
2. **性能優化**：profiling、Cython、並發優化
3. **架構設計**：微服務、異步架構、CQRS
4. **高級特性**：元類、描述符、協議
5. **生產實踐**：部署、監控、日誌

### 框架選擇指南

| 需求 | 推薦框架 | 理由 |
|------|----------|------|
| 企業級完整應用 | Django | 功能完整、開箱即用、ORM 強大 |
| 輕量級 API | Flask | 靈活、擴展性強、學習曲線平緩 |
| 現代高性能 API | FastAPI | 異步、類型提示、自動文檔 |
| 微服務架構 | FastAPI | 異步支持、輕量、高性能 |
| 快速原型開發 | Flask | 簡單直接、快速上手 |

### 核心知識點

#### 語言特性

- ✅ **數據模型**：Magic Methods、Protocol、Duck Typing
- ✅ **函數式特性**：裝飾器、閉包、生成器、推導式
- ✅ **對象系統**：類、繼承、元類、描述符
- ✅ **類型系統**：Type Hints、Protocol、Generic
- ✅ **併發模型**：GIL、Threading、Asyncio、Multiprocessing

#### 底層原理

- ✅ **CPython 實現**：PyObject、引用計數、GC
- ✅ **字節碼**：編譯過程、dis 模塊、優化
- ✅ **記憶體管理**：引用計數、循環垃圾回收、內存池
- ✅ **GIL**：工作原理、性能影響、解決方案

#### Web 開發

- ✅ **Django**：MTV 架構、ORM、Middleware、Signal
- ✅ **Flask**：WSGI、Blueprint、Context、Extension
- ✅ **FastAPI**：ASGI、依賴注入、Pydantic、異步
- ✅ **異步**：asyncio、aiohttp、async/await

## Python 版本建議

- **最低版本**：Python 3.8（Type Hints、Walrus Operator）
- **推薦版本**：Python 3.10+（Pattern Matching、Better Error Messages）
- **生產環境**：Python 3.11+（性能提升 10-60%）
- **新項目**：Python 3.12+（更好的錯誤提示、性能優化）

## 推薦資源

### 官方文檔

- [Python 官方文檔](https://docs.python.org/3/)
- [Django 官方文檔](https://docs.djangoproject.com/)
- [Flask 官方文檔](https://flask.palletsprojects.com/)
- [FastAPI 官方文檔](https://fastapi.tiangolo.com/)

### 經典書籍

- **《Fluent Python》** - Luciano Ramalho
- **《Effective Python》** - Brett Slatkin
- **《Python Cookbook》** - David Beazley, Brian K. Jones
- **《High Performance Python》** - Micha Gorelick, Ian Ozsvald

### 進階資源

- [Real Python](https://realpython.com/) - 高質量教程
- [Python Enhancement Proposals (PEPs)](https://peps.python.org/) - Python 改進提案
- [Talk Python Podcast](https://talkpython.fm/) - Python 播客
- [Awesome Python](https://github.com/vinta/awesome-python) - Python 資源集合
