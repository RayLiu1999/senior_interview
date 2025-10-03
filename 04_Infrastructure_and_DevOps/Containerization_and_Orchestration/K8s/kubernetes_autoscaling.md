# Horizontal Pod Autoscaler (HPA) 與 Vertical Pod Autoscaler (VPA)

- **難度**: 7
- **標籤**: `Kubernetes`, `Auto Scaling`, `HPA`, `VPA`

## 問題詳述

請解釋 Kubernetes 中的自動擴縮容機制：HPA（水平擴縮容）和 VPA（垂直擴縮容）的原理、配置方式和使用場景。

## 核心理論與詳解

### 為什麼需要自動擴縮容

**問題場景**：
- 流量波動大（日間高峰、夜間低谷）
- 突發流量（促銷活動、熱點事件）
- 資源利用率低或過載

**手動擴縮的缺點**：
- 反應慢
- 需要人工介入
- 無法應對快速變化

**自動擴縮的優勢**：
- 自動調整資源
- 提高資源利用率
- 降低成本

### 擴縮容的三個維度

```
┌──────────────────────────────────────────┐
│  1. Horizontal Pod Autoscaler (HPA)     │
│     水平擴縮：增減 Pod 數量              │
│     3 Pods → 5 Pods → 10 Pods           │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  2. Vertical Pod Autoscaler (VPA)       │
│     垂直擴縮：調整 Pod 資源配置          │
│     500m CPU → 1000m CPU                 │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  3. Cluster Autoscaler (CA)             │
│     集群擴縮：增減 Node 數量             │
│     3 Nodes → 5 Nodes                    │
└──────────────────────────────────────────┘
```

## Horizontal Pod Autoscaler (HPA)

### HPA 核心概念

**定義**：
- 根據指標自動調整 Pod 副本數
- 針對 Deployment、ReplicaSet、StatefulSet

**工作原理**：
```
┌─────────────────────────────────────────┐
│   HPA Controller (每 15 秒檢查一次)     │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│   Metrics Server / Custom Metrics API  │
│   (獲取 Pod 指標)                       │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│   計算所需副本數                        │
│   期望副本數 = 當前副本數 × (當前指標 / 目標指標) │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│   調整 Deployment/ReplicaSet 副本數     │
└─────────────────────────────────────────┘
```

### HPA 基於 CPU 的擴縮容

**前提條件**：
- 安裝 Metrics Server
- Pod 必須設置 `resources.requests`

#### 安裝 Metrics Server

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

#### 基本 HPA 配置

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nginx-hpa
  namespace: default
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx
  minReplicas: 2              # 最小副本數
  maxReplicas: 10             # 最大副本數
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50    # 目標 CPU 使用率 50%
```

**使用命令創建**：
```bash
kubectl autoscale deployment nginx \
  --cpu-percent=50 \
  --min=2 \
  --max=10
```

#### HPA 計算公式

**基本公式**：
```
期望副本數 = ceil(當前副本數 × (當前指標 / 目標指標))
```

**範例**：
```
當前副本數: 3
當前 CPU 使用率: 75%
目標 CPU 使用率: 50%

期望副本數 = ceil(3 × (75 / 50))
           = ceil(3 × 1.5)
           = ceil(4.5)
           = 5

結果：擴容到 5 個副本
```

### HPA 基於記憶體的擴縮容

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: memory-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 70    # 目標記憶體使用率 70%
```

### HPA 基於多個指標

**同時考慮 CPU 和記憶體**：
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: multi-metric-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 20
  metrics:
  # CPU 指標
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
  
  # 記憶體指標
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 70
  
  # 自訂指標（QPS）
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "1000"    # 每個 Pod 處理 1000 QPS

# 多指標邏輯：取最大值
# 如果 CPU 需要 5 個副本，Memory 需要 7 個副本
# 則最終副本數為 7
```

### HPA 基於自訂指標

**使用 Prometheus Adapter**：

**1. 部署 Prometheus Adapter**
```bash
helm install prometheus-adapter prometheus-community/prometheus-adapter \
  --set prometheus.url=http://prometheus-server \
  --set prometheus.port=80
