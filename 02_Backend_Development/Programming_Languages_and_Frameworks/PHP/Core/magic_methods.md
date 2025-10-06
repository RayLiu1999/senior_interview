# PHP 魔術方法詳解

- **難度**: 7
- **重要程度**: 4
- **標籤**: `Magic Methods`, `OOP`, `Advanced`

## 問題詳述

PHP 提供了一系列魔術方法（Magic Methods），它們在特定情況下會被自動調用。請詳細解釋常用魔術方法的用途、觸發時機和最佳實踐。

## 核心理論與詳解

### 魔術方法概述

魔術方法是 PHP 中以雙下劃線 `__` 開頭的特殊方法，在特定情況下會被 PHP 自動調用。它們提供了面向對象編程的高級功能，如屬性重載、方法重載、對象序列化等。

### 構造與析構

#### __construct()

**用途**：類的構造函數，在創建對象時自動調用。

```php
class User
{
    private string $name;
    private string $email;
    
    public function __construct(string $name, string $email)
    {
        $this->name = $name;
        $this->email = $email;
    }
}

$user = new User('John', 'john@example.com');
```

**PHP 8 構造器屬性提升**：
```php
class User
{
    public function __construct(
        private string $name,
        private string $email,
        private ?string $phone = null
    ) {
        // 屬性自動聲明和賦值
    }
}
```

#### __destruct()

**用途**：析構函數，在對象銷毀時自動調用，用於清理資源。

```php
class FileHandler
{
    private $handle;
    
    public function __construct(string $filename)
    {
        $this->handle = fopen($filename, 'r');
    }
    
    public function __destruct()
    {
        if (is_resource($this->handle)) {
            fclose($this->handle);
        }
    }
}
```

**觸發時機**：
- 對象被顯式銷毀（`unset()`）
- 腳本執行結束
- 沒有任何引用指向該對象

### 屬性重載

#### __get()

**用途**：讀取不可訪問或不存在的屬性時觸發。

```php
class DynamicProperties
{
    private array $data = [];
    
    public function __get(string $name): mixed
    {
        if (array_key_exists($name, $this->data)) {
            return $this->data[$name];
        }
        
        throw new Exception("Property {$name} does not exist");
    }
}

$obj = new DynamicProperties();
echo $obj->name;  // 觸發 __get('name')
```

**實際應用 - 延遲加載**：
```php
class LazyLoader
{
    private array $loaded = [];
    
    public function __get(string $name): mixed
    {
        if (!isset($this->loaded[$name])) {
            // 延遲加載關聯數據
            $this->loaded[$name] = $this->loadRelation($name);
        }
        
        return $this->loaded[$name];
    }
    
    private function loadRelation(string $name): mixed
    {
        // 從數據庫或其他來源加載數據
        return DB::table($name)->find($this->id);
    }
}
```

#### __set()

**用途**：為不可訪問或不存在的屬性賦值時觸發。

```php
class DataContainer
{
    private array $data = [];
    
    public function __set(string $name, mixed $value): void
    {
        // 數據驗證
        if ($this->validate($name, $value)) {
            $this->data[$name] = $value;
        } else {
            throw new InvalidArgumentException("Invalid value for {$name}");
        }
    }
    
    private function validate(string $name, mixed $value): bool
    {
        // 實現驗證邏輯
        return true;
    }
}

$obj = new DataContainer();
$obj->username = 'john';  // 觸發 __set('username', 'john')
```

#### __isset()

**用途**：對不可訪問或不存在的屬性調用 `isset()` 或 `empty()` 時觸發。

```php
class CheckableProperties
{
    private array $data = ['name' => 'John'];
    
    public function __isset(string $name): bool
    {
        return isset($this->data[$name]);
    }
}

$obj = new CheckableProperties();
var_dump(isset($obj->name));  // true
var_dump(isset($obj->age));   // false
```

#### __unset()

**用途**：對不可訪問或不存在的屬性使用 `unset()` 時觸發。

```php
class UnsetableProperties
{
    private array $data = ['name' => 'John'];
    
    public function __unset(string $name): void
    {
        unset($this->data[$name]);
    }
}

$obj = new UnsetableProperties();
unset($obj->name);  // 觸發 __unset('name')
```

### 方法重載

#### __call()

**用途**：調用不可訪問或不存在的對象方法時觸發。

```php
class QueryBuilder
{
    private string $query = '';
    
    public function __call(string $method, array $args): self
    {
        // 動態構建查詢
        if (str_starts_with($method, 'where')) {
            $field = lcfirst(substr($method, 5));
            $this->query .= " WHERE {$field} = ?";
        }
        
        return $this;
    }
}

$qb = new QueryBuilder();
$qb->whereUsername('john')  // 觸發 __call('whereUsername', ['john'])
   ->whereAge(25);          // 觸發 __call('whereAge', [25])
```

