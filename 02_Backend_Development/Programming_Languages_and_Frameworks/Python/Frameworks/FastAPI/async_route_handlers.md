# FastAPI 異步路由處理

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Async`, `AsyncIO`, `Performance`, `Concurrency`

## 問題詳述

深入探討 FastAPI 的異步路由處理機制，包括 async/await 語法的使用、異步與同步路由的區別、性能優勢、並發處理以及異步編程的最佳實踐。

## 核心理論與詳解

### FastAPI 異步支持的核心

**FastAPI 的異步優勢**：FastAPI 構建在 Starlette 之上，原生支持異步編程。這使得 FastAPI 能夠高效處理 I/O 密集型操作，如數據庫查詢、HTTP 請求、文件讀寫等，而不會阻塞其他請求。

**ASGI 協議**：FastAPI 使用 ASGI（Asynchronous Server Gateway Interface）而非傳統的 WSGI。ASGI 支持異步處理，允許服務器並發處理多個請求，顯著提高吞吐量。

**並發 vs 並行**：異步編程實現並發（concurrency）而非並行（parallelism）。單個線程可以在等待 I/O 時切換到處理其他請求，充分利用等待時間。這與多線程不同，避免了線程切換開銷和 GIL 限制。

### async def 路由函數

**異步路由定義**：使用 `async def` 定義路由處理函數，使其成為協程。FastAPI 會在事件循環中運行協程，支持使用 `await` 來等待異步操作。

**await 關鍵字**：在異步函數中，使用 `await` 來等待可等待對象（coroutine、Task、Future）完成。當遇到 `await` 時，控制權返回事件循環，允許處理其他請求。

**非阻塞特性**：異步路由在等待 I/O 操作（如數據庫查詢）時不會阻塞事件循環。服務器可以在這段時間內處理其他請求，提高整體吞吐量。

### 同步 vs 異步路由

**def 路由（同步）**：使用普通 `def` 定義的路由會在線程池中執行。FastAPI 自動將同步函數放入線程池，避免阻塞事件循環。這適合 CPU 密集型操作或使用同步庫的情況。

**async def 路由（異步）**：異步路由直接在事件循環中執行，不涉及線程切換。這適合 I/O 密集型操作，性能更好。

**選擇原則**：
- 使用異步庫（如 aiohttp、asyncpg、motor）時，必須使用 `async def`
- 使用同步庫（如 requests、psycopg2、pymongo）時，使用普通 `def`
- I/O 密集型操作優先使用異步
- CPU 密集型操作可以使用同步（在線程池中執行）

### 異步數據庫操作

**asyncpg**：PostgreSQL 的異步驅動，性能極佳。使用 `await` 執行查詢，不阻塞事件循環。

**aiomysql/aiosqlite**：MySQL 和 SQLite 的異步驅動。

**Motor**：MongoDB 的官方異步驅動，是 PyMongo 的異步版本。

**SQLAlchemy 異步**：SQLAlchemy 1.4+ 支持異步操作，通過 `async_engine` 和 `AsyncSession` 實現。

**Tortoise ORM**：原生異步 ORM，專為異步框架設計，API 類似 Django ORM。

### 異步 HTTP 客戶端

**httpx**：支持同步和異步的現代 HTTP 客戶端。異步版本使用 `AsyncClient`，完全兼容 async/await。

**aiohttp**：專門的異步 HTTP 客戶端/服務器框架。性能優異，但 API 較 httpx 複雜。

**避免同步客戶端**：在異步路由中不要使用 `requests` 等同步客戶端，這會阻塞事件循環，抵消異步的優勢。

### 並發處理

**asyncio.gather()**：並發執行多個協程，等待所有完成。這是並發處理多個獨立異步操作的常用方式。

**asyncio.create_task()**：創建任務並立即開始執行，不等待完成。用於後台任務或並發啟動多個操作。

**asyncio.wait()**：更高級的並發控制，支持超時和部分完成處理。

**並發優勢**：在一個請求中並發執行多個數據庫查詢或 HTTP 請求，可以顯著減少總響應時間。例如，三個各需 100ms 的查詢，串行需 300ms，並發只需 100ms。

### 異步依賴注入

**異步依賴函數**：FastAPI 的依賴注入支持異步依賴。使用 `async def` 定義依賴函數，可以在依賴中執行異步操作。

**依賴鏈**：異步依賴可以依賴其他異步依賴，FastAPI 會自動處理整個異步依賴鏈。

**資源管理**：異步依賴可以使用 `yield` 進行資源管理，確保資源正確關閉（如數據庫連接、HTTP 會話）。

### 後台任務

**BackgroundTasks**：FastAPI 提供 `BackgroundTasks` 來執行後台任務。這些任務在響應返回後執行，不阻塞響應。

**異步後台任務**：後台任務可以是異步函數，允許在後台執行異步操作，如發送郵件、更新緩存、記錄日誌。

**與 Celery 對比**：`BackgroundTasks` 適合輕量級任務。對於需要可靠性、重試、定時執行的任務，仍應使用 Celery 等專門的任務隊列。

### WebSocket 支持

**異步 WebSocket**：FastAPI 的 WebSocket 支持完全異步。`websocket.receive()` 和 `websocket.send()` 都是異步操作。

**並發連接**：異步特性使 FastAPI 能夠高效處理大量並發 WebSocket 連接，每個連接不需要專門的線程。

**廣播消息**：可以使用異步方式向多個 WebSocket 客戶端並發廣播消息。

### 性能優化

**連接池**：使用連接池來重用數據庫連接和 HTTP 會話。異步庫通常內建連接池支持。

**批量操作**：將多個小操作合併為批量操作，減少網絡往返次數。例如，批量插入數據庫記錄。

**緩存**：使用異步緩存（如 aioredis）來緩存頻繁訪問的數據，減少數據庫負載。

**避免阻塞操作**：確保所有 I/O 操作都是異步的。一個阻塞操作會影響整個事件循環的性能。

### 異步的局限性

**CPU 密集型任務**：異步不能提升 CPU 密集型任務的性能。對於密集計算，應考慮多進程或將任務卸載到後台隊列。

**GIL 限制**：Python 的 GIL 仍然限制真正的並行計算。異步的優勢在於 I/O 並發，而非計算並行。

**複雜性**：異步編程增加了代碼複雜度。需要注意事件循環、協程、異常處理等概念。

**庫兼容性**：不是所有庫都支持異步。使用同步庫時，需要在線程池中執行（FastAPI 會自動處理）。

### 混合使用同步和異步

**run_in_executor**：在異步函數中需要調用同步函數時，使用 `loop.run_in_executor()` 在線程池中執行同步代碼。

**sync_to_async**：某些庫提供的工具，如 Django 的 `sync_to_async`，用於將同步函數轉換為異步。

**FastAPI 自動處理**：FastAPI 會自動將普通 `def` 函數放入線程池執行，因此可以在同一應用中混合同步和異步路由。

### 異步編程最佳實踐

**一致性**：在異步上下文中，盡量使用異步庫和操作，保持代碼的一致性和性能。

**資源清理**：使用 `async with` 和 `try/finally` 確保異步資源（連接、會話）被正確關閉。

**錯誤處理**：異步代碼中的異常處理與同步代碼類似，但要注意 `await` 可能拋出的異常。

**避免阻塞**：不要在異步函數中調用阻塞操作（如 `time.sleep()`、同步 I/O）。使用異步替代（如 `asyncio.sleep()`）。

**測試**：使用 pytest-asyncio 或 FastAPI 的 `TestClient`（支持異步）來測試異步路由。

## 程式碼範例

```python
from fastapi import FastAPI, Depends, BackgroundTasks, WebSocket
from fastapi.responses import JSONResponse
import asyncio
import httpx
from typing import List

