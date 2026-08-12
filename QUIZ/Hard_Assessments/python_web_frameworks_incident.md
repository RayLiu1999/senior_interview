# Python Web Frameworks Production Incident：Django／Flask 邊界、容量與選型

- **Assessment ID**: `assessment.python.web-frameworks.incident.v1`
- **主要 Concept ID**: `concept.python.web-framework-selection`
- **次要 Concept IDs**:
  - `concept.python.django.authentication-permissions`
  - `concept.python.django.caching-framework`
  - `concept.python.django.deployment-runtime`
  - `concept.python.django.orm-architecture`
  - `concept.python.django.rest-framework`
  - `concept.python.django.forms-validation`
  - `concept.python.django.middleware-lifecycle`
  - `concept.python.django.migrations-safety`
  - `concept.python.django.performance-capacity`
  - `concept.python.django.query-optimization`
  - `concept.python.django.request-response-lifecycle`
  - `concept.python.django.security-boundary`
  - `concept.python.django.signal-architecture`
  - `concept.python.django.testing-strategy`
  - `concept.python.flask.context-lifecycle`
  - `concept.python.flask.blueprint-architecture`
  - `concept.python.flask.configuration-management`
  - `concept.python.flask.deployment-runtime`
  - `concept.python.flask.error-boundary`
  - `concept.python.flask.extension-lifecycle`
  - `concept.python.flask.sqlalchemy-integration`
  - `concept.python.flask.middleware-hooks`
  - `concept.python.flask.performance-capacity`
  - `concept.python.flask.request-response-contract`
  - `concept.python.flask.rest-api-design`
  - `concept.python.flask.routing-dispatch`
  - `concept.python.flask.session-security`
  - `concept.python.flask.testing-strategy`
  - `concept.python.flask.application-factory`
  - `concept.python.flask.blueprint-modularity`
- **對應文章**:
  - [Django 認證與權限系統](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/authentication_and_permissions.md)
  - [Django Cache 框架](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/caching_framework.md)
  - [Django 部署最佳實踐](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/deployment_best_practices.md)
  - [Django ORM 深入解析](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/django_orm_deep_dive.md)
  - [Django REST Framework](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/django_rest_framework.md)
  - [Django 表單處理](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/forms_processing.md)
  - [Django Middleware 機制](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/middleware_mechanism.md)
  - [Django Migrations](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/migrations.md)
  - [Django 性能優化](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/performance_optimization.md)
  - [Django 查詢優化](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/query_optimization.md)
  - [Django 請求-響應週期](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/request_response_cycle.md)
  - [Django 安全最佳實踐](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/security_best_practices.md)
  - [Django Signal 系統](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/signal_system.md)
  - [Django 測試策略](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Django/testing_strategies.md)
  - [Flask Application 與 Request Context](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/application_and_request_context.md)
  - [Flask Blueprint 架構](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/blueprint_architecture.md)
  - [Flask 配置管理](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/configuration_management.md)
  - [Flask 部署與生產環境](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/deployment_and_production.md)
  - [Flask 錯誤處理](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/error_handling.md)
  - [Flask Extension 系統](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/extension_system.md)
  - [Flask-SQLAlchemy 整合](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/flask_sqlalchemy_integration.md)
  - [Flask Middleware 與 Hooks](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/middleware_and_hooks.md)
  - [Flask 性能優化](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/performance_optimization.md)
  - [Flask Request 與 Response 對象](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/request_and_response_objects.md)
  - [Flask RESTful API 開發](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/restful_api_development.md)
  - [Flask 路由系統與 URL 規則](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/routing_and_url_rules.md)
  - [Flask Session 管理](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/session_management.md)
  - [Flask 測試策略](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/Flask/testing_strategies.md)
  - [Django 與 Flask 的差異與選擇](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/django_vs_flask.md)
  - [Flask Application Factory](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/flask_application_factory.md)
  - [Flask Blueprint 模組化](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Frameworks/flask_blueprint.md)
