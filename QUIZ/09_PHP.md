# PHP - 重點考題 (Quiz)

> 這份考題是從 PHP 程式語言章節中挑選出**重要程度 4-5** 的核心題目，設計成自我測驗的形式。
> 
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

## 🎯 核心特性 (Core)

### Q1: PHP 8+ 有哪些重要的新特性？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請列舉 PHP 8.0、8.1、8.2 的主要新特性，並說明其用途。

<details>
<summary>💡 答案提示</summary>

**PHP 8.0 重要特性**：

| 特性 | 說明 |
|------|------|
| **JIT 編譯器** | 即時編譯，提升 CPU 密集運算性能 |
| **Union Types** | `int\|string` 聯合類型 |
| **Named Arguments** | `foo(name: 'value')` 具名參數 |
| **Attributes** | `#[Route('/api')]` 原生註解 |
| **Match 表達式** | 更安全的 switch 替代方案 |
| **Nullsafe Operator** | `$user?->address?->city` |
| **Constructor Promotion** | 建構函數參數直接成為屬性 |

**PHP 8.1 新特性**：

- **Enums**：原生列舉類型
- **Fibers**：輕量級協程
- **Readonly Properties**：唯讀屬性
- **First-class Callables**：`$fn = strlen(...)`

**PHP 8.2 新特性**：

- **Readonly Classes**：唯讀類別
- **DNF Types**：`(A&B)|null`
- **Deprecate Dynamic Properties**

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/php8_new_features.md)

---

### Q2: 請解釋 PHP 的類型系統演進，什麼是 Strict Mode？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

PHP 從弱類型演進到現在，有哪些類型聲明？Strict Mode 有什麼影響？

<details>
<summary>💡 答案提示</summary>

**類型系統演進**：

| 版本 | 新增特性 |
|------|----------|
| PHP 5 | 類和陣列類型 |
| PHP 7.0 | 標量類型、返回類型 |
| PHP 7.1 | Nullable (`?int`)、void |
| PHP 7.4 | 屬性類型 |
| PHP 8.0 | Union Types、mixed、static |
| PHP 8.1 | Intersection Types、never |
| PHP 8.2 | DNF Types |

**Strict Mode**：
```php
declare(strict_types=1);

function add(int $a, int $b): int {
    return $a + $b;
}

add("1", "2"); // TypeError！嚴格模式下不自動轉型
```

**預設行為 (非嚴格)**：PHP 會嘗試自動類型轉換（type juggling）。

**嚴格模式**：類型不匹配時直接拋出 TypeError，更安全但需要更嚴謹的程式碼。

**建議**：新專案應啟用 `strict_types=1`，配合靜態分析工具如 PHPStan。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/type_system_evolution.md)

---

### Q3: Trait、Interface 和 Abstract Class 有什麼區別？何時使用？

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請比較這三種抽象機制的特點和使用場景。

<details>
<summary>💡 答案提示</summary>

**核心區別**：

| 特性 | Interface | Abstract Class | Trait |
|------|-----------|----------------|-------|
| **繼承** | 可多實作 | 只能單繼承 | 可多組合 |
| **方法實作** | PHP 8+ 可有預設實作 | 可有 | 必須有 |
| **屬性** | 常數 only | 可有 | 可有 |
| **建構函數** | ❌ | ✅ | ❌ |
| **用途** | 定義契約 | 共享實作 | 水平複用 |

**使用場景**：

- **Interface**：定義「能做什麼」的契約
  ```php
  interface Cacheable {
      public function getCacheKey(): string;
  }
  ```

- **Abstract Class**：共享「如何做」的實作
  ```php
  abstract class BaseController {
      protected function json($data) { /* ... */ }
      abstract public function index();
  }
  ```

- **Trait**：跨繼承體系複用程式碼
  ```php
  trait Timestampable {
      public function touch() { $this->updatedAt = new DateTime(); }
  }
  ```

**衝突解決**：使用 `insteadof` 和 `as` 關鍵字。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/trait_vs_interface_vs_abstract_class.md)

---

