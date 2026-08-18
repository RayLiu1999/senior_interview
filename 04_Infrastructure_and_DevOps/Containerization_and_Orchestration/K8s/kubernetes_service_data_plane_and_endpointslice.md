# Kubernetes Service Data Plane 與 EndpointSlice

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Kubernetes`, `Service`, `EndpointSlice`, `kube-proxy`, `Networking`

## 問題詳述

請說明 Kubernetes Service 如何從穩定的虛擬端點一路解析到實際 Pod，並解釋 EndpointSlice、Service proxy、流量政策、來源 IP 與常見連線故障的責任邊界。

### 測驗對應

- **Concept ID**: `concept.kubernetes.networking.service-data-plane`
- **Learning Objectives**:
  - `LO-1`: 能描述 Service、selector、EndpointSlice、Pod readiness、Service proxy 與 Pod IP 之間的控制面與資料面關係。
  - `LO-2`: 能比較 ClusterIP、Headless Service、kube-proxy 與 eBPF data plane，以及來源 IP、流量政策與拓撲偏好的取捨。
  - `LO-3`: 能以 selector、EndpointSlice condition、Service port、路由、policy、proxy 規則與封包證據診斷無 endpoint、錯誤路由與流量不均。
- **Prerequisites**: [Pod 是什麼](./what_is_pod.md)、[Kubernetes 網路模型與 CNI](./kubernetes_networking.md)、[Service 的類型](./kubernetes_service_types.md)
- **Quick Quiz**: [Kubernetes Q15](../../../QUIZ/11_Kubernetes.md#q15)
- **Hard Assessment**: [Container Orchestration Boundary Incident](../../../QUIZ/Hard_Assessments/container_orchestration_boundary_incident.md) (`assessment.container-orchestration.boundary-incident.v1`)
- **Assessment Gate**: 完成 Hard Assessment 中對應的 `LO-1`～`LO-3`，並達到總分 3/4；若未達標，回讀本文後重測。

## 核心理論與詳解

### 為什麼需要 Service Data Plane

Pod 是可替換的執行單位。Deployment 更新、節點故障、擴縮或 probe 狀態變化，都可能讓 Pod IP、Pod 數量與 Pod 所在 Node 改變。若呼叫方直接記住 Pod IP，就會把短生命週期的執行個體錯當成穩定服務。

Service 將兩件事分開：

- **控制面**維護「哪些 endpoint 應該屬於這個服務」。
- **資料面**把送往穩定 Service 位址的封包導向目前可用的 endpoint。

因此，Service 物件存在、Pod 處於 Running、Pod 具備 Ready condition、EndpointSlice 有 endpoint，以及實際封包能抵達應用，是五個不同的狀態，不應混為一談。

### Service、Pod 與 EndpointSlice 的責任

#### Service

Service 是一個穩定的服務抽象，通常由以下資訊組成：

- `selector`: 用 label 找出候選 Pod。
- `port`: 呼叫方連線到的 Service port。
- `targetPort`: endpoint 應用實際監聽的 port，可以是數字或 named port。
- `type`: 決定主要暴露邊界，例如 ClusterIP、NodePort 或 LoadBalancer。
- 流量政策與 session affinity：影響 endpoint 選擇、來源 IP 與拓撲行為。

Service 不會替應用判斷「HTTP 200 才算成功」。它主要依賴 Pod readiness 與 endpoint condition 來決定哪些後端可以接收一般服務流量；應用層的正確性、授權與交易成功仍由應用自己負責。

#### EndpointSlice

EndpointSlice 是 Service 後端 endpoint 的可擴展表示。大型服務不應假設所有後端都塞在單一 Endpoints 物件中，而是要聚合同一個 Service 對應的多個 EndpointSlice。

一個 endpoint 通常包含：

- Pod IP 或其他可路由的 endpoint address。
- port 與 protocol。
- `ready`、`serving`、`terminating` 等狀態資訊。
- 所在的 Node、Zone 與 hostname 等拓撲資訊。

EndpointSlice 的重要性在於它同時連結了控制面與資料面：endpoint controller 依 selector 與 Pod 狀態更新它，Service proxy 再以它作為配置資料平面的來源。排查 Service 時只看 `kubectl get svc` 不夠，必須一起檢查 selector、EndpointSlice、endpoint condition 與實際 Pod listener。

#### Service proxy

Service proxy 觀察 Service 與 EndpointSlice，並在 Node 或其他網路資料面中建立轉送規則。傳統部署常見 kube-proxy，但部分 CNI 或雲端網路實作會提供整合式的 service proxy；因此「Service 一定是 kube-proxy 在做」不是可靠的抽象邊界。

實作可能使用：

- iptables 或 nftables 規則。
- IPVS 等核心負載平衡機制。
- 以 eBPF 在核心資料路徑中執行服務轉送與政策。
- 雲端負載平衡器或 CNI 自己的整合資料面。

面試或事故診斷的重點不是背出某個模式是唯一標準，而是確認當前叢集實際使用哪一個資料面，以及它是否已收到最新的 Service／EndpointSlice 狀態。

### 從 Service VIP 到 Pod IP 的流量路徑

以同一個叢集內的 ClusterIP 為例，可以把請求拆成兩條互補的路徑：

```text
控制面：Service + selector → EndpointSlice → Service proxy / CNI data plane

