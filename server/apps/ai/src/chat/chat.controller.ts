import { Controller, Get, Post, Body, Res,Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import type { ChatDto,ChatRoleType } from '@en/common/chat';
import type { Response } from 'express';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Post()
  async create(@Body() createChatDto: ChatDto, @Res() res: Response) {
    // 设置返回的格式 SSE 流式输出
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const stream = await this.chatService.streamCompletion(createChatDto);
    for await (const chunk of stream) {
      const [msg]=chunk
      res.write(`data: ${JSON.stringify({content:msg.content,role:'ai'})}\n\n`);
    }
    res.end();
   }

  @Get('history')
findAll(
  @Query('userId') userId: string,
  @Query('role') role: ChatRoleType
) {
  return this.chatService.findAll(userId, role);
}



}
