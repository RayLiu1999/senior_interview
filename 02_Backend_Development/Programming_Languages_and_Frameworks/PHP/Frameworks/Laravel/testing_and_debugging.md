# Laravel 測試與調試

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Laravel`, `Testing`, `PHPUnit`, `Debugging`, `Quality Assurance`

## 問題詳述

請深入解釋 Laravel 的測試體系和調試工具，包括單元測試、功能測試、瀏覽器測試以及常用的調試技巧。

## 核心理論與詳解

### 1. Laravel 測試架構概述

**測試金字塔**：

```
        /\
       /E2E\       End-to-End Tests (Dusk)
      /------\     少量，慢速，覆蓋完整流程
     /Feature \    Feature Tests (HTTP Tests)
    /----------\   中量，中速，測試 API/路由
   /Unit  Tests \  Unit Tests
  /--------------\ 大量，快速，測試單一函數
```

**測試類型對比**：

| 測試類型 | 測試對象 | 執行速度 | 數據庫 | HTTP |
|----------|----------|----------|--------|------|
| **Unit** | 單一函數/類 | 快 | 不使用 | 不使用 |
| **Feature** | HTTP 請求 | 中 | 可使用 | 使用 |
| **Browser** | 瀏覽器交互 | 慢 | 使用 | 使用 |

### 2. PHPUnit 基礎配置

```xml
<!-- phpunit.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="vendor/autoload.php"
         colors="true">
    <testsuites>
        <testsuite name="Unit">
            <directory suffix="Test.php">./tests/Unit</directory>
        </testsuite>
        <testsuite name="Feature">
            <directory suffix="Test.php">./tests/Feature</directory>
        </testsuite>
    </testsuites>
    <coverage processUncoveredFiles="true">
        <include>
            <directory suffix=".php">./app</directory>
        </include>
    </coverage>
    <php>
        <env name="APP_ENV" value="testing"/>
        <env name="DB_CONNECTION" value="sqlite"/>
        <env name="DB_DATABASE" value=":memory:"/>
        <env name="CACHE_DRIVER" value="array"/>
        <env name="SESSION_DRIVER" value="array"/>
        <env name="QUEUE_CONNECTION" value="sync"/>
    </php>
</phpunit>
```

### 3. 單元測試（Unit Tests）

```php
// tests/Unit/UserTest.php
namespace Tests\Unit;

use App\Models\User;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    /**
     * 測試用戶全名生成
     */
    public function test_full_name_is_generated_correctly()
    {
        $user = new User([
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);
        
        $this->assertEquals('John Doe', $user->full_name);
    }
    
    /**
     * 測試郵箱驗證
     */
    public function test_email_is_validated()
    {
        $user = new User(['email' => 'invalid-email']);
        
        $this->assertFalse($user->isValidEmail());
    }
    
    /**
     * 測試密碼加密
     */
    public function test_password_is_hashed()
    {
        $user = new User();
        $password = 'secret123';
        
        $user->setPassword($password);
        
        $this->assertNotEquals($password, $user->password);
        $this->assertTrue(password_verify($password, $user->password));
    }
}
```

**常用斷言方法**：

```php
// 相等性斷言
$this->assertEquals($expected, $actual);
$this->assertSame($expected, $actual); // 嚴格比較（類型和值）
$this->assertNotEquals($expected, $actual);

// 布爾斷言
$this->assertTrue($condition);
$this->assertFalse($condition);

// Null 斷言
$this->assertNull($value);
$this->assertNotNull($value);

// 數組斷言
$this->assertContains($needle, $haystack);
$this->assertArrayHasKey('key', $array);
$this->assertCount(3, $array);
$this->assertEmpty($array);

// 字符串斷言
$this->assertStringContainsString('substring', $string);
$this->assertStringStartsWith('prefix', $string);
$this->assertMatchesRegularExpression('/pattern/', $string);

