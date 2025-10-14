# Pydantic 模型與數據驗證

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Pydantic`, `Validation`, `Schema`, `Type Hints`

## 問題詳述

深入探討 Pydantic 在 FastAPI 中的核心作用，包括數據模型定義、自動驗證、序列化/反序列化、類型強制轉換以及高級驗證技巧。

## 核心理論與詳解

### Pydantic 的核心概念

**Pydantic** 是一個使用 Python 類型提示進行數據驗證和設置管理的庫。它是 FastAPI 的基礎，負責請求數據驗證、響應序列化和 API 文檔生成。Pydantic 在運行時強制類型約束，自動轉換數據類型，並提供清晰的錯誤消息。

**設計哲學**：Pydantic 利用 Python 3.6+ 的類型提示，將類型定義用於運行時驗證。這種方式既服務於靜態類型檢查器（如 mypy），又提供運行時保證。代碼即文檔，類型提示清楚地表達了數據結構的期望。

### BaseModel 基礎

**BaseModel** 是 Pydantic 的核心類，所有數據模型都繼承自它。當創建 BaseModel 的實例時，Pydantic 會驗證提供的數據，進行類型轉換，並在驗證失敗時拋出 `ValidationError`。

**自動驗證**：實例化模型時，Pydantic 自動驗證每個字段。如果數據不符合類型提示，Pydantic 會嘗試強制轉換（如字符串 "123" 轉為整數 123）。如果轉換失敗或數據根本不合法，會拋出詳細的驗證錯誤。

**不可變性（可選）**：通過配置 `Config.frozen = True`，可以使模型不可變。這對於表示值對象和確保數據完整性很有用。

### 字段類型與驗證

**基本類型**：Pydantic 支持所有 Python 標準類型，如 `int`、`float`、`str`、`bool`、`bytes`。還支持複雜類型，如 `List`、`Dict`、`Set`、`Tuple`、`Optional`。

**嚴格類型與強制轉換**：默認情況下，Pydantic 會嘗試強制轉換數據。例如，字符串 "123" 可以轉換為整數。可以使用 `StrictInt`、`StrictStr` 等嚴格類型來禁止轉換。

**Field 函數**：`Field()` 提供了豐富的驗證選項，包括：
- `default`：默認值
- `default_factory`：默認值工廠函數
- `alias`：JSON 字段別名
- `title` 和 `description`：用於 API 文檔
- `gt`、`ge`、`lt`、`le`：數值範圍約束
- `min_length`、`max_length`：字符串/列表長度約束
- `regex`：正則表達式匹配

### 複雜數據結構

**嵌套模型**：模型可以包含其他模型作為字段，Pydantic 會遞歸驗證整個數據結構。這使得表示複雜的嵌套 JSON 數據變得簡單。

**列表和字典**：使用 `List[Model]` 表示模型列表，`Dict[str, Model]` 表示以模型為值的字典。Pydantic 會驗證列表/字典中的每個元素。

**Union 類型**：`Union[TypeA, TypeB]` 表示字段可以是多種類型之一。Pydantic 會按順序嘗試驗證每種類型。

**Optional 字段**：`Optional[Type]` 等同於 `Union[Type, None]`，表示字段可以是指定類型或 `None`。結合 `default=None` 使字段真正可選。

### 自定義驗證器

**validator 裝飾器**：使用 `@validator` 裝飾器可以為字段添加自定義驗證邏輯。驗證器是類方法，接收字段值並返回驗證後的值或拋出 `ValueError`。

**pre 和 post 驗證**：`@validator(..., pre=True)` 在 Pydantic 標準驗證之前運行，接收原始輸入。默認（post）驗證在類型轉換後運行，接收已轉換的值。

**root_validator**：`@root_validator` 在所有字段驗證後運行，接收所有字段值的字典。用於跨字段驗證，如檢查兩個字段的組合是否有效。

**always 參數**：`@validator(..., always=True)` 使驗證器即使字段未提供也會運行，這對於計算默認值很有用。

### 數據序列化與反序列化

**model.dict()**：將模型實例轉換為字典。支持多個選項：
- `exclude`：排除特定字段
- `include`：只包含特定字段
- `by_alias`：使用字段別名
- `exclude_unset`：排除未設置的字段
- `exclude_none`：排除值為 None 的字段

**model.json()**：將模型序列化為 JSON 字符串。內部使用 `dict()` 然後 JSON 編碼。

**parse_obj()**：從字典創建模型實例，這是反序列化的常用方法。

**parse_raw()**：從 JSON、YAML 等字符串創建模型實例。

**parse_file()**：從文件讀取並解析數據創建模型實例。

### Config 類配置

**模型配置**：通過內部 `Config` 類可以自定義模型行為。常用配置包括：
- `orm_mode = True`：允許從 ORM 對象創建模型（通過屬性訪問而非字典）
- `allow_population_by_field_name = True`：允許使用字段名或別名填充
- `use_enum_values = True`：序列化時使用枚舉的值而非名稱
- `validate_assignment = True`：賦值時也進行驗證
- `arbitrary_types_allowed = True`：允許任意類型
- `json_encoders`：自定義 JSON 編碼器

### 模型繼承與組合

**繼承**：模型可以繼承其他模型，子類繼承父類的所有字段和驗證器。這用於創建模型層次結構和共享通用字段。

**Mixin 模式**：使用 mixin 類來共享字段組合，如 `TimestampMixin` 包含 `created_at` 和 `updated_at` 字段。

**更新模型**：使用 `update` 參數來部分更新現有模型，或使用 `model.copy(update={...})` 創建帶更新的副本。

### 泛型模型

**Generic 支持**：Pydantic 支持泛型模型，使用 `Generic[T]` 來創建可重用的模型模板。這對於創建通用的響應包裝器很有用。

**類型變量**：結合 `TypeVar` 定義靈活的模型結構，在實例化時指定具體類型。

### 高級類型

**constrained 類型**：Pydantic 提供了受約束的類型，如 `conint`（受約束的整數）、`constr`（受約束的字符串）、`condecimal`等。這些類型在定義時就包含驗證規則。

**EmailStr、HttpUrl 等**：Pydantic 提供了專門的類型用於常見的數據格式，如 email、URL、IP 地址、UUID 等。這些類型自帶格式驗證。

**Color、Json 等**：還有用於顏色值、JSON 字符串等特殊類型。

### 在 FastAPI 中的應用

**請求體驗證**：當 FastAPI 路由函數的參數類型提示為 Pydantic 模型時，FastAPI 自動從請求體解析 JSON 並驗證數據。驗證失敗會自動返回 422 錯誤和詳細的錯誤信息。

**響應模型**：使用 `response_model` 參數指定響應的 Pydantic 模型。FastAPI 會自動序列化響應數據，並生成 OpenAPI schema。

**查詢參數和路徑參數**：雖然不是完整的 Pydantic 模型，FastAPI 使用 Pydantic 的驗證機制來驗證查詢參數和路徑參數。

**依賴注入**：Pydantic 模型可以作為依賴項，FastAPI 會自動驗證和注入。

### 性能優化

**compilation**：Pydantic 使用編譯技術來優化驗證性能。首次驗證時會編譯驗證邏輯，後續驗證非常快。

**懶加載**：字段的驗證器只在需要時編譯和執行，減少初始化開銷。

**Cython 加速**：安裝 Cython 可以進一步提升 Pydantic 的性能。

### 錯誤處理

**ValidationError**：當驗證失敗時，Pydantic 拋出 `ValidationError`。這個異常包含詳細的錯誤信息，包括哪些字段失敗、失敗原因、輸入值等。

**錯誤格式**：`ValidationError.errors()` 返回結構化的錯誤列表，每個錯誤包含 `loc`（位置）、`msg`（消息）、`type`（類型）。

**自定義錯誤消息**：可以在驗證器中拋出自定義錯誤消息，或通過 `Field(error_msg=...)` 設置。

## 程式碼範例

```python
from pydantic import BaseModel, Field, validator, root_validator
from pydantic import EmailStr, HttpUrl, conint, constr
from typing import List, Optional, Dict, Union
from datetime import datetime
from enum import Enum


