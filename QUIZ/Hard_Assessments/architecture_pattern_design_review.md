# Extensible Order Platform Design Review：從模式選擇到變更風險

- **Assessment ID**: `assessment.patterns.extensible-order-platform.v1`
- **主要 Concept ID**: `concept.patterns.solid.ocp-change-isolation`
- **次要 Concept IDs**:
  - `concept.patterns.dependency-injection.testability`
  - `concept.patterns.strategy.extensibility`
  - `concept.patterns.observer.event-decoupling`
  - `concept.patterns.proxy.access-control`
- **對應文章**:
  - [Dependency Injection 與 IoC](../../03_System_Design_and_Architecture/Design_Patterns_and_Principles/dependency_injection.md)
  - [Strategy Pattern](../../03_System_Design_and_Architecture/Design_Patterns_and_Principles/strategy_pattern.md)
  - [Observer Pattern](../../03_System_Design_and_Architecture/Design_Patterns_and_Principles/observer_pattern.md)
  - [Proxy Pattern](../../03_System_Design_and_Architecture/Design_Patterns_and_Principles/proxy_pattern.md)
  - [SOLID OCP](../../03_System_Design_and_Architecture/Design_Patterns_and_Principles/solid_ocp.md)
- **題型**: `設計審查`, `可擴展性`, `可靠性診斷`, `取捨分析`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 35 分鐘
- **標籤**: `Design Patterns`, `SOLID`, `Dependency Injection`, `Strategy`, `Observer`, `Proxy`, `Extensibility`
- **Learning Objective IDs**:
  - `concept.patterns.solid.ocp-change-isolation/LO-1`
  - `concept.patterns.solid.ocp-change-isolation/LO-2`
  - `concept.patterns.solid.ocp-change-isolation/LO-3`
  - `concept.patterns.dependency-injection.testability/LO-1`
  - `concept.patterns.dependency-injection.testability/LO-2`
  - `concept.patterns.dependency-injection.testability/LO-3`
  - `concept.patterns.strategy.extensibility/LO-1`
  - `concept.patterns.strategy.extensibility/LO-2`
  - `concept.patterns.strategy.extensibility/LO-3`
  - `concept.patterns.observer.event-decoupling/LO-1`
  - `concept.patterns.observer.event-decoupling/LO-2`
  - `concept.patterns.observer.event-decoupling/LO-3`
  - `concept.patterns.proxy.access-control/LO-1`
  - `concept.patterns.proxy.access-control/LO-2`
  - `concept.patterns.proxy.access-control/LO-3`

## 測驗目標

- 能從需求變化、依賴圖、事件流、權限路徑、測試證據與 runtime 指標判斷設計問題。
- 能選擇 DI、Strategy、Observer、Proxy 或直接的條件分支，並說明何時不應套用模式。
- 能以 OCP 的變化軸與穩定抽象隔離付款、定價、通知、授權與外部 provider 的變更。
- 能處理模式引入後的生命週期、事件可靠性、快取一致性、遠端失敗、可觀測性與回滾。

## 問題情境與限制條件

某訂單平台原本只有一種付款方式與單一通知渠道，最近要在兩個季度內加入多個支付 provider、租戶定價規則、Email／SMS／Webhook 通知，以及管理員操作的審計與權限控制。現有程式碼由一個巨大 service 以 switch／if-else 決定付款、折扣與通知，直接建立資料庫、HTTP client 與 message publisher；測試需要啟動真實外部服務。

團隊提出一次導入所有 GoF 模式、全域 DI container、同步 Observer、Proxy 快取與大量抽象介面的方案。設計審查期間已觀察到：某些通知 handler 變慢會延長 checkout、同一付款請求在 retry 後被送到兩個 provider、cache 未區分租戶、測試環境的 singleton 狀態會互相污染，且新策略尚未有獨立的版本與回滾開關。

限制：不能只列出模式定義，也不能以「全部改成微服務」或「導入大型框架」作答；必須把模式與變化軸、故障邊界、測試成本、資料正確性與團隊維運能力連結，並提出可分階段交付的方案。

## 作答要求

1. **建立設計診斷**：畫出目前 checkout、provider、pricing、notification、repository、cache 與 audit 的依賴／事件關係，列出至少十項證據或測試來確認耦合與故障來源。
2. **找出變化軸**：分別判斷付款、定價、通知、授權與外部依賴應使用 Strategy、Observer、Proxy、DI、OCP extension point 或保持簡單分支，並說明理由。
3. **設計組合與生命週期**：說明 composition root、介面邊界、scope、timeout、取消、錯誤傳播、重試與 resource ownership，避免 service locator 或共享 singleton 狀態污染。
4. **設計事件與橫切防護**：提出事件 schema、event ID、冪等、順序、backpressure、subscriber isolation、授權、cache key／freshness 與 remote proxy 的 failure policy。
5. **分階段交付**：定義先導入哪些抽象、如何保留舊路徑、如何以 feature／tenant rollout、metrics、contract test 與 rollback 降低變更風險。
6. **驗證修復**：列出至少十項單元、契約、整合、負載、故障注入或設計規則測試，證明新 provider 不會重複扣款、慢通知不會拖垮 checkout、cache 不會跨租戶污染且測試可隔離。

