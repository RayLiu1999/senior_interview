# Providers 與 Services

- **難度**: 5
- **重要程度**: 5
- **標籤**: `Providers`, `Services`, `Injectable`, `業務邏輯`

## 問題詳述

請深入解釋 NestJS 中 Provider 的概念、Service 層的設計原則、不同類型的 Provider 以及它們的應用場景。

## 核心理論與詳解

### Provider 概念

**定義**：
Provider 是 NestJS 中可以被注入為依賴的類別。幾乎任何東西都可以是 Provider：服務、儲存庫、工廠、輔助函數等。

**關鍵特徵**：
- 使用 `@Injectable()` 裝飾器標記
- 可以通過依賴注入使用
- 由 NestJS IoC 容器管理生命週期

```typescript
@Injectable()
export class UsersService {
  // 這是一個 Provider
}
```

### Provider 類型

```
┌────────────────────────────────────────┐
│         Provider Types                 │
├────────────────────────────────────────┤
│                                        │
│  1. Services                           │
│     業務邏輯層                         │
│                                        │
│  2. Repositories                       │
│     數據訪問層                         │
│                                        │
│  3. Factories                          │
│     對象創建邏輯                       │
│                                        │
│  4. Helpers/Utilities                  │
│     輔助工具函數                       │
│                                        │
│  5. Custom Providers                   │
│     自定義提供者                       │
│                                        │
└────────────────────────────────────────┘
```

### Services（服務層）

#### 基本 Service

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private users: User[] = [];

  findAll(): User[] {
    return this.users;
  }

  findOne(id: number): User {
    return this.users.find(user => user.id === id);
  }

  create(user: User): User {
    this.users.push(user);
    return user;
  }

  update(id: number, updateData: Partial<User>): User {
    const user = this.findOne(id);
    Object.assign(user, updateData);
    return user;
  }

  delete(id: number): void {
    this.users = this.users.filter(user => user.id !== id);
  }
}
```

#### Service 的職責

**單一職責原則**：

```typescript
// ❌ 違反單一職責
@Injectable()
export class UsersService {
  findAll() { /* 查詢用戶 */ }
  sendEmail() { /* 發送郵件 */ }
  processPayment() { /* 處理支付 */ }
  generateReport() { /* 生成報告 */ }
}

// ✅ 符合單一職責
@Injectable()
export class UsersService {
  constructor(
    private emailService: EmailService,
    private paymentService: PaymentService,
    private reportService: ReportService,
  ) {}

  async createUser(data: CreateUserDto) {
    const user = await this.create(data);
    await this.emailService.sendWelcomeEmail(user.email);
    return user;
  }

  private create(data: CreateUserDto) {
    // 只負責用戶相關邏輯
  }
}
```

#### 分層架構

```
┌─────────────────────────────────────┐
│         Controller Layer            │
│  - 處理 HTTP 請求                   │
│  - 驗證輸入                         │
│  - 返回響應                         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│          Service Layer              │
│  - 業務邏輯                         │
│  - 協調多個 Repository              │
│  - 事務管理                         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│        Repository Layer             │
│  - 數據訪問                         │
│  - ORM 操作                         │
│  - 查詢構建                         │
└─────────────────────────────────────┘
```

**實現**：

```typescript
// users.controller.ts
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(@Query() query: QueryDto) {
    return this.usersService.findAll(query);
  }
}

// users.service.ts
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailService: EmailService,
    private readonly cacheService: CacheService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 業務邏輯
    const existingUser = await this.usersRepository.findByEmail(
      createUserDto.email
    );

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.usersRepository.create(createUserDto);

    // 發送歡迎郵件
    await this.emailService.sendWelcomeEmail(user.email);

    // 清除快取
    await this.cacheService.del('users:all');

    return user;
  }

  async findAll(query: QueryDto): Promise<User[]> {
    const cacheKey = `users:${JSON.stringify(query)}`;
    
    // 檢查快取
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    // 查詢數據庫
    const users = await this.usersRepository.findAll(query);

    // 設置快取
    await this.cacheService.set(cacheKey, users, 300);

    return users;
  }
}

// users.repository.ts
@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    const user = this.userModel.create(data);
    return this.userModel.save(user);
  }

  async findAll(query: QueryDto): Promise<User[]> {
    return this.userModel.find({
      where: query.filters,
      skip: query.skip,
      take: query.take,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ where: { email } });
  }
}
```

### Repositories（儲存庫模式）

#### 基本 Repository

```typescript
@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
```

#### 抽象 Repository

```typescript
// base-repository.interface.ts
export interface IBaseRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: number): Promise<T>;
  create(data: Partial<T>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T>;
  delete(id: number): Promise<void>;
}

