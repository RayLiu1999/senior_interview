# 什麼是責任鏈模式 (Chain of Responsibility Pattern)？

- **難度**: 6
- **重要程度**: 4
- **標籤**: `Design Pattern`, `Chain of Responsibility`, `Behavioral`, `Middleware`

## 問題詳述

責任鏈模式是一種行為型設計模式，它將多個處理者（Handler）串聯成一條鏈，發送者將請求沿著這條鏈傳遞，直到有某個處理者處理它為止。發送者無需知道哪個具體處理者會接收並處理請求，從而實現發送者與處理者的解耦。

## 核心理論與詳解

### 核心概念

責任鏈的本質是**「請求的委派與傳遞」**：

```
Request → [Handler_1] → [Handler_2] → [Handler_3] → ... → 終點
                ↑ 處理 or 傳遞      ↑ 處理 or 傳遞
```

每個 Handler 可以做以下三件事之一：
1. **自己處理**請求並終止鏈
2. **傳遞**給下一個 Handler 繼續處理
3. **修改**請求後，再傳遞給下一個 Handler（Middleware 模式）

### Go 中的責任鏈實現

**方式一：純責任鏈（純「轉發或終止」模式）**

```go
type Handler interface {
    SetNext(handler Handler)
    Handle(request int) string
}

// BaseHandler 提供鏈式設定的骨架
type BaseHandler struct {
    next Handler
}

func (h *BaseHandler) SetNext(handler Handler) { h.next = handler }

func (h *BaseHandler) PassToNext(request int) string {
    if h.next != nil {
        return h.next.Handle(request)
    }
    return "請求未被任何處理者處理"
}

// 具體處理者：只處理緊急程度 >= 1 的請求
type LowPriorityHandler struct{ BaseHandler }
func (h *LowPriorityHandler) Handle(request int) string {
    if request <= 3 {
        return fmt.Sprintf("LowPriority 處理了請求 %d", request)
    }
    return h.PassToNext(request) // 傳給下一個
}

type HighPriorityHandler struct{ BaseHandler }
func (h *HighPriorityHandler) Handle(request int) string {
    if request > 3 {
        return fmt.Sprintf("HighPriority 處理了請求 %d", request)
    }
    return h.PassToNext(request)
}

// 使用：構建鏈
low := &LowPriorityHandler{}
high := &HighPriorityHandler{}
low.SetNext(high)

low.Handle(2) // LowPriority 處理
low.Handle(5) // 傳遞給 HighPriority 處理
```

**方式二：Middleware Chain（Go/Node.js 框架的主流實現）**

在 Gin/Echo 等框架中，Middleware 不僅僅是「轉發」，而是**包裝執行**：每個 Middleware 都會在請求前後執行邏輯，類似洋蔥圈模型：

```go
// HandlerFunc 定義每個 Middleware 的函數簽名
type HandlerFunc func(ctx *Context)

// Middleware：對 HandlerFunc 進行包裝
type Middleware func(next HandlerFunc) HandlerFunc

// 日誌 Middleware
func LoggingMiddleware(next HandlerFunc) HandlerFunc {
    return func(ctx *Context) {
        start := time.Now()
        next(ctx) // 執行後面的 Handler 或下一個 Middleware
        log.Printf("請求耗時: %v", time.Since(start))
    }
}

// 認證 Middleware
func AuthMiddleware(next HandlerFunc) HandlerFunc {
    return func(ctx *Context) {
        token := ctx.Header("Authorization")
        if !validateToken(token) {
            ctx.AbortWithStatus(401) // 終止鏈，不呼叫 next
            return
        }
        next(ctx) // 認證通過，繼續鏈
    }
}

// 構建 Middleware 鏈
func Chain(middlewares ...Middleware) Middleware {
    return func(final HandlerFunc) HandlerFunc {
        for i := len(middlewares) - 1; i >= 0; i-- {
            final = middlewares[i](final)
        }
        return final
    }
}

// 使用：
handler := Chain(LoggingMiddleware, AuthMiddleware)(actualHandler)
```

### 洋蔥圈模型 vs 純責任鏈

| 特性 | 純責任鏈 | Middleware 洋蔥圈 |
| :--- | :--- | :--- |
| **結構** | 線性傳遞 | 巢狀包裝 |
| **執行時機** | Handler 選擇是否傳遞 | 每個中介層都會執行（前後各一次） |
| **使用場景** | 事件處理、審批流程 | HTTP 請求處理、gRPC 攔截器 |
| **代表框架** | Java 的 Servlet Filter | Go 的 Gin/Echo，Express.js |

### 實際應用場景

**1. 審批系統（Approval Workflow）**

```
費用申請: 5000元 → [組長: 上限3000，轉發] → [部門主管: 上限8000，核准]
費用申請: 50000元 → 組長 → 主管 → [VP: 上限100000，核准]
```

**2. 異常處理鏈**

```go
// 按優先順序嘗試不同的錯誤恢復策略
type ErrorHandler interface {
    Handle(err error) bool
}
// RetryHandler → FallbackHandler → AlertHandler → DeadLetterHandler
```

**3. gRPC 攔截器 (Interceptor)**

gRPC 的 `UnaryServerInterceptor` 鏈本質上就是責任鏈：

```go
grpc.NewServer(
    grpc.ChainUnaryInterceptor(
        loggingInterceptor,
        authInterceptor,
        rateLimitInterceptor,
    ),
)
```

**4. 事件總線的過濾器鏈**

Prometheus 的 AlertManager 路由樹（routing tree）就是責任鏈的樹狀擴展版本，告警訊息依序匹配規則並路由到對應接收者。

### 優缺點分析

**優點：**
- 解耦請求發送者與接收者
- 支援動態構建和修改處理鏈（runtime 調整）
- 符合單一職責原則，每個 Handler 只負責自己能處理的部分
- 符合開閉原則，新增 Handler 不需修改現有程式碼

**缺點：**
- 鏈過長時，追蹤請求流向困難（需要完善的日誌）
- 不保證請求一定會被處理（需要在鏈尾設置預設處理者）
- Middleware 模式下，執行順序可能影響行為（如 Auth 應在 Rate Limit 之前）
