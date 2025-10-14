# FastAPI 數據庫集成

- **難度**: 7
- **重要性**: 5
- **標籤**: `Database`, `SQLAlchemy`, `Async ORM`

## 問題詳述

解釋 FastAPI 中數據庫集成的方式，包括同步和異步 ORM 的使用、連接池管理、事務處理以及最佳實踐。

## 核心理論與詳解

### 數據庫集成方式

FastAPI 支持多種數據庫集成方案：
- **SQLAlchemy**（同步/異步）：最流行的 Python ORM
- **Tortoise-ORM**：異步優先的 ORM
- **Databases**：異步數據庫接口庫
- **原始 SQL**：使用數據庫驅動直接操作

### SQLAlchemy 同步集成

**基本設置**

```python
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 數據庫 URL
DATABASE_URL = "postgresql://user:password@localhost/dbname"

# 創建引擎
engine = create_engine(DATABASE_URL)

# Session 工廠
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base 類
Base = declarative_base()

# 模型定義
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
```

**依賴注入模式**

```python
from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

app = FastAPI()

# 數據庫依賴
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic 模型
from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    name: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    
    class Config:
        from_attributes = True

# API 端點
@app.post("/users/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(email=user.email, name=user.name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="用戶不存在")
    return user
```

### SQLAlchemy 異步集成

異步版本提供更好的性能和並發能力。

**異步設置**

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# 異步數據庫 URL
DATABASE_URL = "postgresql+asyncpg://user:password@localhost/dbname"

# 創建異步引擎
engine = create_async_engine(DATABASE_URL, echo=True)

# 異步 Session 工廠
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

# 異步數據庫依賴
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

**異步 CRUD 操作**

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

@app.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    db_user = User(email=user.email, name=user.name)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@app.get("/users/{user_id}", response_model=UserResponse)
async def read_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(status_code=404, detail="用戶不存在")
    return user

@app.get("/users/", response_model=List[UserResponse])
async def list_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).offset(skip).limit(limit))
    users = result.scalars().all()
    return users

@app.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.id == user_id))
    db_user = result.scalar_one_or_none()
    
    if db_user is None:
        raise HTTPException(status_code=404, detail="用戶不存在")
    
    db_user.email = user.email
    db_user.name = user.name
    await db.commit()
    await db.refresh(db_user)
    return db_user

@app.delete("/users/{user_id}")
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.id == user_id))
    db_user = result.scalar_one_or_none()
    
    if db_user is None:
        raise HTTPException(status_code=404, detail="用戶不存在")
    
    await db.delete(db_user)
    await db.commit()
    return {"message": "用戶已刪除"}
```

### 數據庫連接池配置

**同步引擎配置**

```python
from sqlalchemy import create_engine

engine = create_engine(
    DATABASE_URL,
    pool_size=20,              # 連接池大小
    max_overflow=0,            # 超出 pool_size 允許的額外連接
    pool_timeout=30,           # 獲取連接的超時時間
    pool_recycle=3600,         # 連接回收時間（秒）
    pool_pre_ping=True,        # 使用前測試連接
    echo=False,                # 是否打印 SQL
)
```

**異步引擎配置**

```python
from sqlalchemy.ext.asyncio import create_async_engine

engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    pool_size=20,
    max_overflow=0,
    pool_recycle=3600,
    pool_pre_ping=True,
)
```

### 事務管理

**手動事務控制**

```python
from sqlalchemy.exc import SQLAlchemyError

@app.post("/transfer/")
async def transfer_money(
    from_account: int,
    to_account: int,
    amount: float,
    db: AsyncSession = Depends(get_db)
):
    try:
        # 開始事務（Session 自動管理）
        
        # 扣款
        result = await db.execute(
            select(Account).filter(Account.id == from_account).with_for_update()
        )
        from_acc = result.scalar_one()
        
        if from_acc.balance < amount:
            raise HTTPException(status_code=400, detail="餘額不足")
        
        from_acc.balance -= amount
        
        # 入賬
        result = await db.execute(
            select(Account).filter(Account.id == to_account).with_for_update()
        )
        to_acc = result.scalar_one()
        to_acc.balance += amount
        
        # 提交事務
        await db.commit()
        
        return {"message": "轉賬成功"}
    
    except SQLAlchemyError as e:
        # 回滾事務
        await db.rollback()
        raise HTTPException(status_code=500, detail="轉賬失敗")
```

**上下文管理器事務**

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def transaction(db: AsyncSession):
    try:
        yield db
        await db.commit()
    except Exception:
        await db.rollback()
        raise

@app.post("/complex-operation/")
async def complex_operation(db: AsyncSession = Depends(get_db)):
    async with transaction(db):
        # 執行多個數據庫操作
        user = User(name="test")
        db.add(user)
        await db.flush()  # 獲取 ID 但不提交
        
        # 使用 user.id 創建相關記錄
        profile = Profile(user_id=user.id, bio="...")
        db.add(profile)
        
        # 事務自動提交
    
    return {"message": "操作成功"}
```

