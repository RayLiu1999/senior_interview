# Cross-Team Collaboration (跨團隊協作)

- **難度**: 6
- **標籤**: `Communication`, `Stakeholder Management`, `Negotiation`

## 問題詳述

如何有效地與產品經理 (PM)、設計師 (Designer) 和其他工程團隊協作？當需求不合理或時程過於緊迫時，該如何溝通與談判？

## 核心理論與詳解

資深工程師的價值不僅在於寫程式，更在於消除團隊間的摩擦，確保專案順利推進。

### 1. 利害關係人管理 (Stakeholder Management)

識別誰是專案的關鍵人物：

- **Sponsor**: 提供資源的人。
- **Customer**: 最終使用者。
- **Partner**: 依賴的上下游團隊。

針對不同對象調整溝通頻率與內容。

### 2. 與 PM 的協作

- **參與上游**: 在 PRD (Product Requirement Document) 定案前就參與討論，從技術角度提供可行性建議，避免承諾無法實現的功能。
- **數據說話**: 當拒絕某個需求時，用數據 (Data) 或工程成本 (Engineering Cost) 來支持你的論點，而不是憑感覺。

### 3. 跨團隊依賴 (Managing Dependencies)

當你的專案依賴於另一個團隊的 API 時：

- **儘早溝通**: 在開發初期就鎖定介面合約 (Interface Contract / API Spec)。
- **緩衝區 (Buffer)**: 在時程規劃中預留緩衝時間，以應對依賴團隊的延遲。
- **Mock Server**: 建立 Mock Server，讓前端或下游可以並行開發，不被阻塞。

### 4. 談判技巧 (Negotiation)

當面臨不可能的 Deadline 時：

- **不要直接說 No**: 說 "Yes, but..."。
- **提供選項**: 「我們可以在這個日期前上線，但只能包含 A 和 B 功能。如果要包含 C，需要延後兩週。」
- **鐵三角 (Iron Triangle)**: 範圍 (Scope)、時間 (Time)、資源 (Resources)。這三者是連動的，調整一個必須犧牲另一個。

## 程式碼範例

(此主題為軟實力，無程式碼範例)
