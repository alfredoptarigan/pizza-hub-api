# AGENT.md — PizzaHub Backend Coding Guide

This file is the main instruction document for AI coding agents such as Kilo Code, Claude Code, Cursor, or other coding assistants working on this repository.

Read this file first before generating, editing, refactoring, or deleting code.

---

# Direct Implementation Mode

You may implement code directly in the project.

Rules:
- Act as an autonomous coding agent by default.
- You may create, edit, and overwrite files when needed.
- Apply code changes directly to the project when requested.
- Prefer concise technical explanations instead of step-by-step teaching.
- Explain important architectural or behavioral decisions when they matter.
- After each completed feature or bug fix, provide the commit message and remind me to push to GitHub.
- After each completed feature, add or update tests for that feature when practical.
## 1. Project Overview

This project is a backend API for a pizza restaurant ordering platform inspired by modern food-ordering systems.

The backend supports:

- Customer authentication
- User profile management
- Product and pizza menu management
- Product categories
- Product images
- Product variants such as Personal, Regular, and Large
- Add-ons such as extra cheese, extra meat, and extra sauce
- Cart management
- Order creation and order tracking
- Admin order management
- Outlet management
- Promo and voucher management
- Payment integration preparation
- Media upload preparation
- Reporting preparation

The project name used in examples is:

```txt
PizzaHub API
```

---

## 2. Main Tech Stack

Use this stack consistently across the project:

```txt
Framework     : NestJS
Language      : TypeScript
Database      : PostgreSQL
ORM           : Prisma ORM
Auth          : JWT
Validation    : class-validator + class-transformer
API Docs      : Swagger
Runtime       : Node.js
Package Tool  : npm
Container     : Docker Compose for local PostgreSQL
```

Recommended optional tools:

```txt
Password Hashing : bcrypt
File Upload      : Multer, Cloudinary, or S3-compatible storage
Payment Gateway  : Midtrans or Xendit
Caching          : Redis, only when needed
Testing          : Jest
```

---

## 3. Core Rules for AI Agents

Follow these rules strictly.

### 3.1 Do Not Use `any`

Never use the `any` type.

Avoid:

```ts
const data: any = {};
```

Use proper types instead:

```ts
type ProductPayload = {
  name: string;
  slug: string;
  basePrice: number;
};

const data: ProductPayload = {
  name: 'Super Supreme Pizza',
  slug: 'super-supreme-pizza',
  basePrice: 120000,
};
```

If the type is unknown, use `unknown` and narrow it safely:

```ts
function parseValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  throw new Error('Value must be a string');
}
```

### 3.2 Do Not Use Untyped Objects

Avoid generic untyped objects.

Avoid:

```ts
const filter = {};
```

Prefer Prisma-generated types:

```ts
import { Prisma } from '@prisma/client';

const filter: Prisma.ProductWhereInput = {
  isActive: true,
};
```

### 3.3 Use DTOs for Request Validation

All request body, query, and params validation must use DTO classes.

Use:

```ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

Do not validate request payloads manually inside controllers unless absolutely necessary.

### 3.4 Keep Controllers Thin

Controllers should only handle:

- Route definitions
- Request parameters
- DTO binding
- Authentication guards
- Response delegation to service

Business logic must go inside services.

Database queries must go inside repositories.

### 3.5 Use Service Layer for Business Logic

Services are responsible for:

- Business rules
- Validating state transitions
- Checking ownership and permissions
- Calling repositories
- Throwing NestJS exceptions
- Coordinating multiple repositories

### 3.6 Use Repository Layer for Database Access

Repositories are responsible for Prisma queries.

Do not put raw Prisma queries directly inside controllers.

Preferred flow:

```txt
Controller → Service → Repository → Prisma
```

### 3.7 Use Prisma Types

Use Prisma-generated types when building filters, includes, selects, and transactions.

Example:

```ts
import { Prisma } from '@prisma/client';

const include: Prisma.ProductInclude = {
  category: true,
  images: true,
  variants: true,
  addons: true,
};
```

### 3.8 Use Explicit Return Types for Public Methods

Public service and repository methods should have clear return types when practical.

Example:

```ts
import { Product } from '@prisma/client';

async findById(id: string): Promise<Product | null> {
  return this.prisma.product.findUnique({
    where: { id },
  });
}
```

For complex Prisma responses, use `Prisma.validator`.

Example:

```ts
import { Prisma } from '@prisma/client';

const productWithRelations = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: {
    category: true,
    images: true,
    variants: true,
    addons: true,
  },
});

