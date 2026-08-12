# DDD／Microservice Delivery Incident：從因果順序到可回滾交付

- **Assessment ID**: `assessment.ddd-microservice.delivery-incident.v1`
- **主要 Concept ID**: `concept.ddd.bounded-context.strategic-boundaries`
- **次要 Concept IDs**:
  - `concept.distributed-systems.clocks-causal-ordering`
  - `concept.ddd.anemic-rich.domain-behavior`
  - `concept.ddd.domain-events.event-storming`
  - `concept.ddd.aggregate.invariants-boundary`
  - `concept.microservices.event-driven.delivery`
  - `concept.microservices.service-mesh.control-data-plane`
  - `concept.software-development.agile.feedback-flow`
  - `concept.software-development.scrum.delivery-flow`
- **對應文章**:
  - [分散式時鐘與事件順序](../../03_System_Design_and_Architecture/Distributed_Systems_Theory/distributed_clocks_and_ordering.md)
  - [貧血模型 vs 充血模型](../../03_System_Design_and_Architecture/Domain_Driven_Design/anemic_vs_rich_domain_model.md)
  - [領域事件與事件風暴](../../03_System_Design_and_Architecture/Domain_Driven_Design/domain_events_and_event_storming.md)
  - [戰略設計：Bounded Context 與 Ubiquitous Language](../../03_System_Design_and_Architecture/Domain_Driven_Design/strategic_design_bounded_context.md)
  - [戰術設計：Aggregate、Entity 與 Value Object](../../03_System_Design_and_Architecture/Domain_Driven_Design/tactical_design_aggregates_entities_value_objects.md)
  - [微服務架構下的事件驅動通訊](../../03_System_Design_and_Architecture/Micro_Service/event_driven_communication.md)
  - [什麼是服務網格](../../03_System_Design_and_Architecture/Micro_Service/service_mesh.md)
  - [敏捷開發](../../03_System_Design_and_Architecture/Software_Development_Models/agile_development.md)
  - [Scrum 框架](../../03_System_Design_and_Architecture/Software_Development_Models/scrum_framework.md)
- **題型**: `生產事故診斷`、`DDD 邊界設計`、`事件交付`、`架構權衡`、`分階段交付`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 60 分鐘
- **標籤**: `DDD`, `Bounded Context`, `Aggregate`, `Domain Event`, `Event Storming`, `Logical Clock`, `Microservices`, `Event-Driven`, `Service Mesh`, `Agile`, `Scrum`, `Consistency`, `Observability`, `Rollback`
- **Learning Objective IDs**:
  - `concept.distributed-systems.clocks-causal-ordering/LO-1`
  - `concept.distributed-systems.clocks-causal-ordering/LO-2`
  - `concept.distributed-systems.clocks-causal-ordering/LO-3`
  - `concept.ddd.anemic-rich.domain-behavior/LO-1`
  - `concept.ddd.anemic-rich.domain-behavior/LO-2`
  - `concept.ddd.anemic-rich.domain-behavior/LO-3`
  - `concept.ddd.domain-events.event-storming/LO-1`
  - `concept.ddd.domain-events.event-storming/LO-2`
  - `concept.ddd.domain-events.event-storming/LO-3`
  - `concept.ddd.bounded-context.strategic-boundaries/LO-1`
  - `concept.ddd.bounded-context.strategic-boundaries/LO-2`
  - `concept.ddd.bounded-context.strategic-boundaries/LO-3`
  - `concept.ddd.aggregate.invariants-boundary/LO-1`
  - `concept.ddd.aggregate.invariants-boundary/LO-2`
  - `concept.ddd.aggregate.invariants-boundary/LO-3`
  - `concept.microservices.event-driven.delivery/LO-1`
  - `concept.microservices.event-driven.delivery/LO-2`
  - `concept.microservices.event-driven.delivery/LO-3`
  - `concept.microservices.service-mesh.control-data-plane/LO-1`
  - `concept.microservices.service-mesh.control-data-plane/LO-2`
  - `concept.microservices.service-mesh.control-data-plane/LO-3`
  - `concept.software-development.agile.feedback-flow/LO-1`
  - `concept.software-development.agile.feedback-flow/LO-2`
  - `concept.software-development.agile.feedback-flow/LO-3`
  - `concept.software-development.scrum.delivery-flow/LO-1`
  - `concept.software-development.scrum.delivery-flow/LO-2`
  - `concept.software-development.scrum.delivery-flow/LO-3`

