# Symfony 事件系統與監聽器

- **難度**: 7
- **重要程度**: 4
- **標籤**: `Symfony`, `EventDispatcher`, `EventSubscriber`, `Listener`

## 問題詳述

請深入解釋 Symfony 的事件驅動架構，包括事件分發器、內核事件、自定義事件、以及事件監聽器與訂閱者的使用。

## 核心理論與詳解

### 1. 事件驅動架構基礎

**什麼是事件驅動？**

事件驅動是一種設計模式，允許組件在特定時刻（事件發生時）執行操作，而無需直接耦合。

```
發布者（Publisher）→ 事件分發器（EventDispatcher）→ 訂閱者（Subscriber/Listener）
     |                        |                              |
  觸發事件              找到所有監聽器                  執行回調
```

**優勢**：
- ✅ **解耦**：發布者不需要知道訂閱者
- ✅ **擴展性**：輕鬆添加新的監聽器
- ✅ **可測試**：獨立測試各個組件
- ✅ **靈活性**：動態改變行為

### 2. Symfony 事件系統架構

```
                EventDispatcher
                       |
        +-------------+-------------+
        |                           |
  Kernel Events              Custom Events
        |                           |
   +----+----+              +-------+-------+
   |         |              |               |
Request  Response      User Events    Order Events
```

**核心組件**：
- 🔹 **Event**：事件對象，包含事件數據
- 🔹 **EventDispatcher**：事件分發器
- 🔹 **Listener**：事件監聽器（簡單函數）
- 🔹 **Subscriber**：事件訂閱者（自包含配置）

### 3. 內核事件（Kernel Events）

**HTTP 請求生命週期事件**：

```php
use Symfony\Component\HttpKernel\KernelEvents;

// 1. kernel.request - 請求開始
// 優先級：最高
// 用途：認證、路由前處理

// 2. kernel.controller - 控制器執行前
// 用途：修改控制器、參數轉換

// 3. kernel.controller_arguments - 參數解析後
// 用途：修改控制器參數

// 4. kernel.view - 控制器返回非 Response 時
// 用途：將返回值轉換為 Response

// 5. kernel.response - 響應發送前
// 用途：修改響應、添加 Headers

// 6. kernel.finish_request - 請求處理完成

// 7. kernel.terminate - 響應發送後
// 用途：清理、發送郵件、記錄日誌

// 8. kernel.exception - 發生異常時
// 用途：錯誤處理、自定義錯誤頁面
```

**事件流程圖**：

```
Request
  ↓
kernel.request (認證、路由)
  ↓
路由匹配
  ↓
kernel.controller (控制器解析)
  ↓
kernel.controller_arguments (參數解析)
  ↓
執行 Controller
  ↓
kernel.view (如果不是 Response)
  ↓
kernel.response (修改響應)
  ↓
發送響應給客戶端
  ↓
kernel.terminate (異步任務)
```

### 4. 事件監聽器（Event Listener）

**創建監聽器**：

```php
// src/EventListener/ExceptionListener.php
namespace App\EventListener;

use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class ExceptionListener
{
    public function onKernelException(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();
        
        $response = new Response();
        $response->setContent(json_encode([
            'error' => $exception->getMessage(),
            'code' => $exception->getCode(),
        ]));
        
        // 設置狀態碼
        if ($exception instanceof HttpExceptionInterface) {
            $response->setStatusCode($exception->getStatusCode());
            $response->headers->replace($exception->getHeaders());
        } else {
            $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
        }
        
        $response->headers->set('Content-Type', 'application/json');
        
        // 替換響應
        $event->setResponse($response);
    }
}
```

**註冊監聽器**：

```yaml
# config/services.yaml
services:
    App\EventListener\ExceptionListener:
        tags:
            - { name: kernel.event_listener, event: kernel.exception }
```

**帶優先級的監聽器**：

```yaml
services:
    # 優先級高的先執行
    App\EventListener\AuthenticationListener:
        tags:
            - { name: kernel.event_listener, event: kernel.request, priority: 10 }
    
    App\EventListener\LocaleListener:
        tags:
            - { name: kernel.event_listener, event: kernel.request, priority: 5 }
```

### 5. 事件訂閱者（Event Subscriber）

**創建訂閱者（推薦方式）**：

```php
// src/EventSubscriber/RequestSubscriber.php
namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Psr\Log\LoggerInterface;

class RequestSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private LoggerInterface $logger
    ) {
    }
    
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => [
                ['logRequest', 10],      // 優先級 10
                ['checkMaintenance', 5], // 優先級 5
            ],
            KernelEvents::RESPONSE => 'logResponse',
        ];
    }
    
    public function logRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }
        
        $request = $event->getRequest();
        $this->logger->info('Request received', [
            'method' => $request->getMethod(),
            'uri' => $request->getRequestUri(),
            'ip' => $request->getClientIp(),
        ]);
    }
    
    public function checkMaintenance(RequestEvent $event): void
    {
        // 維護模式檢查
        if ($this->isMaintenanceMode()) {
            $response = new Response('Under Maintenance', 503);
            $event->setResponse($response);
        }
    }
    
    public function logResponse(ResponseEvent $event): void
    {
        $response = $event->getResponse();
        $this->logger->info('Response sent', [
            'status' => $response->getStatusCode(),
        ]);
    }
    
    private function isMaintenanceMode(): bool
    {
        return file_exists(__DIR__.'/../../var/maintenance.lock');
    }
}
```

