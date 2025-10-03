# Kubernetes 網路模型與 CNI

- **難度**: 7
- **標籤**: `Kubernetes`, `Networking`, `CNI`

## 問題詳述

請解釋 Kubernetes 的網路模型、CNI (Container Network Interface) 的作用，以及常見的 CNI 插件（如 Calico、Flannel）的工作原理。

## 核心理論與詳解

### Kubernetes 網路基本要求

Kubernetes 定義了一個**扁平化網路模型**，有以下三個基本要求：

1. **所有 Pod 之間可以直接通信**（無需 NAT）
2. **所有 Node 與 Pod 之間可以直接通信**（無需 NAT）
3. **Pod 看到的自己的 IP 與其他 Pod 看到的 IP 一致**

**設計理念**：
- 簡化網路複雜度
- 讓容器網路類似虛擬機網路
- 網路實現由第三方插件（CNI）提供

### Kubernetes 中的網路通信類型

#### 1. Container-to-Container（同一 Pod 內）

**機制**：
- 同一 Pod 內的容器共享**網路命名空間**
- 使用 `localhost` 互相訪問
- 共享相同的 IP 位址

**示意圖**：
```
┌─────────────────────────────────┐
│          Pod                    │
│  ┌──────────┐    ┌──────────┐  │
│  │Container1│    │Container2│  │
│  │  :8080   │←→  │  :9090   │  │
│  └──────────┘    └──────────┘  │
│      localhost 通信              │
│      共享 IP: 10.244.1.5        │
└─────────────────────────────────┘
```

#### 2. Pod-to-Pod（同一 Node 內）

**機制**：
- 透過虛擬網橋（cbr0 或 docker0）通信
- 每個 Pod 有唯一的 IP
- 直接 IP 路由

**示意圖**：
```
┌───────────────── Node ─────────────────┐
│                                        │
│  ┌─────────┐           ┌─────────┐    │
│  │  Pod A  │           │  Pod B  │    │
│  │10.244.1.5│          │10.244.1.6│   │
│  └────┬────┘           └────┬────┘    │
│       │                     │          │
│       └────────┬────────────┘          │
│                │                        │
│           ┌────▼────┐                  │
│           │  cbr0   │                  │
│           │ Bridge  │                  │
│           └─────────┘                  │
└────────────────────────────────────────┘
```

#### 3. Pod-to-Pod（跨 Node）

**機制**：
- 透過 Overlay 網路或路由表
- CNI 插件負責實現

**示意圖**：
```
┌────── Node 1 ──────┐        ┌────── Node 2 ──────┐
│  ┌─────────┐       │        │       ┌─────────┐  │
│  │  Pod A  │       │        │       │  Pod B  │  │
│  │10.244.1.5│      │        │       │10.244.2.5│ │
│  └────┬────┘       │        │       └────┬────┘  │
│       │            │        │            │        │
│  ┌────▼────┐       │        │       ┌────▼────┐  │
│  │  cbr0   │       │        │       │  cbr0   │  │
│  └────┬────┘       │        │       └────┬────┘  │
│       │            │        │            │        │
│  ┌────▼────┐       │        │       ┌────▼────┐  │
│  │  eth0   │───────┼────────┼───────│  eth0   │  │
│  └─────────┘       │        │       └─────────┘  │
└────────────────────┘        └────────────────────┘
         │                              │
         └──────────► Overlay ◄─────────┘
            (VXLAN / IP-in-IP / BGP)
```

#### 4. Pod-to-Service

**機制**：
- 透過 kube-proxy 實現
- iptables 或 IPVS 規則進行負載均衡

#### 5. External-to-Service

**機制**：
- 透過 Service (NodePort/LoadBalancer) 或 Ingress

### CNI (Container Network Interface)

#### 什麼是 CNI

**定義**：
- CNCF 的容器網路標準接口
- 定義容器運行時如何配置網路
- 插件化、可擴展

**CNI 的職責**：
1. 為容器分配 IP 位址
2. 配置網路介面（veth pair）
3. 設置路由規則
4. 配置 NAT 規則（如果需要）

