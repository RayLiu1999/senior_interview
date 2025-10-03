# 測試工具與策略

- **難度**: 6
- **重要程度**: 4
- **標籤**: `Testing`, `Jest`, `Vitest`, `TDD`, `Unit Testing`

## 問題詳述

請深入解釋 Node.js 的測試工具（Jest、Vitest、Mocha）、測試策略（單元測試、整合測試、E2E 測試）、測試覆蓋率以及最佳實踐。

## 核心理論與詳解

### 1. 測試金字塔

```
        ┌─────────────┐
        │  E2E Tests  │  ← 少量（慢、昂貴、脆弱）
        │   (10%)     │
        └─────────────┘
      ┌─────────────────┐
      │Integration Tests│  ← 中等數量（中等速度）
      │      (30%)      │
      └─────────────────┘
    ┌─────────────────────┐
    │    Unit Tests       │  ← 大量（快、便宜、穩定）
    │       (60%)         │
    └─────────────────────┘
```

**原則**：
- **單元測試（60%）**：測試單一函數/類別
- **整合測試（30%）**：測試模組之間的互動
- **E2E 測試（10%）**：測試完整的用戶流程

### 2. Jest - 最流行的測試框架

#### 安裝和配置

```bash
npm install --save-dev jest @types/jest
```

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "coverageDirectory": "coverage",
    "collectCoverageFrom": [
      "src/**/*.{js,ts}",
      "!src/**/*.test.{js,ts}"
    ]
  }
}
```

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
}
```

#### 基本測試

```typescript
// src/utils/math.ts
export function add(a: number, b: number): number {
  return a + b
}

export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero')
  }
  return a / b
}

// src/utils/math.test.ts
import { add, divide } from './math'

describe('Math utils', () => {
  describe('add', () => {
    it('should add two numbers correctly', () => {
      expect(add(2, 3)).toBe(5)
      expect(add(-1, 1)).toBe(0)
    })
    
    it('should handle decimals', () => {
      expect(add(0.1, 0.2)).toBeCloseTo(0.3)
    })
  })
  
  describe('divide', () => {
    it('should divide two numbers correctly', () => {
      expect(divide(10, 2)).toBe(5)
    })
    
    it('should throw error when dividing by zero', () => {
      expect(() => divide(10, 0)).toThrow('Division by zero')
    })
  })
})
```

#### Matchers（斷言）

```typescript
// 相等性
expect(value).toBe(expected)              // ===
expect(value).toEqual(expected)           // 深度相等
expect(value).toStrictEqual(expected)     // 嚴格相等

// 真值
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeNull()
expect(value).toBeUndefined()
expect(value).toBeDefined()

// 數字
expect(value).toBeGreaterThan(3)
expect(value).toBeGreaterThanOrEqual(3)
expect(value).toBeLessThan(5)
expect(value).toBeLessThanOrEqual(5)
expect(value).toBeCloseTo(0.3, 2)        // 浮點數比較

// 字串
expect(str).toMatch(/pattern/)
expect(str).toContain('substring')

// 陣列和物件
expect(arr).toContain(item)
expect(arr).toHaveLength(3)
expect(obj).toHaveProperty('key', value)
expect(obj).toMatchObject({ key: value })

// 錯誤
expect(() => fn()).toThrow()
expect(() => fn()).toThrow(Error)
expect(() => fn()).toThrow('error message')

// Promise
await expect(promise).resolves.toBe(value)
await expect(promise).rejects.toThrow()
```

#### 異步測試

```typescript
// 使用 async/await（推薦）
test('async test', async () => {
  const data = await fetchData()
  expect(data).toBe('success')
})

// 使用 Promise
test('promise test', () => {
  return fetchData().then(data => {
    expect(data).toBe('success')
  })
})

// 使用 done callback（舊方式）
test('callback test', done => {
  fetchData(data => {
    expect(data).toBe('success')
    done()
  })
})
```

#### Mock Functions

```typescript
// 創建 mock 函數
const mockFn = jest.fn()

// 調用
mockFn('arg1', 'arg2')
mockFn('arg3')

// 斷言
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledTimes(2)
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
expect(mockFn).toHaveBeenLastCalledWith('arg3')

// 設置返回值
mockFn.mockReturnValue(42)
mockFn.mockReturnValueOnce(1).mockReturnValueOnce(2)

// 設置 Promise 返回值
mockFn.mockResolvedValue('success')
mockFn.mockRejectedValue(new Error('failed'))

// 實現
mockFn.mockImplementation((x, y) => x + y)
mockFn.mockImplementationOnce(() => 'first call')
```

#### Mock Modules

```typescript
// src/services/api.ts
export async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}

// src/services/user.test.ts
import { fetchUser } from './api'

// Mock 整個模組
jest.mock('./api')

test('should fetch user', async () => {
  // 設置 mock 返回值
  (fetchUser as jest.Mock).mockResolvedValue({
    id: '123',
    name: 'John'
  })
  
  const user = await fetchUser('123')
  expect(user.name).toBe('John')
  expect(fetchUser).toHaveBeenCalledWith('123')
})
```

