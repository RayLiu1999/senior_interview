# 什麼是工廠方法模式 (Factory Method Pattern)？它與簡單工廠有何不同？

- **難度**: 5
- **重要程度**: 4
- **標籤**: `Design Pattern`, `Factory Method`, `Go`

## 問題詳述

工廠方法模式是另一種常見的創建型設計模式。請解釋工廠方法模式的定義和意圖，並將其與簡單工廠（Simple Factory）進行比較，說明它們之間的主要區別。最後，請用 Go 語言提供一個工廠方法模式的實現範例。

## 核心理論與詳解

**工廠方法模式 (Factory Method Pattern)** 是一種創建型設計模式，它定義了一個用於創建物件的介面，但將實際的實例化延遲到子類別中。換句話說，父類別定義了創建物件的「方法框架」，而由子類別決定要創建哪一個具體的類別。

其核心意圖是：

- **定義一個創建物件的介面**: 父類別提供一個抽象的工廠方法。
- **讓子類別決定實例化哪一個類別**: 具體的實例化邏輯被封裝在不同的子類別工廠中。

這使得一個類別的實例化過程可以延遲到其子類別中進行，從而增加了系統的靈活性和可擴展性。

### 工廠方法模式 vs. 簡單工廠

這兩者很容易混淆，但它們在結構和意圖上有著本質的區別。

| 特性 | 簡單工廠 (Simple Factory) | 工廠方法模式 (Factory Method Pattern) |
| :--- | :--- | :--- |
| **本質** | 不是一個正式的設計模式，更像是一種程式設計習慣。 | 一個標準的、定義明確的創建型設計模式。 |
| **結構** | 通常是一個包含一個靜態方法的具體類別。這個方法根據傳入的參數來決定創建並返回哪種產品。 | 包含一個抽象的工廠介面（或父類別）和多個具體的工廠子類別。每個子類別只負責創建一種特定的產品。 |
| **職責** | **一個工廠類別負責創建所有類型的產品**。通常使用 `if/else` 或 `switch` 語句。 | **一個具體的工廠只創建一個具體的產品**。職責是分散的。 |
| **擴展性** | **較差**。每當需要增加一個新產品時，都必須 **修改** 現有的工廠類別的程式碼（在 `switch` 中增加一個 case），這違反了 **開閉原則 (Open-Closed Principle)**。 | **良好**。當需要增加一個新產品時，只需創建一個新的具體產品類別和一個對應的具體工廠類別即可，**無需修改** 現有的任何程式碼。這完全符合開閉原則。 |
| **抽象層級** | 較低，通常只有產品的抽象。 | 較高，不僅產品是抽象的，工廠本身也是抽象的。 |

**簡單來說**:

- **簡單工廠** 的問題在於它的工廠類別是萬能的，隨著產品增多，這個工廠會變得越來越臃腫，且每次新增產品都需要修改它。
- **工廠方法模式** 則是將創建產品的責任下放到各個子工廠，每個子工廠只關心自己的產品，從而實現了更好的解耦和擴展性。

## 程式碼範例 (Go)

讓我們用一個製作不同類型飲料的例子來演示工廠方法模式。

```go
package main

import "fmt"

// 1. 產品介面 (Product)
// 定義了所有飲料都必須有的方法
type Beverage interface {
    GetName() string
    GetSugarLevel() int
}

// 2. 具體產品 (Concrete Products)
// 具體的飲料實現

// Tea 結構
type Tea struct{}

func (t *Tea) GetName() string {
    return "紅茶"
}
func (t *Tea) GetSugarLevel() int {
    return 30
}

// Coffee 結構
type Coffee struct{}

func (c *Coffee) GetName() string {
    return "咖啡"
}
func (c *Coffee) GetSugarLevel() int {
    return 0
}

// 3. 工廠介面 (Creator)
// 定義了創建飲料的工廠方法
type BeverageFactory interface {
    CreateBeverage() Beverage
}

// 4. 具體工廠 (Concrete Creators)
// 每個工廠負責創建一種特定的飲料

// TeaFactory 結構
type TeaFactory struct{}

func (tf *TeaFactory) CreateBeverage() Beverage {
    return &Tea{}
}

// CoffeeFactory 結構
type CoffeeFactory struct{}

func (cf *CoffeeFactory) CreateBeverage() Beverage {
    return &Coffee{}
}

// getFactory 是一個輔助函數，根據需求返回對應的具體工廠
// 注意：這本身有點像一個簡單工廠，但在這裡它只是為了演示，
// 在實際應用中，具體工廠的選擇可能是在配置或依賴注入時決定的。
func getFactory(beverageType string) (BeverageFactory, error) {
    if beverageType == "tea" {
        return &TeaFactory{}, nil
    }
if beverageType == "coffee" {
        return &CoffeeFactory{}, nil
    }
    return nil, fmt.Errorf("不支援的飲料類型: %s", beverageType)
}

func main() {
    // 想要一杯茶
    teaFactory, _ := getFactory("tea")
    tea := teaFactory.CreateBeverage()
    fmt.Printf("飲料: %s, 糖度: %d%%\n", tea.GetName(), tea.GetSugarLevel())

    // 想要一杯咖啡
    coffeeFactory, _ := getFactory("coffee")
    coffee := coffeeFactory.CreateBeverage()
    fmt.Printf("飲料: %s, 糖度: %d%%\n", coffee.GetName(), coffee.GetSugarLevel())

    // 如果我們未來需要新增「果汁 (Juice)」，我們只需：
    // 1. 創建 Juice 結構 (具體產品)
    // 2. 創建 JuiceFactory 結構 (具體工廠)
    // 完全不需要修改現有的 Tea, Coffee, TeaFactory, CoffeeFactory 程式碼。
}
```

### 程式碼解釋

1. **`Beverage`** 是產品介面，定義了所有產品（飲料）的共同行為。
2. **`Tea`** 和 **`Coffee`** 是具體的產品類別，它們實現了 `Beverage` 介面。
3. **`BeverageFactory`** 是抽象的工廠介面，它定義了一個 `CreateBeverage` 方法，返回一個 `Beverage` 產品。
4. **`TeaFactory`** 和 **`CoffeeFactory`** 是具體的工廠類別。`TeaFactory` 只負責創建 `Tea`，而 `CoffeeFactory` 只負責創建 `Coffee`。
5. 客戶端程式碼（`main` 函數）首先決定需要哪種工廠，然後使用該工廠來創建對應的產品。它不直接與具體的產品類別（`Tea`, `Coffee`）耦合，而是與抽象的工廠和產品介面耦合。

這種結構完美地體現了工廠方法模式的核心思想：將物件的創建委託給專門的子工廠，從而實現系統的解耦和高擴展性。
