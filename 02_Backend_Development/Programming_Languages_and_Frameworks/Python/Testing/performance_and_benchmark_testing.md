# 性能測試與基準測試

- **難度**: 7
- **重要程度**: 3
- **標籤**: `Performance`, `Benchmark`, `pytest-benchmark`, `Profiling`

## 問題詳述

探討如何在 Python 中進行性能測試和基準測試，使用 pytest-benchmark 等工具測量代碼性能，分析性能瓶頸，以及建立性能回歸測試的策略。

## 核心理論與詳解

### 性能測試的重要性

**性能作為需求**：性能不僅是優化的目標，更是軟體的功能需求之一。關鍵路徑的性能直接影響用戶體驗和系統容量。性能測試確保代碼變更不會引入性能回歸。

**性能回歸**：即使功能正確，代碼變更也可能導致性能下降。沒有性能測試，性能回歸通常很難被發現，直到影響生產環境。

**性能基線**：建立性能基線為代碼優化提供參考點，使性能改進可量化。基線也幫助識別異常的性能變化。

### 基準測試的核心概念

**Benchmark（基準測試）** 是測量代碼執行效率的系統化方法，通過多次重複執行來獲得穩定、可靠的性能指標。基準測試關注執行時間、內存使用、I/O throughput 等指標。

**統計意義**：單次執行時間容易受系統狀態影響，基準測試通過多次測量並應用統計方法來獲得可靠的結果，包括平均值、中位數、標準差等。

**公平比較**：基準測試需要控制變量，確保比較在相同條件下進行。系統負載、CPU 頻率、緩存狀態都可能影響結果。

### pytest-benchmark 工具

**核心功能**：pytest-benchmark 是 pytest 的性能測試插件，提供了便捷的 API 來測量代碼執行時間，自動處理預熱、重複執行和統計分析。

**benchmark Fixture**：pytest-benchmark 提供 `benchmark` fixture，用於包裹要測量的代碼。它自動處理多輪執行和結果統計。

**校準機制**：工具會自動校準，決定執行多少次迭代才能獲得穩定的結果。快速的代碼會執行更多次，慢速代碼執行較少次。

**報告格式**：提供詳細的性能報告，包括最小值、最大值、平均值、中位數、標準差等統計信息。支持多種輸出格式和可視化。

### 性能指標

**執行時間**：最直觀的性能指標，包括牆上時間（wall time）和 CPU 時間。牆上時間反映用戶感知的延遲，CPU 時間反映實際計算量。

**吞吐量（Throughput）**：單位時間內處理的操作數或數據量。對於服務器應用，吞吐量是關鍵指標。

**內存使用**：包括峰值內存和內存分配次數。Python 的垃圾回收機制使內存分析變得複雜。

**延遲分布**：平均延遲之外，P50、P95、P99 等百分位數能更好地反映用戶體驗，特別是尾延遲。

### 性能分析工具

**cProfile**：Python 標準庫的性能分析器，提供函數級別的執行時間統計。適合找出熱點函數。

**line_profiler**：逐行分析代碼執行時間，幫助精確定位性能瓶頸。需要顯式標記要分析的函數。

**memory_profiler**：逐行分析內存使用，識別內存泄漏和內存密集操作。

**py-spy**：採樣式分析器，對運行中的程序影響最小，適合生產環境。能生成火焰圖（Flame Graph）。

### 基準測試的最佳實踐

**隔離測試環境**：在安靜的系統環境中運行基準測試，關閉不必要的後台程序。使用專門的 CI runner 或在相同硬件上重複測試。

**預熱（Warm-up）**：第一次執行通常較慢，因為需要加載代碼、初始化緩存等。pytest-benchmark 自動處理預熱。

**足夠的樣本量**：執行足夠多次以獲得統計意義。pytest-benchmark 根據執行時間自動調整迭代次數。

**測試有意義的場景**：基準測試應該反映真實使用場景，包括典型的數據規模和操作模式。微基準（micro-benchmark）容易誤導。

**版本控制性能數據**：將基準測試結果存儲在版本控制中，追蹤性能演變歷史。

### 比較和回歸測試

**建立基線**：在優化前運行基準測試建立基線，優化後對比結果量化改進效果。

**性能回歸檢測**：在 CI 中運行基準測試，與之前的結果比較。當性能下降超過閾值時，測試失敗。

**相對比較**：比較不同實現的性能，例如不同算法、數據結構或庫的選擇。使用相同的測試環境確保公平。

