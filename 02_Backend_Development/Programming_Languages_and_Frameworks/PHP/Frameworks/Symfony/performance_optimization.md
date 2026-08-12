# Symfony 性能優化與最佳實踐

- **難度**: 8
- **重要程度**: 5
- **標籤**: `Symfony`, `Performance`, `Optimization`, `Production`, `Caching`

## 問題詳述

請深入解釋 Symfony 應用的性能優化策略，包括緩存、OPcache、Doctrine 優化、以及生產環境最佳配置。

## 核心理論與詳解

### 1. 性能優化層次

```
應用層優化
├── 緩存策略 (HTTP Cache, App Cache)
├── Doctrine 優化 (查詢、索引、懶加載)
└── 服務容器優化 (編譯、預熱)

框架層優化
├── 路由編譯
├── 配置緩存
└── 模板預編譯

PHP 層優化
├── OPcache
├── JIT (PHP 8+)
└── Preloading

服務器層優化
├── Nginx/Apache 調優
├── PHP-FPM 配置
└── HTTP/2, HTTP/3
```

### 2. 生產環境配置

```yaml
# config/packages/prod/routing.yaml
framework:
    router:
        strict_requirements: null

# config/packages/prod/doctrine.yaml
doctrine:
    orm:
        auto_generate_proxy_classes: false
        query_cache_driver:
            type: pool
            pool: doctrine.system_cache_pool
        result_cache_driver:
            type: pool
            pool: doctrine.result_cache_pool
        metadata_cache_driver:
            type: pool
            pool: doctrine.system_cache_pool

framework:
    cache:
        pools:
            doctrine.result_cache_pool:
                adapter: cache.app
            doctrine.system_cache_pool:
                adapter: cache.system
```

```bash
# 部署腳本
#!/bin/bash

# 1. 安裝依賴（生產模式）
composer install --no-dev --optimize-autoloader

# 2. 清除緩存
php bin/console cache:clear --env=prod --no-debug

# 3. 預熱緩存
php bin/console cache:warmup --env=prod --no-debug

# 4. 編譯容器
php bin/console cache:pool:clear cache.global_clearer

# 5. 優化 Composer 自動載入
composer dump-autoload --optimize --classmap-authoritative

# 6. 編譯資產
npm run build

# 7. 設置權限
chmod -R 755 var/
chown -R www-data:www-data var/
```

### 3. HTTP 緩存

**啟用 HTTP 緩存**：

```php
// src/Controller/ProductController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

class ProductController extends AbstractController
{
    #[Route('/products/{id}')]
    public function show(int $id): Response
    {
        $product = $this->productRepository->find($id);
        
        $response = $this->render('product/show.html.twig', [
            'product' => $product,
        ]);
        
        // 設置公共緩存 1 小時
        $response->setPublic();
        $response->setMaxAge(3600);
        
        // 或使用 SharedMaxAge（代理服務器）
        $response->setSharedMaxAge(3600);
        
        return $response;
    }
}
```

**ETag 驗證**：

```php
public function show(Request $request, int $id): Response
{
    $product = $this->productRepository->find($id);
    
    $response = new Response();
    
    // 生成 ETag
    $etag = md5(serialize($product));
    $response->setEtag($etag);
    $response->setPublic();
    
    // 檢查請求是否有效
    if ($response->isNotModified($request)) {
        return $response; // 返回 304 Not Modified
    }
    
    $response->setContent(
        $this->renderView('product/show.html.twig', ['product' => $product])
    );
    
    return $response;
}
```

**Last-Modified 驗證**：

```php
public function show(Request $request, int $id): Response
{
    $product = $this->productRepository->find($id);
    
    $response = new Response();
    $response->setLastModified($product->getUpdatedAt());
    $response->setPublic();
    
    if ($response->isNotModified($request)) {
        return $response;
    }
    
    return $this->render('product/show.html.twig', ['product' => $product], $response);
}
```

**使用 Symfony HTTP Cache**：

```php
// public/index.php
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\HttpCache\HttpCache;
use Symfony\Component\HttpKernel\HttpCache\Store;

require_once dirname(__DIR__).'/vendor/autoload_runtime.php';

return function (array $context) {
    $kernel = new Kernel($context['APP_ENV'], (bool) $context['APP_DEBUG']);
    
    // 包裝 Kernel 為 HTTP Cache
    if (!$context['APP_DEBUG']) {
        $kernel = new HttpCache(
            $kernel,
            new Store(__DIR__.'/../var/cache/http_cache')
        );
    }
    
    return $kernel;
};
```

### 4. 應用級緩存

