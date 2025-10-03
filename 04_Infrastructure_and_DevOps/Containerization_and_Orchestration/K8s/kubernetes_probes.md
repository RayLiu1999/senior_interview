# Liveness Probe、Readiness Probe 與 Startup Probe

- **難度**: 6
- **標籤**: `Kubernetes`, `Health Check`, `Probe`

## 問題詳述

請詳細解釋 Kubernetes 中的三種探針（Probe）：Liveness Probe、Readiness Probe 和 Startup Probe，以及它們的作用、使用場景和配置方式。

## 核心理論與詳解

### 為什麼需要健康檢查

**問題場景**：
- 應用進程存在，但無法處理請求（死鎖、記憶體洩漏）
- 應用啟動緩慢，還未準備好接收流量
- 應用需要執行初始化任務

**解決方案**：
- 透過探針主動檢查容器健康狀態
- 根據檢查結果採取相應動作

### 三種探針概覽

| 探針類型 | 用途 | 失敗後動作 | 使用時機 |
|---------|------|-----------|---------|
| **Liveness Probe** | 檢查容器是否存活 | 重啟容器 | 檢測死鎖、無限循環 |
| **Readiness Probe** | 檢查容器是否就緒 | 移出 Service 端點 | 避免未就緒容器接收流量 |
| **Startup Probe** | 檢查容器是否啟動完成 | 重啟容器 | 慢啟動應用的保護 |

### Liveness Probe：存活探針

#### 作用

**目的**：
- 檢測容器是否**仍然健康運行**
- 發現並恢復進入不可用狀態的容器

**失敗後果**：
- kubelet 重啟容器
- 遵循 Pod 的重啟策略（RestartPolicy）

#### 使用場景

- 檢測應用死鎖
- 檢測記憶體洩漏導致的無響應
- 檢測進程崩潰但容器未退出的情況

#### 配置範例

**HTTP GET 探針**：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  containers:
  - name: myapp
    image: myapp:1.0
    livenessProbe:
      httpGet:
        path: /healthz          # 健康檢查端點
        port: 8080              # 檢查端口
        httpHeaders:
        - name: Custom-Header
          value: Awesome
      initialDelaySeconds: 15   # 容器啟動後等待時間
      periodSeconds: 10         # 檢查間隔
      timeoutSeconds: 1         # 請求超時時間
      successThreshold: 1       # 成功閾值（連續成功次數）
      failureThreshold: 3       # 失敗閾值（連續失敗次數）
```

**TCP Socket 探針**：

```yaml
livenessProbe:
  tcpSocket:
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 10
```

**Exec 探針**：

```yaml
livenessProbe:
  exec:
    command:
    - cat
    - /tmp/healthy
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Readiness Probe：就緒探針

#### 作用

**目的**：
- 檢測容器是否**準備好接收流量**
- 控制 Service 的端點列表

**失敗後果**：
- Pod 從 Service 的端點列表中移除
- 不接收新的流量
- **不會重啟容器**

#### 使用場景

- 應用需要載入配置或快取
- 應用需要連接資料庫
- 應用正在處理長時間的初始化任務
- 應用暫時過載，需要停止接收新請求

#### 配置範例

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  containers:
  - name: myapp
    image: myapp:1.0
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 5
      timeoutSeconds: 1
      successThreshold: 1       # 恢復到就緒狀態需要的成功次數
      failureThreshold: 3
```

#### Readiness vs Liveness 對比

**關鍵差異**：

```yaml
# Liveness：重啟容器
livenessProbe:
  httpGet:
    path: /healthz    # 檢查是否活著
  failureThreshold: 3 # 失敗 3 次後重啟

# Readiness：控制流量
readinessProbe:
  httpGet:
    path: /ready      # 檢查是否就緒
  failureThreshold: 3 # 失敗 3 次後移出 Service
