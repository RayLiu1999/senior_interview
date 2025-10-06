# 什麼是依賴反轉原則 (Dependency Inversion Principle, DIP)？

- **難度**: 7
- **重要性**: 5
- **標籤**: `SOLID`, `DIP`, `Design Principles`

## 問題詳述

依賴反轉原則是 SOLID 中最具影響力的原則之一，它要求高層模組不應該依賴低層模組，兩者都應該依賴抽象。這個原則如何改變傳統的依賴關係，以及如何在實際開發中應用？

## 核心理論與詳解

### 定義與本質

**依賴反轉原則 (DIP)** 由 Robert C. Martin 提出：

> "A. High-level modules should not depend on low-level modules. Both should depend on abstractions.  
> B. Abstractions should not depend on details. Details should depend on abstractions."

**中文翻譯**：
- A. 高層模組不應該依賴低層模組，兩者都應該依賴抽象
- B. 抽象不應該依賴細節，細節應該依賴抽象

**關鍵術語**：
- **高層模組**：包含業務邏輯、策略的模組
- **低層模組**：實現細節、基礎設施的模組
- **抽象**：接口或抽象類別
- **細節**：具體實現

**"反轉"的含義**：
```
傳統依賴方向：高層 → 低層
反轉後依賴方向：高層 → 抽象 ← 低層
```

### 為什麼需要 DIP？

#### 問題：傳統的依賴關係

```go
// ❌ 違反 DIP：高層直接依賴低層

// 低層模組：具體實現
type MySQLDatabase struct {
    conn *sql.DB
}

func (m *MySQLDatabase) Save(data string) error {
    _, err := m.conn.Exec("INSERT INTO data VALUES (?)", data)
    return err
}

// 高層模組：業務邏輯
type UserService struct {
    db *MySQLDatabase // 直接依賴具體實現
}

func (u *UserService) RegisterUser(name string) error {
    // 業務邏輯
    return u.db.Save(name)
}

// 問題：
// 1. UserService 與 MySQLDatabase 緊耦合
// 2. 無法替換資料庫（如改用 PostgreSQL）
// 3. 難以測試（無法 mock 資料庫）
// 4. 修改 MySQLDatabase 可能影響 UserService
```

**依賴關係圖**：
```
UserService (高層)
     ↓
MySQLDatabase (低層)
```

#### 解決：應用 DIP

```go
// ✅ 符合 DIP：依賴抽象

// 抽象層
type Database interface {
    Save(data string) error
    Load(id string) (string, error)
}

// 低層模組：實現抽象
type MySQLDatabase struct {
    conn *sql.DB
}

func (m *MySQLDatabase) Save(data string) error {
    _, err := m.conn.Exec("INSERT INTO data VALUES (?)", data)
    return err
}

func (m *MySQLDatabase) Load(id string) (string, error) {
    var data string
    err := m.conn.QueryRow("SELECT data FROM data WHERE id = ?", id).Scan(&data)
    return data, err
}

type PostgreSQLDatabase struct {
    conn *sql.DB
}

func (p *PostgreSQLDatabase) Save(data string) error {
    _, err := p.conn.Exec("INSERT INTO data VALUES ($1)", data)
    return err
}

func (p *PostgreSQLDatabase) Load(id string) (string, error) {
    var data string
    err := p.conn.QueryRow("SELECT data FROM data WHERE id = $1", id).Scan(&data)
    return data, err
}

// 高層模組：依賴抽象
type UserService struct {
    db Database // 依賴介面而非具體實現
}

func (u *UserService) RegisterUser(name string) error {
    return u.db.Save(name)
}

// 使用時注入具體實現
func main() {
    // 可以輕鬆替換實現
    mysqlDB := &MySQLDatabase{conn: mysqlConn}
    service1 := &UserService{db: mysqlDB}
    
    postgresDB := &PostgreSQLDatabase{conn: postgresConn}
    service2 := &UserService{db: postgresDB}
    
    // 測試時注入 mock
    mockDB := &MockDatabase{}
    service3 := &UserService{db: mockDB}
}
```

