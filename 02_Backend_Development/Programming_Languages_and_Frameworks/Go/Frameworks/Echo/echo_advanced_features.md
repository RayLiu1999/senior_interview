# Echo 進階特性與實戰

- **難度**: 6
- **重要程度**: 4
- **標籤**: `Echo`, `Advanced`, `Microservices`, `Best Practices`

## 問題詳述

請深入解釋 Echo 框架的進階特性，包括中間件開發、認證授權、微服務架構以及生產環境最佳實踐。

## 核心理論與詳解

### 1. 進階中間件開發

#### 帶配置的中間件

```go
type Config struct {
    Skipper    func(echo.Context) bool
    BeforeFunc func(echo.Context)
}

func CustomMiddleware(config Config) echo.MiddlewareFunc {
    // 預設配置
    if config.Skipper == nil {
        config.Skipper = func(c echo.Context) bool {
            return false
        }
    }
    
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            // 跳過條件
            if config.Skipper(c) {
                return next(c)
            }
            
            // 前置處理
            if config.BeforeFunc != nil {
                config.BeforeFunc(c)
            }
            
            // 執行下一個處理器
            return next(c)
        }
    }
}

// 使用
e.Use(CustomMiddleware(Config{
    Skipper: func(c echo.Context) bool {
        return c.Path() == "/health"
    },
    BeforeFunc: func(c echo.Context) {
        log.Println("Processing request")
    },
}))
```

#### JWT 認證中間件

```go
import (
    "github.com/golang-jwt/jwt/v5"
    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
)

type JWTClaims struct {
    UserID int    `json:"user_id"`
    Email  string `json:"email"`
    Role   string `json:"role"`
    jwt.RegisteredClaims
}

func JWTMiddleware(secret string) echo.MiddlewareFunc {
    config := middleware.JWTConfig{
        Claims:     &JWTClaims{},
        SigningKey: []byte(secret),
        TokenLookup: "header:Authorization:Bearer ,cookie:token",
        
        // 自定義成功處理
        SuccessHandler: func(c echo.Context) {
            token := c.Get("user").(*jwt.Token)
            claims := token.Claims.(*JWTClaims)
            
            // 設置用戶信息到 context
            c.Set("userID", claims.UserID)
            c.Set("email", claims.Email)
            c.Set("role", claims.Role)
        },
        
        // 自定義錯誤處理
        ErrorHandler: func(err error) error {
            return echo.NewHTTPError(http.StatusUnauthorized, "Invalid token")
        },
    }
    
    return middleware.JWTWithConfig(config)
}

// 使用
func main() {
    e := echo.New()
    
    // 公開路由
    e.POST("/login", loginHandler)
    
    // 需要認證的路由
    r := e.Group("/api")
    r.Use(JWTMiddleware("your-secret-key"))
    {
        r.GET("/profile", getProfile)
        r.POST("/posts", createPost)
    }
    
    e.Start(":8080")
}

// 生成 token
func loginHandler(c echo.Context) error {
    // 驗證用戶...
    
    claims := &JWTClaims{
        UserID: user.ID,
        Email:  user.Email,
        Role:   user.Role,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }
    
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    t, err := token.SignedString([]byte("your-secret-key"))
    
    if err != nil {
        return err
    }
    
    return c.JSON(http.StatusOK, map[string]string{
        "token": t,
    })
}
```

#### RBAC 中間件

```go
func RequireRole(roles ...string) echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            // 從 context 獲取角色
            userRole, ok := c.Get("role").(string)
            if !ok {
                return echo.NewHTTPError(http.StatusForbidden, "Role not found")
            }
            
            // 檢查角色
            for _, role := range roles {
                if userRole == role {
                    return next(c)
                }
            }
            
            return echo.NewHTTPError(http.StatusForbidden, "Insufficient permissions")
        }
    }
}

// 使用
admin := e.Group("/admin")
admin.Use(JWTMiddleware("secret"))
admin.Use(RequireRole("admin", "superadmin"))
{
    admin.DELETE("/users/:id", deleteUser)
}
```

