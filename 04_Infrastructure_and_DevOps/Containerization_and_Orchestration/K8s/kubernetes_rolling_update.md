# Rolling Update 與 Rollback 策略

- **難度**: 5
- **標籤**: `Kubernetes`, `Deployment`, `Rolling Update`, `Rollback`

## 問題詳述

請解釋 Kubernetes 中 Deployment 的滾動更新（Rolling Update）機制、更新策略的配置，以及如何進行版本回滾（Rollback）。

## 核心理論與詳解

### 為什麼需要滾動更新

**傳統部署的問題**：
```
停止所有實例 → 部署新版本 → 啟動實例
          ↓
      服務中斷！
```

**滾動更新的優勢**：
- **零停機部署**（Zero Downtime）
- 逐步替換舊版本
- 出現問題可快速回滾
- 可控的更新速度

### Deployment 更新策略

Kubernetes Deployment 支援兩種更新策略：

| 策略 | 說明 | 適用場景 |
|------|------|---------|
| **RollingUpdate** | 逐步替換舊 Pod（預設） | 大多數場景 |
| **Recreate** | 先刪除所有舊 Pod，再創建新 Pod | 不支援多版本並存 |

### RollingUpdate 策略

#### 基本配置

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 3           # 最多超出期望副本數的 Pod 數量
      maxUnavailable: 2     # 最多不可用的 Pod 數量
  
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:v1
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
```

#### maxSurge 和 maxUnavailable

**maxSurge（最大浪湧）**：
- 更新過程中，最多可以**額外創建**多少個 Pod
- 可以是數字或百分比

**範例**：
```yaml
replicas: 10
maxSurge: 3    # 最多 13 個 Pod（10 + 3）
```

**maxUnavailable（最大不可用）**：
- 更新過程中，最多允許多少個 Pod **不可用**
- 可以是數字或百分比

**範例**：
```yaml
replicas: 10
maxUnavailable: 2    # 最少 8 個 Pod 可用（10 - 2）
```

**兩者的關係**：
- `maxSurge = 0` 且 `maxUnavailable = 0` 是**無效**配置
- 至少一個必須 > 0

#### 更新過程示意

**配置**：
```yaml
replicas: 5
maxSurge: 2
maxUnavailable: 1
```

**更新流程**：
```
初始狀態（v1）:
[v1] [v1] [v1] [v1] [v1]     5個Pod

步驟1：創建2個新Pod（maxSurge=2）
[v1] [v1] [v1] [v1] [v1] [v2] [v2]     7個Pod（5+2）

步驟2：等待新Pod就緒，刪除1個舊Pod（maxUnavailable=1）
[v1] [v1] [v1] [v1] [v2] [v2]     6個Pod

步驟3：創建1個新Pod
[v1] [v1] [v1] [v1] [v2] [v2] [v2]     7個Pod

步驟4：刪除1個舊Pod
[v1] [v1] [v1] [v2] [v2] [v2]     6個Pod

步驟5：重複直到全部更新完成
[v2] [v2] [v2] [v2] [v2]     5個Pod（全部v2）
```

#### 百分比配置

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 25%           # replicas * 25% = 額外 Pod 數
    maxUnavailable: 25%     # replicas * 25% = 不可用 Pod 數
```

**範例**：
```yaml
replicas: 10
maxSurge: 25%           # 2.5 → 向上取整 = 3
maxUnavailable: 25%     # 2.5 → 向下取整 = 2

# 更新時：
# - 最多 13 個 Pod（10 + 3）
# - 最少 8 個 Pod 可用（10 - 2）
```

#### 更新速度的權衡

**快速更新（激進）**：
```yaml
rollingUpdate:
  maxSurge: 100%        # 加倍 Pod 數量
  maxUnavailable: 0     # 保持高可用
```
- 優點：更新快
- 缺點：資源消耗大

**穩健更新（保守）**：
```yaml
rollingUpdate:
  maxSurge: 1           # 每次增加 1 個
  maxUnavailable: 0     # 完全無停機
```
- 優點：安全、資源消耗小
- 缺點：更新慢

**平衡配置（推薦）**：
```yaml
rollingUpdate:
  maxSurge: 25%
  maxUnavailable: 25%
```

### Recreate 策略

**配置**：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 5
  strategy:
    type: Recreate    # 重建策略
  
  template:
    spec:
      containers:
      - name: myapp
        image: myapp:v2
```

**更新流程**：
```
步驟1：刪除所有舊 Pod
[v1] [v1] [v1] [v1] [v1]
           ↓
         [無Pod]    ← 服務中斷

