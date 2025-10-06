# CDN 與邊緣快取

- **難度**: 6
- **重要程度**: 4
- **標籤**: `CDN`, `Edge Caching`, `Content Delivery`, `Cache-Control`, `Origin Server`

## 問題詳述

CDN (Content Delivery Network) 是現代 Web 應用中提升全域訊問速度的關鍵技術。請詳細解釋 CDN 的工作原理、邊緣節點的快取策略、回源機制、HTTP 快取控制頭 (Cache-Control, ETag) 的使用,以及 CDN 在實務中的應用場景和最佳實踐。

## 核心理論與詳解

CDN (內容分發網路) 是一種分散式架構,通過在全球各地部署**邊緣節點** (Edge Server),將內容快取到離使用者最近的節點,從而大幅降低延遲、減少頻寬成本、提高內容可用性。

### CDN 的核心概念

#### 1. 基本組成

```text
┌──────────┐
│  使用者   │
└────┬─────┘
     │ ① DNS 解析到最近的邊緣節點
     ▼
┌──────────┐
│ 邊緣節點  │ ← CDN Edge Server (快取層)
│ (香港)   │
└────┬─────┘
     │ ② 如果邊緣節點無快取,向源站請求
     ▼
┌──────────┐
│ 源站      │ ← Origin Server (您的伺服器)
│ (美國)   │
└──────────┘
```

**關鍵角色**:

- **使用者 (Client)**: 發起請求的終端使用者
- **邊緣節點 (Edge Server)**: CDN 在全球各地的快取伺服器
- **源站 (Origin Server)**: 您的原始應用伺服器
- **DNS 服務**: 將域名解析到最近的邊緣節點

#### 2. CDN 的工作流程

**第一次請求 (快取未命中)**:

```text
1. 使用者請求: GET https://cdn.example.com/image.jpg
2. DNS 解析: 返回最近的 CDN 節點 IP (如香港節點)
3. 請求到達邊緣節點: 快取未命中 (Cache Miss)
4. 邊緣節點回源: 向源站請求 image.jpg
5. 源站返回: image.jpg + Cache-Control 頭
6. 邊緣節點快取: 儲存 image.jpg 並設定過期時間
7. 返回給使用者: image.jpg
```

**後續請求 (快取命中)**:

```text
1. 使用者請求: GET https://cdn.example.com/image.jpg
2. DNS 解析: 返回相同的 CDN 節點 IP
3. 請求到達邊緣節點: 快取命中 (Cache Hit)
4. 直接返回: image.jpg (無需回源,延遲極低)
```

#### 3. CDN 的優勢

| 優勢 | 說明 | 量化指標 |
|------|------|---------|
| **降低延遲** | 就近訪問,減少網路跳轉 | 延遲從 200ms 降至 20ms |
| **減少頻寬成本** | 源站流量減少 70%~90% | 節省頻寬成本 60%~80% |
| **提高可用性** | 分散式架構,單點故障不影響全局 | 可用性從 99.9% 提升至 99.99% |
| **抵禦 DDoS** | 分散流量,保護源站 | 可抵禦 Gbps 級別攻擊 |
| **提升 SEO** | 頁面載入速度是 Google 排名因素 | 提升搜尋排名 |

### HTTP 快取控制機制

CDN 的快取策略主要依賴 HTTP 快取控制頭。

#### 1. Cache-Control 指令

**Cache-Control** 是 HTTP/1.1 中最重要的快取控制頭。

**常用指令**:

```http
Cache-Control: max-age=3600              # 快取 1 小時
Cache-Control: s-maxage=7200             # CDN 快取 2 小時 (優先於 max-age)
Cache-Control: public                    # 允許任何快取 (包括 CDN)
Cache-Control: private                   # 僅允許瀏覽器快取,CDN 不快取
Cache-Control: no-cache                  # 必須先驗證 (使用 ETag)
Cache-Control: no-store                  # 禁止快取
Cache-Control: must-revalidate           # 過期後必須重新驗證
```

**指令詳解**:

##### max-age

指定資源的快取時間 (秒):

```http
Cache-Control: max-age=86400   # 快取 1 天
```

- 瀏覽器和 CDN 都會遵守
- 在過期前不會向源站請求

##### s-maxage

專門針對**共享快取** (如 CDN) 的過期時間:

```http
Cache-Control: max-age=3600, s-maxage=86400
```

- 瀏覽器快取 1 小時
- CDN 快取 1 天
- s-maxage 優先於 max-age (對 CDN 而言)

##### public vs private

