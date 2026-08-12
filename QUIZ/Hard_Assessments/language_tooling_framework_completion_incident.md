# Language／Tooling／Framework Completion Incident：從 Runtime、依賴到 Web 邊界

- **Assessment ID**: `assessment.language-tooling-framework.completion.v1`
- **主要 Concept ID**: `concept.nodejs.runtime-selection.compatibility`
- **次要 Concept IDs**:
  - `concept.nodejs.runtime-version-lts`
  - `concept.nodejs.tooling.module-resolution`
  - `concept.typescript.decorators-metaprogramming`
  - `concept.php.core.file-inclusion-autoloading`
  - `concept.python.metaclasses-class-creation`
  - `concept.django.admin-customization-security`
  - `concept.flask.jinja2-template-boundary`
  - `concept.testing.performance-benchmark-design`
- **對應文章**:
  - [Node.js、Deno、Bun](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Runtimes/node_vs_deno_vs_bun.md)
  - [Node.js Versions 與 LTS](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Runtimes/nodejs_versions_and_lts.md)
  - [node_modules 與 Resolution](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Tooling/node_modules_and_resolution.md)
  - [TypeScript Decorators](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/TypeScript/decorators_metaprogramming.md)
  - [PHP include 與 require](../../02_Backend_Development/Programming_Languages_and_Frameworks/PHP/Core/include_vs_require.md)
  - [Python Metaclasses](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Core/metaclasses_in_python.md)
  - [Django Admin Customization](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/admin_customization.md)
  - [Flask Jinja2](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/template_engine_jinja2.md)
  - [Performance／Benchmark Testing](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Testing/performance_and_benchmark_testing.md)
- **題型**: `runtime migration`, `dependency incident`, `framework security`, `benchmark design`, `rollback`
- **難度**: 9
- **重要程度**: 3
- **建議作答時間**: 40 分鐘
- **標籤**: `Node.js`, `TypeScript`, `PHP`, `Python`, `Django`, `Flask`, `Dependency`, `Performance`
- **Learning Objective IDs**:
  - `concept.nodejs.runtime-selection.compatibility/LO-1`
  - `concept.nodejs.runtime-selection.compatibility/LO-2`
  - `concept.nodejs.runtime-selection.compatibility/LO-3`
  - `concept.nodejs.runtime-version-lts/LO-1`
  - `concept.nodejs.runtime-version-lts/LO-2`
  - `concept.nodejs.runtime-version-lts/LO-3`
  - `concept.nodejs.tooling.module-resolution/LO-1`
  - `concept.nodejs.tooling.module-resolution/LO-2`
  - `concept.nodejs.tooling.module-resolution/LO-3`
  - `concept.typescript.decorators-metaprogramming/LO-1`
  - `concept.typescript.decorators-metaprogramming/LO-2`
  - `concept.typescript.decorators-metaprogramming/LO-3`
  - `concept.php.core.file-inclusion-autoloading/LO-1`
  - `concept.php.core.file-inclusion-autoloading/LO-2`
  - `concept.php.core.file-inclusion-autoloading/LO-3`
  - `concept.python.metaclasses-class-creation/LO-1`
  - `concept.python.metaclasses-class-creation/LO-2`
  - `concept.python.metaclasses-class-creation/LO-3`
  - `concept.django.admin-customization-security/LO-1`
  - `concept.django.admin-customization-security/LO-2`
  - `concept.django.admin-customization-security/LO-3`
  - `concept.flask.jinja2-template-boundary/LO-1`
  - `concept.flask.jinja2-template-boundary/LO-2`
  - `concept.flask.jinja2-template-boundary/LO-3`
  - `concept.testing.performance-benchmark-design/LO-1`
  - `concept.testing.performance-benchmark-design/LO-2`
  - `concept.testing.performance-benchmark-design/LO-3`

## 測驗目標

