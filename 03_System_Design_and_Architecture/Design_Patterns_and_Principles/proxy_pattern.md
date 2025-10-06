# 代理模式 (Proxy Pattern)

- **難度**: 6
- **重要程度**: 5
- **標籤**: `設計模式`, `結構型模式`, `代理`, `存取控制`, `延遲載入`

## 問題詳述

代理模式是一種結構型設計模式,它為其他物件提供一個代理或佔位符,以控制對這個物件的存取。代理模式在不改變原始物件的情況下,提供額外的功能或控制存取權限。

## 核心理論與詳解

### 1. 定義與核心概念

#### GoF 定義

> **代理模式 (Proxy Pattern)**:為其他物件提供一種代理以控制對這個物件的存取。

#### 核心概念

代理模式的本質是**控制存取**。代理物件作為客戶端與真實物件之間的中介,可以在不改變真實物件的前提下:

- **控制存取**:決定是否允許存取真實物件
- **延遲初始化**:推遲昂貴物件的建立時機
- **記錄日誌**:記錄對真實物件的操作
- **快取結果**:快取真實物件的運算結果
- **遠端代理**:為遠端物件提供本地代表

### 2. 角色與結構

#### UML 類別圖

```
        +------------------+
        |    Subject       |  <<interface>>
        +------------------+
        | + Request()      |
        +------------------+
                 △
                 |
         +-------+-------+
         |               |
+------------------+  +------------------+
|  RealSubject     |  |     Proxy        |
+------------------+  +------------------+
| + Request()      |  | - realSubject    |
+------------------+  | + Request()      |
                      +------------------+
```

#### 角色說明

1. **Subject (抽象主題)**
   - 定義 RealSubject 和 Proxy 的共同介面
   - 客戶端通過這個介面與物件互動

2. **RealSubject (真實主題)**
   - 定義代理所代表的真實物件
   - 實現實際的業務邏輯

3. **Proxy (代理)**
   - 保存一個引用,使得代理可以存取真實主題
   - 提供與 Subject 相同的介面
   - 控制對真實主題的存取,並可能負責建立和刪除它

### 3. 代理模式的類型

#### 3.1 虛擬代理 (Virtual Proxy)

**用途**:延遲建立開銷較大的物件,直到真正需要時才建立。

**適用場景**:
- 載入大型圖片或影片
- 初始化需要大量運算的物件
- 資料庫連線池

#### 3.2 保護代理 (Protection Proxy)

**用途**:控制對原始物件的存取權限。

**適用場景**:
- 使用者權限控制
- 資源存取限制
- 敏感資料保護

#### 3.3 遠端代理 (Remote Proxy)

**用途**:為位於不同位址空間的物件提供本地代表。

**適用場景**:
- RPC (遠端程序呼叫)
- 分散式系統
- 微服務間通訊

#### 3.4 快取代理 (Cache Proxy)

**用途**:為開銷大的運算結果提供暫時儲存。

**適用場景**:
- 資料庫查詢結果快取
- API 回應快取
- 運算結果快取

#### 3.5 智慧引用代理 (Smart Reference Proxy)

**用途**:在存取物件時執行額外操作。

**適用場景**:
- 引用計數
- 執行緒安全檢查
- 自動記憶體管理

### 4. Go 實現範例

#### 範例 1:虛擬代理 - 圖片延遲載入

