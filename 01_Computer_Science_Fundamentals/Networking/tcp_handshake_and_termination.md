# TCP 三次握手與四次揮手

- **難度**: 5
- **重要程度**: 5
- **標籤**: `TCP`, `連接管理`, `狀態機`, `可靠傳輸`

## 問題詳述

TCP (Transmission Control Protocol) 是面向連接的可靠傳輸協定。在建立連接時，雙方會進行**三次握手** (Three-Way Handshake)；在關閉連接時，通常會進行**四次揮手** (Four-Way Termination)。這是後端工程師面試中的常見題目，重點是理解訊息交換、狀態轉換，以及這些機制要解決的問題。

### 測驗對應

- **Concept ID**: `concept.network.tcp.connection-management`
- **Learning Objectives**:
  - `LO-1`: 能依序說明三次握手與四次揮手中的訊息、序列號與狀態轉換。
  - `LO-2`: 能區分 `SYN-RECV`、`TIME_WAIT` 與 `CLOSE_WAIT` 所代表的故障方向。
  - `LO-3`: 能根據連接指標設計分層排查流程，並評估連接重用與核心調校的取捨。
- **硬測驗**: [TCP 連接診斷](../../QUIZ/Hard_Assessments/tcp_connection_diagnosis.md)
- **Quick Quiz**: [Q1](../../QUIZ/01_Networking.md#q1-tcp-三次握手與四次揮手)
- **覆蓋題型**: `追蹤`, `故障診斷`, `權衡取捨`

## 核心理論與詳解

### 先用 30 秒建立模型

TCP 的連接管理可以先記成兩條主線：

- **三次握手**：雙方交換並確認初始序列號，確認彼此具備發送與接收能力，然後進入 `ESTABLISHED`。
- **四次揮手**：TCP 是全雙工連接，兩個傳輸方向必須分別關閉，因此通常需要分開傳送 `FIN` 與 `ACK`。

| 階段 | 主要訊息 | 需要回答的問題 |
| :--- | :--- | :--- |
| 建立連接 | `SYN`、`SYN+ACK`、`ACK` | 雙方是否準備好通信？初始序列號是多少？ |
| 關閉連接 | `FIN`、`ACK`、`FIN`、`ACK` | 哪個方向停止發送？另一個方向何時也完成關閉？ |

### 閱讀路線

如果目標是面試快速複習，先讀三次握手、四次揮手與狀態轉換圖；只有在需要診斷高併發連接問題時，再閱讀 `TIME_WAIT`、連接佇列與 SYN Flood。最下方的 Go 程式碼是觀察工具，不是 TCP 握手本身的實作。

### 1. TCP 三次握手 (Connection Establishment)

#### 握手流程

```
客戶端 (Client)                       伺服器 (Server)
     │                                      │
     │  ① SYN (seq=x)                       │  LISTEN
     │─────────────────────────────────────>│
     │                                      │  SYN_RCVD
     │                                      │
     │  ② SYN+ACK (seq=y, ack=x+1)          │
     │<─────────────────────────────────────│
     │  ESTABLISHED                         │
     │                                      │
     │  ③ ACK (seq=x+1, ack=y+1)            │
     │─────────────────────────────────────>│
     │                                      │  ESTABLISHED
     │                                      │
     │  數據傳輸開始                         │
     │<────────────────────────────────────>│
```

#### 詳細步驟解析

**第一次握手 (SYN)**:
- **發送方**: 客戶端
- **標誌位**: `SYN = 1`
- **序列號**: `seq = x` (隨機生成的初始序列號,ISN - Initial Sequence Number)
- **狀態變化**: 客戶端從 `CLOSED` → `SYN_SENT`
- **目的**: 客戶端告訴伺服器「我想建立連接,我的初始序列號是 x」

**第二次握手 (SYN + ACK)**:
- **發送方**: 伺服器
- **標誌位**: `SYN = 1`, `ACK = 1`
- **序列號**: `seq = y` (伺服器隨機生成的 ISN)
- **確認號**: `ack = x + 1` (表示「我收到了你的 x,期待你下一個封包從 x+1 開始」)
- **狀態變化**: 伺服器從 `LISTEN` → `SYN_RCVD`
- **目的**: 伺服器告訴客戶端「我收到了你的請求,我同意建立連接,我的初始序列號是 y」

**第三次握手 (ACK)**:
- **發送方**: 客戶端
- **標誌位**: `ACK = 1`
- **序列號**: `seq = x + 1`
- **確認號**: `ack = y + 1`
- **狀態變化**: 
  - 客戶端從 `SYN_SENT` → `ESTABLISHED`
  - 伺服器從 `SYN_RCVD` → `ESTABLISHED`
- **目的**: 客戶端確認「我收到了你的確認,連接建立成功」

#### 為什麼需要三次握手?

**1. 防止舊連接初始化**

如果只有兩次握手,可能出現以下問題:

```
場景: 客戶端發送的第一個 SYN 因網路延遲而滯留

時間線:
1. 客戶端發送 SYN₁ (因網路問題延遲)
2. 客戶端超時,重新發送 SYN₂
3. SYN₂ 成功建立連接,數據傳輸,連接關閉
4. 滯留的 SYN₁ 終於到達伺服器
5. 如果只有兩次握手,伺服器會認為這是新的連接請求
   並返回 SYN+ACK,進入 ESTABLISHED 狀態
6. 但客戶端已經關閉,不會回應,導致伺服器資源浪費
```

有了第三次握手,客戶端可以在第三次握手時拒絕這個舊連接。

**2. 同步雙方的初始序列號 (ISN)**

- 客戶端需要知道伺服器的 ISN
- 伺服器需要知道客戶端的 ISN
- 需要三次握手才能完成雙向的 ISN 同步和確認

**3. 確認雙方的接收能力**

- 第一次握手: 伺服器確認「客戶端的發送能力正常」
- 第二次握手: 客戶端確認「伺服器的接收和發送能力正常」
- 第三次握手: 伺服器確認「客戶端的接收能力正常」

### 2. TCP 四次揮手 (Connection Termination)

#### 揮手流程

```
客戶端 (Client)                       伺服器 (Server)
     │  ESTABLISHED                        │  ESTABLISHED
     │                                     │
     │  ① FIN (seq=u)                      │
     │────────────────────────────────────>│
     │  FIN_WAIT_1                         │  CLOSE_WAIT
     │                                     │
     │  ② ACK (ack=u+1)                    │
     │<────────────────────────────────────│
     │  FIN_WAIT_2                         │
     │                                     │
     │      (伺服器可能繼續發送數據)        │
     │<────────────────────────────────────│
     │                                     │
     │  ③ FIN (seq=w)                      │
     │<────────────────────────────────────│
     │  TIME_WAIT                          │  LAST_ACK
     │                                     │
     │  ④ ACK (ack=w+1)                    │
     │────────────────────────────────────>│
     │                                     │  CLOSED
     │  (等待 2MSL)                        │
     │  CLOSED                             │
```

#### 詳細步驟解析

**第一次揮手 (FIN from Client)**:
- **發送方**: 客戶端 (主動關閉方)
- **標誌位**: `FIN = 1`
- **序列號**: `seq = u`
- **狀態變化**: 客戶端從 `ESTABLISHED` → `FIN_WAIT_1`
- **含義**: 「我沒有數據要發送了,但仍可以接收數據」

**第二次揮手 (ACK from Server)**:
- **發送方**: 伺服器 (被動關閉方)
- **標誌位**: `ACK = 1`
- **確認號**: `ack = u + 1`
- **狀態變化**: 
  - 伺服器從 `ESTABLISHED` → `CLOSE_WAIT`
  - 客戶端從 `FIN_WAIT_1` → `FIN_WAIT_2`
- **含義**: 「我知道你要關閉連接了,但我可能還有數據要發送」

**第三次揮手 (FIN from Server)**:
- **發送方**: 伺服器
- **標誌位**: `FIN = 1`
- **序列號**: `seq = w`
- **狀態變化**: 伺服器從 `CLOSE_WAIT` → `LAST_ACK`
- **含義**: 「我的數據也發送完了,可以關閉連接了」

**第四次揮手 (ACK from Client)**:
- **發送方**: 客戶端
- **標誌位**: `ACK = 1`
- **確認號**: `ack = w + 1`
- **狀態變化**: 
  - 客戶端從 `FIN_WAIT_2` → `TIME_WAIT` (等待 2MSL 後) → `CLOSED`
  - 伺服器從 `LAST_ACK` → `CLOSED`
- **含義**: 「我確認收到你的關閉請求,連接關閉」

#### 為什麼需要四次揮手?

**TCP 是全雙工通信**:
- 客戶端發送 FIN,只代表客戶端不再發送數據
- 但伺服器可能還有數據要發送
- 所以需要伺服器單獨發送 FIN 來關閉另一個方向的連接

**為什麼不能合併為三次?**
- 在某些情況下可以合併 (如果伺服器沒有數據要發送,可以在第二次揮手時同時發送 FIN+ACK)
- 但通常情況下,伺服器收到 FIN 後可能還有數據要發送,所以需要分開

### 3. TCP 狀態轉換圖

#### 完整狀態機

```
                              +---------+
                              |  CLOSED |
                              +----+----+
                                   |
                    主動開啟 / 發送 SYN
                                   |
                                   v
                            +-------------+
                    ┌───────| SYN_SENT    |
                    |       +-------------+
                    |              |
          接收 SYN  |              | 接收 SYN+ACK / 發送 ACK
          發送 SYN+ACK |            v
                    |       +-------------+
                    └──────>| ESTABLISHED |<──────┐
                            +------+------+       |
                                   |              |
                           主動關閉 |              | 被動開啟
                         發送 FIN   |              | 接收 SYN / 發送 SYN+ACK
                                   |              |
                                   v              |
                            +-------------+  +-----------+
                            | FIN_WAIT_1  |  | LISTEN    |
                            +------+------+  +-----------+
                                   |              |
                   接收 ACK        |              | 接收 SYN / 發送 SYN+ACK
                                   |              v
                                   v         +-------------+
                            +-------------+  | SYN_RCVD    |
                            | FIN_WAIT_2  |  +------+------+
                            +------+------+         |
                                   |                | 接收 ACK
                   接收 FIN        |                v
                   發送 ACK        |         +-------------+
                                   └────────>| ESTABLISHED |
                                             +------+------+
                                                    |
                                          被動關閉  |
                                          接收 FIN / 發送 ACK
                                                    |
                                                    v
                                             +-------------+
                                             | CLOSE_WAIT  |
                                             +------+------+
                                                    |
                                             發送 FIN
                                                    |
                                                    v
                                             +-------------+
                                             | LAST_ACK    |
                                             +------+------+
                                                    |
                                             接收 ACK
                                                    |
                                                    v
                                             +---------+
                                             | CLOSED  |
                                             +---------+
```

#### 關鍵狀態說明

| 狀態 | 說明 | 誰會處於此狀態 |
|------|------|----------------|
| **CLOSED** | 初始狀態,沒有連接 | 所有 |
| **LISTEN** | 伺服器等待連接 | 伺服器 |
| **SYN_SENT** | 發送 SYN,等待確認 | 客戶端 |
| **SYN_RCVD** | 收到 SYN,發送 SYN+ACK,等待 ACK | 伺服器 |
| **ESTABLISHED** | 連接建立,可以傳輸數據 | 雙方 |
| **FIN_WAIT_1** | 發送 FIN,等待 ACK 或 FIN | 主動關閉方 |
| **FIN_WAIT_2** | 收到 ACK,等待對方的 FIN | 主動關閉方 |
| **CLOSE_WAIT** | 收到 FIN,發送 ACK,等待應用關閉 | 被動關閉方 |
| **LAST_ACK** | 發送 FIN,等待最後的 ACK | 被動關閉方 |
| **TIME_WAIT** | 收到 FIN,發送 ACK,等待 2MSL | 主動關閉方 |
| **CLOSING** | 同時關閉的中間狀態 | 雙方同時關閉 |

### 4. TIME_WAIT 狀態深入解析

#### 為什麼需要 TIME_WAIT?

**1. 確保最後的 ACK 能夠到達**

```
如果沒有 TIME_WAIT,直接進入 CLOSED:

客戶端                    伺服器
   │                        │ LAST_ACK
   │  ④ ACK                 │
   │───────X (丟失)────────>│
   │ CLOSED                 │
   │                        │ 超時重傳 FIN
   │  FIN                   │
   │<───────────────────────│
   │ (已關閉,無法回應)       │
   │                        │ 伺服器無法正常關閉
```

有了 TIME_WAIT,客戶端會在 2MSL 時間內等待:
- 如果收到重傳的 FIN,可以重新發送 ACK
- 確保伺服器能夠正常進入 CLOSED 狀態

**2. 防止舊連接的數據包干擾新連接**

```
場景: 快速重用同一個 (IP:Port) 四元組

1. 舊連接關閉,但網路中可能還有滯留的數據包
2. 立即建立新連接 (相同的 IP 和 Port)
3. 舊連接的滯留數據包到達,被新連接誤認為是自己的數據
4. 導致數據混亂

TIME_WAIT 等待 2MSL (Maximum Segment Lifetime):
- 確保舊連接的所有數據包都已經消失
- MSL 通常是 30 秒到 2 分鐘
- 2MSL = 60 秒到 4 分鐘
```

#### TIME_WAIT 的問題

**高並發場景下的問題**:
- 每個 TIME_WAIT 連接會占用一個本地端口 (客戶端端口範圍通常是 32768-61000,約 28000 個)
- 如果短時間內建立大量連接,可能耗盡本地端口
- 伺服器端如果是主動關閉方,也會產生大量 TIME_WAIT

**解決方案**:

> 以下 `sysctl` 設定僅用於說明可調整的方向，不是通用的最佳值。實際調整前，應先確認作業系統版本、流量特徵、核心參數與監控數據，並在測試環境驗證影響。

```bash
# Linux 系統優化

# 1. 啟用 TIME_WAIT 快速回收 (謹慎使用,可能導致問題)
net.ipv4.tcp_tw_reuse = 1

# 2. 縮短 FIN 超時時間
net.ipv4.tcp_fin_timeout = 30

# 3. 增加本地端口範圍
net.ipv4.ip_local_port_range = 10000 65000

# 4. 啟用 TCP 時間戳 (配合 tw_reuse 使用)
net.ipv4.tcp_timestamps = 1
```

**程式碼層面**:
- 盡量讓客戶端主動關閉連接 (TIME_WAIT 分散到客戶端)
- 使用連接池,重用連接
- 使用 HTTP Keep-Alive

### 5. 半連接隊列與全連接隊列

#### 半連接隊列 (SYN Queue)

**定義**: 儲存處於 `SYN_RCVD` 狀態的連接

**流程**:
```
1. 伺服器收到 SYN,放入半連接隊列
2. 發送 SYN+ACK
3. 收到 ACK 後,從半連接隊列移除,放入全連接隊列
```

**隊列滿的後果**:
- 新的 SYN 請求會被丟棄
- 可能導致 SYN Flood 攻擊

**調整參數**:
```bash
# 半連接隊列大小
net.ipv4.tcp_max_syn_backlog = 8192

# SYN Cookie (防禦 SYN Flood)
net.ipv4.tcp_syncookies = 1
```

#### 全連接隊列 (Accept Queue)

**定義**: 儲存處於 `ESTABLISHED` 狀態,等待應用程序 `accept()` 的連接

**流程**:
```
1. 三次握手完成,連接進入全連接隊列
2. 應用程序調用 accept() 從隊列中取出連接
3. 開始數據傳輸
```

**隊列滿的後果**:
- 新完成的連接無法進入隊列
- 客戶端會收到 RST (重置)
- 或者伺服器會丟棄 ACK,導致客戶端重傳

**調整參數**:
```bash
# 全連接隊列大小 (取 somaxconn 和 listen backlog 的最小值)
net.core.somaxconn = 8192

# 在程式碼中設置 backlog
listen(sockfd, 8192)  // C 語言
```

### 6. SYN Flood 攻擊與防禦

#### 攻擊原理

```
攻擊者                        伺服器
   │                            │
   │  SYN (偽造源 IP)            │
   │───────────────────────────>│ 放入半連接隊列
   │                            │ 發送 SYN+ACK (發往偽造的 IP)
   │                            │
   │  (不回應 ACK)               │ 等待超時 (通常 63 秒)
   │                            │
   │  大量 SYN...               │ 半連接隊列被填滿
   │───────────────────────────>│
   │                            │ 正常連接無法建立
```

**後果**:
- 半連接隊列被填滿
- 伺服器資源耗盡 (記憶體、CPU)
- 正常用戶無法建立連接

#### 防禦措施

**1. SYN Cookie**

原理: 不使用半連接隊列,而是將連接信息編碼到 ISN 中

```bash
net.ipv4.tcp_syncookies = 1
```

工作流程:
```
1. 收到 SYN,不創建 SYN_RCVD 結構
2. 根據客戶端信息計算一個特殊的 ISN (Cookie)
3. 發送 SYN+ACK,ISN = Cookie
4. 收到 ACK 後,驗證 Cookie 是否正確
5. 如果正確,直接創建 ESTABLISHED 連接
```

優點: 不占用半連接隊列
缺點: 無法使用 TCP 選項 (如窗口縮放)

**2. 增加半連接隊列大小**

```bash
net.ipv4.tcp_max_syn_backlog = 16384
```

**3. 減少 SYN+ACK 重傳次數**

```bash
# 默認重傳 5 次,等待約 63 秒
# 調整為重傳 2 次,等待約 7 秒
net.ipv4.tcp_synack_retries = 2
```

**4. 使用防火牆 / 負載均衡器**

- **速率限制**: 限制單一 IP 的 SYN 請求速率
- **IP 黑名單**: 封鎖攻擊來源
- **SYN Proxy**: 防火牆代替伺服器完成三次握手

## 程式碼範例 (可選)

以下程式碼只示範如何建立 TCP 連接、觀察狀態與設定 Socket 選項。三次握手與四次揮手由作業系統的 TCP 協定棧自動完成，應將這段程式碼視為觀察工具，而不是握手流程的手動實作。

```go
package main

import (
	"fmt"
	"net"
	"os"
	"syscall"
	"time"
)

// 演示 TCP 三次握手與四次揮手

// 1. 簡單的 TCP 伺服器,觀察連接建立和關閉
func tcpServer() {
	// 監聽 TCP 端口
	listener, err := net.Listen("tcp", ":8080")
	if err != nil {
		fmt.Println("監聽失敗:", err)
		return
	}
	defer listener.Close()
	
	fmt.Println("伺服器啟動,監聽 :8080")
	fmt.Println("三次握手過程:")
	fmt.Println("  1. 收到 SYN,進入 SYN_RCVD 狀態")
	fmt.Println("  2. 發送 SYN+ACK")
	fmt.Println("  3. 收到 ACK,進入 ESTABLISHED 狀態")
	fmt.Println()
	
	for {
		// accept() 從全連接隊列中取出連接
		// 此時三次握手已經完成
		conn, err := listener.Accept()
		if err != nil {
			fmt.Println("接受連接失敗:", err)
			continue
		}
		
		fmt.Printf("✅ 連接建立: %s → %s\n", conn.RemoteAddr(), conn.LocalAddr())
		
		// 處理連接
		go handleConnection(conn)
	}
}

func handleConnection(conn net.Conn) {
	defer func() {
		fmt.Printf("🔴 開始四次揮手: %s\n", conn.RemoteAddr())
		conn.Close() // 觸發四次揮手
		fmt.Printf("🔴 連接關閉: %s\n", conn.RemoteAddr())
	}()
	
	// 讀取數據
	buffer := make([]byte, 1024)
	n, err := conn.Read(buffer)
	if err != nil {
		fmt.Println("讀取失敗:", err)
		return
	}
	
	fmt.Printf("📩 收到數據 (%d 字節): %s\n", n, buffer[:n])
	
	// 回應數據
	response := "HTTP/1.1 200 OK\r\nContent-Length: 13\r\n\r\nHello, World!"
	_, err = conn.Write([]byte(response))
	if err != nil {
		fmt.Println("發送失敗:", err)
		return
	}
	
	fmt.Printf("📤 發送響應\n")
	
	// 短暫延遲,模擬處理時間
	time.Sleep(1 * time.Second)
}

// 2. TCP 客戶端,主動建立連接
func tcpClient() {
	fmt.Println("客戶端開始三次握手:")
	fmt.Println("  1. 發送 SYN,進入 SYN_SENT 狀態")
	fmt.Println("  2. 收到 SYN+ACK")
	fmt.Println("  3. 發送 ACK,進入 ESTABLISHED 狀態")
	fmt.Println()
	
	// Dial 會自動完成三次握手
	conn, err := net.Dial("tcp", "localhost:8080")
	if err != nil {
		fmt.Println("連接失敗:", err)
		return
	}
	defer conn.Close()
	
	fmt.Printf("✅ 連接建立成功: %s → %s\n", conn.LocalAddr(), conn.RemoteAddr())
	
	// 發送數據
	request := "GET / HTTP/1.1\r\nHost: localhost\r\n\r\n"
	_, err = conn.Write([]byte(request))
	if err != nil {
		fmt.Println("發送失敗:", err)
		return
	}
	
	fmt.Println("📤 發送請求")
	
	// 接收響應
	buffer := make([]byte, 1024)
	n, err := conn.Read(buffer)
	if err != nil {
		fmt.Println("接收失敗:", err)
		return
	}
	
	fmt.Printf("📩 收到響應 (%d 字節):\n%s\n", n, buffer[:n])
	
	fmt.Println("\n客戶端主動關閉連接 (四次揮手):")
	fmt.Println("  1. 發送 FIN,進入 FIN_WAIT_1 狀態")
	fmt.Println("  2. 收到 ACK,進入 FIN_WAIT_2 狀態")
	fmt.Println("  3. 收到 FIN,進入 TIME_WAIT 狀態")
	fmt.Println("  4. 發送 ACK,等待 2MSL 後關閉")
}

// 3. 使用 netstat 觀察 TCP 狀態
func demonstrateTCPStates() {
	fmt.Println("\n使用 netstat 觀察 TCP 狀態:")
	fmt.Println("在另一個終端執行以下命令:")
	fmt.Println("  Linux/Mac: netstat -an | grep 8080")
	fmt.Println("  或使用: ss -tan | grep 8080")
	fmt.Println("\n你會看到類似的輸出:")
	fmt.Println("  tcp  0  0  0.0.0.0:8080  0.0.0.0:*  LISTEN       # 伺服器監聽")
	fmt.Println("  tcp  0  0  127.0.0.1:8080  127.0.0.1:54321  ESTABLISHED  # 連接已建立")
	fmt.Println("  tcp  0  0  127.0.0.1:54321  127.0.0.1:8080  FIN_WAIT_2   # 主動關閉,等待對方 FIN")
	fmt.Println("  tcp  0  0  127.0.0.1:8080  127.0.0.1:54321  CLOSE_WAIT   # 被動關閉,等待應用關閉")
	fmt.Println("  tcp  0  0  127.0.0.1:54321  127.0.0.1:8080  TIME_WAIT    # 等待 2MSL")
}

// 4. 配置 TCP 參數 (需要 root 權限)
func configureTCPParameters() {
	fmt.Println("\n=== TCP 參數配置建議 ===\n")
	
	fmt.Println("# 查看當前 TCP 參數")
	fmt.Println("sysctl -a | grep tcp")
	fmt.Println()
	
	fmt.Println("# 半連接隊列大小 (防禦 SYN Flood)")
	fmt.Println("sysctl -w net.ipv4.tcp_max_syn_backlog=8192")
	fmt.Println()
	
	fmt.Println("# 全連接隊列大小")
	fmt.Println("sysctl -w net.core.somaxconn=8192")
	fmt.Println()
	
	fmt.Println("# 啟用 SYN Cookie (防禦 SYN Flood)")
	fmt.Println("sysctl -w net.ipv4.tcp_syncookies=1")
	fmt.Println()
	
	fmt.Println("# TIME_WAIT 優化 (高並發場景)")
	fmt.Println("sysctl -w net.ipv4.tcp_tw_reuse=1      # 允許重用 TIME_WAIT")
	fmt.Println("sysctl -w net.ipv4.tcp_fin_timeout=30  # 縮短 FIN 超時時間")
	fmt.Println()
	
	fmt.Println("# SYN+ACK 重傳次數 (減少 SYN Flood 影響)")
	fmt.Println("sysctl -w net.ipv4.tcp_synack_retries=2")
	fmt.Println()
	
	fmt.Println("# 增加本地端口範圍 (避免端口耗盡)")
	fmt.Println("sysctl -w net.ipv4.ip_local_port_range='10000 65000'")
}

// 5. 設置 Socket 選項
func socketOptions() error {
	// 創建 socket
	fd, err := syscall.Socket(syscall.AF_INET, syscall.SOCK_STREAM, syscall.IPPROTO_TCP)
	if err != nil {
		return fmt.Errorf("創建 socket 失敗: %v", err)
	}
	defer syscall.Close(fd)
	
	// 設置 SO_REUSEADDR (允許 TIME_WAIT 狀態的端口被重用)
	// 這對伺服器重啟很有用
	err = syscall.SetsockoptInt(fd, syscall.SOL_SOCKET, syscall.SO_REUSEADDR, 1)
	if err != nil {
		return fmt.Errorf("設置 SO_REUSEADDR 失敗: %v", err)
	}
	fmt.Println("✅ SO_REUSEADDR 已啟用 (允許端口快速重用)")
	
	// 設置 SO_KEEPALIVE (啟用 TCP Keep-Alive)
	// 定期發送探測封包,檢測連接是否仍然存活
	err = syscall.SetsockoptInt(fd, syscall.SOL_SOCKET, syscall.SO_KEEPALIVE, 1)
	if err != nil {
		return fmt.Errorf("設置 SO_KEEPALIVE 失敗: %v", err)
	}
	fmt.Println("✅ SO_KEEPALIVE 已啟用 (檢測死連接)")
	
	// 設置 TCP_NODELAY (禁用 Nagle 算法)
	// 立即發送小封包,減少延遲
	err = syscall.SetsockoptInt(fd, syscall.IPPROTO_TCP, syscall.TCP_NODELAY, 1)
	if err != nil {
		return fmt.Errorf("設置 TCP_NODELAY 失敗: %v", err)
	}
	fmt.Println("✅ TCP_NODELAY 已啟用 (降低延遲)")
	
	return nil
}

// 6. 監控 TCP 連接狀態
func monitorTCPConnections() {
	fmt.Println("\n=== TCP 連接監控 ===\n")
	
	// 在 Linux 上可以讀取 /proc/net/tcp
	if _, err := os.Stat("/proc/net/tcp"); err == nil {
		fmt.Println("可以通過 /proc/net/tcp 監控 TCP 連接:")
		fmt.Println("  cat /proc/net/tcp")
		fmt.Println()
	}
	
	fmt.Println("常用監控命令:")
	fmt.Println("  1. netstat -antp          # 查看所有 TCP 連接")
	fmt.Println("  2. ss -tan                # 更快的 socket 統計工具")
	fmt.Println("  3. ss -s                  # 查看統計摘要")
	fmt.Println("  4. ss -tan state TIME-WAIT | wc -l  # 統計 TIME_WAIT 數量")
	fmt.Println()
	
	fmt.Println("監控指標:")
	fmt.Println("  - ESTABLISHED 連接數     # 當前活躍連接")
	fmt.Println("  - TIME_WAIT 連接數       # 等待關閉的連接")
	fmt.Println("  - SYN_RECV 連接數        # 半連接隊列長度")
	fmt.Println("  - CLOSE_WAIT 連接數      # 應用未正確關閉的連接 (洩漏)")
}

func main() {
	fmt.Println("=== TCP 三次握手與四次揮手演示 ===\n")
	
	// 演示 TCP 狀態
	demonstrateTCPStates()
	
	// 顯示 TCP 參數配置
	configureTCPParameters()
	
	// 演示 Socket 選項
	fmt.Println("\n=== Socket 選項演示 ===")
	if err := socketOptions(); err != nil {
		fmt.Println("錯誤:", err)
	}
	
	// 顯示監控命令
	monitorTCPConnections()
	
	fmt.Println("\n=== 啟動 TCP 伺服器和客戶端 ===")
	fmt.Println("取消註釋以下代碼來運行伺服器/客戶端:")
	fmt.Println("  // go tcpServer()  // 在 goroutine 中啟動伺服器")
	fmt.Println("  // time.Sleep(1 * time.Second)")
	fmt.Println("  // tcpClient()    // 啟動客戶端")
	
	// 取消註釋以下代碼來實際運行
	// go tcpServer()
	// time.Sleep(1 * time.Second)
	// tcpClient()
	// time.Sleep(5 * time.Second) // 等待 TIME_WAIT
}
```

**程式碼說明**:

1. **tcpServer**: 演示伺服器端的連接建立和關閉過程
2. **tcpClient**: 演示客戶端的連接建立和主動關閉
3. **demonstrateTCPStates**: 說明如何使用 netstat 觀察 TCP 狀態
4. **configureTCPParameters**: 展示重要的 TCP 內核參數配置
5. **socketOptions**: 演示如何設置 Socket 選項來優化 TCP 行為
6. **monitorTCPConnections**: 提供監控 TCP 連接的命令和指標

## 總結

### 關鍵要點

1. **三次握手**: 確保雙方的發送和接收能力,同步 ISN,防止舊連接干擾
2. **四次揮手**: 因為 TCP 是全雙工,需要分別關閉兩個方向的連接
3. **TIME_WAIT**: 確保最後的 ACK 到達,防止舊數據包干擾新連接
4. **半連接/全連接隊列**: 理解隊列機制,避免 SYN Flood 攻擊
5. **狀態轉換**: 掌握 TCP 狀態機,能夠診斷連接問題

### 面試高頻問題

1. **Q: 為什麼是三次握手,不是兩次或四次?**
   - A: 兩次無法防止舊連接初始化;三次是完成雙向 ISN 同步的最小次數;四次是冗餘的

2. **Q: 為什麼是四次揮手,不能合併為三次?**
   - A: TCP 是全雙工,被動關閉方收到 FIN 後可能還有數據要發送,所以 ACK 和 FIN 不能合併

3. **Q: TIME_WAIT 狀態的作用?持續多久?**
   - A: ① 確保最後的 ACK 到達 ② 防止舊連接的數據包干擾新連接;持續 2MSL (通常 60 秒到 4 分鐘)

4. **Q: 如何應對大量 TIME_WAIT 連接?**
   - A: ① 啟用 tcp_tw_reuse ② 增加本地端口範圍 ③ 使用連接池 ④ 讓客戶端主動關閉連接

5. **Q: 什麼是 SYN Flood 攻擊?如何防禦?**
   - A: 攻擊者發送大量 SYN,填滿半連接隊列;防禦: ① 啟用 SYN Cookie ② 增大隊列 ③ 減少重傳次數 ④ 使用防火牆

### 延伸閱讀

- **下一步**: [TCP 可靠傳輸機制](./tcp_reliable_transmission.md)
- **相關主題**: [網路效能優化策略](./network_performance_optimization.md)
- **實作練習**: 使用 Wireshark 抓包,觀察三次握手和四次揮手的完整過程
