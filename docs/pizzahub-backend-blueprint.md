# Backend Blueprint — PizzaHub API

Dokumen ini berisi rancangan backend untuk project website food ordering seperti Pizza Hut, menggunakan:

```txt
NestJS + PostgreSQL + Prisma ORM
```

Project ini mencakup fitur customer, admin dashboard, produk pizza, kategori, cart, order, payment, voucher, outlet, dan upload gambar.

---

## 1. Backend atau Frontend Dulu?

Urutan pengerjaan yang disarankan:

```txt
1. Buat UI flow / wireframe dasar
2. Tentukan database schema
3. Buat backend API
4. Test API menggunakan Swagger / Postman
5. Integrasikan frontend
6. Buat admin dashboard setelah API utama stabil
```

Jadi, setelah desain dasar dan flow UX jelas, sebaiknya kerjakan:

> **Backend terlebih dahulu.**

Alasannya, project seperti food ordering sangat bergantung pada struktur data seperti produk, varian pizza, keranjang, order, payment, outlet, dan voucher.

---

## 2. Tech Stack Backend

Rekomendasi stack:

```txt
Backend Framework : NestJS
Database          : PostgreSQL
ORM               : Prisma
Authentication    : JWT
Validation        : class-validator
API Docs          : Swagger
Image Upload      : Local / Cloudinary / S3
Payment Gateway   : Midtrans / Xendit
```

Untuk tahap awal atau MVP, cukup gunakan:

```txt
NestJS + Prisma + PostgreSQL + JWT
```

---

## 3. Relasi Database Utama

Relasi utama sistem:

```txt
User
├── punya banyak Address
├── punya banyak Order
├── punya banyak Cart
├── punya banyak FavoriteProduct
└── punya banyak Review

Category
└── punya banyak Product

Product
├── masuk ke Category
├── punya banyak ProductImage
├── punya banyak ProductVariant
├── punya banyak ProductAddon
├── bisa masuk CartItem
└── bisa masuk OrderItem

ProductVariant
└── contoh: Personal, Regular, Large

Outlet
├── punya banyak Order
└── melayani Delivery / Takeaway / Dine In

Cart
├── dimiliki User
└── punya banyak CartItem

Order
├── dimiliki User
├── berasal dari Outlet
├── punya banyak OrderItem
├── punya satu Payment
└── bisa pakai Voucher

Voucher
└── bisa dipakai di Order

Payment
└── milik Order
```

---

## 4. Tabel Database

Core table yang disarankan:

```txt
users
addresses
categories
products
product_images
product_variants
product_addons
outlets
carts
cart_items
orders
order_items
payments
promos
vouchers
favorites
reviews
```

Untuk admin, tidak perlu tabel khusus di awal. Gunakan tabel `users` dengan role:

```txt
CUSTOMER
ADMIN
STAFF
SUPER_ADMIN
```

---

## 5. Struktur Project NestJS

Struktur folder utama:

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
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   ├── constants/
│   │   ├── enums/
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
├── docker-compose.yml
├── .env
├── package.json
└── tsconfig.json
```

---

## 6. Pola Folder Setiap Module

Contoh module `products`:

```txt
src/modules/products/
├── products.module.ts
├── products.controller.ts
├── admin-products.controller.ts
├── products.service.ts
├── products.repository.ts
└── dto/
    ├── create-product.dto.ts
    ├── update-product.dto.ts
    └── product-query.dto.ts
```

Pembagian controller:

```txt
products.controller.ts
```

Untuk public/customer API.

Contoh endpoint:

```txt
GET /products
GET /products/:slug
```

```txt
admin-products.controller.ts
```

Untuk admin dashboard API.

Contoh endpoint:

```txt
POST /admin/products
PATCH /admin/products/:id
DELETE /admin/products/:id
```

Pola yang digunakan:

```txt
Controller → Service → Repository → Database
```

---

## 7. Inisialisasi Project NestJS

Install NestJS CLI:

```bash
npm i -g @nestjs/cli
```

Buat project:

```bash
nest new pizzahub-api
cd pizzahub-api
```

Jalankan project:

```bash
npm run start:dev
```

---

## 8. Install Package Utama

Install package konfigurasi, JWT, validasi, Swagger, dan Prisma:

```bash
npm install @nestjs/config
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install class-validator class-transformer
npm install @nestjs/swagger swagger-ui-express

npm install prisma @prisma/client
npm install pg

npm install -D @types/bcrypt @types/passport-jwt
```

Opsional untuk setup Prisma PostgreSQL adapter:

```bash
npm install @prisma/adapter-pg
npm install -D @types/pg
```

---

## 9. Setup PostgreSQL dengan Docker

Buat file:

```txt
docker-compose.yml
```

Isi:

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

Jalankan:

```bash
docker compose up -d
```

---

## 10. Setup Prisma

Inisialisasi Prisma:

```bash
npx prisma init --datasource-provider postgresql
```

Setelah itu akan muncul:

```txt
prisma/
└── schema.prisma

