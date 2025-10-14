# FastAPI 性能優化

- **難度**: 8
- **重要性**: 5
- **標籤**: `Performance`, `Async`, `Optimization`

## 問題詳述

解釋 FastAPI 應用的性能優化策略，包括異步編程、數據庫查詢優化、緩存策略、連接池管理以及性能監控。

## 核心理論與詳解

### 異步編程優化

FastAPI 的高性能核心在於異步 I/O 支持。

**正確使用 async/await**

```python
# 錯誤：在異步函數中使用同步 I/O
@app.get("/bad")
async def bad_endpoint():
    time.sleep(1)  # 阻塞整個事件循環！
    return {"status": "done"}

# 正確：使用異步 I/O
@app.get("/good")
async def good_endpoint():
    await asyncio.sleep(1)  # 不阻塞事件循環
    return {"status": "done"}

# 外部 API 調用
import httpx

@app.get("/fetch")
async def fetch_data():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com/data")
        return response.json()
```

**並發請求處理**

```python
async def fetch_user(user_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://api.example.com/users/{user_id}")
        return response.json()

@app.get("/users-batch")
async def get_users_batch(user_ids: List[int]):
    # 並發獲取多個用戶
    tasks = [fetch_user(uid) for uid in user_ids]
    users = await asyncio.gather(*tasks)
    return {"users": users}
```

### 數據庫優化

**使用異步數據庫驅動**

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

# 使用 asyncpg (PostgreSQL)
DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/db"
engine = create_async_engine(DATABASE_URL, pool_size=20, max_overflow=0)

# 連接池配置
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,              # 連接池大小
    max_overflow=0,            # 額外連接數
    pool_recycle=3600,         # 連接回收時間
    pool_pre_ping=True,        # 檢查連接有效性
)
```

**查詢優化**

```python
from sqlalchemy.orm import selectinload, joinedload

# 避免 N+1 查詢
@app.get("/users-with-posts")
async def get_users_with_posts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).options(selectinload(User.posts))
    )
    return result.scalars().all()

# 使用索引
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)  # 添加索引
    
# 分頁避免大量數據
@app.get("/items")
async def list_items(skip: int = 0, limit: int = 100):
    # 限制每頁數量
    limit = min(limit, 100)
    items = await db.execute(
        select(Item).offset(skip).limit(limit)
    )
    return items.scalars().all()
```

### 緩存策略

**使用 Redis 緩存**

```python
import aioredis
from functools import wraps

redis = await aioredis.create_redis_pool('redis://localhost')

def cache(expire: int = 300):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 生成緩存鍵
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # 檢查緩存
            cached = await redis.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # 執行函數
            result = await func(*args, **kwargs)
            
            # 存入緩存
            await redis.setex(cache_key, expire, json.dumps(result))
            
            return result
        return wrapper
    return decorator

@app.get("/expensive-data/{item_id}")
@cache(expire=600)
async def get_expensive_data(item_id: int):
    # 執行耗時操作
    data = await fetch_from_database(item_id)
    return data
```

**響應緩存**

```python
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache

@app.on_event("startup")
async def startup():
    redis = aioredis.from_url("redis://localhost")
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")

@app.get("/items")
@cache(expire=60)
async def get_items():
    return await db_query()
```

### 響應壓縮

```python
from starlette.middleware.gzip import GZIPMiddleware

app.add_middleware(GZIPMiddleware, minimum_size=1000)
```

### 連接池管理

**HTTP 客戶端連接池**

```python
import httpx

# 全局客戶端（復用連接）
http_client = None

@app.on_event("startup")
async def startup_event():
    global http_client
    http_client = httpx.AsyncClient(
        limits=httpx.Limits(
            max_keepalive_connections=20,
            max_connections=100
        )
    )

@app.on_event("shutdown")
async def shutdown_event():
    await http_client.aclose()

@app.get("/fetch")
async def fetch_data():
    response = await http_client.get("https://api.example.com/data")
    return response.json()
```

### 性能監控

**Prometheus 指標**

```python
from prometheus_client import Counter, Histogram, make_asgi_app

REQUEST_COUNT = Counter('http_requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'Request latency')

@app.middleware("http")
async def monitor_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    REQUEST_COUNT.labels(method=request.method, endpoint=request.url.path).inc()
    REQUEST_LATENCY.observe(duration)
    
    return response

# 添加 metrics 端點
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)
```

### 最佳實踐

**1. 使用 Uvicorn 的最佳配置**

```bash
uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 4 \
    --loop uvloop \
    --http httptools \
    --log-level warning
```

**2. 啟用 HTTP/2**
- 使用支持 HTTP/2 的 ASGI 服務器
- 配置 TLS/SSL

**3. 限流保護**

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get("/limited")
@limiter.limit("10/minute")
async def limited_endpoint(request: Request):
    return {"message": "OK"}
```

**4. 使用 CDN 緩存靜態資源**

**5. 數據庫讀寫分離**

```python
# 讀寫分離配置
read_engine = create_async_engine(READ_DATABASE_URL)
write_engine = create_async_engine(WRITE_DATABASE_URL)

async def get_read_db():
    async with AsyncSession(read_engine) as session:
        yield session

async def get_write_db():
    async with AsyncSession(write_engine) as session:
        yield session
```

## 關鍵要點

FastAPI 性能優化的核心是正確使用異步編程，避免阻塞事件循環。數據庫優化包括使用異步驅動、連接池配置、避免 N+1 查詢和適當的索引。緩存策略如 Redis 可以顯著減少響應時間。配置合適的 Uvicorn workers 數量和使用 uvloop、httptools 可以提升性能。監控和限流是生產環境的必要措施。整體性能取決於正確的異步使用、有效的緩存、優化的數據庫查詢和合理的資源配置。
