# ELK Stack（Elasticsearch、Logstash、Kibana）概述

- **難度**: 5
- **重要程度**: 4
- **標籤**: `ELK`, `日誌`, `Elasticsearch`, `Logstash`, `Kibana`, `日誌聚合`

## 問題詳述

ELK Stack 是目前最流行的開源日誌管理解決方案，由 Elasticsearch、Logstash 和 Kibana 三個組件組成。理解 ELK Stack 的架構和使用方式，是構建現代日誌系統的基礎。

## 核心理論與詳解

### ELK Stack 簡介

**ELK Stack** 是三個開源專案的首字母縮寫：

- **E**lasticsearch：分散式搜尋和分析引擎
- **L**ogstash：資料處理管道，用於收集、解析和轉換日誌
- **K**ibana：視覺化和分析工具

現在通常稱為 **Elastic Stack**，因為加入了 Beats（輕量級資料收集器）。

#### 完整的 Elastic Stack

```
┌──────────────────────────────────────────────┐
│              Data Sources                     │
│  Applications, Servers, Containers, etc.     │
└────────────┬─────────────────────────────────┘
             │
             ├─► Filebeat (日誌檔案)
             ├─► Metricbeat (系統指標)
             ├─► Packetbeat (網路資料)
             └─► Other Beats...
                     │
                     ▼
          ┌──────────────────┐
          │    Logstash      │  (可選)
          │  資料處理管道      │
          └────────┬─────────┘
                   │
                   ▼
          ┌─────────────────────────┐
          │    Elasticsearch        │
          │  搜尋和分析引擎          │
          │  ┌─────┐ ┌─────┐       │
          │  │Node1│ │Node2│ ...   │
          │  └─────┘ └─────┘       │
          └────────┬────────────────┘
                   │
                   ▼
          ┌──────────────────┐
          │     Kibana       │
          │   視覺化界面      │
          └──────────────────┘
                   │
                   ▼
              ┌────────┐
              │ Users  │
              └────────┘
```

---

### Elasticsearch：搜尋和分析引擎

#### 核心概念

**Elasticsearch** 是基於 Apache Lucene 構建的分散式搜尋和分析引擎。

##### 1. 資料模型

**舊版本（< 7.0）**：
```
Index（索引）→ Type（類型）→ Document（文件）
類似：Database → Table → Row
```

**新版本（≥ 7.0）**：
```
Index（索引）→ Document（文件）
類似：Database → Row（每個 Index 只有一個 Type）
```

**Document（文件）**：

文件是 JSON 格式的資料：

```json
{
  "_index": "logs-2024.01.15",
  "_id": "abc123",
  "_source": {
    "timestamp": "2024-01-15T10:30:00Z",
    "level": "ERROR",
    "service": "api-gateway",
    "message": "Failed to connect to database",
    "error": {
      "type": "ConnectionTimeout",
      "stack_trace": "..."
    },
    "request": {
      "method": "POST",
      "path": "/api/orders",
      "user_id": "user123"
    }
  }
}
```

##### 2. 分片和副本（Shards and Replicas）

**Primary Shard（主分片）**：
- 將索引資料分割到多個分片
- 每個分片是一個完整的 Lucene 索引
- 預設 1 個主分片（ES 7.0+）

**Replica Shard（副本分片）**：
- 主分片的複製
- 提供高可用和讀取擴展
- 預設 1 個副本

**架構範例**：

```
Index: logs (3 Primary Shards, 1 Replica)

Node 1:
├─ Shard 0 (Primary)
└─ Shard 2 (Replica)

Node 2:
├─ Shard 1 (Primary)
└─ Shard 0 (Replica)

Node 3:
├─ Shard 2 (Primary)
└─ Shard 1 (Replica)
```

##### 3. 索引管理

**時間序列索引**（推薦用於日誌）：

```
logs-2024.01.13
logs-2024.01.14
logs-2024.01.15  ← 當前寫入
logs-2024.01.16
```

優勢：
- 易於刪除舊資料（直接刪除整個索引）
- 優化查詢效能（只查詢相關時間範圍的索引）
- 便於設置不同的保留策略

**Index Template（索引模板）**：

