# PHP Framework Tooling Incident：從依賴解析到事件／隊列可靠性

- **Assessment ID**: `assessment.php.framework-tooling.incident.v1`
- **主要 Concept ID**: `concept.php.tooling.composer-dependency-management`
- **次要 Concept IDs**:
  - `concept.php.core.reflection-api`
  - `concept.php.core.error-exception-boundaries`
  - `concept.php.core.equality-type-juggling`
  - `concept.php.core.magic-methods`
  - `concept.php.symfony.event-dispatcher-listeners`
  - `concept.php.symfony.dependency-injection-container`
  - `concept.php.symfony.security-component`
  - `concept.php.symfony.framework-basics`
  - `concept.php.symfony.performance-optimization`
  - `concept.php.laravel.testing-debugging`
  - `concept.php.laravel.events-observers`
  - `concept.php.laravel.queues-scheduling`
- **對應文章**:
  - [Composer 是什麼以及它的主要作用是什麼？](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Tooling/what_is_composer_and_its_purpose.md) — `concept.php.tooling.composer-dependency-management`
  - [PHP 反射機制](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/reflection_api.md) — `concept.php.core.reflection-api`
  - [PHP 錯誤與異常處理機制](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/error_and_exception_handling.md) — `concept.php.core.error-exception-boundaries`
  - [PHP 的 == 和 === 與型別戲法](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/equality_and_type_juggling.md) — `concept.php.core.equality-type-juggling`
  - [PHP 魔術方法詳解](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/magic_methods.md) — `concept.php.core.magic-methods`
  - [Symfony 事件系統與監聽器](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Frameworks/Symfony/event_system_and_listeners.md) — `concept.php.symfony.event-dispatcher-listeners`
  - [Symfony 依賴注入容器](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Frameworks/Symfony/dependency_injection_container.md) — `concept.php.symfony.dependency-injection-container`
  - [Symfony Security 安全組件](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Frameworks/Symfony/security_component.md) — `concept.php.symfony.security-component`
  - [Symfony 框架基礎](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Frameworks/Symfony/symfony_framework_basics.md) — `concept.php.symfony.framework-basics`
  - [Symfony 性能優化與最佳實踐](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Frameworks/Symfony/performance_optimization.md) — `concept.php.symfony.performance-optimization`
  - [Laravel 測試與調試](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Frameworks/Laravel/testing_and_debugging.md) — `concept.php.laravel.testing-debugging`
  - [Laravel 事件系統與觀察者模式](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Frameworks/Laravel/event_system_and_observer_pattern.md) — `concept.php.laravel.events-observers`
  - [Laravel 隊列與任務調度](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Frameworks/Laravel/queue_and_task_scheduling.md) — `concept.php.laravel.queues-scheduling`
- **題型**: `生產事故診斷`, `依賴與自動載入`, `型別與錯誤邊界`, `框架生命週期`, `事件與隊列可靠性`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 45 分鐘
- **標籤**: `PHP`, `Composer`, `Autoload`, `Reflection`, `Symfony`, `Dependency Injection`, `Security`, `Laravel`, `Events`, `Queues`, `Testing`, `Performance`
- **Learning Objective IDs**:
  - `concept.php.tooling.composer-dependency-management/LO-1`
  - `concept.php.tooling.composer-dependency-management/LO-2`
  - `concept.php.tooling.composer-dependency-management/LO-3`
  - `concept.php.core.reflection-api/LO-1`
  - `concept.php.core.reflection-api/LO-2`
  - `concept.php.core.reflection-api/LO-3`
  - `concept.php.core.error-exception-boundaries/LO-1`
  - `concept.php.core.error-exception-boundaries/LO-2`
  - `concept.php.core.error-exception-boundaries/LO-3`
  - `concept.php.core.equality-type-juggling/LO-1`
  - `concept.php.core.equality-type-juggling/LO-2`
  - `concept.php.core.equality-type-juggling/LO-3`
  - `concept.php.core.magic-methods/LO-1`
  - `concept.php.core.magic-methods/LO-2`
  - `concept.php.core.magic-methods/LO-3`
  - `concept.php.symfony.event-dispatcher-listeners/LO-1`
  - `concept.php.symfony.event-dispatcher-listeners/LO-2`
  - `concept.php.symfony.event-dispatcher-listeners/LO-3`
  - `concept.php.symfony.dependency-injection-container/LO-1`
  - `concept.php.symfony.dependency-injection-container/LO-2`
  - `concept.php.symfony.dependency-injection-container/LO-3`
  - `concept.php.symfony.security-component/LO-1`
  - `concept.php.symfony.security-component/LO-2`
  - `concept.php.symfony.security-component/LO-3`
  - `concept.php.symfony.framework-basics/LO-1`
  - `concept.php.symfony.framework-basics/LO-2`
  - `concept.php.symfony.framework-basics/LO-3`
  - `concept.php.symfony.performance-optimization/LO-1`
  - `concept.php.symfony.performance-optimization/LO-2`
  - `concept.php.symfony.performance-optimization/LO-3`
  - `concept.php.laravel.testing-debugging/LO-1`
  - `concept.php.laravel.testing-debugging/LO-2`
  - `concept.php.laravel.testing-debugging/LO-3`
  - `concept.php.laravel.events-observers/LO-1`
  - `concept.php.laravel.events-observers/LO-2`
  - `concept.php.laravel.events-observers/LO-3`
  - `concept.php.laravel.queues-scheduling/LO-1`
  - `concept.php.laravel.queues-scheduling/LO-2`
  - `concept.php.laravel.queues-scheduling/LO-3`

