# Database Migration Strategies (資料庫遷移策略)

- **難度**: 8
- **標籤**: `Database`, `Migration`, `System Design`, `High Availability`

## 問題詳述

如何將數 TB 的資料從一個資料庫遷移到另一個 (例如 MySQL -> PostgreSQL，或單庫 -> 分庫分表)，且不中斷服務 (Zero Downtime)？什麼是雙寫策略 (Dual Write)？

## 核心理論與詳解

資料庫遷移是高風險操作，必須謹慎規劃。

### 1. 遷移類型

- **停機遷移 (Offline Migration)**:
  - 流程: 停止服務 -> 匯出資料 -> 匯入新庫 -> 修改配置指向新庫 -> 啟動服務。
  - 優點: 簡單、資料一致性容易保證。
  - 缺點: 業務中斷時間長 (Downtime)，不適合核心業務。
- **線上遷移 (Online Migration)**:
  - 流程: 服務不中斷，平滑切換。
  - 優點: 用戶無感知。
  - 缺點: 複雜度高，需處理並發寫入和資料一致性。

### 2. 雙寫策略 (Dual Write Strategy)

這是實現線上遷移的標準模式。

#### 階段一：雙寫 (Dual Write)

1. 修改應用程式代碼，同時寫入舊庫 (Old DB) 和新庫 (New DB)。
2. **以舊庫為主**: 讀取舊庫，寫入時若新庫失敗則忽略 (Log error)，不影響主流程。
3. 此時新庫資料是不完整的。

#### 階段二：歷史資料遷移 (Backfill)

1. 啟動一個背景程式，將舊庫中的歷史資料遷移到新庫。
2. 如果新庫已有該筆資料 (由雙寫產生)，則以時間戳較新者為準，或跳過。

#### 階段三：資料校驗 (Verification)

1. 抽樣或全量比對兩邊資料的一致性。
2. 修復不一致的資料。

#### 階段四：切換讀取 (Switch Read)

1. 當資料完全一致後，修改配置，將讀取流量切換到新庫。
2. 此時仍保持雙寫 (以防新庫有問題需回滾)。

#### 階段五：切換寫入 (Switch Write)

1. 將寫入邏輯改為「以新庫為主」。
2. 停止對舊庫的寫入 (或保留雙寫一段時間作為備份)。
3. 遷移完成，下線舊庫。

### 3. CDC (Change Data Capture)

利用資料庫的變更日誌 (如 MySQL Binlog) 來同步資料，而不是修改應用程式代碼進行雙寫。

- **工具**: Debezium, Canal, DTS (Data Transmission Service)。
- **流程**:
  1. 全量同步歷史資料。
  2. 實時監聽 Binlog，將增量變更同步到新庫。
  3. 當追趕到接近實時 (Lag 趨近於 0) 時，短暫停寫或直接切換。

### 4. 常見挑戰

- **主鍵衝突**: 確保新舊庫的主鍵生成策略一致。
- **資料延遲**: 雙寫或 CDC 都會有微小延遲，需處理讀寫一致性。
- **回滾方案**: 必須隨時準備好切回舊庫的方案 (Reverse Sync)。

## 程式碼範例

(概念性虛擬碼)

```go
func CreateUser(user *User) error {
    // 1. 寫入舊庫 (Source of Truth)
    if err := oldDB.Create(user); err != nil {
        return err
    }
    
    // 2. 非同步或同步寫入新庫 (Best Effort)
    go func() {
        if err := newDB.Create(user); err != nil {
            log.Printf("Failed to write to new DB: %v", err)
            // 記錄到重試隊列
        }
    }()
    
    return nil
}
```
