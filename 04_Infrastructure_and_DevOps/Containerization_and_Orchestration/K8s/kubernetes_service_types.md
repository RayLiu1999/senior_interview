# Service 的類型：ClusterIP、NodePort、LoadBalancer

- **難度**: 6
- **標籤**: `Kubernetes`, `Service`, `Networking`

## 問題詳述

請詳細解釋 Kubernetes Service 的三種主要類型：ClusterIP、NodePort 和 LoadBalancer，以及它們的適用場景和實現原理。

## 核心理論與詳解

### 什麼是 Kubernetes Service

**Service** 是 Kubernetes 中用於暴露應用的抽象層，它提供：
- **穩定的網路端點**：Pod IP 會變化，Service IP 保持不變
- **負載均衡**：在多個 Pod 之間分配流量
- **服務發現**：通過 DNS 或環境變數訪問服務

### Service 的三種主要類型

#### 1. ClusterIP（預設類型）

**定義**：
- 只在集群內部可訪問的虛擬 IP
- Kubernetes 預設的 Service 類型
- 提供集群內部的服務發現和負載均衡

**特點**：
- IP 地址只在集群內部有效
- 不能從集群外部訪問
- 適合內部微服務之間的通訊

**YAML 範例**：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: ClusterIP    # 可省略，預設就是 ClusterIP
  selector:
    app: my-app
  ports:
  - protocol: TCP
    port: 80         # Service 端口
    targetPort: 8080 # Pod 端口
```

**訪問方式**：

1. **ClusterIP 訪問**：
   ```bash
   curl http://10.96.0.10:80
   ```

2. **DNS 訪問**（推薦）：
   ```bash
   curl http://my-service:80
   curl http://my-service.default.svc.cluster.local:80
   ```

**使用場景**：
- 微服務之間的通訊
- 資料庫服務（只允許內部訪問）
- 內部 API 服務
- 不需要外部訪問的服務

**實現原理**：
- kube-proxy 在每個節點上設置 iptables 或 IPVS 規則
- 將發往 ClusterIP 的流量轉發到後端 Pod
- 實現負載均衡（預設 Round Robin）

---

#### 2. NodePort

**定義**：
- 在每個節點上開放一個靜態端口（30000-32767）
- 通過 `<NodeIP>:<NodePort>` 從集群外部訪問服務
- 自動創建 ClusterIP

**特點**：
- 可以從集群外部訪問
- 端口範圍：30000-32767（可配置）
- 每個節點都會監聽該端口

**YAML 範例**：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: NodePort
  selector:
    app: my-app
  ports:
  - protocol: TCP
    port: 80         # Service 端口（ClusterIP）
    targetPort: 8080 # Pod 端口
    nodePort: 30080  # 節點端口（可選，不指定則自動分配）
```

**訪問方式**：

1. **通過任一節點 IP 訪問**：
   ```bash
   curl http://192.168.1.10:30080
   curl http://192.168.1.11:30080  # 任一節點都可以
   ```

2. **集群內部訪問**（仍可使用 ClusterIP）：
   ```bash
   curl http://my-service:80
   ```

**使用場景**：
- 開發和測試環境快速暴露服務
- 小規模生產環境
- 不需要複雜負載均衡的場景
- 臨時暴露服務給外部訪問

**實現原理**：
1. 在每個節點上監聽 NodePort
2. 流量到達任一節點的 NodePort
3. 轉發到 ClusterIP
4. 再轉發到後端 Pod（可能在其他節點）

**優缺點**：

**優點**：
- 簡單易用，無需額外組件
- 適合快速測試

**缺點**：
- 端口範圍受限（30000-32767）
- 需要記住端口號
- 不支援 HTTPS 終止
- 沒有域名支援

---

#### 3. LoadBalancer

**定義**：
- 使用雲平台的負載均衡器暴露服務
- 自動創建 NodePort 和 ClusterIP
- 提供固定的外部 IP 地址

**特點**：
- 需要雲平台支援（AWS ELB、GCP Load Balancer、Azure Load Balancer）
- 自動配置雲端負載均衡器
- 提供外部可訪問的 IP

