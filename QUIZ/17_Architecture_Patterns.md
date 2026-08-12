# Architecture Patterns - 重點考題 (Quick Quiz)

> 這份考題聚焦 DI、Strategy、Observer、Proxy 與 OCP，重點是判斷變化軸、可靠性與抽象成本，而不是背 GoF 名稱。

## 🧩 Extensible Backend Design

<a id="q1"></a>
### Q1: Dependency Injection 如何改善解耦與可測試性？
<!-- Concept ID: concept.patterns.dependency-injection.testability; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較 constructor injection、container、composition root 與 service locator，並說明生命週期與測試隔離。

<details>
<summary>💡 答案提示</summary>

- DI 把依賴建立與組合移到外部，讓核心服務依賴介面或明確契約；composition root 負責 wiring，service locator 則容易隱藏依賴。
- 依賴的 scope 要和資源生命週期一致；singleton、request scope、transient 混用可能造成狀態共享、leak 或 concurrency 問題。
- 測試應能注入 fake／stub，並驗證 wiring、runtime config、啟動錯誤與實際 dependency health，而不是只讓單元測試通過。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Design_Patterns_and_Principles/dependency_injection.md)

<a id="q2"></a>
### Q2: 什麼情況適合使用 Strategy Pattern？
<!-- Concept ID: concept.patterns.strategy.extensibility; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請以付款、定價或路由為例，說明何時應把條件分支拆成可替換策略，以及如何治理策略選擇。

<details>
<summary>💡 答案提示</summary>

- 當一組演算法有穩定契約、變化頻繁且需要獨立測試時，Strategy 能把 context 與具體演算法分開；少量且穩定的分支不必為了模式而抽象。
- 策略選擇要有明確的版本、feature／tenant scope、fallback、audit 與 metrics，避免新策略默默接管全量流量。
- 評估不只看程式碼行數，還要看新增抽象、註冊、錯誤處理、觀測與組合測試的成本。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Design_Patterns_and_Principles/strategy_pattern.md)

<a id="q3"></a>
### Q3: Observer／Pub-Sub 如何避免事件通知拖垮主流程？
<!-- Concept ID: concept.patterns.observer.event-decoupling; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請比較同步 observer 與非同步 event bus，並說明重試、冪等、順序、背壓與 subscriber isolation。

<details>
<summary>💡 答案提示</summary>

- 同步通知會把 subscriber 延遲與失敗傳回 publisher；非同步方式能隔離延遲，但引入 queue、重試、duplicate、ordering 與最終一致性。
- 事件要有穩定 schema、event ID、producer／consumer version 與明確 delivery 語意；consumer 必須冪等，失敗要進有限重試或 dead-letter。
- 觀測 lag、handler latency、drop、retry、duplicate 與 queue depth，並為慢或失控 subscriber 設定隔離與容量上限。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Design_Patterns_and_Principles/observer_pattern.md)

<a id="q4"></a>
### Q4: Proxy 如何承載授權、快取與其他橫切關注點？
<!-- Concept ID: concept.patterns.proxy.access-control; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明 protection、caching、remote 與 virtual proxy 的差異，以及如何避免 proxy 隱藏錯誤或破壞一致性。

<details>
<summary>💡 答案提示</summary>

- Proxy 應維持與 subject 相容的契約，再控制存取、延遲建立、快取或遠端呼叫；每個橫切行為都要有清楚責任與失敗語意。
- 授權 proxy 不能取代 resource-level policy；cache proxy 要定義 freshness、invalidation、key、敏感資料隔離與 stale 行為。
- 遠端 proxy 要有 timeout、circuit breaker、trace propagation 與重試邊界，避免把網路故障偽裝成一般 domain error。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Design_Patterns_and_Principles/proxy_pattern.md)

