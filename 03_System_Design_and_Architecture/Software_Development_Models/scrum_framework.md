# Scrum 框架

- **難度**: 7
- **標籤**: `Scrum`, `Agile`, `Framework`, `Methodology`

## 問題詳述

什麼是 Scrum？它作為一個敏捷框架，包含哪些核心角色、事件和產出物？請描述一個典型的 Scrum Sprint 流程。

## 核心理論與詳解

Scrum 並不等同於敏捷，它是實現敏捷開發的一種最受歡迎的框架 (Framework)。Scrum 提供了一套輕量級的規則，定義了角色、事件和產出物，旨在幫助團隊以迭代和增量的方式開發、交付和維護複雜的產品。Scrum 的核心是 **Sprint**，一個時間固定（通常為 1-4 週）的短週期迭代，團隊在每個 Sprint 中都會創造出一個「完成」、可用且有潛在交付價值的產品增量。

Scrum 基於經驗主義 (Empiricism)，強調知識來自於經驗，決策基於已知的事實。它透過三個支柱來實現經驗主義：

1.  **透明性 (Transparency)**: 工作過程和產出物對所有相關人員（包括客戶和團隊）都是可見的。大家對「完成」有共同的定義。
2.  **檢視 (Inspection)**: 團隊必須頻繁地檢視 Scrum 產出物和 Sprint 目標的進展，以便及早發現不必要的差異。
3.  **調適 (Adaptation)**: 當檢視發現流程或產品偏離了可接受的範圍時，必須盡快進行調整，以最小化未來的偏差。

### Scrum 的核心元素 (3-5-3)

Scrum 可以被概括為 3 個角色、5 個事件和 3 個產出物。

#### 3 個角色 (Roles)

1.  **產品負責人 (Product Owner, PO)**:
    -   **職責**: 對產品的價值負最終責任。負責管理和優化**產品待辦清單 (Product Backlog)**，確保其清晰、透明，並明確排序，以指導開發團隊的工作方向。
    -   **定位**: 他是產品的「價值最大化者」，代表所有利益相關者的聲音。

2.  **開發團隊 (Development Team)**:
    -   **職責**: 在每個 Sprint 中交付一個「完成」的、有潛在交付價值的產品增量。他們是自我組織的，決定如何將產品待辦清單中的項目轉化為產品功能。
    -   **特點**: 跨職能團隊，包含開發、測試、設計等所有需要的技能。團隊規模建議為 3-9 人。

3.  **Scrum Master**:
    -   **職責**: 確保 Scrum 框架被正確理解和實施。他是一位服務型領導 (Servant-Leader)，幫助團隊移除障礙、引導 Scrum 事件，並保護團隊不受外界干擾。
    -   **定位**: 他是 Scrum 的教練和守護者，服務於產品負責人、開發團隊和整個組織。

#### 5 個事件 (Events)

所有事件都是有時間盒 (Time-boxed) 的，意味著它們有最大時長限制。

1.  **Sprint**:
    -   Scrum 的核心，一個長度不超過一個月的時間盒，期間會創造出「完成」的產品增量。一個新的 Sprint 在前一個 Sprint 結束後立即開始。

2.  **Sprint 規劃會議 (Sprint Planning)**:
    -   **時機**: 每個 Sprint 的開始。
    -   **目標**: 規劃本次 Sprint 要完成的工作。會議包含兩個主題：**做什麼？**（由產品負責人闡述 Sprint 目標，團隊選擇要完成的產品待辦項）和 **如何做？**（開發團隊規劃如何將選定的項目轉化為產品增量）。
    -   **產出**: **Sprint 目標 (Sprint Goal)** 和 **Sprint 待辦清單 (Sprint Backlog)**。

3.  **每日站立會議 (Daily Scrum)**:
    -   **時機**: 每天一次，固定時間和地點，時長不超過 15 分鐘。
    -   **目標**: 開發團隊同步進度，並規劃接下來 24 小時的工作。這是一個為開發團隊服務的會議，而不是向管理者匯報。常見的三個問題是：「我昨天完成了什麼？」、「我今天打算做什麼？」、「我遇到了哪些障礙？」。
    -   **目的**: 檢視朝向 Sprint 目標的進展，並快速調整。

