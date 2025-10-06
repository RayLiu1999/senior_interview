# 什麼是裝飾器模式 (Decorator Pattern)？

- **難度**: 6
- **重要性**: 4
- **標籤**: `Design Pattern`, `Decorator`, `Structural`, `Dynamic Extension`

## 問題詳述

裝飾器模式 (Decorator Pattern) 是結構型設計模式之一。請詳細解釋裝飾器模式的定義、實現方式、與繼承的區別,以及在實際開發中的應用場景。

## 核心理論與詳解

裝飾器模式允許在不修改原有物件的情況下,**動態地**為物件添加新的功能。它通過將物件包裝在裝飾器類別中來實現功能擴展,是繼承的一種靈活替代方案。

### 裝飾器模式的定義

**GoF 定義**:

> "動態地給一個物件添加一些額外的職責。就增加功能來說,Decorator 模式相比生成子類更為靈活。"

**核心思想**:

```text
Component (組件接口)
    ↑
    |
ConcreteComponent (具體組件) ← 被裝飾的原始物件
    ↑
    |
Decorator (裝飾器抽象類別) ← 持有 Component 引用
    ↑
    |
ConcreteDecorator (具體裝飾器) ← 添加額外功能
```

### 裝飾器模式的結構

#### UML 類別圖

```text
┌─────────────────┐
│   Component     │ (接口/抽象類別)
├─────────────────┤
│ + Operation()   │
└─────────────────┘
        △
        |
    ┌───┴──────────────────────┐
    |                           |
┌───────────────────┐   ┌──────────────────┐
│ConcreteComponent  │   │   Decorator      │
├───────────────────┤   ├──────────────────┤
│ + Operation()     │   │ - component      │
└───────────────────┘   │ + Operation()    │
                        └──────────────────┘
                                △
                                |
                        ┌───────┴──────────┐
                        |                   |
                ┌──────────────────┐ ┌────────────────────┐
                │ConcreteDecoratorA│ │ConcreteDecoratorB  │
                ├──────────────────┤ ├────────────────────┤
                │ + Operation()    │ │ + Operation()      │
                │ + AddedBehavior()│ │ + AddedBehavior()  │
                └──────────────────┘ └────────────────────┘
```

#### 角色說明

1. **Component (組件接口)**: 定義物件的接口,可以動態地添加職責
2. **ConcreteComponent (具體組件)**: 被裝飾的原始物件,實現基本功能
3. **Decorator (裝飾器)**: 持有 Component 的引用,實現與 Component 相同的接口
4. **ConcreteDecorator (具體裝飾器)**: 為 Component 添加額外的職責

### Go 語言實現

#### 示例一: 飲料訂單系統

這是《Head First 設計模式》中的經典範例。

