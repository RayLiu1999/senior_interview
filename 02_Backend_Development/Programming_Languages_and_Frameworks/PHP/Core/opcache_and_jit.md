# PHP OPcache 與 JIT 編譯器

- **難度**: 8
- **重要程度**: 4
- **標籤**: `Performance`, `OPcache`, `JIT`, `Optimization`

## 問題詳述

OPcache 和 JIT（Just-In-Time）編譯器是 PHP 性能優化的關鍵技術。請解釋它們的工作原理、配置方法和性能提升效果。

## 核心理論與詳解

### PHP 代碼執行流程

#### 傳統執行流程（無 OPcache）

```
PHP 源代碼
    ↓
詞法分析（Lexing）
    ↓
語法分析（Parsing）
    ↓
生成抽象語法樹（AST）
    ↓
編譯為字節碼（Opcode）
    ↓
Zend VM 執行字節碼
    ↓
輸出結果
```

每次請求都要重複這個過程，浪費 CPU 資源。

### OPcache 原理

#### 什麼是 OPcache

OPcache 是 PHP 5.5+ 內建的字節碼快取機制，將編譯後的 opcode 存儲在共享記憶體中，避免重複編譯。

**工作原理**：
1. **首次請求**：編譯 PHP 代碼為 opcode，存入共享記憶體
2. **後續請求**：直接從記憶體讀取 opcode，跳過編譯階段
3. **文件變更**：檢測文件時間戳，自動重新編譯

**性能提升**：
- 減少 CPU 使用（不需要重複編譯）
- 提升響應速度（跳過編譯階段）
- 典型性能提升：30%-50%

#### OPcache 配置

**php.ini 關鍵配置**：
```ini
; 啟用 OPcache
opcache.enable=1
opcache.enable_cli=0  ; CLI 模式通常不啟用

; 記憶體設置
opcache.memory_consumption=128  ; 共享記憶體大小（MB）
opcache.interned_strings_buffer=16  ; 字符串緩衝區大小（MB）
opcache.max_accelerated_files=10000  ; 最大快取文件數

; 驗證設置
opcache.revalidate_freq=60  ; 檢查文件變更間隔（秒）
opcache.validate_timestamps=1  ; 是否檢查文件時間戳

; 優化設置
opcache.save_comments=1  ; 保存註釋（某些框架需要）
opcache.fast_shutdown=1  ; 快速關閉
opcache.enable_file_override=0

; 生產環境優化
opcache.validate_timestamps=0  ; 不檢查文件變更（手動清除快取）
opcache.revalidate_freq=0
opcache.max_wasted_percentage=5  ; 浪費記憶體超過 5% 時重啟
```

**開發環境配置**：
```ini
opcache.enable=1
opcache.validate_timestamps=1  ; 自動檢測文件變更
opcache.revalidate_freq=0  ; 每次請求都檢查
```

**生產環境配置**：
```ini
opcache.enable=1
opcache.validate_timestamps=0  ; 不檢查文件變更
opcache.memory_consumption=256  ; 更大的記憶體
opcache.max_accelerated_files=20000
opcache.interned_strings_buffer=32
```

#### 管理 OPcache

**檢查狀態**：
```php
<?php
$status = opcache_get_status();

print_r([
    'opcache_enabled' => $status['opcache_enabled'],
    'memory_usage' => $status['memory_usage'],
    'cache_full' => $status['cache_full'],
    'num_cached_scripts' => $status['opcache_statistics']['num_cached_scripts'],
    'hits' => $status['opcache_statistics']['hits'],
    'misses' => $status['opcache_statistics']['misses'],
    'hit_rate' => $status['opcache_statistics']['opcache_hit_rate']
]);
```

**清除快取**：
```php
<?php
// 清除所有快取
opcache_reset();

// 清除特定文件
opcache_invalidate('/path/to/file.php', true);

// 強制編譯文件
opcache_compile_file('/path/to/file.php');
```

**部署時清除快取**：
```bash
# 方法 1：重啟 PHP-FPM
systemctl restart php-fpm

# 方法 2：使用 CLI 腳本
php -r "opcache_reset();"

# 方法 3：使用 opcache 的 API
curl https://example.com/opcache-clear.php
```

#### OPcache 監控

