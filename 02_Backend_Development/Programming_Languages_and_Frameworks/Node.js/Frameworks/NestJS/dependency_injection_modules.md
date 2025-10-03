# 依賴注入與模組系統

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Dependency Injection`, `IoC`, `Modules`, `Providers`

## 問題詳述

請深入解釋 NestJS 的依賴注入（DI）機制、IoC 容器的工作原理、模組的組織方式以及 Provider 的作用域管理。

## 核心理論與詳解

### 依賴注入（Dependency Injection）

#### 什麼是依賴注入？

**定義**：
依賴注入是一種設計模式，用於實現控制反轉（IoC），讓物件的依賴關係由外部容器管理，而不是由物件自己創建。

**傳統方式 vs DI 方式**：

```typescript
// ❌ 傳統方式（緊耦合）
class UsersController {
  private usersService: UsersService;

  constructor() {
    // 直接創建依賴，緊耦合
    this.usersService = new UsersService(new DatabaseService());
  }

  getUsers() {
    return this.usersService.findAll();
  }
}

// ✅ DI 方式（鬆耦合）
@Controller('users')
class UsersController {
  constructor(
    // 依賴由 IoC 容器注入
    private readonly usersService: UsersService
  ) {}

  @Get()
  getUsers() {
    return this.usersService.findAll();
  }
}
```

**DI 的優點**：
- **鬆耦合**：類別之間依賴抽象而非具體實現
- **可測試性**：容易 mock 依賴進行單元測試
- **可維護性**：修改依賴不影響使用方
- **可重用性**：同一個服務可以在多處使用
- **生命週期管理**：容器統一管理物件的創建和銷毀

### IoC 容器工作原理

```
┌────────────────────────────────────────────────┐
│           NestJS IoC Container                 │
├────────────────────────────────────────────────┤
│                                                │
│  1. 收集 Metadata（透過裝飾器）                │
│     @Injectable(), @Module(), etc.            │
│                                                │
│  2. 建立依賴圖                                 │
│     分析類別之間的依賴關係                     │
│                                                │
│  3. 解析依賴                                   │
│     遞迴解析所有依賴                           │
│                                                │
│  4. 實例化                                     │
│     按照依賴順序創建實例                       │
│                                                │
│  5. 注入依賴                                   │
│     將依賴注入到需要的地方                     │
│                                                │
│  6. 快取實例（根據作用域）                     │
│     Singleton: 全局唯一                        │
│     Request: 每個請求一個                      │
│     Transient: 每次注入都新建                 │
│                                                │
└────────────────────────────────────────────────┘
```

**依賴解析流程**：

```typescript
// 1. 定義 Provider
@Injectable()
class DatabaseService {
  connect() { /* ... */ }
}

@Injectable()
class UsersRepository {
  constructor(private db: DatabaseService) {}
}

@Injectable()
class UsersService {
  constructor(private repo: UsersRepository) {}
}

@Controller('users')
class UsersController {
  constructor(private service: UsersService) {}
}

// 2. 容器解析依賴
/*
UsersController
    ↓ 需要
UsersService
    ↓ 需要
UsersRepository
    ↓ 需要
DatabaseService

解析順序（從底層往上）：
1. 創建 DatabaseService
2. 創建 UsersRepository（注入 DatabaseService）
3. 創建 UsersService（注入 UsersRepository）
4. 創建 UsersController（注入 UsersService）
*/
```

### Provider 註冊方式

#### 1. 標準 Provider（類別）

```typescript
@Module({
  providers: [UsersService], // 簡寫
  // 等同於
  providers: [
    {
      provide: UsersService,
      useClass: UsersService,
    }
  ]
})
```

#### 2. 自定義 Provider（使用別名）

```typescript
@Module({
  providers: [
    {
      provide: UsersService, // Token
      useClass: UsersServiceImpl, // 實際實現
    }
  ]
})

// 使用
@Controller()
class UsersController {
  constructor(
    private usersService: UsersService // 得到 UsersServiceImpl
  ) {}
}
```

#### 3. 值 Provider（useValue）

```typescript
// 提供常量或配置
const configObject = {
  database: {
    host: 'localhost',
    port: 5432
  }
};

@Module({
  providers: [
    {
      provide: 'CONFIG',
      useValue: configObject,
    }
  ]
})

// 使用
@Injectable()
class DatabaseService {
  constructor(@Inject('CONFIG') private config: any) {
    console.log(this.config.database.host);
  }
}
```

#### 4. 工廠 Provider（useFactory）

```typescript
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async (config: ConfigService) => {
        const connection = await createConnection({
          host: config.get('DB_HOST'),
          port: config.get('DB_PORT'),
        });
        return connection;
      },
      inject: [ConfigService], // 工廠函數的依賴
    }
  ]
})

// 非同步工廠
@Module({
  providers: [
    {
      provide: 'ASYNC_VALUE',
      useFactory: async () => {
        const value = await fetchFromAPI();
        return value;
      },
    }
  ]
})
```

#### 5. 別名 Provider（useExisting）

```typescript
// 為現有 Provider 創建別名
@Injectable()
class LoggerService {
  log(message: string) { /* ... */ }
}

