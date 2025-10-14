# 測試覆蓋率與報告

- **難度**: 4
- **重要程度**: 4
- **標籤**: `Coverage`, `pytest-cov`, `Code Quality`

## 問題詳述

探討如何在 Python 中衡量和分析測試覆蓋率，使用 coverage.py 和 pytest-cov 工具生成詳細的覆蓋率報告，以及如何正確理解和使用覆蓋率指標來提升代碼質量。

## 核心理論與詳解

### 測試覆蓋率的概念

**測試覆蓋率（Test Coverage）** 是衡量代碼被測試執行到的程度的指標。它幫助開發者識別未被測試覆蓋的代碼區域，但高覆蓋率並不等同於高質量測試。覆蓋率是一個必要但不充分的質量指標。

### 覆蓋率的類型

**行覆蓋率（Line Coverage）**：最基本的覆蓋率指標，衡量被執行過的代碼行數佔總行數的百分比。這是最常用的覆蓋率類型，容易理解和實現。

**分支覆蓋率（Branch Coverage）**：衡量條件語句（if/else、while、for）中所有分支是否都被執行過。比行覆蓋率更嚴格，能發現邏輯分支中的測試遺漏。例如，`if condition:` 需要測試 True 和 False 兩種情況。

**函數覆蓋率（Function Coverage）**：衡量被調用過的函數佔總函數數的百分比。幫助識別完全未被測試的函數。

**語句覆蓋率（Statement Coverage）**：類似於行覆蓋率，但更關注可執行語句而非物理行。

### coverage.py 核心工具

**coverage.py** 是 Python 生態系統中最廣泛使用的覆蓋率測量工具。它通過監控程序執行過程中哪些代碼被運行來生成覆蓋率數據。

**工作原理**：coverage.py 使用 Python 的 sys.settrace() 機制來追踪代碼執行。它會記錄每一行代碼是否被執行，以及條件語句的分支走向。這種追踪會帶來一定的性能開銷，但對於測試環境來說是可接受的。

**配置文件**：通過 `.coveragerc` 或 `pyproject.toml` 文件可以配置覆蓋率測量的行為，包括要包含或排除的文件、報告格式、覆蓋率閾值等。

### pytest-cov 插件

**pytest-cov** 是 pytest 的覆蓋率插件，它將 coverage.py 無縫集成到 pytest 測試流程中。相比直接使用 coverage.py，pytest-cov 提供了更便捷的命令行接口和更好的 pytest 集成。

**主要優勢**：簡化了覆蓋率測量的命令行調用，支持並行測試的覆蓋率收集，能夠生成多種格式的報告，並可以自動顯示覆蓋率摘要。

### 覆蓋率報告類型

**終端報告（Terminal Report）**：最簡單的報告形式，直接在命令行輸出覆蓋率摘要。顯示每個文件的覆蓋率百分比和未覆蓋的行號。適合快速查看覆蓋率狀況。

**HTML 報告**：生成互動式的網頁報告，可以瀏覽每個文件的詳細覆蓋情況。在 HTML 中，被覆蓋的代碼以綠色高亮，未覆蓋的以紅色高亮，部分覆蓋的分支以黃色標記。這是最直觀和詳細的報告形式。

**XML 報告**：適合與 CI/CD 工具集成，可以被 Jenkins、GitLab CI 等工具解析和展示。常用於自動化流程中。

**JSON 報告**：機器可讀的格式，適合進一步的數據分析和自定義處理。

### 覆蓋率配置策略

**包含與排除規則**：通過配置指定要測量覆蓋率的代碼範圍。通常排除測試代碼本身、遷移文件、配置文件和第三方庫。使用 `omit` 和 `include` 選項控制範圍。

**分支覆蓋配置**：啟用分支覆蓋測量可以更嚴格地檢查測試質量。通過 `branch = True` 配置開啟。

**並行模式**：當使用多進程或多線程運行測試時，需要啟用並行模式（`parallel = True`）來正確收集覆蓋率數據。

### 覆蓋率閾值與質量門控

**最低覆蓋率要求**：通過 `--cov-fail-under` 參數設置最低覆蓋率閾值。當覆蓋率低於閾值時，測試會失敗，這可以作為 CI/CD 的質量門控。

**差異覆蓋率（Diff Coverage）**：只檢查新增或修改代碼的覆蓋率，而不是整個代碼庫。這對於持續改進特別有用，確保新代碼有足夠的測試。

### 覆蓋率的正確理解

**高覆蓋率不等於高質量**：100% 的覆蓋率不代表沒有 bug。測試可能只是執行了代碼，但沒有做有效的斷言。質量測試需要檢查邊界條件、異常情況和業務邏輯。

**關注重要代碼**：不是所有代碼都需要 100% 覆蓋。應該優先保證核心業務邏輯、複雜演算法和容易出錯的部分有高覆蓋率。

**覆蓋率是工具而非目標**：覆蓋率應該用來發現測試盲點，而不是作為唯一的質量指標。它應該與代碼審查、靜態分析等其他質量保證手段結合使用。

### 提升覆蓋率的策略

