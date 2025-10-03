# Deployment vs. StatefulSet vs. DaemonSet

- **難度**: 7
- **標籤**: `Kubernetes`, `Deployment`, `StatefulSet`, `DaemonSet`

## 問題詳述

請詳細比較 Kubernetes 中的 Deployment、StatefulSet 和 DaemonSet 三種工作負載資源，說明它們的適用場景、特點和差異。

## 核心理論與詳解

### 三種工作負載資源概覽

| 特性 | Deployment | StatefulSet | DaemonSet |
|------|-----------|-------------|-----------|
| **用途** | 無狀態應用 | 有狀態應用 | 每節點一個 Pod |
| **Pod 名稱** | 隨機後綴 | 有序編號 | 基於節點名 |
| **Pod 順序** | 無序創建/刪除 | 有序創建/刪除 | 自動調度 |
| **網路標識** | 不穩定 | 穩定 | 不適用 |
| **存儲** | 共享或臨時 | 獨立持久化 | 通常主機掛載 |
| **擴展方式** | 水平擴展 | 有序擴展 | 不可擴展 |
| **典型應用** | Web 服務、API | 資料庫、消息佇列 | 日誌收集、監控 |

### Deployment：無狀態應用的首選

#### 核心特性

**1. 無狀態設計**
- Pod 之間完全相同，可互相替換
- Pod 名稱帶隨機後綴（如 `nginx-7d8b7f9-xk2p4`）
- 重啟後 IP 和主機名會變化

**2. 滾動更新**
- 支援無縫更新應用版本
- 可設置更新策略（如最多不可用數、最大超出數）
- 支援暫停和繼續更新

**3. 回滾機制**
- 保留歷史版本記錄
- 一鍵回滾到之前版本
- 可查看修改歷史

**4. 自動擴展**
- 支援手動擴展（`kubectl scale`）
- 支援 HPA (Horizontal Pod Autoscaler)

#### YAML 範例

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1    # 最多 1 個 Pod 不可用
      maxSurge: 1          # 最多多出 1 個 Pod
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
```

#### 適用場景

- **Web 應用**：Nginx、Apache
- **API 服務**：RESTful API、gRPC 服務
- **微服務**：大多數無狀態微服務
- **批處理作業**：無需持久化狀態的任務

#### 關鍵特點

**優勢**：
- 部署簡單，管理方便
- 支援豐富的更新策略
- 適合大多數場景

**限制**：
- 不適合需要穩定網路標識的應用
- 不適合需要持久化狀態的應用

### StatefulSet：有狀態應用的選擇

#### 核心特性

**1. 穩定的網路標識**
- Pod 名稱有序且穩定（如 `mysql-0`, `mysql-1`, `mysql-2`）
- 每個 Pod 有穩定的 DNS 名稱
- 格式：`<pod-name>.<service-name>.<namespace>.svc.cluster.local`

**2. 有序的部署和擴展**
- Pod 按順序創建（0, 1, 2, ...）
- 只有前一個 Pod 就緒後才創建下一個
- 刪除時逆序刪除（2, 1, 0）

**3. 持久化存儲**
- 每個 Pod 有獨立的 PVC (PersistentVolumeClaim)
- PVC 與 Pod 綁定，Pod 重啟後仍然掛載同一個 PV
- 支援動態存儲配置

**4. 有序的更新**
- 按逆序更新（從最大編號開始）
- 支援分區更新（Partitions）

#### YAML 範例

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql-headless
spec:
  clusterIP: None    # Headless Service
  selector:
    app: mysql
  ports:
  - port: 3306
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: mysql-headless
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
        env:
        - name: MYSQL_ROOT_PASSWORD
          value: "password"
        ports:
        - containerPort: 3306
        volumeMounts:
        - name: data
          mountPath: /var/lib/mysql
  volumeClaimTemplates:    # 為每個 Pod 創建 PVC
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

#### 適用場景

- **資料庫**：MySQL、PostgreSQL、MongoDB
- **消息佇列**：Kafka、RabbitMQ
- **分散式系統**：Zookeeper、Etcd、Consul
- **大數據**：Elasticsearch、Cassandra

#### 關鍵特點

**優勢**：
- 穩定的網路標識，適合需要固定主機名的應用
- 持久化存儲綁定到特定 Pod
- 有序部署，適合主從架構

**限制**：
- 管理複雜度較高
- 刪除 StatefulSet 不會自動刪除 PVC
- 更新和擴展較慢

**Headless Service**：
StatefulSet 通常配合 Headless Service 使用：
- `clusterIP: None`
- 不負載均衡，直接返回 Pod IP
- 提供穩定的 DNS 解析

### DaemonSet：每節點運行一個 Pod

#### 核心特性

**1. 節點級別部署**
- 每個節點（或匹配的節點）運行一個 Pod
- 新節點加入時自動部署
- 節點移除時自動清理

**2. 系統級服務**
- 通常用於節點級別的基礎設施服務
- 不受調度器控制（可訪問所有節點）

**3. 自動調度**
- 無需指定副本數
- 根據節點數自動調整

#### YAML 範例

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
  namespace: kube-system
spec:
  selector:
    matchLabels:
      app: fluentd
  template:
    metadata:
      labels:
        app: fluentd
    spec:
      tolerations:    # 容忍節點污點，確保在所有節點運行
      - key: node-role.kubernetes.io/master
        effect: NoSchedule
      containers:
      - name: fluentd
        image: fluent/fluentd:v1.14
        volumeMounts:
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
```

#### 適用場景

- **日誌收集**：Fluentd、Filebeat
- **監控代理**：Prometheus Node Exporter、Datadog Agent
- **網路插件**：Calico、Flannel
- **存儲插件**：Ceph、GlusterFS
- **安全掃描**：Falco

#### 關鍵特點

**優勢**：
- 自動覆蓋所有節點
- 適合系統級服務
- 無需關心副本數

**限制**：
- 不支援滾動更新策略（但支援 OnDelete 和 RollingUpdate）
- 無法精確控制 Pod 數量

**節點選擇**：
可以通過 `nodeSelector` 或 `affinity` 只在特定節點運行：

```yaml
spec:
  template:
    spec:
      nodeSelector:
        disktype: ssd    # 只在有 SSD 的節點運行
```

### 三者比較總結

#### 選擇指南

**使用 Deployment**：
- 應用無狀態
- Pod 可以互相替換
- 需要滾動更新和回滾
- 需要彈性擴展

**使用 StatefulSet**：
- 應用有狀態
- 需要穩定的網路標識
- 需要持久化存儲
- 有序部署/刪除要求

**使用 DaemonSet**：
- 需要在每個節點運行
- 系統級服務（日誌、監控）
- 不需要擴展

#### 更新策略對比

| 類型 | 更新策略 | 特點 |
|------|---------|------|
| **Deployment** | RollingUpdate, Recreate | 靈活的更新控制 |
| **StatefulSet** | RollingUpdate, OnDelete | 有序更新，支援分區 |
| **DaemonSet** | RollingUpdate, OnDelete | 逐節點更新 |

## 總結

- **Deployment** 是最常用的工作負載，適合 90% 的應用場景
- **StatefulSet** 專為有狀態應用設計，提供穩定性保證
- **DaemonSet** 用於節點級別的系統服務

正確選擇工作負載類型是 Kubernetes 應用部署的第一步，也是面試中經常考察的知識點。
