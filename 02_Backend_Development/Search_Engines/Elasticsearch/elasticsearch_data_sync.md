# Elasticsearch 與關聯式資料庫的資料同步

- **難度**: 7
- **重要性**: 4
- **標籤**: `Elasticsearch`, `Data Sync`, `Database`, `CDC`

## 問題詳述

在實際專案中，如何將 MySQL 等關聯式資料庫的資料同步到 Elasticsearch？有哪些常見方案和各自的優缺點？

## 核心理論與詳解

資料同步是 Elasticsearch 實際應用中最常見的挑戰之一。主要需要解決：資料一致性、同步延遲、故障恢復等問題。

### 同步方案概覽

| 方案 | 即時性 | 一致性 | 實現複雜度 | 適用場景 |
|------|--------|--------|------------|----------|
| 雙寫 | 高 | 低 | 低 | 簡單場景，可接受不一致 |
| 同步雙寫 | 高 | 中 | 中 | 強一致性需求 |
| 異步訊息佇列 | 中 | 中 | 中 | 大多數生產場景 |
| CDC (Binlog) | 高 | 高 | 高 | 大規模、高可靠性需求 |
| 定時全量/增量 | 低 | 高 | 低 | 非即時搜尋場景 |

### 方案一：應用層雙寫

最簡單的方式：在應用程式中同時寫入資料庫和 Elasticsearch。

```go
func CreateProduct(product *Product) error {
    // 1. 寫入 MySQL
    if err := db.Create(product).Error; err != nil {
        return err
    }
    
    // 2. 寫入 Elasticsearch
    if err := esClient.Index(
        "products",
        product.ID,
        product,
    ); err != nil {
        // ES 寫入失敗如何處理？
        log.Error("ES write failed:", err)
        // 可能需要補償機制
    }
    
    return nil
}
```

**優點**：
- 實現簡單
- 無額外組件依賴

**缺點**：
- 資料一致性無法保證（ES 寫入失敗怎麼辦？）
- 程式碼耦合度高
- 效能影響（同步寫入兩個系統）

**改進：使用本地事務表**

```go
func CreateProductWithOutbox(product *Product) error {
    return db.Transaction(func(tx *gorm.DB) error {
        // 1. 寫入主表
        if err := tx.Create(product).Error; err != nil {
            return err
        }
        
        // 2. 寫入 Outbox 表
        event := &OutboxEvent{
            AggregateType: "product",
            AggregateID:   product.ID,
            EventType:     "created",
            Payload:       toJSON(product),
        }
        return tx.Create(event).Error
    })
}

// 另一個 Worker 處理 Outbox 表
func ProcessOutbox() {
    for {
        events := fetchPendingEvents()
        for _, event := range events {
            if err := syncToES(event); err == nil {
                markAsProcessed(event.ID)
            }
        }
        time.Sleep(100 * time.Millisecond)
    }
}
```

### 方案二：異步訊息佇列

透過 Message Queue（如 Kafka）解耦資料庫和 Elasticsearch 的寫入。

**架構**：

```
應用程式 → MySQL + Kafka Producer → Kafka → Consumer → Elasticsearch
```

**實現流程**：

```go
func CreateProduct(product *Product) error {
    // 1. 寫入 MySQL（事務）
    err := db.Transaction(func(tx *gorm.DB) error {
        if err := tx.Create(product).Error; err != nil {
            return err
        }
        
        // 2. 發送 Kafka 訊息
        msg := &ProductEvent{
            Type:      "created",
            ProductID: product.ID,
            Data:      product,
            Timestamp: time.Now(),
        }
        return kafkaProducer.Send("product-events", msg)
    })
    
    return err
}

// Kafka Consumer
func ConsumeProductEvents() {
    consumer.Subscribe("product-events", func(msg *Message) {
        var event ProductEvent
        json.Unmarshal(msg.Value, &event)
        
        switch event.Type {
        case "created", "updated":
            esClient.Index("products", event.ProductID, event.Data)
        case "deleted":
            esClient.Delete("products", event.ProductID)
        }
    })
}
```

