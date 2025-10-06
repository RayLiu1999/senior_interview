# TCP vs UDP 對比與選擇

- **難度**: 4
- **重要程度**: 5
- **標籤**: `TCP`, `UDP`, `協定選擇`, `傳輸層`

## 問題詳述

TCP 和 UDP 是傳輸層的兩大核心協定。TCP 提供可靠、有序的連接導向服務,UDP 提供不可靠的無連接服務。理解它們的特性差異和適用場景,是後端開發的基礎知識。

## 核心理論與詳解

### 1. TCP vs UDP 核心特性對比

| 特性 | TCP | UDP |
|------|-----|-----|
| **連接方式** | 面向連接 (三次握手/四次揮手) | 無連接 (即發即送) |
| **可靠性** | 可靠 (確認、重傳、順序保證) | 不可靠 (盡力而為,Best Effort) |
| **順序** | 保證數據順序 | 不保證順序 |
| **速度** | 較慢 (開銷大) | 較快 (開銷小) |
| **頭部大小** | 20-60 字節 | 8 字節 |
| **擁塞控制** | 有 (慢啟動、擁塞避免) | 無 |
| **流量控制** | 有 (滑動窗口) | 無 |
| **連接狀態** | 需維護狀態 (內存開銷) | 無狀態 |
| **多播/廣播** | 不支持 | 支持 |
| **資料邊界** | 字節流 (無邊界) | 數據報 (有邊界) |

### 2. TCP 詳細特性

#### 頭部結構 (20 字節基礎)

```
0                   15 16                             31
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          源端口 (16)            |      目標端口 (16)      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    序列號 (32)                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    確認號 (32)                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|頭長|保留|標誌位|        窗口大小 (16)                  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           校驗和 (16)           |     緊急指針 (16)      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    選項 (可變)                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

**標誌位**: URG, ACK, PSH, RST, SYN, FIN

#### 優勢

1. **可靠性**: 確認、重傳、序號確保數據完整到達
2. **順序保證**: 即使數據包亂序到達,也能正確重組
3. **流量控制**: 防止發送方壓垮接收方
4. **擁塞控制**: 防止網路過載
5. **連接管理**: 明確的建立和釋放連接過程

#### 劣勢

1. **延遲高**: 三次握手、確認機制增加延遲
2. **開銷大**: 20字節頭部 + 狀態維護
3. **不支持多播**: 只能點對點通信
4. **隊頭阻塞**: 一個數據包丟失會阻塞後續數據

### 3. UDP 詳細特性

#### 頭部結構 (8 字節)

```
0                   15 16                             31
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          源端口 (16)            |      目標端口 (16)      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          長度 (16)              |      校驗和 (16)        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                     數據                                |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

#### 優勢

1. **低延遲**: 無連接建立,即發即送
2. **低開銷**: 8字節頭部,無狀態維護
3. **支持多播/廣播**: 一對多通信
4. **無隊頭阻塞**: 數據包獨立處理
5. **靈活**: 應用層可自行實現可靠性

#### 劣勢

1. **不可靠**: 數據包可能丟失、重複、亂序
2. **無流量控制**: 可能壓垮接收方
3. **無擁塞控制**: 可能造成網路擁塞
4. **應用層負擔**: 需要自行處理可靠性

### 4. 適用場景對比

#### TCP 適用場景

**1. 需要可靠傳輸的應用**

- **HTTP/HTTPS**: Web 服務
  ```
  為什麼? 網頁數據必須完整,丟失部分會導致頁面破損
  ```

- **FTP/SFTP**: 文件傳輸
  ```
  為什麼? 文件必須完整無誤,否則無法使用
  ```

- **SMTP/IMAP/POP3**: 電子郵件
  ```
  為什麼? 郵件內容不能丟失或損壞
  ```

- **SSH**: 遠程登錄
  ```
  為什麼? 命令執行需要準確,且需要按順序
  ```

**2. 需要順序保證的應用**