### 2. 請求限流

#### 基於 IP 的限流

```go
import (
    "golang.org/x/time/rate"
    "sync"
)

type IPRateLimiter struct {
    ips map[string]*rate.Limiter
    mu  *sync.RWMutex
    r   rate.Limit
    b   int
}

func NewIPRateLimiter(r rate.Limit, b int) *IPRateLimiter {
    return &IPRateLimiter{
        ips: make(map[string]*rate.Limiter),
        mu:  &sync.RWMutex{},
        r:   r,
        b:   b,
    }
}

func (i *IPRateLimiter) AddIP(ip string) *rate.Limiter {
    i.mu.Lock()
    defer i.mu.Unlock()
    
    limiter := rate.NewLimiter(i.r, i.b)
    i.ips[ip] = limiter
    
    return limiter
}

func (i *IPRateLimiter) GetLimiter(ip string) *rate.Limiter {
    i.mu.Lock()
    limiter, exists := i.ips[ip]
    
    if !exists {
        i.mu.Unlock()
        return i.AddIP(ip)
    }
    
    i.mu.Unlock()
    return limiter
}

func RateLimitMiddleware(limiter *IPRateLimiter) echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            ip := c.RealIP()
            l := limiter.GetLimiter(ip)
            
            if !l.Allow() {
                return echo.NewHTTPError(http.StatusTooManyRequests, "Rate limit exceeded")
            }
            
            return next(c)
        }
    }
}

// 使用
func main() {
    e := echo.New()
    
    // 每秒 10 個請求，突發 20 個
    limiter := NewIPRateLimiter(10, 20)
    e.Use(RateLimitMiddleware(limiter))
    
    e.Start(":8080")
}
```

### 3. 資料庫整合

#### GORM 整合

```go
import (
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

type User struct {
    ID    uint   `gorm:"primaryKey"`
    Name  string `gorm:"size:100;not null"`
    Email string `gorm:"size:100;uniqueIndex;not null"`
}

var db *gorm.DB

func initDB() {
    dsn := "host=localhost user=postgres password=secret dbname=mydb port=5432"
    var err error
    db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
    
    if err != nil {
        panic("Failed to connect to database")
    }
    
    // 自動遷移
    db.AutoMigrate(&User{})
}

func getUsers(c echo.Context) error {
    var users []User
    result := db.Find(&users)
    
    if result.Error != nil {
        return echo.NewHTTPError(http.StatusInternalServerError, result.Error.Error())
    }
    
    return c.JSON(http.StatusOK, users)
}

func getUser(c echo.Context) error {
    id := c.Param("id")
    var user User
    
    result := db.First(&user, id)
    if result.Error != nil {
        if result.Error == gorm.ErrRecordNotFound {
            return echo.NewHTTPError(http.StatusNotFound, "User not found")
        }
        return echo.NewHTTPError(http.StatusInternalServerError, result.Error.Error())
    }
    
    return c.JSON(http.StatusOK, user)
}

func createUser(c echo.Context) error {
    user := new(User)
    
    if err := c.Bind(user); err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, err.Error())
    }
    
    result := db.Create(user)
    if result.Error != nil {
        return echo.NewHTTPError(http.StatusInternalServerError, result.Error.Error())
    }
    
    return c.JSON(http.StatusCreated, user)
}
```

### 4. Redis 整合