```go
package main

import (
	"fmt"
	"time"
)

// Image 抽象主題介面
type Image interface {
	Display()
}

// RealImage 真實主題 - 實際的圖片物件
type RealImage struct {
	filename string
}

// NewRealImage 建立真實圖片物件(模擬耗時操作)
func NewRealImage(filename string) *RealImage {
	img := &RealImage{filename: filename}
	img.loadFromDisk()
	return img
}

// loadFromDisk 模擬從磁碟載入圖片(耗時操作)
func (r *RealImage) loadFromDisk() {
	fmt.Printf("正在從磁碟載入圖片: %s...\n", r.filename)
	time.Sleep(2 * time.Second) // 模擬載入延遲
	fmt.Printf("圖片 %s 載入完成\n", r.filename)
}

// Display 顯示圖片
func (r *RealImage) Display() {
	fmt.Printf("顯示圖片: %s\n", r.filename)
}

// ProxyImage 代理 - 圖片代理物件
type ProxyImage struct {
	filename  string
	realImage *RealImage
}

// NewProxyImage 建立代理圖片物件
func NewProxyImage(filename string) *ProxyImage {
	return &ProxyImage{filename: filename}
}

// Display 顯示圖片(延遲載入)
func (p *ProxyImage) Display() {
	// 只有在真正需要顯示時才載入真實圖片
	if p.realImage == nil {
		p.realImage = NewRealImage(p.filename)
	}
	p.realImage.Display()
}

// 範例使用
func main() {
	fmt.Println("=== 虛擬代理範例:圖片延遲載入 ===\n")

	// 建立代理物件(不會載入圖片)
	image1 := NewProxyImage("photo1.jpg")
	image2 := NewProxyImage("photo2.jpg")

	fmt.Println("代理物件已建立,但圖片尚未載入\n")

	// 第一次顯示時才載入圖片
	fmt.Println("第一次顯示 image1:")
	image1.Display()
	fmt.Println()

	// 第二次顯示不需要重新載入
	fmt.Println("第二次顯示 image1:")
	image1.Display()
	fmt.Println()

	// 顯示 image2(此時才載入)
	fmt.Println("第一次顯示 image2:")
	image2.Display()
}
```

**輸出結果**:

```
=== 虛擬代理範例:圖片延遲載入 ===

代理物件已建立,但圖片尚未載入

第一次顯示 image1:
正在從磁碟載入圖片: photo1.jpg...
圖片 photo1.jpg 載入完成
顯示圖片: photo1.jpg

第二次顯示 image1:
顯示圖片: photo1.jpg

第一次顯示 image2:
正在從磁碟載入圖片: photo2.jpg...
圖片 photo2.jpg 載入完成
顯示圖片: photo2.jpg
```

#### 範例 2:保護代理 - 權限控制

```go
package main

import (
	"fmt"
)

// User 使用者結構
type User struct {
	Name string
	Role string // "admin" 或 "user"
}

// Document 文件介面
type Document interface {
	Read() string
	Write(content string) error
	Delete() error
}

// RealDocument 真實文件
type RealDocument struct {
	name    string
	content string
}

// NewRealDocument 建立真實文件
func NewRealDocument(name, content string) *RealDocument {
	return &RealDocument{
		name:    name,
		content: content,
	}
}

// Read 讀取文件
func (d *RealDocument) Read() string {
	fmt.Printf("讀取文件: %s\n", d.name)
	return d.content
}

// Write 寫入文件
func (d *RealDocument) Write(content string) error {
	fmt.Printf("寫入文件: %s\n", d.name)
	d.content = content
	return nil
}

// Delete 刪除文件
func (d *RealDocument) Delete() error {
	fmt.Printf("刪除文件: %s\n", d.name)
	d.content = ""
	return nil
}

// DocumentProxy 文件代理(帶權限控制)
type DocumentProxy struct {
	realDoc *RealDocument
	user    *User
}

// NewDocumentProxy 建立文件代理
func NewDocumentProxy(doc *RealDocument, user *User) *DocumentProxy {
	return &DocumentProxy{
		realDoc: doc,
		user:    user,
	}
}

// Read 讀取文件(所有人都可以讀取)
func (p *DocumentProxy) Read() string {
	fmt.Printf("[代理] 使用者 %s (%s) 嘗試讀取文件\n", p.user.Name, p.user.Role)
	return p.realDoc.Read()
}

// Write 寫入文件(僅 admin 可以寫入)
func (p *DocumentProxy) Write(content string) error {
	fmt.Printf("[代理] 使用者 %s (%s) 嘗試寫入文件\n", p.user.Name, p.user.Role)
	
	if p.user.Role != "admin" {
		return fmt.Errorf("權限不足:只有管理員可以寫入文件")
	}
	
	return p.realDoc.Write(content)
}

// Delete 刪除文件(僅 admin 可以刪除)
func (p *DocumentProxy) Delete() error {
	fmt.Printf("[代理] 使用者 %s (%s) 嘗試刪除文件\n", p.user.Name, p.user.Role)
	
	if p.user.Role != "admin" {
		return fmt.Errorf("權限不足:只有管理員可以刪除文件")
	}
	
	return p.realDoc.Delete()
}

// 範例使用
func main() {
	fmt.Println("=== 保護代理範例:權限控制 ===\n")

	// 建立真實文件
	doc := NewRealDocument("secret.txt", "機密資料")

	// 一般使用者
	normalUser := &User{Name: "Alice", Role: "user"}
	proxyForNormal := NewDocumentProxy(doc, normalUser)

	// 管理員使用者
	adminUser := &User{Name: "Bob", Role: "admin"}
	proxyForAdmin := NewDocumentProxy(doc, adminUser)

	// 一般使用者嘗試操作
	fmt.Println("--- 一般使用者操作 ---")
	content := proxyForNormal.Read()
	fmt.Printf("讀取內容: %s\n\n", content)

	err := proxyForNormal.Write("嘗試修改內容")
	if err != nil {
		fmt.Printf("錯誤: %v\n\n", err)
	}

	err = proxyForNormal.Delete()
	if err != nil {
		fmt.Printf("錯誤: %v\n\n", err)
	}

	// 管理員使用者嘗試操作
	fmt.Println("--- 管理員操作 ---")
	content = proxyForAdmin.Read()
	fmt.Printf("讀取內容: %s\n\n", content)

	err = proxyForAdmin.Write("管理員修改的內容")
	if err != nil {
		fmt.Printf("錯誤: %v\n\n", err)
	}

	err = proxyForAdmin.Delete()
	if err != nil {
		fmt.Printf("錯誤: %v\n\n", err)
	}
}
```