資料面：Client Pod → ClusterIP:port → endpoint PodIP:targetPort → Application
```

實際封包可能在來源 Node 上被轉送到本機或其他 Node 的 Pod。這裡有幾個容易被忽略的邊界：

1. **Service port 不等於 targetPort**：呼叫方連的是 Service port，後端 listener 必須對應 targetPort。
2. **Service IP 不一定是實體介面**：ClusterIP 是虛擬端點，資料面會依實作攔截、重寫或轉送封包。
3. **回程路徑也重要**：跨 Node、SNAT、路由與 cloud firewall 可能讓請求方向成功，但回程封包被丟棄。
4. **Ready 不代表應用邏輯成功**：Readiness 只表達是否適合接收流量，不能取代交易錯誤率或下游依賴的可用性判斷。
5. **長連線會影響分布**：HTTP/2、WebSocket、連線池與 client-side keep-alive 可能讓新 endpoint 已加入，但既有連線仍集中在舊 Pod。

### ClusterIP、Headless 與 endpoint 選擇

#### ClusterIP Service

ClusterIP 提供一個叢集內穩定的虛擬位址。呼叫端只需要知道 Service DNS 或 ClusterIP，不需要追蹤每一個 Pod。Service proxy 會將請求送往符合條件且可接收流量的 endpoint。

適合：

- 無狀態 API。
- 內部 worker 或資料服務的穩定入口。
- 希望把 client 與 Pod 生命週期解耦的服務。

#### Headless Service

`clusterIP: None` 的 Headless Service 不提供一般 ClusterIP 負載平衡，而是讓 DNS 回傳後端 Pod 位址。這常用於 StatefulSet 或需要由 client 自己選擇節點的協定。

它的取捨是：

- 呼叫端可以直接看到 endpoint，適合需要身份與拓撲的協定。
- 負載均衡、重試、故障剔除與連線管理會更多地落在 client 或資料服務上。
- Pod IP 仍會因重建而變化，穩定的應是可解析的名稱與 Stateful identity，而不是手動保存 IP。

### 流量政策、來源 IP 與拓撲

Service 的「能不能到達」和「應該送到哪裡」是不同問題。以下設定會改變資料面行為：

#### `internalTrafficPolicy`

它可以讓叢集內的請求偏向或限制在同一個 Node 的 endpoint。好處是減少跨 Node hop，代價是某個 Node 沒有本地 endpoint 時可能沒有可用後端，不能只把它當成效能開關。

#### `externalTrafficPolicy`

對外部流量而言，`Local` 通常用來保留來源 IP，並避免先繞到沒有本地 endpoint 的 Node；但它要求外部負載平衡器與 Node 健康檢查正確，否則可能造成流量集中或部分 Node 看似可連、實際沒有 endpoint。

#### Session affinity

以 client IP 維持黏性可以滿足少數需要連續命中同一後端的情境，但會降低負載分散能力，並且在 NAT 後多個 client 可能共享同一來源 IP。它也不能取代真正的 session storage 或資料一致性設計。

#### Zone 與 Node locality

在多 Zone 叢集中，拓撲偏好可以降低跨區延遲與流量成本，但必須同時檢查：

- 每個 Zone 是否有足夠 Ready endpoint。
- 失去一個 Zone 後是否仍有容量。
- 偏好是否只是 preference，而不是可用性保證。
- 長連線與 client-side load balancing 是否讓分布偏離預期。

### 常見故障的責任邊界

| 現象 | 先確認 | 不要直接假設 |
|---|---|---|
| Service 沒有 endpoint | selector、Pod labels、Pod readiness、EndpointSlice condition | Service 物件壞掉 |
| endpoint 存在但 `connection refused` | targetPort、應用 listener、container port、NetworkPolicy | 一定是 CNI |
| endpoint 存在但 timeout | Pod IP route、跨 Node 路徑、MTU、policy、回程路由、CNI log | 應用一定變慢 |
| 只有部分版本收到流量 | selector 是否過寬、版本 labels、EndpointSlice、rollout 狀態 | kube-proxy 隨機出錯 |
| 來源 IP 不見 | externalTrafficPolicy、SNAT 位置、LB hop、proxy protocol | 應用讀錯 header |
| 新 Pod Ready 但流量仍集中舊 Pod | 長連線、連線池、session affinity、client-side balancing | EndpointSlice 沒更新 |

### 建立可重複的排查順序

遇到「Service 連不上」時，應由控制面到資料面逐層縮小範圍：

1. 確認呼叫端使用的 hostname、namespace、port 與 protocol。
2. 檢查 Service selector、port／targetPort、type 與流量政策。
3. 檢查所有對應 EndpointSlice，而不是只看舊的 Endpoints 物件。
4. 確認 endpoint 的 Ready、Serving、Terminating 狀態與 Pod readiness event。
5. 從呼叫端 Pod 檢查 DNS 解析、Service VIP、Pod IP 與實際 port 的差異。
6. 依叢集實作檢查 kube-proxy、nftables／iptables／IPVS／eBPF 或雲端 LB 配置是否已同步。
7. 跨 Node 時檢查 Node route、CNI 狀態、MTU、NetworkPolicy、security group 與回程路徑。
8. 最後才把請求 trace、應用 log、延遲與錯誤率和資料面證據對齊。

### 生產設計重點

- Service selector 應使用清楚的 workload identity，避免只用過寬的 `app` label 把不相容版本或不同角色混在一起。
- rollout 時要同時觀察 Ready endpoint 數量、版本／digest 分布、P50／P99、錯誤率與長連線狀態。
- 對外服務要明確記錄來源 IP 是否需要保留、TLS 在哪一跳終止、健康檢查打到哪一層，以及沒有本地 endpoint 時的行為。
- 大型 Service 應使用 EndpointSlice API；自製 controller 或觀測工具必須聚合所有對應 Slice，不能只讀單一物件。
- Service proxy、CNI、Ingress／Gateway 與 NetworkPolicy 的責任要分開監控，避免把所有網路錯誤歸因給同一個元件。

## 總結

Service 不是單純的一個虛擬 IP，而是一條由 selector、EndpointSlice、Pod condition、Service proxy、路由與政策共同組成的資料路徑。最可靠的回答方式是先畫出控制面與資料面，再用 endpoint、port、route、policy、來源 IP 與封包證據逐跳驗證。
