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