```http
Cache-Control: public   # 任何快取都可以儲存 (包括 CDN)
Cache-Control: private  # 僅瀏覽器可快取,CDN 不可快取
```

**使用場景**:
- `public`: 靜態資源 (圖片、CSS、JS)
- `private`: 使用者特定資料 (個人資訊、購物車)

##### no-cache vs no-store

```http
Cache-Control: no-cache   # 可以快取,但必須先驗證 (使用 ETag)
Cache-Control: no-store   # 絕對禁止快取
```

**區別**:
- `no-cache`: 快取存在,但每次使用前需驗證是否有效 (條件請求)
- `no-store`: 完全不快取,每次都重新請求

#### 2. ETag 與條件請求

**ETag** (Entity Tag) 是資源的唯一識別符,用於驗證快取是否仍然有效。

**工作流程**:

```text
首次請求:
  Client → Server: GET /image.jpg
  Server → Client: 200 OK
                    ETag: "abc123"
                    Content: <image data>
  
後續請求 (快取過期或 no-cache):
  Client → Server: GET /image.jpg
                    If-None-Match: "abc123"
  
  情況 1: 資源未變更
  Server → Client: 304 Not Modified
                    (無 body,節省頻寬)
  
  情況 2: 資源已變更
  Server → Client: 200 OK
                    ETag: "xyz789"
                    Content: <new image data>
```

**實際應用**:

```go
// Go 語言示例: 處理 ETag

func HandleImageRequest(w http.ResponseWriter, r *http.Request) {
    imagePath := "assets/image.jpg"
    
    // 1. 計算檔案的 ETag (通常使用檔案的 MD5 或修改時間)
    fileInfo, _ := os.Stat(imagePath)
    etag := fmt.Sprintf("\"%d\"", fileInfo.ModTime().Unix())
    
    // 2. 檢查客戶端的 If-None-Match 頭
    clientETag := r.Header.Get("If-None-Match")
    if clientETag == etag {
        // 資源未變更,返回 304
        w.WriteHeader(http.StatusNotModified)
        return
    }
    
    // 3. 資源已變更,返回新內容
    w.Header().Set("ETag", etag)
    w.Header().Set("Cache-Control", "public, max-age=3600")
    
    imageData, _ := os.ReadFile(imagePath)
    w.Write(imageData)
}
```

#### 3. Expires (舊版本)

**Expires** 是 HTTP/1.0 的快取控制頭,指定資源的絕對過期時間:

```http
Expires: Wed, 21 Oct 2025 07:28:00 GMT
```

**缺點**:
- 依賴客戶端時間,時間不同步會導致問題
- 已被 `Cache-Control: max-age` 取代

**優先級**: `Cache-Control` > `Expires`

### CDN 回源策略

回源 (Origin Pull) 是指 CDN 邊緣節點向源站請求資源的過程。

#### 1. 回源觸發條件

- **快取未命中**: 首次請求或快取已清除
- **快取過期**: 超過 max-age 或 s-maxage 時間
- **強制刷新**: 使用者按下 Ctrl+F5 或 CDN 手動刷新

#### 2. 回源優化策略

##### 策略一: 分層回源

```text
使用者 → 邊緣節點 (香港) → 區域節點 (亞太) → 源站 (美國)
```

- 減少源站壓力
- 提高命中率
- 適合多機房部署

##### 策略二: 預取 (Prefetch)

```text
在快取即將過期前,CDN 主動向源站請求更新
```

**優點**:
- 使用者請求時快取總是新鮮的
- 減少回源延遲

**配置範例**:

```http
Cache-Control: max-age=3600, stale-while-revalidate=600
```

- 在 3600 秒內,快取有效
- 在 3600~4200 秒,返回舊快取,同時後台更新

##### 策略三: 回源請求合併

當多個請求同時未命中快取時,CDN 只向源站發起一次請求:

```text
時間點 1: 請求 A 到達邊緣節點,快取未命中,發起回源
時間點 2: 請求 B 到達邊緣節點,檢測到正在回源,等待請求 A 的結果
時間點 3: 回源完成,請求 A 和 B 同時返回
```

**優點**: 避免源站被大量相同請求衝擊 (類似快取擊穿的解決方案)

#### 3. 回源失敗處理

**方案一: 返回舊快取**

```http
Cache-Control: max-age=3600, stale-if-error=86400
```

- 如果回源失敗,返回過期快取 (最多 1 天)
- 提高可用性

**方案二: 多源站容錯**

```text
主源站失敗 → 嘗試備用源站 → 仍失敗則返回錯誤
```

