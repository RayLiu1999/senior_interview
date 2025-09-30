# 身份驗證與授權 (Authentication vs. Authorization)

- **難度**: 5
- **重要性**: 5
- **標籤**: `Security`, `Authentication`, `Authorization`

## 問題詳述

請解釋身份驗證 (Authentication) 和授權 (Authorization) 的區別。它們在系統安全中各自扮演什麼角色？請舉例說明常見的身份驗證和授權機制。

## 核心理論與詳解

身份驗證 (Authentication) 和授權 (Authorization) 是資訊安全中兩個最基本但經常被混淆的概念。它們是存取控制 (Access Control) 的兩個核心環節,缺一不可。

---

### 核心區別

#### 身份驗證 (Authentication) - "你是誰？"

**定義**: 驗證使用者身份的過程,確認使用者聲稱的身份是否屬實。

**比喻**: 就像機場安檢時檢查你的護照,確認你就是護照上的那個人。

**目標**: 回答「這個人是誰?」

**常見方式**:
-   使用者名稱 + 密碼
-   多因素驗證 (MFA): 密碼 + 簡訊驗證碼 / OTP
-   生物識別: 指紋、人臉辨識
-   數位憑證 / SSH 金鑰
-   第三方 OAuth (如 Google 登入、Facebook 登入)

#### 授權 (Authorization) - "你能做什麼？"

**定義**: 確定已驗證的使用者可以存取哪些資源或執行哪些操作的過程。

**比喻**: 就像你進入公司後,你的員工證決定了你能進入哪些樓層、使用哪些設備。

**目標**: 回答「這個人有權限做什麼?」

**常見方式**:
-   角色型存取控制 (RBAC - Role-Based Access Control)
-   屬性型存取控制 (ABAC - Attribute-Based Access Control)
-   存取控制清單 (ACL - Access Control List)
-   權限位元 (Permission Bits,如 Unix 檔案權限)

---

### 兩者的關係

**執行順序**: 身份驗證 **永遠** 發生在授權之前。

```
使用者請求 → 身份驗證 (你是誰?) → 授權 (你能做什麼?) → 允許/拒絕存取
```

**範例場景 - 網路銀行**:

1.  **身份驗證**: 使用者輸入帳號密碼並通過簡訊驗證碼,系統確認「你是張三」。
2.  **授權**: 系統檢查張三的權限,發現他只能查看自己的帳戶 (帳號 123456),不能查看別人的帳戶。
3.  **結果**: 張三嘗試訪問 `/account/123456` → 允許;嘗試訪問 `/account/999999` → 拒絕 (403 Forbidden)。

---

### 常見的身份驗證機制

#### 1. 基於會話的驗證 (Session-Based Authentication)

**流程**:
1.  使用者提交帳號密碼。
2.  伺服器驗證成功後,在伺服器端建立一個會話 (Session),並生成一個 Session ID。
3.  Session ID 透過 Cookie 發送給客戶端。
4.  後續請求中,客戶端自動攜帶 Cookie (Session ID)。
5.  伺服器根據 Session ID 查找對應的會話資料,確認使用者身份。

**優點**: 簡單,伺服器端可以完全控制會話 (如即時撤銷)。
**缺點**: 需要在伺服器端儲存會話狀態,不利於水平擴展。

#### 2. 基於 Token 的驗證 (Token-Based Authentication)

**流程**:
1.  使用者提交帳號密碼。
2.  伺服器驗證成功後,生成一個加密的 Token (如 JWT)。
3.  Token 發送給客戶端,通常儲存在 LocalStorage 或 Cookie 中。
4.  後續請求中,客戶端在 HTTP 標頭中攜帶 Token (如 `Authorization: Bearer <token>`)。
5.  伺服器解密並驗證 Token,確認使用者身份。

**優點**: 無狀態 (Stateless),易於擴展,適合微服務架構。
**缺點**: Token 一旦簽發就難以撤銷 (除非維護黑名單)。

#### 3. 多因素驗證 (Multi-Factor Authentication, MFA)

結合兩種或以上的驗證因素:
-   **知識因素**: 使用者知道的東西 (密碼、PIN)
-   **持有因素**: 使用者擁有的東西 (手機、硬體 Token)
-   **生物因素**: 使用者本身的特徵 (指紋、人臉)

