# Echo 框架基礎與核心概念

- **難度**: 4
- **重要程度**: 4
- **標籤**: `Echo`, `Web Framework`, `HTTP`, `Middleware`

## 問題詳述

請解釋 Echo 框架的核心特性、架構設計以及它與 Gin 框架的異同。

### 測驗對應

- **Concept ID**: `concept.go.echo.framework-architecture`
- **Learning Objectives**:
  - `LO-1`: 能夠描述 Echo Engine、路由樹、RouterGroup、Context 與 Handler 之間的請求流程。
  - `LO-2`: 能夠依全域、群組與單一路由範圍安排 middleware，並判斷路由參數、綁定與驗證的邊界。
  - `LO-3`: 能夠設計具備錯誤處理、請求取消、逾時與可觀測性的 Echo HTTP API。
- **Prerequisites**: `concept.go.gin.framework-architecture`, `concept.go.standard-library.context-cancellation`
- **Quick Quiz**: [Go Q15](../../../../../QUIZ/06_Go.md#q15)
- **Hard Assessment**: [Go Runtime Framework Incident](../../../../../QUIZ/Hard_Assessments/go_runtime_framework_incident.md) (`assessment.go.runtime-framework.incident.v1`)
- **Assessment Gate**: 能從 route／middleware trace 說明 Echo 請求流程，並在事故情境中提出可驗證的路由、短路與資源邊界修復，達到 3/4。

## 核心理論與詳解

### 1. Echo 框架概述

**Echo** 是一個高性能、極簡的 Go Web 框架，強調簡潔性和可擴展性。

**核心特點**：
- 🚀 **高性能**：優化的路由器和 HTTP 處理
- 📦 **最小化**：核心小巧，功能通過中間件擴展
- 🎯 **RESTful**：專為 REST API 設計
- 🔧 **可擴展**：豐富的中間件生態
- 📚 **完善文檔**：詳細的官方文檔

### 2. Echo vs Gin

| 特性 | Echo | Gin |
|------|------|-----|
| **性能** | 極快 (28k req/s) | 更快 (30k req/s) |
| **路由** | 基於 Radix Tree | 基於 httprouter |
| **中間件** | 內建豐富 | 需第三方 |
| **綁定** | 支援多種格式 | 主要 JSON |
| **驗證** | 內建 validator | 需第三方 |
| **WebSocket** | 內建支援 | 需第三方 |
| **HTTP/2** | 內建支援 | 內建支援 |
| **社群** | 中等 | 更大 |

### 3. 基本使用

```go
package main

import (
    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
    "net/http"
)

func main() {
    // 創建 Echo 實例
    e := echo.New()
    
    // 中間件
    e.Use(middleware.Logger())
    e.Use(middleware.Recover())
    
    // 路由
    e.GET("/", func(c echo.Context) error {
        return c.String(http.StatusOK, "Hello, World!")
    })
    
    // 啟動服務器
    e.Logger.Fatal(e.Start(":8080"))
}
```

### 4. 路由定義

#### 基本路由

```go
e := echo.New()

// HTTP 方法
e.GET("/users", getUsers)
e.POST("/users", createUser)
e.PUT("/users/:id", updateUser)
e.DELETE("/users/:id", deleteUser)
e.PATCH("/users/:id", patchUser)

// 靜態文件
e.Static("/static", "assets")
e.File("/", "public/index.html")
```

#### 路徑參數

```go
// 命名參數
e.GET("/users/:id", func(c echo.Context) error {
    id := c.Param("id")
    return c.String(http.StatusOK, "User ID: " + id)
})

// 萬用字符
e.GET("/files/*", func(c echo.Context) error {
    path := c.Param("*")
    return c.String(http.StatusOK, "File path: " + path)
})
// GET /files/a/b/c.txt → path = "a/b/c.txt"
```

#### 查詢參數

```go
e.GET("/search", func(c echo.Context) error {
    // 單個參數
    query := c.QueryParam("q")
    page := c.QueryParam("page")
    
    // 帶預設值
    limit := c.QueryParam("limit")
    if limit == "" {
        limit = "10"
    }
    
    // 多個相同名稱
    tags := c.QueryParams()["tag"]  // []string
    
    return c.JSON(http.StatusOK, map[string]interface{}{
        "query": query,
        "page":  page,
        "limit": limit,
        "tags":  tags,
    })
})
```

### 5. 路由群組

```go
e := echo.New()

// API v1 群組
v1 := e.Group("/api/v1")
v1.Use(middleware.BasicAuth(func(username, password string, c echo.Context) (bool, error) {
    return username == "user" && password == "pass", nil
}))
{
    v1.GET("/users", getUsers)
    v1.POST("/users", createUser)
    
    // 巢狀群組
    admin := v1.Group("/admin")
    admin.Use(requireAdmin)
    {
        admin.DELETE("/users/:id", deleteUser)
    }
}

// API v2 群組
v2 := e.Group("/api/v2")
{
    v2.GET("/users", getUsersV2)
}
```

### 6. 中間件機制

#### 內建中間件

```go
import "github.com/labstack/echo/v4/middleware"

e := echo.New()

// Logger
e.Use(middleware.Logger())

// Recover from panics
e.Use(middleware.Recover())

// CORS
e.Use(middleware.CORS())

// Gzip 壓縮
e.Use(middleware.Gzip())

// JWT 認證
e.Use(middleware.JWT([]byte("secret")))

// Rate Limiter
e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(20)))

// Request ID
e.Use(middleware.RequestID())

// Secure headers
e.Use(middleware.Secure())

// Timeout
e.Use(middleware.TimeoutWithConfig(middleware.TimeoutConfig{
    Timeout: 30 * time.Second,
}))
```

#### 自定義中間件

```go
func ServerHeader(next echo.HandlerFunc) echo.HandlerFunc {
    return func(c echo.Context) error {
        c.Response().Header().Set("Server", "MyServer/1.0")
        return next(c)
    }
}

// 使用
e.Use(ServerHeader)
```

**中間件層級**：

```go
// 全域中間件
e.Use(middleware.Logger())

// 群組中間件
g := e.Group("/admin")
g.Use(middleware.BasicAuth(...))

// 路由中間件
e.GET("/users", getUsers, middleware.CORS())
```

### 7. Context 使用

#### 請求處理

```go
func handler(c echo.Context) error {
    // 請求相關
    req := c.Request()
    method := req.Method
    uri := req.RequestURI
    
    // 路徑參數
    id := c.Param("id")
    
    // 查詢參數
    name := c.QueryParam("name")
    
    // Form 參數
    email := c.FormValue("email")
    
    // Header
    token := c.Request().Header.Get("Authorization")
    
    // Cookie
    cookie, err := c.Cookie("session")
    
    // 文件上傳
    file, err := c.FormFile("file")
    if err == nil {
        src, _ := file.Open()
        defer src.Close()
        
        dst, _ := os.Create(file.Filename)
        defer dst.Close()
        
        io.Copy(dst, src)
    }
    
    return c.JSON(http.StatusOK, map[string]string{
        "method": method,
        "uri":    uri,
    })
}
```

#### 響應處理

```go
// JSON
c.JSON(http.StatusOK, user)

// JSONPretty（格式化）
c.JSONPretty(http.StatusOK, user, "  ")

// XML
c.XML(http.StatusOK, user)

// HTML
c.HTML(http.StatusOK, "<h1>Hello</h1>")

// String
c.String(http.StatusOK, "Hello, %s", name)

// Blob（二進制）
c.Blob(http.StatusOK, "image/png", imageData)

// File
c.File("path/to/file")

// Attachment（下載）
c.Attachment("path/to/file", "filename.pdf")

// Inline（在瀏覽器中顯示）
c.Inline("path/to/file", "filename.pdf")

// Redirect
c.Redirect(http.StatusMovedPermanently, "/new-path")

// Stream
c.Stream(http.StatusOK, "text/event-stream", reader)

// No Content
c.NoContent(http.StatusNoContent)
```

### 8. 數據綁定與驗證

#### 綁定 JSON

```go
type User struct {
    Name  string `json:"name" validate:"required,min=3,max=50"`
    Email string `json:"email" validate:"required,email"`
    Age   int    `json:"age" validate:"gte=0,lte=130"`
}

func createUser(c echo.Context) error {
    u := new(User)
    
    // 綁定 JSON
    if err := c.Bind(u); err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, err.Error())
    }
    
    // 驗證
    if err := c.Validate(u); err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, err.Error())
    }
    
    return c.JSON(http.StatusCreated, u)
}

// 設置驗證器
import "github.com/go-playground/validator/v10"

type CustomValidator struct {
    validator *validator.Validate
}

func (cv *CustomValidator) Validate(i interface{}) error {
    return cv.validator.Struct(i)
}

func main() {
    e := echo.New()
    e.Validator = &CustomValidator{validator: validator.New()}
}
```

#### 綁定其他格式

```go
// Query parameters
u := new(User)
c.Bind(u)  // 自動從查詢參數綁定

// Form data
c.Bind(u)  // 自動從表單綁定

// Path parameters
type ID struct {
    ID int `param:"id"`
}
id := new(ID)
c.Bind(id)

// Headers
type Headers struct {
    Authorization string `header:"Authorization"`
}
h := new(Headers)
c.Bind(h)
```

### 9. 錯誤處理

#### 自定義錯誤處理

```go
func customHTTPErrorHandler(err error, c echo.Context) {
    code := http.StatusInternalServerError
    message := "Internal Server Error"
    
    if he, ok := err.(*echo.HTTPError); ok {
        code = he.Code
        message = he.Message.(string)
    }
    
    // 記錄錯誤
    c.Logger().Error(err)
    
    // 返回 JSON 錯誤
    if !c.Response().Committed {
        if c.Request().Method == http.MethodHead {
            c.NoContent(code)
        } else {
            c.JSON(code, map[string]interface{}{
                "error": message,
            })
        }
    }
}

func main() {
    e := echo.New()
    e.HTTPErrorHandler = customHTTPErrorHandler
}
```

#### 使用 HTTPError

```go
func handler(c echo.Context) error {
    // 返回標準錯誤
    return echo.NewHTTPError(http.StatusBadRequest, "Invalid request")
    
    // 帶自定義數據
    return echo.NewHTTPError(http.StatusNotFound, map[string]interface{}{
        "error": "User not found",
        "code":  "USER_NOT_FOUND",
    })
}
```

### 10. 模板渲染

```go
import "html/template"

// 設置模板引擎
type Template struct {
    templates *template.Template
}

func (t *Template) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
    return t.templates.ExecuteTemplate(w, name, data)
}

func main() {
    e := echo.New()
    
    t := &Template{
        templates: template.Must(template.ParseGlob("views/*.html")),
    }
    e.Renderer = t
    
    e.GET("/", func(c echo.Context) error {
        return c.Render(http.StatusOK, "index.html", map[string]interface{}{
            "title": "Home",
            "user":  user,
        })
    })
}
```

### 11. WebSocket 支援

```go
import "github.com/labstack/echo/v4"

func wsHandler(c echo.Context) error {
    ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
    if err != nil {
        return err
    }
    defer ws.Close()
    
    for {
        // 讀取消息
        _, msg, err := ws.ReadMessage()
        if err != nil {
            c.Logger().Error(err)
            break
        }
        
        // 回應消息
        err = ws.WriteMessage(websocket.TextMessage, msg)
        if err != nil {
            c.Logger().Error(err)
            break
        }
    }
    
    return nil
}

func main() {
    e := echo.New()
    e.GET("/ws", wsHandler)
    e.Start(":8080")
}
```

### 12. 子域名路由

```go
func main() {
    e := echo.New()
    
    // 主域名
    e.GET("/", mainHandler)
    
    // API 子域名
    api := e.Host("api.example.com")
    api.GET("/users", getUsers)
    
    // Admin 子域名
    admin := e.Host("admin.example.com")
    admin.GET("/dashboard", dashboard)
    
    e.Start(":8080")
}
```

### 13. 優雅關機

```go
func main() {
    e := echo.New()
    
    // 路由設置
    e.GET("/", handler)
    
    // 在 goroutine 中啟動服務器
    go func() {
        if err := e.Start(":8080"); err != nil && err != http.ErrServerClosed {
            e.Logger.Fatal("shutting down the server")
        }
    }()
    
    // 等待中斷信號
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, os.Interrupt)
    <-quit
    
    // 優雅關機
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    
    if err := e.Shutdown(ctx); err != nil {
        e.Logger.Fatal(err)
    }
}
```

### 14. 完整範例

```go
package main

import (
    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
    "net/http"
)

type User struct {
    ID    int    `json:"id"`
    Name  string `json:"name" validate:"required"`
    Email string `json:"email" validate:"required,email"`
}

var users = make(map[int]*User)
var nextID = 1

func main() {
    e := echo.New()
    
    // 中間件
    e.Use(middleware.Logger())
    e.Use(middleware.Recover())
    e.Use(middleware.CORS())
    
    // 路由
    e.GET("/users", getUsers)
    e.GET("/users/:id", getUser)
    e.POST("/users", createUser)
    e.PUT("/users/:id", updateUser)
    e.DELETE("/users/:id", deleteUser)
    
    // 啟動
    e.Logger.Fatal(e.Start(":8080"))
}

func getUsers(c echo.Context) error {
    return c.JSON(http.StatusOK, users)
}

func getUser(c echo.Context) error {
    id, _ := strconv.Atoi(c.Param("id"))
    user, exists := users[id]
    
    if !exists {
        return echo.NewHTTPError(http.StatusNotFound, "User not found")
    }
    
    return c.JSON(http.StatusOK, user)
}

func createUser(c echo.Context) error {
    u := new(User)
    
    if err := c.Bind(u); err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, err.Error())
    }
    
    if err := c.Validate(u); err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, err.Error())
    }
    
    u.ID = nextID
    nextID++
    users[u.ID] = u
    
    return c.JSON(http.StatusCreated, u)
}

func updateUser(c echo.Context) error {
    id, _ := strconv.Atoi(c.Param("id"))
    user, exists := users[id]
    
    if !exists {
        return echo.NewHTTPError(http.StatusNotFound, "User not found")
    }
    
    if err := c.Bind(user); err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, err.Error())
    }
    
    if err := c.Validate(user); err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, err.Error())
    }
    
    return c.JSON(http.StatusOK, user)
}

func deleteUser(c echo.Context) error {
    id, _ := strconv.Atoi(c.Param("id"))
    
    if _, exists := users[id]; !exists {
        return echo.NewHTTPError(http.StatusNotFound, "User not found")
    }
    
    delete(users, id)
    
    return c.NoContent(http.StatusNoContent)
}
```

## 總結

**Echo 核心優勢**：
- ⚡ 高性能（接近 Gin）
- 📦 內建豐富中間件
- 🎯 專為 REST API 設計
- 🔧 靈活的擴展性
- 📚 完善的官方文檔

**與 Gin 對比**：
- **相似點**：都是高性能框架，基於 Radix Tree 路由
- **Echo 優勢**：內建更多中間件，WebSocket 支援
- **Gin 優勢**：性能略快，社群更大

**適用場景**：
- RESTful API 開發
- 微服務架構
- WebSocket 應用
- 實時通訊系統

**最佳實踐**：
- ✅ 使用內建中間件（減少依賴）
- ✅ 統一錯誤處理
- ✅ 數據綁定與驗證
- ✅ 優雅關機
- ✅ 日誌和監控

Echo 是 Gin 的優秀替代方案，尤其適合需要豐富內建功能的專案。
