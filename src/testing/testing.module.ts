import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';


@Module({
  imports: [],
  exports: [],
  providers: [],
  controllers: [TestingController],
})
export class TestingModule{}