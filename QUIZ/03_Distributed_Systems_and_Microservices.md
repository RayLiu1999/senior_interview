# 分散式系統與微服務 (Distributed Systems & Microservices) - 重點考題 (Quiz)

> 這份考題從分散式系統理論和微服務架構中挑選出**重要程度 4-5** 的核心題目，設計成自我測驗的形式。
> 
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

## 🌐 分散式系統理論

### Q1: 什麼是 CAP 定理？如何做取捨？

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請解釋 CAP 定理的含義，以及在實際系統中如何選擇。

<details>
<summary>💡 答案提示</summary>

**CAP 定理**：
在分散式系統中，三者最多只能同時滿足兩個：
- **C (Consistency)**：所有節點看到相同的資料
- **A (Availability)**：每個請求都能得到響應
- **P (Partition Tolerance)**：網路分區時系統仍能運作

**網路分區無法避免，所以實際是 CP vs AP**：

| 類型 | 選擇 | 特點 | 例子 |
|------|------|------|------|
| CP | 一致性優先 | 分區時拒絕服務 | ZooKeeper, etcd, HBase |
| AP | 可用性優先 | 允許不一致 | Cassandra, DynamoDB |

**PACELC 延伸**：
當沒有分區時，還需要在 Latency 和 Consistency 間選擇。

**實務建議**：
- 金融交易：CP
- 社交媒體：AP
- 大多數系統：最終一致性 + 適當的衝突處理

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Distributed_Systems_Theory/cap_theorem_and_pacelc.md)

---

### Q2: 解釋不同的一致性模型

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9) | **重要性**: 🔴 必考

請解釋強一致性、最終一致性、因果一致性等概念。

<details>
<summary>💡 答案提示</summary>

**一致性模型光譜**（從強到弱）：

| 模型 | 保證 | 效能 | 例子 |
|------|------|------|------|
| **Linearizability** | 即時可見 | 最差 | 單機資料庫 |
| **Sequential Consistency** | 全局有序 | 差 | 某些分散式資料庫 |
| **Causal Consistency** | 因果關係保序 | 中等 | - |
| **Read-your-writes** | 讀到自己的寫入 | 較好 | Session 保證 |
| **Eventual Consistency** | 最終收斂 | 最好 | DynamoDB, S3 |

**強一致性 (Linearizability)**：
- 寫操作完成後，所有後續讀都返回新值
- 單一全局順序
- 代價：延遲高、可用性低

**最終一致性 (Eventual Consistency)**：
- 無新寫入時，最終所有副本一致
- 更高可用性和效能
- 需要處理讀到舊資料的情況

**實務選擇**：
- 庫存扣減：強一致
- 用戶頭像：最終一致
- 評論回覆：因果一致

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Distributed_Systems_Theory/consistency_models.md)

---

### Q3: Raft 共識演算法的原理

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ (10) | **重要性**: 🔴 必考

請解釋 Raft 的 Leader Election 和 Log Replication 機制。

<details>
<summary>💡 答案提示</summary>

**Raft 核心概念**：
- **Leader**：處理所有客戶端請求
- **Follower**：被動接受 Leader 的日誌
- **Candidate**：選舉期間的狀態

**Leader 選舉**：
1. Follower 超時未收到心跳 → 變成 Candidate
2. 增加 term，投票給自己
3. 請求其他節點投票
4. 獲得多數票 → 成為 Leader
5. Leader 定期發心跳維持地位

**Log Replication**：
1. 客戶端請求 → Leader
2. Leader 追加到本地 log
3. 發送 AppendEntries 給 Followers
4. 多數確認 → 提交 (commit)
5. 回覆客戶端

**安全性保證**：
- 投票限制：只投給 log 至少一樣新的 Candidate
- Log Matching：相同 index+term 則相同 entry

**應用**：
- etcd
- Consul
- TiKV
- CockroachDB

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Distributed_Systems_Theory/consensus_algorithms_raft_paxos.md)

---

## 🏗️ 微服務架構

### Q4: 單體架構 vs 微服務架構

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請比較單體架構和微服務架構的優缺點。

<details>
<summary>💡 答案提示</summary>

| 維度 | 單體架構 | 微服務架構 |
|------|----------|------------|
| 部署 | 整體部署 | 獨立部署 |
| 擴展 | 整體擴展 | 按服務擴展 |
| 技術棧 | 統一 | 可異構 |
| 開發效率 | 初期快 | 初期慢 |
| 運維複雜度 | 低 | 高 |
| 故障隔離 | 差 | 好 |

**何時用微服務**：
- 團隊規模大（>20 人）
- 系統複雜度高
- 需要獨立擴展
- 需要技術多樣性

**何時用單體**：
- 小團隊、新專案
- 業務邊界不清晰
- 不需要獨立部署

**微服務挑戰**：
- 分散式事務
- 服務間通信
- 資料一致性
- 監控和追蹤
- 運維成本

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Micro_Service/monolith_vs_microservices.md)

---

### Q5: 什麼是 API Gateway？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋 API Gateway 的作用和核心功能。

<details>
<summary>💡 答案提示</summary>

**API Gateway 定義**：
微服務架構的統一入口，處理跨領域關注點。

