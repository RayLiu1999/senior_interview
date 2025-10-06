# 什麼是分散式追蹤？為什麼需要它？

- **難度**: 5
- **重要程度**: 5
- **標籤**: `分散式追蹤`, `Distributed Tracing`, `APM`, `微服務`

## 問題詳述

在微服務和分散式系統中，一個用戶請求可能會經過多個服務處理。分散式追蹤（Distributed Tracing）是一種追蹤請求在整個系統中流轉路徑的技術，能夠幫助我們理解系統行為、定位效能瓶頸和診斷問題。

## 核心理論與詳解

### 問題背景：單體到微服務的演進

#### 單體應用時代

在傳統的單體應用中，除錯相對簡單：

```
User Request → Web Server → Application → Database → Response
```

**除錯方式**：
- 查看應用日誌
- 使用 Profiler 分析效能
- 在本地重現問題

所有邏輯在一個程序中，**調用棧（Call Stack）** 清晰可見：

```
main()
  └─ handleRequest()
      └─ getUserData()
          └─ queryDatabase()
```

#### 微服務時代的挑戰

微服務架構將單體拆分為多個獨立服務：

```
User Request 
  → API Gateway 
      → User Service 
          → Database
          → Cache Service
      → Order Service 
          → Database
          → Payment Service 
              → Database
              → Notification Service
                  → Email Service
                  → SMS Service
```

**新的挑戰**：

1. **複雜的調用鏈**：
   - 一個請求可能跨越 10+ 個服務
   - 服務間調用關係錯綜複雜
   - 難以理解整體流程

2. **效能問題定位困難**：
   - 請求總耗時 2 秒，但不知道瓶頸在哪
   - 可能是某個服務慢，也可能是網路延遲
   - 傳統日誌無法關聯跨服務的請求

3. **異常診斷複雜**：
   - 用戶報告「訂單創建失敗」
   - 需要查看多個服務的日誌
   - 日誌散落在不同機器上
   - 時鐘不同步可能導致時間順序混亂

4. **依賴關係不清晰**：
   - 服務 A 依賴哪些服務？
   - 哪些服務依賴服務 A？
   - 服務之間的調用頻率如何？

**傳統監控的局限**：

- **Metrics（指標）**：只能看到聚合資料，看不到單個請求的詳情
- **Logs（日誌）**：缺乏跨服務的關聯，難以串聯整個請求鏈路
- **調用棧**：只能看到單個服務內部的調用，無法跨服務邊界

---

### 分散式追蹤的定義

**分散式追蹤（Distributed Tracing）** 是一種用於分析和監控分散式系統的技術，它能夠追蹤一個請求在多個服務間的完整生命週期，記錄每個服務處理該請求的時間、順序和上下文資訊。

**核心目標**：

1. **可視化請求流**：展示請求在系統中的完整路徑
2. **效能分析**：識別每個服務和操作的耗時
3. **依賴分析**：理解服務間的依賴關係
4. **問題定位**：快速找到錯誤或緩慢的服務

---

### 核心概念

#### 1. Trace（追蹤）

**Trace** 代表一個請求的完整生命週期，是整個調用鏈的根。

**特性**：
- 有唯一的 **Trace ID**
- 包含一個或多個 **Span**
- 記錄請求的開始到結束

**範例**：用戶下單的 Trace
```
Trace ID: 4bf92f3577b34da6a3ce929d0e0e4736
Duration: 1.2s
Status: Success
Spans: 8
```

#### 2. Span（跨度）

**Span** 是 Trace 中的一個操作單元，代表一次服務調用、資料庫查詢或其他操作。

**Span 的結構**：

```json
{
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "6e0c63257de34c92",
  "parentSpanId": "00f067aa0ba902b7",
  "operationName": "HTTP GET /orders",
  "startTime": "2024-01-15T10:00:00.000Z",
  "duration": 250,  // milliseconds
  "tags": {
    "http.method": "GET",
    "http.url": "/orders/12345",
    "http.status_code": 200,
    "service.name": "order-service"
  },
  "logs": [
    {
      "timestamp": "2024-01-15T10:00:00.100Z",
      "event": "cache_miss"
    }
  ]
}
```

