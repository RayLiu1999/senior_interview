# Laravel 請求生命週期 (Request Lifecycle)

- **難度**: 6
- **重要性**: 4
- **標籤**: `Laravel`, `Framework`, `Lifecycle`

## 問題詳述

請詳細說明一個 HTTP 請求在 Laravel 框架中從開始到結束的完整處理流程。這包括了哪些關鍵階段？

## 核心理論與詳解

理解 Laravel 的請求生命週期對於開發、除錯以及效能優化至關重要。它描述了一個請求如何進入應用程式、經過處理、最終返回一個回應的完整路徑。

整個生命週期可以概括為以下幾個核心階段：

### 1. 請求入口 (Entry Point)

- **`public/index.php`**: 所有對 Laravel 應用的請求都會先經過這個檔案。它是整個框架的統一入口。
- **載入 Composer 自動載入器**: `index.php` 首先會引入 `vendor/autoload.php`，這個檔案由 Composer 產生，負責自動載入專案的所有依賴和類別。
- **啟動應用程式實例**: 接著，它會從 `bootstrap/app.php` 獲取 Laravel 應用程式的服務容器實例 (`Illuminate\Foundation\Application`)。這個實例是整個應用的核心，管理著所有的元件。

### 2. HTTP 核心 (HTTP Kernel)

- **建立 Kernel 實例**: 請求被傳遞到 HTTP 核心 (`App\Http\Kernel`)。HTTP 核心繼承自 `Illuminate\Foundation\Http\Kernel`，可以看作是圍繞著應用程式核心的一個「黑盒子」。
- **處理請求**: Kernel 的 `handle()` 方法是生命週期的核心。它接收一個 `Illuminate\Http\Request` 物件。
- **啟動引導程式 (Bootstrappers)**: 在處理請求之前，Kernel 會執行一系列的「引導程式」(Bootstrappers)。這些引導程式負責設定框架的各個部分，例如：
    - `LoadEnvironmentVariables`: 載入 `.env` 檔案中的環境變數。
    - `LoadConfiguration`: 載入 `config/` 目錄下的所有設定檔。
    - `HandleExceptions`: 設定例外處理機制。
    - `RegisterFacades`: 註冊所有的門面 (Facades)。
    - `RegisterProviders`: 註冊並啟動所有的服務提供者 (Service Providers)。
    - `BootProviders`: 執行所有服務提供者的 `boot()` 方法。

### 3. 服務提供者 (Service Providers)

- **核心註冊點**: 服務提供者 (`App\Providers`) 是 Laravel 啟動過程的中心。幾乎所有的框架功能，如資料庫、隊列、路由、視圖等，都是透過服務提供者來註冊和設定的。
- **`register()` vs `boot()`**:
    - **`register()` 方法**: 在此方法中，您**只應該**將事物綁定到服務容器中。不應該嘗試註冊任何事件監聽器、路由或執行任何其他功能，因為此時可能還沒有準備好所有依賴。
    - **`boot()` 方法**: 此方法在所有服務提供者都已經被註冊**之後**才會被呼叫。這意味著您可以在這裡存取已經被註冊的所有其他服務。大部分的設定工作，如註冊路由模型綁定、視圖合成器等，都在這個階段完成。

### 4. 路由與中介層 (Routing & Middleware)

- **分派請求**: HTTP 核心將請求傳遞給路由器 (`Illuminate\Routing\Router`)。
- **路由匹配**: 路由器會根據請求的 URI 和 HTTP 方法，在 `routes/` 目錄下定義的路由中尋找匹配的項目。
- **執行全域中介層**: 在請求到達具體的路由之前，它會先穿過在 `$middleware` 屬性 (`App\Http\Kernel.php`) 中定義的全域中介層 (Global Middleware)。例如 `CheckForMaintenanceMode`。
- **執行路由中介層**: 如果匹配到的路由被分配了中介層（群組或單獨指定），請求會接著穿過這些中介層。中介層提供了一個強大的機制來過濾和檢查 HTTP 請求，例如身份驗證 (`auth`)、CSRF 保護等。

### 5. 控制器與業務邏輯 (Controller & Business Logic)

- **執行控制器方法**: 路由匹配成功並通過所有中介層後，路由器會呼叫對應的控制器方法或閉包。
- **依賴注入**: Laravel 的服務容器會自動解析控制器方法中的型別提示 (Type-hinted) 依賴，實現依賴注入。例如，您可以直接在方法簽章中注入 `Illuminate\Http\Request` 物件或自訂的服務。
- **執行業務邏輯**: 這是應用程式處理請求、與模型互動、執行業務規則的地方。

### 6. 回應 (Response)

- **產生回應**: 控制器方法返回的結果會被自動轉換為一個 `Illuminate\Http\Response` 物件。
    - 如果返回的是一個**字串或陣列**，Laravel 會自動建立一個帶有 `200 OK` 狀態碼的回應。
    - 如果返回的是一個 **Eloquent 集合**，它會被自動轉換為 JSON。
    - 如果返回的是一個**視圖** (`view()`)，Laravel 會渲染該視圖並建立回應。
- **回應穿過中介層**: 產生的回應在發送給使用者之前，會以「相反」的順序再次穿過之前經過的所有中介層。這讓中介層有機會在最後一刻修改即將發送的回應（例如，添加特定的 HTTP 標頭）。

### 7. 終止 (Termination)

- **發送回應**: HTTP 核心的 `handle()` 方法返回 `Response` 物件，`public/index.php` 呼叫 `send()` 方法將回應內容發送給使用者的瀏覽器。
- **執行 `terminate` 任務**: 在回應發送之後，HTTP 核心會呼叫 `terminate()` 方法。這個階段允許執行一些「收尾」工作，例如在 `App\Http\Kernel` 中定義的 `terminable` 中介層，或是觸發 `terminating` 事件。這對於處理一些不需要立即完成的慢速任務（如寫入日誌、更新快取）非常有用，因為它不會阻塞對使用者的回應。

## 程式碼範例 (可選)

一個極簡化的 `public/index.php` 結構看起來像這樣：

```php
<?php

// 1. 載入自動載入器
require __DIR__.'/../vendor/autoload.php';

// 2. 啟動應用程式
$app = require_once __DIR__.'/../bootstrap/app.php';

// 3. 建立 HTTP 核心
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// 4. 處理請求並獲取回應
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

// 5. 發送回應
$response->send();

// 6. 執行終止任務
$kernel->terminate($request, $response);
```