```json
{
  "index_patterns": ["logs-*"],
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "index.lifecycle.name": "logs-policy"
  },
  "mappings": {
    "properties": {
      "timestamp": { "type": "date" },
      "level": { "type": "keyword" },
      "service": { "type": "keyword" },
      "message": { "type": "text" },
      "user_id": { "type": "keyword" }
    }
  }
}
```

##### 4. 查詢 DSL

**Query DSL（領域特定語言）**範例：

```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "level": "ERROR" } },
        { "range": { "timestamp": { "gte": "now-1h" } } }
      ],
      "filter": [
        { "term": { "service": "api-gateway" } }
      ]
    }
  },
  "size": 100,
  "sort": [
    { "timestamp": { "order": "desc" } }
  ]
}
```

**聚合（Aggregations）**：

```json
{
  "aggs": {
    "errors_by_service": {
      "terms": {
        "field": "service",
        "size": 10
      },
      "aggs": {
        "error_count": {
          "value_count": {
            "field": "level"
          }
        }
      }
    }
  }
}
```

##### 5. ILM（Index Lifecycle Management）

管理索引生命週期：

```
Hot Phase（熱階段）: 
- 新寫入的資料
- 高效能 SSD 儲存
- 保留 3 天

Warm Phase（溫階段）:
- 較少查詢的資料
- 標準儲存
- 保留 7 天

Cold Phase（冷階段）:
- 很少查詢的資料
- 低成本儲存
- 保留 30 天

Delete Phase（刪除階段）:
- 超過 30 天自動刪除
```

---

### Logstash：資料處理管道

#### 核心概念

**Logstash** 是一個資料處理管道，接收、處理和轉發資料。

#### Pipeline 架構

```
Input → Filter → Output

┌─────────┐    ┌─────────┐    ┌──────────┐
│  Input  │ →  │ Filter  │ →  │  Output  │
└─────────┘    └─────────┘    └──────────┘
  |              |               |
  |              |               ├─ Elasticsearch
  |              ├─ Grok         ├─ Kafka
  ├─ File        ├─ Mutate       ├─ S3
  ├─ Beats       ├─ Date         └─ ...
  ├─ Kafka       ├─ JSON
  └─ HTTP        └─ ...
```

#### 配置範例

**基本配置**：

```ruby
# logstash.conf

input {
  beats {
    port => 5044
  }
}

filter {
  # 解析 JSON 日誌
  if [message] =~ /^\{/ {
    json {
      source => "message"
    }
  }
  
  # 解析時間戳
  date {
    match => ["timestamp", "ISO8601"]
    target => "@timestamp"
  }
  
  # 添加地理位置資訊
  if [client_ip] {
    geoip {
      source => "client_ip"
    }
  }
  
  # 移除不需要的欄位
  mutate {
    remove_field => ["message", "host"]
  }
}

output {
  elasticsearch {
    hosts => ["http://elasticsearch:9200"]
    index => "logs-%{+YYYY.MM.dd}"
  }
  
  # 同時輸出到 stdout 用於除錯
  stdout {
    codec => rubydebug
  }
}
```

#### 常用 Filter 外掛

##### 1. Grok（解析非結構化日誌）

解析 Nginx 存取日誌：

```ruby
filter {
  grok {
    match => {
      "message" => '%{IPORHOST:client_ip} - - \[%{HTTPDATE:timestamp}\] "%{WORD:method} %{URIPATHPARAM:path} HTTP/%{NUMBER:http_version}" %{NUMBER:status} %{NUMBER:bytes}'
    }
  }
}

# 輸入：
# 192.168.1.1 - - [15/Jan/2024:10:30:00 +0000] "GET /api/users HTTP/1.1" 200 1234

# 輸出：
{
  "client_ip": "192.168.1.1",
  "timestamp": "15/Jan/2024:10:30:00 +0000",
  "method": "GET",
  "path": "/api/users",
  "http_version": "1.1",
  "status": "200",
  "bytes": "1234"
}
```

##### 2. Mutate（欄位操作）

