# 什麼是觀察者模式 (Observer Pattern)？

- **難度**: 6
- **重要性**: 5
- **標籤**: `Design Pattern`, `Observer`, `Behavioral`, `Pub-Sub`

## 問題詳述

觀察者模式是一種行為型設計模式，它定義對象間的一對多依賴關係，當一個對象的狀態發生變化時，所有依賴它的對象都會收到通知並自動更新。這個模式如何解耦發布者與訂閱者？

## 核心理論與詳解

### 定義與本質

**觀察者模式 (Observer Pattern)** 又稱為發布-訂閱模式 (Publish-Subscribe Pattern)：

> "Define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically."

**核心思想**：
- 建立一對多的依賴關係
- 當主題 (Subject) 狀態變化時，通知所有觀察者 (Observer)
- 觀察者自動更新
- 鬆耦合：發布者不需要知道訂閱者的具體類型

**四個核心角色**：
1. **Subject (主題)**：被觀察的對象，維護觀察者列表
2. **Observer (觀察者)**：定義更新介面
3. **ConcreteSubject (具體主題)**：實現主題介面，狀態變化時通知觀察者
4. **ConcreteObserver (具體觀察者)**：實現觀察者介面，響應通知

### 基本實現

```go
// ✅ 觀察者模式的標準實現

// 1. 觀察者介面
type Observer interface {
    Update(message string)
    GetID() string
}

// 2. 主題介面
type Subject interface {
    Attach(observer Observer)
    Detach(observerID string)
    Notify(message string)
}

// 3. 具體主題
type NewsAgency struct {
    observers map[string]Observer
}

func NewNewsAgency() *NewsAgency {
    return &NewsAgency{
        observers: make(map[string]Observer),
    }
}

func (n *NewsAgency) Attach(observer Observer) {
    n.observers[observer.GetID()] = observer
    fmt.Printf("Observer %s subscribed\n", observer.GetID())
}

func (n *NewsAgency) Detach(observerID string) {
    delete(n.observers, observerID)
    fmt.Printf("Observer %s unsubscribed\n", observerID)
}

func (n *NewsAgency) Notify(message string) {
    fmt.Printf("News Agency: Broadcasting news...\n")
    for _, observer := range n.observers {
        observer.Update(message)
    }
}

func (n *NewsAgency) PublishNews(news string) {
    fmt.Printf("News Agency: Publishing news: %s\n", news)
    n.Notify(news)
}

// 4. 具體觀察者
type EmailSubscriber struct {
    id    string
    email string
}

func NewEmailSubscriber(id, email string) *EmailSubscriber {
    return &EmailSubscriber{id: id, email: email}
}

func (e *EmailSubscriber) GetID() string {
    return e.id
}

func (e *EmailSubscriber) Update(message string) {
    fmt.Printf("Email to %s: %s\n", e.email, message)
}

type SMSSubscriber struct {
    id    string
    phone string
}

func NewSMSSubscriber(id, phone string) *SMSSubscriber {
    return &SMSSubscriber{id: id, phone: phone}
}

func (s *SMSSubscriber) GetID() string {
    return s.id
}

func (s *SMSSubscriber) Update(message string) {
    fmt.Printf("SMS to %s: %s\n", s.phone, message)
}

type AppNotificationSubscriber struct {
    id       string
    username string
}

func NewAppNotificationSubscriber(id, username string) *AppNotificationSubscriber {
    return &AppNotificationSubscriber{id: id, username: username}
}

func (a *AppNotificationSubscriber) GetID() string {
    return a.id
}

func (a *AppNotificationSubscriber) Update(message string) {
    fmt.Printf("App notification for %s: %s\n", a.username, message)
}

// 使用示例
func main() {
    agency := NewNewsAgency()
    
    // 訂閱者註冊
    email1 := NewEmailSubscriber("email1", "user1@example.com")
    email2 := NewEmailSubscriber("email2", "user2@example.com")
    sms1 := NewSMSSubscriber("sms1", "+1234567890")
    app1 := NewAppNotificationSubscriber("app1", "john_doe")
    
    agency.Attach(email1)
    agency.Attach(email2)
    agency.Attach(sms1)
    agency.Attach(app1)
    
    // 發布新聞
    agency.PublishNews("Breaking: Important event happened!")
    
    // 取消訂閱
    agency.Detach("email2")
    
    // 再次發布
    agency.PublishNews("Update: More details revealed")
}
```