## 期待證據

- 能指出 OCP 要先針對實際變化軸建立穩定抽象，不是把每個類別都包成 interface；能說明過度設計的測試與維運成本。
- 能用 constructor injection／composition root 隔離外部依賴，避免 service locator、隱藏依賴與共享 singleton 狀態造成測試污染。
- 能將付款／定價選擇與 Strategy 的契約、版本、fallback、冪等與 rollout 綁在一起，而不是只把 switch 搬到另一個檔案。
- 能把 Observer 的同步／非同步語意、事件 ID、重試、順序、dead-letter、背壓與 subscriber isolation 說清楚。
- 能區分 Proxy 的授權、快取、遠端與 lazy 行為，處理 cache tenant key、stale data、timeout、trace 與錯誤邊界。
- 能以 checkout latency、provider success、duplicate payment、notification lag、cache hit／isolation、test flake、change failure rate 與 rollback time 驗證設計。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 方案會增加重複扣款、跨租戶資料污染或不可測試的共享狀態，且無法說明模式與問題的關係。 |
| 1 | 能背出 DI、Strategy、Observer、Proxy、OCP 名稱，但沒有變化軸、故障語意、資料正確性或交付計畫。 |
| 2 | 能提出部分模式與介面拆分，但遺漏事件可靠性、生命週期、快取隔離、遠端失敗或過度設計取捨中的至少一項。 |
| 3 | 能完成變化軸分析、適當模式組合、DI 與事件／proxy failure policy、分階段 rollout 及可量化驗證。 |
| 4 | 除上述內容外，能處理跨模式交互失敗、provider unknown outcome、事件 schema 演進、快取一致性、團隊認知成本與可逆的架構遷移。 |

### 通過標準

總分達 **3/4 分**才通過；change isolation／pattern selection、reliability／failure boundaries、delivery／evidence 三個核心面向均不得低於 2 分。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先把目前的 switch、直接 new 外部 client、同步 notification 與共享 cache 的因果拆開，量測 checkout critical path、provider request／response、notification handler latency、cache key、test setup 與 audit。付款結果未知時不能因 retry 直接切換 provider 或重扣；每筆付款要有 operation ID、冪等處理與狀態查詢。

以變化軸選模式：付款與定價若有穩定契約且演算法持續增加，可用 Strategy；但要把 provider selection、版本、fallback、timeout、rollback 與 metrics 一起設計。DI 應在 composition root 組合 repository、provider、publisher 與 clock，讓核心服務可注入 fake；避免全域 service locator 和測試間共享 mutable singleton。OCP 應用在已觀察到的穩定邊界，不應預先為所有未來需求建立深層抽象。

通知若不需要阻塞 checkout，應用有界 queue 或 outbox／event flow，事件帶 event ID、schema version 與 order ID，consumer 冪等並有有限 retry、dead-letter、lag 與 subscriber isolation。同步 observer 只適合低成本、同一交易邊界且失敗語意明確的通知。Proxy 可用於授權、cache 或 remote client，但要明確 tenant-aware key、freshness、timeout、trace、circuit breaker 與錯誤傳播，不能讓 proxy 隱藏重要業務決策。

交付上先替一個 provider 或一種 pricing rule 建立契約與 contract test，保留舊路徑並以 tenant／feature rollout；觀察成功率、duplicate payment、checkout P99、notification lag、cache isolation 與 change failure，再逐步擴展。用故障注入驗證慢 subscriber、provider timeout、cache stale、DI scope、event duplicate、schema compatibility、rollback 與測試隔離，確保架構變更可逆。

</details>

## 常見失分點

- 把每一個類別都抽象成 interface，卻沒有指出實際變化軸與抽象成本。
- 只把巨大 switch 搬到 Strategy registry，沒有處理 provider unknown outcome、冪等、版本與 rollout。
- 使用同步 Observer 讓慢通知阻塞 checkout，或非同步後完全忽略 duplicate、ordering、dead-letter 與背壓。
- Proxy 加了 cache 或權限卻沒有 tenant-aware key、freshness、timeout、trace 與 resource-level policy。
- 全域 DI container 或 singleton 共享 mutable state，導致測試污染與 runtime scope 錯誤。

## 延伸追問

1. 如果新的支付 provider 只支援非同步回呼，你會如何調整 Strategy 契約與 order／payment state machine？
2. 如果通知事件 schema 必須同時支援兩個版本的 consumer，如何設計相容與淘汰流程？
3. 如果 proxy cache 命中率很高但租戶偶爾看到錯誤資料，你會如何取證、止血與重建 cache？
4. 如果團隊只有三人且需求變化很少，哪些模式會先不導入？你會用什麼證據重新評估？
