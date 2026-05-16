import { Injectable } from '@nestjs/common';
import { Prisma } from '.prisma/client';
import { PrismaService } from '../../database/prisma.service';

const productPublicInclude = Prisma.validator<Prisma.ProductInclude>()({
  category: true,
  images: true,
  variants: true,
  addons: true,
});

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productPublicInclude;
}>;

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ProductWithRelations[]> {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: productPublicInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findBySlug(slug: string): Promise<ProductWithRelations | null> {
    return this.prisma.product.findUnique({
      where: { slug },
      include: productPublicInclude,
    });
  }
}
