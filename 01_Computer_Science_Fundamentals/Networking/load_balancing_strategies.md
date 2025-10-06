# 負載均衡策略與實現

- **難度**: 7
- **重要程度**: 5
- **標籤**: `負載均衡`, `高可用`, `分散式`, `架構設計`

## 問題詳述

解釋負載均衡的概念、常見的負載均衡算法、L4 vs L7 負載均衡的差異，以及在實際生產環境中如何設計和實現高可用的負載均衡架構。

## 核心理論與詳解

### 1. 負載均衡基本概念

**負載均衡 (Load Balancing)** 是將網路流量或計算任務分散到多個伺服器的技術，目的是：

#### 核心目標

- **提高可用性**: 單一伺服器故障不影響整體服務
- **提升效能**: 分散流量，避免單點過載
- **水平擴展**: 透過增加伺服器提升處理能力
- **流量管理**: 合理分配資源，優化使用率

#### 基本架構

```
        [客戶端請求]
              ↓
      [負載均衡器]
       /    |    \
      ↓     ↓     ↓
  [伺服器1] [伺服器2] [伺服器3]
```

### 2. 負載均衡層級

#### L4 負載均衡 (傳輸層)

**工作層級**: TCP/UDP (OSI 第 4 層)

**特點**:
- 基於 IP 位址和埠號進行路由
- 不解析應用層內容
- 效能高，延遲低
- 無法基於內容路由

**決策依據**:
- 源 IP 和目標 IP
- 源埠和目標埠
- 協定類型 (TCP/UDP)

**範例場景**:
```
客戶端 192.168.1.100:12345
       ↓
負載均衡器 (查看 IP:Port)
       ↓
轉發到後端伺服器 10.0.0.1:8080
```

**常見實現**: LVS, HAProxy (TCP 模式), AWS NLB (Network Load Balancer)

#### L7 負載均衡 (應用層)

**工作層級**: HTTP/HTTPS (OSI 第 7 層)

**特點**:
- 解析 HTTP 請求內容
- 可基於 URL、Header、Cookie 路由
- 可實施應用層邏輯 (如重寫、快取)
- 效能稍低，但靈活性高

**決策依據**:
- HTTP 方法 (GET, POST)
- URL 路徑 (`/api/*`, `/static/*`)
- Header 內容 (`Host`, `User-Agent`)
- Cookie 內容
- 請求內容

**範例場景**:
```
請求 GET /api/users
       ↓
負載均衡器 (解析 URL)
       ↓
路由到 API 伺服器集群

請求 GET /static/image.jpg
       ↓
負載均衡器 (解析 URL)
       ↓
路由到靜態資源伺服器
```

**常見實現**: Nginx, HAProxy (HTTP 模式), AWS ALB (Application Load Balancer)

#### L4 vs L7 對比

| 維度 | L4 負載均衡 | L7 負載均衡 |
|-----|-----------|-----------|
| **工作層級** | 傳輸層 (TCP/UDP) | 應用層 (HTTP/HTTPS) |
| **路由依據** | IP + 埠號 | URL, Header, Cookie |
| **效能** | 高 (10-100 Gbps) | 中 (1-10 Gbps) |
| **延遲** | 低 (< 1ms) | 稍高 (1-10ms) |
| **靈活性** | 低 | 高 |
| **SSL 終止** | 無 (透傳) | 可以 |
| **內容感知** | 否 | 是 |
| **適用場景** | 純轉發、極高吞吐 | 需要內容路由、複雜邏輯 |

### 3. 負載均衡算法

#### 算法 1: 輪詢 (Round Robin)

**原理**: 依序將請求分配給後端伺服器

```
請求 1 → 伺服器 A
請求 2 → 伺服器 B
請求 3 → 伺服器 C
請求 4 → 伺服器 A (循環)
```

**優點**:
- 實現簡單
- 分配均勻 (假設請求處理時間相同)

**缺點**:
- 不考慮伺服器負載
- 不考慮請求處理時間差異

**適用場景**: 後端伺服器配置相同，請求處理時間相近

#### 算法 2: 加權輪詢 (Weighted Round Robin)

**原理**: 根據伺服器權重分配請求

```
伺服器 A (權重 3): 處理 3 個請求
伺服器 B (權重 2): 處理 2 個請求
伺服器 C (權重 1): 處理 1 個請求
```

**配置範例**:
```nginx
upstream backend {
    server 192.168.1.1 weight=3;
    server 192.168.1.2 weight=2;
    server 192.168.1.3 weight=1;
}
```

**優點**:
- 考慮伺服器處理能力差異
- 更合理的資源利用

