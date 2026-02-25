# Redis Pipeline 與 Lua 腳本

- **難度**: 6
- **重要程度**: 4
- **標籤**: `Redis`, `Pipeline`, `Lua`, `批次操作`, `原子性`, `效能優化`

## 問題詳述

每次 Redis 命令都涉及一次**網路往返（RTT）**，在高頻率批次操作下，RTT 累積成為主要瓶頸。Redis **Pipeline** 透過批次打包命令降低 RTT 次數；**Lua 腳本**則在 Pipeline 基礎上進一步提供**原子性保證**，兩者是 Redis 效能優化的重要工具。

## 核心理論與詳解

### 問題背景：RTT 的代價

```
無 Pipeline（10 次 SET）：
Client          Redis Server
  ── SET k1 v1 ──→
  ←── OK ─────────
  ── SET k2 v2 ──→
  ←── OK ─────────
  ......（10 個 RTT）
  總時間 = 10 × RTT（如 RTT=1ms，總耗時 10ms）

Pipeline（10 次 SET 打包）：
Client          Redis Server
  ── [SET k1 v1, SET k2 v2, ..., SET k10 v10] ──→
  ←── [OK, OK, ..., OK] ──────────────────────────
  總時間 ≈ 1 × RTT + 服務端處理時間（約 1ms，節省 ~90% 時間）
```

---

### Pipeline 的工作原理

Pipeline **不是原子操作**，而是純粹的**傳輸層優化**：
1. 客戶端將多個命令緩衝在本地，一次性發送到服務端
2. 服務端依序執行這些命令
3. 客戶端一次性讀取所有回應

**限制**：
- Pipeline 中的命令**不能互相依賴**（後一個命令不能使用前一個命令的結果，因為是一次性發送）
- 如果 Pipeline 中某個命令失敗，其他命令**仍然執行**（無事務語義）

**Go 使用 Pipeline**：
```go
// 使用 go-redis 的 Pipeline
pipe := rdb.Pipeline()
for i := 0; i < 1000; i++ {
    pipe.Set(ctx, fmt.Sprintf("key:%d", i), i, time.Hour)
}
cmds, err := pipe.Exec(ctx)
if err != nil {
    log.Printf("pipeline exec error: %v", err)
}
// 注意：err != nil 不代表所有命令都失敗，需逐一檢查 cmds 中每個 cmd.Err()
```

**批次查詢（讀取多個 Key）**：
```go
// 比逐一 GET 快 ~10 倍
pipe := rdb.Pipeline()
gets := make([]*redis.StringCmd, len(keys))
for i, key := range keys {
    gets[i] = pipe.Get(ctx, key)
}
pipe.Exec(ctx)

for i, cmd := range gets {
    val, err := cmd.Result()
    // 處理每個結果
}
```

---

### Lua 腳本：原子性的批次操作

**核心差異**：Lua 腳本在 Redis 服務端**原子執行**，腳本執行期間不會處理其他客戶端命令（類似 MULTI/EXEC，但功能更強大）。

**Lua 腳本的優勢**：
1. **原子性**：讀-改-寫 操作保證不被其他命令插隊
2. **條件邏輯**：可在腳本中寫 if/else 判斷（純 Pipeline 做不到）
3. **減少網路往返**：多次 GET/SET 合併為一次腳本調用
4. **腳本緩存**：`SCRIPT LOAD + EVALSHA` 避免重複傳輸腳本內容

**經典場景：分散式鎖的安全釋放**

普通 Get-and-Delete 的問題：
```
// ❌ 非原子，存在競態條件
value := GET lock
if value == my_token {  // ← 這裡和下面的 DEL 之間，鎖可能已被他人獲取
    DEL lock
}
```

用 Lua 腳本原子化：
```go
// ✅ 原子釋放鎖
const unlockScript = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("DEL", KEYS[1])
else
    return 0
end
`

result, err := rdb.Eval(ctx, unlockScript, []string{"mylock"}, "my-unique-token").Int()
// result == 1: 成功釋放
// result == 0: 鎖不屬於我（已過期或被他人持有）
```

**另一個場景：原子性庫存扣減**：
```go
const stockDeductScript = `
local stock = tonumber(redis.call("GET", KEYS[1]))
if stock == nil or stock <= 0 then
    return -1  -- 庫存不足
end
redis.call("DECRBY", KEYS[1], ARGV[1])
return stock - tonumber(ARGV[1])
`

remaining, err := rdb.Eval(ctx, stockDeductScript, []string{"stock:item:123"}, 1).Int()
```

---

### EVALSHA：腳本緩存

對於頻繁執行的腳本，避免每次傳輸腳本內容：

```go
// 1. 預先加載腳本到所有 Redis 節點，獲取 SHA1 hash
sha, err := rdb.ScriptLoad(ctx, unlockScript).Result()

// 2. 後續使用 SHA 執行，網路傳輸量從 N 字節降為 40 字節
result, err := rdb.EvalSha(ctx, sha, []string{"mylock"}, "my-unique-token").Int()
```

---

### Pipeline vs MULTI/EXEC vs Lua 對比

| 特性 | Pipeline | MULTI/EXEC（事務） | Lua 腳本 |
|------|----------|-------------------|---------|
| 原子性 | ❌ | ✅（部分：命令失敗不回滾） | ✅（嚴格原子） |
| 條件邏輯 | ❌ | ❌（WATCH 是樂觀鎖） | ✅ |
| RTT 優化 | ✅（核心目的） | ✅ | ✅ |
| 命令間結果依賴 | ❌ | ❌ | ✅ |
| 適用場景 | 大批量無依賴操作 | 監視鍵並原子執行 | 讀改寫、條件更新 |
