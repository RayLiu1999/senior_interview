# 什麼是 Grafana？如何使用它創建監控儀表板？

- **難度**: 4
- **重要程度**: 4
- **標籤**: `Grafana`, `視覺化`, `儀表板`, `監控`

## 問題詳述

Grafana 是業界最流行的開源監控視覺化平台，能夠將各種資料源的指標以美觀、易懂的方式呈現。理解 Grafana 的核心功能和使用方式，是建立現代監控系統的重要一環。

## 核心理論與詳解

### Grafana 簡介

**Grafana** 是一個開源的多平台視覺化和分析工具，允許你查詢、視覺化、告警和理解你的指標資料，無論資料儲存在哪裡。

#### 核心特性

1. **多資料源支援**：可連接多種資料來源（Prometheus、Elasticsearch、MySQL、PostgreSQL 等）
2. **豐富的視覺化**：支援多種圖表類型（折線圖、柱狀圖、熱力圖、儀表板等）
3. **靈活的儀表板**：可自由組合和配置面板
4. **變數和模板**：動態儀表板，支援下拉選單切換
5. **告警整合**：支援多種通知管道
6. **分享和協作**：可分享儀表板和快照
7. **外掛生態**：豐富的社群外掛

---

### Grafana 架構

Grafana 的架構相對簡單：

```
┌──────────────┐
│   Browser    │  (使用者界面)
└───────┬──────┘
        │ HTTP/WebSocket
        ▼
┌──────────────────┐
│  Grafana Server  │
│  ┌────────────┐  │
│  │   Web UI   │  │  (前端界面)
│  └────────────┘  │
│  ┌────────────┐  │
│  │   Backend  │  │  (後端 API)
│  └────────────┘  │
│  ┌────────────┐  │
│  │  Database  │  │  (SQLite/MySQL/PostgreSQL)
│  └────────────┘  │
└───────┬──────────┘
        │
        ├─────► Prometheus (資料源)
        ├─────► Elasticsearch (資料源)
        ├─────► MySQL (資料源)
        └─────► ... (其他資料源)
```

#### 核心組件

##### 1. Grafana Server

**職責**：
- 提供 Web UI
- 處理 API 請求
- 管理儀表板和使用者
- 執行告警規則
- 與資料源通訊

**儲存**：
- 儲存儀表板、使用者、組織等資訊
- 支援 SQLite（預設）、MySQL、PostgreSQL

##### 2. Data Sources（資料源）

Grafana 支援多種資料源：

**時序資料庫**：
- Prometheus（最常用）
- InfluxDB
- Graphite
- OpenTSDB

**日誌系統**：
- Elasticsearch
- Loki

**關聯式資料庫**：
- MySQL
- PostgreSQL
- Microsoft SQL Server

**雲端服務**：
- AWS CloudWatch
- Google Cloud Monitoring
- Azure Monitor

**其他**：
- Jaeger（追蹤）
- JSON API
- CSV

##### 3. Dashboards（儀表板）

儀表板是 Grafana 的核心概念，由多個 **Panel（面板）** 組成：

```
┌─────────────────────────────────────────┐
│           Dashboard Title               │
├─────────────────┬───────────────────────┤
│   Panel 1       │   Panel 2             │
│   (Line Chart)  │   (Bar Chart)         │
├─────────────────┼───────────────────────┤
│   Panel 3                               │
│   (Heatmap)                             │
├─────────────────────────────────────────┤
│   Panel 4       │   Panel 5             │
│   (Gauge)       │   (Stat)              │
└─────────────────┴───────────────────────┘
```

---

### 儀表板的關鍵概念

#### 1. Panel（面板）

面板是儀表板的基本單位，每個面板可以：
- 顯示一個或多個查詢的結果
- 使用不同的視覺化類型
- 配置顏色、閾值、單位等

**常用面板類型**：

##### Time Series（時序圖）
- 最常用的圖表類型
- 顯示隨時間變化的資料
- 適合：CPU 使用率、請求量、延遲等

##### Stat（統計值）
- 顯示單一數值
- 適合：當前 QPS、錯誤率、線上用戶數

##### Gauge（儀表盤）
- 以儀表盤形式顯示數值
- 適合：CPU 使用率、記憶體使用率

##### Bar Chart（柱狀圖）
- 比較不同項目
- 適合：各服務的請求量對比

##### Heatmap（熱力圖）
- 顯示值的分布
- 適合：延遲分布、直方圖資料

##### Table（表格）
- 以表格形式顯示資料
- 適合：日誌、事件列表

##### Logs（日誌）
- 專門用於顯示日誌資料
- 支援 Loki、Elasticsearch

#### 2. Query（查詢）

每個面板可以包含多個查詢，從資料源獲取資料。