步驟2：創建所有新 Pod
[v2] [v2] [v2] [v2] [v2]
```

**使用場景**：
- 應用不支援多版本並存
- 需要資料庫遷移
- 開發/測試環境

### 觸發更新

#### 1. 更新映像

**命令行**：
```bash
# 更新映像
kubectl set image deployment/myapp myapp=myapp:v2

# 更新多個容器
kubectl set image deployment/myapp \
  container1=image1:v2 \
  container2=image2:v2
```

**YAML**：
```yaml
# 修改 image 欄位
spec:
  template:
    spec:
      containers:
      - name: myapp
        image: myapp:v2    # v1 → v2
```

#### 2. 更新環境變數

```bash
kubectl set env deployment/myapp ENV=production
```

#### 3. 更新資源配置

```bash
kubectl set resources deployment/myapp \
  --limits=cpu=200m,memory=512Mi \
  --requests=cpu=100m,memory=256Mi
```

#### 4. 編輯 Deployment

```bash
kubectl edit deployment myapp
```

### 監控更新狀態

#### 查看更新狀態

```bash
# 查看 Deployment 狀態
kubectl rollout status deployment/myapp

# 輸出範例：
Waiting for deployment "myapp" rollout to finish: 3 out of 5 new replicas have been updated...
Waiting for deployment "myapp" rollout to finish: 4 out of 5 new replicas have been updated...
Waiting for deployment "myapp" rollout to finish: 4 of 5 updated replicas are available...
deployment "myapp" successfully rolled out
```

#### 查看更新歷史

```bash
# 列出所有版本
kubectl rollout history deployment/myapp

# 輸出範例：
REVISION  CHANGE-CAUSE
1         <none>
2         kubectl set image deployment/myapp myapp=myapp:v2
3         kubectl set image deployment/myapp myapp=myapp:v3

# 查看特定版本的詳細資訊
kubectl rollout history deployment/myapp --revision=2
```

#### 查看實時 Pod 變化

```bash
# 監聽 Pod 變化
kubectl get pods -w

# 查看 ReplicaSet
kubectl get rs

# 輸出範例：
NAME               DESIRED   CURRENT   READY   AGE
myapp-5d4b7c9f8d   5         5         5       10m   ← 新版本
myapp-7f8c9d6b5e   0         0         0       20m   ← 舊版本
```

### 暫停和恢復更新

**暫停更新**：
```bash
# 暫停更新
kubectl rollout pause deployment/myapp

# 此時可以進行多個修改
kubectl set image deployment/myapp myapp=myapp:v3
kubectl set env deployment/myapp NEW_ENV=value

# 恢復更新（一次性應用所有修改）
kubectl rollout resume deployment/myapp
```

**使用場景**：
- 批量修改配置
- 金絲雀發布（手動控制）

### 回滾（Rollback）

#### 回滾到上一個版本

```bash
# 回滾到上一個版本
kubectl rollout undo deployment/myapp

# 等同於
kubectl rollout undo deployment/myapp --to-revision=0
```

#### 回滾到指定版本

```bash
# 查看版本歷史
kubectl rollout history deployment/myapp

# 回滾到特定版本
kubectl rollout undo deployment/myapp --to-revision=2
```

#### 回滾過程

**範例**：
```
當前版本：v3（Revision 3）
回滾目標：v2（Revision 2）

步驟1：Kubernetes 創建新的 Revision 4（內容與 Revision 2 相同）
步驟2：執行滾動更新（v3 → v2）
步驟3：完成回滾

結果：
  Revision 4（當前）← 內容等同 Revision 2
  Revision 3（舊版本）
  Revision 2（舊版本）
  Revision 1（舊版本）
```

#### 保留歷史版本數量

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  revisionHistoryLimit: 5    # 保留 5 個歷史版本（預設 10）
  replicas: 5
  template:
    spec:
      containers:
      - name: myapp
        image: myapp:v1
```

### 健康檢查與更新

**配合 Readiness Probe**：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  
  template:
    spec:
      containers:
      - name: myapp
        image: myapp:v2
        
        # Readiness Probe：新 Pod 必須就緒才繼續更新
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
        
        # Liveness Probe：檢測不健康的 Pod
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 10
```

**重要**：
- 新 Pod 必須通過 Readiness Probe 才會被加入 Service
- 如果新 Pod 一直不就緒，更新會**停滯**
- 設置合理的超時時間

### 進度截止時間

**配置**：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  progressDeadlineSeconds: 600    # 更新超時時間（秒）
  replicas: 5
  template:
    spec:
      containers:
      - name: myapp
        image: myapp:v2
```

**行為**：
- 如果 600 秒內更新未完成，Deployment 狀態變為 **Failed**
- 可以觸發告警
- 不會自動回滾（需要手動處理）

### 金絲雀發布（Canary Deployment）

**手動金絲雀發布**：

