# WebSocket 心跳機制

- **難度**: 6
- **重要性**: 4
- **標籤**: `WebSocket`, `Keepalive`, `Heartbeat`

## 問題詳述

為什麼 WebSocket 需要心跳機制？它的主要作用是什麼？請解釋心跳機制的實現原理。

## 核心理論與詳解

WebSocket 提供了一個持久化的 TCP 連線，允許伺服器和客戶端隨時進行雙向通訊。然而，在實際的網路環境中，一個長時間處於「靜默」狀態（即沒有數據傳輸）的 TCP 連線可能會被中間的網路設備（如 NAT 路由器、防火牆）單方面斷開，而通訊的雙方卻毫不知情。

這就導致了「死連線」(Dead Connection) 問題：客戶端或伺服器以為連線仍然有效，但實際上任何一方發送的數據都無法到達對方。為了解決這個問題，WebSocket 引入了心跳機制。

---

### 心跳機制的核心作用

1.  **保持連線活躍 (Keepalive)**:
    心跳是定期發送的小數據包（控制幀），它的主要目的是告訴中間的網路節點「這個連線是活躍的，請不要因為超時而關閉它」。這重置了 NAT 路由器或防火牆的超時計時器，從而維持了 TCP 連線的持久性。

2.  **檢測死連線 (Connection Health Check)**:
    心跳機制也是一種可靠的連線健康檢查方式。如果一方在指定時間內沒有收到對方的心跳回應，它就可以判斷連線已經中斷，從而可以主動關閉這個「殭屍連線」並嘗試進行重連，而不是無限期地等待。

### 實現原理：Ping/Pong 控制幀

WebSocket 協議本身已經內建了心跳機制，這是通過兩種特殊的**控制幀 (Control Frames)** 來實現的：

-   **Ping 幀**: 由一方（可以是客戶端或伺服器）發送，用來探測連線是否仍然有效。一個 Ping 幀可以選擇性地攜帶一些數據。
-   **Pong 幀**: 當一方收到一個 Ping 幀時，它**必須**盡快回覆一個 Pong 幀。Pong 幀的內容通常需要與它所回應的 Ping 幀的內容完全一致。

這個 Ping/Pong 的一問一答機制構成了 WebSocket 的心跳。

#### 標準實現流程

一個典型的心跳流程如下：

1.  **啟動心跳計時器**:
    -   通常由一方（例如伺服器端）在 WebSocket 連線建立後啟動一個計時器。例如，每隔 30 秒觸發一次。

2.  **發送 Ping 幀**:
    -   當計時器觸發時，伺服器向客戶端發送一個 Ping 幀。這個 Ping 幀可以不包含任何數據，也可以包含一個時間戳或唯一的 ID，用於更精確地匹配回應。

3.  **客戶端回應 Pong 幀**:
    -   客戶端的 WebSocket 庫底層會自動監聽 Ping 幀。當收到 Ping 幀時，它會立即構建一個 Pong 幀並發送回伺服器。根據規範，這個回應應該是自動且迅速的。

4.  **伺服器重置計時器或檢測超時**:
    -   **正常情況**: 伺服器在發送 Ping 幀後，會期待在一個較短的時間窗口內（例如 5 秒）收到對應的 Pong 幀。一旦收到，伺服器就知道連線是健康的，然後等待下一次心跳計時器觸發。
    -   **異常情況 (超時)**: 如果伺服器在發送 Ping 幀後，在指定的超時時間內（如 5 秒）**沒有**收到客戶端的回應，它就可以合理地假設連線已經斷開。此時，伺服器應該主動關閉這個 TCP 連線，釋放相關資源，並將該客戶端標記為離線。

#### 誰來發起心跳？

-   **單向心跳**: 通常由伺服器端發起 Ping，客戶端負責回應 Pong。這是最常見的模式，因為伺服器端管理著所有連線，由它來檢測連線狀態更為集中和高效。
-   **雙向心跳**: 客戶端和伺服器都各自維護一個計時器，並互相發送 Ping/Pong。這種方式更為健壯，可以讓雙方都能及時發現連線問題，但實現起來也更複雜一些。

在大多數應用中，**單向的伺服器到客戶端心跳**已經足夠。

### 程式碼範例 (概念性)

雖然很多 WebSocket 庫會自動處理 Ping/Pong，但了解其背後的邏輯仍然很重要。以下是一個基於 Go 的概念性伺服器端心跳實現。

```go
package main

import (
    "fmt"
    "net/http"
    "time"

    "github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        return true
    },
}

const (
    // 心跳間隔
    heartbeatInterval = 30 * time.Second
    // 等待 Pong 回應的超時時間
    pongWait = 5 * time.Second
)

func handler(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        fmt.Println("Upgrade error:", err)
        return
    }
    defer conn.Close()

    // 設置 Pong 回應的處理函數
    // 這個函數會在收到 Pong 幀時被調用
    conn.SetPongHandler(func(appData string) error {
        fmt.Println("Pong received!")
        // 收到 Pong，延長讀取超時時間
        conn.SetReadDeadline(time.Now().Add(heartbeatInterval + pongWait))
        return nil
    })

    // 啟動一個 goroutine 來定期發送 Ping
    go func() {
        ticker := time.NewTicker(heartbeatInterval)
        defer ticker.Stop()

        for range ticker.C {
            fmt.Println("Sending Ping...")
            // 使用 WriteControl 來發送控制幀
            err := conn.WriteControl(websocket.PingMessage, []byte{}, time.Now().Add(pongWait))
            if err != nil {
                // 發送失敗，意味著連線可能已斷開
                fmt.Println("Ping send error:", err)
                return
            }
        }
    }()

    // 初始設置讀取超時
    conn.SetReadDeadline(time.Now().Add(heartbeatInterval + pongWait))

    // 循環讀取客戶端消息 (此處省略)
    for {
        _, _, err := conn.ReadMessage()
        if err != nil {
            if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
                fmt.Println("Read error:", err)
            }
            break
        }
    }
}

func main() {
    http.HandleFunc("/ws", handler)
    http.ListenAndServe(":8080", nil)
}
```

### 結論

心跳機制是保證 WebSocket 長連線穩定性和可靠性的關鍵。它不僅能防止網路中間件因空閒超時而切斷連線，還提供了一種高效的方式來檢測和處理「死連線」，確保通訊雙方能夠及時了解連線的真實狀態。WebSocket 協議內建的 Ping/Pong 控制幀為此提供了標準化的解決方案。
