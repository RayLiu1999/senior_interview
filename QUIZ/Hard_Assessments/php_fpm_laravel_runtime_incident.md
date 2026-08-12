# PHP-FPM Laravel Runtime Incident：從 FPM 容量、OPcache、GC 到 Service Container

- **Assessment ID**: `assessment.php.fpm-laravel-runtime.incident.v1`
- **主要 Concept ID**: `concept.php.web-servers.php-fpm`
- **次要 Concept IDs**:
  - `concept.php.core.opcache-jit`
  - `concept.php.core.garbage-collection`
  - `concept.php.laravel.service-container-ioc`
  - `concept.php.laravel.performance-optimization`
- **對應文章**:
  - [PHP-FPM 與其作用](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Web_Servers/php_fpm_and_its_role.md)
  - [OPcache 與 JIT](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/opcache_and_jit.md)
  - [PHP 垃圾回收](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/garbage_collection_in_php.md)
  - [Laravel Service Container 與 IoC](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Frameworks/Laravel/service_container_and_ioc.md)
  - [Laravel 效能優化](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Frameworks/Laravel/performance_optimization.md)
- **題型**: `生產事故診斷`, `PHP-FPM 容量`, `快取與部署`, `記憶體診斷`, `框架生命週期`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 35 分鐘
- **標籤**: `PHP`, `PHP-FPM`, `Laravel`, `OPcache`, `JIT`, `Garbage Collection`, `Performance`
- **Learning Objective IDs**:
  - `concept.php.web-servers.php-fpm/LO-1`
  - `concept.php.web-servers.php-fpm/LO-2`
  - `concept.php.web-servers.php-fpm/LO-3`
  - `concept.php.core.opcache-jit/LO-1`
  - `concept.php.core.opcache-jit/LO-2`
  - `concept.php.core.opcache-jit/LO-3`
  - `concept.php.core.garbage-collection/LO-1`
  - `concept.php.core.garbage-collection/LO-2`
  - `concept.php.core.garbage-collection/LO-3`
  - `concept.php.laravel.service-container-ioc/LO-1`
  - `concept.php.laravel.service-container-ioc/LO-2`
  - `concept.php.laravel.service-container-ioc/LO-3`
  - `concept.php.laravel.performance-optimization/LO-1`
  - `concept.php.laravel.performance-optimization/LO-2`
  - `concept.php.laravel.performance-optimization/LO-3`

## 測驗目標

- 能從 Nginx、PHP-FPM pool、request latency、listen queue、下游資料庫與記憶體指標建立可驗證的事故因果鏈。
- 能區分 PHP-FPM worker 飽和、Laravel 查詢／序列化瓶頸、OPcache 失效、GC／長生命週期狀態與單純 CPU 不足，而不是只調大 `pm.max_children`。
- 能設計安全的 FPM 容量、Laravel 查詢與快取修復、OPcache 部署失效流程，以及適合標準 FPM、queue worker 或長生命週期 runtime 的 Service Container scope。
- 能用分階段 rollout、壓力測試、慢下游與記憶體故障注入，以及明確 rollback 指標驗證修復。

## 問題情境與限制條件

某 Laravel API 以 Nginx 接收流量，再透過 PHP-FPM `dynamic` process pool 執行。服務部署在 4 GiB memory limit 的容器中，資料庫與 Redis 是獨立服務。一次版本發布並遇到促銷流量後，觀察到以下現象：P99 從 280 ms 上升到 5.2 秒，部分請求回傳 502／504；PHP-FPM active processes 長時間等於 `pm.max_children`，listen queue 持續增加，Nginx upstream response time 也同步拉長。

目前設定與觀測資料如下：

