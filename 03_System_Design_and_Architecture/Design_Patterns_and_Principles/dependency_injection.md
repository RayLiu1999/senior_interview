# 依賴注入 (Dependency Injection) 與控制反轉 (Inversion of Control)

- **難度**: 7
- **重要程度**: 5
- **標籤**: `設計原則`, `依賴注入`, `控制反轉`, `DI`, `IoC`, `解耦合`

## 問題詳述

依賴注入(DI)和控制反轉(IoC)是現代軟體開發中的核心設計原則,它們透過將物件的建立和依賴關係管理從類別內部移到外部,實現鬆耦合和高可測試性的程式碼架構。

## 核心理論與詳解

### 1. 基本概念

#### 1.1 什麼是依賴(Dependency)?

當類別 A 需要使用類別 B 的功能時,我們說 **A 依賴於 B**:

```go
// UserService 依賴於 MySQLRepository
type UserService struct {
    repo *MySQLRepository // 依賴
}

func (s *UserService) GetUser(id int) (*User, error) {
    return s.repo.FindByID(id)
}
```

#### 1.2 什麼是控制反轉(IoC)?

**控制反轉 (Inversion of Control)**:將程式的控制流程從應用程式程式碼轉移到框架或容器。

**傳統控制流**:
```
應用程式主動建立和管理物件
應用程式 → 建立物件 → 呼叫方法
```

**控制反轉後**:
```
框架/容器管理物件的生命週期
框架/容器 → 建立物件 → 注入到應用程式
```

**核心思想**:「Don't call us, we'll call you」(好萊塢原則)

#### 1.3 什麼是依賴注入(DI)?

**依賴注入 (Dependency Injection)**:是實現 IoC 的一種具體技術,透過外部注入依賴物件,而非在類別內部建立。

**沒有 DI 的程式碼**:

```go
type UserService struct {
    repo *MySQLRepository
}

func NewUserService() *UserService {
    return &UserService{
        repo: &MySQLRepository{}, // 內部建立依賴
    }
}
```

**有 DI 的程式碼**:

```go
type UserService struct {
    repo UserRepository // 依賴介面
}

func NewUserService(repo UserRepository) *UserService {
    return &UserService{
        repo: repo, // 外部注入依賴
    }
}
```

### 2. IoC 與 DI 的關係

```
控制反轉 (IoC)
    └── 依賴注入 (DI) ← 實現 IoC 的一種方式
    └── 服務定位器 (Service Locator) ← 另一種實現方式
    └── 事件驅動 (Event-Driven) ← 另一種實現方式
```

**關係說明**:
- **IoC** 是設計原則(What)
- **DI** 是實現技術(How)
- DI 是實現 IoC 最常用的方式

### 3. 依賴注入的三種方式

#### 3.1 建構式注入 (Constructor Injection) - 推薦

透過建構函式注入依賴:

```go
// 定義介面
type UserRepository interface {
    FindByID(id int) (*User, error)
    Save(user *User) error
}

// 服務類別
type UserService struct {
    repo UserRepository
}

// 建構式注入
func NewUserService(repo UserRepository) *UserService {
    return &UserService{
        repo: repo,
    }
}

// 使用
func main() {
    repo := &MySQLRepository{}
    service := NewUserService(repo) // 注入依賴
    user, _ := service.GetUser(123)
}
```

**優點**:
- 依賴關係明確
- 物件建立後即可使用(不可變性)
- 易於測試
- Go 語言推薦方式

#### 3.2 Setter 注入 (Setter Injection)

透過 Setter 方法注入依賴:

```go
type UserService struct {
    repo UserRepository
}

func NewUserService() *UserService {
    return &UserService{}
}

// Setter 注入
func (s *UserService) SetRepository(repo UserRepository) {
    s.repo = repo
}

// 使用
func main() {
    service := NewUserService()
    service.SetRepository(&MySQLRepository{}) // 注入依賴
}
```

**優點**:
- 可以在物件建立後修改依賴
- 適合可選依賴

