# FastAPI WebSocket 支持

- **難度**: 7
- **重要性**: 4
- **標籤**: `WebSocket`, `Real-time`, `Bidirectional`

## 問題詳述

解釋 FastAPI 中 WebSocket 的實現機制，如何建立全雙工通信，以及在實時應用中的最佳實踐和應用場景。

## 核心理論與詳解

### WebSocket 基本概念

**WebSocket** 是一種在單個 TCP 連接上進行全雙工通信的協議，允許服務器主動向客戶端推送數據，非常適合實時應用。

**核心特點**：
- **全雙工通信**：客戶端和服務器可以同時發送和接收數據
- **持久連接**：連接建立後保持開啟，無需重複握手
- **低延遲**：沒有 HTTP 請求/響應開銷
- **實時性**：服務器可主動推送數據

**與 HTTP 的區別**：
- HTTP：單向請求-響應模式，客戶端主動
- WebSocket：雙向通信，服務器可主動推送

### FastAPI 中的 WebSocket

FastAPI 基於 Starlette，提供了完整的 WebSocket 支持。

**基本使用**

```python
from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse

app = FastAPI()

html = """
<!DOCTYPE html>
<html>
<head>
    <title>WebSocket Chat</title>
</head>
<body>
    <h1>WebSocket Chat</h1>
    <form action="" onsubmit="sendMessage(event)">
        <input type="text" id="messageText" autocomplete="off"/>
        <button>Send</button>
    </form>
    <ul id='messages'></ul>
    <script>
        var ws = new WebSocket("ws://localhost:8000/ws");
        
        ws.onmessage = function(event) {
            var messages = document.getElementById('messages')
            var message = document.createElement('li')
            var content = document.createTextNode(event.data)
            message.appendChild(content)
            messages.appendChild(message)
        };
        
        function sendMessage(event) {
            var input = document.getElementById("messageText")
            ws.send(input.value)
            input.value = ''
            event.preventDefault()
        }
    </script>
</body>
</html>
"""

@app.get("/")
async def get():
    return HTMLResponse(html)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # 接受連接
    await websocket.accept()
    
    try:
        while True:
            # 接收消息
            data = await websocket.receive_text()
            
            # 發送響應
            await websocket.send_text(f"你說: {data}")
    except WebSocketDisconnect:
        print("客戶端斷開連接")
```

### WebSocket 生命週期管理

**完整的連接管理**

```python
from fastapi import WebSocket, WebSocketDisconnect
from typing import List

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    
    try:
        # 通知所有人有新用戶加入
        await manager.broadcast(f"客戶端 #{client_id} 加入聊天")
        
        while True:
            data = await websocket.receive_text()
            
            # 發送個人消息
            await manager.send_personal_message(f"你說: {data}", websocket)
            
            # 廣播給其他人
            await manager.broadcast(f"客戶端 #{client_id}: {data}")
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"客戶端 #{client_id} 離開聊天")
```

### 消息類型處理

WebSocket 支持多種消息類型：

**文本和二進制消息**

```python
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    while True:
        # 接收不同類型的消息
        message = await websocket.receive()
        
        if message["type"] == "websocket.receive":
            if "text" in message:
                text_data = message["text"]
                await websocket.send_text(f"Text: {text_data}")
            
            elif "bytes" in message:
                binary_data = message["bytes"]
                await websocket.send_bytes(binary_data)
        
        elif message["type"] == "websocket.disconnect":
            break
```

**JSON 消息**

```python
import json

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    while True:
        # 接收 JSON 數據
        data = await websocket.receive_json()
        
        # 處理數據
        response = {
            "type": "response",
            "data": data,
            "timestamp": time.time()
        }
        
        # 發送 JSON 響應
        await websocket.send_json(response)
```

### 實際應用場景

**1. 實時聊天系統**

