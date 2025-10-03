# Docker 網路模型：Bridge、Host、Overlay

- **難度**: 6
- **標籤**: `Docker`, `Networking`, `Bridge`, `Overlay`

## 問題詳述

請解釋 Docker 的網路模型，包括 Bridge、Host、Overlay 等網路模式的工作原理、使用場景和差異。

## 核心理論與詳解

### Docker 網路概述

**Docker 網路的核心目標**：
- 容器之間可以相互通信
- 容器可以與外部網路通信
- 提供網路隔離和安全性

### Docker 網路驅動類型

| 網路模式 | 說明 | 適用場景 |
|---------|------|---------|
| **bridge** | 橋接網路（預設） | 單主機容器通信 |
| **host** | 共享主機網路 | 高性能、無需端口映射 |
| **overlay** | 跨主機網路 | Docker Swarm、多主機通信 |
| **macvlan** | 分配 MAC 地址 | 需要直接連接物理網路 |
| **none** | 無網路 | 完全隔離、自訂網路 |

### Bridge 網路（預設）

#### 工作原理

**架構示意**：
```
┌──────────────── Host Machine ────────────────┐
│                                              │
│  ┌─────────────┐        ┌─────────────┐     │
│  │ Container A │        │ Container B │     │
│  │ 172.17.0.2  │        │ 172.17.0.3  │     │
│  └──────┬──────┘        └──────┬──────┘     │
│         │                      │             │
│         └──────────┬───────────┘             │
│                    │                         │
│            ┌───────▼───────┐                 │
│            │   docker0     │                 │
│            │  (Bridge)     │                 │
│            │  172.17.0.1   │                 │
│            └───────┬───────┘                 │
│                    │                         │
│            ┌───────▼───────┐                 │
│            │     eth0      │                 │
│            │ (Host Network)│                 │
│            └───────────────┘                 │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
              Internet
```

**關鍵概念**：
- Docker 創建虛擬網橋 `docker0`
- 每個容器獲得虛擬網路介面（veth pair）
- 容器通過 NAT 訪問外部網路

#### 預設 Bridge 網路

**特性**：
- 自動創建（名稱：bridge）
- 容器只能通過 IP 互相訪問
- 不支援自動服務發現

**啟動容器**：
```bash
# 使用預設 bridge 網路
docker run -d --name web nginx

# 查看容器 IP
docker inspect web | grep IPAddress
# 輸出: "IPAddress": "172.17.0.2"

# 從另一個容器訪問
docker run -it --rm alpine ping 172.17.0.2
```

**端口映射**：
```bash
# 映射端口到主機
docker run -d -p 8080:80 --name web nginx
# 主機 8080 → 容器 80

# 查看端口映射
docker port web
# 輸出: 80/tcp -> 0.0.0.0:8080

# 訪問
curl http://localhost:8080
```

#### 自訂 Bridge 網路

**創建自訂網路**：
```bash
# 創建自訂 bridge 網路
docker network create mynet

# 指定子網和網關
docker network create \
  --driver bridge \
  --subnet 192.168.100.0/24 \
  --gateway 192.168.100.1 \
  mynet

# 查看網路
docker network ls
docker network inspect mynet
```

**使用自訂網路**：
```bash
# 在自訂網路中啟動容器
docker run -d --name web --network mynet nginx
docker run -d --name db --network mynet mysql

# 容器可以通過名稱互相訪問
docker exec web ping db    # ✅ 自動 DNS 解析
```

**自訂網路的優勢**：
- 自動 DNS 解析（容器名稱 → IP）
- 更好的隔離性
- 可以動態連接/斷開容器

**動態連接網路**：
```bash
# 將容器連接到多個網路
docker network connect mynet2 web

# 斷開網路
docker network disconnect mynet2 web
```

### Host 網路

#### 工作原理

**架構示意**：
```
┌──────────── Host Machine ────────────┐
│                                      │
│  ┌─────────────────────────────┐    │
│  │      Container              │    │
│  │   (共享 Host 網路)          │    │
│  │                             │    │
│  │   直接使用 Host 的:         │    │
│  │   - 網路介面 (eth0)         │    │
│  │   - IP 地址                 │    │
│  │   - 端口                    │    │
│  └─────────────────────────────┘    │
│              ↓                       │
│      ┌───────────────┐               │
│      │     eth0      │               │
│      │ 192.168.1.100 │               │
│      └───────────────┘               │
└──────────────┬───────────────────────┘
               │
               ▼
          Internet
```

