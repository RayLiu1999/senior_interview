# PHP 與 Web 伺服器

本節涵蓋 PHP 與 Web 伺服器的整合、進程管理和性能優化。

## 題目列表

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [PHP-FPM 架構與角色](./php_fpm_and_its_role.md) | 9 | 5 | `PHP-FPM`, `Process Management` |
| [Nginx 與 PHP-FPM 整合](./nginx_php_fpm_integration.md) | 7 | 5 | `Nginx`, `FastCGI` |
| [Apache mod_php vs PHP-FPM](./apache_modphp_vs_phpfpm.md) | 6 | 4 | `Apache`, `Comparison` |
| [PHP-FPM 進程管理模式](./phpfpm_process_management_modes.md) | 8 | 5 | `Process Pool`, `Configuration` |
| [PHP-FPM 性能調優](./phpfpm_performance_tuning.md) | 8 | 5 | `Performance`, `Optimization` |
| [FastCGI 協議詳解](./fastcgi_protocol.md) | 7 | 3 | `FastCGI`, `Protocol` |

## 核心概念

### PHP-FPM
- **進程管理器**：管理多個 PHP 工作進程
- **進程池**：預先建立進程，提高響應速度
- **管理模式**：static、dynamic、ondemand
- **慢日誌**：追蹤執行緩慢的請求

### Web 伺服器整合
- **Nginx + PHP-FPM**：最常見的高性能組合
- **Apache + mod_php**：傳統方案，配置簡單
- **Apache + PHP-FPM**：結合兩者優點
- **Caddy + PHP-FPM**：自動 HTTPS，配置簡潔

### 性能優化
- **進程數量**：根據 CPU 核心和記憶體調整
- **連接池**：復用資料庫連接
- **OPcache**：預編譯 PHP 腳本
- **靜態資源**：由 Nginx 直接處理

## 配置示例

### PHP-FPM 進程管理模式

#### Static（靜態）
```ini
pm = static
pm.max_children = 50
```
適用於記憶體充足且流量穩定的場景。

#### Dynamic（動態）
```ini
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
```
最常用的模式，根據負載動態調整進程數。

#### Ondemand（按需）
```ini
pm = ondemand
pm.max_children = 50
pm.process_idle_timeout = 10s
```
適用於流量較低的場景，節省資源。

## 監控與除錯

### 狀態頁面
- **PHP-FPM 狀態**：監控進程池狀態
- **慢日誌**：記錄執行超時的請求
- **錯誤日誌**：追蹤 PHP 錯誤和警告

### 性能指標
- **請求處理時間**：平均響應時間
- **活躍進程數**：當前處理請求的進程
- **閒置進程數**：等待處理請求的進程
- **記憶體使用**：每個進程的記憶體占用