### 關係映射

**一對多關係**

```python
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    name = Column(String)
    
    # 一對多關係
    posts = relationship("Post", back_populates="author")

class Post(Base):
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True)
    title = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # 多對一關係
    author = relationship("User", back_populates="posts")

# 查詢時加載關係
from sqlalchemy.orm import selectinload

@app.get("/users/{user_id}/posts")
async def get_user_posts(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User)
        .filter(User.id == user_id)
        .options(selectinload(User.posts))
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="用戶不存在")
    
    return {"user": user.name, "posts": user.posts}
```

**多對多關係**

```python
from sqlalchemy import Table

# 關聯表
user_tags = Table(
    'user_tags',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('tag_id', Integer, ForeignKey('tags.id'))
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    name = Column(String)
    
    tags = relationship("Tag", secondary=user_tags, back_populates="users")

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True)
    name = Column(String)
    
    users = relationship("User", secondary=user_tags, back_populates="tags")
```

### 數據庫遷移 (Alembic)

**初始化 Alembic**

```bash
pip install alembic
alembic init alembic
```

**配置 alembic.ini 和 env.py**

```python
# alembic/env.py
from myapp.database import Base
from myapp.models import User, Post  # 導入所有模型

target_metadata = Base.metadata

# 在 run_migrations_online() 中配置異步支持
from sqlalchemy.ext.asyncio import AsyncEngine

async def run_migrations_online():
    # 使用異步引擎
    connectable = AsyncEngine(...)
    
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
```

**創建和應用遷移**

```bash
# 自動生成遷移
alembic revision --autogenerate -m "create users table"

# 應用遷移
alembic upgrade head

# 回滾遷移
alembic downgrade -1
```

### 查詢優化

**N+1 問題解決**

```python
from sqlalchemy.orm import joinedload, selectinload, subqueryload

# 錯誤：N+1 查詢
@app.get("/users")
async def get_users_bad(db: AsyncSession = Depends(get_db)):
    users = (await db.execute(select(User))).scalars().all()
    
    # 每個用戶都會觸發一次額外查詢
    for user in users:
        posts = user.posts  # N+1 問題！
    
    return users

# 正確：使用 eager loading
@app.get("/users")
async def get_users_good(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).options(selectinload(User.posts))
    )
    users = result.scalars().all()
    return users
```

**分頁實現**

```python
from sqlalchemy import func

@app.get("/users/")
async def list_users_paginated(
    page: int = 1,
    per_page: int = 20,
    db: AsyncSession = Depends(get_db)
):
    # 計算總數
    total_result = await db.execute(select(func.count(User.id)))
    total = total_result.scalar()
    
    # 獲取分頁數據
    offset = (page - 1) * per_page
    result = await db.execute(
        select(User).offset(offset).limit(per_page)
    )
    users = result.scalars().all()
    
    return {
        "items": users,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page
    }
```

### 最佳實踐

**1. 使用依賴注入管理會話**
- 每個請求獲取獨立的 Session
- 自動處理 Session 關閉

**2. 異步優於同步**
- 異步 ORM 提供更好的並發性能
- 避免阻塞事件循環

**3. 連接池配置**
- 根據並發需求調整 pool_size
- 啟用 pool_pre_ping 避免失效連接

**4. 事務控制**
- 盡量縮小事務範圍
- 使用悲觀鎖（for_update）處理競態條件

**5. 查詢優化**
- 使用 eager loading 避免 N+1
- 添加適當的索引
- 使用分頁避免大量數據加載

**6. 錯誤處理**
```python
from sqlalchemy.exc import IntegrityError

@app.post("/users/")
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    try:
        db_user = User(**user.dict())
        db.add(db_user)
        await db.commit()
        return db_user
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="郵箱已存在")
```

**7. 環境變量管理**
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    
    class Config:
        env_file = ".env"

settings = Settings()
engine = create_async_engine(settings.database_url)
```

## 關鍵要點

FastAPI 與 SQLAlchemy 的集成提供了強大的數據庫操作能力，支持同步和異步兩種模式。異步模式配合 asyncpg 或 aiomysql 可以實現更高的並發性能。核心模式是通過依賴注入管理數據庫會話，確保每個請求獨立且自動清理資源。事務管理、連接池配置、查詢優化（避免 N+1、使用索引、分頁）是保證性能的關鍵。使用 Alembic 進行數據庫遷移管理，使用 Pydantic 進行數據驗證和序列化，形成完整的數據層解決方案。