// base.repository.ts
export abstract class BaseRepository<T> implements IBaseRepository<T> {
  constructor(private readonly repository: Repository<T>) {}

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async findById(id: number): Promise<T> {
    const entity = await this.repository.findOne({ where: { id } as any });
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    return entity;
  }

  async create(data: Partial<T>): Promise<T> {
    const entity = this.repository.create(data as any);
    return this.repository.save(entity);
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    await this.repository.update(id, data as any);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}

// users.repository.ts
@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {
    super(usersRepository);
  }

  // 特定於 User 的方法
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.usersRepository.find({ where: { isActive: true } });
  }
}
```

### Factories（工廠模式）

```typescript
// user.factory.ts
@Injectable()
export class UserFactory {
  create(type: 'admin' | 'regular', data: CreateUserDto): User {
    const user = new User();
    user.email = data.email;
    user.name = data.name;

    if (type === 'admin') {
      user.roles = ['admin', 'user'];
      user.permissions = this.getAdminPermissions();
    } else {
      user.roles = ['user'];
      user.permissions = this.getRegularPermissions();
    }

    return user;
  }

  private getAdminPermissions(): string[] {
    return ['read', 'write', 'delete', 'admin'];
  }

  private getRegularPermissions(): string[] {
    return ['read', 'write'];
  }
}

// 使用
@Injectable()
export class UsersService {
  constructor(private readonly userFactory: UserFactory) {}

  async createAdmin(data: CreateUserDto): Promise<User> {
    const user = this.userFactory.create('admin', data);
    return this.usersRepository.save(user);
  }
}
```

### Helper/Utility Providers

```typescript
// crypto.service.ts
@Injectable()
export class CryptoService {
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

// date.service.ts
@Injectable()
export class DateService {
  now(): Date {
    return new Date();
  }

  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  isExpired(date: Date): boolean {
    return date < this.now();
  }
}

// 使用
@Injectable()
export class AuthService {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly dateService: DateService,
  ) {}

  async createUser(data: CreateUserDto) {
    const hashedPassword = await this.cryptoService.hash(data.password);
    const expiresAt = this.dateService.addDays(this.dateService.now(), 30);

    return {
      ...data,
      password: hashedPassword,
      expiresAt,
    };
  }
}
```

### 自定義 Providers

#### 1. Class Provider

```typescript
@Module({
  providers: [
    {
      provide: UsersService,
      useClass: UsersServiceImpl,
    },
  ],
})
export class UsersModule {}
```

#### 2. Value Provider

```typescript
const mockUsersService = {
  findAll: () => [],
  findOne: (id: number) => null,
};

@Module({
  providers: [
    {
      provide: UsersService,
      useValue: mockUsersService,
    },
  ],
})
export class UsersModule {}
```

#### 3. Factory Provider

```typescript
@Module({
  providers: [
    {
      provide: 'LOGGER',
      useFactory: (config: ConfigService) => {
        const env = config.get('NODE_ENV');
        return env === 'production'
          ? new ProductionLogger()
          : new DevelopmentLogger();
      },
      inject: [ConfigService],
    },
  ],
})
export class LoggerModule {}
```

#### 4. Async Factory Provider

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
      inject: [ConfigService],
    },
  ],
})
export class DatabaseModule {}
```

### Service 設計模式

#### 1. 單一服務原則

```typescript
// ✅ 好的設計
@Injectable()
export class UsersService {
  // 只處理用戶相關的業務邏輯
  async createUser(data: CreateUserDto) { }
  async updateUser(id: number, data: UpdateUserDto) { }
  async deleteUser(id: number) { }
}

@Injectable()
export class AuthService {
  // 只處理認證相關的業務邏輯
  async login(credentials: LoginDto) { }
  async validateUser(email: string, password: string) { }
  async generateToken(user: User) { }
}
```

#### 2. 依賴抽象而非具體實現

