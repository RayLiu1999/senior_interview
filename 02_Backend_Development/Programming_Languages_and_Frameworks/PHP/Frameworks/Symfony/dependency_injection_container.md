# Symfony 依賴注入容器

- **難度**: 8
- **重要程度**: 5
- **標籤**: `Symfony`, `DependencyInjection`, `ServiceContainer`, `Autowiring`

## 問題詳述

請深入解釋 Symfony 的依賴注入容器機制，包括服務定義、自動注入、服務標籤、以及編譯器傳遞的高級用法。

## 核心理論與詳解

### 1. 依賴注入基礎

**什麼是依賴注入（DI）？**

依賴注入是一種設計模式，用於實現控制反轉（IoC）。它將對象的創建和依賴關係的管理從代碼中分離出來，交給容器處理。

**三種注入方式**：

```php
// 1. 構造函數注入（推薦）
class OrderService
{
    private $mailer;
    private $logger;
    
    public function __construct(MailerInterface $mailer, LoggerInterface $logger)
    {
        $this->mailer = $mailer;
        $this->logger = $logger;
    }
}

// 2. Setter 注入
class OrderService
{
    private $mailer;
    
    public function setMailer(MailerInterface $mailer): void
    {
        $this->mailer = $mailer;
    }
}

// 3. 屬性注入（不推薦，Symfony 不支持）
class OrderService
{
    public $mailer; // 破壞封裝性
}
```

**為什麼使用 DI？**

- ✅ **低耦合**：類不直接依賴具體實現
- ✅ **可測試**：輕鬆注入 Mock 對象
- ✅ **可維護**：集中管理依賴關係
- ✅ **可擴展**：輕鬆替換實現

### 2. Symfony 服務容器架構

```
                Service Container
                       |
        +-------------+-------------+
        |                           |
   Definition              Compiler Passes
        |                           |
   +----+----+                 +----+----+
   |         |                 |         |
Autowiring  Tags          Optimization  Validation
```

**核心概念**：

- 🔷 **服務（Service）**：容器管理的對象
- 🔷 **服務定義（Definition）**：如何創建服務的規則
- 🔷 **自動注入（Autowiring）**：自動解析依賴
- 🔷 **自動配置（Autoconfigure）**：自動應用標籤
- 🔷 **服務標籤（Tags）**：標記服務用途
- 🔷 **編譯器傳遞（Compiler Passes）**：容器編譯時的鉤子

### 3. 服務配置

```yaml
# config/services.yaml
services:
    _defaults:
        autowire: true      # 啟用自動注入
        autoconfigure: true # 啟用自動配置
        public: false       # 服務默認為私有
    
    # 自動註冊 src/ 下的所有類為服務
    App\:
        resource: '../src/'
        exclude:
            - '../src/DependencyInjection/'
            - '../src/Entity/'
            - '../src/Kernel.php'
    
    # 控制器標記為公共
    App\Controller\:
        resource: '../src/Controller/'
        tags: ['controller.service_arguments']
    
    # 自定義服務配置
    App\Service\PriceCalculator:
        arguments:
            $taxRate: 0.08
            $currency: 'USD'
    
    # 服務別名
    Psr\Log\LoggerInterface: '@monolog.logger'
    
    # 工廠模式
    App\Service\NewsletterManager:
        factory: ['@App\Service\NewsletterManagerFactory', 'create']
```

### 4. 自動注入（Autowiring）

**類型提示自動注入**：

```php
namespace App\Service;

use Psr\Log\LoggerInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\MailerInterface;

class OrderService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private MailerInterface $mailer,
        private LoggerInterface $logger
    ) {
    }
    
    public function createOrder(array $data): Order
    {
        $order = new Order();
        // 設置訂單數據
        
        $this->entityManager->persist($order);
        $this->entityManager->flush();
        
        $this->mailer->send(/* ... */);
        $this->logger->info('Order created', ['id' => $order->getId()]);
        
        return $order;
    }
}

// 在控制器中使用
class OrderController extends AbstractController
{
    #[Route('/orders', methods: ['POST'])]
    public function create(OrderService $orderService, Request $request): Response
    {
        $order = $orderService->createOrder($request->request->all());
        
        return $this->json($order, 201);
    }
}
```

