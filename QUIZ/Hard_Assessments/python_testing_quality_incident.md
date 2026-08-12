# Python Testing Quality Incident：從 CPython 執行模型到可重現的 pytest／Poetry 交付

- **Assessment ID**: `assessment.python.testing-quality.incident.v1`
- **主要 Concept ID**: `concept.python.testing.pytest-framework`
- **次要 Concept IDs**:
  - `concept.python.internals.compilation-execution`
  - `concept.python.internals.type-system-duck-typing`
  - `concept.python.testing.fixture-lifecycle`
  - `concept.python.testing.integration-boundary`
  - `concept.python.testing.mock-boundary`
  - `concept.python.testing.parametrized-testing`
  - `concept.python.testing.coverage-signal`
  - `concept.python.testing.tdd-feedback-loop`
  - `concept.python.testing.async-testing`
  - `concept.python.testing.unit-test-design`
  - `concept.python.tooling.poetry-reproducibility`
- **對應文章**:
  - [CPython 的編譯與執行過程](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Internals/compilation_and_execution.md)
  - [Python 類型系統：動態類型與鴨子類型](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Internals/type_system_and_duck_typing.md)
  - [測試固件與依賴注入](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Testing/fixtures_and_dependency_injection.md)
  - [集成測試策略](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Testing/integration_testing.md)
  - [Mock 與 Patch 技巧](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Testing/mocking_and_patching.md)
  - [參數化測試](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Testing/parametrized_testing.md)
  - [pytest 框架深入解析](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Testing/pytest_framework.md)
  - [測試覆蓋率與報告](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Testing/test_coverage.md)
  - [測試驅動開發 (TDD)](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Testing/test_driven_development.md)
  - [異步代碼測試](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Testing/testing_async_code.md)
  - [單元測試最佳實踐](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Testing/unit_testing_best_practices.md)
  - [Poetry 現代依賴管理](../../02_Backend_Development/Programming_Languages_and_Frameworks/Python/Tooling/poetry_dependency_management.md)
- **題型**: `生產事故診斷`、`測試架構`、`非同步生命週期`、`依賴可重現性`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 55 分鐘
- **標籤**: `Python`, `pytest`, `Testing`, `AsyncIO`, `Type System`, `Coverage`, `Poetry`, `CI`
- **Learning Objective IDs**:
  - `concept.python.internals.compilation-execution/LO-1`
  - `concept.python.internals.compilation-execution/LO-2`
  - `concept.python.internals.compilation-execution/LO-3`
  - `concept.python.internals.type-system-duck-typing/LO-1`
  - `concept.python.internals.type-system-duck-typing/LO-2`
  - `concept.python.internals.type-system-duck-typing/LO-3`
  - `concept.python.testing.fixture-lifecycle/LO-1`
  - `concept.python.testing.fixture-lifecycle/LO-2`
  - `concept.python.testing.fixture-lifecycle/LO-3`
  - `concept.python.testing.integration-boundary/LO-1`
  - `concept.python.testing.integration-boundary/LO-2`
  - `concept.python.testing.integration-boundary/LO-3`
  - `concept.python.testing.mock-boundary/LO-1`
  - `concept.python.testing.mock-boundary/LO-2`
  - `concept.python.testing.mock-boundary/LO-3`
  - `concept.python.testing.parametrized-testing/LO-1`
  - `concept.python.testing.parametrized-testing/LO-2`
  - `concept.python.testing.parametrized-testing/LO-3`
  - `concept.python.testing.pytest-framework/LO-1`
  - `concept.python.testing.pytest-framework/LO-2`
  - `concept.python.testing.pytest-framework/LO-3`
  - `concept.python.testing.coverage-signal/LO-1`
  - `concept.python.testing.coverage-signal/LO-2`
  - `concept.python.testing.coverage-signal/LO-3`
  - `concept.python.testing.tdd-feedback-loop/LO-1`
  - `concept.python.testing.tdd-feedback-loop/LO-2`
  - `concept.python.testing.tdd-feedback-loop/LO-3`
  - `concept.python.testing.async-testing/LO-1`
  - `concept.python.testing.async-testing/LO-2`
  - `concept.python.testing.async-testing/LO-3`
  - `concept.python.testing.unit-test-design/LO-1`
  - `concept.python.testing.unit-test-design/LO-2`
  - `concept.python.testing.unit-test-design/LO-3`
  - `concept.python.tooling.poetry-reproducibility/LO-1`
  - `concept.python.tooling.poetry-reproducibility/LO-2`
  - `concept.python.tooling.poetry-reproducibility/LO-3`

