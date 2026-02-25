# API 設計 - 重點考題 (Quiz)

> 這份考題是從 API 設計章節中挑選出**重要程度 4-5** 的核心題目，設計成自我測驗的形式。
> 
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

## 📝 核心概念題

### Q1: RESTful API 的六大架構約束是什麼？

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

請說明 REST 架構的六個核心約束，並解釋為什麼「無狀態」對系統擴展性很重要？

<details>
<summary>💡 答案提示</summary>

**六大約束**：
1. **統一介面** (Uniform Interface) - 包含資源標識、透過表徵操作資源、自描述訊息、HATEOAS
2. **無狀態** (Stateless) - 伺服器不儲存會話狀態
3. **可快取** (Cacheable) - 回應必須標示是否可快取
4. **客戶端-伺服器** (Client-Server) - 關注點分離
5. **分層系統** (Layered System) - 支援中間層
6. **按需編碼** (Code-On-Demand) - 可選

**無狀態的重要性**：
- 伺服器故障後請求可無縫轉移
- 可輕鬆增加節點進行負載均衡
- 每個請求獨立，更易於監控和除錯

</details>

📖 [查看完整答案](../02_Backend_Development/API_Design/restful_api_principles.md)

---

### Q2: 什麼是 API 的冪等性？為什麼它很重要？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋冪等性的定義，並說明 GET、POST、PUT、DELETE 各自是否具有冪等性？如何讓 POST 請求也變得冪等？

<details>
<summary>💡 答案提示</summary>

**冪等性定義**：一個操作無論執行一次還是多次，產生的效果都相同。

**各 HTTP 方法的冪等性**：

| 方法 | 冪等 | 安全 |
|------|------|------|
| GET | ✅ | ✅ |
| PUT | ✅ | ❌ |
| DELETE | ✅ | ❌ |
| POST | ❌ | ❌ |
| PATCH | ❌ (視操作而定) | ❌ |

**讓 POST 變冪等的方法**：
使用 **Idempotency Key**：
1. 客戶端生成唯一金鑰 (如 UUID)
2. 放在請求標頭 `Idempotency-Key: <key>`
3. 伺服器儲存金鑰與回應結果
4. 重複請求直接返回已儲存的回應

</details>

📖 [查看完整答案](../02_Backend_Development/API_Design/idempotency_in_api.md)

---

### Q3: 比較四種 API 版本管理策略的優缺點

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請比較 URI Path、Query Parameter、Custom Header、Accept Header 四種版本管理策略，並說明你會在什麼情況下選擇哪種方式？

<details>
<summary>💡 答案提示</summary>

| 策略 | 範例 | 優點 | 缺點 |
|------|------|------|------|
| **URI Path** | `/v1/users` | 直觀易測試 | 違反 REST 原則 |
| **Query Param** | `/users?version=1` | 可設預設版本 | 可能影響快取 |
| **Custom Header** | `X-Api-Version: 1` | URI 純淨 | 可視性差 |
| **Accept Header** | `Accept: application/vnd.example.v1+json` | 最符合 REST | 複雜不直觀 |

**實用建議**：
- 大多數情況：選擇 **URI Path** (最實用)
- 嚴格 REST：選擇 **Accept Header**

</details>

📖 [查看完整答案](../02_Backend_Development/API_Design/api_versioning_strategies.md)

---

## 🔐 安全與效能題

### Q4: 比較 OAuth 2.0、JWT 和 API Key 的使用場景

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請說明這三種認證機制的工作原理、優缺點，以及各自適合的使用場景。

<details>
<summary>💡 答案提示</summary>

**API Key**：
- 簡單的字串憑證
- 適合：內部服務、簡單的第三方整合
- 缺點：無法精細控制權限、洩漏風險

**JWT (JSON Web Token)**：
- 自包含的 Token，包含用戶資訊和簽名
- 適合：無狀態認證、微服務間通訊
- 缺點：無法即時撤銷、Token 體積較大

**OAuth 2.0**：
- 授權框架，支援多種授權流程
- 適合：第三方應用授權、社交登入
- 缺點：複雜度較高

</details>

📖 [查看完整答案](../02_Backend_Development/API_Design/api_authentication_and_authorization.md)

---

### Q5: 說明常見的 API 限流演算法及其差異

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較令牌桶 (Token Bucket)、漏桶 (Leaky Bucket)、固定窗口 (Fixed Window)、滑動窗口 (Sliding Window) 四種限流演算法。

<details>
<summary>💡 答案提示</summary>

| 演算法 | 特點 | 優點 | 缺點 |
|--------|------|------|------|
| **固定窗口** | 按固定時間區間計數 | 實現簡單 | 邊界突刺問題 |
| **滑動窗口** | 時間窗口隨時間滑動 | 平滑限流 | 記憶體消耗較大 |
| **漏桶** | 固定速率處理請求 | 流量平滑 | 無法應對突發 |
| **令牌桶** | 按固定速率生成令牌 | 允許一定突發 | 實現較複雜 |

**使用建議**：
- 需要平滑流量：漏桶
- 需要允許突發：令牌桶
- 簡單計數：滑動窗口

</details>

📖 [查看完整答案](../02_Backend_Development/API_Design/api_rate_limiting.md)

---

## 🆚 比較分析題

### Q6: GraphQL vs REST - 如何選擇？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請比較 GraphQL 和 REST 的優缺點，並說明在什麼場景下應該選擇哪種方案？

<details>
<summary>💡 答案提示</summary>

**REST 優點**：
- 簡單直觀，廣泛支援
- HTTP 快取友好
- 工具生態成熟

**GraphQL 優點**：
- 精確獲取所需資料 (避免 Over-fetching)
- 單一端點，減少請求次數
- 強型別 Schema

**選擇建議**：
- **選 REST**：簡單 CRUD、需要 HTTP 快取、團隊不熟悉 GraphQL
- **選 GraphQL**：複雜資料關聯、多平台客戶端、需要靈活查詢

</details>

📖 [查看完整答案](../02_Backend_Development/API_Design/graphql_vs_rest.md)

---

### Q7: WebSocket 與 HTTP 長輪詢的差異是什麼？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請解釋 WebSocket 的工作原理，以及相較於 HTTP 長輪詢 (Long Polling) 的優勢。

<details>
<summary>💡 答案提示</summary>

**WebSocket 特點**：
- 全雙工通訊，持久連線
- 低延遲，減少 HTTP 握手開銷
- 適合即時應用 (聊天、遊戲、股票)

**長輪詢 (Long Polling)**：
- 客戶端發請求，伺服器保持連線直到有資料
- 兼容性好，但效率較低
- 仍需重複建立連線

**選擇建議**：
- 高頻即時更新：WebSocket
- 偶發通知、兼容性優先：Long Polling
- 單向推送：Server-Sent Events (SSE)

</details>

📖 [查看完整答案](../02_Backend_Development/API_Design/WebSocket/README.md)

---

## 📊 學習進度檢核

完成以上題目後，請自我評估：

| 評估項目 | 自評 |
|----------|------|
| 能完整說明 REST 六大約束 | ⬜ |
| 理解冪等性並能設計冪等 API | ⬜ |
| 能比較不同版本管理策略 | ⬜ |
| 熟悉 OAuth 2.0、JWT、API Key | ⬜ |
| 能選擇適當的限流演算法 | ⬜ |
| 能判斷何時用 REST vs GraphQL | ⬜ |
| 理解 WebSocket 的應用場景 | ⬜ |

**建議**：未能完整回答的題目，請回到對應的詳細文章深入學習。
