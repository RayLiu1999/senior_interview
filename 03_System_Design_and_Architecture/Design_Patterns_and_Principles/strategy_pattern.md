# 什麼是策略模式 (Strategy Pattern)？

- **難度**: 5
- **重要性**: 5
- **標籤**: `Design Pattern`, `Strategy`, `Behavioral`

## 問題詳述

策略模式是一種行為型設計模式，它定義了一系列算法，將每個算法封裝起來，並使它們可以互相替換。策略模式讓算法的變化獨立於使用算法的客戶端。在實際開發中如何應用這個模式？

## 核心理論與詳解

### 定義與本質

**策略模式**允許在運行時選擇算法的行為。

**核心思想**：
- 定義一個算法族，分別封裝起來
- 讓它們之間可以互相替換
- 使算法的變化不影響使用算法的客戶端
- **組合優於繼承**的典型體現

**三個核心角色**：
1. **Strategy (策略介面)**：定義所有支持算法的公共接口
2. **ConcreteStrategy (具體策略)**：實現 Strategy 介面的具體算法
3. **Context (上下文)**：持有 Strategy 引用，負責調用算法

### 解決什麼問題？

#### 問題：使用 if-else 或 switch-case 實現多種算法

```go
// ❌ 不使用策略模式：違反開閉原則

type PaymentProcessor struct{}

func (p *PaymentProcessor) Process(paymentType string, amount float64) error {
    if paymentType == "credit_card" {
        // 信用卡支付邏輯
        fmt.Printf("Processing credit card payment: $%.2f\n", amount)
        return nil
    } else if paymentType == "paypal" {
        // PayPal 支付邏輯
        fmt.Printf("Processing PayPal payment: $%.2f\n", amount)
        return nil
    } else if paymentType == "bitcoin" {
        // 比特幣支付邏輯
        fmt.Printf("Processing Bitcoin payment: $%.2f\n", amount)
        return nil
    } else if paymentType == "alipay" {
        // 支付寶邏輯
        fmt.Printf("Processing Alipay payment: $%.2f\n", amount)
        return nil
    }
    return errors.New("unsupported payment type")
}

// 問題：
// 1. 每次新增支付方式都要修改這個方法
// 2. 方法會越來越長，難以維護
// 3. 違反開閉原則
// 4. 無法獨立測試每種支付方式
// 5. 所有支付邏輯耦合在一起
```

### 策略模式的實現

#### 基本結構

```go
// ✅ 使用策略模式

// 1. 策略介面
type PaymentStrategy interface {
    Pay(amount float64) error
    Validate() error
}

// 2. 具體策略
type CreditCardPayment struct {
    CardNumber string
    CVV        string
    ExpiryDate string
}

func (c *CreditCardPayment) Validate() error {
    if len(c.CardNumber) != 16 {
        return errors.New("invalid card number")
    }
    if len(c.CVV) != 3 {
        return errors.New("invalid CVV")
    }
    return nil
}

func (c *CreditCardPayment) Pay(amount float64) error {
    fmt.Printf("Processing credit card payment: $%.2f\n", amount)
    fmt.Printf("Card: ****%s\n", c.CardNumber[12:])
    return nil
}

type PayPalPayment struct {
    Email    string
    Password string
}

func (p *PayPalPayment) Validate() error {
    if !strings.Contains(p.Email, "@") {
        return errors.New("invalid email")
    }
    return nil
}

func (p *PayPalPayment) Pay(amount float64) error {
    fmt.Printf("Processing PayPal payment: $%.2f\n", amount)
    fmt.Printf("Email: %s\n", p.Email)
    return nil
}

type BitcoinPayment struct {
    WalletAddress string
}

func (b *BitcoinPayment) Validate() error {
    if len(b.WalletAddress) < 26 {
        return errors.New("invalid wallet address")
    }
    return nil
}

func (b *BitcoinPayment) Pay(amount float64) error {
    btcAmount := amount / 30000.0 // 假設匯率
    fmt.Printf("Sending %.8f BTC to %s\n", btcAmount, b.WalletAddress)
    return nil
}

// 3. 上下文
type PaymentProcessor struct {
    strategy PaymentStrategy
}

func NewPaymentProcessor(strategy PaymentStrategy) *PaymentProcessor {
    return &PaymentProcessor{strategy: strategy}
}

// 運行時切換策略
func (p *PaymentProcessor) SetStrategy(strategy PaymentStrategy) {
    p.strategy = strategy
}

func (p *PaymentProcessor) Process(amount float64) error {
    if err := p.strategy.Validate(); err != nil {
        return fmt.Errorf("validation failed: %w", err)
    }
    
    if err := p.strategy.Pay(amount); err != nil {
        return fmt.Errorf("payment failed: %w", err)
    }
    
    return nil
}

// 4. 使用示例
func main() {
    // 信用卡支付
    creditCard := &CreditCardPayment{
        CardNumber: "1234567890123456",
        CVV:        "123",
        ExpiryDate: "12/25",
    }
    processor := NewPaymentProcessor(creditCard)
    processor.Process(100.0)
    
    // 運行時切換為 PayPal
    paypal := &PayPalPayment{
        Email:    "user@example.com",
        Password: "secret",
    }
    processor.SetStrategy(paypal)
    processor.Process(200.0)
    
    // 切換為比特幣
    bitcoin := &BitcoinPayment{
        WalletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    }
    processor.SetStrategy(bitcoin)
    processor.Process(300.0)
}
```