app = FastAPI()


# 1. 基本的異步路由
@app.get("/async")
async def async_route():
    """異步路由示例"""
    # 模擬異步 I/O 操作
    await asyncio.sleep(1)
    return {"message": "This is an async route"}


# 2. 同步路由（會在線程池中執行）
@app.get("/sync")
def sync_route():
    """同步路由示例"""
    import time
    time.sleep(1)  # 在線程池中執行，不會阻塞事件循環
    return {"message": "This is a sync route"}


# 3. 異步數據庫查詢示例（使用 SQLAlchemy async）
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# 創建異步引擎
engine = create_async_engine("postgresql+asyncpg://user:pass@localhost/db")
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    """異步數據庫會話依賴"""
    async with AsyncSessionLocal() as session:
        yield session


@app.get("/users/{user_id}")
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """異步查詢用戶"""
    from sqlalchemy import select
    from models import User  # 假設的模型
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user:
        return {"id": user.id, "name": user.name}
    return {"error": "User not found"}


# 4. 並發執行多個異步操作
@app.get("/dashboard")
async def dashboard(db: AsyncSession = Depends(get_db)):
    """並發獲取多個數據源"""
    
    # 並發執行三個查詢
    user_count_task = get_user_count(db)
    post_count_task = get_post_count(db)
    comment_count_task = get_comment_count(db)
    
    # 等待所有查詢完成
    user_count, post_count, comment_count = await asyncio.gather(
        user_count_task,
        post_count_task,
        comment_count_task
    )
    
    return {
        "users": user_count,
        "posts": post_count,
        "comments": comment_count
    }