## 測驗目標

- 能從 CPython 的編譯／import、動態型別、pytest collection、fixture scope、測試替身、非同步 cleanup 與 Poetry resolution 建立事故因果鏈。
- 能區分 unit、component、integration、contract 與 E2E 的信心邊界，並把測試成本、隔離、可診斷性與風險放進設計。
- 能判斷 coverage、TDD、mock interaction、參數化案例與 CI flake 哪些是證據、哪些只是代理指標。
- 能以可重現的環境、lock file、Python／plugin 矩陣和分階段 rollout 修復測試品質，而不是靠重試、跳過或降低門檻掩蓋問題。

## 問題情境與限制條件

某 Python 多租戶訂單服務以 pytest、pytest-asyncio 與 Poetry 維護。專案包含同步 API、非同步付款與通知 client、PostgreSQL／Redis 整合，以及供其他團隊使用的型別提示和資料模型。測試原本約 1,800 個，主分支在單一 runner 上約 12 分鐘完成。

最近一次 Python、pytest plugin 與依賴升級後，CI 出現以下訊號：

- 測試總時間由 12 分鐘升至 31 分鐘，重跑同一 commit 的失敗率約 8%；失敗案例常在本地不出現，使用平行執行或不同測試順序時才出現。
- 全域 line coverage 從 89% 升至 92%，但新支付 adapter 的錯誤回應、取消路徑和租戶隔離仍有生產缺陷；coverage 設定排除了 generated model、部分 adapter 和測試工具目錄。
- 一個 session-scoped fixture 共用可變的資料庫資料和 Redis namespace；另一個 autouse fixture 改寫時間與環境變數，但 teardown 只在正常測試返回時驗證。某些測試留下 transaction、socket、背景 task 或 event loop state。
- 測試使用 `pytest-xdist` 後，部分案例依賴執行順序、全域 cache、固定 port 和上一次測試留下的資料。重試 plugin 讓 CI 變綠，卻沒有留下第一次失敗的完整診斷證據。
- 多個 unit test patch 了錯誤的模組命名空間，或以沒有 spec 的 Mock 代替付款 client；測試因此通過，但實際 client 的方法名稱、async 行為、timeout 和回傳 schema 已經改變。
- 參數化測試有大量 happy path 組合，卻缺少空值、邊界數字、錯誤型別、取消、重複請求和跨租戶組合；部分案例使用不具意義的自動 ID，CI log 很難定位。
- async 測試偶爾出現未 await coroutine、pending task、event loop 已關閉和未回收連線的警告。測試用固定 sleep 等待競態，慢下游或取消時會留下不可預期的副作用。
- 團隊宣稱已採 TDD，實際上許多測試只驗證 mock 被呼叫，沒有驗證資料庫 transaction、HTTP contract、重試冪等、serialization 或實際 resource cleanup。少數 integration test 只測成功流程。
- `pyproject.toml` 的直接依賴與 lock file 曾由不同 Poetry／Python 版本更新；CI 有時重新 resolve，有時只安裝 lock。不同 runner 的 Python marker、optional group、私有 package source、editable／package mode 和 artifact hash 不一致。
- 一個依賴升級後，服務在部分環境能 import，部分環境在啟動時才因動態型別或 plugin API 不相容失敗。團隊把 `.pyc` 是否存在誤當成依賴版本正確的證明，也未區分 import／編譯成本與 runtime 行為。