# 1. 基本模型定義
class User(BaseModel):
    """用戶模型"""
    id: int
    username: str
    email: EmailStr
    age: Optional[int] = None
    is_active: bool = True
    

# 使用模型
user = User(
    id=1,
    username="john_doe",
    email="john@example.com",
    age=30
)

print(user.dict())  # 轉換為字典
print(user.json())  # 轉換為 JSON


# 2. 使用 Field 進行高級驗證
class Product(BaseModel):
    """產品模型"""
    name: constr(min_length=1, max_length=100) = Field(
        ...,  # 必填字段（... 表示required）
        description="產品名稱"
    )
    price: float = Field(
        ...,
        gt=0,  # 必須大於 0
        description="產品價格"
    )
    quantity: conint(ge=0) = Field(
        default=0,
        description="庫存數量"
    )
    description: Optional[str] = Field(
        None,
        max_length=500
    )
    tags: List[str] = Field(default_factory=list)
    

# 3. 嵌套模型
class Address(BaseModel):
    """地址模型"""
    street: str
    city: str
    country: str
    postal_code: str


class Customer(BaseModel):
    """客戶模型（包含嵌套地址）"""
    name: str
    email: EmailStr
    address: Address  # 嵌套模型
    billing_address: Optional[Address] = None


# 使用嵌套模型
customer = Customer(
    name="Jane Doe",
    email="jane@example.com",
    address={
        "street": "123 Main St",
        "city": "New York",
        "country": "USA",
        "postal_code": "10001"
    }
)


