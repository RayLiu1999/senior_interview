# 什麼是介面隔離原則 (Interface Segregation Principle, ISP)？

- **難度**: 6
- **重要性**: 4
- **標籤**: `SOLID`, `ISP`, `Design Principles`

## 問題詳述

介面隔離原則要求客戶端不應該被迫依賴它不使用的方法。臃腫的介面會導致不必要的耦合和實現負擔。如何設計精簡、職責單一的介面？

## 核心理論與詳解

### 定義與本質

**介面隔離原則 (ISP)** 由 Robert C. Martin 提出：

> "Clients should not be forced to depend on interfaces they do not use."  
> "客戶端不應該被迫依賴它不使用的介面。"

**核心含義**：
- 介面應該小而專注，而非大而全
- 不同的客戶端應該依賴不同的介面
- 避免"胖介面"(Fat Interface)
- 一個類別可以實現多個小介面

**與 SRP 的關係**：
- **SRP 關注類別**：一個類別只有一個職責
- **ISP 關注介面**：一個介面只服務一類客戶端
- ISP 是 SRP 在介面設計上的體現

### 為什麼需要 ISP？

#### 1. **降低耦合度**
```go
// ❌ 違反 ISP：胖介面
type Worker interface {
    Work()
    Eat()
    Sleep()
    GetSalary()
    TakeVacation()
}

// 機器人也要實現 Worker，但不需要 Eat、Sleep
type Robot struct{}

func (r *Robot) Work() { /* ... */ }
func (r *Robot) Eat() { /* 無意義 */ }
func (r *Robot) Sleep() { /* 無意義 */ }
func (r *Robot) GetSalary() { /* 無意義 */ }
func (r *Robot) TakeVacation() { /* 無意義 */ }
```

#### 2. **提高可維護性**
- 小介面更容易理解
- 修改影響範圍小
- 實現者只需關注相關方法

#### 3. **支持單一職責**
- 每個介面服務一類客戶端
- 職責邊界清晰
- 易於測試和 mock

#### 4. **增強靈活性**
- 可以靈活組合小介面
- 支持部分實現
- 更容易擴展

### 胖介面的問題

#### 問題 1: 強制實現不需要的方法

```go
// ❌ 胖介面
type MultiFunctionPrinter interface {
    Print(doc Document)
    Scan(doc Document)
    Fax(doc Document)
    Photocopy(doc Document)
}

// 簡單打印機只能打印，但被迫實現所有方法
type SimplePrinter struct{}

func (s *SimplePrinter) Print(doc Document) {
    fmt.Println("Printing:", doc)
}

func (s *SimplePrinter) Scan(doc Document) {
    panic("not supported") // 無意義的實現
}

func (s *SimplePrinter) Fax(doc Document) {
    panic("not supported")
}

func (s *SimplePrinter) Photocopy(doc Document) {
    panic("not supported")
}
```

#### 問題 2: 不必要的重新編譯

```go
// 修改 Fax 方法的簽名
type MultiFunctionPrinter interface {
    Print(doc Document)
    Scan(doc Document)
    Fax(doc Document, recipient string) // 修改了簽名
    Photocopy(doc Document)
}

// 所有實現者都要修改，即使不使用 Fax
type SimplePrinter struct{} // 需要重新編譯
type PhotocopyMachine struct{} // 需要重新編譯
```

#### 問題 3: 違反里氏替換原則

```go
func SendFax(printer MultiFunctionPrinter, doc Document) {
    printer.Fax(doc) // 對 SimplePrinter 會 panic
}
```

### 符合 ISP 的設計

#### 解決方案 1: 拆分介面

```go
// ✅ 符合 ISP：小介面

// 按功能拆分
type Printer interface {
    Print(doc Document)
}

type Scanner interface {
    Scan(doc Document)
}

type Faxer interface {
    Fax(doc Document)
}

type Photocopier interface {
    Photocopy(doc Document)
}

// 實現者按需實現
type SimplePrinter struct{}

func (s *SimplePrinter) Print(doc Document) {
    fmt.Println("Printing:", doc)
}
// 只實現 Print，不需要實現其他方法

type MultiFunctionDevice struct{}

func (m *MultiFunctionDevice) Print(doc Document) {
    fmt.Println("Printing:", doc)
}

func (m *MultiFunctionDevice) Scan(doc Document) {
    fmt.Println("Scanning:", doc)
}

func (m *MultiFunctionDevice) Fax(doc Document) {
    fmt.Println("Faxing:", doc)
}

func (m *MultiFunctionDevice) Photocopy(doc Document) {
    fmt.Println("Photocopying:", doc)
}

// 客戶端只依賴需要的介面
func PrintDocument(printer Printer, doc Document) {
    printer.Print(doc) // 可以傳入 SimplePrinter 或 MultiFunctionDevice
}

func ScanDocument(scanner Scanner, doc Document) {
    scanner.Scan(doc) // 只能傳入實現 Scanner 的類型
}
```

