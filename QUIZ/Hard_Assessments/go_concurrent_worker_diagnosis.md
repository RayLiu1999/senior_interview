# Go Worker Pipeline 診斷：取消、背壓與 Goroutine Leak

- **Assessment ID**: `assessment.go.concurrent.worker-pipeline.v1`
- **主要 Concept ID**: `concept.go.concurrency.goroutine-scheduling`
- **次要 Concept IDs**:
  - `concept.go.concurrency.channel-buffering`
  - `concept.go.concurrency.select-multiplexing`
  - `concept.go.standard-library.context-cancellation`
- **對應文章**:
  - [Goroutine 與 Thread](../../02_Backend_Development/Programming_Languages_and_Frameworks/Go/Concurrency/goroutine_vs_thread.md)
  - [Buffered 與 Unbuffered Channel](../../02_Backend_Development/Programming_Languages_and_Frameworks/Go/Concurrency/channel_buffered_vs_unbuffered.md)
  - [Select 的使用場景](../../02_Backend_Development/Programming_Languages_and_Frameworks/Go/Concurrency/select_statement_and_use_cases.md)
  - [Context 套件](../../02_Backend_Development/Programming_Languages_and_Frameworks/Go/Standard_Library/context_package_usage.md)
- **題型**: `故障診斷`, `並行設計`, `實作取捨`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 30 分鐘
- **標籤**: `Go`, `Goroutine`, `Channel`, `Select`, `Context`, `Backpressure`, `Cancellation`
- **Learning Objective IDs**:
  - `concept.go.concurrency.goroutine-scheduling/LO-1`
  - `concept.go.concurrency.goroutine-scheduling/LO-2`
  - `concept.go.concurrency.goroutine-scheduling/LO-3`
  - `concept.go.concurrency.channel-buffering/LO-1`
  - `concept.go.concurrency.channel-buffering/LO-2`
  - `concept.go.concurrency.channel-buffering/LO-3`
  - `concept.go.concurrency.select-multiplexing/LO-1`
  - `concept.go.concurrency.select-multiplexing/LO-2`
  - `concept.go.concurrency.select-multiplexing/LO-3`
  - `concept.go.standard-library.context-cancellation/LO-1`
  - `concept.go.standard-library.context-cancellation/LO-2`
  - `concept.go.standard-library.context-cancellation/LO-3`

## 測驗目標

- 能從 worker 數量、channel 狀態、select 分支、context deadline 與 goroutine dump 還原 pipeline 的阻塞與洩漏原因。
- 能設計有界 queue、明確 ownership、取消傳播、錯誤回報與 graceful shutdown，避免 producer 無限生產或 worker 永遠等待。
- 能在吞吐量、延遲、記憶體、背壓與資料遺失風險間提出可驗證的取捨。

## 問題情境與限制條件

你維護一個 Go 服務，HTTP handler 收到批次資料後，把工作送進 `jobs` channel；8 個 worker 從 channel 取出工作，呼叫一個最長 2 秒的下游 API，再把結果寫入 `results` channel。正常流量是 500 jobs/s，尖峰可達 5,000 jobs/s；下游只能穩定處理 800 req/s。

目前程式的行為如下：

- `jobs` 是容量 10,000 的 buffered channel。handler 在送不進去時啟動新的 goroutine 等待，而不是回傳明確的 overload 結果。
- worker 使用 `for job := range jobs`，但 shutdown 時只關閉 `results`，沒有由唯一 owner 關閉 `jobs`；部分 worker 會永久等待。
- 下游 timeout 使用獨立的 `context.Background()`，沒有繼承 HTTP request 的 deadline；client 取消後，工作仍可能繼續呼叫下游。
- result collector 使用 `select { case r := <-results: ... default: ... }`，沒有明確的完成條件；在暫時沒有結果時會 busy loop。
- 某次下游變慢後，goroutine 數從 500 增加到 50,000，heap 與 file descriptor 上升；服務重啟時約有 3% 的工作沒有結果，但沒有 audit log 可以判定是取消、timeout 或 process crash。

限制：不能把 channel 容量無限放大，不能用 `runtime.Gosched()` 或 sleep 掩蓋忙等，不能假設 client 一定等待到結果；必須定義過載、取消、重試與未完成工作的語意。

## 作答要求

1. **故障追蹤**：依序說明為何 goroutine 暴增、worker 卡住、collector busy loop、context 未取消與工作遺失可能同時發生；列出至少六項你會查的 runtime、應用或下游證據。
2. **設計有界 pipeline**：重新定義 producer、`jobs`、worker、`results` 與 collector 的 ownership、容量、並行度、backpressure 與 overload 回應，說明尖峰時哪些工作會被拒絕或延後。
3. **取消與 timeout**：設計 context 樹與 deadline 傳遞，處理 client disconnect、單一 job timeout、整批取消、worker shutdown 與下游 retry；說明何時可以安全重試。
4. **Channel、Select 與關閉**：指出 channel 關閉方向、receiver／sender ownership、`range` 結束條件、`select` 的 nil／closed channel 行為，以及如何避免 default busy loop、send-on-closed-channel 與永久阻塞。
5. **完成與可靠性**：定義 job ID、狀態與 audit 記錄，說明 process crash、結果 channel 滿、部分 worker 完成時如何判斷已完成／可重試／未知；不能直接宣稱 exactly-once。
6. **驗證修復**：提出至少六個負載或故障注入測試，涵蓋下游變慢、client 取消、queue 滿、worker panic、process shutdown、channel close、重試與恢復後的重放。

