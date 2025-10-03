# Docker 安全性最佳實踐

- **難度**: 7
- **標籤**: `Docker`, `Security`, `Best Practices`

## 問題詳述

請深入解釋 Docker 的安全機制和最佳實踐，包括映像安全、容器隔離、權限管理、密鑰管理和漏洞掃描。

## 核心理論與詳解

### Docker 安全威脅模型

**主要威脅**：
```
┌────────────────────────────────────────┐
│         攻擊面 (Attack Surface)        │
│                                        │
│  1. 映像供應鏈攻擊                     │
│     - 惡意映像                         │
│     - 漏洞依賴                         │
│                                        │
│  2. 容器逃逸                           │
│     - Kernel 漏洞                      │
│     - 錯誤配置                         │
│                                        │
│  3. 特權提升                           │
│     - root 用戶                        │
│     - 過度 Capabilities                │
│                                        │
│  4. 資料洩露                           │
│     - 密鑰暴露                         │
│     - Volume 權限                      │
│                                        │
│  5. DoS 攻擊                           │
│     - 資源耗盡                         │
│     - 網路洪水                         │
└────────────────────────────────────────┘
```

### 映像安全

#### 使用可信任的映像

**問題**：
不可信任的映像可能包含：
- 惡意軟體
- 後門程式
- 已知漏洞
- 挖礦程式

**❌ 不安全的做法**：
```bash
# 使用不明來源的映像
docker pull randomuser/suspicious-image
```

**✅ 安全的做法**：
```bash
# 使用官方映像
docker pull nginx:1.25-alpine

# 或使用 Docker Official Images
docker pull library/redis:7-alpine
```

**驗證映像來源**：
```bash
# 查看映像標籤和來源
docker inspect nginx:1.25-alpine

# 檢查映像簽名（Docker Content Trust）
export DOCKER_CONTENT_TRUST=1
docker pull nginx:1.25-alpine
```

#### Docker Content Trust (DCT)

**啟用 DCT**：
```bash
# 永久啟用
export DOCKER_CONTENT_TRUST=1

# 推送簽名映像
docker push myrepo/myapp:latest
# 會提示輸入簽名密鑰

# 拉取驗證簽名
docker pull myrepo/myapp:latest
# 驗證失敗會拒絕拉取
```

**DCT 架構**：
```
┌──────────────────────────────────┐
│      Docker Registry             │
│                                  │
│  ┌────────────┐  ┌────────────┐ │
│  │   Image    │  │ Signatures │ │
│  │  myapp:1.0 │  │  (Notary)  │ │
│  └────────────┘  └────────────┘ │
└──────────────┬───────────────────┘
               │ TLS + 簽名驗證
               ▼
┌──────────────────────────────────┐
│       Docker Client              │
│   DOCKER_CONTENT_TRUST=1         │
│   ✅ 驗證簽名後才拉取            │
└──────────────────────────────────┘
```

#### 漏洞掃描

**使用 Docker Scan**：
```bash
# 掃描本地映像
docker scan myapp:latest

# 輸出範例：
# ✗ High severity vulnerability found in openssl
#   CVE-2023-XXXXX
#   Fix: upgrade openssl to 3.0.10
```

**使用 Trivy**：
```bash
# 安裝 Trivy
brew install trivy

# 掃描映像
trivy image myapp:latest

# 僅顯示高危漏洞
trivy image --severity HIGH,CRITICAL myapp:latest

# 生成報告
trivy image -f json -o report.json myapp:latest
```

**使用 Snyk**：
```bash
# 掃描映像
snyk container test myapp:latest

# 監控映像
snyk container monitor myapp:latest
```

**CI/CD 整合**：
```yaml
# GitHub Actions
- name: Scan image
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'myapp:${{ github.sha }}'
    severity: 'HIGH,CRITICAL'
    exit-code: '1'  # 發現漏洞時失敗
```

#### 最小化映像

**問題**：
完整映像包含不必要的工具和函式庫，增加攻擊面。

**❌ 完整映像**：
```dockerfile
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    vim \
    git \
    sudo
# 攻擊面大，包含編輯器、shell 等
```

**✅ 精簡映像**：
```dockerfile
FROM alpine:3.18
RUN apk add --no-cache curl
# 攻擊面小，僅包含必要工具
```

