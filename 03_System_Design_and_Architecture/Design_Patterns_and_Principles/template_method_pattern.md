# 什麼是模板方法模式 (Template Method Pattern)？

- **難度**: 5
- **重要程度**: 4
- **標籤**: `Design Pattern`, `Template Method`, `Behavioral`

## 問題詳述

模板方法模式是一種行為型設計模式，它在一個父類（或介面）中定義一個演算法的**骨架**（固定的執行步驟），將某些步驟的具體實現**延遲**到子類（或實作方）中，從而讓子類可以在不改變整體演算法結構的前提下，重新定義演算法的特定步驟。

## 核心理論與詳解

### 設計動機

當多個類別有相似的演算法流程，只有部分步驟不同時，若各自獨立實現，容易造成程式碼重複（Code Duplication）。模板方法模式通過「固定骨架、開放細節」來解決這個問題。

**典型場景**：資料採集器（Data Miner）流程
```
Step 1: 連接資料來源（CSV / Database / PDF —— 各不相同）
Step 2: 解析資料           （各不相同）
Step 3: 分析資料           （通用邏輯，相同）
Step 4: 輸出報告           （通用邏輯，相同）
```
Step 3 和 Step 4 是固定的，Step 1 和 Step 2 因資料來源不同而不同。

### Go 中的實現：用組合替代繼承

Go 沒有傳統 OOP 的類別繼承。在 Go 中，模板方法模式通過**介面 + 高階函數**或**struct embedding（嵌入）**來實現。

**方式一：介面 + 模板函數（Go 慣用法）**

```go
// 定義步驟介面：只需實現「可變」的步驟
type DataProcessor interface {
    Connect() error        // 可變步驟
    ParseData() ([]string, error) // 可變步驟
}

// 模板函數：定義固定的演算法骨架
func ProcessData(processor DataProcessor) error {
    // Step 1: 可變步驟
    if err := processor.Connect(); err != nil {
        return fmt.Errorf("connect failed: %w", err)
    }

    // Step 2: 可變步驟
    data, err := processor.ParseData()
    if err != nil {
        return fmt.Errorf("parse failed: %w", err)
    }

    // Step 3 & 4: 固定步驟（通用邏輯）
    analyzeData(data)
    generateReport(data)
    return nil
}

// CSV 實現
type CSVProcessor struct{ filePath string }
func (p *CSVProcessor) Connect() error              { /* 打開 CSV 文件 */ return nil }
func (p *CSVProcessor) ParseData() ([]string, error) { /* 解析 CSV */ return nil, nil }

// Database 實現
type DBProcessor struct{ dsn string }
func (p *DBProcessor) Connect() error              { /* 建立 DB 連接 */ return nil }
func (p *DBProcessor) ParseData() ([]string, error) { /* 執行 SQL 查詢 */ return nil, nil }

// 使用：
ProcessData(&CSVProcessor{filePath: "data.csv"})
ProcessData(&DBProcessor{dsn: "postgres://..."})
```

**方式二：Hook Method 的概念（鉤子方法）**

模板方法中可以定義「鉤子（Hook）」——有預設實作的可選步驟。子類可以選擇覆寫，也可以不覆寫：

```go
type ReportGenerator interface {
    FetchData() []Record
    FormatData(data []Record) string
    shouldSendEmail() bool // Hook：預設為 false，子類可以 override
}

// 提供 Hook 預設值的 Base 實現
type BaseGenerator struct{}
func (b *BaseGenerator) shouldSendEmail() bool { return false } // 預設不寄送

// 具體實作覆寫 Hook
type SalesGenerator struct{ BaseGenerator }
func (s *SalesGenerator) shouldSendEmail() bool { return true } // 業務需要改為 true
```

### HTTP Middleware Pipeline 的類比

Go 的 HTTP middleware 鏈是模板方法思想的典型應用：

```
Request → [Auth Middleware] → [Logging Middleware] → [Handler] → Response
```

`http.HandlerFunc` 定義了「處理請求」的骨架，各個 Middleware 就是可插拔的步驟實現。`gin.Engine.Use()` 讓你在固定的請求處理流程中插入自訂邏輯，不改變整體框架流程。

### 鉤子方法 vs 抽象方法

| 種類 | 說明 | Go 對應 |
| :--- | :--- | :--- |
| **抽象方法（必須實現）** | 演算法骨架的可變步驟，子類**必須**覆寫 | 介面方法 (Interface method) |
| **鉤子方法（可選覆寫）** | 預設空實作或預設值，子類**選擇性**覆寫 | struct 嵌入 + 可覆寫方法 |
| **具體方法（固定邏輯）** | 骨架中的不變步驟，子類**不應**覆寫 | 套件級函數 (package-level function) |

### 實際應用場景

- **測試框架的 Setup/Teardown**：`TestMain(m *testing.M)` 提供 `m.Run()` 固定骨架，Before/After 步驟可自訂
- **ORM 的事務管理**：`db.Transaction(func(tx *gorm.DB) error { ... })` 固定了「開始→執行→提交/回滾」的骨架
- **報表生成**：固定「取資料 → 格式化 → 輸出」流程，各步驟可換不同實現
- **CI/CD Pipeline**：固定「Build → Test → Deploy」階段，每個 Stage 的具體指令可替換

### 優缺點分析

**優點：**
- 消除重複程式碼，公共步驟只在一處定義
- 控制框架擴展點，使用者只能在預期的地方擴展
- 符合好萊塢原則：「Don't call us, we'll call you」（框架呼叫你的實現）

**缺點：**
- 演算法骨架越固定，擴展靈活性越低
- 在 Go 中需要介面 + struct 的配合，比傳統 OOP 稍複雜
- 如果步驟太多，介面定義會變得龐大
