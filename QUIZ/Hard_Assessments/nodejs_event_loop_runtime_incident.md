# Node.js Event Loop Runtime Incident：從阻塞 I/O、背壓、錯誤傳播到 V8 記憶體

- **Assessment ID**: `assessment.nodejs.event-loop-runtime.incident.v1`
- **主要 Concept ID**: `concept.nodejs.core.event-loop`
- **次要 Concept IDs**:
  - `concept.nodejs.core.nonblocking-io`
  - `concept.nodejs.core.async-error-handling`
  - `concept.nodejs.core.stream-buffer`
  - `concept.nodejs.core.memory-management-gc`
  - `concept.nodejs.express.error-handling`
- **對應文章**:
  - [Node.js Event Loop 與 Libuv](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Core/event_loop_and_libuv.md)
  - [Node.js 阻塞與非阻塞 I/O](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Core/blocking_vs_non_blocking_io.md)
  - [Node.js 非同步錯誤處理模式](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Core/error_handling_async_patterns.md)
  - [Node.js Stream 與 Buffer](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Core/stream_and_buffer.md)
  - [Node.js 記憶體管理與 GC](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Core/memory_management_and_gc.md)
  - [Express.js 錯誤處理](../../02_Backend_Development/Programming_Languages_and_Frameworks/Node.js/Frameworks/Express/error_handling.md)
- **題型**: `生產事故診斷`, `事件循環`, `非阻塞 I/O`, `背壓與串流`, `錯誤邊界`, `記憶體診斷`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 35 分鐘
- **標籤**: `Node.js`, `Event Loop`, `Libuv`, `Express`, `Stream`, `V8`, `Garbage Collection`
- **Learning Objective IDs**:
  - `concept.nodejs.core.event-loop/LO-1`
  - `concept.nodejs.core.event-loop/LO-2`
  - `concept.nodejs.core.event-loop/LO-3`
  - `concept.nodejs.core.nonblocking-io/LO-1`
  - `concept.nodejs.core.nonblocking-io/LO-2`
  - `concept.nodejs.core.nonblocking-io/LO-3`
  - `concept.nodejs.core.async-error-handling/LO-1`
  - `concept.nodejs.core.async-error-handling/LO-2`
  - `concept.nodejs.core.async-error-handling/LO-3`
  - `concept.nodejs.core.stream-buffer/LO-1`
  - `concept.nodejs.core.stream-buffer/LO-2`
  - `concept.nodejs.core.stream-buffer/LO-3`
  - `concept.nodejs.core.memory-management-gc/LO-1`
  - `concept.nodejs.core.memory-management-gc/LO-2`
  - `concept.nodejs.core.memory-management-gc/LO-3`
  - `concept.nodejs.express.error-handling/LO-1`
  - `concept.nodejs.express.error-handling/LO-2`
  - `concept.nodejs.express.error-handling/LO-3`

## 測驗目標

- 能從 event-loop delay、request trace、下游 latency、stream queue、錯誤率與 RSS／V8 heap 建立可驗證的事故因果鏈。
- 能區分 JavaScript 主執行緒阻塞、Libuv thread pool 排隊、無界併發、stream 背壓失效、Express 錯誤傳播與真正的記憶體洩漏。
- 能設計有界併發、AbortController timeout、`pipeline` 背壓、集中式錯誤邊界、適當的 worker／process 分工與 V8 記憶體診斷方案。
- 能以分階段 rollout、慢客戶端與慢下游故障注入、heap snapshot、壓力測試及明確 rollback 指標驗證修復。

## 問題情境與限制條件

某 Node.js 20 + Express 4 API 提供 `/search` 與 `/export`。服務以 2 vCPU、1.5 GiB memory limit 的容器執行，透過負載平衡器接收流量。一次版本發布後流量增加 30%，觀察到 P99 從 240 ms 上升到 5.8 秒，部分請求回傳 502／504；event-loop delay P99 約 1.4 秒，CPU 約 85%，而資料庫 CPU 只有 40%。

目前程式與觀測資料如下：

