# TypeScript 進階類型系統

- **難度**: 8
- **重要程度**: 4
- **標籤**: `TypeScript`, `Generics`, `Conditional Types`, `Mapped Types`, `Utility Types`

## 問題詳述

請深入解釋 TypeScript 的進階類型系統，包括泛型、條件類型、映射類型、工具類型以及類型推斷等概念。

## 核心理論與詳解

### 1. 泛型（Generics）

#### 基本泛型

```typescript
// 泛型函數
function identity<T>(arg: T): T {
  return arg
}

const result1 = identity<string>('hello')  // string
const result2 = identity(42)               // number（類型推斷）

// 泛型接口
interface Box<T> {
  value: T
}

const stringBox: Box<string> = { value: 'hello' }
const numberBox: Box<number> = { value: 42 }
```

#### 泛型約束

```typescript
// 約束泛型必須有 length 屬性
interface Lengthwise {
  length: number
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length)
  return arg
}

logLength('hello')        // ✅ string 有 length
logLength([1, 2, 3])      // ✅ array 有 length
logLength({ length: 10 }) // ✅ 符合接口
// logLength(42)          // ❌ number 沒有 length
```

#### 多個泛型參數

```typescript
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn)
}

const numbers = [1, 2, 3]
const strings = map(numbers, n => n.toString())  // string[]
```

#### 泛型類別

```typescript
class GenericNumber<T> {
  zeroValue: T
  add: (x: T, y: T) => T
  
  constructor(zero: T, addFn: (x: T, y: T) => T) {
    this.zeroValue = zero
    this.add = addFn
  }
}

const myNumber = new GenericNumber<number>(0, (x, y) => x + y)
const myString = new GenericNumber<string>('', (x, y) => x + y)
```

#### 泛型約束實戰

```typescript
// 確保 key 是 obj 的鍵
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const person = { name: 'John', age: 30 }
getProperty(person, 'name')  // ✅ 'John'
// getProperty(person, 'email')  // ❌ 'email' 不是 person 的鍵
```

### 2. 條件類型（Conditional Types）

#### 基本語法

```typescript
// T extends U ? X : Y
type IsString<T> = T extends string ? true : false

type A = IsString<string>  // true
type B = IsString<number>  // false
```

#### 分布式條件類型

```typescript
type ToArray<T> = T extends any ? T[] : never

type A = ToArray<string | number>  // string[] | number[]
// 等同於 ToArray<string> | ToArray<number>
```

#### infer 關鍵字

```typescript
// 推斷函數返回類型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never

type Func = (a: number) => string
type Result = ReturnType<Func>  // string

// 推斷 Promise 的值類型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

type A = UnwrapPromise<Promise<string>>  // string
type B = UnwrapPromise<number>           // number
```

#### 實戰範例：提取參數類型

```typescript
type Parameters<T> = T extends (...args: infer P) => any ? P : never

type Func = (a: string, b: number) => void
type Params = Parameters<Func>  // [a: string, b: number]

// 提取第一個參數類型
type FirstParameter<T> = T extends (first: infer F, ...rest: any[]) => any
  ? F
  : never

type First = FirstParameter<Func>  // string
```

### 3. 映射類型（Mapped Types）

#### 基本映射

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

type Partial<T> = {
  [P in keyof T]?: T[P]
}

interface User {
  id: number
  name: string
}

type ReadonlyUser = Readonly<User>
// { readonly id: number; readonly name: string }

type PartialUser = Partial<User>
// { id?: number; name?: string }
```

#### 鍵重映射

```typescript
// 為所有屬性加上 get 前綴
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P]
}

interface User {
  name: string
  age: number
}

type UserGetters = Getters<User>
// {
//   getName: () => string
//   getAge: () => number
// }
```

#### 過濾屬性

```typescript
// 移除 null 和 undefined
type NonNullable<T> = {
  [P in keyof T]: NonNullable<T[P]>
}