// 異常斷言
$this->expectException(InvalidArgumentException::class);
$this->expectExceptionMessage('Error message');
```

### 4. 功能測試（Feature Tests）

```php
// tests/Feature/UserApiTest.php
namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class UserApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;
    
    /**
     * 測試用戶列表
     */
    public function test_can_get_users_list()
    {
        // Arrange：準備數據
        User::factory()->count(5)->create();
        
        // Act：執行操作
        $response = $this->getJson('/api/users');
        
        // Assert：驗證結果
        $response->assertStatus(200)
            ->assertJsonCount(5, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'email', 'created_at']
                ]
            ]);
    }
    
    /**
     * 測試創建用戶
     */
    public function test_can_create_user()
    {
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ];
        
        $response = $this->postJson('/api/users', $userData);
        
        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'name' => 'John Doe',
                    'email' => 'john@example.com',
                ]
            ]);
        
        // 驗證數據庫
        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
        ]);
    }
    
    /**
     * 測試更新用戶（需要認證）
     */
    public function test_can_update_user()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user, 'api')
            ->putJson("/api/users/{$user->id}", [
                'name' => 'Updated Name',
            ]);
        
        $response->assertStatus(200);
        
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
        ]);
    }
    
    /**
     * 測試刪除用戶
     */
    public function test_can_delete_user()
    {
        $user = User::factory()->create();
        
        $response = $this->deleteJson("/api/users/{$user->id}");
        
        $response->assertStatus(204);
        
        $this->assertDatabaseMissing('users', [
            'id' => $user->id,
        ]);
    }
    
    /**
     * 測試驗證錯誤
     */
    public function test_validation_errors_on_create()
    {
        $response = $this->postJson('/api/users', [
            'name' => '', // 必填
            'email' => 'invalid', // 無效郵箱
        ]);
        
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email']);
    }
    
    /**
     * 測試未授權訪問
     */
    public function test_unauthorized_user_cannot_access()
    {
        $response = $this->getJson('/api/admin/users');
        
        $response->assertStatus(401);
    }
}
```

**HTTP 測試常用方法**：

```php
// HTTP 請求
$this->get($uri);
$this->post($uri, $data);
$this->put($uri, $data);
$this->patch($uri, $data);
$this->delete($uri);
$this->getJson($uri);
$this->postJson($uri, $data);

// 認證
$this->actingAs($user);
$this->actingAs($user, 'api');

// 響應斷言
$response->assertStatus(200);
$response->assertOk(); // 200
$response->assertCreated(); // 201
$response->assertNoContent(); // 204
$response->assertNotFound(); // 404
$response->assertForbidden(); // 403
$response->assertUnauthorized(); // 401

// JSON 斷言
$response->assertJson(['key' => 'value']);
$response->assertJsonPath('data.name', 'John');
$response->assertJsonCount(5, 'data');
$response->assertJsonStructure(['data' => ['*' => ['id', 'name']]]);
$response->assertJsonFragment(['name' => 'John']);
$response->assertJsonMissing(['password']);

// 重定向斷言
$response->assertRedirect('/home');
$response->assertRedirectToRoute('dashboard');

// View 斷言
$response->assertViewIs('users.index');
$response->assertViewHas('users');
$response->assertViewHasAll(['users', 'total']);

// Session 斷言
$response->assertSessionHas('key', 'value');
$response->assertSessionHasErrors(['email']);
```

### 5. 數據庫測試

```php
// 使用 RefreshDatabase
use Illuminate\Foundation\Testing\RefreshDatabase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;
    
    // 每個測試後重置數據庫
}

// 數據庫斷言
$this->assertDatabaseHas('users', [
    'email' => 'john@example.com',
]);

$this->assertDatabaseMissing('users', [
    'email' => 'deleted@example.com',
]);

$this->assertDatabaseCount('users', 5);

$this->assertDeleted($user); // 軟刪除

$this->assertModelExists($user);
$this->assertModelMissing($user);
```

### 6. Factory 與 Seeder

```php
// database/factories/UserFactory.php
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition()
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
            'remember_token' => Str::random(10),
        ];
    }
    
    /**
     * 自定義狀態：管理員
     */
    public function admin()
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
        ]);
    }
    
    /**
     * 自定義狀態：未驗證郵箱
     */
    public function unverified()
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}

// 使用 Factory
$user = User::factory()->create();
$users = User::factory()->count(10)->create();
$admin = User::factory()->admin()->create();
$unverified = User::factory()->unverified()->create();

// 關聯關係
$user = User::factory()
    ->has(Post::factory()->count(3))
    ->create();

// 或使用 for
$posts = Post::factory()
    ->count(3)
    ->for(User::factory())
    ->create();
