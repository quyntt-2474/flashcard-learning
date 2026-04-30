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
  Query,
  UseGuards,
} from '@nestjs/common';
import { DecksService } from './decks.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { ClientId } from '../../common/decorators/client-id.decorator';
import { ClientIdGuard } from '../../common/guards/client-id.guard';

@Controller('decks')
@UseGuards(ClientIdGuard)
export class DecksController {
  constructor(private readonly decksService: DecksService) {}

  @Get()
  findAll(
    @ClientId() clientId: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.decksService.findAll(
      clientId,
      categoryId ? parseInt(categoryId) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @ClientId() clientId: string) {
    return this.decksService.findOne(id, clientId);
  }

  @Post()
  create(@Body() dto: CreateDeckDto, @ClientId() clientId: string) {
    return this.decksService.create(dto, clientId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDeckDto,
    @ClientId() clientId: string,
  ) {
    return this.decksService.update(id, dto, clientId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @ClientId() clientId: string) {
    return this.decksService.remove(id, clientId);
  }
}
