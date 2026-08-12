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

<a id="q6"></a>
### Q6: Kubernetes 解決了容器化應用的哪些運維問題？
<!-- Concept ID: concept.kubernetes.fundamentals.cluster-orchestration; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請從聲明式 API、控制器、排程、自我修復、服務發現與擴縮說明 Kubernetes 的價值，並指出它沒有替應用解決的問題。

<details>
<summary>💡 答案提示</summary>

- 使用者描述期望狀態，控制器持續把實際狀態拉回期望狀態；Scheduler、Kubelet、Service 與各種 controller 分工完成部署與流量管理。
- Kubernetes 能處理容器調度、重啟、滾動更新、服務發現與資源護欄，但不會自動修復錯誤的商業邏輯、資料一致性或不合理的 requests／limits。
- 採用它要衡量多租戶、可觀測性、升級與控制面維運成本，不是把所有工作負載直接搬進集群。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/what_is_kubernetes.md)

<a id="q7"></a>
### Q7: 為什麼 Kubernetes 以 Pod 而不是單一 Container 作為調度單位？
<!-- Concept ID: concept.kubernetes.fundamentals.pod-scheduling-boundary; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請說明 Pod 內容器共享的網路、儲存與生命週期，並判斷何時適合使用 sidecar 或 init container。

<details>
<summary>💡 答案提示</summary>

- Pod 是最小調度與部署單位，內容器共享 network namespace、Pod IP、volume 與部分生命週期語意；容器不應被當成獨立節點處理。
- Sidecar 適合與主容器緊密耦合的代理、收集或同步工作；init container 適合在主容器前完成一次性初始化。
- 若兩個元件需要獨立擴縮、部署或故障隔離，應拆成不同 Pod；Pod 被替換時不要依賴其 IP 或本地臨時檔案。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/what_is_pod.md)

<a id="q8"></a>
### Q8: Kubernetes Control Plane 與 Worker Node 如何協作部署一個 Pod？
<!-- Concept ID: concept.kubernetes.control-plane.architecture; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請沿著 API Server、etcd、Controller、Scheduler、Kubelet、Container Runtime 與 kube-proxy 說明從提交到可服務的流程。

<details>
<summary>💡 答案提示</summary>

- API Server 驗證請求並把狀態保存至 etcd；Controller 建立或調整下游物件，Scheduler 為未綁定的 Pod 選 Node，Kubelet 再要求 runtime 建立容器。
- kube-proxy／資料平面網路規則讓 Service 能找到 endpoints；控制面已接受物件不代表應用已 Ready 或可接收流量。
- 排查要看 API／etcd latency、controller queue、scheduler events、node condition、runtime、Pod events 與 Service endpoints 的責任邊界。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/kubernetes_architecture.md)

<a id="q9"></a>
### Q9: Kubernetes Service 類型如何決定服務暴露與服務發現？
<!-- Concept ID: concept.kubernetes.networking.service-discovery; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請比較 ClusterIP、NodePort、LoadBalancer、Headless 與 ExternalName，並說明何時再由 Ingress 統一對外。

<details>
<summary>💡 答案提示</summary>

- ClusterIP 是集群內穩定虛擬端點；NodePort 直接在節點暴露端口；LoadBalancer 通常請雲平台建立外部入口；Headless 讓 DNS 回傳 Pod 位址；ExternalName 是外部服務別名。
- Ingress／Gateway 適合把多個 HTTP(S) 服務集中在少數入口，Service 仍負責集群內的服務抽象與 endpoint 變化。
- 連線故障應核對 selector、EndpointSlice、DNS、kube-proxy、健康檢查、來源 IP 與雲端 LB，而非只確認 Service 物件存在。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/kubernetes_service_types.md)

<a id="q10"></a>
### Q10: Ingress 與 Ingress Controller 如何把 HTTP 請求導向後端？
<!-- Concept ID: concept.kubernetes.networking.ingress-routing; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明 Ingress rule、Controller、Service、TLS、host／path routing 的關係，並提出 404、502 與憑證錯誤的排查順序。

<details>
<summary>💡 答案提示</summary>