#### 解決方案 2: 組合小介面

```go
// 如果需要多個功能，使用組合
type PrintScanner interface {
    Printer
    Scanner
}

type OfficeDevice interface {
    Printer
    Scanner
    Faxer
}

// 使用示例
func ProcessDocument(device PrintScanner, doc Document) {
    device.Scan(doc)
    device.Print(doc)
}
```

### 實際應用場景

#### 場景 1: 數據存儲介面

```go
// ❌ 胖介面：包含所有可能的操作
type Storage interface {
    Create(key string, value []byte) error
    Read(key string) ([]byte, error)
    Update(key string, value []byte) error
    Delete(key string) error
    List() ([]string, error)
    Search(query string) ([]string, error)
    Backup() error
    Restore(backup []byte) error
    GetStats() Stats
}

// ✅ 符合 ISP：按用途拆分
type Reader interface {
    Read(key string) ([]byte, error)
}

type Writer interface {
    Create(key string, value []byte) error
    Update(key string, value []byte) error
    Delete(key string) error
}

type Lister interface {
    List() ([]string, error)
}

type Searcher interface {
    Search(query string) ([]string, error)
}

type BackupManager interface {
    Backup() error
    Restore(backup []byte) error
}

type StatsProvider interface {
    GetStats() Stats
}

// 只讀存儲
type ReadOnlyStorage struct{}

func (r *ReadOnlyStorage) Read(key string) ([]byte, error) {
    // 只需實現 Read
    return nil, nil
}

// 完整存儲
type FullStorage struct{}

func (f *FullStorage) Read(key string) ([]byte, error)              { return nil, nil }
func (f *FullStorage) Create(key string, value []byte) error        { return nil }
func (f *FullStorage) Update(key string, value []byte) error        { return nil }
func (f *FullStorage) Delete(key string) error                      { return nil }
func (f *FullStorage) List() ([]string, error)                      { return nil, nil }
func (f *FullStorage) Search(query string) ([]string, error)        { return nil, nil }
func (f *FullStorage) Backup() error                                { return nil }
func (f *FullStorage) Restore(backup []byte) error                  { return nil }
func (f *FullStorage) GetStats() Stats                              { return Stats{} }

// 客戶端按需依賴
func DisplayData(reader Reader, key string) {
    data, _ := reader.Read(key)
    fmt.Println(string(data))
}

func ModifyData(writer Writer, key string, value []byte) {
    writer.Update(key, value)
}
```

#### 場景 2: HTTP Handler

```go
// ❌ 胖介面
type HTTPHandler interface {
    HandleGet(w http.ResponseWriter, r *http.Request)
    HandlePost(w http.ResponseWriter, r *http.Request)
    HandlePut(w http.ResponseWriter, r *http.Request)
    HandleDelete(w http.ResponseWriter, r *http.Request)
    HandlePatch(w http.ResponseWriter, r *http.Request)
    HandleOptions(w http.ResponseWriter, r *http.Request)
    Validate(r *http.Request) error
    Authenticate(r *http.Request) error
    Authorize(r *http.Request) error
    Log(message string)
}

// ✅ 符合 ISP
type GetHandler interface {
    HandleGet(w http.ResponseWriter, r *http.Request)
}

type PostHandler interface {
    HandlePost(w http.ResponseWriter, r *http.Request)
}

type DeleteHandler interface {
    HandleDelete(w http.ResponseWriter, r *http.Request)
}

type Validator interface {
    Validate(r *http.Request) error
}

type Authenticator interface {
    Authenticate(r *http.Request) error
}

// 實現者按需實現
type UserGetHandler struct{}

func (h *UserGetHandler) HandleGet(w http.ResponseWriter, r *http.Request) {
    // 只處理 GET 請求
}

type UserCreateHandler struct{}

func (h *UserCreateHandler) HandlePost(w http.ResponseWriter, r *http.Request) {
    // 只處理 POST 請求
}

func (h *UserCreateHandler) Validate(r *http.Request) error {
    // 實現驗證
    return nil
}
```

#### 場景 3: 數據庫 Repository

```go
// ✅ 按操作類型拆分介面

type UserReader interface {
    FindByID(id int) (*User, error)
    FindByEmail(email string) (*User, error)
    FindAll() ([]*User, error)
}

type UserWriter interface {
    Create(user *User) error
    Update(user *User) error
    Delete(id int) error
}

type UserSearcher interface {
    Search(criteria SearchCriteria) ([]*User, error)
}

// 查詢服務只依賴 Reader
type UserQueryService struct {
    repo UserReader
}

func (s *UserQueryService) GetUser(id int) (*User, error) {
    return s.repo.FindByID(id)
}

// 命令服務依賴 Writer
type UserCommandService struct {
    repo UserWriter
}

func (s *UserCommandService) CreateUser(user *User) error {
    return s.repo.Create(user)
}

// 完整的 Repository 實現所有介面
type UserRepository struct {
    db *sql.DB
}

func (r *UserRepository) FindByID(id int) (*User, error)          { /* ... */ return nil, nil }
func (r *UserRepository) FindByEmail(email string) (*User, error) { /* ... */ return nil, nil }
func (r *UserRepository) FindAll() ([]*User, error)               { /* ... */ return nil, nil }
func (r *UserRepository) Create(user *User) error                 { /* ... */ return nil }
func (r *UserRepository) Update(user *User) error                 { /* ... */ return nil }
func (r *UserRepository) Delete(id int) error                     { /* ... */ return nil }
func (r *UserRepository) Search(criteria SearchCriteria) ([]*User, error) { /* ... */ return nil, nil }
```