<a id="q5"></a>
### Q5: OCP 如何在擴展性與過度設計之間取得平衡？
<!-- Concept ID: concept.patterns.solid.ocp-change-isolation; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明變化軸、穩定抽象、extension point 與何時不應該抽象，並以變更風險說明判斷依據。

<details>
<summary>💡 答案提示</summary>

- OCP 不是「永遠不修改」，而是讓已穩定的核心不必因可預期變化反覆修改；先找真正的變化軸，再決定抽象邊界。
- Strategy、DI、Proxy 等模式可以成為 extension point，但過早抽象會增加 indirection、測試矩陣、認知負擔與錯誤路徑。
- 應以變更頻率、回歸風險、部署／測試成本、團隊能力與實際需求驗證抽象是否值得，而非用模式數量衡量設計品質。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Design_Patterns_and_Principles/solid_ocp.md)

<a id="q6"></a>
### Q6: Command 如何把請求變成可治理的變更單位？
<!-- Concept ID: concept.patterns.command.request-encapsulation; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請以訂單操作或背景工作為例，說明 command 與 strategy 的差異，以及佇列、重試、撤銷和冪等如何影響設計。

<details>
<summary>💡 答案提示</summary>

- Command 封裝的是「要做什麼與其輸入」，可被排程、記錄或重試；Strategy 著重在同一責任下替換演算法。
- 重試必須有 idempotency key、狀態轉移和 dead-letter 邊界；Undo 不等於資料庫 transaction rollback，需定義逆向操作的業務語意。
- 命令 handler 應能以 fake receiver 和明確 transaction boundary 測試，避免 invoker 直接依賴具體細節。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Design_Patterns_and_Principles/command_pattern.md)

<a id="q7"></a>
### Q7: Abstract Factory 何時能避免產品家族錯配？
<!-- Concept ID: concept.patterns.abstract-factory.product-family-consistency; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

當系統同時支援多個 provider 或產品版本時，請比較 Abstract Factory、Factory Method 與直接建構的變更隔離和測試成本。

<details>
<summary>💡 答案提示</summary>

- Abstract Factory 的價值在於一次選定相容的產品家族，避免把不同 provider 的元件混用；它不是所有建立邏輯的預設入口。
- 若變化只有單一產品類型，Factory Method 或直接注入通常更簡單；產品維度增加時，抽象工廠也會擴大介面變更面。
- composition root 應負責選擇家族，測試應驗證家族相容性、版本 fallback 和啟動 wiring。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Design_Patterns_and_Principles/abstract_factory_pattern.md)

<a id="q8"></a>
### Q8: Decorator 與繼承如何在橫切關注點上取捨？
<!-- Concept ID: concept.patterns.decorator.composable-behavior; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請設計一組可組合的授權、metrics、cache 或 retry wrapper，說明順序、失敗語意與可測試性。

<details>
<summary>💡 答案提示</summary>

- Decorator 以相同契約包住 component，適合沿穩定變化軸疊加行為；順序會改變 timeout、cache、authorization 和 metrics 的語意。
- 每層應有單一責任、明確是否重試和是否吞例外的規則，避免重複計費、重複寫入或把錯誤藏起來。
- 用單層 contract test 和組合測試驗證 wrapper 順序、取消、資源釋放與 tracing propagation。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Design_Patterns_and_Principles/decorator_pattern.md)

<a id="q9"></a>
### Q9: ISP 如何以 client 變更原因拆分介面？
<!-- Concept ID: concept.patterns.solid.isp.interface-segregation; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

面對一個同時被查詢端、管理端和批次 worker 使用的胖介面，請說明拆分依據、相容策略與驗證方式。

<details>
<summary>💡 答案提示</summary>

- 以 client 的使用能力與變更原因切分角色介面，不要只按方法數量或類別名稱切割。
- 先保留 adapter 或 facade 避免一次破壞 consumer，再逐步遷移；介面越小不代表抽象越少，仍需管理版本和認知成本。
- 用 compile impact、consumer contract test、mock 使用量和實際變更歷史評估拆分是否降低耦合。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Design_Patterns_and_Principles/solid_isp.md)

