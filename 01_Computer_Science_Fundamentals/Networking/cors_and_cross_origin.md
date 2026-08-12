# 跨域問題與解決方案

- **難度**: 5
- **重要程度**: 4
- **標籤**: `CORS`, `同源策略`, `安全`, `Web 開發`

## 問題詳述

解釋同源策略 (Same-Origin Policy) 的概念、為什麼需要跨域限制、CORS (Cross-Origin Resource Sharing) 的工作原理，以及在實際開發中如何正確處理跨域問題。

### 測驗對應

- **Concept ID**: `concept.network.http.cors-origin-policy`
- **Learning Objectives**:
  - `LO-1`: 能依 scheme、host、port 判斷 origin，並說明 simple request、preflight 與實際請求的順序。
  - `LO-2`: 能區分瀏覽器同源限制、伺服器授權、credentials、wildcard 與 preflight cache 的語意。
  - `LO-3`: 能從瀏覽器錯誤、OPTIONS status、Origin／Allow 標頭與代理快取證據修正跨域政策。
- **Prerequisites**: 可先閱讀 [HTTP 狀態碼完整解析](./http_status_codes.md)。
- **Quick Quiz**: [Q4](../../QUIZ/01_Networking.md#q4-cors-同源策略與預檢)
- **Hard Assessment**: [Network + OS Resilience Incident](../../QUIZ/Hard_Assessments/network_os_resilience_incident.md) (`assessment.network-os.resilience-incident.v1`)
- **Assessment Gate**: 完成本文與 Quick Quiz，並在 Hard Assessment 中以可驗證證據覆蓋本文的三項 Learning Objectives。
- **覆蓋題型**: `瀏覽器策略、授權邊界、故障排查`

## 核心理論與詳解

### 1. 同源策略 (Same-Origin Policy)

**同源策略** 是瀏覽器實施的核心安全機制，限制一個源 (Origin) 的文檔或腳本如何與另一個源的資源互動。

#### 什麼是「源」(Origin)？

源由三部分組成：

```
https://example.com:443/path?query
│      │          │          │
協定    域名        埠號       路徑 (不影響同源判斷)
```

**同源判斷**:

| URL A | URL B | 是否同源 | 原因 |
|-------|-------|---------|------|
| `http://example.com/a` | `http://example.com/b` | ✅ 同源 | 協定、域名、埠號相同 |
| `http://example.com` | `https://example.com` | ❌ 不同源 | 協定不同 (http vs https) |
| `http://example.com` | `http://www.example.com` | ❌ 不同源 | 域名不同 (子域名不同) |
| `http://example.com` | `http://example.com:8080` | ❌ 不同源 | 埠號不同 (80 vs 8080) |
| `http://example.com/a` | `http://example.com/b` | ✅ 同源 | 路徑不影響 |

#### 為什麼需要同源策略？

**問題場景: 沒有同源策略**

```
用戶登入 bank.com
    ↓
用戶訪問惡意網站 evil.com
    ↓
惡意網站的 JavaScript 發送請求到 bank.com
    ↓
請求攜帶用戶的 Cookie (瀏覽器自動添加)
    ↓
惡意網站讀取用戶的銀行帳戶資訊 😱
    ↓
惡意網站轉帳用戶的錢 😱😱
```

**有同源策略的保護**:

```
evil.com 的 JavaScript 嘗試請求 bank.com
    ↓
瀏覽器檢查同源策略
    ↓
不同源！拒絕請求或阻止讀取回應 ✓
```

#### 同源策略限制

**限制的操作**:
1. **Cookie、LocalStorage、IndexedDB** 無法跨域讀取
2. **DOM** 無法跨域訪問 (如 iframe)
3. **AJAX 請求** 不能跨域讀取回應 (可發送，但無法讀取回應)

**不受限制的操作**:
1. **靜態資源載入**: `<img>`, `<script>`, `<link>`, `<video>`
2. **表單提交**: `<form>` 可提交到任何域名
3. **重定向**: 頁面可重定向到任何 URL

### 2. CORS (Cross-Origin Resource Sharing)

**CORS** 是一種機制，允許伺服器明確聲明哪些源可以訪問其資源，放寬同源策略的限制。

#### CORS 工作原理

**簡單請求 (Simple Requests)**

滿足以下條件的請求:
- 方法: `GET`, `HEAD`, `POST`
- Header: 只能包含簡單頭部
  - `Accept`
  - `Accept-Language`
  - `Content-Language`
  - `Content-Type` (限 `application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`)

**流程**:

```http
客戶端請求 (https://frontend.com):
GET /api/data HTTP/1.1
Host: api.example.com
Origin: https://frontend.com

伺服器回應:
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://frontend.com
Access-Control-Allow-Credentials: true
Content-Type: application/json

{"data": "..."}
```

**關鍵 Header**:
- `Origin`: 瀏覽器自動添加，表示請求來源
- `Access-Control-Allow-Origin`: 伺服器允許的源
  - 具體源: `https://frontend.com`
  - 任意源: `*` (不安全，不建議)

**預檢請求 (Preflight Requests)**

不滿足簡單請求條件時，瀏覽器先發送 `OPTIONS` 預檢請求。

**觸發條件**:
- 使用 `PUT`, `DELETE`, `PATCH` 等方法
- 使用自訂 Header (如 `X-Custom-Header`)
- `Content-Type` 為 `application/json`

**流程**:

```http
第一步: 預檢請求
OPTIONS /api/data HTTP/1.1
Host: api.example.com
Origin: https://frontend.com
Access-Control-Request-Method: DELETE
Access-Control-Request-Headers: X-Custom-Header

伺服器回應預檢:
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://frontend.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: X-Custom-Header
Access-Control-Max-Age: 86400

第二步: 實際請求 (預檢通過後)
DELETE /api/data HTTP/1.1
Host: api.example.com
Origin: https://frontend.com
X-Custom-Header: value

伺服器回應實際請求:
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://frontend.com
```

#### CORS Headers 詳解

**請求 Headers (瀏覽器自動添加)**:

| Header | 描述 |
|--------|------|
| `Origin` | 請求來源 |
| `Access-Control-Request-Method` | 預檢請求中，實際請求使用的方法 |
| `Access-Control-Request-Headers` | 預檢請求中，實際請求使用的自訂 Header |

**回應 Headers (伺服器設定)**:

| Header | 描述 | 範例 |
|--------|------|------|
| `Access-Control-Allow-Origin` | 允許的源 | `https://example.com` 或 `*` |
| `Access-Control-Allow-Methods` | 允許的 HTTP 方法 | `GET, POST, PUT, DELETE` |
| `Access-Control-Allow-Headers` | 允許的自訂 Header | `Content-Type, Authorization` |
| `Access-Control-Expose-Headers` | 允許前端讀取的回應 Header | `X-Total-Count` |
| `Access-Control-Allow-Credentials` | 是否允許攜帶 Cookie | `true` |
| `Access-Control-Max-Age` | 預檢結果快取時間 (秒) | `86400` (1 天) |

### 3. 跨域解決方案

#### 方案 1: CORS (推薦)

**適用**: 現代瀏覽器，完全控制伺服器

**後端配置 (Go)**:

```go
func corsMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // 允許的源 (生產環境應使用白名單)
        origin := r.Header.Get("Origin")
        allowedOrigins := []string{"https://frontend.com", "https://app.frontend.com"}
        
        for _, allowed := range allowedOrigins {
            if origin == allowed {
                w.Header().Set("Access-Control-Allow-Origin", origin)
                break
            }
        }
        
        // 允許攜帶 Cookie
        w.Header().Set("Access-Control-Allow-Credentials", "true")
        
        // 允許的方法
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        
        // 允許的 Header
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        // 預檢結果快取 1 天
        w.Header().Set("Access-Control-Max-Age", "86400")
        
        // 處理預檢請求
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusNoContent)
            return
        }
        
        next.ServeHTTP(w, r)
    })
}
```

**Nginx 配置**:

```nginx
location /api/ {
    # 允許的源
    add_header Access-Control-Allow-Origin $http_origin always;
    
    # 允許攜帶 Cookie
    add_header Access-Control-Allow-Credentials true always;
    
    # 允許的方法
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    
    # 允許的 Header
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    
    # 預檢請求處理
    if ($request_method = OPTIONS) {
        add_header Access-Control-Max-Age 86400;
        return 204;
    }
    
    proxy_pass http://backend;
}
```

#### 方案 2: JSONP (已過時，不推薦)

**原理**: 利用 `<script>` 標籤不受同源策略限制

**前端**:
```javascript
function handleData(data) {
    console.log(data);
}

// 動態建立 script 標籤
const script = document.createElement('script');
script.src = 'https://api.example.com/data?callback=handleData';
document.body.appendChild(script);
```

**後端回應**:
```javascript
handleData({"name": "John", "age": 30})
```

**缺點**:
- 只支援 GET 請求
- 無法設定 Header
- 存在安全風險 (XSS)
- CORS 出現後已被淘汰

#### 方案 3: 代理伺服器 (Proxy)

**原理**: 前端請求同源的代理伺服器，代理伺服器轉發到目標伺服器

```
前端 (https://frontend.com)
    ↓ 同源請求
代理伺服器 (https://frontend.com/api)
    ↓ 伺服器間通信 (無同源限制)
後端 (https://api.example.com)
```

**開發環境 (Webpack Dev Server)**:

```javascript
module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'https://api.example.com',
                changeOrigin: true,
                pathRewrite: {'^/api': ''}
            }
        }
    }
}
```

**生產環境 (Nginx)**:

```nginx
location /api/ {
    proxy_pass https://api.example.com/;
    proxy_set_header Host api.example.com;
    proxy_set_header X-Real-IP $remote_addr;
}
```

**優點**:
- 無需後端支援 CORS
- 開發環境與生產環境一致

**缺點**:
- 額外的網路跳轉
- 增加代理伺服器負載

#### 方案 4: PostMessage (跨域通信)

**適用**: 不同源的 iframe 或 window 之間通信

**父頁面 (https://parent.com)**:

```javascript
// 發送訊息到 iframe
const iframe = document.getElementById('myIframe');
iframe.contentWindow.postMessage('Hello', 'https://child.com');

// 接收來自 iframe 的訊息
window.addEventListener('message', (event) => {
    // 驗證來源
    if (event.origin !== 'https://child.com') return;
    
    console.log('收到訊息:', event.data);
});
```

**子頁面 (https://child.com)**:

```javascript
// 接收來自父頁面的訊息
window.addEventListener('message', (event) => {
    if (event.origin !== 'https://parent.com') return;
    
    console.log('收到訊息:', event.data);
    
    // 回應父頁面
    event.source.postMessage('World', event.origin);
});
```

### 4. 安全考量

#### 不要使用 `Access-Control-Allow-Origin: *`

**問題**:

```nginx
# 錯誤示範
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
```

**風險**: 任何網站都可攜帶用戶 Cookie 請求你的 API

**正確做法**: 使用白名單

```go
allowedOrigins := []string{
    "https://frontend.com",
    "https://app.frontend.com",
}

origin := r.Header.Get("Origin")
for _, allowed := range allowedOrigins {
    if origin == allowed {
        w.Header().Set("Access-Control-Allow-Origin", origin)
        break
    }
}
```

#### 驗證 Origin Header

**問題**: 攻擊者可能偽造 `Origin` Header (但瀏覽器不會)

**防護**: 只信任瀏覽器發送的請求

```go
// 檢查是否為瀏覽器請求
if r.Header.Get("Sec-Fetch-Mode") == "" {
    // 可能是非瀏覽器請求，額外驗證
}
```

#### CSRF (Cross-Site Request Forgery) 防護

**CORS 不能完全防止 CSRF**！

**額外防護措施**:

1. **CSRF Token**:
   ```go
   // 生成 Token
   token := generateCSRFToken()
   http.SetCookie(w, &http.Cookie{
       Name: "csrf_token",
       Value: token,
       SameSite: http.SameSiteStrictMode,
   })
   
   // 驗證 Token
   if r.Header.Get("X-CSRF-Token") != getCookie("csrf_token") {
       http.Error(w, "Invalid CSRF token", http.StatusForbidden)
       return
   }
   ```

2. **SameSite Cookie**:
   ```go
   http.SetCookie(w, &http.Cookie{
       Name: "session",
       Value: sessionID,
       SameSite: http.SameSiteStrictMode, // 或 Lax
       Secure: true,
       HttpOnly: true,
   })
   ```

3. **自訂 Header**:
   ```javascript
   // 前端
   fetch('/api/data', {
       headers: {
           'X-Requested-With': 'XMLHttpRequest'
       }
   });
   ```

### 5. 常見問題與除錯

#### 問題 1: CORS 錯誤但實際請求成功

**現象**:
```
Access to fetch at 'https://api.example.com' from origin 'https://frontend.com' has been blocked by CORS policy
```

但伺服器日誌顯示請求已處理。

**原因**: 請求確實發送了，但瀏覽器阻止讀取回應

**解決**: 正確配置 CORS Headers

#### 問題 2: 預檢請求失敗

**現象**: `OPTIONS` 請求返回 4xx 或 5xx

**原因**: 後端沒有正確處理 `OPTIONS` 請求

**解決**:
```go
if r.Method == "OPTIONS" {
    w.WriteHeader(http.StatusNoContent)
    return
}
```

#### 問題 3: 攜帶 Cookie 但仍被拒絕

**現象**: 設定了 `credentials: 'include'` 但仍無法攜帶 Cookie

**原因 1**: `Access-Control-Allow-Origin` 使用了 `*`
```
// 錯誤
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
```

**原因 2**: 沒有設定 `Access-Control-Allow-Credentials`

**解決**:
```
Access-Control-Allow-Origin: https://frontend.com (具體源)
Access-Control-Allow-Credentials: true
```

前端:
```javascript
fetch('/api/data', {
    credentials: 'include'
});
```

#### 問題 4: Nginx 設定 CORS 但不生效

**原因**: 錯誤回應 (如 404, 500) 沒有添加 CORS Headers

**解決**: 使用 `always` 參數
```nginx
add_header Access-Control-Allow-Origin $http_origin always;
```

#### 除錯技巧

1. **檢查瀏覽器控制台**: 查看具體錯誤訊息
2. **檢查網路面板**: 查看 `OPTIONS` 預檢請求和實際請求的 Headers
3. **使用 curl 測試**: 模擬預檢請求
   ```bash
   curl -X OPTIONS https://api.example.com/data \
     -H "Origin: https://frontend.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -v
   ```
4. **檢查伺服器日誌**: 確認請求是否到達後端

### 6. 實務最佳實踐

#### CORS 配置清單

- [ ] 使用白名單而非 `*`
- [ ] 設定 `Access-Control-Allow-Credentials` (如需 Cookie)
- [ ] 設定 `Access-Control-Max-Age` 減少預檢請求
- [ ] 正確處理 `OPTIONS` 預檢請求
- [ ] 使用 `always` 參數確保錯誤回應也有 CORS Headers
- [ ] 配置 `Access-Control-Expose-Headers` (如需讀取自訂回應 Header)
- [ ] 實施 CSRF 防護 (Token 或 SameSite Cookie)
- [ ] 開發環境與生產環境使用一致的域名或代理
- [ ] 記錄和監控 CORS 錯誤

#### 安全加固清單

- [ ] 不使用 `Access-Control-Allow-Origin: *` (除非是完全公開的 API)
- [ ] 驗證 `Origin` Header 白名單
- [ ] 實施 CSRF Token 或 SameSite Cookie
- [ ] 使用 HTTPS (防止中間人攻擊)
- [ ] 設定 `Content-Security-Policy`
- [ ] 限制允許的 HTTP 方法
- [ ] 限制允許的 Headers
- [ ] 實施速率限制

## 總結

跨域問題是 Web 開發中的常見議題：

1. **同源策略**: 瀏覽器的核心安全機制，保護用戶資料
2. **CORS**: 現代跨域解決方案，伺服器明確聲明跨域權限
3. **預檢請求**: 複雜請求前的安全檢查機制
4. **安全第一**: 使用白名單，實施 CSRF 防護
5. **正確配置**: 理解各 CORS Headers 的作用和配置

作為資深後端工程師，你需要：
- 深入理解同源策略和 CORS 的工作原理
- 能夠正確配置 CORS，平衡安全性和靈活性
- 掌握各種跨域解決方案及其適用場景
- 實施有效的 CSRF 防護措施
- 能夠快速除錯和解決跨域問題