你是負責收斂品質事故的 senior engineer。限制如下：

- 不能以全面增加 CI retry、跳過 flaky 測試、關閉 warning、只提高 coverage threshold 或永久放寬相容矩陣作為唯一修復。
- 必須維持目前支援的 Python 版本、租戶資料隔離、支付冪等與既有 API／package contract；若要改變契約，必須有版本化、遷移和 rollback。
- 第一階段要先讓 CI 結果可相信且保留失敗證據；後續才能調整測試分層、fixture scope、依賴版本與平行度。
- Assessment 以理論、取證、測試設計和決策為主，不需要提供程式碼。

## 作答要求

1. **建立事故因果鏈**：分別分析 pytest collection／plugin、fixture scope、共享狀態、mock 邊界、async cleanup、coverage 設定與 Poetry resolution 如何造成 flake、慢測試、假信心和環境差異；標記已知證據、合理假設與待驗證項目。
2. **說明 CPython 與型別邊界**：描述 source、AST、code object／bytecode、`.pyc`、import side effect 和 eval loop 的責任範圍，並區分動態型別、duck typing、Protocol、type hints 與 runtime validation。
3. **重畫 pytest 生命週期**：說明 discovery、fixture dependency graph、scope、autouse、yield／finalizer、event loop、xdist worker 和 plugin hook 的 ownership，指出哪些狀態必須縮小 scope 或明確清理。
4. **重畫測試分層**：為 unit、component、integration、contract、E2E 建立責任矩陣，說明何時使用真實 DB／HTTP／queue、fake、stub、mock 或 spy，以及每層的速度和信心取捨。
5. **處理 mock 與案例品質**：說明 patch where used、autospec／spec_set、interaction assertion、參數化 ID、等價類、邊界和組合爆炸，指出如何避免測試通過但 production contract 已壞。
6. **解讀 coverage 與 TDD**：比較 line／branch／changed-code coverage、排除規則、mutation／故障注入與 quality gate；說明 Red-Green-Refactor 如何改善行為契約而不是固定實作細節。
7. **處理 async 測試**：設計成功、例外、timeout、取消、部分完成、慢下游與 shutdown 的測試，明確說明 pending task、未 await、event loop、連線和背景資源如何驗證 cleanup。
8. **處理 Poetry 可重現性**：說明 `pyproject.toml`、lock resolution、Python marker、optional dependency、來源／hash、package mode 和 CI install policy，提出可重現的版本矩陣與 rollback artifact。
9. **提出分階段方案**：至少三階段；每階段列出變更、成功指標、警戒線、rollback 條件和至少一項故障注入或重現實驗。第一階段不得破壞既有契約。

## 期待證據

