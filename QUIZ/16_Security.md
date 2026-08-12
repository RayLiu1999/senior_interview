# Web／API Security - 重點考題 (Quick Quiz)

> 這份考題聚焦身份與授權、JWT、API 防護、CSRF 與 TLS，適合在閱讀安全文章後做快速回憶與口頭自測。

## 🔐 Web and API Security

<a id="q1"></a>
### Q1: Authentication 與 Authorization 有什麼差異？
<!-- Concept ID: concept.security.identity.authentication-authorization; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請從身份確認、權限決策、session／token、最小權限與租戶隔離說明兩者的責任邊界。

<details>
<summary>💡 答案提示</summary>

- Authentication 回答「你是誰」，authorization 回答「你能做什麼」；完成身份驗證不代表對所有資源都有權限。
- 權限決策應依 subject、resource、action、tenant、policy context 與 resource ownership，不能只把 user ID 放進 token 就信任。
- 事故診斷需串起登入、token、policy decision、resource access、audit log 與業務副作用，並優先阻止越權擴散。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Security/authentication_vs_authorization.md)

<a id="q2"></a>
### Q2: JWT 驗證有哪些安全邊界？
<!-- Concept ID: concept.security.token.jwt; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 signature、algorithm、issuer、audience、expiry、key rotation、refresh token 與撤銷策略。

<details>
<summary>💡 答案提示</summary>

- JWT payload 通常可被讀取，簽章主要保證完整性與來源；服務必須白名單限制演算法並驗證 issuer、audience、expiry、not-before 與 key ID。
- 短期 access token 可降低撤銷窗口；refresh token 需要 rotation、reuse detection、受控儲存與明確的 session revocation。
- 發現驗證錯誤或 token replay 時先撤銷／輪替受影響 key，保留 audit evidence，再修正 verifier 與權限邏輯。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Security/jwt_security.md)

<a id="q3"></a>
### Q3: API 安全如何建立分層防護？
<!-- Concept ID: concept.security.api.defense; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請從 authentication、authorization、input validation、rate limiting、CORS、secret management 與 audit 說明設計。

<details>
<summary>💡 答案提示</summary>

- API 安全要同時保護身份、資源權限、輸入／輸出、流量、跨來源、密鑰與可追溯性；單一 gateway 或 API key 不能取代 resource-level authorization。
- Rate limit 要依身份、租戶、endpoint、成本與風險設計，並定義拒絕、降級、重試與 abuse evidence。
- 錯誤訊息不能洩漏敏感資料；密鑰放在受控 secret store，audit log 要能支持事件回溯而不記錄 token／密碼本身。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Security/api_security.md)

<a id="q4"></a>
### Q4: CSRF 的成因與防禦邊界是什麼？
<!-- Concept ID: concept.security.web.csrf; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 cookie 自動攜帶、CSRF token、SameSite、Origin／Referer 與 XSS 之間的關係。

<details>
<summary>💡 答案提示</summary>

- CSRF 利用瀏覽器自動攜帶的身份憑證，讓受害者在不知情下執行有副作用的請求；純粹檢查「使用者已登入」不能防禦。
- 對 cookie session 使用不可預測且綁定 session 的 CSRF token，搭配 SameSite 與 Origin／Referer 驗證；高風險操作需重新驗證。
- SameSite 或 CSRF token 不能修復 XSS；要依攻擊面、憑證型態、瀏覽器行為與 audit evidence 分層處理。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Security/csrf_attack.md)

<a id="q5"></a>
### Q5: HTTPS／TLS 如何建立傳輸安全？
<!-- Concept ID: concept.security.transport.tls; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明憑證鏈、hostname 驗證、握手、密鑰交換、TLS termination 與憑證輪替的故障診斷方式。

<details>
<summary>💡 答案提示</summary>

- TLS 用憑證與信任鏈驗證對端身份，再協商 session key 保護後續資料；HTTPS 不會自動保證應用層授權或資料正確性。
- 應禁用過時協定與弱 cipher，明確管理 SNI、hostname、trust store、private key、termination proxy 與內部 mTLS 邊界。
- TLS 事故要查握手錯誤、憑證有效期／鏈、SNI、client compatibility、proxy log、延遲與部署版本，不要直接關閉驗證。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Security/https_tls_ssl.md)

