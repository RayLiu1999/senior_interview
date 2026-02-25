# MongoDB Change Streams：即時資料變更監聽

- **難度**: 6
- **重要程度**: 3
- **標籤**: `MongoDB`, `Change Streams`, `CDC`, `事件驅動`, `即時同步`

## 問題詳述

Change Streams（MongoDB 3.6+ 引入）允許應用程式**即時訂閱集合、資料庫或整個部署的資料變更事件**，無需輪詢。它是 MongoDB 原生的 **CDC（Change Data Capture）** 機制，構建在 Replica Set 的 Oplog（操作日誌）之上。

## 核心理論與詳解

### Change Streams 的底層原理

```
  業務應用寫入          Replica Set
  MongoDB       ────→  ┌──────────┐
                        │  Oplog   │  ← 所有寫操作的有序日誌（固定大小的 Capped Collection）
                        └─────┬────┘
                              │ Change Streams 的底層
                              ↓ 由 Aggregation Pipeline 過濾
                        ┌──────────┐
                        │ Change   │  ← 變更事件串流
                        │ Events   │
                        └─────┬────┘
                              │
                      ←── 訂閱應用         （Socket 長連接 / Server-Side Cursor）
```

**與 Kafka CDC（Debezium）的對比**：
- Debezium 解析 MySQL binlog 或 PostgreSQL WAL，是**外部 CDC 工具**
- MongoDB Change Streams 是**內建功能**，由驅動原生支援，無需額外工具
- Change Streams 透過 Resumption Token 支援**斷線重連**，不丟失事件

---

### Change Streams 的使用

```go
// Go 示例：監聽 orders 集合的所有插入操作
import (
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
)

func watchOrders(ctx context.Context, collection *mongo.Collection) {
    // 使用 Aggregation Pipeline 過濾只接收 insert 和 update 事件
    pipeline := mongo.Pipeline{
        bson.D{{Key: "$match", Value: bson.D{
            {Key: "operationType", Value: bson.D{
                {Key: "$in", Value: bson.A{"insert", "update"}},
            }},
        }}},
    }

    opts := options.ChangeStream().
        SetFullDocument(options.UpdateLookup) // 對 update 事件，返回完整文件（而非僅 diff）

    cs, err := collection.Watch(ctx, pipeline, opts)
    if err != nil {
        log.Fatal(err)
    }
    defer cs.Close(ctx)

    for cs.Next(ctx) {
        var event bson.M
        if err := cs.Decode(&event); err != nil {
            log.Printf("decode error: %v", err)
            continue
        }
        log.Printf("operationType: %v, documentKey: %v", event["operationType"], event["documentKey"])
        
        // 保存 resumeToken，用於斷線重連
        resumeToken := cs.ResumeToken()
        _ = resumeToken // 持久化到某處
    }
}
```

---

### 重要概念：Resume Token

Change Streams 的**斷點續傳**機制：

- 每個事件都有一個唯一的 `_id`（Resume Token），代表 Oplog 中的位置
- 應用程式收到事件後，應**持久化 Resume Token**
- 重啟後，使用 `StartAfter(resumeToken)` 或 `ResumeAfter(resumeToken)` 從上次位置繼續

```go
// 從上次斷點恢復
opts := options.ChangeStream().
    SetResumeAfter(lastSavedToken) // lastSavedToken 從持久化存儲讀取

cs, err = collection.Watch(ctx, pipeline, opts)
```

> **注意**：Resume Token 基於 Oplog 位置，Oplog 是固定大小的 Capped Collection。若應用長時間宕機導致 Oplog 回繞（被覆蓋），Resume Token 失效，需要從頭全量同步。設置足夠大的 Oplog（`oplogSizeMB`）是重要的生產配置。

---

### 典型應用場景

| 場景 | 說明 |
|------|------|
| **Cache 失效** | 監聽文件變更，即時使 Redis 中對應的緩存失效，取代定時輪詢 |
| **搜索引擎同步** | 監聽 MongoDB 變更，即時更新 Elasticsearch 索引 |
| **跨服務事件通知** | 微服務 A 寫入 MongoDB，Change Streams 觸發事件通知微服務 B（替代 Outbox Pattern 的部分場景） |
| **審計日誌** | 記錄關鍵集合的所有 CRUD 操作，用於合規審計 |
| **即時儀表板** | 業務資料變更，即時推送更新到前端 Dashboard |

---

### 限制與注意事項

1. **需要 Replica Set**：Change Streams 基於 Oplog，無法在單機（Standalone）使用
2. **DDL 操作不觸發**：集合的 `drop`、`rename`、`dropDatabase` 會收到特殊的 `invalidate` 事件，之後 Change Stream 自動關閉
3. **At-least-once 語義**：若應用崩潰在處理成功但未保存 Resume Token 之後，重啟時可能重複收到同一事件，應確保下游是**冪等（Idempotent）**的
4. **延遲**：Change Streams 的延遲通常在**毫秒到秒級**，受 Oplog 刷新頻率和網路影響
