# 異常處理與過濾器

- **難度**: 6
- **重要程度**: 4
- **標籤**: `Exception Filters`, `Error Handling`, `HTTP Exceptions`

## 問題詳述

請深入解釋 NestJS 的異常處理機制、Exception Filters 的工作原理、內建異常類型以及如何實現自定義異常處理策略。

## 核心理論與詳解

### 異常處理流程

```
Route Handler
      ↓
   拋出異常
      ↓
Exception Layer 捕獲
      ↓
┌──────────────────────────────┐
│  尋找適用的 Exception Filter │
│  1. Route-level Filter       │
│  2. Controller-level Filter  │
│  3. Global Filter            │
│  4. Built-in Filter          │
└──────────────────────────────┘
      ↓
格式化錯誤響應
      ↓
返回給客戶端
```

### 內建 HTTP 異常

**常用異常類型**：

```typescript
import {
  BadRequestException,          // 400
  UnauthorizedException,        // 401
  ForbiddenException,           // 403
  NotFoundException,            // 404
  MethodNotAllowedException,    // 405
  NotAcceptableException,       // 406
  RequestTimeoutException,      // 408
  ConflictException,            // 409
  GoneException,                // 410
  UnprocessableEntityException, // 422
  InternalServerErrorException, // 500
  NotImplementedException,      // 501
  BadGatewayException,          // 502
  ServiceUnavailableException,  // 503
  GatewayTimeoutException,      // 504
} from '@nestjs/common';
```

**基本使用**：

```typescript
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(+id);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email
    );
    
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    
    return this.usersService.create(createUserDto);
  }
}
```

**自定義異常訊息**：

```typescript
// 簡單訊息
throw new BadRequestException('Invalid user data');

// 詳細訊息
throw new BadRequestException({
  statusCode: 400,
  message: 'Validation failed',
  errors: [
    { field: 'email', message: 'Invalid email format' },
    { field: 'password', message: 'Password too short' }
  ]
});

// 包含原因
throw new BadRequestException('Invalid data', 'UserValidationError');
```

### Exception Filters

#### 基本 Filter

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exceptionResponse['message'] || exception.message,
    };

    response.status(status).json(errorResponse);
  }
}
```

#### 捕獲所有異常

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

#### 帶日誌的 Filter

```typescript
@Catch()
export class LoggingExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(LoggingExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(exception instanceof HttpException && {
        details: exception.getResponse()
      })
    };

    // 記錄錯誤
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : exception,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - ${message}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
```

### 自定義異常類別

```typescript
// domain-exception.base.ts
export abstract class DomainException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    public readonly code: string,
    public readonly details?: any
  ) {
    super(
      {
        statusCode: status,
        message,
        code,
        details,
        timestamp: new Date().toISOString(),
      },
      status
    );
  }
}

// user-not-found.exception.ts
export class UserNotFoundException extends DomainException {
  constructor(userId: number) {
    super(
      `User with ID ${userId} not found`,
      HttpStatus.NOT_FOUND,
      'USER_NOT_FOUND',
      { userId }
    );
  }
}

// invalid-credentials.exception.ts
export class InvalidCredentialsException extends DomainException {
  constructor() {
    super(
      'Invalid email or password',
      HttpStatus.UNAUTHORIZED,
      'INVALID_CREDENTIALS'
    );
  }
}

// email-already-exists.exception.ts
export class EmailAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super(
      'Email address is already in use',
      HttpStatus.CONFLICT,
      'EMAIL_EXISTS',
      { email }
    );
  }
}

// 使用
@Injectable()
export class UsersService {
  async findOne(id: number): Promise<User> {
    const user = await this.repository.findById(id);
    
    if (!user) {
      throw new UserNotFoundException(id);
    }
    
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.repository.findByEmail(
      createUserDto.email
    );
    
    if (existing) {
      throw new EmailAlreadyExistsException(createUserDto.email);
    }
    
    return this.repository.create(createUserDto);
  }
}
```

### 業務邏輯異常

```typescript
// business-rule-exception.ts
export class BusinessRuleException extends DomainException {
  constructor(rule: string, details?: any) {
    super(
      `Business rule violation: ${rule}`,
      HttpStatus.UNPROCESSABLE_ENTITY,
      'BUSINESS_RULE_VIOLATION',
      { rule, ...details }
    );
  }
}

// 使用案例
@Injectable()
export class OrdersService {
  async createOrder(userId: number, orderData: CreateOrderDto) {
    const user = await this.usersService.findOne(userId);

    // 業務規則：用戶必須驗證郵箱
    if (!user.emailVerified) {
      throw new BusinessRuleException(
        'Email must be verified before placing orders',
        { userId, email: user.email }
      );
    }

    // 業務規則：訂單金額必須大於最小值
    if (orderData.totalAmount < 10) {
      throw new BusinessRuleException(
        'Minimum order amount is $10',
        { amount: orderData.totalAmount, minimum: 10 }
      );
    }

    // 業務規則：庫存檢查
    const hasStock = await this.inventoryService.checkAvailability(
      orderData.items
    );

    if (!hasStock) {
      throw new BusinessRuleException(
        'One or more items are out of stock',
        { items: orderData.items }
      );
    }

    return this.repository.create(orderData);
  }
}
```

### 全域 Exception Filter

```typescript
// global-exception.filter.ts
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    // 確定狀態碼
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 構建響應體
    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
      method: request.method,
      message: this.getExceptionMessage(exception),
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
        raw: exception,
      }),
    };

    // 記錄錯誤
    this.logException(exception, request, httpStatus);

    // 發送響應
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private getExceptionMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return typeof response === 'string' ? response : response['message'];
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Internal server error';
  }

  private logException(
    exception: unknown,
    request: any,
    status: number
  ): void {
    const message = `${request.method} ${request.url} - ${status}`;

    if (status >= 500) {
      this.logger.error(
        message,
        exception instanceof Error ? exception.stack : JSON.stringify(exception)
      );
    } else if (status >= 400) {
      this.logger.warn(message);
    }
  }
}

// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 獲取 HttpAdapterHost
  const httpAdapterHost = app.get(HttpAdapterHost);

  // 註冊全域 Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapterHost));

  await app.listen(3000);
}
```

### 驗證異常處理

```typescript
// validation-exception.filter.ts
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    // 檢查是否為驗證錯誤
    if (exceptionResponse.message && Array.isArray(exceptionResponse.message)) {
      const validationErrors = this.formatValidationErrors(
        exceptionResponse.message
      );

      return response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    // 一般 BadRequest
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exceptionResponse.message || 'Bad Request',
    });
  }

  private formatValidationErrors(errors: string[]): any[] {
    return errors.map(error => {
      const [field, ...messageParts] = error.split(' ');
      return {
        field: field.replace(/^[a-z]/, letter => letter.toLowerCase()),
        message: messageParts.join(' '),
        constraint: this.extractConstraint(error),
      };
    });
  }

  private extractConstraint(error: string): string {
    // 從錯誤訊息中提取約束類型
    if (error.includes('should not be empty')) return 'isNotEmpty';
    if (error.includes('must be an email')) return 'isEmail';
    if (error.includes('must be a string')) return 'isString';
    if (error.includes('must be a number')) return 'isNumber';
    return 'unknown';
  }
}
```

### 特定異常處理

```typescript
// database-exception.filter.ts
@Catch(QueryFailedError, EntityNotFoundError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: QueryFailedError | EntityNotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error occurred';
    let code = 'DATABASE_ERROR';

    if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Resource not found';
      code = 'ENTITY_NOT_FOUND';
    } else if (exception instanceof QueryFailedError) {
      // 根據 SQL 錯誤代碼判斷
      const error = exception as any;
      
      if (error.code === '23505') { // PostgreSQL unique violation
        status = HttpStatus.CONFLICT;
        message = 'Resource already exists';
        code = 'DUPLICATE_ENTRY';
      } else if (error.code === '23503') { // Foreign key violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Referenced resource does not exist';
        code = 'FOREIGN_KEY_VIOLATION';
      }
    }

    this.logger.error(
      `Database error: ${exception.message}`,
      exception.stack
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && {
        details: exception.message,
      }),
    });
  }
}
```

### 非同步異常處理

```typescript
@Injectable()
export class UsersService {
  constructor(
    private repository: UsersRepository,
    private emailService: EmailService,
    private logger: Logger,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // 使用 try-catch 捕獲非同步錯誤
    try {
      const user = await this.repository.create(createUserDto);

      // 非同步發送郵件（不阻塞）
      this.sendWelcomeEmail(user).catch(error => {
        // 記錄但不拋出異常
        this.logger.error(
          `Failed to send welcome email to ${user.email}`,
          error.stack
        );
      });

      return user;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Email already exists');
      }
      throw error; // 重新拋出未處理的錯誤
    }
  }

  private async sendWelcomeEmail(user: User): Promise<void> {
    await this.emailService.send({
      to: user.email,
      subject: 'Welcome!',
      template: 'welcome',
      context: { name: user.name },
    });
  }
}
```

### 應用 Exception Filters

**方法層級**：

```typescript
@Post()
@UseFilters(ValidationExceptionFilter)
create(@Body() createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```

**控制器層級**：

```typescript
@Controller('users')
@UseFilters(HttpExceptionFilter)
export class UsersController {
  // 所有方法都使用此 Filter
}
```

**全域層級**：

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalFilters(
    new GlobalExceptionFilter(),
    new ValidationExceptionFilter(),
    new DatabaseExceptionFilter(),
  );
  
  await app.listen(3000);
}

// 或在 AppModule 中
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
```

### 完整案例

```typescript
// exceptions/index.ts
export * from './domain-exception.base';
export * from './user-not-found.exception';
export * from './invalid-credentials.exception';
export * from './business-rule.exception';

// filters/index.ts
export * from './global-exception.filter';
export * from './validation-exception.filter';
export * from './database-exception.filter';

// main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import {
  GlobalExceptionFilter,
  ValidationExceptionFilter,
  DatabaseExceptionFilter,
} from './filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全域 Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        // 自定義驗證錯誤格式
        const messages = errors.map(error => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        }));
        return new BadRequestException({
          message: 'Validation failed',
          errors: messages,
        });
      },
    }),
  );

  // 全域 Exception Filters（順序重要）
  app.useGlobalFilters(
    new GlobalExceptionFilter(app.get(HttpAdapterHost)),
    new DatabaseExceptionFilter(),
    new ValidationExceptionFilter(),
  );

  await app.listen(3000);
}

bootstrap();
```

## 總結

**異常處理層次**：
1. 內建 HTTP 異常（快速使用）
2. 自定義異常類別（業務邏輯）
3. Exception Filters（統一處理）
4. 全域錯誤處理（兜底）

**最佳實踐**：
- 使用語義化的異常類型
- 提供清晰的錯誤訊息
- 包含錯誤碼便於追蹤
- 開發環境顯示詳細訊息
- 生產環境隱藏敏感資訊
- 記錄所有 500 錯誤

**Filter 應用**：
- 全域 Filter：通用錯誤處理
- 特定 Filter：特殊類型異常
- 組合使用：完整的錯誤處理策略

理解異常處理機制是構建穩定 NestJS 應用的重要一環。