**輸出結果**:

```
=== 保護代理範例:權限控制 ===

--- 一般使用者操作 ---
[代理] 使用者 Alice (user) 嘗試讀取文件
讀取文件: secret.txt
讀取內容: 機密資料

[代理] 使用者 Alice (user) 嘗試寫入文件
錯誤: 權限不足:只有管理員可以寫入文件

[代理] 使用者 Alice (user) 嘗試刪除文件
錯誤: 權限不足:只有管理員可以刪除文件

--- 管理員操作 ---
[代理] 使用者 Bob (admin) 嘗試讀取文件
讀取文件: secret.txt
讀取內容: 機密資料

[代理] 使用者 Bob (admin) 嘗試寫入文件
寫入文件: secret.txt

[代理] 使用者 Bob (admin) 嘗試刪除文件
刪除文件: secret.txt
```

#### 範例 3:快取代理 - API 回應快取

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

// DataService 資料服務介面
type DataService interface {
	GetData(key string) (string, error)
}

// RealDataService 真實資料服務(模擬資料庫或 API)
type RealDataService struct{}

// GetData 從資料庫獲取資料(模擬耗時操作)
func (s *RealDataService) GetData(key string) (string, error) {
	fmt.Printf("[真實服務] 正在從資料庫查詢 key=%s...\n", key)
	time.Sleep(1 * time.Second) // 模擬資料庫查詢延遲
	
	// 模擬資料
	data := fmt.Sprintf("來自資料庫的資料: %s (查詢時間: %s)", key, time.Now().Format("15:04:05"))
	return data, nil
}

// CacheEntry 快取項目
type CacheEntry struct {
	Value      string
	ExpireTime time.Time
}

// CachedDataService 快取代理服務
type CachedDataService struct {
	realService DataService
	cache       map[string]*CacheEntry
	cacheTTL    time.Duration
	mu          sync.RWMutex
}

// NewCachedDataService 建立快取代理服務
func NewCachedDataService(realService DataService, ttl time.Duration) *CachedDataService {
	return &CachedDataService{
		realService: realService,
		cache:       make(map[string]*CacheEntry),
		cacheTTL:    ttl,
	}
}