```python
from datetime import datetime
from pydantic import BaseModel

class Message(BaseModel):
    sender_id: int
    content: str
    timestamp: datetime = datetime.now()

class ChatRoom:
    def __init__(self):
        self.connections: dict[int, WebSocket] = {}
        self.message_history: List[Message] = []
    
    async def join(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.connections[user_id] = websocket
        
        # 發送歷史消息
        for msg in self.message_history[-50:]:  # 最近 50 條
            await websocket.send_json(msg.dict())
    
    async def leave(self, user_id: int):
        if user_id in self.connections:
            del self.connections[user_id]
    
    async def send_message(self, message: Message):
        self.message_history.append(message)
        
        # 廣播給所有在線用戶
        for user_id, websocket in self.connections.items():
            if user_id != message.sender_id:
                await websocket.send_json(message.dict())

chat_room = ChatRoom()

@app.websocket("/chat/{user_id}")
async def chat_endpoint(websocket: WebSocket, user_id: int):
    await chat_room.join(user_id, websocket)
    
    try:
        while True:
            data = await websocket.receive_json()
            message = Message(sender_id=user_id, content=data["content"])
            await chat_room.send_message(message)
    except WebSocketDisconnect:
        await chat_room.leave(user_id)
```

**2. 實時儀表板更新**

```python
import asyncio
from random import random

class MetricsManager:
    def __init__(self):
        self.subscribers: List[WebSocket] = []
    
    async def subscribe(self, websocket: WebSocket):
        await websocket.accept()
        self.subscribers.append(websocket)
    
    async def unsubscribe(self, websocket: WebSocket):
        self.subscribers.remove(websocket)
    
    async def broadcast_metrics(self):
        while True:
            # 模擬生成指標數據
            metrics = {
                "cpu": random() * 100,
                "memory": random() * 100,
                "requests_per_second": int(random() * 1000),
                "timestamp": time.time()
            }
            
            # 發送給所有訂閱者
            disconnected = []
            for websocket in self.subscribers:
                try:
                    await websocket.send_json(metrics)
                except:
                    disconnected.append(websocket)
            
            # 移除斷開的連接
            for ws in disconnected:
                self.subscribers.remove(ws)
            
            await asyncio.sleep(1)  # 每秒更新

metrics_manager = MetricsManager()

# 啟動時開始廣播
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(metrics_manager.broadcast_metrics())

@app.websocket("/metrics")
async def metrics_endpoint(websocket: WebSocket):
    await metrics_manager.subscribe(websocket)
    
    try:
        # 保持連接直到客戶端斷開
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await metrics_manager.unsubscribe(websocket)
```

**3. 多人協作編輯**

```python
from typing import Dict

class CollaborativeDocument:
    def __init__(self):
        self.content: str = ""
        self.editors: Dict[str, WebSocket] = {}
    
    async def add_editor(self, editor_id: str, websocket: WebSocket):
        await websocket.accept()
        self.editors[editor_id] = websocket
        
        # 發送當前文檔內容
        await websocket.send_json({
            "type": "init",
            "content": self.content
        })
    
    async def remove_editor(self, editor_id: str):
        if editor_id in self.editors:
            del self.editors[editor_id]
    
    async def handle_edit(self, editor_id: str, operation: dict):
        # 應用操作到文檔
        self.apply_operation(operation)
        
        # 廣播給其他編輯者
        for eid, websocket in self.editors.items():
            if eid != editor_id:
                await websocket.send_json({
                    "type": "operation",
                    "editor_id": editor_id,
                    "operation": operation
                })
    
    def apply_operation(self, operation: dict):
        # 實現操作轉換 (OT) 或 CRDT 算法
        pass

doc = CollaborativeDocument()

@app.websocket("/collab/{doc_id}/{editor_id}")
async def collab_endpoint(websocket: WebSocket, doc_id: str, editor_id: str):
    await doc.add_editor(editor_id, websocket)
    
    try:
        while True:
            data = await websocket.receive_json()
            await doc.handle_edit(editor_id, data)
    except WebSocketDisconnect:
        await doc.remove_editor(editor_id)
```

### 認證和授權

WebSocket 連接也需要認證：

