# TCP 可靠傳輸機制

- **難度**: 6
- **重要程度**: 5
- **標籤**: `TCP`, `流量控制`, `擁塞控制`, `滑動窗口`, `重傳機制`

## 問題詳述

TCP 作為可靠傳輸協定,通過**滑動窗口**、**流量控制**、**擁塞控制**、**超時重傳**等機制,確保數據能夠完整、有序、無重複地從發送方傳輸到接收方。理解這些機制是掌握 TCP 的關鍵。

## 核心理論與詳解

### 1. 滑動窗口機制 (Sliding Window)

#### 基本概念

滑動窗口是 TCP 實現流量控制和可靠傳輸的核心機制。它允許發送方在收到確認前發送多個封包,從而提高網路利用率。

**沒有滑動窗口 (Stop-and-Wait)**:
```
發送方                    接收方
   │  Packet 1              │
   │────────────────────────>│
   │                        │
   │         ACK 1          │
   │<────────────────────────│
   │                        │
   │  Packet 2              │
   │────────────────────────>│
   │                        │
   │         ACK 2          │
   │<────────────────────────│

問題: 效率低下,網路利用率不足
```

**有滑動窗口**:
```
發送方                    接收方
   │ ┌───────────────┐      │
   ├─│ Packet 1      │─────>│
   ├─│ Packet 2      │─────>│
   ├─│ Packet 3      │─────>│
   │ └───────────────┘      │
   │     (窗口大小=3)        │
   │                        │
   │      ACK 1             │
   │<────────────────────────│
   │ ┌───────────────┐      │
   ├─│ Packet 4      │─────>│  (窗口滑動)
   │ │ Packet 2      │      │
   │ │ Packet 3      │      │
   │ └───────────────┘      │

優點: 高效率,提高網路利用率
```

#### 發送窗口結構

```
TCP 發送緩衝區:

┌─────────────────────────────────────────────────────────────┐
│  已發送且已確認  │  已發送但未確認  │  允許發送  │  不可發送  │
│   (可移除)      │   (等待ACK)      │  (窗口內)  │  (窗口外)  │
└─────────────────────────────────────────────────────────────┘
                  ↑                              ↑
                  SND.UNA                        SND.NXT + SND.WND
                  (未確認的最小序號)              (窗口右邊界)
                  
關鍵變量:
- SND.UNA:  最早的未確認序號
- SND.NXT:  下一個要發送的序號
- SND.WND:  發送窗口大小 (對方接收窗口)
```

#### 接收窗口結構

```
TCP 接收緩衝區:

┌──────────────────────────────────────────────────────────┐
│  已接收且已ACK  │  允許接收  │  不可接收  │
│  (已交付應用)   │  (窗口內)  │  (窗口外)  │
└──────────────────────────────────────────────────────────┘
                 ↑                         ↑
                 RCV.NXT                   RCV.NXT + RCV.WND
                 (期望接收的下一個序號)     (窗口右邊界)

關鍵變量:
- RCV.NXT:  期望接收的下一個序號
- RCV.WND:  接收窗口大小 (通告給對方)
```

#### 窗口滑動過程

```
初始狀態: SND.UNA=1000, SND.NXT=1000, SND.WND=3000

1000   2000   3000   4000
  │──────│──────│──────│
  │  可發送的窗口 (3000字節) │

發送 1000 字節 (1000-1999):
SND.NXT 移動到 2000

1000   2000   3000   4000
  │──────│──────│──────│
  已發送  │  可發送      │
  未確認  │              │

收到 ACK 2000 (確認了 1000-1999):
SND.UNA 移動到 2000,窗口向右滑動

2000   3000   4000   5000
  │──────│──────│──────│
  │  可發送的窗口 (3000字節) │
```

### 2. 流量控制 (Flow Control)

#### 目的

防止發送方發送速度過快,導致接收方的緩衝區溢出。

#### 機制: 接收窗口通告

接收方在每個 ACK 中通告自己的接收窗口大小 (rwnd):

