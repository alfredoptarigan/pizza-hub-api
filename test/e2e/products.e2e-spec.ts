import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';

describe('Products E2E', () => {
  let app: INestApplication<App>;

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const baseProduct = {
    id: 'product-1',
    categoryId: 'category-1',
    name: 'Super Supreme Pizza',
    slug: 'super-supreme-pizza',
    description: 'Loaded pizza with toppings',
    basePrice: 120000,
    discountPrice: 100000,
    isActive: true,
    isFeatured: true,
    isRecommended: true,
    createdAt: new Date('2026-05-16T00:00:00.000Z'),
    updatedAt: new Date('2026-05-16T00:00:00.000Z'),
    category: {
      id: 'category-1',
      name: 'Pizza',
      slug: 'pizza',
      description: 'Pizza menu',
      imageUrl: null,
      sortOrder: 1,
      isActive: true,
      createdAt: new Date('2026-05-16T00:00:00.000Z'),
      updatedAt: new Date('2026-05-16T00:00:00.000Z'),
    },
    images: [
      {
        id: 'image-1',
        productId: 'product-1',
        imageUrl: 'https://example.com/pizza.jpg',
        altText: 'Pizza image',
        isPrimary: true,
        createdAt: new Date('2026-05-16T00:00:00.000Z'),
      },
    ],
    variants: [
      {
        id: 'variant-1',
        productId: 'product-1',
        name: 'Large',
        price: 120000,
        discountPrice: 100000,
        isActive: true,
        createdAt: new Date('2026-05-16T00:00:00.000Z'),
        updatedAt: new Date('2026-05-16T00:00:00.000Z'),
      },
    ],
    addons: [
      {
        id: 'addon-1',
        productId: 'product-1',
        name: 'Extra Cheese',
        price: 15000,
        isActive: true,
        createdAt: new Date('2026-05-16T00:00:00.000Z'),
        updatedAt: new Date('2026-05-16T00:00:00.000Z'),
      },
    ],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /products should return products with response convention', async () => {
    mockPrismaService.product.findMany.mockResolvedValue([baseProduct]);

    const response = await request(app.getHttpServer()).get('/products');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      message: 'Successfully retrieved products',
      data: [serializeProduct(baseProduct)],
    });
  });

  it('GET /products/:slug should return product detail with response convention', async () => {
    mockPrismaService.product.findUnique.mockResolvedValue(baseProduct);

    const response = await request(app.getHttpServer()).get(
      '/products/super-supreme-pizza',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      message: 'Successfully retrieved product detail',
      data: serializeProduct(baseProduct),
    });
  });

  it('GET /products/:slug should return 404 when product is not found', async () => {
    mockPrismaService.product.findUnique.mockResolvedValue(null);

    const response = await request(app.getHttpServer()).get(
      '/products/missing-product',
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Product not found');
  });
});

function serializeProduct(product: {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  discountPrice: number | null;
  isActive: boolean;
  isFeatured: boolean;
  isRecommended: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  images: Array<{
    id: string;
    productId: string;
    imageUrl: string;
    altText: string | null;
    isPrimary: boolean;
    createdAt: Date;
  }>;
  variants: Array<{
    id: string;
    productId: string;
    name: string;
    price: number;
    discountPrice: number | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
  addons: Array<{
    id: string;
    productId: string;
    name: string;
    price: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
}) {
  return {
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    category: {
      ...product.category,
      createdAt: product.category.createdAt.toISOString(),
      updatedAt: product.category.updatedAt.toISOString(),
    },
    images: product.images.map((image) => ({
      ...image,
      createdAt: image.createdAt.toISOString(),
    })),
    variants: product.variants.map((variant) => ({
      ...variant,
      createdAt: variant.createdAt.toISOString(),
      updatedAt: variant.updatedAt.toISOString(),
    })),
    addons: product.addons.map((addon) => ({
      ...addon,
      createdAt: addon.createdAt.toISOString(),
      updatedAt: addon.updatedAt.toISOString(),
    })),
  };
}