## 測驗目標

- 能從 Composer lock、autoload artifact、container cache 與 runtime fingerprint 建立可重現的依賴與部署因果鏈。
- 能在 PHP 的型別、錯誤、反射與 magic method 邊界上建立明確契約，避免錯誤被吞掉、輸入被錯誤轉型或動態行為繞過安全檢查。
- 能分析 Symfony 的 Kernel、DI、Security、EventDispatcher 與 production cache 如何共同影響 request、權限、效能和副作用。
- 能分析 Laravel 的測試隔離、event／observer、queue worker、retry、after-commit 與 scheduler lock 如何影響最終一致性。
- 能以 telemetry、contract／integration test、故障注入、canary 與 rollback 條件驗證修復，而不是只調整設定或重啟 worker。

## 問題情境與限制條件

某訂單平台使用同一個 PHP monorepo 維護兩條執行路徑：Symfony API 負責公開訂單與支付端點，Laravel 管理後台與 queue worker 負責通知、報表和對帳。Web request 由 PHP-FPM 執行，queue worker 與 scheduler 則是長生命週期程序。團隊在一次促銷前發布依賴升級與安全修正，部署後同時觀察到：

- 部分 instance 回報 `Class not found`、container cache warmup 失敗或某些 listener 沒有註冊；不同 instance 的 release fingerprint、`composer.lock` checksum 與 `vendor` artifact 不一致。有人在 production 執行了 `composer update`，也有人只使用舊的 `vendor` cache。
- Symfony API 的 P99 從 240 ms 上升到 2.8 秒，CPU 不高但 reflection／container bootstrap、autoload miss、同步 listener 與資料庫 trace 變長。某個 magic method 在缺少屬性時觸發隱藏查詢，且一個 listener priority 改動後在交易提交前送出通知。
- 未登入請求有時收到詳細 exception 頁面；某個以字串輸入的 order state 被鬆散比較判成合法狀態。管理端的 firewall 與 API token 規則共用一段設定，但沒有證據證明跨租戶 object access 都經過 voter 或 policy。
- Laravel 的 `OrderPaid` event 在 transaction 內 dispatch。queue lag 從 10 秒升至 9 分鐘，重試後同一筆訂單收到兩封通知並重複建立對帳記錄；部分測試因使用 event／queue fake 而未捕捉到 worker serialization、after-commit 或 retry 行為。
- scheduler 在兩個 replica 同時執行，報表任務偶爾重疊；長生命週期 worker 的 memory 與 failed job 數量持續增加。團隊提議直接清空所有 cache、把所有 listener 改成同步、關閉 security check，並在 production 重新執行 `composer update`。

限制條件如下：

- 不能以清空全部 cache、重啟所有 worker、關閉授權或無限增加 timeout 作為唯一修復；不能遺失訂單、重複扣款或破壞租戶隔離。
- 必須保留既有 API 的錯誤契約與向後相容，且要能在新版本不完整 rollout、queue redelivery、資料庫 rollback 或外部 provider timeout 時安全運作。
- 所有建議都必須能由測試、trace、metrics、artifact fingerprint 或故障注入證明；每次 rollout 至少保留一個可逆的主要變因。

你是負責事故收斂與發布審查的 senior engineer。請明確區分已知證據、待驗證假設和不能由目前資料直接推論的結論。

## 作答要求

