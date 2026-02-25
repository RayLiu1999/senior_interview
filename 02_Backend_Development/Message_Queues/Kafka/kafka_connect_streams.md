# Kafka Connect 和 Kafka Streams

- **難度**: 7
- **重要程度**: 3
- **標籤**: `Kafka`, `Kafka Connect`, `Kafka Streams`, `資料整合`, `流處理`

## 問題詳述

Kafka 生態系統中，**Kafka Connect** 和 **Kafka Streams** 是 Kafka 原生的兩個重要組件，分別解決**資料整合（Data Integration）**和**流處理（Stream Processing）**的問題，是構建資料管道和即時分析系統的核心工具。

## 核心理論與詳解

### Kafka Connect：資料整合框架

**Kafka Connect** 是一個可擴展、可靠的框架，用於在 Kafka 和外部系統之間**雙向傳輸資料**，無需編寫大量代碼。

**架構**：

```
外部系統（MySQL, S3, Elasticsearch...）
       ↕
  ┌──────────────────────────────────────┐
  │           Kafka Connect Cluster      │
  │  ┌─────────────┐  ┌───────────────┐  │
  │  │ Source      │  │  Sink         │  │
  │  │ Connector   │  │  Connector    │  │
  │  │（從外部讀取） │  │（寫入外部）   │  │
  │  └──────┬──────┘  └──────┬────────┘  │
  └─────────│─────────────────│──────────┘
            ↓                 ↑
         Kafka Topic       Kafka Topic
```

**核心概念**：
- **Connector**：管理與外部系統的整合邏輯（Source/Sink）
- **Task**：實際執行資料傳輸的工作單元（一個 Connector 可拆分多個 Task 並行）
- **Worker**：運行 Connector 和 Task 的 JVM 進程
- **Converter**：序列化/反序列化格式（JSON、Avro + Schema Registry、Protobuf）

**常用 Connector 生態**（Confluent Hub）：
- **Source**：JDBC（MySQL/PostgreSQL）、Debezium CDC、S3、REST API
- **Sink**：Elasticsearch、S3、BigQuery、HDFS、MongoDB

**典型使用場景**：
```
MySQL binlog（Debezium Source） → Kafka → Elasticsearch（Sink Connector）
                                       → S3（Sink Connector，資料湖）
                                       → ClickHouse（分析型資料庫）
```

**部署模式**：
- **Standalone**：單 Worker 進程，適合開發/測試
- **Distributed**（生產）：多 Worker 節點，自動負載均衡 Task，Worker 故障自動遷移

---

### Kafka Streams：輕量級流處理

**Kafka Streams** 是 Kafka 原生的**Java 流處理函式庫**（非獨立叢集），直接嵌入到應用程式中使用。

**與 Apache Flink/Spark Streaming 的差異**：

| 特性 | Kafka Streams | Apache Flink |
|------|--------------|-------------|
| 部署方式 | 嵌入業務應用（JVM 函式庫） | 獨立叢集 |
| 運維複雜度 | 低（隨應用 scale） | 高（需要獨立的 Flink 叢集） |
| 狀態存儲 | 本地 RocksDB + 備份到 Kafka | 分散式 State Backend |
| Exactly-Once | ✅（Kafka 端到端） | ✅ |
| 適用場景 | 中小規模即時處理 | 大規模、複雜流處理 |

**核心概念**：
- **KStream**：無限的事件流（類比資料庫的不可變 Append-only 日誌）
- **KTable**：最新狀態的物化視圖（類比資料庫的可更新資料表）
- **Topology**：有向無環圖，描述資料從 Source Topic 如何流經各 Processor 到 Sink Topic

**Kafka Streams 示例（字數統計）**：
```java
StreamsBuilder builder = new StreamsBuilder();

// 從 Kafka Topic 讀取
KStream<String, String> textLines = builder.stream("text-input");

// 流處理邏輯：分詞 → 分組 → 計數
KTable<String, Long> wordCounts = textLines
    .flatMapValues(line -> Arrays.asList(line.toLowerCase().split("\\s+")))
    .groupBy((key, word) -> word)
    .count(Materialized.as("counts-store")); // 狀態存在本地 RocksDB

// 結果寫回 Kafka Topic
wordCounts.toStream().to("word-count-output",
    Produced.with(Serdes.String(), Serdes.Long()));
```

**Kafka Streams 的 Exactly-Once（EOS）**：
```java
Properties props = new Properties();
props.put(StreamsConfig.PROCESSING_GUARANTEE_CONFIG, StreamsConfig.EXACTLY_ONCE_V2);
// 底層使用 Kafka 事務，確保「消費 + 處理 + 生產」的原子性
```

---

### 選型建議

| 需求 | 推薦方案 |
|------|---------|
| MySQL 資料同步到 Elasticsearch | Kafka Connect（Debezium Source + ES Sink） |
| 即時事件聚合、計算 | Kafka Streams（輕量）或 Apache Flink（複雜） |
| 跨系統批次資料遷移 | Kafka Connect |
| 需要與現有 Java 應用深度整合 | Kafka Streams |
| 多語言（Go/Python）流處理 | Flink（多語言 SDK）或 KSQL |