@Module({
  providers: [
    LoggerService,
    {
      provide: 'Logger',
      useExisting: LoggerService, // 別名
    }
  ]
})

// 兩種方式都可以使用
class MyService {
  constructor(
    private logger1: LoggerService,      // 方式 1
    @Inject('Logger') private logger2    // 方式 2（同一個實例）
  ) {}
}
```

### 注入方式

#### 1. 建構函數注入（推薦）

```typescript
@Injectable()
class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailService: EmailService,
    @Inject('CONFIG') private config: any,
  ) {}
}
```

#### 2. 屬性注入

```typescript
@Injectable()
class UsersService {
  @Inject(UsersRepository)
  private readonly usersRepository: UsersRepository;

  @Inject('CONFIG')
  private readonly config: any;
}
```

#### 3. 可選依賴

```typescript
@Injectable()
class UsersService {
  constructor(
    @Optional() @Inject('OPTIONAL_SERVICE') private service?: any
  ) {
    if (this.service) {
      // 服務存在時使用
    }
  }
}
```

### Provider 作用域

```
┌──────────────────────────────────────────┐
│         Provider Scopes                  │
├──────────────────────────────────────────┤
│                                          │
│  DEFAULT (Singleton)                     │
│  ├─ 應用程式啟動時創建                   │
│  ├─ 全局共享一個實例                     │
│  └─ 適用於：無狀態服務、配置、連接池     │
│                                          │
│  REQUEST                                 │
│  ├─ 每個請求創建新實例                   │
│  ├─ 請求結束後銷毀                       │
│  └─ 適用於：需要請求上下文的服務         │
│                                          │
│  TRANSIENT                               │
│  ├─ 每次注入都創建新實例                 │
│  ├─ 不共享                               │
│  └─ 適用於：有狀態的服務                 │
│                                          │
└──────────────────────────────────────────┘
```

#### DEFAULT（Singleton）

```typescript
@Injectable() // 預設是 Singleton
class UsersService {
  private cache = new Map();

  findAll() {
    return Array.from(this.cache.values());
  }
}

// 所有地方注入的都是同一個實例
```

#### REQUEST（請求作用域）

```typescript
@Injectable({ scope: Scope.REQUEST })
class RequestScopedService {
  constructor(@Inject(REQUEST) private request: Request) {
    // 可以訪問請求物件
    console.log(this.request.url);
  }
}

// 注意：使用 REQUEST 作用域會影響性能
// 每個請求都會創建新的實例鏈
```

**REQUEST 作用域的依賴傳播**：

```typescript
@Injectable({ scope: Scope.REQUEST })
class RequestService {}

@Injectable()
class UsersService {
  constructor(private requestService: RequestService) {}
  // UsersService 自動變成 REQUEST 作用域
}

@Controller()
class UsersController {
  constructor(private usersService: UsersService) {}
  // UsersController 也自動變成 REQUEST 作用域
}
```

#### TRANSIENT（瞬態）

```typescript
@Injectable({ scope: Scope.TRANSIENT })
class TransientService {
  constructor() {
    console.log('New instance created');
  }
}

class ServiceA {
  constructor(private transient: TransientService) {} // 實例 1
}

class ServiceB {
  constructor(private transient: TransientService) {} // 實例 2
}
// 每次注入都是不同的實例
```

### 模組系統

#### 模組結構

```typescript
@Module({
  imports: [],      // 導入其他模組
  controllers: [],  // 註冊控制器
  providers: [],    // 註冊提供者
  exports: [],      // 導出提供者供其他模組使用
})
export class MyModule {}
```

#### 功能模組（Feature Module）

```typescript
// users.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService], // 導出給其他模組使用
})
export class UsersModule {}

// app.module.ts
@Module({
  imports: [
    UsersModule,  // 導入功能模組
    AuthModule,
    ProductsModule,
  ],
})
export class AppModule {}
```

#### 共享模組（Shared Module）

```typescript
// shared.module.ts
@Module({
  providers: [
    LoggerService,
    CacheService,
    ConfigService,
  ],
  exports: [
    LoggerService,
    CacheService,
    ConfigService,
  ],
})
export class SharedModule {}

// 在其他模組中使用
@Module({
  imports: [SharedModule],
  // 現在可以使用 LoggerService, CacheService, ConfigService
})
export class UsersModule {}
```

#### 全域模組（Global Module）

```typescript
@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}

// 在 AppModule 中註冊一次
@Module({
  imports: [LoggerModule],
})
export class AppModule {}

// 其他模組無需 import 就可以使用
@Module({
  // 無需 imports: [LoggerModule]
  providers: [UsersService], // UsersService 可以直接注入 LoggerService
})
export class UsersModule {}
```

#### 動態模組（Dynamic Module）

```typescript
// database.module.ts
@Module({})
export class DatabaseModule {
  static forRoot(options: DatabaseOptions): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: 'DATABASE_OPTIONS',
          useValue: options,
        },
        {
          provide: 'DATABASE_CONNECTION',
          useFactory: async (opts: DatabaseOptions) => {
            return await createConnection(opts);
          },
          inject: ['DATABASE_OPTIONS'],
        },
      ],
      exports: ['DATABASE_CONNECTION'],
    };
  }

  static forRootAsync(options: DatabaseAsyncOptions): DynamicModule {
    return {
      module: DatabaseModule,
      imports: options.imports || [],
      providers: [
        {
          provide: 'DATABASE_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: 'DATABASE_CONNECTION',
          useFactory: async (opts: DatabaseOptions) => {
            return await createConnection(opts);
          },
          inject: ['DATABASE_OPTIONS'],
        },
      ],
      exports: ['DATABASE_CONNECTION'],
    };
  }
}

