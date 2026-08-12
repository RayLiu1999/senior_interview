# Security Testing Quality Incident：從威脅模型到測試品質回復

- **Assessment ID**: `assessment.security-testing.quality-incident.v1`
- **主要 Concept ID**: `concept.testing.security-testing`
- **次要 Concept IDs**:
  - `concept.security.owasp.top-10`
  - `concept.security.password.storage`
  - `concept.security.headers`
  - `concept.security.injection.sql`
  - `concept.security.xss`
  - `concept.testing.chaos-engineering`
  - `concept.testing.contract-testing`
  - `concept.testing.integration-testing`
  - `concept.testing.performance-testing`
  - `concept.testing.regression-testing`
  - `concept.testing.tdd-bdd`
  - `concept.testing.pyramid`
  - `concept.testing.unit-testing-mocking`
- **對應文章**:
  - [OWASP Top 10 概覽](../../05_Specialized_Topics/Security/owasp_top_10.md)
  - [密碼儲存最佳實踐](../../05_Specialized_Topics/Security/password_storage.md)
  - [常見的安全標頭](../../05_Specialized_Topics/Security/security_headers.md)
  - [SQL Injection 攻擊與防禦](../../05_Specialized_Topics/Security/sql_injection.md)
  - [XSS 跨站腳本攻擊](../../05_Specialized_Topics/Security/xss_attack.md)
  - [混沌工程](../../05_Specialized_Topics/Testing/chaos_engineering.md)
  - [契約測試](../../05_Specialized_Topics/Testing/contract_testing.md)
  - [整合測試](../../05_Specialized_Topics/Testing/integration_testing.md)
  - [性能測試](../../05_Specialized_Topics/Testing/performance_testing.md)
  - [回歸測試](../../05_Specialized_Topics/Testing/regression_testing.md)
  - [安全性測試](../../05_Specialized_Topics/Testing/security_testing.md)
  - [TDD vs. BDD](../../05_Specialized_Topics/Testing/tdd_vs_bdd.md)
  - [測試金字塔](../../05_Specialized_Topics/Testing/testing_pyramid.md)
  - [單元測試、模擬與樁](../../05_Specialized_Topics/Testing/unit_testing_and_mocking.md)
- **題型**: `威脅模型`, `安全測試`, `測試架構`, `品質事故診斷`, `漸進式回復`
- **難度**: 10
- **重要程度**: 5
- **建議作答時間**: 45 分鐘
- **標籤**: `Security`, `OWASP`, `SQL Injection`, `XSS`, `Security Headers`, `Password Storage`, `Contract Testing`, `Integration Testing`, `Performance`, `Chaos Engineering`, `Test Flakiness`, `Rollback`
- **Learning Objective IDs**:
  - `concept.security.owasp.top-10/LO-1`
  - `concept.security.owasp.top-10/LO-2`
  - `concept.security.owasp.top-10/LO-3`
  - `concept.security.password.storage/LO-1`
  - `concept.security.password.storage/LO-2`
  - `concept.security.password.storage/LO-3`
  - `concept.security.headers/LO-1`
  - `concept.security.headers/LO-2`
  - `concept.security.headers/LO-3`
  - `concept.security.injection.sql/LO-1`
  - `concept.security.injection.sql/LO-2`
  - `concept.security.injection.sql/LO-3`
  - `concept.security.xss/LO-1`
  - `concept.security.xss/LO-2`
  - `concept.security.xss/LO-3`
  - `concept.testing.chaos-engineering/LO-1`
  - `concept.testing.chaos-engineering/LO-2`
  - `concept.testing.chaos-engineering/LO-3`
  - `concept.testing.contract-testing/LO-1`
  - `concept.testing.contract-testing/LO-2`
  - `concept.testing.contract-testing/LO-3`
  - `concept.testing.integration-testing/LO-1`
  - `concept.testing.integration-testing/LO-2`
  - `concept.testing.integration-testing/LO-3`
  - `concept.testing.performance-testing/LO-1`
  - `concept.testing.performance-testing/LO-2`
  - `concept.testing.performance-testing/LO-3`
  - `concept.testing.regression-testing/LO-1`
  - `concept.testing.regression-testing/LO-2`
  - `concept.testing.regression-testing/LO-3`
  - `concept.testing.security-testing/LO-1`
  - `concept.testing.security-testing/LO-2`
  - `concept.testing.security-testing/LO-3`
  - `concept.testing.tdd-bdd/LO-1`
  - `concept.testing.tdd-bdd/LO-2`
  - `concept.testing.tdd-bdd/LO-3`
  - `concept.testing.pyramid/LO-1`
  - `concept.testing.pyramid/LO-2`
  - `concept.testing.pyramid/LO-3`
  - `concept.testing.unit-testing-mocking/LO-1`
  - `concept.testing.unit-testing-mocking/LO-2`
  - `concept.testing.unit-testing-mocking/LO-3`

