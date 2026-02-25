# Distributed Tracing Basics (分散式追蹤基礎)

- **難度**: 7
- **標籤**: `Tracing`, `Microservices`, `Jaeger`, `OpenTelemetry`, `Observability`

## 問題詳述

在微服務架構中，一個請求可能經過多個服務調用。當請求變慢或失敗時，如何快速定位是哪一個環節出了問題？請解釋分散式追蹤 (Distributed Tracing) 的核心概念 (Trace, Span, Context Propagation)。

## 核心理論與詳解

分散式追蹤解決了微服務中的「可觀測性盲區」。它通過在請求的整個生命週期中傳遞唯一的標識符，將分散在不同服務中的日誌和指標串聯起來。

### 1. 核心數據模型 (Data Model)

分散式追蹤的數據模型通常遵循 **Google Dapper** 論文或 **OpenTelemetry** 標準：

1. **Trace (追蹤)**:
    - 代表一個完整的請求路徑 (從前端發起請求到後端所有服務處理完畢)。
    - 由一個全域唯一的 `Trace ID` 標識。
    - 一個 Trace 由多個 Span 組成，形成一個樹狀結構 (DAG)。

2. **Span (跨度)**:
    - 代表 Trace 中的一個基本工作單元 (例如：調用一次資料庫、發送一次 HTTP 請求、執行一段函數)。
    - 包含：
        - `Span ID`: 唯一標識。
        - `Parent Span ID`: 父級 Span 的 ID (用於構建樹狀結構)。
        - `Start Time` & `End Time`: 用於計算耗時。
        - `Tags` / `Attributes`: 鍵值對 (如 `http.method=GET`, `db.statement=SELECT * ...`)。
        - `Logs` / `Events`: 發生在 Span 期間的事件。

3. **Context Propagation (上下文傳播)**:
    - 這是分散式追蹤的靈魂。
    - 服務 A 調用服務 B 時，必須將 `Trace ID` 和 `Span ID` 注入到請求頭 (HTTP Headers) 或元數據 (gRPC Metadata) 中。
    - 常見標準:
        - **W3C Trace Context** (標準): `traceparent: 00-<trace-id>-<span-id>-01`
        - **B3 Propagation** (Zipkin): `X-B3-TraceId`, `X-B3-SpanId`

### 2. 架構組件

一個典型的追蹤系統 (如 Jaeger, Zipkin, Tempo) 包含：

- **Instrumentation (埋點)**: 應用程式代碼中的探針 (SDK)，負責生成 Span 並注入 Context。現在主流使用 **OpenTelemetry** SDK。
- **Collector (收集器)**: 接收應用發送的 Trace 數據，進行驗證、索引和轉換。
- **Storage (儲存)**: 儲存海量的 Trace 數據 (通常使用 Elasticsearch, Cassandra 或 ClickHouse)。
- **UI (介面)**: 展示瀑布圖 (Waterfall Chart)，幫助開發者分析調用鏈路和瓶頸。

### 3. 採樣策略 (Sampling)

由於 Trace 數據量巨大，全量採集會帶來極大的儲存和網路開銷，因此通常需要採樣：

- **Head-based Sampling (頭部採樣)**: 在請求開始時決定是否採樣 (例如固定 1% 的機率)。優點是效能好，缺點是可能漏掉錯誤請求。
- **Tail-based Sampling (尾部採樣)**: 先緩存所有 Span，等請求結束後，根據結果 (是否有 Error，是否耗時過長) 決定是否保留。優點是能精準保留異常現場，缺點是需要大量記憶體緩衝。

## 程式碼範例

```go
// Go OpenTelemetry 範例：手動創建 Span 並傳遞 Context
package main

import (
    "context"
    "fmt"
    "log"
    "time"

    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/attribute"
)

func main() {
    // 假設 Tracer 已經初始化
    tracer := otel.Tracer("example-service")

    // 1. 開始一個 Root Span
    ctx, span := tracer.Start(context.Background(), "MainOperation")
    defer span.End()

    // 添加屬性
    span.SetAttributes(attribute.String("user.id", "12345"))

    // 2. 模擬調用子函數，傳遞 Context
    doSubTask(ctx)

    fmt.Println("Operation completed")
}

func doSubTask(ctx context.Context) {
    tracer := otel.Tracer("example-service")

    // 3. 從 Context 中創建 Child Span
    _, span := tracer.Start(ctx, "SubTask")
    defer span.End()

    // 模擬工作
    time.Sleep(100 * time.Millisecond)
    log.Println("Sub task done")
}
```
