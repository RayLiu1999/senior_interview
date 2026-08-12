# Kubernetes Production Rollout Incident：從發布停滯到容量退化

- **Assessment ID**: `assessment.kubernetes.rollout.incident-diagnosis.v1`
- **主要 Concept ID**: `concept.kubernetes.rollout.rolling-update-rollback`
- **次要 Concept IDs**:
  - `concept.kubernetes.probes.liveness-readiness-startup`
  - `concept.kubernetes.resources.requests-limits-qos`
  - `concept.kubernetes.autoscaling.hpa-vpa-signal-control`
  - `concept.kubernetes.workloads.deployment-statefulset-daemonset`
- **對應文章**:
  - [Rolling Update 與 Rollback 策略](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/kubernetes_rolling_update.md)
  - [Liveness、Readiness 與 Startup Probe](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/kubernetes_probes.md)
  - [Requests、Limits 與 ResourceQuota](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/kubernetes_resource_management.md)
  - [HPA 與 VPA](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/kubernetes_autoscaling.md)
  - [Deployment、StatefulSet 與 DaemonSet](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/deployment_statefulset_daemonset.md)
- **題型**: `故障診斷`, `發布決策`, `容量設計`, `權衡取捨`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 30 分鐘
- **標籤**: `Kubernetes`, `Rolling Update`, `Probe`, `HPA`, `Resource Management`, `Production Incident`
- **Learning Objective IDs**:
  - `concept.kubernetes.rollout.rolling-update-rollback/LO-1`
  - `concept.kubernetes.rollout.rolling-update-rollback/LO-2`
  - `concept.kubernetes.rollout.rolling-update-rollback/LO-3`
  - `concept.kubernetes.probes.liveness-readiness-startup/LO-1`
  - `concept.kubernetes.probes.liveness-readiness-startup/LO-2`
  - `concept.kubernetes.probes.liveness-readiness-startup/LO-3`
  - `concept.kubernetes.resources.requests-limits-qos/LO-1`
  - `concept.kubernetes.resources.requests-limits-qos/LO-2`
  - `concept.kubernetes.resources.requests-limits-qos/LO-3`
  - `concept.kubernetes.autoscaling.hpa-vpa-signal-control/LO-1`
  - `concept.kubernetes.autoscaling.hpa-vpa-signal-control/LO-2`
  - `concept.kubernetes.autoscaling.hpa-vpa-signal-control/LO-3`
  - `concept.kubernetes.workloads.deployment-statefulset-daemonset/LO-1`
  - `concept.kubernetes.workloads.deployment-statefulset-daemonset/LO-2`
  - `concept.kubernetes.workloads.deployment-statefulset-daemonset/LO-3`

## 測驗目標

- 能從 Deployment、ReplicaSet、Pod、Probe、HPA 與節點資源證據建立事故時間線，區分發布問題、流量路由問題與容量瓶頸。
- 能設計不造成重啟風暴或流量黑洞的 Readiness、Liveness、Startup Probe，並用可觀測條件決定 rollback 或暫停發布。
- 能以 Requests、Limits、QoS、HPA 與 Cluster Autoscaler 的責任邊界推導容量方案，說明延遲、成本與安全餘裕。
- 能判斷無狀態 API、具穩定身份的資料服務與節點級 agent 應使用哪種 workload controller，並提出恢復驗證。

## 問題情境與限制條件

你負責一個 Kubernetes 上的結帳 API。Deployment `checkout-api` 原本有 12 個 v1 Pod，現在要發布 v2。發布設定為 `maxSurge: 25%`、`maxUnavailable: 25%`，服務使用 RollingUpdate；正常狀況下每個 Pod 的 CPU request 是 `250m`、memory request 是 `256Mi`。

發布開始 10 分鐘後觀察到：

- 新 ReplicaSet 已建立 12 個 Pod，但只有 4 個 Ready；Deployment 的 `Progressing` condition 沒有前進，舊 Pod 仍未全部替換。
- v2 的 Readiness endpoint 只檢查 HTTP server 是否啟動；實際建立資料庫連線池平均需要 40 秒。Liveness endpoint 會在資料庫查詢失敗時回傳失敗。
- v2 的 CPU 使用量約為 request 的 160%，memory 偶爾超過 `512Mi` limit；部分 Pod 出現 `OOMKilled`，另一些 Pod 因 node 可分配 memory 不足而 Pending。
- HPA 以 CPU utilization 目標 70%、`minReplicas: 12`、`maxReplicas: 20` 運作。metrics API 有約 90 秒延遲，HPA status 顯示部分 metric unavailable；Cluster Autoscaler 需要約 4 分鐘才能增加節點。
- 新版本的錯誤率與 P99 延遲已上升，但現有監控只顯示 Deployment replicas，沒有把版本、Ready endpoints、OOM、HPA condition 與業務錯誤率放在同一個 dashboard。
- `checkout-api` 是無狀態服務；同一叢集中另有需要穩定身份與 PVC 的資料服務，以及每個節點都必須執行一次的 log agent。你不能把所有工作負載都改成同一種 controller，也不能在沒有證據時盲目調大所有 timeout、limit 或副本數。

