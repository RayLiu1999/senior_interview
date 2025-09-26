# Laravel 中介層 (Middleware) 詳解

- **難度**: 5
- **重要性**: 5
- **標籤**: `Laravel`, `Middleware`, `HTTP`

## 問題詳述

什麼是 Laravel 的中介層 (Middleware)？它的主要用途是什麼？請解釋中介層的類型（全域、路由群組、路由），並說明如何建立和註冊一個自訂的中介層。

## 核心理論與詳解

中介層是 Laravel 框架中一個極其重要且強大的概念。它提供了一種過濾進入應用程式的 HTTP 請求的機制，可以把它想像成洋蔥的一層層外皮：請求在到達最終目的地（控制器）之前，必須先穿過這些層，而回應在返回給使用者之前，也需要反向穿過這些層。

### 中介層的主要用途

中介層的核心職責是在請求處理流程中插入自訂的邏輯，常見的應用包括：

- **身份驗證**: 檢查使用者是否已登入，如果未登入則將其重導向到登入頁面。
- **授權**: 檢查已登入的使用者是否有權限執行特定操作。
- **CORS (跨來源資源共用)**: 為回應添加必要的 CORS 標頭，以允許來自不同網域的 Ajax 請求。
- **日誌記錄**: 記錄所有傳入的請求資訊。
- **請求修改**: 在請求到達控制器前，修改請求的標頭或參數。
- **維護模式**: 檢查應用程式是否處於維護模式，並返回適當的提示。

### 中介層的類型

Laravel 提供了三種不同範圍的中介層，它們都在 `app/Http/Kernel.php` 這個檔案中進行註冊。

#### 1. 全域中介層 (Global Middleware)

- **定義**: 這些中介層會對應用程式的**每一個** HTTP 請求執行。
- **註冊**: 在 `Kernel.php` 的 `$middleware` 屬性中註冊。
- **範例**:
    - `CheckForMaintenanceMode`: 檢查維護模式。
    - `TrimStrings`: 自動移除請求參數前後的空白。
    - `ConvertEmptyStringsToNull`: 將空的請求字串轉換為 `null`。

```php
// app/Http/Kernel.php
protected $middleware = [
    \App\Http\Middleware\TrustProxies::class,
    \App\Http\Middleware\CheckForMaintenanceMode::class,
    // ...
];
```

#### 2. 路由群組中介層 (Route Group Middleware)

- **定義**: 這些中介層可以被分配給一組路由，為這組路由提供共同的功能。
- **註冊**: 在 `Kernel.php` 的 `$middlewareGroups` 屬性中定義群組，或在 `$routeMiddleware` 中註冊後於路由檔案中直接使用。
- **範例**:
    - `web` 群組: 包含了處理 Session、CSRF 保護、Cookie 加密等適用於 Web UI 的中介層。
    - `api` 群組: 包含了 `throttle:60,1`（頻率限制）等適用於 API 的中介層。

```php
// app/Http/Kernel.php
protected $middlewareGroups = [
    'web' => [
        \App\Http\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
        \Illuminate\Session\Middleware\StartSession::class,
        // ...
    ],
    'api' => [
        'throttle:60,1',
        'bindings',
    ],
];
```

在路由檔案 (`routes/web.php`) 中使用：
```php
Route::middleware(['web'])->group(function () {
    // 這個群組內的所有路由都會應用 'web' 中介層
});
```

#### 3. 路由中介層 (Route Middleware)

- **定義**: 這些中介層可以被分配給單一的路由，提供更細粒度的控制。
- **註冊**: 在 `Kernel.php` 的 `$routeMiddleware` 屬性中為中介層指定一個「別名」。
- **範例**:
    - `auth`: 確保使用者已登入。
    - `guest`: 確保使用者是訪客（未登入）。
    - `can`: 檢查使用者權限（基於 Gate）。

```php
// app/Http/Kernel.php
protected $routeMiddleware = [
    'auth' => \App\Http\Middleware\Authenticate::class,
    'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
    'can' => \Illuminate\Auth\Middleware\Authorize::class,
];
```

在路由檔案 (`routes/web.php`) 中使用：
```php
Route::get('/profile', function () {
    //
})->middleware('auth');
```

### 建立自訂中介層

#### 1. 產生中介層檔案

使用 Artisan 命令來建立一個新的中介層：
```bash
php artisan make:middleware EnsureTokenIsValid
```
這會在 `app/Http/Middleware` 目錄下建立一個 `EnsureTokenIsValid.php` 檔案。

#### 2. 撰寫中介層邏輯

打開該檔案，核心邏輯寫在 `handle` 方法中。

```php
<?php

namespace App\Http\Middleware;

use Closure;

class EnsureTokenIsValid
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        // 請求前階段 (Before Middleware)
        if ($request->input('token') !== 'my-secret-token') {
            // 如果 token 不正確，直接返回一個錯誤回應
            return redirect('home');
        }

        // 將請求傳遞給下一個中介層或控制器
        $response = $next($request);

        // 請求後階段 (After Middleware)
        // 在這裡可以修改最終的回應
        // $response->header('X-Custom-Header', 'value');

        return $response;
    }
}
```
- **`$request`**: 當前的 HTTP 請求物件。
- **`$next`**: 一個 `Closure` (閉包)，代表了「下一層」的中介層或最終的控制器。呼叫 `$next($request)` 會將請求傳遞下去，並返回處理後的 `Response`。
- **請求前 (Before) vs 請求後 (After)**: 在 `$next($request)` **之前**的程式碼屬於「請求前」階段，可以在請求到達控制器前進行攔截或修改。在 `$next($request)` **之後**的程式碼屬於「請求後」階段，可以在回應發送給使用者前進行修改。

#### 3. 註冊中介層

為了讓 Laravel 知道這個中介層的存在，需要為它註冊一個別名。

```php
// app/Http/Kernel.php
protected $routeMiddleware = [
    'auth' => \App\Http\Middleware\Authenticate::class,
    'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
    // ...
    'token' => \App\Http\Middleware\EnsureTokenIsValid::class, // 在這裡加上
];
```

#### 4. 使用中介層

現在就可以在路由中使用這個 `token` 別名了。

```php
Route::get('/admin/dashboard', function () {
    // 只有帶有正確 token 的請求才能到達這裡
})->middleware('token');
```

### 結論

中介層是 Laravel 中一個優雅且強大的設計，它允許開發者以一種乾淨、可組合的方式來過濾和處理 HTTP 請求。透過理解不同類型的中介層以及如何建立和註冊它們，您可以更有效地構建安全、模組化的 Laravel 應用程式。
