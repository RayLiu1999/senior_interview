# Cookie vs Session vs Token 認證機制

- **難度**: 5
- **重要程度**: 5
- **標籤**: `Cookie`, `Session`, `Token`, `JWT`, `認證`, `有狀態 vs 無狀態`

## 問題詳述

HTTP 是無狀態協定，伺服器無法區分連續請求是否來自同一個使用者，因此需要額外機制來維護**用戶身份狀態**。Cookie、Session 和 Token（JWT）是三種主流的身份追蹤方案，各有適用場景與取捨。

## 核心理論與詳解

### Cookie

Cookie 是**瀏覽器在用戶端儲存的小型資料片段**，每次請求時自動附加到 HTTP 頭部（`Cookie` 頭部），由伺服器通過 `Set-Cookie` 回應頭設置。

**重要屬性**：

| 屬性 | 作用 |
|------|------|
| `HttpOnly` | 禁止 JavaScript 讀取，防止 XSS 竊取 Cookie |
| `Secure` | 僅通過 HTTPS 傳輸 |
| `SameSite` | 控制跨站請求時是否攜帶 Cookie（防 CSRF） |
| `Expires / Max-Age` | 過期時間（不設為 Session Cookie，瀏覽器關閉即失效） |
| `Domain / Path` | 限制 Cookie 適用的域名和路徑 |

**Cookie 本身只是一個儲存機制**，Session ID 和 Token 都可以儲存在 Cookie 中。

---

### Session（伺服器端 Session）

Session 是**有狀態**的認證方案：

1. 用戶登入 → 伺服器創建 Session 物件，生成唯一 `session_id`
2. `session_id` 通過 `Set-Cookie` 發給瀏覽器
3. 後續請求中，瀏覽器自動攜帶 `session_id`
4. 伺服器根據 `session_id` 在 **Session Store**（記憶體、Redis）中查找對應的用戶資訊

**優點**：
- Session 資料存在伺服器端，可隨時撤銷（登出即刪除）
- 攻擊者獲得 `session_id` 後，伺服器端失效即無效

**缺點**：
- **水平擴展困難**：多台伺服器需共用 Session Store（通常用 Redis），引入共享狀態
- Session Store 成為單點或效能瓶頸
- 不適合跨域 API 和移動端

---

### Token（JWT — JSON Web Token）

Token 是**無狀態**的認證方案，將用戶資訊通過加密簽名後直接儲存在客戶端：

**JWT 結構**：`Header.Payload.Signature`
- **Header**：算法類型（如 HS256、RS256）
- **Payload**：聲明（Claims），包含用戶 ID、角色、過期時間等
- **Signature**：對前兩部分的數字簽名，防止篡改

**運作流程**：
1. 用戶登入 → 伺服器簽發 JWT，返回給客戶端
2. 客戶端儲存 JWT（localStorage 或 Cookie）
3. 後續請求帶上 JWT（通常在 `Authorization: Bearer <token>` 頭部）
4. 伺服器**只需驗證簽名**，無需查詢資料庫或快取

**優點**：
- **完全無狀態**：伺服器不儲存 Session，天然支援水平擴展
- 跨域友好（放在 Authorization 頭部，不受同源策略限制）
- 可包含用戶資訊，減少一次資料庫查詢

**缺點**：
- **無法主動撤銷**：Token 未過期前一直有效，即使用戶登出也無法立即失效
  - 解決方案：維護一個 Token 黑名單（引入伺服器端狀態，削弱無狀態優勢）；或使用短有效期 + Refresh Token
- Payload 可被解碼（Base64，非加密），不應存放敏感資訊
- Token 體積比 Session ID 大

---

### 三者比較

| 比較項目 | Cookie（+Session） | JWT Token |
|---------|-----------------|-----------|
| 狀態位置 | 伺服器端（Session Store） | 客戶端 |
| 有/無狀態 | **有狀態** | **無狀態** |
| 撤銷能力 | ✅ 立即撤銷（刪除 Session） | ❌ 需要黑名單機制 |
| 水平擴展 | 需要共享 Session Store | ✅ 天然支援 |
| CSRF 風險 | 高（Cookie 自動攜帶） | 低（需手動設置 Header） |
| XSS 風險 | 低（HttpOnly Cookie） | 高（localStorage 可被 JS 讀取） |
| 跨域支援 | 複雜（CORS + SameSite） | ✅ Authorization Header |
| 適用場景 | 傳統 Web 應用、需要即時撤銷 | 微服務 API、移動端、SPA |

### Refresh Token 機制

為解決 JWT 無法撤銷的問題，通常配合 Refresh Token 使用：

- **Access Token**：短有效期（5-15 分鐘），用於 API 請求認證
- **Refresh Token**：長有效期（7-30 天），只用於換取新的 Access Token，存在 HttpOnly Cookie 中
- Refresh Token 儲存在伺服器端（可撤銷），使系統兼顧無狀態性能和撤銷能力

### 安全最佳實踐

- JWT 儲存：**優先用 HttpOnly Cookie**，而非 localStorage（防 XSS）
- 使用 `SameSite=Strict` 或 `SameSite=Lax` 防 CSRF
- Access Token 設短有效期（分鐘級別）
- 簽名算法優先選 RS256（非對稱），允許服務只持有公鑰驗證，而非 HS256（需要共享密鑰）
