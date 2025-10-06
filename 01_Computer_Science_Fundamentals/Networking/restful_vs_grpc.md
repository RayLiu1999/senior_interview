# RESTful API vs gRPC

- **難度**: 6
- **重要程度**: 5
- **標籤**: `REST`, `gRPC`, `API 設計`, `微服務`, `RPC`

## 問題詳述

比較 RESTful API 和 gRPC 兩種主流 API 設計風格的差異、各自的優勢和適用場景，以及在實際項目中如何選擇。

## 核心理論與詳解

### 1. 基本概念

#### RESTful API

**REST (Representational State Transfer)** 是一種基於 HTTP 的架構風格，使用標準的 HTTP 方法操作資源。

**核心原則**:
- **資源導向**: 一切皆為資源，通過 URI 標識
- **統一介面**: 使用標準 HTTP 方法 (GET, POST, PUT, DELETE)
- **無狀態**: 每個請求獨立，伺服器不保存客戶端狀態
- **可快取**: 回應可明確標記是否可快取
- **分層系統**: 支援中間層 (如負載均衡器、快取)

#### gRPC

**gRPC (gRPC Remote Procedure Calls)** 是 Google 開發的高效能 RPC 框架，基於 HTTP/2 和 Protocol Buffers。

**核心特性**:
- **基於 HTTP/2**: 多路復用、雙向串流、頭部壓縮
- **Protocol Buffers**: 高效的二進制序列化
- **強型別**: 嚴格的介面定義語言 (IDL)
- **多語言支援**: 自動生成多種語言的客戶端/伺服器代碼
- **四種通信模式**: 一元、伺服器串流、客戶端串流、雙向串流

### 2. 核心差異對比

| 維度 | RESTful API | gRPC |
|-----|------------|------|
| **協定** | HTTP/1.1 (主流) | HTTP/2 (必須) |
| **資料格式** | JSON (主流), XML | Protocol Buffers (二進制) |
| **介面定義** | OpenAPI/Swagger (可選) | Protobuf (.proto 檔案, 必須) |
| **通信模式** | 請求-回應 (Request-Response) | 一元、伺服器串流、客戶端串流、雙向串流 |
| **瀏覽器支援** | ✅ 原生支援 | ❌ 需要 gRPC-Web 代理 |
| **可讀性** | 高 (文字格式) | 低 (二進制格式) |
| **效能** | 中等 | 高 |
| **程式碼生成** | 可選 | 自動 |
| **型別安全** | 弱 (依賴文檔) | 強 (編譯時檢查) |
| **學習曲線** | 低 | 中等 |

### 3. RESTful API 詳解

#### HTTP 方法語意

```
資源: /api/users/{id}

GET    /api/users        → 獲取用戶列表
GET    /api/users/123    → 獲取特定用戶
POST   /api/users        → 建立新用戶
PUT    /api/users/123    → 完整更新用戶
PATCH  /api/users/123    → 部分更新用戶
DELETE /api/users/123    → 刪除用戶
```

#### RESTful 成熟度模型 (Richardson Maturity Model)

**Level 0: The Swamp of POX**
- 單一端點，單一 HTTP 方法 (通常是 POST)
- HTTP 僅作為傳輸通道

**Level 1: Resources**
- 引入資源概念
- 多個端點，但仍使用單一 HTTP 方法

**Level 2: HTTP Verbs**
- 正確使用 HTTP 方法
- 使用 HTTP 狀態碼

**Level 3: Hypermedia Controls (HATEOAS)**
- 回應包含相關資源的連結
- 客戶端透過連結發現 API

**最佳實踐**:
- 大多數 API 實現 Level 2 即可
- Level 3 (HATEOAS) 增加複雜度，實際應用較少

#### RESTful API 設計範例

```json
// GET /api/users/123
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-20T15:30:00Z"
}

// POST /api/users
Request:
{
  "name": "Jane Smith",
  "email": "jane@example.com"
}

Response: 201 Created
Location: /api/users/124
{
  "id": 124,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "created_at": "2024-01-21T09:00:00Z"
}

// PATCH /api/users/123
{
  "email": "newemail@example.com"
}

Response: 200 OK
{
  "id": 123,
  "name": "John Doe",
  "email": "newemail@example.com",
  "updated_at": "2024-01-21T10:00:00Z"
}
```

#### HTTP 狀態碼最佳實踐

**成功 (2xx)**:
- `200 OK`: 請求成功 (GET, PUT, PATCH)
- `201 Created`: 資源建立成功 (POST)
- `204 No Content`: 成功但無回應內容 (DELETE)

**客戶端錯誤 (4xx)**:
- `400 Bad Request`: 請求格式錯誤
- `401 Unauthorized`: 未認證
- `403 Forbidden`: 已認證但無權限
- `404 Not Found`: 資源不存在
- `409 Conflict`: 資源衝突 (如重複建立)
- `429 Too Many Requests`: 速率限制