**自動註冊**（autoconfigure）：

```yaml
# config/services.yaml
services:
    _defaults:
        autoconfigure: true # 自動標記 EventSubscriberInterface
    
    App\EventSubscriber\:
        resource: '../src/EventSubscriber/'
```

### 6. 自定義事件

**創建事件類**：

```php
// src/Event/OrderPlacedEvent.php
namespace App\Event;

use App\Entity\Order;
use Symfony\Contracts\EventDispatcher\Event;

class OrderPlacedEvent extends Event
{
    public const NAME = 'order.placed';
    
    public function __construct(
        private Order $order
    ) {
    }
    
    public function getOrder(): Order
    {
        return $this->order;
    }
}
```

**分發事件**：

```php
// src/Service/OrderService.php
namespace App\Service;

use App\Event\OrderPlacedEvent;
use Symfony\Contracts\EventDispatcher\EventDispatcherInterface;

class OrderService
{
    public function __construct(
        private EventDispatcherInterface $eventDispatcher,
        private EntityManagerInterface $entityManager
    ) {
    }
    
    public function placeOrder(Order $order): void
    {
        // 保存訂單
        $this->entityManager->persist($order);
        $this->entityManager->flush();
        
        // 分發事件
        $event = new OrderPlacedEvent($order);
        $this->eventDispatcher->dispatch($event, OrderPlacedEvent::NAME);
    }
}
```

**監聽自定義事件**：

```php
// src/EventSubscriber/OrderSubscriber.php
namespace App\EventSubscriber;

use App\Event\OrderPlacedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Mailer\MailerInterface;

class OrderSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private MailerInterface $mailer,
        private LoggerInterface $logger
    ) {
    }
    
    public static function getSubscribedEvents(): array
    {
        return [
            OrderPlacedEvent::NAME => [
                ['sendConfirmationEmail', 10],
                ['updateInventory', 5],
                ['logOrder', 0],
            ],
        ];
    }
    
    public function sendConfirmationEmail(OrderPlacedEvent $event): void
    {
        $order = $event->getOrder();
        
        $email = (new Email())
            ->to($order->getCustomer()->getEmail())
            ->subject('Order Confirmation')
            ->html('Your order has been placed!');
        
        $this->mailer->send($email);
    }
    
    public function updateInventory(OrderPlacedEvent $event): void
    {
        $order = $event->getOrder();
        
        foreach ($order->getItems() as $item) {
            $item->getProduct()->decreaseStock($item->getQuantity());
        }
    }
    
    public function logOrder(OrderPlacedEvent $event): void
    {
        $this->logger->info('Order placed', [
            'order_id' => $event->getOrder()->getId(),
        ]);
    }
}
```

### 7. 停止事件傳播

```php
// src/EventSubscriber/SecuritySubscriber.php
namespace App\EventSubscriber;

use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class SecuritySubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['checkSecurity', 255], // 最高優先級
        ];
    }
    
    public function checkSecurity(RequestEvent $event): void
    {
        $request = $event->getRequest();
        
        if (!$this->isAuthorized($request)) {
            $response = new Response('Unauthorized', 401);
            $event->setResponse($response);
            
            // 停止事件傳播，後續監聽器不會執行
            $event->stopPropagation();
        }
    }
}
```

### 8. 異步事件處理

```php
// src/EventSubscriber/OrderSubscriber.php
namespace App\EventSubscriber;

use App\Event\OrderPlacedEvent;
use App\Message\SendOrderConfirmation;
use Symfony\Component\Messenger\MessageBusInterface;

class OrderSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private MessageBusInterface $messageBus
    ) {
    }
    
    public static function getSubscribedEvents(): array
    {
        return [
            OrderPlacedEvent::NAME => 'onOrderPlaced',
        ];
    }
    
    public function onOrderPlaced(OrderPlacedEvent $event): void
    {
        // 將耗時任務發送到消息隊列
        $this->messageBus->dispatch(
            new SendOrderConfirmation($event->getOrder()->getId())
        );
    }
}
```

### 9. 實用事件示例

**API 請求日誌**：

```php
namespace App\EventSubscriber;

class ApiLogSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private LoggerInterface $logger
    ) {
    }
    
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => 'onRequest',
            KernelEvents::RESPONSE => 'onResponse',
            KernelEvents::EXCEPTION => 'onException',
        ];
    }
    
    public function onRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        
        $this->logger->info('API Request', [
            'method' => $request->getMethod(),
            'uri' => $request->getRequestUri(),
            'body' => $request->getContent(),
            'time' => microtime(true),
        ]);
    }
    
    public function onResponse(ResponseEvent $event): void
    {
        $response = $event->getResponse();
        
        $this->logger->info('API Response', [
            'status' => $response->getStatusCode(),
            'content' => $response->getContent(),
        ]);
    }
    
    public function onException(ExceptionEvent $event): void
    {
        $this->logger->error('API Exception', [
            'message' => $event->getThrowable()->getMessage(),
            'trace' => $event->getThrowable()->getTraceAsString(),
        ]);
    }
}
```