- 能從 runtime、版本、dependency graph、metadata、autoload、template、Admin 與 benchmark 證據建立因果鏈。
- 能區分相容性錯誤、供應鏈／artifact drift、框架安全問題與測試方法本身造成的假回歸。
- 能設計可觀測、可測試、可分階段 rollout 且可回滾的跨語言工具鏈方案。

### 學習目標覆蓋

| 文章 Concept | Learning Objectives | 作答覆蓋 |
| :--- | :--- | :--- |
| `concept.nodejs.runtime-selection.compatibility` | LO-1、LO-2、LO-3 | 作答要求 1、2 |
| `concept.nodejs.runtime-version-lts` | LO-1、LO-2、LO-3 | 作答要求 2 |
| `concept.nodejs.tooling.module-resolution` | LO-1、LO-2、LO-3 | 作答要求 3 |
| `concept.typescript.decorators-metaprogramming` | LO-1、LO-2、LO-3 | 作答要求 4 |
| `concept.php.core.file-inclusion-autoloading` | LO-1、LO-2、LO-3 | 作答要求 5 |
| `concept.python.metaclasses-class-creation` | LO-1、LO-2、LO-3 | 作答要求 6 |
| `concept.django.admin-customization-security` | LO-1、LO-2、LO-3 | 作答要求 7 |
| `concept.flask.jinja2-template-boundary` | LO-1、LO-2、LO-3 | 作答要求 8 |
| `concept.testing.performance-benchmark-design` | LO-1、LO-2、LO-3 | 作答要求 9 |

## 問題情境與限制條件

一個多語言平台準備把 Node.js service 從舊 LTS 升級，並評估 Deno／Bun；同一季度也要更新 TypeScript decorator、PHP bootstrap、Django Admin 與 Flask template。CI 在不同 runner 上得到不同 dependency graph，performance benchmark 卻顯示新版本變快。

目前證據：

- Node service 在新 LTS 的 cold start 變慢，部分 native addon 與 ESM／CommonJS 邊界出錯；Deno／Bun 的 synthetic benchmark 較快，但 production plugin、APM 與 deployment image 尚未驗證。
- clean install 與 developer machine 的 `node_modules` 不同，出現 peer dependency、hoisting、exports 與 lockfile mismatch。
- TypeScript decorator migration 後部分 metadata 消失；PHP include path 在 Linux case-sensitive image 中失敗；Python metaclass import 時建立昂貴資源。
- Django Admin bulk action 未限制 tenant scope，queryset 產生 N+1；Jinja2 template 為了顯示 rich text 使用 `safe`，出現 XSS 風險。
- benchmark 沒有固定 warmup、dataset、CPU、Python／Node 版本與 percentile，只報平均值。

限制：不得以關閉安全檢查、把所有 template 標成 safe、跳過 lockfile、回退到不支援的 runtime 或刪除慢測試來取得綠燈；每次只允許一個主要變因進入 canary。

## 作答要求

1. 建立 runtime migration 的決策矩陣，涵蓋 Node／Deno／Bun 的 API、native addon、security、observability、部署與團隊成本。
2. 設計 Node LTS upgrade 的 version matrix、compatibility／ABI gate、canary、SLO、artifact 與 rollback。
3. 取證 `node_modules` resolution、workspace／hoisting、peer dependency、exports、lockfile、SBOM 與 clean install 差異。
4. 分析 TypeScript decorator metadata、evaluation order、inheritance、reflection 與 framework coupling，提出 migration test。
5. 設計 PHP include／require／Composer autoload 的安全 bootstrap，處理 path、case、duplicate load、secret 與 failure semantics。
6. 比較 Python metaclass、class decorator、descriptor 與 `__init_subclass__`，設計可測試的 class creation boundary。
7. 修正 Django Admin 的 tenant permission、bulk action、query count、audit、pagination 與 rollback。
8. 修正 Jinja2 autoescape、safe HTML、context processor、template cache 與 CSP／XSS 邊界。
9. 重建 benchmark plan，固定 workload、warmup、environment、sample、percentile、variance、capacity gate 與 production validation。