**Span 的組成部分**：

1. **唯一識別**：
   - `traceId`：所屬的 Trace ID
   - `spanId`：Span 自己的唯一 ID
   - `parentSpanId`：父 Span 的 ID（根 Span 沒有父 Span）

2. **操作資訊**：
   - `operationName`：操作名稱（如「HTTP GET /orders」）
   - `startTime`：開始時間
   - `duration`：持續時間

3. **元資料**：
   - `tags`：鍵值對，描述 Span 的屬性
   - `logs`：Span 內發生的事件

#### 3. Span 的層級關係

Span 之間形成父子樹狀結構：

```
[Span 1] API Gateway (1000ms)
    │
    ├─[Span 2] User Service (200ms)
    │   │
    │   ├─[Span 3] User DB Query (50ms)
    │   └─[Span 4] Cache Read (10ms)
    │
    └─[Span 5] Order Service (600ms)
        │
        ├─[Span 6] Order DB Query (100ms)
        └─[Span 7] Payment Service (400ms)
            │
            └─[Span 8] Payment Gateway API (350ms)
```

**瀑布圖（Waterfall Diagram）視覺化**：

```
0ms         500ms       1000ms      1500ms
│───────────────────────────────────────│
API Gateway         [████████████████████] 1000ms
  User Service      [████]                  200ms
    User DB         [█]                      50ms
    Cache           [▌]                      10ms
  Order Service         [████████████]      600ms
    Order DB            [██]                 100ms
    Payment Service        [████████]        400ms
      Payment API            [███████]       350ms
```

從這個視圖可以看出：
- Payment Service 是主要瓶頸（400ms）
- Payment Gateway API 佔用了 Payment Service 大部分時間
- User Service 和 Order Service 是並行執行的

#### 4. Tags（標籤）

Tags 是 Span 的鍵值對元資料，用於描述和過濾 Span。

**常見的 Tags**：

| Tag | 說明 | 範例 |
|-----|------|------|
| `service.name` | 服務名稱 | `order-service` |
| `http.method` | HTTP 方法 | `GET`, `POST` |
| `http.url` | 請求 URL | `/api/orders/123` |
| `http.status_code` | HTTP 狀態碼 | `200`, `404`, `500` |
| `db.type` | 資料庫類型 | `mysql`, `redis` |
| `db.statement` | 資料庫查詢 | `SELECT * FROM orders` |
| `error` | 是否錯誤 | `true`, `false` |
| `span.kind` | Span 類型 | `client`, `server`, `producer`, `consumer` |

**Span Kind**（Span 類型）：

- **SERVER**：處理 RPC 或 HTTP 請求的服務端
- **CLIENT**：發起 RPC 或 HTTP 請求的客戶端
- **PRODUCER**：發送訊息到訊息佇列
- **CONSUMER**：從訊息佇列接收訊息
- **INTERNAL**：內部操作（如本地函數調用）

#### 5. Logs（日誌事件）

Span 可以記錄在處理過程中發生的事件：

```json
{
  "logs": [
    {
      "timestamp": "2024-01-15T10:00:00.050Z",
      "event": "cache_lookup",
      "cache.hit": false
    },
    {
      "timestamp": "2024-01-15T10:00:00.100Z",
      "event": "db_query_start",
      "query": "SELECT * FROM orders WHERE id = ?"
    },
    {
      "timestamp": "2024-01-15T10:00:00.150Z",
      "event": "db_query_end",
      "rows_returned": 1
    }
  ]
}
```

#### 6. Context Propagation（上下文傳播）

為了串聯跨服務的 Span，需要在服務間傳遞追蹤上下文。

**傳播方式**：

