import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { Sm2Module } from './core/sm2/sm2.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DecksModule } from './modules/decks/decks.module';
import { CardsModule } from './modules/cards/cards.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { ProgressModule } from './modules/progress/progress.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    Sm2Module,
    CategoriesModule,
    DecksModule,
    CardsModule,
    SessionsModule,
    ProgressModule,
  ],
})
export class AppModule {}