- **數據庫連接**: MySQL, PostgreSQL
  ```
  為什麼? SQL 查詢和結果必須按順序
  ```

- **消息隊列**: RabbitMQ (AMQP), Kafka
  ```
  為什麼? 消息順序通常很重要
  ```

**3. 長連接應用**

- **WebSocket**: 實時通信
  ```
  為什麼? 長連接維護,雙向通信
  ```

#### UDP 適用場景

**1. 實時性優先,容忍丟包**

- **視頻串流**: YouTube, Netflix
  ```
  為什麼? 偶爾丟幾幀不影響觀看,但卡頓會影響體驗
  重傳會增加延遲,導致卡頓
  ```

- **音頻通話**: VoIP, Skype
  ```
  為什麼? 語音通話需要低延遲,丟失少量音頻包可接受
  重傳的音頻已經過時,沒有意義
  ```

- **在線遊戲**: FPS, MOBA
  ```
  為什麼? 遊戲狀態更新需要實時,過時的位置信息沒用
  快速獲取最新狀態比保證舊數據完整更重要
  ```

**2. 廣播/多播需求**

- **服務發現**: mDNS, SSDP
  ```
  為什麼? 需要向局域網所有設備發送消息
  ```

- **路由協定**: RIP, OSPF
  ```
  為什麼? 路由器之間廣播路由信息
  ```

**3. 簡單查詢響應**

- **DNS 查詢**: 域名解析
  ```
  為什麼? 
  - 單次請求/響應,不需要連接
  - 快速 (無握手),丟失可以重試
  - 數據量小 (通常 < 512 字節)
  ```

- **NTP**: 時間同步
  ```
  為什麼? 查詢時間服務器,快速簡單
  ```

- **DHCP**: 動態 IP 分配
  ```
  為什麼? 廣播請求,無連接
  ```

**4. 監控和日誌**

- **Syslog**: 系統日誌
  ```
  為什麼? 大量日誌,丟失少量可接受
  ```

- **SNMP**: 網路管理
  ```
  為什麼? 監控數據,實時性比完整性重要
  ```

### 5. 基於 UDP 的可靠傳輸實現

UDP 本身不可靠,但可以在應用層實現可靠性:

#### QUIC (Quick UDP Internet Connections)

**特點**:
- 基於 UDP 的可靠傳輸協定
- HTTP/3 的底層協定
- 多路復用,無隊頭阻塞
- 0-RTT 連接建立
- 內建加密 (TLS 1.3)

```
QUIC vs TCP:

TCP:
- 三次握手 + TLS 握手 = 2-3 RTT
- 隊頭阻塞 (一個 stream 阻塞其他 stream)
- IP 切換需要重新連接

QUIC:
- 0-RTT 或 1-RTT 連接建立
- Stream 級別復用,互不阻塞
- Connection ID,支持 IP 遷移
```

#### KCP (Fast and Reliable ARQ Protocol)

**特點**:
- 專為遊戲設計的可靠 UDP 協定
- 犧牲頻寬換取延遲
- 快速重傳,減少等待時間

**核心機制**:
```
1. ARQ (Automatic Repeat reQuest)
   - 確認機制
   - 超時重傳

2. 流量控制
   - 滑動窗口

3. 快速模式
   - 更激進的重傳策略
   - 更短的 RTO
```

#### WebRTC (Real-Time Communication)

**特點**:
- 實時音視頻通信
- 結合 UDP 和 TCP
- SRTP (Secure Real-time Transport Protocol)

### 6. TCP 優化技術

#### TCP Fast Open (TFO)

```
傳統 TCP:
1. SYN
2. SYN+ACK
3. ACK
4. 數據傳輸

TFO:
1. SYN + 數據 + Cookie
2. SYN+ACK + 數據
3. ACK + 數據傳輸

減少 1 RTT
```

#### TCP BBR (Bottleneck Bandwidth and RTT)

