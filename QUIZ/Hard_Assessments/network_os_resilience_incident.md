# Network + Operating System Resilience Incident：跨層故障診斷與容量取捨

- **Assessment ID**: `assessment.network-os.resilience-incident.v1`
- **主要 Concept IDs**: `concept.network.performance.latency-throughput`, `concept.network.tcp.reliable-transport`, `concept.operating-system.io-models.model-selection`, `concept.operating-system.filesystem.inode-descriptor`
- **次要 Concept IDs**: `concept.network.cdn.cache-routing`, `concept.network.http.session-authentication`, `concept.network.http.cors-origin-policy`, `concept.network.dns.resolution-caching`, `concept.network.http.status-semantics`, `concept.network.http.protocol-evolution`, `concept.network.tls.handshake-security`, `concept.network.load-balancing.traffic-distribution`, `concept.network.realtime.push-transport-selection`, `concept.network.security.attack-mitigation`, `concept.network.model.layer-mapping`, `concept.network.proxy.forward-reverse`, `concept.network.api.rest-grpc-selection`, `concept.network.transport.protocol-selection`, `concept.network.websocket.connection-lifecycle`, `concept.network.tcp.connection-management`, `concept.operating-system.cpu.context-switch-cost`, `concept.operating-system.memory.copy-on-write`, `concept.operating-system.concurrency.coroutine-scheduling`, `concept.operating-system.memory.garbage-collection`, `concept.operating-system.memory.allocator-fragmentation`, `concept.operating-system.io.mmap-memory-mapping`, `concept.operating-system.cpu.process-scheduling`, `concept.operating-system.kernel.system-call-boundary`, `concept.operating-system.process-thread.concurrency-model`, `concept.operating-system.ipc.mechanism-selection`, `concept.operating-system.deadlock.prevention-avoidance`, `concept.operating-system.virtual-memory.paging`, `concept.operating-system.io-multiplexing.epoll-select-poll`, `concept.operating-system.disk-io.zero-copy`, `concept.operating-system.thread-synchronization.lock-selection`
- **題型**: `跨層 incident response`, `故障樹`, `容量推理`, `協定選擇`, `復原設計`
- **難度**: 10
- **重要程度**: 5
- **預估時間**: 75 分鐘

## 測驗目標

本測驗要求候選人把網路協定、傳輸行為、代理與 API 介面，連同作業系統的 CPU、記憶體、檔案描述符與 I/O 資源，串成一條可驗證的故障鏈。重點不是背誦名詞，而是能從有限觀測資料提出可反駁的假設、估算容量、選擇安全的緩解順序，並說明每個取捨。

完成後應能：

- 從 DNS、CDN、TLS、Proxy、Load Balancer、HTTP、TCP 到應用程式，定位延遲、重試、斷線與錯誤率的主要來源。
- 從排程、上下文切換、I/O 多路復用、系統調用、記憶體映射、COW、GC、allocator、檔案描述符與 inode，解釋同一個網路症狀如何被主機資源放大。
- 將協定語意、重試與冪等性、連線生命週期、背壓與容量限制放在同一個復原方案中評估。
- 用可觀測證據驗證修復效果，並定義何時回滾、何時限流、何時才值得調整核心或增加資源。

## Learning Objective 覆蓋對照

下表列出本批新增文章的全部 Learning Objectives。每一列的 `LO-1`、`LO-2`、`LO-3` 均必須在作答中以分析、證據或設計決策呈現。

### Networking