- `/search` 對每個候選 ID 建立 Promise，再以 `Promise.all` 同時呼叫下游資料服務；輸入數量沒有上限、沒有每租戶配額、timeout、AbortSignal 或 bulkhead。這些 Promise 的 I/O callback 最終仍要回到同一個 JavaScript 執行緒處理結果與序列化。
- 某個 request path 在每次請求呼叫 `fs.readFileSync` 讀取租戶設定，接著對大型結果集執行 `JSON.parse`、欄位轉換與 `JSON.stringify`。團隊把這段工作包進 `setTimeout(..., 0)`，認為它就不會阻塞 event loop。
- `/export` 以 `Readable` 產生大量資料後直接呼叫 `res.write(chunk)`，忽略返回值與 `drain`；另一條路徑先將所有 chunk 放入陣列，再用 `Buffer.concat` 一次組成 response。部分客戶端下載很慢，`writableLength` 與 response buffer 持續增加。
- 一個 async route 在 Express 4 中直接回傳 rejected Promise，沒有 wrapper、`catch(next)` 或 `try/catch`；另一個 route 在 response 已送出部分 header 後又呼叫 `next(err)`。錯誤 middleware 被放在部分 router 之前，且團隊建議以 `process.on('unhandledRejection', () => {})` 忽略警告以避免程序重啟。
- RSS 從 620 MiB 緩慢升至 1.35 GiB；`heapUsed` 約從 410 MiB 升至 760 MiB，`external`／`arrayBuffers` 在 `/export` 尖峰時明顯增加。全域 `Map` 以 URL 與租戶組合為 key 保存 response Buffer，沒有容量或 TTL；每次 request 還會向共享 `EventEmitter` 加 listener，部分 listener closure 保留 request context。
- 團隊提出三個立即方案：「增加 `UV_THREADPOOL_SIZE`」、「以 cluster／worker threads 複製更多 worker」、「把 `--max-old-space-size` 調高並持續重啟」。限制是不能只靠擴容或重啟，不能犧牲租戶隔離與搜尋結果正確性，必須先安全止血，再提出可觀測、可分階段且可回滾的改動。

你是當值 senior engineer。請先區分已知證據、待驗證假設與不可由現有資料直接推論的結論，並說明目前使用 Express 4 會如何影響 async error handling。

## 作答要求

1. **建立事故因果鏈**：依序分析 event-loop delay、同步 I/O／CPU、Promise fan-out、stream backpressure、Express rejected Promise、GC／RSS 與 P99／502／504 的關係，列出至少三個競爭假設及其可觀測差異。
2. **設計取證計畫**：列出至少十二項具體證據或實驗，至少涵蓋 event-loop delay／utilization、request trace、CPU profile、Libuv thread pool、Promise／request concurrency、stream queue／`drain`、下游 latency／連線池、Express error path、heap／external／RSS、GC pause、Map cardinality 與 listener count；說明每項如何支持或排除假設。
3. **提出安全止血**：設計路由 feature flag、request／租戶併發上限、AbortController timeout、bounded fan-out、下游 bulkhead、慢客戶端保護與 overload response；說明為何無條件增加 worker 或 `UV_THREADPOOL_SIZE` 可能只是放大記憶體與下游壓力。
4. **修正 Event Loop 與 I/O 模型**：指出哪些 synchronous API、JSON／壓縮／加密或資料轉換會阻塞 JavaScript 主執行緒，哪些工作可能使用 Libuv thread pool，哪些 CPU-bound JavaScript 工作應移至 worker thread／獨立 process，並說明 `setTimeout(0)` 不會把已執行的同步工作變成非阻塞。
5. **修正 Stream 與 Buffer**：設計使用 `pipeline`、`highWaterMark`、`write()` 返回值、`drain`、client abort 與 bounded buffer 的方案，說明如何避免 `Buffer.concat`、無界陣列與慢客戶端造成記憶體放大。
6. **建立錯誤傳播邊界**：比較 callback、Promise、async/await、Express 4 wrapper 與 Express 5 自動轉發的差異；設計位於所有 router 之後的四參數 error middleware、錯誤分類、response headers 已送出時的處理，以及 `unhandledRejection`／`uncaughtException` 的 graceful shutdown 策略。
7. **診斷 V8 記憶體與 GC**：區分 New／Old／Large Object Space、heapUsed、external／ArrayBuffer、RSS、GC pause、全域 Map、閉包與 EventEmitter listener 的保留路徑，提出 heap snapshot、allocation profile、listener／cache cardinality 與 worker recycling 的驗證方法。
8. **分階段交付與驗證**：給出至少三階段的改動順序，每階段列出成功指標、警戒線、rollback 條件，以及至少一項壓力、慢客戶端、慢下游、錯誤注入或記憶體故障注入測試。

## 期待證據

