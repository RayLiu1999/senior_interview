# Container Orchestration Boundary Incident：從 Image Provenance 到 Kubernetes 容量退化

- **Assessment ID**: `assessment.container-orchestration.boundary-incident.v1`
- **主要 Concept ID**: `concept.docker.build.image-container-registry`
- **次要 Concept IDs**:
  - `concept.docker.networking.mode-isolation`
  - `concept.docker.compose.service-topology`
  - `concept.docker.runtime.namespace-cgroup`
  - `concept.docker.storage.volume-lifecycle`
  - `concept.kubernetes.fundamentals.cluster-orchestration`
  - `concept.kubernetes.fundamentals.pod-scheduling-boundary`
  - `concept.kubernetes.control-plane.architecture`
  - `concept.kubernetes.networking.service-discovery`
  - `concept.kubernetes.networking.ingress-routing`
  - `concept.kubernetes.configuration.configmap-secret`
  - `concept.kubernetes.security.namespace-rbac`
  - `concept.kubernetes.networking.cni-policy`
  - `concept.kubernetes.storage.pv-pvc-provisioning`
- **對應文章**:
  - [Docker 網路模型：Bridge、Host、Overlay](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/Docker/docker_networking.md)
  - [Docker Compose 與多容器編排](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/Docker/docker_compose.md)
  - [Docker 內部原理與實現機制](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/Docker/docker_internals.md)
  - [Docker Volume 與資料持久化](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/Docker/docker_volume.md)
  - [Dockerfile、Image、Container、Registry](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/Docker/dockerfile_image_container_registry.md)
  - [ConfigMap 與 Secret 的使用](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/configmap_and_secret.md)
  - [Kubernetes 核心架構](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/kubernetes_architecture.md)
  - [Ingress 與 Ingress Controller](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/kubernetes_ingress.md)
  - [Namespace 與 RBAC 權限管理](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/kubernetes_namespace_rbac.md)
  - [Kubernetes 網路模型與 CNI](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/kubernetes_networking.md)
  - [Service 的類型](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/kubernetes_service_types.md)
  - [Persistent Volume、Persistent Volume Claim 與 StorageClass](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/kubernetes_storage.md)
  - [什麼是 Kubernetes](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/what_is_kubernetes.md)
  - [Pod 是什麼](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/K8s/what_is_pod.md)
- **題型**: `故障診斷`, `供應鏈與部署`, `網路與儲存`, `安全邊界`, `容量取捨`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 40 分鐘
- **標籤**: `Docker`, `Docker Compose`, `Kubernetes`, `Image Provenance`, `Networking`, `Storage`, `RBAC`, `Rollout`, `Capacity`
- **Learning Objective IDs**:
  - `concept.docker.networking.mode-isolation/LO-1`
  - `concept.docker.networking.mode-isolation/LO-2`
  - `concept.docker.networking.mode-isolation/LO-3`
  - `concept.docker.compose.service-topology/LO-1`
  - `concept.docker.compose.service-topology/LO-2`
  - `concept.docker.compose.service-topology/LO-3`
  - `concept.docker.runtime.namespace-cgroup/LO-1`
  - `concept.docker.runtime.namespace-cgroup/LO-2`
  - `concept.docker.runtime.namespace-cgroup/LO-3`
  - `concept.docker.storage.volume-lifecycle/LO-1`
  - `concept.docker.storage.volume-lifecycle/LO-2`
  - `concept.docker.storage.volume-lifecycle/LO-3`
  - `concept.docker.build.image-container-registry/LO-1`
  - `concept.docker.build.image-container-registry/LO-2`
  - `concept.docker.build.image-container-registry/LO-3`
  - `concept.kubernetes.configuration.configmap-secret/LO-1`
  - `concept.kubernetes.configuration.configmap-secret/LO-2`
  - `concept.kubernetes.configuration.configmap-secret/LO-3`
  - `concept.kubernetes.control-plane.architecture/LO-1`
  - `concept.kubernetes.control-plane.architecture/LO-2`
  - `concept.kubernetes.control-plane.architecture/LO-3`
  - `concept.kubernetes.networking.ingress-routing/LO-1`
  - `concept.kubernetes.networking.ingress-routing/LO-2`
  - `concept.kubernetes.networking.ingress-routing/LO-3`
  - `concept.kubernetes.security.namespace-rbac/LO-1`
  - `concept.kubernetes.security.namespace-rbac/LO-2`
  - `concept.kubernetes.security.namespace-rbac/LO-3`
  - `concept.kubernetes.networking.cni-policy/LO-1`
  - `concept.kubernetes.networking.cni-policy/LO-2`
  - `concept.kubernetes.networking.cni-policy/LO-3`
  - `concept.kubernetes.networking.service-discovery/LO-1`
  - `concept.kubernetes.networking.service-discovery/LO-2`
  - `concept.kubernetes.networking.service-discovery/LO-3`
  - `concept.kubernetes.storage.pv-pvc-provisioning/LO-1`
  - `concept.kubernetes.storage.pv-pvc-provisioning/LO-2`
  - `concept.kubernetes.storage.pv-pvc-provisioning/LO-3`
  - `concept.kubernetes.fundamentals.cluster-orchestration/LO-1`
  - `concept.kubernetes.fundamentals.cluster-orchestration/LO-2`
  - `concept.kubernetes.fundamentals.cluster-orchestration/LO-3`
  - `concept.kubernetes.fundamentals.pod-scheduling-boundary/LO-1`
  - `concept.kubernetes.fundamentals.pod-scheduling-boundary/LO-2`
  - `concept.kubernetes.fundamentals.pod-scheduling-boundary/LO-3`