// GetData 獲取資料(帶快取功能)
func (s *CachedDataService) GetData(key string) (string, error) {
	// 嘗試從快取讀取
	s.mu.RLock()
	entry, exists := s.cache[key]
	s.mu.RUnlock()

	// 快取命中且未過期
	if exists && time.Now().Before(entry.ExpireTime) {
		fmt.Printf("[快取代理] 快取命中: key=%s\n", key)
		return entry.Value, nil
	}

	// 快取未命中或已過期,從真實服務獲取
	fmt.Printf("[快取代理] 快取未命中: key=%s\n", key)
	data, err := s.realService.GetData(key)
	if err != nil {
		return "", err
	}

	// 將結果存入快取
	s.mu.Lock()
	s.cache[key] = &CacheEntry{
		Value:      data,
		ExpireTime: time.Now().Add(s.cacheTTL),
	}
	s.mu.Unlock()

	fmt.Printf("[快取代理] 資料已快取: key=%s, TTL=%v\n", key, s.cacheTTL)
	return data, nil
}

// ClearCache 清除快取
func (s *CachedDataService) ClearCache() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.cache = make(map[string]*CacheEntry)
	fmt.Println("[快取代理] 快取已清除")
}

// 範例使用
func main() {
	fmt.Println("=== 快取代理範例:API 回應快取 ===\n")

	// 建立真實服務和快取代理
	realService := &RealDataService{}
	cachedService := NewCachedDataService(realService, 3*time.Second)

	// 第一次查詢(快取未命中)
	fmt.Println("--- 第一次查詢 user:123 ---")
	data, _ := cachedService.GetData("user:123")
	fmt.Printf("結果: %s\n\n", data)

	// 第二次查詢相同 key(快取命中)
	fmt.Println("--- 第二次查詢 user:123 ---")
	data, _ = cachedService.GetData("user:123")
	fmt.Printf("結果: %s\n\n", data)

	// 查詢不同 key(快取未命中)
	fmt.Println("--- 查詢 user:456 ---")
	data, _ = cachedService.GetData("user:456")
	fmt.Printf("結果: %s\n\n", data)

	// 等待快取過期
	fmt.Println("--- 等待 4 秒(快取過期) ---")
	time.Sleep(4 * time.Second)

	// 再次查詢原先的 key(快取已過期)
	fmt.Println("--- 快取過期後查詢 user:123 ---")
	data, _ = cachedService.GetData("user:123")
	fmt.Printf("結果: %s\n\n", data)
}
```

**輸出結果**:

```
=== 快取代理範例:API 回應快取 ===

--- 第一次查詢 user:123 ---
[快取代理] 快取未命中: key=user:123
[真實服務] 正在從資料庫查詢 key=user:123...
[快取代理] 資料已快取: key=user:123, TTL=3s
結果: 來自資料庫的資料: user:123 (查詢時間: 14:30:01)

--- 第二次查詢 user:123 ---
[快取代理] 快取命中: key=user:123
結果: 來自資料庫的資料: user:123 (查詢時間: 14:30:01)

--- 查詢 user:456 ---
[快取代理] 快取未命中: key=user:456
[真實服務] 正在從資料庫查詢 key=user:456...
[快取代理] 資料已快取: key=user:456, TTL=3s
結果: 來自資料庫的資料: user:456 (查詢時間: 14:30:03)

--- 等待 4 秒(快取過期) ---
--- 快取過期後查詢 user:123 ---
[快取代理] 快取未命中: key=user:123
[真實服務] 正在從資料庫查詢 key=user:123...
[快取代理] 資料已快取: key=user:123, TTL=3s
結果: 來自資料庫的資料: user:123 (查詢時間: 14:30:07)
```

### 5. 代理模式 vs 裝飾器模式

代理模式和裝飾器模式在結構上非常相似,但**意圖不同**:

| 比較維度 | 代理模式 (Proxy) | 裝飾器模式 (Decorator) |
|---------|-----------------|---------------------|
| **核心意圖** | 控制存取 | 增強功能 |
| **關注點** | 存取管理、權限控制 | 動態新增職責 |
| **物件建立** | 通常由代理控制真實物件的建立時機 | 裝飾器包裝已存在的物件 |
| **功能疊加** | 通常只有一層代理 | 可多層嵌套 |
| **使用時機** | 延遲載入、存取控制、快取 | 動態新增功能 |
| **對客戶端** | 對客戶端透明(可能不知道使用代理) | 客戶端明確知道正在裝飾 |

**程式碼對比**:

```go
// 代理模式 - 關注存取控制
type Proxy struct {
    realSubject *RealSubject
}