- 能指出 event-loop delay 上升代表 JavaScript callback／microtask 或同步工作無法及時讓出主執行緒；`setTimeout(0)` 只是延後排程，不能包住同步工作就消除阻塞，也不能只用 CPU 百分比判定原因。
- 能區分檔案、DNS、部分 crypto／zlib 等可能使用 Libuv thread pool 的工作與網路 I/O、JavaScript CPU work 的執行邊界；增加 `UV_THREADPOOL_SIZE` 不會讓 `JSON.stringify` 或同步 API 變成非阻塞。
- 能以 in-flight Promise、每租戶配額、下游連線／限流、timeout／cancel 與 task age 對齊 `Promise.all` 的容量放大，並知道 `Promise.all` 本身不是背壓機制。
- 能用 `write()` 返回 `false`、`writableLength`、`drain`、client abort、`pipeline` error 與 response bytes 證明背壓是否被遵守；知道 `Buffer` 的 external／ArrayBuffer 記憶體可能不等於 `heapUsed`。
- 能指出 Express 4 不會自動把所有 async route rejection 傳給 error middleware；error handler 必須有四個參數且在 routes 之後，response 已開始後不可再安全地寫一個全新錯誤 response。
- 能區分 operational error、資料驗證／下游 timeout 與 programmer error；不能用空的 `unhandledRejection` listener 掩蓋程序狀態，應記錄 context、停止接收新流量、完成可行的 graceful shutdown 並由 supervisor 重啟。
- 能以 heap snapshot retained path、allocation profile、`process.memoryUsage()`、GC pause、Map cardinality、listener count、RSS 與固定 workload 後的基線區分 leak、buffer pressure、GC／allocator 保留與正常 cache。
- 能把修復連到 event-loop delay、P50／P99、throughput、502／504、in-flight、stream queue、下游 saturation、error／restart、heap／external／RSS 與 rollback time。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議增加 `UV_THREADPOOL_SIZE`、worker 或 heap limit，忽略主執行緒阻塞、背壓、錯誤傳播與記憶體 ownership，且沒有可驗證證據。 |
| 1 | 能列出 Event Loop、Promise、Stream、Express 或 GC 的部分名詞，但無法建立因果鏈，也未處理取消、慢客戶端、錯誤邊界或 rollback。 |
| 2 | 能指出同步工作、無界 fan-out、背壓或 memory growth 的部分問題，提出大致可行修復，但遺漏至少兩個核心面向或缺少量化驗證。 |
| 3 | 能完成 Node.js runtime 診斷，正確處理 event loop／I/O 邊界、bounded concurrency、stream backpressure、Express error middleware、V8 memory evidence 與分階段 rollout。 |
| 4 | 除上述內容外，能處理 microtask／`nextTick` starvation、Libuv pool 與 worker thread trade-off、headers 已送出、Buffer external memory、部分完成／取消與可逆部署的邊界條件。 |

### 通過標準

總分達 **3/4 分**才通過；Event Loop／I/O、併發／背壓、錯誤傳播、V8 記憶體四個核心面向均不得低於 2 分，且必須提出至少一個可執行的 rollback 條件。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先把 P99 拆成 request queue、event-loop wait、JavaScript service time、下游 I/O、stream write wait、GC pause 與 process restart。event-loop delay P99 已達 1.4 秒，支持主執行緒有長 callback、同步 I/O、JSON／資料轉換或大量 microtask；但 CPU 85% 仍不足以證明是哪一段，需要用 trace、CPU profile 和 event-loop monitor 對齊。資料庫 CPU 40% 也不能排除每 request query 數量、連線池等待、下游 latency 或應用層序列化。

`fs.readFileSync`、大型 `JSON.parse`／`JSON.stringify` 與純 JavaScript 的資料轉換都在主執行緒執行；把它們放到 `setTimeout(0)` 只會讓工作稍後開始，執行期間仍會阻塞事件循環。Libuv thread pool 只涵蓋特定非同步 API，不能當成所有工作共用的「背景執行緒」。`Promise.all` 可以同時等待多個 I/O，但不會限制任務數、連線數、結果暫存或下游負載；應以輸入上限、semaphore／bounded worker、每租戶配額、AbortSignal、單次與整體 timeout 及 bulkhead 控制容量。

`/export` 應以 `Readable`、Transform 與 response 形成有界 pipeline，讓 `pipeline` 管理錯誤、關閉與取消。當 `res.write(chunk)` 返回 `false` 時要停止或暫停生產，待 `drain` 再繼續；遇到 request／socket abort 要中止資料來源和下游工作。把所有 chunk 收進陣列再 `Buffer.concat` 會同時保留多份資料，且 external／ArrayBuffer 記憶體不一定反映在 `heapUsed`；應使用串流、分頁、欄位裁剪或明確的 bounded buffer。

