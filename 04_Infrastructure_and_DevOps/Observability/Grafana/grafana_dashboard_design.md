# Grafana Dashboard Design (Grafana 儀表板設計)

- **難度**: 5
- **標籤**: `Grafana`, `Visualization`, `Dashboard`, `UX`

## 問題詳述

一個好的儀表板 (Dashboard) 應該能讓人在 5 秒內判斷系統是否健康。請分享設計高效 Grafana 儀表板的最佳實踐，以及如何避免「儀表板過載 (Dashboard Overload)」。

## 核心理論與詳解

儀表板是可觀測性數據的「臉面」。設計不良的儀表板會導致資訊過載，讓運維人員在故障時手忙腳亂。

### 1. 設計原則

#### 自頂向下 (Top-Down) 的結構

一個優秀的儀表板應該像一個倒金字塔：

1. **Level 1: 全局健康狀態 (Global Health)**
    - 位於頂部，使用 **Stat Panel** 或 **Gauge**。
    - 只展示最核心的 KPI：總 QPS、整體錯誤率、核心服務可用性。
    - 目標：一眼看出系統是「紅」還是「綠」。
2. **Level 2: 關鍵服務指標 (Key Service Metrics)**
    - 位於中部，使用 **Graph Panel**。
    - 展示 RED 指標 (Rate, Errors, Duration) 的趨勢圖。
    - 目標：如果系統紅了，這裡是哪裡紅了？
3. **Level 3: 詳細診斷數據 (Detailed Diagnostics)**
    - 位於底部，通常折疊起來 (Row collapsed)。
    - 展示 CPU/Memory/Disk 細節、GC 暫停時間、連線池狀態等。
    - 目標：深入排查具體原因。

#### 變量 (Variables) 的使用

善用 Grafana 的變量功能，讓一個儀表板適用於所有環境和服務。

- `$env`: 切換 Production / Staging。
- `$region`: 切換 AWS Region。
- `$cluster`: 切換 Kubernetes Cluster。
- `$pod`: 選擇特定的 Pod 進行下鑽 (Drill-down)。

### 2. 常見反模式 (Anti-Patterns)

- **❌ 資訊密度過低**: 一個螢幕只放 2 個大圖，需要瘋狂滾動。
- **❌ 資訊密度過高**: 一個螢幕塞了 50 個小圖，密密麻麻看不清。
- **❌ 缺乏上下文**: 圖表沒有單位 (Unit)，沒有閾值線 (Thresholds)，不知道 100ms 是快還是慢。
- **❌ 濫用餅圖 (Pie Charts)**: 餅圖在比較數值大小時效果很差，盡量用 Bar Gauge 或 Table。

### 3. 實用技巧

- **使用 Annotations**: 在圖表上自動標記「部署事件」或「告警事件」，這樣看到流量跌了，馬上就能知道是不是剛發布了新版。
- **統一配色**: 錯誤類指標統一用紅色，成功類用綠色，警告用黃色。
- **Links (鏈接)**: 在 Panel 上配置 Data Links，點擊錯誤日誌的柱狀圖，直接跳轉到 Kibana/Loki 查詢對應時間段的日誌。

## 程式碼範例

(無程式碼，僅為設計原則)
