# Ingress 與 Ingress Controller

- **難度**: 6
- **標籤**: `Kubernetes`, `Ingress`, `Load Balancer`

## 問題詳述

請解釋 Kubernetes 中 Ingress 和 Ingress Controller 的作用、工作原理，以及與 Service 的區別。如何配置 Ingress 實現 HTTP 路由和 TLS 終止？

## 核心理論與詳解

### 為什麼需要 Ingress

#### Service 的限制

**NodePort 的問題**：
```yaml
# 每個服務需要一個端口
service-a: NodePort 30001
service-b: NodePort 30002
service-c: NodePort 30003
```
- 端口管理混亂
- 需要暴露大量端口
- 無法做基於路徑的路由

**LoadBalancer 的問題**：
```yaml
# 每個服務需要一個 LoadBalancer
service-a: LoadBalancer (費用 $20/月)
service-b: LoadBalancer (費用 $20/月)
service-c: LoadBalancer (費用 $20/月)
```
- 成本高昂
- 資源浪費
- 管理複雜

#### Ingress 的解決方案

**單一入口點**：
```
                    ┌─────────────┐
Internet ──────────→│   Ingress   │
                    │ (1 個 LB)   │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐        ┌────▼────┐       ┌────▼────┐
   │Service A│        │Service B│       │Service C│
   └─────────┘        └─────────┘       └─────────┘
```

**優勢**：
- 一個入口管理多個服務
- 基於 HTTP/HTTPS 路由
- 支援 TLS 終止
- 支援負載均衡、URL 重寫等

### Ingress 核心概念

#### Ingress 是什麼

**定義**：
- Kubernetes API 物件
- 定義外部 HTTP(S) 流量的路由規則
- 需要配合 Ingress Controller 使用

**關鍵點**：
- Ingress **只是規則定義**
- Ingress Controller 才是**實際執行者**

#### Ingress 的組成部分

```
┌──────────────────────────────────────────┐
│              Ingress                     │
│  (規則定義 - API 物件)                    │
│  - Host: example.com                     │
│  - Path: /api -> service-a               │
│  - Path: /web -> service-b               │
└──────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────┐
│         Ingress Controller               │
│  (實際執行者 - 運行在 Pod 中)             │
│  - Nginx / Traefik / HAProxy            │
│  - 監聽 Ingress 資源                     │
│  - 配置反向代理                          │
└──────────────────────────────────────────┘
```

### Ingress Controller

#### 什麼是 Ingress Controller

**定義**：
- 實現 Ingress 規則的控制器
- 通常是反向代理（如 Nginx、Traefik）
- 作為 Pod 運行在集群中

**工作原理**：
1. 監聽 Kubernetes API（Ingress 資源變更）
2. 動態生成反向代理配置
3. 處理外部流量並路由到後端 Service

#### 常見的 Ingress Controller

| Controller | 特點 | 適用場景 |
|-----------|------|---------|
| **Nginx Ingress** | 最流行、功能豐富 | 通用場景 |
| **Traefik** | 自動服務發現、Dashboard | 微服務架構 |
| **HAProxy** | 高性能、企業級 | 大流量場景 |
| **Istio Gateway** | 服務網格整合 | Istio 環境 |
| **Kong** | API Gateway 功能 | API 管理 |
| **AWS ALB** | AWS 原生整合 | AWS EKS |
| **GCE** | GCP 原生整合 | GCP GKE |

### Ingress 基本用法

#### 簡單的 Ingress 範例

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: simple-ingress
spec:
  # 預設後端（可選）
  defaultBackend:
    service:
      name: default-service
      port:
        number: 80
  
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
```

#### pathType 的類型

| 類型 | 說明 | 範例 |
|------|------|------|
| **Prefix** | 前綴匹配 | `/api` 匹配 `/api/users` |
| **Exact** | 精確匹配 | `/api` 只匹配 `/api` |
| **ImplementationSpecific** | 由 Ingress Controller 決定 | 取決於實現 |

**Prefix vs Exact 範例**：
```yaml
rules:
- http:
    paths:
    # Prefix：匹配 /api、/api/、/api/users
    - path: /api
      pathType: Prefix
      backend:
        service:
          name: api-service
          port:
            number: 8080
    
    # Exact：只匹配 /login
    - path: /login
      pathType: Exact
      backend:
        service:
          name: auth-service
          port:
            number: 3000