func (p *Proxy) Request() {
    // 存取控制邏輯
    if p.checkAccess() {
        if p.realSubject == nil {
            p.realSubject = NewRealSubject() // 延遲建立
        }
        p.realSubject.Request()
        p.logAccess() // 記錄存取
    }
}

// 裝飾器模式 - 關注功能增強
type Decorator struct {
    component Component // 已存在的物件
}

func (d *Decorator) Operation() {
    d.addedBehaviorBefore() // 前置增強
    d.component.Operation()  // 委派給被裝飾物件
    d.addedBehaviorAfter()  // 後置增強
}
```

### 6. 優點與缺點

#### 優點

1. **單一職責原則 (SRP)**
   - 代理物件專注於存取控制
   - 真實物件專注於業務邏輯
   - 職責分離清晰

2. **開閉原則 (OCP)**
   - 無需修改真實物件即可新增代理功能
   - 可輕鬆切換不同類型的代理

3. **效能優化**
   - 延遲載入減少不必要的資源消耗
   - 快取機制提升系統效能

4. **存取控制**
   - 提供統一的權限管理機制
   - 保護敏感資源

5. **解耦合**
   - 客戶端與真實物件解耦
   - 便於進行遠端呼叫或本地化處理

#### 缺點

1. **增加系統複雜度**
   - 引入額外的代理類別
   - 增加程式碼量和維護成本

2. **可能影響效能**
   - 代理層增加額外的方法呼叫開銷
   - 不當的快取策略可能導致資料不一致

3. **除錯困難**
   - 多層代理可能導致呼叫鏈複雜
   - 錯誤追蹤變得困難

### 7. 適用場景

#### 虛擬代理

```
場景: 需要延遲建立開銷大的物件
例子:
- 圖片檢視器(延遲載入大圖)
- 文件編輯器(延遲載入大檔案)
- ORM 框架(延遲載入關聯物件)
```

#### 保護代理

```
場景: 需要控制對物件的存取權限
例子:
- 檔案系統權限控制
- API 呼叫權限驗證
- 資料庫操作權限檢查
```

#### 遠端代理

```
場景: 為遠端物件提供本地代表
例子:
- RPC 框架(gRPC, Thrift)
- 分散式快取(Redis 客戶端)
- 微服務呼叫
```

#### 快取代理

```
場景: 需要快取昂貴操作的結果
例子:
- 資料庫查詢結果快取
- HTTP 回應快取
- 運算結果快取
```

#### 智慧引用代理

```
場景: 需要在存取物件時執行額外操作
例子:
- 引用計數(垃圾回收)
- 執行緒安全檢查
- 複寫時複製(Copy-on-Write)
```

### 8. 實際應用案例

#### 案例 1:資料庫連線池代理

```go
// 資料庫連線介面
type DBConnection interface {
    Query(sql string) ([]Row, error)
    Close() error
}

// 連線池代理
type ConnectionPoolProxy struct {
    pool        *ConnectionPool
    realConn    DBConnection
    inUse       bool
    mu          sync.Mutex
}

func (p *ConnectionPoolProxy) Query(sql string) ([]Row, error) {
    p.mu.Lock()
    defer p.mu.Unlock()
    
    // 從連線池獲取連線
    if p.realConn == nil {
        p.realConn = p.pool.GetConnection()
    }
    
    return p.realConn.Query(sql)
}

func (p *ConnectionPoolProxy) Close() error {
    p.mu.Lock()
    defer p.mu.Unlock()
    
    // 歸還連線到連線池而不是真正關閉
    if p.realConn != nil {
        p.pool.ReturnConnection(p.realConn)
        p.realConn = nil
    }
    
    return nil
}
```

#### 案例 2:HTTP 反向代理

```go
// HTTP 反向代理(如 Nginx)
type ReverseProxy struct {
    backends []*url.URL
    current  int
    mu       sync.Mutex
}