**缺點**:
- 物件可能處於未初始化狀態
- 依賴關係不明確

#### 3.3 介面注入 (Interface Injection)

透過介面方法注入依賴:

```go
// 定義注入介面
type RepositoryInjector interface {
    InjectRepository(repo UserRepository)
}

type UserService struct {
    repo UserRepository
}

// 實現注入介面
func (s *UserService) InjectRepository(repo UserRepository) {
    s.repo = repo
}

// 使用
func main() {
    service := &UserService{}
    var injector RepositoryInjector = service
    injector.InjectRepository(&MySQLRepository{}) // 注入依賴
}
```

**優點**:
- 注入方式統一

**缺點**:
- 增加介面複雜度
- Go 中較少使用

### 4. 完整實現範例

#### 範例 1:不使用 DI vs 使用 DI

**❌ 沒有 DI - 緊耦合**:

```go
package main

import "fmt"

// 具體實現 - 緊耦合於 MySQL
type MySQLDatabase struct{}

func (db *MySQLDatabase) Query(sql string) string {
    return "MySQL result"
}

// UserService 直接依賴具體實現
type UserService struct {
    db *MySQLDatabase
}

func NewUserService() *UserService {
    return &UserService{
        db: &MySQLDatabase{}, // 內部建立,無法替換
    }
}

func (s *UserService) GetUser(id int) {
    result := s.db.Query("SELECT * FROM users")
    fmt.Println(result)
}

func main() {
    service := NewUserService()
    service.GetUser(1)
    
    // 問題:
    // 1. 無法切換到 PostgreSQL
    // 2. 無法進行單元測試(依賴真實資料庫)
    // 3. 修改資料庫需要修改 UserService
}
```

**✅ 使用 DI - 鬆耦合**:

```go
package main

import "fmt"

// 1. 定義介面(依賴抽象)
type Database interface {
    Query(sql string) string
}

// 2. 具體實現
type MySQLDatabase struct{}

func (db *MySQLDatabase) Query(sql string) string {
    return "MySQL result"
}

type PostgreSQLDatabase struct{}

func (db *PostgreSQLDatabase) Query(sql string) string {
    return "PostgreSQL result"
}

// 測試用的 Mock
type MockDatabase struct{}

func (db *MockDatabase) Query(sql string) string {
    return "Mock result"
}

// 3. 服務依賴介面
type UserService struct {
    db Database // 依賴介面,不依賴具體實現
}

// 4. 建構式注入
func NewUserService(db Database) *UserService {
    return &UserService{
        db: db,
    }
}

func (s *UserService) GetUser(id int) {
    result := s.db.Query(fmt.Sprintf("SELECT * FROM users WHERE id=%d", id))
    fmt.Println(result)
}

func main() {
    // 使用 MySQL
    mysqlDB := &MySQLDatabase{}
    service1 := NewUserService(mysqlDB)
    service1.GetUser(1)
    
    // 輕鬆切換到 PostgreSQL
    pgDB := &PostgreSQLDatabase{}
    service2 := NewUserService(pgDB)
    service2.GetUser(1)
    
    // 單元測試使用 Mock
    mockDB := &MockDatabase{}
    service3 := NewUserService(mockDB)
    service3.GetUser(1)
    
    // 優點:
    // 1. 可以輕鬆切換實現
    // 2. 易於測試(使用 Mock)
    // 3. 符合依賴反轉原則(DIP)
}
```

#### 範例 2:多層依賴注入

