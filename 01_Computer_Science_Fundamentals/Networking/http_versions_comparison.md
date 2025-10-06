# HTTP/1.1 vs HTTP/2 vs HTTP/3

- **難度**: 7
- **重要程度**: 5
- **標籤**: `HTTP`, `協定演進`, `QUIC`, `效能優化`

## 問題詳述

HTTP 協定是 Web 的基礎,從 HTTP/1.1 到 HTTP/2 再到 HTTP/3,每次升級都帶來顯著的效能提升。理解各版本的特性差異、優化機制和適用場景,是後端開發的核心知識。

## 核心理論與詳解

### 1. HTTP 版本演進概覽

```
HTTP/0.9 (1991)
└─ 僅支持 GET, 僅傳輸 HTML

HTTP/1.0 (1996)
└─ 支持多種方法, 頭部, 狀態碼

HTTP/1.1 (1999) ★ 主流
├─ 持久連接 (Keep-Alive)
├─ 管道化 (Pipelining)
├─ 分塊傳輸 (Chunked Transfer)
└─ 主機頭 (Host Header)

HTTP/2 (2015) ★ 廣泛部署
├─ 二進制協定
├─ 多路復用 (Multiplexing)
├─ 頭部壓縮 (HPACK)
├─ 服務器推送 (Server Push)
└─ 流優先級

HTTP/3 (2022) ★ 新興
├─ 基於 QUIC (UDP)
├─ 0-RTT 連接
├─ 無隊頭阻塞
└─ 連接遷移
```

### 2. HTTP/1.1 詳解

#### 核心特性

**1. 持久連接 (Persistent Connection / Keep-Alive)**

```
HTTP/1.0 (無持久連接):
每個請求一個連接

客戶端                    伺服器
  │ 連接1: GET /page.html  │
  │──────────────────────→ │
  │←──────────────────────  │
  │ 關閉連接1               │
  │                        │
  │ 連接2: GET /style.css  │
  │──────────────────────→ │
  │←──────────────────────  │
  │ 關閉連接2               │

開銷: 每個資源都要三次握手


HTTP/1.1 (持久連接):
一個連接多個請求

客戶端                    伺服器
  │ 連接: GET /page.html   │
  │──────────────────────→ │
  │←──────────────────────  │
  │ GET /style.css         │
  │──────────────────────→ │
  │←──────────────────────  │
  │ GET /script.js         │
  │──────────────────────→ │
  │←──────────────────────  │
  │ 連接保持開啟...         │

開銷: 只需一次三次握手
```

**2. 管道化 (Pipelining)**

```
允許在收到響應前發送多個請求:

無管道化:
請求1 → 等待響應1 → 請求2 → 等待響應2

管道化:
請求1 → 請求2 → 請求3 → 等待響應1,2,3

問題: 隊頭阻塞 (Head-of-Line Blocking)
如果響應1延遲,響應2,3也要等待
```

**3. 分塊傳輸編碼 (Chunked Transfer Encoding)**

```
允許動態內容邊生成邊發送:

Transfer-Encoding: chunked

5\r\n        # 塊大小 (十六進制)
Hello\r\n    # 數據
6\r\n
 World\r\n
0\r\n        # 結束標記
\r\n
```

#### 問題與限制

| 問題 | 說明 | 影響 |
|------|------|------|
| **隊頭阻塞** | 前一個響應慢會阻塞後續請求 | 效能下降 |
| **頭部冗餘** | 每個請求都發送完整頭部 | 頻寬浪費 |
| **並發限制** | 瀏覽器限制每個域名 6-8 個連接 | 資源加載慢 |
| **無優先級** | 所有請求平等對待 | 關鍵資源延遲 |

### 3. HTTP/2 詳解

#### 核心特性

**1. 二進制協定**

