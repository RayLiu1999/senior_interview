# 請求生命週期組件

- **難度**: 8
- **重要程度**: 5
- **標籤**: `Middleware`, `Guards`, `Interceptors`, `Pipes`, `Request Lifecycle`

## 問題詳述

請深入解釋 NestJS 請求生命週期中的各個組件（Middleware、Guards、Interceptors、Pipes）的執行順序、工作原理和應用場景。

## 核心理論與詳解

### 請求生命週期完整流程

```
Incoming Request (HTTP/WebSocket/GraphQL)
      ↓
┌─────────────────────────────────────────┐
│  1. Middleware                          │
│     - 全域 Middleware                   │
│     - 模組 Middleware                   │
│     - 路由 Middleware                   │
└─────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────┐
│  2. Guards                              │
│     - 全域 Guards                       │
│     - Controller Guards                 │
│     - Route Guards                      │
│     - 決定是否允許請求繼續              │
└─────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────┐
│  3. Interceptors (Before)               │
│     - 前置處理                          │
│     - 轉換請求                          │
└─────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────┐
│  4. Pipes                               │
│     - 驗證參數                          │
│     - 轉換參數                          │
└─────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────┐
│  5. Route Handler (Controller Method)  │
│     - 執行業務邏輯                      │
└─────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────┐
│  6. Interceptors (After)                │
│     - 後置處理                          │
│     - 轉換響應                          │
└─────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────┐
│  7. Exception Filters (如果有錯誤)      │
│     - 捕獲異常                          │
│     - 格式化錯誤響應                    │
└─────────────────────────────────────────┘
      ↓
Outgoing Response
```

### 1. Middleware（中介軟體）

#### 基本概念

**定義**：
Middleware 是在路由處理器之前調用的函數，可以訪問請求和響應物件。

**特性**：
- 最早執行
- 可以修改請求/響應
- 可以結束請求-響應循環
- 必須呼叫 `next()` 傳遞控制權

#### 實現方式

**函數式 Middleware**：

```typescript
// logger.middleware.ts
import { Request, Response, NextFunction } from 'express';

export function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next(); // 必須呼叫 next()
}

// app.module.ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(loggerMiddleware)
      .forRoutes('*'); // 應用到所有路由
  }
}
```

**類別 Middleware**：

```typescript
// logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`Request: ${req.method} ${req.url}`);
    console.log(`Headers:`, req.headers);
    console.log(`Body:`, req.body);
    
    next();
  }
}

// 註冊
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude(
        { path: 'health', method: RequestMethod.GET }, // 排除特定路由
        'metrics'
      )
      .forRoutes(
        { path: 'users', method: RequestMethod.ALL },
        UsersController
      );
  }
}
```

**實際應用案例**：

```typescript
// auth.middleware.ts
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify(token);
      req['user'] = payload; // 附加用戶資訊到請求物件
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

// cors.middleware.ts
@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  }
}

// rate-limit.middleware.ts
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private requests = new Map<string, number[]>();

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 分鐘
    const maxRequests = 100;

    // 獲取該 IP 的請求記錄
    const timestamps = this.requests.get(ip) || [];
    
    // 過濾掉超過時間窗口的請求
    const recentRequests = timestamps.filter(t => now - t < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      throw new HttpException('Too Many Requests', 429);
    }

    recentRequests.push(now);
    this.requests.set(ip, recentRequests);

    next();
  }
}
```

### 2. Guards（守衛）

#### 基本概念

**定義**：
Guards 決定請求是否應該由路由處理器處理，主要用於授權。

**特性**：
- 在 Middleware 之後執行
- 返回 boolean 或 Promise<boolean>
- true 允許繼續，false 拋出 ForbiddenException

#### 實現

**基本 Guard**：

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  private validateRequest(request: any): boolean {
    // 驗證邏輯
    return !!request.user;
  }
}

// 使用
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  @Get()
  findAll() { /* ... */ }
}
```

**JWT Guard**：

```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 檢查是否有 @Public() 裝飾器
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler()
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

**角色 Guard**：

```typescript
// roles.decorator.ts
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // 沒有角色要求，允許通過
    }

    const { user } = context.switchToHttp().getRequest();
    
    return requiredRoles.some(role => user?.roles?.includes(role));
  }
}

// 使用
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles('admin', 'superadmin')
  getAllUsers() { /* ... */ }

  @Get('stats')
  @Roles('admin')
  getStats() { /* ... */ }
}
```

**權限 Guard**：

```typescript
// permissions.decorator.ts
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

// permissions.guard.ts
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler()
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const hasPermissions = await this.permissionsService.checkPermissions(
      user.id,
      requiredPermissions
    );

    if (!hasPermissions) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

// 使用
@Controller('posts')
export class PostsController {
  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('posts:create')
  create(@Body() createPostDto: CreatePostDto) { /* ... */ }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('posts:delete')
  remove(@Param('id') id: string) { /* ... */ }
}
```

### 3. Interceptors（攔截器）

#### 基本概念

**定義**：
Interceptors 可以在方法執行前後添加額外的邏輯，可以轉換響應或處理異常。

**特性**：
- 可以在方法執行前後添加邏輯
- 可以轉換返回值
- 可以轉換異常
- 使用 RxJS operators

#### 實現

