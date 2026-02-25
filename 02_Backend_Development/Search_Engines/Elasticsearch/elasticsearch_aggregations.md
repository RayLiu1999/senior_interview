# Elasticsearch 聚合查詢詳解

- **難度**: 7
- **重要性**: 5
- **標籤**: `Elasticsearch`, `Aggregations`, `Analytics`, `Data Analysis`

## 問題詳述

請詳細解釋 Elasticsearch 的聚合 (Aggregations) 功能，包括不同類型的聚合以及如何用於數據分析。

## 核心理論與詳解

聚合 (Aggregations) 是 Elasticsearch 強大的數據分析功能，允許對搜尋結果進行統計、分組和計算。它相當於 SQL 中的 `GROUP BY` 和聚合函數。

### 聚合類型概覽

Elasticsearch 提供三大類聚合：

| 類型 | 說明 | 範例 |
|------|------|------|
| **Metric Aggregations** | 計算數值指標 | sum, avg, max, min, cardinality |
| **Bucket Aggregations** | 分組/分桶 | terms, range, date_histogram |
| **Pipeline Aggregations** | 基於其他聚合的結果 | derivative, moving_avg |

### Metric Aggregations（指標聚合）

用於計算數值統計指標。

#### 基本指標聚合

```json
POST /orders/_search
{
  "size": 0,
  "aggs": {
    "total_revenue": {
      "sum": { "field": "amount" }
    },
    "avg_order_value": {
      "avg": { "field": "amount" }
    },
    "max_order": {
      "max": { "field": "amount" }
    },
    "min_order": {
      "min": { "field": "amount" }
    },
    "order_count": {
      "value_count": { "field": "order_id" }
    }
  }
}
```

#### Stats 聚合（一次獲取多個統計值）

```json
POST /orders/_search
{
  "size": 0,
  "aggs": {
    "amount_stats": {
      "stats": { "field": "amount" }
    }
  }
}
```

返回：count, min, max, avg, sum

#### Cardinality 聚合（去重計數）

```json
POST /logs/_search
{
  "size": 0,
  "aggs": {
    "unique_users": {
      "cardinality": { 
        "field": "user_id",
        "precision_threshold": 10000
      }
    }
  }
}
```

> **注意**：Cardinality 使用 HyperLogLog++ 演算法，是近似值而非精確值。`precision_threshold` 控制精確度與記憶體的平衡。

### Bucket Aggregations（桶聚合）

將文件分組到不同的「桶」中。

#### Terms 聚合（按欄位值分組）

```json
POST /orders/_search
{
  "size": 0,
  "aggs": {
    "orders_by_status": {
      "terms": {
        "field": "status.keyword",
        "size": 10,
        "order": { "_count": "desc" }
      }
    }
  }
}
```

#### Range 聚合（數值範圍分組）

```json
POST /products/_search
{
  "size": 0,
  "aggs": {
    "price_ranges": {
      "range": {
        "field": "price",
        "ranges": [
          { "to": 100 },
          { "from": 100, "to": 500 },
          { "from": 500 }
        ]
      }
    }
  }
}
```

#### Date Histogram 聚合（時間分組）

```json
POST /logs/_search
{
  "size": 0,
  "aggs": {
    "logs_per_day": {
      "date_histogram": {
        "field": "timestamp",
        "calendar_interval": "day",
        "format": "yyyy-MM-dd",
        "min_doc_count": 0,
        "extended_bounds": {
          "min": "2024-01-01",
          "max": "2024-01-31"
        }
      }
    }
  }
}
```

**常用間隔**：

| calendar_interval | fixed_interval | 說明 |
|-------------------|----------------|------|
| minute | 1m | 分鐘 |
| hour | 1h | 小時 |
| day | 1d | 天 |
| week | 7d | 週 |
| month | - | 月（只有 calendar） |
| year | - | 年（只有 calendar） |

### 巢狀聚合

聚合可以巢狀組合，形成多層分析。

#### 範例：各分類的銷售統計

