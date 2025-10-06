# PHP 反射機制

- **難度**: 8
- **重要程度**: 4
- **標籤**: `Reflection`, `Metaprogramming`, `Advanced`

## 問題詳述

PHP 反射（Reflection）API 提供了在運行時檢查和操作類、方法、屬性的能力。請解釋反射的工作原理、使用場景和在框架中的應用。

## 核心理論與詳解

### 反射概述

反射是一種在運行時動態獲取程式結構信息的能力，可以檢查類、接口、方法、屬性等，並在運行時動態調用或修改它們。

**核心用途**：
- **依賴注入容器**：自動解析和注入依賴
- **ORM 框架**：將對象映射到數據庫表
- **路由系統**：動態調用控制器方法
- **測試框架**：訪問私有方法和屬性
- **序列化**：自動將對象轉換為數組或 JSON

### 反射類

#### ReflectionClass

用於檢查類的信息。

```php
class User
{
    private string $name;
    public string $email;
    
    public function __construct(string $name, string $email)
    {
        $this->name = $name;
        $this->email = $email;
    }
    
    public function getName(): string
    {
        return $this->name;
    }
}

$reflector = new ReflectionClass(User::class);

// 獲取類名
echo $reflector->getName();  // User
echo $reflector->getShortName();  // User（不含命名空間）

// 檢查類類型
var_dump($reflector->isAbstract());  // false
var_dump($reflector->isFinal());     // false
var_dump($reflector->isInterface()); // false

// 獲取父類
$parent = $reflector->getParentClass();

// 獲取接口
$interfaces = $reflector->getInterfaces();

// 創建實例
$user = $reflector->newInstance('John', 'john@example.com');
$user = $reflector->newInstanceArgs(['John', 'john@example.com']);
```

#### ReflectionMethod

用於檢查和調用方法。

```php
$method = $reflector->getMethod('getName');

// 方法信息
echo $method->getName();  // getName
var_dump($method->isPublic());    // true
var_dump($method->isStatic());    // false
var_dump($method->isAbstract());  // false

// 獲取參數
$parameters = $method->getParameters();

// 調用方法
$user = new User('John', 'john@example.com');
$name = $method->invoke($user);  // 'John'

// 調用私有方法
$method->setAccessible(true);
$result = $method->invoke($user);
```

**動態調用示例**：
```php
class Controller
{
    public function index(): string
    {
        return 'Index page';
    }
    
    public function show(int $id): string
    {
        return "Show item: $id";
    }
}

function callAction(string $action, array $params = []): string
{
    $controller = new Controller();
    $reflector = new ReflectionClass($controller);
    $method = $reflector->getMethod($action);
    
    // 動態調用方法
    return $method->invokeArgs($controller, $params);
}

echo callAction('index');        // 'Index page'
echo callAction('show', [123]);  // 'Show item: 123'
```

#### ReflectionProperty

用於檢查和操作屬性。

```php
$property = $reflector->getProperty('name');

// 屬性信息
echo $property->getName();  // name
var_dump($property->isPublic());   // false
var_dump($property->isPrivate());  // true
var_dump($property->isStatic());   // false

// 獲取屬性值（需要先設置為可訪問）
$property->setAccessible(true);
$name = $property->getValue($user);

// 設置屬性值
$property->setValue($user, 'Jane');

// 獲取屬性類型（PHP 7.4+）
$type = $property->getType();
echo $type->getName();  // string
```

**實際應用 - 對象轉陣列**：
```php
function objectToArray(object $object): array
{
    $reflector = new ReflectionClass($object);
    $properties = $reflector->getProperties();
    $result = [];
    
    foreach ($properties as $property) {
        $property->setAccessible(true);
        $result[$property->getName()] = $property->getValue($object);
    }
    
    return $result;
}

$user = new User('John', 'john@example.com');
$array = objectToArray($user);
// ['name' => 'John', 'email' => 'john@example.com']
```

#### ReflectionParameter

用於檢查函數或方法參數。

```php
class Service
{
    public function process(string $data, int $limit = 10, ?User $user = null): void
    {
        // ...
    }
}

$method = new ReflectionMethod(Service::class, 'process');
$parameters = $method->getParameters();

foreach ($parameters as $param) {
    echo $param->getName();  // data, limit, user
    
    // 檢查是否有類型
    if ($param->hasType()) {
        $type = $param->getType();
        echo $type->getName();  // string, int, User
        var_dump($type->allowsNull());  // false, false, true
    }
    
    // 檢查是否有默認值
    if ($param->isDefaultValueAvailable()) {
        var_dump($param->getDefaultValue());  // 10
    }
    
    // 檢查是否為可選參數
    var_dump($param->isOptional());  // false, true, true
}
```

### 依賴注入容器實現

反射的最重要應用之一是實現依賴注入容器。