```

### 高級 Ingress 配置

#### 1. 基於主機名的路由

**不同域名路由到不同服務**：
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: virtual-host-ingress
spec:
  rules:
  # api.example.com → API 服務
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 8080
  
  # www.example.com → Web 服務
  - host: www.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
  
  # blog.example.com → Blog 服務
  - host: blog.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: blog-service
            port:
              number: 80
```

#### 2. 基於路徑的路由

**同一域名不同路徑**：
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: path-based-ingress
spec:
  rules:
  - host: example.com
    http:
      paths:
      # /api/* → API 服務
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 8080
      
      # /web/* → Web 服務
      - path: /web
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
      
      # /admin/* → Admin 服務
      - path: /admin
        pathType: Prefix
        backend:
          service:
            name: admin-service
            port:
              number: 3000
```

#### 3. TLS 終止

**HTTPS 配置**：

**步驟 1：創建 TLS Secret**
```bash
kubectl create secret tls tls-secret \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

**步驟 2：配置 Ingress**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-ingress
spec:
  tls:
  - hosts:
    - example.com
    - www.example.com
    secretName: tls-secret    # TLS 憑證
  
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
```

**多個 TLS 憑證**：
```yaml
spec:
  tls:
  # example.com 的憑證
  - hosts:
    - example.com
    secretName: example-tls
  
  # api.example.com 的憑證
  - hosts:
    - api.example.com
    secretName: api-tls
```

#### 4. 使用 Annotations 進行進階配置

**Nginx Ingress Controller 範例**：
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: advanced-ingress
  annotations:
    # URL 重寫
    nginx.ingress.kubernetes.io/rewrite-target: /$2
    
    # CORS
    nginx.ingress.kubernetes.io/enable-cors: "true"
    nginx.ingress.kubernetes.io/cors-allow-origin: "*"
    
    # 速率限制
    nginx.ingress.kubernetes.io/limit-rps: "100"
    
    # 超時設置
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "30"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "600"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "600"
    
    # 自訂 Headers
    nginx.ingress.kubernetes.io/configuration-snippet: |
      more_set_headers "X-Custom-Header: MyValue";
    
    # HTTP 轉 HTTPS
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    
    # 白名單
    nginx.ingress.kubernetes.io/whitelist-source-range: "10.0.0.0/8,192.168.0.0/16"

spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /api(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 8080
```

**URL 重寫範例**：
```yaml
# 請求: example.com/api/users
# 重寫: api-service/users

annotations:
  nginx.ingress.kubernetes.io/rewrite-target: /$2

paths:
- path: /api(/|$)(.*)
  pathType: Prefix
  backend:
    service:
      name: api-service
```

#### 5. 負載均衡與會話親和性

**會話親和性（Sticky Session）**：
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sticky-ingress
  annotations:
    nginx.ingress.kubernetes.io/affinity: "cookie"
    nginx.ingress.kubernetes.io/session-cookie-name: "route"
    nginx.ingress.kubernetes.io/session-cookie-expires: "172800"
    nginx.ingress.kubernetes.io/session-cookie-max-age: "172800"
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
```

#### 6. 基本認證

**創建密碼檔案**：
```bash
htpasswd -c auth myuser
kubectl create secret generic basic-auth --from-file=auth
```

**配置 Ingress**：
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: auth-ingress
  annotations:
    nginx.ingress.kubernetes.io/auth-type: basic
    nginx.ingress.kubernetes.io/auth-secret: basic-auth
    nginx.ingress.kubernetes.io/auth-realm: "Authentication Required"
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /admin
        pathType: Prefix
        backend:
          service:
            name: admin-service
            port:
              number: 3000
```

