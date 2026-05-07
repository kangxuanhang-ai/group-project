import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ChatModule } from './chat/chat.module';
import { PromptModule } from './prompt/prompt.module';
import { SharedModule } from '@libs/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      // 👇 关键：从 ai.module.ts 往上找 3 层，定位到 server/.env
      envFilePath: '../../../.env',
      isGlobal: true,
    }),
    ChatModule,
    PromptModule,
    SharedModule,
  ],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}