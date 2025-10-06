# PHP 錯誤與異常處理機制

- **難度**: 6
- **重要程度**: 5
- **標籤**: `Error Handling`, `Exception`, `Debugging`

## 問題詳述

PHP 提供了錯誤和異常兩種不同的錯誤處理機制。請解釋這兩者的區別、PHP 7+ 的錯誤處理改進，以及生產環境中的最佳實踐。

## 核心理論與詳解

### 錯誤 vs 異常

#### 錯誤（Errors）

**定義**：錯誤是 PHP 引擎在執行過程中遇到問題時產生的，通常表示程式或環境的問題。

**錯誤類型**：
- **E_ERROR**：致命錯誤，腳本終止執行
- **E_WARNING**：警告，腳本繼續執行
- **E_NOTICE**：通知，通常是代碼不規範
- **E_PARSE**：解析錯誤，編譯時錯誤
- **E_STRICT**：嚴格模式建議
- **E_DEPRECATED**：使用了已廢棄的功能
- **E_USER_ERROR/WARNING/NOTICE**：用戶自定義錯誤

**錯誤處理**：
```php
// 設置錯誤報告級別
error_reporting(E_ALL);

// 自定義錯誤處理器
set_error_handler(function ($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// 恢復默認錯誤處理器
restore_error_handler();
```

#### 異常（Exceptions）

**定義**：異常是 PHP 5 引入的面向對象錯誤處理機制，可以被捕獲和處理。

**異常層次結構**：
```
Throwable (interface)
├── Error (PHP 7+)
│   ├── ParseError
│   ├── TypeError
│   ├── ArithmeticError
│   │   └── DivisionByZeroError
│   └── AssertionError
└── Exception
    ├── LogicException
    │   ├── BadFunctionCallException
    │   ├── BadMethodCallException
    │   ├── DomainException
    │   ├── InvalidArgumentException
    │   ├── LengthException
    │   └── OutOfRangeException
    └── RuntimeException
        ├── OutOfBoundsException
        ├── OverflowException
        ├── RangeException
        ├── UnderflowException
        └── UnexpectedValueException
```

### PHP 7+ 錯誤處理改進

#### Throwable 接口

PHP 7 引入了 `Throwable` 接口，統一了錯誤和異常的處理。

**Throwable 接口**：
```php
interface Throwable {
    public function getMessage(): string;
    public function getCode(): int;
    public function getFile(): string;
    public function getLine(): int;
    public function getTrace(): array;
    public function getTraceAsString(): string;
    public function getPrevious(): ?Throwable;
    public function __toString(): string;
}
```

**統一捕獲**：
```php
try {
    // 可能產生錯誤或異常的代碼
    $result = 1 / 0;  // DivisionByZeroError
    undefinedFunction();  // Error
} catch (Throwable $e) {
    // 同時捕獲錯誤和異常
    echo "捕獲到: " . $e->getMessage();
}
```

#### Error 類

PHP 7 將大部分致命錯誤轉換為 Error 對象，可以被 try-catch 捕獲。

**可捕獲的錯誤**：
```php
// TypeError
function add(int $a, int $b): int {
    return $a + $b;
}

try {
    add("1", "2");  // TypeError
} catch (TypeError $e) {
    echo "類型錯誤: " . $e->getMessage();
}

// DivisionByZeroError (PHP 8+)
try {
    $result = 1 % 0;
} catch (DivisionByZeroError $e) {
    echo "除零錯誤";
}

// ParseError
try {
    eval('$x = ;');  // 語法錯誤
} catch (ParseError $e) {
    echo "解析錯誤";
}
```

### 異常處理最佳實踐

#### Try-Catch-Finally

**基本用法**：
```php
try {
    // 嘗試執行的代碼
    $result = riskyOperation();
} catch (SpecificException $e) {
    // 處理特定異常
    logger()->error($e->getMessage());
} catch (Exception $e) {
    // 處理其他異常
    logger()->error($e);
} finally {
    // 無論是否發生異常都會執行
    cleanup();
}
```

**多重 Catch（PHP 7.1+）**：
```php
try {
    operation();
} catch (FirstException | SecondException $e) {
    // 處理多種異常
    handleException($e);
}
```

**不捕獲異常**：
```php
try {
    // 不需要 catch 塊，但需要 finally
} finally {
    // 清理資源
    fclose($file);
}
```

#### 自定義異常

**創建自定義異常**：
```php
class ValidationException extends Exception
{
    protected array $errors;
    
    public function __construct(array $errors, $message = "Validation failed")
    {
        parent::__construct($message);
        $this->errors = $errors;
    }
    
    public function getErrors(): array
    {
        return $this->errors;
    }
}

// 使用
try {
    if (empty($email)) {
        throw new ValidationException(['email' => 'Email is required']);
    }
} catch (ValidationException $e) {
    return response()->json([
        'message' => $e->getMessage(),
        'errors' => $e->getErrors()
    ], 422);
}
```

