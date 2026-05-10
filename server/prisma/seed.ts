import * as Minio from 'minio'
import dotenv from 'dotenv'
import { PrismaClient } from '../libs/shared/src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import fs from 'node:fs'

dotenv.config({ path: new URL('../.env', import.meta.url).pathname })

const wordData = [
    { word: 'dream', definition: 'n. a series of mental images and emotions occurring during sleep; imaginative thoughts indulged in while awake; a cherished aspiration, ambition, or ideal', translation: 'n. 梦，梦想，理想', gk: true },
    { word: 'shoulder', definition: 'n. the part of the body between the neck and upper arm; a cut of meat from this part; a burden or responsibility', translation: 'n. 肩，肩膀；负担，责任', gk: true },
    { word: 'basket', definition: 'n. a container typically made of woven strips of wood or plastic; the amount held by a basket', translation: 'n. 篮子，筐', gk: true },
    { word: 'kitchen', definition: 'n. a room or area where food is prepared and cooked', translation: 'n. 厨房', gk: true },
    { word: 'garden', definition: 'n. a plot of ground where plants, flowers, or vegetables are cultivated; a yard or park', translation: 'n. 花园，菜园，公园', gk: true },
    { word: 'school', definition: 'n. an institution for educating children; a place of learning; a group of people sharing similar principles', translation: 'n. 学校，学院；学派', gk: true },
    { word: 'library', definition: 'n. a building or room containing collections of books, periodicals, and sometimes films and recorded music for use or borrowing by the public', translation: 'n. 图书馆，藏书室', gk: true },
    { word: 'bedroom', definition: 'n. a room for sleeping in', translation: 'n. 卧室', gk: true },
    { word: 'window', definition: 'n. an opening in the wall or roof of a building or vehicle that is fitted with glass or other transparent material in a frame to admit light or air and allow people to see out', translation: 'n. 窗户，窗口', gk: true },
    { word: 'drawer', definition: 'n. a sliding boxlike container in a piece of furniture; a person who draws', translation: 'n. 抽屉；画家', gk: true },
    { word: 'table', definition: 'n. a piece of furniture with a flat top and one or more legs, providing a level surface for eating, writing, or working at', translation: 'n. 桌子，表格', gk: true },
    { word: 'chair', definition: 'n. a seat with a back and four legs, for one person', translation: 'n. 椅子', gk: true },
    { word: 'book', definition: 'n. a written or printed work consisting of pages glued or sewn together along one side and bound in covers', translation: 'n. 书，书籍', gk: true },
    { word: 'door', definition: 'n. a hinged or sliding barrier closing an opening in a wall, fence, or vehicle', translation: 'n. 门', gk: true },
    { word: 'house', definition: 'n. a building for human habitation, especially one that is lived in by a family or small group of people', translation: 'n. 房子，住宅', gk: true },
    { word: 'tree', definition: 'n. a woody perennial plant, typically having a single stem or trunk growing to a considerable height and bearing lateral branches at some distance from the ground', translation: 'n. 树，树木', gk: true },
    { word: 'flower', definition: 'n. the seed-bearing part of a plant, consisting of reproductive organs (stamens and carpels) surrounded by brightly colored petals and sepals', translation: 'n. 花，花卉', gk: true },
    { word: 'water', definition: 'n. a colorless, transparent, odorless liquid that forms the seas, lakes, rivers, and rain and is the basis of the fluids of living organisms', translation: 'n. 水', gk: true },
    { word: 'food', definition: 'n. any nutritious substance that people or animals eat or drink, or that plants absorb, in order to maintain life and growth', translation: 'n. 食物，食品', gk: true },
    { word: 'friend', definition: 'n. a person whom one knows and with whom one has a bond of mutual affection, typically exclusive of sexual or family relations', translation: 'n. 朋友', gk: true },
]

