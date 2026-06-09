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
  findAll(@ClientId() clientId: string) {
    return this.categoriesService.findAll(clientId);
  }

  @Get(':id/decks')
  findDecks(
    @Param('id', ParseIntPipe) id: number,
    @ClientId() clientId: string,
  ) {
    return this.categoriesService.findDecksInCategory(id, clientId);
  }
}
