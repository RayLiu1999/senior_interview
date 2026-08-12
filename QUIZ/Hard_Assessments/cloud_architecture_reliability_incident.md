# Cloud Architecture Reliability Incident：從服務選型到 Serverless 故障恢復

- **Assessment ID**: `assessment.cloud.architecture.reliability-incident.v1`
- **主要 Concept ID**: `concept.cloud.aws.service-boundaries`
- **次要 Concept IDs**:
  - `concept.cloud.native.twelve-factor`
  - `concept.cloud.service-model.responsibility`
  - `concept.cloud.serverless.event-architecture`
- **對應文章**:
  - [AWS 核心服務概覽](../../04_Infrastructure_and_DevOps/Cloud_Computing/aws_core_services.md)
  - [雲原生架構 12 要素](../../04_Infrastructure_and_DevOps/Cloud_Computing/cloud_native_12_factors.md)
  - [IaaS、PaaS、SaaS](../../04_Infrastructure_and_DevOps/Cloud_Computing/iaas_paas_saas.md)
  - [Serverless 架構設計與應用](../../04_Infrastructure_and_DevOps/Cloud_Computing/serverless_architecture.md)
- **題型**: `架構選型`, `故障診斷`, `容量與成本取捨`, `恢復設計`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 35 分鐘
- **標籤**: `Cloud`, `AWS`, `Serverless`, `12-Factor`, `Reliability`, `Capacity`, `Cost`
- **Learning Objective IDs**:
  - `concept.cloud.aws.service-boundaries/LO-1`
  - `concept.cloud.aws.service-boundaries/LO-2`
  - `concept.cloud.aws.service-boundaries/LO-3`
  - `concept.cloud.native.twelve-factor/LO-1`
  - `concept.cloud.native.twelve-factor/LO-2`
  - `concept.cloud.native.twelve-factor/LO-3`
  - `concept.cloud.service-model.responsibility/LO-1`
  - `concept.cloud.service-model.responsibility/LO-2`
  - `concept.cloud.service-model.responsibility/LO-3`
  - `concept.cloud.serverless.event-architecture/LO-1`
  - `concept.cloud.serverless.event-architecture/LO-2`
  - `concept.cloud.serverless.event-architecture/LO-3`

## 測驗目標

- 能依 workload、資料語意、故障域、quota、合規、運維能力與成本選擇雲端服務組合。
- 能把 12-factor 原則落實到設定、狀態、日誌、部署、擴縮與恢復流程，而不是只背原則名稱。
- 能診斷 Serverless 的 cold start、concurrency、timeout、retry、dead-letter 與下游容量交互造成的事故。
- 能說明 shared responsibility、服務商 SLA 與使用者自身的資料、身份、設定、容量和業務正確性責任。

## 問題情境與限制條件

某訂單 API 原本部署在固定數量的 VM 上，團隊為了降低維運成本，改成混合架構：HTTP 入口使用 Serverless function，訂單資料放在託管關聯式資料庫，圖片放在物件儲存，非同步通知送入 managed queue。團隊把同步下單 handler 的 concurrency 上限設為 200，失敗時由平台自動重試；handler 沒有以 order ID 做冪等，且每次 invocation 都建立新的資料庫連線。

發布後遇到促銷流量：P99 latency 從 250 ms 升到 8 秒，function concurrency 到達上限，queue age 持續增加，資料庫 connection limit 被耗盡，部分使用者收到 timeout 後重試而產生重複訂單。少數新 instance 的設定與舊 instance 不一致，診斷資訊只寫在本地檔案；團隊想直接提高 concurrency、無限重試並把所有流量切回原 VM。

限制：不能只回答「提高配額」或「換回 VM」；必須區分平台故障、應用程式設計缺口、下游容量與使用者責任，保留訂單正確性，並提出可回滾、可觀測、可驗證的恢復順序。

## 作答要求

1. **建立事故時間線**：列出至少十項要查的 invocation、cold start、concurrency、queue、資料庫、設定、部署、quota、成本與業務證據，並說明它們如何區分因果與相關。
2. **重新設計服務邊界**：比較 VM、container／PaaS、managed service 與 Serverless 在本案例的責任、延遲、擴縮、可攜性、成本與故障域，提出選型與保留理由。
3. **落實雲原生原則**：指出設定漂移、本地日誌、有狀態 handler、不可重現部署與 shutdown／health 行為的問題，提出 12-factor 對應修復。
4. **修復事件流程**：設計 order ID 冪等、資料庫連線保護、backoff、retry budget、dead-letter、queue backpressure、timeout 與下游 admission control。
5. **恢復與容量計畫**：說明短期降級、流量切換、known-good artifact、逐步放量、quota 申請、資料對帳與成本 guardrail 的順序。
6. **驗證修復**：提出至少八項負載測試、故障注入或恢復演練，涵蓋 cold start、concurrency、資料庫失效、queue 堵塞、重試、設定漂移與重複訂單。

