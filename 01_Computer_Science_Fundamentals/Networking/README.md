# Networking (計算機網路)

計算機網路是後端開發的核心基礎之一,涵蓋從底層協定到應用層服務的完整知識體系。本章節收錄資深後端工程師必須掌握的網路相關面試題。

## 📋 題目索引

### 基礎協定 (Fundamental Protocols)

| 題目 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [OSI 模型 vs TCP/IP 模型對比](./osi_vs_tcpip_model.md) | 3 | 4 | `OSI`, `TCP/IP`, `網路模型` |
| [TCP 三次握手與四次揮手](./tcp_handshake_and_termination.md) | 5 | 5 | `TCP`, `連接管理`, `狀態機` |
| [TCP 可靠傳輸機制](./tcp_reliable_transmission.md) | 6 | 5 | `TCP`, `流量控制`, `擁塞控制` |
| [TCP vs UDP 對比與選擇](./tcp_vs_udp.md) | 4 | 5 | `TCP`, `UDP`, `協定選擇` |

### 應用層協定 (Application Layer)

| 題目 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [HTTP/1.1 vs HTTP/2 vs HTTP/3](./http_versions_comparison.md) | 7 | 5 | `HTTP`, `協定演進`, `QUIC` |
| [HTTPS 與 TLS/SSL 原理](./https_tls_ssl.md) | 7 | 5 | `HTTPS`, `TLS`, `加密`, `安全` |
| [DNS 解析流程與優化](./dns_resolution_and_optimization.md) | 5 | 4 | `DNS`, `域名解析`, `快取` |
| [WebSocket 協定與應用](./websocket_protocol.md) | 6 | 4 | `WebSocket`, `雙向通信`, `即時通訊` |
| [RESTful API vs gRPC](./restful_vs_grpc.md) | 6 | 5 | `REST`, `gRPC`, `API 設計` |

### 網路架構 (Network Architecture)

| 題目 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [負載均衡策略與實現](./load_balancing_strategies.md) | 7 | 5 | `負載均衡`, `高可用`, `分散式` |
| [CDN 原理與應用](./cdn_principles_and_applications.md) | 6 | 4 | `CDN`, `內容分發`, `快取` |
| [跨域問題與解決方案](./cors_and_cross_origin.md) | 5 | 4 | `CORS`, `同源策略`, `安全` |

### 網路安全 (Network Security)

| 題目 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [網路安全攻擊與防禦](./network_security_attacks.md) | 8 | 5 | `安全`, `DDoS`, `XSS`, `CSRF` |

### 效能優化 (Performance Optimization)

| 題目 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [網路效能優化策略](./network_performance_optimization.md) | 7 | 5 | `效能優化`, `延遲`, `吞吐量` |

## 🎯 學習路徑建議

### 初級 (1-2 個月)

**目標**: 掌握基礎網路協定和常見應用層協定

1. **基礎協定理解**
   - OSI vs TCP/IP 模型
   - TCP 三次握手與四次揮手
   - TCP vs UDP 特性對比

2. **HTTP 協定基礎**
   - HTTP/1.1 基本特性
   - HTTPS 加密原理
   - DNS 解析流程

3. **實戰練習**
   - 使用 Wireshark 抓包分析 TCP 握手
   - 實現簡單的 HTTP 客戶端/伺服器
   - 配置 HTTPS 證書

**時間分配**: 理論學習 40% + 抓包分析 30% + 程式碼實作 30%

### 中級 (2-4 個月)

**目標**: 深入理解協定機制和網路架構設計

1. **深入 TCP/IP**
   - TCP 可靠傳輸機制 (滑動窗口、擁塞控制)
   - HTTP/2 多路復用和頭部壓縮
   - WebSocket 雙向通信

2. **網路架構**
   - 負載均衡策略 (L4/L7)
   - CDN 工作原理
   - 跨域問題處理

3. **實戰項目**
   - 實現 HTTP/2 伺服器
   - 搭建 Nginx 負載均衡集群
   - 配置 CDN 加速

**時間分配**: 協定深入 30% + 架構設計 40% + 實戰項目 30%

### 高級 (4-6 個月)

**目標**: 精通效能優化和安全防護

1. **高級協定**
   - HTTP/3 和 QUIC
   - gRPC 和 Protocol Buffers
   - TLS 1.3 改進

2. **效能與安全**
   - 網路效能優化策略
   - DDoS 防護
   - 應用層安全 (XSS/CSRF/SQL Injection)

3. **生產環境實踐**
   - 高並發系統設計
   - 全鏈路追蹤和監控
   - 容災和應急響應

**時間分配**: 高級特性 30% + 效能調優 30% + 安全防護 40%

## 💡 核心知識點

### 1. 傳輸層核心

- **TCP 三大機制**: 可靠傳輸、流量控制、擁塞控制
- **狀態管理**: TCP 狀態機、TIME_WAIT 的必要性
- **效能優化**: TCP Fast Open、BBR 擁塞算法

### 2. 應用層演進

- **HTTP 演進史**: 1.0 → 1.1 → 2.0 → 3.0
- **關鍵改進**: Keep-Alive → 多路復用 → QUIC
- **安全加固**: TLS 握手優化、0-RTT

### 3. 網路架構

- **水平擴展**: 負載均衡、會話保持
- **垂直優化**: CDN 邊緣計算、DNS 智能解析
- **容錯設計**: 健康檢查、故障轉移

### 4. 安全防護

- **傳輸安全**: HTTPS、HSTS、Certificate Pinning
- **應用安全**: CSP、Same-Site Cookie、Rate Limiting
- **基礎設施**: WAF、DDoS 防護、入侵檢測

## 📚 推薦資源

### 書籍
- 《TCP/IP 詳解 卷1: 協定》- 網路協定的經典之作
- 《圖解 HTTP》- 淺顯易懂的 HTTP 入門書
- 《Web 性能權威指南》- 深入網路效能優化

### 線上資源
- [MDN Web Docs - HTTP](https://developer.mozilla.org/zh-TW/docs/Web/HTTP) - HTTP 協定文檔
- [RFC Editor](https://www.rfc-editor.org/) - 網路協定官方規範
- [High Performance Browser Networking](https://hpbn.co/) - 免費線上書籍

### 工具
- **Wireshark** - 網路封包分析工具
- **curl / Postman** - HTTP 客戶端工具
- **Nginx / HAProxy** - 負載均衡和反向代理

## 🔗 相關章節

- [作業系統](../Operating_System/) - 網路 I/O 模型、Socket 編程
- [資料庫](../../02_Backend_Development/Databases/) - 連接池管理
- [系統設計](../../03_System_Design_and_Architecture/) - 分散式系統通信

---

> **提示**: 學習網路知識時,建議結合 Wireshark 抓包分析和實際程式碼實作,這樣能更深入理解協定細節。從 TCP/IP 基礎開始,逐步向上層協定和架構設計進階。
