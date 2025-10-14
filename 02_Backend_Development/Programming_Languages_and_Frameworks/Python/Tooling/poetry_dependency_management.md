# Poetry 現代依賴管理

- **難度**: 5
- **標籤**: `Poetry`, `Dependency`, `Lock File`

## 問題詳述

Poetry 是 Python 的現代依賴管理和打包工具。相比傳統的 pip + requirements.txt，Poetry 提供了哪些優勢和功能？

## 核心理論與詳解

### Poetry 簡介

**什麼是 Poetry？**
- Python 的依賴管理和打包工具
- 靈感來自 Node.js 的 npm/yarn、Rust 的 Cargo
- 提供確定性構建和依賴解析
- 簡化項目管理工作流

**核心優勢**
- 統一的項目配置文件 (`pyproject.toml`)
- 自動依賴解析和衝突檢測
- 鎖文件機制保證可重現構建
- 內置虛擬環境管理
- 簡化的發布流程

### pyproject.toml

**PEP 518 標準**
- Python 官方推薦的項目配置格式
- 使用 TOML 格式（Tom's Obvious, Minimal Language）
- 取代 setup.py、requirements.txt、MANIFEST.in 等

**基本結構**
```toml
[tool.poetry]
name = "myproject"
version = "0.1.0"
description = "My awesome project"
authors = ["Your Name <you@example.com>"]

[tool.poetry.dependencies]
python = "^3.8"
requests = "^2.28.0"
django = "~4.2.0"

[tool.poetry.dev-dependencies]
pytest = "^7.0"
black = "^23.0"

[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"
```

### 版本約束語法

**常用運算符**
- `^` (Caret)：允許不破壞 API 的更新
  - `^1.2.3` 等同於 `>=1.2.3 <2.0.0`
  - `^0.2.3` 等同於 `>=0.2.3 <0.3.0`
  - `^0.0.3` 等同於 `>=0.0.3 <0.0.4`

- `~` (Tilde)：允許最後一位數字更新
  - `~1.2.3` 等同於 `>=1.2.3 <1.3.0`
  - `~1.2` 等同於 `>=1.2.0 <1.3.0`

- `*`：通配符，任意版本

- 精確版本：`==1.2.3`

- 範圍：`>=1.2.3,<2.0.0`

### poetry.lock 鎖文件

**作用**
- 記錄所有依賴的精確版本
- 包括傳遞依賴
- 確保團隊成員和 CI/CD 使用相同的依賴版本

**何時更新**
- 添加或刪除依賴：自動更新
- 手動更新：`poetry update`
- 更新特定包：`poetry update package-name`

**提交策略**
- 應該將 `poetry.lock` 提交到版本控制
- 保證可重現的構建
- 庫項目可以不提交（由使用者決定版本）

### 常用命令

**初始化項目**
```bash
# 創建新項目
poetry new myproject

# 在現有項目中初始化
poetry init
```

**依賴管理**
```bash
# 添加依賴
poetry add requests
poetry add pytest --group dev  # 開發依賴

# 移除依賴
poetry remove requests

# 安裝所有依賴
poetry install

# 只安裝生產依賴
poetry install --no-dev

# 更新依賴
poetry update                  # 更新所有
poetry update requests         # 更新特定包
```

**虛擬環境**
```bash
# Poetry 自動創建和管理虛擬環境

# 運行命令
poetry run python script.py
poetry run pytest

# 啟動 shell
poetry shell

# 查看環境信息
poetry env info

# 使用特定 Python 版本
poetry env use python3.10
```

**打包和發布**
```bash
# 構建
poetry build

# 發布到 PyPI
poetry publish

# 發布到私有倉庫
poetry publish -r my-repo
```

### 依賴組

**組織依賴**
```toml
[tool.poetry.dependencies]
python = "^3.8"
requests = "^2.28.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.0"
black = "^23.0"

[tool.poetry.group.docs.dependencies]
sphinx = "^6.0"
```

**安裝特定組**
```bash
poetry install --with docs
poetry install --without dev
poetry install --only dev
```

### 插件生態

**常用插件**
- `poetry-plugin-export`：導出 requirements.txt
- `poetry-dynamic-versioning`：動態版本號
- `poetry-plugin-up`：升級依賴

**使用插件**
```bash
# 安裝插件
poetry self add poetry-plugin-export

# 導出 requirements.txt
poetry export -f requirements.txt -o requirements.txt
```