Google 開發的新擁塞控制算法:
- 主動探測頻寬和 RTT
- 比傳統 CUBIC 更適合高頻寬網路
- 減少緩衝膨脹 (Bufferbloat)

### 7. 混合使用場景

某些應用同時使用 TCP 和 UDP:

#### WebRTC

```
數據通道:
- 視頻/音頻: UDP (RTP/SRTP)
  → 低延遲,容忍丟包
  
- 信令: WebSocket over TCP
  → 可靠傳輸連接信息
  
- 數據通道: SCTP over UDP
  → 可配置可靠性
```

#### 遊戲服務器

```
- 遊戲狀態更新: UDP
  → 位置、動作等實時數據
  
- 聊天消息: TCP
  → 必須完整傳輸
  
- 登錄認證: TCP
  → 安全可靠
```

## 程式碼範例

```go
package main

import (
	"fmt"
	"net"
	"time"
)

// 1. TCP 伺服器
func tcpServer() {
	listener, err := net.Listen("tcp", ":8080")
	if err != nil {
		fmt.Println("TCP 監聽失敗:", err)
		return
	}
	defer listener.Close()
	
	fmt.Println("✅ TCP 伺服器啟動: :8080")
	fmt.Println("   特點: 面向連接, 可靠傳輸, 有序")
	
	for {
		conn, err := listener.Accept()
		if err != nil {
			continue
		}
		
		go handleTCPConnection(conn)
	}
}

func handleTCPConnection(conn net.Conn) {
	defer conn.Close()
	fmt.Printf("TCP 連接建立: %s\n", conn.RemoteAddr())
	
	buffer := make([]byte, 1024)
	for {
		n, err := conn.Read(buffer)
		if err != nil {
			fmt.Printf("TCP 連接關閉: %s\n", conn.RemoteAddr())
			return
		}
		
		fmt.Printf("TCP 收到數據: %s\n", buffer[:n])
		
		// 回應數據
		conn.Write([]byte("TCP ACK: " + string(buffer[:n])))
	}
}

// 2. UDP 伺服器
func udpServer() {
	addr, err := net.ResolveUDPAddr("udp", ":9090")
	if err != nil {
		fmt.Println("解析 UDP 地址失敗:", err)
		return
	}
	
	conn, err := net.ListenUDP("udp", addr)
	if err != nil {
		fmt.Println("UDP 監聽失敗:", err)
		return
	}
	defer conn.Close()
	
	fmt.Println("✅ UDP 伺服器啟動: :9090")
	fmt.Println("   特點: 無連接, 不可靠, 低延遲")
	
	buffer := make([]byte, 1024)
	for {
		n, remoteAddr, err := conn.ReadFromUDP(buffer)
		if err != nil {
			continue
		}
		
		fmt.Printf("UDP 收到數據 (來自 %s): %s\n", remoteAddr, buffer[:n])
		
		// 回應數據
		conn.WriteToUDP([]byte("UDP ACK: "+string(buffer[:n])), remoteAddr)
	}
}

// 3. TCP 客戶端
func tcpClient() {
	conn, err := net.Dial("tcp", "localhost:8080")
	if err != nil {
		fmt.Println("TCP 連接失敗:", err)
		return
	}
	defer conn.Close()
	
	fmt.Println("✅ TCP 連接成功")
	
	// 發送多條消息
	messages := []string{"Hello", "World", "TCP"}
	for _, msg := range messages {
		// 發送數據
		_, err := conn.Write([]byte(msg))
		if err != nil {
			fmt.Println("TCP 發送失敗:", err)
			return
		}
		fmt.Printf("TCP 發送: %s\n", msg)
		
		// 接收響應
		buffer := make([]byte, 1024)
		n, err := conn.Read(buffer)
		if err != nil {
			fmt.Println("TCP 接收失敗:", err)
			return
		}
		fmt.Printf("TCP 收到響應: %s\n", buffer[:n])
		
		time.Sleep(500 * time.Millisecond)
	}
}

// 4. UDP 客戶端
func udpClient() {
	serverAddr, err := net.ResolveUDPAddr("udp", "localhost:9090")
	if err != nil {
		fmt.Println("解析 UDP 地址失敗:", err)
		return
	}
	
	conn, err := net.DialUDP("udp", nil, serverAddr)
	if err != nil {
		fmt.Println("UDP 連接失敗:", err)
		return
	}
	defer conn.Close()
	
	fmt.Println("✅ UDP 客戶端啟動")
	
	// 發送多條消息 (模擬可能丟包)
	messages := []string{"Hello", "World", "UDP"}
	for i, msg := range messages {
		// 模擬丟包 (跳過第二條消息)
		if i == 1 {
			fmt.Printf("❌ UDP 模擬丟包: %s (未發送)\n", msg)
			continue
		}
		
		// 發送數據
		_, err := conn.Write([]byte(msg))
		if err != nil {
			fmt.Println("UDP 發送失敗:", err)
			return
		}
		fmt.Printf("UDP 發送: %s\n", msg)
		
		// 設置讀取超時 (UDP 沒有連接,可能收不到響應)
		conn.SetReadDeadline(time.Now().Add(1 * time.Second))
		
		// 接收響應
		buffer := make([]byte, 1024)
		n, err := conn.Read(buffer)
		if err != nil {
			if netErr, ok := err.(net.Error); ok && netErr.Timeout() {
				fmt.Println("UDP 接收超時 (可能丟包)")
			} else {
				fmt.Println("UDP 接收失敗:", err)
			}
			continue
		}
		fmt.Printf("UDP 收到響應: %s\n", buffer[:n])
		
		time.Sleep(500 * time.Millisecond)
	}
}

// 5. 對比 TCP 和 UDP 效能
func comparePerformance() {
	fmt.Println("\n=== TCP vs UDP 效能對比 ===\n")
	
	fmt.Println("測試場景: 發送 1000 個小封包 (100 字節)")
	fmt.Println()
	
	// TCP 測試
	fmt.Println("【TCP 測試】")
	tcpStart := time.Now()
	// 模擬 TCP 開銷
	tcpOverhead := 20 + 20 // TCP頭(20) + IP頭(20)
	tcpTime := time.Duration(100) * time.Millisecond // 三次握手
	tcpTime += time.Duration(1000) * time.Microsecond * 1000 // 每個封包 1ms
	fmt.Printf("  連接建立: ~100 ms (三次握手 + RTT)\n")
	fmt.Printf("  頭部開銷: %d 字節/封包\n", tcpOverhead)
	fmt.Printf("  總時間: ~%d ms\n", tcpTime.Milliseconds())
	fmt.Printf("  可靠性: 100%% (保證到達)\n")
	fmt.Printf("  順序: 保證\n")
	
	fmt.Println()
	
	// UDP 測試
	fmt.Println("【UDP 測試】")
	udpOverhead := 8 + 20 // UDP頭(8) + IP頭(20)
	udpTime := time.Duration(0) // 無連接建立
	udpTime += time.Duration(800) * time.Microsecond * 1000 // 每個封包 0.8ms (更快)
	fmt.Printf("  連接建立: 0 ms (無連接)\n")
	fmt.Printf("  頭部開銷: %d 字節/封包\n", udpOverhead)
	fmt.Printf("  總時間: ~%d ms\n", udpTime.Milliseconds())
	fmt.Printf("  可靠性: ~98%% (可能丟包)\n")
	fmt.Printf("  順序: 不保證\n")
	
	fmt.Println()
	fmt.Printf("速度提升: %.1f%%\n", float64(tcpTime-udpTime)/float64(tcpTime)*100)
	fmt.Printf("頭部節省: %d 字節/封包\n", tcpOverhead-udpOverhead)
}

// 6. 選擇協定的決策樹
func protocolDecisionTree() {
	fmt.Println("\n=== TCP vs UDP 選擇決策樹 ===\n")
	
	fmt.Println("1. 數據是否必須完整到達?")
	fmt.Println("   └─ YES → 使用 TCP")
	fmt.Println("      例如: 文件傳輸, 網頁, 郵件, 數據庫")
	fmt.Println()
	fmt.Println("   └─ NO  → 繼續判斷...")
	fmt.Println()
	
	fmt.Println("2. 實時性是否非常重要?")
	fmt.Println("   └─ YES → 使用 UDP")
	fmt.Println("      例如: 視頻串流, 音頻通話, 遊戲")
	fmt.Println()
	fmt.Println("   └─ NO  → 使用 TCP")
	fmt.Println("      (TCP 提供更多保障)")
	fmt.Println()
	
	fmt.Println("3. 是否需要廣播/多播?")
	fmt.Println("   └─ YES → 必須使用 UDP")
	fmt.Println("      例如: 服務發現, 路由協定")
	fmt.Println()
	
	fmt.Println("4. 是否需要自定義可靠性?")
	fmt.Println("   └─ YES → 考慮使用 UDP + 應用層實現")
	fmt.Println("      例如: QUIC, KCP, WebRTC")
	fmt.Println()
	
	fmt.Println("5. 連接數量是否非常大?")
	fmt.Println("   └─ YES → UDP 可能更好 (無狀態,開銷小)")
	fmt.Println("      例如: IoT 設備, 大規模監控")
}

func main() {
	fmt.Println("=== TCP vs UDP 對比演示 ===\n")
	
	// 對比效能
	comparePerformance()
	
	// 決策樹
	protocolDecisionTree()
	
	fmt.Println("\n=== 啟動伺服器和客戶端 ===")
	fmt.Println("取消註釋以下代碼來運行:")
	fmt.Println("  // go tcpServer()  // TCP 伺服器")
	fmt.Println("  // go udpServer()  // UDP 伺服器")
	fmt.Println("  // time.Sleep(1 * time.Second)")
	fmt.Println("  // go tcpClient()  // TCP 客戶端")
	fmt.Println("  // go udpClient()  // UDP 客戶端")
	fmt.Println("  // select {}       // 保持運行")
}
```

