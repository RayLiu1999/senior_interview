# 測驗架構全面盤點與執行規劃書

- **盤點基準日**: 2026-08-12
- **適用範圍**: `01_Computer_Science_Fundamentals` 至 `06_Frontend_Development`、`QUIZ/`
- **文件狀態**: 執行紀錄版（Phase 0–5 已完成；全庫進入持續維護）
- **相關規格**: [硬測驗規格](./ASSESSMENT_SPEC.md)

## 一、決策摘要

本專案採用「文章建立理解、Quick Quiz 檢查回憶、Hard Assessment 驗證應用」的三層架構。

1. **概念文章是知識來源**：`Concept ID`、`Learning Objectives`、前置概念與重要程度以文章為準。
2. **Quick Quiz 是快速複習層**：適合定義、比較、口頭回答與範圍檢查，不承擔正式通過判定。
3. **Hard Assessment 是能力驗證層**：要求讀者在限制、故障或取捨下推理，使用 0–4 分規準，預設 3 分通過。
4. **修改不採雙份重寫**：先更新文章與 Learning Objectives，再依影響範圍決定是否更新 Quick Quiz、Hard Assessment 或兩者。
5. **最終目標是學習目標覆蓋，不是檔案數量相等**：一篇文章可包含多個概念；一份 Hard Assessment 也可以覆蓋一組高度相關的學習目標。

## 二、現況盤點

### 2.1 內容規模

目前共有 553 篇主題文章，分布如下：

| 分類 | 文章數 | 優先方向 |
| :--- | ---: | :--- |
| 電腦科學基礎 | 74 | 網路、作業系統、資料結構等核心原理 |
| 後端開發 | 313 | 第一優先，涵蓋 API、資料庫、快取、訊息佇列與語言框架 |
| 系統設計與架構 | 67 | 第一優先，連結 senior-level 系統推理 |
| 基礎設施與 DevOps | 57 | 第二優先，涵蓋 Docker、Kubernetes、可觀測性與雲端 |
| 特定領域 | 32 | 依重要程度與職涯方向分批處理 |
| 前端開發 | 10 | 後端主線完成後再處理 |
| **合計** | **553** | |

內容範圍目前有 732 個 Markdown 檔案（不含 `.github/` 專案指示），包含 553 篇主題文章、97 個 README 索引頁、28 份分類 Quick Quiz、1 份規格、1 份路線圖與 52 份 Hard Assessment。另有 Go validator 與 GitHub Actions workflow 負責持續檢查。

### 2.2 文章 metadata 與可讀性

| 項目 | 現況 | 判定 |
| :--- | ---: | :--- |
| 難度 metadata | 553 / 553 | 已完整 |
| 標籤 metadata | 553 / 553 | 已完整 |
| 重要程度 metadata | 553 / 553 | 已完整，可用於排序遷移 |
| 重要程度 5 | 304 | 第一批優先 |
| 重要程度 4 | 220 | 第一批優先 |
| 重要程度 3 | 29 | 已完成補齊，與 4–5 級採同一套治理 |
| 文章含 `Concept ID`、Learning Objectives 與測驗對應 | 553 / 553 | 全數文章均已納入 Concept／Quick Quiz／Hard Assessment 治理 |

文章長度分布如下：少於 100 行 122 篇、100–199 行 145 篇、200–399 行 84 篇、400 行以上 202 篇。長文不必全部重寫，但在建立測驗前應先拆出 3–6 個可觀察的 Learning Objectives，避免一題測試整篇文章。

### 2.3 Quick Quiz 現況

- 28 份分類 Quiz，共 567 題。
- 其中 2 題仍明確標記 `Article mapping: pending`，原因是來源文章尚未建立；其餘題目沿用分類檔集中管理，入口與文章連結由 CI 持續檢查。
- 每一道 Quiz 題都已有 `Concept ID` 與 Learning Objective ID，可用於判斷文章變更的影響範圍。
- 現有格式以「問題 → 答案提示 → 完整文章」為主，適合保留，不需要改造成 Hard Assessment。

### 2.4 Hard Assessment 現況

