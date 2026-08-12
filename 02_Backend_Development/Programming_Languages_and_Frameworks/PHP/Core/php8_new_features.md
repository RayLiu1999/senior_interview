# PHP 8+ 新特性與現代 PHP 開發

- **難度**: 7
- **重要程度**: 5
- **標籤**: `PHP`, `PHP 8`, `PHP 8.1`, `PHP 8.2`, `PHP 8.3`, `Modern PHP`

## 問題詳述

請深入解釋 PHP 8.0、8.1、8.2、8.3 引入的新特性，以及現代 PHP 開發的最佳實踐。

## 核心理論與詳解

### 1. PHP 8.0 核心特性

#### Named Arguments（命名參數）

```php
// 傳統方式
function createUser($name, $email, $role = 'user', $active = true) {
    // ...
}
createUser('John', 'john@example.com', 'user', false);

// ✅ PHP 8: 命名參數
createUser(
    name: 'John',
    email: 'john@example.com',
    active: false  // 跳過 $role，使用默認值
);

// 實用案例：配置數組
$response = http_get(
    url: 'https://api.example.com',
    headers: ['Authorization' => 'Bearer token'],
    timeout: 30,
    verify_ssl: true
);
```

#### Attributes（屬性/註解）

```php
// ✅ PHP 8: 原生屬性
#[Route('/api/users', methods: ['GET', 'POST'])]
#[IsGranted('ROLE_ADMIN')]
class UserController
{
    #[Cache(ttl: 3600)]
    #[RateLimit(limit: 100, period: 60)]
    public function list(): array
    {
        return $this->userRepository->findAll();
    }
}

// 定義屬性
#[Attribute(Attribute::TARGET_METHOD)]
class Cache
{
    public function __construct(
        public int $ttl = 60
    ) {
    }
}

// 讀取屬性
$reflection = new ReflectionMethod(UserController::class, 'list');
$attributes = $reflection->getAttributes(Cache::class);

foreach ($attributes as $attribute) {
    $cache = $attribute->newInstance();
    echo $cache->ttl; // 3600
}
```

#### Union Types（聯合類型）

```php
// ✅ PHP 8: 聯合類型
function processId(int|string $id): int|string
{
    return is_string($id) ? (int)$id : (string)$id;
}

processId(123);     // int
processId('456');   // string

// 實用案例
class Response
{
    public function __construct(
        private int|string $statusCode,
        private array|object $data
    ) {
    }
}

// 可選類型（nullable）
function getName(): ?string|int  // ❌ 錯誤
function getName(): string|int|null  // ✅ 正確
```

#### Match Expression（匹配表達式）

```php
// 傳統 switch
$result = null;
switch ($status) {
    case 'pending':
        $result = 'Processing';
        break;
    case 'completed':
        $result = 'Done';
        break;
    default:
        $result = 'Unknown';
}

// ✅ PHP 8: match（更簡潔、類型安全）
$result = match($status) {
    'pending' => 'Processing',
    'completed' => 'Done',
    'failed', 'cancelled' => 'Stopped',  // 多條件
    default => 'Unknown',
};

// 嚴格比較（===）
$value = match($input) {
    0 => 'zero',      // 只匹配 int(0)
    '0' => 'string',  // 只匹配 string('0')
    false => 'bool',  // 只匹配 bool(false)
};

// 複雜表達式
$discount = match(true) {
    $total >= 1000 => 0.2,
    $total >= 500 => 0.1,
    $total >= 100 => 0.05,
    default => 0,
};
```

#### Nullsafe Operator（空安全操作符）

```php
// 傳統方式
$country = null;
if ($user !== null && $user->getAddress() !== null) {
    $country = $user->getAddress()->getCountry();
}

// ✅ PHP 8: 空安全操作符
$country = $user?->getAddress()?->getCountry();

// 鏈式調用
$result = $obj?->method1()?->method2()?->method3();

// 數組訪問（PHP 8.0 不支持，PHP 8.1+ 支持）
$value = $array?['key'];  // PHP 8.1+
```

#### Constructor Property Promotion（構造函數屬性提升）

