import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { Category } from '@prisma/client';

@Injectable()
export class CategoriesService {
    constructor(
        private readonly categoriesRepository: CategoriesRepository
    ) { }

    async findAll(): Promise<Category[]> {
        return this.categoriesRepository.findAll();
    }
    async findBySlug(slug: string): Promise<Category> {
        const category = await this.categoriesRepository.findBySlug(slug);
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        return category;
    }
}