<a id="q10"></a>
### Q10: Adapter 如何隔離外部契約變化而不掩蓋語意？
<!-- Concept ID: concept.patterns.adapter.compatibility-boundary; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明支付、訊息或第三方 API 的 adapter 應如何處理資料轉換、錯誤、timeout、重試與版本相容。

<details>
<summary>💡 答案提示</summary>

- 內部 port 擁有穩定的 domain 語意，adapter 負責外部格式、錯誤分類和 transport 細節；不可把外部成功碼直接當成業務成功。
- timeout、retry、rate limit 和 idempotency 要在 adapter 與 use case 之間明確分工，避免重試不可重入的操作。
- 以 provider contract test、sandbox／故障注入、metrics 和 feature flag 驗證切換與退場。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Design_Patterns_and_Principles/adapter_pattern.md)

<a id="q11"></a>
### Q11: Hexagonal Architecture 如何證明 port 與 adapter 不是空洞分層？
<!-- Concept ID: concept.patterns.hexagonal.ports-adapters; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請以資料庫或外部服務替換為例，說明 domain、application、port、adapter 和 composition root 的依賴方向與測試證據。

<details>
<summary>💡 答案提示</summary>

- 核心政策不依賴 transport 或 persistence；driving adapter 呼叫 input port，driven adapter 實作 output port。
- port 必須描述業務語意與交易邊界，不應只是把 ORM／HTTP API 原封不動搬進 domain。
- 用 in-memory unit test、adapter contract test 和少量 end-to-end test 證明替換真的不需改核心規則。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Design_Patterns_and_Principles/hexagonal_architecture.md)

<a id="q12"></a>
### Q12: Singleton 何時是共享資源，何時只是隱藏的全域狀態？
<!-- Concept ID: concept.patterns.singleton.shared-state-lifecycle; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請評估一個 process-wide cache、client 或設定物件是否應使用 singleton，並說明並發、租戶隔離、測試和 shutdown 風險。

<details>
<summary>💡 答案提示</summary>

- 先確認共享需求、生命週期和 ownership，再決定使用 DI-managed singleton、明確 cache 或其他資源管理方式；`sync.Once` 只解決初始化一次。
- 可變全域狀態會污染測試、跨租戶共享資料並放大 concurrency 問題；資源也需要 close、刷新和容量上限。
- 測試應能重置或注入 fake，並觀察 hit rate、memory、連線、shutdown 和租戶隔離。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Design_Patterns_and_Principles/singleton_pattern.md)

<a id="q13"></a>
### Q13: Chain of Responsibility 如何治理順序與短路？
<!-- Concept ID: concept.patterns.chain-of-responsibility.pipeline-composition; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請以 HTTP middleware 或風控 pipeline 為例，說明 handler 順序、短路、後置處理、timeout 和錯誤邊界。

<details>
<summary>💡 答案提示</summary>

- 要能重建 onion／pipeline 控制流：誰先進入、誰呼叫下一層、誰處理結果，以及短路後哪些步驟不可執行。
- authorization、rate limit、logging、exception 和 transaction 的順序應由契約與風險決定，不能靠註冊順序猜測。
- 以帶 request ID 的 trace、response state、順序 contract test 和故障注入防止 handler drift。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Design_Patterns_and_Principles/chain_of_responsibility.md)

<a id="q14"></a>
### Q14: DIP 的抽象應由哪一側擁有？
<!-- Concept ID: concept.patterns.solid.dip.dependency-inversion; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請以訂單服務依賴支付、資料庫或訊息 broker 為例，說明高層政策、port、adapter、DI container 與 composition root 的責任。

<details>
<summary>💡 答案提示</summary>