```php
// src/Service/ProductService.php
namespace App\Service;

use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

class ProductService
{
    public function __construct(
        private ProductRepository $repository,
        private CacheInterface $cache
    ) {
    }
    
    public function getFeaturedProducts(): array
    {
        return $this->cache->get('featured_products', function (ItemInterface $item) {
            // 緩存 1 小時
            $item->expiresAfter(3600);
            
            // 添加標籤（方便清除）
            $item->tag(['products', 'featured']);
            
            return $this->repository->findFeatured();
        });
    }
    
    public function invalidateProductCache(): void
    {
        // 清除特定緩存
        $this->cache->delete('featured_products');
        
        // 或使用標籤清除
        $this->cache->invalidateTags(['products']);
    }
}
```

**配置緩存池**：

```yaml
# config/packages/cache.yaml
framework:
    cache:
        app: cache.adapter.redis
        default_redis_provider: redis://localhost
        
        pools:
            # 產品緩存（1小時）
            cache.products:
                adapter: cache.adapter.redis
                default_lifetime: 3600
            
            # 用戶緩存（10分鐘）
            cache.users:
                adapter: cache.adapter.redis
                default_lifetime: 600
            
            # 配置緩存（永久）
            cache.config:
                adapter: cache.adapter.filesystem
```

### 5. Doctrine 性能優化

#### 查詢優化

```php
// ❌ N+1 查詢問題
$posts = $entityManager->getRepository(Post::class)->findAll();
foreach ($posts as $post) {
    echo $post->getAuthor()->getName(); // N 次額外查詢
}

// ✅ 使用 JOIN FETCH
$posts = $entityManager->createQueryBuilder()
    ->select('p', 'a')
    ->from(Post::class, 'p')
    ->leftJoin('p.author', 'a')
    ->getQuery()
    ->getResult();

// ✅ 或使用 Repository
class PostRepository extends ServiceEntityRepository
{
    public function findAllWithAuthor(): array
    {
        return $this->createQueryBuilder('p')
            ->leftJoin('p.author', 'a')
            ->addSelect('a')
            ->getQuery()
            ->getResult();
    }
}

// ✅ 部分對象（只選擇需要的欄位）
$posts = $entityManager->createQueryBuilder()
    ->select('p.id', 'p.title', 'a.name as authorName')
    ->from(Post::class, 'p')
    ->leftJoin('p.author', 'a')
    ->getQuery()
    ->getArrayResult(); // 返回數組而非對象

// ✅ 分頁查詢
use Doctrine\ORM\Tools\Pagination\Paginator;

$query = $entityManager->createQueryBuilder()
    ->select('p')
    ->from(Post::class, 'p')
    ->setFirstResult(0)
    ->setMaxResults(20)
    ->getQuery();

$paginator = new Paginator($query);
```

#### 批量操作

```php
// ✅ 批量插入
$batchSize = 20;
for ($i = 0; $i < 1000; $i++) {
    $product = new Product();
    $product->setName('Product ' . $i);
    $entityManager->persist($product);
    
    if (($i % $batchSize) === 0) {
        $entityManager->flush();
        $entityManager->clear(); // 清除內存
    }
}
$entityManager->flush();

// ✅ 批量更新（DQL）
$query = $entityManager->createQuery(
    'UPDATE App\Entity\Product p SET p.price = p.price * 1.1 WHERE p.category = :category'
);
$query->setParameter('category', 'Electronics');
$query->execute();
```

#### 查詢緩存

```php
// 結果緩存
$query = $entityManager->createQuery('SELECT p FROM App\Entity\Product p');
$query->enableResultCache(3600, 'products_list');
$products = $query->getResult();

// 查詢緩存
$query->enableResultCache(3600); // 緩存查詢結果
$query->useQueryCache(true);     // 緩存解析的查詢

// 清除緩存
use Doctrine\ORM\Cache;
$cache = $entityManager->getCache();
$cache->evictEntityRegion(Product::class);
```

#### 懶加載優化

```php
// 配置實體為懶加載
#[ORM\Entity]
class Post
{
    #[ORM\ManyToOne(targetEntity: User::class, fetch: 'LAZY')]
    private User $author;
    
    // ✅ 使用代理方法避免加載
    public function getAuthorId(): int
    {
        return $this->author->getId(); // 不會觸發查詢
    }
}
```

### 6. 服務容器優化

```yaml
# config/services.yaml
services:
    _defaults:
        autowire: true
        autoconfigure: true
        public: false
        
        # 生產環境：移除服務定位器
        bind:
            $debug: '%kernel.debug%'
    
    # 延遲加載重型服務
    App\Service\HeavyService:
        lazy: true
    
    # 預編譯服務（移除反射開銷）
    App\:
        resource: '../src/'
        exclude:
            - '../src/DependencyInjection/'
            - '../src/Entity/'
```

