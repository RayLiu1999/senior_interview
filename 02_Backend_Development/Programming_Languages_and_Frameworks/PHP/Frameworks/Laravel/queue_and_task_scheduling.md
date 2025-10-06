# Laravel 隊列與任務調度

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Laravel`, `Queue`, `Job`, `Task Scheduling`, `Background Processing`

## 問題詳述

請深入解釋 Laravel 的隊列系統和任務調度機制，包括隊列驅動、任務處理、失敗重試以及最佳實踐。

## 核心理論與詳解

### 1. 隊列系統概述

**為什麼需要隊列？**

```
同步處理 (慢):
Request → 發送郵件 (2s) → 處理圖片 (3s) → 響應 (5s)

異步處理 (快):
Request → 加入隊列 → 立即響應 (0.1s)
         ↓
    背景處理 (5s)
```

**使用場景**：
- 📧 **發送郵件**：歡迎郵件、通知郵件
- 🖼️ **處理圖片**：縮圖生成、圖片壓縮
- 📊 **生成報表**：大量數據處理
- 🔗 **API 調用**：第三方服務整合
- 🗄️ **數據導出**：CSV、Excel 生成

### 2. 隊列配置

#### 支援的驅動

```php
// config/queue.php

return [
    'default' => env('QUEUE_CONNECTION', 'sync'),
    
    'connections' => [
        // 同步執行（開發環境）
        'sync' => [
            'driver' => 'sync',
        ],
        
        // 數據庫隊列
        'database' => [
            'driver' => 'database',
            'table' => 'jobs',
            'queue' => 'default',
            'retry_after' => 90,
        ],
        
        // Redis 隊列（推薦）
        'redis' => [
            'driver' => 'redis',
            'connection' => 'default',
            'queue' => env('REDIS_QUEUE', 'default'),
            'retry_after' => 90,
            'block_for' => null,
        ],
        
        // Amazon SQS
        'sqs' => [
            'driver' => 'sqs',
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
            'prefix' => env('SQS_PREFIX'),
            'queue' => env('SQS_QUEUE'),
            'region' => env('AWS_DEFAULT_REGION'),
        ],
        
        // Beanstalkd
        'beanstalkd' => [
            'driver' => 'beanstalkd',
            'host' => 'localhost',
            'queue' => 'default',
            'retry_after' => 90,
        ],
    ],
];
```

**驅動對比**：

| 驅動 | 優勢 | 劣勢 | 適用場景 |
|------|------|------|----------|
| **sync** | 無需配置 | 阻塞請求 | 開發測試 |
| **database** | 簡單易用 | 性能較低 | 小型應用 |
| **redis** | 高性能 | 需要 Redis | 生產環境（推薦）|
| **sqs** | 高可靠 | 成本較高 | AWS 雲端 |

### 3. 創建任務（Job）

#### 基本任務

```php
// app/Jobs/SendWelcomeEmail.php
namespace App\Jobs;

use App\Models\User;
use App\Mail\WelcomeMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendWelcomeEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    /**
     * 任務執行次數
     */
    public $tries = 3;
    
    /**
     * 任務超時時間（秒）
     */
    public $timeout = 120;
    
    /**
     * 任務失敗前重試的秒數
     */
    public $backoff = 10;
    
    /**
     * User 實例
     */
    protected $user;
    
    /**
     * Create a new job instance.
     */
    public function __construct(User $user)
    {
        $this->user = $user;
    }
    
    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Mail::to($this->user->email)->send(new WelcomeMail($this->user));
    }
    
    /**
     * 任務失敗處理
     */
    public function failed(\Throwable $exception): void
    {
        // 記錄失敗日誌
        \Log::error('Failed to send welcome email', [
            'user_id' => $this->user->id,
            'error' => $exception->getMessage(),
        ]);
        
        // 通知管理員
        // ...
    }
}
```

#### 分發任務

```php
use App\Jobs\SendWelcomeEmail;

// 方式 1：立即分發
SendWelcomeEmail::dispatch($user);

// 方式 2：延遲分發（10 分鐘後）
SendWelcomeEmail::dispatch($user)->delay(now()->addMinutes(10));

// 方式 3：指定隊列
SendWelcomeEmail::dispatch($user)->onQueue('emails');

// 方式 4：指定連接
SendWelcomeEmail::dispatch($user)->onConnection('redis');

// 方式 5：條件分發
SendWelcomeEmail::dispatchIf($user->needsWelcome(), $user);
SendWelcomeEmail::dispatchUnless($user->hasWelcomed(), $user);

// 方式 6：同步執行（不加入隊列）
SendWelcomeEmail::dispatchSync($user);

// 方式 7：批次分發後執行
SendWelcomeEmail::dispatch($user)->afterResponse();
```

### 4. 隊列優先級

```php
// 設置多個隊列
// config/queue.php
'connections' => [
    'redis' => [
        'driver' => 'redis',
        'queue' => ['high', 'default', 'low'],
    ],
],