async def get_user_count(db):
    await asyncio.sleep(0.1)  # 模擬查詢
    return 100


async def get_post_count(db):
    await asyncio.sleep(0.1)
    return 500


async def get_comment_count(db):
    await asyncio.sleep(0.1)
    return 1500


# 5. 異步 HTTP 請求示例
@app.get("/external-data")
async def fetch_external_data():
    """從外部 API 獲取數據"""
    async with httpx.AsyncClient() as client:
        # 並發請求多個 API
        response1_task = client.get("https://api.example.com/data1")
        response2_task = client.get("https://api.example.com/data2")
        
        response1, response2 = await asyncio.gather(
            response1_task,
            response2_task
        )
        
        return {
            "data1": response1.json(),
            "data2": response2.json()
        }


# 6. 異步後台任務
async def send_email_async(email: str, message: str):
    """異步發送郵件（模擬）"""
    await asyncio.sleep(2)  # 模擬發送郵件
    print(f"Email sent to {email}: {message}")


@app.post("/send-notification")
async def send_notification(
    email: str,
    message: str,
    background_tasks: BackgroundTasks
):
    """發送通知（使用後台任務）"""
    # 添加後台任務
    background_tasks.add_task(send_email_async, email, message)
    
    # 立即返回響應
    return {"message": "Notification will be sent"}


# 7. WebSocket 異步處理
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket 端點"""
    await websocket.accept()
    
    try:
        while True:
            # 異步接收消息
            data = await websocket.receive_text()
            
            # 處理消息（可能包含異步操作）
            response = await process_message(data)
            
            # 異步發送響應
            await websocket.send_text(f"Response: {response}")
    
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()


async def process_message(message: str) -> str:
    """處理 WebSocket 消息"""
    await asyncio.sleep(0.1)  # 模擬處理
    return message.upper()


# 8. 異步依賴注入
async def verify_token(token: str):
    """異步驗證 token"""
    await asyncio.sleep(0.1)  # 模擬驗證（可能查詢數據庫）
    return {"user_id": 123, "username": "john"}


async def get_current_user(token: str = Depends(verify_token)):
    """獲取當前用戶（異步依賴）"""
    return token


@app.get("/me")
async def read_current_user(user: dict = Depends(get_current_user)):
    """獲取當前用戶信息"""
    return user


# 9. 流式響應（異步生成器）
from fastapi.responses import StreamingResponse


async def generate_data():
    """異步生成數據流"""
    for i in range(10):
        await asyncio.sleep(0.5)
        yield f"data: {i}\n\n"


@app.get("/stream")
async def stream_data():
    """流式響應"""
    return StreamingResponse(generate_data(), media_type="text/event-stream")


# 10. 混合使用同步和異步
def blocking_operation():
    """同步阻塞操作"""
    import time
    time.sleep(2)
    return "Done"


@app.get("/mixed")
async def mixed_operation():
    """混合同步和異步操作"""
    # 在線程池中執行同步操作
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, blocking_operation)
    
    # 執行異步操作
    await asyncio.sleep(1)
    
    return {"result": result}


# 11. 錯誤處理
@app.get("/error-handling")
async def error_handling_example():
    """異步錯誤處理"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://api.example.com/data")
            response.raise_for_status()
            return response.json()
    
    except httpx.HTTPError as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"HTTP error occurred: {e}"}
        )
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"An error occurred: {e}"}
        )