**使用 Distroless**：
```dockerfile
# 僅包含應用和運行時，不包含 shell
FROM gcr.io/distroless/nodejs:18
COPY app.js /
CMD ["app.js"]

# 無法執行 docker exec（沒有 shell）
```

**使用 Scratch**：
```dockerfile
# 靜態編譯的 Go 應用
FROM scratch
COPY app /
CMD ["/app"]

# 最小攻擊面，僅包含二進制檔案
```

### 容器運行時安全

#### 使用非 root 用戶

**問題**：
容器內的 root 用戶可能逃逸到主機。

**❌ 以 root 運行**：
```dockerfile
FROM node:18-alpine
COPY app.js /
CMD ["node", "app.js"]
# 預設以 root 運行
```

**驗證**：
```bash
docker exec container id
# uid=0(root) gid=0(root)
```

**✅ 使用非 root 用戶**：
```dockerfile
FROM node:18-alpine

# 創建非特權用戶
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 設置檔案權限
COPY --chown=nodejs:nodejs app.js /app/

# 切換到非 root 用戶
USER nodejs

CMD ["node", "/app/app.js"]
```

**驗證**：
```bash
docker exec container id
# uid=1001(nodejs) gid=1001(nodejs)
```

**運行時指定用戶**：
```bash
# 使用特定 UID/GID
docker run --user 1001:1001 myapp
```

#### 唯讀根檔案系統

**啟用唯讀 rootfs**：
```bash
docker run --read-only myapp

# 如果應用需要寫入臨時檔案
docker run --read-only --tmpfs /tmp myapp
```

**Dockerfile**：
```dockerfile
FROM alpine
RUN adduser -D appuser
USER appuser
# 容器僅能寫入 /tmp（tmpfs）
```

**驗證**：
```bash
docker exec container touch /test.txt
# touch: /test.txt: Read-only file system
```

#### 禁用新特權

```bash
# 禁止容器獲得新特權
docker run --security-opt=no-new-privileges myapp
```

**作用**：
防止 setuid/setgid 程式提升權限。

**範例**：
```bash
# 不使用 no-new-privileges
docker run alpine su - root
# 可能成功提升權限

# 使用 no-new-privileges
docker run --security-opt=no-new-privileges alpine su - root
# 無法提升權限
```

### Linux Capabilities 管理

#### 什麼是 Capabilities

**定義**：
Capabilities 將 root 的權限細分為多個獨立的能力單元。

**常見 Capabilities**：

| Capability | 描述 | 風險 |
|------------|------|------|
| **CAP_NET_ADMIN** | 網路管理 | 高 |
| **CAP_SYS_ADMIN** | 系統管理 | 極高 |
| **CAP_SYS_MODULE** | 載入核心模組 | 極高 |
| **CAP_SYS_TIME** | 修改系統時間 | 中 |
| **CAP_NET_BIND_SERVICE** | 綁定特權端口 | 低 |
| **CAP_CHOWN** | 修改檔案所有者 | 低 |

#### Docker 預設 Capabilities

**預設保留**：
```bash
docker run --rm alpine sh -c 'apk add -U libcap; capsh --print'

# 預設保留的 Capabilities:
# CAP_CHOWN
# CAP_DAC_OVERRIDE
# CAP_FOWNER
# CAP_SETGID
# CAP_SETUID
# CAP_NET_BIND_SERVICE
# ...（共約 14 個）
```

**預設移除**（高風險）：
- `CAP_SYS_ADMIN`（系統管理）
- `CAP_NET_ADMIN`（網路管理）
- `CAP_SYS_MODULE`（載入核心模組）
- `CAP_SYS_BOOT`（重啟系統）

#### 最小化 Capabilities

**❌ 使用預設 Capabilities**：
```bash
docker run myapp
# 保留 14 個 Capabilities
```

**✅ 移除所有非必要 Capabilities**：
```bash
# 移除所有，僅添加必要的
docker run \
  --cap-drop=ALL \
  --cap-add=NET_BIND_SERVICE \
  myapp

# 例如：僅需綁定 80 端口
```

