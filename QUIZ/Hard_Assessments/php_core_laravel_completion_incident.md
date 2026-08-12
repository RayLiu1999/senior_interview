# PHP Core／Laravel Completion Incident：從型別與自動載入到請求、資料與資源邊界

- **Assessment ID**: `assessment.php.core-laravel.completion-incident.v1`
- **主要 Concept ID**: `concept.php.laravel.request-lifecycle`
- **次要 Concept IDs**:
  - `concept.php.tooling.psr-standards`
  - `concept.php.core.closures`
  - `concept.php.core.web-security-vulnerabilities`
  - `concept.php.core.psr4-autoloading`
  - `concept.php.core.trait-interface-abstract-class`
  - `concept.php.core.type-system-strict-mode`
  - `concept.php.core.php8-features`
  - `concept.php.core.generators-iterators`
  - `concept.php.core.di-container-ioc`
  - `concept.php.laravel.facades`
  - `concept.php.laravel.eloquent-n-plus-one`
  - `concept.php.laravel.middleware`
- **對應文章**:
  - [什麼是 PSR？請列舉並解釋幾個重要的 PSR 標準](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Tooling/what_is_psr_and_common_standards.md) — `concept.php.tooling.psr-standards`
  - [PHP 閉包與匿名函數](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/closures_and_anonymous_functions.md) — `concept.php.core.closures`
  - [PHP Web 開發中常見的安全漏洞](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/common_security_vulnerabilities.md) — `concept.php.core.web-security-vulnerabilities`
  - [PHP 命名空間與自動載入機制](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/namespaces_and_autoloading.md) — `concept.php.core.psr4-autoloading`
  - [Trait、Interface 與 Abstract Class 的區別](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/trait_vs_interface_vs_abstract_class.md) — `concept.php.core.trait-interface-abstract-class`
  - [PHP 類型系統演進](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/type_system_evolution.md) — `concept.php.core.type-system-strict-mode`
  - [PHP 8 新特性](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/php8_new_features.md) — `concept.php.core.php8-features`
  - [PHP 生成器與迭代器](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/generators_and_iterators.md) — `concept.php.core.generators-iterators`
  - [依賴注入容器與控制反轉](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/di_container_and_ioc.md) — `concept.php.core.di-container-ioc`
  - [Laravel 門面深度解析](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Frameworks/Laravel/facades_explained.md) — `concept.php.laravel.facades`
  - [Laravel 請求生命週期](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Frameworks/Laravel/request_lifecycle.md) — `concept.php.laravel.request-lifecycle`
  - [Eloquent ORM 深度探討](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Frameworks/Laravel/eloquent_orm_deep_dive.md) — `concept.php.laravel.eloquent-n-plus-one`
  - [Laravel 中介層詳解](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Frameworks/Laravel/middleware_in_depth.md) — `concept.php.laravel.middleware`
