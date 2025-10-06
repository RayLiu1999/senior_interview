# Laravel 性能優化

- **難度**: 8
- **重要程度**: 5
- **標籤**: `Laravel`, `Performance`, `Optimization`, `Caching`, `Database`

## 問題詳述

請深入解釋 Laravel 應用的性能優化策略,包括數據庫優化、緩存策略、隊列使用、以及生產環境配置。

## 核心理論與詳解

### 1. 性能優化概述

**優化層級**：

```
應用層 → 框架層 → 數據庫層 → 服務器層 → 網絡層
  ↓        ↓         ↓          ↓          ↓
代碼    配置緩存    查詢優化    opcache    CDN
隊列    路由緩存    索引      PHP-FPM    HTTP/2
緩存    視圖編譯    連接池    Nginx優化  壓縮
```

**性能指標**：
- ⏱️ **響應時間**：< 200ms（理想）
- 🚀 **吞吐量**：> 1000 req/s
- 💾 **內存使用**：< 128MB/請求
- 🗄️ **數據庫查詢**：< 10 次/請求

### 2. 數據庫優化

#### N+1 查詢問題

```php
// ❌ N+1 查詢問題（1 + N 次查詢）
$posts = Post::all(); // 1 次查詢
foreach ($posts as $post) {
    echo $post->user->name; // N 次查詢
}

// ✅ 使用 Eager Loading（2 次查詢）
$posts = Post::with('user')->get();
foreach ($posts as $post) {
    echo $post->user->name;
}

// ✅ 載入多個關聯
$posts = Post::with(['user', 'comments', 'tags'])->get();

// ✅ 嵌套 Eager Loading
$posts = Post::with('user.profile')->get();

// ✅ 條件載入
$posts = Post::with(['comments' => function ($query) {
    $query->where('approved', 1)->limit(5);
}])->get();

// ✅ 延遲 Eager Loading
$posts = Post::all();
if ($someCondition) {
    $posts->load('user');
}
```

#### 查詢優化

```php
// ✅ 1. 只選擇需要的欄位
$users = User::select('id', 'name', 'email')->get();

// ❌ 避免
$users = User::all(); // 選擇所有欄位

// ✅ 2. 使用 Chunk 處理大量數據
User::chunk(100, function ($users) {
    foreach ($users as $user) {
        // 處理用戶
    }
});

// 或使用 lazy() 方法（Laravel 8+）
User::lazy()->each(function ($user) {
    // 逐個處理，自動分頁
});

// ✅ 3. 使用 Cursor（內存友好）
foreach (User::cursor() as $user) {
    // 只載入當前記錄到內存
}

// ✅ 4. 計數優化
// ❌ 慢
$count = Post::all()->count();

// ✅ 快
$count = Post::count();

// ✅ 5. 存在性檢查
// ❌ 慢
if (Post::where('user_id', $userId)->first()) {
    // ...
}

// ✅ 快
if (Post::where('user_id', $userId)->exists()) {
    // ...
}

// ✅ 6. 批量插入
// ❌ 慢（N 次查詢）
foreach ($data as $item) {
    Post::create($item);
}

// ✅ 快（1 次查詢）
Post::insert($data);

// ✅ 7. 使用 upsert（Laravel 8+）
Post::upsert([
    ['id' => 1, 'views' => 100],
    ['id' => 2, 'views' => 200],
], ['id'], ['views']);
```

#### 索引優化

```php
// 創建索引
Schema::table('posts', function (Blueprint $table) {
    // 單欄位索引
    $table->index('user_id');
    
    // 複合索引
    $table->index(['user_id', 'status']);
    
    // 唯一索引
    $table->unique('email');
    
    // 全文索引
    $table->fullText('content');
});

// 查詢優化示例
// ✅ 使用索引
Post::where('status', 'published')
    ->where('user_id', $userId)
    ->get();

// ❌ 避免函數在索引欄位上
Post::whereRaw('DATE(created_at) = ?', [today()])->get();

// ✅ 改用
Post::whereDate('created_at', today())->get();
```