4.  **Sprint 檢視會議 (Sprint Review)**:
    -   **時機**: 每個 Sprint 的結束時。
    -   **目標**: 開發團隊向產品負責人和利益相關者展示本次 Sprint 完成的產品增量，並收集回饋。這是一個非正式的會議，重點是協作和產品的演進。
    -   **產出**: 經過修訂的產品待辦清單，為下一個 Sprint 規劃提供輸入。

5.  **Sprint 回顧會議 (Sprint Retrospective)**:
    -   **時機**: 在 Sprint 檢視會議之後，下一個 Sprint 開始之前。
    -   **目標**: 團隊反思上一個 Sprint 在人員、關係、流程和工具方面做得好的地方和可以改進的地方，並為下一個 Sprint 制定一個具體的改進計畫。
    -   **目的**: 持續改進團隊的協作方式和效率。

#### 3 個產出物 (Artifacts)

1.  **產品待辦清單 (Product Backlog)**:
    -   一個按優先級排序的需求列表，包含了對產品的所有期望功能、特性、修復和改進。它是一個動態的、持續演進的文件，由產品負責人全權管理。

2.  **Sprint 待辦清單 (Sprint Backlog)**:
    -   由 Sprint 規劃會議上選定的產品待辦項，以及將這些項目轉化為「完成」的產品增量所需的交付計畫組成。它由開發團隊擁有和管理。

3.  **產品增量 (Increment)**:
    -   一個 Sprint 中完成的所有產品待辦項的總和，以及之前所有 Sprint 產生的增量的價值。每個 Sprint 結束時，新的增量必須是「完成」的，意味著它處於可用狀態並滿足團隊共同定義的「完成的定義 (Definition of Done, DoD)」。

## 程式碼範例 (可選)

```go
// Scrum 是一個管理框架，無法用程式碼表示。
// 以下的註解旨在模擬一個 Sprint 的流程。

package main

import "fmt"

// 模擬一個使用者故事
type UserStory struct {
    ID          int
    Description string
    Priority    int
    IsDone      bool
}

// 模擬 Product Backlog
var productBacklog = []UserStory{
    {1, "作為用戶，我想要註冊帳號", 1, false},
    {2, "作為用戶，我想要登入系統", 1, false},
    {3, "作為用戶，我想要瀏覽商品列表", 2, false},
    {4, "作為用戶，我想要將商品加入購物車", 2, false},
}

func main() {
    fmt.Println("--- Sprint 1 開始 ---")

    // Sprint Planning: 選擇故事 1 和 2 進入 Sprint Backlog
    sprintBacklog := []UserStory{productBacklog[0], productBacklog[1]}
    fmt.Println("Sprint Planning 完成，目標：完成用戶認證功能。")
    fmt.Printf("Sprint Backlog: %v\n\n", sprintBacklog)

    // Daily Scrum (模擬幾天的工作)
    fmt.Println("Day 1: Daily Scrum - 開始開發註冊功能...")
    fmt.Println("Day 2: Daily Scrum - 註冊功能完成，開始開發登入功能...")
    fmt.Println("Day 3: Daily Scrum - 登入功能遇到障礙，需要協助...")
    fmt.Println("Day 5: Daily Scrum - 所有功能開發和測試完成！\n")

    // 開發完成，更新故事狀態
    sprintBacklog[0].IsDone = true
    sprintBacklog[1].IsDone = true

    // Sprint Review: 展示成果
    fmt.Println("Sprint Review: 向 PO 展示已完成的註冊和登入功能。")
    increment := []UserStory{}
    for _, story := range sprintBacklog {
        if story.IsDone {
            increment = append(increment, story)
        }
    }
    fmt.Printf("本次交付的產品增量: %v\n\n", increment)

    // Sprint Retrospective: 團隊反思
    fmt.Println("Sprint Retrospective: 團隊討論了如何更好地處理開發障礙，決定引入結對編程。")

    fmt.Println("\n--- Sprint 1 結束 ---")
}
```
