# Python 測試 (Testing in Python)

本節涵蓋了 Python 生態系統中的測試方法、框架和最佳實踐。測試是確保代碼質量和可維護性的關鍵環節，對於資深後端工程師來說是必備技能。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [pytest 框架深入解析](./pytest_framework.md) | 6 | 5 | `pytest`, `Testing`, `Fixtures` |
| 2 | [單元測試最佳實踐](./unit_testing_best_practices.md) | 5 | 5 | `Unit Test`, `Best Practices` |
| 3 | [Mock 與 Patch 技巧](./mocking_and_patching.md) | 7 | 5 | `Mock`, `unittest.mock`, `Patching` |
| 4 | [測試覆蓋率與報告](./test_coverage.md) | 4 | 4 | `Coverage`, `pytest-cov` |
| 5 | [參數化測試](./parametrized_testing.md) | 5 | 4 | `Parametrize`, `Data-Driven` |
| 6 | [集成測試策略](./integration_testing.md) | 7 | 5 | `Integration Test`, `Test Strategy` |
| 7 | [測試固件與依賴注入](./fixtures_and_dependency_injection.md) | 6 | 4 | `Fixtures`, `DI`, `Setup/Teardown` |
| 8 | [異步代碼測試](./testing_async_code.md) | 8 | 4 | `Async`, `asyncio`, `pytest-asyncio` |
| 9 | [測試驅動開發 (TDD)](./test_driven_development.md) | 6 | 4 | `TDD`, `Development Practice` |
| 10 | [性能測試與基準測試](./performance_and_benchmark_testing.md) | 7 | 3 | `Performance`, `Benchmark`, `pytest-benchmark` |

---

## 學習建議

1. **掌握 pytest**：pytest 是 Python 最流行的測試框架，務必精通其核心功能和插件生態
2. **理解 Mock 技術**：學會使用 mock 隔離外部依賴，編寫獨立的單元測試
3. **提高覆蓋率**：追求高測試覆蓋率，但更要注重測試質量
4. **實踐 TDD**：養成測試先行的開發習慣，提升代碼設計能力
5. **整合 CI/CD**：將測試整合到持續集成流程中

