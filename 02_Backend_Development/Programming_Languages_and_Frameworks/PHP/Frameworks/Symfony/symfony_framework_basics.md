# Symfony 框架基礎

- **難度**: 6
- **重要程度**: 5
- **標籤**: `Symfony`, `PHP`, `Framework`, `MVC`, `Bundle`

## 問題詳述

請深入解釋 Symfony 框架的核心概念、架構設計、以及與 Laravel 的主要差異。

## 核心理論與詳解

### 1. Symfony 簡介

**Symfony 是什麼？**

Symfony 是一個**高度解耦**、**可重用**的 PHP 組件集合和一個用於構建 Web 應用的框架。它強調：
- 🧩 **組件化**：可獨立使用的組件
- 🏗️ **靈活性**：高度可配置
- 📚 **最佳實踐**：遵循設計模式和 SOLID 原則
- 🔧 **可擴展性**：Bundle 系統

**Symfony vs Laravel 對比**：

| 特性 | Symfony | Laravel |
|------|---------|---------|
| **學習曲線** | 陡峭 | 平緩 |
| **靈活性** | 極高 | 中等 |
| **約定優於配置** | 配置為主 | 約定為主 |
| **性能** | 高（生產環境） | 中等 |
| **生態系統** | 成熟、企業級 | 豐富、易用 |
| **適用場景** | 大型企業應用 | 快速開發、中小型應用 |
| **ORM** | Doctrine | Eloquent |
| **模板引擎** | Twig | Blade |
| **DI 容器** | 強大、複雜 | 簡單、直觀 |

### 2. Symfony 架構

**核心組件**：

```
Symfony Application
├── HttpKernel (請求/響應核心)
│   ├── HttpFoundation (請求/響應對象)
│   ├── EventDispatcher (事件系統)
│   └── Routing (路由)
├── DependencyInjection (服務容器)
├── Config (配置管理)
├── Console (命令行工具)
├── Security (安全組件)
├── Form (表單處理)
├── Validator (數據驗證)
└── Translation (國際化)
```

**請求生命週期**：

```
1. 入口文件 (public/index.php)
   ↓
2. 創建 Kernel
   ↓
3. 處理請求 (HttpKernel::handle())
   ↓
4. kernel.request 事件
   ↓
5. 路由匹配
   ↓
6. kernel.controller 事件
   ↓
7. 執行 Controller
   ↓
8. kernel.view 事件（如需要）
   ↓
9. kernel.response 事件
   ↓
10. 返回響應
   ↓
11. kernel.terminate 事件
```

### 3. 項目結構

```
my-project/
├── bin/                    # 可執行文件
│   └── console            # 命令行工具
├── config/                # 配置文件
│   ├── packages/          # 套件配置
│   ├── routes/            # 路由配置
│   ├── bundles.php        # Bundle 註冊
│   ├── services.yaml      # 服務配置
│   └── routes.yaml        # 路由配置
├── public/                # 公開目錄
│   └── index.php          # 入口文件
├── src/                   # 應用代碼
│   ├── Controller/        # 控制器
│   ├── Entity/            # Doctrine 實體
│   ├── Repository/        # 數據倉庫
│   ├── Form/              # 表單類型
│   ├── Service/           # 服務
│   └── Kernel.php         # 應用核心
├── templates/             # Twig 模板
├── translations/          # 翻譯文件
├── var/                   # 臨時文件
│   ├── cache/            # 緩存
│   └── log/              # 日誌
├── vendor/               # 依賴
└── composer.json         # Composer 配置
```

### 4. 安裝與啟動

```bash
# 創建新項目（完整框架）
composer create-project symfony/skeleton my-project
cd my-project

# 或創建 Web 應用
composer create-project symfony/website-skeleton my-project

# 啟動開發服務器
symfony server:start
# 或
php -S localhost:8000 -t public/

# 安裝常用組件
composer require symfony/orm-pack
composer require symfony/form
composer require symfony/security-bundle
composer require symfony/validator
composer require symfony/mailer
```

### 5. 路由系統