// 只保留函數屬性
type FunctionProperties<T> = {
  [P in keyof T as T[P] extends Function ? P : never]: T[P]
}

interface User {
  name: string
  age: number
  greet: () => void
  farewell: () => void
}

type UserFunctions = FunctionProperties<User>
// { greet: () => void; farewell: () => void }
```

### 4. 工具類型（Utility Types）

#### Partial\<T\>

```typescript
type Partial<T> = {
  [P in keyof T]?: T[P]
}

interface User {
  id: number
  name: string
  email: string
}

function updateUser(id: number, updates: Partial<User>) {
  // 只需提供部分屬性
}

updateUser(1, { name: 'John' })  // ✅
```

#### Required\<T\>

```typescript
type Required<T> = {
  [P in keyof T]-?: T[P]  // -? 移除可選修飾符
}

interface Config {
  host?: string
  port?: number
}

type RequiredConfig = Required<Config>
// { host: string; port: number }
```

#### Readonly\<T\>

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

const user: Readonly<User> = {
  id: 1,
  name: 'John',
  email: 'john@example.com'
}

// user.name = 'Jane'  // ❌ 不可修改
```

#### Pick\<T, K\>

```typescript
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

interface User {
  id: number
  name: string
  email: string
  age: number
}

type UserPreview = Pick<User, 'id' | 'name'>
// { id: number; name: string }
```

#### Omit\<T, K\>

```typescript
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

type UserWithoutEmail = Omit<User, 'email'>
// { id: number; name: string; age: number }
```

#### Record\<K, T\>

```typescript
type Record<K extends keyof any, T> = {
  [P in K]: T
}

type UserRole = 'admin' | 'user' | 'guest'
type Permissions = Record<UserRole, string[]>

const permissions: Permissions = {
  admin: ['read', 'write', 'delete'],
  user: ['read', 'write'],
  guest: ['read']
}
```

#### Exclude\<T, U\> & Extract\<T, U\>

```typescript
type Exclude<T, U> = T extends U ? never : T
type Extract<T, U> = T extends U ? T : never

type A = Exclude<'a' | 'b' | 'c', 'a'>  // 'b' | 'c'
type B = Extract<'a' | 'b' | 'c', 'a' | 'b'>  // 'a' | 'b'
```

#### ReturnType\<T\> & Parameters\<T\>

```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never
type Parameters<T> = T extends (...args: infer P) => any ? P : never

function getUser(id: number): { name: string; age: number } {
  return { name: 'John', age: 30 }
}

type User = ReturnType<typeof getUser>
// { name: string; age: number }

type Params = Parameters<typeof getUser>
// [id: number]
```

#### Awaited\<T\>

```typescript
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T

type A = Awaited<Promise<string>>                  // string
type B = Awaited<Promise<Promise<number>>>         // number
type C = Awaited<Promise<string> | number>         // string | number
```

### 5. 模板字面量類型（Template Literal Types）

```typescript
type Greeting = `Hello, ${string}!`

const greeting1: Greeting = 'Hello, World!'  // ✅
const greeting2: Greeting = 'Hi, World!'     // ❌

// 組合類型
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type Endpoint = '/users' | '/posts'
type Route = `${HTTPMethod} ${Endpoint}`

const route: Route = 'GET /users'  // ✅

// Capitalize, Uncapitalize, Uppercase, Lowercase
type CapitalizedName = Capitalize<'john'>  // 'John'
type UppercaseName = Uppercase<'john'>     // 'JOHN'
```

### 6. 類型推斷

#### as const

```typescript
// 不使用 as const
const colors = ['red', 'green', 'blue']
// colors: string[]

// 使用 as const
const colors = ['red', 'green', 'blue'] as const
// colors: readonly ['red', 'green', 'blue']

type Color = typeof colors[number]  // 'red' | 'green' | 'blue'
```

#### 函數返回類型推斷