目前有 52 份跨領域／核心後端／延伸 Assessment，完整檔名與入口集中在 [Hard Assessments README](./Hard_Assessments/README.md)。本輪 Phase 3 已完成下列覆蓋群組：

| 覆蓋群組 | 主要範圍 | 狀態 |
| :--- | :--- | :--- |
| 核心後端 | TCP、資料庫、快取、API、Kafka、Saga、RAG | 已完成雙向映射 |
| 基礎設施與交付 | Kubernetes、Docker、CI/CD、Cloud、Observability | 已完成雙向映射 |
| 架構與系統設計 | Design Patterns、大型系統、DDD／Microservice、分散式韌性 | 已完成雙向映射 |
| 語言與框架 | Java、.NET、C#、Go、Python、PHP、Node.js、NestJS、Echo | 已完成雙向映射 |
| AI、Testing、Security、Frontend | LLM／Vector、AI Engineering、Testing、Security Testing、React／Vue | 已完成雙向映射 |
| CS Runtime 補齊 | 資料結構、Networking、Operating System | 已完成雙向映射 |
| 重要程度 3 補齊 | OS、資料庫、Kafka、Go／Node／PHP／Python tooling、分散式、DDD、交付管理與 Testing | 已完成 3 份 Completion Incident、29 篇雙向映射 |

所有 52 題都具備 Assessment ID、主要／次要 Concept ID、情境、作答要求、期待證據或等價的舊版區塊、0–4 評分規準、通過門檻與參考答案。validator 同時容許舊 assessment 使用 `LO-*` 局部 ID，以及新 assessment 使用 `concept.../LO-*` 穩定 ID；對新格式會檢查 LO 是否由對應文章承載。

### 2.5 連結健康度

排除 fenced code 內的示例連結後，Go validator 目前檢查 3,517 個本地 Markdown 路徑：

| 來源 | 失效數 | 判定 |
| :--- | ---: | :--- |
| README、Quick Quiz、主題文章與 Assessment | 0 | 路徑均存在；validator 會忽略 fenced code |
| **合計** | **0** | |

目前全庫本地路徑已通過檢查；後續新增或修改文章、Quiz、Assessment 時仍須維持這個門檻。對於 `QUIZ/README.md` 中尚未存在的分類 Quiz，必須選擇建立檔案或移除索引項目，不能保留死連結。

## 三、目標架構

### 3.1 單一概念的標準關係

```text
Concept
├── Article
│   ├── Concept ID
│   ├── Learning Objectives
│   ├── Prerequisites
│   └── Importance / Difficulty / Tags
├── Quick Quiz Items
└── Hard Assessment Items
    ├── Concept Check
    ├── Trace / Diagnosis
    ├── Scenario / Trade-off
    └── Implementation / System Design
```

單一概念的學習順序固定為：

```text
主題文章 → Quick Quiz → Hard Assessment → 依失分點回讀 → 重測
```

分類 README、`QUIZ/README.md` 與 `Hard_Assessments/README.md` 只負責定位，不是每次學習的必要內容。

### 3.2 文章作為來源資料

每篇納入測驗治理的文章應逐步補上以下區塊：

```markdown
### 測驗對應

- **Concept ID**: `concept.<domain>.<topic>.<concept>`
- **Learning Objectives**:
  - `LO-1`: 能夠……
  - `LO-2`: 能夠……
  - `LO-3`: 能夠……
- **Prerequisites**: [前置概念文章](path)
- **Quick Quiz**: [題目](../../QUIZ/....md)
- **Hard Assessment**: [硬測驗](../../QUIZ/Hard_Assessments/....md)
- **Assessment Gate**: 0–4 分，預設至少 3 分
```

`LO-1` 等目標 ID 可以先在 Concept 內局部使用；若未來需要跨文章追蹤，再升級為穩定的 `objective.<concept>.<number>` 格式。不要把完整理論複製到測驗檔，測驗只保留題目、期待證據、評分與必要的參考答案。

### 3.3 Quiz 題目的對應方式

既有 Quiz 仍可集中在分類檔，但每一題需要有可追蹤的概念對應。初期可以使用不影響閱讀的 Markdown 註解：