```go
package main

import "fmt"

// Component: 飲料接口
type Beverage interface {
    GetDescription() string
    Cost() float64
}

// ConcreteComponent: 濃縮咖啡
type Espresso struct{}

func (e *Espresso) GetDescription() string {
    return "濃縮咖啡"
}

func (e *Espresso) Cost() float64 {
    return 1.99
}

// ConcreteComponent: 深焙咖啡
type DarkRoast struct{}

func (d *DarkRoast) GetDescription() string {
    return "深焙咖啡"
}

func (d *DarkRoast) Cost() float64 {
    return 2.49
}

// Decorator: 調料裝飾器基類
type CondimentDecorator struct {
    beverage Beverage
}

// ConcreteDecorator: 摩卡裝飾器
type Mocha struct {
    CondimentDecorator
}

func NewMocha(beverage Beverage) *Mocha {
    return &Mocha{
        CondimentDecorator: CondimentDecorator{beverage: beverage},
    }
}

func (m *Mocha) GetDescription() string {
    return m.beverage.GetDescription() + ", 摩卡"
}

func (m *Mocha) Cost() float64 {
    return m.beverage.Cost() + 0.20
}

// ConcreteDecorator: 豆漿裝飾器
type Soy struct {
    CondimentDecorator
}

func NewSoy(beverage Beverage) *Soy {
    return &Soy{
        CondimentDecorator: CondimentDecorator{beverage: beverage},
    }
}

func (s *Soy) GetDescription() string {
    return s.beverage.GetDescription() + ", 豆漿"
}

func (s *Soy) Cost() float64 {
    return s.beverage.Cost() + 0.15
}

// ConcreteDecorator: 奶泡裝飾器
type Whip struct {
    CondimentDecorator
}

func NewWhip(beverage Beverage) *Whip {
    return &Whip{
        CondimentDecorator: CondimentDecorator{beverage: beverage},
    }
}

func (w *Whip) GetDescription() string {
    return w.beverage.GetDescription() + ", 奶泡"
}

func (w *Whip) Cost() float64 {
    return w.beverage.Cost() + 0.10
}

func main() {
    // 訂單 1: 濃縮咖啡
    beverage1 := &Espresso{}
    fmt.Printf("%s: $%.2f\n", beverage1.GetDescription(), beverage1.Cost())
    // 輸出: 濃縮咖啡: $1.99
    
    // 訂單 2: 深焙咖啡 + 摩卡 + 摩卡 + 奶泡
    beverage2 := &DarkRoast{}
    beverage2 = NewMocha(beverage2)      // 第一層裝飾
    beverage2 = NewMocha(beverage2)      // 第二層裝飾
    beverage2 = NewWhip(beverage2)       // 第三層裝飾
    fmt.Printf("%s: $%.2f\n", beverage2.GetDescription(), beverage2.Cost())
    // 輸出: 深焙咖啡, 摩卡, 摩卡, 奶泡: $2.99
    
    // 訂單 3: 濃縮咖啡 + 豆漿 + 摩卡 + 奶泡
    beverage3 := &Espresso{}
    beverage3 = NewSoy(beverage3)
    beverage3 = NewMocha(beverage3)
    beverage3 = NewWhip(beverage3)
    fmt.Printf("%s: $%.2f\n", beverage3.GetDescription(), beverage3.Cost())
    // 輸出: 濃縮咖啡, 豆漿, 摩卡, 奶泡: $2.44
}
```

#### 示例二: HTTP 中介軟體 (Middleware)

這是裝飾器模式在 Web 開發中的經典應用。

```go
package main

import (
    "fmt"
    "log"
    "net/http"
    "time"
)

// Component: HTTP Handler 接口
type Handler interface {
    ServeHTTP(w http.ResponseWriter, r *http.Request)
}

// 將 http.HandlerFunc 轉換為 Handler 接口
type HandlerFunc func(http.ResponseWriter, *http.Request)

func (f HandlerFunc) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    f(w, r)
}

// ConcreteComponent: 基本的業務 Handler
func HelloHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, World!")
}

// ConcreteDecorator 1: 日誌中介軟體
func LoggingMiddleware(next Handler) Handler {
    return HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        
        log.Printf("[%s] %s %s - 開始處理", 
            r.Method, r.URL.Path, r.RemoteAddr)
        
        // 調用下一個 Handler
        next.ServeHTTP(w, r)
        
        duration := time.Since(start)
        log.Printf("[%s] %s - 完成處理 (耗時: %v)", 
            r.Method, r.URL.Path, duration)
    })
}

// ConcreteDecorator 2: 認證中介軟體
func AuthMiddleware(next Handler) Handler {
    return HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // 檢查 Authorization header
        token := r.Header.Get("Authorization")
        
        if token == "" {
            http.Error(w, "Unauthorized: Missing token", http.StatusUnauthorized)
            return
        }
        
        // 簡化的驗證邏輯
        if token != "Bearer secret-token" {
            http.Error(w, "Unauthorized: Invalid token", http.StatusUnauthorized)
            return
        }
        
        log.Println("認證成功")
        
        // 驗證通過,調用下一個 Handler
        next.ServeHTTP(w, r)
    })
}

// ConcreteDecorator 3: CORS 中介軟體
func CORSMiddleware(next Handler) Handler {
    return HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // 設定 CORS headers
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        // 處理預檢請求
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }
        
        // 調用下一個 Handler
        next.ServeHTTP(w, r)
    })
}

// ConcreteDecorator 4: 速率限制中介軟體
type RateLimiter struct {
    requests map[string]int
    limit    int
}

func NewRateLimiter(limit int) *RateLimiter {
    return &RateLimiter{
        requests: make(map[string]int),
        limit:    limit,
    }
}

func (rl *RateLimiter) Middleware(next Handler) Handler {
    return HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        ip := r.RemoteAddr
        
        // 檢查請求次數
        rl.requests[ip]++
        
        if rl.requests[ip] > rl.limit {
            http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
            return
        }
        
        // 調用下一個 Handler
        next.ServeHTTP(w, r)
    })
}

func main() {
    // 建立基本 Handler
    handler := HandlerFunc(HelloHandler)
    
    // 使用裝飾器模式層層包裝 (洋蔥模型)
    // 執行順序: CORS → 速率限制 → 日誌 → 認證 → 業務邏輯
    rateLimiter := NewRateLimiter(100)
    handler = CORSMiddleware(handler)
    handler = rateLimiter.Middleware(handler)
    handler = LoggingMiddleware(handler)
    handler = AuthMiddleware(handler)
    
    // 啟動服務器
    http.Handle("/hello", handler)
    log.Println("Server started on :8080")
    http.ListenAndServe(":8080", nil)
}
```