```json
POST /orders/_search
{
  "size": 0,
  "aggs": {
    "by_category": {
      "terms": {
        "field": "category.keyword",
        "size": 10
      },
      "aggs": {
        "total_sales": {
          "sum": { "field": "amount" }
        },
        "avg_price": {
          "avg": { "field": "price" }
        },
        "sales_over_time": {
          "date_histogram": {
            "field": "order_date",
            "calendar_interval": "month"
          },
          "aggs": {
            "monthly_revenue": {
              "sum": { "field": "amount" }
            }
          }
        }
      }
    }
  }
}
```

### Pipeline Aggregations（管道聚合）

基於其他聚合的結果進行二次計算。

#### Bucket Sort（對桶排序）

```json
POST /orders/_search
{
  "size": 0,
  "aggs": {
    "by_category": {
      "terms": {
        "field": "category.keyword",
        "size": 100
      },
      "aggs": {
        "total_revenue": {
          "sum": { "field": "amount" }
        },
        "revenue_bucket_sort": {
          "bucket_sort": {
            "sort": [
              { "total_revenue": { "order": "desc" } }
            ],
            "size": 5
          }
        }
      }
    }
  }
}
```

#### Derivative（導數/變化率）

```json
POST /orders/_search
{
  "size": 0,
  "aggs": {
    "sales_per_month": {
      "date_histogram": {
        "field": "order_date",
        "calendar_interval": "month"
      },
      "aggs": {
        "monthly_sales": {
          "sum": { "field": "amount" }
        },
        "sales_growth": {
          "derivative": {
            "buckets_path": "monthly_sales"
          }
        }
      }
    }
  }
}
```

### 聚合與查詢結合

聚合可以在過濾後的結果上執行：

```json
POST /orders/_search
{
  "size": 0,
  "query": {
    "bool": {
      "filter": [
        { "term": { "status": "completed" } },
        { "range": { "order_date": { "gte": "2024-01-01" } } }
      ]
    }
  },
  "aggs": {
    "revenue_by_region": {
      "terms": {
        "field": "region.keyword"
      },
      "aggs": {
        "total_revenue": {
          "sum": { "field": "amount" }
        }
      }
    }
  }
}
```

### 效能優化

#### 1. 使用 filter context

在聚合中使用 filter 而非 query：

```json
{
  "aggs": {
    "recent_orders": {
      "filter": {
        "range": { "order_date": { "gte": "now-7d" } }
      },
      "aggs": {
        "total": { "sum": { "field": "amount" } }
      }
    }
  }
}
```

#### 2. 限制桶數量

避免高基數欄位的 terms 聚合產生過多桶。

#### 3. 使用 Sampler

對大數據集進行採樣：

```json
{
  "aggs": {
    "sample": {
      "sampler": {
        "shard_size": 1000
      },
      "aggs": {
        "popular_terms": {
          "terms": { "field": "tag.keyword" }
        }
      }
    }
  }
}
```

### 實戰範例：電商數據分析

```json
POST /orders/_search
{
  "size": 0,
  "query": {
    "range": {
      "order_date": {
        "gte": "2024-01-01",
        "lte": "2024-12-31"
      }
    }
  },
  "aggs": {
    "monthly_analysis": {
      "date_histogram": {
        "field": "order_date",
        "calendar_interval": "month"
      },
      "aggs": {
        "revenue": {
          "sum": { "field": "amount" }
        },
        "order_count": {
          "value_count": { "field": "order_id" }
        },
        "unique_customers": {
          "cardinality": { "field": "customer_id" }
        },
        "by_category": {
          "terms": {
            "field": "category.keyword",
            "size": 5
          },
          "aggs": {
            "category_revenue": {
              "sum": { "field": "amount" }
            }
          }
        }
      }
    },
    "top_products": {
      "terms": {
        "field": "product_id.keyword",
        "size": 10,
        "order": { "total_sold": "desc" }
      },
      "aggs": {
        "total_sold": {
          "sum": { "field": "quantity" }
        }
      }
    }
  }
}
```

### 面試重點

1. **三種聚合類型的區別**
2. **Cardinality 的近似性**：HyperLogLog++ 演算法
3. **巢狀聚合的應用**
4. **效能優化策略**
5. **與 SQL GROUP BY 的對比**
