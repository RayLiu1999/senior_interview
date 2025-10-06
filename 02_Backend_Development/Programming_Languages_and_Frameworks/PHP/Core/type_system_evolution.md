# PHP 類型系統演進

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Type System`, `Type Hints`, `Modern PHP`

## 問題詳述

PHP 從動態類型語言逐步引入了強類型系統。請詳細解釋 PHP 類型系統的演進歷程、各版本的類型特性，以及嚴格模式的影響。

## 核心理論與詳解

### PHP 類型系統演進歷程

#### PHP 5.0-5.6：類和接口類型提示

**PHP 5.0**：引入類類型提示
```php
class User {}

function processUser(User $user) {
    // 只能傳入 User 實例
}
```

**PHP 5.1**：引入陣列類型提示
```php
function processArray(array $items) {
    // 只能傳入陣列
}
```

#### PHP 7.0：標量類型與返回類型

**標量類型提示**：
```php
function add(int $a, int $b): int {
    return $a + $b;
}

// 支持的標量類型：int, float, string, bool
```

**返回類型聲明**：
```php
function getName(): string {
    return 'John';
}

function getUser(): User {
    return new User();
}

function process(): void {
    // PHP 7.1+：void 表示無返回值
}
```

**嚴格模式**：
```php
<?php
declare(strict_types=1);

function add(int $a, int $b): int {
    return $a + $b;
}

add(1, 2);      // 正確
add('1', '2');  // TypeError（嚴格模式下）
```

#### PHP 7.1：Nullable 類型

**可空類型**：
```php
function findUser(int $id): ?User {
    // 可以返回 User 或 null
    return $user ?? null;
}

function setName(?string $name): void {
    // 可以接受 string 或 null
}
```

**void 返回類型**：
```php
function log(string $message): void {
    echo $message;
    // 不能有 return 語句或只能 return;
}
```

#### PHP 7.2：object 類型

**object 類型提示**：
```php
function process(object $obj): object {
    // 接受任何對象
    return $obj;
}
```

#### PHP 7.4：屬性類型聲明

**類屬性類型**：
```php
class User {
    public int $id;
    public string $name;
    public ?string $email = null;
    private float $balance = 0.0;
    
    public function __construct(int $id, string $name) {
        $this->id = $id;
        $this->name = $name;
    }
}
```

**類型檢查時機**：
- 賦值時檢查類型
- 未初始化的非空類型屬性訪問會拋出錯誤

#### PHP 8.0：重大類型系統改進

**聯合類型（Union Types）**：
```php
function process(int|float $number): int|float {
    return $number * 2;
}

function find(int $id): User|null {
    // 可以返回 User 或 null
    return $user ?? null;
}

// 多種類型
function handle(int|string|array $data): void {
    // 處理多種類型
}
```

**mixed 類型**：
```php
function process(mixed $value): mixed {
    // 接受任何類型（相當於沒有類型檢查）
    return $value;
}
```

**static 返回類型**：
```php
class Model {
    public function create(): static {
        // 返回當前類的實例（支持繼承）
        return new static();
    }
}

class User extends Model {}

$user = (new User())->create();  // User 類型，而非 Model
```

**構造器屬性提升**：
```php
// 傳統方式
class UserOld {
    public string $name;
    public string $email;
    
    public function __construct(string $name, string $email) {
        $this->name = $name;
        $this->email = $email;
    }
}

// PHP 8.0+
class User {
    public function __construct(
        public string $name,
        public string $email,
        private ?string $phone = null
    ) {
        // 屬性自動聲明和初始化
    }
}
```

#### PHP 8.1：更多類型特性

**交集類型（Intersection Types）**：
```php
interface Loggable {}
interface Cacheable {}

function process(Loggable&Cacheable $obj): void {
    // $obj 必須同時實現 Loggable 和 Cacheable
}
```

**純交集類型**：
```php
class Repository implements Loggable, Cacheable {}

function handle(Loggable&Cacheable $repo): void {
    // 只接受同時實現兩個接口的對象
}
```

**never 返回類型**：
```php
function redirect(string $url): never {
    header("Location: $url");
    exit;
    // 函數永不返回（拋出異常或終止執行）
}

function fail(string $message): never {
    throw new Exception($message);
}
```

#### PHP 8.2：類型系統增強

**DNF 類型（Disjunctive Normal Form）**：
```php
function process((A&B)|C $obj): void {
    // 接受 (A 且 B) 或 C
}

function handle((Loggable&Cacheable)|Database $obj): void {
    // 組合交集和聯合類型
}
```

**null 和 false 作為獨立類型**：
```php
function getValue(): string|null|false {
    // 可以返回 string、null 或 false
    return false;
}
```

### 嚴格模式詳解

#### declare(strict_types=1)

**作用範圍**：
- 只影響當前文件
- 必須是文件的第一個語句
- 不影響被調用的函數

**行為差異**：

```php
// 非嚴格模式（默認）
<?php
function add(int $a, int $b): int {
    return $a + $b;
}

