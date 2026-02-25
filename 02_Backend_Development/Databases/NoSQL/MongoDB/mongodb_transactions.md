# MongoDB 多文件事務 (Multi-Document Transactions)

- **難度**: 7
- **重要程度**: 4
- **標籤**: `MongoDB`, `Transaction`, `ACID`, `Multi-Document`, `Replica Set`

## 問題詳述

MongoDB 在 4.0 版本引入**多文件事務（Multi-Document Transactions）**，在 4.2 版本擴展至支援**分片叢集的分散式事務**。這使 MongoDB 在需要原子性操作多個文件的場景下，不再是「NoSQL 不支援事務」的代名詞。

## 核心理論與詳解

### MongoDB 事務的前提條件

- **4.0+**：Replica Set 中的多文件事務
- **4.2+**：Sharded Cluster 的跨分片分散式事務
- 必須使用 **副本集（Replica Set）**，不支援單機部署（Standalone）

---

### 單文件的原子性（事務的替代品）

在理解多文件事務之前，需要知道 MongoDB 單文件操作**天然是原子的**：

```javascript
// 原子性更新：$inc 和 $push 在一個文件內是原子的
db.orders.updateOne(
    { _id: orderId },
    {
        $inc: { totalAmount: 99.9 },
        $push: { items: { productId: "p001", qty: 2 } },
        $set: { updatedAt: new Date() }
    }
)
// 上述操作要麼全部成功，要麼全部失敗，不需要事務
```

> **設計原則**：MongoDB 的最佳實踐是透過**嵌入式文件（Embedding）**將相關資料放在同一文件中，從而避免多文件事務的需求。只有真正需要跨文件/跨集合原子性時，才使用事務。

---

### 多文件事務的使用

```javascript
// 使用 Session 開啟事務
const session = client.startSession();

try {
    session.startTransaction({
        readConcern: { level: 'snapshot' },   // 隔離級別：可重複讀快照
        writeConcern: { w: 'majority' },       // 多數派確認
    });

    // 在事務中執行多個操作（均使用 session）
    const accounts = db.collection('accounts');

    await accounts.updateOne(
        { userId: 'alice' },
        { $inc: { balance: -100 } },
        { session }
    );

    await accounts.updateOne(
        { userId: 'bob' },
        { $inc: { balance: 100 } },
        { session }
    );

    // 提交事務
    await session.commitTransaction();
} catch (error) {
    // 發生錯誤，回滾
    await session.abortTransaction();
    throw error;
} finally {
    await session.endSession();
}
```

---

### 事務的隔離級別

MongoDB 事務使用**快照隔離（Snapshot Isolation）**：
- 事務開始時，獲取一個一致的資料庫快照
- 事務內所有讀操作都看到相同的快照（防止不可重複讀）
- 提交時檢查寫-寫衝突（Write-Write Conflict Detection）
- 若兩個事務修改了同一文件，後提交的事務會收到 `WriteConflict` 錯誤，需要重試

---

### 效能影響與注意事項

**事務的成本**：
1. **持有鎖的時間更長**：事務期間文件上持有文件級鎖（Document-Level Lock）
2. **WiredTiger MVCC 開銷**：需要維護更多版本的資料
3. **Oplog 膨脹**：事務提交時，所有操作一次性寫入 Oplog（可能很大）
4. **跨分片分散式事務**：使用兩階段提交協定（2PC），延遲和複雜性更高

**MongoDB 事務的最佳實踐**：

| 建議 | 說明 |
|------|------|
| **事務盡量短** | 默認最大事務時間 60 秒，超過自動 abort；大量操作應分批 |
| **優先嵌入模型** | 重新設計文件模型，使相關資料共存一文件，避免事務 |
| **處理 WriteConflict** | 加入重試邏輯，對 `WriteConflict` 錯誤自動重試 |
| **避免大型事務** | 超過 16MB 的事務 Oplog 會失敗 |
| **監控慢事務** | `currentOp({ "transaction": { "$exists": true } })` |

---

### 分散式事務（Sharded Cluster）

MongoDB 4.2+ 使用**跨分片兩階段提交（2PC）**：

1. **Prepare 階段**：協調者向所有涉及的分片發送 Prepare，各分片記錄操作並鎖定資源
2. **Commit 階段**：所有分片 Prepare 成功後，協調者廣播 Commit
3. **若任一分片 Prepare 失敗**：廣播 Abort，所有分片回滾

> **注意**：跨分片事務的延遲比單分片高 3-5 倍，在設計分片策略時應儘量讓同一事務的操作落在同一分片。
