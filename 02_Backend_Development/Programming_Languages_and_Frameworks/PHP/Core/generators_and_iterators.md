# PHP 生成器與迭代器

- **難度**: 7
- **重要程度**: 4
- **標籤**: `Generator`, `Iterator`, `Memory Optimization`

## 問題詳述

PHP 提供了生成器（Generator）和迭代器（Iterator）來處理大量數據而不消耗過多記憶體。請解釋這兩種機制的原理、使用場景和性能優勢。

## 核心理論與詳解

### 生成器（Generator）

#### 基本概念

生成器是 PHP 5.5 引入的特性，提供了一種簡單的方式來實現迭代器，無需實現 Iterator 接口。生成器使用 `yield` 關鍵字來產生值。

**記憶體優勢**：
- 傳統方式：一次性將所有數據加載到記憶體
- 生成器：按需生成數據，只保存當前狀態

**基本用法**：
```php
function numberGenerator(): Generator
{
    for ($i = 1; $i <= 1000000; $i++) {
        yield $i;  // 產生值並暫停執行
    }
}

foreach (numberGenerator() as $number) {
    echo $number . "\n";
    // 生成器只在需要時才生成下一個值
}
```

**對比傳統方式**：
```php
// 傳統方式：消耗大量記憶體
function traditionalArray(): array
{
    $result = [];
    for ($i = 1; $i <= 1000000; $i++) {
        $result[] = $i;  // 全部存入記憶體
    }
    return $result;  // 返回時記憶體已滿
}

// 生成器：記憶體占用極低
function generator(): Generator
{
    for ($i = 1; $i <= 1000000; $i++) {
        yield $i;  // 逐個產生，不佔記憶體
    }
}
```

#### yield 關鍵字

**yield 的作用**：
1. 產生一個值給迭代器
2. 暫停函數執行
3. 保存當前狀態
4. 等待下次迭代時恢復執行

**yield 語法變化**：
```php
// 產生值
function gen1(): Generator
{
    yield 1;
    yield 2;
    yield 3;
}

// 產生鍵值對
function gen2(): Generator
{
    yield 'name' => 'John';
    yield 'age' => 30;
    yield 'email' => 'john@example.com';
}

// yield from（PHP 7.0+）：委託給另一個生成器
function gen3(): Generator
{
    yield from gen1();  // 委託給 gen1
    yield from gen2();  // 委託給 gen2
}
```

#### 雙向通訊

生成器支持雙向通訊，可以向生成器發送值。

**send() 方法**：
```php
function counter(): Generator
{
    $count = 0;
    while (true) {
        // 接收外部發送的值
        $reset = yield $count;
        
        if ($reset) {
            $count = 0;
        } else {
            $count++;
        }
    }
}

$gen = counter();
echo $gen->current();    // 0
$gen->next();
echo $gen->current();    // 1
$gen->send(true);        // 發送 true，重置計數器
echo $gen->current();    // 0
```

**throw() 方法**：
```php
function errorHandler(): Generator
{
    try {
        while (true) {
            yield 'value';
        }
    } catch (Exception $e) {
        echo "Caught: " . $e->getMessage();
    }
}

$gen = errorHandler();
$gen->next();
$gen->throw(new Exception('Error occurred'));  // 向生成器拋出異常
```

#### 實際應用場景

**文件逐行讀取**：
```php
function readLargeFile(string $filename): Generator
{
    $file = fopen($filename, 'r');
    
    try {
        while (!feof($file)) {
            yield fgets($file);  // 逐行讀取
        }
    } finally {
        fclose($file);
    }
}

// 記憶體占用極低，即使文件有幾 GB
foreach (readLargeFile('huge.log') as $line) {
    if (str_contains($line, 'ERROR')) {
        echo $line;
    }
}
```

**分頁數據獲取**：
```php
function fetchUsers(PDO $pdo): Generator
{
    $page = 1;
    $perPage = 1000;
    
    while (true) {
        $offset = ($page - 1) * $perPage;
        $stmt = $pdo->query(
            "SELECT * FROM users LIMIT {$perPage} OFFSET {$offset}"
        );
        
        $users = $stmt->fetchAll();
        
        if (empty($users)) {
            break;
        }
        
        foreach ($users as $user) {
            yield $user;  // 逐個產生用戶
        }
        
        $page++;
    }
}

// 處理數百萬用戶，記憶體占用穩定
foreach (fetchUsers($pdo) as $user) {
    processUser($user);
}
```

**數據處理管道**：
```php
function readCsv(string $file): Generator
{
    $handle = fopen($file, 'r');
    while ($row = fgetcsv($handle)) {
        yield $row;
    }
    fclose($handle);
}

function filterRows(Generator $rows): Generator
{
    foreach ($rows as $row) {
        if ($row[0] !== '') {  // 過濾空行
            yield $row;
        }
    }
}

function transformRows(Generator $rows): Generator
{
    foreach ($rows as $row) {
        yield array_map('trim', $row);  // 轉換數據
    }
}

// 構建處理管道
$pipeline = transformRows(
    filterRows(
        readCsv('data.csv')
    )
);

foreach ($pipeline as $row) {
    // 處理數據
}
```

### 迭代器（Iterator）

#### Iterator 接口

Iterator 接口定義了對象可以被迭代的標準方式。

