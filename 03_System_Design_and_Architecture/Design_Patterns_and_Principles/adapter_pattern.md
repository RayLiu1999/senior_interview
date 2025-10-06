# 適配器模式 (Adapter Pattern)

- **難度**: 5
- **重要程度**: 4
- **標籤**: `設計模式`, `結構型模式`, `適配器`, `介面轉換`, `系統整合`

## 問題詳述

適配器模式是一種結構型設計模式,它允許將一個類別的介面轉換成客戶端期望的另一個介面,使得原本由於介面不相容而無法一起工作的類別可以協同工作。

## 核心理論與詳解

### 1. 定義與核心概念

#### GoF 定義

> **適配器模式 (Adapter Pattern)**:將一個類別的介面轉換成客戶希望的另外一個介面。適配器模式使得原本由於介面不相容而不能一起工作的那些類別可以一起工作。

#### 核心概念

適配器模式的本質是**介面轉換**。就像現實生活中的電源轉接頭,讓不同規格的插頭可以使用:

- **解決介面不相容問題**:讓舊系統與新系統對接
- **重用現有類別**:無需修改現有程式碼
- **解耦合**:客戶端不依賴於具體實現
- **提高靈活性**:便於替換或擴展

### 2. 角色與結構

#### UML 類別圖(物件適配器)

```
    +------------------+
    |     Target       |  <<interface>>
    +------------------+
    | + Request()      |
    +------------------+
             △
             |
    +------------------+       +------------------+
    |     Adapter      |------>|    Adaptee       |
    +------------------+       +------------------+
    | - adaptee        |       | + SpecificReq()  |
    | + Request()      |       +------------------+
    +------------------+
```

#### 角色說明

1. **Target (目標介面)**
   - 定義客戶端使用的特定領域介面
   - 客戶端期望的介面

2. **Adaptee (被適配者)**
   - 已存在的介面,需要被適配
   - 通常是舊系統或第三方庫

3. **Adapter (適配器)**
   - 實現 Target 介面
   - 持有 Adaptee 的引用
   - 將 Target 介面轉換為 Adaptee 介面

4. **Client (客戶端)**
   - 透過 Target 介面與 Adapter 互動

### 3. 兩種實現方式

#### 3.1 物件適配器 (Object Adapter) - 推薦

使用**組合**的方式,持有 Adaptee 的引用:

```go
type Adapter struct {
    adaptee *Adaptee // 組合
}

func (a *Adapter) Request() {
    a.adaptee.SpecificRequest()
}
```

**優點**:
- 靈活性高,可以適配 Adaptee 的任何子類別
- 符合組合優於繼承原則
- Go 語言推薦方式

#### 3.2 類別適配器 (Class Adapter)

使用**繼承**的方式(Go 不支援多重繼承,但可用嵌入模擬):

```go
type Adapter struct {
    Target  // 嵌入目標介面
    Adaptee // 嵌入被適配者
}
```

**缺點**:
- 靈活性較低
- Go 語言不完全支援

### 4. Go 實現範例

#### 範例 1:支付閘道適配器

**場景**:系統原本使用自定義的支付介面,現在要整合多個第三方支付(PayPal、Stripe、支付寶)。