```

**實際影響**：

| 探針 | 檢查失敗 | 適用情況 |
|------|---------|---------|
| Liveness | 容器重啟 | 無法恢復的故障 |
| Readiness | 暫停流量 | 可以恢復的暫時問題 |

### Startup Probe：啟動探針

#### 作用

**目的**（Kubernetes 1.16+）：
- 專門處理**慢啟動容器**
- 在啟動階段禁用 Liveness 和 Readiness 探針

**失敗後果**：
- 超過配置時間仍未成功，容器被殺死並重啟

#### 為什麼需要 Startup Probe

**問題場景**：
```yaml
# 沒有 Startup Probe 的困境
livenessProbe:
  httpGet:
    path: /healthz
  initialDelaySeconds: 60  # 必須設置很長的延遲
  failureThreshold: 3      # 可能仍不夠
```

- 啟動慢的應用（如 Java 應用）需要很長的 `initialDelaySeconds`
- 但這會延遲故障檢測

**Startup Probe 的解決方案**：
- 啟動階段使用寬鬆的檢查
- 啟動完成後切換到正常的 Liveness 檢查

#### 配置範例

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: slow-app
spec:
  containers:
  - name: slow-app
    image: slow-app:1.0
    
    # Startup Probe：保護慢啟動
    startupProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 0
      periodSeconds: 10         # 每 10 秒檢查一次
      failureThreshold: 30      # 最多失敗 30 次 = 5 分鐘
    
    # Liveness Probe：啟動後才啟用
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 0    # 可以設為 0
      periodSeconds: 10
      failureThreshold: 3       # 啟動後使用嚴格檢查
    
    # Readiness Probe
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
      periodSeconds: 5
```

**工作流程**：
1. 容器啟動 → Startup Probe 開始檢查
2. Startup Probe 成功 → 切換到 Liveness/Readiness Probe
3. Liveness/Readiness Probe 持續檢查

### 探針的檢查方式

#### 1. HTTP GET

**最常用**，適合 Web 應用：

```yaml
httpGet:
  path: /healthz
  port: 8080
  scheme: HTTP    # HTTP 或 HTTPS
  httpHeaders:
  - name: X-Custom-Header
    value: Awesome
```

**實現範例**（Go）：

```go
http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
    // 檢查資料庫連接
    if err := db.Ping(); err != nil {
        w.WriteHeader(http.StatusServiceUnavailable)
        return
    }
    w.WriteHeader(http.StatusOK)
    w.Write([]byte("OK"))
})

http.HandleFunc("/ready", func(w http.ResponseWriter, r *http.Request) {
    // 檢查是否準備就緒
    if !app.IsReady() {
        w.WriteHeader(http.StatusServiceUnavailable)
        return
    }
    w.WriteHeader(http.StatusOK)
})
```

**返回碼判斷**：
- `200-399`：成功
- 其他狀態碼：失敗

#### 2. TCP Socket

**適合非 HTTP 服務**（資料庫、快取等）：

```yaml
tcpSocket:
  port: 3306
```

**工作原理**：
- 嘗試建立 TCP 連接
- 連接成功 = 探針成功

#### 3. Exec

**執行命令檢查**：

```yaml
exec:
  command:
  - /bin/sh
  - -c
  - "pg_isready -U postgres"
```

**返回碼判斷**：
- `0`：成功
- 非 `0`：失敗

### 探針參數詳解

| 參數 | 說明 | 預設值 | 建議 |
|------|------|--------|------|
| `initialDelaySeconds` | 容器啟動後延遲檢查時間 | 0 | 根據應用啟動時間設置 |
| `periodSeconds` | 檢查間隔 | 10 | Liveness: 10-30s, Readiness: 5-10s |
| `timeoutSeconds` | 請求超時 | 1 | 根據網路延遲設置 |
| `successThreshold` | 成功閾值 | 1 | Liveness/Startup 必須為 1 |
| `failureThreshold` | 失敗閾值 | 3 | 3-5 次較合理 |

**計算公式**：

