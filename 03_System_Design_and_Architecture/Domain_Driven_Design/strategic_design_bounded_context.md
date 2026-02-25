# 戰略設計：Bounded Context 與 Ubiquitous Language

- **難度**: 8
- **標籤**: `DDD`, `Strategic Design`, `Bounded Context`, `Ubiquitous Language`, `Microservices`

## 問題詳述

在大型系統開發中，不同團隊對同一個名詞（如「User」或「Product」）往往有不同的定義。DDD 如何透過 Bounded Context (限界上下文) 和 Ubiquitous Language (通用語言) 來解決這個問題？這對微服務拆分有何影響？

## 核心理論與詳解

戰略設計 (Strategic Design) 是 DDD 的精髓，主要用於從高層次劃分系統邊界，確保大型系統的可維護性。

### 1. Ubiquitous Language (通用語言)

- **定義**: 開發人員與領域專家 (Domain Experts) 共同使用的、嚴格定義的語言。
- **目的**: 消除溝通鴻溝。程式碼中的類別、方法名稱應該直接對應業務概念。
- **原則**: 如果業務方說「下訂單」，程式碼就應該是 `placeOrder()`，而不是 `saveOrderToDb()`。

### 2. Bounded Context (限界上下文)

- **定義**: 一個語義邊界，在該邊界內，每個概念 (Ubiquitous Language) 都有特定的、唯一的含義。
- **為什麼需要它**: 在大型電商系統中，「商品 (Product)」在不同場景下意義不同：
  - **銷售上下文 (Sales Context)**: 商品包含標題、描述、價格、圖片。
  - **庫存上下文 (Inventory Context)**: 商品只是一個 SKU ID 和數量，不關心圖片。
  - **物流上下文 (Shipping Context)**: 商品是重量、體積和易碎屬性。
- **解決方案**: 不要試圖建立一個包含所有屬性的「大一統 Product 類別」。而是在不同的 Bounded Context 中建立各自的 Product 模型，透過 ID 關聯。

### 3. Context Mapping (上下文映射)

定義不同 Bounded Context 之間的關係：

- **Partnership**: 兩個團隊緊密合作，共同成敗。
- **Shared Kernel**: 共享一部分核心模型程式碼（需謹慎）。
- **Customer-Supplier**: 上游團隊 (Supplier) 供應介面給下游 (Customer)，下游依賴上游。
- **Anti-Corruption Layer (ACL, 防腐層)**: 下游建立一個隔離層，將上游的模型轉換為自己的模型，防止上游的變更污染下游。
- **Open Host Service (OHS)**: 上游提供公開、標準的 API 給所有下游使用。

## 程式碼範例 (Go)

模擬兩個不同 Context 下的「User」模型差異。

```go
package main

import "fmt"

// --- Identity & Access Context (身份與權限上下文) ---
// 這裡的 User 關注的是登入、密碼、角色
type AuthUser struct {
    ID           string
    Username     string
    PasswordHash string
    Roles        []string
}

func (u *AuthUser) Login() {
    fmt.Printf("User %s logged in.\n", u.Username)
}

// --- Sales Context (銷售上下文) ---
// 這裡的 User (改名為 Customer 可能更合適) 關注的是地址、付款方式、會員等級
type Customer struct {
    ID              string // 關聯到 AuthUser 的 ID
    ShippingAddress string
    PaymentMethods  []string
    VIPLevel        int
}

func (c *Customer) PlaceOrder() {
    fmt.Printf("Customer %s placed an order to %s.\n", c.ID, c.ShippingAddress)
}

func main() {
    // 在微服務架構中，這兩個 Struct 可能位於完全不同的服務中
    // 透過 ID 進行邏輯上的關聯，而不是物理上的強耦合
    
    authUser := AuthUser{ID: "u123", Username: "john_doe"}
    customer := Customer{ID: "u123", ShippingAddress: "123 Main St"}

    authUser.Login()
    customer.PlaceOrder()
}
```