```markdown
### Q3: 解釋 ACID 特性和隔離級別

<!-- Concept ID: concept.database.transaction.isolation -->
<!-- Learning Objectives: LO-1, LO-2 -->
```

這樣可以保留 Quick Quiz 的閱讀體驗，又能讓檢查工具找到受影響的題目。

### 3.4 Hard Assessment 的最低標準

每一份 Hard Assessment 必須明確包含：

- Assessment ID 與版本
- 主要 Concept ID 與 Learning Objective IDs
- 對應文章與前置概念
- 題型、難度、重要程度、作答時間
- 測驗目標
- 問題情境與限制條件
- 作答要求與期待證據
- 0–4 分評分規準與通過門檻
- 參考答案、常見失分點、延伸追問

「硬」的來源是限制條件、故障情境、證據要求與 trade-off，不是堆疊冷門名詞。

## 四、修改與維護規則

### 4.1 來源優先順序

```text
文章與 Learning Objectives
        ↓
Quick Quiz / Hard Assessment
        ↓
索引頁與覆蓋率報告
```

若文章、Quiz 與 Hard Assessment 的解釋衝突，以最新確認過的文章與 Learning Objectives 為起點，修正兩種測驗，不讓測驗檔變成另一份未同步的知識庫。

### 4.2 變更影響矩陣

| 變更類型 | 主題文章 | Quick Quiz | Hard Assessment | 版本處理 |
| :--- | :---: | :---: | :---: | :--- |
| 只改善文字清晰度，不改語意 | 必改 | 檢查 | 檢查 | 不升版 |
| 核心定義、機制或行為改變 | 必改 | 通常改 | 通常改 | Assessment 可能升版 |
| 新增細節，但不影響既有目標 | 必改 | 通常不用 | 通常不用 | 不升版 |
| 新增快速回憶角度 | 視需要 | 改 | 不一定 | 不升版 |
| 新增事故情境、指標或 trade-off | 視需要 | 不一定 | 改 | 通常升版 |
| 評分門檻或期待證據改變 | 視需要 | 不一定 | 必改 | 必須升版 |
| 檔名、概念拆分或合併 | 必改 | 必須檢查 | 必須檢查 | 保留舊 ID 對應或明確遷移 |
| 只修正連結或排版 | 改連結檔 | 視影響 | 視影響 | 不升版 |

重點是「核心概念變更時兩邊都要檢查」，不是「每次都把兩份答案重寫一次」。

## 五、分階段執行計畫

### Phase 0：固定規格與四題試點（P0）— 已完成

**目標**：讓四題試點成為可複製的正式模板。

工作項目：

1. 補齊四題明確的 `測驗目標`、`作答要求` 與 Learning Objective IDs。
2. 統一 Assessment metadata、標題、版本、通過門檻與答案區塊。
3. 確認四篇文章的 Concept ID、Learning Objectives、文章連結與 Assessment 連結。
4. 為 TCP 補上 Quick Quiz 對應，或在索引中明確標示尚未建立，不能留下死連結。

完成條件：四題通過規格欄位檢查、ID 唯一、文章與測驗雙向連結有效，且能作為後續批次的範本。

### Phase 1：修復基礎資料與導航（P0）— 已完成

**目標**：先讓索引、metadata 與連結可信，避免在錯誤入口上建立測驗映射。

工作項目：

1. 補齊並校準全數 553 篇文章的「重要程度」。
2. 修復 README 索引失效連結，並移除或補齊不存在的分類入口。
3. 修復 Quick Quiz 與主題文章中的失效連結。
4. **以上均已完成**；目前全庫本地 Markdown 連結與題目錨點為有效狀態。

完成條件：新修改檔案的本地 Markdown 連結全數有效；重要程度覆蓋率達 100%；不再新增死連結。

### Phase 2：建立概念索引與 Quick Quiz 對應（P1）— 已完成

**目標**：把目前 567 題 Quick Quiz 變成可追蹤的快速複習層。

工作項目：

