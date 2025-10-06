# 網路效能優化策略

- **難度**: 7
- **重要程度**: 5
- **標籤**: `效能優化`, `延遲`, `吞吐量`, `網路調優`

## 問題詳述

解釋網路效能的關鍵指標（延遲、吞吐量、封包遺失）、常見的網路效能瓶頸，以及在不同層級（協定層、應用層、架構層）進行效能優化的策略。

## 核心理論與詳解

### 1. 關鍵效能指標

#### 延遲 (Latency)

**定義**: 資料從源到目的地所需的時間

**組成**:
```
總延遲 = 傳播延遲 + 傳輸延遲 + 處理延遲 + 排隊延遲

傳播延遲 (Propagation Delay):
  = 距離 / 光速 (約 200,000 km/s 在光纖中)
  台灣到美國: ~12,000 km / 200,000 km/s = 60ms

傳輸延遲 (Transmission Delay):
  = 資料大小 / 頻寬
  1 MB / 100 Mbps = 80ms

處理延遲 (Processing Delay):
  路由器、交換機處理封包: 通常 < 1ms

排隊延遲 (Queuing Delay):
  封包在路由器佇列等待: 變動大，可能 0-100ms+
```

**測量**:
- **RTT (Round-Trip Time)**: 往返時間
  ```bash
  ping example.com
  # ICMP echo request + reply
  ```
- **TTFB (Time To First Byte)**: 首字節時間
- **延遲百分位**: P50, P95, P99

#### 吞吐量 (Throughput)

**定義**: 單位時間內成功傳輸的資料量

**單位**: bps (bits per second), Mbps, Gbps

**影響因素**:
- 頻寬容量
- 協定開銷
- 封包遺失導致的重傳
- 窗口大小限制

**測量**:
```bash
# iperf3 測試
iperf3 -c server.example.com
```

#### 封包遺失 (Packet Loss)

**定義**: 傳輸過程中遺失的封包比例

**影響**:
- TCP: 觸發重傳，降低吞吐量
- UDP: 直接遺失資料（如視訊卡頓）

**測量**:
```bash
# mtr 工具
mtr example.com
```

### 2. TCP 層級優化

#### TCP 窗口調優

**TCP 接收窗口 (Receive Window)**:
```
吞吐量 = 窗口大小 / RTT

範例:
  窗口大小 = 64 KB
  RTT = 100ms
  最大吞吐量 = 64 KB / 0.1s = 640 KB/s = 5.12 Mbps
```

**問題**: 預設窗口大小可能限制高延遲/高頻寬網路的吞吐量

**解決**: 啟用 TCP 窗口擴展 (Window Scaling)
```bash
# Linux
sysctl -w net.ipv4.tcp_window_scaling=1

# 增加接收緩衝區
sysctl -w net.core.rmem_max=16777216
sysctl -w net.core.rmem_default=1048576
```

#### TCP 擁塞控制算法

**傳統算法**: Reno, Cubic (Linux 預設)

**現代算法**:

**BBR (Bottleneck Bandwidth and RTT)**:
- Google 開發
- 主動測量頻寬和 RTT
- 更高吞吐量，更低延遲
- 特別適合高延遲網路

```bash
# 啟用 BBR
echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
sysctl -p
```

#### TCP Fast Open (TFO)

**問題**: 傳統 TCP 握手需要 1-RTT 才能開始傳輸資料

**解決**: 在 SYN 包中攜帶應用資料

```
傳統:
  SYN →
  ← SYN-ACK
  ACK + Data →
  總計: 1.5 RTT

TFO:
  SYN + Data →
  ← SYN-ACK + Data
  總計: 0.5 RTT (節省 1-RTT)
```

**啟用**:
```bash
# Linux
sysctl -w net.ipv4.tcp_fastopen=3
# 3 = 客戶端和伺服器都啟用
```

#### TCP KeepAlive 優化

**用途**: 檢測死連接

**問題**: 預設間隔過長 (2小時)

