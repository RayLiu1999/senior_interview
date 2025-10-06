# Serverless 架構設計與應用

- **難度**: 7
- **重要程度**: 4
- **標籤**: `Serverless`, `Lambda`, `FaaS`, `雲端架構`

## 問題詳述

Serverless 架構是雲端運算的重要演進，讓開發者專注於業務邏輯而無需管理伺服器。理解 Serverless 的核心概念、適用場景和設計模式，是現代後端工程師的重要技能。

## 核心理論與詳解

### Serverless 的定義

**Serverless** 不是真的沒有伺服器，而是**開發者不需要管理伺服器**。

#### 核心特性

```
1. 無伺服器管理
   - 無需配置和維護伺服器
   - 雲端服務商管理所有基礎設施

2. 自動擴展
   - 根據負載自動擴展
   - 0 到數千個並發

3. 按使用付費
   - 只為實際執行時間付費
   - 閒置時不收費

4. 事件驅動
   - 由事件觸發執行
   - 支援多種事件源
```

### Serverless 的類型

#### 1. FaaS（Function as a Service）

```
代表：AWS Lambda, Google Cloud Functions, Azure Functions

特性：
- 執行單一函數
- 短期執行（通常 <15 分鐘）
- 完全無狀態
- 事件驅動

範例觸發源：
- API Gateway（HTTP 請求）
- S3（檔案上傳）
- DynamoDB（資料變更）
- SQS/SNS（訊息）
- CloudWatch Events（定時任務）
```

#### 2. BaaS（Backend as a Service）

```
代表：Firebase, AWS Amplify, Supabase

特性：
- 提供後端服務（資料庫、認證、儲存）
- 客戶端直接調用
- 減少後端代碼
```

### Lambda 函數範例

```javascript
// AWS Lambda 函數結構
exports.handler = async (event, context) => {
  // event: 觸發事件的資料
  // context: 執行環境資訊
  
  console.log('Event:', JSON.stringify(event));
  
  try {
    // 業務邏輯
    const result = await processEvent(event);
    
    // 返回響應
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

### Serverless 架構模式

#### 模式 1：API 後端

```
架構：
Client → API Gateway → Lambda → DynamoDB

優勢：
- 自動擴展
- 按請求付費
- 無伺服器管理

成本估算：
100萬個請求/月
平均執行時間：200ms
記憶體：512 MB

成本：~$5-10/月（相比 EC2 的 $20-50/月）
```

#### 模式 2：資料處理流水線

```
架構：
S3 (上傳) → Lambda (處理) → S3 (輸出)
                ↓
          DynamoDB (元資料)

使用場景：
- 圖片/影片處理
- 日誌分析
- 資料轉換
```

#### 模式 3：Event-Driven 微服務

```
架構：
Service A → EventBridge → Lambda Function → Service B
                              ↓
                          DynamoDB

優勢：
- 鬆耦合
- 獨立擴展
- 易於維護
```

### Serverless 的優缺點

#### 優勢

```
✅ 成本效益
- 按使用付費，閒置時不收費
- 無需預留容量
- 節省 30-70% 成本（相比持續運行的伺服器）

✅ 自動擴展
- 0 到數千個並發
- 無需配置 Auto Scaling
- 應對突發流量

✅ 降低運維負擔
- 無需管理伺服器
- 自動修補和更新
- 專注於業務邏輯

✅ 快速開發
- 快速部署
- 易於迭代
- 縮短上市時間
```

#### 劣勢

```
❌ 冷啟動延遲
- 首次調用需要初始化（100ms-2s）
- 影響用戶體驗
- 解決方案：Provisioned Concurrency

❌ 執行時間限制
- AWS Lambda: 最長 15 分鐘
- 不適合長期運行的任務

❌ 狀態管理複雜
- 完全無狀態
- 需要使用外部儲存

❌ 除錯困難
- 本地測試困難
- 分散式追蹤複雜
- 需要特殊工具

❌ 供應商鎖定
- 與雲端服務商緊密綁定
- 遷移成本高
```

### 冷啟動優化

```
問題：
首次調用或閒置後的調用需要初始化執行環境

