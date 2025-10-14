# FastAPI 後台任務

- **難度**: 6
- **重要性**: 4
- **標籤**: `Background Tasks`, `Async Tasks`

## 問題詳述

解釋 FastAPI 中後台任務的機制，如何在響應返回後執行異步任務，以及與 Celery 等任務隊列的區別和適用場景。

## 核心理論與詳解

### 後台任務基本概念

FastAPI 的 **BackgroundTasks** 允許在響應返回給客戶端後執行某些操作，而不會阻塞響應。這對於不需要立即完成的任務非常有用。

**典型應用場景**：
- **發送郵件通知**：用戶註冊後發送歡迎郵件
- **日誌記錄**：將詳細日誌寫入文件或數據庫
- **數據處理**：輕量級的數據清理或格式化
- **緩存更新**：更新緩存而不影響響應時間
- **統計記錄**：記錄用戶行為數據

**不適用場景**：
- 長時間運行的任務（>30 秒）
- 需要重試機制的任務
- 需要任務狀態追蹤的任務
- 需要分布式執行的任務

### 基本使用方式

**簡單示例**

```python
from fastapi import FastAPI, BackgroundTasks

app = FastAPI()

def write_log(message: str):
    with open("log.txt", "a") as log:
        log.write(message + "\n")

@app.post("/send-notification/{email}")
async def send_notification(email: str, background_tasks: BackgroundTasks):
    # 立即返回響應
    background_tasks.add_task(write_log, f"通知已發送給 {email}")
    return {"message": "通知正在發送中"}
```

**執行流程**：
1. 路由處理器執行
2. 響應立即返回給客戶端
3. 連接關閉後，後台任務開始執行
4. 任務在同一個進程中執行

### 添加多個後台任務

可以添加多個任務，它們會按順序執行：

```python
def write_notification_log(email: str):
    print(f"記錄通知日誌: {email}")

def send_email(email: str, message: str):
    print(f"發送郵件到 {email}: {message}")

def update_statistics(user_id: int):
    print(f"更新用戶 {user_id} 的統計數據")

@app.post("/users/")
async def create_user(
    email: str,
    user_id: int,
    background_tasks: BackgroundTasks
):
    # 添加多個任務
    background_tasks.add_task(write_notification_log, email)
    background_tasks.add_task(send_email, email, "歡迎加入！")
    background_tasks.add_task(update_statistics, user_id)
    
    return {"message": "用戶已創建"}
```

### 異步後台任務

後台任務支持異步函數：

```python
import asyncio
import httpx

async def fetch_user_data(user_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://api.example.com/users/{user_id}")
        data = response.json()
        # 處理數據
        await asyncio.sleep(1)  # 模擬處理時間

@app.get("/process-user/{user_id}")
async def process_user(user_id: int, background_tasks: BackgroundTasks):
    background_tasks.add_task(fetch_user_data, user_id)
    return {"message": "正在處理用戶數據"}
```

### 依賴注入中的後台任務

可以在依賴函數中使用後台任務：

```python
from fastapi import Depends

def log_access(user_id: int):
    print(f"用戶 {user_id} 訪問了資源")

async def get_current_user(background_tasks: BackgroundTasks) -> int:
    user_id = 123  # 從 token 獲取
    background_tasks.add_task(log_access, user_id)
    return user_id

@app.get("/items/")
async def read_items(user_id: int = Depends(get_current_user)):
    return {"user_id": user_id, "items": []}
```

### 錯誤處理

後台任務中的異常不會影響響應，但應該妥善處理：

```python
import logging

logger = logging.getLogger(__name__)

def risky_task(data: str):
    try:
        # 可能失敗的操作
        result = process_data(data)
        logger.info(f"任務成功: {result}")
    except Exception as e:
        logger.error(f"後台任務失敗: {str(e)}")
        # 可以選擇重試或發送告警

@app.post("/process/")
async def process(data: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(risky_task, data)
    return {"message": "任務已提交"}
```

### 實際應用示例

**1. 發送郵件通知**

```python
from email.mime.text import MIMEText
import smtplib

def send_email_notification(email: str, subject: str, body: str):
    try:
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = "noreply@example.com"
        msg['To'] = email
        
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login("user", "password")
            server.send_message(msg)
    except Exception as e:
        logger.error(f"發送郵件失敗: {e}")

@app.post("/register/")
async def register_user(email: str, background_tasks: BackgroundTasks):
    # 創建用戶邏輯...
    
    background_tasks.add_task(
        send_email_notification,
        email,
        "歡迎註冊",
        "感謝您的註冊！"
    )
    
    return {"message": "註冊成功"}
```

**2. 文件處理**

