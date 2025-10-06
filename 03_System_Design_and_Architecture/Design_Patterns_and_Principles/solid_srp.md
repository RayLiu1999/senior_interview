# 什麼是單一職責原則 (Single Responsibility Principle, SRP)？

- **難度**: 5
- **重要性**: 5
- **標籤**: `SOLID`, `SRP`, `Design Principles`

## 問題詳述

單一職責原則是 SOLID 五大設計原則中的第一個，也是最基礎的原則。它要求一個類別或模組應該只有一個引起它變化的原因。在實際開發中如何理解和應用這個原則？

## 核心理論與詳解

### 定義與本質

**單一職責原則 (SRP)** 由 Robert C. Martin (Uncle Bob) 提出：

> "A class should have only one reason to change."  
> "一個類別應該只有一個引起它變化的原因。"

**更精確的表述**：
- 一個模組應該只對一個角色 (actor) 或利益相關者 (stakeholder) 負責
- 變化的原因應該只有一個：當該角色的需求變化時，模組才需要修改
- 職責 = 變化的原因 = 特定角色的需求

### 為什麼需要 SRP？

#### 1. **降低耦合度**
- 當一個類別承擔多個職責時，這些職責之間會產生耦合
- 一個職責的變化可能影響其他職責的實現
- 違反 SRP 會導致脆弱的設計

#### 2. **提高可維護性**
- 職責單一的類別更容易理解
- 修改時只需關注特定職責，降低引入 bug 的風險
- 代碼邏輯清晰，易於定位問題

#### 3. **增強可測試性**
- 職責單一的類別依賴較少
- 測試用例更聚焦，覆蓋率更高
- Mock 依賴更簡單

#### 4. **促進代碼重用**
- 職責單一的類別更通用
- 可以在不同場景下重用
- 避免"上帝類"(God Class)

### 如何識別職責？

#### 判斷標準

1. **變化的原因**
   - 問：這個類別會因為什麼原因需要修改？
   - 如果答案有多個，可能違反了 SRP

2. **描述的難度**
   - 如果用一句話無法清晰描述類別的職責
   - 或者描述中出現"和"、"或"等連接詞
   - 可能職責過多

3. **方法的凝聚性**
   - 類別中的方法是否都在操作相同的數據？
   - 是否有明顯的方法分組？
   - 分組暗示了不同的職責

#### 常見的多職責跡象

```
❌ 違反 SRP 的類別特徵：
- 類別名稱模糊（如 Manager、Utility、Helper）
- 方法數量過多（超過 10-15 個）
- 私有方法遠多於公有方法
- 有大量的依賴注入
- 測試困難，需要複雜的 setup
```

### 實際應用場景

#### 經典錯誤示例：User 類別承擔多個職責

**問題代碼**（違反 SRP）：
```go
// ❌ User 類別承擔了太多職責
type User struct {
    ID       int
    Username string
    Email    string
    Password string
}

// 職責 1: 業務邏輯 - 驗證
func (u *User) ValidateEmail() error {
    if !strings.Contains(u.Email, "@") {
        return errors.New("invalid email")
    }
    return nil
}

// 職責 2: 持久化 - 數據庫操作
func (u *User) SaveToDB() error {
    // 連接數據庫
    db, _ := sql.Open("mysql", "...")
    // 執行 SQL
    _, err := db.Exec("INSERT INTO users ...")
    return err
}

// 職責 3: 表現層 - JSON 序列化
func (u *User) ToJSON() ([]byte, error) {
    return json.Marshal(u)
}

// 職責 4: 安全 - 密碼處理
func (u *User) HashPassword() error {
    hashed, err := bcrypt.GenerateFromPassword([]byte(u.Password), 10)
    if err != nil {
        return err
    }
    u.Password = string(hashed)
    return nil
}
```

**問題分析**：
- **DBA 修改資料庫結構** → 需要修改 User
- **前端改變 JSON 格式** → 需要修改 User  
- **安全團隊升級加密算法** → 需要修改 User
- **業務規則調整驗證邏輯** → 需要修改 User

**改進方案**（符合 SRP）：

```go
// ✅ 職責分離

// 1. 領域模型 - 只包含業務實體
type User struct {
    ID       int
    Username string
    Email    string
    Password string
}

// 2. 驗證器 - 負責業務規則驗證
type UserValidator struct{}

func (v *UserValidator) ValidateEmail(email string) error {
    if !strings.Contains(email, "@") {
        return errors.New("invalid email")
    }
    return nil
}

func (v *UserValidator) ValidateUsername(username string) error {
    if len(username) < 3 {
        return errors.New("username too short")
    }
    return nil
}

// 3. 儲存庫 - 負責持久化
type UserRepository struct {
    db *sql.DB
}

func (r *UserRepository) Save(user *User) error {
    _, err := r.db.Exec(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        user.Username, user.Email, user.Password,
    )
    return err
}

func (r *UserRepository) FindByID(id int) (*User, error) {
    // 查詢邏輯
    return &User{}, nil
}

// 4. 密碼服務 - 負責密碼加密
type PasswordService struct{}

func (s *PasswordService) Hash(password string) (string, error) {
    hashed, err := bcrypt.GenerateFromPassword([]byte(password), 10)
    return string(hashed), err
}

func (s *PasswordService) Verify(hashed, password string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hashed), []byte(password))
    return err == nil
}

// 5. 序列化器 - 負責格式轉換
type UserSerializer struct{}

func (s *UserSerializer) ToJSON(user *User) ([]byte, error) {
    return json.Marshal(user)
}

func (s *UserSerializer) FromJSON(data []byte) (*User, error) {
    var user User
    err := json.Unmarshal(data, &user)
    return &user, err
}
```

