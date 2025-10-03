# Persistent Volume (PV)、Persistent Volume Claim (PVC) 與 StorageClass

- **難度**: 6
- **標籤**: `Kubernetes`, `Storage`, `PV`, `PVC`

## 問題詳述

請解釋 Kubernetes 中的存儲抽象：Persistent Volume (PV)、Persistent Volume Claim (PVC) 和 StorageClass 的概念、關係和使用方式。

## 核心理論與詳解

### 為什麼需要持久化存儲

**容器存儲的特性**：
- 容器的檔案系統是**臨時的**
- 容器重啟後，資料會**丟失**
- Pod 刪除後，資料**無法恢復**

**應用場景**：
- 資料庫（MySQL、PostgreSQL）
- 檔案存儲（圖片、日誌）
- 狀態應用（Kafka、Elasticsearch）

### Kubernetes 存儲架構

```
┌─────────────────────────────────────────────┐
│              Application                    │
│         (Pod 中的容器)                       │
└───────────────┬─────────────────────────────┘
                │ volumeMounts
                ↓
┌─────────────────────────────────────────────┐
│     Persistent Volume Claim (PVC)           │
│     (存儲需求聲明 - 用戶視角)               │
│     "我需要 10GB 存儲"                       │
└───────────────┬─────────────────────────────┘
                │ Binding
                ↓
┌─────────────────────────────────────────────┐
│     Persistent Volume (PV)                  │
│     (實際存儲資源 - 管理員視角)             │
│     "這裡有 10GB NFS 存儲"                   │
└───────────────┬─────────────────────────────┘
                │ Provisioned by
                ↓
┌─────────────────────────────────────────────┐
│         StorageClass                        │
│     (存儲類別 - 自動配置器)                 │
│     "動態創建 AWS EBS"                       │
└─────────────────────────────────────────────┘
```

### Persistent Volume (PV)

#### 什麼是 PV

**定義**：
- 集群級別的存儲資源
- 由**管理員**預先創建或動態配置
- 獨立於 Pod 的生命週期

**關鍵特性**：
- 持久化存儲
- 可重複使用
- 不屬於任何命名空間

#### PV 的類型

| 類型 | 說明 | 適用場景 |
|------|------|---------|
| **hostPath** | Node 本地目錄 | 單節點測試 |
| **NFS** | 網路檔案系統 | 小型集群 |
| **iSCSI** | 塊存儲 | 企業級存儲 |
| **Ceph RBD** | 分佈式塊存儲 | 大規模集群 |
| **AWS EBS** | AWS 塊存儲 | AWS 環境 |
| **GCE PD** | GCP 持久化磁碟 | GCP 環境 |
| **Azure Disk** | Azure 磁碟 | Azure 環境 |
| **Local** | 本地磁碟（高性能） | 需要本地 I/O |

#### PV 配置範例

**NFS PV**：
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: nfs-pv
spec:
  capacity:
    storage: 10Gi         # 容量
  accessModes:
  - ReadWriteMany         # 訪問模式
  persistentVolumeReclaimPolicy: Retain    # 回收策略
  storageClassName: nfs   # 存儲類別
  nfs:
    server: 192.168.1.100
    path: /data/nfs
```

**hostPath PV**（僅用於測試）：
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: hostpath-pv
spec:
  capacity:
    storage: 5Gi
  accessModes:
  - ReadWriteOnce
  persistentVolumeReclaimPolicy: Delete
  storageClassName: local-storage
  hostPath:
    path: /mnt/data
    type: DirectoryOrCreate
```

**AWS EBS PV**：
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: ebs-pv
spec:
  capacity:
    storage: 20Gi
  accessModes:
  - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: gp2
  awsElasticBlockStore:
    volumeID: vol-0123456789abcdef0
    fsType: ext4
