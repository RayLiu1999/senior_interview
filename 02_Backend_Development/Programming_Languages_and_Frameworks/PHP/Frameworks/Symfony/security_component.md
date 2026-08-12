# Symfony Security 安全組件

- **難度**: 8
- **重要程度**: 5
- **標籤**: `Symfony`, `Security`, `Authentication`, `Authorization`, `JWT`

## 問題詳述

請深入解釋 Symfony 的安全組件，包括認證、授權、防火牆、用戶提供者、以及常見的安全實踐。

## 核心理論與詳解

### 1. Symfony Security 架構

**核心組件**：

```
Security Component
├── Authentication (認證 - 你是誰？)
│   ├── Firewall (防火牆)
│   ├── User Provider (用戶提供者)
│   ├── Authenticator (認證器)
│   └── Guard (守衛)
├── Authorization (授權 - 你能做什麼？)
│   ├── Access Control (訪問控制)
│   ├── Voter (投票者)
│   └── Role Hierarchy (角色層級)
└── Additional Features
    ├── Password Hashing (密碼哈希)
    ├── CSRF Protection (CSRF 保護)
    └── Remember Me (記住我)
```

**認證 vs 授權**：

| 概念 | 問題 | 示例 |
|------|------|------|
| **Authentication** | 你是誰？ | 用戶登入、JWT 驗證 |
| **Authorization** | 你能做什麼？ | 角色檢查、權限驗證 |

### 2. 安全配置

```yaml
# config/packages/security.yaml
security:
    # 密碼哈希
    password_hashers:
        App\Entity\User:
            algorithm: auto # 使用最新的哈希算法
    
    # 用戶提供者
    providers:
        app_user_provider:
            entity:
                class: App\Entity\User
                property: email
    
    # 防火牆
    firewalls:
        dev:
            pattern: ^/(_(profiler|wdt)|css|images|js)/
            security: false
        
        main:
            lazy: true
            provider: app_user_provider
            
            # 表單登入
            form_login:
                login_path: app_login
                check_path: app_login
                enable_csrf: true
                default_target_path: app_dashboard
            
            # 登出
            logout:
                path: app_logout
                target: app_home
            
            # Remember Me
            remember_me:
                secret: '%kernel.secret%'
                lifetime: 604800 # 7 天
                path: /
    
    # 訪問控制
    access_control:
        - { path: ^/admin, roles: ROLE_ADMIN }
        - { path: ^/api, roles: ROLE_USER }
        - { path: ^/login, roles: PUBLIC_ACCESS }
    
    # 角色層級
    role_hierarchy:
        ROLE_ADMIN: ROLE_USER
        ROLE_SUPER_ADMIN: [ROLE_ADMIN, ROLE_ALLOWED_TO_SWITCH]
```

### 3. 用戶實體

```php
// src/Entity/User.php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;
    
    #[ORM\Column(type: 'string', length: 180, unique: true)]
    private ?string $email = null;
    
    #[ORM\Column(type: 'json')]
    private array $roles = [];
    
    #[ORM\Column(type: 'string')]
    private ?string $password = null;
    
    public function getId(): ?int
    {
        return $this->id;
    }
    
    public function getEmail(): ?string
    {
        return $this->email;
    }
    
    public function setEmail(string $email): self
    {
        $this->email = $email;
        return $this;
    }
    
    /**
     * 用戶標識符（用於 Session）
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }
    
    /**
     * 用戶角色
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // 保證每個用戶至少有 ROLE_USER
        $roles[] = 'ROLE_USER';
        
        return array_unique($roles);
    }
    
    public function setRoles(array $roles): self
    {
        $this->roles = $roles;
        return $this;
    }
    
    /**
     * 密碼（已哈希）
     */
    public function getPassword(): string
    {
        return $this->password;
    }
    
    public function setPassword(string $password): self
    {
        $this->password = $password;
        return $this;
    }
    
    /**
     * 清除敏感數據
     */
    public function eraseCredentials(): void
    {
        // 如果存儲了明文密碼，在這裡清除
        // $this->plainPassword = null;
    }
}
```

### 4. 表單登入

**登入控制器**：