## 期待證據

- 能把 concurrency limit、queue age、資料庫 connections、handler duration 與業務成功率放在同一條時間線，指出提高 concurrency 可能把壓力轉給資料庫。
- 能指出 retry 是可靠性工具也是放大器；沒有冪等、backoff、上限與 dead-letter 時，會造成重複訂單與 retry storm。
- 能說明 12-factor 的設定外置、無狀態、日誌事件流與可拋棄程序如何支援水平擴縮與回復。
- 能區分 cloud provider 管理的底層可用性與使用者仍需負責的 IAM、設定、資料保護、配額、程式碼、容量和業務不變量。
- 能用 P95／P99、cold-start rate、concurrency、queue age、DB pool usage、duplicate order rate、error budget 與 cost per order 驗證修復。
- 能先保護資料正確性與下游容量，再逐步恢復流量，而不是用無限重試或一次性全量切換換取表面成功。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 方案會繼續造成重複訂單、資料庫耗盡或無法恢復的資料損害，且把所有問題歸因於雲端平台。 |
| 1 | 能列出 Serverless、queue、database、autoscaling 等名詞，但沒有責任邊界、因果證據或恢復順序。 |
| 2 | 能提出部分 concurrency、retry、冪等或服務選型修正，但遺漏 12-factor、下游保護、quota／成本或可驗證證據中的至少一項。 |
| 3 | 能完成服務邊界與選型分析、雲原生修復、冪等／背壓／重試設計、分階段恢復與量化驗證。 |
| 4 | 除上述內容外，能處理多故障同時發生、quota 與供應商限制、跨服務對帳、成本異常、故障域切換與可攜性／運維成本的長期取捨。 |

### 通過標準

總分達 **3/4 分**才通過；service responsibility／selection、application reliability、recovery／evidence 三個核心面向均不得低於 2 分。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先停止擴大促銷流量，對下單入口採 admission control 或安全降級，保留 invocation、queue、資料庫、設定版本、deployment、quota 與訂單對帳證據。不能直接無限提高 concurrency：如果每個 invocation 都建立資料庫連線，這會把 function 的彈性轉成資料庫 connection storm。也不能只切回 VM，因為要先確認 VM 版本、資料狀態、流量切換與重複請求的影響。

短期以 order ID 或 idempotency key 保護建立訂單的狀態機；未知結果先查詢既有訂單，不因 timeout 盲目重建。為 handler 設定 timeout、有限 retry、exponential backoff、retry budget、dead-letter 與 queue backpressure，並透過 connection pool／proxy、批次或 admission limit 保護資料庫。對已產生的訂單執行 reconciliation，分出成功、待確認、重複與需要人工處理的狀態。

長期把設定外置並版本化，將日誌與 metric／trace 輸出到集中系統，讓程序無狀態且可安全終止；以 immutable artifact 逐環境 promotion，避免 instance 讀到不同設定。依同步延遲、吞吐、資料交易邊界與運維能力比較 Serverless、PaaS、container 與 VM：不必追求全 Serverless，而要把適合事件驅動的通知與圖片處理，和需要穩定連線或低延遲的核心交易分開。

恢復時先以小比例流量驗證 cold start、P99、錯誤率、concurrency、queue age、DB connections、重複訂單與成本，再逐步放量。用故障注入驗證 provider throttling、資料庫不可用、queue 堵塞、設定錯誤、重試風暴、instance termination 與跨區恢復，確定恢復方案不會破壞業務不變量。

</details>

## 常見失分點

- 看到 concurrency 到上限就無條件提高配額，沒有檢查資料庫 connection、下游 quota 與 retry amplification。
- 把 Serverless 當成沒有伺服器、沒有容量或不需要 timeout／冪等的抽象。
- 只談 12-factor 名稱，沒有處理設定漂移、本地狀態、日誌、shutdown 與 artifact 可追溯性。
- 把 cloud provider 的 SLA 當成使用者不必負責資料、IAM、設定、容量與業務正確性。
- 只切回舊環境或重試請求，沒有對帳重複訂單與未知結果。

## 延伸追問

1. 如果資料庫無法在尖峰前擴容，你會如何設計 admission、排隊與使用者可見狀態？
2. 如果 Serverless provider 的 concurrency quota 申請被拒絕，哪些工作會移到 queue、container 或 VM？
3. 如果跨區恢復後同一個 order event 可能在兩區重放，如何設計全域冪等與對帳？
4. 如果成本在流量下降後仍持續上升，你會如何區分 retry storm、queue replay、資料外送與正常用量？