**部分 Mock**：

```typescript
jest.mock('./api', () => ({
  ...jest.requireActual('./api'),  // 保留其他函數
  fetchUser: jest.fn()              // 只 mock fetchUser
}))
```

#### Spies

```typescript
// 監視物件方法
const obj = {
  method: (x: number) => x * 2
}

const spy = jest.spyOn(obj, 'method')

obj.method(5)

expect(spy).toHaveBeenCalledWith(5)
expect(spy).toHaveReturnedWith(10)

// 恢復原始實現
spy.mockRestore()
```

#### Setup and Teardown

```typescript
// 每個測試前/後
beforeEach(() => {
  // 初始化
  console.log('before each test')
})

afterEach(() => {
  // 清理
  console.log('after each test')
})

// 所有測試前/後
beforeAll(() => {
  console.log('before all tests')
})

afterAll(() => {
  console.log('after all tests')
})
```

### 3. Vitest - 現代化的測試框架

```bash
npm install --save-dev vitest
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov']
    }
  }
})
```

**優勢**：
- 基於 Vite，啟動超快
- 與 Jest 相容的 API
- 原生 ESM 支援
- 內建 TypeScript 支援
- 更好的 watch 模式

```typescript
import { describe, it, expect, vi } from 'vitest'

describe('Math utils', () => {
  it('should add numbers', () => {
    expect(1 + 1).toBe(2)
  })
})

// Mock（使用 vi 而非 jest）
const mockFn = vi.fn()
vi.mock('./api')
```

### 4. 單元測試範例

```typescript
// src/services/user.service.ts
import { User, UserRepository } from './types'

export class UserService {
  constructor(private userRepo: UserRepository) {}
  
  async createUser(data: { name: string; email: string }): Promise<User> {
    // 驗證
    if (!data.email.includes('@')) {
      throw new Error('Invalid email')
    }
    
    // 檢查是否已存在
    const existing = await this.userRepo.findByEmail(data.email)
    if (existing) {
      throw new Error('User already exists')
    }
    
    // 創建用戶
    return this.userRepo.create(data)
  }
  
  async getUserById(id: string): Promise<User | null> {
    return this.userRepo.findById(id)
  }
}

// src/services/user.service.test.ts
import { UserService } from './user.service'
import { UserRepository } from './types'

describe('UserService', () => {
  let service: UserService
  let mockRepo: jest.Mocked<UserRepository>
  
  beforeEach(() => {
    // 創建 mock repository
    mockRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn()
    }
    
    service = new UserService(mockRepo)
  })
  
  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = { name: 'John', email: 'john@example.com' }
      const createdUser = { id: '123', ...userData }
      
      mockRepo.findByEmail.mockResolvedValue(null)
      mockRepo.create.mockResolvedValue(createdUser)
      
      const result = await service.createUser(userData)
      
      expect(result).toEqual(createdUser)
      expect(mockRepo.findByEmail).toHaveBeenCalledWith('john@example.com')
      expect(mockRepo.create).toHaveBeenCalledWith(userData)
    })
    
    it('should throw error for invalid email', async () => {
      const userData = { name: 'John', email: 'invalid' }
      
      await expect(service.createUser(userData))
        .rejects.toThrow('Invalid email')
      
      expect(mockRepo.create).not.toHaveBeenCalled()
    })
    
    it('should throw error if user already exists', async () => {
      const userData = { name: 'John', email: 'john@example.com' }
      
      mockRepo.findByEmail.mockResolvedValue({ id: '123', ...userData })
      
      await expect(service.createUser(userData))
        .rejects.toThrow('User already exists')
      
      expect(mockRepo.create).not.toHaveBeenCalled()
    })
  })
  
  describe('getUserById', () => {
    it('should return user if found', async () => {
      const user = { id: '123', name: 'John', email: 'john@example.com' }
      
      mockRepo.findById.mockResolvedValue(user)
      
      const result = await service.getUserById('123')
      
      expect(result).toEqual(user)
      expect(mockRepo.findById).toHaveBeenCalledWith('123')
    })
    
    it('should return null if not found', async () => {
      mockRepo.findById.mockResolvedValue(null)
      
      const result = await service.getUserById('999')
      
      expect(result).toBeNull()
    })
  })
})
```

### 5. 整合測試範例

```typescript
// test/integration/api.test.ts
import request from 'supertest'
import { app } from '../../src/app'
import { db } from '../../src/database'

describe('User API', () => {
  beforeAll(async () => {
    // 連接測試資料庫
    await db.connect(process.env.TEST_DATABASE_URL)
  })
  
  afterAll(async () => {
    // 斷開連接
    await db.disconnect()
  })
  
  beforeEach(async () => {
    // 清空資料庫
    await db.query('TRUNCATE TABLE users CASCADE')
  })
  
  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com'
        })
        .expect(201)
      
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: 'John Doe',
        email: 'john@example.com'
      })
      
      // 驗證資料庫
      const user = await db.query('SELECT * FROM users WHERE id = $1', [
        response.body.id
      ])
      expect(user.rows[0].name).toBe('John Doe')
    })
    
    it('should return 400 for invalid email', async () => {
      await request(app)
        .post('/api/users')
        .send({
          name: 'John',
          email: 'invalid'
        })
        .expect(400)
    })
  })
  
  describe('GET /api/users/:id', () => {
    it('should return user by id', async () => {
      // 準備測試數據
      const user = await db.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        ['John', 'john@example.com']
      )
      
      const response = await request(app)
        .get(`/api/users/${user.rows[0].id}`)
        .expect(200)
      
      expect(response.body.name).toBe('John')
    })
    
    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/users/999')
        .expect(404)
    })
  })
})
```