## 測驗目標

- 能從威脅模型、測試結果、production telemetry、部署差異與 audit evidence 建立安全品質事故時間線。
- 能區分 SQL Injection、XSS、標頭缺失、密碼儲存風險、契約破壞、整合失敗、效能回歸與測試 flake 的責任邊界。
- 能設計從單元、契約、整合、回歸、安全、效能到混沌的分層驗證，並說明每一層提供的信心與限制。
- 能在保留取證、使用者安全、服務可用性與資料相容性的前提下，提出可觀測、可驗證、可回滾的修復計畫。

## 問題情境與限制條件

某 SaaS 訂單平台發布 `2026.08` 版本後，出現一組互相交疊的品質訊號：管理者搜尋 API 的 DAST 發現疑似 SQL Injection；客服備註在另一個頁面出現 stored XSS；同一組 response 經 CDN 後缺少 CSP 與 HSTS。WAF 目前只擋住部分 payload，團隊無法證明所有資料庫查詢都使用參數化方式。

安全盤點又發現部分帳號仍使用舊的快速雜湊，登入時才會嘗試升級；升級失敗會被一般錯誤計數吞掉，沒有清楚的 audit event。這次部署沒有明文密碼，但測試 fixture 與 debug log 可能包含可用於離線猜測的舊 hash 與使用者識別資訊。

同一版本的 provider 將訂單狀態由字串改成新的 enum 值，consumer-driven contract 因為只驗證 schema 欄位存在而通過；實際 consumer 對未知狀態會走錯誤分支。整合測試共用一個資料庫和固定時間，CI 失敗率上升但團隊以重跑三次後通過作為綠燈。單元測試 coverage 為 98%，卻大量 mock 內部呼叫，沒有覆蓋 SQL query、輸出 context、真實 transaction 或 header 經 CDN 後的結果。

發布後 p95 latency 從 180ms 升到 650ms，p99 升到 2.8s；搜尋流量增加時資料庫 CPU、連線等待與錯誤率同步上升。一次未充分隔離的 chaos 實驗在 canary 期間注入 downstream timeout，觸發 queue backlog；實驗沒有明確的 kill switch，團隊不確定 backlog 是產品回歸、環境容量不足還是實驗殘留。

限制條件如下：

- 不得刪除或改寫既有掃描、測試、部署、存取與 audit 證據；不得以「重跑直到通過」消除 flake。
- 不得關閉 WAF、CSP／HSTS、資料庫權限或安全測試來換取可用性；也不能把 coverage 98% 當成安全通過證據。
- 不得回收或記錄明文密碼；密碼升級、session 處置、資料對帳與通知必須可追蹤且可分階段執行。
- 資料庫 schema 已被部分新版本使用，rollback 必須考慮舊版相容性；所有生產故障注入都必須可停止且有明確爆炸半徑。

## 作答要求

