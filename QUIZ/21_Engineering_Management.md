# Engineering Management - 重點考題 (Quiz)

> 這份考題聚焦於資深工程師如何在跨團隊交付、事故學習、人才培養與技術領導之間建立可持續的決策和影響力。
>
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

## Delivery and Leadership Foundations

### Q1: Cross-Team Influence and Delivery Trade-offs
<!-- Concept ID: concept.engineering-management.cross-team.influence-delivery; Learning Objective IDs: concept.engineering-management.cross-team.influence-delivery/LO-1, concept.engineering-management.cross-team.influence-delivery/LO-2, concept.engineering-management.cross-team.influence-delivery/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

當產品 deadline、工程品質與上下游依賴互相衝突時，如何在沒有正式職權的情況下促成決策並維持交付可信度？

<details>
<summary>💡 答案提示</summary>

- 先對齊 customer outcome、不可違反的品質／安全條件、decision owner 與依賴事實，再把 scope、time、resource、risk 拆成可比較的選項。
- 每個選項都要有假設、成本、影響、owner、期限、驗證指標和 escalation path；用短期可逆方案換取學習，不用模糊承諾掩蓋風險。
- 會議後留下 decision record、API／交付契約和 follow-up，讓不同團隊能並行工作而不是依賴口頭共識。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Engineering_Management/cross_team_collaboration.md)

### Q2: Incident Learning and Blameless Postmortems
<!-- Concept ID: concept.engineering-management.incident-learning.postmortem; Learning Objective IDs: concept.engineering-management.incident-learning.postmortem/LO-1, concept.engineering-management.incident-learning.postmortem/LO-2, concept.engineering-management.incident-learning.postmortem/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

如何從一次生產事故建立可信時間線、執行 blameless postmortem，並讓改善項目真的降低下一次事故的機率與恢復成本？

<details>
<summary>💡 答案提示</summary>

- 事故中先指定 incident commander、communications lead、operations／scribe，建立影響範圍、時間線、假設、決策和使用者溝通節奏。
- Postmortem 應區分觸發事件、促成條件、偵測／防護／回復控制缺口，不把「某人按錯」當作根因；每項 action 要有 owner、期限、優先級、預期風險下降和驗證證據。
- 以演練、告警、runbook、測試、變更門檻和 error budget 回測改善是否有效，並在新事故或演練中檢查 action 是否真的被使用。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Engineering_Management/incident_management_postmortem.md)

### Q3: Mentoring and Team Growth
<!-- Concept ID: concept.engineering-management.mentoring-team-growth; Learning Objective IDs: concept.engineering-management.mentoring-team-growth/LO-1, concept.engineering-management.mentoring-team-growth/LO-2, concept.engineering-management.mentoring-team-growth/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

如何在交付壓力下讓新人或成長中的工程師承擔真實 ownership，同時維持品質、安全與心理安全感？

<details>
<summary>💡 答案提示</summary>

- 依能力和風險選擇任務，定義「可獨立決策」與「必須 review／escalate」的邊界，使用 pairing、design review、small batch 和明確的 Definition of Done。
- Feedback 要針對觀察到的行為與影響，包含下一步練習和回饋時間點；不要用一次失誤固定成員的能力標籤。
- 高風險變更可讓新人負責準備與執行受控步驟，由資深者守住 approval、canary、監控和 rollback，讓 ownership 與安全邊界同時成長。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Engineering_Management/mentoring_and_team_growth.md)

### Q4: Technical Leadership and Influence
<!-- Concept ID: concept.engineering-management.technical-leadership.influence-tradeoffs; Learning Objective IDs: concept.engineering-management.technical-leadership.influence-tradeoffs/LO-1, concept.engineering-management.technical-leadership.influence-tradeoffs/LO-2, concept.engineering-management.technical-leadership.influence-tradeoffs/LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

技術領導者如何在沒有直接管理權時，將架構與技術債議題轉換成可理解的商業決策，並推動可逆、可驗證的執行？

