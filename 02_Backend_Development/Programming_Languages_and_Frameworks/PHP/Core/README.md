# PHP 核心特性

本節涵蓋 PHP 語言的核心特性、內部機制和現代 PHP 的重要概念。這些主題是資深 PHP 開發者面試中的必考內容。

## 題目列表

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [相等性與類型轉換](./equality_and_type_juggling.md) | 6 | 4 | `Type System`, `Comparison` |
| [include/require 差異](./include_vs_require.md) | 4 | 3 | `File Inclusion`, `Basics` |
| [Trait vs Interface vs Abstract](./trait_vs_interface_vs_abstract_class.md) | 7 | 4 | `OOP`, `Design` |
| [垃圾回收機制](./garbage_collection_in_php.md) | 8 | 4 | `Memory Management`, `Performance` |
| [依賴注入與 IoC](./di_container_and_ioc.md) | 8 | 5 | `Design Patterns`, `Architecture` |
| [常見安全漏洞](./common_security_vulnerabilities.md) | 9 | 5 | `Security`, `Best Practices` |
| [PHP 8+ 新特性](./php8_new_features.md) | 7 | 5 | `Modern PHP`, `Language Features` |
| [命名空間與自動載入](./namespaces_and_autoloading.md) | 5 | 5 | `Organization`, `PSR-4` |
| [錯誤與異常處理](./error_and_exception_handling.md) | 6 | 5 | `Error Handling`, `Debugging` |
| [魔術方法詳解](./magic_methods.md) | 7 | 4 | `OOP`, `Advanced` |
| [閉包與匿名函數](./closures_and_anonymous_functions.md) | 6 | 4 | `Functional Programming`, `Closures` |
| [生成器與迭代器](./generators_and_iterators.md) | 7 | 4 | `Memory Optimization`, `Iteration` |
| [反射機制](./reflection_api.md) | 8 | 4 | `Metaprogramming`, `Advanced` |
| [類型系統演進](./type_system_evolution.md) | 7 | 5 | `Type Hints`, `Strict Types` |
| [OPcache 與 JIT](./opcache_and_jit.md) | 8 | 4 | `Performance`, `Optimization` |

## 核心知識點

### 語言特性
- **類型系統**：標量類型提示、返回類型聲明、嚴格模式
- **面向對象**：類、接口、Trait、抽象類、繼承
- **函數式編程**：閉包、箭頭函數、高階函數
- **現代特性**：Attributes、Enums、Match 表達式、Nullsafe 運算符

### 內部機制
- **記憶體管理**：引用計數、循環垃圾回收
- **性能優化**：OPcache、JIT 編譯器、預載入
- **魔術方法**：`__get`、`__set`、`__call`、`__invoke`
- **反射與元編程**：ReflectionClass、動態調用

### 安全性
- **輸入驗證**：過濾、清理、驗證
- **SQL 注入**：預處理語句、參數化查詢
- **XSS 防護**：輸出轉義、Content Security Policy
- **CSRF 防護**：Token 驗證、SameSite Cookie

## 學習建議

從基礎的語言特性開始，逐步深入到內部機制和性能優化。重點關注 PHP 8+ 的新特性，這些是現代 PHP 開發的核心。