```ruby
filter {
  mutate {
    # 轉換類型
    convert => {
      "status" => "integer"
      "bytes" => "integer"
    }
    
    # 添加欄位
    add_field => {
      "environment" => "production"
    }
    
    # 重命名欄位
    rename => {
      "client_ip" => "source_ip"
    }
    
    # 移除欄位
    remove_field => ["temp_field"]
  }
}
```

##### 3. Date（時間解析）

```ruby
filter {
  date {
    match => ["timestamp", "dd/MMM/yyyy:HH:mm:ss Z"]
    target => "@timestamp"
  }
}
```

##### 4. GeoIP（地理位置）

```ruby
filter {
  geoip {
    source => "client_ip"
    target => "geoip"
  }
}

# 結果：
{
  "geoip": {
    "country_name": "United States",
    "city_name": "San Francisco",
    "location": {
      "lat": 37.7749,
      "lon": -122.4194
    }
  }
}
```

---

### Beats：輕量級資料收集器

#### Beats 家族

| Beat | 用途 | 範例 |
|------|------|------|
| **Filebeat** | 收集日誌檔案 | 應用日誌、Nginx 日誌 |
| **Metricbeat** | 收集系統和服務指標 | CPU、記憶體、Docker 指標 |
| **Packetbeat** | 收集網路流量資料 | HTTP、MySQL、Redis 流量 |
| **Auditbeat** | 收集審計資料 | 檔案變更、用戶活動 |
| **Heartbeat** | 健康檢查 | 服務可用性監控 |
| **Winlogbeat** | 收集 Windows 事件日誌 | Windows 系統日誌 |

#### Filebeat 配置範例

```yaml
# filebeat.yml

filebeat.inputs:
  # 收集應用日誌
  - type: log
    enabled: true
    paths:
      - /var/log/app/*.log
    fields:
      service: api-gateway
      environment: production
    multiline:
      pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
      negate: true
      match: after

  # 收集 Nginx 日誌
  - type: log
    enabled: true
    paths:
      - /var/log/nginx/access.log
    fields:
      log_type: nginx_access

# 輸出到 Logstash
output.logstash:
  hosts: ["logstash:5044"]
  
# 或直接輸出到 Elasticsearch
# output.elasticsearch:
#   hosts: ["http://elasticsearch:9200"]
#   index: "filebeat-%{+yyyy.MM.dd}"

# 設置
setup.kibana:
  host: "kibana:5601"

# 日誌等級
logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/filebeat
  name: filebeat
  keepfiles: 7
```

#### Filebeat Modules

預配置的收集器：

```bash
# 啟用 Nginx module
filebeat modules enable nginx

# 啟用 MySQL module
filebeat modules enable mysql

# 查看可用 modules
filebeat modules list
```

---

### Kibana：視覺化和分析

#### 核心功能

##### 1. Discover（探索）

搜尋和瀏覽日誌：

```
功能：
- 全文搜尋
- 欄位過濾
- 時間範圍選擇
- 儲存查詢
- 分享搜尋結果

範例查詢：
level:ERROR AND service:api-gateway
```

##### 2. Visualize（視覺化）

創建圖表：

**圖表類型**：
- **Line Chart**：時間序列趨勢
- **Bar Chart**：對比不同類別
- **Pie Chart**：比例分布
- **Data Table**：表格視圖
- **Metric**：單一數值
- **Heatmap**：熱力圖
- **Tag Cloud**：標籤雲

**範例：錯誤日誌趨勢圖**
```
X 軸：@timestamp (時間)
Y 軸：Count (數量)
過濾：level:ERROR
分組：service (按服務分組)
```

##### 3. Dashboard（儀表板）

組合多個視覺化：

```
┌─────────────────────────────────────────┐
│        Application Logs Dashboard       │
├─────────────────┬───────────────────────┤
│ Log Volume      │ Error Rate            │
│ (Line Chart)    │ (Metric)              │
├─────────────────┼───────────────────────┤
│ Top Services    │ Error Breakdown       │
│ (Pie Chart)     │ (Bar Chart)           │
├─────────────────────────────────────────┤
│ Recent Errors (Data Table)              │
└─────────────────────────────────────────┘
```

##### 4. Canvas（畫布）

創建自定義的動態報告：