#### 示例三: I/O 流裝飾器

這是 Java I/O 庫的經典設計,也可在 Go 中實現。

```go
package main

import (
    "bufio"
    "compress/gzip"
    "crypto/aes"
    "crypto/cipher"
    "crypto/rand"
    "io"
    "os"
)

// Component: io.Reader 和 io.Writer 已經是 Go 的標準接口

// ConcreteComponent: 文件讀取器
func ReadFile(filename string) (io.Reader, error) {
    return os.Open(filename)
}

// ConcreteDecorator 1: 緩衝讀取器 (標準庫提供)
func BufferedReader(r io.Reader) io.Reader {
    return bufio.NewReader(r)
}

// ConcreteDecorator 2: Gzip 解壓縮讀取器 (標準庫提供)
func GzipReader(r io.Reader) (io.Reader, error) {
    return gzip.NewReader(r)
}

// ConcreteDecorator 3: 自定義加密讀取器
type EncryptedReader struct {
    reader io.Reader
    cipher cipher.Stream
}

func NewEncryptedReader(r io.Reader, key []byte) (*EncryptedReader, error) {
    block, err := aes.NewCipher(key)
    if err != nil {
        return nil, err
    }
    
    // 讀取 IV (初始化向量)
    iv := make([]byte, aes.BlockSize)
    if _, err := io.ReadFull(r, iv); err != nil {
        return nil, err
    }
    
    stream := cipher.NewCFBDecrypter(block, iv)
    
    return &EncryptedReader{
        reader: r,
        cipher: stream,
    }, nil
}

func (er *EncryptedReader) Read(p []byte) (n int, err error) {
    n, err = er.reader.Read(p)
    if n > 0 {
        er.cipher.XORKeyStream(p[:n], p[:n])
    }
    return n, err
}

// 使用範例
func DecoratorIOExample() {
    // 1. 基本文件讀取
    file, _ := os.Open("data.txt")
    defer file.Close()
    
    // 2. 加上緩衝裝飾器
    buffered := bufio.NewReader(file)
    
    // 3. 如果是 gzip 壓縮文件,再加上解壓縮裝飾器
    file2, _ := os.Open("data.txt.gz")
    defer file2.Close()
    gzipReader, _ := gzip.NewReader(file2)
    defer gzipReader.Close()
    
    // 4. 層層裝飾: 文件 → Gzip → 緩衝 → 加密
    key := make([]byte, 32) // AES-256 key
    rand.Read(key)
    
    encryptedFile, _ := os.Open("encrypted.dat")
    defer encryptedFile.Close()
    
    encryptedReader, _ := NewEncryptedReader(encryptedFile, key)
    bufferedEncrypted := bufio.NewReader(encryptedReader)
    
    // 讀取數據
    data := make([]byte, 1024)
    bufferedEncrypted.Read(data)
}
```

