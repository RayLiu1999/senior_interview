# 網路 (Networking) - 重點考題 (Quiz)

> 這份考題是從網路章節中挑選出的核心題目，設計成快速複習與口頭自測。
>
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

### Q1: TCP 三次握手與四次揮手
<!-- Concept ID: concept.network.tcp.connection-management; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請說明 TCP 建立與關閉連線的主要步驟，以及 `SYN-RECV`、`TIME_WAIT`、`CLOSE_WAIT` 各自代表什麼。

<details>
<summary>💡 答案提示</summary>

- 三次握手用於協商雙方的初始序號並建立連線。
- 四次揮手反映雙向資料流分別關閉；主動關閉的一方通常進入 `TIME_WAIT`。
- `SYN-RECV` 表示等待握手完成；`CLOSE_WAIT` 表示收到對方關閉通知但本端應用程式尚未關閉 socket。

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Networking/tcp_handshake_and_termination.md)