func (p *ReverseProxy) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    // 選擇後端伺服器(負載均衡)
    backend := p.selectBackend()
    
    // 建立代理請求
    proxyReq, _ := http.NewRequest(r.Method, backend.String()+r.URL.Path, r.Body)
    
    // 轉發請求到後端
    client := &http.Client{}
    resp, err := client.Do(proxyReq)
    if err != nil {
        http.Error(w, "Bad Gateway", http.StatusBadGateway)
        return
    }
    defer resp.Body.Close()
    
    // 將後端回應傳回客戶端
    io.Copy(w, resp.Body)
}

func (p *ReverseProxy) selectBackend() *url.URL {
    p.mu.Lock()
    defer p.mu.Unlock()
    
    backend := p.backends[p.current]
    p.current = (p.current + 1) % len(p.backends)
    return backend
}
```

#### 案例 3:分散式快取代理

```go
// 分散式快取代理(本地快取 + 遠端快取)
type DistributedCacheProxy struct {
    localCache  Cache  // 本地快取(如記憶體)
    remoteCache Cache  // 遠端快取(如 Redis)
}

func (p *DistributedCacheProxy) Get(key string) (interface{}, error) {
    // 先查本地快取
    value, err := p.localCache.Get(key)
    if err == nil {
        return value, nil
    }
    
    // 本地快取未命中,查遠端快取
    value, err = p.remoteCache.Get(key)
    if err == nil {
        // 將遠端快取的資料寫回本地快取
        p.localCache.Set(key, value)
        return value, nil
    }
    
    return nil, errors.New("cache miss")
}

func (p *DistributedCacheProxy) Set(key string, value interface{}) error {
    // 同時寫入本地和遠端快取
    _ = p.localCache.Set(key, value)
    return p.remoteCache.Set(key, value)
}
```

### 9. 最佳實踐

#### 1. 保持介面一致性

```go
// ✅ 正確:代理與真實物件實現相同介面
type UserService interface {
    GetUser(id int) (*User, error)
}

type RealUserService struct{}
func (s *RealUserService) GetUser(id int) (*User, error) { /* ... */ }

type CachedUserService struct {
    real UserService
}
func (s *CachedUserService) GetUser(id int) (*User, error) { /* ... */ }

// ❌ 錯誤:代理增加了新方法,破壞介面一致性
type CachedUserService struct {
    real UserService
}
func (s *CachedUserService) GetUser(id int) (*User, error) { /* ... */ }
func (s *CachedUserService) ClearCache() { /* ... */ } // 新方法
```

#### 2. 代理的代理(多層代理)

```go
// 可以組合多個代理實現複雜功能
realService := NewRealService()
cachedService := NewCacheProxy(realService)      // 快取代理
protectedService := NewProtectionProxy(cachedService, user) // 權限代理
loggingService := NewLoggingProxy(protectedService) // 日誌代理

// 呼叫鏈: Client → LoggingProxy → ProtectionProxy → CacheProxy → RealService
```

#### 3. 延遲初始化的執行緒安全

```go
// ✅ 正確:使用 sync.Once 確保執行緒安全
type LazyProxy struct {
    real     *RealObject
    initOnce sync.Once
}

func (p *LazyProxy) Operation() {
    p.initOnce.Do(func() {
        p.real = NewRealObject()
    })
    p.real.Operation()
}

// ❌ 錯誤:未考慮併發情況
type LazyProxy struct {
    real *RealObject
}

func (p *LazyProxy) Operation() {
    if p.real == nil { // 可能發生 race condition
        p.real = NewRealObject()
    }
    p.real.Operation()
}
```

#### 4. 快取過期策略

```go
// 實現合理的快取過期策略
type CacheProxy struct {
    cache       map[string]*CacheEntry
    maxSize     int
    evictPolicy string // "LRU", "LFU", "TTL"
}

// LRU 過期策略
func (p *CacheProxy) evictLRU() {
    // 移除最久未使用的項目
}

