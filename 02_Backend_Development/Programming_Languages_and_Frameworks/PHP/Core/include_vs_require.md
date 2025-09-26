# `include`, `require`, `include_once`, `require_once` 的區別是什麼？

- **難度**: 2
- **重要程度**: 3
- **標籤**: `PHP`, `Core`

## 問題詳述

在 PHP 中，有四個用於引入外部檔案的語言結構：`include`, `require`, `include_once`, 和 `require_once`。請詳細解釋它們之間的主要區別，特別是在錯誤處理和重複引入方面的不同行為。

## 核心理論與詳解

這四個語言結構的核心功能都是將一個外部檔案的內容載入並執行，但它們在兩個關鍵維度上有所不同：**錯誤處理的嚴格性** 和 **是否允許重複引入**。

我們可以將它們分為兩組來理解：`include` vs `require` 和 `_once` 的作用。

### 1. 錯誤處理的嚴格性: `include` vs `require`

這是兩者最本質的區別，體現在當目標檔案不存在或無法讀取時的處理方式。

- **`require`**:
  - **行為**: 如果 `require` 指定的檔案找不到，它會產生一個 **E_COMPILE_ERROR** 等級的 **致命錯誤 (Fatal Error)**。
  - **結果**: 腳本的執行會 **立即終止**，後續的程式碼將不會被執行。
  - **使用場景**: 用於引入應用程式運行所必需的核心檔案，例如資料庫設定、核心函數庫、類別自動載入器等。如果這些檔案缺失，整個應用程式就無法正常運作，因此立即停止是合理的行為。

- **`include`**:
  - **行為**: 如果 `include` 指定的檔案找不到，它會產生一個 **E_WARNING** 等級的 **警告 (Warning)**。
  - **結果**: 腳本的執行 **會繼續**，不會中斷。
  - **使用場景**: 用於引入非必要的、可選的檔案，例如在網頁中引入模板片段（頁首、頁尾）。如果模板檔案缺失，你可能希望頁面的其餘部分仍然能夠呈現，而不是顯示一個致命錯誤。

### 2. 重複引入的處理: `_once` 後綴

`_once` 後綴的作用是確保同一個檔案在一次請求的生命週期中只被引入一次。

- **`require_once`** 和 **`include_once`**:
  - **行為**: 在引入檔案之前，PHP 會檢查這個檔案的路徑是否已經被引入過。
  - **結果**:
    - 如果檔案 **從未被引入**，則正常引入並執行。
    - 如果檔案 **已經被引入**，則直接忽略本次引入操作，不會再次載入和執行。
  - **使用場景**: 這是現代 PHP 開發中的最佳實踐。當你定義函數、類別或常數時，重複引入會導致「Cannot redeclare...」之類的致命錯誤。使用 `_once` 版本可以從根本上避免這個問題，確保程式碼的健壯性。

### 總結表格

| 結構 | 檔案不存在時的行為 | 重複引入行為 | 適用場景 |
| :--- | :--- | :--- | :--- |
| `include` | **警告 (Warning)**，腳本繼續執行 | 允許重複引入 | 引入可選的模板檔案 (View) |
| `require` | **致命錯誤 (Fatal Error)**，腳本終止 | 允許重複引入 | 引入應用程式必需的核心檔案 |
| `include_once` | **警告 (Warning)**，腳本繼續執行 | **僅引入一次** | 引入可選的、但包含定義的檔案 |
| `require_once` | **致命錯誤 (Fatal Error)**，腳本終止 | **僅引入一次** | **推薦**：引入所有定義類別、函數、常數的核心檔案 |

## 程式碼範例 (可選)

```php
<?php
// 範例 1: 演示 include vs require 的錯誤處理

echo "1. 嘗試 include 一個不存在的檔案...\n";
include 'non_existent_file.php'; // 將會產生一個 Warning
echo "2. include 之後的程式碼仍然會執行。\n\n";

echo "3. 嘗試 require 一個不存在的檔案...\n";
require 'non_existent_file.php'; // 將會產生一個 Fatal Error
echo "4. require 之後的程式碼將永遠不會被執行。\n";

?>
```

**執行範例 1 的輸出**:

```text
1. 嘗試 include 一個不存在的檔案...
Warning: include(non_existent_file.php): Failed to open stream: No such file or directory in ... on line 4
Warning: include(): Failed opening 'non_existent_file.php' for inclusion (include_path='...') in ... on line 4
2. include 之後的程式碼仍然會執行。

3. 嘗試 require 一個不存在的檔案...
Fatal error: require(): Failed opening required 'non_existent_file.php' (include_path='...') in ... on line 9
```

**經驗法則**:
在現代 PHP 開發中，特別是遵循 PSR-4 自動載入標準的專案，你應該總是優先使用 `require_once` 來引入啟動檔案或設定檔，而類別和函數的載入則交給 Composer 的自動載入器處理，手動引入檔案的場景已大幅減少。