**反轉後的依賴關係圖**：
```
       Database (抽象)
         ↗       ↖
UserService    MySQLDatabase
  (高層)          (低層)
```

### DIP 的三大優勢

#### 1. **降低耦合度**
```go
// 高層模組不知道低層的具體實現
// 只知道接口契約
type OrderService struct {
    payment    PaymentProcessor // 介面
    inventory  InventoryManager  // 介面
    notifier   Notifier          // 介面
}

// 可以任意替換具體實現
// 不影響 OrderService 的代碼
```

#### 2. **提高可測試性**
```go
// 測試時注入 mock 對象

type MockPayment struct{}

func (m *MockPayment) Process(amount float64) error {
    return nil // 測試專用實現
}

func TestOrderService(t *testing.T) {
    service := &OrderService{
        payment:   &MockPayment{},
        inventory: &MockInventory{},
        notifier:  &MockNotifier{},
    }
    
    // 可以輕鬆測試 OrderService
}
```

#### 3. **支持靈活擴展**
```go
// 新增實現不需要修改高層模組
type BitcoinPayment struct{}

func (b *BitcoinPayment) Process(amount float64) error {
    // 新的支付方式
    return nil
}

// OrderService 無需修改即可使用
service := &OrderService{
    payment: &BitcoinPayment{},
}
```

### DIP 與依賴注入 (Dependency Injection)

**DIP 是原則，DI 是實踐方式**

#### 方式 1: 構造函數注入 (推薦)
```go
type UserService struct {
    repo   UserRepository
    cache  Cache
    logger Logger
}

// 通過構造函數注入依賴
func NewUserService(repo UserRepository, cache Cache, logger Logger) *UserService {
    return &UserService{
        repo:   repo,
        cache:  cache,
        logger: logger,
    }
}

// 使用
func main() {
    repo := NewMySQLRepository()
    cache := NewRedisCache()
    logger := NewConsoleLogger()
    
    service := NewUserService(repo, cache, logger)
}
```

#### 方式 2: 方法注入
```go
type Processor struct{}

// 通過方法參數注入
func (p *Processor) Process(logger Logger, data string) error {
    logger.Log("Processing:", data)
    return nil
}
```

#### 方式 3: 介面注入
```go
type ServiceInitializer interface {
    Initialize(config Config) error
}

type MyService struct {
    config Config
}

func (s *MyService) Initialize(config Config) error {
    s.config = config
    return nil
}
```

#### 方式 4: 使用依賴注入容器 (適用於大型應用)
```go
// 使用 Google Wire 或 Uber Fx 等 DI 框架

type Container struct {
    services map[string]interface{}
}

func (c *Container) Register(name string, service interface{}) {
    c.services[name] = service
}

func (c *Container) Resolve(name string) interface{} {
    return c.services[name]
}

// 配置依賴
func ConfigureContainer() *Container {
    container := &Container{services: make(map[string]interface{})}
    
    // 註冊依賴
    container.Register("database", NewMySQLDatabase())
    container.Register("cache", NewRedisCache())
    container.Register("userService", NewUserService(
        container.Resolve("database").(Database),
        container.Resolve("cache").(Cache),
    ))
    
    return container
}
```

### 實際應用場景

#### 場景 1: 分層架構