add(1, 2);        // 3
add('1', '2');    // 3（自動轉換）
add(1.5, 2.5);    // 3（截斷小數）
add('1.5', '2.5'); // 3（先轉數字再截斷）

// 嚴格模式
<?php
declare(strict_types=1);

function add(int $a, int $b): int {
    return $a + $b;
}

add(1, 2);        // 3
add('1', '2');    // TypeError
add(1.5, 2.5);    // TypeError
```

**最佳實踐**：
- 新項目建議使用嚴格模式
- 嚴格模式有助於盡早發現類型錯誤
- 與靜態分析工具配合效果更佳

### 類型轉換規則

#### 非嚴格模式下的轉換

**標量類型轉換**：
```php
// int 參數
function acceptInt(int $n) {}

acceptInt(1);      // 1
acceptInt(1.5);    // 1（截斷）
acceptInt('1');    // 1（字符串轉整數）
acceptInt(true);   // 1（布爾轉整數）

// float 參數
function acceptFloat(float $f) {}

acceptFloat(1);    // 1.0
acceptFloat('1.5'); // 1.5
acceptFloat(true); // 1.0

// string 參數
function acceptString(string $s) {}

acceptString('hello'); // 'hello'
acceptString(123);     // '123'
acceptString(1.5);     // '1.5'

// bool 參數
function acceptBool(bool $b) {}

acceptBool(true);  // true
acceptBool(1);     // true
acceptBool('');    // false
acceptBool(0);     // false
```

#### 無法轉換的情況

即使在非嚴格模式下，某些轉換也會失敗：
```php
function acceptArray(array $arr) {}

acceptArray([1, 2, 3]);  // 正確
acceptArray('string');   // TypeError（無法轉換）

function acceptObject(object $obj) {}

acceptObject(new stdClass());  // 正確
acceptObject([]);              // TypeError（無法轉換）
```

### 類型協變與逆變

#### 返回類型協變（PHP 7.4+）

子類可以返回更具體的類型：
```php
class Animal {}
class Dog extends Animal {}

class Factory {
    public function create(): Animal {
        return new Animal();
    }
}

class DogFactory extends Factory {
    // 返回類型可以更具體
    public function create(): Dog {
        return new Dog();
    }
}
```

#### 參數類型逆變（PHP 7.4+）

子類可以接受更寬泛的參數類型：
```php
class Factory {
    public function process(Dog $dog): void {
        // 處理 Dog
    }
}

class FlexibleFactory extends Factory {
    // 參數類型可以更寬泛
    public function process(Animal $animal): void {
        // 可以處理所有 Animal
    }
}
```

### 實際應用建議

#### API 設計

```php
<?php
declare(strict_types=1);

interface UserRepositoryInterface {
    public function find(int $id): ?User;
    public function findAll(): array;
    public function save(User $user): void;
    public function delete(int $id): bool;
}

class User {
    public function __construct(
        public readonly int $id,
        public string $name,
        public string $email,
        public ?string $phone = null
    ) {}
}
```

#### 錯誤處理

```php
<?php
declare(strict_types=1);

class ValidationException extends Exception {
    public function __construct(
        public readonly array $errors,
        string $message = 'Validation failed'
    ) {
        parent::__construct($message);
    }
}

function validateUser(array $data): User|ValidationException {
    $errors = [];
    
    if (!isset($data['name'])) {
        $errors['name'] = 'Name is required';
    }
    
    if (!empty($errors)) {
        return new ValidationException($errors);
    }
    
    return new User(
        id: $data['id'],
        name: $data['name'],
        email: $data['email']
    );
}
```

#### 與靜態分析工具配合

```php
<?php
declare(strict_types=1);

/**
 * @psalm-param positive-int $id
 * @psalm-return User|null
 */
function findUser(int $id): ?User {
    if ($id <= 0) {
        throw new InvalidArgumentException('ID must be positive');
    }
    
    return $user ?? null;
}
```

### 性能影響

**類型檢查開銷**：
- 類型檢查有輕微的性能開銷（1-3%）
- 嚴格模式比非嚴格模式略快（避免類型轉換）
- 使用 OPcache 可以減少開銷
- 類型安全帶來的好處遠大於性能損失

**最佳實踐**：
1. 始終聲明參數和返回類型
2. 使用嚴格模式（`declare(strict_types=1)`）
3. 合理使用聯合類型和可空類型
4. 利用 static 和 self 的區別
5. 配合 PHPStan/Psalm 進行靜態分析

## 總結

PHP 類型系統從 PHP 5 到 PHP 8 經歷了巨大的演進，從最初的類和陣列類型提示，到現在支持標量類型、聯合類型、交集類型、never 類型等豐富的類型特性。嚴格模式的引入讓 PHP 可以在編譯時捕獲更多類型錯誤，顯著提升了代碼的健壯性和可維護性。現代 PHP 開發應該充分利用類型系統，配合靜態分析工具，構建類型安全的應用程式。
