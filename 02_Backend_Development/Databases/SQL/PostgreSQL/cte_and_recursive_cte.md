# 什麼是通用表達式 (CTE)？請解釋其優點以及在 PostgreSQL 中如何使用遞迴 CTE

- **難度**: 6
- **重要程度**: 4
- **標籤**: `PostgreSQL`, `SQL`, `CTE`, `Recursion`

## 問題詳述

通用表達式 (Common Table Expressions, CTEs) 是現代 SQL 中一個強大的功能，它可以讓複雜的查詢變得更加清晰和易於管理。請解釋什麼是 CTE，它相比於傳統的子查詢有哪些優點，並舉例說明如何在 PostgreSQL 中使用 `WITH RECURSIVE` 來編寫一個遞迴查詢。

## 核心理論與詳解

通用表達式 (CTE) 是一個在主查詢（如 `SELECT`, `INSERT`, `UPDATE`, `DELETE`）執行期間定義的臨時命名結果集。你可以把它想像成一個一次性的、僅對當前查詢可見的「臨時視圖」。CTE 通過 `WITH` 關鍵字來定義。

### CTE 的基本語法

```sql
WITH cte_name (column1, column2, ...) AS (
    -- 這是一個定義 CTE 的查詢
    SELECT ...
    FROM ...
    WHERE ...
)
-- 這是使用 CTE 的主查詢
SELECT *
FROM cte_name;
```

你可以同時定義多個 CTE，用逗號分隔：

```sql
WITH
  cte_1 AS (SELECT a, b FROM table1),
  cte_2 AS (SELECT c, d FROM table2 WHERE d IN (SELECT b FROM cte_1))
SELECT *
FROM cte_2;
```

### CTE 的優點

相比於傳統的子查詢或臨時表，CTE 提供了幾個顯著的優勢：

1. **可讀性與模組化**:
    - CTE 允許你將複雜的查詢分解成多個邏輯上獨立、易於理解的步驟。你可以為每個步驟命名，使得整個 SQL 的意圖更加清晰。這就像在編寫程式時將程式碼重構為多個小函數一樣。

2. **可重用性**:
    - 在同一個查詢中，一個 CTE 可以被多次引用。而如果使用子查詢，你可能需要在多個地方重複編寫相同的邏輯。

3. **遞迴查詢能力**:
    - 這是 CTE 最強大的功能之一。通過使用 `WITH RECURSIVE`，CTE 可以引用自身，從而能夠處理層級結構或圖結構的資料，例如組織架構、物料清單 (BOM)、社交網路關係等。這是傳統子查詢無法做到的。

4. **簡化複雜的 `JOIN` 和聚合**:
    - 在需要多層聚合或在聚合結果上進行 `JOIN` 時，CTE 可以先完成一部分聚合工作，然後主查詢再基於這個清晰的、預處理過的結果集進行操作，避免了混亂的多層嵌套子查詢。

### 遞迴 CTE (`WITH RECURSIVE`)

遞迴 CTE 用於遍歷具有層級或遞迴關係的資料。一個遞迴 CTE 必須包含兩個部分：

1. **初始成員 (Anchor Member)**: 一個非遞迴的 `SELECT` 語句，它定義了遞迴的起點。
2. **遞迴成員 (Recursive Member)**: 一個 `SELECT` 語句，它引用 CTE 自身，並與前一次迭代的結果進行 `JOIN`。
3. 這兩個成員通過 `UNION` 或 `UNION ALL` 連接起來。

遞迴過程會一直持續，直到遞迴成員不再返回任何新的資料行為止。

#### 範例：查詢組織架構中的員工層級

假設我們有一個 `employees` 表，包含 `id`, `name`, 和 `manager_id`（指向其上級經理的 ID）。我們想要查詢出 CEO (id=1) 下屬所有員工的層級關係。

**資料表結構與範例資料**:

```sql
CREATE TABLE employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    manager_id INT REFERENCES employees(id)
);

INSERT INTO employees (id, name, manager_id) VALUES
(1, 'Alice (CEO)', NULL),
(2, 'Bob (Director)', 1),
(3, 'Charlie (Director)', 1),
(4, 'David (Manager)', 2),
(5, 'Eve (Manager)', 2),
(6, 'Frank (Engineer)', 4),
(7, 'Grace (Engineer)', 4);
```

**使用遞迴 CTE 查詢**:

```sql
WITH RECURSIVE employee_hierarchy AS (
    -- 1. 初始成員 (Anchor Member): 找到頂層節點 (CEO)
    SELECT
        id,
        name,
        manager_id,
        1 AS level  -- 定義層級為 1
    FROM
        employees
    WHERE
        manager_id IS NULL -- CEO 沒有上級

    UNION ALL

    -- 2. 遞迴成員 (Recursive Member): 逐層向下查找
    SELECT
        e.id,
        e.name,
        e.manager_id,
        eh.level + 1 -- 層級加 1
    FROM
        employees AS e
    JOIN
        employee_hierarchy AS eh ON e.manager_id = eh.id -- 關鍵：將員工表與 CTE 自身關聯
)
-- 3. 主查詢: 從最終的遞迴結果集中查詢
SELECT
    level,
    id,
    name,
    manager_id
FROM
    employee_hierarchy
ORDER BY
    level, id;
```

**查詢結果**:

| level | id | name | manager_id |
| :--- | :-: | :--- | :---: |
| 1 | 1 | Alice (CEO) | *null* |
| 2 | 2 | Bob (Director) | 1 |
| 2 | 3 | Charlie (Director) | 1 |
| 3 | 4 | David (Manager) | 2 |
| 3 | 5 | Eve (Manager) | 2 |
| 4 | 6 | Frank (Engineer) | 4 |
| 4 | 7 | Grace (Engineer) | 4 |

**執行過程解釋**:

1. **第一次迭代**: 初始成員執行，找到 `id=1` 的 Alice，`level` 為 1。結果集 `{ (1, 'Alice', NULL, 1) }` 被放入 `employee_hierarchy`。
2. **第二次迭代**: 遞迴成員執行，它查找 `manager_id` 在上一次結果集 `id` 中的員工。它找到了 `manager_id = 1` 的 Bob 和 Charlie。`level` 變為 `1 + 1 = 2`。結果集 `{ (2, 'Bob', 1, 2), (3, 'Charlie', 1, 2) }` 被 `UNION ALL` 到 `employee_hierarchy`。
3. **第三次迭代**: 遞迴成員再次執行，查找 `manager_id` 在上一次結果集 `id` 中的員工（即 `id` 為 2 或 3）。它找到了 `manager_id = 2` 的 David 和 Eve。`level` 變為 `2 + 1 = 3`。
4. **第四次迭代**: ... 依此類推，直到找到最底層的 Frank 和 Grace。
5. **第五次迭代**: 遞迴成員查找 `manager_id` 為 6 或 7 的員工，但找不到任何結果。遞迴成員返回空集，遞迴終止。
6. **最後**: 主查詢返回 `employee_hierarchy` 中累積的所有結果。

通過這種方式，遞迴 CTE 優雅地解決了需要遍歷整個樹狀或圖狀結構的複雜問題。