## 測驗目標

- 能從 Dockerfile、build context、image manifest、registry digest 與執行中的 Pod 建立完整 artifact provenance，判斷「同一個 tag」是否真的代表同一個可回滾產物。
- 能把 Compose 的 service、dependency、network、volume 與 secret 配置轉譯成 Kubernetes 的 Pod、Service、ConfigMap、Secret、PVC 與 controller 邊界，而不是直接複製單機語意。
- 能沿著 Control Plane、Scheduler、Kubelet、runtime、CNI、kube-proxy、Service、Ingress 與 endpoint 追蹤請求，區分物件存在、Pod Running、Pod Ready 與流量可用。
- 能以 Namespace、RBAC、NetworkPolicy、Secret、Volume、probe、resource request／limit、rollout 與 node capacity 的證據提出可回滾修復。

## 問題情境與限制條件

你負責把原本使用 Docker Compose 的 checkout 平台遷移到 Kubernetes。平台包含無狀態的 checkout API、非同步 worker、需要持久化資料的資料服務，以及由平台團隊維護的入口與網路政策。遷移後第一次高流量發布發生事故，產品團隊要求在不犧牲既有可用性的前提下恢復服務。

建置與發布紀錄顯示：

- 同一個 Git commit 在兩個 CI runner 建出的 image digest 不同。Dockerfile 的 base image 使用 mutable tag，建置環境沒有固定完整的 dependency 與時間戳來源；registry 上的 `checkout:prod` tag 在一天內被覆寫三次。
- image build context 由整個 repository 提供，稽核無法快速證明環境檔案、建置工具與測試資料沒有進入 layer。團隊只保存 tag，沒有把 digest、來源 commit、SBOM、簽章或 builder provenance 綁在部署紀錄上。
- Compose 中 `depends_on` 讓 API 在本機看起來能啟動，API 使用 bind mount 讀取設定、named volume 保存 worker 暫存資料；生產遷移文件只把服務名稱與環境變數照搬，沒有定義 readiness、備份與 Volume 回收策略。

Kubernetes `checkout-prod` Namespace 的狀態如下：

