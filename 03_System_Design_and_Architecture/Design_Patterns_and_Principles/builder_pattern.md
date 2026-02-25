# 什麼是建造者模式 (Builder Pattern)？

- **難度**: 5
- **重要程度**: 4
- **標籤**: `Design Pattern`, `Builder`, `Creational`

## 問題詳述

建造者模式是一種創建型設計模式，用於將一個複雜物件的**構建過程**與其**最終表示**分離，使得同樣的構建步驟可以創建出不同的表示（最終結果）。特別適用於建構步驟複雜、參數眾多的物件。

## 核心理論與詳解

### 問題背景：多參數建構子地獄

當一個物件有大量可選參數時，使用傳統建構子的方式有以下痛點：

```go
// 反模式：多參數建構子，可讀性極差
user := NewUser("Alice", 28, "alice@email.com", "123 Main St", true, false, "zh-TW")
// 呼叫者完全不知道每個參數的含義，容易傳錯位置
```

建造者模式提供了清晰、可讀的解決方案。

### 兩種在 Go 中的慣用實現

**方式一：Functional Options Pattern（主流 Go 慣例）**

這是 Go 社群最推崇的構建模式，尤其適合函式庫設計。通過 `WithXxx` 函數提供流暢的選項設定：

```go
type Server struct {
    host    string
    port    int
    timeout int
    maxConn int
}

// Option 是一個函數類型，接受 *Server 並對其進行設定
type Option func(*Server)

// 各個 WithXxx 函數是具體的選項
func WithHost(host string) Option {
    return func(s *Server) { s.host = host }
}
func WithPort(port int) Option {
    return func(s *Server) { s.port = port }
}
func WithTimeout(timeout int) Option {
    return func(s *Server) { s.timeout = timeout }
}

// NewServer 是建造者，接收若干個 Option
func NewServer(opts ...Option) *Server {
    // 設定預設值
    s := &Server{
        host:    "localhost",
        port:    8080,
        timeout: 30,
        maxConn: 100,
    }
    // 套用所有傳入的選項（Override 預設值）
    for _, opt := range opts {
        opt(s)
    }
    return s
}

// 使用方式：清晰、可讀、可選
srv := NewServer(
    WithHost("0.0.0.0"),
    WithPort(9090),
    WithTimeout(60),
    // maxConn 未傳入，使用預設值 100
)
```

**方式二：Builder Struct（適合需要驗證的場景）**

```go
type QueryBuilder struct {
    table      string
    conditions []string
    orderBy    string
    limit      int
}

func NewQueryBuilder(table string) *QueryBuilder {
    return &QueryBuilder{table: table}
}

// 方法鏈 (Method Chaining / Fluent Interface)
func (b *QueryBuilder) Where(condition string) *QueryBuilder {
    b.conditions = append(b.conditions, condition)
    return b
}

func (b *QueryBuilder) OrderBy(column string) *QueryBuilder {
    b.orderBy = column
    return b
}

func (b *QueryBuilder) Limit(n int) *QueryBuilder {
    b.limit = n
    return b
}

// Build() 是最終的建造步驟，此時可以進行參數驗證
func (b *QueryBuilder) Build() (string, error) {
    if b.table == "" {
        return "", fmt.Errorf("table name is required")
    }
    // ... 組合 SQL 字串
    return fmt.Sprintf("SELECT * FROM %s ...", b.table), nil
}

// 使用方式（Fluent Interface）：
query, err := NewQueryBuilder("users").
    Where("age > 18").
    Where("status = 'active'").
    OrderBy("created_at DESC").
    Limit(10).
    Build()
```

### 建造者模式的核心優勢

**1. 命名參數效果（Named Parameters）**

Go 不支援命名參數，但 WithXxx 方式讓每個設定的意圖一目了然，程式碼自文件化（self-documenting）。

**2. 預設值管理**

所有預設值集中在 `NewXxx()` 建構函式中管理，呼叫方無需了解預設值。

**3. 不可變性（Immutability）**

Builder 可在最後的 `Build()` 步驟才建立最終物件，該物件可以是不可變的（所有欄位為私有）。

**4. 驗證集中化**

可以在 `Build()` 方法中進行完整的參數合法性驗證，而不必在各個 setter 中分散驗證。

### 標準庫與框架中的實際應用

- **`gorm.DB` 的鏈式呼叫**：`db.Where(...).Order(...).Limit(...).Find(&users)` 就是 Builder 模式
- **`net/http` 的 `http.NewRequest`**：帶有 RequestBuilder 的變體設計
- **`google/grpc-go` 的 `grpc.Dial(addr, opts...)`**：使用 Functional Options
- **`uber-go/zap` 的 `zap.NewLogger(config, opts...)`**：透過 options 構建 logger

### 與工廠模式的核心區別

| 維度 | 工廠模式 | 建造者模式 |
| :--- | :--- | :--- |
| **關注點** | 「建立什麼」類型的物件 | 「如何一步一步」建立複雜物件 |
| **建立步驟** | 一步完成 | 多步完成 |
| **適用場景** | 物件類型的選擇 | 物件配置的組合 |
| **可選參數** | 不擅長處理 | 天然優勢 |
