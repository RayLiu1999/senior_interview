# Architecture Change Boundary Review：從設計原則到分散式演進

- **Assessment ID**: `assessment.architecture.change-boundary.review.v1`
- **主要 Concept ID**: `concept.patterns.solid.dip.dependency-inversion`
- **次要 Concept IDs**:
  - `concept.patterns.command.request-encapsulation`
  - `concept.patterns.abstract-factory.product-family-consistency`
  - `concept.patterns.decorator.composable-behavior`
  - `concept.patterns.solid.isp.interface-segregation`
  - `concept.patterns.adapter.compatibility-boundary`
  - `concept.patterns.hexagonal.ports-adapters`
  - `concept.patterns.singleton.shared-state-lifecycle`
  - `concept.patterns.chain-of-responsibility.pipeline-composition`
  - `concept.patterns.template-method.inheritance-skeleton`
  - `concept.patterns.solid.srp.change-reasons`
  - `concept.patterns.builder.construct-valid-state`
  - `concept.patterns.solid.lsp.substitutability`
  - `concept.patterns.factory-method.creation-extension`
  - `concept.architecture.scaling.horizontal-distribution`
  - `concept.architecture.evolution.horizontal-scaling-stage`
  - `concept.architecture.cap.partition-tradeoff`
  - `concept.architecture.cqrs.read-write-separation`
  - `concept.architecture.event-sourcing.audit-replay`
  - `concept.architecture.evolution.distributed-stage`
  - `concept.architecture.patterns.selection-tradeoffs`
  - `concept.architecture.evolution.monolith-boundary`
- **對應文章**:
  - [命令模式](../../03_System_Design_and_Architecture/Design_Patterns_and_Principles/command_pattern.md) — `concept.patterns.command.request-encapsulation`
  - [抽象工廠模式](../../03_System_Design_and_Architecture/Design_Patterns_and_Principles/abstract_factory_pattern.md) — `concept.patterns.abstract-factory.product-family-consistency`
  - [裝飾器模式](../../03_System_Design_and_Architecture/Design_Patterns_and_Principles/decorator_pattern.md) — `concept.patterns.decorator.composable-behavior`
  - [介面隔離原則](../../03_System_Design_and_Architecture/Design_Patterns_and_Principles/solid_isp.md) — `concept.patterns.solid.isp.interface-segregation`
  - [適配器模式](../../03_System_Design_and_Architecture/Design_Patterns_and_Principles/adapter_pattern.md) — `concept.patterns.adapter.compatibility-boundary`
  - [六邊形架構](../../03_System_Design_and_Architecture/Design_Patterns_and_Principles/hexagonal_architecture.md) — `concept.patterns.hexagonal.ports-adapters`
  - [單例模式](../../03_System_Design_and_Architecture/Design_Patterns_and_Principles/singleton_pattern.md) — `concept.patterns.singleton.shared-state-lifecycle`
  - [責任鏈模式](../../03_System_Design_and_Architecture/Design_Patterns_and_Principles/chain_of_responsibility.md) — `concept.patterns.chain-of-responsibility.pipeline-composition`
  - [依賴反轉原則](../../03_System_Design_and_Architecture/Design_Patterns_and_Principles/solid_dip.md) — `concept.patterns.solid.dip.dependency-inversion`
  - [模板方法模式](../../03_System_Design_and_Architecture/Design_Patterns_and_Principles/template_method_pattern.md) — `concept.patterns.template-method.inheritance-skeleton`
  - [單一職責原則](../../03_System_Design_and_Architecture/Design_Patterns_and_Principles/solid_srp.md) — `concept.patterns.solid.srp.change-reasons`
  - [建造者模式](../../03_System_Design_and_Architecture/Design_Patterns_and_Principles/builder_pattern.md) — `concept.patterns.builder.construct-valid-state`
  - [里氏替換原則](../../03_System_Design_and_Architecture/Design_Patterns_and_Principles/solid_lsp.md) — `concept.patterns.solid.lsp.substitutability`
  - [工廠方法模式](../../03_System_Design_and_Architecture/Design_Patterns_and_Principles/factory_method_pattern.md) — `concept.patterns.factory-method.creation-extension`
  - [水平擴展與分散式系統](../../03_System_Design_and_Architecture/Software_Architecture/horizontal_scaling_vs_distributed_systems.md) — `concept.architecture.scaling.horizontal-distribution`
  - [演進第二階段：水平擴展](../../03_System_Design_and_Architecture/Software_Architecture/evolution_stage_2_horizontal_scaling.md) — `concept.architecture.evolution.horizontal-scaling-stage`
  - [CAP 定理](../../03_System_Design_and_Architecture/Software_Architecture/cap_theorem.md) — `concept.architecture.cap.partition-tradeoff`
  - [CQRS](../../03_System_Design_and_Architecture/Software_Architecture/cqrs_pattern.md) — `concept.architecture.cqrs.read-write-separation`
  - [事件溯源](../../03_System_Design_and_Architecture/Software_Architecture/event_sourcing_pattern.md) — `concept.architecture.event-sourcing.audit-replay`
  - [演進第三階段：分散式架構](../../03_System_Design_and_Architecture/Software_Architecture/evolution_stage_3_distributed_architecture.md) — `concept.architecture.evolution.distributed-stage`
  - [常見軟體架構模式](../../03_System_Design_and_Architecture/Software_Architecture/common_software_architecture_patterns.md) — `concept.architecture.patterns.selection-tradeoffs`
  - [演進第一階段：單體架構](../../03_System_Design_and_Architecture/Software_Architecture/evolution_stage_1_monolith.md) — `concept.architecture.evolution.monolith-boundary`
