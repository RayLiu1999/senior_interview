# Web Security Breach Incident：從身份越權到 API 與 TLS 恢復

- **Assessment ID**: `assessment.security.web-breach.api-incident.v1`
- **主要 Concept ID**: `concept.security.identity.authentication-authorization`
- **次要 Concept IDs**:
  - `concept.security.token.jwt`
  - `concept.security.api.defense`
  - `concept.security.web.csrf`
  - `concept.security.transport.tls`
- **對應文章**:
  - [身份驗證與授權](../../05_Specialized_Topics/Security/authentication_vs_authorization.md)
  - [JWT 原理與安全實踐](../../05_Specialized_Topics/Security/jwt_security.md)
  - [API 安全性最佳實踐](../../05_Specialized_Topics/Security/api_security.md)
  - [CSRF 跨站請求偽造](../../05_Specialized_Topics/Security/csrf_attack.md)
  - [HTTPS 與 TLS／SSL](../../05_Specialized_Topics/Security/https_tls_ssl.md)
- **題型**: `安全事故診斷`, `身份與授權`, `API 防護`, `恢復取捨`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 35 分鐘
- **標籤**: `Web Security`, `Authentication`, `Authorization`, `JWT`, `CSRF`, `TLS`, `Incident Response`
- **Learning Objective IDs**:
  - `concept.security.identity.authentication-authorization/LO-1`
  - `concept.security.identity.authentication-authorization/LO-2`
  - `concept.security.identity.authentication-authorization/LO-3`
  - `concept.security.token.jwt/LO-1`
  - `concept.security.token.jwt/LO-2`
  - `concept.security.token.jwt/LO-3`
  - `concept.security.api.defense/LO-1`
  - `concept.security.api.defense/LO-2`
  - `concept.security.api.defense/LO-3`
  - `concept.security.web.csrf/LO-1`
  - `concept.security.web.csrf/LO-2`
  - `concept.security.web.csrf/LO-3`
  - `concept.security.transport.tls/LO-1`
  - `concept.security.transport.tls/LO-2`
  - `concept.security.transport.tls/LO-3`

## 測驗目標

- 能從登入、token、權限決策、API request、browser cookie、TLS handshake 與 audit evidence 建立安全事故時間線。
- 能排序越權、token replay、API abuse、CSRF 與 TLS／憑證問題的風險，提出不擴大資料外洩的短期緩解。
- 能設計 resource-level authorization、JWT verifier、API rate limit、CSRF defense、TLS policy 與 key／certificate rotation。
- 能在保留取證、可用性、使用者體驗與回復速度的前提下驗證修復有效性。

## 問題情境與限制條件

某 SaaS 管理平台最近出現跨租戶資料讀取。初步證據顯示：API gateway 只驗證 JWT signature，部分下游服務直接信任 payload 中的 tenant ID；一個管理 endpoint 只檢查 role，沒有再次確認 resource ownership。refresh token 長期有效且未做 reuse detection，access token 會被完整寫入 debug log。

同一週，瀏覽器 session cookie 被設為可跨站攜帶但付款 API 沒有 CSRF token；外部掃描看到大量異常 POST。TLS 憑證輪替後，部分舊 client 出現 handshake failure，團隊想暫時關閉 hostname／certificate verification、刪除 log、全量撤銷所有使用者 session，並直接放寬 API rate limit 讓客服操作恢復。

限制：不能刪除或竄改取證資料，不能以關閉 TLS 驗證或永久放寬權限換取可用性；必須處理已暴露 token、可能的資料外洩、付款副作用與舊 client 相容性，並說明何時能恢復正常流量。

## 作答要求

1. **建立時間線與範圍**：列出至少十二項要查的 identity、JWT、API、browser、TLS、部署、log、資料庫與業務證據，並區分已證實、待驗證與假設。
2. **風險排序與短期緩解**：排序跨租戶讀取、管理 endpoint 越權、token replay、CSRF、API abuse 與 TLS failure，說明隔離、撤銷、key rotation、限流與安全降級順序。
3. **修復身份與授權**：設計 issuer／audience／expiry／algorithm 驗證、refresh rotation、resource ownership、tenant isolation、最小權限與高風險操作再驗證。
4. **修復 API 與瀏覽器邊界**：提出 rate limit、input／output policy、CORS、CSRF token、SameSite、Origin／Referer、audit redaction 與錯誤回應策略。
5. **修復 TLS 與憑證治理**：說明 trust chain、hostname、SNI、termination point、版本／cipher policy、憑證輪替與舊 client 相容方案。
6. **驗證與回復**：提出至少十項安全測試、故障注入、log／audit 檢查或 canary rollout 證據，證明越權、重放、CSRF、TLS 與 abuse 防護有效。

## 期待證據