```python
from fastapi import WebSocket, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user_ws(websocket: WebSocket):
    # 從查詢參數或頭部獲取 token
    token = websocket.query_params.get("token")
    
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        raise HTTPException(status_code=403, detail="Missing token")
    
    # 驗證 token
    user = verify_token(token)
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        raise HTTPException(status_code=403, detail="Invalid token")
    
    return user

@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    current_user = Depends(get_current_user_ws)
):
    await websocket.accept()
    # 處理認證用戶的 WebSocket 連接
```

### 錯誤處理和重連機制

**服務器端錯誤處理**

```python
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    try:
        while True:
            try:
                data = await websocket.receive_text()
                # 處理數據
                result = process_data(data)
                await websocket.send_json({"status": "ok", "result": result})
            except ValueError as e:
                # 發送錯誤消息但保持連接
                await websocket.send_json({"status": "error", "message": str(e)})
            except Exception as e:
                # 嚴重錯誤，關閉連接
                await websocket.send_json({"status": "fatal", "message": "服務器錯誤"})
                await websocket.close()
                break
    except WebSocketDisconnect:
        print("連接正常斷開")
```

**客戶端重連策略（JavaScript）**

```javascript
class WebSocketClient {
    constructor(url) {
        this.url = url;
        this.reconnectInterval = 1000;
        this.maxReconnectInterval = 30000;
        this.reconnectAttempts = 0;
        this.connect();
    }
    
    connect() {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
            console.log('Connected');
            this.reconnectAttempts = 0;
            this.reconnectInterval = 1000;
        };
        
        this.ws.onmessage = (event) => {
            this.handleMessage(event.data);
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        
        this.ws.onclose = () => {
            console.log('Disconnected');
            this.reconnect();
        };
    }
    
    reconnect() {
        this.reconnectAttempts++;
        
        setTimeout(() => {
            console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
            this.connect();
        }, this.reconnectInterval);
        
        // 指數退避
        this.reconnectInterval = Math.min(
            this.reconnectInterval * 2,
            this.maxReconnectInterval
        );
    }
    
    send(data) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }
}
```

### 性能優化和最佳實踐

**1. 連接數限制**
```python
class ConnectionManager:
    def __init__(self, max_connections: int = 1000):
        self.active_connections: List[WebSocket] = []
        self.max_connections = max_connections
    
    async def connect(self, websocket: WebSocket):
        if len(self.active_connections) >= self.max_connections:
            await websocket.close(code=1008, reason="服務器已滿")
            raise HTTPException(status_code=503, detail="連接數已達上限")
        
        await websocket.accept()
        self.active_connections.append(websocket)
```

**2. 消息壓縮**
- 對大型 JSON 消息使用壓縮
- 使用二進制格式（如 MessagePack）替代 JSON

**3. 心跳機制**
```python
import asyncio

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    async def send_ping():
        while True:
            try:
                await websocket.send_json({"type": "ping"})
                await asyncio.sleep(30)
            except:
                break
    
    # 啟動心跳任務
    ping_task = asyncio.create_task(send_ping())
    
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "pong":
                continue
            # 處理其他消息
    finally:
        ping_task.cancel()
```

**4. 使用 Redis Pub/Sub 實現跨服務器廣播**
```python
import aioredis

redis = await aioredis.create_redis_pool('redis://localhost')

async def subscribe_to_redis():
    channel = (await redis.subscribe('chat'))[0]
    
    while True:
        message = await channel.get()
        # 廣播給本地連接
        await manager.broadcast(message.decode())
```

## 關鍵要點

FastAPI 提供了完整的 WebSocket 支持，基於 Starlette 實現全雙工實時通信。適用於聊天系統、實時儀表板、協作編輯等場景。核心概念包括連接生命週期管理、消息類型處理（文本、二進制、JSON）、認證授權、錯誤處理和重連機制。實際應用中需要注意連接數限制、心跳機制、消息壓縮等性能優化。對於大規模分布式場景，可結合 Redis Pub/Sub 實現跨服務器消息廣播。WebSocket 是實現低延遲、實時雙向通信的最佳選擇。