```

### 7. Mock 與 Fake

```php
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use App\Mail\WelcomeMail;
use App\Jobs\ProcessPayment;
use App\Events\UserRegistered;

// Mail Fake
Mail::fake();

// 執行操作
Mail::to($user)->send(new WelcomeMail($user));

// 斷言
Mail::assertSent(WelcomeMail::class, function ($mail) use ($user) {
    return $mail->hasTo($user->email);
});
Mail::assertSent(WelcomeMail::class, 1); // 發送次數
Mail::assertNotSent(AnotherMail::class);

// Queue Fake
Queue::fake();

ProcessPayment::dispatch($order);

Queue::assertPushed(ProcessPayment::class);
Queue::assertPushed(ProcessPayment::class, function ($job) use ($order) {
    return $job->order->id === $order->id;
});
Queue::assertNotPushed(AnotherJob::class);

// Event Fake
Event::fake([UserRegistered::class]);

event(new UserRegistered($user));

Event::assertDispatched(UserRegistered::class);
Event::assertDispatched(UserRegistered::class, function ($event) use ($user) {
    return $event->user->id === $user->id;
});

// Storage Fake
Storage::fake('local');

Storage::put('file.txt', 'Contents');

Storage::assertExists('file.txt');
Storage::assertMissing('missing.txt');
```

### 8. Browser Tests (Laravel Dusk)

```php
composer require --dev laravel/dusk
php artisan dusk:install

// tests/Browser/LoginTest.php
namespace Tests\Browser;

use App\Models\User;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class LoginTest extends DuskTestCase
{
    /**
     * 測試登入流程
     */
    public function test_user_can_login()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);
        
        $this->browse(function (Browser $browser) use ($user) {
            $browser->visit('/login')
                ->type('email', $user->email)
                ->type('password', 'password')
                ->press('Login')
                ->assertPathIs('/dashboard')
                ->assertSee('Welcome');
        });
    }
    
    /**
     * 測試表單驗證
     */
    public function test_login_validation()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->press('Login')
                ->assertSee('The email field is required')
                ->assertSee('The password field is required');
        });
    }
    
    /**
     * 測試 JavaScript 交互
     */
    public function test_modal_interaction()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/users')
                ->click('@add-user-button')
                ->whenAvailable('.modal', function ($modal) {
                    $modal->type('name', 'John Doe')
                        ->type('email', 'john@example.com')
                        ->press('Save')
                        ->waitForText('User created successfully');
                })
                ->assertSee('John Doe');
        });
    }
}
```

**Dusk 常用方法**：

```php
// 導航
$browser->visit('/home');
$browser->visitRoute('profile');
$browser->refresh();
$browser->back();

// 輸入
$browser->type('field', 'value');
$browser->clear('field');
$browser->check('checkbox');
$browser->uncheck('checkbox');
$browser->select('select', 'value');
$browser->attach('file', '/path/to/file');

// 點擊
$browser->click('.button');
$browser->clickLink('Link Text');
$browser->press('Submit');

// 等待
$browser->waitFor('.selector');
$browser->waitForText('Text');
$browser->waitUntilMissing('.selector');
$browser->pause(1000); // 毫秒

// 斷言
$browser->assertSee('Text');
$browser->assertDontSee('Text');
$browser->assertPathIs('/home');
$browser->assertQueryStringHas('page', '1');
$browser->assertVisible('.element');
$browser->assertMissing('.element');
$browser->assertEnabled('.button');
$browser->assertDisabled('.button');
$browser->assertChecked('checkbox');
$browser->assertSelected('select', 'value');
```

### 9. 調試工具

#### Laravel Telescope

```bash
composer require laravel/telescope
php artisan telescope:install
php artisan migrate

# 訪問 http://your-app.test/telescope
```

**功能**：
- 📊 請求監控（HTTP、數據庫查詢、任務、郵件）
- 🔍 異常追蹤
- ⏱️ 性能分析
- 🗄️ 數據庫查詢分析
- 📧 郵件預覽
- 🔔 通知記錄

```php
// 僅在本地環境啟用
// app/Providers/TelescopeServiceProvider.php
protected function gate()
{
    Gate::define('viewTelescope', function ($user) {
        return in_array($user->email, [
            'admin@example.com',
        ]);
    });
}
```

#### Laravel Debugbar

```bash
composer require barryvdh/laravel-debugbar --dev
```

**功能**：
- 🔍 請求信息
- ⏱️ 時間軸
- 🗄️ 數據庫查詢（數量、時間）
- 📝 日誌
- 💾 Session/Cookie
- 🔄 路由信息

#### Ray

```bash
composer require spatie/laravel-ray
```

```php
use function Spatie\Ray\ray;

