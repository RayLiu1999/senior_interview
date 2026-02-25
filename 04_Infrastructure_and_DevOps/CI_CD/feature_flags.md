# 功能旗標 (Feature Flags) 與漸進式發布

- **難度**: 6
- **重要程度**: 4
- **標籤**: `CI/CD`, `Feature Flags`, `Progressive Delivery`, `A/B Testing`, `DevOps`

## 問題詳述

功能旗標（Feature Flags，又稱 Feature Toggles 或 Feature Switches）是一種軟體開發技術，允許在**不重新部署程式碼**的情況下，動態地開啟或關閉特定功能。它是實現漸進式發布（Progressive Delivery）、持續部署與低風險上線的核心工具。

## 核心理論與詳解

### 功能旗標解決的核心問題

傳統部署模式的痛點：**「部署（Deploy）= 發布（Release）」**，一旦部署到生產環境，所有用戶立即看到新功能，風險極高。

功能旗標解耦了這兩個概念：

```
傳統方式:  Deploy (部署) = Release (發布) → 全量風險
功能旗標:  Deploy (部署) ≠ Release (發布) → 可控風險

程式碼可以部署到生產，但功能仍然「隱藏」，由旗標控制可見範圍
```

### 功能旗標的四種主要類型

| 類型 | 存活時間 | 用途 | 範例 |
| :--- | :--- | :--- | :--- |
| **Release Toggle** | 短期（數天~週） | 隱藏未完成的功能，持續整合主幹分支 | 隱藏新版 Checkout 流程直到測試完成 |
| **Experiment Toggle** | 中期（週~月） | A/B 測試，收集資料後決定方向 | 對 50% 用戶顯示新 UI，比較轉換率 |
| **Ops Toggle** | 長期（月~年） | 運維緊急開關，故障時快速關閉 | 關閉推薦系統降低 DB 壓力 |
| **Permission Toggle** | 永久 | 按用戶等級/付費方案控制功能訪問 | 付費用戶才能使用匯出功能 |

### 漸進式發布（Canary Release + Feature Flags）

功能旗標與漸進式發布結合，可以實現精細的流量控制：

```
Phase 1: 對內部員工開放（灰度率 0%→內部）
    ↓ 確認無問題
Phase 2: 對 1% 用戶開放，監控錯誤率和業務指標
    ↓ 指標正常
Phase 3: 10% → 50% → 100%，每個階段觀察 24 小時
    ↓ 全量後
Phase 4: 移除舊程式碼路徑，清理功能旗標（技術債）
```

### 功能旗標的實作範例（Go）

**簡單的本地旗標：**

```go
// 不推薦用於生產：硬編碼旗標，需要重新部署才能修改
const newCheckoutEnabled = true

func HandleCheckout(userID string) {
    if newCheckoutEnabled {
        NewCheckoutFlow(userID)
    } else {
        LegacyCheckoutFlow(userID)
    }
}
```

**生產環境方案：動態旗標（從配置中心或旗標服務讀取）**

```go
// FeatureFlag 介面：抽象旗標的評估邏輯
type FeatureFlag interface {
    IsEnabled(userID string) bool
}

// RemoteFeatureFlag：從功能旗標服務動態讀取
type RemoteFeatureFlag struct {
    client  LaunchDarklyClient
    flagKey string
}

func (f *RemoteFeatureFlag) IsEnabled(userID string) bool {
    user := ldcontext.New(userID)
    // 向 LaunchDarkly 查詢此用戶是否開啟此旗標
    value, _ := f.client.BoolVariation(f.flagKey, user, false)
    return value
}

// 使用方式
func HandleCheckout(userID string, flag FeatureFlag) {
    if flag.IsEnabled(userID) {
        NewCheckoutFlow(userID)
    } else {
        LegacyCheckoutFlow(userID)
    }
}
```

**按用戶百分比灰度的簡易實現：**

```go
// 基於用戶 ID 的一致性雜湊，確保同一用戶始終進入相同組
func isInRolloutGroup(userID string, percentage int) bool {
    h := fnv.New32a()
    h.Write([]byte(userID))
    hash := h.Sum32()
    // 取模：0-99 之間的值，若小於 percentage 則進入實驗組
    return int(hash%100) < percentage
}

// 5% 用戶開啟新功能
if isInRolloutGroup(userID, 5) {
    NewFeature()
} else {
    OldFeature()
}
```

### 主流功能旗標平台比較

| 平台 | 特點 | 定價模式 |
| :--- | :--- | :--- |
| **LaunchDarkly** | 最成熟、功能最豐富，支援複雜規則和 A/B 測試 | SaaS 付費 |
| **Unleash** | 開源版本可自行托管，有商業版 | 開源 / 商業 |
| **Flagr（Etsy）** | 開源、輕量、Kubernetes 友好 | 開源 |
| **Feature flags in ConfigMap** | 最簡單的臨時方案，適合小型項目 | 免費（自行維護） |

### 功能旗標管理的最佳實踐

**1. 旗標命名規範**
使用清晰的命名 + 到期日，例如：`enable_new_checkout_2024Q3`，方便清理。

**2. 旗標清理（技術債管理）**
旗標是一種**技術債**，每個旗標都增加了程式碼路徑的複雜度。發布完成後，必須及時清理舊路徑：

```
Feature Flag 生命週期:
建立 → 灰度測試 → 全量發布 → 【必須清理：刪除旗標 + 舊程式碼】
如果忽略清理，程式碼中會積累大量「殭屍旗標」，增加維護成本
```

**3. 旗標優先於長期功能分支**
使用功能旗標代替長期功能分支（Long-Lived Branches），允許持續整合到 `main`，避免分支合併地獄（Merge Hell）。

**4. 監控旗標對指標的影響**
每次旗標狀態變更後，監控核心業務指標（錯誤率、延遲、轉換率），設定自動回滾條件。

### 與藍綠部署、金絲雀發布的比較

| 技術 | 作用層次 | 回滾速度 | 粒度 |
| :--- | :--- | :--- | :--- |
| **功能旗標** | 應用層（程式碼邏輯） | 秒級（修改旗標值） | 用戶/屬性級別 |
| **金絲雀發布** | 基礎設施層（流量分配） | 分鐘級（調整路由） | 請求/IP 級別 |
| **藍綠部署** | 基礎設施層（環境切換） | 分鐘級（切換 LB） | 全量切換 |
