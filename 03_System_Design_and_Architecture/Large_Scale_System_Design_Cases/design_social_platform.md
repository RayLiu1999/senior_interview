# 如何設計 Twitter / Instagram / LinkedIn 社交平台（總覽）？

- **難度**: 9
- **重要程度**: 5
- **標籤**: `System Design`, `Social Network`, `Feed`, `Ranking`, `Graph`, `Media`

## 問題詳述

本總覽作為導引：三大社交平台雖同屬社交分散式系統，但設計重點各異。此文概述共通基礎與關鍵差異，並連結到三份專題設計文件。

- Twitter 專題：見《[如何設計 Twitter 社交平台？](./design_twitter_system.md)》
- Instagram 專題：見《[如何設計 Instagram 社交平台？](./design_instagram_system.md)》
- LinkedIn 專題：見《[如何設計 LinkedIn 社交平台？](./design_linkedin_system.md)》

## 核心理論與詳解（總覽）

### 1. 共通基礎

- 社交圖：Followers/Following 或 Connections；雙向或單向關係索引。
- Feed 生成：寫擴散、讀擴散與混合；快取分層（CDN/Redis/DB）。
- 一致性：寫強一致、讀最終一致；多區域災備與事件回放。
- 反濫用：限流、信譽、內容審核、隱私與封鎖機制。

### 2. 平台差異

- Twitter：短文本即時流，明星帳號寫擴散成本高→混合策略 + 趨勢/Hashtag；輕媒體、強時序。
- Instagram：媒體為先，上傳/轉碼/分發管線與 CDN 成本主導；排序重視視覺與互動意圖；Stories/Reels 具 TTL/串流特性。
- LinkedIn：專業圖譜與搜尋/配對（職缺/候選），隱私與合規要求高；內容重質量與專業相關性。

### 3. 排序與推薦

- 召回：關係/主題/相似內容；
- 排序：多信號融合（關係強度、內容品質、行為、時效、多樣性）；
- 線上交付：可解釋與可回退，保留時序兜底。

### 4. 成本與效能重點

- Instagram 偏重存儲/帶寬（對象存儲+CDN）；
- Twitter 偏重寫擴散與快取；
- LinkedIn 偏重檢索/配對與隱私合規管控。

## 程式碼範例 (可選)

```go
// 共同的 Feed 兜底：時序合併（簡化）
func MergeByTime(a, b []Item, limit int) []Item {
    out := append(a, b...)
    sort.Slice(out, func(i, j int) bool { return out[i].Ts > out[j].Ts })
    if len(out) > limit { return out[:limit] }
    return out
}
```

## 總結

三者共享社交系統共通基礎，但在內容形態、排序信號與合規約束上大相逕庭。請按需求重點選讀各專題：Twitter（即時短文）、Instagram（媒體/串流）、LinkedIn（專業圖譜/搜尋/配對）。