- Deployment `checkout-api` 期望 12 個副本，RollingUpdate 使用 `maxSurge: 25%`、`maxUnavailable: 25%`。新 ReplicaSet 的 Pod 多數是 Running，但只有 4 個 Ready；舊版本仍有 8 個 Ready。部分 Pod 使用同一個 `checkout:prod` tag，實際 digest 卻分成兩組。
- API 的 readiness 只檢查 HTTP server 是否 listen；liveness 會同步查詢資料庫。資料庫短暫延遲時，Pod 先被導入流量，接著因 liveness 失敗重啟，出現 CrashLoopBackOff。新版本的記憶體 working set 也超過 limit，CPU cgroup throttling 明顯。
- Service 的 selector 只看 `app=checkout`，Ingress 以 host 和 `/api` path 導向 Service。外部同時出現 404、502 與偶發舊版本回應；部分 Service endpoints 沒有 Ready condition，入口日誌與後端 Pod 日誌沒有以版本和 digest 對齊。
- NetworkPolicy 已啟用 default deny，但只允許入口到 API，沒有明確允許 DNS、API 到資料庫與 worker queue 的必要流量。跨 Node 的部分請求超時；CNI 指標、Node route、EndpointSlice 與 policy audit 尚未被放在同一條診斷流程。
- ConfigMap 已更新到 `checkout-config-v7`，Secret 已輪替到 `checkout-db-v2`。以環境變數注入的 Pod 沒有全部重建，部分 Pod 仍使用舊設定。API 使用的 ServiceAccount 嘗試列出整個 Namespace 的 Secret 以完成「自動發現」，但被 RBAC 拒絕；團隊有人提議直接綁定 `cluster-admin`。
- Worker 的 PVC 一直 Pending，StorageClass 的 provisioner 回報一個 Node topology 不相容；另一個資料服務的 RWO volume 在重排程時掛載失敗。現有備份只有成功訊息，沒有還原驗證。API 本身是無狀態，不應因為方便而共享資料庫或上傳資料 Volume。
- 節點可分配容量已使用約 82%。新 Pod 的 request 過低而 limit 過窄，rollout 的 surge 副本與 worker Pending 互相競爭；HPA 只看 CPU，metrics API 有延遲，Cluster Autoscaler 需要數分鐘才可能增加節點。你不能先把所有 limit、replica 或 timeout 無上限調大。

限制條件：

- 必須保留目前仍健康的舊版本容量，不能用刪除所有 Pod 的方式「重置」事故。
- 不能把 secret、registry credential、Docker socket 或過寬的 ServiceAccount 權限暴露給應用容器。
- 不能把資料庫、queue 或 storage 的真實可用性假設成與 Pod process 存活相同；所有變更都要有可觀測的成功與回退條件。
- 遷移目標是可重現的 artifact、可解釋的流量路徑、最小權限、可恢復的資料與能承受節點壓力的容量模型。

## 作答要求

請以 production incident review 的形式回答：

1. **先止血與保留證據**：說明是否暫停 rollout、固定目前使用的 digest、保留舊 ReplicaSet、限制入口流量或回退到哪個已知健康 artifact；列出不會破壞證據的前 15 分鐘動作。
2. **重建 artifact chain**：定義 Dockerfile、image、container、registry 的責任，提出固定 base image／依賴、縮小 context、secret 排除、SBOM、簽章、provenance、immutable digest 與 promotion 的驗證方式。
3. **比較 Compose 與 Kubernetes 邊界**：說明 `depends_on` 和 readiness 的差異、Compose network／volume／環境變數如何映射，以及 API、worker、資料服務為何不能只用同一種 controller 或同一個儲存策略。
4. **追蹤 Kubernetes 部署與流量**：從 API Server、etcd、Controller、Scheduler、Kubelet、container runtime、Pod phase／condition、Service／EndpointSlice 到 Ingress，區分 image pull、Pending、Running、Ready、404、502 和後端 timeout 的因果。
5. **修正網路、配置與權限**：設計必要的 DNS、入口、API、資料庫與 queue NetworkPolicy；說明 Service 類型、Ingress host／path／TLS、ConfigMap／Secret 更新與輪替，以及以專用 ServiceAccount 實施最小 RBAC 的方案。
6. **修正儲存與恢復**：判斷哪些資料應使用 ephemeral storage、named／PVC、StatefulSet 或外部服務；解釋 PVC Pending、CSI／provisioner、access mode、topology、reclaim policy、備份與還原驗證的排查順序。
7. **修正 probe、資源與 rollout**：重新分配 startup、readiness、liveness 的責任；以實際使用量校準 requests／limits、QoS、HPA 訊號與 node headroom；提出 surge、rollback、PDB／可用容量及成功條件，避免 OOM、throttling、重啟風暴與容量抖動。
8. **提出驗證矩陣**：至少列出八個可重複的檢查或故障注入，覆蓋 clean rebuild、registry pull、慢啟動、資料庫／queue 暫斷、DNS／NetworkPolicy、Ingress 404／502、PVC／Node 故障、secret rotation、RBAC denial、尖峰與 rollback，並為每項指定觀測指標和停止條件。

