# API 設計 - 重點考題 (Quiz)

> 這份考題是從 API 設計章節中挑選出**重要程度 4-5** 的核心題目，設計成自我測驗的形式。
> 
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

## 📝 核心概念題

### Q1: RESTful API 的六大架構約束是什麼？
<!-- Concept ID: concept.api.rest.architectural-constraints; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.api.idempotency.safe-retry; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.api.versioning.compatibility-strategy; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.api.authentication.authorization-mechanisms; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.api.rate-limiting.degradation; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.api.graphql-rest.selection; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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
<!-- Concept ID: concept.api.realtime.websocket-long-polling; Learning Objective IDs: LO-1, LO-2, LO-3 -->

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

📖 [查看完整答案](../02_Backend_Development/API_Design/WebSocket/websocket_vs_polling.md)

---

### Q8: API Backward Compatibility Boundary
<!-- Concept ID: concept.api.backward-compatibility.evolution; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請判斷哪些請求、回應和行為變更會破壞既有 Consumer，並說明如何用版本、廢棄流程與契約測試安全演化 API。

<details>
<summary>💡 答案提示</summary>

**判斷邊界**：移除或改名欄位、增加必填輸入、改變型別／語義、改變錯誤碼含義與授權行為通常是 Breaking Change；新增可選輸入或可忽略的回應欄位通常較安全，但仍要考慮嚴格的 Consumer。

**治理方式**：採只增不刪、標記 `Deprecation`／`Sunset`、提供遷移期限與新版本；用 OpenAPI schema diff、Consumer-Driven Contract Test、實際流量監控和回滾開關驗證影響。

</details>

📖 [查看完整答案](../02_Backend_Development/API_Design/api_backward_compatibility.md)

---

### Q9: OpenAPI Contract-First Design
<!-- Concept ID: concept.api.openapi.contract-first; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐ (4) | **重要性**: 🟡 重要

請說明 OpenAPI 如何描述 API 契約，並比較 contract-first 與 code-first 在文件、Mock、SDK 生成和破壞性變更治理上的取捨。

<details>
<summary>💡 答案提示</summary>

OpenAPI 應明確描述 paths、參數、request／response schema、狀態碼、錯誤、認證、範例、伺服器和版本；3.1 也能描述更完整的 JSON Schema 與 Webhook。

**Contract-first** 先審查規範，再生成 Mock、SDK、Server Stub 和測試，適合多團隊並行與一致治理；**Code-first** 上手快且適合既有型別系統，但要用 lint、schema diff 和契約測試防止文件漂移。

</details>

📖 [查看完整答案](../02_Backend_Development/API_Design/api_documentation_openapi.md)

---

### Q10: Cursor Pagination Consistency
<!-- Concept ID: concept.api.pagination.consistency-performance; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🟡 重要

請比較 Offset／頁碼分頁與 Cursor／Keyset 分頁，並說明在資料持續新增、深分頁和需要隨機跳頁時如何選擇。

<details>
<summary>💡 答案提示</summary>

Offset 易懂且能跳頁，但深分頁會掃描並丟棄大量資料，資料變動也可能造成重複或遺漏；Cursor 需要穩定索引和排序，深度效能較穩定，但不適合任意跳到第 N 頁。

可靠的 Cursor 應是不透明、可驗證或簽名的值，包含穩定排序欄位與唯一 tie-breaker；契約還要定義 `limit` 上限、游標失效錯誤、`has_next` 和資料一致性邊界。

</details>

📖 [查看完整答案](../02_Backend_Development/API_Design/api_pagination.md)

---

### Q11: Webhook Delivery Reliability
<!-- Concept ID: concept.api.webhook.delivery-reliability; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請設計可重試且不重複產生副作用的 Webhook，涵蓋簽名驗證、超時、重試、事件順序和接收方的確認時機。

<details>
<summary>💡 答案提示</summary>

Webhook 通常是至少一次投遞；發送方要有 timeout、指數退避、最大重試、DLQ 和人工 replay，接收方要用原始 request body 驗證 HMAC、時間戳／nonce 防 replay，並以事件 ID 去重。

接收端先把事件可靠寫入 DB／佇列，再回 `2xx`；不要在同步 HTTP 請求中執行長交易。事件可能亂序，應以版本、序號或目前資源狀態處理，而不是假設抵達順序。

</details>

📖 [查看完整答案](../02_Backend_Development/API_Design/webhook_design.md)

---

### Q12: WebSocket Handshake Upgrade
<!-- Concept ID: concept.api.websocket.handshake-upgrade; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請說明 WebSocket 從 HTTP Upgrade 到 `101 Switching Protocols` 的握手流程，並區分握手協議驗證與身份驗證的責任。

<details>
<summary>💡 答案提示</summary>

客戶端送 `GET`、`Upgrade: websocket`、`Connection: Upgrade`、`Sec-WebSocket-Key` 和 `Sec-WebSocket-Version`；伺服器成功時回 `101`、相同的 Upgrade／Connection，以及由 Key 加 RFC 6455 magic string 後做 SHA-1 再 Base64 的 `Sec-WebSocket-Accept`。

`Sec-WebSocket-Key`／`Accept` 只證明協議升級，不是身份驗證；Origin、Cookie／Token、TLS、Proxy、subprotocol、握手 timeout 與 close code 都要有各自的策略和觀測。

</details>

📖 [查看完整答案](../02_Backend_Development/API_Design/WebSocket/websocket_handshake.md)

---

### Q13: WebSocket Heartbeat Liveness
<!-- Concept ID: concept.api.websocket.heartbeat-liveness; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請說明 WebSocket Ping／Pong 心跳如何維持連線並偵測死連線，並討論 interval、timeout、慢客戶端與重連策略的取捨。

<details>
<summary>💡 答案提示</summary>

Ping／Pong 是 WebSocket 控制幀；它可以重置 NAT／Proxy idle timeout，也能用 Pong deadline 判斷 liveness，但不等同於應用層「收到並處理資料」的 heartbeat。

interval 要短於中間設備 idle timeout，timeout 要容納正常網路延遲又不能讓死連線長期佔用資源；寫入要序列化、處理背壓、取消 ticker 並清理連線，超時後以明確 close code、重連退避和指標追蹤恢復。

</details>

📖 [查看完整答案](../02_Backend_Development/API_Design/WebSocket/heartbeat_mechanism.md)

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
| 能判斷 API 變更是否破壞向後相容 | ⬜ |
| 能用 OpenAPI 維護可驗證的 API 契約 | ⬜ |
| 能依一致性與效能選擇分頁策略 | ⬜ |
| 能設計可重試且安全的 Webhook | ⬜ |
| 能解釋 WebSocket 握手與安全邊界 | ⬜ |
| 能設計 WebSocket 心跳與死連線清理 | ⬜ |

**建議**：未能完整回答的題目，請回到對應的詳細文章深入學習。