### 實際應用場景

#### 場景 1: 排序算法

```go
// 策略介面
type SortStrategy interface {
    Sort(data []int) []int
}

// 快速排序
type QuickSort struct{}

func (q *QuickSort) Sort(data []int) []int {
    if len(data) < 2 {
        return data
    }
    // 快速排序實現
    fmt.Println("Using QuickSort")
    return data
}

// 冒泡排序
type BubbleSort struct{}

func (b *BubbleSort) Sort(data []int) []int {
    fmt.Println("Using BubbleSort")
    // 冒泡排序實現
    return data
}

// 歸併排序
type MergeSort struct{}

func (m *MergeSort) Sort(data []int) []int {
    fmt.Println("Using MergeSort")
    // 歸併排序實現
    return data
}

// 排序器
type Sorter struct {
    strategy SortStrategy
}

func (s *Sorter) Sort(data []int) []int {
    return s.strategy.Sort(data)
}

// 根據數據大小選擇算法
func NewSorter(dataSize int) *Sorter {
    var strategy SortStrategy
    
    if dataSize < 10 {
        strategy = &BubbleSort{} // 小數據用冒泡
    } else if dataSize < 1000 {
        strategy = &QuickSort{} // 中等數據用快排
    } else {
        strategy = &MergeSort{} // 大數據用歸併
    }
    
    return &Sorter{strategy: strategy}
}
```

#### 場景 2: 價格計算策略

```go
// 定價策略
type PricingStrategy interface {
    CalculatePrice(basePrice float64) float64
}

// 普通會員
type RegularPricing struct{}

func (r *RegularPricing) CalculatePrice(basePrice float64) float64 {
    return basePrice
}

// VIP 會員 9 折
type VIPPricing struct{}

func (v *VIPPricing) CalculatePrice(basePrice float64) float64 {
    return basePrice * 0.9
}

// 黃金會員 8 折
type GoldPricing struct{}

func (g *GoldPricing) CalculatePrice(basePrice float64) float64 {
    return basePrice * 0.8
}

// 促銷期間 7 折
type PromotionPricing struct{}

func (p *PromotionPricing) CalculatePrice(basePrice float64) float64 {
    return basePrice * 0.7
}

// 購物車
type ShoppingCart struct {
    items    []CartItem
    strategy PricingStrategy
}

type CartItem struct {
    Name  string
    Price float64
}

func (s *ShoppingCart) SetPricingStrategy(strategy PricingStrategy) {
    s.strategy = strategy
}

func (s *ShoppingCart) CalculateTotal() float64 {
    var total float64
    for _, item := range s.items {
        total += s.strategy.CalculatePrice(item.Price)
    }
    return total
}
```

