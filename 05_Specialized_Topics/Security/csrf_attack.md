# CSRF 跨站請求偽造

- **難度**: 7
- **重要性**: 4
- **標籤**: `Security`, `CSRF`, `Web Security`

## 問題詳述

什麼是 CSRF (Cross-Site Request Forgery) 跨站請求偽造攻擊？請解釋其攻擊原理,並說明後端開發者應該如何防禦這類攻擊。CSRF 與 XSS 有什麼區別？

## 核心理論與詳解

CSRF (Cross-Site Request Forgery,跨站請求偽造) 是一種攻擊手法,攻擊者誘使受害者在已登入的狀態下,在不知情的情況下向目標網站發送惡意請求,執行非預期的操作 (如轉帳、修改密碼、刪除資料等)。

CSRF 的關鍵在於:攻擊者**利用了受害者的身份認證憑證** (如 Cookie),而受害者本身**毫不知情**。

---

### CSRF 的攻擊原理

**前提條件**:
1.  受害者已經登入目標網站 (如網路銀行),瀏覽器中存有有效的會話 Cookie。
2.  目標網站依賴 Cookie 進行身份驗證,且沒有額外的 CSRF 防護。
3.  攻擊者能夠誘使受害者訪問一個包含惡意請求的網頁。

**攻擊流程**:

假設有一個銀行網站,轉帳功能的 API 端點是:
```
POST https://bank.com/transfer
參數: to=<收款帳號>&amount=<金額>
```

1.  **受害者登入銀行網站**: 受害者在 `bank.com` 登入,瀏覽器中存有認證 Cookie。
2.  **攻擊者構造惡意網頁**: 攻擊者在自己的網站 `evil.com` 上放置以下程式碼:

```html
<html>
<body>
    <h1>恭喜你中獎了！點擊領取獎金</h1>
    <form id="csrf-form" action="https://bank.com/transfer" method="POST" style="display:none;">
        <input name="to" value="attacker_account" />
        <input name="amount" value="10000" />
    </form>
    <script>
        // 自動提交表單
        document.getElementById('csrf-form').submit();
    </script>
</body>
</html>
```

3.  **受害者訪問惡意網頁**: 攻擊者透過釣魚郵件、社交工程等方式,誘使受害者點擊連結訪問 `evil.com`。
4.  **自動發送惡意請求**: 受害者的瀏覽器載入該頁面後,JavaScript 自動提交表單,向 `bank.com/transfer` 發送 POST 請求。
5.  **瀏覽器自動附帶 Cookie**: 由於請求是發送到 `bank.com`,瀏覽器會自動附帶該域名下的 Cookie (包括會話 Cookie)。
6.  **伺服器執行操作**: 銀行伺服器收到請求,驗證 Cookie 有效,認為這是受害者本人的操作,於是執行轉帳。
7.  **受害者資金被盜**: 受害者完全不知情的情況下,10000 元被轉到攻擊者帳號。

---

### CSRF vs. XSS 的區別

| 特性 | CSRF | XSS |
| :--- | :--- | :--- |
| **攻擊目標** | 利用使用者的身份執行操作 | 在使用者瀏覽器中執行惡意腳本 |
| **攻擊者目的** | 讓伺服器執行非預期的命令 | 竊取資料、劫持會話、操控頁面 |
| **是否需要執行腳本** | 不一定 (可以是簡單的 img 或 form) | 必須 (執行 JavaScript) |
| **攻擊發起位置** | 通常從第三方網站 | 在目標網站本身 |
| **受害者是否知情** | 通常不知情 | 通常不知情 |
| **主要利用** | Cookie 的自動附帶特性 | 網站對輸入的處理不當 |

簡單來說:
-   **XSS**: 攻擊者在受害者的瀏覽器中**執行程式碼**。
-   **CSRF**: 攻擊者**冒充受害者**向伺服器發送請求。

---

### 如何防禦 CSRF 攻擊

#### 1. CSRF Token (同步令牌模式) - **最常用且有效**

**原理**:
伺服器為每個使用者會話生成一個隨機、不可預測的 Token,並在處理敏感操作時要求客戶端提交該 Token。由於攻擊者無法取得這個 Token,他們構造的惡意請求就會被拒絕。

**實現流程**:
1.  使用者載入表單頁面時,伺服器生成一個 CSRF Token 並嵌入到表單中。
2.  使用者提交表單時,Token 一起被發送。
3.  伺服器驗證 Token 是否正確,只有正確才執行操作。

**Go 程式碼範例**:

