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