```
最大故障檢測時間 = initialDelaySeconds + (periodSeconds × failureThreshold)

範例：
  initialDelaySeconds: 15
  periodSeconds: 10
  failureThreshold: 3
  = 15 + (10 × 3) = 45 秒
```

### 最佳實踐

#### 1. 健康檢查端點設計

**不要**：
```go
// ❌ 檢查過於簡單
http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)  // 總是返回 OK
})
```

**應該**：
```go
// ✅ 檢查關鍵依賴
http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
    // 檢查資料庫
    if err := db.Ping(); err != nil {
        w.WriteHeader(503)
        return
    }
    
    // 檢查快取
    if err := redis.Ping(); err != nil {
        w.WriteHeader(503)
        return
    }
    
    w.WriteHeader(200)
})
```

#### 2. Liveness 探針注意事項

**避免檢查外部依賴**：
```yaml
# ❌ 不要在 Liveness 中檢查資料庫
livenessProbe:
  httpGet:
    path: /healthz  # 此端點檢查了資料庫

# 後果：資料庫故障 → 所有 Pod 重啟 → 雪崩
```

**正確做法**：
```yaml
# ✅ Liveness 只檢查應用本身
livenessProbe:
  httpGet:
    path: /alive    # 只檢查進程是否響應

# ✅ Readiness 檢查依賴
readinessProbe:
  httpGet:
    path: /ready    # 檢查資料庫等依賴
```

#### 3. 三種探針的組合使用

**完整配置範例**：

```yaml
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
        ports:
        - containerPort: 8080
        
        # Startup：保護慢啟動（30秒 × 10 = 5分鐘）
        startupProbe:
          httpGet:
            path: /healthz
            port: 8080
          periodSeconds: 10
          failureThreshold: 30
        
        # Liveness：檢查是否存活（快速故障檢測）
        livenessProbe:
          httpGet:
            path: /alive
            port: 8080
          periodSeconds: 10
          failureThreshold: 3
          timeoutSeconds: 1
        
        # Readiness：檢查是否就緒（控制流量）
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          periodSeconds: 5
          failureThreshold: 3
          successThreshold: 1
```

#### 4. 常見錯誤

**錯誤 1：initialDelaySeconds 設置過短**
```yaml
# ❌ 應用還未啟動就開始檢查
livenessProbe:
  initialDelaySeconds: 5  # 太短
  failureThreshold: 3
# 結果：容器反覆重啟
```

**錯誤 2：failureThreshold 設置過小**
```yaml
# ❌ 網路抖動就會觸發重啟
livenessProbe:
  failureThreshold: 1  # 太敏感
```

**錯誤 3：沒有區分 Liveness 和 Readiness**
```yaml
# ❌ 都使用同一個端點
livenessProbe:
  httpGet:
    path: /health
readinessProbe:
  httpGet:
    path: /health  # 應該分開
```

### 監控與除錯

#### 查看探針狀態

```bash
# 查看 Pod 事件
kubectl describe pod myapp-xxx

# 查看探針失敗日誌
kubectl logs myapp-xxx

# 查看 Pod 狀態
kubectl get pod myapp-xxx -o yaml
```

#### 探針失敗的事件範例

```
Events:
  Type     Reason     Age               From               Message
  ----     ------     ----              ----               -------
  Warning  Unhealthy  2m (x3 over 2m)   kubelet            Liveness probe failed: Get http://10.244.1.5:8080/healthz: dial tcp 10.244.1.5:8080: connect: connection refused
  Normal   Killing    2m                kubelet            Container myapp failed liveness probe, will be restarted
```

## 總結

**三種探針的選擇**：
- **Startup Probe**：慢啟動應用必備
- **Liveness Probe**：檢測死鎖、無響應
- **Readiness Probe**：控制流量、優雅處理過載

**關鍵原則**：
- Liveness 檢查輕量、快速
- Readiness 可以檢查依賴
- Startup 保護啟動階段
- 合理設置參數，避免誤殺

正確配置探針是保證 Kubernetes 應用穩定性的重要手段。
