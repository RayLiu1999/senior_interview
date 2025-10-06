# PHP 閉包與匿名函數

- **難度**: 6
- **重要程度**: 4
- **標籤**: `Closures`, `Anonymous Functions`, `Functional Programming`

## 問題詳述

PHP 支持閉包和匿名函數，這是函數式編程的重要特性。請解釋它們的概念、使用場景，以及與普通函數的區別。

## 核心理論與詳解

### 匿名函數（Anonymous Functions）

#### 基本概念

匿名函數是沒有名稱的函數，也稱為閉包（Closure）。它們可以賦值給變量或作為參數傳遞。

**基本語法**：
```php
$greet = function(string $name): string {
    return "Hello, $name!";
};

echo $greet('John');  // "Hello, John!"
```

**作為參數**：
```php
$numbers = [1, 2, 3, 4, 5];

$squared = array_map(function($n) {
    return $n * $n;
}, $numbers);

print_r($squared);  // [1, 4, 9, 16, 25]
```

### 閉包（Closures）

#### 什麼是閉包

閉包是能夠訪問其定義時所在作用域變量的函數。PHP 使用 `use` 關鍵字來實現變量捕獲。

**變量捕獲**：
```php
$message = 'Hello';

$greet = function(string $name) use ($message) {
    return "$message, $name!";
};

echo $greet('John');  // "Hello, John!"
```

**值傳遞 vs 引用傳遞**：
```php
// 值傳遞（默認）
$count = 0;

$increment = function() use ($count) {
    $count++;  // 只修改閉包內的副本
};

$increment();
echo $count;  // 0（外部變量未改變）

// 引用傳遞
$count = 0;

$increment = function() use (&$count) {
    $count++;  // 修改外部變量
};

$increment();
echo $count;  // 1（外部變量已改變）
```

**捕獲多個變量**：
```php
$prefix = 'Mr.';
$suffix = 'Jr.';

$formatName = function($name) use ($prefix, $suffix) {
    return "$prefix $name $suffix";
};

echo $formatName('John');  // "Mr. John Jr."
```

### 箭頭函數（Arrow Functions）PHP 7.4+

#### 簡化語法

箭頭函數提供了更簡潔的匿名函數語法，自動捕獲父作用域的變量。

**基本語法**：
```php
// 傳統匿名函數
$multiply = function($x, $y) {
    return $x * $y;
};

// 箭頭函數
$multiply = fn($x, $y) => $x * $y;
```

**自動變量捕獲**：
```php
$factor = 10;

// 傳統方式：需要 use
$multiply = function($n) use ($factor) {
    return $n * $factor;
};

// 箭頭函數：自動捕獲
$multiply = fn($n) => $n * $factor;

echo $multiply(5);  // 50
```

**與 array 函數配合**：
```php
$numbers = [1, 2, 3, 4, 5];

// 傳統方式
$squared = array_map(function($n) {
    return $n * $n;
}, $numbers);

// 箭頭函數
$squared = array_map(fn($n) => $n * $n, $numbers);

// 過濾偶數
$evens = array_filter($numbers, fn($n) => $n % 2 === 0);

// 排序
usort($users, fn($a, $b) => $a->age <=> $b->age);
```

**限制**：
- 只能包含一個表達式
- 表達式的結果會自動返回
- 不能包含多行語句

### 閉包的實際應用

#### 回調函數

```php
// 事件監聽
$eventBus->on('user.created', function(User $user) {
    sendWelcomeEmail($user->email);
    logUserCreation($user->id);
});

// 中間件
$app->get('/api/users', function($request, $response, $next) {
    if (!$request->isAuthenticated()) {
        return $response->unauthorized();
    }
    return $next($request, $response);
});
```

#### 延遲執行

```php
class Container
{
    private array $bindings = [];
    
    // 註冊閉包，延遲創建對象
    public function bind(string $abstract, callable $concrete): void
    {
        $this->bindings[$abstract] = $concrete;
    }
    
    // 執行時才創建對象
    public function make(string $abstract): object
    {
        $concrete = $this->bindings[$abstract];
        return $concrete($this);
    }
}

$container = new Container();

// 註冊（不立即創建）
$container->bind(Database::class, function($container) {
    return new Database(config('database'));
});

// 使用時才創建
$db = $container->make(Database::class);
```

#### 工廠模式

```php
class UserFactory
{
    public function createAdmin(): callable
    {
        return function() {
            return new User([
                'role' => 'admin',
                'permissions' => ['*']
            ]);
        };
    }
    
    public function createGuest(): callable
    {
        return function() {
            return new User([
                'role' => 'guest',
                'permissions' => ['read']
            ]);
        };
    }
}

$factory = new UserFactory();
$createAdmin = $factory->createAdmin();
$admin = $createAdmin();  // 創建管理員用戶
```

#### 配置構建器

```php
class QueryBuilder
{
    private array $wheres = [];
    
    public function where(callable $callback): self
    {
        $this->wheres[] = $callback;
        return $this;
    }
    
    public function get(): array
    {
        $results = $this->fetchAll();
        
        foreach ($this->wheres as $where) {
            $results = array_filter($results, $where);
        }
        
        return $results;
    }
}

$users = (new QueryBuilder())
    ->where(fn($user) => $user->age > 18)
    ->where(fn($user) => $user->active === true)
    ->get();
```