#### 數據庫連接池

```php
// config/database.php
'mysql' => [
    'driver' => 'mysql',
    // ...
    'options' => [
        PDO::ATTR_PERSISTENT => true, // 持久連接
    ],
    'sticky' => true, // 讀寫分離時保持同一連接
],
```

### 3. 緩存策略

#### 配置緩存

```php
// config/cache.php
'default' => env('CACHE_DRIVER', 'redis'),

'stores' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'cache',
        'lock_connection' => 'default',
    ],
    
    'memcached' => [
        'driver' => 'memcached',
        'servers' => [
            [
                'host' => env('MEMCACHED_HOST', '127.0.0.1'),
                'port' => env('MEMCACHED_PORT', 11211),
                'weight' => 100,
            ],
        ],
    ],
],
```

#### 應用級緩存

```php
use Illuminate\Support\Facades\Cache;

// ✅ 1. 基本緩存
$value = Cache::get('key');
Cache::put('key', 'value', now()->addHours(1));
Cache::forget('key');

// ✅ 2. 永久緩存
Cache::forever('key', 'value');

// ✅ 3. 緩存不存在時存儲
Cache::add('key', 'value', $seconds);

// ✅ 4. 緩存取得或存儲
$users = Cache::remember('users', 3600, function () {
    return User::all();
});

// ✅ 5. 永久緩存取得或存儲
$config = Cache::rememberForever('config', function () {
    return DB::table('config')->get();
});

// ✅ 6. 取得並刪除
$value = Cache::pull('key');

// ✅ 7. 原子鎖（避免緩存擊穿）
$lock = Cache::lock('foo', 10);

if ($lock->get()) {
    // 獲得鎖，執行操作
    Cache::put('key', 'value', 60);
    
    $lock->release();
}

// 或使用閉包
Cache::lock('foo')->get(function () {
    // 獲得鎖時執行
});

// ✅ 8. 標籤緩存（僅 Redis/Memcached）
Cache::tags(['users', 'posts'])->put('key', 'value', 60);
$value = Cache::tags(['users'])->get('key');
Cache::tags(['users'])->flush(); // 清除標籤下的所有緩存
```

#### 模型緩存

```php
// 使用 remember 緩存查詢
$users = Cache::remember('users:active', 3600, function () {
    return User::where('active', 1)->get();
});

// 清除緩存（在 Model Event 中）
class User extends Model
{
    protected static function booted()
    {
        static::saved(function () {
            Cache::forget('users:active');
        });
        
        static::deleted(function () {
            Cache::forget('users:active');
        });
    }
}

// 或使用 Laravel Model Cache 包
composer require genealabs/laravel-model-caching

// 自動緩存
$users = User::cached()->get();
```

#### 視圖緩存

```bash
# 編譯視圖
php artisan view:cache

# 清除視圖緩存
php artisan view:clear
```

#### 路由緩存

```bash
# 緩存路由（僅支援閉包路由）
php artisan route:cache

# 清除路由緩存
php artisan route:clear
```

#### 配置緩存

```bash
# 緩存配置
php artisan config:cache

# 清除配置緩存
php artisan config:clear
```

#### HTTP 緩存

```php
// 設置 ETag
return response($content)
    ->header('ETag', md5($content))
    ->header('Cache-Control', 'public, max-age=3600');

// 中間件實現
class ETagMiddleware
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);
        
        if ($request->method() === 'GET') {
            $etag = md5($response->getContent());
            $response->header('ETag', $etag);
            
            if ($request->header('If-None-Match') === $etag) {
                return response('', 304);
            }
        }
        
        return $response;
    }
}
```

### 4. 隊列優化

