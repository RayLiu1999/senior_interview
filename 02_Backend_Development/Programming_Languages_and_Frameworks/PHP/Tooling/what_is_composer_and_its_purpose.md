# Composer 是什麼以及它的主要作用是什麼？

- **難度**: 4
- **標籤**: `PHP`, `Tooling`, `Dependency Management`

## 問題詳述

在現代 PHP 開發中，Composer 幾乎是不可或缺的工具。請解釋 Composer 是什麼，它的核心作用是什麼？並說明 `composer.json` 和 `composer.lock` 這兩個關鍵檔案的用途以及它們之間的關係。

## 核心理論與詳解

### 1. Composer 是什麼？

Composer 是 PHP 的一個 **依賴管理工具 (Dependency Manager)**。它允許開發者聲明專案所依賴的外部函式庫 (libraries) 和套件 (packages)，並由 Composer 負責安裝、更新和管理這些依賴。

在沒有 Composer 的時代，PHP 開發者需要手動下載外部函式庫的原始碼，將其放置在專案的特定目錄中，並手動處理 `include` 或 `require` 路徑。這個過程不僅繁瑣，而且難以管理版本和處理依賴之間的依賴（即「依賴的依賴」）。

Composer 的出現徹底改變了這一點。它借鑒了其他語言生態系中成熟的套件管理器思想（如 Node.js 的 npm，Ruby 的 Bundler），為 PHP 提供了一個標準化、自動化的依賴管理解決方案。

### 2. Composer 的核心作用

Composer 的主要作用可以歸納為以下幾點：

- **依賴聲明與安裝**: 開發者只需在 `composer.json` 檔案中聲明專案需要哪些套件以及可接受的版本範圍，Composer 就會自動從 Packagist (PHP 套件的官方儲存庫) 或其他來源下載並安裝它們。
- **自動載入 (Autoloading)**: Composer 會生成一個 `vendor/autoload.php` 檔案。開發者只需在專案的入口檔案中引入這個檔案，就可以按需自動載入所有透過 Composer 安裝的函式庫中的類別，無需手動編寫大量的 `require` 或 `include` 語句。這通常基於 [PSR-4](https://www.php-fig.org/psr/psr-4/) 自動載入規範。
- **版本控制**: Composer 允許開發者指定依賴的版本約束（例如 `^1.3`, `~2.0`, `>=4.2`），確保專案在不同環境中使用相容的函式庫版本。
- **環境一致性**: 透過 `composer.lock` 檔案，Composer 能夠確保團隊中的每個成員、以及在開發、測試和生產環境中，都使用完全相同版本的依賴，避免了「在我電腦上可以跑」的問題。
- **腳本執行**: Composer 允許在 `composer.json` 中定義自訂腳本，可以在安裝或更新過程中的特定時間點執行，例如清除快取、執行資料庫遷移等。

### 3. `composer.json` vs `composer.lock`

這兩個檔案是 Composer 工作流程的核心，理解它們的區別至關重要。

#### `composer.json`

- **用途**: **定義專案的依賴和元數據**。這是一個手動維護的檔案。
- **核心內容**:
  - `require`: 聲明專案在 **生產環境** 中必須的套件。例如，一個框架 (Laravel, Symfony)、一個日誌記錄器 (Monolog)。
  - `require-dev`: 聲明僅在 **開發環境** 中需要的套件。例如，測試框架 (PHPUnit)、除錯工具 (Whoops)。
  - `autoload`: 定義專案自身的命名空間與檔案路徑的對應關係，以便 Composer 的自動載入器可以找到專案的類別。
  - `scripts`: 定義自訂腳本。
- **版本約束**: 在這裡，開發者通常會使用較為寬鬆的版本約束，例如 `^7.0`。這表示「安裝 7.0 或以上，但小於 8.0 的任何穩定版本」。這允許專案在執行 `composer update` 時可以獲取到最新的非破壞性更新。

**範例 `composer.json`**:

```json
{
    "name": "my-vendor/my-project",
    "description": "A sample project.",
    "require": {
        "php": ">=8.1",
        "monolog/monolog": "^2.8"
    },
    "require-dev": {
        "phpunit/phpunit": "^9.5"
    },
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    }
}
```

#### `composer.lock`

- **用途**: **鎖定專案當前安裝的每個依賴的確切版本**。這個檔案是 **由 Composer 自動生成和管理的**，不應該手動修改。
- **核心作用**: **確保環境一致性**。當 `composer.lock` 檔案存在時，執行 `composer install` 命令會忽略 `composer.json` 中的版本約束，而是直接安裝 `composer.lock` 中記錄的 **精確版本**。
- **生成時機**:
  - 當你第一次在沒有 `composer.lock` 的專案中執行 `composer install` 時，Composer 會根據 `composer.json` 的規則解析出最新的相容版本，安裝它們，然後將這些精確的版本號寫入 `composer.lock`。
  - 當你執行 `composer update` 時，Composer 會忽略 `composer.lock`，重新根據 `composer.json` 的規則尋找最新的版本進行安裝，然後用新的版本資訊 **覆蓋** `composer.lock`。

### 總結與最佳實踐

- **`composer.json`**: 描述你的專案 **想要** 什麼。
- **`composer.lock`**: 記錄你的專案 **實際安裝** 了什麼。

**團隊協作流程**:

1. 將 `composer.json` 和 `composer.lock` **都** 提交到版本控制系統 (如 Git)。
2. 當團隊成員拉取最新程式碼後，他們應該執行 `composer install`。這會讀取 `composer.lock` 檔案，確保他們安裝的依賴版本與你完全一致。
3. 只有當需要升級專案的依賴時，才由指定的開發者執行 `composer update`，然後將更新後的 `composer.lock` 檔案提交，通知團隊其他成員再次執行 `composer install` 以同步更新。

遵循這個流程，可以最大限度地保證開發、測試和部署環境的一致性，減少因依賴版本不同而導致的潛在問題。