export type ProductWithRelations = Prisma.ProductGetPayload<
  typeof productWithRelations
>;
```

---

## 4. Project Folder Structure

Use this folder structure:

```txt
pizzahub-api/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── payment.config.ts
│   │
│   ├── common/
│   │   ├── constants/
│   │   ├── decorators/
│   │   ├── enums/
│   │   ├── exceptions/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── database/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   └── modules/
│       ├── auth/
│       ├── users/
│       ├── addresses/
│       ├── categories/
│       ├── products/
│       ├── outlets/
│       ├── carts/
│       ├── orders/
│       ├── payments/
│       ├── promos/
│       ├── vouchers/
│       ├── favorites/
│       ├── reviews/
│       └── uploads/
│
├── test/
│   ├── e2e/
│   ├── fixtures/
│   └── jest-e2e.json
├── docker-compose.yml
├── .env.example
├── package.json
├── tsconfig.json
└── AGENT.md
```

---

## 5. Standard Module Structure

Each feature module should follow this structure:

```txt
src/modules/<module-name>/
├── <module-name>.module.ts
├── <module-name>.controller.ts
├── admin-<module-name>.controller.ts
├── <module-name>.service.ts
├── <module-name>.service.spec.ts
├── <module-name>.repository.ts
├── <module-name>.repository.spec.ts
├── dto/
│   ├── create-<module-name>.dto.ts
│   ├── update-<module-name>.dto.ts
│   └── <module-name>-query.dto.ts
├── types/
│   └── <module-name>.types.ts
└── constants/
    └── <module-name>.constants.ts
```

Admin controller is optional. Use it only if the module has admin-specific endpoints.

Example:

```txt
src/modules/products/
├── products.module.ts
├── products.controller.ts
├── admin-products.controller.ts
├── products.service.ts
├── products.service.spec.ts
├── products.repository.ts
├── products.repository.spec.ts
├── dto/
│   ├── create-product.dto.ts
│   ├── update-product.dto.ts
│   └── product-query.dto.ts
├── types/
│   └── product-with-relations.type.ts
└── constants/
    └── product.constants.ts
```

---

## 6. Database

Use PostgreSQL as the database.

Use Prisma ORM for:

- Schema definition
- Migration
- Type-safe query
- Seeding
- Database client generation

Do not use TypeORM, Sequelize, Knex, or raw SQL unless there is a strong reason and it is explicitly approved.

---

## 7. Prisma Schema Guidelines

The Prisma schema must live in:

```txt
prisma/schema.prisma
```

Use UUID strings for primary keys:

```prisma
id String @id @default(uuid())
```

Use `createdAt` and `updatedAt` on most business tables:

```prisma
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

Use `@@map()` to map Prisma model names to snake_case table names:

```prisma
model Product {
  id String @id @default(uuid())

  @@map("products")
}
```

Use enums for stable domain values:

```prisma
enum OrderStatus {
  PENDING
  PAID
  PREPARING
  READY
  DELIVERING
  COMPLETED
  CANCELLED
}
```

---

## 8. Main Database Models

The project should include these core models:

```txt
User
Address
Category
Product
ProductImage
ProductVariant
ProductAddon
Outlet
Cart
CartItem
Order
OrderItem
Payment
Promo
Voucher
Favorite
Review
```

User roles:

```txt
CUSTOMER
ADMIN
STAFF
SUPER_ADMIN
```

Order statuses:

```txt
PENDING
PAID
PREPARING
READY
DELIVERING
COMPLETED
CANCELLED
```

Payment statuses:

```txt
PENDING
PAID
FAILED
EXPIRED
REFUNDED
```

Order types:

```txt
DELIVERY
TAKEAWAY
DINE_IN
```

Discount types:

```txt
PERCENTAGE
FIXED_AMOUNT
```

---

## 9. Recommended Package List

Install core packages:

```bash
npm install @nestjs/config
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install class-validator class-transformer
npm install @nestjs/swagger swagger-ui-express
npm install prisma @prisma/client
npm install pg
```

Install development types:

```bash
npm install -D @types/bcrypt @types/passport-jwt @types/pg
```

Optional packages:

```bash
npm install multer
npm install -D @types/multer
```

If using Cloudinary:

```bash
npm install cloudinary
```

If using Redis later:

```bash
npm install ioredis
```

---

## 10. Environment Variables

Use `.env` for local development.

Create `.env.example` and keep it updated.

Example:

```env
APP_PORT=3000
NODE_ENV=development

DATABASE_URL="postgresql://postgres:password@localhost:5432/pizzahub_db?schema=public"

JWT_SECRET="change_this_secret"
JWT_EXPIRES_IN="7d"

BCRYPT_SALT_ROUNDS=10

MIDTRANS_SERVER_KEY=""
MIDTRANS_CLIENT_KEY=""
MIDTRANS_IS_PRODUCTION=false

XENDIT_SECRET_KEY=""

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

Never commit real secrets.

---

## 11. Docker Compose for PostgreSQL

Use this local database setup:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: pizzahub_postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: pizzahub_db
    ports:
      - "5432:5432"
    volumes:
      - pizzahub_postgres_data:/var/lib/postgresql/data

volumes:
  pizzahub_postgres_data:
```

Run:

```bash
docker compose up -d
```

---

## 12. Initialization Commands

Create NestJS project:

```bash
nest new pizzahub-api
cd pizzahub-api
```

Install Prisma:

```bash
npm install prisma @prisma/client
npx prisma init --datasource-provider postgresql
```

Run migration:

```bash
npx prisma migrate dev --name init
```

Generate Prisma Client:

```bash
npx prisma generate
```

Open Prisma Studio:

```bash
npx prisma studio
```

Run development server:

```bash
npm run start:dev
```

---

## 13. Prisma Service

Create:

```txt
src/database/prisma.service.ts
```

Use this implementation:

```ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
```

Create:

```txt
src/database/prisma.module.ts
```

Use this implementation:

```ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

Import `PrismaModule` in `AppModule`.

---

## 14. Naming Conventions

### Files

Use kebab-case file names:

```txt
create-product.dto.ts
products.service.ts
admin-products.controller.ts
product-with-relations.type.ts
```

### Classes

Use PascalCase:

```ts
export class ProductsService {}
export class CreateProductDto {}
```

### Variables and Functions

Use camelCase:

```ts
const productSlug = 'super-supreme-pizza';

function generateOrderNumber(): string {
  return 'ORD-20260515-0001';
}
```

### Constants

Use SCREAMING_SNAKE_CASE:

```ts
export const DEFAULT_PAGE_SIZE = 10;
```

### Database Tables

Use snake_case table names through Prisma `@@map()`:

```prisma
@@map("product_images")
```

### API Routes

Use plural nouns:

```txt
/products
/categories
/orders
/admin/products
/admin/orders
```

---

## 15. Controller Convention

Controllers must be thin.

Example:

```ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }
}
```

Do not place business logic inside controllers.

---

## 16. Service Convention

Services contain business logic.

Example:

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async findBySlug(slug: string) {
    const product = await this.productsRepository.findBySlug(slug);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  create(dto: CreateProductDto) {
    return this.productsRepository.create(dto);
  }
}
```

---

## 17. Repository Convention

Repositories contain Prisma queries.

Example:

```ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    const include: Prisma.ProductInclude = {
      category: true,
      images: true,
      variants: true,
      addons: true,
    };

    return this.prisma.product.findMany({
      where: {
        isActive: true,
      },
      include,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: true,
        variants: true,
        addons: true,
        reviews: true,
      },
    });
  }

  create(data: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        basePrice: data.basePrice,
        discountPrice: data.discountPrice,
        categoryId: data.categoryId,
        isFeatured: data.isFeatured ?? false,
        isRecommended: data.isRecommended ?? false,
      },
    });
  }
}
```

---

## 18. DTO Convention

Use class-validator decorators.

Example:

```ts
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  basePrice: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  discountPrice?: number;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean()
  @IsOptional()
  isRecommended?: boolean;
}
```

Use `PartialType` for update DTOs:

```ts
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

---

## 19. Error Handling Convention

Use NestJS built-in exceptions:

```ts
throw new NotFoundException('Product not found');
throw new BadRequestException('Invalid voucher code');
throw new UnauthorizedException('Invalid credentials');
throw new ForbiddenException('You do not have access to this resource');
throw new ConflictException('Email already exists');
```

Do not return manual error objects from services.

Avoid:

```ts
return {
  success: false,
  message: 'Product not found',
};
```

Prefer throwing exceptions.

---

## 20. Authentication and Authorization

Use JWT authentication.

Recommended auth endpoints:

```txt
POST /auth/register
POST /auth/login
GET  /auth/me
```

Use role-based authorization for admin endpoints.

Example route groups:

```txt
/admin/products
/admin/orders
/admin/categories
/admin/vouchers
/admin/outlets
```

Only these roles should access admin endpoints:

```txt
ADMIN
STAFF
SUPER_ADMIN
```

Use guards and decorators:

```txt
JwtAuthGuard
RolesGuard
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
```

---

## 21. API Endpoint Plan

### Auth

```txt
POST /auth/register
POST /auth/login
GET  /auth/me
```

### Users

```txt
GET   /users/me
PATCH /users/me
```

### Categories

```txt
GET    /categories
GET    /categories/:slug
POST   /admin/categories
PATCH  /admin/categories/:id
DELETE /admin/categories/:id
```

### Products

```txt
GET    /products
GET    /products/:slug
POST   /admin/products
PATCH  /admin/products/:id
DELETE /admin/products/:id
```

### Cart

```txt
GET    /cart
POST   /cart/items
PATCH  /cart/items/:id
DELETE /cart/items/:id
DELETE /cart/clear
```

### Orders

```txt
POST  /orders
GET   /orders/me
GET   /orders/:id
GET   /admin/orders
GET   /admin/orders/:id
PATCH /admin/orders/:id/status
```

### Payments

```txt
POST /payments/create
POST /payments/webhook
GET  /payments/:orderId
```

### Outlets

```txt
GET    /outlets
GET    /outlets/nearby
POST   /admin/outlets
PATCH  /admin/outlets/:id
DELETE /admin/outlets/:id
```

### Vouchers

```txt
POST /vouchers/validate
GET  /admin/vouchers
POST /admin/vouchers
PATCH /admin/vouchers/:id
DELETE /admin/vouchers/:id
```

---

## 22. Pagination Convention

For list endpoints, support pagination.

Query params:

```txt
page
limit
search
sortBy
sortOrder
```

Example:

```txt
GET /products?page=1&limit=10&search=pizza&sortBy=createdAt&sortOrder=desc
```

DTO example:

```ts
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PaginationQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
```

---

## 23. Response Convention

Prefer consistent response structure for controllers.

Example success response:

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {}
}
```

Example paginated response:

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

This can be implemented using an interceptor or helper.

---

## 24. Security Rules

Follow these security practices:

- Never store plain text passwords.
- Always hash passwords with bcrypt.
- Never commit `.env`.
- Validate all incoming request data.
- Use guards for protected routes.
- Use role-based access control for admin routes.
- Do not expose password fields in API responses.
- Do not trust user-provided price values during checkout.
- Always recalculate order total on the backend.
- Validate product availability before creating orders.
- Validate voucher availability and expiry on the backend.
- Use webhook signature verification for payment gateway callbacks.

---

## 25. Order Flow Rules

Order creation should follow this logic:

```txt
1. User submits cart checkout request.
2. Backend fetches cart items from database.
3. Backend validates product availability.
4. Backend recalculates prices from database.
5. Backend validates voucher if provided.
6. Backend calculates subtotal, discount, delivery fee, and total.
7. Backend creates Order and OrderItems in a transaction.
8. Backend creates Payment record.
9. Backend clears cart after successful order creation.
10. Backend returns order detail and payment information.
```

Use Prisma transaction for order creation:

```ts
await this.prisma.$transaction(async (tx) => {
  // create order
  // create order items
  // create payment
  // clear cart
});
```

Do not trust frontend-calculated totals.

---

## 26. Admin Rules

Admin endpoints should:

- Require JWT authentication.
- Require role authorization.
- Use `/admin/*` route prefix.
- Return admin-friendly data.
- Support search, filter, pagination, and sorting.
- Never allow customer users to access admin routes.

Admin modules commonly needed:

```txt
admin-products.controller.ts
admin-orders.controller.ts
admin-categories.controller.ts
admin-vouchers.controller.ts
admin-outlets.controller.ts
```

---

## 27. Product Rules

Product model should support:

- Category
- Product images
- Product variants
- Product add-ons
- Featured flag
- Recommended flag
- Active / inactive state
- Discount price
- Slug

Pizza variants usually include:

```txt
Personal
Regular
Large
```

Crust options can be implemented as product add-ons or a separate table later.

For MVP, use `ProductAddon`.

---

## 28. Payment Rules

Payment gateway integration should be added after order creation is stable.

Initial payment statuses:

```txt
PENDING
PAID
FAILED
EXPIRED
REFUNDED
```

Do not mark order as `PAID` from frontend response.

Only mark order as paid after:

- Verified payment gateway webhook, or
- Admin-confirmed manual payment, if implemented

---

## 29. Upload Rules

For development, local upload is acceptable.

For production, prefer:

```txt
Cloudinary
AWS S3
S3-compatible storage
```

Image upload should support:

- Product image
- Product gallery
- Promo banner
- Category icon

Store image URLs in the database.

Do not store binary images directly in PostgreSQL for this project.

---

## 30. Testing Rules

Use Jest for unit tests and Supertest for end-to-end HTTP tests.

Testing packages used in this repository:

- `jest`
- `ts-jest`
- `@types/jest`
- `@nestjs/testing`
- `supertest`
- `@types/supertest`

Testing structure:

- Unit tests live next to the source file they verify, for example `products.service.spec.ts`.
- End-to-end tests live under `test/e2e/`.
- Shared test fixtures can live under `test/fixtures/` when needed.

Testing policy:

- Every non-trivial service should include unit tests.
- Controllers should stay thin and prefer e2e coverage over heavy controller unit tests.
- Repositories may have unit tests with a mocked `PrismaService`, but critical database flows should eventually gain integration coverage.
- Every bug fix should include a regression test when practical.
- Update tests together with DTO, service, repository, and controller changes when behavior changes.

Prioritize tests for:

- Auth service
- Product service
- Cart service
- Order service
- Voucher validation
- Order total calculation

Test file naming:

```txt
*.spec.ts
```

Avoid writing tests with `any`.

Use typed mocks.

Recommended minimum coverage for each new feature:

- Service unit tests for success and error paths
- E2E tests for important public or admin endpoints

---

## 31. Linting and Formatting Rules

Follow strict TypeScript standards.

Recommended TypeScript configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

Recommended ESLint rules:

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "warn"
  }
}
```

Do not bypass linting with comments unless absolutely necessary.

Avoid:

```ts
// eslint-disable-next-line
```

---

## 32. Development Roadmap

Recommended backend implementation order:

```txt
1. Setup NestJS + Prisma + PostgreSQL
2. Configure environment variables
3. Create Prisma schema
4. Run initial migration
5. Create Prisma module and service
6. Create Auth module
7. Create Users module
8. Create Categories module
9. Create Products module
10. Create Product Images, Variants, and Add-ons
11. Create Cart module
12. Create Orders module
13. Add Admin Order Management
14. Add Vouchers and Promos
15. Add Outlets
16. Add Uploads
17. Add Payments
18. Add Reports
19. Add Tests
20. Add Production Deployment Configuration
```

MVP priority:

```txt
Auth → Users → Categories → Products → Cart → Orders
```

After MVP:

```txt
Payments → Vouchers → Outlets → Uploads → Reports
```

---

## 33. What AI Agents Should Do Before Editing

Before making changes:

1. Read this `AGENT.md`.
2. Inspect the existing folder structure.
3. Check `prisma/schema.prisma`.
4. Check related module files before generating new ones.
5. Reuse existing patterns.
6. Avoid creating duplicate abstractions.
7. Keep code type-safe.
8. Never use `any`.
9. Prefer small focused changes.
10. Update DTOs, services, repositories, modules, and tests consistently.

---

## 34. What AI Agents Must Avoid

Do not:

- Use `any`.
- Put business logic in controllers.
- Put Prisma queries in controllers.
- Trust frontend price calculations.
- Store passwords in plain text.
- Expose password fields in responses.
- Hardcode secrets.
- Commit `.env`.
- Create unrelated folders.
- Mix admin and customer route logic without clear separation.
- Use TypeORM, Sequelize, or another ORM.
- Create duplicate modules for the same domain.
- Ignore validation.
- Ignore authentication on protected routes.
- Mark payments as paid without backend verification.
- Delete existing files unless explicitly instructed.

---

## 35. Final Architecture Summary

Use this architecture:

```txt
NestJS API
│
├── Controllers
│   └── HTTP layer only
│
├── Services
│   └── Business logic
│
├── Repositories
│   └── Prisma database queries
│
├── Prisma ORM
│   └── Type-safe database access
│
└── PostgreSQL
    └── Main relational database
```

Primary flow:

```txt
Request → Controller → DTO Validation → Service → Repository → Prisma → PostgreSQL
```

Main modules:

```txt
auth
users
addresses
categories
products
outlets
carts
orders
payments
promos
vouchers
favorites
reviews
uploads
```

The backend should be clean, modular, type-safe, scalable, and easy to connect with a Next.js frontend and admin dashboard.
