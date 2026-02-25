# Repository 與 Factory 模式

- **難度**: 5
- **標籤**: `DDD`, `Repository`, `Factory`, `Design Pattern`

## 問題詳述

在 DDD 中，Repository 和 Factory 是兩個重要的生命週期管理模式。請解釋它們的職責分別是什麼？為什麼不應該直接在 Service 層使用 `new` 關鍵字或直接呼叫 DB Driver？

## 核心理論與詳解

### 1. Factory (工廠模式)

- **職責**: 負責**建立**複雜的 Aggregate 或 Entity。
- **為什麼需要**:
  - 當一個物件的建立過程很複雜（例如需要生成 ID、初始化狀態、驗證多個參數）時，將這些邏輯封裝在 Factory 中，可以讓領域模型更清晰。
  - 確保建立出來的物件處於「一致且有效」的狀態 (Invariant Protection)。
- **類型**:
  - Factory Method (在 Aggregate Root 上的靜態方法)。
  - 獨立的 Factory Class。

### 2. Repository (倉儲模式)

- **職責**: 負責**持久化**和**重建** Aggregate。它提供了類似集合 (Collection) 的介面來存取領域物件。
- **核心概念**:
  - **抽象介面**: Repository 應該定義為 Interface (如 `OrderRepository`)，位於 Domain Layer。
  - **具體實作**: 實作類別 (如 `SqlOrderRepository`) 位於 Infrastructure Layer。
  - **與 DAO 的區別**: DAO (Data Access Object) 通常對應資料庫表 (Table-centric)，而 Repository 對應聚合 (Aggregate-centric)。一個 Repository 的 `Save` 操作可能會寫入多張資料表。
- **好處**:
  - **解耦**: Domain Layer 不依賴具體的資料庫技術 (MySQL, MongoDB)。
  - **可測試性**: 容易 Mock Repository 進行單元測試。

## 程式碼範例 (Go)

```go
package main

import "fmt"

// --- Domain Layer ---

type User struct {
    ID   string
    Name string
}

// UserRepository Interface (定義在 Domain 層)
type UserRepository interface {
    Save(user *User) error
    FindByID(id string) (*User, error)
}

// UserFactory (負責複雜的建立邏輯)
func NewUser(id, name string) (*User, error) {
    if id == "" || name == "" {
        return nil, fmt.Errorf("invalid user data")
    }
    return &User{ID: id, Name: name}, nil
}

// --- Infrastructure Layer ---

// InMemoryUserRepository (具體實作)
type InMemoryUserRepository struct {
    store map[string]*User
}

func NewInMemoryUserRepository() *InMemoryUserRepository {
    return &InMemoryUserRepository{store: make(map[string]*User)}
}

func (r *InMemoryUserRepository) Save(user *User) error {
    r.store[user.ID] = user
    fmt.Printf("User %s saved to DB.\n", user.Name)
    return nil
}

func (r *InMemoryUserRepository) FindByID(id string) (*User, error) {
    if user, ok := r.store[id]; ok {
        return user, nil
    }
    return nil, fmt.Errorf("user not found")
}

// --- Application Service ---

func main() {
    // Dependency Injection
    var repo UserRepository = NewInMemoryUserRepository()

    // 1. Factory 建立物件
    user, _ := NewUser("u1", "Alice")

    // 2. Repository 保存物件
    repo.Save(user)

    // 3. Repository 重建物件
    foundUser, _ := repo.FindByID("u1")
    fmt.Printf("Found user: %s\n", foundUser.Name)
}
```