```go
import (
    "github.com/go-redis/redis/v8"
    "encoding/json"
)

var rdb *redis.Client

func initRedis() {
    rdb = redis.NewClient(&redis.Options{
        Addr:     "localhost:6379",
        Password: "",
        DB:       0,
    })
}

// 快取中間件
func CacheMiddleware(ttl time.Duration) echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            // 只快取 GET 請求
            if c.Request().Method != http.MethodGet {
                return next(c)
            }
            
            key := "cache:" + c.Request().URL.String()
            ctx := c.Request().Context()
            
            // 檢查快取
            cached, err := rdb.Get(ctx, key).Result()
            if err == nil {
                return c.JSONBlob(http.StatusOK, []byte(cached))
            }
            
            // 執行處理器
            if err := next(c); err != nil {
                return err
            }
            
            // 存入快取（如果響應成功）
            if c.Response().Status == http.StatusOK {
                body := c.Response().Writer.(*ResponseWriter).body
                rdb.Set(ctx, key, body, ttl)
            }
            
            return nil
        }
    }
}

// 自定義 ResponseWriter（用於捕獲響應）
type ResponseWriter struct {
    http.ResponseWriter
    body []byte
}

func (w *ResponseWriter) Write(b []byte) (int, error) {
    w.body = append(w.body, b...)
    return w.ResponseWriter.Write(b)
}
```

### 5. 微服務架構

#### 服務發現

```go
import (
    "github.com/hashicorp/consul/api"
)

type ServiceRegistry struct {
    client *api.Client
}

func NewServiceRegistry(addr string) (*ServiceRegistry, error) {
    config := api.DefaultConfig()
    config.Address = addr
    
    client, err := api.NewClient(config)
    if err != nil {
        return nil, err
    }
    
    return &ServiceRegistry{client: client}, nil
}

func (sr *ServiceRegistry) Register(name, host string, port int) error {
    registration := &api.AgentServiceRegistration{
        ID:      fmt.Sprintf("%s-%s-%d", name, host, port),
        Name:    name,
        Address: host,
        Port:    port,
        Check: &api.AgentServiceCheck{
            HTTP:     fmt.Sprintf("http://%s:%d/health", host, port),
            Interval: "10s",
            Timeout:  "3s",
        },
    }
    
    return sr.client.Agent().ServiceRegister(registration)
}

func (sr *ServiceRegistry) Deregister(serviceID string) error {
    return sr.client.Agent().ServiceDeregister(serviceID)
}

// 使用
func main() {
    e := echo.New()
    
    // 註冊到 Consul
    registry, _ := NewServiceRegistry("localhost:8500")
    registry.Register("user-service", "localhost", 8080)
    
    // 健康檢查端點
    e.GET("/health", func(c echo.Context) error {
        return c.String(http.StatusOK, "OK")
    })
    
    e.Start(":8080")
}
```

#### gRPC 整合

```go
import (
    "google.golang.org/grpc"
    pb "path/to/proto"
)

type UserService struct {
    pb.UnimplementedUserServiceServer
}

func (s *UserService) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
    // 實現邏輯
    return &pb.User{
        Id:    req.Id,
        Name:  "John",
        Email: "john@example.com",
    }, nil
}

func main() {
    e := echo.New()
    
    // HTTP 路由
    e.GET("/api/users/:id", getUser)
    
    // gRPC 服務器
    go func() {
        lis, _ := net.Listen("tcp", ":50051")
        grpcServer := grpc.NewServer()
        pb.RegisterUserServiceServer(grpcServer, &UserService{})
        grpcServer.Serve(lis)
    }()
    
    e.Start(":8080")
}
```

### 6. 監控與追蹤

#### Prometheus 指標

```go
import (
    "github.com/labstack/echo-contrib/prometheus"
)

func main() {
    e := echo.New()
    
    // Prometheus 中間件
    p := prometheus.NewPrometheus("echo", nil)
    p.Use(e)
    
    // 自定義指標
    requestCounter := prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "api_requests_total",
            Help: "Total API requests",
        },
        []string{"method", "path", "status"},
    )
    prometheus.MustRegister(requestCounter)
    
    e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            err := next(c)
            
            requestCounter.WithLabelValues(
                c.Request().Method,
                c.Path(),
                strconv.Itoa(c.Response().Status),
            ).Inc()
            
            return err
        }
    })
    
    e.Start(":8080")
}
```