```go
package main

import "fmt"

// PaymentProcessor 目標介面 - 系統期望的支付介面
type PaymentProcessor interface {
	ProcessPayment(amount float64) error
	RefundPayment(transactionID string) error
}

// === 現有系統中的支付實現 ===

// InternalPayment 內部支付系統
type InternalPayment struct{}

func (p *InternalPayment) ProcessPayment(amount float64) error {
	fmt.Printf("[內部支付] 處理支付: $%.2f\n", amount)
	return nil
}

func (p *InternalPayment) RefundPayment(transactionID string) error {
	fmt.Printf("[內部支付] 退款交易: %s\n", transactionID)
	return nil
}

// === 第三方支付 API (介面不相容) ===

// PayPalAPI PayPal 的 API 介面
type PayPalAPI struct{}

func (p *PayPalAPI) SendPayment(amount float64, currency string) {
	fmt.Printf("[PayPal] Sending payment: %.2f %s\n", amount, currency)
}

func (p *PayPalAPI) ProcessRefund(txID string) {
	fmt.Printf("[PayPal] Processing refund for: %s\n", txID)
}

// StripeAPI Stripe 的 API 介面
type StripeAPI struct{}

func (s *StripeAPI) Charge(cents int) {
	fmt.Printf("[Stripe] Charging: %d cents\n", cents)
}

func (s *StripeAPI) Refund(chargeID string) {
	fmt.Printf("[Stripe] Refunding charge: %s\n", chargeID)
}

// AlipayAPI 支付寶的 API 介面
type AlipayAPI struct{}

func (a *AlipayAPI) 支付(金額 float64) {
	fmt.Printf("[支付寶] 支付金額: ¥%.2f\n", 金額)
}

func (a *AlipayAPI) 退款(訂單號 string) {
	fmt.Printf("[支付寶] 退款訂單: %s\n", 訂單號)
}

// === 適配器實現 ===

// PayPalAdapter PayPal 適配器
type PayPalAdapter struct {
	paypal *PayPalAPI
}

func NewPayPalAdapter() *PayPalAdapter {
	return &PayPalAdapter{paypal: &PayPalAPI{}}
}

func (a *PayPalAdapter) ProcessPayment(amount float64) error {
	a.paypal.SendPayment(amount, "USD")
	return nil
}

func (a *PayPalAdapter) RefundPayment(transactionID string) error {
	a.paypal.ProcessRefund(transactionID)
	return nil
}

// StripeAdapter Stripe 適配器
type StripeAdapter struct {
	stripe *StripeAPI
}

func NewStripeAdapter() *StripeAdapter {
	return &StripeAdapter{stripe: &StripeAPI{}}
}

func (a *StripeAdapter) ProcessPayment(amount float64) error {
	// 轉換:將美元轉換為美分
	cents := int(amount * 100)
	a.stripe.Charge(cents)
	return nil
}

func (a *StripeAdapter) RefundPayment(transactionID string) error {
	a.stripe.Refund(transactionID)
	return nil
}

// AlipayAdapter 支付寶適配器
type AlipayAdapter struct {
	alipay *AlipayAPI
}

func NewAlipayAdapter() *AlipayAdapter {
	return &AlipayAdapter{alipay: &AlipayAPI{}}
}

func (a *AlipayAdapter) ProcessPayment(amount float64) error {
	// 假設需要將美元轉換為人民幣
	rmb := amount * 7.0
	a.alipay.支付(rmb)
	return nil
}

func (a *AlipayAdapter) RefundPayment(transactionID string) error {
	a.alipay.退款(transactionID)
	return nil
}

// === 客戶端程式碼 ===

// PaymentService 支付服務(客戶端)
type PaymentService struct {
	processor PaymentProcessor
}

func (s *PaymentService) MakePayment(amount float64) {
	s.processor.ProcessPayment(amount)
}

func (s *PaymentService) MakeRefund(txID string) {
	s.processor.RefundPayment(txID)
}

func main() {
	fmt.Println("=== 適配器模式範例:支付閘道整合 ===\n")

	// 使用內部支付
	fmt.Println("--- 使用內部支付系統 ---")
	service := &PaymentService{processor: &InternalPayment{}}
	service.MakePayment(100.00)
	service.MakeRefund("TX-12345")
	fmt.Println()

	// 使用 PayPal(透過適配器)
	fmt.Println("--- 使用 PayPal ---")
	service.processor = NewPayPalAdapter()
	service.MakePayment(150.00)
	service.MakeRefund("TX-67890")
	fmt.Println()

	// 使用 Stripe(透過適配器)
	fmt.Println("--- 使用 Stripe ---")
	service.processor = NewStripeAdapter()
	service.MakePayment(200.00)
	service.MakeRefund("CH-11111")
	fmt.Println()

	// 使用支付寶(透過適配器)
	fmt.Println("--- 使用支付寶 ---")
	service.processor = NewAlipayAdapter()
	service.MakePayment(88.88)
	service.MakeRefund("ORDER-22222")
}
```

**輸出結果**:

```
=== 適配器模式範例:支付閘道整合 ===

--- 使用內部支付系統 ---
[內部支付] 處理支付: $100.00
[內部支付] 退款交易: TX-12345

--- 使用 PayPal ---
[PayPal] Sending payment: 150.00 USD
[PayPal] Processing refund for: TX-67890

--- 使用 Stripe ---
[Stripe] Charging: 20000 cents
[Stripe] Refunding charge: CH-11111

--- 使用支付寶 ---
[支付寶] 支付金額: ¥621.16
[支付寶] 退款訂單: ORDER-22222
```

#### 範例 2:資料庫驅動適配器

**場景**:抽象資料庫操作,讓應用程式可以無縫切換不同資料庫(MySQL、PostgreSQL、MongoDB)。