**伺服器錯誤 (5xx)**:
- `500 Internal Server Error`: 伺服器錯誤
- `502 Bad Gateway`: 上游伺服器錯誤
- `503 Service Unavailable`: 服務暫時不可用
- `504 Gateway Timeout`: 上游伺服器超時

### 4. gRPC 詳解

#### Protocol Buffers 定義

```protobuf
// user.proto
syntax = "proto3";

package user;

// 服務定義
service UserService {
  // 一元 RPC
  rpc GetUser(GetUserRequest) returns (User);
  
  // 伺服器串流
  rpc ListUsers(ListUsersRequest) returns (stream User);
  
  // 客戶端串流
  rpc CreateUsers(stream CreateUserRequest) returns (CreateUsersResponse);
  
  // 雙向串流
  rpc Chat(stream ChatMessage) returns (stream ChatMessage);
}

// 訊息定義
message User {
  int64 id = 1;
  string name = 2;
  string email = 3;
  int64 created_at = 4;
}

message GetUserRequest {
  int64 id = 1;
}

message ListUsersRequest {
  int32 page = 1;
  int32 page_size = 2;
}

message CreateUserRequest {
  string name = 1;
  string email = 2;
}

message CreateUsersResponse {
  repeated int64 ids = 1;
  int32 count = 2;
}

message ChatMessage {
  string content = 1;
  int64 timestamp = 2;
}
```

#### 四種通信模式

**1. 一元 RPC (Unary RPC)**
```
客戶端 ──── 單一請求 ─────> 伺服器
客戶端 <─── 單一回應 ────── 伺服器
```

類似傳統的 RESTful API

**2. 伺服器串流 (Server Streaming)**
```
客戶端 ──── 單一請求 ─────> 伺服器
客戶端 <─── 多個回應 ────── 伺服器
客戶端 <─── 回應 ───────── 伺服器
客戶端 <─── 回應 (結束) ── 伺服器
```

**適用場景**: 
- 下載大檔案 (分片傳輸)
- 即時資料推送 (如股票行情)
- 日誌串流

**3. 客戶端串流 (Client Streaming)**
```
客戶端 ──── 多個請求 ─────> 伺服器
客戶端 ──── 請求 ─────────> 伺服器
客戶端 ──── 請求 (結束) ──> 伺服器
客戶端 <─── 單一回應 ────── 伺服器
```

**適用場景**:
- 檔案上傳 (分片傳輸)
- 批次資料上傳
- 指標收集

**4. 雙向串流 (Bidirectional Streaming)**
```
客戶端 <──────────────────> 伺服器
   ↓     ← 回應    請求 →      ↑
   ↓     ← 回應    請求 →      ↑
   ↓     ← 回應    請求 →      ↑
```

**適用場景**:
- 即時聊天
- 協作編輯
- 線上遊戲

#### gRPC 錯誤處理

**狀態碼 (Status Codes)**:

| 狀態碼 | 名稱 | 對應 HTTP | 描述 |
|-------|------|-----------|------|
| `0` | OK | 200 | 成功 |
| `1` | CANCELLED | 499 | 操作被取消 |
| `2` | UNKNOWN | 500 | 未知錯誤 |
| `3` | INVALID_ARGUMENT | 400 | 無效參數 |
| `4` | DEADLINE_EXCEEDED | 504 | 超時 |
| `5` | NOT_FOUND | 404 | 資源不存在 |
| `6` | ALREADY_EXISTS | 409 | 資源已存在 |
| `7` | PERMISSION_DENIED | 403 | 權限不足 |
| `8` | RESOURCE_EXHAUSTED | 429 | 資源耗盡 (速率限制) |
| `9` | FAILED_PRECONDITION | 400 | 前提條件失敗 |
| `10` | ABORTED | 409 | 操作被中止 (衝突) |
| `11` | OUT_OF_RANGE | 400 | 範圍外 |
| `12` | UNIMPLEMENTED | 501 | 未實現 |
| `13` | INTERNAL | 500 | 內部錯誤 |
| `14` | UNAVAILABLE | 503 | 服務不可用 |
| `15` | DATA_LOSS | 500 | 資料遺失 |
| `16` | UNAUTHENTICATED | 401 | 未認證 |

#### gRPC Metadata (類似 HTTP Headers)

```go
// 客戶端發送 metadata
md := metadata.Pairs(
    "authorization", "Bearer token123",
    "request-id", "req-456",
)
ctx := metadata.NewOutgoingContext(context.Background(), md)

// 伺服器接收 metadata
md, ok := metadata.FromIncomingContext(ctx)
if ok {
    auth := md.Get("authorization")
}

// 伺服器發送 metadata
header := metadata.Pairs("server-version", "1.0.0")
grpc.SendHeader(ctx, header)
```