### 6. E2E 測試

```typescript
// e2e/user-flow.test.ts
import { test, expect } from '@playwright/test'

test.describe('User Registration Flow', () => {
  test('complete user registration', async ({ page }) => {
    // 1. 訪問首頁
    await page.goto('http://localhost:3000')
    
    // 2. 點擊註冊按鈕
    await page.click('text=Sign Up')
    
    // 3. 填寫表單
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="email"]', 'john@example.com')
    await page.fill('input[name="password"]', 'SecurePass123')
    
    // 4. 提交表單
    await page.click('button[type="submit"]')
    
    // 5. 驗證重定向到儀表板
    await expect(page).toHaveURL('http://localhost:3000/dashboard')
    
    // 6. 驗證歡迎消息
    await expect(page.locator('text=Welcome, John Doe')).toBeVisible()
  })
  
  test('show error for duplicate email', async ({ page }) => {
    await page.goto('http://localhost:3000/signup')
    
    await page.fill('input[name="email"]', 'existing@example.com')
    await page.fill('input[name="password"]', 'password')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Email already exists')).toBeVisible()
  })
})
```

### 7. 測試覆蓋率

```bash
# 執行測試並生成覆蓋率報告
npm test -- --coverage

# 查看覆蓋率
open coverage/lcov-report/index.html
```

**覆蓋率指標**：
- **Statements（語句覆蓋率）**：執行了多少語句
- **Branches（分支覆蓋率）**：if/else 等分支是否都執行
- **Functions（函數覆蓋率）**：有多少函數被調用
- **Lines（行覆蓋率）**：執行了多少行代碼

```typescript
// 設置覆蓋率門檻
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### 8. 測試最佳實踐

#### AAA 模式

```typescript
test('should add user', async () => {
  // Arrange（準備）
  const userData = { name: 'John', email: 'john@example.com' }
  const mockRepo = createMockRepo()
  const service = new UserService(mockRepo)
  
  // Act（執行）
  const result = await service.createUser(userData)
  
  // Assert（斷言）
  expect(result.name).toBe('John')
})
```

#### 測試命名

```typescript
// ❌ 不好
test('test1', () => {})

// ✅ 好
test('should create user with valid data', () => {})

// ✅ 使用 describe 組織
describe('UserService', () => {
  describe('createUser', () => {
    test('should create user with valid data', () => {})
    test('should throw error for invalid email', () => {})
  })
})
```

#### 獨立性

```typescript
// ❌ 不好：測試之間有依賴
let userId: string

test('create user', async () => {
  const user = await createUser()
  userId = user.id  // 依賴
})

test('get user', async () => {
  const user = await getUser(userId)  // 依賴上一個測試
})

// ✅ 好：每個測試獨立
test('create user', async () => {
  const user = await createUser()
  expect(user.id).toBeDefined()
})

test('get user', async () => {
  const user = await createUser()  // 自己創建
  const retrieved = await getUser(user.id)
  expect(retrieved).toEqual(user)
})
```

#### 不要測試實作細節

```typescript
// ❌ 不好：測試實作
test('should call internal method', () => {
  const spy = jest.spyOn(service, '_internalMethod')
  service.publicMethod()
  expect(spy).toHaveBeenCalled()
})

// ✅ 好：測試行為
test('should return correct result', () => {
  const result = service.publicMethod()
  expect(result).toBe(expectedValue)
})
```

### 9. CI/CD 整合

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## 總結

**測試工具對比**：

| 工具 | 優勢 | 適用場景 |
|------|------|----------|
| **Jest** | 功能齊全、成熟 | 通用測試 |
| **Vitest** | 速度快、現代化 | Vite 專案 |
| **Mocha** | 靈活、可配置 | 自定義需求 |

**測試類型**：
- **單元測試（60%）**：快速、獨立、大量
- **整合測試（30%）**：模組互動、資料庫
- **E2E 測試（10%）**：完整流程、用戶視角

**最佳實踐**：
- ✅ 使用 AAA 模式
- ✅ 測試行為而非實作
- ✅ 保持測試獨立
- ✅ 使用有意義的測試名稱
- ✅ 追求 80%+ 覆蓋率
- ✅ Mock 外部依賴
- ✅ 在 CI/CD 中自動運行

**覆蓋率目標**：
- 關鍵業務邏輯：90%+
- 一般代碼：80%+
- 工具函數：100%

理解測試工具和策略是確保代碼質量的關鍵。