**接口定義**：
```php
interface Iterator extends Traversable
{
    public function current(): mixed;  // 返回當前元素
    public function key(): mixed;      // 返回當前鍵
    public function next(): void;      // 移動到下一個元素
    public function rewind(): void;    // 重置到第一個元素
    public function valid(): bool;     // 檢查當前位置是否有效
}
```

**實現 Iterator**：
```php
class ArrayIterator implements Iterator
{
    private array $items;
    private int $position = 0;
    
    public function __construct(array $items)
    {
        $this->items = $items;
    }
    
    public function current(): mixed
    {
        return $this->items[$this->position];
    }
    
    public function key(): mixed
    {
        return $this->position;
    }
    
    public function next(): void
    {
        $this->position++;
    }
    
    public function rewind(): void
    {
        $this->position = 0;
    }
    
    public function valid(): bool
    {
        return isset($this->items[$this->position]);
    }
}

// 使用
$iterator = new ArrayIterator([1, 2, 3, 4, 5]);
foreach ($iterator as $key => $value) {
    echo "$key => $value\n";
}
```

#### IteratorAggregate 接口

IteratorAggregate 提供了更簡單的方式來創建可迭代對象。

**接口定義**：
```php
interface IteratorAggregate extends Traversable
{
    public function getIterator(): Traversable;
}
```

**實現範例**：
```php
class UserCollection implements IteratorAggregate
{
    private array $users = [];
    
    public function add(User $user): void
    {
        $this->users[] = $user;
    }
    
    public function getIterator(): Traversable
    {
        return new ArrayIterator($this->users);
    }
}

$collection = new UserCollection();
$collection->add(new User('John'));
$collection->add(new User('Jane'));

foreach ($collection as $user) {
    echo $user->getName();
}
```

#### SPL 迭代器

PHP 的 SPL（Standard PHP Library）提供了豐富的迭代器實現。

**常用 SPL 迭代器**：

```php
// ArrayIterator：陣列迭代器
$array = ['a', 'b', 'c'];
$iterator = new ArrayIterator($array);

// FilterIterator：過濾迭代器
class EvenFilterIterator extends FilterIterator
{
    public function accept(): bool
    {
        return $this->current() % 2 === 0;
    }
}

$numbers = new ArrayIterator([1, 2, 3, 4, 5, 6]);
$evenNumbers = new EvenFilterIterator($numbers);

// LimitIterator：限制迭代器
$limited = new LimitIterator($numbers, 0, 3);  // 只取前 3 個

// CachingIterator：快取迭代器
$caching = new CachingIterator($numbers);

// DirectoryIterator：目錄迭代器
foreach (new DirectoryIterator('.') as $file) {
    echo $file->getFilename() . "\n";
}

// RecursiveDirectoryIterator：遞歸目錄迭代器
$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator('.'),
    RecursiveIteratorIterator::SELF_FIRST
);

foreach ($iterator as $file) {
    echo $file->getPathname() . "\n";
}
```

**迭代器鏈**：
```php
// 組合多個迭代器
$numbers = new ArrayIterator(range(1, 100));
$even = new CallbackFilterIterator($numbers, fn($n) => $n % 2 === 0);
$limited = new LimitIterator($even, 0, 5);

foreach ($limited as $number) {
    echo $number . "\n";  // 輸出前 5 個偶數
}
```

### 生成器 vs 迭代器

**對比表格**：

| 特性 | 生成器 | 迭代器 |
|------|--------|--------|
| 實現複雜度 | 簡單（使用 yield） | 複雜（實現接口） |
| 代碼量 | 少 | 多 |
| 記憶體效率 | 極高 | 高 |
| 靈活性 | 中等 | 高 |
| 可重用性 | 一次性迭代 | 可多次迭代 |
| 雙向通訊 | 支持（send/throw） | 需自行實現 |

**選擇建議**：
- **使用生成器**：簡單的數據流處理、一次性迭代、記憶體敏感場景
- **使用迭代器**：需要複雜的迭代邏輯、可重用的迭代、需要多次迭代同一數據

### 性能優化實踐

**記憶體對比測試**：
```php
// 傳統方式：~400MB 記憶體
function loadAllUsers(): array
{
    $users = [];
    for ($i = 0; $i < 1000000; $i++) {
        $users[] = ['id' => $i, 'name' => "User $i"];
    }
    return $users;
}

// 生成器方式：~1MB 記憶體
function generateUsers(): Generator
{
    for ($i = 0; $i < 1000000; $i++) {
        yield ['id' => $i, 'name' => "User $i"];
    }
}
```

**最佳實踐**：
1. **處理大文件**：逐行讀取而非一次性載入
2. **數據庫查詢**：使用游標或分頁查詢，配合生成器
3. **API 數據**：分批獲取遠程數據
4. **數據轉換**：構建處理管道，逐步轉換數據
5. **日誌分析**：掃描大型日誌文件

## 總結

生成器和迭代器是 PHP 中處理大量數據的強大工具，它們通過延遲計算和按需生成數據來大幅降低記憶體占用。生成器提供了簡潔的語法來實現迭代器模式，適合大多數場景。迭代器則提供了更高的靈活性，適合需要複雜迭代邏輯的場景。在處理大文件、大數據集或需要構建數據處理管道時，合理使用這些特性可以顯著提升應用的性能和穩定性。