#### 場景 3: 壓縮算法

```go
// 壓縮策略
type CompressionStrategy interface {
    Compress(data []byte) ([]byte, error)
    Decompress(data []byte) ([]byte, error)
}

// ZIP 壓縮
type ZipCompression struct{}

func (z *ZipCompression) Compress(data []byte) ([]byte, error) {
    fmt.Println("Compressing with ZIP")
    // ZIP 壓縮實現
    return data, nil
}

func (z *ZipCompression) Decompress(data []byte) ([]byte, error) {
    fmt.Println("Decompressing with ZIP")
    return data, nil
}

// GZIP 壓縮
type GzipCompression struct{}

func (g *GzipCompression) Compress(data []byte) ([]byte, error) {
    fmt.Println("Compressing with GZIP")
    var buf bytes.Buffer
    writer := gzip.NewWriter(&buf)
    writer.Write(data)
    writer.Close()
    return buf.Bytes(), nil
}

func (g *GzipCompression) Decompress(data []byte) ([]byte, error) {
    fmt.Println("Decompressing with GZIP")
    reader, err := gzip.NewReader(bytes.NewReader(data))
    if err != nil {
        return nil, err
    }
    defer reader.Close()
    return io.ReadAll(reader)
}

// RAR 壓縮
type RarCompression struct{}

func (r *RarCompression) Compress(data []byte) ([]byte, error) {
    fmt.Println("Compressing with RAR")
    return data, nil
}

func (r *RarCompression) Decompress(data []byte) ([]byte, error) {
    fmt.Println("Decompressing with RAR")
    return data, nil
}

// 文件處理器
type FileProcessor struct {
    compression CompressionStrategy
}

func (f *FileProcessor) SetCompression(strategy CompressionStrategy) {
    f.compression = strategy
}

func (f *FileProcessor) SaveFile(filename string, data []byte) error {
    compressed, err := f.compression.Compress(data)
    if err != nil {
        return err
    }
    return os.WriteFile(filename, compressed, 0644)
}

func (f *FileProcessor) LoadFile(filename string) ([]byte, error) {
    compressed, err := os.ReadFile(filename)
    if err != nil {
        return nil, err
    }
    return f.compression.Decompress(compressed)
}
```

#### 場景 4: 驗證策略

```go
// 驗證策略
type ValidationStrategy interface {
    Validate(value string) error
}

// 郵箱驗證
type EmailValidation struct{}

func (e *EmailValidation) Validate(value string) error {
    if !strings.Contains(value, "@") {
        return errors.New("invalid email format")
    }
    return nil
}

// 電話驗證
type PhoneValidation struct{}

func (p *PhoneValidation) Validate(value string) error {
    if len(value) < 10 {
        return errors.New("phone number too short")
    }
    return nil
}

// 密碼強度驗證
type PasswordValidation struct {
    MinLength      int
    RequireUppercase bool
    RequireNumber    bool
}

func (p *PasswordValidation) Validate(value string) error {
    if len(value) < p.MinLength {
        return fmt.Errorf("password must be at least %d characters", p.MinLength)
    }
    
    if p.RequireUppercase && !strings.ContainsAny(value, "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
        return errors.New("password must contain uppercase letter")
    }
    
    if p.RequireNumber && !strings.ContainsAny(value, "0123456789") {
        return errors.New("password must contain number")
    }
    
    return nil
}

// 驗證器
type Validator struct {
    strategies []ValidationStrategy
}

func (v *Validator) AddStrategy(strategy ValidationStrategy) {
    v.strategies = append(v.strategies, strategy)
}

func (v *Validator) Validate(value string) error {
    for _, strategy := range v.strategies {
        if err := strategy.Validate(value); err != nil {
            return err
        }
    }
    return nil
}
```

### 策略模式的變體

#### 變體 1: 函數式策略模式

在 Go 中，可以使用函數類型實現更簡潔的策略模式：