```
接收方緩衝區:

┌─────────────────────────────────────┐
│         總大小: 8KB                 │
├──────────────┬──────────────────────┤
│  已接收數據  │  空閒空間            │
│  (4KB)       │  (4KB)               │
└──────────────┴──────────────────────┘
                ↑
           rwnd = 4KB (通告給發送方)

發送方收到 rwnd = 4KB:
- 最多只能發送 4KB 未確認的數據
- 超過 4KB 會導致接收方緩衝區溢出
```

#### Zero Window 問題

```
場景: 接收方應用程序處理緩慢

時間線:
1. 接收方緩衝區滿,通告 rwnd = 0
2. 發送方停止發送數據
3. 接收方應用程序讀取數據,緩衝區有空間
4. 接收方發送 Window Update (通告新的 rwnd)
5. 如果 Window Update 丟失?
   → 發送方永遠不知道可以繼續發送
   → 連接卡死

解決方案: Zero Window Probe
- 發送方定期發送 1 字節探測封包
- 接收方回應當前的 rwnd
- 確保能夠恢復數據傳輸
```

### 3. 擁塞控制 (Congestion Control)

#### 目的

防止發送方發送速度過快,導致網路擁塞。

#### 擁塞控制 vs 流量控制

| 特性 | 流量控制 | 擁塞控制 |
|------|----------|----------|
| **目的** | 保護接收方 | 保護網路 |
| **控制方** | 接收方 | 發送方 |
| **控制變量** | rwnd (接收窗口) | cwnd (擁塞窗口) |
| **通告方式** | ACK 中通告 | 發送方自己維護 |

**實際發送窗口** = min(rwnd, cwnd)

#### 四大算法

##### 1. 慢啟動 (Slow Start)

**目的**: 逐步探測網路容量,避免一開始就發送大量數據

**規則**:
- 連接建立時,cwnd = 1 MSS (Maximum Segment Size,通常 1460 字節)
- 每收到一個 ACK,cwnd += 1 MSS
- 指數增長: 1 → 2 → 4 → 8 → 16 → ...

```
時間   cwnd    發送量      說明
 0      1       1 MSS      初始
 1      2       2 MSS      收到 1 個 ACK
 2      4       4 MSS      收到 2 個 ACK
 3      8       8 MSS      收到 4 個 ACK
 4     16      16 MSS      收到 8 個 ACK
```

**退出條件**:
- cwnd >= ssthresh (慢啟動閾值)
- 發生丟包

##### 2. 擁塞避免 (Congestion Avoidance)

**目的**: 接近網路容量時,緩慢增加發送速率

**規則**:
- 當 cwnd >= ssthresh 時,進入擁塞避免階段
- 每個 RTT,cwnd += 1 MSS
- 線性增長: 16 → 17 → 18 → 19 → ...

```
實現方式: 每收到一個 ACK
cwnd += MSS * MSS / cwnd

例如: cwnd = 16 MSS
收到 16 個 ACK 後:
cwnd += 16 * (MSS / 16) = 16 + 1 = 17 MSS
```

##### 3. 快速重傳 (Fast Retransmit)

**問題**: 超時重傳等待時間長 (通常幾秒),影響效率

**機制**: 通過重複 ACK 快速檢測丟包

```
發送方                    接收方
   │  Seq=1000             │
   │────────────────────────>│
   │                        │  ACK=2000 (期望 2000)
   │<────────────────────────│
   │                        │
   │  Seq=2000 (丟失)       │
   │────────X               │
   │                        │
   │  Seq=3000             │
   │────────────────────────>│
   │                        │  ACK=2000 (重複,仍期望 2000)
   │<────────────────────────│
   │                        │
   │  Seq=4000             │
   │────────────────────────>│
   │                        │  ACK=2000 (重複)
   │<────────────────────────│
   │                        │
   │  Seq=5000             │
   │────────────────────────>│
   │                        │  ACK=2000 (重複,第3次)
   │<────────────────────────│
   │                        │
   │  收到 3 個重複 ACK      │
   │  立即重傳 Seq=2000     │
   │────────────────────────>│
   │                        │  ACK=6000 (確認所有數據)
   │<────────────────────────│
```

