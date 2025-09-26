# WebSocket 握手過程

- **難度**: 7
- **重要性**: 4
- **標籤**: `WebSocket`, `HTTP`, `Handshake`

## 問題詳述

請詳細描述 WebSocket 的握手過程。這個過程是如何從一個 HTTP 請求升級到一個 WebSocket 連線的？其中涉及了哪些關鍵的 HTTP 標頭？

## 核心理論與詳解

WebSocket 的一個巧妙之處在於，它**重用**了 HTTP 協議作為其初始化的「引導」協議。這意味著 WebSocket 連線是從一個標準的 HTTP 請求開始的，然後透過一個「升級」機制，將底層的 TCP 連線從 HTTP 協議轉換為 WebSocket 協議。這個過程被稱為 WebSocket 握手 (Handshake)。

這個設計使得 WebSocket 流量可以通過標準的 80 和 443 埠，從而更容易地穿透防火牆。

---

### 握手流程

整個握手過程可以分為兩個部分：客戶端的升級請求和伺服器的同意回應。

#### 1. 客戶端發送升級請求 (Client's Upgrade Request)

客戶端（通常是瀏覽器）會向伺服器發送一個特殊的 HTTP GET 請求。這個請求看起來像一個普通的 GET 請求，但包含了幾個用於協商升級的關鍵標頭。

一個典型的客戶端請求如下：

```http
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: http://example.com
```

**關鍵請求標頭 (Request Headers) 解釋:**

- **`Upgrade: websocket`**:
  - **作用**: 這是最重要的標頭，明確告知伺服器：「客戶端希望將這個連線從 HTTP 升級到 WebSocket 協議」。

- **`Connection: Upgrade`**:
  - **作用**: 這是一個標準的 HTTP/1.1 標頭，用來配合 `Upgrade`。它告訴伺服器或其他中間代理，本次通訊希望改變協議。

- **`Sec-WebSocket-Key`**:
  - **作用**: 這是一個由客戶端隨機產生的、經過 Base64 編碼的 16 位元組金鑰。它的主要目的是為了**防止快取代理汙染**，並證明伺服器確實理解 WebSocket 協議，而不是一個意外回應的舊式 HTTP 伺服器。它**不是**用於身份驗證或安全加密的。

- **`Sec-WebSocket-Version: 13`**:
  - **作用**: 指定客戶端希望使用的 WebSocket 協議版本。目前 `13` 是最廣泛使用的版本。如果伺服器不支援這個版本，它可以回應一個包含它所支援的版本列表的錯誤。

- **`Origin`**:
  - **作用**: 這是瀏覽器基於安全考慮（同源策略）發送的標頭，表明這個請求來自哪個源。伺服器可以根據這個值來決定是否接受來自該源的 WebSocket 連線，從而防止跨站的 WebSocket 請求。

#### 2. 伺服器發送接受回應 (Server's Acceptance Response)

如果伺服器同意升級請求，它會返回一個特殊的 HTTP `101 Switching Protocols` 狀態碼的回應，而不是通常的 `200 OK`。

一個典型的伺服器回應如下：

```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

**關鍵回應標頭 (Response Headers) 解釋:**

- **`HTTP/1.1 101 Switching Protocols`**:
  - **作用**: 這個狀態碼明確地告訴客戶端：「我同意你的請求，我們現在開始切換協議」。

- **`Upgrade: websocket`** 和 **`Connection: Upgrade`**:
  - **作用**: 伺服器必須在回應中也包含這兩個標頭，以確認它已經理解並同意了協議升級。

- **`Sec-WebSocket-Accept`**:
  - **作用**: 這是握手過程中最關鍵的安全驗證部分。伺服器**必須**根據客戶端發送的 `Sec-WebSocket-Key` 來計算這個值。
  - **計算方法**:
    1.  獲取客戶端請求中的 `Sec-WebSocket-Key` 的值（例如 `dGhlIHNhbXBsZSBub25jZQ==`）。
    2.  將這個值與一個固定的、在 RFC 6455 規範中定義的「魔術字串」(Magic String) `258EAFA5-E914-47DA-95CA-C5AB0DC85B11` 進行拼接。
    3.  對拼接後的新字串計算 SHA-1 雜湊值。
    4.  將計算出的 SHA-1 雜湊值進行 Base64 編碼。
    5.  將最終的 Base64 編碼字串作為 `Sec-WebSocket-Accept` 標頭的值返回。

  - **驗證**: 客戶端收到回應後，會用同樣的方法在本地計算一次，並驗證伺服器返回的 `Sec-WebSocket-Accept` 是否與自己的計算結果相符。如果相符，客戶端就確信對方是一個真正的 WebSocket 伺服器。

### 握手完成之後

一旦客戶端驗證了伺服器的回應，握手就成功完成了。從這一刻起，這個底層的 TCP 連線就不再遵循 HTTP 協議了。它變成了一個持久化的、全雙工的 WebSocket 連線。之後在這個連線上傳輸的數據都將以 **WebSocket 數據幀 (Data Frame)** 的格式進行封裝，而不是 HTTP 報文。

### 結論

WebSocket 握手是一個聰明的設計，它利用了現有的 HTTP 基礎設施來發起連線，同時透過一組特定的標頭和一個基於挑戰-回應的機制 (`Sec-WebSocket-Key` / `Sec-WebSocket-Accept`) 來確保通訊雙方都明確地同意切換到 WebSocket 協議。這個過程保證了協議的兼容性和基本的安全性，為後續高效的即時雙向數據傳輸鋪平了道路。
