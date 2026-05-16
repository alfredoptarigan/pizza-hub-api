import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ProductWithRelations,
  ProductsRepository,
} from './products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async findAll(): Promise<ProductWithRelations[]> {
    return this.productsRepository.findAll();
  }

  async findBySlug(slug: string): Promise<ProductWithRelations> {
    const product = await this.productsRepository.findBySlug(slug);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }
}