### CDN 快取策略實踐

#### 1. 靜態資源快取策略

**HTML 頁面**:

```http
Cache-Control: public, max-age=0, must-revalidate
ETag: "abc123"
```

- 總是驗證 (使用 ETag)
- 確保使用者看到最新內容
- 304 響應節省頻寬

**CSS/JS 檔案** (帶版本號):

```http
Cache-Control: public, max-age=31536000, immutable
```

- 快取 1 年 (最長時間)
- `immutable`: 告知瀏覽器資源永不變更
- 檔案名稱包含雜湊值: `app.abc123.js`

**圖片資源**:

```http
Cache-Control: public, max-age=2592000
```

- 快取 30 天
- 適合較少變更的圖片

**API 回應** (動態資料):

```http
Cache-Control: private, max-age=60
```

- 僅瀏覽器快取 1 分鐘
- CDN 不快取 (private)

#### 2. 版本控制策略

**方案一: 檔案名稱雜湊**

```html
<!-- 舊版本 -->
<script src="/js/app.abc123.js"></script>

<!-- 新版本 -->
<script src="/js/app.xyz789.js"></script>
```

**優點**:
- 新版本自動繞過快取
- 可設定極長的快取時間

**實現** (Webpack):

```javascript
// webpack.config.js
module.exports = {
  output: {
    filename: '[name].[contenthash].js',
  },
};
```

**方案二: 查詢字串版本號**

```html
<script src="/js/app.js?v=1.2.3"></script>
```

**缺點**: 部分 CDN 不快取帶查詢字串的 URL

#### 3. 動靜分離

**原則**: 靜態資源走 CDN,動態 API 走源站。

```text
靜態資源:
  https://cdn.example.com/images/logo.png
  https://cdn.example.com/css/style.css

動態 API:
  https://api.example.com/users/123
  https://api.example.com/orders
```

**優點**:
- 靜態資源命中率高,減少源站壓力
- 動態資料即時性好,不受快取影響
- 可針對不同域名設定不同的快取策略

### CDN 的實務應用場景

#### 場景一: 電商網站

**資源類型與快取策略**:

| 資源類型 | Cache-Control | 說明 |
|---------|---------------|------|
| 商品圖片 | `public, max-age=2592000` | 快取 30 天,極少變更 |
| CSS/JS | `public, max-age=31536000, immutable` | 永久快取,檔名含雜湊 |
| 商品詳情頁 | `public, max-age=300, s-maxage=600` | 瀏覽器快取 5 分鐘,CDN 快取 10 分鐘 |
| API (商品價格) | `private, max-age=60` | 僅瀏覽器快取 1 分鐘 |
| 使用者資訊 | `private, no-store` | 完全不快取 |

**效果**:
- 源站流量減少 80%~90%
- 全球使用者延遲降至 50ms 以內
- 節省頻寬成本 70%+

#### 場景二: 影片平台

**HLS 串流 (HTTP Live Streaming)**:

```text
播放清單 (playlist.m3u8):
  Cache-Control: public, max-age=10
  # 短快取時間,可快速切換清晰度

影片片段 (.ts 檔案):
  Cache-Control: public, max-age=31536000, immutable
  # 永久快取,片段永不變更
```

**優點**:
- 影片片段快取命中率極高 (> 95%)
- 用戶端可從最近的節點下載片段
- 減少源站頻寬消耗

#### 場景三: 新聞網站

**突發熱點處理**:

```text
1. 平時: 文章快取 1 小時
2. 熱點事件: CDN 自動預熱,快取時間延長至 6 小時
3. 更新文章: 手動觸發 CDN 刷新 (Purge)
```

**預熱範例** (使用 CDN API):

```go
// Go 語言示例: 觸發 CDN 預熱

func PreheatArticle(articleID int) error {
    urls := []string{
        fmt.Sprintf("https://cdn.example.com/article/%d", articleID),
        fmt.Sprintf("https://cdn.example.com/article/%d/images", articleID),
    }
    
    // 調用 CDN 廠商的預熱 API
    for _, url := range urls {
        err := cdnClient.Preheat(url)
        if err != nil {
            log.Printf("預熱失敗: %s, 錯誤: %v", url, err)
        }
    }
    
    return nil
}
```

### CDN 的監控與優化

#### 1. 關鍵監控指標

