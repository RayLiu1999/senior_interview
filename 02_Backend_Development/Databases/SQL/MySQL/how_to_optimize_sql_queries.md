# 如何進行 SQL 查詢優化？請提供一些常見的策略

- **難度**: 8
- **重要程度**: 5
- **標籤**: `MySQL`, `SQL`, `Performance`, `Query Optimization`

## 問題詳述

SQL 查詢效能是後端系統效能的關鍵瓶頸之一。當一個查詢變得緩慢時，我們應該從哪些方面入手進行分析和優化？請列舉並解釋一些常見且有效的 SQL 查詢優化策略。

## 核心理論與詳解

SQL 查詢優化是一個系統性工程，它涉及到從索引設計、查詢語句撰寫到資料庫結構等多个層面。優化的核心目標是 **減少 I/O 操作**、**降低 CPU 計算** 並 **最大化地利用索引**。

### 1. 使用 `EXPLAIN` 進行查詢分析

這是 SQL 優化的 **第一步也是最重要的一步**。`EXPLAIN` 命令可以讓我們看到 MySQL 查詢最佳化器是如何執行一條 SQL 語句的。

- **語法**: `EXPLAIN SELECT ... FROM ... WHERE ...;`
- **核心關注點**:
  - **`type`**: 連接類型。這是判斷查詢效能好壞的關鍵指標。效能從好到差依次為：`system` > `const` > `eq_ref` > `ref` > `range` > `index` > `ALL`。必須避免出現 `ALL` (全表掃描)。
  - **`key`**: 實際使用的索引。如果為 `NULL`，表示沒有使用到索引。
  - **`rows`**: 預估需要掃描的行數。這個數字越小越好。
  - **`Extra`**: 額外資訊。如果出現 `Using filesort` (無法利用索引完成排序) 或 `Using temporary` (使用了臨時表)，通常意味著查詢有很大的優化空間。

### 2. 索引優化策略

索引是查詢優化的核心武器。

- **為 `WHERE` 子句中的欄位建立索引**: 這是最基本的原則。為經常作為查詢條件的欄位建立索引，可以極大地減少掃描範圍。
- **利用複合索引和最左前綴原則**: 當查詢條件涉及多個欄位時，可以建立複合索引。遵循最左前綴原則來安排查詢條件的順序，可以最大化索引的利用率。
- **使用覆蓋索引 (Covering Index)**: 讓查詢所需的所有欄位都包含在索引中，這樣就可以避免「回表」操作，直接從索引中獲取資料，極大提升效能。
  - **反例**: `SELECT * FROM users WHERE name = 'Alice';` (即使 `name` 有索引，`*` 也會導致回表)
  - **正例**: `SELECT id, name, age FROM users WHERE name = 'Alice';` (假設有 `(name, age)` 的複合索引，`id` 是主鍵，可以實現覆蓋)
- **避免在索引欄位上進行計算或使用函數**: 這會導致索引失效。
  - **反例**: `WHERE DATE(create_time) = '2023-01-01'`
  - **正例**: `WHERE create_time >= '2023-01-01 00:00:00' AND create_time < '2023-01-02 00:00:00'`
- **選擇高區分度的欄位建立索引**: 像「性別」這種只有幾個可能值的欄位，建立索引的效果很差，因為每次查詢還是會掃描大量資料。

### 3. 查詢語句撰寫策略

- **避免 `SELECT *`**: 只查詢你真正需要的欄位。這可以減少網路傳輸的資料量，並且更有可能觸發覆蓋索引。
- **用 `UNION ALL` 代替 `UNION`**: 如果你確定結果集中沒有重複的行，或者不關心結果是否重複，使用 `UNION ALL` 可以避免 `UNION` 為了去重而進行的排序操作，效能更好。
- **小心使用 `OR`**: 在某些情況下，MySQL 對 `OR` 的優化不佳，可能會導致索引失效。可以考慮將 `OR` 查詢拆分成兩個獨立的 `UNION ALL` 查詢。
  - **反例**: `SELECT * FROM orders WHERE status = 'paid' OR user_id = 123;`
  - **優化**:

    ```sql
    SELECT * FROM orders WHERE status = 'paid'
    UNION ALL
    SELECT * FROM orders WHERE user_id = 123 AND status != 'paid';
    ```

- **避免 `LIKE` 的前導模糊查詢**: `LIKE '%keyword'` 無法使用 B-Tree 索引，而 `LIKE 'keyword%'` 則可以。
- **使用 `EXISTS` 或 `IN`**:
  - 當子查詢的結果集較小時，`IN` 的效能通常更好。
  - 當子查詢的結果集較大，而外層表的資料量較小時，`EXISTS` 的效能可能更好，因為 `EXISTS` 只關心子查詢是否返回行，一旦找到一行就停止。

### 4. 分頁查詢 (`LIMIT`) 優化

當資料量巨大時，傳統的 `LIMIT offset, count` 分頁方式會隨著 `offset` 的增大而效能急劇下降。因為 MySQL 需要掃描 `offset + count` 行資料，然後丟棄前面的 `offset` 行。

- **傳統方式 (效能差)**: `SELECT * FROM articles ORDER BY id LIMIT 1000000, 10;`
- **優化方式 (延遲關聯)**: 先快速定位到 `id`，然後再關聯獲取所需欄位。

  ```sql
  SELECT a.*
  FROM articles a
  JOIN (SELECT id FROM articles ORDER BY id LIMIT 1000000, 10) b ON a.id = b.id;
  ```

- **優化方式 (基於遊標)**: 記錄上一頁最後一條記錄的 `id`，下一頁直接從這個 `id` 開始查找。

  ```sql
  SELECT * FROM articles WHERE id > [last_page_last_id] ORDER BY id LIMIT 10;
  ```

  這是實現高效「無限滾動」加載的推薦方法。

### 5. 資料庫結構與設計

- **選擇合適的資料類型**: 使用能容納資料的最小資料類型，例如用 `TINYINT` 而不是 `INT` 來儲存年齡。這可以減少磁碟空間和記憶體使用。
- **正規化與反正規化**:
  - **正規化 (Normalization)**: 減少資料冗餘，保證一致性，適用於 OLTP (線上交易處理) 系統。
  - **反正規化 (Denormalization)**: 故意增加資料冗餘以減少 `JOIN` 操作，提高查詢效能。適用於 OLAP (線上分析處理) 系統或讀多寫少的場景。

### 總結流程

1. **監控與發現**: 通過慢查詢日誌 (Slow Query Log) 或效能監控工具發現慢查詢。
2. **分析**: 使用 `EXPLAIN` 分析慢查詢的執行計畫。
3. **優化**:
    - 檢查索引是否合理，是否需要新增或修改索引。
    - 重寫 SQL 語句，使其更符合最佳化原則。
    - 考慮是否需要調整表結構或進行反正規化。
4. **驗證**: 再次使用 `EXPLAIN` 和實際測試來驗證優化效果。
