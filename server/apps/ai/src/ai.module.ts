import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ChatModule } from './chat/chat.module';
import { PromptModule } from './prompt/prompt.module';

@Module({
  imports: [ChatModule, PromptModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