- 能指出 authentication 成功不代表 authorization 成功，且 tenant／resource ownership 必須由服務端以可信資料重新判斷。
- 能把完整 JWT 出現在 log 視為 credential incident，先限制影響、撤銷／輪替 key 或 token，再保留存取與事件證據。
- 能說明 rate limit 只能降低 abuse 速率，不能取代身份、資源授權、輸入驗證與資料最小化。
- 能以 cookie、CSRF token、SameSite、Origin／Referer 與 XSS 邊界解釋瀏覽器攻擊面，避免宣稱單一 header 可解決所有問題。
- 能在 TLS 憑證事故中保留 hostname／chain 驗證，透過正確憑證、trust store、SNI、版本協商與相容性 canary 修復，而不是關閉驗證。
- 能用 cross-tenant test、token replay、refresh reuse、audit redaction、CSRF simulation、TLS handshake matrix、rate-limit telemetry 與業務對帳驗證恢復。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 方案會繼續允許越權或 token replay，並以關閉 TLS／權限驗證或刪除證據作為主要修復。 |
| 1 | 能列出 JWT、CSRF、TLS、rate limit 等名詞，但沒有風險排序、可信授權邊界或事故回復證據。 |
| 2 | 能提出部分 token rotation、resource authorization 或 CSRF／TLS 修正，但遺漏資料外洩取證、API abuse、瀏覽器邊界或相容性中的至少一項。 |
| 3 | 能完成可執行的事故隔離、身份／授權修復、API／CSRF 防護、TLS 治理與分階段驗證回復。 |
| 4 | 除上述內容外，能處理部分 key 已被複製、跨租戶資料對帳、舊 client 過渡、緩解措施副作用、攻擊者持續存在與可量化的 residual risk。 |

### 通過標準

總分達 **3/4 分**才通過；identity／authorization、API／browser defense、TLS／incident recovery 三個核心面向均不得低於 2 分。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先停止受影響 endpoint 的高風險操作，保留 gateway、service、identity provider、JWT key、audit、TLS proxy、WAF 與資料存取證據；不要刪除 log，也不要全量放寬 rate limit。依 tenant、subject、resource、operation ID、token ID、IP、client version 與時間窗口查出已讀取或修改的資料，將確定外洩、待確認與未受影響範圍分開。

短期撤銷／輪替受影響 signing key、refresh token 與暴露的 session，阻擋可疑 token／client／endpoint，對跨租戶與管理操作啟用 fail-closed 的 resource-level authorization。JWT verifier 要白名單演算法並驗證 issuer、audience、expiry、not-before、key ID；下游不能直接信任未驗證 claims。對付款或不可逆操作以 idempotency key、狀態查詢與對帳避免重複副作用。

瀏覽器 session 要使用正確的 SameSite、Secure、HttpOnly 與 CSRF token／Origin 檢查，並保留 XSS 的獨立修復計畫。API rate limit 依身份、租戶、endpoint、風險與成本分層，錯誤回應不洩漏敏感資料，audit log 脫敏但保留可追溯關聯。TLS 方面修復正確 certificate chain、hostname、SNI、trust store 與版本／cipher policy，以 client compatibility matrix 和小流量 canary 排查舊 client，不可關閉驗證。

長期建立 key／certificate rotation、refresh reuse detection、權限 policy review、cross-tenant regression、secret／token redaction、持續 abuse detection 與資料存取對帳。恢復前以測試 tenant 和受控流量驗證所有核心路徑，再逐步放量，持續觀察越權嘗試、token reuse、CSRF rejection、TLS handshake、rate-limit decision、錯誤率與業務正確性。

</details>

## 常見失分點

- 把 JWT signature 通過當成完整授權，沒有驗證 issuer、audience、expiry、tenant 與 resource ownership。
- 發現 token 出現在 log 後只刪 log，沒有撤銷／輪替憑證、檢查存取範圍與做資料對帳。
- 把 rate limit、CORS 或 SameSite 任一措施當成完整 API 安全方案。
- 為修復 TLS 相容性直接關閉 hostname／certificate verification。
- 全量撤銷 session 或全量封鎖流量，卻沒有風險分層、取證、使用者恢復與付款副作用處理。

## 延伸追問

1. 如果 signing key 可能已被複製但無法確定攻擊者是否使用，如何設計 rotation、token revocation 與過渡窗口？
2. 如果跨租戶資料已被讀取但 audit log 不完整，如何利用資料庫、gateway、trace 與業務對帳重建影響範圍？
3. 如果舊版 mobile client 不支援新的 TLS policy，你會如何設計有限期相容方案與淘汰門檻？
4. 如果 CSRF token 修復後仍有疑似付款重複，如何區分重放、retry、使用者重試與後端狀態機錯誤？