**特性**：
- 容器直接使用主機網路
- 無需端口映射
- 性能最佳（無 NAT 開銷）
- 無網路隔離

**使用範例**：
```bash
# 使用 host 網路
docker run -d --network host --name web nginx

# 容器監聽 80 端口 = 主機監聽 80 端口
curl http://localhost:80    # 直接訪問

# 無需端口映射
# docker run -p 8080:80 是無效的
```

**適用場景**：
- 需要極致網路性能
- 需要訪問主機網路介面
- 監控工具（如 Prometheus Node Exporter）
- 網路密集型應用

**注意事項**：
- 端口衝突：容器端口 = 主機端口
- 安全性降低：無網路隔離
- 不適合多租戶環境

### Overlay 網路

#### 工作原理

**架構示意**：
```
┌────── Node 1 ──────┐        ┌────── Node 2 ──────┐
│                    │        │                    │
│  ┌──────────────┐  │        │  ┌──────────────┐  │
│  │ Container A  │  │        │  │ Container C  │  │
│  │ 10.0.0.2     │  │        │  │ 10.0.0.4     │  │
│  └──────┬───────┘  │        │  └──────┬───────┘  │
│         │          │        │         │          │
│  ┌──────▼───────┐  │        │  ┌──────▼───────┐  │
│  │ Container B  │  │        │  │ Container D  │  │
│  │ 10.0.0.3     │  │        │  │ 10.0.0.5     │  │
│  └──────┬───────┘  │        │  └──────┬───────┘  │
│         │          │        │         │          │
│    ┌────▼────┐     │        │    ┌────▼────┐     │
│    │ Overlay │     │        │    │ Overlay │     │
│    │ Network │     │        │    │ Network │     │
│    └────┬────┘     │        │    └────┬────┘     │
│         │          │        │         │          │
│    ┌────▼────┐     │        │    ┌────▼────┐     │
│    │  eth0   │◄────┼────────┼────►│  eth0   │    │
│    └─────────┘     │ VXLAN  │    └─────────┘     │
└────────────────────┘        └────────────────────┘
```

**關鍵技術**：
- **VXLAN**：虛擬可擴展局域網
- 在 UDP 封包中封裝 L2 幀
- 分佈式鍵值存儲（etcd/Consul）

#### 創建 Overlay 網路

**Docker Swarm 模式**（必須）：
```bash
# 初始化 Swarm
docker swarm init

# 創建 overlay 網路
docker network create \
  --driver overlay \
  --attachable \
  myoverlay

# 在 overlay 網路中運行服務
docker service create \
  --name web \
  --network myoverlay \
  --replicas 3 \
  nginx
```

**跨主機容器通信**：
```bash
# Node 1
docker run -d --name web1 --network myoverlay nginx

# Node 2
docker run -d --name web2 --network myoverlay nginx

# web1 可以 ping web2（即使在不同主機）
docker exec web1 ping web2
```

**適用場景**：
- 多主機容器編排
- Docker Swarm 集群
- 微服務架構
- 需要跨主機服務發現

### Macvlan 網路

#### 工作原理

**特性**：
- 為容器分配真實 MAC 地址
- 容器直接出現在物理網路中
- 如同物理機器連接到交換機

**創建 Macvlan 網路**：
```bash
# 創建 macvlan 網路
docker network create -d macvlan \
  --subnet=192.168.1.0/24 \
  --gateway=192.168.1.1 \
  -o parent=eth0 \
  macvlan-net

# 啟動容器
docker run -d \
  --network macvlan-net \
  --ip=192.168.1.100 \
  --name web \
  nginx
```

**適用場景**：
- 需要容器在物理網路中可見
- 與傳統應用整合
- 需要特定 MAC 地址
- 監控網路流量

**限制**：
- 需要主機網卡支援混雜模式
- 某些雲服務商不支援
- 主機無法直接訪問容器（需要額外配置）

### None 網路

**特性**：
- 完全無網路
- 只有 loopback 介面

**使用範例**：
```bash
docker run -d --network none --name isolated nginx

# 容器內部
docker exec isolated ip addr
# 只顯示 lo（loopback）
```

**適用場景**：
- 完全隔離的容器
- 自訂網路配置
- 安全敏感應用

### 網路管理命令

#### 常用命令

```bash
# 列出所有網路
docker network ls

# 查看網路詳細資訊
docker network inspect bridge

# 創建網路
docker network create mynet

# 刪除網路
docker network rm mynet

# 清理未使用的網路
docker network prune

# 將容器連接到網路
docker network connect mynet container1

# 斷開連接
docker network disconnect mynet container1
```