## 測驗目標

- 能從物理時間、因果關係與並發事件中辨識真正的排序需求，設計可追蹤的事件 envelope。
- 能以 Ubiquitous Language、資料 ownership、變更原因與 transaction boundary 切出 Bounded Context，而不是把共享資料表當成邊界。
- 能讓 Aggregate Root 保護業務 invariant，分辨領域行為與應用協調，並處理跨聚合的最終一致性。
- 能把 Event Storming 的事件、命令、政策和聚合落成可可靠投遞、冪等、可重播的事件流程。
- 能說明 Service Mesh、應用程式與 broker 各自負責什麼，避免重試、逾時和 telemetry 疊加成新的事故。
- 能把 Agile／Scrum 變成可觀測的交付迴圈，以 DoD、flow metrics、品質門檻和 rollback 控制風險。

## 問題情境與限制條件

你負責一個名為 **Atlas Commerce** 的電商平台。平台原本是模組化單體，最近為了讓庫存、付款和配送團隊獨立部署，逐步加入事件總線與服務網格。一次包含「快速結帳」與「新配送商」的 Sprint 上線後，30 分鐘內出現以下現象：

- Checkout API 的 P99 從 320ms 上升到 4.8s，5xx 和 client timeout 同時增加；應用程式有 3 次 retry，Service Mesh route 又有 3 次 retry，兩者 timeout 也不一致。
- 少數訂單被重複保留庫存，甚至出現 `available < 0`；付款供應商回報同一個 capture request 收到兩次，但平台只在應用 log 中看到一次成功。
- 訂單 read model 偶爾先看到 `InventoryReserved`，數秒後才看到 `OrderPlaced`；另一個查詢以 wall-clock timestamp 排序，跨節點時鐘偏差使狀態看似倒退。
- 事件 envelope 只有 `event_type`、payload 和產生時間，沒有 event ID、aggregate version、causation ID、correlation ID 或 producer context。Order stream 以 `customer_id` 作為 key，retry stream 則沒有 key；consumer 以非同步 worker 平行處理並提前提交 offset。
- Event Storming 工作坊列出 `OrderPlaced`、`PaymentAuthorized`、`InventoryReserved` 和 `ShipmentRequested`，但沒有明確標示哪個是 command、哪個是 policy，也沒有決定付款失敗時由哪個 bounded context 擁有補償狀態。
- Sales、Inventory 和 Fulfillment 共用一個 `Product` model 與一套資料表。Sales 的 Product 關心價格與促銷，Inventory 關心 SKU 與可用量，Fulfillment 關心重量與配送限制；三個團隊都能直接修改欄位。
- `OrderService` 同時包含資料驗證、價格計算、庫存扣減、付款呼叫、事件發布與通知。大量 Getter／Setter 讓任何 Application Service 都能把 `Order.status` 改成任意值；目前沒有一個明確的 aggregate root 來保護狀態轉移。
- Scrum 團隊本 Sprint 承諾 28 個 item，以 velocity 宣稱改善，但 11 個 item 跨 Sprint、DoD 沒有 trace／metrics／rollback 要求，Review 只展示畫面，沒有檢查 P99、duplicate side effect 或資料 parity。

業務不變條件與限制如下：

- 同一筆付款不得重複 capture；庫存不得接受未經授權的超賣；訂單狀態只能依明確的業務轉移或補償事件改變。
- 允許 at-least-once delivery 與 bounded eventual consistency，但不能默默遺失事件；所有重放、補償與人工修復都必須可追蹤。
- 不能以一次性大重寫、全面拆成更多微服務或無限增加 retry／pod 作為唯一方案。既有客戶 API 與租戶隔離必須維持。
- 方案必須能在現有模組化單體中先驗證，再對明確 ownership 的邊界做小流量 canary；每個高風險變更都要有成功指標、警戒線與 rollback 條件。

## 作答要求

請以事故檢討、邊界設計和三階段交付計畫回答：