```go
// ✅ 應用 DIP 的分層架構

// ===== 領域層 (高層) =====
type OrderService struct {
    repo      OrderRepository // 依賴抽象
    payment   PaymentGateway  // 依賴抽象
}

func (s *OrderService) PlaceOrder(order *Order) error {
    // 業務邏輯
    if err := s.payment.Charge(order.Total); err != nil {
        return err
    }
    return s.repo.Save(order)
}

// ===== 介面層 (抽象) =====
type OrderRepository interface {
    Save(order *Order) error
    FindByID(id string) (*Order, error)
}

type PaymentGateway interface {
    Charge(amount float64) error
    Refund(transactionID string) error
}

// ===== 基礎設施層 (低層) =====
type MySQLOrderRepository struct {
    db *sql.DB
}

func (r *MySQLOrderRepository) Save(order *Order) error {
    // 實現細節
    return nil
}

func (r *MySQLOrderRepository) FindByID(id string) (*Order, error) {
    return nil, nil
}

type StripePaymentGateway struct {
    apiKey string
}

func (g *StripePaymentGateway) Charge(amount float64) error {
    // Stripe API 調用
    return nil
}

func (g *StripePaymentGateway) Refund(transactionID string) error {
    return nil
}

// 組裝
func main() {
    repo := &MySQLOrderRepository{db: dbConn}
    payment := &StripePaymentGateway{apiKey: "sk_test_..."}
    
    service := &OrderService{
        repo:    repo,
        payment: payment,
    }
}
```

**依賴方向**：
```
OrderService (領域層)
     ↓
OrderRepository, PaymentGateway (介面層)
     ↑
MySQLOrderRepository, StripePaymentGateway (基礎設施層)
```

#### 場景 2: 六邊形架構 (Hexagonal Architecture)

```go
// 核心業務邏輯 (高層)
type BookingService struct {
    roomRepo    RoomRepository  // Port
    notifier    Notifier        // Port
    paymentGate PaymentGateway  // Port
}

func (s *BookingService) BookRoom(userID, roomID string) error {
    // 純業務邏輯，不依賴具體實現
    room, err := s.roomRepo.FindAvailable(roomID)
    if err != nil {
        return err
    }
    
    if err := s.paymentGate.Charge(room.Price); err != nil {
        return err
    }
    
    s.notifier.Notify(userID, "Booking confirmed")
    return s.roomRepo.MarkAsBooked(roomID)
}

// Ports (抽象)
type RoomRepository interface {
    FindAvailable(roomID string) (*Room, error)
    MarkAsBooked(roomID string) error
}

type Notifier interface {
    Notify(userID, message string) error
}

// Adapters (具體實現)
type PostgresRoomRepository struct{}
type EmailNotifier struct{}
type SMSNotifier struct{}
type PayPalGateway struct{}
```

#### 場景 3: 插件架構

```go
// 核心應用
type Application struct {
    plugins []Plugin // 依賴抽象
}

// 插件接口
type Plugin interface {
    Name() string
    Execute(ctx context.Context) error
}

// 具體插件
type LoggingPlugin struct{}

func (l *LoggingPlugin) Name() string {
    return "Logging"
}

func (l *LoggingPlugin) Execute(ctx context.Context) error {
    fmt.Println("Logging executed")
    return nil
}

type MonitoringPlugin struct{}

func (m *MonitoringPlugin) Name() string {
    return "Monitoring"
}

func (m *MonitoringPlugin) Execute(ctx context.Context) error {
    fmt.Println("Monitoring executed")
    return nil
}

// 動態加載插件
func (a *Application) RegisterPlugin(plugin Plugin) {
    a.plugins = append(a.plugins, plugin)
}

func (a *Application) Run(ctx context.Context) error {
    for _, plugin := range a.plugins {
        if err := plugin.Execute(ctx); err != nil {
            return err
        }
    }
    return nil
}
```

### DIP 與其他原則的關係

#### 與開閉原則 (OCP)
```go
// DIP 是實現 OCP 的關鍵手段

// 依賴抽象使得系統對擴展開放
type Notifier interface {
    Send(message string) error
}

// 新增實現不需要修改高層模組 (OCP)
type SlackNotifier struct{}
type DiscordNotifier struct{}
```

#### 與里氏替換原則 (LSP)
```go
// DIP 依賴抽象，LSP 確保實現可以正確替換

// 所有實現都必須遵守 Notifier 的契約 (LSP)
func SendNotification(notifier Notifier, msg string) error {
    return notifier.Send(msg) // 任何實現都應該正常工作
}
```

