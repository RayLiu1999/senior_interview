# Pod 是什麼？為什麼需要 Pod？

- **難度**: 5
- **標籤**: `Kubernetes`, `Pod`, `Container`

## 問題詳述

在 Kubernetes 中，Pod 是什麼？為什麼不直接管理容器，而是引入 Pod 這個抽象層？一個 Pod 中可以有多個容器嗎？

## 核心理論與詳解

### 什麼是 Pod

**Pod** 是 Kubernetes 中**最小的可部署單元**，也是最基本的調度單位。

**核心定義**：
- Pod 是一個或多個容器的集合
- Pod 內的容器共享網路命名空間和存儲卷
- Pod 是短暫的、可替代的資源

### 為什麼需要 Pod？

#### 1. **容器不是最小調度單位的原因**

**問題場景**：
假設你有一個 Web 應用和一個日誌收集 Sidecar 容器，它們需要：
- 共享同一個網路接口（localhost 通訊）
- 共享同一個存儲卷
- 同時啟動和停止
- 部署在同一台機器上

**直接管理容器的困境**：
- 無法保證容器在同一節點
- 容器間的網路和存儲共享複雜
- 無法原子性地管理一組容器

**Pod 的解決方案**：
- Pod 作為整體被調度到同一節點
- Pod 內容器自動共享網路和存儲
- Pod 的生命週期統一管理

#### 2. **Pod 實現的關鍵技術**

**網路共享**：
- Pod 內所有容器共享同一個 IP 地址
- 容器之間可以通過 `localhost` 互相訪問
- 實現方式：使用 Pause 容器創建網路命名空間

**存儲共享**：
- Pod 可以定義 Volume
- Pod 內所有容器都可以掛載這些 Volume
- 實現容器間的資料共享

**IPC 共享**（可選）：
- 可以配置容器共享進程間通訊命名空間
- 容器可以通過 System V IPC 或 POSIX 消息佇列通訊

### Pod 的組成結構

**典型的 Pod 結構**：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: app-container
    image: nginx:1.21
    ports:
    - containerPort: 80
  - name: sidecar-container
    image: busybox:1.35
    command: ['sh', '-c', 'while true; do echo hello; sleep 10; done']
  volumes:
  - name: shared-data
    emptyDir: {}
```

**組成元素**：
1. **主容器（Main Container）**：核心業務邏輯
2. **Sidecar 容器**：輔助功能（日誌、代理、監控）
3. **Init 容器**：初始化任務（在主容器啟動前執行）
4. **Volume**：共享存儲

### 單容器 vs. 多容器 Pod

#### 單容器 Pod（最常見）

**特點**：
- 一個 Pod 只包含一個應用容器
- 簡單、清晰、易於管理
- 大多數應用場景

**範例**：
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
spec:
  containers:
  - name: nginx
    image: nginx:1.21
    ports:
    - containerPort: 80
```

#### 多容器 Pod

**適用場景**：

1. **Sidecar 模式**
   - 主容器：運行主要應用
   - Sidecar：輔助功能（日誌收集、代理）
   - 範例：應用容器 + Envoy 代理

2. **Adapter 模式**
   - 主容器：產生資料
   - Adapter：轉換資料格式
   - 範例：應用容器 + 日誌格式轉換器

3. **Ambassador 模式**
   - 主容器：應用邏輯
   - Ambassador：網路代理
   - 範例：應用容器 + Redis 代理

**多容器 Pod 範例**：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-with-logging
spec:
  containers:
  # 主容器：Web 應用
  - name: web-app
    image: nginx:1.21
    volumeMounts:
    - name: log-volume
      mountPath: /var/log/nginx
  
  # Sidecar：日誌收集器
  - name: log-collector
    image: fluent/fluentd:v1.14
    volumeMounts:
    - name: log-volume
      mountPath: /var/log/nginx
  
  volumes:
  - name: log-volume
    emptyDir: {}
```

### Init 容器

**作用**：
- 在主容器啟動前執行初始化任務
- 順序執行，每個成功後才啟動下一個
- 失敗會導致 Pod 重啟

**使用場景**：
- 等待依賴服務就緒
- 從遠端獲取配置
- 設置權限或環境

**範例**：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
spec:
  initContainers:
  - name: init-myservice
    image: busybox:1.35
    command: ['sh', '-c', 'until nslookup myservice; do echo waiting; sleep 2; done']
  
  containers:
  - name: myapp-container
    image: myapp:1.0
```

### Pod 的生命週期

**Pod 狀態**：
- **Pending**：已創建但容器未運行
- **Running**：所有容器已創建，至少一個正在運行
- **Succeeded**：所有容器成功終止
- **Failed**：至少一個容器失敗終止
- **Unknown**：無法獲取狀態

**容器狀態**：
- **Waiting**：等待啟動
- **Running**：正在運行
- **Terminated**：已終止

### Pod 的網路模型

**核心原則**：
1. 每個 Pod 有唯一的 IP 地址
2. Pod 內容器共享網路命名空間
3. Pod 之間可以直接通過 IP 通訊（無 NAT）
4. 容器端口映射到 Pod IP

**實現機制**：
- **Pause 容器**：創建網路命名空間的基礎容器
- 其他容器加入 Pause 容器的網路命名空間
- Pause 容器生命週期等於 Pod 生命週期

### 何時使用多容器 Pod？

**應該使用多容器 Pod**：
- 容器需要緊密耦合
- 容器需要共享資源
- 容器必須在同一節點
- 容器生命週期相同

**不應該使用多容器 Pod**：
- 容器可以獨立擴展
- 容器可以獨立更新
- 容器沒有資源共享需求
- 容器是不同的應用

**最佳實踐**：
- 優先使用單容器 Pod
- 只在確實需要緊密耦合時使用多容器
- Sidecar 模式是最常見的多容器用例

## 總結

Pod 是 Kubernetes 的基本調度單元，它解決了容器編排中的資源共享和原子性調度問題。雖然 Pod 可以包含多個容器，但大多數情況下使用單容器 Pod 即可。理解 Pod 的設計理念和使用場景，是掌握 Kubernetes 的第一步。
