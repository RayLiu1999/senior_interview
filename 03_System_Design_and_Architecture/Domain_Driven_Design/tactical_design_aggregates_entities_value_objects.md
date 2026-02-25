# 戰術設計：Aggregate, Entity 與 Value Object

- **難度**: 7
- **標籤**: `DDD`, `Tactical Design`, `Aggregate`, `Entity`, `Value Object`

## 問題詳述

在 DDD 的戰術設計中，如何區分 Entity (實體) 與 Value Object (值物件)？Aggregate (聚合) 的作用是什麼？請說明設計 Aggregate 時的原則。

## 核心理論與詳解

戰術設計 (Tactical Design) 關注如何用程式碼具體實現領域模型。

### 1. Entity (實體)

- **定義**: 具有**唯一標識 (Identity)** 的物件。即使屬性完全相同，只要 ID 不同，就是不同的物件。
- **特點**:
  - 有生命週期 (Created, Updated, Deleted)。
  - 屬性可以改變 (Mutable)，但 ID 不變。
- **範例**: `User` (UserID), `Order` (OrderID)。

### 2. Value Object (值物件)

- **定義**: 沒有唯一標識，僅由**屬性值**定義的物件。
- **特點**:
  - **不可變 (Immutable)**: 一旦建立就不能修改。如果要改，必須建立一個新的。
  - **相等性**: 只要屬性值全部相同，就視為相等。
  - **自我驗證**: 建構時應確保資料合法性。
- **範例**: `Color` (Red, Green, Blue), `Address` (City, Street, Zip), `Money` (Amount, Currency)。

### 3. Aggregate (聚合) 與 Aggregate Root (聚合根)

- **定義**: 一組相關聯的 Entity 和 Value Object 的集合，被視為一個**資料修改的單元**。
- **Aggregate Root**: 聚合中唯一允許外部直接引用的 Entity。外部物件只能持有 Root 的引用，不能直接引用聚合內部的其他物件。
- **設計原則**:
  1. **一致性邊界**: 聚合內的資料必須保持強一致性 (Transactional Consistency)。
  2. **小聚合**: 聚合應盡量設計得小，以減少併發衝突和效能問題。
  3. **透過 ID 引用**: 聚合之間應透過 ID 關聯，而不是物件引用 (Object Reference)。

## 程式碼範例 (Go)

```go
package main

import (
    "errors"
    "fmt"
)

// --- Value Object: Money ---
// 不可變，無 ID
type Money struct {
    amount   float64
    currency string
}

func NewMoney(amount float64, currency string) (Money, error) {
    if amount < 0 {
        return Money{}, errors.New("amount cannot be negative")
    }
    return Money{amount: amount, currency: currency}, nil
}

// --- Entity: OrderItem ---
// 雖然有 ID，但在 Order 聚合內，它通常被視為內部實體
type OrderItem struct {
    ID       string
    Product  string
    Price    Money
    Quantity int
}

// --- Aggregate Root: Order ---
// 外部只能透過 Order 操作 OrderItem
type Order struct {
    ID     string
    Items  []OrderItem
    Status string
}

// AddItem 是聚合根的方法，負責維護內部一致性
func (o *Order) AddItem(item OrderItem) {
    if o.Status != "Draft" {
        fmt.Println("Cannot add item to a non-draft order")
        return
    }
    o.Items = append(o.Items, item)
    fmt.Printf("Item %s added to Order %s\n", item.Product, o.ID)
}

func (o *Order) TotalAmount() float64 {
    total := 0.0
    for _, item := range o.Items {
        total += item.Price.amount * float64(item.Quantity)
    }
    return total
}

func main() {
    price, _ := NewMoney(100, "USD")
    item := OrderItem{ID: "item1", Product: "Book", Price: price, Quantity: 2}

    order := Order{ID: "order1", Status: "Draft"}
    
    // 正確：透過聚合根操作
    order.AddItem(item)
    
    fmt.Printf("Order Total: %.2f\n", order.TotalAmount())
}
```
