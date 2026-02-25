# 什麼是服務網格 (Service Mesh)？

- **難度**: 8
- **重要程度**: 4
- **標籤**: `Microservices`, `Service Mesh`, `Istio`, `Sidecar Proxy`, `Observability`

## 問題詳述

服務網格（Service Mesh）是一種專用的基礎設施層，負責處理微服務間的**服務到服務（Service-to-Service）通訊**，提供流量管理、安全（mTLS）、可觀測性等能力，且這一切對應用程式程式碼完全**透明**——服務本身無需實作這些跨切面關注點（Cross-Cutting Concerns）。

## 核心理論與詳解

### 為什麼需要服務網格？

在大規模微服務系統中，每個服務都需要處理以下問題：

- 服務探索（Service Discovery）
- 負載均衡（Load Balancing）
- 重試與逾時（Retry & Timeout）
- 斷路器（Circuit Breaker）
- 分散式追蹤（Distributed Tracing）
- 身份驗證與授權（mTLS、RBAC）
- 金絲雀部署（Canary Deployment）

傳統方式是將這些邏輯以函式庫（Library）形式嵌入到每個服務中（如 Netflix Hystrix），但這帶來了以下問題：

- **語言綁定**：每種程式語言都需要單獨維護一套函式庫（Java 版、Go 版、Python 版）
- **升級困難**：更新函式庫需要重新部署所有服務
- **業務程式碼污染**：非業務邏輯侵入業務程式碼

服務網格的出現，將這些能力從應用層下沉到**基礎設施層**，實現真正的關注點分離。

### 架構：Sidecar Proxy 模式

服務網格的核心技術是 **Sidecar Proxy（邊車代理）模式**：

```
┌─────────────────────────────────────────────┐
│  Kubernetes Pod                              │
│                                             │
│  ┌─────────────┐    ┌─────────────────────┐ │
│  │             │ ←→ │   Sidecar Proxy     │ │
│  │  App 容器   │    │  (Envoy/Linkerd)    │ │
│  │             │    │                     │ │
│  └─────────────┘    └─────────────────────┘ │
└─────────────────────────────────────────────┘
         ↑ 所有進出流量都經過 Sidecar Proxy
```

- 每個服務 Pod 旁邊自動注入一個 **Sidecar Proxy 容器**（通常是 Envoy Proxy）
- **所有進出該 Pod 的網路流量**都透過 Sidecar Proxy 中轉
- 應用程式以為自己在直接通訊，實際上所有複雜邏輯由 Sidecar 處理

這種設計使得應用程式對服務網格的存在**完全透明（Transparent）**。

### 控制平面（Control Plane）與數據平面（Data Plane）

服務網格分為兩個平面：

```
┌──────────────────────────────────────────┐
│          Control Plane（控制平面）         │
│  ┌────────────┐  ┌──────────┐  ┌──────┐  │
│  │  Pilot：   │  │ Citadel：│  │Mixer:│  │
│  │ 流量管理   │  │ 憑證管理  │  │遙測  │  │
│  └────────────┘  └──────────┘  └──────┘  │
└──────────────────────────────────────────┘
              ↓ 下發配置 (xDS API)
┌──────────────────────────────────────────┐
│          Data Plane（數據平面）            │
│  [Envoy] ↔ [Envoy] ↔ [Envoy] ...         │
│  (每個服務旁的 Sidecar Proxy)             │
└──────────────────────────────────────────┘
```

| 平面 | 職責 | 代表組件 |
| :--- | :--- | :--- |
| **Control Plane** | 管理和下發流量策略、安全憑證、遙測配置 | Istio Pilot, Linkerd Controller |
| **Data Plane** | 實際攔截並處理服務間的每個網路請求 | Envoy Proxy, Linkerd Proxy |

控制平面通過 **xDS API（Envoy 的動態配置 API）** 將策略推送到每個 Sidecar，不需要重啟任何服務。

### 服務網格的四大核心能力

**1. 流量管理（Traffic Management）**

- **智慧負載均衡**：Round-Robin、Least Connection、一致性雜湊
- **金絲雀部署（Canary Release）**：按權重將 5% 流量導至新版本，無需修改程式碼
- **流量鏡像（Traffic Mirroring）**：複製生產流量到測試環境進行影子測試
- **故障注入（Fault Injection）**：注入延遲或錯誤回應，用於混沌工程測試
- **重試與逾時**：統一配置，無需在每個服務中寫 retry 邏輯

**2. 安全（Security）**

- **mTLS（Mutual TLS）**：服務間通訊自動加密，雙向身份認證，防止中間人攻擊
- **憑證自動輪轉**：Citadel（Istio）自動管理和輪換服務憑證，無需人工介入
- **RBAC 授權策略**：定義哪個服務可以呼叫哪個服務的哪個端點

```yaml
# Istio AuthorizationPolicy: orders 服務只能被 payments 服務呼叫
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: orders-policy
spec:
  selector:
    matchLabels:
      app: orders
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/default/sa/payments"]
```

**3. 可觀測性（Observability）**

無需在應用程式中加入任何程式碼，服務網格自動收集：

- **指標（Metrics）**：每個服務的請求速率、延遲（P50/P95/P99）、錯誤率
- **分散式追蹤（Distributed Tracing）**：自動注入追蹤 Header，與 Jaeger/Zipkin 整合
- **存取日誌（Access Logs）**：完整的服務間請求記錄

**4. 可靠性（Reliability）**

- **斷路器**：在 Istio DestinationRule 中配置 `outlierDetection`，自動剔除不健康的實例
- **重試策略**：配置 5xx 錯誤自動重試，最多 3 次
- **逾時控制**：為每個路由設定最大回應時間

### 主要產品比較

| 產品 | Data Plane | 特點 |
| :--- | :--- | :--- |
| **Istio** | Envoy | 功能最全，但較複雜；CNCF 畢業項目 |
| **Linkerd** | Linkerd Proxy (Rust) | 輕量、效能優秀、上手簡單 |
| **Consul Connect** | Envoy | HashiCorp 生態，與 Consul 服務探索緊密整合 |
| **Cilium** | eBPF | 使用 eBPF 而非 Sidecar，效能更優，是新一代方案 |

### 服務網格的代價與適用時機

**引入成本：**
- **資源開銷**：每個 Pod 增加一個 Sidecar，消耗額外的 CPU（~1 mCore）和記憶體（~50MB）
- **延遲增加**：每個請求多了兩次本地代理（~1ms 以內，通常可接受）
- **複雜度**：引入新的學習曲線和調試複雜度（問題可能在 Sidecar 而非應用本身）

**適用場景：**
- 微服務數量超過 10+ 個，服務間通訊複雜
- 有跨語言微服務（多種語言無法共享同一套 SDK）
- 有嚴格的安全合規要求（需要加密服務間通訊）
- 需要精細的流量控制（A/B 測試、金絲雀部署）

**不適用場景：**
- 小型系統（< 5 個服務），引入服務網格是過度工程化
- 對延遲極度敏感的系統（金融高頻交易），Sidecar 的額外 Hop 不可接受
