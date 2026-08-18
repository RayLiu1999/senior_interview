# Kubernetes DNS 與 Service Discovery

- **難度**: 6
- **重要程度**: 5
- **標籤**: `Kubernetes`, `DNS`, `CoreDNS`, `Service Discovery`, `Networking`

## 問題詳述

請說明 Kubernetes 如何透過 DNS 讓工作負載找到 Service，並分析 CoreDNS、namespace search、Headless Service、DNS policy、快取與 NetworkPolicy 對服務發現和故障排查的影響。

### 測驗對應

- **Concept ID**: `concept.kubernetes.networking.dns-service-discovery`
- **Learning Objectives**:
  - `LO-1`: 能描述 Service DNS 名稱、namespace、cluster domain、CoreDNS、Pod resolver 設定與 endpoint 的關係。
  - `LO-2`: 能比較 ClusterIP、Headless、ExternalName 與環境變數服務發現的生命週期、快取、負載均衡與故障邊界。
  - `LO-3`: 能以 `resolv.conf`、DNS response、Service、EndpointSlice、CoreDNS log／metrics 與 NetworkPolicy 證據診斷 NXDOMAIN、SERVFAIL、timeout 與錯誤路由。
- **Prerequisites**: [Kubernetes 網路模型與 CNI](./kubernetes_networking.md)、[Service 的類型](./kubernetes_service_types.md)、[Service Data Plane 與 EndpointSlice](./kubernetes_service_data_plane_and_endpointslice.md)
- **Quick Quiz**: [Kubernetes Q16](../../../QUIZ/11_Kubernetes.md#q16)
- **Hard Assessment**: [Container Orchestration Boundary Incident](../../../QUIZ/Hard_Assessments/container_orchestration_boundary_incident.md) (`assessment.container-orchestration.boundary-incident.v1`)
- **Assessment Gate**: 完成 Hard Assessment 中對應的 `LO-1`～`LO-3`，並達到總分 3/4；若未達標，回讀本文後重測。

## 核心理論與詳解

### Service Discovery 解決什麼問題

Kubernetes Pod 的位址與數量會隨部署、擴縮與節點故障變化。應用不應把某一個 Pod IP 寫死，也不應要求每個呼叫方自行維護後端清單。

Service Discovery 將「我要找哪個服務」和「目前有哪些可用 endpoint」分開：

- **Service** 定義邏輯服務、selector、port 與暴露策略。
- **EndpointSlice** 反映目前符合條件的 endpoint 與 readiness／拓撲資訊。
- **CoreDNS** 將 Kubernetes API 中的 Service 與 Pod 資訊轉成 DNS 回應。
- **Client** 透過名稱解析取得 Service IP 或 endpoint，再由 Service data plane 或 client-side load balancing 完成連線。

因此 DNS 成功只代表名稱被解析，不代表後端應用可用；DNS、Service、EndpointSlice、NetworkPolicy 與應用 listener 必須分別驗證。

### Kubernetes Service DNS 名稱

以 namespace `checkout` 中名為 `api` 的 Service 為例，常見名稱由短到長如下：

| 名稱 | 使用情境 | 解析範圍 |
|---|---|---|
| `api` | 同 namespace 的工作負載 | 依 Pod 的 search list 解析 |
| `api.checkout` | 跨 namespace 的簡短名稱 | 指定 Service 所在 namespace |
| `api.checkout.svc` | 明確指出 Service 類型 | 叢集內 DNS domain |
| `api.checkout.svc.cluster.local` | 完整服務名稱 | 不依賴短名稱 search list |

實際 cluster domain 不一定是 `cluster.local`，應以叢集設定與 Pod 的 `/etc/resolv.conf` 為準。跨 namespace 呼叫不能只寫 `api`，否則查詢會先落在呼叫端自己的 namespace。

Service DNS 通常提供：

- ClusterIP Service 的 A 或 AAAA record，指向穩定的 Service 虛擬位址。
- named port 的 SRV record，讓 client 取得服務 port 與名稱。
- Headless Service 的 endpoint 位址，讓 client 直接看到後端 Pod IP。
- ExternalName 的 DNS alias；它是名稱轉換，不等於 Kubernetes 替外部服務建立健康檢查或網路代理。

### CoreDNS 的責任與限制

CoreDNS 通常以叢集內的 DNS Service 提供解析能力，並觀察 Kubernetes API 的 Service、EndpointSlice 與相關物件。當 Service 或 endpoint 發生變化時，DNS 回應會隨控制面狀態與 DNS cache 更新。

要正確理解 CoreDNS 的邊界：

1. CoreDNS 負責回答名稱，不負責保證應用 port 有 listen。
2. CoreDNS 讀到的 endpoint 狀態可能受 API、watch、cache 與更新傳播延遲影響。
3. DNS 回應的 TTL、negative cache 與 client resolver 行為會影響變更何時生效。
4. CoreDNS 自己也是 Pod，可能受到排程、資源、NetworkPolicy、Node 壓力或叢集 DNS Service 故障影響。
5. 外部名稱通常會被轉送到 upstream resolver；外部 DNS、企業 DNS、VPC resolver 與叢集 DNS 是不同責任邊界。

### ClusterIP、Headless 與 ExternalName 的差異

#### ClusterIP Service

ClusterIP 的 DNS 回應通常是穩定的 Service 位址。client 不需要知道 Pod IP，後續由 Service data plane 根據 EndpointSlice 將請求導向 endpoint。

它適合一般 HTTP API、內部微服務與大多數無狀態工作負載。應用應連線到 Service DNS，而不是把解析結果永久當成固定 IP；即使 Service IP 穩定，也不能假設後端連線會永久存在。

#### Headless Service

Headless Service 沒有一般 ClusterIP，DNS 會回傳符合條件的 endpoint 位址。這讓 client 或資料服務自行執行拓撲感知、leader discovery、replica selection 或 client-side load balancing。

它適合需要穩定 Pod identity 的 StatefulSet 或特定資料協定，但增加了 client 責任：

- client 必須處理多筆 A／AAAA response。
- client 必須在 endpoint 變化時重新解析或更新連線。
- retry、故障剔除與負載分布不再由單一 Service proxy 完成。
- Pod IP 仍是暫時位址，穩定性來自 DNS 名稱與工作負載 identity。

#### ExternalName

ExternalName 將 Kubernetes Service 名稱映射到外部 DNS 名稱。它不會自動驗證外部服務健康、不會自動建立雲端 Load Balancer，也不會替外部服務補上 NetworkPolicy 或 TLS trust。

使用時要明確確認：外部 DNS 是否可解析、Pod egress 是否允許、TLS certificate 是否匹配外部 hostname，以及外部服務是否需要固定出口 IP。

### Pod DNS Policy 與 resolver 行為

常見的 Pod DNS policy 包含：

- **ClusterFirst**：叢集內名稱交給 cluster DNS，非叢集名稱再依設定轉送 upstream；一般 Pod 通常使用這個策略。
- **Default**：沿用 Node 的 DNS 設定；適合有明確主機網路或特殊 resolver 需求的工作負載，但會失去部分叢集 DNS 預期。
- **ClusterFirstWithHostNet**：`hostNetwork` Pod 若仍要優先使用叢集 DNS，必須明確使用對應策略。
- **None**：由 `dnsConfig` 完全自訂 resolver，必須自行承擔 nameserver、search domain、options 與故障行為。

`/etc/resolv.conf` 中的 nameserver、search 與 `ndots` 會直接影響查詢數量與延遲。當應用查詢外部名稱時，如果 search list 很長且 `ndots` 設定不合適，可能先產生多次叢集內部查詢，再送往 upstream，造成額外延遲或 DNS 流量尖峰。

不要只在應用內把 DNS cache 設成永久。Service endpoint、憑證、外部服務與故障切換都可能需要重新解析；cache policy 應和 TTL、連線重用、故障轉移時間及上游 resolver 行為一起設計。

### DNS 與 NetworkPolicy 的互動

一旦 namespace 套用 default-deny egress，應用通常需要明確允許到叢集 DNS Service 的 UDP 53，並視 resolver fallback 與封包大小允許 TCP 53。只允許 TCP 或只允許 UDP 都可能在特定 response、截斷或 DNSSEC 情況下造成間歇性錯誤。

必要的網路邊界通常包括：

- 工作負載到 CoreDNS Service 的 DNS 流量。
- 工作負載到入口、資料庫、queue 或外部 API 的必要 egress。
- CoreDNS 到 upstream resolver 的 egress。
- 跨 namespace 時以 namespaceSelector 與 port 建立清楚的 allow rule。

NetworkPolicy 是否真的執行取決於 CNI 的支援。遇到 DNS timeout 時，要同時確認 policy selector、CoreDNS endpoint、Service IP、Node route、CNI log 與 packet evidence，而不是只把 DNS server 改成公共 DNS。

### 常見 DNS 故障分類

| 現象 | 可能邊界 | 優先驗證 |
|---|---|---|
| `NXDOMAIN` | 名稱、namespace、cluster domain 或 Service 不存在 | Service 名稱、namespace、完整 FQDN、DNS response |
| `SERVFAIL` | CoreDNS、upstream、plugin 或 DNSSEC／轉送異常 | CoreDNS log／metrics、upstream resolver、response chain |
| `i/o timeout` | policy、route、DNS Pod、Node 或 UDP／TCP 被阻擋 | `/etc/resolv.conf`、CoreDNS endpoints、NetworkPolicy、封包 |
| DNS 成功但 `connection refused` | targetPort、應用 listener 或 Service port 錯誤 | Service port／targetPort、Pod listener、EndpointSlice |
| 解析到舊 endpoint | cache、長連線或更新傳播延遲 | TTL、client cache、EndpointSlice condition、連線建立時間 |
| 同名服務在不同 namespace 結果不同 | search domain 與 namespace scope | 呼叫端 namespace、search list、使用完整服務名稱 |
| 外部名稱解析成功但連線失敗 | egress、NAT、TLS、外部 firewall 或 allowlist | route、出口 IP、TLS SNI／certificate、外部 audit |

### 建立可重複的 DNS 排查流程

1. 先記錄查詢名稱、查詢類型、呼叫端 namespace、Pod DNS policy 與時間點。
2. 讀取呼叫端 Pod 的 `/etc/resolv.conf`，確認 nameserver、search、options 與 `ndots`。
3. 從同一個 network namespace 分別查短名稱、namespace-qualified 名稱與完整 FQDN，區分 search 問題和 DNS server 問題。
4. 檢查 Service 的 type、selector、clusterIP、port 與 EndpointSlice；不要把「有 DNS record」當成「有 Ready backend」。
5. 檢查 CoreDNS Pod、DNS Service、endpoint、資源使用量、延遲與錯誤率。
6. 檢查 NetworkPolicy 是否允許到 DNS 的 UDP／TCP 53，以及 CoreDNS 到 upstream 的 egress。
7. 若只有部分 Node 或部分 namespace 發生問題，對比 Node、CNI、route、policy、DNS cache 與 resolver 設定。
8. 最後將 DNS latency、連線建立時間、應用 timeout、P99 與 upstream response 對齊，區分解析慢和後端慢。

### Service Discovery 的生產設計

- 一般服務優先使用 Service DNS，不要在設定檔、環境變數或資料庫中永久保存 Pod IP。
- 跨 namespace 呼叫使用明確的 namespace-qualified 名稱，避免短名稱在重構 namespace 後指到不同服務。
- Headless Service 要搭配能處理多 endpoint、TTL、重解析與故障剔除的 client；不能只把 ClusterIP 改成 None 就宣稱完成高可用。
- DNS 是控制面到資料面之間的快取邊界，應監控 query rate、latency、SERVFAIL、NXDOMAIN、cache hit 與 CoreDNS saturation。
- default-deny 佈署要把 DNS allow rule 當成基礎依賴，並以實際 resolver 需要決定 UDP、TCP、IPv4 與 IPv6 規則。
- 對外依賴要同時設計 DNS、egress policy、固定出口 IP、TLS trust、timeout、retry 與 circuit breaking。

## 總結

Kubernetes DNS 是 Service Discovery 的入口，不是整條服務可用性的保證。完整診斷必須沿著「名稱 → DNS response → Service → EndpointSlice → Service data plane → Pod listener → egress／回程」逐段驗證，才能分辨是名稱、控制面、資料面、政策或應用本身的問題。