**Prometheus 查詢範例**：
```promql
# CPU 使用率
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# HTTP 請求速率
rate(http_requests_total[5m])

# P95 延遲
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

**支援的查詢編輯器特性**：
- 語法高亮
- 自動補全
- 變數替換
- 查詢檢查器（Inspector）

#### 3. Variables（變數）

變數讓儀表板變得動態和可重用。

**變數類型**：

##### Query Variable（查詢變數）
從資料源查詢值列表：
```
# 從 Prometheus 查詢所有實例
label_values(up, instance)
```

##### Custom Variable（自定義變數）
手動定義值列表：
```
production, staging, development
```

##### Constant Variable（常數變數）
儲存固定值：
```
namespace = "production"
```

##### Interval Variable（間隔變數）
自動調整時間間隔：
```
auto, 1m, 5m, 10m, 30m, 1h
```

**使用變數**：
在查詢中使用 `$variable_name` 引用變數：
```promql
rate(http_requests_total{instance="$instance"}[5m])
```

在儀表板頂部顯示下拉選單，允許使用者切換：
```
┌────────────────────────────────────┐
│ Instance: [dropdown: server-1 ▼]  │
│ Env:      [dropdown: prod ▼]      │
└────────────────────────────────────┘
```

#### 4. Time Range（時間範圍）

Grafana 提供靈活的時間範圍選擇：

**預設選項**：
- Last 5 minutes
- Last 15 minutes
- Last 30 minutes
- Last 1 hour
- Last 6 hours
- Last 12 hours
- Last 24 hours
- Last 7 days
- Last 30 days

**自動刷新**：
- 5s, 10s, 30s, 1m, 5m, 15m, 30m, 1h, 2h, 1d

**自定義範圍**：
- Absolute：指定開始和結束時間
- Relative：相對於當前時間（如 `now-1h`）

#### 5. Annotations（註釋）

註釋在圖表上標記特定事件：

**使用場景**：
- 標記部署時間
- 標記配置變更
- 標記告警觸發
- 標記維護窗口

**範例**：
```
┌────────────────────────────────────┐
│                                    │
│   ┌───┐  ┌───┐         ┌───┐     │
│   │   │  │   │         │   │     │
│───┘   └──┘   └─────────┘   └─────│
│      │             │              │
│    Deploy       Deploy             │
│    v1.2         v1.3              │
└────────────────────────────────────┘
```

---

### 創建儀表板的步驟

#### 步驟 1：連接資料源

1. 進入 Configuration → Data Sources
2. 點擊 "Add data source"
3. 選擇資料源類型（如 Prometheus）
4. 配置連接資訊：
   ```
   Name: Prometheus
   URL: http://prometheus:9090
   Access: Server (預設)
   ```
5. 點擊 "Save & Test" 驗證連接

#### 步驟 2：創建新儀表板

1. 點擊 "+" → "Dashboard"
2. 點擊 "Add new panel"

#### 步驟 3：配置面板

##### 3.1 選擇資料源和編寫查詢

在 Query 標籤中：
```promql
# 範例：CPU 使用率
100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

##### 3.2 選擇視覺化類型

在右側選擇面板類型：
- Time series
- Stat
- Gauge
- Bar chart
- Heatmap
- ...

##### 3.3 配置面板選項

**Panel options**：
- Title：面板標題
- Description：描述（顯示在資訊圖標中）
- Transparent background：透明背景

**標準選項（Standard options）**：
- Unit：單位（如 percent, bytes, seconds）
- Min/Max：Y 軸範圍
- Decimals：小數位數
- Display name：圖例名稱

**閾值（Thresholds）**：
設置顏色變化的閾值：
```
Green:  0-70%
Yellow: 70-90%
Red:    90-100%
```

**值映射（Value mappings）**：
將特定值映射為文字：
```
0 → "Down"
1 → "Up"
```

#### 步驟 4：排列和組織面板

- **拖曳調整**：直接拖曳面板調整位置和大小
- **行（Rows）**：將相關面板分組
- **複製面板**：快速創建相似面板

#### 步驟 5：添加變數

1. 進入 Dashboard settings → Variables
2. 點擊 "Add variable"
3. 配置變數：
   ```
   Name: instance
   Type: Query
   Data source: Prometheus
   Query: label_values(up, instance)
   ```

#### 步驟 6：儲存儀表板

1. 點擊頂部的儲存圖標
2. 輸入儀表板名稱
3. 選擇資料夾（可選）
4. 點擊 "Save"

---

### 儀表板設計最佳實踐

#### 1. 層級化設計

**概覽層**（Overview）：
- 高層級指標（整體健康狀態）
- 使用 Stat 和 Gauge 顯示關鍵指標
- RED 方法：Rate（速率）、Errors（錯誤）、Duration（延遲）

**詳細層**（Details）：
- 更細緻的時序圖
- 按服務、實例分組的指標
- 錯誤詳情、日誌

**範例結構**：
```
Dashboard: System Overview
├─ Row 1: Key Metrics (Stat panels)
│   ├─ Total QPS
│   ├─ Error Rate
│   └─ P95 Latency
├─ Row 2: Traffic (Time series)
│   ├─ Requests per Second
│   └─ Requests by Status Code
├─ Row 3: Latency (Time series)
│   ├─ Latency Distribution
│   └─ Latency by Service
└─ Row 4: Resources (Time series)
    ├─ CPU Usage
    ├─ Memory Usage
    └─ Disk I/O
```

#### 2. 使用一致的顏色

