# Docker 內部原理與實現機制

- **難度**: 8
- **標籤**: `Docker`, `Internals`, `Linux`

## 問題詳述

請深入解釋 Docker 的底層實現機制，包括 Namespace、Cgroups、Union Filesystem 和容器運行時的工作原理。

## 核心理論與詳解

### Docker 架構概覽

**整體架構**：
```
┌─────────────────────────────────────────────────┐
│              Docker Client (CLI)                │
│              docker run, docker build           │
└────────────────────┬────────────────────────────┘
                     │ REST API
                     ▼
┌─────────────────────────────────────────────────┐
│              Docker Daemon (dockerd)            │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Images  │  │ Networks │  │ Volumes  │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│           Container Runtime (containerd)        │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │Container │  │Container │  │Container │     │
│  │   runc   │  │   runc   │  │   runc   │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
└───────┼─────────────┼─────────────┼────────────┘
        │             │             │
        ▼             ▼             ▼
┌─────────────────────────────────────────────────┐
│             Linux Kernel                        │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │Namespace │  │ Cgroups  │  │  Union   │     │
│  │          │  │          │  │    FS    │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────┘
```

**關鍵組件**：
- **Docker Client**：使用者介面（CLI）
- **Docker Daemon**：管理 Docker 物件（映像、容器、網路）
- **containerd**：容器運行時
- **runc**：低階容器運行時（OCI 標準）
- **Kernel 功能**：Namespace、Cgroups、Union FS

### Linux Namespace（隔離）

#### 什麼是 Namespace

**定義**：
Namespace 是 Linux 核心提供的一種**隔離機制**，讓程序看到**獨立的系統資源視圖**。

**Docker 使用的 Namespace**：

| Namespace | 隔離內容 | 建立於 |
|-----------|----------|--------|
| **PID** | 程序 ID | Linux 2.6.24 |
| **NET** | 網路堆疊 | Linux 2.6.29 |
| **MNT** | 掛載點 | Linux 2.4.19 |
| **UTS** | 主機名和域名 | Linux 2.6.19 |
| **IPC** | 程序間通訊 | Linux 2.6.19 |
| **USER** | 使用者和群組 ID | Linux 3.8 |

#### PID Namespace

**作用**：
隔離程序 ID，讓容器內的程序有**獨立的 PID 編號**。

**範例**：
```bash
# 主機上
ps aux
# PID 1: /sbin/init
# PID 1234: /usr/bin/dockerd
# PID 5678: containerd

# 容器內
docker run -it alpine ps aux
# PID 1: sh
# PID 2: ps aux
```

**關鍵特性**：
- 容器內的**第一個程序是 PID 1**
- 容器內看不到主機的其他程序
- 主機可以看到容器內的所有程序（但 PID 不同）

**驗證**：
```bash
# 啟動容器
docker run -d --name test nginx

# 在主機上查看容器程序
docker top test
# 看到 nginx 程序（主機的 PID）

# 在容器內查看
docker exec test ps aux
# PID 1: nginx (容器內的 PID)
```

**PID Namespace 層級結構**：
```
┌──────────────────────────────────┐
│    Host PID Namespace            │
│    (PID 1: init)                 │
│                                  │
│  ┌────────────────────────────┐  │
│  │  Container PID Namespace   │  │
│  │  (PID 1: app)              │  │
│  │                            │  │
│  │  Host 看到: PID 5678       │  │
│  │  Container 看到: PID 1     │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

#### NET Namespace

**作用**：
隔離網路堆疊，包括網路介面、路由表、防火牆規則等。

**每個容器有獨立的**：
- 網路介面（如 eth0）
- IP 位址
- 路由表
- iptables 規則
- socket

**驗證**：
```bash
# 主機網路介面
ip addr
# eth0, lo, docker0, veth...

