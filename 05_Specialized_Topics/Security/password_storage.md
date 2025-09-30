# 密碼儲存最佳實踐

- **難度**: 6
- **重要性**: 5
- **標籤**: `Security`, `Hashing`, `Encryption`

## 問題詳述

如何安全地儲存使用者密碼？請解釋雜湊 (Hashing) 和加密 (Encryption) 的區別,並說明為什麼不應該使用 MD5 或 SHA-1 來儲存密碼。什麼是加鹽 (Salting) 和加密工作因子 (Work Factor)？

## 核心理論與詳解

密碼儲存是資訊安全中最基本也最關鍵的問題之一。歷史上無數的資料洩露事件都源於密碼儲存不當,導致數百萬使用者的密碼被洩露。

**核心原則**: **永遠不要以明文儲存密碼**,也不要使用簡單的加密或弱雜湊演算法。

---

### 加密 vs. 雜湊

#### 加密 (Encryption) - 雙向轉換

-   **特性**: 可以被解密還原回原始資料。
-   **用途**: 保護需要被讀取的資料 (如通訊內容、檔案)。
-   **範例**: AES, RSA

```
明文密碼 --[加密]→ 密文 --[解密]→ 明文密碼
```

**為什麼不適合儲存密碼**: 如果加密金鑰洩露,所有密碼都會被解密。

#### 雜湊 (Hashing) - 單向轉換

-   **特性**: 不可逆,無法從雜湊值還原出原始資料。
-   **用途**: 驗證資料完整性、儲存密碼。
-   **範例**: bcrypt, Argon2, PBKDF2

```
明文密碼 --[雜湊]→ 雜湊值 (無法還原)
```

**密碼驗證流程**:
1.  使用者註冊時,將密碼雜湊後儲存到資料庫。
2.  使用者登入時,將輸入的密碼進行相同的雜湊運算。
3.  比較計算出的雜湊值與資料庫中的雜湊值是否一致。

**關鍵**: 伺服器**永遠不需要知道**使用者的原始密碼。

---

### 為什麼 MD5 和 SHA-1 不安全？

MD5 和 SHA-1 是**快速雜湊演算法**,它們的設計目標是快速計算,這恰恰是密碼儲存的敵人。

#### 1. 速度過快 = 易於暴力破解

現代 GPU 可以每秒計算數十億次 MD5/SHA-1 雜湊。攻擊者可以在極短時間內嘗試所有可能的密碼組合。

**範例**: 一個 8 字元的純小寫字母密碼,使用 MD5 只需幾小時就能被破解。

#### 2. 彩虹表攻擊 (Rainbow Table Attack)

攻擊者預先計算常見密碼的雜湊值並建立對照表,然後直接查表即可破解。

```
rainbow_table = {
    "5f4dcc3b5aa765d61d8327deb882cf99": "password",
    "e10adc3949ba59abbe56e057f20f883e": "123456",
    ...
}
```

如果資料庫洩露,攻擊者可以瞬間還原大量弱密碼。

#### 3. 碰撞攻擊 (Collision Attack)

MD5 和 SHA-1 已被證明存在碰撞漏洞,兩個不同的輸入可以產生相同的雜湊值,這削弱了其安全性。

---

### 安全密碼儲存的關鍵技術

#### 1. 加鹽 (Salting)

**問題**: 即使使用強雜湊演算法,相同的密碼會產生相同的雜湊值,攻擊者仍可使用彩虹表攻擊。

**解決方案**: 為每個使用者的密碼添加一個唯一的隨機字串 (Salt),然後再進行雜湊。

```
hash = bcrypt(password + salt)
```

**範例**:
```
使用者 A: 密碼 "password123" + Salt "xF3kL9" → 雜湊值 ABC...
使用者 B: 密碼 "password123" + Salt "mQ7pR2" → 雜湊值 XYZ...
```

即使兩個使用者的密碼相同,雜湊值也完全不同,彩虹表攻擊失效。

**實現要點**:
-   Salt 必須是**隨機生成**且**足夠長** (至少 16 bytes)。
-   每個使用者的 Salt **必須唯一**。
-   Salt 可以明文儲存在資料庫中 (與雜湊值一起)。

#### 2. 慢速雜湊 (Slow Hashing) / 工作因子 (Work Factor)

**原理**: 使用故意設計得「慢」的雜湊演算法,增加攻擊者的破解成本。

**演算法特性**:
-   **多次迭代**: 將雜湊函數重複執行數千次甚至數萬次。
-   **記憶體密集**: 需要大量記憶體,使得 GPU 和 ASIC 攻擊更困難。

**工作因子 (Cost Factor)**: 可調整的參數,決定雜湊的計算強度。

