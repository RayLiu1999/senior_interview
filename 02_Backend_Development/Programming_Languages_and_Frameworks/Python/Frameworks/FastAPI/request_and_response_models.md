# FastAPI 請求與響應模型

- **難度**: 6
- **重要程度**: 5
- **標籤**: `Request`, `Response`, `Model`, `Pydantic`, `Serialization`

## 問題詳述

深入探討 FastAPI 中請求和響應模型的設計、驗證、序列化、異常處理，以及如何使用 Pydantic 模型構建健壯的 API 接口。

## 核心理論與詳解

### 請求模型基礎

**Pydantic 模型作為請求體**：FastAPI 使用 Pydantic 模型定義請求體結構。當函數參數的類型提示是 Pydantic 模型時，FastAPI 自動從請求體解析 JSON 並驗證數據。

**自動驗證**：Pydantic 自動驗證所有字段的類型、格式和約束。驗證失敗時返回 422 Unprocessable Entity 錯誤，包含詳細的錯誤信息。

**文檔生成**：請求模型自動出現在 OpenAPI 文檔中，包括字段類型、描述、示例值、必填標記等。這使 API 文檔始終與代碼同步。

### 響應模型

**response_model 參數**：在路徑操作裝飾器中使用 `response_model` 參數指定響應的 Pydantic 模型。FastAPI 會：
1. 將返回數據轉換為模型
2. 驗證數據符合模型定義
3. 過濾掉不在模型中的字段
4. 在文檔中展示響應結構

**數據過濾**：response_model 的一個重要作用是過濾敏感信息。即使函數返回包含密碼的用戶對象，響應模型可以排除密碼字段。

**類型安全**：response_model 提供類型檢查，確保 API 始終返回符合契約的數據結構。

### 請求體模型設計

**單一模型**：最簡單的情況，單個 Pydantic 模型作為請求體。JSON 的根對象直接映射到模型。

**多個請求體參數**：可以在一個操作中使用多個 Pydantic 模型。FastAPI 期望 JSON 中有對應的鍵，每個鍵的值是一個模型。

**嵌套模型**：模型可以包含其他模型作為字段。這允許表示複雜的嵌套數據結構，如訂單包含多個訂單項。

**可選字段**：使用 `Optional[type]` 或設置默認值使字段可選。這對於 PATCH 操作（部分更新）特別有用。

### 響應模型選項

**response_model_exclude_unset**：設為 True 時，響應只包含實際設置的字段，不包含使用默認值的字段。這對於區分"未提供"和"顯式設為默認值"很有用。

**response_model_exclude_none**：響應不包含值為 None 的字段。這可以減小響應體積，使 JSON 更簡潔。

**response_model_include / response_model_exclude**：指定要包含或排除的特定字段。這提供了細粒度的控制，但通常建議創建專門的響應模型。

**response_model_by_alias**：使用字段別名而非字段名。這允許 Python 代碼使用 snake_case 而 JSON 使用 camelCase。

### 多個響應模型

**responses 參數**：使用 `responses` 參數定義不同狀態碼的響應模型。這在文檔中清楚展示 API 可能返回的各種響應。

**Union 類型**：使用 `Union[ModelA, ModelB]` 表示響應可以是多種類型之一。FastAPI 會根據實際返回的數據選擇合適的模型。

**條件響應**：根據業務邏輯返回不同類型的響應。FastAPI 會自動序列化為正確的 JSON。

### 請求驗證進階

**字段驗證**：使用 `Field()` 為字段添加約束，如 `min_length`、`max_length`、`regex`、數值範圍等。

**自定義驗證器**：使用 `@validator` 裝飾器添加自定義驗證邏輯。驗證器可以檢查單個字段或多個字段的組合。

**根驗證器**：使用 `@root_validator` 執行跨字段驗證，檢查字段間的關係和一致性。

**驗證模式**：Pydantic 支持 `pre` 和 `post` 驗證，分別在類型轉換前後執行。

### 模型繼承與組合

**繼承**：創建基礎模型並繼承來共享公共字段。例如，`UserBase` 包含公共字段，`UserCreate` 和 `UserUpdate` 繼承並添加特定字段。

