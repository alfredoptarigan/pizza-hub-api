import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';

describe('Categories E2E', () => {
  let app: INestApplication<App>;

  const mockPrismaService = {
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const baseCategory = {
    id: 'category-1',
    name: 'Pizza',
    slug: 'pizza',
    description: 'Pizza menu',
    imageUrl: null,
    sortOrder: 1,
    isActive: true,
    createdAt: new Date('2026-05-16T00:00:00.000Z'),
    updatedAt: new Date('2026-05-16T00:00:00.000Z'),
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

  it('GET /categories should return categories with response convention', async () => {
    mockPrismaService.category.findMany.mockResolvedValue([baseCategory]);

    const response = await request(app.getHttpServer()).get('/categories');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      message: 'Successfully retrieved categories',
      data: [
        {
          ...baseCategory,
          createdAt: baseCategory.createdAt.toISOString(),
          updatedAt: baseCategory.updatedAt.toISOString(),
        },
      ],
    });
  });

  it('GET /categories/:slug should return category detail with response convention', async () => {
    mockPrismaService.category.findUnique.mockResolvedValue(baseCategory);

    const response = await request(app.getHttpServer()).get('/categories/pizza');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      message: 'Successfully retrieved category detail',
      data: {
        ...baseCategory,
        createdAt: baseCategory.createdAt.toISOString(),
        updatedAt: baseCategory.updatedAt.toISOString(),
      },
    });
  });

  it('GET /categories/:slug should return 404 when category is not found', async () => {
    mockPrismaService.category.findUnique.mockResolvedValue(null);

    const response = await request(app.getHttpServer()).get(
      '/categories/missing-category',
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Category not found');
  });
});