## 期待證據

- 能以建置 log、lock／dependency manifest、image config／history、manifest digest、registry audit、SBOM、簽章與 clean rebuild 證明同一 commit 的 artifact 可重現，且 secret 沒有進入 context 或 layer。
- 能指出 tag 不是不可變身分；部署、rollback、cache 與 admission 應以 digest、來源 commit、provenance 和 policy gate 連結，而不是只記錄 `checkout:prod`。
- 能區分 Compose 的啟動依賴和應用 readiness，並將 bind mount、named volume、environment injection、network name 與單主機生命週期轉換成 Kubernetes 的明確物件與責任。
- 能把 Pod 的 phase、container state、restart、image digest、requests／limits、cgroup throttling／OOM、Node allocatable 與 scheduler events 串成調度和 runtime 證據鏈。
- 能說明 API Server／etcd／Controller／Scheduler 負責控制面協調，Kubelet／runtime 負責節點執行；API 物件建立或 Pod Running 都不等於 Service 已能安全接流量。
- 能用 selector、EndpointSlice、Pod readiness、Service port／targetPort、DNS、kube-proxy、Ingress rule、Host／path、TLS 與入口／後端日誌區分 404、502、無 endpoint 和應用 timeout。
- 能指出 NetworkPolicy 依賴 CNI 實作，default deny 後必須明確放行 DNS、入口、下游與回程；排查要包含跨 Node 路由、MTU、CNI metrics、policy audit 和封包，而不是只看 Pod IP。
- 能區分 ConfigMap 與 Secret 的敏感度和更新語意，知道 base64 不是加密；能以版本化配置、rollout、at-rest encryption、audit、專用 ServiceAccount 與最小 verbs／resources 完成 rotation。
- 能以 Role／ClusterRole 與不同 Binding 的作用域解釋 403，拒絕 `cluster-admin` 作為修復；同時知道 Namespace 不能單獨取代 NetworkPolicy、Pod security、quota 與外部 IAM。
- 能解釋 PV、PVC、StorageClass、CSI、access mode、reclaim policy 和 topology 的生命週期，並以 provisioner／events／mount／I/O 證據診斷 Pending 或 RWO 衝突，要求可驗證的備份還原。
- 能為無狀態 API、需要穩定身份與 PVC 的資料服務、每節點 agent／worker 選擇合適 controller 或外部服務，說明身份、更新、資料、節點故障與成本取捨。
- 能讓 Startup 保護慢啟動、Readiness 控制流量、Liveness 只判斷可重啟的程序故障，避免把資料庫暫斷變成整批重啟；能用 probe events、Ready endpoints、P99、錯誤率與 restart 驗證。
- 能以 p95／p99 使用量、request 分母、memory working set、CPU throttling、OOM、eviction、node allocatable、HPA freshness、Pending age 與 autoscaler latency 校準容量，不把 HPA 或加節點當成唯一答案。
- 能提出分階段 rollback／rollout 計畫，每一步都有 guardrail、觀測窗口、成功門檻與回退條件，並保留舊版本容量和資料相容性。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 無法建立 image、Pod、Service、Storage 或權限的基本模型；方案會刪除健康容量、暴露 secret／cluster-admin，或把所有故障歸因於「Kubernetes 不穩定」。 |
| 1 | 能列出 Docker、Compose、Pod、Ingress、PVC、RBAC 等名詞，但沒有時間線、artifact 證據、流量路徑、可回滾修復或容量推理。 |
| 2 | 能辨識部分 image 漂移、readiness、NetworkPolicy、PVC 或資源問題並提出局部修正，但遺漏至少兩個核心邊界，或無法以可觀測證據驗證。 |
| 3 | 能完成 artifact、Compose／Kubernetes 映射、Pod／Service／Ingress 路徑、配置／權限、網路／儲存與 rollout／容量的主要診斷，提出安全的分階段修復和驗證矩陣。 |
| 4 | 除上述內容外，能處理 digest promotion、layer／secret provenance、控制面與節點責任、endpoint／policy／DNS 細節、RWO／topology／還原、probe 與下游故障邊界，並量化可用性、成本、延遲、安全與回滾取捨。 |