```php
class Container
{
    private array $bindings = [];
    private array $instances = [];
    
    public function bind(string $abstract, callable $concrete): void
    {
        $this->bindings[$abstract] = $concrete;
    }
    
    public function singleton(string $abstract, callable $concrete): void
    {
        $this->bind($abstract, $concrete);
        $this->instances[$abstract] = null;
    }
    
    public function make(string $abstract): object
    {
        // 如果是單例且已創建，直接返回
        if (isset($this->instances[$abstract]) && $this->instances[$abstract] !== null) {
            return $this->instances[$abstract];
        }
        
        // 如果有綁定，使用綁定
        if (isset($this->bindings[$abstract])) {
            $instance = $this->bindings[$abstract]($this);
        } else {
            // 否則嘗試自動解析
            $instance = $this->resolve($abstract);
        }
        
        // 如果是單例，保存實例
        if (array_key_exists($abstract, $this->instances)) {
            $this->instances[$abstract] = $instance;
        }
        
        return $instance;
    }
    
    private function resolve(string $class): object
    {
        $reflector = new ReflectionClass($class);
        
        // 檢查類是否可實例化
        if (!$reflector->isInstantiable()) {
            throw new Exception("Class {$class} is not instantiable");
        }
        
        $constructor = $reflector->getConstructor();
        
        // 如果沒有構造函數，直接創建實例
        if ($constructor === null) {
            return new $class;
        }
        
        // 獲取構造函數參數
        $parameters = $constructor->getParameters();
        $dependencies = [];
        
        foreach ($parameters as $parameter) {
            $type = $parameter->getType();
            
            if ($type === null) {
                // 沒有類型提示，檢查默認值
                if ($parameter->isDefaultValueAvailable()) {
                    $dependencies[] = $parameter->getDefaultValue();
                } else {
                    throw new Exception("Cannot resolve parameter: {$parameter->getName()}");
                }
            } elseif ($type instanceof ReflectionNamedType && !$type->isBuiltin()) {
                // 類型是類，遞歸解析
                $dependencies[] = $this->make($type->getName());
            } else {
                // 基本類型，檢查默認值
                if ($parameter->isDefaultValueAvailable()) {
                    $dependencies[] = $parameter->getDefaultValue();
                } else {
                    throw new Exception("Cannot resolve parameter: {$parameter->getName()}");
                }
            }
        }
        
        // 創建實例
        return $reflector->newInstanceArgs($dependencies);
    }
}

// 使用示例
class Database
{
    public function query(string $sql): array
    {
        return [];
    }
}

class UserRepository
{
    public function __construct(private Database $db) {}
    
    public function find(int $id): ?array
    {
        return $this->db->query("SELECT * FROM users WHERE id = $id");
    }
}

class UserService
{
    public function __construct(private UserRepository $repository) {}
    
    public function getUser(int $id): ?array
    {
        return $this->repository->find($id);
    }
}

$container = new Container();
$service = $container->make(UserService::class);
// 自動注入 UserRepository 和 Database
```

### 反射與屬性（Attributes）

PHP 8 引入的屬性（Attributes）與反射緊密結合。

```php
#[Route('/api/users', methods: ['GET', 'POST'])]
class UserController
{
    #[Route('/api/users/{id}', methods: ['GET'])]
    public function show(int $id): array
    {
        return ['id' => $id];
    }
}

// 讀取屬性
$reflector = new ReflectionClass(UserController::class);
$attributes = $reflector->getAttributes(Route::class);

foreach ($attributes as $attribute) {
    $route = $attribute->newInstance();
    echo $route->path;  // '/api/users'
    print_r($route->methods);  // ['GET', 'POST']
}

// 讀取方法屬性
$method = $reflector->getMethod('show');
$attributes = $method->getAttributes(Route::class);
```

### 性能考量

**性能開銷**：
- 反射操作比直接訪問慢 10-100 倍
- 應該在初始化階段使用，避免在請求處理中頻繁使用
- 可以快取反射結果

**快取反射結果**：
```php
class ReflectionCache
{
    private static array $cache = [];
    
    public static function getClass(string $class): ReflectionClass
    {
        if (!isset(self::$cache[$class])) {
            self::$cache[$class] = new ReflectionClass($class);
        }
        
        return self::$cache[$class];
    }
}
```

### 實際應用場景

**ORM 實現**：
```php
class Model
{
    public function toArray(): array
    {
        $reflector = new ReflectionClass($this);
        $properties = $reflector->getProperties(ReflectionProperty::IS_PUBLIC);
        $result = [];
        
        foreach ($properties as $property) {
            $result[$property->getName()] = $property->getValue($this);
        }
        
        return $result;
    }
    
    public function fill(array $data): void
    {
        $reflector = new ReflectionClass($this);
        
        foreach ($data as $key => $value) {
            if ($reflector->hasProperty($key)) {
                $property = $reflector->getProperty($key);
                if ($property->isPublic()) {
                    $property->setValue($this, $value);
                }
            }
        }
    }
}
```

**API 資源轉換**：
```php
class ResourceTransformer
{
    public function transform(object $resource): array
    {
        $reflector = new ReflectionClass($resource);
        $methods = $reflector->getMethods(ReflectionMethod::IS_PUBLIC);
        $result = [];
        
        foreach ($methods as $method) {
            $name = $method->getName();
            
            // 只處理 getter 方法
            if (str_starts_with($name, 'get') && $method->getNumberOfParameters() === 0) {
                $key = lcfirst(substr($name, 3));  // getName -> name
                $result[$key] = $method->invoke($resource);
            }
        }
        
        return $result;
    }
}
```

## 總結

PHP 反射 API 是實現高級框架功能的基礎，如依賴注入、ORM、路由系統等都依賴反射來動態處理類和對象。雖然反射有一定的性能開銷，但通過合理使用快取和在初始化階段執行反射操作，可以將影響降到最低。理解反射機制不僅有助於使用現有框架，也是開發高質量 PHP 應用和框架的必備技能。
