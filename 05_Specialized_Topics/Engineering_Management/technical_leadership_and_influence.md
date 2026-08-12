# Technical Leadership & Influence (技術領導力與影響力)

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Leadership`, `Soft Skills`, `RFC`, `Decision Making`

## 問題詳述

資深工程師往往需要在沒有正式管理職權 (Authority) 的情況下領導團隊。如何透過影響力 (Influence) 推動技術決策？什麼是 RFC (Request for Comments) 流程，它如何幫助達成共識？

## 核心理論與詳解

技術領導力 (Technical Leadership) 的核心在於「影響力而非職權」(Influence without Authority)。

### 1. 建立信任 (Building Trust)

信任是影響力的基石。建立信任的方式包括：

- **展現能力**: 在關鍵時刻解決困難的技術問題。
- **保持透明**: 誠實面對未知和錯誤，不隱瞞風險。
- **同理心**: 理解他人的痛點和目標，而不僅僅是推銷自己的技術方案。

### 2. RFC (Request for Comments) 流程

RFC 是推動重大技術決策的標準工具。

- **定義**: 一份詳細的技術提案文件，描述問題、解決方案、替代方案及權衡。
- **流程**:
  1. **草案 (Draft)**: 作者撰寫初稿，定義問題範疇。
  2. **徵求意見 (Review)**: 分享給相關人員 (Stakeholders) 進行非同步評論。
  3. **討論 (Discussion)**: 針對爭議點進行會議討論。
  4. **定案 (Finalize)**: 達成共識後，標記為 Approved 或 Rejected。
- **優點**: 留下決策紀錄 (Context)，避免反覆討論，促進非同步溝通。

### 3. 決策框架 (Decision Making Frameworks)

當團隊意見分歧時，Tech Lead 需要引導決策：

- **SPADE**: Setting (背景), People (人員), Alternatives (替代方案), Decide (決定), Explain (解釋)。
- **Disagree and Commit**: 充分討論後，即使有人不同意最終決定，也要全力支持執行，避免扯後腿。

### 4. 向上管理 (Managing Up)

- 確保技術目標與商業目標一致。
- 用非技術語言向管理層解釋技術債 (Technical Debt) 的風險和重構的價值。

## 程式碼範例

(此主題為軟實力，無程式碼範例)

## 學習與評量對應

- **Concept ID**: `concept.engineering-management.technical-leadership.influence-tradeoffs`
- **Learning Objectives**:
  - `LO-1`: 能把技術選項翻譯成商業結果、風險、時間、成本與可逆性的決策材料。
  - `LO-2`: 能在沒有正式職權時建立共識、處理異議、明確化 decision owner 並推動執行。
  - `LO-3`: 能以架構原則、可觀測證據、分階段 rollout 與 rollback 維持長期技術方向。
- **Prerequisites**: 系統設計、技術債、決策紀錄、利益相關者溝通與變更管理的基本概念。
- **Quick Quiz**: [Q4](../../QUIZ/21_Engineering_Management.md#q4-technical-leadership-and-influence)
- **Hard Assessment**: [AI／Engineering Management Delivery Incident](../../QUIZ/Hard_Assessments/ai_management_delivery_incident.md) (`assessment.ai-management.delivery-incident.v1`)
- **Assessment Gate**: 能把一次技術爭議寫成含選項、證據、決策 owner、分階段 rollout 與 rollback 條件的決策紀錄，再進入 Hard Assessment。