- **題型**: `架構變更審查`, `設計取捨`, `可測試性`, `一致性`, `漸進式演進`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 45 分鐘
- **標籤**: `SOLID`, `Design Patterns`, `Composition`, `Inheritance`, `Dependency Inversion`, `Monolith`, `Distributed Systems`, `CAP`, `CQRS`, `Event Sourcing`, `Architecture Trade-offs`
- **Learning Objective IDs**:
  - `concept.patterns.command.request-encapsulation/LO-1`
  - `concept.patterns.command.request-encapsulation/LO-2`
  - `concept.patterns.command.request-encapsulation/LO-3`
  - `concept.patterns.abstract-factory.product-family-consistency/LO-1`
  - `concept.patterns.abstract-factory.product-family-consistency/LO-2`
  - `concept.patterns.abstract-factory.product-family-consistency/LO-3`
  - `concept.patterns.decorator.composable-behavior/LO-1`
  - `concept.patterns.decorator.composable-behavior/LO-2`
  - `concept.patterns.decorator.composable-behavior/LO-3`
  - `concept.patterns.solid.isp.interface-segregation/LO-1`
  - `concept.patterns.solid.isp.interface-segregation/LO-2`
  - `concept.patterns.solid.isp.interface-segregation/LO-3`
  - `concept.patterns.adapter.compatibility-boundary/LO-1`
  - `concept.patterns.adapter.compatibility-boundary/LO-2`
  - `concept.patterns.adapter.compatibility-boundary/LO-3`
  - `concept.patterns.hexagonal.ports-adapters/LO-1`
  - `concept.patterns.hexagonal.ports-adapters/LO-2`
  - `concept.patterns.hexagonal.ports-adapters/LO-3`
  - `concept.patterns.singleton.shared-state-lifecycle/LO-1`
  - `concept.patterns.singleton.shared-state-lifecycle/LO-2`
  - `concept.patterns.singleton.shared-state-lifecycle/LO-3`
  - `concept.patterns.chain-of-responsibility.pipeline-composition/LO-1`
  - `concept.patterns.chain-of-responsibility.pipeline-composition/LO-2`
  - `concept.patterns.chain-of-responsibility.pipeline-composition/LO-3`
  - `concept.patterns.solid.dip.dependency-inversion/LO-1`
  - `concept.patterns.solid.dip.dependency-inversion/LO-2`
  - `concept.patterns.solid.dip.dependency-inversion/LO-3`
  - `concept.patterns.template-method.inheritance-skeleton/LO-1`
  - `concept.patterns.template-method.inheritance-skeleton/LO-2`
  - `concept.patterns.template-method.inheritance-skeleton/LO-3`
  - `concept.patterns.solid.srp.change-reasons/LO-1`
  - `concept.patterns.solid.srp.change-reasons/LO-2`
  - `concept.patterns.solid.srp.change-reasons/LO-3`
  - `concept.patterns.builder.construct-valid-state/LO-1`
  - `concept.patterns.builder.construct-valid-state/LO-2`
  - `concept.patterns.builder.construct-valid-state/LO-3`
  - `concept.patterns.solid.lsp.substitutability/LO-1`
  - `concept.patterns.solid.lsp.substitutability/LO-2`
  - `concept.patterns.solid.lsp.substitutability/LO-3`
  - `concept.patterns.factory-method.creation-extension/LO-1`
  - `concept.patterns.factory-method.creation-extension/LO-2`
  - `concept.patterns.factory-method.creation-extension/LO-3`
  - `concept.architecture.scaling.horizontal-distribution/LO-1`
  - `concept.architecture.scaling.horizontal-distribution/LO-2`
  - `concept.architecture.scaling.horizontal-distribution/LO-3`
  - `concept.architecture.evolution.horizontal-scaling-stage/LO-1`
  - `concept.architecture.evolution.horizontal-scaling-stage/LO-2`
  - `concept.architecture.evolution.horizontal-scaling-stage/LO-3`
  - `concept.architecture.cap.partition-tradeoff/LO-1`
  - `concept.architecture.cap.partition-tradeoff/LO-2`
  - `concept.architecture.cap.partition-tradeoff/LO-3`
  - `concept.architecture.cqrs.read-write-separation/LO-1`
  - `concept.architecture.cqrs.read-write-separation/LO-2`
  - `concept.architecture.cqrs.read-write-separation/LO-3`
  - `concept.architecture.event-sourcing.audit-replay/LO-1`
  - `concept.architecture.event-sourcing.audit-replay/LO-2`
  - `concept.architecture.event-sourcing.audit-replay/LO-3`
  - `concept.architecture.evolution.distributed-stage/LO-1`
  - `concept.architecture.evolution.distributed-stage/LO-2`
  - `concept.architecture.evolution.distributed-stage/LO-3`
  - `concept.architecture.patterns.selection-tradeoffs/LO-1`
  - `concept.architecture.patterns.selection-tradeoffs/LO-2`
  - `concept.architecture.patterns.selection-tradeoffs/LO-3`
  - `concept.architecture.evolution.monolith-boundary/LO-1`
  - `concept.architecture.evolution.monolith-boundary/LO-2`
  - `concept.architecture.evolution.monolith-boundary/LO-3`