### 常見的性能陷阱

**過早優化**：Don't optimize before measuring。先通過分析確定瓶頸，再針對性優化。盲目優化可能浪費時間且使代碼複雜化。

**微基準誤導**：微基準測試的人工場景可能與實際使用不符。總是在真實場景中驗證優化效果。

**GC 影響**：Python 的垃圾回收會不規律地影響性能。長時間運行或重複測試中，GC 的影響會被平攤。

**I/O 瓶頸**：很多性能問題來自 I/O（網絡、磁盤、數據庫）而非計算。優化計算密集部分前，先排查 I/O。

### 性能測試的層次

**單元性能測試**：測試單個函數或方法的性能。適合驗證算法效率和優化效果。

**組件性能測試**：測試模塊或組件的性能，包括多個函數的交互。更接近實際使用。

**系統性能測試**：測試整個系統的性能，包括所有依賴。通常使用 Load Testing 工具（如 Locust、JMeter）。

### 持續性能監控

**CI 集成**：將基準測試集成到 CI 流程，每次提交都運行性能測試。使用專用的性能測試環境確保結果穩定。

**趨勢追蹤**：記錄每次構建的性能指標，繪製趨勢圖。這幫助識別性能逐漸退化的問題。

**性能預算**：為關鍵操作設定性能預算（如"用戶註冊必須在 200ms 內完成"）。當超出預算時，構建失敗。

## 程式碼範例