1. 為文章補上 Concept ID 與 3–6 個 Learning Objectives。
2. 為每一道既有 Quiz 題補上 Concept ID 與目標對應。
3. 保留一個分類 Quiz 檔集中多題的現況，不強迫每個概念拆成獨立檔案。
4. 清理重複或只連到同一文章但測試角度完全相同的題目。
5. 讓所有受治理概念至少有一個可用的 Quick Quiz 入口；新增文章需在同一批次決定是否建立對應題目。

完成條件：所有既有 Quiz 題都能追溯到 Concept ID；需要 Quick Quiz 的概念對應率可由檢查工具產出；有效連結率 100%。

### Phase 3：Hard Assessment 擴展（P1 → P2）— 已完成全庫覆蓋

**目標**：逐步讓每個受治理概念的 Learning Objectives 都有可評分的應用題。

遷移原則：

- 重要程度 5：至少一個 Hard Assessment Item，且必須包含情境、診斷、追蹤或取捨。
- 重要程度 4：至少一個 Hard Assessment Item；若涉及併發、可靠性、效能或系統設計，必須使用情境題。
- 重要程度 3：與 4–5 級採同一套 Concept、Quick Quiz 與 Hard Assessment 治理。
- 尚未分級的文章：目前為 0；新增文章先完成 Phase 1 metadata，再進入測驗治理。

建議批次：

1. **核心後端批次**：API 設計、資料庫、快取、訊息佇列、分散式系統、可觀測性（已完成 8 份 Assessment；資料庫與快取沿用試點）。
2. **基礎設施第一批**：Kubernetes 發布、Probe、資源與 autoscaling（已完成 1 份 Assessment、5 題 Quick Quiz）。
3. **系統設計第一批**：秒殺、分散式鎖、購票與限量資源一致性（已完成 1 份 Assessment、5 題 Quick Quiz）。
4. **語言第一批**：Go worker pipeline、取消、背壓與 goroutine lifecycle（已完成 1 份 Assessment；沿用 Go Quick Quiz）。
5. **Docker 與 CI/CD 批次**：Docker 建置／執行期與安全、CI/CD 安全交付（已完成 2 份 Assessment、10 題 Quick Quiz、10 篇文章的雙向映射）。
6. **雲端與安全批次**：雲端服務選型、雲原生、Serverless、身份、JWT、API 防護、CSRF 與 TLS（已完成 2 份 Assessment、9 題 Quick Quiz、9 篇文章的雙向映射）。
7. **架構模式批次**：DI、Strategy、Observer、Proxy 與 OCP（已完成 1 份 Assessment、5 題 Quick Quiz、5 篇文章的雙向映射）。
8. **Java 第一批**：JMM、synchronized、Thread Pool、GC 與 Spring IoC（已完成 1 份 Assessment、5 題 Quick Quiz、5 篇文章的雙向映射）。
9. **Python 第一批**：FastAPI async route、事件循環、併發模型、GIL、記憶體與 FastAPI DI（已完成 1 份 Assessment、補 1 題 Quick Quiz、5 篇文章接入；其中 4 篇沿用既有 Quick Quiz 映射）。
10. **C# 第一批**：async/await、Task、lock／Monitor、.NET GC 與 ASP.NET Core DI（已完成 1 份 Assessment、沿用 5 題既有 Quick Quiz，5 篇既有映射文章新增 Hard Assessment 反向連結）。
11. **PHP 第一批**：PHP-FPM、OPcache/JIT、PHP GC、Laravel Service Container 與效能（已完成 1 份 Assessment、沿用 5 題既有 Quick Quiz，5 篇既有映射文章新增 Hard Assessment 反向連結）。
12. **Node.js 第一批**：Event Loop、非阻塞 I/O、非同步錯誤、Stream 背壓、V8 記憶體與 Express 錯誤邊界（已完成 1 份 Assessment、沿用 6 題既有 Quick Quiz，6 篇既有映射文章新增 Hard Assessment 反向連結）。
13. **NestJS framework 批次**：Module Graph、DI Scope、Provider／Service、Request Lifecycle 與 Exception Filter（已完成 1 份 Assessment、新增 3 題 Quick Quiz，5 篇文章完成雙向映射）。
14. **Go Gin framework 批次**：Middleware Chain、Context Reuse、並發安全、容量與多租戶隔離（已完成 1 份 Assessment，沿用 Go Q10–Q12，3 篇文章完成雙向映射）。
15. **C# Resource Boundary 批次**：ASP.NET Core Middleware、DbContext Scope／Factory、IDisposable／IAsyncDisposable 與 Connection Pool（已完成 1 份 Assessment，沿用 C# Q11、Q14、Q15，3 篇文章完成雙向映射）。
16. **Go／C#／Python runtime 補齊**：資料結構、OS、Networking、Go、C#、Python 的剩餘高重要度文章（已完成 1 份跨領域 Assessment、41 篇雙向映射）。
17. **Storage／API／Messaging／Search 補齊**：資料庫、快取、Elasticsearch、Kafka、RabbitMQ 與 API Design（已完成 1 份跨領域 Assessment、34 篇雙向映射）。
18. **AI／Node／Microservice 補齊**：AI System Design、Vector／LLM、Node.js、Gateway、Discovery、Circuit Breaker 與 Raft（已完成 1 份跨領域 Assessment、20 篇雙向映射）。
19. **PHP／Laravel 補齊**：PSR、Core、型別、自動載入、Generator、DI、Facade、Request、Eloquent 與 Middleware（已完成 1 份 Assessment、13 篇雙向映射）。
20. **Observability／CI、Security／Testing、AI Engineering／Management、Frontend**：已完成 4 份 Assessment、41 篇雙向映射，並新增對應分類 Quiz。
21. **剩餘重要程度 3 補齊**：OS interrupt／signal、資料庫／Kafka／Go modules、Node／PHP／Python tooling、分散式／DDD／交付／Engineering Management／Testing（已完成 3 份 Completion Incident、29 篇雙向映射、29 題 Quick Quiz）。

