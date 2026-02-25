# Laravel 事件系統與觀察者模式

- **難度**: 8
- **重要程度**: 5
- **標籤**: `Laravel`, `Event`, `Observer`, `Design Pattern`, `Event-Driven`

## 問題詳述

深入說明 Laravel 事件系統的架構、運作原理、與觀察者模式的關係，以及如何在實際專案中使用事件與監聽器（Event & Listener）、觀察者（Observer）來實現解耦、非同步處理與業務擴展。

## 核心理論與詳解

### 1. 事件系統概述

Laravel 的事件系統提供了一個簡單的**觀察者模式**實現，允許應用程式訂閱和監聽事件。核心優勢：

- **解耦業務邏輯**：事件發布者不需要知道誰會處理事件
- **可擴展性**：新增監聽器不影響現有程式碼
- **非同步處理**：監聽器可放入隊列延遲執行
- **多處理器**：單一事件可被多個監聽器處理

### 2. 核心組件

#### 2.1 事件（Event）

事件是承載資訊的容器，描述「發生了什麼」。

**特性**：
- 通常是不可變的（Immutable）
- 包含與事件相關的所有必要資料
- 可以是簡單的類別，不需要繼承任何父類

```php
// app/Events/OrderShipped.php
namespace App\Events;

use App\Models\Order;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderShipped
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Order $order
    ) {}
}
```

#### 2.2 監聽器（Listener）

監聽器包含處理事件的邏輯。

**特性**：
- 實作 `handle` 方法接收事件實例
- 可以實作 `ShouldQueue` 介面進行非同步處理
- 支援依賴注入

```php
// app/Listeners/SendShipmentNotification.php
namespace App\Listeners;

use App\Events\OrderShipped;
use App\Mail\OrderShippedMail;
use Illuminate\Support\Facades\Mail;

class SendShipmentNotification
{
    public function handle(OrderShipped $event): void
    {
        Mail::to($event->order->user->email)
            ->send(new OrderShippedMail($event->order));
    }
}
```

#### 2.3 事件服務提供者（EventServiceProvider）

註冊事件與監聽器的映射關係。

```php
// app/Providers/EventServiceProvider.php
protected $listen = [
    OrderShipped::class => [
        SendShipmentNotification::class,
        UpdateInventory::class,
        LogShipment::class,
    ],
];
```

### 3. 事件觸發方式

#### 3.1 使用 event() 輔助函式

```php
event(new OrderShipped($order));
```

#### 3.2 使用 Event Facade

```php
use Illuminate\Support\Facades\Event;

Event::dispatch(new OrderShipped($order));
```

#### 3.3 使用 Dispatchable Trait

```php
OrderShipped::dispatch($order);
```

### 4. 觀察者模式（Model Observer）

Laravel 提供了專門針對 Eloquent 模型事件的觀察者模式實現。

#### 4.1 模型事件

Eloquent 模型在生命週期中會觸發多個事件：

- `retrieved`：模型從資料庫檢索後
- `creating`：新模型儲存前
- `created`：新模型儲存後
- `updating`：現有模型更新前
- `updated`：現有模型更新後
- `saving`：模型儲存前（建立或更新）
- `saved`：模型儲存後（建立或更新）
- `deleting`：模型刪除前
- `deleted`：模型刪除後
- `restoring`：軟刪除模型恢復前
- `restored`：軟刪除模型恢復後
- `forceDeleting`：強制刪除前
- `forceDeleted`：強制刪除後

#### 4.2 建立觀察者

```php
// app/Observers/UserObserver.php
namespace App\Observers;

use App\Models\User;

class UserObserver
{
    public function creating(User $user): void
    {
        // 儲存前自動生成 UUID
        $user->uuid = \Str::uuid();
    }

    public function created(User $user): void
    {
        // 發送歡迎郵件
        event(new UserRegistered($user));
    }

    public function updating(User $user): void
    {
        // 記錄變更
        if ($user->isDirty('email')) {
            Log::info('User email changed', [
                'old' => $user->getOriginal('email'),
                'new' => $user->email,
            ]);
        }
    }

    public function deleted(User $user): void
    {
        // 清理相關資料
        $user->posts()->delete();
        $user->comments()->delete();
    }
}
```

#### 4.3 註冊觀察者

在 `AppServiceProvider` 或 `EventServiceProvider` 中註冊：

```php
use App\Models\User;
use App\Observers\UserObserver;

public function boot(): void
{
    User::observe(UserObserver::class);
}
```

### 5. 事件訂閱者（Event Subscriber）

當需要在單一類別中定義多個事件處理器時，可使用事件訂閱者。

```php
// app/Listeners/UserEventSubscriber.php
namespace App\Listeners;

use Illuminate\Events\Dispatcher;

class UserEventSubscriber
{
    public function handleUserLogin($event): void
    {
        // 處理登入邏輯
    }

    public function handleUserLogout($event): void
    {
        // 處理登出邏輯
    }

    public function subscribe(Dispatcher $events): array
    {
        return [
            'Illuminate\Auth\Events\Login' => 'handleUserLogin',
            'Illuminate\Auth\Events\Logout' => 'handleUserLogout',
        ];
    }
}
```

註冊訂閱者：

```php
// EventServiceProvider
protected $subscribe = [
    UserEventSubscriber::class,
];
```

### 6. 非同步事件處理

監聽器實作 `ShouldQueue` 介面可進行非同步處理：

```php
namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;

class SendShipmentNotification implements ShouldQueue
{
    public $queue = 'emails';
    public $delay = 60; // 延遲 60 秒
    public $tries = 3;  // 重試次數
    public $timeout = 120; // 超時時間

    public function handle(OrderShipped $event): void
    {
        // 非同步處理邏輯
    }

    public function failed(OrderShipped $event, \Throwable $exception): void
    {
        // 失敗處理邏輯
    }
}
```