```python
import pytest
from myapp.algorithms import binary_search, linear_search
from myapp.data_structures import CustomDict, StandardDict


# 基本的基準測試
def test_binary_search_performance(benchmark):
    """測試二分搜索性能"""
    data = list(range(10000))
    target = 5000
    
    # benchmark 會自動運行多次並統計結果
    result = benchmark(binary_search, data, target)
    
    assert result == 5000


# 使用 benchmark 的調用語法
def test_function_with_args(benchmark):
    """測試帶參數的函數"""
    def setup():
        return ([1, 2, 3, 4, 5], 3), {}
    
    result = benchmark.pedantic(
        linear_search,
        setup=setup,
        rounds=100,
        iterations=10
    )
    assert result == 2


# 比較不同實現的性能
@pytest.mark.parametrize("search_func", [binary_search, linear_search])
def test_search_algorithms_comparison(benchmark, search_func):
    """比較不同搜索算法的性能"""
    data = list(range(1000))
    target = 500
    
    result = benchmark(search_func, data, target)
    assert result == 500


# 測試數據結構性能
def test_dict_insert_performance(benchmark):
    """測試字典插入性能"""
    d = {}
    
    def insert_items():
        for i in range(1000):
            d[i] = i * 2
    
    benchmark(insert_items)
    assert len(d) == 1000


# 測試內存密集操作
def test_large_list_creation(benchmark):
    """測試大列表創建"""
    def create_list():
        return [i for i in range(100000)]
    
    result = benchmark(create_list)
    assert len(result) == 100000


# 使用 setup 和 teardown
def test_with_setup_and_teardown(benchmark):
    """包含 setup 和 teardown 的基準測試"""
    # Setup：準備測試數據（不計入測試時間）
    def setup():
        data = list(range(10000))
        return (data,), {}
    
    # Teardown：清理資源（不計入測試時間）
    def teardown(args):
        del args[0]
    
    benchmark.pedantic(
        sorted,
        setup=setup,
        teardown=teardown,
        rounds=50
    )


# 性能回歸測試
def test_critical_path_performance(benchmark):
    """關鍵路徑的性能回歸測試"""
    from myapp.services import OrderService
    
    service = OrderService()
    
    def process_order():
        return service.create_order(user_id=1, items=[1, 2, 3])
    
    # 設置性能要求：必須在 100ms 內完成
    stats = benchmark(process_order)
    assert stats.stats.mean < 0.1, "訂單處理超時"


# 使用 cProfile 進行詳細分析
def test_with_profiling():
    """使用 cProfile 分析性能"""
    import cProfile
    import pstats
    from io import StringIO
    
    profiler = cProfile.Profile()
    profiler.enable()
    
    # 執行要分析的代碼
    result = complex_computation()
    
    profiler.disable()
    
    # 獲取統計信息
    s = StringIO()
    stats = pstats.Stats(profiler, stream=s)
    stats.sort_stats('cumulative')
    stats.print_stats(10)  # 打印前 10 個最耗時的函數
    
    print(s.getvalue())


# 使用 pytest-benchmark 的高級功能
def test_advanced_benchmark(benchmark):
    """高級基準測試配置"""
    result = benchmark.pedantic(
        expensive_operation,
        args=(100,),
        kwargs={'mode': 'fast'},
        rounds=50,          # 運行 50 輪
        iterations=10,      # 每輪 10 次迭代
        warmup_rounds=5     # 5 輪預熱
    )
    assert result is not None


# 組合測試：功能 + 性能
def test_functionality_and_performance(benchmark):
    """同時測試功能正確性和性能"""
    def operation():
        result = compute_fibonacci(100)
        assert result > 0  # 驗證功能
        return result
    
    benchmark(operation)


# 比較優化前後的性能
class TestOptimization:
    """測試優化效果"""
    
    def test_unoptimized_version(self, benchmark):
        """未優化版本的基準"""
        benchmark(unoptimized_function, 10000)
    
    def test_optimized_version(self, benchmark):
        """優化版本的基準"""
        benchmark(optimized_function, 10000)
    
    # 運行後比較兩個測試的結果


# 內存使用測試（使用 memory_profiler）
@pytest.mark.skip("需要 memory_profiler 庫")
def test_memory_usage():
    """測試內存使用"""
    from memory_profiler import profile
    
    @profile
    def memory_intensive_function():
        large_list = [i for i in range(1000000)]
        return sum(large_list)
    
    result = memory_intensive_function()
    assert result > 0


# 性能測試配置（pytest.ini 或 pyproject.toml）
"""
[tool.pytest.ini_options]
# 基準測試配置
benchmark_min_rounds = 5
benchmark_max_time = 1.0
benchmark_min_time = 0.000005
benchmark_warmup = true

# 保存基準測試結果
benchmark_save = "benchmark_results"
benchmark_autosave = true

# 比較結果
benchmark_compare = "0001"
benchmark_compare_fail = "mean:10%"  # 平均時間變慢 10% 時失敗
"""


# 生成性能報告
"""
# 運行基準測試並保存結果
pytest tests/test_performance.py --benchmark-only --benchmark-save=baseline

# 與之前的結果比較
pytest tests/test_performance.py --benchmark-only --benchmark-compare=baseline

# 生成 HTML 報告
pytest tests/test_performance.py --benchmark-only --benchmark-histogram

# 只運行基準測試（跳過常規測試）
pytest --benchmark-only

# 跳過基準測試（只運行常規測試）
pytest --benchmark-skip

# 設置性能閾值
pytest --benchmark-only --benchmark-max-time=0.1
"""


# 實際案例：優化數據處理
def test_data_processing_performance(benchmark):
    """測試數據處理性能"""
    import pandas as pd
    
    # 準備測試數據
    df = pd.DataFrame({
        'A': range(10000),
        'B': range(10000, 20000),
        'C': range(20000, 30000)
    })
    
    def process_data():
        # 執行數據處理操作
        result = df['A'] + df['B'] * df['C']
        return result.sum()
    
    total = benchmark(process_data)
    assert total > 0


# 異步代碼的性能測試
@pytest.mark.asyncio
async def test_async_performance(benchmark):
    """測試異步代碼性能"""
    import asyncio
    
    async def async_operation():
        await asyncio.sleep(0.001)
        return sum(range(1000))
    
    # pytest-benchmark 支持異步函數
    result = await benchmark(async_operation)
    assert result > 0


# 負載測試集成示例
def test_api_load():
    """簡單的 API 負載測試"""
    import requests
    import time
    
    url = "http://localhost:8000/api/endpoint"
    num_requests = 100
    
    start_time = time.time()
    
    responses = []
    for _ in range(num_requests):
        response = requests.get(url)
        responses.append(response.status_code == 200)
    
    end_time = time.time()
    duration = end_time - start_time
    
    # 計算 RPS（每秒請求數）
    rps = num_requests / duration
    
    print(f"RPS: {rps:.2f}")
    print(f"Success rate: {sum(responses) / len(responses) * 100:.2f}%")
    
    assert rps > 10, "RPS too low"
    assert sum(responses) == num_requests, "Some requests failed"
```

## 相關主題

- [單元測試最佳實踐](./unit_testing_best_practices.md)
- [pytest 框架深入解析](./pytest_framework.md)
- [Python 性能優化](../Core/performance_optimization.md)