**標量參數綁定**：

```yaml
# config/services.yaml
services:
    App\Service\PriceCalculator:
        arguments:
            $taxRate: '%env(float:TAX_RATE)%'
            $currency: '%app.currency%'
            $isDebug: '%kernel.debug%'

parameters:
    app.currency: 'USD'
```

```php
class PriceCalculator
{
    public function __construct(
        private float $taxRate,
        private string $currency,
        private bool $isDebug
    ) {
    }
}
```

**命名參數綁定**：

```yaml
services:
    _defaults:
        bind:
            $projectDir: '%kernel.project_dir%'
            $adminEmail: '%env(ADMIN_EMAIL)%'
            $cacheDir: '%kernel.cache_dir%'
```

### 5. 服務標籤（Service Tags）

**內建標籤**：

```yaml
services:
    # 事件訂閱者
    App\EventSubscriber\ExceptionSubscriber:
        tags: ['kernel.event_subscriber']
    
    # Twig 擴展
    App\Twig\AppExtension:
        tags: ['twig.extension']
    
    # 命令
    App\Command\MyCommand:
        tags: ['console.command']
    
    # Doctrine 事件監聽器
    App\EventListener\DatabaseActivitySubscriber:
        tags:
            - { name: 'doctrine.event_subscriber', connection: 'default' }
```

**自定義標籤**：

```yaml
# 創建自定義標籤
services:
    # 報表生成器
    App\Report\SalesReportGenerator:
        tags: ['app.report_generator']
    
    App\Report\UserReportGenerator:
        tags: ['app.report_generator']
    
    App\Report\ProductReportGenerator:
        tags: ['app.report_generator']
    
    # 報表管理器（收集所有生成器）
    App\Service\ReportManager:
        arguments:
            $generators: !tagged_iterator app.report_generator
```

```php
// src/Service/ReportManager.php
namespace App\Service;

class ReportManager
{
    private iterable $generators;
    
    public function __construct(iterable $generators)
    {
        $this->generators = $generators;
    }
    
    public function generateAll(): array
    {
        $reports = [];
        foreach ($this->generators as $generator) {
            $reports[] = $generator->generate();
        }
        return $reports;
    }
}
```

### 6. 編譯器傳遞（Compiler Passes）

**創建 Compiler Pass**：

```php
// src/DependencyInjection/Compiler/ReportGeneratorPass.php
namespace App\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

class ReportGeneratorPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        // 檢查 ReportManager 是否存在
        if (!$container->has(ReportManager::class)) {
            return;
        }
        
        $definition = $container->findDefinition(ReportManager::class);
        
        // 查找所有帶有 app.report_generator 標籤的服務
        $taggedServices = $container->findTaggedServiceIds('app.report_generator');
        
        foreach ($taggedServices as $id => $tags) {
            // 添加到 ReportManager
            $definition->addMethodCall('addGenerator', [new Reference($id)]);
        }
    }
}
```

**註冊 Compiler Pass**：

```php
// src/Kernel.php
namespace App;

use Symfony\Component\HttpKernel\Kernel as BaseKernel;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use App\DependencyInjection\Compiler\ReportGeneratorPass;

class Kernel extends BaseKernel
{
    protected function build(ContainerBuilder $container): void
    {
        $container->addCompilerPass(new ReportGeneratorPass());
    }
}
```

### 7. 服務裝飾器（Service Decoration）

**裝飾器模式**：

```yaml
# 原始服務
services:
    App\Service\Mailer:
        # 原始郵件服務
    
    # 裝飾器：添加日誌功能
    App\Service\LoggingMailer:
        decorates: App\Service\Mailer
        arguments:
            $inner: '@.inner' # 注入被裝飾的服務
            $logger: '@logger'
```