- **綠色**：正常、健康、成功
- **黃色**：警告、接近閾值
- **紅色**：錯誤、超過閾值、嚴重問題
- **藍色**：資訊、中性資料

#### 3. 選擇合適的單位

Grafana 支援豐富的單位：
- **資料**：bytes, kilobytes, megabytes
- **時間**：milliseconds, seconds, minutes
- **百分比**：percent (0-100), percentunit (0.0-1.0)
- **速率**：ops/sec, reads/sec, writes/sec
- **貨幣**：USD, EUR, CNY

#### 4. 設置合理的刷新間隔

- **即時監控**：5s-10s
- **一般監控**：30s-1m
- **長期趨勢**：5m-15m
- **歷史分析**：關閉自動刷新

#### 5. 使用行和分組

將相關面板分組到行中：
```
Row: API Performance (collapsed)
├─ Panel: QPS
├─ Panel: Error Rate
└─ Panel: Latency

Row: Database (collapsed)
├─ Panel: Connections
├─ Panel: Queries per Second
└─ Panel: Slow Queries
```

#### 6. 添加文件和描述

- 在儀表板描述中說明用途
- 在面板描述中解釋指標含義
- 使用 Text 面板添加說明文件

---

### 告警配置

Grafana 支援基於查詢的告警（Unified Alerting）：

#### 創建告警規則

1. 在面板中點擊 "Alert" 標籤
2. 點擊 "Create alert rule"
3. 配置告警條件：
   ```
   WHEN avg() OF query(A, 5m, now) IS ABOVE 80
   ```
4. 配置通知：
   - Email
   - Slack
   - PagerDuty
   - Webhook

#### 告警狀態

- **Normal**：正常
- **Pending**：條件滿足但等待期未到
- **Alerting**：告警觸發
- **No Data**：無資料

---

### 常見使用模式

#### 1. RED 方法（適用於請求驅動的服務）

- **Rate**：請求速率（QPS）
- **Errors**：錯誤率
- **Duration**：請求延遲

```promql
# Rate
sum(rate(http_requests_total[5m]))

# Errors
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100

# Duration
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

#### 2. USE 方法（適用於資源）

- **Utilization**：使用率
- **Saturation**：飽和度
- **Errors**：錯誤

```promql
# CPU Utilization
100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory Saturation
node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes < 0.1

# Disk Errors
rate(node_disk_io_errors_total[5m])
```

#### 3. 黃金信號（Google SRE）

- **Latency**：延遲
- **Traffic**：流量
- **Errors**：錯誤
- **Saturation**：飽和度

---

### 進階功能

#### 1. Templating（模板化）

使用變數創建可重用的儀表板：
```
┌─────────────────────────────────────┐
│ Service: [dropdown: api ▼]         │
│ Instance: [dropdown: all ▼]        │
│ Environment: [dropdown: prod ▼]    │
└─────────────────────────────────────┘

Query: rate(http_requests_total{service="$service", instance=~"$instance", env="$environment"}[5m])
```

#### 2. Playlist（播放列表）

自動輪播多個儀表板：
- 適合大螢幕監控牆
- 配置每個儀表板的停留時間
- 循環播放

#### 3. Reporting（報告）

定期生成 PDF 報告並發送：
- 需要 Grafana Enterprise 或外掛
- 可排程自動生成
- 支援 Email 發送

#### 4. Alerting（告警）

Unified Alerting 支援：
- 多資料源告警
- 複雜的告警規則
- 告警分組和靜默
- 多通知管道

---

### 常見面試問題

#### Q1：Grafana 和 Prometheus 的關係是什麼？

**回答要點**：
- Grafana 是視覺化工具，Prometheus 是監控系統
- Grafana 可以連接 Prometheus 作為資料源
- Prometheus 有內建的簡單 UI，但生產環境通常使用 Grafana
- Grafana 支援多個 Prometheus 實例和其他資料源

#### Q2：如何設計一個好的監控儀表板？

**回答要點**：
- 遵循 RED 或 USE 方法
- 層級化設計（概覽 → 詳細）
- 使用一致的顏色和單位
- 添加變數提高可重用性
- 設置合理的閾值和告警

#### Q3：Grafana 的告警和 Prometheus Alertmanager 有什麼區別？

**回答要點**：
- Prometheus Alertmanager 是 Prometheus 生態的告警管理器
- Grafana Unified Alerting 可以跨多個資料源設置告警
- 可以同時使用兩者，但要注意避免重複告警
- Grafana 告警適合需要跨多個資料源的場景

---

## 總結

Grafana 是現代監控視覺化的核心工具，其優勢包括：

1. **易用性**：直觀的 UI，易於創建和編輯儀表板
2. **靈活性**：支援多種資料源和視覺化類型
3. **可重用性**：通過變數和模板創建動態儀表板
4. **豐富的生態**：大量社群儀表板和外掛

在實際使用中，好的儀表板設計應該：
- 突出最重要的指標
- 提供從概覽到詳細的層級化視圖
- 使用一致的顏色和單位
- 配合告警快速發現和定位問題

掌握 Grafana 的使用，是建立有效監控系統的關鍵技能。
