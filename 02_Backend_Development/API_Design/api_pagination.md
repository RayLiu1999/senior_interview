# API 分頁設計 (API Pagination)

- **難度**: 5
- **重要程度**: 4
- **標籤**: `分頁`, `Pagination`, `游標分頁`, `Offset分頁`, `API設計`

## 問題詳述

分頁是 API 設計中的基礎問題：當資料量大時，不可能一次返回所有記錄，必須通過分頁機制讓客戶端按需獲取。常見的分頁策略有 Offset/Limit 分頁和游標（Cursor）分頁，兩者在效能、一致性和使用體驗上有本質差異。

## 核心理論與詳解

### Offset/Limit 分頁（偏移量分頁）

最簡單直觀的分頁方式，通過 `offset`（跳過多少條）和 `limit`（每頁幾條）控制：

```
GET /users?offset=0&limit=20    # 第 1 頁
GET /users?offset=20&limit=20   # 第 2 頁
GET /users?offset=40&limit=20   # 第 3 頁
```

**優點**：
- 實現簡單：`SELECT * FROM users LIMIT 20 OFFSET 40`
- 支持**隨機跳頁**（直接跳到第 100 頁）
- 客戶端容易實現「上一頁/下一頁」

**缺點**：
- **效能問題（深分頁）**：`OFFSET 100000 LIMIT 20` 需要資料庫掃描並丟棄前 10 萬條記錄，效能隨頁碼增大急劇下降
- **數據不一致（Phantom Read）**：
  - 用戶查第 1 頁（記錄 1-20）
  - 期間有新記錄插入，排在第 1 條
  - 用戶查第 2 頁（offset=20）時，原第 20 條變成第 21 條，第 20 條被跳過
  - 這會導致數據遺漏或重複
- 不適合**即時性高的數據流**（如動態 Feed、排行榜）

---

### 游標分頁（Cursor-based Pagination / Keyset Pagination）

使用一個唯一且遞增/遞減的**游標值**（通常是排序字段的最後一個值，如 ID 或 created_at）標記當前位置：

```
# 第 1 頁（無游標）
GET /users?limit=20

# Response 包含下一頁游標
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6IDIwfQ==",  // Base64 編碼的游標
    "has_next": true
  }
}

# 第 2 頁（帶游標）
GET /users?cursor=eyJpZCI6IDIwfQ==&limit=20
```

**SQL 實現（以 ID 為游標）**：
```sql
-- 傳統 Offset（慢）
SELECT * FROM posts ORDER BY id DESC LIMIT 20 OFFSET 10000;

-- 游標分頁（快）
SELECT * FROM posts WHERE id < :last_seen_id ORDER BY id DESC LIMIT 20;
```

**優點**：
- **穩定效能**：無論多深的頁，查詢時間恆定（O(log n)，利用索引）
- **數據一致性**：游標指向固定位置，插入/刪除不影響已有分頁結果
- 適合無限滾動（Infinite Scroll）場景

**缺點**：
- **不支持隨機跳頁**（無法直接跳到第 100 頁）
- 游標通常是不透明字串（對用戶不友好）
- 多列排序的游標實現更複雜
- 若游標字段不唯一（如 created_at），需要組合字段保證唯一性

---

### 頁碼分頁（Page Number Pagination）

`page` 和 `per_page` 參數，是 Offset 分頁的語法糖：

```
GET /users?page=5&per_page=20
# 等同於 offset = (5-1) * 20 = 80
```

**問題與 Offset 分頁相同**。

---

### 如何選擇分頁策略

| 場景 | 推薦策略 | 原因 |
|------|---------|------|
| 管理後台，需要跳頁 | Offset/Limit | 數據量通常不大，跳頁功能必要 |
| 社交 Feed、消息流 | **游標分頁** | 數據快速增長，需要一致性，無限滾動 |
| 排行榜、實時數據 | **游標分頁** | 高並發寫入，Offset 容易遺漏/重複 |
| 搜尋結果展示 | Offset/Limit | 用戶需要知道「第 X 頁」 |
| API 大量數據導出 | **游標分頁** | 深分頁效能問題嚴重 |

### 深分頁優化（Offset 的改良）

若必須使用 Offset 但數據量大，可使用**延遲關聯（Deferred Join）**：

```sql
-- 慢：掃描所有字段後 offset
SELECT * FROM posts ORDER BY id DESC LIMIT 20 OFFSET 100000;

-- 快：先用覆蓋索引定位 ID，再回表
SELECT * FROM posts
WHERE id IN (
  SELECT id FROM posts ORDER BY id DESC LIMIT 20 OFFSET 100000
);
```

這樣 OFFSET 操作只掃描索引（覆蓋索引），之後再回表獲取完整記錄，效能可提升數倍。