**優化**:
```bash
# 減少 KeepAlive 間隔
sysctl -w net.ipv4.tcp_keepalive_time=600      # 10 分鐘
sysctl -w net.ipv4.tcp_keepalive_intvl=10      # 探測間隔 10 秒
sysctl -w net.ipv4.tcp_keepalive_probes=3      # 探測次數 3 次
```

### 3. HTTP 層級優化

#### HTTP/2 優化

**多路復用 (Multiplexing)**:
- 單一連接處理多個請求
- 消除 HTTP/1.1 的隊頭阻塞

**頭部壓縮 (HPACK)**:
- 壓縮 HTTP Header
- 減少重複頭部傳輸

**伺服器推送 (Server Push)**:
```nginx
# Nginx
location / {
    http2_push /style.css;
    http2_push /script.js;
}
```

**優先級 (Prioritization)**:
- 關鍵資源優先傳輸

#### HTTP/3 (QUIC) 優化

**優勢**:
- **0-RTT 連接建立**: 更快的首次請求
- **無隊頭阻塞**: 基於 UDP
- **連接遷移**: IP 變更不斷連 (移動網路)
- **內建加密**: TLS 1.3 整合

**啟用 HTTP/3** (Nginx):
```nginx
server {
    listen 443 quic reuseport;
    listen 443 ssl http2;
    
    ssl_protocols TLSv1.3;
    add_header Alt-Svc 'h3=":443"; ma=86400';
}
```

#### 持久連接 (Keep-Alive)

**HTTP/1.1**:
```http
Connection: keep-alive
Keep-Alive: timeout=5, max=100
```

**優勢**: 減少 TCP 握手開銷

**配置** (Nginx):
```nginx
keepalive_timeout 65;
keepalive_requests 100;

upstream backend {
    server 192.168.1.1:8080;
    keepalive 32;  # 保持 32 個連接到後端
}
```

### 4. 應用層優化

#### 快取策略

**1. 瀏覽器快取**:
```http
Cache-Control: public, max-age=31536000, immutable
# 靜態資源快取 1 年
```

**2. CDN 快取**:
- 邊緣節點快取
- 減少回源

**3. 反向代理快取** (Nginx):
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g;

location / {
    proxy_cache my_cache;
    proxy_cache_valid 200 1h;
    proxy_cache_key "$scheme$request_method$host$request_uri";
}
```

**4. 應用層快取**:
- Redis, Memcached
- 資料庫查詢結果快取

#### 內容壓縮

**Gzip**:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml;
gzip_min_length 1000;
gzip_comp_level 6;
```

**Brotli** (更高壓縮率):
```nginx
brotli on;
brotli_types text/plain text/css application/json application/javascript text/xml;
brotli_comp_level 6;
```

**效果**: 文字類內容減少 70-90%

#### 資源優化

**1. 圖片優化**:
- **格式選擇**: WebP (比 JPEG 小 30%), AVIF (更小)
- **響應式圖片**: 根據裝置提供不同尺寸
- **延遲載入**: Lazy Loading

**2. CSS/JS 優化**:
- **最小化**: 移除空格、註解
- **合併**: 減少 HTTP 請求數 (HTTP/1.1 時代重要)
- **代碼分割**: 只載入需要的部分

**3. 字體優化**:
- **字型子集化**: 只包含使用的字符
- **WOFF2 格式**: 更好的壓縮
- **font-display: swap**: 快速顯示後備字體

#### API 優化

**1. 批次請求**:
```
// 不佳: 多次請求
GET /api/users/1
GET /api/users/2
GET /api/users/3

// 優化: 批次請求
GET /api/users?ids=1,2,3
```

**2. 欄位過濾**:
```
// 只請求需要的欄位
GET /api/users/1?fields=id,name,email
```

**3. 分頁與游標**:
```
// 分頁
GET /api/users?page=1&limit=20

// 游標 (更高效)
GET /api/users?cursor=abc123&limit=20
```

**4. GraphQL**:
- 單一端點
- 客戶端指定需要的資料
- 減少過度獲取和不足獲取

### 5. 連接層優化

#### 連接池