**適用場景**: 後端伺服器配置不同 (如不同規格的主機)

#### 算法 3: 最少連接 (Least Connections)

**原理**: 將請求分配給當前連接數最少的伺服器

```
伺服器 A: 10 個連接
伺服器 B: 5 個連接  ← 選擇
伺服器 C: 8 個連接
```

**優點**:
- 動態考慮當前負載
- 適應請求處理時間差異大的場景

**缺點**:
- 需要追蹤連接狀態
- 實現複雜度較高

**適用場景**: 請求處理時間差異大 (如長短連接混合)

#### 算法 4: 加權最少連接 (Weighted Least Connections)

**原理**: 結合伺服器權重和當前連接數

```
計算: 連接數 / 權重

伺服器 A: 10 連接 / 權重 3 = 3.33
伺服器 B: 5 連接 / 權重 2 = 2.5  ← 選擇
伺服器 C: 8 連接 / 權重 4 = 2.0  ← 如果 B 之後，選 C
```

**優點**:
- 綜合考慮能力和負載
- 更精確的流量分配

#### 算法 5: IP 雜湊 (IP Hash)

**原理**: 根據客戶端 IP 計算雜湊，確保同一客戶端總是路由到同一伺服器

```
hash(客戶端 IP) % 伺服器數量

hash(192.168.1.100) % 3 = 1 → 伺服器 B
hash(192.168.1.101) % 3 = 0 → 伺服器 A
hash(192.168.1.102) % 3 = 2 → 伺服器 C
```

**優點**:
- 會話親和性 (Session Affinity)
- 無需共享會話儲存

**缺點**:
- 伺服器數量變化會導致大量重新映射
- 分配不一定均勻 (取決於 IP 分布)

**改進**: 一致性雜湊 (Consistent Hashing) 減少重映射影響

#### 算法 6: URL 雜湊 (URL Hash)

**原理**: 根據請求 URL 計算雜湊

```
hash("/api/users") % 3 = 1 → 伺服器 B
hash("/api/products") % 3 = 2 → 伺服器 C
```

**優點**:
- 相同 URL 總是路由到同一伺服器 (利於快取)
- 適合內容緩存場景

**適用場景**: CDN、靜態資源伺服器

#### 算法 7: 最快回應 (Least Response Time)

**原理**: 選擇歷史回應時間最快的伺服器

```
伺服器 A: 平均回應 50ms
伺服器 B: 平均回應 30ms  ← 選擇
伺服器 C: 平均回應 100ms
```

**優點**:
- 動態適應伺服器效能變化
- 優先使用效能好的伺服器

**缺點**:
- 需要持續監控回應時間
- 實現複雜

#### 算法 8: 隨機 (Random)

**原理**: 隨機選擇後端伺服器

**優點**:
- 實現極其簡單
- 長期來看分配相對均勻

**缺點**:
- 短期可能不均勻
- 無法保證會話親和性

**適用場景**: 無狀態服務、伺服器配置相同

### 4. 會話保持 (Session Persistence)

#### 問題背景

**問題**: 用戶會話資料存儲在特定伺服器，後續請求必須路由到同一伺服器

```
用戶登入 → 伺服器 A (儲存會話)
用戶請求 → 伺服器 B (找不到會話) ✗
```

#### 解決方案 1: IP 雜湊

**原理**: 基於客戶端 IP 保持親和性

**優點**: 實現簡單，無需額外狀態
**缺點**: IP 變化 (如 NAT、移動網路) 會丟失會話

#### 解決方案 2: Cookie 會話親和 (Cookie-based Affinity)

**原理**: 負載均衡器設定 Cookie 標記目標伺服器

```
首次請求 → 負載均衡器選擇伺服器 A
           設定 Cookie: backend=serverA
後續請求 → 攜帶 Cookie: backend=serverA
           負載均衡器路由到伺服器 A
```

**Nginx 配置**:
```nginx
upstream backend {
    server 192.168.1.1;
    server 192.168.1.2;
    server 192.168.1.3;
    sticky cookie backend_server expires=1h domain=.example.com path=/;
}
```

**優點**: 精確控制，不受 IP 影響
**缺點**: 依賴 Cookie，需要客戶端支援

#### 解決方案 3: 共享會話儲存 (推薦)

**原理**: 會話資料存儲在共享儲存 (如 Redis)，任何伺服器都可訪問

```
用戶登入 → 伺服器 A → 儲存會話到 Redis
用戶請求 → 伺服器 B → 從 Redis 讀取會話 ✓
```

**優點**:
- 無需會話親和性
- 伺服器可自由擴縮
- 提高可用性

