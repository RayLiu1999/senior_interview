# Architecture／Delivery／Quality Completion Incident：從成員收斂到可驗證交付

- **Assessment ID**: `assessment.architecture-delivery-quality.completion.v1`
- **主要 Concept ID**: `concept.distributed.gossip.membership-convergence`
- **次要 Concept IDs**:
  - `concept.ddd.repository-factory-boundary`
  - `concept.engineering-management.delivery-model-waterfall`
  - `concept.engineering-management.hiring-interviewing`
  - `concept.engineering-management.agile-delivery`
  - `concept.testing.atdd.acceptance-collaboration`
  - `concept.testing.end-to-end.boundary-confidence`
  - `concept.testing.mutation.testing-signal`
- **對應文章**:
  - [Gossip Protocols](../../03_System_Design_and_Architecture/Distributed_Systems_Theory/gossip_protocols.md)
  - [Repository 與 Factory Patterns](../../03_System_Design_and_Architecture/Domain_Driven_Design/repository_and_factory_patterns.md)
  - [Waterfall Model](../../03_System_Design_and_Architecture/Software_Development_Models/waterfall_model.md)
  - [Hiring and Interviewing](../../05_Specialized_Topics/Engineering_Management/hiring_and_interviewing.md)
  - [Agile Project Management](../../05_Specialized_Topics/Engineering_Management/project_management_agile.md)
  - [ATDD](../../05_Specialized_Topics/Testing/atdd.md)
  - [End-to-End Testing](../../05_Specialized_Topics/Testing/end_to_end_testing.md)
  - [Mutation Testing](../../05_Specialized_Topics/Testing/mutation_testing.md)
- **題型**: `分散式收斂`, `領域邊界`, `交付模型`, `招聘校準`, `測試證據`, `品質閘門`
- **難度**: 9
- **重要程度**: 3
- **建議作答時間**: 45 分鐘
- **標籤**: `Distributed Systems`, `DDD`, `Engineering Management`, `Testing`, `Delivery`, `Quality`
- **Learning Objective IDs**:
  - `concept.distributed.gossip.membership-convergence/LO-1`
  - `concept.distributed.gossip.membership-convergence/LO-2`
  - `concept.distributed.gossip.membership-convergence/LO-3`
  - `concept.ddd.repository-factory-boundary/LO-1`
  - `concept.ddd.repository-factory-boundary/LO-2`
  - `concept.ddd.repository-factory-boundary/LO-3`
  - `concept.engineering-management.delivery-model-waterfall/LO-1`
  - `concept.engineering-management.delivery-model-waterfall/LO-2`
  - `concept.engineering-management.delivery-model-waterfall/LO-3`
  - `concept.engineering-management.hiring-interviewing/LO-1`
  - `concept.engineering-management.hiring-interviewing/LO-2`
  - `concept.engineering-management.hiring-interviewing/LO-3`
  - `concept.engineering-management.agile-delivery/LO-1`
  - `concept.engineering-management.agile-delivery/LO-2`
  - `concept.engineering-management.agile-delivery/LO-3`
  - `concept.testing.atdd.acceptance-collaboration/LO-1`
  - `concept.testing.atdd.acceptance-collaboration/LO-2`
  - `concept.testing.atdd.acceptance-collaboration/LO-3`
  - `concept.testing.end-to-end.boundary-confidence/LO-1`
  - `concept.testing.end-to-end.boundary-confidence/LO-2`
  - `concept.testing.end-to-end.boundary-confidence/LO-3`
  - `concept.testing.mutation.testing-signal/LO-1`
  - `concept.testing.mutation.testing-signal/LO-2`
  - `concept.testing.mutation.testing-signal/LO-3`

## 測驗目標

- 能把 gossip membership、領域持久化邊界、交付模型與測試證據串成可驗證的決策鏈。
- 能區分 eventual convergence、domain invariant、流程選擇、面試 signal 與測試 coverage 各自能證明及不能證明的事情。
- 能提出有 owner、停止線、觀測指標、校準方式與 rollback 的分階段改善方案，而不是用單一速度或分數宣稱品質。

### 學習目標覆蓋

| 文章 Concept | Learning Objectives | 作答覆蓋 |
| :--- | :--- | :--- |
| `concept.distributed.gossip.membership-convergence` | LO-1、LO-2、LO-3 | 作答要求 1 |
| `concept.ddd.repository-factory-boundary` | LO-1、LO-2、LO-3 | 作答要求 2 |
| `concept.engineering-management.delivery-model-waterfall` | LO-1、LO-2、LO-3 | 作答要求 3 |
| `concept.engineering-management.hiring-interviewing` | LO-1、LO-2、LO-3 | 作答要求 4 |
| `concept.engineering-management.agile-delivery` | LO-1、LO-2、LO-3 | 作答要求 5 |
| `concept.testing.atdd.acceptance-collaboration` | LO-1、LO-2、LO-3 | 作答要求 6 |
| `concept.testing.end-to-end.boundary-confidence` | LO-1、LO-2、LO-3 | 作答要求 7 |
| `concept.testing.mutation.testing-signal` | LO-1、LO-2、LO-3 | 作答要求 8 |