##### HTTP Headers（最常見）
```http
GET /orders/123 HTTP/1.1
Host: order-service
X-B3-TraceId: 4bf92f3577b34da6a3ce929d0e0e4736
X-B3-SpanId: 6e0c63257de34c92
X-B3-ParentSpanId: 00f067aa0ba902b7
X-B3-Sampled: 1
```

常見的 Header 格式：
- **B3 (Zipkin)**：`X-B3-TraceId`, `X-B3-SpanId` 等
- **W3C Trace Context**（標準）：`traceparent`, `tracestate`
- **Jaeger**：`uber-trace-id`

##### Message Queue
在訊息的元資料或 Payload 中傳遞：
```json
{
  "headers": {
    "trace-id": "4bf92f3577b34da6a3ce929d0e0e4736",
    "span-id": "6e0c63257de34c92"
  },
  "body": { ... }
}
```

##### gRPC Metadata
```
metadata = {
  'x-trace-id': '4bf92f3577b34da6a3ce929d0e0e4736',
  'x-span-id': '6e0c63257de34c92'
}
```

**上下文傳播流程**：

```
Service A                    Service B
┌─────────┐                 ┌─────────┐
│ Span 1  │                 │ Span 2  │
│ TraceID │  HTTP Request   │ TraceID │
│ SpanID  │ ─────────────>  │ SpanID  │
│         │  + TraceID      │ Parent  │
│         │  + ParentID     │ SpanID  │
└─────────┘                 └─────────┘
```

Service B 從請求中提取 TraceID 和 ParentID，創建自己的 Span。

---

### 分散式追蹤的工作原理

#### 完整的追蹤流程

以一個用戶下單請求為例：

**1. 用戶發起請求**
```
User → API Gateway
```

API Gateway 生成 **Trace ID** 和第一個 **Span**：
```
TraceID: abc123
Span 1: API Gateway (spanId: s1, parent: null)
```

**2. 調用 User Service**
```
API Gateway → User Service (HTTP)
```

API Gateway 在請求中傳遞追蹤上下文：
```http
GET /users/456 HTTP/1.1
X-Trace-Id: abc123
X-Parent-Span-Id: s1
```

User Service 創建新的 Span：
```
Span 2: User Service (spanId: s2, parent: s1)
```

**3. User Service 查詢資料庫**
```
User Service → Database
```

User Service 創建子 Span：
```
Span 3: MySQL Query (spanId: s3, parent: s2)
```

**4. 調用 Order Service**
```
API Gateway → Order Service (HTTP)
```

同樣傳遞追蹤上下文：
```
Span 4: Order Service (spanId: s4, parent: s1)
  Span 5: Redis Cache (spanId: s5, parent: s4)
  Span 6: MySQL Query (spanId: s6, parent: s4)
```

**5. 調用 Payment Service**
```
Order Service → Payment Service (HTTP)
```

```
Span 7: Payment Service (spanId: s7, parent: s4)
  Span 8: Third-party API (spanId: s8, parent: s7)
```

**6. 回傳響應**
```
Payment Service → Order Service → API Gateway → User
```

每個服務完成處理後，將 Span 資料發送到追蹤後端（如 Jaeger、Zipkin）。

**最終的 Trace 結構**：

```
Trace ID: abc123

[Span 1] API Gateway (1000ms) ──┐
                                 │
    [Span 2] User Service (200ms)│
        └─[Span 3] MySQL (50ms)  │
                                 │
    [Span 4] Order Service (700ms)──┐
        ├─[Span 5] Redis (10ms)     │
        └─[Span 6] MySQL (100ms)    │
                                    │
        [Span 7] Payment Service (500ms)
            └─[Span 8] External API (450ms)
```

---

### 分散式追蹤解決的問題

#### 1. 效能瓶頸識別

**場景**：API 回應很慢，但不知道哪裡慢。

**傳統方式**：
- 查看各服務的平均延遲指標
- 猜測可能的瓶頸
- 逐個服務排查