1. **重建因果與順序**：畫出 `OrderPlaced` 到庫存、付款、配送與 read model 的事件路徑；區分 wall-clock、Lamport／Vector Clock、aggregate version 與 broker offset 各自能回答的問題。指出至少兩個亂序或「看似倒退」的來源。
2. **切出 Bounded Context**：為 Sales、Inventory、Payment、Fulfillment、Notification／Reporting 定義模型語言、資料 owner、輸入／輸出契約與 Context Mapping。說明哪些關係使用 API、事件、ACL 或先留在同一個模組化單體。
3. **保護 Aggregate Invariant**：指定 Order、Inventory Reservation、Payment Attempt 等 aggregate root 與一致性邊界；說明哪些規則必須在一次 transaction 內完成，哪些跨聚合流程可用事件與補償完成。
4. **處理貧血模型與行為責任**：指出目前 `OrderService` 和公開 Setter 的具體風險，把一條狀態轉移或庫存規則移入適當 domain object；說明如何以 characterization／contract test 漸進遷移。
5. **重做 Event Storming 與事件契約**：把至少四個 command、四個 domain event、兩個 policy 和兩個外部 actor 分類；設計 event ID、aggregate ID／version、causation／correlation ID、schema version、producer time 與處理結果欄位。說明 outbox 或等價原子性策略。
6. **修正事件交付**：選擇 partition key，處理 at-least-once、重複、亂序、poison event、retry／DLQ、backpressure、replay 與 reconciliation；說明 offset／ack 何時可以提交，以及如何避免付款與庫存副作用重做。
7. **治理 Service Mesh**：畫出 application、sidecar data plane、control plane、broker 與 upstream 的責任邊界。針對 timeout、retry、circuit breaking、mTLS、trace propagation 和 canary routing 給出單一 owner、上限與停用／回滾條件。
8. **把 Agile／Scrum 接回風險控制**：重新定義 Sprint Goal、DoD、Review 證據、Retrospective 實驗與 WIP；說明為何 velocity 不能取代 lead time、quality、error budget 和 customer outcome。
9. **提出三階段 rollout**：每階段列出至少三項成功指標、兩項警戒線、明確 rollback 條件與資料／事件回復方式；同時列出至少 12 項要收集的 metrics、logs、traces 或故障注入證據。

## 期待證據

- 一張含 event ID、aggregate ID、aggregate version、causation／correlation ID、producer／consumer timestamp 和 broker position 的端到端 trace。
- 物理時間、Lamport 或 Vector Clock 的事件比較結果，能明確指出因果、並發與僅能排序而不能證明因果的情況。
- Event stream 的 partition key、offset／ack、retry／DLQ、consumer concurrency、lag、replay cursor 與 poison event 統計。
- Order、Inventory Reservation、Payment Attempt 的 aggregate invariant 測試、樂觀鎖／版本衝突與交易提交結果。
- Payment capture 的 idempotency key、供應商 request／response、timeout、重試、reconciliation 與 duplicate side-effect 報表。
- Inventory available、reservation ledger、release／compensation event 與 `available < 0` 的 property／concurrency test。
- Context map、資料 owner、API／event schema contract、ACL 轉換和禁止跨上下文直接寫入的檢查。
- 針對 `OrderService` 的 change hotspot、characterization test、domain method contract 與公開 Setter 移除／封裝進度。
- Outbox 寫入與事件發布的 parity、失敗重送、重複消費和資料庫 transaction trace。
- Service Mesh 應用與 proxy 的 request count、retry count、timeout、upstream status、mTLS handshake、配置版本與收斂時間。
- 端到端 P50／P95／P99、5xx、client timeout、queue age、consumer lag、CPU／memory、connection／thread pool 和 error budget。
- 透過故障注入驗證 broker 延遲、consumer crash、重平衡、網路 partition、clock skew、付款 timeout、sidecar 設定錯誤與 client disconnect。
- Scrum 的 Sprint Goal、DoD checklist、cycle／lead time、WIP、blocked time、carry-over、缺陷、返工與 production outcome。
- Canary 的流量比例、租戶／區域範圍、feature flag、資料 parity、事件 replay、補償與 rollback duration。
- 每個階段的停止條件、告警 owner、決策紀錄與可重複的回復演練結果。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議增加 pod、重試或拆更多服務；忽略因果順序、業務 invariant、資料 ownership 和回滾。 |
| 1 | 能說出 DDD、事件驅動、Service Mesh 或 Scrum 名詞，但無法把名詞連到事故中的控制流、責任、證據與失敗語意。 |
| 2 | 能提出部分邊界或事件方案，但至少遺漏 aggregate transaction、重複副作用、順序／版本、mesh retry、Scrum flow 或 rollback 中的一個核心面向。 |
| 3 | 能完成因果與交付路徑，切出 bounded context 和 aggregate，定義事件契約與冪等交付，治理 mesh retry／telemetry，並提出有指標和回滾的三階段方案。 |
| 4 | 除上述內容外，能精準區分因果、並發、wall-clock 與 broker offset，處理 schema／版本／replay／compensation，量化 proxy 與流程成本，並以故障注入、資料 parity、DoD 和 canary evidence 證明方案可逆。 |

