import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ClientId } from '../../common/decorators/client-id.decorator';
import { ClientIdGuard } from '../../common/guards/client-id.guard';

@Controller('categories')
@UseGuards(ClientIdGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id/decks')
  findDecks(
    @Param('id', ParseIntPipe) id: number,
    @ClientId() clientId: string,
  ) {
    return this.categoriesService.findDecksInCategory(id, clientId);
  }
}
