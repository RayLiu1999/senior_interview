# TypeScript 裝飾器與元編程

- **難度**: 7
- **重要程度**: 3
- **標籤**: `Decorators`, `Metadata`, `Metaprogramming`, `NestJS`

## 問題詳述

請深入解釋 TypeScript 的裝飾器（Decorators）、元數據反射（Reflect Metadata）以及元編程技術，並展示實際應用場景。

## 核心理論與詳解

### 1. 裝飾器概述

**裝飾器**是一種特殊的聲明，可以附加到類、方法、屬性或參數上，用於修改其行為。

**啟用裝飾器**：

```json
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

**裝飾器類型**：
1. **類裝飾器（Class Decorators）**
2. **方法裝飾器（Method Decorators）**
3. **屬性裝飾器（Property Decorators）**
4. **參數裝飾器（Parameter Decorators）**
5. **訪問器裝飾器（Accessor Decorators）**

### 2. 類裝飾器

#### 基本語法

```typescript
function sealed(constructor: Function) {
  Object.seal(constructor)
  Object.seal(constructor.prototype)
}

@sealed
class Greeter {
  greeting: string
  
  constructor(message: string) {
    this.greeting = message
  }
  
  greet() {
    return `Hello, ${this.greeting}`
  }
}
```

#### 裝飾器工廠

```typescript
function Component(options: { selector: string; template: string }) {
  return function (constructor: Function) {
    console.log(`Component created: ${options.selector}`)
    constructor.prototype.selector = options.selector
    constructor.prototype.template = options.template
  }
}

@Component({
  selector: 'app-user',
  template: '<div>User Component</div>'
})
class UserComponent {}
```

#### 替換構造函數

```typescript
function Injectable<T extends { new(...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    // 添加新屬性
    injectionDate = new Date()
    
    // 重寫方法
    toString() {
      return `Injectable: ${constructor.name}`
    }
  }
}

@Injectable
class Service {
  name = 'MyService'
}

