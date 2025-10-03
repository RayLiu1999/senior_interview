# 資源管理：Requests、Limits 與 ResourceQuota

- **難度**: 6
- **標籤**: `Kubernetes`, `Resource Management`, `QoS`

## 問題詳述

請解釋 Kubernetes 中的資源管理機制，包括 Requests 和 Limits 的作用、QoS 類別，以及如何使用 ResourceQuota 和 LimitRange 進行資源控制。

## 核心理論與詳解

### 為什麼需要資源管理

**問題場景**：
- 單個應用佔用過多資源，影響其他應用
- 資源不足時，如何決定哪些 Pod 被驅逐
- 如何限制命名空間的總資源使用

**解決方案**：
- **Requests**：資源預留（調度依據）
- **Limits**：資源上限（防止過度使用）
- **ResourceQuota**：命名空間級別的配額
- **LimitRange**：Pod/Container 級別的限制

### Requests 與 Limits

#### 核心概念

**Requests（請求）**：
- 容器**保證獲得**的資源
- Kubernetes 調度器據此決定 Pod 分配到哪個 Node
- Node 必須有足夠的**可分配資源**才能調度 Pod

**Limits（限制）**：
- 容器**最多能使用**的資源
- 超過 Limits 會被限流（CPU）或驅逐（Memory）

#### 基本配置

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-demo
spec:
  containers:
  - name: app
    image: nginx
    resources:
      requests:
        memory: "256Mi"    # 請求 256MB 記憶體
        cpu: "500m"        # 請求 0.5 CPU
      limits:
        memory: "512Mi"    # 最多使用 512MB 記憶體
        cpu: "1000m"       # 最多使用 1 CPU
```

#### CPU 資源單位

**表示方式**：
- `1` CPU = 1 個核心（1 vCPU、1 Core）
- `1000m` = 1 CPU（m = milli，千分之一）
- `500m` = 0.5 CPU

**範例**：
```yaml
cpu: "100m"    # 0.1 CPU
cpu: "500m"    # 0.5 CPU
cpu: "1"       # 1 CPU
cpu: "2"       # 2 CPU
cpu: "0.1"     # 0.1 CPU（等同於 100m）
```

#### Memory 資源單位

**表示方式**：
```yaml
memory: "128Mi"    # 128 Mebibytes
memory: "256M"     # 256 Megabytes
memory: "1Gi"      # 1 Gibibyte
memory: "1G"       # 1 Gigabyte
```

**單位換算**：
- `1 Ki` = 1024 bytes
- `1 Mi` = 1024 Ki = 1,048,576 bytes
- `1 Gi` = 1024 Mi = 1,073,741,824 bytes
- `1 K` = 1000 bytes
- `1 M` = 1000 K = 1,000,000 bytes
- `1 G` = 1000 M = 1,000,000,000 bytes

**建議**：使用二進位單位（Mi、Gi）更準確

#### Requests 與 Limits 的關係

**四種情況**：

**情況 1：只設置 Requests**
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "500m"
  # 沒有 Limits
```
- 保證最少資源
- 可以使用超過 Requests 的資源（如果 Node 有空閒）
- 沒有上限

**情況 2：只設置 Limits**
```yaml
resources:
  limits:
    memory: "512Mi"
    cpu: "1000m"
  # 沒有 Requests
```
- Kubernetes 自動設置 `Requests = Limits`
- 資源預留和上限相同

**情況 3：Requests < Limits**
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "500m"
  limits:
    memory: "512Mi"
    cpu: "1000m"
```
- 保證最少 256Mi 記憶體、0.5 CPU
- 最多使用 512Mi 記憶體、1 CPU
- **最常見的配置**

**情況 4：Requests = Limits**
```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "1000m"
  limits:
    memory: "512Mi"
    cpu: "1000m"
```
- 固定資源配額
- 不能使用超過的資源
- QoS 為 **Guaranteed**

### CPU vs Memory 的行為差異

| 資源類型 | 超過 Limits 的行為 | 可壓縮性 |
|---------|-------------------|---------|
| **CPU** | **限流**（Throttling） | 可壓縮（Compressible） |
| **Memory** | **驅逐**（OOMKilled） | 不可壓縮（Incompressible） |

**CPU 限流**：
```yaml
limits:
  cpu: "1000m"    # 限制為 1 CPU

# 行為：
# - 使用超過 1 CPU 時，被限流（變慢）
# - Pod 不會被殺死
# - CFS（完全公平調度器）控制
```

**Memory 驅逐**：
```yaml
limits:
  memory: "512Mi"    # 限制為 512MB