| Concept ID | 對應文章 | LO-1 | LO-2 | LO-3 |
|---|---|---|---|---|
| `concept.network.cdn.cache-routing` | [CDN 原理與應用](../../01_Computer_Science_Fundamentals/Networking/cdn_principles_and_applications.md) | 追蹤快取命中、miss、回源與 cache key | 比較 TTL、驗證、失效、stale 與一致性代價 | 由命中率下降與源站飽和設計復原順序 |
| `concept.network.http.session-authentication` | [Cookie vs Session vs Token](../../01_Computer_Science_Fundamentals/Networking/cookie_session_token.md) | 比較 Cookie、Session、Token 的狀態位置與信任邊界 | 以 HttpOnly、Secure、SameSite、輪替與撤銷控制風險 | 在多區與重試故障中維持身份與可用性 |
| `concept.network.http.cors-origin-policy` | [跨域問題與解決方案](../../01_Computer_Science_Fundamentals/Networking/cors_and_cross_origin.md) | 判斷 origin、simple request 與 preflight 流程 | 區分瀏覽器策略、伺服器授權與 credentials 限制 | 從瀏覽器錯誤與 preflight 指標修正政策 |
| `concept.network.dns.resolution-caching` | [DNS 解析流程與優化](../../01_Computer_Science_Fundamentals/Networking/dns_resolution_and_optimization.md) | 描述遞迴解析、記錄、TTL 與快取層次 | 比較低 TTL、負快取、健康檢查與 failover 成本 | 從 stale／NXDOMAIN／解析延遲設計切換 |
| `concept.network.http.status-semantics` | [HTTP 狀態碼完整解析](../../01_Computer_Science_Fundamentals/Networking/http_status_codes.md) | 正確解讀 2xx、3xx、4xx、5xx 語意 | 區分可重試、不可重試、冪等與客戶端責任 | 將錯誤分類映射到安全的重試與降級 |
| `concept.network.http.protocol-evolution` | [HTTP/1.1 vs HTTP/2 vs HTTP/3](../../01_Computer_Science_Fundamentals/Networking/http_versions_comparison.md) | 比較連線、串流、多路復用、頭部壓縮與 QUIC | 依封包遺失、延遲、部署與 fallback 選協定 | 從 reset、握手與 HOL 症狀定位版本問題 |
| `concept.network.tls.handshake-security` | [HTTPS 與 TLS/SSL 原理](../../01_Computer_Science_Fundamentals/Networking/https_tls_ssl.md) | 說明憑證驗證、握手、金鑰交換與加密邊界 | 比較 session resumption、mTLS、版本與 cipher 取捨 | 從 SNI、信任鏈、過期與 handshake 指標排錯 |
| `concept.network.load-balancing.traffic-distribution` | [負載均衡策略與實現](../../01_Computer_Science_Fundamentals/Networking/load_balancing_strategies.md) | 比較 L4/L7、演算法、健康檢查與連線分布 | 評估 sticky session、draining、重試與 zone failure | 由 backend skew 與健康狀態設計流量轉移 |
| `concept.network.realtime.push-transport-selection` | [長輪詢、SSE 與 WebSocket 對比](../../01_Computer_Science_Fundamentals/Networking/long_polling_sse_vs_websocket.md) | 比較三種推播傳輸的連線與資料方向 | 評估重連、fan-out、背壓、代理與資源成本 | 由長連線數與慢客戶端設計降級方案 |
| `concept.network.performance.latency-throughput` | [網路效能優化策略](../../01_Computer_Science_Fundamentals/Networking/network_performance_optimization.md) | 拆解傳播、傳輸、處理、排隊延遲與吞吐量 | 依 BDP、封包遺失、批次、壓縮與連線重用取捨 | 從 p50/p99、RTT、loss 與 queue 定位瓶頸 |
| `concept.network.security.attack-mitigation` | [網路安全攻擊與防禦](../../01_Computer_Science_Fundamentals/Networking/network_security_attacks.md) | 辨識不同層級攻擊與資源耗盡路徑 | 比較限流、WAF、DDoS 清洗、驗證與誤殺成本 | 在攻擊與正常尖峰混合時維持可用性 |
| `concept.network.model.layer-mapping` | [OSI 模型 vs TCP/IP 模型](../../01_Computer_Science_Fundamentals/Networking/osi_vs_tcpip_model.md) | 將症狀映射到協定棧層級 | 說明分層邊界與跨層觀測的限制 | 以分層證據排除錯誤歸因 |
| `concept.network.proxy.forward-reverse` | [正向代理 vs 反向代理](../../01_Computer_Science_Fundamentals/Networking/proxy_vs_reverse_proxy.md) | 分辨代理角色、信任邊界與流量方向 | 評估 header、TLS termination、pool、timeout 與 buffering | 由 proxy chain 與 upstream 症狀定位故障 |
| `concept.network.api.rest-grpc-selection` | [RESTful API vs gRPC](../../01_Computer_Science_Fundamentals/Networking/restful_vs_grpc.md) | 比較資源語意、RPC、序列化與串流模型 | 評估 schema evolution、錯誤、deadline、重試與 idempotency | 在跨服務故障中選擇可恢復的 API 互動 |
| `concept.network.tcp.reliable-transport` | [TCP 可靠傳輸機制](../../01_Computer_Science_Fundamentals/Networking/tcp_reliable_transmission.md) | 說明序號、ACK、滑動窗口與重傳 | 區分流量控制、擁塞控制、RTO 與接收窗口 | 由 retransmission、cwnd、RTT 與 zero-window 排錯 |
| `concept.network.transport.protocol-selection` | [TCP vs UDP 對比與選擇](../../01_Computer_Science_Fundamentals/Networking/tcp_vs_udp.md) | 比較可靠性、順序、連線與資料邊界 | 依延遲、MTU、擁塞、公平性與應用責任選擇 | 為 UDP 補上必要可靠性與反濫用控制 |
| `concept.network.websocket.connection-lifecycle` | [WebSocket 協定與應用](../../01_Computer_Science_Fundamentals/Networking/websocket_protocol.md) | 追蹤 upgrade、frame、ping/pong 與 close | 評估 proxy、負載均衡、session、heartbeat 與背壓 | 由 half-open、慢客戶端與 fd 使用設計復原 |

