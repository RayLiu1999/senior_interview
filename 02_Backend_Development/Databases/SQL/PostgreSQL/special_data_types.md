# PostgreSQL 有哪些特殊的資料類型？

- **難度**: 3
- **標籤**: `PostgreSQL`, `Data Types`

## 問題詳述

PostgreSQL 以其豐富的資料類型而聞名，這也是它相較於其他關聯式資料庫（如 MySQL）的一大優勢。請列舉並解釋幾個 PostgreSQL 特有的、強大的資料類型，並說明它們的應用場景。

## 核心理論與詳解

PostgreSQL 的物件關聯式特性使其不僅僅能儲存傳統的純量資料，還能原生支援和操作複雜的資料結構。這使得開發者可以將部分應用層的邏輯下沉到資料庫中，簡化開發並提升效能。

以下是幾個 PostgreSQL 中極具代表性的特殊資料類型：

### 1. `JSONB`

`JSONB` 是 PostgreSQL 的一大「殺手級」特性，用於儲存 JSON (JavaScript Object Notation) 資料。

- **與 `JSON` 類型的區別**:
  - **`JSON`**: 以 **純文字** 形式儲存 JSON 資料。它會保留原始的空格、重複的鍵以及鍵的順序。寫入速度快，但查詢時需要重新解析，效能較差。
  - **`JSONB`**: 以 **分解後的二進位格式** 儲存 JSON 資料。它會去除不必要的空格和重複的鍵，並且不會保留鍵的順序。寫入時需要額外的轉換開銷，但查詢效能極高，並且 **支援索引**。

- **核心優勢**:
  - **高效查詢**: 可以直接查詢 JSON 文件內部特定的鍵或值，無需在應用程式中反序列化整個文件。
  - **強大的操作符**: 提供了一系列豐富的操作符 (`->`, `->>`, `@>`, `?` 等) 來訪問和操作 JSON 資料。
  - **索引支援**: `JSONB` 類型可以被 **GIN (Generalized Inverted Index)** 索引，這使得對 JSON 文件內部欄位的查詢速度可以達到與傳統欄位一樣的水平。

- **應用場景**:
  - 儲存非結構化或半結構化的資料，如使用者設定、產品屬性、日誌事件等。
  - 在關聯式資料庫中實現類似 NoSQL 資料庫的靈活性。

- **程式碼範例**:

  ```sql
  -- 創建一個帶有 JSONB 欄位的表
  CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      attributes JSONB
  );

  -- 插入資料
  INSERT INTO products (name, attributes) VALUES
  ('Laptop', '{"brand": "Apple", "specs": {"ram": 16, "storage": 512}}');

  -- 查詢 JSON 內部的值
  SELECT name, attributes->'brand' AS brand FROM products;

  -- 使用 GIN 索引加速查詢
  CREATE INDEX idx_gin_attributes ON products USING GIN (attributes);
  SELECT * FROM products WHERE attributes @> '{"brand": "Apple"}';
  ```

### 2. `Array` (陣列)

PostgreSQL 允許任何基礎資料類型被定義為多維陣列。

- **核心優勢**:
  - **資料原子性**: 可以將一組相關的值作為一個原子單元儲存在單一欄位中，避免了為簡單的列表創建額外的關聯表。
  - **豐富的陣列函數**: 提供了大量的內建函數和操作符來處理陣列，如計算長度、切片、判斷包含關係等。
  - **索引支援**: 陣列類型同樣可以被 GIN 索引，以加速包含性查詢。

- **應用場景**:
  - 儲存一對多的簡單關係，如一篇文章的多個標籤 (`tags TEXT[]`)。
  - 記錄歷史變更，如一個產品的歷史價格 (`price_history NUMERIC[]`)。

- **程式碼範例**:

  ```sql
  CREATE TABLE articles (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255),
      tags TEXT[]
  );

  INSERT INTO articles (title, tags) VALUES
  ('PostgreSQL is awesome', '{"database", "postgres", "tech"}');

  -- 查詢包含特定標籤的文章
  SELECT * FROM articles WHERE 'postgres' = ANY(tags);
  -- 或者使用包含操作符
  SELECT * FROM articles WHERE tags @> '{"postgres"}';
  ```

### 3. `HSTORE` (鍵值對)

`HSTORE` 是一個擴展類型，用於在單一值中儲存一組鍵值對 (Key-Value pairs)。

- **核心優勢**:
  - 結構簡單，適合儲存扁平的鍵值對集合。
  - 支援 GiST 和 GIN 索引，可以高效地查詢特定的鍵或值。

- **與 `JSONB` 的比較**:
  - `HSTORE` 只能儲存扁平的 `text => text` 結構，而 `JSONB` 可以儲存任意嵌套的複雜結構和不同的值類型 (number, boolean, string)。
  - 在現代 PostgreSQL 中，`JSONB` 的功能完全覆蓋並超越了 `HSTORE`，因此 **`JSONB` 是儲存鍵值對的首選**。`HSTORE` 更多是出於歷史原因和向後相容性而存在。

### 4. `Range Types` (範圍類型)

PostgreSQL 支援範圍類型，用於表示某個範圍的資料。內建的範圍類型包括：

- `int4range` — 整數範圍
- `int8range` — 長整數範圍
- `numrange` — 任意精度數值範圍
- `tsrange` — 不含時區的時間戳範圍
- `tstzrange` — 包含時區的時間戳範圍
- `daterange` — 日期範圍

- **核心優勢**:
  - **簡化查詢**: 提供了專門的操作符（如包含 `@>`、重疊 `&&`）來處理範圍相關的查詢，使邏輯更清晰、更高效。
  - **約束強制**: 可以使用 `EXCLUDE` 約束來防止範圍重疊，這在預訂系統或時間安排等場景中非常有用。

- **應用場景**:
  - 會議室預訂系統，儲存預訂的時間範圍。
  - 酒店房間的價格有效期。
  - IP 位址範圍管理。

- **程式碼範例**:

  ```sql
  CREATE TABLE reservations (
      room INT,
      during TSTZRANGE,
      -- 使用 GiST 索引和 EXCLUDE 約束防止同一房間的預訂時間重疊
      EXCLUDE USING GIST (room WITH =, during WITH &&)
  );

  INSERT INTO reservations (room, during) VALUES
  (101, '[2023-10-26 14:00, 2023-10-26 16:00)');

  -- 這次插入會失敗，因為時間範圍與已有的預訂重疊
  INSERT INTO reservations (room, during) VALUES
  (101, '[2023-10-26 15:00, 2023-10-26 17:00)');
  ```
