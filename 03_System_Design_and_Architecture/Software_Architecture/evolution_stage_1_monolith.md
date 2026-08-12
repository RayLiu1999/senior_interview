# 系統演進第一階段：單體架構 (Monolithic Architecture)

- **難度**: 4
- **重要程度**: 5
- **標籤**: `Architecture`, `Monolith`, `System Evolution`

## 問題詳述

所有偉大的系統通常都始於一個單體。請詳細說明單體架構的定義、優缺點，以及在什麼情況下我們應該堅持使用單體架構？

## 核心理論與詳解

### 1. 定義

單體架構 (Monolithic Architecture) 是指將應用程式的所有功能模組（如用戶管理、訂單處理、支付、庫存等）打包在一個單獨的部署單元（如一個 JAR 檔、一個 Binary 或一個 Docker Image）中運行。

- **資料庫**: 通常共享同一個關聯式資料庫 (RDBMS)。
- **通訊**: 模組之間通過記憶體內的函數呼叫 (Function Call) 進行通訊。

### 2. 優點 (為什麼要從單體開始？)

在專案初期，單體架構是**最優解**，因為它能最大化開發效率。

1. **開發簡單**: 所有的程式碼都在一個專案裡，IDE 可以輕鬆跳轉、重構。
2. **部署簡單**: 只需要部署一個檔案，不需要協調多個服務的部署順序。
3. **測試簡單**: 端對端測試 (E2E) 很容易撰寫，不需要 mock 外部服務。
4. **效能高**: 模組間通訊是記憶體級別的，沒有網路延遲 (Network Latency) 和序列化/反序列化 (Serialization) 的開銷。
5. **一致性強**: 使用單一資料庫，可以利用 ACID 事務 (Transaction) 輕鬆保證數據一致性。

### 3. 缺點 (為什麼要離開單體？)

隨著業務發展，單體架構會逐漸顯露出疲態：

1. **耦合度高 (Tight Coupling)**: 修改一個小功能可能導致整個系統崩潰，牽一髮動全身。
2. **擴展性受限**:
   - 只能進行**垂直擴展 (Vertical Scaling)**，即升級硬體（更強的 CPU、更多的 RAM），但硬體有物理極限且昂貴。
   - 無法針對特定模組擴展（例如：圖片處理模組很吃 CPU，但訂單模組只吃 IO，單體架構下只能整台機器一起擴展）。
3. **技術棧鎖定 (Tech Stack Lock-in)**: 很難在系統中引入新技術。例如，整個系統是用 Java 寫的，想用 Python 做 AI 分析就很困難。
4. **部署風險大**: 每次部署都是「大爆炸 (Big Bang)」式的，部署時間長，回滾慢。
5. **團隊協作困難**: 當開發人員超過 20-30 人，大家都在同一個 Codebase 上工作，代碼衝突 (Merge Conflicts) 會變得非常頻繁。

### 4. 決策點：何時該堅持？何時該放棄？

**堅持單體的情況**:

- **初創期 (Startup/MVP)**: 業務模式尚未驗證，快速迭代最重要。
- **團隊規模小**: < 10 人。
- **業務複雜度低**: 簡單的 CRUD 應用。
- **效能要求極高**: 無法容忍網路延遲（如高頻交易系統的核心撮合引擎）。

**放棄單體的信號**:

- **單機效能瓶頸**: 即使升級到最強的 AWS 實例，CPU/Memory 依然 100%。
- **開發效率下降**: 部署一次需要 30 分鐘，跑一次測試需要 1 小時。
- **團隊擴張**: 不同團隊互相踩腳，需要獨立發布功能。

### 5. 下一步：水平擴展

當單體架構遇到效能瓶頸（主要是單機資源不足）時，最直接、成本最低的方案不是拆分微服務，而是**水平擴展 (Horizontal Scaling)**。

## 學習與評量對應

- **Concept ID**: `concept.architecture.evolution.monolith-boundary`
- **Learning Objectives**:
  - `LO-1`: 能區分模組化單體、緊耦合單體與部署單體，說明單體在驗證階段的合理性。
  - `LO-2`: 能以資料邊界、團隊 ownership、發布風險、容量與故障域判斷何時先模組化或水平擴展。
  - `LO-3`: 能設計從單體逐步演進的可觀測、可回滾路徑，而不是直接把組織和資料問題搬到微服務。
- **Prerequisites**: 模組化、部署、容量規劃、水平擴展與 domain boundary 的基本概念。
- **Quick Quiz**: [Q27](../../QUIZ/17_Architecture_Patterns.md#q27)
- **Hard Assessment**: [Architecture Change Boundary Review](../../QUIZ/Hard_Assessments/architecture_change_boundary_review.md) (`assessment.architecture.change-boundary.review.v1`)
- **Assessment Gate**: 能以問題證據判斷維持單體、模組化或進入下一階段的條件，並提出安全演進順序後，再進入 Hard Assessment。
