# 什麼是依賴注入容器 (Dependency Injection Container)？它如何幫助我們實現控制反轉 (IoC)？

- **難度**: 8
- **重要程度**: 4
- **標籤**: `PHP`, `Design Patterns`, `IoC`, `DI Container`

## 問題詳述

在現代 PHP 框架（如 Laravel, Symfony）中，依賴注入容器 (Dependency Injection Container，或稱 IoC 容器) 是其架構的核心。請解釋什麼是依賴注入容器，它的主要職責是什麼？並闡述它與「控制反轉 (Inversion of Control, IoC)」原則之間的關係。最後，請透過一個簡單的 PHP 範例來說明使用 DI 容器的好處。

## 核心理論與詳解

### 1. 控制反轉 (Inversion of Control, IoC)

要理解 DI 容器，必須先理解「控制反轉」這個設計原則。

在傳統的程式設計中，一個物件通常會在其內部 **主動創建** 它所需要的依賴物件。例如，一個 `UserController` 可能會在自己的建構函式中 `new` 一個 `UserRepository`。

```php
// 傳統方式：UserController 主動控制依賴的創建
class UserController {
    private $userRepository;

    public function __construct() {
        // 主動創建依賴，控制權在 UserController 手中
        $this->userRepository = new UserRepository(new MySQLDatabase());
    }

    public function show($id) {
        $user = $this->userRepository->find($id);
        // ...
    }
}
```

這種方式的問題在於 **高度耦合 (High Coupling)**。`UserController` 與 `UserRepository` 的具體實現，甚至 `UserRepository` 的依賴 `MySQLDatabase` 都緊密地綁定在一起。如果我們想更換資料庫，或者為 `UserRepository` 寫單元測試，都會變得非常困難。

**控制反轉 (IoC)** 則是一種「好萊塢原則」——「不要打電話給我們，我們會打電話給你」。它將創建依賴物件的 **控制權** 從物件內部 **反轉** 給了外部的協力廠商。物件本身不再負責創建依賴，而是被動地等待外部將依賴「提供」給它。

實現 IoC 最常見的方式就是 **依賴注入 (Dependency Injection, DI)**。

### 2. 依賴注入 (Dependency Injection, DI)

依賴注入是指將一個物件的依賴從外部傳遞給它，而不是讓它自己創建。常見的注入方式有：

- **建構函式注入 (Constructor Injection)**: 透過類別的建構函式傳入依賴，這是最常用且推薦的方式。
- **Setter 注入 (Setter Injection)**: 透過公開的 `set` 方法傳入依賴。
- **屬性注入 (Property Injection)**: 直接設定公開的屬性（較少使用）。

```php
// 使用依賴注入實現 IoC
class UserController {
    private $userRepository;

    // 依賴是從外部「注入」的，控制權被反轉了
    public function __construct(UserRepositoryInterface $userRepository) {
        $this->userRepository = $userRepository;
    }

    public function show($id) {
        $user = $this->userRepository->find($id);
        // ...
    }
}

// 在外部，我們創建並注入依賴
$database = new MySQLDatabase();
$repository = new UserRepository($database);
$controller = new UserController($repository);
```

現在 `UserController` 只依賴於一個介面 `UserRepositoryInterface`，不再關心具體的實現，實現了 **解耦 (Decoupling)**。

### 3. 依賴注入容器 (DI Container)

當專案規模變大，依賴關係變得錯綜複雜時，手動創建和注入所有依賴（如上例最後三行）會變成一場噩夢。一個物件可能依賴 A，A 依賴 B 和 C，B 又依賴 D... 手動管理這個依賴樹將非常繁瑣。

**依賴注入容器 (DI Container)** 就是為了解決這個問題而生的自動化工具。它是一個 **專門用來管理類別創建和依賴注入的物件**。

**DI 容器的主要職責**:

- **註冊 (Binding / Registering)**: 開發者告訴容器如何「解析」一個抽象（通常是介面）。例如，當程式請求 `UserRepositoryInterface` 時，容器應該提供一個 `UserRepository` 的實例。
- **解析 (Resolving / Making)**: 當應用程式需要一個物件時，它向容器請求這個物件。容器會檢查這個物件的依賴，**自動地、遞迴地** 創建並注入所有需要的依賴項，最後返回一個完整的、可用的物件實例。

### DI 容器如何實現控制反轉

DI 容器是實現 IoC 原則的強大工具。它將物件創建和依賴管理的 **控制權** 從開發者的手動編碼中完全接管過來，變成由容器自動處理。開發者從「主動創建物件」變成了「向容器請求物件」，控制權被徹底反轉給了容器。

### 範例：使用一個簡單的 DI 容器

讓我們模擬一個極簡的 DI 容器來說明其工作原理。

```php
<?php

// 1. 一個極簡的 DI 容器
class Container {
    protected $bindings = [];

    // 職責一：註冊綁定
    public function bind(string $abstract, callable $factory) {
        $this->bindings[$abstract] = $factory;
    }

    // 職責二：解析物件
    public function make(string $abstract) {
        if (!isset($this->bindings[$abstract])) {
            throw new Exception("No binding found for {$abstract}");
        }

        $factory = $this->bindings[$abstract];
        return $factory($this); // 將容器自身傳入，以便解析遞迴依賴
    }
}

// --- 應用程式程式碼 ---

interface LoggerInterface {
    public function log(string $message);
}

class FileLogger implements LoggerInterface {
    public function log(string $message) {
        echo "Logging to file: {$message}\n";
    }
}

class UserService {
    protected $logger;

    // UserService 依賴 LoggerInterface
    public function __construct(LoggerInterface $logger) {
        $this->logger = $logger;
    }

    public function register(string $email) {
        $this->logger->log("User {$email} registered.");
    }
}

// --- 在應用程式啟動時進行設定 ---

// 1. 創建容器實例
$container = new Container();

// 2. 向容器註冊綁定關係
// 「當有程式碼需要 LoggerInterface 時，請提供一個 FileLogger 的實例」
$container->bind(LoggerInterface::class, function ($c) {
    return new FileLogger();
});

// 「當有程式碼需要 UserService 時，請解析出它需要的 LoggerInterface，然後創建它」
$container->bind(UserService::class, function ($c) {
    return new UserService($c->make(LoggerInterface::class));
});


// --- 在應用程式的某個地方，例如控制器中 ---

// 3. 從容器中解析出需要的物件
// 我們不需要知道 UserService 是如何被創建的，也不需要關心它的依賴
$userService = $container->make(UserService::class);

$userService->register('test@example.com'); // 輸出: Logging to file: User test@example.com registered.

?>
```

## 好處總結

- **解耦**: `UserService` 不再與 `FileLogger` 直接耦合。如果我們想換成資料庫日誌，只需修改容器的綁定即可，`UserService` 的程式碼完全不用變。
- **易於測試**: 在單元測試中，我們可以輕易地向容器註冊一個 `MockLogger` 來代替 `FileLogger`，從而隔離測試環境。
- **集中管理**: 所有關於物件創建的邏輯都集中在容器的設定中，使得依賴關係一目了然，易於管理和維護。
- **自動化**: 容器自動處理複雜的依賴樹，將開發者從繁瑣的手動創建工作中解放出來。

現代框架的 DI 容器（如 Laravel）更加強大，它們利用 **PHP 的反射 (Reflection) API** 來自動分析類別的建構函式需要什麼依賴，從而省去了大量手動綁定的設定，實現了「零設定解析 (Zero-configuration Resolution)」。
