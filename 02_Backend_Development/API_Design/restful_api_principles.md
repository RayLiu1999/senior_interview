# RESTful API 的核心設計原則是什麼？

- **難度**: 5
- **重要性**: 5
- **標籤**: `API Design`, `REST`, `Architecture`

## 問題詳述

什麼是 REST (Representational State Transfer)？一個 API 被稱為「RESTful」需要滿足哪些核心的架構約束 (Architectural Constraints)？

## 核心理論與詳解

REST (表徵狀態轉移) 不是一個協議，也不是一個標準，而是一種軟體架構風格，它定義了一組用於建立可擴展、高效能的分散式系統（特別是 Web 服務）的架構約束。一個遵循這些約束的 API 就可以被稱為「RESTful API」。

REST 的核心思想是將系統中的所有事物都視為**資源 (Resource)**，並透過標準的 HTTP 方法對這些資源進行操作。

以下是 REST 的六個核心架構約束：

### 1. 統一介面 (Uniform Interface)

這是 REST 架構的基石，它簡化並解耦了客戶端和伺服器之間的互動。統一介面包含四個子約束：

- **資源標識 (Identification of Resources)**:
    系統中的每個資源都必須有一個唯一的標識符，通常是 URI (Uniform Resource Identifier)。例如，`/users/123` 就是一個唯一的資源標識。

- **透過表徵來操作資源 (Manipulation of Resources Through Representations)**:
    客戶端不直接操作伺服器上的資源實體，而是操作資源的**表徵 (Representation)**，例如 JSON 或 XML 格式的資料。客戶端在獲取一個資源的表徵後，可以修改它，然後將修改後的表徵發送回伺服器來更新資源。

- **自描述訊息 (Self-descriptive Messages)**:
    每個訊息都應包含足夠的資訊，讓接收方（伺服器或客戶端）能夠理解如何處理它。這包括：
    - 使用標準的 HTTP 方法 (GET, POST, PUT, DELETE) 來表達意圖。
    - 使用媒體類型 (Media Types)，如 `application/json`，來指定表徵的格式。
    - 可以包含快取控制、認證等標頭。

- **超媒體作為應用程式狀態的引擎 (Hypermedia as the Engine of Application State, HATEOAS)**:
    這是最成熟的 RESTful API 特徵。客戶端無需硬編碼 API 的路徑結構。伺服器在回應中應提供相關操作的連結 (Links)，引導客戶端可以進行的下一步操作。例如，一個訂單資源的回應中可以包含取消訂單、查詢物流等操作的 URI。

    ```json
    // HATEOAS 範例
    {
        "orderId": "ORD456",
        "status": "shipped",
        "total": 59.99,
        "_links": {
            "self": { "href": "/orders/ORD456" },
            "tracking": { "href": "/orders/ORD456/tracking" },
            "cancel": { "href": "/orders/ORD456/cancel" } // 如果狀態允許
        }
    }
    ```

### 2. 無狀態 (Stateless)

每次從客戶端到伺服器的請求都必須包含理解和處理該請求所需的所有資訊。伺服器**不應該**在多次請求之間儲存任何關於客戶端的**會話狀態 (Session State)**。

- **優點**:
  - **可靠性**: 伺服器故障後，請求可以無縫地轉移到另一個伺服器實例。
  - **可擴展性**: 由於無需同步會話狀態，可以輕鬆地增加伺服器節點來進行負載均衡。
  - **可見性**: 每個請求都是獨立的，更容易監控和除錯。

### 3. 可快取 (Cacheable)

伺服器的回應必須明確地標示其自身是否可以被快取。如果可以，客戶端或中介節點（如 CDN）就可以重用舊的回應數據，以提高效能和減少伺服器負載。這通常是透過 HTTP 標頭 `Cache-Control` 和 `ETag` 來實現的。

### 4. 客戶端-伺服器 (Client-Server)

客戶端和伺服器是分離的。客戶端負責使用者介面和使用者體驗，而伺服器負責儲存和處理資料。這種關注點分離使得兩者可以獨立地演進和擴展，只要它們之間的介面保持不變。

### 5. 分層系統 (Layered System)

系統可以由多個層次組成（例如，負載均衡器、快取伺服器、API 閘道器）。客戶端通常只與其直接互動的層次進行通訊，而不知道後續還有哪些伺服器參與了請求的處理。這使得系統架構更具靈活性和可擴展性。

### 6. 按需編碼 (Code-On-Demand) - 可選

這是唯一一個可選的約束。它允許伺服器透過傳輸可執行的程式碼（例如 JavaScript）來臨時擴展或改變客戶端的功能。最常見的例子就是 Web 瀏覽器下載並執行網頁中的 JavaScript 程式碼。

## 總結

一個真正「RESTful」的 API 不僅僅是使用 JSON 和 HTTP 動詞。它必須遵循上述的核心約束，特別是**統一介面**（包括 HATEOAS）和**無狀態**。這些約束共同作用，創造出一個可擴展、有彈性、易於維護的分散式系統架構。在實際的面試中，能夠清晰地闡述這六個約束，特別是 HATEOAS 和無狀態的重要性，是區分普通開發者和資深工程師的關鍵。