- **題型**: `生產事故診斷`, `PHP 語言邊界`, `Laravel 請求與資料邊界`, `安全與效能取捨`, `可回滾交付`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 45 分鐘
- **標籤**: `PHP`, `PSR`, `Composer`, `Autoload`, `Type System`, `Security`, `Closure`, `Generator`, `Dependency Injection`, `Laravel`, `Middleware`, `Eloquent`, `Production Incident`
- **Learning Objective IDs**:
  - `concept.php.tooling.psr-standards/LO-1`
  - `concept.php.tooling.psr-standards/LO-2`
  - `concept.php.tooling.psr-standards/LO-3`
  - `concept.php.core.closures/LO-1`
  - `concept.php.core.closures/LO-2`
  - `concept.php.core.closures/LO-3`
  - `concept.php.core.web-security-vulnerabilities/LO-1`
  - `concept.php.core.web-security-vulnerabilities/LO-2`
  - `concept.php.core.web-security-vulnerabilities/LO-3`
  - `concept.php.core.psr4-autoloading/LO-1`
  - `concept.php.core.psr4-autoloading/LO-2`
  - `concept.php.core.psr4-autoloading/LO-3`
  - `concept.php.core.trait-interface-abstract-class/LO-1`
  - `concept.php.core.trait-interface-abstract-class/LO-2`
  - `concept.php.core.trait-interface-abstract-class/LO-3`
  - `concept.php.core.type-system-strict-mode/LO-1`
  - `concept.php.core.type-system-strict-mode/LO-2`
  - `concept.php.core.type-system-strict-mode/LO-3`
  - `concept.php.core.php8-features/LO-1`
  - `concept.php.core.php8-features/LO-2`
  - `concept.php.core.php8-features/LO-3`
  - `concept.php.core.generators-iterators/LO-1`
  - `concept.php.core.generators-iterators/LO-2`
  - `concept.php.core.generators-iterators/LO-3`
  - `concept.php.core.di-container-ioc/LO-1`
  - `concept.php.core.di-container-ioc/LO-2`
  - `concept.php.core.di-container-ioc/LO-3`
  - `concept.php.laravel.facades/LO-1`
  - `concept.php.laravel.facades/LO-2`
  - `concept.php.laravel.facades/LO-3`
  - `concept.php.laravel.request-lifecycle/LO-1`
  - `concept.php.laravel.request-lifecycle/LO-2`
  - `concept.php.laravel.request-lifecycle/LO-3`
  - `concept.php.laravel.eloquent-n-plus-one/LO-1`
  - `concept.php.laravel.eloquent-n-plus-one/LO-2`
  - `concept.php.laravel.eloquent-n-plus-one/LO-3`
  - `concept.php.laravel.middleware/LO-1`
  - `concept.php.laravel.middleware/LO-2`
  - `concept.php.laravel.middleware/LO-3`

## 測驗目標

- 能從 PHP 版本、Composer artifact、PSR-4 映射、命名空間、型別契約與 PHP 8 特性建立可重現的部署與 runtime 因果鏈。
- 能在 closures、traits、interfaces、abstract classes、generators 與 iterators 之間做出符合 ownership、可測試性、效能和資源生命週期的選擇。
- 能辨識 SQL Injection、XSS、CSRF、鬆散型別與跨租戶資料流造成的安全邊界破口，並以輸入、輸出、授權和 negative test 證明修復。
- 能追蹤 Laravel application、service provider、container、facade、middleware、controller、response 與 termination 的順序，定位 scope、短路和隱藏依賴問題。
- 能修正 Eloquent N+1、無界結果集和 generator／cursor 資源占用，並以可觀測指標、資料正確性與可回滾 rollout 驗證整體方案。

## 問題情境與限制條件

某多租戶訂單平台以 PHP 8.2 與 Laravel 提供管理後台及公開 API，FPM request、queue worker 與排程器共用同一套 domain package。團隊在一次 PHP 版本、Composer 依賴與訂單匯出功能的聯合發布後，觀察到以下事故：

