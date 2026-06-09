import { Module } from '@nestjs/common';
import { Sm2Service } from './sm2.service';

@Module({
  providers: [Sm2Service],
  exports: [Sm2Service],
})
export class Sm2Module {}