- pool 設為 `pm.max_children = 48`、`pm.start_servers = 8`，但團隊提出「直接改成 96」作為止血方案。容器 working set 已接近 3.3 GiB；每個 worker 的 private memory 會依路由和結果集大小落在約 45–80 MiB，資料庫連線池與 OPcache shared memory 尚未納入團隊的容量估算。
- 出問題的 Laravel endpoint 會載入訂單及多層關聯，部分路徑出現 N+1 query；另一段路徑一次取得過大的 Eloquent collection，再進行欄位轉換與 JSON serialization。資料庫 CPU 只有 55%，但每 request query count、response bytes 與 application service time 明顯增加。
- 發布後 OPcache hit rate 從約 99% 降至 84%，部分 instance 的 script timestamp 與 release version fingerprint 不一致。重設 OPcache 後，短時間內 compile CPU 上升；團隊同時提議「開啟 JIT 就能解決 P99」，但該 endpoint 主要等待資料庫、Redis 與序列化。
- PHP-FPM 使用標準 request model；另外還有獨立的 Laravel queue worker 與一個長生命週期 runtime 部署。某 `ReportAggregator` 綁定為 `singleton`，把 request filter closure、Eloquent collection 與可變 cache 放在物件屬性中。標準 FPM 每個 request 會重新建立 Laravel application container，但長生命週期 worker 可能跨 job／request 保留同一個 container 與 singleton；兩種 runtime 的風險不能混為一談。
- 長生命週期 worker 的 RSS 隨處理 job 數量增加，GC cycle collection 次數上升；呼叫 `gc_collect_cycles()` 後部分 managed allocation 下降，但 RSS 沒有立即回到基線。團隊尚未區分循環引用、無界 cache、仍被 root 保留的物件，以及 allocator／process 保留的記憶體。
- 限制條件是不能只增加 FPM worker、不能犧牲租戶隔離與訂單資料正確性、不能以全域清空 cache 或重啟所有容器作為唯一方案；必須先安全止血，再提出可觀測、可分階段且可回滾的改動。

你是當值 senior engineer。請以「先確認容量與因果鏈，再改變一個主要變因」為原則作答，並明確區分已知證據、待驗證假設與不可由現有資料直接推論的結論。

## 作答要求

1. **建立事故因果鏈**：依序分析 Nginx upstream、FPM listen queue、worker 飽和、Laravel query／serialization、OPcache 狀態與 P99／502／504 的關係，列出至少三個競爭假設及其可觀測差異。
2. **設計取證計畫**：列出至少十二項具體證據或實驗，至少涵蓋 FPM status／slowlog、request trace、worker memory、資料庫 query count／latency／連線池、Redis latency、Nginx timeout、OPcache status／version fingerprint、GC／allocation／RSS、Laravel container scope 與 cache cardinality；說明每項如何支持或排除假設。
3. **提出安全止血**：設計流量與 request concurrency 保護、合理的 timeout／overload response、路由降級或 feature flag、FPM pool 調整與 rollout／rollback；說明為何無條件增加 `pm.max_children` 可能造成 OOM、資料庫連線耗盡或下游排隊。
4. **修正 Laravel 效能路徑**：指出 N+1、過大 collection、欄位未裁剪、缺少 pagination／chunk／cursor、快取或批次策略的證據與修法，並用 query count、response bytes、P50／P99 與資料正確性驗證。
5. **診斷並改善 OPcache／JIT**：說明 OPcache hit rate、shared memory、script invalidation、`validate_timestamps`、部署切換與 warm-up 的關係；判斷此 I/O-bound endpoint 是否應啟用 JIT，並提出可回滾的 benchmark 與部署策略。
6. **診斷 PHP 記憶體與 GC**：區分 refcount、循環引用、root 保留、長生命週期 cache、每 request 暫存、worker recycling 與 allocator／process RSS 保留；說明何時使用 GC 診斷或 `gc_collect_cycles()`，以及為何它不是容量修復的替代品。
7. **修正 Service Container 生命週期**：比較 `bind`、`singleton`、`scoped`／request scope 在標準 FPM、queue worker 與長生命週期 runtime 的差異；設計 request-specific state、資料庫連線與可變 cache 的 ownership，避免跨租戶或跨 job 污染。
8. **分階段交付與驗證**：給出至少三階段的改動順序，每階段列出成功指標、警戒線、rollback 條件，以及至少一項壓力、慢資料庫／Redis、OPcache 冷啟動、OOM 或長生命週期記憶體故障注入測試。

## 期待證據