# 4. 自定義驗證器
class PasswordModel(BaseModel):
    """密碼模型"""
    password: str
    password_confirm: str
    
    @validator('password')
    def password_strength(cls, v):
        """驗證密碼強度"""
        if len(v) < 8:
            raise ValueError('密碼至少需要 8 個字符')
        if not any(char.isdigit() for char in v):
            raise ValueError('密碼必須包含至少一個數字')
        if not any(char.isupper() for char in v):
            raise ValueError('密碼必須包含至少一個大寫字母')
        return v
    
    @root_validator
    def passwords_match(cls, values):
        """驗證兩次密碼輸入是否一致"""
        pw1 = values.get('password')
        pw2 = values.get('password_confirm')
        if pw1 != pw2:
            raise ValueError('兩次密碼輸入不一致')
        return values


# 5. 枚舉類型
class OrderStatus(str, Enum):
    """訂單狀態枚舉"""
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class Order(BaseModel):
    """訂單模型"""
    id: int
    customer_id: int
    status: OrderStatus = OrderStatus.PENDING
    items: List[Dict[str, Union[int, float]]]
    total: float
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        use_enum_values = True  # 序列化時使用枚舉值


# 6. ORM 模式（從數據庫模型創建）
class UserDB(BaseModel):
    """從 ORM 對象創建的用戶模型"""
    id: int
    username: str
    email: str
    
    class Config:
        orm_mode = True  # 允許從對象屬性創建


# 假設有一個 SQLAlchemy 模型實例
# db_user = session.query(UserORMModel).first()
# user = UserDB.from_orm(db_user)


# 7. 響應模型（隱藏敏感信息）
class UserInDB(BaseModel):
    """數據庫中的完整用戶模型"""
    id: int
    username: str
    email: str
    hashed_password: str
    is_active: bool


class UserResponse(BaseModel):
    """API 響應用戶模型（不包含密碼）"""
    id: int
    username: str
    email: str
    is_active: bool
    
    class Config:
        orm_mode = True