**步驟 1：暫停自動更新**
```bash
kubectl set image deployment/myapp myapp=myapp:v2
kubectl rollout pause deployment/myapp
```

**步驟 2：手動擴容新版本**
```bash
# 此時只有部分 Pod 是新版本
kubectl get pods

# 如果新版本表現良好，恢復更新
kubectl rollout resume deployment/myapp
```

**使用多個 Deployment（更複雜但更靈活）**：
```yaml
# 穩定版本
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-stable
spec:
  replicas: 9
  template:
    metadata:
      labels:
        app: myapp
        version: stable
    spec:
      containers:
      - name: myapp
        image: myapp:v1
---
# 金絲雀版本
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-canary
spec:
  replicas: 1    # 10% 流量
  template:
    metadata:
      labels:
        app: myapp
        version: canary
    spec:
      containers:
      - name: myapp
        image: myapp:v2
---
# Service（同時指向兩個版本）
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp    # 匹配兩個 Deployment
  ports:
  - port: 80
    targetPort: 8080
```

### 藍綠部署（Blue-Green Deployment）

**概念**：
- 同時運行兩個版本
- 切換 Service 指向新版本
- 可快速回滾

**實現**：
```yaml
# 藍色版本（當前）
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-blue
spec:
  replicas: 5
  template:
    metadata:
      labels:
        app: myapp
        version: blue
    spec:
      containers:
      - name: myapp
        image: myapp:v1
---
# 綠色版本（新版本）
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-green
spec:
  replicas: 5
  template:
    metadata:
      labels:
        app: myapp
        version: green
    spec:
      containers:
      - name: myapp
        image: myapp:v2
---
# Service（當前指向藍色）
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
    version: blue    # 切換這裡實現藍綠切換
  ports:
  - port: 80
    targetPort: 8080
```

**切換到綠色版本**：
```bash
kubectl patch service myapp -p '{"spec":{"selector":{"version":"green"}}}'
```

**回滾到藍色版本**：
```bash
kubectl patch service myapp -p '{"spec":{"selector":{"version":"blue"}}}'
```

### 除錯失敗的更新

#### 常見問題

**問題 1：新 Pod 一直 Pending**
```bash
# 檢查 Pod 狀態
kubectl describe pod <pod-name>

# 可能原因：
# - 資源不足
# - 映像拉取失敗
# - PVC 無法綁定
```

**問題 2：新 Pod 反覆 CrashLoopBackOff**
```bash
# 查看 Pod 日誌
kubectl logs <pod-name>

# 查看上一次容器的日誌
kubectl logs <pod-name> --previous

# 可能原因：
# - 應用啟動失敗
# - 配置錯誤
# - 依賴服務不可用
```

**問題 3：更新卡住（部分 Pod 是新版本）**
```bash
# 檢查 Readiness Probe
kubectl describe pod <new-pod-name>

# 可能原因：
# - Readiness Probe 配置錯誤
# - 新版本有 Bug，無法通過健康檢查

# 回滾
kubectl rollout undo deployment/myapp
```

### 最佳實踐

**1. 始終配置 Readiness Probe**
```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 3
```

**2. 設置合理的更新策略**
```yaml
strategy:
  rollingUpdate:
    maxSurge: 25%
    maxUnavailable: 25%
```

**3. 記錄變更原因**
```bash
kubectl set image deployment/myapp myapp=myapp:v2 \
  --record    # 記錄到歷史（已廢棄，使用 annotations）

# 推薦：使用 annotations
kubectl annotate deployment/myapp \
  kubernetes.io/change-cause="Update to v2 for bug fix"
```

**4. 先在測試環境驗證**
```bash
# 測試環境更新
kubectl set image deployment/myapp myapp=myapp:v2 -n testing

# 驗證後再更新生產環境
kubectl set image deployment/myapp myapp=myapp:v2 -n production
```

**5. 監控更新過程**
```bash
# 實時監控
kubectl rollout status deployment/myapp -w

# 同時監控 Pod 狀態
kubectl get pods -w
```

## 總結

**滾動更新**：
- 零停機部署
- 逐步替換 Pod
- 透過 `maxSurge` 和 `maxUnavailable` 控制速度

**回滾**：
- 快速恢復到舊版本
- 保留歷史版本（revisionHistoryLimit）
- 可回滾到任意歷史版本

**關鍵配置**：
- Readiness Probe：確保新 Pod 就緒
- progressDeadlineSeconds：防止更新無限等待
- 合理的 maxSurge 和 maxUnavailable

**高級策略**：
- 金絲雀發布：逐步放量
- 藍綠部署：快速切換

**最佳實踐**：
- 配置健康檢查
- 記錄變更原因
- 先測試後上線
- 監控更新過程

滾動更新和回滾是 Kubernetes 實現持續部署和快速恢復的核心機制。