1. **建立事故模型與時間線**：列出至少 15 項需要保留或查詢的證據，區分已證實、待驗證與假設，並畫出資產、信任邊界、consumer／provider、測試環境與 production path。
2. **風險排序與短期隔離**：排序 SQL Injection、XSS、缺少安全標頭、舊密碼 hash、契約破壞、效能退化、queue backlog 與 CI flake；說明第一小時內的 endpoint、流量、帳號、feature flag 與 canary 措施。
3. **提出 AppSec 修復與測試**：說明參數化查詢及識別字白名單、context-aware output encoding／sanitization、CSP／HSTS 發布、密碼雜湊升級與外洩後處置，並為每一項配對負向測試和可觀測證據。
4. **重建測試架構**：設計 unit、contract、integration、regression、security、performance、chaos 與少量端對端測試的責任分層；指出哪些現有測試是虛假信心或環境耦合。
5. **診斷 flake、coverage 與效能**：提出不靠無限 retry 的 flake 分類流程，說明 coverage 的限制，並用 percentile、throughput、error rate、DB／queue／runtime 指標驗證效能回歸根因。
6. **處理契約與部署相容性**：設計 provider verification、consumer state、相容性規則、版本 promotion、資料庫 migration 與舊版 rollback 的閘門。
7. **設計混沌實驗復原**：說明如何停止目前實驗、確認 queue backlog 的來源、定義穩態假設、爆炸半徑、kill switch 與後續可重現的 chaos runbook。
8. **驗證與恢復**：提出至少 12 項 release／canary／回歸證據與通過門檻，說明何時可以逐步恢復流量，以及什麼條件會觸發 rollback 或暫停發布。

## 期待證據

- 能把 OWASP 類別落到具體資產、入口、信任邊界、攻擊者能力、影響與 remediation owner，而不是只列出十大分類。
- 能以 query trace／database audit／負向 payload 驗證 SQL Injection 修復，並指出 ORM 或 WAF 不能單獨取代參數化查詢與最小權限。
- 能依 HTML、attribute、URL、script、富文字等輸出 context 選擇 encoding／sanitization，並以 CSP report、瀏覽器行為與 session 影響驗證 XSS 修復。
- 能在 origin、CDN、proxy、browser 多個層級檢查 CSP／HSTS 等標頭，使用 report-only、相容性觀測、逐步 rollout 與可逆 rollback。
- 能區分舊 hash、salt、work factor、pepper 與加密，提出不暴露明文的 rehash／強制重設、session revocation、監控與 audit 設計。
- 能指出 schema validation 通過不代表 consumer 行為相容，並提出契約 diff、provider state、consumer verification、broker promotion 與版本回復證據。
- 能讓整合測試使用隔離且可重建的資料與依賴，並使用 trace、依賴 log、transaction、時間與清理結果診斷失敗。
- 能以單元測試驗證業務規則與錯誤邊界，減少對內部呼叫的過度 mock，並用 mutation／failure quality 補充 coverage。
- 能用測試金字塔解釋測試層級取捨，納入契約、安全、效能與混沌的風險維度，而不是追求固定比例。
- 能使用真實流量模型和 p50／p95／p99、throughput、error rate、CPU、memory、GC、DB pool、queue 等證據定位效能瓶頸。
- 能將 regression test selection、flake 分類、缺陷逃逸、test history、production telemetry 與 release gate 連在一起。
- 能用穩態指標、最小爆炸半徑、注入假設、停止條件、kill switch、復原時間與資料正確性判斷 chaos 實驗是否安全。
- 能保留所有取證，在 canary、feature flag、migration 相容性、rollback 與逐步放量中明確列出 go／no-go 門檻。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 方案會忽略或掩蓋 SQL Injection／XSS／密碼風險，刪除證據、關閉安全防護、無限重跑 flaky 測試，或在無 kill switch 下繼續擴大故障注入。 |
| 1 | 能列出部分安全或測試名詞，但沒有 threat model、分層測試責任、可驗證證據、效能根因或 rollback 門檻。 |
| 2 | 能提出部分參數化查詢、CSP、密碼升級、契約或整合測試修正，但遺漏至少兩個核心邊界，例如 flake／coverage、效能／混沌、取證／資料相容性。 |
| 3 | 能完成風險排序、AppSec 修復、分層測試、flake 與效能診斷、契約／migration 相容性、可控 chaos 與分階段恢復，且每一項都有證據與停止條件。 |
| 4 | 除上述內容外，能處理部分 hash 已被離線複製、CDN 與 origin policy 漂移、未知 enum 的 forward／backward compatibility、測試污染、尾端延遲與 queue recovery 的交互影響，並量化 residual risk 與後續品質投資。 |

### 通過標準

總分達 **3/4 分**才通過；以下四個核心面向均不得低於 2 分：