**缺點**:
- 增加外部依賴
- 需要網路開銷

**實現**: Redis, Memcached, 資料庫

### 5. 健康檢查 (Health Check)

#### 被動健康檢查

**原理**: 根據實際請求的成功/失敗判斷健康狀態

```
伺服器 A 連續 3 次請求失敗
   → 標記為不健康
   → 停止轉發流量
   → 定期重試，成功後恢復
```

**優點**: 無額外開銷，實時性好
**缺點**: 影響實際用戶請求

#### 主動健康檢查

**原理**: 負載均衡器定期發送探測請求

**類型 1: TCP 健康檢查**
```
每 5 秒嘗試 TCP 連接
連接成功 → 健康
連接失敗或超時 → 不健康
```

**類型 2: HTTP 健康檢查**
```
GET /health HTTP/1.1

回應 200 OK → 健康
回應 5xx 或超時 → 不健康
```

**類型 3: 應用層健康檢查**
```
檢查資料庫連接
檢查關鍵依賴服務
檢查資源使用率 (CPU, 記憶體)

全部正常 → 回應 200 OK
任一異常 → 回應 503 Service Unavailable
```

**Nginx 配置**:
```nginx
upstream backend {
    server 192.168.1.1;
    server 192.168.1.2 max_fails=3 fail_timeout=30s;
    server 192.168.1.3;
}
```

**HAProxy 配置**:
```
backend web_servers
    option httpchk GET /health
    http-check expect status 200
    server web1 192.168.1.1:80 check inter 5s
    server web2 192.168.1.2:80 check inter 5s
```

#### 健康檢查最佳實踐

- **檢查間隔**: 3-10 秒 (平衡及時性和開銷)
- **失敗閾值**: 連續 2-3 次失敗才標記為不健康
- **恢復閾值**: 連續 2-3 次成功才恢復
- **超時設定**: 1-3 秒 (快速檢測慢節點)
- **檢查端點**: 專用的健康檢查端點，而非生產端點

### 6. 高可用架構

#### 單點故障問題

```
        [負載均衡器] ← 單點故障！
       /    |    \
      ↓     ↓     ↓
  [伺服器1] [伺服器2] [伺服器3]
```

#### 解決方案 1: 主備模式 (Active-Passive)

```
[負載均衡器 主] ← 提供服務
     ↕ (心跳)
[負載均衡器 備] ← 待命

主節點故障時，備節點接管 (透過 VIP 切換)
```

**實現**: Keepalived (VRRP 協定)

**配置範例**:
```
主節點:
  priority 100 (高優先級)
  VIP: 192.168.1.100

備節點:
  priority 90 (低優先級)
  當主節點故障時，接管 VIP
```

**優點**: 實現簡單，快速故障轉移
**缺點**: 備節點資源閒置，浪費

#### 解決方案 2: 主主模式 (Active-Active)

```
[負載均衡器 1] ← 處理 50% 流量
     ↕ (心跳)
[負載均衡器 2] ← 處理 50% 流量
```

**實現**: DNS 輪詢 + Keepalived 互備

**優點**: 資源充分利用，更高吞吐量
**缺點**: 配置複雜，需要同步狀態

#### 解決方案 3: 分層負載均衡

```
        [DNS 負載均衡]
       /              \
[LB 集群 1]      [LB 集群 2]
   /  |  \          /  |  \
後端伺服器...    後端伺服器...
```

**實現**:
- **DNS 層**: 地理位置路由
- **LB 層**: L4/L7 負載均衡
- **應用層**: 服務集群

### 7. 常見負載均衡器

#### Nginx

**類型**: L7 (HTTP), 也支援 L4 (Stream 模組)

**優勢**:
- 配置簡單，易於上手
- 高效能 (事件驅動)
- 豐富的功能 (反向代理、快取、SSL 終止)
- 廣泛使用，社群活躍

**基本配置**:
```nginx
http {
    upstream backend {
        least_conn;  # 最少連接算法
        server 192.168.1.1:8080 weight=3;
        server 192.168.1.2:8080 weight=2;
        server 192.168.1.3:8080 weight=1 backup;
    }
    
    server {
        listen 80;
        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
```

#### HAProxy

**類型**: L4 和 L7

**優勢**:
- 專注於負載均衡，功能強大
- 詳細的統計和監控
- 靈活的 ACL 規則
- 優秀的效能

**基本配置**:
```
global
    maxconn 4096

defaults
    mode http
    timeout connect 5s
    timeout client 50s
    timeout server 50s

frontend http_front
    bind *:80
    default_backend http_back

backend http_back
    balance roundrobin
    option httpchk GET /health
    server server1 192.168.1.1:8080 check
    server server2 192.168.1.2:8080 check
    server server3 192.168.1.3:8080 check
```