- **題型**: `生產事故診斷`、`框架選型`、`安全與資料一致性`、`容量與部署`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 60 分鐘
- **標籤**: `Python`, `Django`, `Flask`, `ORM`, `Security`, `Caching`, `Deployment`, `Capacity`
- **Learning Objective IDs**:
  - `concept.python.django.authentication-permissions/LO-1`
  - `concept.python.django.authentication-permissions/LO-2`
  - `concept.python.django.authentication-permissions/LO-3`
  - `concept.python.django.caching-framework/LO-1`
  - `concept.python.django.caching-framework/LO-2`
  - `concept.python.django.caching-framework/LO-3`
  - `concept.python.django.deployment-runtime/LO-1`
  - `concept.python.django.deployment-runtime/LO-2`
  - `concept.python.django.deployment-runtime/LO-3`
  - `concept.python.django.orm-architecture/LO-1`
  - `concept.python.django.orm-architecture/LO-2`
  - `concept.python.django.orm-architecture/LO-3`
  - `concept.python.django.rest-framework/LO-1`
  - `concept.python.django.rest-framework/LO-2`
  - `concept.python.django.rest-framework/LO-3`
  - `concept.python.django.forms-validation/LO-1`
  - `concept.python.django.forms-validation/LO-2`
  - `concept.python.django.forms-validation/LO-3`
  - `concept.python.django.middleware-lifecycle/LO-1`
  - `concept.python.django.middleware-lifecycle/LO-2`
  - `concept.python.django.middleware-lifecycle/LO-3`
  - `concept.python.django.migrations-safety/LO-1`
  - `concept.python.django.migrations-safety/LO-2`
  - `concept.python.django.migrations-safety/LO-3`
  - `concept.python.django.performance-capacity/LO-1`
  - `concept.python.django.performance-capacity/LO-2`
  - `concept.python.django.performance-capacity/LO-3`
  - `concept.python.django.query-optimization/LO-1`
  - `concept.python.django.query-optimization/LO-2`
  - `concept.python.django.query-optimization/LO-3`
  - `concept.python.django.request-response-lifecycle/LO-1`
  - `concept.python.django.request-response-lifecycle/LO-2`
  - `concept.python.django.request-response-lifecycle/LO-3`
  - `concept.python.django.security-boundary/LO-1`
  - `concept.python.django.security-boundary/LO-2`
  - `concept.python.django.security-boundary/LO-3`
  - `concept.python.django.signal-architecture/LO-1`
  - `concept.python.django.signal-architecture/LO-2`
  - `concept.python.django.signal-architecture/LO-3`
  - `concept.python.django.testing-strategy/LO-1`
  - `concept.python.django.testing-strategy/LO-2`
  - `concept.python.django.testing-strategy/LO-3`
  - `concept.python.flask.context-lifecycle/LO-1`
  - `concept.python.flask.context-lifecycle/LO-2`
  - `concept.python.flask.context-lifecycle/LO-3`
  - `concept.python.flask.blueprint-architecture/LO-1`
  - `concept.python.flask.blueprint-architecture/LO-2`
  - `concept.python.flask.blueprint-architecture/LO-3`
  - `concept.python.flask.configuration-management/LO-1`
  - `concept.python.flask.configuration-management/LO-2`
  - `concept.python.flask.configuration-management/LO-3`
  - `concept.python.flask.deployment-runtime/LO-1`
  - `concept.python.flask.deployment-runtime/LO-2`
  - `concept.python.flask.deployment-runtime/LO-3`
  - `concept.python.flask.error-boundary/LO-1`
  - `concept.python.flask.error-boundary/LO-2`
  - `concept.python.flask.error-boundary/LO-3`
  - `concept.python.flask.extension-lifecycle/LO-1`
  - `concept.python.flask.extension-lifecycle/LO-2`
  - `concept.python.flask.extension-lifecycle/LO-3`
  - `concept.python.flask.sqlalchemy-integration/LO-1`
  - `concept.python.flask.sqlalchemy-integration/LO-2`
  - `concept.python.flask.sqlalchemy-integration/LO-3`
  - `concept.python.flask.middleware-hooks/LO-1`
  - `concept.python.flask.middleware-hooks/LO-2`
  - `concept.python.flask.middleware-hooks/LO-3`
  - `concept.python.flask.performance-capacity/LO-1`
  - `concept.python.flask.performance-capacity/LO-2`
  - `concept.python.flask.performance-capacity/LO-3`
  - `concept.python.flask.request-response-contract/LO-1`
  - `concept.python.flask.request-response-contract/LO-2`
  - `concept.python.flask.request-response-contract/LO-3`
  - `concept.python.flask.rest-api-design/LO-1`
  - `concept.python.flask.rest-api-design/LO-2`
  - `concept.python.flask.rest-api-design/LO-3`
  - `concept.python.flask.routing-dispatch/LO-1`
  - `concept.python.flask.routing-dispatch/LO-2`
  - `concept.python.flask.routing-dispatch/LO-3`
  - `concept.python.flask.session-security/LO-1`
  - `concept.python.flask.session-security/LO-2`
  - `concept.python.flask.session-security/LO-3`
  - `concept.python.flask.testing-strategy/LO-1`
  - `concept.python.flask.testing-strategy/LO-2`
  - `concept.python.flask.testing-strategy/LO-3`
  - `concept.python.web-framework-selection/LO-1`
  - `concept.python.web-framework-selection/LO-2`
  - `concept.python.web-framework-selection/LO-3`
  - `concept.python.flask.application-factory/LO-1`
  - `concept.python.flask.application-factory/LO-2`
  - `concept.python.flask.application-factory/LO-3`
  - `concept.python.flask.blueprint-modularity/LO-1`
  - `concept.python.flask.blueprint-modularity/LO-2`
  - `concept.python.flask.blueprint-modularity/LO-3`