### 實際應用場景

#### 場景 1: 事件系統

```go
// 事件類型
type EventType string

const (
    UserRegistered EventType = "user_registered"
    UserLoggedIn   EventType = "user_logged_in"
    OrderPlaced    EventType = "order_placed"
)

// 事件數據
type Event struct {
    Type      EventType
    Timestamp time.Time
    Data      interface{}
}

// 事件監聽器
type EventListener interface {
    Handle(event Event)
}

// 事件總線
type EventBus struct {
    listeners map[EventType][]EventListener
    mu        sync.RWMutex
}

func NewEventBus() *EventBus {
    return &EventBus{
        listeners: make(map[EventType][]EventListener),
    }
}

func (e *EventBus) Subscribe(eventType EventType, listener EventListener) {
    e.mu.Lock()
    defer e.mu.Unlock()
    
    e.listeners[eventType] = append(e.listeners[eventType], listener)
}

func (e *EventBus) Publish(event Event) {
    e.mu.RLock()
    defer e.mu.RUnlock()
    
    listeners, exists := e.listeners[event.Type]
    if !exists {
        return
    }
    
    for _, listener := range listeners {
        // 異步處理事件
        go listener.Handle(event)
    }
}

// 具體監聽器
type EmailNotificationListener struct{}

func (e *EmailNotificationListener) Handle(event Event) {
    fmt.Printf("[Email] Handling event: %s\n", event.Type)
    time.Sleep(100 * time.Millisecond) // 模擬處理
}

type LoggingListener struct{}

func (l *LoggingListener) Handle(event Event) {
    fmt.Printf("[Log] Event occurred: %s at %s\n", event.Type, event.Timestamp)
}

type AnalyticsListener struct{}

func (a *AnalyticsListener) Handle(event Event) {
    fmt.Printf("[Analytics] Tracking event: %s\n", event.Type)
}

// 使用
func main() {
    bus := NewEventBus()
    
    // 註冊監聽器
    bus.Subscribe(UserRegistered, &EmailNotificationListener{})
    bus.Subscribe(UserRegistered, &LoggingListener{})
    bus.Subscribe(UserRegistered, &AnalyticsListener{})
    
    bus.Subscribe(OrderPlaced, &EmailNotificationListener{})
    bus.Subscribe(OrderPlaced, &LoggingListener{})
    
    // 發布事件
    bus.Publish(Event{
        Type:      UserRegistered,
        Timestamp: time.Now(),
        Data:      map[string]string{"user_id": "123", "email": "user@example.com"},
    })
    
    bus.Publish(Event{
        Type:      OrderPlaced,
        Timestamp: time.Now(),
        Data:      map[string]string{"order_id": "456", "amount": "99.99"},
    })
    
    time.Sleep(1 * time.Second) // 等待異步處理完成
}
```

#### 場景 2: 股票行情監控

