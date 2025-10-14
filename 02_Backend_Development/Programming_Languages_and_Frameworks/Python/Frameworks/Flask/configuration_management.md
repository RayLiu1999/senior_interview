# Flask 配置管理

- **難度**: 5
- **重要性**: 4
- **標籤**: `Configuration`, `Config`, `Environment`

## 問題詳述

解釋 Flask 的配置管理機制，包括配置加載方式、環境變量管理、多環境配置以及配置最佳實踐。

## 核心理論與詳解

### Flask 配置基礎

Flask 使用 `app.config` 字典對象存儲配置，支持多種配置加載方式。

**基本使用**
```python
from flask import Flask

app = Flask(__name__)

# 直接設置
app.config['DEBUG'] = True
app.config['SECRET_KEY'] = 'your-secret-key'

# 批量更新
app.config.update(
    DEBUG=True,
    TESTING=False,
    SECRET_KEY='your-secret-key'
)
```

### 配置加載方式

**1. 從對象加載**
```python
class Config:
    DEBUG = False
    TESTING = False
    SECRET_KEY = 'your-secret-key'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'

app.config.from_object(Config)
```

**2. 從 Python 文件加載**
```python
# config.py
DEBUG = True
SECRET_KEY = 'dev-secret-key'

# 加載
app.config.from_pyfile('config.py')
```

**3. 從環境變量加載**
```python
import os

app.config.from_mapping(
    SECRET_KEY=os.environ.get('SECRET_KEY', 'dev-key'),
    DATABASE_URI=os.environ['DATABASE_URL']
)
```

**4. 從 JSON 文件加載**
```python
app.config.from_file('config.json', load=json.load)
```

### 多環境配置

**配置類繼承**
```python
class Config:
    """基礎配置"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'default-secret-key'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    @staticmethod
    def init_app(app):
        pass

class DevelopmentConfig(Config):
    """開發環境配置"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///dev.db'

class ProductionConfig(Config):
    """生產環境配置"""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    
    @staticmethod
    def init_app(app):
        # 生產環境初始化邏輯
        import logging
        file_handler = logging.FileHandler('app.log')
        app.logger.addHandler(file_handler)

class TestingConfig(Config):
    """測試環境配置"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

# 使用
def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    return app
```

### 使用環境變量

**python-dotenv 集成**
```python
from flask import Flask
from dotenv import load_dotenv

load_dotenv()  # 加載 .env 文件

app = Flask(__name__)
app.config.from_prefixed_env()  # 加載 FLASK_ 前綴的環境變量
```

**.env 文件**
```bash
FLASK_APP=app.py
FLASK_ENV=development
FLASK_SECRET_KEY=dev-secret-key
FLASK_DATABASE_URL=postgresql://localhost/mydb
```

### 配置驗證

```python
def validate_config(app):
    required_config = ['SECRET_KEY', 'DATABASE_URI']
    
    for key in required_config:
        if not app.config.get(key):
            raise ValueError(f"配置項 {key} 未設置")

@app.before_first_request
def check_config():
    validate_config(app)
```

### 實例配置

**instance 文件夾（不納入版本控制）**
```python
app = Flask(__name__, instance_relative_config=True)

# 先加載默認配置
app.config.from_object('config.default')

# 覆蓋實例配置（如果存在）
app.config.from_pyfile('config.py', silent=True)
```

### 配置最佳實踐

**1. 敏感信息使用環境變量**
```python
import os

class ProductionConfig:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    DATABASE_URL = os.environ.get('DATABASE_URL')
    
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY 環境變量未設置")
```

**2. 使用配置類繼承**
- 基礎配置作為父類
- 環境特定配置繼承並覆蓋

**3. 配置文件分離**
```
config/
    ├── __init__.py
    ├── development.py
    ├── production.py
    └── testing.py
```

**4. 默認值處理**
```python
app.config.setdefault('DEBUG', False)
app.config.setdefault('MAX_CONTENT_LENGTH', 16 * 1024 * 1024)  # 16MB
```

**5. 配置文檔化**
```python
class Config:
    """應用配置
    
    環境變量：
    - SECRET_KEY: 應用密鑰（必需）
    - DATABASE_URL: 數據庫連接字符串（必需）
    - DEBUG: 調試模式（可選，默認 False）
    """
    pass
```

## 關鍵要點

Flask 提供靈活的配置管理機制，支持從對象、文件、環境變量等多種來源加載配置。使用配置類繼承可以優雅地管理多環境配置（開發、測試、生產）。最佳實踐包括敏感信息使用環境變量、配置驗證、使用 instance 文件夾存儲本地配置、以及配置文檔化。python-dotenv 可以簡化環境變量管理。合理的配置管理是構建可維護、可部署應用的基礎。
