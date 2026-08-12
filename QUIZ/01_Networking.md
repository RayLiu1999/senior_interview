# 網路 (Networking) - 重點考題 (Quiz)

> 這份考題是從網路章節中挑選出的核心題目，設計成快速複習與口頭自測。
>
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

### Q1: TCP 三次握手與四次揮手
<!-- Concept ID: concept.network.tcp.connection-management; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請說明 TCP 建立與關閉連線的主要步驟，以及 `SYN-RECV`、`TIME_WAIT`、`CLOSE_WAIT` 各自代表什麼。

<details>
<summary>💡 答案提示</summary>

- 三次握手用於協商雙方的初始序號並建立連線。
- 四次揮手反映雙向資料流分別關閉；主動關閉的一方通常進入 `TIME_WAIT`。
- `SYN-RECV` 表示等待握手完成；`CLOSE_WAIT` 表示收到對方關閉通知但本端應用程式尚未關閉 socket。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Networking/tcp_handshake_and_termination.md)
---

### Q2: CDN 原理與回源策略
<!-- Concept ID: concept.network.cdn.cache-routing; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請用 incident 或設計情境說明此主題的核心機制、主要取捨，以及如何以觀測證據判斷故障方向。

<details>
<summary>💡 答案提示</summary>

- **LO-1**: 能追蹤 cache key、命中／miss、TTL、驗證、回源與 stale 回應的資料路徑。
- **LO-2**: 能依一致性、延遲、來源站容量與內容個人化需求比較 TTL、失效、預熱與 revalidate。
- **LO-3**: 能從 hit ratio、origin bytes、回源延遲與錯誤率設計快取故障的分層止血與驗證流程。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Networking/cdn_principles_and_applications.md)

---

### Q3: Cookie Session Token 身份狀態選擇
<!-- Concept ID: concept.network.http.session-authentication; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請用 incident 或設計情境說明此主題的核心機制、主要取捨，以及如何以觀測證據判斷故障方向。

<details>
<summary>💡 答案提示</summary>

- **LO-1**: 能比較 Cookie、集中式 Session 與簽發式 Token 的狀態位置、信任邊界與撤銷方式。
- **LO-2**: 能依 HttpOnly、Secure、SameSite、CSRF、XSS、輪替與過期需求選擇身份承載方案。
- **LO-3**: 能在多區部署、重試、快取或金鑰輪替事故中維持身份正確性與可用性。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Networking/cookie_session_token.md)

---

### Q4: CORS 同源策略與預檢
<!-- Concept ID: concept.network.http.cors-origin-policy; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請用 incident 或設計情境說明此主題的核心機制、主要取捨，以及如何以觀測證據判斷故障方向。

<details>
<summary>💡 答案提示</summary>

- **LO-1**: 能依 scheme、host、port 判斷 origin，並說明 simple request、preflight 與實際請求的順序。
- **LO-2**: 能區分瀏覽器同源限制、伺服器授權、credentials、wildcard 與 preflight cache 的語意。
- **LO-3**: 能從瀏覽器錯誤、OPTIONS status、Origin／Allow 標頭與代理快取證據修正跨域政策。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Networking/cors_and_cross_origin.md)

---

### Q5: DNS 解析與快取故障
<!-- Concept ID: concept.network.dns.resolution-caching; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請用 incident 或設計情境說明此主題的核心機制、主要取捨，以及如何以觀測證據判斷故障方向。

<details>
<summary>💡 答案提示</summary>

- **LO-1**: 能描述 stub resolver、遞迴 resolver、root、TLD、authoritative server、record 與 TTL 的解析路徑。
- **LO-2**: 能比較正／負快取、低 TTL、健康檢查、加權解析與 failover 的延遲和一致性代價。
- **LO-3**: 能從 NXDOMAIN、SERVFAIL、stale record、解析延遲與區域差異設計可回滾的切換流程。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Networking/dns_resolution_and_optimization.md)

---

### Q6: HTTP 狀態碼與重試語意
<!-- Concept ID: concept.network.http.status-semantics; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請用 incident 或設計情境說明此主題的核心機制、主要取捨，以及如何以觀測證據判斷故障方向。

<details>
<summary>💡 答案提示</summary>

- **LO-1**: 能正確解讀 2xx、3xx、4xx、5xx 類別與常見狀態碼的責任歸屬。
- **LO-2**: 能依 method 冪等性、deadline、錯誤來源與 Retry-After 判斷是否可重試。
- **LO-3**: 能將錯誤分類映射到限流、降級、重試、告警與資料正確性策略，避免 retry amplification。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Networking/http_status_codes.md)

