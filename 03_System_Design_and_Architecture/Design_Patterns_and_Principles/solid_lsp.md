# 什麼是里氏替換原則 (Liskov Substitution Principle, LSP)？

- **難度**: 7
- **重要性**: 4
- **標籤**: `SOLID`, `LSP`, `Design Principles`, `Inheritance`

## 問題詳述

里氏替換原則 (Liskov Substitution Principle, LSP) 是 SOLID 原則中的第三個原則。請詳細解釋 LSP 的定義、核心思想、違反 LSP 的常見場景,以及如何在實際開發中正確應用此原則。

## 核心理論與詳解

里氏替換原則由 Barbara Liskov 在 1987 年提出,是物件導向設計中關於繼承的重要原則。

### LSP 的定義

**經典定義** (Barbara Liskov, 1988):

> "如果對每一個類型為 T1 的物件 o1,都有類型為 T2 的物件 o2,使得以 T1 定義的所有程式 P 在所有的物件 o1 都替換成 o2 時,程式 P 的行為沒有變化,那麼類型 T2 是類型 T1 的子類型。"

**通俗理解**:

> "子類別必須能夠替換掉它們的父類別,並且程式的行為不會改變。"

或者更簡單地說:

> "使用基類的地方,都應該能透明地使用其子類,而不會導致任何錯誤或異常。"

### LSP 的核心思想

#### 1. 契約式設計 (Design by Contract)

子類別在繼承父類別時,必須遵守父類別的"契約":

```text
契約包括:
1. 前置條件 (Precondition): 方法執行前必須滿足的條件
2. 後置條件 (Postcondition): 方法執行後必須滿足的條件
3. 不變量 (Invariant): 類別始終保持的狀態
```

**LSP 要求**:
- **子類別不能加強前置條件** (不能要求更嚴格的輸入)
- **子類別不能削弱後置條件** (不能輸出更寬鬆的結果)
- **子類別必須維持不變量**

#### 2. 行為兼容性

子類別可以擴展父類別的功能,但不應該改變父類別原有的行為:

- ✅ 可以增加新方法
- ✅ 可以增加新屬性
- ✅ 可以實現父類別的抽象方法
- ❌ 不應該改變父類別已有方法的語義
- ❌ 不應該拋出父類別未聲明的異常
- ❌ 不應該改變方法的副作用

### 違反 LSP 的典型案例

#### 案例一: 經典的正方形-長方形問題

這是設計模式書籍中最經典的 LSP 違反範例。

**錯誤設計** (違反 LSP):

```go
// 長方形
type Rectangle struct {
    width  float64
    height float64
}

func (r *Rectangle) SetWidth(width float64) {
    r.width = width
}

func (r *Rectangle) SetHeight(height float64) {
    r.height = height
}

func (r *Rectangle) GetArea() float64 {
    return r.width * r.height
}

// 正方形繼承長方形 (錯誤設計!)
type Square struct {
    Rectangle
}

// 重寫 SetWidth: 同時設定寬和高
func (s *Square) SetWidth(width float64) {
    s.width = width
    s.height = width  // 違反 LSP!
}

// 重寫 SetHeight: 同時設定寬和高
func (s *Square) SetHeight(height float64) {
    s.width = height   // 違反 LSP!
    s.height = height
}

// 測試函數 (基於長方形的假設)
func TestRectangle(r *Rectangle) {
    r.SetWidth(5)
    r.SetHeight(4)
    
    expected := 5 * 4  // 期望面積為 20
    actual := r.GetArea()
    
    if expected != actual {
        fmt.Printf("測試失敗! 期望: %f, 實際: %f\n", expected, actual)
    }
}

func main() {
    rect := &Rectangle{}
    TestRectangle(rect)  // ✅ 通過測試: 面積 = 20
    
    square := &Square{}
    TestRectangle(&square.Rectangle)  // ❌ 測試失敗: 面積 = 16 (4*4)
}
```

**問題分析**:

1. **違反後置條件**: 長方形的 `SetWidth()` 後置條件是"只改變寬度",但正方形改變了寬度和高度
2. **破壞行為一致性**: 使用者基於長方形的假設編寫代碼,替換為正方形後行為改變
3. **數學模型不等於繼承關係**: 雖然數學上正方形是長方形,但在程式設計中這種繼承關係會導致問題

**正確設計** (符合 LSP):

```go
// 方案一: 使用接口而非繼承
type Shape interface {
    GetArea() float64
}

type Rectangle struct {
    width  float64
    height float64
}

func (r *Rectangle) SetWidth(width float64) {
    r.width = width
}

func (r *Rectangle) SetHeight(height float64) {
    r.height = height
}

func (r *Rectangle) GetArea() float64 {
    return r.width * r.height
}

type Square struct {
    side float64
}

func (s *Square) SetSide(side float64) {
    s.side = side
}

func (s *Square) GetArea() float64 {
    return s.side * s.side
}

// 測試函數只依賴 Shape 接口
func TestShape(s Shape) float64 {
    return s.GetArea()
}
```

#### 案例二: 不當的異常拋出

**錯誤設計**:

```go
// 基類: 文件讀取器
type FileReader interface {
    Read(filename string) ([]byte, error)
}

type LocalFileReader struct{}

func (r *LocalFileReader) Read(filename string) ([]byte, error) {
    // 只拋出 os.ErrNotExist 或 io.EOF
    return os.ReadFile(filename)
}

// 子類: 網路文件讀取器 (違反 LSP!)
type NetworkFileReader struct{}

func (r *NetworkFileReader) Read(filename string) ([]byte, error) {
    // 拋出額外的異常: 網路錯誤、超時等
    // 這違反了 LSP,因為調用者沒有預期處理這些異常!
    resp, err := http.Get(filename)
    if err != nil {
        // 拋出了父類未聲明的異常類型
        return nil, fmt.Errorf("network error: %w", err)
    }
    defer resp.Body.Close()
    return io.ReadAll(resp.Body)
}

// 客戶端代碼基於 LocalFileReader 的假設
func ProcessFile(reader FileReader, filename string) {
    data, err := reader.Read(filename)
    if err != nil {
        // 只處理文件不存在的情況
        if errors.Is(err, os.ErrNotExist) {
            log.Println("文件不存在")
            return
        }
        // 沒有處理網路錯誤! 當傳入 NetworkFileReader 時會出問題
    }
    
    process(data)
}
```

**正確設計**:

```go
// 定義完整的異常契約
type FileReader interface {
    // Read 可能返回以下錯誤:
    // - ErrNotFound: 文件/資源不存在
    // - ErrPermissionDenied: 權限不足
    // - ErrTimeout: 操作超時
    // - ErrNetworkError: 網路錯誤 (僅網路讀取器)
    Read(filename string) ([]byte, error)
}

var (
    ErrNotFound          = errors.New("resource not found")
    ErrPermissionDenied  = errors.New("permission denied")
    ErrTimeout           = errors.New("operation timeout")
    ErrNetworkError      = errors.New("network error")
)

// 本地讀取器
type LocalFileReader struct{}

func (r *LocalFileReader) Read(filename string) ([]byte, error) {
    data, err := os.ReadFile(filename)
    if err != nil {
        if errors.Is(err, os.ErrNotExist) {
            return nil, ErrNotFound
        }
        if errors.Is(err, os.ErrPermission) {
            return nil, ErrPermissionDenied
        }
        return nil, err
    }
    return data, nil
}

// 網路讀取器
type NetworkFileReader struct {
    timeout time.Duration
}

func (r *NetworkFileReader) Read(filename string) ([]byte, error) {
    client := &http.Client{Timeout: r.timeout}
    
    resp, err := client.Get(filename)
    if err != nil {
        // 將網路錯誤統一映射到定義的錯誤類型
        if errors.Is(err, context.DeadlineExceeded) {
            return nil, ErrTimeout
        }
        return nil, fmt.Errorf("%w: %v", ErrNetworkError, err)
    }
    defer resp.Body.Close()
    
    if resp.StatusCode == http.StatusNotFound {
        return nil, ErrNotFound
    }
    if resp.StatusCode == http.StatusForbidden {
        return nil, ErrPermissionDenied
    }
    
    return io.ReadAll(resp.Body)
}

// 客戶端代碼可以安全處理所有子類
func ProcessFile(reader FileReader, filename string) error {
    data, err := reader.Read(filename)
    if err != nil {
        switch {
        case errors.Is(err, ErrNotFound):
            log.Println("資源不存在")
        case errors.Is(err, ErrPermissionDenied):
            log.Println("權限不足")
        case errors.Is(err, ErrTimeout):
            log.Println("操作超時")
        case errors.Is(err, ErrNetworkError):
            log.Println("網路錯誤")
        default:
            log.Printf("未知錯誤: %v", err)
        }
        return err
    }
    
    return process(data)
}
```