```

**2. 配置 HPA**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: custom-metric-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
  # 基於 HTTP 請求數
  - type: Pods
    pods:
      metric:
        name: http_requests
      target:
        type: AverageValue
        averageValue: "1000"
  
  # 基於消息隊列長度
  - type: Object
    object:
      metric:
        name: queue_length
      describedObject:
        apiVersion: v1
        kind: Service
        name: rabbitmq
      target:
        type: Value
        value: "100"
```

### HPA 進階配置

#### 行為控制（Behavior）

**控制擴縮速度**：
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: behavior-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
  
  behavior:
    scaleUp:
      # 擴容策略
      stabilizationWindowSeconds: 0    # 立即擴容
      policies:
      - type: Percent
        value: 100       # 每次最多增加 100%（翻倍）
        periodSeconds: 15
      - type: Pods
        value: 4         # 每次最多增加 4 個 Pod
        periodSeconds: 15
      selectPolicy: Max  # 取最大值
    
    scaleDown:
      # 縮容策略
      stabilizationWindowSeconds: 300    # 穩定 5 分鐘後才縮容
      policies:
      - type: Percent
        value: 50        # 每次最多減少 50%
        periodSeconds: 60
      - type: Pods
        value: 2         # 每次最多減少 2 個 Pod
        periodSeconds: 60
      selectPolicy: Min  # 取最小值（保守縮容）
```

**行為說明**：
- `stabilizationWindowSeconds`：穩定窗口，防止抖動
- `selectPolicy`：Max（激進）/ Min（保守）/ Disabled（禁用）

### HPA 使用注意事項

**1. 避免與 Replica 手動設置衝突**
```bash
# ❌ 不要手動修改副本數
kubectl scale deployment myapp --replicas=5
# HPA 會覆蓋此設置

# ✅ 刪除 HPA 後才手動設置
kubectl delete hpa myapp-hpa
kubectl scale deployment myapp --replicas=5
```

**2. CPU/Memory Requests 是必須的**
```yaml
# ❌ 沒有 Requests，HPA 無法計算使用率
containers:
- name: app
  image: myapp:1.0

# ✅ 必須設置 Requests
containers:
- name: app
  image: myapp:1.0
  resources:
    requests:
      cpu: "500m"
      memory: "256Mi"
```

**3. 防止抖動**
- 設置適當的 `stabilizationWindowSeconds`
- 擴容快、縮容慢

## Vertical Pod Autoscaler (VPA)

### VPA 核心概念

**定義**：
- 自動調整 Pod 的 CPU 和 Memory **Requests 和 Limits**
- 不改變 Pod 數量

**適用場景**：
- 不確定應該設置多少 Requests/Limits
- 應用資源需求隨時間變化
- 無法水平擴展的應用（如單例資料庫）

### VPA 工作模式

| 模式 | 說明 | 適用場景 |
|------|------|---------|
| **Off** | 只推薦，不自動應用 | 觀察和測試 |
| **Initial** | 僅在 Pod 創建時應用 | 初始配置 |
| **Recreate** | 更新時重建 Pod | 可以接受重啟 |
| **Auto** | 自動更新（實驗性） | 未來功能 |

### 安裝 VPA

```bash
git clone https://github.com/kubernetes/autoscaler.git
cd autoscaler/vertical-pod-autoscaler
./hack/vpa-up.sh
```

### VPA 配置範例

**基本 VPA**：
```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: myapp-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  updatePolicy:
    updateMode: "Auto"    # Off / Initial / Recreate / Auto
  resourcePolicy:
    containerPolicies:
    - containerName: "*"
      minAllowed:
        cpu: "100m"
        memory: "128Mi"
      maxAllowed:
        cpu: "2000m"
        memory: "2Gi"
      controlledResources:
      - cpu
      - memory
```

**只推薦模式（Off）**：
```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: myapp-vpa-recommender
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  updatePolicy:
    updateMode: "Off"    # 只推薦，不應用
```

**查看推薦值**：
```bash
kubectl describe vpa myapp-vpa

# 輸出範例：
Recommendation:
  Container Recommendations:
    Container Name:  myapp
    Lower Bound:
      Cpu:     100m
      Memory:  262144k
    Target:
      Cpu:     500m
      Memory:  524288k
    Uncapped Target:
      Cpu:     750m
      Memory:  786432k
    Upper Bound:
      Cpu:     2000m
      Memory:  2097152k
