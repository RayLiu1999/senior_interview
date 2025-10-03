# Docker 資源限制與管理

- **難度**: 6
- **標籤**: `Docker`, `Resource Management`, `Cgroups`

## 問題詳述

請深入解釋 Docker 的資源限制機制，包括 CPU、記憶體、磁碟 I/O 和網路的限制策略，以及如何監控和優化資源使用。

## 核心理論與詳解

### 為什麼需要資源限制

**問題場景**：
```
┌───────────────────────────────────────┐
│           Docker Host                 │
│    CPU: 8 cores, Memory: 16GB        │
│                                       │
│  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │ App1 │  │ App2 │  │ App3 │       │
│  │ 正常 │  │ 正常 │  │ 正常 │       │
│  └──────┘  └──────┘  └──────┘       │
│                                       │
│            ┌──────────────┐          │
│            │   App4       │          │
│            │  記憶體洩漏  │          │
│            │  吃光 16GB   │          │
│            └──────────────┘          │
│                  ▼                    │
│         系統 OOM Killer               │
│     ❌ App1, App2, App3 被殺死        │
└───────────────────────────────────────┘
```

**解決方案**：
使用資源限制隔離容器，防止單一容器影響整個主機。

### Linux Cgroups 基礎

#### 什麼是 Cgroups

**定義**：
Cgroups (Control Groups) 是 Linux 核心功能，用於限制、記錄和隔離程序群組的資源使用。

**主要子系統**：

| Cgroup 子系統 | 限制資源 | Docker 參數 |
|---------------|----------|-------------|
| **cpu** | CPU 時間 | `--cpus`, `--cpu-shares` |
| **cpuset** | CPU 核心 | `--cpuset-cpus` |
| **memory** | 記憶體 | `--memory`, `--memory-swap` |
| **blkio** | 磁碟 I/O | `--device-read-bps`, `--device-write-bps` |
| **net_cls** | 網路頻寬 | 需外部工具配合 |
| **pids** | 程序數量 | `--pids-limit` |
| **devices** | 裝置存取 | `--device` |

**Cgroups 版本**：
- **Cgroups v1**（舊版，層級結構）
- **Cgroups v2**（新版，統一層級）

```bash
# 查看系統使用的版本
stat -fc %T /sys/fs/cgroup/

# cgroup2fs -> Cgroups v2
# tmpfs -> Cgroups v1
```

### CPU 限制

#### CPU Shares（相對權重）

**概念**：
CPU shares 決定容器在 CPU 競爭時的**相對優先級**。

**預設值**：1024

**範例**：
```bash
# 容器 A: 1024 shares（預設）
docker run -d --cpu-shares=1024 --name app-a stress --cpu 4

# 容器 B: 512 shares（一半權重）
docker run -d --cpu-shares=512 --name app-b stress --cpu 4

# 容器 C: 2048 shares（兩倍權重）
docker run -d --cpu-shares=2048 --name app-c stress --cpu 4
```

**CPU 分配**（4 核心主機，3 個容器同時滿載）：
```
總 shares: 1024 + 512 + 2048 = 3584

App A: (1024 / 3584) × 400% = 114% CPU
App B: (512 / 3584) × 400% = 57% CPU
App C: (2048 / 3584) × 400% = 229% CPU
```

**關鍵特性**：
- 僅在 CPU 競爭時生效
- 不限制絕對 CPU 使用量
- 如果只有一個容器運行，可以使用全部 CPU

**驗證**：
```bash
# 監控 CPU 使用
docker stats app-a app-b app-c

# 輸出：
# NAME   CPU %
# app-a  114%
# app-b  57%
# app-c  229%
```

#### CPU 配額（絕對限制）

**概念**：
限制容器可以使用的 CPU 核心數量。

**使用 --cpus**（推薦）：
```bash
# 限制為 1.5 個核心
docker run -d --cpus=1.5 stress --cpu 8

# 即使主機有 8 核心，容器最多使用 1.5 核心
```

**使用 --cpu-period 和 --cpu-quota**（底層實現）：
```bash
# CPU period: 100ms（預設）
# CPU quota: 50ms
# 結果: 50ms/100ms = 0.5 核心
docker run -d \
  --cpu-period=100000 \
  --cpu-quota=50000 \
  stress --cpu 8
```

