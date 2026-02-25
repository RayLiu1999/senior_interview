# Project Management & Agile (專案管理與敏捷開發)

- **難度**: 5
- **標籤**: `Agile`, `Scrum`, `Kanban`, `Estimation`, `Project Management`

## 問題詳述

Scrum 和 Kanban 有什麼區別？如何進行準確的工時估算 (Estimation)？當需求不斷變更 (Scope Creep) 時該如何應對？

## 核心理論與詳解

專案管理的目標是在有限的資源 (時間、人力) 下，高品質地交付價值。

### 1. Scrum vs. Kanban

兩者都是敏捷開發的實踐框架，但適用場景不同。

- **Scrum**:
  - **結構**: 固定長度的 Sprint (通常 2 週)。
  - **角色**: Product Owner, Scrum Master, Team。
  - **儀式**: Planning, Daily Standup, Review, Retrospective。
  - **適用**: 產品開發，需求在 Sprint 期間相對穩定。
- **Kanban**:
  - **結構**: 連續流 (Continuous Flow)，無固定 Sprint。
  - **核心**: 限制在製品數量 (WIP Limit)，視覺化工作流。
  - **適用**: 維運團隊 (Ops)、客服、修復 Bug 等需求隨機且緊急的場景。

### 2. 估算 (Estimation)

估算的目的是為了規劃，而非承諾絕對的截止日期。

- **Story Points**: 使用相對大小 (如 Fibonacci 數列: 1, 2, 3, 5, 8) 而非絕對時間 (小時) 進行估算。這能消除因個人能力差異帶來的誤差。
- **Planning Poker**: 團隊成員同時出牌，避免錨定效應 (Anchoring Effect)，促進對任務複雜度的討論。

### 3. 範疇蔓延 (Scope Creep) 管理

當 PM 或業務方在開發中途插入新需求時：

- **交換原則**: 「我們可以加入這個新功能，但為了保持發布時間，必須移出另一個同等大小的功能。」
- **Icebox**: 將新想法放入 Icebox，承諾在下一個 Sprint 優先考慮，但不干擾當前 Sprint。
- **MVP 思維**: 專注於最小可行性產品 (Minimum Viable Product)，砍掉非核心功能。

### 4. 關鍵路徑 (Critical Path)

識別專案中相依性最強、決定最短完成時間的路徑。Tech Lead 需重點監控關鍵路徑上的任務，避免阻塞。

## 程式碼範例

(此主題為軟實力，無程式碼範例)