### 通過標準

總分達 **3/4 分**才通過；Artifact Reproducibility、Runtime／Compose Boundary、Kubernetes Traffic／Scheduling、Security／Storage、Rollout／Capacity 五個核心面向均不得低於 2 分，且必須提出至少一個明確 rollback 條件與八項驗證證據。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

### 1. 先固定產物與停止擴大影響

先暫停 Deployment 的進一步 rollout，保留舊 ReplicaSet 和目前 Pod，將外部錯誤率、P99、版本／digest、Ready endpoints、重啟、OOM、throttling 與 Pending age 切片。若新版本的錯誤率或 P99 已超過事先門檻，立即把流量和部署回到已知健康且 digest 可證明的舊 artifact；不能只因 rollout command 回報成功就放行。回退前確認舊 Pod 有足夠容量、Service selector 不會把未 Ready Pod 導入，並保留新 Pod 的 events、image digest、termination reason 和入口請求樣本供事後分析。

同時凍結 `checkout:prod` tag 的覆寫與現場重新 build。把每個 Pod 實際 image ID、image manifest digest、來源 commit、builder、registry push 時間和 rollout revision 收集起來，先判斷這是產物漂移、部署 selector、應用錯誤還是多重問題。API 物件存在、Pod Running、Pod Ready、Service 有 endpoints、Ingress 能路由是五個不同的 gate。

### 2. 重建可重現的 Docker artifact chain

Dockerfile 是定義與建置指令，image 是分層且應視為不可變的建置產物，container 是 image 的執行實例，registry 是保存與分發 manifest／layers 的邊界。修復流程應固定 base image digest、語言與套件版本、建置工具、時區／時間戳來源和 dependency lock；縮小 build context，透過 ignore 規則排除環境檔、credential、測試資料與不必要的 repository 內容。Secret 不應放在 Dockerfile、ARG、環境檔、layer 或 image history。

CI 要在乾淨環境重建並比較 digest、manifest、SBOM、來源 commit、建置參數與 provenance；對 artifact 做漏洞／授權檢查、簽章和 registry policy gate。生產 promotion 應以 digest 或不可變版本指標進行，tag 只能作為人讀別名且必須禁止未審計覆寫。部署記錄要保留可拉取的上一版 digest、簽章與回滾來源，並在 admission 或發布前驗證實際 Pod 使用的 digest。

### 3. 從 Compose 轉換到 Kubernetes 的責任邊界

Compose 的 `depends_on` 解決容器啟動／建立順序，不能保證資料庫已可接受交易；Kubernetes 的 readiness、應用 retry、初始化工作和 controller 才共同描述服務可用性。Compose 的服務名稱網路要轉成 Service／DNS，bind mount 要重新判斷是否應由 ConfigMap、Secret、PVC、ephemeral volume 或外部儲存承擔，named volume 要有備份、回收和還原策略。

無狀態 API 應保持可替換，使用 Deployment 加上明確的 Pod template、Service、readiness 和資源設定；需要穩定 ordinal identity、每副本 PVC 或有序操作的資料服務才考慮 StatefulSet，且資料庫通常仍需獨立的備份、複寫與升級計畫。worker 若每節點只需一份可用 DaemonSet，若是可排隊和獨立擴縮的工作則使用 Deployment／Job 類型，不能因 Compose 中有一個 service 就讓所有工作負載共享相同 Volume。

### 4. 追蹤控制面、Pod、Service 和 Ingress

先查 API Server／etcd 是否正常保存物件，再查 Deployment／ReplicaSet condition、Scheduler events、Node condition、Kubelet 與 container runtime 的 image pull／create／start 結果。新 Pod Pending 代表排程或容量／PVC／taint 問題；Running 只代表容器已啟動；Ready 還要看 readiness；只有 Ready endpoint 才應進入 Service 流量。Pod image digest 分裂代表 tag 漂移或節點快取／promotion 不一致，必須先固定 artifact。