### Operating System

| Concept ID | 對應文章 | LO-1 | LO-2 | LO-3 |
|---|---|---|---|---|
| `concept.operating-system.cpu.context-switch-cost` | [上下文切換開銷](../../01_Computer_Science_Fundamentals/Operating_System/context_switch_overhead.md) | 說明保存／恢復執行上下文的成本 | 連結 cache、TLB、排程與 user/kernel 切換 | 由 context switch、run queue 與 p99 定位過度切換 |
| `concept.operating-system.memory.copy-on-write` | [Copy-on-Write](../../01_Computer_Science_Fundamentals/Operating_System/copy_on_write.md) | 說明共享頁、寫入 fault 與私有複製 | 比較 fork、snapshot、COW 與 RSS／page fault 代價 | 由 reload／fork 後記憶體放大設計復原 |
| `concept.operating-system.concurrency.coroutine-scheduling` | [協程原理](../../01_Computer_Science_Fundamentals/Operating_System/coroutine_principle.md) | 比較協程、OS thread 與 process 的調度邊界 | 評估 blocking、fairness、stack 與 runtime worker | 由 event loop starvation 與 runnable backlog 排錯 |
| `concept.operating-system.filesystem.inode-descriptor` | [文件系統原理](../../01_Computer_Science_Fundamentals/Operating_System/file_system_basics.md) | 說明 inode、dentry、file descriptor 與 link | 比較 page cache、持久性、fd 與 inode 容量 | 從 fd／inode 耗盡定位連線與檔案故障 |
| `concept.operating-system.memory.garbage-collection` | [垃圾回收機制](../../01_Computer_Science_Fundamentals/Operating_System/garbage_collection.md) | 比較 tracing、reference counting、分代與標記 | 評估 pause、throughput、heap、fragmentation 與回收頻率 | 由 GC pause、allocation rate 與 RSS 排錯 |
| `concept.operating-system.memory.allocator-fragmentation` | [內存分配算法](../../01_Computer_Science_Fundamentals/Operating_System/memory_allocation_algorithms.md) | 說明 free list、buddy、slab 與配置路徑 | 比較內外部碎片、arena、pool 與 locality | 區分 allocator 保留、working set 與真正 leak |
| `concept.operating-system.io.mmap-memory-mapping` | [mmap 記憶體映射](../../01_Computer_Science_Fundamentals/Operating_System/mmap_memory_mapping.md) | 說明 file-backed／anonymous mapping 與 page fault | 比較 shared/private、mmap、read/write 與 durability | 由 mapping、fault、dirty page 與回收壓力排錯 |
| `concept.operating-system.cpu.process-scheduling` | [進程調度算法](../../01_Computer_Science_Fundamentals/Operating_System/process_scheduling_algorithms.md) | 說明 throughput、latency、fairness 與 deadline 目標 | 比較 preemption、priority、starvation 與 time slice | 由 run queue、CPU steal 與優先級設計緩解 |
| `concept.operating-system.kernel.system-call-boundary` | [系統調用原理](../../01_Computer_Science_Fundamentals/Operating_System/system_call_mechanism.md) | 描述 user/kernel boundary、參數與返回路徑 | 評估 syscall 次數、批次、buffer 與 async I/O 成本 | 從 syscall profile 將網路症狀連回 OS 瓶頸 |

