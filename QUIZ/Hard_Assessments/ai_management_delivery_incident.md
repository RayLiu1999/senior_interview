# AI／Engineering Management Delivery Incident：從模型品質到團隊決策

- **Assessment ID**: `assessment.ai-management.delivery-incident.v1`
- **主要 Concept ID**: `concept.ai.mlops-llmops.evaluation-release-operations`
- **次要 Concept IDs**:
  - `concept.ai.prompt.version-cost-safety-controls`
  - `concept.ai.rag.retrieval-generation-quality`
  - `concept.ai.ai-engineer.production-capability-map`
  - `concept.engineering-management.cross-team.influence-delivery`
  - `concept.engineering-management.incident-learning.postmortem`
  - `concept.engineering-management.mentoring-team-growth`
  - `concept.engineering-management.technical-leadership.influence-tradeoffs`
- **對應文章**:
  - [MLOps 與 LLMOps](../../05_Specialized_Topics/AI_Engineering/mlops_and_llmops.md)
  - [Prompt Engineering 基礎與進階](../../05_Specialized_Topics/AI_Engineering/prompt_engineering_basics.md)
  - [RAG 核心原理](../../05_Specialized_Topics/AI_Engineering/rag_fundamentals.md)
  - [AI Engineer 必備技能](../../05_Specialized_Topics/AI_Engineering/required_skills_for_ai_engineer.md)
  - [跨團隊協作](../../05_Specialized_Topics/Engineering_Management/cross_team_collaboration.md)
  - [Incident Management 與 Postmortem](../../05_Specialized_Topics/Engineering_Management/incident_management_postmortem.md)
  - [Mentoring 與 Team Growth](../../05_Specialized_Topics/Engineering_Management/mentoring_and_team_growth.md)
  - [Technical Leadership 與 Influence](../../05_Specialized_Topics/Engineering_Management/technical_leadership_and_influence.md)
- **題型**: `AI 生產事故診斷`、`RAG 評測`、`Prompt／成本／安全治理`、`MLOps 部署與漂移`、`Incident Learning`、`跨團隊影響力`、`人才培養`、`技術領導`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 60 分鐘
- **標籤**: `MLOps`, `LLMOps`, `RAG`, `Evaluation`, `Prompt Versioning`, `Token Cost`, `Prompt Injection`, `Model Drift`, `Rollback`, `Incident Management`, `Postmortem`, `Cross-Team Collaboration`, `Mentoring`, `Technical Leadership`
- **Learning Objective IDs**:
  - `concept.ai.mlops-llmops.evaluation-release-operations/LO-1`
  - `concept.ai.mlops-llmops.evaluation-release-operations/LO-2`
  - `concept.ai.mlops-llmops.evaluation-release-operations/LO-3`
  - `concept.ai.prompt.version-cost-safety-controls/LO-1`
  - `concept.ai.prompt.version-cost-safety-controls/LO-2`
  - `concept.ai.prompt.version-cost-safety-controls/LO-3`
  - `concept.ai.rag.retrieval-generation-quality/LO-1`
  - `concept.ai.rag.retrieval-generation-quality/LO-2`
  - `concept.ai.rag.retrieval-generation-quality/LO-3`
  - `concept.ai.ai-engineer.production-capability-map/LO-1`
  - `concept.ai.ai-engineer.production-capability-map/LO-2`
  - `concept.ai.ai-engineer.production-capability-map/LO-3`
  - `concept.engineering-management.cross-team.influence-delivery/LO-1`
  - `concept.engineering-management.cross-team.influence-delivery/LO-2`
  - `concept.engineering-management.cross-team.influence-delivery/LO-3`
  - `concept.engineering-management.incident-learning.postmortem/LO-1`
  - `concept.engineering-management.incident-learning.postmortem/LO-2`
  - `concept.engineering-management.incident-learning.postmortem/LO-3`
  - `concept.engineering-management.mentoring-team-growth/LO-1`
  - `concept.engineering-management.mentoring-team-growth/LO-2`
  - `concept.engineering-management.mentoring-team-growth/LO-3`
  - `concept.engineering-management.technical-leadership.influence-tradeoffs/LO-1`
  - `concept.engineering-management.technical-leadership.influence-tradeoffs/LO-2`
  - `concept.engineering-management.technical-leadership.influence-tradeoffs/LO-3`

## 測驗目標

