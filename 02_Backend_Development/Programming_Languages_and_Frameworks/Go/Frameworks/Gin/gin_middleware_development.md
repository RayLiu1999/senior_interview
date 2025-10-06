# Gin 中間件開發與最佳實踐

- **難度**: 6
- **重要程度**: 5
- **標籤**: `Gin`, `Middleware`, `Authentication`, `Logging`

## 問題詳述

請深入解釋 Gin 框架中間件的工作原理、開發模式以及常見的中間件實現（如認證、日誌、CORS、限流等）。

## 核心理論與詳解

### 1. 中間件執行原理

**中間件本質**：中間件是一個返回 `gin.HandlerFunc` 的函數。

```go
type HandlerFunc func(*Context)

func Middleware() HandlerFunc {
    return func(c *Context) {
        // 中間件邏輯
    }
}
```

**執行鏈**：

```
┌────────────────────────────────────────────────┐
│  Request                                       │
│    │                                           │
│    ├─> Middleware 1 (前置)                    │
│    │     │                                     │
│    │     ├─> Middleware 2 (前置)              │
│    │     │     │                               │
│    │     │     ├─> Middleware 3 (前置)        │
│    │     │     │     │                         │
│    │     │     │     └─> Handler              │
│    │     │     │     │                         │
│    │     │     │     ┌─> Middleware 3 (後置)  │
│    │     │     │                               │
│    │     │     ┌─> Middleware 2 (後置)        │
│    │     │                                     │
│    │     ┌─> Middleware 1 (後置)              │
│    │                                           │
│    └─> Response                                │
└────────────────────────────────────────────────┘
```

### 2. 中間件基本結構

```go
// 無參數中間件
func SimpleMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // 前置處理
        log.Println("Before request")
        
        c.Next()  // 執行下一個處理器
        
        // 後置處理
        log.Println("After request")
    }
}

// 帶參數中間件（中間件工廠）
func ConfigurableMiddleware(config Config) gin.HandlerFunc {
    // 初始化邏輯（只執行一次）
    setupOnce := doSetup(config)
    
    return func(c *gin.Context) {
        // 每個請求都會執行
        useSetup(setupOnce)
        c.Next()
    }
}
```

**關鍵方法**：

```go
c.Next()      // 執行鏈中的下一個處理器
c.Abort()     // 停止執行鏈
c.IsAborted() // 檢查是否已中止
c.Set(key, value)  // 存儲數據
c.Get(key)         // 獲取數據
```

### 3. 認證中間件

#### JWT 認證

```go
package middleware

import (
    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
    "net/http"
    "strings"
)

type Claims struct {
    UserID int    `json:"user_id"`
    Email  string `json:"email"`
    jwt.RegisteredClaims
}

func JWTAuth(secretKey string) gin.HandlerFunc {
    return func(c *gin.Context) {
        // 從 Header 獲取 token
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "Authorization header required",
            })
            c.Abort()
            return
        }
        
        // 提取 token（格式：Bearer <token>）
        parts := strings.Split(authHeader, " ")
        if len(parts) != 2 || parts[0] != "Bearer" {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "Invalid authorization format",
            })
            c.Abort()
            return
        }
        
        tokenString := parts[1]
        
        // 解析 token
        token, err := jwt.ParseWithClaims(
            tokenString,
            &Claims{},
            func(token *jwt.Token) (interface{}, error) {
                return []byte(secretKey), nil
            },
        )
        
        if err != nil || !token.Valid {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "Invalid token",
            })
            c.Abort()
            return
        }
        
        // 提取用戶信息
        if claims, ok := token.Claims.(*Claims); ok {
            c.Set("userID", claims.UserID)
            c.Set("email", claims.Email)
            c.Next()
        } else {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "Invalid token claims",
            })
            c.Abort()
            return
        }
    }
}

// 使用
func main() {
    r := gin.Default()
    
    // 公開路由
    r.POST("/login", loginHandler)
    
    // 需要認證的路由
    authorized := r.Group("/api")
    authorized.Use(JWTAuth("your-secret-key"))
    {
        authorized.GET("/profile", profileHandler)
        authorized.POST("/posts", createPostHandler)
    }
    
    r.Run()
}
```

#### 基於角色的訪問控制（RBAC）