**規則**:
- 收到 3 個重複 ACK (共 4 個相同 ACK)
- 立即重傳丟失的封包,不等超時

##### 4. 快速恢復 (Fast Recovery)

**目的**: 快速重傳後,避免完全回到慢啟動

**規則** (經典 Reno 算法):
1. 收到 3 個重複 ACK:
   - ssthresh = cwnd / 2
   - cwnd = ssthresh + 3 MSS (3 是重複 ACK 的數量)
   - 重傳丟失的封包
2. 每收到一個重複 ACK:
   - cwnd += 1 MSS (允許發送新數據)
3. 收到新的 ACK (確認重傳的數據):
   - cwnd = ssthresh (回到擁塞避免)

```
cwnd 變化:

初始: cwnd = 16 MSS, ssthresh = 32 MSS

丟包 (收到 3 個重複 ACK):
ssthresh = 16 / 2 = 8 MSS
cwnd = 8 + 3 = 11 MSS

收到新 ACK:
cwnd = 8 MSS (進入擁塞避免)
```

#### 擁塞控制狀態機

```
         初始
          │
          ↓
      慢啟動 (cwnd 指數增長)
          │
          ├─── cwnd >= ssthresh ────→ 擁塞避免 (cwnd 線性增長)
          │                              │
          │                              │
          ├─── 超時 ───→ 重傳           │
          │    ssthresh = cwnd / 2      │
          │    cwnd = 1 MSS              │
          │    返回慢啟動 ←──────────────┘
          │
          ├─── 3 個重複 ACK ────→ 快速重傳
          │                        ssthresh = cwnd / 2
          │                        cwnd = ssthresh + 3
          │                        │
          │                        ↓
          │                      快速恢復
          │                        │
          │                收到新 ACK
          │                cwnd = ssthresh
          │                        │
          └────────────────────────┴────→ 擁塞避免
```

### 4. 超時重傳機制 (Retransmission Timeout)

#### RTO 計算 (往返時間估算)

TCP 需要動態計算 RTO (Retransmission Timeout),以適應網路條件變化。

**RTT 測量**:
```
發送時間: t1
收到 ACK: t2
RTT = t2 - t1
```

**RTO 計算** (RFC 6298):
```
1. 初始值:
   SRTT (Smoothed RTT) = RTT
   RTTVAR (RTT Variance) = RTT / 2
   RTO = SRTT + 4 * RTTVAR

2. 後續更新:
   α = 1/8, β = 1/4

   RTTVAR = (1 - β) * RTTVAR + β * |SRTT - RTT|
   SRTT = (1 - α) * SRTT + α * RTT
   RTO = SRTT + 4 * RTTVAR

3. 邊界值:
   RTO_min = 1 秒 (Linux 默認)
   RTO_max = 60 秒
```

**示例**:
```
初始 RTT = 100 ms
SRTT = 100 ms
RTTVAR = 50 ms
RTO = 100 + 4 * 50 = 300 ms

下一次 RTT = 150 ms
RTTVAR = 0.75 * 50 + 0.25 * |100 - 150| = 37.5 + 12.5 = 50 ms
SRTT = 0.875 * 100 + 0.125 * 150 = 87.5 + 18.75 = 106.25 ms
RTO = 106.25 + 4 * 50 = 306.25 ms
```

#### 重傳策略

**超時重傳**:
```
1. 發送封包,啟動定時器 (RTO)
2. 如果超時未收到 ACK:
   - 重傳封包
   - RTO 翻倍 (指數退避)
   - ssthresh = cwnd / 2
   - cwnd = 1 MSS (回到慢啟動)
3. 最大重傳次數: 15 次 (Linux 默認)
```

**Karn 算法**:
- 重傳的封包不用於 RTT 計算
- 避免因重傳導致的 RTT 估算錯誤

### 5. Nagle 算法與延遲 ACK

#### Nagle 算法