- 能從 RAG retrieval、生成品質、引用與權限證據建立可重現的 AI 評估基線。
- 能管理 prompt／model／provider／retriever／資料集版本，控制 token 成本、輸出安全與 prompt injection 風險。
- 能設計 MLOps／LLMOps 的 canary、漂移偵測、部署驗證、fallback 與 rollback，而不是只增加流量或重試。
- 能在事故中建立指揮、溝通、決策與時間線，將 blameless postmortem 轉成有 owner 和驗證證據的改善。
- 能以跨團隊影響力處理 deadline、依賴、品質與風險 trade-off，並在 guardrail 下培養成員的 ownership。
- 能把技術選項、商業結果、團隊學習與可逆交付整合成分階段計畫。

## 問題情境與限制條件

你是 **Atlas Support AI** 的 Staff Engineer。這個多租戶平台提供客服問答、文件摘要與工單分流，架構包含文件 ingestion、embedding／vector retrieval、RAG generation、prompt registry，以及一個預測工單優先級的傳統 ML 模型。團隊由 AI Platform、Support Product、Security、SRE、Data Science 和 Customer Operations 組成；你沒有直接管理所有團隊，但需要在本次事故中協調決策。

團隊為了配合季度發布，在一週內同時推出以下變更：

- LLM provider 從已驗證的高品質模型切換到較低成本模型，並把 prompt 從 `v6` 改成 `v7`。`v7` 將完整對話、最多 20 個 chunk 和較長的輸出上限送給模型，但 prompt registry 沒有把 provider、retriever、embedding 與評估集版本綁在同一個 release record。
- RAG ingestion 改用新的 chunking 與 embedding model；舊文件仍使用舊 embedding，部分租戶的 index 在背景重建。為降低延遲，ANN 搜尋候選數和 reranker budget 同時下調。
- 工單優先級模型從 `risk-v3` 部署 `risk-v4`，先以 30% 流量 canary。部署前只有離線 AUC，沒有校準、分租戶／分語言切片，也沒有 shadow traffic 和可一鍵回復的 feature schema artifact。
- Product、Data Science 和 Platform 在發布前各自以不同的 dashboard 判斷「準備完成」；沒有一個共同的 quality／safety／cost gate，也沒有指定誰能在 disagreement 時停止發布。

發布後 45 分鐘內發生以下現象：

- RAG `recall@10` 從 0.84 降至 0.58，citation correctness 從 0.93 降至 0.71；文件 freshness lag 從 8 分鐘升至 70 分鐘。某租戶的測試查詢在回答中顯示了另一個租戶文件的標題，雖然尚未證實完整內容已返回。
- Prompt `v7` 讓平均 input token 從 2,900 增至 8,700，單次成本上升 2.4 倍；P95 從 1.5 秒升至 6.2 秒，Provider 429 和 timeout 增加。Gateway、應用 service 與 SDK 各自都有 retry，沒有共用 retry budget；streaming client disconnect 後上游請求仍繼續。
- Safety 評估只測正常問題，沒有測 prompt injection、惡意文件、跨租戶 ACL、敏感資料遮罩或工具輸出。線上出現兩次回答遵循文件內「忽略系統規則」的指令，客服因此暫停自動回覆。
- `risk-v4` 的一個語言切片 false negative 上升，該切片的輸入 feature 分布與訓練資料明顯偏移；整體 AUC 仍看似正常。回切需要重新載入舊 feature schema，但 registry 沒有保存完整相依 artifact。
- Support Product 要求「先維持發布，否則錯過季度承諾」；Security 要求立即關閉受影響的 RAG 流量；Platform 建議增加 worker 和 timeout；Data Science 認為應先完成新 embedding rebuild；SRE 反映沒有明確 incident commander、告警 owner 或回滾 runbook。
- 一名剛加入團隊三個月的工程師負責串接 prompt registry 和 canary 設定。PR 有 review，但 review checklist 沒有要求版本 lineage、ACL test 或 rollback drill。事故討論中有人直接把責任歸咎於該工程師，其他成員因此不願報告更多疑似異常。

限制條件如下：

- 不得以關閉 tenant／ACL 隔離、停用安全檢查、永久提高 timeout、無限重試或單純增加 worker 作為唯一修復。
- 必須保留已接受請求的可追溯性、客戶資料隔離、成本上限與工單優先級的可解釋性；不能用未評估的模型作為透明 fallback。
- 團隊只有兩週可完成第一輪修復，無法一次重寫整個 AI platform；任何資料、prompt、模型或流程變更都要有 owner、觀測指標、停止條件和可回復路徑。
- 第一階段先降低安全、成本與錯誤風險，第二階段才進行 embedding／index 與模型容量調優；所有決策需能在事後由時間線和版本證據重現。

