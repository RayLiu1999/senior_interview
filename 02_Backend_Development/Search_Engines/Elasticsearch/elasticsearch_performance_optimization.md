# Elasticsearch 效能優化與最佳實踐

- **難度**: 8
- **重要性**: 5
- **標籤**: `Elasticsearch`, `Performance`, `Optimization`, `Best Practices`

## 問題詳述

請說明 Elasticsearch 在生產環境中的效能優化策略和最佳實踐。

## 核心理論與詳解

Elasticsearch 效能優化涵蓋多個層面：硬體配置、索引設計、查詢優化、叢集調優等。

### 硬體資源規劃

#### 記憶體配置

**JVM Heap 設定原則**：

| 規則 | 說明 |
|------|------|
| 不超過 32GB | 超過會失去 Compressed OOPs 優化 |
| 不超過總記憶體 50% | 剩餘給 OS 和 Lucene 使用 |
| 建議 26-31GB | 最佳區間 |

```bash
# elasticsearch.yml 或環境變數
-Xms16g
-Xmx16g
```

**記憶體分配**：

- **JVM Heap**：用於節點運作、Field Data、Query Cache
- **系統記憶體**：用於 Lucene 的 File System Cache（非常重要）

#### 磁碟選擇

| 類型 | 適用場景 | 說明 |
|------|----------|------|
| SSD | 生產環境（必須） | IOPS 遠優於 HDD |
| NVMe SSD | 高性能需求 | 最佳選擇 |
| HDD | 冷資料儲存 | 成本優先 |

#### CPU 配置

- 搜尋密集型：高頻率 CPU
- 索引密集型：多核心 CPU

### 索引設計優化

#### 1. Mapping 優化

```json
PUT /optimized_index
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "refresh_interval": "30s",
    "index.translog.durability": "async",
    "index.translog.sync_interval": "30s"
  },
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "id": {
        "type": "keyword",
        "doc_values": true
      },
      "title": {
        "type": "text",
        "analyzer": "ik_max_word",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
      },
      "content": {
        "type": "text",
        "analyzer": "ik_smart",
        "norms": false
      },
      "status": {
        "type": "keyword"
      },
      "view_count": {
        "type": "integer",
        "doc_values": true
      },
      "created_at": {
        "type": "date",
        "format": "epoch_millis"
      },
      "metadata": {
        "type": "object",
        "enabled": false
      }
    }
  }
}
```

**關鍵設定說明**：

| 設定 | 作用 | 使用場景 |
|------|------|----------|
| `doc_values: false` | 禁用列式儲存 | 不需要排序/聚合的欄位 |
| `norms: false` | 禁用長度歸一化 | 不需要評分的欄位 |
| `enabled: false` | 不索引 | 只儲存不搜尋的欄位 |
| `index: false` | 不建立倒排索引 | 不需要搜尋的欄位 |
| `ignore_above` | 截斷過長字符串 | keyword 欄位 |

#### 2. 分片策略

**分片大小建議**：10GB - 50GB

**計算公式**：
```
主分片數 = ceil(預計資料量 / 單分片目標大小)
確保 主分片數 >= 節點數（以便平均分佈）
```

### 索引效能優化

#### Bulk API 批量寫入

```json
POST /_bulk
{ "index": { "_index": "logs" } }
{ "message": "log 1", "timestamp": "2024-01-01T00:00:00" }
{ "index": { "_index": "logs" } }
{ "message": "log 2", "timestamp": "2024-01-01T00:00:01" }
```

**批量大小建議**：
- 每批 5-15MB
- 或 1000-5000 個文件
- 需要根據實際環境測試

#### Refresh Interval 調整

```json
PUT /logs/_settings
{
  "index": {
    "refresh_interval": "30s"
  }
}
```

**說明**：
- 預設 1 秒
- 大量寫入時可調大或設為 `-1`（禁用自動 refresh）
- 寫入完成後手動 refresh

#### 副本策略

大量寫入時暫時關閉副本：

```json
PUT /logs/_settings
{
  "index": {
    "number_of_replicas": 0
  }
}
```

寫入完成後恢復：

```json
PUT /logs/_settings
{
  "index": {
    "number_of_replicas": 1
  }
}
```

### 查詢效能優化

#### 1. 使用 Filter Context

```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "title": "elasticsearch" } }
      ],
      "filter": [
        { "term": { "status": "published" } },
        { "range": { "date": { "gte": "2024-01-01" } } }
      ]
    }
  }
}
```

Filter 結果會被快取，效能優於 Query。

#### 2. 避免深分頁

**問題**：`from: 10000, size: 10` 需要每個分片返回 10010 個文件。

**解決方案**：

**Search After（推薦）**：

```json
{
  "size": 100,
  "sort": [
    { "date": "desc" },
    { "_id": "asc" }
  ],
  "search_after": ["2024-01-01", "doc_id_123"]
}
```

**Scroll API（大量匯出）**：

```json
POST /logs/_search?scroll=1m
{
  "size": 1000,
  "query": { "match_all": {} }
}
```

#### 3. 限制返回欄位

```json
{
  "query": { "match_all": {} },
  "_source": ["title", "date", "summary"],
  "size": 10
}
```

或使用 `stored_fields`。

#### 4. 避免萬用字元前綴

```json
// ❌ 錯誤：效能極差
{ "wildcard": { "title": "*elasticsearch" } }

// ✅ 正確：使用 ngram 或改變查詢邏輯
{ "wildcard": { "title": "elasticsearch*" } }
```

### 快取機制

#### Query Cache

快取 Filter 結果。

```yaml
# elasticsearch.yml
indices.queries.cache.size: 10%
```

#### Request Cache

快取聚合結果。

```json
POST /logs/_search?request_cache=true
{
  "size": 0,
  "aggs": {
    "daily_count": {
      "date_histogram": {
        "field": "timestamp",
        "calendar_interval": "day"
      }
    }
  }
}
```

#### Field Data Cache

用於 text 欄位的聚合/排序（應避免）。

### 叢集層面優化

#### 節點角色分離

```yaml
# 主節點
node.roles: [ master ]

# 資料節點
node.roles: [ data ]

# 協調節點
node.roles: [ ]

# 攝取節點
node.roles: [ ingest ]
```

#### 熱溫冷架構

```yaml
# 熱節點（SSD，高效能）
node.attr.box_type: hot

# 溫節點（一般 SSD）
node.attr.box_type: warm

# 冷節點（HDD）
node.attr.box_type: cold
```

配合 ILM 自動遷移資料：

```json
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": { "max_size": "50GB" }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "allocate": {
            "require": { "box_type": "warm" }
          }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "allocate": {
            "require": { "box_type": "cold" }
          }
        }
      }
    }
  }
}
```

### 監控指標

| 指標 | 健康值 | 說明 |
|------|--------|------|
| Heap 使用率 | < 75% | 過高可能 OOM |
| CPU 使用率 | < 80% | 持續高負載需擴容 |
| 搜尋延遲 | < 100ms | P99 延遲 |
| 索引延遲 | < 50ms | 單文件索引 |
| 拒絕率 | 0 | Thread Pool 拒絕 |

### 面試重點

1. **JVM Heap 為何不超過 32GB**
2. **Filter 與 Query 的效能差異**
3. **深分頁問題及解決方案**
4. **Bulk API 最佳實踐**
5. **熱溫冷架構設計**
6. **Refresh Interval 對寫入效能的影響**
