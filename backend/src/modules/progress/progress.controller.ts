import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ClientId } from '../../common/decorators/client-id.decorator';
import { ClientIdGuard } from '../../common/guards/client-id.guard';

@Controller('progress')
@UseGuards(ClientIdGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  getProgress(@ClientId() clientId: string) {
    return this.progressService.getProgress(clientId);
  }
}