## 作答要求

1. **建立事故時間線與因果鏈**：區分已知證據、合理假設與待驗證項目，說明 prompt／token、provider retry、RAG recall／freshness、model drift、資源容量和團隊決策如何互相放大。
2. **設計 RAG evaluation**：定義 indexing、retrieval、reranking、context、generation、citation、freshness 與 ACL／safety 的離線和線上指標，並說明評估集如何涵蓋多租戶、多語言、拒答與 prompt injection。
3. **治理 prompt、版本與成本**：提出 prompt／model／provider／retriever／embedding／資料集的 release lineage，定義每請求、每租戶與全域 token／cost budget、cache、輸出 schema 和單一 retry owner。
4. **處理安全邊界**：說明如何隔離 user input、retrieved document、tool output 和 system instruction，驗證 prompt injection、敏感資料、跨租戶 title／content 洩漏與輸出 policy。
5. **設計 MLOps／LLMOps 部署**：為 `risk-v4` 與 RAG／prompt 變更提出 shadow、canary、分租戶／分語言切片、drift、quality、cost、latency、error 與 rollback 策略；說明如何修復 artifact registry 缺口。
6. **執行 incident command**：指定 incident commander、technical lead、communications、scribe、Security／SRE／Product 聯絡人，建立事件分級、決策 log、對外訊息、狀態更新與停止發布條件。
7. **處理跨團隊 trade-off**：針對「維持發布、關閉流量、先重建資料或先止血」提出至少三個選項，列出範圍、時間、成本、風險、品質門檻、owner 與 escalation path。
8. **完成 blameless postmortem**：區分觸發事件、促成條件、控制缺口與偶然因素，提出至少 8 個有 owner、期限、優先級、驗證方法的 action items，並說明如何確認 action 真的有效。
9. **設計 mentoring 與 team growth**：在不讓新人暴露於無 guardrail 高風險變更的前提下，安排其參與修復、pairing、review、runbook 和演練，說明如何提供具體 feedback 並逐步增加 ownership。
10. **提出三階段可逆交付**：每階段列出變更、成功指標、警戒線、rollback 條件、資料／prompt／模型回復方式與故障注入；說明如何讓技術領導決策被團隊和利害關係人接受。

## 期待證據

- 一份帶有 request／trace ID、tenant、prompt／model／provider、retriever／embedding／index、資料集與 artifact version 的端到端 lineage 和時間線。
- RAG 評估報告：recall@k、precision／MRR、reranker hit rate、context token、answer faithfulness、citation correctness、拒答率、freshness、P95/P99 與成本。
- tenant／ACL、prompt injection、惡意文件、敏感資料與輸出 schema 的測試結果；能證明權限是在檢索與返回邊界生效，而不是事後刪文字。
- Provider request／response、input／output token、429／timeout、retry attempt、Retry-After、cancellation、cache hit、per-tenant budget 與 attempt/request ratio。
- `risk-v3`／`risk-v4` 的 feature schema、模型 artifact、訓練資料切片、漂移分數、calibration、false negative、shadow／canary 結果與可重現的 rollback。
- 部署 gate 與 release record，能回答「誰在什麼版本、用什麼資料、何時批准、以哪個指標放量或停止」。
- Incident timeline、角色表、決策紀錄、使用者影響、狀態更新、告警 owner、runbook 和 recovery／rollback drill 結果。
- Blameless postmortem 的促成因素樹、action item owner／期限／優先級、驗證證據與未完成項目的風險接受決策。
- 跨團隊 decision record，列出 Product、Security、SRE、Data Science、Platform 的目標衝突、選項、被接受的 trade-off 和 escalation。
- 新人修復任務的 scope、review／pairing 節點、可獨立決策邊界、feedback 紀錄與下一個成長目標。
- 分階段 rollout 的流量比例、feature flag、品質／安全／成本 guardrail、停止條件、回復時間與故障注入報告。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議換模型、增加 worker、提高 timeout 或責怪個人；沒有評估、隔離、incident command、漂移或 rollback。 |
| 1 | 能列出 RAG、prompt、MLOps、postmortem 或 leadership 名詞，但無法把名詞連到事故證據、責任邊界、團隊決策和可執行控制。 |
| 2 | 能指出部分品質／成本／漂移問題並提出修復，但遺漏至少兩個核心面向，例如 ACL／安全、版本 lineage、incident learning、cross-team trade-off、mentoring 或 rollback。 |
| 3 | 能建立完整時間線，分層評估 RAG 與模型，治理 prompt／成本／安全，提出 canary／drift／rollback，並用 incident command、postmortem、協作和培養方案推動三階段交付。 |
| 4 | 除上述內容外，能量化 retry amplification 和成本，區分 retrieval／generation／safety 失敗，處理 artifact 不完整的復原，設計可驗證的組織控制，並以故障注入、canary 證據和 blameless learning 證明方案可持續。 |