## 測驗目標

- 能從變更原因、業務不變條件、資料 ownership 和品質屬性界定真正的架構邊界，而不是用 pattern 名稱代替設計。
- 能以 DIP、ports and adapters、ISP、SRP 與可測試的 composition root 隔離外部變化。
- 能比較組合與繼承，並在 command、factory、builder、decorator、adapter、template、chain 和 singleton 之間做出有證據的選擇。
- 能判斷單體、水平擴展、分散式架構、CQRS 與 Event Sourcing 的導入時機、代價和回滾路徑。
- 能把一致性、可用性、投影延遲、事件重播、故障域、部署風險與運維能力轉成可量測的決策。

## 問題情境與限制條件

某 SaaS 訂單平台最初是模組化單體，近期把服務部署成多個副本。平台同時面臨四類變更：新增兩個支付供應商、不同租戶的定價規則、物流 provider 的版本差異，以及財務與客服要求的完整訂單歷史。讀取流量在三個月內增加 20 倍，團隊提出「直接拆成微服務、使用大量繼承和全域 singleton」的方案。

目前觀察到以下問題：

- `OrderService` 同時負責輸入驗證、定價、持久化、通知、報表和重試；一個大型 provider interface 被所有 client 依賴，任何新方法都觸發大量實作與 mock 變更。
- 支付和物流以繼承擴展，子類別改變錯誤語意和 timeout；另一部分功能以多層 decorator 和 middleware 疊加，但註冊順序沒有 trace，短路後仍偶爾寫入 response。
- 核心服務直接建立資料庫、HTTP client 和 message broker；全域 cache 保存租戶敏感資料，測試需要依賴執行順序才能通過。團隊沒有清楚的 port、adapter 或 composition root。
- 多副本後出現重複扣款、session 遺失、cache stale 和資料庫連線尖峰。某個跨區 partition 期間，庫存不能接受超賣，但商品瀏覽仍希望維持可用。
- 團隊把 CQRS、Event Sourcing 和微服務視為同義詞。現有寫入與讀取模型有時雙寫，有時透過事件更新；投影可能落後數分鐘，事件尚未定義版本、冪等、順序和重建流程。

你是負責架構審查的 senior engineer。限制如下：不能以「多加 pod」、「全面改微服務」或「把所有東西改成事件」作為唯一答案；不能破壞租戶隔離、訂單交易不變條件、向後相容和可追溯性；不能以一次性大重寫取代可驗證的漸進式變更。所有建議都必須能以測試、telemetry、故障注入和可回滾 rollout 證明。

## 作答要求

