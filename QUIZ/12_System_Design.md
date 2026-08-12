# 大型系統設計 - 重點考題 (Quick Quiz)

> 這份考題聚焦限量資源、高併發流量、分散式鎖與交易狀態，適合在閱讀大型系統設計文章後快速檢查是否能說出關鍵取捨。

## ⚙️ 限量資源與高併發設計

<a id="q1"></a>
### Q1: 秒殺系統如何在流量洪峰下保護庫存與下游？
<!-- Concept ID: concept.system-design.flash-sale.capacity-protection; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9) | **重要性**: 🔴 必考

請從流量分層、限流、排隊、庫存扣減、非同步處理與失敗補償說明設計。

<details>
<summary>💡 答案提示</summary>

- 在 CDN／Gateway／應用層先擋掉無效或過量請求，以 token bucket、排隊與 admission control 把尖峰轉成系統可承受的速率。
- 庫存扣減必須是原子且可驗證的，不可只依賴快取顯示；成功取得配額後再建立有期限的訂單或 reservation。
- 付款、通知與非關鍵工作走可靠事件流；每個請求需有冪等鍵、狀態查詢與逾時補償，避免重試造成重複扣庫存。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_flash_sale_system.md)

<a id="q2"></a>
### Q2: 分散式鎖真正需要保證哪些性質？
<!-- Concept ID: concept.system-design.distributed-lock.correctness; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請比較 Redis、ZooKeeper／共識服務的鎖模型，並說明租約過期、續期、網路分區與持有者失聯時如何避免兩個 client 同時執行危險操作。

<details>
<summary>💡 答案提示</summary>

- 互斥只是起點，還要處理 ownership token、租約、釋放者驗證、fencing token、時鐘與網路分區；不能把 client timeout 當成鎖已安全釋放。
- Redis-based lease 低延遲但需要明確的 token 與 fencing；共識服務能提供更強的順序與 session 語意，但有協調成本與可用性取捨。
- 下游資源也要檢查 fencing token，否則舊持有者恢復後仍可能覆寫新持有者的結果。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_distributed_lock.md)

<a id="q3"></a>
### Q3: 購票系統如何避免超賣與「占位不付款」？
<!-- Concept ID: concept.system-design.ticket-booking.oversell-prevention; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9) | **重要性**: 🔴 必考

請設計座位或票券的 hold、付款、逾時釋放與最終出票流程，說明一致性與使用者體驗的取捨。

<details>
<summary>💡 答案提示</summary>

- 票券 authoritative state 應以條件更新、序列化分片或一致性 reservation 保證最多一個有效持有者；商品頁的 stale read 不能作為最後判斷。
- hold 必須有 expiration、owner／order ID 與冪等狀態機；付款結果未知時先查詢，不以新 request 盲目重扣。
- 逾時掃描與事件重放都必須冪等；可接受以 `PENDING` 換取不超賣，不能為了同步成功率放寬硬不變量。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_ticket_booking_system.md)

<a id="q4"></a>
### Q4: 秒殺的非同步佇列如何避免把延遲轉成失控堆積？
<!-- Concept ID: concept.system-design.flash-sale.capacity-protection; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請說明 queue depth、consumer throughput、丟棄或降級策略、重試與 DLQ 如何共同形成容量保護。

<details>
<summary>💡 答案提示</summary>

- Queue 是緩衝器，不是無限容量；要設定 admission 上限、最大等待時間、consumer concurrency、backpressure 與 queue age SLO。
- 同一業務請求使用穩定 idempotency key，重試和 DLQ 必須保留上下文；不能讓每一層都獨立重試造成 retry storm。
- 當 queue age 或庫存 reservation deadline 超過門檻，應快速拒絕、停止接單或明確回傳 pending，而不是繼續堆積。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_flash_sale_system.md)

<a id="q5"></a>
### Q5: 在座位鎖定、支付與出票之間，哪些操作可以最終一致？
<!-- Concept ID: concept.system-design.ticket-booking.oversell-prevention; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (9) | **重要性**: 🔴 必考

請區分座位可售狀態、訂單狀態、支付結果與通知的 authoritative source，並說明跨服務失敗時如何對帳與補償。

<details>
<summary>💡 答案提示</summary>

- 座位 reservation 與支付 operation 必須有唯一識別碼與明確狀態機；支付 timeout 是 unknown，不可直接視為失敗。
- 訂單可以暫存 `PENDING`，通知與搜尋索引可最終一致，但不能在 authoritative reservation／payment 未確認時顯示已出票。
- 使用 outbox／inbox、冪等 consumer 與 reconciliation job 對齊座位、訂單、支付 ledger；補償失敗要進人工處理，不可靜默覆蓋。

</details>

📖 [查看完整答案](../03_System_Design_and_Architecture/Large_Scale_System_Design_Cases/design_ticket_booking_system.md)