## 問題情境與限制條件

你值班的 `Edge Relay` 是一個提供檔案下載、REST API、gRPC 內部查詢與 WebSocket 即時通知的多租戶服務。它部署在三個區域，每個區域前方都有 DNS 流量導向、CDN、TLS termination、L7 reverse proxy 與 L4/L7 負載均衡。最近一次版本發布後，全球尖峰流量約為：

- 靜態與可快取內容約 40,000 requests/s；CDN hit ratio 從 96% 降到 55%，源站回源流量接近四倍。
- 不可快取 API 約 8,000 requests/s；失敗請求平均被客戶端或 proxy 重試兩次。寫入 API 必須保持冪等，不能用「全部重試」掩蓋錯誤。
- WebSocket 約 12,000 條長連線，另有少量 SSE 與長輪詢；尖峰時 disconnect、reconnect、499/408 明顯增加。
- P50 仍約 80 ms，但 P99 從 240 ms 升到 2.4 s；5xx 約 7%，其中 502/504 占大多數，部分客戶看到 429，瀏覽器則報 CORS 或 TLS 錯誤。

其中一台 8 vCPU、16 GB RAM 的 origin host 觀測到：

- open file descriptor 約 58,000，soft limit 為 65,536；`TIME_WAIT` 約 35,000，部分程序的長連線與短連線共用同一組資源。
- `SYN-RECV`、retransmission、RTT 與 upstream connection queue 同時上升，但三個區域的幅度不一致；某一個 backend pool 的流量明顯偏斜。
- CPU 使用率只有 65%，但 run queue、context switch、system call 次數與網卡 softirq 同時上升；少數 worker 的 event loop 長時間沒有處理新事件。
- 一次 worker reload／snapshot 後，RSS 從 4 GB 上升到 13 GB，minor page fault、dirty page 與 page reclaim 增加；GC pause 與 allocation rate 也升高。
- file descriptor、inode、socket、memory mapping、page cache 與 allocator 的指標尚未被同一套 dashboard 關聯，不能直接假設是單一「網路慢」或單一「記憶體 leak」。

限制條件：

1. 不能先關閉 TLS、放寬 CORS、移除認證或取消 DDoS 防護來換取短期成功率。
2. 不能把所有 4xx/5xx 都改成 200，也不能對非冪等寫入無條件 retry 或 hedge。
3. 不能只提出「加機器、加 timeout、加 connection pool」；每個動作都要說明受保護的資源、上限、失敗模式與回滾條件。
4. 必須優先恢復現有容量內的可用性與可觀測性，再提出長期架構調整。回答可以指出還需要哪些資料，但不能把未知資料當成已證實的根因。

## 作答要求

請以 incident review 的形式回答，至少包含以下內容：

