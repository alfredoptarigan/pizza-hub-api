import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { buildSuccessResponseSchema } from '../../common/docs/api-response.schema';
import { productSchema } from '../../common/docs/openapi.schemas';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all active products' })
  @ApiOkResponse({
    description: 'Products retrieved successfully',
    schema: buildSuccessResponseSchema(
      {
        type: 'array',
        items: productSchema,
      },
      'Successfully retrieved products',
    ),
  })
  @ResponseMessage('Successfully retrieved products')
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Retrieve a product by slug' })
  @ApiParam({ name: 'slug', example: 'super-supreme-pizza' })
  @ApiOkResponse({
    description: 'Product detail retrieved successfully',
    schema: buildSuccessResponseSchema(
      productSchema,
      'Successfully retrieved product detail',
    ),
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ResponseMessage('Successfully retrieved product detail')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }
}
