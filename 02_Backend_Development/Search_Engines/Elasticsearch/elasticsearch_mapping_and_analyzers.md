# Elasticsearch 索引 Mapping 與分析器

- **難度**: 6
- **重要性**: 5
- **標籤**: `Elasticsearch`, `Mapping`, `Analyzer`, `Text Processing`

## 問題詳述

請解釋 Elasticsearch 的 Mapping 機制，以及分析器 (Analyzer) 如何影響索引和搜尋行為。

## 核心理論與詳解

### Mapping 概念

Mapping 是定義文件及其欄位如何被儲存和索引的過程。它類似於關聯式資料庫中的 Schema 定義。

#### 欄位資料類型

**核心類型**：

| 類型 | 說明 | 使用場景 |
|------|------|----------|
| `text` | 全文搜尋文本 | 標題、描述、內容 |
| `keyword` | 精確值 | ID、狀態、標籤 |
| `long` / `integer` | 整數 | 數量、計數 |
| `double` / `float` | 浮點數 | 價格、評分 |
| `boolean` | 布林值 | 開關狀態 |
| `date` | 日期時間 | 建立時間、更新時間 |
| `object` | JSON 物件 | 巢狀資料 |
| `nested` | 巢狀物件陣列 | 需要獨立查詢的物件陣列 |

#### 動態 Mapping vs 顯式 Mapping

**動態 Mapping**：
- Elasticsearch 自動偵測欄位類型
- 方便但可能不符合預期

**顯式 Mapping**：
```json
PUT /products
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "ik_max_word",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
      },
      "price": {
        "type": "double"
      },
      "status": {
        "type": "keyword"
      },
      "created_at": {
        "type": "date",
        "format": "yyyy-MM-dd HH:mm:ss||epoch_millis"
      },
      "tags": {
        "type": "keyword"
      }
    }
  }
}
```

### 分析器 (Analyzer) 機制

分析器負責將文本轉換為可搜尋的詞項 (Terms)。它只對 `text` 類型欄位生效。

#### 分析器組成

```
Character Filters → Tokenizer → Token Filters
```

| 組件 | 作用 | 範例 |
|------|------|------|
| **Character Filters** | 預處理字符 | 移除 HTML 標籤 |
| **Tokenizer** | 分詞 | 標準分詞、IK 分詞 |
| **Token Filters** | 詞項處理 | 小寫化、去停用詞、同義詞 |

#### 內建分析器

| 分析器 | 說明 | 適用語言 |
|--------|------|----------|
| `standard` | 標準分詞 | 英文（預設） |
| `simple` | 非字母分隔 | 簡單英文 |
| `whitespace` | 空白分隔 | 特殊場景 |
| `keyword` | 不分詞 | 精確匹配 |
| `ik_smart` | IK 智慧分詞 | 中文 |
| `ik_max_word` | IK 最大分詞 | 中文（更細粒度） |

#### 分析器測試

```json
POST /_analyze
{
  "analyzer": "ik_max_word",
  "text": "Elasticsearch 是一個分散式搜尋引擎"
}
```

### text vs keyword

這是最常見的面試考點：

| 特性 | text | keyword |
|------|------|---------|
| 分詞 | 是 | 否 |
| 查詢方式 | Match Query | Term Query |
| 用途 | 全文搜尋 | 精確匹配、聚合、排序 |
| 索引大小 | 較大 | 較小 |

**常見模式：Multi-fields**

```json
{
  "title": {
    "type": "text",
    "analyzer": "ik_max_word",
    "fields": {
      "keyword": {
        "type": "keyword",
        "ignore_above": 256
      }
    }
  }
}
```

這樣可以同時支援：
- `title`：全文搜尋
- `title.keyword`：聚合、排序、精確匹配

### 自訂分析器

```json
PUT /my_index
{
  "settings": {
    "analysis": {
      "char_filter": {
        "html_strip_filter": {
          "type": "html_strip"
        }
      },
      "tokenizer": {
        "my_tokenizer": {
          "type": "pattern",
          "pattern": "[\\W_]+"
        }
      },
      "filter": {
        "my_stopwords": {
          "type": "stop",
          "stopwords": ["the", "a", "an"]
        }
      },
      "analyzer": {
        "my_custom_analyzer": {
          "type": "custom",
          "char_filter": ["html_strip_filter"],
          "tokenizer": "my_tokenizer",
          "filter": ["lowercase", "my_stopwords"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "content": {
        "type": "text",
        "analyzer": "my_custom_analyzer"
      }
    }
  }
}
```

### 索引時 vs 搜尋時分析

| 階段 | 設定 | 說明 |
|------|------|------|
| 索引時 | `analyzer` | 文件被索引時使用 |
| 搜尋時 | `search_analyzer` | 查詢被執行時使用 |

**通常兩者應該一致**，但某些場景可能不同：
- 索引時使用 `ik_max_word`（細粒度）
- 搜尋時使用 `ik_smart`（粗粒度）

### Mapping 最佳實踐

1. **禁用動態 Mapping**（生產環境）
   ```json
   {
     "mappings": {
       "dynamic": "strict"
     }
   }
   ```

2. **設定 `ignore_above`**
   ```json
   {
     "type": "keyword",
     "ignore_above": 256
   }
   ```

3. **禁用不需要的功能**
   ```json
   {
     "type": "keyword",
     "doc_values": false,  // 不需要聚合/排序時
     "norms": false        // 不需要評分時
   }
   ```

4. **使用別名**
   - 方便零停機時間 reindex

### 面試重點

1. **text vs keyword 區別**
2. **分析器的三個組件**
3. **中文分詞器選擇**（IK）
4. **Multi-fields 使用場景**
5. **動態 Mapping 的問題**