### 通過標準

總分達 **3/4 分**才通過；「AI 品質／評估／安全」、「LLMOps／MLOps 可靠性與回滾」、「Incident Learning 與跨團隊交付」、「Mentoring 與技術領導」四個核心面向均不得低於 2 分，且答案必須提出至少一項 tenant／ACL 安全驗證、至少一項 prompt／model／data rollback 條件、至少一份 incident owner／決策紀錄，以及至少 8 個有 owner 和驗證方法的改善項目。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先止血，再建立能重現的證據。第一時間指定 incident commander，讓 Product、Security、SRE、Data Science、Platform 和 Customer Operations 各有聯絡人；scribe 維護時間線與決策 log，communications lead 統一對外訊息。已知事實是 recall、citation、freshness、token、成本、P95、429、drift 和跨租戶標題事件同時惡化；prompt injection 造成不安全行為、完整內容是否洩漏、provider retry 的實際放大倍數與 drift 的根因仍要用 trace、抽樣和重現測試驗證。不能在證據不足時把責任歸給負責串接的新人。

RAG 評估要分層。Indexing 檢查文件版本、chunk、embedding model／dimension、寫入成功率和 freshness；retrieval 以 ground-truth query 計算 recall@k、precision、MRR／nDCG、候選數和 P95/P99；reranking 和 context 層檢查相關性、去重、token budget、引用覆蓋率；generation 層檢查 correctness、faithfulness、citation correctness、拒答率、格式與延遲；安全層測 prompt injection、惡意文件、敏感資料、tenant／ACL 隔離和工具邊界。離線資料集要有多語、長問題、最新文件、拒答、權限差異和對抗樣本，線上則用分層抽樣與人工／規則檢查，保留可遮罩的候選 ID、版本和決策證據。

版本控制要把 prompt `v7`、model／provider、retriever config、embedding／index、資料集、評估結果和部署 artifact 綁在同一個 release record；任何一項改變都產生新版本，不能依賴散落 dashboard。prompt、retrieved document、user input 和 tool output 應分層標記與驗證，模型輸出不能直接成為 ACL 或商業規則。對每請求、租戶與全域設定 token／cost hard cap、context／output budget、admission control、cache policy 和一個 retry owner；只對可重試錯誤使用有限 backoff／jitter，傳遞 cancellation，並記錄 attempt/request ratio。安全違規、cross-tenant suspicion、cost 或 P99 越過警戒線時，先切回上一個已驗證的 prompt／provider 組合和 RAG namespace。

MLOps 的 `risk-v4` 不應只看整體 AUC。要檢查 feature schema、訓練資料和 artifact 是否完整，按語言、租戶、工單類型檢查 calibration、false negative、precision／recall 和 drift；先 shadow，再以小比例 canary，保留 `risk-v3` 作為可比對的 baseline。若無法完整回復 v4 的 feature schema，應停止放量並使用已驗證的 v3 或安全的人工分流，而不是假設模型權重足夠。LLMOps 也要對模型、prompt、retriever 和成本／品質指標設同樣的 release gate，保留舊版本、namespace 和 deployment config。

跨團隊決策可以列出三個選項：A 是立即停止受影響租戶的自動 RAG 回答並回切已驗證 provider／prompt，安全最高但客服容量下降；B 是保留低風險查詢，以小比例切回並強制 ACL、拒答和成本 gate，較能維持業務但需要快速驗證；C 是維持目前發布並只增加資源，時間最短但無法降低安全與品質風險，應明確標為不接受或僅在短暫緊急窗口使用。由 incident commander 依既定 safety／SLO guardrail 做決策，Product 接受範圍改變，Security 擁有安全停止權，SRE 擁有可靠性回滾權，所有 trade-off 記入 decision record。

