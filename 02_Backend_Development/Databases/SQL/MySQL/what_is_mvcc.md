# 什麼是 MVCC (多版本併發控制)？它是如何運作的？

- **難度**: 8
- **重要程度**: 5
- **標籤**: `MySQL`, `InnoDB`, `MVCC`, `Transaction`, `Concurrency`

## 問題詳述

MVCC (Multi-Version Concurrency Control, 多版本併發控制) 是現代資料庫中用於提升併發效能的關鍵技術，尤其在 InnoDB 儲存引擎中扮演著核心角色。請詳細解釋 MVCC 是什麼，它的主要目的是什麼，以及它在 InnoDB 中是如何通過 Undo Log 和 Read View 來實現的。

## 核心理論與詳解

傳統的併發控制機制嚴重依賴於鎖 (Locking) 來解決讀寫衝突。例如，當一個寫操作正在進行時，會阻塞所有其他的讀寫操作，反之亦然。這種「讀寫互斥」的策略極大地限制了資料庫的併發處理能力。

MVCC 的出現，旨在解決這個問題。它的核心思想是 **「讀寫不阻塞」**，讓讀操作不再需要等待寫操作完成，寫操作也不會阻塞讀操作，從而實現更高程度的併發。

### MVCC 的核心目標

- **在大多數情況下，用非鎖定的方式來處理讀寫衝突。**
- **實現讀已提交 (Read Committed) 和可重複讀 (Repeatable Read) 這兩種隔離級別。**

MVCC 的基本原理是為每一行資料保留多個「版本」。當一個交易需要讀取資料時，它會被引導去讀取一個對該交易可見的、符合其隔離級別要求的「歷史版本」，而不是直接讀取可能正在被其他交易所修改的「最新版本」。

### InnoDB 中 MVCC 的實現機制

InnoDB 的 MVCC 機制主要依賴於三個核心元件：**隱藏欄位**、**Undo Log** 和 **Read View**。

#### 1. 隱藏欄位 (Hidden Columns)

對於 InnoDB 中的每一行記錄，除了我們明確定義的欄位外，還存在幾個隱藏的欄位：

- **`DB_TRX_ID` (6-byte)**: 記錄了 **創建或最後一次修改** 該行記錄的交易 ID。
- **`DB_ROLL_PTR` (7-byte)**: 這是一個回滾指標 (Rollback Pointer)，指向該行記錄的上一個版本在 Undo Log 中的位置。通過這個指標，可以將所有歷史版本串聯起來，形成一個「版本鏈」。
- **`DB_ROW_ID` (6-byte)**: 如果表沒有明確定義主鍵，InnoDB 會自動生成一個隱藏的行 ID 作為主鍵。

#### 2. Undo Log (撤銷日誌)

Undo Log 在 MVCC 中扮演著至關重要的角色，它不僅用於交易的回滾，還用於構建資料的歷史版本。

- 當一個交易對某行資料進行 `UPDATE` 或 `DELETE` 操作時，InnoDB 不會直接覆蓋原始資料。
- 它會先將原始的資料行（舊版本）複製到 Undo Log 中。
- 然後，再修改聚簇索引中的原始資料行，並將新行的 `DB_TRX_ID` 設置為當前交易的 ID，同時 `DB_ROLL_PTR` 指向剛剛在 Undo Log 中創建的舊版本記錄。
- 這樣，一行資料的所有歷史版本就通過 `DB_ROLL_PTR` 串成了一個鏈表，稱為 **版本鏈**。

**示例**:
一個值為 10 的行，被 T1 修改為 20，再被 T2 修改為 30。
`[行資料: 30, TRX_ID: T2]` -> `[Undo Log: {行資料: 20, TRX_ID: T1}]` -> `[Undo Log: {行資料: 10, ...}]`

#### 3. Read View (一致性讀取視圖)

當一個交易開始（在 `可重複讀` 級別下）或執行第一條 `SELECT` 語句時（在 `讀已提交` 級別下），InnoDB 會為其創建一個名為 "Read View" 的快照。這個快照記錄了在 **創建這一刻**，系統中所有活躍的（即未提交的）交易 ID。

Read View 主要包含以下幾個重要屬性：

- **`m_ids`**: 創建 Read View 時，系統中所有活躍交易的 ID 列表。
- **`min_trx_id`**: `m_ids` 列表中的最小交易 ID。
- **`max_trx_id`**: 創建 Read View 時，系統預計要分配給下一個新交易的 ID (即當前最大交易 ID + 1)。
- **`creator_trx_id`**: 創建該 Read View 的交易本身的 ID。

#### 可見性判斷演算法

當一個交易（假設為 T_current）使用其 Read View 去讀取某一行資料時，它會沿著該行的版本鏈進行查找，並對每個版本進行如下的可見性判斷，直到找到第一個可見的版本為止：

1. **比較 `DB_TRX_ID` 與 `min_trx_id`**:
    - 如果 `DB_TRX_ID` < `min_trx_id`，意味著修改該版本的交易在 T_current 的 Read View 創建 **之前就已經提交了**。因此，該版本對 T_current **可見**。

2. **比較 `DB_TRX_ID` 與 `max_trx_id`**:
    - 如果 `DB_TRX_ID` >= `max_trx_id`，意味著修改該版本的交易在 T_current 的 Read View 創建 **之後才開始**。因此，該版本對 T_current **不可見**。

3. **比較 `DB_TRX_ID` 與 `m_ids` 列表**:
    - 如果 `min_trx_id` <= `DB_TRX_ID` < `max_trx_id`，這時需要判斷 `DB_TRX_ID` 是否存在於 `m_ids` 列表中。
      - 如果 **存在**，意味著修改該版本的交易在 T_current 的 Read View 創建時 **仍然活躍（未提交）**。因此，該版本對 T_current **不可見**。
      - 如果 **不存在**，意味著修改該版本的交易在 T_current 的 Read View 創建時 **已經提交了**。因此，該版本對 T_current **可見**。

4. **自身可見性**:
    - 如果 `DB_TRX_ID` 等於 `creator_trx_id`，意味著這是 T_current 自己做的修改。因此，該版本對 T_current **可見**。

通過這套機制，InnoDB 巧妙地為每個讀取操作提供了應有的資料版本，從而實現了讀寫不阻塞，並支援了「讀已提交」和「可重複讀」這兩種隔離級別。

- **讀已提交 (Read Committed)**: **每次** `SELECT` 都會創建一個新的 Read View。
- **可重複讀 (Repeatable Read)**: **只有在交易開始後的第一個** `SELECT` 時創建一個 Read View，後續所有 `SELECT` 都複用這個 Read View。這也是為什麼在該級別下可以實現「可重複讀」。
