# Python 工具鏈 (Python Tooling)

本節涵蓋 Python 生態系統中的依賴管理、打包、虛擬環境和開發工具。掌握這些工具對於專業的 Python 開發至關重要。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [pip 與 PyPI 套件管理](./pip_and_pypi.md) | 3 | 5 | `pip`, `PyPI`, `Package Management` |
| 2 | [虛擬環境：venv vs virtualenv](./virtual_environments.md) | 4 | 5 | `venv`, `virtualenv`, `Environment` |
| 3 | [Poetry 現代依賴管理](./poetry_dependency_management.md) | 5 | 4 | `Poetry`, `Dependency`, `Lock File` |
| 4 | [Pipenv 工作流程](./pipenv_workflow.md) | 5 | 3 | `Pipenv`, `Pipfile`, `Workflow` |
| 5 | [requirements.txt 最佳實踐](./requirements_txt_best_practices.md) | 3 | 4 | `requirements.txt`, `Dependencies` |
| 6 | [Python 打包與發布](./packaging_and_distribution.md) | 7 | 4 | `setuptools`, `wheel`, `PyPI` |
| 7 | [pyproject.toml 配置](./pyproject_toml_configuration.md) | 5 | 4 | `pyproject.toml`, `PEP 518`, `Configuration` |
| 8 | [Black 代碼格式化](./black_code_formatter.md) | 3 | 4 | `Black`, `Formatter`, `Code Style` |
| 9 | [Flake8 與 Pylint 代碼檢查](./flake8_and_pylint.md) | 4 | 4 | `Flake8`, `Pylint`, `Linter` |
| 10 | [mypy 靜態類型檢查](./mypy_static_type_checking.md) | 6 | 4 | `mypy`, `Type Checking`, `Type Hints` |
| 11 | [pre-commit Hooks](./pre_commit_hooks.md) | 5 | 4 | `pre-commit`, `Git Hooks`, `CI/CD` |
| 12 | [Tox 多環境測試](./tox_multi_environment_testing.md) | 6 | 3 | `Tox`, `Testing`, `CI` |
| 13 | [Python 版本管理：pyenv](./pyenv_version_management.md) | 4 | 4 | `pyenv`, `Version Management` |
| 14 | [輪子 (Wheel) vs 源碼分發](./wheel_vs_source_distribution.md) | 5 | 3 | `Wheel`, `sdist`, `Distribution` |
| 15 | [Conda 環境管理](./conda_environment_management.md) | 5 | 3 | `Conda`, `Anaconda`, `Data Science` |

---

## 學習建議

1. **掌握基礎工具**：pip、venv 是必須精通的基礎工具
2. **現代化工具鏈**：學習 Poetry 或 Pipenv 提升開發效率
3. **代碼質量**：使用 Black、Flake8、mypy 確保代碼質量
4. **理解打包**：了解 Python 打包機制對於發布開源項目很重要
5. **CI/CD 整合**：將工具整合到持續集成流程中
