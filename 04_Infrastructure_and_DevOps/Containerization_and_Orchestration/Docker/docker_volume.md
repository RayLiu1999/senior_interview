# Docker Volume 與資料持久化

- **難度**: 5
- **標籤**: `Docker`, `Volume`, `Storage`

## 問題詳述

請解釋 Docker 中的資料持久化方案，包括 Volume、Bind Mount 和 tmpfs Mount 的工作原理、使用場景和最佳實踐。

## 核心理論與詳解

### 為什麼需要資料持久化

**容器的特性**：
- 容器層是**臨時的**
- 容器刪除後，資料會**丟失**
- 容器重啟後，資料會**重置**

**問題場景**：
```bash
# 啟動 MySQL 容器
docker run -d --name mysql mysql:8.0

# 寫入資料
docker exec mysql mysql -e "CREATE DATABASE mydb;"

# 刪除容器
docker rm -f mysql

# 重新啟動
docker run -d --name mysql mysql:8.0
# ❌ 之前的資料庫 mydb 丟失了！
```

**解決方案**：
- **Volume**：Docker 管理的存儲（推薦）
- **Bind Mount**：掛載主機目錄
- **tmpfs Mount**：記憶體存儲（臨時）

### 三種存儲方式對比

```
┌──────────────────────────────────────────────────┐
│              Docker Host                         │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │  /var/lib/docker/volumes/               │    │
│  │  ┌─────────────┐                        │    │
│  │  │   Volume    │  ← Docker 管理         │    │
│  │  │  (推薦)     │                        │    │
│  │  └──────┬──────┘                        │    │
│  │         │                               │    │
│  └─────────┼───────────────────────────────┘    │
│            │                                     │
│  ┌─────────▼───────────────────────────────┐    │
│  │      /host/path/                        │    │
│  │  ┌─────────────┐                        │    │
│  │  │ Bind Mount  │  ← 主機目錄           │    │
│  │  └──────┬──────┘                        │    │
│  └─────────┼───────────────────────────────┘    │
│            │                                     │
│  ┌─────────▼───────────────────────────────┐    │
│  │      Memory (tmpfs)                     │    │
│  │  ┌─────────────┐                        │    │
│  │  │tmpfs Mount  │  ← 記憶體 (臨時)      │    │
│  │  └─────────────┘                        │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
└──────────────────────────────────────────────────┘
```

| 特性 | Volume | Bind Mount | tmpfs Mount |
|------|--------|-----------|-------------|
| **位置** | Docker 管理 | 主機路徑 | 記憶體 |
| **可移植性** | 高 | 低 | 高 |
| **管理** | Docker CLI | 手動 | Docker CLI |
| **性能** | 好 | 好 | 最佳 |
| **持久化** | 是 | 是 | 否（臨時） |
| **適用場景** | 生產環境 | 開發環境 | 敏感資料 |

### Docker Volume（推薦）

#### Volume 的優勢

- Docker 管理（自動創建、備份、遷移）
- 可在多個容器間共享
- 支援 Volume 驅動（本地、雲端存儲）
- 可以預先填充資料
- 更安全（隔離於主機檔案系統）

#### 基本操作

**創建 Volume**：
```bash
# 創建 Volume
docker volume create mydata

# 查看所有 Volume
docker volume ls

# 查看 Volume 詳細資訊
docker volume inspect mydata
```

**使用 Volume**：
```bash
# 使用具名 Volume
docker run -d \
  --name mysql \
  -v mydata:/var/lib/mysql \
  mysql:8.0

# 使用匿名 Volume
docker run -d \
  --name mysql \
  -v /var/lib/mysql \
  mysql:8.0
# Docker 自動創建匿名 Volume
```

**新語法（--mount）**：
```bash
docker run -d \
  --name mysql \
  --mount source=mydata,target=/var/lib/mysql \
  mysql:8.0
```

**`-v` vs `--mount`**：
- `-v`: 簡潔，自動創建不存在的 Volume
- `--mount`: 明確，不存在的 Volume 會報錯（更安全）