**--cpus 與 --cpu-quota 的關係**：
```bash
--cpus=1.5
# 等同於
--cpu-period=100000 --cpu-quota=150000
```

**驗證**：
```bash
# 查看 Cgroup 設定
docker inspect container | grep -i cpu

# 查看實際限制
cat /sys/fs/cgroup/cpu/docker/<container-id>/cpu.cfs_quota_us
cat /sys/fs/cgroup/cpu/docker/<container-id>/cpu.cfs_period_us
```

#### CPU 核心綁定

**概念**：
將容器綁定到特定的 CPU 核心，減少上下文切換。

**使用 --cpuset-cpus**：
```bash
# 使用 CPU 0 和 1
docker run -d --cpuset-cpus=0,1 stress --cpu 8

# 使用 CPU 0-3
docker run -d --cpuset-cpus=0-3 stress --cpu 8

# 使用偶數核心
docker run -d --cpuset-cpus=0,2,4,6 stress --cpu 8
```

**應用場景**：
```bash
# NUMA 系統：將容器綁定到同一 NUMA 節點
docker run -d \
  --cpuset-cpus=0-3 \
  --cpuset-mems=0 \
  high-performance-app

# 隔離關鍵應用
docker run -d --cpuset-cpus=0,1 critical-app
docker run -d --cpuset-cpus=2-7 other-apps
```

**驗證**：
```bash
# 查看容器使用的 CPU 核心
docker exec container taskset -cp 1

# 輸出：pid 1's current affinity list: 0,1
```

#### CPU 限制總結

| 參數 | 作用 | 適用場景 |
|------|------|----------|
| `--cpu-shares` | 相對權重 | CPU 競爭時的優先級 |
| `--cpus` | 絕對限制 | 限制最大 CPU 使用量 |
| `--cpuset-cpus` | 核心綁定 | NUMA 優化、隔離 |

**組合範例**：
```bash
docker run -d \
  --cpus=2 \           # 最多 2 核心
  --cpu-shares=1024 \  # 預設優先級
  --cpuset-cpus=0-3 \  # 僅使用 CPU 0-3
  myapp
```

### 記憶體限制

#### 記憶體硬限制

**基本限制**：
```bash
# 限制為 512MB
docker run -d --memory=512m nginx

# 限制為 2GB
docker run -d --memory=2g myapp
```

**超過限制的行為**：
```
容器記憶體使用達到限制
      ▼
 OOM Killer 觸發
      ▼
 殺死容器內的程序
      ▼
容器退出（Exit Code 137）
```

**驗證**：
```bash
# 測試 OOM
docker run -it --memory=100m stress --vm 1 --vm-bytes 200m

# 輸出：
# stress: FAIL: [1] (415) <-- worker 1 got signal 9
# Container exits with code 137
```

**查看 OOM 事件**：
```bash
# 查看容器退出原因
docker inspect container | grep OOMKilled
# "OOMKilled": true

# 查看系統日誌
dmesg | grep -i "memory cgroup"
```

#### Memory + Swap 限制

**概念**：
`--memory-swap` 限制記憶體 + Swap 的總和。

**範例**：
```bash
# 記憶體: 512MB, Swap: 512MB
docker run -d \
  --memory=512m \
  --memory-swap=1g \
  myapp

# 總可用: 1GB（512MB 記憶體 + 512MB Swap）
```

**特殊值**：
```bash
# --memory-swap=-1: 無限 Swap（不推薦）
docker run -d --memory=512m --memory-swap=-1 myapp

# --memory-swap=0 或不設定: Swap = Memory（總共 2x Memory）
docker run -d --memory=512m myapp
# Swap = 512MB，總共 1GB
```

**禁用 Swap**：
```bash
# 僅使用記憶體，不使用 Swap
docker run -d \
  --memory=512m \
  --memory-swap=512m \
  myapp
```

#### Memory Reservation（軟限制）

**概念**：
記憶體不足時的最低保證，但不是硬限制。

**範例**：
```bash
docker run -d \
  --memory=1g \                # 硬限制: 1GB
  --memory-reservation=512m \  # 軟限制: 512MB
  myapp
```