```go
package main

import (
	"fmt"
)

// Database 目標介面 - 應用程式期望的資料庫介面
type Database interface {
	Connect(dsn string) error
	Query(sql string) ([]map[string]interface{}, error)
	Execute(sql string) error
	Close() error
}

// === 各種資料庫的原生 API ===

// MySQLDriver MySQL 原生驅動
type MySQLDriver struct {
	connected bool
}

func (m *MySQLDriver) Open(connectionString string) {
	fmt.Printf("[MySQL] Opening connection: %s\n", connectionString)
	m.connected = true
}

func (m *MySQLDriver) ExecuteQuery(query string) []map[string]interface{} {
	fmt.Printf("[MySQL] Executing query: %s\n", query)
	return []map[string]interface{}{{"id": 1, "name": "MySQL Data"}}
}

func (m *MySQLDriver) ExecuteCommand(cmd string) {
	fmt.Printf("[MySQL] Executing command: %s\n", cmd)
}

func (m *MySQLDriver) Disconnect() {
	fmt.Println("[MySQL] Disconnecting...")
	m.connected = false
}

// PostgresDriver PostgreSQL 原生驅動
type PostgresDriver struct {
	session interface{}
}

func (p *PostgresDriver) StartSession(dsn string) {
	fmt.Printf("[PostgreSQL] Starting session: %s\n", dsn)
	p.session = "active"
}

func (p *PostgresDriver) RunQuery(sql string) []map[string]interface{} {
	fmt.Printf("[PostgreSQL] Running query: %s\n", sql)
	return []map[string]interface{}{{"id": 2, "name": "PostgreSQL Data"}}
}

func (p *PostgresDriver) RunCommand(sql string) {
	fmt.Printf("[PostgreSQL] Running command: %s\n", sql)
}

func (p *PostgresDriver) EndSession() {
	fmt.Println("[PostgreSQL] Ending session...")
	p.session = nil
}

// MongoDBClient MongoDB 客戶端
type MongoDBClient struct {
	client interface{}
}

func (m *MongoDBClient) InitConnection(uri string) {
	fmt.Printf("[MongoDB] Initializing connection: %s\n", uri)
	m.client = "connected"
}

func (m *MongoDBClient) Find(collection string, filter interface{}) []map[string]interface{} {
	fmt.Printf("[MongoDB] Finding documents in %s with filter %v\n", collection, filter)
	return []map[string]interface{}{{"_id": "3", "name": "MongoDB Data"}}
}

func (m *MongoDBClient) InsertOne(collection string, doc interface{}) {
	fmt.Printf("[MongoDB] Inserting document into %s: %v\n", collection, doc)
}

func (m *MongoDBClient) CloseConnection() {
	fmt.Println("[MongoDB] Closing connection...")
	m.client = nil
}

// === 適配器實現 ===

// MySQLAdapter MySQL 適配器
type MySQLAdapter struct {
	driver *MySQLDriver
}

func NewMySQLAdapter() *MySQLAdapter {
	return &MySQLAdapter{driver: &MySQLDriver{}}
}

func (a *MySQLAdapter) Connect(dsn string) error {
	a.driver.Open(dsn)
	return nil
}

func (a *MySQLAdapter) Query(sql string) ([]map[string]interface{}, error) {
	return a.driver.ExecuteQuery(sql), nil
}

func (a *MySQLAdapter) Execute(sql string) error {
	a.driver.ExecuteCommand(sql)
	return nil
}

func (a *MySQLAdapter) Close() error {
	a.driver.Disconnect()
	return nil
}

// PostgresAdapter PostgreSQL 適配器
type PostgresAdapter struct {
	driver *PostgresDriver
}

func NewPostgresAdapter() *PostgresAdapter {
	return &PostgresAdapter{driver: &PostgresDriver{}}
}

func (a *PostgresAdapter) Connect(dsn string) error {
	a.driver.StartSession(dsn)
	return nil
}

func (a *PostgresAdapter) Query(sql string) ([]map[string]interface{}, error) {
	return a.driver.RunQuery(sql), nil
}

func (a *PostgresAdapter) Execute(sql string) error {
	a.driver.RunCommand(sql)
	return nil
}

func (a *PostgresAdapter) Close() error {
	a.driver.EndSession()
	return nil
}

// MongoDBAdapter MongoDB 適配器
type MongoDBAdapter struct {
	client     *MongoDBClient
	collection string
}

func NewMongoDBAdapter(collection string) *MongoDBAdapter {
	return &MongoDBAdapter{
		client:     &MongoDBClient{},
		collection: collection,
	}
}

func (a *MongoDBAdapter) Connect(dsn string) error {
	a.client.InitConnection(dsn)
	return nil
}

func (a *MongoDBAdapter) Query(sql string) ([]map[string]interface{}, error) {
	// 將 SQL 轉換為 MongoDB 查詢(簡化示例)
	fmt.Printf("[Adapter] Converting SQL to MongoDB query: %s\n", sql)
	return a.client.Find(a.collection, map[string]interface{}{}), nil
}

func (a *MongoDBAdapter) Execute(sql string) error {
	// 將 SQL 轉換為 MongoDB 操作(簡化示例)
	fmt.Printf("[Adapter] Converting SQL to MongoDB operation: %s\n", sql)
	a.client.InsertOne(a.collection, map[string]interface{}{"data": "example"})
	return nil
}

func (a *MongoDBAdapter) Close() error {
	a.client.CloseConnection()
	return nil
}

// === 客戶端程式碼 ===

// DataRepository 資料存取層(客戶端)
type DataRepository struct {
	db Database
}

func (r *DataRepository) GetData() {
	results, _ := r.db.Query("SELECT * FROM users")
	fmt.Printf("查詢結果: %v\n", results)
}

func (r *DataRepository) SaveData() {
	r.db.Execute("INSERT INTO users (name) VALUES ('John')")
}

func main() {
	fmt.Println("=== 適配器模式範例:資料庫驅動整合 ===\n")

	// 使用 MySQL
	fmt.Println("--- 使用 MySQL 資料庫 ---")
	mysqlDB := NewMySQLAdapter()
	repo := &DataRepository{db: mysqlDB}
	mysqlDB.Connect("mysql://localhost:3306/testdb")
	repo.GetData()
	repo.SaveData()
	mysqlDB.Close()
	fmt.Println()

	// 切換到 PostgreSQL
	fmt.Println("--- 切換到 PostgreSQL 資料庫 ---")
	pgDB := NewPostgresAdapter()
	repo.db = pgDB
	pgDB.Connect("postgres://localhost:5432/testdb")
	repo.GetData()
	repo.SaveData()
	pgDB.Close()
	fmt.Println()

	// 切換到 MongoDB
	fmt.Println("--- 切換到 MongoDB ---")
	mongoDB := NewMongoDBAdapter("users")
	repo.db = mongoDB
	mongoDB.Connect("mongodb://localhost:27017")
	repo.GetData()
	repo.SaveData()
	mongoDB.Close()
}
```

