# Gin 框架基礎與核心概念

- **難度**: 4
- **重要程度**: 5
- **標籤**: `Gin`, `Web Framework`, `HTTP`, `Middleware`

## 問題詳述

請解釋 Gin 框架的核心特性、架構設計、中間件機制以及為什麼它是 Go 生態系統中最受歡迎的 Web 框架之一。

### 測驗對應

- **Concept ID**: `concept.go.gin.framework-architecture`
- **Learning Objectives**:
  - `LO-1`: 能夠描述 Gin Engine、RouterGroup、路由樹、Context 與 Handler 之間的請求流程。
  - `LO-2`: 能夠依路由範圍選擇全局、群組或單一路由中間件，並說明 `gin.Default()` 的預設組成。
  - `LO-3`: 能夠使用參數綁定、Context 與 `Abort` 設計可維護的 HTTP API。
- **Quick Quiz**: [Go Q10](../../../../../QUIZ/06_Go.md#q10)
- **Hard Assessment**: [Gin API Production Incident](../../../../../QUIZ/Hard_Assessments/gin_api_production_incident.md) (`assessment.go.gin-api-production.incident.v1`)

## 核心理論與詳解

### 1. Gin 框架概述

**Gin** 是一個用 Go 語言編寫的高性能 Web 框架，以其極快的速度和簡潔的 API 設計而聞名。

**核心特點**：
- **高性能**：基於 httprouter，路由速度極快
- **中間件支援**：靈活的中間件機制
- **路由群組**：支援路由分組管理
- **參數綁定**：自動綁定請求參數到結構體
- **JSON 驗證**：內建驗證器
- **錯誤管理**：統一的錯誤處理機制

### 2. 基本架構

```
Request → Router → Middleware Chain → Handler → Response
```

**核心組件**：

```
┌─────────────────────────────────────────────────┐
│               Gin Engine                        │
├─────────────────────────────────────────────────┤
│  RouterGroup                                    │
│  ├── Middleware Stack                           │
│  ├── Route Tree (httprouter)                    │
│  └── Handler Functions                          │
├─────────────────────────────────────────────────┤
│  Context                                        │
│  ├── Request (http.Request)                     │
│  ├── Response (http.ResponseWriter)             │
│  ├── Parameters                                 │
│  └── Keys (context storage)                     │
└─────────────────────────────────────────────────┘
```

### 3. 基本使用

```go
package main

import (
    "github.com/gin-gonic/gin"
    "net/http"
)

func main() {
    // 創建 Gin 引擎
    r := gin.Default()  // 包含 Logger 和 Recovery 中間件
    
    // 基本路由
    r.GET("/ping", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "message": "pong",
        })
    })
    
    // 啟動服務器
    r.Run(":8080")  // 預設監聽 0.0.0.0:8080
}
```

**gin.Default() vs gin.New()**：

```go
// gin.Default() = gin.New() + Logger + Recovery
r := gin.Default()

// 等同於
r := gin.New()
r.Use(gin.Logger())
r.Use(gin.Recovery())
```

### 4. 路由定義

#### 基本路由

```go
r := gin.Default()

// HTTP 方法
r.GET("/users", getUsers)
r.POST("/users", createUser)
r.PUT("/users/:id", updateUser)
r.DELETE("/users/:id", deleteUser)
r.PATCH("/users/:id", patchUser)
r.HEAD("/users", headUsers)
r.OPTIONS("/users", optionsUsers)
```

#### 路徑參數

```go
// URL 參數
r.GET("/users/:id", func(c *gin.Context) {
    id := c.Param("id")
    c.JSON(200, gin.H{"user_id": id})
})

// 萬用字符（必須在最後）
r.GET("/files/*filepath", func(c *gin.Context) {
    filepath := c.Param("filepath")
    c.JSON(200, gin.H{"filepath": filepath})
})
// GET /files/a/b/c → filepath = "/a/b/c"
```

#### 查詢參數

```go
r.GET("/search", func(c *gin.Context) {
    // 獲取查詢參數
    query := c.Query("q")                    // 返回 string
    page := c.DefaultQuery("page", "1")      // 提供預設值
    
    // 獲取多個相同名稱的參數
    tags := c.QueryArray("tag")              // []string
    
    // 獲取參數 map
    filters := c.QueryMap("filter")          // map[string]string
    
    c.JSON(200, gin.H{
        "query": query,
        "page": page,
        "tags": tags,
        "filters": filters,
    })
})
// GET /search?q=golang&page=2&tag=web&tag=api&filter[color]=red
```

### 5. 路由群組

```go
r := gin.Default()

// API v1 群組
v1 := r.Group("/api/v1")
{
    v1.GET("/users", getUsers)
    v1.POST("/users", createUser)
    
    // 巢狀群組
    admin := v1.Group("/admin")
    admin.Use(AuthRequired())  // 群組中間件
    {
        admin.GET("/users", adminGetUsers)
        admin.DELETE("/users/:id", adminDeleteUser)
    }
}

// API v2 群組
v2 := r.Group("/api/v2")
{
    v2.GET("/users", getUsersV2)
}
```

### 6. 中間件機制

#### 全域中間件

```go
r := gin.New()

// 全域中間件（所有路由）
r.Use(gin.Logger())
r.Use(gin.Recovery())
r.Use(CorsMiddleware())

r.GET("/test", handler)
```

#### 路由級中間件

```go
// 單個路由
r.GET("/admin", AuthMiddleware(), adminHandler)

// 路由群組
admin := r.Group("/admin")
admin.Use(AuthMiddleware())
{
    admin.GET("/dashboard", dashboard)
}
```

#### 自定義中間件

```go
// 基本中間件結構
func MyMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // 前置處理
        startTime := time.Now()
        
        // 執行下一個中間件或 handler
        c.Next()
        
        // 後置處理
        latency := time.Since(startTime)
        log.Printf("Request took %v", latency)
    }
}

// 使用
r.Use(MyMiddleware())
```

**中間件執行流程**：

```
Request
   │
   ├─> Middleware 1 (before c.Next())
   │      │
   │      ├─> Middleware 2 (before c.Next())
   │      │      │
   │      │      └─> Handler
   │      │      │
   │      │      └─> Middleware 2 (after c.Next())
   │      │
   │      └─> Middleware 1 (after c.Next())
   │
   └─> Response
```

#### 中斷執行鏈

```go
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        
        if token == "" {
            c.JSON(401, gin.H{"error": "Unauthorized"})
            c.Abort()  // 中止後續處理
            return
        }
        
        c.Next()  // 繼續執行
    }
}
```

### 7. 請求處理

#### 綁定 JSON

```go
type User struct {
    Name  string `json:"name" binding:"required"`
    Email string `json:"email" binding:"required,email"`
    Age   int    `json:"age" binding:"gte=0,lte=130"`
}

func createUser(c *gin.Context) {
    var user User
    
    // 綁定並驗證
    if err := c.ShouldBindJSON(&user); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(200, user)
}
```

#### 綁定其他格式

```go
// 綁定 Query 參數
var query QueryParams
c.ShouldBindQuery(&query)

// 綁定 Form 表單
var form FormData
c.ShouldBind(&form)

// 綁定 URI 參數
type URI struct {
    ID int `uri:"id" binding:"required"`
}
var uri URI
c.ShouldBindUri(&uri)

// 綁定 Header
type Headers struct {
    Authorization string `header:"Authorization"`
}
var headers Headers
c.ShouldBindHeader(&headers)
```

#### 多數據源綁定

```go
type Request struct {
    // URI 參數
    ID int `uri:"id" binding:"required"`
    
    // Query 參數
    Page int `form:"page" binding:"required"`
    
    // JSON Body
    Name string `json:"name" binding:"required"`
}

func handler(c *gin.Context) {
    var req Request
    
    // 依次綁定不同來源
    if err := c.ShouldBindUri(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    if err := c.ShouldBindQuery(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(200, req)
}
```

### 8. 響應處理

#### JSON 響應

```go
// gin.H 是 map[string]interface{} 的別名
c.JSON(200, gin.H{
    "message": "success",
    "data": data,
})

// 結構體響應
type Response struct {
    Code    int         `json:"code"`
    Message string      `json:"message"`
    Data    interface{} `json:"data"`
}

c.JSON(200, Response{
    Code: 0,
    Message: "success",
    Data: users,
})

// IndentedJSON（格式化，適合調試）
c.IndentedJSON(200, data)

// SecureJSON（防止 JSON 劫持）
c.SecureJSON(200, data)

// JSONP
c.JSONP(200, data)
```

#### 其他響應格式

```go
// XML
c.XML(200, data)

// YAML
c.YAML(200, data)

// ProtoBuf
c.ProtoBuf(200, data)

// HTML
c.HTML(200, "index.html", gin.H{
    "title": "Home",
})

// 純文本
c.String(200, "Hello, %s", name)

// 文件
c.File("/path/to/file")

// 文件下載
c.FileAttachment("/path/to/file", "filename.pdf")

// 重定向
c.Redirect(302, "/login")
```

### 9. Context 使用

#### 存儲和獲取值

```go
// 在中間件中設置值
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        userID := authenticateUser(c)
        c.Set("userID", userID)  // 存儲
        c.Next()
    }
}

// 在 handler 中獲取值
func handler(c *gin.Context) {
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(401, gin.H{"error": "Unauthorized"})
        return
    }
    
    // 類型斷言
    id := userID.(int)
    
    // 或使用類型安全的方法
    id := c.GetInt("userID")
    name := c.GetString("name")
    user := c.MustGet("user").(User)  // 不存在會 panic
}
```

#### Context 方法

```go
// 請求相關
c.Request          // *http.Request
c.Writer           // http.ResponseWriter
c.FullPath()       // "/user/:id"
c.ClientIP()       // 客戶端 IP
c.ContentType()    // Content-Type

// Cookie
c.Cookie("name")
c.SetCookie(name, value, maxAge, path, domain, secure, httpOnly)

// 文件上傳
file, err := c.FormFile("file")
c.SaveUploadedFile(file, dst)

// 錯誤處理
c.Error(err)               // 添加錯誤
c.Errors                   // 錯誤列表
```

### 10. 錯誤處理

```go
// 統一錯誤處理中間件
func ErrorHandler() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Next()
        
        // 處理所有錯誤
        if len(c.Errors) > 0 {
            err := c.Errors.Last()
            
            c.JSON(500, gin.H{
                "error": err.Error(),
            })
        }
    }
}

// 在 handler 中使用
func handler(c *gin.Context) {
    if err := doSomething(); err != nil {
        c.Error(err)  // 記錄錯誤
        c.Abort()     // 停止執行
        return
    }
    
    c.JSON(200, gin.H{"message": "success"})
}
```

### 11. 驗證器

```go
type User struct {
    Name     string `binding:"required,min=3,max=50"`
    Email    string `binding:"required,email"`
    Age      int    `binding:"required,gte=18,lte=120"`
    Password string `binding:"required,min=8"`
    Website  string `binding:"omitempty,url"`
}

// 自定義驗證器
func init() {
    if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
        v.RegisterValidation("username", validateUsername)
    }
}

func validateUsername(fl validator.FieldLevel) bool {
    username := fl.Field().String()
    // 自定義驗證邏輯
    return len(username) >= 3 && len(username) <= 20
}

type RegisterRequest struct {
    Username string `binding:"required,username"`
}
```

### 12. 日誌配置

```go
import (
    "github.com/gin-gonic/gin"
    "io"
    "os"
)

func main() {
    // 禁用控制台顏色
    gin.DisableConsoleColor()
    
    // 將日誌寫入文件
    f, _ := os.Create("gin.log")
    gin.DefaultWriter = io.MultiWriter(f, os.Stdout)
    
    // 自定義日誌格式
    r := gin.New()
    r.Use(gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
        return fmt.Sprintf("%s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
            param.ClientIP,
            param.TimeStamp.Format(time.RFC1123),
            param.Method,
            param.Path,
            param.Request.Proto,
            param.StatusCode,
            param.Latency,
            param.Request.UserAgent(),
            param.ErrorMessage,
        )
    }))
    
    r.Run()
}
```

### 13. 性能優化

```go
// 釋放 Context
func main() {
    r := gin.Default()
    
    r.GET("/long-async", func(c *gin.Context) {
        // 創建副本用於 goroutine
        cCp := c.Copy()
        go func() {
            time.Sleep(5 * time.Second)
            log.Println("Done! in path " + cCp.Request.URL.Path)
        }()
    })
    
    r.Run()
}

// 優雅關機
func main() {
    r := gin.Default()
    
    srv := &http.Server{
        Addr:    ":8080",
        Handler: r,
    }
    
    go func() {
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("listen: %s\n", err)
        }
    }()
    
    // 等待中斷信號
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit
    log.Println("Shutting down server...")
    
    // 優雅關閉，超時 5 秒
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    if err := srv.Shutdown(ctx); err != nil {
        log.Fatal("Server forced to shutdown:", err)
    }
    
    log.Println("Server exiting")
}
```

## 總結

**Gin 核心優勢**：
- ⚡ **高性能**：基於 httprouter，路由查找 O(1)
- 🎯 **簡潔 API**：鏈式調用，易於學習
- 🔧 **靈活中間件**：支援全域和路由級中間件
- ✅ **自動驗證**：內建 validator，減少樣板代碼
- 📦 **豐富生態**：大量第三方中間件

**最佳實踐**：
- ✅ 使用路由群組組織 API
- ✅ 統一錯誤處理中間件
- ✅ 參數綁定和驗證
- ✅ 使用 Context 傳遞請求範圍的數據
- ✅ 優雅關機處理
- ✅ 日誌記錄和監控

**常見使用場景**：
- RESTful API 開發
- 微服務 HTTP 網關
- Web 應用後端
- 中間件代理服務

Gin 以其卓越的性能和簡潔的設計成為 Go Web 開發的首選框架。