## 測驗目標

- 能從 Django 與 Flask 的 request、middleware／hook、context、ORM、cache、session、background work 到 response 邊界建立事故因果鏈。
- 能比較 batteries-included 與 microframework 的責任分配，依團隊、產品、合規、流量與維運能力做可驗證的框架選型。
- 能設計 authentication、authorization、CSRF、session、輸入／輸出契約、租戶隔離與敏感資料遮罩。
- 能界定 QuerySet／session／transaction／signal／context／extension／Blueprint 的 resource ownership，避免跨 request 或跨 task 共用。
- 能用 query count、pool wait、cache hit、worker queue、P99、RSS、錯誤率與 schema diff 建立容量與正確性證據。
- 能提出先止血、後修復、可量測且可 rollback 的三階段交付方案，並用 integration、contract、security、故障注入與負載測試驗證。

## 問題情境與限制條件

某多租戶電商平台同時維護一個 Django monolith 與一個 Flask webhook／checkout service。Django 負責後台、訂單與客服 API；Flask 負責第三方支付回呼、促銷計算與部分即時查詢。兩者都使用 PostgreSQL 與 Redis，前方有反向代理，Django 與 Flask 都以多 worker 的 WSGI 部署，另有背景 worker 處理通知與報表。

一次促銷活動部署後，30 分鐘內出現以下訊號：