#### 註解路由（推薦）

```php
// src/Controller/ProductController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ProductController extends AbstractController
{
    /**
     * @Route("/products", name="product_list", methods={"GET"})
     */
    public function list(): Response
    {
        // 獲取產品列表
        $products = $this->getDoctrine()
            ->getRepository(Product::class)
            ->findAll();
        
        return $this->render('product/list.html.twig', [
            'products' => $products,
        ]);
    }
    
    /**
     * @Route("/products/{id}", name="product_show", methods={"GET"}, requirements={"id"="\d+"})
     */
    public function show(int $id): Response
    {
        $product = $this->getDoctrine()
            ->getRepository(Product::class)
            ->find($id);
        
        if (!$product) {
            throw $this->createNotFoundException('Product not found');
        }
        
        return $this->render('product/show.html.twig', [
            'product' => $product,
        ]);
    }
    
    /**
     * @Route("/products", name="product_create", methods={"POST"})
     */
    public function create(): Response
    {
        // 創建產品
    }
}
```

**PHP 8 Attributes（更推薦）**：

```php
use Symfony\Component\Routing\Annotation\Route;

class ProductController extends AbstractController
{
    #[Route('/products', name: 'product_list', methods: ['GET'])]
    public function list(): Response
    {
        // ...
    }
    
    #[Route('/products/{id}', name: 'product_show', requirements: ['id' => '\d+'])]
    public function show(int $id): Response
    {
        // ...
    }
}
```

#### YAML 路由

```yaml
# config/routes.yaml
product_list:
    path: /products
    controller: App\Controller\ProductController::list
    methods: [GET]

product_show:
    path: /products/{id}
    controller: App\Controller\ProductController::show
    methods: [GET]
    requirements:
        id: '\d+'
```

#### 路由參數與約束

```php
#[Route('/blog/{slug}', name: 'blog_show')]
public function show(string $slug): Response { }

#[Route('/blog/{page}', name: 'blog_list', requirements: ['page' => '\d+'])]
public function list(int $page = 1): Response { }

// 可選參數
#[Route('/blog/{slug}.{_format}', name: 'blog_show', defaults: ['_format' => 'html'])]
public function show(string $slug, string $_format): Response { }

// 生成 URL
$url = $this->generateUrl('product_show', ['id' => 123]);
// 或在 Twig 中
// {{ path('product_show', {id: 123}) }}
// {{ url('product_show', {id: 123}) }}
```

### 6. 控制器

```php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;

class ExampleController extends AbstractController
{
    /**
     * 基本響應
     */
    #[Route('/hello')]
    public function hello(): Response
    {
        return new Response('<h1>Hello World</h1>');
    }
    
    /**
     * 渲染模板
     */
    #[Route('/home')]
    public function home(): Response
    {
        return $this->render('home/index.html.twig', [
            'title' => 'Welcome',
        ]);
    }
    
    /**
     * JSON 響應
     */
    #[Route('/api/users')]
    public function users(): JsonResponse
    {
        return $this->json([
            'users' => [
                ['id' => 1, 'name' => 'John'],
                ['id' => 2, 'name' => 'Jane'],
            ]
        ]);
    }
    
    /**
     * 獲取請求數據
     */
    #[Route('/form', methods: ['POST'])]
    public function form(Request $request): Response
    {
        // 獲取 POST 數據
        $name = $request->request->get('name');
        
        // 獲取 GET 參數
        $page = $request->query->get('page', 1);
        
        // 獲取 Headers
        $token = $request->headers->get('Authorization');
        
        // 獲取 JSON 數據
        $data = json_decode($request->getContent(), true);
        
        // 獲取文件
        $file = $request->files->get('upload');
        
        return new Response('OK');
    }
    
    /**
     * 重定向
     */
    #[Route('/redirect')]
    public function redirect(): Response
    {
        // 重定向到 URL
        return $this->redirectToRoute('home');
        
        // 或外部 URL
        return $this->redirect('https://example.com');
    }
    
    /**
     * 404 錯誤
     */
    public function notFound(): Response
    {
        throw $this->createNotFoundException('The product does not exist');
    }
    
    /**
     * Flash 消息
     */
    public function addFlash(): Response
    {
        $this->addFlash('success', 'Product created!');
        return $this->redirectToRoute('product_list');
    }
}
```