**輸出結果**:

```
=== 適配器模式範例:資料庫驅動整合 ===

--- 使用 MySQL 資料庫 ---
[MySQL] Opening connection: mysql://localhost:3306/testdb
[MySQL] Executing query: SELECT * FROM users
查詢結果: [map[id:1 name:MySQL Data]]
[MySQL] Executing command: INSERT INTO users (name) VALUES ('John')
[MySQL] Disconnecting...

--- 切換到 PostgreSQL 資料庫 ---
[PostgreSQL] Starting session: postgres://localhost:5432/testdb
[PostgreSQL] Running query: SELECT * FROM users
查詢結果: [map[id:2 name:PostgreSQL Data]]
[PostgreSQL] Running command: INSERT INTO users (name) VALUES ('John')
[PostgreSQL] Ending session...

--- 切換到 MongoDB ---
[MongoDB] Initializing connection: mongodb://localhost:27017
[Adapter] Converting SQL to MongoDB query: SELECT * FROM users
[MongoDB] Finding documents in users with filter map[]
查詢結果: [map[_id:3 name:MongoDB Data]]
[Adapter] Converting SQL to MongoDB operation: INSERT INTO users (name) VALUES ('John')
[MongoDB] Inserting document into users: map[data:example]
[MongoDB] Closing connection...
```

#### 範例 3:日誌記錄器適配器

**場景**:統一不同日誌庫的介面。