.env
```

Isi `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/pizzahub_db?schema=public"

JWT_SECRET="supersecret"
JWT_EXPIRES_IN="7d"

APP_PORT=3000
```

---

## 11. Prisma Schema

Letakkan schema berikut di:

```txt
prisma/schema.prisma
```

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  CUSTOMER
  ADMIN
  STAFF
  SUPER_ADMIN
}

enum OrderStatus {
  PENDING
  PAID
  PREPARING
  READY
  DELIVERING
  COMPLETED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  EXPIRED
  REFUNDED
}

enum OrderType {
  DELIVERY
  TAKEAWAY
  DINE_IN
}

enum DiscountType {
  PERCENTAGE
  FIXED_AMOUNT
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  phone     String?  @unique
  password  String
  role      UserRole @default(CUSTOMER)
  avatarUrl String?

  addresses Address[]
  carts     Cart[]
  orders    Order[]
  favorites Favorite[]
  reviews   Review[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Address {
  id          String  @id @default(uuid())
  userId      String
  label       String
  recipient   String
  phone       String
  province    String?
  city        String
  district    String?
  detail      String
  postalCode  String?
  latitude    Float?
  longitude   Float?
  notes       String?
  isDefault   Boolean @default(false)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("addresses")
}

model Category {
  id          String  @id @default(uuid())
  name        String
  slug        String  @unique
  description String?
  imageUrl    String?
  sortOrder   Int     @default(0)
  isActive    Boolean @default(true)

  products Product[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("categories")
}

model Product {
  id              String  @id @default(uuid())
  categoryId      String
  name            String
  slug            String  @unique
  description     String?
  basePrice       Int
  discountPrice   Int?
  isActive        Boolean @default(true)
  isFeatured      Boolean @default(false)
  isRecommended   Boolean @default(false)

  category   Category @relation(fields: [categoryId], references: [id])
  images     ProductImage[]
  variants   ProductVariant[]
  addons     ProductAddon[]
  cartItems  CartItem[]
  orderItems OrderItem[]
  favorites  Favorite[]
  reviews    Review[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("products")
}

model ProductImage {
  id        String  @id @default(uuid())
  productId String
  imageUrl  String
  altText   String?
  isPrimary Boolean @default(false)

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@map("product_images")
}

model ProductVariant {
  id            String  @id @default(uuid())
  productId     String
  name          String
  price         Int
  discountPrice Int?
  isActive      Boolean @default(true)

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  cartItems  CartItem[]
  orderItems OrderItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("product_variants")
}

model ProductAddon {
  id        String  @id @default(uuid())
  productId String
  name      String
  price     Int
  isActive  Boolean @default(true)

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("product_addons")
}

model Outlet {
  id             String  @id @default(uuid())
  name           String
  slug           String  @unique
  phone          String?
  address        String
  city           String
  latitude       Float?
  longitude      Float?
  openingHours   String?
  deliveryRadius Float?
  isDelivery     Boolean @default(true)
  isTakeaway     Boolean @default(true)
  isDineIn       Boolean @default(true)
  isActive       Boolean @default(true)

  orders Order[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("outlets")
}

model Cart {
  id     String @id @default(uuid())
  userId String

  user  User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items CartItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("carts")
}

model CartItem {
  id        String @id @default(uuid())
  cartId    String
  productId String
  variantId String?
  quantity  Int    @default(1)
  notes     String?

  cart    Cart            @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product Product         @relation(fields: [productId], references: [id])
  variant ProductVariant? @relation(fields: [variantId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("cart_items")
}

model Order {
  id            String      @id @default(uuid())
  orderNumber   String      @unique
  userId        String
  outletId      String?
  voucherId     String?
  orderType     OrderType
  status        OrderStatus @default(PENDING)

  customerName  String
  customerPhone String
  address       String?
  notes         String?

  subtotal      Int
  discount      Int         @default(0)
  deliveryFee   Int         @default(0)
  total         Int

  user    User     @relation(fields: [userId], references: [id])
  outlet  Outlet?  @relation(fields: [outletId], references: [id])
  voucher Voucher? @relation(fields: [voucherId], references: [id])

  items   OrderItem[]
  payment Payment?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("orders")
}

model OrderItem {
  id          String @id @default(uuid())
  orderId     String
  productId   String
  variantId   String?

  productName String
  variantName String?
  price       Int
  quantity    Int
  notes       String?

  order   Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product         @relation(fields: [productId], references: [id])
  variant ProductVariant? @relation(fields: [variantId], references: [id])

  createdAt DateTime @default(now())

  @@map("order_items")
}

model Payment {
  id              String        @id @default(uuid())
  orderId          String        @unique
  paymentMethod    String
  paymentStatus    PaymentStatus @default(PENDING)
  amount           Int
  transactionId    String?
  paymentUrl       String?
  paidAt           DateTime?

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("payments")
}

model Promo {
  id            String       @id @default(uuid())
  title         String
  description   String?
  imageUrl      String?
  discountType  DiscountType
  discountValue Int
  startDate     DateTime
  endDate       DateTime
  isActive      Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("promos")
}

model Voucher {
  id              String       @id @default(uuid())
  code            String       @unique
  title           String
  description     String?
  discountType    DiscountType
  discountValue   Int
  minimumOrder    Int          @default(0)
  maximumDiscount Int?
  usageLimit      Int?
  usedCount       Int          @default(0)
  startDate       DateTime
  endDate         DateTime
  isActive        Boolean      @default(true)

  orders Order[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("vouchers")
}

model Favorite {
  id        String @id @default(uuid())
  userId    String
  productId String

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([userId, productId])
  @@map("favorites")
}

model Review {
  id        String @id @default(uuid())
  userId    String
  productId String
  rating    Int
  comment   String?

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@map("reviews")
}
```