```php
// src/Service/LoggingMailer.php
namespace App\Service;

use Psr\Log\LoggerInterface;

class LoggingMailer implements MailerInterface
{
    public function __construct(
        private MailerInterface $inner,
        private LoggerInterface $logger
    ) {
    }
    
    public function send(Email $email): void
    {
        $this->logger->info('Sending email', [
            'to' => $email->getTo(),
            'subject' => $email->getSubject(),
        ]);
        
        $this->inner->send($email);
        
        $this->logger->info('Email sent successfully');
    }
}
```

**多層裝飾**：

```yaml
services:
    # 1. 原始服務
    App\Service\Mailer: ~
    
    # 2. 添加日誌
    App\Service\LoggingMailer:
        decorates: App\Service\Mailer
        arguments: ['@.inner', '@logger']
    
    # 3. 添加重試機制
    App\Service\RetryMailer:
        decorates: App\Service\LoggingMailer
        arguments: ['@.inner']
    
    # 調用順序：RetryMailer → LoggingMailer → Mailer
```

### 8. 工廠模式

**簡單工廠**：

```php
// src/Service/NewsletterManagerFactory.php
namespace App\Service;

class NewsletterManagerFactory
{
    public function create(string $type): NewsletterManagerInterface
    {
        return match($type) {
            'mailchimp' => new MailchimpManager(),
            'sendgrid' => new SendgridManager(),
            default => throw new \InvalidArgumentException("Unknown type: $type"),
        };
    }
}
```

```yaml
services:
    App\Service\NewsletterManagerFactory: ~
    
    App\Service\NewsletterManager:
        factory: ['@App\Service\NewsletterManagerFactory', 'create']
        arguments: ['%newsletter.type%']
```

**帶依賴的工廠**：

```php
class NewsletterManagerFactory
{
    public function __construct(
        private LoggerInterface $logger,
        private EntityManagerInterface $entityManager
    ) {
    }
    
    public function create(string $type): NewsletterManagerInterface
    {
        $manager = match($type) {
            'mailchimp' => new MailchimpManager(),
            'sendgrid' => new SendgridManager(),
        };
        
        $manager->setLogger($this->logger);
        $manager->setEntityManager($this->entityManager);
        
        return $manager;
    }
}
```

### 9. 延遲服務（Lazy Services）

```yaml
services:
    App\Service\HeavyService:
        lazy: true
```

```php
// 只有在實際調用方法時才會實例化
class SomeController extends AbstractController
{
    public function index(HeavyService $service): Response
    {
        // $service 是代理對象
        
        // 直到這裡才真正實例化
        $result = $service->doSomething();
        
        return $this->json($result);
    }
}
```

### 10. 服務定位器（Service Locator）

```yaml
services:
    # 定義服務定位器
    App\Service\PaymentServiceLocator:
        class: Symfony\Component\DependencyInjection\ServiceLocator
        arguments:
            -
                stripe: '@App\Payment\StripePayment'
                paypal: '@App\Payment\PaypalPayment'
                alipay: '@App\Payment\AlipayPayment'
        tags: ['container.service_locator']
```

```php
namespace App\Service;

use Psr\Container\ContainerInterface;

class PaymentProcessor
{
    public function __construct(
        private ContainerInterface $paymentLocator
    ) {
    }
    
    public function process(Order $order): void
    {
        $paymentMethod = $order->getPaymentMethod();
        
        // 動態獲取服務
        $processor = $this->paymentLocator->get($paymentMethod);
        $processor->process($order);
    }
}
```

### 11. 環境變量與參數

```yaml
# config/services.yaml
parameters:
    # 靜態參數
    app.name: 'MyApp'
    app.version: '1.0.0'
    
    # 環境變量
    app.admin_email: '%env(ADMIN_EMAIL)%'
    app.api_key: '%env(API_KEY)%'
    
    # 類型轉換
    app.max_items: '%env(int:MAX_ITEMS)%'
    app.is_debug: '%env(bool:DEBUG)%'
    app.tax_rate: '%env(float:TAX_RATE)%'
    
    # JSON 解析
    app.config: '%env(json:APP_CONFIG)%'

services:
    App\Service\ConfigService:
        arguments:
            $appName: '%app.name%'
            $adminEmail: '%app.admin_email%'
            $maxItems: '%app.max_items%'
```

**自定義環境變量處理器**：

