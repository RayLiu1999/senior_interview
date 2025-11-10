# pgvector：PostgreSQL 的向量擴展

- **難度**: 6
- **標籤**: `pgvector`, `PostgreSQL`, `向量資料庫`, `SQL`

## 問題詳述

pgvector 是 PostgreSQL 的向量擴展，讓傳統關聯式資料庫具備向量搜尋能力。對於已使用 PostgreSQL 的團隊，pgvector 提供了成本最低的向量搜尋方案，同時支援 SQL 和向量的混合查詢。

## 核心理論與詳解

### 安裝與配置

```sql
-- 創建擴展
CREATE EXTENSION vector;

-- 創建表
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  content TEXT,
  embedding vector(768),  -- 768 維向量
  created_at TIMESTAMP DEFAULT NOW()
);

-- 創建 HNSW 索引
CREATE INDEX ON documents 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 或創建 IVF 索引
CREATE INDEX ON documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### 支援的距離度量

```sql
-- 餘弦距離（推薦用於文本）
<=> 

-- 歐氏距離
<->

-- 內積
<#>
```

### 查詢範例

```sql
-- 向量相似度搜尋
SELECT id, content, 1 - (embedding <=> $1::vector) AS similarity
FROM documents
ORDER BY embedding <=> $1::vector
LIMIT 10;

-- 混合查詢（向量 + 標量過濾）
SELECT id, content
FROM documents
WHERE category = 'tech'
  AND created_at > NOW() - INTERVAL '1 month'
ORDER BY embedding <=> $1::vector
LIMIT 10;
```

### Go 整合

```go
import (
    "database/sql"
    "github.com/lib/pq"
    "github.com/pgvector/pgvector-go"
)

func Search(db *sql.DB, queryVec []float32, k int) ([]Result, error) {
    query := `
        SELECT id, content, 1 - (embedding <=> $1) AS similarity
        FROM documents
        ORDER BY embedding <=> $1
        LIMIT $2
    `
    
    rows, err := db.Query(query, pgvector.NewVector(queryVec), k)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    
    results := make([]Result, 0)
    for rows.Next() {
        var r Result
        if err := rows.Scan(&r.ID, &r.Content, &r.Similarity); err != nil {
            return nil, err
        }
        results = append(results, r)
    }
    
    return results, nil
}
```

### 效能優化

1. **選擇合適的索引**：
   - HNSW：更快、更準確，適合大多數場景
   - IVF：記憶體更少，適合極大數據

2. **調整索引參數**：
```sql
-- HNSW
-- m: 16（預設），越大越準確但記憶體更多
-- ef_construction: 64（預設），越大索引質量越好但構建慢

-- IVF  
-- lists: √記錄數，如 100 萬記錄用 1000
```

3. **設置 probes**（IVF）：
```sql
SET ivfflat.probes = 10;  -- 探測 10 個簇
```

## 優劣勢

### 優勢
- ✅ 整合 PostgreSQL，無需額外資料庫
- ✅ SQL 查詢，關聯式 + 向量
- ✅ ACID 事務保證
- ✅ 成本低，利用現有基礎設施
- ✅ 學習曲線低

### 劣勢
- ❌ 效能不如專用向量資料庫
- ❌ 垂直擴展為主，水平擴展困難
- ❌ 索引選項有限
- ❌ 不適合超大規模（> 100 萬向量效能下降）

## 適用場景

- 小中型應用（< 100 萬向量）
- 已使用 PostgreSQL
- 需要向量 + 關聯式混合查詢
- 預算有限
- 快速原型開發

## 總結

pgvector 是將向量搜尋整合到現有 PostgreSQL 的最佳方案。雖然效能不如專用向量資料庫，但對於中小型應用和原型開發非常合適。如果已在使用 PostgreSQL，pgvector 是成本最低、最快上手的選擇。

## 延伸閱讀

- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [PostgreSQL Vector Extension Guide](https://supabase.com/docs/guides/ai/vector-columns)