```
HTTP/1.1: 文本協定
GET /path HTTP/1.1\r\n
Host: example.com\r\n
\r\n

HTTP/2: 二進制幀 (Frames)
┌─────────────────────────┐
│  Length (24 bits)       │
├──────┬──────────────────┤
│ Type │ Flags  │ Stream │
│ (8)  │  (8)   │   ID   │
├──────┴────────┴─────────┤
│    Frame Payload        │
└─────────────────────────┘

幀類型:
- DATA: 傳輸數據
- HEADERS: 傳輸頭部
- PRIORITY: 設置優先級
- RST_STREAM: 取消流
- SETTINGS: 連接設置
- PUSH_PROMISE: 服務器推送
- PING: 心跳檢測
- GOAWAY: 關閉連接
- WINDOW_UPDATE: 流量控制
- CONTINUATION: 頭部延續
```

**2. 多路復用 (Multiplexing)**

```
單一 TCP 連接,多個並發流 (Stream):

HTTP/1.1 (多個連接):
連接1: ████████████ (請求1)
連接2: ████████████ (請求2)
連接3: ████████████ (請求3)
...

HTTP/2 (單一連接,多個流):
流1: ██ (請求1)
流2:   ██ (請求2)
流3:     ██ (請求3)
流1:       ██ (請求1繼續)
流4:         ██ (請求4)
...

優點:
✅ 無隊頭阻塞 (應用層)
✅ 更好的連接利用
✅ 減少 TCP 握手次數
```

**流 (Stream) 概念**:
- 一個 Stream = 一個請求/響應對
- Stream ID: 奇數 = 客戶端發起, 偶數 = 伺服器發起
- 多個 Stream 在一個 TCP 連接中交錯傳輸

**3. 頭部壓縮 (HPACK)**

```
HTTP/1.1: 每個請求完整頭部
GET /api/users HTTP/1.1
Host: api.example.com
User-Agent: Mozilla/5.0...
Accept: application/json
Cookie: session=abc123...
...

每個請求: ~500-800 字節頭部

HTTP/2 HPACK:
1. 靜態表 (常見頭部)
   :method: GET
   :path: /
   :scheme: https
   
2. 動態表 (最近使用的頭部)
   存儲之前發送過的頭部
   
3. 增量編碼
   只發送變化的部分
   
例如:
請求1: [完整頭部] 800 字節
請求2: [索引 + 差異] 50 字節
請求3: [索引 + 差異] 50 字節

壓縮率: ~85-90%
```

**4. 服務器推送 (Server Push)**

```
服務器主動推送資源:

傳統流程:
1. 客戶端: GET /index.html
2. 伺服器: 返回 HTML
3. 客戶端: 解析 HTML,發現需要 style.css
4. 客戶端: GET /style.css
5. 伺服器: 返回 CSS

HTTP/2 Server Push:
1. 客戶端: GET /index.html
2. 伺服器: 返回 HTML
           + PUSH_PROMISE: style.css
           + PUSH_PROMISE: script.js
           + 推送 style.css 內容
           + 推送 script.js 內容
3. 客戶端: 直接使用緩存的資源

優點: 減少往返次數
缺點: 可能推送客戶端已有的資源
```

**5. 流優先級 (Stream Priority)**

```
設置資源加載優先級:

高優先級: CSS, 關鍵 JS
中優先級: 圖片
低優先級: 廣告, 追蹤腳本

客戶端可以動態調整:
PRIORITY 幀:
- Stream Dependency: 依賴哪個流
- Weight: 權重 (1-256)
```

#### HTTP/2 的限制

**TCP 隊頭阻塞 (TCP HOL Blocking)**:
```
雖然 HTTP/2 解決了應用層隊頭阻塞
但 TCP 層仍有隊頭阻塞:

TCP 連接:
封包1 (流1) ✓
封包2 (流2) ✗ 丟失
封包3 (流3) ✓ 到達,但被阻塞
封包4 (流1) ✓ 到達,但被阻塞

TCP 必須等待封包2重傳
即使封包3,4屬於不同的流

影響: 丟包時效能下降
```

### 4. HTTP/3 詳解

#### 核心特性

**1. 基於 QUIC 協定**