```go
type CDNMetrics struct {
    // 命中率
    HitRate       float64  // 快取命中率
    ByteHitRate   float64  // 字節命中率
    
    // 回源
    OriginRequests int64   // 回源請求數
    OriginBandwidth int64  // 回源頻寬
    
    // 延遲
    EdgeLatency    time.Duration  // 邊緣節點延遲
    OriginLatency  time.Duration  // 源站延遲
    
    // 錯誤
    StatusCode4xx  int64   // 4xx 錯誤數
    StatusCode5xx  int64   // 5xx 錯誤數
}
```

**健康指標**:
- 命中率: > 90%
- 回源流量: < 10% 總流量
- 邊緣延遲: < 50ms
- 5xx 錯誤率: < 0.1%

#### 2. 優化建議

**提高命中率**:

1. **延長快取時間**: 靜態資源設定長快取時間
2. **減少動態內容**: 將動態內容改為靜態或 SSR
3. **使用版本控制**: 檔案名稱含雜湊值,允許永久快取
4. **預熱熱點資源**: 在流量高峰前預熱

**降低回源壓力**:

1. **合併請求**: 減少小檔案數量,使用 CSS Sprite 或 SVG Sprite
2. **壓縮資源**: 啟用 Gzip 或 Brotli 壓縮
3. **分層回源**: 使用區域節點作為中間層

### 常見面試考點

#### Q1: CDN 的工作原理是什麼?

**答案**: CDN 透過在全球各地部署邊緣節點,將內容快取到離使用者最近的節點:
1. 使用者請求時,DNS 解析到最近的 CDN 節點
2. 如果邊緣節點有快取 (Cache Hit),直接返回
3. 如果無快取 (Cache Miss),向源站請求 (回源),快取後返回
4. 後續請求直接從邊緣節點獲取,無需回源

**核心優勢**: 降低延遲、減少頻寬、提高可用性

#### Q2: Cache-Control 的 max-age 和 s-maxage 有什麼區別?

**答案**:
- `max-age`: 針對所有快取 (瀏覽器 + CDN),指定快取時間
- `s-maxage`: 專門針對共享快取 (CDN、Proxy),優先於 max-age

**使用場景**: 希望瀏覽器快取時間短,CDN 快取時間長:
```http
Cache-Control: max-age=600, s-maxage=3600
# 瀏覽器快取 10 分鐘,CDN 快取 1 小時
```

#### Q3: 如何實現 CDN 快取的即時更新?

**答案**:

**方案一: 檔案名稱雜湊** (推薦)
- 檔案名稱包含內容雜湊: `app.abc123.js`
- 內容變更時檔案名稱改變,自動繞過快取

**方案二: CDN 刷新 (Purge)**
- 調用 CDN API,手動刷新指定 URL
- 適合緊急更新

**方案三: 短快取時間 + ETag**
- 設定短快取時間 (如 5 分鐘)
- 使用 ETag 驗證,未變更返回 304

#### Q4: 什麼資源適合放 CDN,什麼不適合?

**答案**:

**適合 CDN**:
- 靜態資源: 圖片、CSS、JS、字體
- 影片、音訊檔案
- 下載檔案 (安裝包、PDF)
- 靜態 HTML 頁面

**不適合 CDN**:
- 使用者特定資料 (個人資訊、購物車)
- 即時 API (需要最新資料)
- 需要認證的內容 (未登入無法訪問)
- 極低頻率訪問的資源 (快取命中率低)

#### Q5: 如何處理 CDN 快取穿透問題?

**答案**: 當大量請求同時訪問一個未快取的資源時:

**CDN 層面**:
- **請求合併**: CDN 自動合併相同的回源請求
- **預熱**: 在流量高峰前預熱熱點資源

**源站層面**:
- **分散式鎖**: 使用 Redis 鎖,只允許一個請求回源
- **快取空結果**: 如果資源不存在,快取 404 響應 (短時間)

### 總結

CDN 的核心價值在於**就近服務**和**邊緣快取**:

1. **工作原理**: DNS 解析 → 邊緣節點 → 快取命中/回源
2. **快取控制**: Cache-Control (max-age, s-maxage, public/private)
3. **驗證機制**: ETag + 條件請求 (If-None-Match)
4. **回源優化**: 分層回源、請求合併、預取
5. **最佳實踐**: 
   - 靜態資源長快取 + 檔案名稱雜湊
   - 動態內容短快取 + ETag
   - 動靜分離,各司其職

**實務建議**:
- 選擇合適的 CDN 廠商 (Cloudflare, AWS CloudFront, Akamai)
- 監控命中率和回源流量
- 針對不同資源類型設定差異化策略
- 使用版本控制避免快取更新問題
