# JWT 原理與安全實踐

- **難度**: 7
- **重要性**: 5
- **標籤**: `Security`, `JWT`, `Token`

## 問題詳述

什麼是 JWT (JSON Web Token)？請解釋 JWT 的結構和工作原理。在使用 JWT 進行身份驗證時,有哪些常見的安全隱患和最佳實踐？

## 核心理論與詳解

JWT (JSON Web Token) 是一種開放標準 (RFC 7519),用於在雙方之間安全地傳輸資訊。它廣泛應用於無狀態 (Stateless) 的身份驗證和授權場景,特別是在微服務和前後端分離的架構中。

---

### JWT 的結構

JWT 由三個部分組成,以點 (`.`) 分隔:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMjMsImV4cCI6MTY4MDAwMDAwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

格式: `Header.Payload.Signature`

#### 1. Header (標頭)

包含 Token 的類型和簽名演算法。

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

-   `alg`: 簽名演算法 (如 HS256, RS256)
-   `typ`: Token 類型,固定為 "JWT"

這個 JSON 會被 **Base64URL** 編碼成第一部分。

#### 2. Payload (負載)

包含要傳輸的聲明 (Claims),也就是實際的資料。

```json
{
  "user_id": 123,
  "username": "john",
  "role": "admin",
  "exp": 1680000000
}
```

**標準聲明 (Registered Claims)**:
-   `iss` (Issuer): 簽發者
-   `sub` (Subject): 主題,通常是使用者 ID
-   `aud` (Audience): 接收者
-   `exp` (Expiration Time): 過期時間 (Unix timestamp)
-   `nbf` (Not Before): 生效時間
-   `iat` (Issued At): 簽發時間
-   `jti` (JWT ID): 唯一識別碼

**重要**: Payload 只是 Base64URL 編碼,**不是加密**,任何人都可以解碼並讀取內容。因此,**絕對不要在 Payload 中放敏感資訊**(如密碼、信用卡號)。

#### 3. Signature (簽名)

簽名用於驗證 Token 的完整性,確保它沒有被篡改。

```
Signature = HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret_key
)
```

伺服器使用私鑰 (或共享密鑰) 對 Header 和 Payload 進行簽名。只有擁有正確密鑰的一方才能驗證簽名的有效性。

---

### JWT 的工作流程

**身份驗證場景**:

1.  **登入**: 使用者提交帳號密碼到伺服器。
2.  **驗證**: 伺服器驗證憑證,成功後生成 JWT。
3.  **返回 Token**: 伺服器將 JWT 返回給客戶端。
4.  **儲存 Token**: 客戶端將 JWT 儲存在 LocalStorage、SessionStorage 或 Cookie 中。
5.  **後續請求**: 客戶端在每個請求的 HTTP 標頭中攜帶 JWT:
    ```
    Authorization: Bearer <JWT>
    ```
6.  **驗證 Token**: 伺服器接收請求,驗證 JWT 的簽名和有效期,提取 Payload 中的使用者資訊。
7.  **授權**: 根據使用者資訊進行授權檢查,決定是否允許存取。

**關鍵優勢**:
-   **無狀態**: 伺服器不需要儲存會話,JWT 本身包含了所有必要的資訊。
-   **可擴展**: 適合分散式系統和微服務架構,任何服務都可以獨立驗證 JWT。

---

### JWT 的常見安全隱患

#### 1. 使用對稱加密時的密鑰洩露

**問題**: 如果使用 HS256 (HMAC-SHA256) 這種對稱演算法,伺服器和客戶端共享同一個密鑰。一旦密鑰洩露,攻擊者可以偽造任意 JWT。

**防禦**:
-   使用強密鑰 (至少 256 位元)。
-   使用非對稱演算法 (如 RS256),私鑰用於簽名,公鑰用於驗證,即使公鑰洩露也無法偽造 Token。

#### 2. 演算法混淆攻擊 (Algorithm Confusion Attack)

**問題**: 某些不安全的 JWT 函式庫允許將 Header 中的 `alg` 設定為 `none`,或者將 RS256 (非對稱) 偽裝成 HS256 (對稱)。

**攻擊範例**:
```json
// 攻擊者修改 Header
{
  "alg": "none",
  "typ": "JWT"
}
```

如果伺服器不驗證演算法,攻擊者可以偽造沒有簽名的 Token。

