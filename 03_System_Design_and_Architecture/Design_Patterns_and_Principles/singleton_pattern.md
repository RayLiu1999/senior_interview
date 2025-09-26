# 什麼是單例模式 (Singleton Pattern)？請說明其優缺點並提供一個在 Go 中實現的範例

- **難度**: 4
- **重要程度**: 5
- **標籤**: `Design Pattern`, `Singleton`, `Go`

## 問題詳述

單例模式是最廣為人知的設計模式之一。請解釋單例模式的定義和意圖，分析其主要的優點和缺點，並使用 Go 語言展示如何實現一個線程安全的單例。

## 核心理論與詳解

單例模式是一種創建型設計模式，它確保一個類別 **只有一個實例**，並提供一個全域的訪問點來獲取這個唯一的實例。

其核心意圖是：

1. **保證唯一性**: 在應用程式的整個生命週期中，某個類別的物件只能存在一個。
2. **提供全域訪問**: 提供一個集中的、全域可用的方法來讓客戶端程式碼訪問這個實例，而無需在各處傳遞它。

這在需要一個物件來協調整個系統中的行為時非常有用，例如：資料庫連接池、日誌記錄器、應用程式配置管理器等。

### 優點

1. **保證唯一的實例**: 這是單例模式最主要的優點。對於那些本質上就是唯一的系統元件（如配置管理器），可以防止意外地創建出多個實例，從而避免狀態不一致或資源衝突。

2. **全域訪問點**: 提供了一個方便的、全域的訪問方式，簡化了客戶端程式碼，無需通過層層依賴注入來傳遞實例。

3. **延遲初始化 (Lazy Initialization)**: 可以在第一次被請求時才創建實例，而不是在程式啟動時就創建。這有助於節省資源，特別是當實例的創建成本很高，但又不一定會被使用時。

### 缺點

1. **違反單一職責原則 (Single Responsibility Principle)**:
   單例模式的類別不僅要承擔其核心的業務職責，還要負責管理自身的實例化邏輯（保證唯一性）。這將兩個不同的關注點耦合在了一起。

2. **隱藏依賴關係**:
   當程式碼通過全域訪問點 `GetInstance()` 來獲取單例時，它隱藏了模組之間的依賴關係。這使得程式碼的依E賴不夠明確，不像通過建構函式注入那樣清晰。

3. **對單元測試不友好**:
   由於單例的全域狀態和不可替代性，它很難被模擬 (Mock)。依賴於單例的程式碼難以進行隔離的單元測試。測試之間可能會因為共享同一個單例實例而互相影響。

4. **多線程環境下的複雜性**:
   在多線程環境下，為了保證線程安全地創建唯一實例，需要引入鎖或其他同步機制，這會增加實現的複雜性並可能影響效能。

5. **可能被濫用**:
   開發者可能會濫用單例模式來代替良好的依賴管理，將其用作一個方便的全域變數儲存桶，導致程式碼高度耦合和難以維護。

## 程式碼範例 (Go)

在 Go 中，實現線程安全的單例模式通常利用 `sync` 套件中的 `Once` 型別。`sync.Once` 是一個非常有用的工具，它可以保證某個函數在多個 goroutine 的呼叫下 **只執行一次**。

```go
package main

import (
    "fmt"
    "sync"
)

// DatabaseConnection 是一個我們想要設為單例的結構
type DatabaseConnection struct {
    connectionString string
}

// 執行一些資料庫操作
func (db *DatabaseConnection) Query(sql string) {
    fmt.Printf("Executing query '%s' with connection '%s'\n", sql, db.connectionString)
}

var (
    instance *DatabaseConnection
    once     sync.Once
)

// GetInstance 是獲取單例實例的全域方法
// 它保證了在多線程環境下，DatabaseConnection 的實例只會被創建一次。
func GetInstance(connectionString string) *DatabaseConnection {
    // sync.Once 的 Do 方法會接收一個函數作為參數。
    // 無論多少個 goroutine 同時呼叫 GetInstance，
    // Do 方法中的這個匿名函數只會被執行一次。
    once.Do(func() {
        fmt.Println("Creating DatabaseConnection instance now.")
        instance = &DatabaseConnection{connectionString: connectionString}
    })
    return instance
}

func main() {
    // 模擬多個 goroutine 同時嘗試獲取單例實例
    var wg sync.WaitGroup
    for i := 0; i < 10; i++ {
        wg.Add(1)
        go func(i int) {
            defer wg.Done()
            fmt.Printf("Goroutine %d: ", i)
            conn := GetInstance("user:password@tcp(127.0.0.1:3306)/mydb")
            conn.Query(fmt.Sprintf("SELECT * FROM users WHERE id = %d", i))
        }(i)
    }
    wg.Wait()

    fmt.Println("\n--- Verifying Singleton ---")
    // 驗證所有獲取的實例都是同一個
    conn1 := GetInstance("")
    conn2 := GetInstance("")

    if conn1 == conn2 {
        fmt.Println("conn1 and conn2 are the same instance.")
    } else {
        fmt.Println("conn1 and conn2 are different instances.")
    }
}
```

### 程式碼解釋

- 我們定義了一個全域變數 `instance` 來儲存唯一的 `DatabaseConnection` 實例。
- 我們還定義了一個全域的 `sync.Once` 變數 `once`。
- 在 `GetInstance` 函數中，我們使用 `once.Do()` 來包裹實例的創建邏輯。
- `once.Do()` 確保了即使在高併發的情況下，`instance = &DatabaseConnection{...}` 這行程式碼也只會被執行一次。
- 第一次呼叫 `GetInstance` 時，匿名函數會被執行，實例被創建。後續所有的呼叫 `GetInstance`，`once.Do()` 內部的函數都不會再執行，而是直接返回已經創建好的 `instance`。

這種使用 `sync.Once` 的方法是 Go 中實現單例模式最慣用、最簡潔且最高效的方式。
