# FastAPI 認證與安全

- **難度**: 8
- **重要性**: 5
- **標籤**: `Authentication`, `JWT`, `OAuth2`, `Security`

## 問題詳述

解釋 FastAPI 中的認證和授權機制，包括 OAuth2、JWT、API Key 等多種安全方案的實現方式和最佳實踐。

## 核心理論與詳解

### FastAPI 安全模組概述

FastAPI 提供了完整的安全工具集，基於 **OAuth2 規範**，支持多種認證方式，並與 OpenAPI 文檔無縫集成。

**核心安全組件**：
- `fastapi.security`：提供各種安全方案
- **OAuth2PasswordBearer**：OAuth2 密碼流程
- **HTTPBasic**：HTTP 基本認證
- **APIKeyHeader/APIKeyQuery**：API 密鑰認證
- **HTTPBearer**：JWT Bearer Token 認證

### OAuth2 密碼流程（最常用）

**基本實現**

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

app = FastAPI()

# OAuth2 方案配置
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None

# 模擬用戶數據庫
fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "john@example.com",
        "hashed_password": "fakehashedsecret",
        "disabled": False,
    }
}

def fake_hash_password(password: str):
    return "fakehashed" + password

def get_user(username: str):
    if username in fake_users_db:
        return User(**fake_users_db[username])

async def get_current_user(token: str = Depends(oauth2_scheme)):
    # 驗證 token 並獲取用戶
    user = get_user(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="無效的認證憑證",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user(form_data.username)
    if not user:
        raise HTTPException(status_code=400, detail="用戶名或密碼錯誤")
    
    hashed_password = fake_hash_password(form_data.password)
    if hashed_password != user.hashed_password:
        raise HTTPException(status_code=400, detail="用戶名或密碼錯誤")
    
    return {"access_token": user.username, "token_type": "bearer"}

@app.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
```

### JWT (JSON Web Token) 認證

JWT 是最流行的無狀態認證方案，FastAPI 完美支持。

**完整 JWT 實現**

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

# 配置
SECRET_KEY = "your-secret-key-keep-it-secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="無法驗證憑證",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用戶名或密碼錯誤",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
```

### API Key 認證

適用於服務間認證或第三方集成。

**API Key 實現**

```python
from fastapi.security import APIKeyHeader

API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME)

VALID_API_KEYS = {
    "key123": "service_a",
    "key456": "service_b",
}

async def get_api_key(api_key: str = Depends(api_key_header)):
    if api_key not in VALID_API_KEYS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="無效的 API Key"
        )
    return VALID_API_KEYS[api_key]

@app.get("/protected")
async def protected_route(service_name: str = Depends(get_api_key)):
    return {"message": f"訪問由 {service_name} 授權"}
```

### HTTP Basic 認證

簡單的用戶名/密碼認證，適用於內部工具。

```python
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets

security = HTTPBasic()

def verify_credentials(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, "admin")
    correct_password = secrets.compare_digest(credentials.password, "secret")
    
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用戶名或密碼錯誤",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

@app.get("/admin")
async def admin_area(username: str = Depends(verify_credentials)):
    return {"message": f"歡迎管理員 {username}"}
```

### 權限和角色控制

實現基於角色的訪問控制 (RBAC)。

```python
from enum import Enum

class Role(str, Enum):
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"

class UserInDB(User):
    hashed_password: str
    roles: list[Role] = []

def require_role(required_role: Role):
    async def role_checker(current_user: UserInDB = Depends(get_current_user)):
        if required_role not in current_user.roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="權限不足"
            )
        return current_user
    return role_checker

@app.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: UserInDB = Depends(require_role(Role.ADMIN))
):
    return {"message": f"用戶 {user_id} 已被管理員 {current_user.username} 刪除"}
```

### OAuth2 Scopes（細粒度權限）

使用 OAuth2 scopes 實現細粒度的權限控制。

```python
from fastapi.security import OAuth2PasswordBearer, SecurityScopes

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="token",
    scopes={
        "read:users": "讀取用戶信息",
        "write:users": "修改用戶信息",
        "read:items": "讀取項目",
        "write:items": "修改項目",
    }
)

async def get_current_user(
    security_scopes: SecurityScopes,
    token: str = Depends(oauth2_scheme)
):
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="無法驗證憑證",
        headers={"WWW-Authenticate": authenticate_value},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        token_scopes = payload.get("scopes", [])
        token_data = TokenData(scopes=token_scopes, username=username)
    except JWTError:
        raise credentials_exception
    
    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    
    # 檢查 scopes
    for scope in security_scopes.scopes:
        if scope not in token_data.scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="權限不足",
                headers={"WWW-Authenticate": authenticate_value},
            )
    
    return user

@app.get("/users/me/items/")
async def read_own_items(
    current_user: User = Depends(get_current_user(scopes=["read:items"]))
):
    return [{"item_id": "Foo", "owner": current_user.username}]
```

### 安全最佳實踐

**1. 密碼處理**
- **永遠不要存儲明文密碼**，使用 bcrypt、argon2 等強哈希算法
- 使用 `passlib` 庫處理密碼哈希
- 實施密碼複雜度要求

**2. Token 管理**
- 設置合理的過期時間（15-30 分鐘）
- 使用 refresh token 機制實現長期會話
- 實施 token 黑名單/撤銷機制

**3. HTTPS**
- 生產環境必須使用 HTTPS
- 使用 HSTS 強制 HTTPS
- 配置安全的 TLS 版本

**4. CORS 配置**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://trusted-domain.com"],  # 明確指定域名
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # 限制允許的方法
    allow_headers=["Authorization", "Content-Type"],
)
```

**5. 速率限制**
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/login")
@limiter.limit("5/minute")
async def login(request: Request):
    pass
```

**6. 輸入驗證**
- 利用 Pydantic 進行嚴格的數據驗證
- 避免 SQL 注入、XSS 等攻擊
- 對所有用戶輸入進行清理

**7. 敏感數據保護**
```python
from pydantic import SecretStr

class UserCreate(BaseModel):
    username: str
    password: SecretStr  # 自動隱藏在日誌中
    
    class Config:
        json_encoders = {
            SecretStr: lambda v: v.get_secret_value() if v else None
        }
```

### 認證方案選擇

| 方案 | 適用場景 | 優點 | 缺點 |
|------|----------|------|------|
| **JWT** | SPA、微服務、移動應用 | 無狀態、可擴展 | 無法撤銷（需額外機制） |
| **Session** | 傳統 Web 應用 | 易於撤銷、伺服器控制 | 需要狀態存儲 |
| **API Key** | 服務間認證、第三方集成 | 簡單、穩定 | 缺乏細粒度控制 |
| **OAuth2** | 第三方登入、授權委託 | 標準化、安全 | 複雜度高 |
| **Basic Auth** | 內部工具、快速原型 | 極簡單 | 不夠安全（需 HTTPS） |

## 關鍵要點

FastAPI 提供了完整的認證和安全工具集，支持 OAuth2、JWT、API Key、Basic Auth 等多種方案。核心設計理念是通過依賴注入實現認證邏輯的解耦，並與 OpenAPI 文檔無縫集成。JWT 是最常用的無狀態認證方案，適合現代 Web 應用。實施安全機制時必須注意密碼哈希、HTTPS、CORS、速率限制等最佳實踐，並根據應用場景選擇合適的認證方案。使用 OAuth2 scopes 可以實現細粒度的權限控制，配合 RBAC 模式可以構建複雜的授權系統。