### 7. 服務容器基礎

```php
// 自動注入服務
class ProductController extends AbstractController
{
    #[Route('/products')]
    public function list(EntityManagerInterface $em): Response
    {
        $products = $em->getRepository(Product::class)->findAll();
        
        return $this->render('product/list.html.twig', [
            'products' => $products,
        ]);
    }
}

// 注入自定義服務
// src/Service/PriceCalculator.php
namespace App\Service;

class PriceCalculator
{
    public function calculateTotal(array $items): float
    {
        return array_sum(array_map(fn($item) => $item->getPrice(), $items));
    }
}

// 在控制器中使用
class CartController extends AbstractController
{
    #[Route('/cart/total')]
    public function total(PriceCalculator $calculator): Response
    {
        $items = []; // 獲取購物車項目
        $total = $calculator->calculateTotal($items);
        
        return $this->json(['total' => $total]);
    }
}
```

### 8. Twig 模板

```twig
{# templates/base.html.twig #}
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>{% block title %}Welcome!{% endblock %}</title>
        {% block stylesheets %}{% endblock %}
    </head>
    <body>
        {% block body %}{% endblock %}
        {% block javascripts %}{% endblock %}
    </body>
</html>

{# templates/product/list.html.twig #}
{% extends 'base.html.twig' %}

{% block title %}Products{% endblock %}

{% block body %}
    <h1>Product List</h1>
    
    {% for product in products %}
        <div class="product">
            <h2>{{ product.name }}</h2>
            <p>Price: {{ product.price|number_format(2) }}</p>
            <a href="{{ path('product_show', {id: product.id}) }}">View</a>
        </div>
    {% else %}
        <p>No products found.</p>
    {% endfor %}
    
    {# 條件判斷 #}
    {% if products|length > 0 %}
        <p>Total: {{ products|length }} products</p>
    {% endif %}
    
    {# 引入其他模板 #}
    {% include 'components/pagination.html.twig' %}
{% endblock %}
```

**Twig 常用語法**：

```twig
{# 變量 #}
{{ variable }}

{# 過濾器 #}
{{ name|upper }}
{{ price|number_format(2) }}
{{ date|date('Y-m-d') }}

{# 函數 #}
{{ path('route_name') }}
{{ url('route_name') }}
{{ asset('images/logo.png') }}

{# 註釋 #}
{# 這是註釋 #}

{# 循環 #}
{% for item in items %}
    {{ loop.index }}: {{ item.name }}
{% endfor %}

{# 條件 #}
{% if user.isAdmin %}
    <p>Admin</p>
{% elseif user.isEditor %}
    <p>Editor</p>
{% else %}
    <p>User</p>
{% endif %}
```

### 9. 配置管理

```yaml
# config/services.yaml
parameters:
    app.admin_email: 'admin@example.com'
    app.max_upload_size: 5242880 # 5MB

services:
    _defaults:
        autowire: true      # 自動注入依賴
        autoconfigure: true # 自動配置標籤
        public: false       # 服務默認為私有
    
    App\:
        resource: '../src/'
        exclude:
            - '../src/DependencyInjection/'
            - '../src/Entity/'
            - '../src/Kernel.php'
    
    # 自定義服務配置
    App\Service\PriceCalculator:
        arguments:
            $taxRate: 0.08
```

**在控制器中使用配置**：

```php
class ExampleController extends AbstractController
{
    #[Route('/config')]
    public function config(): Response
    {
        $adminEmail = $this->getParameter('app.admin_email');
        
        return new Response($adminEmail);
    }
}
```

### 10. Console 命令