**識別未覆蓋代碼**：使用 HTML 報告快速定位未覆蓋的代碼行和分支，分析為什麼這些代碼沒有被測試到。

**測試邊界條件**：確保測試包含所有條件分支，包括 if/else、try/except、循環的各種情況。

**使用參數化測試**：通過參數化測試可以用更少的代碼測試更多的場景，提高覆蓋率的同時保持測試的可維護性。

### CI/CD 集成

**自動化覆蓋率檢查**：在 CI 流程中自動運行覆蓋率測試，並將結果展示在合併請求中。許多 CI 工具支持覆蓋率徽章和趨勢圖。

**覆蓋率報告上傳**：將覆蓋率數據上傳到 Codecov、Coveralls 等服務，可以獲得更豐富的覆蓋率分析和歷史趨勢追蹤。

**失敗閾值**：設置覆蓋率閾值作為 CI 的通過條件，防止覆蓋率降低。通常新項目設置 80% 以上，成熟項目可以要求 90% 以上。

## 程式碼範例

```python
# .coveragerc 配置文件示例
[run]
# 啟用分支覆蓋
branch = True

# 測量這些目錄的覆蓋率
source = myapp

# 排除這些文件/目錄
omit =
    */tests/*
    */test_*.py
    */__init__.py
    */migrations/*
    */venv/*
    */virtualenv/*
    setup.py

# 並行模式（用於多進程測試）
parallel = True

[report]
# 報告中排除的行（使用特殊註釋標記）
exclude_lines =
    # 標準排除模式
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
    if __name__ == .__main__.:
    if TYPE_CHECKING:
    @abstractmethod
    @abc.abstractmethod

# 顯示缺失的行號
show_missing = True

# 精確度
precision = 2

[html]
# HTML 報告輸出目錄
directory = htmlcov

[xml]
# XML 報告輸出文件
output = coverage.xml
```

```toml
# pyproject.toml 中的配置示例
[tool.coverage.run]
source = ["myapp"]
branch = true
omit = [
    "*/tests/*",
    "*/migrations/*",
]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "raise NotImplementedError",
    "if TYPE_CHECKING:",
]
show_missing = true
fail_under = 80

[tool.coverage.html]
directory = "htmlcov"
```

```python
# 命令行使用示例

# 基本用法：運行測試並顯示覆蓋率
pytest --cov=myapp tests/

# 生成 HTML 報告
pytest --cov=myapp --cov-report=html tests/

# 生成多種報告格式
pytest --cov=myapp --cov-report=html --cov-report=term --cov-report=xml tests/

# 只顯示覆蓋率，不輸出測試詳情
pytest --cov=myapp --cov-report=term-missing --quiet tests/

# 設置最低覆蓋率閾值（低於 80% 時失敗）
pytest --cov=myapp --cov-fail-under=80 tests/

# 測試特定模塊的覆蓋率
pytest --cov=myapp.services --cov-report=term tests/test_services.py

# 顯示未覆蓋的行號
pytest --cov=myapp --cov-report=term-missing tests/

# 並行運行測試（使用 pytest-xdist）
pytest -n auto --cov=myapp --cov-report=html tests/
```

```python
# 在代碼中使用 pragma 註釋排除覆蓋率

def handle_special_case(value):
    if value == "special":
        # 這是一個很少發生的情況，不需要測試
        log_rare_event()  # pragma: no cover
        return special_handler()
    return normal_handler(value)


class AbstractService:
    def process(self):
        """子類必須實現此方法"""
        raise NotImplementedError  # pragma: no cover


# 排除調試代碼
if __name__ == "__main__":  # pragma: no cover
    # 僅用於手動測試
    main()


# 類型檢查導入（運行時不執行）
from typing import TYPE_CHECKING

if TYPE_CHECKING:  # pragma: no cover
    from myapp.models import User
```

```python
# Makefile 中的覆蓋率目標
.PHONY: test coverage coverage-html coverage-report

# 運行測試
test:
	pytest tests/

# 生成覆蓋率報告（終端）
coverage:
	pytest --cov=myapp --cov-report=term-missing tests/

# 生成 HTML 覆蓋率報告
coverage-html:
	pytest --cov=myapp --cov-report=html tests/
	@echo "Coverage report generated in htmlcov/index.html"

# 完整的覆蓋率檢查（包含閾值）
coverage-check:
	pytest --cov=myapp --cov-report=term --cov-fail-under=80 tests/

# 打開 HTML 報告（macOS）
coverage-open: coverage-html
	open htmlcov/index.html
```

```yaml
# GitHub Actions CI 配置示例
name: Tests with Coverage

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-cov
    
    - name: Run tests with coverage
      run: |
        pytest --cov=myapp --cov-report=xml --cov-report=term
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml
        fail_ci_if_error: true
    
    - name: Check coverage threshold
      run: |
        pytest --cov=myapp --cov-fail-under=80 tests/
```

## 相關主題

- [pytest 框架深入解析](./pytest_framework.md)
- [單元測試最佳實踐](./unit_testing_best_practices.md)
- [集成測試策略](./integration_testing.md)