目前是 Express 4，async handler 的 rejected Promise 不應假設會自動到達 error middleware；可使用一致的 async wrapper 將 rejection 傳給 `next`，或在 handler 內明確捕獲。error middleware 必須是四參數 `(err, req, res, next)`，並放在所有 router 和 404 handler 之後；若 headers 已送出，應停止重複寫 response，依情況記錄並關閉／交由框架處理 socket。Express 5 的自動 Promise forwarding 是版本行為，升級前需用契約測試確認，不可混用兩種假設。

`unhandledRejection` 不應用空 listener 吃掉。對可恢復的操作錯誤，應在 request 邊界映射成安全的 4xx／5xx、保留 correlation ID 並傳播取消；對 programmer error 或未知狀態，記錄完整 context、停止接收新流量、等待可行的連線與 stream cleanup，然後讓 supervisor 重新啟動。`uncaughtException` 後繼續接流量可能讓共享狀態處在未知狀態，不能把「不重啟」當成可靠性策略。

記憶體診斷要同時比較 V8 heap spaces、`heapUsed`、`external`／`arrayBuffers`、RSS、GC pause、allocation rate、heap snapshot retained path、全域 Map cardinality 與 listener count。若 snapshot 顯示 global Map 或 EventEmitter root 持續保留 response Buffer、request context 或 closure，這是 ownership／eviction 問題；若 heap stable 而 external／RSS 隨慢客戶端增加，則先查 stream buffer、Buffer lifetime、socket 與 native／allocator 保留。GC 只能回收不可達物件，不能解決仍被 Map、listener、closure 或 cache root 引用的資料；固定 workload、重複 snapshot 和受控 worker recycle 才能區分 leak 與保留。

建議分三階段交付。第一階段保留舊路徑，限制 `/export` 輸入與每租戶併發、加入 request／下游 timeout、AbortSignal、overload response、event-loop／stream／memory／error metrics，並以慢客戶端與慢下游注入測試；若 event-loop delay、P99、502／504、RSS 或下游 saturation 超過警戒線就回滾。第二階段移除同步 request API、修正 bounded fan-out、pipeline／drain、Express 4 async wrapper、錯誤 middleware 順序與 cache／listener ownership，逐步 rollout 並驗證資料正確性與取消清理。第三階段才依 CPU profile 決定 worker thread／process、cluster 數量、V8 設定或受控 recycling，以固定 workload 比較 throughput、tail latency、heap／external／RSS 與重啟恢復時間；每次只改一個主要變因並保留舊設定。

</details>

## 常見失分點

- 把 `setTimeout(0)`、`Promise.all` 或 `await` 說成會自動讓同步 CPU／I/O 變成非阻塞。
- 看到 event-loop delay 就只增加 `UV_THREADPOOL_SIZE`，沒有區分 Libuv pool、JavaScript 主執行緒與 worker thread。
- 忽略 `write()` 返回值、`drain`、client abort 與 `pipeline`，仍用無界 `Buffer.concat` 或陣列累積輸出。
- 在 Express 4 直接假設 rejected Promise 會被捕獲，或把 error middleware 放在 router 之前；response 已送出後仍重複寫錯誤 response。
- 用空的 `unhandledRejection` listener、持續吞錯或無條件重啟掩蓋未分類的 operational／programmer error。
- 只看 `heapUsed` 判定記憶體，沒有檢查 external／ArrayBuffer、RSS、Map／listener retained path、GC pause 與固定 workload 基線。

## 延伸追問

1. 如果 event-loop delay 在移除同步 I/O 後下降，但 CPU 仍高且 P99 未改善，你會如何區分大型 JSON／壓縮、下游 latency 與 response backpressure？
2. 如果使用 worker threads 後 throughput 提高但 tail latency 變差，你會檢查 message serialization／transfer、worker queue、CPU quota、GC 與 shutdown 行為的哪些因素？
3. 如果慢客戶端取消下載後，下游查詢仍持續執行，你會如何沿著 request signal、stream close、Promise cleanup 與 cache write 修正取消競態？
4. 如果 heap snapshot 顯示 Map 已有 eviction，但 RSS 仍持續增加，你會如何排除 Buffer external memory、socket、native addon、allocator 保留與 container limit？
5. 如果升級 Express 5 後錯誤率改變，你會如何用 async route contract test、error middleware ordering、headersSent 與版本 rollout 判斷是修正行為還是新的回歸？