- Django 與 Flask 的 P99 分別由 180 ms、220 ms 升至 5.8 s、4.9 s；502／504、client timeout 與重試增加。CPU 只有 52%，但 worker queue、PostgreSQL connection wait、Redis latency、RSS 與背景任務 backlog 同時上升。
- Django 新增的 middleware 先做昂貴的 request logging，認證與安全 headers 的順序未被記錄；部分未授權請求消耗了 ORM 查詢，某些 exception 已開始 response 後仍嘗試寫統一 JSON error。
- 訂單列表的 QuerySet 在 serializer 迴圈中 lazy evaluation，產生 N+1；另一個 view 使用過寬的 prefetch。部分 transaction 在 response 後仍由 signal 觸發通知，重試時造成重複 email 與 webhook。
- Redis cache key 沒有包含租戶與 permission scope，促銷結果偶爾跨租戶命中；cache stampede 使資料庫在失效時間點被打穿。新 migration 直接對大表建立索引，部署期間出現 lock wait 與 replica lag。
- DRF response serializer 把內部 provider reference、debug metadata 和可枚舉的權限欄位回傳；既有 client 依賴舊欄位和寬鬆型別。表單上傳只限制副檔名，沒有大小、內容與儲存配額。
- Flask 在改成 Application Factory 後，某 extension 仍在 import time 綁定全局 app；一個 Blueprint 被重複註冊，導致 endpoint collision 與部分版本路由順序改變。背景工作捕捉 request context 和 Flask-SQLAlchemy session，偶發 `Working outside of application context`，也有 connection 未歸還。
- Flask 的 error handler 在 streaming response 已開始後再次寫入 body；before_request、after_request、teardown 與 WSGI middleware 的順序沒有測試。signed-cookie session 過大造成 proxy header 問題，某環境誤開 debug，log 中也出現 bearer token。
- 團隊的第一反應是增加 worker、關閉 CSRF／validation、把 DB pool 和 timeout 調大並重啟。現有測試主要是 TestClient／Django client 的 happy path，沒有 tenant isolation、schema contract、migration rehearsal、context cleanup、慢下游、取消、重複投遞、壓測或 rolling drain 測試。

限制條件：

- 不能把重啟、單純增加 worker、關閉 validation／CSRF 或永久提高 timeout 當成唯一修復。
- 必須維持既有成功 API 的向後相容、租戶資料隔離、訂單冪等與通知可追蹤性。
- 第一階段必須先降低流量與資料外洩風險，所有改動都要有指標、警戒線與 rollback 條件。
- Assessment 內的方案應以理論、證據與決策為主，不需要提供程式碼。

## 作答要求

1. **建立事故因果鏈**：分別追蹤 Django 與 Flask 從入口、middleware／hook、認證、路由、輸入、ORM／session、cache、serializer、background work 到 response 的延遲、錯誤與資源成長；標記已知證據、合理假設與待驗證項目。
2. **比較框架責任邊界**：說明 Django 的整合式預設如何降低選擇成本，也說明 Flask 把 context、extension、Blueprint、session、錯誤和部署責任交給團隊後的風險；提出本平台哪些能力應共用契約、哪些可保留框架差異。
3. **修正 API 與安全契約**：重畫 request／response、版本、錯誤 envelope、pagination、content type、upload limit、session／token、CSRF／CORS、permission、tenant scope 與 OpenAPI 暴露策略；指出哪些 response 欄位必須移除或版本化。
4. **處理 Django lifecycle**：解釋 middleware onion、short-circuit、response-started、QuerySet evaluation、transaction、signal、DRF serializer、cache key／stampede 與 migration expand／contract 的正確邊界。
5. **處理 Flask lifecycle**：解釋 application／request context、Application Factory、extension init_app、Blueprint registration、before／after／teardown、SQLAlchemy session、error handler 與 streaming cleanup。
6. **建立容量與部署方案**：用 worker、DB／Redis pool、thread／background queue、cache、upload、P99、RSS、readiness、graceful shutdown 與 downstream quota 建立容量預算，指出增加 worker 的乘法效應。
7. **提出取證與測試矩陣**：至少列出 18 項證據或實驗，涵蓋 query／cache／pool、context／session cleanup、schema、auth／tenant、migration lock、signal／idempotency、streaming、slow downstream、worker、security、load 與 deployment drain。
8. **分階段交付**：至少三階段；每階段列出變更、成功指標、警戒線、rollback 條件與故障注入。第一階段必須能在不破壞相容性的前提下止血，後續才做架構與容量調校。