# 8. 部分更新模型
class UserUpdate(BaseModel):
    """用戶更新模型（所有字段可選）"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    age: Optional[int] = None
    
    class Config:
        # 只序列化實際設置的字段
        exclude_unset = True


# 9. 泛型響應包裝器
from typing import TypeVar, Generic

DataT = TypeVar('DataT')


class Response(BaseModel, Generic[DataT]):
    """通用響應包裝器"""
    code: int
    message: str
    data: Optional[DataT] = None


# 使用泛型模型
user_response = Response[User](
    code=200,
    message="成功",
    data=user
)


# 10. 複雜驗證場景
class DateRange(BaseModel):
    """日期範圍"""
    start_date: datetime
    end_date: datetime
    
    @root_validator
    def validate_date_range(cls, values):
        """驗證開始日期必須早於結束日期"""
        start = values.get('start_date')
        end = values.get('end_date')
        
        if start and end and start >= end:
            raise ValueError('開始日期必須早於結束日期')
        
        return values


# 11. 動態默認值
from uuid import uuid4


class Task(BaseModel):
    """任務模型"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    title: str
    created_at: datetime = Field(default_factory=datetime.now)
    completed: bool = False


# 12. 字段別名（用於 JSON 鍵名與 Python 屬性名不同的情況）
class APIResponse(BaseModel):
    """API 響應（使用別名）"""
    user_id: int = Field(..., alias="userId")
    user_name: str = Field(..., alias="userName")
    
    class Config:
        allow_population_by_field_name = True  # 允許同時使用字段名和別名


# 13. 驗證賦值
class StrictUser(BaseModel):
    """嚴格驗證的用戶模型"""
    username: str
    age: int
    
    class Config:
        validate_assignment = True  # 賦值時也進行驗證


# 使用
strict_user = StrictUser(username="john", age=30)
# strict_user.age = "invalid"  # 這會拋出 ValidationError


# 14. 在 FastAPI 中使用
from fastapi import FastAPI, HTTPException

app = FastAPI()


@app.post("/users/", response_model=UserResponse)
async def create_user(user: User):
    """創建用戶（自動驗證請求體）"""
    # user 參數已經被驗證和解析
    # 這裡可以直接使用 user 對象
    
    # 保存到數據庫...
    
    return user


@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    """獲取用戶"""
    # 從數據庫獲取用戶...
    user_data = {"id": user_id, "username": "john", "email": "john@example.com", "is_active": True}
    
    return UserResponse(**user_data)


@app.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_update: UserUpdate):
    """部分更新用戶"""
    # 只更新提供的字段
    update_data = user_update.dict(exclude_unset=True)
    
    # 更新數據庫...
    
    return UserResponse(id=user_id, username="john", email="john@example.com", is_active=True)


# 15. 錯誤處理
from pydantic import ValidationError

try:
    invalid_user = User(
        id="not_an_int",  # 錯誤的類型
        username="john",
        email="invalid_email"  # 無效的 email
    )
except ValidationError as e:
    print(e.json())  # 格式化的錯誤信息
    
    # 獲取錯誤詳情
    for error in e.errors():
        print(f"字段: {error['loc']}")
        print(f"錯誤: {error['msg']}")
        print(f"類型: {error['type']}")


# 16. 高級類型示例
from pydantic import PositiveInt, NegativeInt, UUID4, SecretStr


class AdvancedTypes(BaseModel):
    """使用高級類型"""
    positive_number: PositiveInt  # 必須是正整數
    url: HttpUrl  # 必須是有效的 URL
    uuid: UUID4  # 必須是有效的 UUID v4
    secret: SecretStr  # 密碼（不會被序列化顯示）
    color: str = Field(..., regex=r'^#[0-9a-fA-F]{6}$')  # 十六進制顏色


# 17. 自定義 JSON 編碼器
from decimal import Decimal


class MoneyModel(BaseModel):
    """金額模型"""
    amount: Decimal
    currency: str
    
    class Config:
        json_encoders = {
            Decimal: lambda v: float(v)  # 將 Decimal 序列化為 float
        }
```

## 相關主題

- [FastAPI 依賴注入系統](./dependency_injection_system.md)
- [FastAPI 請求與響應模型](./request_and_response_models.md)
- [FastAPI 路徑操作與參數](./path_operations_and_parameters.md)
- [FastAPI 自動 API 文檔生成](./automatic_api_documentation.md)