```php
// src/Controller/SecurityController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class SecurityController extends AbstractController
{
    #[Route('/login', name: 'app_login')]
    public function login(AuthenticationUtils $authenticationUtils): Response
    {
        // 如果已登入，重定向
        if ($this->getUser()) {
            return $this->redirectToRoute('app_dashboard');
        }
        
        // 獲取登入錯誤
        $error = $authenticationUtils->getLastAuthenticationError();
        
        // 獲取上次輸入的用戶名
        $lastUsername = $authenticationUtils->getLastUsername();
        
        return $this->render('security/login.html.twig', [
            'last_username' => $lastUsername,
            'error' => $error,
        ]);
    }
    
    #[Route('/logout', name: 'app_logout')]
    public function logout(): void
    {
        // Symfony 會攔截這個路由並處理登出
        throw new \LogicException('This method can be blank');
    }
}
```

**登入表單**：

```twig
{# templates/security/login.html.twig #}
{% extends 'base.html.twig' %}

{% block body %}
<div class="login-form">
    <h1>Login</h1>
    
    {% if error %}
        <div class="alert alert-danger">
            {{ error.messageKey|trans(error.messageData, 'security') }}
        </div>
    {% endif %}
    
    <form method="post">
        <div class="form-group">
            <label for="username">Email:</label>
            <input type="email" 
                   id="username" 
                   name="_username" 
                   value="{{ last_username }}" 
                   required>
        </div>
        
        <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" 
                   id="password" 
                   name="_password" 
                   required>
        </div>
        
        <input type="hidden" 
               name="_csrf_token" 
               value="{{ csrf_token('authenticate') }}">
        
        <div class="form-group">
            <label>
                <input type="checkbox" name="_remember_me"> Remember me
            </label>
        </div>
        
        <button type="submit">Login</button>
    </form>
</div>
{% endblock %}
```

### 5. 用戶註冊

```php
// src/Controller/RegistrationController.php
namespace App\Controller;

use App\Entity\User;
use App\Form\RegistrationFormType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

class RegistrationController extends AbstractController
{
    #[Route('/register', name: 'app_register')]
    public function register(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager
    ): Response {
        $user = new User();
        $form = $this->createForm(RegistrationFormType::class, $user);
        $form->handleRequest($request);
        
        if ($form->isSubmitted() && $form->isValid()) {
            // 哈希密碼
            $user->setPassword(
                $passwordHasher->hashPassword(
                    $user,
                    $form->get('plainPassword')->getData()
                )
            );
            
            $entityManager->persist($user);
            $entityManager->flush();
            
            return $this->redirectToRoute('app_login');
        }
        
        return $this->render('registration/register.html.twig', [
            'registrationForm' => $form->createView(),
        ]);
    }
}
```

### 6. JWT 認證（API）

```bash
composer require lexik/jwt-authentication-bundle
```

```yaml
# config/packages/lexik_jwt_authentication.yaml
lexik_jwt_authentication:
    secret_key: '%env(resolve:JWT_SECRET_KEY)%'
    public_key: '%env(resolve:JWT_PUBLIC_KEY)%'
    pass_phrase: '%env(JWT_PASSPHRASE)%'
    token_ttl: 3600 # 1 小時
```

```yaml
# config/packages/security.yaml
security:
    firewalls:
        api_login:
            pattern: ^/api/login
            stateless: true
            json_login:
                check_path: /api/login
                username_path: email
                password_path: password
                success_handler: lexik_jwt_authentication.handler.authentication_success
                failure_handler: lexik_jwt_authentication.handler.authentication_failure
        
        api:
            pattern: ^/api
            stateless: true
            jwt: ~
    
    access_control:
        - { path: ^/api/login, roles: PUBLIC_ACCESS }
        - { path: ^/api, roles: IS_AUTHENTICATED_FULLY }
```

**API 控制器**：

```php
// src/Controller/Api/AuthController.php
namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api')]
class AuthController extends AbstractController
{
    #[Route('/login', name: 'api_login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        // LexikJWTAuthenticationBundle 會處理認證
        // 這個方法實際上不會被執行
        $user = $this->getUser();
        
        return $this->json([
            'user' => $user->getUserIdentifier(),
            'roles' => $user->getRoles(),
        ]);
    }
    
    #[Route('/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();
        
        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
        ]);
    }
}
```