# 容器網路介面
docker run -it alpine ip addr
# lo, eth0（獨立的）
```

**容器與主機的網路連接**：
```
┌─────────────────────────────────────────┐
│           Host Network Namespace        │
│                                         │
│  docker0 (Bridge)                       │
│     │                                   │
│     ├─ veth1a2b ◄─┐                     │
│     │              │                    │
│     └─ veth3c4d ◄─┤                     │
│                    │                    │
│  ┌────────────────┼──────────────────┐  │
│  │ Container 1    │                  │  │
│  │ NET Namespace  │                  │  │
│  │   eth0 ────────┘                  │  │
│  │   IP: 172.17.0.2                  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**veth pair**（虛擬網路介面對）：
- 一端在容器內（eth0）
- 一端在主機上（veth1a2b）
- 透過 Bridge（docker0）連接

#### MNT Namespace

**作用**：
隔離掛載點，讓容器有**獨立的檔案系統視圖**。

**範例**：
```bash
# 主機掛載點
mount
# /dev/sda1 on / ...
# /dev/sda2 on /home ...

# 容器掛載點
docker run -it alpine mount
# overlay on / ...
# tmpfs on /dev ...
# 完全不同的掛載點
```

**Rootfs（根檔案系統）**：
```
┌────────────────────────────────┐
│     Host Filesystem            │
│                                │
│  /var/lib/docker/              │
│    └── overlay2/               │
│         └── <layer-id>/        │
│              └── diff/         │
│                   └── bin/     │
│                   └── etc/     │
│  ┌──────────────────────────┐  │
│  │  Container MNT Namespace │  │
│  │                          │  │
│  │  / ──► overlay2 layer    │  │
│  │  /bin ──► layer/bin      │  │
│  │  /etc ──► layer/etc      │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
```

#### UTS Namespace

**作用**：
隔離主機名和域名。

**範例**：
```bash
# 主機主機名
hostname
# my-server

# 容器主機名
docker run -it alpine hostname
# a1b2c3d4e5f6（容器 ID）

# 自訂容器主機名
docker run -it --hostname myapp alpine hostname
# myapp
```

#### IPC Namespace

**作用**：
隔離程序間通訊（IPC）資源，如：
- 共享記憶體
- 訊息佇列
- 訊號量

**範例**：
```bash
# 主機 IPC 資源
ipcs

# 容器 IPC 資源
docker run -it alpine ipcs
# 看到不同的 IPC 資源
```

#### USER Namespace

**作用**：
隔離使用者和群組 ID，讓容器內的 root 對應到主機上的**非特權使用者**。

**範例**：
```bash
# 啟用 USER Namespace
docker run -it --userns-remap=default alpine id
# uid=0(root) gid=0(root)（容器內）

# 主機上查看
ps aux | grep alpine
# UID 100000（主機上的非特權使用者）
```

**安全優勢**：
- 即使容器內是 root，在主機上也是普通使用者
- 限制容器逃逸的影響

### Linux Cgroups（資源限制）

#### 什麼是 Cgroups

**定義**：
Cgroups (Control Groups) 是 Linux 核心提供的一種**資源管理機制**，用於限制、記錄和隔離程序群組的資源使用。

**支援的資源類型**：

| Cgroup 子系統 | 限制內容 |
|---------------|----------|
| **cpu** | CPU 使用率和時間 |
| **memory** | 記憶體使用量 |
| **blkio** | 磁碟 I/O |
| **net_cls** | 網路流量優先級 |
| **devices** | 裝置存取 |
| **freezer** | 暫停/恢復程序 |
| **cpuset** | CPU 核心綁定 |
| **pids** | 程序數量限制 |

#### CPU 限制

**限制 CPU 使用率**：
```bash
# 限制為 0.5 核心（50%）
docker run -d --cpus=0.5 nginx

# 限制為 1.5 核心（150%）
docker run -d --cpus=1.5 nginx
```

**CPU 配額（相對權重）**：
```bash
# 預設權重為 1024
docker run -d --cpu-shares=512 nginx
# 如果有其他容器競爭 CPU，這個容器獲得相對較少的 CPU 時間
```

