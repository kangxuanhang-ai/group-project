import { ChatDeepSeek } from '@langchain/deepseek';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

const DATABASE_URL = 'postgresql://postgres:root@localhost:5432/langchain';
const DEEPSEEK_API_KEY = 'sk-618ccd021cfc41e89ea5422db6533da6';
const DEEPSEEK_API_MODEL = 'deepseek-chat';

// 初始化 DeepSeek 模型
export const createDeepSeek = () => {
  return new ChatDeepSeek({
    apiKey: DEEPSEEK_API_KEY,
    model: DEEPSEEK_API_MODEL,
    temperature: 1.3,
    maxTokens: 4396,
    streaming: true,
  });
};

// 初始化 PostgreSQL 建表
export const createCheckpoint = async () => {
  const checkpointer = PostgresSaver.fromConnString(DATABASE_URL);
  await checkpointer.setup();
  return checkpointer;
};
