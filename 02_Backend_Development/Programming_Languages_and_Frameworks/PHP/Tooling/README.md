# PHP 工具鏈

本節涵蓋 PHP 開發中常用的工具、依賴管理、編碼標準和開發環境配置。

## 題目列表

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Composer 與依賴管理](./what_is_composer_and_its_purpose.md) | 7 | 5 | `Composer`, `Dependency Management` |
| [PSR 標準詳解](./what_is_psr_and_common_standards.md) | 8 | 4 | `PSR`, `Coding Standards` |
| [PHP 版本管理](./php_version_management.md) | 5 | 4 | `Environment`, `Version Control` |
| [靜態分析工具](./static_analysis_tools.md) | 7 | 4 | `PHPStan`, `Psalm`, `Quality` |
| [程式碼格式化與規範](./code_formatting_and_standards.md) | 5 | 4 | `PHP-CS-Fixer`, `Code Style` |
| [除錯工具與技巧](./debugging_tools_and_techniques.md) | 6 | 5 | `Xdebug`, `Debugging` |
| [效能分析工具](./performance_profiling_tools.md) | 7 | 4 | `Blackfire`, `XHProf`, `Profiling` |

## 核心工具

### 依賴管理
- **Composer**：PHP 的依賴管理工具
- **Packagist**：Composer 的官方套件倉庫
- **自動載入**：PSR-4 自動載入標準

### 程式碼品質
- **PHPStan**：靜態分析工具，提前發現錯誤
- **Psalm**：另一個強大的靜態分析工具
- **PHP-CS-Fixer**：自動修正程式碼風格
- **PHPCS**：程式碼風格檢查

### 除錯與分析
- **Xdebug**：PHP 除錯器，支援斷點和步進
- **Blackfire**：應用程式性能分析
- **XHProf**：輕量級性能分析工具

### 測試工具
- **PHPUnit**：單元測試框架
- **Mockery**：Mock 物件框架
- **Pest**：現代測試框架，語法簡潔

## 標準規範

### 重要的 PSR 標準
- **PSR-1/PSR-12**：基本編碼標準和擴展編碼風格
- **PSR-3**：日誌接口
- **PSR-4**：自動載入標準
- **PSR-6/PSR-16**：快取接口
- **PSR-7**：HTTP 訊息接口
- **PSR-11**：容器接口
- **PSR-15**：HTTP 伺服器請求處理器

## 開發環境

### 本地開發
- **Laravel Valet**：Mac 上的輕量開發環境
- **Laravel Homestead**：預配置的 Vagrant Box
- **XAMPP/MAMP**：整合開發環境
- **Docker**：容器化開發環境

### CI/CD
- **GitHub Actions**：自動化測試和部署
- **GitLab CI**：內建的 CI/CD 工具
- **Jenkins**：企業級持續整合