// 分發到不同優先級
ProcessPayment::dispatch($order)->onQueue('high');
SendEmail::dispatch($user)->onQueue('default');
GenerateReport::dispatch()->onQueue('low');

// 啟動 Worker 時指定處理順序
// php artisan queue:work --queue=high,default,low
```

### 5. 任務鏈（Job Chaining）

```php
use Illuminate\Support\Facades\Bus;

// 順序執行多個任務
Bus::chain([
    new ProcessPayment($order),
    new SendPaymentConfirmation($order),
    new UpdateInventory($order),
])->dispatch();

// 帶錯誤處理的鏈
Bus::chain([
    new ProcessPayment($order),
    new SendPaymentConfirmation($order),
])->catch(function (\Throwable $e) {
    // 任何任務失敗時執行
    \Log::error('Chain failed: ' . $e->getMessage());
})->dispatch();
```

### 6. 任務批次（Job Batching）

```php
use Illuminate\Bus\Batch;
use Illuminate\Support\Facades\Bus;

// 批次處理
Bus::batch([
    new ProcessOrder($order1),
    new ProcessOrder($order2),
    new ProcessOrder($order3),
])->then(function (Batch $batch) {
    // 所有任務成功完成
    \Log::info('All orders processed');
})->catch(function (Batch $batch, \Throwable $e) {
    // 第一個任務失敗
    \Log::error('Batch failed: ' . $e->getMessage());
})->finally(function (Batch $batch) {
    // 批次完成（無論成功或失敗）
    \Log::info('Batch completed');
})->name('process-orders')->dispatch();

// 檢查批次狀態
$batch = Bus::findBatch($batchId);
$batch->finished(); // 是否完成
$batch->cancelled(); // 是否取消
$batch->totalJobs; // 總任務數
$batch->processedJobs(); // 已處理數
$batch->failedJobs; // 失敗數
$batch->progress(); // 進度百分比

// 允許失敗的批次
Bus::batch([
    // ...
])->allowFailures()->dispatch();
```

### 7. 任務中間件

```php
// app/Jobs/Middleware/RateLimited.php
namespace App\Jobs\Middleware;

use Illuminate\Support\Facades\Redis;

class RateLimited
{
    public function handle($job, $next)
    {
        Redis::throttle('key')
            ->block(0)
            ->allow(10)
            ->every(60)
            ->then(function () use ($job, $next) {
                // 執行任務
                $next($job);
            }, function () use ($job) {
                // 無法獲取鎖，重新加入隊列
                $job->release(10);
            });
    }
}

// 在 Job 中使用
public function middleware()
{
    return [new RateLimited];
}
```

### 8. 啟動 Queue Worker

```bash
# 基本啟動
php artisan queue:work

# 指定連接
php artisan queue:work redis

# 指定隊列
php artisan queue:work --queue=high,default

# 限制執行時間（秒）
php artisan queue:work --timeout=60

# 限制內存使用（MB）
php artisan queue:work --memory=128

# 限制執行次數後重啟
php artisan queue:work --max-jobs=1000

# 限制執行時間後重啟（秒）
php artisan queue:work --max-time=3600

# 失敗任務重試次數
php artisan queue:work --tries=3

# 停止 Worker（處理完當前任務）
php artisan queue:restart

# 後台執行（使用 Supervisor）
```

### 9. Supervisor 配置

```ini
; /etc/supervisor/conf.d/laravel-worker.conf
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=8
redirect_stderr=true
stdout_logfile=/var/www/storage/logs/worker.log
stopwaitsecs=3600
```

```bash
# 重新載入配置
sudo supervisorctl reread
sudo supervisorctl update

# 啟動 Worker
sudo supervisorctl start laravel-worker:*

# 查看狀態
sudo supervisorctl status

# 停止 Worker
sudo supervisorctl stop laravel-worker:*
```

### 10. 任務調度（Task Scheduling）

```php
// app/Console/Kernel.php
namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        // 每分鐘執行
        $schedule->command('emails:send')->everyMinute();
        
        // 每小時執行
        $schedule->command('reports:generate')->hourly();
        
        // 每天凌晨 1 點執行
        $schedule->command('backup:database')
            ->dailyAt('01:00');
        
        // 每週一執行
        $schedule->command('newsletter:send')
            ->weekly()
            ->mondays()
            ->at('08:00');
        
        // 每月 1 號執行
        $schedule->command('invoices:generate')
            ->monthlyOn(1, '00:00');
        
        // 工作日執行
        $schedule->command('reports:daily')
            ->weekdays()
            ->at('09:00');
        
        // 週末執行
        $schedule->command('maintenance:cleanup')
            ->weekends()
            ->at('03:00');
        
        // 條件執行
        $schedule->command('backup:database')
            ->daily()
            ->when(function () {
                return date('d') % 7 === 0; // 每 7 天
            });
        
        // 避免重複執行
        $schedule->command('reports:generate')
            ->hourly()
            ->withoutOverlapping();
        
        // 單一服務器執行
        $schedule->command('reports:generate')
            ->daily()
            ->onOneServer();
        
        // 後台執行
        $schedule->command('backup:database')
            ->daily()
            ->runInBackground();
        
        // 執行閉包
        $schedule->call(function () {
            DB::table('recent_users')->delete();
        })->daily();
        
        // 執行任務
        $schedule->job(new GenerateReport)->daily();
        
        // 執行 Shell 命令
        $schedule->exec('node /home/forge/script.js')
            ->daily();
        
        // 鏈式方法
        $schedule->command('backup:database')
            ->daily()
            ->at('01:00')
            ->emailOutputTo('admin@example.com')
            ->sendOutputTo('/path/to/log')
            ->onSuccess(function () {
                // 成功回調
            })
            ->onFailure(function () {
                // 失敗回調
            });
    }
}
```

**啟動調度器**：

```bash
# 添加到 Crontab
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1