```go
package main

import "fmt"

// === 定義介面層 ===

type UserRepository interface {
    FindByID(id int) (*User, error)
    Save(user *User) error
}

type EmailService interface {
    SendEmail(to, subject, body string) error
}

type Logger interface {
    Info(message string)
    Error(message string)
}

// === 實體模型 ===

type User struct {
    ID    int
    Name  string
    Email string
}

// === 具體實現層 ===

// MySQL Repository
type MySQLUserRepository struct {
    connString string
}

func NewMySQLUserRepository(connString string) *MySQLUserRepository {
    return &MySQLUserRepository{connString: connString}
}

func (r *MySQLUserRepository) FindByID(id int) (*User, error) {
    fmt.Printf("[MySQL] 查詢使用者 ID=%d\n", id)
    return &User{ID: id, Name: "John", Email: "john@example.com"}, nil
}

func (r *MySQLUserRepository) Save(user *User) error {
    fmt.Printf("[MySQL] 儲存使用者: %+v\n", user)
    return nil
}

// SMTP Email Service
type SMTPEmailService struct {
    host string
    port int
}

func NewSMTPEmailService(host string, port int) *SMTPEmailService {
    return &SMTPEmailService{host: host, port: port}
}

func (s *SMTPEmailService) SendEmail(to, subject, body string) error {
    fmt.Printf("[SMTP] 發送郵件到 %s: %s\n", to, subject)
    return nil
}

// Console Logger
type ConsoleLogger struct{}

func (l *ConsoleLogger) Info(message string) {
    fmt.Printf("[INFO] %s\n", message)
}

func (l *ConsoleLogger) Error(message string) {
    fmt.Printf("[ERROR] %s\n", message)
}

// === 業務邏輯層(注入多個依賴) ===

type UserService struct {
    repo   UserRepository
    email  EmailService
    logger Logger
}

// 建構式注入多個依賴
func NewUserService(repo UserRepository, email EmailService, logger Logger) *UserService {
    return &UserService{
        repo:   repo,
        email:  email,
        logger: logger,
    }
}

func (s *UserService) RegisterUser(name, email string) error {
    s.logger.Info(fmt.Sprintf("註冊新使用者: %s", name))
    
    // 建立使用者
    user := &User{Name: name, Email: email}
    
    // 儲存到資料庫
    if err := s.repo.Save(user); err != nil {
        s.logger.Error(fmt.Sprintf("儲存使用者失敗: %v", err))
        return err
    }
    
    // 發送歡迎郵件
    if err := s.email.SendEmail(email, "歡迎註冊", "歡迎加入我們!"); err != nil {
        s.logger.Error(fmt.Sprintf("發送郵件失敗: %v", err))
        return err
    }
    
    s.logger.Info("使用者註冊成功")
    return nil
}

// === 應用程式入口(手動組裝依賴) ===

func main() {
    fmt.Println("=== 依賴注入範例:多層依賴 ===\n")
    
    // 建立依賴(從底層到上層)
    repo := NewMySQLUserRepository("localhost:3306")
    email := NewSMTPEmailService("smtp.gmail.com", 587)
    logger := &ConsoleLogger{}
    
    // 注入依賴到服務
    userService := NewUserService(repo, email, logger)
    
    // 使用服務
    userService.RegisterUser("Alice", "alice@example.com")
}
```

**輸出結果**:

```
=== 依賴注入範例:多層依賴 ===

[INFO] 註冊新使用者: Alice
[MySQL] 儲存使用者: &{ID:0 Name:Alice Email:alice@example.com}
[SMTP] 發送郵件到 alice@example.com: 歡迎註冊
[INFO] 使用者註冊成功
```

#### 範例 3:DI 容器(簡易版)

