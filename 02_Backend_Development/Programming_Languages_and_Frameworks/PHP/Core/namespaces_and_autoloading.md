# PHP 命名空間與自動載入機制

- **難度**: 5
- **重要程度**: 5
- **標籤**: `Namespace`, `Autoloading`, `PSR-4`

## 問題詳述

命名空間和自動載入是現代 PHP 開發的基礎。請解釋 PHP 的命名空間機制、PSR-4 自動載入標準，以及 Composer 如何實現自動載入。

## 核心理論與詳解

### 命名空間（Namespace）

命名空間是 PHP 5.3 引入的重要特性，用於解決類名衝突和組織代碼。

#### 基本概念

**命名空間的作用**：
- **避免命名衝突**：不同庫可以使用相同的類名
- **代碼組織**：按功能或模組組織代碼
- **提高可讀性**：明確類的來源和用途

**命名空間的定義**：
```php
<?php
namespace App\Controllers;

class UserController {
    // 完全限定名稱：App\Controllers\UserController
}
```

**子命名空間**：
```php
<?php
namespace App\Http\Controllers;
// 使用反斜線分隔層級
```

#### 使用命名空間

**完全限定名稱（Fully Qualified Name）**：
```php
$controller = new \App\Controllers\UserController();
```

**use 導入**：
```php
use App\Controllers\UserController;
use App\Services\UserService as Service;

$controller = new UserController();
$service = new Service();
```

**別名（Aliasing）**：
```php
use App\Services\UserService as US;
$service = new US();
```

**群組導入（PHP 7.0+）**：
```php
use App\{
    Controllers\UserController,
    Services\UserService,
    Models\User
};
```

### 自動載入（Autoloading）

自動載入機制允許 PHP 在需要時自動載入類文件，無需手動 require 或 include。

#### SPL Autoload

**spl_autoload_register**：註冊自動載入函數
```php
spl_autoload_register(function ($class) {
    // 將命名空間轉換為文件路徑
    $file = str_replace('\\', DIRECTORY_SEPARATOR, $class) . '.php';
    
    if (file_exists($file)) {
        require $file;
    }
});
```

**鏈式自動載入**：可註冊多個自動載入函數
```php
spl_autoload_register('autoloader1');
spl_autoload_register('autoloader2');
// 按註冊順序依次嘗試
```

### PSR-4 自動載入標準

PSR-4 是 PHP-FIG 制定的自動載入標準，定義了命名空間與文件路徑的映射規則。

#### PSR-4 規則

**基本規則**：
1. 完全限定類名必須有一個頂級命名空間（供應商命名空間）
2. 可以有一個或多個子命名空間
3. 必須有一個終止類名
4. 命名空間前綴與基礎目錄相對應
5. 命名空間分隔符轉換為目錄分隔符
6. 類名對應 `.php` 文件

**映射範例**：
```
命名空間前綴: App\
基礎目錄: src/

App\Controllers\UserController
→ src/Controllers/UserController.php

App\Models\User
→ src/Models/User.php
```

#### PSR-4 實現

**手動實現**：
```php
spl_autoload_register(function ($class) {
    // 命名空間前綴
    $prefix = 'App\\';
    
    // 基礎目錄
    $base_dir = __DIR__ . '/src/';
    
    // 檢查類是否使用此前綴
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    // 獲取相對類名
    $relative_class = substr($class, $len);
    
    // 轉換為文件路徑
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    
    // 載入文件
    if (file_exists($file)) {
        require $file;
    }
});
```

### Composer 自動載入

Composer 是 PHP 的依賴管理工具，提供了強大的自動載入功能。

#### composer.json 配置

**PSR-4 自動載入**：
```json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/",
            "Tests\\": "tests/"
        }
    }
}
```

**Classmap 自動載入**：
```json
{
    "autoload": {
        "classmap": ["database/seeds", "database/factories"]
    }
}
```

**Files 自動載入**：
```json
{
    "autoload": {
        "files": ["src/helpers.php"]
    }
}
```

**混合使用**：
```json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        },
        "classmap": ["database"],
        "files": ["src/helpers.php"]
    },
    "autoload-dev": {
        "psr-4": {
            "Tests\\": "tests/"
        }
    }
}
```

#### Composer 自動載入原理

**生成自動載入文件**：
```bash
composer dump-autoload
```

生成的文件位於 `vendor/autoload.php`：
```php
<?php
require_once __DIR__ . '/vendor/autoload.php';

// 現在可以使用任何已註冊的類
use App\Controllers\UserController;
$controller = new UserController();
```

**優化選項**：
```bash
# 類映射授權（適用於生產環境）
composer dump-autoload -o

# 類映射授權 + APCu 快取
composer dump-autoload -o --apcu
```

### 自動載入性能優化

#### Classmap 優化

**開發環境**：使用 PSR-4，支持熱更新
```json
{
    "autoload": {
        "psr-4": {"App\\": "src/"}
    }
}
```

**生產環境**：生成 classmap，減少文件系統查找
```bash
composer dump-autoload --optimize
```

這會將所有 PSR-4 類轉換為 classmap，提高查找速度。

#### APCu 快取

啟用 APCu 快取可進一步提升性能：
```bash
composer dump-autoload --optimize --apcu
```

**原理**：將 classmap 存儲在共享記憶體中，減少磁碟 I/O。

### 命名空間最佳實踐

**目錄結構與命名空間對應**：
```
project/
├── src/
│   ├── Controllers/
│   │   └── UserController.php    // App\Controllers\UserController
│   ├── Models/
│   │   └── User.php               // App\Models\User
│   └── Services/
│       └── UserService.php        // App\Services\UserService
├── tests/
│   └── Unit/
│       └── UserTest.php           // Tests\Unit\UserTest
├── composer.json
└── vendor/
    └── autoload.php
```

**命名約定**：
- **命名空間**：使用 PascalCase，如 `App\Http\Controllers`
- **類名**：使用 PascalCase，如 `UserController`
- **目錄**：與命名空間對應，如 `src/Http/Controllers`
- **文件名**：與類名相同，如 `UserController.php`

**use 導入策略**：
```php
<?php
namespace App\Controllers;

// 按類型分組導入
use App\Models\{User, Post, Comment};
use App\Services\{UserService, AuthService};
use Illuminate\Http\{Request, Response};

// 避免過長的別名
use App\Services\Authentication\TwoFactorAuthentication as TwoFA;
```

### 常見問題與陷阱

**全局命名空間衝突**：
```php
namespace App\Helpers;

// 錯誤：未加反斜線，尋找 App\Helpers\DateTime
$date = new DateTime();

// 正確：使用完全限定名稱
$date = new \DateTime();
```

**相對命名空間不存在**：
```php
namespace App\Controllers;

// 錯誤：PHP 不支持相對命名空間
// use ..\Models\User;

// 正確：使用完全限定名稱
use App\Models\User;
```

**關鍵字命名衝突**：
```php
// 避免使用 PHP 關鍵字作為命名空間或類名
// namespace List;     // 錯誤
// class Class {}      // 錯誤
```

## 總結

命名空間和自動載入是現代 PHP 開發的基石，理解並正確使用它們能夠顯著提升代碼的組織性和可維護性。PSR-4 標準和 Composer 的自動載入功能讓依賴管理變得簡單高效，是每個 PHP 開發者必須掌握的核心技能。在生產環境中，合理使用 classmap 優化和 APCu 快取可以顯著提升應用性能。