### Q4: PHP 如何實現依賴注入 (DI)？什麼是 IoC 容器？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請解釋依賴注入的概念、優點，以及 PHP 框架中的 IoC 容器如何運作。

<details>
<summary>💡 答案提示</summary>

**依賴注入類型**：

| 類型 | 說明 |
|------|------|
| **建構函數注入** | 最常用，依賴在建構時傳入 |
| **方法注入** | 依賴作為方法參數 |
| **屬性注入** | 透過 setter 或 public 屬性 |

**沒有 DI 的問題**：
```php
class UserService {
    public function __construct() {
        $this->mailer = new Mailer(); // 緊耦合！
    }
}
```

**使用 DI**：
```php
class UserService {
    public function __construct(
        private MailerInterface $mailer
    ) {}
}
```

**IoC 容器**：自動解析依賴關係並建立物件

**容器功能**：
1. **綁定**：將介面綁定到具體實作
2. **自動解析**：透過反射分析建構函數
3. **生命週期管理**：Singleton、Transient 等

**Laravel 範例**：
```php
$this->app->bind(MailerInterface::class, SmtpMailer::class);

// 自動注入
public function __construct(MailerInterface $mailer) {}
```

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/di_container_and_ioc.md)

---

### Q5: 什麼是 PSR-4 自動載入？Composer 如何管理依賴？

**難度**: ⭐⭐⭐⭐ (4) | **重要性**: 🔴 必考

請解釋 PHP 的命名空間、PSR-4 自動載入標準，以及 Composer 的運作原理。

<details>
<summary>💡 答案提示</summary>

**命名空間**：解決類別名稱衝突
```php
namespace App\Services;

class UserService {} // 全名：App\Services\UserService
```

**PSR-4 自動載入**：命名空間對應目錄結構

```json
// composer.json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    }
}
```

對應關係：`App\Services\UserService` → `src/Services/UserService.php`

**Composer 核心檔案**：

| 檔案 | 用途 |
|------|------|
| `composer.json` | 專案依賴定義 |
| `composer.lock` | 鎖定確切版本（應納入版本控制） |
| `vendor/` | 安裝的依賴套件 |
| `vendor/autoload.php` | 自動載入入口 |

**常用命令**：
- `composer install`：根據 lock 檔安裝
- `composer update`：更新依賴
- `composer require package/name`：新增依賴
- `composer dump-autoload`：重建自動載入

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/namespaces_and_autoloading.md)

---

### Q6: PHP 常見的安全漏洞有哪些？如何防範？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請列舉 PHP 開發中最常見的安全問題及其防範方法。

<details>
<summary>💡 答案提示</summary>

**常見漏洞與防範**：

| 漏洞 | 防範方法 |
|------|----------|
| **SQL Injection** | 使用預處理語句 (PDO/MySQLi) |
| **XSS** | `htmlspecialchars()` 輸出編碼 |
| **CSRF** | Token 驗證 |
| **File Inclusion** | 白名單、禁用 `allow_url_include` |
| **Session Hijacking** | `session_regenerate_id()` |

**SQL Injection 防範**：
```php
// ❌ 危險
$sql = "SELECT * FROM users WHERE id = " . $_GET['id'];

// ✅ 安全：預處理語句
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$_GET['id']]);
```

**XSS 防範**：
```php
// ❌ 危險
echo $_GET['name'];

// ✅ 安全
echo htmlspecialchars($_GET['name'], ENT_QUOTES, 'UTF-8');
```

**密碼儲存**：
```php
// 雜湊
$hash = password_hash($password, PASSWORD_DEFAULT);

// 驗證
if (password_verify($input, $hash)) { /* 成功 */ }
```

**OWASP Top 10** 是安全考察重點。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/common_security_vulnerabilities.md)

---

### Q7: 什麼是 OPcache 和 JIT？它們如何提升 PHP 效能？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請解釋 PHP 的執行流程，以及 OPcache 和 JIT 的優化原理。

<details>
<summary>💡 答案提示</summary>

**PHP 執行流程**：
```
PHP 原始碼 → 詞法分析 → 語法分析 → AST → Opcodes → 執行
```

