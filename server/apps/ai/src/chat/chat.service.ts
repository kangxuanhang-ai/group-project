import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { createCheckpoint } from '../llm/llm.config';
import { ChatRoleType } from '@en/common/chat';
import { chatMode } from '../prompt/prompt.mode';
import { createAgent } from 'langchain';
import { createDeepSeek, createDeepSeekReasoner, createBochaSearch } from '../llm/llm.config';
import type { ChatDto } from '@en/common/chat';
import { ResponseService } from '@libs/shared';
import type { AIMessageChunk } from '@langchain/core/messages';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatService {
  constructor(private readonly responseService: ResponseService, private readonly configService: ConfigService) { }
  private checkpointer: PostgresSaver | null = null;
  private checkpointerInitPromise: Promise<void> | null = null;

  private async getCheckpointer(): Promise<PostgresSaver | null> {
    if (this.checkpointer) return this.checkpointer;
    if (!this.checkpointerInitPromise) {
      this.checkpointerInitPromise = (async () => {
        try {
          this.checkpointer = await createCheckpoint();
        } catch {
          console.warn('[ChatService] PostgreSQL not available, chat history will not be persisted');
          this.checkpointer = null;
        }
      })();
    }
    await this.checkpointerInitPromise;
    return this.checkpointer;
  }

  async streamCompletion(createChatDto: ChatDto) {
    const promptObject = chatMode.find(item => item.role === createChatDto.role)
    if (!promptObject) {
      throw new Error('模式不存在')
    }
    let prompt = promptObject.prompt
    if (createChatDto.webSearch) {
      const webSearchPrompt = await createBochaSearch(this.configService, createChatDto.content)
      prompt += `请根据以下搜索结果回答问题: ${webSearchPrompt}(并且返回你参考的网站名称), 用户问题: ${createChatDto.content}`
    }

    let model = createDeepSeek();
    if (createChatDto.deepThink) {
      model = createDeepSeekReasoner(this.configService);
    }

    const checkpointer = await this.getCheckpointer();
    const agent = createAgent({
      model: model,
      systemPrompt: prompt,
      checkpointer: checkpointer || undefined,
    });

    const id = `${createChatDto.userId}-${createChatDto.role}`;
    const stream = agent.stream(
      { messages: [{ role: 'human', content: createChatDto.content }] },
      { configurable: { thread_id: id }, streamMode: 'messages' }
    );

    return stream;
  }

  async findAll(userId: string, role: ChatRoleType) {
    const checkpointer = await this.getCheckpointer();
    if (!checkpointer) return this.responseService.success([])

    const messages = await checkpointer.get({
      configurable: { thread_id: `${userId}-${role}` }
    });
    const list = messages?.channel_values?.messages as AIMessageChunk[]
    if (!list) return this.responseService.success([])
    return this.responseService.success(list.map(item => ({
      role: item.type,
      content: item.content,
      reasoning: item.additional_kwargs?.reasoning_content,
    })));
  }
}