#### 分布式追蹤（Jaeger）

```go
import (
    "github.com/opentracing/opentracing-go"
    "github.com/uber/jaeger-client-go"
    "github.com/uber/jaeger-client-go/config"
)

func initTracer() (opentracing.Tracer, io.Closer) {
    cfg := config.Configuration{
        ServiceName: "user-service",
        Sampler: &config.SamplerConfig{
            Type:  jaeger.SamplerTypeConst,
            Param: 1,
        },
        Reporter: &config.ReporterConfig{
            LogSpans:           true,
            LocalAgentHostPort: "localhost:6831",
        },
    }
    
    tracer, closer, _ := cfg.NewTracer()
    opentracing.SetGlobalTracer(tracer)
    
    return tracer, closer
}

func TracingMiddleware() echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            tracer := opentracing.GlobalTracer()
            
            spanCtx, _ := tracer.Extract(
                opentracing.HTTPHeaders,
                opentracing.HTTPHeadersCarrier(c.Request().Header),
            )
            
            span := tracer.StartSpan(
                c.Path(),
                opentracing.ChildOf(spanCtx),
            )
            defer span.Finish()
            
            c.Set("span", span)
            return next(c)
        }
    }
}
```

### 7. 日誌管理

#### 結構化日誌（zerolog）

```go
import (
    "github.com/rs/zerolog"
    "github.com/rs/zerolog/log"
)

func StructuredLogger() echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            start := time.Now()
            
            err := next(c)
            
            req := c.Request()
            res := c.Response()
            
            log.Info().
                Str("method", req.Method).
                Str("uri", req.RequestURI).
                Int("status", res.Status).
                Dur("latency", time.Since(start)).
                Str("ip", c.RealIP()).
                Str("user_agent", req.UserAgent()).
                Msg("Request processed")
            
            return err
        }
    }
}

func main() {
    // 配置日誌
    zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
    
    e := echo.New()
    e.Use(StructuredLogger())
    
    e.Start(":8080")
}
```

### 8. 配置管理

#### Viper 整合

```go
import "github.com/spf13/viper"

type Config struct {
    Server struct {
        Port int
        Host string
    }
    Database struct {
        Host     string
        Port     int
        User     string
        Password string
        DBName   string
    }
    Redis struct {
        Host string
        Port int
    }
    JWT struct {
        Secret string
        Expiry int
    }
}

func LoadConfig() (*Config, error) {
    viper.SetConfigName("config")
    viper.SetConfigType("yaml")
    viper.AddConfigPath(".")
    
    if err := viper.ReadInConfig(); err != nil {
        return nil, err
    }
    
    var config Config
    if err := viper.Unmarshal(&config); err != nil {
        return nil, err
    }
    
    return &config, nil
}

func main() {
    config, _ := LoadConfig()
    
    e := echo.New()
    
    addr := fmt.Sprintf("%s:%d", config.Server.Host, config.Server.Port)
    e.Start(addr)
}
```

### 9. 測試

#### 單元測試

```go
import (
    "github.com/stretchr/testify/assert"
    "net/http/httptest"
    "testing"
)

func TestGetUser(t *testing.T) {
    e := echo.New()
    req := httptest.NewRequest(http.MethodGet, "/users/1", nil)
    rec := httptest.NewRecorder()
    c := e.NewContext(req, rec)
    c.SetPath("/users/:id")
    c.SetParamNames("id")
    c.SetParamValues("1")
    
    // 執行處理器
    if assert.NoError(t, getUser(c)) {
        assert.Equal(t, http.StatusOK, rec.Code)
        assert.Contains(t, rec.Body.String(), "John")
    }
}

// 測試中間件
func TestAuthMiddleware(t *testing.T) {
    e := echo.New()
    
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
            token:      "Bearer " + validToken,
            wantStatus: 200,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            req := httptest.NewRequest(http.MethodGet, "/", nil)
            if tt.token != "" {
                req.Header.Set("Authorization", tt.token)
            }
            rec := httptest.NewRecorder()
            c := e.NewContext(req, rec)
            
            handler := JWTMiddleware("secret")(func(c echo.Context) error {
                return c.String(http.StatusOK, "success")
            })
            
            handler(c)
            assert.Equal(t, tt.wantStatus, rec.Code)
        })
    }
}
```