**組合**：將模型作為其他模型的字段，構建複雜的數據結構。

**Mixin 模式**：使用 mixin 類共享常用字段組合，如時間戳（created_at、updated_at）。

### 不同操作的不同模型

**創建、更新、讀取分離**：為不同操作使用不同的模型：
- `UserCreate`：包含創建用戶所需的字段（如密碼）
- `UserUpdate`：所有字段可選，用於部分更新
- `UserInDB`：完整的數據庫模型，包含所有字段
- `User`：API 響應模型，排除敏感信息

**好處**：這種分離提高了安全性、清晰性和靈活性。每個模型只包含其用途所需的字段。

### 錯誤響應

**HTTPException**：拋出 `HTTPException` 來返回非 2xx 響應。可以指定狀態碼和詳細信息。

**自定義異常處理**：使用 `@app.exception_handler()` 註冊自定義異常處理器，返回特定格式的錯誤響應。

**ValidationError**：Pydantic 驗證失敗時自動返回 422 狀態碼，包含結構化的錯誤信息列表。

**錯誤模型**：可以為錯誤響應定義 Pydantic 模型，在 `responses` 參數中指定。

### 文件響應

**FileResponse**：返回文件內容。FastAPI 自動設置正確的 Content-Type 和 Content-Disposition headers。

**StreamingResponse**：流式返回數據，適合大文件或實時生成的內容。

**自定義響應**：可以返回任何 Starlette Response 對象來完全控制響應。

### JSON 序列化定制

**自定義編碼器**：在 Pydantic 模型的 Config 中設置 `json_encoders`，為特定類型定制 JSON 序列化。

**日期時間處理**：Pydantic 自動處理 datetime 對象，序列化為 ISO 8601 字符串。可以自定義格式。

**Enum 處理**：枚舉類型可以序列化為值或名稱，通過 Config 控制。

### 性能優化

**響應模型緩存**：Pydantic 編譯模型定義以提高性能。首次使用後，驗證和序列化非常快。

**orjson**：FastAPI 支持使用 orjson 替代標準 JSON 庫，提供更快的序列化速度。

**懶加載**：對於大型響應，考慮分頁或使用流式響應，避免一次性加載所有數據。

### 請求和響應的生命週期

**接收請求**：FastAPI 接收 HTTP 請求，解析 headers、路徑參數、查詢參數、請求體。

**參數驗證**：根據類型提示和模型定義驗證所有參數。失敗時立即返回 422 錯誤。

**執行處理**：調用路徑操作函數，傳入驗證後的參數。

**響應準備**：函數返回值被序列化為 JSON（或其他格式）。如果指定了 response_model，先轉換和驗證。

**返回響應**：FastAPI 構建 HTTP 響應，設置狀態碼、headers，發送給客戶端。

### 最佳實踐

**模型分層**：清晰劃分請求模型、響應模型、數據庫模型。不要在 API 中直接暴露數據庫模型。

**文檔完善**：為模型和字段添加描述、示例。良好的文檔提升 API 可用性。

**版本管理**：當 API 演進時，創建新版本的模型而不是修改現有模型。

**錯誤處理**：提供清晰、有用的錯誤消息。避免暴露內部錯誤細節。

**測試**：為請求和響應模型編寫測試，確保驗證邏輯正確。

## 程式碼範例