**OPcache**：
- 快取編譯後的 Opcodes
- 避免重複編譯
- **必備**的生產環境優化

**JIT (Just-In-Time)**：PHP 8.0+
- 將 Opcodes 編譯為機器碼
- 對 **CPU 密集型** 運算效果明顯
- 對一般 Web 應用效果有限（I/O 為主）

**OPcache 配置**：
```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.validate_timestamps=0  ; 生產環境設為 0
```

**JIT 配置**：
```ini
opcache.jit_buffer_size=100M
opcache.jit=1255  ; Tracing JIT
```

**效能提升對比**：

| 場景 | OPcache | JIT |
|------|---------|-----|
| Web 應用 | ✅ 顯著 | ⚪ 有限 |
| CPU 密集運算 | ✅ 顯著 | ✅ 顯著 |
| I/O 密集 | ✅ 顯著 | ⚪ 很小 |

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/opcache_and_jit.md)

---

### Q8: PHP 的垃圾回收機制是如何運作的？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請解釋 PHP 的記憶體管理和垃圾回收機制。

<details>
<summary>💡 答案提示</summary>

**PHP 記憶體管理**：

**1. 引用計數 (Reference Counting)**：
- 每個變數有引用計數器
- 計數歸零時立即釋放
- 無法處理循環引用

**2. 循環收集器 (Cycle Collector)**：
- PHP 5.3+ 引入
- 解決循環引用問題
- 當可能的循環引用達到閾值時執行

**循環引用範例**：
```php
class Node {
    public $next;
}

$a = new Node();
$b = new Node();
$a->next = $b;
$b->next = $a; // 循環引用！

unset($a, $b);
// 引用計數無法歸零，需要循環收集器處理
```

**手動控制**：
```php
gc_enable();   // 啟用 GC
gc_disable();  // 禁用 GC
gc_collect_cycles(); // 強制執行
```

**最佳實踐**：
- 避免不必要的循環引用
- 長時間執行的腳本注意記憶體使用
- 使用 `memory_get_usage()` 監控

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/garbage_collection_in_php.md)

---

## 🔧 工具鏈 (Tooling)

### Q9: 什麼是 PSR 標準？有哪些常見的 PSR？

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請解釋 PHP-FIG 和 PSR 標準，以及最常用的幾個 PSR。

<details>
<summary>💡 答案提示</summary>

**PHP-FIG**：PHP Framework Interop Group，制定 PHP 互通標準。

**常見 PSR 標準**：

| PSR | 名稱 | 說明 |
|-----|------|------|
| **PSR-1** | 基本編碼規範 | 類名、命名空間基本規則 |
| **PSR-4** | 自動載入 | 類名對應檔案路徑 |
| **PSR-7** | HTTP 訊息介面 | Request/Response 標準 |
| **PSR-11** | 容器介面 | DI Container 標準 |
| **PSR-12** | 擴展編碼規範 | 詳細程式碼風格 |
| **PSR-15** | HTTP 處理器 | Middleware 標準 |
| **PSR-18** | HTTP 客戶端 | HTTP Client 標準 |

**PSR-7 重要性**：
- 統一 HTTP 請求/回應介面
- 框架無關的中介軟體
- 不可變物件設計

**PSR-15 Middleware**：
```php
interface MiddlewareInterface {
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ): ResponseInterface;
}
```

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Tooling/what_is_psr_and_common_standards.md)

---

## 🌐 Web 伺服器

### Q10: 什麼是 PHP-FPM？它如何與 Nginx 配合？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋 PHP-FPM 的架構、進程模型，以及與 Web 伺服器的整合。

<details>
<summary>💡 答案提示</summary>

**PHP-FPM**：FastCGI Process Manager

**架構**：
```
Client → Nginx → PHP-FPM (Master) → Worker Processes
                      ↓
                 Pool 配置（pm、子進程數）
```

**進程模型選擇**：

| 模式 | 說明 | 適用場景 |
|------|------|----------|
| `static` | 固定進程數 | 流量穩定、資源充足 |
| `dynamic` | 動態調整 | 一般網站 |
| `ondemand` | 按需建立 | 低流量、省資源 |