**綁定到特定 CPU 核心**：
```bash
# 只使用 CPU 0 和 1
docker run -d --cpuset-cpus=0,1 nginx
```

**驗證**：
```bash
# 查看 Cgroup 設定
docker inspect container | grep -i cpu

# 主機上查看
cat /sys/fs/cgroup/cpu/docker/<container-id>/cpu.cfs_quota_us
cat /sys/fs/cgroup/cpu/docker/<container-id>/cpu.cfs_period_us
```

#### Memory 限制

**限制記憶體**：
```bash
# 限制為 512MB
docker run -d --memory=512m nginx

# 限制 + Swap
docker run -d --memory=512m --memory-swap=1g nginx
# 總共可用：512MB 記憶體 + 512MB Swap
```

**記憶體預留**：
```bash
# 軟限制（記憶體不足時的最低保證）
docker run -d --memory-reservation=256m nginx
```

**OOM Killer**：
```bash
# 預設：記憶體不足時 Kernel 會殺死容器
# 禁用 OOM Killer（不推薦）
docker run -d --oom-kill-disable nginx
```

**驗證**：
```bash
# 查看記憶體使用
docker stats container

# Cgroup 設定
cat /sys/fs/cgroup/memory/docker/<container-id>/memory.limit_in_bytes
```

#### Block I/O 限制

**限制讀寫速率**：
```bash
# 限制讀取：50 MB/s
docker run -d --device-read-bps=/dev/sda:50mb nginx

# 限制寫入：10 MB/s
docker run -d --device-write-bps=/dev/sda:10mb nginx
```

**限制 IOPS**：
```bash
# 限制讀取 IOPS：1000
docker run -d --device-read-iops=/dev/sda:1000 nginx
```

#### PID 限制

```bash
# 限制容器內最多 100 個程序
docker run -d --pids-limit=100 nginx
```

**防止 Fork 炸彈**：
```bash
# 容器內嘗試創建大量程序會失敗
docker run --pids-limit=10 alpine sh -c 'for i in $(seq 1 100); do sleep 1 & done'
```

### Union Filesystem（分層檔案系統）

#### 什麼是 Union FS

**定義**：
Union Filesystem 是一種**分層檔案系統**，可以將多個目錄**疊加**成一個統一的視圖。

**Docker 使用的 Union FS**：
- **OverlayFS**（推薦，Linux 主流）
- AUFS（舊版 Ubuntu）
- Btrfs
- ZFS
- Device Mapper

#### OverlayFS 工作原理

**層級結構**：
```
┌────────────────────────────────────────┐
│         Container Layer (讀寫)         │  ← 容器的變更
│            /var/lib/docker/            │
│              overlay2/<id>/diff/       │
├────────────────────────────────────────┤
│         Image Layer 3 (唯讀)           │
│         (ADD index.js)                 │
├────────────────────────────────────────┤
│         Image Layer 2 (唯讀)           │
│         (RUN npm install)              │
├────────────────────────────────────────┤
│         Image Layer 1 (唯讀)           │
│         (FROM node:18-alpine)          │
└────────────────────────────────────────┘
```

**OverlayFS 的兩個目錄**：
- **LowerDir**（lower）：唯讀層（映像層）
- **UpperDir**（upper）：讀寫層（容器層）
- **MergedDir**（merged）：合併後的視圖
- **WorkDir**（work）：OverlayFS 內部使用

**掛載範例**：
```bash
# 查看容器的掛載點
docker inspect container | grep -A 10 GraphDriver

# 輸出類似：
# "LowerDir": "/var/lib/docker/overlay2/l/ABC:/var/lib/docker/overlay2/l/DEF"
# "UpperDir": "/var/lib/docker/overlay2/<id>/diff"
# "WorkDir": "/var/lib/docker/overlay2/<id>/work"
```

#### Copy-on-Write (CoW)

**原理**：
當容器修改檔案時：
1. 檔案最初在**唯讀層**（LowerDir）
2. 容器要修改時，先**複製到讀寫層**（UpperDir）
3. 之後的修改都在讀寫層進行