```php
// ✅ 1. 將耗時操作移到隊列
class UserController extends Controller
{
    public function store(Request $request)
    {
        $user = User::create($request->all());
        
        // ❌ 同步發送郵件（慢）
        Mail::to($user)->send(new WelcomeMail($user));
        
        // ✅ 異步發送（快）
        SendWelcomeEmail::dispatch($user);
        
        return response()->json($user, 201);
    }
}

// ✅ 2. 使用隊列優先級
ProcessPayment::dispatch($order)->onQueue('high');
SendEmail::dispatch($user)->onQueue('low');

// ✅ 3. 批次處理
Bus::batch([
    new ProcessOrder($order1),
    new ProcessOrder($order2),
    new ProcessOrder($order3),
])->dispatch();

// ✅ 4. 延遲執行
GenerateReport::dispatch()->delay(now()->addMinutes(10));
```

### 5. 響應優化

```php
// ✅ 1. API Resource（自動緩存）
class UserResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
        ];
    }
}

return UserResource::collection($users);

// ✅ 2. 分頁
$users = User::paginate(15);

// ✅ 3. 響應壓縮（Gzip）
// 在 middleware 中啟用
$response->header('Content-Encoding', 'gzip');

// ✅ 4. JSON 優化
return response()->json($data, 200, [], JSON_UNESCAPED_UNICODE);
```

### 6. 前端資源優化

```bash
# 1. 編譯前端資源
npm run production

# 2. 版本控制（緩存破壞）
# webpack.mix.js
mix.js('resources/js/app.js', 'public/js')
   .sass('resources/sass/app.scss', 'public/css')
   .version();

# 3. 使用 CDN
# config/app.php
'asset_url' => env('ASSET_URL', null),
```

```php
// 4. 延遲載入圖片
<img src="placeholder.jpg" data-src="image.jpg" class="lazyload">

// 5. 圖片優化
composer require intervention/image

$img = Image::make('photo.jpg');
$img->resize(300, 200);
$img->save('thumb.jpg', 80); // 壓縮質量
```

### 7. Session 優化

```php
// config/session.php

// ✅ 生產環境使用 Redis
'driver' => env('SESSION_DRIVER', 'redis'),

// ✅ 使用 Cookie 存儲（適用於 API）
'driver' => 'cookie',

// ✅ 使用數據庫（需要索引）
Schema::table('sessions', function (Blueprint $table) {
    $table->index('user_id');
    $table->index('last_activity');
});
```

### 8. OPcache 配置

```ini
; php.ini
[opcache]
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0  ; 生產環境設為 0
opcache.revalidate_freq=0
opcache.save_comments=1
opcache.fast_shutdown=1
```

```bash
# 部署時清除 OPcache
php artisan opcache:clear

# 或重啟 PHP-FPM
sudo service php8.1-fpm restart
```

### 9. PHP-FPM 優化

```ini
; /etc/php/8.1/fpm/pool.d/www.conf

; 動態進程管理
pm = dynamic
pm.max_children = 50
pm.start_servers = 10
pm.min_spare_servers = 5
pm.max_spare_servers = 20
pm.max_requests = 500

; 或靜態進程管理（高流量）
pm = static
pm.max_children = 50
```

### 10. Nginx 優化

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html/public;
    
    # Gzip 壓縮
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    
    # 瀏覽器緩存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 禁用訪問日誌（靜態文件）
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        access_log off;
    }
    
    # PHP-FPM
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        
        # FastCGI 緩存
        fastcgi_cache_key "$scheme$request_method$host$request_uri";
        fastcgi_cache_valid 200 60m;
        fastcgi_cache_bypass $skip_cache;
        fastcgi_no_cache $skip_cache;
    }
}
```

### 11. 生產環境配置

```php
// .env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://example.com

# 緩存驅動
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# 數據庫優化
DB_CONNECTION=mysql
DB_POOL_SIZE=10

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
REDIS_DB=0
REDIS_CACHE_DB=1
```

```bash
# 優化 Composer 自動載入
composer install --optimize-autoloader --no-dev