- 只有部分 instance 回報 `Class not found` 或 container resolving failure。失敗 instance 的 release fingerprint、`composer.lock` checksum、`vendor` artifact 和 PHP extension 清單不完全一致；某個新類別的 namespace、檔案名稱大小寫與 PSR-4 mapping 也尚未被獨立驗證。有人建議直接在 production 執行 Composer 依賴更新。
- `/admin/orders/export` 的 P99 從 350 ms 上升到 5 秒，資料庫 query count 從每頁約 4 次升到數百次，response bytes 與 FPM worker 記憶體同步增加。匯出流程混用 Eloquent lazy loading、generator、cursor 和一個捕獲租戶篩選條件的 closure；使用者中途離開頁面時，部分資料庫 cursor 的釋放時機沒有證據。
- 一次 PHP 8 特性遷移後，部分狀態值由外部 query string 傳入。某處以鬆散比較判斷狀態，另一處期待 union／nullable 型別但未在 boundary 正規化；舊 worker 和新 worker 短暫並存時，部分 payload 觸發 `TypeError`。團隊無法區分這些是預期的 validation failure、程式錯誤還是可重試的下游失敗。
- 新增的授權 trait 與既有 trait 都提供相同方法，某個 class 以不清楚的優先順序組合它們。管理端 filter 直接把輸入拼進查詢；富文字備註在一個 response path 沒有依輸出情境編碼；使用 session cookie 的管理操作又有一條 route 被排除在 CSRF middleware 外。跨租戶的 order ID 仍可能被直接查到，但目前沒有完整 negative test。
- 某個 domain service 綁成 singleton，持有 request filter、目前租戶和可變的 Eloquent collection。FPM 中每個 request 通常有自己的 application container，但 queue worker 會重用 container；因此同一份設計在兩種 runtime 的污染、記憶體與資料隔離風險不同。Facade 讓 controller 看起來簡潔，卻掩蓋了實際的資料庫、cache 和授權依賴。
- 一個 global middleware 在 tenant context 建立前記錄 request，另一個 route middleware 在 authentication 之前讀取 tenant。某些 middleware 在 `next` 前後都修改 response，某些拒絕路徑短路後仍執行不應執行的副作用。slow log 顯示 response 已開始後仍有 termination 工作，但目前沒有完整 request lifecycle trace。

限制條件如下：

- 不能以 production 即時 `composer update`、清空所有 cache、關閉 CSRF／授權、無限提高 timeout 或單純增加 worker 作為唯一修復；不能遺失訂單、跨租戶洩漏資料或重複執行不可逆的外部副作用。
- 必須保留既有 API 錯誤契約與向後相容，允許新舊 artifact 在短時間內並存，但不能假設所有 worker 同時升級。資料庫 schema、queue payload 和外部 provider 都可能在 rollback 時仍處於舊版本狀態。
- 所有結論都必須區分已知證據、待驗證假設和目前資料不能直接推論的部分；每個 rollout 階段至少保留一個可逆的主要變因和明確停止條件。

你是負責事故收斂、資安審查與發布決策的 senior engineer。請先建立時間線與責任邊界，再提出分階段修復。

## 作答要求