1. **分層故障樹**：依 OSI/TCP-IP 層次，從 DNS／CDN、TLS、Proxy／LB、HTTP／API、TCP／UDP 到 OS 資源，列出至少三條互相競爭的根因鏈；每條都標示可支持與可反駁的證據。
2. **前十五分鐘的止血順序**：說明哪些流量應限流、快取、降級、排隊、斷路或切換區域；指出 HTTP status、重試、deadline、backpressure、WebSocket reconnect 與 CORS/TLS 政策如何保持正確。
3. **容量與協定推理**：使用題目數字估算 CDN miss 對 origin、連線與 fd 的影響，並說明 HTTP/1.1、HTTP/2、HTTP/3、TCP、UDP、SSE、長輪詢與 WebSocket 在此事故中的選擇與限制。
4. **OS 資源關聯**：解釋 context switch、排程、syscall、I/O multiplexing、file descriptor/inode、mmap、COW、GC 與 allocator 如何造成或放大 p99、RSS、連線與回收壓力；明確區分相關性與因果性。
5. **修復與驗證計畫**：提出短期、中期、長期三階段方案，每一項指定 dashboard／trace／packet／host evidence、成功門檻、風險與 rollback signal。
6. **決策取捨**：至少比較兩個看似合理但可能有副作用的方案，例如降低 DNS TTL、增加 retry、切換 HTTP/3、擴大 fd limit、啟用 connection pooling 或改用 mmap，並說明何時不應採用。

## 期待證據

| 層次 | 必須檢查的證據 | 用途 |
|---|---|---|
| DNS／CDN | resolver latency、NXDOMAIN／SERVFAIL、TTL、各 POP hit/miss、cache key、origin bytes | 區分解析失敗、快取失效與回源放大 |
| TLS／Proxy／LB | handshake time、SNI／憑證錯誤、protocol version、upstream queue、health check、backend skew、draining、timeout | 區分握手成本、代理排隊、錯誤路由與單區過載 |
| HTTP／API | status 分布、request ID、method、idempotency key、retry count、deadline、CORS preflight、gRPC status／stream reset | 判斷錯誤責任、重試放大與 API 語意是否被破壞 |
| TCP／UDP | SYN backlog、SYN-RECV、ESTABLISHED、TIME_WAIT、RTT、cwnd、retransmission、zero-window、MTU／fragment、UDP loss | 區分連線建立、傳輸可靠性、擁塞與應用層責任 |
| 長連線 | WebSocket upgrade／close code、ping/pong、SSE reconnect、長輪詢等待數、慢客戶端 buffer、fd per connection | 判斷 half-open、背壓、代理 timeout 與 fd 耗盡 |
| CPU／排程 | per-core CPU、run queue、context switch、softirq、syscall profile、scheduler latency、thread／coroutine runnable backlog | 區分 CPU 飽和、過度切換、核心工作與 event loop starvation |
| 記憶體／I/O | RSS／working set、minor／major fault、dirty page、page reclaim、mmap map count、COW fault、GC pause、allocation／free、allocator arena | 區分 leak、COW 放大、page cache、GC 與 allocator 保留 |
| 檔案與容量 | open fd、socket／file／epoll fd、inode、fd limit、ephemeral port、page cache、disk queue、I/O latency | 驗證資源上限是否是根因或只是結果 |

## 評分規準

每個構面以 0–4 分評分，總分 20 分。評分時要求候選人說明假設、證據、取捨與回滾，而不是只列出工具名稱。