```
協定棧對比:

HTTP/1.1, HTTP/2:
┌──────────────┐
│   HTTP/2     │ 應用層
├──────────────┤
│   TLS 1.2    │ 表現層
├──────────────┤
│     TCP      │ 傳輸層
├──────────────┤
│     IP       │ 網路層
└──────────────┘

HTTP/3:
┌──────────────┐
│   HTTP/3     │ 應用層
├──────────────┤
│   QUIC       │ 傳輸層 + TLS 1.3
├──────────────┤
│     UDP      │
├──────────────┤
│     IP       │ 網路層
└──────────────┘

QUIC = Quick UDP Internet Connections
```

**2. 0-RTT 連接建立**

```
HTTP/2 over TLS 1.2:
客戶端                    伺服器
  │ ClientHello (TLS)      │
  │──────────────────────→ │
  │ ServerHello (TLS)      │
  │←──────────────────────  │
  │ Finished (TLS)         │
  │──────────────────────→ │
  │ HTTP 請求              │
  │──────────────────────→ │

總時間: 2 RTT

HTTP/3 over QUIC:
客戶端                    伺服器
  │ Initial + HTTP 請求    │
  │──────────────────────→ │
  │ Response               │
  │←──────────────────────  │

總時間: 1 RTT (首次連接)
        0 RTT (重連,使用 session ticket)
```

**3. 無隊頭阻塞**

```
QUIC 在 UDP 上實現多路復用:

UDP 連接:
Stream 1: ██ ██ ██
Stream 2:   ✗✗ ██  (丟包只影響 Stream 2)
Stream 3:     ██ ██ (不受影響)

QUIC 特性:
- Stream 之間完全獨立
- 丟包只影響對應的 Stream
- 其他 Stream 可以繼續傳輸

對比 HTTP/2:
TCP 連接:
Stream 1: ██ ██ ⏸️  (等待 Stream 2 重傳)
Stream 2:   ✗✗ 🔄
Stream 3:     ⏸️ ⏸️  (等待 Stream 2 重傳)
```

**4. 連接遷移 (Connection Migration)**

```
傳統 TCP:
連接標識 = (源IP, 源端口, 目標IP, 目標端口)

問題: 切換網路 (Wi-Fi → 4G) 會導致連接斷開

QUIC:
連接標識 = Connection ID (64-bit)

優點:
- IP 改變不影響連接
- 從 Wi-Fi 切換到 4G 無縫
- 移動設備友好
```

**5. 內建加密 (Built-in Encryption)**

```
QUIC 內建 TLS 1.3:
- 所有封包都加密 (除了 Initial)
- 無法禁用加密
- 更好的隱私保護
```

#### 頭部壓縮 (QPACK)

```
QPACK vs HPACK:

HPACK (HTTP/2):
- 有序頭部壓縮
- 一個阻塞會影響後續解碼

QPACK (HTTP/3):
- 允許亂序傳輸
- 動態表更新和頭部解碼分離
- 更適合 QUIC 的多流特性
```

### 5. 三版本全面對比

| 特性 | HTTP/1.1 | HTTP/2 | HTTP/3 |
|------|----------|--------|--------|
| **傳輸層** | TCP | TCP | UDP (QUIC) |
| **協定格式** | 文本 | 二進制 | 二進制 |
| **多路復用** | ❌ | ✅ | ✅ |
| **頭部壓縮** | ❌ | ✅ (HPACK) | ✅ (QPACK) |
| **服務器推送** | ❌ | ✅ | ✅ (103 Early Hints) |
| **隊頭阻塞** | ✅ 應用層+傳輸層 | ❌ 應用層 / ✅ TCP層 | ❌ 完全無 |
| **連接建立** | 3 RTT | 2-3 RTT | 0-1 RTT |
| **連接遷移** | ❌ | ❌ | ✅ |
| **加密** | 可選 (HTTPS) | 可選 (實務上必須) | 強制 (內建) |
| **部署難度** | 簡單 | 中等 | 較難 (UDP限制) |
| **瀏覽器支持** | 100% | ~97% | ~70% (2024) |

### 6. 效能對比

#### 頁面加載時間