**使用追蹤**：
從瀑布圖直接看出：
```
API Gateway         [████████████████████] 2000ms
  User Service      [██]                    200ms
  Order Service                [██████████] 1500ms  ← 瓶頸！
    DB Query                   [█████████]  1400ms  ← 根因！
```

結論：Order Service 的資料庫查詢慢，需要優化查詢或添加索引。

#### 2. 錯誤根因定位

**場景**：用戶報告訂單創建失敗。

**使用追蹤**：
1. 通過 TraceID（可以記錄在用戶錯誤訊息或日誌中）查詢完整 Trace
2. 查看 Trace 中哪個 Span 標記為錯誤（error=true）
3. 查看該 Span 的 Tags 和 Logs 獲取錯誤詳情

```
[Span 7] Payment Service (error: true)
Tags:
  error: true
  error.message: "Insufficient funds"
  http.status_code: 400
Logs:
  [10:00:05.123] Payment validation failed
  [10:00:05.125] Account balance: $50, Required: $100
```

快速定位：Payment Service 因為餘額不足而失敗。

#### 3. 服務依賴分析

通過聚合多個 Trace，可以生成**服務依賴圖（Service Dependency Graph）**：

```
        ┌──────────────┐
        │ API Gateway  │
        └──────┬───────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌─────▼──────┐
│User Service │  │Order Service│
└─────────────┘  └──────┬──────┘
                        │
                 ┌──────▼────────┐
                 │Payment Service│
                 └───────────────┘
```

還可以展示調用頻率、錯誤率、平均延遲：

```
API Gateway → User Service (1000 req/s, 0.1% error, 50ms avg)
API Gateway → Order Service (800 req/s, 0.5% error, 150ms avg)
Order Service → Payment Service (600 req/s, 2% error, 200ms avg)
```

#### 4. 關鍵路徑分析

找出影響整體延遲的**關鍵路徑（Critical Path）**：

```
Total latency: 1000ms

Critical path:
API Gateway (100ms) 
  → Order Service (200ms) 
      → Payment Service (400ms) 
          → External API (300ms)

Total: 100 + 200 + 400 + 300 = 1000ms
```

優化建議：優先優化 External API 或 Payment Service，因為它們在關鍵路徑上。

---

### 取樣策略（Sampling）

追蹤所有請求會帶來巨大的開銷和儲存成本，因此需要**取樣**。

#### 取樣類型

##### 1. Head-based Sampling（頭部取樣）

在請求開始時決定是否追蹤，常見策略：

**固定比例取樣**：
- 追蹤 1% 的請求
- 簡單但可能錯過重要請求（如錯誤請求）

**概率取樣**：
- 每個請求有固定概率被追蹤
- 與固定比例類似

**速率限制取樣**：
- 每秒最多追蹤 N 個請求
- 防止高流量服務產生過多 Trace

##### 2. Tail-based Sampling（尾部取樣）

在請求結束後決定是否保留，可以基於：

**錯誤取樣**：
- 保留所有錯誤的請求
- 保留部分成功的請求

**延遲取樣**：
- 保留超過閾值的慢請求
- 保留部分快速請求

**範例策略**：
```
- 100% 保留錯誤請求（status >= 500）
- 100% 保留慢請求（duration > 1s）
- 10% 保留正常請求
```

##### 3. Adaptive Sampling（自適應取樣）

根據系統狀態動態調整取樣率：
- 高流量時降低取樣率
- 錯誤率高時提高取樣率

#### 取樣的權衡

| 取樣率 | 優點 | 缺點 |
|--------|------|------|
| 100% | 完整資料，不會遺漏 | 開銷大，成本高 |
| 1% | 開銷小，成本低 | 可能錯過重要請求 |
| Tail-based | 保留重要請求 | 需要暫存所有 Span，延遲較高 |