| 構面 | 4 分 | 3 分 | 2 分 | 1 分 | 0 分 |
|---|---|---|---|---|---|
| 網路分層與協定推理 | 能把 DNS、CDN、TLS、Proxy/LB、HTTP、TCP/UDP、WebSocket 症狀串成可驗證故障樹，並正確處理協定語意 | 大致正確分層，能提出主要證據與一項取捨 | 能描述名詞和單點原因，但缺乏競爭假設或跨層連結 | 只列工具或把所有問題歸因於網路 | 無法說明請求如何流動 |
| OS 資源與因果分析 | 能把排程、context switch、syscall、fd/inode、mmap/COW、GC、allocator 與症狀建立因果與反證 | 能正確解釋主要 OS 資源並提出驗證方式 | 只掌握部分資源，相關性與因果性混用 | 以「CPU／記憶體不夠」概括 | 無 OS 分析 |
| 容量、背壓與安全恢復 | 能估算 miss、重試、連線與 fd 放大，提出限流、cache、retry、deadline、降級與安全政策的協同方案 | 有合理容量估算和止血順序，主要副作用可控 | 有止血動作但沒有上限、冪等或背壓 | 只會加 timeout、retry 或資源 | 提議破壞 TLS、認證或資料正確性 |
| 證據、修復與回滾 | 每個動作都有可觀測證據、成功門檻、風險和 rollback signal，且分短中長期 | 有大部分驗證與回滾條件 | 有修復方向但證據或門檻不完整 | 以猜測直接改設定 | 沒有可執行方案 |
| 溝通與取捨 | 能清楚區分已知、未知、假設與決策，並比較至少兩個替代方案 | 能說明主要取捨 | 只描述單一路徑 | 回答散亂或只背誦定義 | 無法形成決策 |

### 通過標準

- 總分至少 **15/20**，且前四個核心構面（網路、OS、容量恢復、證據修復）各至少 **3/4**。
- 必須明確處理 `CDN miss → origin load`、`retry amplification`、長連線／fd 上限，以及 `COW／memory pressure` 四條放大鏈；漏掉任一條，不能判定通過。
- 必須提出至少一個能在現有容量內降低風險的止血動作，以及一個可回滾的驗證步驟。

## 參考答案與詳解

### 1. 先建立競爭假設

合理的第一版結論不是單一根因，而是至少存在兩條互相放大的鏈：

1. **快取與重試放大鏈**：CDN hit ratio 從 96% 降到 55%，40,000 requests/s 的 miss 由約 1,600/s 增至約 18,000/s；源站流量增加，再加上 8,000 requests/s API 失敗後平均兩次 retry，Proxy queue、TLS／TCP 連線與 fd 都可能被推高。應先用 POP、cache key、TTL、origin bytes、retry count 與 request ID 證實，而不能直接把所有 502 歸咎於 TCP。
2. **連線與傳輸鏈**：`SYN-RECV`、RTT、retransmission、upstream queue 同升，可能是 backlog、單一 backend pool 偏斜、封包遺失、擁塞或代理 timeout；`TIME_WAIT` 多則可能是短連線 churn 的結果，也可能進一步消耗 ephemeral port。要以 packet／socket state、每區域與每 backend 的對照來區分。
3. **長連線與 OS 資源鏈**：WebSocket、SSE、長輪詢都長時間占用 socket/fd；慢客戶端若沒有背壓，buffer 和 fd 會持續累積。event loop starvation、context switch、softirq、syscall 變多會延長處理時間，讓更多請求逾時，形成回壓與 retry 迴圈。
4. **記憶體與 reload 鏈**：worker reload／snapshot 後 RSS 從 4 GB 升到 13 GB，若共享頁被寫入，COW fault 會把原先共享的記憶體複製成多份；同時 allocation rate、GC pause、dirty page 與 reclaim 增加，可能讓延遲升高。這不能只用「有 leak」解釋，應比較 private dirty、working set、mapping 與 allocation profile。

OSI/TCP-IP 模型的用途是縮小搜尋範圍：CORS、HTTP status、gRPC reset 是應用／表示層語意；TLS、HTTP/2、HTTP/3 與 Proxy 是中間層；TCP retransmission、window、SYN backlog 是傳輸／網路層；fd、排程、page fault、syscall 是主機邊界。分層不是把問題隔離，而是避免把上層重試誤認為下層丟包。

### 2. 前十五分鐘止血