```go
package main

import (
	"fmt"
	"time"
)

// Logger 目標介面 - 應用程式期望的日誌介面
type Logger interface {
	Info(message string)
	Warning(message string)
	Error(message string)
}

// === 第三方日誌庫 ===

// ZapLogger Uber 的 Zap 日誌庫(模擬)
type ZapLogger struct{}

func (z *ZapLogger) InfoLog(msg string, fields map[string]interface{}) {
	fmt.Printf("[Zap] INFO: %s | Fields: %v | Time: %s\n", msg, fields, time.Now().Format("15:04:05"))
}

func (z *ZapLogger) WarnLog(msg string, fields map[string]interface{}) {
	fmt.Printf("[Zap] WARN: %s | Fields: %v | Time: %s\n", msg, fields, time.Now().Format("15:04:05"))
}

func (z *ZapLogger) ErrorLog(msg string, fields map[string]interface{}) {
	fmt.Printf("[Zap] ERROR: %s | Fields: %v | Time: %s\n", msg, fields, time.Now().Format("15:04:05"))
}

// LogrusLogger Logrus 日誌庫(模擬)
type LogrusLogger struct{}

func (l *LogrusLogger) WithFields(fields map[string]interface{}) *LogrusLogger {
	return l
}

func (l *LogrusLogger) Println(level, message string) {
	fmt.Printf("[Logrus] [%s] %s (timestamp: %d)\n", level, message, time.Now().Unix())
}

// === 適配器實現 ===

// ZapAdapter Zap 日誌適配器
type ZapAdapter struct {
	logger *ZapLogger
}

func NewZapAdapter() *ZapAdapter {
	return &ZapAdapter{logger: &ZapLogger{}}
}

func (a *ZapAdapter) Info(message string) {
	a.logger.InfoLog(message, map[string]interface{}{})
}

func (a *ZapAdapter) Warning(message string) {
	a.logger.WarnLog(message, map[string]interface{}{})
}

func (a *ZapAdapter) Error(message string) {
	a.logger.ErrorLog(message, map[string]interface{}{})
}

// LogrusAdapter Logrus 日誌適配器
type LogrusAdapter struct {
	logger *LogrusLogger
}

func NewLogrusAdapter() *LogrusAdapter {
	return &LogrusAdapter{logger: &LogrusLogger{}}
}

func (a *LogrusAdapter) Info(message string) {
	a.logger.WithFields(map[string]interface{}{}).Println("INFO", message)
}

func (a *LogrusAdapter) Warning(message string) {
	a.logger.WithFields(map[string]interface{}{}).Println("WARNING", message)
}

func (a *LogrusAdapter) Error(message string) {
	a.logger.WithFields(map[string]interface{}{}).Println("ERROR", message)
}

// SimpleLogger 簡單的標準日誌(已符合介面)
type SimpleLogger struct{}

func (s *SimpleLogger) Info(message string) {
	fmt.Printf("[Simple] INFO: %s\n", message)
}

func (s *SimpleLogger) Warning(message string) {
	fmt.Printf("[Simple] WARNING: %s\n", message)
}

func (s *SimpleLogger) Error(message string) {
	fmt.Printf("[Simple] ERROR: %s\n", message)
}

// === 客戶端程式碼 ===

// Application 應用程式
type Application struct {
	logger Logger
}

func (app *Application) Run() {
	app.logger.Info("應用程式啟動")
	app.logger.Warning("這是一個警告訊息")
	app.logger.Error("發生錯誤")
}

func main() {
	fmt.Println("=== 適配器模式範例:日誌記錄器整合 ===\n")

	// 使用簡單日誌
	fmt.Println("--- 使用 Simple Logger ---")
	app := &Application{logger: &SimpleLogger{}}
	app.Run()
	fmt.Println()

	// 切換到 Zap(透過適配器)
	fmt.Println("--- 切換到 Zap Logger ---")
	app.logger = NewZapAdapter()
	app.Run()
	fmt.Println()

	// 切換到 Logrus(透過適配器)
	fmt.Println("--- 切換到 Logrus Logger ---")
	app.logger = NewLogrusAdapter()
	app.Run()
}
```

### 5. 適配器模式 vs 其他模式

| 比較維度 | 適配器模式 | 代理模式 | 裝飾器模式 | 外觀模式 |
|---------|----------|---------|-----------|---------|
| **核心意圖** | 介面轉換 | 控制存取 | 增強功能 | 簡化介面 |
| **改變介面** | 是 | 否 | 否 | 是 |
| **何時使用** | 介面不相容 | 需要控制存取 | 需要動態新增功能 | 子系統太複雜 |
| **典型場景** | 整合舊系統 | 延遲載入、權限控制 | 動態新增日誌、快取 | 統一多個子系統的介面 |

### 6. 優點與缺點

#### 優點

1. **提高重用性**
   - 可以重用現有的類別,即使介面不相容
   - 不需要修改原始碼

2. **符合開閉原則**
   - 可以在不修改現有程式碼的情況下引入新的適配器
   - 易於擴展

3. **符合單一職責原則**
   - 適配器專注於介面轉換
   - 業務邏輯與介面轉換分離

4. **提高靈活性**
   - 可以輕鬆切換不同的實現
   - 便於整合第三方庫

#### 缺點

1. **增加系統複雜度**
   - 引入額外的類別和抽象層
   - 增加程式碼量

2. **可能影響效能**
   - 額外的方法呼叫和物件建立
   - 資料轉換的開銷

3. **過度使用**
   - 如果介面差異很小,直接修改可能更簡單
   - 需要權衡設計的複雜度

### 7. 適用場景

1. **整合舊系統或遺留程式碼**
   ```
   場景: 新系統需要使用舊系統的功能,但介面不相容
   例子: 將舊的 SOAP API 適配為 RESTful API
   ```

2. **整合第三方庫**
   ```
   場景: 使用第三方庫,但其介面不符合系統規範
   例子: 整合不同的支付閘道(PayPal、Stripe、支付寶)
   ```

3. **提供統一介面**
   ```
   場景: 多個類別功能相似但介面不同
   例子: 統一不同資料庫驅動的介面
   ```

4. **相容性層**
   ```
   場景: 提供向後相容或跨平台相容
   例子: Java 的 Collections.enumeration() 將 Iterator 適配為 Enumeration
   ```

### 8. 實際應用案例

#### 案例 1:Go 標準庫中的適配器