**使用 JWT**：

```bash
# 登入獲取 Token
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# 響應
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
}

# 使用 Token 訪問 API
curl -X GET http://localhost:8000/api/me \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
```

### 7. 自定義認證器

```php
// src/Security/ApiKeyAuthenticator.php
namespace App\Security;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class ApiKeyAuthenticator extends AbstractAuthenticator
{
    public function supports(Request $request): ?bool
    {
        return $request->headers->has('X-API-KEY');
    }
    
    public function authenticate(Request $request): Passport
    {
        $apiKey = $request->headers->get('X-API-KEY');
        
        if (null === $apiKey) {
            throw new AuthenticationException('No API key provided');
        }
        
        return new SelfValidatingPassport(
            new UserBadge($apiKey, function ($apiKey) {
                // 根據 API Key 載入用戶
                return $this->userRepository->findOneBy(['apiKey' => $apiKey]);
            })
        );
    }
    
    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        // 返回 null 繼續請求
        return null;
    }
    
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse([
            'message' => 'Authentication failed'
        ], Response::HTTP_UNAUTHORIZED);
    }
}
```

### 8. 授權控制

**在控制器中檢查權限**：

```php
class PostController extends AbstractController
{
    #[Route('/posts/{id}', methods: ['GET'])]
    public function show(Post $post): Response
    {
        // 方式 1：檢查角色
        $this->denyAccessUnlessGranted('ROLE_USER');
        
        // 方式 2：檢查是否為作者
        $this->denyAccessUnlessGranted('edit', $post);
        
        return $this->render('post/show.html.twig', ['post' => $post]);
    }
}
```

**在 Twig 中檢查權限**：

```twig
{% if is_granted('ROLE_ADMIN') %}
    <a href="{{ path('admin_dashboard') }}">Admin Panel</a>
{% endif %}

{% if is_granted('edit', post) %}
    <a href="{{ path('post_edit', {id: post.id}) }}">Edit</a>
{% endif %}
```

### 9. Voter（投票者）

```php
// src/Security/Voter/PostVoter.php
namespace App\Security\Voter;

use App\Entity\Post;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class PostVoter extends Voter
{
    const VIEW = 'view';
    const EDIT = 'edit';
    const DELETE = 'delete';
    
    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::VIEW, self::EDIT, self::DELETE])
            && $subject instanceof Post;
    }
    
    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        
        if (!$user instanceof User) {
            return false;
        }
        
        /** @var Post $post */
        $post = $subject;
        
        return match($attribute) {
            self::VIEW => $this->canView($post, $user),
            self::EDIT => $this->canEdit($post, $user),
            self::DELETE => $this->canDelete($post, $user),
            default => false,
        };
    }
    
    private function canView(Post $post, User $user): bool
    {
        // 已發布的文章，或者是作者本人
        return $post->isPublished() || $post->getAuthor() === $user;
    }
    
    private function canEdit(Post $post, User $user): bool
    {
        // 只有作者或管理員可以編輯
        return $post->getAuthor() === $user 
            || in_array('ROLE_ADMIN', $user->getRoles());
    }
    
    private function canDelete(Post $post, User $user): bool
    {
        // 只有管理員可以刪除
        return in_array('ROLE_ADMIN', $user->getRoles());
    }
}
```

### 10. CSRF 保護

```twig
{# 表單中的 CSRF Token #}
<form method="post">
    <input type="hidden" 
           name="_csrf_token" 
           value="{{ csrf_token('delete-item') }}">
    <button type="submit">Delete</button>
</form>
```

```php
// 在控制器中驗證
use Symfony\Component\Security\Csrf\CsrfToken;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;

class ItemController extends AbstractController
{
    #[Route('/items/{id}', methods: ['DELETE'])]
    public function delete(
        int $id,
        Request $request,
        CsrfTokenManagerInterface $csrfTokenManager
    ): Response {
        $token = new CsrfToken('delete-item', $request->request->get('_csrf_token'));
        
        if (!$csrfTokenManager->isTokenValid($token)) {
            throw $this->createAccessDeniedException('Invalid CSRF token');
        }
        
        // 刪除項目
        
        return $this->redirectToRoute('items_list');
    }
}
```