## 期待證據

- 能區分 authentication 與 authorization，指出 tenant／object scope 不能只靠登入 middleware；能遮罩 token、debug、provider reference 與敏感欄位。
- 能說明 Django middleware、Flask WSGI middleware、before／after／teardown、Blueprint hook、exception 和 response-started 的順序與短路。
- 能指出 QuerySet lazy evaluation、N+1、過度 prefetch、長 transaction、SQLAlchemy scoped session 與 connection pool wait 的關聯。
- 能說明 signal 不等於可靠的 commit 後投遞；需要 outbox、idempotency、transaction.on_commit 或 durable worker 來處理失敗與重複。
- 能區分 cache hit、cache correctness、stampede、TTL、失效、租戶／permission key 與 Redis 容量。
- 能以 migration expand／contract、鎖、backfill、舊版相容、replica lag、backup restore 和 rollback 來處理大表變更。
- 能說明 Flask context 與 extension resource 不能被背景工作無限期捕捉；每個 session、context、stream、upload 與 response 都要有 owner。
- 能量化 worker 數與每 worker 的 DB／Redis pool、thread／task queue、RSS 和 downstream quota，避免以增加 worker 掩蓋瓶頸。
- 能提出 contract／schema diff、integration、security、tenant isolation、context cleanup、query count、故障注入、壓測、soak 與 rolling drain 測試。
- 能提出至少三階段 rollout，使用 P99、5xx／4xx、pool wait、cache hit、lock wait、backlog、RSS、跨租戶錯誤與資料正確性設定停止線。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議重啟、增加 worker、關閉 CSRF／validation 或調大 timeout，沒有框架邊界、證據、資源 ownership 或 rollback。 |
| 1 | 能列出 Django、Flask、ORM、cache 或部署的部分名詞，但無法連成因果鏈，也沒有可驗證的安全與容量方案。 |
| 2 | 能指出主要 N+1、context／session、middleware、cache 或 migration 問題，提出部分修復，但遺漏至少兩個核心面向，例如租戶隔離、相容性、signal／冪等、部署 drain、測試證據或框架選型。 |
| 3 | 能整合 Django／Flask lifecycle、API／安全、資料一致性、cache、容量／部署、證據與分階段 rollback，並提出可執行的測試矩陣。 |
| 4 | 除上述內容外，能處理 response-started、lazy evaluation、cache stampede、migration lock、context ownership、extension isolation、慢客戶端／下游、租戶公平性、相容 schema 與逐步 rollout 的邊界條件。 |

評分時請分別檢查四個核心面向：**Django／資料一致性**、**Flask／資源生命週期**、**API／安全／租戶隔離**、**容量／部署／測試／選型**。

### 通過標準

整體總評達 **3/4 分**才通過；四個核心面向均不得低於 2 分，且答案必須提出至少一個可執行的 rollback 條件、至少一項 tenant isolation 測試，以及至少一項驗證 context／session cleanup、慢下游或 migration lock 的故障注入測試。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先把事故分成四條會互相放大的鏈：入口與 middleware／hook 邊界、資料存取與 transaction／cache、context／session／背景資源生命週期，以及 worker／pool／部署容量。已知證據包括 P99、502／504、worker queue、DB connection wait、Redis latency、RSS、N+1、cache key 缺租戶、migration lock、context error、重複 signal 與 response-started 後的二次寫入；worker 增加只是可能放大 DB、Redis、背景與下游壓力，不能直接當作原因或修復。要把 trace、query log、pool metrics、route map、cache key audit、tenant access log 和故障注入結果分開標記為已證實或待驗證。