## 期待證據

- 能提供 runtime／dependency matrix、clean install diff、startup／event-loop／memory／error／p99 與 rollback artifact。
- 能指出 lockfile、SBOM、checksum、package exports、native ABI 與 provenance 是不同層次的證據。
- 能用 decorator／metaclass／autoload trace、Admin query count、permission test、template injection test 與 benchmark variance 支持結論。
- 能明確區分 synthetic benchmark 快與 production SLO 改善，並給出停止線與回滾條件。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議換最快 runtime、關閉安全檢查或提高 timeout，沒有證據與回滾。 |
| 1 | 能列出部分 Node／Python／PHP 名詞，但沒有跨層因果與測試設計。 |
| 2 | 能指出主要相容性、安全或 benchmark 問題，但缺少 provenance、權限、容量或 rollback。 |
| 3 | 能完成 migration／dependency／framework／benchmark 分析，提出可執行的 gate、證據與回滾。 |
| 4 | 能量化 runtime、cold start、p99、query、memory、security 與成本取捨，並處理跨語言 release 的邊界。 |

### 通過標準

總分達 **3/4 分**才通過；runtime／dependency、framework safety、benchmark validity 三個面向均不得低於 2 分，且必須提出一個可驗證的 rollback 條件。

## 參考答案與詳解

先固定每個候選 runtime 的實際 workload、API／native addon、image、APM、security policy 與部署方式，再以 shadow／canary 比較 startup、event-loop lag、error、p99、RSS、成本與 rollback time。LTS 升級要以版本、ABI、OpenSSL／V8、lockfile、native build 與 support window 做 gate，不能用 synthetic benchmark 取代 production evidence。

依賴事故要從 clean install、lockfile、package manager、Node version、workspace、realpath、exports、peer dependency、checksum、SBOM 與 artifact digest 重建，而不是直接刪除 node_modules。Decorator 與 metaclass 需分開看 compile-time type、runtime metadata、class creation、MRO、reflection 與 import cost；若 decorator magic 不能被 contract／integration test 解釋，就不應擴大 rollout。

PHP 應把 bootstrap／設定檔的 require 與 class 的 Composer autoload 分開，限制 include path 並保護 secret。Django Admin 必須把 tenant、object permission、bulk action、audit、queryset、pagination 與 transaction 一起驗證；Jinja2 預設 escape，只有經過 sanitization 的有限 rich text 才能進入 safe path，並搭配 CSP 與 injection tests。

Benchmark 應固定版本、資料集、warmup、runner、CPU、GC、concurrency、sample 與 percentile，報 variance、confidence、resource、throughput、error 與容量閾值。只有當 benchmark、production-like load、observability 與 rollback evidence 一致時，才允許升級擴大。

## 常見失分點

- 把 Bun／Deno 的單次 benchmark 當成可直接替換 production runtime 的證據。
- 只重建 node_modules，卻不比較 lockfile、ABI、exports、checksum 與 artifact。
- 把 decorator、metaclass 或 autoload magic 當成免費抽象，忽略 import／startup／debug 成本。
- 只檢查 Django Admin UI，沒有測 tenant scope、bulk action、N+1、audit 與 query budget。
- 把所有 Jinja2 輸出標成 safe，或用平均 benchmark 結果掩蓋 p99 與 variance。

## 延伸追問

1. 如果新 runtime 的 p99 下降但 error rate 只在 native addon path 上升，你會如何切分流量與決定 rollback？
2. 如果 lockfile 一致但 production image 仍不同，你會如何比較 base image、build toolchain、secret、SBOM 與 artifact digest？
3. 如果 Django bulk action 已完成部分資料但 worker timeout，你如何設計 idempotency、audit、replay 與使用者可見狀態？