```php
// 傳統方式
class User
{
    private string $name;
    private string $email;
    private int $age;
    
    public function __construct(string $name, string $email, int $age)
    {
        $this->name = $name;
        $this->email = $email;
        $this->age = $age;
    }
}

// ✅ PHP 8: 構造函數屬性提升
class User
{
    public function __construct(
        private string $name,
        private string $email,
        private int $age
    ) {
    }
}

// 混合使用
class User
{
    private string $hashedPassword;
    
    public function __construct(
        private string $name,
        string $password  // 普通參數
    ) {
        $this->hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    }
}
```

#### JIT Compiler（即時編譯）

```ini
; php.ini
opcache.enable=1
opcache.jit_buffer_size=100M
opcache.jit=tracing  ; 或 function

; JIT 模式
; opcache.jit=0        ; 關閉
; opcache.jit=1205     ; 追蹤 JIT（推薦）
; opcache.jit=tracing  ; 同 1205
```

**JIT 性能提升**：
- 🚀 CPU 密集型運算：2-3x 性能提升
- 📊 Web 應用：10-20% 性能提升
- 🎯 最佳場景：科學計算、機器學習

### 2. PHP 8.1 新特性

#### Enumerations（枚舉）

```php
// ✅ PHP 8.1: 原生枚舉
enum Status
{
    case Pending;
    case Processing;
    case Completed;
    case Failed;
}

// 使用
$status = Status::Pending;

// 匹配
$message = match($status) {
    Status::Pending => 'Waiting',
    Status::Processing => 'In progress',
    Status::Completed => 'Done',
    Status::Failed => 'Error',
};

// 帶值的枚舉（Backed Enum）
enum StatusCode: int
{
    case Pending = 0;
    case Processing = 1;
    case Completed = 2;
    case Failed = 3;
    
    public function label(): string
    {
        return match($this) {
            self::Pending => 'Pending',
            self::Processing => 'Processing',
            self::Completed => 'Completed',
            self::Failed => 'Failed',
        };
    }
    
    public function color(): string
    {
        return match($this) {
            self::Pending => 'yellow',
            self::Processing => 'blue',
            self::Completed => 'green',
            self::Failed => 'red',
        };
    }
}

// 使用
$status = StatusCode::Processing;
echo $status->value;   // 1
echo $status->name;    // 'Processing'
echo $status->label(); // 'Processing'
echo $status->color(); // 'blue'

// 從值創建
$status = StatusCode::from(1);        // Processing
$status = StatusCode::tryFrom(99);    // null（不存在）

// 列出所有值
foreach (StatusCode::cases() as $case) {
    echo $case->name . ': ' . $case->value . PHP_EOL;
}
```

#### Readonly Properties（只讀屬性）

```php
// ✅ PHP 8.1: 只讀屬性
class User
{
    public function __construct(
        public readonly string $id,
        public readonly string $email,
        private string $password  // 可變
    ) {
    }
}

$user = new User('123', 'user@example.com', 'secret');
echo $user->id;  // ✅ 讀取
$user->id = '456';  // ❌ 錯誤：不能修改

// 延遲初始化
class User
{
    public readonly string $id;
    
    public function __construct(string $email)
    {
        // 可以在構造函數中設置一次
        $this->id = uniqid();
    }
}
```

#### First-class Callable Syntax（一級可調用語法）

```php
// 傳統方式
$fn = 'strlen';
$fn = [$obj, 'method'];
$fn = Closure::fromCallable('strlen');

// ✅ PHP 8.1: 一級可調用
$fn = strlen(...);
$fn = $obj->method(...);
$fn = User::staticMethod(...);

// 實用案例
$numbers = [1, 2, 3, 4, 5];

// 傳統
$squared = array_map(fn($n) => $n ** 2, $numbers);

// PHP 8.1
class Math {
    public static function square(int $n): int {
        return $n ** 2;
    }
}
$squared = array_map(Math::square(...), $numbers);
```

#### New in initializers（初始化器中的 new）

```php
// ✅ PHP 8.1: 參數默認值可以使用 new
class Service
{
    public function __construct(
        private Logger $logger = new Logger()
    ) {
    }
}

// 屬性默認值
class User
{
    private DateTime $createdAt = new DateTime();
}

// 靜態變量
function getCache() {
    static $cache = new Cache();
    return $cache;
}
```