```go
func RequireRole(roles ...string) gin.HandlerFunc {
    return func(c *gin.Context) {
        // 假設 userRole 已經在認證中間件中設置
        userRole, exists := c.Get("userRole")
        if !exists {
            c.JSON(http.StatusForbidden, gin.H{
                "error": "User role not found",
            })
            c.Abort()
            return
        }
        
        role := userRole.(string)
        
        // 檢查角色
        allowed := false
        for _, allowedRole := range roles {
            if role == allowedRole {
                allowed = true
                break
            }
        }
        
        if !allowed {
            c.JSON(http.StatusForbidden, gin.H{
                "error": "Insufficient permissions",
            })
            c.Abort()
            return
        }
        
        c.Next()
    }
}

// 使用
admin := r.Group("/admin")
admin.Use(JWTAuth("secret"))
admin.Use(RequireRole("admin", "superadmin"))
{
    admin.DELETE("/users/:id", deleteUser)
}
```

### 4. 日誌中間件

#### 詳細請求日誌

```go
package middleware

import (
    "github.com/gin-gonic/gin"
    "log"
    "time"
)

func RequestLogger() gin.HandlerFunc {
    return func(c *gin.Context) {
        // 記錄開始時間
        startTime := time.Now()
        
        // 記錄請求信息
        path := c.Request.URL.Path
        method := c.Request.Method
        clientIP := c.ClientIP()
        
        // 處理請求
        c.Next()
        
        // 記錄響應信息
        statusCode := c.Writer.Status()
        latency := time.Since(startTime)
        
        // 獲取錯誤信息（如果有）
        errorMessage := ""
        if len(c.Errors) > 0 {
            errorMessage = c.Errors.String()
        }
        
        // 輸出日誌
        log.Printf("[%s] %s %s %d %v %s",
            clientIP,
            method,
            path,
            statusCode,
            latency,
            errorMessage,
        )
    }
}
```

#### 結構化日誌（使用 logrus）

```go
import (
    "github.com/gin-gonic/gin"
    "github.com/sirupsen/logrus"
    "time"
)

func StructuredLogger(logger *logrus.Logger) gin.HandlerFunc {
    return func(c *gin.Context) {
        startTime := time.Now()
        
        c.Next()
        
        latency := time.Since(startTime)
        
        logger.WithFields(logrus.Fields{
            "status":     c.Writer.Status(),
            "method":     c.Request.Method,
            "path":       c.Request.URL.Path,
            "ip":         c.ClientIP(),
            "latency":    latency.Milliseconds(),
            "user-agent": c.Request.UserAgent(),
            "errors":     c.Errors.String(),
        }).Info("Request processed")
    }
}
```

### 5. CORS 中間件

```go
func CORS() gin.HandlerFunc {
    return func(c *gin.Context) {
        method := c.Request.Method
        origin := c.Request.Header.Get("Origin")
        
        // 設置 CORS 頭
        c.Header("Access-Control-Allow-Origin", origin)
        c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        c.Header("Access-Control-Expose-Headers", "Content-Length, Content-Type")
        c.Header("Access-Control-Allow-Credentials", "true")
        c.Header("Access-Control-Max-Age", "86400")
        
        // 處理 OPTIONS 預檢請求
        if method == "OPTIONS" {
            c.AbortWithStatus(http.StatusNoContent)
            return
        }
        
        c.Next()
    }
}

// 更完善的 CORS 配置
type CORSConfig struct {
    AllowOrigins     []string
    AllowMethods     []string
    AllowHeaders     []string
    ExposeHeaders    []string
    AllowCredentials bool
    MaxAge           time.Duration
}

func CORSWithConfig(config CORSConfig) gin.HandlerFunc {
    return func(c *gin.Context) {
        origin := c.Request.Header.Get("Origin")
        
        // 檢查來源是否允許
        allowed := false
        for _, allowedOrigin := range config.AllowOrigins {
            if allowedOrigin == "*" || allowedOrigin == origin {
                allowed = true
                break
            }
        }
        
        if !allowed {
            c.AbortWithStatus(http.StatusForbidden)
            return
        }
        
        c.Header("Access-Control-Allow-Origin", origin)
        c.Header("Access-Control-Allow-Methods", 
            strings.Join(config.AllowMethods, ", "))
        c.Header("Access-Control-Allow-Headers", 
            strings.Join(config.AllowHeaders, ", "))
        
        if len(config.ExposeHeaders) > 0 {
            c.Header("Access-Control-Expose-Headers", 
                strings.Join(config.ExposeHeaders, ", "))
        }
        
        if config.AllowCredentials {
            c.Header("Access-Control-Allow-Credentials", "true")
        }
        
        if config.MaxAge > 0 {
            c.Header("Access-Control-Max-Age", 
                fmt.Sprintf("%.0f", config.MaxAge.Seconds()))
        }
        
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(http.StatusNoContent)
            return
        }
        
        c.Next()
    }
}
```

