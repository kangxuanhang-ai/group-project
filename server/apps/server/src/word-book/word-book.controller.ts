import { Controller, Get, Post, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WordBookService } from './word-book.service';
import type { WordQuery } from '@en/common/word';
import type { Request } from 'express';

@Controller('word-book')
export class WordBookController {
  constructor(private readonly wordBookService: WordBookService) {}

  @Get()
  findAll(@Query() query: WordQuery) {
    return this.wordBookService.findAll(query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mastered')
  getMastered(@Req() req: Request) {
    return this.wordBookService.getMastered(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('toggle-master/:wordId')
  toggleMaster(@Param('wordId') wordId: string, @Req() req: Request) {
    return this.wordBookService.toggleMaster(wordId, req.user.userId);
  }
}