## 作答要求

請以 production incident review 的形式回答：

1. **建立故障時間線**：列出你前 15 分鐘的排查順序，至少使用 Deployment／ReplicaSet／Pod events、Ready endpoints、Probe 結果、OOM／throttling、HPA conditions、metrics freshness、node allocatable 與版本切片的證據。
2. **判斷發布是否繼續**：說明目前是停滯、容量不足、探針誤判，還是多個問題同時存在；提出一次 rollback 或 pause 的決策，並定義恢復前不能放行的條件。
3. **修正探針與流量閘門**：重新設計 Startup、Readiness、Liveness 的責任、端點與參數，說明如何避免慢啟動被誤殺，以及資料庫暫時故障時如何只停止流量而不製造重啟風暴。
4. **修正資源與擴縮策略**：根據 CPU、memory、requests、limits、QoS、HPA、metrics delay 與 Cluster Autoscaler 的時間常數提出方案；說明為什麼只調 HPA CPU 可能無法解決 P99 或 Pending。
5. **選擇 workload controller**：分別為 checkout API、需要穩定身份與 PVC 的資料服務、每節點 log agent 選擇 Deployment、StatefulSet 或 DaemonSet，並說明更新、儲存與節點故障時的代價。
6. **驗證修復**：列出至少六個可觀測指標或故障注入測試，證明 rollout、流量隔離、資源容量、擴縮與 rollback 在 baseline、尖峰、慢啟動、資料庫故障與節點壓力下都可控。

## 期待證據

- 能指出 `Readiness` 通過不代表應用已能處理真實流量；慢啟動應由 Startup／充分的 readiness 條件處理，而不是用 Liveness 反覆重啟。
- 能把 Deployment rollout 停滯、Pod Pending、OOMKilled、CPU throttling、metrics API 延遲與 Cluster Autoscaler 延遲分開，不把它們統稱為「Kubernetes 不穩定」。
- 能說明 `maxSurge`／`maxUnavailable` 是發布期間的容量與可用性控制，必須和節點餘裕、Pod readiness 及 PDB／服務端點一起看。
- 能以實際使用量與 node allocatable 校準 requests／limits，並知道 CPU 使用相對於 requests 的 HPA 計算可能因 request 設定而失真。
- 能在 rollback、pause、調整 probe 或調整容量之間建立有順序的變更計畫，且每一步有成功與回退條件。
- 能使用版本、Pod、Endpoint、HPA condition、metrics timestamp、OOM、eviction、Pending age、P99 與業務錯誤率做切片，而非只看總副本數。
- 能正確選擇 Deployment、StatefulSet、DaemonSet，並說明 controller 選錯會造成身份、PVC、節點覆蓋或更新順序問題。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 無法建立 rollout、Probe、資源或 controller 的基本模型，或修復方案會持續把未 Ready／OOM 的 Pod 導入流量。 |
| 1 | 能列出 Deployment、HPA、Probe 等名詞，但無法依事故證據判斷因果，也沒有安全的 rollback 或容量策略。 |
| 2 | 能辨識部分探針與資源問題並提出局部修正，但遺漏 rollout 容量、metrics 延遲、擴縮時間常數或 controller 責任邊界中的至少一項。 |
| 3 | 能完成事故時間線，提出安全的 pause／rollback、合理的探針設計、requests／limits 與 HPA／節點容量方案，並用指標驗證主要風險。 |
| 4 | 除上述內容外，能處理探針與下游依賴的故障邊界、發布期間的容量 headroom、HPA 訊號延遲、PDB／endpoint 行為、rollback 後資料與流量驗證，並量化成本、延遲與可用性取捨。 |

### 通過標準

總分達 **3/4 分**才通過；rollout／rollback、probe／traffic isolation、resource／autoscaling 三個核心面向均不得低於 2 分。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

