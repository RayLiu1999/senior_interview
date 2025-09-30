# WebSocket

WebSocket 是實現全雙工即時通訊的重要協定。作為資深後端工程師，您需要深入理解 WebSocket 的握手過程、連線維持機制以及與傳統 HTTP 輪詢的差異。本章節涵蓋了面試中最常被考察的 WebSocket 核心主題。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [WebSocket vs. HTTP Polling/Long-Polling](./websocket_vs_polling.md) | 6 | 5 | `WebSocket`, `Polling`, `Real-time`, `Comparison` |
| 2 | [WebSocket 握手過程](./websocket_handshake.md) | 6 | 4 | `WebSocket`, `Handshake`, `Protocol` |
| 3 | [如何維持心跳機制 (Heartbeat)](./heartbeat_mechanism.md) | 5 | 4 | `WebSocket`, `Heartbeat`, `Connection Management` |

---

## 學習建議

1.  **理解協定特性**: WebSocket 提供全雙工通訊，適合即時應用如聊天室、即時通知等場景。
2.  **掌握握手流程**: WebSocket 從 HTTP 升級而來，理解握手過程是深入掌握的關鍵。
3.  **關注連線維持**: 心跳機制、斷線重連、連線池管理是生產環境的必備知識。
4.  **比較不同方案**: 理解 WebSocket、Server-Sent Events、Polling 各自的優劣和適用場景。
5.  **實踐擴展方案**: 在大規模場景下，需要考慮 WebSocket 的水平擴展和負載平衡策略。