```go
// 股票數據
type Stock struct {
    Symbol string
    Price  float64
}

// 股票監控器
type StockObserver interface {
    OnPriceChange(stock Stock)
}

// 股票市場 (主題)
type StockMarket struct {
    observers map[string][]StockObserver // symbol -> observers
    mu        sync.RWMutex
}

func NewStockMarket() *StockMarket {
    return &StockMarket{
        observers: make(map[string][]StockObserver),
    }
}

func (s *StockMarket) Subscribe(symbol string, observer StockObserver) {
    s.mu.Lock()
    defer s.mu.Unlock()
    
    s.observers[symbol] = append(s.observers[symbol], observer)
}

func (s *StockMarket) UpdatePrice(symbol string, newPrice float64) {
    s.mu.RLock()
    defer s.mu.RUnlock()
    
    stock := Stock{Symbol: symbol, Price: newPrice}
    
    if observers, exists := s.observers[symbol]; exists {
        for _, observer := range observers {
            observer.OnPriceChange(stock)
        }
    }
}

// 投資者觀察者
type Investor struct {
    name         string
    buyThreshold float64
}

func (i *Investor) OnPriceChange(stock Stock) {
    if stock.Price <= i.buyThreshold {
        fmt.Printf("%s: Buying %s at $%.2f\n", i.name, stock.Symbol, stock.Price)
    } else {
        fmt.Printf("%s: Watching %s at $%.2f\n", i.name, stock.Symbol, stock.Price)
    }
}

// 交易系統觀察者
type TradingSystem struct {
    name string
}

func (t *TradingSystem) OnPriceChange(stock Stock) {
    fmt.Printf("[%s] Recorded price: %s = $%.2f\n", t.name, stock.Symbol, stock.Price)
}

// 使用
func main() {
    market := NewStockMarket()
    
    // 投資者訂閱
    investor1 := &Investor{name: "Alice", buyThreshold: 100.0}
    investor2 := &Investor{name: "Bob", buyThreshold: 95.0}
    tradingSystem := &TradingSystem{name: "Auto-Trader"}
    
    market.Subscribe("AAPL", investor1)
    market.Subscribe("AAPL", investor2)
    market.Subscribe("AAPL", tradingSystem)
    
    // 價格更新
    market.UpdatePrice("AAPL", 105.0)
    market.UpdatePrice("AAPL", 98.0)
    market.UpdatePrice("AAPL", 92.0)
}
```

#### 場景 3: UI 元件更新

```go
// 數據模型 (Subject)
type DataModel struct {
    data      interface{}
    observers []ModelObserver
}

type ModelObserver interface {
    OnDataChanged(data interface{})
}

func (d *DataModel) Attach(observer ModelObserver) {
    d.observers = append(d.observers, observer)
}

func (d *DataModel) SetData(data interface{}) {
    d.data = data
    d.notifyObservers()
}

func (d *DataModel) notifyObservers() {
    for _, observer := range d.observers {
        observer.OnDataChanged(d.data)
    }
}

// UI 元件 (Observers)
type TextView struct {
    name string
}

func (t *TextView) OnDataChanged(data interface{}) {
    fmt.Printf("[TextView %s] Displaying: %v\n", t.name, data)
}

type ChartView struct {
    chartType string
}

func (c *ChartView) OnDataChanged(data interface{}) {
    fmt.Printf("[ChartView %s] Rendering chart with data: %v\n", c.chartType, data)
}

type TableView struct{}

func (t *TableView) OnDataChanged(data interface{}) {
    fmt.Printf("[TableView] Updating table with data: %v\n", data)
}

// 使用
func main() {
    model := &DataModel{}
    
    // UI 元件訂閱模型
    model.Attach(&TextView{name: "Title"})
    model.Attach(&TextView{name: "Summary"})
    model.Attach(&ChartView{chartType: "Line Chart"})
    model.Attach(&TableView{})
    
    // 更新數據，所有 UI 元件自動更新
    model.SetData(map[string]interface{}{
        "title": "Sales Report",
        "value": 12345,
    })
}
```

### 觀察者模式的變體

#### 變體 1: 推模型 vs 拉模型

**推模型 (Push Model)**：Subject 主動推送詳細數據給 Observer
```go
type PushObserver interface {
    Update(data DetailedData) // 推送詳細數據
}
```

**拉模型 (Pull Model)**：Subject 只通知變化，Observer 主動拉取數據
```go
type PullObserver interface {
    Update(subject Subject) // 只傳遞 Subject 引用
}

type Subject interface {
    GetState() interface{} // Observer 自己拉取數據
}

func (o *ConcreteObserver) Update(subject Subject) {
    data := subject.GetState() // 主動獲取需要的數據
    // 處理數據
}
```

#### 變體 2: 帶優先級的觀察者

```go
type PriorityObserver struct {
    Observer
    priority int
}

type PrioritySubject struct {
    observers []PriorityObserver
}

func (p *PrioritySubject) Attach(observer Observer, priority int) {
    po := PriorityObserver{Observer: observer, priority: priority}
    p.observers = append(p.observers, po)
    
    // 按優先級排序
    sort.Slice(p.observers, func(i, j int) bool {
        return p.observers[i].priority > p.observers[j].priority
    })
}

func (p *PrioritySubject) Notify(message string) {
    for _, po := range p.observers {
        po.Update(message) // 按優先級順序通知
    }
}
```