### 7. 事件發現（Event Discovery）

Laravel 8+ 支援自動發現事件，無需手動註冊：

```php
// EventServiceProvider
public function shouldDiscoverEvents(): bool
{
    return true;
}
```

Laravel 會掃描 `app/Listeners` 目錄並自動註冊事件與監聽器。

### 8. 最佳實踐與設計原則

#### 8.1 單一職責原則

每個監聽器只處理一件事情：

```php
// ✅ 好的做法
class SendShipmentNotification { /* ... */ }
class UpdateInventory { /* ... */ }
class LogShipment { /* ... */ }

// ❌ 不好的做法
class HandleOrderShipped {
    public function handle($event) {
        // 發送通知
        // 更新庫存
        // 記錄日誌
        // ... 做太多事情
    }
}
```

#### 8.2 使用事件解耦業務邏輯

```php
// Controller 只負責觸發事件
public function ship(Order $order)
{
    $order->update(['status' => 'shipped']);
    
    event(new OrderShipped($order));
    
    return response()->json(['message' => 'Order shipped']);
}
```

#### 8.3 避免過度使用

不是所有邏輯都需要事件：

- **適合使用**：跨模組通知、非同步處理、擴展點
- **不適合使用**：簡單的一對一調用、核心業務流程

#### 8.4 事件命名規範

- 使用過去式：`OrderShipped`、`UserRegistered`
- 描述已發生的事實，而非命令
- 包含足夠的上下文資訊

### 9. 測試事件與監聽器

#### 9.1 測試事件被觸發

```php
use Illuminate\Support\Facades\Event;

public function test_order_shipped_event_is_dispatched()
{
    Event::fake();

    $order = Order::factory()->create();
    $this->post("/orders/{$order->id}/ship");

    Event::assertDispatched(OrderShipped::class, function ($event) use ($order) {
        return $event->order->id === $order->id;
    });
}
```

#### 9.2 測試監聽器邏輯

```php
public function test_shipment_notification_is_sent()
{
    Mail::fake();

    $order = Order::factory()->create();
    $listener = new SendShipmentNotification();
    $listener->handle(new OrderShipped($order));

    Mail::assertSent(OrderShippedMail::class);
}
```

### 10. 效能考量

#### 10.1 使用隊列處理耗時操作

```php
class SendShipmentNotification implements ShouldQueue
{
    // 避免阻塞主執行緒
}
```

#### 10.2 條件式監聽器

```php
public function handle(OrderShipped $event): void
{
    if (!$event->order->user->notificationsEnabled()) {
        return;
    }
    
    // 處理邏輯
}
```

#### 10.3 事件停止傳播

監聽器回傳 `false` 可停止事件傳播：

```php
public function handle(OrderShipped $event): bool
{
    if ($event->order->isCancelled()) {
        return false; // 停止後續監聽器執行
    }
    
    // 處理邏輯
    return true;
}
```

### 11. 實際應用場景

#### 11.1 使用者註冊流程

```php
// Event
class UserRegistered {
    public function __construct(public User $user) {}
}

// Listeners
class SendWelcomeEmail implements ShouldQueue { /* ... */ }
class CreateUserProfile { /* ... */ }
class AssignDefaultRole { /* ... */ }
class TrackRegistrationMetrics { /* ... */ }
```

#### 11.2 訂單處理流程

```php
class OrderPlaced { /* ... */ }
class OrderPaid { /* ... */ }
class OrderShipped { /* ... */ }
class OrderDelivered { /* ... */ }

// 每個狀態觸發不同的後續處理
```

#### 11.3 稽核日誌

```php
class AuditObserver
{
    public function updated($model): void
    {
        AuditLog::create([
            'model' => get_class($model),
            'model_id' => $model->id,
            'changes' => $model->getChanges(),
            'user_id' => auth()->id(),
        ]);
    }
}
```

## 程式碼範例 (可選)

以下是完整的事件驅動訂單處理範例：

```php
// Event
namespace App\Events;

class OrderStatusChanged
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Order $order,
        public string $oldStatus,
        public string $newStatus
    ) {}
}

// Listener
namespace App\Listeners;

class NotifyOrderStatusChange implements ShouldQueue
{
    public function handle(OrderStatusChanged $event): void
    {
        $message = match($event->newStatus) {
            'paid' => '您的訂單已付款成功',
            'shipped' => '您的訂單已出貨',
            'delivered' => '您的訂單已送達',
            default => '您的訂單狀態已更新',
        };

        Notification::send(
            $event->order->user,
            new OrderNotification($message, $event->order)
        );
    }
}

// Observer
namespace App\Observers;

class OrderObserver
{
    public function updating(Order $order): void
    {
        if ($order->isDirty('status')) {
            event(new OrderStatusChanged(
                $order,
                $order->getOriginal('status'),
                $order->status
            ));
        }
    }
}

// Usage
$order->update(['status' => 'shipped']); // 自動觸發事件
```

## 總結

Laravel 事件系統與觀察者模式的核心價值：

1. **解耦**：將業務邏輯拆分成獨立的、可重用的組件
2. **擴展性**：無需修改現有程式碼即可新增功能
3. **非同步**：透過隊列處理耗時操作，提升回應速度
4. **可測試**：每個組件可獨立測試，提高程式碼品質
5. **可維護**：清晰的職責劃分，降低維護成本

關鍵設計原則是「事件描述發生了什麼，監聽器決定如何回應」，這種設計讓系統更靈活、更容易演進。在實際應用中，應根據業務複雜度選擇合適的抽象層級，避免過度設計。