- 高層政策定義穩定的業務抽象，低層細節實作它；DIP 不等於把所有類別都包成介面或把依賴藏在 service locator。
- composition root 負責 wiring、生命週期和啟動失敗；核心邏輯應能注入 fake 進行測試。
- 驗證不只看 unit test，也要檢查 runtime graph、scope、health check、contract test 和替換成本。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Design_Patterns_and_Principles/solid_dip.md)

<a id="q15"></a>
### Q15: Template Method 的固定流程何時應改成組合？
<!-- Concept ID: concept.patterns.template-method.inheritance-skeleton; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請比較以繼承提供流程骨架與以 Strategy／pipeline 組合步驟，並說明 hook 失敗、LSP 和測試的影響。

<details>
<summary>💡 答案提示</summary>

- Template Method 適合骨架穩定、步驟順序受控且變化點有限的流程；繼承會把父類別不變條件與子類別綁在一起。
- 若步驟需獨立替換、重排或由不同團隊演進，組合通常更能隔離變更；不要為了抽象而保留不必要的 hook。
- 以契約測試驗證步驟順序、資源清理、取消和失敗後置行為。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Design_Patterns_and_Principles/template_method_pattern.md)

<a id="q16"></a>
### Q16: SRP 如何用變更原因界定責任？
<!-- Concept ID: concept.patterns.solid.srp.change-reasons; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

一個 service 同時處理驗證、計價、持久化、通知和報表時，請說明如何判斷拆分邊界以及何時不應拆分。

<details>
<summary>💡 答案提示</summary>

- SRP 關注同一 actor／變更原因，不是把每個方法搬到獨立類別；要保留必要的 transaction 和 domain invariant。
- 以變更歷史、依賴圖、測試 setup、部署 ownership 和回歸風險判斷拆分收益。
- 拆分後需補 integration／contract test，避免把原本清楚的流程變成跨模組不可觀測的 choreography。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Design_Patterns_and_Principles/solid_srp.md)

<a id="q17"></a>
### Q17: Builder 如何保護有效狀態並控制 API 複雜度？
<!-- Concept ID: concept.patterns.builder.construct-valid-state; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請比較 Builder、factory、functional options 與直接建構，說明可選參數、預設值、驗證和相容性如何影響選擇。

<details>
<summary>💡 答案提示</summary>

- Builder 適合多步設定且要在 build 時保護 invariant；少量穩定參數不必引入額外層次。
- 預設值、互斥欄位和錯誤應是明確的，不要讓「建出來但不可用」的狀態流入 domain。
- 測試應覆蓋有效／無效組合與舊呼叫端相容性，並觀察 API 認知成本。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Design_Patterns_and_Principles/builder_pattern.md)

<a id="q18"></a>
### Q18: LSP 如何從行為契約而不是類別階層判斷？
<!-- Concept ID: concept.patterns.solid.lsp.substitutability; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請分析一個子型別改變錯誤、前置條件或副作用的案例，說明何時應改用組合或 adapter。

<details>
<summary>💡 答案提示</summary>

- 替代實作不能收窄 caller 可依賴的前置條件、放寬後置結果或破壞不變量與錯誤語意。
- 「是某種」的名義關係不足以支撐繼承；若行為不相容，應用更窄的介面、組合或明確 adapter 表達差異。
- 用 consumer contract、property／mutation test 和真實失敗案例驗證，而不是只看編譯器接受繼承。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Design_Patterns_and_Principles/solid_lsp.md)

<a id="q19"></a>
### Q19: Factory Method 如何只抽出真正的建立變化軸？
<!-- Concept ID: concept.patterns.factory-method.creation-extension; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請以 provider、訊息格式或儲存實作為例，說明工廠方法與直接建構、抽象工廠、Builder 的取捨。

<details>
<summary>💡 答案提示</summary>

