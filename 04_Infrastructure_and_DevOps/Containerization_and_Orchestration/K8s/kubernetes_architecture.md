# Kubernetes 核心架構：Master 與 Worker Node

- **難度**: 6
- **標籤**: `Kubernetes`, `Architecture`, `Master`, `Node`

## 問題詳述

請詳細解釋 Kubernetes 的架構組成，特別是 Master Node 和 Worker Node 的角色及其內部組件。

## 核心理論與詳解

### Kubernetes 架構概覽

Kubernetes 採用 **Master-Worker 架構**（也稱為 Control Plane-Data Plane 架構），分為控制平面和資料平面兩大部分。

```
┌─────────────────────────────────────────────────────┐
│                  Master Node (Control Plane)         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │  API Server  │  │   Scheduler  │  │   etcd   │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │       Controller Manager                      │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │       Cloud Controller Manager (Optional)     │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
    ┌─────────▼────────┐    ┌────────▼─────────┐
    │  Worker Node 1   │    │  Worker Node 2   │
    │  ┌────────────┐  │    │  ┌────────────┐  │
    │  │  Kubelet   │  │    │  │  Kubelet   │  │
    │  └────────────┘  │    │  └────────────┘  │
    │  ┌────────────┐  │    │  ┌────────────┐  │
    │  │ Kube-proxy │  │    │  │ Kube-proxy │  │
    │  └────────────┘  │    │  └────────────┘  │
    │  ┌────────────┐  │    │  ┌────────────┐  │
    │  │  Runtime   │  │    │  │  Runtime   │  │
    │  │ (Docker等) │  │    │  │ (Docker等) │  │
    │  └────────────┘  │    │  └────────────┘  │
    │  ┌────────────┐  │    │  ┌────────────┐  │
    │  │  Pods...   │  │    │  │  Pods...   │  │
    │  └────────────┘  │    │  └────────────┘  │
    └──────────────────┘    └──────────────────┘
```

### Master Node (控制平面) 組件

#### 1. **API Server**

**角色**：
- Kubernetes 的**前端介面**，所有操作都通過 API Server
- 唯一直接與 etcd 交互的組件

**職責**：
- 提供 RESTful API 介面
- 認證和授權請求
- 驗證和修改 API 物件
- 作為集群的通訊中樞

**特點**：
- 無狀態，可水平擴展
- 支援多版本 API (v1, v1beta1 等)

#### 2. **etcd**

**角色**：
- 分散式鍵值存儲，Kubernetes 的**唯一資料存儲**

**職責**：
- 存儲所有集群資料（配置、狀態、元資料）
- 提供強一致性保證
- 支援 Watch 機制，實時通知變更

**特點**：
- 基於 Raft 協定保證一致性
- 建議部署奇數節點（3 或 5 個）
- 需要定期備份

#### 3. **Scheduler**

**角色**：
- **Pod 調度器**，決定 Pod 應該運行在哪個 Node 上

**職責**：
- 監聽未調度的 Pod
- 根據調度算法選擇最佳節點
- 考慮資源需求、親和性、污點容忍等因素

**調度流程**：
1. **過濾（Predicate）**：排除不符合條件的節點
2. **打分（Priority）**：對剩餘節點評分
3. **綁定（Binding）**：將 Pod 綁定到最高分節點

#### 4. **Controller Manager**

**角色**：
- 運行各種**控制器**，確保集群狀態符合期望

**主要控制器**：
- **Node Controller**：監控節點狀態
- **Replication Controller**：維護 Pod 副本數量
- **Endpoints Controller**：管理 Service 端點
- **ServiceAccount Controller**：管理命名空間的預設帳戶
- **Deployment Controller**：管理 Deployment 的滾動更新

**工作原理**：
- 持續監控集群狀態（透過 Watch API）
- 發現實際狀態與期望狀態不一致時採取行動
- 每個控制器獨立運行，互不干擾

#### 5. **Cloud Controller Manager**（可選）

**角色**：
- 與雲平台（AWS、Azure、GCP）交互的控制器

**職責**：
- **Node Controller**：檢查雲端刪除的節點
- **Route Controller**：配置雲端路由
- **Service Controller**：管理雲端負載均衡器
- **Volume Controller**：管理雲端存儲卷

### Worker Node (資料平面) 組件

#### 1. **Kubelet**

**角色**：
- **節點代理**，運行在每個 Worker Node 上

**職責**：
- 接收 Pod 規範（通過 API Server）
- 確保 Pod 中的容器正常運行
- 定期向 Master 報告節點和 Pod 狀態
- 執行健康檢查（Liveness/Readiness Probe）

**工作流程**：
1. 監聽 API Server 分配給該節點的 Pod
2. 調用容器運行時（如 Docker）創建容器
3. 監控容器狀態並報告
4. 管理容器的生命週期

#### 2. **Kube-proxy**

**角色**：
- **網路代理**，實現 Service 的網路規則

**職責**：
- 維護節點上的網路規則
- 實現 Service 的負載均衡
- 支援 ClusterIP、NodePort、LoadBalancer

**實現模式**：
- **iptables 模式**：使用 iptables 規則（預設）
- **IPVS 模式**：使用 IPVS 負載均衡（更高效）
- **userspace 模式**：用戶空間代理（已過時）

#### 3. **Container Runtime**

**角色**：
- **容器引擎**，負責實際運行容器

**支援的運行時**：
- **containerd**：輕量級容器運行時（CNCF 項目）
- **CRI-O**：專為 Kubernetes 設計的運行時
- **Docker**：通過 dockershim（已棄用）或 containerd

**職責**：
- 拉取容器映像
- 啟動和停止容器
- 管理容器的資源限制

### 組件之間的交互流程

**部署 Pod 的完整流程**：

1. **用戶提交**：透過 `kubectl` 向 API Server 提交 Deployment
2. **API Server**：驗證並將 Deployment 存儲到 etcd
3. **Deployment Controller**：監聽到新的 Deployment，創建 ReplicaSet
4. **ReplicaSet Controller**：創建 Pod 物件（此時 Pod 處於 Pending 狀態）
5. **Scheduler**：發現未調度的 Pod，選擇合適的 Node 並綁定
6. **Kubelet**：監聽到分配給本節點的 Pod，調用容器運行時創建容器
7. **Kube-proxy**：更新網路規則，使 Service 能夠路由到新的 Pod

### 高可用架構考慮

**Master 節點高可用**：
- 部署多個 API Server（負載均衡器前端）
- etcd 集群（3 或 5 個節點）
- Scheduler 和 Controller Manager 使用領導者選舉

**Worker 節點高可用**：
- 多個 Worker 節點分散部署
- Pod 副本分佈在不同節點
- 節點故障時自動遷移 Pod

## 總結

Kubernetes 的架構設計體現了高內聚低耦合的原則：
- **Master 節點**專注於決策和狀態管理
- **Worker 節點**專注於執行和資源提供
- **組件職責明確**，通過 API Server 統一交互
- **聲明式設計**，透過控制器模式實現自動化管理

理解這個架構是深入掌握 Kubernetes 的基礎，也是面試中的高頻考點。