**應用範例**：
```bash
# Nginx 僅需綁定特權端口
docker run \
  --cap-drop=ALL \
  --cap-add=NET_BIND_SERVICE \
  --cap-add=CHOWN \
  --cap-add=SETGID \
  --cap-add=SETUID \
  nginx:alpine
```

**Docker Compose**：
```yaml
services:
  web:
    image: nginx:alpine
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
      - CHOWN
```

### Seccomp、AppArmor 和 SELinux

#### Seccomp（系統呼叫過濾）

**定義**：
Seccomp (Secure Computing Mode) 限制容器可以使用的系統呼叫。

**Docker 預設 Seccomp Profile**：
禁用約 44 個危險系統呼叫，包括：
- `reboot`（重啟系統）
- `swapon`/`swapoff`（交換空間）
- `mount`/`umount`（掛載檔案系統）
- `ptrace`（程序追蹤）

**查看預設 Profile**：
```bash
curl -o default.json https://raw.githubusercontent.com/moby/moby/master/profiles/seccomp/default.json
```

**自訂 Seccomp Profile**：
```json
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "architectures": ["SCMP_ARCH_X86_64"],
  "syscalls": [
    {
      "names": ["read", "write", "open", "close"],
      "action": "SCMP_ACT_ALLOW"
    }
  ]
}
```

**使用自訂 Profile**：
```bash
docker run --security-opt seccomp=/path/to/profile.json myapp
```

**禁用 Seccomp**（不推薦）：
```bash
docker run --security-opt seccomp=unconfined myapp
```

#### AppArmor

**啟用 AppArmor Profile**：
```bash
# 使用預設 Profile
docker run --security-opt apparmor=docker-default nginx

# 使用自訂 Profile
docker run --security-opt apparmor=my-custom-profile myapp
```

**自訂 AppArmor Profile**：
```bash
# /etc/apparmor.d/docker-myapp
profile docker-myapp flags=(attach_disconnected,mediate_deleted) {
  # 允許網路
  network inet tcp,
  
  # 禁止存取敏感檔案
  deny /etc/shadow r,
  deny /etc/passwd w,
  
  # 允許應用目錄
  /app/** r,
}
```

```bash
# 載入 Profile
sudo apparmor_parser -r -W /etc/apparmor.d/docker-myapp

# 使用
docker run --security-opt apparmor=docker-myapp myapp
```

#### SELinux

**啟用 SELinux**：
```bash
docker run --security-opt label=level:s0:c100,c200 myapp
```

**SELinux 標籤**：
```bash
# 查看容器的 SELinux 標籤
docker inspect container | grep -i selinux

# 查看檔案標籤
ls -Z /var/lib/docker/volumes/
```

### 密鑰管理

#### 不在映像中存儲密鑰

**❌ 硬編碼密鑰**（危險）：
```dockerfile
ENV DATABASE_PASSWORD=mysecretpassword
# 密鑰會存儲在映像層中
```

**驗證洩露**：
```bash
docker history myapp | grep DATABASE_PASSWORD
# 密鑰可見！
```

**✅ 使用環境變數**：
```bash
docker run -e DATABASE_PASSWORD=secret myapp
# 密鑰不會存儲在映像中
```

**✅ 使用 .env 檔案**（但不提交到 Git）：
```bash
# .env
DATABASE_PASSWORD=secret

# .gitignore
.env

# 使用
docker run --env-file .env myapp
```

#### Docker Secrets（Swarm Mode）

**創建 Secret**：
```bash
# 從檔案創建
echo "mysecretpassword" | docker secret create db_password -

# 從 STDIN 創建
docker secret create db_password password.txt
```

**使用 Secret**：
```bash
docker service create \
  --name myapp \
  --secret db_password \
  myimage
```

**讀取 Secret**：
```bash
# Secret 掛載到 /run/secrets/
cat /run/secrets/db_password
```

**Docker Compose**：
```yaml
version: '3.8'
services:
  db:
    image: postgres
    secrets:
      - db_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password

secrets:
  db_password:
    file: ./db_password.txt
```

#### 使用外部密鑰管理系統

**HashiCorp Vault**：
```bash
# 啟動 Vault
docker run -d --name vault vault

# 應用從 Vault 讀取密鑰
docker run \
  -e VAULT_ADDR=http://vault:8200 \
  -e VAULT_TOKEN=mytoken \
  myapp
```