```typescript
function createUser(name: string, age: number) {
  return { name, age, createdAt: new Date() }
}

type User = ReturnType<typeof createUser>
// { name: string; age: number; createdAt: Date }
```

### 7. 類型守衛（Type Guards）

#### typeof 守衛

```typescript
function padLeft(value: string, padding: string | number) {
  if (typeof padding === 'number') {
    return ' '.repeat(padding) + value  // padding: number
  }
  return padding + value  // padding: string
}
```

#### instanceof 守衛

```typescript
class Dog {
  bark() { console.log('Woof!') }
}

class Cat {
  meow() { console.log('Meow!') }
}

function speak(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark()  // animal: Dog
  } else {
    animal.meow()  // animal: Cat
  }
}
```

#### 自定義類型守衛

```typescript
interface Fish {
  swim: () => void
}

interface Bird {
  fly: () => void
}

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined
}

function move(pet: Fish | Bird) {
  if (isFish(pet)) {
    pet.swim()  // pet: Fish
  } else {
    pet.fly()   // pet: Bird
  }
}
```

#### 可辨識聯合（Discriminated Unions）

```typescript
interface Circle {
  kind: 'circle'
  radius: number
}

interface Square {
  kind: 'square'
  sideLength: number
}

type Shape = Circle | Square

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2  // shape: Circle
    case 'square':
      return shape.sideLength ** 2        // shape: Square
  }
}
```

### 8. 索引訪問類型

```typescript
interface User {
  id: number
  name: string
  address: {
    city: string
    country: string
  }
}

type UserId = User['id']                    // number
type UserName = User['name']                // string
type Address = User['address']              // { city: string; country: string }
type City = User['address']['city']         // string

// 使用聯合類型索引
type UserField = User['id' | 'name']        // number | string
```

### 9. 實戰範例：深度 Readonly

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P]
}

interface User {
  name: string
  address: {
    city: string
    country: string
  }
}

type ReadonlyUser = DeepReadonly<User>
// {
//   readonly name: string
//   readonly address: {
//     readonly city: string
//     readonly country: string
//   }
// }
```

### 10. 實戰範例：深度 Partial

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P]
}

const user: DeepPartial<User> = {
  address: {
    city: 'Taipei'  // 不需要提供 country
  }
}
```

### 11. 品牌類型（Branded Types）

```typescript
// 防止不同單位的數字混用
type USD = number & { readonly brand: unique symbol }
type EUR = number & { readonly brand: unique symbol }

function usd(amount: number): USD {
  return amount as USD
}

function eur(amount: number): EUR {
  return amount as EUR
}

const price1 = usd(100)
const price2 = eur(100)

function processUSD(amount: USD) {
  console.log(`Processing $${amount}`)
}

processUSD(price1)  // ✅
// processUSD(price2)  // ❌ 類型不匹配
```

## 總結

**泛型**：
- 提供類型參數化
- 約束泛型（`extends`）
- 多個泛型參數

**條件類型**：
- `T extends U ? X : Y`
- `infer` 推斷類型
- 分布式條件類型

**映射類型**：
- `[P in keyof T]`
- 鍵重映射（`as`）
- 過濾屬性

**工具類型**：
- `Partial`, `Required`, `Readonly`
- `Pick`, `Omit`, `Record`
- `Exclude`, `Extract`
- `ReturnType`, `Parameters`

**類型守衛**：
- `typeof`, `instanceof`
- 自定義守衛（`is`）
- 可辨識聯合

**最佳實踐**：
- ✅ 使用泛型增強代碼重用性
- ✅ 使用工具類型簡化類型操作
- ✅ 使用類型守衛縮小類型範圍
- ✅ 使用 `as const` 獲得更精確的類型
- ✅ 使用品牌類型增強類型安全
- ✅ 避免過度使用 `any`

掌握 TypeScript 進階類型系統能大幅提升代碼的類型安全性和可維護性。
