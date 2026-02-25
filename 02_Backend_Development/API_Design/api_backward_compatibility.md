# API 向後相容策略 (API Backward Compatibility)

- **難度**: 6
- **重要程度**: 4
- **標籤**: `向後相容`, `Breaking Change`, `API演化`, `版本管理`, `Consumer-Driven`

## 問題詳述

API 在演化過程中必須保持**向後相容性（Backward Compatibility）**：新版本 API 的行為應與舊版本相容，既有客戶端無需修改即可繼續正常使用。如何在不破壞現有客戶端的前提下持續演化 API，是資深工程師必須掌握的核心設計能力。

## 核心理論與詳解

### 破壞性變更（Breaking Changes）的識別

**Breaking Change**：指任何會導致現有客戶端（Consumer）失效的 API 變更。常見類型：

**請求端（Request）**：
- ✅ 新增可選參數（向後相容）
- ❌ 移除或重命名現有參數（Breaking）
- ❌ 修改參數類型（如 `string` → `integer`）（Breaking）
- ❌ 新增**必填**參數（Breaking，舊客戶端不知道要發）

**回應端（Response）**：
- ✅ 新增字段（向後相容，若客戶端能忽略未知字段）
- ❌ 移除或重命名現有字段（Breaking）
- ❌ 修改字段類型或語義（Breaking）
- ❌ 修改錯誤碼的含義（Breaking）

**行為端**：
- ❌ 修改已有 HTTP Method 的語義
- ❌ 修改授權邏輯（之前免認證的端點加上認證）
- ❌ 修改分頁行為（改變默認排序）

---

### 向後相容的演化技巧

#### ① 只增不刪（Additive-Only Changes）

最安全的演化策略：**只新增，不修改，不刪除**。

- 新增字段：在 Response JSON 中新增字段（Good）
- 新增可選的請求參數（Good）
- 新增新的 API 端點（Good）
- **絕不刪除**現有字段（若要廢棄，先標記為 deprecated，等待足夠的過渡期後再移除）

#### ② 版本化（Versioning）

當 Breaking Change 不可避免時，通過版本隔離新舊 API：

```
/v1/users  →  舊版本，繼續維護至客戶端全部遷移
/v2/users  →  新版本，引入 Breaking Change
```

**版本管理策略詳見 `api_versioning_strategies.md`**。

#### ③ 字段值的向後相容

- **枚舉擴展**：若新增枚舉值，客戶端可能因不認識而崩潰 → 要求客戶端實現 **Tolerate Unknown Values** 原則：對不認識的枚舉值優雅降級，而非拋錯
- **nullable vs optional**：明確區分字段是否可為 null（避免 absent 和 null 語義混淆）

#### ④ 正面清單（Allowlist）vs 負面清單（Denylist）

在字段過濾、權限設計上，**正面清單更安全**：只允許名單內的字段，新增字段時需顯式加入清單。負面清單容易遺漏新字段的限制。

#### ⑤ 展開式設計（Expand Pattern）

當字段語義需要擴展時，用新字段替代舊字段而非修改：

```json
// 舊版（只有一個地址）
{ "address": "台北市..." }

// 新版（保留舊字段，新增結構化版本）
{
  "address": "台北市...",        // 保留，向後相容
  "address_detail": {            // 新增，更豐富的資訊
    "city": "台北市",
    "district": "信義區",
    "street": "市府路1號"
  }
}
```

---

### 廢棄（Deprecation）生命週期管理

當需要移除功能時，應遵循明確的廢棄流程：

1. **標記 Deprecated**：在文件和回應頭中標記（`Deprecation: true`、`Sunset: <date>` HTTP 頭）
2. **公告廢棄時間表**：提前通知（通常至少 6-12 個月，企業級 API 更長）
3. **監控使用情況**：追蹤哪些客戶端仍在使用廢棄的端點/字段
4. **提供遷移指引**：文件中提供新舊 API 對照和遷移範例
5. **正式移除**：確認無流量後才移除

```
Deprecation: true
Sunset: Mon, 01 Sep 2026 00:00:00 GMT
Link: <https://api.example.com/docs/migration>; rel="successor-version"
```

### Consumer-Driven Contract Testing（消費者驅動契約測試）

由 Pact 等框架實現的測試方法：
- **Provider（API 提供者）** 和 **Consumer（客戶端）** 之間定義契約（Contract）
- Consumer 的測試套件自動驗證 Provider 是否符合契約
- 每次 API 變更後，自動檢測是否有 Breaking Change 破壞現有 Consumer

這是避免意外引入 Breaking Change 的最可靠工程機制。