1. **畫出變更邊界**：列出 provider、定價、租戶政策、通知、查詢、審計和部署的變化軸，將 `OrderService` 拆成合理責任；說明哪些邊界應先留在同一個 transaction。
2. **反轉依賴與建立 port**：為資料庫、支付、物流、事件和時間／ID source 定義穩定的業務契約，說明 adapter、composition root、生命週期和 contract test 的位置。
3. **比較組合與繼承**：至少選三個目前的繼承或 wrapper 問題，說明應採用 composition、Strategy、Command、Factory、Builder、Decorator、Adapter、Template 或 Chain 的哪個邊界；不得只列模式定義。
4. **檢查 SOLID 與可替代性**：指出 SRP、ISP、DIP、LSP 或 OCP 的具體違反，說明 client 契約、前置／後置條件、錯誤語意和遷移相容策略。
5. **選擇架構演進路徑**：比較維持模組化單體、水平擴展、部分拆分與微服務的成本；說明 session、cache、資料 ownership、故障域、部署和 Conway’s Law 的影響。
6. **處理一致性**：在跨區 partition 下為庫存、瀏覽、支付結果和報表選擇一致性語意；說明 quorum、timeout、補償、read-your-own-write 和回復流程。
7. **評估 CQRS／Event Sourcing**：說明何處只需要 read model 分離、何處需要不可變事件；定義事件版本、順序、冪等、snapshot、投影重建、隱私治理和 poison event 的處理。
8. **提出驗證和 rollout**：至少列出 15 項證據或實驗，並提出至少三階段 rollout；每階段包含成功指標、警戒線和 rollback 條件。

## 期待證據

- 變更熱點、依賴圖、client／provider 的責任矩陣與最近的變更歷史。
- `OrderService` 的 transaction、side effect、錯誤和重試邊界，以及拆分後的模組 ownership。
- 啟用 scope／wiring validation 的 composition root 檢查、介面 consumer 清單和 contract test。
- 以 trace 驗證 middleware／decorator／chain 的進入、下一層呼叫、短路、後置行為、response state 和錯誤邊界。
- 用 LSP contract test 驗證 provider 替代實作的前置條件、後置結果、timeout 和錯誤分類。
- provider adapter 的相容性測試、版本切換、fallback、idempotency key、retry budget 和 metrics。
- 多副本壓測的 P50／P99、duplicate request、session、cache stale、queue age、database saturation 和 node loss 結果。
- partition、replica lag、timeout、quorum 和 failover 的故障注入，以及庫存 invariant 是否保持。
- CQRS write／read model 的 projection lag、read-your-own-write、replay、rebuild 和 schema version 證據。
- Event Sourcing 的 aggregate ordering、event ID、duplicate handling、snapshot、upcaster、poison event 和 recovery drill。
- 事件與狀態模型的 parity、資料修復、隱私刪除和 audit 查詢結果。
- 模組化單體、strangler 或部分拆分的 deploy lead time、blast radius、rollback time 和 team ownership。
- 單元、contract、integration、end-to-end、property／mutation 和故障注入測試的責任分布。
- 成本模型：網路 hop、資料複製、儲存、運維、on-call、認知負擔和遷移期間的雙寫／回填成本。
- canary／feature flag／traffic split 的成功指標、警戒線、資料回滾與停止條件。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只背誦 pattern，或只建議全面微服務、增加 pod、提高快取／資料庫容量；忽略依賴、契約、一致性和回滾。 |
| 1 | 能指出單一 SOLID 違反或 CQRS／微服務名詞，但無法連到變更邊界、實際控制流、資料語意和測試證據。 |
| 2 | 能提出部分可行的模組、adapter 或演進方案，但至少遺漏組合／繼承取捨、CAP、投影／事件重建或 rollout 的一個核心面向。 |
| 3 | 能完成變更軸與責任切割，正確使用 DIP／port／adapter，處理組合與繼承、單體到分散式演進、CQRS／Event Sourcing、一致性、測試和分階段回滾。 |
| 4 | 除上述內容外，能用觀測和故障注入量化取捨，處理短路與 response 邊界、LSP 錯誤契約、跨區 partition、事件版本／重播／隱私、資料遷移和可逆部署的連鎖風險。 |

### 通過標準

總分達 **3/4 分**才通過；變更邊界與 SOLID、組合／契約與可測試性、分散式一致性、CQRS／Event Sourcing 四個核心面向均不得低於 2 分，且必須提出至少一個可執行的 rollback 條件與一組可量測的成功指標。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先以變更歷史和不變條件畫出邊界：訂單狀態與庫存扣減保留在清楚的交易單位，provider、通知、報表投影和查詢模型則透過 port 或事件隔離。`OrderService` 不應同時擁有驗證、定價、持久化、通知和報表的所有變更原因；拆分時要保留能一起提交的 domain invariant，避免把一致性問題過早推到網路上。

