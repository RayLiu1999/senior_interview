# 常見的安全標頭 (Security Headers)

- **難度**: 6
- **重要性**: 4
- **標籤**: `Security`, `HTTP Headers`, `Web Security`

## 問題詳述

什麼是安全標頭 (Security Headers)？請列舉並解釋常見的安全相關 HTTP 回應標頭,如 CSP、HSTS、X-Frame-Options 等,以及它們如何增強 Web 應用的安全性。

## 核心理論與詳解

安全標頭 (Security Headers) 是伺服器在 HTTP 回應中設定的特殊標頭,用於指示瀏覽器啟用各種安全機制。它們是一種**低成本、高效益**的安全措施,只需要在伺服器端配置,瀏覽器就會自動強制執行這些安全策略。

**核心優勢**:
-   實施簡單,只需添加幾行配置。
-   無需修改業務邏輯程式碼。
-   提供縱深防禦 (Defense in Depth)。

---

### 常見的安全標頭

#### 1. Content-Security-Policy (CSP)

**目的**: 防禦 XSS 攻擊、注入攻擊和資料竊取。

**原理**: CSP 允許開發者定義瀏覽器可以從哪些來源載入資源 (腳本、樣式、圖片等)。

**基本語法**:
```
Content-Security-Policy: <directive> <source>; <directive> <source>
```

**常見指令**:
-   `default-src`: 預設策略,適用於所有未指定的資源類型。
-   `script-src`: 限制 JavaScript 的來源。
-   `style-src`: 限制 CSS 的來源。
-   `img-src`: 限制圖片的來源。
-   `connect-src`: 限制可以連接的 URL (AJAX, WebSocket)。
-   `font-src`: 限制字型的來源。
-   `frame-ancestors`: 限制哪些頁面可以嵌入此頁面 (防止點擊劫持)。

**範例**:
```go
w.Header().Set("Content-Security-Policy", 
    "default-src 'self'; "+
    "script-src 'self' https://cdn.example.com; "+
    "style-src 'self' 'unsafe-inline'; "+
    "img-src 'self' data: https:; "+
    "font-src 'self' https://fonts.googleapis.com; "+
    "connect-src 'self' https://api.example.com; "+
    "frame-ancestors 'none'")
```

**來源關鍵字**:
-   `'self'`: 同源
-   `'none'`: 禁止所有來源
-   `'unsafe-inline'`: 允許內聯腳本/樣式 (不推薦)
-   `'unsafe-eval'`: 允許 eval() (不推薦)
-   具體 URL: `https://cdn.example.com`

**好處**: 即使攻擊者成功注入了惡意腳本,如果該腳本來源不在 CSP 白名單中,瀏覽器會拒絕執行。

---

#### 2. Strict-Transport-Security (HSTS)

**目的**: 強制瀏覽器只透過 HTTPS 訪問網站,防止降級攻擊和中間人攻擊。

**語法**:
```
Strict-Transport-Security: max-age=<seconds>; includeSubDomains; preload
```

**參數**:
-   `max-age`: 指定時間內 (秒),瀏覽器只使用 HTTPS。
-   `includeSubDomains`: 策略也適用於所有子域名。
-   `preload`: 申請加入瀏覽器的 HSTS 預載入清單。

**範例**:
```go
w.Header().Set("Strict-Transport-Security", 
    "max-age=31536000; includeSubDomains; preload")
// 一年 = 31536000 秒
```

**效果**:
-   使用者首次訪問後,瀏覽器會記住這個策略。
-   即使使用者輸入 `http://example.com`,瀏覽器也會自動轉換為 `https://example.com`。
-   攻擊者無法透過中間人攻擊將連線降級為 HTTP。

---

#### 3. X-Frame-Options

**目的**: 防止點擊劫持 (Clickjacking) 攻擊。

**原理**: 控制頁面是否可以被嵌入到 `<iframe>` 中。

**可選值**:
-   `DENY`: 完全禁止被嵌入 iframe。
-   `SAMEORIGIN`: 只允許同源頁面嵌入。
-   `ALLOW-FROM <uri>`: 只允許指定來源嵌入 (已廢棄,使用 CSP 的 `frame-ancestors` 代替)。

**範例**:
```go
w.Header().Set("X-Frame-Options", "DENY")
// 或
w.Header().Set("X-Frame-Options", "SAMEORIGIN")
```