## 期待證據

- 能指出「每個 handler 再開一個等待 goroutine」把有限 queue 變成無界的記憶體與排程壓力，應改為有界等待或快速拒絕。
- 能區分 channel capacity、worker concurrency 與下游 throughput；buffer 只能吸收短時間 burst，不能修復長期產能不足。
- 能把 request context 傳到 worker，但也說明 detached background work 需要明確的服務級 lifecycle、deadline 與持久化佇列，不能任意繼承已取消的 HTTP context。
- 能由唯一 sender／coordinator 負責關閉 channel，讓 workers 與 collector 有明確的退出條件；不能由 receiver 隨意關閉仍會被送入的 channel。
- 能說明 `select default` 在沒有工作時會 busy loop，應使用阻塞 receive、timer 或 context cancellation，並處理 closed channel。
- 能以 queue depth／age、worker in-flight、goroutine／heap、下游 latency／error、cancel／timeout、result drop、job completion 與 retry 指標驗證恢復。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 無法建立 goroutine、channel 或 context 的基本模型，方案會持續洩漏、死鎖或無界佔用資源。 |
| 1 | 能背出 buffered channel、select 或 context 名詞，但無法把它們套到事故時間線，也沒有關閉與過載策略。 |
| 2 | 能指出部分阻塞／洩漏原因並提出局部修正，但遺漏 ownership、背壓、取消傳播、完成語意或可靠性邊界中的至少一項。 |
| 3 | 能完成有界 worker pipeline，正確設計 context／deadline、channel 關閉、select 等待與 overload 行為，並提出可驗證的監控與測試。 |
| 4 | 除上述內容外，能處理取消與重試 race、graceful shutdown、部分完成與 crash recovery，量化吞吐量／queue age／資源 headroom，並說明何時需要 durable queue 而非記憶體 channel。 |

### 通過標準

總分達 **3/4 分**才通過；pipeline lifecycle／backpressure、cancellation／timeout、channel ownership／shutdown 三個核心面向均不得低於 2 分。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

handler 不能在 queue 滿時為每個請求建立等待 goroutine；那只是把排隊從 channel 移到 heap。應設定有限的 admission queue 與等待 deadline，超過後回 `429`／`503` 或明確的非同步 job ID。8 個 worker 的有效吞吐量受下游 800 req/s 限制，channel 只能吸收短 burst，不能把 5,000 jobs/s 長期轉成成功。

由建立 pipeline 的 coordinator 擁有 `jobs` 的關閉權，producer 停止後關閉 `jobs`；workers 用 `range` 排空可接受的工作，完成後由 coordinator 等待 worker group，再關閉 `results`。collector 使用阻塞 receive，或以 `result, ok := <-results` 配合明確的 worker completion；不要在沒有值時用 `default` busy loop。所有送入與接收都要能在 `ctx.Done()` 時退出，避免 sender 卡在滿 queue 或 receiver 永遠等不到值。

每個 HTTP request 可以建立 child context，但若工作被允許在 response 後繼續，必須轉成有服務級 deadline 的明確 background job，並持久化 job ID／狀態；不能讓已取消的 request context 掛在長期工作上，也不能用 `context.Background()` 逃避取消。下游重試只限於明確可重試錯誤，且要有總 deadline、attempt 上限與 jitter；非冪等副作用需先有 idempotency key。

以 job ID 記錄 accepted、started、succeeded、cancelled、timeout、failed、retryable 等狀態，重啟後記憶體內未完成工作只能標記為 unknown 或由 durable queue 重放。觀測應包含 queue depth／age、worker active、goroutine／heap、下游 in-flight／latency、context cancellation、timeout、result channel backlog、job completion ratio 與 shutdown drain time。測試下游延遲、queue 滿、client disconnect、worker panic、SIGTERM drain、process crash 與重試，確認 goroutine 數回落、queue age 收斂、沒有 silent drop，且重放由 job ID／業務冪等性安全吸收。

</details>

## 常見失分點

- 只把 buffered channel 調大，沒有處理下游長期低於輸入速率的容量缺口。
- 在 `default` 中持續輪詢，或用 sleep／Gosched 掩蓋 busy loop。
- 讓 receiver 關閉仍會被 producer 使用的 channel，忽略 send-on-closed-channel race。
- 使用 `context.Background()` 讓所有工作脫離 request，卻沒有 lifecycle、deadline 或取消策略。
- 只用 WaitGroup 等待，沒有定義結果 channel 關閉、部分完成與 process crash 後的狀態。
- 宣稱 goroutine pipeline 自動提供 exactly-once，沒有 job ID、持久化佇列或業務冪等設計。

## 延伸追問

1. 如果下游寫入不是冪等的，worker timeout 後如何決定查詢、重試或進人工佇列？
2. 如果必須在 SIGTERM 後 10 秒內排空工作，你會如何計算可排空數量並處理超時剩餘工作？
3. 如果要把記憶體 channel 改成 Kafka 或其他 durable queue，哪些 context、ordering 與 retry 語意需要重新設計？
4. 如果 worker 需要依 tenant 公平排程，如何避免單一 tenant 塞滿 buffered queue？