**問題**: 頻繁建立/關閉連接開銷大

**解決**: 維護連接池

```go
// Go HTTP Client
client := &http.Client{
    Transport: &http.Transport{
        MaxIdleConns:        100,
        MaxIdleConnsPerHost: 10,
        IdleConnTimeout:     90 * time.Second,
    },
}
```

#### 連接復用

**HTTP/1.1 Keep-Alive**:
- 單一連接處理多個請求（序列化）

**HTTP/2**:
- 單一連接處理多個請求（並行）

**HTTP/3**:
- 單一連接 + 無隊頭阻塞

### 6. DNS 優化

**策略**:
- **DNS 預解析**: `<link rel="dns-prefetch">`
- **降低 TTL**: 快速切換（變更期間）
- **提高 TTL**: 減少查詢（穩定期間）
- **使用 GeoDNS**: 地理位置路由
- **使用 Anycast**: 就近接入

### 7. 架構層優化

#### CDN (內容分發網路)

**優勢**:
- 就近提供內容
- 降低延遲 (通常降低 70-90%)
- 減輕源站壓力

#### 負載均衡

**策略**:
- 分散流量
- 提高吞吐量
- 增強可用性

#### 微服務架構

**優化**:
- **服務間通信**: 使用 gRPC (高效能)
- **服務網格**: Istio, Linkerd (流量管理)
- **斷路器**: 快速失敗，避免級聯故障
- **限流**: 保護後端服務

### 8. 監控與分析

#### 關鍵指標

**用戶體驗指標**:
- **TTFB**: Time To First Byte
- **FCP**: First Contentful Paint
- **LCP**: Largest Contentful Paint
- **TTI**: Time To Interactive

**後端指標**:
- **QPS/RPS**: 每秒請求數
- **回應時間**: P50, P95, P99
- **錯誤率**: 4xx, 5xx
- **吞吐量**: Mbps, Gbps

#### 工具

**前端**:
- Chrome DevTools (Network 面板)
- Lighthouse (效能評分)
- WebPageTest (詳細分析)

**後端**:
- **iperf3**: 頻寬測試
- **mtr**: 路由追蹤和丟包分析
- **tcpdump / Wireshark**: 封包分析
- **Prometheus + Grafana**: 監控和視覺化

### 9. 實務最佳實踐

#### 效能優化清單

**前端**:
- [ ] 啟用 HTTP/2 或 HTTP/3
- [ ] 配置適當的快取策略
- [ ] 啟用內容壓縮 (Gzip/Brotli)
- [ ] 優化圖片 (格式、大小、延遲載入)
- [ ] 最小化和合併 CSS/JS
- [ ] 使用 CDN 分發靜態資源
- [ ] DNS 預解析關鍵域名
- [ ] 使用 Preconnect 和 Prefetch

**後端**:
- [ ] 啟用 TCP Fast Open
- [ ] 優化 TCP 窗口大小
- [ ] 使用 BBR 擁塞控制
- [ ] 配置連接池
- [ ] 實施快取策略 (多層快取)
- [ ] 優化資料庫查詢
- [ ] 使用非同步處理
- [ ] 實施速率限制

**架構**:
- [ ] 部署 CDN
- [ ] 配置負載均衡
- [ ] 使用地理分散的部署
- [ ] 實施服務降級和熔斷
- [ ] 建立監控和告警體系

## 總結

網路效能優化是多層次的系統工程：

1. **測量第一**: 先測量，找出瓶頸，再優化
2. **分層優化**: 從 TCP、HTTP 到應用層、架構層
3. **權衡取捨**: 延遲 vs 吞吐量、快取 vs 實時性
4. **持續監控**: 建立監控體系，及時發現問題
5. **漸進優化**: 先解決最大瓶頸，再逐步優化

作為資深後端工程師，你需要：
- 理解網路效能的關鍵指標和影響因素
- 能夠識別和診斷效能瓶頸
- 掌握各層級的優化技術和工具
- 在實際系統中實施有效的優化策略
- 建立完善的監控和分析體系