### 11. 安全最佳實踐

```php
// ✅ 1. 始終使用 HTTPS（生產環境）
// config/packages/security.yaml
security:
    access_control:
        - { path: ^/, requires_channel: https }

// ✅ 2. 密碼強度驗證
// src/Validator/StrongPassword.php
#[Assert\Regex(
    pattern: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/',
    message: 'Password must be at least 8 characters and contain uppercase, lowercase, number and special character'
)]
private string $password;

// ✅ 3. 限制登入嘗試
composer require symfonycasts/verify-email-bundle

// ✅ 4. 使用環境變量存儲密鑰
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem

// ✅ 5. 輸入驗證與清理
use Symfony\Component\Validator\Constraints as Assert;

class UserDTO
{
    #[Assert\Email]
    #[Assert\NotBlank]
    public string $email;
    
    #[Assert\Length(min: 8)]
    public string $password;
}

// ✅ 6. 防止 SQL 注入（使用 Doctrine）
$repository->createQueryBuilder('u')
    ->where('u.email = :email')
    ->setParameter('email', $email) // 參數綁定
    ->getQuery()
    ->getResult();

// ❌ 避免
$query = "SELECT * FROM users WHERE email = '$email'"; // 危險！

// ✅ 7. XSS 防護（Twig 自動轉義）
{{ user.name }} {# 自動轉義 #}
{{ user.name|raw }} {# 僅在確定安全時使用 #}

// ✅ 8. 安全 Headers
// config/packages/framework.yaml
framework:
    http_client:
        default_options:
            headers:
                'X-Frame-Options': 'DENY'
                'X-Content-Type-Options': 'nosniff'
                'X-XSS-Protection': '1; mode=block'
```

## 總結

**Symfony Security 核心**：
- 🔐 **認證**：確認用戶身份（登入、JWT、API Key）
- 🔐 **授權**：確認用戶權限（角色、Voter）
- 🔐 **防火牆**：請求攔截與路由保護
- 🔐 **密碼哈希**：安全存儲密碼

**認證方式**：
- ✅ **表單登入**：傳統 Web 應用
- ✅ **JWT**：無狀態 API
- ✅ **API Key**：服務間調用
- ✅ **OAuth**：第三方登入

**授權控制**：
- ✅ **角色檢查**：`ROLE_USER`, `ROLE_ADMIN`
- ✅ **Voter**：複雜權限邏輯
- ✅ **ACL**：細粒度對象權限

**安全檢查清單**：
- ✅ 使用 HTTPS
- ✅ 啟用 CSRF 保護
- ✅ 密碼強度驗證
- ✅ 限制登入嘗試
- ✅ 輸入驗證
- ✅ 防止 SQL 注入
- ✅ XSS 防護
- ✅ 安全 Headers

Symfony Security 組件提供了企業級的安全保障。

### 測驗對應

- **Concept ID**: `concept.php.symfony.security-component`
- **Learning Objectives**:
  - `LO-1`: 能夠區分 firewall、authenticator、user provider、token、access control 與 voter 在認證授權流程中的責任。
  - `LO-2`: 能夠設計 stateless API、session-based web、CSRF、密碼雜湊、租戶隔離與最小權限的安全邊界。
  - `LO-3`: 能夠以 negative test、審計事件、敏感資料遮罩與失敗安全的 rollout 證明未授權請求不會繞過 security component。
- **Prerequisites**: [Symfony 框架基礎](./symfony_framework_basics.md)、[Symfony 依賴注入容器](./dependency_injection_container.md)
- **Quick Quiz**: [Q26](../../../../../QUIZ/09_PHP.md#q26-symfony-security-component-如何劃分認證與授權)
- **Hard Assessment**: [PHP Framework Tooling Incident](../../../../../QUIZ/Hard_Assessments/php_framework_tooling_incident.md) (`assessment.php.framework-tooling.incident.v1`)
- **Assessment Gate**: 完成 Hard Assessment 中對應的 `LO-1`～`LO-3`，並達到總分 3/4；若未達標，回讀本文後重測。
