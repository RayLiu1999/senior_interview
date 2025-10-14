# FastAPI 依賴注入系統

- **難度**: 8
- **標籤**: `Dependency Injection`, `DI`, `Depends`

## 問題詳述

FastAPI 的依賴注入系統是其核心特性之一，提供了優雅的方式來管理代碼依賴。如何充分利用這個系統來編寫可測試、可維護的代碼？

## 核心理論與詳解

### 依賴注入基礎

**什麼是依賴注入？**
- 一種設計模式，將依賴關係從代碼中解耦
- 由框架負責創建和注入依賴對象
- 提高代碼的可測試性和可維護性

**FastAPI 的 DI 特點**
- 基於 Python 類型提示
- 自動解析依賴關係
- 支持嵌套依賴
- 內置緩存機制
- 異步支持

### Depends 函數

**基本用法**
```python
from fastapi import Depends

def get_db():
    db = Database()
    try:
        yield db
    finally:
        db.close()

@app.get("/users/")
def read_users(db = Depends(get_db)):
    return db.query(User).all()
```

**Depends 的工作原理**
1. FastAPI 識別 `Depends` 標記的參數
2. 調用依賴函數獲取返回值
3. 將返回值注入到路徑操作函數
4. 如果依賴是生成器，自動處理清理邏輯

### 依賴類型

**函數依賴**
```python
def common_params(q: str = None, skip: int = 0, limit: int = 100):
    return {"q": q, "skip": skip, "limit": limit}

@app.get("/items/")
def read_items(commons: dict = Depends(common_params)):
    return commons
```

**類依賴**
```python
class CommonQueryParams:
    def __init__(self, q: str = None, skip: int = 0, limit: int = 100):
        self.q = q
        self.skip = skip
        self.limit = limit

@app.get("/items/")
def read_items(commons: CommonQueryParams = Depends(CommonQueryParams)):
    return commons
```

**生成器依賴**
- 使用 `yield` 提供依賴
- `yield` 之後的代碼在請求結束後執行
- 適用於需要清理的資源（數據庫連接、文件等）

### 嵌套依賴

**依賴鏈**
```python
def get_db():
    db = Database()
    try:
        yield db
    finally:
        db.close()

def get_user_service(db = Depends(get_db)):
    return UserService(db)

@app.get("/users/{user_id}")
def read_user(
    user_id: int,
    user_service: UserService = Depends(get_user_service)
):
    return user_service.get_user(user_id)
```

**依賴樹**
- FastAPI 自動解析依賴關係
- 構建依賴樹並按順序執行
- 相同依賴在同一請求中只執行一次（緩存）

### 子依賴

**在依賴中使用依賴**
```python
def get_token(token: str = Header()):
    return token

def get_current_user(token: str = Depends(get_token)):
    user = decode_token(token)
    return user

@app.get("/me")
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
```

### 全局依賴

**應用級依賴**
```python
# 所有路徑操作都會執行這個依賴
app = FastAPI(dependencies=[Depends(verify_token)])
```

**路由器級依賴**
```python
router = APIRouter(
    prefix="/api",
    dependencies=[Depends(verify_token)]
)
```

### 依賴覆蓋

**測試中覆蓋依賴**
```python
# 原始依賴
def get_db():
    db = Database()
    yield db
    db.close()

# 測試依賴
def override_get_db():
    return MockDatabase()

# 在測試中覆蓋
app.dependency_overrides[get_db] = override_get_db
```

### 實際應用場景

**1. 數據庫會話管理**
```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**2. 用戶認證**
```python
def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials"
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user(username)
    if user is None:
        raise credentials_exception
    return user
```

**3. 權限檢查**
```python
def require_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
```

**4. 分頁參數**
```python
class Pagination:
    def __init__(self, page: int = 1, size: int = 20):
        self.skip = (page - 1) * size
        self.limit = size
```

### 最佳實踐

1. **保持依賴函數純粹**：避免副作用
2. **使用類型提示**：讓 FastAPI 自動驗證和文檔化
3. **合理使用生成器**：自動處理資源清理
4. **避免過度嵌套**：保持依賴鏈簡潔
5. **利用依賴緩存**：相同依賴在請求中只執行一次
6. **測試時覆蓋依賴**：便於單元測試

## 程式碼範例

```python
from fastapi import FastAPI, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional

app = FastAPI()

# 數據庫依賴
def get_db():
    """數據庫會話依賴"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 認證依賴
def get_token_header(x_token: str = Header()):
    """驗證 token header"""
    if x_token != "secret-token":
        raise HTTPException(status_code=400, detail="X-Token header invalid")
    return x_token

# 當前用戶依賴
def get_current_user(
    token: str = Depends(get_token_header),
    db: Session = Depends(get_db)
):
    """獲取當前用戶"""
    user = db.query(User).filter(User.token == token).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    return user

# 管理員權限依賴
def require_admin(current_user: User = Depends(get_current_user)):
    """要求管理員權限"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

# 通用查詢參數類
class CommonQueryParams:
    def __init__(
        self,
        q: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ):
        self.q = q
        self.skip = skip
        self.limit = limit

# 使用簡單依賴
@app.get("/items/")
def read_items(commons: CommonQueryParams = Depends(CommonQueryParams)):
    """獲取項目列表"""
    return {
        "q": commons.q,
        "skip": commons.skip,
        "limit": commons.limit
    }

# 使用多個依賴
@app.get("/users/me")
def read_user_me(current_user: User = Depends(get_current_user)):
    """獲取當前用戶信息"""
    return current_user

# 使用嵌套依賴
@app.post("/users/")
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """創建用戶（需要管理員權限）"""
    new_user = User(**user_data.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# 服務層依賴
class UserService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
    
    def get_user(self, user_id: int):
        return self.db.query(User).filter(User.id == user_id).first()
    
    def create_user(self, user_data: dict):
        user = User(**user_data)
        self.db.add(user)
        self.db.commit()
        return user

@app.get("/users/{user_id}")
def get_user(
    user_id: int,
    service: UserService = Depends(UserService)
):
    """使用服務層依賴"""
    user = service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# 全局依賴示例
def verify_key(x_key: str = Header()):
    if x_key != "secret-key":
        raise HTTPException(status_code=400, detail="X-Key header invalid")
    return x_key

# 將依賴應用到整個路由器
router = APIRouter(
    prefix="/admin",
    dependencies=[Depends(verify_key), Depends(require_admin)]
)

@router.get("/dashboard")
def admin_dashboard():
    """管理員儀表板（自動應用全局依賴）"""
    return {"message": "Admin Dashboard"}

app.include_router(router)

# 測試中覆蓋依賴
def get_test_db():
    """測試數據庫"""
    db = TestDatabase()
    yield db
    db.close()

# 在測試中
from fastapi.testclient import TestClient

client = TestClient(app)
app.dependency_overrides[get_db] = get_test_db

def test_read_items():
    response = client.get("/items/")
    assert response.status_code == 200
```

## 相關資源

- [FastAPI Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/)
- [Advanced Dependencies](https://fastapi.tiangolo.com/advanced/advanced-dependencies/)
- [Dependency Injection in Python](https://python-dependency-injector.ets-labs.org/)
