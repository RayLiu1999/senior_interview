# Observability（可觀測性）

可觀測性是現代分散式系統和微服務架構中的核心能力，讓工程師能夠理解系統內部狀態、快速定位問題並優化效能。本章節涵蓋監控、日誌和追蹤三大支柱，以及常用的可觀測性工具和實踐。

## 問題索引

### 基礎概念

| 問題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [什麼是可觀測性三大支柱（Metrics、Logs、Traces）？](./observability_three_pillars.md) | 4 | 5 | `可觀測性`, `監控`, `日誌`, `追蹤` |
| [可觀測性與監控有什麼區別？](./observability_vs_monitoring.md) | 3 | 4 | `可觀測性`, `監控` |
| [如何設計有效的監控指標？](./effective_metrics_design.md) | 6 | 4 | `監控`, `指標設計` |
| [告警策略設計最佳實踐](./alerting_strategy.md) | 7 | 5 | `告警`, `監控`, `最佳實踐` |

### Prometheus 監控系統

| 問題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [什麼是 Prometheus？它的架構和核心概念是什麼？](./Prometheus/what_is_prometheus.md) | 5 | 5 | `Prometheus`, `監控`, `時序資料庫` |
| [Prometheus 的資料模型和指標類型](./Prometheus/prometheus_data_model.md) | 6 | 4 | `Prometheus`, `指標類型` |
| [PromQL 查詢語言基礎](./Prometheus/promql_basics.md) | 7 | 4 | `Prometheus`, `PromQL`, `查詢` |
| [Prometheus 告警規則設計](./Prometheus/prometheus_alerting_rules.md) | 7 | 5 | `Prometheus`, `告警`, `AlertManager` |
| [Prometheus 的服務發現機制](./Prometheus/prometheus_service_discovery.md) | 6 | 3 | `Prometheus`, `服務發現` |
| [Prometheus 高可用與聯邦架構](./Prometheus/prometheus_high_availability.md) | 8 | 3 | `Prometheus`, `高可用`, `聯邦` |

### Grafana 視覺化

| 問題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [什麼是 Grafana？如何使用它創建監控儀表板？](./Grafana/what_is_grafana.md) | 4 | 4 | `Grafana`, `視覺化`, `儀表板` |
| [Grafana 資料源配置與管理](./Grafana/grafana_data_sources.md) | 5 | 3 | `Grafana`, `資料源` |
| [Grafana 儀表板設計最佳實踐](./Grafana/grafana_dashboard_best_practices.md) | 6 | 4 | `Grafana`, `儀表板`, `最佳實踐` |
| [Grafana 告警配置](./Grafana/grafana_alerting.md) | 6 | 4 | `Grafana`, `告警` |

### Jaeger 分散式追蹤

| 問題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [什麼是分散式追蹤？為什麼需要它？](./Jaeger/what_is_distributed_tracing.md) | 5 | 5 | `分散式追蹤`, `APM` |
| [什麼是 Jaeger？它的架構和核心概念](./Jaeger/what_is_jaeger.md) | 6 | 4 | `Jaeger`, `分散式追蹤`, `OpenTelemetry` |
| [Span、Trace 和 Context Propagation](./Jaeger/span_trace_context.md) | 7 | 5 | `Jaeger`, `Span`, `Trace` |
| [如何在應用中集成 Jaeger？](./Jaeger/jaeger_integration.md) | 6 | 4 | `Jaeger`, `集成`, `實踐` |
| [分散式追蹤的效能影響與取樣策略](./Jaeger/tracing_performance_sampling.md) | 7 | 4 | `分散式追蹤`, `效能`, `取樣` |

### 日誌系統

| 問題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [集中式日誌系統的架構設計](./centralized_logging_architecture.md) | 6 | 5 | `日誌`, `架構設計` |
| [ELK Stack（Elasticsearch、Logstash、Kibana）概述](./elk_stack_overview.md) | 5 | 4 | `ELK`, `日誌`, `Elasticsearch` |
| [結構化日誌 vs 非結構化日誌](./structured_vs_unstructured_logs.md) | 4 | 4 | `日誌`, `結構化` |
| [日誌等級與最佳實踐](./log_levels_best_practices.md) | 3 | 4 | `日誌`, `最佳實踐` |
| [日誌聚合與分析策略](./log_aggregation_analysis.md) | 6 | 4 | `日誌`, `聚合`, `分析` |

### 整合實踐

| 問題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [如何建立完整的可觀測性體系？](./building_observability_system.md) | 8 | 5 | `可觀測性`, `系統設計`, `最佳實踐` |
| [OpenTelemetry 統一可觀測性標準](./opentelemetry_overview.md) | 7 | 4 | `OpenTelemetry`, `標準`, `可觀測性` |
| [SLI、SLO、SLA 與錯誤預算](./sli_slo_sla.md) | 7 | 5 | `SLI`, `SLO`, `SLA`, `可靠性` |
| [On-Call 與事件響應流程](./oncall_incident_response.md) | 6 | 4 | `On-Call`, `事件響應`, `運維` |

## 學習路徑建議

### 初學者路徑（1-2 週）
1. 先理解可觀測性三大支柱的概念
2. 學習基礎的監控指標設計
3. 掌握日誌等級與最佳實踐
4. 了解 Prometheus 和 Grafana 的基本用法

### 進階路徑（2-4 週）
1. 深入學習 PromQL 查詢語言
2. 掌握分散式追蹤的原理和實踐
3. 學習告警策略設計
4. 理解 SLI/SLO/SLA 的實際應用

### 專家路徑（1-2 個月）
1. 設計企業級可觀測性架構
2. 掌握 Prometheus 高可用部署
3. 實踐 OpenTelemetry 集成
4. 建立完整的事件響應流程

## 相關資源

### 官方文件
- [Prometheus 官方文件](https://prometheus.io/docs/)
- [Grafana 官方文件](https://grafana.com/docs/)
- [Jaeger 官方文件](https://www.jaegertracing.io/docs/)
- [OpenTelemetry 官方網站](https://opentelemetry.io/)

### 推薦書籍
- 《Distributed Systems Observability》by Cindy Sridharan
- 《Site Reliability Engineering》by Google
- 《Observability Engineering》by Charity Majors et al.

### 實踐工具
- Prometheus + Grafana（監控與視覺化）
- Jaeger（分散式追蹤）
- ELK/EFK Stack（日誌聚合）
- OpenTelemetry（統一標準）

## 面試重點

可觀測性相關問題在資深後端面試中非常常見，特別是：

1. **監控設計**：如何為微服務設計有效的監控指標？
2. **問題定位**：如何快速定位生產環境問題？
3. **告警策略**：如何避免告警疲勞？
4. **效能優化**：如何使用可觀測性工具進行效能分析？
5. **系統設計**：在系統設計題中如何考慮可觀測性？

建議在準備面試時，結合實際專案經驗，能夠說明：
- 你如何設計和實現監控系統
- 遇到過什麼生產環境問題，如何通過可觀測性工具定位和解決
- 對不同可觀測性工具的理解和選型考量