**目的**: 減少小封包數量,提高網路效率

**規則**:
```
if 有未確認的數據:
    if 數據量 >= MSS 或 收到 ACK:
        發送
    else:
        緩存數據,等待 ACK 或更多數據
else:
    立即發送
```

**問題**: 增加延遲,不適合互動式應用 (如 SSH, 遊戲)

**解決**: 設置 `TCP_NODELAY`,禁用 Nagle 算法

#### 延遲 ACK (Delayed ACK)

**目的**: 減少 ACK 封包數量

**規則**:
```
1. 收到數據,不立即發送 ACK
2. 等待 40-200 ms (或收到第二個封包)
3. 如果有數據要發送,捎帶 ACK (Piggybacking)
4. 否則單獨發送 ACK
```

**Nagle + 延遲 ACK = 災難**:
```
場景: 客戶端發送兩個小請求

客戶端 (Nagle)           伺服器 (延遲 ACK)
   │  Request 1 (小)       │
   │────────────────────────>│
   │  (等待 ACK)            │  (延遲 40ms 發送 ACK)
   │                        │
   │  Request 2 (小,緩存)   │
   │                        │
   │       ACK 1            │
   │<────────────────────────│  (40ms 後)
   │  Request 2             │
   │────────────────────────>│
   │                        │
   │       ACK 2            │
   │<────────────────────────│  (又 40ms)

總延遲: 80ms + RTT
```

**解決方案**:
- 互動式應用: 設置 `TCP_NODELAY`
- 批量傳輸: 保持 Nagle 算法

## 程式碼範例