- 工廠方法把建立者的穩定流程與具體產品選擇分開，適合產品類型是主要變化軸的情境。
- 若只有一個穩定實作，直接注入較清楚；若產品家族需保持相容，應考慮 Abstract Factory；若重點是配置有效性，Builder 更合適。
- 選擇與註冊應在 composition root，並以 wiring、未知 provider、fallback 和 contract test 驗證。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Design_Patterns_and_Principles/factory_method_pattern.md)

<a id="q20"></a>
### Q20: 水平擴展何時已進入分散式系統取捨？
<!-- Concept ID: concept.architecture.scaling.horizontal-distribution; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明把單一 Web server 擴成多副本後，session、快取、冪等、資料庫和故障處理會發生什麼變化。

<details>
<summary>💡 答案提示</summary>

- 水平擴展不只是加機器；共享狀態、負載平衡、重試、重複請求、cache invalidation 和資料一致性都成為分散式問題。
- 先量測瓶頸與故障域，將可外移狀態和不可外移的 transaction invariant 分開，不要用 sticky session 永久掩蓋設計問題。
- 以 node loss、duplicate request、cache stale、資料庫限流和 P99／error budget 壓測驗證。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Software_Architecture/horizontal_scaling_vs_distributed_systems.md)

<a id="q21"></a>
### Q21: 單體進入水平擴展階段前需要哪些前提？
<!-- Concept ID: concept.architecture.evolution.horizontal-scaling-stage; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請設計一個從單體到多副本的 rollout，涵蓋 session、cache、queue、database、部署與 rollback。

<details>
<summary>💡 答案提示</summary>

- 先建立無狀態邊界、健康檢查、集中式或可重建狀態、冪等和觀測；不是先開更多副本再追事故。
- 每個狀態元件都要說明 ownership、失效語意、容量上限和一致性需求，並限制 migration blast radius。
- 以 canary、traffic split、P99、error rate、queue age、cache hit rate 和 database saturation 設定回滾條件。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Software_Architecture/evolution_stage_2_horizontal_scaling.md)

<a id="q22"></a>
### Q22: CAP 應如何連到實際業務不變條件？
<!-- Concept ID: concept.architecture.cap.partition-tradeoff; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

在 partition、timeout 或 replica lag 下，請為庫存、社群貼文或報表選擇一致性與可用性策略，並說明證據。

<details>
<summary>💡 答案提示</summary>

- CAP 的討論前提是網路 partition；要先說清楚 consistency 的語意、availability 的服務承諾和故障模型。
- 庫存扣減等 invariant 可能選擇保守拒絕，貼文讀取則可接受 stale；quorum、fencing、timeout 和補償需對應業務風險。
- 以 fault injection、read／write trace、stale window、成功率和資料修復時間驗證，而非只貼 AP／CP 標籤。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Software_Architecture/cap_theorem.md)

<a id="q23"></a>
### Q23: CQRS 何時值得承擔讀寫分離的複雜度？
<!-- Concept ID: concept.architecture.cqrs.read-write-separation; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請以高讀低寫、複雜查詢或協作領域為例，說明 command、query、read model、投影延遲與 read-your-own-write。

<details>
<summary>💡 答案提示</summary>

- CQRS 是責任分離，不必然等於兩個服務或兩個資料庫；先確認讀寫模型和品質屬性真的不同。
- 非同步投影要處理事件重複、順序、落後、重建、schema version 和使用者剛寫入的讀取語意。
- 以投影 lag、rebuild time、query latency、write correctness、operational cost 和 rollback 驗證收益。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Software_Architecture/cqrs_pattern.md)

<a id="q24"></a>
### Q24: Event Sourcing 如何讓狀態可重建而不變成不可治理的事件垃圾場？
<!-- Concept ID: concept.architecture.event-sourcing.audit-replay; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請設計事件版本、順序、快照、重播、投影重建、隱私刪除與修正流程，並比較一般 audit log 的差異。

<details>
<summary>💡 答案提示</summary>