#### 變體 3: Channel 版本 (Go 特有)

```go
// 使用 Go channel 實現觀察者模式

type ChannelSubject struct {
    subscribers []chan<- string
}

func (c *ChannelSubject) Subscribe() <-chan string {
    ch := make(chan string, 10)
    c.subscribers = append(c.subscribers, ch)
    return ch
}

func (c *ChannelSubject) Publish(message string) {
    for _, sub := range c.subscribers {
        select {
        case sub <- message:
        default:
            // Channel 滿了，跳過或處理
        }
    }
}

// 使用
func main() {
    subject := &ChannelSubject{}
    
    // 訂閱者 1
    ch1 := subject.Subscribe()
    go func() {
        for msg := range ch1 {
            fmt.Println("Subscriber 1:", msg)
        }
    }()
    
    // 訂閱者 2
    ch2 := subject.Subscribe()
    go func() {
        for msg := range ch2 {
            fmt.Println("Subscriber 2:", msg)
        }
    }()
    
    // 發布消息
    subject.Publish("Hello")
    subject.Publish("World")
    
    time.Sleep(1 * time.Second)
}
```

### 優缺點分析

#### 優點

1. **鬆耦合**：Subject 和 Observer 之間抽象耦合
2. **動態關係**：運行時可動態增刪觀察者
3. **廣播通信**：一次通知，多個接收者
4. **符合開閉原則**：新增觀察者不需修改 Subject

#### 缺點

1. **通知開銷**：觀察者數量多時，通知耗時
2. **順序依賴**：觀察者執行順序可能導致問題
3. **內存洩漏風險**：忘記 Detach 會導致內存洩漏
4. **級聯更新**：Observer 觸發新的通知可能導致循環

### 注意事項與最佳實踐

#### 1. 避免循環更新
```go
type SafeSubject struct {
    observers map[string]Observer
    notifying bool // 防止重入
}

func (s *SafeSubject) Notify(message string) {
    if s.notifying {
        return // 避免循環通知
    }
    
    s.notifying = true
    defer func() { s.notifying = false }()
    
    for _, observer := range s.observers {
        observer.Update(message)
    }
}
```

#### 2. 異步通知
```go
func (s *Subject) NotifyAsync(message string) {
    for _, observer := range s.observers {
        go observer.Update(message) // 異步通知
    }
}
```

#### 3. 錯誤處理
```go
type Observer interface {
    Update(message string) error // 返回錯誤
}

func (s *Subject) Notify(message string) []error {
    var errors []error
    for _, observer := range s.observers {
        if err := observer.Update(message); err != nil {
            errors = append(errors, err)
        }
    }
    return errors
}
```

#### 4. 自動清理
```go
type WeakObserver struct {
    Observer
    weakRef *WeakReference
}

// 使用弱引用避免內存洩漏
func (s *Subject) Notify(message string) {
    var validObservers []Observer
    for _, obs := range s.observers {
        if obs.weakRef.IsAlive() {
            validObservers = append(validObservers, obs)
            obs.Update(message)
        }
    }
    s.observers = validObservers // 清理失效的觀察者
}
```

## 總結

**核心要點**：
1. **一對多依賴關係**：一個 Subject，多個 Observer
2. **自動通知更新**：狀態變化時自動通知
3. **鬆耦合設計**：Subject 不需知道 Observer 具體類型
4. **動態訂閱機制**：運行時增刪觀察者

**實踐建議**：
- 使用異步通知提高性能
- 注意內存洩漏，及時 Detach
- 考慮使用事件總線統一管理
- Go 中可利用 channel 實現

**使用場景**：
- 事件驅動系統
- UI 數據綁定
- 消息隊列
- 監控系統

**與發布-訂閱的區別**：
- 觀察者模式：Subject 直接維護 Observer 列表
- 發布-訂閱：通過消息中間件解耦，發布者和訂閱者互不知道