1. **建立依賴與部署因果鏈**：說明 `composer.json`、`composer.lock`、平台需求、vendor artifact、autoload 生成物、container cache、OPcache 與 instance fingerprint 的關係；列出至少三個競爭假設及其可觀測差異。
2. **設計 Composer 修復**：比較 `install` 與 `update`、版本約束、transitive dependency、`--no-dev`、autoload optimization、cache key 和 artifact promotion；提出能在 CI 建置並在 production 驗證的方案與 rollback。
3. **劃分 PHP 錯誤邊界**：區分 `Error`、`Exception`、`Throwable`、validation／domain failure、HTTP error、CLI failure 與 queue failure；說明哪些可重試、哪些必須人工處理，以及如何遮罩敏感資訊。
4. **處理型別與動態行為**：分析鬆散比較、外部輸入、reflection、Attributes 和 magic methods 對授權、序列化、效能與除錯的影響；提出明確的正規化、白名單和 metadata cache 邊界。
5. **審查 Symfony DI 與 request 生命週期**：說明 autowiring、autoconfiguration、tag、alias、shared service、lazy service、compiled container 與 cache warmup；指出哪些 request／tenant state 不應由 shared service 持有。
6. **審查 Symfony Security**：畫出 firewall、authenticator、user provider、token、access control、voter 與業務 policy 的責任；比較 session web 與 stateless API，提出 default-deny、CSRF、token rotation、租戶隔離和 negative tests。
7. **審查 Symfony EventDispatcher 與效能**：分析 listener priority、同步副作用、transaction／after-commit、outbox、retry 和事件 trace；說明如何將 reflection、autoload、container、database、listener、serialization 的 latency 拆開量測。
8. **審查 Laravel event／observer 與 queue**：處理 event dispatch 時機、after-commit、payload serialization、retry／backoff、timeout／visibility timeout、冪等、failed job、DLQ、queue lag、worker recycling 和 scheduler lock。
9. **設計測試與除錯矩陣**：區分 unit、feature、HTTP、database、integration、contract、worker、property／failure injection 測試；說明 fake 可以證明什麼、不能證明什麼，以及如何重現跨租戶與部分完成。
10. **提出分階段 rollout**：至少提出三階段，為每階段列出成功指標、警戒線、停止條件和 rollback；至少包含依賴 artifact mismatch、未授權請求、慢 listener、queue redelivery、worker memory 或 scheduler overlap 的故障注入。

## 期待證據

- 每個 instance 的 release／container／PHP／extension fingerprint、`composer.lock` checksum、vendor artifact manifest、platform requirement check 與 autoload class lookup 結果。
- CI 與 production 是否都使用 lockfile；`install`／`update` 的 command history、transitive dependency diff、`--no-dev` 差異、autoload dump mode 與 artifact promotion log。
- Composer autoload hit／miss、classmap 大小、case-sensitive path check、container compile／warmup 結果、OPcache hit／miss／compile 和 cache version。
- Symfony request trace 拆分 bootstrap、Kernel、routing、DI resolve、reflection、magic dispatch、listener、database、serialization、network 和 response。
- listener registry、priority／subscriber 清單、進入／離開／短路 trace、transaction ID、commit 時間、outbox／message ID、retry 和副作用結果。
- `Throwable` 類型、HTTP status、錯誤 envelope、correlation ID、log redaction、production debug 設定與未預期 shutdown／fatal 的告警。
- type normalization、`==`／`===`、state transition、`in_array`／`array_search`、order ID 和 authorization policy 的 boundary／fuzz test。
- reflection metadata cache hit rate、每 request reflection count、magic method invocation、隱藏 I/O、allocation 和 cache invalidation 證據。
- compiled container 的 service graph、autowire／alias／tag lint、shared／lazy scope、request／tenant state ownership、container reset 與 worker age。
- firewall／authenticator／provider／token／voter 的 decision trace；匿名、過期 token、跨租戶 ID、CSRF、角色升降權與直接 URL 存取的 negative test。
- Symfony P50／P95／P99、error rate、CPU／memory、database connection／lock wait、listener duration、cache hit rate 與下游 saturation。
- Laravel event／observer dispatch trace、transaction commit、after-commit 行為、payload size／version、queue reservation、attempts、backoff 和 failed job。
- queue age、throughput、success／failure／redelivery rate、DLQ／failed job cardinality、worker RSS／job age、scheduler lock owner 和 overlapping run。
- `Event::fake`／`Queue::fake` 與真實 broker／database／worker 的差異測試；序列化、timeout、process crash、duplicate delivery、partial completion 和 recovery drill。
- API authorization、資料正確性、通知／對帳 idempotency key、租戶隔離、schema compatibility 和向後相容 contract test。
- canary traffic、feature flag、dependency version split、queue drain／pause、rollback duration、error budget、成本與 on-call 負擔。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議 production `composer update`、清空所有 cache、重啟 worker 或關閉 security；沒有因果鏈、證據和資料正確性限制。 |
| 1 | 能列出 Composer、PHP、Symfony 或 Laravel 名詞，但不能連到 artifact、request／worker lifecycle、授權、事件副作用和 rollback。 |
| 2 | 能指出部分 autoload、型別、DI、security、queue 或測試問題，提出大致可行修復，但遺漏至少兩個核心邊界或缺少量化驗證。 |
| 3 | 能建立可重現依賴鏈，正確處理 PHP 錯誤／型別／動態行為，完成 Symfony DI／Security／Events、Laravel testing／events／queues 的生命週期分析，並提出可測量且可回滾的 rollout。 |
| 4 | 除上述內容外，能處理不完整部署、container／OPcache cache version、listener ordering、after-commit、重複 delivery、跨租戶安全、長生命週期 worker、測試盲點與成本／blast radius 的連鎖取捨。 |