---

### Q7: HTTP 版本與傳輸選擇
<!-- Concept ID: concept.network.http.protocol-evolution; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請用 incident 或設計情境說明此主題的核心機制、主要取捨，以及如何以觀測證據判斷故障方向。

<details>
<summary>💡 答案提示</summary>

- **LO-1**: 能比較 HTTP/1.1、HTTP/2、HTTP/3 的連線、串流、多路復用、頭部壓縮與傳輸邊界。
- **LO-2**: 能依封包遺失、延遲、連線數、部署支援、MTU 與 fallback 成本選擇版本。
- **LO-3**: 能從 handshake、stream reset、flow control、TCP loss、QUIC path 與 HOL 症狀定位版本問題。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Networking/http_versions_comparison.md)

---

### Q8: HTTPS TLS 握手與憑證排錯
<!-- Concept ID: concept.network.tls.handshake-security; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請用 incident 或設計情境說明此主題的核心機制、主要取捨，以及如何以觀測證據判斷故障方向。

<details>
<summary>💡 答案提示</summary>

- **LO-1**: 能說明 TLS handshake、伺服器身份驗證、金鑰交換、對稱加密與完整性保護。
- **LO-2**: 能比較憑證鏈、SNI、TLS 版本、cipher、session resumption 與 mTLS 的安全和效能取捨。
- **LO-3**: 能從憑證過期、trust chain、SNI、handshake latency、alert 與 client 差異設計排錯流程。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Networking/https_tls_ssl.md)

---

### Q9: 負載均衡與流量轉移
<!-- Concept ID: concept.network.load-balancing.traffic-distribution; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請用 incident 或設計情境說明此主題的核心機制、主要取捨，以及如何以觀測證據判斷故障方向。

<details>
<summary>💡 答案提示</summary>

- **LO-1**: 能比較 L4／L7 負載均衡、round robin、least connection、hash、健康檢查與 draining。
- **LO-2**: 能評估 sticky session、連線重用、重試、zone failure、權重與 backend capacity 的取捨。
- **LO-3**: 能從 backend skew、queue、health check、connection state 與錯誤分布設計安全的流量轉移。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Networking/load_balancing_strategies.md)

---

### Q10: 長輪詢 SSE 與 WebSocket 選擇
<!-- Concept ID: concept.network.realtime.push-transport-selection; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請用 incident 或設計情境說明此主題的核心機制、主要取捨，以及如何以觀測證據判斷故障方向。

<details>
<summary>💡 答案提示</summary>

- **LO-1**: 能比較長輪詢、SSE 與 WebSocket 的資料方向、連線生命週期、代理相容性與延遲。
- **LO-2**: 能評估 fan-out、重連、heartbeat、慢客戶端、背壓、buffer 與 fd 成本。
- **LO-3**: 能在長連線資源緊張或代理不支援時設計可觀測、可降級、可恢復的傳輸策略。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Networking/long_polling_sse_vs_websocket.md)

---

### Q11: 網路效能瓶頸與容量推理
<!-- Concept ID: concept.network.performance.latency-throughput; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請用 incident 或設計情境說明此主題的核心機制、主要取捨，以及如何以觀測證據判斷故障方向。

<details>
<summary>💡 答案提示</summary>

- **LO-1**: 能拆解傳播、傳輸、處理、排隊延遲，並區分 latency、throughput、loss、jitter 與可用性。
- **LO-2**: 能依 bandwidth-delay product、封包大小、批次、壓縮、連線重用與 queue 取捨優化。
- **LO-3**: 能從 p50／p99、RTT、retransmission、queue、bytes 與 per-hop trace 定位瓶頸。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Networking/network_performance_optimization.md)

---

### Q12: 網路攻擊與資源防護
<!-- Concept ID: concept.network.security.attack-mitigation; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請用 incident 或設計情境說明此主題的核心機制、主要取捨，以及如何以觀測證據判斷故障方向。

<details>
<summary>💡 答案提示</summary>

- **LO-1**: 能辨識 volumetric、protocol、application、SYN flood、XSS、CSRF 與注入的資源耗盡路徑。
- **LO-2**: 能比較 anycast／清洗、WAF、rate limit、challenge、驗證、隔離與誤殺成本。
- **LO-3**: 能在攻擊與合法尖峰混合時，以來源、租戶、端點與資源層級設計分層防禦和回復。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Networking/network_security_attacks.md)