**範例**: 密碼 + 手機簡訊驗證碼

---

### 常見的授權機制

#### 1. 角色型存取控制 (RBAC - Role-Based Access Control)

**原理**: 將權限分配給角色,再將角色分配給使用者。

**範例**:
```
角色: Admin → 權限: [read, write, delete]
角色: User → 權限: [read, write]
角色: Guest → 權限: [read]

張三 → 角色: User → 可以 read, write
李四 → 角色: Admin → 可以 read, write, delete
```

**程式碼範例 (Go)**:
```go
func DeletePostHandler(w http.ResponseWriter, r *http.Request) {
    user := getCurrentUser(r) // 從會話或 Token 獲取使用者
    
    // 授權檢查
    if user.Role != "Admin" {
        http.Error(w, "Forbidden", http.StatusForbidden)
        return
    }
    
    // 執行刪除操作
}
```

#### 2. 屬性型存取控制 (ABAC - Attribute-Based Access Control)

**原理**: 基於使用者、資源和環境的屬性來做出授權決策,更靈活。

**範例**:
```
規則: 允許存取,如果:
  - user.department == "HR"
  - resource.type == "employee_record"
  - environment.time 在 09:00-18:00 之間
```

#### 3. 存取控制清單 (ACL - Access Control List)

**原理**: 為每個資源維護一份清單,列出哪些使用者或群組可以對該資源執行哪些操作。

**範例**: Unix 檔案權限
```
-rw-r--r--  1 alice  staff  1024  file.txt
擁有者 alice: 可讀寫
群組 staff: 可讀
其他人: 可讀
```

---

### 常見的授權錯誤 - 水平/垂直越權

#### 水平越權 (Horizontal Privilege Escalation)

使用者能夠存取其他**同級別**使用者的資源。

**脆弱的程式碼**:
```go
func GetUserProfile(w http.ResponseWriter, r *http.Request) {
    // 從 URL 獲取使用者 ID
    userID := r.URL.Query().Get("id")
    
    // 直接查詢,沒有驗證當前使用者是否有權限
    profile := db.GetProfile(userID)
    json.NewEncoder(w).Encode(profile)
}
```

**攻擊**: 使用者 A (ID=123) 可以透過修改 URL `?id=456` 來查看使用者 B 的資料。

**正確做法**:
```go
func GetUserProfile(w http.ResponseWriter, r *http.Request) {
    currentUser := getCurrentUser(r)
    requestedUserID := r.URL.Query().Get("id")
    
    // 驗證權限
    if currentUser.ID != requestedUserID && !currentUser.IsAdmin() {
        http.Error(w, "Forbidden", http.StatusForbidden)
        return
    }
    
    profile := db.GetProfile(requestedUserID)
    json.NewEncoder(w).Encode(profile)
}
```

#### 垂直越權 (Vertical Privilege Escalation)

普通使用者能夠執行只有管理員才能執行的操作。

**範例**: 普通使用者透過直接訪問管理員 API 端點來刪除其他使用者。

---

### 最佳實踐

1.  **身份驗證**:
    -   永遠使用 HTTPS 傳輸認證憑證。
    -   實施強密碼策略和帳號鎖定機制。
    -   對敏感操作要求 MFA。
    -   安全儲存密碼 (使用 bcrypt、Argon2 等)。

2.  **授權**:
    -   遵循**最小權限原則** (Principle of Least Privilege)。
    -   在每個需要權限的操作中進行授權檢查,不要依賴客戶端或 UI 隱藏。
    -   集中管理授權邏輯,避免散落在程式碼各處。
    -   定期審計權限配置。

---

### 結論

身份驗證和授權是系統安全的基石。**身份驗證** 確保我們知道使用者是誰,**授權** 確保使用者只能做他們被允許做的事。兩者必須同時正確實現,缺一不可。

作為資深後端工程師,不僅要理解各種驗證和授權機制的原理,更要能在系統設計中正確應用它們,並識別出常見的權限控制漏洞,如水平/垂直越權。記住:永遠在伺服器端進行驗證和授權,永遠不要信任客戶端。
