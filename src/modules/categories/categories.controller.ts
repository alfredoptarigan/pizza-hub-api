import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { buildSuccessResponseSchema } from '../../common/docs/api-response.schema';
import { categorySchema } from '../../common/docs/openapi.schemas';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all active categories' })
  @ApiOkResponse({
    description: 'Categories retrieved successfully',
    schema: buildSuccessResponseSchema(
      {
        type: 'array',
        items: categorySchema,
      },
      'Successfully retrieved categories',
    ),
  })
  @ResponseMessage('Successfully retrieved categories')
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Retrieve a category by slug' })
  @ApiParam({ name: 'slug', example: 'pizza' })
  @ApiOkResponse({
    description: 'Category detail retrieved successfully',
    schema: buildSuccessResponseSchema(
      categorySchema,
      'Successfully retrieved category detail',
    ),
  })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ResponseMessage('Successfully retrieved category detail')
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }
}