## 問題情境與限制條件

你接手一個跨區域訂單平台的交付改善。平台以 gossip protocol 傳播 node membership 與 routing hints；訂單 domain 使用 aggregate、Repository 與 Factory；產品團隊正在討論以 waterfall 或 agile 方式交付一個高風險流程。最近一季同時出現節點誤判、資料邊界被繞過、面試結果不一致，以及測試全綠但 production 仍有缺陷的情況。

目前證據如下：

- 網路短暫分區後，部分節點保留過期 membership；不同 fan-out 與 gossip interval 造成 convergence lag 差異，監控只看平均心跳延遲，沒有 false positive、tombstone、repair 或 partition merge 證據。
- Application service 直接操作 ORM model，Factory 只填欄位，Repository 暴露 query builder；一次重試造成同一 aggregate 的 invariant 被繞過，測試 fake 卻沒有模擬 concurrency。
- 合規團隊要求在季度末前完成 audit trail 與 approval gate，產品需求仍可能變動；管理層只要求「照 waterfall 做完整計畫」或「照 agile 加速」，沒有說明不可違反的品質條件。
- Senior engineer 面試由不同 interviewer 自由發問，評分表沒有行為錨點；strong hire 比例上升，但入職後三個月的 onboarding 與 ownership 表現波動很大。
- Acceptance criteria 常在開發完成後才補；E2E suite 共有 420 個案例且 flaky，mutation score 只有一個全域數字，團隊以 coverage 與綠燈作為 release gate。

限制：不得直接關閉 failure detector、繞過 aggregate、刪除 flaky 測試、用加 retry 取代診斷，或以速度／coverage／mutation score 單一指標作為放行理由。每次只允許一個主要流程變因進入 canary，所有改善都必須可觀測、可回退並保留決策紀錄。

## 作答要求

1. 建立 gossip membership 的故障時間線，分析 push／pull／push-pull、version、fan-out、partition、false positive、tombstone 與 anti-entropy，提出 convergence、staleness、repair 與停止線指標。
2. 重畫訂單 aggregate 的 Repository／Factory／application service／infrastructure 邊界，說明建立、reconstitution、transaction、identity、concurrency 與測試替身如何保護 invariant。
3. 為合規與高變動需求選擇 waterfall、iterative、agile 或 hybrid 交付模型，列出固定 gate、可變範圍、回饋節奏、依賴與 rollback evidence。
4. 設計 senior engineer 的結構化 interview loop，定義 competency rubric、每一關的 signal、評分錨點、獨立評分、calibration、candidate experience 與 hiring decision ownership。
5. 為持續膨脹的 backlog 設計 agile operating model，包含 priority、WIP、capacity、unplanned work、quality guardrail、dependency、outcome 與調適週期。
6. 以三方協作把高風險訂單需求轉成 ATDD acceptance examples，涵蓋成功、拒絕、邊界、權限、重試與 audit evidence，並說明哪些行為不應寫成脆弱的 UI／實作斷言。
7. 從 420 個 E2E 案例中選出關鍵使用者旅程，定義環境、資料隔離、外部依賴、並行、trace、failure triage，以及由 unit／integration／contract test 補位的邊界。
8. 設計 mutation testing 的分層策略，說明 operator、survived／equivalent mutant、flake、成本、風險優先級與 release gate 如何共同解讀，而非追逐全域分數。

## 期待證據

- 能提供 gossip state／version、convergence lag、stale membership、false positive、partition repair 與 rollback／degraded mode 的可觀測方案。
- 能用 aggregate invariant、repository contract、transaction trace、optimistic concurrency、fake 與真實 persistence integration 證明邊界，而不是只展示 ORM 測試。
- 能把交付模型選擇連到需求不確定性、合規 gate、依賴、lead time、變更失敗率、恢復時間與客戶 outcome。
- 能以行為證據與 calibration 檢查 interview signal，並把 hiring decision 與 onboarding／90-day outcome 連起來。
- 能展示 acceptance example、E2E journey matrix、flake rate、定位成本、mutation survivors、equivalent mutant 與缺陷逃逸，而不是只報 coverage 或綠燈。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議增加節點、照流程走、提高 coverage 或刪除失敗測試，沒有邊界、證據與回退。 |
| 1 | 能列出部分 gossip、DDD、Agile 或 testing 名詞，但混淆 convergence、invariant、signal 與 coverage 的意義。 |
| 2 | 能指出主要風險並提出局部修復，但缺少 owner、指標、校準、測試分層或 rollback。 |
| 3 | 能完成八項分析，提出清楚的架構邊界、交付節奏、面試 rubric、測試證據、停止線與可執行的 rollout。 |
| 4 | 除上述內容外，能量化收斂與交付成本，處理 partition、concurrency、合規與需求變動，並用 outcome 反饋持續修正整個系統。 |