// 使用
@Module({
  imports: [
    DatabaseModule.forRoot({
      host: 'localhost',
      port: 5432,
      database: 'mydb',
    }),
  ],
})
export class AppModule {}

// 或非同步配置
@Module({
  imports: [
    DatabaseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        database: config.get('DB_NAME'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### 循環依賴處理

#### 問題示例

```typescript
// ❌ 循環依賴
@Injectable()
class UsersService {
  constructor(private authService: AuthService) {}
}

@Injectable()
class AuthService {
  constructor(private usersService: UsersService) {}
}
// Error: Circular dependency detected
```

#### 解決方案 1：forwardRef

```typescript
@Injectable()
class UsersService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService
  ) {}
}

@Injectable()
class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService
  ) {}
}
```

#### 解決方案 2：ModuleRef（推薦）

```typescript
import { ModuleRef } from '@nestjs/core';

@Injectable()
class UsersService {
  private authService: AuthService;

  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.authService = this.moduleRef.get(AuthService, { strict: false });
  }
}
```

#### 解決方案 3：重構（最佳）

```typescript
// 創建一個中間服務
@Injectable()
class UserAuthService {
  validateUser(userId: string, password: string) {
    // 驗證邏輯
  }
}

@Injectable()
class UsersService {
  constructor(private userAuthService: UserAuthService) {}
}

@Injectable()
class AuthService {
  constructor(private userAuthService: UserAuthService) {}
}
```

### 模組導入導出規則

```typescript
// 模組 A
@Module({
  providers: [ServiceA, ServiceB],
  exports: [ServiceA], // 只導出 ServiceA
})
export class ModuleA {}

// 模組 B
@Module({
  imports: [ModuleA],
  // 可以使用 ServiceA，但不能使用 ServiceB
})
export class ModuleB {}

// 模組 C（重新導出）
@Module({
  imports: [ModuleA],
  exports: [ModuleA], // 重新導出整個模組
})
export class ModuleC {}

// 模組 D
@Module({
  imports: [ModuleC],
  // 可以使用 ModuleA 導出的 ServiceA
})
export class ModuleD {}
```

### 自定義裝飾器與 DI

```typescript
// 創建自定義注入裝飾器
export const InjectRepository = (entity: Function) => {
  return Inject(`${entity.name}Repository`);
};

// 使用
@Injectable()
class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
}
```

### 實際案例

#### 完整的模組化應用結構

```typescript
// config.module.ts
@Global()
@Module({
  providers: [
    {
      provide: ConfigService,
      useValue: new ConfigService(`.env.${process.env.NODE_ENV}`),
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {}

// database.module.ts
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'DATABASE_CONNECTION',
          useFactory: async (config: ConfigService) => {
            return await createConnection({
              type: 'postgres',
              host: config.get('DB_HOST'),
              port: config.get('DB_PORT'),
              username: config.get('DB_USER'),
              password: config.get('DB_PASS'),
              database: config.get('DB_NAME'),
            });
          },
          inject: [ConfigService],
        },
      ],
      exports: ['DATABASE_CONNECTION'],
    };
  }
}

// users.module.ts
@Module({
  imports: [DatabaseModule.forRoot()],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'USERS_REPOSITORY',
      useFactory: (connection: Connection) => {
        return connection.getRepository(User);
      },
      inject: ['DATABASE_CONNECTION'],
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}

// auth.module.ts
@Module({
  imports: [
    UsersModule, // 導入 UsersModule 以使用 UsersService
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}

// app.module.ts
@Module({
  imports: [
    ConfigModule,
    DatabaseModule.forRoot(),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
```

### 測試中的依賴注入

```typescript
// users.service.spec.ts
describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should find all users', async () => {
    const users = [{ id: 1, name: 'John' }];
    jest.spyOn(repository, 'find').mockResolvedValue(users as any);

    expect(await service.findAll()).toBe(users);
  });
});
```

## 總結

**依賴注入核心**：
- IoC 容器管理依賴
- 通過裝飾器聲明依賴
- 支援多種注入方式
- 靈活的作用域管理

**Provider 註冊**：
- useClass：標準類別
- useValue：常量值
- useFactory：工廠函數
- useExisting：別名

**模組系統**：
- Feature Module：功能模組
- Shared Module：共享模組
- Global Module：全域模組
- Dynamic Module：動態配置

**最佳實踐**：
- 優先使用建構函數注入
- 避免循環依賴
- 合理使用作用域
- 模組化組織代碼
- 善用動態模組

理解 DI 和模組系統是掌握 NestJS 的關鍵。