```
場景: 加載 100 個資源

HTTP/1.1:
├─ 6 個並發連接
├─ 每個連接串行加載
└─ 時間: 10-15 秒

HTTP/2:
├─ 1 個連接,100 個並發流
├─ 多路復用
└─ 時間: 3-5 秒

HTTP/3:
├─ 1 個連接,100 個並發流
├─ 0-RTT 連接
├─ 無隊頭阻塞
└─ 時間: 2-4 秒 (尤其在高丟包率網路)
```

#### 丟包環境下的效能

```
丟包率 1%:

HTTP/1.1: 100% 基準
HTTP/2:   80-90% (TCP 隊頭阻塞影響)
HTTP/3:   50-60% (QUIC 無隊頭阻塞)

HTTP/3 在弱網環境下優勢明顯
```

### 7. 實際應用建議

#### 何時使用 HTTP/1.1

```
✅ 適用場景:
- 簡單的 API
- 內網服務
- 舊系統兼容
- 調試方便 (文本協定)

❌ 不適用:
- 高並發 Web 應用
- 大量小資源
- 移動應用
```

#### 何時使用 HTTP/2

```
✅ 適用場景:
- 現代 Web 應用
- 大量資源加載
- 需要服務器推送
- 廣泛瀏覽器支持

❌ 可能的問題:
- TCP 隊頭阻塞 (高丟包率網路)
- 服務器推送可能浪費頻寬
```

#### 何時使用 HTTP/3

```
✅ 適用場景:
- 移動應用 (網路切換頻繁)
- 高丟包率網路
- 需要 0-RTT 的應用
- 視頻串流, 遊戲

❌ 限制:
- 瀏覽器支持尚未完全
- 部分網路阻擋 UDP
- CDN 支持有限 (逐步改善中)
```

## 程式碼範例