```
用途：
- 執行報告
- 即時監控牆
- 客戶展示
```

##### 5. Machine Learning（機器學習）

異常檢測：

```
功能：
- 自動檢測異常日誌模式
- 預測未來趨勢
- 識別不尋常的行為

範例：
- 檢測突然增加的錯誤率
- 識別異常的流量模式
- 預測磁碟空間何時耗盡
```

##### 6. Alerting（告警）

基於查詢的告警：

```yaml
# 範例告警規則
Name: High Error Rate
Trigger:
  - Type: Query
  - Index: logs-*
  - Query: level:ERROR
  - Threshold: > 100 (over 5 minutes)
Actions:
  - Send Email
  - Send Slack notification
  - Create PagerDuty incident
```

---

### 完整的日誌流程範例

#### 場景：微服務應用日誌收集

```
┌────────────────────────────────────────┐
│        Microservices                   │
│  ┌──────┐  ┌──────┐  ┌──────┐        │
│  │API   │  │Order │  │User  │        │
│  │Gateway│  │Service│ │Service│       │
│  └───┬──┘  └───┬──┘  └───┬──┘        │
│      │         │         │            │
│   /var/log/api/*.log                  │
└──────┼─────────┼─────────┼────────────┘
       │         │         │
       ▼         ▼         ▼
   ┌────────────────────────┐
   │      Filebeat          │
   │  (每個服務一個實例)     │
   └──────────┬─────────────┘
              │
              ▼
   ┌──────────────────────┐
   │     Logstash         │
   │  - Parse logs        │
   │  - Add metadata      │
   │  - Enrich data       │
   └──────────┬───────────┘
              │
              ▼
   ┌─────────────────────────────┐
   │     Elasticsearch           │
   │  Index: logs-YYYY.MM.DD     │
   │  ┌──────┐  ┌──────┐        │
   │  │Node 1│  │Node 2│  ...   │
   │  └──────┘  └──────┘        │
   └──────────┬──────────────────┘
              │
              ▼
   ┌──────────────────────┐
   │      Kibana          │
   │  - Search logs       │
   │  - Create dashboards │
   │  - Set up alerts     │
   └──────────────────────┘
```

#### 配置步驟

**1. Filebeat 配置**：

```yaml
filebeat.inputs:
  - type: log
    paths:
      - /var/log/app/*.log
    json.keys_under_root: true
    json.add_error_key: true
    fields:
      service: ${SERVICE_NAME}
      environment: ${ENVIRONMENT}

output.logstash:
  hosts: ["logstash:5044"]
```

**2. Logstash 配置**：

```ruby
input {
  beats {
    port => 5044
  }
}

filter {
  # 解析 JSON
  if [message] =~ /^\{/ {
    json {
      source => "message"
    }
  }
  
  # 添加標籤
  if [level] == "ERROR" or [level] == "FATAL" {
    mutate {
      add_tag => ["error"]
    }
  }
  
  # 解析時間
  date {
    match => ["timestamp", "ISO8601"]
    target => "@timestamp"
  }
}

output {
  elasticsearch {
    hosts => ["http://es01:9200", "http://es02:9200"]
    index => "logs-%{[fields][service]}-%{+YYYY.MM.dd}"
  }
}
```

**3. Elasticsearch 索引模板**：

```json
{
  "index_patterns": ["logs-*"],
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "index.lifecycle.name": "logs-policy",
    "index.lifecycle.rollover_alias": "logs"
  },
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "level": { "type": "keyword" },
      "service": { "type": "keyword" },
      "message": { 
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword", "ignore_above": 256 }
        }
      },
      "trace_id": { "type": "keyword" },
      "user_id": { "type": "keyword" }
    }
  }
}
```

**4. Kibana 儀表板**：

```
創建視覺化：
1. 日誌量趨勢（Line Chart）
   - X 軸：@timestamp
   - Y 軸：Count
   
2. 錯誤率（Metric）
   - Aggregation: Count
   - Filter: level:ERROR
   
3. 服務分布（Pie Chart）
   - Split Slices: service
   
4. Top 錯誤訊息（Data Table）
   - Columns: @timestamp, service, level, message
   - Sort: @timestamp DESC
```