```go
package main

import (
    "fmt"
    "reflect"
    "sync"
)

// === 簡易 DI 容器實現 ===

type Container struct {
    services map[string]interface{}
    mu       sync.RWMutex
}

func NewContainer() *Container {
    return &Container{
        services: make(map[string]interface{}),
    }
}

// Register 註冊服務
func (c *Container) Register(name string, service interface{}) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.services[name] = service
}

// Resolve 解析服務
func (c *Container) Resolve(name string) (interface{}, error) {
    c.mu.RLock()
    defer c.mu.RUnlock()
    
    service, exists := c.services[name]
    if !exists {
        return nil, fmt.Errorf("service not found: %s", name)
    }
    return service, nil
}

// MustResolve 解析服務(失敗時 panic)
func (c *Container) MustResolve(name string) interface{} {
    service, err := c.Resolve(name)
    if err != nil {
        panic(err)
    }
    return service
}

// RegisterFactory 註冊工廠函數
func (c *Container) RegisterFactory(name string, factory func(*Container) interface{}) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.services[name] = factory(c)
}

// === 介面定義 ===

type Database interface {
    Query(sql string) string
}

type Cache interface {
    Get(key string) (string, bool)
    Set(key string, value string)
}

// === 具體實現 ===

type MySQLDatabase struct{}

func (db *MySQLDatabase) Query(sql string) string {
    return fmt.Sprintf("MySQL: %s", sql)
}

type RedisCache struct {
    data map[string]string
}

func NewRedisCache() *RedisCache {
    return &RedisCache{data: make(map[string]string)}
}

func (c *RedisCache) Get(key string) (string, bool) {
    val, ok := c.data[key]
    return val, ok
}

func (c *RedisCache) Set(key string, value string) {
    c.data[key] = value
}

// === 業務服務 ===

type UserService struct {
    db    Database
    cache Cache
}

func NewUserServiceWithContainer(container *Container) *UserService {
    return &UserService{
        db:    container.MustResolve("database").(Database),
        cache: container.MustResolve("cache").(Cache),
    }
}

func (s *UserService) GetUser(id int) string {
    key := fmt.Sprintf("user:%d", id)
    
    // 先查快取
    if value, ok := s.cache.Get(key); ok {
        return fmt.Sprintf("從快取獲取: %s", value)
    }
    
    // 查資料庫
    result := s.db.Query(fmt.Sprintf("SELECT * FROM users WHERE id=%d", id))
    
    // 寫入快取
    s.cache.Set(key, result)
    
    return result
}

// === 使用範例 ===

func main() {
    fmt.Println("=== DI 容器範例 ===\n")
    
    // 建立容器
    container := NewContainer()
    
    // 註冊服務
    container.Register("database", &MySQLDatabase{})
    container.Register("cache", NewRedisCache())
    
    // 使用工廠函數註冊(自動解析依賴)
    container.RegisterFactory("userService", func(c *Container) interface{} {
        return NewUserServiceWithContainer(c)
    })
    
    // 解析並使用服務
    userService := container.MustResolve("userService").(*UserService)
    
    result1 := userService.GetUser(1)
    fmt.Println(result1)
    
    result2 := userService.GetUser(1)
    fmt.Println(result2)
}
```

**輸出結果**:

```
=== DI 容器範例 ===

MySQL: SELECT * FROM users WHERE id=1
從快取獲取: MySQL: SELECT * FROM users WHERE id=1
```

### 5. Go 生態系中的 DI 框架

#### 5.1 Wire (Google) - 推薦

**特點**:編譯時依賴注入,使用程式碼生成。

```go
// wire.go
//go:build wireinject

package main

import "github.com/google/wire"

func InitializeUserService() *UserService {
    wire.Build(
        NewMySQLUserRepository,
        NewSMTPEmailService,
        NewConsoleLogger,
        NewUserService,
    )
    return nil
}
```

**執行**:
```bash
wire gen ./...
```

**優點**:
- 編譯時檢查,沒有執行時反射
- 效能高
- 易於除錯

#### 5.2 Dig (Uber)

**特點**:執行時依賴注入,使用反射。

```go
package main

import (
    "go.uber.org/dig"
)

func main() {
    container := dig.New()
    
    // 註冊提供者
    container.Provide(NewMySQLUserRepository)
    container.Provide(NewSMTPEmailService)
    container.Provide(NewConsoleLogger)
    container.Provide(NewUserService)
    
    // 呼叫函數並自動注入依賴
    container.Invoke(func(service *UserService) {
        service.RegisterUser("Alice", "alice@example.com")
    })
}
```

**優點**:
- 使用簡單
- 支援複雜的依賴關係

**缺點**:
- 執行時反射,效能較差
- 錯誤在執行時才發現

#### 5.3 Fx (Uber)

**特點**:基於 Dig 的應用程式框架。

