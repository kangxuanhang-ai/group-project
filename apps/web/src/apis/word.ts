import { serverApi, type Response } from './index';

export interface Word {
  id: string;
  word: string;
  phonetic?: string;
  definition?: string;
  translation?: string;
}

export const getWordsForLearning = async (limit: number = 10): Promise<Response<Word[]>> => {
  console.log('Calling GET /word-book/learn?limit=' + limit);
  const res = await serverApi.get(`/word-book/learn?limit=${limit}`);
  console.log('Response:', res);
  return res;
};

export const markWordsAsLearned = async (wordIds: string[]): Promise<Response<string>> => {
  console.log('Calling POST /word-book/learn with wordIds:', wordIds);
  const res = await serverApi.post('/word-book/learn', { wordIds });
  console.log('Response:', res);
  return res;
};