**opcache.php 監控腳本**：
```php
<?php
// 需要認證保護
if (!isset($_SERVER['PHP_AUTH_USER']) || $_SERVER['PHP_AUTH_USER'] !== 'admin') {
    header('HTTP/1.1 401 Unauthorized');
    exit;
}

$status = opcache_get_status();
$config = opcache_get_configuration();

?>
<!DOCTYPE html>
<html>
<head>
    <title>OPcache Status</title>
    <style>
        body { font-family: Arial; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #4CAF50; color: white; }
        .good { color: green; }
        .warning { color: orange; }
        .bad { color: red; }
    </style>
</head>
<body>
    <h1>OPcache Status</h1>
    
    <h2>Statistics</h2>
    <table>
        <tr>
            <th>Metric</th>
            <th>Value</th>
        </tr>
        <tr>
            <td>Hit Rate</td>
            <td class="<?= $status['opcache_statistics']['opcache_hit_rate'] > 95 ? 'good' : 'warning' ?>">
                <?= number_format($status['opcache_statistics']['opcache_hit_rate'], 2) ?>%
            </td>
        </tr>
        <tr>
            <td>Cached Scripts</td>
            <td><?= number_format($status['opcache_statistics']['num_cached_scripts']) ?></td>
        </tr>
        <tr>
            <td>Hits</td>
            <td><?= number_format($status['opcache_statistics']['hits']) ?></td>
        </tr>
        <tr>
            <td>Misses</td>
            <td><?= number_format($status['opcache_statistics']['misses']) ?></td>
        </tr>
    </table>
    
    <h2>Memory Usage</h2>
    <table>
        <tr>
            <th>Metric</th>
            <th>Value</th>
        </tr>
        <tr>
            <td>Used Memory</td>
            <td><?= number_format($status['memory_usage']['used_memory'] / 1024 / 1024, 2) ?> MB</td>
        </tr>
        <tr>
            <td>Free Memory</td>
            <td><?= number_format($status['memory_usage']['free_memory'] / 1024 / 1024, 2) ?> MB</td>
        </tr>
        <tr>
            <td>Wasted Memory</td>
            <td class="<?= $status['memory_usage']['current_wasted_percentage'] > 10 ? 'warning' : 'good' ?>">
                <?= number_format($status['memory_usage']['wasted_memory'] / 1024 / 1024, 2) ?> MB
                (<?= number_format($status['memory_usage']['current_wasted_percentage'], 2) ?>%)
            </td>
        </tr>
    </table>
</body>
</html>
```

### JIT 編譯器（PHP 8.0+）

#### JIT 概述

JIT（Just-In-Time）編譯器是 PHP 8.0 引入的重大特性，將熱點代碼（頻繁執行的代碼）從 opcode 編譯為機器碼，直接由 CPU 執行。

**執行流程（啟用 JIT）**：
```
PHP 源代碼
    ↓
編譯為 opcode（OPcache）
    ↓
分析熱點代碼
    ↓
JIT 編譯為機器碼
    ↓
CPU 直接執行機器碼
```

**性能提升**：
- **CPU 密集型**：2-3 倍性能提升
- **Web 應用**：5%-15% 性能提升（大部分時間在 I/O）
- **演算法計算**：顯著提升（如數學計算、圖像處理）

#### JIT 配置

**php.ini 配置**：
```ini
; 啟用 JIT
opcache.enable=1
opcache.jit_buffer_size=100M  ; JIT 緩衝區大小
opcache.jit=tracing  ; JIT 模式

; 詳細的 JIT 配置（4 位數字）
opcache.jit=1255
; 1: CPU 特定優化級別
; 2: IR 優化級別
; 5: JIT 觸發器
; 5: JIT 優化級別
```

**JIT 模式**：
- **disable**：禁用 JIT
- **off**：不生成 JIT 代碼，但啟用基礎設施
- **tracing**（推薦）：追蹤模式，最佳性能
- **function**：函數模式，快速編譯
- **1255**：組合配置（推薦用於生產環境）

**數字配置詳解**：
```
opcache.jit = CRTO
C: CPU 特定優化（0-1）
R: 寄存器分配（0-2）
T: JIT 觸發器（0-5）
O: 優化級別（0-5）

推薦配置：
opcache.jit=1255  # 生產環境
opcache.jit=1205  # 開發環境
```

#### JIT 觸發器（T）

- **0**：禁用 JIT
- **1**：最小 JIT（基本編譯）
- **2**：選擇性 JIT
- **3**：完整 JIT（編譯所有代碼）
- **4**：基於調用次數觸發
- **5**：基於追蹤觸發（推薦）

#### JIT 監控