<details>
<summary>💡 答案提示</summary>

- 不只陳述「技術上比較好」，而是說明 customer impact、failure mode、成本、時間、可逆性、維運負擔與不做的機會成本。
- 提供現況、選項、推薦、證據、未知數、decision owner 和 review date；邀請異議並記錄哪些 trade-off 被接受。
- 用 architecture principles、small rollout、metrics、guardrail 與 rollback 將共識轉成行動，再以結果更新方向而不是靠職位強推。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Engineering_Management/technical_leadership_and_influence.md)

### Q5: Waterfall、Agile 與 Hybrid 應如何依風險選擇？
<!-- Concept ID: concept.engineering-management.delivery-model-waterfall; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請比較 waterfall、iterative、agile 與 hybrid 在需求不確定性、合規、依賴、回饋速度與變更成本上的取捨，並提出可驗證的交付節奏。

<details>
<summary>💡 答案提示</summary>

- Waterfall 將階段、輸入、approval 與交付物排成較固定的依賴鏈，適合需求與治理邊界穩定的情境，但晚期回饋會放大變更成本。
- Agile 以短週期增量取得回饋，並不代表放棄設計、文件或品質；hybrid 可將合規與架構 gate 固定化，同時讓可變需求以迭代方式驗證。
- 用 decision record、risk burn-down、lead time、缺陷、變更失敗率、回滾時間與 customer outcome 檢查模型是否有效，而不是只看是否遵守流程名稱。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Software_Development_Models/waterfall_model.md)

### Q6: Hiring interview 如何提高 signal 並降低 bias？
<!-- Concept ID: concept.engineering-management.hiring-interviewing; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請設計一個 senior engineer 的結構化面試 loop，說明 competency rubric、evidence、calibration、candidate experience 與 hiring decision 的 ownership。

<details>
<summary>💡 答案提示</summary>

- 先由職能與團隊需要定義可觀察的 competency，再讓每個 interview stage 只負責有限的 signal，使用相同問題骨架與行為錨點降低 interviewer variance。
- 評估筆記應記錄具體行為、推理、限制與影響，不把「感覺適合」或單一強項替代整體證據；面試後做獨立評分再 calibration，避免權威或第一印象污染。
- 清楚分離 interviewer recommendation、hiring manager decision、reference／background check 與 onboarding feedback，持續用 quality、drop-off、time-to-hire 與新人成效回顧流程。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Engineering_Management/hiring_and_interviewing.md)

### Q7: Agile project management 如何把速度、品質與負荷放在同一個決策框架？
<!-- Concept ID: concept.engineering-management.agile-delivery; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

當 backlog 持續膨脹、跨團隊依賴增加且 production incident 上升時，請說明如何調整 priority、WIP、iteration、capacity、風險與 rollback。

<details>
<summary>💡 答案提示</summary>

- 先把 outcome、must-not-break 的品質條件、依賴、unplanned work 與容量透明化，再按價值、風險、成本與可逆性排序，而不是用 velocity 直接承諾更多。
- 限制 WIP、縮小 batch、保留 hardening／incident capacity，讓每個 increment 都有 Definition of Done、觀測、owner 與可回滾路徑。
- 追蹤 cycle time、blocked time、deployment frequency、change failure rate、恢復時間、缺陷與團隊負荷，將數據用於調適而非個人績效排名。

</details>

📖 [查看完整答案](../05_Specialized_Topics/Engineering_Management/project_management_agile.md)

## 學習進度檢核

| 評估項目 | 自評 |
| :--- | :---: |
| 能把跨團隊衝突轉成有證據的交付選項 | ⬜ |
| 能主持 incident 並把 postmortem 變成控制改善 | ⬜ |
| 能在 guardrail 下培養新人 ownership | ⬜ |
| 能以技術證據影響決策並維持可逆性 | ⬜ |

**建議**：四題都能回答後，再進入 [AI／Engineering Management Delivery Incident](./Hard_Assessments/ai_management_delivery_incident.md) 做跨主題實戰。
