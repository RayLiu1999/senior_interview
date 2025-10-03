# Namespace 與 RBAC 權限管理

- **難度**: 7
- **標籤**: `Kubernetes`, `Namespace`, `RBAC`, `Security`

## 問題詳述

請解釋 Kubernetes 中 Namespace 的作用，以及如何使用 RBAC（Role-Based Access Control）進行權限管理。

## 核心理論與詳解

### Namespace

#### 什麼是 Namespace

**定義**：
- Kubernetes 的**虛擬集群**
- 用於劃分資源的邏輯邊界
- 實現多租戶隔離

**類比**：
- 類似 Linux 的目錄
- 類似雲服務商的項目（Project）

#### 預設的 Namespace

| Namespace | 用途 |
|-----------|------|
| **default** | 未指定 Namespace 時的預設值 |
| **kube-system** | Kubernetes 系統元件 |
| **kube-public** | 公開資源（所有用戶可讀） |
| **kube-node-lease** | Node 心跳資訊（1.14+） |

#### 創建和管理 Namespace

**創建 Namespace**：
```bash
# 方式 1：命令行
kubectl create namespace production

# 方式 2：YAML
kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    env: production
EOF
```

**查看 Namespace**：
```bash
# 列出所有 Namespace
kubectl get namespaces
kubectl get ns

# 查看詳細資訊
kubectl describe namespace production
```

**刪除 Namespace**：
```bash
kubectl delete namespace production
# ⚠️ 會刪除該 Namespace 下的所有資源
```

#### 在 Namespace 中創建資源

**方式 1：使用 -n 參數**：
```bash
kubectl create deployment nginx --image=nginx -n production
kubectl get pods -n production
```

**方式 2：在 YAML 中指定**：
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  namespace: production    # 指定 Namespace
spec:
  containers:
  - name: nginx
    image: nginx
```

**方式 3：設置預設 Namespace**：
```bash
# 為當前 context 設置預設 Namespace
kubectl config set-context --current --namespace=production

# 驗證
kubectl config view --minify | grep namespace
```

#### Namespace 隔離

**資源隔離**：
- 同一 Namespace 內的資源可以互相引用
- 跨 Namespace 需要使用 FQDN

**Service DNS 解析**：
```
同 Namespace:
  service-name
  service-name.namespace-name
  service-name.namespace-name.svc.cluster.local

跨 Namespace:
  service-name.other-namespace
  service-name.other-namespace.svc.cluster.local
```

**範例**：
```yaml
# production namespace 中的 Pod
apiVersion: v1
kind: Pod
metadata:
  name: frontend
  namespace: production
spec:
  containers:
  - name: app
    image: myapp:1.0
    env:
    # 訪問同 Namespace 的 Service
    - name: BACKEND_URL
      value: "http://backend"    # 簡短形式
    
    # 訪問其他 Namespace 的 Service
    - name: DATABASE_URL
      value: "http://mysql.database.svc.cluster.local"
```

**不隔離的資源**：
- Node
- PersistentVolume
- StorageClass
- Namespace 本身

#### Namespace 的使用場景

**1. 環境隔離**：
```bash
kubectl create namespace dev
kubectl create namespace staging
kubectl create namespace production
```

**2. 團隊隔離**：
```bash
kubectl create namespace team-a
kubectl create namespace team-b
kubectl create namespace team-c
```

**3. 項目隔離**：
```bash
kubectl create namespace project-alpha
kubectl create namespace project-beta
```

### RBAC (Role-Based Access Control)

#### 什麼是 RBAC

**定義**：
- 基於角色的訪問控制
- Kubernetes 的權限管理機制
- 控制誰可以對哪些資源執行什麼操作

**核心概念**：
```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Subject    │ ───→ │    Role      │ ───→ │   Resource   │
│  (用戶/SA)   │      │  (權限集合)  │      │  (資源對象)  │
└──────────────┘      └──────────────┘      └──────────────┘
     誰                   可以做什麼             對什麼資源
```

#### RBAC 的四個核心資源

| 資源 | 範圍 | 說明 |
|------|------|------|
| **Role** | Namespace | 命名空間內的權限 |
| **ClusterRole** | Cluster | 集群級別的權限 |
| **RoleBinding** | Namespace | 綁定 Role 到 Subject |
| **ClusterRoleBinding** | Cluster | 綁定 ClusterRole 到 Subject |

#### Subject（主體）類型

| 類型 | 說明 | 使用場景 |
|------|------|---------|
| **User** | 普通用戶 | 人類操作者 |
| **Group** | 用戶組 | 團隊權限 |
| **ServiceAccount** | 服務賬戶 | Pod 內的應用 |

### Role 與 RoleBinding

#### Role：定義權限

**基本範例**：
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: production
rules:
# 允許對 Pod 執行 get, list, watch
- apiGroups: [""]         # "" 表示 core API group
  resources: ["pods"]
  verbs: ["get", "list", "watch"]

# 允許對 Deployment 執行所有操作
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["*"]            # * 表示所有操作
```

