# Django Signal 系統

- **難度**: 7
- **重要性**: 4
- **標籤**: `Signal`, `Event`, `Decoupling`

## 問題詳述

Django 的 Signal 系統是一種通知機制，允許應用的不同部分在特定事件發生時接收通知並執行相應的操作，實現鬆耦合的架構設計。

## 核心理論與詳解

### Signal 的基本概念

Django Signal 是基於**觀察者模式**的實現，提供了一種在特定事件發生時自動觸發回調函數的機制。Signal 系統由三個核心元素組成：

- **發送者 (Sender)**：觸發信號的對象或模型
- **信號 (Signal)**：事件的抽象表示
- **接收者 (Receiver)**：處理信號的回調函數

### Django 內建信號

#### 模型信號 (Model Signals)

Django 為模型的生命週期提供了多個內建信號：

- **`pre_save`**: 模型的 `save()` 方法調用之前
- **`post_save`**: 模型的 `save()` 方法調用之後
- **`pre_delete`**: 模型的 `delete()` 方法調用之前
- **`post_delete`**: 模型的 `delete()` 方法調用之後
- **`m2m_changed`**: ManyToMany 關係改變時

#### 請求/響應信號 (Request/Response Signals)

- **`request_started`**: Django 開始處理 HTTP 請求時
- **`request_finished`**: Django 完成 HTTP 請求處理後

#### 資料庫信號

- **`pre_migrate`**: 執行 migrate 命令之前
- **`post_migrate`**: 執行 migrate 命令之後

### Signal 的工作原理

當事件發生時，Django 會遍歷所有註冊的接收者並按順序調用它們。Signal 系統使用 **弱引用 (weak references)** 來存儲接收者，防止記憶體洩漏。

### 註冊接收者的方式

#### 方式一：使用裝飾器

```python
from django.db.models.signals import post_save
from django.dispatch import receiver
from myapp.models import User

@receiver(post_save, sender=User)
def user_saved_handler(sender, instance, created, **kwargs):
    if created:
        # 新用戶創建時的處理邏輯
        send_welcome_email(instance.email)
```

#### 方式二：手動連接

```python
from django.db.models.signals import post_save
from myapp.models import User

def user_saved_handler(sender, instance, created, **kwargs):
    if created:
        send_welcome_email(instance.email)

# 在 AppConfig.ready() 中註冊
post_save.connect(user_saved_handler, sender=User)
```

### Signal 的參數

接收者函數通常接收以下參數：

- **`sender`**: 發送信號的模型類
- **`instance`**: 實際的模型實例
- **`created`** (僅 post_save): 布爾值，表示是否為新創建的對象
- **`**kwargs`**: 其他關鍵字參數，保持向後兼容性

### 自定義信號

除了使用內建信號，也可以創建自定義信號：

```python
from django.dispatch import Signal

# 定義自定義信號
payment_completed = Signal()

# 發送信號
payment_completed.send(sender=self.__class__, order=order, amount=amount)

# 註冊接收者
@receiver(payment_completed)
def handle_payment_completed(sender, order, amount, **kwargs):
    # 處理支付完成邏輯
    send_invoice(order, amount)
```

### Signal 的優缺點

#### 優點

1. **鬆耦合**：發送者和接收者之間沒有直接依賴關係
2. **可擴展性**：可以輕鬆添加新的接收者而無需修改原有代碼
3. **關注點分離**：將副作用邏輯與核心業務邏輯分離
4. **多個處理器**：同一信號可以有多個接收者

#### 缺點

1. **隱式行為**：信號的執行不明顯，增加了代碼追蹤難度
2. **調試困難**：當出現問題時，難以確定是哪個接收者導致的
3. **性能影響**：過多的信號處理器會影響性能
4. **事務問題**：信號在同一事務中執行，可能導致意外的回滾
5. **測試複雜度**：需要確保信號在測試中正確觸發

### 使用 Signal 的最佳實踐

#### 1. 在 AppConfig.ready() 中註冊