### 3. PHP 8.2 新特性

#### Readonly Classes（只讀類）

```php
// ✅ PHP 8.2: 整個類只讀
readonly class Point
{
    public function __construct(
        public int $x,
        public int $y
    ) {
    }
}

$point = new Point(10, 20);
$point->x = 30;  // ❌ 錯誤

// DTO 示例
readonly class UserDTO
{
    public function __construct(
        public int $id,
        public string $name,
        public string $email,
        public array $roles
    ) {
    }
}
```

#### Disjunctive Normal Form Types（DNF 類型）

```php
// ✅ PHP 8.2: 交集和聯合類型組合
function process((A&B)|null $input): (X&Y)|(A&B)|null
{
    // ...
}

// 實用案例
interface Logger {}
interface Cache {}

class FileLogger implements Logger {}
class RedisCache implements Cache {}

function setup((Logger&Cache)|null $service): void
{
    // 接受同時實現 Logger 和 Cache 的對象，或 null
}
```

#### Constants in Traits（Trait 中的常量）

```php
// ✅ PHP 8.2: Trait 可以定義常量
trait Timestamps
{
    public const CREATED_AT = 'created_at';
    public const UPDATED_AT = 'updated_at';
    
    public function getCreatedAtColumn(): string
    {
        return self::CREATED_AT;
    }
}

class Post
{
    use Timestamps;
}

echo Post::CREATED_AT;  // 'created_at'
```

### 4. PHP 8.3 新特性

#### Typed Class Constants（類型化類常量）

```php
// ✅ PHP 8.3: 類常量可以指定類型
class Config
{
    public const string APP_NAME = 'MyApp';
    public const int MAX_RETRIES = 3;
    public const array ALLOWED_HOSTS = ['localhost', 'example.com'];
}
```

#### readonly Amendments（readonly 修正）

```php
// ✅ PHP 8.3: 克隆 readonly 屬性
readonly class Point
{
    public function __construct(
        public int $x,
        public int $y
    ) {
    }
    
    public function moveX(int $newX): self
    {
        // PHP 8.3: 可以在 __clone 中修改
        $new = clone $this;
        $new->x = $newX;
        return $new;
    }
}
```

#### Dynamic Class Constant Fetch（動態類常量獲取）

```php
// ✅ PHP 8.3: 動態獲取類常量
class Status
{
    public const PENDING = 1;
    public const ACTIVE = 2;
}

$constantName = 'PENDING';
$value = Status::{$constantName};  // 1
```

### 5. 現代 PHP 開發最佳實踐

#### 嚴格類型聲明

```php
<?php
declare(strict_types=1);

// ✅ 嚴格類型檢查
function add(int $a, int $b): int
{
    return $a + $b;
}

add(1, 2);      // ✅ 正確
add('1', '2');  // ❌ TypeError（嚴格模式）
add(1.5, 2.5);  // ❌ TypeError（嚴格模式）
```

#### 使用現代特性重構

```php
// ❌ 舊代碼
class User
{
    private $name;
    private $email;
    private $role;
    
    public function __construct($name, $email, $role = 'user')
    {
        $this->name = $name;
        $this->email = $email;
        $this->role = $role;
    }
    
    public function getName()
    {
        return $this->name;
    }
    
    public function getRole()
    {
        switch ($this->role) {
            case 'admin':
                return 'Administrator';
            case 'user':
                return 'Regular User';
            default:
                return 'Unknown';
        }
    }
}

// ✅ PHP 8.3 重構
declare(strict_types=1);

enum UserRole: string
{
    case Admin = 'admin';
    case User = 'user';
    
    public function label(): string
    {
        return match($this) {
            self::Admin => 'Administrator',
            self::User => 'Regular User',
        };
    }
}

readonly class User
{
    public function __construct(
        public string $name,
        public string $email,
        public UserRole $role = UserRole::User
    ) {
    }
    
    public function getRoleLabel(): string
    {
        return $this->role->label();
    }
}

// 使用
$user = new User(
    name: 'John Doe',
    email: 'john@example.com',
    role: UserRole::Admin
);
```