1. **建立 PSR／artifact 因果鏈**：說明 PHP-FIG、PSR 的建議性質與團隊規範的差異，並比較 PSR-4 的 class-to-path mapping、PSR-7 的不可變 HTTP message 與 PSR-12 的格式規範。列出 Composer lock、vendor artifact、autoload 生成物、PHP platform requirement、container cache 和 instance fingerprint 的競爭假設與可觀測差異。
2. **診斷 namespace 與 autoload**：以 namespace prefix、子 namespace、class 名稱、目錄、檔名大小寫和 Composer 生成物重建一個載入失敗案例；比較 PSR-4、classmap 與 files autoload 的適用邊界，提出 CI、Linux case-sensitive filesystem、autoload dump 和 production promotion 的驗證順序。
3. **處理 PHP 型別演進與 PHP 8 特性**：針對 scalar、nullable、union、intersection、never、DNF、enum、attributes、readonly、match、nullsafe、constructor promotion 和 JIT，說明哪些能改善契約、哪些會造成新舊 worker／payload 不相容。解釋 `strict_types` 的檔案與呼叫邊界，並提出輸入正規化、版本相容與 rollback 策略。
4. **審查 trait／interface／abstract class**：分析授權 trait 方法衝突、`insteadof`／`as` 優先規則、interface 契約、abstract template 和單一繼承限制；提出何時應改為明確 interface 加上 DI，並以測試證明不會繞過租戶 policy。
5. **審查 closures 與匿名函數**：比較匿名函數、Closure 物件、箭頭函數、`use` 以值或引用捕獲的差異，追蹤匯出迴圈中租戶、頁碼與可變 filter 的 capture bug。說明 bind／call、延遲執行、回調和 closure retention 對可測試性、序列化、記憶體和權限邊界的影響。
6. **審查 generators／iterators 與資料流**：追蹤 `yield` 的 suspend／resume、`send`／`throw` 和 Generator state，並比較 Generator、Iterator、IteratorAggregate、cursor、chunk 和 pagination。提出使用者取消、例外、部分完成與資源清理的 ownership，避免將無界資料載入記憶體或長時間占用資料庫連線。
7. **完成 PHP Web security review**：分別分析 SQL Injection、XSS、CSRF、鬆散比較和跨租戶 object access；說明 prepared statement、依 context 的 output encoding、CSRF token／SameSite／session 設定、嚴格狀態白名單、authorization policy 與 negative test 如何形成防線。請指出哪些 log／exception detail 必須遮罩。
8. **設計 DI container 邊界**：比較 constructor、setter、property injection 與直接建立依賴；追蹤 binding、interface alias、reflection resolution 和 lifecycle 的順序。判斷哪些 service 可以 shared／singleton，哪些 request、user、tenant、transaction、Eloquent collection 或可變 cache 必須是短生命週期，並提出 FPM 與 queue worker 的不同測試。
9. **拆解 Facade 的隱藏依賴**：說明 Facade 如何由靜態入口、accessor 和 container 解析實例，並與 constructor injection、helper 比較可讀性、可測試性、mock 邊界和 scope。請找出一個 controller 依賴範圍蠕變的案例，提出保留 Facade 或改用明確介面的判斷準則。
10. **重建 Laravel request lifecycle**：從 `public/index.php`、Composer autoload、application、bootstrap、service providers、HTTP kernel、routing、middleware、controller、response send 到 terminate 建立順序圖。說明哪些錯誤發生在 bootstrap、routing、middleware、domain、response 或 termination，以及如何避免 response 已開始後仍寫入錯誤內容。
11. **審查 middleware onion 與安全順序**：區分 global、group、route middleware 的註冊與執行順序，分析 `next` 前後的 request／response 行為、短路、認證前後的 tenant context、CSRF、授權、logging、rate limit 和 cleanup。提出可驗證的 trace、integration test 和 rollback／feature flag 邊界。
12. **修正 Eloquent N+1 與查詢邊界**：從 query count、lazy loading、關聯範圍和 serialization 找出 N+1，並比較 eager loading、nested／constrained eager loading、lazy eager loading、欄位裁剪、pagination、chunk、cursor、cache 和資料庫索引的 trade-off。必須同時保留租戶篩選、資料一致性和 response 契約。
13. **提出整體 rollout**：把 artifact／autoload、型別與安全、container／lifecycle、middleware／authorization、Eloquent／generator 效能分成至少三階段；每階段列出成功指標、警戒線、故障注入、資料正確性檢查與 rollback 條件，並說明如何在新舊 worker、queue payload 和 schema 短暫不一致時安全交付。

## 期待證據

