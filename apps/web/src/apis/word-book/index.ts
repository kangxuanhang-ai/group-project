import { serverApi,type Response } from "..";
import type { WordQuery,WordList } from "@en/common/word";
export const getWordBookList = (params: WordQuery): Promise<Response<WordList>> => {
    return serverApi.get('/word-book', { params }) as Promise<Response<WordList>>
}

export const getMasteredWords = (): Promise<Response<string[]>> => {
    return serverApi.get('/word-book/mastered') as Promise<Response<string[]>>
}

export const toggleMasterWord = (wordId: string): Promise<Response<{ isMaster: boolean; wordNumber: number }>> => {
    return serverApi.post(`/word-book/toggle-master/${wordId}`) as Promise<Response<{ isMaster: boolean; wordNumber: number }>>
}