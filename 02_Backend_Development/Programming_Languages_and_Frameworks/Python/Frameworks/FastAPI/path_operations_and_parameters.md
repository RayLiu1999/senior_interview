# FastAPI 路徑操作與參數

- **難度**: 5
- **重要程度**: 5
- **標籤**: `Path Operation`, `Query`, `Body`, `Parameters`

## 問題詳述

深入探討 FastAPI 中的路徑操作定義、各種參數類型（路徑參數、查詢參數、請求體、表單、文件等）的使用方法、數據驗證以及最佳實踐。

## 核心理論與詳解

### 路徑操作基礎

**路徑操作（Path Operation）** 是指 HTTP 方法（GET、POST、PUT、DELETE 等）與特定 URL 路徑的組合。FastAPI 使用裝飾器（如 `@app.get()`、`@app.post()`）來定義路徑操作，這是構建 API 的基礎。

**操作函數（Operation Function）** 是被路徑操作裝飾器修飾的 Python 函數，處理匹配該路徑和方法的請求。函數參數通過類型提示告訴 FastAPI 如何解析和驗證數據。

**自動文檔生成**：FastAPI 自動從路徑操作中生成 OpenAPI 規範和交互式文檔（Swagger UI 和 ReDoc）。文檔反映了所有參數、請求體模型和響應模型。

### HTTP 方法裝飾器

**@app.get()**：定義 GET 操作，用於獲取資源。GET 請求不應該有請求體，只能使用路徑參數和查詢參數。

**@app.post()**：定義 POST 操作，用於創建資源或提交數據。通常包含請求體。

**@app.put()**：定義 PUT 操作，用於完整更新資源。客戶端提供資源的完整表示。

**@app.patch()**：定義 PATCH 操作，用於部分更新資源。只需提供要修改的字段。

**@app.delete()**：定義 DELETE 操作，用於刪除資源。

**其他方法**：FastAPI 支持所有標準 HTTP 方法，包括 OPTIONS、HEAD、TRACE 等。

### 路徑參數

**定義方式**：在路徑字符串中使用花括號 `{}` 定義路徑參數，如 `/items/{item_id}`。參數名必須與函數參數名匹配。

**類型轉換**：通過函數參數的類型提示，FastAPI 自動進行類型轉換和驗證。例如 `item_id: int` 會將路徑中的字符串轉換為整數。

**Path 類**：使用 `Path()` 可以添加額外的驗證和元數據。支持 `gt`（大於）、`ge`（大於等於）、`lt`（小於）、`le`（小於等於）、`min_length`、`max_length` 等約束。

**路徑參數順序**：路徑參數必須按照路徑中出現的順序定義。多個路徑參數時要注意順序。

### 查詢參數

**定義方式**：函數參數如果不在路徑中出現，且不是請求體模型，就是查詢參數。查詢參數是 URL 中 `?` 後面的鍵值對。

**可選參數**：使用 `Optional[type]` 或設置默認值 `None` 使查詢參數可選。沒有默認值的參數是必需的。

**默認值**：可以為查詢參數設置默認值，如 `skip: int = 0`。當客戶端不提供該參數時使用默認值。

**Query 類**：`Query()` 提供豐富的驗證選項和元數據。可以設置 `min_length`、`max_length`、`regex` 模式、`alias`（別名）等。

**列表參數**：使用 `List[type]` 接收多個同名參數的值，如 `?tags=python&tags=fastapi`。

### 請求體

**Pydantic 模型**：使用 Pydantic `BaseModel` 定義請求體結構。FastAPI 自動解析 JSON 並驗證數據。

**多個請求體參數**：可以在一個操作中使用多個 Pydantic 模型作為參數。FastAPI 會期望 JSON 中有對應的鍵。

**Body 類**：`Body()` 可以為請求體參數添加額外配置。使用 `embed=True` 可以強制將單個模型嵌入到特定鍵下。

**混合參數**：可以同時使用路徑參數、查詢參數和請求體。FastAPI 根據參數位置和類型自動識別。

### 表單數據

**Form 類**：使用 `Form()` 接收 HTML 表單數據（`application/x-www-form-urlencoded` 或 `multipart/form-data`）。

**與請求體區別**：表單數據的 content-type 不同於 JSON。不能在同一個操作中同時使用 `Form` 和請求體（Pydantic 模型）。