### 裝飾器模式 vs 繼承

| 特性 | 裝飾器模式 | 繼承 |
|------|----------|------|
| **擴展時機** | 運行時動態擴展 | 編譯時靜態擴展 |
| **靈活性** | 高 (可任意組合) | 低 (固定的類別層次) |
| **耦合度** | 低 (通過接口) | 高 (子類依賴父類) |
| **類別數量** | 少 (裝飾器可重用) | 多 (子類爆炸) |
| **功能組合** | 可動態組合多個功能 | 需要為每種組合建立子類 |
| **符合原則** | 符合開閉原則 (OCP) | 易違反里氏替換原則 (LSP) |

**範例對比**:

```go
// 使用繼承 (不推薦)
type Coffee struct{}
type CoffeeWithMilk struct { Coffee }
type CoffeeWithSugar struct { Coffee }
type CoffeeWithMilkAndSugar struct { Coffee }
type CoffeeWithMilkAndSugarAndVanilla struct { Coffee }
// ... 組合爆炸!

// 使用裝飾器 (推薦)
coffee := &Coffee{}
coffee = NewMilkDecorator(coffee)
coffee = NewSugarDecorator(coffee)
coffee = NewVanillaDecorator(coffee)
// 靈活組合,無需額外類別
```

### 裝飾器模式的優缺點

#### 優點

1. **符合開閉原則**: 無需修改現有代碼,就能擴展功能
2. **靈活性高**: 可在運行時動態組合功能
3. **單一職責**: 每個裝飾器只負責一個功能
4. **避免類別爆炸**: 不會因為功能組合而產生大量子類
5. **裝飾器可重用**: 同一個裝飾器可用於不同的組件

#### 缺點

1. **複雜度增加**: 大量裝飾器會讓系統難以理解
2. **調試困難**: 多層裝飾導致調用棧複雜
3. **順序敏感**: 裝飾器的包裝順序會影響結果
4. **類型問題**: 外層裝飾器可能隱藏內層類別的特定方法

### 裝飾器模式的應用場景

#### 1. Web 框架中介軟體

**所有主流 Web 框架都使用裝飾器模式**:

- **Gin (Go)**: 中介軟體鏈
- **Express (Node.js)**: 中介軟體棧
- **Django (Python)**: 裝飾器
- **Spring (Java)**: 攔截器

#### 2. I/O 流處理

- **Java**: `InputStream`/`OutputStream` 裝飾器
- **Go**: `io.Reader`/`io.Writer` 包裝
- **Node.js**: Stream 轉換

#### 3. GUI 組件

- **滾動條裝飾器**: 為窗口添加滾動功能
- **邊框裝飾器**: 為組件添加邊框
- **陰影裝飾器**: 為組件添加陰影效果

#### 4. 資料處理管道

- **壓縮**: 壓縮數據流
- **加密**: 加密數據流
- **編碼**: 編碼轉換 (UTF-8, Base64)

### 實務最佳實踐

#### 1. 保持接口一致

裝飾器必須實現與組件相同的接口:

```go
// 確保裝飾器實現相同的接口
type Reader interface {
    Read(p []byte) (n int, err error)
}

// 原始組件
type FileReader struct { /* ... */ }
func (f *FileReader) Read(p []byte) (n int, err error) { /* ... */ }

// 裝飾器也必須實現 Reader 接口
type GzipReader struct {
    reader Reader
}
func (g *GzipReader) Read(p []byte) (n int, err error) { /* ... */ }
```

#### 2. 使用接口而非具體類型

```go
// 好: 依賴接口
func NewLoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        log.Println("Request received")
        next.ServeHTTP(w, r)
    })
}

// 不好: 依賴具體類型
func NewLoggingMiddleware(next *ConcreteHandler) *ConcreteHandler {
    // 限制了靈活性
}
```