每一批都採「先補文章目標 → 再補 Quick Quiz → 再寫 Hard Assessment → 執行覆蓋率檢查」的順序。不要直接為 553 篇文章各寫一份孤立的測驗檔；先按概念邊界與 Learning Objectives 分組。

### Phase 4：自動檢查與 CI（P2）— 已完成

**目標**：把人工盤點轉為每次修改都能重跑的品質門檻。

已新增 [`scripts/validate_assessments.go`](../scripts/validate_assessments.go) 與 [Assessment Quality workflow](../.github/workflows/assessment-quality.yml)。工具目前會驗證：

- 主題文章的難度、重要程度、標籤與 Concept ID。
- Learning Objectives 是否有對應的 Quick Quiz 或 Hard Assessment。
- Assessment ID、Concept ID 與 Objective ID 是否重複或格式錯誤。
- 文章與測驗是否雙向連結且連結有效。
- Hard Assessment 必填欄位、0–4 分 rubric 與預設通過門檻。
- Markdown 本地連結是否失效；檢查器需忽略 fenced code 與文件模板示例。
- Assessment ID 唯一、主要 Concept ID 存在，以及 concept-qualified LO 是否由對應文章承載。
- Hard Assessment 的現存新舊格式（新格式使用 `concept.../LO-*`，舊格式可使用 `LO-*` 局部 ID）。
- Hard Assessment 內的 fenced code 若存在，必須是 Go 或明確的文字／Markdown 說明。

CI 在 push 與 pull request 觸發，執行全庫檢查；目前驗收結果為 553 篇文章、553 篇完整治理、52 份 Hard Assessment、1,335 個 LO ID 與 3,517 個本地 Markdown 路徑通過。

### Phase 5：持續維護（P2）— 全庫治理後維護規則

每次修改概念文章時，固定執行：

```text
修改文章與 Learning Objectives
→ 以 Concept ID 搜尋所有 Quiz / Assessment
→ 依變更影響矩陣更新受影響檔案
→ 必要時提高 Assessment 版本
→ 執行連結、ID 與覆蓋率檢查
```

小型排版修正不需要升版；核心答案、題目限制、期待證據或評分規準改變時，必須升版並保留變更原因。

每個內容批次完成後建立獨立 commit，commit 前至少執行 `git diff --check` 與 `go run ./scripts/validate_assessments.go`。全數 553 篇文章的 Concept、Learning Objectives、Quick Quiz 與 Hard Assessment 映射門檻維持 100%。

