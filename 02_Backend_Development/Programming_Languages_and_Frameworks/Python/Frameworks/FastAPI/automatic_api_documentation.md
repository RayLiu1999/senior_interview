# FastAPI 自動 API 文檔生成

- **難度**: 5
- **重要性**: 4
- **標籤**: `OpenAPI`, `Swagger`, `ReDoc`

## 問題詳述

FastAPI 如何自動生成交互式 API 文檔？解釋 OpenAPI、Swagger UI 和 ReDoc 的作用及其配置方式。

## 核心理論與詳解

### OpenAPI 規範基礎

FastAPI 自動生成符合 **OpenAPI 3.0+** 規範的 API 文檔，這是一個業界標準，用於描述 RESTful API 的結構、端點、參數、響應格式等。

**核心特性**：
- **自動生成**：基於 Python 類型提示和 Pydantic 模型自動生成完整的 API 規範
- **交互式文檔**：提供兩個內建的 UI 界面（Swagger UI 和 ReDoc）
- **實時更新**：代碼變更後文檔自動同步更新
- **零額外配置**：無需手動編寫 YAML 或 JSON 配置文件

### 自動文檔生成機制

FastAPI 通過以下方式自動生成文檔：

**1. 路徑操作元數據提取**
```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(
    title="我的 API",
    description="這是一個示例 API",
    version="1.0.0"
)

class Item(BaseModel):
    name: str
    price: float
    description: str | None = None

@app.post("/items/", response_model=Item, tags=["items"])
async def create_item(item: Item):
    """
    創建一個新項目：
    
    - **name**: 項目名稱
    - **price**: 項目價格
    - **description**: 可選的描述
    """
    return item
```

**2. 類型提示轉換為 JSON Schema**
- Pydantic 模型自動轉換為 JSON Schema
- 路徑參數、查詢參數、請求體都會被自動記錄
- 響應模型生成響應示例

**3. 文檔字符串 (Docstring) 作為描述**
- 函數的 docstring 自動成為端點描述
- 支持 Markdown 格式
- 可以包含詳細的使用說明

### 內建文檔界面

**Swagger UI**（訪問 `/docs`）
- 交互式界面，可直接測試 API
- 顯示請求/響應格式
- 支持認證測試
- 實時顯示請求結果

**ReDoc**（訪問 `/redoc`）
- 更美觀的文檔展示
- 更適合閱讀和分享
- 三欄布局，更清晰的結構
- 不支持直接測試（只讀）

### 自定義文檔配置

**1. 元數據配置**
```python
from fastapi import FastAPI

app = FastAPI(
    title="企業 API",
    description="詳細的 API 描述，支持 **Markdown**",
    version="2.5.0",
    terms_of_service="http://example.com/terms/",
    contact={
        "name": "API 支持團隊",
        "url": "http://example.com/contact/",
        "email": "support@example.com",
    },
    license_info={
        "name": "Apache 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0.html",
    },
)
```

**2. 禁用或自定義文檔路徑**
```python
# 禁用文檔
app = FastAPI(docs_url=None, redoc_url=None)

# 自定義路徑
app = FastAPI(
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)
```

**3. 標籤和分組**
```python
tags_metadata = [
    {
        "name": "users",
        "description": "用戶管理操作",
    },
    {
        "name": "items",
        "description": "項目相關操作",
        "externalDocs": {
            "description": "外部文檔",
            "url": "https://example.com/docs",
        },
    },
]

app = FastAPI(openapi_tags=tags_metadata)

@app.get("/users/", tags=["users"])
async def get_users():
    pass
```

### OpenAPI Schema 訪問

**獲取原始 OpenAPI JSON**
- 訪問 `/openapi.json` 獲取完整的 OpenAPI 規範
- 可用於生成客戶端 SDK
- 可導入到其他 API 工具（如 Postman）

**程序化訪問**
```python
from fastapi.openapi.utils import get_openapi

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="自定義標題",
        version="2.5.0",
        description="自定義描述",
        routes=app.routes,
    )
    
    # 添加自定義擴展
    openapi_schema["info"]["x-logo"] = {
        "url": "https://example.com/logo.png"
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
```

### 文檔生成的最佳實踐

**1. 完善的類型提示**
- 使用精確的類型註解
- 利用 `Optional`、`Union`、`List` 等類型
- 為 Pydantic 模型添加 `Field` 描述

**2. 清晰的文檔字符串**
```python
@app.post("/items/")
async def create_item(item: Item):
    """
    創建新項目
    
    此端點用於創建新的項目記錄。
    
    ## 參數說明
    - **name**: 項目的唯一名稱
    - **price**: 必須為正數
    - **description**: 可選的詳細描述
    
    ## 返回值
    返回創建成功的項目對象
    """
    return item
```

**3. 使用示例值**
```python
from pydantic import BaseModel, Field

class Item(BaseModel):
    name: str = Field(..., example="示例項目")
    price: float = Field(..., gt=0, example=99.99)
    description: str | None = Field(None, example="這是描述")
```

**4. 響應模型和狀態碼**
```python
from fastapi import status

@app.post(
    "/items/",
    response_model=Item,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "項目創建成功"},
        400: {"description": "請求數據無效"},
        409: {"description": "項目已存在"},
    }
)
async def create_item(item: Item):
    pass
```

### 文檔生成的優勢

**開發效率**
- 無需額外維護文檔
- 代碼即文檔，永遠同步
- 減少文檔過期問題

**團隊協作**
- 前後端共享統一的 API 規範
- 可導出為 OpenAPI 文件給第三方
- 支持 API 版本管理

**測試便利**
- Swagger UI 提供即時測試功能
- 無需額外的 API 測試工具
- 快速驗證 API 行為

**客戶端生成**
- 使用 OpenAPI Generator 生成多語言客戶端
- 自動生成類型安全的 SDK
- 減少集成錯誤

## 關鍵要點

FastAPI 的自動文檔生成是其最大賣點之一，通過 OpenAPI 標準和 Python 類型提示，實現了零配置的交互式 API 文檔。開發者只需編寫類型安全的代碼，就能自動獲得完整、準確且美觀的 API 文檔，大幅提升開發效率和團隊協作體驗。善用 Swagger UI 和 ReDoc 的不同特性，可以滿足測試和閱讀的不同需求。