**CORS 處理**：

```php
namespace App\EventSubscriber;

class CorsSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::RESPONSE => 'onResponse',
        ];
    }
    
    public function onResponse(ResponseEvent $event): void
    {
        $response = $event->getResponse();
        
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
}
```

**用戶活動追蹤**：

```php
namespace App\EventSubscriber;

class UserActivitySubscriber implements EventSubscriberInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private Security $security
    ) {
    }
    
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::TERMINATE => 'logActivity',
        ];
    }
    
    public function logActivity(TerminateEvent $event): void
    {
        $user = $this->security->getUser();
        
        if (!$user) {
            return;
        }
        
        $request = $event->getRequest();
        
        $activity = new UserActivity();
        $activity->setUser($user);
        $activity->setAction($request->getMethod() . ' ' . $request->getPathInfo());
        $activity->setIp($request->getClientIp());
        $activity->setTimestamp(new \DateTime());
        
        $this->em->persist($activity);
        $this->em->flush();
    }
}
```

### 10. 測試事件

```php
// tests/EventSubscriber/OrderSubscriberTest.php
namespace App\Tests\EventSubscriber;

use App\Event\OrderPlacedEvent;
use App\EventSubscriber\OrderSubscriber;
use PHPUnit\Framework\TestCase;

class OrderSubscriberTest extends TestCase
{
    public function testGetSubscribedEvents(): void
    {
        $events = OrderSubscriber::getSubscribedEvents();
        
        $this->assertArrayHasKey(OrderPlacedEvent::NAME, $events);
    }
    
    public function testSendConfirmationEmail(): void
    {
        $mailer = $this->createMock(MailerInterface::class);
        $logger = $this->createMock(LoggerInterface::class);
        
        $mailer->expects($this->once())
            ->method('send');
        
        $subscriber = new OrderSubscriber($mailer, $logger);
        $event = new OrderPlacedEvent($this->createOrder());
        
        $subscriber->sendConfirmationEmail($event);
    }
}
```

### 11. 事件調試

```bash
# 列出所有事件和監聽器
php bin/console debug:event-dispatcher

# 查看特定事件的監聽器
php bin/console debug:event-dispatcher kernel.request

# 查看訂閱者
php bin/console debug:container --tag=kernel.event_subscriber
```

### 12. 最佳實踐

```php
// ✅ 1. 使用 EventSubscriber 而非 Listener（更清晰）
class OrderSubscriber implements EventSubscriberInterface
{
    // 配置在類內部
}

// ✅ 2. 事件類包含完整數據
class OrderPlacedEvent extends Event
{
    private Order $order;
    private User $customer;
    // 包含所有相關數據
}

// ✅ 3. 使用常量定義事件名稱
class OrderPlacedEvent extends Event
{
    public const NAME = 'order.placed';
}

// ✅ 4. 合理設置優先級
public static function getSubscribedEvents(): array
{
    return [
        KernelEvents::REQUEST => [
            ['security', 256],    // 最高優先級
            ['locale', 128],
            ['logging', 0],       // 默認優先級
        ],
    ];
}

// ✅ 5. 檢查是否為主請求
public function onRequest(RequestEvent $event): void
{
    if (!$event->isMainRequest()) {
        return;
    }
    // ...
}

// ✅ 6. 耗時操作使用 kernel.terminate
public static function getSubscribedEvents(): array
{
    return [
        KernelEvents::TERMINATE => 'sendEmail', // 響應後執行
    ];
}

// ❌ 7. 避免在事件中執行業務邏輯
// 事件監聽器應該是輕量級的，複雜邏輯應該在服務中
```

## 總結

**Symfony 事件系統核心**：
- 🔹 **解耦組件**：通過事件連接鬆散耦合的組件
- 🔹 **擴展點**：在應用的關鍵點插入自定義邏輯
- 🔹 **內核事件**：HTTP 請求生命週期的各個階段
- 🔹 **自定義事件**：業務邏輯的事件驅動

**Listener vs Subscriber**：
- **Listener**：簡單、單一事件
- **Subscriber**（推薦）：自包含配置、多事件、更清晰

**事件優先級**：
- **256+**：認證、安全相關
- **128**：路由、本地化
- **0**（默認）：業務邏輯
- **負數**：清理、日誌

**常見應用場景**：
- ✅ 認證與授權
- ✅ 日誌記錄
- ✅ 異常處理
- ✅ CORS 配置
- ✅ API 響應格式化
- ✅ 用戶活動追蹤

**與 Laravel 對比**：
- **事件定義**：Symfony 更結構化，Laravel 更靈活
- **註冊方式**：Symfony 使用標籤/接口，Laravel 使用數組
- **優先級控制**：Symfony 更細粒度
- **內核事件**：Symfony 更豐富完整

掌握 Symfony 事件系統能讓你構建高度解耦、易於擴展的應用。
