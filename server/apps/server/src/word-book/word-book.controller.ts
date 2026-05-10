import { Controller, Get, Post, Param, Query, Body, Request, UseGuards } from '@nestjs/common';
import { WordBookService } from './word-book.service';
import type { WordQuery } from '@en/common/word';
import { AuthGuard } from '../auth/auth.guard';

@Controller('word-book')
export class WordBookController {
  constructor(private readonly wordBookService: WordBookService) {}

  @Get()
  findAll(@Query() query: WordQuery) {
    return this.wordBookService.findAll(query);
  }

  @Get('mastered')
  @UseGuards(AuthGuard)
  getMastered(@Request() req) {
    return this.wordBookService.getMastered(req.user.id);
  }

  @Post('toggle-master/:wordId')
  @UseGuards(AuthGuard)
  toggleMaster(@Param('wordId') wordId: string, @Request() req) {
    return this.wordBookService.toggleMaster(wordId, req.user.id);
  }

  @Get('learn')
  @UseGuards(AuthGuard)
  getWordsForLearning(@Request() req, @Query('limit') limit: number = 10) {
    return this.wordBookService.getWordsForLearning(req.user.id, limit);
  }

  @Post('learn')
  @UseGuards(AuthGuard)
  markWordsAsLearned(@Request() req, @Body() body: { wordIds: string[] }) {
    return this.wordBookService.markWordsAsLearned(req.user.id, body.wordIds);
  }
}
