# 分散式系統與微服務 (Distributed Systems & Microservices) - 重點考題 (Quiz)

> 這份考題從分散式系統理論和微服務架構中挑選出**重要程度 4-5** 的核心題目，設計成自我測驗的形式。
> 
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

## 🌐 分散式系統理論

### Q1: 什麼是 CAP 定理？如何做取捨？
<!-- Concept ID: concept.distributed-systems.cap.tradeoffs; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.distributed-systems.consistency.models; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.distributed-systems.raft.consensus; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.microservices.architecture.tradeoffs; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.microservices.api-gateway; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.microservices.saga.transactions; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.microservices.circuit-breaker; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.microservices.service-discovery; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

### Q9: 分散式時鐘如何判斷因果與並發？
<!-- Concept ID: concept.distributed-systems.clocks-causal-ordering; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9) | **重要性**: 🔴 必考

請比較物理時鐘、Lamport Clock、Vector Clock 與 TrueTime，說明它們能保證什麼、不能保證什麼，以及如何用於事件排序與衝突處理。

<details>
<summary>💡 答案提示</summary>

- 物理時鐘受 clock skew、網路延遲與校時誤差影響，時間戳不能直接證明因果。
- Lamport Clock 保證 `a -> b` 時 `C(a) < C(b)`，但反向不成立，因此無法單獨辨識並發。
- Vector Clock 透過偏序比較辨識因果與並發，代價是 metadata 隨節點或版本數量增加。
- TrueTime 以有界時間區間和 commit wait 支援外部一致性，但不是免費取得全域精確時鐘。
- 設計時要先定義是需要全序、因果序、衝突偵測還是可重播，再選擇 metadata、儲存與延遲成本。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Distributed_Systems_Theory/distributed_clocks_and_ordering.md)

---

### Q10: 貧血模型與充血模型如何界定領域行為？
<!-- Concept ID: concept.ddd.anemic-rich.domain-behavior; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請比較貧血模型與充血模型，並說明何時應把規則放入 Entity／Value Object，何時保留在 Application Service，以及如何安全遷移。

<details>
<summary>💡 答案提示</summary>

- 貧血模型把資料放在 Entity、行為集中在 Service，簡單 CRUD 可以接受，但容易讓 invariant 散落和被 Setter 繞過。
- 充血模型讓與狀態直接相關的規則由領域物件保護；Application Service 仍負責交易協調、權限與跨邊界流程。
- 判斷責任的關鍵是「誰擁有不變條件」與「哪一種變更原因會一起發生」，不是盲目追求更多方法。
- 遷移可先封裝一條高風險規則、保留既有 API、加入 contract／characterization test，再逐步移除繞過模型的寫入路徑。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Domain_Driven_Design/anemic_vs_rich_domain_model.md)

---

### Q11: Domain Event 與 Event Storming 如何形成可交付邊界？
<!-- Concept ID: concept.ddd.domain-events.event-storming; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請說明 Domain Event、Command、Policy、Aggregate 在 Event Storming 中的關係，並設計一條可靠的事件發布與消費路徑。

<details>
<summary>💡 答案提示</summary>

- Domain Event 是已經發生且具有業務意義的事實；Command 是意圖；Policy 描述事件後的反應；Aggregate 負責保護寫入時的不變條件。
- Event Storming 先以事件時間線探索流程，再反推命令、聚合、政策、外部系統與邊界，不是只列事件名稱。
- 寫入與事件發布要有清楚的原子性策略，例如 outbox；消費端則以 event ID／業務 key 做冪等。
- 事件必須治理 schema version、順序、重試、DLQ／poison event、lag 與 replay，並能追到原始 transaction。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Domain_Driven_Design/domain_events_and_event_storming.md)

---

### Q12: Bounded Context 如何成為真正的架構邊界？
<!-- Concept ID: concept.ddd.bounded-context.strategic-boundaries; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請以同一個「Product」或「User」在不同業務場景的差異，說明 Ubiquitous Language、Context Mapping 與微服務拆分的關係。

<details>
<summary>💡 答案提示</summary>

- Bounded Context 是語意與模型的邊界，不是把每個名詞或資料表直接拆成一個服務。
- 每個上下文應有自己的語言、模型與資料 owner；跨上下文只交換穩定契約或識別碼，避免共享大一統 Entity。
- Shared Kernel、Customer-Supplier、Open Host Service 與 Anti-Corruption Layer 的選擇，取決於協作、相容性與轉換成本。
- 只有在變更原因、部署需求、資料 ownership 與故障域都清楚時才拆服務；交易不變條件可能先留在模組化單體內。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Domain_Driven_Design/strategic_design_bounded_context.md)

---