```

#### PV 訪問模式 (Access Modes)

| 模式 | 縮寫 | 說明 | 典型應用 |
|------|------|------|---------|
| **ReadWriteOnce** | RWO | 單節點讀寫 | 資料庫 |
| **ReadOnlyMany** | ROX | 多節點只讀 | 靜態資源 |
| **ReadWriteMany** | RWX | 多節點讀寫 | 共享檔案系統 |
| **ReadWriteOncePod** | RWOP | 單 Pod 讀寫（1.22+） | 嚴格單例應用 |

**存儲類型與訪問模式的支援**：

| 存儲類型 | RWO | ROX | RWX |
|---------|-----|-----|-----|
| hostPath | ✅ | ✅ | ❌ |
| NFS | ✅ | ✅ | ✅ |
| AWS EBS | ✅ | ❌ | ❌ |
| GCE PD | ✅ | ✅ | ❌ |
| Ceph RBD | ✅ | ✅ | ❌ |
| GlusterFS | ✅ | ✅ | ✅ |

#### PV 回收策略 (Reclaim Policy)

| 策略 | 說明 | 使用場景 |
|------|------|---------|
| **Retain** | 保留資料，需手動清理 | 生產環境，重要資料 |
| **Delete** | 自動刪除 PV 和底層存儲 | 動態配置的存儲 |
| **Recycle** | 清空資料後重用（已廢棄） | - |

#### PV 的狀態

| 狀態 | 說明 |
|------|------|
| **Available** | 可用，未被綁定 |
| **Bound** | 已綁定到 PVC |
| **Released** | PVC 已刪除，但資源未回收 |
| **Failed** | 自動回收失敗 |

### Persistent Volume Claim (PVC)

#### 什麼是 PVC

**定義**：
- 用戶對存儲的**請求**
- 類似 Pod 對計算資源的請求
- 屬於特定命名空間

**關鍵概念**：
- PVC 是**需求**，PV 是**供給**
- Kubernetes 自動匹配 PVC 和 PV

#### PVC 配置範例

**基本 PVC**：
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
  namespace: default
spec:
  accessModes:
  - ReadWriteOnce         # 訪問模式
  resources:
    requests:
      storage: 10Gi       # 請求容量
  storageClassName: standard    # 存儲類別
```

**指定 PV 的 PVC**：
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: specific-pvc
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  volumeName: nfs-pv      # 指定綁定的 PV
```

**使用 Selector 的 PVC**：
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: selector-pvc
spec:
  accessModes:
  - ReadWriteMany
  resources:
    requests:
      storage: 10Gi
  selector:
    matchLabels:
      type: nfs           # 選擇帶有此標籤的 PV
```

#### 在 Pod 中使用 PVC

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mypod
spec:
  containers:
  - name: myapp
    image: nginx
    volumeMounts:
    - name: data
      mountPath: /usr/share/nginx/html    # 掛載路徑
  
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: my-pvc    # 引用 PVC
```

**在 Deployment 中使用 PVC**：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        env:
        - name: MYSQL_ROOT_PASSWORD
          value: password
        volumeMounts:
        - name: mysql-data
          mountPath: /var/lib/mysql
      
      volumes:
      - name: mysql-data
        persistentVolumeClaim:
          claimName: mysql-pvc
```

### StorageClass

#### 什麼是 StorageClass

**定義**：
- 定義**存儲的類型**
- 實現**動態配置**（Dynamic Provisioning）
- 由 Provisioner 創建 PV

**優勢**：
- 無需管理員手動創建 PV
- 用戶創建 PVC 時自動配置存儲
- 支援多種存儲後端

#### StorageClass 配置範例

**AWS EBS StorageClass**：
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gp2
provisioner: kubernetes.io/aws-ebs    # Provisioner
parameters:
  type: gp2                           # EBS 類型
  fsType: ext4
  encrypted: "true"
allowVolumeExpansion: true            # 允許擴容
volumeBindingMode: WaitForFirstConsumer    # 延遲綁定
reclaimPolicy: Delete                 # 回收策略
```

**GCP PD StorageClass**：
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: standard
provisioner: kubernetes.io/gce-pd
parameters:
  type: pd-standard
  replication-type: none
```

**NFS StorageClass**（需要 NFS Provisioner）：
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: nfs
provisioner: example.com/nfs
parameters:
  server: 192.168.1.100
  path: /data/nfs
  readOnly: "false"
```

**Local StorageClass**：
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-storage
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
```

#### 動態配置流程

**使用 StorageClass 的 PVC**：
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: dynamic-pvc
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: gp2    # 指定 StorageClass
```

**流程**：
```
1. 用戶創建 PVC (指定 StorageClass: gp2)
       ↓
2. Kubernetes 發現沒有符合的 PV
       ↓
3. 調用 gp2 StorageClass 的 Provisioner
       ↓
4. Provisioner 創建 AWS EBS Volume
       ↓
5. Kubernetes 創建對應的 PV
       ↓
6. PV 自動綁定到 PVC
       ↓
