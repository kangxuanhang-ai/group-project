import { ChatDeepSeek } from '@langchain/deepseek';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
// 修复：导入 ConfigService（NestJS 环境）
import { ConfigService } from '@nestjs/config';

// ===================== 配置常量 =====================
const DATABASE_URL = 'postgresql://postgres:root@localhost:5432/langchain';
const DEEPSEEK_API_KEY = 'sk-0f8bd14e14a24ab2affff4e2c641150e';
const DEEPSEEK_API_MODEL = 'deepseek-chat';
const DEEPSEEK_REASONER_API_MODEL = 'deepseek-reasoner';
const BOCHA_SEARCH_URL = 'https://api.bochaai.com/v1/web-search';
const BOCHA_API_KEY = 'sk-77d284097eff496db8c11ecc7ef22b90';

// ===================== 初始化 DeepSeek 普通模型 =====================
export const createDeepSeek = () => {
  return new ChatDeepSeek({
    apiKey: DEEPSEEK_API_KEY,
    model: DEEPSEEK_API_MODEL,
    temperature: 1.3,
    maxTokens: 4396,
    streaming: true,
  });
};

// ===================== 初始化 DeepSeek 深度思考模型 =====================
export const createDeepSeekReasoner = (configService: ConfigService) => {
  return new ChatDeepSeek({
    apiKey: configService.get<string>('DEEPSEEK_API_KEY') || DEEPSEEK_API_KEY,
    model:
      configService.get<string>('DEEPSEEK_REASONER_API_MODEL') ||
      DEEPSEEK_REASONER_API_MODEL,
    temperature: 1.3,
    maxTokens: 18000,
    streaming: true,
  });
};

// ===================== 初始化 PostgreSQL 对话记忆存储 =====================
export const createCheckpoint = async () => {
  const checkpointer = PostgresSaver.fromConnString(DATABASE_URL);
  // 自动创建 langgraph 所需的 checkpoint 表
  await checkpointer.setup();
  return checkpointer;
};

// ===================== 初始化博查搜索 API =====================
export const createBochaSearch = async (
  configService: ConfigService,
  query: string,
  count: number = 10,
) => {
  const result = await fetch(
    configService.get<string>('BOCHA_SEARCH_URL') || BOCHA_SEARCH_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${configService.get<string>('BOCHA_API_KEY') || BOCHA_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        count,
        summary: true,
      }),
    },
  );
  const { data } = await result.json();
  const values = data.webPages.value;
  const prompt = values
    .map(
      (item) => `
        标题: ${item.name}
        链接: ${item.url}
        摘要: ${item?.summary?.replace(/\n/g, '') ?? ''}
        网站名称: ${item.siteName}
        网站logo: ${item.siteIcon}
        发布时间: ${item.dateLastCrawled}
        `,
    )
    .join('\n');
  return prompt;
};
