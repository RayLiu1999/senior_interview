# Testing - 重點考題 (Quick Quiz)

> 這份考題聚焦測試分層、測試邊界、故障注入、效能與安全品質，適合在閱讀 Testing 專題文章後做快速回憶與口頭自測。

## 🧪 Testing Strategy and Quality

<a id="q1"></a>
### Q1: 混沌工程如何在可控風險下建立韌性信心？
<!-- Concept ID: concept.testing.chaos-engineering; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請從穩態假設、故障注入、爆炸半徑、停止條件、可觀測性與 rollback 說明混沌實驗的設計。

<details>
<summary>💡 答案提示</summary>

- 先定義可量化的穩態指標與假設，再選擇最小爆炸半徑和可逆的延遲、斷線、節點或依賴故障。
- 實驗必須有 kill switch、權限隔離、停止條件、值班人員與資料正確性檢查，不能把隨機破壞當成混沌工程。
- 用 error rate、latency、recovery time、資料一致性與使用者影響證據判斷假設，並把發現轉成修復和回歸測試。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Testing/chaos_engineering.md)

<a id="q2"></a>
### Q2: 契約測試如何避免微服務間的破壞性變更？
<!-- Concept ID: concept.testing.contract-testing; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較 consumer-driven contract、provider verification、schema validation 與端對端測試，並說明版本 promotion。

<details>
<summary>💡 答案提示</summary>

- 契約記錄 consumer 真正依賴的 request／response 行為，provider 必須在自己的版本上驗證；schema 通過不代表語意與錯誤行為都相容。
- 要管理契約版本、provider state、相容性規則、broker 讀寫權限與 deploy gate，讓 consumer 和 provider 能獨立交付。
- 失敗診斷要比對契約 diff、consumer expectation、provider response、部署版本與實際流量，而不是直接重試或跳過閘門。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Testing/contract_testing.md)

<a id="q3"></a>
### Q3: 整合測試的邊界與可信證據如何定義？
<!-- Concept ID: concept.testing.integration-testing; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明整合測試應保留哪些真實依賴，如何管理資料與清理，以及如何區分測試本身 flake 和依賴的真實故障。

<details>
<summary>💡 答案提示</summary>

- 先界定服務、資料庫、快取、訊息或 HTTP 邊界；只替換不在本測試責任內的依賴，不能把所有依賴 mock 掉後仍稱為整合測試。
- 測試資料要可隔離、可重建、可清理，並控制時間、並行、重試與外部服務版本，使失敗可重現。
- 使用 trace、依賴 log、資料狀態、transaction、timing 與環境指標定位，避免以增加 retry 掩蓋真正的整合問題。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Testing/integration_testing.md)

<a id="q4"></a>
### Q4: 性能測試如何從數字推導容量與修復決策？
<!-- Concept ID: concept.testing.performance-testing; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請比較 load、stress、spike、soak，並說明如何用 percentile latency、throughput、錯誤率與資源指標找出瓶頸。

<details>
<summary>💡 答案提示</summary>

- 工作負載要接近真實流量、資料分布、讀寫比例與依賴成本，並先定義 SLO、容量上限與停止條件。
- 平均值不足以描述尾端延遲；要同時看 p50／p95／p99、throughput、error rate、CPU、memory、GC、DB pool、queue 與 downstream latency。
- 結果需可重現、可比較，並以逐步放量、保護 production、容量預留與 rollback 轉成可操作決策。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Testing/performance_testing.md)

<a id="q5"></a>
### Q5: 回歸測試如何處理變更風險與測試 flake？
<!-- Concept ID: concept.testing.regression-testing; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請從變更範圍、風險導向選擇、coverage 限制、flake 分類與 release／rollback 閘門說明策略。

<details>
<summary>💡 答案提示</summary>

- 依 diff、依賴圖、風險與關鍵使用者旅程選擇 smoke、targeted、full regression 和 canary，不是每次都盲跑全部。
- Coverage 是未觸及程式碼的訊號，不等於行為正確；要搭配 mutation、缺陷逃逸、歷史失敗與生產 telemetry。
- Flake 要保留原始失敗、分類原因、隔離與修復期限；不能無限 retry、刪除測試或把不穩定測試當成通過。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Testing/regression_testing.md)

<a id="q6"></a>
### Q6: 安全性測試如何從威脅模型落到 DevSecOps 品質閘門？
<!-- Concept ID: concept.testing.security-testing; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請比較 threat modeling、SAST、DAST、dependency scan、fuzzing、滲透測試與安全回歸的時機和證據。

<details>
<summary>💡 答案提示</summary>

- Threat modeling 先決定資產、信任邊界、攻擊者與高風險路徑，再選擇對應的掃描、負向測試、fuzz、滲透和回歸方法。
- 工具 finding 需要去重、驗證、風險分級、修復 owner、例外期限與可重現證據；不能把掃描數量直接當安全品質。
- Release gate 要保留取證並有 fail／rollback 條件，驗證修復沒有轉移到 SQLi、XSS、headers、password 或授權的另一個邊界。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Testing/security_testing.md)

<a id="q7"></a>
### Q7: TDD 與 BDD 如何共同產生可維護的測試信號？
<!-- Concept ID: concept.testing.tdd-bdd; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較紅綠重構、共同語言、驗收場景與單元／整合測試邊界，並說明如何避免測試只追求 coverage。

<details>
<summary>💡 答案提示</summary>

- TDD 以可執行的失敗測試驅動小步實作與重構；BDD 將焦點放在跨角色共同理解的行為與可觀察結果。
- BDD 場景不應取代所有單元測試；可用少量關鍵驗收／整合案例連結需求，再用 TDD 補足邊界與內部規則。
- 好的測試應有清楚失敗訊息、穩定資料與適當抽象，能在重構後保留行為信心而不綁死實作細節。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Testing/tdd_vs_bdd.md)

<a id="q8"></a>
### Q8: 測試金字塔應如何依風險而非固定比例調整？
<!-- Concept ID: concept.testing.pyramid; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請比較單元、整合、契約、端對端與非功能測試在速度、成本、隔離、定位與信心上的取捨。

<details>
<summary>💡 答案提示</summary>

- 金字塔是回饋與風險的設計原則，不是所有專案都要遵守固定百分比；測試層級應對應缺陷類型與系統邊界。
- 底層測試通常快且定位準，中層驗證真實整合與契約，頂層只保留少量關鍵旅程；效能、混沌與安全測試可視風險形成額外維度。
- 要以執行時間、flake rate、缺陷逃逸、定位成本與 release evidence 持續調整，不以 coverage 單一數字決策。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Testing/testing_pyramid.md)

<a id="q9"></a>
### Q9: 單元測試中的 Mock、Stub、Fake 與 Spy 應如何選擇？
<!-- Concept ID: concept.testing.unit-testing-mocking; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明測試替身的責任、行為／狀態驗證、錯誤與重試邊界，以及如何避免過度 mock 造成虛假的信心。

<details>
<summary>💡 答案提示</summary>

- Stub 提供預設輸入或結果，mock 驗證互動，fake 提供可運作的簡化實作，spy 記錄呼叫；選擇取決於被測單元的責任與需要的證據。
- 優先驗證公開行為、狀態與錯誤處理，避免斷言私有呼叫順序或每個實作細節；重要的資料庫、HTTP 與契約行為要由更高層測試補足。
- 觀察 failure message、coverage／mutation、依賴互動與 flake 歷史，確認測試失敗時真的能指出風險，而不是只讓 suite 變綠。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Testing/unit_testing_and_mocking.md)