**重要配置**：
```ini
pm = dynamic
pm.max_children = 50      ; 最大子進程
pm.start_servers = 5      ; 啟動時進程數
pm.min_spare_servers = 5  ; 最小空閒
pm.max_spare_servers = 35 ; 最大空閒
pm.max_requests = 500     ; 進程處理請求數後重啟
```

**Nginx 配置**：
```nginx
location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}
```

**效能調優**：根據 `memory_limit` 和伺服器記憶體計算 `max_children`。

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Web_Servers/php_fpm_and_its_role.md)

---

## 🚀 Laravel 框架

### Q11: 請解釋 Laravel 的請求生命週期

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

從請求進入到回應返回，Laravel 內部經歷了哪些階段？

<details>
<summary>💡 答案提示</summary>

**請求生命週期**：

```
1. public/index.php
       ↓
2. bootstrap/app.php（建立 Application）
       ↓
3. HTTP Kernel
   - 載入 Middleware
   - 建立 Request
       ↓
4. Router（路由匹配）
       ↓
5. Route Middleware
       ↓
6. Controller / Closure
       ↓
7. Response
       ↓
8. Middleware（回程）
       ↓
9. HTTP Kernel terminate()
```

**關鍵元件**：

| 元件 | 職責 |
|------|------|
| **Kernel** | 請求處理核心，載入 middleware |
| **Router** | 路由匹配與分發 |
| **Middleware** | 請求/回應過濾 |
| **Controller** | 業務邏輯處理 |

**Service Provider**：
- 在 Kernel 處理前載入
- 負責註冊服務到容器
- `register()` 先執行，`boot()` 後執行

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Frameworks/Laravel/request_lifecycle.md)

---

### Q12: Laravel Service Container 是如何運作的？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請解釋 Laravel 服務容器的綁定、解析機制，以及常見用法。

<details>
<summary>💡 答案提示</summary>

**Service Container**：Laravel 的 IoC 容器，負責依賴管理和物件建立。

**綁定方式**：

```php
// 1. 簡單綁定
$this->app->bind(PaymentInterface::class, StripePayment::class);

// 2. 單例綁定
$this->app->singleton(Logger::class, function ($app) {
    return new FileLogger($app['config']['log.path']);
});

// 3. 實例綁定
$this->app->instance('config', $config);

// 4. 上下文綁定
$this->app->when(PhotoController::class)
          ->needs(Filesystem::class)
          ->give(S3Filesystem::class);
```

**自動解析**：
```php
class OrderController {
    public function __construct(
        private OrderService $orders,  // 自動注入
        private PaymentInterface $payment
    ) {}
}
```

**解析方式**：
```php
$service = app(OrderService::class);
$service = resolve(OrderService::class);
$service = app()->make(OrderService::class);
```

**Method Injection**：
```php
public function store(Request $request, OrderService $service) {
    // $request 和 $service 都被自動注入
}
```

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Frameworks/Laravel/service_container_and_ioc.md)

---

### Q13: Laravel Facade 的原理是什麼？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請解釋 Facade 如何實現靜態方法呼叫背後的物件導向操作。

<details>
<summary>💡 答案提示</summary>

**Facade 本質**：提供靜態語法存取容器中的服務。

**運作原理**：
```php
// 使用 Facade
Cache::get('key');

// 實際等於
app('cache')->get('key');
```

**實作機制**：
```php
abstract class Facade {
    protected static function getFacadeAccessor() {
        // 子類覆寫，返回容器綁定名稱
    }
    
    public static function __callStatic($method, $args) {
        $instance = app(static::getFacadeAccessor());
        return $instance->$method(...$args);
    }
}

class Cache extends Facade {
    protected static function getFacadeAccessor() {
        return 'cache'; // 容器中的服務名稱
    }
}
```

**優點**：
- 簡潔的語法
- 易於測試（可 mock）
- IDE 支援（透過 @mixin）

**爭議**：
- 隱藏依賴關係
- 靜態呼叫可能誤導
- 建議核心邏輯使用依賴注入