1. **Threat modeling 與 AppSec 修復**：OWASP、SQLi、XSS、headers、password 的風險與驗證。
2. **測試架構與品質信號**：unit、contract、integration、regression、security、pyramid、flake、coverage。
3. **非功能與韌性驗證**：performance、capacity、chaos、queue／dependency failure 與可觀測性。
4. **交付與事故回復**：canary、migration compatibility、rollback、取證、風險接受與逐步放量。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先凍結受影響搜尋、備註與密碼升級路徑的擴大 rollout，保留 DAST／SAST／dependency、CI、contract、CDN、WAF、database audit、query、access、deploy、queue、metrics、trace 與 chaos 事件。建立以 release version、request ID、user／tenant、query fingerprint、CSP violation、provider／consumer version、test run 與時間窗口為索引的時間線；將已證實、待驗證與假設分開，不能刪 log 或用重跑覆蓋失敗證據。

威脅模型應先畫出使用者、客服、管理 API、搜尋資料庫、瀏覽器、CDN／origin、provider／consumer、queue 與 CI runner 的信任邊界。優先處理可被遠端利用且可能讀寫跨租戶資料的 SQL Injection 與 stored XSS，其次處理缺失的 CSP／HSTS、舊 password hash、破壞性契約與效能／queue 退化。WAF 可暫時阻擋已知 payload，但不能當成 SQL 修復；對高風險 endpoint 可限流、縮小 query capability、停用非必要 filter 或只讀降級，同時保留安全 audit。

SQL Injection 的修復要讓所有資料值使用參數化查詢；排序欄位、table、column 等不能參數化的 SQL 結構必須使用固定白名單，並移除未審查的 raw query。資料庫帳號要最小權限，錯誤回應要脫敏。用惡意 payload、編碼變形、空值、Unicode、排序欄位與權限邊界做負向測試，對照 query trace、database audit、WAF decision、錯誤率與資料存取對帳。

XSS 要追 source 到 sink，依 HTML、attribute、URL、script 與富文字 context 使用對應的 output encoding 或經驗證的 sanitizer；不要只做全域字串過濾。對 stored、reflected、DOM-based 路徑建立回歸案例，檢查 CSP report、瀏覽器執行結果、cookie 影響與高風險 session。CSP、HttpOnly、Secure、SameSite 是縱深防禦，不能替代正確輸出處理，也不能把 XSS 和 CSRF 混為一談。

安全標頭要在 origin、CDN、proxy 與實際瀏覽器 response 逐層比對，先以 report-only 或小流量 canary 建立 CSP 資源基線，再逐步收緊 script、frame、object、connect 與第三方來源。HSTS 必須確認 TLS、子網域與回滾影響；標頭 policy 應進入 contract／integration／security regression，而不是只在單元測試檢查設定物件。任何 policy 漂移都要有版本、CSP violation、錯誤率與 rollback 證據。

密碼流程應盤點 hash algorithm、salt、work factor、pepper 使用方式與升級失敗率。對可疑舊 hash 要限制登入風險、要求重設或在成功驗證後以受控方式 rehash，不記錄明文密碼；必要時撤銷 session／refresh token、通知使用者並監控異常登入。把 hash fixture 與識別資訊視為敏感 evidence，限制存取與保留期限，不能只因沒有明文就判斷沒有 credential incident。

測試策略要按風險重新分層。單元測試保留純業務規則、輸入邊界與錯誤處理，移除只斷言內部呼叫順序的過度 mock；用 mutation 或故意注入錯誤檢查測試信號。契約測試要捕捉 consumer 真正依賴的 enum、錯誤與語意，provider 要在 consumer state 上驗證，並用相容性規則阻止未知 enum 破壞舊 consumer。整合測試要使用隔離資料庫／依賴、固定時鐘與明確清理，驗證 query、transaction、header 經 CDN 的實際結果。

回歸測試依變更 diff、資產風險與關鍵旅程做 smoke、targeted、full 與 canary 選擇；SQLi、XSS、password、headers、契約和 migration 都要有可重現的 security regression。Coverage 98% 只能說明執行到部分程式碼，不能證明安全行為；要搭配 failure quality、mutation、缺陷逃逸、歷史 flake 與 production telemetry。每個 flaky case 保留第一次失敗、環境、seed、trace 與重現率，隔離但不靜默通過，並設定修復期限與 release policy。