#### Volume 生命週期

```bash
# 創建容器時自動創建 Volume
docker run -d -v mydata:/data --name app myapp

# 停止容器不會刪除 Volume
docker stop app
docker volume ls    # mydata 仍然存在

# 刪除容器也不會刪除 Volume
docker rm app
docker volume ls    # mydata 仍然存在

# 必須手動刪除 Volume
docker volume rm mydata

# 或刪除容器時同時刪除匿名 Volume
docker rm -v app
```

**清理未使用的 Volume**：
```bash
# 刪除所有未使用的 Volume
docker volume prune

# 查看會刪除哪些
docker volume prune --dry-run
```

#### 共享 Volume

**多個容器共享**：
```bash
# 創建 Volume
docker volume create shared-data

# 容器 A 寫入資料
docker run -d \
  --name writer \
  -v shared-data:/data \
  alpine \
  sh -c "echo 'Hello from Writer' > /data/message.txt"

# 容器 B 讀取資料
docker run --rm \
  -v shared-data:/data \
  alpine \
  cat /data/message.txt
# 輸出: Hello from Writer
```

**使用 volumes-from**：
```bash
# 創建資料容器
docker run -d --name datastore -v /data busybox

# 其他容器使用相同 Volume
docker run -d --name app1 --volumes-from datastore nginx
docker run -d --name app2 --volumes-from datastore nginx
```

#### Volume 驅動

**本地驅動（預設）**：
```bash
docker volume create mydata
# 預設使用 local 驅動
```

**NFS 驅動**：
```bash
docker volume create \
  --driver local \
  --opt type=nfs \
  --opt o=addr=192.168.1.100,rw \
  --opt device=:/path/to/dir \
  nfs-volume
```

**第三方驅動**：
- **AWS EBS**：`rexray/ebs`
- **GCE PD**：`gcepersistentdisk`
- **Azure Disk**：`azure-disk`
- **Ceph**：`rexray/rbd`

### Bind Mount

#### 使用 Bind Mount

**掛載主機目錄**：
```bash
# 使用絕對路徑
docker run -d \
  --name web \
  -v /host/path:/container/path \
  nginx

# 或使用 --mount
docker run -d \
  --name web \
  --mount type=bind,source=/host/path,target=/container/path \
  nginx
```

**掛載單個檔案**：
```bash
# 掛載配置檔案
docker run -d \
  --name nginx \
  -v /host/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx
# :ro = read-only
```

#### 唯讀掛載

```bash
# 容器只能讀取，不能修改
docker run -d \
  -v /host/data:/data:ro \
  --name app \
  myapp

# 嘗試寫入會失敗
docker exec app touch /data/test.txt
# Error: Read-only file system
```

#### Bind Mount 的使用場景

**開發環境**：
```bash
# 即時同步程式碼變更
docker run -d \
  --name dev \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/public:/app/public \
  node:18 \
  npm run dev

# 檔案變更立即反映到容器內
```

**配置檔案**：
```bash
# 掛載自訂配置
docker run -d \
  --name nginx \
  -v /etc/nginx/custom.conf:/etc/nginx/nginx.conf:ro \
  -v /var/log/nginx:/var/log/nginx \
  nginx
```

**日誌收集**：
```bash
# 將容器日誌寫入主機
docker run -d \
  --name app \
  -v /var/log/app:/app/logs \
  myapp
```

#### 注意事項

**路徑必須是絕對路徑**：
```bash
# ❌ 錯誤：相對路徑
docker run -v ./data:/data myapp

# ✅ 正確：絕對路徑
docker run -v $(pwd)/data:/data myapp
```

**權限問題**：
```bash
# 主機目錄權限可能與容器不匹配
docker run -v /host/data:/data myapp
# 容器內可能無法寫入

# 解決方案 1：調整主機目錄權限
sudo chown -R 1000:1000 /host/data

# 解決方案 2：使用相同 UID/GID 運行容器
docker run --user 1000:1000 -v /host/data:/data myapp
```