# 查看計劃任務
php artisan schedule:list

# 測試執行
php artisan schedule:work
```

### 11. 失敗任務處理

```php
// 查看失敗任務
php artisan queue:failed

// 重試失敗任務
php artisan queue:retry <id>

// 重試所有失敗任務
php artisan queue:retry all

// 刪除失敗任務
php artisan queue:forget <id>

// 清空所有失敗任務
php artisan queue:flush
```

**自動重試配置**：

```php
// config/queue.php
'failed' => [
    'driver' => env('QUEUE_FAILED_DRIVER', 'database-uuids'),
    'database' => env('DB_CONNECTION', 'mysql'),
    'table' => 'failed_jobs',
],

// 在 Job 中配置
class SendEmail implements ShouldQueue
{
    use Queueable;
    
    // 重試次數
    public $tries = 5;
    
    // 每次重試間隔（秒），指數退避
    public $backoff = [10, 30, 60, 120, 300];
    
    // 或固定間隔
    public $backoff = 60;
}
```

### 12. 監控與調試

```php
// 監聽隊列事件
use Illuminate\Support\Facades\Queue;

Queue::before(function (JobProcessing $event) {
    // 任務執行前
});

Queue::after(function (JobProcessed $event) {
    // 任務執行後
});

Queue::failing(function (JobFailed $event) {
    // 任務失敗
    \Log::error('Job failed', [
        'connection' => $event->connectionName,
        'job' => $event->job,
        'exception' => $event->exception,
    ]);
});

// Horizon（Redis 隊列管理工具）
composer require laravel/horizon

php artisan horizon:install
php artisan horizon

// 訪問 http://your-app.test/horizon
```

### 13. 最佳實踐

```php
// ✅ 1. 保持任務簡單
class ProcessOrder implements ShouldQueue
{
    public function handle()
    {
        // 只做一件事
        $this->order->process();
    }
}

// ✅ 2. 使用 SerializesModels
class SendEmail implements ShouldQueue
{
    use SerializesModels;
    
    public function __construct(User $user)
    {
        // 只序列化 ID，執行時重新載入
        $this->user = $user;
    }
}

// ✅ 3. 設置合理的超時和重試
public $timeout = 120;
public $tries = 3;
public $backoff = [10, 30, 60];

// ✅ 4. 實現 ShouldBeUnique（避免重複）
class ProcessPayment implements ShouldQueue, ShouldBeUnique
{
    public $uniqueFor = 3600; // 1 小時內唯一
    
    public function uniqueId()
    {
        return $this->order->id;
    }
}

// ✅ 5. 使用任務標籤（方便追蹤）
class ProcessOrder implements ShouldQueue
{
    public function tags()
    {
        return ['order', 'order:'.$this->order->id];
    }
}

// ❌ 避免在任務中處理請求數據
class BadJob implements ShouldQueue
{
    public function __construct(Request $request)
    {
        // 不要這樣做！Request 無法序列化
        $this->request = $request;
    }
}

// ✅ 正確做法：只傳遞需要的數據
class GoodJob implements ShouldQueue
{
    public function __construct(array $data)
    {
        $this->data = $data;
    }
}
```

## 總結

**隊列核心概念**：
- 🎯 **異步處理**：提升響應速度
- 🔄 **可靠執行**：失敗重試機制
- 📊 **批次處理**：高效處理大量任務
- ⏰ **任務調度**：定時執行任務

**驅動選擇**：
- 開發環境：**sync** 或 **database**
- 生產環境：**redis**（推薦）
- AWS 雲端：**sqs**

**最佳實踐**：
- ✅ 保持任務簡單、單一職責
- ✅ 設置合理的超時和重試次數
- ✅ 使用 Supervisor 管理 Worker
- ✅ 監控隊列狀態（Horizon）
- ✅ 實施失敗通知機制
- ✅ 使用任務中間件實現限流
- ✅ 避免序列化大對象

**性能優化**：
- 🚀 使用 Redis 驅動
- 🚀 合理設置 Worker 數量
- 🚀 使用隊列優先級
- 🚀 批次處理相似任務
- 🚀 避免在任務中進行 I/O 操作

掌握 Laravel 隊列系統能大幅提升應用的性能和用戶體驗。