外部請求要沿著 DNS／Load Balancer、Ingress host／path／TLS、Ingress Controller、Service port／targetPort、EndpointSlice、Pod IP 和應用 listener 對照。404 優先檢查 Host、pathType、rewrite、Ingress rule 與 controller 設定；502 檢查 Service endpoints、Pod readiness、port、TLS 到後端的協定和後端 timeout。Service selector 不應只用過寬的 label 而導入錯誤版本；部署期間要用版本和 digest label 做可觀測切片，即使 selector 仍維持服務拓撲。

### 5. 配置、Secret、RBAC 與網路政策

ConfigMap 適合非敏感設定，Secret 的 base64 不是加密。環境變數注入通常要透過新的 Pod template／rollout 取得更新，Volume 投影的更新則要確認應用是否重新讀取；因此 `checkout-config-v7` 和 `checkout-db-v2` 應以版本化 template、受控 rotation、audit 和 rollback 方式發布。Secret 需啟用 at-rest encryption、限制讀取者、避免日誌／debug dump／image layer 和不必要的 controller 權限。

API 的 ServiceAccount 不應為了自動發現而列出所有 Secret；先把需求改成明確的單一 Secret read 或由平台注入，使用 namespace 內最小 Role／RoleBinding，並以 `auth can-i`、audit log 和 integration test 驗證。Namespace 只提供資源作用域，不是完整安全邊界，仍要搭配 NetworkPolicy、quota、Pod security 和外部 IAM；不能用 `cluster-admin` 掩蓋設計錯誤。

Default deny 後要明確允許入口到 API、API 到資料庫／queue、Pod 到 DNS、必要的回程和監控流量。確認 CNI 支援並檢查 selector、namespace selector、port、跨 Node route、MTU、CNI log、policy audit、DNS query 與封包。NetworkPolicy 應以服務身份與最小 port 定義，不要用全網段 allow 來快速「修好」超時。

### 6. Storage、PVC 與資料恢復

先查 PVC events、StorageClass、provisioner／CSI 狀態、capacity、access mode、volumeBindingMode、Node topology、quota 和 mount error。Worker 的暫存若可重建可用 ephemeral storage；API 不應共享資料庫 Volume。需要持久身份和每副本磁碟的資料服務使用 StatefulSet claim template 或外部託管資料庫，但要明確處理 RWO 不能同時掛載、節點故障、reclaim policy 與 migration。

備份的「成功」必須轉成週期性的 restore test、checksum／一致性驗證、RPO／RTO 和刪除保護。擴容前確認 backend、CSI、topology 和檔案系統支援；不要用清除 finalizer 或強制刪除來掩蓋資料狀態。PVC Pending 是 provisioning／拓撲／配額問題，不是單純把 Pod replicas 調高就能解決。

### 7. Probe、資源、發布與容量

Startup Probe 應覆蓋 image pull 後的初始化和連線池建立時間；Readiness 應確認應用能安全處理真實請求，並在可接受的下游故障或過載時移出 endpoints；Liveness 只判斷程序是否失去自我恢復能力，不應把每一次資料庫 timeout 都轉成重啟。修正後要觀察 startup／readiness／liveness events、Ready endpoint、restart、P99、錯誤率和資料庫連線，而不是只調大 failure threshold。

Requests 要以穩定負載與 p95／p99 使用量校準，影響 scheduler 和 HPA CPU 分母；Limits 要涵蓋合理峰值並保留 node、system、daemon 與 rollout surge 的 headroom，避免 memory OOM 和 CPU throttling。分析 QoS、eviction、Node allocatable、Pending age、metrics freshness、HPA condition、queue depth／request rate 和 Cluster Autoscaler latency；HPA 只看 CPU 不能直接解決 I/O、P99、PVC Pending 或供給延遲。需要時才加入業務訊號和 backpressure，並設定 scale-up／scale-down stabilization。

Deployment 先 pause 或 rollback 到可證明的舊 digest，確認舊版本有容量、Service endpoint 和資料相容性，再用較保守的 surge／unavailable、清楚的 progress deadline 和分階段流量重新發布。每階段都要有錯誤率、P99、Ready ratio、OOM／throttling、Pending、node pressure、HPA freshness 和安全 policy 的 gate；任何 digest 不符、secret 進入 artifact、跨租戶流量、未授權讀取、恢復資料不一致或核心 SLO 超標都應停止並回退。

### 8. 驗證矩陣

