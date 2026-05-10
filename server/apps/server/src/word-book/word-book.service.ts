import { Injectable } from '@nestjs/common';
import type { WordQuery } from '@en/common/word';
import { ResponseService, PrismaService } from '@libs/shared';
import type { Prisma } from '@libs/shared/generated/prisma/client';

@Injectable()
export class WordBookService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
  ) { }

  private toBoolean(value: string | boolean): boolean | undefined {
    return value === 'true' ? true : undefined;
  }

  async findAll(query: WordQuery) {
    const { page = 1, pageSize = 12, word, ...rest } = query;
    const tags = Object.fromEntries(Object.entries(rest).map(([key, value]) => [key, this.toBoolean(value)]));
    const where: Prisma.WordBookWhereInput = {
      word: word ? { contains: word } : undefined,
      ...tags,
    };
    const [total = 0, list = []] = await Promise.all([
      this.prismaService.wordBook.count({ where }),
      this.prismaService.wordBook.findMany({
        where,
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
        orderBy: {
          frq: 'desc',
        },
      }),
    ]);
    return this.responseService.success({ total, list });
  }

  async getMastered(userId: string) {
    const records = await this.prismaService.wordBookRecord.findMany({
      where: { userId, isMaster: true },
      select: { wordId: true },
    })
    return this.responseService.success(records.map(r => r.wordId))
  }

  async toggleMaster(wordId: string, userId: string) {
    const existing = await this.prismaService.wordBookRecord.findUnique({
      where: { userId_wordId: { userId, wordId } },
    })
    const newIsMaster = existing ? !existing.isMaster : true

    await this.prismaService.wordBookRecord.upsert({
      where: { userId_wordId: { userId, wordId } },
      create: { userId, wordId, isMaster: newIsMaster },
      update: { isMaster: newIsMaster },
    })

    const count = await this.prismaService.wordBookRecord.count({
      where: { userId, isMaster: true },
    })
    await this.prismaService.user.update({
      where: { id: userId },
      data: { wordNumber: count },
    })

    return this.responseService.success({ isMaster: newIsMaster, wordNumber: count })
  }

  async getWordsForLearning(userId: string, limit: number = 10) {
    const learnedWordIds = await this.prismaService.wordBookRecord
      .findMany({
        where: { userId },
        select: { wordId: true },
      })
      .then(records => records.map(r => r.wordId));

    const words = await this.prismaService.wordBook.findMany({
      where: {
        id: { notIn: learnedWordIds },
        gk: true,
      },
      take: limit,
      orderBy: { frq: 'desc' },
    });

    return this.responseService.success(words);
  }

  async markWordsAsLearned(userId: string, wordIds: string[]) {
    try {
      console.log('markWordsAsLearned called with userId:', userId);
      console.log('markWordsAsLearned called with wordIds:', wordIds);
      
      const records = wordIds.map(wordId => ({
        userId,
        wordId,
        isMaster: false,
      }));

      console.log('Creating records:', records);
      
      await this.prismaService.wordBookRecord.createMany({
        data: records,
        skipDuplicates: true,
      });

      console.log('Records created successfully');

      await this.prismaService.user.update({
        where: { id: userId },
        data: { wordNumber: { increment: wordIds.length } },
      });

      console.log('User updated successfully');

      return this.responseService.success('标记成功');
    } catch (error) {
      console.error('markWordsAsLearned error:', error);
      return this.responseService.error(null, '标记失败: ' + (error as Error).message, 500);
    }
  }
}
