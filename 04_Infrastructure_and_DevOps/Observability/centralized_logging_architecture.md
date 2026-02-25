# Centralized Logging Architecture (集中式日誌系統架構)

- **難度**: 6
- **標籤**: `Logging`, `Architecture`, `ELK`, `EFK`, `System Design`

## 問題詳述

在微服務架構中，服務分散在數十甚至數百個容器中，登入每台機器查看日誌是不可能的。如何設計一個高效、可擴展的集中式日誌系統？ELK 和 EFK 架構有什麼區別？

## 核心理論與詳解

集中式日誌系統的目標是：**收集 (Collect)** -> **傳輸 (Transport)** -> **儲存 (Store)** -> **分析 (Analyze)**。

### 1. 標準架構組件

一個完整的日誌系統通常包含以下四個部分：

1.  **Shipper (採集端)**: 部署在每個應用節點或容器中，負責讀取日誌並發送到緩衝區。
    - 常見工具: **Filebeat**, **Fluentd**, **Fluent Bit**, **Vector**。
    - 模式: Sidecar 模式 (每個 Pod 一個 Shipper) 或 DaemonSet 模式 (每個 Node 一個 Shipper)。
2.  **Buffer / Message Queue (緩衝區)**: 用於削峰填谷，防止日誌突增壓垮後端儲存。
    - 常見工具: **Kafka**, **Redis**, **RabbitMQ**。
3.  **Indexer / Parser (索引與解析)**: 從緩衝區讀取日誌，進行過濾、格式化 (如 JSON 解析)、脫敏，然後寫入儲存。
    - 常見工具: **Logstash**, **Fluentd**。
4.  **Storage & Visualization (儲存與視覺化)**:
    - 儲存: **Elasticsearch** (最主流), **Loki** (輕量級, 專注於標籤), **ClickHouse** (高效能 OLAP)。
    - 視覺化: **Kibana** (配 ES), **Grafana** (配 Loki/ES)。

### 2. 常見架構模式

#### ELK Stack (Elasticsearch + Logstash + Kibana)
- **流程**: App -> Filebeat -> Logstash -> Elasticsearch -> Kibana
- **優點**: 功能強大，Logstash 插件豐富。
- **缺點**: Logstash 資源消耗大 (JVM)，維護成本高。

#### EFK Stack (Elasticsearch + Fluentd + Kibana)
- **流程**: App -> Fluentd -> Elasticsearch -> Kibana
- **優點**: Fluentd (Ruby/C) 比 Logstash 輕量，是 Kubernetes 的標準日誌採集器。
- **變體**: 使用 **Fluent Bit** (C 語言，極輕量) 作為採集端，Fluentd 作為聚合端。

#### PLG Stack (Promtail + Loki + Grafana)
- **流程**: App -> Promtail -> Loki -> Grafana
- **優點**:
  - **成本低**: 不對全文建立索引，只對標籤 (Labels) 建立索引，儲存成本極低。
  - **整合好**: 與 Prometheus/Grafana 生態系完美整合。
- **適用場景**: 雲原生環境，對成本敏感，不需要全文檢索 (Full-text Search) 的場景。

### 3. 日誌處理最佳實踐

- **結構化日誌 (Structured Logging)**: 應用程式應直接輸出 **JSON** 格式，而非純文字。
  - ❌ `2023-10-01 12:00:00 [INFO] User 123 login success`
  - ✅ `{"timestamp": "2023-10-01T12:00:00Z", "level": "INFO", "event": "login_success", "user_id": 123}`
- **關聯 ID (Correlation ID)**: 在日誌中包含 `trace_id`，以便與分散式追蹤系統 (Jaeger) 關聯。
- **動態採樣 (Dynamic Sampling)**: 對於 DEBUG 級別日誌，在生產環境應動態開關或採樣，避免磁碟爆炸。

## 程式碼範例

(無程式碼，但提供 Fluent Bit 設定範例)

```ini
# Fluent Bit 配置範例：採集容器日誌並發送到 Elasticsearch

[SERVICE]
    Flush        1
    Log_Level    info

[INPUT]
    Name         tail
    Path         /var/log/containers/*.log
    Parser       docker
    Tag          kube.*

[FILTER]
    Name         kubernetes
    Match        kube.*
    Kube_URL     https://kubernetes.default.svc:443

[OUTPUT]
    Name         es
    Match        *
    Host         elasticsearch-master
    Port         9200
    Index        k8s-logs-%Y.%m.%d
    Type         _doc
```
