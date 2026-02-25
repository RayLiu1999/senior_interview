# Elasticsearch 查詢語法詳解：Match, Term, Bool Query

- **難度**: 6
- **重要性**: 5
- **標籤**: `Elasticsearch`, `Query DSL`, `Search`

## 問題詳述

請詳細解釋 Elasticsearch 的查詢 DSL (Domain Specific Language)，包括 Match Query、Term Query、Bool Query 的區別和使用場景。

## 核心理論與詳解

Elasticsearch 的查詢 DSL 是一種基於 JSON 的查詢語言，提供了豐富的查詢能力。理解不同查詢類型的區別是使用 Elasticsearch 的基礎。

### 查詢類型概覽

#### 1. Term Query（精確查詢）

Term Query 用於 **精確匹配**，不會對查詢文本進行分詞。適用於關鍵字欄位（keyword）、數值、日期等。

**特點**：
- 不進行分詞處理
- 區分大小寫
- 用於精確值匹配

**使用場景**：
- 狀態欄位查詢（如 `status: "active"`）
- ID 查詢
- 枚舉值查詢

**範例**：
```json
{
  "query": {
    "term": {
      "status": {
        "value": "published"
      }
    }
  }
}
```

**注意事項**：
- 對 `text` 類型欄位使用 term query 可能無法匹配，因為 text 欄位會被分詞後儲存
- 應該使用 `keyword` 子欄位或 `match` query

#### 2. Match Query（全文查詢）

Match Query 是最常用的 **全文搜尋** 查詢，會對查詢文本進行分詞，然後在倒排索引中查找匹配的文件。

**特點**：
- 對查詢文本進行分詞
- 預設使用 OR 邏輯
- 可配置為 AND 邏輯
- 計算相關性分數

**使用場景**：
- 標題、內容等文本欄位的搜尋
- 需要模糊匹配的場景
- 需要相關性排序的場景

**範例**：
```json
{
  "query": {
    "match": {
      "title": {
        "query": "elasticsearch tutorial",
        "operator": "and"  // 預設是 "or"
      }
    }
  }
}
```

#### 3. Match Phrase Query（短語匹配）

Match Phrase 要求查詢詞語 **按順序且連續** 出現在文件中。

**範例**：
```json
{
  "query": {
    "match_phrase": {
      "content": {
        "query": "quick brown fox",
        "slop": 1  // 允許詞語間有 1 個間隔
      }
    }
  }
}
```

#### 4. Bool Query（複合查詢）

Bool Query 是最強大的複合查詢，可以組合多個查詢條件。

**四種子句**：

| 子句 | 說明 | 影響分數 |
|------|------|----------|
| `must` | 必須匹配 | ✓ |
| `should` | 應該匹配（提升相關性） | ✓ |
| `must_not` | 必須不匹配 | ✗ |
| `filter` | 必須匹配，但不計算分數 | ✗ |

**範例**：
```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "title": "elasticsearch" } }
      ],
      "should": [
        { "term": { "featured": true } }
      ],
      "must_not": [
        { "term": { "status": "deleted" } }
      ],
      "filter": [
        { "range": { "publish_date": { "gte": "2023-01-01" } } },
        { "term": { "category": "technology" } }
      ]
    }
  }
}
```

### Filter vs Query Context

**Query Context（查詢上下文）**：
- 回答「這個文件有多匹配？」
- 計算相關性分數 `_score`
- 較慢，結果不可快取

**Filter Context（過濾上下文）**：
- 回答「這個文件是否匹配？」
- 不計算分數，只返回 Yes/No
- 較快，結果可快取

**最佳實踐**：
- 需要相關性排序的條件放在 `must` / `should`
- 精確過濾條件放在 `filter`（如日期範圍、狀態）

### 常見查詢對比

| 查詢類型 | 分詞 | 用途 | 性能 |
|----------|------|------|------|
| Term | 否 | 精確匹配 | 快 |
| Match | 是 | 全文搜尋 | 中 |
| Match Phrase | 是 | 短語匹配 | 較慢 |
| Bool | - | 複合查詢 | 取決於子查詢 |
| Range | - | 範圍查詢 | 快（可快取） |
| Wildcard | 否 | 萬用字元 | 慢（避免前綴萬用字元） |

### 實戰範例：電商商品搜尋

```json
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "wireless headphones",
            "fields": ["title^2", "description", "brand"],
            "type": "best_fields"
          }
        }
      ],
      "filter": [
        { "term": { "in_stock": true } },
        { "range": { "price": { "gte": 50, "lte": 200 } } },
        { "terms": { "category": ["electronics", "audio"] } }
      ],
      "should": [
        { "term": { "featured": { "value": true, "boost": 2 } } },
        { "range": { "rating": { "gte": 4.5 } } }
      ],
      "minimum_should_match": 1
    }
  },
  "sort": [
    { "_score": "desc" },
    { "sales_count": "desc" }
  ],
  "from": 0,
  "size": 20
}
```

### 面試重點

1. **Term vs Match**：
   - Term 不分詞，用於 keyword 欄位
   - Match 會分詞，用於 text 欄位

2. **Filter vs Must**：
   - Filter 不計算分數，可快取
   - 效能優化：精確條件用 filter

3. **Bool Query 組合**：
   - 理解四種子句的語義
   - 知道如何組合複雜查詢

4. **相關性分數**：
   - 使用 `boost` 調整權重
   - 使用 `function_score` 自訂評分
