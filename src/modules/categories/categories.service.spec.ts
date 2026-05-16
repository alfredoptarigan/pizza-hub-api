import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesRepository } from './categories.repository';
import { CategoriesService } from './categories.service';

type MockCategory = {
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

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategoriesRepository = {
    findAll: jest.fn(),
    findBySlug: jest.fn(),
  };

  const baseCategory: MockCategory = {
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: mockCategoriesRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  describe('findAll', () => {
    it('should return all active categories', async () => {
      mockCategoriesRepository.findAll.mockResolvedValue([baseCategory]);

      const result = await service.findAll();

      expect(mockCategoriesRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([baseCategory]);
    });
  });

  describe('findBySlug', () => {
    it('should return category detail by slug', async () => {
      mockCategoriesRepository.findBySlug.mockResolvedValue(baseCategory);

      const result = await service.findBySlug('pizza');

      expect(mockCategoriesRepository.findBySlug).toHaveBeenCalledWith('pizza');
      expect(result).toEqual(baseCategory);
    });

    it('should throw NotFoundException when category is not found', async () => {
      mockCategoriesRepository.findBySlug.mockResolvedValue(null);

      await expect(service.findBySlug('missing-category')).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(mockCategoriesRepository.findBySlug).toHaveBeenCalledWith(
        'missing-category',
      );
    });
  });
});