---

## 12. Migration Database

Jalankan migration:

```bash
npx prisma migrate dev --name init
```

Generate Prisma Client:

```bash
npx prisma generate
```

Buka Prisma Studio:

```bash
npx prisma studio
```

---

## 13. Prisma Module di NestJS

Buat folder:

```txt
src/database/
```

### `src/database/prisma.service.ts`

```ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### `src/database/prisma.module.ts`

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

### `src/app.module.ts`

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
  ],
})
export class AppModule {}
```

---

## 14. Generate Module NestJS

Jalankan:

```bash
nest g module modules/auth
nest g controller modules/auth
nest g service modules/auth

nest g module modules/users
nest g controller modules/users
nest g service modules/users

nest g module modules/products
nest g controller modules/products
nest g service modules/products

nest g module modules/categories
nest g controller modules/categories
nest g service modules/categories

nest g module modules/carts
nest g controller modules/carts
nest g service modules/carts

nest g module modules/orders
nest g controller modules/orders
nest g service modules/orders

nest g module modules/payments
nest g controller modules/payments
nest g service modules/payments

nest g module modules/outlets
nest g controller modules/outlets
nest g service modules/outlets

nest g module modules/vouchers
nest g controller modules/vouchers
nest g service modules/vouchers
```

Repository dibuat manual, contoh:

```txt
products.repository.ts
orders.repository.ts
users.repository.ts
```

---

## 15. Contoh Product Module

### `products.repository.ts`

```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: true,
        images: true,
        variants: true,
        addons: true,
      },
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

### `products.service.ts`

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  findAll() {
    return this.productsRepository.findAll();
  }

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

### `products.controller.ts`

```ts
import { Controller, Get, Param } from '@nestjs/common';
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
}
```

### `admin-products.controller.ts`

```ts
import { Body, Controller, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }
}
```

### `products.module.ts`

```ts
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { AdminProductsController } from './admin-products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';

@Module({
  controllers: [ProductsController, AdminProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService],
})
export class ProductsModule {}
```

---

## 16. DTO Product

### `create-product.dto.ts`

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

---

## 17. Endpoint API Awal

### Auth

```txt
POST /auth/register
POST /auth/login
GET  /auth/me
```

### Products

```txt
GET    /products
GET    /products/:slug
POST   /admin/products
PATCH  /admin/products/:id
DELETE /admin/products/:id
```

### Categories

```txt
GET    /categories
POST   /admin/categories
PATCH  /admin/categories/:id
DELETE /admin/categories/:id
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
```

---

## 18. Urutan Pengerjaan Backend

Urutan yang disarankan:

```txt
1. Setup NestJS + Prisma + PostgreSQL
2. Auth module
3. Users module
4. Categories module
5. Products module
6. Product variants + product images
7. Cart module
8. Orders module
9. Payments module
10. Admin order management
11. Promo / voucher module
12. Outlet module
13. Upload image module
14. Reports module
```

Jangan mulai dari payment dulu. Payment sebaiknya dibuat setelah order flow sudah stabil.

---

## 19. MVP Scope

Untuk MVP pertama, cukup fokus pada:

```txt
Auth
Categories
Products
Product Variants
Cart
Orders
Admin Product Management
Admin Order Management
```

Setelah itu baru tambahkan:

```txt
Payment Gateway
Voucher
Promo
Outlet
Image Upload
Reports
Loyalty Points
Reviews
```

---

## 20. Kesimpulan

Stack final yang disarankan:

```txt
NestJS
PostgreSQL
Prisma ORM
JWT Auth
Swagger
Docker
```

Urutan utama:

```txt
Auth → Category → Product → Cart → Order
```

Setelah itu:

```txt
Payment → Voucher → Outlet → Upload → Reports
```

Backend sebaiknya dikerjakan lebih awal setelah desain flow dasar sudah jelas, karena struktur data akan menentukan bentuk frontend dan admin dashboard.