#### LVS (Linux Virtual Server)

**類型**: L4 (專注於 IP 層)

**優勢**:
- 極高效能 (核心層實現)
- 支援大規模集群
- 三種模式: NAT, DR, TUN

**工作模式**:

**NAT 模式**: 負載均衡器修改 IP 並轉發
**DR 模式 (Direct Routing)**: 只修改 MAC 位址，回應直接返回客戶端
**TUN 模式**: 透過 IP 隧道轉發

#### 雲服務商負載均衡器

**AWS**:
- ELB (Elastic Load Balancer): 經典負載均衡器
- ALB (Application Load Balancer): L7, 支援路徑路由
- NLB (Network Load Balancer): L4, 極高效能
- GWLB (Gateway Load Balancer): 用於虛擬設備

**GCP**:
- Cloud Load Balancing: 全球負載均衡
- 支援 HTTP(S), TCP/UDP, 內部負載均衡

**Azure**:
- Azure Load Balancer: L4 負載均衡
- Application Gateway: L7, 包含 WAF

### 8. 效能優化

#### 連接池復用

**問題**: 頻繁建立/關閉後端連接開銷大

**解決**: 維護到後端的連接池

```nginx
upstream backend {
    server 192.168.1.1:8080;
    keepalive 32;  # 保持 32 個空閒連接
}

location / {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
}
```

#### HTTP/2 支援

**優勢**: 多路復用、頭部壓縮、伺服器推送

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

#### SSL/TLS 優化

**策略 1: SSL 終止**
- 負載均衡器處理 SSL/TLS 加解密
- 後端使用明文通信 (內網)
- 減少後端伺服器 CPU 負載

**策略 2: SSL Session 復用**
```nginx
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

**策略 3: OCSP Stapling**
```nginx
ssl_stapling on;
ssl_stapling_verify on;
```

### 9. 監控與除錯

#### 關鍵指標

**流量指標**:
- 請求數 (QPS/RPS)
- 流量大小 (Mbps/Gbps)
- 連接數 (當前/峰值)

**效能指標**:
- 回應時間 (平均/P95/P99)
- 後端延遲
- 佇列長度

**健康指標**:
- 健康節點數
- 不健康節點數
- 故障轉移次數

**錯誤指標**:
- 4xx 錯誤率
- 5xx 錯誤率
- 超時錯誤率

#### 日誌分析

**Nginx 訪問日誌**:
```nginx
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent" "$http_x_forwarded_for" '
                'upstream: $upstream_addr '
                'response_time: $upstream_response_time '
                'request_time: $request_time';
```

**分析工具**: GoAccess, ELK Stack, Splunk

### 10. 實務最佳實踐

#### 負載均衡器配置清單

- [ ] 選擇合適的負載均衡算法
- [ ] 配置健康檢查 (主動 + 被動)
- [ ] 設定合理的超時時間
- [ ] 啟用連接池復用
- [ ] 配置會話保持 (如需要)
- [ ] 實施 SSL/TLS 終止
- [ ] 啟用訪問日誌
- [ ] 配置監控和告警
- [ ] 實現高可用 (主備或主主)
- [ ] 定期演練故障轉移
- [ ] 設定速率限制 (防止濫用)
- [ ] 配置安全規則 (如 IP 白名單)

#### 後端伺服器配置清單

- [ ] 提供健康檢查端點
- [ ] 優化應用啟動時間
- [ ] 實施優雅關閉 (Graceful Shutdown)
- [ ] 記錄關鍵指標和日誌
- [ ] 設定資源限制 (記憶體、CPU)
- [ ] 配置超時時間 (與 LB 協調)

## 總結

負載均衡是高可用架構的核心組件：

1. **選擇合適層級**: L4 重效能，L7 重靈活性
2. **選擇合適算法**: 根據業務特性和伺服器配置選擇
3. **會話處理**: 優先使用共享儲存，避免會話親和性
4. **健康檢查**: 主動檢查 + 被動監控，及時發現故障
5. **高可用設計**: 避免單點故障，實現自動故障轉移
6. **持續監控**: 追蹤關鍵指標，及時發現和解決問題

作為資深後端工程師，你需要：
- 深入理解不同負載均衡算法的原理和適用場景
- 能夠根據業務需求設計負載均衡架構
- 掌握主流負載均衡器的配置和優化
- 實施有效的健康檢查和故障轉移機制
- 建立完善的監控和告警體系