```php
// src/DependencyInjection/EnvVarProcessor/Base64Processor.php
namespace App\DependencyInjection\EnvVarProcessor;

use Symfony\Component\DependencyInjection\EnvVarProcessorInterface;

class Base64Processor implements EnvVarProcessorInterface
{
    public function getEnv(string $prefix, string $name, \Closure $getEnv): mixed
    {
        $env = $getEnv($name);
        
        return base64_decode($env);
    }
    
    public static function getProvidedTypes(): array
    {
        return [
            'base64' => 'string',
        ];
    }
}
```

```yaml
# 使用
parameters:
    app.secret: '%env(base64:SECRET)%'
```

### 12. 容器調試

```bash
# 列出所有服務
php bin/console debug:container

# 搜索服務
php bin/console debug:container mailer

# 查看服務詳情
php bin/console debug:container App\Service\OrderService

# 查看自動注入類型
php bin/console debug:autowiring

# 查看特定類型的自動注入
php bin/console debug:autowiring LoggerInterface

# 查看容器參數
php bin/console debug:container --parameters

# 查看環境變量
php bin/console debug:container --env-vars
```

### 13. 最佳實踐

```php
// ✅ 1. 使用構造函數注入（推薦）
class OrderService
{
    public function __construct(
        private EntityManagerInterface $em,
        private LoggerInterface $logger
    ) {
    }
}

// ❌ 2. 避免容器注入
class BadService
{
    public function __construct(
        private ContainerInterface $container // 反模式！
    ) {
    }
}

// ✅ 3. 使用接口而非具體類
class OrderService
{
    public function __construct(
        private MailerInterface $mailer // Good
        // private SwiftMailer $mailer // Bad
    ) {
    }
}

// ✅ 4. 保持服務私有（除非必要）
services:
    App\Service\OrderService:
        public: false # 默認

// ✅ 5. 使用類型提示自動注入
class OrderService
{
    // 自動注入，無需配置
    public function __construct(
        private EntityManagerInterface $em,
        private LoggerInterface $logger
    ) {
    }
}

// ✅ 6. 標量參數使用綁定
services:
    _defaults:
        bind:
            $projectDir: '%kernel.project_dir%'

// ✅ 7. 使用服務標籤組織相關服務
services:
    App\Handler\JsonHandler:
        tags: ['app.response_handler']
    
    App\Handler\XmlHandler:
        tags: ['app.response_handler']
```

### 14. 性能優化

```yaml
# config/services.yaml
services:
    _defaults:
        autowire: true
        autoconfigure: true
        public: false
        
        # 生產環境：禁用反射優化性能
        lazy: '%kernel.debug%' # 僅開發環境使用延遲加載
```

```bash
# 編譯容器（生產環境）
php bin/console cache:clear --env=prod --no-debug

# 預熱容器
php bin/console cache:warmup --env=prod
```

## 總結

**Symfony DI 容器核心概念**：
- 🔷 **自動注入**：自動解析類型依賴
- 🔷 **自動配置**：自動應用標籤
- 🔷 **服務標籤**：標記和組織服務
- 🔷 **編譯器傳遞**：容器編譯時的鉤子
- 🔷 **服務裝飾器**：擴展現有服務
- 🔷 **工廠模式**：動態創建服務

**注入方式優先級**：
1. **構造函數注入**（推薦）- 強制依賴
2. **Setter 注入** - 可選依賴
3. **屬性注入** - 不推薦

**最佳實踐**：
- ✅ 使用構造函數注入
- ✅ 依賴接口而非具體類
- ✅ 保持服務私有
- ✅ 使用類型提示啟用自動注入
- ✅ 標量參數使用 bind 綁定
- ✅ 避免注入整個容器

**與 Laravel 對比**：
- **配置方式**：Symfony 更靈活（YAML/PHP/XML），Laravel 更簡單
- **自動注入**：兩者都支持，Symfony 更強大
- **服務標籤**：Symfony 獨有，更適合複雜場景
- **編譯器傳遞**：Symfony 獨有，可深度定制

掌握 Symfony 的 DI 容器是構建可維護、可測試應用的關鍵。
