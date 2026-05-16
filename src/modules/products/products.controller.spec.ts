import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;

  const mockProductsService = {
    findAll: jest.fn(),
    findBySlug: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service findAll', async () => {
    mockProductsService.findAll.mockResolvedValue([]);

    await controller.findAll();

    expect(mockProductsService.findAll).toHaveBeenCalledTimes(1);
  });

  it('should call service findBySlug', async () => {
    mockProductsService.findBySlug.mockResolvedValue({
      id: 'product-1',
      name: 'Super Supreme Pizza',
      slug: 'super-supreme-pizza',
    });

    await controller.findBySlug('super-supreme-pizza');

    expect(mockProductsService.findBySlug).toHaveBeenCalledWith(
      'super-supreme-pizza',
    );
  });
});
