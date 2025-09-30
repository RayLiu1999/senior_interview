# SQL Injection 攻擊與防禦

- **難度**: 6
- **重要性**: 5
- **標籤**: `Security`, `SQL Injection`, `Database`

## 問題詳述

什麼是 SQL Injection (SQL 注入) 攻擊？請解釋其攻擊原理、常見的攻擊手法,以及後端開發者應該如何有效地防禦這種攻擊。

## 核心理論與詳解

SQL Injection 是一種**注入攻擊**,攻擊者透過將惡意的 SQL 程式碼插入到應用程式的輸入欄位中,欺騙應用程式執行非預期的資料庫操作。它在 OWASP Top 10 中長期佔據前三名的位置,是最古老也是最危險的 Web 安全漏洞之一。

---

### SQL Injection 的攻擊原理

SQL Injection 的根本原因是:**將不受信任的使用者輸入直接拼接到 SQL 查詢語句中**,而沒有進行適當的驗證或轉義。

#### 脆弱的程式碼範例 (Go)

```go
// 危險！不要這樣寫
func GetUserByUsername(username string) (*User, error) {
    query := "SELECT * FROM users WHERE username = '" + username + "'"
    // 直接將使用者輸入拼接到 SQL 語句中
    row := db.QueryRow(query)
    // ...
}
```

**正常情況**:
-   使用者輸入: `john`
-   生成的 SQL: `SELECT * FROM users WHERE username = 'john'`
-   結果: 返回 john 的資料

**攻擊情況**:
-   攻擊者輸入: `admin' OR '1'='1`
-   生成的 SQL: `SELECT * FROM users WHERE username = 'admin' OR '1'='1'`
-   結果: `'1'='1'` 永遠為真,查詢返回**所有使用者**的資料

攻擊者透過精心構造的輸入,**改變了原本 SQL 語句的邏輯結構**,使其執行了開發者意圖之外的操作。

---

### 常見的 SQL Injection 攻擊手法

#### 1. 繞過身份驗證 (Authentication Bypass)

**脆弱的登入邏輯**:
```go
query := "SELECT * FROM users WHERE username = '" + username + 
         "' AND password = '" + password + "'"
```

**攻擊輸入**:
-   Username: `admin' --`
-   Password: (任意值)

**生成的 SQL**:
```sql
SELECT * FROM users WHERE username = 'admin' --' AND password = 'xxx'
```

`--` 是 SQL 的註解符號,它使得後面的 `AND password = 'xxx'` 被註解掉,攻擊者無需知道密碼就能以 admin 身份登入。

#### 2. 資料外洩 (Data Exfiltration)

**Union-based SQL Injection**:

攻擊者使用 `UNION` 關鍵字將惡意查詢的結果與原查詢結果合併。

**攻擊輸入**:
```
' UNION SELECT credit_card, cvv, expiry FROM payment_info --
```

**生成的 SQL**:
```sql
SELECT name, email FROM users WHERE id = '' 
UNION SELECT credit_card, cvv, expiry FROM payment_info --'
```

攻擊者可以從其他資料表中提取敏感資料。

#### 3. 破壞性攻擊 (Destructive Attacks)

**攻擊輸入**:
```
'; DROP TABLE users; --
```

**生成的 SQL**:
```sql
SELECT * FROM users WHERE username = ''; DROP TABLE users; --'
```

這會刪除整個 `users` 資料表,造成災難性的資料損失。

#### 4. Blind SQL Injection (盲注)

當應用程式不直接顯示資料庫錯誤或查詢結果時,攻擊者透過應用程式的行為差異 (如回應時間、頁面內容) 來逐步推斷資料庫資訊。

**Time-based Blind SQL Injection**:
```
' OR IF(1=1, SLEEP(5), 0) --
```

如果頁面延遲 5 秒才回應,說明注入成功。

---

### 如何防禦 SQL Injection

#### 1. 使用參數化查詢 (Prepared Statements) - **最重要**

這是防禦 SQL Injection 的**最有效**方法。參數化查詢將 SQL 指令和資料分離,使得使用者輸入永遠不會被解釋為 SQL 程式碼的一部分。

**安全的 Go 程式碼範例**:
```go
func GetUserByUsername(username string) (*User, error) {
    // 使用佔位符 $1
    query := "SELECT * FROM users WHERE username = $1"
    
    // 將使用者輸入作為參數傳遞,而不是拼接
    row := db.QueryRow(query, username)
    
    var user User
    err := row.Scan(&user.ID, &user.Username, &user.Email)
    if err != nil {
        return nil, err
    }
    return &user, nil
}
```

即使使用者輸入 `admin' OR '1'='1`,資料庫也會將整個字串視為**字面值**來搜尋,而不是 SQL 程式碼。

#### 2. 使用 ORM (Object-Relational Mapping)

現代的 ORM 框架 (如 GORM, SQLAlchemy, Hibernate) 預設會使用參數化查詢。

```go
// 使用 GORM
var user User
db.Where("username = ?", username).First(&user)
```

**注意**: ORM 不是萬能的。如果使用原生 SQL 查詢 (如 `db.Raw()`),仍需要小心處理。

#### 3. 輸入驗證與白名單

-   **驗證輸入格式**: 例如,如果某個欄位應該是數字,就確保它只包含數字。
-   **白名單機制**: 對於某些固定值 (如排序欄位 `ORDER BY`),使用白名單而不是直接接受使用者輸入。

```go
func GetUsersSorted(sortBy string) ([]User, error) {
    // 白名單驗證
    allowedSortFields := map[string]bool{
        "username": true,
        "email": true,
        "created_at": true,
    }
    
    if !allowedSortFields[sortBy] {
        return nil, errors.New("invalid sort field")
    }
    
    // 此時可以安全地拼接 (因為已經白名單驗證)
    query := fmt.Sprintf("SELECT * FROM users ORDER BY %s", sortBy)
    // ...
}
```

#### 4. 最小權限原則

資料庫帳號應該只擁有其工作所需的最小權限。應用程式的資料庫使用者不應該有 `DROP TABLE` 或 `CREATE USER` 等高危權限。

#### 5. 使用 WAF (Web Application Firewall)

WAF 可以檢測並阻擋常見的 SQL Injection 攻擊模式,作為額外的防護層。

#### 6. 錯誤訊息處理

不要在生產環境中向使用者顯示詳細的資料庫錯誤訊息 (如堆疊追蹤),這會洩露資料庫結構資訊給攻擊者。

---

### 結論

SQL Injection 雖然是一個古老的漏洞,但至今仍然普遍存在且危害巨大。防禦 SQL Injection 的核心原則非常簡單:**永遠不要將不受信任的資料直接拼接到 SQL 語句中**。使用參數化查詢或 ORM,並結合輸入驗證和最小權限原則,就能有效地阻止絕大多數 SQL Injection 攻擊。

作為資深後端工程師,不僅要能正確實現這些防禦措施,更要在程式碼審查中識別出潛在的 SQL Injection 漏洞,並教導團隊成員安全的編碼實踐。