**行為**：
```
正常情況：容器可使用最多 1GB
   ▼
主機記憶體不足
   ▼
Kernel 回收記憶體，但保證容器至少有 512MB
```

**應用場景**：
```bash
# 彈性應用：平時 512MB，高峰時可達 1GB
docker run -d \
  --memory=1g \
  --memory-reservation=512m \
  web-app
```

#### OOM Killer 控制

**禁用 OOM Killer**（不推薦）：
```bash
docker run -d \
  --memory=512m \
  --oom-kill-disable \
  myapp

# 風險：容器可能掛起，影響主機
```

**調整 OOM Score**：
```bash
# 降低被殺死的優先級（-1000 到 1000）
docker run -d \
  --memory=512m \
  --oom-score-adj=-500 \
  critical-app

# 正值：優先殺死
# 負值：降低優先級
```

#### 記憶體限制總結

| 參數 | 作用 | 推薦值 |
|------|------|--------|
| `--memory` | 硬限制 | 必須設定 |
| `--memory-swap` | 記憶體+Swap | `2 × memory` |
| `--memory-reservation` | 軟限制 | `0.5 × memory` |
| `--oom-kill-disable` | 禁用 OOM | 不推薦 |

**範例**：
```bash
docker run -d \
  --memory=1g \
  --memory-swap=2g \
  --memory-reservation=512m \
  myapp
```

### 磁碟 I/O 限制

#### 限制讀寫速率

**限制讀取速率**：
```bash
# 限制 /dev/sda 讀取為 50 MB/s
docker run -d \
  --device-read-bps=/dev/sda:50mb \
  myapp
```

**限制寫入速率**：
```bash
# 限制 /dev/sda 寫入為 10 MB/s
docker run -d \
  --device-write-bps=/dev/sda:10mb \
  myapp
```

**測試**：
```bash
# 啟動容器
docker run -it --device-write-bps=/dev/sda:10mb alpine sh

# 測試寫入速度
dd if=/dev/zero of=/tmp/test bs=1M count=100 oflag=direct

# 輸出：10 MB/s（受限）
```

#### 限制 IOPS

**限制讀取 IOPS**：
```bash
# 限制讀取 IOPS 為 1000
docker run -d \
  --device-read-iops=/dev/sda:1000 \
  myapp
```

**限制寫入 IOPS**：
```bash
# 限制寫入 IOPS 為 500
docker run -d \
  --device-write-iops=/dev/sda:500 \
  myapp
```

**應用場景**：
```bash
# 資料庫容器：限制 I/O 影響
docker run -d \
  --device-read-iops=/dev/sda:5000 \
  --device-write-iops=/dev/sda:2000 \
  postgres

# 日誌收集：避免高 I/O 影響主應用
docker run -d \
  --device-write-iops=/dev/sda:100 \
  log-collector
```

#### Block I/O Weight（相對優先級）

**設置權重**：
```bash
# 預設權重: 500
docker run -d --blkio-weight=500 myapp

# 高優先級: 1000
docker run -d --blkio-weight=1000 critical-app

# 低優先級: 100
docker run -d --blkio-weight=100 background-job
```

**行為**：
類似 CPU shares，僅在 I/O 競爭時生效。

### 網路頻寬限制

**注意**：
Docker 本身不直接支援網路頻寬限制，需要配合 Linux `tc`（Traffic Control）工具。

#### 使用 tc 限制頻寬

```bash
# 進入容器的網路命名空間
PID=$(docker inspect --format '{{.State.Pid}}' container)
nsenter -t $PID -n

# 限制出口頻寬為 10Mbit
tc qdisc add dev eth0 root tbf rate 10mbit burst 32kbit latency 400ms

# 限制入口頻寬（需要 IFB）
modprobe ifb
ip link add ifb0 type ifb
tc qdisc add dev eth0 ingress
tc filter add dev eth0 parent ffff: protocol ip u32 match u32 0 0 flowid 1:1 action mirred egress redirect dev ifb0
tc qdisc add dev ifb0 root tbf rate 10mbit burst 32kbit latency 400ms
```

#### 使用第三方工具