- 能畫出 source → AST → code object／bytecode → eval loop 的邊界，並指出 `.pyc` 只與編譯／import cache 有關，不是依賴 graph 或 ABI 正確性的證明。
- 能指出 import time side effect、Python／plugin 版本、平台差異和 package 安裝內容應以 clean environment、artifact manifest 和啟動 trace 驗證。
- 能區分 type hint／Protocol 的靜態證據與 runtime 行為，使用 static checker、runtime contract／schema test 和實際錯誤路徑補足 duck typing 的盲點。
- 能以 pytest collection、fixture graph、scope、autouse、finalizer、test order、xdist worker 和 plugin version 證明共享狀態來源。
- 能對 session／module fixture 的可變資料、DB transaction、Redis namespace、環境變數、時間、port、file、socket、event loop 和背景 task 提出 owner 與清理斷言。
- 能指出 patch 必須在被測模組查找依賴的 namespace，並以 autospec／spec_set、真實簽名和 async 行為避免 mock 漂移。
- 能把 mock interaction、fake、contract、integration 和 E2E 的信心邊界說清楚，避免用 unit test 宣稱跨服務或 transaction 正確。
- 能用具名參數化案例涵蓋有效值、空值、上下界、型別錯誤、重試、取消、冪等、重複請求與跨租戶組合，並控制笛卡兒積成本。
- 能區分 line／branch／changed-code coverage，檢查 include／omit 和 generated code，並用 mutation、故障注入或錯誤案例證明斷言有效。
- 能說明 TDD 的 Red 必須先證明測試會失敗，Green 只做最小行為，Refactor 不應被實作細節測試綁住。
- 能測量 async event loop、pending task、未 await warning、取消傳播、timeout、連線／semaphore／transaction cleanup 和慢下游行為。
- 能提出 unit／integration／contract／E2E 的速度、隔離、資料管理、重試、網路和部署 smoke 指標，而非只給測試數量。
- 能比較 Poetry 直接需求與 lock graph，固定 Poetry／Python 版本、來源、hash、markers、optional groups、package mode 與安裝命令。
- 能在乾淨 runner 和容器中比較 lock install、artifact manifest、`sys.path`／package metadata、啟動 import、測試 collection 和 runtime dependency fingerprint。
- 能保留第一次 CI 失敗的 seed、worker、test order、環境、collection、log、trace、dependency diff 與資源使用量，不用 retry 掩蓋證據。
- 能建立至少 20 項可執行證據或實驗，至少涵蓋：collection diff、fixture scope audit、順序／隨機重跑、xdist、transaction leak、cache leak、錯誤 namespace patch、spec mismatch、參數化邊界、coverage branch、mutation、TDD red test、真實 schema、資料庫／HTTP integration、contract diff、慢下游、async cancellation、pending task、依賴 clean install、Poetry lock drift、Python version matrix 與 rollback install。
- 能以 test duration、flake rate、首次失敗保留率、pending task、open handle、DB／Redis cleanup、coverage branch gap、production escape、lock drift 和環境 fingerprint 設定停止線。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 只建議重試、跳過 flaky 測試、提高 coverage 或重新安裝依賴，沒有 pytest lifecycle、測試邊界、async cleanup 或可重現性證據。 |
| 1 | 能列出 fixture、mock、coverage、async 或 Poetry 的部分名詞，但無法建立因果鏈，也沒有可驗證的隔離、契約和 rollback 方案。 |
| 2 | 能指出共享 fixture、錯誤 patch、測試分層、pending task 或 lock drift 的部分問題，提出局部修復，但遺漏至少兩個核心面向，例如型別／編譯邊界、integration contract、coverage 品質、取消清理、TDD 或 CI reproducibility。 |
| 3 | 能整合 CPython／型別模型、pytest lifecycle、測試分層、mock／參數化、coverage／TDD、async cleanup、Poetry lock、證據矩陣與分階段 rollback，提出可執行方案。 |
| 4 | 除上述內容外，能處理 import side effect、`.pyc` 與 artifact 的差異、scope 造成的隱性污染、xdist／plugin 競態、mock 漂移、笛卡兒積、branch／mutation 盲點、取消後部分完成、marker／package mode 差異，以及首次失敗保留和可逆 rollout 的邊界條件。 |

評分時請分別檢查四個核心面向：**CPython／型別與 pytest 執行模型**、**fixture／mock／測試隔離**、**測試分層／coverage／TDD／async**、**Poetry／CI 可重現性與交付**。

### 通過標準

整體總評達 **3/4 分**才通過；四個核心面向均不得低於 2 分，且答案必須提出至少一項可執行的 rollback 條件、至少一項 async cleanup 故障注入，以及至少一項 clean Poetry install／lock drift 驗證。

## 參考答案與詳解

先把事故拆成四條互相放大的鏈：測試執行模型、共享資源生命週期、測試信心邊界，以及依賴與 CI 環境。已知證據是 duration、flake rate、coverage 上升但 production escape、xdist／順序相關失敗、pending task／socket 警告與不同 runner 的 lock／marker 差異；「某個 `.pyc` 造成依賴錯誤」只是未驗證假設，必須與 Python／plugin 版本、實際安裝檔案和 import trace 分開。先保存第一次失敗的 seed、worker、collection、環境指紋與 log，才能避免 retry 把因果鏈洗掉。

