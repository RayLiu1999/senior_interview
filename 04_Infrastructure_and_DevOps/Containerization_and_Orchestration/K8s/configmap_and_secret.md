# ConfigMap 與 Secret 的使用

- **難度**: 5
- **標籤**: `Kubernetes`, `ConfigMap`, `Secret`, `Configuration`

## 問題詳述

請解釋 Kubernetes 中 ConfigMap 和 Secret 的作用、使用方式以及兩者的差異。如何在 Pod 中使用它們？

## 核心理論與詳解

### 為什麼需要 ConfigMap 和 Secret

**問題場景**：
- 不同環境（開發、測試、生產）需要不同配置
- 敏感資訊（密碼、API Key）不應寫在映像中
- 配置變更不應重新構建映像

**解決方案**：
- **ConfigMap**：存儲非敏感的配置資料
- **Secret**：存儲敏感資訊

### ConfigMap：配置管理

#### 什麼是 ConfigMap

**定義**：
- 用於存儲非機密的配置資料
- 以鍵值對形式存儲
- 與 Pod 解耦，實現配置與應用分離

#### 創建 ConfigMap 的方式

**1. 從命令行創建**

```bash
# 從字面值創建
kubectl create configmap app-config \
  --from-literal=database_url=mysql://localhost:3306 \
  --from-literal=log_level=info

# 從檔案創建
kubectl create configmap app-config \
  --from-file=config.properties

# 從目錄創建
kubectl create configmap app-config \
  --from-file=configs/
```

**2. 從 YAML 創建**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: default
data:
  # 簡單鍵值對
  database_url: "mysql://localhost:3306"
  log_level: "info"
  
  # 配置檔案
  app.properties: |
    server.port=8080
    server.host=0.0.0.0
    database.pool.size=20
  
  nginx.conf: |
    server {
      listen 80;
      server_name example.com;
      location / {
        proxy_pass http://backend:8080;
      }
    }
```

#### 在 Pod 中使用 ConfigMap

**方式 1：作為環境變數**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  containers:
  - name: myapp
    image: myapp:1.0
    env:
    # 單個鍵
    - name: DATABASE_URL
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: database_url
    
    # 全部鍵
    envFrom:
    - configMapRef:
        name: app-config
```

**方式 2：作為 Volume 掛載**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  containers:
  - name: myapp
    image: myapp:1.0
    volumeMounts:
    - name: config-volume
      mountPath: /etc/config    # 掛載到容器內的路徑
      readOnly: true
  
  volumes:
  - name: config-volume
    configMap:
      name: app-config
      items:    # 選擇性掛載特定鍵
      - key: app.properties
        path: application.properties
```

**方式 3：作為命令行參數**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  containers:
  - name: myapp
    image: myapp:1.0
    command: ["/bin/sh"]
    args:
    - "-c"
    - "echo Database: $(DATABASE_URL) && ./app"
    env:
    - name: DATABASE_URL
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: database_url
```

### Secret：敏感資訊管理

#### 什麼是 Secret

**定義**：
- 用於存儲敏感資訊（密碼、Token、SSH 金鑰）
- 資料經過 Base64 編碼（注意：不是加密）
- 可以限制訪問權限

#### Secret 的類型

| 類型 | 用途 | 範例 |
|------|------|------|
| `Opaque` | 通用 Secret（預設） | 密碼、API Key |
| `kubernetes.io/service-account-token` | ServiceAccount Token | K8s 自動創建 |
| `kubernetes.io/dockerconfigjson` | Docker Registry 認證 | 拉取私有映像 |
| `kubernetes.io/tls` | TLS 憑證 | HTTPS 憑證 |
| `kubernetes.io/ssh-auth` | SSH 認證 | SSH 私鑰 |
| `kubernetes.io/basic-auth` | 基本認證 | 用戶名密碼 |

#### 創建 Secret 的方式

**1. 從命令行創建**

```bash
# 通用 Secret
kubectl create secret generic db-secret \
  --from-literal=username=admin \
  --from-literal=password=P@ssw0rd

# Docker Registry Secret
kubectl create secret docker-registry regcred \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=myuser \
  --docker-password=mypass \
  --docker-email=myemail@example.com

# TLS Secret
kubectl create secret tls tls-secret \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

**2. 從 YAML 創建**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  # Base64 編碼的值
  username: YWRtaW4=          # admin
  password: UEBzc3cwcmQ=      # P@ssw0rd

# 或使用 stringData（自動編碼）
stringData:
  username: admin
  password: P@ssw0rd
```

**Base64 編碼/解碼**：

```bash
# 編碼
echo -n 'admin' | base64
# 輸出: YWRtaW4=

# 解碼
echo 'YWRtaW4=' | base64 --decode
# 輸出: admin
```

#### 在 Pod 中使用 Secret

**方式 1：作為環境變數**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  containers:
  - name: myapp
    image: myapp:1.0
    env:
    # 單個鍵
    - name: DB_USERNAME
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: username
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: password
    
    # 全部鍵
    envFrom:
    - secretRef:
        name: db-secret
