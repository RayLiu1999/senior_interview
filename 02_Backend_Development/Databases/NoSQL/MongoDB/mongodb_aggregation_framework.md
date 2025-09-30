# MongoDB Aggregation Framework

- **難度**: 7
- **重要性**: 5
- **標籤**: `MongoDB`, `Aggregation`, `Data Processing`

## 問題詳述

請解釋 MongoDB 的聚合框架 (Aggregation Framework) 是什麼，以及它的主要用途。請描述一個典型的聚合管線 (Aggregation Pipeline) 包含哪些常見的階段 (Stages)，並舉例說明。

## 核心理論與詳解

MongoDB 的聚合框架是一個強大的資料處理工具，它允許你對集合中的文件進行多階段的轉換和計算，最終得到一個匯總後的結果。這種類似於「流水線」作業的模式，被稱為**聚合管線 (Aggregation Pipeline)**。

聚合框架的功能遠超 `find()` 方法所能提供的簡單查詢。它可以被看作是 SQL 中 `GROUP BY`、`HAVING` 以及各種聚合函數（如 `SUM`, `AVG`, `COUNT`）的更靈活、更強大的版本。

**主要用途**:
-   對資料進行分組、計數、求和、平均等統計計算。
-   對文件進行複雜的轉換、重塑和篩選。
-   執行類似 SQL `JOIN` 的多集合關聯查詢（透過 `$lookup` 階段）。
-   為商業智慧 (BI)、資料分析和報表生成提供支援。

---

### 聚合管線 (Aggregation Pipeline)

一個聚合管線由一個或多個**階段 (Stages)** 組成。每個階段都會接收前一個階段輸出的文件作為輸入，對這些文件進行處理，然後將結果輸出給下一個階段。

這種設計使得你可以將複雜的資料處理任務分解成一系列簡單、獨立的步驟，提高了可讀性和可維護性。

#### 常見的聚合階段 (Common Stages)

以下是一些最常用的聚合階段：

##### 1. `$match`

-   **作用**: **篩選**文件。它使用與 `find()` 方法相同的查詢語法。
-   **用途**: 在管線的早期階段盡快地過濾掉不需要的文件，以減少後續階段需要處理的資料量，從而顯著提升效能。
-   **範例**:
    ```json
    { "$match": { "status": "A" } }
    ```
    只將 `status` 為 "A" 的文件傳遞給下一個階段。

##### 2. `$group`

-   **作用**: **分組**文件。這是聚合框架的核心功能之一，類似於 SQL 的 `GROUP BY`。
-   **用途**: 根據指定的表示式（通常是某個欄位）將文件分組，並對每個分組執行聚合計算。
-   **`_id` 欄位**: 在 `$group` 階段，`_id` 欄位是**必須**的，它定義了分組的依據。如果設為 `null`，則會對所有輸入文件進行分組計算。
-   **聚合運算子**:
    -   `$sum`: 計算總和。
    -   `$avg`: 計算平均值。
    -   `$min` / `$max`: 計算最小值/最大值。
    -   `$push`: 將某個欄位的值組成一個陣列。
    -   `$addToSet`: 類似 `$push`，但會過濾掉重複的值。
-   **範例**:
    ```json
    {
      "$group": {
        "_id": "$cust_id",
        "total_sales": { "$sum": "$amount" }
      }
    }
    ```
    按 `cust_id` 分組，並計算每個客戶的總銷售額 `total_sales`。

##### 3. `$project`

-   **作用**: **重塑**文件。用於指定輸出文件中應包含哪些欄位，或者新增計算欄位。
-   **用途**:
    -   包含或排除特定欄位（`1` 表示包含，`0` 表示排除）。
    -   重新命名欄位。
    -   根據現有欄位創建新的計算欄位。
-   **範例**:
    ```json
    {
      "$project": {
        "_id": 0,
        "customer": "$_id",
        "total": "$total_sales"
      }
    }
    ```
    將上一個階段的輸出結果重塑，排除 `_id`，將 `_id` 重新命名為 `customer`，並將 `total_sales` 重新命名為 `total`。

##### 4. `$sort`

-   **作用**: **排序**文件。
-   **用途**: 根據一個或多個欄位對文件進行排序。`1` 為升序，`-1` 為降序。
-   **效能提示**: 如果排序操作涉及大量資料，最好在它之前放置一個 `$match` 階段，並確保排序欄位上有索引。
-   **範例**:
    ```json
    { "$sort": { "total_sales": -1 } }
    ```
    按 `total_sales` 降序排列。

##### 5. `$limit` / `$skip`

-   **作用**: **分頁**結果。
-   **`$limit`**: 限制傳遞給下一個階段的文件數量。
-   **`$skip`**: 跳過指定數量的文件。
-   **範例**:
    ```json
    { "$limit": 10 }
    ```
    只返回前 10 個文件。

##### 6. `$lookup`

-   **作用**: **左外連接 (Left Outer Join)**。用於將當前集合與另一個集合進行關聯查詢。
-   **用途**: 實現類似 SQL `JOIN` 的功能，將另一個集合中的相關文件嵌入到當前的文件流中。
-   **範例**:
    ```json
    {
      "$lookup": {
        "from": "inventory",
        "localField": "item_id",
        "foreignField": "sku",
        "as": "item_details"
      }
    }
    ```
    將當前集合的 `item_id` 欄位與 `inventory` 集合的 `sku` 欄位進行匹配，並將找到的 `inventory` 文件作為一個名為 `item_details` 的陣列新增到輸出文件中。

### 聚合管線範例

假設我們有一個 `orders` 集合，記錄了所有訂單資訊。我們想找出 2023 年銷售額最高的 5 位客戶。

```javascript
db.orders.aggregate([
  // 階段 1: 篩選出 2023 年的訂單
  {
    "$match": {
      "order_date": {
        "$gte": new Date("2023-01-01"),
        "$lt": new Date("2024-01-01")
      }
    }
  },
  // 階段 2: 按客戶 ID 分組，並計算每個客戶的總銷售額
  {
    "$group": {
      "_id": "$customer_id",
      "total_sales": { "$sum": "$price" }
    }
  },
  // 階段 3: 按總銷售額降序排序
  {
    "$sort": {
      "total_sales": -1
    }
  },
  // 階段 4: 只取前 5 名
  {
    "$limit": 5
  },
  // 階段 5: (可選) 關聯客戶資訊表，獲取客戶名稱
  {
    "$lookup": {
      "from": "customers",
      "localField": "_id",
      "foreignField": "cust_id",
      "as": "customer_info"
    }
  },
  // 階段 6: (可選) 重塑最終輸出
  {
    "$project": {
      "_id": 0,
      "customer_id": "$_id",
      "customer_name": { "$arrayElemAt": ["$customer_info.name", 0] },
      "total_sales": "$total_sales"
    }
  }
])
```

### 結論

MongoDB 的聚合框架是一個極其靈活和強大的工具。透過將複雜的資料處理任務分解為一系列清晰的管線階段，開發者可以實現從簡單統計到複雜資料轉換的各種需求。熟練掌握 `$match`, `$group`, `$project`, `$sort` 和 `$lookup` 等核心階段，是高效使用 MongoDB 的關鍵。