### 6. 限流中間件

#### 簡單限流

```go
import (
    "golang.org/x/time/rate"
    "sync"
)

func RateLimiter(maxRequests int, window time.Duration) gin.HandlerFunc {
    // 每個 IP 一個限流器
    limiters := make(map[string]*rate.Limiter)
    mu := sync.Mutex{}
    
    return func(c *gin.Context) {
        ip := c.ClientIP()
        
        mu.Lock()
        limiter, exists := limiters[ip]
        if !exists {
            // 創建新的限流器
            limiter = rate.NewLimiter(
                rate.Every(window/time.Duration(maxRequests)), 
                maxRequests,
            )
            limiters[ip] = limiter
        }
        mu.Unlock()
        
        if !limiter.Allow() {
            c.JSON(http.StatusTooManyRequests, gin.H{
                "error": "Too many requests",
            })
            c.Abort()
            return
        }
        
        c.Next()
    }
}

// 使用
r.Use(RateLimiter(100, time.Minute))  // 每分鐘 100 次請求
```

#### 基於 Token Bucket 的限流

```go
type IPRateLimiter struct {
    limiters map[string]*rate.Limiter
    mu       sync.RWMutex
    r        rate.Limit
    b        int
}

func NewIPRateLimiter(r rate.Limit, b int) *IPRateLimiter {
    return &IPRateLimiter{
        limiters: make(map[string]*rate.Limiter),
        r:        r,
        b:        b,
    }
}

func (i *IPRateLimiter) GetLimiter(ip string) *rate.Limiter {
    i.mu.Lock()
    defer i.mu.Unlock()
    
    limiter, exists := i.limiters[ip]
    if !exists {
        limiter = rate.NewLimiter(i.r, i.b)
        i.limiters[ip] = limiter
    }
    
    return limiter
}

func RateLimitMiddleware(limiter *IPRateLimiter) gin.HandlerFunc {
    return func(c *gin.Context) {
        ip := c.ClientIP()
        l := limiter.GetLimiter(ip)
        
        if !l.Allow() {
            c.JSON(http.StatusTooManyRequests, gin.H{
                "error": "Rate limit exceeded",
            })
            c.Abort()
            return
        }
        
        c.Next()
    }
}
```

### 7. 超時中間件

```go
func TimeoutMiddleware(timeout time.Duration) gin.HandlerFunc {
    return func(c *gin.Context) {
        // 創建帶超時的 context
        ctx, cancel := context.WithTimeout(c.Request.Context(), timeout)
        defer cancel()
        
        // 替換 request context
        c.Request = c.Request.WithContext(ctx)
        
        // 使用 channel 處理超時
        finished := make(chan struct{})
        go func() {
            c.Next()
            close(finished)
        }()
        
        select {
        case <-finished:
            // 正常完成
            return
        case <-ctx.Done():
            // 超時
            c.JSON(http.StatusRequestTimeout, gin.H{
                "error": "Request timeout",
            })
            c.Abort()
            return
        }
    }
}

// 使用
r.Use(TimeoutMiddleware(5 * time.Second))
```

### 8. 錯誤恢復中間件

```go
func Recovery() gin.HandlerFunc {
    return func(c *gin.Context) {
        defer func() {
            if err := recover(); err != nil {
                // 記錄堆疊信息
                stack := make([]byte, 4096)
                length := runtime.Stack(stack, false)
                
                log.Printf("[PANIC] %v\n%s", err, stack[:length])
                
                // 返回錯誤響應
                c.JSON(http.StatusInternalServerError, gin.H{
                    "error": "Internal server error",
                })
                
                c.Abort()
            }
        }()
        
        c.Next()
    }
}
```