### 通過標準

總分達 **3/4 分**才通過；「因果與一致性」、「DDD 邊界與 invariant」、「事件／mesh 交付可靠性」、「Agile／Scrum 與可回滾交付」四個核心面向均不得低於 2 分，且必須提出至少一個可執行的 rollback 條件、至少 12 項可觀測證據，以及付款冪等和庫存不超賣的驗證方法。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先把「事件看到的順序」和「業務事實的因果」分開。wall-clock 只能作為時間參考，不能證明跨節點先後；broker offset 只能描述同一 partition 的交付位置；Lamport Clock 可保證已知的 happened-before 不逆序，但不能辨識並發；Vector Clock 或 aggregate version 才能協助辨識並發衝突與同一 aggregate 的版本順序。因此事件 envelope 至少要有 event ID、aggregate ID、aggregate version、causation ID、correlation ID、schema version 和 producer context。read model 不應用 wall-clock 把狀態重新排序，而應依 aggregate version、明確的狀態轉移和缺口檢查處理。

邊界應依語意與 ownership 切，而不是依共用 `Product` 表切。Sales 擁有價格、促銷與下單語意；Inventory 擁有 SKU、reservation ledger 與可用量；Payment 擁有 payment attempt、capture 和 provider reconciliation；Fulfillment 擁有重量、配送限制和 shipment；Notification／Reporting 只消費穩定事件建立自己的投影。短期可在模組化單體中保留需要同一交易的 Order／Inventory 寫入，但禁止各上下文直接改對方欄位。跨上下文以公開契約或 domain event 整合；舊模型包袱用 ACL 轉換，只有高度同步且共同治理的少量模型才考慮 Shared Kernel。

`Order` 應保護合法狀態轉移，`InventoryReservation` 應保護 reservation 數量不超過 available，`PaymentAttempt` 應以 idempotency key 和 provider reference 保護 capture 不重複。每個 aggregate 只保證自己的 invariant；跨 aggregate 的流程透過 outbox 發出事件，由 consumer 以 event ID／業務 key 去重，並用版本或樂觀鎖拒絕舊事件。付款成功與庫存保留不能假裝是一個跨服務 transaction，應定義失敗狀態、補償事件、人工 reconciliation 與使用者可見狀態。

目前 `OrderService` 同時承擔領域規則、應用協調、外部 I/O 和通知，公開 Setter 又讓任何 caller 繞過規則。可先為狀態轉移建立 domain method 和 characterization test，讓舊 Service 改為載入 aggregate、呼叫方法、提交 transaction；再把價格、reservation、payment orchestration 的責任分開。這樣不需要一次重寫，也能用 contract test 保持既有 API 行為和錯誤語意。

Event Storming 應把 `PlaceOrder`、`ReserveInventory`、`CapturePayment`、`RequestShipment` 標成 commands；把 `OrderPlaced`、`InventoryReserved`、`PaymentCaptured`、`ShipmentRequested` 標成 domain events；把「Whenever OrderPlaced, reserve inventory」和「Whenever PaymentCaptureFailed, release reservation」標成 policies；客戶、付款供應商和配送商是外部 actor。Order transaction 以 outbox 原子寫入事件，publisher 可重送但不能遺失；consumer 先驗證 schema／version，再用 inbox 或唯一鍵去重，失敗事件進 bounded retry 與 DLQ。事件版本、replay、poison event、lag 和 reconciliation 必須成為產品運維的一部分。

同一 aggregate 的事件應使用穩定 aggregate ID 作為 partition key；不要用 customer ID 取代 order ID，也不要讓 retry stream 失去 key。offset／ack 只能在該事件的必要資料寫入、冪等檢查和 side effect 結果已落盤後提交；非同步 worker 必須有明確的完成游標，不能由 poll loop 提前提交。Payment provider 呼叫即使 timeout 也可能已成功，所以要以 idempotency key 重試並以 provider query／reconciliation 收斂；Inventory 要以 reservation ledger、版本檢查與補償避免重複扣減。重試必須有總次數、退避、retry budget、DLQ owner 和人工／自動回補流程。