// TTL 過期策略
func (p *CacheProxy) cleanExpired() {
    for key, entry := range p.cache {
        if time.Now().After(entry.ExpireTime) {
            delete(p.cache, key)
        }
    }
}
```

#### 5. 錯誤處理與降級

```go
// 代理應優雅處理真實服務的錯誤
type ResilientProxy struct {
    primary   Service
    fallback  Service
    circuitBreaker *CircuitBreaker
}

func (p *ResilientProxy) Call() (interface{}, error) {
    // 檢查熔斷器狀態
    if p.circuitBreaker.IsOpen() {
        return p.fallback.Call() // 降級到備用服務
    }
    
    // 嘗試呼叫主服務
    result, err := p.primary.Call()
    if err != nil {
        p.circuitBreaker.RecordFailure()
        return p.fallback.Call() // 降級
    }
    
    p.circuitBreaker.RecordSuccess()
    return result, nil
}
```

## 常見面試考點

### Q1:代理模式和裝飾器模式有什麼區別?

**答案**:

雖然兩者結構相似,但**意圖完全不同**:

**代理模式 (Proxy)**:
- **意圖**:控制對物件的存取
- **關注**:何時以及如何存取物件
- **常見用途**:延遲載入、權限控制、遠端存取、快取
- **物件建立**:代理通常控制真實物件的建立時機
- **層數**:通常只有一層代理

**裝飾器模式 (Decorator)**:
- **意圖**:動態增強物件的功能
- **關注**:為物件新增額外的職責
- **常見用途**:新增日誌、加密、壓縮等功能
- **物件建立**:裝飾器包裝已存在的物件
- **層數**:可以多層嵌套

**記憶技巧**:
- **Proxy = 門衛**:控制誰能進、何時進
- **Decorator = 包裝紙**:在原有物品上新增裝飾

### Q2:虛擬代理如何實現延遲載入?有什麼注意事項?

**答案**:

**實現原理**:

```go
type VirtualProxy struct {
    realObject *ExpensiveObject
    initOnce   sync.Once // 確保只初始化一次
}

func (p *VirtualProxy) Operation() {
    // 第一次呼叫時才建立真實物件
    p.initOnce.Do(func() {
        p.realObject = NewExpensiveObject()
    })
    p.realObject.Operation()
}
```

**注意事項**:

1. **執行緒安全**:使用 `sync.Once` 確保只初始化一次
2. **記憶體洩漏**:真實物件建立後可能長期佔用記憶體
3. **首次呼叫延遲**:第一次操作會比較慢
4. **錯誤處理**:初始化失敗的處理策略
5. **適用場景**:只適合初始化開銷大的物件

**典型應用**:
- ORM 的延遲載入關聯
- 圖片檢視器的延遲載入
- 大檔案的延遲讀取

### Q3:如何實現一個執行緒安全的快取代理?

**答案**:

```go
type ThreadSafeCacheProxy struct {
    real  DataService
    cache sync.Map // Go 的併發安全 map
}

func (p *ThreadSafeCacheProxy) GetData(key string) (string, error) {
    // 嘗試從快取讀取
    if value, ok := p.cache.Load(key); ok {
        return value.(string), nil
    }
    
    // 快取未命中,從真實服務獲取
    data, err := p.real.GetData(key)
    if err != nil {
        return "", err
    }
    
    // 存入快取
    p.cache.Store(key, data)
    return data, nil
}
```

**進階實現**(避免快取擊穿):

```go
type AdvancedCacheProxy struct {
    real      DataService
    cache     sync.Map
    loadGroup singleflight.Group // 防止快取擊穿
}