# 行為：
# - 使用超過 512Mi 時，容器被 OOMKilled
# - Pod 會重啟
# - 不可壓縮資源
```

### QoS（Quality of Service）類別

Kubernetes 根據 Requests 和 Limits 自動分配 QoS 類別：

#### 1. Guaranteed（最高優先級）

**條件**：
- 所有容器都設置了 Requests 和 Limits
- Requests = Limits（CPU 和 Memory 都相等）

**配置**：
```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "1000m"
  limits:
    memory: "512Mi"    # 相等
    cpu: "1000m"       # 相等
```

**特點**：
- 最高優先級
- 資源不足時**最後**被驅逐
- 適合關鍵應用

#### 2. Burstable（中等優先級）

**條件**：
- 至少一個容器設置了 Requests 或 Limits
- 不滿足 Guaranteed 條件

**配置範例 1**：
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "500m"
  limits:
    memory: "512Mi"    # 不相等
    cpu: "1000m"
```

**配置範例 2**：
```yaml
resources:
  requests:
    memory: "256Mi"
  # 沒有 Limits
```

**特點**：
- 中等優先級
- 可以使用超過 Requests 的資源
- 資源不足時根據實際使用情況驅逐

#### 3. BestEffort（最低優先級）

**條件**：
- 所有容器都**沒有**設置 Requests 和 Limits

**配置**：
```yaml
# 沒有 resources 定義
containers:
- name: app
  image: nginx
```

**特點**：
- 最低優先級
- 資源不足時**最先**被驅逐
- 不建議用於生產環境

#### QoS 驅逐順序

```
資源不足時的驅逐順序：
BestEffort（先驅逐） > Burstable > Guaranteed（最後驅逐）
```

**Burstable 內部的驅逐規則**：
- 計算 `(實際使用 - Requests) / Requests`
- 比例越高，越先被驅逐

### ResourceQuota

#### 什麼是 ResourceQuota

**定義**：
- 限制**命名空間**的總資源使用
- 防止單個團隊佔用過多資源

#### 基本範例

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: production
spec:
  hard:
    # CPU 和 Memory 總和
    requests.cpu: "10"         # 所有 Pod 的 CPU Requests 總和不超過 10
    requests.memory: "20Gi"    # 所有 Pod 的 Memory Requests 總和不超過 20Gi
    limits.cpu: "20"           # 所有 Pod 的 CPU Limits 總和不超過 20
    limits.memory: "40Gi"      # 所有 Pod 的 Memory Limits 總和不超過 40Gi
    
    # Pod 數量
    pods: "50"                 # 最多 50 個 Pod
    
    # Service 數量
    services: "10"
    services.loadbalancers: "2"
    
    # PVC 數量和容量
    persistentvolumeclaims: "20"
    requests.storage: "100Gi"
```

#### 物件數量限制

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: object-quota
  namespace: dev
spec:
  hard:
    configmaps: "10"
    secrets: "10"
    services: "5"
    services.nodeports: "2"
    replicationcontrollers: "20"
    deployments.apps: "20"
    jobs.batch: "10"
```

#### 按優先級的 ResourceQuota

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: high-priority-quota
  namespace: production
spec:
  hard:
    requests.cpu: "5"
    requests.memory: "10Gi"
  scopeSelector:
    matchExpressions:
    - scopeName: PriorityClass
      operator: In
      values:
      - high
```

#### 查看 ResourceQuota

```bash
# 查看配額
kubectl get resourcequota -n production

# 查看詳細使用情況
kubectl describe resourcequota compute-quota -n production
```

**輸出範例**：
```
Name:            compute-quota
Namespace:       production
Resource         Used   Hard
--------         ----   ----
requests.cpu     7      10
requests.memory  15Gi   20Gi
limits.cpu       14     20
limits.memory    30Gi   40Gi
pods             35     50
```

### LimitRange

#### 什麼是 LimitRange

**定義**：
- 限制單個 Pod/Container 的資源範圍
- 為未指定資源的 Pod 設置預設值

#### 基本範例

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: resource-limits
  namespace: production
spec:
  limits:
  # Container 級別
  - type: Container
    max:
      cpu: "2"           # 單個容器最多 2 CPU
      memory: "4Gi"      # 單個容器最多 4Gi 記憶體
    min:
      cpu: "100m"        # 單個容器最少 100m CPU
      memory: "128Mi"    # 單個容器最少 128Mi 記憶體
    default:
      cpu: "500m"        # 預設 Limits
      memory: "512Mi"
    defaultRequest:
      cpu: "250m"        # 預設 Requests
      memory: "256Mi"
    maxLimitRequestRatio:
      cpu: "4"           # Limits/Requests 最多為 4 倍
      memory: "2"        # Limits/Requests 最多為 2 倍
  
  # Pod 級別
  - type: Pod
    max:
      cpu: "4"           # 單個 Pod 所有容器總和最多 4 CPU
      memory: "8Gi"
  
  # PVC 級別
  - type: PersistentVolumeClaim
    max:
      storage: "50Gi"    # 單個 PVC 最多 50Gi
    min:
      storage: "1Gi"
```

