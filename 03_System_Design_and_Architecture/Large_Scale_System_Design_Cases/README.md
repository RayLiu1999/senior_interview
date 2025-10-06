# 大型系統設計案例 (Large-Scale System Design Cases)

大型系統設計是資深後端工程師面試的重點考察項目。這類問題不僅考驗技術深度，更考驗對業務需求的理解、架構權衡的判斷以及系統演進的思考。本章節收錄了一系列經典的分散式系統設計案例，涵蓋了可擴展性、可用性、一致性等核心設計考量。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [如何設計一個高併發的短網址系統？](./how_to_design_a_tiny_url_system.md) | 7 | 5 | `System Design`, `URL Shortener`, `High Concurrency` |
| 2 | [使用 Pub/Sub 建立可靠的聊天系統](./reliable_chat_system_with_pubsub.md) | 8 | 4 | `System Design`, `Chat System`, `Pub/Sub`, `Real-time` |
| 3 | [如何設計 Twitter/Instagram 社交平台？](./design_twitter_like_social_platform.md) | 9 | 5 | `System Design`, `Social Network`, `Feed`, `Fanout` |
| 4 | [如何設計秒殺系統？](./design_flash_sale_system.md) | 9 | 5 | `System Design`, `Flash Sale`, `High Concurrency`, `Inventory` |
| 5 | [如何設計新聞推送系統？](./design_news_feed_push_system.md) | 8 | 5 | `System Design`, `Push System`, `Personalization`, `Recommendation` |
| 6 | [如何設計即時排行榜系統？](./design_realtime_leaderboard_system.md) | 8 | 5 | `System Design`, `Leaderboard`, `Redis`, `Sorted Set` |
| 7 | [如何設計分散式鎖？](./design_distributed_lock.md) | 8 | 5 | `System Design`, `Distributed Lock`, `Redis`, `ZooKeeper`, `Etcd` |

---

## 學習建議

1.  **掌握設計流程**: 需求澄清 → 容量估算 → API 設計 → 資料模型 → 核心架構 → 深入探討。
2.  **理解擴展策略**: 水平擴展、垂直擴展、資料分片、快取、CDN 等是常見的擴展手段。
3.  **關注權衡取捨**: CAP 定理、一致性與可用性、讀寫性能、成本等都需要權衡。
4.  **學習經典案例**: 短網址、社交網絡、即時通訊、新聞推送等是面試的高頻案例。
5.  **實踐溝通技巧**: 系統設計面試更看重思考過程和溝通能力，而非完美答案。
