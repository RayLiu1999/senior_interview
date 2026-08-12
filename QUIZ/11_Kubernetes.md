# Kubernetes - 重點考題 (Quick Quiz)

> 這份考題從 Kubernetes 工作負載、發布、健康檢查、資源與自動擴縮文章中挑選重要程度 4-5 的核心題目。
>
> **使用方式**：先嘗試自己回答，再展開答案提示，最後閱讀對應文章；需要正式驗證時，接著完成 Kubernetes Hard Assessment。

## 🚢 工作負載與生產運維

<a id="q1"></a>
### Q1: Kubernetes Rolling Update 如何兼顧可用性與發布速度？
<!-- Concept ID: concept.kubernetes.rollout.rolling-update-rollback; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請說明 `maxSurge`、`maxUnavailable`、Readiness Probe 與 `progressDeadlineSeconds` 如何共同影響滾動更新，以及什麼證據足以支持 rollback。

<details>
<summary>💡 答案提示</summary>

- `maxSurge` 控制更新期間可超出的 Pod 數，`maxUnavailable` 控制可暫時不可用的 Pod 數；兩者共同決定容量餘裕與發布速度。
- Readiness 失敗的 Pod 不應接收流量，但不等於容器必須重啟；更新停滯時要查 Deployment、ReplicaSet、Pod events、版本分布與服務錯誤率。
- Rollback 應由可觀測的回歸證據觸發，並確認舊版本仍有足夠容量，不能只看 rollout 命令是否成功。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/kubernetes_rolling_update.md)

<a id="q2"></a>
### Q2: Liveness、Readiness 與 Startup Probe 的責任有什麼不同？
<!-- Concept ID: concept.kubernetes.probes.liveness-readiness-startup; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請以慢啟動且依賴資料庫的 API 為例，說明三種 Probe 的配置邊界，以及如何避免重啟風暴。

<details>
<summary>💡 答案提示</summary>

- Readiness 決定是否接收流量；Liveness 判斷是否需要重啟；Startup 為慢啟動容器提供初始化寬限期。
- 不要把短暫的下游依賴故障直接放進 Liveness，否則所有 Pod 可能同時重啟；應以事件、重啟次數、Endpoint 狀態與服務錯誤率交叉驗證。
- Probe endpoint、timeout、failure threshold 與檢查頻率要和實際啟動時間及恢復時間匹配。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/kubernetes_probes.md)

<a id="q3"></a>
### Q3: Requests、Limits、QoS 與 ResourceQuota 如何影響 Pod 的資源行為？
<!-- Concept ID: concept.kubernetes.resources.requests-limits-qos; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明 CPU throttling、OOMKilled、Pending、驅逐與 quota 達限之間的差異，並提出排查順序。

<details>
<summary>💡 答案提示</summary>

- Requests 影響排程與可分配容量；Limits 是容器可使用的上限，CPU 超過可能 throttling，Memory 超過可能 OOMKilled。
- QoS 會影響節點壓力下的驅逐順序；ResourceQuota 與 LimitRange 則在 namespace／容器層級建立護欄。
- 先查 Pod phase、events、實際使用量、node allocatable、quota 與 throttling/OOM 指標，再調整 requests 或 limits。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/kubernetes_resource_management.md)

<a id="q4"></a>
### Q4: HPA 為什麼可能不擴容、抖動或擴到上限？
<!-- Concept ID: concept.kubernetes.autoscaling.hpa-vpa-signal-control; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 HPA 的 CPU 目標計算、Requests 分母、metrics API、readiness 與 maxReplicas 如何造成錯誤判斷。

<details>
<summary>💡 答案提示</summary>

- HPA 常以目前使用量相對於 requests 的比例計算期望副本數；requests 不合理或 metrics 不完整會使比例失真或無法計算。
- Pod 尚未 Ready、metrics API 異常、maxReplicas 太低、擴容速度限制與 Cluster Autoscaler 容量不足，都可能讓 HPA 看似「沒有作用」。
- 應查 HPA conditions、metrics API、Pending Pod、readiness、node capacity 與實際業務指標，並設定穩定窗口避免抖動。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/kubernetes_autoscaling.md)

<a id="q5"></a>
### Q5: Deployment、StatefulSet 與 DaemonSet 應如何選擇？
<!-- Concept ID: concept.kubernetes.workloads.deployment-statefulset-daemonset; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請從身份、儲存、更新順序、節點覆蓋與擴縮行為比較三種 controller，並說明錯用時的事故風險。

<details>
<summary>💡 答案提示</summary>

- Deployment 適合無狀態服務；StatefulSet 提供穩定身份、網路名稱與 PVC；DaemonSet 以每個符合條件的節點部署一份 Pod。
- StatefulSet 的有序更新與資料保留需要額外容量與運維成本；DaemonSet 不代表所有節點都能運行，仍受 taint、toleration 與資源限制影響。
- 先以資料與身份需求選 controller，再檢查 controller、PVC、Service/Endpoint 與 node events，避免用 Deployment 取代有狀態工作負載。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/deployment_statefulset_daemonset.md)