```typescript
// user-notification.interface.ts
export interface IUserNotificationService {
  sendWelcomeEmail(email: string): Promise<void>;
  sendPasswordReset(email: string, token: string): Promise<void>;
}

// email-notification.service.ts
@Injectable()
export class EmailNotificationService implements IUserNotificationService {
  async sendWelcomeEmail(email: string): Promise<void> {
    // 通過 SMTP 發送
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    // 通過 SMTP 發送
  }
}

// sms-notification.service.ts
@Injectable()
export class SmsNotificationService implements IUserNotificationService {
  async sendWelcomeEmail(email: string): Promise<void> {
    // 通過 SMS 發送
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    // 通過 SMS 發送
  }
}

// users.service.ts
@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserNotificationService')
    private notificationService: IUserNotificationService,
  ) {}

  async createUser(data: CreateUserDto) {
    const user = await this.repository.create(data);
    await this.notificationService.sendWelcomeEmail(user.email);
    return user;
  }
}

// 配置
@Module({
  providers: [
    {
      provide: 'IUserNotificationService',
      useClass: process.env.NOTIFICATION_TYPE === 'sms'
        ? SmsNotificationService
        : EmailNotificationService,
    },
  ],
})
export class UsersModule {}
```

#### 3. 事務管理

```typescript
@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly paymentsService: PaymentsService,
    private readonly inventoryService: InventoryService,
    private readonly connection: Connection,
  ) {}

  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 創建訂單
      const order = await this.ordersRepository.create(orderData, queryRunner);

      // 2. 處理支付
      const payment = await this.paymentsService.process(
        order.id,
        orderData.paymentInfo,
        queryRunner
      );

      // 3. 更新庫存
      await this.inventoryService.decreaseStock(
        orderData.items,
        queryRunner
      );

      // 提交事務
      await queryRunner.commitTransaction();

      return order;
    } catch (error) {
      // 回滾事務
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // 釋放連接
      await queryRunner.release();
    }
  }
}
```

### 實際應用案例

#### 完整的用戶管理服務

```typescript
// users.service.ts
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
    private readonly emailService: EmailService,
    private readonly cacheService: CacheService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(UsersService.name);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);

    // 檢查用戶是否已存在
    const existingUser = await this.usersRepository.findByEmail(
      createUserDto.email
    );

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // 加密密碼
    const hashedPassword = await this.cryptoService.hash(
      createUserDto.password
    );

    // 創建用戶
    const user = await this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // 發送歡迎郵件
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    // 清除快取
    await this.cacheService.del('users:all');

    this.logger.log(`User created successfully: ${user.id}`);

    return user;
  }

  async findAll(query: QueryDto): Promise<PaginatedResult<User>> {
    const cacheKey = `users:list:${JSON.stringify(query)}`;

    // 檢查快取
    const cached = await this.cacheService.get<PaginatedResult<User>>(cacheKey);
    if (cached) {
      this.logger.debug('Returning cached users list');
      return cached;
    }

    // 查詢數據庫
    const [users, total] = await this.usersRepository.findAndCount(query);

    const result: PaginatedResult<User> = {
      data: users,
      total,
      page: query.page,
      limit: query.limit,
    };

    // 設置快取（5分鐘）
    await this.cacheService.set(cacheKey, result, 300);

    return result;
  }

  async findOne(id: number): Promise<User> {
    const cacheKey = `users:${id}`;

    // 檢查快取
    const cached = await this.cacheService.get<User>(cacheKey);
    if (cached) return cached;

    // 查詢數據庫
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // 設置快取
    await this.cacheService.set(cacheKey, user, 600);

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // 如果更新密碼，需要加密
    if (updateUserDto.password) {
      updateUserDto.password = await this.cryptoService.hash(
        updateUserDto.password
      );
    }

    // 更新用戶
    const updatedUser = await this.usersRepository.update(id, updateUserDto);

    // 清除相關快取
    await Promise.all([
      this.cacheService.del(`users:${id}`),
      this.cacheService.del('users:all'),
    ]);

    this.logger.log(`User updated: ${id}`);

    return updatedUser;
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id); // 確保用戶存在

    await this.usersRepository.delete(id);

    // 清除快取
    await Promise.all([
      this.cacheService.del(`users:${id}`),
      this.cacheService.del('users:all'),
    ]);

    this.logger.log(`User deleted: ${id}`);
  }
}
```

## 總結

**Provider 核心**：
- 使用 @Injectable() 標記
- 由 IoC 容器管理
- 可以注入到其他類別

**Service 設計原則**：
- 單一職責
- 依賴抽象
- 分層架構
- 可測試性

**常見 Provider 類型**：
- Services：業務邏輯
- Repositories：數據訪問
- Factories：對象創建
- Helpers：輔助工具

**最佳實踐**：
- 保持 Service 輕量
- 使用 Repository 模式
- 適當的錯誤處理
- 添加日誌記錄
- 使用快取優化性能

理解 Provider 和 Service 是構建可維護 NestJS 應用的基礎。
