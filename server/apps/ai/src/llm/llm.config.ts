import { ChatDeepSeek } from '@langchain/deepseek';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { ConfigService } from '@nestjs/config';

function getEnv(configService: ConfigService | undefined, key: string, defaultValue: string): string {
  return configService?.get<string>(key) || process.env[key] || defaultValue;
}

export const createDeepSeek = (configService?: ConfigService) => {
  return new ChatDeepSeek({
    apiKey: getEnv(configService, 'DEEPSEEK_API_KEY', ''),
    model: getEnv(configService, 'DEEPSEEK_API_MODEL', 'deepseek-chat'),
    temperature: 1.3,
    maxTokens: 4396,
    streaming: true,
  });
};

export const createDeepSeekReasoner = (configService: ConfigService) => {
  return new ChatDeepSeek({
    apiKey: getEnv(configService, 'DEEPSEEK_API_KEY', ''),
    model: getEnv(configService, 'DEEPSEEK_REASONER_API_MODEL', 'deepseek-reasoner'),
    temperature: 1.3,
    maxTokens: 18000,
    streaming: true,
  });
};

export const createCheckpoint = async (configService?: ConfigService) => {
  const databaseUrl = getEnv(configService, 'DATABASE_URL', '');
  if (!databaseUrl) {
    console.warn('[LLM] DATABASE_URL not configured, checkpointer disabled');
    return null;
  }
  const checkpointer = PostgresSaver.fromConnString(databaseUrl);
  await checkpointer.setup();
  return checkpointer;
};

export const createBochaSearch = async (
  configService: ConfigService,
  query: string,
  count: number = 10,
) => {
  const apiKey = getEnv(configService, 'BOCHA_API_KEY', '');
  const searchUrl = getEnv(configService, 'BOCHA_SEARCH_URL', 'https://api.bochaai.com/v1/web-search');
  const result = await fetch(searchUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      count,
      summary: true,
    }),
  });
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