```bash
# 容器編譯
php bin/console cache:clear --env=prod

# 查看編譯後的容器
php bin/console debug:container --env=prod
```

### 7. OPcache 配置

```ini
; php.ini
[opcache]
opcache.enable=1
opcache.enable_cli=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=20000

; 生產環境：禁用檔案修改檢查
opcache.validate_timestamps=0
opcache.revalidate_freq=0

; 開發環境：啟用檔案修改檢查
; opcache.validate_timestamps=1
; opcache.revalidate_freq=2

; 優化設置
opcache.save_comments=1
opcache.fast_shutdown=1
opcache.enable_file_override=1

; PHP 8+ JIT
opcache.jit_buffer_size=100M
opcache.jit=tracing
```

**OPcache 管理**：

```bash
# 清除 OPcache
php bin/console cache:clear --env=prod

# 或重啟 PHP-FPM
sudo service php8.2-fpm restart
```

### 8. PHP Preloading (PHP 7.4+)

```php
// config/preload.php
<?php

if (file_exists(dirname(__DIR__).'/var/cache/prod/App_KernelProdContainer.preload.php')) {
    require dirname(__DIR__).'/var/cache/prod/App_KernelProdContainer.preload.php';
}
```

```ini
; php.ini
opcache.preload=/var/www/config/preload.php
opcache.preload_user=www-data
```

### 9. Twig 優化

```yaml
# config/packages/prod/twig.yaml
twig:
    # 禁用調試
    debug: false
    
    # 禁用嚴格變量檢查
    strict_variables: false
    
    # 啟用自動轉義
    autoescape: 'html'
    
    # 緩存
    cache: '%kernel.cache_dir%/twig'
```

```twig
{# 優化資源載入 #}
{% block stylesheets %}
    {{ encore_entry_link_tags('app') }}
{% endblock %}

{% block javascripts %}
    {{ encore_entry_script_tags('app') }}
{% endblock %}

{# 使用 asset() 函數啟用版本控制 #}
<link rel="stylesheet" href="{{ asset('css/app.css') }}">

{# 延遲載入圖片 #}
<img src="{{ asset('images/placeholder.jpg') }}" 
     data-src="{{ asset('images/photo.jpg') }}" 
     loading="lazy">
```

### 10. 資產優化（Webpack Encore）

```javascript
// webpack.config.js
const Encore = require('@symfony/webpack-encore');

Encore
    .setOutputPath('public/build/')
    .setPublicPath('/build')
    .addEntry('app', './assets/app.js')
    
    // 生產環境優化
    .enableSingleRuntimeChunk()
    .cleanupOutputBeforeBuild()
    .enableSourceMaps(!Encore.isProduction())
    .enableVersioning(Encore.isProduction())
    
    // 壓縮
    .enableSassLoader()
    .enablePostCssLoader()
    
    // 分割程式碼
    .splitEntryChunks()
    .configureSplitChunks((splitChunks) => {
        splitChunks.chunks = 'all';
        splitChunks.minSize = 0;
    })
;

module.exports = Encore.getWebpackConfig();
```

```bash
# 生產環境編譯
npm run build

# 或
yarn build
```

### 11. Messenger（異步處理）

```yaml
# config/packages/messenger.yaml
framework:
    messenger:
        transports:
            async:
                dsn: '%env(MESSENGER_TRANSPORT_DSN)%'
                options:
                    max_retries: 3
                    multiplier: 2
                retry_strategy:
                    delay: 1000
        
        routing:
            # 異步處理郵件
            App\Message\SendEmail: async
```

```php
// 發送消息到隊列
class OrderService
{
    public function __construct(
        private MessageBusInterface $messageBus
    ) {
    }
    
    public function placeOrder(Order $order): void
    {
        // 同步處理
        $this->entityManager->persist($order);
        $this->entityManager->flush();
        
        // 異步處理（不阻塞響應）
        $this->messageBus->dispatch(new SendOrderConfirmation($order->getId()));
    }
}
```

### 12. 性能監控

**Symfony Profiler**（開發環境）：

```yaml
# config/packages/dev/web_profiler.yaml
web_profiler:
    toolbar: true
    intercept_redirects: false

framework:
    profiler:
        only_exceptions: false
        collect_serializer_data: true
```

**Blackfire.io**（生產環境）：

```bash
# 安裝 Blackfire
composer require --dev blackfire/php-sdk

# 分析性能
blackfire run php bin/console app:heavy-command
```

**Symfony Stopwatch**：

```php
use Symfony\Component\Stopwatch\Stopwatch;

class ProductService
{
    public function __construct(
        private Stopwatch $stopwatch
    ) {
    }
    
    public function heavyOperation(): void
    {
        $this->stopwatch->start('database_query');
        
        // 執行操作
        $this->repository->findAll();
        
        $event = $this->stopwatch->stop('database_query');
        
        // 記錄時間
        $this->logger->info('Query time: ' . $event->getDuration() . 'ms');
    }
}
```

