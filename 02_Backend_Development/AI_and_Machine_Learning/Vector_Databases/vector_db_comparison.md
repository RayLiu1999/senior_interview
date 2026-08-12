# 主流向量資料庫對比與選型

- **難度**: 7
- **重要程度**: 4
- **標籤**: `向量資料庫`, `選型`, `Pinecone`, `Milvus`, `Weaviate`, `Qdrant`

## 問題詳述

市場上有眾多向量資料庫產品，從雲端服務到開源方案，從 PostgreSQL 擴展到專用資料庫。如何根據業務需求、規模、預算選擇合適的向量資料庫，是構建 AI 應用的重要決策。

## 核心理論與詳解

### 測驗對應

- **Concept ID**: `concept.ai.vector-database.selection`
- **Learning Objectives**:
  - `LO-1`: 能夠依資料量、QPS、延遲與查詢需求比較 pgvector、Qdrant、Weaviate、Milvus 與 Pinecone。
  - `LO-2`: 能夠將預算、託管程度、團隊運維能力與既有 PostgreSQL 整合需求轉換為選型判斷。
  - `LO-3`: 能夠說明選型對效能、擴展性、成本、供應商鎖定與運維複雜度的影響，並提出驗證方案。
- **Quick Quiz**: [Quick Quiz Q7](../../../QUIZ/02_AI_and_Machine_Learning.md#q7)
- **Hard Assessment**: [AI／Node.js／Microservice Resilience Incident](../../../QUIZ/Hard_Assessments/ai_node_microservice_resilience_incident.md) (`assessment.ai-node-microservice.resilience-incident.v1`)

### 主流產品對比表

| 產品 | 類型 | 授權 | 語言 | 特色 |
|------|------|------|------|------|
| **Pinecone** | 雲端服務 | 商業 | - | 完全託管、易用 |
| **Milvus** | 開源+商業 | Apache 2.0 | Go | 高效能、分散式 |
| **Weaviate** | 開源+商業 | BSD-3 | Go | 語義搜尋、模組化 |
| **Qdrant** | 開源+商業 | Apache 2.0 | Rust | 高效能、簡潔 API |
| **pgvector** | 擴展 | PostgreSQL | C | 整合 PG、SQL 查詢 |

### 選型決策框架

#### 按數據規模

| 規模 | 推薦 | 原因 |
|------|------|------|
| < 10 萬 | pgvector | 成本低、簡單 |
| 10-100 萬 | Qdrant, pgvector | 平衡效能和成本 |
| 100 萬-1000 萬 | Qdrant, Weaviate, Pinecone | 中等規模最優 |
| > 1000 萬 | Milvus, Pinecone | 專為大規模設計 |
| > 1 億 | Milvus | 分散式架構 |

#### 按預算

- **最低**：pgvector（利用現有 PostgreSQL）
- **低**：自建 Qdrant/Milvus
- **中**：Weaviate Cloud, Zilliz Cloud
- **高**：Pinecone（完全託管）

## 總結

選擇向量資料庫需考慮數據規模、QPS 需求、預算、團隊能力等因素。小規模用 pgvector，中型用 Qdrant，大規模用 Milvus，快速原型用 Pinecone。

## 延伸閱讀

- [Pinecone Documentation](https://docs.pinecone.io/)
- [Milvus Documentation](https://milvus.io/docs)
- [Vector Database Benchmarks](https://github.com/erikbern/ann-benchmarks)