**檢查 JIT 狀態**：
```php
<?php
$info = opcache_get_status();

print_r([
    'jit_enabled' => $info['jit']['enabled'] ?? false,
    'jit_on' => $info['jit']['on'] ?? false,
    'buffer_size' => $info['jit']['buffer_size'] ?? 0,
    'buffer_free' => $info['jit']['buffer_free'] ?? 0
]);
```

**性能測試**：
```php
<?php
// Mandelbrot 集合計算（CPU 密集）
function mandelbrot($width, $height) {
    $result = [];
    for ($y = 0; $y < $height; $y++) {
        for ($x = 0; $x < $width; $x++) {
            $cx = $x / $width * 3.5 - 2.5;
            $cy = $y / $height * 2.0 - 1.0;
            $zx = 0.0;
            $zy = 0.0;
            $i = 0;
            while ($zx * $zx + $zy * $zy < 4.0 && $i < 255) {
                $tmp = $zx * $zx - $zy * $zy + $cx;
                $zy = 2.0 * $zx * $zy + $cy;
                $zx = $tmp;
                $i++;
            }
            $result[] = $i;
        }
    }
    return $result;
}

$start = microtime(true);
mandelbrot(800, 600);
$end = microtime(true);

echo "Time: " . ($end - $start) . "s\n";
// 無 JIT: ~2.5s
// 有 JIT: ~0.8s
```

### OPcache 預載入（PHP 7.4+）

#### Preloading 概念

預載入允許在 PHP 啟動時將特定文件載入到共享記憶體中，所有工作進程共享。

**配置**：
```ini
; php.ini
opcache.preload=/var/www/preload.php
opcache.preload_user=www-data
```

**preload.php 示例**：
```php
<?php
// Laravel 預載入
opcache_compile_file(__DIR__ . '/vendor/autoload.php');

$loader = require __DIR__ . '/vendor/autoload.php';

// 預載入核心類
$classes = [
    \Illuminate\Support\Collection::class,
    \Illuminate\Database\Eloquent\Model::class,
    \Illuminate\Http\Request::class,
    // ... 更多核心類
];

foreach ($classes as $class) {
    if (class_exists($class)) {
        opcache_compile_file((new ReflectionClass($class))->getFileName());
    }
}
```

**性能提升**：
- 減少首次請求的類載入時間
- 降低記憶體占用（類在進程間共享）
- Laravel 可提升 5%-10% 性能

### 最佳實踐

#### 生產環境配置

```ini
; OPcache
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=32
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0  ; 不檢查文件變更
opcache.save_comments=1
opcache.fast_shutdown=1

; JIT（PHP 8.0+）
opcache.jit_buffer_size=100M
opcache.jit=1255

; Preloading（PHP 7.4+）
opcache.preload=/var/www/preload.php
opcache.preload_user=www-data
```

#### 部署流程

```bash
#!/bin/bash
# 部署腳本

# 1. 拉取最新代碼
git pull origin main

# 2. 安裝依賴
composer install --no-dev --optimize-autoloader

# 3. 清除 OPcache
php artisan opcache:clear
# 或
systemctl reload php-fpm

# 4. 重新預載入
systemctl restart php-fpm
```

#### 監控指標

**關鍵指標**：
- **命中率**：應 >95%，低於 90% 需要調查
- **記憶體使用**：wasted_memory 應 <10%
- **快取文件數**：接近 max_accelerated_files 時需要增加
- **JIT 緩衝區**：buffer_free 應 >20%

### 問題排查

**常見問題**：

1. **命中率低**：
   - 檢查 `validate_timestamps` 設置
   - 增加 `memory_consumption`
   - 檢查是否有大量動態代碼

2. **記憶體不足**：
   - 增加 `opcache.memory_consumption`
   - 減少 `opcache.max_accelerated_files`
   - 清理不需要的文件

3. **JIT 無效**：
   - 確認 PHP 8.0+
   - 檢查 `opcache.jit_buffer_size`
   - Web 應用 JIT 提升有限（正常）

## 總結

OPcache 和 JIT 是 PHP 性能優化的兩大利器。OPcache 通過快取 opcode 避免重複編譯，提供 30%-50% 的性能提升，是所有 PHP 應用都應該啟用的。JIT 編譯器進一步將熱點代碼編譯為機器碼，對 CPU 密集型任務提供顯著性能提升。合理配置這兩項技術，配合預載入和持續監控，可以讓 PHP 應用達到最佳性能。在生產環境中，應該禁用 `validate_timestamps` 以獲得最佳性能，並建立完善的部署流程來管理快取更新。
