import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '@libs/shared';
import { ResponseService } from '@libs/shared';
import { MinioService } from '@libs/shared/minio/minio.service';
import { ConfigService } from '@nestjs/config';
import type {UserUpdate} from '@en/common/user'
import type {Request} from 'express';
import {updateUserSelect} from './user.select';
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly minioService: MinioService,
    private readonly configService: ConfigService,
  ) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    const test = await this.prisma.user.findMany();
    return this.response.success(test);
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
  // 用户头像上传
  async uploadAvatar(file: Express.Multer.File) {
    if (!file) {
      return this.response.error(null,'文件不能为空');
    }
    if(file.size>1024*1024*5){
      return this.response.error(null,'文件大小不能超过5MB');
    }
    const client = this.minioService.getClient();
    const bucket = this.minioService.getBucket(); 

    if (!client) {
      return this.response.error(null, 'MinIO client not available');
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    await client.putObject(bucket, fileName, file.buffer, file.size, {
      "Content-Type": file.mimetype,
    });
    //返回文件url
    const isHttps=!!Number(this.configService.get('MINIO_USE_SSL'));
    const baseUrl = isHttps ? 'https' : 'http';
    const port = this.configService.get('MINIO_PORT')!;
    const databaseUrl=`/${bucket}/${fileName}`
    const previewUrl=`${baseUrl}://${this.configService.get('MINIO_ENDPOINT')}:${port}${databaseUrl}`
    return this.response.success({
      previewUrl,
      databaseUrl
    });
  }
  // 更新用户
  async updateUser(createUserDto: UserUpdate,user:Request['user']) {
    const updateUser =await this.prisma.user.update({
      where: {
        id: user.userId
      },
      data: {
        name: createUserDto.name,
        avatar: createUserDto.avatar,
        email: createUserDto.email,
        address: createUserDto.address,
        bio: createUserDto.bio,
        isTimingTask: createUserDto.isTimingTask,
        timingTaskTime: createUserDto.timingTaskTime,
      },
      select: updateUserSelect,
    });
    return this.response.success(updateUser);
  }
}