第一階段先止血：限制促銷流量與每租戶併發，暫停有風險 migration，對 cache miss 熱點加短期 TTL／single-flight 或暫時 bypass 錯誤 cache，移除外部 response 的 provider／debug／權限欄位，關閉 debug，遮罩 token，強制 auth／tenant scope，讓 readiness 在 drain 時拒絕新流量；同時補上 trace、錯誤分類、P99、pool wait、cache hit、backlog、RSS 與跨租戶錯誤告警。保留舊 response contract 和 feature flag，若 5xx、跨租戶錯誤、P99、lock wait 或 backlog 超過門檻就回滾 flag、降低流量或恢復前一個 application 版本。

Django 方面，middleware 要有可文件化的 onion order：外層 trace／request ID 與例外邊界，接著安全 headers／CORS，再依路由需要做 session、authentication、authorization，最後才進 view；timeout 要傳遞 cancellation，response 已開始後不可再寫另一個 body。QuerySet evaluation 要落在清楚的 transaction 邊界，列表 API 先用 query count、EXPLAIN 與 schema 設計消除 N+1，依資料形狀選 select_related 或 prefetch，並限制頁面與欄位。cache key 必須包含租戶、permission scope、版本與輸入維度，設定 TTL、失效、stampede protection 和 payload 上限。signal 不應把非冪等通知偷偷綁在未提交 transaction；需要可靠送出就用 commit 後 outbox／durable worker、idempotency key 和可追蹤狀態。大表 migration 以 expand／backfill／contract 分階段，先確認舊版 application 可讀寫，控制 lock、replica lag、backfill rate，並預備 restore 與 deployment rollback。

Flask 方面，Application Factory 應負責載入並驗證 config、建立 app、以 init_app 初始化 extension、註冊 Blueprint 和 health／error boundary；extension 不應在 import time 捕捉單一 app。Blueprint 要集中註冊並驗證 route map、endpoint uniqueness、prefix 與版本順序。request context 與 application context 只在明確 scope 內有效，背景工作不能捕捉 request context 或 scoped session；背景任務必須建立自己的 app／DB scope，正常、例外和取消都要 teardown。WSGI middleware、before_request、after_request、teardown 的順序要以測試固定；streaming response 開始後只能中止或關閉，不能再寫 JSON error。session 要根據敏感度、撤銷需求、大小與跨 worker 選 signed cookie 或 server-side store，並設定 rotation、HttpOnly、Secure、SameSite 和 TTL。錯誤 handler 需統一 status、error type、correlation ID 和 log redaction，但不能以全局 handler 破壞 streaming 或已開始的 response。

API 與安全契約要跨框架一致：輸入／輸出模型分離，明確 content type、欄位型別、nullable／required、pagination、upload size／content、錯誤 envelope、版本與 idempotency。authentication 只確認身份，authorization 還要確認 tenant、object、scope 和 action；CSRF、CORS、session、token claims、rate limit、secret 與 audit log 要依 client 型態設計。schema diff 要阻止刪欄位、required 增加、型別收窄或錯誤格式改變，敏感欄位則應明確移除並以安全測試證明沒有回流。cache、DB 和背景通知都必須把租戶隔離與冪等放進 key／transaction／state machine。

容量模型要從硬限制反推：每個 Django／Flask worker 都可能有自己的 DB／Redis client pool、thread／background queue、cache 和 RSS；增加 worker 或 replica 會乘上這些上限。用 request trace 把 P99 拆成 parsing、middleware、ORM、cache、下游、serialization 和 response write；同時觀察 worker queue、DB／Redis pool wait、lock wait、background backlog、RSS、replica lag、錯誤率和 downstream quota。readiness 應在 rollout drain 時停止新流量，graceful shutdown 要排空可恢復工作；liveness 不應把慢 DB 當成必須重啟。worker、pool、timeout 和 autoscaling 要在固定 workload、下游配額與資料庫最大連線下共同調校。