```go
// io.Reader 是目標介面
type Reader interface {
    Read(p []byte) (n int, err error)
}

// strings.Reader 將字串適配為 io.Reader
reader := strings.NewReader("Hello, World!")
buf := make([]byte, 5)
reader.Read(buf) // buf = "Hello"

// bytes.Buffer 將位元組切片適配為 io.Reader 和 io.Writer
buffer := bytes.NewBuffer([]byte("data"))
buffer.Read(buf)
```

#### 案例 2:ORM 框架的資料庫適配器

```go
// GORM 透過不同的 Dialector 適配不同資料庫
import (
    "gorm.io/driver/mysql"
    "gorm.io/driver/postgres"
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
)

// MySQL
db, _ := gorm.Open(mysql.Open(dsn), &gorm.Config{})

// PostgreSQL
db, _ := gorm.Open(postgres.Open(dsn), &gorm.Config{})

// SQLite
db, _ := gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
```

#### 案例 3:HTTP 客戶端適配器

```go
// HTTPClient 目標介面
type HTTPClient interface {
    Get(url string) (*Response, error)
    Post(url string, body []byte) (*Response, error)
}

// 標準庫的 http.Client 適配器
type StandardHTTPAdapter struct {
    client *http.Client
}

func (a *StandardHTTPAdapter) Get(url string) (*Response, error) {
    resp, err := a.client.Get(url)
    return convertResponse(resp), err
}

// Resty 客戶端適配器
type RestyAdapter struct {
    client *resty.Client
}

func (a *RestyAdapter) Get(url string) (*Response, error) {
    resp, err := a.client.R().Get(url)
    return convertRestyResponse(resp), err
}
```

### 9. 最佳實踐

#### 1. 優先使用物件適配器

```go
// ✅ 正確:使用組合
type PayPalAdapter struct {
    paypal *PayPalAPI // 組合
}

// ❌ 避免:在 Go 中使用嵌入模擬多重繼承
type PayPalAdapter struct {
    PaymentProcessor // 嵌入目標介面
    PayPalAPI        // 嵌入被適配者
}
```

#### 2. 適配器應該薄而專注

```go
// ✅ 正確:只負責介面轉換
func (a *PayPalAdapter) ProcessPayment(amount float64) error {
    a.paypal.SendPayment(amount, "USD") // 簡單轉換
    return nil
}

// ❌ 錯誤:在適配器中加入過多業務邏輯
func (a *PayPalAdapter) ProcessPayment(amount float64) error {
    // 驗證邏輯
    if amount <= 0 {
        return errors.New("invalid amount")
    }
    // 計算手續費
    fee := amount * 0.029
    // 記錄日誌
    log.Printf("Processing payment...")
    // ...過多業務邏輯
    a.paypal.SendPayment(amount, "USD")
    return nil
}
```

#### 3. 考慮雙向適配

```go
// 雙向適配器:既可以作為 A 使用,也可以作為 B 使用
type BidirectionalAdapter struct {
    a InterfaceA
    b InterfaceB
}

// 實現 InterfaceA
func (adapter *BidirectionalAdapter) MethodA() {
    adapter.b.MethodB()
}

// 實現 InterfaceB
func (adapter *BidirectionalAdapter) MethodB() {
    adapter.a.MethodA()
}
```

#### 4. 使用適配器工廠

```go
// 適配器工廠
type PaymentAdapterFactory struct{}

func (f *PaymentAdapterFactory) CreateAdapter(provider string) PaymentProcessor {
    switch provider {
    case "paypal":
        return NewPayPalAdapter()
    case "stripe":
        return NewStripeAdapter()
    case "alipay":
        return NewAlipayAdapter()
    default:
        return &InternalPayment{}
    }
}

// 使用
factory := &PaymentAdapterFactory{}
processor := factory.CreateAdapter("paypal")
processor.ProcessPayment(100.00)
```

#### 5. 錯誤處理與資料轉換

```go
// 在適配器中處理錯誤和資料轉換
type StripeAdapter struct {
    stripe *StripeAPI
}

func (a *StripeAdapter) ProcessPayment(amount float64) error {
    // 資料驗證
    if amount <= 0 {
        return errors.New("amount must be positive")
    }
    
    // 資料轉換
    cents := int(amount * 100)
    
    // 呼叫被適配者
    err := a.stripe.Charge(cents)
    
    // 錯誤轉換
    if err != nil {
        return fmt.Errorf("stripe payment failed: %w", err)
    }
    
    return nil
}
```

## 常見面試考點

### Q1:適配器模式和裝飾器模式有什麼區別?

**答案**:

雖然兩者結構相似(都是包裝另一個物件),但**意圖完全不同**:

| 維度 | 適配器模式 | 裝飾器模式 |
|-----|----------|-----------|
| **意圖** | 介面轉換(改變介面) | 功能增強(不改變介面) |
| **使用時機** | 介面不相容時 | 需要動態新增功能時 |
| **目標物件** | 已存在的物件(通常無法修改) | 任何實現相同介面的物件 |
| **介面變化** | 新介面與舊介面不同 | 介面保持不變 |
| **典型場景** | 整合第三方庫、舊系統 | 動態新增日誌、快取、驗證 |

