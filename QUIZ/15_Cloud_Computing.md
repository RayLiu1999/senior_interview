# Cloud Computing - 重點考題 (Quick Quiz)

> 這份考題聚焦雲端服務邊界、雲原生原則、IaaS／PaaS／SaaS 與 Serverless 的可靠性取捨。

## ☁️ Cloud Architecture

<a id="q1"></a>
### Q1: AWS 核心服務如何選型？
<!-- Concept ID: concept.cloud.aws.service-boundaries; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請比較 EC2、ECS、Lambda、S3、RDS、SQS 與 CloudFront 的責任邊界、適用 workload、可用性與成本取捨。

<details>
<summary>💡 答案提示</summary>

- 先依計算、儲存、資料庫、訊息與邊緣傳遞分類，再看服務提供的 durability、scaling、操作責任與 quota；不能只以「託管程度」選型。
- 服務選型要綁定流量型態、延遲、資料一致性、故障域、合規、可攜性與團隊維運能力；同一個產品可能需要多種服務組合。
- 事故診斷要分清服務本身故障、quota／throttling、網路路由、權限與下游容量，並以指標、事件與 request trace 驗證。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Cloud_Computing/aws_core_services.md)

<a id="q2"></a>
### Q2: 12-Factor 原則如何支援雲原生可靠性？
<!-- Concept ID: concept.cloud.native.twelve-factor; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請從設定、依賴、日誌、程序、無狀態、可拋棄性與環境一致性說明它們如何影響部署、擴縮與故障恢復。

<details>
<summary>💡 答案提示</summary>

- 設定外置、依賴明確、日誌輸出到事件流、程序無狀態且可快速替換，能降低環境漂移並支援水平擴展。
- 無狀態不代表系統沒有狀態；session、檔案與資料應交給明確的外部服務，並定義其一致性、持久性與故障邊界。
- 發布事故要檢查 config drift、版本／artifact、state recovery、termination behavior 與 health signal，不只看程序是否啟動。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Cloud_Computing/cloud_native_12_factors.md)

<a id="q3"></a>
### Q3: IaaS、PaaS、SaaS 應如何比較責任與選型？
<!-- Concept ID: concept.cloud.service-model.responsibility; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請比較三種服務模式由供應商與使用者負責的範圍，並說明合規、可攜性、客製化與運維成本的取捨。

<details>
<summary>💡 答案提示</summary>

- 服務模式是責任分配，不是「越託管越好」；使用者仍要負責資料、身份、設定、存取政策與業務正確性。
- IaaS 提供較大控制權但維運面較廣；PaaS 減少平台操作但受 runtime／版本限制；SaaS 交付最快但客製化、資料遷移與供應商依賴較高。
- 事故與遷移要先確認 authoritative data、export／backup、SLA、exit plan、版本相容與責任矩陣，避免把供應商責任當成自身不用驗證。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Cloud_Computing/iaas_paas_saas.md)

<a id="q4"></a>
### Q4: Serverless 如何處理 cold start、並發與重試？
<!-- Concept ID: concept.cloud.serverless.event-architecture; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明事件驅動、cold start、concurrency limit、timeout、retry、dead-letter 與冪等如何共同影響可靠性與成本。

<details>
<summary>💡 答案提示</summary>

- Serverless 免除伺服器管理，但不會消除容量、排隊、下游限制與故障恢復問題；並發放大時要先保護下游。
- retry 可能將暫時故障轉成重試風暴，handler 必須冪等，並以 backoff、dead-letter、最大重試次數與可觀測事件控制副作用。
- 評估方案要同時看 cold-start latency、duration、error rate、concurrency、queue age、下游 saturation 與單次請求成本。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Cloud_Computing/serverless_architecture.md)
