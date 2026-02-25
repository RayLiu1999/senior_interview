# 什麼是六邊形架構 (Hexagonal Architecture / Ports and Adapters)？

- **難度**: 8
- **重要程度**: 4
- **標籤**: `Architecture`, `Hexagonal Architecture`, `Ports and Adapters`, `Clean Architecture`, `DDD`

## 問題詳述

六邊形架構（Hexagonal Architecture），又稱「埠與適配器架構（Ports and Adapters）」，由 Alistair Cockburn 於 2005 年提出。其核心思想是將應用程式的**業務核心（Domain）**與所有外部依賴（資料庫、HTTP、消息佇列、UI 等）完全隔離，讓業務邏輯可以獨立於基礎設施進行開發、測試和部署。

## 核心理論與詳解

### 架構圖示

```
         HTTP Client          CLI
              ↓                ↓
     [Primary Adapter]  [Primary Adapter]   ← 驅動者（主動發起請求）
              ↓                ↓
         [Primary Port / Driving Port]
              ↓
     ┌────────────────────────────┐
     │                            │
     │     APPLICATION CORE       │   ← 業務邏輯核心（Domain）
     │     (Use Cases / Domain)   │      無任何外部依賴
     │                            │
     └────────────────────────────┘
              ↓
         [Secondary Port / Driven Port]
              ↓                ↓
     [Secondary Adapter]  [Secondary Adapter]  ← 被驅動者（被動響應）
              ↓                ↓
          MySQL DB       Message Queue
```

六邊形的**每條邊代表一個 Port**（介面），核心位於中央，外部世界透過 Adapter 與 Port 交互。

### 三個核心概念

**1. Domain / Application Core（業務核心）**

- 包含純粹的業務邏輯：Entities（實體）、Value Objects（值物件）、Use Cases（用例）
- **零外部依賴**：不依賴資料庫框架、HTTP 框架、第三方函式庫
- 可以被純單元測試（Unit Test），不需要啟動任何外部服務
- 這是架構中最穩定、最重要的部分

**2. Ports（埠/介面）**

Ports 是業務核心定義的**抽象介面**，分為兩類：

| 類型 | 別名 | 方向 | 說明 | Go 範例 |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Port** | Driving Port, Inbound | 外部 → 內部 | 外部呼叫業務核心的介面 | `UserService interface` |
| **Secondary Port** | Driven Port, Outbound | 內部 → 外部 | 業務核心呼叫外部的介面 | `UserRepository interface` |

關鍵原則：**介面由內部定義，外部實現**（依賴倒置原則的體現）。

**3. Adapters（適配器）**

Adapters 是連接 Port 與外部世界的橋樑，實現具體的技術細節：

- **Primary Adapters**（主動適配器）：HTTP Controller、CLI Handler、gRPC Server——接收外部請求，轉換格式後呼叫 Primary Port
- **Secondary Adapters**（被動適配器）：MySQL Repository、Redis Cache、Kafka Publisher——實現 Secondary Port，負責與外部基礎設施通信

### Go 中的實現範例

```go
// ============ Domain Layer（業務核心）============
// entity/user.go
type User struct {
    ID    int
    Name  string
    Email string
}

// ============ Ports（介面定義在核心層）============
// port/inbound.go（Primary Port）
type UserUseCase interface {
    GetUser(ctx context.Context, id int) (*User, error)
    CreateUser(ctx context.Context, name, email string) (*User, error)
}

// port/outbound.go（Secondary Port）
type UserRepository interface {
    FindByID(ctx context.Context, id int) (*User, error)
    Save(ctx context.Context, user *User) error
}

// ============ Application Layer（Use Case 實現）============
// usecase/user_usecase.go
type userUseCase struct {
    repo UserRepository // 依賴介面，不依賴具體實現
}

func NewUserUseCase(repo UserRepository) UserUseCase {
    return &userUseCase{repo: repo}
}

func (uc *userUseCase) GetUser(ctx context.Context, id int) (*User, error) {
    return uc.repo.FindByID(ctx, id) // 純業務邏輯
}

// ============ Adapters（適配器實現）============
// adapter/inbound/http_handler.go（Primary Adapter）
type UserHTTPHandler struct {
    useCase UserUseCase
}

func (h *UserHTTPHandler) GetUser(c *gin.Context) {
    id, _ := strconv.Atoi(c.Param("id"))
    user, err := h.useCase.GetUser(c, id) // 呼叫 Primary Port
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, user)
}

// adapter/outbound/postgres_repository.go（Secondary Adapter）
type PostgresUserRepository struct {
    db *sql.DB
}

func (r *PostgresUserRepository) FindByID(ctx context.Context, id int) (*User, error) {
    // 具體的 SQL 查詢實現
    row := r.db.QueryRowContext(ctx, "SELECT id, name, email FROM users WHERE id = $1", id)
    // ...
}

// ============ 依賴注入（Composition Root）============
// main.go
func main() {
    db := connectDB()
    repo := &PostgresUserRepository{db: db}   // Secondary Adapter
    useCase := NewUserUseCase(repo)             // 組裝 Use Case
    handler := &UserHTTPHandler{useCase: useCase} // Primary Adapter
    // ...
}
```

### 六邊形架構 vs Clean Architecture vs Onion Architecture

這三種架構本質上是同一個思想的不同表述：

| 維度 | 六邊形架構 | Clean Architecture | Onion Architecture |
| :--- | :--- | :--- | :--- |
| **創始人** | Alistair Cockburn | Robert C. Martin | Jeffrey Palermo |
| **層次表示** | 六邊形 + 埠（Port）+ 適配器 | 同心圓（4層） | 洋蔥層 |
| **核心思想** | 完全相同：業務與技術解耦，依賴由外向內 | ← 同 | ← 同 |
| **依賴方向** | 適配器依賴 Port，Port 由核心定義 | 外層依賴內層，內層不知道外層 | 外層依賴內層 |

**核心共同原則**：**依賴倒置（Dependency Inversion）**——高層次模組（業務）定義介面，低層次模組（技術）實現介面。

### 測試的巨大優勢

六邊形架構的最大實際收益在於**測試策略**：

```go
// 測試時用 Mock Repository 替換真實 DB，無需啟動任何基礎設施
type MockUserRepository struct{}
func (m *MockUserRepository) FindByID(ctx context.Context, id int) (*User, error) {
    return &User{ID: id, Name: "Mock User"}, nil
}

// 純業務邏輯測試，極快且穩定
func TestGetUser(t *testing.T) {
    repo := &MockUserRepository{}
    uc := NewUserUseCase(repo)
    user, err := uc.GetUser(context.Background(), 1)
    assert.NoError(t, err)
    assert.Equal(t, "Mock User", user.Name)
}
```

### 實際應用場景與挑戰

**適用場景：**
- 業務邏輯複雜、長期維護的系統
- 需要替換基礎設施（換資料庫、換消息佇列）
- 要求高測試覆蓋率的關鍵業務系統

**挑戰：**
- **前期成本高**：需要定義大量介面，對小型或短生命週期項目過度設計
- **目錄結構複雜**：需要嚴格規劃 domain/、port/、adapter/ 等目錄
- **資料模型轉換**：Domain Entity 和 DB Model（GORM struct）之間需要 Mapper 轉換，增加樣板程式碼
