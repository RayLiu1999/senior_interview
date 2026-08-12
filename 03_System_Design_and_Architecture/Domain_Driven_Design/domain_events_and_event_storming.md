# 領域事件與事件風暴 (Domain Events & Event Storming)

- **難度**: 7
- **重要程度**: 4
- **標籤**: `DDD`, `Domain Event`, `Event Storming`, `Event Driven Architecture`

## 問題詳述

領域事件 (Domain Events) 是 DDD 中解耦系統的關鍵機制。請解釋什麼是領域事件，以及如何透過事件風暴 (Event Storming) 工作坊來識別這些事件並建立領域模型。

## 核心理論與詳解

### 1. 領域事件 (Domain Events)

- **定義**: 領域專家關心的、在過去發生的、具有業務意義的事情。
- **命名**: 通常使用過去式，例如 `OrderPlaced` (訂單已下), `PaymentReceived` (付款已收), `ProductShipped` (商品已出貨)。
- **作用**:
  - **解耦**: 聚合根之間不直接調用，而是透過發布事件來觸發副作用 (Side Effects)。
  - **最終一致性**: 透過事件驅動機制，實現跨聚合或跨服務的資料同步。
  - **稽核與追蹤**: 事件本身就是業務發生的歷史記錄。

### 2. Event Storming (事件風暴)

- **定義**: 一種輕量級的、協作式的工作坊，旨在快速探索複雜的業務領域。
- **參與者**: 領域專家 (Domain Experts) + 開發人員 (Developers)。
- **流程**:
  1. **橘色便利貼 (Domain Events)**: 寫下所有發生的業務事件，按時間軸排列。
  2. **藍色便利貼 (Commands)**: 什麼動作觸發了這個事件？(如 `Place Order`)。
  3. **黃色便利貼 (Aggregates)**: 哪個實體執行了這個命令並產生了事件？(如 `Order`)。
  4. **紫色便利貼 (Policies)**: 事件發生後觸發了什麼業務規則？(如 `Whenever OrderPlaced, then SendEmail`)。

## 程式碼範例 (Go)

模擬一個簡單的領域事件發布與訂閱機制。

```go
package main

import (
    "fmt"
    "time"
)

// --- Domain Event ---
type DomainEvent interface {
    Name() string
}

type OrderPlaced struct {
    OrderID   string
    Timestamp time.Time
}

func (e OrderPlaced) Name() string { return "OrderPlaced" }

// --- Event Dispatcher (Simple Bus) ---
type EventDispatcher struct {
    handlers map[string][]func(DomainEvent)
}

func NewDispatcher() *EventDispatcher {
    return &EventDispatcher{
        handlers: make(map[string][]func(DomainEvent)),
    }
}

func (d *EventDispatcher) Subscribe(eventName string, handler func(DomainEvent)) {
    d.handlers[eventName] = append(d.handlers[eventName], handler)
}

func (d *EventDispatcher) Publish(event DomainEvent) {
    if handlers, ok := d.handlers[event.Name()]; ok {
        for _, handler := range handlers {
            handler(event)
        }
    }
}

// --- Aggregate ---
type Order struct {
    ID         string
    dispatcher *EventDispatcher
}

func (o *Order) Place() {
    fmt.Printf("Order %s placed logic executed.\n", o.ID)
    
    // 產生並發布事件
    event := OrderPlaced{OrderID: o.ID, Timestamp: time.Now()}
    o.dispatcher.Publish(event)
}

func main() {
    dispatcher := NewDispatcher()

    // 訂閱事件 (Side Effect: Send Email)
    dispatcher.Subscribe("OrderPlaced", func(e DomainEvent) {
        event := e.(OrderPlaced)
        fmt.Printf("[Email Service] Sending confirmation for Order %s\n", event.OrderID)
    })

    // 訂閱事件 (Side Effect: Update Inventory)
    dispatcher.Subscribe("OrderPlaced", func(e DomainEvent) {
        event := e.(OrderPlaced)
        fmt.Printf("[Inventory Service] Reserving items for Order %s\n", event.OrderID)
    })

    order := Order{ID: "ORD-999", dispatcher: dispatcher}
    order.Place()
}
```

## 學習與評量對應

- **Concept ID**: `concept.ddd.domain-events.event-storming`
- **Learning Objectives**:
  - `LO-1`: 能以過去式、業務意義與交易邊界定義 Domain Event，區分事件事實、命令與通知。
  - `LO-2`: 能用 Event Storming 從事件、命令、聚合與政策找出上下文邊界和遺漏的不變條件。
  - `LO-3`: 能設計 outbox、冪等、版本、重試、順序與 poison event 處理，讓事件交付可驗證。
- **Prerequisites**: DDD 聚合、交易、Pub/Sub、最終一致性與事件版本化的基本概念。
- **Quick Quiz**: [Q11](../../QUIZ/03_Distributed_Systems_and_Microservices.md#q11)
- **Hard Assessment**: [DDD／Microservice Delivery Incident](../../QUIZ/Hard_Assessments/ddd_microservice_delivery_incident.md) (`assessment.ddd-microservice.delivery-incident.v1`)
- **Assessment Gate**: 能從一個業務流程區分 command、event、policy 與 side effect，並提出至少一個可靠交付證據，再進入 Hard Assessment。