```go
package main

import (
	"fmt"
	"net"
	"syscall"
	"time"
)

// 演示 TCP 可靠傳輸機制

// 1. 設置 TCP 窗口大小
func setTCPWindowSize() error {
	// 創建 socket
	fd, err := syscall.Socket(syscall.AF_INET, syscall.SOCK_STREAM, syscall.IPPROTO_TCP)
	if err != nil {
		return fmt.Errorf("創建 socket 失敗: %v", err)
	}
	defer syscall.Close(fd)
	
	// 設置發送緩衝區 (影響發送窗口)
	sendBufSize := 256 * 1024 // 256 KB
	err = syscall.SetsockoptInt(fd, syscall.SOL_SOCKET, syscall.SO_SNDBUF, sendBufSize)
	if err != nil {
		return fmt.Errorf("設置發送緩衝區失敗: %v", err)
	}
	fmt.Printf("✅ 發送緩衝區設置為: %d KB\n", sendBufSize/1024)
	
	// 設置接收緩衝區 (影響接收窗口)
	recvBufSize := 256 * 1024 // 256 KB
	err = syscall.SetsockoptInt(fd, syscall.SOL_SOCKET, syscall.SO_RCVBUF, recvBufSize)
	if err != nil {
		return fmt.Errorf("設置接收緩衝區失敗: %v", err)
	}
	fmt.Printf("✅ 接收緩衝區設置為: %d KB\n", recvBufSize/1024)
	
	return nil
}

// 2. 禁用 Nagle 算法 (減少延遲)
func disableNagle(conn net.Conn) error {
	// 類型斷言為 TCP 連接
	tcpConn, ok := conn.(*net.TCPConn)
	if !ok {
		return fmt.Errorf("不是 TCP 連接")
	}
	
	// 設置 TCP_NODELAY
	err := tcpConn.SetNoDelay(true)
	if err != nil {
		return fmt.Errorf("設置 TCP_NODELAY 失敗: %v", err)
	}
	
	fmt.Println("✅ Nagle 算法已禁用 (TCP_NODELAY = true)")
	fmt.Println("   → 小封包立即發送,適合互動式應用")
	return nil
}

// 3. 設置 TCP Keep-Alive (檢測死連接)
func setKeepAlive(conn net.Conn) error {
	tcpConn, ok := conn.(*net.TCPConn)
	if !ok {
		return fmt.Errorf("不是 TCP 連接")
	}
	
	// 啟用 Keep-Alive
	err := tcpConn.SetKeepAlive(true)
	if err != nil {
		return fmt.Errorf("啟用 Keep-Alive 失敗: %v", err)
	}
	
	// 設置 Keep-Alive 間隔 (探測間隔)
	err = tcpConn.SetKeepAlivePeriod(30 * time.Second)
	if err != nil {
		return fmt.Errorf("設置 Keep-Alive 間隔失敗: %v", err)
	}
	
	fmt.Println("✅ TCP Keep-Alive 已啟用")
	fmt.Println("   → 每 30 秒發送探測封包")
	fmt.Println("   → 檢測連接是否仍然存活")
	return nil
}

// 4. 模擬擁塞控制行為
func demonstrateCongestionControl() {
	fmt.Println("\n=== TCP 擁塞控制模擬 ===\n")
	
	// 初始參數
	mss := 1460          // Maximum Segment Size (字節)
	cwnd := 1            // 擁塞窗口 (MSS)
	ssthresh := 16       // 慢啟動閾值 (MSS)
	rtt := 0             // 往返次數
	
	fmt.Printf("初始狀態: cwnd=%d MSS, ssthresh=%d MSS\n\n", cwnd, ssthresh)
	
	// 階段 1: 慢啟動
	fmt.Println("【階段 1: 慢啟動 (Slow Start)】")
	fmt.Println("規則: 每收到 ACK,cwnd += 1 (指數增長)")
	fmt.Println()
	
	for cwnd < ssthresh {
		rtt++
		fmt.Printf("RTT %d: cwnd = %d MSS (%d KB)\n", rtt, cwnd, cwnd*mss/1024)
		cwnd *= 2 // 指數增長
		if cwnd > ssthresh {
			cwnd = ssthresh // 達到閾值
		}
	}
	
	// 階段 2: 擁塞避免
	fmt.Println("\n【階段 2: 擁塞避免 (Congestion Avoidance)】")
	fmt.Println("規則: 每個 RTT,cwnd += 1 (線性增長)")
	fmt.Println()
	
	for i := 0; i < 5; i++ {
		rtt++
		fmt.Printf("RTT %d: cwnd = %d MSS (%d KB)\n", rtt, cwnd, cwnd*mss/1024)
		cwnd++ // 線性增長
	}
	
	// 階段 3: 快速重傳和快速恢復
	fmt.Println("\n【階段 3: 快速重傳與快速恢復】")
	fmt.Println("事件: 收到 3 個重複 ACK (丟包)")
	fmt.Println()
	
	ssthresh = cwnd / 2
	cwnd = ssthresh + 3
	
	fmt.Printf("ssthresh = %d / 2 = %d MSS\n", cwnd, ssthresh)
	fmt.Printf("cwnd = %d + 3 = %d MSS (快速恢復)\n", ssthresh, cwnd)
	fmt.Println()
	
	// 收到新 ACK
	fmt.Println("收到新 ACK (重傳成功):")
	cwnd = ssthresh
	fmt.Printf("cwnd = %d MSS (進入擁塞避免)\n", cwnd)
	
	// 階段 4: 超時重傳
	fmt.Println("\n【階段 4: 超時重傳 (Timeout)】")
	fmt.Println("事件: RTO 超時")
	fmt.Println()
	
	ssthresh = cwnd / 2
	cwnd = 1
	
	fmt.Printf("ssthresh = %d / 2 = %d MSS\n", cwnd*2, ssthresh)
	fmt.Printf("cwnd = 1 MSS (回到慢啟動)\n")
}

// 5. 模擬滑動窗口
func demonstrateSlidingWindow() {
	fmt.Println("\n=== TCP 滑動窗口模擬 ===\n")
	
	// 參數
	sendBase := 1000   // 最早的未確認序號 (SND.UNA)
	nextSeq := 1000    // 下一個要發送的序號 (SND.NXT)
	windowSize := 3000 // 發送窗口大小 (SND.WND)
	
	fmt.Printf("初始狀態:\n")
	fmt.Printf("  sendBase (SND.UNA)  = %d\n", sendBase)
	fmt.Printf("  nextSeq (SND.NXT)   = %d\n", nextSeq)
	fmt.Printf("  windowSize (SND.WND) = %d\n", windowSize)
	fmt.Println()
	
	// 發送數據
	dataSize := 1000
	if nextSeq + dataSize <= sendBase + windowSize {
		fmt.Printf("發送 %d 字節 (%d-%d)\n", dataSize, nextSeq, nextSeq+dataSize-1)
		nextSeq += dataSize
		fmt.Printf("  nextSeq 更新為 %d\n", nextSeq)
	} else {
		fmt.Println("❌ 窗口已滿,無法發送")
	}
	fmt.Println()
	
	// 再發送數據
	dataSize = 1500
	if nextSeq + dataSize <= sendBase + windowSize {
		fmt.Printf("發送 %d 字節 (%d-%d)\n", dataSize, nextSeq, nextSeq+dataSize-1)
		nextSeq += dataSize
		fmt.Printf("  nextSeq 更新為 %d\n", nextSeq)
	} else {
		fmt.Printf("❌ 窗口只剩 %d 字節,無法發送 %d 字節\n", 
			sendBase+windowSize-nextSeq, dataSize)
	}
	fmt.Println()
	
	// 收到 ACK
	ackNum := 2000
	fmt.Printf("收到 ACK %d (確認 %d-%d)\n", ackNum, sendBase, ackNum-1)
	sendBase = ackNum
	fmt.Printf("  sendBase 更新為 %d\n", sendBase)
	fmt.Printf("  窗口右邊界: %d → %d (滑動了 %d)\n", 
		sendBase-1000+windowSize, sendBase+windowSize, ackNum-1000)
	fmt.Println()
	
	// 現在可以發送更多數據
	dataSize = 1500
	if nextSeq + dataSize <= sendBase + windowSize {
		fmt.Printf("✅ 現在可以發送 %d 字節 (%d-%d)\n", 
			dataSize, nextSeq, nextSeq+dataSize-1)
		nextSeq += dataSize
	}
}

// 6. 監控 TCP 參數
func monitorTCPParameters() {
	fmt.Println("\n=== TCP 參數監控 ===\n")
	
	fmt.Println("查看擁塞控制算法:")
	fmt.Println("  Linux: sysctl net.ipv4.tcp_congestion_control")
	fmt.Println("  常見算法: cubic (默認), bbr, reno")
	fmt.Println()
	
	fmt.Println("查看 TCP 內存限制:")
	fmt.Println("  cat /proc/sys/net/ipv4/tcp_mem")
	fmt.Println("  三個值: min pressure max (單位: 頁,通常 4KB)")
	fmt.Println()
	
	fmt.Println("查看 TCP 緩衝區大小:")
	fmt.Println("  cat /proc/sys/net/ipv4/tcp_rmem  # 接收緩衝")
	fmt.Println("  cat /proc/sys/net/ipv4/tcp_wmem  # 發送緩衝")
	fmt.Println("  三個值: min default max")
	fmt.Println()
	
	fmt.Println("查看擁塞控制參數:")
	fmt.Println("  初始 cwnd: cat /proc/sys/net/ipv4/tcp_init_cwnd")
	fmt.Println("  慢啟動閾值: (動態調整,無固定值)")
	fmt.Println()
	
	fmt.Println("優化建議:")
	fmt.Println("  # 使用 BBR 擁塞控制 (適合高頻寬網路)")
	fmt.Println("  sysctl -w net.ipv4.tcp_congestion_control=bbr")
	fmt.Println()
	fmt.Println("  # 增加初始擁塞窗口 (加快連接建立)")
	fmt.Println("  sysctl -w net.ipv4.tcp_init_cwnd=10")
	fmt.Println()
	fmt.Println("  # 啟用 TCP 窗口縮放 (支持大窗口)")
	fmt.Println("  sysctl -w net.ipv4.tcp_window_scaling=1")
}

func main() {
	fmt.Println("=== TCP 可靠傳輸機制演示 ===\n")
	
	// 1. 設置 TCP 窗口大小
	fmt.Println("【1. TCP 窗口大小設置】")
	if err := setTCPWindowSize(); err != nil {
		fmt.Println("錯誤:", err)
	}
	
	// 2. 擁塞控制模擬
	demonstrateCongestionControl()
	
	// 3. 滑動窗口模擬
	demonstrateSlidingWindow()
	
	// 4. 監控 TCP 參數
	monitorTCPParameters()
	
	fmt.Println("\n\n=== TCP 選項優化示例 ===\n")
	fmt.Println("// 創建 TCP 連接並優化")
	fmt.Println("conn, _ := net.Dial(\"tcp\", \"example.com:80\")")
	fmt.Println("tcpConn := conn.(*net.TCPConn)")
	fmt.Println()
	fmt.Println("// 禁用 Nagle 算法 (降低延遲)")
	fmt.Println("tcpConn.SetNoDelay(true)")
	fmt.Println()
	fmt.Println("// 啟用 Keep-Alive (檢測死連接)")
	fmt.Println("tcpConn.SetKeepAlive(true)")
	fmt.Println("tcpConn.SetKeepAlivePeriod(30 * time.Second)")
	fmt.Println()
	fmt.Println("// 設置讀寫超時")
	fmt.Println("tcpConn.SetReadDeadline(time.Now().Add(10 * time.Second))")
	fmt.Println("tcpConn.SetWriteDeadline(time.Now().Add(10 * time.Second))")
}
```