```go
package main

import (
	"crypto/tls"
	"fmt"
	"io"
	"net/http"
	"time"
	
	"golang.org/x/net/http2"
)

// 1. HTTP/1.1 伺服器
func http1Server() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "HTTP/1.1 Response\n")
		fmt.Fprintf(w, "Protocol: %s\n", r.Proto)
	})
	
	fmt.Println("✅ HTTP/1.1 伺服器啟動: https://localhost:8443")
	
	// 配置 TLS
	server := &http.Server{
		Addr: ":8443",
		TLSConfig: &tls.Config{
			NextProtos: []string{"http/1.1"}, // 僅支持 HTTP/1.1
		},
	}
	
	server.ListenAndServeTLS("cert.pem", "key.pem")
}

// 2. HTTP/2 伺服器
func http2Server() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "HTTP/2 Response\n")
		fmt.Fprintf(w, "Protocol: %s\n", r.Proto)
		
		// HTTP/2 特有: 服務器推送
		if pusher, ok := w.(http.Pusher); ok {
			// 推送 CSS 資源
			err := pusher.Push("/style.css", nil)
			if err != nil {
				fmt.Printf("推送失敗: %v\n", err)
			} else {
				fmt.Println("✅ 服務器推送: /style.css")
			}
		}
	})
	
	http.HandleFunc("/style.css", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/css")
		fmt.Fprintf(w, "body { color: blue; }")
	})
	
	fmt.Println("✅ HTTP/2 伺服器啟動: https://localhost:8444")
	
	// 配置 HTTP/2
	server := &http.Server{
		Addr: ":8444",
		TLSConfig: &tls.Config{
			NextProtos: []string{"h2", "http/1.1"}, // 支持 HTTP/2
		},
	}
	
	// 啟用 HTTP/2
	http2.ConfigureServer(server, &http2.Server{})
	
	server.ListenAndServeTLS("cert.pem", "key.pem")
}

// 3. HTTP/1.1 客戶端
func http1Client() {
	client := &http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true,
			},
			// 禁用 HTTP/2
			TLSNextProto: make(map[string]func(string, *tls.Conn) http.RoundTripper),
		},
	}
	
	start := time.Now()
	
	// 發送多個請求
	for i := 0; i < 3; i++ {
		resp, err := client.Get("https://localhost:8443/")
		if err != nil {
			fmt.Printf("請求失敗: %v\n", err)
			continue
		}
		
		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		
		fmt.Printf("請求 %d: %s\n", i+1, body)
	}
	
	fmt.Printf("HTTP/1.1 總時間: %v\n", time.Since(start))
}

// 4. HTTP/2 客戶端
func http2Client() {
	client := &http.Client{
		Timeout: 10 * time.Second,
		Transport: &http2.Transport{
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true,
			},
		},
	}
	
	start := time.Now()
	
	// 發送多個並發請求 (多路復用)
	for i := 0; i < 3; i++ {
		go func(id int) {
			resp, err := client.Get("https://localhost:8444/")
			if err != nil {
				fmt.Printf("請求失敗: %v\n", err)
				return
			}
			
			body, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			
			fmt.Printf("請求 %d: %s\n", id, body)
		}(i + 1)
	}
	
	time.Sleep(2 * time.Second) // 等待所有請求完成
	fmt.Printf("HTTP/2 總時間: %v\n", time.Since(start))
}

// 5. 對比測試
func compareHTTPVersions() {
	fmt.Println("\n=== HTTP 版本效能對比 ===\n")
	
	fmt.Println("測試場景: 加載 50 個小資源")
	fmt.Println()
	
	// HTTP/1.1 模擬
	fmt.Println("【HTTP/1.1】")
	fmt.Println("  特點:")
	fmt.Println("    - 每個域名 6 個並發連接")
	fmt.Println("    - 每個連接串行請求")
	fmt.Println("    - 完整頭部 (每個請求 ~500 字節)")
	fmt.Println("  結果:")
	fmt.Println("    - 連接數: 6")
	fmt.Println("    - 平均延遲: ~150ms/資源")
	fmt.Println("    - 總時間: ~1.25 秒")
	fmt.Println("    - 頭部開銷: ~25 KB")
	fmt.Println()
	
	// HTTP/2 模擬
	fmt.Println("【HTTP/2】")
	fmt.Println("  特點:")
	fmt.Println("    - 單一連接")
	fmt.Println("    - 多路復用 (50 個並發流)")
	fmt.Println("    - 頭部壓縮 (HPACK, ~85% 壓縮率)")
	fmt.Println("  結果:")
	fmt.Println("    - 連接數: 1")
	fmt.Println("    - 平均延遲: ~100ms/資源 (並發)")
	fmt.Println("    - 總時間: ~400 ms")
	fmt.Println("    - 頭部開銷: ~4 KB (壓縮後)")
	fmt.Println()
	
	// HTTP/3 模擬
	fmt.Println("【HTTP/3】")
	fmt.Println("  特點:")
	fmt.Println("    - 基於 QUIC (UDP)")
	fmt.Println("    - 0-RTT 連接建立")
	fmt.Println("    - 無隊頭阻塞")
	fmt.Println("  結果:")
	fmt.Println("    - 連接數: 1")
	fmt.Println("    - 連接建立: 0 RTT (vs HTTP/2 的 2 RTT)")
	fmt.Println("    - 平均延遲: ~90ms/資源")
	fmt.Println("    - 總時間: ~350 ms")
	fmt.Println("    - 頭部開銷: ~3.5 KB (QPACK)")
	fmt.Println()
	
	// 弱網環境 (1% 丟包率)
	fmt.Println("【弱網環境 (1% 丟包率)】")
	fmt.Println("  HTTP/1.1: ~2.5 秒 (+100%)")
	fmt.Println("  HTTP/2:   ~1.2 秒 (+200%, TCP 隊頭阻塞)")
	fmt.Println("  HTTP/3:   ~500 ms (+43%, QUIC 無隊頭阻塞)")
}

// 6. HTTP/2 特性演示
func demonstrateHTTP2Features() {
	fmt.Println("\n=== HTTP/2 特性演示 ===\n")
	
	fmt.Println("1. 多路復用 (Multiplexing)")
	fmt.Println("   單一 TCP 連接中交錯傳輸多個請求/響應")
	fmt.Println("   Stream ID: 1, 3, 5 (客戶端), 2, 4, 6 (伺服器)")
	fmt.Println()
	
	fmt.Println("2. 頭部壓縮 (HPACK)")
	fmt.Println("   靜態表: 常見頭部預定義索引")
	fmt.Println("   動態表: 最近使用的頭部")
	fmt.Println("   增量編碼: 只傳輸變化部分")
	fmt.Println()
	
	fmt.Println("3. 服務器推送 (Server Push)")
	fmt.Println("   PUSH_PROMISE 幀告知客戶端即將推送資源")
	fmt.Println("   客戶端可以拒絕推送 (RST_STREAM)")
	fmt.Println()
	
	fmt.Println("4. 流優先級 (Stream Priority)")
	fmt.Println("   PRIORITY 幀設置資源加載順序")
	fmt.Println("   依賴關係 (dependency) + 權重 (weight)")
	fmt.Println()
	
	fmt.Println("5. 流量控制 (Flow Control)")
	fmt.Println("   WINDOW_UPDATE 幀控制數據流量")
	fmt.Println("   連接級別 + 流級別")
}

func main() {
	fmt.Println("=== HTTP 版本演進演示 ===\n")
	
	// 對比測試
	compareHTTPVersions()
	
	// HTTP/2 特性演示
	demonstrateHTTP2Features()
	
	fmt.Println("\n\n=== 實際伺服器啟動 ===")
	fmt.Println("取消註釋以下代碼來運行:")
	fmt.Println("  // go http1Server()  // HTTP/1.1 伺服器")
	fmt.Println("  // go http2Server()  // HTTP/2 伺服器")
	fmt.Println("  // time.Sleep(2 * time.Second)")
	fmt.Println("  // go http1Client()  // HTTP/1.1 客戶端")
	fmt.Println("  // go http2Client()  // HTTP/2 客戶端")
	fmt.Println("  // select {}         // 保持運行")
}
```