**文件上傳**：表單數據常用於文件上傳場景，因為文件需要 `multipart/form-data` 編碼。

### 文件上傳

**File 類**：`File()` 用於接收上傳的文件。文件以字節形式讀取到內存中。

**UploadFile 類**：`UploadFile` 是更高級的文件處理方式，提供類文件對象接口。文件存儲在內存中，超過大小閾值後自動存儲到磁盤。

**多文件上傳**：使用 `List[UploadFile]` 接收多個文件上傳。

**文件元數據**：`UploadFile` 提供 `filename`、`content_type`、`size` 等屬性。

**異步文件操作**：`UploadFile` 的讀寫方法是異步的，如 `await file.read()`、`await file.write()`。

### Header 參數

**Header 類**：使用 `Header()` 從 HTTP headers 中提取值。參數名會自動轉換（下劃線轉連字符）。

**自動轉換**：`user_agent: str = Header(None)` 會從 `User-Agent` header 讀取值。可以使用 `alias` 參數自定義 header 名稱。

**重複 Headers**：某些 headers 可以有多個值，使用 `List[str]` 接收。

### Cookie 參數

**Cookie 類**：使用 `Cookie()` 從請求 cookies 中提取值。

**安全性考慮**：Cookies 可以被客戶端修改，不應存儲敏感信息。對安全要求高的數據應該在服務器端驗證。

### 參數驗證

**數值驗證**：使用 `gt`、`ge`、`lt`、`le` 進行數值範圍驗證。例如 `age: int = Query(..., ge=0, le=120)` 確保年齡在 0-120 之間。

**字符串驗證**：使用 `min_length`、`max_length`、`regex` 驗證字符串。正則表達式可以確保格式正確。

**列表驗證**：可以限制列表的最小和最大長度。

**自定義驗證器**：在 Pydantic 模型中使用 `@validator` 裝飾器添加自定義驗證邏輯。

### 元數據和文檔

**title 和 description**：為參數添加 title 和 description，會出現在自動生成的文檔中。

**example 和 examples**：提供示例值，幫助 API 用戶理解參數用途。

**deprecated**：標記參數為已棄用，會在文檔中顯示警告。

**操作元數據**：路徑操作裝飾器可以接收 `summary`、`description`、`tags`、`response_description` 等參數來豐富文檔。

### 響應模型

**response_model 參數**：指定響應的 Pydantic 模型。FastAPI 會驗證響應數據並自動生成文檔。

**response_model_exclude_unset**：只返回實際設置的字段，不返回默認值。

**response_model_exclude_none**：不返回值為 None 的字段。

**多個響應模型**：使用 `responses` 參數定義不同狀態碼的響應模型。

### 狀態碼

**status_code 參數**：在路徑操作裝飾器中指定默認響應狀態碼，如 `status_code=201`。

**status 模塊**：使用 `from fastapi import status` 訪問預定義的狀態碼常量，如 `status.HTTP_201_CREATED`。

**動態狀態碼**：在操作函數中使用 `Response` 對象動態設置狀態碼。

### 依賴注入預覽

**Depends**：雖然是依賴注入的主題，但它常用於參數中。可以用於共享邏輯、認證、數據庫會話等。

**作為參數**：`Depends()` 的結果可以作為參數注入到操作函數中。

### 路徑操作配置

**tags**：為操作分組，在文檔中按 tag 組織。

**summary 和 description**：為操作添加摘要和詳細描述。

**response_description**：描述響應內容。

**deprecated**：標記操作為已棄用。

### 最佳實踐

**類型提示**：始終使用類型提示，這是 FastAPI 的核心。清晰的類型提示既服務於 FastAPI，也幫助 IDE 提供更好的自動補全。

**參數順序**：按照 路徑參數 → 查詢參數 → 請求體 的順序組織函數參數。

**使用 Pydantic 模型**：對於複雜的請求體，創建 Pydantic 模型而不是使用多個 `Body()` 參數。

**文檔完善**：為參數添加描述和示例，為操作添加標籤和描述。良好的文檔是 API 可用性的關鍵。

**驗證充分**：利用 FastAPI 的驗證功能，在數據進入業務邏輯前確保其有效性。

## 程式碼範例