**AWS Secrets Manager**：
```bash
# 應用使用 AWS SDK 讀取密鑰
docker run \
  -e AWS_REGION=us-east-1 \
  -e SECRET_NAME=myapp/db/password \
  myapp
```

### 網路安全

#### 網路隔離

**問題**：
預設所有容器連接到同一個網路，可以互相通訊。

**❌ 使用預設網路**：
```bash
docker run -d --name web nginx
docker run -d --name db postgres
# web 可以存取 db
```

**✅ 使用自訂網路隔離**：
```bash
# 創建網路
docker network create frontend
docker network create backend

# Web 僅連接 frontend
docker run -d --name web --network frontend nginx

# DB 僅連接 backend（隔離）
docker run -d --name db --network backend postgres

# API 連接兩個網路
docker run -d --name api \
  --network frontend \
  --network backend \
  myapi
```

**網路拓撲**：
```
┌──────────────────────────┐
│   Frontend Network       │
│   ┌───┐       ┌───┐      │
│   │Web│◄─────►│API│      │
│   └───┘       └─┬─┘      │
└─────────────────┼────────┘
                  │
┌─────────────────┼────────┐
│   Backend Network        │
│                ┌▼──┐     │
│                │API│     │
│                └─┬─┘     │
│                  │       │
│                ┌▼┐       │
│                │DB│      │
│                └──┘      │
└──────────────────────────┘
```

#### 限制對外通訊

**禁止容器存取外部網路**：
```bash
docker network create \
  --internal \
  private-network

docker run --network private-network myapp
# 無法存取外部網路
```

**使用防火牆規則**：
```bash
# 禁止容器存取特定 IP
iptables -I DOCKER-USER -d 10.0.0.5 -j DROP

# 僅允許特定端口
iptables -I DOCKER-USER -p tcp --dport 443 -j ACCEPT
iptables -I DOCKER-USER -j DROP
```

### 資源限制（防止 DoS）

#### CPU 和記憶體限制

```bash
docker run \
  --memory=512m \
  --memory-swap=1g \
  --cpus=1 \
  myapp
```

**Docker Compose**：
```yaml
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
```

#### PID 限制

```bash
# 限制最多 100 個程序
docker run --pids-limit=100 myapp
```

**防止 Fork 炸彈**：
```bash
docker run --pids-limit=10 alpine sh -c 'while true; do sh & done'
# 達到限制後無法創建新程序
```

#### 磁碟 I/O 限制

```bash
docker run \
  --device-read-bps=/dev/sda:10mb \
  --device-write-bps=/dev/sda:5mb \
  myapp
```

### 日誌安全

#### 防止日誌洩漏敏感資訊

**❌ 記錄敏感資訊**：
```javascript
console.log('Database password:', process.env.DB_PASSWORD);
// 密鑰會出現在日誌中
```

**✅ 過濾敏感資訊**：
```javascript
const sanitizeLog = (data) => {
  return data.replace(/password=\S+/g, 'password=***');
};
console.log(sanitizeLog('Connecting with password=secret123'));
// 輸出: Connecting with password=***
```

#### 限制日誌大小

```bash
docker run \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  myapp
```

**Docker Compose**：
```yaml
services:
  app:
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

### 安全掃描工具

#### 映像掃描

**Trivy**：
```bash
trivy image --severity HIGH,CRITICAL myapp:latest
```

**Snyk**：
```bash
snyk container test myapp:latest
```

**Clair**：
```bash
docker run -d -p 6060:6060 quay.io/coreos/clair:latest
clairctl analyze myapp:latest
```

#### 運行時安全監控

**Falco**：
```bash
# 安裝 Falco
helm install falco falcosecurity/falco

# 監控容器行為
# 檢測異常：
# - 容器內執行 shell
# - 讀取敏感檔案
# - 建立網路連接
```

**Sysdig**：
```bash
docker run -d --name sysdig \
  --privileged \
  -v /var/run/docker.sock:/host/var/run/docker.sock \
  -v /dev:/host/dev \
  sysdig/sysdig
