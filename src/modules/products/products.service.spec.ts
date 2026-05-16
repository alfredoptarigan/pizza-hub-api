import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ProductWithRelations,
  ProductsRepository,
} from './products.repository';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProductsRepository = {
    findAll: jest.fn(),
    findBySlug: jest.fn(),
  };

  const baseProduct: ProductWithRelations = {
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: mockProductsRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('findAll', () => {
    it('should return all active products with relations', async () => {
      mockProductsRepository.findAll.mockResolvedValue([baseProduct]);

      const result = await service.findAll();

      expect(mockProductsRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([baseProduct]);
    });
  });

  describe('findBySlug', () => {
    it('should return product detail by slug', async () => {
      mockProductsRepository.findBySlug.mockResolvedValue(baseProduct);

      const result = await service.findBySlug('super-supreme-pizza');

      expect(mockProductsRepository.findBySlug).toHaveBeenCalledWith(
        'super-supreme-pizza',
      );
      expect(result).toEqual(baseProduct);
    });

    it('should throw NotFoundException when product is not found', async () => {
      mockProductsRepository.findBySlug.mockResolvedValue(null);

      await expect(service.findBySlug('missing-product')).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(mockProductsRepository.findBySlug).toHaveBeenCalledWith(
        'missing-product',
      );
    });
  });
});