```php
// src/Command/CreateUserCommand.php
namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:create-user', description: 'Creates a new user')]
class CreateUserCommand extends Command
{
    protected function configure(): void
    {
        $this
            ->addArgument('username', InputArgument::REQUIRED, 'The username')
            ->addArgument('email', InputArgument::REQUIRED, 'The email')
            ->addOption('admin', null, InputOption::VALUE_NONE, 'Set as admin');
    }
    
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $username = $input->getArgument('username');
        $email = $input->getArgument('email');
        $isAdmin = $input->getOption('admin');
        
        // 創建用戶邏輯
        
        $output->writeln(sprintf('User %s created!', $username));
        
        return Command::SUCCESS;
    }
}
```

```bash
# 執行命令
php bin/console app:create-user john john@example.com --admin
```

### 11. Doctrine ORM 基礎

```php
// src/Entity/Product.php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProductRepository::class)]
class Product
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private int $id;
    
    #[ORM\Column(type: 'string', length: 255)]
    private string $name;
    
    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private float $price;
    
    // Getters & Setters
    public function getId(): ?int
    {
        return $this->id;
    }
    
    public function getName(): ?string
    {
        return $this->name;
    }
    
    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }
    
    // ...
}

// 使用 Doctrine
class ProductController extends AbstractController
{
    #[Route('/products/create')]
    public function create(EntityManagerInterface $em): Response
    {
        $product = new Product();
        $product->setName('Product 1');
        $product->setPrice(99.99);
        
        $em->persist($product);
        $em->flush();
        
        return new Response('Product created with ID: ' . $product->getId());
    }
    
    #[Route('/products')]
    public function list(ProductRepository $repository): Response
    {
        $products = $repository->findAll();
        
        return $this->render('product/list.html.twig', [
            'products' => $products,
        ]);
    }
}
```

## 總結

**Symfony 核心特點**：
- 🧩 **組件化**：高度解耦，可獨立使用
- 🏗️ **靈活性**：配置優於約定
- 📚 **企業級**：適合大型、複雜項目
- 🔧 **可擴展**：Bundle 和服務容器

**與 Laravel 主要差異**：
- **學習曲線**：Symfony 更陡峭，需要更多配置
- **開發速度**：Laravel 更快，Symfony 更靈活
- **架構**：Symfony 更解耦，Laravel 更緊密整合
- **適用場景**：Symfony 適合企業級，Laravel 適合快速開發

**核心組件**：
- ✅ **HttpKernel**：請求/響應處理
- ✅ **DependencyInjection**：服務容器
- ✅ **Routing**：路由系統
- ✅ **Twig**：模板引擎
- ✅ **Doctrine**：ORM
- ✅ **Console**：命令行工具

**學習路徑**：
1. **基礎**：路由、控制器、模板
2. **進階**：服務容器、事件系統
3. **深入**：Bundle 開發、自定義組件

掌握 Symfony 能讓你構建高度靈活、可維護的企業級應用。

### 測驗對應

- **Concept ID**: `concept.php.symfony.framework-basics`
- **Learning Objectives**:
  - `LO-1`: 能夠追蹤 Symfony request 從 Kernel、routing、controller、service container 到 response 的主要生命週期。
  - `LO-2`: 能夠依問題選擇 HttpFoundation、Routing、DependencyInjection、EventDispatcher、Console 等 component，而非無條件引入整個 framework。
  - `LO-3`: 能夠以環境設定、cache warmup、bundle／service wiring、CLI 與可回滾部署建立可維護的 Symfony 應用骨架。
- **Prerequisites**: [PHP 命名空間與自動載入](../../Core/namespaces_and_autoloading.md)、[PHP 服務容器與 IoC](../../Core/di_container_and_ioc.md)
- **Quick Quiz**: [Q27](../../../../../QUIZ/09_PHP.md#q27-symfony-框架基礎如何串起-request-生命週期與-components)
- **Hard Assessment**: [PHP Framework Tooling Incident](../../../../../QUIZ/Hard_Assessments/php_framework_tooling_incident.md) (`assessment.php.framework-tooling.incident.v1`)
- **Assessment Gate**: 完成 Hard Assessment 中對應的 `LO-1`～`LO-3`，並達到總分 3/4；若未達標，回讀本文後重測。
