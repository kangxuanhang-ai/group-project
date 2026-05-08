import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { createCheckpoint } from '../llm/llm.config';
import { ChatRoleType } from '@en/common/chat';
import { ReactAgent } from 'langchain';
import { chatMode } from '../prompt/prompt.mode';
import { createAgent } from 'langchain';
import { createDeepSeek, createDeepSeekReasoner, createBochaSearch } from '../llm/llm.config';
import type { ChatDto } from '@en/common/chat';
import { ResponseService } from '@libs/shared';
import type { AIMessageChunk } from '@langchain/core/messages';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class ChatService implements OnModuleInit {
  constructor(private readonly responseService: ResponseService, private readonly configService: ConfigService) { }
  private checkpointer!: PostgresSaver;
  private agents: Map<ChatRoleType, ReactAgent> = new Map();

  async onModuleInit() {
    // 1. 初始化这个 checkpoint
    this.checkpointer = await createCheckpoint(); // 幂等性

    // 2. 创建多个 Agent
    for (const mode of chatMode) {
      const agent = createAgent({
        model: createDeepSeek(), // 模型
        systemPrompt: mode.prompt, // 系统提示词
        checkpointer: this.checkpointer, // 检查点
      })
      this.agents.set(mode.role, agent) // 存入map
    }
  }

  async streamCompletion(createChatDto: ChatDto) {
    const promptObject = chatMode.find(item => item.role === createChatDto.role)
    if (!promptObject) {
      throw new Error('模式不存在')
    }
    //拿到基础提示词
    let prompt = promptObject.prompt
    //如果开启了联网搜索增强提示词
    if (createChatDto.webSearch) {
      const webSearchPrompt = await createBochaSearch(this.configService, createChatDto.content)
      prompt += `请根据以下搜索结果回答问题: ${webSearchPrompt}(并且返回你参考的网站名称), 用户问题: ${createChatDto.content}`
    }

    let model = createDeepSeek(); // 默认是对话模型
    if (createChatDto.deepThink) {
      model = createDeepSeekReasoner(this.configService); // 深度思考模型
    }

    const agent = createAgent({
      model: model,
      systemPrompt: prompt,
      checkpointer: this.checkpointer,
    });

    //2.组装消息格式
    const id = `${createChatDto.userId}-${createChatDto.role}`;
    const stream = agent.stream(
      { messages: [{ role: 'human', content: createChatDto.content }] },
      { configurable: { thread_id: id }, streamMode: 'messages' }
    );

    return stream;
  }



  async findAll(userId: string, role: ChatRoleType) {
    const messages = await this.checkpointer.get({
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