- 每個 instance 的 PHP version、extension、Composer lock checksum、vendor manifest、autoload artifact、release fingerprint、container cache version、OPcache 狀態與 build provenance。
- 乾淨環境執行的 autoload dump／class resolution、PSR-4 path case check、classmap 差異、Composer platform check、dependency lock review 和不可變 artifact promotion 結果。
- PSR-7 message 是否以 immutable replacement 傳遞、PSR-12 formatter／static check 結果，以及哪些規範是團隊 quality gate 而非 runtime enforcement。
- 新舊 worker 對 PHP 8 enum、readonly、attributes、union／nullable／intersection／DNF／never 和序列化 payload 的相容性測試；包含 strict mode 呼叫端的 TypeError boundary。
- trait method conflict、interface contract、abstract template、policy implementation 的 service graph 和 mutation／negative test；至少包含跨租戶 order ID、匿名、過期 token 和權限降級案例。
- closure capture 的值／引用差異、迴圈變數、bind scope、closure 是否被 queue／cache／singleton 保留，以及取消或例外後的 retained object／resource evidence。
- Generator／Iterator 的 `current`、suspend／resume、send／throw、consumer abort、cursor close、transaction boundary、peak memory 和每批 query／response bytes。
- SQL query parameterization、query log／AST、output encoding context、CSRF token／cookie flags／Origin checks、session fixation／rotation 與跨租戶 authorization decision trace。
- container binding／alias／reflection resolution／shared state 的 service graph；FPM 每 request 隔離與 queue worker 長生命週期的 scope reset、job isolation 和 worker age。
- Facade call trace、accessor、resolved binding、mock／fake coverage，以及 controller 實際使用的 database、cache、authorization、event 和 external provider 依賴。
- 從 bootstrap 到 terminate 的 request trace、middleware stack、priority、short-circuit response、response-started 訊號、exception boundary 和 termination duration。
- middleware 在 `next` 前後的 request／response snapshot、tenant context 建立順序、CSRF／auth／policy／rate-limit decision，以及拒絕路徑不產生副作用的 integration test。
- Eloquent query count、query duration、rows returned、lazy-loading detection、eager-load scope、selected columns、pagination／cursor 邊界、response bytes、P50／P95／P99 和資料 parity。
- MySQL connection／lock wait、Redis latency、FPM worker time、queue age、worker RSS、generator cleanup、cache cardinality 和租戶維度的 saturation 指標。
- canary traffic、feature flag、old／new payload contract、migration compatibility、duplicate delivery、client cancellation、slow database、worker crash、cache miss storm 和 rollback duration 的演練結果。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議 production `composer update`、關閉安全檢查、增加 timeout 或重啟 worker；沒有證據、資料正確性、租戶隔離與 rollback 條件。 |
| 1 | 能列出 PHP、Composer、Laravel、Facade、Middleware 或 Eloquent 名詞，但不能建立 autoload／型別／scope／資料查詢／請求生命週期的因果鏈。 |
| 2 | 能指出部分 class loading、型別、SQLi／XSS／CSRF、container、middleware 或 N+1 問題，提出大致可行修復，但遺漏至少兩個核心邊界或沒有量化驗證。 |
| 3 | 能重建可驗證的 artifact 與 request 因果鏈，正確處理 PHP 語言／安全邊界，完成 container／Facade／middleware／Eloquent 的 scope 與效能分析，並提出具指標和 rollback 的分階段方案。 |
| 4 | 除上述內容外，能處理新舊 runtime 並存、case-sensitive autoload、closure／generator cleanup、trait conflict、隱藏 Facade 依賴、response／terminate 邊界、跨租戶 negative test、N+1 與資源 backpressure 的連鎖取捨。 |

### 通過標準

總分達 **3/4 分**才通過；PHP artifact／型別與安全、語言抽象／資源生命週期、Laravel container／request／middleware、Eloquent／交付驗證四個核心面向均不得低於 2 分，且必須提出至少一個可執行的 rollback 條件、一組可量測成功指標，以及一項能證明資料與租戶隔離未被破壞的測試。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

### 1. 先分離 artifact drift、語言契約與 runtime 請求問題

已知的是部分 instance 的 fingerprint、lock checksum 和 vendor 不一致，且匯出 endpoint 的 query count、P99 與記憶體同時上升。這支持至少三條可能同時存在的因果鏈：artifact／autoload drift 造成 class loading failure；Eloquent lazy loading、generator／cursor 或 serialization 拉長單 request 持有時間；middleware、security 或 container scope 錯誤造成錯誤回應、跨租戶風險或額外工作。不能只由 `Class not found` 推論是 namespace 錯，也不能只由資料庫 CPU 未滿推論沒有 N+1。