- 事件溯源把不可變 business facts 當作 source of truth；audit log 可能只是狀態變更旁路，兩者的重建能力不同。
- 必須定義 aggregate ordering、idempotency、upcaster／version、snapshot、poison event、replay isolation 和資料治理。
- 以從事件重建狀態與 read model 的 parity、replay duration、duplicate handling、schema migration 和 recovery drill 驗證。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Software_Architecture/event_sourcing_pattern.md)

<a id="q25"></a>
### Q25: 何時應從多副本單體進入分散式或微服務階段？
<!-- Concept ID: concept.architecture.evolution.distributed-stage; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請從 bounded context、資料 ownership、團隊邊界、部署頻率、故障域和網路成本提出拆分或不拆分的決策。

<details>
<summary>💡 答案提示</summary>

- 微服務不是效能升級按鈕；若沒有清楚 ownership、獨立發布或故障隔離需求，拆分只會增加分散式協調成本。
- 先以 modular monolith、strangler、outbox、contract test 和可回滾資料遷移降低風險，避免跨服務雙寫成為新核心。
- 決策應有 latency、deploy lead time、incident blast radius、team cognitive load 和 rollback time 證據。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Software_Architecture/evolution_stage_3_distributed_architecture.md)

<a id="q26"></a>
### Q26: 架構模式如何依品質屬性選擇而不是背清單？
<!-- Concept ID: concept.architecture.patterns.selection-tradeoffs; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

面對一個要提升可部署性、擴展性、可測試性和故障隔離的系統，請比較分層、事件驅動、微核心、微服務與 space-based 的取捨。

<details>
<summary>💡 答案提示</summary>

- 先列出 workload、資料邊界、SLO、團隊和運維限制，再選模式；可混用，但每個組合都會引入新的耦合與故障語意。
- 事件驅動帶來非同步與最終一致性，微服務帶來網路和資料 ownership，space-based 解決特定狀態／流量瓶頸而非所有問題。
- 用 ADR、容量模型、故障注入、成本、可觀測性和退場條件驗證，而不是用模式數量判斷成熟度。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Software_Architecture/common_software_architecture_patterns.md)

<a id="q27"></a>
### Q27: 為什麼應先把單體模組化，再決定是否拆成服務？
<!-- Concept ID: concept.architecture.evolution.monolith-boundary; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明單體在 MVP 與複雜領域中的優勢，並提出從單體到多副本或服務化的判斷證據與安全順序。

<details>
<summary>💡 答案提示</summary>

- 單體可提供低延遲本地呼叫、單一交易和快速驗證；問題通常是模組邊界、部署耦合或容量，而不是「單體」名稱本身。
- 先以 domain boundary、依賴圖、團隊 ownership、變更頻率和瓶頸證據決定模組化、水平擴展或拆分。
- 演進需保留 observability、canary、資料回填、contract test、feature flag 和 rollback，避免一次跨越多個故障域。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Software_Architecture/evolution_stage_1_monolith.md)

<a id="q28"></a>
### Q28: Repository 與 Factory 如何共同保護 Aggregate 邊界？
<!-- Concept ID: concept.ddd.repository-factory-boundary; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請區分 Repository、Factory、Aggregate 與 application service 的責任，並說明如何避免 persistence model、ORM、transaction 與測試替身滲入 domain invariant。

<details>
<summary>💡 答案提示</summary>

- Factory 負責在建立時驗證必要條件與 invariant；Repository 負責依 domain identity 取得或保存 aggregate，不能繞過 aggregate 直接修改內部狀態。
- transaction boundary 應包住一次完整的 domain decision 與 repository unit of work；reconstitution 可使用專用方法，但仍要驗證版本、identity 與不變條件。
- 以 domain contract test、fake／integration test、optimistic concurrency 與 persistence mapping test 證明 adapter 沒有把 ORM 欄位或 lazy loading 變成 domain API。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Domain_Driven_Design/repository_and_factory_patterns.md)