Service Mesh 的 data plane 只負責實際代理流量，control plane 負責策略、憑證與配置下發；應用程式仍負責業務 timeout、idempotency 和 domain error。每一跳只允許一個 owner 執行有限 retry，通常先禁用應用與 mesh 的重複 retry，為每條路徑設總 deadline、attempt budget 和 circuit breaker。trace 要保留 application span、proxy span、upstream status、retry reason、配置版本和 mTLS identity。canary 先限制在低風險租戶或小比例流量，若 P99、5xx、duplicate capture、`available < 0` 或 trace 缺口超過警戒線就停止並回退配置／流量。

交付方面，Sprint Goal 應是「在不破壞付款與庫存 invariant 的前提下，完成可觀測的訂單事件閉環」，而不是承諾 28 個 item。DoD 要包含 contract／integration／concurrency test、trace／metrics、schema 相容性、告警、runbook、canary 與 rollback drill。Review 展示 production-like evidence，Retrospective 選一個可量測改善實驗。以 lead time、cycle time、WIP、blocked time、變更失敗率、恢復時間、duplicate、projection lag 和 customer outcome 取代單一 velocity。

可分三階段交付。第一階段不切服務：封裝 aggregate invariant、禁止跨上下文直接寫入、補 event envelope、建立 outbox／inbox、端到端 trace 和 duplicate／inventory property test；若沒有完整 trace、資料 parity 或 P99／error budget 惡化即停止。第二階段在模組化單體內以 ACL、事件契約、bounded retry、單一 retry owner 和 mesh canary 驗證，故障注入 broker delay、consumer crash、clock skew、provider timeout 與 sidecar misconfiguration；若 duplicate capture、`available < 0`、事件遺失或 rollback 超時即回退 feature flag 和配置。第三階段才拆出已具 ownership 的 Payment 或 Inventory 邊界，以小比例流量、雙讀／校驗或可重建 projection 過渡；只有在 parity、lag、P99、cost、on-call 和 rollback drill 均達標後才擴大。任何資料修復都保留 event ID、原始版本、操作者和補償原因，不能直接覆寫歷史。

</details>

## 常見失分點

- 用 wall-clock 或 broker offset 宣稱全域因果順序，沒有區分同一 partition 順序、aggregate version 和跨節點並發。
- 把 Bounded Context 當成資料表或服務數量，沒有說明語意、owner、ACL、契約與 transaction 邊界。
- 只說「使用 Aggregate」卻沒有指定 root、invariant、交易範圍、版本衝突和跨聚合補償。
- 把 domain event、command、policy、integration event 混為一談，或沒有 outbox、冪等、版本、DLQ 和 replay 設計。
- 只增加 retry 或 timeout，忽略應用與 mesh 重試疊加、side effect timeout 不代表未執行，以及 retry budget。
- 只看服務網格的 mTLS／流量功能，沒有把 proxy、control plane、upstream、配置版本和應用 trace 串起來。
- 用 velocity 或 Sprint 完成數當成敏捷成功，沒有 DoD、lead time、品質、客戶結果與可回滾證據。
- 以全面微服務或一次性重寫取代模組化、canary、feature flag、資料 parity 和 rollback。

## 延伸追問

1. 如果 Vector Clock metadata 在高 cardinality aggregate 下爆炸，你會改用什麼較窄的版本或因果追蹤策略？如何證明沒有失去需要的衝突偵測？
2. 如果 Sales 和 Inventory 都要求修改 Product 的同一個欄位，你會如何重新命名語意、分配 owner，並設計相容的整合契約？
3. 如果付款 provider 在 timeout 後拒絕查詢結果，但 capture 可能已成功，你如何設計 pending 狀態、重試、人工 reconciliation 與使用者通知？
4. 如果 consumer 只能按 partition 順序處理，但某個 hot order 造成 lag，你會如何在不破壞該 aggregate 順序的前提下改善吞吐？
5. 如果 mesh retry 已經關閉但 P99 仍上升，你會如何區分 sidecar CPU、control-plane 配置、DNS、upstream saturation 與應用慢查詢？
6. 如果產品要求 Sprint 中途加入法規變更，你會如何用 Product Backlog、Sprint Goal、WIP 和風險門檻調整，而不是偷偷增加未完成工作？