#### 案例三: 加強前置條件

**錯誤設計**:

```go
// 基類: 使用者服務
type UserService interface {
    CreateUser(name string, age int) error
}

type BasicUserService struct{}

// 只要求 name 不為空
func (s *BasicUserService) CreateUser(name string, age int) error {
    if name == "" {
        return errors.New("name cannot be empty")
    }
    
    // 創建使用者...
    return nil
}

// 子類: 高級使用者服務 (違反 LSP!)
type PremiumUserService struct{}

// 加強了前置條件: 要求 age > 18 (父類沒有這個要求!)
func (s *PremiumUserService) CreateUser(name string, age int) error {
    if name == "" {
        return errors.New("name cannot be empty")
    }
    
    // 違反 LSP: 加強了前置條件!
    if age < 18 {
        return errors.New("premium users must be at least 18 years old")
    }
    
    // 創建高級使用者...
    return nil
}

// 客戶端代碼
func RegisterUser(service UserService, name string, age int) error {
    // 基於 BasicUserService 的假設: age 沒有限制
    return service.CreateUser(name, age)
}

func main() {
    basic := &BasicUserService{}
    RegisterUser(basic, "Alice", 16)  // ✅ 成功
    
    premium := &PremiumUserService{}
    RegisterUser(premium, "Bob", 16)  // ❌ 失敗: 違反前置條件
}
```

**正確設計**:

```go
// 方案一: 在基類定義完整的前置條件
type UserService interface {
    // CreateUser 創建使用者
    // 前置條件:
    // - name 不能為空
    // - age 必須 >= 18
    CreateUser(name string, age int) error
}

type BasicUserService struct{}

func (s *BasicUserService) CreateUser(name string, age int) error {
    if name == "" {
        return errors.New("name cannot be empty")
    }
    if age < 18 {
        return errors.New("age must be at least 18")
    }
    // 創建使用者...
    return nil
}

type PremiumUserService struct{}

// 子類遵守相同的前置條件,可以削弱但不能加強
func (s *PremiumUserService) CreateUser(name string, age int) error {
    if name == "" {
        return errors.New("name cannot be empty")
    }
    if age < 18 {
        return errors.New("age must be at least 18")
    }
    // 創建高級使用者...
    return nil
}

// 方案二: 使用不同的接口
type BasicUserService interface {
    CreateUser(name string) error  // 無年齡限制
}

type PremiumUserService interface {
    CreatePremiumUser(name string, age int) error  // 有年齡限制
}
```

### LSP 的實踐指南

#### 1. 使用組合而非繼承

當不確定繼承關係是否合理時,優先考慮組合:

```go
// 不好: 使用繼承
type Vehicle struct {
    speed int
}

func (v *Vehicle) Start() {
    fmt.Println("Vehicle started")
}

type Car struct {
    Vehicle  // 繼承
}

// 好: 使用組合
type Engine struct {
    power int
}

func (e *Engine) Start() {
    fmt.Println("Engine started")
}

type Car struct {
    engine Engine  // 組合
    wheels int
}

func (c *Car) Start() {
    c.engine.Start()
    fmt.Println("Car started")
}
```