```go
package main

import (
    "go.uber.org/fx"
)

func main() {
    fx.New(
        // 提供依賴
        fx.Provide(
            NewMySQLUserRepository,
            NewSMTPEmailService,
            NewConsoleLogger,
            NewUserService,
        ),
        // 呼叫函數
        fx.Invoke(func(service *UserService) {
            service.RegisterUser("Alice", "alice@example.com")
        }),
    ).Run()
}
```

### 6. DI 與 SOLID 原則的關係

#### 6.1 與依賴反轉原則(DIP)

DI 是實現 DIP 的主要手段:

```go
// DIP: 高層模組依賴抽象,而非具體實現
type UserService struct {
    repo UserRepository // 依賴介面(抽象)
}

// DI: 透過注入提供具體實現
func NewUserService(repo UserRepository) *UserService {
    return &UserService{repo: repo}
}
```

#### 6.2 與開閉原則(OCP)

透過 DI 實現對擴展開放:

```go
// 不修改 UserService,透過注入不同實現來擴展功能
service1 := NewUserService(&MySQLRepository{})
service2 := NewUserService(&PostgreSQLRepository{})
service3 := NewUserService(&MongoDBRepository{})
```

#### 6.3 與單一職責原則(SRP)

DI 讓類別專注於業務邏輯,而非依賴建立:

```go
// UserService 只負責業務邏輯
// 不負責建立 Repository(由外部注入)
type UserService struct {
    repo UserRepository
}
```

### 7. 優點與缺點

#### 優點

1. **鬆耦合**
   - 類別不依賴具體實現,只依賴介面
   - 易於替換不同實現

2. **可測試性**
   - 可以注入 Mock 物件進行單元測試
   - 不需要真實的資料庫或外部服務

3. **可維護性**
   - 依賴關係清晰
   - 易於理解和修改

4. **可重用性**
   - 類別可以在不同環境中重用
   - 只需注入不同的依賴

5. **符合 SOLID 原則**
   - 特別是依賴反轉原則(DIP)
   - 也支援開閉原則(OCP)和單一職責原則(SRP)

#### 缺點

1. **增加複雜度**
   - 需要額外的介面和抽象層
   - 依賴關係需要手動管理(或使用 DI 容器)

2. **學習曲線**
   - 初學者可能難以理解
   - 需要理解介面和抽象

3. **過度設計風險**
   - 簡單專案可能不需要 DI
   - 過多的抽象層可能降低可讀性

4. **執行時開銷**
   - 使用反射的 DI 框架(如 Dig)有效能開銷
   - 編譯時 DI(如 Wire)沒有此問題

### 8. 最佳實踐

#### 1. 優先使用建構式注入

```go
// ✅ 推薦:建構式注入
func NewUserService(repo UserRepository, logger Logger) *UserService {
    return &UserService{
        repo:   repo,
        logger: logger,
    }
}

// ❌ 避免:Setter 注入(Go 中)
func (s *UserService) SetRepository(repo UserRepository) {
    s.repo = repo
}
```

#### 2. 依賴介面而非具體實現

```go
// ✅ 正確:依賴介面
type UserService struct {
    repo UserRepository // 介面
}

// ❌ 錯誤:依賴具體實現
type UserService struct {
    repo *MySQLRepository // 具體類別
}
```

#### 3. 保持介面小而專注

```go
// ✅ 正確:小而專注的介面
type UserRepository interface {
    FindByID(id int) (*User, error)
    Save(user *User) error
}

// ❌ 錯誤:過大的介面
type Repository interface {
    FindUserByID(id int) (*User, error)
    SaveUser(user *User) error
    FindProductByID(id int) (*Product, error)
    SaveProduct(product *Product) error
    // ...更多方法
}
```

#### 4. 在最頂層組裝依賴

```go
func main() {
    // 在 main 函數中組裝所有依賴
    repo := NewMySQLRepository()
    logger := NewConsoleLogger()
    email := NewSMTPEmailService()
    
    userService := NewUserService(repo, logger, email)
    orderService := NewOrderService(repo, email)
    
    // 啟動應用程式
    server := NewServer(userService, orderService)
    server.Start()
}
```