**異常鏈**：
```php
try {
    // 底層操作
    connectToDatabase();
} catch (PDOException $e) {
    // 包裝原始異常
    throw new DatabaseException(
        "Failed to connect to database",
        0,
        $e  // 保存原始異常
    );
}

// 獲取原始異常
$original = $exception->getPrevious();
```

### 錯誤處理策略

#### 全局錯誤處理器

**註冊處理器**：
```php
// 錯誤處理器
set_error_handler(function ($severity, $message, $file, $line) {
    // 將錯誤轉換為異常
    if (error_reporting() & $severity) {
        throw new ErrorException($message, 0, $severity, $file, $line);
    }
});

// 異常處理器
set_exception_handler(function (Throwable $e) {
    // 記錄異常
    logException($e);
    
    // 顯示友好錯誤頁面
    if (!headers_sent()) {
        http_response_code(500);
    }
    
    if (isProduction()) {
        echo "An error occurred. Please try again later.";
    } else {
        // 開發環境顯示詳細信息
        echo "<pre>";
        echo $e->getMessage() . "\n";
        echo $e->getTraceAsString();
        echo "</pre>";
    }
});

// 致命錯誤處理
register_shutdown_function(function () {
    $error = error_get_last();
    
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        // 處理致命錯誤
        logError($error);
        
        if (!headers_sent()) {
            http_response_code(500);
        }
        
        echo "A fatal error occurred.";
    }
});
```

#### 環境相關配置

**開發環境**：
```php
// 顯示所有錯誤
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
```

**生產環境**：
```php
// 隱藏錯誤，記錄到日誌
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', '/var/log/php/error.log');
error_reporting(E_ALL);
```

### 日誌記錄

#### PSR-3 日誌接口

**日誌級別**：
```php
use Psr\Log\LoggerInterface;

class ErrorHandler
{
    private LoggerInterface $logger;
    
    public function handle(Throwable $e): void
    {
        // 根據異常類型選擇日誌級別
        if ($e instanceof CriticalException) {
            $this->logger->critical($e->getMessage(), [
                'exception' => $e,
                'user_id' => auth()->id()
            ]);
        } elseif ($e instanceof ValidationException) {
            $this->logger->info($e->getMessage(), [
                'errors' => $e->getErrors()
            ]);
        } else {
            $this->logger->error($e->getMessage(), [
                'exception' => $e
            ]);
        }
    }
}
```

**結構化日誌**：
```php
$logger->error('Database connection failed', [
    'host' => $host,
    'port' => $port,
    'exception' => $exception,
    'trace' => $exception->getTraceAsString(),
    'context' => [
        'user_id' => auth()->id(),
        'request_id' => request()->id(),
        'ip' => request()->ip()
    ]
]);
```

### Assert 斷言

PHP 7+ 改進了斷言機制，用於開發和測試。

**配置斷言**：
```php
// 啟用斷言（開發環境）
assert_options(ASSERT_ACTIVE, 1);
assert_options(ASSERT_EXCEPTION, 1);  // 拋出異常

// 禁用斷言（生產環境）
assert_options(ASSERT_ACTIVE, 0);
```

**使用斷言**：
```php
// 舊語法
assert($value > 0, 'Value must be positive');

// 新語法（PHP 7+）
assert($value > 0, new AssertionError('Value must be positive'));

// Zend Assertions（推薦）
zend.assertions = 1        // 開發環境
zend.assertions = -1       // 生產環境（編譯時移除）
```

### 最佳實踐總結

**異常使用原則**：
1. **使用異常處理異常情況**：不要用異常控制正常流程
2. **選擇合適的異常類型**：使用 SPL 異常或自定義異常
3. **提供有意義的錯誤信息**：包含足夠的上下文
4. **保留異常鏈**：使用 `previous` 參數保存原始異常
5. **在適當的層級捕獲**：不要過早捕獲異常

**錯誤處理原則**：
1. **開發環境顯示錯誤**：幫助調試
2. **生產環境隱藏錯誤**：避免洩露敏感信息
3. **記錄所有錯誤**：用於事後分析
4. **優雅降級**：提供友好的錯誤頁面
5. **監控和告警**：及時發現和處理問題

**框架集成**：
```php
// Laravel 異常處理
class Handler extends ExceptionHandler
{
    public function render($request, Throwable $e)
    {
        if ($e instanceof ValidationException) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }
        
        if ($e instanceof ModelNotFoundException) {
            return response()->json([
                'message' => 'Resource not found'
            ], 404);
        }
        
        return parent::render($request, $e);
    }
}
```

## 總結

PHP 的錯誤和異常處理機制在 PHP 7+ 中得到了顯著改進，通過 Throwable 接口統一了錯誤和異常的處理。理解這兩種機制的區別和適用場景，合理使用自定義異常，配置環境相關的錯誤顯示和日誌記錄，是構建穩定可靠 PHP 應用的關鍵。在生產環境中，應該隱藏詳細錯誤信息，記錄到日誌，並提供友好的錯誤頁面，同時建立完善的監控和告警機制。