func (p *AdvancedCacheProxy) GetData(key string) (string, error) {
    // 嘗試從快取讀取
    if value, ok := p.cache.Load(key); ok {
        return value.(string), nil
    }
    
    // 使用 singleflight 確保同一時間只有一個請求載入資料
    value, err, _ := p.loadGroup.Do(key, func() (interface{}, error) {
        // 再次檢查快取(double check)
        if v, ok := p.cache.Load(key); ok {
            return v.(string), nil
        }
        
        // 從真實服務獲取
        data, err := p.real.GetData(key)
        if err != nil {
            return "", err
        }
        
        // 存入快取
        p.cache.Store(key, data)
        return data, nil
    })
    
    if err != nil {
        return "", err
    }
    return value.(string), nil
}
```

**關鍵技術**:
1. **sync.Map**:Go 的併發安全 map
2. **singleflight**:防止快取擊穿(多個請求同時載入同一資料)
3. **Double-Check**:二次檢查快取以減少不必要的載入

### Q4:遠端代理在 RPC 框架中的應用?

**答案**:

**作用**:為遠端服務提供本地介面,讓客戶端像呼叫本地物件一樣呼叫遠端服務。

**實現原理**:

```go
// 1. 定義服務介面
type UserService interface {
    GetUser(id int) (*User, error)
}

// 2. 本地代理(客戶端)
type UserServiceProxy struct {
    client *rpc.Client
}

func (p *UserServiceProxy) GetUser(id int) (*User, error) {
    var user User
    // 將方法呼叫序列化並透過網路發送
    err := p.client.Call("UserService.GetUser", id, &user)
    return &user, err
}

// 3. 遠端實現(伺服器端)
type UserServiceImpl struct {
    db *Database
}

func (s *UserServiceImpl) GetUser(id int) (*User, error) {
    return s.db.QueryUser(id)
}
```

**典型 RPC 框架**:
- **gRPC**:使用 Protocol Buffers 定義介面,自動生成代理程式碼
- **Thrift**:跨語言 RPC 框架
- **Dubbo**:Java 微服務 RPC 框架

**關鍵步驟**:
1. 介面定義(IDL)
2. 請求序列化
3. 網路傳輸
4. 回應反序列化
5. 錯誤處理

### Q5:如何設計一個同時支援快取和權限控制的代理?

**答案**:

**方案 1:組合多個代理(推薦)**

```go
// 建立代理鏈
realService := NewRealService()
cachedService := NewCacheProxy(realService)        // 第一層:快取
protectedService := NewProtectionProxy(cachedService, user) // 第二層:權限

// 使用
data, err := protectedService.GetData(key)
```

**優點**:
- 單一職責:每個代理只負責一件事
- 靈活組合:可自由調整順序或新增其他代理
- 易於測試

**方案 2:複合代理**

```go
type CachedProtectedProxy struct {
    real  DataService
    cache map[string]string
    user  *User
}

func (p *CachedProtectedProxy) GetData(key string) (string, error) {
    // 先檢查權限
    if !p.checkPermission(key) {
        return "", errors.New("permission denied")
    }
    
    // 再檢查快取
    if value, ok := p.cache[key]; ok {
        return value, nil
    }
    
    // 從真實服務獲取
    data, err := p.real.GetData(key)
    if err != nil {
        return "", err
    }
    
    // 存入快取
    p.cache[key] = data
    return data, nil
}
```

**優點**:
- 效能較好(減少一層呼叫)
- 可以優化權限與快取的交互邏輯

**缺點**:
- 違反單一職責原則
- 難以重用和擴展

**建議**:優先使用方案 1(組合多個代理),除非有明確的效能需求。

## 總結

代理模式是一種強大的結構型設計模式,其核心價值在於**控制存取**。透過在客戶端與真實物件之間引入代理層,我們可以實現延遲載入、權限控制、快取優化、遠端存取等多種功能。

**關鍵要點**:

1. **意圖是控制存取**,而非增強功能(這是裝飾器模式的職責)
2. **有多種類型**:虛擬代理、保護代理、遠端代理、快取代理等
3. **與裝飾器的區別**:代理控制存取,裝飾器增強功能
4. **執行緒安全**:快取代理需特別注意併發問題
5. **可組合使用**:多個代理可串聯以實現複雜功能

**實務應用**:
- 資料庫連線池
- HTTP 反向代理
- RPC 框架
- ORM 延遲載入
- 分散式快取

在實際開發中,代理模式廣泛應用於框架和中介軟體的實現,是後端工程師必須掌握的重要模式之一。