#### Verbs（操作）

| Verb | 說明 |
|------|------|
| **get** | 獲取單個資源 |
| **list** | 列出資源 |
| **watch** | 監聽資源變化 |
| **create** | 創建資源 |
| **update** | 更新資源 |
| **patch** | 部分更新資源 |
| **delete** | 刪除資源 |
| **deletecollection** | 刪除資源集合 |

#### RoleBinding：綁定權限

**綁定到用戶**：
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: production
subjects:
# 用戶
- kind: User
  name: john
  apiGroup: rbac.authorization.k8s.io

roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

**綁定到 ServiceAccount**：
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods-sa
  namespace: production
subjects:
# ServiceAccount
- kind: ServiceAccount
  name: my-app
  namespace: production

roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

**綁定到用戶組**：
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: dev-team-binding
  namespace: dev
subjects:
# 用戶組
- kind: Group
  name: dev-team
  apiGroup: rbac.authorization.k8s.io

roleRef:
  kind: Role
  name: developer
  apiGroup: rbac.authorization.k8s.io
```

### ClusterRole 與 ClusterRoleBinding

#### ClusterRole：集群級別權限

**基本範例**：
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: node-reader
rules:
# 允許讀取 Node（集群資源）
- apiGroups: [""]
  resources: ["nodes"]
  verbs: ["get", "list", "watch"]

# 允許讀取所有 Namespace 的 Pod
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]

# 允許讀取 PersistentVolume（集群資源）
- apiGroups: [""]
  resources: ["persistentvolumes"]
  verbs: ["get", "list"]
```

#### ClusterRoleBinding

**綁定 ClusterRole**：
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: node-reader-binding
subjects:
- kind: User
  name: alice
  apiGroup: rbac.authorization.k8s.io

roleRef:
  kind: ClusterRole
  name: node-reader
  apiGroup: rbac.authorization.k8s.io
```

#### ClusterRole 的特殊用法

**在 Namespace 中使用 ClusterRole**：
```yaml
# ClusterRole 定義通用權限
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: pod-manager
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "create", "delete"]

---
# RoleBinding 將 ClusterRole 應用到特定 Namespace
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: pod-manager-binding
  namespace: production
subjects:
- kind: User
  name: bob
  apiGroup: rbac.authorization.k8s.io

roleRef:
  kind: ClusterRole    # 引用 ClusterRole
  name: pod-manager
  apiGroup: rbac.authorization.k8s.io
```

**優勢**：
- 定義一次，多個 Namespace 使用
- 便於統一管理

### ServiceAccount

#### 什麼是 ServiceAccount

**定義**：
- Pod 中應用的身份標識
- 用於 Pod 訪問 Kubernetes API

**自動創建**：
- 每個 Namespace 有一個 `default` ServiceAccount
- Pod 未指定時自動使用 `default`

#### 創建和使用 ServiceAccount

**創建 ServiceAccount**：
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-app
  namespace: production
```

**在 Pod 中使用**：
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
  namespace: production
spec:
  serviceAccountName: my-app    # 指定 ServiceAccount
  containers:
  - name: app
    image: myapp:1.0
```

**授予權限**：
```yaml
# Role
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: production
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]

---
# RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: my-app-binding
  namespace: production
subjects:
- kind: ServiceAccount
  name: my-app
  namespace: production

roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

#### 在應用中使用 ServiceAccount

**Go 範例**：
```go
package main

import (
    "context"
    "fmt"
    "k8s.io/client-go/kubernetes"
    "k8s.io/client-go/rest"
)

func main() {
    // 使用 Pod 內的 ServiceAccount Token
    config, err := rest.InClusterConfig()
    if err != nil {
        panic(err)
    }
    
    clientset, err := kubernetes.NewForConfig(config)
    if err != nil {
        panic(err)
    }
    
    // 列出 Pod
    pods, err := clientset.CoreV1().Pods("production").List(context.TODO(), metav1.ListOptions{})
    if err != nil {
        panic(err)
    }
    
    for _, pod := range pods.Items {
        fmt.Printf("Pod: %s\n", pod.Name)
    }
}
```

### 實際應用範例

#### 場景 1：開發團隊權限

**需求**：
- 開發團隊可以管理 `dev` Namespace 的所有資源
- 可以查看 `staging` Namespace 的資源
- 不能訪問 `production`