```python
from fastapi import FastAPI, HTTPException, status, Response, File, UploadFile
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
from pydantic import BaseModel, Field, EmailStr, validator, root_validator
from typing import Optional, List, Union
from datetime import datetime
from enum import Enum

app = FastAPI()


# 1. 基本請求模型
class UserCreate(BaseModel):
    """創建用戶請求模型"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None


@app.post("/users/", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
    """創建用戶"""
    # 處理邏輯...
    return {"username": user.username, "email": user.email}


# 2. 響應模型（排除敏感信息）
class User(BaseModel):
    """用戶響應模型（不包含密碼）"""
    id: int
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    created_at: datetime
    
    class Config:
        orm_mode = True  # 允許從 ORM 對象創建


@app.post("/users/full", response_model=User, status_code=201)
async def create_user_full(user: UserCreate):
    """創建用戶（使用響應模型）"""
    # 即使返回包含密碼的對象，響應也不會包含密碼
    user_data = {
        "id": 1,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "password_hash": "hashed_password",  # 這不會出現在響應中
        "created_at": datetime.now()
    }
    return user_data


# 3. 不同操作的不同模型
class UserBase(BaseModel):
    """用戶基礎模型"""
    username: str
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """創建用戶模型"""
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    """更新用戶模型（所有字段可選）"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)


class UserInDB(UserBase):
    """數據庫中的用戶模型"""
    id: int
    password_hash: str
    created_at: datetime
    is_active: bool


class UserResponse(UserBase):
    """用戶響應模型"""
    id: int
    created_at: datetime
    is_active: bool


# 4. 嵌套模型
class Address(BaseModel):
    """地址模型"""
    street: str
    city: str
    country: str
    postal_code: str


class UserWithAddress(UserResponse):
    """包含地址的用戶"""
    address: Optional[Address] = None


# 5. 自定義驗證器
class Product(BaseModel):
    """產品模型"""
    name: str
    price: float = Field(..., gt=0)
    discount: Optional[float] = Field(None, ge=0, le=100)
    quantity: int = Field(..., ge=0)
    
    @validator('name')
    def name_must_not_be_empty(cls, v):
        """驗證名稱不為空"""
        if not v.strip():
            raise ValueError('名稱不能為空')
        return v.strip()
    
    @validator('discount')
    def discount_validation(cls, v, values):
        """驗證折扣合理性"""
        if v and v > 50:
            # 高折扣可能需要特殊審批
            pass
        return v
    
    @root_validator
    def check_price_consistency(cls, values):
        """跨字段驗證"""
        price = values.get('price')
        discount = values.get('discount')
        
        if discount and discount > 0:
            final_price = price * (1 - discount / 100)
            if final_price < 0.01:
                raise ValueError('折扣後價格過低')
        
        return values


# 6. 列表響應
@app.get("/users/", response_model=List[UserResponse])
async def list_users(skip: int = 0, limit: int = 10):
    """獲取用戶列表"""
    # 模擬數據庫查詢
    users = [
        {
            "id": 1,
            "username": "john",
            "email": "john@example.com",
            "created_at": datetime.now(),
            "is_active": True
        },
        # ... 更多用戶
    ]
    return users[skip:skip + limit]


# 7. response_model_exclude_unset
@app.get("/users/{user_id}", response_model=UserResponse, response_model_exclude_unset=True)
async def get_user(user_id: int):
    """獲取用戶（只返回設置的字段）"""
    user = {
        "id": user_id,
        "username": "john",
        "email": "john@example.com",
        "created_at": datetime.now(),
        "is_active": True
        # full_name 未設置，不會出現在響應中
    }
    return user


# 8. 多個響應模型
class ErrorResponse(BaseModel):
    """錯誤響應模型"""
    detail: str
    error_code: str


@app.get(
    "/items/{item_id}",
    response_model=Product,
    responses={
        404: {"model": ErrorResponse, "description": "物品未找到"},
        400: {"model": ErrorResponse, "description": "無效的請求"}
    }
)
async def get_item(item_id: int):
    """獲取物品（多種響應）"""
    if item_id == 0:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )
    
    return {
        "name": f"Item {item_id}",
        "price": 10.5,
        "quantity": 100
    }


# 9. Union 響應類型
class Cat(BaseModel):
    """貓模型"""
    type: str = "cat"
    meow: str


class Dog(BaseModel):
    """狗模型"""
    type: str = "dog"
    bark: str


@app.get("/pet/{pet_id}", response_model=Union[Cat, Dog])
async def get_pet(pet_id: int):
    """獲取寵物（可能是貓或狗）"""
    if pet_id % 2 == 0:
        return Cat(meow="Meow!")
    else:
        return Dog(bark="Woof!")


# 10. 部分更新（PATCH）
@app.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user: UserUpdate):
    """更新用戶（部分更新）"""
    # 只更新提供的字段
    update_data = user.dict(exclude_unset=True)
    
    # 模擬數據庫更新
    current_user = {
        "id": user_id,
        "username": "john",
        "email": "john@example.com",
        "full_name": "John Doe",
        "created_at": datetime.now(),
        "is_active": True
    }
    
    current_user.update(update_data)
    return current_user


# 11. 文件上傳和響應
@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    """上傳文件"""
    contents = await file.read()
    
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(contents)
    }


@app.get("/download/{filename}")
async def download_file(filename: str):
    """下載文件"""
    file_path = f"/path/to/files/{filename}"
    return FileResponse(
        file_path,
        media_type="application/octet-stream",
        filename=filename
    )


# 12. 流式響應
async def generate_data():
    """生成數據流"""
    for i in range(100):
        yield f"data: {i}\n\n".encode()


@app.get("/stream")
async def stream_data():
    """流式響應"""
    return StreamingResponse(
        generate_data(),
        media_type="text/event-stream"
    )


# 13. 自定義 JSON 編碼
from decimal import Decimal

class Order(BaseModel):
    """訂單模型"""
    id: int
    total: Decimal
    created_at: datetime
    
    class Config:
        json_encoders = {
            Decimal: lambda v: float(v),  # Decimal 序列化為 float
            datetime: lambda v: v.isoformat()  # datetime 序列化為 ISO 格式
        }


# 14. 枚舉響應
class Status(str, Enum):
    """狀態枚舉"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"


class Task(BaseModel):
    """任務模型"""
    id: int
    name: str
    status: Status


@app.get("/tasks/{task_id}", response_model=Task)
async def get_task(task_id: int):
    """獲取任務"""
    return {
        "id": task_id,
        "name": "Task 1",
        "status": Status.PENDING
    }


# 15. 錯誤處理
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """自定義 ValueError 處理"""
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc), "error_type": "ValueError"}
    )


# 16. 條件響應
@app.get("/users/{user_id}/profile")
async def get_user_profile(user_id: int, include_address: bool = False):
    """獲取用戶資料（條件包含地址）"""
    user_data = {
        "id": user_id,
        "username": "john",
        "email": "john@example.com",
        "created_at": datetime.now(),
        "is_active": True
    }
    
    if include_address:
        user_data["address"] = {
            "street": "123 Main St",
            "city": "New York",
            "country": "USA",
            "postal_code": "10001"
        }
        return UserWithAddress(**user_data)
    
    return UserResponse(**user_data)


# 17. 響應 headers
@app.get("/custom-headers")
async def custom_headers():
    """自定義響應 headers"""
    content = {"message": "Hello"}
    headers = {
        "X-Custom-Header": "Value",
        "X-Process-Time": "0.5"
    }
    return JSONResponse(content=content, headers=headers)


# 18. 響應狀態碼
@app.post("/items/", status_code=status.HTTP_201_CREATED)
async def create_item(name: str):
    """創建物品（返回 201）"""
    return {"name": name}


@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: int):
    """刪除物品（返回 204 無內容）"""
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# 19. 動態響應模型
def get_response_model(include_details: bool):
    """根據條件返回不同的響應模型"""
    if include_details:
        return UserWithAddress
    return UserResponse


# 20. 嵌套列表模型
class Comment(BaseModel):
    """評論模型"""
    id: int
    content: str
    author: UserResponse


class PostResponse(BaseModel):
    """文章響應模型"""
    id: int
    title: str
    content: str
    author: UserResponse
    comments: List[Comment] = []


@app.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(post_id: int):
    """獲取文章（包含評論列表）"""
    return {
        "id": post_id,
        "title": "Post Title",
        "content": "Post content...",
        "author": {
            "id": 1,
            "username": "author",
            "email": "author@example.com",
            "created_at": datetime.now(),
            "is_active": True
        },
        "comments": [
            {
                "id": 1,
                "content": "Great post!",
                "author": {
                    "id": 2,
                    "username": "commenter",
                    "email": "commenter@example.com",
                    "created_at": datetime.now(),
                    "is_active": True
                }
            }
        ]
    }
```

## 相關主題

- [Pydantic 模型與數據驗證](./pydantic_models_and_validation.md)
- [FastAPI 路徑操作與參數](./path_operations_and_parameters.md)
- [FastAPI 依賴注入系統](./dependency_injection_system.md)
- [FastAPI 自動 API 文檔生成](./automatic_api_documentation.md)