### Q13: Aggregate 如何保護 invariant 又避免過大？
<!-- Concept ID: concept.ddd.aggregate.invariants-boundary; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請區分 Entity、Value Object、Aggregate Root，並說明如何決定聚合大小、交易邊界與聚合間的協作方式。

<details>
<summary>💡 答案提示</summary>

- Entity 以 identity 和生命週期辨識；Value Object 以值相等、不可變和自我驗證辨識。
- Aggregate 是一致性邊界，外部只透過 Root 修改內部狀態；聚合內的 invariant 應能在一次交易中保護。
- 聚合應小而有明確 owner，聚合間用 ID 或 Domain Event 協作，不用跨聚合物件引用製造隱形交易。
- 若跨聚合流程需要最終一致性，必須設計冪等、版本／樂觀鎖、補償與可觀測的狀態轉移。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Domain_Driven_Design/tactical_design_aggregates_entities_value_objects.md)

---

### Q14: 事件驅動通訊何時優於同步 API？
<!-- Concept ID: concept.microservices.event-driven.delivery; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請比較同步編排與非同步協同，並說明如何處理 at-least-once、亂序、重試、背壓與最終一致性。

<details>
<summary>💡 答案提示</summary>

- 同步 API 直觀且適合需要立即結果或強一致性的短流程，但延遲與可用性會受下游串聯影響。
- 非同步事件可降低耦合、隔離故障並提高吞吐，但流程分散，必須接受或明確補救最終一致性。
- 不能把 broker 成功等同於 side effect 成功；要追蹤 producer、broker、consumer、資料庫與外部副作用各自的狀態。
- 以穩定 key 保序、以 event ID／idempotency key 吸收重複、以 bounded retry／DLQ／backpressure 防止無限重試，並提供 reconciliation。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Micro_Service/event_driven_communication.md)

---

### Q15: Service Mesh 的控制平面與資料平面各自負責什麼？
<!-- Concept ID: concept.microservices.service-mesh.control-data-plane; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🟡 重要

請說明 sidecar、control plane、data plane 如何共同提供流量治理、安全與可觀測性，以及引入服務網格的風險。

<details>
<summary>💡 答案提示</summary>

- Data plane 的 proxy 實際攔截與轉送流量；control plane 下發路由、憑證與 telemetry policy，不直接承擔每個請求。
- mTLS、路由、timeout、retry、circuit breaking 與 tracing 應有明確 owner，避免應用和 mesh 同時無界重試或互相覆蓋。
- 排障要把應用、sidecar、control plane、DNS、網路與 upstream trace 串起來，不能只看應用 log。
- 評估 CPU／記憶體／延遲、配置收斂、故障注入與 canary rollback；服務少或延遲極敏感時，簡單 library／gateway 可能更合理。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Micro_Service/service_mesh.md)

---

### Q16: 敏捷開發如何把變化轉成可控的交付回饋？
<!-- Concept ID: concept.software-development.agile.feedback-flow; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請比較敏捷與瀑布模型，並說明如何避免把「敏捷」簡化成少寫文件、沒有計畫或只追求更快交付。

<details>
<summary>💡 答案提示</summary>

- 敏捷以個人互動、可工作的軟體、客戶合作與回應變化為價值，透過短週期增量取得回饋。
- 敏捷不是拒絕文件或設計，而是讓文件、品質與計畫服務於可驗證的交付和學習。
- 每個增量應有清楚的目標、測試、觀測與可回滾路徑；需求變更仍需檢查容量、依賴與風險。
- 用 lead time、部署頻率、變更失敗率、恢復時間、缺陷、返工與客戶價值檢查流程，而非只看 velocity。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Software_Development_Models/agile_development.md)

---

### Q17: Scrum 如何用透明、檢視與調適改善交付流？
<!-- Concept ID: concept.software-development.scrum.delivery-flow; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明 Scrum 的角色、事件、產出物與 Definition of Done，並分析 Sprint 中大量未完成工作或品質下降時應如何處理。

<details>
<summary>💡 答案提示</summary>

- Product Owner 對價值與 Product Backlog 負責；Developers 建立可用增量；Scrum Master 促進框架、移除障礙與改善。
- Sprint、Planning、Daily Scrum、Review、Retrospective 形成 inspect-and-adapt 迴圈；Product Backlog、Sprint Backlog、Increment 是不同產出物。
- Sprint Goal 聚焦成果，Definition of Done 定義可交付品質；未完成項目不能用報告或口頭承諾假裝完成。
- 應查 blocked time、cycle time、WIP、缺陷、返工、DoD 違規與回饋，縮小批次或改善工程能力，而不是只提高承諾量。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Software_Development_Models/scrum_framework.md)

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