**Real-Time Facades**：
```php
use Facades\App\Services\PaymentService;

PaymentService::process($order);
```

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Frameworks/Laravel/facades_explained.md)

---

### Q14: Eloquent ORM 的 N+1 問題如何解決？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請解釋什麼是 N+1 查詢問題，以及 Eloquent 提供的解決方案。

<details>
<summary>💡 答案提示</summary>

**N+1 問題**：
```php
// ❌ N+1：1 次取 posts + N 次取每個 post 的 user
$posts = Post::all();
foreach ($posts as $post) {
    echo $post->user->name; // 每次迴圈都查詢！
}
```

**解決方案：預載入 (Eager Loading)**：

```php
// ✅ 只有 2 次查詢
$posts = Post::with('user')->get();

// 多個關聯
$posts = Post::with(['user', 'comments', 'tags'])->get();

// 巢狀關聯
$posts = Post::with('comments.author')->get();

// 條件預載入
$posts = Post::with(['comments' => function ($query) {
    $query->where('approved', true);
}])->get();
```

**延遲預載入**：
```php
$posts = Post::all();
$posts->load('user'); // 後續補載
```

**預設預載入**：
```php
class Post extends Model {
    protected $with = ['user']; // 永遠預載入
}
```

**檢測 N+1**：
```php
// AppServiceProvider
Model::preventLazyLoading(! app()->isProduction());
```

**其他優化**：
- 使用 `select()` 限制欄位
- 使用 `withCount()` 取得計數
- 考慮 `chunk()` 處理大量資料

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Frameworks/Laravel/eloquent_orm_deep_dive.md)

---

### Q15: Laravel Middleware 的執行順序和原理是什麼？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋 Middleware 的執行流程、分類，以及如何自訂。

<details>
<summary>💡 答案提示</summary>

**洋蔥模型**：
```
Request → [Auth] → [CORS] → [Throttle] → Controller
                                             ↓
Response ← [Auth] ← [CORS] ← [Throttle] ← Result
```

**Middleware 分類**：

| 類型 | 說明 | 定義位置 |
|------|------|----------|
| **Global** | 所有請求都執行 | `$middleware` |
| **Group** | web/api 分組 | `$middlewareGroups` |
| **Route** | 特定路由 | `$middlewareAliases` |

**自訂 Middleware**：
```php
class CheckAge {
    public function handle($request, Closure $next) {
        if ($request->age < 18) {
            return redirect('home');
        }
        
        $response = $next($request); // 前置處理在此之前
        
        // 後置處理在此
        
        return $response;
    }
}
```

**Terminable Middleware**：
```php
public function terminate($request, $response) {
    // 回應發送後執行（如日誌記錄）
}
```

**Middleware 參數**：
```php
Route::get('/admin', function () {
    //
})->middleware('role:admin,editor');

public function handle($request, Closure $next, ...$roles) {
    // $roles = ['admin', 'editor']
}
```

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Frameworks/Laravel/middleware_in_depth.md)

---

### Q16: Laravel 如何進行效能優化？

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請列舉 Laravel 應用的效能優化策略。

<details>
<summary>💡 答案提示</summary>

**生產環境優化命令**：
```bash
php artisan config:cache   # 快取配置
php artisan route:cache    # 快取路由
php artisan view:cache     # 快取視圖
php artisan event:cache    # 快取事件
php artisan optimize       # 綜合優化
```

**優化策略**：

| 層面 | 策略 |
|------|------|
| **PHP** | OPcache、JIT、PHP 8.2+ |
| **資料庫** | 索引、預載入、查詢快取 |
| **快取** | Redis/Memcached、HTTP 快取 |
| **佇列** | 耗時任務異步處理 |
| **前端** | Asset 編譯、CDN |

**資料庫優化**：
```php
// Eager Loading
$posts = Post::with('user')->get();

// 限制欄位
$users = User::select(['id', 'name'])->get();

// 分塊處理
User::chunk(1000, function ($users) {
    // 處理
});
```

**快取策略**：
```php
$value = Cache::remember('key', 3600, function () {
    return DB::table('users')->get();
});
```