先以兩個乾淨 CI runner 重建同一 commit，驗證 digest、SBOM、簽章、provenance、registry pull 和 admission；再在預發以固定 digest 測試 image pull、Pod restart、慢啟動、資料庫／queue 暫斷、DNS、NetworkPolicy、Ingress 404／502、ConfigMap／Secret rotation、RBAC denied、PVC provision／restore、RWO 與節點故障。最後進行受控尖峰、rollout surge、CPU／memory／I/O 壓力和 rollback，觀察版本／digest、Pod condition、endpoint、Ingress、CNI、DNS、PVC／CSI、RBAC audit、P99、錯誤率、OOM／throttling、Pending age、node pressure、HPA 與 autoscaler。

每項測試都要有明確停止條件，例如未授權請求成功、secret 出現在 log／image、Ready ratio 低於門檻、P99／5xx 超過 error budget、OOM／eviction 增加、PVC restore checksum 不符或 metrics 過期。只有在舊版本可回退、資料可還原、服務流量只進健康 Pod、artifact digest 穩定且容量在尖峰仍有 headroom 時，才允許完成 rollout。

</details>

## 常見失分點

- 只把 `checkout:prod` tag 當成版本身分，沒有比較 manifest digest、來源 commit、SBOM、簽章、provenance 和實際 Pod image ID。
- 看到 Compose 的 `depends_on` 就認定資料庫已就緒，或把 bind mount、named volume 和環境變數直接搬到 Kubernetes 而沒有生命週期、備份與更新語意。
- 看到 Pod `Running` 或 Deployment replicas 正確就宣布恢復，忽略 readiness、EndpointSlice、Ingress path、Service port、DNS 與後端錯誤。
- 把 liveness 寫成資料庫健康檢查，或只調大 timeout／failure threshold，造成慢啟動誤殺與重啟風暴。
- 以全開放 NetworkPolicy、`cluster-admin`、掛載 Docker socket 或把 Secret 寫進 image 解決短期故障。
- 只提高 replicas、limits 或 HPA maxReplicas，沒有分析 requests 分母、cgroup throttling、OOM、node allocatable、PVC topology、metrics freshness 和 autoscaler latency。
- 把 Namespace 當成完整安全邊界，忽略 RBAC binding 作用域、ServiceAccount、NetworkPolicy、Pod security、外部 IAM 與 Secret at-rest encryption。
- 把 PVC Pending 或 RWO mount error 當成普通 Pod 問題，沒有檢查 CSI／provisioner、access mode、拓撲、reclaim policy 和真正的 restore test。
- 沒有保留舊 digest、舊 ReplicaSet 與資料相容性條件，就用刪除所有 Pod 或現場重建來「恢復」。

## 延伸追問

1. 如果兩個 runner 仍產生不同 image digest，但檔案內容看似相同，你會如何區分 base image 漂移、時間戳、檔案排序、建置器版本與非確定性依賴？
2. 如果 Service endpoints 都是 Ready，但 Ingress 仍偶發 502，你會如何比較 DNS、Load Balancer、controller reload、TLS upstream、connection reuse、NetworkPolicy 與後端 timeout？
3. 如果 Secret rotation 不能讓所有 Pod 同時重啟，你會如何設計雙憑證／雙連線、版本化 Secret、readiness gate、逐批 rollout 與撤銷舊 credential？
4. 如果 PVC 後端只能提供單一 zone 且資料服務必須跨 zone 可用，你會如何比較同步複寫、StatefulSet topology、外部資料庫、成本、RPO／RTO 與故障切換？
5. 如果 HPA 以 queue depth 擴容而 worker 又會改變 queue depth，你會如何避免 autoscaling feedback loop、冷啟動過衝與 scale-down 過早？
6. 如果 NetworkPolicy default deny 造成 DNS 間歇失敗，你會如何從 CNI、CoreDNS Service、NodeLocal DNS、UDP／TCP fallback、policy log 與 MTU 建立可重現測試？
7. 如果 rollback 後 API image 恢復但資料庫 migration 已向前，如何設計 expand／migrate／contract、向前相容與回滾邊界，避免只回退 container 卻破壞資料？
8. 如果節點資源足夠但 Pod 仍 Pending，你會如何排除 taint／toleration、affinity／anti-affinity、quota、PVC topology、priority／preemption、image pull 與 scheduler plugin？