Postmortem 要描述「同時改 model、prompt、index、embedding 和流程」造成的變更耦合、沒有共同 gate、artifact registry 不完整、多層 retry、ACL 測試缺失、drift slice 沒被觀測、runbook／rollback 未演練、review checklist 不完整、跨團隊 dashboard 定義不一致和心理安全不足。action item 應包含：建立 release lineage、RAG／safety eval gate、單一 retry policy、成本 quota、ACL／injection regression、embedding migration contract、model drift／calibration dashboard、可重建 artifact、canary／rollback drill、incident role checklist、decision log template、以及新人高風險變更的 pairing／approval guardrail。每項要有 owner、期限、優先級、風險下降假設與驗證事件；若 action 沒有被演練或指標改善，就不能只標成完成。

Mentoring 不應把新人排除在事故之外，也不應讓新人獨自承擔不可逆變更。可讓其負責建立 prompt／artifact lineage、補測試或撰寫 runbook，先以 pairing、small batch、design review 和 canary dashboard 交付；資深者保留 release approval、ACL／safety sign-off 和 rollback decision。feedback 應指出具體行為與影響，例如「checklist 沒涵蓋 artifact 相依性，導致回切無法重現」，再約定下一次由新人主導 review、演練和結果回顧，逐步擴大 ownership。

可分三階段交付。第一階段在數小時內停止不安全流量、回切已驗證 prompt／provider／risk model、關閉重複 retry、傳遞 cancellation、套用檢索邊界 ACL、設成本 cap 和建立 incident roles；若安全事件、跨租戶違規、成本或 P99 未下降即維持封鎖。第二階段在兩週內補 release registry、RAG／safety／drift 評估、artifact restore、單一 retry、canary、postmortem action 與 mentoring guardrail；以固定資料集、故障注入、shadow 和低比例流量驗證，任何 recall、citation、false negative、成本或 rollback duration 超線就回退。第三階段才調整 embedding／index、模型路由和容量，並按語言／租戶逐步放量。每次變更只改一個主要變因，保留舊 namespace／model／prompt、資料回復步驟和決策證據，讓技術方向可逆且可學習。

</details>

## 常見失分點

- 只說換回舊模型或增加 worker，沒有拆出 RAG retrieval、generation、safety、成本和資料新鮮度的不同失敗。
- 把 prompt、模型、embedding、index、資料集和部署設定分散管理，卻沒有 release lineage、owner 和可重現 rollback。
- 只用整體 AUC 或平均回答品質，忽略分語言／分租戶 drift、citation correctness、ACL、prompt injection 和 tail latency。
- 先取全域 top-k 再在應用層刪除未授權內容，或把 LLM 輸出當成權限／商業規則的決策來源。
- 讓 gateway、service、SDK 各自重試，忽略 retry amplification、成本上限、Retry-After、cancellation 和部分完成語意。
- 把 incident postmortem 寫成責任歸屬或單一 action，沒有促成因素、owner、期限、驗證和後續演練。
- 以「保護新人」為由排除其學習，或讓新人在沒有 approval、canary 和 rollback 的情況下獨自執行高風險變更。
- 用職位或聲量壓過 Product、Security、SRE、Data Science 的異議，沒有 decision record、共同指標和 escalation path。
- 一次同時改模型、prompt、index、資料 pipeline 和容量，沒有單變因、shadow／canary、停止條件和可逆交付。

## 延伸追問

1. 如果 offline RAG recall 變好但線上 citation correctness 變差，你會如何區分 chunk、reranker、context 組裝、模型先驗和評估集偏差？
2. 如果兩個 Provider 的 tokenization、上下文上限和安全政策不同，release lineage 和 fallback contract 應如何設計？
3. 如果成本 hard cap 在 streaming 中途觸發，如何處理取消、部分回答、使用者訊息、計費與 trace 完整性？
4. 如果新 embedding model 必須不停機切換，你會如何安排雙寫、namespace、雙讀、recall／ACL 驗證和回復？
5. 如果整體模型指標穩定但少數語言的 false negative 惡化，你會如何設 drift、slice gate、人工升級與放量政策？
6. 如果 Product 要求恢復流量而 Security 尚未完成所有測試，你會如何設低風險範圍、明確 guardrail、決策 owner 和 review 時間？
7. 如果新人提出的修復方案正確但表達不被資深團隊接受，你會如何用 pairing、design doc 和 evidence review 建立影響力？
8. 如果 postmortem action 一再延期，你會如何把它接回 roadmap、error budget、季度目標與管理層的風險接受決策？