#### CNI 工作流程

**Pod 創建時**：
1. kubelet 創建 Pod 的網路命名空間
2. kubelet 調用 CNI 插件的 `ADD` 命令
3. CNI 插件分配 IP 並配置網路
4. 返回配置結果給 kubelet

**Pod 刪除時**：
1. kubelet 調用 CNI 插件的 `DEL` 命令
2. CNI 插件清理網路資源

**CNI 配置範例**：
```json
{
  "cniVersion": "0.4.0",
  "name": "mynet",
  "type": "bridge",
  "bridge": "cbr0",
  "isGateway": true,
  "ipMasq": true,
  "ipam": {
    "type": "host-local",
    "subnet": "10.244.0.0/16",
    "routes": [
      { "dst": "0.0.0.0/0" }
    ]
  }
}
```

### 常見的 CNI 插件

#### 1. Flannel

**特點**：
- 最簡單、最易部署
- 專注於網路連通性
- 不支援網路策略（Network Policy）

**工作原理**：
- 為每個 Node 分配一個子網（如 10.244.1.0/24）
- 使用 Overlay 網路技術

**支援的 Backend**：

| Backend | 原理 | 性能 | 適用場景 |
|---------|------|------|---------|
| **VXLAN** | Overlay 網路（預設） | 中 | 通用 |
| **Host-GW** | 直接路由 | 高 | 二層互通的網路 |
| **UDP** | 使用 UDP 封包 | 低 | 測試環境 |

**VXLAN 模式示意**：
```
Node 1                          Node 2
┌──────────────┐              ┌──────────────┐
│ Pod: 10.244.1.5              │ Pod: 10.244.2.5
│      ↓                       │      ↓
│ flannel.1                    │ flannel.1
│ (VXLAN device)               │ (VXLAN device)
│      ↓                       │      ↓
│    eth0 ────────────────────→    eth0
│ (封裝 VXLAN)                 │ (解封裝)
└──────────────┘              └──────────────┘
```

**部署範例**：
```bash
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```

#### 2. Calico

**特點**：
- 使用純 **BGP** 路由（無 Overlay）
- 支援**網路策略**（Network Policy）
- 高性能、可擴展

**工作原理**：
- 使用 BGP 協議交換路由資訊
- 每個 Node 是一個虛擬路由器
- 使用 IP-in-IP 或 VXLAN（可選）

**網路模式**：

| 模式 | 說明 | 性能 | 適用場景 |
|------|------|------|---------|
| **BGP** | 純三層路由 | 最高 | 可控制路由的環境 |
| **IP-in-IP** | Overlay（跨子網） | 高 | 跨子網環境 |
| **VXLAN** | Overlay | 中 | 不支援 BGP 的環境 |

**BGP 模式示意**：
```
┌─── Node 1 ───┐         ┌─── Node 2 ───┐
│ Pod: 10.244.1.5         │ Pod: 10.244.2.5
│      ↓                  │      ↓
│   cali123               │   cali456
│  (veth pair)            │  (veth pair)
│      ↓                  │      ↓
│ Route Table:            │ Route Table:
│ 10.244.2.0/24           │ 10.244.1.0/24
│   via Node2 IP          │   via Node1 IP
│      ↓                  │      ↓
│    eth0 ────────────────→    eth0
└─────────────┘          └─────────────┘
       BGP 交換路由資訊
```

**部署範例**：
```bash
kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml
```

**Network Policy 範例**：
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-ingress
spec:
  podSelector: {}
  policyTypes:
  - Ingress
