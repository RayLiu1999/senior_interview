# API 安全性最佳實踐

- **難度**: 7
- **重要性**: 4
- **標籤**: `Security`, `API`, `Rate Limiting`

## 問題詳述

在設計和實現 RESTful API 時,有哪些關鍵的安全性考量？請解釋速率限制 (Rate Limiting)、API 金鑰管理、CORS 配置等安全機制的重要性和實現方式。

## 核心理論與詳解

API 是現代應用程式的核心,它們暴露了系統的功能給外部呼叫者。因此,API 的安全性直接決定了整個系統的安全性。一個設計不良的 API 可能導致資料洩露、服務中斷或系統被攻破。

---

### API 安全的核心原則

1.  **身份驗證 (Authentication)**: 確認呼叫者的身份。
2.  **授權 (Authorization)**: 確認呼叫者是否有權限執行該操作。
3.  **機密性 (Confidentiality)**: 資料在傳輸和儲存時被加密。
4.  **完整性 (Integrity)**: 資料未被篡改。
5.  **可用性 (Availability)**: 服務能抵禦 DDoS 等攻擊,保持可用。
6.  **審計性 (Auditability)**: 記錄所有重要操作,便於追蹤和分析。

---

### 關鍵安全機制

#### 1. 使用 HTTPS

**原則**: 所有 API 通訊**必須**透過 HTTPS 進行。

**原因**:
-   防止中間人攻擊竊聽資料。
-   保護 API 金鑰、Token 等敏感憑證。

**實現**:
```go
// 強制重新導向到 HTTPS
if r.TLS == nil {
    http.Redirect(w, r, "https://"+r.Host+r.RequestURI, http.StatusMovedPermanently)
    return
}
```

#### 2. 身份驗證機制

**常見方式**:

**API 金鑰 (API Key)**:
-   簡單但較不安全,適合低敏感度的公開 API。
-   應在 HTTP 標頭中傳遞,而不是 URL 參數。
```go
apiKey := r.Header.Get("X-API-Key")
if !validateAPIKey(apiKey) {
    http.Error(w, "Unauthorized", http.StatusUnauthorized)
    return
}
```

**OAuth 2.0**:
-   業界標準,適合第三方授權場景。
-   使用 Access Token 進行身份驗證。

**JWT (JSON Web Token)**:
-   無狀態,適合微服務架構。
-   在標頭中攜帶 Bearer Token。
```go
authHeader := r.Header.Get("Authorization")
if !strings.HasPrefix(authHeader, "Bearer ") {
    http.Error(w, "Unauthorized", http.StatusUnauthorized)
    return
}
token := strings.TrimPrefix(authHeader, "Bearer ")
// 驗證 JWT...
```

#### 3. 速率限制 (Rate Limiting)

**目的**:
-   防止暴力破解攻擊。
-   防止 DDoS 攻擊。
-   防止惡意爬蟲消耗資源。
-   確保服務的公平使用。

**常見演算法**:

**固定視窗 (Fixed Window)**:
```
允許: 每分鐘 100 次請求
實現: 在每分鐘開始時重置計數器
```

**滑動視窗 (Sliding Window)**:
```
更精確,考慮最近 N 秒內的請求數
```

**令牌桶 (Token Bucket)**:
```
允許突發流量,但長期平均速率受限
```

**漏桶 (Leaky Bucket)**:
```
強制固定的請求處理速率
```

**Go 實現範例 (使用 Token Bucket)**:
```go
import "golang.org/x/time/rate"

var limiter = rate.NewLimiter(10, 20) // 每秒 10 次,最多累積 20 次

func RateLimitMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if !limiter.Allow() {
            http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
            return
        }
        next.ServeHTTP(w, r)
    })
}
```

**按使用者限流**:
```go
var limiters = make(map[string]*rate.Limiter)
var mu sync.Mutex

func getUserLimiter(userID string) *rate.Limiter {
    mu.Lock()
    defer mu.Unlock()
    
    limiter, exists := limiters[userID]
    if !exists {
        limiter = rate.NewLimiter(10, 20)
        limiters[userID] = limiter
    }
    return limiter
}
```

**回應標頭**:
```go
w.Header().Set("X-RateLimit-Limit", "100")
w.Header().Set("X-RateLimit-Remaining", "95")
w.Header().Set("X-RateLimit-Reset", "1680000000")
```