```go
// 使用函數類型
type DiscountFunc func(price float64) float64

// 具體策略是函數
func NoDiscount(price float64) float64 {
    return price
}

func TenPercentOff(price float64) float64 {
    return price * 0.9
}

func TwentyPercentOff(price float64) float64 {
    return price * 0.8
}

// 上下文
type PriceCalculator struct {
    discountFunc DiscountFunc
}

func (p *PriceCalculator) Calculate(price float64) float64 {
    return p.discountFunc(price)
}

// 使用
func main() {
    calc := &PriceCalculator{discountFunc: NoDiscount}
    fmt.Println(calc.Calculate(100)) // 100
    
    calc.discountFunc = TenPercentOff
    fmt.Println(calc.Calculate(100)) // 90
    
    // 甚至可以用匿名函數
    calc.discountFunc = func(price float64) float64 {
        return price * 0.5 // 五折
    }
    fmt.Println(calc.Calculate(100)) // 50
}
```

#### 變體 2: 策略工廠

```go
// 策略工廠
type StrategyFactory struct {
    strategies map[string]PaymentStrategy
}

func NewStrategyFactory() *StrategyFactory {
    return &StrategyFactory{
        strategies: make(map[string]PaymentStrategy),
    }
}

func (f *StrategyFactory) Register(name string, strategy PaymentStrategy) {
    f.strategies[name] = strategy
}

func (f *StrategyFactory) GetStrategy(name string) (PaymentStrategy, error) {
    strategy, exists := f.strategies[name]
    if !exists {
        return nil, fmt.Errorf("strategy %s not found", name)
    }
    return strategy, nil
}

// 使用
func main() {
    factory := NewStrategyFactory()
    factory.Register("credit_card", &CreditCardPayment{})
    factory.Register("paypal", &PayPalPayment{})
    factory.Register("bitcoin", &BitcoinPayment{})
    
    strategy, _ := factory.GetStrategy("paypal")
    processor := NewPaymentProcessor(strategy)
    processor.Process(100.0)
}
```

### 優缺點分析

#### 優點

1. **符合開閉原則**：新增策略不需要修改上下文
2. **避免條件語句**：消除大量 if-else 或 switch-case
3. **策略可重用**：策略可以在不同上下文中使用
4. **易於測試**：每個策略可以獨立測試
5. **運行時切換**：可以動態更換算法

#### 缺點

1. **類別數量增加**：每個策略都是一個類別
2. **客戶端需了解策略**：需要知道有哪些策略可選
3. **通信開銷**：策略與上下文之間需要傳遞數據

### 與其他模式的比較

| 對比項 | 策略模式 | 狀態模式 | 模板方法 |
|-------|---------|---------|---------|
| **目的** | 替換算法 | 改變行為 | 定義骨架 |
| **切換** | 客戶端主動 | 狀態自動 | 不可切換 |
| **關係** | 平行策略 | 狀態轉換 | 繼承關係 |
| **使用** | 組合 | 組合 | 繼承 |

### 何時使用策略模式？

**適用場景**：
- ✓ 有多種算法可以完成同一任務
- ✓ 需要在運行時選擇算法
- ✓ 算法的選擇依賴於外部條件
- ✓ 想要避免大量條件語句

**不適用場景**：
- ✗ 只有少數幾個算法，且很少變化
- ✗ 策略之間差異很小
- ✗ 客戶端無需知道算法細節

## 總結

**核心要點**：
1. **策略模式封裝算法族**：每個算法獨立封裝
2. **運行時可替換**：動態選擇算法
3. **消除條件語句**：用多型替代 if-else
4. **組合優於繼承**：通過組合實現靈活性

**實踐建議**：
- 識別變化的算法部分，提取為策略
- 保持策略介面簡潔
- 使用工廠模式管理策略創建
- Go 中可考慮使用函數類型簡化實現

**判斷依據**：
- 有大量 if-else 或 switch-case → 考慮策略模式
- 需要運行時切換算法 → 使用策略模式
- 算法獨立變化 → 策略模式很合適