**程式碼對比**:

```go
// 適配器模式 - 改變介面
type OldInterface interface {
    OldMethod()
}

type NewInterface interface {
    NewMethod() // 不同的介面
}

type Adapter struct {
    old OldInterface
}

func (a *Adapter) NewMethod() { // 實現新介面
    a.old.OldMethod() // 呼叫舊介面
}

// 裝飾器模式 - 不改變介面
type Component interface {
    Operation()
}

type Decorator struct {
    component Component
}

func (d *Decorator) Operation() { // 相同的介面
    // 新增前置邏輯
    d.component.Operation() // 委派
    // 新增後置邏輯
}
```

### Q2:什麼時候應該使用適配器模式?

**答案**:

適配器模式適用於以下場景:

**1. 整合舊系統或遺留程式碼**

```
問題: 新系統需要使用舊系統,但介面不相容
解決: 建立適配器將舊介面轉換為新介面
例子: 將舊的 SOAP 服務適配為 REST API
```

**2. 整合第三方庫**

```
問題: 第三方庫的介面與系統規範不符
解決: 建立適配器統一介面
例子: 整合不同的支付閘道(PayPal、Stripe、支付寶)
```

**3. 提供統一介面**

```
問題: 多個類別功能相似但介面不同
解決: 為它們建立統一的目標介面和各自的適配器
例子: 統一不同資料庫驅動(MySQL、PostgreSQL、MongoDB)
```

**4. 無法修改原始碼**

```
問題: 需要使用的類別無法修改(來自第三方或已編譯的庫)
解決: 建立適配器包裝該類別
例子: 整合無原始碼的商業元件
```

**不應該使用適配器模式的情況**:

- 介面差異很小,直接修改更簡單
- 可以修改原始碼,且修改成本不高
- 過度設計,增加不必要的複雜度

### Q3:物件適配器和類別適配器有什麼區別?Go 如何實現?

**答案**:

**物件適配器 (Object Adapter)**:

使用**組合(Composition)**的方式,持有被適配者的引用:

```go
// 物件適配器 - 使用組合
type ObjectAdapter struct {
    adaptee *Adaptee // 組合:持有引用
}

func (a *ObjectAdapter) Request() {
    a.adaptee.SpecificRequest()
}
```

**優點**:
- 可以適配 Adaptee 的任何子類別
- 更靈活,符合組合優於繼承原則
- Go 語言推薦方式

**類別適配器 (Class Adapter)**:

使用**繼承(Inheritance)**的方式:

```go
// 類別適配器 - 使用嵌入模擬多重繼承
type ClassAdapter struct {
    Target  // 嵌入目標介面
    Adaptee // 嵌入被適配者
}
```

**缺點**:
- Go 不支援多重繼承,只能用嵌入模擬
- 靈活性較差
- 可能導致介面污染

**Go 語言的特殊性**:

Go 沒有傳統的繼承機制,但可以使用**嵌入(Embedding)**模擬:

```go
// 使用嵌入的類別適配器
type Adaptee struct{}

func (a *Adaptee) SpecificRequest() {
    fmt.Println("Specific request")
}

type ClassAdapter struct {
    Adaptee // 嵌入:提升方法
}

func (a *ClassAdapter) Request() {
    a.SpecificRequest() // 直接呼叫嵌入類型的方法
}
```

**建議**:在 Go 中**優先使用物件適配器(組合)**,因為更符合 Go 的設計哲學。

### Q4:如何設計一個可擴展的支付系統適配器?

**答案**:

**設計要點**:

1. **定義統一的支付介面**
2. **為每個支付提供者建立適配器**
3. **使用工廠模式建立適配器**
4. **支援配置驅動**

**完整實現**:

```go
// 1. 統一的支付介面
type PaymentGateway interface {
    Pay(order *Order) (*PaymentResult, error)
    Refund(transactionID string) error
    QueryStatus(transactionID string) (*PaymentStatus, error)
}

// 2. 訂單和結果結構
type Order struct {
    ID       string
    Amount   float64
    Currency string
    UserID   string
}

type PaymentResult struct {
    TransactionID string
    Status        string
    Message       string
}

type PaymentStatus struct {
    Status string
    Paid   bool
}

// 3. 各個支付提供者的適配器
type PayPalAdapter struct {
    api    *PayPalAPI
    config *PayPalConfig
}

func (a *PayPalAdapter) Pay(order *Order) (*PaymentResult, error) {
    // 轉換訂單格式
    paypalOrder := convertToPayPalOrder(order)
    
    // 呼叫 PayPal API
    resp := a.api.CreatePayment(paypalOrder)
    
    // 轉換回應格式
    return &PaymentResult{
        TransactionID: resp.ID,
        Status:        resp.Status,
        Message:       resp.Message,
    }, nil
}

// 4. 支付閘道工廠
type PaymentGatewayFactory struct {
    adapters map[string]PaymentGateway
}

func NewPaymentGatewayFactory() *PaymentGatewayFactory {
    return &PaymentGatewayFactory{
        adapters: make(map[string]PaymentGateway),
    }
}

func (f *PaymentGatewayFactory) Register(name string, gateway PaymentGateway) {
    f.adapters[name] = gateway
}

func (f *PaymentGatewayFactory) Create(name string) (PaymentGateway, error) {
    if gateway, ok := f.adapters[name]; ok {
        return gateway, nil
    }
    return nil, fmt.Errorf("unknown payment gateway: %s", name)
}

// 5. 使用範例
func main() {
    factory := NewPaymentGatewayFactory()
    
    // 註冊支付提供者
    factory.Register("paypal", NewPayPalAdapter())
    factory.Register("stripe", NewStripeAdapter())
    factory.Register("alipay", NewAlipayAdapter())
    
    // 根據配置選擇支付提供者
    gateway, _ := factory.Create("paypal")
    
    // 處理支付
    order := &Order{
        ID:       "ORD-12345",
        Amount:   99.99,
        Currency: "USD",
        UserID:   "user-123",
    }
    
    result, err := gateway.Pay(order)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("支付成功: %s\n", result.TransactionID)
}
```

**關鍵設計原則**:

1. **統一介面**:所有支付提供者實現相同介面
2. **配置驅動**:透過配置檔案選擇支付提供者
3. **工廠模式**:使用工廠建立適配器
4. **可擴展**:新增支付提供者只需新增適配器並註冊
5. **錯誤處理**:統一的錯誤處理和日誌記錄

### Q5:在微服務架構中,適配器模式有哪些應用?

**答案**:

在微服務架構中,適配器模式有多種應用場景:

**1. API 閘道適配器**

```
場景: API Gateway 需要將外部請求轉換為內部微服務的格式
實現: 為每個微服務建立適配器,轉換請求/回應格式
```

```go
type UserServiceAdapter struct {
    client *grpc.Client
}

func (a *UserServiceAdapter) GetUser(req *HTTPRequest) (*HTTPResponse, error) {
    // 將 HTTP 請求轉換為 gRPC 請求
    grpcReq := &pb.GetUserRequest{Id: req.Params["id"]}
    
    // 呼叫內部 gRPC 服務
    grpcResp, err := a.client.GetUser(context.Background(), grpcReq)
    
    // 將 gRPC 回應轉換為 HTTP 回應
    return convertToHTTPResponse(grpcResp), err
}
```

**2. 資料格式適配器**

```
場景: 不同微服務使用不同的資料格式(JSON、Protobuf、XML)
實現: 建立格式轉換適配器
```

**3. 協定適配器**

```
場景: 統一不同的通訊協定(REST、gRPC、GraphQL)
實現: 為每種協定建立適配器
```

**4. 訊息佇列適配器**

```
場景: 統一不同訊息佇列的介面(Kafka、RabbitMQ、NATS)
實現: 建立統一的訊息介面和各自的適配器
```

```go
type MessageQueue interface {
    Publish(topic string, message []byte) error
    Subscribe(topic string, handler func([]byte)) error
}

type KafkaAdapter struct {
    producer sarama.SyncProducer
}

type RabbitMQAdapter struct {
    channel *amqp.Channel
}
```

**5. 服務發現適配器**

```
場景: 支援多種服務發現機制(Consul、Etcd、Kubernetes)
實現: 統一服務發現介面
```

**優點**:
- 降低服務間耦合
- 便於切換不同的實現
- 支援平滑遷移和灰度發布
- 提高系統可測試性

## 總結

適配器模式是一種實用的結構型設計模式,其核心價值在於**介面轉換**,讓不相容的介面可以協同工作。

**關鍵要點**:

1. **意圖是介面轉換**,解決介面不相容問題
2. **兩種實現方式**:物件適配器(組合)和類別適配器(繼承)
3. **Go 語言推薦使用物件適配器**(組合優於繼承)
4. **與裝飾器的區別**:適配器改變介面,裝飾器增強功能
5. **適用場景**:整合舊系統、第三方庫、提供統一介面

**實務應用**:
- 支付閘道整合
- 資料庫驅動統一
- 日誌庫統一
- API 閘道
- 微服務協定轉換

在實際開發中,適配器模式廣泛應用於系統整合、框架設計和微服務架構,是後端工程師必須掌握的重要模式之一。善用適配器模式可以提高程式碼的可重用性、靈活性和可維護性。