```python
from fastapi import FastAPI, Path, Query, Body, Header, Cookie, Form, File, UploadFile, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from enum import Enum

app = FastAPI()


# 1. 基本路徑操作
@app.get("/")
async def root():
    """根端點"""
    return {"message": "Hello World"}


# 2. 路徑參數
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    """讀取物品（路徑參數自動轉為整數）"""
    return {"item_id": item_id}


# 3. 路徑參數驗證
@app.get("/users/{user_id}")
async def read_user(
    user_id: int = Path(..., title="用戶 ID", ge=1, description="用戶的唯一標識符")
):
    """讀取用戶（ID 必須 >= 1）"""
    return {"user_id": user_id}


# 4. 枚舉路徑參數
class ModelName(str, Enum):
    """模型名稱枚舉"""
    alexnet = "alexnet"
    resnet = "resnet"
    lenet = "lenet"


@app.get("/models/{model_name}")
async def get_model(model_name: ModelName):
    """獲取模型（只接受預定義的值）"""
    if model_name == ModelName.alexnet:
        return {"model_name": model_name, "message": "Deep Learning FTW!"}
    
    return {"model_name": model_name, "message": f"Model {model_name.value}"}


# 5. 查詢參數
@app.get("/items/")
async def list_items(
    skip: int = 0,  # 默認值 0
    limit: int = 10,  # 默認值 10
    q: Optional[str] = None  # 可選參數
):
    """列出物品（帶分頁和搜索）"""
    results = {"skip": skip, "limit": limit}
    if q:
        results["q"] = q
    return results


# 6. 查詢參數驗證
@app.get("/search/")
async def search(
    q: str = Query(
        ...,  # 必需參數
        min_length=3,
        max_length=50,
        regex="^[a-zA-Z0-9 ]+$",
        title="搜索查詢",
        description="搜索關鍵詞，只能包含字母、數字和空格"
    )
):
    """搜索（查詢字符串有嚴格驗證）"""
    return {"query": q}


# 7. 列表查詢參數
@app.get("/tags/")
async def filter_by_tags(
    tags: List[str] = Query([], description="標籤列表")
):
    """按標籤過濾（可以提供多個 tags 參數）"""
    # URL 示例: /tags/?tags=python&tags=fastapi
    return {"tags": tags}


# 8. 請求體 - Pydantic 模型
class Item(BaseModel):
    """物品模型"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: float = Field(..., gt=0, description="價格必須大於 0")
    tax: Optional[float] = Field(None, ge=0)
    tags: List[str] = Field(default_factory=list)
    
    class Config:
        schema_extra = {
            "example": {
                "name": "Foo",
                "description": "A very nice Item",
                "price": 35.4,
                "tax": 3.2,
                "tags": ["electronics", "sale"]
            }
        }


@app.post("/items/", status_code=status.HTTP_201_CREATED)
async def create_item(item: Item):
    """創建物品"""
    item_dict = item.dict()
    if item.tax:
        item_dict["price_with_tax"] = item.price + item.tax
    return item_dict


# 9. 多個請求體參數
class User(BaseModel):
    """用戶模型"""
    username: str
    email: EmailStr
    full_name: Optional[str] = None


@app.put("/items/{item_id}")
async def update_item(
    item_id: int,
    item: Item,
    user: User,
    importance: int = Body(..., ge=1, le=5)
):
    """更新物品（多個請求體參數）"""
    # 期望的 JSON:
    # {
    #   "item": {...},
    #   "user": {...},
    #   "importance": 3
    # }
    return {"item_id": item_id, "item": item, "user": user, "importance": importance}


# 10. 請求體嵌入
@app.post("/items/embed/")
async def create_item_embed(item: Item = Body(..., embed=True)):
    """創建物品（單個模型也嵌入）"""
    # 期望的 JSON: {"item": {...}}
    return item


# 11. 混合參數類型
@app.put("/items/{item_id}/details")
async def update_item_details(
    item_id: int = Path(..., ge=1),  # 路徑參數
    q: Optional[str] = Query(None, max_length=50),  # 查詢參數
    item: Item = Body(...),  # 請求體
):
    """更新物品詳情（混合多種參數）"""
    result = {"item_id": item_id, **item.dict()}
    if q:
        result["q"] = q
    return result


# 12. Header 參數
@app.get("/headers/")
async def read_headers(
    user_agent: Optional[str] = Header(None),
    accept_language: Optional[str] = Header(None, alias="Accept-Language"),
    x_token: Optional[List[str]] = Header(None)
):
    """讀取請求 headers"""
    return {
        "User-Agent": user_agent,
        "Accept-Language": accept_language,
        "X-Token values": x_token
    }


# 13. Cookie 參數
@app.get("/cookies/")
async def read_cookies(
    session_id: Optional[str] = Cookie(None),
    ads_id: Optional[str] = Cookie(None)
):
    """讀取 cookies"""
    return {"session_id": session_id, "ads_id": ads_id}


# 14. 表單數據
@app.post("/login/")
async def login(
    username: str = Form(...),
    password: str = Form(...)
):
    """登錄（接收表單數據）"""
    return {"username": username}


# 15. 文件上傳
@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile = File(...)):
    """上傳單個文件"""
    contents = await file.read()
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(contents)
    }


# 16. 多文件上傳
@app.post("/uploadfiles/")
async def create_upload_files(files: List[UploadFile] = File(...)):
    """上傳多個文件"""
    return [
        {
            "filename": file.filename,
            "content_type": file.content_type
        }
        for file in files
    ]


# 17. 表單 + 文件
@app.post("/files/")
async def create_file(
    file: UploadFile = File(...),
    description: str = Form(...),
    tags: List[str] = Form([])
):
    """上傳文件並附帶描述"""
    return {
        "file_size": len(await file.read()),
        "description": description,
        "tags": tags
    }


# 18. 響應模型
class ItemOut(BaseModel):
    """物品輸出模型（不包含敏感信息）"""
    name: str
    description: Optional[str] = None
    price: float


class ItemIn(BaseModel):
    """物品輸入模型（包含敏感信息）"""
    name: str
    description: Optional[str] = None
    price: float
    secret_code: str  # 敏感信息，不應返回


@app.post("/items/secure/", response_model=ItemOut)
async def create_item_secure(item: ItemIn):
    """創建物品（響應不包含 secret_code）"""
    return item


# 19. 路徑操作配置
@app.post(
    "/items/configured/",
    response_model=Item,
    status_code=status.HTTP_201_CREATED,
    tags=["items"],
    summary="創建一個物品",
    description="創建一個帶有名稱、價格和可選描述的物品",
    response_description="創建的物品",
)
async def create_item_configured(item: Item):
    """完整配置的路徑操作"""
    return item


# 20. 多個響應模型
from fastapi.responses import Response


class ErrorResponse(BaseModel):
    """錯誤響應模型"""
    detail: str


@app.get(
    "/items/{item_id}/full",
    response_model=Item,
    responses={
        404: {"model": ErrorResponse, "description": "物品未找到"},
        400: {"model": ErrorResponse, "description": "無效的請求"},
    }
)
async def get_item_full(item_id: int):
    """獲取物品（定義多種響應）"""
    if item_id == 0:
        return JSONResponse(
            status_code=404,
            content={"detail": "Item not found"}
        )
    
    return {
        "name": f"Item {item_id}",
        "description": "A description",
        "price": 10.5
    }


# 21. 查詢參數別名
@app.get("/items/alias/")
async def read_items_alias(
    item_query: str = Query(None, alias="item-query")
):
    """使用別名的查詢參數"""
    # URL: /items/alias/?item-query=foobar
    return {"item_query": item_query}


# 22. 參數棄用標記
@app.get("/items/deprecated/")
async def read_items_deprecated(
    old_param: Optional[str] = Query(None, deprecated=True),
    new_param: Optional[str] = Query(None)
):
    """帶棄用參數的端點"""
    return {"old_param": old_param, "new_param": new_param}


# 23. 條件驗證
@app.post("/items/conditional/")
async def create_item_conditional(
    item: Item,
    discount: Optional[float] = Body(None, ge=0, le=100)
):
    """創建物品（可選折扣）"""
    result = item.dict()
    if discount:
        result["discounted_price"] = item.price * (1 - discount / 100)
    return result
```

## 相關主題

- [FastAPI 依賴注入系統](./dependency_injection_system.md)
- [Pydantic 模型與數據驗證](./pydantic_models_and_validation.md)
- [FastAPI 請求與響應模型](./request_and_response_models.md)
- [FastAPI 自動 API 文檔生成](./automatic_api_documentation.md)