CPython 會把 source 解析成 AST，再編譯為 code object／bytecode，由虛擬機的 eval loop 執行；`.pyc` 是 import 的編譯快取，會依 source／hash、Python 版本與相關 metadata 失效。它不能證明依賴 graph、plugin API、ABI、私有來源或 runtime configuration 正確。import time side effect、package 是否真的安裝進環境和動態型別錯誤，應以 clean install、package metadata、啟動 trace 和最小 runtime smoke 驗證。type hints／Protocol 可交給 static checker 形成早期證據，但 duck typing 的實際 method、return shape、例外和 resource ownership 仍須由 runtime contract 與測試覆蓋。

pytest 方面，先固定 collection 和設定來源，再畫 fixture dependency graph。function scope 適合可變資料和需要強隔離的資源；module／session scope 只適合初始化昂貴且可安全重置的不可變或明確管理資源。資料庫 transaction、Redis namespace、環境變數、時間、固定 port、event loop、背景 task 和 socket 都要有 owner、唯一命名和 teardown assertion。yield／finalizer 必須在成功、例外、取消與 runner 中斷的可控制路徑釋放資源；autouse fixture 不應偷偷改變所有測試的全局狀態。用隨機順序、單獨執行、反向順序、xdist、重複 seed 和最小案例可確認污染來源，而不是把 retry 當成修復。

測試分層要明確。unit test 驗證單一行為並保持毫秒級；component／integration test 驗證真實 serialization、transaction、資料庫、cache、HTTP 或 queue 邊界；contract test 固定跨服務 schema；E2E 只保留少量最關鍵流程。Mock 應在被測模組查找依賴的 namespace 使用，autospec／spec_set 可以捕捉簽名漂移，但仍不能取代真實網路、timeout、重試、資料庫隔離和 cleanup。對支付 client 應用具名參數化測試涵蓋成功、空值、上下界、錯誤型別、超時、取消、重複請求與跨租戶組合，並透過等價類與分層 marker 控制案例數。

coverage 要作為風險訊號，不是唯一 gate。應檢查 line、branch、changed-code 的 include／omit 規則，關注錯誤處理、權限、取消、冪等和 adapter 的 branch gap；再用 mutation、故障注入或刻意改壞錯誤分支證明斷言真的會失敗。TDD 的 Red 階段先確認測試能抓到錯誤，Green 只做最小行為，Refactor 則保持外部契約；若測試只確認某個 private method 或 mock call，重構會變成脆弱且無法保護真實行為，應補上 component／contract／integration 證據。

async 測試要控制事件和完成條件，不應用任意 sleep 猜時序。每個測試要明確擁有 event loop 和背景 task，並在成功、例外、timeout、取消、部分完成與 shutdown 後檢查 pending task、未 await coroutine、連線、semaphore、transaction、queue 和 callback 是否回收。慢下游與取消故障注入應驗證取消傳播、有限重試、部分結果和冪等；測試的 async mock 也要符合真實 await／exception 行為。

Poetry 方面，`pyproject.toml` 表達直接需求與專案 metadata，lock file 固定完整 resolution graph、來源條件和版本；CI 不應在 lock 存在時無聲重新 resolve。應釘住 Poetry／Python 版本，驗證 lock content、package source／hash、optional group、marker、editable／package mode，並在乾淨 runner／容器做安裝與 artifact manifest 比對。多個支援 Python 版本要在矩陣中執行 collection、import smoke、static check、unit／integration suite；若 lock drift、私有來源或 package mode 造成差異，要回滾到已驗證的 lock／artifact，而不是放寬版本範圍。