1. 先凍結會改變 cache key、連線策略與 retry policy 的發布，保留 request ID、status、protocol、backend、區域與 retry 次數。若某區域 backend health 或 queue 已異常，先以健康檢查與連線 draining 將流量移向健康區域，不直接把不健康節點標成 healthy。
2. 對可公開快取內容恢復正確的 cache key、TTL 與 stale-if-error／stale-while-revalidate（若業務允許），避免把個人化或帶身份的回應錯誤快取。必要時只對靜態、可驗證內容限速回源，不能用全域 purge 造成更大的 thundering herd。
3. 取消非冪等請求的無條件 retry；對可重試的 502/503/504 以 deadline、指數退避、jitter、次數上限和 idempotency key 控制。`429` 必須帶有清楚的限流語意，`4xx` 不應被 retry 風暴重新放大；`499/408` 要與 client disconnect／timeout 分開觀察。
4. 對 WebSocket／SSE／長輪詢設定每租戶連線上限、慢客戶端 buffer 上限、heartbeat、idle timeout 與 reconnect backoff；保留必要通知資料的重放游標，短期可把低優先級即時功能降級成 polling。不能用無限延長 timeout 來隱藏 fd 與背壓問題。
5. 保持 TLS、CORS、認證與 WAF 規則不變，只針對已確認的合法 origin、SNI、憑證鏈或 preflight cache 做最小修正。若觀測到攻擊流量，先在邊緣做限速／清洗，避免把攻擊流量帶進 origin。

### 3. 容量與協定取捨

- CDN miss 增加約 16,400 requests/s；若每個 miss 都需要 origin round trip，源站的 request、TLS／proxy queue、socket 與 page cache 壓力會同步增加。要先確認內容大小、連線重用和 origin fan-out，不能只用 requests/s 推算頻寬。
- HTTP/1.1 可能因每連線請求併發和 head-of-line 行為造成更多 connection churn；HTTP/2 可用多路復用減少連線，但單一 TCP 遺失仍可能影響多個 stream，且過度共用連線可能形成 stream queue；HTTP/3/QUIC 能降低 TCP 層 HOL 的影響，但仍需支付握手、UDP path、MTU、proxy／WAF 支援和觀測複雜度。事故中應先以 canary 和 per-version metrics 驗證，不直接全量切換。
- TCP 適合需要順序、可靠與擁塞控制的 API、檔案和 WebSocket；UDP 只有在應用能自行處理序號、遺失、重排、速率、公平性、MTU 與放大風險時才適合。不能因為 TCP retransmission 上升就把可靠 API 改成 UDP。
- REST 適合可快取、可觀測、資源導向的外部 API；gRPC 適合內部 typed contract、串流與 deadline，但兩者都要定義錯誤映射、版本相容、冪等與重試邊界。SSE 單向推播較容易經過 HTTP 基礎設施；WebSocket 適合雙向低延遲，但長期占用 fd、需要 heartbeat 和背壓；長輪詢可作降級，代價是請求 churn。

### 4. OS 資源的驗證方向

- `CPU 65%` 不代表沒有 CPU bottleneck：若單核心 softirq、event loop 或高優先級 worker 飽和，平均 CPU 仍可能不高。比較 per-core、run queue、scheduler latency、context switch、syscall、softirq 與 runnable coroutine/thread，才能判斷是否過度切換或 blocking。
- fd limit、socket、epoll fd、inode 與 ephemeral port 要按程序、區域、連線類型拆開看。增加 `ulimit` 只能延後上限，不能修復未關閉 socket、half-open connection、慢客戶端或 retry churn；若提高上限，必須同步檢查核心記憶體與監控告警。
- mmap、page cache 與 COW 會讓 RSS、minor fault、dirty page 和 reclaim 一起變化。reload 後 private dirty 上升支持 COW 放大；只有 RSS 上升而 working set 不升，可能是 allocator 保留或 page cache；持續增加的 live allocation、不可達物件或 reference chain 才支持 leak。
- GC pause 和 allocator contention 會延長 request critical path；降低 GC 觸發比例、重用 buffer 或調整 arena 需以 allocation profile 和 pause percentile 驗證，不能把 GC 調參當成網路修復。系統調用、copy、read/write、poll／epoll 等 profile 可判斷是否有過多小 I/O 或錯誤的 I/O 模型。