const service = new Service()
console.log(service.injectionDate)  // 當前日期
console.log(service.toString())     // 'Injectable: Service'
```

### 3. 方法裝飾器

```typescript
function Log(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value
  
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with args:`, args)
    const result = originalMethod.apply(this, args)
    console.log(`Result:`, result)
    return result
  }
  
  return descriptor
}

class Calculator {
  @Log
  add(a: number, b: number): number {
    return a + b
  }
}

const calc = new Calculator()
calc.add(2, 3)
// 輸出：
// Calling add with args: [2, 3]
// Result: 5
```

#### 性能測量裝飾器

```typescript
function Measure(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value
  
  descriptor.value = async function (...args: any[]) {
    const start = performance.now()
    const result = await originalMethod.apply(this, args)
    const end = performance.now()
    console.log(`${propertyKey} took ${end - start}ms`)
    return result
  }
  
  return descriptor
}

class UserService {
  @Measure
  async fetchUsers() {
    // 模擬 API 請求
    await new Promise(resolve => setTimeout(resolve, 1000))
    return [{ id: 1, name: 'John' }]
  }
}
```

#### 快取裝飾器

```typescript
function Memoize(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value
  const cache = new Map()
  
  descriptor.value = function (...args: any[]) {
    const key = JSON.stringify(args)
    
    if (cache.has(key)) {
      console.log('Cache hit!')
      return cache.get(key)
    }
    
    const result = originalMethod.apply(this, args)
    cache.set(key, result)
    return result
  }
  
  return descriptor
}

class MathService {
  @Memoize
  fibonacci(n: number): number {
    if (n <= 1) return n
    return this.fibonacci(n - 1) + this.fibonacci(n - 2)
  }
}
```

### 4. 屬性裝飾器

```typescript
function MinLength(length: number) {
  return function (target: any, propertyKey: string) {
    let value: string
    
    const getter = function () {
      return value
    }
    
    const setter = function (newValue: string) {
      if (newValue.length < length) {
        throw new Error(
          `${propertyKey} must be at least ${length} characters`
        )
      }
      value = newValue
    }
    
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    })
  }
}

class User {
  @MinLength(3)
  username: string = ''
  
  @MinLength(8)
  password: string = ''
}

const user = new User()
user.username = 'ab'  // ❌ Error: username must be at least 3 characters
user.username = 'john'  // ✅
```

#### 只讀屬性

```typescript
function Readonly(target: any, propertyKey: string) {
  Object.defineProperty(target, propertyKey, {
    writable: false
  })
}

class Config {
  @Readonly
  apiUrl = 'https://api.example.com'
}

const config = new Config()
// config.apiUrl = 'https://other.com'  // ❌ 不可修改
```

### 5. 參數裝飾器

```typescript
function Required(
  target: any,
  propertyKey: string,
  parameterIndex: number
) {
  const existingRequiredParameters: number[] =
    Reflect.getOwnMetadata('required', target, propertyKey) || []
  
  existingRequiredParameters.push(parameterIndex)
  
  Reflect.defineMetadata(
    'required',
    existingRequiredParameters,
    target,
    propertyKey
  )
}

function Validate(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value
  
  descriptor.value = function (...args: any[]) {
    const requiredParameters: number[] =
      Reflect.getOwnMetadata('required', target, propertyKey) || []
    
    for (const index of requiredParameters) {
      if (args[index] === undefined || args[index] === null) {
        throw new Error(`Parameter at index ${index} is required`)
      }
    }
    
    return originalMethod.apply(this, args)
  }
}

class UserService {
  @Validate
  createUser(@Required name: string, @Required email: string, age?: number) {
    console.log(`Creating user: ${name}, ${email}`)
  }
}

const service = new UserService()
service.createUser('John', 'john@example.com')  // ✅
// service.createUser('John', null)  // ❌ Error: Parameter at index 1 is required
```

### 6. Reflect Metadata

```bash
npm install reflect-metadata
```

```typescript
import 'reflect-metadata'

// 定義元數據
Reflect.defineMetadata('role', 'admin', User.prototype, 'login')

// 讀取元數據
const role = Reflect.getMetadata('role', User.prototype, 'login')
console.log(role)  // 'admin'

// 檢查元數據是否存在
const hasRole = Reflect.hasMetadata('role', User.prototype, 'login')
```

#### 設計時類型元數據

```typescript
import 'reflect-metadata'

function LogType(target: any, key: string) {
  const type = Reflect.getMetadata('design:type', target, key)
  console.log(`${key} type: ${type.name}`)
}

class Demo {
  @LogType
  name!: string  // name type: String
  
  @LogType
  age!: number   // age type: Number
}
```

### 7. 實戰範例：依賴注入

```typescript
import 'reflect-metadata'

// 服務容器
const container = new Map<string, any>()

// @Injectable 裝飾器
function Injectable() {
  return function (target: any) {
    Reflect.defineMetadata('injectable', true, target)
  }
}

// @Inject 裝飾器
function Inject(token: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const existingInjections: Array<{ index: number; token: string }> =
      Reflect.getOwnMetadata('injections', target) || []
    
    existingInjections.push({ index: parameterIndex, token })
    
    Reflect.defineMetadata('injections', existingInjections, target)
  }
}

// 創建實例
function createInstance<T>(target: new (...args: any[]) => T): T {
  const injections: Array<{ index: number; token: string }> =
    Reflect.getMetadata('injections', target) || []
  
  const args = injections
    .sort((a, b) => a.index - b.index)
    .map(injection => container.get(injection.token))
  
  return new target(...args)
}

// 使用範例
@Injectable()
class Logger {
  log(message: string) {
    console.log(`[LOG] ${message}`)
  }
}

@Injectable()
class Database {
  connect() {
    console.log('Connected to database')
  }
}

@Injectable()
class UserService {
  constructor(
    @Inject('Logger') private logger: Logger,
    @Inject('Database') private db: Database
  ) {}
  
  getUsers() {
    this.logger.log('Fetching users...')
    this.db.connect()
    return []
  }
}

// 註冊服務
container.set('Logger', new Logger())
container.set('Database', new Database())

// 創建 UserService 實例
const userService = createInstance(UserService)
userService.getUsers()
```

### 8. 實戰範例：路由裝飾器（類似 NestJS）

```typescript
import 'reflect-metadata'

// HTTP 方法裝飾器
function Get(path: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('path', path, target, propertyKey)
    Reflect.defineMetadata('method', 'GET', target, propertyKey)
  }
}

function Post(path: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('path', path, target, propertyKey)
    Reflect.defineMetadata('method', 'POST', target, propertyKey)
  }
}

// 控制器裝飾器
function Controller(basePath: string) {
  return function (target: Function) {
    Reflect.defineMetadata('basePath', basePath, target)
  }
}

// 使用範例
@Controller('/users')
class UserController {
  @Get('/')
  getUsers() {
    return [{ id: 1, name: 'John' }]
  }
  
  @Get('/:id')
  getUserById() {
    return { id: 1, name: 'John' }
  }
  
  @Post('/')
  createUser() {
    return { id: 2, name: 'Jane' }
  }
}

// 路由註冊器
function registerRoutes(controllers: Function[]) {
  const routes: Array<{
    method: string
    path: string
    handler: Function
  }> = []
  
  for (const controller of controllers) {
    const basePath = Reflect.getMetadata('basePath', controller)
    const prototype = controller.prototype
    
    for (const propertyKey of Object.getOwnPropertyNames(prototype)) {
      const path = Reflect.getMetadata('path', prototype, propertyKey)
      const method = Reflect.getMetadata('method', prototype, propertyKey)
      
      if (path && method) {
        routes.push({
          method,
          path: basePath + path,
          handler: prototype[propertyKey]
        })
      }
    }
  }
  
  return routes
}

const routes = registerRoutes([UserController])
console.log(routes)
// [
//   { method: 'GET', path: '/users/', handler: [Function] },
//   { method: 'GET', path: '/users/:id', handler: [Function] },
//   { method: 'POST', path: '/users/', handler: [Function] }
// ]
```

### 9. 實戰範例：驗證裝飾器

```typescript
import 'reflect-metadata'

// 驗證裝飾器
function IsEmail(target: any, propertyKey: string) {
  Reflect.defineMetadata('validation:email', true, target, propertyKey)
}

function MinLength(length: number) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('validation:minLength', length, target, propertyKey)
  }
}

function Max(max: number) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('validation:max', max, target, propertyKey)
  }
}

// 驗證函數
function validate(obj: any): string[] {
  const errors: string[] = []
  
  for (const propertyKey of Object.keys(obj)) {
    // Email 驗證
    if (Reflect.getMetadata('validation:email', obj, propertyKey)) {
      const value = obj[propertyKey]
      if (!value || !value.includes('@')) {
        errors.push(`${propertyKey} must be a valid email`)
      }
    }
    
    // MinLength 驗證
    const minLength = Reflect.getMetadata(
      'validation:minLength',
      obj,
      propertyKey
    )
    if (minLength !== undefined) {
      const value = obj[propertyKey]
      if (!value || value.length < minLength) {
        errors.push(
          `${propertyKey} must be at least ${minLength} characters`
        )
      }
    }
    
    // Max 驗證
    const max = Reflect.getMetadata('validation:max', obj, propertyKey)
    if (max !== undefined) {
      const value = obj[propertyKey]
      if (value > max) {
        errors.push(`${propertyKey} must not exceed ${max}`)
      }
    }
  }
  
  return errors
}

// 使用範例
class CreateUserDto {
  @MinLength(3)
  username!: string
  
  @IsEmail
  email!: string
  
  @Max(120)
  age!: number
}

const dto = new CreateUserDto()
dto.username = 'ab'
dto.email = 'invalid'
dto.age = 150

const errors = validate(dto)
console.log(errors)
// [
//   'username must be at least 3 characters',
//   'email must be a valid email',
//   'age must not exceed 120'
// ]
```

### 10. 裝飾器執行順序

```typescript
function ClassDecorator(name: string) {
  return function (constructor: Function) {
    console.log(`Class: ${name}`)
  }
}

function PropertyDecorator(name: string) {
  return function (target: any, propertyKey: string) {
    console.log(`Property: ${name}`)
  }
}

function MethodDecorator(name: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    console.log(`Method: ${name}`)
  }
}

function ParameterDecorator(name: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    console.log(`Parameter: ${name}`)
  }
}

@ClassDecorator('Class')
class MyClass {
  @PropertyDecorator('Property')
  myProperty!: string
  
  @MethodDecorator('Method')
  myMethod(@ParameterDecorator('Parameter') param: string) {}
}

// 輸出順序：
// Property: Property
// Parameter: Parameter
// Method: Method
// Class: Class
```

**執行順序規則**：
1. **屬性裝飾器** → **參數裝飾器** → **方法裝飾器** → **類裝飾器**
2. 同類型裝飾器：**從下到上**執行

```typescript
@First()
@Second()
class MyClass {}

// 執行順序：Second → First
```

### 11. 裝飾器組合

```typescript
function compose(...decorators: MethodDecorator[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    decorators.reverse().forEach(decorator => {
      decorator(target, propertyKey, descriptor)
    })
  }
}

class UserService {
  @compose(Log, Measure, Memoize)
  async getUsers() {
    // ...
  }
}
```

## 總結

**裝飾器類型**：

| 類型 | 簽名 | 用途 |
|------|------|------|
| 類裝飾器 | `(constructor: Function) => void` | 修改類 |
| 方法裝飾器 | `(target, key, descriptor) => void` | 修改方法 |
| 屬性裝飾器 | `(target, key) => void` | 修改屬性 |
| 參數裝飾器 | `(target, key, index) => void` | 標記參數 |

**常見應用場景**：
- **依賴注入**：NestJS 的 `@Injectable()`, `@Inject()`
- **路由定義**：`@Controller()`, `@Get()`, `@Post()`
- **驗證**：`@IsEmail()`, `@MinLength()`, `@Max()`
- **日誌**：`@Log()`, `@Trace()`
- **快取**：`@Cacheable()`, `@Memoize()`
- **權限控制**：`@Roles()`, `@Auth()`
- **性能測量**：`@Measure()`, `@Profile()`

**最佳實踐**：
- ✅ 使用裝飾器工廠（允許參數配置）
- ✅ 結合 `reflect-metadata` 儲存元數據
- ✅ 保持裝飾器單一職責
- ✅ 注意裝飾器執行順序
- ✅ 使用 TypeScript 5.0+ Stage 3 裝飾器（推薦）

**TypeScript 5.0+ Stage 3 裝飾器**：
```typescript
// 舊版（Experimental Decorators）
function Log(target: any, key: string, descriptor: PropertyDescriptor) {
  // ...
}

// 新版（Stage 3 Decorators）
function Log(target: Function, context: ClassMethodDecoratorContext) {
  // ...
}
```

裝飾器是 TypeScript 元編程的核心工具，廣泛應用於 NestJS、Angular 等現代框架。