7. Pod 可以使用 PVC
```

#### volumeBindingMode

| 模式 | 說明 | 使用場景 |
|------|------|---------|
| **Immediate** | 立即綁定 PV | 存儲位置無限制 |
| **WaitForFirstConsumer** | 延遲綁定，等待 Pod 調度 | 確保 PV 在正確的節點 |

**WaitForFirstConsumer 的優勢**：
```yaml
# 問題：Pod 被調度到 Node A，但 PV 在 Node B
# 解決：延遲綁定，等 Pod 調度後再創建 PV

storageClassName: local-storage
volumeBindingMode: WaitForFirstConsumer
```

### StatefulSet 與 VolumeClaimTemplate

**StatefulSet** 需要為每個 Pod 創建獨立的 PVC：

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: mysql
  replicas: 3
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        volumeMounts:
        - name: data
          mountPath: /var/lib/mysql
  
  # VolumeClaimTemplate：自動為每個 Pod 創建 PVC
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes:
      - ReadWriteOnce
      storageClassName: gp2
      resources:
        requests:
          storage: 20Gi
```

**自動創建的 PVC**：
```
data-mysql-0  →  PV-1  (20GB)
data-mysql-1  →  PV-2  (20GB)
data-mysql-2  →  PV-3  (20GB)
```

### 存儲擴容

**StorageClass 支援擴容**：
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: expandable
provisioner: kubernetes.io/aws-ebs
allowVolumeExpansion: true    # 允許擴容
```

**擴容 PVC**：
```bash
# 編輯 PVC，增加 storage
kubectl edit pvc my-pvc

# 或使用 patch
kubectl patch pvc my-pvc -p '{"spec":{"resources":{"requests":{"storage":"20Gi"}}}}'
```

**注意事項**：
- 只能**擴容**，不能縮容
- 某些存儲類型需要重啟 Pod 才能生效
- 檔案系統需要支援擴容（如 ext4、xfs）

### 實際應用範例

#### 完整的 MySQL 部署

```yaml
# StorageClass
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mysql-storage
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Retain
---
# PVC
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
  namespace: production
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: mysql-storage
  resources:
    requests:
      storage: 50Gi
---
# Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql
  namespace: production
spec:
  replicas: 1
  strategy:
    type: Recreate    # 確保不會有兩個 Pod 同時使用 RWO PV
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: password
        ports:
        - containerPort: 3306
        volumeMounts:
        - name: mysql-data
          mountPath: /var/lib/mysql
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
      
      volumes:
      - name: mysql-data
        persistentVolumeClaim:
          claimName: mysql-pvc
```

### 監控與除錯

#### 常用命令

```bash
# 查看 PV
kubectl get pv

# 查看 PVC
kubectl get pvc
kubectl get pvc -n <namespace>

# 查看詳細資訊
kubectl describe pv <pv-name>
kubectl describe pvc <pvc-name>

# 查看 StorageClass
kubectl get storageclass
kubectl describe storageclass <sc-name>

# 查看綁定關係
kubectl get pv,pvc
```

#### 常見問題

**問題 1：PVC 一直 Pending**
```bash
# 檢查 PVC 狀態
kubectl describe pvc my-pvc

# 可能原因：
# 1. 沒有符合條件的 PV
# 2. StorageClass 不存在
# 3. Provisioner 未運行
```

**問題 2：Pod 無法啟動（Mount 失敗）**
```bash
# 檢查 Pod 事件
kubectl describe pod <pod-name>

# 可能原因：
# 1. PV 存儲後端不可用
# 2. 節點無法訪問存儲
# 3. 權限問題
```

**問題 3：PV 無法刪除（Released 狀態）**
```bash
# 手動清理 PV
kubectl patch pv <pv-name> -p '{"metadata":{"finalizers":null}}'
kubectl delete pv <pv-name>
```

## 總結

**存儲抽象層次**：
- **PV**：實際存儲資源（管理員視角）
- **PVC**：存儲需求聲明（用戶視角）
- **StorageClass**：動態配置器（自動化）

**關鍵概念**：
- PVC 綁定 PV
- StorageClass 動態創建 PV
- volumeBindingMode 影響綁定時機
- StatefulSet 使用 VolumeClaimTemplate

**生產環境建議**：
- 使用動態配置（StorageClass）
- 設置合適的回收策略（Retain for production）
- 啟用存儲擴容
- 定期備份持久化資料

掌握 Kubernetes 存儲管理是部署有狀態應用的關鍵。
