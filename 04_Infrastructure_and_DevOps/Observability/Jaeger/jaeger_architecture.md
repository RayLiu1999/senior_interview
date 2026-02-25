# Jaeger Architecture (Jaeger 架構)

- **難度**: 7
- **標籤**: `Jaeger`, `Tracing`, `Microservices`, `Architecture`

## 問題詳述

Jaeger 是 Uber 開源的分散式追蹤系統。請描述 Jaeger 的核心組件 (Agent, Collector, Query, Ingester) 及其在生產環境中的部署架構。

## 核心理論與詳解

Jaeger 的架構設計深受 Google Dapper 和 OpenZipkin 的影響。

### 1. 核心組件

1. **Jaeger Client (SDK)**:
    - 嵌入在應用程式中，負責創建 Spans 並將其發送給 Jaeger Agent。
    - **注意**: 現在推薦使用 **OpenTelemetry SDK** 替代 Jaeger Client，因為 Jaeger Client 已經停止維護 (Deprecated)。
2. **Jaeger Agent**:
    - 部署在每個主機 (Host) 或 Pod (Sidecar) 上的守護進程。
    - 負責接收 Client 發來的 UDP 數據包，進行批處理 (Batching) 和排隊，然後通過 TCP 發送給 Collector。
    - 作用：解耦 Client 和 Collector，屏蔽後端路由細節。
3. **Jaeger Collector**:
    - 核心後端組件，負責接收 Agent 發來的 Trace 數據。
    - 執行驗證、轉換、索引，並將數據寫入儲存後端 (Storage)。
4. **Storage (儲存)**:
    - Jaeger 支持多種儲存後端：
        - **Elasticsearch**: 生產環境首選，支持強大的搜索功能。
        - **Cassandra**: 適合超大規模寫入，但維護複雜。
        - **Kafka**: 作為中間緩衝區 (Collector -> Kafka -> Ingester -> Storage)。
        - **Memory**: 僅用於測試。
5. **Jaeger Query (UI)**:
    - 提供 Web 介面，供用戶搜索 Trace、查看瀑布圖 (Waterfall) 和依賴圖 (Dependency Graph)。
6. **Jaeger Ingester**:
    - 僅在使用 Kafka 模式時需要。它從 Kafka 讀取數據並寫入 Storage。

### 2. 部署架構模式

#### All-in-One (測試模式)

- 所有組件打包在一個二進制文件或 Docker 鏡像中，使用內存儲存。
- **適用**: 本地開發、演示。

#### Direct to Storage (生產模式 - 中小規模)

- Client -> Agent -> Collector -> Elasticsearch
- **優點**: 架構簡單。
- **缺點**: 如果寫入量激增，Collector 或 ES 可能扛不住，導致數據丟失。

#### Streaming with Kafka (生產模式 - 大規模)

- Client -> Agent -> Collector -> **Kafka** -> **Ingester** -> Elasticsearch
- **優點**:
  - **削峰填谷**: Kafka 作為緩衝區，保護資料庫。
  - **數據處理**: 可以在 Kafka 中對 Trace 數據進行流式處理 (如 Flink) 進行聚合分析。

### 3. 採樣 (Sampling)

Jaeger 支持多種採樣策略，通常在 Client 端或 Agent 端配置：

- **Constant**: 固定採樣 (如 100% 或 0%)。
- **Probabilistic**: 概率採樣 (如 0.1%)。
- **Rate Limiting**: 限流採樣 (如每秒最多 5 條)。
- **Remote**: 由 Collector 動態下發採樣策略 (最靈活)。

## 程式碼範例

(無程式碼，僅為架構說明)