**改進後的優勢**：
- 每個類別職責單一，變化原因明確
- 可以獨立測試每個組件
- 容易替換實現（如更換數據庫、更改加密算法）
- 代碼重用性更高

### SRP 在不同層級的應用

#### 1. **函數級別**
```go
// ❌ 函數做了太多事
func ProcessOrder(orderID int) error {
    // 驗證訂單
    order := validateOrder(orderID)
    // 扣款
    processPayment(order)
    // 更新庫存
    updateInventory(order)
    // 發送郵件
    sendEmail(order)
    // 記錄日誌
    logOrder(order)
    return nil
}

// ✅ 職責分離
func ProcessOrder(orderID int) error {
    order, err := orderService.GetOrder(orderID)
    if err != nil {
        return err
    }
    
    if err := orderService.Process(order); err != nil {
        return err
    }
    
    return nil
}

// 每個服務負責一個職責
// - OrderService: 業務流程編排
// - PaymentService: 支付處理
// - InventoryService: 庫存管理
// - NotificationService: 通知發送
// - Logger: 日誌記錄
```

#### 2. **模組級別**
```
❌ 一個大模組包含所有功能：
user/
  ├── user.go (包含所有邏輯)

✅ 按職責拆分模組：
user/
  ├── domain/
  │   └── user.go          (領域模型)
  ├── repository/
  │   └── user_repo.go     (數據訪問)
  ├── service/
  │   └── user_service.go  (業務邏輯)
  ├── validator/
  │   └── user_validator.go (驗證邏輯)
  └── handler/
      └── user_handler.go  (HTTP 處理)
```

#### 3. **微服務級別**
```
❌ 單體服務承擔多個業務職責：
- 用戶管理
- 訂單處理
- 支付處理
- 庫存管理
- 通知發送

✅ 按業務職責拆分微服務：
- User Service: 只負責用戶相關
- Order Service: 只負責訂單相關
- Payment Service: 只負責支付相關
- Inventory Service: 只負責庫存相關
- Notification Service: 只負責通知相關
```

### 常見誤區與權衡

#### 誤區 1: 過度拆分
```go
// ❌ 過度細分導致碎片化
type UserFirstNameValidator struct{}
type UserLastNameValidator struct{}
type UserAgeValidator struct{}
type UserEmailValidator struct{}
// ... 上百個微小的類別

// ✅ 適度聚合相關職責
type UserValidator struct {
    // 包含所有用戶驗證邏輯
}
```

**權衡原則**：
- SRP 不是"一個類別一個方法"
- 相關的職責可以放在一起
- 關鍵是"變化的原因"是否單一

#### 誤區 2: 混淆職責與功能
```
職責 ≠ 功能

職責是從變化原因的角度看：
- "處理用戶註冊的業務邏輯" 是一個職責
- 其中包含多個功能：驗證、加密、存儲等

功能是從操作的角度看：
- "發送郵件" 是一個功能
- 可能被多個職責使用
```

#### 誤區 3: 忽略上下文
- **小型專案初期**：可以適度放寬 SRP，避免過早優化
- **大型複雜系統**：嚴格遵守 SRP，防止技術債務累積
- **團隊規模**：大團隊更需要明確的職責劃分

### SRP 與其他原則的關係

#### 與開閉原則 (OCP)
- SRP 是 OCP 的基礎
- 職責單一的類別更容易擴展而不修改

#### 與依賴反轉原則 (DIP)
- SRP 幫助識別抽象邊界
- 單一職責的類別更容易定義清晰的接口

#### 與接口隔離原則 (ISP)
- SRP 應用於類別，ISP 應用於接口
- 兩者都強調"分離關注點"

### 實踐檢查清單

在代碼審查時，可以用以下問題檢查 SRP：

```
✓ 這個類別只有一個變化的原因嗎？
✓ 能用一句話清晰描述這個類別的職責嗎？
✓ 如果需求變更，會有多個團隊需要修改這個類別嗎？
✓ 類別中的方法是否都在操作相同的數據？
✓ 測試這個類別時，是否需要 mock 大量依賴？
✓ 類別名稱是否清晰且具體（避免 Manager、Utility 等模糊命名）？
```

## 總結

**核心要點**：
1. **一個類別 = 一個變化原因 = 一個角色的需求**
2. **SRP 提高內聚性，降低耦合度**
3. **適度應用，避免過度拆分**
4. **關注"變化的原因"而非"功能數量"**

**實踐建議**：
- 從識別職責開始，而不是直接寫代碼
- 使用清晰具體的命名反映職責
- 定期重構，合併過度拆分或拆分過度聚合的代碼
- 在團隊中統一對"職責"的理解

**判斷依據**：
- 如果一個類別的修改需要通知多個團隊 → 違反 SRP
- 如果一個類別難以命名或需要"和"來描述 → 違反 SRP  
- 如果一個類別的測試需要大量 setup → 違反 SRP