### 9. 請求 ID 追蹤

```go
func RequestID() gin.HandlerFunc {
    return func(c *gin.Context) {
        // 從 header 獲取或生成新的 request ID
        requestID := c.GetHeader("X-Request-ID")
        if requestID == "" {
            requestID = generateUUID()
        }
        
        // 設置到 context 和響應 header
        c.Set("requestID", requestID)
        c.Header("X-Request-ID", requestID)
        
        c.Next()
    }
}

func generateUUID() string {
    return fmt.Sprintf("%d-%d", time.Now().UnixNano(), rand.Int63())
}
```

### 10. 壓縮中間件

```go
import "github.com/gin-contrib/gzip"

func main() {
    r := gin.Default()
    
    // 使用 gzip 壓縮
    r.Use(gzip.Gzip(gzip.DefaultCompression))
    
    r.GET("/data", func(c *gin.Context) {
        c.JSON(200, largeData)
    })
    
    r.Run()
}
```

### 11. 安全中間件

```go
func SecurityHeaders() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Header("X-Frame-Options", "DENY")
        c.Header("X-Content-Type-Options", "nosniff")
        c.Header("X-XSS-Protection", "1; mode=block")
        c.Header("Strict-Transport-Security", "max-age=31536000")
        c.Header("Content-Security-Policy", "default-src 'self'")
        
        c.Next()
    }
}
```

### 12. 中間件組合

```go
// 創建中間件組
func APIMiddlewares() []gin.HandlerFunc {
    return []gin.HandlerFunc{
        RequestID(),
        RequestLogger(),
        Recovery(),
        CORS(),
        SecurityHeaders(),
        RateLimiter(100, time.Minute),
    }
}

// 使用
func main() {
    r := gin.New()
    
    // 應用中間件組
    r.Use(APIMiddlewares()...)
    
    api := r.Group("/api/v1")
    api.Use(JWTAuth("secret"))
    {
        api.GET("/users", getUsers)
    }
    
    r.Run()
}
```

### 13. 中間件測試

```go
func TestAuthMiddleware(t *testing.T) {
    // 設置測試模式
    gin.SetMode(gin.TestMode)
    
    r := gin.New()
    r.Use(JWTAuth("test-secret"))
    r.GET("/test", func(c *gin.Context) {
        c.JSON(200, gin.H{"message": "success"})
    })
    
    tests := []struct {
        name       string
        token      string
        wantStatus int
    }{
        {
            name:       "No token",
            token:      "",
            wantStatus: 401,
        },
        {
            name:       "Invalid token",
            token:      "Bearer invalid",
            wantStatus: 401,
        },
        {
            name:       "Valid token",
            token:      "Bearer " + generateValidToken(),
            wantStatus: 200,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            w := httptest.NewRecorder()
            req, _ := http.NewRequest("GET", "/test", nil)
            
            if tt.token != "" {
                req.Header.Set("Authorization", tt.token)
            }
            
            r.ServeHTTP(w, req)
            
            if w.Code != tt.wantStatus {
                t.Errorf("got %d, want %d", w.Code, tt.wantStatus)
            }
        })
    }
}
```

## 總結

**中間件設計原則**：
- ✅ **單一職責**：每個中間件只做一件事
- ✅ **可配置性**：使用工廠函數接受參數
- ✅ **錯誤處理**：優雅處理錯誤並中止請求
- ✅ **性能優化**：避免在中間件中執行重操作
- ✅ **可測試性**：編寫單元測試

**常用中間件**：
- 🔐 **認證**：JWT、OAuth、Session
- 📝 **日誌**：請求日誌、結構化日誌
- 🚦 **限流**：IP 限流、用戶限流
- 🔒 **安全**：CORS、安全頭、CSRF
- ⏱️ **超時**：請求超時控制
- 📊 **監控**：性能監控、錯誤追蹤

**執行順序**：
1. 全域中間件（按註冊順序）
2. 群組中間件
3. 路由中間件
4. Handler
5. 中間件後置處理（反向順序）

掌握中間件開發是 Gin 應用架構設計的關鍵。