第一步應收集每個 instance 的 PHP／extension、lock checksum、vendor manifest、Composer generated autoload、release digest、container cache、OPcache／PHP-FPM fingerprint，再在乾淨環境重建同一 artifact。如果同一 artifact 在乾淨環境穩定、只有部分 instance 失敗，優先檢查 promotion、mount、case-sensitive filesystem、cache key 和 instance drift；如果所有 instance 都失敗，才提高 lock、platform requirement、程式 mapping 或 API incompatibility 的可能性。production 應由 CI 以 lockfile 產生不可變 artifact，執行 `install`、platform check、autoload validation、測試和安全掃描；`update` 只應在升級流程產生新的 lock，不應在 instance 上即時解析。

### 2. PSR、namespace 與型別契約

PSR 是 PHP-FIG 為互通性提出的標準建議；團隊可以將其中一部分轉成 formatter、static analysis、review 和 CI gate，但 PSR-12 的格式規範不會自動修復 runtime bug，PSR-7 的 immutable message 也要求呼叫者接住替換後的 message。PSR-4 需要把 namespace prefix、相對 namespace、class 名稱與目錄／檔名大小寫一致映射；Linux 上大小寫不一致可能在本機未察覺而在 production 失敗。classmap 適合固定、可掃描的 class 集合，files autoload 適合少量明確的全域載入檔，兩者都不能取代正確的 namespace 設計。

PHP 版本特性要按 compatibility boundary 管理。union、nullable、intersection、never、DNF、enum、readonly、attributes、match、nullsafe 和 constructor promotion 可以使契約更明確，但新型別、序列化表示或 readonly／enum 行為可能讓舊 worker 無法消費新 payload。`strict_types` 是檔案層級的呼叫契約，不能把它當成全域輸入驗證；外部 query、JSON、queue payload 必須先正規化、驗證版本和白名單，再進入 domain service。TypeError、validation failure、下游 timeout 和程式 bug 要分別定義 HTTP、CLI 和 queue 的錯誤／重試語意。

### 3. Trait、interface、abstract class、closure 與 generator

Trait 是水平重用實作，interface 是可替換的行為契約，abstract class 則適合有共享狀態或模板流程的同一類別階層。當兩個 trait 都提供授權方法時，應以明確的 `insteadof`／別名規則或更好的 interface／policy service 解決，而不是依賴隱含 method resolution。跨租戶授權必須在 domain policy 或明確的 service boundary 驗證，不能只由 trait 名稱保證。

Closure 是物件，匿名函數可以延遲執行、作為回調或工廠；箭頭函數會自動以值捕獲外部變數，而一般 closure 的 `use` 可以選擇值或引用。匯出迴圈若以引用捕獲可變 tenant、頁碼或 filter，後續執行可能看到錯誤狀態；若 closure 被 singleton、cache 或 job 保留，還可能延長租戶資料與資源的生命週期。應把必要輸入轉成不可變的 value object，避免把 request／權限上下文隱藏在 closure scope；bind／call 只能在受控測試或明確的 object boundary 使用。

Generator 以 `yield` 暫停並保存執行狀態，`send` 和 `throw` 能與 consumer 雙向溝通，但這不會自動替應用處理 cursor、transaction 或外部資源。大型匯出可用 generator、IteratorAggregate、pagination、chunk 或 cursor 控制記憶體，但必須在正常結束、consumer 中止、例外、timeout 和 client disconnect 時釋放資料庫 cursor／transaction。若需要可重複遍歷或明確 seek，Iterator 或分頁通常比一次性的 Generator 更合適；若需要背壓，應限制批次大小、連線占用和下游速率。

### 4. Security、container 與 Facade

SQL 查詢必須使用參數化與明確欄位白名單；排序欄位、filter operator 和 relation 名稱不能因為使用 query builder 就自動被視為安全。XSS 防護依輸出 context 做 HTML、attribute、JavaScript 或 URL encoding，不能只在輸入時一次 escape；CSRF 則要對使用 cookie 認證的 state-changing web route 保持 token、SameSite、secure／httpOnly cookie 和 session rotation 的一致策略。API token、跨租戶 order ID、狀態白名單和 domain policy 要以 default-deny、negative test、fuzz／boundary test 驗證。log 和 exception response 必須遮罩 token、session、個資、SQL detail 和內部 stack trace。