### 通過標準

總分達 **3/4 分**才通過；gossip／domain boundary、delivery／hiring governance、testing evidence 三個面向均不得低於 2 分，且必須提出至少一個可驗證的 rollback 或 degraded-mode 條件。

## 參考答案與詳解

先把事故拆成四條證據鏈：membership 是否收斂、domain invariant 是否被守住、交付選擇是否符合限制、測試信號是否真的覆蓋風險。Gossip 不提供立即一致性；應記錄每個節點看到的 version、age、suspicion、fan-out、convergence lag 與 partition merge 結果，並以 anti-entropy、tombstone／TTL、bounded payload 與 repair job 收斂過期狀態。若 false positive 或 staleness 超過服務可接受窗口，先進入安全的 degraded mode 或停止流量切換，而不是單純加快 gossip。

Aggregate 應由 Factory 建立有效狀態，Repository 以 domain identity 提供 load／save，application service 編排 use case 與 transaction，infrastructure adapter 承擔 ORM、序列化與資料庫細節。Reconstitution 不可繞過版本與 invariant；並發更新要用 version／conditional write 或明確的 conflict policy。測試需同時有 domain contract、fake repository 與真實 persistence integration，才能發現 fake 沒有模擬的 transaction、unique constraint 或 concurrency 問題。

交付模型不是信仰選擇。合規、audit、風險與不可變的架構 gate 可以採較固定的治理節點；未知需求則用短週期、可工作的 increment 和 acceptance feedback 驗證。這通常導向 hybrid：固定 security／audit／architecture evidence，讓 scope、優先級與實作以有限 WIP 迭代。用 lead time、blocked time、change failure rate、恢復時間、缺陷、customer outcome 與團隊負荷調適，而不是用 velocity 當成承諾量。

面試 loop 應先定義職能與行為錨點，每一關只收集可區分的 signal；面試官先獨立記錄 evidence，再用共同 rubric calibration，最後由明確的 decision owner 彙整，而非由最資深或最早發言者決定。之後用 time-to-productivity、90-day ownership、retention 與候選人體驗回顧 signal 是否有效。

ATDD 讓 business、development、testing 在開發前以 examples 對齊需求；案例應描述可觀察結果與例外，不應綁定私有 method 或脆弱 selector。E2E 只保留代表關鍵跨邊界旅程的少數案例，資料與環境可隔離、可重建並有 trace；contract／integration／unit test 負責更細的錯誤定位。Mutation testing 則依變更與風險分層，先處理高價值 survived mutant、排除 equivalent mutant 與 flake，再把 mutation evidence、缺陷逃逸、執行成本與穩定度一起納入 gate。

## 常見失分點

- 把 gossip 的 eventual convergence 當成強一致，或只用平均 latency 掩蓋 stale membership 與 partition repair。
- 讓 Repository 暴露 ORM／query builder，或把 Factory 當成欄位 mapping helper，沒有保護 aggregate invariant 與 concurrency。
- 把 waterfall 等同完整計畫、把 agile 等同沒有文件，沒有列出固定 gate、可變範圍與回饋證據。
- 用 interviewer 的直覺、文化 fit 或單次印象取代結構化 evidence、calibration 與後續 outcome。
- 以 coverage、E2E 數量、全域 mutation score 或綠燈單獨宣稱品質，忽略 flake、定位成本、equivalent mutant 與缺陷逃逸。

## 延伸追問

- 如果 gossip repair 與 routing decision 的 convergence window 不一致，應由哪個邊界承擔風險，如何設計跨層 guardrail？
- 如果 aggregate transaction 跨越外部支付服務，哪些 invariant 仍可同步保證，哪些必須改成 saga、outbox 或 reconciliation？
- 如果合規 gate 讓 agile increment 變慢，如何區分必要控制與可自動化的證據產生，並量化其成本？
- 若 mutation score 上升但 production defect 沒下降，下一輪應檢查 operator、測試 oracle、需求 examples 還是 observability？