**程式碼說明**:

1. **setTCPWindowSize**: 設置發送和接收緩衝區大小
2. **disableNagle**: 禁用 Nagle 算法,適合低延遲應用
3. **setKeepAlive**: 配置 TCP Keep-Alive,檢測死連接
4. **demonstrateCongestionControl**: 模擬 TCP 擁塞控制的完整過程
5. **demonstrateSlidingWindow**: 演示滑動窗口的工作原理
6. **monitorTCPParameters**: 提供監控和優化 TCP 參數的命令

## 總結

### 關鍵要點

1. **滑動窗口**: 允許發送方在收到確認前發送多個封包,提高效率
2. **流量控制**: 通過接收窗口 (rwnd) 防止接收方緩衝區溢出
3. **擁塞控制**: 通過擁塞窗口 (cwnd) 防止網路擁塞,包含慢啟動、擁塞避免、快速重傳、快速恢復四大算法
4. **超時重傳**: 動態計算 RTO,處理封包丟失
5. **Nagle 算法**: 減少小封包,但增加延遲,互動式應用應禁用

### 面試高頻問題

1. **Q: 滑動窗口的作用是什麼?**
   - A: ①提高網路利用率,無需等待 ACK 就能發送多個封包 ②實現流量控制,防止接收方溢出 ③實現可靠傳輸,跟蹤未確認的數據

2. **Q: 擁塞控制和流量控制的區別?**
   - A: 流量控制保護接收方 (rwnd),擁塞控制保護網路 (cwnd);實際窗口 = min(rwnd, cwnd)

3. **Q: 慢啟動為什麼叫"慢"?實際上快嗎?**
   - A: 相對於直接發送大量數據是"慢"的,但實際是指數增長 (1→2→4→8),增長速度很快

4. **Q: 什麼時候禁用 Nagle 算法?**
   - A: 互動式應用 (SSH, 遊戲, 即時通訊),需要低延遲;批量傳輸保持啟用

5. **Q: 如何優化 TCP 效能?**
   - A: ①增大窗口大小 ②使用 BBR 擁塞控制 ③禁用 Nagle (低延遲) ④啟用窗口縮放 ⑤調整重傳參數

### 延伸閱讀

- **下一步**: [TCP vs UDP 對比與選擇](./tcp_vs_udp.md)
- **相關主題**: [網路效能優化策略](./network_performance_optimization.md)
- **深入學習**: BBR 擁塞控制算法, TCP Vegas, QUIC 協定