- Ingress 是期望路由規則，Controller 觀察它並產生實際 proxy／LB 配置；Service 再把請求送往符合 selector 且 Ready 的 endpoints。
- TLS secret、DNS、Host header、pathType、rewrite、Service port／targetPort 與 controller annotation 都可能改變實際路由。
- 404 先查 host／path 和 controller config，502 再查 endpoints、Pod readiness、port 與後端延遲；所有步驟都要對照入口與後端日誌。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/kubernetes_ingress.md)

<a id="q11"></a>
### Q11: ConfigMap 與 Secret 的安全與更新語意有何不同？
<!-- Concept ID: concept.kubernetes.configuration.configmap-secret; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請比較兩者的敏感度、環境變數與 Volume 注入方式、更新行為、RBAC 與 secret rotation。

<details>
<summary>💡 答案提示</summary>

- ConfigMap 用於非敏感設定；Secret 的 base64 只是編碼，不是加密，仍需限制 RBAC、啟用 at-rest encryption 並避免出現在日誌與 image layer。
- 環境變數通常要靠 Pod 重建取得更新；Volume 投影可能非同步更新，但應用是否重新讀取仍需明確設計。
- 變更應有版本、audit、rollout／回退和輪替策略，不能把所有 secret 讀取權限給 namespace 內的所有 ServiceAccount。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/configmap_and_secret.md)

<a id="q12"></a>
### Q12: Namespace 與 RBAC 如何建立最小權限的多租戶邊界？
<!-- Concept ID: concept.kubernetes.security.namespace-rbac; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請區分 Namespace 的資源作用域與 Role／ClusterRole／Binding 的授權作用域，並說明 ServiceAccount 權限排查方式。

<details>
<summary>💡 答案提示</summary>

- Role 和 RoleBinding 通常限制在單一 Namespace；ClusterRole 可描述集群級或可重用規則，ClusterRoleBinding 會把權限授予整個集群範圍。
- Namespace 不是完整安全邊界，仍要搭配 NetworkPolicy、ResourceQuota、Pod security 與 cloud／storage 權限。
- 用專用 ServiceAccount、明確 resource／verb、`auth can-i` 和 API audit 驗證實際權限；不要直接使用 `cluster-admin` 解決 403。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/kubernetes_namespace_rbac.md)

<a id="q13"></a>
### Q13: Kubernetes Pod 網路、CNI、Service 與 NetworkPolicy 如何連成一條資料路徑？
<!-- Concept ID: concept.kubernetes.networking.cni-policy; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請從 Pod IP、Node 路由、CNI、kube-proxy、DNS 與 NetworkPolicy 說明跨 Pod／跨 Node 請求的連通與隔離。

<details>
<summary>💡 答案提示</summary>

- CNI 負責把 Pod 接入網路並提供位址、介面與路由；Service 提供穩定虛擬端點；kube-proxy 或等價資料平面把流量導向 endpoints。
- NetworkPolicy 是否生效取決於 CNI 支援與 selector／namespace／port 規則；一旦套用 default deny，要明確允許 DNS、入口、下游與回程流量。
- 排查依序核對 DNS、Service／EndpointSlice、Pod IP、Node route、CNI log、policy、封包與 MTU／延遲，不把所有錯誤歸給應用。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/kubernetes_networking.md)

<a id="q14"></a>
### Q14: PV、PVC 與 StorageClass 如何支撐 Kubernetes 有狀態工作負載？
<!-- Concept ID: concept.kubernetes.storage.pv-pvc-provisioning; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明 PV、PVC、StorageClass、CSI、access mode、reclaim policy 與拓撲對 provisioning、掛載、擴容和恢復的影響。

<details>
<summary>💡 答案提示</summary>

- PVC 是工作負載提出的需求，StorageClass 描述動態配置策略，provisioner／CSI 建立或掛載 PV；Pod 使用 PVC 而不是直接耦合後端磁碟。
- `ReadWriteOnce` 等 access mode、volume binding mode、Node topology、StatefulSet claim template 與 reclaim policy 會影響排程和故障恢復。
- PVC Pending 要看 events、StorageClass、provisioner、配額與 topology；資料服務上線前必須驗證一致性備份、還原、擴容與刪除保護。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/kubernetes_storage.md)