#### 5. 考慮使用 Wire 進行自動組裝

```go
// wire.go
//go:build wireinject

func InitializeApp() *App {
    wire.Build(
        // 基礎設施
        NewMySQLRepository,
        NewRedisCache,
        NewConsoleLogger,
        
        // 服務
        NewUserService,
        NewOrderService,
        
        // 應用程式
        NewApp,
    )
    return nil
}

// main.go
func main() {
    app := InitializeApp()
    app.Run()
}
```

## 常見面試考點

### Q1:什麼是控制反轉(IoC)? 它和依賴注入(DI)有什麼關係?

**答案**:

**控制反轉 (IoC)**:

一種設計原則,將程式的控制流程從應用程式程式碼轉移到框架或容器。

**核心思想**:「Don't call us, we'll call you」

```
傳統方式: 應用程式主動建立物件和控制流程
IoC 方式: 框架控制物件建立和流程,應用程式被動接受
```

**依賴注入 (DI)**:

是**實現 IoC 的一種具體技術**,透過外部注入依賴物件,而非在類別內部建立。

**關係**:
- IoC 是**設計原則**(What - 要達到什麼目標)
- DI 是**實現技術**(How - 如何達到目標)
- DI 是實現 IoC 最常用的方式

**其他實現 IoC 的方式**:
- 服務定位器 (Service Locator)
- 事件驅動架構
- 模板方法模式

**類比**:
- IoC = "找工作時讓公司來找你"
- DI = "透過獵頭公司(DI 容器)撮合"

### Q2:依賴注入有哪些方式? Go 語言推薦哪種?

**答案**:

**三種方式**:

**1. 建構式注入 (Constructor Injection) - Go 推薦**

```go
type UserService struct {
    repo UserRepository
}

func NewUserService(repo UserRepository) *UserService {
    return &UserService{repo: repo}
}
```

**優點**:
- 依賴關係明確
- 物件建立後即可使用
- 支援不可變性
- **Go 語言慣用方式**

**2. Setter 注入 (Setter Injection)**

```go
type UserService struct {
    repo UserRepository
}

func (s *UserService) SetRepository(repo UserRepository) {
    s.repo = repo
}
```

**優點**:可以在建立後修改依賴

**缺點**:
- 物件可能處於未初始化狀態
- 依賴關係不明確
- **Go 中不推薦**

**3. 介面注入 (Interface Injection)**

```go
type RepositoryInjector interface {
    InjectRepository(repo UserRepository)
}

func (s *UserService) InjectRepository(repo UserRepository) {
    s.repo = repo
}
```

**優點**:注入方式統一

**缺點**:
- 增加複雜度
- **Go 中很少使用**

**Go 語言推薦**:

**建構式注入**是 Go 的慣用方式,因為:
1. 符合 Go 的簡潔哲學
2. 明確的初始化流程
3. 易於理解和使用

### Q3:如何設計一個易於測試的系統架構?

**答案**:

**核心原則**: 使用依賴注入 + 介面抽象

**完整範例**:

```go
// === 1. 定義介面(抽象層) ===

type UserRepository interface {
    FindByID(id int) (*User, error)
    Save(user *User) error
}

type EmailService interface {
    SendEmail(to, subject, body string) error
}

// === 2. 業務邏輯(依賴介面) ===

type UserService struct {
    repo  UserRepository
    email EmailService
}

func NewUserService(repo UserRepository, email EmailService) *UserService {
    return &UserService{
        repo:  repo,
        email: email,
    }
}

func (s *UserService) RegisterUser(name, email string) error {
    user := &User{Name: name, Email: email}
    
    if err := s.repo.Save(user); err != nil {
        return err
    }
    
    return s.email.SendEmail(email, "Welcome", "Welcome to our service!")
}

// === 3. 生產環境實現 ===

type MySQLRepository struct {
    db *sql.DB
}

func (r *MySQLRepository) FindByID(id int) (*User, error) {
    // 真實資料庫操作
    return &User{}, nil
}

func (r *MySQLRepository) Save(user *User) error {
    // 真實資料庫操作
    return nil
}

type SMTPEmailService struct {
    host string
}

func (s *SMTPEmailService) SendEmail(to, subject, body string) error {
    // 真實郵件發送
    return nil
}

// === 4. 測試環境實現(Mock) ===

type MockRepository struct {
    SaveCalled bool
    SavedUser  *User
}

func (m *MockRepository) FindByID(id int) (*User, error) {
    return &User{ID: id, Name: "Test User"}, nil
}

func (m *MockRepository) Save(user *User) error {
    m.SaveCalled = true
    m.SavedUser = user
    return nil
}

type MockEmailService struct {
    SendCalled bool
    LastEmail  string
}

func (m *MockEmailService) SendEmail(to, subject, body string) error {
    m.SendCalled = true
    m.LastEmail = to
    return nil
}

// === 5. 單元測試 ===

func TestUserService_RegisterUser(t *testing.T) {
    // 建立 Mock 物件
    mockRepo := &MockRepository{}
    mockEmail := &MockEmailService{}
    
    // 注入 Mock 物件
    service := NewUserService(mockRepo, mockEmail)
    
    // 執行測試
    err := service.RegisterUser("Alice", "alice@example.com")
    
    // 驗證結果
    if err != nil {
        t.Errorf("Expected no error, got %v", err)
    }
    
    if !mockRepo.SaveCalled {
        t.Error("Expected Save to be called")
    }
    
    if !mockEmail.SendCalled {
        t.Error("Expected SendEmail to be called")
    }
    
    if mockEmail.LastEmail != "alice@example.com" {
        t.Errorf("Expected email to alice@example.com, got %s", mockEmail.LastEmail)
    }
}
```

**關鍵要點**:

1. **介面抽象**:業務邏輯依賴介面,不依賴具體實現
2. **建構式注入**:透過建構函式注入依賴
3. **Mock 物件**:測試時注入 Mock 實現
4. **獨立測試**:不需要真實的資料庫或外部服務

**測試金字塔**:
```
        /\
       /  \  E2E(使用真實實現)
      /    \
     /------\ Integration(部分 Mock)
    /        \
   /----------\ Unit Tests(全部 Mock)
  /______________\
```

### Q4:Wire 和 Dig 有什麼區別? 如何選擇?

**答案**:

| 比較維度 | Wire (Google) | Dig (Uber) |
|---------|--------------|-----------|
| **類型** | 編譯時 DI | 執行時 DI |
| **實現方式** | 程式碼生成 | 反射 |
| **效能** | 高(無執行時開銷) | 較低(反射開銷) |
| **錯誤檢查** | 編譯時 | 執行時 |
| **除錯** | 容易(生成可讀程式碼) | 困難(反射呼叫) |
| **學習曲線** | 稍陡 | 較平緩 |
| **靈活性** | 較低 | 較高 |

**Wire 範例**:

```go
// wire.go
//go:build wireinject

package main

import "github.com/google/wire"

func InitializeUserService() *UserService {
    wire.Build(
        NewMySQLRepository,
        NewSMTPEmailService,
        NewUserService,
    )
    return nil // 由 wire 生成實際實現
}
```

**生成程式碼**:

```go
// wire_gen.go (自動生成)
func InitializeUserService() *UserService {
    repo := NewMySQLRepository()
    email := NewSMTPEmailService()
    service := NewUserService(repo, email)
    return service
}
```

**Dig 範例**:

```go
package main

import "go.uber.org/dig"

func main() {
    container := dig.New()
    
    // 註冊提供者
    container.Provide(NewMySQLRepository)
    container.Provide(NewSMTPEmailService)
    container.Provide(NewUserService)
    
    // 呼叫並自動注入
    container.Invoke(func(service *UserService) {
        service.RegisterUser("Alice", "alice@example.com")
    })
}
```

**如何選擇**:

**選擇 Wire 的場景**:
- 追求最佳效能
- 希望編譯時檢查錯誤
- 依賴關係相對固定
- 需要易於除錯

**選擇 Dig 的場景**:
- 需要動態註冊服務
- 依賴關係複雜且多變
- 對效能要求不極致
- 需要更高靈活性

**建議**:
- **新專案**:優先考慮 **Wire**(效能和安全性)
- **複雜專案**:考慮 **Dig**(靈活性)
- **小專案**:手動 DI 即可(不需要框架)

### Q5:依賴注入會增加系統複雜度嗎? 什麼時候不應該使用 DI?

**答案**:

**是的,DI 會增加複雜度**,主要體現在:

1. **需要額外的抽象層**(介面)
2. **依賴關係需要管理**
3. **初學者學習曲線**
4. **過多的間接層可能降低可讀性**

**不應該使用 DI 的場景**:

**1. 非常簡單的專案**

```go
// 簡單腳本,沒必要使用 DI
func main() {
    data := fetchData()
    processData(data)
    saveResult(data)
}
```

**2. 依賴關係簡單且不變**

```go
// 只有一種實現,且不需要測試
type Logger struct {
    file *os.File
}

// 沒必要抽象成介面
```

**3. 值物件或資料傳輸物件(DTO)**

```go
// User 是簡單的資料結構,不需要 DI
type User struct {
    ID   int
    Name string
}
```

**4. 不需要測試的程式碼**

```go
// 一次性腳本,不需要單元測試
func main() {
    db, _ := sql.Open("mysql", dsn)
    rows, _ := db.Query("SELECT * FROM users")
    // ...
}
```

**應該使用 DI 的場景**:

**1. 需要高可測試性**

```go
// 需要單元測試的業務邏輯
type UserService struct {
    repo UserRepository // 使用 DI 便於測試
}
```

**2. 需要支援多種實現**

```go
// 需要支援 MySQL、PostgreSQL、MongoDB
type UserService struct {
    repo UserRepository // 透過 DI 切換實現
}
```

**3. 需要鬆耦合的系統**

```go
// 微服務架構,服務間鬆耦合
type OrderService struct {
    userService  UserService
    paymentService PaymentService
}
```

**4. 長期維護的專案**

```
大型專案需要良好的架構支撐長期演進
DI 提供靈活性和可維護性
```

**判斷標準**:

```
專案複雜度 < 使用 DI 的成本 → 不使用 DI
專案複雜度 > 使用 DI 的成本 → 使用 DI
```

**建議**:
- **小專案**(<1000 行):不使用 DI
- **中型專案**(1000-10000 行):選擇性使用 DI(核心業務邏輯)
- **大型專案**(>10000 行):全面使用 DI

## 總結

依賴注入(DI)和控制反轉(IoC)是現代軟體設計的核心原則,透過將物件的建立和依賴管理從類別內部移到外部,實現鬆耦合、高可測試性的程式碼架構。

**關鍵要點**:

1. **IoC 是原則,DI 是實現**:IoC 是設計思想,DI 是具體技術
2. **Go 推薦建構式注入**:明確、簡潔、符合 Go 哲學
3. **依賴介面而非具體實現**:提供靈活性和可測試性
4. **Wire vs Dig**:編譯時 DI(Wire)效能更好,執行時 DI(Dig)更靈活
5. **權衡複雜度**:不是所有專案都需要 DI,視情況而定

**實務應用**:
- 單元測試(注入 Mock 物件)
- 微服務架構(服務解耦)
- 資料庫切換(MySQL ↔ PostgreSQL)
- 環境切換(開發 ↔ 測試 ↔ 生產)

**與 SOLID 的關係**:
- **DIP**(依賴反轉原則):DI 是實現 DIP 的主要手段
- **OCP**(開閉原則):透過注入不同實現來擴展功能
- **SRP**(單一職責原則):類別專注業務邏輯,不負責依賴建立

掌握 DI 和 IoC 是成為優秀後端工程師的必經之路,它們是構建可維護、可測試、可擴展系統的基石。
