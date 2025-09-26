# Laravel 服務容器 (Service Container) 與 依賴注入 (IoC)

- **難度**: 8
- **重要性**: 5
- **標籤**: `Laravel`, `IoC`, `Service Container`, `Dependency Injection`

## 問題詳述

什麼是控制反轉 (IoC)？Laravel 的服務容器 (Service Container) 如何實現 IoC？請解釋綁定 (Binding) 和解析 (Resolving) 的概念，並舉例說明其在 Laravel 中的實際應用。

## 核心理論與詳解

服務容器是 Laravel 框架最核心、最強大的功能之一。它是一個用於管理類別依賴和執行依賴注入的工具。要理解服務容器，首先需要理解其背後的設計原則：**控制反轉 (Inversion of Control, IoC)**。

### 什麼是控制反轉 (IoC)？

在傳統的程式設計中，一個物件通常會在其內部自己建立它所依賴的其他物件。例如：

```php
class UserController {
    protected $paymentService;

    public function __construct() {
        // UserController 主動建立 PaymentService 物件
        $this->paymentService = new StripePaymentService();
    }

    public function store() {
        $this->paymentService->charge();
    }
}
```

這種方式有幾個明顯的缺點：
- **高耦合**: `UserController` 與 `StripePaymentService` 緊密耦合。如果我們想更換成 `BraintreePaymentService`，就必須修改 `UserController` 的程式碼。
- **不易測試**: 在進行單元測試時，我們無法輕易地用一個模擬 (Mock) 的支付服務來替換真實的服務。

**控制反轉**則將這個「控制權」反轉過來。物件不再自己建立依賴，而是將建立依賴的「控制權」交給外部的第三方（即 IoC 容器）。物件本身只宣告它需要什麼，由容器來負責實例化並「注入」這些依賴。

**依賴注入 (Dependency Injection, DI)** 是實現 IoC 的一種最常見的設計模式。依賴不是在內部建立，而是透過建構子、Setter 方法或屬性傳遞進來。

```php
interface PaymentService {
    public function charge();
}

class UserController {
    protected $paymentService;

    // 依賴透過建構子被「注入」
    public function __construct(PaymentService $paymentService) {
        $this->paymentService = $paymentService;
    }
    // ...
}
```

現在 `UserController` 不再關心 `PaymentService` 的具體實現是什麼，它只依賴於 `PaymentService` 這個介面。控制權被反轉給了建立 `UserController` 的外部程式碼。

### Laravel 的服務容器

Laravel 的服務容器 (`Illuminate\Container\Container`) 就是實現 IoC 的那個「外部第三方」。它主要負責兩件事：

1.  **綁定 (Binding)**: 告訴容器**如何**去建立一個物件。
2.  **解析 (Resolving)**: 從容器中**獲取**一個物件實例。當解析時，容器會自動處理該物件的所有依賴。

#### 綁定 (Binding)

綁定是在服務容器中註冊一個「配方」，告訴它當需要某個類別或介面時，應該如何去實例化它。綁定通常在服務提供者 (`ServiceProvider`) 的 `register` 方法中完成。

**1. 基礎綁定 (Basic Binding)**

最簡單的綁定是將一個「型別」(通常是介面) 綁定到一個「具體實現」(類別)。

```php
// 在 App\Providers\AppServiceProvider.php 的 register() 方法中
use App\Services\StripePaymentService;
use App\Interfaces\PaymentService;

$this->app->bind(PaymentService::class, StripePaymentService::class);
```
這段程式碼告訴容器：「當有任何程式碼需要 `PaymentService` 介面時，請給它一個 `StripePaymentService` 的實例。」

**2. 單例綁定 (Singleton Binding)**

`bind` 方法每次從容器解析時都會建立一個**新的**實例。如果希望在整個請求生命週期中只建立一個共享的實例，應該使用 `singleton` 方法。

```php
$this->app->singleton(PaymentService::class, StripePaymentService::class);
```
這對於資料庫連線、設定管理等需要共享狀態的服務非常有用。

**3. 介面綁定到實例 (Binding an Instance)**

您也可以將一個已經建立好的物件實例直接綁定到容器中。

```php
$service = new StripePaymentService('your-api-key');
$this->app->instance(PaymentService::class, $service);
```
該實例將在後續的解析中被共享，類似於單例。

#### 解析 (Resolving)

解析就是從容器中取出物件實例的過程。Laravel 在框架的許多地方都為我們自動進行解析，我們很少需要手動操作。

**1. 自動解析 (Automatic Resolution)**

Laravel 最強大的功能是**零設定解析 (Zero-configuration resolution)**。如果一個類別沒有被明確綁定在容器中，容器會嘗試使用 PHP 的**反射 (Reflection)** 機制來檢查其建構子，並自動解析其所有依賴。

這就是為什麼我們可以在控制器或任何由容器解析的類別的建構子中，直接對依賴進行型別提示 (Type-hint)，而不需要做任何額外設定。

```php
class UserController extends Controller
{
    // Laravel 容器會自動讀取到這裡需要一個 PaymentService
    // 然後它會檢查容器的綁定，發現 PaymentService 被綁定到了 StripePaymentService
    // 於是容器會實例化 StripePaymentService 並將其注入
    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }
}
```

**2. 手動解析**

在某些情況下，我們也可能需要手動從容器中解析物件。

- **`app()` 輔助函數**:
  ```php
  $paymentService = app(PaymentService::class);
  ```

- **`resolve()` 輔助函數**:
  ```php
  $paymentService = resolve(PaymentService::class);
  ```

- **`make()` 方法**:
  ```php
  $paymentService = $this->app->make(PaymentService::class);
  ```

### 實際應用場景

- **控制器依賴注入**: 最常見的應用，自動注入服務、儲存庫 (Repository) 等。
- **路由模型綁定**: 當您在路由定義中對 Eloquent 模型進行型別提示時，Laravel 會自動查詢並注入對應的模型實例。
- **中介層**: 中介層的建構子也可以注入依賴。
- **事件監聽器、隊列任務**: 這些類別都是由容器解析的，因此可以輕鬆注入依賴。
- **門面 (Facades)**: Facades 的底層原理就是從服務容器中解析一個物件並呼叫其方法。

### 結論

Laravel 的服務容器透過實現控制反轉和依賴注入，極大地降低了應用程式各元件之間的耦合度，提高了程式碼的可測試性、可維護性和靈活性。理解其「綁定」和「解析」的核心概念，是掌握 Laravel 框架精髓的關鍵一步。