### 配置管理

**全局配置**
```bash
# 查看配置
poetry config --list

# 設置 PyPI 鏡像
poetry config repositories.aliyun https://mirrors.aliyun.com/pypi/simple/

# 禁用虛擬環境創建（使用系統環境）
poetry config virtualenvs.create false

# 在項目目錄創建虛擬環境
poetry config virtualenvs.in-project true
```

**項目配置**
```toml
[tool.poetry.config]
virtualenvs.in-project = true
```

### 與其他工具比較

**Poetry vs pip + requirements.txt**
- Poetry：統一工具、依賴解析、鎖文件
- pip：簡單、廣泛支持、靈活

**Poetry vs Pipenv**
- Poetry：更快、更好的依賴解析
- Pipenv：官方推薦、更成熟

**Poetry vs Conda**
- Poetry：純 Python、輕量
- Conda：跨語言、科學計算生態

### 最佳實踐

1. **提交 poetry.lock**：保證可重現構建
2. **使用依賴組**：區分生產和開發依賴
3. **合理使用版本約束**：平衡穩定性和更新
4. **定期更新依賴**：修復安全漏洞
5. **使用 pre-commit hooks**：自動格式化和檢查
6. **CI/CD 緩存**：緩存虛擬環境加速構建

### 常見問題

**依賴衝突**
- Poetry 會自動檢測並報告衝突
- 調整版本約束解決衝突

**安裝速度慢**
- 使用國內鏡像
- 啟用並行安裝（默認開啟）

**虛擬環境管理**
- Poetry 默認在系統目錄創建虛擬環境
- 可配置在項目目錄創建

## 程式碼範例

```toml
# pyproject.toml 完整示例
[tool.poetry]
name = "myapp"
version = "0.1.0"
description = "A sample Python application"
authors = ["Your Name <you@example.com>"]
readme = "README.md"
homepage = "https://github.com/user/myapp"
repository = "https://github.com/user/myapp"
keywords = ["sample", "application"]
classifiers = [
    "Development Status :: 3 - Alpha",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3.8",
]

[tool.poetry.dependencies]
python = "^3.8"
fastapi = "^0.104.0"
uvicorn = {extras = ["standard"], version = "^0.24.0"}
sqlalchemy = "^2.0.0"
pydantic = "^2.0.0"
redis = {version = "^5.0.0", optional = true}

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
pytest-cov = "^4.1.0"
pytest-asyncio = "^0.21.0"
black = "^23.0.0"
isort = "^5.12.0"
mypy = "^1.5.0"
flake8 = "^6.1.0"
pre-commit = "^3.4.0"

[tool.poetry.group.docs.dependencies]
sphinx = "^7.0.0"
sphinx-rtd-theme = "^1.3.0"

[tool.poetry.extras]
redis = ["redis"]
all = ["redis"]

[tool.poetry.scripts]
myapp = "myapp.cli:main"

[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"

# Black 配置
[tool.black]
line-length = 88
target-version = ['py38']
include = '\.pyi?$'

# isort 配置
[tool.isort]
profile = "black"
multi_line_output = 3

# mypy 配置
[tool.mypy]
python_version = "3.8"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true

# pytest 配置
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = "-v --cov=myapp --cov-report=term-missing"
```

```bash
# 完整工作流示例

# 1. 創建新項目
poetry new myapp
cd myapp

# 2. 添加依賴
poetry add fastapi uvicorn[standard]
poetry add pytest pytest-cov --group dev

# 3. 安裝項目
poetry install

# 4. 運行應用
poetry run uvicorn myapp.main:app --reload

# 5. 運行測試
poetry run pytest

# 6. 運行代碼格式化
poetry run black .
poetry run isort .

# 7. 類型檢查
poetry run mypy myapp

# 8. 更新依賴
poetry update

# 9. 導出 requirements.txt（用於 Docker 等）
poetry export -f requirements.txt -o requirements.txt --without-hashes

# 10. 構建和發布
poetry build
poetry publish
```

## 相關資源

- [Poetry 官方文檔](https://python-poetry.org/docs/)
- [PEP 518 - pyproject.toml](https://peps.python.org/pep-0518/)
- [Poetry vs Pipenv](https://python-poetry.org/docs/faq/#what-is-the-difference-between-poetry-and-pipenv)
