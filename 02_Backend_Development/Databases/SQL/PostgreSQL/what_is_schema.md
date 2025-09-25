# 什麼是 PostgreSQL 中的模式 (Schema)？它有什麼用途？

- **難度**: 3
- **標籤**: `PostgreSQL`, `Schema`, `Database Design`

## 問題詳述

在 PostgreSQL 中，"模式 (Schema)" 是一個核心概念，它提供了 MySQL 等其他資料庫所沒有的額外命名空間層級。請解釋什麼是 PostgreSQL 的模式，以及它在資料庫管理和設計中有哪些實際用途。

## 核心理論與詳解

在許多資料庫系統中（如 MySQL），資料庫（Database）是組織資料表（Table）和其他物件的主要容器。而在 PostgreSQL 中，層級結構更為豐富：一個資料庫叢集（Cluster）可以包含多個資料庫（Database），而每個資料庫內部又可以包含多個 **模式（Schema）**。模式是真正容納資料表、視圖、函數、索引等物件的容器。

可以將這種結構類比為電腦的檔案系統：

- **資料庫叢集 (Cluster)**: 就像是你的整塊硬碟。
- **資料庫 (Database)**: 就像是硬碟上的一個分割區（如 C: 槽或 D: 槽）。不同的資料庫在邏輯上是完全隔離的。
- **模式 (Schema)**: 就像是分割區下的一個資料夾。
- **資料表 (Table) 等物件**: 就像是資料夾中的檔案。

預設情況下，當你連接到一個 PostgreSQL 資料庫並創建一個表時，它會被放在一個名為 `public` 的預設模式中。

### 模式 (Schema) 的主要用途

#### 1. 組織和管理資料庫物件

當一個資料庫需要服務於多個應用或包含大量物件時，模式提供了一個極佳的方式來進行邏輯分組。

- **按功能或模組劃分**: 你可以為應用程式的不同模組創建不同的模式。例如，一個大型 ERP 系統可以有 `billing`（帳務）、`inventory`（庫存）和 `hr`（人力資源）等多個模式。

  ```text
  my_erp_db
  ├── billing
  │   ├── invoices
  │   └── transactions
  ├── inventory
  │   ├── products
  │   └── warehouses
  └── hr
      ├── employees
      └── salaries
  ```

  這樣可以讓資料庫結構更清晰，易於理解和維護。

#### 2. 實現多租戶 (Multi-tenancy)

在 SaaS (軟體即服務) 應用中，一個常見的需求是為多個客戶（租戶）提供服務，同時要保證他們之間的資料隔離。使用模式是實現多租戶的一種高效策略。

- **每個租戶一個模式**: 你可以為每個租戶創建一個專屬的模式，所有該租戶的資料表都放在其模式下。

  ```text
  my_saas_db
  ├── tenant_alpha
  │   ├── users
  │   └── data
  ├── tenant_beta
  │   ├── users
  │   └── data
  └── public
      └── tenants_info
  ```

- **優點**:
  - **資料隔離**: 租戶之間的資料在邏輯上是完全分開的，查詢時不會混淆。
  - **易於管理**: 備份、還原或刪除一個租戶的資料變得非常簡單，只需操作對應的模式即可。
  - **共享底層資源**: 所有租戶共享同一個資料庫的資源，相比為每個租戶創建一個獨立資料庫，成本更低。

#### 3. 控制訪問權限

模式是 PostgreSQL 權限管理系統的一個重要層級。你可以為不同的使用者或角色（Role）授予對特定模式的訪問權限。

- **權限隔離**: 例如，你可以讓 `billing_team` 角色只能訪問 `billing` 模式下的物件，而 `hr_team` 角色只能訪問 `hr` 模式。

  ```sql
  -- 授予 billing_team 角色對 billing 模式的所有權限
  GRANT ALL ON SCHEMA billing TO billing_team;
  GRANT USAGE ON SCHEMA billing TO billing_team;

  -- 授予 billing_team 角色對 billing 模式下所有資料表的 SELECT 權限
  GRANT SELECT ON ALL TABLES IN SCHEMA billing TO billing_team;
  ```

  這提供了一種比逐個表授權更為簡潔和強大的安全管理方式。

#### 4. 避免命名衝突

由於不同的模式是獨立的命名空間，你可以在不同的模式中創建同名的資料表而不會產生衝突。

- **示例**: `billing.users` 和 `inventory.users` 可以是兩個完全不同的表。
- 這在開發和測試中特別有用。例如，你可以為一個新功能的開發創建一個臨時的模式，在其中創建和修改表，而不會影響到 `public` 模式中的正式資料表。

### 如何使用模式

- **創建模式**:

  ```sql
  CREATE SCHEMA my_schema;
  ```

- **在特定模式中創建表**:

  ```sql
  CREATE TABLE my_schema.my_table (id INT);
  ```

- **切換當前模式 (Search Path)**:
  `search_path` 是一個環境變數，它定義了當你引用一個物件（如資料表）而沒有指定模式時，PostgreSQL 應該按什麼順序去查找。

  ```sql
  -- 將 my_schema 設置為優先查找的模式，其次是 public 模式
  SET search_path TO my_schema, public;

  -- 現在執行這條語句，如果 my_schema 中存在 my_table，則會使用它
  -- 否則，會去 public 模式中查找
  SELECT * FROM my_table;
  ```

**總結**:
PostgreSQL 的模式是一個強大的命名空間和組織工具，它通過提供額外的邏輯層，極大地增強了資料庫的結構清晰度、安全性和多租戶支援能力，是其相較於許多其他 RDBMS 的一個顯著優勢。