// 調試變量
ray($user);

// 調試查詢
ray()->showQueries();
User::where('active', 1)->get();

// 追蹤函數調用
ray()->trace();

// 計時
ray()->measure(function () {
    sleep(1);
});

// 條件調試
ray($user)->if($user->isAdmin());
```

### 10. 日誌調試

```php
// 不同級別的日誌
\Log::emergency($message);
\Log::alert($message);
\Log::critical($message);
\Log::error($message);
\Log::warning($message);
\Log::notice($message);
\Log::info($message);
\Log::debug($message);

// 帶上下文
\Log::info('User created', ['user_id' => $user->id]);

// 不同頻道
\Log::channel('slack')->warning('Something happened');
\Log::stack(['single', 'slack'])->info('Message');

// 查詢日誌
\DB::enableQueryLog();
// 執行查詢
$queries = \DB::getQueryLog();
dd($queries);

// 或使用監聽器
\DB::listen(function ($query) {
    dump($query->sql);
    dump($query->bindings);
    dump($query->time);
});
```

### 11. 測試最佳實踐

```php
// ✅ 1. 使用描述性的測試名稱
public function test_user_can_update_their_profile()
{
    // ...
}

// ✅ 2. AAA 模式（Arrange, Act, Assert）
public function test_example()
{
    // Arrange：準備測試數據
    $user = User::factory()->create();
    
    // Act：執行操作
    $response = $this->actingAs($user)->get('/profile');
    
    // Assert：驗證結果
    $response->assertOk();
}

// ✅ 3. 每個測試只測一個概念
public function test_user_can_login()
{
    // 只測試登入，不測試其他功能
}

// ✅ 4. 使用 Factory 而非手動創建
$user = User::factory()->create(); // Good
$user = User::create([...]); // Avoid

// ✅ 5. 隔離測試（使用 RefreshDatabase）
use RefreshDatabase;

// ✅ 6. 避免測試 Framework 功能
// ❌ 不要測試 Laravel 本身的功能
public function test_eloquent_save_works()
{
    $user = new User(['name' => 'John']);
    $user->save();
    $this->assertDatabaseHas('users', ['name' => 'John']);
}

// ✅ 測試你的業務邏輯
public function test_user_can_purchase_product()
{
    // 測試自己的業務邏輯
}

// ✅ 7. 使用 Data Providers
/**
 * @dataProvider emailProvider
 */
public function test_email_validation($email, $expected)
{
    $validator = Validator::make(['email' => $email], ['email' => 'email']);
    $this->assertEquals($expected, $validator->passes());
}

public function emailProvider()
{
    return [
        ['valid@example.com', true],
        ['invalid', false],
        ['', false],
    ];
}
```

### 12. 測試覆蓋率

```bash
# 生成測試覆蓋率報告
php artisan test --coverage

# 或使用 PHPUnit
./vendor/bin/phpunit --coverage-html reports/
```

## 總結

**測試金字塔**：
- 🔹 **Unit Tests**：70% - 快速、大量
- 🔸 **Feature Tests**：20% - 中速、中量
- 🔺 **Browser Tests**：10% - 慢速、少量

**必備測試工具**：
- ✅ **PHPUnit**：單元測試與功能測試
- ✅ **Factory & Seeder**：測試數據生成
- ✅ **Dusk**：瀏覽器測試
- ✅ **Fake**：模擬外部服務

**調試工具**：
- 🔍 **Telescope**：請求監控與性能分析
- 🔍 **Debugbar**：開發環境調試
- 🔍 **Ray**：實時調試
- 📝 **日誌**：記錄與追蹤

**最佳實踐**：
- ✅ 遵循 AAA 模式（Arrange, Act, Assert）
- ✅ 使用描述性測試名稱
- ✅ 保持測試獨立和隔離
- ✅ 使用 Factory 生成測試數據
- ✅ 追求高測試覆蓋率（>80%）
- ✅ 定期執行測試（CI/CD）

掌握測試與調試能力是構建高質量 Laravel 應用的關鍵。
