# 什麼是抽象工廠模式 (Abstract Factory Pattern)？

- **難度**: 7
- **重要程度**: 4
- **標籤**: `Design Pattern`, `Abstract Factory`, `Go`

## 問題詳述

抽象工廠模式是另一種重要的創建型設計模式，它與工廠方法模式有關聯但又有所不同。請解釋抽象工廠模式的定義、意圖，並說明它與工廠方法模式的關鍵區別。最後，請用 Go 語言提供一個抽象工廠模式的實現範例。

## 核心理論與詳解

**抽象工廠模式 (Abstract Factory Pattern)** 提供一個介面，用於創建**一系列相關或相互依賴的物件**，而無需指定它們具體的類別。這個模式的核心在於「系列」或「家族」，它不是創建單一的產品，而是創建一整套的產品。

其核心意圖是：

- **提供一個創建產品家族的介面**: 抽象工廠定義了多個工廠方法，每個方法用於創建一個特定類型的產品。
- **將客戶端與具體的產品類別解耦**: 客戶端只需要知道它在使用哪個工廠，而不需要關心這個工廠具體創建了哪個品牌的產品。

這使得更換整個產品家族變得非常容易，只需要更換一個具體的工廠實例即可。

### 抽象工廠模式 vs. 工廠方法模式

這兩種模式都屬於創建型模式，並且都涉及到工廠和產品，但它們的層級和意圖不同。

| 特性 | 工廠方法模式 (Factory Method Pattern) | 抽象工廠模式 (Abstract Factory Pattern) |
| :--- | :--- | :--- |
| **意圖** | 創建 **一個** 產品。其核心是延遲實例化到子類別。 | 創建 **一系列相關** 的產品（一個產品家族）。 |
| **結構** | 通常包含一個抽象工廠和多個具體工廠，每個具體工廠實現 **一個** 抽象的工廠方法。 | 通常包含一個抽象工廠和多個具體工廠，每個具體工廠實現 **多個** 抽象的工廠方法，每個方法創建一個產品。 |
| **抽象層級** | 關注單個產品的創建。 | 關注一整個產品家族的創建，比工廠方法更高一個層級。 |
| **關係** | 抽象工廠通常可以由多個工廠方法組成，這意味著抽象工廠模式在實現時，其內部可能包含多個工廠方法模式。 | - |
| **擴展性** | **符合開閉原則**。新增產品時，只需新增具體的產品和工廠類別。 | **新增產品家族符合開閉原則**，但 **在產品家族中新增產品類型不符合**。如果要在所有工廠中新增一個創建新產品（例如 `createChair`）的方法，就需要修改抽象工廠介面和所有具體工廠類別。 |

**簡單來說**:

- **工廠方法** 處理的是「如何創建一個產品」的問題，它將這個問題延遲到子類別。
- **抽象工廠** 處理的是「如何創建一整套相互關聯的產品」的問題，它確保客戶端從一個工廠獲得的產品都屬於同一個系列。

## 程式碼範例 (Go)

讓我們用一個生產不同品牌運動服裝（上衣和褲子）的例子來演示抽象工廠模式。假設我們有 Nike 和 Adidas 兩個品牌。

```go
package main

import "fmt"

// 1. 抽象產品介面 (Abstract Products)

// Shirt 介面
type Shirt interface {
    GetLogo() string
    GetSize() int
}

// Pants 介面
type Pants interface {
    GetLogo() string
    GetSize() int
}

// 2. 具體產品 (Concrete Products)

// NikeShirt 結構
type NikeShirt struct{}
func (ns *NikeShirt) GetLogo() string { return "Nike" }
func (ns *NikeShirt) GetSize() int    { return 28 }

// NikePants 結構
type NikePants struct{}
func (np *NikePants) GetLogo() string { return "Nike" }
func (np *NikePants) GetSize() int    { return 32 }

// AdidasShirt 結構
type AdidasShirt struct{}
func (as *AdidasShirt) GetLogo() string { return "Adidas" }
func (as *AdidasShirt) GetSize() int    { return 29 }

// AdidasPants 結構
type AdidasPants struct{}
func (ap *AdidasPants) GetLogo() string { return "Adidas" }
func (ap *AdidasPants) GetSize() int    { return 33 }


// 3. 抽象工廠介面 (Abstract Factory)
// 定義了創建一系列產品（上衣和褲子）的方法
type SportsFactory interface {
    CreateShirt() Shirt
    CreatePants() Pants
}

// 4. 具體工廠 (Concrete Factories)

// NikeFactory 結構
type NikeFactory struct{}
func (nf *NikeFactory) CreateShirt() Shirt { return &NikeShirt{} }
func (nf *NikeFactory) CreatePants() Pants { return &NikePants{} }

// AdidasFactory 結構
type AdidasFactory struct{}
func (af *AdidasFactory) CreateShirt() Shirt { return &AdidasShirt{} }
func (af *AdidasFactory) CreatePants() Pants { return &AdidasPants{} }


// getSportsFactory 是一個輔助函數，根據品牌返回對應的工廠
func getSportsFactory(brand string) (SportsFactory, error) {
    if brand == "nike" {
        return &NikeFactory{}, nil
    }
    if brand == "adidas" {
        return &AdidasFactory{}, nil
    }
    return nil, fmt.Errorf("不支援的品牌: %s", brand)
}

func main() {
    // 想要一套 Nike
    nikeFactory, _ := getSportsFactory("nike")
    nikeShirt := nikeFactory.CreateShirt()
    nikePants := nikeFactory.CreatePants()

    fmt.Printf("品牌: %s, 上衣尺寸: %d\n", nikeShirt.GetLogo(), nikeShirt.GetSize())
    fmt.Printf("品牌: %s, 褲子尺寸: %d\n", nikePants.GetLogo(), nikePants.GetSize())
    // 確保了從同一個工廠出來的產品都屬於同一個品牌

    fmt.Println("---")

    // 想要一套 Adidas
    adidasFactory, _ := getSportsFactory("adidas")
    adidasShirt := adidasFactory.CreateShirt()
    adidasPants := adidasFactory.CreatePants()

    fmt.Printf("品牌: %s, 上衣尺寸: %d\n", adidasShirt.GetLogo(), adidasShirt.GetSize())
    fmt.Printf("品牌: %s, 褲子尺寸: %d\n", adidasPants.GetLogo(), adidasPants.GetSize())
}
```

### 程式碼解釋

1. **抽象產品 (`Shirt`, `Pants`)**: 定義了產品家族中各類產品的介面。
2. **具體產品 (`NikeShirt`, `NikePants`, `AdidasShirt`, `AdidasPants`)**: 實現了抽象產品介面，代表了不同品牌的具體產品。
3. **抽象工廠 (`SportsFactory`)**: 定義了一組創建產品的方法，`CreateShirt()` 和 `CreatePants()`。
4. **具體工廠 (`NikeFactory`, `AdidasFactory`)**: 實現了抽象工廠介面。`NikeFactory` 只創建 Nike 品牌的產品，而 `AdidasFactory` 只創建 Adidas 品牌的產品。
5. **客戶端 (`main`)**:
    - 首先選擇一個具體的工廠（例如 `NikeFactory`）。
    - 然後使用這個工廠來創建所需的所有產品（上衣和褲子）。
    - 客戶端不直接與 `NikeShirt` 或 `AdidasPants` 等具體產品耦合，只依賴於 `Shirt` 和 `Pants` 介面。
    - 這保證了從同一個工廠獲得的產品（`nikeShirt` 和 `nikePants`）必然屬於同一個家族（Nike）。如果想換成 Adidas，只需更換工廠即可。