第一階段先恢復可觀測與可相信：保存首次失敗、固定版本與設定、暫時限制並行度但不跳過測試，對 fixture、socket、task、transaction、collection 和 coverage include／omit 加檢查；若首次失敗保留率下降、flake、duration、pending task 或 open handle 超過門檻，就停止 rollout 並回到前一個 runner／lock artifact。故障注入至少包括測試中斷、async cancellation、慢下游、transaction rollback 和依賴安裝失敗。

第二階段修正根因：縮小可變 fixture scope、建立可重置 namespace、修正 patch where used、加入 autospec、具名參數化案例和真實 integration／contract 測試；移除用 retry 掩蓋的 flaky 原因，建立 async task／connection cleanup。以固定 seed、xdist、隨機順序、慢下游和跨租戶資料混跑驗證；若 production escape、branch gap、flake 或 cleanup 指標沒有改善，回滾測試結構變更而保留診斷資料。

第三階段建立長期交付品質：把 static type check、collection、unit／integration／contract／E2E、branch／changed-code coverage、mutation sampling、Poetry lock verification 和 Python／plugin 矩陣納入分層 CI；以 dependency fingerprint、artifact hash、test duration、flake、resource cleanup 和 deploy smoke 監控趨勢。平行度、worker 數與 cache 只能在證據支持下調整，且每次只改一個主要變因；若 lock drift、API contract、跨租戶錯誤、async leak 或 rollback install 失敗，就停止放量並回到最後一個可驗證 artifact。

## 常見失分點

- 把 `.pyc` 當成完整依賴鎖定或 ABI 相容性的證明，沒有區分編譯／import cache、package artifact 和 runtime contract。
- 說 type hints 會讓 Python 自動變成靜態型別語言，或只靠 static checker 而不測試 duck typing 的實際行為。
- 盲目把 fixture 改成 session scope，忽略可變資料、transaction、cache、event loop 和 teardown 污染。
- 在被測模組錯誤的 namespace patch，或使用沒有 spec 的 Mock 讓 API／async／錯誤簽名漂移。
- 只提高 line coverage、排除難測模組或增加測試數量，沒有 branch、changed code、mutation 和錯誤路徑證據。
- 只測 happy path，沒有 integration／contract、租戶隔離、冪等、慢下游、取消和資源 cleanup。
- 用 retry、sleep、skip 或關閉 warning 掩蓋非決定性，沒有保留首次失敗的 seed、worker 和環境。
- 把 TDD 等同於大量 mock，沒有說明行為契約、重構安全網與外部整合邊界。
- 在 CI 重新 resolve Poetry 依賴、忽略 lock drift、Python marker、optional group、私有來源或 package mode。
- 同時調整 pytest 平行度、依賴版本、coverage gate 和 fixture scope，導致無法歸因或回滾。

## 延伸追問

1. 如果同一個 lock file 必須支援三個 Python minor 版本，但某個依賴只在其中一個版本可用，你會如何設計 marker、CI 矩陣、artifact 與升級策略？
2. 如果 session-scoped 資料庫 fixture 能讓 CI 快兩倍，但 xdist 下偶爾出現跨租戶資料，你會如何保留效能又證明 isolation？
3. 如果 mock client 的測試全部通過，但真實下游在 timeout 後重複扣款，你會如何重新劃分 unit、contract、integration、故障注入和冪等測試？
4. 如果 async test 在 cancellation 後只留下偶發 socket leak，你會如何建立最小重現、觀測 task／connection ownership 並設定停止線？
5. 如果 line coverage 已達 95% 但 mutation score 很低，你會如何調整 quality gate、案例設計與團隊工作流？
6. 如果 `.pyc` 在某 runner 命中而另一個 runner 重新編譯，你會如何證明這是否影響行為、啟動時間或只是正常 cache 差異？
7. 如果 pytest plugin 升級同時改變 fixture hook 與 async loop scope，你會如何做相容矩陣、分批 rollout 和快速回滾？
8. 如果業務要求降低 CI 時間但不能降低信心，你會如何用 test duration、風險分層、並行隔離、快取和 nightly fault／mutation job 做取捨？