### 5. 效能對比

#### 序列化效率

**測試場景**: 序列化 1000 個複雜物件

| 格式 | 大小 | 序列化時間 | 反序列化時間 |
|-----|------|-----------|-------------|
| **JSON** | 100% (基準) | 100% | 100% |
| **Protocol Buffers** | **20-30%** | **10-20%** | **10-20%** |
| **MessagePack** | 60-70% | 40-60% | 40-60% |

**結論**: Protobuf 在體積和速度上都有 3-5 倍的優勢

#### 網路傳輸效率

**HTTP/2 的優勢 (gRPC 使用)**:
- **多路復用**: 單一連接處理多個請求
- **頭部壓縮**: HPACK 壓縮重複頭部
- **伺服器推送**: 主動推送相關資源
- **二進制幀**: 更高效的解析

**延遲對比** (微服務間通信):

```
RESTful (HTTP/1.1 + JSON):
  建立連接: 50ms
  TLS 握手: 100ms
  請求/回應: 10ms
  總計: 160ms

gRPC (HTTP/2 + Protobuf):
  建立連接: 50ms (首次)
  TLS 握手: 100ms (首次)
  請求/回應: 2ms (連接復用)
  總計: 152ms (首次), 2ms (後續)
```

**吞吐量對比**:
- RESTful: ~10,000 請求/秒
- gRPC: ~50,000 請求/秒 (5 倍提升)

### 6. 適用場景

#### 選擇 RESTful API 的場景

✅ **公開 API (Public API)**
- 需要廣泛的客戶端支援 (瀏覽器、移動應用、第三方)
- 需要易於理解的文檔
- 開發者熟悉 REST 風格

✅ **簡單的 CRUD 操作**
- 資源導向的操作
- 無需複雜的資料流
- 無高效能要求

✅ **需要人類可讀**
- 調試方便 (可直接查看 JSON)
- 需要瀏覽器直接訪問
- 需要快取 (CDN, 瀏覽器快取)

✅ **團隊熟悉度高**
- 團隊成員熟悉 REST
- 無需學習新技術
- 快速開發

#### 選擇 gRPC 的場景

✅ **微服務間通信**
- 內部服務通信
- 需要高效能和低延遲
- 強型別約束

✅ **即時通信**
- 需要雙向串流
- 推送通知
- 即時資料同步

✅ **多語言環境**
- 需要自動生成多語言客戶端
- 確保跨語言一致性
- 減少手動維護介面定義

✅ **高效能要求**
- 大量資料傳輸
- 低延遲要求
- 高吞吐量需求

✅ **串流處理**
- 大檔案傳輸
- 批次資料處理
- 持續資料流

### 7. 混合使用策略

#### BFF (Backend for Frontend) 模式

```
[Web 瀏覽器]     [移動 App]
      ↓              ↓
   RESTful        RESTful
      ↓              ↓
   [Web BFF]     [Mobile BFF]
      ↓              ↓
      └──── gRPC ────┘
              ↓
     [微服務集群]
    Service A, B, C...
```

**優勢**:
- 外部使用 RESTful (相容性好)
- 內部使用 gRPC (效能高)
- BFF 層做協定轉換

#### gRPC-Web

**問題**: 瀏覽器不直接支援 gRPC

**解決**: gRPC-Web 提供瀏覽器相容層

```
[瀏覽器] ──── gRPC-Web ───> [Envoy 代理] ──── gRPC ───> [伺服器]
```

**特性**:
- 使用 HTTP/1.1 或 HTTP/2
- JavaScript 客戶端自動生成
- 需要代理 (如 Envoy) 進行協定轉換

**限制**:
- 不支援客戶端串流
- 不支援雙向串流 (需要 WebSocket)

### 8. 安全性對比

#### 認證與授權