**YAML 範例**：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: LoadBalancer
  selector:
    app: my-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  # 雲平台特定的註解
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
```

**訪問方式**：

1. **通過外部 IP 訪問**：
   ```bash
   curl http://34.123.45.67:80
   ```

2. **通過域名**（配置 DNS）：
   ```bash
   curl http://myapp.example.com
   ```

**使用場景**：
- 生產環境暴露服務
- 需要固定外部 IP 的服務
- 需要雲平台負載均衡器的高級功能
- 高流量的 Web 應用

**實現原理**：
1. K8s 向雲平台請求創建負載均衡器
2. 雲平台創建 LB 並分配外部 IP
3. LB 將流量轉發到 NodePort
4. NodePort 再轉發到 Pod

**雲平台支援**：

- **AWS**：Classic Load Balancer、Network Load Balancer
- **GCP**：Network Load Balancing、HTTP(S) Load Balancing
- **Azure**：Azure Load Balancer
- **本地環境**：MetalLB（開源方案）

**優缺點**：

**優點**：
- 固定的外部 IP
- 雲平台原生負載均衡功能
- 高可用性
- 支援健康檢查

**缺點**：
- 需要雲平台支援
- 每個 Service 都會創建一個 LB（成本較高）
- 本地環境需要額外配置（如 MetalLB）

---

### 三種類型的層級關係

```
┌──────────────────────────────────────────┐
│         LoadBalancer Service              │
│  (外部 IP: 34.123.45.67:80)              │
│            ↓                              │
│    ┌─────────────────────┐               │
│    │  NodePort Service   │               │
│    │  (NodePort: 30080)  │               │
│    │        ↓            │               │
│    │  ┌───────────────┐  │               │
│    │  │ ClusterIP     │  │               │
│    │  │ (10.96.0.10)  │  │               │
│    │  └───────────────┘  │               │
│    └─────────────────────┘               │
│            ↓                              │
│    ┌──────────────────┐                  │
│    │  Pod Endpoints   │                  │
│    │  10.244.1.5:8080 │                  │
│    │  10.244.2.3:8080 │                  │
│    │  10.244.3.7:8080 │                  │
│    └──────────────────┘                  │
└──────────────────────────────────────────┘
```

- **LoadBalancer** 包含 NodePort 和 ClusterIP
- **NodePort** 包含 ClusterIP
- **ClusterIP** 是基礎層

### 其他 Service 類型

#### ExternalName

**定義**：
- 將 Service 映射到外部 DNS 名稱
- 不創建任何代理

**範例**：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-database
spec:
  type: ExternalName
  externalName: database.example.com
```

**使用場景**：
- 訪問集群外部的服務
- 遷移過程中的服務別名

#### Headless Service

**定義**：
- `clusterIP: None`
- 不分配 ClusterIP
- DNS 直接返回 Pod IP 列表

**範例**：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-statefulset-service
spec:
  clusterIP: None    # Headless
  selector:
    app: my-app
  ports:
  - port: 80
```

**使用場景**：
- StatefulSet（需要穩定的網路標識）
- 自定義負載均衡
- 需要直接訪問每個 Pod

### 選擇指南

| 場景 | 推薦類型 | 原因 |
|------|---------|------|
| 內部微服務通訊 | ClusterIP | 安全，不暴露外部 |
| 開發測試 | NodePort | 快速暴露，易於訪問 |
| 生產環境對外服務 | LoadBalancer + Ingress | 穩定，功能完整 |
| 有狀態服務 | Headless | 穩定網路標識 |
| 訪問外部服務 | ExternalName | 統一服務發現 |

### 最佳實踐

1. **內部服務使用 ClusterIP**
   - 更安全，減少攻擊面
   - 通過 Ingress 統一暴露外部服務

2. **避免直接使用 NodePort**
   - 生產環境使用 LoadBalancer 或 Ingress
   - NodePort 僅用於測試

3. **LoadBalancer 配合 Ingress**
   - 一個 LoadBalancer 配合 Ingress Controller
   - 通過 Ingress 路由多個服務
   - 節省成本（減少 LB 數量）

4. **使用 DNS 而非 IP**
   - Service DNS 更穩定
   - 易於維護和理解

## 總結

- **ClusterIP**：集群內部通訊的基礎，最安全
- **NodePort**：快速暴露服務，適合測試
- **LoadBalancer**：生產環境的首選，需要雲平台支援

理解這三種 Service 類型的差異和適用場景，是 Kubernetes 網路管理的基礎，也是面試中的常見考點。