### Closure 類

#### Closure 類方法

PHP 的閉包是 `Closure` 類的實例，提供了一些有用的方法。

**bindTo()：重新綁定 $this**：
```php
class User
{
    private string $name = 'John';
}

$getName = function() {
    return $this->name;  // 訪問 private 屬性
};

$user = new User();

// 綁定 $this 到 $user
$bound = $getName->bindTo($user, User::class);
echo $bound();  // "John"
```

**bind()：靜態方法版本**：
```php
$bound = Closure::bind($getName, $user, User::class);
echo $bound();  // "John"
```

**call()：PHP 7.0+，臨時綁定並調用**：
```php
$getName = function() {
    return $this->name;
};

echo $getName->call($user);  // "John"
```

**fromCallable()：PHP 7.1+，從callable創建閉包**：
```php
class Math
{
    public static function add(int $a, int $b): int
    {
        return $a + $b;
    }
}

$closure = Closure::fromCallable([Math::class, 'add']);
echo $closure(1, 2);  // 3
```

#### 實際應用 - 訪問私有成員

```php
class User
{
    private int $id;
    private string $name;
    
    public function __construct(int $id, string $name)
    {
        $this->id = $id;
        $this->name = $name;
    }
}

// 測試輔助函數：訪問私有屬性
function getPrivateProperty(object $object, string $property): mixed
{
    $getter = function() use ($property) {
        return $this->$property;
    };
    
    return $getter->call($object);
}

$user = new User(1, 'John');
echo getPrivateProperty($user, 'name');  // "John"
```

### 高階函數

#### 返回函數的函數

```php
function multiplier(int $factor): callable
{
    return fn($n) => $n * $factor;
}

$double = multiplier(2);
$triple = multiplier(3);

echo $double(5);  // 10
echo $triple(5);  // 15
```

#### 函數組合

```php
function compose(callable ...$functions): callable
{
    return function($value) use ($functions) {
        return array_reduce(
            array_reverse($functions),
            fn($carry, $fn) => $fn($carry),
            $value
        );
    };
}

$addOne = fn($n) => $n + 1;
$double = fn($n) => $n * 2;
$square = fn($n) => $n * $n;

$composed = compose($square, $double, $addOne);
echo $composed(3);  // (3 + 1) * 2 ^ 2 = 64
```

#### 柯里化（Currying）

```php
function curry(callable $function): callable
{
    $reflection = new ReflectionFunction($function);
    $numParams = $reflection->getNumberOfParameters();
    
    return function(...$args) use ($function, $numParams) {
        if (count($args) >= $numParams) {
            return $function(...$args);
        }
        
        return function(...$moreArgs) use ($function, $args, $numParams) {
            return call_user_func_array(
                curry($function),
                array_merge($args, $moreArgs)
            );
        };
    };
}

$add = fn($a, $b, $c) => $a + $b + $c;
$curriedAdd = curry($add);

echo $curriedAdd(1)(2)(3);  // 6
echo $curriedAdd(1, 2)(3);  // 6
```

### 性能考量

**閉包的開銷**：
```php
// 基準測試
$iterations = 1000000;

// 普通函數
function normalAdd($a, $b) {
    return $a + $b;
}

$start = microtime(true);
for ($i = 0; $i < $iterations; $i++) {
    normalAdd(1, 2);
}
$normalTime = microtime(true) - $start;

// 閉包
$closureAdd = fn($a, $b) => $a + $b;

$start = microtime(true);
for ($i = 0; $i < $iterations; $i++) {
    $closureAdd(1, 2);
}
$closureTime = microtime(true) - $start;

echo "Normal: {$normalTime}s\n";
echo "Closure: {$closureTime}s\n";
// 閉包略慢（約 5-10%），但差異可以忽略
```

**最佳實踐**：
- 在回調和高階函數場景使用閉包
- 簡單邏輯優先使用箭頭函數
- 避免在循環中創建大量閉包
- 注意變量捕獲的記憶體占用

### 常見陷阱

**循環中的閉包**：
```php
// 錯誤：所有閉包共享同一個 $i
$callbacks = [];
for ($i = 0; $i < 3; $i++) {
    $callbacks[] = function() use ($i) {
        echo $i;
    };
}

foreach ($callbacks as $callback) {
    $callback();  // 輸出：2 2 2
}

// 正確：使用引用或立即執行
$callbacks = [];
for ($i = 0; $i < 3; $i++) {
    $callbacks[] = (function($value) {
        return function() use ($value) {
            echo $value;
        };
    })($i);
}

foreach ($callbacks as $callback) {
    $callback();  // 輸出：0 1 2
}
```

## 總結

閉包和匿名函數是 PHP 函數式編程的核心特性，提供了靈活的函數傳遞和變量捕獲能力。箭頭函數（PHP 7.4+）進一步簡化了語法，使代碼更加簡潔。閉包在回調函數、延遲執行、工廠模式、依賴注入等場景中有廣泛應用。理解 Closure 類的方法（特別是 bindTo 和 call）可以實現高級功能，如訪問私有成員。在實際開發中，應該根據場景選擇合適的函數定義方式，並注意閉包的性能影響和常見陷阱。
