import { Injectable } from '@nestjs/common';
import { Category, Prisma } from '.prisma/client';
import { PrismaService } from '../../database/prisma.service';


@Injectable()
export class CategoriesRepository {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async findAll(): Promise<Category[]> {
        return this.prisma.category.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                sortOrder: 'asc'
            }
        });
    }

    async findBySlug(slug: string): Promise<Category | null> {
        return this.prisma.category.findUnique({
            where: { slug },
        });
    }
}