**wondershaper**：
```bash
# 安裝
apt-get install wondershaper

# 限制頻寬（下載 10Mbit, 上傳 5Mbit）
wondershaper eth0 10000 5000

# 清除限制
wondershaper clear eth0
```

**Docker Network Plugin**：
使用支援 QoS 的網路插件，如 Calico、Cilium。

### PID 限制

**概念**：
限制容器內可以創建的程序數量，防止 Fork 炸彈。

**設置限制**：
```bash
# 限制最多 100 個程序
docker run -d --pids-limit=100 myapp
```

**測試 Fork 炸彈**：
```bash
# 不限制（危險）
docker run --rm alpine sh -c 'for i in $(seq 1 1000); do sleep 1 & done'
# 創建 1000 個程序

# 限制為 10
docker run --rm --pids-limit=10 alpine sh -c 'for i in $(seq 1 100); do sleep 1 & done'
# 創建到第 10 個後失敗
# sh: can't fork: Resource temporarily unavailable
```

**檢視 PID 使用**：
```bash
# 查看容器程序數
docker top container | wc -l

# 查看 Cgroup 限制
cat /sys/fs/cgroup/pids/docker/<container-id>/pids.max
```

### Device 存取控制

#### 限制裝置存取

**允許存取特定裝置**：
```bash
# 允許存取 /dev/sda1
docker run -it --device=/dev/sda1 alpine

# 唯讀存取
docker run -it --device=/dev/sda1:r alpine

# 讀寫存取
docker run -it --device=/dev/sda1:rw alpine
```

**限制裝置操作**：
```bash
# 允許讀寫和 mknod
docker run -it --device=/dev/sda1:rwm alpine
# r: read, w: write, m: mknod
```

### 資源監控

#### 實時監控

**docker stats**：
```bash
# 監控所有容器
docker stats

# 監控特定容器
docker stats container1 container2

# 輸出：
# CONTAINER  CPU %  MEM USAGE / LIMIT  MEM %  NET I/O  BLOCK I/O  PIDS
# app1       25%    512MB / 1GB        50%    10MB/5MB 100MB/50MB 42
```

**持續監控**：
```bash
# 每 2 秒刷新一次
watch -n 2 docker stats --no-stream
```

#### cAdvisor

**安裝 cAdvisor**：
```bash
docker run -d \
  --name cadvisor \
  -p 8080:8080 \
  -v /:/rootfs:ro \
  -v /var/run:/var/run:ro \
  -v /sys:/sys:ro \
  -v /var/lib/docker/:/var/lib/docker:ro \
  google/cadvisor:latest
```

**訪問**：
```
http://localhost:8080
```

**特性**：
- 歷史資料
- 圖表展示
- 多容器對比
- 匯出到 Prometheus

#### Prometheus + Grafana

**Prometheus 配置**：
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'docker'
    static_configs:
      - targets: ['cadvisor:8080']
```

**Docker Compose**：
```yaml
version: '3.8'
services:
  cadvisor:
    image: google/cadvisor
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
  
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

### Docker Compose 資源限制

**基本配置**：
```yaml
version: '3.8'
services:
  app:
    image: myapp
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    pids_limit: 100
```

**完整範例**：
```yaml
version: '3.8'
services:
  web:
    image: nginx
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '1'
          memory: 512M
    pids_limit: 200
    blkio_config:
      weight: 500
      device_read_bps:
        - path: /dev/sda
          rate: '50mb'
      device_write_bps:
        - path: /dev/sda
          rate: '10mb'
```

### 資源限制最佳實踐

**1. 始終設置資源限制**
```bash
# ❌ 不設置限制（危險）
docker run -d myapp

# ✅ 設置合理限制
docker run -d \
  --memory=512m \
  --cpus=1 \
  --pids-limit=100 \
  myapp
```

**2. 基於應用特性設置**
```bash
# 計算密集型應用
docker run -d \
  --cpus=4 \
  --memory=2g \
  ml-training

# I/O 密集型應用
docker run -d \
  --cpus=1 \
  --memory=1g \
  --device-read-iops=/dev/sda:5000 \
  database

# Web 應用
docker run -d \
  --cpus=0.5 \
  --memory=256m \
  web-app
```

