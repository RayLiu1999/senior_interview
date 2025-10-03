# NestJS 架構與設計哲學

- **難度**: 6
- **重要程度**: 5
- **標籤**: `NestJS`, `Architecture`, `TypeScript`, `Design Pattern`

## 問題詳述

請深入解釋 NestJS 的架構設計、核心概念、設計哲學，以及它與其他 Node.js 框架（如 Express、Koa）的本質區別。

## 核心理論與詳解

### NestJS 是什麼？

**定義**：
NestJS 是一個用於構建高效、可擴展的 Node.js 服務器端應用的漸進式框架，使用 TypeScript 構建（也支援 JavaScript），結合了 OOP（物件導向程式設計）、FP（函數式程式設計）和 FRP（函數響應式程式設計）的元素。

**核心特點**：
- **TypeScript First**：原生 TypeScript 支援
- **模組化架構**：受 Angular 啟發的模組系統
- **依賴注入**：強大的 IoC 容器
- **裝飾器模式**：大量使用 TypeScript 裝飾器
- **平台無關**：可切換底層框架（Express/Fastify）

### 架構概覽

```
┌─────────────────────────────────────────────────────┐
│                   NestJS Application                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │             Application Layer                │  │
│  │  - Controllers (HTTP Handlers)               │  │
│  │  - GraphQL Resolvers                        │  │
│  │  - WebSocket Gateways                       │  │
│  └──────────────────────────────────────────────┘  │
│                       ↓                            │
│  ┌──────────────────────────────────────────────┐  │
│  │           Business Logic Layer               │  │
│  │  - Services (Business Logic)                 │  │
│  │  - Use Cases                                 │  │
│  └──────────────────────────────────────────────┘  │
│                       ↓                            │
│  ┌──────────────────────────────────────────────┐  │
│  │            Data Access Layer                 │  │
│  │  - Repositories                              │  │
│  │  - ORM Integration (TypeORM, Prisma)        │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │            Cross-Cutting Concerns            │  │
│  │  - Middleware                                │  │
│  │  - Guards (Authorization)                   │  │
│  │  - Interceptors (Transformation, Caching)   │  │
│  │  - Pipes (Validation, Transformation)       │  │
│  │  - Exception Filters                        │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │           Dependency Injection               │  │
│  │           (IoC Container)                    │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │            Module System                     │  │
│  │  - Feature Modules                           │  │
│  │  - Shared Modules                            │  │
│  │  - Dynamic Modules                           │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│          Platform (Express / Fastify)               │
└─────────────────────────────────────────────────────┘
```

### 核心概念

#### 1. 模組（Modules）

**定義**：
模組是組織應用程式結構的基本單位，使用 `@Module()` 裝飾器定義。

**結構**：
```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],      // 導入其他模組
  controllers: [UsersController],  // 註冊控制器
  providers: [UsersService],       // 註冊提供者
  exports: [UsersService]          // 導出提供者供其他模組使用
})
export class UsersModule {}
```

**模組類型**：

| 類型 | 說明 | 範例 |
|------|------|------|
| **Feature Module** | 功能模組，組織特定功能 | UsersModule, ProductsModule |
| **Shared Module** | 共享模組，提供通用功能 | DatabaseModule, ConfigModule |
| **Global Module** | 全域模組，自動在所有模組可用 | @Global() LoggerModule |
| **Dynamic Module** | 動態模組，運行時配置 | ConfigModule.forRoot() |

#### 2. 控制器（Controllers）

**定義**：
處理傳入的 HTTP 請求，並返回響應。

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

#### 3. 提供者（Providers）

**定義**：
可以被注入到其他類別的服務、儲存庫、工廠等。

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private users = [];

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    return this.users.find(user => user.id === id);
  }

  create(user: any) {
    this.users.push(user);
    return user;
  }
}
```

#### 4. 依賴注入（Dependency Injection）

**原理**：
NestJS 使用 IoC（控制反轉）容器管理依賴關係。

```typescript
// 傳統方式（緊耦合）
class UsersController {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService(); // 直接創建
  }
}

// NestJS 方式（鬆耦合）
@Controller('users')
class UsersController {
  constructor(
    private readonly usersService: UsersService // 由 IoC 容器注入
  ) {}
}
```

**依賴注入流程**：
```
1. Module 註冊 Provider
   @Module({ providers: [UsersService] })

2. IoC 容器創建實例
   container.create(UsersService)

3. 注入到需要的地方
   UsersController ← UsersService