**優點**：
- 解耦應用程式和 ES
- 支援重試和補償
- 可擴展性好

**缺點**：
- 引入額外的中間件依賴
- 有一定延遲
- 需要處理訊息順序和冪等

### 方案三：CDC（Change Data Capture）

直接監聽資料庫的 Binlog，捕獲資料變更。

**主流工具**：

| 工具 | 支援資料庫 | 說明 |
|------|------------|------|
| Debezium | MySQL, PostgreSQL, MongoDB 等 | 基於 Kafka Connect |
| Canal | MySQL | 阿里開源 |
| Maxwell | MySQL | 輕量級 |
| Flink CDC | 多種 | 支援即時處理 |

#### Debezium + Kafka 架構

```
MySQL (Binlog) → Debezium → Kafka → Kafka Connect (ES Sink) → Elasticsearch
```

**Debezium Connector 配置**：

```json
{
  "name": "mysql-connector",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql",
    "database.port": "3306",
    "database.user": "debezium",
    "database.password": "password",
    "database.server.id": "1",
    "database.server.name": "mydb",
    "database.include.list": "ecommerce",
    "table.include.list": "ecommerce.products",
    "include.schema.changes": "false"
  }
}
```

**ES Sink Connector 配置**：

```json
{
  "name": "elasticsearch-sink",
  "config": {
    "connector.class": "io.confluent.connect.elasticsearch.ElasticsearchSinkConnector",
    "topics": "mydb.ecommerce.products",
    "connection.url": "http://elasticsearch:9200",
    "type.name": "_doc",
    "key.ignore": "false",
    "behavior.on.null.values": "delete",
    "transforms": "unwrap",
    "transforms.unwrap.type": "io.debezium.transforms.ExtractNewRecordState"
  }
}
```

**優點**：
- 資料一致性最高
- 對應用程式透明，無需改動程式碼
- 可捕獲所有變更（包括直接操作 DB 的變更）

**缺點**：
- 架構複雜度高
- 需要維護額外的組件
- Binlog 格式變更需注意

### 方案四：定時同步

適用於即時性要求不高的場景。

```go
// 定時全量同步
func FullSync() {
    products := fetchAllProducts()
    
    // 使用 Bulk API 批量索引
    bulkRequest := esClient.Bulk()
    for _, product := range products {
        req := elastic.NewBulkIndexRequest().
            Index("products").
            Id(product.ID).
            Doc(product)
        bulkRequest.Add(req)
    }
    
    bulkRequest.Do(ctx)
}

// 定時增量同步
func IncrementalSync(lastSyncTime time.Time) {
    products := fetchProductsModifiedAfter(lastSyncTime)
    
    for _, product := range products {
        esClient.Index("products", product.ID, product)
    }
}
```

### 資料一致性保證

#### 最終一致性

大多數場景接受最終一致性，通過以下機制保證：

1. **重試機制**：訊息消費失敗時重試
2. **死信佇列**：多次失敗的訊息進入 DLQ 人工處理
3. **定期校驗**：對比 DB 和 ES 的資料，修復差異

#### 冪等處理

確保同一訊息重複處理不會造成問題：

```go
func SyncToES(event *ProductEvent) error {
    // 使用 version 或 seq_no 確保冪等
    _, err := esClient.Index().
        Index("products").
        Id(event.ProductID).
        VersionType("external").
        Version(event.Version).
        BodyJson(event.Data).
        Do(ctx)
    
    return err
}
```

### 方案選型建議

| 場景 | 推薦方案 |
|------|----------|
| 小型專案，簡單場景 | 應用層雙寫 + Outbox |
| 中型專案，可接受秒級延遲 | 訊息佇列（Kafka） |
| 大型專案，高可靠性需求 | CDC（Debezium） |
| 報表/分析場景，非即時 | 定時批量同步 |

### 面試重點

1. **雙寫的一致性問題**如何解決
2. **CDC 的工作原理**（Binlog 解析）
3. **如何保證冪等性**
4. **訊息順序性的處理**
5. **Outbox Pattern** 的實現