**3. 設置軟限制和硬限制**
```bash
docker run -d \
  --memory=1g \                # 硬限制
  --memory-reservation=512m \  # 軟限制
  --cpus=2 \                   # 硬限制
  --cpu-shares=1024 \          # 軟限制（競爭時）
  myapp
```

**4. 監控和調整**
```bash
# 監控資源使用
docker stats myapp

# 根據實際使用調整限制
docker update --memory=2g --cpus=2 myapp
```

**5. 使用壓力測試**
```bash
# CPU 壓力測試
docker run --rm --cpus=2 progrium/stress --cpu 8 --timeout 60s

# 記憶體壓力測試
docker run --rm --memory=512m progrium/stress --vm 2 --vm-bytes 256m --timeout 60s

# I/O 壓力測試
docker run --rm progrium/stress --io 4 --timeout 60s
```

### 完整資源配置範例

**生產環境配置**：
```bash
docker run -d \
  --name production-app \
  # CPU 限制
  --cpus=2 \
  --cpu-shares=1024 \
  --cpuset-cpus=0-1 \
  # 記憶體限制
  --memory=2g \
  --memory-swap=4g \
  --memory-reservation=1g \
  # I/O 限制
  --device-read-bps=/dev/sda:100mb \
  --device-write-bps=/dev/sda:50mb \
  --device-read-iops=/dev/sda:5000 \
  --device-write-iops=/dev/sda:2000 \
  # PID 限制
  --pids-limit=200 \
  # 監控
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  # 重啟策略
  --restart=unless-stopped \
  myapp:latest
```

**Docker Compose 生產配置**：
```yaml
version: '3.8'
services:
  app:
    image: myapp:latest
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
    pids_limit: 200
    blkio_config:
      weight: 500
      device_read_bps:
        - path: /dev/sda
          rate: '100mb'
      device_write_bps:
        - path: /dev/sda
          rate: '50mb'
    restart: unless-stopped
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

### 常見問題與除錯

**問題 1：容器頻繁被 OOM Killer 殺死**
```bash
# 診斷
docker inspect container | grep OOMKilled
docker logs container | tail -50

# 解決
# 1. 增加記憶體限制
docker update --memory=2g container

# 2. 優化應用（修復記憶體洩漏）

# 3. 調整 OOM Score
docker update --oom-score-adj=-500 container
```

**問題 2：CPU 限制後性能下降嚴重**
```bash
# 檢查 CPU 使用
docker stats container

# 如果長期滿載，增加限制
docker update --cpus=2 container

# 或使用 CPU shares 代替硬限制
docker update --cpu-shares=2048 container
```

**問題 3：磁碟 I/O 限制不生效**
```bash
# 檢查裝置路徑
lsblk

# 正確使用主裝置（不是分區）
docker run --device-write-bps=/dev/sda:10mb myapp  # ✅
docker run --device-write-bps=/dev/sda1:10mb myapp # ❌
```

## 總結

**核心概念**：
- **Cgroups**：Linux 核心資源限制機制
- **硬限制 vs. 軟限制**：絕對限制 vs. 最低保證
- **競爭 vs. 隔離**：shares vs. quota

**資源類型**：
- **CPU**：`--cpus`, `--cpu-shares`, `--cpuset-cpus`
- **記憶體**：`--memory`, `--memory-swap`, `--memory-reservation`
- **磁碟 I/O**：`--device-read-bps`, `--device-write-bps`, IOPS
- **網路**：需外部工具（tc、wondershaper）
- **PID**：`--pids-limit`

**監控工具**：
- docker stats（實時監控）
- cAdvisor（圖形化監控）
- Prometheus + Grafana（歷史資料和告警）

**最佳實踐**：
- 始終設置資源限制
- 基於應用特性調整
- 使用軟限制和硬限制組合
- 監控並持續優化
- 使用壓力測試驗證

**常見錯誤**：
- 不設置資源限制（單一容器影響整個主機）
- 限制過於嚴格（影響性能）
- 僅設置硬限制（無彈性）
- 不監控資源使用（無法調優）

理解資源限制機制能確保容器穩定運行，防止資源耗盡導致的服務中斷。