**配置**：
```yaml
# 開發者 Role（dev namespace）
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: developer
  namespace: dev
rules:
- apiGroups: ["*"]
  resources: ["*"]
  verbs: ["*"]    # 所有權限

---
# 查看者 Role（staging namespace）
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: viewer
  namespace: staging
rules:
- apiGroups: ["*"]
  resources: ["*"]
  verbs: ["get", "list", "watch"]    # 只讀權限

---
# RoleBinding（dev）
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: dev-team-dev
  namespace: dev
subjects:
- kind: Group
  name: dev-team
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: developer
  apiGroup: rbac.authorization.k8s.io

---
# RoleBinding（staging）
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: dev-team-staging
  namespace: staging
subjects:
- kind: Group
  name: dev-team
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: viewer
  apiGroup: rbac.authorization.k8s.io
```

#### 場景 2：CI/CD ServiceAccount

**需求**：
- CI/CD 可以部署應用（create/update Deployment）
- 可以查看 Pod 狀態
- 不能刪除資源

**配置**：
```yaml
# ServiceAccount
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ci-cd
  namespace: production

---
# Role
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: deployer
  namespace: production
rules:
# Deployment 權限
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "create", "update", "patch"]

# Pod 只讀權限
- apiGroups: [""]
  resources: ["pods", "pods/log"]
  verbs: ["get", "list", "watch"]

# Service 權限
- apiGroups: [""]
  resources: ["services"]
  verbs: ["get", "list", "create", "update"]

---
# RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: ci-cd-binding
  namespace: production
subjects:
- kind: ServiceAccount
  name: ci-cd
  namespace: production
roleRef:
  kind: Role
  name: deployer
  apiGroup: rbac.authorization.k8s.io
```

#### 場景 3：監控系統權限

**需求**：
- 監控系統需要讀取所有 Namespace 的 Pod、Node 指標

**配置**：
```yaml
# ServiceAccount
apiVersion: v1
kind: ServiceAccount
metadata:
  name: prometheus
  namespace: monitoring

---
# ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: prometheus
rules:
# 讀取所有 Namespace 的 Pod
- apiGroups: [""]
  resources: ["pods", "nodes", "services", "endpoints"]
  verbs: ["get", "list", "watch"]

# 讀取 Metrics
- apiGroups: [""]
  resources: ["pods/metrics", "nodes/metrics"]
  verbs: ["get"]

---
# ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: prometheus
subjects:
- kind: ServiceAccount
  name: prometheus
  namespace: monitoring
roleRef:
  kind: ClusterRole
  name: prometheus
  apiGroup: rbac.authorization.k8s.io
```

### 權限檢查與除錯

#### 檢查權限

```bash
# 檢查當前用戶是否有權限
kubectl auth can-i create deployments --namespace=production
kubectl auth can-i delete pods --namespace=production
kubectl auth can-i get nodes

# 檢查其他用戶的權限
kubectl auth can-i list pods --as=john --namespace=production

# 檢查 ServiceAccount 的權限
kubectl auth can-i list pods --as=system:serviceaccount:production:my-app
```

#### 查看 Role 和 RoleBinding

```bash
# 列出 Role
kubectl get role -n production
kubectl get clusterrole

# 查看詳細資訊
kubectl describe role pod-reader -n production
kubectl describe clusterrole cluster-admin

# 列出 RoleBinding
kubectl get rolebinding -n production
kubectl get clusterrolebinding

# 查看誰綁定了哪些權限
kubectl describe rolebinding my-app-binding -n production
```

#### 常見問題排查

**問題：403 Forbidden**
```bash
# 檢查權限
kubectl auth can-i <verb> <resource> --namespace=<namespace>

# 查看用戶綁定的 Role
kubectl get rolebinding,clusterrolebinding --all-namespaces -o json | \
  jq '.items[] | select(.subjects[]?.name=="<user-name>")'
```

### 預定義的 ClusterRole

| ClusterRole | 權限 |
|-------------|------|
| **cluster-admin** | 超級管理員（所有權限） |
| **admin** | 命名空間管理員 |
| **edit** | 讀寫權限（不能修改 Role） |
| **view** | 只讀權限 |

**使用預定義 Role**：
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: alice-admin
  namespace: production
subjects:
- kind: User
  name: alice
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: admin    # 使用預定義的 admin Role
  apiGroup: rbac.authorization.k8s.io
```

## 總結

**Namespace**：
- 虛擬集群，實現資源隔離
- 用於環境、團隊、項目隔離
- 服務發現使用 FQDN 跨 Namespace

**RBAC**：
- 基於角色的訪問控制
- Role/RoleBinding：命名空間級別
- ClusterRole/ClusterRoleBinding：集群級別
- ServiceAccount：Pod 的身份標識

**最佳實踐**：
- 為不同環境創建獨立 Namespace
- 使用 RBAC 實現最小權限原則
- 為每個應用創建專用 ServiceAccount
- 使用 ClusterRole 定義通用權限
- 定期審計權限配置

**安全建議**：
- 不要使用 `cluster-admin`
- 避免使用 `default` ServiceAccount
- 限制 Secret 的訪問權限
- 使用 ResourceQuota 限制資源

Namespace 和 RBAC 是 Kubernetes 多租戶和安全管理的基礎。
