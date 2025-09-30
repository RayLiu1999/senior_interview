# PHP

PHP 是最廣泛使用的伺服器端程式語言之一，驅動著全球超過 70% 的網站。作為資深後端工程師，您需要深入理解 PHP 的語言特性、生態系統工具、安全最佳實踐以及與 Web 伺服器的整合方式。本章節涵蓋了面試中最常被考察的 PHP 核心主題。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [== vs === 的區別與 PHP 的類型戲法 (Type Juggling)](./Core/equality_and_type_juggling.md) | 4 | 4 | `PHP`, `Type System`, `Comparison` |
| 2 | [`include` vs `require` 的差異](./Core/include_vs_require.md) | 3 | 3 | `PHP`, `File Inclusion` |
| 3 | [Trait vs. Interface vs. Abstract Class：如何選擇？](./Core/trait_vs_interface_vs_abstract_class.md) | 6 | 4 | `PHP`, `OOP`, `Design Pattern` |
| 4 | [PHP 的垃圾回收 (Garbage Collection) 機制是如何運作的？](./Core/garbage_collection_in_php.md) | 7 | 3 | `PHP`, `Memory Management`, `GC` |
| 5 | [什麼是依賴注入容器 (DI Container)？它如何幫助我們實現控制反轉 (IoC)？](./Core/di_container_and_ioc.md) | 7 | 5 | `PHP`, `DI`, `IoC`, `Design Pattern` |
| 6 | [PHP Web 開發中常見的安全漏洞 (SQLi, XSS, CSRF) 及防範措施](./Core/common_security_vulnerabilities.md) | 6 | 5 | `PHP`, `Security`, `SQL Injection`, `XSS`, `CSRF` |
| 7 | [什麼是 Composer？它在 PHP 生態系統中的作用是什麼？](./Tooling/what_is_composer_and_its_purpose.md) | 4 | 5 | `PHP`, `Composer`, `Dependency Management` |
| 8 | [什麼是 PSR？請解釋幾個重要的 PSR 標準 (PSR-4, PSR-7, PSR-12)](./Tooling/what_is_psr_and_common_standards.md) | 5 | 4 | `PHP`, `PSR`, `Standards` |
| 9 | [什麼是 PHP-FPM？它在 Web 伺服器 (如 Nginx) 架構中扮演什麼角色？](./Web_Servers/php_fpm_and_its_role.md) | 6 | 5 | `PHP`, `PHP-FPM`, `Nginx`, `Web Server` |

---

## 子主題

### 框架 (Frameworks)
- [Laravel](./Frameworks/Laravel/README.md)
- [Symfony](./Frameworks/Symfony/README.md)

---

## 學習建議

1.  **掌握語言特性**: 類型系統、OOP 特性（Trait、Interface、Abstract Class）是 PHP 開發的基礎。
2.  **理解生態工具**: Composer 和 PSR 標準是現代 PHP 開發的必備知識。
3.  **重視安全性**: SQL Injection、XSS、CSRF 等安全漏洞的防範是後端工程師的核心職責。
4.  **熟悉部署架構**: PHP-FPM 與 Nginx 的整合是生產環境的標準配置。
5.  **實踐框架開發**: Laravel 和 Symfony 是業界主流框架，深入掌握其中一個能大幅提升開發效率。