優化策略：

1. 選擇啟動快的語言
   Node.js/Python: 100-300ms
   Java/.NET: 500ms-2s ❌

2. 減小部署包大小
   - 只包含必要的依賴
   - 使用 webpack/esbuild 打包
   - 使用 Lambda Layers

3. 優化初始化代碼
   // ❌ 每次執行都初始化
   exports.handler = async (event) => {
     const db = new Database();
     await db.connect();
     // ...
   };
   
   // ✅ 初始化一次，重用連接
   const db = new Database();
   await db.connect();
   
   exports.handler = async (event) => {
     // 重用 db 連接
   };

4. Provisioned Concurrency
   - 預先初始化執行環境
   - 消除冷啟動
   - 額外成本

5. 保持溫暖
   - CloudWatch Events 定期調用
   - 不推薦（浪費資源和金錢）
```

### 實際應用場景

#### 場景 1：圖片處理服務

```
用戶上傳圖片 → S3
                ↓ (觸發)
              Lambda
                ↓
         生成縮圖（多種尺寸）
                ↓
              S3 (儲存)
                ↓
          更新 DynamoDB

優勢：
- 自動擴展（支援大量並發上傳）
- 按使用付費（只在上傳時執行）
- 無需管理伺服器
```

#### 場景 2：API 後端

```
Client → API Gateway → Lambda → DynamoDB
                         ↓
                    ElastiCache (快取)

API 端點：
- GET /users/{id}
- POST /users
- PUT /users/{id}
- DELETE /users/{id}

每個端點一個 Lambda 函數
或使用路由庫處理多個端點
```

#### 場景 3：定時任務

```
CloudWatch Events (Cron)
    ↓
  Lambda
    ↓
執行任務（備份、清理、報表）

範例：
- 每天凌晨 2 點：資料庫備份
- 每小時：清理臨時檔案
- 每週一：生成週報
```

#### 場景 4：Webhook 處理

```
GitHub Webhook → API Gateway → Lambda → 處理事件
                                           ↓
                                    觸發 CI/CD

優勢：
- 即時響應
- 自動擴展
- 無需維護 webhook 伺服器
```

### 設計最佳實踐

#### 1. 函數設計

```
✅ 單一職責
每個函數只做一件事

✅ 無狀態
不在函數內儲存狀態

✅ 冪等性
多次執行產生相同結果

✅ 快速執行
目標：< 3 秒
```

#### 2. 錯誤處理

```javascript
exports.handler = async (event) => {
  try {
    const result = await processEvent(event);
    
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    // 記錄錯誤
    console.error('Error:', error);
    
    // 返回適當的狀態碼
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};
```

#### 3. 超時設置

```
設置合理的超時時間：
- API 端點：3-10 秒
- 資料處理：30 秒-15 分鐘
- 避免設置過長（浪費資源）
```

#### 4. 記憶體配置

```
記憶體 = CPU
- 128 MB: 基本任務
- 512 MB: 一般 API
- 1024 MB: 資料處理
- 更多記憶體 = 更快但更貴

測試找到最佳配置
```

### 常見面試問題

#### Q1：什麼時候適合使用 Serverless？

**回答要點**：
- 事件驅動的工作負載
- 不規律的流量模式
- 快速原型和MVP
- 非長期運行的任務

#### Q2：Serverless 的主要挑戰是什麼？

**回答要點**：
- 冷啟動延遲
- 執行時間限制
- 狀態管理
- 除錯困難
- 供應商鎖定

#### Q3：如何優化 Lambda 函數的效能？

**回答要點**：
- 選擇合適的記憶體配置
- 減小部署包大小
- 重用連接和資源
- 使用 Provisioned Concurrency

---

## 總結

Serverless 架構適合：
- 事件驅動的應用
- 不規律的流量
- 需要快速開發的專案

但不適合：
- 長期運行的任務
- 需要低延遲的關鍵應用
- 有狀態的應用

選擇 Serverless 時要權衡成本、效能和靈活性。