### 5. 三階段修復與驗證

**短期（止血）**：凍結變更；恢復可驗證的 CDN cache policy；移除無界 retry；對 API／長連線設置 rate、concurrency、deadline、buffer 和 reconnect 上限；依健康檢查做區域 draining；補上 per-core、fd、socket、retry、cache、protocol、GC／fault dashboard。成功條件是 P99、5xx、origin bytes、fd 使用率、retransmission 與 reconnect 在固定窗口內下降，任一資源接近上限就回滾流量策略。

**中期（修復邊界）**：將不同租戶、長連線與短請求拆分資源池；確認 proxy／LB connection reuse、HTTP version、TLS resumption、CORS／auth cache 和 API idempotency；改善 event loop 的 blocking isolation、I/O batching、backpressure、socket cleanup 和 graceful draining；為 reload／snapshot 追蹤 COW private dirty。用壓測重現 cache miss、慢客戶端、封包遺失、client disconnect、backend failover，驗證每條 failure path。

**長期（容量與架構）**：建立以 bytes、connections、fd、CPU queue、memory working set、GC pause、syscall、retransmission 和 origin fan-out 為基礎的容量模型；用分區限流、邊緣清洗、可重放事件、可觀測的 protocol canary 和自動 rollback 降低 blast radius。只有在根因與安全邊界清楚後，才調整 fd、TCP backlog、HTTP/3、mmap 或 allocator 參數。

## 常見失分點

- 把 CDN hit ratio 下降、retry amplification、長連線 fd 耗盡、COW／memory pressure 混成一個「伺服器不夠快」的結論。
- 看到 `TIME_WAIT` 就直接關閉保護或調大所有核心參數，沒有先區分短連線 churn、主動關閉方向與 ephemeral port。
- 以增加 timeout、retry、connection pool 或 HTTP/3 作為萬用解答，卻沒有上限、deadline、冪等、背壓與回滾條件。
- 將 CORS、TLS、HTTP status 或 gRPC error 視為「前端問題」，忽略它們可能是錯誤路由、認證快取、代理設定或重試策略的證據。
- 將 RSS 上升直接判定為 memory leak，沒有比較 working set、private dirty、page cache、mapping、GC heap、allocator retained bytes 與 live allocation。
- 只看平均 CPU，忽略 per-core saturation、run queue、softirq、context switch、syscall、event loop starvation，以及 I/O 等待造成的低 CPU 高延遲。
- 提議把可靠 API 改成 UDP、把 WebSocket 無限延長、把所有回應改成 200，或關閉安全檢查來換取表面成功率。

## 延伸追問

1. 如果 CDN hit ratio 恢復但 P99 不變，你會如何利用 TCP、Proxy、syscall、排程與 GC 證據縮小範圍？
2. 如果只有 HTTP/2 P99 惡化而 HTTP/1.1 正常，你會檢查 stream concurrency、flow control、connection coalescing、header compression 還是 backend queue？為什麼？
3. 如果切換到 HTTP/3 後封包遺失區域改善但 CPU 和 UDP drops 上升，你會如何設計 canary、fallback 和容量上限？
4. 如果 `fd` 使用率下降但 WebSocket reconnect 仍升高，如何區分 proxy idle timeout、heartbeat、client backoff、TLS session resumption 與應用 close code？
5. 如果 RSS 只在 worker reload 後上升，怎麼用 COW fault、private dirty、mmap、allocator 和 GC evidence 判斷是預期成本還是 leak？
6. 何時應使用 SSE 或長輪詢取代 WebSocket？請以代理相容性、單向性、重連、fd、背壓和資料重放說明。
7. 若 API 需要跨區寫入且下游偶爾 504，你如何以 idempotency key、deadline、outbox／重放與 status mapping 避免重複副作用？
8. 哪些指標應成為自動 rollback 的 guardrail？請至少列出網路、應用和 OS 各兩項，並說明誤報處理方式。