### 常見誤區與權衡

#### 誤區 1: 為所有依賴創建介面

```go
// ❌ 過度抽象
type StringConverter interface {
    ToUpper(s string) string
    ToLower(s string) string
}

// Go 標準庫已經提供了 strings.ToUpper
// 沒必要為它創建介面

// ✅ 只為需要替換的依賴創建抽象
// - 外部服務 (資料庫、API)
// - 有多種實現的組件
// - 需要測試隔離的依賴
```

#### 誤區 2: 抽象洩漏 (Leaky Abstraction)

```go
// ❌ 抽象洩漏了實現細節
type Database interface {
    ExecuteSQL(sql string) error // 洩漏了 SQL 細節
    GetConnection() *sql.DB      // 洩漏了連接對象
}

// ✅ 抽象應該隱藏實現細節
type UserRepository interface {
    Save(user *User) error
    FindByID(id string) (*User, error)
    // 不暴露 SQL 或資料庫細節
}
```

#### 誤區 3: 循環依賴

```go
// ❌ 循環依賴
type A struct {
    b B
}

type B struct {
    a A
}

// ✅ 使用介面打破循環
type BInterface interface {
    DoSomething()
}

type A struct {
    b BInterface
}

type B struct {
    // 不依賴 A
}
```

### 實踐檢查清單

```
✓ 高層模組是否直接依賴具體的低層模組？
✓ 是否為外部依賴 (資料庫、API、文件系統) 定義了介面？
✓ 具體實現是否可以輕鬆替換？
✓ 單元測試是否可以注入 mock 對象？
✓ 介面是否由高層模組定義 (而非低層)？
✓ 抽象是否穩定 (不頻繁修改)？
✓ 是否存在抽象洩漏？
```

### Go 語言中的 DIP 最佳實踐

#### 1. 介面隔離
```go
// 定義小而專注的介面
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

// 需要時組合
type ReadWriter interface {
    Reader
    Writer
}
```

#### 2. 使用工廠函數
```go
func NewUserService(repo UserRepository, logger Logger) *UserService {
    if repo == nil {
        panic("repo cannot be nil")
    }
    if logger == nil {
        logger = NewNoOpLogger() // 默認實現
    }
    return &UserService{
        repo:   repo,
        logger: logger,
    }
}
```

#### 3. 使用選項模式 (Options Pattern)
```go
type ServiceOption func(*Service)

func WithCache(cache Cache) ServiceOption {
    return func(s *Service) {
        s.cache = cache
    }
}

func WithLogger(logger Logger) ServiceOption {
    return func(s *Service) {
        s.logger = logger
    }
}

func NewService(repo Repository, opts ...ServiceOption) *Service {
    s := &Service{repo: repo}
    for _, opt := range opts {
        opt(s)
    }
    return s
}

// 使用
service := NewService(
    repo,
    WithCache(redisCache),
    WithLogger(logger),
)
```

## 總結

**核心要點**：
1. **依賴抽象而非具體實現**：介面是契約
2. **高層定義抽象，低層實現抽象**：依賴方向反轉
3. **通過依賴注入實現 DIP**：構造函數注入最常用
4. **降低耦合，提高靈活性**：易於測試和擴展

**實踐建議**：
- 為外部依賴 (資料庫、API) 定義介面
- 使用構造函數注入依賴
- 讓介面保持穩定，避免頻繁修改
- 不要過度抽象，只在需要時使用
- 介面由使用者定義，而非實現者

**判斷依據**：
- 高層直接 import 低層包 → 違反 DIP
- 無法替換具體實現 → 違反 DIP
- 無法注入 mock 進行測試 → 違反 DIP
- 抽象洩漏實現細節 → 抽象設計不當

**DIP 的終極目標**：
- 讓系統依賴穩定的抽象
- 而非依賴易變的具體實現
- 從而實現高內聚、低耦合的架構