```

### VPA vs HPA

| 特性 | HPA | VPA |
|------|-----|-----|
| **調整對象** | Pod 數量 | Pod 資源配置 |
| **方向** | 水平擴展 | 垂直擴展 |
| **重啟 Pod** | 不需要 | 需要（Recreate 模式） |
| **適用場景** | 可水平擴展的應用 | 單例應用、資源優化 |
| **衝突** | 不能與手動 scale 同時使用 | 不能與 HPA (CPU/Memory) 同時使用 |

**可以同時使用的情況**：
```yaml
# HPA 基於自訂指標（QPS）
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
spec:
  metrics:
  - type: Pods
    pods:
      metric:
        name: http_requests
      target:
        type: AverageValue
        averageValue: "1000"

---
# VPA 調整資源配置
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: myapp-vpa
spec:
  updatePolicy:
    updateMode: "Auto"
```

### Cluster Autoscaler (CA)

**定義**：
- 自動調整集群中的 **Node 數量**
- 當 Pod 無法調度時，自動添加 Node
- 當 Node 利用率低時，自動移除 Node

**工作原理**：
```
1. Pod Pending（資源不足）
       ↓
2. CA 檢測到需要更多 Node
       ↓
3. CA 向雲服務商請求新 Node
       ↓
4. 新 Node 加入集群
       ↓
5. Pod 被調度到新 Node
```

**配置範例**（AWS）：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
spec:
  template:
    spec:
      containers:
      - name: cluster-autoscaler
        image: k8s.gcr.io/autoscaling/cluster-autoscaler:v1.26.0
        command:
        - ./cluster-autoscaler
        - --v=4
        - --cloud-provider=aws
        - --skip-nodes-with-local-storage=false
        - --expander=least-waste
        - --nodes=2:10:k8s-worker-asg    # 最小:最大:ASG名稱
```

### 監控與除錯

#### 查看 HPA 狀態

```bash
# 查看 HPA
kubectl get hpa

# 輸出範例：
NAME        REFERENCE          TARGETS   MINPODS   MAXPODS   REPLICAS
nginx-hpa   Deployment/nginx   45%/50%   2         10        3

# 查看詳細資訊
kubectl describe hpa nginx-hpa

# 查看事件
kubectl get events --sort-by=.metadata.creationTimestamp
```

#### 查看 VPA 狀態

```bash
# 查看 VPA
kubectl get vpa

# 查看推薦值
kubectl describe vpa myapp-vpa
```

#### 常見問題

**問題 1：HPA 無法獲取指標**
```bash
# 檢查 Metrics Server
kubectl get apiservice v1beta1.metrics.k8s.io -o yaml

# 檢查 Pod 是否有 Requests
kubectl get pod <pod-name> -o yaml | grep -A 3 resources
```

**問題 2：HPA 頻繁擴縮容（抖動）**
```yaml
# 增加穩定窗口
behavior:
  scaleDown:
    stabilizationWindowSeconds: 300    # 5 分鐘穩定期
```

**問題 3：VPA 導致 Pod 重啟過於頻繁**
```yaml
# 使用 Off 模式，手動應用推薦值
updatePolicy:
  updateMode: "Off"
```

## 總結

**HPA（水平擴縮容）**：
- 調整 Pod 數量
- 適合無狀態應用
- 支援 CPU、Memory、自訂指標
- 擴容快、縮容慢

**VPA（垂直擴縮容）**：
- 調整 Pod 資源配置
- 適合單例應用或資源優化
- 需要重建 Pod（Recreate 模式）
- 提供推薦值（Off 模式）

**Cluster Autoscaler**：
- 調整 Node 數量
- 配合 HPA 使用
- 雲服務商支援

**最佳實踐**：
- 優先使用 HPA
- VPA 用於資源優化或單例應用
- HPA 和 VPA 不要同時基於 CPU/Memory
- 設置合理的 min/max 範圍
- 使用 behavior 控制擴縮速度

自動擴縮容是實現彈性架構和成本優化的關鍵技術。