```python
# apps.py
from django.apps import AppConfig

class MyAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'myapp'
    
    def ready(self):
        import myapp.signals  # 導入信號模塊
```

#### 2. 避免在信號中執行耗時操作

信號處理器應該盡量輕量，耗時操作應該使用異步任務隊列（如 Celery）：

```python
from myapp.tasks import send_welcome_email_task

@receiver(post_save, sender=User)
def user_saved_handler(sender, instance, created, **kwargs):
    if created:
        # 使用異步任務
        send_welcome_email_task.delay(instance.id)
```

#### 3. 小心處理事務

Signal 在資料庫事務中執行，如果事務回滾，signal 中的操作可能已經執行：

```python
from django.db import transaction

@receiver(post_save, sender=Order)
def order_saved_handler(sender, instance, created, **kwargs):
    # 使用 on_commit 確保事務提交後才執行
    transaction.on_commit(lambda: send_order_confirmation(instance.id))
```

#### 4. 使用 sender 參數限制範圍

避免全局監聽，明確指定 sender：

```python
# 好的做法
@receiver(post_save, sender=User)
def handle_user_save(sender, instance, **kwargs):
    pass

# 不好的做法 - 會監聽所有模型
@receiver(post_save)
def handle_any_save(sender, instance, **kwargs):
    pass
```

#### 5. 考慮使用替代方案

並非所有情況都適合使用 Signal，有時其他方案更合適：

- **簡單的邏輯**：直接在模型的 `save()` 方法中處理
- **複雜的業務邏輯**：使用 Service Layer 或 Manager 方法
- **異步處理**：使用任務隊列（Celery, RQ）
- **資料一致性要求高**：使用資料庫觸發器或事務

### 常見使用場景

1. **用戶註冊**：發送歡迎郵件、創建用戶配置文件
2. **審計日誌**：記錄模型的變更歷史
3. **緩存失效**：當模型更新時清除相關緩存
4. **搜索索引**：更新 Elasticsearch 等搜索引擎的索引
5. **通知系統**：觸發系統通知或推送
6. **數據同步**：同步數據到其他系統或服務

### Signal vs 其他模式

| 特性 | Signal | 重寫 save() | Service Layer |
|------|--------|-------------|---------------|
| 耦合度 | 低 | 中 | 低 |
| 明確性 | 低 | 高 | 高 |
| 可測試性 | 中 | 高 | 高 |
| 靈活性 | 高 | 中 | 高 |
| 性能 | 中 | 高 | 高 |

## 程式碼範例

```python
# signals.py
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.core.cache import cache
from django.db import transaction
from .models import Article, Comment
from .tasks import update_search_index

@receiver(post_save, sender=Article)
def article_saved(sender, instance, created, **kwargs):
    """文章保存後的處理"""
    if created:
        # 新文章創建時發送通知
        transaction.on_commit(
            lambda: notify_followers(instance.author_id, instance.id)
        )
    
    # 清除相關緩存
    cache_key = f'article:{instance.id}'
    cache.delete(cache_key)
    
    # 更新搜索索引（異步）
    update_search_index.delay('article', instance.id)

@receiver(post_save, sender=Comment)
def comment_saved(sender, instance, created, **kwargs):
    """評論保存後更新文章的評論計數"""
    if created:
        article = instance.article
        article.comment_count = article.comments.count()
        article.save(update_fields=['comment_count'])

@receiver(pre_delete, sender=Article)
def article_deleting(sender, instance, **kwargs):
    """文章刪除前的清理工作"""
    # 清除緩存
    cache_key = f'article:{instance.id}'
    cache.delete(cache_key)
    
    # 記錄審計日誌
    AuditLog.objects.create(
        action='delete',
        model_name='Article',
        object_id=instance.id,
        user=get_current_user()
    )
```

## 總結

Django Signal 是一個強大的工具，適合處理鬆耦合的事件驅動邏輯。然而，它不應被濫用，在使用前應該評估是否有更簡單、更明確的替代方案。對於需要保證事務一致性或需要明確控制流程的場景，應該考慮其他設計模式。