**實際應用 - 方法轉發**：
```php
class Facade
{
    private object $target;
    
    public function __construct(object $target)
    {
        $this->target = $target;
    }
    
    public function __call(string $method, array $args): mixed
    {
        // 轉發方法調用到目標對象
        return $this->target->$method(...$args);
    }
}
```

#### __callStatic()

**用途**：調用不可訪問或不存在的靜態方法時觸發。

```php
class Router
{
    private static array $routes = [];
    
    public static function __callStatic(string $method, array $args): void
    {
        $httpMethod = strtoupper($method);
        [$uri, $handler] = $args;
        
        self::$routes[$httpMethod][$uri] = $handler;
    }
}

Router::get('/users', 'UserController@index');
Router::post('/users', 'UserController@store');
```

### 對象行為

#### __invoke()

**用途**：將對象當作函數調用時觸發。

```php
class Adder
{
    private int $base;
    
    public function __construct(int $base)
    {
        $this->base = $base;
    }
    
    public function __invoke(int $value): int
    {
        return $this->base + $value;
    }
}

$add5 = new Adder(5);
echo $add5(10);  // 15，觸發 __invoke(10)
```

**實際應用 - 回調函數**：
```php
class Validator
{
    public function __invoke(array $data): bool
    {
        // 執行驗證邏輯
        return !empty($data['email']);
    }
}

$validator = new Validator();
$valid = array_filter($users, $validator);  // 對象作為回調
```

#### __clone()

**用途**：使用 `clone` 關鍵字複製對象時觸發。

```php
class Document
{
    public string $title;
    public array $attachments;
    
    public function __clone()
    {
        // 深拷貝附件
        $this->attachments = array_map(
            fn($attachment) => clone $attachment,
            $this->attachments
        );
    }
}

$doc1 = new Document();
$doc2 = clone $doc1;  // 觸發 __clone()
```

### 對象轉換

#### __toString()

**用途**：將對象轉換為字符串時自動調用。

```php
class User
{
    public function __construct(
        private string $name,
        private string $email
    ) {}
    
    public function __toString(): string
    {
        return "{$this->name} <{$this->email}>";
    }
}

$user = new User('John', 'john@example.com');
echo $user;  // "John <john@example.com>"
```

**注意事項**：
- 必須返回字符串
- 不能拋出異常（PHP 7.4 之前）
- PHP 8+ 可以拋出異常

### 序列化

#### __serialize() 和 __unserialize()

**PHP 7.4+ 推薦方式**：

```php
class Session
{
    private string $token;
    private ?PDO $db = null;
    
    public function __serialize(): array
    {
        // 只序列化必要的數據
        return ['token' => $this->token];
    }
    
    public function __unserialize(array $data): void
    {
        $this->token = $data['token'];
        // 重新建立不可序列化的資源
        $this->db = new PDO(/* ... */);
    }
}
```

#### __sleep() 和 __wakeup()

**傳統方式（兼容舊版本）**：

```php
class Cache
{
    private array $data;
    private $connection;
    
    public function __sleep(): array
    {
        // 返回需要序列化的屬性名稱
        return ['data'];
    }
    
    public function __wakeup(): void
    {
        // 重新建立資源連接
        $this->connection = $this->createConnection();
    }
}
```

### 調試

#### __debugInfo()

**用途**：使用 `var_dump()` 時自定義輸出。

```php
class User
{
    private string $password;
    public string $name;
    public string $email;
    
    public function __debugInfo(): array
    {
        return [
            'name' => $this->name,
            'email' => $this->email,
            'password' => '******'  // 隱藏敏感信息
        ];
    }
}

$user = new User();
var_dump($user);  // 不會顯示真實密碼
```

### 最佳實踐

**性能考量**：
- 魔術方法會降低性能，避免在性能敏感的代碼中過度使用
- `__get` 和 `__set` 比直接訪問屬性慢約 3-5 倍
- 優先使用顯式方法而非魔術方法

**使用場景**：
- **屬性重載**：實現 DTO、動態屬性容器
- **方法重載**：實現 Facade、代理模式、流式接口
- **__invoke**：實現可調用對象、依賴注入容器
- **__toString**：實現對象的字符串表示
- **序列化**：處理不可序列化的資源

**避免濫用**：
```php
// 不推薦：過度使用魔術方法
class Bad
{
    public function __get($name) { /* ... */ }
    public function __set($name, $value) { /* ... */ }
    public function __call($method, $args) { /* ... */ }
}

// 推薦：明確的方法定義
class Good
{
    public function getName(): string { /* ... */ }
    public function setName(string $name): void { /* ... */ }
    public function doSomething(): void { /* ... */ }
}
```

## 總結

PHP 魔術方法提供了強大的元編程能力，允許開發者自定義對象在特定情況下的行為。合理使用魔術方法可以實現優雅的 API 設計和強大的功能，如屬性延遲加載、方法動態調用、對象序列化等。但需要注意，魔術方法會帶來性能開銷和代碼可讀性的降低，應該在真正需要時才使用，並在文檔中清楚說明其行為。