---

### 推薦的密碼雜湊演算法

#### 1. bcrypt (最廣泛使用)

**特點**:
-   自動包含 Salt。
-   可調整的工作因子 (cost factor)。
-   經過時間考驗,安全可靠。

**Go 程式碼範例**:
```go
import "golang.org/x/crypto/bcrypt"

// 註冊時:儲存密碼
func HashPassword(password string) (string, error) {
    // cost 為 10-12 是推薦值
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), 12)
    return string(bytes), err
}

// 登入時:驗證密碼
func CheckPassword(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}
```

**Cost Factor 建議**: 12-14 (每增加 1,計算時間翻倍)。

#### 2. Argon2 (最新標準,推薦)

**特點**:
-   2015 年 Password Hashing Competition 獲勝者。
-   抗 GPU、ASIC 和記憶體權衡攻擊。
-   有三種變體: Argon2d, Argon2i, Argon2id (推薦)。

**Go 程式碼範例**:
```go
import "golang.org/x/crypto/argon2"

func HashPasswordArgon2(password string) string {
    salt := make([]byte, 16)
    rand.Read(salt)
    
    // 參數: 記憶體 (64MB), 迭代次數 (3), 平行度 (2), 輸出長度 (32)
    hash := argon2.IDKey([]byte(password), salt, 3, 64*1024, 2, 32)
    
    // 將 salt 和 hash 一起編碼儲存
    return base64.StdEncoding.EncodeToString(salt) + "$" + 
           base64.StdEncoding.EncodeToString(hash)
}
```

#### 3. PBKDF2 (可接受,但不如前兩者)

**特點**:
-   NIST 推薦標準。
-   可調整迭代次數。
-   但比 bcrypt 和 Argon2 更容易受到 GPU 攻擊。

**建議迭代次數**: 至少 100,000 次 (對於 SHA-256)。

---

### 密碼儲存最佳實踐

1.  **使用 bcrypt 或 Argon2**: 優先選擇 Argon2id,次選 bcrypt。
2.  **設定適當的工作因子**:
    -   bcrypt: cost = 12-14
    -   Argon2: memory = 64MB, iterations = 3
    -   定期審查並調整,以適應硬體性能提升。
3.  **每個密碼使用唯一的 Salt**: Salt 至少 16 bytes。
4.  **實施密碼強度策略**:
    -   最小長度 (至少 12 字元)。
    -   要求大小寫、數字、特殊字元的組合。
    -   檢查密碼是否在常見密碼黑名單中。
5.  **使用 Pepper (可選,額外防護層)**:
    -   Pepper 是一個儲存在應用程式配置中 (不在資料庫中) 的全域密鑰。
    -   即使資料庫洩露,沒有 Pepper 攻擊者仍無法破解密碼。
    ```go
    hash = bcrypt(password + pepper + salt)
    ```
6.  **啟用多因素驗證 (MFA)**: 即使密碼被洩露,MFA 仍能保護帳號安全。
7.  **定期密碼輪換 (謹慎使用)**:
    -   強制密碼過期可能導致使用者使用更弱的密碼。
    -   只在有懷疑洩露時才強制重設。
8.  **使用速率限制和帳號鎖定**: 防止暴力破解攻擊。

---

### 錯誤示範 vs. 正確示範

**❌ 絕對不要這樣做**:
```go
// 明文儲存 - 災難!
password := "user_password"
db.Exec("INSERT INTO users (password) VALUES (?)", password)

// 使用 MD5 - 不安全!
hash := md5.Sum([]byte(password))

// 使用 SHA-256 但沒有 Salt - 容易受彩虹表攻擊
hash := sha256.Sum256([]byte(password))
```

**✅ 正確做法**:
```go
import "golang.org/x/crypto/bcrypt"

// 註冊
hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), 12)
db.Exec("INSERT INTO users (password) VALUES (?)", string(hashedPassword))

// 登入
var storedHash string
db.QueryRow("SELECT password FROM users WHERE username = ?", username).Scan(&storedHash)
if bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(inputPassword)) == nil {
    // 密碼正確
}
```

---

### 結論

密碼儲存是資訊安全的基石,絕對不容許任何妥協。使用現代的、經過驗證的慢速雜湊演算法 (bcrypt 或 Argon2),並結合 Salt、適當的工作因子和密碼強度策略,才能有效保護使用者的密碼。

作為資深後端工程師,必須深刻理解為什麼 MD5/SHA-1 不安全,以及如何正確實施密碼雜湊。在程式碼審查中,任何以明文或弱雜湊儲存密碼的程式碼都應該被立即拒絕。記住:使用者將他們的信任託付給我們,保護他們的密碼是我們不可推卸的責任。