**範例**：
```
初始狀態：
┌─────────────────────┐
│  Container Layer    │  (空)
├─────────────────────┤
│  Image Layer        │
│  - /app/config.json │
└─────────────────────┘

修改檔案後：
┌─────────────────────┐
│  Container Layer    │
│  - /app/config.json │  ← 修改後的版本
├─────────────────────┤
│  Image Layer        │
│  - /app/config.json │  ← 原始版本（隱藏）
└─────────────────────┘
```

**優勢**：
- 多個容器可以**共享唯讀層**（節省空間）
- 映像層**不可變**（安全）
- 啟動快速（不需複製整個映像）

**性能考量**：
```bash
# ❌ 大量小檔案寫入（CoW 開銷大）
docker run -v data:/data myapp

# ✅ 使用 Volume（直接寫入，無 CoW）
docker run -v /host/data:/data myapp
```

#### Whiteout 檔案（刪除標記）

**問題**：
如何在上層刪除下層的檔案？

**解決方案**：
使用 **whiteout 檔案**標記刪除。

**範例**：
```
Image Layer 1:
- /app/old-file.txt

Image Layer 2:
- /app/.wh.old-file.txt  ← whiteout 檔案

Merged View:
(old-file.txt 不可見)
```

**驗證**：
```bash
# 在容器內刪除檔案
docker exec container rm /app/file.txt

# 查看 UpperDir
ls -la /var/lib/docker/overlay2/<id>/diff/app/
# .wh.file.txt  ← whiteout 檔案
```

### 容器運行時

#### OCI 標準

**Open Container Initiative (OCI)**：
- **runtime-spec**：定義容器執行環境
- **image-spec**：定義映像格式
- **distribution-spec**：定義映像分發

**Docker 的運行時架構**：
```
Docker CLI
    │
    ▼
dockerd (Docker Daemon)
    │
    ▼
containerd (高階運行時)
    │
    ▼
containerd-shim
    │
    ▼
runc (低階運行時，OCI 標準)
    │
    ▼
Container Process
```

#### runc

**定義**：
runc 是一個符合 OCI 標準的**低階容器運行時**，負責創建和運行容器。

**runc 執行流程**：
1. 讀取 OCI 規範（`config.json`）
2. 創建 Namespace
3. 設定 Cgroups
4. 掛載根檔案系統
5. 執行容器程序

**手動使用 runc**：
```bash
# 1. 創建 rootfs
mkdir rootfs
docker export $(docker create alpine) | tar -C rootfs -xf -

# 2. 生成 OCI 規範
runc spec

# 3. 運行容器
sudo runc run mycontainer
```

#### containerd

**定義**：
containerd 是**高階容器運行時**，管理容器生命週期。

**功能**：
- 映像拉取和存儲
- 容器執行和監督
- 網路和存儲管理
- 調用 runc 創建容器

**架構**：
```
┌──────────────────────────────────┐
│         containerd               │
│                                  │
│  ┌────────┐  ┌────────┐         │
│  │ Images │  │Network │         │
│  └────────┘  └────────┘         │
│                                  │
│  ┌──────────────────────────┐   │
│  │   containerd-shim        │   │
│  │   ┌──────────────────┐   │   │
│  │   │      runc        │   │   │
│  │   │   Container      │   │   │
│  │   └──────────────────┘   │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘
```

**containerd-shim 的作用**：
- **解耦**：dockerd 可以重啟而不影響容器
- **監督**：監控容器程序狀態
- **I/O**：管理容器的 STDIN/STDOUT

### 容器的完整啟動流程