### 10. 生產環境最佳實踐

```go
func main() {
    // 載入配置
    config, _ := LoadConfig()
    
    // 初始化依賴
    initDB()
    initRedis()
    tracer, closer := initTracer()
    defer closer.Close()
    
    // 創建 Echo 實例
    e := echo.New()
    
    // 隱藏 Banner
    e.HideBanner = true
    e.HidePort = true
    
    // 全域中間件
    e.Use(middleware.Recover())
    e.Use(StructuredLogger())
    e.Use(TracingMiddleware())
    e.Use(middleware.CORS())
    e.Use(middleware.Secure())
    e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
        Level: 5,
    }))
    
    // 限流
    limiter := NewIPRateLimiter(100, 200)
    e.Use(RateLimitMiddleware(limiter))
    
    // 自定義錯誤處理
    e.HTTPErrorHandler = customHTTPErrorHandler
    
    // 健康檢查
    e.GET("/health", healthCheck)
    e.GET("/metrics", echo.WrapHandler(promhttp.Handler()))
    
    // API 路由
    api := e.Group("/api/v1")
    api.Use(CacheMiddleware(5 * time.Minute))
    {
        api.GET("/users", getUsers)
        api.GET("/users/:id", getUser)
        
        // 需要認證
        auth := api.Group("")
        auth.Use(JWTMiddleware(config.JWT.Secret))
        {
            auth.POST("/users", createUser)
            auth.PUT("/users/:id", updateUser)
            
            // 需要管理員權限
            admin := auth.Group("")
            admin.Use(RequireRole("admin"))
            {
                admin.DELETE("/users/:id", deleteUser)
            }
        }
    }
    
    // 配置服務器
    s := &http.Server{
        Addr:         fmt.Sprintf(":%d", config.Server.Port),
        ReadTimeout:  10 * time.Second,
        WriteTimeout: 10 * time.Second,
        IdleTimeout:  120 * time.Second,
    }
    e.Server = s
    
    // 優雅關機
    go func() {
        if err := e.StartServer(s); err != nil && err != http.ErrServerClosed {
            e.Logger.Fatal(err)
        }
    }()
    
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
    <-quit
    
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    
    if err := e.Shutdown(ctx); err != nil {
        e.Logger.Fatal(err)
    }
}
```

## 總結

**Echo 進階特性**：
- 🔐 **完善認證**：JWT、RBAC、OAuth2
- 🚦 **限流控制**：IP 限流、用戶限流
- 💾 **數據庫**：GORM、Redis 整合
- 📊 **監控追蹤**：Prometheus、Jaeger
- 🏗️ **微服務**：服務發現、gRPC
- 📝 **日誌管理**：結構化日誌
- ⚙️ **配置管理**：Viper 整合
- 🧪 **測試**：單元測試、集成測試

**生產環境清單**：
- ✅ 配置管理（環境變數、配置文件）
- ✅ 日誌收集（ELK Stack）
- ✅ 監控告警（Prometheus + Grafana）
- ✅ 分布式追蹤（Jaeger）
- ✅ 限流熔斷（Sentinel）
- ✅ 服務發現（Consul）
- ✅ 優雅關機
- ✅ 健康檢查

**性能優化**：
- 🎯 使用連接池
- 🎯 實施多層快取
- 🎯 使用 gzip 壓縮
- 🎯 非同步處理
- 🎯 數據庫查詢優化

Echo 提供了豐富的內建功能和靈活的擴展性，非常適合構建生產級別的微服務應用。