## 總結

### 關鍵要點

1. **TCP**: 可靠、有序、面向連接,適合對數據完整性要求高的場景
2. **UDP**: 不可靠、無連接、低延遲,適合實時性要求高、容忍丟包的場景
3. **選擇依據**: 數據完整性 vs 實時性,可靠性 vs 效能
4. **混合使用**: 根據不同數據類型選擇不同協定
5. **應用層增強**: UDP + 應用層可實現自定義可靠性 (QUIC, KCP)

### 面試高頻問題

1. **Q: TCP 和 UDP 的主要區別?**
   - A: TCP 面向連接、可靠、有序,但開銷大;UDP 無連接、不可靠,但快速低延遲

2. **Q: 為什麼視頻串流用 UDP 而不是 TCP?**
   - A: ① 實時性要求高,TCP 重傳會增加延遲 ② 偶爾丟幀可接受,但卡頓影響體驗 ③ 過時的數據重傳沒有意義

3. **Q: UDP 不可靠,為什麼還要用它?**
   - A: ① 低延遲 ② 低開銷 ③ 支持廣播/多播 ④ 應用層可自定義可靠性

4. **Q: DNS 為什麼用 UDP?**
   - A: ① 單次請求/響應 ② 數據量小 ③ 快速 (無握手) ④ 失敗可重試

5. **Q: 什麼是 QUIC?**
   - A: 基於 UDP 的可靠傳輸協定,HTTP/3 底層,結合 TCP 優點 (可靠性) 和 UDP 優點 (低延遲)

### 延伸閱讀

- **下一步**: [HTTP/1.1 vs HTTP/2 vs HTTP/3](./http_versions_comparison.md)
- **相關主題**: [TCP 可靠傳輸機制](./tcp_reliable_transmission.md)
- **深入學習**: QUIC 協定詳解, WebRTC 架構