DI 的核心是把建立依賴的責任交給 composition root 或 container。constructor injection 最能揭露契約；setter／property 適合可選依賴但容易形成不完整物件；直接在 domain class 建立具體依賴則降低替換與測試能力。container 會依 binding、alias、reflection、factory 和 shared lifecycle 遞迴解析，但 shared／singleton 不應持有 request、user、tenant、transaction、Eloquent collection 或可變 cache。FPM 多半每 request 建立 application container，queue worker 卻可能跨 job 重用它；兩者都要測試成功、例外、timeout、取消和 job／tenant 切換後的 state reset。

Facade 透過靜態入口、accessor 和 container 解析底層實例，方便使用也容易隱藏 controller 的 database、cache、authorization、event 和 provider 依賴。若某 controller 只有一個穩定、可測試的框架服務，Facade 仍可作為局部邊界；若它在一個方法內跨越多個責任，應改用明確 interface、application service 和 constructor injection。測試不能只 mock 靜態名稱，還要驗證 resolved binding、scope、失敗語意和跨租戶 policy。

### 5. Laravel request、middleware 與 Eloquent

請求應按 public entry point、Composer autoload、application／bootstrap、service providers、HTTP kernel、routing、middleware onion、controller／domain、response send 和 terminate 建立 trace。bootstrap 或 autoload 失敗不應被誤報為 controller 失敗；validation／authorization 應產生穩定 4xx，未預期例外應產生不洩漏細節的 5xx，termination 的非關鍵工作不能在 response 已開始後破壞主要 response。middleware stack 要明確標示 global、group、route 的註冊與 priority，tenant context 應在任何需要它的 authorization／query 前建立，auth／CSRF／rate limit／policy 的順序要由 integration test 固定。

Middleware 在 `next` 前可做認證、正規化、限流和 context 建立，在 `next` 後可做 response header、metrics 和 cleanup；短路時不應執行只適合成功路徑的副作用。應以 request ID、tenant ID、middleware name、decision、response-started 和 duration 做 trace，對匿名、過期 token、跨租戶 ID、CSRF failure、rate-limit rejection 和 exception path 做 negative test。

N+1 的證據是每頁資料量增加時 query count 近似線性增加，且 trace 顯示 lazy relation query 在 serialization 或 loop 內逐筆發生。先用 eager loading、nested／constrained eager loading、欄位裁剪、索引和正確租戶 scope 修正查詢；再依資料量選 pagination、chunk、cursor 或批次。cache 只能在 key、失效和租戶隔離明確時使用，不能把整個 Eloquent collection 放入長生命週期 singleton。成功指標必須同時包括 query count、rows、bytes、P99、DB wait、memory、資料 parity 和 authorization decision。

### 6. 分階段修復與 rollback

第一階段先凍結 production 即時依賴解析，標記並隔離 drift instance，保留舊 artifact，對 class loading、TypeError、跨租戶拒絕、CSRF、P99、query count、FPM／queue saturation 加上 telemetry；可暫停高成本匯出或以 feature flag 限流。若未授權成功率、class loading failure、資料 parity、P99、queue age 或 error budget 超過警戒線，立即切回完整舊 artifact，而不是只重建 vendor 或清 cache。

第二階段在 canary 導入可重現 Composer artifact、PSR-4 case check、型別／payload compatibility、明確 policy／interface、短生命週期 binding、middleware trace 和 security negative tests；將 notification、匯出與其他外部副作用設計成可重試且冪等，並驗證舊／新 worker 並存。以慢資料庫、client cancellation、duplicate queue delivery、worker crash、CSRF replay 和跨租戶 fuzz 做故障注入，任何資料遺失、重複不可逆副作用或 rollback time 超標都停止擴大。