### 1. 先停止擴大故障，再建立證據

先停止繼續推進 v2，保留目前狀態供比對；若錯誤率與 P99 持續超過門檻，回滾到已知健康的 v1。排查順序應是：

1. 依版本切片確認 v2 的錯誤率、P99、Ready endpoint 數量與業務成功率，判斷使用者影響。
2. 查 Deployment／ReplicaSet condition、rollout history、Pod events、termination reason 與 readiness gate，確認停滯點是在建立、排程、啟動還是加入 Service。
3. 對照 probe failure、restart count、OOMKilled、CPU throttling、memory working set、node allocatable、Pending age 與 eviction，區分探針誤設與真實資源不足。
4. 查 HPA conditions、current／desired replicas、metrics timestamp、metrics API 錯誤與 Cluster Autoscaler backlog；90 秒指標延遲和 4 分鐘節點擴容不能被當成即時保護。

目前是多重故障：Readiness 太早放行、Liveness 把資料庫故障轉成重啟、memory limit 過低且 requests／節點容量不足，HPA 又受落後 metrics 與節點供給延遲影響。不能只提高 maxReplicas。

### 2. Probe、資源與發布修復

- 以 Startup Probe 覆蓋最長的初始化窗口，讓 Liveness 在 startup 成功前不執行；Readiness 應確認 server 已能處理請求、資料庫連線池已建立且必要依賴處於可接受狀態。資料庫暫時不可用時優先讓 Readiness 失敗、移出 endpoints，而不是讓 Liveness 失敗造成重啟風暴。
- 重新以壓測與 production histogram 校準 requests，讓 requests 反映正常或目標負載，讓 memory limit 能涵蓋合理峰值並保留節點 headroom；不可用盲目調到最大，因為 limit 太高會讓排程和 OOM 風險轉移到節點層。
- 修正 rollout 的容量預算，確認舊版本與新版本同時存在時節點仍有可排程空間；可先 pause rollout 或回滾，待容量與 probe 通過預發驗證後再以較保守的 surge／unavailable 重新發布。
- HPA 除 CPU 外，可加入與使用者症狀更接近的 request rate、queue depth 或 in-flight 指標，但必須處理低基數、metrics freshness、scale-up 積極度與 scale-down stabilization。Cluster Autoscaler 只能補節點容量，不能替代應用的 admission control 或 queue backpressure。

### 3. Controller 選擇與驗證

checkout API 使用 Deployment；資料服務若需要穩定 ordinal identity、headless Service、有序更新與 PVC，使用 StatefulSet；每節點 log agent 使用 DaemonSet，並配置 taint／toleration、資源 requests 與升級策略。修復後至少驗證 rollout generation、Ready endpoints、版本錯誤率、restart／OOM、Pending age、HPA desired replicas、metrics freshness、node allocatable、P99 與業務成功率；再注入慢啟動、資料庫 timeout、單節點壓力與 rollback，確認流量只進入健康 Pod 且不會產生無限重啟或副本抖動。

</details>

## 常見失分點

- 看到 Pod 不 Ready 就直接調大 `failureThreshold`，沒有先區分慢啟動、下游故障與資源不足。
- 把 Liveness 當成「所有依賴都健康」檢查，造成依賴故障時整批 Pod 重啟。
- 只調高 HPA `maxReplicas`，沒有查 requests 分母、metrics freshness、Pending 與 Cluster Autoscaler 的供給延遲。
- 把 `maxSurge` 與 `maxUnavailable` 當成固定最佳值，沒有計算 rollout 期間的節點容量與可用性 headroom。
- 用 Deployment 管理需要穩定身份／PVC 的資料服務，或用 StatefulSet 取代每節點 agent，忽略 controller 的語意。
- 只以 Deployment replicas 判斷恢復，沒有驗證 Ready endpoints、版本切片、OOM、P99 與業務錯誤率。

## 延伸追問

1. 如果 v2 的 schema migration 只能向前相容，你會如何安排 rollout、rollback 與資料庫 migration 的順序？
2. 若 HPA 使用 queue depth，但 queue consumer 本身也在同一叢集內擴縮，如何避免 autoscaling feedback loop？
3. 若 readiness 依賴資料庫健康狀態，而資料庫短暫故障時所有 Pod 同時被移出 endpoints，你會如何設計降級與最小服務能力？
4. 若節點容量不足且不能立即擴容，你會如何用 admission control、排隊、優先級與 `maxUnavailable` 保護現有流量？