### 13. Nginx 配置

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/project/public;
    
    # Gzip 壓縮
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # 瀏覽器緩存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # PHP-FPM
    location ~ ^/index\.php(/|$) {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $realpath_root;
        
        # 優化
        fastcgi_buffer_size 128k;
        fastcgi_buffers 4 256k;
        fastcgi_busy_buffers_size 256k;
        
        internal;
    }
    
    # 阻止 .php 文件訪問
    location ~ \.php$ {
        return 404;
    }
}
```

### 14. PHP-FPM 優化

```ini
; /etc/php/8.2/fpm/pool.d/www.conf

; 進程管理
pm = dynamic
pm.max_children = 50
pm.start_servers = 10
pm.min_spare_servers = 5
pm.max_spare_servers = 20
pm.max_requests = 500

; 或靜態管理（高流量）
; pm = static
; pm.max_children = 50

; 優化
request_terminate_timeout = 30
request_slowlog_timeout = 5s
slowlog = /var/log/php-fpm/slow.log
```

### 15. 性能檢查清單

```php
// ✅ 1. 生產環境配置
APP_ENV=prod
APP_DEBUG=0

// ✅ 2. 優化 Composer
composer install --no-dev --optimize-autoloader --classmap-authoritative

// ✅ 3. 緩存預熱
php bin/console cache:warmup --env=prod

// ✅ 4. 啟用 OPcache
opcache.enable=1
opcache.validate_timestamps=0

// ✅ 5. HTTP 緩存
$response->setPublic();
$response->setMaxAge(3600);

// ✅ 6. 應用緩存
使用 Redis 或 Memcached

// ✅ 7. Doctrine 優化
- 查詢緩存
- 結果緩存
- 避免 N+1 查詢

// ✅ 8. 異步處理
使用 Messenger 處理耗時任務

// ✅ 9. CDN
靜態資源使用 CDN

// ✅ 10. 資產優化
- 壓縮 CSS/JS
- 版本控制
- 程式碼分割
```

## 總結

**Symfony 性能優化金字塔**：

```
        /\
       /CDN\      最外層：內容分發
      /------\    
     /HTTP緩存\   第二層：瀏覽器/代理緩存
    /----------\  
   /應用級緩存\   第三層：Redis/Memcached
  /------------\  
 /Doctrine優化\   第四層：數據庫查詢
/-------------\   
OPcache+JIT     底層：PHP 性能
```

**優化優先級**：
1. **OPcache**（最大收益）
2. **HTTP 緩存**（減少請求）
3. **應用緩存**（Redis）
4. **Doctrine 優化**（查詢）
5. **異步處理**（Messenger）
6. **資產優化**（壓縮、CDN）

**關鍵性能指標**：
- ⏱️ **TTFB** < 200ms
- 🚀 **吞吐量** > 1000 req/s
- 💾 **內存** < 50MB/請求
- 🗄️ **查詢** < 10 次/請求

**生產環境必做**：
- ✅ APP_DEBUG=0
- ✅ 啟用 OPcache
- ✅ 編譯容器
- ✅ 優化 Composer 自動載入
- ✅ HTTP 緩存
- ✅ 靜態資源壓縮
- ✅ CDN 配置

Symfony 的性能優化是一個系統工程，需要從多個層面綜合考慮。

### 測驗對應

- **Concept ID**: `concept.php.symfony.performance-optimization`
- **Learning Objectives**:
  - `LO-1`: 能夠從 request trace、container compile、reflection、autoload、資料庫、cache、OPcache 與 listener latency 定位瓶頸。
  - `LO-2`: 能夠比較 production cache、warmup、Composer autoload optimization、HTTP cache、query／serialization 與非同步工作的效益及成本。
  - `LO-3`: 能夠以代表性負載、P50／P99、CPU／memory、錯誤率與下游飽和度驗證效能修正，並保留單一變因與回滾路徑。
- **Prerequisites**: [Symfony 框架基礎](./symfony_framework_basics.md)、[Composer 依賴管理](../../Tooling/what_is_composer_and_its_purpose.md)
- **Quick Quiz**: [Q28](../../../../../QUIZ/09_PHP.md#q28-symfony-效能優化應如何從證據而非猜測開始)
- **Hard Assessment**: [PHP Framework Tooling Incident](../../../../../QUIZ/Hard_Assessments/php_framework_tooling_incident.md) (`assessment.php.framework-tooling.incident.v1`)
- **Assessment Gate**: 完成 Hard Assessment 中對應的 `LO-1`～`LO-3`，並達到總分 3/4；若未達標，回讀本文後重測。
