import { Module } from '@nestjs/common';
import { WordBookService } from './word-book.service';
import { WordBookController } from './word-book.controller';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '@libs/shared';

@Module({
  imports: [AuthModule, SharedModule],
  controllers: [WordBookController],
  providers: [WordBookService],
})
export class WordBookModule {}