- 能指出 FPM active workers 等於上限且 listen queue 增加，代表請求在 pool 前排隊；但仍需用 upstream timing、FPM slowlog／status 與 trace 區分 worker 不足、單 request 變慢和下游飽和。
- 能以 private memory、container limit、資料庫連線池、CPU、下游 latency 與每 worker throughput 估算安全的 `pm.max_children`，不把 raw RSS 或單一 CPU 百分比當成完整容量模型。
- 能指出 N+1、過大 collection 與 serialization 會延長 worker 持有時間，讓相同的 FPM pool 能服務的 request 數下降；資料庫 CPU 不高也不能排除 query round-trip、lock wait、連線池或 application serialization 瓶頸。
- 能說明 OPcache 是 opcode cache，JIT 只在特定 CPU-bound workload 可能有收益；低 hit rate、版本不一致、shared memory 不足或不安全的 invalidation 需要分別處理，不能以「開 JIT」取代部署一致性。
- 能區分標準 PHP-FPM 的 request 隔離與長生命週期 runtime 的跨 job／request state：FPM request 結束後不代表 worker process 的 allocator RSS 立即歸還 OS，也不能把標準 FPM 的 singleton 直接等同於跨所有 request 的全域物件。
- 能用 allocation rate、GC cycle、retained object graph、cache cardinality、worker／job age、RSS、recycle 後基線與 container memory limit 區分 leak、壓力與 allocator 保留。
- 能指出 request filter、Eloquent collection、DB handle 或租戶資料不應由長生命週期 singleton 持有；`scoped`、每 job reset、明確 dispose／reconnect、cache eviction 與 tenant keying 必須配合 ownership 設計。
- 能把修復連到 P50／P99、502／504、FPM queue、active／max children、每 request query／bytes、OPcache hit／compile、GC pause／cycle、RSS、下游 saturation 與 rollback time。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議增加 `pm.max_children`、開啟 JIT 或重啟容器，忽略 FPM queue、下游容量、資料正確性與 runtime lifecycle，且沒有可驗證證據。 |
| 1 | 能列出 FPM、OPcache、GC、Laravel 或 DI 的部分名詞，但沒有因果鏈，也未處理容量估算、快取失效或 rollback。 |
| 2 | 能指出 worker 飽和、N+1、OPcache 或記憶體問題的一部分，提出大致可行修復，但遺漏至少兩個核心面向或缺少量化驗證。 |
| 3 | 能完成 FPM 與 Laravel runtime 診斷，提出受容量約束的 pool 調整、查詢修復、OPcache 部署策略、GC／memory evidence、正確 container scope 與分階段 rollout。 |
| 4 | 除上述內容外，能處理 shared memory 與 cold start、FPM request model 與長生命週期 runtime 的邊界、部分完成／超時、租戶隔離、allocator RSS 與可逆部署的 trade-off。 |

### 通過標準

總分達 **3/4 分**才通過；FPM 容量與效能、OPcache／部署、GC／記憶體、Service Container 生命週期四個核心面向均不得低於 2 分，且必須提出至少一個可執行的 rollback 條件。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先把 P99 拆成 Nginx upstream wait、FPM listen queue、worker service time、資料庫／Redis I/O、Laravel serialization 與 timeout。active processes 長時間等於 `pm.max_children` 且 listen queue 增加，支持 pool 前排隊；但不能據此直接得出「worker 越多越好」。若單 request 因 N+1、過大 collection 或下游等待而變慢，worker hold time 變長，同一 pool 的有效吞吐量會下降。應用 trace、FPM slowlog、query count／latency、連線池等待與 upstream timing 要對齊同一時間線。

`pm.max_children` 的上限應受最小值約束：可用記憶體除以代表性 worker private memory、資料庫／Redis／下游連線與 CPU／I/O 容量。不能用 raw RSS 簡單相乘，因為 OPcache 和部分頁面可能共享；也不能忽略 4 GiB container 的非 PHP 預留。若 working set 已接近 limit，直接把 48 調到 96 可能讓 OOM、process reclaim、DB connection exhaustion 與 tail latency 同時惡化。止血可先保留舊版本或關閉問題路由的 feature flag，對高成本查詢設定明確 timeout、限制每租戶併發、快速拒絕過載或回傳可接受的降級資料，再以小比例調整 pool 並觀察 queue、P99、OOM 與下游 saturation。

Laravel 路徑要先消除 N+1，再依用途使用 eager loading、欄位裁剪、索引、pagination、chunk／cursor、批次寫入或 cache。大結果集不應在 request 內無界載入和序列化；要把 query count、returned rows、response bytes、序列化時間與 P99 一起比較，並確認租戶篩選與訂單一致性沒有因降級而被繞過。資料庫 CPU 只有 55% 不能排除 round-trip、lock wait、連線池等待或應用層 CPU。

OPcache 診斷要分開看 hit rate、miss／compile、shared memory、script version fingerprint、instance 間設定與部署切換。若 production 關閉 `validate_timestamps`，就必須以不可變 release、原子切換、受控 FPM reload／restart、warm-up 與版本探針保證新程式一致載入；若保留 timestamp validation，則要衡量 stat 檢查成本與失效延遲。清空 OPcache 可以是受控的一次性操作，但不能在尖峰無差別執行。JIT 對主要等待資料庫、Redis 和 serialization 的 endpoint 未必有收益，應以代表性 CPU-bound workload、P50／P99、CPU、compile／warm-up、memory 與 rollback benchmark 決定，而不是把 JIT 當作通用加速開關。

