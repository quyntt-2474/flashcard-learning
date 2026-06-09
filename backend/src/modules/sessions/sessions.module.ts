import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { Sm2Module } from '../../core/sm2/sm2.module';

@Module({
  imports: [PrismaModule, Sm2Module],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