**主機路徑必須存在**（使用 --mount 時）：
```bash
# -v: 自動創建不存在的目錄
docker run -v /nonexist:/data myapp    # ✅ 創建 /nonexist

# --mount: 不存在則報錯
docker run --mount type=bind,source=/nonexist,target=/data myapp
# ❌ Error: /nonexist doesn't exist
```

### tmpfs Mount

#### 使用 tmpfs Mount

**基本用法**：
```bash
# 掛載到記憶體
docker run -d \
  --name app \
  --tmpfs /tmp \
  myapp

# 或使用 --mount
docker run -d \
  --name app \
  --mount type=tmpfs,target=/tmp \
  myapp
```

**指定大小和權限**：
```bash
docker run -d \
  --mount type=tmpfs,target=/tmp,tmpfs-size=100m,tmpfs-mode=1770 \
  myapp
# size: 100MB
# mode: 1770 (drwxrwx--T)
```

#### 使用場景

**敏感資料**：
```bash
# 密鑰、Token 等敏感資訊
docker run -d \
  --tmpfs /secrets:rw,noexec,nosuid,size=10m \
  myapp

# 容器停止後，資料自動清除
```

**臨時快取**：
```bash
# 應用快取
docker run -d \
  --tmpfs /app/cache \
  myapp
```

**高性能 I/O**：
```bash
# 臨時資料處理
docker run -d \
  --tmpfs /tmp \
  data-processor
```

#### 限制

- 僅 Linux 支援
- 容器停止後資料丟失
- 受限於主機記憶體
- 不可在容器間共享

### Docker Compose 中的 Volume

**定義 Volume**：
```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    volumes:
      # 具名 Volume
      - db-data:/var/lib/mysql
      
      # Bind Mount
      - ./config/my.cnf:/etc/mysql/my.cnf:ro
      
      # tmpfs Mount
      - type: tmpfs
        target: /tmp
        tmpfs:
          size: 100M
  
  app:
    image: myapp
    volumes:
      # 共享 Volume
      - shared-data:/data
    volumes_from:
      - db    # 使用 db 的所有 Volume

volumes:
  db-data:
    driver: local
  shared-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /host/path
```

**進階配置**：
```yaml
volumes:
  db-data:
    driver: local
    driver_opts:
      type: nfs
      o: addr=192.168.1.100,rw
      device: ":/path/to/dir"
  
  cache-data:
    driver: local
    driver_opts:
      type: tmpfs
      device: tmpfs
      o: size=100m
```

### Volume 備份與還原

#### 備份 Volume

**方法 1：使用臨時容器**：
```bash
# 創建備份
docker run --rm \
  -v mydata:/data \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/mydata-backup.tar.gz -C /data .

# 解釋：
# 1. 掛載要備份的 Volume: -v mydata:/data
# 2. 掛載主機目錄: -v $(pwd):/backup
# 3. 打包: tar czf /backup/mydata-backup.tar.gz -C /data .
```

**方法 2：使用 docker cp**（不推薦）：
```bash
# 只適用於正在運行的容器
docker cp container:/data ./backup
```

#### 還原 Volume

```bash
# 創建新 Volume
docker volume create mydata-restored

# 還原備份
docker run --rm \
  -v mydata-restored:/data \
  -v $(pwd):/backup \
  alpine \
  tar xzf /backup/mydata-backup.tar.gz -C /data

# 使用還原的 Volume
docker run -d \
  -v mydata-restored:/var/lib/mysql \
  --name mysql \
  mysql:8.0
```

#### Volume 遷移

**方法 1：備份和還原**（跨主機）：
```bash
# 主機 A: 備份
docker run --rm -v mydata:/data -v $(pwd):/backup alpine tar czf /backup/data.tar.gz -C /data .

# 傳輸到主機 B
scp data.tar.gz user@hostb:/path/

# 主機 B: 還原
docker volume create mydata
docker run --rm -v mydata:/data -v /path:/backup alpine tar xzf /backup/data.tar.gz -C /data
```