const data = [
    {
        name: '高考单词',
        value: 'gk',
        description: '覆盖高考大纲核心词汇，按考频与题型分类，助力考前冲刺提分。',
        teacher: '小余同学',
        url: '',
        price: 100,
    },
    {
        name: '中考单词',
        value: 'zk',
        description: '紧扣中考考纲，初中三年词汇一站式掌握，打好英语基础。',
        teacher: '小满zs',
        url: '',
        price: 35,
    },
    {
        name: 'GRE单词',
        value: 'gre',
        description: 'GRE 核心词汇与同反义词拓展，适合留学备考与高阶阅读。',
        teacher: '初心哥',
        url: '',
        price: 80,
    },
    {
        name: '托福词汇',
        value: 'toefl',
        description: '托福听说读写高频词 + 学术场景词汇，提升备考效率。',
        teacher: '枫竹',
        url: '',
        price: 80000,
    },
    {
        name: '雅思词汇',
        value: 'ielts',
        description: '雅思考试常考词汇与同义替换，兼顾移民与留学需求。',
        teacher: 'ouka',
        url: '',
        price: 7000,
    },
    {
        name: '大学英语六级单词',
        value: 'cet6',
        description: '六级大纲词汇与真题高频词，配合阅读与写作场景记忆。',
        teacher: '章政',
        url: '',
        price: 5,
    },
    {
        name: '大学英语四级单词',
        value: 'cet4',
        description: '四级核心词汇与考点搭配，适合在校生系统备考。',
        teacher: '小余同学',
        url: '',
        price: 8,
    },
    {
        name: '考研单词',
        value: 'ky',
        description: '考研英语一/二通用词汇，结合真题与长难句场景记忆。',
        teacher: '远方',
        url: '',
        price: 9.99,
    }
]

const minioConfig = {
    endpoint: process.env.MINIO_ENDPOINT,
    port: Number(process.env.MINIO_PORT),
    useSSL: !!Number(process.env.MINIO_USE_SSL),
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
}

const useMinio = Boolean(
    minioConfig.endpoint &&
    minioConfig.port &&
    minioConfig.accessKey &&
    minioConfig.secretKey
)

async function main() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not set in server/.env')
    }

    const prisma = new PrismaClient({
        adapter: new PrismaPg({
            connectionString: process.env.DATABASE_URL,
        })
    })
    await prisma.$connect()

    let minio: Minio.Client | null = null
    const bucket = 'course'

    if (useMinio) {
        try {
            minio = new Minio.Client({
                endPoint: minioConfig.endpoint!,
                port: minioConfig.port,
                useSSL: minioConfig.useSSL,
                accessKey: minioConfig.accessKey!,
                secretKey: minioConfig.secretKey!,
            })

            const exists = await minio.bucketExists(bucket)
            if (!exists) {
                await minio.makeBucket(bucket)
                await minio.setBucketPolicy(bucket, JSON.stringify({
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Sid: 'CourseReadObjects',
                            Effect: 'Allow',
                            Principal: '*',
                            Action: ['s3:GetObject'],
                            Resource: ['arn:aws:s3:::course/*'],
                        }
                    ]
                }))
            }
        } catch (error) {
            console.warn('MinIO not available, skipping file upload. Error:', error)
            minio = null
        }
    } else {
        console.warn('MinIO config incomplete or missing, skipping bucket creation and file upload.')
    }

    for (const item of data) {
        let url = item.url

        if (minio) {
            const filePath = new URL(`./prisma/assets/${item.value}.png`, import.meta.url)
            if (fs.existsSync(filePath)) {
                const file = fs.readFileSync(filePath)
                await minio.putObject(bucket, `${item.value}.png`, file, file.length, {
                    'Content-Type': 'image/png',
                })
                url = `/course/${item.value}.png`
                console.log(`${item.value}.png 上传成功`)
            } else {
                console.warn(`资源文件缺失: ${filePath}`)
            }
        }

        await prisma.course.create({
            data: {
                name: item.name,
                value: item.value,
                description: item.description,
                teacher: item.teacher,
                url,
                price: item.price,
            }
        })
    }

    for (const wordItem of wordData) {
        await prisma.wordBook.create({
            data: {
                word: wordItem.word,
                definition: wordItem.definition,
                translation: wordItem.translation,
                gk: wordItem.gk,
            }
        })
    }
    console.log('单词数据插入成功')

    await prisma.$disconnect()
}

main().catch(error => {
    console.error(error)
    process.exit(1)
})