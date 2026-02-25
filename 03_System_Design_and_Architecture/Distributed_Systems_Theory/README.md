# Distributed Systems Theory (分散式系統理論)

分散式系統理論是資深後端工程師與架構師的必修課。在設計高可用、高併發的系統時，必須理解如何在一致性 (Consistency)、可用性 (Availability) 與分區容錯性 (Partition Tolerance) 之間做出權衡。本章節深入探討分散式系統的核心原理與演算法。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [CAP 定理與 PACELC 理論](./cap_theorem_and_pacelc.md) | 8 | 5 | `CAP`, `PACELC`, `Trade-off` |
| 2 | [一致性模型 (Consistency Models)](./consistency_models.md) | 9 | 5 | `Strong Consistency`, `Eventual Consistency`, `Linearizability` |
| 3 | [共識演算法 (Consensus Algorithms): Raft 與 Paxos](./consensus_algorithms_raft_paxos.md) | 10 | 5 | `Raft`, `Paxos`, `Distributed Consensus` |
| 4 | [分散式時鐘與事件順序 (Distributed Clocks)](./distributed_clocks_and_ordering.md) | 9 | 4 | `Lamport Clock`, `Vector Clock`, `Time` |
| 5 | [Gossip Protocols (流言協議)](./gossip_protocols.md) | 8 | 3 | `Gossip`, `Epidemic`, `Cassandra` |

---

## 學習建議

1. **先理解 Trade-off**: 從 CAP 和 PACELC 開始，建立「沒有完美系統，只有最適合的取捨」的觀念。
2. **掌握一致性光譜**: 不要只知道強一致和最終一致，要理解中間的因果一致性、讀己之所寫等模型。
3. **深入共識機制**: Raft 是目前最主流的共識演算法，建議搭配動畫或視覺化工具學習其 Leader Election 和 Log Replication 過程。
4. **實務連結**: 思考你使用的工具 (如 Redis, Kafka, Cassandra, Zookeeper) 分別使用了哪些理論基礎。