#### 函數式編程風格

```php
// ✅ 使用 array_map, array_filter, array_reduce
$users = [
    new User('John', 'john@example.com', 25),
    new User('Jane', 'jane@example.com', 30),
    new User('Bob', 'bob@example.com', 20),
];

// 獲取所有成年用戶的名字
$names = array_map(
    fn($user) => $user->name,
    array_filter(
        $users,
        fn($user) => $user->age >= 18
    )
);

// 使用管道（自定義）
function pipe(mixed $value, callable ...$functions): mixed
{
    return array_reduce(
        $functions,
        fn($carry, $fn) => $fn($carry),
        $value
    );
}

$result = pipe(
    $users,
    fn($users) => array_filter($users, fn($u) => $u->age >= 18),
    fn($users) => array_map(fn($u) => $u->name, $users),
    fn($names) => array_unique($names)
);
```

#### 使用 Fibers（纖程）實現協程

```php
// ✅ PHP 8.1: Fibers（輕量級協程）
$fiber = new Fiber(function (): void {
    $value = Fiber::suspend('first');
    echo "Received: $value\n";
    
    $value = Fiber::suspend('second');
    echo "Received: $value\n";
});

$value = $fiber->start();    // 'first'
echo "Got: $value\n";

$value = $fiber->resume('A'); // 輸出 "Received: A"，返回 'second'
echo "Got: $value\n";

$fiber->resume('B');          // 輸出 "Received: B"

// 實用案例：異步 HTTP 請求
function asyncHttpGet(string $url): Fiber
{
    return new Fiber(function () use ($url) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        Fiber::suspend('connecting');
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return $response;
    });
}
```

### 6. 性能優化建議

```php
// ✅ 1. 使用 OpCache + JIT
opcache.enable=1
opcache.jit=tracing
opcache.jit_buffer_size=100M

// ✅ 2. 使用類型聲明（JIT 優化）
function calculate(int $a, int $b): int
{
    return $a + $b;  // JIT 可以優化
}

// ✅ 3. 使用 Preloading（PHP 7.4+）
opcache.preload=/path/to/preload.php

// ✅ 4. 避免過度使用動態特性
// ❌ 慢
$method = 'get' . ucfirst($property);
$value = $obj->$method();

// ✅ 快
$value = match($property) {
    'name' => $obj->getName(),
    'email' => $obj->getEmail(),
    default => null,
};
```

## 總結

**PHP 8+ 核心特性**：
- 🚀 **JIT**：大幅提升性能
- 🎯 **Union Types**：更靈活的類型系統
- 📝 **Attributes**：原生註解支持
- 🔒 **Readonly**：不可變數據
- 🏷️ **Enums**：類型安全的枚舉
- ⚡ **Match**：更強大的分支
- 🔗 **Nullsafe**：簡化空值處理

**版本選擇建議**：
- **PHP 8.0**：最低版本（JIT, Union Types, Attributes）
- **PHP 8.1**：推薦版本（Enums, Readonly, Fibers）
- **PHP 8.2**：生產可用（Readonly Classes, DNF Types）
- **PHP 8.3**：最新特性（Typed Constants）

**遷移策略**：
1. 啟用嚴格類型：`declare(strict_types=1)`
2. 重構類使用屬性提升
3. 替換 switch 為 match
4. 使用 Enum 替代常量
5. 添加 readonly 到 DTO
6. 啟用 JIT

現代 PHP 已經是一門高性能、類型安全的語言！

### 測驗對應

- **Concept ID**: `concept.php.core.php8-features`
- **Learning Objectives**:
  - `LO-1`: 能夠按 PHP 8.0、8.1、8.2 與 8.3 分類說明主要語言特性及其解決的問題。
  - `LO-2`: 能夠在實際 PHP 設計中選擇 Union Types、Attributes、Match、Enum、Readonly、Fibers 等特性。
  - `LO-3`: 能夠評估 JIT、嚴格型別與現代語法遷移對 CPU 密集工作、Web I/O 與可維護性的影響。
- **Quick Quiz**: [Q1](../../../../QUIZ/09_PHP.md#q1-php-8-有哪些重要的新特性)