核心政策應擁有支付、物流、儲存、事件與時間／ID 的穩定抽象，具體 provider 由 adapter 實作，composition root 負責選擇版本、註冊生命週期與啟動檢查。胖介面應依 client 能力拆成角色介面；替代實作必須保持前置條件、後置結果、timeout 和錯誤契約。全域 singleton 只有在共享資源、生命週期、容量和租戶隔離都明確時才可接受；可變 cache 應有 owner、eviction、隔離和可重置測試。

對目前的繼承與 wrapper 逐一判斷變化軸：provider 差異適合 adapter 或 factory，產品家族適合 abstract factory，複雜有效狀態適合 builder，穩定流程上的橫切行為可用 decorator，請求的排程／重試／審計可用 command，固定順序的檢查可用 chain。若步驟需自由替換，使用 composition／Strategy；若子類別改變錯誤或前置條件，應停止繼承並用組合或明確 adapter。所有 wrapper 和 middleware 都要有順序、短路、取消、response 已開始與 trace 的契約。

架構演進應從問題證據開始。若主要是單機 CPU、連線或讀流量瓶頸，先讓模組化單體無狀態化並水平擴展；若需要獨立發布、明確資料 ownership 或故障隔離，才以 strangler、outbox、contract test 和可回滾資料遷移逐步拆分。跨區 partition 時，庫存和支付結果優先保護 invariant，可選擇拒絕或延遲；瀏覽和部分報表可以接受 bounded stale。CAP 不是 AP／CP 標籤，而是把故障模型、資料語意和服務承諾連起來。

CQRS 可先只分離 write model 和特定 read model，不必立即建立多個服務。非同步投影需要 event ID、版本、冪等、順序、lag 監控、read-your-own-write 策略和可重建投影。只有在事件本身是不可變業務事實、需要完整重播／審計且團隊能承擔治理成本時，才採用 Event Sourcing；此時必須設計 snapshot、upcaster、poison event、replay isolation、隱私治理和 parity check，不能用雙寫取代一致性設計。

交付分三階段。第一階段只建立依賴圖、trace、契約測試、模組邊界、feature flag、冪等和容量指標，限制高風險重試與無界平行工作；若 P99、duplicate、跨租戶錯誤或 error budget 惡化即回滾。第二階段在模組化單體內導入 port／adapter、角色介面、替代實作、read model 和 outbox，通過慢 provider、partition、重播、client cancellation 和 node loss 測試；若資料 parity、projection lag 或 rollback time 超過警戒線即停止擴大。第三階段才對有明確 ownership 的邊界做 canary 拆分，分別調整 replica、queue、資料複製和服務容量；以 blast radius、deploy lead time、P99、恢復時間、成本和 on-call 負擔決定是否繼續。

</details>

## 常見失分點

- 把 pattern 名稱當答案，沒有指出變更軸、契約、ownership、失敗語意和測試證據。
- 把「介面更多」或「微服務更多」誤當成低耦合，忽略 composition root、生命週期和資料邊界。
- 用繼承處理 provider 差異，卻沒有檢查 LSP；或用無限 decorator／middleware 隱藏順序和短路錯誤。
- 只說水平擴展或 CAP 的名詞，沒有處理 session、cache、冪等、partition 和業務 invariant。
- 把 CQRS、Event Sourcing、事件驅動和微服務視為同義詞，漏掉投影落後、重播、版本、冪等和隱私治理。
- 只提出大重寫，沒有 modular monolith、strangler、canary、feature flag、資料回填和 rollback 條件。
- 只寫單元測試，沒有 contract、integration、故障注入、parity、容量與可觀測性證據。

## 延伸追問

1. 如果拆出支付服務後重試造成重複扣款，你會如何結合 command、adapter、idempotency、outbox 和 reconciliation 修正？
2. 如果 read model 落後但產品要求 read-your-own-write，你會選同步回讀、session version、暫時查 write model 還是其他方案？取捨是什麼？
3. 如果 event replay 需要數天而法規要求立即修正資料，你會如何設計 snapshot、重建並行、版本化與對外查詢隔離？
4. 如果團隊沒有能力維運多個服務，但單體的某一個 bounded context 已成為部署瓶頸，你會如何安排模組化、水平擴展與有限拆分？
5. 如果跨區 partition 期間瀏覽必須可用但庫存不能超賣，你會如何定義資料路徑、fencing、補償和使用者可見狀態？
6. 如果新增一個 decorator 讓 P99 變差，你會如何用 trace、allocation、cache、retry 和 wrapper ordering 找出責任？