# 緩存配置
php artisan config:cache

# 緩存路由
php artisan route:cache

# 編譯視圖
php artisan view:cache

# 緩存事件
php artisan event:cache
```

### 12. 性能監控

```php
// 使用 Laravel Telescope
composer require laravel/telescope

// 使用 New Relic
composer require intouch/newrelic

// 使用 Sentry（錯誤追蹤）
composer require sentry/sentry-laravel

// config/sentry.php
'dsn' => env('SENTRY_LARAVEL_DSN'),
'traces_sample_rate' => 0.2, // 20% 請求追蹤
```

### 13. 性能測試

```bash
# Apache Bench
ab -n 1000 -c 10 http://example.com/

# Siege
siege -c 10 -r 100 http://example.com/

# wrk
wrk -t12 -c400 -d30s http://example.com/

# Laravel Benchmark
composer require fightbulc/laravel-benchmark
```

### 14. 性能優化檢查清單

```php
// ✅ 數據庫優化
- [ ] 使用 Eager Loading 避免 N+1 查詢
- [ ] 只選擇需要的欄位
- [ ] 為常用查詢添加索引
- [ ] 使用 chunk/cursor 處理大數據
- [ ] 使用數據庫連接池

// ✅ 緩存策略
- [ ] 使用 Redis/Memcached
- [ ] 緩存路由、配置、視圖
- [ ] 實施 HTTP 緩存（ETag）
- [ ] 使用模型緩存
- [ ] 實施標籤緩存

// ✅ 隊列使用
- [ ] 將耗時操作移到隊列
- [ ] 使用隊列優先級
- [ ] 使用 Supervisor 管理 Worker
- [ ] 監控隊列狀態

// ✅ 前端優化
- [ ] 編譯前端資源（production）
- [ ] 啟用資源版本控制
- [ ] 使用 CDN
- [ ] 優化圖片（壓縮、延遲載入）
- [ ] 啟用 Gzip 壓縮

// ✅ 服務器優化
- [ ] 啟用 OPcache
- [ ] 優化 PHP-FPM 配置
- [ ] 優化 Nginx 配置
- [ ] 使用 HTTP/2
- [ ] 實施 SSL/TLS

// ✅ 監控與調試
- [ ] 安裝 Telescope/Debugbar
- [ ] 配置日誌監控
- [ ] 設置錯誤追蹤（Sentry）
- [ ] 定期性能測試
```

## 總結

**性能優化的黃金法則**：
- 🎯 **測量先於優化**：使用工具找出瓶頸
- 🎯 **低垂的果實優先**：先優化影響最大的部分
- 🎯 **緩存是關鍵**：合理使用多層緩存
- 🎯 **異步處理**：將耗時操作移到隊列

**優化優先級**：
1. **數據庫優化**（最大影響）
   - N+1 查詢
   - 索引
   - 查詢優化
2. **緩存策略**
   - Redis/Memcached
   - HTTP 緩存
   - OPcache
3. **隊列使用**
   - 異步處理
   - 批次任務
4. **服務器配置**
   - PHP-FPM
   - Nginx
   - HTTP/2

**關鍵指標**：
- ⏱️ **響應時間** < 200ms
- 🚀 **吞吐量** > 1000 req/s
- 💾 **內存使用** < 128MB/請求
- 🗄️ **數據庫查詢** < 10 次/請求
- 📊 **緩存命中率** > 80%

**生產環境必做**：
- ✅ 關閉 `APP_DEBUG`
- ✅ 啟用所有緩存（config/route/view）
- ✅ 使用 Redis 作為緩存驅動
- ✅ 優化 Composer 自動載入
- ✅ 啟用 OPcache
- ✅ 配置 CDN
- ✅ 監控性能指標

性能優化是一個持續的過程，需要根據實際情況不斷調整和改進。