取證和測試至少應包括：兩框架端到端 trace；middleware／hook short-circuit 和 response-started 測試；Django query count、EXPLAIN、lazy evaluation 與 transaction rollback；Flask context push／pop、extension isolation、session remove 與 background cleanup；cache key tenant／permission audit、miss stampede 和 eviction；migration plan、lock／replica lag、backup restore；signal commit／重試／冪等；DRF／Flask schema diff、錯誤 envelope 和相容 client；auth／CSRF／CORS／cookie／token redaction；upload size／content；streaming disconnect；慢 DB／Redis／第三方與 cancellation；worker／pool capacity；tenant mixed-load fairness；process kill／background recovery；rolling readiness／graceful drain；以及長時間 soak 觀察 query、connection、task、RSS 是否回收。每次實驗只改一個主要變因，保留 trace correlation 與 rollback evidence。

第二階段修正根因：修 middleware／hook order、輸入輸出契約、query／prefetch、cache key／stampede、Django signal outbox、migration 分段、Flask factory／extension／Blueprint registration、context／session ownership、streaming error boundary、session strategy 與 tenant authorization。以 integration、contract、security、故障注入、schema compatibility、query count 和 load test 逐步放量。第三階段才依證據調整 worker、DB／Redis pool、background concurrency、cache、autoscaling、shutdown grace period 和框架邊界；若 P99、pool wait、RSS、lock wait、backlog、跨租戶錯誤或資料重複超過停止線，就停止 rollout 並回到上一個可驗證版本。

</details>

## 常見失分點

- 把 Django 或 Flask 的框架預設當成完整安全保證，沒有區分 authentication、authorization、tenant scope 和 object permission。
- 只增加 worker、DB pool 或 timeout，忽略每個 worker 會複製連線、背景工作、cache 和記憶體容量。
- 把 QuerySet lazy evaluation、N+1、過度 prefetch 或長 transaction 當成單純 ORM 語法問題，沒有提供 query／lock 證據。
- 把 cache hit 當成正確性，忽略租戶／permission key、失效、stampede、eviction 和 stale data。
- 讓 signal 在 transaction 外偷偷發送不可重試的 side effect，沒有 outbox、commit boundary 或 idempotency。
- 在 Flask background task 捕捉 request context／SQLAlchemy session，或在 extension import time 綁定單一 app。
- 沒有固定 Blueprint registration、middleware／hook、error handler、teardown 與 streaming 的順序。
- 把 signed cookie 當成加密且可即時撤銷，忽略大小、secret rotation、cookie flags、replay 和 session fixation。
- 直接移除 response 欄位或收緊 validation，沒有 schema diff、版本、相容 client、警告期和 rollback。
- 只測試 happy path，沒有 tenant isolation、context cleanup、slow downstream、migration lock、重複投遞、壓測和 deployment drain。

## 延伸追問

1. 如果 Django 與 Flask 必須共用同一個 API contract，你會如何處理兩個 serializer／validation stack 的 nullable、coercion、錯誤 envelope 與 schema diff？
2. 如果促銷 cache 必須允許短時間 stale，但絕不能跨租戶，你會如何設計 key、TTL、失效、single-flight、權限與 audit？
3. 如果 migration lock 已經造成 replica lag，而舊版與新版 application 都在線，你會如何拆分 migration、backfill、停止線與 rollback？
4. 如果 Flask 背景任務需要使用 application config 但不能捕捉 request context，你會如何建立 app／DB scope、重試、取消與 shutdown drain？
5. 如果增加 worker 讓 web queue 下降卻讓 PostgreSQL pool wait 和第三方 429 上升，你會如何重新計算 worker、pool、bulkhead 與下游配額？
6. 如果既有 client 依賴某個敏感 response 欄位，你會如何建立 telemetry、版本化替代欄位、deprecation window 與回滾？
7. 如果 signal／webhook 已經可能重複發送，但資料庫交易不能回滾，你會如何定義 outbox state、idempotency key、reconciliation 與使用者可見狀態？