```

### 請求生命週期

```
Incoming Request
      ↓
┌─────────────────┐
│  Middleware     │  全域 → 模組 → 路由
└─────────────────┘
      ↓
┌─────────────────┐
│  Guards         │  認證 / 授權檢查
└─────────────────┘
      ↓
┌─────────────────┐
│  Interceptors   │  Before (前置處理)
└─────────────────┘
      ↓
┌─────────────────┐
│  Pipes          │  驗證 / 轉換
└─────────────────┘
      ↓
┌─────────────────┐
│  Controller     │  路由處理器
└─────────────────┘
      ↓
┌─────────────────┐
│  Service        │  業務邏輯
└─────────────────┘
      ↓
┌─────────────────┐
│  Interceptors   │  After (後置處理)
└─────────────────┘
      ↓
┌─────────────────┐
│  Exception      │  錯誤處理
│  Filters        │
└─────────────────┘
      ↓
Outgoing Response
```

### 裝飾器系統

**NestJS 大量使用 TypeScript 裝飾器**：

```typescript
// 類別裝飾器
@Controller('users')
@Injectable()
@Module({})

// 方法裝飾器
@Get()
@Post()
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)

// 參數裝飾器
@Body()
@Param('id')
@Query('search')
@Headers('authorization')
@Req() // Request 物件
@Res() // Response 物件
```

**自定義裝飾器**：
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// 使用
@Get('profile')
getProfile(@User() user: UserEntity) {
  return user;
}
```

### 與其他框架的比較

| 特性 | Express | Koa | NestJS |
|------|---------|-----|--------|
| **哲學** | 極簡主義 | 現代化 | 企業級 |
| **TypeScript** | 需額外配置 | 需額外配置 | 原生支援 |
| **架構** | 無特定架構 | 無特定架構 | 模組化架構 |
| **依賴注入** | 無 | 無 | 內建 |
| **裝飾器** | 無 | 無 | 廣泛使用 |
| **學習曲線** | 低 | 中 | 高 |
| **適合場景** | 小型專案 | 中型專案 | 大型企業應用 |

**Express vs NestJS**：

```typescript
// Express
app.get('/users/:id', async (req, res) => {
  try {
    const user = await usersService.findOne(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NestJS
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
```

### 設計哲學

#### 1. 約定優於配置

```typescript
// 約定的檔案結構
src/
  users/
    users.controller.ts
    users.service.ts
    users.module.ts
    dto/
      create-user.dto.ts
    entities/
      user.entity.ts
```

#### 2. SOLID 原則

**Single Responsibility**（單一職責）：
```typescript
// ❌ Controller 包含業務邏輯
@Controller('users')
class UsersController {
  @Post()
  create(@Body() data) {
    // 直接操作數據庫
    return this.db.users.insert(data);
  }
}

// ✅ 職責分離
@Controller('users')
class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  create(@Body() data) {
    return this.usersService.create(data); // 委託給 Service
  }
}
```

**Dependency Inversion**（依賴反轉）：
```typescript
// ✅ 依賴抽象
interface IUsersRepository {
  findAll(): Promise<User[]>;
}

@Injectable()
class UsersService {
  constructor(
    @Inject('IUsersRepository')
    private repository: IUsersRepository
  ) {}
}
```

#### 3. 模組化與可擴展性

```typescript
// 功能模組可以獨立開發、測試、部署
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule)
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService]
})
export class UsersModule {}

// 在其他模組中使用
@Module({
  imports: [UsersModule],
  providers: [ProfileService]
})
export class ProfileModule {}
```

### 平台適配器

**NestJS 可以切換底層 HTTP 框架**：

```typescript
// Express（預設）
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

// Fastify（更高效能）
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  await app.listen(3000);
}
```

### 完整範例

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全域 Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  await app.listen(3000);
}
bootstrap();

// app.module.ts
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UsersModule, AuthModule],
})
export class AppModule {}

// users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

// users/users.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}

// users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }
}
```

## 總結

**NestJS 核心特點**：
- TypeScript First，強型別
- 模組化架構，可擴展
- 依賴注入，鬆耦合
- 裝飾器模式，聲明式
- 平台無關，可切換

**適用場景**：
- 大型企業應用
- 微服務架構
- 需要強型別的專案
- 團隊協作開發

**設計哲學**：
- 約定優於配置
- SOLID 原則
- 關注點分離
- 可測試性

NestJS 是構建現代、可維護的企業級 Node.js 應用的優秀選擇。