**基本 Interceptor**：

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => ({
        statusCode: 200,
        message: 'Success',
        data,
        timestamp: new Date().toISOString(),
      }))
    );
  }
}

interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}
```

**日誌 Interceptor**：

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    this.logger.log(`Incoming Request: ${method} ${url}`);

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;
          
          this.logger.log(
            `Outgoing Response: ${method} ${url} ${response.statusCode} - ${delay}ms`
          );
        },
        error: (error) => {
          const delay = Date.now() - now;
          this.logger.error(
            `Request Failed: ${method} ${url} - ${delay}ms`,
            error.stack
          );
        }
      })
    );
  }
}
```

**快取 Interceptor**：

```typescript
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private cacheService: CacheService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = `cache:${request.method}:${request.url}`;

    // 檢查快取
    const cachedResponse = await this.cacheService.get(cacheKey);
    if (cachedResponse) {
      return of(cachedResponse);
    }

    // 執行處理器並快取結果
    return next.handle().pipe(
      tap(async (response) => {
        await this.cacheService.set(cacheKey, response, 300); // 5分鐘
      })
    );
  }
}
```

**超時 Interceptor**：

```typescript
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly timeout: number = 5000) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(this.timeout),
      catchError(err => {
        if (err instanceof TimeoutError) {
          throw new RequestTimeoutException('Request timeout');
        }
        throw err;
      })
    );
  }
}
```

**錯誤處理 Interceptor**：

```typescript
@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(err => {
        if (err instanceof HttpException) {
          throw err;
        }

        // 轉換未預期的錯誤
        throw new InternalServerErrorException({
          message: 'An unexpected error occurred',
          error: err.message,
          timestamp: new Date().toISOString(),
        });
      })
    );
  }
}
```

### 4. Pipes（管道）

#### 基本概念

**定義**：
Pipes 用於轉換或驗證輸入數據。

**特性**：
- 在 Guards 之後、Handler 之前執行
- 可以轉換數據
- 可以驗證數據
- 驗證失敗拋出異常

#### 內建 Pipes

```typescript
@Controller('users')
export class UsersController {
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number // 自動轉換為數字
  ) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto // 驗證 DTO
  ) {
    return this.usersService.create(createUserDto);
  }
}
```

**可用的內建 Pipes**：
- `ValidationPipe`：驗證 DTO
- `ParseIntPipe`：轉換為整數
- `ParseFloatPipe`：轉換為浮點數
- `ParseBoolPipe`：轉換為布林值
- `ParseArrayPipe`：轉換為陣列
- `ParseUUIDPipe`：驗證 UUID
- `ParseEnumPipe`：驗證枚舉值
- `DefaultValuePipe`：設置預設值

#### 自定義 Pipe

**驗證 Pipe**：

```typescript
@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed: must be a number');
    }
    
    if (val <= 0) {
      throw new BadRequestException('Validation failed: must be positive');
    }
    
    return val;
  }
}

// 使用
@Get(':id')
findOne(@Param('id', ParsePositiveIntPipe) id: number) {
  return this.usersService.findOne(id);
}
```

**轉換 Pipe**：

```typescript
@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value === 'string') {
      return value.trim();
    }
    
    if (typeof value === 'object') {
      Object.keys(value).forEach(key => {
        if (typeof value[key] === 'string') {
          value[key] = value[key].trim();
        }
      });
    }
    
    return value;
  }
}
```

**DTO 驗證**：

```typescript
// create-user.dto.ts
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

// 全域啟用
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // 移除未定義的屬性
    forbidNonWhitelisted: true, // 拒絕未定義的屬性
    transform: true, // 自動轉換類型
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  
  await app.listen(3000);
}
```

### 組件組合使用

```typescript
// 全域配置
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全域 Middleware（在 AppModule 中配置）

  // 全域 Pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // 全域 Guards
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalGuards(new RolesGuard(reflector));

  // 全域 Interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalInterceptors(new TimeoutInterceptor(5000));

  // 全域 Exception Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3000);
}
```

**Controller 層級組合**：

```typescript
@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(CacheInterceptor, LoggingInterceptor)
export class PostsController {
  @Post()
  @Roles('admin', 'editor')
  @UsePipes(new ValidationPipe())
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Delete(':id')
  @Roles('admin')
  @RequirePermissions('posts:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }
}
```

## 總結

**執行順序**：
Middleware → Guards → Interceptors(Before) → Pipes → Handler → Interceptors(After) → Exception Filters

**用途對比**：

| 組件 | 主要用途 | 執行時機 | 示例 |
|------|----------|----------|------|
| **Middleware** | 請求預處理、日誌 | 最早 | 日誌、CORS、認證 |
| **Guards** | 授權、權限檢查 | Middleware 後 | JWT驗證、角色檢查 |
| **Interceptors** | 轉換輸入輸出、快取 | Handler 前後 | 日誌、快取、超時 |
| **Pipes** | 驗證、轉換參數 | Handler 前 | DTO驗證、類型轉換 |

**最佳實踐**：
- Middleware：全域配置、請求預處理
- Guards：認證和授權
- Interceptors：日誌、快取、響應轉換
- Pipes：輸入驗證和轉換

理解請求生命週期是構建健壯 NestJS 應用的關鍵。