<a id="q6"></a>
### Q6: OWASP Top 10 應如何與 threat modeling 及修復優先級連結？
<!-- Concept ID: concept.security.owasp.top-10; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請從資產、信任邊界、攻擊者能力、可利用性、影響範圍、偵測證據與回滾方案說明如何使用 OWASP Top 10。

<details>
<summary>💡 答案提示</summary>

- OWASP Top 10 是風險分類與溝通工具，不是按清單逐項打勾就完成 threat modeling；應把類別映射到具體資產、入口、信任邊界與攻擊路徑。
- 修復優先級要考慮可利用性、資料敏感度、租戶影響、業務副作用、偵測能力與暴露時間，而不是只看掃描器嚴重度。
- 每項修復都要有可重現的負向測試、監控證據、分階段 rollout 與安全 rollback，並保留事件取證。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Security/owasp_top_10.md)

<a id="q7"></a>
### Q7: 密碼儲存如何抵抗離線猜測與資料庫外洩？
<!-- Concept ID: concept.security.password.storage; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較密碼雜湊、加鹽、work factor、pepper 與加密，並說明如何升級參數及處理密碼資料庫外洩。

<details>
<summary>💡 答案提示</summary>

- 密碼應使用專為密碼設計的慢速、可調成本雜湊；每筆密碼使用唯一 salt，不能用 MD5／SHA-1 等快速雜湊取代。
- Work factor 要依硬體與登入流量校準並可逐步升級；pepper 若使用，應放在受控 secret store 並設計輪替與失效處置。
- 外洩後要保留證據、評估離線猜測風險、強制重設或重新雜湊、撤銷 session／token，且不能記錄或回收明文密碼。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Security/password_storage.md)

<a id="q8"></a>
### Q8: 安全標頭如何形成瀏覽器端的縱深防禦？
<!-- Concept ID: concept.security.headers; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 CSP、HSTS、X-Frame-Options、Content-Type 與 Referrer-Policy 的威脅模型、部署順序與驗證方式。

<details>
<summary>💡 答案提示</summary>

- CSP 限制腳本與資源來源，HSTS 強制後續使用 HTTPS，frame／content-type／referrer 標頭則分別縮小嵌入、嗅探與資訊洩漏風險；它們不能互相取代。
- 先以 report-only、低風險路徑與相容性觀測建立基線，再逐步收緊 policy；要處理 CDN、第三方資源、舊版瀏覽器與子網域影響。
- 驗證應包含實際 response headers、CSP violation report、瀏覽器行為、TLS 狀態與錯誤率，並有可逆的 rollback，而非直接刪除防護。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Security/security_headers.md)

<a id="q9"></a>
### Q9: SQL Injection 的根因與有效防禦邊界是什麼？
<!-- Concept ID: concept.security.injection.sql; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請從 SQL 結構與資料值的邊界，說明參數化查詢、動態識別字白名單、ORM、最小權限與 WAF 的取捨。

<details>
<summary>💡 答案提示</summary>

- SQL Injection 的核心是非可信輸入改變了 SQL 結構；參數化查詢讓值保持資料，動態 table／column／sort 欄位則需要嚴格白名單。
- ORM 可能降低風險但不會自動保護 raw query；WAF 是補充偵測與緩解，不能取代安全查詢、資料庫最小權限與錯誤脫敏。
- 修復要用惡意與邊界 payload 做負向測試，檢查 query／database audit、錯誤回應、權限與資料存取對帳，並保留 rollback 與取證。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Security/sql_injection.md)

<a id="q10"></a>
### Q10: XSS 的輸出 context 與防禦措施如何配對？
<!-- Concept ID: concept.security.xss; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請比較 reflected、stored、DOM-based XSS，並說明輸出編碼、HTML 清理、CSP、cookie 屬性與 CSRF 的邊界。

<details>
<summary>💡 答案提示</summary>

- 先追蹤 source 到 sink，再依 HTML、attribute、URL、script 或富文字 context 使用對應的 output encoding／sanitization；單一全域過濾通常不可靠。
- CSP 可降低 exploit 影響，HttpOnly／Secure／SameSite 可縮小 cookie 風險，但都不能取代正確輸出編碼，也不能把 XSS 當成 CSRF 修復。
- 驗證需包含 stored／reflected／DOM 負向案例、CSP report、瀏覽器行為、session 影響與回歸測試，並確認修復沒有轉移到另一個 sink。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Security/xss_attack.md)