### 通過標準

總分達 **3/4 分**才通過；依賴與 artifact 可重現性、PHP 邊界與安全、Symfony request／事件／效能、Laravel 測試／事件／隊列四個核心面向均不得低於 2 分，且必須提出至少一個可執行的 rollback 條件與一組可量測的成功指標。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先把 incident 拆成兩條互相影響但必須分開驗證的因果鏈：依賴／artifact 不一致，以及 runtime／副作用變慢或不安全。每個 instance 先記錄 release fingerprint、lock checksum、PHP／extension platform、vendor manifest、autoload 結果、compiled container 與 OPcache version；不能用單一 `Class not found` 推論是 Composer、大小寫、cache、部署切換或缺少 extension。若同一 artifact 在乾淨環境可重現且只有部分 instance 失敗，優先檢查 promotion、mount、cache key 和 instance drift；若所有 instance 都失敗，才提高 lock、platform constraint 或 API 變更的可能性。

Composer 的建置責任應集中在 CI：審查 `composer.json` 和 lock diff，使用 lockfile 解析完整依賴，執行 platform check、autoload validation、測試與安全掃描，再把不可變 vendor artifact 和 fingerprint 推送到部署。production 使用 `install` 而不是即時 `update`；`update` 只能在升級 pipeline 產生新的 lock。`--no-dev` 必須與 runtime 需求分開驗證，不能因移除測試套件而移除應用真正需要的 provider。autoload optimization、classmap 和 cache 都要與 release fingerprint 綁定，rollback 應切回完整舊 artifact，而不是只重建某一個 instance 的 vendor。

PHP 邊界要先定義錯誤語意。`Throwable` 可讓 infrastructure handler 統一記錄 `Error` 與 `Exception`，但 validation／domain failure、預期的 provider timeout、程式錯誤與資源耗盡不可用同一種 retry。Web 應把可預期輸入錯誤轉成穩定 4xx，未預期錯誤轉成不洩漏細節的 5xx；CLI 和 queue 則要讓 exit status、failed job、retry budget 和 alert 反映可恢復性。所有輸出以 correlation ID 關聯 log／trace，遮罩 token、密碼、個資和 SQL detail，並避免 exception handler 在 response 已開始後再次寫入。

外部輸入先做 schema 與型別正規化，再以嚴格比較處理狀態與授權。`==`、鬆散的集合查找或 `switch` 可能把數字字串、空值與布林值當成合法狀態；這類 bug 要用 boundary／fuzz test 和 policy test 證明已封住。Reflection 和 Attributes 適合在 container compile、路由註冊或啟動階段建立 metadata；若每請求掃描類別，應用 trace 和 cache hit rate 證明成本。Magic method 只能處理受控的命名空間與白名單；隱藏查詢、動態 fallback、任意屬性寫入和自訂序列化都要有明確契約，不能讓授權或資料完整性依賴不可見行為。

Symfony 的服務圖應由 autowiring、alias、tag 和編譯階段具體化，並在 CI 執行 container lint／compile／warmup。無狀態 shared service 或明確共享資源可以重用；request、user、tenant、transaction 和可變 cache 不應被 shared service 或長生命週期 worker 持有。Kernel、routing、controller、DI 和 event trace 要對齊同一個 request ID，分辨 bootstrap／reflection／autoload、listener、資料庫與 serialization 的責任。Security 要把認證與授權分開：firewall／authenticator／provider 驗證身份，token、access control、voter 與 domain policy 決定權限；API 與 session web 使用不同的 state／CSRF／rotation 策略，所有失敗路徑 default deny，並用跨租戶和過期 token 的 negative test 驗證。