### ISP 與其他原則的關係

#### 與單一職責原則 (SRP)
```go
// ISP 確保介面有單一職責
type Notifier interface {
    Send(message string) error // 單一職責：發送通知
}

// 不要混合不同職責
type NotifierAndLogger interface {
    Send(message string) error
    Log(message string) error // 額外的職責，違反 ISP
}
```

#### 與依賴反轉原則 (DIP)
```go
// ISP 幫助定義清晰的抽象

// ✅ 小而專注的介面更容易抽象
type EmailSender interface {
    SendEmail(to, subject, body string) error
}

// 高層模組依賴抽象
type NotificationService struct {
    emailSender EmailSender
}

func (n *NotificationService) NotifyUser(user *User, message string) error {
    return n.emailSender.SendEmail(user.Email, "Notification", message)
}
```

### 常見誤區與權衡

#### 誤區 1: 過度拆分

```go
// ❌ 過度拆分導致介面爆炸
type UserIDGetter interface {
    GetID() int
}

type UserNameGetter interface {
    GetName() string
}

type UserEmailGetter interface {
    GetEmail() string
}
// ... 每個屬性一個介面

// ✅ 適度聚合
type UserInfo interface {
    GetID() int
    GetName() string
    GetEmail() string
}
```

**權衡原則**：
- 按"客戶端的使用場景"拆分，而非按"方法數量"
- 如果多個方法總是一起使用，應該放在同一介面

#### 誤區 2: 誤解"不使用"

```go
// 客戶端可能不立即調用所有方法，但仍然需要這些方法

type Transaction interface {
    Begin() error
    Commit() error
    Rollback() error
}

// ✓ 這三個方法是一起的，不應該拆分
// 即使某些場景只用 Begin 和 Commit
// Rollback 是契約的一部分
```

#### 誤區 3: 與語言特性的衝突

Go 語言的介面是隱式實現的，這降低了 ISP 的重要性：
```go
// Go 中，即使有胖介面，客戶端也可以定義自己的小介面
type Printer interface {
    Print()
}

// 即使 MultiFunctionDevice 實現了很多方法
// 只要它有 Print() 方法，就能作為 Printer 使用
func PrintDoc(p Printer) {
    p.Print()
}
```

### 實踐檢查清單

```
✓ 介面是否包含客戶端不需要的方法？
✓ 是否有實現者為了滿足介面而寫空方法或拋異常？
✓ 介面修改時是否影響到不相關的客戶端？
✓ 是否可以將介面拆分為多個職責單一的小介面？
✓ 不同的客戶端是否可以依賴不同的介面？
✓ 介面是否可以用一句話清晰描述？
```

### 重構胖介面的步驟

1. **識別客戶端群組**
```go
// 分析誰在使用這個介面
// - 只讀客戶端
// - 只寫客戶端
// - 完整訪問客戶端
```

2. **按用途分組方法**
```go
// 將方法按客戶端用途分組
// - 查詢方法 -> Reader 介面
// - 修改方法 -> Writer 介面
// - 管理方法 -> Manager 介面
```

3. **提取小介面**
```go
// 為每個群組提取介面
type Reader interface { /* 查詢方法 */ }
type Writer interface { /* 修改方法 */ }
```

4. **組合介面**
```go
// 需要多個功能時，組合小介面
type ReadWriter interface {
    Reader
    Writer
}
```

5. **更新客戶端**
```go
// 讓客戶端依賴最小的介面
func DisplayData(reader Reader) { /* ... */ }
func SaveData(writer Writer) { /* ... */ }
```

## 總結

**核心要點**：
1. **小而專注的介面優於大而全的介面**
2. **客戶端只依賴它實際使用的方法**
3. **按客戶端用途拆分介面，而非按類別結構**
4. **可以通過組合小介面構建大介面**

**實踐建議**：
- 設計介面時考慮客戶端的視角
- 避免為了"完整性"而添加不必要的方法
- 使用組合而非繼承來擴展介面
- 定期審查介面，及時拆分臃腫的介面

**判斷依據**：
- 有空實現或 panic 的方法 → 違反 ISP
- 介面修改影響大量無關客戶端 → 違反 ISP
- 不同客戶端使用介面的不同子集 → 應該拆分介面

**與 SRP 的區別**：
- SRP: 類別只有一個變化的原因
- ISP: 介面只服務一類客戶端