**方法 2：使用 Volume 插件**（如 rexray）：
```bash
# 使用支援跨主機的 Volume 驅動
docker volume create \
  --driver rexray/ebs \
  mydata

# Volume 可在不同主機間遷移
```

### 監控與除錯

#### 查看 Volume 使用情況

```bash
# 查看 Volume 列表
docker volume ls

# 查看 Volume 詳情
docker volume inspect mydata

# 查看 Volume 實際位置
docker volume inspect mydata | grep Mountpoint
# /var/lib/docker/volumes/mydata/_data

# 查看 Volume 大小
docker system df -v
```

#### 查看容器的掛載

```bash
# 查看容器的所有掛載
docker inspect container | grep -A 20 Mounts

# 或使用 jq
docker inspect container | jq '.[].Mounts'

# 進入容器查看
docker exec container df -h
docker exec container mount | grep /data
```

#### 常見問題

**問題 1：Volume 資料丟失**
```bash
# 原因：使用匿名 Volume
docker run -d -v /data myapp    # 匿名 Volume

# 解決：使用具名 Volume
docker run -d -v mydata:/data myapp
```

**問題 2：權限被拒絕**
```bash
# 檢查容器內的 UID/GID
docker exec container id

# 調整主機目錄權限
sudo chown -R 1000:1000 /host/data

# 或使用正確的用戶運行容器
docker run --user 1000:1000 -v /host/data:/data myapp
```

**問題 3：Bind Mount 不同步**
```bash
# 某些系統（如 macOS）可能有延遲
# 解決：使用 Volume 或調整同步設置
```

### 最佳實踐

**1. 優先使用 Volume**
```bash
# ✅ 推薦：生產環境使用 Volume
docker run -d -v db-data:/var/lib/mysql mysql

# ❌ 避免：生產環境使用 Bind Mount
docker run -d -v /host/db:/var/lib/mysql mysql
```

**2. 使用具名 Volume**
```bash
# ✅ 推薦：具名 Volume（易於管理）
docker volume create mydata
docker run -d -v mydata:/data myapp

# ❌ 避免：匿名 Volume（難以追蹤）
docker run -d -v /data myapp
```

**3. 定期備份**
```bash
# 設置定期備份腳本
#!/bin/bash
DATE=$(date +%Y%m%d)
docker run --rm \
  -v mydata:/data \
  -v /backups:/backup \
  alpine \
  tar czf /backup/mydata-$DATE.tar.gz -C /data .
```

**4. 清理未使用的 Volume**
```bash
# 定期清理
docker volume prune -f

# 或在 cron 中執行
0 2 * * 0 docker volume prune -f
```

**5. 使用唯讀掛載（安全）**
```bash
# 配置檔案使用 :ro
docker run -d \
  -v /etc/config:/config:ro \
  myapp
```

**6. Dockerfile 中聲明 Volume**
```dockerfile
FROM nginx
VOLUME /usr/share/nginx/html
VOLUME /var/log/nginx
```

## 總結

**三種存儲方式**：
- **Volume**：Docker 管理，生產推薦
- **Bind Mount**：主機目錄，開發環境
- **tmpfs Mount**：記憶體，臨時敏感資料

**關鍵概念**：
- Volume 生命週期獨立於容器
- 具名 Volume vs. 匿名 Volume
- Volume 可在容器間共享
- 備份與還原策略

**選擇建議**：
- 生產環境：Volume
- 開發環境：Bind Mount
- 配置檔案：Bind Mount (ro)
- 敏感資料：tmpfs Mount
- 日誌收集：Bind Mount

**最佳實踐**：
- 使用具名 Volume
- 定期備份
- 清理未使用 Volume
- 注意權限問題
- 使用唯讀掛載保護配置

理解 Docker 資料持久化是構建可靠容器化應用的關鍵。
