import { Controller, Get, Param } from '@nestjs/common';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    @ResponseMessage('Successfully retrieved categories')
    async findAll() {
        return this.categoriesService.findAll();
    }

    @Get(':slug')
    @ResponseMessage('Successfully retrieved category detail')
    async findBySlug(@Param('slug') slug: string) {
        return this.categoriesService.findBySlug(slug);
    }
}
