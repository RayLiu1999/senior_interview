# 貧血模型 vs 充血模型 (Anemic vs Rich Domain Model)

- **難度**: 6
- **標籤**: `DDD`, `Domain Model`, `Anti-Pattern`, `Refactoring`

## 問題詳述

在傳統的 Java/Spring 開發中，我們常看到只有 Getter/Setter 的 Entity，業務邏輯全都在 Service 層。這被稱為「貧血模型」。請解釋貧血模型與 DDD 提倡的「充血模型」有何不同？為什麼 DDD 認為貧血模型是一種反模式 (Anti-Pattern)？

## 核心理論與詳解

### 1. 貧血模型 (Anemic Domain Model)

- **特徵**:
  - **Entity**: 純粹的資料容器 (Data Holder)，只有欄位和 Getter/Setter，沒有業務邏輯。
  - **Service**: 包含所有的業務邏輯，操作 Entity 的資料。
- **優點**: 簡單直觀，符合過程式編程 (Procedural Programming) 的思維，適合簡單的 CRUD 系統。
- **缺點**:
  - **物件導向失效**: 違背了封裝原則 (Encapsulation)，資料與行為分離。
  - **邏輯分散**: 業務邏輯可能散落在多個 Service 中，難以維護和重用。
  - **狀態不一致**: 由於 Entity 的 Setter 是公開的，任何 Service 都可以隨意修改其狀態，難以保證資料完整性。

### 2. 充血模型 (Rich Domain Model)

- **特徵**:
  - **Entity**: 同時包含資料和與該資料相關的業務邏輯。
  - **Service**: 變得很薄，僅負責協調工作（如載入 Entity、呼叫 Entity 方法、保存 Entity）。
- **優點**:
  - **高內聚**: 資料與行為在一起，邏輯清晰。
  - **封裝性好**: Entity 可以保護自己的內部狀態，不暴露 Setter，只暴露業務方法 (如 `changeAddress()` 而非 `setAddress()`)。
- **缺點**: 學習曲線較高，需要更強的物件導向設計能力。

## 程式碼範例 (Go)

### 貧血模型 (Anemic)

```go
package main

// Account 只是資料結構
type AnemicAccount struct {
    Balance float64
}

// Service 負責邏輯
type AccountService struct{}

func (s *AccountService) Withdraw(acc *AnemicAccount, amount float64) bool {
    if acc.Balance >= amount {
        acc.Balance -= amount
        return true
    }
    return false
}
```

### 充血模型 (Rich)

```go
package main

import "errors"

// Account 包含邏輯，保護內部狀態
type RichAccount struct {
    balance float64 // 私有欄位，外部無法直接修改
}

func NewRichAccount(initialBalance float64) *RichAccount {
    return &RichAccount{balance: initialBalance}
}

// Withdraw 是 Account 自己的行為
func (a *RichAccount) Withdraw(amount float64) error {
    if amount <= 0 {
        return errors.New("amount must be positive")
    }
    if a.balance < amount {
        return errors.New("insufficient funds")
    }
    a.balance -= amount
    return nil
}

func (a *RichAccount) Balance() float64 {
    return a.balance
}
```

### 總結

在 DDD 中，我們強烈建議使用**充血模型**。Service 層應該只負責應用邏輯 (Application Logic)，如交易控制、權限檢查、發送 Email 等；而核心的業務規則 (Domain Logic) 應該封裝在 Domain Model 中。
