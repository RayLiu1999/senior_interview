# 如何設計 Instagram 社交平台？

- **難度**: 9
- **重要程度**: 5
- **標籤**: `System Design`, `Social Network`, `Media Pipeline`, `CDN`, `Stories`, `Ranking`

## 問題詳述

設計 Instagram 類平台，核心在於媒體（圖片/影片）上傳與分發、以關係與興趣為主的個人化 Feed、短暫內容（Stories/Reels）、探索（Explore）。需同時滿足高併發上傳、低延遲觀看與大規模儲存。

## 核心理論與詳解

### 1. 需求澄清與界定

- 功能：上傳圖片/短影片、濾鏡/標籤、Feed、Stories（24 小時消失）、Reels、Explore 推薦、追蹤/按讚/留言/收藏、通知。
- 約束：上傳 P95 < 1s（含簽名與回應）、Feed P95 < 200ms、全球覆蓋、海量媒體儲存、DRM/版權投訴、未成年人安全。

### 2. 媒體上傳與處理管線

- 簽名直傳：客戶端向後端請求簽名 URL（STS），直傳到對象儲存（S3/GCS）；上傳完成回調後端。
- 轉碼與衍生：
  - 圖片：多尺寸（thumbnail、small、medium、large）、漸進式 JPEG/WebP/AVIF；
  - 影片：多碼率/分辨率 HLS/DASH、自動封面、關鍵幀抽取；
  - Metadata 抽取（EXIF、時地標籤）。
- 任務編排：事件驅動（Kafka）+ 轉碼集群（FFmpeg workers），失敗重試與死信隊列。

### 3. 儲存與分發

- 熱/冷分層：最新與高熱內容使用高頻存儲層，歸檔進冷存（Glacier 等）。
- Metadata vs Blob：元資料（Post、User、Graph）在 MySQL/Cassandra，媒體 Blob 在對象儲存。
- CDN：多域名、就近加速、Range Request、斷點續傳；上傳區域回源、下載區域分發。

### 4. 資料模型與社交圖

- Post：`post_id`、`author_id`、`caption`、`media_refs[]`、`created_at`、`visibility`、`tags[]`。
- User：設定、隱私、封鎖、關係統計。
- Follow Graph：`followers:{uid}` / `following:{uid}`；私密帳號請求/同意流。
- Interaction：讚/留言/收藏計數分離；明細歸檔；熱點計數用 Redis。

### 5. Feed 生成與排序

- 策略：與 Twitter 類似採混合（普通帳號寫擴散、明星讀擴散），但排序更強調視覺內容與互動意圖。
- 信號：
  - 關係：互相關注、近互動、親密度；
  - 內容：媒體品質（清晰度/臉部/構圖）、主題/標籤、文本相似；
  - 行為：停留時長、展開、觀看完成率（影片）、分享/收藏；
  - 新鮮度與多樣性（去重、作者/主題分散）。
- 冷啟：以內容-內容近鄰與用戶相似群啟動；保守探索比例。

### 6. Stories/Reels（短暫與短影音）

- TTL 與過期：寫入同時記錄到期時間；索引與快取 TTL；過期清理異步與掃描。
- 觀看序：親密度優先 + 新鮮度；影片以 HLS 自適應碼率串流。
- 版權/音樂：素材版權白名單、hash 匹配（音訊指紋）。

### 7. 內容審核與安全

- 多層審核：上傳端輕量檢測（敏感圖樣）、服務端 ML 模型（裸露、暴力、仇恨）、人工複審；
- 未成年人：年齡分級、地理法規（COPPA/GDPR-K）；
- 濫用：機器人偵測、互動速率限制、假互動辨識。

### 8. 搜尋與 Explore 推薦

- 檢索：ES/向量索引（語義圖像/影片 embedding）；
- 推薦：
  - 近鄰檢索（ANN）找相似內容；
  - 排序模型融合行為信號（觀看完成率/收藏/分享）；
  - 多樣性與新鮮度約束；
  - 交付層做重排（re-ranking）與去重。

### 9. 可用性與一致性

- 多區域部署：媒體就近上傳與分發；控平面與數據平面解耦。
- 一致性：發佈強一致；Feed/Explore 最終一致；轉碼任務至少一次處理，冪等寫入。
- 災備：跨區複寫、回放事件（Kafka）重建索引。

### 10. 成本與效能

- 成本：對象存儲與 CDN 佔比最高；透過智慧快取、熱-冷分層、壓縮/新格式（AVIF/HEVC）降成本。
- 效能：圖片漸進式/占位符、影片自適應碼率；批次/管線化；計算資源彈性伸縮。

### 11. 可觀測性

- 指標：上傳成功率與延遲、轉碼耗時、CDN 命中率、Feed P95、Explore CTR/完播率。
- 追蹤：上傳→轉碼→分發→呈現全鏈路 Trace；
- 日誌：取樣與隱私遮罩。

## 程式碼範例 (可選)

```go
// 產生簽名直傳 URL（簡化示意）
func GetSignedUploadURL(userID int64, objectKey string, ttl time.Duration) (string, error) {
    // 省略簽名步驟，返回臨時可寫 URL，供客戶端直傳
    return signPUT(objectKey, ttl)
}
```

## 總結

Instagram 的難點在「媒體為先」：穩定高效的上傳/轉碼/分發管線、強化的個人化排序與探索、Stories 的 TTL 管理與短影音串流優化，外加嚴格的內容安全與全球可用性。