---

### ELK vs 其他日誌方案

| 方案 | 優勢 | 劣勢 | 適用場景 |
|------|------|------|---------|
| **ELK** | 功能強大、生態完善 | 資源消耗大、配置複雜 | 大規模生產環境 |
| **Loki** | 輕量級、低成本 | 功能相對簡單 | 中小型應用 |
| **Splunk** | 企業級功能 | 昂貴 | 大型企業 |
| **CloudWatch** | 與 AWS 整合好 | 查詢功能較弱 | AWS 環境 |

---

### 最佳實踐

#### 1. 索引設計

```
✅ 好的設計：
- 按時間分割索引（logs-2024.01.15）
- 使用 Index Template
- 設置 ILM 自動管理

❌ 壞的設計：
- 單一大索引（logs）
- 無限增長
- 手動刪除舊資料
```

#### 2. 效能優化

```
- 使用適當的分片數（通常 20-40GB/分片）
- 批次寫入而非單條寫入
- 使用 keyword 類型而非 text（對不需要全文搜尋的欄位）
- 定期清理舊索引
- 使用 Filter Context 而非 Query Context（當不需要評分時）
```

#### 3. 安全性

```
- 啟用 TLS/SSL
- 配置身份驗證（X-Pack Security）
- 使用 RBAC 控制訪問權限
- 定期備份資料
- 監控叢集健康狀態
```

#### 4. 結構化日誌

```json
// 好的結構化日誌
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "ERROR",
  "service": "api-gateway",
  "trace_id": "abc123",
  "user_id": "user456",
  "error": {
    "type": "DatabaseConnectionError",
    "message": "Connection timeout",
    "stack_trace": "..."
  },
  "context": {
    "endpoint": "/api/orders",
    "method": "POST",
    "duration_ms": 5000
  }
}

// 不好的非結構化日誌
"2024-01-15 10:30:00 ERROR Failed to connect to database: connection timeout"
```

---

### 常見面試問題

#### Q1：ELK Stack 中各個組件的作用是什麼？

**回答要點**：
- **Elasticsearch**：分散式搜尋和分析引擎，儲存和查詢日誌
- **Logstash**：資料處理管道，收集、解析和轉換日誌
- **Kibana**：視覺化工具，提供搜尋、分析和儀表板功能
- **Beats**：輕量級資料收集器，部署在資料源端

#### Q2：如何優化 Elasticsearch 的效能？

**回答要點**：
- 合理設計分片數量（避免過多或過少）
- 使用時間序列索引（便於刪除舊資料）
- 批次寫入而非單條寫入
- 使用適當的欄位類型（keyword vs text）
- 定期清理舊索引（使用 ILM）
- 使用 Filter Context 提高查詢效能

#### Q3：Logstash 和 Beats 有什麼區別？什麼時候用哪個？

**回答要點**：
- **Beats**：輕量級，資源消耗少，適合部署在所有資料源
- **Logstash**：功能強大，但資源消耗較大，適合集中式資料處理
- 推薦架構：Beats → Logstash → Elasticsearch
- 簡單場景可以：Beats → Elasticsearch（跳過 Logstash）

#### Q4：如何保證 ELK Stack 的高可用性？

**回答要點**：
- **Elasticsearch**：多節點叢集，設置適當的副本數
- **Logstash**：多實例部署，前面加負載均衡器
- **Kibana**：多實例部署，前面加負載均衡器
- **資料備份**：定期快照備份
- **監控**：使用 Elastic Stack Monitoring 或 Prometheus

---

## 總結

ELK Stack 是現代日誌管理的完整解決方案：

1. **Elasticsearch**：強大的搜尋和分析能力
2. **Logstash**：靈活的資料處理管道
3. **Kibana**：直觀的視覺化界面
4. **Beats**：輕量級的資料收集

在實踐中，ELK Stack 需要：
- 合理的架構設計（索引、分片、副本）
- 持續的效能優化（查詢、儲存、成本）
- 完善的運維（監控、備份、擴展）

掌握 ELK Stack 是構建現代可觀測性系統的重要技能，也是資深後端面試的常見考點。