第三階段才調整 eager loading、欄位和批次大小、cursor／generator backpressure、cache policy、FPM／queue capacity 以及 PHP 8 特性。每次只改一個主要變因，固定 workload 比較 P50／P95／P99、query count、response bytes、peak memory、DB／Redis wait、worker RSS、error rate、security decision 和成本。若效能改善但資料 parity、租戶隔離、記憶體基線或向後相容失敗，應以資料正確性優先回滾。

</details>

## 常見失分點

- 把 PSR 當成所有 runtime 行為的強制規則，或只說遵守 PSR-12 卻沒有指出 CI formatter、autoload 和 HTTP message 的實際邊界。
- 看到 `Class not found` 就在 production 執行 `composer update`，沒有 lock checksum、platform、case-sensitive path、vendor artifact 和 rollback。
- 認為 `strict_types=1` 會自動驗證所有 HTTP／queue 輸入，忽略呼叫端、payload version、normalization 和 TypeError 分類。
- 用 trait 疊加授權邏輯，卻沒有處理 method conflict、優先規則、interface contract 和跨租戶 negative test。
- 以 closure 捕獲 request 或 tenant state，沒有分辨值／引用捕獲，也沒有檢查 closure 被 singleton、cache 或 queue payload 保留的生命週期。
- 說 generator 節省記憶體就結束，沒有處理 cursor、transaction、client cancellation、`throw`、部分完成和資料庫連線釋放。
- 只用 prepared statement 宣稱安全，遺漏 XSS 的輸出 context、CSRF 的 cookie 認證邊界、狀態白名單和 object-level authorization。
- 把 FPM 的 singleton、queue worker 的 singleton 和所有 request 視為同一個生命週期，造成 tenant、collection 或可變 cache 污染。
- 認為 Facade 讓依賴完全可見，沒有追蹤 accessor、container binding、hidden I/O、mock 邊界和責任範圍。
- 只背 Laravel 啟動順序，卻沒有 trace bootstrap、middleware、response-started、terminate 和 exception boundary。
- 把所有 middleware 改成同步或任意調整 priority，沒有驗證短路路徑、auth／tenant／CSRF 順序和拒絕路徑副作用。
- 只把 lazy loading 改成 eager loading，卻沒有控制欄位、分頁、批次、租戶 scope、query count、response bytes 和資料一致性。
- 只看平均 latency 或單次測試通過，沒有測試新舊 worker 並存、payload compatibility、duplicate delivery、rollback 和故障注入。

## 延伸追問

1. 如果所有 instance 的 `composer.lock` checksum 一致，但只有 Linux instance 出現 class loading failure，你會如何區分檔名大小寫、mount、OPcache、autoload artifact corruption 和 container cache？
2. 如果新版本的 enum／readonly payload 必須被舊 queue worker 消費，你會如何設計 payload version、欄位相容、消費者 rollout 和 dead-letter／replay？
3. 如果 trait conflict 的修復改成明確 policy service，如何證明它沒有讓匿名、過期 token 或跨租戶 order ID 取得額外權限？
4. 如果匯出使用 generator 且 client 在第 3 批斷線，你會如何驗證 cursor、transaction、temporary file、外部 side effect 和 retry 的狀態？
5. 如果把 Facade 改成 constructor injection 後測試變多但 controller latency 不變，你會如何判斷改善的是設計可見性而不是 runtime 效能？
6. 如果 tenant middleware 先於 authentication 執行會造成資料庫查詢增加，你會如何重排順序，同時避免未認證請求探測租戶是否存在？
7. 如果 eager loading 降低 query count 卻使 memory 和 response bytes 超過上限，你會如何在 constrained loading、欄位裁剪、pagination、cursor 和 cache 之間取捨？
    8. 如果 rollback 後舊 worker 仍會重試新版本產生的 queue job，你會如何用 idempotency、payload compatibility、replay policy 和監控避免重複訂單副作用？