---

### Q13: OSI 與 TCPIP 分層排錯
<!-- Concept ID: concept.network.model.layer-mapping; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請用 incident 或設計情境說明此主題的核心機制、主要取捨，以及如何以觀測證據判斷故障方向。

<details>
<summary>💡 答案提示</summary>

- **LO-1**: 能將常見協定與故障症狀映射到 OSI／TCP-IP 層次，並說明每層的輸入輸出。
- **LO-2**: 能解釋分層抽象的邊界、封裝／解封裝與跨層最佳化的觀測限制。
- **LO-3**: 能以 DNS、TLS、HTTP、TCP、socket 與 host metrics 排除錯誤歸因，而非只背層級名稱。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Networking/osi_vs_tcpip_model.md)

---

### Q14: 正向代理與反向代理邊界
<!-- Concept ID: concept.network.proxy.forward-reverse; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請用 incident 或設計情境說明此主題的核心機制、主要取捨，以及如何以觀測證據判斷故障方向。

<details>
<summary>💡 答案提示</summary>

- **LO-1**: 能分辨正向代理與反向代理代表的對象、信任邊界、流量方向與可見身份。
- **LO-2**: 能評估 X-Forwarded-*、TLS termination、upstream connection pool、buffer、timeout 與 retry。
- **LO-3**: 能從多層 proxy 的 request ID、header、queue、backend error 與 client disconnect 定位故障。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Networking/proxy_vs_reverse_proxy.md)

---

### Q15: RESTful 與 gRPC 韌性選擇
<!-- Concept ID: concept.network.api.rest-grpc-selection; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請用 incident 或設計情境說明此主題的核心機制、主要取捨，以及如何以觀測證據判斷故障方向。

<details>
<summary>💡 答案提示</summary>

- **LO-1**: 能比較 REST 資源語意、HTTP cache 與 gRPC RPC、protobuf、streaming 的模型差異。
- **LO-2**: 能依 schema evolution、錯誤映射、deadline、retry、idempotency 與觀測能力選擇介面。
- **LO-3**: 能在下游 timeout／partial failure 中設計不重複副作用且可降級的 API 互動。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Networking/restful_vs_grpc.md)

---

### Q16: TCP 可靠傳輸與擁塞控制
<!-- Concept ID: concept.network.tcp.reliable-transport; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請用 incident 或設計情境說明此主題的核心機制、主要取捨，以及如何以觀測證據判斷故障方向。

<details>
<summary>💡 答案提示</summary>

- **LO-1**: 能說明序號、ACK、滑動窗口、重傳、RTO 與資料重組如何提供可靠、有序傳輸。
- **LO-2**: 能區分接收窗口造成的流量控制與 cwnd、慢啟動、擁塞避免造成的擁塞控制。
- **LO-3**: 能從 RTT、retransmission、cwnd、zero-window、duplicate ACK 與 throughput 設計排錯。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Networking/tcp_reliable_transmission.md)

---

### Q17: TCP 與 UDP 傳輸選擇
<!-- Concept ID: concept.network.transport.protocol-selection; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請用 incident 或設計情境說明此主題的核心機制、主要取捨，以及如何以觀測證據判斷故障方向。

<details>
<summary>💡 答案提示</summary>

- **LO-1**: 能比較 TCP 與 UDP 的連線、可靠性、順序、資料邊界、流量控制與擁塞控制。
- **LO-2**: 能依延遲、MTU、遺失、排序、公平性、廣播／多播與應用複雜度選擇傳輸。
- **LO-3**: 能為採用 UDP 的設計補上序號、重排、重傳、速率、放大防護與可觀測性責任。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Networking/tcp_vs_udp.md)

---

### Q18: WebSocket 長連線生命週期
<!-- Concept ID: concept.network.websocket.connection-lifecycle; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請用 incident 或設計情境說明此主題的核心機制、主要取捨，以及如何以觀測證據判斷故障方向。

<details>
<summary>💡 答案提示</summary>

- **LO-1**: 能追蹤 HTTP upgrade、WebSocket frame、ping／pong、close code 與 half-open connection。
- **LO-2**: 能評估 proxy、負載均衡、sticky state、heartbeat、慢客戶端、buffer 與 reconnect。
- **LO-3**: 能從連線數、fd、close code、queue、heartbeat 與 backpressure 設計可恢復的即時服務。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Networking/websocket_protocol.md)