```

#### 3. Weave Net

**特點**：
- 自動發現網路拓撲
- 支援網路加密
- 簡單易用

**工作原理**：
- 使用 VXLAN Overlay
- 分佈式數據存儲（無需 etcd）

#### 4. Cilium

**特點**：
- 基於 **eBPF** 技術（高性能）
- 支援 L7 網路策略
- 可觀測性強

**工作原理**：
- 使用 eBPF 在核心層進行封包處理
- 無需 iptables

**優勢**：
- 極高性能
- 支援 HTTP/gRPC 層級的策略
- 深度可觀測性

#### CNI 插件對比

| 特性 | Flannel | Calico | Weave | Cilium |
|------|---------|--------|-------|--------|
| **Network Policy** | ❌ | ✅ | ✅ | ✅ |
| **Overlay** | VXLAN | IP-in-IP/VXLAN | VXLAN | VXLAN/Geneve |
| **BGP** | ❌ | ✅ | ❌ | ✅ |
| **加密** | ❌ | ✅ | ✅ | ✅ |
| **性能** | 中 | 高 | 中 | 最高 |
| **複雜度** | 低 | 中 | 低 | 高 |
| **適用場景** | 小型集群 | 企業級 | 中型集群 | 需要高性能和可觀測性 |

### 網路策略 (Network Policy)

#### 什麼是 Network Policy

**定義**：
- Kubernetes 的防火牆規則
- 控制 Pod 之間的流量
- 基於標籤選擇器

**預設行為**：
- 未定義 NetworkPolicy：所有流量允許
- 定義後：預設拒絕，只允許明確規則

#### Network Policy 範例

**拒絕所有 Ingress**：
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: production
spec:
  podSelector: {}    # 選擇所有 Pod
  policyTypes:
  - Ingress
```

**允許特定來源**：
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080
```

**允許特定命名空間**：
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-namespace
spec:
  podSelector:
    matchLabels:
      app: backend
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          env: production
```

**Egress 限制**：
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-external
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Egress
  egress:
  - to:
    - podSelector: {}    # 只允許訪問集群內 Pod
  - to:
    - namespaceSelector:
        matchLabels:
          name: kube-system
    ports:
    - protocol: UDP
      port: 53    # 允許 DNS
```

### Service 與 kube-proxy

#### kube-proxy 的作用

**職責**：
- 實現 Service 的虛擬 IP
- 負載均衡到後端 Pod
- 維護網路規則

#### kube-proxy 的模式

**1. iptables 模式**（預設）：
```bash
# Service IP: 10.96.0.10:80
# 後端 Pod: 10.244.1.5:8080, 10.244.2.6:8080

iptables -t nat -A PREROUTING -d 10.96.0.10 -p tcp --dport 80 \
  -j DNAT --to-destination 10.244.1.5:8080

iptables -t nat -A PREROUTING -d 10.96.0.10 -p tcp --dport 80 \
  -j DNAT --to-destination 10.244.2.6:8080
```

**優點**：成熟穩定
**缺點**：大量 Service 時性能下降

**2. IPVS 模式**：
```bash
# 使用 Linux 核心的 IPVS 模組
ipvsadm -A -t 10.96.0.10:80 -s rr
ipvsadm -a -t 10.96.0.10:80 -r 10.244.1.5:8080 -m
ipvsadm -a -t 10.96.0.10:80 -r 10.244.2.6:8080 -m
```

**優點**：高性能、支援多種負載均衡算法
**缺點**：需要額外核心模組

### 除錯與監控

#### 常用命令

```bash
# 查看 Pod IP
kubectl get pod -o wide

# 查看 CNI 配置
cat /etc/cni/net.d/10-calico.conflist

# 查看網路介面
ip addr show

# 查看路由表
ip route show

# 測試 Pod 連通性
kubectl exec -it pod-a -- ping 10.244.2.5

# 查看 iptables 規則
iptables -t nat -L -n

# 查看 IPVS 規則（IPVS 模式）
ipvsadm -Ln
```

## 總結

**Kubernetes 網路模型**：
- 扁平化網路，所有 Pod 可直接通信
- 由 CNI 插件實現
- 支援多種網路方案

**CNI 選擇建議**：
- **小型集群**：Flannel（簡單）
- **企業級**：Calico（性能 + Network Policy）
- **需要可觀測性**：Cilium（eBPF）

**Network Policy**：
- 實現微隔離
- 需要 CNI 支援
- 預設允許，定義後預設拒絕

理解 Kubernetes 網路模型是排查網路問題和設計安全架構的基礎。