#### 查看容器網路

```bash
# 查看容器網路配置
docker inspect container1 | grep -A 20 Networks

# 查看容器 IP
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container1

# 進入容器查看網路
docker exec container1 ip addr
docker exec container1 netstat -tuln
```

### 容器間通信

#### 同一網路內通信

```bash
# 創建自訂網路
docker network create mynet

# 啟動容器
docker run -d --name web --network mynet nginx
docker run -d --name db --network mynet mysql

# 通過容器名稱訪問
docker exec web ping db        # ✅ 自動 DNS 解析
docker exec web curl http://db:3306
```

#### 跨網路通信

```bash
# 創建兩個網路
docker network create net1
docker network create net2

# 在不同網路啟動容器
docker run -d --name web --network net1 nginx
docker run -d --name db --network net2 mysql

# 無法直接通信
docker exec web ping db    # ❌ 失敗

# 解決方案 1：將容器連接到兩個網路
docker network connect net2 web
docker exec web ping db    # ✅ 成功

# 解決方案 2：使用 host 模式或端口映射
```

### Docker Compose 中的網路

**自動創建網路**：
```yaml
version: '3.8'

services:
  web:
    image: nginx
    networks:
      - frontend
  
  app:
    image: myapp
    networks:
      - frontend
      - backend
  
  db:
    image: mysql
    networks:
      - backend

networks:
  frontend:
  backend:
```

**自訂網路配置**：
```yaml
networks:
  frontend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1
  
  backend:
    driver: bridge
    internal: true    # 禁止外部訪問
```

### 網路性能與除錯

#### 性能比較

| 網路模式 | 性能 | 延遲 | 隔離性 |
|---------|------|------|--------|
| **host** | 最高（100%） | 最低 | 無 |
| **bridge（預設）** | 高（~95%） | 低 | 好 |
| **bridge（自訂）** | 高（~95%） | 低 | 好 |
| **overlay** | 中（~80%） | 中 | 好 |
| **macvlan** | 高（~95%） | 低 | 中 |

#### 除錯技巧

**查看容器網路堆疊**：
```bash
# 查看容器的網路命名空間
docker inspect container1 | grep Pid
# 進入網路命名空間
nsenter -t <PID> -n ip addr

# 使用 tcpdump 捕獲流量
docker run --rm --net=container:web nicolaka/netshoot tcpdump -i any
```

**測試連通性**：
```bash
# 使用 netshoot 工具箱
docker run -it --rm --network mynet nicolaka/netshoot

# 在工具箱內
ping db
curl http://web
nslookup web
traceroute web
```

**查看 iptables 規則**：
```bash
# Docker 自動創建的 NAT 規則
sudo iptables -t nat -L -n

# Bridge 網路規則
sudo iptables -L DOCKER -n
```

### 最佳實踐

**1. 使用自訂 Bridge 網路**
```bash
# ✅ 推薦：自訂網路（自動 DNS）
docker network create mynet
docker run -d --network mynet --name web nginx

# ❌ 避免：預設 bridge（只能用 IP）
docker run -d --name web nginx
```

**2. 網路隔離**
```yaml
# 前端網路：公開
frontend:
  driver: bridge

# 後端網路：內部
backend:
  driver: bridge
  internal: true    # 禁止外部訪問
```

**3. 限制容器網路資源**
```bash
docker run -d \
  --network mynet \
  --network-alias web \
  --dns 8.8.8.8 \
  --dns-search example.com \
  nginx
```

**4. 生產環境建議**
- 使用自訂網路（不用預設 bridge）
- 啟用網路加密（overlay 支援）
- 定期審查網路配置
- 使用網路策略限制流量
- 監控網路性能

## 總結

**Bridge 網路**：
- 單主機容器通信
- 自訂網路支援 DNS
- 預設且常用

**Host 網路**：
- 共享主機網路
- 最高性能
- 無隔離

**Overlay 網路**：
- 跨主機通信
- Docker Swarm 必備
- 支援服務發現

**關鍵概念**：
- 預設 bridge vs. 自訂 bridge
- 容器名稱解析（DNS）
- 端口映射與 NAT
- 網路隔離與安全

**選擇建議**：
- 開發環境：自訂 bridge
- 單主機生產：自訂 bridge
- 多主機集群：overlay
- 高性能需求：host
- 物理網路整合：macvlan

理解 Docker 網路模型是構建可靠容器化應用的基礎。