**建議**：
- 開發環境：100% 取樣
- 生產環境：1%-10% 基礎取樣 + 100% 錯誤和慢請求

---

### 分散式追蹤的挑戰

#### 1. 效能開銷

**問題**：
- 每個請求需要生成和記錄多個 Span
- 網路傳輸追蹤資料
- 儲存大量追蹤資料

**解決方案**：
- 使用非同步發送（不阻塞業務邏輯）
- 使用高效的序列化格式（如 Protobuf）
- 實施合理的取樣策略
- 使用本地聚合，批次發送

#### 2. 時鐘同步

**問題**：
- 不同機器的時鐘可能不同步
- 影響 Span 的時間順序判斷

**解決方案**：
- 使用 NTP 同步時鐘
- 追蹤系統使用相對時間（duration）而非絕對時間
- 依賴父子關係而非時間戳排序

#### 3. 上下文傳播

**問題**：
- 需要修改所有服務以傳遞追蹤上下文
- 異步任務、訊息佇列的上下文傳遞複雜

**解決方案**：
- 使用統一的 SDK 或框架（如 OpenTelemetry）
- 在框架層面自動注入和提取上下文
- 在訊息佇列中傳遞元資料

#### 4. 資料量大

**問題**：
- 大規模系統每秒產生數萬個 Trace
- 儲存和查詢成本高

**解決方案**：
- 使用取樣減少資料量
- 使用高效的儲存後端（如 Cassandra、Elasticsearch）
- 設置資料保留期（如 7 天）
- 只儲存關鍵資訊，過濾不重要的 Tags

---

### 分散式追蹤系統對比

| 系統 | 開發者 | 語言 | 特點 |
|------|--------|------|------|
| **Jaeger** | Uber | Go | CNCF 畢業項目，功能完整，易於部署 |
| **Zipkin** | Twitter | Java | 最早的開源追蹤系統，生態成熟 |
| **OpenTelemetry** | CNCF | 多語言 | 統一標準，支援 Metrics、Logs、Traces |
| **AWS X-Ray** | AWS | - | 雲原生，與 AWS 服務深度整合 |
| **Google Cloud Trace** | Google | - | 雲原生，與 GCP 服務深度整合 |
| **Datadog APM** | Datadog | - | 商業產品，功能強大但收費 |

---

### 常見面試問題

#### Q1：分散式追蹤和日誌有什麼區別？

**回答要點**：
- **日誌**：記錄離散事件，難以關聯跨服務的請求
- **追蹤**：專門追蹤請求的完整生命週期，自動關聯所有 Span
- 兩者互補：追蹤提供整體視圖，日誌提供詳細上下文

#### Q2：如何設計追蹤系統的取樣策略？

**回答要點**：
- 基礎取樣率（如 1%-10%）控制成本
- 100% 追蹤錯誤和慢請求
- 考慮自適應取樣（根據流量和錯誤率動態調整）
- 開發環境 100% 取樣方便除錯

#### Q3：分散式追蹤對系統效能有多大影響？

**回答要點**：
- 正確實現時，開銷通常 < 1%
- 使用非同步發送避免阻塞業務邏輯
- 通過取樣進一步降低開銷
- 需要監控追蹤系統自身的效能

---

## 總結

分散式追蹤是微服務架構的必備工具，它解決了傳統監控無法解決的問題：

1. **可視化請求流**：清晰展示請求在系統中的路徑
2. **效能分析**：精確定位每個服務和操作的耗時
3. **根因定位**：快速找到錯誤發生的位置和原因
4. **依賴分析**：理解服務間的依賴關係和調用模式

在實踐中，成功的分散式追蹤需要：
- 使用統一的標準（如 OpenTelemetry）
- 實施合理的取樣策略平衡成本和可見性
- 在服務間正確傳播追蹤上下文
- 結合 Metrics 和 Logs 形成完整的可觀測性

掌握分散式追蹤的原理和實踐，是資深後端工程師必備的技能。