#### LimitRange 的作用

**1. 設置預設值**：
```yaml
# 沒有設置 resources 的 Pod
apiVersion: v1
kind: Pod
metadata:
  name: no-resources
spec:
  containers:
  - name: app
    image: nginx
    # 沒有 resources

# LimitRange 自動設置：
# requests.cpu: 250m
# requests.memory: 256Mi
# limits.cpu: 500m
# limits.memory: 512Mi
```

**2. 限制範圍**：
```yaml
# 超過 max 的 Pod 會被拒絕
resources:
  limits:
    cpu: "5"    # 超過 LimitRange.max (2)
    # ❌ 創建失敗
```

**3. 限制比例**：
```yaml
# maxLimitRequestRatio: cpu=4
resources:
  requests:
    cpu: "100m"
  limits:
    cpu: "500m"    # 比例 = 5 > 4
    # ❌ 創建失敗
```

### 實際應用範例

#### 生產環境的資源配置策略

**關鍵應用（Guaranteed QoS）**：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: critical-app
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: app
        image: critical-app:1.0
        resources:
          requests:
            memory: "1Gi"
            cpu: "1000m"
          limits:
            memory: "1Gi"      # 相等
            cpu: "1000m"       # 相等
```

**一般應用（Burstable QoS）**：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: normal-app
spec:
  replicas: 5
  template:
    spec:
      containers:
      - name: app
        image: normal-app:1.0
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"    # 2倍
            cpu: "1000m"       # 4倍
```

**批處理任務（Burstable QoS）**：
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: batch-job
spec:
  template:
    spec:
      containers:
      - name: worker
        image: batch-worker:1.0
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"      # 4倍，允許突發
            cpu: "2000m"       # 4倍
      restartPolicy: OnFailure
```

### 監控與調優

#### 查看資源使用情況

```bash
# 查看 Node 資源使用
kubectl top node

# 查看 Pod 資源使用
kubectl top pod -n production

# 查看 Pod 詳細資源配置
kubectl describe pod <pod-name>

# 查看 Node 可分配資源
kubectl describe node <node-name> | grep -A 5 Allocatable
```

#### 資源不足的排查

**問題：Pod 一直 Pending**
```bash
# 查看 Pod 狀態
kubectl describe pod <pod-name>

# 常見原因：
Events:
  Warning  FailedScheduling  Pod failed to schedule: Insufficient cpu
  # 解決：增加 Node 或減少 Requests
```

**問題：Pod 被頻繁 OOMKilled**
```bash
# 查看 Pod 事件
kubectl describe pod <pod-name>

Events:
  Warning  OOMKilled  Memory limit exceeded
  # 解決：增加 Memory Limits
```

**問題：CPU 限流嚴重**
```bash
# 查看 CPU 限流指標（需要 Prometheus）
rate(container_cpu_cfs_throttled_seconds_total[5m])

# 解決：增加 CPU Limits
```

#### 資源配置建議

**CPU**：
- Requests：根據平均使用量設置
- Limits：根據峰值使用量設置（1.5-2 倍 Requests）

**Memory**：
- Requests：根據正常使用量設置
- Limits：略高於 Requests（1.2-1.5 倍）避免 OOMKilled

**範例**：
```yaml
resources:
  requests:
    memory: "512Mi"     # 正常使用量
    cpu: "500m"         # 平均使用量
  limits:
    memory: "768Mi"     # 1.5倍，預留空間
    cpu: "1000m"        # 2倍，允許突發
```

## 總結

**資源管理核心概念**：
- **Requests**：調度依據、最低保證
- **Limits**：資源上限、防止過度使用
- **QoS**：自動分配優先級
- **ResourceQuota**：命名空間級別控制
- **LimitRange**：Pod/Container 級別限制

**最佳實踐**：
- 所有 Pod 都應設置 Requests 和 Limits
- 關鍵應用使用 Guaranteed QoS
- 使用 ResourceQuota 防止資源耗盡
- 使用 LimitRange 設置預設值
- 定期監控和調整資源配置

**驅逐順序**：BestEffort → Burstable → Guaranteed

正確的資源管理是保證 Kubernetes 集群穩定運行的基礎。