```python
import os
from typing import UploadFile

async def process_uploaded_file(file_path: str):
    # 處理上傳的文件
    try:
        # 執行圖片壓縮、格式轉換等
        await compress_image(file_path)
        logger.info(f"文件處理完成: {file_path}")
    except Exception as e:
        logger.error(f"文件處理失敗: {e}")
    finally:
        # 清理臨時文件
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/upload/")
async def upload_file(file: UploadFile, background_tasks: BackgroundTasks):
    file_path = f"/tmp/{file.filename}"
    
    # 保存文件
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # 後台處理
    background_tasks.add_task(process_uploaded_file, file_path)
    
    return {"filename": file.filename, "status": "processing"}
```

**3. 緩存預熱**

```python
from redis import Redis

redis_client = Redis(host='localhost', port=6379)

def warm_cache(user_id: int):
    # 預先載入常用數據到緩存
    user_data = fetch_user_data_from_db(user_id)
    user_preferences = fetch_user_preferences(user_id)
    
    redis_client.setex(f"user:{user_id}", 3600, json.dumps(user_data))
    redis_client.setex(f"pref:{user_id}", 3600, json.dumps(user_preferences))

@app.post("/login/")
async def login(user_id: int, background_tasks: BackgroundTasks):
    # 登錄邏輯...
    
    # 預熱緩存
    background_tasks.add_task(warm_cache, user_id)
    
    return {"message": "登錄成功"}
```

### BackgroundTasks vs Celery

| 特性 | BackgroundTasks | Celery |
|------|-----------------|--------|
| **設置複雜度** | 零配置 | 需要消息隊列（Redis/RabbitMQ） |
| **任務執行** | 同進程 | 獨立 Worker 進程 |
| **適合任務時長** | <10 秒 | 任意時長 |
| **可靠性** | 進程重啟會丟失 | 持久化，可重試 |
| **分布式** | 不支持 | 支持多 Worker |
| **任務追蹤** | 不支持 | 完整的狀態追蹤 |
| **定時任務** | 不支持 | 支持（Celery Beat） |
| **優先級隊列** | 不支持 | 支持 |

**選擇建議**：
- 使用 **BackgroundTasks**：快速、輕量級的任務（發郵件、記錄日誌）
- 使用 **Celery**：複雜、長時間、需要可靠性的任務（視頻處理、報表生成）

### 與 Celery 集成

對於複雜任務，可以在 FastAPI 中集成 Celery：

```python
from celery import Celery

celery_app = Celery(
    "tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

@celery_app.task
def long_running_task(data: dict):
    # 執行複雜任務
    import time
    time.sleep(60)
    return {"status": "completed"}

@app.post("/heavy-task/")
async def heavy_task(data: dict):
    # 提交到 Celery
    task = long_running_task.delay(data)
    
    return {
        "task_id": task.id,
        "status": "submitted",
        "message": "任務已提交，請稍後查詢結果"
    }

@app.get("/task-status/{task_id}")
async def get_task_status(task_id: str):
    task = celery_app.AsyncResult(task_id)
    return {
        "task_id": task_id,
        "status": task.status,
        "result": task.result if task.ready() else None
    }
```

### 最佳實踐

**1. 保持任務簡短**
- 後台任務應該在 10 秒內完成
- 超過此時間建議使用 Celery

**2. 冪等性**
- 設計任務時考慮冪等性
- 任務可能因錯誤重複執行

**3. 錯誤處理**
- 在任務內部處理所有異常
- 記錄詳細的錯誤日誌
- 避免任務失敗影響主流程

**4. 避免阻塞**
- 使用異步函數處理 I/O 操作
- 避免 CPU 密集型任務

**5. 監控和日誌**
```python
import time

def monitored_task(task_name: str, data: dict):
    start_time = time.time()
    try:
        logger.info(f"任務開始: {task_name}")
        # 執行任務
        result = perform_task(data)
        duration = time.time() - start_time
        logger.info(f"任務完成: {task_name}, 耗時: {duration:.2f}s")
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"任務失敗: {task_name}, 耗時: {duration:.2f}s, 錯誤: {e}")
```

**6. 資源管理**
- 及時關閉資源（文件、數據庫連接）
- 避免資源洩漏

## 關鍵要點

FastAPI 的 BackgroundTasks 提供了簡單、零配置的後台任務執行能力，適合處理輕量級、快速的異步操作如發送郵件、記錄日誌、更新緩存等。任務在響應返回後在同一進程中執行，不會阻塞響應。但對於長時間運行、需要重試機制或分布式執行的任務，應該使用 Celery 等專業任務隊列。BackgroundTasks 的核心優勢在於簡單性和與 FastAPI 的無縫集成，開發者無需額外的基礎設施即可實現基本的後台任務功能。