**點擊劫持攻擊範例**:
1.  攻擊者建立一個誘餌頁面。
2.  在誘餌頁面中嵌入目標網站的 iframe,並設為透明。
3.  誘使使用者點擊看似無害的按鈕,實際上點擊了 iframe 中的敏感操作 (如轉帳、刪除帳號)。

---

#### 4. X-Content-Type-Options

**目的**: 防止瀏覽器進行 MIME 類型嗅探 (MIME Sniffing)。

**問題**: 瀏覽器可能忽略伺服器聲明的 `Content-Type`,根據內容自行判斷檔案類型。這可能導致安全漏洞,例如將 `.txt` 檔案解釋為 `.html` 並執行其中的腳本。

**解決**:
```go
w.Header().Set("X-Content-Type-Options", "nosniff")
```

**效果**: 瀏覽器必須嚴格遵守伺服器聲明的 `Content-Type`,不進行類型推測。

---

#### 5. Referrer-Policy

**目的**: 控制 `Referer` 標頭中包含的資訊量,保護使用者隱私。

**問題**: `Referer` 標頭會洩露使用者的瀏覽路徑,可能包含敏感資訊 (如搜尋關鍵字、內部 URL)。

**可選值**:
-   `no-referrer`: 不發送 Referer 標頭。
-   `no-referrer-when-downgrade`: HTTPS → HTTP 時不發送 (預設)。
-   `same-origin`: 只在同源請求時發送。
-   `origin`: 只發送源 (不包含路徑)。
-   `strict-origin-when-cross-origin`: 跨域時只發送源,同源時發送完整 URL。

**範例**:
```go
w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
```

---

#### 6. Permissions-Policy (原 Feature-Policy)

**目的**: 控制瀏覽器功能的使用權限,如攝影機、麥克風、地理位置等。

**範例**:
```go
w.Header().Set("Permissions-Policy", 
    "camera=(), microphone=(), geolocation=(self)")
// 禁用攝影機和麥克風,只允許同源使用地理位置
```

---

#### 7. X-XSS-Protection (已廢棄,但仍常見)

**目的**: 啟用瀏覽器內建的 XSS 過濾器。

**注意**: 此標頭在現代瀏覽器中已被廢棄,因為有時會引入新的安全問題。**建議使用 CSP 代替**。

**範例**:
```go
w.Header().Set("X-XSS-Protection", "1; mode=block")
```

---

### Go 中統一設定安全標頭

**中介軟體範例**:
```go
func SecurityHeadersMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // CSP
        w.Header().Set("Content-Security-Policy", 
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'")
        
        // HSTS
        w.Header().Set("Strict-Transport-Security", 
            "max-age=31536000; includeSubDomains; preload")
        
        // 防止點擊劫持
        w.Header().Set("X-Frame-Options", "DENY")
        
        // 防止 MIME 嗅探
        w.Header().Set("X-Content-Type-Options", "nosniff")
        
        // Referrer 策略
        w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
        
        // 權限策略
        w.Header().Set("Permissions-Policy", 
            "camera=(), microphone=(), geolocation=(self)")
        
        next.ServeHTTP(w, r)
    })
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/", homeHandler)
    
    // 應用中介軟體
    handler := SecurityHeadersMiddleware(mux)
    http.ListenAndServe(":8080", handler)
}
```

---

### 檢測安全標頭

**線上工具**:
-   [SecurityHeaders.com](https://securityheaders.com/)
-   [Mozilla Observatory](https://observatory.mozilla.org/)

**評分標準**: 這些工具會掃描網站並給出安全評分,幫助發現缺失的安全標頭。

---

### 最佳實踐

1.  **從嚴格開始**: 先設定最嚴格的策略,再根據需要逐步放寬。
2.  **測試環境先行**: 在測試環境中驗證安全標頭不會破壞功能。
3.  **使用 CSP 報告模式**: 先使用 `Content-Security-Policy-Report-Only` 監控違規,再正式啟用。
4.  **定期審計**: 使用自動化工具定期檢查安全標頭配置。
5.  **文件化**: 記錄每個安全標頭的用途和配置原因,便於維護。

---

### 結論

安全標頭是 Web 安全的「低成本高回報」措施,只需幾行配置就能大幅提升應用的安全性。特別是 CSP 和 HSTS,它們能有效防禦 XSS、點擊劫持和中間人攻擊等常見威脅。

作為資深後端工程師,應該將安全標頭作為每個專案的標準配置,並確保整個團隊理解它們的重要性。在新專案啟動時,就應該將安全標頭納入初始架構,而不是等到安全審計時才補充。記住:安全性應該是設計的一部分,而不是事後的補丁。
