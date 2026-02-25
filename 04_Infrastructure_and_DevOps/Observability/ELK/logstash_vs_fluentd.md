# Logstash vs Fluentd (日誌收集器對比)

- **難度**: 5
- **標籤**: `Logstash`, `Fluentd`, `Logging`, `Comparison`

## 問題詳述

Logstash 和 Fluentd 都是流行的日誌收集與處理工具。請對比它們的架構、性能、生態系統，並說明在 Kubernetes 環境下為什麼 Fluentd (或 Fluent Bit) 更受歡迎？

## 核心理論與詳解

這兩者都扮演著 **Shipper** (採集) 和 **Parser** (解析) 的角色，但設計哲學不同。

### 1. 架構與語言

| 特性 | Logstash | Fluentd |
| :--- | :--- | :--- |
| **開發語言** | JRuby (運行在 JVM 上) | Ruby (核心) + C (性能關鍵部分) |
| **資源消耗** | **高** (JVM 啟動慢，內存佔用大) | **中** (比 Logstash 輕量，但比 Fluent Bit 重) |
| **依賴** | 需要安裝 JDK | 僅依賴 Ruby 環境 (通常打包在鏡像中) |
| **事件模型** | 簡單的隊列 (Sized Queue) | 標籤路由 (Tag-based Routing) |

### 2. 生態系統與插件

- **Logstash**:
  - 背靠 Elastic 公司，與 ES、Kibana 整合度最高。
  - 插件數量極其豐富 (Input/Filter/Output)。
  - 擅長複雜的數據處理 (如 Grok 正則解析、GeoIP 轉換)。
- **Fluentd**:
  - CNCF 畢業項目 (Graduated Project)，雲原生領域的標準。
  - 插件生態也非常活躍，特別是對 Docker/Kubernetes 的支持更好。
  - 擁有一個超輕量級的兄弟項目：**Fluent Bit** (純 C 語言編寫，內存佔用 < 10MB)。

### 3. 為什麼 Kubernetes 偏愛 Fluentd / Fluent Bit？

在 K8s 環境中，通常採用 **DaemonSet** 方式部署日誌採集器 (每個節點一個 Pod)。

1. **資源效率**: Logstash 需要 JVM，每個節點跑一個 Logstash 會消耗大量內存 (例如 1GB+)，這在擁有 100 個節點的集群中是不可接受的。而 Fluent Bit 只需要幾 MB。
2. **Docker JSON Log 支持**: Fluentd 原生支持解析 Docker/Containerd 的 JSON 日誌格式，並能自動提取 K8s Metadata (Pod Name, Namespace, Labels)。
3. **緩衝機制**: Fluentd 擁有強大的 Buffer 機制 (File/Memory)，在網路不穩定時能保證日誌不丟失。

### 4. 常見組合模式

- **Logstash 獨大**: 傳統 VM 環境，機器數量少，邏輯複雜。
- **Fluentd 獨大**: K8s 環境，標準化日誌。
- **混合模式 (Fluent Bit + Fluentd/Logstash)**:
  - **Edge 端 (Node)**: 使用 **Fluent Bit** 進行輕量級採集。
  - **Aggregator 端 (Central)**: 使用 **Fluentd** 或 **Logstash** 進行複雜的過濾、聚合和轉發。

## 程式碼範例

(無程式碼，僅為對比分析)