# 12. 超時控制
@app.get("/with-timeout")
async def with_timeout():
    """帶超時控制的異步操作"""
    try:
        async with asyncio.timeout(5):  # Python 3.11+
            result = await slow_operation()
            return {"result": result}
    
    except asyncio.TimeoutError:
        return JSONResponse(
            status_code=504,
            content={"error": "Operation timed out"}
        )


async def slow_operation():
    """慢速操作"""
    await asyncio.sleep(3)
    return "Completed"


# 13. 使用 asyncpg 進行數據庫操作
import asyncpg


async def get_db_pool():
    """創建數據庫連接池"""
    return await asyncpg.create_pool(
        "postgresql://user:pass@localhost/db",
        min_size=10,
        max_size=20
    )


@app.on_event("startup")
async def startup():
    """應用啟動時創建連接池"""
    app.state.pool = await get_db_pool()


@app.on_event("shutdown")
async def shutdown():
    """應用關閉時關閉連接池"""
    await app.state.pool.close()


@app.get("/users")
async def list_users():
    """使用 asyncpg 查詢用戶列表"""
    async with app.state.pool.acquire() as connection:
        rows = await connection.fetch("SELECT * FROM users LIMIT 10")
        return [dict(row) for row in rows]


# 14. 批量操作優化
@app.post("/users/batch")
async def create_users_batch(users: List[dict], db: AsyncSession = Depends(get_db)):
    """批量創建用戶"""
    from models import User
    
    # 創建用戶對象列表
    user_objects = [User(**user) for user in users]
    
    # 批量插入
    db.add_all(user_objects)
    await db.commit()
    
    return {"created": len(user_objects)}


# 15. 使用 Tortoise ORM
from tortoise import fields
from tortoise.models import Model
from tortoise.contrib.fastapi import register_tortoise


class User(Model):
    id = fields.IntField(pk=True)
    username = fields.CharField(max_length=50, unique=True)
    email = fields.CharField(max_length=100)
    
    class Meta:
        table = "users"


# 註冊 Tortoise ORM
register_tortoise(
    app,
    db_url="postgres://user:pass@localhost/db",
    modules={"models": ["__main__"]},
    generate_schemas=True,
    add_exception_handlers=True,
)


@app.post("/users/tortoise")
async def create_user_tortoise(username: str, email: str):
    """使用 Tortoise ORM 創建用戶"""
    user = await User.create(username=username, email=email)
    return {"id": user.id, "username": user.username}


@app.get("/users/tortoise/{user_id}")
async def get_user_tortoise(user_id: int):
    """使用 Tortoise ORM 查詢用戶"""
    user = await User.get_or_none(id=user_id)
    if user:
        return {"id": user.id, "username": user.username, "email": user.email}
    return {"error": "User not found"}


# 16. 測試異步路由
"""
# test_async.py
import pytest
from httpx import AsyncClient
from main import app


@pytest.mark.asyncio
async def test_async_route():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/async")
        assert response.status_code == 200
        assert response.json() == {"message": "This is an async route"}
"""
```

## 相關主題

- [FastAPI 依賴注入系統](./dependency_injection_system.md)
- [FastAPI 性能優化](./performance_optimization.md)
- [FastAPI 數據庫集成](./database_integration.md)
- [Python 併發模型：多執行緒 vs. 多進程 vs. 異步](../../Concurrency/threading_vs_multiprocessing_vs_asyncio.md)
- [異步代碼測試](../../Testing/testing_async_code.md)