效能測試要重現搜尋的真實流量、資料選擇性、讀寫比例與併發，分開 load、stress、spike、soak，先設定 p95／p99、throughput、error rate 與容量門檻。用 CPU、memory、GC、DB CPU、connection wait、query plan、queue depth、downstream latency 和錯誤類型判斷是查詢回歸、連線池、容量或依賴 timeout；不能只看平均延遲。調查期間限制流量並保留基線，修復後以同一 workload、版本與資料集比較。

先停止未受控的 chaos 實驗，啟用 kill switch，確認 backlog 是否仍在增長，區分 downstream timeout 注入、產品變更、consumer contract、worker capacity 與清理殘留。重新設計實驗：寫出穩態假設、單一故障、最小爆炸半徑、值班 owner、停止條件、queue／資料正確性 guardrail 與回復步驟；只在 canary 或隔離環境先重跑，確定可觀測與可停止後才擴大。

恢復採 immutable artifact、相容 migration、feature flag 與小比例 canary。先部署查詢／輸出／header／密碼修復和測試閘門，完成安全負向測試、provider verification、隔離整合測試、performance baseline、chaos dry run 與 audit redaction，再逐步放量。若任一核心門檻出現跨租戶資料、可執行 payload、CSP／HSTS 漂移、未知 enum、p99 超標、queue 無法回復、flake rate 上升或 rollback evidence 缺失，就停止 promotion；只有在錯誤率、延遲、資料正確性、安全 finding、契約、queue 與 user journey 指標連續穩定後才恢復正常流量。

</details>

## 常見失分點

- 只列 OWASP 名稱或只跑掃描，沒有把資產、信任邊界、攻擊路徑與測試證據連起來。
- 以 WAF、ORM、CSP、HttpOnly、HSTS 或 coverage 任一單項宣稱 SQLi／XSS／整體安全已解決。
- 把舊 password hash 當成不敏感資料，或提出記錄／寄送明文密碼的重設方案。
- 只驗證 provider schema，沒有檢查 consumer 對 enum、錯誤回應與版本相容性的實際行為。
- 用 shared database、固定時間、無清理的整合測試產生不穩定結果，卻以 retry 三次當成品質證據。
- 將 98% coverage 當成測試充分，忽略過度 mock、mutation、缺陷逃逸與安全負向案例。
- 只看平均 latency，沒有看 p95／p99、throughput、error rate、DB pool、queue 與 downstream 指標。
- 在沒有穩態指標、kill switch、爆炸半徑與回復條件時執行 chaos，或把 backlog 直接歸因於某一個服務。
- 為快速恢復而刪除 scan／CI 證據、關閉安全標頭／WAF、無限重跑 flaky tests 或跳過 rollback 相容性。
- 沒有明確 go／no-go 門檻、canary、feature flag、資料對帳與 residual risk owner 就恢復全量流量。

## 延伸追問

1. 如果 SQL query log 不完整但資料庫 audit 顯示大量異常讀取，你會如何重建影響範圍並通知租戶？
2. 如果 CSP 收緊後有一個關鍵第三方支付資源被阻擋，如何在不撤掉整個 policy 的情況下做相容性修復？
3. 如果 password hash 已被複製但沒有證據顯示離線破解，你會如何安排強制重設、session revocation、通知與監控順序？
4. 如果 provider 必須支援舊 consumer 兩個月，而新 enum 無法被舊版本理解，如何設計 contract、版本與資料轉換？
5. 如果 flaky integration test 只在高並行 CI 出現，你會如何區分資料污染、時鐘、資源飽和與真正的競態？
6. 如果 p99 超標但平均 latency 正常，哪些 queue、connection pool、GC、query plan 或 downstream evidence 會改變你的判斷？
7. 如果 chaos 實驗暴露出 queue 無法回復，但停止實驗會留下未處理訊息，你會如何安全地 drain、重放與驗證資料正確性？
8. 如果所有測試都通過但 canary 的 CSP violation、未知 enum 與 p99 同時上升，你會選擇 rollback 哪個 artifact，如何避免只回滾應用卻留下不相容 migration？