## 六、驗收指標

### 架構完整性

- 553 篇文章的重要程度與完整治理覆蓋率均達 100%。
- 553 篇文章都有 Concept ID、Learning Objectives、Quick Quiz 與 Hard Assessment。
- 553 篇文章的 Learning Objectives 有 100% 的 Hard Assessment 覆蓋。
- 52 份 Hard Assessment 都具備穩定 ID、情境／作答／評分／答案區塊、有效文章連結與明確通過門檻。
- Assessment ID 唯一；Concept-qualified Objective ID 會回指到 assessment 的對應文章，局部 `LO-*` 則維持 Concept 內作用域。

### Quiz 與學習流程

- 567 道 Quiz 題分布在 28 份分類檔；其中 2 題仍明確標記為 pending，沒有偽造文章映射。
- 被標記為需要 Quick Quiz 的概念都有有效入口。
- 單一概念可以依序完成「文章 → Quiz → Hard Assessment → 補強 → 重測」。

### 導航與品質

- 3,517 個本地 Markdown 路徑失效數降至 0。
- 新增或修改的文章、Quiz、Assessment 不得新增死連結。
- 52 份 Assessment 能通過同一套檢查，並可作為後續批次範本。

## 七、主要風險與對策

| 風險 | 影響 | 對策 |
| :--- | :--- | :--- |
| 553 篇文章的範圍過大 | 遷移未完成且內容開始漂移 | 先按重要程度與後端面試價值分批，不追求一次完成 |
| Quiz、文章、Assessment 重複寫答案 | 長期容易互相矛盾 | 文章維持理論來源，測驗只保留回答所需證據與摘要 |
| 一篇文章包含太多概念 | 一題無法公平評估 | 先拆 Learning Objectives，必要時拆 Concept ID 或 Assessment Item |
| 只追求題目變難 | 變成冷知識測驗 | 所有 Hard Assessment 必須有情境、限制、證據與 trade-off |
| 重要程度判斷不一致 | 遷移順序失真 | 先建立分級準則，對 4–5 級做第二次校準 |
| 既有 README 連結大量失效 | 使用者找不到文章 | 先修復導航，並讓 CI 逐步接管連結檢查 |
| 技術內容日後更新 | 測驗答案過期 | 以 Assessment version 與變更影響矩陣管理，不用無理由升版 |

## 八、建議執行順序

目前最合理的後續執行順序是：

```text
Phase 0：標準化四題試點（完成）
    ↓
Phase 1：修復 metadata 與失效連結（完成）
    ↓
Phase 2：為既有 Quiz 補 Concept / Objective 對應（完成）
    ↓
Phase 3：核心後端 Hard Assessment（完成）
    ↓
Phase 3：基礎設施、系統設計與語言第一批（完成）
    ↓
Phase 3：Docker、CI/CD 批次（完成）
    ↓
Phase 3：雲端、安全批次（完成）
    ↓
Phase 3：架構模式批次（完成）
    ↓
Phase 3：Java 第一批（完成）
    ↓
Phase 3：Python 第一批（完成）
    ↓
Phase 3：C# 第一批（完成）
    ↓
Phase 3：PHP 第一批（完成）
    ↓
Phase 3：Node.js 第一批（完成）
    ↓
Phase 3：NestJS framework 批次（完成）
    ↓
Phase 3：Go Gin framework 批次（完成）
    ↓
Phase 3：C# Resource Boundary 與其餘高重要度語言／框架批次（完成）
    ↓
Phase 4：加入 Go 自動檢查與 GitHub Actions CI（完成）
    ↓
Phase 3：剩餘重要程度 3 內容補齊（完成）
    ↓
Phase 5：以變更影響矩陣、獨立 commit 與全庫 validator 持續維護（全庫治理完成）
```

後續新增內容不再另開一套流程：依文章 → Quick Quiz → Hard Assessment 的順序補齊，執行 Go validator，並在每個可審查批次完成後建立獨立 commit。現有 553 篇文章已完成治理，後續只需依變更影響矩陣維護受影響的 Quiz 與 Assessment。