事件 listener 要有 registry、priority、進出 trace 和副作用契約。同步 listener 只做低延遲、可失敗處理的工作；通知、報表和跨服務訊息要在 commit 後透過 outbox／queue 發送。每個 event／message 需要 immutable ID、版本、tenant context、冪等策略、retry／DLQ 和 replay 邊界。若 listener 在 transaction commit 前送出通知，應以 after-commit 或 outbox 修正，並在資料庫 rollback、process crash 和 duplicate delivery 下驗證不會產生錯誤外部事實。

Laravel 的 event／observer 也不能假設只執行一次。dispatch intent 可用 fake 驗證，但 listener、payload serialization、broker、worker retry、after-commit 和外部副作用必須用 integration／contract test 驗證。Job 只攜帶可版本化、可序列化的最小資料；timeout、tries、backoff、visibility timeout 和 provider deadline 要協調，永久失敗進 failed jobs／DLQ，業務寫入、通知和對帳以 idempotency key 或 unique constraint 保護。scheduler 在多副本中必須有 lock、overlap policy 和 owner，worker 則要監控 RSS、job age、queue age 和 recycle 後基線。

交付可分三階段。第一階段凍結不受控的 production dependency update，建立 artifact／container／security／event／queue fingerprint 和 trace，對高風險 listener、scheduler 與 notification 加 feature flag 或 pause；若 `Class not found`、未授權成功率、duplicate side effect、P99、queue age 或 error budget 超過警戒線，切回舊 artifact。第二階段在小流量導入 lock-based artifact、container warmup、嚴格輸入與 security policy、after-commit／outbox、冪等與 worker 測試；以 slow listener、redelivery、process crash、跨租戶與 schema compatibility 故障注入驗證，資料 parity 或 rollback time 不合格即停止擴大。第三階段才逐項調整 autoload／OPcache、reflection cache、同步／非同步邊界、worker capacity 和 scheduler；每次只改一個主要變因，以 P50／P99、CPU／memory、autoload／container hit、queue age、failed jobs、外部副作用和成本決定是否繼續。

</details>

## 常見失分點

- 在 production 執行 `composer update`，卻沒有 lock diff、artifact fingerprint、platform check 或可回滾的完整 vendor。
- 把 `Class not found` 直接歸因於 PHP 版本，沒有區分大小寫、autoload mapping、cache、mount、extension 和 instance drift。
- 用 `catch (Throwable)` 把所有錯誤轉成成功 response，或把所有 exception 都當成可重試，造成資料遺失、重複副作用與敏感資訊洩漏。
- 只說使用 strict comparison，卻沒有處理輸入正規化、狀態機、授權 policy 和集合查找的 boundary test。
- 把 reflection／magic method 當作方便的全域 service locator，忽略隱藏 I/O、metadata cache、可讀性、序列化和安全白名單。
- 把 Symfony shared service、Laravel singleton、FPM request、queue worker 和長生命週期 runtime 視為同一種 scope。
- 只調 listener priority 或把所有事件改同步，沒有處理 transaction／after-commit、outbox、重試、順序和冪等。
- 只用 `Event::fake`／`Queue::fake` 宣稱 queue 正確，沒有測試 payload、worker、broker redelivery、timeout、failed job 和外部副作用。
- 只看平均 latency 或 queue throughput，沒有觀察 P99、queue age、worker memory、租戶隔離、資料 parity、error budget 和 rollback time。
- 以清空 cache、重啟所有 worker、關閉授權或無限提高 timeout 作為唯一方案，沒有分階段 rollout 和停止條件。

## 延伸追問

1. 如果所有 instance 的 lock checksum 一致，但仍只有部分 instance 出現 class loading failure，你會如何區分 container／OPcache、大小寫檔案系統、mount 和 artifact corruption？
2. 如果一個 listener 必須在交易提交後通知外部支付 provider，但 outbox 也可能重複投遞，你會如何設計 event ID、idempotency key、reconciliation 和人工補償？
3. 如果 Symfony container compile 通過，但 P99 仍因 reflection 和 magic method 上升，你會如何用 trace、metadata cache、hidden I/O 和 allocation profile 證明是否值得改成明確介面？
4. 如果 security negative test 通過，但跨租戶資料仍可能由 queue job 讀取，你會如何檢查 payload、worker scope、authorization re-check 和 tenant context expiration？
5. 如果 Laravel queue lag 在增加 worker 後反而使資料庫與外部 API 飽和，你會如何設定 concurrency、backpressure、retry budget、rate limit 和 rollback？
6. 如果只能選一個先修 Composer artifact、Symfony listener after-commit 或 Laravel job idempotency，你會依 blast radius、資料正確性和可逆性如何排序？