```go
import (
    "github.com/gorilla/csrf"
    "github.com/gorilla/mux"
)

func main() {
    r := mux.NewRouter()
    
    // 啟用 CSRF 保護中介軟體
    csrfMiddleware := csrf.Protect(
        []byte("32-byte-long-auth-key-here!!"),
        csrf.Secure(true), // 生產環境啟用
    )
    
    r.HandleFunc("/transfer", TransferHandler).Methods("POST")
    
    http.ListenAndServe(":8080", csrfMiddleware(r))
}

func TransferHandler(w http.ResponseWriter, r *http.Request) {
    // CSRF Token 已經由中介軟體自動驗證
    // 如果 Token 無效,請求不會到達這裡
    // ... 執行轉帳邏輯
}
```

**在表單中嵌入 Token**:
```html
<form action="/transfer" method="POST">
    <input type="hidden" name="csrf_token" value="{{.CSRFToken}}">
    <input name="to" />
    <input name="amount" />
    <button type="submit">轉帳</button>
</form>
```

#### 2. SameSite Cookie 屬性

**原理**:
`SameSite` 是一個 Cookie 屬性,它限制了 Cookie 在跨站請求中的發送行為。

**三種模式**:
-   **`Strict`**: 最嚴格。Cookie 只在同站請求中發送,跨站請求完全不發送。
-   **`Lax`** (預設): 部分跨站請求可以發送 Cookie (如從外部網站點擊連結到本站),但跨站的 POST、PUT、DELETE 等會修改資料的請求不會發送 Cookie。
-   **`None`**: 允許跨站發送,但必須配合 `Secure` 屬性 (僅 HTTPS)。

```go
http.SetCookie(w, &http.Cookie{
    Name:     "session_token",
    Value:    token,
    HttpOnly: true,
    Secure:   true,
    SameSite: http.SameSiteStrictMode, // 防禦 CSRF
})
```

**注意**: `SameSite=Lax` 或 `Strict` 能有效防禦大部分 CSRF 攻擊,但不能完全取代 CSRF Token,因為某些瀏覽器可能不支援或有例外情況。

#### 3. 驗證 Origin 和 Referer 標頭

**原理**:
檢查 HTTP 請求標頭中的 `Origin` 或 `Referer`,確認請求來自可信任的來源。

```go
func ValidateOrigin(r *http.Request) bool {
    origin := r.Header.Get("Origin")
    referer := r.Header.Get("Referer")
    
    allowedOrigins := []string{
        "https://bank.com",
        "https://www.bank.com",
    }
    
    for _, allowed := range allowedOrigins {
        if origin == allowed || strings.HasPrefix(referer, allowed) {
            return true
        }
    }
    return false
}
```

**限制**: 這種方法不夠可靠,因為:
-   某些瀏覽器或防火牆會移除 `Referer` 標頭。
-   使用者可以配置瀏覽器不發送 `Referer`。
-   攻擊者可能透過某些技巧繞過檢查。

因此,這應該作為**輔助防禦**,而不是主要手段。

#### 4. 對敏感操作要求重新驗證

對於高風險操作 (如轉帳、修改密碼),要求使用者重新輸入密碼或進行多因素驗證 (MFA)。

```go
func TransferHandler(w http.ResponseWriter, r *http.Request) {
    // 即使會話有效,也要求輸入密碼確認
    password := r.FormValue("password")
    if !verifyPassword(password) {
        http.Error(w, "Invalid password", http.StatusUnauthorized)
        return
    }
    // 執行轉帳
}
```

#### 5. 使用自定義請求標頭 (適用於 AJAX)

對於前後端分離的應用,可以在 AJAX 請求中添加自定義標頭。由於跨站請求無法設定自定義標頭 (受 CORS 限制),這可以有效防禦 CSRF。

```javascript
// 前端
fetch('/transfer', {
    method: 'POST',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify(data)
});
```

```go
// 後端驗證
func CSRFMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if r.Method != "GET" {
            token := r.Header.Get("X-CSRF-Token")
            if !validateToken(token) {
                http.Error(w, "Invalid CSRF Token", http.StatusForbidden)
                return
            }
        }
        next.ServeHTTP(w, r)
    })
}
```

---

### 結論

CSRF 是一種利用瀏覽器自動附帶 Cookie 特性的攻擊手法,危害性極高。防禦 CSRF 的最佳實踐是採用**多層防禦**:

1.  **必須實施**: CSRF Token 或 Double Submit Cookie 模式。
2.  **強烈建議**: 設定 `SameSite` Cookie 屬性為 `Strict` 或 `Lax`。
3.  **輔助措施**: 驗證 `Origin`/`Referer` 標頭、對敏感操作要求重新驗證。

作為資深後端工程師,必須在設計 API 時就考慮 CSRF 防護,尤其是對於所有會修改資料的操作 (POST、PUT、DELETE)。同時要理解,CSRF 防護是前後端共同的責任,需要雙方協作才能構建安全的系統。
