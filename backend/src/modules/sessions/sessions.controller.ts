import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SubmitReviewDto } from './dto/submit-review.dto';
import { ClientId } from '../../common/decorators/client-id.decorator';
import { ClientIdGuard } from '../../common/guards/client-id.guard';

@Controller('sessions')
@UseGuards(ClientIdGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Body() dto: CreateSessionDto, @ClientId() clientId: string) {
    return this.sessionsService.create(dto, clientId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @ClientId() clientId: string) {
    return this.sessionsService.findOne(id, clientId);
  }

  @Post(':id/reviews')
  submitReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SubmitReviewDto,
    @ClientId() clientId: string,
  ) {
    return this.sessionsService.submitReview(id, dto, clientId);
  }

  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  complete(
    @Param('id', ParseIntPipe) id: number,
    @ClientId() clientId: string,
  ) {
    return this.sessionsService.complete(id, clientId);
  }
}
