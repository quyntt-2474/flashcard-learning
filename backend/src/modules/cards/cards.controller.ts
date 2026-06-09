import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { ClientId } from '../../common/decorators/client-id.decorator';
import { ClientIdGuard } from '../../common/guards/client-id.guard';

@Controller()
@UseGuards(ClientIdGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('decks/:deckId/cards')
  findAll(
    @Param('deckId', ParseIntPipe) deckId: number,
    @ClientId() clientId: string,
  ) {
    return this.cardsService.findAll(deckId, clientId);
  }

  @Post('decks/:deckId/cards')
  create(
    @Param('deckId', ParseIntPipe) deckId: number,
    @Body() dto: CreateCardDto,
    @ClientId() clientId: string,
  ) {
    return this.cardsService.create(deckId, dto, clientId);
  }

  @Patch('cards/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCardDto,
    @ClientId() clientId: string,
  ) {
    return this.cardsService.update(id, dto, clientId);
  }

  @Delete('cards/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @ClientId() clientId: string) {
    return this.cardsService.remove(id, clientId);
  }
}