#### 3. 考慮裝飾順序

某些裝飾器的順序很重要:

```go
// 正確: 壓縮 → 加密
data := NewEncryptor(NewCompressor(originalData))

// 錯誤: 加密 → 壓縮 (壓縮加密後的資料效果差)
data := NewCompressor(NewEncryptor(originalData))
```

#### 4. 文檔化裝飾器行為

```go
// LoggingMiddleware 記錄請求和響應的日誌
// 必須在認證中介軟體之後使用,以確保使用者資訊可用
func LoggingMiddleware(next http.Handler) http.Handler {
    // ...
}
```

### 常見面試考點

#### Q1: 什麼是裝飾器模式?它解決什麼問題?

**答案**: 
裝飾器模式允許在不修改原有物件的情況下,動態地為物件添加新功能。它通過將物件包裝在裝飾器中來擴展功能。

**解決的問題**:
1. 避免繼承導致的類別爆炸
2. 在運行時動態組合功能
3. 符合開閉原則,無需修改現有代碼

#### Q2: 裝飾器模式與代理模式有什麼區別?

**答案**:

| 特性 | 裝飾器模式 | 代理模式 |
|------|----------|---------|
| **目的** | 增強功能 | 控制訪問 |
| **重點** | 添加新行為 | 訪問控制、延遲加載、保護 |
| **透明性** | 使用者知道被裝飾 | 使用者通常不知道有代理 |
| **組合** | 可層層嵌套 | 通常只有一層 |

#### Q3: 裝飾器模式與繼承相比有什麼優勢?

**答案**:
1. **動態性**: 運行時決定功能組合,而非編譯時
2. **避免類別爆炸**: 不需要為每種組合建立子類
3. **靈活組合**: 可任意組合多個裝飾器
4. **單一職責**: 每個裝飾器只負責一個功能
5. **符合 OCP**: 擴展功能無需修改現有代碼

#### Q4: Go 語言中如何實現裝飾器模式?

**答案**: Go 沒有類繼承,但可以通過以下方式實現裝飾器:

1. **使用接口**: 定義組件接口,裝飾器實現該接口
2. **使用組合**: 裝飾器持有被裝飾物件的引用
3. **函數式風格**: 使用高階函數包裝

```go
// 接口式裝飾器
type Component interface {
    Operation() string
}

type Decorator struct {
    component Component
}

func (d *Decorator) Operation() string {
    return "Decorated: " + d.component.Operation()
}

// 函數式裝飾器 (中介軟體)
type Middleware func(http.Handler) http.Handler

func Logger(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        log.Println("Request:", r.URL.Path)
        next.ServeHTTP(w, r)
    })
}
```

#### Q5: 裝飾器模式的缺點是什麼?

**答案**:
1. **複雜度**: 多層裝飾器難以理解和調試
2. **順序依賴**: 裝飾器的包裝順序可能影響結果
3. **類型問題**: 外層裝飾器可能隱藏內層的特定方法
4. **效能開銷**: 每層裝飾都增加一次方法調用

**緩解方法**:
- 文檔化裝飾器的順序要求
- 限制裝飾層數
- 提供工廠方法簡化創建

### 總結

裝飾器模式的核心價值:

1. **動態擴展**: 運行時添加功能,不修改原有代碼
2. **靈活組合**: 可自由組合多個裝飾器
3. **符合 SOLID**: 開閉原則 (OCP) 和單一職責原則 (SRP)
4. **廣泛應用**: Web 中介軟體、I/O 流、GUI 組件等

**使用建議**:
- 當需要動態添加功能時,優先考慮裝飾器而非繼承
- 保持裝飾器簡單,每個只負責一個職責
- 文檔化裝飾順序和依賴關係
- 在 Go 中充分利用接口和組合的優勢

**記住**: 裝飾器模式就像給物件穿衣服,一件一件疊加,每件衣服都增加新的功能或外觀,但核心的物件始終不變。