```

**方式 2：作為 Volume 掛載**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  containers:
  - name: myapp
    image: myapp:1.0
    volumeMounts:
    - name: secret-volume
      mountPath: /etc/secret
      readOnly: true    # Secret 應該只讀
  
  volumes:
  - name: secret-volume
    secret:
      secretName: db-secret
      defaultMode: 0400    # 只有 owner 可讀
```

**方式 3：作為 imagePullSecrets**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  imagePullSecrets:
  - name: regcred    # Docker Registry Secret
  containers:
  - name: myapp
    image: myregistry.com/myapp:1.0
```

### ConfigMap vs. Secret 對比

| 特性 | ConfigMap | Secret |
|------|-----------|--------|
| **用途** | 非敏感配置 | 敏感資訊 |
| **儲存方式** | 明文 | Base64 編碼 |
| **加密** | 不加密 | 可選加密（etcd 加密） |
| **大小限制** | 1MB | 1MB |
| **更新傳播** | 自動更新（Volume 方式） | 自動更新（Volume 方式） |
| **環境變數** | 支援 | 支援 |
| **Volume 掛載** | 支援 | 支援 |
| **適用場景** | 配置檔案、環境變數 | 密碼、Token、憑證 |

### 重要概念與最佳實踐

#### 1. 更新行為

**環境變數方式**：
- ConfigMap/Secret 更新後，**不會**自動更新到 Pod
- 需要重啟 Pod 才能生效

**Volume 掛載方式**：
- ConfigMap/Secret 更新後，會**自動同步**到 Pod（有延遲，約 1-2 分鐘）
- 應用需要支援熱加載才能生效

**觸發 Pod 重啟的方法**：

```bash
# 方式 1：更新 Deployment 的註解
kubectl patch deployment myapp -p \
  '{"spec":{"template":{"metadata":{"annotations":{"restartedAt":"'$(date +%s)'"}}}}}'

# 方式 2：使用 rollout restart
kubectl rollout restart deployment myapp
```

#### 2. Secret 安全性

**限制**：
- Base64 只是編碼，**不是加密**
- 任何能訪問 API 的用戶都能讀取 Secret

**加強安全性**：

1. **啟用 etcd 加密**：
```yaml
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
  - resources:
    - secrets
    providers:
    - aescbc:
        keys:
        - name: key1
          secret: <base64-encoded-secret>
    - identity: {}
```

2. **使用 RBAC 限制訪問**：
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: secret-reader
rules:
- apiGroups: [""]
  resources: ["secrets"]
  resourceNames: ["db-secret"]
  verbs: ["get"]
```

3. **使用外部 Secret 管理**：
- **HashiCorp Vault**
- **AWS Secrets Manager**
- **Azure Key Vault**
- **Google Secret Manager**
- **Sealed Secrets**（加密存儲在 Git）

#### 3. 不可變 ConfigMap/Secret

**Kubernetes 1.21+** 支援不可變配置：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
immutable: true    # 創建後無法修改
data:
  key: value
```

**優點**：
- 防止意外更新
- 提升性能（減少 API Server 負載）
- 需要更新時創建新版本

#### 4. 版本管理策略

**策略 1：版本化命名**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config-v2    # 帶版本號
data:
  key: value
---
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - name: app
        envFrom:
        - configMapRef:
            name: app-config-v2    # 引用特定版本
```

**策略 2：使用 Hash 後綴**

```bash
# 自動生成包含內容 Hash 的名稱
kubectl create configmap app-config \
  --from-file=config.yaml \
  --dry-run=client -o yaml | \
  kubectl apply -f -
```

### 實際應用範例

#### 完整的應用配置範例

```yaml
# ConfigMap: 應用配置
apiVersion: v1
kind: ConfigMap
metadata:
  name: myapp-config
data:
  APP_ENV: "production"
  LOG_LEVEL: "info"
  application.yaml: |
    server:
      port: 8080
    database:
      host: db.example.com
      port: 5432
---
# Secret: 資料庫憑證
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
stringData:
  DB_USER: "appuser"
  DB_PASSWORD: "SecureP@ss123"
---
# Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:1.0
        
        # 環境變數：從 ConfigMap
        env:
        - name: APP_ENV
          valueFrom:
            configMapKeyRef:
              name: myapp-config
              key: APP_ENV
        
        # 環境變數：從 Secret
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: DB_USER
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: DB_PASSWORD
        
        # Volume 掛載：配置檔案
        volumeMounts:
        - name: config
          mountPath: /etc/config
      
      volumes:
      - name: config
        configMap:
          name: myapp-config
          items:
          - key: application.yaml
            path: application.yaml
```

## 總結

**ConfigMap**：
- 用於非敏感配置
- 支援多種使用方式
- 自動更新（Volume 模式）

**Secret**：
- 用於敏感資訊
- Base64 編碼但非加密
- 需要額外安全措施

**最佳實踐**：
- 配置與代碼分離
- 使用版本管理
- 啟用加密和 RBAC
- 考慮外部 Secret 管理系統

理解 ConfigMap 和 Secret 的使用是 Kubernetes 應用配置管理的基礎。