#### 2. 使用接口而非具體類別

接口提供了更靈活的抽象,避免繼承帶來的問題:

```go
// 定義接口
type Storage interface {
    Save(key string, value []byte) error
    Load(key string) ([]byte, error)
}

// 多種實現
type MemoryStorage struct {
    data map[string][]byte
}

func (s *MemoryStorage) Save(key string, value []byte) error {
    s.data[key] = value
    return nil
}

func (s *MemoryStorage) Load(key string) ([]byte, error) {
    if value, ok := s.data[key]; ok {
        return value, nil
    }
    return nil, errors.New("key not found")
}

type FileStorage struct {
    directory string
}

func (s *FileStorage) Save(key string, value []byte) error {
    filename := filepath.Join(s.directory, key)
    return os.WriteFile(filename, value, 0644)
}

func (s *FileStorage) Load(key string) ([]byte, error) {
    filename := filepath.Join(s.directory, key)
    return os.ReadFile(filename)
}

// 客戶端代碼只依賴接口
func ProcessData(storage Storage, key string, data []byte) error {
    if err := storage.Save(key, data); err != nil {
        return err
    }
    
    loaded, err := storage.Load(key)
    if err != nil {
        return err
    }
    
    fmt.Printf("Loaded: %s\n", loaded)
    return nil
}
```

#### 3. 明確定義契約

使用文件或註釋明確說明方法的契約:

```go
// Cache 定義了快取接口
type Cache interface {
    // Get 獲取快取值
    //
    // 前置條件:
    // - key 不能為空字串
    //
    // 後置條件:
    // - 如果 key 存在,返回對應的 value 和 nil
    // - 如果 key 不存在,返回 nil 和 ErrKeyNotFound
    // - 如果發生錯誤,返回 nil 和對應的錯誤
    //
    // 不變量:
    // - 方法執行不會修改快取的其他鍵值對
    Get(key string) (interface{}, error)
    
    // Set 設定快取值
    //
    // 前置條件:
    // - key 不能為空字串
    // - value 不能為 nil
    // - ttl 必須 > 0
    //
    // 後置條件:
    // - 成功時返回 nil
    // - 失敗時返回對應的錯誤
    //
    // 不變量:
    // - 如果 key 已存在,會被覆蓋
    // - 過期時間從調用時刻開始計算
    Set(key string, value interface{}, ttl time.Duration) error
}
```

#### 4. 單元測試驗證 LSP

編寫測試確保子類可以替換父類:

```go
// 測試套件驗證所有 Storage 實現
func TestStorageImplementation(t *testing.T, storage Storage) {
    // 測試基本功能
    t.Run("Save and Load", func(t *testing.T) {
        key := "test-key"
        value := []byte("test-value")
        
        err := storage.Save(key, value)
        assert.NoError(t, err)
        
        loaded, err := storage.Load(key)
        assert.NoError(t, err)
        assert.Equal(t, value, loaded)
    })
    
    // 測試邊界條件
    t.Run("Load non-existent key", func(t *testing.T) {
        _, err := storage.Load("non-existent")
        assert.Error(t, err)
    })
}

// 測試所有實現
func TestMemoryStorage(t *testing.T) {
    storage := &MemoryStorage{data: make(map[string][]byte)}
    TestStorageImplementation(t, storage)
}

func TestFileStorage(t *testing.T) {
    tmpDir := t.TempDir()
    storage := &FileStorage{directory: tmpDir}
    TestStorageImplementation(t, storage)
}
```

### LSP 與其他 SOLID 原則的關係

#### LSP + OCP (開閉原則)

LSP 是實現 OCP 的基礎。只有當子類能夠替換父類時,我們才能安全地擴展系統:

```go
// 符合 OCP: 對擴展開放
type PaymentProcessor interface {
    Process(amount float64) error
}

// 符合 LSP: 所有實現都可以替換接口
type CreditCardProcessor struct{}
func (p *CreditCardProcessor) Process(amount float64) error { /* ... */ return nil }

type PayPalProcessor struct{}
func (p *PayPalProcessor) Process(amount float64) error { /* ... */ return nil }

// 可以安全地添加新的支付方式,不影響現有代碼
type BitcoinProcessor struct{}
func (p *BitcoinProcessor) Process(amount float64) error { /* ... */ return nil }
```

#### LSP + DIP (依賴反轉原則)

LSP 確保依賴抽象時,所有具體實現都是可靠的:

```go
// 高層模組依賴抽象
type OrderService struct {
    payment PaymentProcessor  // 依賴抽象
}

func (s *OrderService) PlaceOrder(amount float64) error {
    // 因為符合 LSP,任何 PaymentProcessor 實現都可以工作
    return s.payment.Process(amount)
}
```

### 常見面試考點

#### Q1: 什麼是里氏替換原則?為什麼重要?

**答案**: 
LSP 指出子類必須能夠替換父類而不改變程式的正確性。它確保繼承關係是合理的,避免子類破壞父類的行為契約。

**重要性**:
1. 保證代碼的可維護性和可擴展性
2. 防止子類引入意外的行為變化
3. 是實現開閉原則的基礎

#### Q2: 正方形-長方形問題為什麼違反 LSP?如何解決?

**答案**:
雖然數學上正方形是長方形,但在程式中讓 Square 繼承 Rectangle 會違反 LSP:
- 長方形的 `SetWidth()` 只改變寬度,但正方形必須同時改變寬和高
- 替換後行為不一致,破壞了使用者的預期

**解決方案**:
1. 不使用繼承,讓兩者都實現 `Shape` 接口
2. 使用組合而非繼承
3. 重新設計類別層次結構

#### Q3: 如何判斷一個繼承關係是否符合 LSP?

**答案**:
檢查以下幾點:
1. **前置條件**: 子類不能要求更嚴格的輸入條件
2. **後置條件**: 子類不能削弱輸出保證
3. **不變量**: 子類必須保持父類的不變量
4. **異常**: 子類不能拋出父類未聲明的異常
5. **行為**: 使用父類的地方替換為子類,行為應該一致

**測試方法**: 編寫基於父類的測試,所有子類都應該通過

#### Q4: LSP 與接口隔離原則 (ISP) 有什麼關係?

**答案**:
兩者密切相關但關注點不同:
- **LSP**: 關注繼承關係的正確性,子類必須能替換父類
- **ISP**: 關注接口的粒度,不應強迫實現者依賴不需要的方法

**結合使用**: 設計細粒度的接口 (ISP),確保每個實現都能正確替換接口 (LSP)

#### Q5: Go 語言中如何實踐 LSP?

**答案**:
Go 沒有傳統的類繼承,但可以通過接口實現 LSP:

1. **定義清晰的接口契約**: 使用註釋說明前置條件、後置條件
2. **組合而非繼承**: 使用結構體組合實現代碼重用
3. **接口隔離**: 定義小而專注的接口
4. **單元測試**: 編寫測試驗證所有實現的行為一致性

```go
// 定義接口
type Writer interface {
    Write(p []byte) (n int, err error)
}

// 多種實現都符合 LSP
var _ Writer = (*os.File)(nil)
var _ Writer = (*bytes.Buffer)(nil)
var _ Writer = (*strings.Builder)(nil)
```

### 總結

里氏替換原則的核心是**行為一致性**:

1. **定義**: 子類必須能透明地替換父類
2. **契約**: 子類必須遵守父類的前置條件、後置條件和不變量
3. **實踐**:
   - 優先使用組合而非繼承
   - 使用接口而非具體類別
   - 明確定義契約
   - 編寫測試驗證可替換性
4. **收益**: 提高代碼的可維護性、可擴展性和可靠性

**記住**: "Is-A" 關係不等於繼承關係,繼承必須是"行為兼容的 Is-A"。當不確定時,使用組合或接口是更安全的選擇。
