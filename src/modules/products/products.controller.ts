import { Controller, Get, Param } from '@nestjs/common';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ResponseMessage('Successfully retrieved products')
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':slug')
  @ResponseMessage('Successfully retrieved product detail')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }
}