記憶體方面要先畫 ownership 和 retained graph。refcount 下降不一定能回收循環引用；GC cycle collection 可以協助回收不可達的 cycle，但若物件仍被 static、singleton、cache、callback 或 job queue root 保留，手動 GC 不會解決問題。標準 FPM request 結束後，request object 通常不應跨 request 保留；但 child process 仍可能保留 allocator arena、OPcache／runtime 資源或累積碎片，RSS 不會因一次 `gc_collect_cycles()` 立即下降。應比較 allocation profile、live object／retained path、cache cardinality、worker／job age、recycle 後基線和 container limit；對長生命週期 worker 可採 bounded cache、每 job reset、明確 cleanup 與受控 worker recycling。

Service Container 的設計要依 runtime 決定。標準 FPM 通常每 request 建立 Laravel application container，因此 singleton 的生命週期多半落在該 request 的 container；不能誤稱它必然跨所有 FPM request 共用。但 queue worker 或 Octane 類長生命週期 runtime 可能重用同一 container，request filter、Eloquent collection、可變 cache 或 DB handle 放在 singleton 就會造成跨 job／tenant 污染和記憶體保留。request-specific state 應使用 request／scoped ownership，無狀態且 thread-safe 的 service 才適合 singleton；長生命週期 job 需要明確 reset、scope flush、資源釋放與 tenant keying，並測試成功、例外、timeout、取消和 shutdown 路徑。

建議分三階段交付。第一階段保留可回滾版本，加入 FPM status／slowlog、Nginx timing、trace、query／serialization、OPcache、memory 與 container metrics，限制高成本路由與每租戶併發；以慢 DB／Redis、突增流量與冷啟動測試驗證，若 P99、listen queue、502／504、OOM 或下游 saturation 超過警戒線即回滾。第二階段修正 N+1、結果集大小、timeout、cache policy、OPcache 一致部署與 container scope，逐步 rollout，通過資料正確性、租戶隔離、重複發布和 worker cleanup 測試。第三階段才依 evidence 調整 FPM pool、worker recycle、JIT 或 GC 相關設定，以固定 workload 比較 throughput、P99、CPU、RSS、OPcache hit／compile 與下游容量；每次只改一個主要變因並保留舊設定。

</details>

## 常見失分點

- 看到 FPM queue 就直接把 `pm.max_children` 加倍，沒有用 private memory、連線池、CPU 與下游容量估算上限。
- 把資料庫 CPU 未滿解讀成查詢沒有問題，忽略 N+1 round-trip、lock wait、連線池等待、過大結果集與 serialization。
- 把 OPcache、JIT、framework cache 混成同一種快取，或在沒有版本 fingerprint 和 rollback 的情況下全域清空 OPcache。
- 把 `gc_collect_cycles()` 當成 leak 修復，沒有檢查 root、static／singleton、cache cardinality、worker age、allocator RSS 與 recycle 後基線。
- 認為 Laravel singleton 在所有 FPM request、queue worker 和長生命週期 runtime 都是同一種生命週期，忽略標準 FPM request model 與跨 job state 的差異。
- 只提出重啟、增加 worker 或開 JIT，沒有明確的觀測指標、資料正確性限制、分階段 rollout 與 rollback 條件。

## 延伸追問

1. 如果將 `pm.max_children` 降低後 listen queue 變長，但 OOM 消失，你會如何在 throughput、P99、overload response 與下游保護之間選擇新的上限？
2. 如果 OPcache hit rate 很高但 P99 仍惡化，你會如何用 trace、slowlog、query plan、連線池與 serialization profile 排除「快取是主因」的假設？
3. 如果只在 queue worker 而非 FPM instance 看到 RSS 隨 job age 增加，你會如何設計 scoped binding、每 job cleanup、cache eviction 與 worker recycling？
4. 如果發布期間不同 instance 短暫執行不同 release，如何設計版本 fingerprint、原子切換、warm-up、FPM reload 與 rollback，避免 schema／code 不相容？
5. 如果 JIT benchmark 在 CPU-bound microbenchmark 有收益，但真實 API 的 P99 變差，你會檢查哪些 warm-up、memory、I/O、serialization 與 tail-latency 因素？