### 部署 Nginx Ingress Controller

#### 使用 Helm 部署

```bash
# 添加 Helm Repository
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# 部署
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer
```

#### 使用 YAML 部署

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```

#### 驗證部署

```bash
# 查看 Pod
kubectl get pods -n ingress-nginx

# 查看 Service
kubectl get svc -n ingress-nginx

# 獲取外部 IP
kubectl get svc ingress-nginx-controller -n ingress-nginx
```

### 完整範例

#### 完整的生產級配置

```yaml
# TLS Secret
apiVersion: v1
kind: Secret
metadata:
  name: example-tls
  namespace: production
type: kubernetes.io/tls
data:
  tls.crt: <base64-encoded-cert>
  tls.key: <base64-encoded-key>
---
# Backend Service
apiVersion: v1
kind: Service
metadata:
  name: web-service
  namespace: production
spec:
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 8080
---
# Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: production-ingress
  namespace: production
  annotations:
    # 基本配置
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    
    # 安全配置
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    
    # 性能優化
    nginx.ingress.kubernetes.io/proxy-body-size: "100m"
    nginx.ingress.kubernetes.io/proxy-buffer-size: "8k"
    
    # 速率限制
    nginx.ingress.kubernetes.io/limit-rps: "100"
    nginx.ingress.kubernetes.io/limit-connections: "10"
    
    # CORS
    nginx.ingress.kubernetes.io/enable-cors: "true"
    nginx.ingress.kubernetes.io/cors-allow-methods: "GET, POST, PUT, DELETE"
    nginx.ingress.kubernetes.io/cors-allow-credentials: "true"
    
    # 自訂 Headers
    nginx.ingress.kubernetes.io/configuration-snippet: |
      more_set_headers "X-Frame-Options: DENY";
      more_set_headers "X-Content-Type-Options: nosniff";
      more_set_headers "X-XSS-Protection: 1; mode=block";

spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - www.example.com
    - api.example.com
    secretName: example-tls
  
  rules:
  # Web 服務
  - host: www.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
  
  # API 服務
  - host: api.example.com
    http:
      paths:
      - path: /v1
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 8080
      - path: /v2
        pathType: Prefix
        backend:
          service:
            name: api-v2-service
            port:
              number: 8080
```

### 除錯與監控

#### 常用除錯命令

```bash
# 查看 Ingress 資源
kubectl get ingress
kubectl describe ingress <ingress-name>

# 查看 Ingress Controller 日誌
kubectl logs -n ingress-nginx <controller-pod-name>

# 查看 Ingress Controller 配置
kubectl exec -n ingress-nginx <controller-pod-name> -- cat /etc/nginx/nginx.conf

# 測試 Ingress 規則
curl -H "Host: example.com" http://<ingress-ip>/
```

#### 常見問題排查

**問題 1：404 Not Found**
```bash
# 檢查 Service 是否存在
kubectl get svc web-service

# 檢查 Endpoints
kubectl get endpoints web-service

# 檢查 Ingress 規則
kubectl describe ingress
```

**問題 2：502 Bad Gateway**
```bash
# 檢查後端 Pod 是否運行
kubectl get pods -l app=web

# 檢查 Pod 健康狀態
kubectl describe pod <pod-name>

# 檢查 Service 端口配置
kubectl get svc web-service -o yaml
```

## 總結

**Ingress 的核心價值**：
- 統一入口管理
- 基於 HTTP(S) 的智能路由
- TLS 終止
- 成本優化

**關鍵要點**：
- Ingress 是規則，Ingress Controller 是執行者
- 支援多種路由策略（主機名、路徑）
- 豐富的 Annotations 提供進階功能
- 需要正確配置 TLS 和安全策略

**生產環境建議**：
- 使用 cert-manager 自動管理憑證
- 配置速率限制和安全 Headers
- 啟用監控和日誌
- 定期更新 Ingress Controller

Ingress 是 Kubernetes 中暴露 HTTP 服務的標準方式，掌握其配置對於構建生產級應用至關重要。
