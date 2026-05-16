import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const mockCategoriesService = {
    findAll: jest.fn(),
    findBySlug: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service findAll', async () => {
    mockCategoriesService.findAll.mockResolvedValue([]);

    await controller.findAll();

    expect(mockCategoriesService.findAll).toHaveBeenCalledTimes(1);
  });

  it('should call service findBySlug', async () => {
    mockCategoriesService.findBySlug.mockResolvedValue({
      id: 'category-1',
      name: 'Pizza',
      slug: 'pizza',
    });

    await controller.findBySlug('pizza');

    expect(mockCategoriesService.findBySlug).toHaveBeenCalledWith('pizza');
  });
});