```

### 安全基準檢查

#### Docker Bench Security

```bash
# 運行 Docker Bench
docker run -it --net host --pid host --userns host --cap-add audit_control \
  -e DOCKER_CONTENT_TRUST=$DOCKER_CONTENT_TRUST \
  -v /var/lib:/var/lib \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /etc:/etc --label docker_bench_security \
  docker/docker-bench-security

# 檢查項目：
# - Docker 守護程序配置
# - 檔案權限
# - 容器運行時配置
# - Docker Swarm 配置
```

**輸出範例**：
```
[WARN] 2.1 - Restrict network traffic between containers
[PASS] 2.2 - Set the logging level
[WARN] 4.1 - Create a user for the container
[PASS] 4.5 - Do not use privileged containers
```

### 完整安全配置範例

**Dockerfile**：
```dockerfile
# 使用精簡基礎映像
FROM node:18-alpine

# 創建非 root 用戶
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 設置工作目錄
WORKDIR /app

# 複製依賴檔案
COPY --chown=nodejs:nodejs package*.json ./

# 安裝依賴
RUN npm ci --only=production && \
    npm cache clean --force

# 複製應用程式碼
COPY --chown=nodejs:nodejs . .

# 切換到非 root 用戶
USER nodejs

# 暴露端口
EXPOSE 3000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node healthcheck.js || exit 1

# 啟動應用
CMD ["node", "index.js"]
```

**運行命令**：
```bash
docker run -d \
  --name myapp \
  --read-only \
  --tmpfs /tmp \
  --security-opt=no-new-privileges \
  --cap-drop=ALL \
  --cap-add=NET_BIND_SERVICE \
  --memory=512m \
  --cpus=1 \
  --pids-limit=100 \
  --network=frontend \
  -e NODE_ENV=production \
  --env-file .env \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  myapp:latest
```

**Docker Compose**：
```yaml
version: '3.8'
services:
  app:
    image: myapp:latest
    read_only: true
    tmpfs:
      - /tmp
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
    pids_limit: 100
    networks:
      - frontend
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 3s
      retries: 3

networks:
  frontend:
    driver: bridge

secrets:
  db_password:
    external: true
```

### 最佳實踐清單

**映像安全**：
- ✅ 使用官方映像或驗證來源
- ✅ 啟用 Docker Content Trust
- ✅ 定期掃描漏洞
- ✅ 使用精簡基礎映像（Alpine、Distroless）
- ✅ 最小化安裝
- ✅ 不在映像中存儲密鑰

**運行時安全**：
- ✅ 使用非 root 用戶
- ✅ 啟用唯讀根檔案系統
- ✅ 使用 `--security-opt=no-new-privileges`
- ✅ 最小化 Capabilities
- ✅ 使用 Seccomp/AppArmor/SELinux

**網路安全**：
- ✅ 使用自訂網路隔離服務
- ✅ 限制對外通訊
- ✅ 使用內部網路

**資源限制**：
- ✅ 設置 CPU/Memory 限制
- ✅ 設置 PID 限制
- ✅ 設置磁碟 I/O 限制

**密鑰管理**：
- ✅ 使用 Docker Secrets（Swarm）
- ✅ 使用外部密鑰管理系統（Vault）
- ✅ 不在日誌中記錄密鑰

**監控與合規**：
- ✅ 運行 Docker Bench Security
- ✅ 使用運行時安全監控（Falco）
- ✅ 定期審計容器配置
- ✅ 限制日誌大小

## 總結

**核心原則**：
- **最小權限原則**：僅授予必要的權限
- **縱深防禦**：多層安全機制
- **不可變基礎設施**：使用唯讀容器
- **供應鏈安全**：驗證映像來源

**關鍵機制**：
- **Namespace**：資源隔離
- **Cgroups**：資源限制
- **Capabilities**：細粒度權限控制
- **Seccomp**：系統呼叫過濾
- **AppArmor/SELinux**：強制存取控制

**安全工具**：
- **Trivy/Snyk**：漏洞掃描
- **Docker Bench**：安全基準檢查
- **Falco**：運行時監控
- **Vault**：密鑰管理

**常見漏洞**：
- 使用 root 用戶
- 過度 Capabilities
- 硬編碼密鑰
- 不限制資源
- 使用不可信任映像

理解並實踐這些安全措施能大幅提升 Docker 環境的安全性。
