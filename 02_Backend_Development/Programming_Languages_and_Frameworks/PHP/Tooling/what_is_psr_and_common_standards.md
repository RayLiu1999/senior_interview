# 什麼是 PSR？請列舉並解釋幾個重要的 PSR 標準 (例如 PSR-4, PSR-7, PSR-12)

- **難度**: 5
- **標籤**: `PHP`, `PSR`, `Standards`, `Interoperability`

## 問題詳述

在 PHP 社群中，PSR 是一個經常被提及的術語，它對現代 PHP 的發展產生了深遠的影響。請解釋什麼是 PSR？它由哪個組織制定？它的主要目標是什麼？並請詳細介紹 PSR-4、PSR-7 和 PSR-12 這三個在現代 PHP 開發中至關重要的標準。

## 核心理論與詳解

### 1. 什麼是 PSR？

PSR 的全稱是 **PHP Standard Recommendation** (PHP 標準建議)。它是由一個名為 **PHP-FIG (PHP Framework Interop Group)** 的組織制定的一系列建議規範。

- **PHP-FIG**: 這個組織的成員由許多主流的 PHP 框架和專案的代表組成（例如 Laravel, Symfony, Composer, Drupal 等）。
- **目標**: PSR 的核心目標是實現 **互操作性 (Interoperability)**。也就是說，讓由不同開發者、不同團隊、不同框架開發的 PHP 元件能夠順利地協同工作。它通過定義一系列通用的介面和編碼風格標準來達成此目的。

PSR **不是** 強制性的規定，而是一種社群共識。遵循 PSR 標準可以讓你的程式碼更容易被其他 PHP 開發者理解，也更容易整合到現代的框架和專案中。

### 2. 重要的 PSR 標準詳解

#### PSR-4: Autoloader (自動載入器)

PSR-4 是目前 PHP 世界中 **最重要、最基礎** 的標準之一。它定義了一個標準化的方式，將 **命名空間 (Namespace)** 對應到 **檔案路徑**，從而實現類別的自動載入。

**核心規則**:

- 一個完整的類別名稱（Fully Qualified Class Name）格式為 `\<VendorName>\(<Namespace>\)*\<ClassName>`。
- 這個類別名稱必須對應一個 **基礎目錄 (base directory)**。
- 命名空間中的每一層對應一個子目錄。
- 類別名稱 `ClassName` 對應一個 `.php` 檔案，例如 `ClassName.php`。
- 所有字母大小寫必須完全匹配。

**範例**:

假設我們的 `composer.json` 中有如下設定：

```json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    }
}
```

這條規則告訴自動載入器（通常是 Composer 提供的）：

- **VendorName + Namespace**: `App\`
- **對應的基礎目錄**: `src/`

根據這個規則：

- 類別 `App\Http\Controllers\UserController` 會被對應到檔案路徑 `src/Http/Controllers/UserController.php`。
- 類別 `App\Models\User` 會被對應到檔案路徑 `src/Models/User.php`。

當程式碼中第一次使用 `App\Http\Controllers\UserController` 時，Composer 的自動載入器就會根據這個規則去尋找並 `require` 對應的檔案。這使得開發者不再需要手動編寫大量的 `require_once` 語句。

#### PSR-7: HTTP Message Interfaces (HTTP 訊息介面)

PSR-7 致力於標準化 PHP 處理 HTTP 請求和回應的方式。它提供了一系列的介面，用來描述一個不可變的 (immutable) HTTP 訊息。

**核心介面**:

- `Psr\Http\Message\RequestInterface`: 代表一個傳入的、來自客戶端的 HTTP 請求。
- `Psr\Http\Message\ResponseInterface`: 代表一個將要發送給客戶端的 HTTP 回應。
- `Psr\Http\Message\UriInterface`: 代表請求的 URI。
- `Psr\Http\Message\StreamInterface`: 代表訊息的主體 (body)，以流的方式處理，可以高效處理大檔案。
- `Psr\Http\Message\UploadedFileInterface`: 代表上傳的檔案。

### 關鍵特性：不可變性 (Immutability)

PSR-7 的一個核心設計哲學是 **不可變性**。所有實現了 PSR-7 介面的物件都是不可變的。這意味著任何對請求或回應物件的修改（例如，增加一個標頭、改變 URI）都會返回一個 **新的** 物件實例，而原始物件保持不變。

```php
// $request 是一個實現了 RequestInterface 的物件
$newRequest = $request->withHeader('X-Custom-Header', 'MyValue');

// $request 保持不變
// $newRequest 是一個包含了新標頭的全新請求物件
```

**好處**:

- **可預測性**: 確保了在處理流程中（尤其是在經過多個中介軟體時），請求或回應物件的狀態不會被意外修改，增加了程式碼的穩定性和可預測性。
- **互操作性**: 任何接受 `RequestInterface` 的中介軟體或元件，都可以確信它處理的請求是標準的、可靠的，並且可以安全地傳遞給下一個處理環節。

#### PSR-12: Extended Coding Style (擴展編碼風格)

PSR-12 是對早期 PSR-2 的擴展和取代，它提供了非常具體的編碼風格指導，旨在讓所有 PHP 開發者的程式碼看起來都像同一個人寫的。

**主要規則摘要**:

- **檔案**:
  - 所有 PHP 檔案必須使用 `<?php` 標籤。
  - 檔案必須使用 UTF-8 無 BOM 編碼。
  - 檔案應該只定義類別、函式、常數等聲明，或者只執行有副作用的邏輯，但不能兩者都做。
- **命名空間與 `use` 聲明**:
  - `namespace` 聲明之後必須有一行空行。
  - `use` 聲明必須在 `namespace` 之後。
  - 每個 `use` 聲明必須在單獨的一行。
- **類別、屬性、方法**:
  - 類別的大括號 `{` 必須在類別名稱後換行。
  - 方法的大括號 `{` 必須在方法簽名後換行。
  - 必須明確聲明所有屬性和方法的 `visibility` (`public`, `protected`, `private`)。
  - 方法和函式參數列表的括號前後不應有空格。
- **控制結構**:
  - `if`, `elseif`, `else`, `for`, `foreach`, `while` 等關鍵字後必須有一個空格。
  - 控制結構的大括號 `{` 必須在同一行。
  - `else if` 應寫成 `elseif`。
- **程式碼格式**:
  - 使用 4 個空格進行縮排，而不是 Tab。
  - 行長度建議不超過 120 個字元。
  - 陣列的最後一個元素後面允許有結尾逗號（trailing comma），方便版本控制。

**範例**:

```php
<?php

namespace App\Http;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class MyController
{
    public function myAction(ServerRequestInterface $request): ResponseInterface
    {
        if ($request->getMethod() === 'POST') {
            // 處理邏輯
        }

        // ...
    }
}
```

遵循 PSR-12 可以極大地提高程式碼的可讀性和團隊協作效率。像 PHP-CS-Fixer 和 PHP_CodeSniffer 這樣的工具可以自動檢查和修正程式碼以符合 PSR-12 標準。