#### 4. 輸入驗證與清理

**永遠不要信任客戶端輸入**。

**驗證範例**:
```go
type CreateUserRequest struct {
    Username string `json:"username" binding:"required,min=3,max=20,alphanum"`
    Email    string `json:"email" binding:"required,email"`
    Age      int    `json:"age" binding:"required,min=18,max=120"`
}

func CreateUser(w http.ResponseWriter, r *http.Request) {
    var req CreateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }
    
    // 使用驗證庫 (如 validator)
    if err := validate.Struct(req); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    
    // 處理請求...
}
```

#### 5. CORS (Cross-Origin Resource Sharing) 配置

**問題**: 預設情況下,瀏覽器禁止跨域請求,但 API 常需要被不同域的前端呼叫。

**錯誤配置 (危險)**:
```go
// 允許所有來源 - 不安全!
w.Header().Set("Access-Control-Allow-Origin", "*")
```

**正確配置**:
```go
func CORSMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        origin := r.Header.Get("Origin")
        allowedOrigins := []string{
            "https://example.com",
            "https://app.example.com",
        }
        
        for _, allowed := range allowedOrigins {
            if origin == allowed {
                w.Header().Set("Access-Control-Allow-Origin", origin)
                break
            }
        }
        
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        w.Header().Set("Access-Control-Max-Age", "3600")
        
        // 處理預檢請求
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }
        
        next.ServeHTTP(w, r)
    })
}
```

#### 6. API 版本控制

**目的**: 允許 API 演進而不破壞現有客戶端。

**方式**:
-   URL 路徑: `/api/v1/users`, `/api/v2/users`
-   請求標頭: `Accept: application/vnd.api.v2+json`
-   查詢參數: `/api/users?version=2`

**推薦使用 URL 路徑方式**,最直觀明確。

#### 7. 錯誤處理與資訊洩露

**錯誤示範**:
```go
// 洩露內部資訊 - 危險!
http.Error(w, err.Error(), http.StatusInternalServerError)
// "database connection failed at 192.168.1.100:5432"
```

**正確做法**:
```go
// 記錄詳細錯誤到日誌
log.Error("Database error", "error", err, "user_id", userID)

// 向客戶端返回通用錯誤訊息
http.Error(w, "Internal server error", http.StatusInternalServerError)
```

**結構化錯誤回應**:
```go
type ErrorResponse struct {
    Error   string `json:"error"`
    Code    string `json:"code"`
    Message string `json:"message"`
}

errorResp := ErrorResponse{
    Error:   "RESOURCE_NOT_FOUND",
    Code:    "404",
    Message: "The requested resource does not exist",
}
json.NewEncoder(w).Encode(errorResp)
```

---

### API 安全檢查清單

1.  ✅ 所有 API 端點都使用 HTTPS
2.  ✅ 實施適當的身份驗證機制 (API Key / OAuth / JWT)
3.  ✅ 對所有敏感操作進行授權檢查
4.  ✅ 實施速率限制,防止濫用
5.  ✅ 驗證和清理所有輸入
6.  ✅ 正確配置 CORS,使用白名單
7.  ✅ 使用參數化查詢,防止 SQL Injection
8.  ✅ 不在錯誤訊息中洩露敏感資訊
9.  ✅ 實施日誌記錄和監控
10. ✅ 使用安全的 HTTP 標頭 (CSP, HSTS, X-Frame-Options 等)
11. ✅ 定期更新依賴套件,修補安全漏洞
12. ✅ 實施 API 版本控制
13. ✅ 對敏感資料進行加密儲存
14. ✅ 使用 API Gateway 集中管理安全策略

---

### 結論

API 安全是一個多層次、多維度的問題。沒有單一的「銀彈」,而是需要結合身份驗證、授權、速率限制、輸入驗證、HTTPS、CORS 配置等多種機制,構建縱深防禦體系。

作為資深後端工程師,必須將安全性作為 API 設計的首要考量,而不是事後補充。在程式碼審查和架構設計中,應該主動識別潛在的安全風險,並採取相應的防護措施。記住:攻擊者只需要找到一個漏洞,而防禦者必須保護好每一個入口。