**防禦**:
```go
// 明確指定允許的演算法
token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
    // 驗證演算法
    if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
        return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
    }
    return []byte(secretKey), nil
})
```

#### 3. Token 竊取 (Token Theft)

**問題**: 如果 JWT 被儲存在 LocalStorage 中,JavaScript 可以讀取,容易被 XSS 攻擊竊取。

**防禦**:
-   **使用 HttpOnly Cookie**: 將 JWT 儲存在 HttpOnly Cookie 中,JavaScript 無法存取。
-   **實施 CSP**: 防禦 XSS 攻擊。
-   **使用短期 Token**: 設定較短的過期時間 (如 15 分鐘)。

```go
http.SetCookie(w, &http.Cookie{
    Name:     "access_token",
    Value:    jwtToken,
    HttpOnly: true,  // 防止 JavaScript 存取
    Secure:   true,  // 只透過 HTTPS 傳輸
    SameSite: http.SameSiteStrictMode,
})
```

#### 4. 無法撤銷 Token

**問題**: JWT 是無狀態的,一旦簽發就無法撤銷。即使使用者登出或帳號被封禁,Token 在過期前仍然有效。

**解決方案**:
-   **使用短期 Access Token + 長期 Refresh Token**: Access Token 有效期很短 (如 15 分鐘),Refresh Token 用於獲取新的 Access Token。
-   **維護黑名單**: 將已撤銷的 Token 的 `jti` (JWT ID) 存入 Redis 黑名單。
-   **使用版本號**: 在 Token 中加入版本號,伺服器端維護每個使用者的當前版本,不匹配就拒絕。

```go
func ValidateToken(tokenString string) error {
    token, err := jwt.Parse(tokenString, ...)
    if err != nil {
        return err
    }
    
    claims := token.Claims.(jwt.MapClaims)
    jti := claims["jti"].(string)
    
    // 檢查是否在黑名單中
    if redis.Exists(ctx, "blacklist:"+jti).Val() == 1 {
        return errors.New("token has been revoked")
    }
    
    return nil
}
```

#### 5. 敏感資訊洩露

**問題**: Payload 只是 Base64 編碼,任何人都可以解碼並讀取。

**防禦**:
-   **不要在 Payload 中放敏感資訊**。
-   只放必要的身份識別資訊 (如 user_id, role)。
-   如果確實需要加密,使用 JWE (JSON Web Encryption)。

---

### JWT 最佳實踐

1.  **使用強密鑰**: 至少 256 位元的隨機密鑰。
2.  **明確指定演算法**: 不要使用 `alg: none`。
3.  **設定短過期時間**: Access Token 應該有較短的有效期 (15-30 分鐘)。
4.  **使用 Refresh Token 機制**:
    ```
    Access Token (短期, 15分鐘) + Refresh Token (長期, 7天)
    ```
5.  **驗證所有聲明**: 檢查 `exp`、`iss`、`aud` 等聲明。
6.  **使用 HTTPS**: 始終透過 HTTPS 傳輸 JWT。
7.  **實施速率限制**: 防止暴力破解或 Token 重放攻擊。
8.  **考慮使用非對稱加密**: 在多服務環境中,使用 RS256 等非對稱演算法更安全。

### 程式碼範例 (Go)

```go
import (
    "github.com/golang-jwt/jwt/v5"
    "time"
)

// 生成 JWT
func GenerateJWT(userID int, role string) (string, error) {
    claims := jwt.MapClaims{
        "user_id": userID,
        "role":    role,
        "exp":     time.Now().Add(time.Minute * 15).Unix(), // 15 分鐘過期
        "iat":     time.Now().Unix(),
    }
    
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte("your-256-bit-secret"))
}

// 驗證 JWT
func ValidateJWT(tokenString string) (*jwt.Token, error) {
    return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        // 驗證演算法
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("unexpected signing method")
        }
        return []byte("your-256-bit-secret"), nil
    })
}
```

---

### 結論

JWT 是現代 Web 應用中廣泛使用的身份驗證機制,它的無狀態特性使其非常適合分散式系統。然而,JWT 也伴隨著諸多安全風險,如演算法混淆、Token 竊取、無法撤銷等。

作為資深後端工程師,必須深入理解 JWT 的原理和局限性,並嚴格遵循最佳實踐,包括使用強密鑰、短期 Token、HttpOnly Cookie、Refresh Token 機制等,才能構建一個既高效又安全的身份驗證系統。