## 總結

### 關鍵要點

1. **HTTP/1.1**: 持久連接,管道化,但有隊頭阻塞問題
2. **HTTP/2**: 二進制協定,多路復用,頭部壓縮,服務器推送,但仍有 TCP 隊頭阻塞
3. **HTTP/3**: 基於 QUIC,0-RTT 連接,完全無隊頭阻塞,連接遷移
4. **選擇依據**: 瀏覽器支持、網路環境、部署難度
5. **未來趨勢**: HTTP/3 逐步成為主流

### 面試高頻問題

1. **Q: HTTP/2 的多路復用如何工作?**
   - A: 單一 TCP 連接中,多個 Stream 交錯傳輸,每個 Stream 對應一個請求/響應,通過 Stream ID 區分

2. **Q: HTTP/2 解決了所有的隊頭阻塞嗎?**
   - A: 只解決了應用層的隊頭阻塞,TCP 層仍有隊頭阻塞 (一個 TCP 封包丟失會阻塞所有 Stream)

3. **Q: 為什麼 HTTP/3 使用 UDP 而不是 TCP?**
   - A: ① UDP 無隊頭阻塞 ② 可在用戶空間實現 (快速迭代) ③ 避免 TCP 的固有限制

4. **Q: HTTP/2 服務器推送有什麼缺點?**
   - A: ① 可能推送客戶端已有的資源 ② 浪費頻寬 ③ 實務上使用較少,HTTP/3 傾向用 103 Early Hints

5. **Q: 如何升級到 HTTP/2/3?**
   - A: HTTP/2: 配置 ALPN,使用 TLS 1.2+;HTTP/3: 通過 Alt-Svc 頭部通告,客戶端嘗試 QUIC 連接

### 延伸閱讀

- **下一步**: [HTTPS 與 TLS/SSL 原理](./https_tls_ssl.md)
- **相關主題**: [網路效能優化策略](./network_performance_optimization.md)
- **深入學習**: QUIC 協定詳解, HPACK/QPACK 壓縮算法
