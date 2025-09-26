# RabbitMQ 的訊息確認機制：ack, nack, reject

- **難度**: 7
- **重要性**: 5
- **標籤**: `RabbitMQ`, `Reliability`, `AMQP`

## 問題詳述

在 RabbitMQ 中，訊息的確認 (Acknowledgement) 機制是什麼？`ack`, `nack`, 和 `reject` 三種確認方式有什麼區別？它們如何保證訊息的可靠傳遞？

## 核心理論與詳解

訊息確認機制是 RabbitMQ 實現可靠訊息傳遞的核心。它確保了即使消費者在處理訊息的過程中發生故障，訊息也不會丟失，而是可以被重新傳遞給另一個健康的消費者。

當消費者從佇列中獲取一則訊息後，RabbitMQ 需要知道消費者是否已經成功處理了這則訊息。這個「告知」的過程就是訊息確認。

- **自動確認 (Automatic Acknowledgement)**: 消費者一旦收到訊息，就立即自動發送一個 `ack`。這種方式非常高效，但可靠性較低。如果消費者在處理訊息時崩潰，這則訊息將會丟失。
- **手動確認 (Manual Acknowledgement)**: 消費者在成功處理完訊息後，必須明確地向 RabbitMQ 發送一個確認信號。這是推薦的、保證可靠性的方式。

手動確認主要有三種信號：`ack`, `nack`, 和 `reject`。

### 1. `channel.basicAck(deliveryTag, multiple)`

- **用途**: 肯定確認 (Positive Acknowledgement)。告知 RabbitMQ 訊息已經被**成功處理**，可以從佇列中安全地移除了。
- **參數**:
  - `deliveryTag`: 訊息的唯一識別碼。這是一個單調遞增的整數，由 RabbitMQ 在每個 Channel 中分配。
  - `multiple`: 一個布林值。
    - `true`: 確認 `deliveryTag` 以及之前所有**未被確認**的訊息。這是一種批次確認，可以提高效率。
    - `false`: 只確認 `deliveryTag` 所對應的單一訊息。

### 2. `channel.basicNack(deliveryTag, multiple, requeue)`

- **用途**: 否定確認 (Negative Acknowledgement)。告知 RabbitMQ 訊息**處理失敗**。這是 AMQP 協議對 `basic.reject` 的一個擴展，提供了批次處理的能力。
- **參數**:
  - `deliveryTag`: 訊息的唯一識別碼。
  - `multiple`: 與 `ack` 相同，`true` 表示批次否定確認。
  - `requeue`: 一個布林值，決定了訊息的後續處理方式。
    - `true`: 將訊息**重新排隊 (Requeue)**，放回佇列的頭部（或根據情況可能在尾部），等待被重新傳遞給下一個消費者。
    - `false`: 將訊息**丟棄**，或者如果設定了**死信交換機 (Dead-Letter Exchange, DLX)**，則將其路由到 DLX。

### 3. `channel.basicReject(deliveryTag, requeue)`

- **用途**: 與 `nack` 類似，也是否定確認。告知 RabbitMQ 訊息**處理失敗**。
- **區別**: `reject` 只能一次拒絕**單一**訊息，它沒有 `multiple` 參數。而 `nack` 可以進行批次拒絕。在功能上，`basicNack` 是 `basicReject` 的超集。
- **參數**:
  - `deliveryTag`: 訊息的唯一識別碼。
  - `requeue`: 與 `nack` 中的 `requeue` 參數行為完全相同。

### `nack` vs. `reject`

| 特性 | `basic.nack` | `basic.reject` |
| :--- | :--- | :--- |
| **功能** | 拒絕一則或多則訊息 | 只能拒絕單一訊息 |
| **批次處理** | 支援 (`multiple=true`) | 不支援 |
| **協議來源** | RabbitMQ 對 AMQP 的擴展 | AMQP 標準 |

在實際使用中，如果你不需要批次拒絕的功能，`reject` 和 `nack` (將 `multiple` 設為 `false`) 是等效的。但通常建議使用 `nack`，因為它提供了更強的靈活性。

### 可靠性保證與注意事項

1. **Requeue 的風險**:
    如果因為程式碼的邏輯錯誤（例如，每次都會拋出同一個異常）而使用 `requeue=true`，可能會導致一個有問題的訊息在「處理 -> 失敗 -> 重排隊 -> 處理」的循環中不斷被消費，造成**無限循環**，耗盡系統資源。
    **最佳實踐**: 只有在因暫時性問題（如資料庫連線中斷）導致處理失敗時，才考慮使用 `requeue=true`。對於永久性錯誤，應將 `requeue` 設為 `false`，並將訊息發送到死信佇列進行後續分析。

2. **消費者崩潰**:
    如果一個消費者在處理訊息時（在發送 `ack`/`nack` 之前）斷開連線或崩潰，RabbitMQ 會發現該訊息沒有被確認，並會將其重新排隊，交給另一個消費者處理。這確保了訊息不會因消費者故障而丟失。

3. **Prefetch Count (預取計數)**:
    為了提高效率，RabbitMQ 允許消費者一次性從佇列中預取多則訊息到本地緩衝區。這個數量由 `prefetch_count` 控制。如果 `prefetch_count` 設定得太大，而一個消費者預取了大量訊息後崩潰，這些訊息都需要重新排隊，可能會影響處理的即時性。因此，需要根據訊息處理的耗時和網路狀況，合理設定 `prefetch_count`。

## 總結

- **`ack`**: 處理成功，訊息可以被丟棄。
- **`nack`**: 處理失敗，可選擇重新排隊或丟棄/死信。支援批次操作。
- **`reject`**: 處理失敗，可選擇重新排隊或丟棄/死信。只支援單一訊息操作。

正確使用手動確認機制，並結合死信交換機和合理的重試策略，是構建高可靠、高可用訊息系統的基石。