**Octane**：使用 Swoole/RoadRunner 常駐記憶體，大幅提升效能。

**監控工具**：
- Laravel Telescope（開發）
- Laravel Debugbar
- Blackfire / New Relic（生產）

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Frameworks/Laravel/performance_optimization.md)

---

## 🔬 進階主題

### Q17: PHP 閉包 (Closure) 如何使用？use 關鍵字的作用是什麼？

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🟡 重要

請解釋 PHP 閉包的語法和使用場景。

<details>
<summary>💡 答案提示</summary>

**閉包基本語法**：
```php
$greet = function ($name) {
    return "Hello, $name!";
};

echo $greet('World');
```

**use 捕獲外部變數**：
```php
$message = 'Hello';

// 值傳遞（預設）
$greet = function ($name) use ($message) {
    return "$message, $name!";
};

// 參考傳遞
$counter = 0;
$increment = function () use (&$counter) {
    $counter++;
};
```

**箭頭函數 (PHP 7.4+)**：
```php
// 自動捕獲變數，只支援單一表達式
$multiplier = 3;
$multiply = fn($x) => $x * $multiplier;
```

**常見使用場景**：
- 回呼函數：`array_map(fn($x) => $x * 2, [1, 2, 3])`
- 延遲執行：`Cache::remember('key', 60, fn() => expensive())`
- 閉包綁定：`$closure->bindTo($object)`

**Closure::fromCallable()**：
```php
$callable = Closure::fromCallable([$obj, 'method']);
```

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/closures_and_anonymous_functions.md)

---

### Q18: PHP 生成器 (Generator) 是什麼？何時使用？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請解釋生成器的原理和使用場景。

<details>
<summary>💡 答案提示</summary>

**生成器**：使用 `yield` 逐一產生值，不需一次載入所有資料。

```php
function getNumbers($max) {
    for ($i = 0; $i < $max; $i++) {
        yield $i;  // 每次迭代返回一個值
    }
}

foreach (getNumbers(1000000) as $num) {
    echo $num;
}
```

**記憶體優勢**：
```php
// ❌ 一次載入 100 萬筆
function getAll() {
    return range(1, 1000000); // 大量記憶體
}

// ✅ 使用生成器
function getAll() {
    for ($i = 1; $i <= 1000000; $i++) {
        yield $i; // 一次只產生一個
    }
}
```

**雙向通訊**：
```php
function processor() {
    while (true) {
        $data = yield;
        echo "處理: $data\n";
    }
}

$gen = processor();
$gen->send('A');
$gen->send('B');
```

**使用場景**：
- 處理大型檔案
- 資料庫結果集迭代
- 資料流處理
- 無限序列

**yield from**：委派給另一個生成器
```php
function gen() {
    yield from [1, 2, 3];
    yield from anotherGenerator();
}
```

</details>

📖 [查看完整答案](../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/generators_and_iterators.md)

---

## 📊 學習進度檢核

完成以上題目後，請自我評估：

| 評估項目 | 自評 |
|----------|------|
| 熟悉 PHP 8+ 新特性 | ⬜ |
| 理解類型系統和嚴格模式 | ⬜ |
| 能區分 Trait/Interface/Abstract | ⬜ |
| 理解依賴注入和 IoC 容器 | ⬜ |
| 熟悉 PSR 標準和 Composer | ⬜ |
| 知道常見安全漏洞和防範 | ⬜ |
| 理解 OPcache 和 JIT | ⬜ |
| 理解 PHP 垃圾回收機制 | ⬜ |
| 熟悉 PSR 標準 | ⬜ |
| 理解 PHP-FPM 架構 | ⬜ |
| 理解 Laravel 請求生命週期 | ⬜ |
| 熟悉 Service Container | ⬜ |
| 理解 Facade 原理 | ⬜ |
| 能解決 N+1 問題 | ⬜ |
| 理解 Middleware 機制 | ⬜ |
| 知道 Laravel 效能優化方法 | ⬜ |
| 熟悉閉包和生成器 | ⬜ |
| 理解魔術方法 | ⬜ |

**建議**：未能完整回答的題目，請回到對應的詳細文章深入學習。
