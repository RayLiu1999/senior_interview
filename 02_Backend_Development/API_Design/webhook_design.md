# Webhook 設計 (Webhook Design)

- **難度**: 6
- **重要程度**: 4
- **標籤**: `Webhook`, `事件驅動`, `回調`, `HTTP推播`, `API設計`

## 問題詳述

Webhook 是一種**事件驅動的 HTTP 回調機制**：當系統中發生特定事件時，伺服器主動向預先配置的 URL 發送 HTTP 請求通知客戶端，實現反向通信（Server-to-Server Push），是現代 API 整合的核心模式。

## 核心理論與詳解

### Webhook vs Polling 的核心差異

| 對比 | Polling（輪詢） | Webhook（事件推播） |
|------|----------------|-------------------|
| 通知方式 | 客戶端定期主動查詢 | **伺服器主動推送** |
| 即時性 | 有延遲（輪詢間隔） | 近乎即時 |
| 資源效率 | 大量無效請求 | 只在事件發生時通知 |
| 實現複雜度 | 客戶端簡單，伺服器簡單 | 客戶端需要暴露 HTTP 端點 |
| 適用場景 | 低頻查詢、無法暴露 URL | 事件通知、第三方集成 |

### Webhook 的工作流程

1. **訂閱**：客戶端（Subscriber）向 Webhook 提供者（Publisher）註冊一個回調 URL
2. **事件觸發**：提供者系統中發生特定事件（如訂單付款、代碼提交）
3. **推送通知**：提供者向客戶端的回調 URL 發送 HTTP POST 請求，攜帶事件數據（通常是 JSON）
4. **確認**：客戶端處理後返回 `2xx` 狀態碼確認收到

### 關鍵設計考量

#### ① 消息可靠性：重試機制

客戶端可能暫時不可用（deploy 中、宕機），Webhook 系統必須有完善的重試策略：

- **指數退避（Exponential Backoff）**：首次失敗後等 1s，再次失敗等 2s、4s、8s...
- **最大重試次數**：通常 3-10 次，超過後標記失敗並通知用戶
- **冪等性**：由於重試，相同事件可能推送多次，客戶端需實現冪等消費（利用事件 ID 去重）

#### ② 安全性：驗證簽名

為防止偽造請求（任何人都可以向你的 webhook URL 發送偽造數據），需要**簽名驗證**：

**HMAC 簽名機制**（GitHub、Stripe 等均使用此方式）：
```
1. 提供者计算：Signature = HMAC-SHA256(SecretKey, RequestBody)
2. 提供者在請求頭附上：X-Signature: sha256=<Signature>
3. 接收方計算相同的 HMAC，與頭部比較（用 constant-time comparison 防時序攻擊）
4. 相同則通過驗證，不同則拒絕
```

```go
// 接收方驗證示意
func verifySignature(secret, body []byte, signature string) bool {
    mac := hmac.New(sha256.New, secret)
    mac.Write(body)
    expected := "sha256=" + hex.EncodeToString(mac.Sum(nil))
    return hmac.Equal([]byte(expected), []byte(signature)) // 時序安全比較
}
```

#### ③ 冪等性設計

每個 Webhook 事件應包含**唯一事件 ID**，接收方通過記錄已處理的事件 ID 實現去重：

```json
{
  "event_id": "evt_1234567890",
  "event_type": "payment.succeeded",
  "created_at": "2026-02-25T10:00:00Z",
  "data": { "order_id": "order_999", "amount": 100 }
}
```

#### ④ 快速回應：異步處理

接收方應**立即返回 200**，將實際處理邏輯放入後台隊列：
```
接收 Webhook → 儲存到 MQ/DB → 立即回 200 → 後台 Worker 異步處理
```
若接收方處理耗時超過提供者設置的超時（通常 10-30 秒），會被視為失敗並重試。

#### ⑤ 事件順序

Webhook 通常**不保證事件順序**。例如：
- `payment.created` 和 `payment.succeeded` 可能因網路延遲導致後者先到
- 接收方不應依賴順序，應以事件中的 `created_at` 或事件 ID 比較

### Webhook 的失敗處理

**提供者側（發送方）**：
- 維護 Webhook 的活躍/禁用狀態（連續失敗 N 次後自動禁用，避免無效重試）
- 提供重試記錄和人工觸發重試的界面
- Webhook 發送本身應異步執行，不阻塞主業務流程


**接收方（客戶端）**：
- 實現**Webhook 接收端點監控**（到底收到了多少條？失敗了哪些？）
- 保存原始 Webhook 請求到資料庫，便於問題排查

### 典型應用場景

- **支付通知**：Stripe、PayPal 訂單狀態變化推送（payment.succeeded、refund.created）
- **版本控制**：GitHub/GitLab push event、PR merged 觸發 CI/CD 流水線
- **SaaS 整合**：Slack Incoming Webhooks、外部系統通知
- **內部服務間通知**：訂單服務完成後通知庫存服務（輕量替代 MQ 的場景）