**RESTful**:
- **API Key**: 簡單但不安全
- **JWT (JSON Web Token)**: 主流方案
  ```http
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **OAuth 2.0**: 複雜場景 (第三方授權)

**gRPC**:
- **TLS 雙向認證**: 伺服器和客戶端互相驗證
- **Token-based Auth**: 透過 Metadata 傳遞 JWT
  ```go
  md := metadata.Pairs("authorization", "Bearer "+token)
  ```
- **Interceptor**: 統一處理認證邏輯
  ```go
  opts := []grpc.DialOption{
      grpc.WithUnaryInterceptor(authInterceptor),
  }
  ```

#### 傳輸安全

**RESTful**:
- 使用 HTTPS (TLS 1.2+)
- 設定 HSTS 強制 HTTPS
- 配置適當的 CORS 策略

**gRPC**:
- 預設使用 TLS
- 支援雙向 TLS 認證 (mTLS)
- 可配置不同等級的安全策略

### 9. 版本管理

#### RESTful API 版本控制

**方法 1: URL 版本**
```
https://api.example.com/v1/users
https://api.example.com/v2/users
```

**方法 2: Header 版本**
```http
Accept: application/vnd.example.v1+json
Accept: application/vnd.example.v2+json
```

**方法 3: Query 參數**
```
https://api.example.com/users?version=1
https://api.example.com/users?version=2
```

**推薦**: URL 版本 (最直觀、易於路由)

#### gRPC 版本控制

**方法 1: Package 版本**
```protobuf
package user.v1;
package user.v2;
```

**方法 2: Service 版本**
```protobuf
service UserServiceV1 {}
service UserServiceV2 {}
```

**方法 3: 向後相容演進**
- Protobuf 支援欄位新增 (向後相容)
- 避免刪除或修改欄位號碼
- 使用 `reserved` 保留已廢棄的欄位

```protobuf
message User {
  int64 id = 1;
  string name = 2;
  string email = 3;
  reserved 4;  // 已廢棄欄位
  string phone = 5;  // 新增欄位
}
```

### 10. 監控與除錯

#### RESTful 監控

**工具**:
- **Postman / Insomnia**: API 測試
- **Swagger UI**: 互動式文檔
- **HTTP 抓包**: Charles, Fiddler, Wireshark

**指標**:
- 請求數 (QPS)
- 回應時間 (延遲分布)
- 錯誤率 (按狀態碼分類)
- 端點熱度 (Top N API)

#### gRPC 監控

**工具**:
- **grpcurl**: 命令行 gRPC 客戶端
- **grpcui**: Web UI 介面
- **Wireshark**: 需要解密 TLS

**指標**:
- RPC 調用次數
- 調用延遲 (P50, P95, P99)
- 錯誤率 (按狀態碼分類)
- 串流持續時間

**Interceptor 實現監控**:
```go
// 伺服器端 Interceptor
func loggingInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
    start := time.Now()
    resp, err := handler(ctx, req)
    duration := time.Since(start)
    
    log.Printf("method=%s duration=%v error=%v", info.FullMethod, duration, err)
    return resp, err
}
```

### 11. 實務最佳實踐

#### RESTful API 設計清單

- [ ] 使用名詞表示資源 (`/users` 而非 `/getUsers`)
- [ ] 使用複數形式 (`/users` 而非 `/user`)
- [ ] 正確使用 HTTP 方法 (GET, POST, PUT, PATCH, DELETE)
- [ ] 使用適當的 HTTP 狀態碼
- [ ] 實施版本控制 (如 `/v1/`)
- [ ] 提供分頁 (`page`, `limit`, `offset`)
- [ ] 提供過濾和排序 (`?status=active&sort=created_at`)
- [ ] 使用 HATEOAS (可選)
- [ ] 提供 OpenAPI/Swagger 文檔
- [ ] 實施速率限制
- [ ] 使用 HTTPS
- [ ] 實施 CORS (公開 API)
- [ ] 統一錯誤格式
- [ ] 記錄請求日誌

#### gRPC 設計清單

- [ ] 使用語意化的服務和方法名稱
- [ ] 為每個 RPC 定義專用的請求/回應訊息
- [ ] 避免使用 `Empty` 訊息，預留擴充空間
- [ ] 使用適當的流式傳輸模式
- [ ] 實施超時控制 (Context Deadline)
- [ ] 實施重試策略 (Exponential Backoff)
- [ ] 使用 Interceptor 處理通用邏輯 (認證、日誌)
- [ ] 啟用 TLS 加密
- [ ] 實施服務發現和負載均衡
- [ ] 定義錯誤碼和錯誤處理策略
- [ ] 記錄 RPC 日誌和指標
- [ ] 提供 .proto 檔案文檔
- [ ] 使用向後相容的 Protobuf 演進策略

## 總結

RESTful API 和 gRPC 各有千秋，選擇取決於具體需求：

### RESTful API 適合：
1. **公開 API**: 廣泛的客戶端支援
2. **簡單 CRUD**: 資源導向的操作
3. **快速開發**: 團隊熟悉，工具完善
4. **需要快取**: 瀏覽器和 CDN 快取

### gRPC 適合：
1. **微服務**: 內部服務高效通信
2. **高效能**: 低延遲、高吞吐量
3. **串流處理**: 雙向通信、大檔案傳輸
4. **強型別**: 編譯時檢查，自動生成程式碼

### 混合策略：
- **外部使用 RESTful**: 相容性和易用性
- **內部使用 gRPC**: 效能和型別安全
- **BFF 模式**: 協定轉換和適配

作為資深後端工程師，你需要：
- 理解兩種架構的底層原理和權衡
- 根據業務場景選擇合適的 API 風格
- 能夠設計和實施兩種 API
- 掌握效能優化和安全最佳實踐
- 在團隊中推廣合適的技術選型