**詳細步驟**：
```
1. docker run nginx
     │
     ▼
2. Docker CLI ──REST API──► Docker Daemon (dockerd)
     │
     ▼
3. dockerd 檢查本地映像
     │ (如果不存在)
     ▼
4. 從 Registry 拉取映像 (docker pull)
     │
     ▼
5. dockerd 調用 containerd
     │
     ▼
6. containerd 創建容器配置 (OCI spec)
     │
     ▼
7. containerd 啟動 containerd-shim
     │
     ▼
8. containerd-shim 調用 runc
     │
     ▼
9. runc 創建 Namespace 和 Cgroups
     │
     ▼
10. runc 掛載 rootfs (OverlayFS)
     │
     ▼
11. runc 執行容器程序 (nginx)
     │
     ▼
12. runc 退出，containerd-shim 監督容器
     │
     ▼
13. 容器運行中
```

**實際驗證**：
```bash
# 啟動容器
docker run -d --name test nginx

# 查看程序樹
pstree -p $(docker inspect --format '{{.State.Pid}}' test)
# containerd-shim─┬─nginx───nginx
#                 └─{containerd-shim}

# 查看 Namespace
sudo ls -l /proc/$(docker inspect --format '{{.State.Pid}}' test)/ns
# net -> net:[4026532xxx]
# pid -> pid:[4026532xxx]
# mnt -> mnt:[4026532xxx]
```

### 安全機制

#### Capabilities

**Linux Capabilities**：
將 root 權限細分為多個獨立的能力。

**Docker 預設移除的 Capabilities**：
```bash
# 查看容器的 Capabilities
docker run --rm alpine sh -c 'apk add -U libcap; capsh --print'

# 預設移除：
# CAP_SYS_ADMIN（系統管理）
# CAP_NET_ADMIN（網路管理）
# CAP_SYS_MODULE（載入核心模組）
```

**添加 Capability**：
```bash
# 添加網路管理能力
docker run --cap-add=NET_ADMIN alpine
```

**移除所有 Capabilities**：
```bash
docker run --cap-drop=ALL alpine
```

#### Seccomp

**Secure Computing Mode**：
限制容器可以使用的系統呼叫。

**Docker 預設 Seccomp Profile**：
- 禁用約 44 個危險的系統呼叫
- 如 `reboot`、`mount`、`swapon`

**自訂 Seccomp Profile**：
```bash
docker run --security-opt seccomp=/path/to/profile.json alpine
```

#### AppArmor / SELinux

**強制存取控制（MAC）**：
```bash
# 使用 AppArmor Profile
docker run --security-opt apparmor=docker-default nginx

# 使用 SELinux
docker run --security-opt label=level:s0:c100,c200 nginx
```

### 最佳實踐

**1. 理解資源限制**
```bash
# 生產環境必須設定資源限制
docker run -d \
  --memory=512m \
  --cpus=1 \
  --pids-limit=100 \
  myapp
```

**2. 使用 USER Namespace**
```bash
# 啟用 USER Namespace（daemon 配置）
{
  "userns-remap": "default"
}
```

**3. 最小化 Capabilities**
```bash
# 移除不必要的 Capabilities
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE nginx
```

**4. 監控資源使用**
```bash
# 實時監控
docker stats

# 查看 Cgroup 設定
docker inspect container | grep -i cgroup
```

## 總結

**核心技術**：
- **Namespace**：資源隔離（PID、NET、MNT、UTS、IPC、USER）
- **Cgroups**：資源限制（CPU、Memory、I/O、PID）
- **Union FS**：分層檔案系統（OverlayFS、CoW）
- **容器運行時**：containerd + runc（OCI 標準）

**關鍵概念**：
- 容器不是虛擬機，而是**隔離的程序**
- 所有容器共享**同一個核心**
- Namespace 提供**視圖隔離**
- Cgroups 提供**資源限制**
- OverlayFS 實現**高效的分層存儲**

**安全機制**：
- Capabilities（細粒度權限控制）
- Seccomp（系統呼叫過濾）
- AppArmor / SELinux（強制存取控制）
- USER Namespace（使用者 ID 隔離）

理解這些底層機制有助於：
- 除錯容器問題
- 優化資源使用
- 提升安全性
- 設計更好的容器化方案