**核心功能**：

| 功能 | 說明 |
|------|------|
| 路由轉發 | 根據路徑轉發到對應服務 |
| 認證授權 | 統一處理身份驗證 |
| 限流熔斷 | 保護後端服務 |
| 負載均衡 | 分發請求 |
| 協議轉換 | HTTP → gRPC |
| 聚合請求 | 合併多個服務的響應 |
| 監控日誌 | 統一記錄 |

**常見產品**：
- **Kong**：基於 Nginx，插件豐富
- **Envoy**：雲原生，服務網格
- **AWS API Gateway**：託管服務
- **Spring Cloud Gateway**：Java 生態

**架構模式**：
```
Client → API Gateway → Service A
                    → Service B
                    → Service C
```

**注意事項**：
- 避免成為單點瓶頸
- 不要放太多業務邏輯

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Micro_Service/what_is_api_gateway.md)

---

### Q6: 分散式事務與 Saga 模式

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

如何在微服務架構中處理跨服務的事務？

<details>
<summary>💡 答案提示</summary>

**分散式事務挑戰**：
- 跨服務無法使用本地事務
- 網路可能失敗
- 服務可能當機

**解決方案**：

**1. 2PC (Two-Phase Commit)**
- 協調者統一提交/回滾
- 缺點：阻塞、單點故障、效能差

**2. Saga 模式（推薦）**
- 一系列本地事務 + 補償事務
- 任一步驟失敗，執行補償

**Saga 實現方式**：

| 方式 | 特點 |
|------|------|
| Choreography | 事件驅動，服務自行監聽 |
| Orchestration | 中央協調器編排 |

**Saga 範例（訂單流程）**：
```
1. 建立訂單 → 補償：取消訂單
2. 扣減庫存 → 補償：恢復庫存
3. 扣款 → 補償：退款
4. 發貨
```

**實務考量**：
- 冪等性：每個操作可重複執行
- 隔離性：可能讀到中間狀態
- 補償邏輯要正確

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Micro_Service/distributed_transactions_and_saga_pattern.md)

---

### Q7: 什麼是斷路器模式 (Circuit Breaker)？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請解釋斷路器模式的工作原理和狀態轉換。

<details>
<summary>💡 答案提示</summary>

**為什麼需要**：
- 防止故障擴散（雪崩效應）
- 快速失敗，不浪費資源
- 給故障服務恢復時間

**三種狀態**：

```
     成功率恢復
  ┌─────────────┐
  ▼             │
Closed ──故障率高──► Open ──超時──► Half-Open
  ▲                                    │
  └───────── 測試成功 ─────────────────┘
```

| 狀態 | 行為 |
|------|------|
| **Closed** | 正常請求，監控失敗率 |
| **Open** | 直接返回錯誤，不發請求 |
| **Half-Open** | 放少量請求測試 |

**關鍵參數**：
- 失敗率閾值（如 50%）
- 統計時間窗口（如 10 秒）
- 開啟時間（如 30 秒）
- 半開時的測試請求數

**實現工具**：
- Hystrix（Netflix，已維護模式）
- Resilience4j（Java）
- gobreaker（Go）
- Polly（.NET）

**配合使用**：
- Retry：短暫失敗重試
- Timeout：避免無限等待
- Fallback：降級方案

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Micro_Service/circuit_breaker_pattern.md)

---

### Q8: 什麼是服務發現 (Service Discovery)？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請解釋服務發現的模式和常見實現。

<details>
<summary>💡 答案提示</summary>

**為什麼需要**：
- 服務實例 IP 動態變化
- 自動擴縮容
- 健康檢查和故障剔除

**兩種模式**：

**1. 客戶端發現**
```
Client → Registry → 選擇實例 → Service
```
- 客戶端負責查詢和負載均衡
- 例：Eureka、Consul + 客戶端 SDK

**2. 服務端發現**
```
Client → Load Balancer → Service
              ↓
           Registry
```
- 負載均衡器負責發現
- 例：Kubernetes Service、AWS ELB

**常見工具**：

| 工具 | 特點 |
|------|------|
| etcd | 強一致，Raft 共識 |
| Consul | 服務網格，健康檢查 |
| Zookeeper | 經典，配置管理 |
| Kubernetes | 內建 DNS 服務發現 |
| Nacos | 阿里開源，配置+發現 |

**健康檢查**：
- 主動檢查：Registry 定期探測
- 心跳機制：服務定期上報

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Micro_Service/what_is_service_discovery.md)

---

## 📊 學習進度檢核

完成以上題目後，請自我評估：

| 評估項目 | 自評 |
|----------|------|
| 理解 CAP 定理和取捨 | ⬜ |
| 掌握各種一致性模型 | ⬜ |
| 理解 Raft 共識演算法 | ⬜ |
| 能比較單體和微服務 | ⬜ |
| 了解 API Gateway 功能 | ⬜ |
| 掌握 Saga 分散式事務 | ⬜ |
| 理解斷路器模式 | ⬜ |
| 了解服務發現機制 | ⬜ |

**建議**：未能完整回答的題目，請回到對應的詳細文章深入學習。分散式系統是系統設計面試的重點。
